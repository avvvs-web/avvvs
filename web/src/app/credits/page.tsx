import type { Metadata } from 'next';
import { alternatesFor } from '@/lib/site';
import { LegalPage } from '@/components/LegalPage';

// The open-source software this website is built with, and the licence each is used under.
// Keep in step with web/package.json when a dependency is added or removed.

export const metadata: Metadata = {
  title: 'Open-source credits',
  description: 'The open-source software the Arya Vaidya Vilasini Vaidya Sala (AVVVS) website is built with, and the licences it is used under.',
  alternates: alternatesFor('/credits'),
};

const MIT = 'https://opensource.org/license/mit';
const SOFTWARE: { name: string; by: string; href: string; licence: string; terms: string }[] = [
  { name: 'Next.js', by: 'Vercel, Inc.', href: 'https://nextjs.org', licence: 'MIT', terms: MIT },
  { name: 'React and React DOM', by: 'Meta Platforms, Inc. and affiliates', href: 'https://react.dev', licence: 'MIT', terms: MIT },
  { name: 'three.js', by: 'three.js authors', href: 'https://threejs.org', licence: 'MIT', terms: MIT },
  { name: 'Anime.js', by: 'Julian Garnier', href: 'https://animejs.com', licence: 'MIT', terms: MIT },
  { name: 'Lenis', by: 'darkroom.engineering', href: 'https://github.com/darkroomengineering/lenis', licence: 'MIT', terms: MIT },
  { name: 'GSAP and @gsap/react', by: 'GreenSock, Inc.', href: 'https://gsap.com', licence: 'GSAP standard licence', terms: 'https://gsap.com/standard-license' },
  { name: 'Nodemailer', by: 'Andris Reinman', href: 'https://nodemailer.com', licence: 'MIT-0', terms: 'https://opensource.org/license/mit-0' },
  { name: 'Neon serverless driver', by: 'Neon, Inc.', href: 'https://neon.com', licence: 'MIT', terms: MIT },
  { name: 'Vercel Blob', by: 'Vercel, Inc.', href: 'https://vercel.com/storage/blob', licence: 'Apache 2.0', terms: 'https://www.apache.org/licenses/LICENSE-2.0' },
];

export default function Credits() {
  return (
    <LegalPage
      kicker="Legal"
      title="Open-source credits"
      updated="14 November 2026"
      intro={<p>This website is built with open-source software. We are grateful to the people who make it. Each work below remains the property of its authors and is used under the licence named beside it.</p>}
      sections={[
        { id: 'software', title: 'Software', body: <ul>
          {SOFTWARE.map((s) => (
            <li key={s.name}><a href={s.href} rel="noopener">{s.name}</a>, by {s.by.replace(/\.$/, '')}. <a href={s.terms} rel="noopener">{s.licence}</a>.</li>
          ))}
        </ul> },
        { id: 'type', title: 'Typefaces', body: <p>Malayalam and supporting text is set in <a href="https://fonts.google.com/specimen/Manjari" rel="noopener">Manjari</a>, by Santhosh Thottingal and Kavya Manohar, used under the <a href="https://openfontlicense.org" rel="noopener">SIL Open Font License 1.1</a>.</p> },
      ]}
    />
  );
}
