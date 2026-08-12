import "dotenv/config";
import express from "express";
import { paymentMiddleware } from "@x402/express";
import { FACILITATOR_URL, CHAIN_NETWORK } from "../../shared/x402Config";

const app = express();
app.use(express.json());

const PAY_TO_ADDRESS = process.env.WALLET_PAYEE_ADDRESS || "0xReceivingAddress";

// Two price points for the "quick" vs "deep" tier, selected by the graph's
// selectFactCheckTier() based on remaining budget.
app.use(
  paymentMiddleware({
    payTo: PAY_TO_ADDRESS,
    routes: {
      "/fact-check": {
        price: "$0.02", // deep tier default; adjust dynamically if the SDK supports per-request pricing
        network: CHAIN_NETWORK,
      },
    },
    facilitator: { url: FACILITATOR_URL },
  })
);

app.post("/fact-check", async (req, res) => {
  const { claim, sources, tier } = req.body as {
    claim: string;
    sources: string[];
    tier?: "quick" | "deep";
  };

  // TODO: replace with a real LLM call.
  // "quick" = single-source check, "deep" = cross-source verification.
  const dummyVerdict = {
    result: {
      verdict: "supported",
      explanation: `Dummy ${tier ?? "deep"} verification for claim: ${claim}`,
    },
    sources,
  };

  res.json(dummyVerdict);
});

const PORT = 4003;
app.listen(PORT, () => console.log(`fact-check-service listening on ${PORT}`));
