# Server Management

Pano manages your Minecraft servers from the panel: console, players, plugins, files, backups,
schedules and power. It is built into Pano — nothing has to be installed on the Pano side.

It is available in the **Server management** and **Both** [usage modes](../configuration/#general-settings).
In **Website** mode it is turned off; linking a server through the plugin still works, and nodes that
are already paired keep their servers running until you switch back.

> ⚠️ Server management ships on the **alpha** channel first, together with matching
> `pano-mc-plugin` and `pano-node` releases. A stable installation may not have it yet.

## How a server is attached {#linked-and-managed-servers}

A server talks to Pano through the **Pano plugin**, a **node**, or both:

| | Pano plugin | Node |
| --- | --- | --- |
| What it is | The [Pano MC Plugin](../integrations/) inside the server | The [`pano-node`](pano-node/) daemon that runs the server's process |
| What it knows | TPS, MSPT, the real roster, loaded plugins | The process, its files and logs — even while it is stopped |
| Only it can | Measure TPS and MSPT, list every player | Start and kill the server, create and delete servers |

- A **linked** server has only the plugin: you run it, Pano talks to it.
- A **managed** server runs on a [node](managed-servers/). Pano installs the plugin into it as well,
  so it has both.

Each feature is served by whichever side can do it. When neither can, the page still opens, with
its controls disabled and a notice saying what is missing — install or update the plugin, start the
server, or bring the node back online.

## Linking a server

1. Put the [Pano MC Plugin](https://github.com/PanoMC/pano-mc-plugin/releases) jar for your platform
   into the server's `plugins/` (or `mods/`) folder and restart the server.
2. In the panel, open the **server switcher** in the top bar → **Add server** → **Link with the Pano
   plugin**, and run the command it shows in the server console:

   ```
   /pano connect <platform-address> <platform-code>
   ```

   The code rotates every 30 seconds.
3. Accept the request in the dialog.

`/pano status` (permission `pano.admin`) shows the connection from the server's side: the Pano
address, whether it is connected and for how long, the latency, the last heartbeat, the integrations
Pano turned on, and the plugin version.

**Add server** has two more options: **Create a new server** on a node — see
[Managed Servers](managed-servers/) — and **Link with the Pano Agent**, which hands a server you
already run to Pano without moving it — see [Pano Agent](pano-node/#pano-agent).

## Supported platforms

| | Paper · Folia · Purpur | Spigot | Velocity · BungeeCord | Fabric |
| --- | --- | --- | --- | --- |
| Console, kick, message | Yes | Yes | Yes | Yes |
| Restart | Yes | Yes | — | — |
| TPS / MSPT | Yes | TPS only | — | Yes |
| OP, gamemode | Yes | Yes | — | Yes |
| Toggle plugins in game | Yes | Yes | — | — |

Vanilla has no plugin, so it runs only as a managed server, with console and power from the node.
The Fabric mod needs Minecraft 26.1 or newer. Forge and NeoForge are not in the catalog yet. The plugin must speak **protocol 2**: an older one
still connects, but its pages stay disabled until you update it.

## Finding your way

- **Server** in the panel sidebar lists the pages of the selected server — see
  [Server Pages](server-pages/).
- **The server switcher** in the top bar changes the server, searches, and has **Add server**. A red
  **!** marks a server that crashed, or whose plugin, node or Pano Agent is too old for this Pano.
- **The node icon** next to it opens the Nodes page (needs **Manage Nodes**).

## Using Pano without a website

Choose **Server management** in the setup wizard, or later under **Settings → Platform →
Preferences** (the [`usage-mode`](../configuration/#general-settings) key). Pano then does not start
a theme, **Posts**, **Tickets** and **View** are turned off (existing posts and tickets are kept), and
public addresses redirect to the panel.

- Signed out, every panel address shows the panel's own **sign-in form** in place, and you stay on
  that page after signing in. `/panel/login` works too.
- Only accounts with **panel access** can sign in there. Two-step verification works when
  [Auth Guard](../../plugins/auth-guard/) asks for it.
- Signing out reloads the page and shows the form again.
- **Settings → Website** keeps only the **Panel name**; the website-only fields are hidden.

## Need help?

- Check the [FAQ page](../FAQ/)
- Ask on our [Discord community](https://discord.gg/6vVy72wgXT)
- Open an issue on [GitHub](https://github.com/PanoMC/Pano/issues)
