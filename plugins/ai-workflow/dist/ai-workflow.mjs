#!/usr/bin/env node

// src/cli.ts
import { parseArgs } from "node:util";
import { resolve as resolve2, join as join2 } from "node:path";
import { pathToFileURL } from "node:url";
import { existsSync as existsSync2, readFileSync as readFileSync2, readdirSync } from "node:fs";
import { glob } from "node:fs/promises";

// src/runtime.ts
import { execFile, exec } from "node:child_process";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";
import { mkdirSync, readFileSync, writeFileSync, appendFileSync, existsSync } from "node:fs";
import { join } from "node:path";
var execFileAsync = promisify(execFile);
var execAsync = promisify(exec);
function parseJSON(raw, context) {
  try {
    return JSON.parse(raw);
  } catch {
    const preview = raw.length > 500 ? raw.slice(0, 500) + "\u2026" : raw;
    throw new Error(`Failed to parse JSON from ${context}:
${preview}`);
  }
}
function loadConfig(cwd) {
  const configPath = join(cwd, ".claude", "workflow.json");
  if (!existsSync(configPath)) {
    throw new Error(
      `Missing workflow config at ${configPath}. Create .claude/workflow.json with:
` + JSON.stringify({ linear: { team: "TEAM", states: { triage: "Triage", todo: "Todo", in_progress: "In Progress", in_review: "In Review", done: "Done" } } }, null, 2)
    );
  }
  return JSON.parse(readFileSync(configPath, "utf-8"));
}
function shellEscape(s) {
  return `'${s.replace(/'/g, "'\\''")}'`;
}
function createCtx(cwd, workflow, args) {
  const config = loadConfig(cwd);
  const runId = randomUUID();
  const runDir = join(cwd, ".claude", "runs", runId);
  mkdirSync(runDir, { recursive: true });
  const meta = {
    runId,
    workflow: workflow ?? "unknown",
    args: args ?? [],
    startedAt: (/* @__PURE__ */ new Date()).toISOString(),
    status: "running"
  };
  writeFileSync(join(runDir, "run.json"), JSON.stringify(meta, null, 2) + "\n");
  let seq = 0;
  function appendLog(entry) {
    const full = { ts: (/* @__PURE__ */ new Date()).toISOString(), seq: ++seq, ...entry };
    appendFileSync(join(runDir, "log.jsonl"), JSON.stringify(full) + "\n");
  }
  function updateMeta(patch) {
    Object.assign(meta, patch);
    writeFileSync(join(runDir, "run.json"), JSON.stringify(meta, null, 2) + "\n");
  }
  const ctx = {
    runId,
    cwd,
    runDir,
    async agent(mode, prompt, opts) {
      const start = performance.now();
      const cliArgs = ["-m", mode, "-p", prompt, "--headless"];
      if (opts?.model) cliArgs.push("--model", opts.model);
      const spawnCwd = opts?.cwd ? opts.cwd : cwd;
      const timeout = opts?.timeout;
      const submitFile = opts?.submit ? join(runDir, `submit-${randomUUID()}.json`) : void 0;
      const env = { ...process.env };
      if (submitFile) {
        writeFileSync(submitFile, "");
        env.AI_WORKFLOW_SUBMIT_PATH = submitFile;
      }
      appendLog({ type: "agent", mode, prompt: prompt.slice(0, 500) });
      try {
        const { stdout, stderr } = await execFileAsync("ai", cliArgs, {
          cwd: spawnCwd,
          timeout,
          maxBuffer: 10 * 1024 * 1024,
          env
        });
        const duration = performance.now() - start;
        if (stderr) ctx.log(stderr);
        const result = parseJSON(stdout, `agent(${mode})`);
        appendLog({
          type: "agent",
          mode,
          output: result.output?.slice(0, 2e3) ?? "",
          sessionId: result.sessionId,
          duration,
          exitCode: result.exitCode
        });
        let data;
        if (submitFile && existsSync(submitFile)) {
          const raw = readFileSync(submitFile, "utf-8");
          if (raw.length > 0) {
            data = parseJSON(raw, `submit file for agent(${mode})`);
          }
        }
        return { ...result, duration, ...data !== void 0 && { data } };
      } catch (err) {
        const duration = performance.now() - start;
        const message = err instanceof Error ? err.message : String(err);
        appendLog({ type: "agent", mode, error: message, duration });
        throw new Error(`agent(${mode}) failed after ${(duration / 1e3).toFixed(1)}s: ${message}`);
      }
    },
    async exec(command2) {
      appendLog({ type: "exec", prompt: command2.slice(0, 500) });
      try {
        const { stdout, stderr } = await execAsync(command2, {
          cwd,
          maxBuffer: 10 * 1024 * 1024
        });
        appendLog({ type: "exec", output: stdout.slice(0, 1e3), exitCode: 0 });
        return { stdout, stderr, exitCode: 0 };
      } catch (err) {
        const e = err;
        const result = {
          stdout: typeof e.stdout === "string" ? e.stdout : "",
          stderr: typeof e.stderr === "string" ? e.stderr : "",
          exitCode: typeof e.code === "number" ? e.code : 1
        };
        appendLog({ type: "exec", output: result.stderr.slice(0, 1e3), exitCode: result.exitCode });
        return result;
      }
    },
    async dispatch(workflow2, args2) {
      appendLog({ type: "dispatch", mode: workflow2, prompt: args2.join(" ") });
      const { stdout, stderr } = await execFileAsync("ai-workflow", ["run", workflow2, ...args2], {
        cwd,
        maxBuffer: 10 * 1024 * 1024
      });
      if (stderr) ctx.log(stderr);
      let childRunId;
      try {
        const result = JSON.parse(stdout.trim());
        childRunId = result.runId;
      } catch {
      }
      appendLog({ type: "dispatch", mode: workflow2, output: stdout.slice(0, 1e3) });
      return { runId: childRunId ?? "unknown" };
    },
    ticket(id) {
      if (!meta.ticketId) updateMeta({ ticketId: id });
      return {
        async read() {
          const { stdout } = await execAsync(`linear issue view ${shellEscape(id)} -j`, { cwd });
          const raw = parseJSON(stdout, `linear issue view ${id}`);
          return {
            identifier: raw.identifier,
            title: raw.title,
            description: raw.description,
            status: raw.state.name,
            url: raw.url,
            branchName: raw.branchName
          };
        },
        async addLabel(label) {
          await execAsync(`linear issue update ${id} -l ${shellEscape(label)}`, { cwd });
          ctx.log(`Added label "${label}" to ${id}`);
        },
        async comment(body) {
          await execAsync(`linear issue comment add ${id} -b ${shellEscape(body)}`, { cwd });
          ctx.log(`Commented on ${id}`);
        },
        async setStatus(status) {
          const stateName = config.linear.states[status];
          if (!stateName) {
            throw new Error(
              `Unknown status "${status}". Configure in .claude/workflow.json linear.states. Available: ${Object.keys(config.linear.states).join(", ")}`
            );
          }
          await execAsync(`linear issue update ${id} --state ${shellEscape(stateName)}`, { cwd });
          ctx.log(`Set ${id} status to "${stateName}"`);
        }
      };
    },
    async handoff(sessionId, summary, ticketId) {
      if (ticketId) {
        await ctx.ticket(ticketId).comment(
          `## Handoff

Session: \`${sessionId}\`

${summary}`
        );
      }
      appendLog({ type: "handoff", sessionId, output: summary.slice(0, 500) });
      updateMeta({ status: "completed", finishedAt: (/* @__PURE__ */ new Date()).toISOString() });
      ctx.log(`Handoff complete. Resume: claude --resume ${sessionId}`);
      process.exit(0);
    },
    log(msg) {
      appendLog({ type: "log", output: msg });
      process.stderr.write(`[workflow:${runId.slice(0, 8)}] ${msg}
`);
    }
  };
  return ctx;
}

