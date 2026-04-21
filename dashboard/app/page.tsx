import Link from "next/link";

const btnPrimary =
  "inline-flex h-10 items-center justify-center rounded-lg bg-tl-accent px-4 text-sm font-medium text-white transition-colors hover:bg-tl-accent-hover";
const btnGhost =
  "inline-flex h-10 items-center justify-center rounded-lg border border-tl-border px-4 text-sm font-medium text-tl-text-secondary transition-colors hover:bg-tl-card-hover hover:text-tl-text-primary";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-tl-bg px-6 py-20">
      <main className="w-full max-w-lg space-y-8 rounded-lg border border-tl-border bg-tl-card p-10">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-tl-text-secondary">
            TraceLite
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-tl-text-primary">
            API observability
          </h1>
          <p className="mt-2 text-sm leading-6 text-tl-text-secondary">
            Request volume, errors, latency, and per-endpoint breakdowns — a
            minimal dashboard for developers.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {/* <Link href="/orgs" className={btnPrimary}>
            Open dashboard
          </Link> */}
          <Link href="/login" className={btnGhost}>
            Log in
          </Link>
          <Link href="/signup" className={btnGhost}>
            Sign up
          </Link>
          <Link href="/pricing" className={btnGhost}>
            Pricing
          </Link>
        </div>
      </main>
    </div>
  );
}
