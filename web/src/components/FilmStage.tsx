'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '@/lib/gsap';
import { CLIPS, FOUNDED, type Clip } from '@/lib/film';

const FADE = 0.2;        // screen-heights over which one layer hands over to the next
const CARD_FADE = 0.18;  // screen-heights for a card to fade in or out
const yearsSinceFounding = () => new Date().getFullYear() - FOUNDED;

const offsets: number[] = [];
let total = 0;
for (const c of CLIPS) { offsets.push(total); total += c.weight; }
const CHAPTERS = CLIPS.map((c, i) => ({ label: c.chapter, at: offsets[i] })).filter((c) => c.label) as { label: string; at: number }[];

/**
 * The whole film in one pinned stage. One scroll timeline drives every clip: each layer fades in
 * over the last frame of the one before (the frames are identical, so the hand-over can't be seen),
 * scrubs its video, and fades its cards in and out. Nothing scrolls in from below between scenes.
 * With reduced motion the film becomes a column of stills with their cards.
 */
export function FilmStage() {
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    const el = root.current!;
    const reduced = prefersReducedMotion();
    const layers = gsap.utils.toArray<HTMLElement>('.film-layer', el);
    const videos = layers.map((l) => l.querySelector('video'));
    const years = el.querySelector<HTMLElement>('.heritage-years');
    if (years) years.textContent = String(yearsSinceFounding());
    if (reduced) return;

    // where each clip's playhead should be (0-1), so a clip that loads late can catch up
    const targets = layers.map(() => 0);
    // Seeks never queue up: while the decoder is still busy with one, only the latest target is
    // kept and applied when it finishes. Phones otherwise fall behind and the scroll stutters.
    const pending = new Map<HTMLVideoElement, number>();
    const seek = (v: HTMLVideoElement, time: number) => {
      if (v.seeking) { pending.set(v, time); return; }
      if (Math.abs(v.currentTime - time) > 0.01) v.currentTime = time;
    };
    const onSeeked = (e: Event) => {
      const v = e.currentTarget as HTMLVideoElement;
      const next = pending.get(v);
      if (next !== undefined) { pending.delete(v); seek(v, next); }
    };
    const seekTo = (k: number) => {
      const v = videos[k];
      if (v && v.duration) seek(v, targets[k] * (v.duration - 0.05));
    };

    // load a clip only when it is near, so the page doesn't pull every video at once
    const loaded = new Set<number>();
    // full-HD clips for large, sharp screens on a good connection; the lighter set everywhere else
    const net = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const hd = window.innerWidth >= 1100 && window.innerWidth * window.devicePixelRatio >= 1700
      && !net?.saveData && !['slow-2g', '2g', '3g'].includes(net?.effectiveType ?? '');
    // a phone held upright only ever sees the centre of the frame: it gets the portrait cut, which
    // is under half the pixels to decode per seek, and sharper there than the cropped 16:9 set
    const portrait = window.innerWidth < 820 && window.innerHeight > window.innerWidth;
    const ensureLoaded = (i: number) => {
      for (let k = Math.max(0, i - 1); k <= Math.min(videos.length - 1, i + 2); k++) {
        const v = videos[k];
        if (!v || loaded.has(k)) continue;
        loaded.add(k);
        v.preload = 'auto';
        v.src = (portrait && v.dataset.srcM) || (hd && v.dataset.srcHd) || v.dataset.src!;
        v.addEventListener('seeked', onSeeked);
        v.load();
        // some mobile browsers only paint seeked frames after one play() call
        v.addEventListener('loadedmetadata', () => seekTo(k), { once: true });
        v.addEventListener('loadeddata', () => { v.play().then(() => { v.pause(); seekTo(k); }).catch(() => {}); }, { once: true });
      }
    };
    ensureLoaded(0);

    let current = -1;
    const setCurrent = (t: number) => {
      let i = 0;
      while (i < offsets.length - 1 && t >= offsets[i + 1] - FADE) i++;
      if (i === current) return;
      current = i;
      ensureLoaded(i);
      const clip = CLIPS[i];
      el.classList.toggle('is-light', !!clip.light);
    };

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        id: 'film', trigger: el, start: 'top top', end: () => `+=${window.innerHeight * total}`,
        pin: el.querySelector('.film-stage'), scrub: 0.5, anticipatePin: 1,
        onUpdate: (self) => setCurrent(self.progress * total),
        onEnterBack: (self) => { current = -1; setCurrent(self.progress * total); },
      },
    });
    tl.set({}, {}, total); // the timeline spans the whole film

    layers.forEach((layer, i) => {
      const clip = CLIPS[i];
      const o = offsets[i];
      const w = clip.weight;
      if (i > 0) {
        gsap.set(layer, { autoAlpha: 0 });
        tl.to(layer, { autoAlpha: 1, duration: FADE }, o - FADE);
      }
      // once the next layer covers this one, stop painting it
      if (i < layers.length - 1) tl.set(layer, { autoAlpha: 0 }, offsets[i + 1] + 0.01);

      const v = videos[i];
      if (v) {
        const play = { t: 0 };
        tl.to(play, {
          t: 1, duration: w * (clip.playShare ?? 1),
          onUpdate: () => {
            targets[i] = play.t;
            if (v.duration) seek(v, play.t * (v.duration - 0.05));
          },
        }, o);
      } else {
        // no clip yet: a slow push on the stand-in still keeps the frame alive
        tl.fromTo(layer.querySelector('img'), { scale: 1 }, { scale: 1.06, duration: w }, o);
      }

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
      if (clip.heritage) {
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

    setCurrent(0);

    // arriving on a chapter link (/#leaf, say) goes straight to that chapter
    const hash = window.location.hash.slice(1);
    if (hash && hash !== 'destinations' && hash !== 'enquire') requestAnimationFrame(() => goToChapter(hash, false));

    // Idle motion: when the visitor pauses, the frame breathes (a slow push in and out). It does
    // not follow the pointer. Every layer moves together, so the frame-matched hand-overs between
    // clips stay invisible. Scrolling settles it straight back.
    const media = layers.map((l) => l.querySelector<HTMLElement>('.film-media')!).filter(Boolean);
    gsap.set(media, { scale: 1.03, transformOrigin: '50% 50%' });
    const breathe = { s: 1.03 };
    let breath: gsap.core.Tween | null = null;
    let idle = 0;
    const filmActive = () => { const st = ScrollTrigger.getById('film'); return !!st && st.isActive; };
    const settle = () => {
      breath?.kill(); breath = null;
      gsap.to(breathe, { s: 1.03, duration: 0.6, ease: 'power2.out', onUpdate: () => { gsap.set(media, { scale: breathe.s }); } });
    };
    const startBreathing = () => {
      if (!filmActive() || breath) return;
      breath = gsap.to(breathe, { s: 1.065, duration: 6, ease: 'sine.inOut', yoyo: true, repeat: -1, onUpdate: () => { gsap.set(media, { scale: breathe.s }); } });
    };
    const onScroll = () => { if (breath) settle(); window.clearTimeout(idle); idle = window.setTimeout(startBreathing, 1100); };
    window.addEventListener('scroll', onScroll, { passive: true });
    idle = window.setTimeout(startBreathing, 2500);

    return () => {
      window.removeEventListener('scroll', onScroll);
      videos.forEach((v) => v?.removeEventListener('seeked', onSeeked));
      window.clearTimeout(idle);
      breath?.kill();
    };
  }, { scope: root });

  return (
    <section className="film" id="film" aria-label="The Golden Thread, a film about AVVVS" ref={root}>
      <div className="film-stage">
        {CLIPS.map((clip, i) => <Layer key={clip.id} clip={clip} first={i === 0} />)}
      </div>
    </section>
  );
}

