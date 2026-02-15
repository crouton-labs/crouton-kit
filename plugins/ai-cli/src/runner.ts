import { writeFileSync } from "node:fs";
import { query, createSdkMcpServer, tool } from "@r-cli/sdk";
import { z } from "zod";
import type { ModeConfig } from "./types.js";
import { discoverPlugins } from "./plugins.js";

interface RunOptions {
  headless: boolean;
}

function buildMcpServers(): Record<string, unknown> | undefined {
  const servers: Record<string, unknown> = {};

  // In-process submit server — triggered by AI_WORKFLOW_SUBMIT_PATH env var.
  // Uses createSdkMcpServer (in-process) instead of a stdio subprocess to
  // avoid the env-var whitelist and connection timeout issues with stdio MCP.
  const submitPath = process.env.AI_WORKFLOW_SUBMIT_PATH;
  if (submitPath) {
    const server = createSdkMcpServer({
      name: "submit",
      version: "1.0.0",
      tools: [
        tool(
          "submit",
          "You MUST call this tool to return your structured output. " +
          "Pass your result as the `data` parameter. Do not output JSON to stdout — use this tool instead.",
          { data: z.string().describe("JSON-encoded structured result object to return.") },
          async (args) => {
            writeFileSync(submitPath, args.data);
            return { content: [{ type: "text" as const, text: "Submitted successfully." }] };
          },
        ),
      ],
    });
    servers.submit = server;
  }

  // Additional MCP servers from env (stdio/sse configs)
  if (process.env.AI_MCP_SERVERS) {
    const external = JSON.parse(process.env.AI_MCP_SERVERS) as Record<string, unknown>;
    Object.assign(servers, external);
  }

  return Object.keys(servers).length > 0 ? servers : undefined;
}

export async function run(config: ModeConfig, prompt: string, cwd: string, options: RunOptions = { headless: false }): Promise<void> {
  const finalPrompt = config.promptWrapper
    ? config.promptWrapper.replace("{{prompt}}", prompt)
    : prompt;

  const systemPrompt = config.systemPromptMode === "append"
    ? { type: "preset" as const, preset: "claude_code" as const, append: config.systemPromptContent }
    : config.systemPromptContent;

  const mcpServers = buildMcpServers();

  const result = query({
    prompt: finalPrompt,
    options: {
      systemPrompt,
      model: config.model,
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
      cwd,
      includePartialMessages: true,
      settingSources: ["user", "project", "local"],
      plugins: discoverPlugins(),
      ...(mcpServers && { mcpServers }),
    },
  });

  let outputBuffer = "";

  for await (const message of result) {
    if (message.type === "stream_event") {
      const event = message.event;
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        if (options.headless) {
          outputBuffer += event.delta.text;
        } else {
          process.stdout.write(event.delta.text);
        }
      }
    } else if (message.type === "result") {
      if (options.headless) {
        const isError = message.subtype !== "success";
        const errors = "errors" in message ? message.errors : [];
        process.stdout.write(JSON.stringify({
          sessionId: message.session_id,
          output: isError ? errors.join(", ") : outputBuffer,
          exitCode: isError ? 1 : 0,
        }) + "\n");
        if (isError) {
          process.exitCode = 1;
        }
      } else {
        if (message.subtype !== "success") {
          process.stderr.write(`\nErrors: ${("errors" in message ? message.errors : []).join(", ")}\n`);
          process.exitCode = 1;
        }
      }
    }
  }
}
