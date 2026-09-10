import { assetUrl } from "@/lib/asset";
import { CRABBY_CLIPS } from "@/game/crabby-voice";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sfxBus: GainNode | null = null;
let musicBus: GainNode | null = null;
let oceanGain: GainNode | null = null;
let muted = false;
let musicOn = true;
let musicScene: "menu" | "game" | "quiet" = "menu";
let oceanSrc: AudioBufferSourceNode | null = null;
let noiseBuffer: AudioBuffer | null = null;
let brushBuffer: AudioBuffer | null = null;
let voiceSrc: AudioBufferSourceNode | null = null;
let brushSrc: AudioBufferSourceNode | null = null;
let brushGain: GainNode | null = null;
let musicTimer: number | null = null;
const voiceBufs = new Map<string, AudioBuffer>();
let voicesLoading: Promise<void> | null = null;

const VOICE_FILES: Record<string, string> = {
  one: assetUrl("voice/crabby/one.mp3?v=062"),
  two: assetUrl("voice/crabby/two.mp3?v=062"),
  three: assetUrl("voice/crabby/three.mp3?v=062"),
  four: assetUrl("voice/crabby/four.mp3?v=062"),
  five: assetUrl("voice/crabby/five.mp3?v=062"),
  six: assetUrl("voice/crabby/six.mp3?v=062"),
  seven: assetUrl("voice/crabby/seven.mp3?v=062"),
  eight: assetUrl("voice/crabby/eight.mp3?v=062"),
  nine: assetUrl("voice/crabby/nine.mp3?v=062"),
  ten: assetUrl("voice/crabby/ten.mp3?v=062"),
  eleven: assetUrl("voice/crabby/eleven.mp3?v=062"),
  twelve: assetUrl("voice/crabby/twelve.mp3?v=062"),
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
  oceanGain = ctx.createGain();
  sfxBus.gain.value = 0.85;
  musicBus.gain.value = musicOn ? 0.14 : 0;
  oceanGain.gain.value = 0;
  master.gain.value = muted ? 0 : 1;
  sfxBus.connect(master);
  musicBus.connect(master);
  oceanGain.connect(musicBus);
  master.connect(ctx.destination);

  const n = Math.floor(ctx.sampleRate * 0.8);
  noiseBuffer = ctx.createBuffer(1, n, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;

  const bn = Math.floor(ctx.sampleRate * 1.6);
  brushBuffer = ctx.createBuffer(1, bn, ctx.sampleRate);
  const brush = brushBuffer.getChannelData(0);
  let acc = 0;
  for (let i = 0; i < bn; i++) {
    acc = acc * 0.985 + (Math.random() * 2 - 1) * 0.015;
    brush[i] = acc * 4.2;
  }
}

function resume() {
  if (ctx && ctx.state === "suspended") void ctx.resume();
}

export function unlockAudio() {
  ensureGraph();
  resume();
  startMusicEngine();
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
    musicBus.gain.setTargetAtTime(on ? 0.14 : 0, ctx.currentTime, 0.05);
  }
  if (oceanGain && ctx) {
    oceanGain.gain.setTargetAtTime(on && musicScene === "game" ? 0.12 : 0, ctx.currentTime, 0.08);
  }
}

