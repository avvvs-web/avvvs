'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AvvvsLockup } from './Logo';
import { goToChapter } from './FilmStage';
import { CONTACT } from '@/lib/contact';
import { trackOutbound } from '@/lib/track';

type Page = 'home' | 'manufacturing' | 'heritage' | 'journal' | 'other';

// The menu sheet on narrow screens. `page` items are routes; the rest are places on the homepage.
export const SHOP_URL = CONTACT.shop;
export const CLINIC_URL = CONTACT.clinic;

const MENU: { label: string; note: string; href: string; chapter?: string; page?: Page; external?: boolean }[] = [
  { label: 'The film', note: 'The Golden Thread, from forest to medicine', href: '#forest', chapter: 'forest' },
  { label: 'Our history', note: 'Three generations in Kozhikode, since 1921', href: '/our-history', page: 'heritage' },
  { label: 'Manufacturing', note: 'GMP-certified, and made for your brand', href: '/manufacturing', page: 'manufacturing' },
  { label: 'Work with us', note: 'Five ways to partner with AVVVS', href: '#destinations' },
  { label: 'Journal', note: 'Notes from a century of Ayurveda', href: '/journal', page: 'journal' },
];

// Other AVVVS sites: kept apart from the pages of this one, in the bar and in the menu.
const ELSEWHERE: { label: string; href: string; track?: 'clinic' | 'shop' }[] = [
  { label: 'Clinic', href: CLINIC_URL, track: 'clinic' },
  { label: 'Shop', href: SHOP_URL, track: 'shop' },
  { label: 'Gloveda Herbals', href: CONTACT.gloveda },
];

/**
 * The bar. It steps out of the way while the film is being scrolled forward and comes back on any
 * scroll up; a gold hairline along its foot is the thread, filling as the page is read.
 * On narrow screens the links move into a menu sheet.
 */
export function SiteHeader({ page }: { page: Page }) {
  const home = page === 'home';
  const bar = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = bar.current!;
    const fill = el.querySelector<HTMLElement>('.bar-thread span');
    let last = window.scrollY;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (fill) fill.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      // hide only on a deliberate scroll down, well past the top; any scroll up brings it back
      if (Math.abs(y - last) > 6) {
        el.classList.toggle('is-tucked', y > last && y > 160 && !el.contains(document.activeElement));
        last = y;
      }
      el.classList.toggle('is-scrolled', y > 8);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf); };
  }, []);

  // the sheet: Escape closes it, the page behind doesn't scroll, and it closes if the screen widens
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.classList.add('menu-open');
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const wide = window.matchMedia('(min-width: 1061px)');
    const onWide = () => { if (wide.matches) setOpen(false); };
    window.addEventListener('keydown', onKey);
    wide.addEventListener('change', onWide);
    return () => { root.classList.remove('menu-open'); window.removeEventListener('keydown', onKey); wide.removeEventListener('change', onWide); };
  }, [open]);

  // in-page film chapters can't be reached by a plain anchor (they live in the pinned stage)
  const chapter = (id: string) => (e: React.MouseEvent) => {
    setOpen(false);
    if (home && goToChapter(id)) e.preventDefault();
  };
  const close = () => setOpen(false);

  const links = (
    <>
      <Link href="/our-history" onClick={close} aria-current={page === 'heritage' ? 'page' : undefined}>Our history</Link>
      <Link href="/manufacturing" onClick={close} aria-current={page === 'manufacturing' ? 'page' : undefined}>Manufacturing</Link>
      <Link href={home ? '#destinations' : '/#destinations'} onClick={close}>Work with us</Link>
      <Link href="/journal" onClick={close} aria-current={page === 'journal' ? 'page' : undefined}>Journal</Link>
      <span className="bar-sep" aria-hidden="true" />
      <a href={CLINIC_URL} className="bar-ext" rel="noopener" onClick={() => { trackOutbound('clinic'); close(); }}>Clinic<span aria-hidden="true"> ↗</span></a>
      <a href={SHOP_URL} className="bar-ext" rel="noopener" onClick={() => { trackOutbound('shop'); close(); }}>Shop<span aria-hidden="true"> ↗</span></a>
    </>
  );

  return (
    <header className={`bar${open ? ' is-open' : ''}`} id="top" ref={bar}>
      <div className="bar-row">
        <Link className="bar-mark" href={home ? '#top' : '/'} aria-label={home ? 'AVVVS, back to the start' : 'AVVVS home'}
          onClick={(e) => { close(); if (home) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); } }}>
          <AvvvsLockup height={40} alt="" />
        </Link>
        <nav className="bar-nav" aria-label="Main">
          {links}
        </nav>
        <div className="bar-end">
          <a className="cta bar-cta" href="#enquire" data-topic={page === 'manufacturing' ? 'manufacturing' : undefined} onClick={close}>
            {page === 'manufacturing' ? 'Discuss manufacturing' : 'Partner with AVVVS'}
          </a>
          <button type="button" className="bar-menu" aria-expanded={open} aria-controls="menu-sheet" onClick={() => setOpen((o) => !o)}>
            <span className="bar-menu-label">{open ? 'Close' : 'Menu'}</span>
            <span className="bar-menu-icon" aria-hidden="true"><i /><i /></span>
          </button>
        </div>
      </div>
      <span className="bar-thread" aria-hidden="true"><span /></span>

      <div className="sheet" id="menu-sheet" hidden={!open}>
        <nav aria-label="Menu">
          <ol className="sheet-nav">
            {MENU.map((m, i) => (
              <li key={m.label} style={{ '--i': i } as React.CSSProperties}>
                {m.external ? (
                  <a href={m.href} rel="noopener" onClick={() => { trackOutbound(m.label === 'Clinic' ? 'clinic' : 'shop'); close(); }}>
                  <span className="sheet-no" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <span className="sheet-title">{m.label}</span>
                  <span className="sheet-note">{m.note}</span>
                </a>
                ) : (
                <Link href={home || m.page ? m.href : `/${m.href}`} onClick={m.chapter ? chapter(m.chapter) : close}
                  aria-current={m.page === page ? 'page' : undefined}>
                  <span className="sheet-no" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <span className="sheet-title">{m.label}</span>
                  <span className="sheet-note">{m.note}</span>
                </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <div className="sheet-else" style={{ '--i': MENU.length } as React.CSSProperties}>
          <p className="sheet-else-h">Also from AVVVS</p>
          <ul>
            {ELSEWHERE.map((e) => (
              <li key={e.label}><a href={e.href} rel="noopener" onClick={() => { if (e.track) trackOutbound(e.track); close(); }}>{e.label}<span aria-hidden="true"> ↗</span></a></li>
            ))}
          </ul>
        </div>
        <div className="sheet-foot" style={{ '--i': MENU.length + 1 } as React.CSSProperties}>
          <a className="cta sheet-cta" href="#enquire" data-topic={page === 'manufacturing' ? 'manufacturing' : undefined} onClick={close}>{page === 'manufacturing' ? 'Discuss manufacturing' : 'Partner with AVVVS'}</a>
          <div className="sheet-contact">
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            {CONTACT.phones.map((p) => <a key={p} href={`tel:${p.replace(/\s/g, '')}`}>{p}</a>)}
            <p>{CONTACT.city}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
