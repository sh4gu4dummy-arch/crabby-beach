import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, FileText, FolderArchive, Package, Smartphone } from "lucide-react";
import {
  loadSettings,
  saveSettings,
  type CrabColor,
  type CrabHat,
  type GrownupSettings,
  type TimerMinutes,
} from "@/lib/settings";
import { loadProgress, saveProgress } from "@/lib/progress";
import { APP_NAME, APP_VERSION } from "@/lib/version";
import { EXPORTS, type ExportFile } from "@/lib/exports";

export const Route = createFileRoute("/grownups")({ component: Grownups });

type Pack = {
  title: string;
  blurb: string;
  filename: string;
  version?: string;
  ready: boolean;
  icon: typeof FileText;
  note?: string;
};

function pack(kind: keyof typeof EXPORTS, extra: Omit<Pack, "filename" | "ready" | "version" | "note"> & { note?: string }): Pack {
  const hit: ExportFile | null = EXPORTS[kind];
  return {
    filename: hit?.file ?? "(not built)",
    version: hit?.version,
    ready: Boolean(hit),
    note: hit ? undefined : "Ask me to export this when you want it.",
    ...extra,
  };
}

const PACKS: Pack[] = [
  pack("codeOnly", {
    title: "Code only",
    blurb: "One Markdown file with the source for reading, searching, and review. Not playable.",
    icon: FileText,
  }),
  pack("codebase", {
    title: "Code + assets",
    blurb: "Full project tree, including art and config, for an offline rebuild.",
    icon: FolderArchive,
  }),
  pack("portable", {
    title: "Portable app",
    blurb: "Playable offline snapshot. Unzip and open index.html — no install, no network.",
    icon: Package,
  }),
  pack("android", {
    title: "Android project",
    blurb: "Android Studio project with the game inside, if you want to rebuild.",
    icon: Smartphone,
  }),
  pack("apk", {
    title: "Android APK",
    blurb: "Installable APK. Allow unknown sources, then open the file on a phone.",
    icon: Smartphone,
  }),
];

