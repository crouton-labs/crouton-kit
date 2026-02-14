import { parseArgs } from "node:util";
import { loadMode, listModes, getModeHelp } from "./config.js";
import { run } from "./runner.js";

const { values } = parseArgs({
  options: {
    mode: { type: "string", short: "m", default: "general" },
    prompt: { type: "string", short: "p" },
    help: { type: "boolean", short: "h", default: false },
    list: { type: "boolean", short: "l", default: false },
  },
  strict: true,
});

if (values.help && values.mode !== "general") {
  const help = getModeHelp(values.mode!, process.cwd());
  if (help) {
    console.log(`${values.mode}: ${help}`);
    process.exit(0);
  }
}

if (values.help) {
  const modes = listModes(process.cwd());
  console.log(`ai - Run Claude Code SDK sessions with configurable modes

Usage:
  ai -p <prompt>                    Run with default mode (general)
  ai -m <mode> -p <prompt>          Run with specified mode
  ai --list                         List available modes

Options:
  -m, --mode <name>    Mode to use (default: general)
  -p, --prompt <text>  Prompt to send
  -l, --list           List available modes
  -h, --help           Show this help

Available modes: ${modes.join(", ")}`);
  process.exit(0);
}

if (values.list) {
  const modes = listModes(process.cwd());
  for (const mode of modes) {
    console.log(mode);
  }
  process.exit(0);
}

if (!values.prompt) {
  console.error("Error: -p/--prompt is required");
  process.exit(1);
}

const config = loadMode(values.mode!, process.cwd());
await run(config, values.prompt, process.cwd());
