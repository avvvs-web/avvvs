'use client';

import { useEffect } from 'react';
import { whenReady } from '@/lib/ready';
import { animate, createScope, onScroll, splitText, stagger, type ScrollObserver } from 'animejs';
import { ScrollTrigger, prefersReducedMotion } from '@/lib/gsap';

const EASE = 'outExpo';

/**
 * The Manufacturing page's scroll motion, in anime.js. GSAP still pins the factory floor;
 * everything else is here. Without motion (or JS) the page is complete as written.
 *  - headings marked [data-split] rise into place word by word as they arrive
 *  - the opening statement brightens word by word, tied to the scroll
 *  - "300" counts up; the ways to work and the formats arrive in sequence
 *  - the export markets are underlined in gold one after another
 */
export function MfgMotion() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const observers: ScrollObserver[] = [];
    const watch = (o: ScrollObserver) => { observers.push(o); return o; };

    let scope: ReturnType<typeof createScope> | undefined;
    const cancel = whenReady(() => { scope = createScope({ root: '#main' }).add(() => {
      // hero: the title rises on load, the rest follows
      const hero = document.querySelector<HTMLElement>('.m-hero h1');
      if (hero) {
        const { words } = splitText(hero, { words: { wrap: 'clip' } });
        animate(words, { y: ['140%', '0%'], duration: 1200, delay: stagger(70, { start: 150 }), ease: EASE });
        animate('.m-hero .m-lede, .m-hero .m-actions', { opacity: [0, 1], y: [18, 0], duration: 1000, delay: stagger(120, { start: 550 }), ease: EASE });
      }

      // section headings
      document.querySelectorAll<HTMLElement>('#main [data-split]').forEach((h) => {
        const { words } = splitText(h, { words: { wrap: 'clip' } });
        animate(words, {
          y: ['140%', '0%'], duration: 1100, delay: stagger(60), ease: EASE,
          autoplay: watch(onScroll({ target: h, enter: '88% top', leave: '0% bottom', sync: 'play', repeat: false })),
        });
      });

      // the statement reads itself in as you scroll
      const statement = document.querySelector<HTMLElement>('.m-statement');
      if (statement) {
        const { words } = splitText(statement, { words: true });
        animate(words, {
          // starts at 0.5, not fainter: the resting words keep 3:1 against the band (WCAG, large text)
          opacity: [0.5, 1], duration: 400, delay: stagger(90), ease: 'linear',
          autoplay: watch(onScroll({ target: statement, enter: '85% top', leave: '40% bottom', sync: 0.4 })),
        });
      }
      animate('.m-aside', {
        opacity: [0, 1], y: [24, 0], duration: 1000, ease: EASE,
        autoplay: watch(onScroll({ target: '.m-aside', enter: '90% top', leave: '0% bottom', sync: 'play', repeat: false })),
      });

      // more than 300 formulations
      const count = document.querySelector<HTMLElement>('[data-count]');
      if (count) {
        const to = Number(count.dataset.count);
        const n = { v: 0 };
        count.textContent = '0';
        animate(n, {
          v: to, duration: 1800, ease: 'outQuart', modifier: Math.round,
          onUpdate: () => { count.textContent = String(n.v); },
          autoplay: watch(onScroll({ target: count, enter: '85% top', leave: '0% bottom', sync: 'play', repeat: false })),
        });
      }

      // what we can make: each way slides up with its rule drawing across
      animate('.m-ways > div', {
        opacity: [0, 1], y: [36, 0], duration: 1000, delay: stagger(140), ease: EASE,
        autoplay: watch(onScroll({ target: '.m-ways', enter: '85% top', leave: '0% bottom', sync: 'play', repeat: false })),
      });
      animate('.m-ways > div', {
        '--rule': [0, 1], duration: 1200, delay: stagger(140, { start: 150 }), ease: 'inOutQuart',
        autoplay: watch(onScroll({ target: '.m-ways', enter: '85% top', leave: '0% bottom', sync: 'play', repeat: false })),
      });
      animate('.m-formats h3, .m-formats li, .m-formats p', {
        opacity: [0, 1], x: [-18, 0], duration: 900, delay: stagger(80), ease: EASE,
        autoplay: watch(onScroll({ target: '.m-formats', enter: '85% top', leave: '0% bottom', sync: 'play', repeat: false })),
      });

      // the export markets, underlined in gold one by one, in step with the scroll
      animate('.m-country', {
        '--mark': [0, 1], duration: 500, delay: stagger(250), ease: 'inOutQuad',
        autoplay: watch(onScroll({ target: '.m-reach', enter: '75% top', leave: '35% bottom', sync: 0.5 })),
      });

      // narrow screens: the factory floor is a column, so each station opens as it arrives
      if (window.matchMedia('(max-width: 899.98px)').matches) {
        document.querySelectorAll<HTMLElement>('.station').forEach((s) => {
          const img = s.querySelector('img');
          if (img) animate(img, {
            clipPath: ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'], scale: [1.08, 1], duration: 1300, ease: EASE,
            onUpdate: (self) => {
              if (self.progress >= 1) {
                img.style.removeProperty('clip-path');
                img.style.removeProperty('-webkit-clip-path');
              } else if (img.style.clipPath) {
                img.style.setProperty('-webkit-clip-path', img.style.clipPath);
              }
            },
            onComplete: () => {
              img.style.removeProperty('clip-path');
              img.style.removeProperty('-webkit-clip-path');
            },
            autoplay: watch(onScroll({ target: s, enter: '85% top', leave: '0% bottom', sync: 'play', repeat: false })),
          });
          animate(s.querySelectorAll('h3, p'), {
            opacity: [0, 1], y: [20, 0], duration: 900, delay: stagger(100, { start: 250 }), ease: EASE,
            autoplay: watch(onScroll({ target: s, enter: '85% top', leave: '0% bottom', sync: 'play', repeat: false })),
          });
        });
      }
    }); });

    // GSAP's pin adds height above the later sections; re-measure whenever it refreshes
    let live = true;
    const remeasure = () => { if (live) observers.forEach((o) => { if (!o.reverted && o.target?.isConnected) { try { o.refresh(); } catch { /* torn down mid-refresh */ } } }); };
    ScrollTrigger.addEventListener('refresh', remeasure);
    requestAnimationFrame(remeasure);

    return () => { live = false; ScrollTrigger.removeEventListener('refresh', remeasure); cancel(); scope?.revert(); };
  }, []);

  return null;
}
