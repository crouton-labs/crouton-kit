/**
 * Session Context — persists active session state so CDP commands
 * can auto-fill --target, --har, and --out without manual threading.
 *
 * State is written to /tmp/capture-sessions/.active (JSON).
 * Stale sessions (dir deleted, crashed process) are cleaned up on read.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const CAPTURE_ROOT = path.join(os.tmpdir(), 'capture-sessions');
const ACTIVE_PATH = path.join(CAPTURE_ROOT, '.active');

export interface ActiveSessionState {
  sessionId: string;
  dir: string;
  harId: string | null;
  targetId: string | null;
  stepCount: number;
}

export function getActiveSession(): ActiveSessionState | null {
  try {
    if (!fs.existsSync(ACTIVE_PATH)) return null;
    const state = JSON.parse(fs.readFileSync(ACTIVE_PATH, 'utf-8')) as ActiveSessionState;
    // Validate session dir still exists — clean up stale files
    if (!fs.existsSync(state.dir)) {
      clearActiveSession();
      return null;
    }
    return state;
  } catch {
    return null;
  }
}

export function setActiveSession(state: ActiveSessionState): void {
  fs.mkdirSync(CAPTURE_ROOT, { recursive: true });
  fs.writeFileSync(ACTIVE_PATH, JSON.stringify(state, null, 2));
}

export function clearActiveSession(): void {
  try {
    fs.unlinkSync(ACTIVE_PATH);
  } catch {
    // Already gone
  }
}

export function updateActiveSession(patch: Partial<ActiveSessionState>): ActiveSessionState | null {
  const current = getActiveSession();
  if (!current) return null;
  const updated = { ...current, ...patch };
  setActiveSession(updated);
  return updated;
}

function sanitizeLabel(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

/**
 * Returns the next auto-numbered screenshot path for the active session.
 * Format: {dir}/shots/{NN}-{action}-{sanitized-label}.png
 * Increments stepCount in the session state.
 */
export function nextStepPath(action: string, label: string): string | null {
  const session = getActiveSession();
  if (!session) return null;

  const step = session.stepCount + 1;
  const nn = String(step).padStart(2, '0');
  const sanitized = sanitizeLabel(label);
  const filename = `${nn}-${action}-${sanitized}.png`;
  const shotPath = path.join(session.dir, 'shots', filename);

  updateActiveSession({ stepCount: step });
  return shotPath;
}
