/**
 * HAR recording management — create, read, append, delete.
 *
 * Extracted from cdp/index.ts for reuse by TabSession and other modules.
 */

import * as fs from 'fs';
import * as path from 'path';

export interface HAREntry {
  request: {
    method: string;
    url: string;
    headers: Array<{ name: string; value: string }>;
    postData?: { text: string };
  };
  response: {
    status: number;
    headers: Array<{ name: string; value: string }>;
    content: { text?: string };
  };
  startedDateTime: string;
}

export type HarFile = { log: { entries: HAREntry[] } };

export const HAR_DIR = '/tmp/capture-har';

export function harFilePath(id: string): string {
  return path.join(HAR_DIR, `${id}.json`);
}

export function createHarRecording(): { id: string; path: string } {
  const id = Math.random().toString(36).slice(2, 8);
  const harPath = harFilePath(id);
  fs.mkdirSync(HAR_DIR, { recursive: true });
  fs.writeFileSync(harPath, JSON.stringify({ log: { entries: [] } }, null, 2));
  return { id, path: harPath };
}

export function readHarRecording(id: string): HarFile | null {
  try {
    return JSON.parse(fs.readFileSync(harFilePath(id), 'utf-8'));
  } catch {
    return null;
  }
}

export function appendToHarRecording(id: string, entries: HAREntry[]): void {
  const harPath = harFilePath(id);
  let har: HarFile;

  try {
    har = JSON.parse(fs.readFileSync(harPath, 'utf-8'));
  } catch {
    har = { log: { entries: [] } };
  }

  har.log.entries.push(...entries);
  fs.writeFileSync(harPath, JSON.stringify(har, null, 2));
}

export function deleteHarRecording(id: string): void {
  try {
    fs.unlinkSync(harFilePath(id));
  } catch {
    // best-effort — file may already be gone
  }
}
