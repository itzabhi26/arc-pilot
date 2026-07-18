# ARC Pilot

**AI Financial Operating System for ARC** — a real, non-custodial Web3 dashboard for **Arc Testnet** (Circle's stablecoin-native chain), paired with an AI agent (FinPilot) that reads your live on-chain activity.

## Tech Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui**-style primitives (Button, Card, Dialog, Badge, Tabs) on **Radix UI**
- **Framer Motion** — page transitions, scroll reveals, aurora/particle backgrounds
- **Recharts** — all charts
- **Ethers.js v6** — real signing, balances, transactions
- **WalletConnect v2** (`@walletconnect/ethereum-provider`)
- **EIP-6963** multi-wallet discovery (MetaMask, Rabby, OKX, and any other compliant extension)
- **react-qr-code** — real scannable QR for Receive/Deposit

## Getting started

```bash
npm install
cp .env.example .env.local   # optional — only needed for WalletConnect
npm run dev
```

Visit `http://localhost:3000` for the landing page, or `http://localhost:3000/app` for the product.

```bash
npm run build && npm run start   # production build
```

### WalletConnect setup (optional)

MetaMask, Rabby, and OKX Wallet work immediately via browser-extension injection. To enable the WalletConnect option, get a free project id at [dashboard.reown.com](https://dashboard.reown.com) and set:

```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_id_here
```

## What's real here

This is a genuinely non-custodial dApp — there is no separate backend wallet or fake infrastructure:

- **Wallet connection** is real EIP-1193 / EIP-6963, with real `eth_requestAccounts` signature prompts.
- **Network detection & switching** uses real `wallet_switchEthereumChain` / `wallet_addEthereumChain` against Arc Testnet's actual public parameters (chain id `5042002`, `rpc.testnet.arc.network`, explorer `testnet.arcscan.app`).
- **Balance** is read live via `provider.getBalance()`.
- **Send / Withdraw** submit a real signed `eth_sendTransaction` and track the real hash through `tx.wait()`, with a link to the real ArcScan explorer.
- **History** is fetched from ArcScan's Blockscout-compatible REST API for the connected address, with a fail-soft empty state (never fabricated data) if the explorer is unreachable.
- **"Smart Wallet"** = your connected address itself. ARC Pilot doesn't deploy a separate custodial or ERC-4337 smart-contract wallet — that would require deployed factory/paymaster infrastructure outside this repo's scope. The "Activate wallet" onboarding step is a one-time local confirmation, not an on-chain deployment. If you want true smart-account abstraction (gasless txs, session keys, social recovery), swap the wallet layer in `src/lib/wallet/` for something like Safe{Core} or a ERC-4337 bundler SDK.
- **AI insights / FinPilot answers** are template-driven functions over your real transaction data (`src/lib/analytics.ts`) — not a hosted LLM. Swap `answerFromData()` for a real model call (OpenAI/Anthropic/etc.) to upgrade to true natural-language reasoning; the UI and data plumbing are already wired for it.
- **Spending categories** (Food & Dining, Shopping, etc.) were removed — raw on-chain transfers carry no merchant metadata to categorize by, so fabricating them would be dishonest. The dashboard instead shows a real Sent/Received/Pending flow breakdown.

## Structure

```
src/
  app/
    page.tsx              # Landing page (aurora, particles, scroll reveals)
    app/page.tsx           # Hydration-safe gate: connect → network → activate → username → dashboard
    icon.png, apple-icon.png   # Real ARC brand favicon/touch icon
  components/
    logo.tsx                # ARC brand mark (public/brand/arc-logo.png)
    ui/                      # Button, Card, Badge, Dialog, Tabs
    providers/app-provider.tsx   # Wallet state machine — connect, network, balance, tx, history
    onboarding/              # Connect / Wrong Network / Activate / Username screens
    dashboard/               # Sidebar + 6 real pages (Dashboard, AI Agent, Analytics, History, Portfolio, Settings)
    wallet/                  # Smart Wallet panel + real transaction modal
    landing/                 # Aurora background, floating particles, motion variants
  lib/
    wallet/                  # chain.ts, discovery.ts, engine.ts, history.ts, walletconnect.ts
    analytics.ts             # All "AI insight" / chart / health-score derivation from real tx data
    types.ts, utils.ts
```

---
Built with ❤️ by ItzAbhi — Crafting AI × Web3 Experiences
