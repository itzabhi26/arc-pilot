"use client";

import * as React from "react";
import type { SpendingCategory, Transaction } from "@/lib/types";
import { randomTxHash } from "@/lib/utils";
import { ARC_TESTNET } from "@/lib/wallet/chain";
import {
  walletDiscovery,
  type Eip1193Provider,
  type EIP6963ProviderDetail,
} from "@/lib/wallet/discovery";
import {
  fetchBalance,
  getChainId,
  isValidAddress,
  makeBrowserProvider,
  requestAccounts,
  sendNativeTransfer,
  switchToArcTestnet,
} from "@/lib/wallet/engine";
import { fetchOnChainHistory } from "@/lib/wallet/history";
import {
  deploySmartWallet,
  getSmartWalletAddress,
  isSmartWalletConfigured,
  isSmartWalletDeployed,
  sendFromSmartWallet,
} from "@/lib/wallet/smart-wallet";
import { getWalletConnectProvider, WALLETCONNECT_PROJECT_ID } from "@/lib/wallet/walletconnect";
import { parseUnits, type BrowserProvider } from "ethers";

export type OnboardingStep =
  | "connect"
  | "wrong-network"
  // Reached only when the Smart Wallet factory isn't configured/reachable —
  // see resolveSmartWallet(). Not part of the normal happy path: a real
  // Smart Wallet address is otherwise resolved automatically right after
  // connecting, with no separate manual "create" step.
  | "create-wallet"
  | "username"
  | "dashboard";

interface AppState {
  step: OnboardingStep;
  connectors: EIP6963ProviderDetail[];
  connectorName: string | null;
  address: string | null;
  chainId: number | null;
  smartWalletCreated: boolean; // whether the Smart Wallet contract is actually deployed on-chain
  smartWalletAddress: string | null; // the deterministic (CREATE2) Smart Wallet address — always != address
  username: string | null;
  balance: number;
  balanceLoading: boolean;
  connectedBalance: number;
  connectedBalanceLoading: boolean;
  transactions: Transaction[];
  historyLoading: boolean;
  historyError: string | null;
  isConnecting: boolean;
  isSwitchingNetwork: boolean;
  isCreatingWallet: boolean;
  isDepositing: boolean;
  connectError: string | null;
  // Flips true once the initial silent-reconnect attempt (eth_accounts,
  // no prompt) has resolved — whether it found a session or not. The
  // dashboard route waits for this before ever redirecting to the landing
  // page, so a hard refresh never bounces a still-connected user out.
  sessionChecked: boolean;
}

interface AppContextValue extends AppState {
  connectWith: (uuid: string) => Promise<void>;
  connectWalletConnect: () => Promise<void>;
  switchNetwork: () => Promise<void>;
  retrySmartWalletSetup: () => Promise<void>;
  setUsernameAndEnter: (name: string) => void;
  addTransaction: (tx: Transaction) => void;
  sendTransaction: (to: string, amount: number, category?: SpendingCategory) => Promise<Transaction>;
  depositToSmartWallet: (amount: number) => Promise<Transaction>;
  refreshBalance: () => Promise<void>;
  refreshConnectedBalance: () => Promise<void>;
  refreshHistory: () => Promise<void>;
  disconnect: () => void;
  isWrongNetwork: boolean;
}

const AppContext = React.createContext<AppContextValue | null>(null);

