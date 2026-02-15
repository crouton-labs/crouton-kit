import { query } from "@r-cli/sdk";
import type { ModeConfig } from "./types.js";
import { discoverPlugins } from "./plugins.js";

interface RunOptions {
  headless: boolean;
}

export async function run(config: ModeConfig, prompt: string, cwd: string, options: RunOptions = { headless: false }): Promise<void> {
  const finalPrompt = config.promptWrapper
    ? config.promptWrapper.replace("{{prompt}}", prompt)
    : prompt;

  const systemPrompt = config.systemPromptMode === "append"
    ? { type: "preset" as const, preset: "claude_code" as const, append: config.systemPromptContent }
    : config.systemPromptContent;

  const mcpServers = process.env.AI_MCP_SERVERS
    ? JSON.parse(process.env.AI_MCP_SERVERS) as Record<string, unknown>
    : undefined;

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
