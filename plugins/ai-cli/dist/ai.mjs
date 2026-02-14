#!/usr/bin/env node

// src/cli.ts
import { parseArgs } from "node:util";

// src/config.ts
import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
var MODES_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..", "modes");
var PROMPT_WRAPPER_HEADING = "## Prompt Wrapper";
function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error("Invalid mode config: missing frontmatter");
  const attrs = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    attrs[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return { attrs, body: match[2] };
}
function loadMode(name) {
  const filePath = resolve(MODES_DIR, `${name}.md`);
  let raw;
  try {
    raw = readFileSync(filePath, "utf-8");
  } catch {
    throw new Error(`Unknown mode: ${name} (no file at ${filePath})`);
  }
  const { attrs, body } = parseFrontmatter(raw);
  const model = attrs["model"];
  if (!model) throw new Error(`Mode "${name}" missing required "model" field`);
  const systemPromptMode = attrs["system-prompt-mode"];
  if (systemPromptMode !== void 0 && systemPromptMode !== "append" && systemPromptMode !== "replace") {
    throw new Error(`Invalid system-prompt-mode: ${systemPromptMode}`);
  }
  const resolvedMode = systemPromptMode === "replace" ? "replace" : "append";
  const wrapperIdx = body.indexOf(PROMPT_WRAPPER_HEADING);
  let systemPromptContent;
  let promptWrapper;
  if (wrapperIdx !== -1) {
    systemPromptContent = body.slice(0, wrapperIdx).trim();
    promptWrapper = body.slice(wrapperIdx + PROMPT_WRAPPER_HEADING.length).trim();
  } else {
    systemPromptContent = body.trim();
  }
  return { model, systemPromptMode: resolvedMode, systemPromptContent, promptWrapper };
}
function listModes() {
  return readdirSync(MODES_DIR).filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, ""));
}

// src/runner.ts
import { query } from "@r-cli/sdk";
async function run(config2, prompt, cwd) {
  const finalPrompt = config2.promptWrapper ? config2.promptWrapper.replace("{{prompt}}", prompt) : prompt;
  const systemPrompt = config2.systemPromptMode === "append" ? { type: "preset", preset: "claude_code", append: config2.systemPromptContent } : config2.systemPromptContent;
  const result = query({
    prompt: finalPrompt,
    options: {
      systemPrompt,
      model: config2.model,
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
      cwd,
      includePartialMessages: true,
      settingSources: ["user", "project", "local"]
    }
  });
  for await (const message of result) {
    if (message.type === "stream_event") {
      const event = message.event;
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        process.stdout.write(event.delta.text);
      }
    } else if (message.type === "result") {
      if (message.subtype !== "success") {
        process.stderr.write(`
Errors: ${("errors" in message ? message.errors : []).join(", ")}
`);
        process.exitCode = 1;
      }
    }
  }
}

// src/cli.ts
var { values } = parseArgs({
  options: {
    mode: { type: "string", short: "m", default: "general" },
    prompt: { type: "string", short: "p" },
    help: { type: "boolean", short: "h", default: false },
    list: { type: "boolean", short: "l", default: false }
  },
  strict: true
});
if (values.help) {
  const modes = listModes();
  console.log(`ai - Run Claude Code SDK sessions with configurable modes

Usage:
  ai -p <prompt>                    Run with default mode (general)
  ai -m <mode> -p <prompt>          Run with specified mode
  ai --list                         List available modes

Options:
  -m, --mode <name>    Mode to use (default: general)
  -p, --prompt <text>  Prompt to send
  -l, --list           List available modes
  -h, --help           Show this help

Available modes: ${modes.join(", ")}`);
  process.exit(0);
}
if (values.list) {
  const modes = listModes();
  for (const mode of modes) {
    console.log(mode);
  }
  process.exit(0);
}
if (!values.prompt) {
  console.error("Error: -p/--prompt is required");
  process.exit(1);
}
var config = loadMode(values.mode);
await run(config, values.prompt, process.cwd());
