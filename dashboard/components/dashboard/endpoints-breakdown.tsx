"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/cn";

type Row = {
  endpoint: string;
  requests: number;
  errorRate: number;
  avg: number;
  p95: number;
  p99: number;
};

const data: Row[] = [
  { endpoint: "/api/users", requests: 8421, errorRate: 1.2, avg: 45, p95: 120, p99: 340 },
  { endpoint: "/api/orders", requests: 4102, errorRate: 3.8, avg: 187, p95: 450, p99: 1200 },
  { endpoint: "/api/products", requests: 3890, errorRate: 0.5, avg: 32, p95: 89, p99: 210 },
  { endpoint: "/api/auth/login", requests: 2340, errorRate: 8.1, avg: 95, p95: 280, p99: 890 },
  { endpoint: "/api/search", requests: 1988, errorRate: 2.1, avg: 210, p95: 800, p99: 2400 },
];

type SortKey = keyof Pick<Row, "requests" | "errorRate" | "avg" | "p95" | "p99">;

function errorCellClass(rate: number) {
  if (rate < 2) return "bg-tl-success/10 text-tl-success";
  if (rate <= 5) return "bg-tl-warning/10 text-tl-warning";
  return "bg-tl-error/10 text-tl-error";
}

function latencyCellClass(ms: number) {
  if (ms < 100) return "text-tl-success";
  if (ms <= 500) return "text-tl-warning";
  return "text-tl-error";
}

function formatMs(ms: number) {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

export function EndpointsBreakdown() {
  const [range, setRange] = useState<"24h" | "7d" | "30d">("24h");
  const [sortKey, setSortKey] = useState<SortKey>("requests");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    const copy = [...data];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const mul = sortDir === "asc" ? 1 : -1;
      return av === bv ? 0 : av > bv ? mul : -mul;
    });
    return copy;
  }, [sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-tl-text-primary">
            Endpoints
          </h1>
          <p className="mt-1 text-sm text-tl-text-secondary">
            Per-endpoint traffic, errors, and latency ({range}).
          </p>
        </div>
        <div className="flex gap-2">
          {(["24h", "7d", "30d"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={cn(
                "h-8 rounded-lg px-3 text-xs font-medium transition-colors",
                r === range
                  ? "bg-tl-accent text-white"
                  : "border border-tl-border bg-transparent text-tl-text-secondary hover:bg-tl-card-hover",
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-tl-border bg-tl-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-tl-border text-xs font-medium uppercase tracking-wide text-tl-text-secondary">
                <th className="px-5 py-3 font-medium">Endpoint</th>
                <th className="px-5 py-3 font-medium">
                  <SortHead
                    label="Requests"
                    active={sortKey === "requests"}
                    dir={sortDir}
                    onClick={() => toggleSort("requests")}
                  />
                </th>
                <th className="px-5 py-3 font-medium">
                  <SortHead
                    label="Error rate"
                    active={sortKey === "errorRate"}
                    dir={sortDir}
                    onClick={() => toggleSort("errorRate")}
                  />
                </th>
                <th className="px-5 py-3 font-medium">
                  <SortHead
                    label="Avg latency"
                    active={sortKey === "avg"}
                    dir={sortDir}
                    onClick={() => toggleSort("avg")}
                  />
                </th>
                <th className="px-5 py-3 font-medium">
                  <SortHead
                    label="P95"
                    active={sortKey === "p95"}
                    dir={sortDir}
                    onClick={() => toggleSort("p95")}
                  />
                </th>
                <th className="px-5 py-3 font-medium">
                  <SortHead
                    label="P99"
                    active={sortKey === "p99"}
                    dir={sortDir}
                    onClick={() => toggleSort("p99")}
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr
                  key={row.endpoint}
                  className="h-12 border-b border-tl-border last:border-0 hover:bg-tl-card-hover"
                >
                  <td className="px-5 py-3 font-code text-tl-text-primary">
                    {row.endpoint}
                  </td>
                  <td className="px-5 py-3 text-tl-text-secondary">
                    {row.requests.toLocaleString()}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded px-2 py-0.5 font-code text-xs font-medium",
                        errorCellClass(row.errorRate),
                      )}
                    >
                      {row.errorRate.toFixed(1)}%
                    </span>
                  </td>
                  <td
                    className={cn(
                      "px-5 py-3 text-right font-code",
                      latencyCellClass(row.avg),
                    )}
                  >
                    {formatMs(row.avg)}
                  </td>
                  <td
                    className={cn(
                      "px-5 py-3 text-right font-code",
                      latencyCellClass(row.p95),
                    )}
                  >
                    {formatMs(row.p95)}
                  </td>
                  <td
                    className={cn(
                      "px-5 py-3 text-right font-code",
                      latencyCellClass(row.p99),
                    )}
                  >
                    {formatMs(row.p99)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SortHead({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 font-medium hover:text-tl-text-primary",
        active ? "text-tl-text-primary" : "",
      )}
    >
      {label}
      {active &&
        (dir === "desc" ? (
          <ArrowDown className="size-3.5 text-tl-accent" />
        ) : (
          <ArrowUp className="size-3.5 text-tl-accent" />
        ))}
    </button>
  );
}
