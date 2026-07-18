"use client";

import {
  Contract,
  Interface,
  type BrowserProvider,
  type TransactionResponse,
} from "ethers";
import {
  SMART_WALLET_ABI,
  SMART_WALLET_FACTORY_ABI,
} from "./smart-wallet-artifacts";

/**
 * Address of the deployed SmartWalletFactory (contracts/SmartWalletFactory.sol)
 * on Arc Testnet. Deploy it once with `scripts/deploy-smart-wallet-factory.mjs`
 * and set NEXT_PUBLIC_SMART_WALLET_FACTORY_ADDRESS in .env.local.
 *
 * When unset, ARC Pilot falls back to using the connected signer's own
 * address as the dashboard address (the previous behavior) instead of
 * breaking — see app-provider.tsx.
 */
export const SMART_WALLET_FACTORY_ADDRESS =
  process.env.NEXT_PUBLIC_SMART_WALLET_FACTORY_ADDRESS?.trim() || null;

export function isSmartWalletConfigured(): boolean {
  return !!SMART_WALLET_FACTORY_ADDRESS;
}

const factoryInterface = new Interface(SMART_WALLET_FACTORY_ABI);
const walletInterface = new Interface(SMART_WALLET_ABI);

/** Reads the counterfactual Smart Wallet address for `owner` straight from
 * the factory contract (works even before it's deployed). */
export async function getSmartWalletAddress(
  provider: BrowserProvider,
  owner: string
): Promise<string | null> {
  if (!SMART_WALLET_FACTORY_ADDRESS) return null;
  const factory = new Contract(SMART_WALLET_FACTORY_ADDRESS, factoryInterface, provider);
  return (await factory.computeAddress(owner)) as string;
}

export async function isSmartWalletDeployed(
  provider: BrowserProvider,
  smartWalletAddress: string
): Promise<boolean> {
  const code = await provider.getCode(smartWalletAddress);
  return code !== "0x";
}

/** Deploys the caller's Smart Wallet via the factory — a real, owner-signed
 * transaction. Idempotent: safe to call again if already deployed. */
export async function deploySmartWallet(
  provider: BrowserProvider
): Promise<TransactionResponse> {
  if (!SMART_WALLET_FACTORY_ADDRESS) {
    throw new Error("Smart Wallet factory is not configured.");
  }
  const signer = await provider.getSigner();
  const factory = new Contract(SMART_WALLET_FACTORY_ADDRESS, factoryInterface, signer);
  return (await factory.deploy()) as TransactionResponse;
}

/** Sends `amount` (native token, in ether units) out of the Smart Wallet to
 * `to`, signed by the connected signer (MetaMask/Rabby) as the wallet
 * owner. This is how Send / Withdraw move funds that live in the Smart
 * Wallet, not in the signer's own EOA. */
export async function sendFromSmartWallet(
  provider: BrowserProvider,
  smartWalletAddress: string,
  to: string,
  valueWei: bigint
): Promise<TransactionResponse> {
  const signer = await provider.getSigner();
  const wallet = new Contract(smartWalletAddress, walletInterface, signer);
  return (await wallet.execute(to, valueWei, "0x")) as TransactionResponse;
}
