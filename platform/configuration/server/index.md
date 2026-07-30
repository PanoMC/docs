# Server Configuration

## Server Settings

```jsonc
server {
  host = "0.0.0.0"
  http-port = 80
  https-port = 443
  ssl-mode = "DISABLED" # "DISABLED", "LETS_ENCRYPT", "MANUAL"
  redirect-https = false
  ssl-cert = null # Raw certificate content (if MANUAL)
  ssl-key = null  # Raw private key content (if MANUAL)
  ui-max-memory-mb = 200 # Max MB per spawned UI runtime (setup-ui, panel-ui, theme); 0 disables
  trusted-proxies = [] # e.g. ["127.0.0.1", "10.0.0.5"] — proxies allowed to set X-Forwarded-For
}
```

- `host`: `0.0.0.0` makes the panel accessible to external networks; `127.0.0.1` restricts access to local only.
- `http-port`: Default port for HTTP traffic (usually **80**).
- `https-port`: Default port for HTTPS traffic (usually **443**).
- `ssl-mode`:
    - `DISABLED`: No HTTPS server will be started.
    - `LETS_ENCRYPT`: Automatically attempts to obtain and configure an SSL certificate. **Note:** For this to work, a valid `website-url` must be configured, **http-port** must be set to `80`, and **https-port** must be set to `443`.
    - `MANUAL`: Allows you to provide your own certificate and key strings directly via `ssl-cert` and `ssl-key`.
- `redirect-https`: If set to `true`, all HTTP traffic will be automatically redirected to HTTPS.
- `ui-max-memory-mb`: Memory ceiling (MB) for **each** spawned UI runtime (setup-ui, panel-ui, active theme); Pano restarts a UI that exceeds it. Default **200**, `0` disables. See [Memory & Limits](../memory/).
- `trusted-proxies`: IP addresses of reverse proxies allowed to set `X-Forwarded-For`. **Empty by default**, which means the header is ignored and every request is treated as a direct connection. Fill it in when Pano sits behind Nginx, Apache or Cloudflare, otherwise features that identify a visitor by address — such as [maintenance mode](../../maintenance/) login bans — see the proxy instead of the visitor.
- **Advanced:** For complex setups, you can still use a **reverse proxy** (Nginx, Apache) or Cloudflare.
## Reverse Proxy WebSocket Keepalive

Every Minecraft server connected through **pano-mc-plugin** holds a long-lived WebSocket to
`GET /api/server/connection`. Behind a reverse proxy (Nginx, Cloudflare, a cloud load balancer), an idle
WebSocket gets closed by the *proxy's* idle timeout — Nginx's `proxy_read_timeout` defaults to
**60 seconds** — long before Pano or the plugin would ever give up on it. The plugin's reconnect logic
hides the symptom by reconnecting automatically, but every reconnect re-runs the full RSA/AES key
exchange, so a connection that looks perfectly healthy is quietly burning CPU, filling the log with
reconnects, and opening a short window where an in-flight message can be lost.

To prevent this, **both sides** ping — the plugin sends WebSocket **ping** frames to Pano, and Pano
sends its own **ping** frames back to the plugin, each independently and on its own schedule; either
side answers the other's pings with a **pong** automatically at the WebSocket protocol level. This is
protocol-level keepalive that sits outside the message encryption layer and never touches the
AES-256-GCM payload. The two directions are governed by two *separate* configs, one per side:

