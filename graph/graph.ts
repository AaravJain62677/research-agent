import { StateGraph, END, START } from "@langchain/langgraph";
import { ResearchState, Task, createInitialState } from "./state";
import { plannerNode } from "./planner";
import { searchNode } from "./searchNode";
import { enrichNode } from "./enrichNode";
import { factCheckNode } from "./factCheckNode";
import { summarizeNode } from "./summarizeNode";
import { reportNode } from "./reportNode";

function makeTaskRunner(
  type: Task["type"],
  fn: (state: ResearchState, task: Task) => Promise<Partial<ResearchState>>
) {
  return async (state: ResearchState): Promise<Partial<ResearchState>> => {
    const readyTasks = state.tasks.filter(
      (t) =>
        t.type === type &&
        !(t.id in state.results) &&
        t.depends_on.every((depId) => depId in state.results)
    );

    let merged: Partial<ResearchState> = {};
    for (const task of readyTasks) {
      const update = await fn({ ...state, ...merged }, task);
      merged = {
        ...merged,
        ...update,
        results: { ...state.results, ...merged.results, ...update.results },
        receipts: [...state.receipts, ...(merged.receipts || []), ...(update.receipts || [])],
        suggestions: [
          ...state.suggestions,
          ...(merged.suggestions || []),
          ...(update.suggestions || []),
        ],
      };
    }
    return merged;
  };
}

function allTasksComplete(state: ResearchState): boolean {
  return state.tasks.every((t) => t.id in state.results);
}

// Routing function: decides whether to keep dispatching task nodes or move
// to the report step. Re-checked after every node run.
function routeAfterTasks(state: ResearchState): string {
  if (allTasksComplete(state)) return "reportGen";

  const hasReadySearch = state.tasks.some(
    (t) => t.type === "search" && !(t.id in state.results)
  );
  const hasReadyEnrich = state.tasks.some(
    (t) =>
      t.type === "enrich" &&
      !(t.id in state.results) &&
      t.depends_on.every((d) => d in state.results)
  );
  const hasReadyFactCheck = state.tasks.some(
    (t) =>
      t.type === "fact_check" &&
      !(t.id in state.results) &&
      t.depends_on.every((d) => d in state.results)
  );
  const hasReadySummarize = state.tasks.some(
    (t) =>
      t.type === "summarize" &&
      !(t.id in state.results) &&
      t.depends_on.every((d) => d in state.results)
  );

  if (hasReadySearch) return "search";
  if (hasReadyEnrich) return "enrich";
  if (hasReadyFactCheck) return "fact_check";
  if (hasReadySummarize) return "summarize";

  // Nothing ready and not complete — shouldn't normally happen with a
  // valid task graph, but avoid an infinite loop.
  return "reportGen";
}

const workflow = new StateGraph<ResearchState>({
  channels: {
    query: null,
    tasks: null,
    results: null,
    receipts: null,
    budget: null,
    suggestions: null,
    report: null,
  } as any, // TODO: replace with proper channel/reducer definitions per current docs
});

workflow.addNode("planner", plannerNode as any);
workflow.addNode("search", makeTaskRunner("search", searchNode) as any);
workflow.addNode("enrich", makeTaskRunner("enrich", enrichNode) as any);
workflow.addNode("fact_check", makeTaskRunner("fact_check", factCheckNode) as any);
workflow.addNode("summarize", makeTaskRunner("summarize", summarizeNode) as any);
workflow.addNode("reportGen", reportNode as any);

workflow.addEdge(START, "planner" as any);

workflow.addConditionalEdges("planner" as any, routeAfterTasks as any);
workflow.addConditionalEdges("search" as any, routeAfterTasks as any);
workflow.addConditionalEdges("enrich" as any, routeAfterTasks as any);
workflow.addConditionalEdges("fact_check" as any, routeAfterTasks as any);
workflow.addConditionalEdges("summarize" as any, routeAfterTasks as any);

workflow.addEdge("reportGen" as any, END);

export const app = workflow.compile();
export { createInitialState };
