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
  const words = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
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
