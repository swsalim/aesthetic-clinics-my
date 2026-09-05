/**
 * Delete ImageKit assets that have already been backfilled to R2.
 * Dry-run by default.
 *
 * After a successful ImageKit delete (or 404), nulls `imagekit_file_id` so
 * re-runs are resume-safe and skip completed rows. Does not clear `image_url`.
 *
 * Paginated — Supabase defaults to max 1000 rows per request; this loops in
 * batches until no pending rows remain.
 *
 * Usage:
 *   npm run delete-imagekit-assets
 *   npm run delete-imagekit-assets -- --execute
 *   npm run delete-imagekit-assets -- --execute --batch-size=50
 *
 * Requires: IMAGEKIT_PRIVATE_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
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

async function deleteImageKitFile(fileId: string, auth: string): Promise<boolean> {
  const response = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Basic ${auth}` },
  });
  if (response.ok || response.status === 404) {
    return true;
  }
  const text = await response.text();
  console.warn(`  delete failed ${fileId}: ${response.status} ${text}`);
  return false;
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
  // Always take the head of pending rows. Successful deletes null imagekit_file_id,
  // so completed rows drop out of the filter (resume-safe).
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

async function processTable(supabase: SupabaseClient, table: TableName, auth: string) {
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
      const fileId = row.imagekit_file_id;
      console.log(`  ${EXECUTE ? 'delete' : 'dry-run'} ${row.id} imagekit=${fileId}`);

      if (!EXECUTE) {
        ok++;
        continue;
      }

      const success = await deleteImageKitFile(fileId, auth);
      if (!success) {
        fail++;
        continue;
      }

      const { error: updateError } = await supabase
        .from(table)
        .update({ imagekit_file_id: null })
        .eq('id', row.id);

      if (updateError) {
        console.warn(`  null imagekit_file_id failed ${row.id}: ${updateError.message}`);
        fail++;
        continue;
      }

      ok++;
    }

    if (!EXECUTE) {
      // Dry-run would loop forever on the same pending head.
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
  console.log(EXECUTE ? 'EXECUTE mode — deleting ImageKit files + nulling imagekit_file_id' : 'DRY-RUN — no deletes');
  console.log(`batch-size=${BATCH_SIZE} delay-ms=${DELAY_MS}`);
  console.log('Resume-safe: rows drop out after imagekit_file_id is nulled.');

  const auth = getImageKitAuth();
  const supabase = getAdmin();

  for (const table of TABLES) {
    await processTable(supabase, table, auth);
  }

  console.log('\nDone. image_url columns left intact; imagekit_file_id cleared after delete.');
  if (!EXECUTE) {
    console.log('Re-run with --execute after verifying R2 serving.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
