'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Register once, on the client only.
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  // dev only: lets the scroll film be stepped from the console for checks (stripped from production builds)
  if (process.env.NODE_ENV !== 'production') (window as unknown as { __ST: typeof ScrollTrigger }).__ST = ScrollTrigger;
}

export { gsap, ScrollTrigger, useGSAP };

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
