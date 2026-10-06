# pagewire-mcp

MCP server for [PageWire](https://pagewire.dev/?ref=github-mcp). It turns any public web page into clean Markdown for AI agents, paid per call in USDC. There is no API key and no account.

**Try it free:** tool calls without payment are free up to $0.10 of list price per client per day (10 pages to Markdown, 20 metadata calls or 3 crawls). After that the tool answers with an x402 payment request.

| Tool | What it does | Price |
|---|---|---|
| `page_to_markdown` | Fetches a public page and returns its title, description, clean Markdown and links. Deterministic, no model call | $0.01 |
| `page_metadata` | Returns title, description, canonical URL, language, OpenGraph and Twitter cards, icons and JSON-LD | $0.005 |
| `crawl_site` | Reads a page plus up to 4 same-site pages it links to (optionally only under a path `prefix`), each as Markdown | $0.03 |

This package is a dependency-free **stdio bridge** (Node 18+) to the hosted Streamable-HTTP server at `https://pagewire.dev/mcp`. Clients that speak Streamable HTTP can use that URL directly and skip the bridge.

## Install

### Claude Code
```bash
claude mcp add pagewire -- npx -y github:AgentiLoop/pagewire-mcp
# or, without the bridge:
claude mcp add --transport http pagewire https://pagewire.dev/mcp
```

### Claude Desktop / Cursor / Windsurf / Cline (stdio)
```json
{ "mcpServers": { "pagewire": { "command": "npx", "args": ["-y", "github:AgentiLoop/pagewire-mcp"] } } }
```

### Any Streamable-HTTP client
```json
{ "mcpServers": { "pagewire": { "type": "http", "url": "https://pagewire.dev/mcp" } } }
```

### Verify
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | npx -y github:AgentiLoop/pagewire-mcp
```

## Paying

1. Within the daily free allowance a tool call just works; the result's `_meta["pagewire/free"]` shows the allowance left today.
2. After that, a call without payment returns `isError: true` with `structuredContent` set to the x402 v2 PaymentRequired object (the `accepts` list: network, asset, amount, `payTo`), following the x402 MCP transport. `@x402/mcp` clients pay automatically.
3. To pay by hand, sign one `accepts` entry with any x402 client and call the tool again with the payload in `params._meta["x402/payment"]` (or the base64 payload as the `payment` argument).
4. A bad input or a page that cannot be fetched (4xx) is never charged.

The same tools are plain HTTP endpoints: `GET https://pagewire.dev/x402/extract?url=…`, `/x402/meta?url=…` and `/x402/crawl?url=…`. Each one also accepts MPP (`npx mppx "https://pagewire.dev/x402/extract?url=https://example.com"`). Discovery: [openapi.json](https://pagewire.dev/openapi.json), [llms.txt](https://pagewire.dev/llms.txt).

## Environment

| Variable | Default |
|---|---|
| `PAGEWIRE_MCP_URL` | `https://pagewire.dev/mcp` |
| `PAGEWIRE_MCP_TIMEOUT_MS` | `60000` |

Official MCP registry entry: `dev.pagewire/web`. Agent skill: `npx skills add https://pagewire.dev`.

## License

MIT. The bridge is open source; the hosted service is at https://pagewire.dev/.
