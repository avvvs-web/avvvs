import type { Metadata } from 'next';
import { alternatesFor } from '@/lib/site';
import { LegalPage } from '@/components/LegalPage';
import { CookieSettingsLink } from '@/components/CookieConsent';
import { CONTACT } from '@/lib/contact';

// Written from what this site actually does (see web/src/app/api/enquiry, CookieConsent and
// Analytics), and checked on 14 November 2026 against India's DPDP Act 2023 and the EU/UK GDPR.
// Decisions AVVVS made: enquiries are kept 24 months; requests go to the Grievance Officer (a role,
// not a named person); the email provider is not named. This is not legal advice: AVVVS's legal
// adviser should read it, in particular on whether an EU representative is needed.
// When the site starts collecting anything new, change this page in the same commit.

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
          <p>Questions, requests and complaints about personal information go to <b>the Grievance Officer, Arya Vaidya Vilasini Vaidya Sala</b>, at the same email and postal address.</p>
        </> },
        { id: 'collect', title: 'What we collect', body: <>
          <p><b>When you send an enquiry.</b> Your name, company or organisation, email address, and, if you add them, your phone number and country, together with the topic you chose and your message.</p>
          <p><b>When you browse.</b> Like any website, our hosting provider&apos;s servers record technical details of each request, such as your IP address, browser type and the page requested, to deliver the site and keep it secure. Our enquiry service also holds your IP address in memory for up to ten minutes to stop automated flooding.</p>
          <p><b>If you allow cookies.</b> Information about your visit, described under <a href="#cookies">Cookies and local storage</a> below.</p>
          <p><b>What we do not collect.</b> We do not ask you to create an account, and we do not collect payment details or sensitive personal data through this website. Please do not include health details in an enquiry. We make no decisions about you by automated means.</p>
        </> },
        { id: 'use', title: 'How we use it', body: <ul>
          <li>To read and reply to your enquiry, and to pass it to the right team: manufacturing, our clinics or Gloveda.</li>
          <li>To keep a record of business correspondence.</li>
          <li>To keep the website and the enquiry service secure and working.</li>
        </ul> },
        { id: 'basis', title: 'Why we may use it', body: <>
          <p><b>Enquiries.</b> We use the details in your enquiry because you chose to send them to us so that we would reply, in line with India&apos;s Digital Personal Data Protection Act, 2023. If you are in the European Union or the United Kingdom, we rely on our legitimate interest in answering business enquiries, and on steps you asked us to take before entering into a contract.</p>
          <p><b>Analytics and marketing cookies.</b> Only with your consent, which you can withdraw at any time.</p>
          <p><b>Server records and flood protection.</b> Our legitimate interest in keeping the website secure and working.</p>
        </> },
        { id: 'share', title: 'Who we share it with', body: <>
          <p>Your enquiry is delivered to our team by email. This website is hosted by Vercel Inc. (United States), whose servers handle each request, and our email provider carries the enquiry to our inbox. Both process the information on our behalf. We do not sell your information.</p>
          <p>If you allow analytics, Google (Google Analytics) receives information about your visit. If you allow marketing, Meta (the Meta Pixel, for Facebook and Instagram) receives information about your visit and whether you sent an enquiry, which helps us measure our advertising. These companies may process the information outside India under their own privacy policies.</p>
          <p>We may disclose information if the law requires it, or to protect our rights and the safety of others.</p>
        </> },
        { id: 'where', title: 'Where it is processed', body: <p>AVVVS is in India, and your enquiry is read and kept there. Our hosting, email, analytics and advertising providers process information in the United States and other countries. Data protection laws in these countries may differ from those where you live.</p> },
        { id: 'keep', title: 'How long we keep it', body: <ul>
          <li><b>Enquiries that lead to no work together:</b> 24 months after our last contact with you, then deleted.</li>
          <li><b>Enquiries that lead to work together:</b> for as long as we work together, and afterwards for as long as the law requires business records to be kept.</li>
          <li><b>Server records:</b> a short period set by our hosting provider. The address held for flood protection is dropped within ten minutes.</li>
          <li><b>Your cookie choice:</b> in your own browser until you change it or clear your browser&apos;s storage.</li>
          <li><b>Analytics and marketing cookies:</b> the Google Analytics cookies last up to two years and the Meta cookie up to three months, unless you turn the category off first, which removes them.</li>
        </ul> },
        { id: 'security', title: 'How we protect it', body: <>
          <p>The website is served only over an encrypted connection, enquiries reach a mailbox that only our team can open, and we limit who can see them to the people who need to reply. No method of sending or storing information is completely secure.</p>
          <p>If a breach affects your personal information, we will tell you and the relevant authority as the law requires.</p>
        </> },
        { id: 'cookies', title: 'Cookies and local storage', body: <>
          <p>We ask before setting any cookies that are not essential. Until you choose, only your cookie choice itself is stored in your browser, so that we do not ask you again on every page.</p>
          <ul>
            <li><b>Analytics (Google Analytics 4).</b> Cookies such as <code>_ga</code> that count visits and show how the site is used: pages viewed, time on site, approximate location and device. IP addresses are anonymised.</li>
            <li><b>Marketing (Meta Pixel).</b> Cookies such as <code>_fbp</code> that let Meta measure our advertising on Facebook and Instagram and show it to people likely to be interested.</li>
          </ul>
          <p>Neither loads unless you allow it, and you can change your choice at any time: <CookieSettingsLink />. Turning a category off stops it from collecting anything further and removes the cookies it had set.</p>
        </> },
        { id: 'rights', title: 'Your rights', body: <>
          <p>You can ask us to tell you what information we hold about you, to correct or complete it, or to delete it, and you can withdraw your consent at any time. Withdrawing consent does not affect what was done before you withdrew it.</p>
          <p><b>In India,</b> you may also name another person to exercise these rights for you if you die or become unable to act.</p>
          <p><b>In the European Union or the United Kingdom,</b> you may also ask us to restrict how we use your information, object to our using it, and ask for a copy in a form you can pass to someone else.</p>
          <p>Write to the Grievance Officer at {mail}. We may ask for enough detail to be sure the request comes from you. We will reply within 30 days. If you are not satisfied with our reply, you may complain to the Data Protection Board of India, or to the data protection authority where you live.</p>
        </> },
        { id: 'links', title: 'Other websites', body: <p>This site links to other websites, such as Gloveda Herbals and our social media pages. Their own privacy policies apply when you visit them.</p> },
        { id: 'children', title: 'Children', body: <p>This website is meant for businesses and adults. We do not knowingly collect information from anyone under 18. If you believe a child has sent us their details, write to us and we will delete them.</p> },
        { id: 'changes', title: 'Changes to this policy', body: <p>If we change this policy, we will update it on this page and change the date at the top.</p> },
      ]}
    />
  );
}
