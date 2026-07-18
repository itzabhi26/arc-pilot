"use client";

import { motion } from "framer-motion";
import { Wallet2 } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { totalReceived, totalSent } from "@/lib/analytics";
import type { Transaction } from "@/lib/types";
import { formatUSDC } from "@/lib/utils";

export function PortfolioPage({
  balance,
  transactions,
}: {
  balance: number;
  transactions: Transaction[];
}) {
  const received = totalReceived(transactions);
  const sent = totalSent(transactions);
  const netFlow = received - sent;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card>
        <CardHeader>
          <h3 className="text-[15px] font-semibold text-ink-900">Holdings</h3>
          <span className="text-xs font-medium text-ink-400">Arc Testnet</span>
        </CardHeader>
        <div className="flex items-center gap-4 rounded-2xl border border-border-subtle bg-surface-2 p-4">
          <div
            className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{ backgroundImage: "var(--arc-gradient-soft)" }}
          >
            <Wallet2 className="h-6 w-6 text-[var(--arc-blue)]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-ink-900">USDC</p>
            <p className="text-xs text-ink-400">Native gas token — Arc Testnet</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-ink-900 tabular">${formatUSDC(balance)}</p>
            <p className="text-xs text-ink-400">100% of portfolio</p>
          </div>
        </div>
        <p className="text-xs text-ink-400 mt-3">
          Arc uses USDC as its native gas token, so your entire balance is
          held in a single asset — no multi-token portfolio to track yet.
        </p>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm font-medium text-ink-500 mb-1.5">Total Received</p>
          <p className="text-xl font-semibold text-ink-900 tabular">${formatUSDC(received)}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-ink-500 mb-1.5">Total Sent</p>
          <p className="text-xl font-semibold text-ink-900 tabular">${formatUSDC(sent)}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-ink-500 mb-1.5">Net Flow</p>
          <p
            className={`text-xl font-semibold tabular ${
              netFlow >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"
            }`}
          >
            {netFlow >= 0 ? "+" : ""}
            ${formatUSDC(netFlow)}
          </p>
        </Card>
      </div>
    </motion.div>
  );
}