function Layer({ clip, first }: { clip: Clip; first: boolean }) {
  const cls = ['card', 'card-hero', 'card-center', 'card-right'];
  return (
    <div className={`film-layer${clip.light ? ' film-layer-light' : ''}`} id={chapterId(clip)} data-clip={clip.id}>
      <div className="film-media">
        {clip.video ? (
          // src is set when the clip comes near (data-src); the poster shows until then
          <video data-src={clip.video} data-src-hd={clip.video.includes('/film/') ? clip.video.replace('/film/', '/film/hd/') : undefined}
            data-src-m={clip.video.includes('/film/') ? clip.video.replace('/film/', '/film/m/') : undefined} poster={clip.still} muted playsInline preload="none" role="img" aria-label={clip.alt} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={clip.still} alt={clip.alt} fetchPriority={first ? 'high' : 'low'} loading={first ? 'eager' : 'lazy'} />
        )}
      </div>
      <div className="film-cards">
        {clip.cards?.map((c, k) => (
          <div key={k} className={[cls[0], c.variant === 'hero' && cls[1], c.variant === 'center' && cls[2], c.variant === 'right' && cls[3]].filter(Boolean).join(' ')}
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
    <div className="heritage" aria-labelledby="heritage-title">
      <h2 id="heritage-title" className="heritage-year"><span>1921</span> <span className="heritage-place">Kozhikode</span></h2>
      <ol className="heritage-lines">
        <li><p>Founded by Kaloor Neelakandan Vaidyar as a pharmacy for the people of Kozhikode, and carried by his family for three generations.</p></li>
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
