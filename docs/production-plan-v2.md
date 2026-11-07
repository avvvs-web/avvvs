# The Golden Thread: production plan v2 (Higgsfield)

Written 2026-11-07, after the move to Higgsfield Pro (600 credits). Follows the bible
(https://claude.ai/artifact/9XyPwgz16dAE8RwnNusNgG): one continuous camera, physical transitions,
gold only in the thread and the drop, no green in the grade, no factory shown, no invented history,
no readable invented script, type set on the page.

## What changes in the story

The bible's chain stays: leaf → vein → script → lineage → thread → drop → medicine → precision → AVVVS.
Two changes make it tighter and make every transition physical:

1. **The manuscript's binding cord becomes the golden thread.** Palm-leaf manuscripts are bound with
   a cord through holes in the leaves. Instead of cutting from the heritage type to Blender threads,
   the cord through the stack starts to glow and lifts out: knowledge literally becomes the thread.
2. **The film ends on ivory.** The last shot draws the thread across ivory paper into light, so the
   film hands over to the light-themed destinations with no seam.

## Shots and costs

Model: Kling 3.0 Pro, silent, 16:9 (1.75 credits per second). Every clip is generated from a start
still and an end still (GPT Image 2.6, 0.25 credits each), and each clip's end still is the next
clip's start still, so cuts are invisible.

| # | Scene | Shot | Length | Source | Credits |
|---|---|---|---|---|---|
| 1 | Forest | Canopy descent (have it) | 10 s | Gemini clip, upscale to 1080p | 10 |
| 2 | Forest | Understory dolly to a single light shaft landing on a Tulsi plant | 10 s | Kling | 17.5 |
| 3 | Leaf | A hand takes one leaf (macro). Risky for AI hands: one try, fall back to a live shot | 5 s | Kling | 8.75 |
| 4 | Leaf | Leaf held to low sun, veins glow gold | 5 s | Kling | 8.75 |
| 5 | Knowledge | Veins become incised lines on a palm leaf; soot rubbed in reveals rows of marks (never legible script) | 10 s | Kling | 17.5 |
| 6 | 1921 | A bound stack of palm-leaf manuscripts in lamp light, slow push. Plate behind the heritage type | 10 s | Kling | 17.5 |
| 7 | Thread | The binding cord glows gold and lifts out of the stack | 5 s | Kling | 8.75 |
| 8 | Thread | Threads converge, the drop forms and falls into oil | 9 s | Blender (free, render final locally) | 0 |
| 9 | Medicine | Herbs simmering in oil in a bronze uruli, slow stir: how a thailam is made | 10 s | Kling | 17.5 |
| 10 | Medicine | Finished oil poured through cloth into an unlabelled amber bottle | 5 s | Kling | 8.75 |
| 11 | Precision | A perfect grid of identical capsules; a line of light sweeps across | 5 s | Kling | 8.75 |
| 12 | Precision | One drop lands on a precision balance; the reading settles | 5 s | Kling | 8.75 |
| 13 | Return | The golden thread draws across ivory paper into light | 5 s | Kling | 8.75 |
| | | Keyframe stills, about 30 with variants | | GPT Image 2.6 | ~8 |
| | | **First pass** | | | **~158** |
| | | Retakes (about one in two shots redone) | | | ~80 |
| | | **Expected total** | | | **~240 of 600** |

No AVVVS packaging, logos or factory are generated: products stay unlabelled, and type is set on the page.
Shots 3 and 12 are the riskiest; if they fail after one retake, they fall back to a live shot or are cut.

## Spending in stages

1. **Stills (~8 credits).** Generate the start and end stills for every shot. You approve the look before any video is made.
2. **Video (~150 credits).** Generate the clips from the approved stills, one sequence at a time, and review each.
3. **Retakes and upscale (~80 credits).** Only for shots that miss.

About 360 credits stay in reserve.

## Scroll: one continuous film, no gaps

Today each scene pins and releases on its own, so a screen-height of scroll passes between scenes;
waiting scenes show placeholders; the parchment heritage section breaks the dark film; and the
dark film meets the ivory destinations at a hard edge.

New structure:
- **One pinned stage for the whole film.** All clips sit stacked in one stage that stays pinned from
  the first frame to the last. One scroll timeline drives it, with a chapter range per clip.
- **Clips meet frame to frame.** Because each clip ends on the next clip's first frame, the hand-over
  is a 2% crossfade nobody can see. No scene ever scrolls in from below.
- **Heritage is type over shot 6**, set in ivory on the manuscript plate, so it is part of the film.
- **The stage releases on ivory** (shot 13) straight into the destinations: no edge.
- **Pacing:** about 1 screen-height of scroll per 4 seconds of film, with holds where a card must be read.
  The rail follows the same chapter ranges.
- **Loading:** the next two clips preload while the current one plays; clips are encoded with dense
  keyframes for smooth seeking; mobile gets a 720p encode.
- **Reduced motion:** the film becomes a column of stills with their cards, as now.
