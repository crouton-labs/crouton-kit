#!/usr/bin/env node
// Runs the claude-md-manager audit logic against a specific PR's changed files
// instead of the working-tree diff. Uses the same PRUNE_BLOCK + prompts as the
// live hook source.

import { query } from "@r-cli/sdk";
import { execSync } from "child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { basename, dirname, join, relative } from "path";

const REPO = "/Users/silasrhyneer/Code/northlight/northlight-core";
const BASE = "dev";
const HEAD = "silas/apr-17";
const CONCURRENCY = 4;
const PER_DIR_TIMEOUT_MS = 600_000;

// Override for targeted retry of timed-out directories
const RETRY_ONLY = new Set(["src/chat", "src/tool-registry/tools"]);

// Extracted verbatim from plugins/dev-utilities/hooks/claude-md-manager.mjs
const PRUNE_BLOCK = `## The bar: what content earns its place

Keep or add a line only if ALL three hold:
1. Without it, Claude produces **silently broken** code (not just suboptimal — broken)
2. The trap is **not discoverable** in one pass of reading source, types, parent CLAUDE.md, or \`.claude/rules/\`
3. The fix is **non-obvious** — Claude's default behavior would be wrong

### What counts as "not discoverable"

These qualify as undiscoverable even though a reader *could* figure them out by tracing everything:

- **Conditional guards / feature flags**: \`{{- if .Values.foo }}\` blocks, \`enabled\` flags, env-gated branches — which combinations render what is not visible without exercising each path
- **Cross-file / cross-template coupling**: a flag in file A silently injects a value into file B; a secret name in one file must match a reference in another
- **Nested optional keys**: removing an outer key silently drops all inner keys it guards, with no render error
- **Asymmetric paths / names**: \`metadata.name\` vs \`spec.target.name\` mismatches, liveness \`/health\` vs readiness \`/health/ready\`, path-level security context vs container-level
- **Silent null-path assertions**: test frameworks that pass against null when the asserted path doesn't exist

If reading one file is sufficient to see the trap, it doesn't qualify. If you need to correlate across files or exercise feature-flag combinations, it usually does.

## Prune audit — MANDATORY first pass

Bloat degrades adherence to ALL instructions. Every line competes for a limited instruction budget (~150 total across all context sources). Audit every line of the existing CLAUDE.md. Cut any line where ANY of these apply AND it doesn't qualify under the bar above:

- **Single-file discoverable**: architecture prose, file structure, directory listings, patterns visible by reading one source file or config
- **Derivable from config**: test runner, linter, build tool, framework conventions a reader finds in package.json / tsconfig / Cargo.toml / etc.
- **Covered upstream**: facts already stated in a parent CLAUDE.md or \`.claude/rules/\` file
- **Generic guidance**: "write clean code", "follow conventions", "use types" — Claude already knows
- **Stale**: references deleted files, renamed symbols, or changed patterns
- **Descriptive, not preventive**: explains what the code does rather than what silently breaks if ignored

**Stale is worse than missing.** If a rule is contradicted by new evidence but you have no replacement, remove it anyway. If a rule fails the audit, cut it even if today's diff didn't touch it. A successful run is often purely deletions — or deletion of the entire file. Do not manufacture additions to justify running.

**Do not cut content that qualifies under the bar to hit a line count.** The target length is a ceiling, not a quota. If qualifying content pushes you over, leave it.

## Update signals (secondary — run only after the prune pass)

- **Deleted files and renamed symbols**: remove any CLAUDE.md content that references them.
- **Divergent patterns in changed code**: a modified file contradicts a documented convention — update or remove it.
- **New constraints or gotchas**: the diff introduces a silent failure mode not yet documented and meeting the bar above — add it.
- **Mere absence is not contradiction**: existing content today's diff doesn't touch is still subject to the prune audit, but don't remove something just because today's changes didn't re-observe it.

## Tool use constraints

- **Use absolute paths only.** Your shell \`cwd\` is not the target directory — you are running inside a background hook whose working directory is unrelated. Paths in the user prompt are absolute; use them verbatim. Do not \`ls\` or otherwise probe for your environment. Do not try relative paths.
- **Never spawn Task / sub-agents.** This is a background hook; Task causes investigation loops that hang the worker. Read the listed file(s) with the Read tool, audit the existing CLAUDE.md against the bar, then Write once (or not at all). If you find yourself considering Task to "investigate thoroughly," decide with the evidence you already have.
- Read the provided changed-files paths and the existing CLAUDE.md path. That is sufficient context. No additional discovery needed.`;

function getDirectoryInfo(dirPath, cwd) {
  if (!existsSync(dirPath)) {
    const relativeDirPath = relative(cwd, dirPath);
    const isRoot = relativeDirPath === "";
    return { fileCount: 0, fileTypes: [], subdirs: [], isRoot, targetLines: isRoot ? "~150" : "<15" };
  }
  const contents = readdirSync(dirPath);
  const files = contents.filter((f) => {
    try { return statSync(join(dirPath, f)).isFile(); } catch { return false; }
  });
  const fileTypes = files.map((f) => f.split(".").pop()).filter((e) => e && e.length < 10);
  const subdirs = contents.filter((f) => {
    try { return statSync(join(dirPath, f)).isDirectory() && !f.startsWith("."); } catch { return false; }
  });
  const relativeDirPath = relative(cwd, dirPath);
  const isRoot = relativeDirPath === "";
  return { fileCount: files.length, fileTypes, subdirs, isRoot, targetLines: isRoot ? "~150" : "<15" };
}

