#!/usr/bin/env tsx
/**
 * CDP (Chrome DevTools Protocol) — browser automation via exec-first design.
 *
 * The agent writes arbitrary JS and passes it to `exec`. No training-wheel
 * commands for click/type/wait — the agent composes whatever it needs.
 *
 * Commands:
 *   capture exec <code>         Execute JS in a tab (the primary interface)
 *   capture exec --file <path>  Execute JS from file
 *   capture detect              Detect CDP port
 *   capture list                List all browser tabs
 *   capture open <url>          Open URL in browser (returns tab ID)
 *   capture screenshot          Capture screenshot
 *   capture a11y                Get accessibility tree
 *   capture record              Passive HAR recording
 *   capture navigate <url>      Navigate + record HAR
 *   capture har create|read|delete  Manage HAR recordings
 *
 * Options:
 *   --port <port>       Override CDP port (auto-detects if not specified)
 *   --target <tabId>    Target tab by exact ID (preferred, parallel-safe)
 *   --url <pattern>     Target tab by URL pattern (fuzzy match)
 *   --new               Force open a new tab (open command)
 *   --record            Enable HAR recording (exec)
 *   --har <id>          Append traffic to a HAR recording
 *   --har-out <path>    HAR output path
 *   --file <path>       Read JS from file (exec)
 *   --duration <secs>   Recording duration (record, default: 10)
 *   --settle <ms>       Settle time after navigation (navigate, default: 2000)
 *   --out <path>        Output path (screenshot)
 *   --json              JSON output (a11y)
 *   --interactive       Interactive elements only (a11y)
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import WebSocket from 'ws';
import {
  type HAREntry,
  harFilePath,
  readHarRecording as readHarFile,
  appendToHarRecording as appendToHar,
  createHarRecording,
  deleteHarRecording,
} from './har-manager.js';

// ============================================================================
// Types
// ============================================================================

export interface CDPTarget {
  id: string;
  title: string;
  url: string;
  type: string;
  webSocketDebuggerUrl?: string;
}

interface ParsedArgs {
  command: string;
  positional: string[];
  port?: number;
  url?: string;
  out?: string;
  json?: boolean;
  interactive?: boolean;
  harOut?: string;
  record?: boolean;
  duration?: number;
  settle?: number;
  file?: string;
  nested?: boolean;
  har?: string;
  new?: boolean;
  target?: string;
}

interface NetworkRequest {
  requestId: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  postData?: string;
  timestamp: number;
}

interface NetworkResponse {
  requestId: string;
  url: string;
  status: number;
  headers: Record<string, string>;
  body?: string;
  timestamp: number;
}

// HAREntry imported from ./har-manager.ts

// ============================================================================
// HAR Recording
// ============================================================================

const SKIP_EXTENSIONS =
  /\.(png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|eot|css|mp4|webm|mp3)(\?|$)/i;
const SKIP_DOMAINS =
  /(google-analytics|googletagmanager|doubleclick|facebook\.com\/tr|px\.ads|analytics|tracking|beacon|telemetry)/i;

function shouldRecordRequest(url: string): boolean {
  if (SKIP_EXTENSIONS.test(url)) return false;
  if (SKIP_DOMAINS.test(url)) return false;
  return true;
}

export class HARRecorder {
  private requests = new Map<string, NetworkRequest>();
  private responses = new Map<string, NetworkResponse>();

  constructor(private client: CDPClient) {}

  async start(): Promise<void> {
    await this.client.send('Network.enable');

    this.client.on('Network.requestWillBeSent', (params: unknown) => {
      const p = params as {
        requestId: string;
        request: {
          url: string;
          method: string;
          headers: Record<string, string>;
          postData?: string;
        };
        timestamp: number;
      };
      if (!shouldRecordRequest(p.request.url)) return;
      this.requests.set(p.requestId, {
        requestId: p.requestId,
        url: p.request.url,
        method: p.request.method,
        headers: p.request.headers,
        postData: p.request.postData,
        timestamp: p.timestamp,
      });
    });

    this.client.on('Network.responseReceived', (params: unknown) => {
      const p = params as {
        requestId: string;
        response: {
          url: string;
          status: number;
          headers: Record<string, string>;
        };
        timestamp: number;
      };
      if (!this.requests.has(p.requestId)) return;
      this.responses.set(p.requestId, {
        requestId: p.requestId,
        url: p.response.url,
        status: p.response.status,
        headers: p.response.headers,
        timestamp: p.timestamp,
      });
    });
  }

  async finish(): Promise<{ log: { entries: HAREntry[] } }> {
    // Fetch response bodies
    for (const [reqId, resp] of this.responses) {
      try {
        const bodyResult = (await this.client.send('Network.getResponseBody', {
          requestId: reqId,
        })) as {
          body: string;
          base64Encoded: boolean;
        };
        resp.body = bodyResult.base64Encoded
          ? Buffer.from(bodyResult.body, 'base64').toString()
          : bodyResult.body;
      } catch {
        // Body may not be available
      }
    }

    return {
      log: {
        entries: Array.from(this.responses.values()).map((resp) => {
          const req = this.requests.get(resp.requestId);
          return {
            startedDateTime: new Date(resp.timestamp * 1000).toISOString(),
            request: {
              method: req?.method ?? 'GET',
              url: resp.url,
              headers: Object.entries(req?.headers ?? {}).map(
                ([name, value]) => ({ name, value }),
              ),
              postData: req?.postData ? { text: req.postData } : undefined,
            },
            response: {
              status: resp.status,
              headers: Object.entries(resp.headers).map(([name, value]) => ({
                name,
                value,
              })),
              content: { text: resp.body },
            },
          };
        }),
      },
    };
  }
}

// ============================================================================
// Console Capture
// ============================================================================

export interface ConsoleEntry {
  level: 'log' | 'warning' | 'error' | 'info' | 'debug';
  text: string;
  timestamp: number;
  source?: string;
}

export class ConsoleRecorder {
  private entries: ConsoleEntry[] = [];

  constructor(private client: CDPClient) {}

  async start(): Promise<void> {
    await this.client.send('Runtime.enable');

    this.client.on('Runtime.consoleAPICalled', (params: unknown) => {
      const p = params as {
        type: string;
        args: Array<{ type: string; value?: unknown; description?: string }>;
        timestamp: number;
      };
      const text = p.args
        .map((a) =>
          a.value !== undefined ? String(a.value) : (a.description ?? ''),
        )
        .join(' ');
      this.entries.push({
        level: p.type as ConsoleEntry['level'],
        text,
        timestamp: p.timestamp,
      });
    });

    this.client.on('Runtime.exceptionThrown', (params: unknown) => {
      const p = params as {
        timestamp: number;
        exceptionDetails: {
          exception?: { description?: string };
          text?: string;
          url?: string;
          lineNumber?: number;
        };
      };
      this.entries.push({
        level: 'error',
        text:
          p.exceptionDetails.exception?.description ??
          p.exceptionDetails.text ??
          'Unknown exception',
        timestamp: p.timestamp,
        source: p.exceptionDetails.url
          ? `${p.exceptionDetails.url}:${p.exceptionDetails.lineNumber}`
          : undefined,
      });
    });
  }

  finish(): ConsoleEntry[] {
    return [...this.entries];
  }
}

function printConsoleSummary(entries: ConsoleEntry[]): void {
  const errors = entries.filter((e) => e.level === 'error');
  const warnings = entries.filter((e) => e.level === 'warning');
  if (errors.length > 0 || warnings.length > 0) {
    console.error(
      `\nConsole: ${errors.length} errors, ${warnings.length} warnings`,
    );
    for (const entry of [...errors, ...warnings]) {
      const prefix = entry.level === 'error' ? 'ERR' : 'WARN';
      const src = entry.source ? ` (${entry.source})` : '';
      const text =
        entry.text.length > 200 ? entry.text.slice(0, 197) + '...' : entry.text;
      console.error(`  [${prefix}] ${text}${src}`);
    }
  }
}

function writeHarAndPrintSummary(
  har: { log: { entries: HAREntry[] } },
  harOutPath?: string,
): string | undefined {
  if (har.log.entries.length === 0 && !harOutPath) return undefined;

  const harPath = harOutPath ?? `/tmp/capture-har-${Date.now()}.json`;
  fs.writeFileSync(harPath, JSON.stringify(har, null, 2));

  // Print summary to stderr
  const errors = har.log.entries.filter((e) => e.response.status >= 400);
  console.error(
    `\nHAR: ${har.log.entries.length} requests captured → ${harPath}`,
  );
  if (errors.length > 0) {
    console.error(`  ${errors.length} failed:`);
    for (const entry of errors) {
      const method = entry.request.method.padEnd(6);
      const status = entry.response.status;
      const url =
        entry.request.url.length > 100
          ? entry.request.url.slice(0, 97) + '...'
          : entry.request.url;
      console.error(`  ${method} ${status} ${url}`);
    }
  }

  return harPath;
}

// ============================================================================
// CLI Argument Parser
// ============================================================================

function parseCliArgs(argv: string[]): ParsedArgs {
  const command = argv[0] ?? '';
  const positional: string[] = [];
  const parsed: Partial<ParsedArgs> = { command, positional };

  for (let i = 1; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];

    if (arg === '--port' && next) {
      parsed.port = parseInt(next, 10);
      i++;
    } else if (arg === '--url' && next) {
      parsed.url = next;
      i++;
    } else if (arg === '--out' && next) {
      parsed.out = next;
      i++;
    } else if (arg === '--json') {
      parsed.json = true;
    } else if (arg === '--interactive') {
      parsed.interactive = true;
    } else if (arg === '--har-out' && next) {
      parsed.harOut = next;
      i++;
    } else if (arg === '--record') {
      parsed.record = true;
    } else if (arg === '--duration' && next) {
      parsed.duration = parseInt(next, 10);
      i++;
    } else if (arg === '--settle' && next) {
      parsed.settle = parseInt(next, 10);
      i++;
    } else if (arg === '--file' && next) {
      parsed.file = next;
      i++;
    } else if (arg === '--nested') {
      parsed.nested = true;
    } else if (arg === '--har' && next) {
      parsed.har = next;
      i++;
    } else if (arg === '--new') {
      parsed.new = true;
    } else if (arg === '--target' && next) {
      parsed.target = next;
      i++;
    } else if (arg.startsWith('--')) {
      console.error(`Unknown flag: ${arg}`);
      process.exit(1);
    } else {
      positional.push(arg);
    }
  }

  return parsed as ParsedArgs;
}

// ============================================================================
// HAR Recording Management (delegated to har-manager.ts)
// ============================================================================

// ============================================================================
// Connection Helpers
// ============================================================================

async function connectForCommand(
  parsed: ParsedArgs,
): Promise<{ client: CDPClient; tab: CDPTarget }> {
  if (!parsed.target && !parsed.url) {
    throw new Error('Use --target <tabId> or --url <pattern> to target a tab.');
  }

  const port = parsed.port ?? (await detectCdpPort());

  // Prefer --target (exact tab ID) over --url (pattern match)
  let tab: CDPTarget | null;
  if (parsed.target) {
    tab = await findTabById(port, parsed.target);
    if (!tab) {
      throw new Error(
        `No tab found with target ID "${parsed.target}". Tab may have been closed.`,
      );
    }
  } else {
    tab = await findTab(port, parsed.url);
    if (!tab) {
      throw new Error(
        `No tab found matching "${parsed.url}". Open the page first.`,
      );
    }
  }

  if (!tab.webSocketDebuggerUrl) {
    throw new Error('Tab has no WebSocket debugger URL');
  }

  const client = new CDPClient(tab.webSocketDebuggerUrl);
  await client.waitReady();

  return { client, tab };
}

async function withConnection<T>(
  parsed: ParsedArgs,
  fn: (client: CDPClient, tab: CDPTarget) => Promise<T>,
  opts: { settle?: number } = {},
): Promise<T> {
  const { client, tab } = await connectForCommand(parsed);

  const consoleRecorder = new ConsoleRecorder(client);
  await consoleRecorder.start();

  let harRecorder: HARRecorder | undefined;
  if (parsed.har) {
    // Validate HAR ID exists before starting recording
    const harPath = harFilePath(parsed.har);
    if (!fs.existsSync(harPath)) {
      console.error(
        `ERROR: No HAR recording found for --har "${parsed.har}". Run 'har create' first.`,
      );
      process.exit(1);
    }
    harRecorder = new HARRecorder(client);
    await harRecorder.start();
  }

  try {
    const result = await fn(client, tab);

    // Wait for network activity triggered by the action, then append to HAR
    if (harRecorder && parsed.har) {
      const settle = opts.settle !== undefined ? opts.settle : 3000;
      if (settle > 0) {
        await new Promise((r) => setTimeout(r, settle));
      }
      const har = await harRecorder.finish();
      if (har.log.entries.length > 0) {
        appendToHar(parsed.har, har.log.entries);
        console.error(
          `  [har:${parsed.har}] +${har.log.entries.length} entries`,
        );
      }
    }

    printConsoleSummary(consoleRecorder.finish());

    return result;
  } finally {
    client.close();
  }
}

// ============================================================================
// A11y Tree Flattening
// ============================================================================

const INTERACTIVE_ROLES = new Set([
  'button',
  'link',
  'textbox',
  'searchbox',
  'combobox',
  'checkbox',
  'radio',
  'menuitem',
  'tab',
  'switch',
  'slider',
  'spinbutton',
  'option',
  'menuitemcheckbox',
  'menuitemradio',
]);

function flattenA11yTree(
  nodes: A11yNode[],
  opts: { interactive?: boolean } = {},
  depth = 0,
): string[] {
  const lines: string[] = [];

  for (const node of nodes) {
    // Filter to interactive roles if requested
    if (opts.interactive && !INTERACTIVE_ROLES.has(node.role)) {
      lines.push(...flattenA11yTree(node.children, opts, depth));
      continue;
    }

    // Skip nodes without meaningful role or name
    if (!node.role || node.role === 'StaticText') {
      lines.push(...flattenA11yTree(node.children, opts, depth));
      continue;
    }

    const indent = '  '.repeat(depth);
    const nameStr = node.name ? ` "${node.name}"` : '';
    lines.push(`${indent}${node.role}${nameStr}`);

    // Recurse
    lines.push(...flattenA11yTree(node.children, opts, depth + 1));
  }

  return lines;
}

// ============================================================================
// Browser Detection
// ============================================================================

const BROWSER_PATTERNS: Record<string, string[]> = {
  'company.thebrowser.browser': ['arc'],
  'com.google.chrome': ['chrome', 'google chrome'],
  'com.brave.browser': ['brave'],
  'com.microsoft.edgemac': ['edge', 'microsoft edge'],
  'org.chromium.chromium': ['chromium'],
};

function getDefaultBrowserId(): string | null {
  try {
    const output = execSync(
      'defaults read com.apple.LaunchServices/com.apple.launchservices.secure LSHandlers 2>/dev/null',
      { encoding: 'utf-8' },
    );
    const match = output.match(
      /LSHandlerRoleAll = "([^"]+)";\s*LSHandlerURLScheme = https;/,
    );
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

interface CdpProbeResult {
  browser: string;
  app: string;
  isElectron: boolean;
}

async function probeCdpPort(port: number): Promise<CdpProbeResult | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 500);
    const resp = await fetch(`http://localhost:${port}/json/version`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (resp.ok) {
      const version = (await resp.json()) as {
        Browser?: string;
        'User-Agent'?: string;
      };
      const browser = version.Browser;
      const userAgent = version['User-Agent'] ?? '';
      if (!browser) return null;

      const isElectron = userAgent.includes('Electron');

      // Extract app name from User-Agent for Electron apps
      // Pattern: "AppName/1.2.3 Chrome/..." in the UA string
      let app = browser;
      if (isElectron) {
        const appMatch = userAgent.match(
          /(\S+?)\/[\d.]+ Chrome\/[\d.]+ Electron/,
        );
        if (appMatch) app = appMatch[1];
      }

      return { browser, app, isElectron };
    }
  } catch {
    // Not a CDP port or not responding
  }
  return null;
}

function getLocalhostListeningPorts(): number[] {
  try {
    // netstat is much faster than lsof on macOS
    const output = execSync(
      'netstat -an 2>/dev/null | grep "127.0.0.1.*LISTEN"',
      { encoding: 'utf-8' },
    );
    const ports: number[] = [];
    for (const line of output.split('\n')) {
      // Format: tcp4       0      0  127.0.0.1.56192        *.*                    LISTEN
      const match = line.match(/127\.0\.0\.1\.(\d+)/);
      if (match) {
        ports.push(parseInt(match[1], 10));
      }
    }
    return ports;
  } catch {
    return [];
  }
}

interface CdpEndpoint {
  port: number;
  app: string;
  bundleId: string;
  isElectron: boolean;
}

async function detectCdpPortsAsync(): Promise<CdpEndpoint[]> {
  const ports = getLocalhostListeningPorts();
  const results: CdpEndpoint[] = [];

  // Probe ports in parallel for speed
  const probes = ports.map(async (port) => {
    const probe = await probeCdpPort(port);
    if (probe) {
      // Map browser string to bundle ID for default browser matching
      const lower = probe.browser.toLowerCase();
      let bundleId = 'unknown';
      for (const [bid, patterns] of Object.entries(BROWSER_PATTERNS)) {
        if (patterns.some((p) => lower.includes(p))) {
          bundleId = bid;
          break;
        }
      }
      results.push({
        port,
        app: probe.app,
        bundleId,
        isElectron: probe.isElectron,
      });
    }
  });

  await Promise.all(probes);
  return results;
}

export async function detectCdpPort(): Promise<number> {
  const endpoints = await detectCdpPortsAsync();
  if (endpoints.length === 0) {
    throw new Error(
      'No browser with CDP found. Start your browser with remote debugging enabled:\n' +
        '  Arc: Already enabled by default\n' +
        '  Chrome: --remote-debugging-port=9222\n' +
        '  Electron apps expose CDP automatically',
    );
  }

  // Use default browser if available (prefer non-Electron)
  const defaultBrowser = getDefaultBrowserId();
  if (defaultBrowser) {
    const match = endpoints.find(
      (p) => p.bundleId === defaultBrowser && !p.isElectron,
    );
    if (match) return match.port;
  }

  // Fall back to first non-Electron, then first found
  const nonElectron = endpoints.find((p) => !p.isElectron);
  return (nonElectron ?? endpoints[0]).port;
}

// ============================================================================
// CDP Connection (Browser-level)
// ============================================================================

async function getBrowserClient(
  port: number,
): Promise<{ client: CDPClient; browserWsUrl: string }> {
  const versionResp = await fetch(`http://localhost:${port}/json/version`);
  if (!versionResp.ok) {
    throw new Error(
      `Failed to connect to CDP on port ${port}: ${versionResp.status}`,
    );
  }
  const version = (await versionResp.json()) as {
    webSocketDebuggerUrl: string;
  };
  const client = new CDPClient(version.webSocketDebuggerUrl);
  await client.waitReady();
  return { client, browserWsUrl: version.webSocketDebuggerUrl };
}

export async function listTargets(port: number): Promise<CDPTarget[]> {
  const { client } = await getBrowserClient(port);

  try {
    // Enable target discovery to get all targets including pages
    await client.send('Target.setDiscoverTargets', { discover: true });
    const result = (await client.send('Target.getTargets')) as {
      targetInfos: Array<{
        targetId: string;
        type: string;
        title: string;
        url: string;
      }>;
    };

    // Convert to CDPTarget format with webSocketDebuggerUrl
    return result.targetInfos.map((t) => ({
      id: t.targetId,
      title: t.title,
      url: t.url,
      type: t.type,
      webSocketDebuggerUrl: `ws://localhost:${port}/devtools/page/${t.targetId}`,
    }));
  } finally {
    client.close();
  }
}

export async function findTab(
  port: number,
  urlPattern?: string,
): Promise<CDPTarget | null> {
  const targets = await listTargets(port);
  const pages = targets.filter((t) => t.type === 'page');

  if (!urlPattern) {
    // Return first page
    return pages[0] ?? null;
  }

  // Find by URL pattern
  const pattern = urlPattern.toLowerCase();
  return pages.find((t) => t.url.toLowerCase().includes(pattern)) ?? null;
}

export async function findTabById(
  port: number,
  targetId: string,
): Promise<CDPTarget | null> {
  const targets = await listTargets(port);
  return targets.find((t) => t.id === targetId) ?? null;
}

export async function openTab(port: number, url: string): Promise<CDPTarget> {
  const { client } = await getBrowserClient(port);

  try {
    // Create new target in background to avoid stealing user's focus
    const result = (await client.send('Target.createTarget', {
      url,
      background: true,
    })) as {
      targetId: string;
    };

    // Return target info
    return {
      id: result.targetId,
      title: '',
      url,
      type: 'page',
      webSocketDebuggerUrl: `ws://localhost:${port}/devtools/page/${result.targetId}`,
    };
  } finally {
    client.close();
  }
}

// ============================================================================
// CDP WebSocket Client
// ============================================================================

export class CDPClient {
  private ws: WebSocket;
  private messageId = 0;
  private pendingRequests = new Map<
    number,
    { resolve: (v: unknown) => void; reject: (e: Error) => void }
  >();
  private pendingTimeouts = new Map<number, NodeJS.Timeout>();
  private eventHandlers = new Map<string, Array<(params: unknown) => void>>();
  private ready: Promise<void>;

  constructor(wsUrl: string, connectTimeout = 5000) {
    this.ws = new WebSocket(wsUrl);
    this.ready = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`WebSocket connection timeout (${connectTimeout}ms)`));
      }, connectTimeout);

      this.ws.on('open', () => {
        clearTimeout(timeout);
        resolve();
      });
      this.ws.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });

    this.ws.on('message', (data: Buffer) => {
      const msg = JSON.parse(data.toString());
      if (msg.id !== undefined) {
        const pending = this.pendingRequests.get(msg.id);
        if (pending) {
          this.pendingRequests.delete(msg.id);
          const timer = this.pendingTimeouts.get(msg.id);
          if (timer) {
            clearTimeout(timer);
            this.pendingTimeouts.delete(msg.id);
          }
          if (msg.error) {
            pending.reject(new Error(msg.error.message));
          } else {
            pending.resolve(msg.result);
          }
        }
      } else if (msg.method) {
        const handlers = this.eventHandlers.get(msg.method);
        handlers?.forEach((h) => h(msg.params));
      }
    });
  }

  async waitReady(): Promise<void> {
    await this.ready;
  }

  async send(
    method: string,
    params: Record<string, unknown> = {},
    timeout = 60000,
  ): Promise<unknown> {
    await this.ready;
    const id = ++this.messageId;

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));

      const timer = setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          this.pendingTimeouts.delete(id);
          reject(new Error(`CDP request timeout (${timeout}ms): ${method}`));
        }
      }, timeout);
      this.pendingTimeouts.set(id, timer);
    });
  }

  on(event: string, handler: (params: unknown) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  close(): void {
    // Clear all pending timeouts to allow process to exit
    for (const timer of this.pendingTimeouts.values()) {
      clearTimeout(timer);
    }
    this.pendingTimeouts.clear();
    this.ws.close();
  }
}

// ============================================================================
// Capture Utilities
// ============================================================================

export async function captureScreenshot(client: CDPClient): Promise<Buffer> {
  const result = (await client.send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false,
  })) as { data: string };
  return Buffer.from(result.data, 'base64');
}

interface AXNode {
  nodeId: string;
  role?: { value: string };
  name?: { value: string };
  childIds?: string[];
  properties?: Array<{ name: string; value: { value: unknown } }>;
}

export interface A11yNode {
  role: string;
  name: string;
  children: A11yNode[];
}

export async function getAccessibilityTree(
  client: CDPClient,
): Promise<A11yNode[]> {
  await client.send('Accessibility.enable');
  const result = (await client.send('Accessibility.getFullAXTree')) as {
    nodes: AXNode[];
  };
  await client.send('Accessibility.disable');

  const nodeMap = new Map<string, AXNode>();
  for (const node of result.nodes) {
    nodeMap.set(node.nodeId, node);
  }

  const SKIP_ROLES = new Set(['none', 'generic', 'InlineTextBox']);

  function buildNode(node: AXNode): A11yNode[] {
    const role = node.role?.value ?? '';
    const childNodes = (node.childIds ?? []).flatMap((id) => {
      const child = nodeMap.get(id);
      return child ? buildNode(child) : [];
    });

    if (SKIP_ROLES.has(role)) {
      return childNodes;
    }

    return [
      {
        role,
        name: node.name?.value ?? '',
        children: childNodes,
      },
    ];
  }

  const root = result.nodes[0];
  return root ? buildNode(root) : [];
}

// ============================================================================
// Code Execution
// ============================================================================

export interface ExecuteOptions {
  port?: number;
  urlPattern?: string;
  targetId?: string;
  record?: boolean;
  harOutPath?: string;
  timeoutMs?: number;
}

export interface ExecuteResult {
  success: boolean;
  value?: unknown;
  error?: string;
  har?: { log: { entries: HAREntry[] } };
  console: ConsoleEntry[];
}

export async function executeInBrowser(
  code: string,
  options: ExecuteOptions = {},
): Promise<ExecuteResult> {
  const port = options.port ?? (await detectCdpPort());

  // Find or open tab — prefer targetId (exact) over urlPattern (fuzzy)
  let tab: CDPTarget | null = null;
  if (options.targetId) {
    tab = await findTabById(port, options.targetId);
    if (!tab) {
      throw new Error(
        `No tab found with target ID "${options.targetId}". Tab may have been closed.`,
      );
    }
  } else {
    tab = await findTab(port, options.urlPattern);
    if (!tab) {
      if (options.urlPattern?.startsWith('http')) {
        tab = await openTab(port, options.urlPattern);
        // Wait for page to load
        await new Promise((r) => setTimeout(r, 2000));
      } else {
        throw new Error(
          `No tab found matching "${options.urlPattern}". Open the page first or provide a full URL.`,
        );
      }
    }
  }

  if (!tab.webSocketDebuggerUrl) {
    throw new Error('Tab has no WebSocket debugger URL');
  }

  const client = new CDPClient(tab.webSocketDebuggerUrl);
  await client.waitReady();

  // Emulate focus so network requests aren't deferred by the browser,
  // without actually bringing the tab to the foreground
  await client.send('Emulation.setFocusEmulationEnabled', { enabled: true });

  const consoleRecorder = new ConsoleRecorder(client);
  await consoleRecorder.start();

  let harRecorder: HARRecorder | undefined;
  if (options.record) {
    harRecorder = new HARRecorder(client);
    await harRecorder.start();
  }

  try {
    // Execute code
    const result = (await client.send(
      'Runtime.evaluate',
      {
        expression: code,
        awaitPromise: true,
        returnByValue: true,
      },
      options.timeoutMs,
    )) as {
      result?: { value?: unknown };
      exceptionDetails?: { exception?: { description?: string } };
    };

    // Build HAR if recording
    let har: { log: { entries: HAREntry[] } } | undefined;
    if (harRecorder) {
      har = await harRecorder.finish();
      writeHarAndPrintSummary(har, options.harOutPath);
    }

    const consoleEntries = consoleRecorder.finish();
    printConsoleSummary(consoleEntries);
    client.close();

    if (result.exceptionDetails) {
      return {
        success: false,
        error:
          result.exceptionDetails.exception?.description ?? 'Unknown error',
        har,
        console: consoleEntries,
      };
    }

    return {
      success: true,
      value: result.result?.value,
      har,
      console: consoleEntries,
    };
  } catch (err) {
    const consoleEntries = consoleRecorder.finish();
    client.close();
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
      console: consoleEntries,
    };
  }
}

// ============================================================================
// Passive HAR Recording
// ============================================================================

export interface RecordOptions {
  port?: number;
  urlPattern?: string;
  targetId?: string;
  duration?: number;
  harOutPath?: string;
}

export interface RecordResult {
  harPath: string | undefined;
  entryCount: number;
  har: { log: { entries: HAREntry[] } };
}

export async function recordTraffic(
  options: RecordOptions,
): Promise<RecordResult> {
  const port = options.port ?? (await detectCdpPort());
  const duration = options.duration ?? 10;

  let tab: CDPTarget | null = null;
  if (options.targetId) {
    tab = await findTabById(port, options.targetId);
    if (!tab) {
      throw new Error(
        `No tab found with target ID "${options.targetId}". Tab may have been closed.`,
      );
    }
  } else {
    tab = await findTab(port, options.urlPattern);
    if (!tab) {
      throw new Error(
        `No tab found matching "${options.urlPattern}". Open the page first.`,
      );
    }
  }
  if (!tab.webSocketDebuggerUrl) {
    throw new Error('Tab has no WebSocket debugger URL');
  }

  const client = new CDPClient(tab.webSocketDebuggerUrl);
  await client.waitReady();

  const recorder = new HARRecorder(client);
  await recorder.start();

  console.error(
    `Recording traffic on "${tab.url}" for ${duration}s... (click around in the browser)`,
  );

  await new Promise((r) => setTimeout(r, duration * 1000));

  const har = await recorder.finish();
  const harPath = writeHarAndPrintSummary(har, options.harOutPath);

  client.close();

  return { harPath, entryCount: har.log.entries.length, har };
}

// ============================================================================
// Navigate + Record
// ============================================================================

export interface NavigateAndRecordOptions {
  port?: number;
  url: string;
  targetId?: string;
  harOutPath?: string;
  settle?: number;
}

export interface NavigateAndRecordResult {
  harPath: string | undefined;
  entryCount: number;
  har: { log: { entries: HAREntry[] } };
  tab: CDPTarget;
}

export async function navigateAndRecord(
  options: NavigateAndRecordOptions,
): Promise<NavigateAndRecordResult> {
  const port = options.port ?? (await detectCdpPort());
  const settle = options.settle ?? 2000;

  // Find tab — prefer targetId (exact) over domain match (fuzzy)
  let tab: CDPTarget | null = null;
  let isNewTab = false;
  if (options.targetId) {
    tab = await findTabById(port, options.targetId);
    if (!tab) {
      throw new Error(
        `No tab found with target ID "${options.targetId}". Tab may have been closed.`,
      );
    }
  } else {
    let domain: string;
    try {
      domain = new URL(options.url).hostname;
    } catch {
      throw new Error(`Invalid URL: ${options.url}`);
    }
    tab = await findTab(port, domain);
    if (!tab) {
      tab = await openTab(port, options.url);
      isNewTab = true;
    }
  }
  if (!tab.webSocketDebuggerUrl) {
    throw new Error('Tab has no WebSocket debugger URL');
  }

  const client = new CDPClient(tab.webSocketDebuggerUrl);
  await client.waitReady();
  await client.send('Page.enable');

  // Start recording BEFORE navigation
  const recorder = new HARRecorder(client);
  await recorder.start();

  if (!isNewTab) {
    // Navigate existing tab
    console.error(`Navigating to: ${options.url}`);
    await client.send('Page.navigate', { url: options.url });
  }

  // Wait for load event
  await new Promise<void>((resolve) => {
    const timer = setTimeout(() => {
      // Don't reject on timeout — partial HAR is still useful
      console.error('Page load timeout (10s), continuing with settle...');
      resolve();
    }, 10000);
    client.on('Page.loadEventFired', () => {
      clearTimeout(timer);
      resolve();
    });
  });

  // Settle time for SPAs that load after DOMContentLoaded
  console.error(`Settling for ${settle}ms...`);
  await new Promise((r) => setTimeout(r, settle));

  const har = await recorder.finish();
  const harPath = writeHarAndPrintSummary(har, options.harOutPath);

  client.close();

  // Refresh target info
  const updatedTab = (await findTab(port, options.url)) ?? tab;

  return { harPath, entryCount: har.log.entries.length, har, tab: updatedTab };
}

// ============================================================================
// Navigate and Wait
// ============================================================================

export async function navigateAndWait(
  port: number,
  url: string,
  options: { timeout?: number; forceNew?: boolean } = {},
): Promise<CDPTarget> {
  const timeout = options.timeout ?? 10000;

  // Check if tab already exists (unless forceNew requested)
  if (!options.forceNew) {
    const existing = await findTab(port, url);
    if (existing) {
      return existing;
    }
  }

  // Open new tab
  const tab = await openTab(port, url);
  if (!tab.webSocketDebuggerUrl) {
    throw new Error('New tab has no WebSocket debugger URL');
  }

  // Wait for page load
  const client = new CDPClient(tab.webSocketDebuggerUrl);
  await client.waitReady();
  await client.send('Page.enable');

  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Page load timeout: ${url}`)),
      timeout,
    );
    client.on('Page.loadEventFired', () => {
      clearTimeout(timer);
      resolve();
    });
  });

  client.close();

  // Refresh target info — find by ID to avoid returning a different tab with same URL
  const targets = await listTargets(port);
  const refreshed = targets.find((t) => t.id === tab.id);
  return refreshed ?? tab;
}

// ============================================================================
// Tab-Level File Lock
// ============================================================================

const LOCK_DIR = os.tmpdir();
const LOCK_STALE_MS = 120_000;
const LOCK_TIMEOUT_MS = 60_000;
const LOCK_POLL_BASE_MS = 200;

function lockPath(tabId: string): string {
  return path.join(LOCK_DIR, `capture-cdp-tab-${tabId}.lock`);
}

function isPidAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function isLockStale(filePath: string): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { pid, ts } = JSON.parse(content) as { pid: number; ts: number };
    if (!isPidAlive(pid)) return true;
    return Date.now() - ts > LOCK_STALE_MS;
  } catch {
    return true;
  }
}

// Track locks held by this process for cleanup on exit
const heldLocks = new Set<string>();
let cleanupRegistered = false;

function registerCleanup(): void {
  if (cleanupRegistered) return;
  cleanupRegistered = true;

  const cleanup = () => {
    for (const file of heldLocks) {
      try {
        fs.unlinkSync(file);
      } catch {
        // Best-effort
      }
    }
    heldLocks.clear();
  };

  process.on('exit', cleanup);
  process.on('SIGINT', () => {
    cleanup();
    process.exit(130);
  });
  process.on('SIGTERM', () => {
    cleanup();
    process.exit(143);
  });
}

export async function acquireTabLock(tabId: string): Promise<void> {
  registerCleanup();
  const file = lockPath(tabId);
  const deadline = Date.now() + LOCK_TIMEOUT_MS;
  let delay = LOCK_POLL_BASE_MS;

  while (true) {
    try {
      const fd = fs.openSync(file, 'wx');
      fs.writeSync(fd, JSON.stringify({ pid: process.pid, ts: Date.now() }));
      fs.closeSync(fd);
      heldLocks.add(file);
      return;
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code !== 'EEXIST') throw err;
    }

    if (isLockStale(file)) {
      try {
        fs.unlinkSync(file);
      } catch {
        // Another process may have already removed it
      }
      continue;
    }

    if (Date.now() >= deadline) {
      throw new Error(
        `Timed out waiting for CDP tab lock (${tabId}). ` +
          `Another process may be using this tab. Lock file: ${file}`,
      );
    }

    await new Promise((r) => setTimeout(r, delay));
    delay = Math.min(delay * 2, 2000);
  }
}

export function isTabLocked(tabId: string): boolean {
  const file = lockPath(tabId);
  try {
    fs.accessSync(file);
    return !isLockStale(file);
  } catch {
    return false;
  }
}

export function releaseTabLock(tabId: string): void {
  const file = lockPath(tabId);
  heldLocks.delete(file);
  try {
    fs.unlinkSync(file);
  } catch {
    // Already removed — fine
  }
}

export async function withTabLock<T>(
  tabId: string,
  fn: () => Promise<T>,
): Promise<T> {
  await acquireTabLock(tabId);
  try {
    return await fn();
  } finally {
    releaseTabLock(tabId);
  }
}

// ============================================================================
// CLI
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const parsed = parseCliArgs(args);

  switch (parsed.command) {
    case 'detect': {
      const endpoints = await detectCdpPortsAsync();
      if (endpoints.length === 0) {
        console.error(
          'ERROR: No browser with CDP found.\n\n' +
            'Fix: Start a browser with remote debugging enabled:\n' +
            '  Arc: Already enabled by default\n' +
            '  Chrome: --remote-debugging-port=9222\n' +
            '  Electron apps expose CDP automatically',
        );
        process.exit(1);
      }
      const defaultBrowser = getDefaultBrowserId();
      const preferred =
        endpoints.find(
          (p) => p.bundleId === defaultBrowser && !p.isElectron,
        ) ??
        endpoints.find((p) => !p.isElectron) ??
        endpoints[0];
      console.log(
        JSON.stringify(
          {
            port: preferred.port,
            app: preferred.app,
            isElectron: preferred.isElectron,
            all: endpoints.map((e) => ({
              port: e.port,
              app: e.app,
              isElectron: e.isElectron,
            })),
          },
          null,
          2,
        ),
      );
      console.error(
        `\nFound ${endpoints.length} CDP endpoint${endpoints.length > 1 ? 's' : ''}. Default: port ${preferred.port} (${preferred.app}).` +
          `\n\nNext: capture list --port ${preferred.port}`,
      );
      break;
    }

    case 'list': {
      const p = parsed.port ?? (await detectCdpPort());
      const targets = await listTargets(p);
      const pages = targets.filter((t) => t.type === 'page');
      console.log(JSON.stringify(pages.map((t) => ({
        id: t.id,
        title: t.title,
        url: t.url,
      })), null, 2));
      console.error(
        `\n${pages.length} tab${pages.length !== 1 ? 's' : ''} on port ${p}.` +
          `\n\nTarget a tab with: --target <id>  (parallel-safe)` +
          `\n                or: --url <pattern> (fuzzy match)`,
      );
      break;
    }

    case 'open': {
      const url = parsed.positional[0];
      if (!url) {
        console.error(
          'ERROR: Missing URL.\n\n' +
            'Usage: capture open <url> [--new] [--port <port>]\n\n' +
            'Example: capture open "https://app.example.com" --new',
        );
        process.exit(1);
      }
      const p = parsed.port ?? (await detectCdpPort());
      const tab = await navigateAndWait(p, url, { forceNew: parsed.new });
      console.log(JSON.stringify({
        id: tab.id,
        title: tab.title,
        url: tab.url,
        port: p,
      }, null, 2));
      console.error(
        `\nOpened: ${tab.title || url}` +
          `\n\nNext: capture exec "<js>" --port ${p} --target ${tab.id}` +
          `\n      capture screenshot --port ${p} --target ${tab.id}` +
          `\n      capture a11y --port ${p} --target ${tab.id}`,
      );
      break;
    }

    case 'exec': {
      let code: string;
      if (parsed.file) {
        code = fs.readFileSync(parsed.file, 'utf-8');
      } else {
        code = parsed.positional[0];
        if (!code) {
          console.error(
            'ERROR: Missing code to execute.\n\n' +
              'Usage: capture exec <code> [--url <pattern>] [--target <id>] [--record] [--file <path>]\n\n' +
              'Examples:\n' +
              '  capture exec "document.title" --url example\n' +
              '  capture exec "document.querySelector(\'.btn\').click()" --target <id>\n' +
              '  capture exec --file /tmp/scrape.js --url example --record',
          );
          process.exit(1);
        }
      }

      const result = await executeInBrowser(code, {
        port: parsed.port,
        urlPattern: parsed.url,
        targetId: parsed.target,
        record: parsed.record,
        harOutPath: parsed.harOut,
      });

      if (result.success) {
        console.log(JSON.stringify(result.value, null, 2));
      } else {
        console.error(`ERROR: ${result.error}`);
        if (result.console.length > 0) {
          console.error('\nConsole output captured before failure:');
        }
        process.exit(1);
      }
      break;
    }

    case 'record': {
      if (!parsed.url && !parsed.target) {
        console.error(
          'Usage: cdp.ts record --url <pattern> [--duration <secs>] [--har-out <path>]',
        );
        process.exit(1);
      }

      const result = await recordTraffic({
        port: parsed.port,
        urlPattern: parsed.url,
        targetId: parsed.target,
        duration: parsed.duration,
        harOutPath: parsed.harOut,
      });
      console.log(
        JSON.stringify(
          { entryCount: result.entryCount, harPath: result.harPath },
          null,
          2,
        ),
      );
      break;
    }

    case 'navigate': {
      const url = parsed.positional[0];
      if (!url) {
        console.error(
          'Usage: cdp.ts navigate <url> [--har-out <path>] [--settle <ms>]',
        );
        process.exit(1);
      }

      const result = await navigateAndRecord({
        port: parsed.port,
        url,
        targetId: parsed.target,
        harOutPath: parsed.harOut,
        settle: parsed.settle,
      });
      console.log(
        JSON.stringify(
          {
            entryCount: result.entryCount,
            harPath: result.harPath,
            tabUrl: result.tab.url,
          },
          null,
          2,
        ),
      );
      break;
    }

    case 'screenshot': {
      const result = await withConnection(
        parsed,
        async (client) => {
          const png = await captureScreenshot(client);
          const outPath = parsed.out
            ? parsed.out
            : `/tmp/capture-screenshot-${Date.now()}.png`;
          fs.writeFileSync(outPath, png);
          return { path: outPath, bytes: png.length };
        },
        { settle: 0 },
      );
      console.log(JSON.stringify(result, null, 2));
      break;
    }

    case 'a11y': {
      const result = await withConnection(
        parsed,
        async (client) => {
          const tree = await getAccessibilityTree(client);

          if (parsed.json) {
            return tree;
          }

          // Flat text output
          const lines = flattenA11yTree(tree, {
            interactive: parsed.interactive,
          });
          return lines.join('\n');
        },
        { settle: 0 },
      );

      if (parsed.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(result);
      }
      break;
    }

    case 'har': {
      const subcommand = args[1];

      if (subcommand === 'create') {
        // Generate a short random ID
        const { id, path: harPath } = createHarRecording();
        console.log(JSON.stringify({ id, path: harPath }, null, 2));
        console.error(
          `\nPass --har ${id} to subsequent commands to record traffic.`,
        );
        break;
      }

      if (subcommand === 'read') {
        const id = args[2];
        if (!id) {
          console.error('Usage: cdp.ts har read <id>');
          process.exit(1);
        }

        const har = readHarFile(id);
        if (!har) {
          console.error(`No HAR recording found for id: ${id}`);
          process.exit(1);
        }

        console.error(
          `HAR: ${harFilePath(id)} (${har.log.entries.length} entries)`,
        );
        console.log(JSON.stringify(har, null, 2));
        break;
      }

      if (subcommand === 'delete') {
        const id = args[2];
        if (!id) {
          console.error('Usage: cdp.ts har delete <id>');
          process.exit(1);
        }

        deleteHarRecording(id);
        console.log(JSON.stringify({ deleted: true, id }, null, 2));
        break;
      }

      console.error(
        'Usage: cdp.ts har <create|read|delete>\n' +
          '  create              Create a new HAR recording (returns id)\n' +
          '  read <id>           Read accumulated HAR entries\n' +
          '  delete <id>         Delete a HAR recording',
      );
      process.exit(1);
      break;
    }

    default:
      console.log(`CDP — exec-first browser automation. The agent writes JS, not CLI args.

Commands:
  exec <code>         Execute JavaScript in a browser tab
  exec --file <path>  Execute JS from file
  detect              Detect CDP port (prioritizes default browser)
  list                List all browser tabs
  open <url>          Open URL in browser (returns tab ID)
  screenshot          Capture screenshot
  a11y                Get accessibility tree
  record              Passive HAR recording
  navigate <url>      Navigate to URL and record HAR
  har create          Create a HAR recording (returns id)
  har read <id>       Read accumulated HAR entries
  har delete <id>     Delete a HAR recording

Options:
  --port <port>       Override CDP port
  --target <tabId>    Target tab by exact ID (preferred, parallel-safe)
  --url <pattern>     Target tab by URL pattern (fuzzy match)
  --new               Force new tab (open)
  --record            Enable HAR recording (exec)
  --har <id>          Append traffic to a HAR recording
  --har-out <path>    HAR output path
  --file <path>       Read JS from file (exec)
  --duration <secs>   Recording duration (record, default: 10)
  --settle <ms>       Settle time (navigate, default: 2000)
  --out <path>        Output path (screenshot)
  --json              JSON output (a11y)
  --interactive       Interactive elements only (a11y)

Console output (errors, warnings) is always captured and printed to stderr.

Examples:
  capture detect
  capture list
  capture open "https://app.example.com" --new
  capture exec "document.title" --url example
  capture exec "document.querySelector('.btn').click()" --url example
  capture exec "fetch('/api/data').then(r=>r.json())" --url example --record
  capture exec --file /tmp/scrape.js --url example
  capture screenshot --url example --out /tmp/shot.png
  capture a11y --url example --interactive
  capture record --url example --duration 15
  capture navigate "https://app.example.com/dashboard"
  capture har create
  capture exec "document.querySelector('form').submit()" --url example --har <id>
  capture har read <id>
`);
  }
}

// Only run CLI when executed directly (not imported)
const isMainModule = process.argv[1]?.endsWith('cdp.ts');
if (isMainModule) {
  main()
    .then(() => {
      // Flush stdout before exiting — process.exit() doesn't wait for stream drain
      if (process.stdout.writableNeedDrain) {
        process.stdout.once('drain', () => process.exit(0));
      } else {
        process.exit(0);
      }
    })
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}
