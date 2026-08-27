const KEY = "crabby-beach-progress-v1";
export const MAX_HOURS = 9;

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
