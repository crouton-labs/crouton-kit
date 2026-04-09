import { readFileSync } from "node:fs";

export type ContextSource = "transcript" | "last-message" | "stdin" | "file";

interface GatherOptions {
  source: ContextSource;
  transcriptPath?: string;
  filePath?: string;
  maxMessages: number;
  maxChars: number;
}

export async function gatherContext(opts: GatherOptions): Promise<string> {
  switch (opts.source) {
    case "transcript":
      return fromTranscript(requireTranscript(opts), opts.maxMessages, opts.maxChars);
    case "last-message":
      return lastAssistantMessage(requireTranscript(opts), opts.maxChars);
    case "stdin":
      return truncate(await readStdin(), opts.maxChars);
    case "file":
      if (!opts.filePath) {
        throw new Error("--file <path> is required when --context=file");
      }
      return truncate(readFileSync(opts.filePath, "utf-8"), opts.maxChars);
  }
}

function requireTranscript(opts: GatherOptions): string {
  if (!opts.transcriptPath) {
    throw new Error(`--transcript <path> is required when --context=${opts.source}`);
  }
  return opts.transcriptPath;
}

interface TranscriptEntry {
  type?: string;
  message?: {
    role?: string;
    content?: unknown;
  };
}

interface TextBlock {
  type: "text";
  text: string;
}

function isTextBlock(block: unknown): block is TextBlock {
  return (
    typeof block === "object" &&
    block !== null &&
    (block as { type?: unknown }).type === "text" &&
    typeof (block as { text?: unknown }).text === "string"
  );
}

function extractText(content: unknown): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .filter(isTextBlock)
    .map((block) => block.text)
    .join("\n")
    .trim();
}

function parseTranscript(path: string): TranscriptEntry[] {
  const raw = readFileSync(path, "utf-8");
  const entries: TranscriptEntry[] = [];
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parsed = JSON.parse(trimmed) as TranscriptEntry;
    entries.push(parsed);
  }
  return entries;
}

function fromTranscript(path: string, maxMessages: number, maxChars: number): string {
  const entries = parseTranscript(path);
  const messages: { role: string; text: string }[] = [];

  for (const entry of entries) {
    if (entry.type !== "user" && entry.type !== "assistant") continue;
    const text = extractText(entry.message?.content);
    if (!text) continue;
    messages.push({ role: entry.type.toUpperCase(), text });
  }

  const recent = messages.slice(-maxMessages);
  const formatted = recent.map((m) => `${m.role}:\n${m.text}`).join("\n\n---\n\n");
  return truncate(formatted, maxChars);
}

function lastAssistantMessage(path: string, maxChars: number): string {
  const entries = parseTranscript(path);
  for (let i = entries.length - 1; i >= 0; i--) {
    const entry = entries[i];
    if (entry.type !== "assistant") continue;
    const text = extractText(entry.message?.content);
    if (text) return truncate(text, maxChars);
  }
  throw new Error(`No assistant message found in transcript: ${path}`);
}

function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  // Keep the tail — most relevant for stop/debug triggers
  return "[...truncated...]\n\n" + text.slice(-maxChars);
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString("utf-8");
}
