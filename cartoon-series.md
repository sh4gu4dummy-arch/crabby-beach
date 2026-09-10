# Crabby Cartoons — plan v.001

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

1. `python3 scripts/imagine-video.py --prompt "..." --seconds 6 --out public/game/cinema/raw/s01e03a.mp4`  
   (Method B: session JWT → `POST /v1/videos/generations` → `grok-imagine-video` / `1.5` → download `vidgen.x.ai` **this turn**.)
2. Re-encode 480p:  
   `ffmpeg -y -i raw.mp4 -vf "scale=854:480:force_original_aspect_ratio=decrease,pad=854:480:(ow-iw)/2:(oh-ih)/2" -r 24 -c:v libx264 -preset veryfast -crf 28 -pix_fmt yuv420p -an -movflags +faststart beat.mp4`
3. If Crabby talks: bake the line with `scripts/make-crabby-voice.py`, then mux. Mouth-open only while audio is on (same idea as intro).
4. Stitch when needed: `ffmpeg -f concat -safe 0 -i list.txt -c copy episode.mp4` (beats already same size/fps/codec).
5. Register in `public/game/cinema/series.json`. Cinema reads that list. No new React button per episode.

Do **not** remount artifacts. Do **not** loop the Imagine video tool if it has no path.

## Cinema UI

Keep Meet Crabby + Night night as the first two posters.

Add a **Cartoons** row/list under them, driven by `series.json`:

```json
{
  "episodes": [
    {
      "id": "s01e03",
      "title": "Paint Party",
      "tag": "Cartoon",
      "file": "game/cinema/s01e03.mp4",
      "poster": "game/cinema/s01e03.jpg",
      "seconds": 6
    }
  ]
}
```

Play in the same overlay as intro/bedtime (tap, back to Cinema). No autoplay on the menu.

## Season 1 (8 shorts)

Existing, keep:

| id | title | notes |
|---|---|---|
| s01e01 | Meet Crabby | current intro |
| s01e02 | Night night | current bedtime |

New (all 6s unless marked stitch):

| id | title | picture | talk? |
|---|---|---|---|
| s01e03 | Paint Party | Crabby walks to a white shell and paints it bright. Yay. | short “Yay!” |
| s01e04 | Splash Walk | He sidesteps into the water. Splash. Giggle. Water does not hurt him. | none or “Whoooosh!” |
| s01e05 | Moonlight Shells | 10pm beach, moon, shells glow. | none |
| s01e06 | Hat Day | Tries the bow. It sits on the shell. Silly wiggle. | none |
| s01e07 | One Two Three | Paints three shells. Counts with his voice. | One! Two! Three! |
| s01e08 | Wave Wash | One big wave. Shells ride in and sparkle. | none |

**Stitched packs** (same files, concat only):

- *A Day at the Beach* = e03 + e04 + e08 (18s)
- *Good Night* = e05 + e02 (12s)

## Implement in batches (when asked)

Do not dump all eight in one turn.

1. Wire `series.json` + Cinema list + one player (can point at a placeholder, then real files).
2. Add `scripts/imagine-video.py` (Method B) if it is not there yet.
3. Shoot **e03 + e04** (6s × 2). Approve look.
4. Shoot **e05 + e06**.
5. Shoot **e07 + e08**, then the two stitched packs.
6. Posters: one still per episode (Method C, 16:9, beige or beach, no magenta halo).

If a clip is ugly/scary/wrong crab: redo that beat only. Original red Crabby is the gold standard, same as loadout.

## Quota

480p / 6s is the cheap lane. Prefer that over 720p/10s. Two clips a batch is enough.

## Out of scope until asked

- New gameplay
- Unlock-by-level cartoons (Cinema is always open)
- 1080p / 15s
- Other characters as series leads (green/blue can cameo later)