- The **plugin's** ping — two settings in the **plugin's own** `config.conf` (in the Pano plugin's data
  folder on the Minecraft server — not Pano's own config shown elsewhere on this page):
    - `heartbeat-interval`: seconds between pings. Default **25**.
    - `heartbeat-timeout`: seconds to wait for a reply before the connection is treated as dead and the
      plugin reconnects. Default **75**.
    - Validated at startup: `heartbeat-interval` must be greater than `0` (no upper bound);
      `heartbeat-timeout` must leave room for both a full two intervals *and* a 10-second
      close-handshake budget — i.e. `heartbeat-timeout ≥ (2 × heartbeat-interval) + 10`. An
      out-of-range pair doesn't stop the plugin from loading — it logs a warning and falls back to the
      default **25s** / **75s** for both values.
- **Pano's own** ping — the `mc-server-connection` block in Pano's own `config.conf`, see
  [Minecraft Server Connection](../#minecraft-server-connection):
    - `heartbeat-interval-seconds`: seconds between the pings Pano sends to each connected Minecraft
      server. Default **25**.
    - `heartbeat-timeout-seconds`: seconds without a pong before Pano considers that connection dead
      and closes it. Default **75**.
    - Validated at startup: `heartbeat-interval-seconds` must be greater than `0` and at most **55**;
      `heartbeat-timeout-seconds` must be at least **twice** the interval. An out-of-range pair doesn't
      stop Pano from starting — it logs a warning and falls back to the default **25s** / **75s** for
      both values.

The heartbeat only helps if your proxy's own idle timeout is longer than the **shorter** of the two
intervals above. If you run Nginx in front of Pano, raise the timeout **on the WebSocket location
only** — raising it on the whole `server` block also changes how long Nginx waits on ordinary HTTP
requests, which you usually don't want. Repeat the full set of `proxy_set_header` directives inside
this location too: directives of the same name at a lower level **replace** the whole inherited set
instead of adding to it, so a location that only sets `Upgrade`/`Connection` silently drops any `Host` /
`X-Real-IP` / `X-Forwarded-For` configured above it — Pano would then record every connected Minecraft
server's address as the proxy's own IP, quietly breaking the `trusted-proxies` guidance further up this
page:

```nginx
location /api/server/connection {
    # Replace 8080 with your own server.http-port from config.conf — do NOT reuse 80 here even
    # though that's the default: in this exact setup Nginx itself is listening on 80, so proxying
    # back to 127.0.0.1:80 loops back into Nginx instead of reaching Pano.
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";

    proxy_read_timeout 90s;
    proxy_send_timeout 90s;
    proxy_socket_keepalive on;
}
```

90 seconds leaves the 25-second default heartbeat on either side plenty of margin before Nginx would
otherwise cut an idle socket.

> Cloudflare and most cloud load balancers enforce the same class of idle timeout on proxied connections —
> see [Using Pano Behind Cloudflare](../../advanced/cloudflare/#idle-timeouts-on-cloudflare-and-load-balancers).
## Initialization, UI, and Updates

```jsonc
init-ui = true
accept-plugin-auth = true
jwt-key = "<auto-generated-base64>"
update-period = "ONCE_PER_DAY" # "ONCE_PER_DAY" or "ONCE_PER_WEEK" or "ONCE_PER_MONTH"
release-channel = "RELEASE" # "ALPHA", "BETA", "RELEASE"
console-history-limit = 50
```

**Details**

- `init-ui`: launches the **setup wizard, panel, and theme engine** at startup.
- `accept-plugin-auth`: enables/disables the connection of the Pano MC plugin (default: `true`). Can be managed from the **Connect Server** modal. For better security, disable it if not in use.
- `jwt-key`: auto-generated **Base64 authentication key** — **do not modify manually**.
- `update-period`: defines update-check frequency.
- `release-channel`: determines which update stream Pano follows:
    - `ALPHA`: Early access to new features. High risk of bugs and breaking changes.
    - `BETA`: Pre-release features with lower risk than Alpha, but may still contain bugs.
    - `RELEASE`: Most stable version. Receives updates less frequently but ensures maximum reliability.
- `console-history-limit`: defines the maximum number of commands to store in the terminal and GUI console history (default: `50`, set to `0` to disable).
## File Uploads and Paths

```jsonc
file-uploads-folder = "file-uploads"

file-paths = {
  favicon {
    path = "uploads/favicon.png"
    hash = "<sha256-hash>"
  }
  websiteLogo {
    path = "uploads/logo.png"
    hash = "<sha256-hash>"
  }
}
```

**Notes**

- Controlled by **Panel → Settings → Website**.
- Each entry is a **FileInfo** object containing:
    - `path`: Relative path to the file.
    - `hash`: SHA-256 hash used by Pano to verify file integrity.
- Only supports two entries: `favicon` and `websiteLogo`.
- These fields are **automatically managed by Pano** — manual edits are overwritten on updates or settings changes.
## Pano Service URLs (Do Not Modify)

```jsonc
pano-api-url = "..."     # auto-set based on environment
pano-website-url = "..."
```

- These are managed by Pano automatically.
- Changing them can break connectivity with the Pano ecosystem.
## Setup Progress (Internal)

```jsonc
setup {
  step = 0
}
```

**Usage**

- Tracks installation progress.
- Always **stop Pano before editing**.
- `step = 0`: restarts the setup wizard.
- `step = 5`: marks setup as complete.
- Only modify if instructed by support; improper edits may cause broken installations.
