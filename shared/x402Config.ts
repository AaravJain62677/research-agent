import "dotenv/config";

// Central place for x402 network/facilitator config so every node and
// service references the same values instead of hardcoding strings.
export const CHAIN_NETWORK = process.env.CHAIN_NETWORK || "eip155:84532"; // Base Sepolia
export const FACILITATOR_URL = process.env.FACILITATOR_URL || "";

// NOTE: verify exact export names (ExactEvmScheme, wrapAxiosWithPaymentFromConfig,
// paymentMiddleware signature) against the current @x402/* docs before running —
// these packages are actively versioned and names/signatures can shift.
