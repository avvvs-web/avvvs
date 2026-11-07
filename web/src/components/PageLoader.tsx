'use client';

import { useEffect, useState } from 'react';
import { OrbWeaving } from '@/components/ui/thinking-orb';
import { markReady } from '@/lib/ready';

const MIN_MS = 650;   // long enough to read as intended, not as a flicker
const MAX_MS = 4000;  // never hold a visitor longer than this, whatever is still loading

/**
 * The first-load veil: ivory, with the weaving orb in thread gold. It is in the server HTML, so it
 * covers the page from the very first paint, and lifts once the fonts and the page's critical
 * images are in (or after MAX_MS). Client-side navigations never show it again.
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
        markReady();
        timers.push(window.setTimeout(() => setPhase('off'), 900));
      }, Math.max(0, MIN_MS - (performance.now() - start))));
    };
    const loaded = document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise<void>((r) => window.addEventListener('load', () => r(), { once: true }));
    Promise.all([document.fonts?.ready ?? Promise.resolve(), loaded]).then(finish, finish);
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
