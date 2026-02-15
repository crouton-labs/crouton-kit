#!/usr/bin/env node
// Minimal MCP stdio server — exposes a single `submit` tool.
// Claude calls submit(data) and we write the JSON to $AI_WORKFLOW_SUBMIT_PATH.

import { writeFileSync } from "node:fs";
import { createInterface } from "node:readline";

const submitPath = process.env.AI_WORKFLOW_SUBMIT_PATH;
if (!submitPath) {
  process.stderr.write("submit-server: AI_WORKFLOW_SUBMIT_PATH not set\n");
  process.exit(1);
}

const SERVER_INFO = { name: "submit", version: "1.0.0" };

const TOOL = {
  name: "submit",
  description:
    "You MUST call this tool to return your structured output. " +
    "Pass your result as the `data` parameter. Do not output JSON to stdout — use this tool instead.",
  inputSchema: {
    type: "object",
    properties: {
      data: {
        type: "object",
        description: "The structured result object to return.",
      },
    },
    required: ["data"],
  },
};

function respond(id, result) {
  const msg = JSON.stringify({ jsonrpc: "2.0", id, result });
  process.stdout.write(`Content-Length: ${Buffer.byteLength(msg)}\r\n\r\n${msg}`);
}

function respondError(id, code, message) {
  const msg = JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } });
  process.stdout.write(`Content-Length: ${Buffer.byteLength(msg)}\r\n\r\n${msg}`);
}

let headerBuf = "";
let expectedLength = -1;

process.stdin.setEncoding("utf-8");
process.stdin.on("data", (chunk) => {
  headerBuf += chunk;
  while (true) {
    if (expectedLength === -1) {
      const sep = headerBuf.indexOf("\r\n\r\n");
      if (sep === -1) break;
      const header = headerBuf.slice(0, sep);
      const match = header.match(/Content-Length:\s*(\d+)/i);
      if (!match) {
        headerBuf = headerBuf.slice(sep + 4);
        continue;
      }
      expectedLength = parseInt(match[1], 10);
      headerBuf = headerBuf.slice(sep + 4);
    }
    if (headerBuf.length < expectedLength) break;
    const body = headerBuf.slice(0, expectedLength);
    headerBuf = headerBuf.slice(expectedLength);
    expectedLength = -1;
    handleMessage(JSON.parse(body));
  }
});

function handleMessage(msg) {
  const { id, method, params } = msg;

  switch (method) {
    case "initialize":
      respond(id, {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO,
      });
      break;

    case "notifications/initialized":
      // No response needed for notifications
      break;

    case "tools/list":
      respond(id, { tools: [TOOL] });
      break;

    case "tools/call": {
      const toolName = params?.name;
      if (toolName !== "submit") {
        respondError(id, -32602, `Unknown tool: ${toolName}`);
        return;
      }
      const data = params?.arguments?.data;
      if (data === undefined) {
        respondError(id, -32602, "Missing required parameter: data");
        return;
      }
      try {
        writeFileSync(submitPath, JSON.stringify(data));
        respond(id, {
          content: [{ type: "text", text: "Submitted successfully." }],
        });
      } catch (err) {
        respondError(id, -32603, `Failed to write submit file: ${err.message}`);
      }
      break;
    }

    default:
      if (id !== undefined) {
        respondError(id, -32601, `Method not found: ${method}`);
      }
  }
}
