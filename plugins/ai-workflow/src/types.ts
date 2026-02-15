// ============================================================
// Workflow Definition
// ============================================================

export interface WorkflowDef {
  name: string;
  description?: string;
  args?: ArgDef[];
}

export interface ArgDef {
  name: string;
  required?: boolean;
  description?: string;
}

export type WorkflowFn = (ctx: Ctx, ...args: string[]) => Promise<void>;

export interface Workflow {
  def: WorkflowDef;
  run: WorkflowFn;
}

// ============================================================
// Ctx — the runtime provided to every workflow
// ============================================================

export interface Ctx {
  /** Run an ai-cli agent headlessly. No streaming — just output + session ID. */
  agent(mode: string, prompt: string, opts?: AgentOpts): Promise<AgentResult>;

  /** Run a shell command. */
  exec(command: string): Promise<ExecResult>;

  /** Dispatch another workflow as a separate process. Fire-and-forget by default. */
  dispatch(workflow: string, args: string[]): Promise<WorkflowHandle>;

  /** Get a handle to a Linear ticket for reading/updating. */
  ticket(id: string): TicketHandle;

  /**
   * Terminal operation. Posts summary + session ID to Linear, then exits.
   * The human picks up from here via `claude --resume <sessionId>`.
   */
  handoff(sessionId: string, summary: string, ticketId?: string): Promise<never>;

  /** Log to workflow transcript (not stdout). */
  log(msg: string): void;

  /** Unique ID for this workflow run. */
  runId: string;

  /** Working directory. */
  cwd: string;

  /** Path to the run log directory (.claude/runs/{runId}/). */
  runDir: string;
}

// ============================================================
// Agent execution
// ============================================================

export interface AgentOpts {
  /** Override model for this agent run. */
  model?: string;
  /** Override working directory. */
  cwd?: string;
  /** Timeout in ms. */
  timeout?: number;
}

export interface AgentResult {
  /** Session ID for `claude --resume`. */
  sessionId: string;
  /** Agent's stdout output (not the conversation — just final output). */
  output: string;
  /** 0 = success. */
  exitCode: number;
  /** Wall-clock ms. */
  duration: number;
}

// ============================================================
// Shell execution
// ============================================================

export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

// ============================================================
// Sub-workflow dispatch
// ============================================================

export interface WorkflowHandle {
  /** ID of the dispatched workflow run. */
  runId: string;
}

// ============================================================
// Linear ticket operations
// ============================================================

export interface TicketHandle {
  read(): Promise<TicketData>;
  addLabel(label: string): Promise<void>;
  comment(body: string): Promise<void>;
  setStatus(status: string): Promise<void>;
}

/** Normalized ticket data — mapped from `linear issue view -j` output. */
export interface TicketData {
  identifier: string;
  title: string;
  description: string;
  status: string;
  url: string;
  branchName: string;
}

// ============================================================
// Workflow config — .claude/workflow.json
// ============================================================

export interface WorkflowConfig {
  linear: {
    team: string;
    states: Record<string, string>;
  };
}

/** Raw JSON shape from `linear issue view -j`. */
export interface LinearIssueJson {
  identifier: string;
  title: string;
  description: string;
  url: string;
  branchName: string;
  state: { name: string; color: string };
  parent: unknown;
  children: unknown[];
  comments: unknown[];
  attachments: unknown[];
}

// ============================================================
// Run log — persisted to .claude/runs/{runId}/
// ============================================================

export interface RunMeta {
  runId: string;
  workflow: string;
  args: string[];
  startedAt: string;
  finishedAt?: string;
  status: "running" | "completed" | "failed";
  ticketId?: string;
}

export interface LogEntry {
  ts: string;
  seq: number;
  type: "agent" | "exec" | "dispatch" | "log" | "handoff";
  mode?: string;
  prompt?: string;
  output?: string;
  sessionId?: string;
  duration?: number;
  exitCode?: number;
  error?: string;
}
