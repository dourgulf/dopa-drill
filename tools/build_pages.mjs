import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

// Pages supplies a deployment URL, which can include a hash or branch prefix.
// Use the stable project hostname for search metadata on every deployment.
export function siteOrigin(env) {
  const value = env.SITE_URL || env.CF_PAGES_URL;
  if (!value) throw new Error('Set SITE_URL for local builds; Cloudflare supplies CF_PAGES_URL automatically.');
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.port ||
      url.pathname !== '/' || url.search || url.hash) {
    throw new Error('Site URL must be an HTTPS origin without a path, credentials, query, or fragment.');
  }
  if (!env.SITE_URL) {
    if (!/^(?:[a-z0-9-]+\.)+pages\.dev$/.test(url.hostname)) {
      throw new Error('Expected a pages.dev deployment URL; use SITE_URL for a custom domain.');
    }
    url.hostname = url.hostname.split('.').slice(-3).join('.');
  }
  return url.origin;
}

export async function buildPages(env = process.env, output = new URL('../dist/', import.meta.url)) {
  const origin = siteOrigin(env);
  const source = new URL('../app/', import.meta.url);
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  await cp(source, output, { recursive: true });
  const index = new URL('index.html', output);
  const html = await readFile(index, 'utf8');
  await writeFile(index, html.replace('</head>', `  <link rel="canonical" href="${origin}/">\n</head>`));
  await writeFile(new URL('robots.txt', output), `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
  await writeFile(new URL('sitemap.xml', output), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${origin}/</loc></url>\n</urlset>\n`);
  console.log(`Prepared static site for ${origin}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await buildPages();
}
