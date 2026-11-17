'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * A link to another page should open that page at its top. Next.js does this itself, but on some
 * phones (Safari on iPhone most of all) a page still gliding from a flick carries its momentum
 * into the next page and runs it to the bottom, and the film's long pinned page makes those
 * flicks big. So after a link (not Back or Forward, which keep their place, and not a link to a
 * #place), the glide is stopped and the page set at its top, until the reader scrolls themselves.
 */
export function ScrollToTop() {
  const path = usePathname();
  const first = useRef(true);
  const popped = useRef(false);

  useEffect(() => {
    const onPop = () => { popped.current = true; };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useLayoutEffect(() => {
    if (first.current) { first.current = false; return; }
    if (popped.current) { popped.current = false; return; }
    if (window.location.hash) return;

    const html = document.documentElement;
    let touched = false;
    const mark = () => { touched = true; };
    const opts = { passive: true, capture: true } as const;
    ['touchstart', 'wheel', 'keydown', 'pointerdown'].forEach((t) => window.addEventListener(t, mark, opts));

    const top = () => {
      if (touched) return;
      if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true, force: true });
      window.scrollTo(0, 0);
    };
    // hiding the overflow for a frame is what stops a touch glide; setting the position alone doesn't
    const overflow = html.style.overflow;
    html.style.overflow = 'hidden';
    top();
    const raf = requestAnimationFrame(() => { html.style.overflow = overflow; top(); });
    // and again once the new page has its height, in case the glide or the film's teardown moved it
    const timers = [120, 400, 900].map((ms) => window.setTimeout(() => { if (window.scrollY > 0) top(); }, ms));
    const done = window.setTimeout(() => ['touchstart', 'wheel', 'keydown', 'pointerdown'].forEach((t) => window.removeEventListener(t, mark, opts)), 1000);

    return () => {
      cancelAnimationFrame(raf); html.style.overflow = overflow;
      timers.forEach(clearTimeout); clearTimeout(done);
      ['touchstart', 'wheel', 'keydown', 'pointerdown'].forEach((t) => window.removeEventListener(t, mark, opts));
    };
  }, [path]);

  return null;
}
