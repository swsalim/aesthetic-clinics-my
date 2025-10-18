# IndexNow URL Submission Script

This script automatically submits all URLs from your sitemap to IndexNow for faster search engine indexing.

## Prerequisites

- Your IndexNow API key file must be present at `public/ac7d2e0216af47318d6a6ec99f3b5921.txt`
- Your sitemap files must be generated (run `npm run build` to generate them)

## Usage

### Run the script

```bash
npm run submit-indexnow
```

### What the script does

1. **Reads your API key** from `public/ac7d2e0216af47318d6a6ec99f3b5921.txt`
2. **Determines your base URL** from environment variables:
   - Production: `https://${NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
   - Preview: `https://${NEXT_PUBLIC_VERCEL_URL}`
   - Development: `http://localhost:3000` (fallback)
3. **Parses your sitemap index** (`sitemap.xml`) to find all sitemap files
4. **Extracts all URLs** from each sitemap file
5. **Submits URLs to IndexNow** in batches of 10,000 (IndexNow limit)
6. **Provides detailed logging** of the submission process

### Environment Variables

The script uses these environment variables to determine your site's URL:

- `NEXT_PUBLIC_VERCEL_ENV`: Set to 'production', 'preview', or undefined
- `NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL`: Your production domain
- `NEXT_PUBLIC_VERCEL_URL`: Your preview deployment URL
- `NEXT_PUBLIC_BASE_URL`: Your development base URL

### Output

The script will show:
- Number of sitemaps found
- Number of URLs in each sitemap
- Total unique URLs to submit
- Submission progress for each batch
- Success/error status for each batch

### Example Output

```
🚀 Starting IndexNow submission process...
📍 Base URL: https://yourdomain.com
🔑 API Key: ac7d2e02...
📋 Found 2 sitemaps in index
📄 Processing sitemap: sitemap-0.xml
  Found 150 URLs in sitemap-0.xml
📄 Processing sitemap: server-sitemap.xml
  Found 300 URLs in server-sitemap.xml

📊 Total unique URLs found: 450
Submitting 450 URLs in 1 batch(es)
Submitting batch 1/1 with 450 URLs
✅ Batch 1 submitted successfully

✅ IndexNow submission process completed!
```

### Troubleshooting

- **API key not found**: Ensure `public/ac7d2e0216af47318d6a6ec99f3b5921.txt` exists
- **Sitemap not found**: Run `npm run build` to generate sitemaps first
- **Network errors**: Check your internet connection and IndexNow API status
- **Rate limiting**: The script includes 1-second delays between batches

### Manual Execution

You can also run the script directly:

```bash
npx tsx ./tasks/submit-to-indexnow.ts
```

### Integration with Build Process

To automatically submit URLs after each build, you can add this to your `package.json`:

```json
{
  "scripts": {
    "postbuild": "next-sitemap && npm run submit-indexnow"
  }
}
```

This will generate the sitemap and submit URLs to IndexNow after every build. 
