// Run this BEFORE building the graph or any other service.
// It confirms the core x402 buyer flow works end to end against
// one running seller (services/search-service).
//
// 1. In one terminal: npm run service:search
// 2. In another:      npm run test:payment

import axios from "axios";
// NOTE: verify these exact exports against the installed @x402/axios + @x402/evm
// version — v2 API surface. This mirrors the current documented pattern.
import { wrapAxiosWithPaymentFromConfig } from "@x402/axios";
import { ExactEvmScheme } from "@x402/evm";
import { account } from "../wallet/wallet";
import { CHAIN_NETWORK } from "../shared/x402Config";

const api = wrapAxiosWithPaymentFromConfig(axios.create(), {
  schemes: [
    {
      network: CHAIN_NETWORK,
      client: new ExactEvmScheme(account),
    },
  ],
});

async function main() {
  try {
    const res = await api.post("http://localhost:4001/search", {
      query: "test query",
    });
    console.log("Payment + call succeeded:");
    console.log(res.data);
  } catch (err) {
    console.error("Payment flow failed:", err);
  }
}

main();
