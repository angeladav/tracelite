import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { RequestVolumeChart } from "@/components/dashboard/request-volume-chart";
import { CopySnippetButton } from "./copy-snippet-button";

type Props = {
  searchParams: Promise<{ empty?: string }>;
};

const topEndpoints: { rank: number; path: string; count: number; max: number }[] =
  [
    { rank: 1, path: "/api/users", count: 8421, max: 8421 },
    { rank: 2, path: "/api/orders", count: 4102, max: 8421 },
    { rank: 3, path: "/api/products", count: 3890, max: 8421 },
    { rank: 4, path: "/api/auth/login", count: 2340, max: 8421 },
    { rank: 5, path: "/api/search", count: 1988, max: 8421 },
  ];

function StatusDistribution() {
  return (
    <div className="rounded-lg border border-tl-border bg-tl-card p-5">
      <h2 className="text-base font-semibold text-tl-text-primary">
        Status Distribution
      </h2>
      <div className="mt-5 h-3 w-full overflow-hidden rounded bg-tl-bg">
        <div className="flex h-full w-full">
          <div
            className="h-full bg-tl-success/90"
            style={{ width: "87%" }}
            title="2xx 87%"
          />
          <div className="h-full bg-tl-warning/90" style={{ width: "10%" }} />
          <div className="h-full bg-tl-error/90" style={{ width: "3%" }} />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-tl-text-secondary">
        <span className="inline-flex items-center gap-2">
          <span className="size-2 rounded-full bg-tl-success" />
          2xx — 87%
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-2 rounded-full bg-tl-warning" />
          4xx — 10%
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-2 rounded-full bg-tl-error" />
          5xx — 3%
        </span>
      </div>
    </div>
  );
}

function EmptyOverview() {
  const snippet = `curl -X POST https://api.tracelite.dev/v1/track \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"method":"GET","endpoint":"/api/users","statusCode":200,"latencyMs":42}'`;

  const copyText = `curl -X POST https://api.tracelite.dev/v1/track -H "X-API-Key: YOUR_API_KEY" -H "Content-Type: application/json" -d '{"method":"GET","endpoint":"/api/users","statusCode":200,"latencyMs":42}'`;

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-16">
      <BarChart3
        className="size-12 text-tl-text-muted"
        strokeWidth={1.25}
        aria-hidden
      />
      <h1 className="mt-6 text-xl font-semibold text-tl-text-primary">
        No data yet
      </h1>
      <p className="mt-2 max-w-md text-center text-sm text-tl-text-secondary">
        Send your first tracking event to see analytics here.
      </p>
      <div className="relative mt-8 w-full max-w-xl rounded-lg border border-tl-border bg-tl-bg p-4 pr-24">
        <pre className="overflow-x-auto font-code text-[13px] leading-relaxed text-tl-text-primary">
          {snippet}
        </pre>
        <CopySnippetButton text={copyText} />
      </div>
      <Link
        href="#"
        className="mt-6 text-sm font-medium text-tl-accent hover:text-tl-accent-hover"
      >
        View setup guide →
      </Link>
      <p className="mt-8 text-center text-xs text-tl-text-muted">
        Remove{" "}
        <Link
          href="?"
          className="font-medium text-tl-accent hover:text-tl-accent-hover"
        >
          ?empty=1
        </Link>{" "}
        from the URL to see the dashboard.
      </p>
    </div>
  );
}

export default async function OverviewPage({ searchParams }: Props) {
  const sp = await searchParams;
  const empty = sp.empty === "1";

  if (empty) {
    return <EmptyOverview />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-tl-text-primary">Overview</h1>
        <p className="mt-1 text-sm text-tl-text-secondary">
          Request volume, errors, and latency for your organization.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total requests"
          value="24,891"
          trend="↑ 12.3% vs yesterday"
          trendVariant="success"
        />
        <MetricCard
          label="Error rate"
          value="2.4%"
          trend="↓ 0.8%"
          trendVariant="success"
        />
        <MetricCard
          label="Avg latency"
          value="127ms"
          trend="↓ 15ms"
          trendVariant="success"
        />
        <MetricCard
          label="Active API keys"
          value="3"
          trend="— No change"
          trendVariant="muted"
        />
      </div>

      <RequestVolumeChart />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-tl-border bg-tl-card p-5">
          <h2 className="text-base font-semibold text-tl-text-primary">
            Top Endpoints
          </h2>
          <ul className="mt-4 space-y-0">
            {topEndpoints.map((row) => {
              const pct = Math.round((row.count / row.max) * 100);
              return (
                <li
                  key={row.path}
                  className="relative border-b border-tl-border py-3 last:border-0"
                >
                  <div
                    className="absolute inset-y-0 left-0 rounded bg-tl-accent/15"
                    style={{ width: `${pct}%` }}
                  />
                  <div className="relative flex items-center gap-3 text-sm">
                    <span className="w-5 text-tl-text-muted">{row.rank}</span>
                    <span className="min-w-0 flex-1 truncate font-code text-tl-text-primary">
                      {row.path}
                    </span>
                    <span className="text-tl-text-secondary">
                      {row.count.toLocaleString()}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <StatusDistribution />
      </div>

      <p className="text-xs text-tl-text-muted">
        Preview empty state: append{" "}
        <Link
          href="?empty=1"
          className="font-medium text-tl-accent hover:text-tl-accent-hover"
        >
          ?empty=1
        </Link>
      </p>
    </div>
  );
}
