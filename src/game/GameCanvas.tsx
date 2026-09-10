import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Clapperboard, Home, Lock, Moon, Music2, Palette, Play, RotateCcw, Sun, Timer, UserRound, Volume2, VolumeX, Waves } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { loadSettings, saveSettings, applyTheme, type CrabColor, type CrabHat, type PenId } from "@/lib/settings";
import { APP_VERSION } from "@/lib/version";
import { assetUrl } from "@/lib/asset";
import { installAppBack, pushBack } from "@/lib/app-back";
import { isMuted, setMuted, setMusicEnabled, setMusicScene, unlockAudio } from "./audio";
import { createGame, HOUR_SKIES, hourLabel, type GameApi, type GameHud } from "./engine";

const EMPTY: GameHud = {
  phase: "loading",
  painted: 0,
  total: 6,
  theme: "sunny",
  countPop: null,
  countKey: 0,
  secondsLeft: null,
  level: 1,
  maxLevel: 12,
  hour: 1,
  skyFill: "#7ec8e3",
  cleared: 0,
  unlocked: 1,
  pen: "swipe",
  finished: false,
  dev: true,
  extrasOpen: false,
  tideBusy: false,
  asleep: false,
  wavesOn: true,
};

function AnalogClock({
  hour,
  className = "size-10 shrink-0",
  numbered = false,
}: {
  hour: number;
  className?: string;
  numbered?: boolean;
}) {
  const deg = (hour % 12) * 30;
  const rad = ((deg - 90) * Math.PI) / 180;
  const hx = 50 + Math.cos(rad) * 22;
  const hy = 50 + Math.sin(rad) * 22;
  const nums = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="46" fill="#fff6e8" stroke="#e8c07a" strokeWidth="5" />
      {numbered
        ? nums.map((n, i) => {
            const a = ((i * 30 - 90) * Math.PI) / 180;
            return (
              <text
                key={n}
                x={50 + Math.cos(a) * 33}
                y={50 + Math.sin(a) * 33}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#3a2a22"
                fontSize={n % 3 === 0 ? 13 : 10}
                fontWeight={700}
                fontFamily="Fredoka, ui-rounded, sans-serif"
              >
                {n}
              </text>
            );
          })
        : nums.map((_, n) => {
            const a = ((n * 30 - 90) * Math.PI) / 180;
            const inner = n % 3 === 0 ? 32 : 37;
            return (
              <line
                key={n}
                x1={50 + Math.cos(a) * inner}
                y1={50 + Math.sin(a) * inner}
                x2={50 + Math.cos(a) * 41}
                y2={50 + Math.sin(a) * 41}
                stroke="#6b5348"
                strokeWidth={n % 3 === 0 ? 4 : 2.2}
                strokeLinecap="round"
              />
            );
          })}
      <line x1="50" y1="50" x2="50" y2="22" stroke="#3a2a22" strokeWidth="3.2" strokeLinecap="round" />
      <line x1="50" y1="50" x2={hx} y2={hy} stroke="#e85d4c" strokeWidth="5" strokeLinecap="round" />
      <circle cx="50" cy="50" r="4.5" fill="#3a2a22" />
    </svg>
  );
}

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const apiRef = useRef<GameApi | null>(null);
  const [hud, setHud] = useState<GameHud>(EMPTY);
  const [muted, setMutedUi] = useState(false);
  const [music, setMusicUi] = useState(() => loadSettings().music);
  const [dark, setDark] = useState(() => loadSettings().darkMode);
  const [popOn, setPopOn] = useState(false);
  const [loadout, setLoadout] = useState(false);
  const [cinema, setCinema] = useState(false);
  const [kit, setKit] = useState(() => loadSettings());
  const [showIntro, setShowIntro] = useState(false);
  const [showBedtime, setShowBedtime] = useState(false);
  const [parentReady, setParentReady] = useState(false);
  const [slowLoad, setSlowLoad] = useState(false);

  useEffect(() => {
    installAppBack();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const api = createGame(canvas, {
      onHud: setHud,
      getSettings: loadSettings,
    });
    apiRef.current = api;
    setMusicEnabled(loadSettings().music);
    applyTheme(loadSettings().darkMode);
    return () => {
      api.destroy();
      apiRef.current = null;
    };
  }, []);

  useEffect(() => {
    return pushBack(() => {
      if (showIntro) {
        finishIntro();
        return true;
      }
      if (showBedtime) {
        finishBedtime();
        return true;
      }
      if (loadout) {
        setLoadout(false);
        return true;
      }
      if (cinema) {
        setCinema(false);
        return true;
      }
      if (hud.phase === "playing" || hud.phase === "won" || hud.phase === "timesup") {
        goMenu();
        return true;
      }
      if (hud.phase === "sleep" && hud.dev) {
        apiRef.current?.wake();
        return true;
      }
      return false;
    });
  }, [showIntro, showBedtime, loadout, cinema, hud.phase, hud.dev]);

  useEffect(() => {
    if (hud.phase !== "loading") {
      setSlowLoad(false);
      return;
    }
    const t = window.setTimeout(() => setSlowLoad(true), 280);
    return () => window.clearTimeout(t);
  }, [hud.phase]);

  useEffect(() => {
    if (hud.countPop == null) return;
    setPopOn(true);
    const t = window.setTimeout(() => setPopOn(false), 700);
    return () => window.clearTimeout(t);
  }, [hud.countKey, hud.countPop]);

  useEffect(() => {
    if (hud.phase === "loading") return;
    if (hud.dev) {
      setShowIntro(false);
      return;
    }
    if (hud.asleep) return;
    try {
      if (window.localStorage.getItem("crabby-beach-intro-seen-v1") !== "1") {
        setShowIntro(true);
      }
    } catch {
      setShowIntro(true);
    }
  }, [hud.phase, hud.asleep, hud.dev]);

  useEffect(() => {
    if (hud.phase === "playing" || hud.phase === "won" || hud.phase === "timesup") {
      setMusicScene("game");
    } else if (hud.phase === "sleep" || showBedtime || showIntro) {
      setMusicScene("quiet");
    } else {
      setMusicScene("menu");
    }
  }, [hud.phase, showBedtime, showIntro]);

  useEffect(() => {
    if (hud.phase === "won" && hud.hour >= hud.maxLevel && !hud.dev) {
      setShowBedtime(true);
    }
  }, [hud.phase, hud.hour, hud.maxLevel, hud.dev]);

  function play() {
    unlockAudio();
    setMusicEnabled(loadSettings().music);
    apiRef.current?.start();
  }

  function playHour(n: number) {
    unlockAudio();
    setMusicEnabled(loadSettings().music);
    apiRef.current?.playLevel(n);
  }

  function goMenu() {
    setLoadout(false);
    setCinema(false);
    apiRef.current?.goMenu();
  }

  function finishBedtime() {
    setShowBedtime(false);
    setParentReady(false);
    if (cinema) return;
    apiRef.current?.goSleep();
  }

  function finishIntro() {
    try {
      window.localStorage.setItem("crabby-beach-intro-seen-v1", "1");
    } catch {
      /* private mode */
    }
    setShowIntro(false);
  }

  function equip(patch: Partial<typeof kit>) {
    if (!hud.extrasOpen && (patch.pen === "auto" || (patch.color && patch.color !== "red") || (patch.hat && patch.hat !== "none"))) {
      return;
    }
    const next = { ...kit, ...patch };
    setKit(next);
    saveSettings(next);
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

  function toggleDark() {
    const next = !dark;
    setDark(next);
    saveSettings({ ...loadSettings(), darkMode: next, darkModeChosen: true });
  }

  function toggleMusic() {
    const next = !music;
    setMusicUi(next);
    saveSettings({ ...loadSettings(), music: next });
    setMusicEnabled(next);
    if (next) unlockAudio();
  }

  const timerLabel =
    hud.secondsLeft == null
      ? null
      : `${Math.floor(hud.secondsLeft / 60)}:${String(hud.secondsLeft % 60).padStart(2, "0")}`;

  const inGame = hud.phase === "playing" || hud.phase === "won" || hud.phase === "timesup";
  const nightBg = hud.phase === "sleep" || showBedtime || cinema ? { background: "#0c1428" } : undefined;

  return (
    <div className="flex h-full min-h-[100vh] w-full justify-center overflow-hidden bg-sand" style={inGame ? { background: hud.skyFill } : nightBg}>
      <div
        className="relative h-full min-h-[100vh] w-full max-w-[28rem] overflow-hidden bg-sand text-ink"
        style={inGame ? { background: hud.skyFill } : nightBg}
      >
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 h-full w-full touch-none select-none ${inGame ? "" : "invisible"}`}
        aria-label="Crabby walking on the beach"
      />

      {inGame && (
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col gap-1.5 px-3 pb-2 pt-[max(0.55rem,env(safe-area-inset-top))]">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col items-start gap-1">
            <div className="flex items-center gap-2 rounded-pill bg-cream/90 py-1 pr-3 pl-1 shadow-md shadow-ink/10 ring-2 ring-cream-soft">
              <AnalogClock hour={hud.hour} numbered className="size-14 shrink-0" />
              <div>
                <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">{hourLabel(hud.hour)}</p>
                <p className="text-base leading-none font-bold tabular-nums">
                  {hud.level}
                  <span className="text-ink-soft"> / {hud.maxLevel}</span>
                </p>
                {hud.phase === "playing" || hud.phase === "won" ? (
                  <p className="text-[11px] font-bold tracking-wide text-ink-soft uppercase">
                    {hud.painted >= hud.total ? "All colored" : `${hud.total - hud.painted} left`}
                  </p>
                ) : null}
              </div>
            </div>
            {hud.phase === "playing" && (
              <button
                type="button"
                onClick={() => apiRef.current?.setWaves(!hud.wavesOn)}
                className="pointer-events-auto inline-flex min-h-9 items-center gap-1.5 rounded-pill bg-cream/90 px-3 text-sm font-bold text-ink shadow-md shadow-ink/10 ring-2 ring-cream-soft"
                aria-pressed={hud.wavesOn}
                aria-label={hud.wavesOn ? "Turn waves off" : "Turn waves on"}
              >
                <Waves className="size-4" />
                {hud.wavesOn ? "Waves on" : "Waves off"}
              </button>
            )}
          </div>
          <div className="pointer-events-auto flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5">
          {timerLabel && (
            <div className="flex items-center gap-1 rounded-pill bg-cream/90 px-3 py-2 text-sm font-bold shadow-md shadow-ink/10 ring-2 ring-cream-soft">
              <Timer className="size-4" />
              {timerLabel}
            </div>
          )}
          <button
            type="button"
            onClick={toggleDark}
            className="grid size-11 place-items-center rounded-pill bg-cream/90 text-ink shadow-md shadow-ink/10 ring-2 ring-cream-soft"
            aria-label={dark ? "Turn dark mode off" : "Turn dark mode on"}
          >
            {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>
          <button
            type="button"
            onClick={toggleMute}
            className="grid size-11 place-items-center rounded-pill bg-cream/90 text-ink shadow-md shadow-ink/10 ring-2 ring-cream-soft"
            aria-label={muted ? "Unmute sounds" : "Mute sounds"}
          >
            {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
          </button>
          {hud.phase === "playing" && (
            <button
              type="button"
              onClick={goMenu}
              className="grid size-11 place-items-center rounded-pill bg-cream/90 text-ink shadow-md shadow-ink/10 ring-2 ring-cream-soft"
              aria-label="Back to menu"
            >
              <Home className="size-5" />
            </button>
          )}
          <AuthChip />
            </div>
            <p className="rounded-pill bg-cream/90 px-2.5 py-0.5 text-xs font-bold tracking-wide text-ink shadow-md shadow-ink/10 ring-2 ring-cream-soft">
              {APP_VERSION}{hud.dev ? " · DEV" : ""}
            </p>
          </div>
        </div>
        {(hud.phase === "playing" || hud.phase === "won") && (
          <div className="sky-bar relative h-2 overflow-hidden rounded-pill bg-cream/80 shadow-sm ring-1 ring-cream-soft">
            <div
              className="sky-bar-clip absolute inset-y-0 left-0 overflow-hidden rounded-pill"
              style={{ width: `${hud.total ? (hud.painted / hud.total) * 100 : 0}%` }}
            >
              <div className="sky-bar-fill" />
            </div>
          </div>
        )}
      </header>
      )}

      {popOn && hud.countPop != null && (
        <div
          key={hud.countKey}
          className="count-pop pointer-events-none absolute top-1/3 left-1/2 z-30 -translate-x-1/2 text-7xl font-bold text-cream drop-shadow-md sm:text-8xl"
        >
          {hud.countPop}
        </div>
      )}

      {hud.phase === "playing" && hud.painted === 0 && hud.hour === 1 && (
        <p className="pointer-events-none absolute bottom-32 left-1/2 z-10 w-[min(92%,20rem)] -translate-x-1/2 rounded-pill bg-cream/90 px-4 py-2.5 text-center text-sm font-semibold text-ink shadow-md shadow-ink/10 ring-2 ring-cream-soft">
          {hud.pen === "auto" ? "Tap a paint can or a white shell" : "Tap a shell so Crabby walks over, then paint"}
        </p>
      )}

      {slowLoad && hud.phase === "loading" && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-sky">
          <div className="rounded-card bg-cream px-8 py-6 text-center shadow-lg shadow-ink/10">
            <p className="text-2xl font-bold">Crabby Beach</p>
            <p className="mt-1 text-ink-soft">Warming up the sand…</p>
          </div>
        </div>
      )}

      {hud.phase === "sleep" && (
        <SleepScreen
          parentReady={parentReady}
          dev={hud.dev}
          onParents={() => {
            if (window.confirm("Are you sure? This is for grown-ups.")) {
              setParentReady(true);
            }
          }}
          onReset={() => {
            setParentReady(false);
            apiRef.current?.resetProgress();
          }}
          onWake={() => {
            setParentReady(false);
            apiRef.current?.wake();
          }}
        />
      )}

      {hud.phase === "menu" && !loadout && !cinema && (
        <div className="menu-sky absolute inset-0 z-30 flex flex-col overflow-y-auto">
          <div className="menu-sun" aria-hidden="true" />
          <div className="relative z-10 flex items-center justify-between px-4 pt-[max(1.1rem,env(safe-area-inset-top))]">
            <p className="rounded-pill bg-cream px-3 py-1 text-sm font-bold tracking-wide text-ink shadow-md shadow-ink/10 ring-2 ring-cream-soft">
              {APP_VERSION}{hud.dev ? " · DEV" : ""}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleDark}
                className="grid size-12 place-items-center rounded-pill bg-cream text-ink shadow-md shadow-ink/10 ring-2 ring-cream-soft"
                aria-label={dark ? "Turn dark mode off" : "Turn dark mode on"}
              >
                {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
              </button>
              <button
                type="button"
                onClick={toggleMusic}
                className="grid size-12 place-items-center rounded-pill bg-cream text-ink shadow-md shadow-ink/10 ring-2 ring-cream-soft"
                aria-label={music ? "Turn beach music off" : "Turn beach music on"}
              >
                <Music2 className={`size-5 ${music ? "" : "opacity-40"}`} />
              </button>
              <button
                type="button"
                onClick={toggleMute}
                className="grid size-12 place-items-center rounded-pill bg-cream text-ink shadow-md shadow-ink/10 ring-2 ring-cream-soft"
                aria-label={muted ? "Unmute sounds" : "Mute sounds"}
              >
                {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
              </button>
            </div>
          </div>
          <div className="relative z-10 mx-auto flex w-full max-w-sm flex-1 flex-col px-4 pb-2 text-center">
            <p className="mt-3 text-sm font-semibold tracking-wide text-sky-deep uppercase">From 1pm to midnight</p>
            <h1 className="mt-1 text-[2.4rem] leading-none font-bold tracking-tight text-coral drop-shadow-[0_2px_0_rgba(255,246,232,0.8)]">
              Crabby Beach
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">Pick an hour. Finish it to open the next one.</p>
            <div className="mt-4 rounded-[1.75rem] bg-cream/95 p-3 shadow-lg shadow-ink/10 ring-4 ring-cream-soft">
              <div className="grid grid-cols-3 gap-2">
                {HOUR_SKIES.map((sky, i) => {
                  const hour = i + 1;
                  const open = hour <= hud.unlocked;
                  const done = hour <= hud.cleared;
                  return (
                    <button
                      key={hour}
                      type="button"
                      disabled={!open}
                      onClick={() => playHour(hour)}
                      className="relative flex min-h-[4.5rem] flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-2 shadow-sm ring-2 disabled:cursor-not-allowed"
                      style={
                        open
                          ? { background: sky, color: hour >= 7 ? "#fff6e8" : "#3a2a22", boxShadow: "inset 0 0 0 2px rgba(255,246,232,0.55)" }
                          : { background: "#efe0c8", color: "#8a7468" }
                      }
                      aria-label={open ? hourLabel(hour) : `${hourLabel(hour)} locked`}
                    >
                      {open ? (
                        <AnalogClock hour={hour} className="size-8" />
                      ) : (
                        <Lock className="size-5 opacity-70" />
                      )}
                      <span className="text-sm font-bold">{hourLabel(hour)}</span>
                      {done && (
                        <span className="absolute top-1 right-1 grid size-5 place-items-center rounded-full bg-mint text-cream">
                          <Check className="size-3.5" strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              type="button"
              onClick={play}
              className="mt-4 min-h-14 w-full rounded-pill bg-coral px-6 py-3 text-lg font-bold text-cream shadow-md shadow-coral-deep/30 hover:bg-coral-deep"
            >
              Play {hourLabel(hud.unlocked)}
            </button>
            <button
              type="button"
              onClick={() => setLoadout(true)}
              className="mt-2 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill bg-cream px-6 py-3 text-base font-bold text-ink ring-2 ring-sand-deep"
            >
              <Palette className="size-5" />
              Loadout
            </button>
            <button
              type="button"
              onClick={() => setCinema(true)}
              className="mt-2 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill bg-cream px-6 py-3 text-base font-bold text-ink ring-2 ring-sand-deep"
            >
              <Clapperboard className="size-5" />
              Cinema
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Reset all hours? You'll start at 1pm again.")) {
                  apiRef.current?.resetProgress();
                }
              }}
              className="mt-2 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill bg-cream px-6 py-3 text-base font-bold text-ink ring-2 ring-sand-deep"
            >
              <RotateCcw className="size-5" />
              Reset progress
            </button>
            {hud.dev && <p className="mt-2 text-xs font-bold tracking-wide text-coral uppercase">Dev mode on · all hours open</p>}
            {hud.dev && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => apiRef.current?.goSleep()}
                  className="min-h-12 col-span-2 rounded-pill bg-ink px-3 text-sm font-bold text-cream ring-2 ring-ink"
                >
                  Sleep screen
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => apiRef.current?.setDev(!hud.dev)}
              className={`mt-2 min-h-10 self-center rounded-pill px-4 text-sm font-bold ring-2 ${
                hud.dev ? "bg-coral text-cream ring-coral-deep" : "bg-cream/90 text-ink-soft ring-sand-deep"
              }`}
              aria-label={hud.dev ? "Turn off dev mode" : "Turn on dev mode"}
            >
              {hud.dev ? "Turn off dev mode" : "Turn on dev mode"}
            </button>
            <div className="relative mt-auto flex min-h-[7.5rem] items-end justify-center pt-3">
              <img
                src={assetUrl("game/shell-white-2.png")}
                alt=""
                className="absolute bottom-6 left-6 w-12 rotate-[-18deg] drop-shadow-md"
              />
              <img
                src={assetUrl("game/shell-white-4.png")}
                alt=""
                className="absolute right-8 bottom-8 w-11 rotate-[22deg] drop-shadow-md"
              />
              <img
                src={assetUrl("game/crabby/idle-green-0.png?v=051")}
                alt=""
                className="menu-crab relative z-10 w-28 drop-shadow-md"
              />
            </div>
            <Link
              to="/grownups"
              className="mt-1 mb-2 inline-block text-xs font-semibold tracking-wide text-ink-soft/70 uppercase hover:text-ink-soft"
            >
              Grown-ups
            </Link>
          </div>
        </div>
      )}

      {hud.phase === "menu" && cinema && (
        <CinemaLobby
          onIntro={() => {
            unlockAudio();
            setShowIntro(true);
          }}
          onBedtime={() => {
            unlockAudio();
            setShowBedtime(true);
          }}
          onBack={() => setCinema(false)}
        />
      )}

      {hud.phase === "menu" && loadout && (
        <LoadoutCard
          extrasOpen={hud.extrasOpen}
          kit={kit}
          onEquip={equip}
          onBack={() => setLoadout(false)}
        />
      )}

      {hud.phase === "won" && (hud.dev || hud.hour < hud.maxLevel) && (
        <div
          className="absolute inset-x-0 z-20 flex items-center px-3"
          style={{
            top: "max(9.4rem, calc(env(safe-area-inset-top) + 7.8rem))",
            bottom: "max(7.4rem, calc(env(safe-area-inset-bottom) + 6.6rem))",
          }}
        >
          <div className="max-h-full w-full overflow-y-auto rounded-card bg-cream px-5 py-5 text-center shadow-xl shadow-ink/20 ring-4 ring-mint">
            <p className="text-mint-deep text-sm font-semibold tracking-wide uppercase">
              {hud.level >= hud.maxLevel ? "12am · midnight" : hourLabel(hud.hour)}
            </p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-mint-deep sm:text-4xl">
              {hud.level >= hud.maxLevel ? "The shells lit up the night!" : "Yay! You found them all"}
            </h2>
            <p className="mt-3 text-base text-ink-soft">
              {hud.level >= hud.maxLevel
                ? hud.finished
                  ? "Loadout is open — auto-fill pen and new looks."
                  : "From 1pm to midnight. Want to start the afternoon again?"
                : `Next hour is ${hourLabel(hud.hour + 1)}. The sky gets a little darker.`}
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
              <button
                type="button"
                onClick={goMenu}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill bg-cream-soft px-6 py-3 text-base font-bold text-ink ring-2 ring-sand-deep hover:bg-sand"
              >
                <Home className="size-5" />
                Menu
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
              <button
                type="button"
                onClick={goMenu}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill bg-cream-soft px-6 py-3 text-base font-bold text-ink ring-2 ring-sand-deep hover:bg-sand"
              >
                <Home className="size-5" />
                Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {showIntro && !hud.asleep && (
        <IntroOverlay muted={muted} onMute={toggleMute} onDone={finishIntro} />
      )}
      {showBedtime && (
        <BedtimeOverlay muted={muted} onMute={toggleMute} onDone={finishBedtime} />
      )}

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

function KitPick<T extends string>({
  label,
  value,
  current,
  locked,
  onPick,
  swatch,
}: {
  label: string;
  value: T;
  current: T;
  locked: boolean;
  onPick: (v: T) => void;
  swatch?: string;
}) {
  const on = value === current && !locked;
  return (
    <button
      type="button"
      disabled={locked}
      onClick={() => onPick(value)}
      className={`relative inline-flex min-h-11 items-center justify-center gap-2 rounded-pill px-3 text-sm font-bold disabled:cursor-not-allowed ${
        on ? "bg-coral text-cream" : locked ? "bg-sand/70 text-ink-soft" : "bg-sand text-ink"
      }`}
      aria-label={locked ? `${label} locked` : label}
    >
      {swatch && <span className={`size-4 rounded-pill ${swatch} ring-2 ring-cream`} />}
      {label}
      {locked && <Lock className="size-3.5 opacity-80" />}
    </button>
  );
}

function CinemaLobby({
  onIntro,
  onBedtime,
  onBack,
}: {
  onIntro: () => void;
  onBedtime: () => void;
  onBack: () => void;
}) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col overflow-y-auto bg-[#120c18] text-[#fff6e8]">
      <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden="true">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#3a1020] to-transparent" />
        <div className="absolute inset-x-8 top-24 h-px bg-[#e8c07a]/40" />
      </div>
      <div className="relative z-10 mx-auto flex w-full max-w-sm flex-1 flex-col px-4 pt-[max(1.1rem,env(safe-area-inset-top))] pb-[max(1.1rem,env(safe-area-inset-bottom))]">
        <p className="text-center text-sm font-semibold tracking-[0.25em] text-[#e8c07a] uppercase">Now showing</p>
        <h1 className="mt-1 text-center text-4xl font-bold tracking-tight">Cinema</h1>
        <p className="mt-2 text-center text-sm text-[#d8c4b8]">Pick a picture.</p>
        <div className="mt-5 grid gap-4">
          <button
            type="button"
            onClick={onIntro}
            className="overflow-hidden rounded-[1.4rem] bg-[#1c1422] text-left shadow-lg ring-2 ring-[#e8c07a]/50"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-[#2a1c28]">
              <img src={assetUrl("game/crabby/idle-red-0.png?v=051")} alt="" className="absolute inset-0 m-auto h-[88%] object-contain" />
              <span className="absolute right-3 bottom-3 grid size-11 place-items-center rounded-full bg-coral text-cream shadow-md">
                <Play className="size-5" fill="currentColor" />
              </span>
            </div>
            <div className="px-4 py-3">
              <p className="text-xs font-semibold tracking-wide text-[#e8c07a] uppercase">Short</p>
              <p className="text-lg font-bold">Meet Crabby</p>
            </div>
          </button>
          <button
            type="button"
            onClick={onBedtime}
            className="overflow-hidden rounded-[1.4rem] bg-[#1c1422] text-left shadow-lg ring-2 ring-[#e8c07a]/50"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-[#0c1428]">
              <img src={assetUrl("game/crabby-sleep-0.png?v=075")} alt="" className="absolute inset-0 m-auto h-[95%] object-contain" />
              <span className="absolute right-3 bottom-3 grid size-11 place-items-center rounded-full bg-coral text-cream shadow-md">
                <Play className="size-5" fill="currentColor" />
              </span>
            </div>
            <div className="px-4 py-3">
              <p className="text-xs font-semibold tracking-wide text-[#e8c07a] uppercase">Short</p>
              <p className="text-lg font-bold">Night night</p>
            </div>
          </button>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="mt-auto inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill bg-cream px-6 py-3 text-base font-bold text-ink"
        >
          <Home className="size-5" />
          Back to hours
        </button>
      </div>
    </div>
  );
}

function LoadoutCard({
  extrasOpen,
  kit,
  onEquip,
  onBack,
}: {
  extrasOpen: boolean;
  kit: ReturnType<typeof loadSettings>;
  onEquip: (patch: Partial<ReturnType<typeof loadSettings>>) => void;
  onBack: () => void;
}) {
  return (
    <div className="menu-sky absolute inset-0 z-30 overflow-y-auto px-4 pt-[max(1.1rem,env(safe-area-inset-top))] pb-[max(1.1rem,env(safe-area-inset-bottom))]">
      <div className="menu-sun" aria-hidden="true" />
      <div className="relative z-10 mx-auto w-full max-w-sm text-center">
        <p className="text-sky-deep text-sm font-semibold tracking-wide uppercase">Your kit</p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight text-coral">Loadout</h2>
        <p className="mt-2 text-sm text-ink-soft">
          {extrasOpen ? "Pick a pen and how Crabby looks." : "Finish 12am to unlock extra pens and looks."}
        </p>

        <p className="mt-4 text-left text-sm font-bold">Pens</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <KitPick
            label="Swipe"
            value={"swipe" as PenId}
            current={kit.pen}
            locked={false}
            onPick={(pen) => onEquip({ pen })}
          />
          <KitPick
            label="Auto fill"
            value={"auto" as PenId}
            current={kit.pen}
            locked={!extrasOpen}
            onPick={(pen) => onEquip({ pen })}
          />
        </div>
        <p className="mt-2 text-left text-xs text-ink-soft">
          Swipe paints the shell. Auto fill paints it when Crabby touches it.
        </p>

        <p className="mt-4 text-left text-sm font-bold">Crabby</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <KitPick
            label="Red"
            value={"red" as CrabColor}
            current={kit.color}
            locked={false}
            onPick={(color) => onEquip({ color })}
            swatch="bg-coral"
          />
          <KitPick
            label="Blue"
            value={"blue" as CrabColor}
            current={kit.color}
            locked={!extrasOpen}
            onPick={(color) => onEquip({ color })}
            swatch="bg-sky-deep"
          />
          <KitPick
            label="Yellow"
            value={"yellow" as CrabColor}
            current={kit.color}
            locked={!extrasOpen}
            onPick={(color) => onEquip({ color })}
            swatch="bg-sand-deep"
          />
        </div>

        <p className="mt-4 text-left text-sm font-bold">Hats</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <KitPick
            label="None"
            value={"none" as CrabHat}
            current={kit.hat}
            locked={false}
            onPick={(hat) => onEquip({ hat })}
          />
          <KitPick
            label="Bow"
            value={"bow" as CrabHat}
            current={kit.hat}
            locked={!extrasOpen}
            onPick={(hat) => onEquip({ hat })}
          />
          <KitPick
            label="Bucket"
            value={"bucket" as CrabHat}
            current={kit.hat}
            locked={!extrasOpen}
            onPick={(hat) => onEquip({ hat })}
          />
          <KitPick
            label="Sailor"
            value={"sailor" as CrabHat}
            current={kit.hat}
            locked={!extrasOpen}
            onPick={(hat) => onEquip({ hat })}
          />
        </div>

        <button
          type="button"
          onClick={onBack}
          className="mt-5 min-h-14 w-full rounded-pill bg-coral px-6 py-3 text-lg font-bold text-cream"
        >
          Back to hours
        </button>
      </div>
    </div>
  );
}

function IntroOverlay({
  muted,
  onMute,
  onDone,
}: {
  muted: boolean;
  onMute: () => void;
  onDone: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [caption, setCaption] = useState("Hi! I'm Crabby!");

  useEffect(() => {
    const v = ref.current;
    if (v) v.muted = muted;
  }, [muted]);

  function captionAt(t: number) {
    if (t < 3.0) return "Hiii! I'm Crabby!";
    if (t < 6.0) return "Tap a white shell!";
    if (t < 10.0) return "Whoooosh! I will walk over!";
    if (t < 13.0) return "Paint it with your finger!";
    return "Yaaay! Let's play!";
  }

  function start() {
    unlockAudio();
    const v = ref.current;
    if (!v) return;
    v.muted = muted;
    void v.play();
    setPlaying(true);
  }

  return (
    <div className="absolute inset-0 z-50 bg-ink">
      <video
        ref={ref}
        src={assetUrl("game/intro.mp4?v=064")}
        playsInline
        className="h-full w-full object-contain bg-sand"
        onTimeUpdate={(e) => setCaption(captionAt(e.currentTarget.currentTime))}
        onEnded={onDone}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between px-3 pt-[max(0.8rem,env(safe-area-inset-top))]">
        <p className="rounded-pill bg-cream px-3 py-1 text-sm font-bold text-ink shadow-md">{APP_VERSION}</p>
        <button
          type="button"
          onClick={onMute}
          className="pointer-events-auto grid size-12 place-items-center rounded-pill bg-cream text-ink shadow-md"
          aria-label={muted ? "Unmute sounds" : "Mute sounds"}
        >
          {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
        </button>
      </div>
      {!playing && (
        <button
          type="button"
          onClick={start}
          className="absolute inset-0 z-10 grid place-items-center bg-ink/25"
          aria-label="Play intro"
        >
          <span className="rounded-pill bg-coral px-8 py-4 text-xl font-bold text-cream shadow-lg">
            Tap to meet Crabby
          </span>
        </button>
      )}
      {playing && (
        <p className="pointer-events-none absolute inset-x-3 top-[max(4.4rem,calc(env(safe-area-inset-top)+3.4rem))] z-10 rounded-pill bg-cream/95 px-4 py-2 text-center text-base font-bold leading-snug text-ink shadow-md sm:text-lg">
          {caption}
        </p>
      )}
      <button
        type="button"
        onClick={onDone}
        className="absolute inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-20 min-h-12 rounded-pill bg-cream/90 text-sm font-bold text-ink shadow-md"
      >
        Skip
      </button>
    </div>
  );
}

function BedtimeOverlay({
  muted,
  onMute,
  onDone,
}: {
  muted: boolean;
  onMute: () => void;
  onDone: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [caption, setCaption] = useState("Woohoo! You painted every shell!");

  useEffect(() => {
    const v = ref.current;
    if (v) v.muted = muted;
  }, [muted]);

  function captionAt(t: number) {
    if (t < 3.2) return "Woohoo! You painted every shell!";
    if (t < 6.0) return "That was the WHOLE day!";
    if (t < 9.0) return "I'm sooo sleepy now.";
    if (t < 12.0) return "We all need to get some sleep.";
    return "We can play again tomorrow. Night night!";
  }

  function start() {
    unlockAudio();
    const v = ref.current;
    if (!v) return;
    v.muted = muted;
    void v.play();
    setPlaying(true);
  }

  return (
    <div className="absolute inset-0 z-50 bg-[#0c1428]">
      <video
        ref={ref}
        src={assetUrl("game/bedtime.mp4?v=078")}
        playsInline
        className="h-full w-full object-contain bg-[#0c1428]"
        onTimeUpdate={(e) => setCaption(captionAt(e.currentTarget.currentTime))}
        onEnded={onDone}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between px-3 pt-[max(0.8rem,env(safe-area-inset-top))]">
        <p className="rounded-pill bg-cream px-3 py-1 text-sm font-bold text-ink shadow-md">{APP_VERSION}</p>
        <button
          type="button"
          onClick={onMute}
          className="pointer-events-auto grid size-12 place-items-center rounded-pill bg-cream text-ink shadow-md"
          aria-label={muted ? "Unmute sounds" : "Mute sounds"}
        >
          {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
        </button>
      </div>
      {!playing && (
        <button
          type="button"
          onClick={start}
          className="absolute inset-0 z-10 grid place-items-center bg-ink/30"
          aria-label="Play bedtime"
        >
          <span className="rounded-pill bg-coral px-8 py-4 text-xl font-bold text-cream shadow-lg">
            Tap for Crabby
          </span>
        </button>
      )}
      {playing && (
        <p className="pointer-events-none absolute inset-x-3 top-[max(4.4rem,calc(env(safe-area-inset-top)+3.4rem))] z-10 rounded-pill bg-cream/95 px-4 py-2 text-center text-base font-bold leading-snug text-ink shadow-md sm:text-lg">
          {caption}
        </p>
      )}
      <button
        type="button"
        onClick={onDone}
        className="absolute inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-20 min-h-12 rounded-pill bg-cream/90 text-sm font-bold text-ink shadow-md"
      >
        Night night
      </button>
    </div>
  );
}

function SleepingCrab() {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setFrame((n) => 1 - n), 900);
    return () => window.clearInterval(t);
  }, []);
  return (
    <img
      src={assetUrl(`game/crabby-sleep-${frame}.png?v=075`)}
      alt=""
      className="w-56 drop-shadow-lg"
    />
  );
}

function SleepScreen({
  parentReady,
  dev,
  onParents,
  onReset,
  onWake,
}: {
  parentReady: boolean;
  dev: boolean;
  onParents: () => void;
  onReset: () => void;
  onWake: () => void;
}) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-[#0c1428] text-[#fff6e8]">
      <button
        type="button"
        onClick={() => {
          if (parentReady) onReset();
        }}
        className="absolute z-50 rounded-full"
        style={{
          top: "max(0.35rem, env(safe-area-inset-top))",
          left: "0.35rem",
          width: parentReady ? 18 : 12,
          height: parentReady ? 18 : 12,
          opacity: parentReady ? 0.4 : 0.07,
          background: "#fff6e8",
        }}
        aria-label={parentReady ? "Reset the day" : undefined}
      />
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="text-sm font-semibold tracking-wide uppercase text-[#c8e4f8]">Midnight</p>
        <h1 className="mt-2 text-4xl font-bold">Night night</h1>
        <p className="mt-3 text-base text-[#d8ecff]">Crabby is sleeping. Play again tomorrow.</p>
        <div className="relative mt-10">
          <SleepingCrab />
        </div>
        {parentReady && (
          <p className="mt-8 max-w-xs rounded-pill bg-[#1a2a4a] px-4 py-2 text-sm font-semibold text-[#fff6e8]">
            Tap the tiny button in the top-left corner to reset.
          </p>
        )}
        {dev && (
          <button
            type="button"
            onClick={onWake}
            className="mt-6 min-h-12 rounded-pill bg-coral px-6 text-sm font-bold text-cream"
          >
            Wake (dev)
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onParents}
        className="mb-[max(1rem,env(safe-area-inset-bottom))] self-center text-[11px] font-semibold tracking-wide text-[#8aa0c8]/50 uppercase"
      >
        Grown-ups
      </button>
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
