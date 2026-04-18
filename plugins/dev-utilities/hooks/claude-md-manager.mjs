#!/usr/bin/env node

import { query } from "@r-cli/sdk";
import { execSync } from "child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { basename, dirname, join, relative } from "path";

const HOOK_NAME = 'claude-md-manager';
const STATE_FILE_NAME = 'claude-md-manager-cache.json';

function appendLog(message) {
  const homeDir = process.env.HOME;
  if (!homeDir) return;

  const logPath = join(homeDir, '.claude', 'logs', 'hooks.log');
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] [${HOOK_NAME}] ${message}\n`;
  try {
    writeFileSync(logPath, entry, { flag: 'a' });
  } catch (error) {
    // Ignore logging failures
  }
}

function getStateFilePath() {
  const homeDir = process.env.HOME;
  if (!homeDir) return null;
  return join(homeDir, '.claude', 'state', STATE_FILE_NAME);
}

function loadProcessingCache() {
  const statePath = getStateFilePath();
  if (!statePath || !existsSync(statePath)) return {};

  try {
    return JSON.parse(readFileSync(statePath, 'utf-8'));
  } catch (error) {
    appendLog(`[WARN] Failed to load cache: ${error.message}`);
    return {};
  }
}

function saveProcessingCache(cache) {
  const statePath = getStateFilePath();
  if (!statePath) return;

  try {
    mkdirSync(dirname(statePath), { recursive: true });
    writeFileSync(statePath, JSON.stringify(cache, null, 2));
  } catch (error) {
    appendLog(`[WARN] Failed to persist cache: ${error.message}`);
  }
}

function getFileSignature(filePath) {
  try {
    const stats = statSync(filePath);
    return { deleted: false, mtimeMs: stats.mtimeMs, size: stats.size };
  } catch (error) {
    return { deleted: true };
  }
}

function signaturesEqual(current, cached) {
  if (!current || !cached) return false;
  if (current.deleted !== cached.deleted) return false;
  if (current.deleted) return true;
  return current.mtimeMs === cached.mtimeMs && current.size === cached.size;
}

function markFilesAsHandled(filesInDir, filesHandled) {
  for (const { file, signature } of filesInDir) {
    filesHandled.set(file, signature);
  }
}

function pruneCache(cache, activeFiles) {
  if (!cache) return {};
  const pruned = {};
  for (const [file, signature] of Object.entries(cache)) {
    if (activeFiles.has(file)) {
      pruned[file] = signature;
    }
  }
  return pruned;
}

/**
 * Get directory info for CLAUDE.md analysis
 */
function getDirectoryInfo(dirPath, cwd) {
  if (!existsSync(dirPath)) {
    const relativeDirPath = relative(cwd, dirPath);
    const isRoot = relativeDirPath === '';
    return {
      fileCount: 0,
      fileTypes: [],
      subdirs: [],
      relativeDirPath,
      isRoot,
      targetLines: isRoot ? '~150' : '<25'
    };
  }

  const dirContents = readdirSync(dirPath);

  const files = dirContents.filter(f => {
    const fullPath = join(dirPath, f);
    try {
      return statSync(fullPath).isFile();
    } catch (error) {
      return false;
    }
  });

  const fileTypes = files
    .map(f => f.split('.').pop())
    .filter(ext => ext && ext.length < 10);

  const subdirs = dirContents.filter(f => {
    const fullPath = join(dirPath, f);
    try {
      return statSync(fullPath).isDirectory() && !f.startsWith('.');
    } catch (error) {
      return false;
    }
  });

  const relativeDirPath = relative(cwd, dirPath);
  const isRoot = relativeDirPath === '';

  let targetLines;
  if (isRoot) {
    targetLines = '~150';
  } else {
    targetLines = '<15';
  }

  return { fileCount: files.length, fileTypes, subdirs, relativeDirPath, isRoot, targetLines };
}

/**
 * Load ignore patterns from a file (one pattern per line, # for comments)
 */
function loadIgnoreFile(filePath) {
  if (!existsSync(filePath)) return [];

  try {
    const content = readFileSync(filePath, 'utf-8');
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'));
  } catch (error) {
    return [];
  }
}

/**
 * Load settings with exclusion patterns from ignore files
 */
function loadSettings(cwd) {
  const homeDir = process.env.HOME;
  const excludedDirectories = [];

  // Load from global ignore file
  if (homeDir) {
    const candidatePaths = [
      join(homeDir, '.claude', '.claude-md-manager-ignore'),
      join(homeDir, '.claude-md-manager-ignore')
    ];

    for (const path of candidatePaths) {
      excludedDirectories.push(...loadIgnoreFile(path));
    }
  }

  // Load from local ignore file
  const localIgnorePath = join(cwd, '.claude-md-manager-ignore');
  excludedDirectories.push(...loadIgnoreFile(localIgnorePath));

  return { excludedDirectories };
}

/**
 * Check if a directory path matches exclusion patterns
 */
function isDirectoryExcluded(relativePath, excludedPatterns) {
  for (const pattern of excludedPatterns) {
    // Normalize pattern: remove trailing slashes
    const normalizedPattern = pattern.replace(/\/$/, '');

    const pathParts = relativePath.split('/');

    // Exact match
    if (relativePath === normalizedPattern) return true;

    // Check if path starts with pattern (handles "foo/" matching "foo/bar")
    if (relativePath.startsWith(normalizedPattern + '/')) return true;

    // Handle simple wildcard directory patterns like "foo/*"
    const wildcardDirMatch = normalizedPattern.match(/^(.*)\/(\*)$/);
    if (wildcardDirMatch) {
      const baseDir = wildcardDirMatch[1];
      if (relativePath === baseDir || relativePath.startsWith(baseDir + '/')) {
        return true;
      }
    }

    // Check if any path segment matches
    for (const part of pathParts) {
      if (part === normalizedPattern) return true;
    }

    // Pattern matching (e.g., "commands/*")
    if (normalizedPattern.includes('*')) {
      const regex = new RegExp('^' + normalizedPattern.replace(/\*/g, '.*') + '$');
      if (regex.test(relativePath)) return true;
    }
  }

  return false;
}

/**
 * Collect parent CLAUDE.md files
 */
function getClaudeMdHierarchy(fileDir, cwd) {
  const claudeMdHierarchy = [];
  let currentDir = fileDir;

  while (currentDir.startsWith(cwd)) {
    const potentialClaudeMd = join(currentDir, 'CLAUDE.md');
    if (existsSync(potentialClaudeMd) && currentDir !== fileDir) {
      const content = readFileSync(potentialClaudeMd, 'utf-8');
      const lineCount = content.split('\n').length;
      claudeMdHierarchy.unshift({
        path: relative(cwd, potentialClaudeMd),
        content,
        lineCount
      });
    }
    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) break;
    currentDir = parentDir;
  }

  return claudeMdHierarchy;
}

/**
 * Discover git repositories starting from cwd.
 * If cwd itself is a git repo, return [gitRoot].
 * Otherwise, scan immediate child directories for .git entries.
 */
function discoverGitRepos(cwd) {
  try {
    const gitRoot = execSync('git rev-parse --show-toplevel', { cwd, encoding: 'utf8' }).trim();
    return [gitRoot];
  } catch (_error) {
    // cwd is not a git repo — scan immediate children
  }

  const repos = [];
  let entries;
  try {
    entries = readdirSync(cwd);
  } catch (_error) {
    return repos;
  }

  for (const entry of entries) {
    if (entry.startsWith('.')) continue;
    const childPath = join(cwd, entry);
    try {
      if (!statSync(childPath).isDirectory()) continue;
    } catch (_error) {
      continue;
    }
    if (existsSync(join(childPath, '.git'))) {
      repos.push(childPath);
    }
  }

  return repos;
}

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

/**
 * Process a single git repository: diff, filter, query, return results.
 */
async function processRepo(repoCwd, sessionId, processingCache) {
  const homeDir = process.env.HOME;
  const changedFileSet = new Set();
  const filesHandled = new Map();

  // Get all changed files via git
  let changedFiles = [];
  try {
    const gitOutput = execSync('git diff --name-only HEAD', { cwd: repoCwd, encoding: 'utf8' });
    changedFiles = gitOutput.trim().split('\n').filter(Boolean);

    if (changedFiles.length === 0) {
      appendLog(`[START] session=${sessionId}, cwd=${repoCwd} | [SKIP] No file changes detected`);
      return { changedFileSet, filesHandled, directoriesProcessed: 0 };
    }
  } catch (error) {
    appendLog(`[START] session=${sessionId}, cwd=${repoCwd} | [SKIP] Git check failed or not a repo`);
    return { changedFileSet, filesHandled, directoriesProcessed: 0 };
  }

  const directoryFiles = new Map();
  const directoryDeletedFiles = new Map();
  const relativeDirLookup = new Map();
  let skippedGitIgnored = 0;
  let unchangedSinceLastRun = 0;

  for (const file of changedFiles) {
    const filePath = join(repoCwd, file);
    const fileDir = dirname(filePath);
    const relativePath = relative(repoCwd, fileDir) || '.';

    // Skip .claude directories
    if (relativePath.includes('.claude')) continue;

    // Skip CLAUDE.md files themselves
    if (basename(filePath) === 'CLAUDE.md') continue;

    // Skip files outside repoCwd
    if (relativePath.startsWith('..')) continue;

    // Skip git-ignored files
    try {
      execSync(`git check-ignore -q "${file}"`, { cwd: repoCwd, stdio: 'pipe' });
      skippedGitIgnored++;
      continue;
    } catch (_error) {
      // Non-zero exit code means file is NOT ignored
    }

    const cacheKey = join(repoCwd, file);
    changedFileSet.add(cacheKey);

    const signature = getFileSignature(filePath);
    const cachedSignature = processingCache[cacheKey];
    if (cachedSignature && signaturesEqual(signature, cachedSignature)) {
      unchangedSinceLastRun++;
      continue;
    }

    if (!directoryFiles.has(fileDir)) {
      directoryFiles.set(fileDir, []);
      relativeDirLookup.set(fileDir, relativePath);
    }

    directoryFiles.get(fileDir).push({ file: cacheKey, signature });

    // Track deleted files separately so prompts can request stale content removal
    if (signature.deleted) {
      if (!directoryDeletedFiles.has(fileDir)) {
        directoryDeletedFiles.set(fileDir, []);
      }
      directoryDeletedFiles.get(fileDir).push(basename(file));
    }
  }

  if (directoryFiles.size === 0) {
    const detailParts = [];
    if (unchangedSinceLastRun > 0) detailParts.push(`unchanged=${unchangedSinceLastRun}`);
    if (skippedGitIgnored > 0) detailParts.push(`git-ignored=${skippedGitIgnored}`);
    const detailSuffix = detailParts.length > 0 ? ` (${detailParts.join(', ')})` : '';
    appendLog(`[START] session=${sessionId}, cwd=${repoCwd} | [SKIP] No new file changes since last run${detailSuffix}`);
    return { changedFileSet, filesHandled, directoriesProcessed: 0 };
  }

  const { excludedDirectories } = loadSettings(repoCwd);

  const directoriesToProcess = [];

  for (const [fileDir, filesInDir] of directoryFiles.entries()) {
    const relativePath = relativeDirLookup.get(fileDir) || '.';

    if (isDirectoryExcluded(relativePath, excludedDirectories)) {
      appendLog(`[SKIP] ${relativePath} (excluded by config)`);
      markFilesAsHandled(filesInDir, filesHandled);
      continue;
    }

    const claudeMdPath = join(fileDir, 'CLAUDE.md');
    const globalClaudePath = homeDir ? join(homeDir, '.claude', 'CLAUDE.md') : null;
    if (globalClaudePath && claudeMdPath === globalClaudePath) {
      appendLog(`[SKIP] ${relativePath} (global CLAUDE.md - not managed by hook)`);
      markFilesAsHandled(filesInDir, filesHandled);
      continue;
    }

    const hasClaudeMd = existsSync(claudeMdPath);
    const existingClaudeMd = hasClaudeMd ? readFileSync(claudeMdPath, 'utf-8') : '';
    const { fileCount, fileTypes, subdirs, isRoot, targetLines } = getDirectoryInfo(fileDir, repoCwd);

    if (!hasClaudeMd && !isRoot && fileCount < 4) {
      appendLog(`[SKIP] ${relativePath} (only ${fileCount} files, need ≥4)`);
      markFilesAsHandled(filesInDir, filesHandled);
      continue;
    }

    const claudeMdHierarchy = getClaudeMdHierarchy(fileDir, repoCwd);
    const changedFilesInDir = filesInDir.map(({ file }) => basename(file));

    // Load custom guidance file if present
    const customGuidancePath = join(fileDir, '.claude-md-manager.md');
    const customGuidance = existsSync(customGuidancePath)
      ? readFileSync(customGuidancePath, 'utf-8')
      : null;

    const deletedFilesInDir = directoryDeletedFiles.get(fileDir) || [];

    directoriesToProcess.push({
      relativePath,
      fileDir,
      claudeMdPath,
      hasClaudeMd,
      existingClaudeMd,
      fileTypes,
      subdirs,
      isRoot,
      targetLines,
      claudeMdHierarchy,
      changedFilesInDir,
      deletedFilesInDir,
      filesInDir,
      customGuidance
    });
  }

  const startParts = [
    `session=${sessionId}`,
    `directories=${directoriesToProcess.length}`
  ];
  if (skippedGitIgnored > 0) startParts.push(`git-ignored=${skippedGitIgnored}`);
  if (unchangedSinceLastRun > 0) startParts.push(`unchanged=${unchangedSinceLastRun}`);
  appendLog(`[START] ${startParts.join(', ')}`);

  if (excludedDirectories.length > 0) {
    appendLog(`[CONFIG] Excluded directories: ${excludedDirectories.join(', ')}`);
  }

  if (directoriesToProcess.length === 0) {
    appendLog('[SKIP] No directories qualified after filtering');
    return { changedFileSet, filesHandled, directoriesProcessed: 0 };
  }

  for (const {
    relativePath,
    fileDir,
    claudeMdPath,
    hasClaudeMd,
    existingClaudeMd,
    fileTypes,
    subdirs,
    isRoot,
    targetLines,
    claudeMdHierarchy,
    changedFilesInDir,
    deletedFilesInDir,
    filesInDir,
    customGuidance
  } of directoriesToProcess) {
    let hierarchyContext = '';
    if (claudeMdHierarchy.length > 0) {
      hierarchyContext = '\n\n## Parent CLAUDE.md Files (for context)\n\n';
      for (const { path, content, lineCount } of claudeMdHierarchy) {
        hierarchyContext += `### ${path} (${lineCount} lines)\n\`\`\`\n${content}\n\`\`\`\n\n`;
      }
    }

    let customGuidanceContext = '';
    if (customGuidance) {
      customGuidanceContext = '\n\n## Custom Guidance For This Directory\n\n' + customGuidance + '\n\n';
    }

    const systemPrompt = isRoot
      ? `You are a senior engineer maintaining a root CLAUDE.md — the persistent context file Claude Code loads every session. Every line competes for context window space. Bloat degrades adherence to every instruction in the file. Your default stance is to cut.

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

<example>
<input>A Next.js app with Prisma ORM, pnpm workspaces</input>
<output>
# Project

pnpm monorepo. Next.js frontend in \`apps/web/\`, shared packages in \`packages/\`.

## Commands
\`\`\`bash
pnpm dev          # start all workspaces
pnpm test         # vitest across all packages
pnpm db:migrate   # prisma migrate dev (requires DATABASE_URL in .env.local)
\`\`\`

## Constraints
- DB schema changes: edit \`prisma/schema.prisma\`, then \`pnpm db:migrate\` — never hand-edit migration SQL
- Import from \`@repo/ui\` in apps, never relative paths into \`packages/ui/src/\`
- \`NEXT_PUBLIC_\` prefix required for any env var used client-side — omitting it silently returns \`undefined\`
</output>
</example>

## Procedure
1. Read the changed files in this directory to ground yourself in what actually changed.
2. Read the existing CLAUDE.md line by line. Apply the prune audit to each line. Mark keep/cut based on the bar.
3. Check for stale references and new traps that meet the bar (but not yet documented).
4. Use the Write tool once to save the pruned (and updated) file. If nothing survives, delete it. Produce no explanatory text.

"No change" is only acceptable if every surviving line qualifies under the bar. Staleness-is-zero is not sufficient justification. Equally, do not cut a line that qualifies just to reduce count.`
      : `You are auditing a subdirectory CLAUDE.md. Subdirectory CLAUDE.md files are expensive: they compete for a limited instruction budget (~150 total across all sources) and degrade adherence to ALL instructions when bloated. Most directories need no CLAUDE.md at all. Your default stance is to cut or delete — but never cut content that qualifies under the bar.

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

    const deletionContext = deletedFilesInDir.length > 0
      ? `\nDeleted files: ${deletedFilesInDir.join(', ')}\nIMPORTANT: Remove any CLAUDE.md content that references deleted files, functions, or patterns that no longer exist. Stale documentation is worse than no documentation.\n`
      : '';

    const currentLines = existingClaudeMd ? existingClaudeMd.split('\n').length : 0;
    const lengthDirective = hasClaudeMd
      ? (currentLines > targetLines
          ? `Current: ${currentLines} lines. Target ceiling: ${targetLines}. Likely room to cut — run the full audit. If all surviving content qualifies under the bar, exceeding the target is acceptable; do not cut qualifying traps to hit the number.`
          : `Current: ${currentLines} lines (within target ceiling of ${targetLines}). Still run the full prune audit — cut anything that fails the audit.`)
      : `Target ceiling: ${targetLines} lines. Most directories should get 0 lines.`;

    const absoluteChangedPaths = filesInDir.map(({ file }) => join(repoCwd, file));
    const userPrompt = hasClaudeMd
      ? `Directory: \`${relativePath}\` (absolute: \`${fileDir}\`)
CLAUDE.md absolute path: \`${claudeMdPath}\`
Changed files (absolute paths — read these with Read):
${absoluteChangedPaths.map(p => `- ${p}`).join('\n')}${deletionContext}
${lengthDirective}

<current_claude_md>
${existingClaudeMd}
</current_claude_md>
${hierarchyContext}${customGuidanceContext}
Directory contents: ${fileTypes.slice(0, 10).join(', ')}${subdirs.length > 0 ? ` | subdirs: ${subdirs.slice(0, 10).join(', ')}` : ''}

Audit every line in <current_claude_md> against the bar. Read each changed file (above) to verify stale references and to check for new traps that qualify. Write the pruned file to \`${claudeMdPath}\` — or delete it if nothing survives.`
      : `Directory: \`${relativePath}\` (absolute: \`${fileDir}\`)
CLAUDE.md absolute path (does not exist yet): \`${claudeMdPath}\`
Changed files (absolute paths — read these with Read):
${absoluteChangedPaths.map(p => `- ${p}`).join('\n')}${deletionContext}
${lengthDirective}
${hierarchyContext}${customGuidanceContext}
Directory contents: ${fileTypes.slice(0, 10).join(', ')}${subdirs.length > 0 ? ` | subdirs: ${subdirs.slice(0, 10).join(', ')}` : ''}

Read the changed files. Create \`${claudeMdPath}\` only if there are non-obvious silent-breakage traps that meet the bar above. Do nothing otherwise.`;

    try {
      const result = query({
        prompt: userPrompt,
        cwd: repoCwd,
        options: {
          systemPrompt,
          model: "claude-sonnet-4-6",
          allowedTools: [],
          permissionMode: "bypassPermissions",
          hooks: {},
          pathToClaudeCodeExecutable: "/opt/homebrew/bin/claude"
        }
      });

      const PER_DIR_TIMEOUT_MS = 240_000;
      const consume = (async () => {
        for await (const _message of result) {
          // Consume the stream
        }
      })();
      const timeoutHandle = { fired: false };
      const timeout = new Promise((resolve) => setTimeout(() => { timeoutHandle.fired = true; resolve('timeout'); }, PER_DIR_TIMEOUT_MS));
      const outcome = await Promise.race([consume.then(() => 'ok'), timeout]);

      if (outcome === 'timeout') {
        appendLog(`[TIMEOUT] ${relativePath}: exceeded ${PER_DIR_TIMEOUT_MS / 1000}s, abandoning stream`);
        try { if (typeof result.interrupt === 'function') await result.interrupt(); } catch (_err) {}
      } else {
        appendLog(`[PROCESSED] ${relativePath}`);
      }
      markFilesAsHandled(filesInDir, filesHandled);
    } catch (error) {
      appendLog(`[ERROR] ${relativePath}: ${error.message}`);
    }
  }

  return { changedFileSet, filesHandled, directoriesProcessed: directoriesToProcess.length };
}

