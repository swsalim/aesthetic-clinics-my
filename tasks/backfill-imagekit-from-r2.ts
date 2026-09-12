/**
 * Backfill existing R2 media into the new ImageKit account.
 * Populates image_url/image + imagekit_file_id only — never clears r2_* columns.
 *
 * Safe to re-run: only rows with r2_key set whose ImageKit URL is missing the
 * current NEXT_PUBLIC_IMAGEKIT_ID (or imagekit_file_id is null) are processed.
 * Uses keyset pagination (id > lastSeen) so skipped rows do not loop forever.
 *
 * Usage:
 *   npm run backfill-imagekit
 *   npm run backfill-imagekit -- --execute
 *   npm run backfill-imagekit:sample          # --execute --limit=20 --table=clinic_images
 *   npm run backfill-imagekit -- --execute --batch-size=25
 *   npm run backfill-imagekit -- --execute --limit=100
 *   npm run backfill-imagekit -- --execute --table=clinic_images
 *
 * Flags:
 *   --execute              Write to ImageKit + DB (default is dry-run)
 *   --sample               Shortcut: execute first 20 pending clinic_images
 *   --batch-size=N         Rows per DB page (default 50)
 *   --limit=N              Max rows this run across all tables (optional)
 *   --table=NAME           Only this table
 *   --delay-ms=N           Pause between batches (default 50)
 *   --concurrency=N        Parallel uploads per batch (default 8)
 *
 * Requires: IMAGEKIT_PRIVATE_KEY, NEXT_PUBLIC_IMAGEKIT_ID,
 *           NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import path from 'path';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

function parseArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const eq = process.argv.find((arg) => arg.startsWith(prefix));
  if (eq) return eq.slice(prefix.length);

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
const DELAY_MS = Math.max(0, Number(parseArg('delay-ms') || 50));
const CONCURRENCY = Math.max(1, Number(parseArg('concurrency') || 8));

const IMAGEKIT_ID = process.env.NEXT_PUBLIC_IMAGEKIT_ID || '';
const FOLDER_ROOT = process.env.NEXT_PUBLIC_IMAGEKIT_FOLDER_ROOT || 'aesthetic-clinics-my';

type TableName = 'clinic_images' | 'clinic_doctor_images' | 'areas' | 'states';

const TABLES: Array<{
  table: TableName;
  folder: string;
  urlColumn: 'image_url' | 'image';
}> = [
  { table: 'clinic_images', folder: `${FOLDER_ROOT}/places`, urlColumn: 'image_url' },
  { table: 'clinic_doctor_images', folder: `${FOLDER_ROOT}/persons`, urlColumn: 'image_url' },
  { table: 'areas', folder: `${FOLDER_ROOT}/location`, urlColumn: 'image' },
  { table: 'states', folder: `${FOLDER_ROOT}/location`, urlColumn: 'image' },
];

function getAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  }
  return createClient(url, key);
}

function getImageKitAuth(): string {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey || !privateKey.startsWith('private_')) {
    throw new Error('IMAGEKIT_PRIVATE_KEY must be set and start with private_');
  }
  return Buffer.from(`${privateKey}:`).toString('base64');
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function needsImageKitBackfill(row: Record<string, unknown>, urlColumn: 'image_url' | 'image'): boolean {
  if (!row.r2_key || !row.r2_url) return false;
  if (!IMAGEKIT_ID) return true;
  if (!row.imagekit_file_id) return true;
  const url = (row[urlColumn] as string) || '';
  return !url.includes(`ik.imagekit.io/${IMAGEKIT_ID}`);
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

function guessFileName(url: string, contentType: string, id: string): string {
  try {
    const pathname = new URL(url).pathname;
    const base = pathname.split('/').pop();
    if (base && base.includes('.')) return base;
  } catch {
    /* ignore */
  }
  if (contentType.includes('png')) return `${id}.png`;
  if (contentType.includes('webp')) return `${id}.webp`;
  if (contentType.includes('gif')) return `${id}.gif`;
  return `${id}.jpg`;
}

