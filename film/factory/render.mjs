// Renders film/factory/draw.html to the film's three frame sets (see film/encode_frames.sh).
// Needs playwright-core and Chrome, and ffmpeg on the path:
//   PW=<folder with node_modules/playwright-core> node film/factory/render.mjs [outDir] [frame numbers to test...] [set names...]
// With frame numbers it writes PNGs of just those frames to outDir (hd and p) to look at.
// Without, it writes web/public/media/film/<V>/<set>/factory/f_001.webp ... for all three sets.
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mkdirSync, rmSync, writeFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const require = createRequire(path.join(process.env.PW || process.cwd(), 'x.js'));
const { chromium } = require('playwright-core');
const here = path.dirname(fileURLToPath(import.meta.url)), root = path.join(here, '..', '..');
const V = 'v3', N = 288, ID = 'standard';
const film = path.join(root, 'web', 'public', 'media', 'film', V);
// Kozhikode is 0.795 across the full frame; the phone set is its middle 608 of 1920
const SETS = [
  { set: 'hd', w: 1920, h: 1080, ku: 0.795, q: 72 },
  { set: 'd', w: 1280, h: 720, ku: 0.795, q: 70 },
  { set: 'p', w: 608, h: 1080, ku: (0.795 * 1920 - 656) / 608, q: 72 },
  // the sharp sets (film/encode_sharp.sh): the joining frames are those sets' own
  { set: 'uhd', dir: 'uhd-v2', w: 2560, h: 1440, ku: 0.795, q: 80 },
  { set: 'p2', dir: 'p2-v2', w: 1080, h: 1920, ku: (0.795 * 1920 - 656) / 608, q: 80 },
];
const tmp = process.argv[2] || path.join(root, 'film', 'factory', '_out');
const tests = process.argv.slice(3).filter((a) => /^\d+$/.test(a)).map(Number);
const only = process.argv.slice(3).filter((a) => !/^\d+$/.test(a)); // set names, to render just those

const browser = await chromium.launch({ channel: 'chrome' });
for (const s of SETS) {
  if (tests.length && s.set === 'd') continue;
  if (only.length && !only.includes(s.set)) continue;
  const page = await (await browser.newContext({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: 1 })).newPage();
  const u = new URL(pathToFileURL(path.join(here, 'draw.html')));
  u.search = new URLSearchParams({ w: s.w, h: s.h, n: N, ku: s.ku,
    start: pathToFileURL(path.join(film, s.dir || s.set, 's10', 'f_121.webp')).href,
    end: pathToFileURL(path.join(film, s.dir || s.set, 's14', 'f_001.webp')).href }).toString();
  await page.goto(u.href);
  console.log(s.set, JSON.stringify(await page.evaluate(() => window.ready)));
  const dir = path.join(tmp, s.set); rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  for (const f of tests.length ? tests : Array.from({ length: N }, (_, i) => i)) {
    await page.evaluate((f) => window.draw(f), f);
    writeFileSync(path.join(dir, `f_${String(f + 1).padStart(3, '0')}.png`), await page.screenshot({ type: 'png' }));
  }
  await page.context().close();
  if (tests.length) continue;
  const out = path.join(film, s.dir || s.set, ID); rmSync(out, { recursive: true, force: true }); mkdirSync(out, { recursive: true });
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-start_number', '1', '-i', path.join(dir, 'f_%03d.png'), '-c:v', 'libwebp', '-compression_level', '6', '-quality', String(s.q), '-fps_mode', 'passthrough', path.join(out, 'f_%03d.webp')]);
  console.log(s.set, readdirSync(out).length, 'frames');
  rmSync(dir, { recursive: true, force: true });
}
await browser.close();
