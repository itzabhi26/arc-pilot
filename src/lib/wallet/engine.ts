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

export async function switchToArcTestnet(raw: Eip1193Provider): Promise<void> {
  try {
    await raw.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: ARC_TESTNET.chainIdHex }],
    });
  } catch (err) {
    const code = (err as { code?: number })?.code;
    // 4902 = chain not added to the wallet yet
    if (code === 4902) {
      await raw.request({
        method: "wallet_addEthereumChain",
        params: [addChainParams()],
      });
    } else {
      throw err;
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