/**
 * Background worker that processes all directories changed in the session
 */
async function backgroundWorker() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const input = Buffer.concat(chunks).toString('utf-8');
  const { sessionId, cwd, parentSessionId } = JSON.parse(input);

  // Use parent session ID for tracking to prevent duplicate processing across child sessions
  const trackingSessionId = parentSessionId || sessionId;

  const homeDir = process.env.HOME;
  const lockPath = homeDir ? join(homeDir, '.claude', 'state', `claude-md-${trackingSessionId}.lock`) : null;

  // Check if already processing this session
  if (lockPath && existsSync(lockPath)) {
    appendLog(`[SKIP] session=${sessionId} | Already processed for parent session=${trackingSessionId}`);
    process.exit(0);
  }

  // Create lock file
  if (lockPath) {
    try {
      const lockDir = dirname(lockPath);
      execSync(`mkdir -p "${lockDir}"`, { stdio: 'ignore' });
      writeFileSync(lockPath, JSON.stringify({ sessionId, parentSessionId, timestamp: new Date().toISOString() }));
    } catch (error) {
      appendLog(`[WARN] session=${sessionId} | Could not create lock file: ${error.message}`);
    }
  }

  const repos = discoverGitRepos(cwd);

  if (repos.length === 0) {
    appendLog(`[START] session=${sessionId}, cwd=${cwd} | [SKIP] No git repos found`);
    process.exit(0);
  }

  if (repos.length > 1) {
    appendLog(`[DISCOVER] Found ${repos.length} git repos under ${cwd}: ${repos.map(r => relative(cwd, r) || '.').join(', ')}`);
  }

  const processingCache = loadProcessingCache();
  const allChangedFiles = new Set();
  const allFilesHandled = new Map();
  let totalDirectoriesProcessed = 0;

  for (const repoCwd of repos) {
    let result;
    try {
      result = await processRepo(repoCwd, sessionId, processingCache);
    } catch (error) {
      appendLog(`[FATAL] processRepo threw for ${repoCwd}: ${error.message}\n${error.stack}`);
      continue;
    }
    for (const f of result.changedFileSet) allChangedFiles.add(f);
    for (const [f, sig] of result.filesHandled) allFilesHandled.set(f, sig);
    totalDirectoriesProcessed += result.directoriesProcessed;
  }

  const finalCache = pruneCache(processingCache, allChangedFiles);
  for (const [file, signature] of allFilesHandled.entries()) {
    finalCache[file] = signature;
  }
  saveProcessingCache(finalCache);

  if (totalDirectoriesProcessed > 0) {
    const repoLabel = repos.length > 1 ? ` across ${repos.length} repos` : '';
    appendLog(`[DONE] session=${sessionId} | processed ${totalDirectoriesProcessed} directories${repoLabel}`);
  }

  process.exit(0);
}

