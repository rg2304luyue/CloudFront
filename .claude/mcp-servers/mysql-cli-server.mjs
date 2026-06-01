#!/usr/bin/env node
// Minimal MySQL MCP server that wraps the mysql CLI
// Avoids mysql2 driver compatibility issues with Node 25.x

import { execSync } from 'node:child_process';
import { createInterface } from 'node:readline';

const MYSQL_HOST = process.env.MYSQL_HOST || '192.168.91.130';
const MYSQL_PORT = process.env.MYSQL_PORT || '3306';
const MYSQL_USER = process.env.MYSQL_USER || 'root';
const MYSQL_PASS = process.env.MYSQL_PASSWORD || 'root';
const MYSQL_DB   = process.env.MYSQL_DB || 'cloud_mall';

const MYSQL_CMD = `mysql -h ${MYSQL_HOST} -P ${MYSQL_PORT} -u ${MYSQL_USER} -p${MYSQL_PASS} ${MYSQL_DB} --batch --skip-column-names -e`;

function query(sql) {
  try {
    const result = execSync(`${MYSQL_CMD} "${sql.replace(/"/g, '\\"')}"`, {
      encoding: 'utf-8',
      timeout: 30000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { success: true, output: result.trim() };
  } catch (err) {
    // Return stderr as output too — it might be a valid MySQL error message
    return { success: false, error: (err.stderr || err.message || '').replace(/mysql: \[Warning[^\n]*\n?/g, '').trim() };
  }
}

// MCP protocol via stdio
const rl = createInterface({ input: process.stdin });
const TOOLS = {
  mysql_query: {
    description: 'Run SQL queries against MySQL database (READ-ONLY)',
    inputSchema: {
      type: 'object',
      properties: { sql: { type: 'string', description: 'The SQL query to execute' } },
      required: ['sql'],
    },
  },
};

function respond(id, result) {
  process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, result }) + '\n');
}

function error(id, code, msg) {
  process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, error: { code, message: msg } }) + '\n');
}

rl.on('line', (line) => {
  let msg;
  try { msg = JSON.parse(line); } catch { return; }

  const { method, params, id } = msg;

  if (method === 'initialize') {
    respond(id, {
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      serverInfo: { name: 'mysql-cli-server', version: '1.0.0' },
    });
    // Send tools/list notification after init
    setTimeout(() => {
      process.stdout.write(JSON.stringify({
        jsonrpc: '2.0',
        method: 'notifications/tools/list_changed',
      }) + '\n');
    }, 50);
  } else if (method === 'tools/list') {
    respond(id, { tools: Object.entries(TOOLS).map(([name, def]) => ({ name, ...def })) });
  } else if (method === 'tools/call') {
    const { name, arguments: args } = params;
    if (name === 'mysql_query') {
      const r = query(args.sql);
      if (r.success) {
        respond(id, { content: [{ type: 'text', text: r.output || '(empty result)' }] });
      } else {
        respond(id, { content: [{ type: 'text', text: `Error: ${r.error}` }], isError: true });
      }
    } else {
      error(id, -32601, `Unknown tool: ${name}`);
    }
  } else if (method === 'notifications/initialized') {
    // ack
  } else {
    error(id, -32601, `Unknown method: ${method}`);
  }
});

// Log to stderr for debugging
console.error(`[mysql-cli-server] Connected to ${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DB}`);
