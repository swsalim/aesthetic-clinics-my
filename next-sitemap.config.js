// Save crawling budget by not fetching SSG meta files
const exclude = ['/dashboard*', '/404', '/api*', '/login', '/server-sitemap.xml', '/submit/success'];

const siteUrl =
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : `${process.env.NEXT_PUBLIC_BASE_URL}`;

const config = {
  siteUrl,
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  sitemapSize: 7000,
  exclude,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        disallow: [
          '/*.json',
          '/*_buildManifest.js',
          '/*_middlewareManifest.js',
          '/*_ssgManifest.js',
          '/*.js',
          '/dashboard',
          '/404',
          '/api',
          '/login',
          '/submit/success'
        ]
      }
    ],
    additionalSitemaps: [`${siteUrl}/server-sitemap.xml`],
    host: process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
      ? process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
      : process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'
        ? process.env.NEXT_PUBLIC_VERCEL_URL
        : process.env.NEXT_PUBLIC_BASE_URL?.replace(/^https?:\/\//, ''),
  },
  transform: async (config, path) => {
    // Fix robots.txt after generation
    if (path === 'robots.txt') {
      const fs = await import('fs');
      const robotsPath = './public/robots.txt';

      if (fs.existsSync(robotsPath)) {
        let content = fs.readFileSync(robotsPath, 'utf8');

        // Fix the comment syntax
        content = content.replace('# *', '# All user agents');

        // Fix the Host directive to only include hostname
        const hostMatch = content.match(/Host: (https?:\/\/)?([^\/\s]+)/);
        if (hostMatch) {
          const hostname = hostMatch[2];
          content = content.replace(/Host: https?:\/\/[^\/\s]+/, `Host: ${hostname}`);
        }

        fs.writeFileSync(robotsPath, content);
      }
    }

    return config;
  },
};

module.exports = config;
