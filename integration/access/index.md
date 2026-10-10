# Access

Who may call the API, and how a front-end proves it. Three situations, in the order you will meet them.

## 1. A browser on the site (cookie + CSRF)

The default. A theme, or any page on your site's domain, logs in and Pano sets cookies. Pano's cookies are host-only and `SameSite=Lax`.

Every write (`POST`, `PUT`, `PATCH`, `DELETE`) by a logged-in cookie session must carry a CSRF token:

```sh
curl -s -b jar -c jar http://localhost:8088/api/v1/auth/csrf
# {"csrfToken":"..."}
```

```js
await fetch('/api/plugins/pano-plugin-market/cart/items', {
  method: 'POST',
  credentials: 'include',
  headers: { 'content-type': 'application/json', 'X-CSRF-Token': token },
  body: JSON.stringify({ productId: 1 })
});
```

A missing or wrong token answers `403 INVALID_CSRF_TOKEN`. `@panomc/sdk` and the [typed client](../client/) fetch and send the token for you. `GET /auth/csrf` answers `401` when nobody is logged in: that is not an error, just log in first.

## 2. A browser on another address (allowed origins)

A page on `https://play.example.com` that calls Pano on `https://example.com`: add the page's origin in the panel under **Appearance -> Themes -> gear button (Site display settings)**: turn on "Allow other websites to access this Pano", which opens "Websites that may access this Pano" (or `PUT /api/v1/panel/frontend/origins`, 20 at most).

- Format `scheme://host[:port]`, no path, no wildcard. `https` unless `localhost` or an IP.
- It must share the registrable domain of your `website-url`. A different domain is refused (`ORIGIN_DIFFERENT_SITE`): use a front-end key instead.
- Allowed origins get CORS headers (`credentials: 'include'`, never `*`). Preflight answers `204`.
- Browsers may send `content-type`, `accept`, `x-csrf-token`, `x-requested-with`. No `Authorization` header from browsers.
- Any other origin gets no CORS headers on reads and `403 ORIGIN_NOT_ALLOWED` on writes.

## 3. A server (front-end key + session token)

A BFF, a custom front-end or any server that calls Pano for many visitors uses a **front-end key** (in the panel: "Site connection key"). Create it in **Appearance -> Themes -> gear button (Site display settings) -> Site connection keys -> Manage**. It is shown once, together with two `.env` lines:

```sh
PANO_API_URL=https://example.com/api
PANO_FRONTEND_KEY=pfk_...
```

| Header | Meaning |
|---|---|
| `X-Pano-Frontend-Key: pfk_...` | Identifies your server. Wrong key: `401 INVALID_FRONTEND_KEY`. |
| `X-Pano-Client-Ip: 203.0.113.9` | The visitor's address. Believed only with a valid key; otherwise `400 INVALID_CLIENT_IP`. |
| `Authorization: Bearer <sessionToken>` | The visitor's session, from the login answer. |

Keys work only while the front-end mode is not Theme (the "Site connection keys" row is hidden while the choice is "Theme"): in Theme mode a key cannot be created and a request with a stored key answers `403 FRONTEND_ACCESS_DISABLED`. Stored keys work again in `CUSTOM_APP`, `EXTERNAL` or `NONE`. Allowed origins work in every mode.

A key skips the origin check and has its own rate-limit buckets per visitor address. Password, captcha and 2FA rules run unchanged.

Login with a key answers a token in the body instead of cookies:

```sh
curl -s http://localhost:8088/api/v1/auth/login \
  -H 'X-Pano-Frontend-Key: pfk_...' -H 'X-Pano-Client-Ip: 203.0.113.9' \
  -H 'content-type: application/json' \
  -d '{"usernameOrEmail":"steve","password":"secret"}'
# {"sessionToken":"eyJ...","expiresAt":1790000000000}
```

Send that token as `Bearer` afterwards. No CSRF token is needed. Keep it in an `HttpOnly` cookie of your own site.

The token is a **site** session: it never works on the panel API (`403 SITE_TOKEN_NOT_ALLOWED`) and never as a cookie. Logging out, a ban or a password change ends it like any session.

## WebSocket ticket

Browsers cannot set headers on a WebSocket. Ask for a single-use ticket (30 seconds) and put it in the URL:

```sh
curl -s -X POST http://localhost:8088/api/v1/auth/ws-ticket -b jar -H 'X-CSRF-Token: ...'
# {"ticket":"...","expiresIn":30}
```

Open the socket with `?ticket=<ticket>`. A used or expired ticket answers `401 INVALID_WS_TICKET`. A BFF fetches the ticket with the visitor's Bearer token and hands it to the browser.

## Behind a reverse proxy

Pano reads the visitor address from `X-Forwarded-For` only from a trusted peer (`server.trusted-proxies`, plus loopback and private addresses). If every visitor looks like one address, the panel shows a banner with the exact line to add.
