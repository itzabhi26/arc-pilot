"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { AlertCircle, Loader2, QrCode, ShieldCheck, Wallet, Wallet2 } from "lucide-react";
import { ArcLogo } from "@/components/logo";
import { useApp } from "@/components/providers/app-provider";

const knownWalletMeta: Record<string, { hint: string }> = {
  metamask: { hint: "Browser extension" },
  rabby: { hint: "Browser extension" },
  "okx wallet": { hint: "Browser extension or app" },
  "coinbase wallet": { hint: "App or extension" },
};

export function ConnectWalletScreen() {
  const { connectors, connectWith, connectWalletConnect, isConnecting, connectError } = useApp();
  const [pendingUuid, setPendingUuid] = React.useState<string | null>(null);

  async function handleConnect(uuid: string) {
    setPendingUuid(uuid);
    await connectWith(uuid);
    setPendingUuid(null);
  }

  async function handleWalletConnect() {
    setPendingUuid("walletconnect");
    await connectWalletConnect();
    setPendingUuid(null);
  }

  return (
    <OnboardingShell
      icon={<Wallet className="h-5 w-5 text-[var(--arc-blue)]" />}
      title="Connect your wallet"
      subtitle="Link a wallet to start using ARC Pilot. This step never asks for your seed phrase."
    >
      <div className="space-y-2.5">
        {connectors.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border-soft px-4 py-5 text-center">
            <p className="text-sm text-ink-500">
              No wallet extension detected yet.
            </p>
            <p className="text-xs text-ink-400 mt-1">
              Install MetaMask, Rabby, or OKX Wallet, then refresh this page —
              or use WalletConnect below.
            </p>
          </div>
        )}

        {connectors.map((c, i) => {
          const key = c.info.name.toLowerCase();
          const meta = knownWalletMeta[key] ?? { hint: "Browser extension" };
          const busy = pendingUuid === c.info.uuid && isConnecting;
          return (
            <motion.button
              key={c.info.uuid}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              disabled={isConnecting}
              onClick={() => handleConnect(c.info.uuid)}
              className="focus-ring w-full flex items-center justify-between rounded-2xl border border-border-subtle bg-surface px-4 py-3.5 text-left transition-all hover:border-border-soft hover:shadow-[var(--shadow-card)] disabled:opacity-60"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-surface-3 flex items-center justify-center overflow-hidden">
                  {c.info.icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.info.icon} alt="" className="h-5 w-5" />
                  ) : (
                    <Wallet2 className="h-4 w-4 text-[var(--arc-blue)]" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-ink-900">{c.info.name}</p>
                  <p className="text-xs text-ink-400">{meta.hint}</p>
                </div>
              </div>
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin text-ink-400" />
              ) : (
                <span className="text-xs text-ink-400">Connect</span>
              )}
            </motion.button>
          );
        })}

        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: connectors.length * 0.05 }}
          disabled={isConnecting}
          onClick={handleWalletConnect}
          className="focus-ring w-full flex items-center justify-between rounded-2xl border border-border-subtle bg-surface px-4 py-3.5 text-left transition-all hover:border-border-soft hover:shadow-[var(--shadow-card)] disabled:opacity-60"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-surface-3 flex items-center justify-center">
              <QrCode className="h-4 w-4 text-[var(--arc-blue)]" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink-900">WalletConnect</p>
              <p className="text-xs text-ink-400">Scan with any mobile wallet</p>
            </div>
          </div>
          {pendingUuid === "walletconnect" && isConnecting ? (
            <Loader2 className="h-4 w-4 animate-spin text-ink-400" />
          ) : (
            <span className="text-xs text-ink-400">Connect</span>
          )}
        </motion.button>
      </div>

      {connectError && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-[var(--danger-soft)] px-3.5 py-3 text-xs text-[var(--danger)]">
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>{connectError}</span>
        </div>
      )}

      <div className="mt-6 flex items-center gap-2 text-xs text-ink-400">
        <ShieldCheck className="h-3.5 w-3.5" />
        Non-custodial. ARC Pilot never has access to your keys or funds.
      </div>
    </OnboardingShell>
  );
}

export function OnboardingShell({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-16 relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full opacity-[0.14] blur-3xl"
        style={{ backgroundImage: "var(--arc-gradient)" }}
      />
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <ArcLogo size={34} tagline />
        </div>
        <div className="card p-7">
          <div className="flex items-center gap-2.5 mb-1">
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center"
              style={{ backgroundImage: "var(--arc-gradient-soft)" }}
            >
              {icon}
            </div>
          </div>
          <h1 className="mt-3 text-xl font-semibold tracking-tight text-ink-900">
            {title}
          </h1>
          <p className="mt-1.5 text-sm text-ink-500 leading-relaxed">
            {subtitle}
          </p>
          <div className="mt-6">{children}</div>
        </div>
      </motion.div>
    </div>
  );
}
