'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '@/lib/gsap';
import { CLIPS, FOUNDED, type Clip } from '@/lib/film';
import { whenReady } from '@/lib/ready';
import FRAME_COUNTS from '@/lib/film-frames.json';

const FADE = 0.12;       // screen-heights over which one clip dissolves into the first frame of the next
const CARD_FADE = 0.18;  // screen-heights for a card to fade in or out
const yearsSinceFounding = () => new Date().getFullYear() - FOUNDED;

const offsets: number[] = [];
let total = 0;
for (const c of CLIPS) { offsets.push(total); total += c.weight; }
const CHAPTERS = CLIPS.map((c, i) => ({ label: c.chapter, at: offsets[i] })).filter((c) => c.label) as { label: string; at: number }[];

// The film's frames (film/encode_frames.sh). The folder is versioned because it is cached for a year.
const FRAMES_BASE = '/media/film/v2';
const SETS = {
  p: { w: 608, h: 1080, ahead: 5, behind: 2, keep: 7 },    // phones held upright: the centre of the frame
  d: { w: 1280, h: 720, ahead: 6, behind: 3, keep: 9 },    // laptops, tablets, slower connections
  hd: { w: 1920, h: 1080, ahead: 5, behind: 2, keep: 7 },  // large, sharp screens on a good connection
} as const;
type SetName = keyof typeof SETS;
const frameUrl = (set: SetName, folder: string, f: number) => `${FRAMES_BASE}/${set}/${folder}/f_${String(f + 1).padStart(3, '0')}.webp`;

// every frame of the film on one line: clip k owns START[k] .. START[k] + COUNT[k] - 1
const COUNT = CLIPS.map((c) => (FRAME_COUNTS as Record<string, number>)[c.frames] ?? 1);
const START: number[] = [];
let FRAMES = 0;
for (const n of COUNT) { START.push(FRAMES); FRAMES += n; }
const CLIP_OF = new Uint8Array(FRAMES);
COUNT.forEach((n, k) => CLIP_OF.fill(k, START[k], START[k] + n));

const MAX_FETCH = 8;     // frames downloading at once
const MAX_DECODE = 3;    // frames decoding at once
const FIRST_FRAMES = 24; // all that loads before the visitor first scrolls

/**
 * The whole film in one pinned stage, drawn on one canvas. Scrolling moves a playhead along the
 * film's frames; the canvas shows the two frames either side of it, blended, so slow camera moves
 * stay smooth, and each clip dissolves into the first frame of the next (the frames match, so the
 * joins don't show). Cards fade in and out over the picture.
 *
 * Frames are stills rather than video because scrubbing a video depends on the browser's decoder:
 * seeks stall on Android and in Safari, and browsers cap how many videos may decode at once.
 * Frames download nearest the playhead first and coarse before fine, so a jump always has
 * something close to show; only the few around the playhead are held decoded.
 * With reduced motion the film becomes a column of stills with their cards.
 */
