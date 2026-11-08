'use client';

import { useEffect } from 'react';
import { ScrollTrigger, prefersReducedMotion } from '@/lib/gsap';

// Re-measure every scroll scene once images, video and fonts have settled.
// Also marks the page for reduced motion, which turns scenes into stills with their cards beneath.
export function ScrollRefresh() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('no-scrub', prefersReducedMotion());
    // One re-measure once the page and its fonts have both settled. (ScrollTrigger already
    // measures on load; refreshing three times over forced repeated layout.)
    let live = true;
    const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise<void>((r) => window.addEventListener('load', () => r(), { once: true }));
    Promise.all([document.fonts?.ready ?? Promise.resolve(), loaded]).then(() => { if (live) ScrollTrigger.refresh(); });
    return () => { live = false; root.classList.remove('no-scrub'); };
  }, []);
  return null;
}
