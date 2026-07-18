// Deploys SmartWalletFactory to Arc Testnet (or any EVM chain you point it
// at) using your own deployer key. This only needs to run ONCE per chain —
// after that, every user's Smart Wallet address is derived from it.
//
// Usage:
//   ARC_TESTNET_RPC_URL="https://..." DEPLOYER_PRIVATE_KEY="0x..." \
//     node scripts/deploy-smart-wallet-factory.mjs
//
// Then copy the printed address into .env.local as
//   NEXT_PUBLIC_SMART_WALLET_FACTORY_ADDRESS=0x...
//
// Requires network access to your RPC endpoint — this repo's sandboxed
// build environment does not have that, so this script must be run from
// your own machine / CI with real RPC + funded deployer key.
import { ContractFactory, JsonRpcProvider, Wallet } from "ethers";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const artifacts = JSON.parse(
  readFileSync(path.join(__dirname, "..", "contracts", "artifacts.json"), "utf8")
);
const { abi: SMART_WALLET_FACTORY_ABI, bytecode: SMART_WALLET_FACTORY_BYTECODE } =
  artifacts.smartWalletFactory;

const rpcUrl = process.env.ARC_TESTNET_RPC_URL;
const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

if (!rpcUrl || !privateKey) {
  console.error(
    "Set ARC_TESTNET_RPC_URL and DEPLOYER_PRIVATE_KEY environment variables first."
  );
  process.exit(1);
}

const provider = new JsonRpcProvider(rpcUrl);
const deployer = new Wallet(privateKey, provider);

console.log(`Deploying SmartWalletFactory from ${deployer.address} ...`);
const factory = new ContractFactory(
  SMART_WALLET_FACTORY_ABI,
  SMART_WALLET_FACTORY_BYTECODE,
  deployer
);
const contract = await factory.deploy();
await contract.waitForDeployment();
const address = await contract.getAddress();

console.log(`\nSmartWalletFactory deployed at: ${address}`);
console.log(`Add this to .env.local:\nNEXT_PUBLIC_SMART_WALLET_FACTORY_ADDRESS=${address}`);
