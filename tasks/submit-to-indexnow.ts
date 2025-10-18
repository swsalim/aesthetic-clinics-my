import axios from 'axios';
import dotenv from 'dotenv';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import * as path from 'path';

// Configure dotenv to load variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

interface IndexNowResponse {
  status: number;
  message: string;
}

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

interface SitemapIndex {
  sitemap: Array<{ loc: string }>;
}

class IndexNowSubmitter {
  private apiKey: string;
  private baseUrl: string;
  private publicDir: string;

  // Configuration for streaming mode
  private readonly STREAMING_CONFIG = {
    batchSize: 1, // Submit one URL at a time for true streaming
    delayBetweenSubmissions: 2000, // 2 seconds delay between submissions
    maxRetries: 3, // Maximum retry attempts for failed submissions
    retryDelay: 5000, // 5 seconds delay before retry
  };

  constructor() {
    this.apiKey = this.loadApiKey();
    this.baseUrl = this.getBaseUrl();
    this.publicDir = join(process.cwd(), 'public');
  }

  private loadApiKey(): string {
    const apiKeyPath = join(process.cwd(), 'public', 'ac7d2e0216af47318d6a6ec99f3b5921.txt');
    if (!existsSync(apiKeyPath)) {
      throw new Error('IndexNow API key file not found');
    }
    return readFileSync(apiKeyPath, 'utf-8').trim();
  }

  private getBaseUrl(): string {
    // Read from environment or use localhost as fallback
    const env = process.env.NEXT_PUBLIC_VERCEL_ENV;
    if (env === 'production') {
      return `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`;
    } else if (env === 'preview') {
      return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
    } else {
      return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    }
  }

  private async fetchSitemapContent(sitemapPath: string): Promise<string> {
    try {
      const fullPath = join(this.publicDir, sitemapPath);
      if (existsSync(fullPath)) {
        return readFileSync(fullPath, 'utf-8');
      } else {
        // Try to fetch from URL if local file doesn't exist
        const url = `${this.baseUrl}/${sitemapPath}`;
        console.log(`Fetching sitemap from: ${url}`);
        const response = await axios.get(url);
        return response.data;
      }
    } catch (error) {
      console.error(`Error fetching sitemap ${sitemapPath}:`, error);
      return '';
    }
  }

  private parseSitemapIndex(xmlContent: string): SitemapIndex {
    const sitemaps: Array<{ loc: string }> = [];
    const sitemapRegex = /<sitemap>\s*<loc>(.*?)<\/loc>\s*<\/sitemap>/g;
    let match;

    while ((match = sitemapRegex.exec(xmlContent)) !== null) {
      sitemaps.push({ loc: match[1] });
    }

    return { sitemap: sitemaps };
  }

  private parseSitemapUrls(xmlContent: string): SitemapUrl[] {
    const urls: SitemapUrl[] = [];
    const urlRegex =
      /<url>\s*<loc>(.*?)<\/loc>(?:\s*<lastmod>(.*?)<\/lastmod>)?(?:\s*<changefreq>(.*?)<\/changefreq>)?(?:\s*<priority>(.*?)<\/priority>)?\s*<\/url>/g;
    let match;

    while ((match = urlRegex.exec(xmlContent)) !== null) {
      urls.push({
        loc: match[1],
        lastmod: match[2],
        changefreq: match[3],
        priority: match[4],
      });
    }

    return urls;
  }

