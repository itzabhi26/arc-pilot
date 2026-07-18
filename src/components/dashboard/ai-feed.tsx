"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, Loader2, Sparkles, SendHorizonal } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { answerFromData, generateInsights } from "@/lib/analytics";
import type { AiInsight, Transaction } from "@/lib/types";
import { sleep } from "@/lib/utils";

const toneIcon: Record<AiInsight["tone"], typeof Info> = {
  positive: CheckCircle2,
  warning: AlertTriangle,
  neutral: Info,
};
const toneColor: Record<AiInsight["tone"], string> = {
  positive: "text-[var(--success)]",
  warning: "text-[var(--warning)]",
  neutral: "text-ink-500",
};

const suggestedPrompts = [
  "What's my biggest transaction?",
  "How much have I sent in total?",
  "Do I have any failed transactions?",
  "What's my current balance?",
];

export function AiFinancialFeed({
  transactions,
  balance,
}: {
  transactions: Transaction[];
  balance: number;
}) {
  const [query, setQuery] = React.useState("");
  const [asking, setAsking] = React.useState(false);
  const [answer, setAnswer] = React.useState<string | null>(null);
  const feed = generateInsights(transactions, balance);

  async function ask(q: string) {
    if (!q.trim()) return;
    setAsking(true);
    setAnswer(null);
    await sleep(700);
    setAnswer(answerFromData(q, transactions, balance));
    setAsking(false);
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-[15px] font-semibold text-ink-900">AI Financial Feed</h3>
        <span className="text-xs font-medium text-ink-400">Grounded in your Arc Testnet activity</span>
      </CardHeader>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(query);
        }}
        className="flex items-center gap-2 mb-4"
      >
        <div className="flex-1 flex items-center gap-2 rounded-full border border-border-soft bg-surface-2 px-4 h-11">
          <Sparkles className="h-4 w-4 text-[var(--arc-blue)] shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask FinPilot about your finances…"
            className="focus-ring flex-1 bg-transparent text-sm text-ink-900 placeholder:text-ink-400 outline-none h-full"
          />
        </div>
        <button
          type="submit"
          disabled={asking || !query.trim()}
          className="focus-ring h-11 w-11 rounded-full flex items-center justify-center text-white shrink-0 disabled:opacity-40 transition-transform active:scale-95"
          style={{ backgroundImage: "var(--arc-gradient)" }}
        >
          {asking ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
        </button>
      </form>

      <div className="flex flex-wrap gap-2 mb-5">
        {suggestedPrompts.map((p) => (
          <button
            key={p}
            onClick={() => {
              setQuery(p);
              ask(p);
            }}
            className="focus-ring text-xs font-medium text-ink-500 bg-surface-3 rounded-full px-3 py-1.5 hover:bg-surface-hover hover:text-ink-900 transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {(asking || answer) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="rounded-2xl border border-border-subtle bg-surface-2 p-4 flex gap-3">
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundImage: "var(--arc-gradient-soft)" }}
              >
                <Sparkles className="h-4 w-4 text-[var(--arc-blue)]" />
              </div>
              {asking ? (
                <div className="flex items-center gap-1.5 py-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-ink-400"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink-700 leading-relaxed">{answer}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2.5">
        {feed.map((item, i) => {
          const Icon = toneIcon[item.tone];
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex gap-3 rounded-xl px-2 py-2.5 hover:bg-surface-2 transition-colors"
            >
              <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${toneColor[item.tone]}`} />
              <div>
                <p className="text-[13px] font-medium text-ink-900">{item.title}</p>
                <p className="text-xs text-ink-500 mt-0.5 leading-relaxed">{item.detail}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
