import type { Workflow, WorkflowDef, WorkflowFn } from "./types.js";

export function defineWorkflow(
  defOrName: WorkflowDef | string,
  fn: WorkflowFn,
): Workflow {
  const def: WorkflowDef =
    typeof defOrName === "string" ? { name: defOrName } : defOrName;

  return { def, run: fn };
}