  private async submitSingleUrl(url: string, attempt: number = 1): Promise<boolean> {
    try {
      const response = await axios.post<IndexNowResponse>(
        'https://api.indexnow.org/indexnow',
        {
          host: new URL(this.baseUrl).host,
          key: this.apiKey,
          keyLocation: 'https://www.aestheticclinics.my/ac7d2e0216af47318d6a6ec99f3b5921.txt',
          urlList: [url],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status === 200) {
        return true;
      } else {
        console.log(`⚠️ Attempt ${attempt} returned status: ${response.status}`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
      }
      return false;
    }
  }

  private async submitToIndexNow(urls: string[]): Promise<void> {
    if (urls.length === 0) {
      console.log('No URLs to submit');
      return;
    }

    // Streaming mode: Submit URLs individually or in very small batches
    // Use a much smaller batch size to avoid server overload
    const batchSize = this.STREAMING_CONFIG.batchSize;
    const batches = [];

    for (let i = 0; i < urls.length; i += batchSize) {
      batches.push(urls.slice(i, i + batchSize));
    }

    console.log(`🔄 Streaming ${urls.length} URLs individually (streaming mode)`);
    console.log(`🔑 API Key: ${this.apiKey.substring(0, 8)}...`);
    console.log(`🌐 Host: ${new URL(this.baseUrl).host}`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const url = batch[0]; // Since batch size is 1

      console.log(`📤 Submitting URL ${i + 1}/${urls.length}: ${url}`);

      let success = false;
      let attempts = 0;

      // Retry logic for failed submissions
      while (!success && attempts < this.STREAMING_CONFIG.maxRetries) {
        attempts++;
        success = await this.submitSingleUrl(url, attempts);

        if (!success && attempts < this.STREAMING_CONFIG.maxRetries) {
          console.log(
            `🔄 Retrying in ${this.STREAMING_CONFIG.retryDelay}ms... (attempt ${attempts + 1}/${this.STREAMING_CONFIG.maxRetries})`,
          );
          await new Promise((resolve) => setTimeout(resolve, this.STREAMING_CONFIG.retryDelay));
        }
      }

      if (success) {
        successCount++;
        console.log(
          `✅ URL ${i + 1} submitted successfully${attempts > 1 ? ` (after ${attempts} attempts)` : ''}`,
        );
      } else {
        errorCount++;
        console.log(`❌ URL ${i + 1} failed after ${attempts} attempts`);
      }

      // Add a delay between each submission to be respectful to the API
      // This is crucial for streaming mode to prevent server overload
      if (i < batches.length - 1) {
        const delay = this.STREAMING_CONFIG.delayBetweenSubmissions;
        console.log(`⏳ Waiting ${delay}ms before next submission...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    console.log(`\n📊 Streaming Results:`);
    console.log(`✅ Successful submissions: ${successCount}`);
    console.log(`❌ Failed submissions: ${errorCount}`);
    console.log(`📈 Success rate: ${((successCount / urls.length) * 100).toFixed(2)}%`);
  }

  public async submitAllUrls(): Promise<void> {
    console.log('🚀 Starting IndexNow submission process...');
    console.log(`📍 Base URL: ${this.baseUrl}`);
    console.log(`🔑 API Key: ${this.apiKey.substring(0, 8)}...`);
    console.log(
      `⚙️ Streaming Mode: Enabled (${this.STREAMING_CONFIG.batchSize} URL per submission)`,
    );
    console.log(`⏱️ Delay between submissions: ${this.STREAMING_CONFIG.delayBetweenSubmissions}ms`);
    console.log(`🔄 Max retries per URL: ${this.STREAMING_CONFIG.maxRetries}`);
    console.log('');

    const allUrls: string[] = [];

    try {
      // First, read the main sitemap index
      const mainSitemapContent = await this.fetchSitemapContent('sitemap.xml');
      if (!mainSitemapContent) {
        throw new Error('Could not fetch main sitemap');
      }

      console.log('mainSitemapContent');
      console.log(mainSitemapContent);

      const sitemapIndex = this.parseSitemapIndex(mainSitemapContent);
      console.log(`📋 Found ${sitemapIndex.sitemap.length} sitemaps in index`);

      // Process each sitemap
      for (const sitemap of sitemapIndex.sitemap) {
        const sitemapPath = sitemap.loc.replace(this.baseUrl, '').replace(/^\//, '');
        console.log(`📄 Processing sitemap: ${sitemapPath}`);

        const sitemapContent = await this.fetchSitemapContent(sitemapPath);
        if (sitemapContent) {
          const urls = this.parseSitemapUrls(sitemapContent);
          console.log(`  Found ${urls.length} URLs in ${sitemapPath}`);

          // Add URLs to the collection, ensuring they're absolute URLs
          urls.forEach((url) => {
            if (url.loc.startsWith('http')) {
              allUrls.push(url.loc);
            } else {
              allUrls.push(`${this.baseUrl}${url.loc.startsWith('/') ? '' : '/'}${url.loc}`);
            }
          });
        }
      }

      // Remove duplicates
      const uniqueUrls = [...new Set(allUrls)];
      console.log(`\n📊 Total unique URLs found: ${uniqueUrls.length}`);

      // Estimate total time
      const estimatedTimeMinutes = Math.ceil(
        (uniqueUrls.length * this.STREAMING_CONFIG.delayBetweenSubmissions) / 60000,
      );
      console.log(`⏰ Estimated completion time: ~${estimatedTimeMinutes} minutes`);
      console.log('');

      // Submit to IndexNow
      await this.submitToIndexNow(uniqueUrls);

      console.log('\n✅ IndexNow submission process completed!');
    } catch (error) {
      console.error('❌ Error during submission process:', error);
      process.exit(1);
    }
  }
}

// Run the script
async function main() {
  const submitter = new IndexNowSubmitter();
  await submitter.submitAllUrls();
}

if (require.main === module) {
  main().catch(console.error);
}
