# Docs for Agents

Four ways to put this documentation in front of an AI agent. Use the MCP server when your tool supports it; the files work everywhere else.

## llms.txt

```text
https://panomc.com/docs/llms.txt
```

A short index for language models: every page of the documentation with its title and address. Give it to an agent that can fetch URLs and let it pick the pages it needs. It is also the reliable place to find the exact address of a page.

## llms-full.txt

```text
https://panomc.com/docs/llms-full.txt
```

The whole documentation in one Markdown file. Use it when the tool cannot browse: download it and attach it, or add it to the project's knowledge. It is large, so prefer single pages when you know which ones matter.

## A page as Markdown

Every page is also served as plain Markdown: add `.md` to the page address (without the trailing slash).

| Page | Markdown |
|---|---|
| `https://panomc.com/docs/platform/installation/` | `https://panomc.com/docs/platform/installation.md` |

```sh
curl -s https://panomc.com/docs/platform/installation.md
```

If an address does not answer, take the exact one from `llms.txt`.

## The MCP server

`https://panomc.com/mcp` is a Model Context Protocol server for these docs. Transport: Streamable HTTP. No login. Read-only: it cannot see or change any Pano site.

| Tool | Input | Returns |
|---|---|---|
| `search_docs` | a query | the matching pages |
| `get_doc` | a page path | that page as Markdown |

### Claude Code

```sh
claude mcp add --transport http pano-docs https://panomc.com/mcp
```

### Cursor and other clients

Add the server to the client's MCP configuration (in Cursor: `.cursor/mcp.json` in the project):

```json
{
  "mcpServers": {
    "pano-docs": { "url": "https://panomc.com/mcp" }
  }
}
```

### VS Code

VS Code uses the key `servers` and needs the type (`.vscode/mcp.json` in the project):

```json
{
  "servers": {
    "pano-docs": { "type": "http", "url": "https://panomc.com/mcp" }
  }
}
```

Any other client that supports remote MCP servers over Streamable HTTP works with the same address.

## Try it

```text
Use the pano-docs tools. Which header does a server send to Pano to identify itself,
and where in the panel do I create that key? Quote the page you took it from.
```

A correct answer names `X-Pano-Frontend-Key` and the panel path from [Access](../../integration/access/). If the agent answers without calling `search_docs` or `get_doc`, tell it to use the tools: an answer from memory is often out of date.

## Tips

- Ask the agent to **name the page** it used. You can then open it and check.
- These docs describe Pano in general. For the API of **your** site, with your plugins, give the agent your own OpenAPI document: see [Using Pano's API with an Agent](../using-pano/).
- Inside a plugin, theme or starter repository the agent should read the `agent-guide/` folder first: see [Building with an Agent](../building/).
