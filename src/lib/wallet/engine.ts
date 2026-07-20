"use client";

import { BrowserProvider, formatUnits, parseUnits, type Eip1193Provider as EthersEip1193Provider, type TransactionResponse } from "ethers";
import { ARC_TESTNET, addChainParams } from "./chain";
import type { Eip1193Provider } from "./discovery";

export async function makeBrowserProvider(raw: Eip1193Provider) {
  // ethers v6 BrowserProvider wraps any EIP-1193 injected/WalletConnect provider
  return new BrowserProvider(raw as unknown as EthersEip1193Provider, "any");
}

export async function requestAccounts(raw: Eip1193Provider): Promise<string[]> {
  const accounts = (await raw.request({ method: "eth_requestAccounts" })) as string[];
  return accounts;
}

export async function getChainId(raw: Eip1193Provider): Promise<number> {
  const hex = (await raw.request({ method: "eth_chainId" })) as string;
  return parseInt(hex, 16);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function requestSwitch(raw: Eip1193Provider): Promise<void> {
  await raw.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: ARC_TESTNET.chainIdHex }],
  });
}

export async function switchToArcTestnet(raw: Eip1193Provider): Promise<void> {
  try {
    await requestSwitch(raw);
    return;
  } catch (err) {
    const code = (err as { code?: number })?.code;
    // 4001 = the user explicitly rejected the switch in their wallet —
    // that's a real rejection, not an "unrecognized chain" problem, so
    // don't mask it by trying to add the chain next.
    if (code === 4001) throw err;
    // Any other failure — including MetaMask's documented 4902
    // ("unrecognized chain"), but also wallets like Rabby that don't
    // always report that exact code for the same situation — try adding
    // the chain next. Adding an already-known chain is a harmless no-op.
  }

  await raw.request({
    method: "wallet_addEthereumChain",
    params: [addChainParams()],
  });

  // Some wallets (MetaMask) switch automatically right after the chain is
  // added, so check first instead of unconditionally firing another
  // switch request.
  try {
    const current = await getChainId(raw);
    if (current === ARC_TESTNET.chainId) return;
  } catch {
    // ignore — fall through to the explicit switch below
  }

  // Rabby in particular has a race condition: right after
  // wallet_addEthereumChain resolves, its internal chain registry (the
  // list wallet_switchEthereumChain checks against) hasn't finished
  // syncing yet, so an immediate switch call fails with the exact same
  // "Unrecognized chain ID" error as before the chain was even added.
  // Retrying a few times with a short delay gives Rabby's UI a moment to
  // catch up instead of surfacing that confusing error to the user.
  const retryDelaysMs = [300, 600, 1000];
  for (let attempt = 0; attempt < retryDelaysMs.length; attempt++) {
    try {
      await requestSwitch(raw);
      return;
    } catch (err) {
      const code = (err as { code?: number })?.code;
      if (code === 4001) throw err;
      const isLastAttempt = attempt === retryDelaysMs.length - 1;
      if (isLastAttempt) throw err;
      await sleep(retryDelaysMs[attempt]);
    }
  }
}

export async function fetchBalance(provider: BrowserProvider, address: string): Promise<number> {
  const wei = await provider.getBalance(address);
  return parseFloat(formatUnits(wei, ARC_TESTNET.nativeCurrency.decimals));
}

export async function sendNativeTransfer(
  provider: BrowserProvider,
  to: string,
  amount: number
): Promise<TransactionResponse> {
  const signer = await provider.getSigner();
  const value = parseUnits(amount.toString(), ARC_TESTNET.nativeCurrency.decimals);
  return signer.sendTransaction({ to, value });
}

export function isValidAddress(value: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(value.trim());
}
