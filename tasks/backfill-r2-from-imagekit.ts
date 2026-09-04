/**
 * Backfill existing ImageKit/Cloudinary media into Cloudflare R2.
 * Populates r2_key + r2_url only — never clears ImageKit columns.
 *
 * Safe to re-run: only rows with r2_key IS NULL are processed, so a mid-run
 * stop can continue by running the same command again.
 *
 * Usage:
 *   npm run backfill-r2
 *   npm run backfill-r2 -- --execute
 *   npm run backfill-r2:sample          # --execute --limit=20 --table=clinic_images
 *   npm run backfill-r2 -- --execute --batch-size=25
 *   npm run backfill-r2 -- --execute --limit=100
 *   npm run backfill-r2 -- --execute --table=clinic_images
 *
 * Flags:
 *   --execute              Write to R2 + DB (default is dry-run)
 *   --sample               Shortcut: execute first 20 pending clinic_images (for smoke test)
 *   --batch-size=N         Rows per DB page / progress chunk (default 50)
 *   --limit=N              Max rows to process this run across all tables (optional)
 *   --table=NAME           Only this table (clinic_images | clinic_doctor_images | areas | states)
 *   --delay-ms=N           Pause between batches (default 200)
 *
 * Requires: R2_* env, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import path from 'path';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

import { buildR2ObjectKey, type R2Folder, uploadBufferToR2 } from '../lib/r2';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

function parseArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const eq = process.argv.find((arg) => arg.startsWith(prefix));
  if (eq) return eq.slice(prefix.length);

  // Support `--limit 20` (space-separated)
  const flag = `--${name}`;
  const idx = process.argv.indexOf(flag);
  if (idx !== -1 && process.argv[idx + 1] && !process.argv[idx + 1].startsWith('--')) {
    return process.argv[idx + 1];
  }
  return undefined;
}

const SAMPLE = process.argv.includes('--sample');
const EXECUTE = process.argv.includes('--execute') || SAMPLE;
const BATCH_SIZE = Math.max(1, Number(parseArg('batch-size') || (SAMPLE ? 20 : 50)));
const LIMIT = SAMPLE
  ? 20
  : parseArg('limit')
    ? Math.max(1, Number(parseArg('limit')))
    : null;
const TABLE_FILTER = SAMPLE ? 'clinic_images' : parseArg('table') || null;
const DELAY_MS = Math.max(0, Number(parseArg('delay-ms') || 200));

type TableName = 'clinic_images' | 'clinic_doctor_images' | 'areas' | 'states';

const TABLES: Array<{
  table: TableName;
  folder: R2Folder;
  sourceUrl: (row: Record<string, unknown>) => string | null;
}> = [
  {
    table: 'clinic_images',
    folder: 'places',
    sourceUrl: (row) =>
      (row.image_url as string) || (row.original_cloudinary_url as string) || null,
  },
  {
    table: 'clinic_doctor_images',
    folder: 'persons',
    sourceUrl: (row) =>
      (row.image_url as string) || (row.original_cloudinary_url as string) || null,
  },
  {
    table: 'areas',
    folder: 'location',
    sourceUrl: (row) =>
      (row.image as string) ||
      (row.thumbnail_image as string) ||
      (row.banner_image as string) ||
      null,
  },
  {
    table: 'states',
    folder: 'location',
    sourceUrl: (row) =>
      (row.image as string) ||
      (row.thumbnail_image as string) ||
      (row.banner_image as string) ||
      null,
  },
];

function getAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  }
  return createClient(url, key);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function downloadUrl(url: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`  download failed ${res.status}: ${url}`);
      return null;
    }
    const contentType = res.headers.get('content-type') || 'application/octet-stream';
    const buffer = Buffer.from(await res.arrayBuffer());
    return { buffer, contentType };
  } catch (error) {
    console.warn(`  download error for ${url}:`, error);
    return null;
  }
}

function guessFileName(url: string, contentType: string): string {
  try {
    const pathname = new URL(url).pathname;
    const base = pathname.split('/').pop();
    if (base && base.includes('.')) return base;
  } catch {
    /* ignore */
  }
  if (contentType.includes('png')) return 'image.png';
  if (contentType.includes('webp')) return 'image.webp';
  if (contentType.includes('gif')) return 'image.gif';
  return 'image.jpg';
}

async function countPending(supabase: SupabaseClient, table: TableName): Promise<number> {
  const { count, error } = await supabase
    .from(table)
    .select('id', { count: 'exact', head: true })
    .is('r2_key', null);

  if (error) {
    throw new Error(`Failed to count ${table}: ${error.message}`);
  }
  return count ?? 0;
}

async function fetchBatch(
  supabase: SupabaseClient,
  table: TableName,
  batchSize: number,
): Promise<Record<string, unknown>[]> {
  // Always start at 0: completed rows drop out of r2_key IS NULL, so the next
  // page of pending work is always the new head of the filtered set.
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .is('r2_key', null)
    .order('id', { ascending: true })
    .range(0, batchSize - 1);

  if (error) {
    throw new Error(`Failed to load ${table}: ${error.message}`);
  }
  return (data || []) as Record<string, unknown>[];
}