async function uploadToImageKit(params: {
  buffer: Buffer;
  contentType: string;
  fileName: string;
  folder: string;
  auth: string;
}): Promise<{ url: string; fileId: string } | null> {
  const formData = new FormData();
  const blob = new Blob([new Uint8Array(params.buffer)], { type: params.contentType });
  formData.append('file', blob, params.fileName);
  formData.append('fileName', params.fileName);
  formData.append('folder', params.folder);
  formData.append('useUniqueFileName', 'true');

  const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
    method: 'POST',
    headers: { Authorization: `Basic ${params.auth}` },
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    console.warn(`  ImageKit upload failed ${response.status}: ${text}`);
    return null;
  }

  const result = (await response.json()) as { url?: string; fileId?: string };
  if (!result.url || !result.fileId) {
    console.warn('  ImageKit upload missing url/fileId');
    return null;
  }
  return { url: result.url, fileId: result.fileId };
}

async function countPending(supabase: SupabaseClient, table: TableName): Promise<number> {
  // Approximate upper bound (rows with R2). Exact pending filtered in processRow.
  const { count, error } = await supabase
    .from(table)
    .select('id', { count: 'exact', head: true })
    .not('r2_key', 'is', null);

  if (error) {
    throw new Error(`Failed to count ${table}: ${error.message}`);
  }
  return count ?? 0;
}

