# Crabby Beach v.008 — code only

Reading / search / archive package. **Not runnable.** No art, audio files, or voice assets.

## Table of contents

- [VERSION](#version)
- [export-naming.md](#export-naming-md)
- [package.json](#package-json)
- [tsconfig.json](#tsconfig-json)
- [vite.config.ts](#vite-config-ts)
- [startup.sh](#startup-sh)
- [src/lib/settings.ts](#src-lib-settings-ts)
- [src/lib/version.ts](#src-lib-version-ts)
- [src/router.tsx](#src-router-tsx)
- [src/styles.css](#src-styles-css)
- [src/game/audio.ts](#src-game-audio-ts)
- [src/game/engine.ts](#src-game-engine-ts)
- [src/game/GameCanvas.tsx](#src-game-gamecanvas-tsx)
- [src/routes/__root.tsx](#src-routes-__root-tsx)
- [src/routes/index.tsx](#src-routes-index-tsx)
- [src/routes/grownups.tsx](#src-routes-grownups-tsx)

## VERSION

```
Crabby Beach v.008
```

## export-naming.md

```md
# export-naming.md — v.009

Current product version: **v.008** (Crabby Beach)

## How filenames work

Every downloadable package carries the current product version in the file name
so you can tell which version a file is just by looking at it.

| Package | Filename | What it is |
| --- | --- | --- |
| Code only | `crabby-beach-v.008-code.md` | One Markdown document: table of contents + essential source in fenced code blocks. For read / search / share / archive. **Not runnable.** No voice, no art assets. |
| Code + assets (full) | `crabby-beach-v.008-codebase.zip` | Complete project tree, including data, generated assets, and config, for offline rebuild. |
| Portable app | `crabby-beach-v.008-portable.zip` | Playable, offline-ready. Unzip and open. |
| Android project | `crabby-beach-v.008-android.zip` | Android project + build readme. A signed `.apk` needs a local Android SDK — we do not ship a fake APK. |

Older files keep their names (`v.001` stays `v.001`). New exports use the current number.

## Rules

1. Version number in every filename.
2. Code-only (`.md`) is a documentation / reading package only. Never the playable app.
3. Codebase and portable links must download the file. They never open or run the app in a new window.
4. Downloads are real `<a href>` links with a `download` attribute (right-click and new-tab still save).
5. Downloads live on the Grown-ups page, not on the toddler home screen.
6. Zip / APK packages are built only when explicitly requested. The code-only Markdown is refreshed on every product update.
7. No runtime network is required to play. The downloadable snapshot does not auto-update.

## Version numbers

- Product versions increment `v.001`, `v.002`, `v.003`, …
- This naming document started at `v.001` and is now **v.009**.
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

## src/lib/settings.ts

```ts
export type CrabColor = "red" | "blue" | "yellow";
export type CrabHat = "none" | "bow" | "bucket" | "sailor";
export type FindCount = 3 | 6 | 9;
export type TimerMinutes = 0 | 3 | 5 | 10;
export type BeachTheme = "sunny" | "sunset";

export type GrownupSettings = {
  color: CrabColor;
  hat: CrabHat;
  findCount: FindCount;
  voiceCounts: boolean;
  music: boolean;
  timerMinutes: TimerMinutes;
};

const KEY = "crabby-beach-settings-v1";

export const DEFAULT_SETTINGS: GrownupSettings = {
  color: "red",
  hat: "none",
  findCount: 6,
  voiceCounts: true,
  music: true,
  timerMinutes: 0,
};

function isColor(v: unknown): v is CrabColor {
  return v === "red" || v === "blue" || v === "yellow";
}
function isHat(v: unknown): v is CrabHat {
  return v === "none" || v === "bow" || v === "bucket" || v === "sailor";
}
function isCount(v: unknown): v is FindCount {
  return v === 3 || v === 6 || v === 9;
}
function isTimer(v: unknown): v is TimerMinutes {
  return v === 0 || v === 3 || v === 5 || v === 10;
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
      findCount: isCount(parsed.findCount) ? parsed.findCount : DEFAULT_SETTINGS.findCount,
      voiceCounts: typeof parsed.voiceCounts === "boolean" ? parsed.voiceCounts : true,
      music: typeof parsed.music === "boolean" ? parsed.music : true,
      timerMinutes: isTimer(parsed.timerMinutes) ? parsed.timerMinutes : 0,
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

## src/lib/version.ts

```ts
export const APP_NAME = "Crabby Beach";
export const APP_SLUG = "crabby-beach";
export const APP_VERSION = "v.008";

export const DOWNLOADS = {
  codeOnly: `${APP_SLUG}-${APP_VERSION}-code.md`,
  codebase: `${APP_SLUG}-${APP_VERSION}-codebase.zip`,
  portable: `${APP_SLUG}-${APP_VERSION}-portable.zip`,
  android: `${APP_SLUG}-${APP_VERSION}-android.zip`,
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
  one: "/voice/one.mp3",
  two: "/voice/two.mp3",
  three: "/voice/three.mp3",
  four: "/voice/four.mp3",
  five: "/voice/five.mp3",
  six: "/voice/six.mp3",
  seven: "/voice/seven.mp3",
  eight: "/voice/eight.mp3",
  nine: "/voice/nine.mp3",
  ten: "/voice/ten.mp3",
  "win-sunny": "/voice/win-sunny.mp3",
  "win-sunset": "/voice/win-sunset.mp3",
};

const LINE_TO_CLIP: Record<string, string> = {
  "Yay! You found them all.": "win-sunny",
  "What a glow! Every friend is happy.": "win-sunset",
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
        const res = await fetch(src);
        if (!res.ok) return;
        const raw = await res.arrayBuffer();
        const buf = await audio.decodeAudioData(raw.slice(0));
        voiceBufs.set(key, buf);
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

## src/game/engine.ts

```ts
import type { BeachTheme, CrabColor, CrabHat, GrownupSettings } from "@/lib/settings";
import { DEFAULT_SETTINGS } from "@/lib/settings";
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

export type GamePhase = "loading" | "ready" | "playing" | "won" | "timesup";

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
};

export type GameApi = {
  start: () => void;
  replay: (opts?: { theme?: BeachTheme; advance?: boolean; restart?: boolean }) => void;
  addTime: (seconds: number) => void;
  destroy: () => void;
};

const MAX_FINDS = 10;
const EXTRA_LEVELS = 4;

const WORLD_W = 1600;
const WORLD_H = 900;
const WATER_MAX = 220;
const SAND_TOP = 270;
const SAND_BOT = 840;
const SAND_LEFT = 130;
const SAND_RIGHT = 1470;
const CRAB_SPEED = 300;
const HIT = 72;
const CRAB_SIZE = 92;
const FIND_SIZE = 56;
const CAN_HIT = 56;
const WATER_WALK = 118;

type PaintId = "red" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink";

const PAINTS: Array<{ id: PaintId; hex: string }> = [
  { id: "red", hex: "#e85d4c" },
  { id: "orange", hex: "#f08a3a" },
  { id: "yellow", hex: "#ffe27a" },
  { id: "green", hex: "#5dbb63" },
  { id: "blue", hex: "#4ea8c9" },
  { id: "purple", hex: "#9b6dca" },
  { id: "pink", hex: "#f4a4c8" },
];

function paintHex(id: PaintId) {
  return PAINTS.find((p) => p.id === id)?.hex ?? "#5dbb63";
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
  const [beach, ...rest] = await Promise.all([
    loadImage("/game/beach.jpg?v=v003"),
    ...[1, 2, 3, 4].map((i) => loadImage(`/game/crab-walk-${i}.png?v=topdown2`)),
    ...[1, 2, 3, 4].map((i) => loadImage(`/game/crab-idle-${i}.png?v=topdown2`)),
    ...[1, 2, 3, 4].map((i) => loadImage(`/game/shell-white-${i}.png?v=topdown2`)),
    ...[1, 2, 3, 4].map((i) => loadImage(`/game/shell-green-${i}.png?v=v003`)),
    loadImage("/game/prop-starfish.png?v=topdown2"),
    loadImage("/game/prop-bucket.png?v=topdown2"),
    loadImage("/game/prop-pebble.png?v=topdown2"),
  ]);
  return {
    beach,
    walk: rest.slice(0, 4),
    idle: rest.slice(4, 8),
    white: rest.slice(8, 12),
    green: rest.slice(12, 16),
    starfish: rest[16] as HTMLImageElement,
    bucket: rest[17] as HTMLImageElement,
    pebble: rest[18] as HTMLImageElement,
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
  let hermit: { x: number; y: number; life: number } | null = null;
  let lastTick = -1;
  let pendingWin = false;
  let level = 1;
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
    return Math.max(92, Math.min(112, css.h * 0.15));
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
    return 1 + Math.min(EXTRA_LEVELS, MAX_FINDS - settings.findCount);
  }

  function findsForLevel() {
    return Math.min(MAX_FINDS, settings.findCount + (level - 1));
  }

  function paintedCount() {
    return finds.filter((f) => f.painted).length;
  }

  function secondsLeft() {
    if (!settings.timerMinutes || phase !== "playing") return null;
    const limit = settings.timerMinutes * 60 + extraTime;
    return Math.max(0, Math.ceil(limit - playElapsed));
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
    const cols = n <= 3 ? n : n >= 10 ? 5 : n >= 8 ? 4 : 3;
    const rows = Math.ceil(n / cols);
    const spots: Vec[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (spots.length >= n) break;
        const jitterX = (Math.random() - 0.5) * 40;
        const jitterY = (Math.random() - 0.5) * 30;
        spots.push({
          x: bounds.x0 + ((c + 0.5) / cols) * (bounds.x1 - bounds.x0) + jitterX,
          y: bounds.y0 + ((r + 0.5) / rows) * (bounds.y1 - bounds.y0) + jitterY,
        });
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
    }));
  }

  function placeCans() {
    const x0 = -view.x / view.scale + 70;
    const x1 = (css.w - view.x) / view.scale - 70;
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
    theme = nextTheme;
    const vis = sandView();
    finds = placeFinds(vis);
    placeCans();
    particles = [];
    hermit = null;
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
      hermit = { x: item.x, y: item.y - 8, life: 2.4 };
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

  function goTo(world: Vec, id: number | null, canId: PaintId | null = null) {
    const dest = clampToPlay(world, canId != null || world.y < SAND_TOP);
    crab.target = dest;
    crab.targetId = id;
    crab.targetCan = canId;
    crab.state = "walk";
    if (Math.abs(dest.x - crab.x) > 4) crab.facing = dest.x >= crab.x ? 1 : -1;
  }

  function handlePointer(ev: PointerEvent) {
    if (phase === "loading" || phase === "won" || phase === "timesup") return;
    if (phase === "ready") {
      unlockAudio();
      refreshSettings();
      phase = "playing";
      emitHud();
    }

    playTap();
    const rect = canvas.getBoundingClientRect();
    if (ev.clientY - rect.top > css.h - bannerH()) return;
    const world = worldFromEvent(ev);

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

    let best: Find | null = null;
    let bestD = HIT;
    for (const item of finds) {
      if (item.painted) continue;
      const d = dist(world, item);
      if (d < bestD) {
        best = item;
        bestD = d;
      }
    }
    if (best) {
      goTo({ x: best.x, y: best.y }, best.id);
      return;
    }
    const vis = sandView();
    if (world.x >= vis.x0 && world.x <= vis.x1 && world.y >= vis.y0 && world.y <= vis.y1) {
      goTo(world, null);
    }
  }

  function updateHover(ev: PointerEvent) {
    if (phase !== "playing" && phase !== "ready") {
      canvas.style.cursor = "default";
      return;
    }
    const world = worldFromEvent(ev);
    const overCan = cans.some((c) => dist(world, c) < CAN_HIT);
    const over = overCan || finds.some((s) => !s.painted && dist(world, s) < HIT);
    canvas.style.cursor = over ? "pointer" : "default";
  }

  function update(dt: number) {
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
    }

    for (const item of finds) {
      if (item.pop < 1) item.pop = Math.min(1, item.pop + dt * 3.4);
      if (item.painted && item.fly < 1) item.fly = Math.min(1, item.fly + dt * 1.25);
    }
    if (pendingWin && finds.every((f) => f.fly >= 1)) {
      pendingWin = false;
      phase = "won";
      spawnConfetti();
      playWin();
      if (settings.voiceCounts) {
        speak(theme === "sunset" ? "What a glow! Every friend is happy." : "Yay! You found them all.");
      }
      emitHud();
    }

    if (hermit) {
      hermit.life -= dt;
      if (hermit.life <= 0) hermit = null;
    }

    crab.wave = Math.max(0, crab.wave - dt);
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
          if (item) paintFind(item);
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
    if (hex === "#5dbb63") return src;
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
    x.drawImage(src, 0, 0);
    x.globalCompositeOperation = "source-atop";
    x.fillStyle = hex;
    x.globalAlpha = 0.72;
    x.fillRect(0, 0, c.width, c.height);
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

  function drawBrush(x: number, y: number, facing: 1 | -1, hex: string, rot: number) {
    ctx.save();
    ctx.translate(x + facing * 30, y + 6);
    ctx.rotate(rot + (facing < 0 ? -0.55 : 0.55));
    ctx.fillStyle = "#c47a3a";
    ctx.fillRect(-3, -22, 6, 20);
    ctx.fillStyle = "#fff6e8";
    ctx.fillRect(-6, -4, 12, 7);
    ctx.fillStyle = hex;
    ctx.beginPath();
    ctx.moveTo(-7, 3);
    ctx.lineTo(7, 3);
    ctx.lineTo(5, 14);
    ctx.lineTo(-5, 14);
    ctx.closePath();
    ctx.fill();
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

  function drawSandDollar(x: number, y: number, s: number, happy: boolean, hex = "#5dbb63") {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = happy ? hex : "#fff4dc";
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

  function drawSnail(x: number, y: number, s: number, happy: boolean, hex = "#5dbb63") {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = happy ? hex : "#f0c98a";
    ctx.beginPath();
    ctx.ellipse(s * 0.16, s * 0.16, s * 0.28, s * 0.16, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = happy ? hex : "#e8a060";
    ctx.beginPath();
    ctx.arc(-s * 0.06, -s * 0.04, s * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = happy ? "#3f9a46" : "#c47a3a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-s * 0.06, -s * 0.04, s * 0.16, 0.4, Math.PI * 2.2);
    ctx.stroke();
    ctx.fillStyle = "#3a2a22";
    ctx.beginPath();
    ctx.arc(s * 0.28, s * 0.08, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawHermit(x: number, y: number, life: number) {
    const peek = Math.sin((1 - Math.min(1, life / 2.4)) * Math.PI) * 14;
    ctx.save();
    ctx.translate(x, y - peek);
    ctx.fillStyle = "#e8a060";
    ctx.beginPath();
    ctx.ellipse(0, 8, 16, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e85d4c";
    ctx.beginPath();
    ctx.arc(-8, -2, 6, 0, Math.PI * 2);
    ctx.arc(8, -2, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff6e8";
    ctx.beginPath();
    ctx.arc(-8, -3, 2.6, 0, Math.PI * 2);
    ctx.arc(8, -3, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#3a2a22";
    ctx.beginPath();
    ctx.arc(-8, -3, 1.2, 0, Math.PI * 2);
    ctx.arc(8, -3, 1.2, 0, Math.PI * 2);
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
    ctx.save();
    for (let i = 0; i < 5; i++) {
      const y = 36 + i * 28 + Math.sin(time * 1.2 + i * 0.9) * 5;
      ctx.globalAlpha = 0.12;
      ctx.strokeStyle = "#e8fbff";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= WORLD_W; x += 40) {
        ctx.lineTo(x, y + Math.sin(time * 1.6 + x * 0.012 + i) * 7);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = "#f7fdff";
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

  function drawFindSprite(item: Find, x: number, y: number, s: number, happy: boolean) {
    drawShadow(x, y, s * 0.34, s * 0.13);
    const hex = paintHex(item.color);
    if (item.kind === "shell" && assets) {
      const base = happy ? assets.green[item.variant]! : assets.white[item.variant]!;
      const img = happy ? colorizeSprite(base, hex) : base;
      drawCentered(img, x, y, s, s);
    } else if (item.kind === "starfish" && assets) {
      drawCentered(assets.starfish, x, y, s * 1.05, s * 1.05, false, happy ? 0.2 : 0);
    } else if (item.kind === "sanddollar") {
      drawSandDollar(x, y, s, happy, hex);
    } else {
      drawSnail(x, y, s, happy, hex);
    }
  }

  function drawFind(item: Find) {
    if (item.painted) return;
    const pulse = 1 + Math.sin(time * 2.4 + item.id) * 0.03;
    const n = Math.max(finds.length, 1);
    const base = n >= 10 ? 48 : n >= 8 ? 52 : FIND_SIZE;
    const s = base * pulse;
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
    ctx.fillStyle = theme === "sunset" ? "#e07a4a" : "#5aa9c8";
    ctx.fillRect(0, 0, css.w, css.h);

    ctx.save();
    ctx.translate(view.x, view.y);
    ctx.scale(view.scale, view.scale);

    if (assets) ctx.drawImage(assets.beach, 0, 0, WORLD_W, WORLD_H);
    drawWaterShimmer();
    if (theme === "sunset") {
      ctx.save();
      ctx.globalCompositeOperation = "multiply";
      ctx.globalAlpha = 0.42;
      ctx.fillStyle = "#f4a06a";
      ctx.fillRect(0, 0, WORLD_W, WORLD_H);
      ctx.restore();
    }

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
        layers.push({ y: item.y, z: 1, draw: () => drawFind(item) });
      }

      if (hermit) {
        layers.push({
          y: hermit.y,
          z: 3,
          draw: () => drawHermit(hermit!.x, hermit!.y, hermit!.life),
        });
      }

      const frames = crab.state === "walk" ? assets.walk : assets.idle;
      const raw = frames[crab.frame]!;
      const img = tintImage(raw, settings.color, tintCache);
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
            ctx.fillStyle = settings.color === "blue" ? "#4ea8c9" : settings.color === "yellow" ? "#e8c07a" : "#e85d4c";
            ctx.beginPath();
            ctx.ellipse(crab.x + crab.facing * 8, crab.y - 10, 10, 3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
          drawHat(crab.x, crab.y, CRAB_SIZE, settings.hat, crab.facing < 0);
          drawBrush(crab.x, crab.y, crab.facing, paintHex(crab.paint), waveRot);
        },
      });
    }

    layers.sort((a, b) => a.y - b.y || a.z - b.z);
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
  canvas.addEventListener("pointermove", updateHover);
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
      phase = "ready";
      emitHud();
    })
    .catch((err) => {
      console.error(err);
    });

  return {
    start() {
      unlockAudio();
      refreshSettings();
      if (phase === "ready") {
        phase = "playing";
        emitHud();
      }
    },
    replay(opts?: { theme?: BeachTheme; advance?: boolean; restart?: boolean }) {
      if (opts?.restart) level = 1;
      else if (opts?.advance) level = Math.min(maxLevel(), level + 1);
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
      canvas.removeEventListener("pointermove", updateHover);
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
import { RotateCcw, Timer, UserRound, Volume2, VolumeX } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { loadSettings } from "@/lib/settings";
import { APP_VERSION } from "@/lib/version";
import { isMuted, setMuted, setMusicEnabled, unlockAudio } from "./audio";
import { createGame, type GameApi, type GameHud } from "./engine";

const EMPTY: GameHud = {
  phase: "loading",
  painted: 0,
  total: 6,
  theme: "sunny",
  countPop: null,
  countKey: 0,
  secondsLeft: null,
  level: 1,
  maxLevel: 5,
};

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const apiRef = useRef<GameApi | null>(null);
  const [hud, setHud] = useState<GameHud>(EMPTY);
  const [muted, setMutedUi] = useState(false);
  const [popOn, setPopOn] = useState(false);

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

  function play() {
    unlockAudio();
    setMusicEnabled(loadSettings().music);
    apiRef.current?.start();
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

  return (
    <div className={`relative h-dvh w-full overflow-hidden text-ink ${hud.theme === "sunset" ? "bg-coral" : "bg-sky"}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none select-none"
        aria-label="Crabby walking on the beach"
      />

      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-3 sm:p-4">
        <div className="rounded-pill bg-cream/90 px-4 py-2 shadow-md shadow-ink/10 ring-2 ring-cream-soft">
          <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Beach</p>
          <p className="text-lg leading-none font-bold tabular-nums">
            {hud.level}
            <span className="text-ink-soft"> / {hud.maxLevel}</span>
          </p>
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
            className="grid size-11 place-items-center rounded-pill bg-cream/90 text-ink shadow-md shadow-ink/10 ring-2 ring-cream-soft"
            aria-label={muted ? "Unmute sounds" : "Mute sounds"}
          >
            {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
          </button>
          <AuthChip />
        </div>
      </header>

      {popOn && hud.countPop != null && (
        <div
          key={hud.countKey}
          className="count-pop pointer-events-none absolute top-1/3 left-1/2 z-30 -translate-x-1/2 text-7xl font-bold text-cream drop-shadow-md sm:text-8xl"
        >
          {hud.countPop}
        </div>
      )}

      {hud.phase === "playing" && hud.painted === 0 && (
        <p className="pointer-events-none absolute bottom-28 left-1/2 z-10 w-max max-w-[90%] -translate-x-1/2 rounded-pill bg-cream/90 px-4 py-2 text-center text-sm font-semibold text-ink shadow-md shadow-ink/10 ring-2 ring-cream-soft">
          Tap a paint can or a white shell
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

      {hud.phase === "ready" && (
        <div
          className="absolute inset-0 z-20 grid place-items-end bg-ink/20 p-4 pb-10 sm:place-items-center sm:pb-4"
          onClick={play}
        >
          <div className="w-full max-w-md rounded-card bg-cream px-6 py-7 text-center shadow-xl shadow-ink/20 ring-4 ring-cream-soft sm:px-8">
            <p className="text-sky-deep text-sm font-semibold tracking-wide uppercase">Five little beaches</p>
            <h1 className="mt-1 text-4xl font-bold tracking-tight text-coral sm:text-5xl">Crabby Beach</h1>
            <p className="mt-3 text-base leading-relaxed text-ink-soft">
              Tap a white shell to paint it. Walk to a can in the water to change colors.
            </p>
            <button
              type="button"
              onClick={play}
              className="mt-6 min-h-12 w-full rounded-pill bg-coral px-6 py-3 text-lg font-bold text-cream shadow-md shadow-coral-deep/30 hover:bg-coral-deep"
            >
              Let’s play!
            </button>
            <Link
              to="/grownups"
              onClick={(e) => e.stopPropagation()}
              className="mt-4 inline-block text-xs font-semibold tracking-wide text-ink-soft/70 uppercase hover:text-ink-soft"
            >
              Grown-ups
            </Link>
          </div>
        </div>
      )}

      {hud.phase === "won" && (
        <div className="absolute inset-0 z-20 grid place-items-end bg-ink/25 p-4 pb-10 sm:place-items-center sm:pb-4">
          <div className="w-full max-w-md rounded-card bg-cream px-6 py-7 text-center shadow-xl shadow-ink/20 ring-4 ring-mint sm:px-8">
            <p className="text-mint-deep text-sm font-semibold tracking-wide uppercase">
              {hud.level >= hud.maxLevel ? "Every beach" : `Beach ${hud.level} of ${hud.maxLevel}`}
            </p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-mint-deep sm:text-4xl">
              {hud.level >= hud.maxLevel ? "You found them all!" : "Yay! You found them all"}
            </h2>
            <p className="mt-3 text-base text-ink-soft">
              {hud.level >= hud.maxLevel
                ? "Five beaches, and a full tray. Want to start over?"
                : `Next beach has ${hud.total + 1} finds.`}
            </p>
            <div className="mt-6 grid gap-3">
              {hud.level < hud.maxLevel ? (
                <button
                  type="button"
                  onClick={() => replay({ theme: hud.theme === "sunset" ? "sunny" : "sunset", advance: true })}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill bg-coral px-6 py-3 text-lg font-bold text-cream shadow-md hover:bg-coral-deep"
                >
                  Next beach
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => replay({ theme: "sunny", restart: true })}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill bg-coral px-6 py-3 text-lg font-bold text-cream shadow-md hover:bg-coral-deep"
                >
                  Start over
                </button>
              )}
              <button
                type="button"
                onClick={() => replay({ theme: hud.theme, restart: hud.level >= hud.maxLevel })}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill bg-mint px-6 py-3 text-lg font-bold text-cream shadow-md hover:bg-mint-deep"
              >
                <RotateCcw className="size-5" />
                This beach again
              </button>
            </div>
          </div>
        </div>
      )}

      {hud.phase === "timesup" && (
        <div className="absolute inset-0 z-20 grid place-items-end bg-ink/25 p-4 pb-10 sm:place-items-center sm:pb-4">
          <div className="w-full max-w-md rounded-card bg-cream px-6 py-7 text-center shadow-xl shadow-ink/20 ring-4 ring-cream-soft sm:px-8">
            <p className="text-sky-deep text-sm font-semibold tracking-wide uppercase">All done for now</p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-ink">That was a lovely play</h2>
            <p className="mt-3 text-base text-ink-soft">Need one more minute, or start a new beach?</p>
            <div className="mt-6 grid gap-3">
              <button
                type="button"
                onClick={moreTime}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill bg-coral px-6 py-3 text-lg font-bold text-cream shadow-md hover:bg-coral-deep"
              >
                <Timer className="size-5" />
                One more minute
              </button>
              <button
                type="button"
                onClick={() => replay({ theme: "sunny", restart: true })}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill bg-mint px-6 py-3 text-lg font-bold text-cream shadow-md hover:bg-mint-deep"
              >
                <RotateCcw className="size-5" />
                New beach
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="pointer-events-none absolute top-16 right-3 z-10 text-xs font-semibold tracking-wide text-ink/40 uppercase">
        {APP_VERSION}
      </p>
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

## src/routes/__root.tsx

```ts
import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import appCss from "../styles.css?url";

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
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: () => (
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
  ),
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
  type FindCount,
  type GrownupSettings,
  type TimerMinutes,
} from "@/lib/settings";
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
    blurb: "Playable offline snapshot. Unzip and open — no install, no network.",
    filename: DOWNLOADS.portable,
    ready: false,
    icon: Package,
    note: "Ask me to export this zip when you want it.",
  },
  {
    title: "Android project",
    blurb: "Android project plus a build readme. A signed APK needs a local Android SDK.",
    filename: DOWNLOADS.android,
    ready: false,
    icon: Smartphone,
    note: "No fake APK. Ask me for the android-project zip when you want to build one.",
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

function Grownups() {
  const [settings, setSettings] = useState<GrownupSettings>(() => loadSettings());

  function update(patch: Partial<GrownupSettings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
  }

  return (
    <main className="min-h-dvh bg-sand text-ink">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
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
            Pick how Crabby looks and how play feels. Kids just tap — they never see this page.
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
          <p className="mt-4 text-sm font-semibold">How many to find</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {([3, 6, 9] as FindCount[]).map((n) => (
              <Choice
                key={n}
                label={String(n)}
                value={n}
                current={settings.findCount}
                onPick={(findCount) => update({ findCount })}
              />
            ))}
          </div>
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

        <section className="mt-10" aria-labelledby="downloads-heading">
          <h2 id="downloads-heading" className="text-xl font-bold">
            Downloads
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Ready files save to your device. Right-click still works. Zip packages are built only when you ask.
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
