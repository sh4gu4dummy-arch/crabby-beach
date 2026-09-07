const KEY = "crabby-beach-progress-v1";
export const MAX_HOURS = 12;

export type Progress = {
  cleared: number;
  dev: boolean;
  asleep: boolean;
};

function clampCleared(n: number) {
  return Math.min(MAX_HOURS, Math.max(0, Math.floor(n)));
}

export function loadProgress(): Progress {
  if (typeof window === "undefined") return { cleared: 0, dev: false, asleep: false };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { cleared: 0, dev: false, asleep: false };
    const parsed = JSON.parse(raw) as Partial<Progress>;
    const cleared = typeof parsed.cleared === "number" ? clampCleared(parsed.cleared) : 0;
    const asleep = parsed.asleep === true || (parsed.asleep == null && cleared >= MAX_HOURS);
    return {
      cleared,
      dev: parsed.dev === true,
      asleep,
    };
  } catch {
    return { cleared: 0, dev: false, asleep: false };
  }
}

export function saveProgress(next: Progress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    KEY,
    JSON.stringify({
      cleared: clampCleared(next.cleared),
      dev: next.dev === true,
      asleep: next.asleep === true,
    }),
  );
}

export function loadCleared(): number {
  return loadProgress().cleared;
}

export function saveCleared(cleared: number) {
  const prev = loadProgress();
  const n = clampCleared(cleared);
  saveProgress({ ...prev, cleared: n, asleep: n >= MAX_HOURS ? true : prev.asleep });
}

export function loadDev(): boolean {
  return loadProgress().dev;
}

export function saveDev(dev: boolean) {
  const prev = loadProgress();
  saveProgress({ ...prev, dev });
}

export function loadAsleep(): boolean {
  return loadProgress().asleep;
}

export function saveAsleep(asleep: boolean) {
  const prev = loadProgress();
  saveProgress({ ...prev, asleep });
}

export function isFinished(cleared = loadCleared()) {
  return cleared >= MAX_HOURS;
}

export function isSleepLocked(p = loadProgress()) {
  return !p.dev && p.asleep;
}

export function loadoutUnlocked(cleared = loadCleared(), dev = loadDev()) {
  return dev || isFinished(cleared);
}

export function unlockedFrom(cleared: number, dev = loadDev()) {
  if (dev) return MAX_HOURS;
  return Math.min(MAX_HOURS, Math.max(1, cleared + 1));
}
