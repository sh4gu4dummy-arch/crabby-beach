# export-naming.md — v.096

Current product version: **v.095** (Crabby Beach)

## How filenames work

Every downloadable package carries the current product version in the file name
so you can tell which version a file is just by looking at it.

| Package | Filename | What it is |
| --- | --- | --- |
| Code only | Last file actually on disk (see Grown-ups). Currently rebuilt each version as `crabby-beach-v.<n>-code.md`. | One Markdown document: table of contents + essential source in fenced code blocks. For read / search / share / archive. **Not runnable.** No voice, no art assets. |
| Code + assets (full) | Last built zip on disk, e.g. `crabby-beach-v.060-codebase.zip` until you ask for a new export. | Complete project tree, including data, generated assets, and config, for offline rebuild. |
| Portable app | Last built zip on disk. | Playable, offline-ready. Unzip and open. |
| Android project | Last built zip on disk. | Android project + build readme. |
| Android APK | Last built APK on disk. | Installable APK for **that** version, not whatever the game currently is. |

Older files keep their names (`v.001` stays `v.001`). New exports use the current number.

## Rules

1. Version number in every filename.
2. Code-only (`.md`) is a documentation / reading package only. Never the playable app.
3. Codebase and portable links must download the file. They never open or run the app in a new window.
4. Downloads are real `<a href>` links with a `download` attribute (right-click and new-tab still save). The server also sends `Content-Disposition: attachment`.
5. Downloads live on the Grown-ups page, not on the toddler home screen.
6. Zip / APK packages are built only when explicitly requested. The code-only Markdown is refreshed on every product update.
7. No runtime network is required to play. Voice is bundled. If a clip cannot play, the on-screen count still shows. The downloadable snapshot does not auto-update.
8. Play works from a web server and from a home-screen PWA. The portable zip (when requested) is the unzip-and-open snapshot.

## Version numbers

- Product versions increment `v.001`, `v.002`, `v.003`, …
- This naming document started at `v.001` and is now **v.096**.
- Never skip or reuse a number. A new version is a new number.
