"use client";

/**
 * EIP-6963 ("Multi Injected Provider Discovery") lets a page discover every
 * installed wallet extension — MetaMask, Rabby, OKX Wallet, Coinbase, etc —
 * without them fighting over `window.ethereum`. Wallets that support it
 * announce themselves via a `eip6963:announceProvider` window event.
 */

export interface Eip1193Provider {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
  on: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener: (event: string, listener: (...args: unknown[]) => void) => void;
  isMetaMask?: boolean;
  isRabby?: boolean;
  isOkxWallet?: boolean;
}

export interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: Eip1193Provider;
}

type Listener = (providers: EIP6963ProviderDetail[]) => void;

class WalletDiscovery {
  private providers = new Map<string, EIP6963ProviderDetail>();
  private listeners = new Set<Listener>();
  private started = false;

  start() {
    if (this.started || typeof window === "undefined") return;
    this.started = true;

    window.addEventListener("eip6963:announceProvider", ((
      event: CustomEvent<EIP6963ProviderDetail>
    ) => {
      this.providers.set(event.detail.info.uuid, event.detail);
      this.emit();
    }) as EventListener);

    window.dispatchEvent(new Event("eip6963:requestProvider"));

    // Fallback for wallets that only expose the legacy window.ethereum
    // (no EIP-6963 announcement) — still let users connect to them.
    setTimeout(() => {
      const legacy = (window as unknown as { ethereum?: Eip1193Provider }).ethereum;
      if (legacy && this.providers.size === 0) {
        this.providers.set("legacy-injected", {
          info: {
            uuid: "legacy-injected",
            name: legacy.isMetaMask
              ? "MetaMask"
              : legacy.isRabby
              ? "Rabby"
              : legacy.isOkxWallet
              ? "OKX Wallet"
              : "Injected Wallet",
            icon: "",
            rdns: "legacy.injected",
          },
          provider: legacy,
        });
        this.emit();
      }
    }, 400);
  }

  private emit() {
    const list = Array.from(this.providers.values());
    this.listeners.forEach((l) => l(list));
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener(Array.from(this.providers.values()));
    return () => {
      this.listeners.delete(listener);
    };
  }

  get list() {
    return Array.from(this.providers.values());
  }
}

export const walletDiscovery = new WalletDiscovery();