function getClaudeMdHierarchy(fileDir, cwd) {
  const hierarchy = [];
  let currentDir = fileDir;
  while (currentDir.startsWith(cwd)) {
    const potential = join(currentDir, "CLAUDE.md");
    if (existsSync(potential) && currentDir !== fileDir) {
      const content = readFileSync(potential, "utf-8");
      hierarchy.unshift({ path: relative(cwd, potential), content, lineCount: content.split("\n").length });
    }
    const parent = dirname(currentDir);
    if (parent === currentDir) break;
    currentDir = parent;
  }
  return hierarchy;
}

function buildSystemPrompt(isRoot) {
  if (isRoot) {
    return `You are a senior engineer maintaining a root CLAUDE.md — the persistent context file Claude Code loads every session. Every line competes for context window space. Bloat degrades adherence to every instruction in the file. Your default stance is to cut.

${PRUNE_BLOCK}

## What earns priority when content survives the prune

1. Build, test, lint commands for the 80% case
2. Constraints and gotchas — what breaks silently if ignored
3. Architecture — how layers connect, 2-3 sentences max
4. Conventions that differ from language/framework defaults

## Style
- Short declarative bullets, not paragraphs
- Pair every prohibition with the correct alternative
- Reference other docs with *when/why* to read them, not just that they exist
- Subdirectory CLAUDE.md files handle layer-specific detail — keep the root focused on project-wide concerns

## Procedure
1. Read the changed files in this directory to ground yourself in what actually changed.
2. Read the existing CLAUDE.md line by line. Apply the prune audit to each line. Mark keep/cut based on the bar.
3. Check for stale references and new traps that meet the bar (but not yet documented).
4. Use the Write tool once to save the pruned (and updated) file. If nothing survives, delete it. Produce no explanatory text.

"No change" is only acceptable if every surviving line qualifies under the bar. Staleness-is-zero is not sufficient justification. Equally, do not cut a line that qualifies just to reduce count.`;
  }
  return `You are auditing a subdirectory CLAUDE.md. Subdirectory CLAUDE.md files are expensive: they compete for a limited instruction budget (~150 total across all sources) and degrade adherence to ALL instructions when bloated. Most directories need no CLAUDE.md at all. Your default stance is to cut or delete — but never cut content that qualifies under the bar.

Examples of content that qualifies (memorize the shape):
- "Import from \`@repo/ui\`, never relative paths into \`packages/ui/src/\` — relative imports build but break at runtime in the monorepo"
- "\`flush()\` must follow batch \`setState\` calls — without it, updates are silently deferred and never applied"
- "Migration files must be named \`NNNN_verb_noun.sql\` — the runner silently skips non-matching filenames"
- "\`furnace.enabled: true\` silently injects \`FURNACE_TRIGGER_URL\` into the core deployment template — tests asserting this var on core need \`furnace.*\` values set"
- "\`runAsNonRoot\` sits on pod-level \`spec.template.spec.securityContext\`; \`readOnlyRootFilesystem\` sits on container-level — asserting the wrong level silently passes against a null path"

${PRUNE_BLOCK}

## Procedure
1. Read the changed files in this directory to ground yourself in what actually changed.
2. Read the existing CLAUDE.md line by line. Apply the prune audit to each line. Mark keep/cut based on the bar.
3. Check for new silent-breakage traps that meet the bar.
4. Commit to the result:
   - If nothing survives the prune, delete the CLAUDE.md. This is the expected outcome for most directories.
   - If content survives: Write the pruned file once. Terse bullets only. No headers unless grouping 3+ items.
   - Produce no explanatory text.

"No change" is only acceptable if every surviving line qualifies under the bar. Do not cut a line that qualifies just to reduce count.`;
}

function buildUserPrompt({ relativePath, fileDir, claudeMdPath, existingClaudeMd, absoluteChangedPaths, fileTypes, subdirs, isRoot, targetLines, hierarchyContext }) {
  const currentLines = existingClaudeMd.split("\n").length;
  const lengthDirective = currentLines > parseInt(targetLines.replace(/\D/g, "")) || 0
    ? `Current: ${currentLines} lines. Target ceiling: ${targetLines}. Likely room to cut — run the full audit. If all surviving content qualifies under the bar, exceeding the target is acceptable; do not cut qualifying traps to hit the number.`
    : `Current: ${currentLines} lines (within target ceiling of ${targetLines}). Still run the full prune audit — cut anything that fails the audit.`;

  return `Directory: \`${relativePath}\` (absolute: \`${fileDir}\`)
CLAUDE.md absolute path: \`${claudeMdPath}\`
Changed files (absolute paths — read these with Read):
${absoluteChangedPaths.map((p) => `- ${p}`).join("\n")}

${lengthDirective}

<current_claude_md>
${existingClaudeMd}
</current_claude_md>
${hierarchyContext}
Directory contents: ${fileTypes.slice(0, 10).join(", ")}${subdirs.length > 0 ? ` | subdirs: ${subdirs.slice(0, 10).join(", ")}` : ""}

Audit every line in <current_claude_md> against the bar. Read each changed file (above) to verify stale references and to check for new traps that qualify. Write the pruned file to \`${claudeMdPath}\` — or delete it if nothing survives.`;
}

