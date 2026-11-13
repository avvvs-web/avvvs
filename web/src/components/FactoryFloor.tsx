'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap';

export interface Station { img: string; w: number; h: number; alt: string; title: string; text: string }

// AVVVS's own factory photographs from avvvs.com, warm-graded (approved 2026-11-07).
// Each line restates what avvvs.com says about the factory.
export const STATIONS: Station[] = [
  { img: 'raw-store', w: 1536, h: 1024, alt: 'Sacks of raw material on pallets and tied stacks of cartons in the factory\'s store shed.', title: 'Raw materials',
    text: 'Herbs are sourced and stored before they reach the floor. AVVVS also keeps herbal gardens around its manufacturing units, for raw material and to conserve biodiversity.' },
  { img: 'vessels-hall', w: 1446, h: 1087, alt: 'A row of large round steel vessels with lids, on steel legs, in a bright traditional preparation hall.', title: 'Traditional preparation',
    text: 'Classical preparations are made in traditional mechanised units, run by trained and experienced staff.' },
  { img: 'process-tanks', w: 1536, h: 1024, alt: 'Two jacketed stainless steel process tanks with stirrer motors, a service stair and control panels.', title: 'Modern processing',
    text: 'Modern machinery stands alongside the traditional units.' },
  { img: 'ointment-filling', w: 1415, h: 1112, alt: 'A worker in a cap, mask and gloves at an ointment filling machine fed from a steel hopper, beside a large steel mixing tank.', title: 'Ointments',
    text: 'Ointments are manufactured and filled in-house.' },
  { img: 'capsule-filler', w: 1024, h: 1536, alt: 'A capsule filling machine: a steel dosing head with glass panels over a ring plate drilled with rows of capsule holes.', title: 'Capsules',
    text: 'Formulations are filled into capsules on our own capsulation machinery.' },
  { img: 'blister', w: 1300, h: 1010, alt: 'A worker at a blister packing machine as filled strips run down the chute into a crate.', title: 'Blister packing',
    text: 'Capsules are sealed into blister strips on the line.' },
  { img: 'capseal', w: 1300, h: 867, alt: 'White bottles moving under a cap sealing machine on a conveyor.', title: 'Sealing',
    text: 'Bottles are capped and sealed before packing.' },
  { img: 'stores', w: 1300, h: 867, alt: 'Finished goods store with shelving and stacked, labelled cartons.', title: 'Stores and dispatch',
    text: 'Packed stock waits in the stores, then ships across India and abroad.' },
];

// The page's one authored moment: on wide screens the floor pins and walks sideways while the
// gold thread fills; on narrow screens it is a column with the thread down its left edge.
export function FactoryFloor() {
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    const el = root.current!;
    const wrap = el.querySelector<HTMLElement>('.m-track-wrap')!;
    const track = el.querySelector<HTMLElement>('.m-track')!;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', () => {
      const distance = () => Math.max(0, track.scrollWidth - wrap.clientWidth);
      gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: el, start: 'top top', end: () => `+=${distance()}`, pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true },
      })
        .to(track, { x: () => -distance() }, 0)
        .fromTo('.m-thread-fill', { scaleX: 0 }, { scaleX: 1 }, 0);
    });
    mm.add('(max-width: 899.98px)', () => {
      gsap.fromTo('.m-thread-fill', { scaleY: 0 }, {
        scaleY: 1, ease: 'none', scrollTrigger: { trigger: track, start: 'top 70%', end: 'bottom 70%', scrub: 0.4 },
      });
    });
  }, { scope: root });

  return (
    <section className="m-line" id="line" aria-labelledby="line-title" ref={root}>
      <div className="m-line-head">
        <h2 id="line-title" data-split>The factory floor</h2>
        <p>From raw herbs to packed stock, in one factory on the edge of the city.</p>
      </div>
      <div className="m-track-wrap">
        <span className="m-thread" aria-hidden="true"><span className="m-thread-fill" /></span>
        <ol className="m-track">
          {STATIONS.map((s) => (
            <li className="station" key={s.img}>
              <Image src={`/media/factory/${s.img}.jpg`} width={s.w} height={s.h} alt={s.alt} sizes="(min-width: 900px) 40vw, 100vw" />
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
