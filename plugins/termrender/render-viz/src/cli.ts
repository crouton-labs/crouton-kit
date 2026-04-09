import { parseArgs } from "node:util";
import { spawn } from "node:child_process";
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

// Open in a new tmux side pane. termrender handles the pane creation.
const child = spawn("termrender", ["--tmux", result.tempFile], {
  stdio: "inherit",
  detached: false,
});

child.on("exit", (code) => {
  // Don't clean up immediately — termrender may still be reading the file
  // when rendering inside the new pane.
  setTimeout(() => result.cleanup(), 5000).unref();
  process.exit(code ?? 0);
});

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
