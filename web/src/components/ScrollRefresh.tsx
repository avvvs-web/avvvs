'use client';

import { useEffect } from 'react';
import { ScrollTrigger, prefersReducedMotion } from '@/lib/gsap';

// Re-measure every scroll scene once images, video and fonts have settled.
// Also marks the page for reduced motion, which turns scenes into stills with their cards beneath.
export function ScrollRefresh() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('no-scrub', prefersReducedMotion());
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    document.fonts?.ready.then(refresh);
    const t = window.setTimeout(refresh, 300);
    return () => { window.removeEventListener('load', refresh); window.clearTimeout(t); root.classList.remove('no-scrub'); };
  }, []);
  return null;
}
