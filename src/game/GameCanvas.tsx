import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { RotateCcw, Timer, UserRound, Volume2, VolumeX } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { loadSettings } from "@/lib/settings";
import { APP_VERSION } from "@/lib/version";
import { isMuted, setMuted, setMusicEnabled, unlockAudio } from "./audio";
import { createGame, type GameApi, type GameHud } from "./engine";

const EMPTY: GameHud = {
  phase: "loading",
  painted: 0,
  total: 6,
  theme: "sunny",
  countPop: null,
  countKey: 0,
  secondsLeft: null,
  level: 1,
  maxLevel: 5,
};

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const apiRef = useRef<GameApi | null>(null);
  const [hud, setHud] = useState<GameHud>(EMPTY);
  const [muted, setMutedUi] = useState(false);
  const [popOn, setPopOn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const api = createGame(canvas, {
      onHud: setHud,
      getSettings: loadSettings,
    });
    apiRef.current = api;
    setMusicEnabled(loadSettings().music);
    return () => {
      api.destroy();
      apiRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (hud.countPop == null) return;
    setPopOn(true);
    const t = window.setTimeout(() => setPopOn(false), 700);
    return () => window.clearTimeout(t);
  }, [hud.countKey, hud.countPop]);

  function play() {
    unlockAudio();
    setMusicEnabled(loadSettings().music);
    apiRef.current?.start();
  }

  function replay(opts?: { theme?: "sunny" | "sunset"; advance?: boolean; restart?: boolean }) {
    unlockAudio();
    setMusicEnabled(loadSettings().music);
    apiRef.current?.replay(opts);
  }

  function moreTime() {
    unlockAudio();
    apiRef.current?.addTime(60);
  }

  function toggleMute() {
    const next = !muted;
    setMutedUi(next);
    setMuted(next);
    if (!next) unlockAudio();
  }

  const timerLabel =
    hud.secondsLeft == null
      ? null
      : `${Math.floor(hud.secondsLeft / 60)}:${String(hud.secondsLeft % 60).padStart(2, "0")}`;

  return (
    <div className={`relative h-dvh w-full overflow-hidden text-ink ${hud.theme === "sunset" ? "bg-coral" : "bg-sky"}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none select-none"
        aria-label="Crabby walking on the beach"
      />

      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-3 sm:p-4">
        <div className="rounded-pill bg-cream/90 px-4 py-2 shadow-md shadow-ink/10 ring-2 ring-cream-soft">
          <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Beach</p>
          <p className="text-lg leading-none font-bold tabular-nums">
            {hud.level}
            <span className="text-ink-soft"> / {hud.maxLevel}</span>
          </p>
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          {timerLabel && (
            <div className="flex items-center gap-1 rounded-pill bg-cream/90 px-3 py-2 text-sm font-bold shadow-md shadow-ink/10 ring-2 ring-cream-soft">
              <Timer className="size-4" />
              {timerLabel}
            </div>
          )}
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

      {popOn && hud.countPop != null && (
        <div
          key={hud.countKey}
          className="count-pop pointer-events-none absolute top-1/3 left-1/2 z-30 -translate-x-1/2 text-7xl font-bold text-cream drop-shadow-md sm:text-8xl"
        >
          {hud.countPop}
        </div>
      )}

      {hud.phase === "playing" && hud.painted === 0 && (
        <p className="pointer-events-none absolute bottom-28 left-1/2 z-10 w-max max-w-[90%] -translate-x-1/2 rounded-pill bg-cream/90 px-4 py-2 text-center text-sm font-semibold text-ink shadow-md shadow-ink/10 ring-2 ring-cream-soft">
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
            <p className="text-sky-deep text-sm font-semibold tracking-wide uppercase">Five little beaches</p>
            <h1 className="mt-1 text-4xl font-bold tracking-tight text-coral sm:text-5xl">Crabby Beach</h1>
            <p className="mt-3 text-base leading-relaxed text-ink-soft">
              Tap a white shell. Each new beach hides one more. The last beach has ten.
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
            <p className="text-mint-deep text-sm font-semibold tracking-wide uppercase">
              {hud.level >= hud.maxLevel ? "Every beach" : `Beach ${hud.level} of ${hud.maxLevel}`}
            </p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-mint-deep sm:text-4xl">
              {hud.level >= hud.maxLevel ? "You found them all!" : "Yay! You found them all"}
            </h2>
            <p className="mt-3 text-base text-ink-soft">
              {hud.level >= hud.maxLevel
                ? "Five beaches, and a full tray. Want to start over?"
                : `Next beach has ${hud.total + 1} finds.`}
            </p>
            <div className="mt-6 grid gap-3">
              {hud.level < hud.maxLevel ? (
                <button
                  type="button"
                  onClick={() => replay({ theme: hud.theme === "sunset" ? "sunny" : "sunset", advance: true })}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill bg-coral px-6 py-3 text-lg font-bold text-cream shadow-md hover:bg-coral-deep"
                >
                  Next beach
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => replay({ theme: "sunny", restart: true })}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill bg-coral px-6 py-3 text-lg font-bold text-cream shadow-md hover:bg-coral-deep"
                >
                  Start over
                </button>
              )}
              <button
                type="button"
                onClick={() => replay({ theme: hud.theme, restart: hud.level >= hud.maxLevel })}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill bg-mint px-6 py-3 text-lg font-bold text-cream shadow-md hover:bg-mint-deep"
              >
                <RotateCcw className="size-5" />
                This beach again
              </button>
            </div>
          </div>
        </div>
      )}

      {hud.phase === "timesup" && (
        <div className="absolute inset-0 z-20 grid place-items-end bg-ink/25 p-4 pb-10 sm:place-items-center sm:pb-4">
          <div className="w-full max-w-md rounded-card bg-cream px-6 py-7 text-center shadow-xl shadow-ink/20 ring-4 ring-cream-soft sm:px-8">
            <p className="text-sky-deep text-sm font-semibold tracking-wide uppercase">All done for now</p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-ink">That was a lovely play</h2>
            <p className="mt-3 text-base text-ink-soft">Need one more minute, or start a new beach?</p>
            <div className="mt-6 grid gap-3">
              <button
                type="button"
                onClick={moreTime}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill bg-coral px-6 py-3 text-lg font-bold text-cream shadow-md hover:bg-coral-deep"
              >
                <Timer className="size-5" />
                One more minute
              </button>
              <button
                type="button"
                onClick={() => replay({ theme: "sunny", restart: true })}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill bg-mint px-6 py-3 text-lg font-bold text-cream shadow-md hover:bg-mint-deep"
              >
                <RotateCcw className="size-5" />
                New beach
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="pointer-events-none absolute top-16 right-3 z-10 text-xs font-semibold tracking-wide text-ink/40 uppercase">
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
