'use client';

import { useEffect, useState } from 'react';
import { animate, createScope, onScroll, splitText, stagger } from 'animejs';
import { prefersReducedMotion } from '@/lib/gsap';
import { FOUNDED } from '@/lib/film';
import { whenReady } from '@/lib/ready';

/** The years since 1921, correct on the day the page is read (the page itself is prerendered). */
export function YearsSince() {
  const [n, setN] = useState(() => new Date().getFullYear() - FOUNDED);
  useEffect(() => setN(new Date().getFullYear() - FOUNDED), []);
  return <span suppressHydrationWarning>{n}</span>;
}

const EASE = 'outExpo';

/**
 * Motion for /our-history, in anime.js: headings rise word by word, the thread down the timeline
 * fills with the scroll and lights each entry's bead, entries arrive as they come into view, and
 * the years count up. Without motion (or JS) the page is complete as written.
 */
export function HeritageMotion() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let scope: ReturnType<typeof createScope> | undefined;
    const cancel = whenReady(() => { scope = createScope({ root: '#main' }).add(() => {
      document.querySelectorAll<HTMLElement>('#main [data-split]').forEach((h, i) => {
        const { words } = splitText(h, { words: { wrap: 'clip' } });
        animate(words, {
          y: ['140%', '0%'], duration: 1200, delay: stagger(70, { start: i === 0 ? 150 : 0 }), ease: EASE,
          autoplay: i === 0 ? true : onScroll({ target: h, enter: '88% top', repeat: false }),
        });
      });
      document.querySelectorAll<HTMLElement>('#main [data-reveal]').forEach((el) => {
        animate(el, {
          opacity: [0, 1], y: [28, 0], duration: 1100, ease: EASE,
          autoplay: onScroll({ target: el, enter: '88% top', repeat: false }),
        });
      });
      animate('.hp-hero-media img', { clipPath: ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'], scale: [1.08, 1], duration: 1600, delay: 200, ease: EASE });

      // the thread fills as the timeline is read; each bead lights as the fill reaches it
      const line = document.querySelector<HTMLElement>('.hp-timeline');
      const fill = line?.querySelector<HTMLElement>('.hp-thread span');
      const entries = [...document.querySelectorAll<HTMLElement>('.hp-entry')];
      if (line && fill) {
        const p = { v: 0 };
        animate(p, {
          v: 1, duration: 1000, ease: 'linear',
          onUpdate: () => {
            fill.style.transform = `scaleY(${p.v})`;
            const reach = line.getBoundingClientRect().top + p.v * line.offsetHeight;
            entries.forEach((e) => e.classList.toggle('is-lit', e.getBoundingClientRect().top + 14 <= reach + 1));
          },
          autoplay: onScroll({ target: line, enter: '70% top', leave: '70% bottom', sync: 0.4 }),
        });
      }

      const big = document.querySelector<HTMLElement>('[data-count-years] span');
      if (big) {
        const to = Number(big.textContent);
        const n = { v: 0 };
        big.textContent = '0';
        animate(n, {
          v: to, duration: 2000, ease: 'outQuart', modifier: Math.round,
          onUpdate: () => { big.textContent = String(n.v); },
          autoplay: onScroll({ target: '.hp-count', enter: '80% top', repeat: false }),
        });
      }
    }); });
    return () => { cancel(); scope?.revert(); };
  }, []);
  return null;
}
