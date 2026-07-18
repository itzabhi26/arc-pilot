"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Copy,
  Check,
  History as HistoryIcon,
  Loader2,
  QrCode,
  RefreshCw,
  SendHorizonal,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { ArcMark } from "@/components/logo";
import { useApp } from "@/components/providers/app-provider";
import { reconstructBalanceHistory } from "@/lib/analytics";
import { formatUSDC, shortAddress } from "@/lib/utils";
import type { TxModalType } from "@/lib/types";

const ranges = ["1D", "7D", "30D", "All"] as const;
type Range = (typeof ranges)[number];
const rangeDays: Record<Range, number> = { "1D": 1, "7D": 7, "30D": 30, All: 3650 };

const actions: { key: Exclude<TxModalType, null>; label: string; icon: typeof ArrowDownToLine }[] = [
  { key: "deposit", label: "Deposit", icon: ArrowDownToLine },
  { key: "withdraw", label: "Withdraw", icon: ArrowUpFromLine },
  { key: "send", label: "Send", icon: SendHorizonal },
  { key: "receive", label: "Receive", icon: QrCode },
  { key: "history", label: "History", icon: HistoryIcon },
];

const actionSub: Record<string, string> = {
  deposit: "Add funds to your wallet",
  withdraw: "Withdraw funds",
  send: "Send to another address",
  receive: "Receive from another address",
  history: "View transaction history",
};

export function SmartWalletPanel({
  onAction,
}: {
  onAction: (type: Exclude<TxModalType, null>) => void;
}) {
  const { username, smartWalletAddress, balance, balanceLoading, refreshBalance, transactions } = useApp();
  const [range, setRange] = React.useState<Range>("7D");
  const [copied, setCopied] = React.useState(false);

  const data = reconstructBalanceHistory(transactions, balance, rangeDays[range]);
  const change = React.useMemo(() => {
    if (data.length < 2) return 0;
    const first = data[0].value || 1;
    const last = data[data.length - 1].value;
    return ((last - first) / first) * 100;
  }, [data]);

  function copyAddress() {
    if (!smartWalletAddress) return;
    navigator.clipboard?.writeText(smartWalletAddress).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <aside className="w-full xl:w-[340px] shrink-0 space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="rounded-[26px] p-6 text-white relative overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(130% 150% at 100% 0%, var(--wallet-700) 0%, var(--wallet-800) 45%, var(--wallet-900) 100%)",
          boxShadow: "var(--shadow-wallet)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 -right-16 h-52 w-52 rounded-full opacity-20 blur-3xl"
          style={{ backgroundImage: "var(--arc-gradient)" }}
        />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden">
              <ArcMark size={26} className="rounded-none" />
            </div>
            <div>
              <p className="text-sm font-semibold">Smart Wallet</p>
              <span className="text-[11px] text-emerald-300 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Active
              </span>
            </div>
          </div>
          <button
            onClick={() => refreshBalance()}
            disabled={balanceLoading}
            className="focus-ring h-7 w-7 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            {balanceLoading ? (
              <Loader2 className="h-3.5 w-3.5 text-white/60 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5 text-white/60" />
            )}
          </button>
        </div>

        <div className="relative mt-5 flex items-center gap-2 text-[11px] text-white/50">
          <span>@{username ?? "you"}</span>
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span className="px-2 py-0.5 rounded-full bg-white/10">Arc Testnet</span>
        </div>

        <p className="relative mt-4 text-xs text-white/50">Total Balance</p>
        <p className="relative text-4xl font-semibold tabular mt-1">
          ${formatUSDC(balance)} <span className="text-base text-white/50 font-normal">USDC</span>
        </p>

        <button
          onClick={copyAddress}
          className="focus-ring relative mt-2 flex items-center gap-1.5 text-xs text-white/60 hover:text-white/90 transition-colors"
        >
          <span className="font-mono">
            {smartWalletAddress ? shortAddress(smartWalletAddress) : ""}
          </span>
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
        </button>

        <div className="relative mt-4 h-20">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="wallet-spark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34D399" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#34D399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" hide />
              <Tooltip
                cursor={false}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-lg bg-black/70 backdrop-blur px-2 py-1 text-[10px] text-white">
                      ${Number(payload[0].value).toFixed(2)}
                    </div>
                  );
                }}
              />
              <Area type="monotone" dataKey="value" stroke="#34D399" strokeWidth={2} fill="url(#wallet-spark)" isAnimationActive />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="relative flex items-center justify-between mt-2">
          <span className={`text-xs font-medium ${change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {change >= 0 ? "+" : ""}
            {change.toFixed(2)}%
          </span>
          <div className="flex items-center gap-1 rounded-full bg-white/10 p-0.5">
            {ranges.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`focus-ring text-[10px] font-medium px-2.5 py-1 rounded-full transition-colors ${
                  range === r ? "bg-surface text-ink-900" : "text-white/60 hover:text-white"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="card p-2">
        {actions.map((a) => (
          <button
            key={a.key}
            onClick={() => onAction(a.key)}
            className="focus-ring w-full flex items-center gap-3 rounded-2xl px-3 py-3 hover:bg-surface-2 transition-colors group"
          >
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
              style={{ backgroundImage: "var(--arc-gradient-soft)" }}
            >
              <a.icon className="h-[18px] w-[18px] text-[var(--arc-blue)]" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-ink-900">{a.label}</p>
              <p className="text-[11px] text-ink-400">{actionSub[a.key]}</p>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
