import { execFile, exec, spawn } from "node:child_process";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";
import { mkdirSync, readFileSync, writeFileSync, appendFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type {
  Ctx,
  AgentOpts,
  AgentResult,
  ExecResult,
  WorkflowHandle,
  WorkflowConfig,
  TicketHandle,
  TicketData,
  LinearIssueJson,
  RunMeta,
  LogEntry,
} from "./types.js";

const execFileAsync = promisify(execFile);
const execAsync = promisify(exec);

function loadConfig(cwd: string): WorkflowConfig {
  const configPath = join(cwd, ".claude", "workflow.json");
  if (!existsSync(configPath)) {
    throw new Error(
      `Missing workflow config at ${configPath}. Create .claude/workflow.json with:\n` +
      JSON.stringify({ linear: { team: "TEAM", states: { triage: "Triage", todo: "Todo", in_progress: "In Progress", in_review: "In Review", done: "Done" } } }, null, 2),
    );
  }
  return JSON.parse(readFileSync(configPath, "utf-8")) as WorkflowConfig;
}

function shellEscape(s: string): string {
  return `'${s.replace(/'/g, "'\\''")}'`;
}

export function createCtx(cwd: string, workflow?: string, args?: string[]): Ctx {
  const config = loadConfig(cwd);
  const runId = randomUUID();
  const runDir = join(cwd, ".claude", "runs", runId);
  mkdirSync(runDir, { recursive: true });

  // Write initial run metadata
  const meta: RunMeta = {
    runId,
    workflow: workflow ?? "unknown",
    args: args ?? [],
    startedAt: new Date().toISOString(),
    status: "running",
  };
  writeFileSync(join(runDir, "run.json"), JSON.stringify(meta, null, 2) + "\n");

  let seq = 0;

  function appendLog(entry: Omit<LogEntry, "ts" | "seq">): void {
    const full: LogEntry = { ts: new Date().toISOString(), seq: ++seq, ...entry };
    appendFileSync(join(runDir, "log.jsonl"), JSON.stringify(full) + "\n");
  }

  function updateMeta(patch: Partial<RunMeta>): void {
    Object.assign(meta, patch);
    writeFileSync(join(runDir, "run.json"), JSON.stringify(meta, null, 2) + "\n");
  }

  const ctx: Ctx = {
    runId,
    cwd,
    runDir,

    async agent(mode: string, prompt: string, opts?: AgentOpts): Promise<AgentResult> {
      const start = performance.now();
      const cliArgs = ["-m", mode, "-p", prompt, "--headless"];
      if (opts?.model) cliArgs.push("--model", opts.model);

      const spawnCwd = opts?.cwd ? opts.cwd : cwd;
      const timeout = opts?.timeout;

      appendLog({ type: "agent", mode, prompt: prompt.slice(0, 500) });

      try {
        const { stdout, stderr } = await execFileAsync("ai", cliArgs, {
          cwd: spawnCwd,
          timeout,
          maxBuffer: 10 * 1024 * 1024,
        });

        const duration = performance.now() - start;
        if (stderr) ctx.log(stderr);

        const result = JSON.parse(stdout) as { sessionId: string; output: string; exitCode: number };
        appendLog({
          type: "agent",
          mode,
          output: result.output.slice(0, 2000),
          sessionId: result.sessionId,
          duration,
          exitCode: result.exitCode,
        });

        return { ...result, duration };
      } catch (err: unknown) {
        const duration = performance.now() - start;
        const message = err instanceof Error ? err.message : String(err);
        appendLog({ type: "agent", mode, error: message, duration });
        throw err;
      }
    },

    async exec(command: string): Promise<ExecResult> {
      appendLog({ type: "exec", prompt: command.slice(0, 500) });
      try {
        const { stdout, stderr } = await execAsync(command, {
          cwd,
          maxBuffer: 10 * 1024 * 1024,
        });
        appendLog({ type: "exec", output: stdout.slice(0, 1000), exitCode: 0 });
        return { stdout, stderr, exitCode: 0 };
      } catch (err: unknown) {
        const e = err as { stdout?: string; stderr?: string; code?: number };
        const result = {
          stdout: typeof e.stdout === "string" ? e.stdout : "",
          stderr: typeof e.stderr === "string" ? e.stderr : "",
          exitCode: typeof e.code === "number" ? e.code : 1,
        };
        appendLog({ type: "exec", output: result.stderr.slice(0, 1000), exitCode: result.exitCode });
        return result;
      }
    },

    async dispatch(workflow: string, args: string[]): Promise<WorkflowHandle> {
      const childRunId = randomUUID();
      appendLog({ type: "dispatch", mode: workflow, prompt: args.join(" ") });
      const child = spawn("ai-workflow", ["run", workflow, ...args], {
        cwd,
        detached: true,
        stdio: "ignore",
      });
      child.unref();
      return { runId: childRunId };
    },

    ticket(id: string): TicketHandle {
      if (!meta.ticketId) updateMeta({ ticketId: id });
      return {
        async read(): Promise<TicketData> {
          const { stdout } = await execAsync(`linear issue view ${id} -j`, { cwd });
          const raw = JSON.parse(stdout) as LinearIssueJson;
          return {
            identifier: raw.identifier,
            title: raw.title,
            description: raw.description,
            status: raw.state.name,
            url: raw.url,
            branchName: raw.branchName,
          };
        },
        async addLabel(label: string): Promise<void> {
          await execAsync(`linear issue update ${id} -l ${shellEscape(label)}`, { cwd });
          ctx.log(`Added label "${label}" to ${id}`);
        },
        async comment(body: string): Promise<void> {
          await execAsync(`linear issue comment add ${id} -b ${shellEscape(body)}`, { cwd });
          ctx.log(`Commented on ${id}`);
        },
        async setStatus(status: string): Promise<void> {
          const stateName = config.linear.states[status];
          if (!stateName) {
            throw new Error(
              `Unknown status "${status}". Configure in .claude/workflow.json linear.states. ` +
              `Available: ${Object.keys(config.linear.states).join(", ")}`,
            );
          }
          await execAsync(`linear issue update ${id} --state ${shellEscape(stateName)}`, { cwd });
          ctx.log(`Set ${id} status to "${stateName}"`);
        },
      };
    },

    async handoff(sessionId: string, summary: string, ticketId?: string): Promise<never> {
      if (ticketId) {
        await ctx.ticket(ticketId).comment(
          `## Handoff\n\nSession: \`${sessionId}\`\n\n${summary}`,
        );
      }
      appendLog({ type: "handoff", sessionId, output: summary.slice(0, 500) });
      updateMeta({ status: "completed", finishedAt: new Date().toISOString() });
      ctx.log(`Handoff complete. Resume: claude --resume ${sessionId}`);
      process.exit(0);
    },

    log(msg: string): void {
      appendLog({ type: "log", output: msg });
      process.stderr.write(`[workflow:${runId.slice(0, 8)}] ${msg}\n`);
    },
  };

  return ctx;
}