/**
 * Main hook execution
 */
async function main() {
  if (process.argv.includes('--background')) {
    await backgroundWorker();
    return;
  }

  const stdin = readFileSync(0, 'utf-8');
  const inputData = JSON.parse(stdin);

  const isSessionEnd = inputData.hook_event_name === 'SessionEnd';
  const isSessionStartClear = inputData.hook_event_name === 'SessionStart' && inputData.source === 'clear';

  if (!isSessionEnd && !isSessionStartClear) {
    process.exit(0);
  }

  // Skip if reason is other (e.g. triggered by query in hook itself)
  if (inputData.reason === 'other') {
    appendLog(`SessionEnd reason: ${inputData.reason}, skipping`);
    process.exit(0);
  }

  const sessionId = inputData.session_id;
  const cwd = inputData.cwd || process.cwd();

  if (!sessionId) {
    process.exit(0);
  }

  // Determine parent session ID from transcript to track actual user session
  let parentSessionId = null;
  try {
    const transcriptPath = inputData.transcript_path;
    if (transcriptPath && existsSync(transcriptPath)) {
      const transcript = readFileSync(transcriptPath, 'utf-8');
      const lines = transcript.trim().split('\n').filter(Boolean);

      // Find the first session start event to get the original session ID
      for (const line of lines) {
        try {
          const event = JSON.parse(line);
          if (event.type === 'session_start') {
            parentSessionId = event.sessionId || sessionId;
            break;
          }
        } catch {
          continue;
        }
      }
    }
  } catch (error) {
    // Ignore errors reading transcript
  }

  // Spawn detached background process
  const { spawn } = await import('child_process');

  const workerData = JSON.stringify({
    sessionId,
    parentSessionId,
    cwd,
  });

  const child = spawn(process.execPath, [
    import.meta.url.replace('file://', ''),
    '--background'
  ], {
    detached: true,
    stdio: ['pipe', 'ignore', 'ignore']
  });

  child.stdin.write(workerData);
  child.stdin.end();
  child.unref();

  process.exit(0);
}

main();
