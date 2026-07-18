"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles, SendHorizonal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useApp } from "@/components/providers/app-provider";
import { answerFromData } from "@/lib/analytics";
import { sleep } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "agent";
  text: string;
}

const starterPrompts = [
  "Summarize my activity",
  "What's my biggest transaction?",
  "Do I have any failed transactions?",
  "What's my current balance?",
];

export function AiAgentPage() {
  const { transactions, balance, username } = useApp();
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "welcome",
      role: "agent",
      text: `Hi ${username ? `@${username}` : "there"} — I'm FinPilot. Ask me anything about your Arc Testnet activity and I'll answer using your real, live transaction data.`,
    },
  ]);
  const [input, setInput] = React.useState("");
  const [thinking, setThinking] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  async function send(text: string) {
    if (!text.trim() || thinking) return;
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", text }]);
    setInput("");
    setThinking(true);
    await sleep(650);
    const reply = answerFromData(text, transactions, balance);
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "agent", text: reply }]);
    setThinking(false);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
      <Card className="flex flex-col h-[calc(100vh-180px)] min-h-[480px]">
        <div className="flex items-center gap-2.5 pb-4 border-b border-border-subtle mb-4">
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center"
            style={{ backgroundImage: "var(--arc-gradient-soft)" }}
          >
            <Sparkles className="h-4 w-4 text-[var(--arc-blue)]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-900">FinPilot AI</p>
            <p className="text-xs text-ink-400">
              Grounded in {transactions.length} tracked transaction{transactions.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1">
          {messages.map((m) => (
            <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div
                className={
                  m.role === "user"
                    ? "max-w-[75%] rounded-2xl rounded-br-md px-4 py-2.5 text-sm text-white"
                    : "max-w-[75%] rounded-2xl rounded-bl-md px-4 py-2.5 text-sm bg-surface-2 border border-border-subtle text-ink-700"
                }
                style={m.role === "user" ? { backgroundImage: "var(--arc-gradient)" } : undefined}
              >
                {m.text}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md px-4 py-3 bg-surface-2 border border-border-subtle flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-ink-400"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 my-3">
          {starterPrompts.map((p) => (
            <button
              key={p}
              onClick={() => send(p)}
              className="focus-ring text-xs font-medium text-ink-500 bg-surface-3 rounded-full px-3 py-1.5 hover:bg-surface-hover hover:text-ink-900 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 pt-1"
        >
          <div className="flex-1 flex items-center gap-2 rounded-full border border-border-soft bg-surface px-4 h-11">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask FinPilot about your finances…"
              className="focus-ring flex-1 bg-transparent text-sm text-ink-900 placeholder:text-ink-400 outline-none h-full"
            />
          </div>
          <button
            type="submit"
            disabled={thinking || !input.trim()}
            className="focus-ring h-11 w-11 rounded-full flex items-center justify-center text-white shrink-0 disabled:opacity-40 transition-transform active:scale-95"
            style={{ backgroundImage: "var(--arc-gradient)" }}
          >
            {thinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
          </button>
        </form>
      </Card>
    </motion.div>
  );
}
