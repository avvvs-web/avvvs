import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/LegalPage';
import { CONTACT } from '@/lib/contact';

// DRAFT for AVVVS's legal adviser to review before launch.

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'The terms that apply when you use the Arya Vaidya Vilasini Vaidya Sala (AVVVS) website.',
  alternates: { canonical: '/terms' },
};

export default function Terms() {
  return (
    <LegalPage
      kicker="Legal"
      title="Terms of Use"
      updated="7 November 2026"
      intro={<p>These terms apply when you use this website, run by Arya Vaidya Vilasini Vaidya Sala (&ldquo;AVVVS&rdquo;, &ldquo;we&rdquo;) of Kozhikode, Kerala, India. By using the site you accept them. If you do not agree, please do not use the site.</p>}
      sections={[
        { id: 'about', title: 'About this website', body: <p>This website introduces AVVVS, its history and the ways businesses can work with us. It is for general information about our organisation and our partnerships.</p> },
        { id: 'health', title: 'Not medical advice', body: <p>Nothing on this website is medical advice, a diagnosis or a recommendation of treatment. Ayurveda medicines should be used under the guidance of a qualified practitioner. Always consult a qualified practitioner about your health.</p> },
        { id: 'enquiries', title: 'Enquiries and agreements', body: <>
          <p>Sending an enquiry through this website does not create an agreement or an obligation for either side. Any manufacturing, clinic, Gloveda or other partnership is governed by a separate written agreement signed by both parties.</p>
          <p>Please give accurate details when you write to us. How we handle them is explained in our <Link href="/privacy">Privacy Policy</Link>.</p>
        </> },
        { id: 'ip', title: 'Our content and marks', body: <p>The text, film, photographs, design and the AVVVS, Gloveda and related names and logos on this website belong to AVVVS or are used with permission. You may view and share links to the site, but you may not copy, reproduce or reuse its content or marks without our written permission.</p> },
        { id: 'use', title: 'Using the site fairly', body: <p>Do not misuse the website: for example, do not attempt to gain unauthorised access, interfere with how it works, send automated or bulk enquiries, or use it for anything unlawful.</p> },
        { id: 'accuracy', title: 'Accuracy and availability', body: <p>We work to keep the information on this website accurate and up to date, but it may change, and we cannot promise it is complete or free of errors. We may update, suspend or withdraw any part of the site without notice.</p> },
        { id: 'links', title: 'Links to other websites', body: <p>Links to other websites, such as Gloveda Herbals or social media, are provided for convenience. We are not responsible for their content or practices.</p> },
        { id: 'liability', title: 'Our liability', body: <p>To the extent the law allows, AVVVS is not liable for any loss arising from your use of this website or your reliance on its content. Nothing in these terms limits any liability that cannot be limited by law.</p> },
        { id: 'law', title: 'Governing law', body: <p>These terms are governed by the laws of India. The courts at Kozhikode, Kerala, have jurisdiction over any dispute arising from them.</p> },
        { id: 'changes', title: 'Changes and contact', body: <p>We may update these terms and will change the date at the top when we do. Questions about them can be sent to <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>.</p> },
      ]}
    />
  );
}