async function processDirectory(relativeDir, nonClaudeChangedFiles) {
  const fileDir = relativeDir === "." ? REPO : join(REPO, relativeDir);
  const claudeMdPath = join(fileDir, "CLAUDE.md");
  if (!existsSync(claudeMdPath)) {
    console.log(`[SKIP] ${relativeDir} — no CLAUDE.md`);
    return;
  }
  const existingClaudeMd = readFileSync(claudeMdPath, "utf-8");
  const { fileTypes, subdirs, isRoot, targetLines } = getDirectoryInfo(fileDir, REPO);
  const hierarchy = getClaudeMdHierarchy(fileDir, REPO);

  let hierarchyContext = "";
  if (hierarchy.length > 0) {
    hierarchyContext = "\n\n## Parent CLAUDE.md Files (for context)\n\n";
    for (const { path, content, lineCount } of hierarchy) {
      hierarchyContext += `### ${path} (${lineCount} lines)\n\`\`\`\n${content}\n\`\`\`\n\n`;
    }
  }

  const absoluteChangedPaths = nonClaudeChangedFiles.map((f) => join(REPO, f));
  const systemPrompt = buildSystemPrompt(isRoot);
  const userPrompt = buildUserPrompt({
    relativePath: relativeDir === "." ? "." : relativeDir,
    fileDir,
    claudeMdPath,
    existingClaudeMd,
    absoluteChangedPaths,
    fileTypes,
    subdirs,
    isRoot,
    targetLines,
    hierarchyContext,
  });

  console.log(`[START] ${relativeDir} (${existingClaudeMd.split("\n").length} lines, ${absoluteChangedPaths.length} changed files)`);
  const start = Date.now();

  try {
    const result = query({
      prompt: userPrompt,
      cwd: REPO,
      options: {
        systemPrompt,
        model: "claude-sonnet-4-6",
        allowedTools: [],
        permissionMode: "bypassPermissions",
        hooks: {},
        pathToClaudeCodeExecutable: "/opt/homebrew/bin/claude",
      },
    });
    const consume = (async () => { for await (const _m of result) {} })();
    const timeout = new Promise((resolve) => setTimeout(() => resolve("timeout"), PER_DIR_TIMEOUT_MS));
    const outcome = await Promise.race([consume.then(() => "ok"), timeout]);
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    if (outcome === "timeout") {
      console.log(`[TIMEOUT] ${relativeDir} after ${elapsed}s`);
      try { if (typeof result.interrupt === "function") await result.interrupt(); } catch {}
    } else {
      console.log(`[DONE] ${relativeDir} in ${elapsed}s`);
    }
  } catch (err) {
    console.log(`[ERROR] ${relativeDir}: ${err.message}`);
  }
}

async function main() {
  const gitFiles = execSync(`git diff --name-only ${BASE}...${HEAD}`, { cwd: REPO, encoding: "utf8" })
    .trim().split("\n").filter(Boolean);

  const byDir = new Map();
  for (const f of gitFiles) {
    if (basename(f) === "CLAUDE.md") continue;
    const d = dirname(f) || ".";
    if (!byDir.has(d)) byDir.set(d, []);
    byDir.get(d).push(f);
  }

  // Directories that got CLAUDE.md changes in this PR
  const claudeMdDirs = new Set(
    gitFiles.filter((f) => basename(f) === "CLAUDE.md").map((f) => dirname(f) || ".")
  );

  const targets = [];
  for (const dir of claudeMdDirs) {
    const changedFiles = byDir.get(dir) || [];
    if (changedFiles.length === 0 && dir !== ".") {
      console.log(`[SKIP] ${dir} — only CLAUDE.md touched, no code change in dir`);
      continue;
    }
    // Root: fall back to CHANGELOG + package.json if no non-CLAUDE root files
    const filesForDir = changedFiles.length > 0 ? changedFiles : ["CHANGELOG.md", "package.json"];
    if (RETRY_ONLY.size > 0 && !RETRY_ONLY.has(dir)) continue;
    targets.push({ dir, files: filesForDir });
  }

  console.log(`\nProcessing ${targets.length} directories with concurrency=${CONCURRENCY}\n`);

  // Simple concurrency pool
  let idx = 0;
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (idx < targets.length) {
      const mine = targets[idx++];
      await processDirectory(mine.dir, mine.files);
    }
  });
  await Promise.all(workers);

  console.log("\nAll directories processed.");
}

main().catch((e) => { console.error(e); process.exit(1); });
