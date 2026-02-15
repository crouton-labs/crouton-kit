import { defineWorkflow } from "../src/define.js";

export default defineWorkflow(
  {
    name: "triage",
    description: "Classify tickets and dispatch to appropriate workflow",
    args: [{ name: "ticketIds", required: true, description: "One or more Linear ticket IDs (e.g. DEV-354 DEV-144)" }],
  },
  async (ctx, ...ticketIds) => {
    for (const id of ticketIds) {
      ctx.log(`Triaging ${id}`);

      const ticket = await ctx.ticket(id).read();
      const { output } = await ctx.agent("triage", `${ticket.identifier}: ${ticket.title}\n\n${ticket.description}`);

      // triage mode outputs JSON: { type, size, summary }
      const classification = JSON.parse(output) as {
        type: "bug" | "feature";
        size: "small" | "medium" | "large";
        summary: string;
      };

      await ctx.ticket(id).addLabel(classification.type);
      await ctx.ticket(id).comment(
        `## Triaged\n\n**Type:** ${classification.type}\n**Size:** ${classification.size}\n\n${classification.summary}`,
      );

      const workflow = classification.type === "bug" ? "debug" : "feature";
      const handle = await ctx.dispatch(workflow, [id]);
      await ctx.ticket(id).comment(
        `Pipeline \`${workflow}\` started → \`ai-workflow status ${handle.runId}\``,
      );

      ctx.log(`${id}: dispatched to ${workflow} (${handle.runId})`);
    }
  },
);
