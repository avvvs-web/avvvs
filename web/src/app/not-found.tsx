import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'Page not found',
  // noindex here too, so it overrides the site-wide "index, follow" (Next.js adds its own noindex
  // as well); no canonical, so a missing page never claims to be another
  robots: { index: false, follow: true },
};

const ROUTES = [
  { href: '/', title: 'The film', note: 'The Golden Thread, from forest to medicine' },
  { href: '/manufacturing', title: 'Manufacturing', note: 'Third-party and white-label manufacturing' },
  { href: '/our-history', title: 'Our history', note: 'One family in Kozhikode, since 1921' },
  { href: '/#destinations', title: 'Work with us', note: 'Five ways to partner with AVVVS' },
  { href: '/journal', title: 'Journal', note: 'Notes from a century of Ayurveda' },
];

// The golden thread runs in, frays, and stops: this is where it ends. The way back is below.
export default function NotFound() {
  return (
    <>
      <SiteHeader page="other" />
      <main id="main" className="nf">
        <svg className="nf-thread" viewBox="0 0 1200 220" preserveAspectRatio="none" aria-hidden="true">
          <path className="nf-main" d="M-10 150 C 180 150, 260 70, 430 96 S 640 170, 760 118 S 860 84, 905 104" />
          <path className="nf-fray nf-f1" d="M905 104 C 930 114, 948 92, 972 98" />
          <path className="nf-fray nf-f2" d="M905 104 C 926 124, 952 128, 968 146" />
          <path className="nf-fray nf-f3" d="M905 104 C 922 90, 938 72, 960 70" />
          <circle className="nf-bead" cx="905" cy="104" r="7" />
        </svg>

        <div className="nf-copy">
          <p className="nf-kicker">404 · Page not found</p>
          <h1>This thread ends here</h1>
          <p className="nf-lede">The page you were looking for isn&apos;t on this site, or it has moved. Pick the thread up again from one of these.</p>
        </div>

        <ol className="nf-routes">
          {ROUTES.map((r, i) => (
            <li key={r.href}>
              <Link href={r.href}>
                <span className="nf-no" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span className="nf-title">{r.title}</span>
                <span className="nf-note">{r.note}</span>
                <span className="nf-arrow" aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ol>

        <p className="nf-help">Looking for something specific? <a href="#enquire">Ask us</a> and the right team will reply.</p>
      </main>
      <SiteFooter />
    </>
  );
}
