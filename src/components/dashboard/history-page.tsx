"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  ExternalLink,
  Loader2,
  RefreshCw,
  Repeat,
} from "lucide-react";
import * as React from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { useApp } from "@/components/providers/app-provider";
import { explorerAddressUrl, explorerTxUrl } from "@/lib/wallet/chain";
import type { Transaction } from "@/lib/types";
import { cn, formatUSDC, shortAddress, timeAgo } from "@/lib/utils";

const dirIcon = { in: ArrowDownLeft, out: ArrowUpRight, swap: Repeat } as const;
const dirBg = {
  in: "bg-[var(--success-soft)] text-[var(--success)]",
  out: "bg-[var(--danger-soft)] text-[var(--danger)]",
  swap: "bg-brand-soft text-[var(--arc-blue)]",
} as const;

export function HistoryPage() {
  const { transactions, historyLoading, historyError, refreshHistory, smartWalletAddress } = useApp();
  const [filter, setFilter] = React.useState<"all" | Transaction["direction"]>("all");

  const filtered = transactions.filter((t) => filter === "all" || t.direction === filter);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader>
          <h3 className="text-[15px] font-semibold text-ink-900">Transaction History</h3>
          <button
            onClick={() => refreshHistory()}
            disabled={historyLoading}
            className="focus-ring flex items-center gap-1.5 text-xs font-medium text-[var(--arc-blue)] hover:underline disabled:opacity-50"
          >
            {historyLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Refresh
          </button>
        </CardHeader>

        <div className="flex items-center gap-1.5 mb-3">
          {(["all", "in", "out", "swap"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "focus-ring text-xs font-medium px-3 py-1.5 rounded-full transition-colors",
                filter === f ? "bg-brand-soft text-[var(--arc-blue)]" : "text-ink-500 hover:bg-surface-3"
              )}
            >
              {f === "all" ? "All" : f === "in" ? "Received" : f === "out" ? "Sent" : "Swaps"}
            </button>
          ))}
        </div>

        {historyError && (
          <div className="mb-3 flex items-start gap-2 rounded-xl bg-[var(--warning-soft)] px-3.5 py-3 text-xs text-[var(--warning)]">
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>Couldn&apos;t load activity from ArcScan ({historyError}).</span>
          </div>
        )}

        <div className="space-y-0.5">
          {filtered.map((tx) => {
            const Icon = dirIcon[tx.direction];
            return (
              <a
                key={tx.id}
                href={explorerTxUrl(tx.hash)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-xl px-2 py-3 hover:bg-surface-2 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn("h-10 w-10 rounded-full flex items-center justify-center shrink-0", dirBg[tx.direction])}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink-900 truncate">
                      {tx.label} {shortAddress(tx.counterparty, 6)}
                    </p>
                    <p className="text-xs text-ink-400 font-mono flex items-center gap-1">
                      {shortAddress(tx.hash, 8)}
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={cn("text-sm font-semibold tabular", tx.amount >= 0 ? "text-[var(--success)]" : "text-ink-900")}>
                    {formatUSDC(tx.amount, { sign: true })} USDC
                  </p>
                  <p className="text-[11px] text-ink-400">
                    {tx.status === "pending" ? "Pending…" : timeAgo(tx.timestamp)}
                  </p>
                </div>
              </a>
            );
          })}
          {!historyLoading && filtered.length === 0 && (
            <p className="text-center text-sm text-ink-400 py-14">
              No transactions yet — send or receive USDC to see activity here.
            </p>
          )}
          {historyLoading && filtered.length === 0 && (
            <div className="flex justify-center py-14">
              <Loader2 className="h-5 w-5 animate-spin text-ink-400" />
            </div>
          )}
        </div>

        {smartWalletAddress && (
          <a
            href={explorerAddressUrl(smartWalletAddress)}
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex items-center justify-center gap-1.5 text-xs font-medium text-[var(--arc-blue)] hover:underline"
          >
            View full history on ArcScan <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </Card>
    </motion.div>
  );
}
