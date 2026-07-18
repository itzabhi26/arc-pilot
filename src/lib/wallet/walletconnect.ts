"use client";

import { ARC_TESTNET } from "./chain";
import type { Eip1193Provider } from "./discovery";

/**
 * WalletConnect v2 requires a project id from https://dashboard.reown.com.
 * We read it from NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID so this ships wired
 * end-to-end — you only need to drop your own id in `.env.local` to go live.
 * Without one, the button below explains exactly what's missing rather than
 * silently failing.
 */
export const WALLETCONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

let cachedProvider: (Eip1193Provider & { connect: () => Promise<void>; disconnect: () => Promise<void> }) | null =
  null;

export async function getWalletConnectProvider() {
  if (!WALLETCONNECT_PROJECT_ID) {
    throw new Error(
      "WalletConnect isn't configured yet — add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID to .env.local (get a free project id at dashboard.reown.com)."
    );
  }
  if (cachedProvider) return cachedProvider;

  const { EthereumProvider } = await import("@walletconnect/ethereum-provider");
  const provider = await EthereumProvider.init({
    projectId: WALLETCONNECT_PROJECT_ID,
    chains: [ARC_TESTNET.chainId],
    optionalChains: [ARC_TESTNET.chainId],
    showQrModal: true,
    rpcMap: { [ARC_TESTNET.chainId]: ARC_TESTNET.rpcUrls[0] },
    metadata: {
      name: "ARC Pilot",
      description: "AI Financial Operating System for ARC",
      url: typeof window !== "undefined" ? window.location.origin : "https://arcpilot.app",
      icons: ["/brand/arc-logo.png"],
    },
  });

  cachedProvider = provider as unknown as Eip1193Provider & {
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
  };
  return cachedProvider;
}
