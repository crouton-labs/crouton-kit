import { readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import { z } from "zod";
import debugYaml from "../configs/debug.yaml";

const ConfigSchema = z.object({
  model: z.string(),
  max_messages: z.number().int().positive().default(30),
  max_chars: z.number().int().positive().default(40000),
  system_prompt: z.string(),
  prompt: z.string(),
});

export type Config = z.infer<typeof ConfigSchema>;

const BUILTINS: Record<string, string> = {
  debug: debugYaml,
};

export function listBuiltins(): string[] {
  return Object.keys(BUILTINS);
}

export function loadBuiltin(name: string): Config {
  const raw = BUILTINS[name];
  if (!raw) {
    throw new Error(
      `Unknown builtin config: ${name} (available: ${listBuiltins().join(", ")})`,
    );
  }
  return parseConfig(raw, `builtin:${name}`);
}

export function loadConfigFile(path: string): Config {
  const raw = readFileSync(path, "utf-8");
  return parseConfig(raw, path);
}

function parseConfig(raw: string, source: string): Config {
  const parsed = parseYaml(raw) as unknown;
  const result = ConfigSchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`Invalid config in ${source}: ${issues}`);
  }
  return result.data;
}
