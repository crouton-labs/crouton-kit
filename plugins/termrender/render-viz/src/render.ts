import { query } from "@r-cli/sdk";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Config } from "./config.js";

export interface GenerateResult {
  markdown: string;
  tempFile: string;
  cleanup: () => void;
}

interface GenerateArgs {
  config: Config;
  userPrompt: string;
  maxTurns: number;
}

function resolveClaudeExecutable(): string {
  // When invoked from inside Claude Code (hooks, subprocesses), this is set.
  const envPath = process.env.CLAUDE_CODE_EXECPATH;
  if (envPath) return envPath;

  // Fallback: find `claude` on PATH.
  const which = spawnSync("command", ["-v", "claude"], {
    encoding: "utf-8",
    shell: true,
  });
  const resolved = which.stdout.trim();
  if (resolved) return resolved;

  throw new Error(
    "Cannot locate the Claude Code executable. Set CLAUDE_CODE_EXECPATH or ensure `claude` is on PATH.",
  );
}

/**
 * Run Haiku with Write+Bash tools, let it write a markdown file and self-correct
 * via `termrender --check` until the document validates. Returns the validated
 * tempfile path; caller is responsible for calling cleanup().
 */
export async function generateVisualization(args: GenerateArgs): Promise<GenerateResult> {
  const tmpDir = mkdtempSync(join(tmpdir(), "render-viz-"));
  const tempFile = join(tmpDir, "viz.md");
  const cleanup = () => rmSync(tmpDir, { recursive: true, force: true });

  const promptWithInstructions = `${args.userPrompt}

====

Your workflow:
1. Write the termrender markdown to: ${tempFile}
2. Validate by running: termrender --check ${tempFile}
3. If validation fails, read the error, fix the markdown, write it again, re-validate.
4. Repeat until \`termrender --check\` exits 0.
5. Respond with the word "done" when the file is valid.`;

  const result = query({
    prompt: promptWithInstructions,
    options: {
      model: args.config.model,
      systemPrompt: args.config.system_prompt,
      tools: ["Bash", "Write", "Read", "Edit"],
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
      maxTurns: args.maxTurns,
      pathToClaudeCodeExecutable: resolveClaudeExecutable(),
    },
  });

  let errored = false;
  const errors: string[] = [];

  for await (const message of result) {
    if (message.type === "result") {
      if (message.subtype !== "success") {
        errored = true;
        if ("errors" in message && Array.isArray(message.errors)) {
          errors.push(...message.errors.map(String));
        } else {
          errors.push(message.subtype);
        }
      }
    }
  }

  if (errored) {
    cleanup();
    throw new Error(`Claude query failed: ${errors.join(", ")}`);
  }

  if (!existsSync(tempFile)) {
    cleanup();
    throw new Error(`Haiku did not write the expected output file: ${tempFile}`);
  }

  // Belt-and-suspenders final check in case Haiku skipped validation.
  const check = spawnSync("termrender", ["--check", tempFile], { encoding: "utf-8" });
  if (check.status !== 0) {
    const errText = check.stderr.length > 0 ? check.stderr : check.stdout;
    const markdown = readFileSync(tempFile, "utf-8");
    cleanup();
    throw new Error(
      `Final validation failed: ${errText.trim()}\n\nGenerated markdown:\n${markdown}`,
    );
  }

  const markdown = readFileSync(tempFile, "utf-8");
  return { markdown, tempFile, cleanup };
}
