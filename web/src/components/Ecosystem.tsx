'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ScrollTrigger, useGSAP, prefersReducedMotion } from '@/lib/gsap';
import type { Network } from '@/lib/network';
import { AvvvsMark } from './Logo';

// The reveal: the film's gold thread carries on under the AVVVS logo and drops to the five
// ways to work with us. The Three.js layer loads only as the section approaches.
export function Ecosystem() {
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    const el = root.current!;
    const reduced = prefersReducedMotion();
    let network: Network | null = null;
    let loading = false;
    let cancelled = false; // dev StrictMode runs this twice: the first run must not leave a renderer behind
    let active = false;

    const reveal = ScrollTrigger.create({
      trigger: el, start: 'top 75%', end: 'center center', scrub: true,
      onUpdate: (self) => network?.setReveal(self.progress),
      onRefresh: (self) => network?.setReveal(self.progress),
    });

    const init = async (isActive: boolean) => {
      active = isActive;
      if (!network && !loading && active) {
        loading = true;
        try {
          const { startNetwork } = await import('@/lib/network');
          if (cancelled) return;
          network = startNetwork(el, { reduced });
          network.setReveal(reveal.progress);
          network.setActive(active);
        } catch {
          // chunk load failure fallback
        } finally {
          loading = false;
        }
      } else {
        network?.setActive(active);
      }
    };

    ScrollTrigger.create({
      trigger: el, start: 'top bottom+=400', end: 'bottom top',
      onToggle: (self) => init(self.isActive),
      onRefresh: (self) => init(self.isActive),
    });

    // If section is already in or near viewport on initial mount:
    const r = el.getBoundingClientRect();
    if (r.top <= window.innerHeight + 400 && r.bottom >= 0) {
      init(true);
    }

    return () => { cancelled = true; network?.dispose(); network = null; };
  }, { scope: root });

  return (
    <section className="ecosystem" id="destinations" aria-labelledby="eco-title" ref={root}>
      <canvas className="eco-canvas" aria-hidden="true" />
      {/* the mark and this line are the film's closing card now (lib/film.tsx); the heading stays for screen readers */}
      <h2 id="eco-title" className="sr-only">Where the thread goes next is up to you</h2>
      <ul className="eco-list">
        <li className="dest" data-dest="0">
          <Link href="/manufacturing" className="dest-logo-link" tabIndex={-1} aria-hidden="true"><AvvvsMark height={56} className="dest-logo" alt="" /></Link>
          <h3>Manufacturing Division</h3>
          <p>Classical and proprietary medicines manufactured at our GMP-certified facility, alongside third-party and white-label manufacturing services for your brand.</p>
          <Link href="/manufacturing">See the factory floor</Link>
        </li>
        <li className="dest" data-dest="1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <a href="https://clinic.avvvs.com/" rel="noopener" className="dest-logo-link" tabIndex={-1} aria-hidden="true"><img src="/brand/ayur-specialty-clinics.webp" width={175} height={56} className="dest-logo" alt="" loading="lazy" decoding="async" /></a>
          <h3>AVVVS Ayur Specialty Clinic</h3>
          <p>The first clinical venture under AVVVS, offering specialised care for headaches, chronic pain, obesity, lifestyle disorders, fertility, skin and hair concerns, and maternal health.</p>
          <a href="https://clinic.avvvs.com/" rel="noopener">Visit the clinic</a>
        </li>
        <li className="dest" data-dest="2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <a href="https://glovedaherbals.com/" rel="noopener" className="dest-logo-link" tabIndex={-1} aria-hidden="true"><img src="/brand/gloveda.webp" width={224} height={56} className="dest-logo" alt="" loading="lazy" decoding="async" /></a>
          <h3>Gloveda Herbals</h3>
          <p>Our Ayurvedic skincare and haircare range, rooted in nature and generations of wisdom.</p>
          <a href="https://glovedaherbals.com/" rel="noopener">See the Gloveda range</a>
        </li>
        <li className="dest" data-dest="3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <a href="https://glovedaexperience.com/" rel="noopener" className="dest-logo-link" tabIndex={-1} aria-hidden="true"><img src="/brand/gloveda-experience.webp" width={167} height={76} className="dest-logo dest-logo-tall" alt="" loading="lazy" decoding="async" /></a>
          <h3>Gloveda Experience</h3>
          <p>A chain of luxury Ayur-Medi cosmetic clinics bringing over a century of Ayurvedic medical expertise to standalone destinations, five-star properties and high-end Ayurvedic resorts.</p>
          <a href="https://glovedaexperience.com/" rel="noopener">Visit Gloveda Experience</a>
          <a href="#enquire" data-topic="experience">Bring Gloveda Experience to your property</a>
        </li>
        <li className="dest" data-dest="4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <a href="#enquire" data-topic="revive" className="dest-logo-link" tabIndex={-1} aria-hidden="true"><img src="/brand/gloveda-revive.webp" width={118} height={76} className="dest-logo dest-logo-tall" alt="" loading="lazy" decoding="async" /></a>
          <h3>Gloveda Revive</h3>
          <p>A chain of Ayur-Medi cosmetic clinics combining traditional Ayurvedic care with modern skin and hair treatments, operating as standalone clinics or within established premium Ayurvedic hospitals and treatment centres.</p>
          <a href="#enquire" data-topic="revive">Partner with Gloveda Revive</a>
        </li>
      </ul>
    </section>
  );
}
