# API Basics

Everything Pano does for visitors is available over HTTP. This page is the short version: where the API lives, what an answer looks like, how lists are paged, and how Pano tells you something is going away.

## Where it lives

Every public path starts with `/api/v1`. Try it on your own site:

```sh
curl http://localhost:8088/api/v1/site-info
```

| Part | Path | Promise |
|---|---|---|
| Site API (core) | `/api/v1/...` | Public. Only additions. |
| A plugin's API | `/api/plugins/<pluginId>/...` | Public. `<pluginId>` is the full id, for example `pano-plugin-market`. |
| Per-plugin services of core | `/api/v1/plugins/<pluginId>/_/...` | Public. `_` is reserved for core. |
| Panel API | `/api/v1/panel/...` | Internal. Panel and platform ship together. |
| Setup, node, maintenance | `/api/v1/setup`, `/node`, `/maintenance` | Internal. |

Plugin panel endpoints live at `/api/plugins/<pluginId>/panel/...`. Nothing else under `/api` is served, and `/panel/api` no longer exists.

## Plugin namespace

- A plugin's paths carry no version: `/api/plugins/<pluginId>/...`. A plugin owns its API and versions it itself; core's `/api/v1` promise does not cover it. The old `/api/v1/plugins/<pluginId>/...` paths answer 404.
- `panel` and `_` are reserved first segments. `panel` marks the plugin's admin endpoints, `_` marks core's own services about the plugin (`translations`, `openapi.json`, `ui.zip`), which stay under `/api/v1/plugins/<pluginId>/_/`.
- Plugin management stays in core at `/api/v1/panel/plugins/...`.
- Five core lists were renamed to `items`: support sidebar `onlineAdmins`, panel player search `players`, pending servers `servers`, server players `players` and software `software`. Only paged lists carry `page`.

## Answers

A good answer is a plain JSON object. There is no `result` wrapper:

```json
{ "message": "hi" }
```

A failed answer always has one shape, whatever the endpoint:

```json
{ "error": { "code": "INVALID_FIELDS", "fields": { "email": "EXISTS" } } }
```

`code` is always there and never changes between releases. `message` (English, for people reading logs), `details` and `fields` appear only when they have something to say. Check `code`, never the HTTP text.

Every answer also carries the header `Pano-Api-Level`: the API level of this Pano. It rises when the extension contract gains something.

## Lists and pages

Ask for a page with `page` (starts at 1) and `pageSize` (up to 100):

```sh
curl "http://localhost:8088/api/v1/posts?page=2&pageSize=20"
```

```json
{ "items": [ ], "page": { "number": 2, "size": 20, "totalItems": 57, "totalPages": 3 } }
```

- A `pageSize` outside `1..100` is refused with `INVALID_FIELDS` and `fields.pageSize = OUT_OF_RANGE`. It is never silently clamped.
- A page past the last one answers `404 PAGE_NOT_FOUND`. An empty list answers page 1 with `totalPages: 0`.
- A few internal lists (console search, alerts) use `limit` and `cursor` and answer `page.nextCursor`.

## Levels, stability, deprecation

- **Public operations only grow.** Nothing is removed or renamed, no field changes type or disappears, no request field becomes required, no error code changes.
- **Deprecated** operations still work. They are marked `deprecated: true` in the OpenAPI document and answer the headers `Deprecation: true` and `Sunset: <date>`.
- A deprecated operation is removed no sooner than **6 months** after the release that deprecated it, on the `Sunset` date.
- Plugins and themes declare the API level they need. Pano starts a resource only if its level is between the minimum and the current level of the site.

## Rate limits

Calls are limited per visitor address. Limited calls answer `429 TOO_MANY_REQUESTS` and the headers `X-RateLimit-Limit`, `X-RateLimit-Remaining` and `Retry-After`. A front-end that serves many visitors uses a [front-end key](../access/) so it gets its own buckets.

## Next

- [Reading the API reference](../openapi/): find every operation and its schema.
- [Access](../access/): cookies, CSRF, keys, WebSocket.
