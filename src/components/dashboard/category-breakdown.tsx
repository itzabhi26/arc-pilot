"use client";

import { motion } from "framer-motion";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Card, CardHeader } from "@/components/ui/card";
import { categoryBreakdown } from "@/lib/analytics";
import type { Transaction } from "@/lib/types";
import { formatUSDC } from "@/lib/utils";

export function CategoryBreakdown({ transactions }: { transactions: Transaction[] }) {
  const slices = categoryBreakdown(transactions);
  const total = slices.reduce((s, c) => s + c.amount, 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <h3 className="text-[15px] font-semibold text-ink-900">Spending by Category</h3>
        <span className="text-xs font-medium text-ink-400">AI tagged</span>
      </CardHeader>

      {slices.length === 0 ? (
        <div className="h-[168px] flex flex-col items-center justify-center text-center">
          <p className="text-sm text-ink-500">No tagged spend yet</p>
          <p className="text-xs text-ink-400 mt-1 max-w-[240px]">
            Choose a category next time you send funds and FinPilot will
            break your spending down here.
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-6">
          <div className="relative h-[168px] w-[168px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="amount"
                  nameKey="category"
                  innerRadius={54}
                  outerRadius={78}
                  paddingAngle={3}
                  stroke="none"
                  isAnimationActive
                >
                  {slices.map((slice) => (
                    <Cell key={slice.category} fill={slice.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-lg font-semibold text-ink-900 tabular">${formatUSDC(total)}</p>
              <p className="text-[11px] text-ink-400">Tagged spend</p>
            </div>
          </div>

          <div className="flex-1 space-y-2.5 max-h-[168px] overflow-y-auto pr-1">
            {slices.map((c, i) => (
              <motion.div
                key={c.category}
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between text-xs"
              >
                <span className="flex items-center gap-2 text-ink-700 truncate">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  {c.category}
                </span>
                <span className="flex items-center gap-2 shrink-0">
                  <span className="text-ink-400">{c.percent}%</span>
                  <span className="font-medium text-ink-900 tabular w-14 text-right">
                    ${formatUSDC(c.amount)}
                  </span>
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
