"use client";

import * as React from "react";
import {
  Bar,
  CartesianGrid,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Transaction } from "@/lib/types";

function buildSeries(transactions: Transaction[], days: number) {
  const now = Date.now();
  const buckets = new Map<string, { spend: number; inflow: number }>();
  const order: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    buckets.set(label, { spend: 0, inflow: 0 });
    order.push(label);
  }
  transactions.forEach((t) => {
    const ageDays = (now - t.timestamp.getTime()) / 86400000;
    if (ageDays > days) return;
    const label = t.timestamp.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const bucket = buckets.get(label);
    if (!bucket) return;
    if (t.amount < 0) bucket.spend += Math.abs(t.amount);
    else bucket.inflow += t.amount;
  });
  return order.map((label) => ({ label, ...buckets.get(label)! }));
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; dataKey: string; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-surface border border-border-subtle shadow-[var(--shadow-card-hover)] px-3 py-2">
      <p className="text-[11px] font-medium text-ink-500 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-xs font-semibold tabular" style={{ color: p.color }}>
          {p.dataKey === "spend" ? "Spend" : "Inflow"}: ${p.value.toFixed(2)}
        </p>
      ))}
    </div>
  );
}

export function AnalyticsPanel({ transactions }: { transactions: Transaction[] }) {
  const [range, setRange] = React.useState("7d");
  const days = range === "24h" ? 1 : range === "7d" ? 7 : 30;
  const data = buildSeries(transactions, days);
  const hasActivity = transactions.length > 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <h3 className="text-[15px] font-semibold text-ink-900">Analytics</h3>
        <Tabs value={range} onValueChange={setRange}>
          <TabsList>
            <TabsTrigger value="24h">24H</TabsTrigger>
            <TabsTrigger value="7d">7D</TabsTrigger>
            <TabsTrigger value="30d">30D</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <div className="flex items-center gap-4 mb-3 text-xs">
        <span className="flex items-center gap-1.5 text-ink-500">
          <span className="h-2 w-2 rounded-full bg-[var(--arc-blue)]" /> Spend
        </span>
        <span className="flex items-center gap-1.5 text-ink-500">
          <span className="h-2 w-2 rounded-full bg-[var(--arc-violet)]" /> Inflow
        </span>
      </div>

      {!hasActivity ? (
        <div className="h-64 flex flex-col items-center justify-center text-center">
          <p className="text-sm text-ink-500">No on-chain activity to chart yet</p>
          <p className="text-xs text-ink-400 mt-1 max-w-[260px]">
            Once you send or receive USDC on Arc Testnet, real spend/inflow
            trends will appear here.
          </p>
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--surface-3)" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#9297AF" }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#9297AF" }} width={30} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--surface-hover)" }} />
              <Bar dataKey="spend" fill="var(--arc-blue)" radius={[6, 6, 0, 0]} barSize={18} opacity={0.85} />
              <Line type="monotone" dataKey="inflow" stroke="var(--arc-violet)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--arc-violet)" }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
