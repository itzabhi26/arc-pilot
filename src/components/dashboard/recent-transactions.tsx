"use client";

import { ArrowDownLeft, ArrowUpRight, Loader2, Repeat } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Transaction } from "@/lib/types";
import { cn, formatUSDC, shortAddress, timeAgo } from "@/lib/utils";

const iconFor = { in: ArrowDownLeft, out: ArrowUpRight, swap: Repeat } as const;
const bgFor = {
  in: "bg-[var(--success-soft)] text-[var(--success)]",
  out: "bg-[var(--danger-soft)] text-[var(--danger)]",
  swap: "bg-brand-soft text-[var(--arc-blue)]",
} as const;

export function RecentTransactions({
  transactions,
  loading,
  onViewAll,
}: {
  transactions: Transaction[];
  loading?: boolean;
  onViewAll: () => void;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <h3 className="text-[15px] font-semibold text-ink-900">Recent Transactions</h3>
        <button
          onClick={onViewAll}
          className="focus-ring text-xs font-medium text-[var(--arc-blue)] hover:underline"
        >
          View all
        </button>
      </CardHeader>

      {loading && transactions.length === 0 ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-ink-400" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm text-ink-500">No transactions yet</p>
          <p className="text-xs text-ink-400 mt-1">
            Deposit or send USDC on Arc Testnet to see activity here.
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {transactions.slice(0, 5).map((tx) => {
            const Icon = iconFor[tx.direction];
            return (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-xl px-2 py-2.5 hover:bg-surface-2 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "h-9 w-9 rounded-full flex items-center justify-center shrink-0",
                      bgFor[tx.direction]
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink-900 truncate">
                      {tx.label} {shortAddress(tx.counterparty, 6)}
                    </p>
                    <p className="text-xs text-ink-400">
                      {tx.status === "pending" ? "Pending…" : timeAgo(tx.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className={cn(
                      "text-sm font-semibold tabular",
                      tx.amount >= 0 ? "text-[var(--success)]" : "text-ink-900"
                    )}
                  >
                    {formatUSDC(tx.amount, { sign: true })} USDC
                  </p>
                  <Badge
                    variant={
                      tx.status === "confirmed"
                        ? "success"
                        : tx.status === "failed"
                        ? "danger"
                        : "warning"
                    }
                    className="mt-1 !py-0.5"
                  >
                    {tx.status === "confirmed" ? "Confirmed" : tx.status === "failed" ? "Failed" : "Pending"}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
