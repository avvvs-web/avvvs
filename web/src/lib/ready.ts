// The first-load loader announces when it lifts, so opening animations play in view rather
// than behind it. Later client-side navigations are already "ready".
export const READY_EVENT = 'avvvs:ready';

declare global { interface Window { __avvvsReady?: boolean } }

/** Runs `fn` once the loader has lifted (at once if it already has). Returns a cancel. */
export function whenReady(fn: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  if (window.__avvvsReady) { fn(); return () => {}; }
  window.addEventListener(READY_EVENT, fn, { once: true });
  return () => window.removeEventListener(READY_EVENT, fn);
}

export function markReady() {
  if (window.__avvvsReady) return;
  window.__avvvsReady = true;
  window.dispatchEvent(new Event(READY_EVENT));
}
