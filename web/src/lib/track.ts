'use client';

// Thin wrappers over gtag and fbq. Both are no-ops until Analytics.tsx has loaded the tag,
// which only happens after the visitor's consent, so call sites never need to check.

type Gtag = (...args: unknown[]) => void;
type Fbq = ((...args: unknown[]) => void) & { loaded?: boolean };
const w = () => (typeof window === 'undefined' ? undefined : (window as unknown as { gtag?: Gtag; fbq?: Fbq; __avvvsGa?: boolean; __avvvsPixel?: boolean }));

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID?.trim() || '';
export const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || '';

export function trackPageView(path: string) {
  const win = w();
  if (win?.__avvvsGa && win.gtag) win.gtag('event', 'page_view', { page_path: path, page_location: window.location.href, page_title: document.title });
  if (win?.__avvvsPixel && win.fbq) win.fbq('track', 'PageView');
}

/** A partner enquiry was sent: GA4 recommended event generate_lead, Meta standard event Lead. */
export function trackLead(topic: string) {
  const win = w();
  if (win?.__avvvsGa && win.gtag) win.gtag('event', 'generate_lead', { lead_source: 'website_enquiry', topic });
  if (win?.__avvvsPixel && win.fbq) win.fbq('track', 'Lead', { content_category: topic });
}

/** Someone left for the pharmacy, the clinic or the Gloveda site: useful for both platforms. */
export function trackOutbound(dest: 'shop' | 'clinic' | 'gloveda') {
  const win = w();
  if (win?.__avvvsGa && win.gtag) win.gtag('event', 'select_promotion', { promotion_name: dest, creative_slot: 'navbar' });
  if (win?.__avvvsPixel && win.fbq) win.fbq('trackCustom', dest === 'shop' ? 'ShopClick' : dest === 'clinic' ? 'ClinicClick' : 'GlovedaClick');
}
