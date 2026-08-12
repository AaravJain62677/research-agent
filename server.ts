import "dotenv/config";
import express from "express";
import { app as graphApp, createInitialState } from "./graph/graph";
import { getAllReceipts, getTotalSpent } from "./ledger/db";

const server = express();
server.use(express.json());

// CORS — allow the frontend dev server to call this during the hackathon.
server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

server.post("/run", async (req, res) => {
  const { query, budget } = req.body as { query: string; budget?: number };

  if (!query) {
    return res.status(400).json({ error: "query is required" });
  }

  const initialState = createInitialState(query, budget ?? 1.0);

  try {
    const finalState = await graphApp.invoke(initialState);
    res.json({
      report: finalState.report,
      receipts: finalState.receipts,
      suggestions: finalState.suggestions,
      total_cost: finalState.budget.total - finalState.budget.remaining,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "graph execution failed" });
  }
});

server.get("/receipts", (_req, res) => {
  res.json({ receipts: getAllReceipts(), total_spent: getTotalSpent() });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`orchestrator server on ${PORT}`));
