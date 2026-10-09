# Typed Client

`@panomc/client` is a small JavaScript client with no dependencies. Its functions are generated from the OpenAPI documents of your own Pano, so they match the plugins you have installed. JSDoc types, no TypeScript needed.

## Pull it

From your project folder:

```sh
bunx @panomc/client-gen pull --url http://localhost:8088 --out src/lib/pano
```

`pull` reads `/api/v1/openapi.json` and the plugin package list, then writes:

```
src/lib/pano/core/                 one function per core operation
src/lib/pano/plugins/market/       the same for each active plugin
src/lib/pano/plugins/index.json    plugin, version and hashes
```

Add `--plugin pano-plugin-name` for a plugin that has no UI package. Nothing needs a key: everything `pull` reads is public. If Pano does not answer, the message says which URL it tried.

## Use it

```js
import { createClient } from '@panomc/client';
import { getPosts } from './lib/pano/core/index.js';

const client = createClient({ baseUrl: 'http://localhost:8088' });

const result = await getPosts(client, { query: { page: 1, pageSize: 5 } });
if (result.ok) console.log(result.data.items);
else console.log(result.error.code);
```

- `baseUrl` is what comes before `/api/v1`: Pano's address, or a proxy prefix such as `/pano`.
- A call never throws for an HTTP or network problem. It returns `{ ok: true, status, data }` or `{ ok: false, status, error }`. A network failure is `status: 0` and `error.code: 'NETWORK_ERROR'`.
- Want exceptions instead? Wrap it: `unwrap(result)` returns `data` or throws `PanoApiError` with `code`, `status` and `fields`.
- Function names are the `operationId` with a lower-case first letter: `GetPosts` becomes `getPosts`.

## Options

| Option | Use |
|---|---|
| `frontendKey` | Server only. Sent as `X-Pano-Frontend-Key`. |
| `sessionToken` | A string or a function. Sent as `Authorization: Bearer`. |
| `clientIp` | The visitor's address; sent only with a key. |
| `locale` | Sent as `Accept-Language`. |
| `credentials` | `include` in browsers (cookie session), `omit` elsewhere. |
| `csrf` | `auto` by default for cookie sessions: the client fetches and sends the token, and retries once on `INVALID_CSRF_TOKEN`. `off` for Bearer. |
| `onUnauthorized` | Called on a `401`. |

A server with a key:

```js
const client = createClient({
  baseUrl: process.env.API_URL.replace(/\/api\/?$/, ''),
  frontendKey: process.env.PANO_FRONTEND_KEY,
  sessionToken: sessionFromCookie,
  clientIp: visitorIp
});
```

## A plugin without OpenAPI

Call any path by hand:

```js
await client.request({ method: 'GET', path: '/api/plugins/pano-plugin-x/things' });
```

## Keep it in step

Update Pano or a plugin, then check what changed:

```sh
bunx @panomc/client-gen check --url http://localhost:8088 --dir src/lib/pano
```

It exits with 1 and lists removed or changed operations. Run `pull` again to update. To generate from a saved file without a running Pano:

```sh
bunx @panomc/client-gen generate --input pano-openapi.json --out src/lib/pano/core
```

Deprecated operations are marked `@deprecated`, so your editor shows them struck through.
