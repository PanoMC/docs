# Server Management

Pano manages your Minecraft servers from the panel: a live console, the player list, plugins, power
buttons, metrics, files, backups and schedules. It is part of Pano core — nothing has to be
installed on the Pano side.

> ⚠️ Server management ships on the **alpha** channel first, together with matching
> `pano-mc-plugin` and `pano-node` releases. It reaches `beta` and stable in the usual order, so a
> stable installation may not have it yet.

## Linked and managed servers

A server can be attached to Pano in two ways, and they combine:

| | Linked server | Managed server |
| --- | --- | --- |
| Who runs it | You — your own machine, a game host, a container | Pano, through the [`pano-node`](pano-node/) daemon on a [node](nodes/) |
| How Pano reaches it | The [Pano MC Plugin](../integrations/) inside the server | The node owns the process |
| Start and Kill | — | Yes |
| Files, backups, schedules | When the plugin is new enough | Yes |

Pano installs the plugin into every server it creates, so a managed server is a linked server too
and gets both sets of features. Neither half is required: a server with only a node, or only the
plugin, is a full server in the panel. Each feature is served by whichever side can do it — see
[What Works With What](what-works-with-what/).

## Linking a server

1. **Install the plugin.** Put the jar for your platform from the
   [Pano MC Plugin releases](https://github.com/PanoMC/pano-mc-plugin/releases) into the server's
   `plugins/` (or `mods/`) folder and restart the server. See the
   [installation guide](../installation/#connecting-your-minecraft-server-optional).
2. **Run the connect command.** Open the **server switcher** in the panel's top bar and press
   **Add server**. Run the command it shows in the server console:

   ```
   /pano connect <platform-address> <platform-code>
   ```

   The code rotates every 30 seconds, so copy it fresh.
3. **Accept the request** in the dialog Pano opens, and give the server a display name if you like.

To let Pano create and run a server instead, set up a [node](nodes/) and
[create a server](creating-servers/). To hand a server you already run to Pano without moving it,
use the [Pano Agent](pano-agent/).

## Supported platforms

| | Paper · Folia · Purpur | Spigot · CraftBukkit | Velocity · BungeeCord | Fabric |
| --- | --- | --- | --- | --- |
| Console and commands | Yes | Yes | Yes | Yes |
| Stop / Restart | Yes | Yes | Stop only | Stop only |
| TPS | Yes | Yes | — | Yes |
| MSPT | Yes | — | — | Yes |
| Memory, CPU, player count | Yes | Yes | Yes | Yes |
| Roster, kick, message | Yes | Yes | Yes | Yes |
| OP / gamemode | Yes | Yes | — | Yes |
| Plugin / mod list | Yes | Yes | Read-only | Read-only |
| Enable / disable a plugin | Yes | Yes | — | — |

Proxies run no world, so they have no TPS, MSPT, OP or gamemode. Vanilla has no plugin module and
cannot be linked, but it can run as a managed server. Forge and NeoForge are not in the catalog yet.

The plugin must speak **protocol version 2**. An older plugin still connects: its sections open with
the controls disabled and an **Update pano-mc-plugin** notice. Update the jar and restart the server.

## The panel layout

Server management lives behind the **Server** pill in the panel sidebar, which lists the sections of
the server you are looking at.

- **The server switcher** in the top bar shows the selected server. Click it to search all servers
  or press **Add server**.
- **The node icon** next to it opens the [Nodes](nodes/) page. It is shown only with the **Manage
  Nodes** permission.
- **The pills follow the page:** addresses under `/panel/servers` show the server menu, everything
  else shows the site menu.

| Page | Address |
| --- | --- |
| Nodes | `/panel/servers/nodes` |
| Overview | `/panel/servers/<id>` |
| Console | `/panel/servers/<id>/console` |
| Players | `/panel/servers/<id>/players` |
| Files | `/panel/servers/<id>/files` |
| Plugins | `/panel/servers/<id>/plugins` |
| Backups | `/panel/servers/<id>/backups` |
| Schedules | `/panel/servers/<id>/schedules` |
| Settings | `/panel/servers/<id>/settings` |

Every address can be bookmarked and shared. A section the server cannot serve right now is still
listed: it opens with its controls disabled and a notice naming what is missing.

## Using Pano without a website

Pick **Server management** in the setup wizard, or later under **Settings → Platform →
Preferences** (the [`usage-mode`](../configuration/#general-settings) key), and Pano becomes a
server manager only:

- the panel has its own sign-in page at **`/panel/login`**, with two-step verification when
  [Auth Guard](../../plugins/auth-guard/) asks for it; **`/panel/logout`** signs out;
- Pano does not start the theme process at all, and old public addresses redirect to the panel;
- switching the mode starts or stops the theme without a restart.

## Need help?

- Check the [FAQ page](../FAQ/)
- Ask on our [Discord community](https://discord.gg/6vVy72wgXT)
- Open an issue on [GitHub](https://github.com/PanoMC/Pano/issues)
