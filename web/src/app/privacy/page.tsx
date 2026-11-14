import type { Metadata } from 'next';
import { alternatesFor } from '@/lib/site';
import { LegalPage } from '@/components/LegalPage';
import { CookieSettingsLink } from '@/components/CookieConsent';
import { CONTACT } from '@/lib/contact';

// DRAFT, written from what this site actually does (see web/src/app/api/enquiry and CookieConsent).
// AVVVS's legal adviser should review it before launch.

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Arya Vaidya Vilasini Vaidya Sala (AVVVS) handles the personal information you share through this website.',
  alternates: alternatesFor('/privacy'),
};

const mail = <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>;

export default function Privacy() {
  return (
    <LegalPage
      kicker="Legal"
      title="Privacy Policy"
      updated="14 November 2026"
      intro={<p>This policy explains what personal information Arya Vaidya Vilasini Vaidya Sala (&ldquo;AVVVS&rdquo;, &ldquo;we&rdquo;) collects through this website, why, and the choices you have. We collect very little: only what you choose to send us.</p>}
      sections={[
        { id: 'who', title: 'Who we are', body: <>
          <p>Arya Vaidya Vilasini Vaidya Sala is an Ayurveda institution in Kozhikode, Kerala, India. We are responsible for the personal information described in this policy.</p>
          <p>Contact: {mail}, {CONTACT.phones.join(', ')}, {CONTACT.address.slice(1).join(', ')}.</p>
        </> },
        { id: 'collect', title: 'What we collect', body: <>
          <p><b>When you send an enquiry.</b> Your name, company or organisation, email address, and, if you add them, your phone number and country, together with the topic you chose and your message.</p>
          <p><b>When you browse.</b> Like any website, our hosting provider&apos;s servers record technical details of each request, such as your IP address, browser type and the page requested, to deliver the site and keep it secure. Our enquiry service also briefly holds your IP address in memory to stop automated flooding.</p>
          <p><b>What we do not collect.</b> We do not ask you to create an account, and we do not collect payment details or sensitive personal data through this website.</p>
        </> },
        { id: 'use', title: 'How we use it', body: <ul>
          <li>To read and reply to your enquiry, and to pass it to the right team: manufacturing, our clinics or Gloveda.</li>
          <li>To keep a record of business correspondence.</li>
          <li>To keep the website and the enquiry service secure and working.</li>
        </ul> },
        { id: 'basis', title: 'Why we may use it', body: <>
          <p>We use the details in your enquiry because you chose to send them to us so that we would reply, in line with India&apos;s Digital Personal Data Protection Act, 2023. If you are in the European Union or the United Kingdom, we rely on our legitimate interest in answering business enquiries, and on steps you asked us to take before entering into a contract.</p>
        </> },
        { id: 'share', title: 'Who we share it with', body: <>
          <p>Your enquiry is delivered to our team by email. This website is hosted by Vercel Inc. (United States), whose servers handle each request, and our email provider carries the enquiry to our inbox. Both process the information on our behalf. We do not sell your information.</p>
          <p>If you allow analytics, Google (Google Analytics) receives information about your visit. If you allow marketing, Meta (the Meta Pixel, for Facebook and Instagram) receives information about your visit and whether you sent an enquiry, which helps us measure our advertising. These companies may process the information outside India under their own privacy policies.</p>
          <p>We may disclose information if the law requires it, or to protect our rights and the safety of others.</p>
        </> },
        { id: 'keep', title: 'How long we keep it', body: <p>We keep enquiries only as long as we need them to respond, to follow up on any work we agree with you, and to keep reasonable business records. Then we delete them.</p> },
        { id: 'cookies', title: 'Cookies and local storage', body: <>
          <p>We ask before setting any cookies that are not essential. Until you choose, only your cookie choice itself is stored in your browser, so that we do not ask you again on every page.</p>
          <ul>
            <li><b>Analytics (Google Analytics 4).</b> Cookies such as <code>_ga</code> that count visits and show how the site is used: pages viewed, time on site, approximate location and device. IP addresses are anonymised.</li>
            <li><b>Marketing (Meta Pixel).</b> Cookies such as <code>_fbp</code> that let Meta measure our advertising on Facebook and Instagram and show it to people likely to be interested.</li>
          </ul>
          <p>Neither loads unless you allow it, and you can change your choice at any time: <CookieSettingsLink />. Turning a category off stops it from collecting anything further and removes the cookies it had set.</p>
        </> },
        { id: 'rights', title: 'Your rights', body: <>
          <p>You can ask us to tell you what information we hold about you, to correct it, or to delete it, and you can withdraw your consent at any time. Write to {mail}. If you are not satisfied with our reply, you may complain to the data protection authority where you live.</p>
        </> },
        { id: 'links', title: 'Other websites', body: <p>This site links to other websites, such as Gloveda Herbals and our social media pages. Their own privacy policies apply when you visit them.</p> },
        { id: 'children', title: 'Children', body: <p>This website is meant for businesses and adults. We do not knowingly collect information from children.</p> },
        { id: 'changes', title: 'Changes to this policy', body: <p>If we change this policy, we will update it on this page and change the date at the top.</p> },
      ]}
    />
  );
}
