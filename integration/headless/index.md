# Headless Quick Start

"Headless" means Pano runs your site's data, accounts and plugins, and your own code draws the pages. Start with two commands.

## Two commands

Pano must be running (here on `http://localhost:8088`). Create a key first: **Appearance -> Themes -> gear button (Front-end settings) -> Keys -> Create Key**, and keep the `.env` lines it shows.

```sh
bunx @panomc/client-gen new my-site --url http://localhost:8088
cd my-site && bun run dev
```

The first command copies the SvelteKit starter, writes `.env` and installs. Paste the key into `.env`:

```sh
API_URL=http://localhost:8088/api
PANO_FRONTEND_KEY=pfk_...
PANO_SITE_URL=http://localhost:5173
```

Without a key the public pages (posts, store) work; login and register ask you to create one.

The starter is a BFF: every call to Pano is made by its server, the session token lives in an `HttpOnly` cookie, and it is already wired to the [typed client](../client/) and the [widgets](../widgets/) through its `/pano` proxy.

## Front-end modes

Choose in **Appearance -> Themes -> gear button (Front-end settings) -> Mode**:

| Mode | What runs | Use when |
|---|---|---|
| Theme | A Pano theme, started by Pano | The usual site |
| Custom app | Your zip, started by Pano | You want your own site, Pano still hosts it |
| External | Nothing; Pano forwards `/` to your address | Your site runs elsewhere |
| None | Nothing; only the panel and the API | Servers only, or a fully separate site |

Custom app: `bun run package` in the starter, upload the zip, select it. A zip needs `manifest.json` and `index.js` at its root:

```json
{ "id": "my-site", "type": "custom-app", "title": "My site", "version": "1.0.0", "author": "me" }
```

```js
Bun.serve({ port: process.env.PORT, hostname: process.env.HOST, fetch: () => new Response('hello') });
```

Pano passes `PORT`, `HOST`, `API_URL`, `PANO_API_URL`, `PANO_FRONTEND_KEY`, `PANO_SITE_URL`, `PROTOCOL_HEADER`, `HOST_HEADER`. External: enter the address (for example `http://127.0.0.1:4000`) and set `ORIGIN` to Pano's public address in your app.

`/panel`, `/api` and `/_pano` always stay with Pano. Switching back is safe: if the new front-end does not start, the previous one keeps serving.

## Fallback pages

Pano sends links to your visitors: activation mails, password resets, payment returns. Your front-end may not have those pages yet, so Pano ships plain ones under `/_pano/<target>`:

| Target | Page |
|---|---|
| `auth.activate`, `auth.activate-new-email`, `auth.renew-password` | Mail links |
| `auth.login` | Sign in |
| `market.order` | Payment return, order status |

They exist until you claim the target.

## URL map

Every link Pano builds has a target name. Resolution, first hit wins:

1. An override you set in **Appearance -> Themes -> gear button (Front-end settings)** (`PUT /api/v1/panel/frontend/urls`).
2. The `urls` of your front-end's manifest or descriptor. `false` means "no such page".
3. In theme mode, the theme's own route for that page.
4. The `/_pano/<target>` fallback page, if there is one; otherwise the link is left out.

Read the result:

```sh
curl http://localhost:8088/api/v1/frontend/urls
```

Claim two targets in a custom app's `manifest.json`:

```json
{ "urls": { "auth.activate": "/welcome/confirm?token={token}", "market.order": "/shop/o/{id}" } }
```

A server-side front-end on another domain should claim the targets that start a session (`createsSession`): the panel marks them "needed for server-side front-ends".

## Settings form

A front-end can describe its own settings (`settingsSchema` with `fields`); the panel then draws the form and `GET /api/v1/frontend/settings` returns the values. Field types: `text`, `textarea`, `boolean`, `number`, `select`, `color`, `url`, `image`.
