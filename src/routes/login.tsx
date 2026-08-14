import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="grid min-h-dvh place-items-center bg-sky px-4 py-10 text-ink">
      <div className="w-full max-w-sm rounded-card bg-cream p-7 shadow-xl shadow-ink/10 ring-4 ring-cream-soft">
        <p className="text-sm font-semibold tracking-wide text-ink-soft uppercase">Grown-ups</p>
        <h1 className="mt-1 text-3xl font-bold text-coral">Sign in</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Save your family’s sunny beach. Little ones can keep playing without an account.
        </p>
        <div className="mt-5 space-y-3">
          {authEnabled ? (
            GROK_PROVIDERS.map((p) => (
              <button
                key={p.providerId}
                type="button"
                onClick={() => signIn(p.providerId, { callbackURL: "/" })}
                className="min-h-12 w-full rounded-pill bg-coral px-4 py-3 font-semibold text-cream hover:bg-coral-deep"
              >
                Continue with {p.label}
              </button>
            ))
          ) : (
            <p className="text-sm text-ink-soft">Sign-in is disabled.</p>
          )}
        </div>
        <Link
          to="/"
          className="mt-5 block text-center text-sm font-semibold text-ocean hover:text-ink"
        >
          Back to the beach
        </Link>
      </div>
    </main>
  );
}