export function FilmStage() {
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    const el = root.current!;
    const years = el.querySelector<HTMLElement>('.heritage-years');
    if (years) years.textContent = String(yearsSinceFounding());
    const layers = gsap.utils.toArray<HTMLElement>('.film-layer', el);

    if (prefersReducedMotion()) {
      el.querySelectorAll<HTMLImageElement>('.film-media img[data-src]').forEach((img) => { img.src = img.dataset.src!; });
      return;
    }

    const canvas = el.querySelector<HTMLCanvasElement>('.film-canvas')!;
    const poster = el.querySelector<HTMLImageElement>('.film-poster');
    const scrimLight = el.querySelector<HTMLElement>('.film-scrim-light');
    const scrimDark = el.querySelector<HTMLElement>('.film-scrim:not(.film-scrim-light)');
    const ctx = canvas.getContext('2d', { alpha: false });
    // no canvas: the opening still stays, and the cards still play over it

    const net = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const pickSet = (): SetName => {
      const w = window.innerWidth;
      if (w < 820 && window.innerHeight > w) return 'p';
      const slow = net?.saveData || ['slow-2g', '2g', '3g'].includes(net?.effectiveType ?? '');
      const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
      return w >= 1100 && w * window.devicePixelRatio >= 1700 && !slow && memory >= 4 ? 'hd' : 'd';
    };

    type Frame = { img: CanvasImageSource; close: () => void };
    let set = pickSet();
    let gen = 0;                                 // bumped when the frame set changes; stale results are dropped
    const blobs: (Blob | undefined)[] = new Array(FRAMES);
    const state = new Uint8Array(FRAMES);        // 0 not loaded, 1 downloading, 2 downloaded, 3 given up
    const tries = new Uint8Array(FRAMES);
    const cache = new Map<number, Frame>();      // decoded frames around the playhead
    const decoding = new Set<number>();
    let inFlight = 0;
    let head = 0;        // the playhead, in frames along the whole film (fractional)
    let dir = 1;         // which way it last moved
    let clip = 0;        // the clip the playhead is in
    let fade = 0;        // 0-1: how far this clip has dissolved into the next
    let started = false; // the visitor has scrolled
    let awake = true;    // the stage is on screen
    let dirty = true;
    let lastKey = '';
    let painted = false;

    const sizeCanvas = () => { canvas.width = SETS[set].w; canvas.height = SETS[set].h; lastKey = ''; };
    sizeCanvas();

    const decode = async (blob: Blob): Promise<Frame> => {
      try {
        const bmp = await createImageBitmap(blob);
        return { img: bmp, close: () => bmp.close() };
      } catch {
        // browsers without createImageBitmap, or that can't use it on this image
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.decoding = 'async';
        img.src = url;
        try { await img.decode(); } catch (e) { URL.revokeObjectURL(url); throw e; }
        return { img, close: () => URL.revokeObjectURL(url) };
      }
    };

    const releaseDecoded = () => { cache.forEach((f) => f.close()); cache.clear(); };

    // Decode the frames around the playhead (more ahead of it than behind), nearest first; if none
    // of those has arrived yet, the nearest frame that has, so there is always something to show.
    const decodeNear = () => {
      if (!awake || !ctx) return;
      const { ahead, behind, keep } = SETS[set];
      const at = Math.round(head);
      const lo = Math.max(0, at - (dir >= 0 ? behind : ahead));
      const hi = Math.min(FRAMES - 1, at + (dir >= 0 ? ahead : behind));
      let nearest = -1;
      for (const g of cache.keys()) if (nearest < 0 || Math.abs(g - head) < Math.abs(nearest - head)) nearest = g;
      for (const g of cache.keys()) if (Math.abs(g - at) > keep && g !== nearest) { cache.get(g)!.close(); cache.delete(g); }
      const want: number[] = [];
      for (let g = lo; g <= hi; g++) if (state[g] === 2 && !cache.has(g) && !decoding.has(g)) want.push(g);
      want.sort((a, b) => Math.abs(a - at) - Math.abs(b - at));
      if (!want.length && !decoding.size && (nearest < 0 || Math.abs(nearest - at) > keep)) {
        for (let d = 0; d < 140 && !want.length; d++) {
          if (at + d < FRAMES && state[at + d] === 2 && !cache.has(at + d)) want.push(at + d);
          else if (at - d >= 0 && state[at - d] === 2 && !cache.has(at - d)) want.push(at - d);
        }
      }
      for (const g of want) {
        if (decoding.size >= MAX_DECODE) break;
        const blob = blobs[g];
        if (!blob) continue;
        const mine = gen;
        decoding.add(g);
        decode(blob).then((fr) => {
          if (mine !== gen) { fr.close(); return; }
          decoding.delete(g);
          if (!awake) { fr.close(); return; }
          cache.get(g)?.close();
          cache.set(g, fr);
          dirty = true;
          decodeNear();
        }, () => {
          if (mine !== gen) return;
          decoding.delete(g);
          blobs[g] = undefined; state[g] = ++tries[g] < 4 ? 0 : 3; // a bad download: fetch it again
          pump();
        });
      }
    };

    // Download frames for the clip on screen, the one behind and the two ahead. Nearest the playhead
    // first, and every eighth frame before every fourth before the rest, so a jump or a fast scroll
    // gets an even spread across the clip at once and the gaps fill in after.
    const pump = () => {
      if (!ctx) return;
      const last = CLIPS.length - 1;
      const a = START[Math.max(0, clip - 1)];
      const end = Math.min(last, started ? clip + 2 : clip);
      const b = started ? START[end] + COUNT[end] - 1 : Math.min(FIRST_FRAMES, COUNT[0]) - 1;
      const at = Math.round(head);
      while (inFlight < MAX_FETCH) {
        let best = -1, bestScore = Infinity;
        for (let g = a; g <= b; g++) {
          if (state[g] !== 0) continue;
          const d = (g - at) * dir;
          let s = d >= 0 ? d : -d * 2;
          if (s <= 6) s /= 16;
          else {
            const f = g - START[CLIP_OF[g]];
            if (f % 8 === 0 || f === COUNT[CLIP_OF[g]] - 1) s /= 8; else if (f % 4 === 0) s /= 4; else if (f % 2 === 0) s /= 2;
          }
          if (s < bestScore) { bestScore = s; best = g; }
        }
        if (best < 0) return;
        const g = best, mine = gen;
        const k = CLIP_OF[g];
        state[g] = 1; inFlight++;
        fetch(frameUrl(set, CLIPS[k].frames, g - START[k]))
          .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
          .then((blob) => {
            if (mine !== gen) return;
            blobs[g] = blob; state[g] = 2; inFlight--;
            decodeNear(); pump();
          }, () => {
            if (mine !== gen) return;
            inFlight--;
            // try again shortly, a few times; a dropped connection gets a fresh start when it returns
            state[g] = 3;
            if (++tries[g] < 4) window.setTimeout(() => { if (mine === gen && state[g] === 3) { state[g] = 0; pump(); } }, 1500 * tries[g]);
            pump();
          });
      }
    };
    const onOnline = () => { for (let g = 0; g < FRAMES; g++) if (state[g] === 3) { state[g] = 0; tries[g] = 0; } pump(); };

    // encoded frames of clips far from the playhead are let go (the browser's cache still has them)
    const forgetFar = () => {
      for (let k = 0; k < CLIPS.length; k++) {
        if (k >= clip - 2 && k <= clip + 3) continue;
        for (let g = START[k]; g < START[k] + COUNT[k]; g++) if (state[g] === 2) { blobs[g] = undefined; state[g] = 0; }
      }
    };

    const ease = (x: number) => x * x * (3 - 2 * x);
    const draw = () => {
      if (!ctx || !awake) return;
      const { w, h } = SETS[set];
      const lo = Math.floor(head);
      const hi = Math.min(lo + 1, START[clip] + COUNT[clip] - 1);
      const mix = Math.round((head - lo) * 24) / 24;
      let a = cache.has(lo) ? lo : -1;
      let b = hi !== lo && cache.has(hi) ? hi : -1;
      let alpha = mix;
      if (a < 0 || b < 0) {
        // one or both missing: show the nearest decoded frame, from this clip if it has one
        alpha = 0; b = -1;
        let score = Infinity;
        for (const g of cache.keys()) {
          const s = Math.abs(g - head) + (CLIP_OF[g] === clip ? 0 : 1000);
          if (s < score) { score = s; a = g; }
        }
        if (a < 0) return;
      }
      const next = fade > 0 && clip < CLIPS.length - 1 && cache.has(START[clip + 1]) ? START[clip + 1] : -1;
      const over = next < 0 ? 0 : Math.round(ease(fade) * 32) / 32;
      const key = `${a}/${b}/${alpha}/${next}/${over}`;
      if (key === lastKey) return;
      try {
        ctx.globalAlpha = 1;
        ctx.drawImage(cache.get(a)!.img, 0, 0, w, h);
        if (b >= 0 && alpha > 0) { ctx.globalAlpha = alpha; ctx.drawImage(cache.get(b)!.img, 0, 0, w, h); }
        if (over > 0) { ctx.globalAlpha = over; ctx.drawImage(cache.get(next)!.img, 0, 0, w, h); }
        ctx.globalAlpha = 1;
        lastKey = key;
        if (!painted) {
          painted = true;
          canvas.style.visibility = 'visible';
          if (poster) poster.style.visibility = 'hidden';
        }
      } catch {
        // a frame that can't be drawn: leave what is on the canvas
      }
    };
    const tick = () => { if (dirty) { dirty = false; draw(); } };
    gsap.ticker.add(tick);

    // t: the film's time, in screen-heights of scroll
    let light = -1;
    const setTime = (t: number) => {
      let k = 0;
      while (k < offsets.length - 1 && t >= offsets[k + 1]) k++;
      const c = CLIPS[k];
      const play = Math.min(1, Math.max(0, (t - offsets[k]) / (c.weight * (c.playShare ?? 1))));
      const to = START[k] + play * (COUNT[k] - 1);
      const whole = Math.round(to) !== Math.round(head);
      if (to !== head) dir = to > head ? 1 : -1;
      head = to;
      fade = k < CLIPS.length - 1 ? Math.min(1, Math.max(0, (t - (offsets[k + 1] - FADE)) / FADE)) : 0;
      // the scrim under the cards follows the picture: dark frames get a dark one, bright frames a pale one
      const l = (c.light ? 1 : 0) * (1 - fade) + (CLIPS[k + 1]?.light ? 1 : 0) * fade;
      if (l !== light && scrimLight && scrimDark) {
        light = l;
        scrimLight.style.opacity = String(Math.round(l * 100) / 100);
        scrimDark.style.opacity = String(Math.round((1 - l) * 100) / 100);
      }
      if (t > 0.01) started = true; // a reload part-way down the film counts as having scrolled
      if (k !== clip) { clip = k; forgetFar(); pump(); }
      dirty = true;
      if (whole) { decodeNear(); pump(); }
    };

    const sleep = () => { awake = false; releaseDecoded(); };
    const wake = () => { if (awake) return; awake = true; lastKey = ''; dirty = true; decodeNear(); pump(); };

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        id: 'film', trigger: el, start: 'top top', end: () => `+=${window.innerHeight * total}`,
        pin: el.querySelector('.film-stage'), scrub: 0.5, anticipatePin: 1,
        // past the film, its decoded frames are let go; the canvas keeps the last picture
        onLeave: sleep, onEnterBack: wake,
      },
      onUpdate: () => setTime(tl.time()),
    });
    tl.set({}, {}, total); // the timeline spans the whole film

    layers.forEach((layer, i) => {
      const c = CLIPS[i];
      const o = offsets[i];
      const w = c.weight;

      layer.querySelectorAll<HTMLElement>('.card').forEach((card) => {
        const a = o + parseFloat(card.dataset.in ?? '0') * w;
        const b = o + parseFloat(card.dataset.out ?? '1') * w;
        if (a > o || i > 0) {
          gsap.set(card, { autoAlpha: 0 });
          tl.fromTo(card, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: CARD_FADE, ease: 'power2.out' }, Math.max(0, a));
        }
        tl.to(card, { autoAlpha: 0, y: -18, duration: CARD_FADE, ease: 'power2.in' }, b - CARD_FADE);
      });

      // 1921: the heritage type arrives one line at a time over the manuscripts, then the years count up
      if (c.heritage) {
        const lines = layer.querySelectorAll<HTMLElement>('.heritage-year, .heritage-lines li');
        const span = w * 0.8;
        const step = span / (lines.length + 1);
        gsap.set(lines, { autoAlpha: 0, y: 24 });
        lines.forEach((li, k) => tl.to(li, { autoAlpha: 1, y: 0, duration: step * 0.8, ease: 'power2.out' }, o + 0.1 + k * step));
        const count = { n: 0 };
        tl.to(count, {
          n: yearsSinceFounding(), duration: step * 1.2, ease: 'power1.out',
          onUpdate: () => { if (years) years.textContent = String(Math.round(count.n)); },
        }, o + 0.1 + (lines.length - 1) * step);
        tl.to(layer.querySelector('.heritage'), { autoAlpha: 0, duration: CARD_FADE }, o + w - CARD_FADE);
      }
    });

    setTime(0);

    // The opening frames wait for the first-load veil to lift, so they never compete with the
    // page's own first paint; everything else waits for the first scroll.
    const cancelReady = whenReady(pump);
    const onFirstScroll = () => { started = true; pump(); };
    window.addEventListener('scroll', onFirstScroll, { passive: true, once: true });

    // a hidden tab gives its decoded frames back (phones close tabs that hold too much)
    const onVisibility = () => {
      if (document.hidden) sleep();
      else if (ScrollTrigger.getById('film')?.isActive || window.scrollY < window.innerHeight) wake();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('online', onOnline);

    // turning a phone, or resizing across a threshold, switches to the frame set that fits
    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        const s = pickSet();
        if (s === set) return;
        gen++; set = s;
        releaseDecoded(); decoding.clear(); inFlight = 0;
        blobs.fill(undefined); state.fill(0); tries.fill(0);
        sizeCanvas(); // clears the canvas, so the stage is dark for the moment the new frames take
        dirty = true; pump();
      }, 250);
    };
    window.addEventListener('resize', onResize);

    // arriving on a chapter link (/#leaf, say) goes straight to that chapter
    const hash = window.location.hash.slice(1);
    if (hash && hash !== 'destinations' && hash !== 'enquire') requestAnimationFrame(() => goToChapter(hash, false));

    return () => {
      gen++;
      cancelReady();
      gsap.ticker.remove(tick);
      window.clearTimeout(resizeTimer);
      window.removeEventListener('scroll', onFirstScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('online', onOnline);
      document.removeEventListener('visibilitychange', onVisibility);
      releaseDecoded();
      blobs.fill(undefined);
    };
  }, { scope: root });

  const first = CLIPS[0].frames;
  return (
    <section className="film" id="film" aria-label="The Golden Thread, a film about AVVVS" ref={root}>
      <div className="film-stage">
        <div className="film-screen">
          {/* the film's first frame, in the page's HTML: it is what paints first, and the canvas takes over from the same picture */}
          <picture>
            <source media="(max-width: 819px) and (orientation: portrait)" srcSet={frameUrl('p', first, 0)} width={608} height={1080} />
            <source media="(min-width: 1100px)" srcSet={frameUrl('hd', first, 0)} width={1920} height={1080} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="film-poster" src={frameUrl('d', first, 0)} width={1280} height={720} alt={CLIPS[0].alt} fetchPriority="high" decoding="async" />
          </picture>
          <canvas className="film-canvas" aria-hidden="true" />
          <div className="film-scrim" />
          <div className="film-scrim film-scrim-light" />
        </div>
        {CLIPS.map((clip) => <Layer key={clip.id} clip={clip} />)}
      </div>
    </section>
  );
}

