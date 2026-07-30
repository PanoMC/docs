# Configuration Guide

Pano uses a **HOCON** (Human-Optimized Config Object Notation) configuration file to manage its settings.  
HOCON is similar to JSON but easier to read — it supports comments, unquoted strings, and trailing commas.  
Learn more about it here:  
 [Lightbend HOCON Documentation](https://github.com/lightbend/config/blob/main/HOCON.md)

When Pano starts for the first time, it automatically generates a configuration file named **`config.conf`** in the same
directory as your **`Pano-<version>.jar`**.  
By default, Pano looks for this file using:

```kotlin
System.getProperty("pano.configFile", "config.conf")
```

This means you can specify a **custom configuration path** using the JVM parameter **`-Dpano.configFile`**, like this:

```bash
java -Dpano.configFile=/path/to/custom.conf -jar Pano-1.0.0.jar
```

If not specified, Pano will use the default `config.conf` in the same folder as the JAR file.

During the **installation process**, some values such as database information, admin credentials, and URLs are
automatically **written or overridden**.  
If you modify them manually, Pano may **overwrite** them during startup or future updates.  
Only edit what you understand and always make a backup before changing anything.

## Auto-Migrations

Every time Pano starts, it checks the **`config-version`** field within your configuration. If the version in the file is older than the current Pano version's requirements, Pano will **automatically perform necessary migrations**. This ensures your configuration and database remains compatible with the latest features and security updates without manual intervention.
## General Settings

```jsonc
# Configuration version used for migrations (DO NOT manually change)
config-version = <int>

# Enable or disable development mode (default: false)
development-mode = false

# Interface language code (added/edited through the admin panel)
locale = "en-US"

# The public URL of your website (required for emails, cookies, etc.)
website-url = "http://yourdomain.com"

# Allow users to select their preferred language (default: true)
allow-user-locale-selection = true

# The registration agreement shown to users (supports HTML)
register-agreement = ""

# Website name and description
website-name = ""
website-description = ""

# Support email used for notifications and password resets
support-email = ""

# Minecraft server information shown to players
server-ip-address = "play.ipadress.com"
server-game-version = "1.8.x"

# SEO keywords
keywords = []
```

**Tips**

- `config-version`: used internally for migrations — **do not rename or edit it**.
- `development-mode`: default is **false** for performance and security; set **true** only for debugging.
- `locale`: use short codes like `en-US` or `tr` (languages can be added in the panel).
- `website-url`: the base URL of your website. This is **mandatory** for generating system emails, managing session cookies, and other platform features.
- `allow-user-locale-selection`: enables/disables the ability for users to choose their own language from available locales (default: `true`). Can be managed in **Panel → Settings → Platform → Preferences**.
- `register-agreement`: defines the terms or rules shown during user registration. This field **supports HTML tags** for formatting.
- `server-ip-address`: visible in your theme — players can **copy and use it to join** your Minecraft server.

> Need to take the public site offline for a while? The `maintenance` block has its own page: [Maintenance Mode →](../maintenance/).
## Theme

```jsonc
current-theme = "vanilla-theme"
```

**Details**

- Defines which theme is active.
- If an invalid theme ID is used, **Pano falls back to `vanilla-theme`**.
- Can be changed via **Panel → View → Themes**.
## Minecraft Server Connection

```jsonc
mc-server-connection {
  heartbeat-interval-seconds = 25
  heartbeat-timeout-seconds = 75
}
```

**Details**

- Application-level WebSocket heartbeat that **Pano itself** sends to every connected Minecraft server
  (via `pano-mc-plugin`). This is separate from — and in addition to — the plugin's own
  `heartbeat-interval` / `heartbeat-timeout` in its **own** `config.conf`: both sides ping
  independently, each on its own schedule. See
  [Reverse Proxy WebSocket Keepalive](server/#reverse-proxy-websocket-keepalive) for how the two
  interact with a reverse proxy's idle timeout.
- `heartbeat-interval-seconds`: seconds between the heartbeat pings Pano sends to each connected
  Minecraft server. Default **25**.
- `heartbeat-timeout-seconds`: seconds without a pong before Pano considers that Minecraft server's
  connection dead and closes it. Default **75**.
- Both settings are validated at startup: `heartbeat-interval-seconds` must be greater than `0` and at
  most **55**; `heartbeat-timeout-seconds` must be at least **twice** the interval. A pair outside those
  bounds isn't rejected silently — Pano logs a warning and falls back to the default **25s** / **75s** for
  both values instead of failing to start. See
  [Reverse Proxy WebSocket Keepalive](server/#reverse-proxy-websocket-keepalive) for the plugin side's
  own (slightly stricter) rule.
