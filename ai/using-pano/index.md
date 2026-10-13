# Using Pano's API with an Agent

An agent can write scripts, bots and small services that talk to a running Pano over HTTP. Give it two things: the OpenAPI document of your own site, and only as much access as the task needs.

::: warning Pano has no MCP server for managing a site
The MCP server at `https://panomc.com/mcp` only reads this documentation. Nothing lets an agent run a Pano site through MCP. Whatever an agent does to a site, it does through the HTTP API described here, with the access you hand over.
:::

## Give the agent your OpenAPI document

Every Pano describes its own API, plugins included. Save the documents and put them next to the code the agent works on ([Reading the API Reference](../../integration/openapi/)):

```sh
curl -s http://localhost:8088/api/v1/openapi.json -o pano-openapi.json
curl -s http://localhost:8088/api/v1/plugins/pano-plugin-market/_/openapi.json -o market-openapi.json
```

These two are public and need no key. They are the truth for **your** site and version; these docs only describe Pano in general. For JavaScript, let the agent generate a [typed client](../../integration/client/) instead of writing `fetch` calls by hand:

```sh
bunx @panomc/client-gen pull --url http://localhost:8088 --out src/lib/pano
```

## Which access for which task

Pano has no personal "admin API token". These are the ways in ([Access](../../integration/access/)):

| Task | Access | Where you get it |
|---|---|---|
| Read public data: posts, servers, site info | none | nothing to create |
| A server that acts for visitors (a site, a bot with player logins) | a front-end key (`pfk_...`), plus the visitor's session token after login | **Appearance -> Themes -> gear button (Site display settings) -> Site connection keys -> Manage** |
| React to events (player registered, post published, order paid) | a webhook with its secret | **Settings -> Webhooks**, see [Webhooks](../../integration/webhooks/) |
| Panel operations (`/api/v1/panel/...`) | a panel login session; internal, no stability promise | not meant for scripts |

Two details that agents get wrong: the "Site connection keys" row is hidden while the site shows a Theme, and a site session token never works on the panel API (`403 SITE_TOKEN_NOT_ALLOWED`).

## Example prompts

```text
Read pano-openapi.json. Write a Bun script that prints the title and address of the five
latest posts from http://localhost:8088. Use page and pageSize, and on failure print error.code.
```

```text
Read pano-openapi.json. Write a small Discord bot command that shows which Minecraft servers
of my Pano are online and their player counts, from GET /api/v1/servers. No key is needed.
```

```text
Write a webhook receiver for Pano's core.user.registered event. Verify X-Pano-Signature as the
Webhooks page of the Pano docs describes, ignore repeated event ids, answer 2xx within 10 seconds.
```

```text
Read pano-openapi.json and market-openapi.json. List the operations a script would need to
show a player's own orders, and say which of them need a login. Do not write code yet.
```

## Least privilege

- **Start without a key.** Much of what a script needs is public. Add a key only when the task needs a login.
- **Keys live in `.env`, never in the prompt or the repository.** A front-end key is shown once; if it ends up in a chat or a commit, delete it in the panel and create a new one.
- **Log in as a test player, not as yourself.** A script that needs a session should use an account with no panel permissions.
- **Prefer a webhook to polling with a login.** Webhook payloads carry no e-mail addresses, IP addresses or message texts.
- **Stay on the public API.** Tell the agent not to call `/api/v1/panel/...`: it is internal and may change with any release.

## Safety

::: danger An agent with your admin access can change your site
If you give an agent your panel password, your browser's panel session or a shell on the machine that runs Pano, it can do what you can: delete players, change permissions, switch the front-end, stop servers. A wrong command is carried out as readily as a right one.
:::

- **Use a test site.** Let the agent work against a local Pano or a copy, not the live site. [Installation](../../platform/installation/) takes a few minutes.
- **Read before you run.** Have the agent write the script and explain it first; run it yourself. Do not let it execute writes (`POST`, `PUT`, `PATCH`, `DELETE`) on a live site unattended.
- **Back up first** if a script changes data.
- **Mind the rate limits.** A looping script gets `429 RATE_LIMIT_EXCEEDED`; it should respect `Retry-After` ([API Basics](../../integration/api-basics/)).
