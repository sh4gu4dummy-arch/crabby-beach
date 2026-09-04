# Crabby Beach v.055 — code only

Reading / search / archive package. **Not runnable.** No art, audio files, or voice assets.

## Table of contents

- [VERSION](#version)
- [export-naming.md](#export-naming-md)
- [package.json](#package-json)
- [tsconfig.json](#tsconfig-json)
- [vite.config.ts](#vite-config-ts)
- [startup.sh](#startup-sh)
- [src/lib/asset.ts](#src-lib-asset-ts)
- [src/lib/offline.ts](#src-lib-offline-ts)
- [src/lib/settings.ts](#src-lib-settings-ts)
- [src/lib/progress.ts](#src-lib-progress-ts)
- [src/lib/version.ts](#src-lib-version-ts)
- [src/router.tsx](#src-router-tsx)
- [src/styles.css](#src-styles-css)
- [src/game/audio.ts](#src-game-audio-ts)
- [src/game/crabby-voice.ts](#src-game-crabby-voice-ts)
- [src/game/engine.ts](#src-game-engine-ts)
- [src/game/GameCanvas.tsx](#src-game-gamecanvas-tsx)
- [scripts/make-crabby-voice.py](#scripts-make-crabby-voice-py)
- [scripts/render-crabby.py](#scripts-render-crabby-py)
- [scripts/render-shells.py](#scripts-render-shells-py)
- [src/routes/__root.tsx](#src-routes-__root-tsx)
- [src/routes/index.tsx](#src-routes-index-tsx)
- [src/routes/grownups.tsx](#src-routes-grownups-tsx)

## VERSION

```
Crabby Beach v.055

Local git: every version.
GitHub + Grok Publish: only at v.040, v.050, v.060…
Next GitHub/Publish checkpoint: v.060
```

## export-naming.md

```md
# export-naming.md — v.056

Current product version: **v.055** (Crabby Beach)

## How filenames work

Every downloadable package carries the current product version in the file name
so you can tell which version a file is just by looking at it.

| Package | Filename | What it is |
| --- | --- | --- |
| Code only | `crabby-beach-v.055-code.md` | One Markdown document: table of contents + essential source in fenced code blocks. For read / search / share / archive. **Not runnable.** No voice, no art assets. |
| Code + assets (full) | `crabby-beach-v.055-codebase.zip` | Complete project tree, including data, generated assets, and config, for offline rebuild. |
| Portable app | `crabby-beach-v.055-portable.zip` | Playable, offline-ready. Unzip and open. |
| Android project | `crabby-beach-v.055-android.zip` | Android project + build readme. |
| Android APK | `crabby-beach-v.055.apk` | Installable APK for this version. |

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
- This naming document started at `v.001` and is now **v.056**.
- Never skip or reuse a number. A new version is a new number.
```

## package.json

```json
{
  "name": "app-builder-workspace",
  "private": true,
  "sideEffects": false,
  "type": "module",
  "overrides": {
    "nf3": "0.3.17"
  },
  "scripts": {
    "dev": "vite dev --host 0.0.0.0 --port 8080",
    "build": "vite build && npm run db:migrate",
    "db:migrate": "node scripts/migrate.mjs",
    "build:dev": "vite build --mode development",
    "preview": "vite preview --host 0.0.0.0 --port 8080",
    "typecheck": "tsc --noEmit",
    "test": "node --test 'scripts/**/*.test.mjs'",
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "dependencies": {
    "@electric-sql/pglite": "^0.5.4",
    "@hookform/resolvers": "^5.7.0",
    "better-auth": "^1.6.0",
    "kysely": "^0.28.5",
    "pg": "^8.16.3",
    "@radix-ui/react-accordion": "^1.2.12",
    "@radix-ui/react-alert-dialog": "^1.1.15",
    "@radix-ui/react-avatar": "^1.1.11",
    "@radix-ui/react-checkbox": "^1.3.3",
    "@radix-ui/react-collapsible": "^1.1.12",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-popover": "^1.1.15",
    "@radix-ui/react-progress": "^1.1.8",
    "@radix-ui/react-radio-group": "^1.3.8",
    "@radix-ui/react-scroll-area": "^1.2.10",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-separator": "^1.1.8",
    "@radix-ui/react-slider": "^1.3.6",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-switch": "^1.2.6",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-toggle": "^1.1.10",
    "@radix-ui/react-toggle-group": "^1.1.11",
    "@radix-ui/react-tooltip": "^1.2.8",
    "@tailwindcss/vite": "^4.3.0",
    "@tanstack/react-query": "^5.101.0",
    "@tanstack/react-router": "^1.170.0",
    "@tanstack/react-start": "^1.168.0",
    "@tanstack/react-table": "^8.21.0",
    "@tanstack/router-plugin": "^1.168.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "date-fns": "^4.0.0",
    "lucide-react": "^0.510.0",
    "react": "^19.2.0",
    "react-day-picker": "^9.14.0",
    "react-dom": "^19.2.0",
    "react-hook-form": "^7.54.0",
    "react-resizable-panels": "^4.6.5",
    "recharts": "^2.13.0",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.5.0",
    "tailwindcss": "^4.3.0",
    "tw-animate-css": "^1.3.4",
    "vaul": "^1.1.2",
    "zod": "^4.4.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.20.0",
    "@types/node": "^22.16.5",
    "@types/pg": "^8.11.10",
    "@types/react": "^19.2.0",
    "@types/react-dom": "^19.2.0",
    "@vitejs/plugin-react": "^5.2.0",
    "eslint": "^9.20.0",
    "eslint-config-prettier": "^10.1.1",
    "eslint-plugin-prettier": "^5.2.6",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "globals": "^15.15.0",
    "lightningcss": "^1.28.0",
    "nitro": "3.0.260610-beta",
    "playwright": "^1.62.0",
    "prettier": "^3.4.0",
    "typescript": "^5.7.0",
    "typescript-eslint": "^8.56.1",
    "vite": "^8.2.0"
  }
}
```

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["vite/client", "node"],
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src", "server"]
}
```

## vite.config.ts

```ts
import type { Plugin } from "vite";
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
// @ts-expect-error JS plugin alongside the TS vite config
import { grokPwaPlugin } from "./scripts/grok-pwa-plugin.mjs";
import { downloadsPlugin } from "./scripts/downloads-plugin.mjs";

/**
 * Finish PGLite bootstrap during dev-server setup (before traffic). Vite awaits
 * async `configureServer` hooks. Production: `src/lib/db` kicks `ensureDbReady`
 * on import.
 */
function pgliteBootstrapPlugin(): Plugin {
  return {
    name: "app-builder:pglite-bootstrap",
    apply: "serve",
    async configureServer(server) {
      try {
        const mod = (await server.ssrLoadModule("/src/lib/db.ts")) as {
          ensureDbReady?: () => Promise<void>;
        };
        if (typeof mod.ensureDbReady === "function") {
          await mod.ensureDbReady();
        }
      } catch (err) {
        console.error("[app-builder] DB bootstrap failed:", err);
        throw err;
      }
    },
  };
}

/**
 * Live-preview OAuth popup — handled HERE so the agent never has to create a
 * `/auth/popup` route (and cannot break it by scaffolding a React page that
 * paints the full app shell in the popup).
 *
 * `signIn` (client.ts) opens `/auth/popup?providerId=…` in a top-level window.
 * This middleware runs before TanStack Start, calls `handleAuthPopupRequest`,
 * and returns the 302 / completion HTML. Deployed apps do not use the popup
 * (full-page OAuth redirect), so `apply: "serve"` is enough.
 */
function authPopupPlugin(): Plugin {
  return {
    name: "app-builder:auth-popup",
    apply: "serve",
    configureServer(server) {
      // Register immediately (not in a returned post-hook) so we run BEFORE
      // TanStack Start / the SPA HTML fallback. A model-authored
      // `src/routes/auth/popup.tsx` React page must never win this path.
      server.middlewares.use(async (req, res, next) => {
        try {
          const rawUrl = req.url ?? "";
          const pathOnly = rawUrl.split("?", 1)[0] ?? "";
          if (pathOnly !== "/auth/popup") {
            next();
            return;
          }
          if ((req.method ?? "GET").toUpperCase() !== "GET") {
            res.statusCode = 405;
            res.setHeader("content-type", "text/plain; charset=utf-8");
            res.end("Method Not Allowed");
            return;
          }

          const host = String(
            req.headers["x-forwarded-host"] ?? req.headers.host ?? "localhost:8080",
          );
          const proto = String(
            req.headers["x-forwarded-proto"] ??
              ((req.socket as { encrypted?: boolean } | undefined)?.encrypted ? "https" : "http"),
          );
          const requestHeaders = new Headers();
          for (const [key, value] of Object.entries(req.headers)) {
            if (value === undefined) continue;
            if (Array.isArray(value)) {
              for (const v of value) requestHeaders.append(key, v);
            } else {
              requestHeaders.set(key, value);
            }
          }
          // Ensure Host is the public preview host so Better Auth's dynamic
          // baseURL / redirect_uri match the popup origin.
          if (!requestHeaders.has("host")) requestHeaders.set("host", host);

          const request = new Request(`${proto}://${host}${rawUrl}`, {
            method: "GET",
            headers: requestHeaders,
          });

          const mod = (await server.ssrLoadModule("/src/lib/auth/popup.server.ts")) as {
            handleAuthPopupRequest: (req: Request) => Promise<Response>;
          };
          const response = await mod.handleAuthPopupRequest(request);

          res.statusCode = response.status;
          // Preserve multiple Set-Cookie headers (OAuth state + session).
          const setCookies =
            typeof response.headers.getSetCookie === "function"
              ? response.headers.getSetCookie()
              : [];
          response.headers.forEach((value, key) => {
            if (key.toLowerCase() === "set-cookie") return;
            res.setHeader(key, value);
          });
          for (const cookie of setCookies) {
            res.appendHeader("set-cookie", cookie);
          }
          const body = Buffer.from(await response.arrayBuffer());
          res.end(body);
        } catch (err) {
          console.error("[app-builder] /auth/popup handler failed:", err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader("content-type", "text/plain; charset=utf-8");
            res.end("auth popup failed");
          }
        }
      });
    },
  };
}

// `0.0.0.0:8080` is the live-preview contract — don't change host/port.
// Keep `nitro` gated to `build` (the Vercel deploy target): enabled in dev it
// opens a second dev-server port, which breaks the single-port preview.
// The dev server starts once `src/router.tsx` and `src/routes/` exist — see
// AGENTS.md § "First scaffold".
export default defineConfig(({ command }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,
  },
  resolve: { tsconfigPaths: true },
  plugins: [
    pgliteBootstrapPlugin(),
    // Before tanstackStart so /auth/popup never falls through to the SPA.
    authPopupPlugin(),
    // PWA head + ?install=1 tutorial page; runs before Start/Nitro.
    grokPwaPlugin(),
    downloadsPlugin(),
    tailwindcss(),
    tanstackStart(),
    ...(command === "build"
      ? [
          nitro({
            preset: "vercel",
            // Auto-registers server/middleware/* (the PWA install page +
            // manifest + head-tag middleware). Nitro v3 defaults serverDir to
            // false, so removing this silently unwires /?install=1 on deploys.
            serverDir: "./server",
          }),
        ]
      : []),
    viteReact(),
  ],
}));
```

## startup.sh

```sh
#!/bin/sh
set -eu
cd /workspace
if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/; then
  exit 0
fi
npm run dev >>/tmp/app-startup.log 2>&1 &
```

## src/lib/asset.ts

```ts
/** Root-relative in the live app, relative in the portable snapshot. */
export function assetUrl(path: string) {
  const base = import.meta.env.BASE_URL || "/";
  return `${base}${path.replace(/^\//, "")}`;
}
```

## src/lib/offline.ts

```ts
export function registerOffline() {
  if (typeof window === "undefined") return;
  if (!import.meta.env.PROD) return;
  if (!("serviceWorker" in navigator)) return;
  void navigator.serviceWorker.register("/sw.js");
}
```

## src/lib/settings.ts

```ts
export type CrabColor = "red" | "blue" | "yellow";
export type CrabHat = "none" | "bow" | "bucket" | "sailor";
export type TimerMinutes = 0 | 3 | 5 | 10;
export type BeachTheme = "sunny" | "sunset";
export type PenId = "swipe" | "auto";

export type GrownupSettings = {
  color: CrabColor;
  hat: CrabHat;
  voiceCounts: boolean;
  music: boolean;
  timerMinutes: TimerMinutes;
  pen: PenId;
};

const KEY = "crabby-beach-settings-v1";

export const DEFAULT_SETTINGS: GrownupSettings = {
  color: "red",
  hat: "none",
  voiceCounts: true,
  music: true,
  timerMinutes: 0,
  pen: "swipe",
};

function isColor(v: unknown): v is CrabColor {
  return v === "red" || v === "blue" || v === "yellow";
}
function isHat(v: unknown): v is CrabHat {
  return v === "none" || v === "bow" || v === "bucket" || v === "sailor";
}
function isTimer(v: unknown): v is TimerMinutes {
  return v === 0 || v === 3 || v === 5 || v === 10;
}
function isPen(v: unknown): v is PenId {
  return v === "swipe" || v === "auto";
}

export function loadSettings(): GrownupSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<GrownupSettings>;
    return {
      color: isColor(parsed.color) ? parsed.color : DEFAULT_SETTINGS.color,
      hat: isHat(parsed.hat) ? parsed.hat : DEFAULT_SETTINGS.hat,
      voiceCounts: typeof parsed.voiceCounts === "boolean" ? parsed.voiceCounts : true,
      music: typeof parsed.music === "boolean" ? parsed.music : true,
      timerMinutes: isTimer(parsed.timerMinutes) ? parsed.timerMinutes : 0,
      pen: isPen(parsed.pen) ? parsed.pen : DEFAULT_SETTINGS.pen,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(next: GrownupSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(next));
}
```

## src/lib/progress.ts

```ts
const KEY = "crabby-beach-progress-v1";
export const MAX_HOURS = 12;

export type Progress = {
  cleared: number;
  dev: boolean;
};

function clampCleared(n: number) {
  return Math.min(MAX_HOURS, Math.max(0, Math.floor(n)));
}

export function loadProgress(): Progress {
  if (typeof window === "undefined") return { cleared: 0, dev: false };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { cleared: 0, dev: false };
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      cleared: typeof parsed.cleared === "number" ? clampCleared(parsed.cleared) : 0,
      dev: parsed.dev === true,
    };
  } catch {
    return { cleared: 0, dev: false };
  }
}

export function saveProgress(next: Progress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    KEY,
    JSON.stringify({ cleared: clampCleared(next.cleared), dev: next.dev === true }),
  );
}

export function loadCleared(): number {
  return loadProgress().cleared;
}

export function saveCleared(cleared: number) {
  const prev = loadProgress();
  saveProgress({ ...prev, cleared: clampCleared(cleared) });
}

export function loadDev(): boolean {
  return loadProgress().dev;
}

export function saveDev(dev: boolean) {
  const prev = loadProgress();
  saveProgress({ ...prev, dev });
}

export function isFinished(cleared = loadCleared()) {
  return cleared >= MAX_HOURS;
}

export function loadoutUnlocked(cleared = loadCleared(), dev = loadDev()) {
  return dev || isFinished(cleared);
}

export function unlockedFrom(cleared: number, dev = loadDev()) {
  if (dev) return MAX_HOURS;
  return Math.min(MAX_HOURS, Math.max(1, cleared + 1));
}
```

## src/lib/version.ts

```ts
export const APP_NAME = "Crabby Beach";
export const APP_SLUG = "crabby-beach";
export const APP_VERSION = "v.055";

export const DOWNLOADS = {
  codeOnly: `${APP_SLUG}-${APP_VERSION}-code.md`,
  codebase: `${APP_SLUG}-${APP_VERSION}-codebase.zip`,
  portable: `${APP_SLUG}-${APP_VERSION}-portable.zip`,
  android: `${APP_SLUG}-${APP_VERSION}-android.zip`,
  apk: `${APP_SLUG}-${APP_VERSION}.apk`,
} as const;
```

## src/router.tsx

```ts
import { createRouter } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({ routeTree, defaultErrorComponent: AppErrorComponent });
}
```

## src/styles.css

```css
@import "tailwindcss";

@font-face {
  font-family: "Fredoka";
  src: url("/fonts/Fredoka.ttf") format("truetype");
  font-weight: 400 700;
  font-style: normal;
  font-display: swap;
}

@theme {
  --color-sky: #7ec8e3;
  --color-sky-deep: #4ea8c9;
  --color-ocean: #2eb8c4;
  --color-sand: #f6d7a0;
  --color-sand-deep: #e8c07a;
  --color-cream: #fff6e8;
  --color-cream-soft: #ffe9c8;
  --color-coral: #e85d4c;
  --color-coral-deep: #c94a3b;
  --color-mint: #5dbb63;
  --color-mint-deep: #3f9a46;
  --color-ink: #3a2a22;
  --color-ink-soft: #6b5348;
  --color-foam: #ffffff;
  --radius-card: 1.75rem;
  --radius-pill: 999px;
  --font-display: "Fredoka", "Nunito", ui-rounded, system-ui, sans-serif;
}

@layer base {
  html,
  body,
  #app {
    min-height: 100%;
  }

  html,
  body {
    overscroll-behavior: none;
  }

  body {
    margin: 0;
    background: var(--color-sky);
    color: var(--color-ink);
    font-family: var(--font-display);
  }

  button:not(:disabled),
  [role="button"]:not(:disabled) {
    cursor: pointer;
  }
}

@keyframes count-pop {
  0% {
    transform: translateX(-50%) scale(0.45);
    opacity: 0;
  }
  18% {
    transform: translateX(-50%) scale(1.12);
    opacity: 1;
  }
  70% {
    transform: translateX(-50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateX(-50%) scale(1.05);
    opacity: 0;
  }
}

.count-pop {
  animation: count-pop 0.7s ease-out both;
}

.sky-bar {
  container-type: inline-size;
}

.sky-bar-clip {
  transition: width 280ms ease-out;
}

.sky-bar-fill {
  position: absolute;
  inset-block: 0;
  left: 0;
  width: 100cqi;
  height: 100%;
  background: linear-gradient(
    90deg,
    #6b0008 0%,
    #c40018 10%,
    #ff1a2e 20%,
    #ff6a12 34%,
    #ffd400 48%,
    #1edc5a 62%,
    #1aa8ff 74%,
    #9b3dff 84%,
    #ff4ec8 93%,
    #ff3df5 100%
  );
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.55);
}

.menu-sky {
  background: linear-gradient(180deg, #6ec7e6 0%, #b7e5f4 38%, #fff6e8 68%, #f6d7a0 100%);
}

.menu-sun {
  position: absolute;
  top: 4.4rem;
  right: 1.1rem;
  width: 3.6rem;
  height: 3.6rem;
  border-radius: 999px;
  background: radial-gradient(circle at 35% 35%, #fff6c2, #ffd400 58%, #f0a020);
  box-shadow:
    0 0 0 10px rgba(255, 225, 74, 0.28),
    0 0 34px rgba(255, 176, 40, 0.5);
}

.menu-crab {
  animation: menu-bob 2.6s ease-in-out infinite;
}

@keyframes menu-bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-7px);
  }
}

@media (orientation: landscape) and (max-height: 520px) and (pointer: coarse) {
  .turn-phone {
    display: grid;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## src/game/audio.ts

```ts
import { assetUrl } from "@/lib/asset";
import { CRABBY_CLIPS } from "@/game/crabby-voice";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sfxBus: GainNode | null = null;
let musicBus: GainNode | null = null;
let muted = false;
let musicOn = true;
let ambientStarted = false;
let noiseBuffer: AudioBuffer | null = null;
let voiceSrc: AudioBufferSourceNode | null = null;
const voiceBufs = new Map<string, AudioBuffer>();
let voicesLoading: Promise<void> | null = null;

const VOICE_FILES: Record<string, string> = {
  one: assetUrl("voice/one.mp3?v=050"),
  two: assetUrl("voice/two.mp3?v=050"),
  three: assetUrl("voice/three.mp3?v=050"),
  four: assetUrl("voice/four.mp3?v=050"),
  five: assetUrl("voice/five.mp3?v=050"),
  six: assetUrl("voice/six.mp3?v=050"),
  seven: assetUrl("voice/seven.mp3?v=050"),
  eight: assetUrl("voice/eight.mp3?v=050"),
  nine: assetUrl("voice/nine.mp3?v=050"),
  ten: assetUrl("voice/ten.mp3?v=050"),
  "win-sunny": assetUrl("voice/win-sunny.mp3?v=050"),
  "win-sunset": assetUrl("voice/win-sunset.mp3?v=050"),
  "win-done": assetUrl("voice/win-done.mp3?v=050"),
  "crabby-intro": CRABBY_CLIPS.intro,
};

const LINE_TO_CLIP: Record<string, string> = {
  "Yay! You found them all.": "win-sunny",
  "Wow! The shells are glowing!": "win-sunset",
  "You finished the day! New pens and looks are in Loadout.": "win-done",
};

function ensureGraph() {
  if (ctx) return;
  const AudioCtx = window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  ctx = new AudioCtx({ latencyHint: "interactive" });
  master = ctx.createGain();
  sfxBus = ctx.createGain();
  musicBus = ctx.createGain();
  sfxBus.gain.value = 0.85;
  musicBus.gain.value = musicOn ? 0.18 : 0;
  master.gain.value = muted ? 0 : 1;
  sfxBus.connect(master);
  musicBus.connect(master);
  master.connect(ctx.destination);

  const n = Math.floor(ctx.sampleRate * 0.8);
  noiseBuffer = ctx.createBuffer(1, n, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
}

function resume() {
  if (ctx && ctx.state === "suspended") void ctx.resume();
}

export function unlockAudio() {
  ensureGraph();
  resume();
  startAmbient();
  void loadVoices();
}

async function loadVoices() {
  if (!ctx) return;
  if (voicesLoading) return voicesLoading;
  voicesLoading = (async () => {
    const audio = ctx;
    if (!audio) return;
    await Promise.all(
      Object.entries(VOICE_FILES).map(async ([key, src]) => {
        if (voiceBufs.has(key)) return;
        try {
          const res = await fetch(src);
          if (!res.ok) return;
          const raw = await res.arrayBuffer();
          const buf = await audio.decodeAudioData(raw.slice(0));
          voiceBufs.set(key, buf);
        } catch {
          // Bundled clip missing — on-screen counts still work.
        }
      }),
    );
  })();
  return voicesLoading;
}

function playVoice(key: string) {
  if (muted || !ctx || !sfxBus) return;
  const buf = voiceBufs.get(key);
  if (!buf) {
    void loadVoices().then(() => {
      if (voiceBufs.has(key)) playVoice(key);
    });
    return;
  }
  if (voiceSrc) {
    try {
      voiceSrc.stop();
    } catch {
      /* already ended */
    }
    voiceSrc = null;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const g = ctx.createGain();
  g.gain.value = 1.15;
  src.connect(g);
  g.connect(sfxBus);
  src.start();
  voiceSrc = src;
}

export function setMuted(next: boolean) {
  muted = next;
  if (master && ctx) {
    master.gain.setTargetAtTime(next ? 0 : 1, ctx.currentTime, 0.03);
  }
}

export function isMuted() {
  return muted;
}

export function setMusicEnabled(on: boolean) {
  musicOn = on;
  if (musicBus && ctx) {
    musicBus.gain.setTargetAtTime(on ? 0.18 : 0, ctx.currentTime, 0.05);
  }
}

export function speak(text: string) {
  if (typeof window === "undefined" || muted) return;
  const key = LINE_TO_CLIP[text];
  if (key) {
    playVoice(key);
    return;
  }
}

export function speakCount(n: number) {
  const words = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
  const word = words[n - 1];
  if (word) playVoice(word);
}

function tNow() {
  return ctx?.currentTime ?? 0;
}

function env(gain: GainNode, peak: number, attack: number, dur: number, at: number) {
  gain.gain.cancelScheduledValues(at);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), at + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
}

function beep(
  freq: number,
  dur: number,
  type: OscillatorType,
  peak: number,
  at: number,
  slideTo?: number,
) {
  if (!ctx || !sfxBus) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, at);
  if (slideTo != null) osc.frequency.exponentialRampToValueAtTime(slideTo, at + dur);
  env(g, peak, 0.012, dur, at);
  osc.connect(g);
  g.connect(sfxBus);
  osc.start(at);
  osc.stop(at + dur + 0.03);
}

export function playTap() {
  if (!ctx || muted) return;
  const at = tNow();
  const rate = 0.94 + Math.random() * 0.12;
  beep(640 * rate, 0.07, "triangle", 0.12, at, 420 * rate);
}

export function playScuttle() {
  if (!ctx || !sfxBus || !noiseBuffer || muted) return;
  const at = tNow();
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  src.playbackRate.value = 1.4 + Math.random() * 0.4;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1400 + Math.random() * 400;
  filter.Q.value = 2.2;
  const g = ctx.createGain();
  env(g, 0.07, 0.005, 0.05, at);
  src.connect(filter);
  filter.connect(g);
  g.connect(sfxBus);
  src.start(at);
  src.stop(at + 0.06);
  beep(210 + Math.random() * 40, 0.045, "triangle", 0.05, at);
}

export function playDip() {
  if (!ctx || muted) return;
  const at = tNow();
  beep(280, 0.09, "sine", 0.12, at, 180);
  beep(520, 0.16, "triangle", 0.1, at + 0.04, 740);
}

export function playSparkle() {
  if (!ctx || muted) return;
  const at = tNow();
  const notes = [659.25, 783.99, 987.77, 1174.66];
  notes.forEach((freq, i) => {
    beep(freq, 0.22, "sine", 0.11 - i * 0.015, at + i * 0.055);
  });
}

export function playWin() {
  if (!ctx || muted) return;
  const at = tNow();
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
  notes.forEach((freq, i) => {
    beep(freq, 0.32, "triangle", 0.13, at + i * 0.11);
    beep(freq * 2, 0.22, "sine", 0.045, at + i * 0.11 + 0.02);
  });
}

function startAmbient() {
  if (!ctx || !musicBus || !noiseBuffer || ambientStarted) return;
  ambientStarted = true;

  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  src.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 420;
  filter.Q.value = 0.6;
  const g = ctx.createGain();
  g.gain.value = 0.22;
  src.connect(filter);
  filter.connect(g);
  g.connect(musicBus);
  src.start();

  const swell = ctx.createOscillator();
  const swellGain = ctx.createGain();
  swell.type = "sine";
  swell.frequency.value = 196;
  swellGain.gain.value = 0.035;
  swell.connect(swellGain);
  swellGain.connect(musicBus);
  swell.start();

  const swell2 = ctx.createOscillator();
  const swell2Gain = ctx.createGain();
  swell2.type = "sine";
  swell2.frequency.value = 246.94;
  swell2Gain.gain.value = 0.02;
  swell2.connect(swell2Gain);
  swell2Gain.connect(musicBus);
  swell2.start();
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") resume();
  });
  window.addEventListener("focus", resume);
}
```

## src/game/crabby-voice.ts

```ts
import { assetUrl } from "@/lib/asset";

/** Locked Crabby voice. Bake new lines with scripts/make-crabby-voice.py */
export const CRABBY_VOICE_ID = "crabby-canon-v1";

export const CRABBY_CLIPS = {
  intro: assetUrl("voice/crabby/intro.mp3?v=046"),
} as const;
```

## src/game/engine.ts

```ts
import type { BeachTheme, CrabColor, CrabHat, GrownupSettings, PenId } from "@/lib/settings";
import { DEFAULT_SETTINGS } from "@/lib/settings";
import { loadCleared, loadDev, loadoutUnlocked, saveCleared, saveDev, unlockedFrom } from "@/lib/progress";
import { assetUrl } from "@/lib/asset";
import {
  playScuttle,
  playSparkle,
  playTap,
  playWin,
  playDip,
  setMusicEnabled,
  speak,
  speakCount,
  unlockAudio,
} from "./audio";

export type GamePhase = "loading" | "menu" | "playing" | "won" | "timesup";

export type GameHud = {
  phase: GamePhase;
  painted: number;
  total: number;
  theme: BeachTheme;
  countPop: number | null;
  countKey: number;
  secondsLeft: number | null;
  level: number;
  maxLevel: number;
  hour: number;
  skyFill: string;
  cleared: number;
  unlocked: number;
  pen: PenId;
  finished: boolean;
  dev: boolean;
  extrasOpen: boolean;
};

export type GameApi = {
  start: () => void;
  replay: (opts?: { theme?: BeachTheme; advance?: boolean; restart?: boolean }) => void;
  playLevel: (n: number) => void;
  goMenu: () => void;
  setDev: (on: boolean) => void;
  resetProgress: () => void;
  addTime: (seconds: number) => void;
  destroy: () => void;
};

const MAX_FINDS = 12;
const MAX_LEVELS = 12;

const WORLD_W = 1600;
const WORLD_H = 900;
const WATER_MAX = 220;
const SAND_TOP = 270;
const SAND_BOT = 840;
const SAND_LEFT = 130;
const SAND_RIGHT = 1470;
const CRAB_SPEED = 300;
const HIT = 72;
const CRAB_SIZE = 112;
const FIND_SIZE = 68;
const PAINT_RES = 256;
const SKY_TINTS = [
  { fill: "#7ec8e3", multiply: "#f6e7b0", alpha: 0.04 },
  { fill: "#6eb8d8", multiply: "#f0d090", alpha: 0.10 },
  { fill: "#5aa4c8", multiply: "#e8b070", alpha: 0.18 },
  { fill: "#4a8cb8", multiply: "#e09050", alpha: 0.26 },
  { fill: "#c97a4a", multiply: "#e07a4a", alpha: 0.36 },
  { fill: "#b45a58", multiply: "#c45a6a", alpha: 0.46 },
  { fill: "#5a3a78", multiply: "#4a3a78", alpha: 0.56 },
  { fill: "#243056", multiply: "#1e2a4a", alpha: 0.64 },
  { fill: "#0c1428", multiply: "#0a1224", alpha: 0.74 },
  { fill: "#090f20", multiply: "#070c18", alpha: 0.80 },
  { fill: "#070a16", multiply: "#050810", alpha: 0.86 },
  { fill: "#04060e", multiply: "#03040a", alpha: 0.92 },
] as const;

export const HOUR_SKIES = SKY_TINTS.map((s) => s.fill);

export function hourLabel(hour: number) {
  if (hour >= 12) return "12am";
  return `${hour}pm`;
}
const CAN_HIT = 56;
const WATER_WALK = 118;
const FILL_SECS = 1;

type PaintId = "red" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink";

const PAINTS: Array<{ id: PaintId; hex: string }> = [
  { id: "red", hex: "#ff3b55" },
  { id: "orange", hex: "#ff8a12" },
  { id: "yellow", hex: "#ffe14a" },
  { id: "green", hex: "#2ee86a" },
  { id: "blue", hex: "#2ec8ff" },
  { id: "purple", hex: "#c44dff" },
  { id: "pink", hex: "#ff5ec8" },
];

function paintHex(id: PaintId) {
  return PAINTS.find((p) => p.id === id)?.hex ?? "#5dbb63";
}

function hexRgba(hex: string, a: number) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
}

type Vec = { x: number; y: number };
type Kind = "shell" | "starfish" | "sanddollar" | "snail";

type Find = {
  id: number;
  kind: Kind;
  variant: number;
  x: number;
  y: number;
  painted: boolean;
  pop: number;
  fly: number;
  slot: number;
  color: PaintId;
  paintTime: number;
  mask: HTMLCanvasElement | null;
  paintLayer: HTMLCanvasElement | null;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
  kind: "spark" | "confetti" | "sand" | "token";
  rot: number;
  spin: number;
  ox?: number;
  oy?: number;
  tx?: number;
  ty?: number;
};

type Crab = {
  x: number;
  y: number;
  facing: 1 | -1;
  state: "idle" | "walk";
  frame: number;
  frameT: number;
  target: Vec | null;
  targetId: number | null;
  targetCan: PaintId | null;
  paint: PaintId;
  blink: number;
  blinkWait: number;
  wave: number;
};

type Assets = {
  beach: HTMLImageElement;
  walk: HTMLImageElement[];
  idle: HTMLImageElement[];
  white: HTMLImageElement[];
  green: HTMLImageElement[];
  starfish: HTMLImageElement;
  bucket: HTMLImageElement;
  pebble: HTMLImageElement;
  crab: Record<PaintId, { idle: HTMLImageElement[]; walk: HTMLImageElement[] }>;
};

type TintCache = WeakMap<CanvasImageSource, HTMLCanvasElement>;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });
}

async function loadAssets(): Promise<Assets> {
  const paintIds = PAINTS.map((p) => p.id);
  const crabFiles = paintIds.flatMap((id) => [
    loadImage(assetUrl(`game/crabby/idle-${id}-0.png?v=051`)),
    loadImage(assetUrl(`game/crabby/idle-${id}-1.png?v=051`)),
    ...[1, 2, 3, 4].map((i) => loadImage(assetUrl(`game/crabby/walk-${id}-${i}.png?v=051`))),
  ]);
  const [beach, ...rest] = await Promise.all([
    loadImage(assetUrl("game/beach.jpg?v=v003")),
    ...[1, 2, 3, 4].map((i) => loadImage(assetUrl(`game/crab-walk-${i}.png?v=topdown2`))),
    ...[1, 2, 3, 4].map((i) => loadImage(assetUrl(`game/crab-idle-${i}.png?v=topdown2`))),
    ...[1, 2, 3, 4].map((i) => loadImage(assetUrl(`game/shell-white-${i}.png?v=055`))),
    ...[1, 2, 3, 4].map((i) => loadImage(assetUrl(`game/shell-green-${i}.png?v=v003`))),
    loadImage(assetUrl("game/prop-starfish.png?v=topdown2")),
    loadImage(assetUrl("game/prop-bucket.png?v=topdown2")),
    loadImage(assetUrl("game/prop-pebble.png?v=topdown2")),
    ...crabFiles,
  ]);
  const crabImgs = rest.slice(19) as HTMLImageElement[];
  const crab = {} as Record<PaintId, { idle: HTMLImageElement[]; walk: HTMLImageElement[] }>;
  paintIds.forEach((id, i) => {
    const slice = crabImgs.slice(i * 6, i * 6 + 6);
    const idle0 = slice[0]!;
    const idle1 = slice[1]!;
    crab[id] = {
      idle: [idle0, idle1, idle0, idle1],
      walk: slice.slice(2, 6),
    };
  });
  return {
    beach,
    walk: rest.slice(0, 4),
    idle: rest.slice(4, 8),
    white: rest.slice(8, 12),
    green: rest.slice(12, 16),
    starfish: rest[16] as HTMLImageElement,
    bucket: rest[17] as HTMLImageElement,
    pebble: rest[18] as HTMLImageElement,
    crab,
  };
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

function easeOutBack(t: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

function dist(a: Vec, b: Vec) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function shuffle<T>(list: T[]) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
}

function planKinds(n: number): Kind[] {
  const extras: Kind[] = [];
  if (n >= 5) extras.push("sanddollar");
  if (n >= 8) extras.push("snail");
  const shells = Math.max(0, n - extras.length);
  const kinds: Kind[] = [];
  for (let i = 0; i < shells; i++) kinds.push("shell");
  kinds.push(...extras);
  return kinds;
}

function tintImage(src: CanvasImageSource, color: CrabColor, cache: TintCache) {
  if (color === "red") return src;
  const hit = cache.get(src);
  if (hit) return hit;
  const w = "width" in src ? Number(src.width) : 128;
  const h = "height" in src ? Number(src.height) : 128;
  const c = document.createElement("canvas");
  c.width = Math.max(1, w);
  c.height = Math.max(1, h);
  const x = c.getContext("2d");
  if (!x) return src;
  x.drawImage(src, 0, 0);
  const img = x.getImageData(0, 0, c.width, c.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    if ((d[i + 3] ?? 0) < 12) continue;
    const r = d[i] ?? 0;
    const g = d[i + 1] ?? 0;
    const b = d[i + 2] ?? 0;
    if (color === "blue") {
      d[i] = Math.min(255, g * 0.45 + b * 0.35 + 20);
      d[i + 1] = Math.min(255, g * 0.7 + 50);
      d[i + 2] = Math.min(255, r * 0.82 + 40);
    } else {
      d[i] = Math.min(255, r * 1.05 + 10);
      d[i + 1] = Math.min(255, Math.max(g, r * 0.88) + 8);
      d[i + 2] = Math.min(255, b * 0.42);
    }
  }
  x.putImageData(img, 0, 0);
  cache.set(src, c);
  return c;
}

export function createGame(
  canvas: HTMLCanvasElement,
  hooks: { onHud: (hud: GameHud) => void; getSettings: () => GrownupSettings },
): GameApi {
  const maybeCtx = canvas.getContext("2d");
  if (!maybeCtx) throw new Error("Canvas is not available");
  const ctx: CanvasRenderingContext2D = maybeCtx;

  let raf = 0;
  let running = true;
  let last = 0;
  let phase: GamePhase = "loading";
  let assets: Assets | null = null;
  let finds: Find[] = [];
  let particles: Particle[] = [];
  let time = 0;
  let stepAcc = 0;
  let puffAcc = 0;
  let theme: BeachTheme = "sunny";
  let countPop: number | null = null;
  let countKey = 0;
  let playElapsed = 0;
  let extraTime = 0;
  let pendingWin = false;
  let lastTick = -1;
  let level = 1;
  let cleared = loadCleared();
  let dev = loadDev();
  const brush = { down: false, x: 800, y: 520 };
  let cans: Array<{ id: PaintId; hex: string; x: number; y: number }> = [];
  const paintCache = new Map<string, HTMLCanvasElement>();
  const tintCache: TintCache = new WeakMap();
  let settings: GrownupSettings = DEFAULT_SETTINGS;

  const crab: Crab = {
    x: 800,
    y: 520,
    facing: 1,
    state: "idle",
    frame: 0,
    frameT: 0,
    target: null,
    targetId: null,
    targetCan: null,
    paint: "green",
    blink: 0,
    blinkWait: 2.6,
    wave: 0,
  };

  const css = { w: 1, h: 1 };
  const view = { x: 0, y: 0, scale: 1 };

  function bannerH() {
    return Math.max(86, Math.min(104, css.h * 0.125));
  }

  function slotScreen(index: number, total: number) {
    const h = bannerH();
    const n = Math.max(total, 1);
    const pad = 16;
    const slot = Math.min(70, (css.w - pad * 2) / n);
    const rowW = slot * n;
    return {
      x: (css.w - rowW) / 2 + slot * index + slot / 2,
      y: css.h - h * 0.38,
      size: Math.min(56, slot * 0.78),
    };
  }

  function worldToScreen(p: Vec) {
    return { x: view.x + p.x * view.scale, y: view.y + p.y * view.scale };
  }

  function maxLevel() {
    return MAX_LEVELS;
  }

  function hour() {
    return Math.min(MAX_LEVELS, Math.max(1, level));
  }

  function nightGlow() {
    return (hour() - 1) / (MAX_LEVELS - 1);
  }

  /** Luminescent shells start at 6pm, full from 9pm through midnight. */
  function shellGlow() {
    return Math.min(1, Math.max(0, (hour() - 5) / 4));
  }

  function skyTint() {
    return SKY_TINTS[hour() - 1] ?? SKY_TINTS[0]!;
  }

  function findsForLevel() {
    return Math.min(MAX_FINDS, hour());
  }

  function paintedCount() {
    return finds.filter((f) => f.painted).length;
  }

  function secondsLeft() {
    if (!settings.timerMinutes || phase !== "playing") return null;
    const limit = settings.timerMinutes * 60 + extraTime;
    return Math.max(0, Math.ceil(limit - playElapsed));
  }

  function extrasOpen() {
    return loadoutUnlocked(cleared, dev);
  }

  function usingAuto() {
    return extrasOpen() && settings.pen === "auto";
  }

  function crabColor(): CrabColor {
    return extrasOpen() ? settings.color : "red";
  }

  function crabHat(): CrabHat {
    return extrasOpen() ? settings.hat : "none";
  }

  function emitHud() {
    hooks.onHud({
      phase,
      painted: paintedCount(),
      total: finds.length,
      theme,
      countPop,
      countKey,
      secondsLeft: secondsLeft(),
      level,
      maxLevel: maxLevel(),
      hour: hour(),
      skyFill: skyTint().fill,
      cleared,
      unlocked: unlockedFrom(cleared, dev),
      pen: usingAuto() ? "auto" : "swipe",
      finished: cleared >= MAX_LEVELS,
      dev,
      extrasOpen: extrasOpen(),
    });
  }

  function refreshSettings() {
    settings = hooks.getSettings();
    setMusicEnabled(settings.music);
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    css.w = canvas.clientWidth;
    css.h = canvas.clientHeight;
    canvas.width = Math.max(1, Math.round(css.w * dpr));
    canvas.height = Math.max(1, Math.round(css.h * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const scale = Math.max(css.w / WORLD_W, css.h / WORLD_H);
    view.scale = scale;
    view.x = (css.w - WORLD_W * scale) / 2;
    view.y = Math.min(0, css.h - WORLD_H * scale);
    if (css.h >= css.w) view.y = 0;
    placeCans();
  }

  function sandView() {
    const x0 = -view.x / view.scale;
    const y0 = -view.y / view.scale;
    const x1 = (css.w - view.x) / view.scale;
    const y1 = (css.h - view.y) / view.scale;
    const padX = Math.min(70, Math.max(36, (x1 - x0) * 0.08));
    const padY = 36;
    const bannerWorld = bannerH() / view.scale + 12;
    return {
      x0: clamp(Math.max(x0 + padX, SAND_LEFT), SAND_LEFT, SAND_RIGHT - 200),
      x1: clamp(Math.min(x1 - padX, SAND_RIGHT), SAND_LEFT + 200, SAND_RIGHT),
      y0: clamp(Math.max(y0 + padY, SAND_TOP), SAND_TOP, SAND_BOT - 160),
      y1: clamp(Math.min(y1 - padY - bannerWorld, SAND_BOT), SAND_TOP + 160, SAND_BOT),
    };
  }

  function placeFinds(bounds: { x0: number; x1: number; y0: number; y1: number }) {
    const n = findsForLevel();
    const kinds = shuffle(planKinds(n));
    const minDist = FIND_SIZE * 2.7;
    const w = Math.max(80, bounds.x1 - bounds.x0);
    const h = Math.max(80, bounds.y1 - bounds.y0);
    let cols = Math.max(1, Math.min(n, Math.floor(w / minDist) || 1));
    let rows = Math.ceil(n / cols);
    while (rows > 1 && rows * minDist > h && cols < n) {
      cols += 1;
      rows = Math.ceil(n / cols);
    }
    const cellW = w / cols;
    const cellH = h / rows;
    const spots: Vec[] = [];
    for (let r = 0; r < rows; r++) {
      const inRow = Math.min(cols, n - spots.length);
      const rowPad = (cols - inRow) * 0.5;
      for (let c = 0; c < inRow; c++) {
        spots.push({
          x: bounds.x0 + (c + rowPad + 0.5) * cellW,
          y: bounds.y0 + (r + 0.5) * cellH,
        });
      }
    }
    const cx = (bounds.x0 + bounds.x1) / 2;
    const cy = (bounds.y0 + bounds.y1) / 2;
    for (let iter = 0; iter < 12; iter++) {
      for (let i = 0; i < spots.length; i++) {
        const a = spots[i]!;
        if (dist(a, { x: cx, y: cy }) < minDist * 0.7) {
          a.y = clamp(a.y + (a.y >= cy ? 18 : -18), bounds.y0 + 8, bounds.y1 - 8);
        }
        for (let j = i + 1; j < spots.length; j++) {
          const b = spots[j]!;
          const d = dist(a, b);
          if (d >= minDist || d < 0.001) continue;
          const push = (minDist - d) * 0.5;
          const nx = (a.x - b.x) / d;
          const ny = (a.y - b.y) / d;
          a.x = clamp(a.x + nx * push, bounds.x0 + 8, bounds.x1 - 8);
          a.y = clamp(a.y + ny * push, bounds.y0 + 8, bounds.y1 - 8);
          b.x = clamp(b.x - nx * push, bounds.x0 + 8, bounds.x1 - 8);
          b.y = clamp(b.y - ny * push, bounds.y0 + 8, bounds.y1 - 8);
        }
      }
    }
    return spots.map((p, i) => ({
      id: i,
      kind: kinds[i] ?? "shell",
      variant: i % 4,
      x: p.x,
      y: p.y,
      painted: false,
      pop: 1,
      fly: 0,
      slot: -1,
      color: "green" as PaintId,
      paintTime: 0,
      mask: null,
      paintLayer: null,
    }));
  }

  function placeCans() {
    const x0 = -view.x / view.scale + 42;
    const x1 = (css.w - view.x) / view.scale - 42;
    const left = Math.max(SAND_LEFT, x0);
    const right = Math.min(SAND_RIGHT, x1);
    const n = PAINTS.length;
    cans = PAINTS.map((p, i) => ({
      id: p.id,
      hex: p.hex,
      x: left + ((i + 0.5) / n) * (right - left),
      y: 148,
    }));
  }

  function resetWorld(nextTheme: BeachTheme) {
    refreshSettings();
    theme = hour() >= 6 ? "sunset" : "sunny";
    const vis = sandView();
    finds = placeFinds(vis);
    placeCans();
    particles = [];
    pendingWin = false;
    countPop = null;
    playElapsed = 0;
    extraTime = 0;
    lastTick = -1;
    crab.x = (vis.x0 + vis.x1) / 2 - 40;
    crab.y = (vis.y0 + vis.y1) / 2;
    crab.target = null;
    crab.targetId = null;
    crab.targetCan = null;
    crab.paint = "green";
    crab.state = "idle";
    crab.frame = 0;
    crab.frameT = 0;
    crab.facing = 1;
    crab.wave = 0;
    crab.blink = 0;
    crab.blinkWait = 2.4;
  }

  function worldFromEvent(ev: PointerEvent): Vec {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (ev.clientX - rect.left - view.x) / view.scale,
      y: (ev.clientY - rect.top - view.y) / view.scale,
    };
  }

  function clampToPlay(p: Vec, allowWater: boolean): Vec {
    const vis = sandView();
    return {
      x: clamp(p.x, vis.x0, vis.x1),
      y: clamp(p.y, allowWater ? WATER_WALK : vis.y0, vis.y1),
    };
  }

  function flattenMask(c: HTMLCanvasElement) {
    const x = c.getContext("2d");
    if (!x) return;
    const img = x.getImageData(0, 0, c.width, c.height);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const a = d[i + 3] ?? 0;
      if (a > 18) {
        d[i] = 255;
        d[i + 1] = 255;
        d[i + 2] = 255;
        d[i + 3] = 255;
      } else {
        d[i + 3] = 0;
      }
    }
    x.putImageData(img, 0, 0);
  }

  function ensurePaint(item: Find) {
    if (item.mask && item.paintLayer) return;
    const mask = document.createElement("canvas");
    mask.width = PAINT_RES;
    mask.height = PAINT_RES;
    const mx = mask.getContext("2d");
    if (!mx) return;
    mx.imageSmoothingEnabled = true;
    mx.imageSmoothingQuality = "high";
    mx.translate(PAINT_RES / 2, PAINT_RES / 2);
    const s = PAINT_RES;
    if (item.kind === "shell" && assets) {
      mx.drawImage(assets.white[item.variant]!, -s / 2, -s / 2, s, s);
    } else if (item.kind === "starfish" && assets) {
      mx.drawImage(assets.starfish, -s / 2, -s / 2, s, s);
    } else if (item.kind === "sanddollar") {
      mx.fillStyle = "#fff";
      mx.beginPath();
      mx.ellipse(0, 0, s * 0.46, s * 0.42, 0, 0, Math.PI * 2);
      mx.fill();
    } else {
      mx.fillStyle = "#fff";
      mx.beginPath();
      mx.ellipse(s * 0.16, s * 0.16, s * 0.28, s * 0.16, 0.2, 0, Math.PI * 2);
      mx.fill();
      mx.beginPath();
      mx.arc(-s * 0.06, -s * 0.04, s * 0.28, 0, Math.PI * 2);
      mx.fill();
    }
    flattenMask(mask);
    const layer = document.createElement("canvas");
    layer.width = PAINT_RES;
    layer.height = PAINT_RES;
    item.mask = mask;
    item.paintLayer = layer;
  }

  function findSize() {
    const n = Math.max(finds.length, 1);
    return n >= 10 ? 58 : n >= 8 ? 62 : FIND_SIZE;
  }

  function stampPaint(item: Find, wx: number, wy: number) {
    ensurePaint(item);
    if (!item.paintLayer || !item.mask) return;
    const s = findSize();
    const lx = ((wx - item.x) / s) * PAINT_RES + PAINT_RES / 2;
    const ly = ((wy - item.y) / s) * PAINT_RES + PAINT_RES / 2;
    const px = item.paintLayer.getContext("2d");
    if (!px) return;
    px.imageSmoothingEnabled = true;
    px.imageSmoothingQuality = "high";
    const r = PAINT_RES * 0.28;
    const hex = paintHex(crab.paint);
    px.fillStyle = hex;
    px.beginPath();
    px.arc(lx, ly, r * 0.72, 0, Math.PI * 2);
    px.fill();
    const g = px.createRadialGradient(lx, ly, r * 0.55, lx, ly, r);
    g.addColorStop(0, hex);
    g.addColorStop(1, hexRgba(hex, 0));
    px.fillStyle = g;
    px.beginPath();
    px.arc(lx, ly, r, 0, Math.PI * 2);
    px.fill();
    px.globalCompositeOperation = "destination-in";
    px.drawImage(item.mask, 0, 0);
    px.globalCompositeOperation = "source-over";
  }

  function findUnder(world: Vec, extra = 1.15): Find | null {
    let best: Find | null = null;
    let bestD = HIT * extra;
    for (const item of finds) {
      if (item.painted) continue;
      const d = dist(world, item);
      if (d < bestD) {
        best = item;
        bestD = d;
      }
    }
    return best;
  }

  function spawnSparkles(x: number, y: number, extra = false) {
    const colors = extra
      ? ["#fff6e8", paintHex(crab.paint), "#ffe27a", "#7ec8e3"]
      : ["#fff6e8", paintHex(crab.paint), "#ffe27a"];
    const n = extra ? 22 : 12;
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n + Math.random() * 0.2;
      const sp = 70 + Math.random() * (extra ? 140 : 90);
      particles.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 0.65 + Math.random() * 0.3,
        max: 0.95,
        size: 4 + Math.random() * 5,
        color: colors[i % colors.length]!,
        kind: "spark",
        rot: a,
        spin: (Math.random() - 0.5) * 4,
      });
    }
  }

  function spawnConfetti() {
    const colors = ["#e85d4c", "#5dbb63", "#ffe27a", "#7ec8e3", "#fff6e8", "#f4a06a"];
    for (let i = 0; i < 44; i++) {
      particles.push({
        x: 200 + Math.random() * 1200,
        y: 240 + Math.random() * 80,
        vx: (Math.random() - 0.5) * 80,
        vy: 40 + Math.random() * 140,
        life: 1.4 + Math.random() * 0.8,
        max: 2.2,
        size: 6 + Math.random() * 5,
        color: colors[i % colors.length]!,
        kind: "confetti",
        rot: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 6,
      });
    }
  }

  function spawnSand(x: number, y: number) {
    particles.push({
      x: x - crab.facing * 10,
      y: y + 16,
      vx: -crab.facing * (12 + Math.random() * 18),
      vy: -8 - Math.random() * 16,
      life: 0.28 + Math.random() * 0.12,
      max: 0.4,
      size: 3 + Math.random() * 3,
      color: "#e8c07a",
      kind: "sand",
      rot: 0,
      spin: 0,
    });
  }

  function paintFind(item: Find) {
    if (item.painted) return;
    item.painted = true;
    item.pop = 0;
    item.fly = 0.001;
    item.color = crab.paint;
    item.slot = paintedCount() - 1;
    const n = paintedCount();
    countPop = n;
    countKey += 1;
    const last = n >= finds.length;
    spawnSparkles(item.x, item.y, last);
    playSparkle();
    crab.wave = 0.55;
    if (settings.voiceCounts) speakCount(n);
    if (last) {
      pendingWin = true;
    }
    emitHud();
  }

  function dipPaint(id: PaintId) {
    crab.paint = id;
    const can = cans.find((c) => c.id === id);
    if (can) spawnSparkles(can.x, can.y, false);
    playDip();
    crab.wave = 0.4;
  }

  function crabBeside(item: Find) {
    return dist(crab, item) < HIT * 1.35;
  }

  function canPaint(item: Find) {
    return !item.painted && crabBeside(item);
  }

  function standByShell(item: Find): Vec {
    const vis = sandView();
    const spots = [
      { x: item.x, y: item.y + 58 },
      { x: item.x, y: item.y - 58 },
      { x: item.x + 58, y: item.y },
      { x: item.x - 58, y: item.y },
    ];
    const fit = spots.find((p) => p.x >= vis.x0 && p.x <= vis.x1 && p.y >= vis.y0 && p.y <= vis.y1);
    return clampToPlay(fit ?? { x: item.x, y: item.y + 40 }, false);
  }

  function goTo(world: Vec, id: number | null, canId: PaintId | null = null) {
    const dest = clampToPlay(world, canId != null || world.y < SAND_TOP);
    crab.target = dest;
    crab.targetId = id;
    crab.targetCan = canId;
    crab.state = "walk";
    if (Math.abs(dest.x - crab.x) > 4) crab.facing = dest.x >= crab.x ? 1 : -1;
  }

  function handlePointer(ev: PointerEvent) {
    if (phase === "loading" || phase === "won" || phase === "timesup" || phase === "menu") return;
    ev.preventDefault();
    try {
      canvas.setPointerCapture(ev.pointerId);
    } catch {
      /* ignore */
    }
    const world = worldFromEvent(ev);
    brush.down = true;
    brush.x = world.x;
    brush.y = world.y;

    playTap();
    const rect = canvas.getBoundingClientRect();
    if (ev.clientY - rect.top > css.h - bannerH()) return;

    let bestCan: (typeof cans)[number] | null = null;
    let canD = CAN_HIT;
    for (const can of cans) {
      const d = dist(world, can);
      if (d < canD) {
        bestCan = can;
        canD = d;
      }
    }
    if (bestCan) {
      goTo({ x: bestCan.x, y: bestCan.y }, null, bestCan.id);
      return;
    }

    if (world.y < WATER_MAX) return;

    const best = findUnder(world);
    if (best) {
      if (usingAuto() || !crabBeside(best)) {
        goTo(standByShell(best), best.id);
      } else {
        stampPaint(best, world.x, world.y);
      }
      return;
    }
    const vis = sandView();
    if (world.x >= vis.x0 && world.x <= vis.x1 && world.y >= vis.y0 && world.y <= vis.y1) {
      goTo(world, null);
    }
  }

  function handleMove(ev: PointerEvent) {
    updateHover(ev);
    if (phase !== "playing" || !brush.down) return;
    const world = worldFromEvent(ev);
    brush.x = world.x;
    brush.y = world.y;
    if (usingAuto()) return;
    const item = findUnder(world);
    if (item && canPaint(item)) stampPaint(item, world.x, world.y);
  }

  function handleUp() {
    brush.down = false;
  }

  function updateHover(ev: PointerEvent) {
    if (phase !== "playing") {
      canvas.style.cursor = "default";
      return;
    }
    const world = worldFromEvent(ev);
    const overCan = cans.some((c) => dist(world, c) < CAN_HIT);
    const over = overCan || finds.some((s) => !s.painted && dist(world, s) < HIT);
    canvas.style.cursor = over ? "pointer" : "default";
  }

  function update(dt: number) {
    refreshSettings();
    time += dt;
    if (phase === "playing") {
      playElapsed += dt;
      const left = secondsLeft();
      if (left !== lastTick) {
        lastTick = left ?? -1;
        emitHud();
      }
      if (left === 0) {
        phase = "timesup";
        emitHud();
      }
      if (brush.down && !usingAuto()) {
        const item = findUnder({ x: brush.x, y: brush.y });
        if (item && canPaint(item)) {
          item.paintTime += dt;
          stampPaint(item, brush.x, brush.y);
          if (Math.random() < 0.03) {
            particles.push({
              x: item.x + (Math.random() - 0.5) * 24,
              y: item.y + (Math.random() - 0.5) * 18,
              vx: (Math.random() - 0.5) * 40,
              vy: -30 - Math.random() * 40,
              life: 0.35,
              max: 0.4,
              size: 3,
              color: paintHex(crab.paint),
              kind: "spark",
              rot: 0,
              spin: 2,
            });
          }
          if (item.paintTime >= FILL_SECS) paintFind(item);
        }
      }
    }

    for (const item of finds) {
      if (item.pop < 1) item.pop = Math.min(1, item.pop + dt * 3.4);
      if (item.painted && item.fly < 1) item.fly = Math.min(1, item.fly + dt * 1.25);
    }
    if (pendingWin && finds.every((f) => f.fly >= 1)) {
      pendingWin = false;
      phase = "won";
      cleared = Math.max(cleared, hour());
      saveCleared(cleared);
      spawnConfetti();
      playWin();
      if (settings.voiceCounts) {
        speak(
          hour() >= 12
            ? "You finished the day! New pens and looks are in Loadout."
            : hour() >= 8
              ? "Wow! The shells are glowing!"
              : "Yay! You found them all.",
        );
      }
      emitHud();
    }

    if (crab.wave > 0) crab.wave = Math.max(0, crab.wave - dt);
    if (crab.blink > 0) crab.blink = Math.max(0, crab.blink - dt);
    else {
      crab.blinkWait -= dt;
      if (crab.blinkWait <= 0) {
        crab.blink = 0.12;
        crab.blinkWait = 2.4 + Math.random() * 2.2;
      }
    }

    if (crab.target) {
      const dx = crab.target.x - crab.x;
      const dy = crab.target.y - crab.y;
      const d = Math.hypot(dx, dy);
      if (d < 14) {
        crab.x = crab.target.x;
        crab.y = crab.target.y;
        if (crab.targetId != null) {
          const item = finds.find((s) => s.id === crab.targetId);
          if (item && usingAuto()) paintFind(item);
          else if (item) crab.wave = 0.4;
        } else if (crab.targetCan) {
          dipPaint(crab.targetCan);
        }
        crab.target = null;
        crab.targetId = null;
        crab.targetCan = null;
        crab.state = "idle";
        crab.frame = 0;
        crab.frameT = 0;
      } else {
        crab.state = "walk";
        const step = Math.min(d, CRAB_SPEED * dt);
        crab.x += (dx / d) * step;
        crab.y += (dy / d) * step;
        if (Math.abs(dx) > 3) crab.facing = dx >= 0 ? 1 : -1;
        stepAcc += step;
        puffAcc += dt;
        if (stepAcc > 28) {
          stepAcc = 0;
          if (phase === "playing") playScuttle();
        }
        if (puffAcc > 0.09) {
          puffAcc = 0;
          if (crab.y > SAND_TOP) spawnSand(crab.x, crab.y);
        }
      }
    }

    const fps = crab.state === "walk" ? 8 : 5;
    crab.frameT += dt;
    if (crab.frameT >= 1 / fps) {
      crab.frameT -= 1 / fps;
      crab.frame = (crab.frame + 1) % 4;
    }

    for (const p of particles) {
      p.life -= dt;
      if (p.kind === "token" && p.ox != null && p.oy != null && p.tx != null && p.ty != null) {
        const t = 1 - Math.max(0, p.life) / p.max;
        const e = easeInOut(Math.min(1, t));
        p.x = p.ox + (p.tx - p.ox) * e;
        p.y = p.oy + (p.ty - p.oy) * e - Math.sin(e * Math.PI) * 90;
        p.rot += p.spin * dt;
      } else {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.kind === "confetti") p.vy += 180 * dt;
        else if (p.kind === "sand") p.vy += 80 * dt;
        else {
          p.vx *= 0.98;
          p.vy *= 0.98;
        }
        p.rot += p.spin * dt;
      }
    }
    particles = particles.filter((p) => p.life > 0);
  }

  function drawCentered(
    img: CanvasImageSource,
    x: number,
    y: number,
    w: number,
    h: number,
    flip = false,
    rot = 0,
  ) {
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.translate(x, y);
    if (flip) ctx.scale(-1, 1);
    if (rot) ctx.rotate(rot);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  }

  function drawShadow(x: number, y: number, rx: number, ry: number) {
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = "#3a2a22";
    ctx.beginPath();
    ctx.ellipse(x, y + 6, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function colorizeSprite(src: CanvasImageSource, hex: string) {
    const key = `${hex}-${src instanceof HTMLImageElement ? src.src : "img"}`;
    const hit = paintCache.get(key);
    if (hit) return hit;
    const w = src instanceof HTMLImageElement || src instanceof HTMLCanvasElement ? src.width : 128;
    const h = src instanceof HTMLImageElement || src instanceof HTMLCanvasElement ? src.height : 128;
    const c = document.createElement("canvas");
    c.width = Math.max(1, w);
    c.height = Math.max(1, h);
    const x = c.getContext("2d");
    if (!x) return src;
    x.imageSmoothingEnabled = true;
    x.imageSmoothingQuality = "high";
    x.fillStyle = hex;
    x.fillRect(0, 0, c.width, c.height);
    x.globalCompositeOperation = "multiply";
    x.drawImage(src, 0, 0);
    x.globalCompositeOperation = "destination-in";
    x.drawImage(src, 0, 0);
    paintCache.set(key, c);
    return c;
  }

  function drawPaintCan(can: { hex: string; x: number; y: number; id: PaintId }) {
    const bob = Math.sin(time * 2.1 + can.x * 0.02) * 3;
    const y = can.y + bob;
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "#2a6a88";
    ctx.beginPath();
    ctx.ellipse(can.x, can.y + 22, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = "#fff6e8";
    ctx.beginPath();
    ctx.roundRect(can.x - 14, y - 10, 28, 26, 5);
    ctx.fill();
    ctx.fillStyle = can.hex;
    ctx.beginPath();
    ctx.roundRect(can.x - 12, y - 6, 24, 20, 4);
    ctx.fill();
    ctx.fillStyle = "#fff6e8";
    ctx.beginPath();
    ctx.ellipse(can.x, y - 10, 15, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = can.hex;
    ctx.beginPath();
    ctx.ellipse(can.x, y - 10, 10, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
    if (crab.paint === can.id) {
      ctx.strokeStyle = "#fffce6";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(can.x, y + 2, 20, 22, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawBrush(
    x: number,
    y: number,
    facing: 1 | -1,
    hex: string,
    rot: number,
    part: "handle" | "head" | "all" = "all",
  ) {
    ctx.save();
    ctx.translate(x + facing * 26, y - 34);
    ctx.rotate(facing * -0.22 + rot * 0.1);

    if (part !== "head") {
      ctx.fillStyle = "#7a4020";
      ctx.beginPath();
      ctx.roundRect(-2.2, 2, 4.4, 28, 2);
      ctx.fill();
      ctx.fillStyle = "#c47a3a";
      ctx.beginPath();
      ctx.roundRect(-1.2, 4, 1.8, 24, 1);
      ctx.fill();
      ctx.fillStyle = "#efe6d4";
      ctx.beginPath();
      ctx.roundRect(-4.5, -2, 9, 7, 1.8);
      ctx.fill();
      ctx.fillStyle = "#d4c4a4";
      ctx.fillRect(-4.5, 1, 9, 1.4);
    }

    if (part !== "handle") {
      ctx.fillStyle = hex;
      ctx.beginPath();
      ctx.moveTo(-5, -2);
      ctx.lineTo(-6, -16);
      ctx.lineTo(-2, -20);
      ctx.lineTo(0, -17);
      ctx.lineTo(2, -20);
      ctx.lineTo(6, -16);
      ctx.lineTo(5, -2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = hex;
      ctx.lineWidth = 1.1;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-4, -4);
      ctx.lineTo(-5, -17);
      ctx.moveTo(0, -4);
      ctx.lineTo(0, -19);
      ctx.moveTo(4, -4);
      ctx.lineTo(5, -17);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawStar(x: number, y: number, r: number, color: string, rot: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      ctx.lineTo(Math.cos(a + Math.PI / 4) * r * 0.38, Math.sin(a + Math.PI / 4) * r * 0.38);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawSandDollar(x: number, y: number, s: number, happy: boolean, hex = "#fff4dc") {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = hex;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.46, s * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = happy ? "#3a2a22" : "#d8b48a";
    ctx.globalAlpha = happy ? 0.35 : 1;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = happy ? "#fff6e8" : "#e0c49a";
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * s * 0.28, Math.sin(a) * s * 0.28);
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawSnail(x: number, y: number, s: number, happy: boolean, hex = "#fffce8") {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = hex;
    ctx.beginPath();
    ctx.ellipse(s * 0.16, s * 0.16, s * 0.28, s * 0.16, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = hex;
    ctx.beginPath();
    ctx.arc(-s * 0.06, -s * 0.04, s * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = happy ? "rgba(58,42,34,0.35)" : "#c9b089";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-s * 0.06, -s * 0.04, s * 0.16, 0.4, Math.PI * 2.2);
    ctx.stroke();
    ctx.fillStyle = "#3a2a22";
    ctx.beginPath();
    ctx.arc(s * 0.28, s * 0.08, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawHat(x: number, y: number, size: number, hat: CrabHat, flip: boolean) {
    if (hat === "none") return;
    ctx.save();
    ctx.translate(x, y - size * 0.4);
    if (flip) ctx.scale(-1, 1);
    if (hat === "bow") {
      ctx.fillStyle = "#f4a4c8";
      ctx.beginPath();
      ctx.moveTo(-16, 0);
      ctx.lineTo(-2, -8);
      ctx.lineTo(-2, 8);
      ctx.closePath();
      ctx.moveTo(16, 0);
      ctx.lineTo(2, -8);
      ctx.lineTo(2, 8);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (hat === "bucket") {
      ctx.fillStyle = "#ffe27a";
      ctx.beginPath();
      ctx.moveTo(-14, -2);
      ctx.lineTo(-10, 12);
      ctx.lineTo(10, 12);
      ctx.lineTo(14, -2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#7ec8e3";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, -2, 11, Math.PI, 0);
      ctx.stroke();
    } else {
      ctx.fillStyle = "#fff6e8";
      ctx.beginPath();
      ctx.ellipse(0, 6, 20, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-10, -8, 20, 14);
      ctx.fillStyle = "#4ea8c9";
      ctx.fillRect(-10, 0, 20, 4);
    }
    ctx.restore();
  }

  function drawWaterShimmer() {
    const glow = nightGlow();
    ctx.save();
    for (let i = 0; i < 5; i++) {
      const y = 36 + i * 28 + Math.sin(time * 1.2 + i * 0.9) * 5;
      ctx.globalAlpha = 0.12 * (1 - glow * 0.55);
      ctx.strokeStyle = glow > 0.6 ? "#8ec8ff" : "#e8fbff";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= WORLD_W; x += 40) {
        ctx.lineTo(x, y + Math.sin(time * 1.6 + x * 0.012 + i) * 7);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 0.55 * (1 - nightGlow() * 0.7);
    ctx.fillStyle = nightGlow() > 0.6 ? "#c8e4f8" : "#f7fdff";
    const foamY = 188 + Math.sin(time * 1.4) * 2;
    ctx.beginPath();
    ctx.moveTo(0, foamY);
    for (let x = 0; x <= WORLD_W; x += 24) {
      ctx.lineTo(x, foamY + Math.sin(time * 2 + x * 0.03) * 4);
    }
    ctx.lineTo(WORLD_W, foamY + 16);
    ctx.lineTo(0, foamY + 16);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawSkyMood() {
    const tint = skyTint();
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = tint.alpha;
    ctx.fillStyle = tint.multiply;
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);
    ctx.restore();

    const glow = nightGlow();
    if (glow > 0.45) {
      ctx.save();
      ctx.globalAlpha = (glow - 0.45) * 1.4;
      for (let i = 0; i < 28; i++) {
        const x = 80 + ((i * 137) % (WORLD_W - 160));
        const y = 20 + ((i * 53) % 170);
        const twinkle = 0.45 + Math.sin(time * 2 + i) * 0.35;
        ctx.fillStyle = `rgba(255,246,232,${twinkle})`;
        ctx.beginPath();
        ctx.arc(x, y, i % 4 === 0 ? 2.2 : 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    if (glow > 0.7) {
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = "#fff6e8";
      ctx.beginPath();
      ctx.arc(1280, 90, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(1296, 78, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawFindSprite(item: Find, x: number, y: number, s: number, happy: boolean) {
    const glow = shellGlow();
    const hex = paintHex(item.color);
    const light = happy ? hex : "#e8f6ff";
    if (!happy && glow > 0.04) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.12 + glow * 0.55;
      ctx.fillStyle = light;
      ctx.beginPath();
      ctx.ellipse(x, y, s * (0.42 + glow * 0.28), s * (0.32 + glow * 0.2), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    drawShadow(x, y, s * 0.34, s * 0.13);
    if (item.kind === "shell" && assets) {
      const base = assets.white[item.variant]!;
      if (happy) {
        drawCentered(colorizeSprite(base, hex), x, y, s, s);
      } else {
        drawCentered(base, x, y, s, s);
        if (item.paintTime > 0) {
          const t = Math.min(1, item.paintTime / FILL_SECS);
          ctx.save();
          ctx.globalAlpha = 0.45 + 0.55 * t;
          drawCentered(colorizeSprite(base, paintHex(crab.paint)), x, y, s, s);
          ctx.restore();
        }
      }
    } else if (item.kind === "starfish" && assets) {
      drawCentered(assets.starfish, x, y, s * 1.05, s * 1.05, false, happy ? 0.2 : 0);
    } else if (item.kind === "sanddollar") {
      drawSandDollar(x, y, s, happy, happy ? hex : "#fff4dc");
    } else {
      drawSnail(x, y, s, happy, happy ? hex : "#fffce8");
    }
    if (!happy && item.kind !== "shell" && item.paintLayer) {
      drawCentered(item.paintLayer, x, y, s, s);
    }
  }

  function drawFind(item: Find) {
    if (item.painted) return;
    const pulse = 1 + Math.sin(time * 2.4 + item.id) * 0.03;
    const focus = crabBeside(item) ? 1.14 : 1;
    const s = findSize() * pulse * focus;
    drawFindSprite(item, item.x, item.y, s, false);
  }

  function drawBanner() {
    const h = bannerH();
    const total = Math.max(finds.length, 1);
    ctx.save();
    ctx.fillStyle = "rgba(255, 246, 232, 0.94)";
    ctx.strokeStyle = "rgba(255, 233, 200, 1)";
    ctx.lineWidth = 3;
    roundRect(10, css.h - h - 6, css.w - 20, h, 22);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#6b5348";
    ctx.font = "700 12px Fredoka, Nunito, ui-rounded, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("My shells", 24, css.h - h + 10);
    ctx.textAlign = "right";
    ctx.fillStyle = "#3a2a22";
    ctx.font = "700 16px Fredoka, Nunito, ui-rounded, system-ui, sans-serif";
    ctx.fillText(`${paintedCount()} / ${finds.length}`, css.w - 24, css.h - h + 8);
    ctx.textAlign = "left";

    for (let i = 0; i < total; i++) {
      const slot = slotScreen(i, total);
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = "#ffe9c8";
      ctx.beginPath();
      ctx.ellipse(slot.x, slot.y, slot.size * 0.42, slot.size * 0.32, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  function drawCollected() {
    const total = Math.max(finds.length, 1);
    for (const item of finds) {
      if (!item.painted) continue;
      const from = worldToScreen(item);
      const slot = slotScreen(Math.max(0, item.slot), total);
      const pop = item.pop < 1 ? easeOutBack(item.pop) : 1;
      const hold = Math.min(1, item.fly / 0.18);
      const travel = item.fly < 0.18 ? 0 : easeInOut((item.fly - 0.18) / 0.82);
      const x = from.x + (slot.x - from.x) * travel;
      const y = from.y + (slot.y - from.y) * travel - Math.sin(travel * Math.PI) * 70;
      const worldSize = FIND_SIZE * view.scale * (1.12 + 0.2 * pop);
      const s = worldSize + (slot.size - worldSize) * travel;
      ctx.save();
      if (hold < 1 && travel === 0) {
        ctx.globalAlpha = 1;
      }
      drawFindSprite(item, x, y, s, true);
      ctx.restore();
    }
  }

  function roundRect(x: number, y: number, w: number, h: number, r: number) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function draw() {
    ctx.clearRect(0, 0, css.w, css.h);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = skyTint().fill;
    ctx.fillRect(0, 0, css.w, css.h);

    ctx.save();
    ctx.translate(view.x, view.y);
    ctx.scale(view.scale, view.scale);

    if (assets) ctx.drawImage(assets.beach, 0, 0, WORLD_W, WORLD_H);
    drawWaterShimmer();
    drawSkyMood();

    type Layer = { y: number; z: number; draw: () => void };
    const layers: Layer[] = [];

    if (assets) {
      for (const can of cans) {
        layers.push({
          y: can.y,
          z: 0,
          draw: () => drawPaintCan(can),
        });
      }
      for (const item of finds) {
        const focus = !item.painted && crabBeside(item);
        layers.push({
          y: item.y,
          z: focus ? 4 : 1,
          draw: () => drawFind(item),
        });
      }

      const kit = assets.crab[crab.paint] ?? assets.crab.green;
      const frames = crab.state === "walk" ? kit.walk : kit.idle;
      const img = frames[crab.frame]!;
      const waveRot = crab.wave > 0 ? Math.sin(crab.wave * 22) * 0.18 : 0;
      layers.push({
        y: crab.y + 8,
        z: 2,
        draw: () => {
          drawShadow(crab.x, crab.y, 28, 10);
          drawCentered(img, crab.x, crab.y, CRAB_SIZE, CRAB_SIZE, crab.facing < 0, waveRot);
          if (crab.blink > 0) {
            ctx.save();
            ctx.globalAlpha = 0.85;
            ctx.fillStyle = "#e85d4c";
            ctx.beginPath();
            ctx.ellipse(crab.x + crab.facing * 8, crab.y - 10, 10, 3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
          drawHat(crab.x, crab.y, CRAB_SIZE, crabHat(), crab.facing < 0);
        },
      });
    }

    layers.sort((a, b) => a.z - b.z || a.y - b.y);
    for (const layer of layers) layer.draw();

    for (const p of particles) {
      const a = Math.max(0, p.life / p.max);
      ctx.globalAlpha = a;
      if (p.kind === "spark") drawStar(p.x, p.y, p.size, p.color, p.rot);
      else if (p.kind === "token") {
        drawStar(p.x, p.y, p.size, "#7dff7a", p.rot);
        drawStar(p.x, p.y, p.size * 0.45, "#fffce6", p.rot + 0.4);
      }
      else if (p.kind === "sand") {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size * 0.35, -p.size * 0.6, p.size * 0.7, p.size * 1.2);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }

    ctx.restore();
    drawBanner();
    drawCollected();
  }

  function frame(ts: number) {
    if (!running) return;
    const raw = last ? (ts - last) / 1000 : 0.016;
    last = ts;
    const dt = Math.min(raw, 0.1);
    if (phase !== "loading") update(dt);
    draw();
    raf = requestAnimationFrame(frame);
  }

  canvas.addEventListener("pointerdown", handlePointer);
  canvas.addEventListener("pointermove", handleMove);
  canvas.addEventListener("pointerup", handleUp);
  canvas.addEventListener("pointercancel", handleUp);
  window.addEventListener("resize", resize);
  refreshSettings();
  resize();
  resetWorld("sunny");
  raf = requestAnimationFrame(frame);
  emitHud();

  type TestHook = {
    phase: () => GamePhase;
    shells: () => Array<{ x: number; y: number; painted: boolean; sx: number; sy: number }>;
    crab: () => { x: number; y: number; sx: number; sy: number; state: string };
    setLevel: (n: number) => void;
    completeHour: () => void;
    paintAt: (sx: number, sy: number, seconds: number) => void;
    tryPaint: (sx: number, sy: number, seconds: number) => boolean;
    setCleared: (n: number) => void;
  };
  (window as unknown as { __gameTest?: TestHook }).__gameTest = {
    phase: () => phase,
    shells: () =>
      finds.map((s) => ({
        x: s.x,
        y: s.y,
        painted: s.painted,
        sx: view.x + s.x * view.scale,
        sy: view.y + s.y * view.scale,
      })),
    setLevel: (n: number) => {
      level = Math.min(MAX_LEVELS, Math.max(1, n));
      resetWorld("sunny");
      phase = "playing";
      emitHud();
    },
    completeHour: () => {
      for (const item of finds) {
        item.painted = true;
        item.fly = 1;
        item.pop = 1;
      }
      pendingWin = true;
    },
    paintAt: (sx: number, sy: number, seconds: number) => {
      const world = {
        x: (sx - view.x) / view.scale,
        y: (sy - view.y) / view.scale,
      };
      const item = findUnder(world, 1.4);
      if (!item) return;
      crab.x = item.x;
      crab.y = item.y;
      crab.target = null;
      crab.state = "idle";
      item.paintTime += seconds;
      stampPaint(item, world.x, world.y);
      if (item.paintTime >= FILL_SECS) paintFind(item);
    },
    tryPaint: (sx: number, sy: number, seconds: number) => {
      const world = {
        x: (sx - view.x) / view.scale,
        y: (sy - view.y) / view.scale,
      };
      const item = findUnder(world, 1.4);
      if (!item || !canPaint(item)) return false;
      item.paintTime += seconds;
      stampPaint(item, world.x, world.y);
      if (item.paintTime >= FILL_SECS) paintFind(item);
      return true;
    },
    setCleared: (n: number) => {
      cleared = Math.min(MAX_LEVELS, Math.max(0, n));
      saveCleared(cleared);
      emitHud();
    },
    crab: () => ({
      x: crab.x,
      y: crab.y,
      sx: view.x + crab.x * view.scale,
      sy: view.y + crab.y * view.scale,
      state: crab.state,
    }),
  };

  void loadAssets()
    .then((loaded) => {
      if (!running) return;
      assets = loaded;
      phase = "menu";
      emitHud();
    })
    .catch((err) => {
      console.error(err);
    });

  return {
    start() {
      const n = unlockedFrom(cleared, dev);
      level = n;
      resetWorld("sunny");
      phase = "playing";
      unlockAudio();
      refreshSettings();
      emitHud();
    },
    playLevel(n: number) {
      const cap = unlockedFrom(cleared, dev);
      if (n < 1 || n > cap) return;
      level = n;
      resetWorld("sunny");
      phase = "playing";
      unlockAudio();
      refreshSettings();
      emitHud();
    },
    goMenu() {
      phase = "menu";
      brush.down = false;
      emitHud();
    },
    setDev(on: boolean) {
      dev = on;
      saveDev(on);
      emitHud();
    },
    resetProgress() {
      cleared = 0;
      saveCleared(0);
      level = 1;
      resetWorld("sunny");
      phase = "menu";
      emitHud();
    },
    replay(opts?: { theme?: BeachTheme; advance?: boolean; restart?: boolean }) {
      if (opts?.restart) level = 1;
      else if (opts?.advance) level = Math.min(unlockedFrom(cleared, dev), level + 1);
      resetWorld(opts?.theme ?? "sunny");
      phase = "playing";
      unlockAudio();
      emitHud();
    },
    addTime(seconds: number) {
      extraTime += seconds;
      if (phase === "timesup") phase = "playing";
      emitHud();
    },
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointerdown", handlePointer);
      canvas.removeEventListener("pointermove", handleMove);
      canvas.removeEventListener("pointerup", handleUp);
      canvas.removeEventListener("pointercancel", handleUp);
      window.removeEventListener("resize", resize);
      delete (window as unknown as { __gameTest?: unknown }).__gameTest;
    },
  };
}
```

## src/game/GameCanvas.tsx

```ts
import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Home, Lock, Palette, Play, RotateCcw, Timer, UserRound, Volume2, VolumeX } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { loadSettings, saveSettings, type CrabColor, type CrabHat, type PenId } from "@/lib/settings";
import { APP_VERSION } from "@/lib/version";
import { assetUrl } from "@/lib/asset";
import { isMuted, setMuted, setMusicEnabled, unlockAudio } from "./audio";
import { createGame, HOUR_SKIES, hourLabel, type GameApi, type GameHud } from "./engine";

const EMPTY: GameHud = {
  phase: "loading",
  painted: 0,
  total: 6,
  theme: "sunny",
  countPop: null,
  countKey: 0,
  secondsLeft: null,
  level: 1,
  maxLevel: 12,
  hour: 1,
  skyFill: "#7ec8e3",
  cleared: 0,
  unlocked: 1,
  pen: "swipe",
  finished: false,
  dev: false,
  extrasOpen: false,
};

function AnalogClock({ hour, className = "size-10 shrink-0" }: { hour: number; className?: string }) {
  const deg = (hour % 12) * 30;
  const rad = ((deg - 90) * Math.PI) / 180;
  const hx = 20 + Math.cos(rad) * 9;
  const hy = 20 + Math.sin(rad) * 9;
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="18" fill="#fff6e8" stroke="#e8c07a" strokeWidth="2.6" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n) => {
        const a = ((n * 30 - 90) * Math.PI) / 180;
        const inner = n % 3 === 0 ? 13 : 15;
        return (
          <line
            key={n}
            x1={20 + Math.cos(a) * inner}
            y1={20 + Math.sin(a) * inner}
            x2={20 + Math.cos(a) * 16.5}
            y2={20 + Math.sin(a) * 16.5}
            stroke="#6b5348"
            strokeWidth={n % 3 === 0 ? 1.8 : 1}
            strokeLinecap="round"
          />
        );
      })}
      <line x1="20" y1="20" x2="20" y2="8.5" stroke="#3a2a22" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="20" y1="20" x2={hx} y2={hy} stroke="#e85d4c" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="20" cy="20" r="2.2" fill="#3a2a22" />
    </svg>
  );
}

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const apiRef = useRef<GameApi | null>(null);
  const [hud, setHud] = useState<GameHud>(EMPTY);
  const [muted, setMutedUi] = useState(false);
  const [popOn, setPopOn] = useState(false);
  const [loadout, setLoadout] = useState(false);
  const [kit, setKit] = useState(() => loadSettings());
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const api = createGame(canvas, {
      onHud: setHud,
      getSettings: loadSettings,
    });
    apiRef.current = api;
    setMusicEnabled(loadSettings().music);
    return () => {
      api.destroy();
      apiRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (hud.countPop == null) return;
    setPopOn(true);
    const t = window.setTimeout(() => setPopOn(false), 700);
    return () => window.clearTimeout(t);
  }, [hud.countKey, hud.countPop]);

  useEffect(() => {
    try {
      if (window.localStorage.getItem("crabby-beach-intro-seen-v1") !== "1") {
        setShowIntro(true);
      }
    } catch {
      setShowIntro(true);
    }
  }, []);

  function play() {
    unlockAudio();
    setMusicEnabled(loadSettings().music);
    apiRef.current?.start();
  }

  function playHour(n: number) {
    unlockAudio();
    setMusicEnabled(loadSettings().music);
    apiRef.current?.playLevel(n);
  }

  function goMenu() {
    setLoadout(false);
    apiRef.current?.goMenu();
  }

  function finishIntro() {
    try {
      window.localStorage.setItem("crabby-beach-intro-seen-v1", "1");
    } catch {
      /* private mode */
    }
    setShowIntro(false);
  }

  function equip(patch: Partial<typeof kit>) {
    if (!hud.extrasOpen && (patch.pen === "auto" || (patch.color && patch.color !== "red") || (patch.hat && patch.hat !== "none"))) {
      return;
    }
    const next = { ...kit, ...patch };
    setKit(next);
    saveSettings(next);
  }

  function replay(opts?: { theme?: "sunny" | "sunset"; advance?: boolean; restart?: boolean }) {
    unlockAudio();
    setMusicEnabled(loadSettings().music);
    apiRef.current?.replay(opts);
  }

  function moreTime() {
    unlockAudio();
    apiRef.current?.addTime(60);
  }

  function toggleMute() {
    const next = !muted;
    setMutedUi(next);
    setMuted(next);
    if (!next) unlockAudio();
  }

  const timerLabel =
    hud.secondsLeft == null
      ? null
      : `${Math.floor(hud.secondsLeft / 60)}:${String(hud.secondsLeft % 60).padStart(2, "0")}`;

  const inGame = hud.phase === "playing" || hud.phase === "won" || hud.phase === "timesup";

  return (
    <div className="flex h-dvh w-full justify-center overflow-hidden bg-sand" style={inGame ? { background: hud.skyFill } : undefined}>
      <div
        className="relative h-dvh w-full max-w-[28rem] overflow-hidden bg-sand text-ink"
        style={inGame ? { background: hud.skyFill } : undefined}
      >
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 h-full w-full touch-none select-none ${inGame ? "" : "invisible"}`}
        aria-label="Crabby walking on the beach"
      />

      {inGame && (
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 px-3 pb-3 pt-[max(0.7rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-2 rounded-pill bg-cream/90 py-1.5 pr-4 pl-1.5 shadow-md shadow-ink/10 ring-2 ring-cream-soft">
          <AnalogClock hour={hud.hour} />
          <div>
            <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">{hourLabel(hud.hour)}</p>
            <p className="text-lg leading-none font-bold tabular-nums">
              {hud.level}
              <span className="text-ink-soft"> / {hud.maxLevel}</span>
            </p>
          </div>
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          {timerLabel && (
            <div className="flex items-center gap-1 rounded-pill bg-cream/90 px-3 py-2 text-sm font-bold shadow-md shadow-ink/10 ring-2 ring-cream-soft">
              <Timer className="size-4" />
              {timerLabel}
            </div>
          )}
          <button
            type="button"
            onClick={toggleMute}
            className="grid size-12 place-items-center rounded-pill bg-cream/90 text-ink shadow-md shadow-ink/10 ring-2 ring-cream-soft"
            aria-label={muted ? "Unmute sounds" : "Mute sounds"}
          >
            {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
          </button>
          {hud.phase === "playing" && (
            <button
              type="button"
              onClick={goMenu}
              className="grid size-12 place-items-center rounded-pill bg-cream/90 text-ink shadow-md shadow-ink/10 ring-2 ring-cream-soft"
              aria-label="Back to menu"
            >
              <Home className="size-5" />
            </button>
          )}
          <AuthChip />
        </div>
      </header>
      )}

      {popOn && hud.countPop != null && (
        <div
          key={hud.countKey}
          className="count-pop pointer-events-none absolute top-1/3 left-1/2 z-30 -translate-x-1/2 text-7xl font-bold text-cream drop-shadow-md sm:text-8xl"
        >
          {hud.countPop}
        </div>
      )}

      {(hud.phase === "playing" || hud.phase === "won") && (
        <div
          className="pointer-events-none absolute left-3 right-3 z-30"
          style={{ top: "max(7.1rem, calc(env(safe-area-inset-top) + 5.6rem))" }}
        >
          <div className="sky-bar relative h-8 overflow-hidden rounded-pill bg-cream/90 shadow-md shadow-ink/10 ring-2 ring-cream-soft">
            <div
              className="sky-bar-clip absolute inset-y-0 left-0 overflow-hidden rounded-pill"
              style={{ width: `${hud.total ? (hud.painted / hud.total) * 100 : 0}%` }}
            >
              <div className="sky-bar-fill" />
            </div>
            <p className="absolute inset-0 grid place-items-center text-sm font-bold text-ink drop-shadow-[0_1px_0_rgba(255,246,232,0.8)]">
              {hud.painted >= hud.total ? "All colored!" : `${hud.total - hud.painted} left`}
            </p>
          </div>
        </div>
      )}

      {hud.phase === "playing" && hud.painted === 0 && (
        <p className="pointer-events-none absolute bottom-32 left-1/2 z-10 w-[min(92%,20rem)] -translate-x-1/2 rounded-pill bg-cream/90 px-4 py-2.5 text-center text-sm font-semibold text-ink shadow-md shadow-ink/10 ring-2 ring-cream-soft">
          {hud.pen === "auto" ? "Tap a paint can or a white shell" : "Tap a shell so Crabby walks over, then paint"}
        </p>
      )}

      {hud.phase === "loading" && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-sky">
          <div className="rounded-card bg-cream px-8 py-6 text-center shadow-lg shadow-ink/10">
            <p className="text-2xl font-bold">Crabby Beach</p>
            <p className="mt-1 text-ink-soft">Warming up the sand…</p>
          </div>
        </div>
      )}

      {hud.phase === "menu" && !loadout && (
        <div className="menu-sky absolute inset-0 z-30 flex flex-col overflow-y-auto">
          <div className="menu-sun" aria-hidden="true" />
          <div className="relative z-10 flex items-center justify-between px-4 pt-[max(1.1rem,env(safe-area-inset-top))]">
            <p className="rounded-pill bg-cream px-3 py-1 text-sm font-bold tracking-wide text-ink shadow-md shadow-ink/10 ring-2 ring-cream-soft">
              {APP_VERSION}{hud.dev ? " · DEV" : ""}
            </p>
            <button
              type="button"
              onClick={toggleMute}
              className="grid size-12 place-items-center rounded-pill bg-cream text-ink shadow-md shadow-ink/10 ring-2 ring-cream-soft"
              aria-label={muted ? "Unmute sounds" : "Mute sounds"}
            >
              {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
            </button>
          </div>
          <div className="relative z-10 mx-auto flex w-full max-w-sm flex-1 flex-col px-4 pb-2 text-center">
            <p className="mt-3 text-sm font-semibold tracking-wide text-sky-deep uppercase">From 1pm to midnight</p>
            <h1 className="mt-1 text-[2.4rem] leading-none font-bold tracking-tight text-coral drop-shadow-[0_2px_0_rgba(255,246,232,0.8)]">
              Crabby Beach
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">Pick an hour. Finish it to open the next one.</p>
            <div className="mt-4 rounded-[1.75rem] bg-cream/95 p-3 shadow-lg shadow-ink/10 ring-4 ring-cream-soft">
              <div className="grid grid-cols-3 gap-2">
                {HOUR_SKIES.map((sky, i) => {
                  const hour = i + 1;
                  const open = hour <= hud.unlocked;
                  const done = hour <= hud.cleared;
                  return (
                    <button
                      key={hour}
                      type="button"
                      disabled={!open}
                      onClick={() => playHour(hour)}
                      className="relative flex min-h-[4.5rem] flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-2 shadow-sm ring-2 disabled:cursor-not-allowed"
                      style={
                        open
                          ? { background: sky, color: hour >= 7 ? "#fff6e8" : "#3a2a22", boxShadow: "inset 0 0 0 2px rgba(255,246,232,0.55)" }
                          : { background: "#efe0c8", color: "#8a7468" }
                      }
                      aria-label={open ? hourLabel(hour) : `${hourLabel(hour)} locked`}
                    >
                      {open ? (
                        <AnalogClock hour={hour} className="size-8" />
                      ) : (
                        <Lock className="size-5 opacity-70" />
                      )}
                      <span className="text-sm font-bold">{hourLabel(hour)}</span>
                      {done && (
                        <span className="absolute top-1 right-1 grid size-5 place-items-center rounded-full bg-mint text-cream">
                          <Check className="size-3.5" strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              type="button"
              onClick={play}
              className="mt-4 min-h-14 w-full rounded-pill bg-coral px-6 py-3 text-lg font-bold text-cream shadow-md shadow-coral-deep/30 hover:bg-coral-deep"
            >
              Play {hourLabel(hud.unlocked)}
            </button>
            <button
              type="button"
              onClick={() => setLoadout(true)}
              className="mt-2 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill bg-cream px-6 py-3 text-base font-bold text-ink ring-2 ring-sand-deep"
            >
              <Palette className="size-5" />
              Loadout
            </button>
            <button
              type="button"
              onClick={() => setShowIntro(true)}
              className="mt-2 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill bg-cream px-6 py-3 text-base font-bold text-ink ring-2 ring-sand-deep"
            >
              <Play className="size-5" />
              Watch intro
            </button>
            {hud.dev && <p className="mt-2 text-xs font-bold tracking-wide text-coral uppercase">Dev mode on · all hours open</p>}
            <button
              type="button"
              onClick={() => apiRef.current?.setDev(!hud.dev)}
              className={`mt-2 min-h-10 self-center rounded-pill px-4 text-sm font-bold ring-2 ${
                hud.dev ? "bg-coral text-cream ring-coral-deep" : "bg-cream/90 text-ink-soft ring-sand-deep"
              }`}
            >
              Dev {hud.dev ? "on" : "off"}
            </button>
            <div className="relative mt-auto flex min-h-[7.5rem] items-end justify-center pt-3">
              <img
                src={assetUrl("game/shell-white-2.png")}
                alt=""
                className="absolute bottom-6 left-6 w-12 rotate-[-18deg] drop-shadow-md"
              />
              <img
                src={assetUrl("game/shell-white-4.png")}
                alt=""
                className="absolute right-8 bottom-8 w-11 rotate-[22deg] drop-shadow-md"
              />
              <img
                src={assetUrl("game/crabby/idle-green-0.png?v=051")}
                alt=""
                className="menu-crab relative z-10 w-28 drop-shadow-md"
              />
            </div>
            <Link
              to="/grownups"
              className="mt-1 mb-2 inline-block text-xs font-semibold tracking-wide text-ink-soft/70 uppercase hover:text-ink-soft"
            >
              Grown-ups
            </Link>
          </div>
        </div>
      )}

      {hud.phase === "menu" && loadout && (
        <LoadoutCard
          extrasOpen={hud.extrasOpen}
          kit={kit}
          onEquip={equip}
          onBack={() => setLoadout(false)}
        />
      )}

      {hud.phase === "won" && (
        <div
          className="absolute inset-x-0 z-20 flex items-center px-3"
          style={{
            top: "max(9.4rem, calc(env(safe-area-inset-top) + 7.8rem))",
            bottom: "max(7.4rem, calc(env(safe-area-inset-bottom) + 6.6rem))",
          }}
        >
          <div className="max-h-full w-full overflow-y-auto rounded-card bg-cream px-5 py-5 text-center shadow-xl shadow-ink/20 ring-4 ring-mint">
            <p className="text-mint-deep text-sm font-semibold tracking-wide uppercase">
              {hud.level >= hud.maxLevel ? "12am · midnight" : hourLabel(hud.hour)}
            </p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-mint-deep sm:text-4xl">
              {hud.level >= hud.maxLevel ? "The shells lit up the night!" : "Yay! You found them all"}
            </h2>
            <p className="mt-3 text-base text-ink-soft">
              {hud.level >= hud.maxLevel
                ? hud.finished
                  ? "Loadout is open — auto-fill pen and new looks."
                  : "From 1pm to midnight. Want to start the afternoon again?"
                : `Next hour is ${hourLabel(hud.hour + 1)}. The sky gets a little darker.`}
            </p>
            <div className="mt-6 grid gap-3">
              {hud.level < hud.maxLevel ? (
                <button
                  type="button"
                  onClick={() => replay({ advance: true })}
                  className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-pill bg-coral px-6 py-3 text-lg font-bold text-cream shadow-md hover:bg-coral-deep"
                >
                  Next hour
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => replay({ theme: "sunny", restart: true })}
                  className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-pill bg-coral px-6 py-3 text-lg font-bold text-cream shadow-md hover:bg-coral-deep"
                >
                  Start at 1pm
                </button>
              )}
              <button
                type="button"
                onClick={() => replay({ restart: hud.level >= hud.maxLevel })}
                className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-pill bg-mint px-6 py-3 text-lg font-bold text-cream shadow-md hover:bg-mint-deep"
              >
                <RotateCcw className="size-5" />
                This hour again
              </button>
              <button
                type="button"
                onClick={goMenu}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill bg-cream-soft px-6 py-3 text-base font-bold text-ink ring-2 ring-sand-deep hover:bg-sand"
              >
                <Home className="size-5" />
                Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {hud.phase === "timesup" && (
        <div className="absolute inset-0 z-20 grid place-items-end bg-ink/25 px-3 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="w-full rounded-t-card rounded-b-3xl bg-cream px-5 py-6 text-center shadow-xl shadow-ink/20 ring-4 ring-cream-soft">
            <p className="text-sky-deep text-sm font-semibold tracking-wide uppercase">All done for now</p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-ink">That was a lovely play</h2>
            <p className="mt-3 text-base text-ink-soft">Need one more minute, or start a new beach?</p>
            <div className="mt-6 grid gap-3">
              <button
                type="button"
                onClick={moreTime}
                className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-pill bg-coral px-6 py-3 text-lg font-bold text-cream shadow-md hover:bg-coral-deep"
              >
                <Timer className="size-5" />
                One more minute
              </button>
              <button
                type="button"
                onClick={() => replay({ theme: "sunny", restart: true })}
                className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-pill bg-mint px-6 py-3 text-lg font-bold text-cream shadow-md hover:bg-mint-deep"
              >
                <RotateCcw className="size-5" />
                New beach
              </button>
              <button
                type="button"
                onClick={goMenu}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill bg-cream-soft px-6 py-3 text-base font-bold text-ink ring-2 ring-sand-deep hover:bg-sand"
              >
                <Home className="size-5" />
                Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {inGame && (
      <p className="pointer-events-none absolute top-[4.6rem] right-3 z-10 rounded-pill bg-cream px-3 py-1 text-sm font-bold tracking-wide text-ink shadow-md shadow-ink/10 ring-2 ring-cream-soft">
        {APP_VERSION}{hud.dev ? " · DEV" : ""}
      </p>
      )}

      {showIntro && (
        <IntroOverlay muted={muted} onMute={toggleMute} onDone={finishIntro} />
      )}

      <div className="turn-phone pointer-events-none absolute inset-0 z-40 hidden place-items-center bg-sky px-8 text-center">
        <div>
          <p className="text-2xl font-bold text-coral">Tip the phone up</p>
          <p className="mt-2 text-base text-ink-soft">Crabby Beach is made for portrait.</p>
        </div>
      </div>
    </div>
    </div>
  );
}

function KitPick<T extends string>({
  label,
  value,
  current,
  locked,
  onPick,
  swatch,
}: {
  label: string;
  value: T;
  current: T;
  locked: boolean;
  onPick: (v: T) => void;
  swatch?: string;
}) {
  const on = value === current && !locked;
  return (
    <button
      type="button"
      disabled={locked}
      onClick={() => onPick(value)}
      className={`relative inline-flex min-h-11 items-center justify-center gap-2 rounded-pill px-3 text-sm font-bold disabled:cursor-not-allowed ${
        on ? "bg-coral text-cream" : locked ? "bg-sand/70 text-ink-soft" : "bg-sand text-ink"
      }`}
      aria-label={locked ? `${label} locked` : label}
    >
      {swatch && <span className={`size-4 rounded-pill ${swatch} ring-2 ring-cream`} />}
      {label}
      {locked && <Lock className="size-3.5 opacity-80" />}
    </button>
  );
}

function LoadoutCard({
  extrasOpen,
  kit,
  onEquip,
  onBack,
}: {
  extrasOpen: boolean;
  kit: ReturnType<typeof loadSettings>;
  onEquip: (patch: Partial<ReturnType<typeof loadSettings>>) => void;
  onBack: () => void;
}) {
  return (
    <div className="menu-sky absolute inset-0 z-30 overflow-y-auto px-4 pt-[max(1.1rem,env(safe-area-inset-top))] pb-[max(1.1rem,env(safe-area-inset-bottom))]">
      <div className="menu-sun" aria-hidden="true" />
      <div className="relative z-10 mx-auto w-full max-w-sm text-center">
        <p className="text-sky-deep text-sm font-semibold tracking-wide uppercase">Your kit</p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight text-coral">Loadout</h2>
        <p className="mt-2 text-sm text-ink-soft">
          {extrasOpen ? "Pick a pen and how Crabby looks." : "Finish 12am to unlock extra pens and looks."}
        </p>

        <p className="mt-4 text-left text-sm font-bold">Pens</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <KitPick
            label="Swipe"
            value={"swipe" as PenId}
            current={kit.pen}
            locked={false}
            onPick={(pen) => onEquip({ pen })}
          />
          <KitPick
            label="Auto fill"
            value={"auto" as PenId}
            current={kit.pen}
            locked={!extrasOpen}
            onPick={(pen) => onEquip({ pen })}
          />
        </div>
        <p className="mt-2 text-left text-xs text-ink-soft">
          Swipe paints the shell. Auto fill paints it when Crabby touches it.
        </p>

        <p className="mt-4 text-left text-sm font-bold">Crabby</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <KitPick
            label="Red"
            value={"red" as CrabColor}
            current={kit.color}
            locked={false}
            onPick={(color) => onEquip({ color })}
            swatch="bg-coral"
          />
          <KitPick
            label="Blue"
            value={"blue" as CrabColor}
            current={kit.color}
            locked={!extrasOpen}
            onPick={(color) => onEquip({ color })}
            swatch="bg-sky-deep"
          />
          <KitPick
            label="Yellow"
            value={"yellow" as CrabColor}
            current={kit.color}
            locked={!extrasOpen}
            onPick={(color) => onEquip({ color })}
            swatch="bg-sand-deep"
          />
        </div>

        <p className="mt-4 text-left text-sm font-bold">Hats</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <KitPick
            label="None"
            value={"none" as CrabHat}
            current={kit.hat}
            locked={false}
            onPick={(hat) => onEquip({ hat })}
          />
          <KitPick
            label="Bow"
            value={"bow" as CrabHat}
            current={kit.hat}
            locked={!extrasOpen}
            onPick={(hat) => onEquip({ hat })}
          />
          <KitPick
            label="Bucket"
            value={"bucket" as CrabHat}
            current={kit.hat}
            locked={!extrasOpen}
            onPick={(hat) => onEquip({ hat })}
          />
          <KitPick
            label="Sailor"
            value={"sailor" as CrabHat}
            current={kit.hat}
            locked={!extrasOpen}
            onPick={(hat) => onEquip({ hat })}
          />
        </div>

        <button
          type="button"
          onClick={onBack}
          className="mt-5 min-h-14 w-full rounded-pill bg-coral px-6 py-3 text-lg font-bold text-cream"
        >
          Back to hours
        </button>
      </div>
    </div>
  );
}

function IntroOverlay({
  muted,
  onMute,
  onDone,
}: {
  muted: boolean;
  onMute: () => void;
  onDone: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [caption, setCaption] = useState("Hi! I'm Crabby!");

  useEffect(() => {
    const v = ref.current;
    if (v) v.muted = muted;
  }, [muted]);

  function captionAt(t: number) {
    if (t < 2.4) return "Hiii! I'm Crabby!";
    if (t < 4.8) return "Tap a white shell!";
    if (t < 7.6) return "Whoooosh! I will walk over!";
    if (t < 10.4) return "Paint it with your finger!";
    return "Yaaay! Let's play!";
  }

  function start() {
    unlockAudio();
    const v = ref.current;
    if (!v) return;
    v.muted = muted;
    void v.play();
    setPlaying(true);
  }

  return (
    <div className="absolute inset-0 z-50 bg-ink">
      <video
        ref={ref}
        src={assetUrl("game/intro.mp4?v=047")}
        playsInline
        className="h-full w-full object-contain bg-sand"
        onTimeUpdate={(e) => setCaption(captionAt(e.currentTarget.currentTime))}
        onEnded={onDone}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between px-3 pt-[max(0.8rem,env(safe-area-inset-top))]">
        <p className="rounded-pill bg-cream px-3 py-1 text-sm font-bold text-ink shadow-md">{APP_VERSION}</p>
        <button
          type="button"
          onClick={onMute}
          className="pointer-events-auto grid size-12 place-items-center rounded-pill bg-cream text-ink shadow-md"
          aria-label={muted ? "Unmute sounds" : "Mute sounds"}
        >
          {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
        </button>
      </div>
      {!playing && (
        <button
          type="button"
          onClick={start}
          className="absolute inset-0 z-10 grid place-items-center bg-ink/25"
          aria-label="Play intro"
        >
          <span className="rounded-pill bg-coral px-8 py-4 text-xl font-bold text-cream shadow-lg">
            Tap to meet Crabby
          </span>
        </button>
      )}
      {playing && (
        <p className="pointer-events-none absolute inset-x-3 bottom-28 z-10 rounded-pill bg-cream px-4 py-3 text-center text-xl font-bold leading-snug text-ink shadow-md">
          {caption}
        </p>
      )}
      <button
        type="button"
        onClick={onDone}
        className="absolute inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-20 min-h-12 rounded-pill bg-cream/90 text-sm font-bold text-ink shadow-md"
      >
        Skip
      </button>
    </div>
  );
}

function AuthChip() {
  const { isPending } = useCurrentUserState();
  if (isPending) {
    return <div className="size-11 animate-pulse rounded-pill bg-cream/70" />;
  }
  return (
    <div className="flex items-center rounded-pill bg-cream/90 px-2 py-1 shadow-md shadow-ink/10 ring-2 ring-cream-soft">
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <Link
          to="/login"
          className="grid size-9 place-items-center rounded-pill text-ink-soft hover:text-ink"
          aria-label="Sign in"
        >
          <UserRound className="size-5" />
        </Link>
      </SignedOut>
    </div>
  );
}
```

## scripts/make-crabby-voice.py

```
#!/usr/bin/env python3
"""Bake new Crabby lines in the locked canon voice. Does not overwrite intro."""
from __future__ import annotations

import argparse
import asyncio
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path("/workspace")
CANON = ROOT / "public/voice/crabby/canon.json"
OUT = ROOT / "public/voice/crabby"
LOCKED = {"intro", "intro-raw"}


def load_canon() -> dict:
    return json.loads(CANON.read_text())


async def speak(text: str, dest: Path, spec: dict) -> None:
    import edge_tts

    comm = edge_tts.Communicate(text, spec["voice"], rate=spec["rate"], pitch=spec["pitch"])
    raw = dest.with_name(dest.stem + "-raw" + dest.suffix)
    await comm.save(str(raw))
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(raw),
            "-af",
            spec["ffmpeg"],
            str(dest),
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


async def main() -> int:
    parser = argparse.ArgumentParser(description="Bake Crabby canon voice lines")
    parser.add_argument("name", help="clip id, e.g. yay")
    parser.add_argument("text", nargs="+", help="words Crabby says")
    args = parser.parse_args()
    if args.name in LOCKED:
        print("refusing to overwrite locked clip:", args.name, file=sys.stderr)
        return 2
    spec = load_canon()
    OUT.mkdir(parents=True, exist_ok=True)
    dest = OUT / f"{args.name}.mp3"
    text = " ".join(args.text)
    await speak(text, dest, spec)
    spec.setdefault("lines", {})[args.name] = text
    CANON.write_text(json.dumps(spec, indent=2) + "\n")
    print("wrote", dest)
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
```

## scripts/render-crabby.py

```
#!/usr/bin/env python3
"""Top-down red Crabby with a paintbrush per color. Transparent PNGs."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

OUT = Path("/workspace/public/game/crabby")
SIZE = 256
PAINTS = [
    ("red", (255, 59, 85)),
    ("orange", (255, 138, 18)),
    ("yellow", (255, 225, 74)),
    ("green", (46, 232, 106)),
    ("blue", (46, 200, 255)),
    ("purple", (196, 77, 255)),
    ("pink", (255, 94, 200)),
]


def lerp(a, b, t):
    return a + (b - a) * t


def draw_crab(bristle: tuple[int, int, int], walk: int, bob: float) -> Image.Image:
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx, cy = 128, 142
    cy += int(bob * 4)
    tilt = 0
    if walk:
        tilt = [-7, 5, -6, 8][walk - 1]
        cy += [2, -3, 2, -2][walk - 1]

    def rot(px, py, deg=tilt):
        import math

        r = math.radians(deg)
        x, y = px - cx, py - cy
        return (
            cx + x * math.cos(r) - y * math.sin(r),
            cy + x * math.sin(r) + y * math.cos(r),
        )

    def oval(x, y, rx, ry, fill, outline=None):
        pts = rot(x, y)
        d.ellipse(
            [pts[0] - rx, pts[1] - ry, pts[0] + rx, pts[1] + ry],
            fill=fill,
            outline=outline,
        )

    # legs — 3 per side, walk shifts them
    leg_shift = 0
    if walk:
        leg_shift = [-10, 10, -8, 12][walk - 1]
    body_r = (255, 72, 68)
    body_d = (214, 42, 52)
    for side in (-1, 1):
        for i, (dx, dy, rx, ry) in enumerate(
            [(58, 8, 18, 10), (62, 28, 17, 9), (52, 48, 16, 9)]
        ):
            ox = side * (dx + (leg_shift if (i + walk) % 2 else -leg_shift * 0.4))
            oval(cx + ox, cy + dy, rx, ry, body_d)
            oval(cx + ox * 0.92, cy + dy - 2, rx * 0.7, ry * 0.7, body_r)

    # left claw
    oval(cx - 70, cy - 8, 22, 16, body_d)
    oval(cx - 78, cy - 22, 14, 11, body_r)
    oval(cx - 62, cy - 24, 13, 10, body_r)

    # body
    oval(cx, cy, 58, 46, body_d)
    oval(cx, cy - 4, 54, 42, body_r)
    oval(cx - 10, cy - 12, 22, 16, (255, 120, 110, 200))

    # belly
    oval(cx, cy + 10, 28, 18, (255, 168, 140))

    # eyes
    oval(cx - 18, cy - 38, 18, 20, (255, 72, 68))
    oval(cx + 18, cy - 38, 18, 20, (255, 72, 68))
    oval(cx - 18, cy - 40, 14, 15, (255, 255, 255))
    oval(cx + 18, cy - 40, 14, 15, (255, 255, 255))
    oval(cx - 16, cy - 38, 6, 7, (40, 28, 24))
    oval(cx + 20, cy - 38, 6, 7, (40, 28, 24))
    oval(cx - 14, cy - 40, 2, 2, (255, 255, 255))
    oval(cx + 22, cy - 40, 2, 2, (255, 255, 255))

    # smile
    p0 = rot(cx - 12, cy - 6)
    p1 = rot(cx + 12, cy - 6)
    pm = rot(cx, cy + 4)
    d.arc(
        [pm[0] - 14, pm[1] - 10, pm[0] + 14, pm[1] + 8],
        start=20,
        end=160,
        fill=(90, 30, 40),
        width=3,
    )

    # right claw holding brush
    claw_x, claw_y = cx + 62, cy - 18
    oval(claw_x, claw_y + 10, 20, 14, body_d)
    oval(claw_x + 8, claw_y - 4, 13, 10, body_r)
    oval(claw_x - 6, claw_y - 6, 12, 10, body_r)

    # brush — handle behind/through claw, bristles up
    hx, hy = claw_x + 6, claw_y - 8
    tip = rot(hx + 8, hy - 58)
    ferr = rot(hx + 2, hy - 22)
    butt = rot(hx - 6, hy + 18)
    # handle
    d.line([butt, ferr], fill=(122, 64, 32), width=9)
    d.line([butt, ferr], fill=(196, 122, 58), width=5)
    # ferrule
    d.ellipse([ferr[0] - 8, ferr[1] - 6, ferr[0] + 8, ferr[1] + 6], fill=(232, 220, 196))
    d.ellipse([ferr[0] - 8, ferr[1] - 6, ferr[0] + 8, ferr[1] + 6], outline=(180, 168, 140))
    # bristles
    for ox, oy in ((-7, -8), (-3, -14), (0, -16), (3, -14), (7, -8)):
        end = rot(hx + 8 + ox, hy - 58 + oy)
        d.line([ferr, end], fill=bristle + (255,), width=4)
    d.ellipse([tip[0] - 10, tip[1] - 8, tip[0] + 10, tip[1] + 10], fill=bristle + (255,))

    return img.filter(ImageFilter.SMOOTH)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    cells = []
    for name, rgb in PAINTS:
        idle0 = draw_crab(rgb, 0, 0)
        idle1 = draw_crab(rgb, 0, 1)
        idle0.save(OUT / f"idle-{name}-0.png")
        idle1.save(OUT / f"idle-{name}-1.png")
        cells.append(idle0)
        for w in range(1, 5):
            draw_crab(rgb, w, 0).save(OUT / f"walk-{name}-{w}.png")
        print("wrote", name)

    # preview strip
    sheet = Image.new("RGBA", (SIZE * 7, SIZE), (0, 0, 0, 0))
    for i, cell in enumerate(cells):
        sheet.paste(cell, (i * SIZE, 0), cell)
    sheet.save(OUT / "sheet-idle.png")
    print("sheet", OUT / "sheet-idle.png")


if __name__ == "__main__":
    main()
```

## scripts/render-shells.py

```
#!/usr/bin/env python3
"""Bold, readable cartoon shells — cream with dark ridges, hard alpha."""
from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

OUT = Path("/workspace/public/game")
SIZE = 256
CX = CY = SIZE / 2
CREAM = (255, 214, 150, 255)
CREAM_LT = (255, 236, 190, 255)
RIDGE = (166, 96, 42, 255)
EDGE = (110, 58, 28, 255)
BELLY = (255, 244, 214, 255)


def new() -> tuple[Image.Image, ImageDraw.ImageDraw]:
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    return img, ImageDraw.Draw(img, "RGBA")


def flatten(img: Image.Image) -> Image.Image:
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            px[x, y] = (r, g, b, 255) if a > 40 else (0, 0, 0, 0)
    return img


def scallop() -> Image.Image:
    img, d = new()
    fans = 9
    spread = math.radians(170)
    start = math.radians(-85)
    hinge = (CX, CY + 52)
    for i in range(fans):
        a0 = start + spread * i / fans
        a1 = start + spread * (i + 1) / fans
        am = (a0 + a1) / 2
        r = 112
        fill = CREAM_LT if i % 2 == 0 else CREAM
        pts = [hinge]
        for s in range(12):
            a = a0 + (a1 - a0) * s / 11
            bump = math.sin(s / 11 * math.pi) * 14
            pts.append((CX + math.sin(a) * (r + bump), CY + 4 - math.cos(a) * (r + bump)))
        d.polygon(pts, fill=fill, outline=EDGE)
        d.line(
            [hinge, (CX + math.sin(am) * r, CY + 4 - math.cos(am) * r)],
            fill=RIDGE,
            width=4,
        )
    d.ellipse([CX - 34, CY + 32, CX + 34, CY + 78], fill=BELLY, outline=EDGE, width=4)
    return flatten(img.filter(ImageFilter.SMOOTH))


def conch() -> Image.Image:
    img, d = new()
    d.ellipse([CX - 78, CY - 96, CX + 70, CY + 100], fill=CREAM, outline=EDGE, width=5)
    d.ellipse([CX - 62, CY - 80, CX + 52, CY + 78], fill=CREAM_LT)
    pts = []
    for i in range(48):
        a = i / 48 * math.pi * 2.8 + 0.5
        rad = 70 - i * 1.15
        pts.append((CX + math.cos(a) * rad * 0.72 - 2, CY + math.sin(a) * rad - 4))
    d.line(pts, fill=RIDGE, width=5)
    d.polygon(
        [(CX + 40, CY + 78), (CX + 96, CY + 108), (CX + 48, CY + 100)],
        fill=CREAM,
        outline=EDGE,
    )
    d.ellipse([CX - 28, CY - 36, CX + 8, CY + 8], fill=BELLY, outline=RIDGE, width=3)
    return flatten(img.filter(ImageFilter.SMOOTH))


def clam() -> Image.Image:
    img, d = new()
    d.ellipse([CX - 108, CY - 70, CX + 108, CY + 78], fill=CREAM, outline=EDGE, width=5)
    d.ellipse([CX - 96, CY - 58, CX + 96, CY + 62], fill=CREAM_LT)
    for i in range(6):
        t = (i + 1) / 7
        rx, ry = 96 * (1 - t * 0.14), 58 * (1 - t * 0.2)
        d.ellipse(
            [CX - rx, CY - ry + 8, CX + rx, CY + ry + 8],
            outline=RIDGE,
            width=3,
        )
    d.arc([CX - 48, CY - 6, CX + 48, CY + 36], 200, 340, fill=EDGE, width=4)
    return flatten(img.filter(ImageFilter.SMOOTH))


def cowrie() -> Image.Image:
    img, d = new()
    d.ellipse([CX - 58, CY - 108, CX + 58, CY + 108], fill=CREAM, outline=EDGE, width=5)
    d.ellipse([CX - 46, CY - 96, CX + 46, CY + 96], fill=CREAM_LT)
    d.rounded_rectangle([CX - 10, CY - 70, CX + 10, CY + 70], radius=8, fill=BELLY, outline=EDGE, width=3)
    for y in range(-60, 64, 16):
        d.line([(CX - 7, CY + y), (CX + 7, CY + y)], fill=RIDGE, width=3)
    return flatten(img.filter(ImageFilter.SMOOTH))


def main() -> None:
    for i, fn in enumerate([scallop, conch, clam, cowrie], 1):
        path = OUT / f"shell-white-{i}.png"
        fn().save(path)
        print("wrote", path)


if __name__ == "__main__":
    main()
```

## src/routes/__root.tsx

```ts
import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { registerOffline } from "@/lib/offline";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import appCss from "../styles.css?url";
import { useEffect } from "react";

const APP_NAME = "Crabby Beach";
const host = import.meta.env.VITE_PUBLIC_HOSTNAME;
const ogImage = host ? `https://${host}/og.jpg` : undefined;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: APP_NAME },
      { name: "description", content: "A sunny beach for little hands. Tap a white shell and Crabby walks over to paint it green." },
      { name: "apple-mobile-web-app-title", content: APP_NAME },
      { name: "theme-color", content: "#7EC8E3" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "x:game" },
      { property: "og:title", content: APP_NAME },
      {
        property: "og:description",
        content: "Tap the white shells. Crabby walks over and turns them happy green.",
      },
      ...(ogImage
        ? [
            { property: "og:image", content: ogImage },
            { property: "og:image:width", content: "1200" },
            { property: "og:image:height", content: "630" },
          ]
        : []),
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/icon-192.png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
    ],
  }),
  component: () => {
    useEffect(() => {
      registerOffline();
    }, []);
    return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
    );
  },
});
```

## src/routes/index.tsx

```ts
import { createFileRoute } from "@tanstack/react-router";
import { GameCanvas } from "@/game/GameCanvas";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main className="h-dvh overflow-hidden bg-sky">
      <GameCanvas />
    </main>
  );
}
```

## src/routes/grownups.tsx

```ts
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, FileText, FolderArchive, Package, Smartphone } from "lucide-react";
import {
  loadSettings,
  saveSettings,
  type CrabColor,
  type CrabHat,
  type GrownupSettings,
  type TimerMinutes,
} from "@/lib/settings";
import { loadProgress, saveCleared, saveProgress } from "@/lib/progress";
import { APP_NAME, APP_VERSION, DOWNLOADS } from "@/lib/version";

export const Route = createFileRoute("/grownups")({ component: Grownups });

type Pack = {
  title: string;
  blurb: string;
  filename: string;
  ready: boolean;
  icon: typeof FileText;
  note?: string;
};

const PACKS: Pack[] = [
  {
    title: "Code only",
    blurb: "One Markdown file with the source for reading, searching, and review. Not playable.",
    filename: DOWNLOADS.codeOnly,
    ready: true,
    icon: FileText,
  },
  {
    title: "Code + assets",
    blurb: "Full project tree, including art and config, for an offline rebuild.",
    filename: DOWNLOADS.codebase,
    ready: false,
    icon: FolderArchive,
    note: "Ask me to export this zip when you want it.",
  },
  {
    title: "Portable app",
    blurb: "Playable offline snapshot. Unzip and open index.html — no install, no network.",
    filename: DOWNLOADS.portable,
    ready: false,
    icon: Package,
    note: "Ask me to export this zip when you want it.",
  },
  {
    title: "Android project",
    blurb: "Android Studio project with the game inside, if you want to rebuild.",
    filename: DOWNLOADS.android,
    ready: false,
    icon: Smartphone,
    note: "Ask me to export this zip when you want it.",
  },
  {
    title: "Android APK",
    blurb: "Installable APK for this version. Allow unknown sources, then open the file on a phone.",
    filename: DOWNLOADS.apk,
    ready: false,
    icon: Smartphone,
    note: "Ask me to export the APK when you want it.",
  },
];

function Choice<T extends string | number>({
  label,
  value,
  current,
  onPick,
  swatch,
}: {
  label: string;
  value: T;
  current: T;
  onPick: (v: T) => void;
  swatch?: string;
}) {
  const on = value === current;
  return (
    <button
      type="button"
      onClick={() => onPick(value)}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-pill px-4 text-sm font-bold ${
        on ? "bg-coral text-cream" : "bg-sand text-ink"
      }`}
    >
      {swatch && <span className={`size-4 rounded-pill ${swatch} ring-2 ring-cream`} />}
      {label}
    </button>
  );
}

export function Grownups() {
  const [settings, setSettings] = useState<GrownupSettings>(() => loadSettings());
  const [progress, setProgress] = useState(() => loadProgress());

  function update(patch: Partial<GrownupSettings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
  }

  function updateProgress(patch: Partial<typeof progress>) {
    const next = { ...progress, ...patch };
    setProgress(next);
    saveProgress(next);
  }

  return (
    <main className="min-h-dvh bg-sand text-ink">
      <div className="mx-auto max-w-md px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-5">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center gap-2 rounded-pill bg-cream px-4 text-sm font-semibold text-ink shadow-md shadow-ink/10"
        >
          <ArrowLeft className="size-4" />
          Back to the beach
        </Link>

        <header className="mt-8">
          <p className="text-sky-deep text-sm font-semibold tracking-wide uppercase">Grown-ups</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{APP_NAME}</h1>
          <p className="mt-2 text-ink-soft">
            Pick how Crabby looks and how play feels. Extra pens and skins unlock in Loadout after 12am.
          </p>
          <p className="mt-3 inline-flex rounded-pill bg-cream px-3 py-1 text-sm font-semibold">
            Current version {APP_VERSION}
          </p>
        </header>

        <section className="mt-8" aria-labelledby="looks-heading">
          <h2 id="looks-heading" className="text-xl font-bold">
            Crabby’s look
          </h2>
          <p className="mt-1 text-sm text-ink-soft">Saved on this device. Kids just play.</p>
          <p className="mt-4 text-sm font-semibold">Color</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Choice
              label="Red"
              value={"red" as CrabColor}
              current={settings.color}
              onPick={(color) => update({ color })}
              swatch="bg-coral"
            />
            <Choice
              label="Blue"
              value={"blue" as CrabColor}
              current={settings.color}
              onPick={(color) => update({ color })}
              swatch="bg-sky-deep"
            />
            <Choice
              label="Yellow"
              value={"yellow" as CrabColor}
              current={settings.color}
              onPick={(color) => update({ color })}
              swatch="bg-sand-deep"
            />
          </div>
          <p className="mt-4 text-sm font-semibold">Hat</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Choice label="None" value={"none" as CrabHat} current={settings.hat} onPick={(hat) => update({ hat })} />
            <Choice label="Bow" value={"bow" as CrabHat} current={settings.hat} onPick={(hat) => update({ hat })} />
            <Choice
              label="Bucket"
              value={"bucket" as CrabHat}
              current={settings.hat}
              onPick={(hat) => update({ hat })}
            />
            <Choice
              label="Sailor"
              value={"sailor" as CrabHat}
              current={settings.hat}
              onPick={(hat) => update({ hat })}
            />
          </div>
        </section>

        <section className="mt-8" aria-labelledby="play-heading">
          <h2 id="play-heading" className="text-xl font-bold">
            Play
          </h2>
          <p className="mt-1 text-sm text-ink-soft">How many to find follows the clock: 3 at 1pm, up to 10 at night.</p>
          <p className="mt-4 text-sm font-semibold">Voice counts</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Choice
              label="On"
              value={"on"}
              current={settings.voiceCounts ? "on" : "off"}
              onPick={() => update({ voiceCounts: true })}
            />
            <Choice
              label="Off"
              value={"off"}
              current={settings.voiceCounts ? "on" : "off"}
              onPick={() => update({ voiceCounts: false })}
            />
          </div>
          <p className="mt-4 text-sm font-semibold">Ocean music</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Choice
              label="On"
              value={"on"}
              current={settings.music ? "on" : "off"}
              onPick={() => update({ music: true })}
            />
            <Choice
              label="Off"
              value={"off"}
              current={settings.music ? "on" : "off"}
              onPick={() => update({ music: false })}
            />
          </div>
          <p className="mt-4 text-sm font-semibold">Play timer</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {([
              [0, "Off"],
              [3, "3 min"],
              [5, "5 min"],
              [10, "10 min"],
            ] as Array<[TimerMinutes, string]>).map(([mins, label]) => (
              <Choice
                key={mins}
                label={label}
                value={mins}
                current={settings.timerMinutes}
                onPick={(timerMinutes) => update({ timerMinutes })}
              />
            ))}
          </div>
        </section>

        <section className="mt-8" aria-labelledby="dev-heading">
          <h2 id="dev-heading" className="text-xl font-bold">
            Dev
          </h2>
          <p className="mt-1 text-sm text-ink-soft">For trying pens, skins, and later hours without replaying the day.</p>
          <p className="mt-4 text-sm font-semibold">Dev mode</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Choice
              label="Off"
              value={"off"}
              current={progress.dev ? "on" : "off"}
              onPick={() => updateProgress({ dev: false })}
            />
            <Choice
              label="On"
              value={"on"}
              current={progress.dev ? "on" : "off"}
              onPick={() => updateProgress({ dev: true })}
            />
          </div>
          <p className="mt-4 text-sm font-semibold">Progress</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                saveCleared(9);
                setProgress(loadProgress());
              }}
              className="inline-flex min-h-11 items-center justify-center rounded-pill bg-sand px-4 text-sm font-bold text-ink"
            >
              Finish the day
            </button>
            <button
              type="button"
              onClick={() => {
                saveProgress({ cleared: 0, dev: progress.dev });
                setProgress(loadProgress());
              }}
              className="inline-flex min-h-11 items-center justify-center rounded-pill bg-sand px-4 text-sm font-bold text-ink"
            >
              Reset hours
            </button>
          </div>
          <p className="mt-2 text-xs text-ink-soft">Cleared {progress.cleared} / 9. Dev on unlocks every hour and the whole loadout.</p>
        </section>

        <section className="mt-10" aria-labelledby="downloads-heading">
          <h2 id="downloads-heading" className="text-xl font-bold">
            Downloads
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Ready files save to your device. Right-click still works. These packages
            are a point-in-time snapshot. Play does not need the network.
          </p>
          <ul className="mt-4 grid gap-3">
            {PACKS.map((pack) => (
              <li key={pack.filename} className="rounded-card bg-cream p-4 shadow-md shadow-ink/10 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-pill bg-sand">
                    <pack.icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{pack.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">{pack.blurb}</p>
                    <p className="mt-2 truncate font-mono text-xs text-ink-soft">{pack.filename}</p>
                    {pack.ready ? (
                      <a
                        href={`/downloads/${pack.filename}`}
                        download={pack.filename}
                        className="mt-3 inline-flex min-h-11 items-center rounded-pill bg-coral px-4 text-sm font-bold text-cream hover:bg-coral-deep"
                      >
                        Download
                      </a>
                    ) : (
                      <p className="mt-3 text-sm font-semibold text-ink-soft">{pack.note}</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
```
