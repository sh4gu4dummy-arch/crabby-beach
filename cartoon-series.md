# Crabby Cartoons — plan v.002
Product: **Crabby Beach v.110**

Status: **plan only**. Do not shoot clips until asked to implement.

Fun extra for the game. Shorts live in **Cinema**. Gameplay stays the same.

## Format (locked)

| | |
|---|---|
| Size | **480p** (`854×480`), landscape 16:9 |
| Beat | **6 seconds** per clip |
| Episode | one clip, **or** 2–3 clips stitched (`12s` / `18s`) |
| Where | Cinema lobby, offline files under `public/game/cinema/` |
| Star | original red Crabby (the paintbrush crab) |
| Voice | locked spec in `public/voice/crabby/canon.json` (squeaky US kid). Mux after. Do not let Imagine pick a British/deep/robot voice. |
| Offline | no network at play time. Preview/APK/portable all use the same files. |

## How a clip is made

Imagine video **cannot** be trusted to write `/workspace/artifacts`. Same rule as stills:

1. `python3 scripts/imagine-video.py --prompt "..." --seconds 6 --out public/game/cinema/raw/s01e01a.mp4`  
   (Method B: session JWT → `POST /v1/videos/generations` → `grok-imagine-video` / `1.5` → download `vidgen.x.ai` **this turn**.)
2. Re-encode 480p, then mux Crabby’s voice if the beat talks.
3. Stitch when needed: `ffmpeg -f concat` on matching 480p beats.
4. Register in `public/game/cinema/series.json`. Cinema reads that list.

Do **not** remount artifacts. Do **not** loop the Imagine video tool if it has no path.

## Cinema UI

Keep Meet Crabby + Night night as the first two posters until 1.1 replaces Meet Crabby.

Add a **Cartoons** list driven by `series.json`. Play in the same overlay as intro/bedtime. No autoplay on the menu.

## Season 1

| id | title | notes |
|---|---|---|
| s01e01 | Hi, I'm Crabby | **ep 1.1** — 3×6s stitch |
| s01e02 | Night night | current bedtime |
| s01e03 | Paint Party | 6s |
| s01e04 | Splash Walk | 6s |
| s01e05 | Moonlight Shells | 6s |
| s01e06 | Hat Day | 6s |
| s01e07 | One Two Three | 6s |
| s01e08 | Wave Wash | 6s |

Stitched packs later: *A Day at the Beach* = e03+e04+e08. *Good Night* = e05+e02.

## Episode 1.1 — Hi, I'm Crabby

Series opener. He introduces **himself and how to play**. Not a face close-up. We see the whole crab, the shell, and the beach so the walk and the paint are readable (the old zoomed intro failed that).

**Shape:** 3 clips × 6s, stitched to **18s**. 480p 16:9. Original red Crabby, green paintbrush. Locked kid voice muxed on. Mouth open only while that beat’s audio is on.

| Beat | Seconds | He says | Picture |
|---|---|---|---|
| A | 0–6 | Hiii! I'm Crabby! | Sunny beach, whole crab in frame, little wave. Ocean in the back. No subtitles covering him. |
| B | 6–12 | Tap a white shell! Whoooosh! I will walk over! | A white shell on the sand. He walks over to it. Camera stays wide. |
| C | 12–18 | Paint it with your finger! Yaaay! Let's play! | He paints the shell. It turns bright. Tiny hop. |

Voice is the existing intro line, split to those three beats (`public/voice/crabby/canon.json`). Bake each beat, mux, then concat A+B+C.

**Cinema:** poster title `Hi, I'm Crabby`. Tag `Ep 1.1`. File `game/cinema/s01e01.mp4`.

**First-run game intro:** leave the current `intro.mp4` until 1.1 is approved. Then we can reuse 1.1 there (letterbox in portrait) or keep the old portrait cut. Don’t swap until you say so.

**Shoot order:** Beat A first. If he looks wrong (scary, wrong crab, too close), redo A only. Then B and C.

**Not in 1.1:** hats, other colors, night, counting, bedtime.

## Implement in batches (when asked)

1. Wire `series.json` + Cinema list + player.
2. Add `scripts/imagine-video.py` (Method B) if missing.
3. Shoot **1.1 beat A**. Approve look.
4. Shoot beats B and C, stitch, put in Cinema.
5. Later batches: e03+e04, then e05+e06, then e07+e08.

## Quota

480p / 6s. Two or three beats a batch is enough.

## Out of scope until asked

- New gameplay
- Unlock-by-level cartoons
- 1080p / 15s
- Other characters as series leads
