import { ResearchState, Task, TaskResult } from "./state";
import { payAndCall } from "./payClient";
import { budgetCheck } from "./budgetCheck";
import { writeReceipt } from "../ledger/db";

export async function searchNode(state: ResearchState, task: Task): Promise<Partial<ResearchState>> {
  const suggestions = budgetCheck(state, task);

  const { data, receipt } = await payAndCall(
    "http://localhost:4001/search",
    { query: task.input },
    task.id,
    "search"
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
