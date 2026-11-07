import { CONTACT } from './contact';
import { FOUNDED } from './film';

// The public address of the site. Set NEXT_PUBLIC_SITE_URL when the domain is decided;
// canonical links, the sitemap, social cards and structured data all follow it.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://avvvs.com').replace(/\/$/, '');
export const abs = (path = '/') => `${SITE_URL}${path === '/' ? '' : path}`;

export const ORG = {
  name: 'Arya Vaidya Vilasini Vaidya Sala',
  short: 'AVVVS',
  malayalam: 'ആര്യവൈദ്യ വിലാസിനി വൈദ്യശാല',
  founded: FOUNDED,
  description:
    `Arya Vaidya Vilasini Vaidya Sala (AVVVS) is an Ayurveda institution in Kozhikode, Kerala, founded in ${FOUNDED}. ` +
    'It makes more than 300 classical and proprietary Ayurveda formulations in a GMP-certified factory, and offers third-party, white-label and licence manufacturing, clinic partnerships, and Gloveda spa partnerships.',
};

/** Schema.org Organization: the one entity every page belongs to. */
export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: ORG.name,
    alternateName: [ORG.short, 'AVVVS Kozhikode', ORG.malayalam],
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: abs('/brand/avvvs-since-1921.svg') },
    image: abs('/opengraph-image'),
    description: ORG.description,
    foundingDate: String(FOUNDED),
    foundingLocation: { '@type': 'Place', name: 'Kozhikode, Kerala, India' },
    founder: { '@type': 'Person', name: 'Kaloor Neelakandan Vaidyar', birthDate: '1895', deathDate: '1967' },
    employee: [{ '@type': 'Person', name: 'Dr Manoj Kaloor', jobTitle: 'Managing Director' }],
    address: {
      '@type': 'PostalAddress',
      streetAddress: '60/3829/A, Annie Hall Road, Chalappuram PO',
      addressLocality: 'Kozhikode',
      addressRegion: 'Kerala',
      postalCode: '673002',
      addressCountry: 'IN',
    },
    email: CONTACT.email,
    telephone: CONTACT.phones.map((p) => p.replace(/\s/g, '')),
    contactPoint: [{
      '@type': 'ContactPoint', contactType: 'sales', email: CONTACT.email, telephone: CONTACT.phones[0].replace(/\s/g, ''),
      areaServed: ['IN', 'RU', 'AT', 'SI', 'CO'], availableLanguage: ['English', 'Malayalam'],
    }],
    sameAs: CONTACT.social.map((s) => s.href),
    brand: [
      { '@type': 'Brand', name: 'Gloveda Herbals', url: 'https://glovedaherbals.com/' },
      { '@type': 'Brand', name: 'Gloveda Experience' },
      { '@type': 'Brand', name: 'Gloveda Revive' },
      { '@type': 'Brand', name: 'AVVVS Ayur Speciality Clinic', url: 'https://clinic.avvvs.com/' },
    ],
    knowsAbout: ['Ayurveda', 'Ayurvedic medicine', 'Classical Ayurveda formulations', 'Medicated oils (thailam)',
      'GMP manufacturing', 'Third-party manufacturing', 'White-label manufacturing', 'Ayurveda spa therapies'],
  };
}

export function websiteLd() {
  return {
    '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${SITE_URL}/#website`,
    url: SITE_URL, name: ORG.name, alternateName: ORG.short, inLanguage: 'en-IN',
    publisher: { '@id': `${SITE_URL}/#organization` },
  };
}

export function breadcrumbLd(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/' }, ...trail].map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: abs(t.path) })),
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: items.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };
}
