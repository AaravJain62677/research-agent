import "dotenv/config";
import express from "express";
import { paymentMiddleware } from "@x402/express";
import { FACILITATOR_URL, CHAIN_NETWORK } from "../../shared/x402Config";

const app = express();
app.use(express.json());

const PAY_TO_ADDRESS = process.env.WALLET_PAYEE_ADDRESS || "0xReceivingAddress";

app.use(
  paymentMiddleware({
    payTo: PAY_TO_ADDRESS,
    routes: {
      "/summarize": {
        price: "$0.01",
        network: CHAIN_NETWORK,
      },
    },
    facilitator: { url: FACILITATOR_URL },
  })
);

app.post("/summarize", async (req, res) => {
  const { content } = req.body;

  // TODO: replace with a real LLM call.
  const dummyResult = {
    result: { summary: `Dummy summary of: ${JSON.stringify(content).slice(0, 80)}...` },
    sources: [],
  };

  res.json(dummyResult);
});

const PORT = 4004;
app.listen(PORT, () => console.log(`summarize-service listening on ${PORT}`));
