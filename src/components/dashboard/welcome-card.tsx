"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles, TrendingUp, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { totalSent, successRate } from "@/lib/analytics";
import type { Transaction } from "@/lib/types";
import { formatUSDC } from "@/lib/utils";

export function WelcomeCard({
  onOpenAgent,
  transactions,
  balance,
}: {
  onOpenAgent: () => void;
  transactions: Transaction[];
  balance: number;
}) {
  const sent = totalSent(transactions);
  const rate = successRate(transactions);
  const failedCount = transactions.filter((t) => t.status === "failed").length;

  const highlights = [
    {
      icon: TrendingUp,
      title: transactions.length > 0 ? `You sent $${formatUSDC(sent)} USDC` : "No spend yet",
      sub: transactions.length > 0 ? "across tracked activity" : "Deposit to get started",
    },
    {
      icon: Sparkles,
      title: rate !== null ? `${rate}% success rate` : "Balance is healthy",
      sub: `$${formatUSDC(balance)} USDC available`,
    },
    {
      icon: Wand2,
      title: failedCount > 0 ? `${failedCount} failed transaction${failedCount === 1 ? "" : "s"}` : "All systems normal",
      sub: "Tap AI Insights below",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card p-6 mb-6 relative overflow-hidden"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full opacity-[0.12] blur-3xl"
        style={{ backgroundImage: "var(--arc-gradient)" }}
      />
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <FinPilotAvatar />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[15px] font-semibold text-ink-900">FinPilot AI</p>
              <Badge variant="brand">AI Agent</Badge>
            </div>
            <p className="text-sm text-ink-500 mt-0.5">
              Good afternoon — here&apos;s your live financial overview.
            </p>
          </div>
        </div>
        <Button onClick={onOpenAgent}>
          <Sparkles className="h-4 w-4" />
          Ask FinPilot
        </Button>
      </div>

      <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
        {highlights.map((h) => (
          <div
            key={h.title}
            className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-surface-2 px-3.5 py-3"
          >
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundImage: "var(--arc-gradient-soft)" }}
            >
              <h.icon className="h-4 w-4 text-[var(--arc-blue)]" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-ink-900 truncate">{h.title}</p>
              <p className="text-[11px] text-ink-500 truncate">{h.sub}</p>
            </div>
            <ArrowUpRight className="h-3.5 w-3.5 text-ink-400 ml-auto shrink-0" />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function FinPilotAvatar() {
  return (
    <div className="relative h-14 w-14 shrink-0">
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
        className="h-14 w-14 rounded-2xl flex items-center justify-center"
        style={{ backgroundImage: "var(--arc-gradient-soft)" }}
      >
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <rect x="6" y="9" width="18" height="15" rx="6" fill="url(#bot-grad)" />
          <circle cx="12" cy="16.5" r="2" fill="white" />
          <circle cx="18" cy="16.5" r="2" fill="white" />
          <rect x="13.2" y="3" width="3.6" height="6" rx="1.8" fill="url(#bot-grad)" />
          <circle cx="15" cy="3" r="2.2" fill="url(#bot-grad)" />
          <defs>
            <linearGradient id="bot-grad" x1="6" y1="3" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#5B7CFA" />
              <stop offset="1" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
      <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-[var(--success)] border-2 border-white" />
    </div>
  );
}