async function fetchBatch(
  supabase: SupabaseClient,
  table: TableName,
  batchSize: number,
  afterId: string | null,
): Promise<Record<string, unknown>[]> {
  let query = supabase
    .from(table)
    .select('*')
    .not('r2_key', 'is', null)
    .order('id', { ascending: true })
    .limit(batchSize);

  if (afterId) {
    query = query.gt('id', afterId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load ${table}: ${error.message}`);
  }
  return (data || []) as Record<string, unknown>[];
}

async function processRow(
  supabase: SupabaseClient,
  table: TableName,
  folder: string,
  urlColumn: 'image_url' | 'image',
  row: Record<string, unknown>,
  auth: string,
): Promise<'ok' | 'skip' | 'fail'> {
  const id = row.id as string;

  if (!needsImageKitBackfill(row, urlColumn)) {
    return 'skip';
  }

  const source = row.r2_url as string | null;
  if (!source) {
    console.log(`  skip ${id}: no r2_url`);
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

  const fileName = guessFileName(source, downloaded.contentType, id);
  const uploaded = await uploadToImageKit({
    buffer: downloaded.buffer,
    contentType: downloaded.contentType,
    fileName,
    folder,
    auth,
  });

  if (!uploaded) {
    return 'fail';
  }

  const { error: updateError } = await supabase
    .from(table)
    .update({
      [urlColumn]: uploaded.url,
      imagekit_file_id: uploaded.fileId,
    })
    .eq('id', id);

  if (updateError) {
    console.error(`  update failed ${id}:`, updateError.message);
    return 'fail';
  }

  return 'ok';
}

async function backfillTable(
  supabase: SupabaseClient,
  params: (typeof TABLES)[number],
  auth: string,
  budget: { remaining: number | null },
): Promise<{ ok: number; skip: number; fail: number; processed: number }> {
  const pending = await countPending(supabase, params.table);
  console.log(`\n[${params.table}] ${pending} rows with r2_key → ${params.folder}`);

  let ok = 0;
  let skip = 0;
  let fail = 0;
  let processed = 0;
  let batchNum = 0;
  let afterId: string | null = null;

  while (true) {
    if (budget.remaining !== null && budget.remaining <= 0) {
      console.log(`[${params.table}] hit --limit, stopping this table`);
      break;
    }

    const take =
      budget.remaining !== null ? Math.min(BATCH_SIZE, budget.remaining) : BATCH_SIZE;
    // Fetch a page of r2 rows; may include already-done (skipped in processRow).
    // Over-fetch a bit so we still make progress when many are already done.
    const rows = await fetchBatch(supabase, params.table, Math.max(take * 3, BATCH_SIZE), afterId);

    if (rows.length === 0) {
      break;
    }

    batchNum++;
    console.log(`[${params.table}] batch ${batchNum} (${rows.length} rows scanned)`);

    const pendingRows: Record<string, unknown>[] = [];
    for (const row of rows) {
      if (budget.remaining !== null && budget.remaining - pendingRows.length <= 0) {
        break;
      }
      if (!needsImageKitBackfill(row, params.urlColumn)) {
        skip++;
        continue;
      }
      pendingRows.push(row);
      if (pendingRows.length >= take) {
        break;
      }
    }

    for (let i = 0; i < pendingRows.length; i += CONCURRENCY) {
      const chunk = pendingRows.slice(i, i + CONCURRENCY);
      const results = await Promise.all(
        chunk.map((row) =>
          processRow(supabase, params.table, params.folder, params.urlColumn, row, auth),
        ),
      );

      for (const result of results) {
        if (result === 'ok') ok++;
        else if (result === 'skip') skip++;
        else fail++;
        processed++;
        if (budget.remaining !== null) {
          budget.remaining--;
        }
      }
    }

    // Advance past the last pending row we acted on — not the end of the scan
    // window — otherwise over-fetch skips unprocessed pending rows in between.
    if (pendingRows.length > 0) {
      afterId = pendingRows[pendingRows.length - 1].id as string;
    } else {
      afterId = rows[rows.length - 1].id as string;
    }

    if (rows.length < Math.max(take * 3, BATCH_SIZE) && pendingRows.length === 0) {
      break;
    }

    // If the scan window was fully pending and we processed a take-sized chunk,
    // keep going (do not treat short remaining window as done).
    if (rows.length < Math.max(take * 3, BATCH_SIZE) && pendingRows.length < take) {
      break;
    }

    if (DELAY_MS > 0 && EXECUTE) {
      await sleep(DELAY_MS);
    }

    if (!EXECUTE) {
      break;
    }
  }

  console.log(`[${params.table}] ok=${ok} skip=${skip} fail=${fail} processed=${processed}`);
  return { ok, skip, fail, processed };
}

async function main() {
  if (!IMAGEKIT_ID) {
    throw new Error('NEXT_PUBLIC_IMAGEKIT_ID is required');
  }

  console.log(EXECUTE ? 'EXECUTE mode — writing to ImageKit + DB' : 'DRY-RUN — no writes');
  if (SAMPLE) {
    console.log('SAMPLE mode — first 20 pending clinic_images only');
  }
  console.log(`ImageKit id=${IMAGEKIT_ID} folder-root=${FOLDER_ROOT}`);
  console.log(
    `batch-size=${BATCH_SIZE} concurrency=${CONCURRENCY} delay-ms=${DELAY_MS}` +
      (LIMIT ? ` limit=${LIMIT}` : '') +
      (TABLE_FILTER ? ` table=${TABLE_FILTER}` : ''),
  );
  console.log('Resume-safe: rows with new ImageKit URL + file id are skipped.');
  console.log('r2_key / r2_url are never cleared.');

  if (TABLE_FILTER && !TABLES.some((t) => t.table === TABLE_FILTER)) {
    throw new Error(
      `Unknown --table=${TABLE_FILTER}. Use: clinic_images | clinic_doctor_images | areas | states`,
    );
  }

  const auth = getImageKitAuth();
  const supabase = getAdmin();
  const budget = { remaining: LIMIT };
  const selected = TABLES.filter((t) => !TABLE_FILTER || t.table === TABLE_FILTER);

  let totalOk = 0;
  let totalSkip = 0;
  let totalFail = 0;

  for (const table of selected) {
    const stats = await backfillTable(supabase, table, auth, budget);
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
