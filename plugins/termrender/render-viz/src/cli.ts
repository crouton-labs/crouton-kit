import { parseArgs } from "node:util";
import { spawn, spawnSync } from "node:child_process";
import { loadBuiltin, loadConfigFile, listBuiltins, type Config } from "./config.js";
import { gatherContext, type ContextSource } from "./context.js";
import { generateVisualization } from "./render.js";

const { values } = parseArgs({
  options: {
    context: { type: "string", default: "transcript" },
    transcript: { type: "string" },
    file: { type: "string" },
    builtin: { type: "string" },
    config: { type: "string" },
    model: { type: "string" },
    "max-turns": { type: "string", default: "10" },
    "dry-run": { type: "boolean", default: false },
    help: { type: "boolean", short: "h", default: false },
  },
  strict: true,
});

if (values.help) {
  printHelp();
  process.exit(0);
}

const source = values.context as ContextSource;
if (!["transcript", "last-message", "stdin", "file"].includes(source)) {
  console.error(`Error: invalid --context value: ${source}`);
  process.exit(1);
}

if (values.builtin && values.config) {
  console.error("Error: --builtin and --config are mutually exclusive");
  process.exit(1);
}

if (!values.builtin && !values.config) {
  console.error("Error: either --builtin or --config is required");
  process.exit(1);
}

const maxTurns = parseInt(values["max-turns"]!, 10);
if (!Number.isFinite(maxTurns) || maxTurns < 1) {
  console.error(`Error: invalid --max-turns: ${values["max-turns"]}`);
  process.exit(1);
}

const config: Config = values.builtin
  ? loadBuiltin(values.builtin)
  : loadConfigFile(values.config!);

if (values.model) {
  config.model = values.model;
}

const context = await gatherContext({
  source,
  transcriptPath: values.transcript,
  filePath: values.file,
  maxMessages: config.max_messages,
  maxChars: config.max_chars,
});

const userPrompt = config.prompt.replace("{{context}}", context);

const result = await generateVisualization({
  config,
  userPrompt,
  maxTurns,
});

if (values["dry-run"]) {
  process.stdout.write(result.markdown + "\n");
  result.cleanup();
  process.exit(0);
}

// Create tmux pane at 1/3 window width, then render into it.
const windowWidth = getTmuxWindowWidth();
if (!windowWidth) {
  // Not in tmux — fall back to rendering to stdout.
  const child = spawn("termrender", [result.tempFile], { stdio: "inherit" });
  child.on("exit", (code) => {
    result.cleanup();
    process.exit(code ?? 0);
  });
} else {
  const paneWidth = Math.floor((windowWidth - 2) / 3);
  const renderWidth = Math.max(40, paneWidth - 2);

  // Create pane, capture its ID.
  const split = spawnSync("tmux", [
    "split-window", "-h", "-l", String(paneWidth), "-d",
    "-P", "-F", "#{pane_id}",
    "cat",
  ], { encoding: "utf-8" });
  const paneId = split.stdout.trim();

  const child = spawn("termrender", [
    "--pane", paneId, "-w", String(renderWidth), result.tempFile,
  ], { stdio: "inherit" });

  child.on("exit", (code) => {
    setTimeout(() => result.cleanup(), 5000).unref();
    process.exit(code ?? 0);
  });
}

function getTmuxWindowWidth(): number | null {
  if (!process.env.TMUX) return null;
  const res = spawnSync("tmux", ["display-message", "-p", "#{window_width}"], {
    encoding: "utf-8",
  });
  const width = parseInt(res.stdout.trim(), 10);
  return Number.isFinite(width) ? width : null;
}

function printHelp(): void {
  console.log(`render-viz - Generate and display termrender visualizations

Usage:
  render-viz --builtin <name> --transcript <path>
  render-viz --config <path> --context stdin < input.md
  render-viz --config <path> --context file --file <path>

Options:
  --context <source>     transcript | last-message | stdin | file (default: transcript)
  --transcript <path>    Claude transcript JSONL (for transcript/last-message)
  --file <path>          File to read as context (for context=file)
  --builtin <name>       Use a builtin config: ${listBuiltins().join(", ")}
  --config <path>        Path to a YAML config file
  --model <id>           Override config model
  --max-turns <n>        Max agentic turns for Haiku's self-correction (default: 10)
  --dry-run              Print markdown to stdout instead of opening tmux pane
  -h, --help             Show this help`);
}
