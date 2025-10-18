import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'node:fs';
import * as path from 'node:path';

// Configure dotenv to load variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Types
interface Place {
  title: string;
  slug: string;
  [key: string]: unknown;
}

// Initialize Supabase client
function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }

  return createClient(supabaseUrl, supabaseKey);
}

async function checkDuplicateClinicSlug(slug: string): Promise<{ count: number }> {
  if (!slug) return { count: 0 };

  const supabase = createServerClient();

  const { count: clinicsCount, error: clinicsError } = await supabase
    .from('clinics')
    .select('name', { count: 'exact' })
    .eq('slug', slug);

  if (clinicsError) {
    console.error('Error checking slug in clinics table:', clinicsError);
    throw clinicsError;
  }

  return { count: clinicsCount || 0 };
}

async function filterData(jsonData: Place[]): Promise<Place[]> {
  console.log(`Filtering ${jsonData.length} places...`);
  const startTime = Date.now();

  const filteredData: Place[] = [];

  for (const [index, place] of jsonData.entries()) {
    if ((index + 1) % 100 === 0) {
      console.log(`Processed ${index + 1}/${jsonData.length} places...`);
    }

    try {
      const { count } = await checkDuplicateClinicSlug(place.slug);

      if (count === 0) {
        filteredData.push(place);
      } else {
        console.log(`Skipping duplicate slug: ${place.slug} for clinic: ${place.title}`);
      }
    } catch (error) {
      console.error(`Error checking slug for "${place.title}":`, error);
    }
  }

  const endTime = Date.now();
  console.log(`Filtering completed in ${((endTime - startTime) / 1000).toFixed(2)}s`);
  console.log(`Kept ${filteredData.length}/${jsonData.length} places`);

  return filteredData;
}

async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.promises.mkdir(dirPath, { recursive: true });
  } catch (error) {
    throw new Error(`Failed to create directory ${dirPath}: ${error}`);
  }
}

async function processFile(inputFileName: string): Promise<void> {
  try {
    const inputFileFullPath = path.resolve(inputFileName);
    console.log(`Reading file: ${inputFileFullPath}`);

    const fileContent = await fs.promises.readFile(inputFileFullPath, 'utf-8');
    const jsonData = JSON.parse(fileContent) as Place[];

    const filteredData = await filterData(jsonData);

    const parsedDataDir = path.resolve('./tasks/data/parsedData');
    await ensureDirectoryExists(parsedDataDir);

    const outputFileName = `filtered-${path.basename(inputFileName)}`;
    const outputFileFullPath = path.join(parsedDataDir, outputFileName);

    await fs.promises.writeFile(outputFileFullPath, JSON.stringify(filteredData, null, 2), 'utf-8');

    console.log(`Successfully saved filtered data to: ${outputFileFullPath}`);
  } catch (error) {
    console.error('Error processing file:', error);
    process.exit(1);
  }
}

// Main execution
function main(): void {
  const command = process.argv[2];

  if (!command) {
    console.error('Please provide a file name.');
    process.exit(1);
  }

  const filename = `./tasks/data/parsedData/processed-${command}.json`;
  processFile(filename).catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

main();
