'use client';

import { useEffect } from 'react';

/**
 * Server Action IDs change with every build, so a form on an admin page that was open across a
 * deploy fails with "Server Action … was not found on the server". When that happens, load the
 * page again (once) so the next try reaches the new build.
 */
export function StaleReload() {
  useEffect(() => {
    const KEY = 'avvvs-admin-stale-reload';
    const stale = (msg: unknown) => /Server Action .* was not found on the server/.test(String(msg ?? ''));
    const reload = () => {
      try { if (sessionStorage.getItem(KEY)) return; sessionStorage.setItem(KEY, '1'); } catch { /* storage blocked: reload anyway */ }
      window.location.reload();
    };
    const onError = (e: ErrorEvent) => { if (stale(e.message) || stale(e.error?.message)) reload(); };
    const onRejection = (e: PromiseRejectionEvent) => { if (stale((e.reason as Error)?.message ?? e.reason)) reload(); };
    // a page that loaded cleanly may reload again next time
    const settled = window.setTimeout(() => { try { sessionStorage.removeItem(KEY); } catch { /* ignore */ } }, 5000);
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => { window.clearTimeout(settled); window.removeEventListener('error', onError); window.removeEventListener('unhandledrejection', onRejection); };
  }, []);
  return null;
}
