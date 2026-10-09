# Reading the API Reference

Pano describes its own API. There is no separate reference to keep in sync: the running site answers with an OpenAPI 3.1 document, and so does every plugin.

## The documents

| Document | URL | Content |
|---|---|---|
| Core | `/api/v1/openapi.json` | Public operations of Pano |
| A plugin | `/api/v1/plugins/<pluginId>/_/openapi.json` | Public operations of that plugin |
| Panel | `/api/v1/panel/openapi.json` | Internal operations, panel session required |

Fetch the core document from a local Pano:

```sh
curl -s http://localhost:8088/api/v1/openapi.json -o pano-openapi.json
```

Fetch the market plugin's:

```sh
curl -s http://localhost:8088/api/plugins/pano-plugin-market/_/openapi.json -o market-openapi.json
```

Plugins need nothing extra: Pano builds the document from the plugin's endpoints, closed-source plugins included. Plugins that are installed but stopped have no document.

## How to read an operation

- `servers[0].url` is the prefix: `/api/v1` for core, `/api/plugins/<pluginId>` for a plugin. Operation paths come after it.
- `operationId` is the endpoint class name without `API`, for example `GetPosts`. The [typed client](../client/) names its functions after it.
- `parameters` and `requestBody` are JSON Schema, taken from the endpoint's own validation.
- `responses` lists the success body and the error envelope. The common error codes (`NOT_LOGGED_IN`, `NO_PERMISSION`, `INVALID_CSRF_TOKEN`, `TOO_MANY_REQUESTS`, `MAINTENANCE_MODE_ENABLED`) are shared.
- `deprecated: true` means a replacement exists; `x-pano-removal` is the earliest removal date.
- `x-pano-stability` is `public` or `internal`. Only public operations carry the promise of [API Basics](../api-basics/).
- `x-pano-undocumented: true` means the author gave no description: the path and inputs are real, the response is free-form.

## Look at it quickly

List every public path and method with `jq`:

```sh
jq -r '.paths | to_entries[] | .key as $p | .value | keys[] | "\(.) \($p)"' pano-openapi.json
```

Show one operation:

```sh
jq '.paths["/posts"].get' pano-openapi.json
```

Any OpenAPI 3.1 viewer or generator can read the files as they are.

## Keeping a copy

Save the document next to your code and compare it after updates. A change that removes an operation or a response field, other than a deprecated one past its date, is a bug: report it.

For JavaScript you rarely need the file itself. [`pano-client pull`](../client/) downloads the core document and the documents of the active plugins and turns them into functions.

## What is not in the documents

- Real-time sockets: see [Access](../access/#websocket-ticket).
- Page routes of the front-end and `/_pano/*` fallback pages: see [Headless Quick Start](../headless/).
- Outgoing events: see [Webhooks](../webhooks/).
