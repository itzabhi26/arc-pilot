/**
 * Arc Testnet — Circle's public L1 for stablecoin finance.
 * Values from https://docs.arc.network (chain id, RPC, explorer) — real
 * public testnet parameters, not placeholders.
 */
export const ARC_TESTNET = {
  chainId: 5042002,
  chainIdHex: `0x${(5042002).toString(16)}`,
  name: "Arc Testnet",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.testnet.arc.network"],
  blockExplorerUrls: ["https://testnet.arcscan.app"],
  faucetUrl: "https://faucet.circle.com",
} as const;

export function explorerTxUrl(hash: string) {
  return `${ARC_TESTNET.blockExplorerUrls[0]}/tx/${hash}`;
}

export function explorerAddressUrl(address: string) {
  return `${ARC_TESTNET.blockExplorerUrls[0]}/address/${address}`;
}

/** Params for wallet_addEthereumChain / wallet_switchEthereumChain */
export function addChainParams() {
  return {
    chainId: ARC_TESTNET.chainIdHex,
    chainName: ARC_TESTNET.name,
    nativeCurrency: ARC_TESTNET.nativeCurrency,
    rpcUrls: ARC_TESTNET.rpcUrls,
    blockExplorerUrls: ARC_TESTNET.blockExplorerUrls,
  };
}