// src/define.ts
function defineWorkflow(defOrName, fn) {
  const def = typeof defOrName === "string" ? { name: defOrName } : defOrName;
  return { def, run: fn };
}

// workflows/triage.ts
var triage_default = defineWorkflow(
  {
    name: "triage",
    description: "Classify tickets and dispatch to appropriate workflow",
    args: [{ name: "ticketIds", required: true, description: "One or more Linear ticket IDs (e.g. DEV-354 DEV-144)" }]
  },
  async (ctx, ...ticketIds) => {
    for (const id of ticketIds) {
      ctx.log(`Triaging ${id}`);
      const ticket = await ctx.ticket(id).read();
      const { data } = await ctx.agent("triage", `${ticket.identifier}: ${ticket.title}

${ticket.description}`, { submit: true });
      if (!data) {
        throw new Error(`Triage agent did not submit structured data for ${id}`);
      }
      const classification = data;
      await ctx.ticket(id).addLabel(classification.type);
      await ctx.ticket(id).comment(
        `## Triaged

**Type:** ${classification.type}
**Size:** ${classification.size}

${classification.summary}`
      );
      const workflow = classification.type === "bug" ? "debug" : "feature";
      const handle = await ctx.dispatch(workflow, [id]);
      await ctx.ticket(id).comment(
        `Pipeline \`${workflow}\` started \u2192 \`ai-workflow status ${handle.runId}\``
      );
      ctx.log(`${id}: dispatched to ${workflow} (${handle.runId})`);
    }
  }
);

