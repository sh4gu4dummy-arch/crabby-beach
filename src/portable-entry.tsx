import { createRoot } from "react-dom/client";
import {
  Outlet,
  RouterProvider,
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { GameCanvas } from "@/game/GameCanvas";
import "@/styles.css";

function PortableGrownups() {
  return (
    <main className="min-h-dvh bg-sand p-6 text-ink">
      <a href="#/" className="inline-flex min-h-11 items-center rounded-pill bg-cream px-4 font-semibold">
        Back to the beach
      </a>
      <p className="mt-6 text-lg">Looks and play are saved on this device.</p>
      <p className="mt-2 text-ink-soft">Downloads live in the full Grown-ups page of the online snapshot.</p>
    </main>
  );
}

const rootRoute = createRootRoute({
  component: () => (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: GameCanvas,
});

const grownupsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/grownups",
  component: PortableGrownups,
});

const routeTree = rootRoute.addChildren([indexRoute, grownupsRoute]);
const router = createRouter({ routeTree, history: createHashHistory() });

function mount() {
  const el = document.getElementById("app");
  if (!el || el.dataset.mounted === "1") return;
  el.dataset.mounted = "1";
  createRoot(el).render(<RouterProvider router={router} />);
}

mount();
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
}

