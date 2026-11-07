import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { HeritageMotion, YearsSince } from '@/components/HeritageMotion';
import { FOUNDED } from '@/lib/film';
import { EnquiryInvite } from '@/components/EnquiryForm';
import { Faq } from '@/components/Faq';
import { JsonLd } from '@/components/JsonLd';
import { FAQ_HISTORY } from '@/lib/faq';
import { SITE_URL, abs, breadcrumbLd } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Our history: Ayurveda in Kozhikode since 1921',
  description:
    'Arya Vaidya Vilasini Vaidya Sala was founded in Kozhikode in 1921 by Kaloor Neelakandan Vaidyar as a pharmacy, with the blessings of Sree Narayana Guru, and has been carried by his family for three generations.',
  alternates: { canonical: '/our-history' },
  openGraph: { url: '/our-history', title: 'Our history · AVVVS since 1921', description: 'One family, three generations, since 1921.' },
};

// Every line restates avvvs.com/about-us (research/01-about-us-notes.md) or what the user confirmed.
const TIMELINE = [
  {
    when: '1921', title: 'A pharmacy in Kozhikode', who: 'Kaloor Neelakandan Vaidyar', dates: '1895–1967',
    text: 'Personally blessed and advised by Sree Narayana Guru to set up a place of care, he founded Arya Vaidya Vilasini Vaidya Sala as a pharmacy that prepared and dispensed Ayurveda medicines. Its founding idea was social service.',
  },
  {
    when: 'Second generation', title: 'Carried forward', who: 'K. N. Ramadas Vaidyar', dates: '1934–1998',
    text: "His son carried the work on, and was known across Kozhikode's socio-literary circles for his satire.",
  },
  { when: '2011', title: 'Navathi', text: 'AVVVS marked ninety years.' },
  { when: '2021', title: 'A hundred years', text: 'The centenary of Arya Vaidya Vilasini Vaidya Sala.' },
  {
    when: 'Today', title: 'The third generation', who: 'Dr Manoj Kaloor', dates: 'Managing Director',
    text: 'The son of K. N. Ramadas Vaidyar, he leads AVVVS today with Reeja Manoj.',
  },
] as const;

const GREW = [
  ['300+', 'classical and proprietary formulations, among them Mezhu Thailam, Rujanth, Slepan, Red Irons and Lakshol.'],
  ['GMP', 'certified factory in Kozhikode, with traditional mechanised units alongside capsule, blister, ointment and cosmetic lines.'],
  ['Clinics', 'The clinical arm grew into the AVVVS Ayur Speciality Clinics.'],
  ['Abroad', 'Marketed throughout India, and exported to Russia, Austria, Slovenia and Colombia.'],
] as const;

export default function OurHistory() {
  return (
    <>
      <SiteHeader page="heritage" />

      <main id="main" className="hp">
        <section className="hp-hero" aria-labelledby="hp-title">
          <div className="hp-hero-copy">
            <p className="hp-kicker">Kozhikode, since {FOUNDED}</p>
            <h1 id="hp-title" data-split>Our history</h1>
            <p className="hp-lede" data-reveal>One family, three generations, and <YearsSince /> years of preparing Ayurveda medicine in Kozhikode.</p>
          </div>
          <figure className="hp-hero-media">
            <Image src="/media/film/stills/k05.jpg" width={1920} height={1080} priority sizes="(min-width: 900px) 55vw, 100vw"
              alt="An open bundle of palm-leaf manuscripts in lamplight, from the AVVVS film." />
          </figure>
        </section>

        <section className="hp-line" aria-labelledby="hp-line-title">
          <h2 id="hp-line-title" className="hp-h" data-split>The thread so far</h2>
          <div className="hp-timeline">
            <span className="hp-thread" aria-hidden="true"><span /></span>
            <ol className="hp-entries">
            {TIMELINE.map((t) => (
              <li key={t.title} className="hp-entry" data-reveal>
                <p className="hp-when">{t.when}</p>
                <div className="hp-body">
                  <h3>{t.title}</h3>
                  {'who' in t && <p className="hp-who"><span>{t.who}</span> <span className="hp-dates">{t.dates}</span></p>}
                  <p>{t.text}</p>
                </div>
              </li>
            ))}
            </ol>
          </div>
        </section>

        <section className="hp-count" aria-label="Years of AVVVS">
          <p><b data-count-years><YearsSince /></b> <span>years since {FOUNDED}, and counting.</span></p>
        </section>

        <section className="hp-grew" aria-labelledby="hp-grew-title">
          <h2 id="hp-grew-title" className="hp-h" data-split>What the pharmacy became</h2>
          <ul className="hp-grew-list">
            {GREW.map(([k, v]) => <li key={k} data-reveal><b>{k}</b><p>{v}</p></li>)}
          </ul>
          <div className="hp-next" data-reveal>
            <Link className="btn" href="/manufacturing">See the factory floor</Link>
            <Link className="hp-more" href="/#destinations">Five ways to work with us</Link>
          </div>
        </section>

        <Faq id="hfaq" title="About our history" items={FAQ_HISTORY} />

        <EnquiryInvite
          title="Work with a century of practice"
          intro="Whether you make, host or sell, tell us what you have in mind and we'll put you in touch with the right team."
        />
      </main>

      <SiteFooter />
      <HeritageMotion />
      <JsonLd data={breadcrumbLd([{ name: 'Our history', path: '/our-history' }])} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'AboutPage', url: abs('/our-history'), name: 'Our history',
        about: { '@id': `${SITE_URL}/#organization` },
        mentions: [
          { '@type': 'Person', name: 'Kaloor Neelakandan Vaidyar', birthDate: '1895', deathDate: '1967', description: 'Founder of Arya Vaidya Vilasini Vaidya Sala (1921).' },
          { '@type': 'Person', name: 'K. N. Ramadas Vaidyar', birthDate: '1934', deathDate: '1998', description: 'Son of the founder; led AVVVS in the second generation.' },
          { '@type': 'Person', name: 'Dr Manoj Kaloor', jobTitle: 'Managing Director', description: 'Son of K. N. Ramadas Vaidyar; leads AVVVS today, the third generation.' },
          { '@type': 'Person', name: 'Sree Narayana Guru', description: 'Blessed and advised the founder to set up a place of care.' },
        ],
      }} />
    </>
  );
}
