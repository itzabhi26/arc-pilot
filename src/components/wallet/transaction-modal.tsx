"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import QRCode from "react-qr-code";
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowUpRight,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  QrCode,
  RefreshCw,
  Repeat,
  SendHorizonal,
  Wallet2,
  History as HistoryIcon,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArcMark } from "@/components/logo";
import { useApp } from "@/components/providers/app-provider";
import type { SpendingCategory, Transaction, TxModalType } from "@/lib/types";
import { SPENDING_CATEGORIES } from "@/lib/categories";
import { ARC_TESTNET, explorerAddressUrl, explorerTxUrl } from "@/lib/wallet/chain";
import { isValidAddress } from "@/lib/wallet/engine";
import { cn, formatUSDC, shortAddress, timeAgo } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

const meta: Record<
  Exclude<TxModalType, null | "history" | "receive">,
  { title: string; icon: typeof ArrowDownToLine; cta: string }
> = {
  deposit: { title: "Deposit", icon: ArrowDownToLine, cta: "Refresh balance" },
  withdraw: { title: "Withdraw", icon: ArrowUpFromLine, cta: "Withdraw funds" },
  send: { title: "Send", icon: SendHorizonal, cta: "Send funds" },
};

export function TransactionModal({
  type,
  onClose,
}: {
  type: TxModalType;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!type} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={type === "history" ? "max-w-lg" : "max-w-md"}>
        {type === "history" ? (
          <HistoryPanel />
        ) : type === "receive" ? (
          <ReceivePanel onClose={onClose} />
        ) : type === "deposit" ? (
          <DepositPanel onClose={onClose} />
        ) : type === "send" || type === "withdraw" ? (
          <SendFlowPanel type={type} onClose={onClose} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Deposit (fund the Smart Wallet from the connected wallet) ---------------- */

function DepositPanel({ onClose }: { onClose: () => void }) {
  const {
    smartWalletAddress,
    balance,
    connectedBalance,
    connectedBalanceLoading,
    refreshConnectedBalance,
    isDepositing,
    depositToSmartWallet,
  } = useApp();
  const [copied, setCopied] = React.useState(false);
  const [amount, setAmount] = React.useState("");
  const [stage, setStage] = React.useState<"form" | "processing" | "success" | "error">("form");
  const [hash, setHash] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    refreshConnectedBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function copy() {
    if (!smartWalletAddress) return;
    navigator.clipboard?.writeText(smartWalletAddress).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const numericAmount = parseFloat(amount) || 0;
  const canSubmit = numericAmount > 0 && numericAmount <= connectedBalance && !isDepositing;

  async function handleDeposit() {
    if (!canSubmit) return;
    setStage("processing");
    setError(null);
    try {
      const tx = await depositToSmartWallet(numericAmount);
      setHash(tx.hash);
      setStage("success");
    } catch (err) {
      const message =
        (err as { shortMessage?: string; message?: string })?.shortMessage ||
        (err as Error)?.message ||
        "Deposit failed or was rejected.";
      setError(message);
      setStage("error");
    }
  }

  return (
    <div className="p-7">
      <HeaderIcon icon={ArrowDownToLine} />
      <DialogTitle asChild>
        <h2 className="mt-3 text-lg font-semibold tracking-tight text-ink-900">Deposit</h2>
      </DialogTitle>

      <AnimatePresence mode="wait">
        {stage === "form" && (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-5">
            <p className="text-sm text-ink-500">
              Move funds from your connected wallet into your Smart Wallet.
            </p>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-surface-2 border border-border-subtle px-4 py-3">
              <span className="text-xs text-ink-400">Connected wallet balance</span>
              <span className="text-sm font-medium text-ink-900 tabular flex items-center gap-1.5">
                {connectedBalanceLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                ${formatUSDC(connectedBalance)} USDC
              </span>
            </div>

            <label className="text-xs font-medium text-ink-500 mt-4 block">Amount (USDC)</label>
            <div className="mt-1.5 flex items-center rounded-xl border border-border-soft bg-surface px-3.5 h-14 focus-within:border-[var(--arc-blue)] transition-colors">
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="0.00"
                inputMode="decimal"
                className="focus-ring flex-1 bg-transparent text-2xl font-semibold text-ink-900 placeholder:text-ink-300 outline-none tabular"
              />
              <span className="text-sm text-ink-400 font-medium">USDC</span>
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-xs text-ink-400">
                Available: <span className="tabular">${formatUSDC(connectedBalance)}</span>
              </span>
              <button
                onClick={() => setAmount(connectedBalance.toString())}
                className="focus-ring text-xs font-medium text-[var(--arc-blue)] hover:underline"
              >
                Max
              </button>
            </div>
            {numericAmount > connectedBalance && (
              <p className="mt-1 text-xs text-[var(--danger)]">Amount exceeds your connected wallet balance.</p>
            )}

            <p className="mt-3 text-xs text-ink-400">
              You&apos;ll be asked to sign this transfer in your wallet — it settles on Arc Testnet.
            </p>

            <Button size="lg" className="w-full mt-5" disabled={!canSubmit} onClick={handleDeposit}>
              Deposit to Smart Wallet
            </Button>

            <div className="mt-6 pt-5 border-t border-border-subtle">
              <p className="text-xs text-ink-500 mb-3">
                Or receive USDC directly from any exchange/wallet on Arc Testnet:
              </p>
              <div className="mx-auto h-28 w-28 rounded-2xl bg-surface border border-border-subtle flex items-center justify-center p-2.5">
                {smartWalletAddress && <QRCode value={smartWalletAddress} size={96} />}
              </div>
              <div className="mt-3 flex items-center justify-between rounded-xl bg-surface-2 border border-border-subtle px-4 py-3">
                <span className="text-xs font-mono text-ink-700 truncate">
                  {smartWalletAddress ? shortAddress(smartWalletAddress, 10) : ""}
                </span>
                <button onClick={copy} className="focus-ring text-ink-400 hover:text-ink-700 shrink-0 ml-2">
                  {copied ? <Check className="h-4 w-4 text-[var(--success)]" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-ink-400">Smart Wallet balance</span>
                <span className="font-medium text-ink-900 tabular">${formatUSDC(balance)} USDC</span>
              </div>
              <a
                href={ARC_TESTNET.faucetUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-[var(--arc-blue)] hover:underline"
              >
                Need test funds? Open the Circle faucet
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </motion.div>
        )}

        {stage === "processing" && (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-8 flex flex-col items-center py-6">
            <div className="relative h-16 w-16 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--arc-blue)] border-r-[var(--arc-violet)]"
              />
              <ArcMark size={28} />
            </div>
            <p className="mt-5 text-sm font-medium text-ink-700">Confirm in your wallet…</p>
            <p className="text-xs text-ink-400 mt-1 flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" />
              Waiting for signature and confirmation
            </p>
          </motion.div>
        )}

        {stage === "success" && (
          <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6 flex flex-col items-center py-4 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="h-16 w-16 rounded-full bg-[var(--success-soft)] flex items-center justify-center"
            >
              <Check className="h-8 w-8 text-[var(--success)]" strokeWidth={2.5} />
            </motion.div>
            <p className="mt-4 text-lg font-semibold text-ink-900">Deposit submitted</p>
            <p className="text-sm text-ink-500 mt-1 tabular">{formatUSDC(numericAmount)} USDC</p>

            <div className="mt-5 w-full rounded-xl bg-surface-2 border border-border-subtle px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-ink-400">Transaction hash</span>
              <span className="text-xs font-mono text-ink-700">{shortAddress(hash, 8)}</span>
            </div>

            <a
              href={explorerTxUrl(hash)}
              target="_blank"
              rel="noreferrer"
              className="mt-3 text-xs font-medium text-[var(--arc-blue)] flex items-center gap-1 hover:underline"
            >
              View on ArcScan <ExternalLink className="h-3 w-3" />
            </a>

            <Button size="lg" variant="secondary" className="w-full mt-6" onClick={onClose}>
              Done
            </Button>
          </motion.div>
        )}

        {stage === "error" && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6 flex flex-col items-center py-4 text-center">
            <div className="h-16 w-16 rounded-full bg-[var(--danger-soft)] flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-[var(--danger)]" />
            </div>
            <p className="mt-4 text-lg font-semibold text-ink-900">Deposit failed</p>
            <p className="text-sm text-ink-500 mt-1 max-w-xs">{error}</p>
            <div className="grid grid-cols-2 gap-2.5 w-full mt-6">
              <Button variant="secondary" size="lg" onClick={() => setStage("form")}>
                Try again
              </Button>
              <Button size="lg" onClick={onClose}>
                Close
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- Send / Withdraw (real signed transfer) ---------------- */

function SendFlowPanel({
  type,
  onClose,
}: {
  type: "send" | "withdraw";
  onClose: () => void;
}) {
  const { sendTransaction, balance, address } = useApp();
  const [stage, setStage] = React.useState<"form" | "processing" | "success" | "error">("form");
  const [amount, setAmount] = React.useState("");
  const [recipient, setRecipient] = React.useState("");
  const [category, setCategory] = React.useState<SpendingCategory>("Other");
  const [hash, setHash] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const m = meta[type];
  const isWithdraw = type === "withdraw";

  const numericAmount = parseFloat(amount) || 0;
  const recipientValid = isValidAddress(recipient);
  const canSubmit = numericAmount > 0 && numericAmount <= balance && recipientValid;

  async function handleSubmit() {
    if (!canSubmit) return;
    setStage("processing");
    setError(null);
    try {
      const tx = await sendTransaction(recipient.trim(), numericAmount, category);
      setHash(tx.hash);
      setStage("success");
    } catch (err) {
      const message =
        (err as { shortMessage?: string; message?: string })?.shortMessage ||
        (err as Error)?.message ||
        "Transaction failed or was rejected.";
      setError(message);
      setStage("error");
    }
  }

  return (
    <div className="p-7">
      <HeaderIcon icon={m.icon} />
      <DialogTitle asChild>
        <h2 className="mt-3 text-lg font-semibold tracking-tight text-ink-900">{m.title}</h2>
      </DialogTitle>

      <AnimatePresence mode="wait">
        {stage === "form" && (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-5">
            <label className="text-xs font-medium text-ink-500">Recipient address</label>
            <input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x…"
              className={cn(
                "focus-ring mt-1.5 w-full h-11 rounded-xl border bg-surface px-3.5 text-sm font-mono text-ink-900 placeholder:text-ink-400 outline-none transition-colors",
                recipient.length === 0
                  ? "border-border-soft focus:border-[var(--arc-blue)]"
                  : recipientValid
                  ? "border-[var(--success)]"
                  : "border-[var(--danger)]"
              )}
            />
            {recipient.length > 0 && !recipientValid && (
              <p className="mt-1 text-xs text-[var(--danger)]">Enter a valid 0x… address.</p>
            )}
            {isWithdraw && address && (
              <button
                onClick={() => setRecipient(address)}
                className="focus-ring mt-1.5 text-xs font-medium text-[var(--arc-blue)] hover:underline flex items-center gap-1"
              >
                <Wallet2 className="h-3 w-3" />
                Withdraw to Connected Wallet
              </button>
            )}

            <label className="text-xs font-medium text-ink-500 mt-4 block">Amount (USDC)</label>
            <div className="mt-1.5 flex items-center rounded-xl border border-border-soft bg-surface px-3.5 h-14 focus-within:border-[var(--arc-blue)] transition-colors">
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="0.00"
                inputMode="decimal"
                className="focus-ring flex-1 bg-transparent text-2xl font-semibold text-ink-900 placeholder:text-ink-300 outline-none tabular"
              />
              <span className="text-sm text-ink-400 font-medium">USDC</span>
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-xs text-ink-400">
                Available: <span className="tabular">${formatUSDC(balance)}</span>
              </span>
              <button
                onClick={() => setAmount(balance.toString())}
                className="focus-ring text-xs font-medium text-[var(--arc-blue)] hover:underline"
              >
                Max
              </button>
            </div>
            {numericAmount > balance && (
              <p className="mt-1 text-xs text-[var(--danger)]">Amount exceeds available balance.</p>
            )}

            {!isWithdraw && (
              <>
                <label className="text-xs font-medium text-ink-500 mt-4 block">Category</label>
                <div className="relative mt-1.5">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as SpendingCategory)}
                    className="focus-ring w-full h-11 appearance-none rounded-xl border border-border-soft bg-surface pl-3.5 pr-9 text-sm font-medium text-ink-900 outline-none transition-colors focus:border-[var(--arc-blue)]"
                  >
                    {SPENDING_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                </div>
                <p className="mt-1 text-[11px] text-ink-400">
                  Tags this transfer so FinPilot AI can analyze your spending by category.
                </p>
              </>
            )}

            <p className="mt-3 text-xs text-ink-400">
              You&apos;ll be asked to sign this transaction in your wallet — it settles on Arc Testnet.
            </p>

            <Button size="lg" className="w-full mt-5" disabled={!canSubmit} onClick={handleSubmit}>
              {m.cta}
            </Button>
          </motion.div>
        )}

        {stage === "processing" && (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-8 flex flex-col items-center py-6">
            <div className="relative h-16 w-16 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--arc-blue)] border-r-[var(--arc-violet)]"
              />
              <ArcMark size={28} />
            </div>
            <p className="mt-5 text-sm font-medium text-ink-700">Confirm in your wallet…</p>
            <p className="text-xs text-ink-400 mt-1 flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" />
              Waiting for signature and confirmation
            </p>
          </motion.div>
        )}

        {stage === "success" && (
          <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6 flex flex-col items-center py-4 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="h-16 w-16 rounded-full bg-[var(--success-soft)] flex items-center justify-center"
            >
              <Check className="h-8 w-8 text-[var(--success)]" strokeWidth={2.5} />
            </motion.div>
            <p className="mt-4 text-lg font-semibold text-ink-900">Transaction submitted</p>
            <p className="text-sm text-ink-500 mt-1 tabular">{formatUSDC(numericAmount)} USDC</p>

            <div className="mt-5 w-full rounded-xl bg-surface-2 border border-border-subtle px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-ink-400">Transaction hash</span>
              <span className="text-xs font-mono text-ink-700">{shortAddress(hash, 8)}</span>
            </div>

            <a
              href={explorerTxUrl(hash)}
              target="_blank"
              rel="noreferrer"
              className="mt-3 text-xs font-medium text-[var(--arc-blue)] flex items-center gap-1 hover:underline"
            >
              View on ArcScan <ExternalLink className="h-3 w-3" />
            </a>

            <Button size="lg" variant="secondary" className="w-full mt-6" onClick={onClose}>
              Done
            </Button>
          </motion.div>
        )}

        {stage === "error" && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6 flex flex-col items-center py-4 text-center">
            <div className="h-16 w-16 rounded-full bg-[var(--danger-soft)] flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-[var(--danger)]" />
            </div>
            <p className="mt-4 text-lg font-semibold text-ink-900">Transaction failed</p>
            <p className="text-sm text-ink-500 mt-1 max-w-xs">{error}</p>
            <div className="grid grid-cols-2 gap-2.5 w-full mt-6">
              <Button variant="secondary" size="lg" onClick={() => setStage("form")}>
                Try again
              </Button>
              <Button size="lg" onClick={onClose}>
                Close
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- Receive ---------------- */

function ReceivePanel({ onClose }: { onClose: () => void }) {
  const { smartWalletAddress } = useApp();
  const [copied, setCopied] = React.useState(false);

  function copy() {
    if (!smartWalletAddress) return;
    navigator.clipboard?.writeText(smartWalletAddress).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="p-7 text-center">
      <HeaderIcon icon={QrCode} center />
      <DialogTitle asChild>
        <h2 className="mt-3 text-lg font-semibold tracking-tight text-ink-900">Receive</h2>
      </DialogTitle>
      <p className="text-sm text-ink-500 mt-1">
        Share this address to receive USDC on Arc Testnet.
      </p>

      <div className="mt-6 mx-auto h-44 w-44 rounded-2xl bg-surface border border-border-subtle flex items-center justify-center p-3">
        {smartWalletAddress && <QRCode value={smartWalletAddress} size={144} />}
      </div>

      <div className="mt-5 flex items-center justify-between rounded-xl bg-surface-2 border border-border-subtle px-4 py-3">
        <span className="text-xs font-mono text-ink-700 truncate">
          {smartWalletAddress ? shortAddress(smartWalletAddress, 10) : ""}
        </span>
        <button onClick={copy} className="focus-ring text-ink-400 hover:text-ink-700 shrink-0 ml-2">
          {copied ? <Check className="h-4 w-4 text-[var(--success)]" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>

      <Button size="lg" variant="secondary" className="w-full mt-6" onClick={onClose}>
        Done
      </Button>
    </div>
  );
}

/* ---------------- History (real on-chain data) ---------------- */

const dirIcon = { in: ArrowDownLeft, out: ArrowUpRight, swap: Repeat } as const;
const dirBg = {
  in: "bg-[var(--success-soft)] text-[var(--success)]",
  out: "bg-[var(--danger-soft)] text-[var(--danger)]",
  swap: "bg-brand-soft text-[var(--arc-blue)]",
} as const;

function HistoryPanel() {
  const { transactions, historyLoading, historyError, refreshHistory, smartWalletAddress } = useApp();
  const [filter, setFilter] = React.useState<"all" | Transaction["direction"]>("all");

  const filtered = transactions.filter((t) => filter === "all" || t.direction === filter);

  return (
    <div className="p-7">
      <div className="flex items-center justify-between">
        <HeaderIcon icon={HistoryIcon} />
        <button
          onClick={() => refreshHistory()}
          disabled={historyLoading}
          className="focus-ring h-8 w-8 rounded-full flex items-center justify-center text-ink-400 hover:bg-surface-3 hover:text-ink-700 transition-colors"
        >
          {historyLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </button>
      </div>
      <DialogTitle asChild>
        <h2 className="mt-3 text-lg font-semibold tracking-tight text-ink-900">Transaction History</h2>
      </DialogTitle>

      <div className="flex items-center gap-1.5 mt-4 mb-2">
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
        <div className="mt-2 mb-2 flex items-start gap-2 rounded-xl bg-[var(--warning-soft)] px-3.5 py-3 text-xs text-[var(--warning)]">
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>
            Couldn&apos;t load activity from ArcScan ({historyError}). Transactions you send
            from this session still appear below.
          </span>
        </div>
      )}

      <div className="mt-2 max-h-[360px] overflow-y-auto -mx-2 px-2 space-y-0.5">
        {filtered.map((tx) => {
          const Icon = dirIcon[tx.direction];
          return (
            <div key={tx.id} className="flex items-center justify-between rounded-xl px-2 py-2.5 hover:bg-surface-2 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn("h-9 w-9 rounded-full flex items-center justify-center shrink-0", dirBg[tx.direction])}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-900 truncate">
                    {tx.label} {shortAddress(tx.counterparty, 6)}
                  </p>
                  <p className="text-xs text-ink-400 font-mono">{shortAddress(tx.hash, 6)}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className={cn("text-sm font-semibold tabular", tx.amount >= 0 ? "text-[var(--success)]" : "text-ink-900")}>
                  {formatUSDC(tx.amount, { sign: true })}
                </p>
                <p className="text-[11px] text-ink-400">
                  {tx.status === "pending" ? "Pending…" : timeAgo(tx.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
        {!historyLoading && filtered.length === 0 && (
          <p className="text-center text-sm text-ink-400 py-10">
            No transactions yet — send or receive USDC to see activity here.
          </p>
        )}
        {historyLoading && filtered.length === 0 && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-ink-400" />
          </div>
        )}
      </div>

      {smartWalletAddress && (
        <a
          href={explorerAddressUrl(smartWalletAddress)}
          target="_blank"
          rel="noreferrer"
          className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-[var(--arc-blue)] hover:underline"
        >
          View full history on ArcScan <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}

function HeaderIcon({
  icon: Icon,
  center = false,
}: {
  icon: typeof ArrowDownToLine;
  center?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5 mb-1", center ? "justify-center" : "justify-start")}>
      <div
        className="h-9 w-9 rounded-xl flex items-center justify-center"
        style={{ backgroundImage: "var(--arc-gradient-soft)" }}
      >
        <Icon className="h-[18px] w-[18px] text-[var(--arc-blue)]" />
      </div>
    </div>
  );
}
