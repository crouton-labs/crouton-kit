# CLAUDE.md

## Command roles

`/plant` and `/seed` are the composite commands — they orchestrate discovery, registration, and planting. The other commands (`/adopt`, `/register`, `/list`, `/doctor`, `/uproot`) are thin passthroughs to the `grove` CLI. Don't add synthesis logic to the thin ones.

`/list` and `/doctor` use `disable-model-invocation: true` — they produce no model output, just raw CLI output piped to the user.

## `/seed` flow

`/seed` runs **three parallel discovery agents** on a source project and outputs two files into `.claude/grove/`:

- `config.json` — port definitions, excludes, and metadata. Used by `grove register --from-config` and read by `setup.sh` for base port values.
- `setup.sh` — post-plant script that patches .env files, .claude/ directory port references, config files, installs dependencies, and runs codegen.

After seeding, the user commits `.claude/grove/` and teammates run `/grove:plant` with no discovery step.

If `.claude/grove/config.json` already exists, `/seed` asks before overwriting.

## `/plant` flow — two paths

`/plant` checks for `.claude/grove/config.json` immediately after parsing arguments:

**Seeded path (config exists):**
1. Register via `grove register <source> --from-config` if not already registered
2. Run `grove plant`
3. The CLI automatically invokes `setup.sh` with `GROVE_PORT_*` env vars — no manual patching steps
4. Lightweight verification and report

**Discovery path (no config):**
1. Run **three parallel discovery agents** (same agents as `/seed` Step 3)
2. `grove register` with explicit `--port` flags
3. `grove plant`
4. Manual post-plant patching: .env files, .claude/ directory, config files, dependency install, codegen
5. Full verification

The registration check (`grove list`) gates both paths — if already registered, skip to plant.

## `.claude/grove/` contract

Projects that have been seeded contain:

```
.claude/grove/
  config.json   — port definitions, excludes, name, version
  setup.sh      — idempotent post-plant setup script
```

`config.json` schema:
```json
{
  "version": 1,
  "name": "<project-name>",
  "ports": {
    "<service>": { "base": <N>, "offset": <N> }
  },
  "excludes": ["node_modules", ".next", "dist", ...],
  "setupHandlesCopy": false
}
```

`setup.sh` is called by the grove CLI as:
```
setup.sh --mode full|post-copy --source <path> --target <path> --slot <N> --name <name>
```
The CLI also sets `GROVE_SLOT`, `GROVE_SOURCE`, `GROVE_TARGET`, `GROVE_INSTANCE_NAME`, `GROVE_PORT_<SERVICE>`, and `GROVE_PORTS_JSON` in the environment before calling the script.

## `grove register` flags

`--from-config` — reads port definitions, name, excludes, and setup script path from `.claude/grove/config.json`. Explicit CLI flags override config values.

`--update` — updates an existing registration rather than erroring. Used when re-seeding a project that was already registered.

## Port formula

```
actual_port = base + (slot × offset)
```

Use `offset: 1` for debug/CDP ports (9222, 9229) so slot 2 → 9223, slot 3 → 9224. Use `offset: 100` for everything else. Mixing offsets in a single project is intentional — don't normalize them.

## Most-missed post-plant step (discovery path only)

Step 10b (`.claude/` directory patching) is explicitly the most commonly missed in the discovery path. After planting, find-replace base port numbers across `.md`, `.sh`, `.json`, `.yaml` files in the target's `.claude/` directory. Stale ports here cause Claude sessions in the new instance to silently operate on the original instance's services. Seeded projects handle this in `setup.sh`.

## `/adopt` slot detection

`/adopt` auto-detects the slot number from `PORT=` values in `.env` files in the target directory. Pass `--slot N` explicitly only when the .env file is absent or has a non-standard port variable name.

## Init script contract (discovery path)

Grove calls the init script as:
```
<script> <source> <target> <slot> <name>
```
If a project has `.claude/scripts/create-*-env.sh`, `/plant` passes it via `--init`. If the init script ran successfully, Step 10 (post-plant setup) skips steps the script already handled — check init output before patching .env files manually.

Seeded projects use `setup.sh` instead of the init script pattern.

## `/uproot` does not auto-clean

`grove uproot` removes the directory and registry entry but does **not** kill running processes or drop databases. After uprooting, read the cleanup hints in the command output and run them manually (kill by port, `psql` to drop slot DB).
