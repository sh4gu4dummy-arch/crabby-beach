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
  darkMode: boolean;
  timerMinutes: TimerMinutes;
  pen: PenId;
};

const KEY = "crabby-beach-settings-v1";

export const DEFAULT_SETTINGS: GrownupSettings = {
  color: "red",
  hat: "none",
  voiceCounts: true,
  music: true,
  darkMode: false,
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
      darkMode: parsed.darkMode === true,
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
  applyTheme(next.darkMode);
}

export function applyTheme(dark: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}
