'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap';
import { whenReady } from '@/lib/ready';

/**
 * A mouse wheel moves a page in jumps of a hundred pixels or so, and everything tied to the scroll
 * (the film most of all) lurches with it. With a mouse or trackpad, this turns those jumps into
 * one continuous glide: the page eases towards where the wheel has asked it to be, every frame.
 * Touch screens already scroll smoothly, so they are left exactly as they are, as is anyone who
 * has asked for reduced motion.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion() || !window.matchMedia('(pointer: fine)').matches) return;
    const lenis = new Lenis({
      lerp: 0.085,           // how much of the remaining distance is covered each frame
      wheelMultiplier: 0.9,
      smoothWheel: true,
      syncTouch: false,      // a touch screen on a laptop keeps its own native scrolling
      // panels that scroll by themselves keep their own wheel
      prevent: (node: HTMLElement) => !!node.closest?.('dialog, .sheet, textarea, select'),
    });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    // nothing scrolls under the first-load veil
    lenis.stop();
    const cancel = whenReady(() => lenis.start());
    return () => {
      cancel();
      gsap.ticker.remove(raf);
      lenis.destroy();
      if (window.__lenis === lenis) delete window.__lenis;
    };
  }, []);
  return null;
}
