# pagewire-mcp

MCP server for [PageWire](https://pagewire.dev/?ref=github-mcp). It turns any public web page into clean Markdown for AI agents, paid per call in USDC. There is no API key and no account.

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

1. Call a tool without `payment`. The result is `isError: true` with `structuredContent.paymentRequired`, which holds the x402 v2 `accepts` list (network, asset, amount, `payTo`).
2. Sign one entry with any x402 client (for example `@x402/fetch`) and call the tool again with the base64 payload as `payment`.
3. A bad input or a page that cannot be fetched (4xx) is never charged.

The same tools are plain HTTP endpoints: `GET https://pagewire.dev/x402/extract?url=…`, `/x402/meta?url=…` and `/x402/crawl?url=…`. Each one also accepts MPP (`npx mppx "https://pagewire.dev/x402/extract?url=https://example.com"`). Discovery: [openapi.json](https://pagewire.dev/openapi.json), [llms.txt](https://pagewire.dev/llms.txt).

## Environment

| Variable | Default |
|---|---|
| `PAGEWIRE_MCP_URL` | `https://pagewire.dev/mcp` |
| `PAGEWIRE_MCP_TIMEOUT_MS` | `60000` |

Official MCP registry entry: `dev.pagewire/web`. Agent skill: `npx skills add https://pagewire.dev`.

## License

MIT. The bridge is open source; the hosted service is at https://pagewire.dev/.
