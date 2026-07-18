"use client";

import { motion } from "framer-motion";
import { HeartPulse, ShieldCheck, TrendingUp, Wallet2 } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { computeFinancialHealth } from "@/lib/analytics";
import type { Transaction } from "@/lib/types";

const iconFor = [TrendingUp, Wallet2, ShieldCheck];

export function FinancialHealth({
  transactions,
  balance,
}: {
  transactions: Transaction[];
  balance: number;
}) {
  const health = computeFinancialHealth(transactions, balance);

  return (
    <Card className="h-full">
      <CardHeader>
        <h3 className="text-[15px] font-semibold text-ink-900">Financial Health</h3>
        <HeartPulse className="h-4 w-4 text-[var(--arc-blue)]" />
      </CardHeader>

      {!health.hasEnoughData ? (
        <div className="py-8 text-center">
          <p className="text-sm text-ink-500">Not enough activity yet</p>
          <p className="text-xs text-ink-400 mt-1 max-w-[220px] mx-auto">
            Your health score unlocks once FinPilot has a few transactions to
            learn from.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 mb-5">
            <ScoreRing score={health.overall} />
            <div>
              <p className="text-2xl font-semibold text-ink-900 tabular">{health.overall}</p>
              <p className="text-xs text-ink-500">
                {health.overall >= 80
                  ? "Excellent standing"
                  : health.overall >= 60
                  ? "Good, with room to improve"
                  : "Needs attention"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {health.factors.map((f, i) => {
              const Icon = iconFor[i];
              return (
                <div key={f.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-ink-700">
                      <Icon className="h-3.5 w-3.5 text-ink-400" />
                      {f.label}
                    </span>
                    <span className="text-xs font-semibold text-ink-900 tabular">{f.score}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${f.score}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundImage: "var(--arc-gradient)" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Card>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="var(--surface-3)" strokeWidth="6" />
        <motion.circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="url(#health-grad)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          transform="rotate(-90 32 32)"
        />
        <defs>
          <linearGradient id="health-grad" x1="0" y1="0" x2="64" y2="64">
            <stop stopColor="#5B7CFA" />
            <stop offset="1" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
