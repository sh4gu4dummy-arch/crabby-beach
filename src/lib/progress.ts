const KEY = "crabby-beach-progress-v1";
const MAX = 9;

export function loadCleared(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { cleared?: unknown };
    const n = typeof parsed.cleared === "number" ? parsed.cleared : 0;
    return Math.min(MAX, Math.max(0, Math.floor(n)));
  } catch {
    return 0;
  }
}

export function saveCleared(cleared: number) {
  if (typeof window === "undefined") return;
  const n = Math.min(MAX, Math.max(0, Math.floor(cleared)));
  window.localStorage.setItem(KEY, JSON.stringify({ cleared: n }));
}

export function unlockedFrom(cleared: number) {
  return Math.min(MAX, Math.max(1, cleared + 1));
}
