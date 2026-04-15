---
description: Discover ports, generate grove config, and prepare a project for portable planting
allowed-tools: Bash(*), Read, Write, Glob, Grep, Agent
argument-hint: <source-path>
---

# Grove Seed

**Arguments:** $ARGUMENTS

Analyze a project's port usage, generate `.claude/grove/config.json` and `setup.sh`, and register it with grove. After seeding, any teammate can run `/grove:plant` without discovery — the CLI reads the config and runs setup.sh automatically.

## Step 1: Parse arguments

Extract `source-path` from `$ARGUMENTS`. Resolve to absolute path if relative.

## Step 2: Check for existing config

```bash
test -f <source-path>/.claude/grove/config.json && echo "EXISTS" || echo "NOT_FOUND"
```

If `EXISTS`: ask the user whether to overwrite or update the existing config before proceeding.

---

## Step 3: Codebase Discovery

Launch **three parallel explore agents** to analyze the source project. Each agent reports findings concisely.

### Agent 1: Port & Service Map

The port map drives everything — slot assignment, .env patching, and verification. Incomplete discovery means services silently connect to the wrong instance. Explore the codebase to build a complete port map:

- Find all `.env`, `.env.*`, `.env.example`, `.env.local` files
- Extract every `PORT=`, `*_PORT=`, `*_URL=` variable
- Identify the project structure — monorepo with subdirectories, or single service?
- Map inter-service communication — which services reference other services' URLs/ports?
- Find database connection strings and their ports
- Check Docker Compose files for port mappings

**Output:** A table of services, their base ports, what env var controls each, and what offset to use (default 100, use 1 for things like CDP debug ports).

### Agent 2: Hardcoded Port Scan

Env-var-driven ports get patched automatically during setup. Hardcoded ports don't — they silently point the new instance at the original's services, or cause bind conflicts on startup. Search the entire source (excluding node_modules, .next, dist) for hardcoded port references. These are the places people miss:

**Non-obvious locations to check:**
- `.claude/commands/*.md` — slash commands with hardcoded ports in examples or verification steps. Claude sessions in the new instance will run these commands against the wrong services.
- `.claude/scripts/*.sh` — automation scripts with port references (kill_on_port, lsof, curl checks). These will kill processes or health-check the original instance instead of the new one.
- `.claude/**/*.md` — skills, rules, docs, specs with port references that inform Claude's behavior in the new instance.
- `.claude/**/*.json` and `.claude/**/*.yaml` — hook configs, pipeline definitions that execute in the new instance's context.
- `tenant-config.json` or similar runtime config — dashboards, API endpoints, chat URLs baked into the app at startup.
- OAuth/auth callback URLs and redirect URIs (`CORE_URL`, `callbackUrl`) — auth flows redirect back to the wrong instance, causing login failures.
- CORS origin lists (`CORS_ORIGINS=`) — the new instance's frontend gets blocked by CORS because its port isn't in the allow list.
- Vite/webpack dev server proxy configs with hardcoded targets — dev server proxies API calls to the original instance instead of the local one.
- Docker Compose `ports:` mappings (host:container) — two instances can't bind the same host port.
- Deep link protocol schemes (Electron apps) — both instances register the same OS protocol handler, causing opens to route to the wrong one.
- Chrome DevTools / CDP `remote-debugging-port` in package.json — two Electron instances can't share a CDP port.
- Hardcoded constants in source: `const PORT = 3071` — bypasses .env entirely, immune to patching.
- Frontend `NEXT_PUBLIC_*` env vars with port-bearing URLs — baked in at build time, so runtime .env changes don't help.
- Package.json scripts with port references (`lsof -i :3068`) — port guards and dev scripts target the wrong port.
- CI configs run in isolated containers — skip these.

For each finding, report: **file, line number, current value, and whether it's env-var driven or hardcoded.**

### Agent 3: Build & Dependency Analysis

A copy without installed dependencies and generated code won't start. The install order matters — shared packages must be linked before dependents install, codegen must run before the app can import generated clients. Analyze what it takes to set up a copy:

- Package manager per service/directory (npm, pnpm, yarn, bun)
- Build commands and order of operations
- Codegen steps: Prisma generate, GraphQL codegen, etc.
- Database setup: migration commands, separate DBs per instance?
- Post-install hooks (native module rebuilds, vendor scripts)
- Shared packages / local linking (yalc, npm link, workspace protocols)
- What to exclude from copy: node_modules, .next, dist, .turbo, .cache, *.tsbuildinfo
- Git submodules that need `--recurse-submodules`
- Private registry tokens (.npmrc referencing env vars)
- Whether repos should be cloned (monorepo with multiple git repos) or rsync-copied (single repo)

