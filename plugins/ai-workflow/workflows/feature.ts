import { defineWorkflow } from "../src/define.js";

export default defineWorkflow(
  {
    name: "feature",
    description: "Qualify a feature ticket, route to spec or straight to planning",
    args: [{ name: "ticketId", required: true }],
  },
  async (ctx, ticketId) => {
    const ticket = await ctx.ticket(ticketId).read();

    // Step 1: Qualify — does this need a spec or can we go straight to planning?
    ctx.log(`Qualifying ${ticketId}`);
    const { output: qualification } = await ctx.agent("general", [
      "Read this ticket and determine whether it needs a detailed spec or can go straight to implementation planning.",
      "",
      "NEEDS_SPEC if: ambiguous requirements, UX decisions needed, multiple valid approaches, unclear scope, needs human discussion",
      "STRAIGHT_TO_PLAN if: clear requirements, obvious approach, well-defined scope, no open questions",
      "",
      "Output exactly one of: NEEDS_SPEC or STRAIGHT_TO_PLAN",
      "Followed by a one-line reason.",
      "",
      `--- TICKET ---`,
      `**${ticket.title}**`,
      ``,
      ticket.description,
    ].join("\n"));

    const needsSpec = qualification.includes("NEEDS_SPEC");

    if (needsSpec) {
      ctx.log(`Ticket needs spec — drafting`);
      const spec = await ctx.agent("spec-draft",
        `Investigate and draft a high-level spec for:\n\n**${ticket.title}**\n\n${ticket.description}`,
      );

      await ctx.handoff(spec.sessionId, [
        `## Spec Drafted — Needs Discussion`,
        ``,
        `Resume to iterate on the spec and resolve open questions:`,
        `\`\`\``,
        `claude --resume ${spec.sessionId}`,
        `\`\`\``,
      ].join("\n"), ticketId);
    }

    // Straight to plan — dispatch to plan workflow
    ctx.log(`Straight to planning — dispatching plan workflow`);
    await ctx.dispatch("plan", [ticketId]);
  },
);
