import { parseArgs } from "node:util";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { glob } from "node:fs/promises";
import type { Workflow, RunMeta, LogEntry } from "./types.js";
import { createCtx } from "./runtime.js";

// -- Built-in workflows (bundled at build time) --
import triage from "../workflows/triage.js";
import debug from "../workflows/debug.js";
import feature from "../workflows/feature.js";
import plan from "../workflows/plan.js";
import implement from "../workflows/implement.js";

const BUILTIN_WORKFLOWS = new Map<string, Workflow>([
  [triage.def.name, triage],
  [debug.def.name, debug],
  [feature.def.name, feature],
  [plan.def.name, plan],
  [implement.def.name, implement],
]);

async function discoverLocalWorkflows(cwd: string): Promise<Map<string, Workflow>> {
  const localDir = join(cwd, ".claude", "workflows");
  const workflows = new Map<string, Workflow>();

  if (!existsSync(localDir)) return workflows;

  for await (const entry of glob("*.ts", { cwd: localDir })) {
    const fullPath = resolve(localDir, entry);
    const mod = await import(pathToFileURL(fullPath).href) as { default: Workflow };
    workflows.set(mod.default.def.name, mod.default);
  }

  return workflows;
}

async function getAllWorkflows(cwd: string): Promise<Map<string, Workflow>> {
  const all = new Map(BUILTIN_WORKFLOWS);
  const local = await discoverLocalWorkflows(cwd);
  for (const [name, wf] of local) {
    all.set(name, wf);
  }
  return all;
}

// -- Run log utilities --
function getRunsDir(cwd: string): string {
  return join(cwd, ".claude", "runs");
}

function listRuns(cwd: string): RunMeta[] {
  const runsDir = getRunsDir(cwd);
  if (!existsSync(runsDir)) return [];

  const runs: RunMeta[] = [];
  for (const entry of readdirSync(runsDir)) {
    const metaPath = join(runsDir, entry, "run.json");
    if (existsSync(metaPath)) {
      try {
        runs.push(JSON.parse(readFileSync(metaPath, "utf-8")) as RunMeta);
      } catch (err) {
        process.stderr.write(`Warning: malformed run.json in ${entry}: ${err}\n`);
      }
    }
  }

  // Sort by startedAt descending
  runs.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  return runs;
}

function readRunLog(cwd: string, runId: string): LogEntry[] {
  // Support partial ID matching
  const runsDir = getRunsDir(cwd);
  if (!existsSync(runsDir)) return [];

  let resolvedId = runId;
  if (runId.length < 36) {
    const match = readdirSync(runsDir).find((d) => d.startsWith(runId));
    if (match) resolvedId = match;
  }

  const logPath = join(runsDir, resolvedId, "log.jsonl");
  if (!existsSync(logPath)) return [];

  return readFileSync(logPath, "utf-8")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as LogEntry);
}

// -- CLI parsing --
const { values, positionals } = parseArgs({
  options: {
    help: { type: "boolean", short: "h", default: false },
    json: { type: "boolean", default: false },
    last: { type: "string", short: "n" },
  },
  allowPositionals: true,
  strict: true,
});

const [command, ...rest] = positionals;

if (values.help || !command) {
  console.log(`ai-workflow - Run multi-step AI workflows

Usage:
  ai-workflow run <name> [args...]    Execute a workflow
  ai-workflow list                    List available workflows
  ai-workflow runs [--last N]         List recent workflow runs
  ai-workflow status <runId>          Show run status and log
  ai-workflow log <runId>             Print raw log (JSONL)

Options:
  -h, --help      Show this help
  -n, --last N    Number of runs to show (default: 10)
  --json          Output as JSON`);
  process.exit(0);
}

if (command === "list") {
  const workflows = await getAllWorkflows(process.cwd());
  for (const [name, wf] of workflows) {
    const desc = wf.def.description ? ` - ${wf.def.description}` : "";
    console.log(`${name}${desc}`);
  }
  process.exit(0);
}

if (command === "runs") {
  const runs = listRuns(process.cwd());
  const limit = values.last ? parseInt(values.last, 10) : 10;
  const subset = runs.slice(0, limit);

  if (values.json) {
    console.log(JSON.stringify(subset, null, 2));
    process.exit(0);
  }

  if (subset.length === 0) {
    console.log("No workflow runs found.");
    process.exit(0);
  }

  for (const run of subset) {
    const id = run.runId.slice(0, 8);
    const status = run.status === "running" ? "RUNNING" : run.status === "completed" ? "DONE" : "FAILED";
    const ticket = run.ticketId ? ` (${run.ticketId})` : "";
    const ago = timeSince(run.startedAt);
    console.log(`${id}  ${status.padEnd(7)}  ${run.workflow.padEnd(12)}  ${ago}${ticket}`);
  }
  process.exit(0);
}

