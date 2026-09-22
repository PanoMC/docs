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
  - `"WEBSITE"`: website only — the classic Pano experience.
  - `"SERVERS"`: Minecraft server management only — the panel is the product. The sidebar hides **Posts**, **Tickets** and **View**, and every public address redirects to `/panel`.
  - `"BOTH"`: website + server management. This is the default, and existing installations are migrated to it — exactly their previous behaviour.
  - In `"SERVERS"` mode Pano does not start the theme process at all: the panel has [a sign-in page of its own](../server-management/#signing-in-without-a-website) at `/panel/login`. Switching the mode here starts or stops the theme without a restart.
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

- Controls the `pano-node` daemon Pano can run on **its own machine**, set up with one button in
  **Panel → Servers → Nodes → Local node**. The daemon is what installs and supervises *managed*
  Minecraft servers; see [Server Management →](../server-management/).
- The daemon always runs as a **separate process**, never inside Pano's own JVM — that is the
  point: restarting or updating Pano must not take the Minecraft servers it manages offline.
- `enabled`: set to `false` to stop Pano from spawning or supervising a local node at all. The
  panel then reports the local node as disabled. Default **true**.
- `jar-path`: explicit path to `pano-node.jar`. Leave empty and Pano looks next to its own jar and
  in its working directory, and otherwise downloads the `pano-node.jar` published with the Pano
  release it is running, verifying it against the `pano-node.jar.sha256` published beside it.
- `java-path`: the Java **17 or newer** home (or the `java` binary inside one) the daemon is
  started with. Leave empty and Pano searches for one: the JVM it is running on itself,
  `JAVA_HOME`, `/usr/lib/jvm`, `/Library/Java/JavaVirtualMachines`, the usual `C:\Program Files`
  locations, and `java` on `PATH` — then picks the newest it found. This is a separate setting
  because **Pano itself runs on Java 11+ while `pano-node.jar` needs 17+**: on a Java 11 host,
  handing the daemon Pano's own JVM makes it die with `UnsupportedClassVersionError` every time it
  is started. If nothing suitable is found, setting up the local node fails with a readable error
  instead of retrying forever, and **Panel → Servers → Nodes** shows the reason.
- `stop-with-pano`: whether the daemon is stopped when Pano stops. Default **false**, which leaves
  managed servers running across a panel restart — an operator restarting Pano is not asking for
  their players to be disconnected. Set it to `true` only if you want everything to go down
  together.
## Managed Servers

```jsonc
managed-servers {
  plugin-jar-dir = null
  node-auto-update = true
  accept-agent-links = true
}
```

**Details**

- Settings for the Minecraft servers Pano installs and runs through a node — see
  [Managed servers →](../server-management/#managed-servers).
- Pano installs the **Pano MC Plugin** into every managed server it creates, so that a server it
  runs is also a server it can talk to. By default it uses the newest published plugin release.
- `plugin-jar-dir`: a directory holding locally built `pano-mc-plugin` jars to use **instead of**
  downloading them. Point it at a `pano-mc-plugin` checkout and the newest
  `<module>/build/libs/pano-<platform>-*.jar` found there is copied into every server Pano installs.
  This is a **plugin development** setting; leave it empty on a real installation and Pano takes the
  newest published release.
- `node-auto-update`: whether Pano updates a node's `pano-node` daemon — and every **Pano Agent** —
  to the one it serves itself as soon as the node connects running an older one. Default **true**.
  The node downloads the new daemon from Pano, verifies its checksum and restarts; the Minecraft
  servers keep running. Pano tries at most **once per node and version every 30 minutes**, never
  while the node is running a task (an install, an import, a backup — it looks again every 5
  minutes), and records each automatic update in the activity log. Set it to `false` to update nodes
  only by hand from **Panel → Servers → Nodes**. **Panel → Settings → Updates** writes this same key.
- `accept-agent-links`: whether Pano accepts new **Pano Agent** links — the switch in the
  **Link with the Pano Agent** dialog writes this same key. Default **true**. When `false` the dialog
  hands out no code, every code it already showed stops working at once, and an agent that tries to
  pair with one is refused exactly like a wrong code. Agents that are already linked keep working,
  and pairing a node with the node code is not affected. See
  [The Pano Agent →](../server-management/pano-node/#the-pano-agent).
## Plugin Sources

```jsonc
plugin-sources {
  curseforge-api-key = null
}
```

**Details**

- Where the panel searches for plugins and mods to install on a managed server — the **Browse** tab
  of a server's plugins page. See [Plugins and mods →](../server-management/#plugins-and-mods).
- **Modrinth** and **Hangar** need no key and are always on. Nothing has to be configured for them.
- `curseforge-api-key`: a **CurseForge Eternal API key** enables the CurseForge source. CurseForge
  requires every application to use its own key, so Pano cannot ship one — request one at
  [console.curseforge.com](https://console.curseforge.com) and paste it here. Default **empty**,
  which leaves the source switched off: the panel lists CurseForge as unavailable with the reason
  and searches the other two.
- A CurseForge project whose author disallowed third-party downloads offers no files at all. It is
  still listed, but nothing can be installed from it — download it from CurseForge and upload the
  jar through the [file manager](../server-management/#files) instead.
