'use client';

import { useEffect, useState } from 'react';
import { OrbWeaving } from '@/components/ui/thinking-orb';
import { markReady } from '@/lib/ready';

const MIN_MS = 450;   // long enough to read as intended, not as a flicker
const MAX_MS = 3500;  // never hold a visitor longer than this, whatever is still loading

/**
 * The first-load veil: ivory, with the weaving orb in thread gold. It is in the server HTML, so it
 * covers the page from the very first paint, and lifts once the fonts and the page's opening
 * picture are in (or after MAX_MS). Client-side navigations never show it again.
 */
export function PageLoader() {
  const [phase, setPhase] = useState<'on' | 'leaving' | 'off'>('on');

  useEffect(() => {
    const start = performance.now();
    let done = false;
    const timers: number[] = [];
    const finish = () => {
      if (done) return;
      done = true;
      timers.push(window.setTimeout(() => {
        setPhase('leaving');
        document.documentElement.classList.remove('is-loading');
        markReady();
        timers.push(window.setTimeout(() => setPhase('off'), 700));
      }, Math.max(0, MIN_MS - (performance.now() - start))));
    };
    // the page's opening picture (marked fetchpriority="high"), decoded and ready to paint
    const hero = document.querySelector<HTMLImageElement>('main img[fetchpriority="high"]');
    const picture = !hero ? Promise.resolve()
      : (hero.complete ? Promise.resolve() : new Promise<void>((r) => { hero.addEventListener('load', () => r(), { once: true }); hero.addEventListener('error', () => r(), { once: true }); }))
        .then(() => hero.decode?.().catch(() => {}));
    Promise.all([document.fonts?.ready ?? Promise.resolve(), picture]).then(finish, finish);
    timers.push(window.setTimeout(finish, MAX_MS));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  if (phase === 'off') return null;
  return (
    <div className={`loader${phase === 'leaving' ? ' is-leaving' : ''}`} aria-hidden="true">
      <div className="loader-inner">
        <OrbWeaving size={148} scale={0.8} speed={0.85} color="#A8853F" surface="light" />
        <p className="loader-name">Arya Vaidya Vilasini Vaidya Sala</p>
        <p className="loader-since">Kozhikode, since 1921</p>
      </div>
    </div>
  );
}
