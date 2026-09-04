import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Home, Lock, Palette, RotateCcw, Timer, UserRound, Volume2, VolumeX } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { loadSettings, saveSettings, type CrabColor, type CrabHat, type PenId } from "@/lib/settings";
import { APP_VERSION } from "@/lib/version";
import { assetUrl } from "@/lib/asset";
import { isMuted, setMuted, setMusicEnabled, unlockAudio } from "./audio";
import { createGame, HOUR_SKIES, type GameApi, type GameHud } from "./engine";

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
  cleared: 0,
  unlocked: 1,
  pen: "swipe",
  finished: false,
  dev: false,
  extrasOpen: false,
};

function AnalogClock({ hour, className = "size-10 shrink-0" }: { hour: number; className?: string }) {
  const deg = (hour % 12) * 30;
  const rad = ((deg - 90) * Math.PI) / 180;
  const hx = 20 + Math.cos(rad) * 9;
  const hy = 20 + Math.sin(rad) * 9;
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
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
  const [loadout, setLoadout] = useState(false);
  const [kit, setKit] = useState(() => loadSettings());

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

  function playHour(n: number) {
    unlockAudio();
    setMusicEnabled(loadSettings().music);
    apiRef.current?.playLevel(n);
  }

  function goMenu() {
    setLoadout(false);
    apiRef.current?.goMenu();
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

  const timerLabel =
    hud.secondsLeft == null
      ? null
      : `${Math.floor(hud.secondsLeft / 60)}:${String(hud.secondsLeft % 60).padStart(2, "0")}`;

  const inGame = hud.phase === "playing" || hud.phase === "won" || hud.phase === "timesup";

  return (
    <div className="flex h-dvh w-full justify-center overflow-hidden bg-sand" style={inGame ? { background: hud.skyFill } : undefined}>
      <div
        className="relative h-dvh w-full max-w-[28rem] overflow-hidden bg-sand text-ink"
        style={inGame ? { background: hud.skyFill } : undefined}
      >
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 h-full w-full touch-none select-none ${inGame ? "" : "invisible"}`}
        aria-label="Crabby walking on the beach"
      />

      {inGame && (
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
          {hud.phase === "playing" && (
            <button
              type="button"
              onClick={goMenu}
              className="grid size-12 place-items-center rounded-pill bg-cream/90 text-ink shadow-md shadow-ink/10 ring-2 ring-cream-soft"
              aria-label="Back to menu"
            >
              <Home className="size-5" />
            </button>
          )}
          <AuthChip />
        </div>
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

      {(hud.phase === "playing" || hud.phase === "won") && (
        <div
          className="pointer-events-none absolute left-3 right-3 z-30"
          style={{ top: "max(7.1rem, calc(env(safe-area-inset-top) + 5.6rem))" }}
        >
          <div className="sky-bar relative h-8 overflow-hidden rounded-pill bg-cream/90 shadow-md shadow-ink/10 ring-2 ring-cream-soft">
            <div
              className="sky-bar-clip absolute inset-y-0 left-0 overflow-hidden rounded-pill"
              style={{ width: `${hud.total ? (hud.painted / hud.total) * 100 : 0}%` }}
            >
              <div className="sky-bar-fill" />
            </div>
            <p className="absolute inset-0 grid place-items-center text-sm font-bold text-ink drop-shadow-[0_1px_0_rgba(255,246,232,0.8)]">
              {hud.painted >= hud.total ? "All colored!" : `${hud.total - hud.painted} left`}
            </p>
          </div>
        </div>
      )}

      {hud.phase === "playing" && hud.painted === 0 && (
        <p className="pointer-events-none absolute bottom-32 left-1/2 z-10 w-[min(92%,20rem)] -translate-x-1/2 rounded-pill bg-cream/90 px-4 py-2.5 text-center text-sm font-semibold text-ink shadow-md shadow-ink/10 ring-2 ring-cream-soft">
          {hud.pen === "auto" ? "Tap a paint can or a white shell" : "Tap a shell so Crabby walks over, then paint"}
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

      {hud.phase === "menu" && !loadout && (
        <div className="menu-sky absolute inset-0 z-30 flex flex-col overflow-y-auto">
          <div className="menu-sun" aria-hidden="true" />
          <div className="relative z-10 flex items-center justify-between px-4 pt-[max(1.1rem,env(safe-area-inset-top))]">
            <p className="rounded-pill bg-cream px-3 py-1 text-sm font-bold tracking-wide text-ink shadow-md shadow-ink/10 ring-2 ring-cream-soft">
              {APP_VERSION}{hud.dev ? " · DEV" : ""}
            </p>
            <button
              type="button"
              onClick={toggleMute}
              className="grid size-12 place-items-center rounded-pill bg-cream text-ink shadow-md shadow-ink/10 ring-2 ring-cream-soft"
              aria-label={muted ? "Unmute sounds" : "Mute sounds"}
            >
              {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
            </button>
          </div>
          <div className="relative z-10 mx-auto flex w-full max-w-sm flex-1 flex-col px-4 pb-2 text-center">
            <p className="mt-3 text-sm font-semibold tracking-wide text-sky-deep uppercase">Nine little hours</p>
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
                      aria-label={open ? `${hour}pm` : `${hour}pm locked`}
                    >
                      {open ? (
                        <AnalogClock hour={hour} className="size-8" />
                      ) : (
                        <Lock className="size-5 opacity-70" />
                      )}
                      <span className="text-sm font-bold">{hour}pm</span>
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
              Play {hud.unlocked}pm
            </button>
            <button
              type="button"
              onClick={() => setLoadout(true)}
              className="mt-2 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill bg-cream px-6 py-3 text-base font-bold text-ink ring-2 ring-sand-deep"
            >
              <Palette className="size-5" />
              Loadout
            </button>
            {hud.dev && <p className="mt-2 text-xs font-bold tracking-wide text-coral uppercase">Dev mode on · all hours open</p>}
            <button
              type="button"
              onClick={() => apiRef.current?.setDev(!hud.dev)}
              className={`mt-2 min-h-10 self-center rounded-pill px-4 text-sm font-bold ring-2 ${
                hud.dev ? "bg-coral text-cream ring-coral-deep" : "bg-cream/90 text-ink-soft ring-sand-deep"
              }`}
            >
              Dev {hud.dev ? "on" : "off"}
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
                src={assetUrl("game/crab-idle-1.png")}
                alt=""
                className="menu-crab relative z-10 w-28 drop-shadow-md"
              />
            </div>
            <Link
              to="/grownups"
              className="mt-1 mb-1 inline-block text-xs font-semibold tracking-wide text-ink-soft/70 uppercase hover:text-ink-soft"
            >
              Grown-ups
            </Link>
          </div>
        </div>
      )}

      {hud.phase === "menu" && loadout && (
        <LoadoutCard
          extrasOpen={hud.extrasOpen}
          kit={kit}
          onEquip={equip}
          onBack={() => setLoadout(false)}
        />
      )}

      {hud.phase === "won" && (
        <div
          className="absolute inset-x-0 z-20 flex items-center px-3"
          style={{
            top: "max(9.4rem, calc(env(safe-area-inset-top) + 7.8rem))",
            bottom: "max(7.4rem, calc(env(safe-area-inset-bottom) + 6.6rem))",
          }}
        >
          <div className="max-h-full w-full overflow-y-auto rounded-card bg-cream px-5 py-5 text-center shadow-xl shadow-ink/20 ring-4 ring-mint">
            <p className="text-mint-deep text-sm font-semibold tracking-wide uppercase">
              {hud.level >= hud.maxLevel ? "9pm · night" : `${hud.hour}pm`}
            </p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-mint-deep sm:text-4xl">
              {hud.level >= hud.maxLevel ? "The shells lit up the night!" : "Yay! You found them all"}
            </h2>
            <p className="mt-3 text-base text-ink-soft">
              {hud.level >= hud.maxLevel
                ? hud.finished
                  ? "Loadout is open — auto-fill pen and new looks."
                  : "From 1pm to 9pm. Want to start the afternoon again?"
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

      {inGame && (
      <p className="pointer-events-none absolute top-[4.6rem] right-3 z-10 rounded-pill bg-cream px-3 py-1 text-sm font-bold tracking-wide text-ink shadow-md shadow-ink/10 ring-2 ring-cream-soft">
        {APP_VERSION}{hud.dev ? " · DEV" : ""}
      </p>
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
          {extrasOpen ? "Pick a pen and how Crabby looks." : "Finish 9pm to unlock extra pens and looks."}
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
