/**
 * TabSession — universal tab lifecycle abstraction for parallel-safe CDP usage.
 *
 * Manages: tab creation, HAR recording, environment injection, and cleanup.
 * Callers create a TabSession, pass its env() to downstream scripts, and close() when done.
 *
 * Usage:
 *   const session = await TabSession.create({ url: 'https://app.hubspot.com' });
 *   console.log(session.env());  // { CDP_TARGET: '...', CDP_HAR_ID: '...' }
 *   await session.validate();     // throws if tab is gone
 *   await session.close();        // closes tab + deletes HAR
 */

import {
  navigateAndWait,
  findTabById,
  detectCdpPort,
  CDPClient,
} from './cdp.js';
import { createHarRecording, deleteHarRecording } from './har-manager.js';

export interface TabSessionOptions {
  url: string;
  forceNew?: boolean; // Default true (parallel-safe)
  createHar?: boolean; // Default true
  cdpPort?: number; // Auto-detect if not provided
}

export interface TabSessionEnv {
  CDP_TARGET: string;
  CDP_HAR_ID?: string;
}

export class TabSession {
  readonly tabTarget: string;
  readonly harId: string | null;
  readonly cdpPort: number;
  private closed = false;

  private constructor(
    tabTarget: string,
    harId: string | null,
    cdpPort: number,
  ) {
    this.tabTarget = tabTarget;
    this.harId = harId;
    this.cdpPort = cdpPort;
  }

  static async create(options: TabSessionOptions): Promise<TabSession> {
    const port = options.cdpPort ?? (await detectCdpPort());
    const tab = await navigateAndWait(port, options.url, {
      forceNew: options.forceNew ?? true,
    });
    let harId: string | null = null;
    if (options.createHar !== false) {
      harId = createHarRecording().id;
    }
    return new TabSession(tab.id, harId, port);
  }

  async validate(): Promise<void> {
    const tab = await findTabById(this.cdpPort, this.tabTarget);
    if (!tab) throw new Error(`Tab ${this.tabTarget} no longer exists`);
  }

  env(): TabSessionEnv {
    const result: TabSessionEnv = { CDP_TARGET: this.tabTarget };
    if (this.harId) result.CDP_HAR_ID = this.harId;
    return result;
  }

  async close(): Promise<void> {
    if (this.closed) return;
    this.closed = true;
    try {
      const tab = await findTabById(this.cdpPort, this.tabTarget);
      if (tab?.webSocketDebuggerUrl) {
        const client = new CDPClient(tab.webSocketDebuggerUrl);
        await client.waitReady();
        await client.send('Runtime.evaluate', {
          expression: 'window.close()',
        });
        client.close();
      }
    } catch {
      /* best-effort */
    }
    if (this.harId) deleteHarRecording(this.harId);
  }
}
