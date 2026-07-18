"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, Sparkles } from "lucide-react";
import { generateInsights } from "@/lib/analytics";
import type { AiInsight, Transaction } from "@/lib/types";

const toneStyles: Record<AiInsight["tone"], { icon: typeof Info; classes: string; iconColor: string }> = {
  positive: { icon: CheckCircle2, classes: "bg-[var(--success-soft)] border-transparent", iconColor: "text-[var(--success)]" },
  warning: { icon: AlertTriangle, classes: "bg-[var(--warning-soft)] border-transparent", iconColor: "text-[var(--warning)]" },
  neutral: { icon: Info, classes: "bg-surface-3 border-transparent", iconColor: "text-ink-500" },
};

export function AiInsightsStrip({
  transactions,
  balance,
}: {
  transactions: Transaction[];
  balance: number;
}) {
  const insights = generateInsights(transactions, balance);

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-[var(--arc-blue)]" />
        <h2 className="text-sm font-semibold text-ink-900">AI Insights</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {insights.map((insight, i) => {
          const t = toneStyles[insight.tone];
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`rounded-2xl border ${t.classes} p-4`}
            >
              <t.icon className={`h-4 w-4 ${t.iconColor} mb-2`} />
              <p className="text-[13px] font-semibold text-ink-900 leading-snug">{insight.title}</p>
              <p className="text-xs text-ink-500 mt-1 leading-relaxed">{insight.detail}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
