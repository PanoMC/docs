# Using Pano Behind Cloudflare

If you're routing traffic to your Pano installation through **Cloudflare**, you'll need a couple of adjustments — otherwise you may see redirect loops, `521`/`525`/`526` errors, or "this page isn't redirecting properly" messages right after the setup wizard finishes.

This guide assumes you have already added your domain to Cloudflare and pointed an `A` (or `AAAA`) record to the server running Pano, with the proxy (orange cloud) **enabled**.

## SSL/TLS mode must be Flexible

By default, Pano serves plain HTTP on port **80** and does **not** terminate TLS on the origin. If Cloudflare's encryption mode is set to **Full** or **Full (strict)**, Cloudflare tries to reach your origin over HTTPS — which Pano isn't listening for — and the request fails.

Set the encryption mode to **Flexible**:

1. Open the [Cloudflare dashboard](https://dash.cloudflare.com/) and select your site.
2. Go to **SSL/TLS → Overview** (on newer dashboards: **SSL/TLS → Configuration**).
3. Set the encryption mode to **Flexible**.

With Flexible mode:

- Browser ⇄ Cloudflare is encrypted (HTTPS).
- Cloudflare ⇄ Pano is plain HTTP on port **80**.

> [!WARNING]
> Flexible mode means traffic between Cloudflare and your server is **not** encrypted. If your server is on a public network and handles sensitive data, prefer terminating TLS on the origin (via a reverse proxy like Nginx or Caddy with a Let's Encrypt certificate) and use **Full (strict)** instead. See [Production Setup](../../configuration/production/).

## Configure `website-url` with `https://`

Even though Pano itself runs on HTTP, end users access your site over HTTPS through Cloudflare. Make sure your `website-url` reflects this — otherwise password-reset / verification emails will send `http://` links, redirect loops can appear, and browsers may flag mixed content as insecure.

Edit `config.conf`:

```jsonc
website-url = "https://yourdomain.com"
```

Save and **restart Pano** after changing this value.

## Recommended Cloudflare settings

In **SSL/TLS → Edge Certificates**:

- **Always Use HTTPS:** **On** — redirects any `http://` request to `https://` at Cloudflare's edge.
- **Automatic HTTPS Rewrites:** **On** — rewrites mixed-content `http://` links inside pages served through Cloudflare.

In **Rules → Page Rules** (or **Cache Rules** on newer dashboards): if you enable aggressive caching, exclude the admin panel and API paths so dynamic responses are never served from cache.

## Verifying

After applying the settings:

1. Wait a minute or two for Cloudflare to propagate the change.
2. Open your domain in a private/incognito browser window.
3. You should see a valid Cloudflare-issued HTTPS certificate.
4. Pano should load without a redirect loop, and password-reset emails should contain `https://` links.

## When not to use Flexible mode

If you need true end-to-end encryption (recommended for production deployments handling user data), don't use Flexible. Instead:

1. Put a reverse proxy (Nginx, Caddy, Traefik) in front of Pano with a valid TLS certificate (Let's Encrypt works well).
2. Set Cloudflare's encryption mode to **Full (strict)**.
3. Keep `website-url = "https://..."` in `config.conf`.

This way Cloudflare ⇄ Origin is also encrypted and certificate-validated.

## Need help?

- Visit the [FAQ page](../../FAQ/)
- Ask on our [Discord community](https://discord.gg/6vVy72wgXT)
- Open an issue on [GitHub](https://github.com/PanoMC/Pano/issues)
