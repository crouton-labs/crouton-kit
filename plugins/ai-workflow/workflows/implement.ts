import { defineWorkflow } from "../src/define.js";

const MAX_ITERATIONS = 20;
const MAX_QUALITY_RETRIES = 2;

export default defineWorkflow(
  {
    name: "implement",
    description: "Tactician/implementor loop — fresh context each iteration, plan updated on disk between cycles",
    args: [
      { name: "ticketId", required: true },
      { name: "planPath", description: "Path to plan file (default: .claude/plans/{topic}.plan.md)" },
    ],
  },
  async (ctx, ticketId, planPath?) => {
    const ticket = await ctx.ticket(ticketId).read();
    const topic = ticket.identifier.toLowerCase();
    if (!planPath) {
      planPath = `.claude/plans/${topic}.plan.md`;
    }
    const specPath = `.claude/specs/${topic}.spec.md`;
    const testSpecPath = `.claude/plans/${topic}.test-spec.md`;

    // ── Tactician/Implementor loop ────────────────────────────
    // Ralph Wiggum style: each iteration gets fresh context.
    // Tactician reads plan (persisted on disk), marks progress,
    // dispatches one task, loop restarts.
    ctx.log(`Starting tactician loop — plan: ${planPath}`);

    let lastOutput = "";
    let iteration = 0;

    for (iteration = 1; iteration <= MAX_ITERATIONS; iteration++) {
      ctx.log(`\n── Iteration ${iteration}/${MAX_ITERATIONS} ──`);

      // Tactician: read plan, decide next action
      const tactician = await ctx.agent("tactician", [
        `Plan path: ${planPath}`,
        `Spec path: ${specPath}`,
        `Test spec path: ${testSpecPath}`,
        `Ticket: ${ticket.identifier} — ${ticket.title}`,
        `Iteration: ${iteration}/${MAX_ITERATIONS}`,
        lastOutput ? `\n--- PREVIOUS ITERATION OUTPUT ---\n${lastOutput.slice(0, 10000)}` : "",
      ].filter(Boolean).join("\n"));

      const output = tactician.output;

      // Parse action
      if (output.includes("ACTION: done")) {
        ctx.log(`Tactician declared done at iteration ${iteration}`);
        lastOutput = output;
        break;
      }

      if (output.includes("ACTION: validate")) {
        const prompt = output.split("ACTION: validate")[1].trim();
        ctx.log(`Dispatching validation`);
        const result = await ctx.agent("validate", [
          `Plan path: ${planPath}`,
          `Spec path: ${specPath}`,
          ``,
          prompt,
        ].join("\n"));
        lastOutput = result.output;
        continue;
      }

      if (output.includes("ACTION: implement")) {
        const prompt = output.split("ACTION: implement")[1].trim();
        ctx.log(`Dispatching implementation`);
        const result = await ctx.agent("implement", [
          `Plan path: ${planPath}`,
          `Spec path: ${specPath}`,
          ``,
          prompt,
        ].join("\n"));
        lastOutput = result.output;
        continue;
      }

      // Couldn't parse action — treat as implementation prompt
      ctx.log(`Could not parse tactician action — treating as implementation`);
      const result = await ctx.agent("implement", [
        `Plan path: ${planPath}`,
        `Spec path: ${specPath}`,
        ``,
        output,
      ].join("\n"));
      lastOutput = result.output;
    }

    if (iteration > MAX_ITERATIONS) {
      ctx.log(`Max iterations reached — proceeding to quality gate`);
    }

    // ── Quality gate ──────────────────────────────────────────
    ctx.log(`\n── Code Quality Gate ──`);

    for (let qi = 1; qi <= MAX_QUALITY_RETRIES; qi++) {
      ctx.log(`Quality review ${qi}/${MAX_QUALITY_RETRIES}`);

      const qualityResult = await ctx.agent("review", [
        `Review all changes made during implementation of plan: ${planPath}`,
        `Focus on the uncommitted diff. Report critical and high issues only.`,
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

      // Feed issues back through one more tactician→implement cycle
      ctx.log(`Quality issues found — running fix cycle`);
      await ctx.agent("implement", [
        `Fix the following code quality issues found during review:`,
        ``,
        qualityResult.output,
        ``,
        `Plan path: ${planPath}`,
      ].join("\n"));
    }

    // ── Adversarial CDP validation (conditional) ──────────────
    ctx.log(`\n── Adversarial Validation ──`);

    const { output: cdpCheck } = await ctx.agent("general", [
      `Read the behavioral test spec at ${testSpecPath}.`,
      ``,
      `If it contains a "CDP Validation Candidates" section with actual properties (not NO_CDP_NEEDED),`,
      `output NEEDS_CDP followed by the list of properties to validate.`,
      ``,
      `If the file doesn't exist, or says NO_CDP_NEEDED, or has no CDP candidates, output NO_CDP.`,
    ].join("\n"));

    if (cdpCheck.includes("NEEDS_CDP")) {
      ctx.log(`CDP validation needed — running adversarial checks`);

      const cdpResult = await ctx.agent("validate", [
        `You are an ADVERSARIAL validator. Your goal is to DISPROVE that the implementation works.`,
        ``,
        `Read the behavioral test spec at ${testSpecPath} — focus on the CDP Validation Candidates.`,
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
        `Plan path: ${planPath}`,
      ].join("\n"));

      if (cdpResult.output.includes("FAIL")) {
        ctx.log(`CDP validation found issues — attempting fixes`);
        await ctx.agent("implement", [
          `Fix the following CDP validation failures:`,
          ``,
          cdpResult.output,
          ``,
          `Plan path: ${planPath}`,
          `Test spec: ${testSpecPath}`,
        ].join("\n"));
      } else {
        ctx.log(`CDP validation passed`);
      }
    } else {
      ctx.log(`No CDP validation needed — skipping`);
    }

    // ── Summary handoff ───────────────────────────────────────
    ctx.log(`\n── Creating Summary ──`);

    const summary = await ctx.agent("general", [
      `You are creating a handoff summary for a human developer.`,
      ``,
      `Read the plan at ${planPath} — items marked [DONE] show what was completed.`,
      `Read the git diff to see all changes made.`,
      ``,
      `**Ticket:** ${ticket.identifier} — ${ticket.title}`,
      `**Iterations:** ${iteration}`,
      ``,
      `Provide a concise overview: what was built, what works, any remaining concerns.`,
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
      `\`\`\``,
    ].join("\n"), ticketId);
  },
);
