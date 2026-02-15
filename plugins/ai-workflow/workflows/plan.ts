import { defineWorkflow } from "../src/define.js";

const MAX_ITERATIONS = 3;

export default defineWorkflow(
  {
    name: "plan",
    description: "Create implementation plan with review loop and behavioral test spec",
    args: [
      { name: "ticketId", required: true },
      { name: "specContext", description: "Optional spec content to include" },
    ],
  },
  async (ctx, ticketId, specContext) => {
    const ticket = await ctx.ticket(ticketId).read();
    const topic = ticket.identifier.toLowerCase();
    const planPath = `.claude/plans/${topic}.plan.md`;
    const specPath = `.claude/specs/${topic}.spec.md`;

    // ── Step 1: Plan → Review GAN loop ──────────────────────────
    let planSession!: Awaited<ReturnType<typeof ctx.agent>>;
    let reviewIssues = "";

    for (let i = 1; i <= MAX_ITERATIONS; i++) {
      ctx.log(`Planning iteration ${i}/${MAX_ITERATIONS}`);

      const planPrompt = [
        `Create an implementation plan for:`,
        ``,
        `**${ticket.title}**`,
        ``,
        ticket.description,
        specContext ? `\n--- SPEC ---\n${specContext}` : "",
        reviewIssues ? `\n--- REVIEW FEEDBACK (fix these) ---\n${reviewIssues}` : "",
      ].filter(Boolean).join("\n");

      planSession = await ctx.agent("plan", planPrompt);

      ctx.log(`Reviewing plan (iteration ${i})`);
      const review = await ctx.agent("review-plan", [
        `Review the plan against the ticket requirements.`,
        `Output PASS if fully covered, or list blocking issues.`,
        ``,
        `Plan path: ${planPath}`,
        ``,
        `--- TICKET ---`,
        `**${ticket.title}**`,
        ``,
        ticket.description,
      ].join("\n"));

      if (review.output.includes("PASS")) {
        ctx.log(`Plan approved`);
        break;
      }

      reviewIssues = review.output;
      if (i === MAX_ITERATIONS) {
        ctx.log(`Max iterations reached — proceeding with current plan`);
      }
    }

    // ── Step 2: Behavioral test spec ────────────────────────────
    ctx.log(`Creating behavioral test spec`);
    const testSpec = await ctx.agent("test-spec", [
      `Spec path: ${specPath}`,
      `Plan path: ${planPath}`,
      `Topic: ${topic}`,
    ].join("\n"));

    const testsNeeded = !testSpec.output.includes("NO_TESTS_NEEDED");
    const testSpecPath = `.claude/plans/${topic}.test-spec.md`;
    ctx.log(testsNeeded ? `Test spec created` : `No tests needed`);

    // ── Handoff ─────────────────────────────────────────────────
    await ctx.handoff(planSession.sessionId, [
      `## Plan Ready`,
      ``,
      `- Implementation plan: \`${planPath}\``,
      testsNeeded ? `- Test spec: \`${testSpecPath}\`` : `- Tests: not needed`,
      ``,
      `Resume to review and iterate on plan:`,
      `\`\`\``,
      `claude --resume ${planSession.sessionId}`,
      `\`\`\``,
    ].join("\n"), ticketId);
  },
);
