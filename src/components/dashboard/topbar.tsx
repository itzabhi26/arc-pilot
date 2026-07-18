"use client";

import { Bell, ChevronDown, LogOut } from "lucide-react";
import * as React from "react";
import { ArcMark } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useApp } from "@/components/providers/app-provider";
import { ARC_TESTNET } from "@/lib/wallet/chain";

export function Topbar({
  username,
  onOpenSettings,
}: {
  username: string | null;
  onOpenSettings: () => void;
}) {
  const { chainId, transactions, disconnect } = useApp();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const alerts = transactions.filter((t) => t.status === "failed" || t.status === "pending").length;
  const onCorrectChain = chainId === ARC_TESTNET.chainId;

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
          Hello, {username ? `@${username}` : "there"} 👋
        </h1>
        <p className="text-sm text-ink-500 mt-0.5">AI powered finance. Built on ARC.</p>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <button
          onClick={onOpenSettings}
          className="focus-ring flex items-center gap-2 rounded-full border border-border-soft bg-surface px-3.5 py-2 text-sm font-medium text-ink-700 hover:bg-surface-hover transition-colors"
        >
          <ArcMark size={16} />
          <span className={onCorrectChain ? "" : "text-[var(--danger)]"}>
            {onCorrectChain ? ARC_TESTNET.name : "Wrong network"}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-ink-400" />
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="focus-ring relative h-10 w-10 rounded-full border border-border-soft bg-surface flex items-center justify-center hover:bg-surface-hover transition-colors"
          >
            <Bell className="h-4 w-4 text-ink-700" />
            {alerts > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[var(--arc-violet)] text-white text-[10px] font-semibold flex items-center justify-center">
                {alerts}
              </span>
            )}
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-12 z-20 w-56 rounded-2xl border border-border-subtle bg-surface shadow-[var(--shadow-card-hover)] p-2">
                {alerts === 0 ? (
                  <p className="px-3 py-4 text-xs text-ink-400 text-center">You&apos;re all caught up.</p>
                ) : (
                  transactions
                    .filter((t) => t.status === "failed" || t.status === "pending")
                    .slice(0, 5)
                    .map((t) => (
                      <div key={t.id} className="px-3 py-2 rounded-xl hover:bg-surface-2">
                        <p className="text-xs font-medium text-ink-900">
                          {t.status === "failed" ? "Transaction failed" : "Transaction pending"}
                        </p>
                        <p className="text-[11px] text-ink-400">{t.label} · {Math.abs(t.amount).toFixed(2)} USDC</p>
                      </div>
                    ))
                )}
                <div className="border-t border-border-subtle mt-1 pt-1">
                  <button
                    onClick={disconnect}
                    className="focus-ring w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[var(--danger)] hover:bg-[var(--danger-soft)] transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Disconnect wallet
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
