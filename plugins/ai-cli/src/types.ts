export interface ModeConfig {
  model: string;
  systemPromptMode: "append" | "replace";
  systemPromptContent: string;
  promptWrapper?: string;
}
