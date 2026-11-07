import Image from 'next/image';
import Link from 'next/link';
import { POSTS } from '@/lib/journal';
export { Crumbs } from './Crumbs';

// The pieces every inner page shares, so they all read the same way:
// a breadcrumb at the top, and a "Where next" band before the questions and the enquiry.

export interface NextItem { href: string; kicker: string; title: string; note: string; external?: boolean }

/** Two or three onward routes, as one numbered row: the site's way of saying "you might go here next". */
export function WhereNext({ items, title = 'Where next' }: { items: NextItem[]; title?: string }) {
  return (
    <section className="wn" aria-labelledby="wn-title">
      <h2 id="wn-title" className="wn-h">{title}</h2>
      <ol className="wn-list">
        {items.map((it, i) => {
          const body = (
            <>
              <span className="wn-no" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <span className="wn-kicker">{it.kicker}</span>
              <span className="wn-title">{it.title}{it.external && <span aria-hidden="true"> ↗</span>}</span>
              <span className="wn-note">{it.note}</span>
            </>
          );
          return (
            <li key={it.href} data-reveal>
              {it.external ? <a href={it.href} rel="noopener">{body}</a> : <Link href={it.href}>{body}</Link>}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** The homepage's way into the Journal: three pieces and the door to the rest. */
export function JournalStrip({ slugs = ['a-pharmacy-in-kozhikode', 'why-kerala', 'ayurveda-used-wisely'] }: { slugs?: string[] }) {
  const posts = slugs.map((s) => POSTS.find((p) => p.slug === s)!).filter(Boolean);
  return (
    <section className="jr jr-strip" aria-labelledby="jstrip-title">
      <div className="jr-strip-head">
        <div>
          <p className="hp-kicker">From the Journal</p>
          <h2 id="jstrip-title">Notes from a century of Ayurveda</h2>
        </div>
        <Link className="jr-read" href="/journal">All of the Journal<span aria-hidden="true"> →</span></Link>
      </div>
      <ul className="jr-grid">
        {posts.map((p) => (
          <li key={p.slug} className="jr-card">
            <Link href={`/journal/${p.slug}`} className="jr-card-media" tabIndex={-1} aria-hidden="true">
              <Image src={p.cover.src} width={p.cover.width} height={p.cover.height}
                sizes="(min-width: 1100px) 30vw, (min-width: 700px) 46vw, 100vw" alt="" style={{ objectPosition: p.cover.position }} />
            </Link>
            <p className="jr-meta"><span>{p.kind}</span><span aria-hidden="true">·</span><span>{p.minutes} min read</span></p>
            <h3><Link href={`/journal/${p.slug}`}>{p.title}</Link></h3>
          </li>
        ))}
      </ul>
    </section>
  );
}
