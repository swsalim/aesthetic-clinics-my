/**
 * Delete ImageKit assets that have already been backfilled to R2.
 * Dry-run by default. Does NOT null out DB ImageKit columns.
 *
 * Usage:
 *   npx tsx tasks/delete-imagekit-assets.ts           # dry-run
 *   npx tsx tasks/delete-imagekit-assets.ts --execute
 *
 * Requires: IMAGEKIT_PRIVATE_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import path from 'path';

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

const EXECUTE = process.argv.includes('--execute');

function getAdmin() {
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

async function processTable(table: string, auth: string) {
  const supabase = getAdmin();
  const { data: rows, error } = await supabase
    .from(table)
    .select('id, imagekit_file_id, r2_key')
    .not('r2_key', 'is', null)
    .not('imagekit_file_id', 'is', null);

  if (error) {
    throw new Error(`Failed to load ${table}: ${error.message}`);
  }

  console.log(`\n[${table}] ${rows?.length ?? 0} rows with r2_key + imagekit_file_id`);

  let ok = 0;
  let fail = 0;

  for (const row of rows || []) {
    const fileId = row.imagekit_file_id as string;
    console.log(`  ${EXECUTE ? 'delete' : 'dry-run'} ${row.id} imagekit=${fileId}`);

    if (!EXECUTE) {
      ok++;
      continue;
    }

    const success = await deleteImageKitFile(fileId, auth);
    if (success) ok++;
    else fail++;
  }

  console.log(`[${table}] ok=${ok} fail=${fail}`);
}

async function main() {
  console.log(EXECUTE ? 'EXECUTE mode — deleting ImageKit files' : 'DRY-RUN — no deletes');
  const auth = getImageKitAuth();

  await processTable('clinic_images', auth);
  await processTable('clinic_doctor_images', auth);
  await processTable('areas', auth);
  await processTable('states', auth);

  console.log('\nDone. DB ImageKit columns intentionally left intact.');
  if (!EXECUTE) {
    console.log('Re-run with --execute after verifying R2 serving.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
