"use client";

import { useMemo, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/cn";

const ranges = ["24h", "7d", "30d"] as const;
type Range = (typeof ranges)[number];

const data24h = [
  { t: "12am", requests: 3200, errors: 120 },
  { t: "4am", requests: 2800, errors: 90 },
  { t: "8am", requests: 9100, errors: 210 },
  { t: "12pm", requests: 12400, errors: 310 },
  { t: "4pm", requests: 11800, errors: 280 },
  { t: "8pm", requests: 8600, errors: 190 },
  { t: "12am", requests: 4100, errors: 95 },
];

function scaleData(
  base: typeof data24h,
  factor: number,
): typeof data24h {
  return base.map((d) => ({
    t: d.t,
    requests: Math.round(d.requests * factor),
    errors: Math.round(d.errors * factor),
  }));
}

export function RequestVolumeChart() {
  const [range, setRange] = useState<Range>("24h");
  const chartData = useMemo(() => {
    if (range === "7d") return scaleData(data24h, 6.2);
    if (range === "30d") return scaleData(data24h, 24);
    return data24h;
  }, [range]);

  return (
    <div className="rounded-lg border border-tl-border bg-tl-card p-5">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-tl-text-primary">
          Request Volume
        </h2>
        <div className="flex gap-2">
          {ranges.map((r) => (
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

      <div className="h-[260px] w-full sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="reqFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#27272a"
              vertical={false}
            />
            <XAxis
              dataKey="t"
              tick={{ fill: "#a1a1aa", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#a1a1aa", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) =>
                v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`
              }
              domain={[0, "auto"]}
            />
            <Tooltip
              contentStyle={{
                background: "#141416",
                border: "1px solid #27272a",
                borderRadius: 8,
                fontSize: 12,
                color: "#fafafa",
              }}
              labelStyle={{ color: "#a1a1aa", marginBottom: 4 }}
              formatter={(value, name) => [
                Number(value ?? 0).toLocaleString(),
                name === "requests" ? "Requests" : "Errors",
              ]}
              labelFormatter={() => "Apr 5, 2:00 PM"}
            />
            <Area
              type="monotone"
              dataKey="requests"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#reqFill)"
              name="requests"
            />
            <Line
              type="monotone"
              dataKey="errors"
              stroke="#ef4444"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              name="errors"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-tl-text-secondary">
        <span className="inline-flex items-center gap-2">
          <span className="size-2 rounded-full bg-tl-chart-blue" />
          Requests
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-2 rounded-full bg-tl-chart-red" />
          Errors
        </span>
      </div>
    </div>
  );
}