// workflows/debug.ts
var debug_default = defineWorkflow(
  {
    name: "debug",
    description: "Diagnose a bug and hand off to human",
    args: [{ name: "ticketId", required: true }]
  },
  async (ctx, ticketId) => {
    const ticket = await ctx.ticket(ticketId).read();
    ctx.log(`Diagnosing ${ticketId}`);
    const diagnosis = await ctx.agent(
      "debug",
      `Diagnose this bug:

**${ticket.title}**

${ticket.description}`
    );
    await ctx.ticket(ticketId).setStatus("in_progress");
    await ctx.handoff(diagnosis.sessionId, [
      `## Bug Diagnosed`,
      ``,
      diagnosis.output.slice(0, 500),
      ``,
      `Resume to review diagnosis and implement:`,
      `\`\`\``,
      `claude --resume ${diagnosis.sessionId}`,
      `\`\`\``
    ].join("\n"), ticketId);
  }
);

// workflows/feature.ts
var feature_default = defineWorkflow(
  {
    name: "feature",
    description: "Qualify a feature ticket, route to spec or straight to planning",
    args: [{ name: "ticketId", required: true }]
  },
  async (ctx, ticketId) => {
    const ticket = await ctx.ticket(ticketId).read();
    ctx.log(`Qualifying ${ticketId}`);
    const { data: qualification } = await ctx.agent("general", [
      "Read this ticket and determine whether it needs a detailed spec or can go straight to implementation planning.",
      "",
      "NEEDS_SPEC if: ambiguous requirements, UX decisions needed, multiple valid approaches, unclear scope, needs human discussion",
      "STRAIGHT_TO_PLAN if: clear requirements, obvious approach, well-defined scope, no open questions",
      "",
      'Call the submit tool with: { "decision": "NEEDS_SPEC" | "STRAIGHT_TO_PLAN", "reason": "one-line reason" }',
      "",
      `--- TICKET ---`,
      `**${ticket.title}**`,
      ``,
      ticket.description
    ].join("\n"), { submit: true });
    if (!qualification) throw new Error(`Qualification agent did not submit data for ${ticketId}`);
    const { decision } = qualification;
    const needsSpec = decision === "NEEDS_SPEC";
    if (needsSpec) {
      ctx.log(`Ticket needs spec \u2014 drafting`);
      const spec = await ctx.agent(
        "spec-draft",
        `Investigate and draft a high-level spec for:

**${ticket.title}**

${ticket.description}`
      );
      await ctx.handoff(spec.sessionId, [
        `## Spec Drafted \u2014 Needs Discussion`,
        ``,
        `Resume to iterate on the spec and resolve open questions:`,
        `\`\`\``,
        `claude --resume ${spec.sessionId}`,
        `\`\`\``
      ].join("\n"), ticketId);
    }
    ctx.log(`Straight to planning \u2014 dispatching plan workflow`);
    await ctx.dispatch("plan", [ticketId]);
  }
);

