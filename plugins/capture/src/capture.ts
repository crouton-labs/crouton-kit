#!/usr/bin/env tsx
/**
 * Capture session manager — thin wrapper over a project's CDP CLI.
 *
 * Usage:
 *   capture start --cdp <cdp-command> [--url <url>]
 *   capture stop <session-id>
 *   capture list
 *   capture view <session-id> [--filter screenshots|har|a11y]
 *
 * Between start and stop, use your project's CDP CLI directly.
 * Route artifacts into the session:
 *   - Screenshots: --out $CAPTURE_DIR/shots/<label>.png
 *   - HAR:         --har $CAPTURE_HAR_ID (printed by start)
 *   - A11y:        redirect output to $CAPTURE_DIR/a11y/<label>.json
 *
 * On stop, all artifacts are collected into a bundle manifest at
 * $CAPTURE_DIR/bundle.json that the agent can read and filter.
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const CAPTURE_ROOT = path.join(os.tmpdir(), "capture-sessions");

interface Session {
  id: string;
  dir: string;
  harId: string | null;
  cdpCommand: string;
  startedAt: string;
  url: string | null;
}

interface BundleManifest {
  id: string;
  startedAt: string;
  stoppedAt: string;
  duration: number;
  url: string | null;
  screenshots: Array<{ name: string; path: string }>;
  har: { id: string; path: string; entryCount: number } | null;
  a11y: Array<{ name: string; path: string }>;
  other: Array<{ name: string; path: string }>;
}

function sessionDir(id: string): string {
  return path.join(CAPTURE_ROOT, id);
}

function sessionMetaPath(id: string): string {
  return path.join(sessionDir(id), ".session.json");
}

function readSession(id: string): Session {
  const metaPath = sessionMetaPath(id);
  if (!fs.existsSync(metaPath)) {
    throw new Error(`No capture session found: ${id}`);
  }
  return JSON.parse(fs.readFileSync(metaPath, "utf-8")) as Session;
}

function cdp(session: Session, args: string): string {
  return execSync(`${session.cdpCommand} ${args}`, {
    encoding: "utf-8",
    timeout: 30_000,
  }).trim();
}

function generateId(): string {
  return `cap-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

// ============================================================================
// Commands
// ============================================================================

function start(args: string[]): void {
  let cdpCommand = "cdp";
  let url: string | null = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--cdp" && args[i + 1]) {
      cdpCommand = args[++i];
    } else if (args[i] === "--url" && args[i + 1]) {
      url = args[++i];
    }
  }

  const id = generateId();
  const dir = sessionDir(id);
  fs.mkdirSync(path.join(dir, "shots"), { recursive: true });
  fs.mkdirSync(path.join(dir, "a11y"), { recursive: true });

  // Start HAR recording via project CDP
  let harId: string | null = null;
  try {
    const harResult = JSON.parse(cdp({ id, dir, harId: null, cdpCommand, startedAt: "", url }, "har create")) as {
      id: string;
    };
    harId = harResult.id;
  } catch (err) {
    console.error(`Warning: could not start HAR recording: ${err instanceof Error ? err.message : err}`);
  }

  const session: Session = {
    id,
    dir,
    harId,
    cdpCommand,
    startedAt: new Date().toISOString(),
    url,
  };
  fs.writeFileSync(sessionMetaPath(id), JSON.stringify(session, null, 2));

  // Output for agent consumption
  const result = {
    sessionId: id,
    bundleDir: dir,
    harId,
    shotsDir: path.join(dir, "shots"),
    a11yDir: path.join(dir, "a11y"),
  };
  console.log(JSON.stringify(result, null, 2));

  // Agent-friendly next steps on stderr
  console.error(`\nCapture session started: ${id}`);
  console.error(`\nUse your CDP CLI with these flags:`);
  if (harId) console.error(`  --har ${harId}`);
  console.error(`  --out ${dir}/shots/<label>.png  (for screenshots)`);
  console.error(`\nWhen done: capture stop ${id}`);
}

function stop(args: string[]): void {
  const id = args[0];
  if (!id) {
    console.error("Usage: capture stop <session-id>");
    process.exit(1);
  }

  const session = readSession(id);
  const stoppedAt = new Date().toISOString();
  const startMs = new Date(session.startedAt).getTime();
  const duration = Date.now() - startMs;

  // Collect screenshots
  const shotsDir = path.join(session.dir, "shots");
  const screenshots = fs.existsSync(shotsDir)
    ? fs.readdirSync(shotsDir)
        .filter((f) => f.endsWith(".png") || f.endsWith(".jpg"))
        .map((f) => ({ name: f, path: path.join(shotsDir, f) }))
    : [];

  // Collect a11y snapshots
  const a11yDir = path.join(session.dir, "a11y");
  const a11y = fs.existsSync(a11yDir)
    ? fs.readdirSync(a11yDir)
        .filter((f) => f.endsWith(".json") || f.endsWith(".txt"))
        .map((f) => ({ name: f, path: path.join(a11yDir, f) }))
    : [];

  // Collect HAR
  let har: BundleManifest["har"] = null;
  if (session.harId) {
    try {
      const harJson = cdp(session, `har read ${session.harId}`);
      const harPath = path.join(session.dir, "har.json");
      fs.writeFileSync(harPath, harJson);
      const harData = JSON.parse(harJson) as { log: { entries: unknown[] } };
      har = { id: session.harId, path: harPath, entryCount: harData.log.entries.length };
      // Clean up the HAR recording
      try { cdp(session, `har delete ${session.harId}`); } catch { /* best effort */ }
    } catch (err) {
      console.error(`Warning: could not read HAR: ${err instanceof Error ? err.message : err}`);
    }
  }

  // Collect anything else dropped in the session dir
  const knownDirs = new Set(["shots", "a11y"]);
  const knownFiles = new Set([".session.json", "har.json", "bundle.json"]);
  const other = fs.readdirSync(session.dir)
    .filter((f) => !knownDirs.has(f) && !knownFiles.has(f))
    .map((f) => ({ name: f, path: path.join(session.dir, f) }));

  const manifest: BundleManifest = {
    id: session.id,
    startedAt: session.startedAt,
    stoppedAt,
    duration,
    url: session.url,
    screenshots,
    har,
    a11y,
    other,
  };

  const bundlePath = path.join(session.dir, "bundle.json");
  fs.writeFileSync(bundlePath, JSON.stringify(manifest, null, 2));

  console.log(JSON.stringify({
    bundlePath,
    summary: {
      duration,
      screenshots: screenshots.length,
      harEntries: har?.entryCount ?? 0,
      a11ySnapshots: a11y.length,
      otherFiles: other.length,
    },
  }, null, 2));

  console.error(`\nBundle written: ${bundlePath}`);
  console.error(`Read it: capture view ${id}`);
}

