import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { ModeConfig } from "./types.js";

const MODES_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..", "modes");
const PROMPT_WRAPPER_HEADING = "## Prompt Wrapper";

function parseFrontmatter(raw: string): { attrs: Record<string, string>; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error("Invalid mode config: missing frontmatter");
  const attrs: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    attrs[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return { attrs, body: match[2] };
}

export function loadMode(name: string): ModeConfig {
  const filePath = resolve(MODES_DIR, `${name}.md`);
  let raw: string;
  try {
    raw = readFileSync(filePath, "utf-8");
  } catch {
    throw new Error(`Unknown mode: ${name} (no file at ${filePath})`);
  }

  const { attrs, body } = parseFrontmatter(raw);
  const model = attrs["model"];
  if (!model) throw new Error(`Mode "${name}" missing required "model" field`);

  const systemPromptMode = attrs["system-prompt-mode"];
  if (systemPromptMode !== undefined && systemPromptMode !== "append" && systemPromptMode !== "replace") {
    throw new Error(`Invalid system-prompt-mode: ${systemPromptMode}`);
  }

  const resolvedMode: ModeConfig["systemPromptMode"] = systemPromptMode === "replace" ? "replace" : "append";

  const wrapperIdx = body.indexOf(PROMPT_WRAPPER_HEADING);
  let systemPromptContent: string;
  let promptWrapper: string | undefined;

  if (wrapperIdx !== -1) {
    systemPromptContent = body.slice(0, wrapperIdx).trim();
    promptWrapper = body.slice(wrapperIdx + PROMPT_WRAPPER_HEADING.length).trim();
  } else {
    systemPromptContent = body.trim();
  }

  return { model, systemPromptMode: resolvedMode, systemPromptContent, promptWrapper };
}

export function listModes(): string[] {
  return readdirSync(MODES_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}
