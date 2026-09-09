# Crabby Beach — standing rules (user)

These override guesswork. Do not “helpfully” ignore them.

## Downloads / exports
- Rebuild zip / APK / portable / android **only when the user explicitly asks**.
- Code-only `.md` + local git: every version, unless they say stop.
- GitHub: **push every version.** Do not wait for a checkpoint. Do not ask.
- Grok Publish: the user clicks Publish. Do not claim it was refreshed unless they give a URL you can verify.
- **Download labels must be the real file on disk.** Never stamp the current game version on an unbuilt package. `src/lib/exports.ts` is generated from `public/downloads/` by `scripts/write-download-manifest.mjs`. If a zip/APK is still an older version, the page says that version.

## Honesty
- Do not say a file, APK, Publish link, or video is updated unless you checked.
- Do not mark a download `ready` unless that exact filename exists.

## Preview
- “Warming up the sand” is the loading overlay. Vite HMR / SSR program reload (while files are being edited) remounts the game and shows it again. That is the preview, not a gameplay bug. Do not watch `public/downloads` (huge zips).

## Dev / intro
- Dev mode defaults **on** until the user turns it off.
- Intro video autoplays only the first time, and only when dev is off.
- Cinema still plays anytime.
