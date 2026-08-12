# Research Agent (x402 + LangGraph)

## Setup
1. `npm install`
2. `cp .env.example .env` and fill in `WALLET_PRIVATE_KEY`, `FACILITATOR_URL`, `LLM_API_KEY`
3. Fund the testnet wallet with Base Sepolia ETH + test USDC from a faucet

## Build/run order (do NOT skip ahead)
1. `npm run service:search` — start the search microservice
2. `npm run test:payment` — confirm the x402 payment flow works end to end.
   **Do not proceed until this succeeds.**
3. Start the remaining services in separate terminals:
   `npm run service:enrich`, `npm run service:factcheck`, `npm run service:summarize`
4. `npm start` — starts the orchestrator server on port 3000
5. POST to `http://localhost:3000/run` with `{ "query": "...", "budget": 1.0 }`

## Known TODOs before demo-ready
- All service handlers currently return dummy data — wire in real search/data/LLM calls
- Planner and report nodes use dummy logic — wire in real LLM calls
- `graph/graph.ts` channel/reducer config and conditional-edge API needs
  verification against the installed `@langchain/langgraph` version's docs
- `@x402/express` `paymentMiddleware` config shape needs verification against
  current docs before first run
- Frontend (Person B) consumes `POST /run` and `GET /receipts`
