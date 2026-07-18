"use client";

import { motion } from "framer-motion";
import { Copy, Check, ExternalLink, LogOut, RefreshCw, Loader2 } from "lucide-react";
import * as React from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/components/providers/app-provider";
import { ARC_TESTNET, explorerAddressUrl } from "@/lib/wallet/chain";
import { WALLETCONNECT_PROJECT_ID } from "@/lib/wallet/walletconnect";
import { isSmartWalletConfigured } from "@/lib/wallet/smart-wallet";
import { shortAddress } from "@/lib/utils";

export function SettingsPage() {
  const {
    address,
    smartWalletAddress,
    smartWalletCreated,
    connectorName,
    chainId,
    username,
    balance,
    balanceLoading,
    refreshBalance,
    disconnect,
  } = useApp();
  const [copied, setCopied] = React.useState<"signer" | "smart" | null>(null);

  function copy(value: string | null, which: "signer" | "smart") {
    if (!value) return;
    navigator.clipboard?.writeText(value).catch(() => {});
    setCopied(which);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl space-y-4">
      <Card>
        <CardHeader>
          <h3 className="text-[15px] font-semibold text-ink-900">Account</h3>
        </CardHeader>
        <div className="space-y-3">
          <SettingRow label="Username" value={username ? `@${username}` : "—"} />
          <SettingRow
            label="Smart Wallet"
            value={smartWalletAddress ? shortAddress(smartWalletAddress, 10) : "Not created yet"}
            mono={!!smartWalletAddress}
            action={
              smartWalletAddress ? (
                <button onClick={() => copy(smartWalletAddress, "smart")} className="focus-ring text-ink-400 hover:text-ink-700">
                  {copied === "smart" ? <Check className="h-4 w-4 text-[var(--success)]" /> : <Copy className="h-4 w-4" />}
                </button>
              ) : undefined
            }
          />
          <SettingRow
            label="Deployment status"
            value={
              !isSmartWalletConfigured()
                ? "Demo mode (factory not configured)"
                : smartWalletCreated
                ? "Deployed on-chain"
                : "Not deployed"
            }
          />
          <SettingRow
            label="Signer (MetaMask / Rabby)"
            value={address ? shortAddress(address, 10) : "—"}
            mono
            action={
              <button onClick={() => copy(address, "signer")} className="focus-ring text-ink-400 hover:text-ink-700">
                {copied === "signer" ? <Check className="h-4 w-4 text-[var(--success)]" /> : <Copy className="h-4 w-4" />}
              </button>
            }
          />
          <SettingRow label="Connected via" value={connectorName ?? "—"} />
          <SettingRow
            label="Balance"
            value={`$${balance.toFixed(2)} USDC`}
            action={
              <button
                onClick={() => refreshBalance()}
                disabled={balanceLoading}
                className="focus-ring text-ink-400 hover:text-ink-700"
              >
                {balanceLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </button>
            }
          />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-[15px] font-semibold text-ink-900">Network</h3>
          <Badge variant={chainId === ARC_TESTNET.chainId ? "success" : "danger"}>
            {chainId === ARC_TESTNET.chainId ? "Connected" : "Wrong network"}
          </Badge>
        </CardHeader>
        <div className="space-y-3">
          <SettingRow label="Network name" value={ARC_TESTNET.name} />
          <SettingRow label="Chain ID" value={String(ARC_TESTNET.chainId)} />
          <SettingRow label="RPC URL" value={ARC_TESTNET.rpcUrls[0]} mono />
          <SettingRow label="Block explorer" value={ARC_TESTNET.blockExplorerUrls[0]} mono />
        </div>
        <a
          href={ARC_TESTNET.faucetUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--arc-blue)] hover:underline"
        >
          Get testnet USDC from the Circle faucet <ExternalLink className="h-3 w-3" />
        </a>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-[15px] font-semibold text-ink-900">Connectors</h3>
        </CardHeader>
        <div className="space-y-3">
          <SettingRow
            label="WalletConnect"
            value={WALLETCONNECT_PROJECT_ID ? "Configured" : "Not configured"}
          />
          {!WALLETCONNECT_PROJECT_ID && (
            <p className="text-xs text-ink-400 leading-relaxed">
              Add <code className="font-mono bg-surface-3 px-1 py-0.5 rounded">NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID</code> to{" "}
              <code className="font-mono bg-surface-3 px-1 py-0.5 rounded">.env.local</code> — get a free id at{" "}
              <a href="https://dashboard.reown.com" target="_blank" rel="noreferrer" className="text-[var(--arc-blue)] hover:underline">
                dashboard.reown.com
              </a>
              .
            </p>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-[15px] font-semibold text-ink-900">Session</h3>
        </CardHeader>
        <p className="text-xs text-ink-500 leading-relaxed mb-4">
          Disconnecting clears your ARC Pilot session. Because injected
          wallets like MetaMask don&apos;t support programmatic disconnect,
          you may also want to disconnect this site from inside your wallet
          extension.
        </p>
        <Button variant="destructive" onClick={disconnect}>
          <LogOut className="h-4 w-4" />
          Disconnect wallet
        </Button>
      </Card>

      {address && (
        <a
          href={explorerAddressUrl(smartWalletAddress ?? address)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-1.5 text-xs font-medium text-ink-400 hover:text-[var(--arc-blue)] transition-colors"
        >
          View this address on ArcScan <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </motion.div>
  );
}

function SettingRow({
  label,
  value,
  mono = false,
  action,
}: {
  label: string;
  value: string;
  mono?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-ink-500 shrink-0">{label}</span>
      <div className="flex items-center gap-2 min-w-0">
        <span className={mono ? "font-mono text-xs text-ink-700 truncate" : "font-medium text-ink-900 truncate"}>
          {value}
        </span>
        {action}
      </div>
    </div>
  );
}
