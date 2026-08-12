import { ResearchState, Task } from "./state";

export async function plannerNode(state: ResearchState): Promise<Partial<ResearchState>> {
  const dummyTasks: Task[] = [
    { id: "t1", type: "search", input: state.query, depends_on: [], estimated_cost: 0.01 },
    { id: "t2", type: "search", input: state.query, depends_on: [], estimated_cost: 0.01 },
    { id: "t3", type: "enrich", input: state.query, depends_on: ["t1"], estimated_cost: 0.01 },
    { id: "t4", type: "fact_check", input: state.query, depends_on: ["t1", "t2"], estimated_cost: 0.02 },
    { id: "t5", type: "summarize", input: state.query, depends_on: ["t3", "t4"], estimated_cost: 0.01 },
  ];

  return { tasks: dummyTasks };
}
