import "dotenv/config";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

const privateKey = process.env.WALLET_PRIVATE_KEY;
if (!privateKey) {
  throw new Error("WALLET_PRIVATE_KEY missing from .env");
}

// This module should NEVER be imported by anything that sends data back
// to the frontend. Wallet/account objects stay server-side only.
export const account = privateKeyToAccount(privateKey as `0x${string}`);

export const walletClient = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http(),
});
