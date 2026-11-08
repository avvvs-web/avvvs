import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { MfgHero } from '@/components/MfgHero';
import { FactoryFloor } from '@/components/FactoryFloor';
import { EnquiryInvite } from '@/components/EnquiryForm';
import { ScrollRefresh } from '@/components/ScrollRefresh';
import { MfgMotion } from '@/components/MfgMotion';
import { Faq } from '@/components/Faq';
import { JsonLd } from '@/components/JsonLd';
import { FAQ_MANUFACTURING } from '@/lib/faq';
import { SITE_URL, abs, breadcrumbLd } from '@/lib/site';
import { WhereNext } from '@/components/PageParts';

export const metadata: Metadata = {
  title: 'Third-party and white-label Ayurveda manufacturing in Kerala',
  description:
    "AVVVS Manufacturing makes classical and proprietary Ayurveda medicines in a GMP-certified factory in Kozhikode, Kerala: third-party, white-label and licence manufacturing of capsules, ointments, medicated oils, classical medicines and cosmetics.",
  alternates: { canonical: '/manufacturing' },
  openGraph: {
    url: '/manufacturing', title: 'AVVVS Manufacturing · GMP-certified Ayurveda manufacturing in Kozhikode',
    description: 'Your Ayurveda products, made in our GMP-certified factory: third-party, white-label and licence manufacturing.',
  },
};

const WAYS = [
  ['Third-party manufacturing', 'Your formulation, made in our GMP-certified factory.'],
  ['White label', 'Our formulations, packed under your brand.'],
  ['Licence manufacture', 'Ayurveda products developed by AVVVS and manufactured under licence.'],
] as const;

const FORMATS = ['Capsules, blister-packed', 'Ointments', 'Medicated oils', 'Classical medicines', 'Cosmetic products'];

export default function Manufacturing() {
  return (
    <>
      <SiteHeader page="manufacturing" />

      <main id="main">
        <MfgHero />

        <section className="m-intro" aria-label="About the factory">
          <p className="m-statement">AVVVS has prepared medicine in Kozhikode since 1921. Today it makes more than <span className="m-count" data-count="300">300</span> classical and proprietary formulations and sends them across India and abroad.</p>
          <p className="m-aside">Raw material sourcing, storage, manufacturing, packaging and logistics are held to international standards, with stringent quality control measures in place.</p>
        </section>

        <FactoryFloor />

        <section className="m-make" aria-labelledby="make-title">
          <h2 id="make-title" data-split>What we can make with you</h2>
          <div className="m-make-grid">
            <dl className="m-ways">
              {WAYS.map(([t, d]) => <div key={t}><dt>{t}</dt><dd>{d}</dd></div>)}
            </dl>
            <div className="m-formats">
              <h3>Formats on our lines</h3>
              <ul>{FORMATS.map((f) => <li key={f}>{f}</li>)}</ul>
              <p>Our own formulae include Mezhu Thailam, Rujanth, Slepan, Red Irons and Lakshol.</p>
            </div>
          </div>
        </section>

        <section className="m-reach" aria-labelledby="reach-title">
          <h2 id="reach-title" data-split>Made to GMP. Sent abroad.</h2>
          <p>Licensed proprietary medicines are produced and packaged to GMP quality standards. AVVVS medicines are marketed throughout India and exported to <span className="m-country">Russia</span>, <span className="m-country">Austria</span>, <span className="m-country">Slovenia</span> and <span className="m-country">Colombia</span>.</p>
        </section>

        <WhereNext items={[
          { href: '/our-history', kicker: 'Our history', title: 'A century in Kozhikode', note: 'The family behind the factory, four generations since 1921.' },
          { href: '/journal/mezhu-thailam', kicker: 'Journal', title: 'Inside a formulation', note: 'What goes into Mezhu Thailam, one of the oldest medicines AVVVS makes.' },
          { href: '/#destinations', kicker: 'Work with us', title: 'Other ways to partner', note: 'The clinic, Gloveda Herbals, and the Gloveda spa partnerships.' },
        ]} />

        <Faq id="mfaq" title="Manufacturing questions" items={FAQ_MANUFACTURING} />

        <EnquiryInvite
          title="Tell us what you want to make"
          intro="Share the product, the format and the market you have in mind, and we'll put you in touch with our manufacturing team."
          topic="manufacturing"
          cta="Discuss manufacturing"
        />
      </main>

      <SiteFooter />
      <ScrollRefresh />
      <MfgMotion />
      <JsonLd data={breadcrumbLd([{ name: 'Manufacturing', path: '/manufacturing' }])} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'Service', '@id': `${abs('/manufacturing')}#service`,
        name: 'Third-party, white-label and licence Ayurveda manufacturing',
        serviceType: 'Ayurveda contract manufacturing',
        provider: { '@id': `${SITE_URL}/#organization` },
        areaServed: [{ '@type': 'Country', name: 'India' }, 'Worldwide'],
        url: abs('/manufacturing'),
        description: 'Classical and proprietary Ayurveda medicines made in a GMP-certified factory in Kozhikode, Kerala, for partner brands.',
        hasOfferCatalog: {
          '@type': 'OfferCatalog', name: 'Ways to manufacture with AVVVS',
          itemListElement: WAYS.map(([name, description]) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name, description } })),
        },
      }} />
    </>
  );
}
