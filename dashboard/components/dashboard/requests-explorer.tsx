"use client";

import { useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

type Row = {
  ts: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  endpoint: string;
  status: number;
  latencyMs: number;
  detail?: {
    requestId: string;
    apiKey: string;
    userAgent: string;
    ip: string;
    metadata: string;
  };
};

const rows: Row[] = [
  {
    ts: "Apr 5, 12:41:03 PM",
    method: "GET",
    endpoint: "/api/users",
    status: 200,
    latencyMs: 42,
  },
  {
    ts: "Apr 5, 12:41:02 PM",
    method: "POST",
    endpoint: "/api/orders",
    status: 201,
    latencyMs: 187,
  },
  {
    ts: "Apr 5, 12:40:58 PM",
    method: "GET",
    endpoint: "/api/search",
    status: 500,
    latencyMs: 2104,
    detail: {
      requestId: "req_a1b2c3d4",
      apiKey: "tl_live_****7f2a",
      userAgent: "axios/1.6.0",
      ip: "192.168.1.42",
      metadata: '{ "region": "us-east-1" }',
    },
  },
  {
    ts: "Apr 5, 12:40:55 PM",
    method: "GET",
    endpoint: "/api/users/1",
    status: 404,
    latencyMs: 12,
  },
  {
    ts: "Apr 5, 12:40:51 PM",
    method: "DELETE",
    endpoint: "/api/orders/42",
    status: 204,
    latencyMs: 89,
  },
  {
    ts: "Apr 5, 12:40:48 PM",
    method: "POST",
    endpoint: "/api/auth/login",
    status: 401,
    latencyMs: 34,
  },
  {
    ts: "Apr 5, 12:40:44 PM",
    method: "GET",
    endpoint: "/api/products",
    status: 200,
    latencyMs: 28,
  },
  {
    ts: "Apr 5, 12:40:40 PM",
    method: "PUT",
    endpoint: "/api/users/3",
    status: 200,
    latencyMs: 156,
  },
];

function methodBadge(method: Row["method"]) {
  const map: Record<Row["method"], string> = {
    GET: "bg-tl-accent/15 text-tl-accent",
    POST: "bg-tl-success/15 text-tl-success",
    PUT: "bg-tl-warning/15 text-tl-warning",
    DELETE: "bg-tl-error/15 text-tl-error",
  };
  return map[method];
}

function statusBadge(status: number) {
  if ([200, 201, 204].includes(status)) {
    return "bg-tl-success/15 text-tl-success";
  }
  if ([401, 404].includes(status)) {
    return "bg-tl-warning/15 text-tl-warning";
  }
  if (status >= 500) {
    return "bg-tl-error/15 text-tl-error";
  }
  return "bg-tl-text-muted/20 text-tl-text-secondary";
}

function latencyClass(ms: number) {
  if (ms >= 1000) return "text-tl-error font-medium";
  if (ms >= 100) return "text-tl-warning";
  return "text-tl-text-primary";
}

export function RequestsExplorer() {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [range, setRange] = useState("Last 24h");
  const [expanded, setExpanded] = useState<number | null>(2);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (q && !r.endpoint.toLowerCase().includes(q.toLowerCase())) {
        return false;
      }
      if (statusFilter === "All") return true;
      const family = Math.floor(r.status / 100);
      if (statusFilter === "2xx") return family === 2;
      if (statusFilter === "3xx") return family === 3;
      if (statusFilter === "4xx") return family === 4;
      if (statusFilter === "5xx") return family === 5;
      return true;
    });
  }, [q, statusFilter]);

  const filtersActive =
    q.length > 0 || statusFilter !== "All" || range !== "Last 24h";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-tl-text-primary">Requests</h1>
        <p className="mt-1 text-sm text-tl-text-secondary">
          Search and inspect individual requests.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-tl-border bg-tl-card p-4 lg:flex-row lg:items-center lg:gap-4">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-tl-text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by endpoint..."
            className="h-10 w-full rounded-lg border border-tl-border bg-tl-bg pl-10 pr-3 text-sm text-tl-text-primary outline-none placeholder:text-tl-text-muted focus:border-tl-accent focus:ring-2 focus:ring-tl-accent/30"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 w-full rounded-lg border border-tl-border bg-tl-bg px-3 text-sm text-tl-text-primary outline-none focus:border-tl-accent focus:ring-2 focus:ring-tl-accent/30 lg:w-40"
        >
          <option>All</option>
          <option>2xx</option>
          <option>3xx</option>
          <option>4xx</option>
          <option>5xx</option>
        </select>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="h-10 w-full rounded-lg border border-tl-border bg-tl-bg px-3 text-sm text-tl-text-primary outline-none focus:border-tl-accent focus:ring-2 focus:ring-tl-accent/30 lg:w-44"
        >
          <option>Last hour</option>
          <option>Last 24h</option>
          <option>Last 7d</option>
          <option>Last 30d</option>
          <option>Custom</option>
        </select>
        {filtersActive && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              setStatusFilter("All");
              setRange("Last 24h");
            }}
            className="text-sm font-medium text-tl-text-secondary hover:text-tl-text-primary lg:ml-auto"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-tl-border bg-tl-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-tl-border text-xs font-medium uppercase tracking-wide text-tl-text-secondary">
                <th className="px-5 py-3 font-medium">Timestamp</th>
                <th className="px-5 py-3 font-medium">Method</th>
                <th className="px-5 py-3 font-medium">Endpoint</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Latency</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const globalIdx = rows.indexOf(r);
                const isOpen = expanded === globalIdx;
                return (
                  <FragmentRow
                    key={`${r.ts}-${r.endpoint}-${i}`}
                    row={r}
                    isOpen={isOpen}
                    onToggle={() => setExpanded(isOpen ? null : globalIdx)}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 border-t border-tl-border px-5 py-4 text-xs text-tl-text-secondary sm:flex-row sm:items-center sm:justify-between">
          <span>Showing 1–25 of 1,168</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="inline-flex size-8 items-center justify-center rounded-lg border border-tl-border hover:bg-tl-card-hover"
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-tl-card-hover text-tl-text-primary">
              1
            </span>
            <button
              type="button"
              className="inline-flex size-8 items-center justify-center rounded-lg border border-tl-border text-tl-text-secondary hover:bg-tl-card-hover"
            >
              2
            </button>
            <button
              type="button"
              className="inline-flex size-8 items-center justify-center rounded-lg border border-tl-border text-tl-text-secondary hover:bg-tl-card-hover"
            >
              3
            </button>
            <span className="px-1">…</span>
            <button
              type="button"
              className="inline-flex size-8 items-center justify-center rounded-lg border border-tl-border text-tl-text-secondary hover:bg-tl-card-hover"
            >
              47
            </button>
            <button
              type="button"
              className="inline-flex size-8 items-center justify-center rounded-lg border border-tl-border hover:bg-tl-card-hover"
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FragmentRow({
  row: r,
  isOpen,
  onToggle,
}: {
  row: Row;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        className={cn(
          "h-12 border-b border-tl-border transition-colors hover:bg-tl-card-hover",
          isOpen && "bg-tl-card-hover",
          r.detail && "cursor-pointer",
        )}
        onClick={() => {
          if (r.detail) onToggle();
        }}
      >
        <td className="px-5 py-3 text-tl-text-secondary">{r.ts}</td>
        <td className="px-5 py-3">
          <span
            className={cn(
              "inline-flex min-w-[52px] justify-center rounded px-2 py-0.5 font-code text-[11px] font-medium",
              methodBadge(r.method),
            )}
          >
            {r.method}
          </span>
        </td>
        <td className="max-w-[280px] truncate px-5 py-3 font-code text-tl-text-primary">
          {r.endpoint}
        </td>
        <td className="px-5 py-3">
          <span
            className={cn(
              "inline-flex min-w-[40px] justify-center rounded px-2 py-0.5 font-code text-[11px] font-medium",
              statusBadge(r.status),
            )}
          >
            {r.status}
          </span>
        </td>
        <td
          className={cn(
            "px-5 py-3 text-right font-code",
            latencyClass(r.latencyMs),
          )}
        >
          {r.latencyMs.toLocaleString()}ms
        </td>
      </tr>
      {isOpen && r.detail && (
        <tr
          className="border-b border-tl-border bg-tl-card-hover"
          onClick={(e) => e.stopPropagation()}
        >
          <td colSpan={5} className="px-5 py-4 pl-12">
            <dl className="grid gap-3 text-xs sm:grid-cols-2">
              <div>
                <dt className="text-tl-text-muted">Request ID</dt>
                <dd className="mt-0.5 font-code text-tl-text-primary">
                  {r.detail.requestId}
                </dd>
              </div>
              <div>
                <dt className="text-tl-text-muted">API Key</dt>
                <dd className="mt-0.5 font-code text-tl-text-primary">
                  {r.detail.apiKey}
                </dd>
              </div>
              <div>
                <dt className="text-tl-text-muted">User Agent</dt>
                <dd className="mt-0.5 font-code text-tl-text-primary">
                  {r.detail.userAgent}
                </dd>
              </div>
              <div>
                <dt className="text-tl-text-muted">IP Address</dt>
                <dd className="mt-0.5 font-code text-tl-text-primary">
                  {r.detail.ip}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-tl-text-muted">Metadata</dt>
                <dd className="mt-1 rounded-lg border border-tl-border bg-tl-bg p-3 font-code text-tl-text-primary">
                  {r.detail.metadata}
                </dd>
              </div>
            </dl>
          </td>
        </tr>
      )}
    </>
  );
}
