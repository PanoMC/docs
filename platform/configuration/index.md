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

# How this installation is used: "WEBSITE", "SERVERS" or "BOTH" (default: "BOTH")
usage-mode = "BOTH"

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
- `usage-mode`: how this installation is used. It is picked on the first screen of the setup wizard and can be changed any time in **Panel → Settings → Platform → Preferences** (three selectable boxes).
  - `"WEBSITE"`: website only — the classic Pano experience. Server management is turned off, pages and APIs alike. Linking a Minecraft server through the Pano MC Plugin still works, and nodes that are already paired keep their servers running.
  - `"SERVERS"`: Minecraft server management only — the panel is the product. **Posts**, **Tickets** and **View** (themes) are turned off, pages and APIs alike, and every public address redirects to `/panel`. Switching back brings them back without a restart; existing posts and tickets are kept.
  - `"BOTH"`: website + server management. This is the default, and existing installations are migrated to it — exactly their previous behaviour.
  - In `"SERVERS"` mode Pano does not start the theme process at all: signed-out visitors get [the panel's own sign-in form](../server-management/#using-pano-without-a-website) on any panel address, and only accounts with panel access can sign in. Switching the mode here starts or stops the theme without a restart.
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

## Local Node

```jsonc
local-node {
  enabled = true
  jar-path = null
  java-path = null
  stop-with-pano = false
}
```

**Details**

- The `pano-node` daemon Pano runs on **its own machine** — see [Adding a node →](../server-management/managed-servers/#adding-a-node).
- `enabled`: `false` stops Pano from starting a local node at all. Default **true**.
- `jar-path`: an explicit path to `pano-node.jar`, never replaced by Pano. Empty means Pano looks next to itself and in its working directory, and unpacks the copy bundled in its own jar there.
- `java-path`: a **Java 17+** home (or its `java` binary) for the daemon. Empty means Pano searches for one. Pano itself runs on Java 11, but the daemon needs 17.
- `stop-with-pano`: stop the daemon when Pano stops. Default **false**, so servers keep running across a Pano restart.

## Managed Servers

```jsonc
managed-servers {
  plugin-jar-dir = null
  node-auto-update = true
  accept-agent-links = true
}
```

**Details**

- Settings for servers Pano runs through a node — see [Server Management →](../server-management/#linked-and-managed-servers).
- `plugin-jar-dir`: a folder of locally built `pano-mc-plugin` jars to install instead of the published release. For plugin development only; leave it empty.
- `node-auto-update`: update nodes and [Pano Agents](../server-management/pano-node/#pano-agent) to Pano's own daemon version when they connect with an older one. Servers keep running. Default **true**. **Panel → Settings → Updates** changes the same key.
- `accept-agent-links`: accept new Pano Agent links. Default **true**. When `false`, no new agent can pair; linked agents keep working.

## Plugin Sources

```jsonc
plugin-sources {
  curseforge-api-key = null
}
```

**Details**

- The plugin sites a server's **Browse** tab searches — see [Plugins & Mods →](../server-management/server-pages/#plugins-and-mods).
- Modrinth and Hangar need no key.
- `curseforge-api-key`: your own key from [console.curseforge.com](https://console.curseforge.com) turns CurseForge on. Empty leaves it off.
