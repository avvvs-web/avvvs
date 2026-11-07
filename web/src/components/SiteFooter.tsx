'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AvvvsLockup } from './Logo';
import { CookieSettingsLink } from './CookieConsent';
import { CONTACT } from '@/lib/contact';
import { FOUNDED } from '@/lib/film';

// The pages are prerendered, so the year is corrected in the browser and never goes stale.
function useYear() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  useEffect(() => setYear(new Date().getFullYear()), []);
  return year;
}

/** The thread comes to rest here: a gold line that ends in a bead above the lockup. */
export function SiteFooter() {
  const year = useYear();
  return (
    <footer className="foot">
      <span className="foot-thread" aria-hidden="true" />

      <div className="foot-grid">
        <div className="foot-brand">
          <AvvvsLockup height={56} className="foot-lockup" />
          <p className="ml" lang="ml">ആര്യവൈദ്യ വിലാസിനി വൈദ്യശാല</p>
          <p className="foot-line">Ayurveda medicines, made in Kozhikode since {FOUNDED}.</p>
        </div>

        <div className="foot-col">
          <h2 className="foot-h">Visit</h2>
          <address>{CONTACT.address.map((l) => <span key={l}>{l}</span>)}</address>
        </div>

        <div className="foot-col">
          <h2 className="foot-h">Write or call</h2>
          <ul>
            <li><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
            {CONTACT.phones.map((p) => <li key={p}><a href={`tel:${p.replace(/\s/g, '')}`}>{p}</a></li>)}
          </ul>
        </div>

        <nav className="foot-col" aria-label="Footer">
          <h2 className="foot-h">Work with us</h2>
          <ul>
            <li><Link href="/our-history">Our history</Link></li>
            <li><Link href="/manufacturing">AVVVS Manufacturing</Link></li>
            <li><a href={CONTACT.clinic} rel="noopener">Ayur Speciality Clinic</a></li>
            <li><a href={CONTACT.shop} rel="noopener">Shop</a></li>
            <li><a href="https://glovedaherbals.com/" rel="noopener">Gloveda Herbals</a></li>
            <li><a href="#enquire">Partner enquiry</a></li>
          </ul>
        </nav>
      </div>

      <div className="foot-base">
        <p suppressHydrationWarning>© {year} Arya Vaidya Vilasini Vaidya Sala</p>
        <ul className="foot-legal" aria-label="Legal">
          <li><Link href="/privacy">Privacy</Link></li>
          <li><Link href="/terms">Terms</Link></li>
          <li><CookieSettingsLink label="Cookie settings" /></li>
        </ul>
        <ul className="foot-social" aria-label="AVVVS elsewhere">
          {CONTACT.social.map((s) => <li key={s.label}><a href={s.href} rel="noopener">{s.label}</a></li>)}
        </ul>
        <a className="foot-top" href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          Back to the start <span aria-hidden="true">↑</span>
        </a>
      </div>
    </footer>
  );
}
