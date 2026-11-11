import type { Metadata, Viewport } from 'next';
import { Manjari } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import { PublicChrome } from '@/components/PublicChrome';
import { JsonLd } from '@/components/JsonLd';
import { ORG, SITE_URL, organizationLd, websiteLd, INDEXABLE } from '@/lib/site';

// Headings: Castle T (URW), self-hosted. Next measures a Times New Roman fallback to match its
// metrics, so nothing shifts while it loads.
const castle = localFont({
  src: [{ path: '../fonts/CastleT.woff2', weight: '400', style: 'normal' }],
  variable: '--font-castle', display: 'swap', fallback: ['Iowan Old Style', 'Palatino Linotype', 'Georgia', 'serif'], adjustFontFallback: 'Times New Roman',
});
const manjari = Manjari({ weight: ['100', '400', '700'], subsets: ['latin', 'malayalam'], variable: '--font-manjari', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Arya Vaidya Vilasini Vaidya Sala (AVVVS) · Ayurveda in Kozhikode since 1921',
    template: '%s · AVVVS',
  },
  description:
    'AVVVS has prepared Ayurveda medicines in Kozhikode, Kerala since 1921. More than 300 classical and proprietary formulations, a GMP-certified factory, and third-party and white-label manufacturing for partner brands.',
  applicationName: 'AVVVS',
  authors: [{ name: ORG.name, url: SITE_URL }],
  creator: ORG.name,
  publisher: ORG.name,
  category: 'Ayurveda',
  formatDetection: { telephone: false, address: false, email: false },
  openGraph: {
    type: 'website', siteName: ORG.name, locale: 'en_IN', url: '/',
    title: 'Arya Vaidya Vilasini Vaidya Sala (AVVVS) · Ayurveda in Kozhikode since 1921',
    description: 'A century of Ayurveda medicine from Kozhikode, Kerala, now made with partners: GMP manufacturing, clinics and Gloveda spa partnerships.',
  },
  twitter: { card: 'summary_large_image', site: '@avvvsglobal' },
  // Search Console and Meta domain verification: the tokens each service gives you, set in the environment
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_META_DOMAIN_VERIFICATION
      ? { 'facebook-domain-verification': process.env.NEXT_PUBLIC_META_DOMAIN_VERIFICATION }
      : undefined,
  },
  robots: INDEXABLE
    ? { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } }
    : { index: false, follow: false },
};

// the site is light only (decided 2026-11-07)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'light',
  themeColor: '#F4EFE5',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${castle.variable} ${manjari.variable}`}>
      {/* browsers and extensions may stamp a style attribute on body before React hydrates */}
      <body suppressHydrationWarning>
        <PublicChrome />
        <noscript><style>{'.loader{display:none}'}</style></noscript>
        {children}
        <JsonLd data={organizationLd()} />
        <JsonLd data={websiteLd()} />
      </body>
    </html>
  );
}