async function processRow(
  supabase: SupabaseClient,
  table: TableName,
  folder: R2Folder,
  sourceUrl: (row: Record<string, unknown>) => string | null,
  row: Record<string, unknown>,
): Promise<'ok' | 'skip' | 'fail'> {
  const id = row.id as string;
  const source = sourceUrl(row);
  if (!source) {
    console.log(`  skip ${id}: no source URL`);
    return 'skip';
  }

  console.log(`  ${EXECUTE ? 'upload' : 'dry-run'} ${id} <- ${source.slice(0, 80)}...`);

  if (!EXECUTE) {
    return 'ok';
  }

  const downloaded = await downloadUrl(source);
  if (!downloaded) {
    return 'fail';
  }

  const fileName = guessFileName(source, downloaded.contentType);
  const key = buildR2ObjectKey(folder, fileName, downloaded.contentType);

  try {
    const uploaded = await uploadBufferToR2({
      key,
      body: downloaded.buffer,
      contentType: downloaded.contentType,
    });

    const { error: updateError } = await supabase
      .from(table)
      .update({ r2_key: uploaded.r2_key, r2_url: uploaded.r2_url })
      .eq('id', id);

    if (updateError) {
      console.error(`  update failed ${id}:`, updateError.message);
      return 'fail';
    }
    return 'ok';
  } catch (err) {
    console.error(`  upload failed ${id}:`, err);
    return 'fail';
  }
}

async function backfillTable(
  supabase: SupabaseClient,
  params: (typeof TABLES)[number],
  budget: { remaining: number | null },
): Promise<{ ok: number; skip: number; fail: number; processed: number }> {
  const pending = await countPending(supabase, params.table);
  console.log(`\n[${params.table}] ${pending} rows missing r2_key`);

  let ok = 0;
  let skip = 0;
  let fail = 0;
  let processed = 0;
  let batchNum = 0;

  while (true) {
    if (budget.remaining !== null && budget.remaining <= 0) {
      console.log(`[${params.table}] hit --limit, stopping this table`);
      break;
    }

    const take =
      budget.remaining !== null ? Math.min(BATCH_SIZE, budget.remaining) : BATCH_SIZE;
    const rows = await fetchBatch(supabase, params.table, take);

    if (rows.length === 0) {
      break;
    }

    batchNum++;
    console.log(`[${params.table}] batch ${batchNum} (${rows.length} rows)`);

    for (const row of rows) {
      if (budget.remaining !== null && budget.remaining <= 0) {
        break;
      }

      const result = await processRow(
        supabase,
        params.table,
        params.folder,
        params.sourceUrl,
        row,
      );

      if (result === 'ok') ok++;
      else if (result === 'skip') skip++;
      else fail++;

      processed++;
      if (budget.remaining !== null) {
        budget.remaining--;
      }
    }

    if (rows.length < take) {
      break;
    }

    if (DELAY_MS > 0 && EXECUTE) {
      await sleep(DELAY_MS);
    }

    // Dry-run would loop forever on the same pending head; stop after one pass.
    if (!EXECUTE) {
      break;
    }
  }

  console.log(`[${params.table}] ok=${ok} skip=${skip} fail=${fail} processed=${processed}`);
  return { ok, skip, fail, processed };
}

async function main() {
  console.log(EXECUTE ? 'EXECUTE mode — writing to R2 + DB' : 'DRY-RUN — no writes');
  if (SAMPLE) {
    console.log('SAMPLE mode — first 20 pending clinic_images only');
  }
  console.log(
    `batch-size=${BATCH_SIZE} delay-ms=${DELAY_MS}` +
      (LIMIT ? ` limit=${LIMIT}` : '') +
      (TABLE_FILTER ? ` table=${TABLE_FILTER}` : ''),
  );
  console.log('Resume-safe: only rows with r2_key IS NULL are selected.');

  if (TABLE_FILTER && !TABLES.some((t) => t.table === TABLE_FILTER)) {
    throw new Error(
      `Unknown --table=${TABLE_FILTER}. Use: clinic_images | clinic_doctor_images | areas | states`,
    );
  }

  const supabase = getAdmin();
  const budget = { remaining: LIMIT };
  const selected = TABLES.filter((t) => !TABLE_FILTER || t.table === TABLE_FILTER);

  let totalOk = 0;
  let totalSkip = 0;
  let totalFail = 0;

  for (const table of selected) {
    const stats = await backfillTable(supabase, table, budget);
    totalOk += stats.ok;
    totalSkip += stats.skip;
    totalFail += stats.fail;
  }

  console.log(`\nTotals: ok=${totalOk} skip=${totalSkip} fail=${totalFail}`);
  console.log('Done.');
  if (!EXECUTE) {
    console.log('Re-run with --execute to perform uploads. Interrupted runs can resume safely.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
