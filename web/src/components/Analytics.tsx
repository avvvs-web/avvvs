'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { CONSENT_EVENT, readConsent, type Consent } from './CookieConsent';
import { GA_ID, PIXEL_ID, trackPageView } from '@/lib/track';

/*
 * Google Analytics 4 and the Meta Pixel, loaded only after consent ("basic" consent mode: no
 * request reaches Google or Meta before the visitor says yes). IDs come from NEXT_PUBLIC_GA_ID
 * and NEXT_PUBLIC_META_PIXEL_ID; with an ID missing, that tag simply never loads.
 * Page views are sent on every route change, since the site navigates without full reloads.
 */

type Win = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  fbq?: ((...args: unknown[]) => void) & { callMethod?: (...a: unknown[]) => void; queue?: unknown[]; loaded?: boolean; version?: string; push?: unknown };
  _fbq?: unknown;
  __avvvsGa?: boolean;
  __avvvsPixel?: boolean;
};

function addScript(src: string) {
  const s = document.createElement('script');
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

function loadGa(win: Win) {
  if (!GA_ID || win.__avvvsGa) return;
  win.dataLayer = win.dataLayer || [];
  // gtag must push the arguments object itself
  // eslint-disable-next-line prefer-rest-params
  win.gtag = function gtag() { win.dataLayer!.push(arguments); };
  win.gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted' });
  win.gtag('js', new Date());
  win.gtag('config', GA_ID, { send_page_view: false, anonymize_ip: true });
  addScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`);
  win.__avvvsGa = true;
}

function loadPixel(win: Win) {
  if (!PIXEL_ID || win.__avvvsPixel) return;
  if (!win.fbq) {
    // Meta's standard bootstrap, unminified: queue calls until fbevents.js arrives
    type Fbq = NonNullable<Win['fbq']>;
    const fbq: Fbq = function queueCall(...args: unknown[]) {
      if (fbq.callMethod) fbq.callMethod(...args); else fbq.queue!.push(args);
    } as Fbq;
    fbq.push = fbq; fbq.loaded = true; fbq.version = '2.0'; fbq.queue = [];
    win.fbq = fbq; win._fbq = fbq;
    addScript('https://connect.facebook.net/en_US/fbevents.js');
  }
  win.fbq!('consent', 'grant');
  win.fbq!('init', PIXEL_ID);
  win.__avvvsPixel = true;
}

function apply(c: Consent | null, path: string) {
  const win = window as Win;
  const before = { ga: !!win.__avvvsGa, px: !!win.__avvvsPixel };
  if (c?.analytics) loadGa(win);
  else if (win.gtag) win.gtag('consent', 'update', { analytics_storage: 'denied' });
  if (win.gtag && win.__avvvsGa) {
    const ads = c?.marketing ? 'granted' : 'denied';
    win.gtag('consent', 'update', { analytics_storage: c?.analytics ? 'granted' : 'denied', ad_storage: ads, ad_user_data: ads, ad_personalization: ads });
  }
  if (c?.marketing) loadPixel(win);
  else if (win.fbq) win.fbq('consent', 'revoke');
  // a tag that has just loaded counts the page the visitor is on
  if ((!before.ga && win.__avvvsGa) || (!before.px && win.__avvvsPixel)) trackPageView(path);
}

export function Analytics() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    apply(readConsent(), window.location.pathname);
    const onConsent = (e: Event) => apply((e as CustomEvent<Consent>).detail, window.location.pathname);
    window.addEventListener(CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(CONSENT_EVENT, onConsent);
  }, []);

  useEffect(() => {
    if (first.current) { first.current = false; return; } // the initial view is counted when the tags load
    trackPageView(pathname);
  }, [pathname]);

  return null;
}
