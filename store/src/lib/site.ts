// The store's fixed facts: who AVVVS is, how to reach them, and how the catalogue is arranged.
// Contact details are copied from web/src/lib/contact.ts; change both together.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://shop.avvvs.com').replace(/\/$/, '');
export const abs = (path = '/') => `${SITE_URL}${path === '/' ? '' : path}`;
export const MAIN_SITE = 'https://avvvs.com';

export const CONTACT = {
  email: 'mail@avvvs.com',
  phones: ['+91 80892 02091', '+91 90375 14016'],
  address: ['AVVVS Ayur Speciality Clinic', '60/3829/A, Annie Hall Road', 'Chalappuram PO, Kozhikode 673002', 'Kerala, India'],
  city: 'Kozhikode, Kerala, India',
  clinic: 'https://clinic.avvvs.com/',
  gloveda: 'https://glovedaherbals.com/',
  // WhatsApp number for order help, digits only with country code. Falls back to the first phone.
  whatsapp: (process.env.NEXT_PUBLIC_WHATSAPP || '918089202091').replace(/\D/g, ''),
  social: [
    { label: 'Facebook', href: 'https://www.facebook.com/aryavaidyavilasini' },
    { label: 'Instagram', href: 'https://www.instagram.com/avvvsglobal/' },
    { label: 'X', href: 'https://www.twitter.com/avvvsglobal' },
  ],
} as const;

export const ORG = {
  name: 'Arya Vaidya Vilasini Vaidya Sala',
  short: 'AVVVS',
  malayalam: 'ആര്യവൈദ്യ വിലാസിനി വൈദ്യശാല',
  founded: 1921,
};

/**
 * Dosage forms, as Shopify's product types. `type` must match the product type in Shopify exactly.
 * The notes describe the form itself, not what any medicine treats.
 */
export const FORMS = [
  { slug: 'kashayam', type: 'KASHAYAM', name: 'Kashayam', ml: 'കഷായം', note: 'Herbal decoctions' },
  { slug: 'arishtam', type: 'ARISHTAM', name: 'Arishtam & Asavam', ml: 'അരിഷ്ടം', note: 'Naturally fermented tonics' },
  { slug: 'thailam', type: 'THAILAM', name: 'Thailam', ml: 'തൈലം', note: 'Medicated oils' },
  { slug: 'choornam', type: 'CHOORNAM', name: 'Choornam', ml: 'ചൂർണ്ണം', note: 'Herbal powders' },
  { slug: 'lehyam', type: 'LEHYAM', name: 'Lehyam', ml: 'ലേഹ്യം', note: 'Herbal jams' },
  { slug: 'ghritham', type: 'GHRITHAM', name: 'Ghritham', ml: 'ഘൃതം', note: 'Medicated ghee' },
  { slug: 'capsule', type: 'CAPSULE', name: 'Capsules', ml: 'ക്യാപ്സ്യൂൾ', note: 'Measured doses' },
  { slug: 'syrup', type: 'SYRUP', name: 'Syrups', ml: 'സിറപ്പ്', note: 'Herbal syrups' },
  { slug: 'liniment', type: 'LINIMENT', name: 'Liniments', ml: 'ലിനിമെന്റ്', note: 'For external use' },
  { slug: 'proprietary', type: 'PROPRIETARY', name: 'Proprietary', ml: '', note: 'AVVVS formulations' },
] as const;
export type Form = (typeof FORMS)[number];
export const formByType = (t?: string | null) => FORMS.find((f) => f.type === (t || '').toUpperCase());

/** The three collections that already exist in Shopify. */
export const COLLECTIONS = [
  { handle: 'classical', name: 'Classical medicines', note: 'Formulations from the classical Ayurveda texts' },
  { handle: 'proprietary', name: 'Proprietary', note: 'Medicines developed by AVVVS' },
  { handle: 'cosmetics', name: 'Cosmetics & care', note: 'Herbal skin and hair care' },
] as const;

/**
 * Shop by concern, grouped like hospital departments. Each is a Shopify smart collection with the
 * handle `concern-<slug>`, filled by the product tag of the same name. AVVVS's pharmacists decide
 * which medicines belong where; the store only shows what Shopify says.
 */
export const CONCERNS = [
  { slug: 'pain-management', name: 'Pain management', note: 'Joints, back and muscles' },
  { slug: 'digestive-health', name: 'Digestive health', note: 'Digestion, appetite and the gut' },
  { slug: 'respiratory', name: 'Respiratory care', note: 'Cough, cold and breathing' },
  { slug: 'skin-and-hair', name: 'Skin & hair', note: 'Skin, scalp and hair' },
  { slug: 'womens-health', name: "Women's health", note: 'Through every stage of life' },
  { slug: 'childrens-health', name: "Children's health", note: 'Gentle care for the young' },
  { slug: 'fever-and-immunity', name: 'Fever & immunity', note: 'Seasonal care and resilience' },
  { slug: 'diabetes-and-metabolic', name: 'Diabetes & metabolic', note: 'Sugar, weight and metabolism' },
  { slug: 'heart-and-circulation', name: 'Heart & circulation', note: 'Heart, blood and circulation' },
  { slug: 'liver-and-kidney', name: 'Liver & kidney', note: 'Liver, kidney and urinary care' },
  { slug: 'mind-sleep-nerves', name: 'Mind, sleep & nerves', note: 'Calm, sleep and the nervous system' },
  { slug: 'rejuvenation', name: 'Rejuvenation (Rasayana)', note: 'General wellness and vitality' },
] as const;
export type Concern = (typeof CONCERNS)[number];
export const CONCERN_PREFIX = 'concern-';
export const concernBySlug = (slug: string) => CONCERNS.find((c) => c.slug === slug);

/** Shopify Pages that already exist on the store, shown in the footer. */
export const HELP_PAGES = [
  { handle: 'shipping', label: 'Shipping' },
  { handle: 'return-policy', label: 'Returns & refunds' },
  { handle: 'payments', label: 'Payments' },
  { handle: 'faqs', label: 'FAQs' },
  { handle: 'tracking', label: 'Track an order' },
  { handle: 'contact', label: 'Contact' },
] as const;
export const LEGAL_PAGES = [
  { handle: 'privacy-policy', label: 'Privacy' },
  { handle: 'term-of-use', label: 'Terms of use' },
] as const;

export const FREE_SHIPPING = Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD || 0) || 0;

export function breadcrumbLd(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Store', path: '/' }, ...trail].map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: abs(t.path) })),
  };
}

export function organizationLd() {
  return {
    '@context': 'https://schema.org', '@type': ['Organization', 'Pharmacy'],
    '@id': `${MAIN_SITE}/#organization`, name: ORG.name, alternateName: [ORG.short, ORG.malayalam],
    url: SITE_URL, logo: abs('/brand/avvvs-since-1921.svg'), foundingDate: String(ORG.founded),
    email: CONTACT.email, telephone: CONTACT.phones[0].replace(/\s/g, ''),
    address: { '@type': 'PostalAddress', streetAddress: '60/3829/A, Annie Hall Road, Chalappuram PO', addressLocality: 'Kozhikode', addressRegion: 'Kerala', postalCode: '673002', addressCountry: 'IN' },
    sameAs: CONTACT.social.map((s) => s.href),
  };
}
