# Crabby Cartoons — plan v.003
Product: **Crabby Beach v.136**

Status: **ep 1.1 beat A in progress**. Later beats wait for look lock.

Fun extra. Shorts live in **Cinema**. Gameplay stays the same.

## Format (locked)

| | |
|---|---|
| Size | **480p** (`854×480`), landscape 16:9 |
| Beat | **6 seconds** |
| Episode | one beat, or 2–3 beats stitched (`12s` / `18s`) |
| Files | `public/game/cinema/` offline |
| Star | **original red Crabby** (`idle-red-0.png`) — not a new drawing |
| Voice | `public/voice/crabby/canon.json` muxed on. Never Imagine’s baked speech. |
| Camera | **wide**. Whole crab + sand + a strip of ocean. No face close-up. |
| Text on picture | none. No subtitles burned in. Captions, if any, sit at the **bottom** of the player. |

## Visual bible (look lock)

Beat A is the look lock. Later beats copy this crab, not a new one.

- Round red shell, **two** eyes on top, green paintbrush in a claw
- Cute, happy, toddler cartoon — not scary, not realistic
- Sunny beach, same world as the game
- He fits in the lower half of the frame with room around him

**How we keep him the same crab:** Imagine **reference-to-video** from `idle-red-0.png` (he can be in a real cartoon scene). Do **not** paste the PNG on `beach.jpg` and image-to-video that still — that is junk.

## How a clip is made

Imagine often cannot write `/workspace/artifacts`. Same as stills.

1. Still: original crab on `beach.jpg` → `public/game/cinema/stills/s01e01a.png`
2. `python3 scripts/imagine-video.py --image that.png --seconds 6 --out public/game/cinema/raw/s01e01a.mp4`  
   (JWT → `POST /v1/videos/generations` → download `vidgen.x.ai` **this turn**.)
3. Put Crabby's voice IN THE PROMPT from `public/voice/crabby/canon.json` notes: high-pitched squeaky American little-boy, about six, helium-squeaky, goofy, bouncy, silly, exaggerated happy intonation, light and airy not deep, US kid, Saturday-morning cartoon crab. NOT British. NOT a woman. NOT a mom. NOT an adult man. NOT a narrator. Brush color matches paint color (green brush → green shell). Keep Imagine's audio. **Do not mux TTS on top.**
4. `ffmpeg` → 480p 24fps yuv420p, **keep the Imagine audio track**.
5. Register in `public/game/cinema/series.json`.

Do not remount artifacts. Do not loop the Imagine tool if there is no path.

## QC before calling a beat done

Open the file. Fail if any of these:

- Wrong crab / extra eyes / no brush
- Face-only crop (can’t see walk/paint room)
- Burned-in subtitles
- Robot / British / deep voice
- Scary or ugly

## Episode 1.1 — Hi, I'm Crabby

Opener: himself + how to play. **3×6s = 18s**.

| Beat | He says | Picture |
|---|---|---|
| A | Hiii! I'm Crabby! | Wide sunny beach. Whole crab. Little wave. **Look lock.** |
| B | Tap a white shell! Whoooosh! I will walk over! | White shell on sand. He walks to it. Same wide camera. |
| C | Paint it with your finger! Yaaay! Let's play! | He paints it bright. Tiny hop. |

Cinema title: `Hi, I'm Crabby`. Tag `Ep 1.1`.  
Until B+C exist, the poster plays **part 1 (beat A)** only — do not label it the full episode.

First-run `intro.mp4` stays until 1.1 is approved.

**Not in 1.1:** hats, other colors, night, counting, bedtime.

## Clock hour lines (splice sources, not in Cinema yet)

Two 15s 480p Imagine clips with native audio. Do not mux TTS.

| File | He says |
| --- | --- |
| `public/game/cinema/clock-1-6.mp4` | It's one … six o'clock |
| `public/game/cinema/clock-7-12.mp4` | It's seven … twelve o'clock |

Raws: `public/game/cinema/raw/clock-1-6.mp4`, `raw/clock-7-12.mp4`. User will splice later.

## Episode 1.2 — Red meets Green

One 10s R2V take. Refs: `idle-red-0.png` + `green/idle-0.png`. Imagine audio. No mux.

They run, bump, high-five, splash. Red Crabby: “Hiii! I'm Red Crabby!” Green Crabby: “I'm Green Crabby! Let's play!”

Cinema title: `Red meets Green`. Tag `Ep 1.2`.

## Episode 1.3 — Red meets Yellow
One 10s R2V. Refs: red + yellow idle. Same energy as 1.2. Imagine audio. No mux.

## Episode 1.4 — Red meets Blue
One 10s R2V. Refs: red + blue idle. Same energy as 1.2. Imagine audio. No mux.

## Season 1 (rest)

e02 Night night (existing bedtime). e03 Paint Party. e04 Splash Walk. e05 Moonlight. e06 Hat Day. e07 One Two Three. e08 Wave Wash.  
Packs later: Day at the Beach = e03+e04+e08. Good Night = e05+e02.

## Batches

1. Beat A (this). Approve look.
2. Beats B + C, stitch, replace part 1 in Cinema.
3. e03+e04, then e05+e06, then e07+e08.

## Quota

480p / 6s. One look-lock beat before spending more.
