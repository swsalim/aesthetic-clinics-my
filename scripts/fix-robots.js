import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const robotsPath = join(__dirname, '../public/robots.txt');

if (existsSync(robotsPath)) {
  let content = readFileSync(robotsPath, 'utf8');

  // Fix the comment syntax
  content = content.replace(/^# \*$/m, '# All user agents');

  // Fix the Host directive to only include hostname
  content = content.replace(/Host: (https?:\/\/)?([^\s/]+)/, (match, proto, host) => {
    // Use production domain if available
    const prodDomain = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
    return 'Host: ' + (prodDomain || host);
  });

  writeFileSync(robotsPath, content);
  console.log('robots.txt fixed!');
} else {
  console.log('robots.txt not found.');
}
