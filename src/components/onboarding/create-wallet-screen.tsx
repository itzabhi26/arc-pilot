"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingShell } from "./connect-wallet-screen";
import { useApp } from "@/components/providers/app-provider";
import { shortAddress } from "@/lib/utils";

/**
 * Shown only when the Smart Wallet factory isn't configured/reachable
 * (NEXT_PUBLIC_SMART_WALLET_FACTORY_ADDRESS unset, wrong network, or the
 * RPC call failed). This is NOT part of the normal flow — for a correctly
 * configured deployment, a Smart Wallet address is resolved automatically
 * the moment a wallet connects, and this screen is never reached.
 */
export function CreateSmartWalletScreen() {
  const { address, connectorName, retrySmartWalletSetup, isCreatingWallet, connectError } = useApp();

  return (
    <OnboardingShell
      icon={<AlertTriangle className="h-5 w-5 text-[var(--warning)]" />}
      title="Smart Wallet setup needed"
      subtitle="The Smart Wallet factory isn't configured or isn't reachable on Arc Testnet yet. Set NEXT_PUBLIC_SMART_WALLET_FACTORY_ADDRESS in .env.local (deploy it once with scripts/deploy-smart-wallet-factory.mjs), then retry."
    >
      <div className="rounded-2xl border border-border-subtle bg-surface-2 px-4 py-3 flex items-center justify-between mb-5">
        <div>
          <p className="text-[11px] text-ink-400">{connectorName ?? "Connected wallet"}</p>
          <p className="text-sm font-mono text-ink-700 mt-0.5">
            {address ? shortAddress(address) : "—"}
          </p>
        </div>
        <span className="h-2 w-2 rounded-full bg-[var(--warning)]" />
      </div>

      {connectError && (
        <div className="mb-5 flex items-start gap-2 rounded-xl bg-[var(--warning-soft)] px-3.5 py-3 text-xs text-[var(--warning)]">
          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>{connectError}</span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {!isCreatingWallet ? (
          <motion.div key="cta" exit={{ opacity: 0 }}>
            <Button className="w-full" size="lg" onClick={() => retrySmartWalletSetup()}>
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center py-4"
          >
            <Loader2 className="h-5 w-5 animate-spin text-ink-400" />
            <p className="mt-3 text-xs text-ink-400">Checking the Smart Wallet factory…</p>
          </motion.div>
        )}
      </AnimatePresence>
    </OnboardingShell>
  );
}
