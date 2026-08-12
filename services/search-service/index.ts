import "dotenv/config";
import express from "express";
// NOTE: verify exact export name/signature against current @x402/express docs —
// paymentMiddleware's config shape (payTo, price, network, facilitator) is
// illustrative here and must be checked before running.
import { paymentMiddleware } from "@x402/express";
import { FACILITATOR_URL, CHAIN_NETWORK } from "../../shared/x402Config";

const app = express();
app.use(express.json());

const PAY_TO_ADDRESS = process.env.WALLET_PAYEE_ADDRESS || "0xReceivingAddress";

app.use(
  paymentMiddleware({
    payTo: PAY_TO_ADDRESS,
    routes: {
      "/search": {
        price: "$0.01",
        network: CHAIN_NETWORK,
      },
    },
    facilitator: { url: FACILITATOR_URL },
  })
);

// This handler only runs AFTER payment has been verified and settled
// by the middleware above.
app.post("/search", async (req, res) => {
  const { query } = req.body;

  // TODO: replace with a real web search API call (Tavily/Serper/etc.)
  const dummyResult = {
    result: [`Dummy search result for: ${query}`],
    sources: ["https://example.com/source-1"],
  };

  res.json(dummyResult);
});

const PORT = 4001;
app.listen(PORT, () => console.log(`search-service listening on ${PORT}`));
