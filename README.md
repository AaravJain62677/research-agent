# Research Agent — x402 + LangGraph

## Status

**Part 1 — Graph & Payments is completed**
**Part 2 — Frontend, real integrations, live payments is in process**

---

## Part 1 — Done

This covers the entire orchestration and payment backbone:

- **LangGraph orchestration** (`graph/graph.ts`) — planner node, four task nodes (search/enrich/fact-check/summarize) with dependency-based routing, join logic, and a report node. Verified working end-to-end.
- **State schema** (`graph/state.ts`) — `ResearchState`, the single source of truth passed through the whole graph.
- **x402 payment integration** (`graph/payClient.ts`, `services/*/index.ts`) — buyer-side (`payAndCall`) and seller-side (`paymentMiddleware` on all four microservices) wired to the actual installed `@x402/express` / `@x402/core` / `@x402/evm` API.
- **Budget check** (`graph/budgetCheck.ts`) — non-blocking suggestion logging when a task's cost is tight against remaining budget.
- **Fact-check tier selection** (`graph/factCheckNode.ts`) — picks "quick" vs "deep" verification based on remaining budget.
- **SQLite ledger** (`ledger/db.ts`, using Node's built-in `node:sqlite`) — every payment attempt is logged and readable via `GET /receipts`.
- **Wallet handling** (`wallet/wallet.ts`) — viem-based testnet signer, isolated from anything returned to the frontend.
- **Server** (`server.ts`) — exposes `POST /run` and `GET /receipts` as the stable API contract for the frontend.

**Verified:** full pipeline (planner → all four task nodes → report) runs end-to-end and returns `{ report, receipts, suggestions, total_cost }`. Currently running with `payAndCall` **stubbed** (returns dummy data instead of making real x402 payments) — see below for why and what's left.

---

## Part 2 - Under Process

### Payments — currently stubbed
`graph/payClient.ts` has a temporary stub in place instead of the real x402 call, because the wallet isn't funded with Base Sepolia testnet ETH/USDC yet (faucets have been gated behind mainnet-balance requirements). The real implementation is commented out at the bottom of that same file — once the wallet is funded:
1. Uncomment the real `payClient` setup and `payAndCall` implementation
2. Remove the stub version
3. Re-run `npm run test:payment` to confirm real payments settle
4. Re-run the `/run` end-to-end test to confirm the graph still works with real payments

### Dummy data to replace with real calls
- `graph/planner.ts` — hardcoded task list → needs a real LLM call to decompose the query
- `graph/reportNode.ts` — hardcoded report string → needs a real LLM call to compile the final cited report
- `services/search-service/index.ts` — needs a real web search API (Tavily/Serper/etc.)
- `services/enrich-service/index.ts` — needs a real structured-data API (Wikidata/stats)
- `services/fact-check-service/index.ts` — needs a real LLM call for claim verification
- `services/summarize-service/index.ts` — needs a real LLM call for summarization

### Frontend
Build against the existing API contract:
- `POST /run` — body `{ query: string, budget: number }`, returns `{ report, receipts, suggestions, total_cost }`
- `GET /receipts` — returns `{ receipts, total_spent }`

Suggested UI: query input, live task/payment log, final report view, receipts/cost dashboard.

---

## Setup (for anyone picking this up)

1. `npm install`
2. `cp .env.example .env` and fill in `WALLET_PRIVATE_KEY`, `WALLET_PAYEE_ADDRESS`, `FACILITATOR_URL`, `LLM_API_KEY`
3. Fund the wallet with Base Sepolia ETH + test USDC (see faucet notes below)
4. `npm run service:search` (and enrich/factcheck/summarize in separate terminals)
5. `npm run test:payment` — confirms real x402 flow once wallet is funded
6. `npm start` — starts the orchestrator on port 3000
7. Test: `Invoke-RestMethod -Uri "http://localhost:3000/run" -Method Post -ContentType "application/json" -Body '{"query": "test query", "budget": 1.0}'`

### Faucet notes
Several popular faucets (Alchemy, QuickNode, thirdweb) require a small existing mainnet ETH balance or a paid plan to prevent abuse. Working alternatives to try: Circle's faucet (`faucet.circle.com`, for USDC), Chainlink's faucet (`faucets.chain.link/base-sepolia`), or community/PoW faucets. Until funded, the graph runs fully functional with `payAndCall` stubbed.
