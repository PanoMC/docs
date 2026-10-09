# Webhooks

Pano can tell another system when something happens: a player registers, a ticket is opened, a post goes live, an order is paid. You give Pano an address; Pano sends a signed `POST` to it.

Create one in the panel under **Settings -> Webhooks**: name, address, events, a secret (shown once). **Test** sends a ping immediately.

## Events

Names have the form `source.subject.verb`. The source is `core` or the plugin's short name.

| Event | When |
|---|---|
| `core.user.registered` | A player registers |
| `core.user.deleted` | A player is deleted in the panel |
| `core.ticket.created` | A ticket is opened |
| `core.ticket.replied` | A ticket gets a message (`staff` tells who wrote it) |
| `core.post.published` | A post becomes published |
| `core.test.ping` | You pressed **Test** |

Plugins add their own, for example `market.order.paid`, `market.order.refunded`, `market.subscription.renewed`, `market.shipment.shipped`. The panel lists every event with a sample.

Subscribe to exact names, to `core.*` or `market.*`, or to `*`. Wildcards never include `core.test.ping`.

Payloads carry no e-mail addresses, IP addresses or message texts.

## What you receive

```json
{
  "id": "6c1f1b0e-0d4b-3a5e-9b0e-2f5c7e1a9d11",
  "event": "core.post.published",
  "source": "core",
  "createdAt": 1790000000000,
  "apiVersion": 1,
  "site": { "name": "My server", "url": "https://example.com" },
  "data": { "id": 7, "title": "Hello", "url": "/post/hello", "categoryId": 1, "publishedAt": 1790000000000 }
}
```

New keys may be added later; never fail on one you do not know. `id` is stable for one event and one endpoint: use it to ignore repeats.

Headers: `X-Pano-Event`, `X-Pano-Event-Id`, `X-Pano-Delivery`, `X-Pano-Attempt`, `X-Pano-Signature`.

## Check the signature

`X-Pano-Signature` is `t=<unix seconds>,v1=<hex>` where `v1` is HMAC-SHA256 of `<t>.<raw body>` with your secret. Use the raw body, not parsed JSON. Reject a `t` more than 300 seconds old.

```js
import { createHmac, timingSafeEqual } from 'node:crypto';

export function verify(rawBody, header, secret) {
  const parts = Object.fromEntries(header.split(',').map((p) => p.split('=')));
  if (Math.abs(Date.now() / 1000 - Number(parts.t)) > 300) return false;
  const expected = createHmac('sha256', secret).update(`${parts.t}.${rawBody}`).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(parts.v1 ?? '');
  return a.length === b.length && timingSafeEqual(a, b);
}
```

Signing can be switched to none for endpoints you trust by other means. The Discord format sends an unsigned embed.

## Retries

Answer with any `2xx` within 10 seconds. Otherwise Pano retries, up to 8 attempts by default (1 to 20):

- Delay grows from 30 seconds, doubling, up to 6 hours, with a little jitter.
- `Retry-After` on `429` or `503` is respected (at most 1 hour).
- `410 Gone` stops at once. Redirects are not followed.
- After 50 failures in a row the webhook is switched off.

Pano refuses addresses that point inside its own network. For a local test receiver set `webhooks.allow-private-targets = true` in `config.conf` (ignored on hosted Pano).

## The log

Each delivery is kept with status (`PENDING`, `SENDING`, `SUCCEEDED`, `FAILED`, `DEAD`), attempts, answer and time. Open it in the panel to see the last response or to **redeliver** one. Finished entries are purged after 30 days. Up to 50 webhooks per site.
