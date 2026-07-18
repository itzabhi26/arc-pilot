"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingShell } from "./connect-wallet-screen";
import { useApp } from "@/components/providers/app-provider";
import { ARC_TESTNET } from "@/lib/wallet/chain";

export function WrongNetworkScreen() {
  const { chainId, switchNetwork, isSwitchingNetwork } = useApp();

  return (
    <OnboardingShell
      icon={<AlertTriangle className="h-5 w-5 text-[var(--warning)]" />}
      title="Switch to Arc Testnet"
      subtitle={`Your wallet is connected to chain ${chainId ?? "unknown"}. ARC Pilot only runs on Arc Testnet (chain ${ARC_TESTNET.chainId}).`}
    >
      <div className="rounded-2xl border border-border-subtle bg-surface-2 px-4 py-3.5 mb-5 space-y-1.5">
        <Row label="Network name" value={ARC_TESTNET.name} />
        <Row label="Chain ID" value={String(ARC_TESTNET.chainId)} />
        <Row label="RPC URL" value={ARC_TESTNET.rpcUrls[0]} mono />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Button
          size="lg"
          className="w-full"
          onClick={() => switchNetwork()}
          disabled={isSwitchingNetwork}
        >
          {isSwitchingNetwork ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Switching network…
            </>
          ) : (
            "Switch to Arc Testnet"
          )}
        </Button>
      </motion.div>

      <a
        href={ARC_TESTNET.faucetUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-4 flex items-center justify-center gap-1.5 text-xs font-medium text-[var(--arc-blue)] hover:underline"
      >
        Need testnet funds? Visit the Circle faucet
        <ExternalLink className="h-3 w-3" />
      </a>
    </OnboardingShell>
  );
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-ink-400">{label}</span>
      <span className={mono ? "font-mono text-ink-700" : "font-medium text-ink-700"}>
        {value}
      </span>
    </div>
  );
}