---

## Step 4: Generate config.json

Synthesize Agent 1 and Agent 3 findings. Create `.claude/grove/` if it doesn't exist:

```bash
mkdir -p <source-path>/.claude/grove
```

Write `<source-path>/.claude/grove/config.json`:

```json
{
  "version": 1,
  "name": "<project-name>",
  "ports": {
    "<service>": { "base": <N>, "offset": <N> }
  },
  "excludes": ["node_modules", ".next", "dist", ".turbo", ".cache"],
  "setupHandlesCopy": false
}
```

- `name` — derive from directory name or package.json `name` field
- `ports` — one entry per service found by Agent 1; use `offset: 1` for debug/CDP ports, `offset: 100` for everything else
- `excludes` — extend the defaults with any project-specific build artifacts Agent 3 identified
- `setupHandlesCopy` — set `true` only if the project has a custom clone/copy strategy (rare)

---

## Step 5: Generate setup.sh

Create `<source-path>/.claude/grove/setup.sh` based on Agent 1, 2, and 3 findings. The script must be project-specific — fill in the actual .env file paths, port variable names, service directories, and codegen commands discovered. Do not generate a no-op shell of comments.

The script must:
- Accept `--mode full|post-copy --source <path> --target <path> --slot <N> --name <name>` args
- Read `GROVE_PORT_*` env vars (set by grove CLI before calling the script)
- Patch `.env` files: update `PORT=`, `*_URL=`, `DATABASE_URL`, `CORS_ORIGINS` with values from env vars
- Patch `.claude/` directory: find-and-replace base port numbers with slot ports in `.md`, `.sh`, `.json`, `.yaml` files
- Patch other config files (`tenant-config.json`, `docker-compose.yml`, etc.) if applicable
- Install dependencies per service directory
- Run codegen (`prisma generate`, GraphQL codegen, etc.) if applicable
- Be idempotent — safe to re-run

Template structure (replace all placeholder comments with actual project-specific commands):

```bash
#!/usr/bin/env bash
set -euo pipefail

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --mode) MODE="$2"; shift 2 ;;
    --source) SOURCE="$2"; shift 2 ;;
    --target) TARGET="$2"; shift 2 ;;
    --slot) SLOT="$2"; shift 2 ;;
    --name) NAME="$2"; shift 2 ;;
    *) shift ;;
  esac
done

# Also available via env: GROVE_SLOT, GROVE_SOURCE, GROVE_TARGET,
# GROVE_INSTANCE_NAME, GROVE_PORT_*, GROVE_PORTS_JSON
TARGET="${TARGET:-${GROVE_TARGET:-}}"
SOURCE="${SOURCE:-${GROVE_SOURCE:-}}"
SLOT="${SLOT:-${GROVE_SLOT:-}}"

CONFIG_FILE="$(dirname "$0")/config.json"

# --- .env patching ---
# Update each .env file with slot-computed port values from GROVE_PORT_* vars

# --- .claude/ port patching ---
# Find-replace base ports with computed ports in .claude/ files

# --- config file patching ---
# Update tenant-config.json, docker-compose.yml, etc. if present

# --- dependency installation ---
# Run package manager install per service directory

# --- codegen ---
# Run prisma generate, GraphQL codegen, etc.
```

Make the script executable:

```bash
chmod +x <source-path>/.claude/grove/setup.sh
```

---

## Step 6: Address hardcoded ports

If Agent 2 found hardcoded ports that should be env-var driven, list them with file and line number. Ask the user before modifying source files. Common fixes:

- `const PORT = 3071` → `parseInt(process.env.SERVICE_PORT ?? '3071', 10)`
- Hardcoded proxy targets → env var interpolation in vite/webpack config
- Docker Compose hardcoded host ports → `${VAR:-default}:container_port`
- Add missing port variables to `.env.example`

---

## Step 7: Register

```bash
grove register <source-path> --from-config
```

---

## Step 8: Report

Tell the user:
- What was written to `.claude/grove/config.json` and `setup.sh`
- That they should commit `.claude/grove/` so teammates get the fast-path plant
- That future `/grove:plant` calls on this project will skip discovery entirely
- Any hardcoded ports still remaining that weren't fixed (from Agent 2)
