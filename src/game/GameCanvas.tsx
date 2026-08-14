import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { RotateCcw, UserRound, Volume2, VolumeX } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { APP_VERSION } from "@/lib/version";
import { isMuted, setMuted, unlockAudio } from "./audio";
import { createGame, type GameApi, type GameHud } from "./engine";

const EMPTY: GameHud = { phase: "loading", painted: 0, total: 6 };

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const apiRef = useRef<GameApi | null>(null);
  const [hud, setHud] = useState<GameHud>(EMPTY);
  const [muted, setMutedUi] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const api = createGame(canvas, { onHud: setHud });
    apiRef.current = api;
    return () => {
      api.destroy();
      apiRef.current = null;
    };
  }, []);

  function play() {
    unlockAudio();
    apiRef.current?.start();
  }

  function replay() {
    unlockAudio();
    apiRef.current?.replay();
  }

  function toggleMute() {
    const next = !muted;
    setMutedUi(next);
    setMuted(next);
    if (!next) unlockAudio();
    else if (isMuted() !== next) setMuted(next);
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-sky text-ink">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none select-none"
        aria-label="Crabby walking on the beach"
      />

      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-3 sm:p-4">
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="rounded-pill bg-cream/90 px-4 py-2 shadow-md shadow-ink/10 ring-2 ring-cream-soft">
            <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase whitespace-nowrap">
              Happy shells
            </p>
            <p className="text-lg leading-none font-bold tabular-nums sm:text-xl">
              {hud.painted}
              <span className="text-ink-soft"> / {hud.total}</span>
            </p>
          </div>
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMute}
            className="grid size-11 place-items-center rounded-pill bg-cream/90 text-ink shadow-md shadow-ink/10 ring-2 ring-cream-soft"
            aria-label={muted ? "Unmute sounds" : "Mute sounds"}
          >
            {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
          </button>
          <AuthChip />
        </div>
      </header>

      {hud.phase === "playing" && hud.painted === 0 && (
        <p className="pointer-events-none absolute bottom-6 left-1/2 z-10 w-max -translate-x-1/2 rounded-pill bg-cream/90 px-4 py-2 text-sm font-semibold text-ink shadow-md shadow-ink/10 ring-2 ring-cream-soft">
          Tap a white shell
        </p>
      )}

      {hud.phase === "loading" && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-sky">
          <div className="rounded-card bg-cream px-8 py-6 text-center shadow-lg shadow-ink/10">
            <p className="text-2xl font-bold">Crabby Beach</p>
            <p className="mt-1 text-ink-soft">Warming up the sand…</p>
          </div>
        </div>
      )}

      {hud.phase === "ready" && (
        <div
          className="absolute inset-0 z-20 grid place-items-end bg-ink/20 p-4 pb-10 sm:place-items-center sm:pb-4"
          onClick={play}
        >
          <div className="w-full max-w-md rounded-card bg-cream px-6 py-7 text-center shadow-xl shadow-ink/20 ring-4 ring-cream-soft sm:px-8">
            <p className="text-sky-deep text-sm font-semibold tracking-wide uppercase">A sunny little game</p>
            <h1 className="mt-1 text-4xl font-bold tracking-tight text-coral sm:text-5xl">Crabby Beach</h1>
            <p className="mt-3 text-base leading-relaxed text-ink-soft">
              Tap a white shell. Crabby scuttles over and paints it happy green.
            </p>
            <button
              type="button"
              onClick={play}
              className="mt-6 min-h-12 w-full rounded-pill bg-coral px-6 py-3 text-lg font-bold text-cream shadow-md shadow-coral-deep/30 hover:bg-coral-deep"
            >
              Let’s play!
            </button>
            <Link
              to="/grownups"
              onClick={(e) => e.stopPropagation()}
              className="mt-4 inline-block text-xs font-semibold tracking-wide text-ink-soft/70 uppercase hover:text-ink-soft"
            >
              Grown-ups
            </Link>
          </div>
        </div>
      )}

      {hud.phase === "won" && (
        <div className="absolute inset-0 z-20 grid place-items-end bg-ink/25 p-4 pb-10 sm:place-items-center sm:pb-4">
          <div className="w-full max-w-md rounded-card bg-cream px-6 py-7 text-center shadow-xl shadow-ink/20 ring-4 ring-mint sm:px-8">
            <p className="text-mint-deep text-sm font-semibold tracking-wide uppercase">All done</p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-mint-deep sm:text-4xl">
              Yay! Every shell is happy
            </h2>
            <p className="mt-3 text-base text-ink-soft">Crabby did a great job. Want to paint them again?</p>
            <button
              type="button"
              onClick={replay}
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill bg-mint px-6 py-3 text-lg font-bold text-cream shadow-md hover:bg-mint-deep"
            >
              <RotateCcw className="size-5" />
              Play again
            </button>
          </div>
        </div>
      )}

      <p className="pointer-events-none absolute right-3 bottom-3 z-10 text-[11px] font-semibold tracking-wide text-ink/40 uppercase">
        {APP_VERSION}
      </p>
    </div>
  );
}

function AuthChip() {
  const { isPending } = useCurrentUserState();
  if (isPending) {
    return <div className="size-11 animate-pulse rounded-pill bg-cream/70" />;
  }
  return (
    <div className="flex items-center rounded-pill bg-cream/90 px-2 py-1 shadow-md shadow-ink/10 ring-2 ring-cream-soft">
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <Link
          to="/login"
          className="grid size-9 place-items-center rounded-pill text-ink-soft hover:text-ink"
          aria-label="Sign in"
        >
          <UserRound className="size-5" />
        </Link>
      </SignedOut>
    </div>
  );
}
