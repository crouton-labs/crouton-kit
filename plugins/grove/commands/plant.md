---
description: Create a parallel instance — discovers ports, registers if needed, plants, and configures everything
allowed-tools: Bash(*), Read, Glob, Grep, Agent
argument-hint: <source-path> <instance-name> [--slot N]
---

# Grove Plant

**Arguments:** $ARGUMENTS

Create an isolated parallel instance of a project with automatic port allocation. Handles the full lifecycle: codebase discovery, grove registration, planting, and post-plant configuration.

**Why this is hard:** Running two copies of the same project means every port, URL, database name, and protocol scheme must be unique per instance. Port references hide in dozens of places beyond .env files — slash commands, automation scripts, proxy configs, OAuth callbacks, Electron app identities. Missing even one causes the new instance to silently talk to the original's services.

## Step 1: Parse arguments and check registration

Parse `$ARGUMENTS` for:
- `source-path` — absolute or relative path to the source project
- `instance-name` — name for the new instance
- `--slot N` — optional explicit slot (1-9, auto-assigned if omitted)

Check if the project is already registered:

```bash
grove list
```

**If already registered** → skip to Step 4.
**If not registered** → continue to Step 2.

---

## Step 2: Codebase Discovery (unregistered projects only)

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

## Step 3: Register

Based on discovery findings:

### 3a. Determine port specs

For each service, define `name:base:offset`:
- Default offset is `100` (slot 1 → +100, slot 2 → +200)
- Use offset `1` for debug ports like CDP (9222 → 9223, 9224, ...)
- Use offset `100` for everything else unless ports would collide

### 3b. Fix hardcoded ports in source (if any)

Hardcoded ports can't be patched during plant — they need to be fixed in the source so all future instances work. If Agent 2 found hardcoded ports that should be env-var driven, **list them and ask** before modifying source. Common fixes:
- `const PORT = 3071` → `parseInt(process.env.GALLERY_API_PORT ?? '3071', 10)`
- Hardcoded proxy targets → env var interpolation in vite/webpack config
- Docker Compose hardcoded host ports → `${VAR:-default}:container_port`
- Add missing port variables to `.env.example`

### 3c. Check for init script

Look for `.claude/scripts/create-*-env.sh` or similar in the source. If one exists, use it with `--init`. If the project is complex (monorepo, multiple services, database isolation) and has no init script, flag this — the user may want to create one before proceeding.

### 3d. Register

```bash
grove register <source-path> --name <project-name> \
  --port <service1:base1:offset1> \
  --port <service2:base2:offset2> \
  [--init <script-path>] \
  [--teardown <script-path>]
```

---

## Step 4: Plant

```bash
grove plant <project> <instance-name> [--slot N]
```

Parse the `--- grove-output ---` JSON block from stdout. It contains:
- `target` — new instance directory path
- `slot` — assigned slot number
- `ports` — computed port mappings per service
- `source` — source project path

---

## Step 5: Post-Plant Setup

If the project has an init script, it already handled most of this. Check its output to avoid duplicate work. Otherwise, do each of these:

### 5a. Patch .env files
Update all `.env`, `.env.development`, `.env.local` files in the target with slot-computed ports. Patch:
- `PORT=` lines
- `*_URL=http://localhost:NNNN` references
- `DATABASE_URL` — use slot-specific DB name if applicable
- `CORS_ORIGINS` with updated port numbers

### 5b. Patch .claude/ directory
Find-and-replace base port numbers with slot ports across all `.md`, `.sh`, `.json`, `.yaml` files in `.claude/`. This is the most commonly missed step — stale ports in the new instance's slash commands and scripts cause Claude sessions to operate on the original instance's services without any visible error.

### 5c. Patch config files
Update `tenant-config.json`, `docker-compose.yml`, and similar with slot ports.

### 5d. Install dependencies
Run the appropriate package manager install in each service directory. Watch for:
- Private registry tokens that need exporting
- `--frozen-lockfile` for reproducibility
- Post-install hooks that need specific env vars

### 5e. Run codegen and migrations
- Prisma: `prisma generate` then `prisma migrate deploy`
- Create slot-specific databases if needed
- Any other codegen (GraphQL, OpenAPI, etc.)

---

## Step 6: Verify and Report

### Verification checks

A planted instance that looks complete but has one stale port reference will fail in subtle, hard-to-debug ways — requests silently route to the wrong backend, Claude commands operate on the wrong instance. Verify exhaustively:

- Each service directory exists and has `node_modules/`
- Port references in `.env` files match slot-computed values
- No stale base port references remain in `.claude/` files:
  ```bash
  grep -rl ':<base_port>' <target>/.claude/
  # Should return empty for each base port
  ```
- Branches are correct (if cloned from git)
- Codegen artifacts exist (Prisma client, etc.)

### Report
Output a summary with:
- Instance path, slot number, project name
- Port assignments per service
- What was set up automatically vs. needs manual attention
- Any hardcoded ports still remaining in the source (from Agent 2 findings)
