export function registerOffline() {
  if (typeof window === "undefined") return;
  if (!import.meta.env.PROD) return;
  if (!("serviceWorker" in navigator)) return;
  void navigator.serviceWorker.register("/sw.js");
}
