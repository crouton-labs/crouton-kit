import { readFileSync } from "node:fs";
import { join } from "node:path";

const CLAUDE_DIR = join(process.env.HOME!, ".claude");
const PLUGINS_DIR = join(CLAUDE_DIR, "plugins");

interface InstalledPlugin {
  scope: string;
  installPath: string;
  version: string;
}

interface InstalledPluginsFile {
  version: number;
  plugins: Record<string, InstalledPlugin[]>;
}

interface SettingsFile {
  enabledPlugins?: Record<string, boolean>;
}

export function discoverPlugins(): Array<{ type: "local"; path: string }> {
  let settings: SettingsFile;
  try {
    settings = JSON.parse(readFileSync(join(CLAUDE_DIR, "settings.json"), "utf-8"));
  } catch {
    return [];
  }

  let installed: InstalledPluginsFile;
  try {
    installed = JSON.parse(readFileSync(join(PLUGINS_DIR, "installed_plugins.json"), "utf-8"));
  } catch {
    return [];
  }

  const enabled = settings.enabledPlugins;
  if (!enabled) return [];

  const plugins: Array<{ type: "local"; path: string }> = [];

  for (const [name, isEnabled] of Object.entries(enabled)) {
    if (!isEnabled) continue;
    const entries = installed.plugins[name];
    if (!entries || entries.length === 0) continue;
    // Use the first (most recent) entry
    plugins.push({ type: "local", path: entries[0].installPath });
  }

  return plugins;
}