export function setMusicScene(scene: "menu" | "game" | "quiet") {
  musicScene = scene;
  if (!ctx || !oceanGain) return;
  const at = ctx.currentTime;
  const ocean = scene === "game" && musicOn ? 0.12 : 0;
  oceanGain.gain.setTargetAtTime(ocean, at, 0.08);
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
  const words = [
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
  ];
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

export function playSandPat() {
  if (!ctx || !sfxBus || !noiseBuffer || muted) return;
  const at = tNow();
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  src.playbackRate.value = 0.72 + Math.random() * 0.12;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 620 + Math.random() * 80;
  const g = ctx.createGain();
  env(g, 0.055, 0.008, 0.07, at);
  src.connect(filter);
  filter.connect(g);
  g.connect(sfxBus);
  src.start(at);
  src.stop(at + 0.09);
  beep(150 + Math.random() * 25, 0.05, "triangle", 0.035, at, 95);
}

export function playSplash() {
  if (!ctx || !sfxBus || !noiseBuffer || muted) return;
  const at = tNow();
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  src.playbackRate.value = 1.35 + Math.random() * 0.3;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 980 + Math.random() * 220;
  filter.Q.value = 1.1;
  const g = ctx.createGain();
  env(g, 0.06, 0.01, 0.11, at);
  src.connect(filter);
  filter.connect(g);
  g.connect(sfxBus);
  src.start(at);
  src.stop(at + 0.13);
  beep(480 + Math.random() * 40, 0.08, "sine", 0.04, at, 240);
  beep(820, 0.05, "sine", 0.025, at + 0.03, 500);
}

export function playScuttle() {
  playSandPat();
}

export function playDip() {
  if (!ctx || muted) return;
  const at = tNow();
  beep(280, 0.09, "sine", 0.12, at, 180);
  beep(520, 0.16, "triangle", 0.1, at + 0.04, 740);
}

export function startBrush() {
  if (!ctx || !sfxBus || !brushBuffer || muted || brushSrc) return;
  const src = ctx.createBufferSource();
  src.buffer = brushBuffer;
  src.loop = true;
  src.playbackRate.value = 0.55;
  const low = ctx.createBiquadFilter();
  low.type = "lowpass";
  low.frequency.value = 380;
  low.Q.value = 0.4;
  const g = ctx.createGain();
  const now = ctx.currentTime;
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(0.022, now + 0.09);
  src.connect(low);
  low.connect(g);
  g.connect(sfxBus);
  src.start();
  brushSrc = src;
  brushGain = g;
}

export function stopBrush() {
  const src = brushSrc;
  const g = brushGain;
  brushSrc = null;
  brushGain = null;
  if (!src) return;
  if (g && ctx) {
    const now = ctx.currentTime;
    g.gain.cancelScheduledValues(now);
    g.gain.setValueAtTime(Math.max(0.0001, g.gain.value), now);
    g.gain.linearRampToValueAtTime(0.0001, now + 0.14);
    window.setTimeout(() => {
      try {
        src.stop();
      } catch {
        /* already ended */
      }
    }, 160);
    return;
  }
  try {
    src.stop();
  } catch {
    /* already ended */
  }
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

export function playWave() {
  if (!ctx || !sfxBus || !noiseBuffer || muted) return;
  const at = tNow();
  const wash = (rate: number, peak: number, attack: number, dur: number, start: number, fromHz: number, toHz: number) => {
    const src = ctx!.createBufferSource();
    src.buffer = noiseBuffer;
    src.playbackRate.value = rate;
    const filter = ctx!.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(fromHz, start);
    filter.frequency.exponentialRampToValueAtTime(toHz, start + dur);
    const g = ctx!.createGain();
    env(g, peak, attack, dur, start);
    src.connect(filter);
    filter.connect(g);
    g.connect(sfxBus!);
    src.start(start);
    src.stop(start + dur + 0.05);
  };
  wash(0.26, 0.05, 1.6, 8.4, at, 360, 140);
  wash(0.38, 0.024, 2.2, 7.6, at + 0.8, 760, 220);
  wash(0.24, 0.035, 2.0, 7.0, at + 5.8, 300, 120);
}

export function playFlow() {
  if (!ctx || !sfxBus || !noiseBuffer || muted) return;
  const at = tNow();
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  src.playbackRate.value = 0.3;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(380, at);
  filter.frequency.exponentialRampToValueAtTime(150, at + 1.6);
  const g = ctx.createGain();
  env(g, 0.045, 0.4, 1.8, at);
  src.connect(filter);
  filter.connect(g);
  g.connect(sfxBus);
  src.start(at);
  src.stop(at + 1.9);
}

export function playJewel() {
  if (!ctx || muted) return;
  const at = tNow();
  const notes = [1046.5, 1318.5, 1568, 2093];
  notes.forEach((freq, i) => {
    beep(freq, 0.38, "sine", 0.09 - i * 0.012, at + i * 0.07);
    beep(freq * 2.01, 0.22, "triangle", 0.03, at + i * 0.07 + 0.02);
  });
}

function pluck(freq: number, dur: number, peak: number, at: number) {
  if (!ctx || !musicBus) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq, at);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.98, at + dur);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), at + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(g);
  g.connect(musicBus);
  osc.start(at);
  osc.stop(at + dur + 0.05);
}

function startOcean() {
  if (!ctx || !oceanGain || !noiseBuffer || oceanSrc) return;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  src.loop = true;
  src.playbackRate.value = 0.28;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 360;
  filter.Q.value = 0.45;
  src.connect(filter);
  filter.connect(oceanGain);
  src.start();
  oceanSrc = src;
}

const MENU_TUNE: Array<[number, number]> = [
  [392, 0.28],
  [494, 0.28],
  [587, 0.42],
  [659, 0.28],
  [587, 0.28],
  [494, 0.42],
  [392, 0.28],
  [330, 0.28],
  [392, 0.55],
  [523, 0.28],
  [587, 0.28],
  [659, 0.7],
  [587, 0.35],
  [494, 0.9],
];

const GAME_TUNE: Array<[number, number]> = [
  [262, 0.7],
  [330, 0.7],
  [392, 1.0],
  [330, 0.5],
  [294, 0.9],
  [262, 1.1],
  [196, 0.9],
  [262, 1.2],
];

function startMusicEngine() {
  if (!ctx || !musicBus || !noiseBuffer) return;
  startOcean();
  if (musicTimer != null) return;

  const tick = () => {
    if (!ctx) {
      musicTimer = window.setTimeout(tick, 1200);
      return;
    }
    if (!musicOn || musicScene === "quiet") {
      musicTimer = window.setTimeout(tick, 900);
      return;
    }
    const tune = musicScene === "menu" ? MENU_TUNE : GAME_TUNE;
    const peak = musicScene === "menu" ? 0.055 : 0.028;
    let t = ctx.currentTime + 0.04;
    for (const [freq, dur] of tune) {
      pluck(freq, dur * (musicScene === "menu" ? 0.78 : 1.05), peak, t);
      if (musicScene === "menu") pluck(freq * 2, dur * 0.45, peak * 0.28, t + 0.02);
      t += dur;
    }
    musicTimer = window.setTimeout(tick, (t - ctx.currentTime + 0.55) * 1000);
  };
  tick();
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") resume();
  });
  window.addEventListener("focus", resume);
}
