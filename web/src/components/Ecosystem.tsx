'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ScrollTrigger, useGSAP, prefersReducedMotion } from '@/lib/gsap';
import type { Network } from '@/lib/network';
import { AvvvsLockup, AvvvsMark } from './Logo';

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
      <div className="eco-mark">
        <h2 id="eco-title">
          <span className="eco-word"><AvvvsLockup height={120} /></span>
          <span className="eco-since">Where the thread goes next is up to you</span>
        </h2>
      </div>
      <ul className="eco-list">
        <li className="dest" data-dest="0">
          <AvvvsMark height={56} className="dest-logo" alt="" />
          <h3>Manufacturing Division</h3>
          <p>Classical and proprietary medicines manufactured at our GMP-certified facility, alongside third-party and white-label manufacturing services for your brand.</p>
          <Link href="/manufacturing">See the factory floor</Link>
        </li>
        <li className="dest" data-dest="1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/ayur-specialty-clinics.webp" width={175} height={56} className="dest-logo" alt="" loading="lazy" decoding="async" />
          <h3>AVVVS Ayur Specialty Clinic</h3>
          <p>The first clinical venture under AVVVS, offering specialised care for headaches, chronic pain, obesity, lifestyle disorders, fertility, skin and hair concerns, and maternal health.</p>
          <a href="https://clinic.avvvs.com/" rel="noopener">Visit the clinic</a>
        </li>
        <li className="dest" data-dest="2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/gloveda.webp" width={224} height={56} className="dest-logo" alt="" loading="lazy" decoding="async" />
          <h3>Gloveda Herbals</h3>
          <p>Our Ayurvedic skincare and haircare range, rooted in nature and generations of wisdom.</p>
          <a href="https://glovedaherbals.com/" rel="noopener">See the Gloveda range</a>
        </li>
        <li className="dest" data-dest="3">
          <h3>Gloveda Experience</h3>
          <p>A chain of luxury Ayur-Medi cosmetic clinics bringing over a century of Ayurvedic medical expertise to standalone destinations, five-star properties and high-end Ayurvedic resorts.</p>
          <a href="#enquire" data-topic="experience">Bring Gloveda Experience to your property</a>
        </li>
        <li className="dest" data-dest="4">
          <h3>Gloveda Revive</h3>
          <p>A chain of Ayur-Medi cosmetic clinics combining traditional Ayurvedic care with modern skin and hair treatments, operating as standalone clinics or within established premium Ayurvedic hospitals and treatment centres.</p>
          <a href="#enquire" data-topic="revive">Partner with Gloveda Revive</a>
        </li>
      </ul>
    </section>
  );
}
