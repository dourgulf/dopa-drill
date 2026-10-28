import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { buildPages, siteOrigin } from '../tools/build_pages.mjs';

test('Pages metadata uses the stable project domain, including preview builds', () => {
  for (const host of ['my-game.pages.dev', 'abc123.my-game.pages.dev', 'feature.my-game.pages.dev']) {
    assert.equal(siteOrigin({ CF_PAGES_URL: `https://${host}` }), 'https://my-game.pages.dev');
  }
  assert.equal(siteOrigin({ SITE_URL: 'https://game.example.com/', CF_PAGES_URL: 'https://abc.my-game.pages.dev' }), 'https://game.example.com');
});

test('rejects missing or invalid deployment origins before changing output', () => {
  for (const value of ['http://game.pages.dev', 'https://game.pages.dev/path', 'https://game.pages.dev/?q=1', 'https://user:pass@game.pages.dev', 'https://game.pages.dev/#x']) {
    assert.throws(() => siteOrigin({ SITE_URL: value }));
  }
  assert.throws(() => siteOrigin({}));
  assert.throws(() => siteOrigin({ CF_PAGES_URL: 'https://unrelated.example.com' }));
});

test('deployment output contains game assets and consistent metadata without the upstream domain', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'dopa-pages-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const output = pathToFileURL(`${directory}/site/`);
  await buildPages({ CF_PAGES_URL: 'https://abc123.my-game.pages.dev' }, output);
  const read = (path) => readFile(new URL(path, output), 'utf8');
  const html = await read('index.html');
  assert.match(html, /rel="canonical" href="https:\/\/my-game.pages.dev\/"/);
  assert.doesNotMatch(html, /dopa-drill\.tanosix\.com/);
  assert.match(await read('robots.txt'), /Sitemap: https:\/\/my-game.pages.dev\/sitemap.xml/);
  assert.match(await read('sitemap.xml'), /<loc>https:\/\/my-game.pages.dev\/<\/loc>/);
  assert.equal(await read('_headers'), await readFile(new URL('../app/_headers', import.meta.url), 'utf8'));
  assert.equal(await read('js/main.js'), await readFile(new URL('../app/js/main.js', import.meta.url), 'utf8'));
  await readFile(new URL('fonts/zen-maru-gothic-bold.woff2', output));
});
