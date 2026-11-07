'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { Crumbs } from './Crumbs';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap';

export function MfgHero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    // the photograph opens downward onto the floor
    gsap.fromTo('.m-hero-media img',
      { clipPath: 'inset(0 0 100% 0)', scale: 1.08 },
      { clipPath: 'inset(0 0 0% 0)', scale: 1, duration: 1.6, ease: 'expo.out', delay: 0.1 });
  }, { scope: root });

  return (
    <section className="m-hero" aria-labelledby="m-title" ref={root}>
      <div className="m-hero-copy">
        <Crumbs trail={[{ name: 'Manufacturing' }]} />
        <h1 id="m-title">AVVVS Manufacturing</h1>
        <p className="m-lede">Classical and proprietary Ayurveda medicines, made in our GMP-certified factory in Kozhikode. Now made for your brand, too.</p>
        <div className="m-actions">
          <a className="btn" href="#enquire" data-topic="manufacturing">Discuss manufacturing</a>
          <a className="m-more" href="#line">Walk the factory floor</a>
        </div>
      </div>
      <figure className="m-hero-media">
        <Image src="/media/factory/vessel.jpg" width={1300} height={1662} priority sizes="(min-width: 900px) 45vw, 100vw"
          alt="A worker stirs a wide steel preparation vessel in one of AVVVS's traditional mechanised units, with more vessels behind her." />
        <figcaption>A preparation vessel in one of the traditional mechanised units.</figcaption>
      </figure>
    </section>
  );
}
