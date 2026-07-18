"use client";

import { ARC_TESTNET } from "./chain";
import type { Transaction } from "@/lib/types";

interface BlockscoutTx {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  isError?: string;
  txreceipt_status?: string;
}

/**
 * ArcScan is Blockscout-based, which exposes the classic Etherscan-style
 * `?module=account&action=txlist` REST endpoint with no API key required
 * for read access. If the endpoint is unreachable (CORS, rate limit, or the
 * explorer changes shape) we fail soft and let the UI show an honest empty
 * state instead of fabricated data.
 */
export async function fetchOnChainHistory(address: string): Promise<Transaction[]> {
  const url = `${ARC_TESTNET.blockExplorerUrls[0]}/api?module=account&action=txlist&address=${address}&sort=desc&limit=25`;

  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`Explorer responded ${res.status}`);

  const json = await res.json();
  const list: BlockscoutTx[] = Array.isArray(json?.result) ? json.result : [];

  return list.map((tx) => {
    const isOutgoing = tx.from?.toLowerCase() === address.toLowerCase();
    const amount = Number(tx.value) / 10 ** ARC_TESTNET.nativeCurrency.decimals;
    return {
      id: tx.hash,
      direction: isOutgoing ? "out" : "in",
      label: isOutgoing ? "Sent" : "Received",
      counterparty: isOutgoing ? tx.to : tx.from,
      amount: isOutgoing ? -amount : amount,
      status:
        tx.isError === "1" || tx.txreceipt_status === "0" ? "failed" : "confirmed",
      timestamp: new Date(Number(tx.timeStamp) * 1000),
      hash: tx.hash,
      category: "Other",
    } satisfies Transaction;
  });
}
