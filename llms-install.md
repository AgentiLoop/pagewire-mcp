# Installing pagewire-mcp (instructions for AI agents)

No API key, no account and no build step. This is a stdio bridge to `https://pagewire.dev/mcp`, and it needs Node.js 18 or newer.

```json
{ "mcpServers": { "pagewire": { "command": "npx", "args": ["-y", "github:AgentiLoop/pagewire-mcp"] } } }
```

Claude Code: `claude mcp add pagewire -- npx -y github:AgentiLoop/pagewire-mcp`. Remote alternative: `{"type": "http", "url": "https://pagewire.dev/mcp"}`.

Verify: `echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | npx -y github:AgentiLoop/pagewire-mcp`. Expect three tools: `page_to_markdown`, `page_metadata` and `crawl_site`.

All tools are paid per call in USDC through x402. Without a `payment` argument they return the price and payment requirements (`structuredContent.paymentRequired`), and nothing is charged unless the caller signs a payment.
