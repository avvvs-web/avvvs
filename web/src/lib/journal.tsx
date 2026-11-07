import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CONTACT } from './contact';

// The Journal: the articles from the old avvvs.com blog, rewritten.
// Every fact here restates the original posts (research/html) or the About page. The rewrite removes
// every efficacy claim ("cure", "side-effect free", "100% natural", "pain-free") and keeps what is
// verifiable: history, ingredients, how a medicine is made, and how to use Ayurveda responsibly.
// The formulation pieces still need AVVVS's sign-off before launch.

export type Kind = 'Heritage' | 'Guidance' | 'Formulations' | 'Clinic';

export interface Post {
  slug: string;
  title: string;
  dek: string;
  kind: Kind;
  /** first published on avvvs.com */
  published: string;
  /** this rewrite */
  revised: string;
  minutes: number;
  cover: { src: string; width: number; height: number; alt: string; position?: string };
  /** describes an AVVVS medicine: adds the practitioner note */
  formulation?: boolean;
  body: ReactNode;
}

const REVISED = '2026-11-08';

/** A list of names: the Sanskrit name, then what it is. */
function Ingredients({ items }: { items: [string, string][] }) {
  return (
    <dl className="jr-ingredients">
      {items.map(([n, d]) => (
        <div key={n}><dt>{n}</dt><dd>{d}</dd></div>
      ))}
    </dl>
  );
}

