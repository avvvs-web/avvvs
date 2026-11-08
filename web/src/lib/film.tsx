import type { ReactNode } from 'react';

/**
 * The Golden Thread as one continuous film. Clips play in this order inside a single pinned stage.
 * Each clip ends on the exact frame the next one starts on (see film/shots.json), so the hand-over
 * between layers is invisible.
 *
 * - `weight`: screen-heights of scrolling this clip takes.
 * - `playShare`: share of that scroll over which the clip plays; the rest holds on its last frame
 *   (used where type needs reading time).
 * - `video`: file in public/media/film/ once it exists; until then `still` (the clip's first frame) stands in.
 * - `light`: the frame is bright, so cards switch to ink and the scrim goes.
 * - Card `in`/`out` are 0–1 through the clip.
 */

export interface FilmCard {
  in: number;
  out?: number;
  variant?: 'hero' | 'center' | 'right';
  content: ReactNode;
}

export interface Clip {
  id: string;
  chapter?: string; // the rail label that starts here
  weight: number;
  playShare?: number;
  video?: string;
  still: string;
  alt: string; // what the clip shows, for screen readers and image search
  light?: boolean;
  heritage?: boolean; // the 1921 type plays over this clip
  cards?: FilmCard[];
}

const M = '/media';

export const CLIPS: Clip[] = [
  {
    id: 'forest', alt: 'Dawn over the misty ridges of the Western Ghats; the camera sinks slowly through the forest canopy.', chapter: 'The forest', weight: 2.4, video: `${M}/film/s01.mp4`, still: `${M}/film/stills/k00.jpg`,
    cards: [
      {
        in: 0, out: 0.32, variant: 'hero',
        content: (
          <>
            <h1 id="hero-title">Arya Vaidya Vilasini Vaidya Sala</h1>
            <p className="ml" lang="ml">ആര്യവൈദ്യ വിലാസിനി വൈദ്യശാല</p>
            <p className="meta">Kozhikode, Kerala · since 1921</p>
            <p className="cue" aria-hidden="true">Scroll to begin</p>
          </>
        ),
      },
      {
        in: 0.45, out: 0.95,
        content: (
          <>
            <h2>Every medicine begins in a forest.</h2>
            <p>For generations, Kerala&apos;s physicians have gathered their herbs from the Sahyadri, the Western Ghats. This is where the thread starts.</p>
          </>
        ),
      },
    ],
  },
  {
    id: 's02', alt: 'Through the green understory of the forest to a single tulsi plant standing in a shaft of light.', weight: 2, video: `${M}/film/s02.mp4`, still: `${M}/film/stills/k01.jpg`,
    cards: [{ in: 0.35, out: 0.95, content: (<><h2 id="story">First, the right plant.</h2><p>Each formulation calls for particular herbs, known by name and gathered with care.</p></>) }],
  },
  {
    id: 's03', alt: 'A hand reaches in and picks one leaf from the plant.', chapter: 'The leaf', weight: 1.4, video: `${M}/film/s03.mp4`, still: `${M}/film/stills/k02.jpg`,
    cards: [{ in: 0.2, out: 0.95, content: (<><h2>Chosen by hand.</h2><p>Knowing which leaf to take, and when, is the first part of the craft.</p></>) }],
  },
  {
    // held to the sun, the veins glow gold: the film's thread appears for the first time
    id: 's04', alt: 'The picked leaf held up to the sun; its veins begin to glow gold.', weight: 1.4, video: `${M}/film/s04.mp4`, still: `${M}/film/stills/k03.jpg`,
    cards: [{ in: 0.45, out: 0.95, variant: 'center', content: (<><h2>Inside every leaf, a thread.</h2></>) }],
  },
  {
    id: 's05', alt: 'The glowing veins become the inscribed lines of a palm-leaf manuscript.', chapter: 'The manuscripts', weight: 2.2, video: `${M}/film/s05.mp4`, still: `${M}/film/stills/k04.jpg`,
    cards: [
      { in: 0.15, out: 0.5, content: (<><h2>Knowledge, kept in leaves.</h2><p>Kerala&apos;s physicians recorded their formulations on palm-leaf manuscripts.</p></>) },
      { in: 0.58, out: 0.95, content: (<><h2>Copied by hand. Passed down.</h2><p>Each line was cut with a stylus, darkened with soot and carried from one generation to the next.</p></>) },
    ],
  },
  // the manuscripts: the 1921 type plays over the held frame
  { id: 's06', alt: 'The camera pulls back to an open bundle of palm-leaf manuscripts beside an oil lamp.', chapter: 'Since 1921', weight: 2.6, playShare: 0.6, video: `${M}/film/s06.mp4`, still: `${M}/film/stills/k05.jpg`, heritage: true },
  {
    // the binding cord lifts out of the bundle as the golden thread
    id: 's07', alt: 'The cord binding the manuscripts glows gold and lifts away into the dark.', weight: 1.4, video: `${M}/film/s07.mp4`, still: `${M}/film/stills/k06.jpg`,
    cards: [{ in: 0.15, out: 0.85, variant: 'center', content: (<><h2>One thread, unbroken since 1921.</h2></>) }],
  },
  {
    id: 'thread', alt: 'Golden threads gather into a single drop that falls into still oil and sends out rings.', chapter: 'The formula', weight: 3, video: `${M}/b4-thread.mp4`, still: `${M}/b4-thread.jpg`,
    cards: [
      { in: 0.06, out: 0.34, variant: 'center', content: (<><h2>Many ingredients.</h2><p>Roots, leaves, bark, seeds and oils, each with its own part to play.</p></>) },
      { in: 0.42, out: 0.62, variant: 'center', content: (<><h2>One formulation.</h2><p>Brought together exactly as its formula was written down, and handed on through the generations.</p></>) },
    ],
  },
  {
    id: 's09', alt: 'The rings open out into a wide bronze uruli of golden-brown medicated oil, gently simmering.', chapter: 'The medicine', weight: 2, video: `${M}/film/s09.mp4`, still: `${M}/film/stills/k08.jpg`,
    cards: [{ in: 0.2, out: 0.95, content: (<><h2>Then, medicine.</h2><p>Prepared slowly, step by step, the way its formula has always asked.</p></>) }],
  },
  {
    id: 's10', alt: 'The finished oil is poured through white cotton cloth into an amber glass bottle on dark wood.', weight: 1.6, video: `${M}/film/s10.mp4`, still: `${M}/film/stills/k09.jpg`,
    cards: [{ in: 0.15, out: 0.95, content: (<><h2>One of more than 300.</h2><p>AVVVS makes more than 300 formulations: classical medicines prepared to the texts, and proprietary formulae made in-house, Mezhu Thailam, Rujanth, Slepan, Red Irons and Lakshol among them.</p></>) }],
  },
  {
    // the pour blooms into light and comes out on the capsule grid
    id: 's11', alt: 'The camera rises from the bottle into warm light, and a faint world map appears on ivory paper.', chapter: 'The standard', weight: 2.2, video: `${M}/film/s11.mp4`, still: `${M}/film/stills/k10.jpg`, light: true,
    cards: [
      { in: 0.4, out: 0.95, content: (<><h2>Tradition, made to standard.</h2><p>In our GMP-certified factory in Kozhikode, capsule, blister, ointment and cosmetic lines work alongside traditional mechanised units, and stringent quality control measures are in place.</p></>) },
    ],
  },
  // gold routes run out from Kozhikode across the map, then the frame fades through white to the
  // gold thread on ivory paper: the stage releases straight into the destinations
  {
    id: 's14', alt: 'Gold threads run from Kozhikode across a world map to Austria, Slovenia, Russia and Colombia; then a single gold thread draws itself across ivory paper.', weight: 2.8, video: `${M}/film/s14.mp4`, still: `${M}/film/stills/k11.jpg`, light: true,
    cards: [
      { in: 0.04, out: 0.5, variant: 'right', content: (<><h2>Made in Kozhikode. Sent abroad.</h2><p>Marketed throughout India, and exported to Russia, Austria, Slovenia and Colombia.</p></>) },
      { in: 0.66, out: 0.98, variant: 'center', content: (<><h2>Where the thread goes next is up to you.</h2></>) },
    ],
  },
];

export const FOUNDED = 1921;
