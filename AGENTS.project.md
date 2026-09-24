# Crabby Beach — project agent file

**Other Grok bots and humans: read this.**  
Root `AGENTS.md` in some sandboxes is **platform-only** (gitignored). Do **not** copy App Builder preview / port / `startup.sh` rules into this repo.

Current product: see `VERSION` and `src/lib/version.ts` (now **v.154**).
Handoff from Grok Build → other bots: [`GROK-BUILDER-NOTES.md`](GROK-BUILDER-NOTES.md).

---

## What this is

Toddler beach game: a crab walks to shells and paints them. Portrait, mobile-first, 100% offline. HTML/TS/React (Vite + TanStack Start). Playable from a web server or PWA.

Repo: `github.com/sh4gu4dummy-arch/crabby-beach` (private).

---

## Standing rules (do not “helpfully” ignore)

### Honesty
- Do not say a file, APK, Publish link, or video is updated unless you checked.
- Do not mark a download `ready` unless that exact filename exists on disk.
- Download **labels must match the real file**. Never stamp the current game version on an unbuilt zip/APK. `src/lib/exports.ts` is generated from `public/downloads/` by `scripts/write-download-manifest.mjs`.

### Versions
- Product versions: `v.001`, `v.002`, … never skip or reuse.
- Bump `src/lib/version.ts`, `VERSION`, `public/sw.js` cache name, `export-naming.md`, `cartoon-series.md` product line on each game/docs change that ships.
- Local git **and GitHub: push every version.** Do not wait. Do not ask.
- Zip / APK / portable / android: **only when the user explicitly asks.**
- Code-only `.md`: every version (`node scripts/export-code-only.mjs`).
- Grok Publish: the user clicks it. Do not claim it was refreshed unless they give a URL you can verify.

### Git
- Do not commit `node_modules`, `.env`, `scripts/__pycache__`, platform `AGENTS.md`.
- Do not print tokens, JWT, or `~/.grok/auth.json`.

---

## Layout (where to look)

| Path | What |
| --- | --- |
| `GROK-BUILDER-NOTES.md` | Grok Build → other bots handoff. Read it. Update it. |
| `src/game/engine.ts` | Gameplay loop, crab, shells, paint cans, waves |
| `src/game/GameCanvas.tsx` | UI: menu, loadout, cinema, grown-ups |
| `src/game/audio.ts` | SFX / music |
| `src/lib/settings.ts` | Loadout, theme, music, dev mode |
| `src/lib/version.ts` | `APP_VERSION` |
| `public/game/crabby/` | Crab sprites. Red: `idle-{paint}-0.png`. Other colors: `{color}/idle-{paint}-0.png`. Hats: `looks/{color}/{hat}/` |
| `public/game/cinema/` | Cartoon shorts + `series.json` |
| `public/voice/crabby/canon.json` | Crabby's voice bible |
| `scripts/crab-canon.md` | Brush-in-claw gate |
| `scripts/loadout-brush.md` | One sprite per paint. Never copy one hat across all colors. |
| `scripts/imagine-save.md` | How to get Imagine files onto disk |
| `scripts/imagine-image.py` / `imagine-video.py` | HTTP Imagine → `public/` this turn |
| `export-naming.md` | Download filename rules |
| `cartoon-series.md` | Cinema episode plan |

---

## Loadout / brushes

Red crab swaps the **whole sprite** when he dips a paint can (`assets.crab[paint]`).

Green (and other baked loadouts) must work the **same way**: one full picture per brush color, then swap the image. **Do not tint** an existing pink brush at runtime and call it done.

- Green no-hat Imagine stills: `public/game/crabby/green/idle-{paint}-0.png` (and walks).
- Empty claws fail. Open the PNG and look. Then `python3 scripts/verify-crab-brush.py`.
- Hats sit **on** the shell, not floating, not chopped. Same crab as the no-hat still.

---

## Imagine

The Imagine **tool** often cannot write `artifacts/`. Do not remount that folder. Do not loop the tool.

Need a file in the project this turn:

```
python3 scripts/imagine-image.py --prompt "..." --out public/game/...jpg --aspect 1:1
```

Edits (I2I): `POST /v1/images/edits` with a data-URI of the reference, then **download the URL immediately** into `public/`. JWT is `~/.grok/auth.json` field `key` (auth.json may be a dict, not a list). Never print it.

Details: `scripts/imagine-save.md`.

Cinema: native Imagine audio. Put Crabby's voice **in the prompt**. Do not mux TTS on top. See `cartoon-series.md` and `public/voice/crabby/canon.json`.

---

## Gameplay notes other bots keep missing

- Dev mode defaults **on** until the user turns it off.
- Intro video autoplays only the first time, and only when dev is off. Cinema still plays anytime.
- “Warming up the sand” is the **loading overlay**. A remount shows it again. That is not a shell/gameplay bug.
- Offline only. No runtime network for play, voice, or progress.
- Voice fallback: on-screen text if audio cannot play. Do not break.

---

## Do not

- Overlay hats or brushes in CSS/canvas and call it a loadout.
- Ship a fake/stub APK.
- Open or run the app from a download link (must be a file save).
- Put grown-up downloads on the toddler home screen.
- Change zip/APK labels to the current version without rebuilding those files.
