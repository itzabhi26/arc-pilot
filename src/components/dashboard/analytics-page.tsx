"use client";

import { motion } from "framer-motion";
import { AnalyticsPanel } from "./analytics-panel";
import { SpendingOverview } from "./spending-overview";
import { CategoryBreakdown } from "./category-breakdown";
import { FinancialHealth } from "./financial-health";
import { successRate, totalReceived, totalSent } from "@/lib/analytics";
import type { Transaction } from "@/lib/types";
import { formatUSDC } from "@/lib/utils";

export function AnalyticsPage({
  transactions,
  balance,
}: {
  transactions: Transaction[];
  balance: number;
}) {
  const rate = successRate(transactions);
  const stats = [
    { label: "Total Received", value: `$${formatUSDC(totalReceived(transactions))}` },
    { label: "Total Sent", value: `$${formatUSDC(totalSent(transactions))}` },
    { label: "Success Rate", value: rate !== null ? `${rate}%` : "—" },
    { label: "Transactions", value: String(transactions.length) },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-xs font-medium text-ink-500">{s.label}</p>
            <p className="text-xl font-semibold text-ink-900 tabular mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <AnalyticsPanel transactions={transactions} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SpendingOverview transactions={transactions} />
        </div>
        <FinancialHealth transactions={transactions} balance={balance} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CategoryBreakdown transactions={transactions} />
      </div>
    </motion.div>
  );
}
