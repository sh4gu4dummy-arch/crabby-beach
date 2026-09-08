# Crabby Beach — standing rules (user)

These override guesswork. Do not “helpfully” ignore them.

## Downloads / exports
- Rebuild zip / APK / portable / android **only when the user explicitly asks**.
- Code-only `.md` + local git: every version, unless they say stop.
- GitHub: only every 10 versions (v.080, v.090, …) unless they ask.
- Grok Publish: the user clicks Publish. Do not claim it was refreshed unless they give a URL you can verify.
- **Download labels must be the real file on disk.** Never stamp the current game version on an unbuilt package. `src/lib/exports.ts` is generated from `public/downloads/` by `scripts/write-download-manifest.mjs`. If a zip/APK is still v.060, the page says v.060.

## Honesty
- Do not say a file, APK, Publish link, or video is updated unless you checked.
- Do not mark a download `ready` unless that exact filename exists.