function list(): void {
  if (!fs.existsSync(CAPTURE_ROOT)) {
    console.log("[]");
    return;
  }

  const sessions = fs.readdirSync(CAPTURE_ROOT)
    .filter((d) => fs.existsSync(sessionMetaPath(d)))
    .map((d) => {
      const session = readSession(d);
      const hasBundled = fs.existsSync(path.join(session.dir, "bundle.json"));
      return { id: session.id, startedAt: session.startedAt, url: session.url, status: hasBundled ? "stopped" : "active" };
    });

  console.log(JSON.stringify(sessions, null, 2));
}

function view(args: string[]): void {
  const id = args[0];
  if (!id) {
    console.error("Usage: capture view <session-id> [--filter screenshots|har|a11y]");
    process.exit(1);
  }

  const session = readSession(id);
  const bundlePath = path.join(session.dir, "bundle.json");

  if (!fs.existsSync(bundlePath)) {
    console.error(`Session ${id} hasn't been stopped yet. Run: capture stop ${id}`);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(bundlePath, "utf-8")) as BundleManifest;

  const filter = args.find((_, i) => args[i - 1] === "--filter");
  if (filter) {
    const section = manifest[filter as keyof BundleManifest];
    console.log(JSON.stringify(section, null, 2));
  } else {
    console.log(JSON.stringify(manifest, null, 2));
  }
}

// ============================================================================
// CLI
// ============================================================================

function main(): void {
  const [command, ...args] = process.argv.slice(2);

  switch (command) {
    case "start": return start(args);
    case "stop": return stop(args);
    case "list": return list();
    case "view": return view(args);
    default:
      console.log(`Capture — session manager for CDP-based app observation

Commands:
  start [--cdp <cmd>] [--url <url>]   Start a capture session
  stop <session-id>                     Finalize and bundle all artifacts
  list                                  List active and stopped sessions
  view <id> [--filter section]          View bundle manifest

Workflow:
  1. capture start --cdp "pnpm tsx lib-pipeline/cdp/index.ts" --url http://localhost:3000
  2. Use your CDP CLI directly — route outputs into the session:
       cdp screenshot --url localhost --out $CAPTURE_DIR/shots/homepage.png --har $HAR_ID
       cdp click "text=Login" --url localhost --har $HAR_ID
       cdp a11y --url localhost --json > $CAPTURE_DIR/a11y/after-login.json
  3. capture stop <session-id>
  4. capture view <session-id>

The bundle manifest at $CAPTURE_DIR/bundle.json indexes all artifacts
for agent consumption. Filter with --filter: screenshots, har, a11y, other.`);
  }
}

main();
