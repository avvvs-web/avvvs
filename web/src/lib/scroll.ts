// The site's smooth scrolling (components/SmoothScroll.tsx) owns the scroll position while it is
// running, so anything that moves the page from code goes through here.

type LenisLike = {
  scrollTo: (target: number, options?: { immediate?: boolean; duration?: number; force?: boolean }) => void;
  stop: () => void;
  start: () => void;
};
declare global { interface Window { __lenis?: LenisLike } }

/** Scroll the page to `top` pixels, gliding there unless `smooth` is false. */
export function scrollPageTo(top: number, smooth = true) {
  if (typeof window === 'undefined') return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (window.__lenis) window.__lenis.scrollTo(top, { immediate: !smooth || reduced, duration: 1.4, force: true });
  else window.scrollTo({ top, behavior: smooth && !reduced ? 'smooth' : 'auto' });
}

/** Hold or release page scrolling (the menu sheet, for one, holds it while open). */
export function holdPageScroll(hold: boolean) {
  if (typeof window === 'undefined' || !window.__lenis) return;
  if (hold) window.__lenis.stop(); else window.__lenis.start();
}