export const POSTS: Post[] = [
  {
    slug: 'a-pharmacy-in-kozhikode',
    title: 'A pharmacy, a blessing, and a hundred years',
    dek: 'How a small pharmacy in Kozhikode, begun with the encouragement of Sree Narayana Guru in 1921, became Arya Vaidya Vilasini Vaidya Sala.',
    kind: 'Heritage', published: '2023-10-03', revised: REVISED, minutes: 3,
    cover: { src: '/media/film/stills/k06.jpg', width: 1920, height: 1080, alt: 'A bundle of palm-leaf manuscripts beside a lit brass oil lamp.' },
    body: (
      <>
        <p>In 1921, Kaloor Neelakandan Vaidyar opened a pharmacy in Kozhikode. He did so at the urging of Sree Narayana Guru, who personally encouraged him to use his knowledge to build a place of care for people who had little access to it.</p>
        <p>The pharmacy prepared Ayurveda medicines and dispensed them. Its purpose was plain, and it has not changed: make medicines of good quality, and care for the community they are made for. AVVVS still describes its founding idea in two words. Social service.</p>
        <h2>Three generations</h2>
        <p>The founder&rsquo;s son, K. N. Ramadas Vaidyar (1934&ndash;1998), carried the work into its second generation. He was known well beyond it too, in Kozhikode&rsquo;s literary circles, for his satire.</p>
        <p>Today AVVVS is in its third generation, led by Managing Director Dr Manoj Kaloor, Ramadas Vaidyar&rsquo;s son, with Dr Reeja Manoj.</p>
        <h2>What changed, and what did not</h2>
        <p>The pharmacy became a manufacturer. AVVVS now makes classical and proprietary Ayurveda medicines in a GMP-certified factory in Kozhikode, where capsule, blister, ointment and cosmetic lines run beside traditional mechanised units. Its medicines are marketed across India and exported to Russia, Austria, Slovenia and Colombia, and its clinical work grew into the AVVVS Ayur Speciality Clinic.</p>
        <p>Through all of it, the Vaidya Sala has tried to do one difficult thing well: keep pace with new technology without giving up the traditions it was built on.</p>
        <blockquote>
          <p>To become a premier, multifaceted, ethical business organisation, dedicated to quality and governed by tradition, in the field of Ayurveda.</p>
          <cite>The AVVVS mission</cite>
        </blockquote>
        <p>AVVVS marked ninety years in 2011 and a hundred in 2021. The whole story, generation by generation, is on <Link href="/our-history">Our history</Link>.</p>
      </>
    ),
  },
  {
    slug: 'why-kerala',
    title: 'Why Kerala became the home of Ayurveda',
    dek: 'Forest, climate, old texts, and a people who valued living well: the reasons Ayurveda took such deep root on this coast.',
    kind: 'Heritage', published: '2023-10-03', revised: REVISED, minutes: 3,
    cover: { src: '/media/film/stills/k00.jpg', width: 1920, height: 1080, alt: 'Mist over forested hills at sunrise.' },
    body: (
      <>
        <p>The classical authors of Ayurveda, Charaka, Sushruta and Vagbhata, set down its methods and ideas long ago, and their teaching came down on palm-leaf manuscripts. What they wrote is still read, and much of it is still in use.</p>
        <p>Ayurveda grew up across India. But one region became its centre, and the reasons are worth knowing.</p>
        <h2>A landscape of medicine</h2>
        <p>Kerala lies between the Sahyadri, the Western Ghats, and the sea. Its hills and coastal plains give it a moderate climate, and the forests of the Sahyadri are rich in medicinal plants. What a vaidya needed usually grew close at hand.</p>
        <h2>The people who kept it</h2>
        <p>The land was only half of it. Kerala&rsquo;s people have long favoured a careful, healthy way of living, and that steady demand gave rise to eminent physicians, and to families who practised Ayurveda for generations.</p>
        <p>Knowledge, demand, climate and the plants themselves: together, they made Kerala the centre of Ayurveda.</p>
        <h2>A way of living, not only a remedy</h2>
        <p>Ayurveda is more than a set of medicines. It is a system of principles about how to live, built on the ideas of totality, individuality and wholesomeness, and in harmony with nature. A course of Ayurvedic care traditionally begins with purification, and goes on to diet, herbal preparations, massage, yoga and meditation.</p>
        <p>Used alongside conventional medical care, and under a qualified practitioner, it remains a thoughtful way to look after body and mind. AVVVS has made its medicines on this coast, in Kozhikode, since 1921.</p>
      </>
    ),
  },
  {
    slug: 'ayurveda-used-wisely',
    title: 'Ayurveda, used wisely',
    dek: 'Six things worth knowing before you begin any Ayurvedic treatment, from a Vaidya Sala that has made medicines for a century.',
    kind: 'Guidance', published: '2023-10-03', revised: REVISED, minutes: 3,
    cover: { src: '/media/film/stills/k03.jpg', width: 1920, height: 1080, alt: 'A hand holds a single leaf up to the light in a forest.' },
    body: (
      <>
        <p>Ayurvedic medicine deserves the same care as any other medicine. AVVVS makes its licensed proprietary medicines to GMP quality standards, and we would still give anyone who takes them the same advice.</p>
        <ol className="jr-steps">
          <li>
            <h2>See a trained practitioner</h2>
            <p>Many Ayurvedic preparations contain herbs, metals, minerals or other materials that can be harmful if they are used incorrectly, or without a trained practitioner&rsquo;s direction. Look into the training and background of anyone you consult.</p>
          </li>
          <li>
            <h2>Tell your doctor</h2>
            <p>Ayurvedic medicines can interact with conventional medicines, or work against them. Talk to your doctor about any Ayurvedic treatment you use.</p>
          </li>
          <li>
            <h2>Get the diagnosis right</h2>
            <p>Make sure any disease or condition has been diagnosed by a healthcare provider with substantial conventional medical training, and experience of managing that condition.</p>
          </li>
          <li>
            <h2>Use it alongside, not instead</h2>
            <p>Ayurveda can be a helpful complement to standard medical care. It should not replace it, especially for serious conditions.</p>
          </li>
          <li>
            <h2>Take extra care in pregnancy, and with children</h2>
            <p>If you are pregnant or nursing, or are thinking of Ayurvedic treatment for a child, speak to your healthcare provider first.</p>
          </li>
          <li>
            <h2>Know how it is regulated where you live</h2>
            <p>The rules differ from country to country. In the United States, for example, Ayurvedic products are regulated as dietary supplements rather than as drugs, so they are not held to the same safety and efficacy standards as conventional medicines.</p>
          </li>
        </ol>
      </>
    ),
  },
  {
    slug: 'mezhu-thailam',
    title: 'Mezhu Thailam: sesame, beeswax and resin',
    dek: 'A closer look at one of the oldest formulations AVVVS makes, and what goes into it.',
    kind: 'Formulations', published: '2023-10-03', revised: REVISED, minutes: 2, formulation: true,
    cover: { src: '/media/film/stills/k09.jpg', width: 1920, height: 1080, alt: 'Golden oil resting in a wide bronze uruli.' },
    body: (
      <>
        <p>The name says it plainly. <i>Mezhu</i> is wax, <i>thailam</i> is oil, and Mezhu Thailam is a century-old AVVVS formulation for external application, built on sesame oil and beeswax.</p>
        <h2>What goes into it</h2>
        <Ingredients items={[
          ['Tila thailam', 'Sesame oil, the base of the preparation'],
          ['Madhuchchhishta', 'Beeswax, from the Indian honey bee, Apis cerana indica'],
          ['Sarjarasa', 'The resin of Vateria indica'],
          ['Karpura', 'Camphor, from Cinnamomum camphora'],
          ['Devadaru', 'Himalayan cedar, Cedrus deodara'],
          ['Sambrani', 'Benzoin resin, from Styrax benzoin'],
          ['Shallaki', 'Boswellia serrata'],
        ]} />
        <h2>How it is made</h2>
        <p>Mezhu Thailam is prepared to a time-tested formula in AVVVS&rsquo;s GMP-certified factory in Kozhikode, to stringent quality standards. It has been part of what the Vaidya Sala makes for close to a hundred years.</p>
      </>
    ),
  },
  {
    slug: 'rujanth',
    title: 'Rujanth, in two forms',
    dek: 'A capsule and a liniment that share a name, and what each one is made from.',
    kind: 'Formulations', published: '2023-10-03', revised: REVISED, minutes: 3, formulation: true,
    cover: { src: '/media/journal/rujanth-liniment-2.jpg', width: 1300, height: 1950, position: '50% 62%', alt: 'A bottle and carton of Rujanth liniment on red silk.' },
    body: (
      <>
        <p>The name joins two words: <i>ruja</i>, pain, and <i>anth</i>, end. AVVVS makes Rujanth in two forms, capsules taken by mouth, which are easy to carry through a working day, and a liniment for external use.</p>
        <h2>Rujanth capsules</h2>
        <p>Made following the classical Ayurveda texts, the capsules bring together seven herbs.</p>
        <Ingredients items={[
          ['Guggulu', 'Commiphora mukul'],
          ['Shallaki', 'Boswellia serrata'],
          ['Rasna', 'Alpinia galanga'],
          ['Eranda', 'Castor, Ricinus communis'],
          ['Guduchi', 'Tinospora cordifolia'],
          ['Sahachara', 'Strobilanthes ciliatus'],
          ['Shunthi', 'Dry ginger, Zingiber officinale'],
        ]} />
        <figure className="jr-figure">
          <Image src="/media/journal/rujanth-liniment-1.jpg" width={1300} height={1950} sizes="(min-width: 760px) 420px, 80vw"
            alt="A bottle and carton of Rujanth liniment on a stone, against a rose-pink wall with trailing leaves." />
          <figcaption>Rujanth liniment.</figcaption>
        </figure>
        <h2>Rujanth liniment</h2>
        <p>The liniment pairs herbal oils with three familiar ingredients for the skin: liquid paraffin, methyl salicylate and menthol. Its herbs are these.</p>
        <Ingredients items={[
          ['Bala', 'Sida cordifolia'],
          ['Raktamaricha', 'Red chilli, Capsicum annuum'],
          ['Sahachara', 'Strobilanthes ciliatus'],
          ['Shigru', 'Drumstick, Moringa oleifera'],
          ['Nirgundi', 'Vitex negundo'],
          ['Eranda', 'Castor, Ricinus communis'],
          ['Tila', 'Sesame, Sesamum indicum'],
          ['Karpura', 'Camphor, Cinnamomum camphora'],
        ]} />
        <p>Both are made in AVVVS&rsquo;s GMP-certified factory in Kozhikode.</p>
      </>
    ),
  },
  {
    slug: 'lakshol',
    title: 'Lakshol: lac, camphor and cedar',
    dek: 'Three ingredients, one oil, and the habits of modern life it was made with in mind.',
    kind: 'Formulations', published: '2023-10-03', revised: REVISED, minutes: 2, formulation: true,
    cover: { src: '/media/film/stills/k10.jpg', width: 1920, height: 1080, alt: 'Golden oil poured through muslin into an amber glass jar.' },
    body: (
      <>
        <p>Ayurveda places health in a balance of body, mind and spirit, kept by the way we live from day to day. Modern routines make that balance harder to keep: long hours at a desk, long drives, poor posture, irregular meals, and the same few joints used over and over, at every age.</p>
        <p>AVVVS made Lakshol, an oil for external use, with those routines in mind. It has just three ingredients.</p>
        <Ingredients items={[
          ['Laksha', 'Lac, the resin of the lac insect, Laccifer lacca'],
          ['Karpura', 'Camphor, from Cinnamomum camphora'],
          ['Devadaru', 'Himalayan cedar, Cedrus deodara'],
        ]} />
        <h2>How it is made</h2>
        <p>Like every AVVVS medicine, Lakshol is made to a tested formula in a GMP-certified factory in Kozhikode, to stringent quality standards. AVVVS recommends speaking to an Ayurveda doctor before using it.</p>
      </>
    ),
  },
  {
    slug: 'hairgreens',
    title: 'Hairgreens, and the slow care of hair',
    dek: 'Why AVVVS doctors begin with the cause, and what goes into Hairgreens hair oil.',
    kind: 'Formulations', published: '2023-10-03', revised: REVISED, minutes: 3, formulation: true,
    cover: { src: '/media/journal/hairgreens-oil.jpg', width: 802, height: 1199, position: '50% 45%', alt: 'A bottle of Hairgreens hair oil on a yellow ground, with gooseberries, coconut halves and herbs.' },
    body: (
      <>
        <p>Hair often shows what the rest of life is doing. A fast, demanding routine, an irregular diet, too little exertion or too much, pollution, and harsh chemical or heat treatments can all show up there first. So can things further below the surface: nutritional deficiencies, thyroid and hormonal conditions, and some medicines.</p>
        <h2>Begin with the cause</h2>
        <p>That is why AVVVS doctors, who bring experience in trichology and in general health, begin with a detailed health assessment, online or in person, before they suggest anything. Care may then take the form of medicines, oils, shampoos, or head and hair therapies from the Panchakarma tradition.</p>
        <h2>Hairgreens hair oil</h2>
        <p>Hairgreens is the AVVVS hair oil, for everyday care. It is made with four herbs.</p>
        <Ingredients items={[
          ['Vibhitaki', 'One of the three fruits of the classical triphala'],
          ['Bhringaraja', 'Eclipta prostrata'],
          ['Amalaki', 'Indian gooseberry, Emblica officinalis'],
          ['Neelini', 'Indigofera tinctoria'],
        ]} />
        <h2>How to use it</h2>
        <p>Massage the oil into the scalp and hair, leave it for fifteen minutes, then wash it out with Hairgreens shampoo. AVVVS recommends speaking to an Ayurveda doctor before using any haircare medicine.</p>
      </>
    ),
  },
  {
    slug: 'the-clinic',
    title: 'Inside the AVVVS Ayur Speciality Clinic',
    dek: 'Specialist departments and the classical therapies of Kerala, in the middle of Kozhikode.',
    kind: 'Clinic', published: '2023-10-14', revised: REVISED, minutes: 3,
    cover: { src: '/media/film/stills/k02.jpg', width: 1920, height: 1080, alt: 'A shaft of sunlight falls on a flowering herb on the forest floor.' },
    body: (
      <>
        <p>The clinic began with the pharmacy. When Kaloor Neelakandan Vaidyar founded AVVVS in 1921, he set out to build a place of care. Today that work is the AVVVS Ayur Speciality Clinic, where specialised doctors see patients in focused departments.</p>
        <h2>The departments</h2>
        <dl className="jr-depts">
          <div><dt>Women&rsquo;s Health</dt><dd>Ayurvedic care, and guidance on ways of living, for the health concerns women face.</dd></div>
          <div><dt>Skin and Hair Care</dt><dd>Face and skin therapies using herbal skin care products, tailored to each person, combining Ayurvedic formulations with modern skin care equipment.</dd></div>
          <div><dt>Headache</dt><dd>Ayurvedic care for headaches. Most headaches are common and pass; one that persists should always be medically evaluated.</dd></div>
          <div><dt>Lifestyle</dt><dd>For health problems that grow out of changes in habits, surroundings and food, with a way of living shaped to each person&rsquo;s life and work.</dd></div>
          <div><dt>Pregnancy and Postnatal Care</dt><dd>Outpatient care for mothers, before and after birth.</dd></div>
        </dl>
        <h2>Keraleeya Panchakarma</h2>
        <p>The clinic also offers the classical therapies of Kerala, among them Sarvanga Abhyanga, Pizhichil, Shirodhara, Elakizhi, Njavarakizhi and Udwarthanam.</p>
        <p>To book a consultation, visit the clinic at <a href={CONTACT.clinic} rel="noopener">clinic.avvvs.com</a>.</p>
      </>
    ),
  },
];

export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug);

export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

/** The next two pieces to read: same kind first, then whatever follows. */
export function readNext(slug: string, n = 2) {
  const me = getPost(slug)!;
  const rest = POSTS.filter((p) => p.slug !== slug);
  const same = rest.filter((p) => p.kind === me.kind);
  const others = rest.filter((p) => p.kind !== me.kind);
  return [...same, ...others].slice(0, n);
}
