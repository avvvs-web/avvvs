// Renders history-banner.html to web/public/media/history/legacy-banner.jpg at twice its size.
//   PW=<folder with node_modules/playwright-core> node film/banner/render.mjs
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const require = createRequire(path.join(process.env.PW || process.cwd(), 'x.js'));
const { chromium } = require('playwright-core');
const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, '..', '..', 'web', 'public', 'media', 'history', 'legacy-banner.png');
const b = await chromium.launch({ channel: 'chrome', args: ['--allow-file-access-from-files'] });
const p = await (await b.newContext({ viewport: { width: 1365, height: 590 }, deviceScaleFactor: 2 })).newPage();
await p.goto(pathToFileURL(path.join(here, 'history-banner.html')).href);
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(600);
await p.screenshot({ path: out });
await b.close();
console.log(out);
