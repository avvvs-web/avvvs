'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { PageLoader } from './PageLoader';
import { CookieConsent } from './CookieConsent';
import { Analytics } from './Analytics';
import { EnquiryPanel } from './EnquiryForm';
import { SmoothScroll } from './SmoothScroll';
import { SharedCover } from './SharedCover';
import { markReady } from '@/lib/ready';

/**
 * The public site's extras: the first-load loader, the enquiry panel, the cookie banner and the
 * consent-gated analytics. None of them belong in the Journal admin, which is private and
 * untracked; there the loader's scroll lock is simply lifted.
 */
export function PublicChrome() {
  const admin = usePathname()?.startsWith('/admin');
  useEffect(() => {
    if (!admin) return;
    document.documentElement.classList.remove('is-loading');
    markReady();
  }, [admin]);
  if (admin) return null;
  return (
    <>
      <PageLoader />
      <SmoothScroll />
      <SharedCover />
      <EnquiryPanel />
      <CookieConsent />
      <Analytics />
    </>
  );
}
