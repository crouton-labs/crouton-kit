#!/usr/bin/env node

// src/cli.ts
import { parseArgs } from "node:util";

// src/config.ts
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
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
function localModesDir(cwd) {
  return join(cwd, ".claude", ".ai", "modes");
}
function resolveModePath(name, cwd) {
  const localPath = cwd ? resolve(localModesDir(cwd), `${name}.md`) : null;
  const builtinPath = resolve(MODES_DIR, `${name}.md`);
  return localPath && existsSync(localPath) ? localPath : builtinPath;
}
function getModeHelp(name, cwd) {
  const filePath = resolveModePath(name, cwd);
  let raw;
  try {
    raw = readFileSync(filePath, "utf-8");
  } catch {
    return void 0;
  }
  return parseFrontmatter(raw).attrs["help"];
}
function loadMode(name, cwd) {
  const filePath = resolveModePath(name, cwd);
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
function listModes(cwd) {
  const builtinModes = readdirSync(MODES_DIR).filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, ""));
  if (!cwd) return builtinModes;
  const localDir = localModesDir(cwd);
  if (!existsSync(localDir)) return builtinModes;
  const localModes = readdirSync(localDir).filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, ""));
  return [.../* @__PURE__ */ new Set([...localModes, ...builtinModes])].sort();
}

// src/runner.ts
import { query } from "@r-cli/sdk";

// src/plugins.ts
import { readFileSync as readFileSync2 } from "node:fs";
import { join as join2 } from "node:path";
var CLAUDE_DIR = join2(process.env.HOME, ".claude");
var PLUGINS_DIR = join2(CLAUDE_DIR, "plugins");
function discoverPlugins() {
  let settings;
  try {
    settings = JSON.parse(readFileSync2(join2(CLAUDE_DIR, "settings.json"), "utf-8"));
  } catch {
    return [];
  }
  let installed;
  try {
    installed = JSON.parse(readFileSync2(join2(PLUGINS_DIR, "installed_plugins.json"), "utf-8"));
  } catch {
    return [];
  }
  const enabled = settings.enabledPlugins;
  if (!enabled) return [];
  const plugins = [];
  for (const [name, isEnabled] of Object.entries(enabled)) {
    if (!isEnabled) continue;
    const entries = installed.plugins[name];
    if (!entries || entries.length === 0) continue;
    plugins.push({ type: "local", path: entries[0].installPath });
  }
  return plugins;
}

// src/runner.ts
async function run(config2, prompt, cwd, options = { headless: false }) {
  const finalPrompt = config2.promptWrapper ? config2.promptWrapper.replace("{{prompt}}", prompt) : prompt;
  const systemPrompt = config2.systemPromptMode === "append" ? { type: "preset", preset: "claude_code", append: config2.systemPromptContent } : config2.systemPromptContent;
  const mcpServers = process.env.AI_MCP_SERVERS ? JSON.parse(process.env.AI_MCP_SERVERS) : void 0;
  const result = query({
    prompt: finalPrompt,
    options: {
      systemPrompt,
      model: config2.model,
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
      cwd,
      includePartialMessages: true,
      settingSources: ["user", "project", "local"],
      plugins: discoverPlugins(),
      ...mcpServers && { mcpServers }
    }
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
          exitCode: isError ? 1 : 0
        }) + "\n");
        if (isError) {
          process.exitCode = 1;
        }
      } else {
        if (message.subtype !== "success") {
          process.stderr.write(`
Errors: ${("errors" in message ? message.errors : []).join(", ")}
`);
          process.exitCode = 1;
        }
      }
    }
  }
}

// src/cli.ts
var { values } = parseArgs({
  options: {
    mode: { type: "string", short: "m", default: "general" },
    prompt: { type: "string", short: "p" },
    headless: { type: "boolean", default: false },
    help: { type: "boolean", short: "h", default: false },
    list: { type: "boolean", short: "l", default: false }
  },
  strict: true
});
if (values.help && values.mode !== "general") {
  const help = getModeHelp(values.mode, process.cwd());
  if (help) {
    console.log(`${values.mode}: ${help}`);
    process.exit(0);
  }
}
if (values.help) {
  const modes = listModes(process.cwd());
  console.log(`ai - Run Claude Code SDK sessions with configurable modes

Usage:
  ai -p <prompt>                    Run with default mode (general)
  ai -m <mode> -p <prompt>          Run with specified mode
  ai --list                         List available modes

Options:
  -m, --mode <name>    Mode to use (default: general)
  -p, --prompt <text>  Prompt to send
  --headless           Suppress streaming, output JSON on completion
  -l, --list           List available modes
  -h, --help           Show this help

Available modes: ${modes.join(", ")}`);
  process.exit(0);
}
if (values.list) {
  const modes = listModes(process.cwd());
  for (const mode of modes) {
    console.log(mode);
  }
  process.exit(0);
}
if (!values.prompt) {
  console.error("Error: -p/--prompt is required");
  process.exit(1);
}
var config = loadMode(values.mode, process.cwd());
await run(config, values.prompt, process.cwd(), { headless: values.headless });
