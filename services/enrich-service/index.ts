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
      "/enrich": {
        price: "$0.01",
        network: CHAIN_NETWORK,
      },
    },
    facilitator: { url: FACILITATOR_URL },
  })
);

app.post("/enrich", async (req, res) => {
  const { topic } = req.body;

  // TODO: replace with a real structured-data API call (Wikidata / stats API)
  const dummyResult = {
    result: { topic, facts: [`Dummy fact about ${topic}`] },
    sources: ["https://example.com/data-source"],
  };

  res.json(dummyResult);
});

const PORT = 4002;
app.listen(PORT, () => console.log(`enrich-service listening on ${PORT}`));
