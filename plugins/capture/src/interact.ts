/**
 * A11y-driven interactions — click and type using the accessibility tree
 * instead of brittle CSS selectors.
 *
 * Pipeline: getFullAXTree → find by name/role → DOM.getBoxModel → Input.dispatchMouseEvent
 *
 * Uses getFullAXTree instead of queryAXTree because queryAXTree hangs on
 * complex pages (7000+ AX nodes) when given the DOM root nodeId.
 */

import type { CDPClient } from './cdp.js';

interface ClickResult {
  x: number;
  y: number;
  role: string;
  name: string;
}

interface FullAXNode {
  nodeId: string;
  backendDOMNodeId?: number;
  role?: { value: string };
  name?: { value: string };
  childIds?: string[];
}

/**
 * Click an element by its accessible name. Optionally filter by ARIA role.
 *
 * Uses Accessibility.getFullAXTree to find elements by name/role,
 * then dispatches mouse events at the element's center coordinates.
 */
export async function clickByName(
  client: CDPClient,
  name: string,
  role?: string,
): Promise<ClickResult> {
  await client.send('Accessibility.enable');
  await client.send('DOM.enable');

  const { nodes } = (await client.send('Accessibility.getFullAXTree')) as {
    nodes: FullAXNode[];
  };
  await client.send('Accessibility.disable');

  // Find nodes matching the accessible name (exact match)
  const nameLower = name.toLowerCase();
  const matches = nodes.filter((n) => {
    if (!n.backendDOMNodeId) return false;
    if (!n.name?.value) return false;
    if (n.name.value.toLowerCase() !== nameLower) return false;
    if (role && n.role?.value !== role) return false;
    return true;
  });

  if (matches.length === 0) {
    throw new Error(
      `No element found with accessible name "${name}"${role ? ` and role "${role}"` : ''}. ` +
        'Run `capture a11y --interactive` to see available elements.',
    );
  }

  if (matches.length > 1 && !role) {
    // Auto-prefer input-like roles for better type --into ergonomics
    const INPUT_ROLES = new Set(['textbox', 'searchbox', 'combobox', 'textarea', 'spinbutton']);
    const inputMatches = matches.filter((n) => n.role?.value && INPUT_ROLES.has(n.role.value));
    if (inputMatches.length === 1) {
      // Unambiguous input element — use it
      matches.length = 0;
      matches.push(inputMatches[0]);
    } else {
      const summary = matches
        .slice(0, 5)
        .map((n) => `  ${n.role?.value} "${n.name?.value}"`)
        .join('\n');
      throw new Error(
        `Multiple elements match "${name}" — disambiguate with --role:\n${summary}`,
      );
    }
  }

  const match = matches[0];
  const backendNodeId = match.backendDOMNodeId!;

  // Scroll into view
  await client.send('DOM.scrollIntoViewIfNeeded', { backendNodeId });

  // Get box model for click coordinates
  const { model } = (await client.send('DOM.getBoxModel', { backendNodeId })) as {
    model: { content: number[] };
  };

  // Content quad is [x1,y1, x2,y2, x3,y3, x4,y4] — calculate center
  const quad = model.content;
  const x = (quad[0] + quad[2] + quad[4] + quad[6]) / 4;
  const y = (quad[1] + quad[3] + quad[5] + quad[7]) / 4;

  // Click: mousePressed + mouseReleased
  await client.send('Input.dispatchMouseEvent', {
    type: 'mousePressed',
    x,
    y,
    button: 'left',
    clickCount: 1,
  });
  await client.send('Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    x,
    y,
    button: 'left',
    clickCount: 1,
  });

  return {
    x: Math.round(x),
    y: Math.round(y),
    role: match.role?.value ?? 'unknown',
    name: match.name?.value ?? name,
  };
}

/**
 * Type text into the currently focused element via CDP Input.insertText.
 */
export async function typeText(client: CDPClient, text: string): Promise<void> {
  await client.send('Input.insertText', { text });
}

/**
 * Click a field by accessible name, then type text into it.
 */
export async function focusAndType(
  client: CDPClient,
  fieldName: string,
  text: string,
  role?: string,
): Promise<ClickResult> {
  const result = await clickByName(client, fieldName, role);
  // Small delay for focus to settle
  await new Promise((r) => setTimeout(r, 100));
  await typeText(client, text);
  return result;
}
