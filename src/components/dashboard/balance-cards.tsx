"use client";

import { ArrowUpRight, Eye, EyeOff, Loader2 } from "lucide-react";
import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";
import { formatUSDC } from "@/lib/utils";
import { dailySeries, totalReceived } from "@/lib/analytics";
import type { Transaction } from "@/lib/types";

export function BalanceCards({
  balance,
  balanceLoading,
  totalSent,
  transactions,
}: {
  balance: number;
  balanceLoading?: boolean;
  totalSent: number;
  transactions: Transaction[];
}) {
  const [hidden, setHidden] = React.useState(false);

  const outflow7d = dailySeries(transactions, 7).map((p) => ({ v: p.value }));
  const received = totalReceived(transactions);
  const failed = transactions.filter((t) => t.status === "failed").length;
  const successful = transactions.length - failed;

  const inflowSpark = React.useMemo(() => {
    const now = Date.now();
    const buckets = new Array(7).fill(0);
    transactions.forEach((t) => {
      if (t.amount <= 0) return;
      const dayIdx = 6 - Math.floor((now - t.timestamp.getTime()) / 86400000);
      if (dayIdx >= 0 && dayIdx < 7) buckets[dayIdx] += t.amount;
    });
    return buckets.map((v) => ({ v }));
  }, [transactions]);

  const txCountSpark = React.useMemo(() => {
    const now = Date.now();
    const buckets = new Array(7).fill(0);
    transactions.forEach((t) => {
      const dayIdx = 6 - Math.floor((now - t.timestamp.getTime()) / 86400000);
      if (dayIdx >= 0 && dayIdx < 7) buckets[dayIdx] += 1;
    });
    return buckets.map((v) => ({ v }));
  }, [transactions]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      <Card hover className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-ink-500">Total Balance</span>
          <div className="flex items-center gap-1.5">
            {balanceLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-ink-400" />}
            <button onClick={() => setHidden((h) => !h)} className="focus-ring text-ink-400 hover:text-ink-600">
              {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <p className="text-[26px] font-semibold text-ink-900 tabular">
          {hidden ? "••••" : `$${formatUSDC(balance)}`} <span className="text-sm font-normal text-ink-400">USDC</span>
        </p>
        <p className="text-xs text-ink-400 mt-0.5">Live from Arc Testnet</p>
        <MiniArea data={inflowSpark.length ? inflowSpark : [{ v: 0 }, { v: 0 }]} color="var(--arc-blue)" />
      </Card>

      <Card hover>
        <p className="text-sm font-medium text-ink-500 mb-2">Received</p>
        <p className="text-[26px] font-semibold text-ink-900 tabular">
          ${formatUSDC(received)} <span className="text-sm font-normal text-ink-400">USDC</span>
        </p>
        <p className="text-xs text-ink-400 mt-0.5">All tracked inflow</p>
        <MiniBars data={inflowSpark.length ? inflowSpark : [{ v: 0 }]} color="var(--success)" />
      </Card>

      <Card hover>
        <p className="text-sm font-medium text-ink-500 mb-2">Total Sent</p>
        <p className="text-[26px] font-semibold text-ink-900 tabular">
          ${formatUSDC(totalSent)} <span className="text-sm font-normal text-ink-400">USDC</span>
        </p>
        <p className="text-xs text-ink-400 mt-0.5 flex items-center gap-1">
          {totalSent > 0 ? (
            <>
              <ArrowUpRight className="h-3.5 w-3.5 text-[var(--danger)]" /> Outgoing volume
            </>
          ) : (
            "No outgoing transactions yet"
          )}
        </p>
        <MiniArea data={outflow7d.length ? outflow7d : [{ v: 0 }, { v: 0 }]} color="var(--danger)" />
      </Card>

      <Card hover>
        <p className="text-sm font-medium text-ink-500 mb-2">Total Transactions</p>
        <p className="text-[26px] font-semibold text-ink-900 tabular">{transactions.length}</p>
        <div className="flex items-center gap-3 mt-1 text-xs">
          <span className="flex items-center gap-1 text-[var(--success)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
            Successful {successful}
          </span>
          <span className="flex items-center gap-1 text-[var(--danger)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--danger)]" />
            Failed {failed}
          </span>
        </div>
        <MiniLine data={txCountSpark.length ? txCountSpark : [{ v: 0 }]} color="var(--arc-violet)" />
      </Card>
    </div>
  );
}

function MiniArea({ data, color }: { data: { v: number }[]; color: string }) {
  const gradId = React.useId();
  return (
    <div className="h-12 mt-3 -mx-1">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#${gradId})`} isAnimationActive />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function MiniBars({ data, color }: { data: { v: number }[]; color: string }) {
  return (
    <div className="h-12 mt-3 -mx-1">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <Bar dataKey="v" fill={color} radius={[3, 3, 0, 0]} opacity={0.85} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function MiniLine({ data, color }: { data: { v: number }[]; color: string }) {
  return (
    <div className="h-12 mt-3 -mx-1">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
