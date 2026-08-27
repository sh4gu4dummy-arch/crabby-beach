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
  maxLevel: 9,
  hour: 1,
  skyFill: "#7ec8e3",
};

function AnalogClock({ hour }: { hour: number }) {
  const deg = (hour % 12) * 30;
  const rad = ((deg - 90) * Math.PI) / 180;
  const hx = 20 + Math.cos(rad) * 9;
  const hy = 20 + Math.sin(rad) * 9;
  return (
    <svg viewBox="0 0 40 40" className="size-10 shrink-0" aria-hidden="true">
      <circle cx="20" cy="20" r="18" fill="#fff6e8" stroke="#e8c07a" strokeWidth="2.6" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n) => {
        const a = ((n * 30 - 90) * Math.PI) / 180;
        const inner = n % 3 === 0 ? 13 : 15;
        return (
          <line
            key={n}
            x1={20 + Math.cos(a) * inner}
            y1={20 + Math.sin(a) * inner}
            x2={20 + Math.cos(a) * 16.5}
            y2={20 + Math.sin(a) * 16.5}
            stroke="#6b5348"
            strokeWidth={n % 3 === 0 ? 1.8 : 1}
            strokeLinecap="round"
          />
        );
      })}
      <line x1="20" y1="20" x2="20" y2="8.5" stroke="#3a2a22" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="20" y1="20" x2={hx} y2={hy} stroke="#e85d4c" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="20" cy="20" r="2.2" fill="#3a2a22" />
    </svg>
  );
}

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
    <div className="flex h-dvh w-full justify-center overflow-hidden" style={{ background: hud.skyFill }}>
      <div
        className="relative h-dvh w-full max-w-[28rem] overflow-hidden text-ink"
        style={{ background: hud.skyFill }}
      >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none select-none"
        aria-label="Crabby walking on the beach"
      />

      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 px-3 pb-3 pt-[max(0.7rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-2 rounded-pill bg-cream/90 py-1.5 pr-4 pl-1.5 shadow-md shadow-ink/10 ring-2 ring-cream-soft">
          <AnalogClock hour={hud.hour} />
          <div>
            <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">{hud.hour}pm</p>
            <p className="text-lg leading-none font-bold tabular-nums">
              {hud.level}
              <span className="text-ink-soft"> / {hud.maxLevel}</span>
            </p>
          </div>
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
            className="grid size-12 place-items-center rounded-pill bg-cream/90 text-ink shadow-md shadow-ink/10 ring-2 ring-cream-soft"
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
        <p className="pointer-events-none absolute bottom-32 left-1/2 z-10 w-[min(92%,20rem)] -translate-x-1/2 rounded-pill bg-cream/90 px-4 py-2.5 text-center text-sm font-semibold text-ink shadow-md shadow-ink/10 ring-2 ring-cream-soft">
          Tap a paint can or a white shell
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
          className="absolute inset-0 z-20 grid place-items-end bg-ink/20 px-3 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
          onClick={play}
        >
          <div className="w-full rounded-t-card rounded-b-3xl bg-cream px-5 py-6 text-center shadow-xl shadow-ink/20 ring-4 ring-cream-soft">
            <p className="text-sky-deep text-sm font-semibold tracking-wide uppercase">Nine little hours</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-coral">Crabby Beach</h1>
            <p className="mt-3 text-base leading-relaxed text-ink-soft">
              Start at 1pm. Each beach is an hour later. By 9pm the sky is night and the shells glow.
            </p>
            <button
              type="button"
              onClick={play}
              className="mt-5 min-h-14 w-full rounded-pill bg-coral px-6 py-3 text-lg font-bold text-cream shadow-md shadow-coral-deep/30 hover:bg-coral-deep"
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
        <div className="absolute inset-0 z-20 grid place-items-end bg-ink/25 px-3 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="w-full rounded-t-card rounded-b-3xl bg-cream px-5 py-6 text-center shadow-xl shadow-ink/20 ring-4 ring-mint">
            <p className="text-mint-deep text-sm font-semibold tracking-wide uppercase">
              {hud.level >= hud.maxLevel ? "9pm · night" : `${hud.hour}pm`}
            </p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-mint-deep sm:text-4xl">
              {hud.level >= hud.maxLevel ? "The shells lit up the night!" : "Yay! You found them all"}
            </h2>
            <p className="mt-3 text-base text-ink-soft">
              {hud.level >= hud.maxLevel
                ? "From 1pm to 9pm. Want to start the afternoon again?"
                : `Next hour is ${hud.hour + 1}pm. The sky gets a little darker.`}
            </p>
            <div className="mt-6 grid gap-3">
              {hud.level < hud.maxLevel ? (
                <button
                  type="button"
                  onClick={() => replay({ advance: true })}
                  className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-pill bg-coral px-6 py-3 text-lg font-bold text-cream shadow-md hover:bg-coral-deep"
                >
                  Next hour
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => replay({ theme: "sunny", restart: true })}
                  className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-pill bg-coral px-6 py-3 text-lg font-bold text-cream shadow-md hover:bg-coral-deep"
                >
                  Start at 1pm
                </button>
              )}
              <button
                type="button"
                onClick={() => replay({ restart: hud.level >= hud.maxLevel })}
                className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-pill bg-mint px-6 py-3 text-lg font-bold text-cream shadow-md hover:bg-mint-deep"
              >
                <RotateCcw className="size-5" />
                This hour again
              </button>
            </div>
          </div>
        </div>
      )}

      {hud.phase === "timesup" && (
        <div className="absolute inset-0 z-20 grid place-items-end bg-ink/25 px-3 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="w-full rounded-t-card rounded-b-3xl bg-cream px-5 py-6 text-center shadow-xl shadow-ink/20 ring-4 ring-cream-soft">
            <p className="text-sky-deep text-sm font-semibold tracking-wide uppercase">All done for now</p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-ink">That was a lovely play</h2>
            <p className="mt-3 text-base text-ink-soft">Need one more minute, or start a new beach?</p>
            <div className="mt-6 grid gap-3">
              <button
                type="button"
                onClick={moreTime}
                className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-pill bg-coral px-6 py-3 text-lg font-bold text-cream shadow-md hover:bg-coral-deep"
              >
                <Timer className="size-5" />
                One more minute
              </button>
              <button
                type="button"
                onClick={() => replay({ theme: "sunny", restart: true })}
                className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-pill bg-mint px-6 py-3 text-lg font-bold text-cream shadow-md hover:bg-mint-deep"
              >
                <RotateCcw className="size-5" />
                New beach
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="pointer-events-none absolute top-[4.6rem] right-3 z-10 rounded-pill bg-cream px-3 py-1 text-sm font-bold tracking-wide text-ink shadow-md shadow-ink/10 ring-2 ring-cream-soft">
        {APP_VERSION}
      </p>

      <div className="turn-phone pointer-events-none absolute inset-0 z-40 hidden place-items-center bg-sky px-8 text-center">
        <div>
          <p className="text-2xl font-bold text-coral">Tip the phone up</p>
          <p className="mt-2 text-base text-ink-soft">Crabby Beach is made for portrait.</p>
        </div>
      </div>
    </div>
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