function Layer({ clip }: { clip: Clip }) {
  return (
    <div className={`film-layer${clip.light ? ' film-layer-light' : ''}`} id={chapterId(clip)} data-clip={clip.id}>
      {/* the clip's still: only shown (and only loaded) when the film is laid out as a column, for reduced motion */}
      <div className="film-media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img data-src={frameUrl('d', clip.frames, 0)} width={1280} height={720} alt={clip.alt} loading="lazy" decoding="async" />
      </div>
      <div className="film-cards">
        {clip.cards?.map((c, k) => (
          <div key={k} className={['card', c.variant === 'hero' && 'card-hero', c.variant === 'center' && 'card-center', c.variant === 'right' && 'card-right'].filter(Boolean).join(' ')}
            data-in={c.in} data-out={c.out ?? 1}>
            {c.content}
          </div>
        ))}
        {clip.heritage && <HeritageType />}
      </div>
    </div>
  );
}

const chapterId = (clip: Clip) => ({ forest: 'forest', s03: 'leaf', s05: 'knowledge', s06: 'heritage', thread: 'thread', s09: 'medicine', s11: 'precision' } as Record<string, string>)[clip.id];

// The film keeps only the moment: the year, the family, the years since. The full story is on /our-history.
function HeritageType() {
  return (
    <div className="heritage" role="group" aria-labelledby="heritage-title">
      <h2 id="heritage-title" className="heritage-year"><span>1921</span> <span className="heritage-place">Kozhikode</span></h2>
      <ol className="heritage-lines">
        <li><p>Founded by Kaloor Neelakandan Vaidyar as a pharmacy for the people of Kozhikode, and carried by his family for four generations.</p></li>
        <li className="milestones">
          <span><b className="heritage-years" suppressHydrationWarning>{yearsSinceFounding()}</b> years of AVVVS</span>
          <Link className="heritage-more" href="/our-history">Our history</Link>
        </li>
      </ol>
    </div>
  );
}

const CHAPTER_IDS: Record<string, string> = { 'The forest': 'forest', 'The leaf': 'leaf', 'The manuscripts': 'knowledge', 'Since 1921': 'heritage', 'The formula': 'thread', 'The medicine': 'medicine', 'The standard': 'precision' };

/**
 * Scroll to a chapter of the pinned film by its id (#heritage etc). A plain anchor can't do this:
 * every chapter lives inside the one pinned stage. Returns false when the film isn't on this page.
 */
export function goToChapter(id: string, smooth = true): boolean {
  const st = ScrollTrigger.getById('film');
  const ch = CHAPTERS.find((c) => CHAPTER_IDS[c.label] === id);
  if (!st || !ch) return false;
  window.scrollTo({ top: st.start + (ch.at / total) * (st.end - st.start) + 2, behavior: smooth && !prefersReducedMotion() ? 'smooth' : 'auto' });
  return true;
}
