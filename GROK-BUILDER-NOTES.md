# Grok Builder notes

Handoff log from **Grok Build** (App Builder session) → **other Grok bots**.

Standing rules live in [`AGENTS.project.md`](AGENTS.project.md). Put **session / “tell the other bot”** stuff here. Update this file when you ship something they would otherwise miss.

Do **not** put App Builder preview / port / `startup.sh` contracts in `AGENTS.project.md`. If the other bot needs a sandbox warning, write it here.

---

## Read first

1. [`AGENTS.project.md`](AGENTS.project.md) — product rules
2. This file — current handoff
3. `VERSION` / `src/lib/version.ts` — actual product number
4. `src/lib/exports.ts` — what download files actually exist

---

## Current (v.131)

| | |
| --- | --- |
| Product | **v.131** |
| GitHub | `github.com/sh4gu4dummy-arch/crabby-beach` private, branch `master` |
| Last APK on disk | **v.126** — do not label it v.131 |
| Last zips on disk | **v.090** codebase / portable / android |
| Code-only `.md` | rebuilt every version |
| User | ash aug (`dummySh4Gu4`). Other humans/bots will work this repo. |

Git: push **every** product version. Zip/APK **only when asked**.

---

## Tell the other bot

### Loadout brushes
- Red: whole sprite swap per paint (`idle-{paint}-0.png`). That is the pattern.
- v.127 python **tint** of green’s pink brush was **wrong**. User rejected it.
- v.128: Imagine I2I of the cute green crab, **one full still per brush**, then swap the image. Files: `public/game/crabby/green/idle-{paint}-0.png` + walks. `_src-idle-*.jpg` are the Imagine sources — keep them.
- Hats still need the same treatment if a color’s brush does not change in-game.

### Yellow hats
- v.129: bow / bucket / sailor sit **on** the same top-down yellow crab (`looks/yellow/{hat}/idle-0.png`). They were floating and were a different drawing than the no-hat yellow tile.

### Imagine
- Tool often cannot write `artifacts/`. Use `scripts/imagine-image.py` or `POST /v1/images/edits` and **download the URL into `public/` this turn**. Guide: `scripts/imagine-save.md`.
- Never print JWT / `~/.grok/auth.json`.

### Cinema / voice
- Canon: `public/voice/crabby/canon.json` — squeaky US little-kid crab, not British, not a woman, not a deep man.
- Put that voice **in the Imagine prompt**. Do not mux TTS over Imagine audio.
- Plan: `cartoon-series.md`. Episodes in `public/game/cinema/`.

### Honesty traps we already burned
- Do not say Publish was refreshed unless you have a URL that proves it.
- Download page labels = files on disk (`write-download-manifest.mjs`).
- “Warming up the sand” is the loading overlay on remount, not a sand/wave bug.

---

## Open / next (as of 2026-09-17)

- Green no-hat brushes: Imagine swap is in. Hats / blue / yellow no-hat still may be old tint or mixed art — check before claiming they work.
- APK not rebuilt since v.126. Zips not rebuilt since v.090.
- User may bring other Grok bots onto this repo. Leave notes here instead of only in chat.

---

## How to use this file

When you finish a turn that another bot will continue:

1. Add a dated bullet under **Current** / **Tell the other bot** / **Open**.
2. Do not delete old “tell them” items until they are done or the user dropped them.
3. Bump product version if you change the game or these tracked docs.
