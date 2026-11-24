# Using Pano Behind Coolify or Traefik

[Coolify](https://coolify.io/) sends every site through its proxy, **Traefik v3**. Traefik v3 ends any request whose
body takes longer than **60 seconds** to arrive (`respondingTimeouts.readTimeout`). Pano itself has no size or time limit
on uploads, so this is the limit you hit: a 600 MB server archive over a 50 Mbit/s line takes about 100 seconds and is
cut off halfway, and the panel says the upload was interrupted. Downloads are not affected.

## Raise the read timeout

In Coolify, open **Servers → your server → Proxy**, add these two lines to the proxy's `command`, save and restart the
proxy:

```yaml
command:
  # … the existing lines stay …
  - '--entrypoints.http.transport.respondingTimeouts.readTimeout=6h'
  - '--entrypoints.https.transport.respondingTimeouts.readTimeout=6h'
```

Restarting the proxy interrupts every site on that server for a few seconds. Six hours covers multi-gigabyte uploads on
slow lines; a transfer that stops moving is still ended by Pano after five minutes without data.

With Traefik configured by hand, set the same value on the entry point Pano is served from, in the static configuration:

```yaml
entryPoints:
  websecure:
    transport:
      respondingTimeouts:
        readTimeout: 6h
```

## Need help?

- Visit the [FAQ page](../../FAQ/)
- Ask on our [Discord community](https://discord.gg/6vVy72wgXT)
- Open an issue on [GitHub](https://github.com/PanoMC/Pano/issues)