function Choice<T extends string | number>({
  label,
  value,
  current,
  onPick,
  swatch,
}: {
  label: string;
  value: T;
  current: T;
  onPick: (v: T) => void;
  swatch?: string;
}) {
  const on = value === current;
  return (
    <button
      type="button"
      onClick={() => onPick(value)}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-pill px-4 text-sm font-bold ${
        on ? "bg-coral text-cream" : "bg-sand text-ink"
      }`}
    >
      {swatch && <span className={`size-4 rounded-pill ${swatch} ring-2 ring-cream`} />}
      {label}
    </button>
  );
}

export function Grownups() {
  const [settings, setSettings] = useState<GrownupSettings>(() => loadSettings());
  const [progress, setProgress] = useState(() => loadProgress());

  function update(patch: Partial<GrownupSettings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
  }

  function updateProgress(patch: Partial<typeof progress>) {
    const next = { ...progress, ...patch };
    setProgress(next);
    saveProgress(next);
  }

  return (
    <main className="min-h-dvh bg-sand text-ink">
      <div className="mx-auto max-w-md px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-5">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center gap-2 rounded-pill bg-cream px-4 text-sm font-semibold text-ink shadow-md shadow-ink/10"
        >
          <ArrowLeft className="size-4" />
          Back to the beach
        </Link>

        <header className="mt-8">
          <p className="text-sky-deep text-sm font-semibold tracking-wide uppercase">Grown-ups</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{APP_NAME}</h1>
          <p className="mt-2 text-ink-soft">
            Pick how Crabby looks and how play feels. Extra pens and skins unlock in Loadout after 12am.
          </p>
          <p className="mt-3 inline-flex rounded-pill bg-cream px-3 py-1 text-sm font-semibold">
            Current version {APP_VERSION}
          </p>
        </header>

        <section className="mt-8" aria-labelledby="looks-heading">
          <h2 id="looks-heading" className="text-xl font-bold">
            Crabby’s look
          </h2>
          <p className="mt-1 text-sm text-ink-soft">Saved on this device. Kids just play.</p>
          <p className="mt-4 text-sm font-semibold">Color</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Choice
              label="Red"
              value={"red" as CrabColor}
              current={settings.color}
              onPick={(color) => update({ color })}
              swatch="bg-coral"
            />
            <Choice
              label="Blue"
              value={"blue" as CrabColor}
              current={settings.color}
              onPick={(color) => update({ color })}
              swatch="bg-sky-deep"
            />
            <Choice
              label="Yellow"
              value={"yellow" as CrabColor}
              current={settings.color}
              onPick={(color) => update({ color })}
              swatch="bg-sand-deep"
            />
          </div>
          <p className="mt-4 text-sm font-semibold">Hat</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Choice label="None" value={"none" as CrabHat} current={settings.hat} onPick={(hat) => update({ hat })} />
            <Choice label="Bow" value={"bow" as CrabHat} current={settings.hat} onPick={(hat) => update({ hat })} />
            <Choice
              label="Bucket"
              value={"bucket" as CrabHat}
              current={settings.hat}
              onPick={(hat) => update({ hat })}
            />
            <Choice
              label="Sailor"
              value={"sailor" as CrabHat}
              current={settings.hat}
              onPick={(hat) => update({ hat })}
            />
          </div>
        </section>

        <section className="mt-8" aria-labelledby="play-heading">
          <h2 id="play-heading" className="text-xl font-bold">
            Play
          </h2>
          <p className="mt-1 text-sm text-ink-soft">How many to find follows the clock: 1 at 1pm, up to 12 at midnight.</p>
          <p className="mt-4 text-sm font-semibold">Voice counts</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Choice
              label="On"
              value={"on"}
              current={settings.voiceCounts ? "on" : "off"}
              onPick={() => update({ voiceCounts: true })}
            />
            <Choice
              label="Off"
              value={"off"}
              current={settings.voiceCounts ? "on" : "off"}
              onPick={() => update({ voiceCounts: false })}
            />
          </div>
          <p className="mt-4 text-sm font-semibold">Dark mode</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Choice
              label="Off"
              value={"off"}
              current={settings.darkMode ? "on" : "off"}
              onPick={() => update({ darkMode: false, darkModeChosen: true })}
            />
            <Choice
              label="On"
              value={"on"}
              current={settings.darkMode ? "on" : "off"}
              onPick={() => update({ darkMode: true, darkModeChosen: true })}
            />
          </div>
          <p className="mt-4 text-sm font-semibold">Music</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Choice
              label="On"
              value={"on"}
              current={settings.music ? "on" : "off"}
              onPick={() => update({ music: true })}
            />
            <Choice
              label="Off"
              value={"off"}
              current={settings.music ? "on" : "off"}
              onPick={() => update({ music: false })}
            />
          </div>
          <p className="mt-4 text-sm font-semibold">Play timer</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {([
              [0, "Off"],
              [3, "3 min"],
              [5, "5 min"],
              [10, "10 min"],
            ] as Array<[TimerMinutes, string]>).map(([mins, label]) => (
              <Choice
                key={mins}
                label={label}
                value={mins}
                current={settings.timerMinutes}
                onPick={(timerMinutes) => update({ timerMinutes })}
              />
            ))}
          </div>
        </section>

        <section className="mt-8" aria-labelledby="dev-heading">
          <h2 id="dev-heading" className="text-xl font-bold">
            Dev
          </h2>
          <p className="mt-1 text-sm text-ink-soft">For trying pens, skins, and later hours without replaying the day.</p>
          <p className="mt-4 text-sm font-semibold">Dev mode</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Choice
              label="Off"
              value={"off"}
              current={progress.dev ? "on" : "off"}
              onPick={() => updateProgress({ dev: false, devChosen: true })}
            />
            <Choice
              label="On"
              value={"on"}
              current={progress.dev ? "on" : "off"}
              onPick={() => updateProgress({ dev: true, devChosen: true })}
            />
          </div>
          <p className="mt-4 text-sm font-semibold">Progress</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                saveProgress({ ...progress, cleared: 12, asleep: true });
                setProgress(loadProgress());
              }}
              className="inline-flex min-h-11 items-center justify-center rounded-pill bg-sand px-4 text-sm font-bold text-ink"
            >
              Finish the day
            </button>
            <button
              type="button"
              onClick={() => {
                saveProgress({ ...progress, cleared: 0, asleep: false });
                setProgress(loadProgress());
              }}
              className="inline-flex min-h-11 items-center justify-center rounded-pill bg-sand px-4 text-sm font-bold text-ink"
            >
              Reset hours
            </button>
          </div>
          <p className="mt-2 text-xs text-ink-soft">Cleared {progress.cleared} / 12. Dev on unlocks every hour and the whole loadout.</p>
        </section>

        <section className="mt-10" aria-labelledby="downloads-heading">
          <h2 id="downloads-heading" className="text-xl font-bold">
            Downloads
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Ready files save to your device. Right-click still works. These packages
            are a point-in-time snapshot. Play does not need the network.
          </p>
          <ul className="mt-4 grid gap-3">
            {PACKS.map((pack) => (
              <li key={pack.filename} className="rounded-card bg-cream p-4 shadow-md shadow-ink/10 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-pill bg-sand">
                    <pack.icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{pack.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">{pack.blurb}</p>
                    <p className="mt-2 truncate font-mono text-xs text-ink-soft">{pack.filename}</p>
                    {pack.ready && pack.version && pack.version !== APP_VERSION && (
                      <p className="mt-1 text-xs font-semibold text-ink-soft">
                        Last built {pack.version}. Game is {APP_VERSION}.
                      </p>
                    )}
                    {pack.ready ? (
                      <a
                        href={`/downloads/${pack.filename}`}
                        download={pack.filename}
                        className="mt-3 inline-flex min-h-11 items-center rounded-pill bg-coral px-4 text-sm font-bold text-cream hover:bg-coral-deep"
                      >
                        Download
                      </a>
                    ) : (
                      <p className="mt-3 text-sm font-semibold text-ink-soft">{pack.note}</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
