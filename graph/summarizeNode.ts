import { ResearchState, Task, TaskResult } from "./state";
import { payAndCall } from "./payClient";
import { budgetCheck } from "./budgetCheck";
import { writeReceipt } from "../ledger/db";

export async function summarizeNode(state: ResearchState, task: Task): Promise<Partial<ResearchState>> {
  const suggestions = budgetCheck(state, task);

  const upstreamContent = task.depends_on.map((depId) => state.results[depId]?.data);

  const { data, receipt } = await payAndCall(
    "http://localhost:4004/summarize",
    { content: upstreamContent },
    task.id,
    "summarize"
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
