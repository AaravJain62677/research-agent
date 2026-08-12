import { ResearchState, Task, TaskResult } from "./state";
import { payAndCall } from "./payClient";
import { budgetCheck } from "./budgetCheck";
import { writeReceipt } from "../ledger/db";

export function selectFactCheckTier(state: ResearchState): "quick" | "deep" {
  return state.budget.remaining < state.budget.total * 0.2 ? "quick" : "deep";
}

export async function factCheckNode(state: ResearchState, task: Task): Promise<Partial<ResearchState>> {
  const suggestions = budgetCheck(state, task);
  const tier = selectFactCheckTier(state);

  const claimSources = task.depends_on
    .map((depId) => state.results[depId])
    .filter(Boolean);

  const { data, receipt } = await payAndCall(
    "http://localhost:4003/fact-check",
    {
      claim: task.input,
      sources: claimSources.flatMap((r) => r.sources),
      tier,
    },
    task.id,
    "fact_check"
  );

  writeReceipt(receipt);

  const result: TaskResult = { data: data.result, sources: data.sources };

  return {
    results: { ...state.results, [task.id]: result },
    receipts: [...state.receipts, receipt],
    budget: { ...state.budget, remaining: state.budget.remaining - receipt.amount },
    suggestions,
  };
}
