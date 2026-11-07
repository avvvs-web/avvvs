import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { JsonLd } from '@/components/JsonLd';
import { HeritageMotion } from '@/components/HeritageMotion';
import { POSTS, type Post } from '@/lib/journal';
import { SITE_URL, abs, breadcrumbLd } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Journal: notes from a century of Ayurveda',
  description:
    'Writing from Arya Vaidya Vilasini Vaidya Sala, Kozhikode: the people and history of AVVVS, why Kerala became the home of Ayurveda, how to use it wisely, and what goes into the medicines we make.',
  alternates: { canonical: '/journal' },
  openGraph: { url: '/journal', title: 'Journal · AVVVS', description: 'Notes from a century of Ayurveda in Kozhikode.' },
};

function Meta({ p }: { p: Post }) {
  return (
    <p className="jr-meta">
      <span>{p.kind}</span>
      <span aria-hidden="true">·</span>
      <span>{p.minutes} min read</span>
    </p>
  );
}

export default function Journal() {
  const [lead, ...rest] = POSTS;
  return (
    <>
      <SiteHeader page="journal" />
      <main id="main" className="jr">
        <header className="jr-mast">
          <p className="hp-kicker">From the Vaidya Sala</p>
          <h1 data-split>Journal</h1>
          <p className="jr-lede" data-reveal>Notes from a century of Ayurveda in Kozhikode: the people who kept it, the craft of making medicine, and how to use it well.</p>
        </header>

        <article className="jr-lead" data-reveal>
          <Link href={`/journal/${lead.slug}`} className="jr-lead-media" tabIndex={-1} aria-hidden="true">
            <Image src={lead.cover.src} width={lead.cover.width} height={lead.cover.height} priority
              sizes="(min-width: 900px) 58vw, 100vw" alt="" style={{ objectPosition: lead.cover.position }} />
          </Link>
          <div className="jr-lead-copy">
            <Meta p={lead} />
            <h2><Link href={`/journal/${lead.slug}`}>{lead.title}</Link></h2>
            <p className="jr-dek">{lead.dek}</p>
            <Link className="jr-read" href={`/journal/${lead.slug}`}>Read the piece<span aria-hidden="true"> →</span></Link>
          </div>
        </article>

        <ol className="jr-grid" aria-label="More from the Journal">
          {rest.map((p, i) => (
            <li key={p.slug} className="jr-card" data-reveal>
              <Link href={`/journal/${p.slug}`} className="jr-card-media" tabIndex={-1} aria-hidden="true">
                <Image src={p.cover.src} width={p.cover.width} height={p.cover.height}
                  sizes="(min-width: 1100px) 30vw, (min-width: 700px) 46vw, 100vw" alt="" style={{ objectPosition: p.cover.position }} />
              </Link>
              <p className="jr-no" aria-hidden="true">{String(i + 2).padStart(2, '0')}</p>
              <Meta p={p} />
              <h2><Link href={`/journal/${p.slug}`}>{p.title}</Link></h2>
              <p className="jr-dek">{p.dek}</p>
            </li>
          ))}
        </ol>
      </main>
      <SiteFooter />
      <HeritageMotion />
      <JsonLd data={breadcrumbLd([{ name: 'Journal', path: '/journal' }])} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'Blog', '@id': `${SITE_URL}/journal#blog`, url: abs('/journal'), name: 'AVVVS Journal',
        publisher: { '@id': `${SITE_URL}/#organization` },
        blogPost: POSTS.map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: abs(`/journal/${p.slug}`), datePublished: p.published, dateModified: p.revised })),
      }} />
    </>
  );
}
