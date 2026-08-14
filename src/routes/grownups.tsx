import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, FileText, FolderArchive, Smartphone, Package } from "lucide-react";
import { APP_NAME, APP_VERSION, DOWNLOADS } from "@/lib/version";

export const Route = createFileRoute("/grownups")({ component: Grownups });

type Pack = {
  title: string;
  blurb: string;
  filename: string;
  ready: boolean;
  icon: typeof FileText;
  note?: string;
};

const PACKS: Pack[] = [
  {
    title: "Code only",
    blurb: "One Markdown file with the source for reading, searching, and review. Not playable.",
    filename: DOWNLOADS.codeOnly,
    ready: true,
    icon: FileText,
  },
  {
    title: "Code + assets",
    blurb: "Full project tree, including art and config, for an offline rebuild.",
    filename: DOWNLOADS.codebase,
    ready: false,
    icon: FolderArchive,
    note: "Ask me to export this zip when you want it.",
  },
  {
    title: "Portable app",
    blurb: "Playable offline snapshot. Unzip and open — no install, no network.",
    filename: DOWNLOADS.portable,
    ready: false,
    icon: Package,
    note: "Ask me to export this zip when you want it.",
  },
  {
    title: "Android project",
    blurb: "Android project plus a build readme. A signed APK needs a local Android SDK.",
    filename: DOWNLOADS.android,
    ready: false,
    icon: Smartphone,
    note: "No fake APK. Ask me for the android-project zip when you want to build one.",
  },
];

function Grownups() {
  return (
    <main className="min-h-dvh bg-sand text-ink">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
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
            Downloads and version notes. Kids stay on the beach — this page is just for you.
          </p>
          <p className="mt-3 inline-flex rounded-pill bg-cream px-3 py-1 text-sm font-semibold">
            Current version {APP_VERSION}
          </p>
        </header>

        <section className="mt-8" aria-labelledby="downloads-heading">
          <h2 id="downloads-heading" className="text-xl font-bold">
            Downloads
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Ready files save to your device. Right-click still works. Zip packages are built only when you ask.
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

        <section className="mt-10" aria-labelledby="offline-heading">
          <h2 id="offline-heading" className="text-xl font-bold">
            Offline
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-soft">
            <li>Play works without the internet — pictures, sounds, and progress stay on the device.</li>
            <li>If spoken praise is not available, the words still appear on screen.</li>
            <li>Snapshots do not update themselves. Ask when you want a new export.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
