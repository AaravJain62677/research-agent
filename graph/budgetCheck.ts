import { ResearchState, Task } from "./state";

export function budgetCheck(state: ResearchState, task: Task): string[] {
  const suggestions = [...state.suggestions];

  if (task.estimated_cost > state.budget.remaining) {
    suggestions.push(
      `Task ${task.id} (${task.type}) costs $${task.estimated_cost.toFixed(
        2
      )}, only $${state.budget.remaining.toFixed(2)} left — proceeding anyway.`
    );
  }

  return suggestions;
}
