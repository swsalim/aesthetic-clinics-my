// Static page URLs are listed in server-sitemap.xml with database lastmod values.
// Returning null here keeps next-sitemap from also emitting those URLs with today's date.
const exclude = [
  '/*',
  '/dashboard*',
  '/404',
  '/api*',
  '/login',
  '/server-sitemap.xml',
  '/submit/success',
  '/place/*/reviews',
  '/*/dentists',
];

const siteUrl =
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : `${process.env.NEXT_PUBLIC_BASE_URL}`;

const sharedDisallow = [
  '/*_buildManifest.js',
  '/*_middlewareManifest.js',
  '/*_ssgManifest.js',
  '/dashboard',
  '/404',
  '/api',
  '/login',
  '/submit/success',
];

const aiCrawlers = [
  'GPTBot',
  'CCBot',
  'Bytespider',
  'Amazonbot',
  'FacebookBot',
  'meta-externalagent',
  'ClaudeBot',
  'PerplexityBot',
];

const config = {
  siteUrl,
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  sitemapSize: 7000,
  exclude,
  autoLastmod: false,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        disallow: sharedDisallow,
      },
      ...aiCrawlers.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: sharedDisallow,
      })),
    ],
    additionalSitemaps: [`${siteUrl}/server-sitemap.xml`],
    host:
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
        ? process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
        : process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'
          ? process.env.NEXT_PUBLIC_VERCEL_URL
          : process.env.NEXT_PUBLIC_BASE_URL?.replace(/^https?:\/\//, ''),
  },
  transform: async () => null,
};

module.exports = config;