// workflows/plan.ts
var MAX_ITERATIONS = 3;
var plan_default = defineWorkflow(
  {
    name: "plan",
    description: "Create implementation plan with review loop and behavioral test spec",
    args: [
      { name: "ticketId", required: true },
      { name: "specContext", description: "Optional spec content to include" }
    ]
  },
  async (ctx, ticketId, specContext) => {
    const ticket = await ctx.ticket(ticketId).read();
    const topic = ticket.identifier.toLowerCase();
    const planPath = `.claude/plans/${topic}.plan.md`;
    const specPath = `.claude/specs/${topic}.spec.md`;
    let planSession;
    let reviewIssues = "";
    for (let i = 1; i <= MAX_ITERATIONS; i++) {
      ctx.log(`Planning iteration ${i}/${MAX_ITERATIONS}`);
      const planPrompt = [
        `Create an implementation plan for:`,
        ``,
        `**${ticket.title}**`,
        ``,
        ticket.description,
        specContext ? `
--- SPEC ---
${specContext}` : "",
        reviewIssues ? `
--- REVIEW FEEDBACK (fix these) ---
${reviewIssues}` : ""
      ].filter(Boolean).join("\n");
      planSession = await ctx.agent("plan", planPrompt);
      ctx.log(`Reviewing plan (iteration ${i})`);
      const review = await ctx.agent("review-plan", [
        `Review the plan against the ticket requirements.`,
        ``,
        `Plan path: ${planPath}`,
        ``,
        `--- TICKET ---`,
        `**${ticket.title}**`,
        ``,
        ticket.description
      ].join("\n"), { submit: true });
      if (!review.data) {
        throw new Error(`Plan reviewer did not submit structured data at iteration ${i}`);
      }
      const verdict = review.data;
      if (verdict.verdict === "pass") {
        ctx.log(`Plan approved`);
        break;
      }
      reviewIssues = verdict.issues?.join("\n") ?? review.output;
      if (i === MAX_ITERATIONS) {
        ctx.log(`Max iterations reached \u2014 proceeding with current plan`);
      }
    }
    ctx.log(`Creating behavioral test spec`);
    const testSpec = await ctx.agent("test-spec", [
      `Spec path: ${specPath}`,
      `Plan path: ${planPath}`,
      `Topic: ${topic}`
    ].join("\n"), { submit: true });
    const testSpecResult = testSpec.data;
    const testsNeeded = testSpecResult?.testsNeeded ?? true;
    const testSpecPath = `.claude/plans/${topic}.test-spec.md`;
    ctx.log(testsNeeded ? `Test spec created` : `No tests needed`);
    await ctx.handoff(planSession.sessionId, [
      `## Plan Ready`,
      ``,
      `- Implementation plan: \`${planPath}\``,
      testsNeeded ? `- Test spec: \`${testSpecPath}\`` : `- Tests: not needed`,
      ``,
      `Resume to review and iterate on plan:`,
      `\`\`\``,
      `claude --resume ${planSession.sessionId}`,
      `\`\`\``
    ].join("\n"), ticketId);
  }
);

