import { createClient, SupabaseClient } from '@supabase/supabase-js';
import algoliasearch, { SearchIndex } from 'algoliasearch';
import dotenv from 'dotenv';
import * as path from 'node:path';

// Configure dotenv to load variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

interface Clinic {
  id: number;
  name: string;
  slug: string;
  address: string;
  zipcode: string;
  phone: string;
  area_id: number;
  state_id: number;
  category_id: number;
  area: { name: string };
  state: { name: string };
}

interface SearchObject {
  objectID: number;
  name: string;
  slug: string;
  address: string;
  phone: string;
  area: string;
  state: string;
}

interface ProcessingStats {
  total: number;
  processed: number;
  failed: number;
  failedItems: Array<{ name: string; error: string }>;
}

class SearchIndexBuilder {
  private supabase!: SupabaseClient;
  private algoliaClient!: ReturnType<typeof algoliasearch>;
  private algoliaIndex!: SearchIndex;
  private stats: ProcessingStats = {
    total: 0,
    processed: 0,
    failed: 0,
    failedItems: [],
  };

  constructor() {
    this.validateEnvironmentVariables();
    this.initializeClients();
  }

  private validateEnvironmentVariables(): void {
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'NEXT_PUBLIC_ALGOLIA_APP_ID',
      'ALGOLIA_SEARCH_ADMIN_KEY',
    ];

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    }
  }

  private initializeClients(): void {
    // Initialize Supabase client
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    // Initialize Algolia client and index
    this.algoliaClient = algoliasearch(
      process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
      process.env.ALGOLIA_SEARCH_ADMIN_KEY!,
    );
    this.algoliaIndex = this.algoliaClient.initIndex('prod_PLACES_v2');
  }

  private async getAllClinics(): Promise<Clinic[]> {
    const { data: clinics, error } = await this.supabase
      .from('clinics')
      .select(
        `
        id,
        name,
        slug,
        address,
        area_id,
        state_id,
        area:area_id(name),
        state:state_id(name),
      `,
      )
      .eq('is_active', true)
      .returns<Clinic[]>();

    if (error) {
      throw new Error(`Failed to fetch clinics: ${error.message}`);
    }

    if (!clinics) {
      throw new Error('No clinics found');
    }

    return clinics;
  }

  private transformToSearchObjects(clinics: Clinic[]): SearchObject[] {
    return clinics.map((clinic) => ({
      objectID: clinic.id,
      name: clinic.name,
      slug: clinic.slug,
      address: clinic.address,
      phone: clinic.phone,
      area: clinic.area.name,
      state: clinic.state.name,
    }));
  }

  private async indexToAlgolia(searchObjects: SearchObject[]): Promise<void> {
    const response = await this.algoliaIndex.saveObjects(searchObjects, {
      autoGenerateObjectIDIfNotExist: false,
    });

    this.stats.processed = response.objectIDs.length;
    console.log(
      `🎉 Successfully added ${response.objectIDs.length} records to Algolia search.\nObject IDs:\n${response.objectIDs.join(', ')}`,
    );
  }

  public async buildSearchIndex(): Promise<ProcessingStats> {
    try {
      console.log('Starting search index build process...');

      const clinics = await this.getAllClinics();
      this.stats.total = clinics.length;

      const searchObjects = this.transformToSearchObjects(clinics);
      await this.indexToAlgolia(searchObjects);

      this.logResults();
      return this.stats;
    } catch (error) {
      this.handleError('Failed to build search index', error);
      throw error;
    }
  }

  private handleError(context: string, error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    this.stats.failed++;
    this.stats.failedItems.push({
      name: context,
      error: errorMessage,
    });
    console.error(`${context}:`, errorMessage);
  }

  private logResults(): void {
    console.log('\nProcessing completed:');
    console.log(`Total clinics: ${this.stats.total}`);
    console.log(`Successfully processed: ${this.stats.processed}`);
    console.log(`Failed: ${this.stats.failed}`);

    if (this.stats.failedItems.length) {
      console.log('\nFailed items:');
      this.stats.failedItems.forEach(({ name, error }) => {
        console.log(`- ${name}: ${error}`);
      });
    }
  }
}

// Script execution
async function main(): Promise<void> {
  try {
    const builder = new SearchIndexBuilder();
    await builder.buildSearchIndex();
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  }
}

main();
