'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/*
 * Journal: opening an article from a card carries the card's picture across into the article's
 * cover (a shared-element view transition), so the reader sees where they went. The card's image is
 * named just before the navigation; the article's cover carries the same name in globals.css.
 * Browsers without view transitions, reduced motion, and new-tab clicks all navigate as usual.
 */
type Doc = Document & { startViewTransition?: (update: () => Promise<void> | void) => unknown };

export function SharedCover() {
  const router = useRouter();
  const pathname = usePathname();
  const arrived = useRef<(() => void) | null>(null);

  // the new page is in the document: let the transition take its second picture
  useEffect(() => { arrived.current?.(); arrived.current = null; }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const doc = document as Doc;
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !doc.startViewTransition) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const a = (e.target as Element).closest?.('a[href^="/journal/"]') as HTMLAnchorElement | null;
      const img = a?.closest('.jr-lead, .jr-card')?.querySelector<HTMLImageElement>('.jr-lead-media img, .jr-card-media img');
      if (!a || !img || a.target === '_blank') return;
      e.preventDefault();
      img.style.viewTransitionName = 'jr-cover';
      doc.startViewTransition(() => new Promise<void>((resolve) => {
        const done = () => { img.style.viewTransitionName = ''; resolve(); };
        arrived.current = done;
        window.setTimeout(done, 1500); // never hold the page if the route is slow to arrive
        router.push(a.getAttribute('href')!);
      }));
    };
    // capture: ahead of the link's own handler, which then sees the click as handled
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [router]);

  return null;
}
