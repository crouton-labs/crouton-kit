import { defineWorkflow } from "../src/define.js";

export default defineWorkflow(
  {
    name: "debug",
    description: "Diagnose a bug and hand off to human",
    args: [{ name: "ticketId", required: true }],
  },
  async (ctx, ticketId) => {
    const ticket = await ctx.ticket(ticketId).read();

    ctx.log(`Diagnosing ${ticketId}`);
    const diagnosis = await ctx.agent("debug",
      `Diagnose this bug:\n\n**${ticket.title}**\n\n${ticket.description}`,
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
      `\`\`\``,
    ].join("\n"), ticketId);
  },
);
