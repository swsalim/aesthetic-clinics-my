/**
 * Delete R2 assets that have already been restored to ImageKit.
 * Dry-run by default.
 *
 * After a successful R2 delete (or missing object), nulls `r2_key` + `r2_url`
 * so re-runs are resume-safe. Does not clear ImageKit columns.
 *
 * Only processes rows that have BOTH r2_key and imagekit_file_id (ImageKit
 * restore succeeded).
 *
 * Usage:
 *   npm run delete-r2-assets
 *   npm run delete-r2-assets -- --execute
 *   npm run delete-r2-assets -- --execute --batch-size=50
 *
 * Requires: R2_* env, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import path from 'path';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

import { deleteR2Object } from '../lib/r2';

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

const EXECUTE = process.argv.includes('--execute');
const BATCH_SIZE = Math.max(1, Number(parseArg('batch-size') || 100));
const DELAY_MS = Math.max(0, Number(parseArg('delay-ms') || 100));

type TableName = 'clinic_images' | 'clinic_doctor_images' | 'areas' | 'states';

const TABLES: TableName[] = [
  'clinic_images',
  'clinic_doctor_images',
  'areas',
  'states',
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

async function countPending(supabase: SupabaseClient, table: TableName): Promise<number> {
  const { count, error } = await supabase
    .from(table)
    .select('id', { count: 'exact', head: true })
    .not('r2_key', 'is', null)
    .not('imagekit_file_id', 'is', null);

  if (error) {
    throw new Error(`Failed to count ${table}: ${error.message}`);
  }
  return count ?? 0;
}

async function fetchBatch(
  supabase: SupabaseClient,
  table: TableName,
  batchSize: number,
): Promise<Array<{ id: string; imagekit_file_id: string; r2_key: string }>> {
  const { data, error } = await supabase
    .from(table)
    .select('id, imagekit_file_id, r2_key')
    .not('r2_key', 'is', null)
    .not('imagekit_file_id', 'is', null)
    .order('id', { ascending: true })
    .limit(batchSize);

  if (error) {
    throw new Error(`Failed to load ${table}: ${error.message}`);
  }

  return (data || []) as Array<{ id: string; imagekit_file_id: string; r2_key: string }>;
}

async function processTable(supabase: SupabaseClient, table: TableName) {
  const pending = await countPending(supabase, table);
  console.log(`\n[${table}] ${pending} rows with r2_key + imagekit_file_id`);

  let ok = 0;
  let fail = 0;
  let batchNum = 0;

  while (true) {
    const rows = await fetchBatch(supabase, table, BATCH_SIZE);
    if (rows.length === 0) {
      break;
    }

    batchNum++;
    console.log(`[${table}] batch ${batchNum} (${rows.length} rows)`);

    for (const row of rows) {
      console.log(`  ${EXECUTE ? 'delete' : 'dry-run'} ${row.id} r2=${row.r2_key}`);

      if (!EXECUTE) {
        ok++;
        continue;
      }

      try {
        await deleteR2Object(row.r2_key);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        // Treat missing objects as success so resume stays clean.
        if (!/NoSuchKey|NotFound|404/i.test(message)) {
          console.warn(`  delete failed ${row.r2_key}: ${message}`);
          fail++;
          continue;
        }
      }

      const { error: updateError } = await supabase
        .from(table)
        .update({ r2_key: null, r2_url: null })
        .eq('id', row.id);

      if (updateError) {
        console.warn(`  null r2_* failed ${row.id}: ${updateError.message}`);
        fail++;
        continue;
      }

      ok++;
    }

    if (!EXECUTE) {
      break;
    }

    if (rows.length < BATCH_SIZE) {
      break;
    }

    if (DELAY_MS > 0) {
      await sleep(DELAY_MS);
    }
  }

  console.log(`[${table}] ok=${ok} fail=${fail}`);
}

async function main() {
  console.log(
    EXECUTE
      ? 'EXECUTE mode — deleting R2 objects + nulling r2_key/r2_url'
      : 'DRY-RUN — no deletes',
  );
  console.log(`batch-size=${BATCH_SIZE} delay-ms=${DELAY_MS}`);
  console.log('Resume-safe: rows drop out after r2_key is nulled.');
  console.log('Only rows with imagekit_file_id set are processed.');

  const supabase = getAdmin();

  for (const table of TABLES) {
    await processTable(supabase, table);
  }

  console.log('\nDone. ImageKit columns left intact; r2_* cleared after delete.');
  if (!EXECUTE) {
    console.log('Re-run with --execute after verifying ImageKit serving.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
