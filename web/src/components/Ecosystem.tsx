'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ScrollTrigger, useGSAP, prefersReducedMotion } from '@/lib/gsap';
import type { Network } from '@/lib/network';
import { AvvvsMark } from './Logo';

// The reveal: the film's gold thread carries on under the AVVVS mark and drops to the five
// ways to work with us. The Three.js layer loads only as the section approaches.
export function Ecosystem() {
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    const el = root.current!;
    const reduced = prefersReducedMotion();
    let network: Network | null = null;
    let loading = false;
    let cancelled = false; // dev StrictMode runs this twice: the first run must not leave a renderer behind
    const reveal = ScrollTrigger.create({
      trigger: el, start: 'top 75%', end: 'center center', scrub: true,
      onUpdate: (self) => network?.setReveal(self.progress),
      onRefresh: (self) => network?.setReveal(self.progress),
    });
    ScrollTrigger.create({
      trigger: el, start: 'top bottom+=400', end: 'bottom top',
      onToggle: async (self) => {
        if (!network && !loading) {
          loading = true;
          const { startNetwork } = await import('@/lib/network');
          if (cancelled) return;
          network = startNetwork(el, { reduced });
          network.setReveal(reveal.progress);
        }
        network?.setActive(self.isActive);
      },
    });
    return () => { cancelled = true; network?.dispose(); network = null; };
  }, { scope: root });

  return (
    <section className="ecosystem" id="destinations" aria-labelledby="eco-title" ref={root}>
      <canvas className="eco-canvas" aria-hidden="true" />
      <div className="eco-mark">
        <h2 id="eco-title">
          <span className="eco-word"><AvvvsMark height={120} /></span>
          <span className="eco-since">One thread, five ways to work with us</span>
        </h2>
      </div>
      <ul className="eco-list">
        <li className="dest" data-dest="0">
          <h3>AVVVS Manufacturing</h3>
          <p>Classical and proprietary medicines made in our GMP-certified factory, and third-party and white-label production for your brand.</p>
          <Link href="/manufacturing">See the factory floor</Link>
        </li>
        <li className="dest" data-dest="1">
          <h3>AVVVS Ayur Speciality Clinic</h3>
          <p>Specialist outpatient Ayurveda care, from women&apos;s health to lifestyle, skin and hair. Premium centres are run with partners in wellness, leisure and hospitality.</p>
          <a href="https://clinic.avvvs.com/" rel="noopener">Visit the clinic</a>
        </li>
        <li className="dest" data-dest="2">
          <h3>Gloveda Herbals</h3>
          <p>Botanical skin care and hair care from our own range, sold direct.</p>
          <a href="https://glovedaherbals.com/" rel="noopener">See the Gloveda range</a>
        </li>
        <li className="dest" data-dest="3">
          <h3>Gloveda Experience</h3>
          <p>Ayurveda therapies and products for hotel and resort spas.</p>
          <a href="#enquire" data-topic="experience">Bring Gloveda to your spa</a>
        </li>
        <li className="dest" data-dest="4">
          <h3>Gloveda Revive</h3>
          <p>Treatments and products for independent spas and wellness centres.</p>
          <a href="#enquire" data-topic="revive">Partner with Gloveda Revive</a>
        </li>
      </ul>
    </section>
  );
}
