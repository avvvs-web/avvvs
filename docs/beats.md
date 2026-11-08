# The Golden Thread: beat sheet

The homepage plays the film as one continuous scroll: every clip sits in a single pinned stage and
each one ends on the exact frame the next one starts from. Clips, scroll lengths and cards live in
`web/src/lib/film.tsx`; the 1921 type is in `web/src/components/FilmStage.tsx`. Shot prompts and
Higgsfield job IDs: `film/shots.json`, `film/jobs.json`, `film/jobs_v2.json`.

The thread runs through the words as well as the pictures: it first shows in the glowing veins,
becomes the manuscript cord, gathers into the drop, and is handed to the partner at the end.

| Beat | Clip (web/public/media) | What we see | Card copy |
|---|---|---|---|
| Forest | `film/s01.mp4` (Kling) | Dawn over the Western Ghats; the camera sinks through the canopy | **Arya Vaidya Vilasini Vaidya Sala** · ആര്യവൈദ്യ വിലാസിനി വൈദ്യശാല · Kozhikode, Kerala · since 1921 → **Every medicine begins in a forest.** For generations, Kerala's physicians have gathered their herbs from the Sahyadri, the Western Ghats. This is where the thread starts. |
| | `film/s02.mp4` | Through the understory to a Tulsi plant in a shaft of light | **First, the right plant.** Each formulation calls for particular herbs, known by name and gathered with care. |
| Leaf | `film/s03.mp4` | A hand picks one leaf | **Chosen by hand.** Knowing which part of each plant to take, whether leaf, root, bark or seed, and when, is where the craft begins. |
| | `film/s04.mp4` | The leaf turned to the sun; its veins glow gold | **Inside every leaf, a thread.** |
| Knowledge | `film/s05.mp4` | The veins become the grooves of a palm-leaf manuscript | **Knowledge, kept in leaves.** Kerala's physicians recorded their formulations on palm-leaf manuscripts. → **Copied by hand. Passed down.** Each line was cut with a stylus, darkened with soot and carried from one generation to the next. |
| 1921 | `film/s06.mp4` | Pull back to the open, lamp-lit bundle | **1921 Kozhikode** · Founded by Kaloor Neelakandan Vaidyar as a pharmacy for the people of Kozhikode, and carried by his family for three generations. · [years since 1921, live] years of AVVVS · link: Our story since 1921 (the full history is on `/our-history`) |
| | `film/s07.mp4` | The binding cord glows and lifts away; fade to black | **One thread, unbroken since 1921.** |
| Formulation | `b4-thread.mp4` (Blender) | Threads gather; a gold drop forms and falls into oil | **Many ingredients.** Roots, leaves, bark, seeds and oils, each with its own part to play. → **One formulation.** Brought together exactly as its formula was written down, and handed on through the generations. |
| Medicine | `film/s09.mp4` | The ripples open into a bronze uruli of simmering oil | **Then, medicine.** Prepared slowly, step by step, the way its formula has always asked. (Kept generic to any medicine, not the thailam method: user, 2026-11-08.) |
| | `film/s10.mp4` | The oil is poured through cloth into a bottle | **One of more than 300.** AVVVS makes more than 300 formulations: classical medicines prepared to the texts, and proprietary formulae made in-house. (The film follows one medicine, then widens out: user flagged the old "One formulation" / "300 formulations" disconnect, 2026-11-08.) |
| Precision | `film/s11.mp4` | The camera rises from the bottle into warm light; a faint world map appears on ivory paper | **Tradition, made to standard.** In our GMP-certified factory in Kozhikode, capsule, blister, ointment and cosmetic lines work alongside traditional mechanised units, and stringent quality control measures are in place. |
| | `film/s14.mp4` (built by `film/build_s14.sh`) | Gold routes run from Kozhikode to Vienna, Ljubljana, Moscow and Bogotá (drawn in code by `film/routes.py`, so the geography is exact); then a fade through white to a gold thread on ivory paper | **Made in Kozhikode. Sent abroad.** Marketed throughout India, and exported to Russia, Austria, Slovenia and Colombia. → **Where the thread goes next is up to you.** |
| AVVVS | live Three.js | The thread carries on under the mark to five destinations | One thread, five ways to work with us: AVVVS Manufacturing · AVVVS Ayur Speciality Clinic · Gloveda Herbals · Gloveda Experience · Gloveda Revive |

## Copy rules
- Every factual line comes from avvvs.com (`research/`) or from the user. No medical claims.
- Awaiting AVVVS approval: the Sree Narayana Guru line, the line about Ramadas Vaidyar's wit, the
  Gloveda Experience and Revive descriptions, and the clinic description. (The thailam line was replaced with a generic one, 2026-11-08.)
- Type is set on the page, never burned into video.

## Adding or replacing a clip
`sh film/fetch.sh S05 <result_url>` downloads it, makes a half-second audit strip in `film/audit/`
and encodes it (graded, dense keyframes for scrubbing) into `web/public/media/film/`.
`sh film/reel.sh` cuts the whole film into `film/preview_reel.mp4`.
