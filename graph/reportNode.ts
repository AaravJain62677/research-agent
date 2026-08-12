import { ResearchState } from "./state";

// TODO: replace with a real LLM call. Feed in state.results (all task
// outputs + their sources) and ask for a report where each claim is
// traceable to the task/source it came from.
export async function reportNode(state: ResearchState): Promise<Partial<ResearchState>> {
  const sections = Object.entries(state.results)
    .map(([taskId, r]) => `[${taskId}] ${JSON.stringify(r.data)}`)
    .join("\n");

  const dummyReport = `Dummy compiled report for query: "${state.query}"\n\n${sections}`;

  return { report: dummyReport };
}
