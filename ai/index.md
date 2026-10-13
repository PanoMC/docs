# Pano and AI Agents

You can build for Pano with an AI coding agent: Claude Code, Cursor, Codex, GitHub Copilot or any other tool that reads files and runs commands. This section shows what Pano gives such a tool to read, and how to ask it for a plugin, a theme, a headless site or a script.

An agent is only as good as what it reads. Pano's packages are young and change often, so an agent that answers from memory will guess. Point it at the sources below instead.

## What is available

| What | Where | Use |
|---|---|---|
| Page index for LLMs | `https://panomc.com/docs/llms.txt` | The list of every documentation page with its address |
| Whole documentation in one file | `https://panomc.com/docs/llms-full.txt` | Paste or attach when the tool cannot browse |
| Every page as Markdown | the page address with `.md` at the end | Give the agent one exact page |
| Docs MCP server | `https://panomc.com/mcp` | The agent searches and reads the docs by itself |
| Agent guide in the template repositories | `AGENTS.md`, `CLAUDE.md` and `agent-guide/` | Rules for writing a plugin, a theme or a headless site |
| OpenAPI document of your own Pano | `/api/v1/openapi.json` on your site | The exact API of your site, plugins included |

## I want to...

| I want to | Go to |
|---|---|
| Let my agent look things up in these docs | [Docs for Agents](./docs-for-agents/) |
| Build a plugin (addon) with an agent | [Building with an Agent](./building/#plugin) |
| Build or restyle a theme with an agent | [Building with an Agent](./building/#theme) |
| Build my own site on Pano's API (headless) | [Building with an Agent](./building/#headless-front-end) |
| Have an agent write a script against my running Pano | [Using Pano's API with an Agent](./using-pano/) |
| Read the same things myself | [Addon handbook](../handbook/addon/), [Theme handbook](../handbook/theme/), [API Basics](../integration/api-basics/) |

## One-minute setup

Connect the docs to your agent once. In Claude Code:

```sh
claude mcp add --transport http pano-docs https://panomc.com/mcp
```

In Cursor and most other tools, add this to the MCP configuration file:

```json
{
  "mcpServers": {
    "pano-docs": { "url": "https://panomc.com/mcp" }
  }
}
```

The server needs no login and can only read the documentation. [Docs for Agents](./docs-for-agents/) has the VS Code variant and what to do when your tool has no MCP support.

Then ask something to check that it works:

```text
Use the pano-docs tools. How do I start a new Pano theme, and which file do I edit to change the main colour?
```

The answer should name `bunx @panomc/theme-core new` and `src/styles/tokens.scss`, as [Theme Getting Started](../theme/getting-started/) does.

## What an agent cannot do for you

- **It does not replace a running Pano.** A plugin and a theme are developed against your own Pano with Development Mode on. See [Installation](../platform/installation/).
- **It does not manage your site.** Pano has no MCP server that changes a site. The only MCP server is the read-only one for these docs. An agent reaches a running Pano only through the HTTP API, with the access you give it: see [Using Pano's API with an Agent](./using-pano/).
- **It does not release for you.** Read the diff, run the checks and try the result in a browser before you publish. Each page of this section ends with what to review by hand.
