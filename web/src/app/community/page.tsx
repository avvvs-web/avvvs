import type { Metadata } from 'next';
import Image from 'next/image';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { HeritageMotion } from '@/components/HeritageMotion';
import { EnquiryInvite } from '@/components/EnquiryForm';
import { JsonLd } from '@/components/JsonLd';
import { Crumbs } from '@/components/Crumbs';
import { WhereNext } from '@/components/PageParts';
import { FOUNDED } from '@/lib/film';
import { SITE_URL, abs, breadcrumbLd, alternatesFor } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Community: the founding idea of AVVVS',
  description:
    'Social service has been the founding idea of Arya Vaidya Vilasini Vaidya Sala since 1921, when Sree Narayana Guru encouraged its founder to build a place of care. Today part of that work happens in schools, in talks with students.',
  alternates: alternatesFor('/community'),
  openGraph: { url: '/community', title: 'Community · AVVVS', description: 'The founding idea of AVVVS, since 1921.' },
};

// Every line restates avvvs.com/about-us (its CSR section) or the founding story already on the site.
export default function Community() {
  return (
    <>
      <SiteHeader page="social" />

      <main id="main" className="hp ss">
        <section className="hp-hero" aria-labelledby="ss-title">
          <div className="hp-hero-copy">
            <Crumbs trail={[{ name: 'Community' }]} />
            <p className="hp-kicker">Corporate social responsibility</p>
            <h1 id="ss-title" data-split>Community</h1>
            <p className="hp-lede" data-reveal>The founding idea of AVVVS, since {FOUNDED}.</p>
          </div>
          <figure className="hp-hero-media">
            <Image src="/media/film/stills/k06.jpg" width={1920} height={1080} priority sizes="(min-width: 900px) 55vw, 100vw"
              alt="A bundle of palm-leaf manuscripts beside a lit brass oil lamp, from the AVVVS film." />
          </figure>
        </section>

        <section className="ss-why" aria-labelledby="ss-why-title">
          <h2 id="ss-why-title" className="hp-h" data-split>Where it all began</h2>
          <div className="ss-why-body">
            <p className="ss-statement" data-reveal>In {FOUNDED}, inspired by the guidance of Sree Narayana Guru, Kaloor Neelakandan Vaidyar founded AVVVS in Kozhikode as an Ayurvedic vaidyasala and hospital with a vision rooted in social service.</p>
            <div className="ss-why-aside" data-reveal>
              <p>His son, K. N. Ramadas Vaidyar, a gold medallist from Kannur Ayurveda College, carried the legacy forward while gaining recognition as a satirist in Kerala&apos;s literary circles.</p>
              <p>Today, the third generation, led by Dr. Manoj Kaloor and Dr. Reeja Manoj, continues this journey, with the fourth generation preparing to carry the legacy forward.</p>
            </div>
          </div>
        </section>

        <section className="hp-csr ss-schools" aria-labelledby="ss-schools-title">
          <div className="hp-csr-copy">
            <p className="hp-kicker">In schools</p>
            <h2 id="ss-schools-title" className="hp-h" data-split>Talks with students</h2>
            <p data-reveal>AVVVS doctors visit schools and classrooms to interact with students, share health knowledge and encourage healthy habits from an early age.</p>
          </div>
          <div className="hp-csr-media">
            <figure data-reveal>
              <Image src="/media/history/school-talk-1.jpg" width={1280} height={960} sizes="(min-width: 900px) 34vw, 100vw"
                alt="A speaker talks to a classroom of students, with a slide projected on the wall behind her." />
            </figure>
            <figure data-reveal>
              <Image src="/media/history/school-talk-2.jpg" width={1280} height={960} sizes="(min-width: 900px) 26vw, 100vw"
                alt="A speaker addresses rows of students seated in a school hall." />
            </figure>
          </div>
        </section>

        <WhereNext items={[
          { href: '/our-history', kicker: 'Our history', title: 'One family, four generations', note: 'How the 1921 vaidyasala became AVVVS.' },
          { href: '/journal/a-pharmacy-in-kozhikode', kicker: 'Journal', title: 'A vaidyasala, a blessing, and a hundred years', note: 'The founding story, told at length.' },
          { href: '/journal/the-clinic', kicker: 'Journal', title: 'Inside the Ayur Speciality Clinic', note: 'The place of care, as it is today.' },
        ]} />

        <EnquiryInvite
          title="Work with us on a community initiative"
          intro="If you run a school, a community programme or a health initiative and would like AVVVS involved, tell us about it and we'll put you in touch with the right person."
        />
      </main>

      <SiteFooter />
      <HeritageMotion />
      <JsonLd data={breadcrumbLd([{ name: 'Community', path: '/community' }])} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'WebPage', url: abs('/community'), name: 'Community',
        about: { '@id': `${SITE_URL}/#organization` },
        description: 'The founding idea of Arya Vaidya Vilasini Vaidya Sala, and its talks with students in schools.',
      }} />
    </>
  );
}
