# Crabby Beach v.001 — code only

Reading / search / archive package. **Not runnable.** No art, audio files, or voice assets.

## Table of contents

- [VERSION](#version)
- [export-naming.md](#export-naming-md)
- [package.json](#package-json)
- [tsconfig.json](#tsconfig-json)
- [vite.config.ts](#vite-config-ts)
- [startup.sh](#startup-sh)
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
Crabby Beach v.001
```

## export-naming.md

```md
# export-naming.md — v.002

Current product version: **v.001** (Crabby Beach)

## How filenames work

Every downloadable package carries the current product version in the file name
so you can tell which version a file is just by looking at it.

| Package | Filename | What it is |
| --- | --- | --- |
| Code only | `crabby-beach-v.001-code.md` | One Markdown document: table of contents + essential source in fenced code blocks. For read / search / share / archive. **Not runnable.** No voice, no art assets. |
| Code + assets (full) | `crabby-beach-v.001-codebase.zip` | Complete project tree, including data, generated assets, and config, for offline rebuild. |
| Portable app | `crabby-beach-v.001-portable.zip` | Playable, offline-ready. Unzip and open. |
| Android project | `crabby-beach-v.001-android.zip` | Android project + build readme. A signed `.apk` needs a local Android SDK — we do not ship a fake APK. |

When the product version becomes `v.002`, every new export uses `v.002` in the
name. Old versioned files keep their identity.

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
- This naming document started at `v.001` and is now **v.002**.
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

## src/lib/version.ts

```ts
export const APP_NAME = "Crabby Beach";
export const APP_SLUG = "crabby-beach";
export const APP_VERSION = "v.001";

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
let ambientStarted = false;
let noiseBuffer: AudioBuffer | null = null;

function ensureGraph() {
  if (ctx) return;
  const AudioCtx = window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  ctx = new AudioCtx({ latencyHint: "interactive" });
  master = ctx.createGain();
  sfxBus = ctx.createGain();
  musicBus = ctx.createGain();
  sfxBus.gain.value = 0.85;
  musicBus.gain.value = 0.18;
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

export function speak(text: string) {
  if (typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth) return;
  try {
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.pitch = 1.1;
    synth.speak(utter);
  } catch {
    // Visual cues on screen are the fallback.
  }
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
import { playScuttle, playSparkle, playTap, playWin, speak, unlockAudio } from "./audio";

export type GamePhase = "loading" | "ready" | "playing" | "won";

export type GameHud = {
  phase: GamePhase;
  painted: number;
  total: number;
};

export type GameApi = {
  start: () => void;
  replay: () => void;
  destroy: () => void;
};

const WORLD_W = 1600;
const WORLD_H = 900;
const WATER_MAX = 220;
const SAND_TOP = 270;
const SAND_BOT = 840;
const SAND_LEFT = 130;
const SAND_RIGHT = 1470;
const SHELL_COUNT = 6;
const CRAB_SPEED = 300;
const SHELL_HIT = 70;
const CRAB_SIZE = 92;
const SHELL_SIZE = 58;

const SHELL_SPOTS: Array<[number, number]> = [
  [420, 360],
  [800, 330],
  [1180, 360],
  [360, 620],
  [800, 700],
  [1240, 620],
];

const DECOR: Array<{ kind: "starfish" | "bucket" | "pebble"; x: number; y: number; w: number; h: number }> = [
  { kind: "starfish", x: 560, y: 500, w: 64, h: 64 },
  { kind: "pebble", x: 1040, y: 480, w: 52, h: 52 },
  { kind: "bucket", x: 1320, y: 760, w: 78, h: 78 },
];

type Vec = { x: number; y: number };

type Shell = {
  id: number;
  x: number;
  y: number;
  variant: number;
  painted: boolean;
  pop: number;
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
  kind: "spark" | "confetti";
  rot: number;
  spin: number;
};

type Crab = {
  x: number;
  y: number;
  facing: 1 | -1;
  state: "idle" | "walk";
  frame: number;
  frameT: number;
  target: Vec | null;
  targetShell: number | null;
};

type Assets = {
  beach: HTMLImageElement;
  walk: HTMLImageElement[];
  idle: HTMLImageElement[];
  white: HTMLImageElement[];
  green: HTMLImageElement[];
  props: Record<"starfish" | "bucket" | "pebble", HTMLImageElement>;
};

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
    loadImage("/game/beach.jpg?v=topdown2"),
    ...[1, 2, 3, 4].map((i) => loadImage(`/game/crab-walk-${i}.png?v=topdown2`)),
    ...[1, 2, 3, 4].map((i) => loadImage(`/game/crab-idle-${i}.png?v=topdown2`)),
    ...[1, 2, 3, 4].map((i) => loadImage(`/game/shell-white-${i}.png?v=topdown2`)),
    ...[1, 2, 3, 4].map((i) => loadImage(`/game/shell-green-${i}.png?v=topdown2`)),
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
    props: {
      starfish: rest[16] as HTMLImageElement,
      bucket: rest[17] as HTMLImageElement,
      pebble: rest[18] as HTMLImageElement,
    },
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

function dist(a: Vec, b: Vec) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function onSand(p: Vec) {
  return p.x >= SAND_LEFT && p.x <= SAND_RIGHT && p.y >= SAND_TOP && p.y <= SAND_BOT;
}

function clampToSand(p: Vec, vis?: { x0: number; x1: number; y0: number; y1: number }): Vec {
  const box = vis ?? { x0: SAND_LEFT, x1: SAND_RIGHT, y0: SAND_TOP, y1: SAND_BOT };
  return {
    x: clamp(p.x, box.x0, box.x1),
    y: clamp(p.y, box.y0, box.y1),
  };
}

function makeShells(bounds?: { x0: number; x1: number; y0: number; y1: number }): Shell[] {
  if (!bounds) {
    return SHELL_SPOTS.slice(0, SHELL_COUNT).map(([x, y], i) => ({
      id: i,
      x,
      y,
      variant: i % 4,
      painted: false,
      pop: 1,
    }));
  }
  const left = bounds.x0;
  const right = bounds.x1;
  const top = bounds.y0;
  const bot = bounds.y1;
  const xs = [0.2, 0.5, 0.8].map((t) => left + t * (right - left));
  const ys = [0.28, 0.72].map((t) => top + t * (bot - top));
  const spots: Array<[number, number]> = [
    [xs[0]!, ys[0]!],
    [xs[1]!, ys[0]!],
    [xs[2]!, ys[0]!],
    [xs[0]!, ys[1]!],
    [xs[1]!, ys[1]!],
    [xs[2]!, ys[1]!],
  ];
  return spots.map(([x, y], i) => ({
    id: i,
    x,
    y,
    variant: i % 4,
    painted: false,
    pop: 1,
  }));
}

export function createGame(
  canvas: HTMLCanvasElement,
  hooks: { onHud: (hud: GameHud) => void },
): GameApi {
  const maybeCtx = canvas.getContext("2d");
  if (!maybeCtx) throw new Error("Canvas is not available");
  const ctx: CanvasRenderingContext2D = maybeCtx;

  let raf = 0;
  let running = true;
  let last = 0;
  let phase: GamePhase = "loading";
  let assets: Assets | null = null;
  let shells = makeShells();
  let particles: Particle[] = [];
  let time = 0;
  let stepAcc = 0;

  const crab: Crab = {
    x: 800,
    y: 520,
    facing: 1,
    state: "idle",
    frame: 0,
    frameT: 0,
    target: null,
    targetShell: null,
  };

  const css = { w: 1, h: 1 };
  const view = { x: 0, y: 0, scale: 1 };

  function emitHud() {
    hooks.onHud({
      phase,
      painted: shells.filter((s) => s.painted).length,
      total: shells.length,
    });
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
  }

  function sandView() {
    const x0 = -view.x / view.scale;
    const y0 = -view.y / view.scale;
    const x1 = (css.w - view.x) / view.scale;
    const y1 = (css.h - view.y) / view.scale;
    const padX = Math.min(70, Math.max(36, (x1 - x0) * 0.08));
    const padY = 36;
    return {
      x0: clamp(Math.max(x0 + padX, SAND_LEFT), SAND_LEFT, SAND_RIGHT - 200),
      x1: clamp(Math.min(x1 - padX, SAND_RIGHT), SAND_LEFT + 200, SAND_RIGHT),
      y0: clamp(Math.max(y0 + padY, SAND_TOP), SAND_TOP, SAND_BOT - 160),
      y1: clamp(Math.min(y1 - padY, SAND_BOT), SAND_TOP + 160, SAND_BOT),
    };
  }

  function resetWorld() {
    const vis = sandView();
    shells = makeShells(vis);
    particles = [];
    crab.x = (vis.x0 + vis.x1) / 2;
    crab.y = (vis.y0 + vis.y1) / 2;
    crab.target = null;
    crab.targetShell = null;
    crab.state = "idle";
    crab.frame = 0;
    crab.frameT = 0;
    crab.facing = 1;
  }

  function worldFromEvent(ev: PointerEvent): Vec {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (ev.clientX - rect.left - view.x) / view.scale,
      y: (ev.clientY - rect.top - view.y) / view.scale,
    };
  }

  function spawnSparkles(x: number, y: number) {
    const colors = ["#fff6e8", "#5dbb63", "#ffe27a", "#7ec8e3"];
    for (let i = 0; i < 12; i++) {
      const a = (Math.PI * 2 * i) / 12 + Math.random() * 0.2;
      const sp = 70 + Math.random() * 90;
      particles.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 0.45 + Math.random() * 0.2,
        max: 0.65,
        size: 4 + Math.random() * 4,
        color: colors[i % colors.length]!,
        kind: "spark",
        rot: a,
        spin: (Math.random() - 0.5) * 4,
      });
    }
  }

  function spawnConfetti() {
    const colors = ["#e85d4c", "#5dbb63", "#ffe27a", "#7ec8e3", "#fff6e8"];
    for (let i = 0; i < 40; i++) {
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

  function paintShell(shell: Shell) {
    if (shell.painted) return;
    shell.painted = true;
    shell.pop = 0;
    spawnSparkles(shell.x, shell.y);
    playSparkle();
    if (shells.every((s) => s.painted)) {
      phase = "won";
      spawnConfetti();
      playWin();
      speak("Yay! Every shell is happy.");
    }
    emitHud();
  }

  function goTo(world: Vec, shellId: number | null) {
    const dest = clampToSand(world, sandView());
    crab.target = dest;
    crab.targetShell = shellId;
    crab.state = "walk";
    if (Math.abs(dest.x - crab.x) > 4) crab.facing = dest.x >= crab.x ? 1 : -1;
  }

  function handlePointer(ev: PointerEvent) {
    if (phase === "loading") return;
    if (phase === "ready") {
      unlockAudio();
      phase = "playing";
      emitHud();
    }
    if (phase === "won") return;

    playTap();
    const world = worldFromEvent(ev);
    if (world.y < WATER_MAX) return;

    let best: Shell | null = null;
    let bestD = SHELL_HIT;
    for (const shell of shells) {
      if (shell.painted) continue;
      const d = dist(world, shell);
      if (d < bestD) {
        best = shell;
        bestD = d;
      }
    }
    if (best) {
      goTo({ x: best.x, y: best.y }, best.id);
      return;
    }
    if (onSand(world) && world.x >= sandView().x0 && world.x <= sandView().x1) goTo(world, null);
  }

  function updateHover(ev: PointerEvent) {
    if (phase === "won" || phase === "loading") {
      canvas.style.cursor = "default";
      return;
    }
    const world = worldFromEvent(ev);
    const over = shells.some((s) => !s.painted && dist(world, s) < SHELL_HIT);
    canvas.style.cursor = over ? "pointer" : "default";
  }

  function update(dt: number) {
    time += dt;

    for (const shell of shells) {
      if (shell.pop < 1) shell.pop = Math.min(1, shell.pop + dt * 3.2);
    }

    if (crab.target) {
      const dx = crab.target.x - crab.x;
      const dy = crab.target.y - crab.y;
      const d = Math.hypot(dx, dy);
      if (d < 14) {
        crab.x = crab.target.x;
        crab.y = crab.target.y;
        if (crab.targetShell != null) {
          const shell = shells.find((s) => s.id === crab.targetShell);
          if (shell) paintShell(shell);
        }
        crab.target = null;
        crab.targetShell = null;
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
        if (stepAcc > 28) {
          stepAcc = 0;
          if (phase === "playing") playScuttle();
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
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.kind === "confetti") p.vy += 180 * dt;
      else {
        p.vx *= 0.98;
        p.vy *= 0.98;
      }
      p.rot += p.spin * dt;
    }
    particles = particles.filter((p) => p.life > 0);
  }

  function drawCentered(
    img: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number,
    flip = false,
  ) {
    ctx.save();
    ctx.translate(x, y);
    if (flip) ctx.scale(-1, 1);
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

  function draw() {
    ctx.clearRect(0, 0, css.w, css.h);
    ctx.fillStyle = "#5aa9c8";
    ctx.fillRect(0, 0, css.w, css.h);

    ctx.save();
    ctx.translate(view.x, view.y);
    ctx.scale(view.scale, view.scale);

    if (assets) ctx.drawImage(assets.beach, 0, 0, WORLD_W, WORLD_H);

    type Item = { y: number; z: number; draw: () => void };
    const items: Item[] = [];

    if (assets) {
      for (const prop of DECOR) {
        const img = assets.props[prop.kind];
        items.push({
          y: prop.y,
          z: 0,
          draw: () => {
            drawShadow(prop.x, prop.y, prop.w * 0.28, prop.h * 0.1);
            drawCentered(img, prop.x, prop.y, prop.w, prop.h);
          },
        });
      }
      for (const shell of shells) {
        const img = (shell.painted ? assets.green : assets.white)[shell.variant]!;
        const pulse = shell.painted ? 1 : 1 + Math.sin(time * 2.4 + shell.id) * 0.03;
        const pop = shell.pop < 1 ? easeOutBack(shell.pop) : 1;
        const s = SHELL_SIZE * pulse * (0.88 + 0.12 * pop);
        items.push({
          y: shell.y,
          z: 1,
          draw: () => {
            drawShadow(shell.x, shell.y, s * 0.32, s * 0.12);
            drawCentered(img, shell.x, shell.y, s, s);
          },
        });
      }

      const frames = crab.state === "walk" ? assets.walk : assets.idle;
      const img = frames[crab.frame]!;
      items.push({
        y: crab.y + 8,
        z: 2,
        draw: () => {
          drawShadow(crab.x, crab.y, 28, 10);
          drawCentered(img, crab.x, crab.y, CRAB_SIZE, CRAB_SIZE, crab.facing < 0);
        },
      });
    }

    items.sort((a, b) => a.y - b.y || a.z - b.z);
    for (const item of items) item.draw();

    for (const p of particles) {
      const a = Math.max(0, p.life / p.max);
      ctx.globalAlpha = a;
      if (p.kind === "spark") drawStar(p.x, p.y, p.size, p.color, p.rot);
      else {
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
  resize();
  resetWorld();
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
      shells.map((s) => ({
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
      if (phase === "ready") {
        phase = "playing";
        emitHud();
      }
    },
    replay() {
      resetWorld();
      phase = "playing";
      unlockAudio();
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
import { RotateCcw, UserRound, Volume2, VolumeX } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { APP_VERSION } from "@/lib/version";
import { isMuted, setMuted, unlockAudio } from "./audio";
import { createGame, type GameApi, type GameHud } from "./engine";

const EMPTY: GameHud = { phase: "loading", painted: 0, total: 6 };

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const apiRef = useRef<GameApi | null>(null);
  const [hud, setHud] = useState<GameHud>(EMPTY);
  const [muted, setMutedUi] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const api = createGame(canvas, { onHud: setHud });
    apiRef.current = api;
    return () => {
      api.destroy();
      apiRef.current = null;
    };
  }, []);

  function play() {
    unlockAudio();
    apiRef.current?.start();
  }

  function replay() {
    unlockAudio();
    apiRef.current?.replay();
  }

  function toggleMute() {
    const next = !muted;
    setMutedUi(next);
    setMuted(next);
    if (!next) unlockAudio();
    else if (isMuted() !== next) setMuted(next);
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-sky text-ink">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none select-none"
        aria-label="Crabby walking on the beach"
      />

      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-3 sm:p-4">
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="rounded-pill bg-cream/90 px-4 py-2 shadow-md shadow-ink/10 ring-2 ring-cream-soft">
            <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase whitespace-nowrap">
              Happy shells
            </p>
            <p className="text-lg leading-none font-bold tabular-nums sm:text-xl">
              {hud.painted}
              <span className="text-ink-soft"> / {hud.total}</span>
            </p>
          </div>
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
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

      {hud.phase === "playing" && hud.painted === 0 && (
        <p className="pointer-events-none absolute bottom-6 left-1/2 z-10 w-max -translate-x-1/2 rounded-pill bg-cream/90 px-4 py-2 text-sm font-semibold text-ink shadow-md shadow-ink/10 ring-2 ring-cream-soft">
          Tap a white shell
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
            <p className="text-sky-deep text-sm font-semibold tracking-wide uppercase">A sunny little game</p>
            <h1 className="mt-1 text-4xl font-bold tracking-tight text-coral sm:text-5xl">Crabby Beach</h1>
            <p className="mt-3 text-base leading-relaxed text-ink-soft">
              Tap a white shell. Crabby scuttles over and paints it happy green.
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
            <p className="text-mint-deep text-sm font-semibold tracking-wide uppercase">All done</p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-mint-deep sm:text-4xl">
              Yay! Every shell is happy
            </h2>
            <p className="mt-3 text-base text-ink-soft">Crabby did a great job. Want to paint them again?</p>
            <button
              type="button"
              onClick={replay}
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill bg-mint px-6 py-3 text-lg font-bold text-cream shadow-md hover:bg-mint-deep"
            >
              <RotateCcw className="size-5" />
              Play again
            </button>
          </div>
        </div>
      )}

      <p className="pointer-events-none absolute right-3 bottom-3 z-10 text-[11px] font-semibold tracking-wide text-ink/40 uppercase">
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
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, FileText, FolderArchive, Smartphone, Package } from "lucide-react";
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

function Grownups() {
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
            Downloads and version notes. Kids stay on the beach — this page is just for you.
          </p>
          <p className="mt-3 inline-flex rounded-pill bg-cream px-3 py-1 text-sm font-semibold">
            Current version {APP_VERSION}
          </p>
        </header>

        <section className="mt-8" aria-labelledby="downloads-heading">
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

        <section className="mt-10" aria-labelledby="offline-heading">
          <h2 id="offline-heading" className="text-xl font-bold">
            Offline
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-soft">
            <li>Play works without the internet — pictures, sounds, and progress stay on the device.</li>
            <li>If spoken praise is not available, the words still appear on screen.</li>
            <li>Snapshots do not update themselves. Ask when you want a new export.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
```
