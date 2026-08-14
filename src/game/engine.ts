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