// workflows/implement.ts
var MAX_ITERATIONS2 = 20;
var MAX_QUALITY_RETRIES = 2;
var implement_default = defineWorkflow(
  {
    name: "implement",
    description: "Tactician/implementor loop \u2014 fresh context each iteration, plan updated on disk between cycles",
    args: [
      { name: "ticketId", required: true },
      { name: "planPath", description: "Path to plan file (default: .claude/plans/{topic}.plan.md)" }
    ]
  },
  async (ctx, ticketId, planPath) => {
    const ticket = await ctx.ticket(ticketId).read();
    const topic = ticket.identifier.toLowerCase();
    if (!planPath) {
      planPath = `.claude/plans/${topic}.plan.md`;
    }
    const specPath = `.claude/specs/${topic}.spec.md`;
    const testSpecPath = `.claude/plans/${topic}.test-spec.md`;
    ctx.log(`Starting tactician loop \u2014 plan: ${planPath}`);
    let lastOutput = "";
    let iteration = 0;
    for (iteration = 1; iteration <= MAX_ITERATIONS2; iteration++) {
      ctx.log(`
\u2500\u2500 Iteration ${iteration}/${MAX_ITERATIONS2} \u2500\u2500`);
      const tactician = await ctx.agent("tactician", [
        `Plan path: ${planPath}`,
        `Spec path: ${specPath}`,
        `Test spec path: ${testSpecPath}`,
        `Ticket: ${ticket.identifier} \u2014 ${ticket.title}`,
        `Iteration: ${iteration}/${MAX_ITERATIONS2}`,
        lastOutput ? `
--- PREVIOUS ITERATION OUTPUT ---
${lastOutput.slice(0, 1e4)}` : ""
      ].filter(Boolean).join("\n"), { submit: true });
      if (!tactician.data) {
        throw new Error(`Tactician did not submit structured data at iteration ${iteration}`);
      }
      const decision = tactician.data;
      if (decision.action === "done") {
        ctx.log(`Tactician declared done at iteration ${iteration}`);
        lastOutput = decision.summary ?? tactician.output;
        break;
      }
      if (decision.action === "validate") {
        ctx.log(`Dispatching validation`);
        const result2 = await ctx.agent("validate", [
          `Plan path: ${planPath}`,
          `Spec path: ${specPath}`,
          ``,
          decision.prompt
        ].join("\n"));
        lastOutput = result2.output;
        continue;
      }
      ctx.log(`Dispatching implementation`);
      const result = await ctx.agent("implement", [
        `Plan path: ${planPath}`,
        `Spec path: ${specPath}`,
        ``,
        decision.prompt
      ].join("\n"));
      lastOutput = result.output;
    }
    if (iteration > MAX_ITERATIONS2) {
      ctx.log(`Max iterations reached \u2014 proceeding to quality gate`);
    }
    ctx.log(`
\u2500\u2500 Code Quality Gate \u2500\u2500`);
    for (let qi = 1; qi <= MAX_QUALITY_RETRIES; qi++) {
      ctx.log(`Quality review ${qi}/${MAX_QUALITY_RETRIES}`);
      const qualityResult = await ctx.agent("review", [
        `Review all changes made during implementation of plan: ${planPath}`,
        `Focus on the uncommitted diff. Report critical and high issues only.`
      ].join("\n"));
      const hasCritical = qualityResult.output.includes("### Critical");
      const hasHigh = qualityResult.output.includes("### High");
      if (!hasCritical && !hasHigh) {
        ctx.log(`Quality gate passed`);
        break;
      }
      if (qi === MAX_QUALITY_RETRIES) {
        ctx.log(`Quality issues remain after ${MAX_QUALITY_RETRIES} attempts`);
        break;
      }
      ctx.log(`Quality issues found \u2014 running fix cycle`);
      await ctx.agent("implement", [
        `Fix the following code quality issues found during review:`,
        ``,
        qualityResult.output,
        ``,
        `Plan path: ${planPath}`
      ].join("\n"));
    }
    ctx.log(`
\u2500\u2500 Adversarial Validation \u2500\u2500`);
    const { data: cdpCheck } = await ctx.agent("general", [
      `Read the behavioral test spec at ${testSpecPath}.`,
      ``,
      `If it contains a "CDP Validation Candidates" section with actual properties (not NO_CDP_NEEDED),`,
      `call the submit tool with: { "needed": true, "properties": ["P1: brief", ...] }`,
      ``,
      `If the file doesn't exist, or says NO_CDP_NEEDED, or has no CDP candidates,`,
      `call the submit tool with: { "needed": false }`
    ].join("\n"), { submit: true });
    const cdpDecision = cdpCheck;
    if (cdpDecision?.needed) {
      ctx.log(`CDP validation needed \u2014 running adversarial checks`);
      const cdpResult = await ctx.agent("validate", [
        `You are an ADVERSARIAL validator. Your goal is to DISPROVE that the implementation works.`,
        ``,
        `Read the behavioral test spec at ${testSpecPath} \u2014 focus on the CDP Validation Candidates.`,
        `For each candidate property, use the capture CLI to actively try to prove it WRONG:`,
        ``,
        `Available capture commands (run via Bash):`,
        `  capture exec "<js-code>"          Execute JS in a browser tab`,
        `  capture exec --file <path>        Execute JS from file`,
        `  capture screenshot --out <path>   Capture screenshot for visual verification`,
        `  capture a11y --json               Get accessibility tree as JSON`,
        `  capture a11y --interactive         Get interactive elements only`,
        `  capture open <url>                Open URL in browser`,
        `  capture navigate <url>            Navigate and optionally record HAR`,
        `  capture list                      List open browser tabs`,
        ``,
        `Strategy:`,
        `1. Start the app if not running (check with capture list)`,
        `2. For each CDP property, write JS that tests the OPPOSITE of what should be true`,
        `3. Take screenshots of unexpected states`,
        `4. Check a11y tree for missing/broken interactive elements`,
        `5. Try edge cases: empty states, rapid navigation, invalid inputs`,
        ``,
        `If you find a property violation, report FAIL with evidence.`,
        `If all properties hold despite your best adversarial efforts, report PASS.`,
        ``,
        `Plan path: ${planPath}`
      ].join("\n"));
      if (cdpResult.output.includes("FAIL") || cdpResult.output.includes("fail")) {
        ctx.log(`CDP validation found issues \u2014 attempting fixes`);
        await ctx.agent("implement", [
          `Fix the following CDP validation failures:`,
          ``,
          cdpResult.output,
          ``,
          `Plan path: ${planPath}`,
          `Test spec: ${testSpecPath}`
        ].join("\n"));
      } else {
        ctx.log(`CDP validation passed`);
      }
    } else {
      ctx.log(`No CDP validation needed \u2014 skipping`);
    }
    ctx.log(`
\u2500\u2500 Creating Summary \u2500\u2500`);
    const summary = await ctx.agent("general", [
      `You are creating a handoff summary for a human developer.`,
      ``,
      `Read the plan at ${planPath} \u2014 items marked [DONE] show what was completed.`,
      `Read the git diff to see all changes made.`,
      ``,
      `**Ticket:** ${ticket.identifier} \u2014 ${ticket.title}`,
      `**Iterations:** ${iteration}`,
      ``,
      `Provide a concise overview: what was built, what works, any remaining concerns.`
    ].join("\n"));
    await ctx.handoff(summary.sessionId, [
      `## Implementation Complete`,
      ``,
      `- Plan: \`${planPath}\``,
      `- Iterations: ${iteration}`,
      ``,
      `Resume to review:`,
      `\`\`\``,
      `claude --resume ${summary.sessionId}`,
      `\`\`\``
    ].join("\n"), ticketId);
  }
);

