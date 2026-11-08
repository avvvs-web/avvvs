import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { FilmStage } from '@/components/FilmStage';
import { Ecosystem } from '@/components/Ecosystem';
import { EnquiryInvite } from '@/components/EnquiryForm';
import { ScrollRefresh } from '@/components/ScrollRefresh';
import { Faq } from '@/components/Faq';
import { FAQ_HOME } from '@/lib/faq';
import { JournalStrip } from '@/components/PageParts';
import { alternatesFor } from '@/lib/site';

export const metadata: Metadata = { alternates: alternatesFor('/') };

// The homepage carries the brand film "The Golden Thread" as one continuous scroll film
// (clips and cards in lib/film.tsx). Every factual line comes from avvvs.com.
export default function Home() {
  return (
    <>
      <SiteHeader page="home" />

      <main id="main">
        <FilmStage />

        <Ecosystem />

        <JournalStrip />

        <Faq id="faq" title="Questions partners ask" items={FAQ_HOME} />

        <EnquiryInvite
          title="Start a conversation"
          intro="Tell us what you'd like to make or offer, and we'll put you in touch with the right team at AVVVS."
        />
      </main>

      <SiteFooter />
      <ScrollRefresh />
    </>
  );
}