const USERNAME_KEY = "arc-pilot-username-v1";
const SESSION_KEY = "arc-pilot-session-v1";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AppState>({
    step: "connect",
    connectors: [],
    connectorName: null,
    address: null,
    chainId: null,
    smartWalletCreated: false,
    smartWalletAddress: null,
    username: null,
    balance: 0,
    balanceLoading: false,
    connectedBalance: 0,
    connectedBalanceLoading: false,
    transactions: [],
    historyLoading: false,
    historyError: null,
    isConnecting: false,
    isSwitchingNetwork: false,
    isCreatingWallet: false,
    isDepositing: false,
    connectError: null,
    sessionChecked: false,
  });

  const rawProviderRef = React.useRef<Eip1193Provider | null>(null);
  const browserProviderRef = React.useRef<BrowserProvider | null>(null);
  // Holds the detach function for the accountsChanged/chainChanged
  // listeners currently attached to rawProviderRef.current. Without this,
  // every reconnect would stack a fresh set of listeners on top of the
  // previous ones (they're never removed on disconnect), leaking memory
  // and eventually making the wallet provider misbehave on repeated
  // connect/disconnect cycles.
  const detachListenersRef = React.useRef<(() => void) | null>(null);

  // Discover installed wallets (EIP-6963)
  React.useEffect(() => {
    walletDiscovery.start();
    return walletDiscovery.subscribe((connectors) => {
      setState((s) => ({ ...s, connectors }));
    });
  }, []);

  const patch = (p: Partial<AppState>) => setState((s) => ({ ...s, ...p }));

  /** Resolves the dashboard Smart Wallet address for `address` via the
   * on-chain factory (CREATE2 — deterministic, computed from
   * `factory address + owner address`, so it is always different from the
   * connected EOA and is stable across reconnects). This is a plain view
   * call, so it works instantly on connect, before any signature and
   * before the Smart Wallet contract itself is deployed.
   *
   * If the factory isn't configured (NEXT_PUBLIC_SMART_WALLET_FACTORY_ADDRESS
   * unset) or isn't reachable, this returns nulls rather than falling back
   * to the connected EOA — the UI shows a clear setup screen instead of
   * silently pretending a Smart Wallet exists. */
  const resolveSmartWallet = React.useCallback(
    async (
      bp: BrowserProvider,
      address: string
    ): Promise<{ smartWalletAddress: string | null; smartWalletCreated: boolean }> => {
      if (!isSmartWalletConfigured()) {
        return { smartWalletAddress: null, smartWalletCreated: false };
      }
      try {
        const swAddress = await getSmartWalletAddress(bp, address);
        if (!swAddress) return { smartWalletAddress: null, smartWalletCreated: false };
        const deployed = await isSmartWalletDeployed(bp, swAddress);
        return { smartWalletAddress: swAddress, smartWalletCreated: deployed };
      } catch {
        return { smartWalletAddress: null, smartWalletCreated: false };
      }
    },
    []
  );

  const deriveStep = React.useCallback(
    (
      next: Partial<AppState> &
        Pick<AppState, "address" | "chainId" | "smartWalletAddress" | "username">
    ) => {
      if (!next.address) return "connect" as const;
      if (next.chainId !== ARC_TESTNET.chainId) return "wrong-network" as const;
      if (!next.smartWalletAddress) return "create-wallet" as const;
      if (!next.username) return "username" as const;
      return "dashboard" as const;
    },
    []
  );

  const attachListeners = React.useCallback((raw: Eip1193Provider) => {
    const onAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (!accounts || accounts.length === 0) {
        disconnectInternal();
        return;
      }
      const address = accounts[0];
      let username: string | null = null;
      try {
        username = window.localStorage.getItem(`${USERNAME_KEY}:${address.toLowerCase()}`);
      } catch {
        /* ignore */
      }
      try {
        window.localStorage.setItem(SESSION_KEY, JSON.stringify({ address }));
      } catch {
        /* ignore */
      }
      setState((s) => ({
        ...s,
        address,
        smartWalletAddress: null,
        smartWalletCreated: false,
        username,
        step: deriveStep({ address, chainId: s.chainId, smartWalletAddress: null, username }),
      }));
      if (browserProviderRef.current) {
        resolveSmartWallet(browserProviderRef.current, address).then((resolved) => {
          setState((s) => {
            if (s.address !== address) return s; // account changed again mid-flight
            return {
              ...s,
              smartWalletAddress: resolved.smartWalletAddress,
              smartWalletCreated: resolved.smartWalletCreated,
              step: deriveStep({
                address,
                chainId: s.chainId,
                smartWalletAddress: resolved.smartWalletAddress,
                username: s.username,
              }),
            };
          });
          if (resolved.smartWalletAddress && browserProviderRef.current) {
            refreshBalanceFor(browserProviderRef.current, resolved.smartWalletAddress);
            refreshHistoryFor(resolved.smartWalletAddress);
          }
        });
      }
    };
    const onChainChanged = (...args: unknown[]) => {
      const hex = args[0] as string;
      const chainId = parseInt(hex, 16);
      setState((s) => ({
        ...s,
        chainId,
        step: deriveStep({
          address: s.address,
          chainId,
          smartWalletAddress: s.smartWalletAddress,
          username: s.username,
        }),
      }));
    };
    raw.on("accountsChanged", onAccountsChanged);
    raw.on("chainChanged", onChainChanged);
    return () => {
      raw.removeListener("accountsChanged", onAccountsChanged);
      raw.removeListener("chainChanged", onChainChanged);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deriveStep, resolveSmartWallet]);

  async function finishConnect(raw: Eip1193Provider, name: string) {
    // Remove any listeners left over from a previous connect (e.g. this is
    // a reconnect after disconnect, or an account switch) before attaching
    // a fresh set — otherwise listeners accumulate on every cycle.
    detachListenersRef.current?.();
    rawProviderRef.current = raw;
    detachListenersRef.current = attachListeners(raw);

    const accounts = await requestAccounts(raw);
    const address = accounts[0];
    const chainId = await getChainId(raw);
    const bp = await makeBrowserProvider(raw);
    browserProviderRef.current = bp;

    let smartWalletCreated = false;
    let smartWalletAddress: string | null = null;
    let username: string | null = null;
    try {
      username = window.localStorage.getItem(`${USERNAME_KEY}:${address.toLowerCase()}`);
    } catch {
      // ignore corrupt storage
    }
    try {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify({ address }));
    } catch {
      /* ignore */
    }
    if (chainId === ARC_TESTNET.chainId) {
      // Counterfactual address resolution — a view call, no signature, no
      // deployment required. This is what makes Smart Wallet creation feel
      // automatic: the moment a wallet connects on the right network, its
      // dedicated Smart Wallet address exists and can receive funds.
      const resolved = await resolveSmartWallet(bp, address);
      smartWalletCreated = resolved.smartWalletCreated;
      smartWalletAddress = resolved.smartWalletAddress;
    }

    patch({
      connectorName: name,
      address,
      chainId,
      smartWalletCreated,
      smartWalletAddress,
      username,
      step: deriveStep({ address, chainId, smartWalletAddress, username }),
      isConnecting: false,
      connectError: null,
    });

    if (chainId === ARC_TESTNET.chainId && smartWalletAddress) {
      refreshBalanceFor(bp, smartWalletAddress);
      refreshHistoryFor(smartWalletAddress);
    }
  }

  const connectWith = React.useCallback(async (uuid: string) => {
    const detail = walletDiscovery.list.find((d) => d.info.uuid === uuid);
    if (!detail) return;
    patch({ isConnecting: true, connectError: null });
    try {
      await finishConnect(detail.provider, detail.info.name);
    } catch (err) {
      patch({
        isConnecting: false,
        connectError: err instanceof Error ? err.message : "Failed to connect wallet.",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connectWalletConnect = React.useCallback(async () => {
    patch({ isConnecting: true, connectError: null });
    try {
      if (!WALLETCONNECT_PROJECT_ID) {
        throw new Error(
          "WalletConnect isn't configured — add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID to .env.local."
        );
      }
      const provider = await getWalletConnectProvider();
      await (provider as unknown as { connect: () => Promise<void> }).connect();
      await finishConnect(provider, "WalletConnect");
    } catch (err) {
      patch({
        isConnecting: false,
        connectError: err instanceof Error ? err.message : "Failed to connect WalletConnect.",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchNetwork = React.useCallback(async () => {
    if (!rawProviderRef.current) return;
    patch({ isSwitchingNetwork: true, connectError: null });
    try {
      await switchToArcTestnet(rawProviderRef.current);
      const chainId = await getChainId(rawProviderRef.current);
      let smartWalletCreated = state.smartWalletCreated;
      let smartWalletAddress = state.smartWalletAddress;
      if (chainId === ARC_TESTNET.chainId && browserProviderRef.current && state.address) {
        const resolved = await resolveSmartWallet(browserProviderRef.current, state.address);
        smartWalletCreated = resolved.smartWalletCreated;
        smartWalletAddress = resolved.smartWalletAddress;
      }
      setState((s) => ({
        ...s,
        chainId,
        smartWalletCreated,
        smartWalletAddress,
        isSwitchingNetwork: false,
        step: deriveStep({
          address: s.address,
          chainId,
          smartWalletAddress,
          username: s.username,
        }),
      }));
      if (chainId === ARC_TESTNET.chainId && browserProviderRef.current && smartWalletAddress) {
        refreshBalanceFor(browserProviderRef.current, smartWalletAddress);
        refreshHistoryFor(smartWalletAddress);
      }
    } catch (err) {
      const raw = err as { code?: number; message?: string; shortMessage?: string };
      const message =
        raw?.code === 4001
          ? "Network switch was rejected in your wallet."
          : raw?.shortMessage || raw?.message || "Couldn't switch network. Try again.";
      patch({ isSwitchingNetwork: false, connectError: message });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deriveStep, state.address, state.smartWalletCreated, state.smartWalletAddress, resolveSmartWallet]);

  /** Used only by the "Smart Wallet factory not configured" setup screen to
   * re-check after the operator has deployed the factory / set the env var
   * (a page reload is usually simpler, but this avoids one for the operator
   * mid-debugging). Not part of the normal per-user flow. */
  const retrySmartWalletSetup = React.useCallback(async () => {
    if (!state.address || !browserProviderRef.current) return;
    patch({ isCreatingWallet: true });
    try {
      const resolved = await resolveSmartWallet(browserProviderRef.current, state.address);
      setState((s) => ({
        ...s,
        isCreatingWallet: false,
        smartWalletCreated: resolved.smartWalletCreated,
        smartWalletAddress: resolved.smartWalletAddress,
        step: deriveStep({
          address: s.address,
          chainId: s.chainId,
          smartWalletAddress: resolved.smartWalletAddress,
          username: s.username,
        }),
        connectError: resolved.smartWalletAddress
          ? null
          : "Smart Wallet factory still isn't configured or reachable.",
      }));
      if (resolved.smartWalletAddress && browserProviderRef.current) {
        refreshBalanceFor(browserProviderRef.current, resolved.smartWalletAddress);
        refreshHistoryFor(resolved.smartWalletAddress);
      }
    } catch (err) {
      patch({
        isCreatingWallet: false,
        connectError: err instanceof Error ? err.message : "Couldn't reach the Smart Wallet factory.",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.address, resolveSmartWallet, deriveStep]);

  const setUsernameAndEnter = React.useCallback((name: string) => {
    setState((s) => {
      if (s.address) {
        try {
          window.localStorage.setItem(`${USERNAME_KEY}:${s.address.toLowerCase()}`, name);
        } catch {
          /* ignore */
        }
      }
      return { ...s, username: name, step: "dashboard" };
    });
  }, []);

  const addTransaction = React.useCallback((tx: Transaction) => {
    setState((s) => ({
      ...s,
      transactions: [tx, ...s.transactions],
    }));
  }, []);

  const refreshBalanceFor = React.useCallback(async (bp: BrowserProvider, address: string) => {
    patch({ balanceLoading: true });
    try {
      const bal = await fetchBalance(bp, address);
      patch({ balance: bal, balanceLoading: false });
    } catch {
      patch({ balanceLoading: false });
    }
  }, []);

  const refreshHistoryFor = async (address: string) => {
    patch({ historyLoading: true, historyError: null });
    try {
      const txs = await fetchOnChainHistory(address);
      patch({ transactions: txs, historyLoading: false });
    } catch (err) {
      patch({
        historyLoading: false,
        historyError:
          err instanceof Error ? err.message : "Couldn't reach the ARC Testnet explorer.",
      });
    }
  };

  const refreshBalance = React.useCallback(async () => {
    if (!browserProviderRef.current || !state.smartWalletAddress) return;
    await refreshBalanceFor(browserProviderRef.current, state.smartWalletAddress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.smartWalletAddress]);

  const refreshConnectedBalance = React.useCallback(async () => {
    if (!browserProviderRef.current || !state.address) return;
    patch({ connectedBalanceLoading: true });
    try {
      const bal = await fetchBalance(browserProviderRef.current, state.address);
      patch({ connectedBalance: bal, connectedBalanceLoading: false });
    } catch {
      patch({ connectedBalanceLoading: false });
    }
  }, [state.address]);

  const refreshHistory = React.useCallback(async () => {
    if (!state.smartWalletAddress) return;
    await refreshHistoryFor(state.smartWalletAddress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.smartWalletAddress]);

  /** Send/Withdraw — moves funds OUT of the Smart Wallet. The Smart Wallet
   * contract only needs to actually exist on-chain to originate its first
   * outgoing transaction, so deployment happens lazily right here (one
   * extra signature the very first time) instead of a separate onboarding
   * step — deposits/receives already work on the counterfactual address
   * before this ever runs. */
  const sendTransaction = React.useCallback(
    async (to: string, amount: number, category: SpendingCategory = "Other"): Promise<Transaction> => {
      if (!browserProviderRef.current) throw new Error("Wallet not connected.");
      if (!state.smartWalletAddress) throw new Error("Smart Wallet isn't ready yet.");
      if (!isValidAddress(to)) throw new Error("Enter a valid 0x address to send to.");

      const bp = browserProviderRef.current;

      if (!state.smartWalletCreated) {
        const deployTx = await deploySmartWallet(bp);
        await deployTx.wait(1);
        setState((s) => ({ ...s, smartWalletCreated: true }));
      }

      const response = await sendFromSmartWallet(
        bp,
        state.smartWalletAddress,
        to,
        parseUnits(amount.toString(), ARC_TESTNET.nativeCurrency.decimals)
      );

      const tx: Transaction = {
        id: response.hash,
        direction: "out",
        label: "Sent",
        counterparty: to,
        amount: -amount,
        status: "pending",
        timestamp: new Date(),
        hash: response.hash,
        category,
      };
      addTransaction(tx);
      response
        .wait(1)
        .then((receipt) => {
          setState((s) => ({
            ...s,
            transactions: s.transactions.map((t) =>
              t.id === tx.id
                ? { ...t, status: receipt && receipt.status === 0 ? "failed" : "confirmed" }
                : t
            ),
          }));
          if (state.smartWalletAddress && browserProviderRef.current) {
            refreshBalanceFor(browserProviderRef.current, state.smartWalletAddress);
          }
        })
        .catch(() => {
          setState((s) => ({
            ...s,
            transactions: s.transactions.map((t) =>
              t.id === tx.id ? { ...t, status: "failed" } : t
            ),
          }));
        });
      return tx;
    },
    [state.smartWalletAddress, state.smartWalletCreated, addTransaction, refreshBalanceFor]
  );

  /** Deposit — moves funds FROM the connected wallet (MetaMask/Rabby/etc,
   * the "owner" EOA) INTO the Smart Wallet. A real signed transfer, exactly
   * like any other on-chain send, just targeting the Smart Wallet's own
   * (counterfactual-safe) address as the recipient. */
  const depositToSmartWallet = React.useCallback(
    async (amount: number): Promise<Transaction> => {
      if (!browserProviderRef.current) throw new Error("Wallet not connected.");
      if (!state.smartWalletAddress) throw new Error("Smart Wallet isn't ready yet.");
      if (amount <= 0) throw new Error("Enter an amount greater than 0.");

      patch({ isDepositing: true });
      try {
        const response = await sendNativeTransfer(
          browserProviderRef.current,
          state.smartWalletAddress,
          amount
        );

        const tx: Transaction = {
          id: response.hash,
          direction: "in",
          label: "Deposit",
          counterparty: state.address ?? "Connected wallet",
          amount,
          status: "pending",
          timestamp: new Date(),
          hash: response.hash,
          category: "Other",
        };
        addTransaction(tx);
        patch({ isDepositing: false });

        response
          .wait(1)
          .then((receipt) => {
            setState((s) => ({
              ...s,
              transactions: s.transactions.map((t) =>
                t.id === tx.id
                  ? { ...t, status: receipt && receipt.status === 0 ? "failed" : "confirmed" }
                  : t
              ),
            }));
            if (state.smartWalletAddress && browserProviderRef.current) {
              refreshBalanceFor(browserProviderRef.current, state.smartWalletAddress);
            }
            if (browserProviderRef.current && state.address) {
              refreshConnectedBalance();
            }
          })
          .catch(() => {
            setState((s) => ({
              ...s,
              transactions: s.transactions.map((t) =>
                t.id === tx.id ? { ...t, status: "failed" } : t
              ),
            }));
          });
        return tx;
      } catch (err) {
        patch({ isDepositing: false });
        throw err;
      }
    },
    [state.smartWalletAddress, state.address, addTransaction, refreshBalanceFor, refreshConnectedBalance]
  );

  function disconnectInternal() {
    detachListenersRef.current?.();
    detachListenersRef.current = null;
    rawProviderRef.current = null;
    browserProviderRef.current = null;
    try {
      window.localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
    setState({
      step: "connect",
      connectors: walletDiscovery.list,
      connectorName: null,
      address: null,
      chainId: null,
      smartWalletCreated: false,
      smartWalletAddress: null,
      username: null,
      balance: 0,
      balanceLoading: false,
      connectedBalance: 0,
      connectedBalanceLoading: false,
      transactions: [],
      historyLoading: false,
      historyError: null,
      isConnecting: false,
      isSwitchingNetwork: false,
      isCreatingWallet: false,
      isDepositing: false,
      connectError: null,
      sessionChecked: true,
    });
  }

  // Keep the Smart Wallet balance live in the background (e.g. an incoming
  // deposit from another wallet/exchange) without requiring a manual refresh.
  React.useEffect(() => {
    if (state.step !== "dashboard" || !state.smartWalletAddress || !browserProviderRef.current) return;
    const bp = browserProviderRef.current;
    const addr = state.smartWalletAddress;
    const interval = setInterval(() => {
      refreshBalanceFor(bp, addr);
    }, 12000);
    return () => clearInterval(interval);
  }, [state.step, state.smartWalletAddress, refreshBalanceFor]);

  const disconnect = React.useCallback(() => {
    const raw = rawProviderRef.current as unknown as { disconnect?: () => Promise<void> } | null;
    raw?.disconnect?.().catch(() => {});
    disconnectInternal();
  }, []);

  // Attempt silent reconnection on load (eth_accounts never prompts). Also
  // used by the dashboard route to know when to redirect a disconnected
  // visitor back to the landing page instead of showing an in-place
  // connect screen — see src/app/app/page.tsx.
  React.useEffect(() => {
    let settled = false;
    const markChecked = () => {
      if (settled) return;
      settled = true;
      patch({ sessionChecked: true });
    };

    let stored: { address?: string } | null = null;
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      stored = raw ? JSON.parse(raw) : null;
    } catch {
      stored = null;
    }
    if (!stored?.address) {
      // Nothing to restore — safe to let the dashboard route redirect
      // immediately if it needs to.
      markChecked();
      return;
    }

    // A previous session exists. Give installed wallets a moment to
    // announce themselves (EIP-6963) and attempt a silent reconnect
    // (eth_accounts never prompts the user). Bounded by a timeout so a
    // refresh never hangs indefinitely if no extension responds.
    const timeout = setTimeout(markChecked, 2500);

    const unsub = walletDiscovery.subscribe(async (connectors) => {
      if (state.address || connectors.length === 0) return;
      for (const detail of connectors) {
        try {
          const accounts = (await detail.provider.request({ method: "eth_accounts" })) as string[];
          if (accounts?.[0]?.toLowerCase() === stored?.address?.toLowerCase()) {
            await finishConnect(detail.provider, detail.info.name);
            markChecked();
            break;
          }
        } catch {
          /* try next connector */
        }
      }
    });

    return () => {
      clearTimeout(timeout);
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: AppContextValue = {
    ...state,
    connectWith,
    connectWalletConnect,
    switchNetwork,
    retrySmartWalletSetup,
    setUsernameAndEnter,
    addTransaction,
    sendTransaction,
    depositToSmartWallet,
    refreshBalance,
    refreshConnectedBalance,
    refreshHistory,
    disconnect,
    isWrongNetwork: state.step === "wrong-network",
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function useRandomTxHash() {
  return randomTxHash;
}
