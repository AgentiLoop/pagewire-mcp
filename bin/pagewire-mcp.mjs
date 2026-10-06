#!/usr/bin/env node
// pagewire-mcp — stdio bridge for the hosted PageWire MCP server (https://pagewire.dev/mcp).
// Reads newline-delimited JSON-RPC from stdin, forwards each message over HTTPS, writes replies to stdout.
// No dependencies. Node 18+ (global fetch).
import { createInterface } from 'node:readline';

const VERSION = '1.0.0';
const URL = process.env.PAGEWIRE_MCP_URL || 'https://pagewire.dev/mcp';
const TIMEOUT_MS = Number(process.env.PAGEWIRE_MCP_TIMEOUT_MS) || 60_000;

const arg = process.argv[2];
if (arg === '--version' || arg === '-v') { console.log(VERSION); process.exit(0); }
if (arg === '--help' || arg === '-h') {
  console.log(`pagewire-mcp ${VERSION} — MCP stdio bridge to ${URL}
Usage: pagewire-mcp            (speak MCP over stdin/stdout)
Env:   PAGEWIRE_MCP_URL        remote endpoint (default https://pagewire.dev/mcp)
       PAGEWIRE_MCP_TIMEOUT_MS per-request timeout (default 60000)
Docs:  https://pagewire.dev/#mcp`);
  process.exit(0);
}

const out = (msg) => process.stdout.write(JSON.stringify(msg) + '\n');
const rpcError = (id, code, message) => ({ jsonrpc: '2.0', id: id ?? null, error: { code, message } });

async function forward(line) {
  let msg;
  try {
    msg = JSON.parse(line);
  } catch {
    return out(rpcError(null, -32700, 'Parse error'));
  }
  const ids = (Array.isArray(msg) ? msg : [msg]).map((m) => m && m.id).filter((id) => id !== undefined);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json', 'user-agent': `pagewire-mcp/${VERSION} node/${process.versions.node}` },
      body: line,
      signal: ctrl.signal,
    });
    if (res.status === 202 || res.status === 204) return; // notification(s): no reply
    const text = await res.text();
    if (!text) return;
    let reply;
    try {
      reply = JSON.parse(text);
    } catch {
      for (const id of ids) out(rpcError(id, -32603, `Remote returned HTTP ${res.status} with a non-JSON body`));
      return;
    }
    out(reply);
  } catch (e) {
    const why = e && e.name === 'AbortError' ? `timed out after ${TIMEOUT_MS} ms` : (e && e.message) || String(e);
    for (const id of ids) out(rpcError(id, -32000, `Could not reach ${URL}: ${why}`));
  } finally {
    clearTimeout(timer);
  }
}

const pending = new Set();
const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });
rl.on('line', (line) => {
  if (!line.trim()) return;
  const p = forward(line).finally(() => pending.delete(p));
  pending.add(p);
});
rl.on('close', async () => {
  await Promise.allSettled([...pending]);
  process.exit(0);
});