// src/cli.ts
var BUILTIN_WORKFLOWS = /* @__PURE__ */ new Map([
  [triage_default.def.name, triage_default],
  [debug_default.def.name, debug_default],
  [feature_default.def.name, feature_default],
  [plan_default.def.name, plan_default],
  [implement_default.def.name, implement_default]
]);
async function discoverLocalWorkflows(cwd) {
  const localDir = join2(cwd, ".claude", "workflows");
  const workflows = /* @__PURE__ */ new Map();
  if (!existsSync2(localDir)) return workflows;
  for await (const entry of glob("*.ts", { cwd: localDir })) {
    const fullPath = resolve2(localDir, entry);
    const mod = await import(pathToFileURL(fullPath).href);
    workflows.set(mod.default.def.name, mod.default);
  }
  return workflows;
}
async function getAllWorkflows(cwd) {
  const all = new Map(BUILTIN_WORKFLOWS);
  const local = await discoverLocalWorkflows(cwd);
  for (const [name, wf] of local) {
    all.set(name, wf);
  }
  return all;
}
function getRunsDir(cwd) {
  return join2(cwd, ".claude", "runs");
}
function listRuns(cwd) {
  const runsDir = getRunsDir(cwd);
  if (!existsSync2(runsDir)) return [];
  const runs = [];
  for (const entry of readdirSync(runsDir)) {
    const metaPath = join2(runsDir, entry, "run.json");
    if (existsSync2(metaPath)) {
      try {
        runs.push(JSON.parse(readFileSync2(metaPath, "utf-8")));
      } catch (err) {
        process.stderr.write(`Warning: malformed run.json in ${entry}: ${err}
`);
      }
    }
  }
  runs.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  return runs;
}
function readRunLog(cwd, runId) {
  const runsDir = getRunsDir(cwd);
  if (!existsSync2(runsDir)) return [];
  let resolvedId = runId;
  if (runId.length < 36) {
    const match = readdirSync(runsDir).find((d) => d.startsWith(runId));
    if (match) resolvedId = match;
  }
  const logPath = join2(runsDir, resolvedId, "log.jsonl");
  if (!existsSync2(logPath)) return [];
  return readFileSync2(logPath, "utf-8").trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
}
var { values, positionals } = parseArgs({
  options: {
    help: { type: "boolean", short: "h", default: false },
    json: { type: "boolean", default: false },
    last: { type: "string", short: "n" }
  },
  allowPositionals: true,
  strict: true
});
var [command, ...rest] = positionals;
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
  const runsDir = getRunsDir(process.cwd());
  const match = existsSync2(runsDir) ? readdirSync(runsDir).find((d) => d.startsWith(runId)) : void 0;
  if (!match) {
    console.error(`Error: no run found matching "${runId}".`);
    process.exit(1);
  }
  const metaPath = join2(runsDir, match, "run.json");
  const meta = JSON.parse(readFileSync2(metaPath, "utf-8"));
  const entries = readRunLog(process.cwd(), match);
  if (values.json) {
    console.log(JSON.stringify({ meta, log: entries }, null, 2));
    process.exit(0);
  }
  console.log(`Run:      ${meta.runId}`);
  console.log(`Workflow: ${meta.workflow}`);
  console.log(`Status:   ${meta.status}`);
  console.log(`Started:  ${meta.startedAt}`);
  if (meta.finishedAt) console.log(`Finished: ${meta.finishedAt}`);
  if (meta.ticketId) console.log(`Ticket:   ${meta.ticketId}`);
  console.log(`Args:     ${meta.args.join(" ")}`);
  console.log();
  const agentEntries = entries.filter((e) => e.type === "agent" && e.sessionId);
  const logEntries = entries.filter((e) => e.type === "log");
  console.log(`\u2500\u2500 Timeline (${entries.length} entries, ${agentEntries.length} agent calls) \u2500\u2500`);
  console.log();
  for (const entry of entries) {
    const time = entry.ts.slice(11, 19);
    if (entry.type === "log") {
      console.log(`  ${time}  ${entry.output}`);
    } else if (entry.type === "agent" && entry.sessionId) {
      const dur = entry.duration ? `${(entry.duration / 1e3).toFixed(1)}s` : "";
      const status = entry.exitCode === 0 ? "ok" : `exit:${entry.exitCode}`;
      console.log(`  ${time}  agent:${entry.mode}  ${status}  ${dur}  session:${entry.sessionId.slice(0, 8)}`);
    } else if (entry.type === "handoff") {
      console.log(`  ${time}  HANDOFF \u2192 session:${entry.sessionId?.slice(0, 8)}`);
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
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : void 0;
    ctx.log(`Workflow "${name}" failed: ${message}`);
    if (stack) process.stderr.write(stack + "\n");
    process.stdout.write(JSON.stringify({ runId: ctx.runId }) + "\n");
    process.exit(1);
  }
  process.stdout.write(JSON.stringify({ runId: ctx.runId }) + "\n");
  process.exit(0);
}
console.error(`Unknown command: ${command}. Run "ai-workflow --help" for usage.`);
process.exit(1);
function timeSince(isoDate) {
  const ms = Date.now() - new Date(isoDate).getTime();
  const secs = Math.floor(ms / 1e3);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