if (command === "status") {
  const [runId] = rest;
  if (!runId) {
    console.error("Error: run ID required. Usage: ai-workflow status <runId>");
    process.exit(1);
  }

  // Find the run
  const runsDir = getRunsDir(process.cwd());
  const match = existsSync(runsDir)
    ? readdirSync(runsDir).find((d) => d.startsWith(runId))
    : undefined;

  if (!match) {
    console.error(`Error: no run found matching "${runId}".`);
    process.exit(1);
  }

  const metaPath = join(runsDir, match, "run.json");
  const meta = JSON.parse(readFileSync(metaPath, "utf-8")) as RunMeta;
  const entries = readRunLog(process.cwd(), match);

  if (values.json) {
    console.log(JSON.stringify({ meta, log: entries }, null, 2));
    process.exit(0);
  }

  // Header
  console.log(`Run:      ${meta.runId}`);
  console.log(`Workflow: ${meta.workflow}`);
  console.log(`Status:   ${meta.status}`);
  console.log(`Started:  ${meta.startedAt}`);
  if (meta.finishedAt) console.log(`Finished: ${meta.finishedAt}`);
  if (meta.ticketId) console.log(`Ticket:   ${meta.ticketId}`);
  console.log(`Args:     ${meta.args.join(" ")}`);
  console.log();

  // Log summary — show agent calls and key events
  const agentEntries = entries.filter((e) => e.type === "agent" && e.sessionId);
  const logEntries = entries.filter((e) => e.type === "log");

  console.log(`── Timeline (${entries.length} entries, ${agentEntries.length} agent calls) ──`);
  console.log();

  for (const entry of entries) {
    const time = entry.ts.slice(11, 19);
    if (entry.type === "log") {
      console.log(`  ${time}  ${entry.output}`);
    } else if (entry.type === "agent" && entry.sessionId) {
      const dur = entry.duration ? `${(entry.duration / 1000).toFixed(1)}s` : "";
      const status = entry.exitCode === 0 ? "ok" : `exit:${entry.exitCode}`;
      console.log(`  ${time}  agent:${entry.mode}  ${status}  ${dur}  session:${entry.sessionId.slice(0, 8)}`);
    } else if (entry.type === "handoff") {
      console.log(`  ${time}  HANDOFF → session:${entry.sessionId?.slice(0, 8)}`);
    } else if (entry.type === "dispatch") {
      console.log(`  ${time}  dispatch:${entry.mode} ${entry.prompt}`);
    }
  }

  process.exit(0);
}

if (command === "log") {
  const [runId] = rest;
  if (!runId) {
    console.error("Error: run ID required. Usage: ai-workflow log <runId>");
    process.exit(1);
  }

  const entries = readRunLog(process.cwd(), runId);
  if (entries.length === 0) {
    console.error(`Error: no log found for run "${runId}".`);
    process.exit(1);
  }

  for (const entry of entries) {
    console.log(JSON.stringify(entry));
  }
  process.exit(0);
}

if (command === "run") {
  const [name, ...args] = rest;
  if (!name) {
    console.error("Error: workflow name required. Usage: ai-workflow run <name> [args...]");
    process.exit(1);
  }

  const workflows = await getAllWorkflows(process.cwd());
  const workflow = workflows.get(name);
  if (!workflow) {
    console.error(`Error: unknown workflow "${name}". Run "ai-workflow list" to see available workflows.`);
    process.exit(1);
  }

  // Validate required args
  const requiredArgs = workflow.def.args?.filter((a) => a.required) || [];
  if (args.length < requiredArgs.length) {
    const argNames = requiredArgs.map((a) => `<${a.name}>`).join(" ");
    console.error(`Error: ${workflow.def.name} requires: ${argNames}`);
    process.exit(1);
  }

  const ctx = createCtx(process.cwd(), name, args);
  ctx.log(`Starting workflow "${name}" (run: ${ctx.runId})`);

  try {
    await workflow.run(ctx, ...args);
  } catch (err) {
    ctx.log(`Workflow "${name}" failed: ${err}`);
    process.exit(1);
  }

  process.exit(0);
}

console.error(`Unknown command: ${command}. Run "ai-workflow --help" for usage.`);
process.exit(1);

// -- Helpers --

function timeSince(isoDate: string): string {
  const ms = Date.now() - new Date(isoDate).getTime();
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
