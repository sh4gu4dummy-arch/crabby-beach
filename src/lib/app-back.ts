/** Phone / PWA back. Returns true if the app handled it. */

export type BackHandler = () => boolean;

const handlers: BackHandler[] = [];

export function pushBack(handler: BackHandler) {
  handlers.push(handler);
  return () => {
    const i = handlers.lastIndexOf(handler);
    if (i >= 0) handlers.splice(i, 1);
  };
}

export function runBack(): boolean {
  for (let i = handlers.length - 1; i >= 0; i--) {
    try {
      if (handlers[i]!()) return true;
    } catch {
      /* keep looking */
    }
  }
  return false;
}

declare global {
  interface Window {
    __crabbyBack?: () => boolean;
  }
}

function isAppShell() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return (
    standalone ||
    host === "appassets.androidplatform.net" ||
    window.location.protocol === "file:"
  );
}

let installed = false;

export function installAppBack() {
  if (typeof window === "undefined" || installed) return;
  installed = true;
  window.__crabbyBack = runBack;
  if (!isAppShell()) return;
  window.history.pushState({ crabby: 1 }, "");
  window.addEventListener("popstate", () => {
    if (runBack()) window.history.pushState({ crabby: 1 }, "");
  });
}
