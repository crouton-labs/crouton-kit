import { query } from "@r-cli/sdk";
import type { ModeConfig } from "./types.js";
import { discoverPlugins } from "./plugins.js";

export async function run(config: ModeConfig, prompt: string, cwd: string): Promise<void> {
  const finalPrompt = config.promptWrapper
    ? config.promptWrapper.replace("{{prompt}}", prompt)
    : prompt;

  const systemPrompt = config.systemPromptMode === "append"
    ? { type: "preset" as const, preset: "claude_code" as const, append: config.systemPromptContent }
    : config.systemPromptContent;

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
    },
  });

  for await (const message of result) {
    if (message.type === "stream_event") {
      const event = message.event;
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        process.stdout.write(event.delta.text);
      }
    } else if (message.type === "result") {
      if (message.subtype !== "success") {
        process.stderr.write(`\nErrors: ${("errors" in message ? message.errors : []).join(", ")}\n`);
        process.exitCode = 1;
      }
    }
  }
}
