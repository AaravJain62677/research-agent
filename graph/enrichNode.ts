import { ResearchState, Task, TaskResult } from "./state";
import { payAndCall } from "./payClient";
import { budgetCheck } from "./budgetCheck";
import { writeReceipt } from "../ledger/db";

export async function enrichNode(state: ResearchState, task: Task): Promise<Partial<ResearchState>> {
  const suggestions = budgetCheck(state, task);

  // Pulls whatever upstream result this task depends on, if any, to decide
  // what to enrich.
  const upstream = task.depends_on[0] ? state.results[task.depends_on[0]] : undefined;
  const topic = upstream ? JSON.stringify(upstream.data).slice(0, 100) : task.input;

  const { data, receipt } = await payAndCall(
    "http://localhost:4002/enrich",
    { topic },
    task.id,
    "enrich"
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
