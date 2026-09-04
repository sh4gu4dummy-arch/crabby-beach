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
  const brush = { down: false, swiping: false, x: 800, y: 520, lastX: 800, lastY: 520 };
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
    const r = PAINT_RES * 0.12;
    const hex = paintHex(crab.paint);
    px.fillStyle = hex;
    px.beginPath();
    px.arc(lx, ly, r * 0.7, 0, Math.PI * 2);
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
    brush.swiping = false;
    brush.x = world.x;
    brush.y = world.y;
    brush.lastX = world.x;
    brush.lastY = world.y;

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
    const moved = dist(world, { x: brush.lastX, y: brush.lastY });
    brush.x = world.x;
    brush.y = world.y;
    if (usingAuto()) return;
    if (moved < 3) return;
    brush.swiping = true;
    brush.lastX = world.x;
    brush.lastY = world.y;
    const item = findUnder(world);
    if (item && canPaint(item)) stampPaint(item, world.x, world.y);
  }

  function handleUp() {
    brush.down = false;
    brush.swiping = false;
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
      if (brush.down && brush.swiping && !usingAuto()) {
        const item = findUnder({ x: brush.x, y: brush.y });
        if (item && canPaint(item)) {
          item.paintTime += dt;
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
      brush.swiping = false;
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
        if (item.paintLayer) drawCentered(item.paintLayer, x, y, s, s);
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
