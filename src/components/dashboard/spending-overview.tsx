"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Line, LineChart as ReLineChart } from "recharts";
import { Card, CardHeader } from "@/components/ui/card";
import { flowBreakdown, dailySeries } from "@/lib/analytics";
import type { Transaction } from "@/lib/types";
import { formatUSDC } from "@/lib/utils";

export function SpendingOverview({ transactions }: { transactions: Transaction[] }) {
  const breakdown = flowBreakdown(transactions);
  const total = breakdown.reduce((s, c) => s + c.amount, 0);
  const week = dailySeries(transactions, 7);
  const avgPerDay = week.reduce((s, p) => s + p.value, 0) / 7;

  return (
    <Card className="h-full">
      <CardHeader>
        <h3 className="text-[15px] font-semibold text-ink-900">Flow Overview</h3>
        <span className="text-xs font-medium text-ink-400">Live · Arc Testnet</span>
      </CardHeader>

      {breakdown.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex items-center gap-6">
          <div className="relative h-[168px] w-[168px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breakdown}
                  dataKey="amount"
                  nameKey="label"
                  innerRadius={54}
                  outerRadius={78}
                  paddingAngle={3}
                  stroke="none"
                  isAnimationActive
                >
                  {breakdown.map((slice) => (
                    <Cell key={slice.label} fill={slice.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-lg font-semibold text-ink-900 tabular">${formatUSDC(total)}</p>
              <p className="text-[11px] text-ink-400">Total Volume</p>
            </div>
          </div>

          <div className="flex-1 space-y-2.5">
            {breakdown.map((c) => (
              <div key={c.label} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-ink-700">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  {c.label}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-ink-400">{c.percent}%</span>
                  <span className="font-medium text-ink-900 tabular w-14 text-right">
                    ${formatUSDC(c.amount)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 pt-4 border-t border-border-subtle flex items-center justify-between">
        <p className="text-xs font-medium text-ink-500">Weekly Trend (outgoing)</p>
        <div className="text-right">
          <p className="text-sm font-semibold text-ink-900 tabular">${formatUSDC(avgPerDay)}</p>
          <p className="text-[11px] text-ink-400">Avg. per day</p>
        </div>
      </div>
      <div className="h-12 -mx-1 mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <ReLineChart data={week}>
            <Line type="monotone" dataKey="value" stroke="var(--arc-blue)" strokeWidth={2} dot={false} />
          </ReLineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="h-[168px] flex flex-col items-center justify-center text-center">
      <p className="text-sm text-ink-500">No on-chain activity yet</p>
      <p className="text-xs text-ink-400 mt-1 max-w-[220px]">
        Deposit or send USDC to start seeing your flow breakdown here.
      </p>
    </div>
  );
}
