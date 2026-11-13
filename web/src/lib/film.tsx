import type { ReactNode } from 'react';

/**
 * The Golden Thread as one continuous film. Clips play in this order inside a single pinned stage.
 * Each clip ends on the frame the next one starts on (see film/shots.json), so the joins don't show.
 *
 * - `weight`: screen-heights of scrolling this clip takes.
 * - `playShare`: share of that scroll over which the clip plays; the rest holds on its last frame
 *   (used where type needs reading time).
 * - `frames`: the clip's frame sequence, which FilmStage scrubs on a canvas.
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
  frames: string; // its folder of frames in public/media/film/v3/<set>/ (see film/encode_frames.sh)
  still?: number; // the frame shown when the film is laid out as a column (reduced motion); the first if not given
  alt: string; // what the clip shows, for screen readers and image search
  light?: boolean;
  heritage?: boolean; // the 1921 type plays over this clip
  cards?: FilmCard[];
}

export const CLIPS: Clip[] = [
  {
    id: 'forest', alt: 'Dawn over the misty ridges of the Western Ghats; the camera sinks slowly through the forest canopy.', chapter: 'The forest', weight: 2.4, frames: 's01',
    cards: [
      {
        in: 0, out: 0.32, variant: 'hero',
        content: (
          <>
            <h1 id="hero-title">Arya Vaidya Vilasini Vaidya Sala</h1>
            <p className="ml" lang="ml">ആര്യവൈദ്യ വിലാസിനി വൈദ്യശാല</p>
            <p className="meta">Kozhikode, Kerala · Since 1921</p>
            <p className="cue" aria-hidden="true">Scroll to begin</p>
          </>
        ),
      },
      {
        in: 0.45, out: 0.95,
        content: (
          <>
            <h2>The wisdom of Ayurveda begins with nature</h2>
            <p>For generations, Kerala&apos;s physicians have drawn on the medicinal wealth of the Sahyadri, the Western Ghats. This is where the thread starts.</p>
          </>
        ),
      },
    ],
  },
  {
    id: 's02', alt: 'Through the green understory of the forest to a single tulsi plant standing in a shaft of light.', weight: 2, frames: 's02',
    cards: [{ in: 0.35, out: 0.95, content: (<><h2 id="story">First, the right plant</h2><p>Each formulation calls for specific herbs, selected with precision and gathered with care.</p></>) }],
  },
  {
    id: 's03', alt: 'A hand reaches in and picks one leaf from the plant.', chapter: 'The leaf', weight: 1.4, frames: 's03',
    cards: [{ in: 0.2, out: 0.95, content: (<><h2>Chosen by hand</h2><p>Knowing which part of each plant to use, whether leaf, root, bark or seed, and the right time to gather it, is where the craft begins.</p></>) }],
  },
  {
    // held to the sun, the veins glow gold: the film's thread appears for the first time
    id: 's04', alt: 'The picked leaf held up to the sun; its veins begin to glow gold.', weight: 1.4, frames: 's04',
    cards: [{ in: 0.45, out: 0.95, variant: 'center', content: (<><h2>Inside every leaf, a thread</h2></>) }],
  },
  {
    id: 's05', alt: 'The glowing veins become the inscribed lines of a palm-leaf manuscript.', chapter: 'The manuscripts', weight: 2.2, frames: 's05',
    cards: [
      { in: 0.15, out: 0.5, content: (<><h2>Knowledge, kept in leaves</h2><p>Kerala&apos;s physicians used to record their formulations on palm-leaf manuscripts.</p></>) },
      { in: 0.58, out: 0.95, content: (<><h2>Copied by hand, preserved through time</h2><p>Each line was cut with a stylus, darkened with soot and carried from one generation to the next.</p></>) },
    ],
  },
  // the manuscripts: the 1921 type plays over the held frame
  { id: 's06', alt: 'The camera pulls back to an open bundle of palm-leaf manuscripts beside an oil lamp.', chapter: 'Since 1921', weight: 2.6, playShare: 0.6, frames: 's06', heritage: true },
  {
    // the binding cord lifts out of the bundle as the golden thread
    id: 's07', alt: 'The cord binding the manuscripts glows gold and lifts away into the dark.', weight: 1.4, frames: 's07',
    cards: [{ in: 0.15, out: 0.85, variant: 'center', content: (<><h2>One thread, unbroken since 1921</h2></>) }],
  },
  {
    id: 'thread', alt: 'Golden threads gather into a single drop that falls into still oil and sends out rings.', chapter: 'The formula', weight: 3, frames: 'b4-thread',
    cards: [
      { in: 0.06, out: 0.34, variant: 'center', content: (<><h2>Many ingredients</h2><p>Roots, leaves, bark, seeds and oils, each with an essence of its own.</p></>) },
      { in: 0.42, out: 0.62, variant: 'center', content: (<><h2>One formulation</h2><p>Brought together as it was written and passed down through the generations.</p></>) },
    ],
  },
  {
    id: 's09', alt: 'The rings open out into a wide bronze uruli of golden-brown medicated oil, gently simmering.', chapter: 'The medicine', weight: 2, frames: 's09',
    cards: [{ in: 0.2, out: 0.95, content: (<><h2>Made with precision</h2><p>Prepared slowly, step by step, in tune with the original formula.</p></>) }],
  },
  {
    id: 's10', alt: 'The finished oil is poured through white cotton cloth into an amber glass bottle on dark wood.', weight: 1.6, frames: 's10',
    cards: [{ in: 0.15, out: 0.95, content: (<><h2>300+ formulations</h2><p>AVVVS makes more than 300 formulations, including classical medicines prepared according to traditional texts and proprietary formulations developed in-house.</p></>) }],
  },
  {
    // the pour becomes the gold thread, which draws the factory in one line and is drawn through
    // into the dot at Kozhikode on the map (film/factory/draw.html)
    id: 'factory', alt: 'The stream of oil becomes a gold thread that draws, in one line, a stirred steel vessel, a capsule-filling machine, a blister-packing machine and a tube-filling machine, each with what it makes beside it, then a laboratory flask under a burette; a drop falls and the flask fills. The thread then runs out across a world map to Kozhikode.',
    chapter: 'The standard', weight: 4.6, frames: 'standard-v2', still: 205,
    cards: [
      { in: 0.22, out: 0.8, content: (<><h2>Tradition meets modern standards</h2><p>At our GMP-certified manufacturing facility in Kozhikode, capsule, blister-packaging, ointment and cosmetic production lines operate alongside traditional manufacturing units, supported by stringent quality-control measures.</p></>) },
    ],
  },
  // gold routes run out from Kozhikode across the map, then the frame fades through white to the
  // gold thread on ivory paper: the stage releases straight into the destinations
  {
    id: 's14', alt: 'Gold threads run from Kozhikode across a world map to Austria, Slovenia, Russia, Colombia and on towards the United States; then a single gold thread draws itself across ivory paper.', weight: 2.8, frames: 's14', light: true,
    cards: [
      { in: 0.04, out: 0.5, variant: 'right', content: (<><h2>Made in Kerala, carried across the world</h2><p>Our products are sold across India and exported to the United States, Russia, Austria, Slovenia, Colombia and beyond.</p></>) },
    ],
  },
];

export const FOUNDED = 1921;
