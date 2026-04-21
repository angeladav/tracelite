import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="text-sm font-medium text-tl-text-secondary hover:text-tl-text-primary"
      >
        ← Home
      </Link>
      <div>
        <h1 className="text-3xl font-semibold text-tl-text-primary">Pricing</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-tl-text-secondary">
          Plans and limits will live here. This page matches the marketing layout
          and TraceLite dark theme from the design brief.
        </p>
      </div>
      <div className="rounded-lg border border-tl-border bg-tl-card p-6">
        <p className="text-sm text-tl-text-secondary">
          Contact or upgrade CTAs can replace this placeholder when billing is
          ready.
        </p>
      </div>
    </div>
  );
}
