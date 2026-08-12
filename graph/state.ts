export interface Task {
  id: string;
  type: "search" | "enrich" | "fact_check" | "summarize";
  input: string;
  depends_on: string[];
  estimated_cost: number; // USD
}

export interface TaskResult {
  data: unknown;
  sources: string[];
}

export interface Receipt {
  task_id: string;
  service: string;
  amount: number;
  asset: string;
  tx_hash: string;
  status: "settled" | "failed" | "skipped_budget";
  timestamp: number;
}

export interface ResearchState {
  query: string;
  tasks: Task[];
  results: Record<string, TaskResult>;
  receipts: Receipt[];
  budget: {
    total: number;
    remaining: number;
  };
  suggestions: string[];
  report: string | null;
}

export function createInitialState(query: string, totalBudget: number): ResearchState {
  return {
    query,
    tasks: [],
    results: {},
    receipts: [],
    budget: { total: totalBudget, remaining: totalBudget },
    suggestions: [],
    report: null,
  };
}
