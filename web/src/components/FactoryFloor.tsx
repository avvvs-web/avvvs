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
  { img: 'preparation-vessel', w: 1109, h: 1418, alt: 'Two workers in dark uniforms, masks and gloves at a large round steel vessel in the preparation hall; one stirs the amber liquid in it with a long rod.', title: 'Traditional preparation',
    text: 'Classical preparations are made in traditional mechanised units, run by trained and experienced staff.' },
  { img: 'process-tanks', w: 1536, h: 1024, alt: 'Two jacketed stainless steel process tanks with stirrer motors, a service stair and control panels.', title: 'Modern processing',
    text: 'Modern machinery stands alongside the traditional units.' },
  { img: 'ointment-filling', w: 1415, h: 1112, alt: 'A worker in a cap, mask and gloves at an ointment filling machine fed from a steel hopper, beside a large steel mixing tank.', title: 'Ointments',
    text: 'Ointments are manufactured and filled in-house.' },
  { img: 'capsule-filler', w: 1024, h: 1536, alt: 'A capsule filling machine: a steel dosing head with glass panels over a ring plate drilled with rows of capsule holes.', title: 'Capsules',
    text: 'Formulations are filled into capsules on our own capsulation machinery.' },
  { img: 'blister-packing', w: 1423, h: 1105, alt: 'A worker in a mask at a blister packing machine as strips of pink capsules run down the conveyor into a crate.', title: 'Blister packing',
    text: 'Capsules are sealed into blister strips on the line.' },
  { img: 'cap-sealing', w: 1536, h: 1024, alt: 'White capped bottles on a conveyor, between guide rails, running into an induction cap sealing machine.', title: 'Sealing',
    text: 'Bottles are capped and sealed before packing.' },
  { img: 'stores-mezzanine', w: 1536, h: 1024, alt: 'A stores hall with steel shelving and a mezzanine, black stairs, and cardboard cartons stacked on the shelves and the floor.', title: 'Stores and dispatch',
    text: 'Packed stock waits in the stores, then ships across India and abroad.' },
];

// The page's one authored moment: on wide screens the floor pins and walks sideways while the
// gold thread fills, and a sideways swipe (touch or pen) or sideways wheel moves it too, as if the
// page were scrolled; on narrow screens it is a row to swipe, snapping station to station, with
// the thread filling along its top as it goes.
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
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: el, start: 'top top', end: () => `+=${distance()}`, pin: true, scrub: 0.6, invalidateOnRefresh: true },
      })
        .to(track, { x: () => -distance() }, 0)
        .fromTo('.m-thread-fill', { scaleX: 0 }, { scaleX: 1 }, 0);
      const st = tl.scrollTrigger!;

      // Sideways gestures move the pinned floor by moving the page: the track's travel is the page's
      // scroll, one pixel for one. They only count while the floor is pinned, so a swipe never
      // drags the page along before the floor has arrived.
      // pinned, or at either end of it (GSAP calls it inactive at exactly 0 and 1); at the start only
      // forward moves count, at the end only backward ones, so the page is never dragged out of it
      const pinned = () => window.scrollY >= st.start - 2 && window.scrollY <= st.end + 2;
      const allowed = (dx: number) => pinned() && !(window.scrollY <= st.start + 1 && dx < 0) && !(window.scrollY >= st.end - 1 && dx > 0);
      const move = (dx: number) => {
        if (!allowed(dx)) return;
        if (window.__lenis) window.__lenis.scrollTo(window.scrollY + dx, { immediate: true, force: true });
        else window.scrollBy(0, dx);
      };
      let id = -1, x0 = 0, y0 = 0, lastX = 0, lastT = 0, v = 0, locked = false, glide = 0;
      const stop = () => { cancelAnimationFrame(glide); glide = 0; };
      const down = (e: PointerEvent) => {
        if (e.pointerType === 'mouse' || !pinned()) return;
        stop(); id = e.pointerId; x0 = lastX = e.clientX; y0 = e.clientY; lastT = e.timeStamp; v = 0; locked = false;
      };
      const drag = (e: PointerEvent) => {
        if (e.pointerId !== id) return;
        if (!locked) {
          const dx = Math.abs(e.clientX - x0), dy = Math.abs(e.clientY - y0);
          if (dy > 10 && dy > dx) { id = -1; return; } // an up-and-down swipe: the page's own
          if (dx < 10 || dx < dy * 1.2) return;
          locked = true; lastX = e.clientX; el.setPointerCapture(id);
        }
        const dx = lastX - e.clientX, dt = Math.max(1, e.timeStamp - lastT);
        v = 0.8 * (dx / dt) + 0.2 * v; // px per ms, smoothed
        lastX = e.clientX; lastT = e.timeStamp;
        move(dx);
      };
      const up = (e: PointerEvent) => {
        if (e.pointerId !== id) return;
        id = -1;
        if (!locked || Math.abs(v) < 0.2) return;
        // let go with some speed: carry on, slowing, as a swipe does
        let t = performance.now();
        const step = (now: number) => {
          const dt = Math.min(48, now - t); t = now;
          move(v * dt); v *= Math.pow(0.94, dt / 16);
          glide = Math.abs(v) > 0.03 && allowed(v) ? requestAnimationFrame(step) : 0;
        };
        glide = requestAnimationFrame(step);
      };
      const wheel = (e: WheelEvent) => {
        if (!allowed(e.deltaX) || e.ctrlKey || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
        e.preventDefault(); // also keeps the browser's own swipe-to-go-back out of it
        move(e.deltaX);
      };
      el.style.touchAction = 'pan-y';
      el.addEventListener('pointerdown', down);
      el.addEventListener('pointermove', drag);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
      el.addEventListener('wheel', wheel, { passive: false });
      return () => {
        stop();
        el.style.touchAction = '';
        el.removeEventListener('pointerdown', down);
        el.removeEventListener('pointermove', drag);
        el.removeEventListener('pointerup', up);
        el.removeEventListener('pointercancel', up);
        el.removeEventListener('wheel', wheel);
      };
    });
    mm.add('(max-width: 899.98px)', () => {
      // a row to swipe (it scrolls by itself, and snaps); the thread fills as it is read
      const fill = el.querySelector<HTMLElement>('.m-thread-fill')!;
      const sync = () => {
        const room = track.scrollWidth - track.clientWidth;
        gsap.set(fill, { scaleX: room > 0 ? Math.min(1, Math.max(0, track.scrollLeft / room)) : 0 });
      };
      sync();
      track.addEventListener('scroll', sync, { passive: true });
      window.addEventListener('resize', sync);
      // keyboard users can scroll it, and screen readers are told what it is
      track.tabIndex = 0;
      track.setAttribute('role', 'region');
      track.setAttribute('aria-label', 'Factory floor stations, scroll sideways');
      return () => {
        track.removeEventListener('scroll', sync);
        window.removeEventListener('resize', sync);
        track.removeAttribute('tabindex'); track.removeAttribute('role'); track.removeAttribute('aria-label');
        gsap.set(fill, { clearProps: 'transform' });
      };
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
