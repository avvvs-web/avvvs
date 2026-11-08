import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { JsonLd } from '@/components/JsonLd';
import { HeritageMotion } from '@/components/HeritageMotion';
import { POSTS, formatDate, readNext } from '@/lib/journal';
import { allPosts, findPost } from '@/lib/posts-db';
import { CONTACT } from '@/lib/contact';
import { SITE_URL, abs, breadcrumbLd, alternatesFor } from '@/lib/site';
import { Crumbs } from '@/components/Crumbs';

type Props = { params: Promise<{ slug: string }> };

// the built-in articles are prerendered; ones published from the admin render on first visit
export const dynamicParams = true;
export const revalidate = 60;
export const generateStaticParams = () => POSTS.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await findPost((await params).slug);
  if (!p) return {};
  const path = `/journal/${p.slug}`;
  return {
    title: p.title,
    description: p.dek,
    alternates: alternatesFor(path),
    openGraph: { type: 'article', url: path, title: p.title, description: p.dek, publishedTime: p.published, modifiedTime: p.revised, section: p.kind },
  };
}

export default async function JournalPost({ params }: Props) {
  const p = await findPost((await params).slug);
  if (!p) notFound();
  const next = readNext(p.slug, 2, await allPosts());
  const tall = p.cover.height > p.cover.width;

  return (
    <>
      <SiteHeader page="journal" />
      <main id="main" className="jr jr-post">
        <article>
          <header className="jr-head">
            <Crumbs trail={[{ name: 'Journal', href: '/journal' }, { name: p.kind }]} />
            <h1 data-split>{p.title}</h1>
            <p className="jr-standfirst" data-reveal>{p.dek}</p>
            <p className="jr-meta">
              <span>{p.minutes} min read</span>
              <span aria-hidden="true">·</span>
              <span>Revised <time dateTime={p.revised}>{formatDate(p.revised)}</time></span>
            </p>
          </header>

          <figure className={`jr-cover${tall ? ' is-tall' : ''}`}>
            <Image src={p.cover.src} width={p.cover.width} height={p.cover.height} priority
              sizes="(min-width: 1260px) 1200px, 100vw" alt={p.cover.alt} style={{ objectPosition: p.cover.position }} />
          </figure>

          <div className="jr-body">
            {p.body}
            {p.formulation && (
              <aside className="jr-note" aria-label="A note on this medicine">
                <p className="jr-note-h">A note on this medicine</p>
                <p>This piece describes an AVVVS formulation; it is not medical advice. Use Ayurvedic medicines under the guidance of a qualified practitioner, and talk to your doctor first, especially if you are pregnant or nursing, or take other medicines. Read <Link href="/journal/ayurveda-used-wisely">Ayurveda, used wisely</Link>.</p>
                <p><a href={CONTACT.shop} rel="noopener">AVVVS medicines are available from the AVVVS shop<span aria-hidden="true"> ↗</span></a></p>
              </aside>
            )}
            <p className="jr-sign">
              Arya Vaidya Vilasini Vaidya Sala, Kozhikode. First published <time dateTime={p.published}>{formatDate(p.published)}</time>.
            </p>
          </div>
        </article>

        <section className="jr-next" aria-labelledby="jr-next-h">
          <h2 id="jr-next-h" className="jr-next-h">Read next</h2>
          <ul>
            {next.map((n) => (
              <li key={n.slug} className="jr-card" data-reveal>
                <Link href={`/journal/${n.slug}`} className="jr-card-media" tabIndex={-1} aria-hidden="true">
                  <Image src={n.cover.src} width={n.cover.width} height={n.cover.height}
                    sizes="(min-width: 700px) 40vw, 100vw" alt="" style={{ objectPosition: n.cover.position }} />
                </Link>
                <p className="jr-meta"><span>{n.kind}</span><span aria-hidden="true">·</span><span>{n.minutes} min read</span></p>
                <h3><Link href={`/journal/${n.slug}`}>{n.title}</Link></h3>
              </li>
            ))}
          </ul>
          <Link className="jr-read" href="/journal"><span aria-hidden="true">← </span>All of the Journal</Link>
        </section>
      </main>
      <SiteFooter />
      <HeritageMotion />
      <JsonLd data={breadcrumbLd([{ name: 'Journal', path: '/journal' }, { name: p.title, path: `/journal/${p.slug}` }])} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'BlogPosting',
        headline: p.title, description: p.dek, url: abs(`/journal/${p.slug}`), mainEntityOfPage: abs(`/journal/${p.slug}`),
        image: abs(`/journal/${p.slug}/opengraph-image`),
        datePublished: p.published, dateModified: p.revised, articleSection: p.kind, inLanguage: 'en-IN',
        author: { '@id': `${SITE_URL}/#organization` }, publisher: { '@id': `${SITE_URL}/#organization` },
        isPartOf: { '@id': `${SITE_URL}/journal#blog` },
      }} />
    </>
  );
}
