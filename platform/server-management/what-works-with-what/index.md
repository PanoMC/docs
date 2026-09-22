# What Works With What

A Minecraft server can be attached to Pano in three ways, and each of them brings its own abilities:

- **A node and nothing else.** The [`pano-node`](../pano-node/) daemon installed the server and owns
  its process, so it can start it, kill it, read its files and archive it while it is stopped — but
  it stands outside the game and knows nothing about ticks, worlds or who is playing. A server like
  this has no Pano plugin in it at all.
- **The Pano plugin and nothing else.** The plugin runs *inside* the server, so it knows the TPS, the
  real roster and which plugins actually loaded — but it cannot start a server that is not running,
  and it cannot overwrite the files it is executing from. This is a
  [linked server](../#what-a-linked-server-is): you run it, Pano talks to it.
- **Both**, which is the normal case for a server Pano created: a node installs the Pano plugin into
  every server it builds, so a [managed server](../#managed-servers) is a linked server as well.

None of the three is a lesser mode. Every feature is served by **whichever side can do it best**, and
where only one side can do something at all, that side does it. Pano works this out feature by
feature and server by server, so the panel never asks "is this server managed?" — it asks what this
particular server can do right now.

> ⚠️ Like the rest of server management, this ships on the **alpha** channel first, together with the
> matching `pano-mc-plugin` and `pano-node` releases. It reaches `beta` and then stable in the usual
> order.

## Console

| | Node only | Plugin only | Both |
| --- | --- | --- | --- |
| **Live stream** | Everything the process prints, from the first line of the boot log to the stack trace it dies on | The server's own log, captured from inside the game as soon as the plugin loads | **Node**, with the plugin's lines merged in — so nothing that happens before the plugin loads is missed |
| **History and Load older** | Read from `logs/latest.log` and the rotated `logs/*.log.gz` beside it, whether the server is running or not | Read from the same files by the plugin, on demand, and only while the server is online. Nothing is held in memory for it | **Node**, because it can read the log of a server that is stopped |
| **Command input** | Written straight to the process's standard input | Dispatched to the server's console sender from inside the game | **Node** — unless it has no input to write to, which is the case for an [adopted server](../#adopted-servers); then the plugin sends it |

Both sides page the same way: each press of **Load older** reads another window further back in the
log files, and the button disappears when they run out. See [Console](../#console) for the rest —
the flood protection, the rate limit and what a BungeeCord proxy cannot do.

## Power

| | Node only | Plugin only | Both |
| --- | --- | --- | --- |
| **Start** | **Node.** | — A plugin cannot start a server that is not running; there is nothing there to ask. | **Node.** |
| **Stop** | The node writes the stop command, then terminates the process, then kills it | The plugin shuts the server down through its own platform API | **Node**, which can follow through when the server ignores the polite request |
| **Restart** | A stop followed by a start | Only where the platform has restart support of its own — Paper and Spigot with a working `restart-script`; elsewhere it stops the server and says so | **Node** |
| **Kill** | **Node.** | — Nothing inside a hung JVM can kill it. | **Node.** |

## Metrics and players

| | Node only | Plugin only | Both |
| --- | --- | --- | --- |
| **TPS and MSPT** | — Nothing outside the JVM can measure a tick. | **Plugin.** | **Plugin.** |
| **Memory** | The process's resident memory — the whole JVM as the operating system sees it | The JVM heap, used and maximum | **Plugin** for the heap, with the node's process figures beside it |
| **Process CPU, host CPU / RAM / disk** | **Node.** | — | **Node.** |
| **Player count** | From a **server list ping** to the server's own port — the same query the multiplayer list uses | Exact, from inside the game | **Plugin** |
| **Roster** | The ping's sample: the count is exact, but it returns **at most 12 names** and a server may return none at all | The full list, with UUID, ping and session length | **Plugin** |
| **Player actions** (kick, message, OP, gamemode, whitelist) | Pano composes the same console commands it would hand the plugin and sends them through the node's input | The plugin kicks and messages directly, and runs the rest as console commands | **Plugin** |

A roster that came from a server list ping is labelled as such on the players page, because a
partial list of names is worth having as long as nobody mistakes it for the whole roster.

## Plugins and mods

| | Node only | Plugin only | Both |
| --- | --- | --- | --- |
| **The list** | Scanned out of the jars in `plugins/` (or `mods/`): `plugin.yml`, `paper-plugin.yml`, `velocity-plugin.json`, `bungee.yml`, `fabric.mod.json`, `quilt.mod.json` and `META-INF/mods.toml` | What the running server reports — the loaded truth, with authors, descriptions and whether each one is enabled | **Plugin** while the server is online, **node** while it is stopped |
| **Enable / disable** | Renames `x.jar` to `x.jar.disabled` and back, which takes effect on the next restart | Bukkit family only: enabled or disabled in the running server, right away | **Plugin** |
| **Install from Modrinth, Hangar or CurseForge** | **Node.** | Needs the plugin's `plugin-install` capability | **Node** |
| **Identify unknown jars, check for updates** | **Node.** | Needs `plugin-install` | **Node** |

> A **Vanilla** server has no plugin folder at all, so this whole group is unavailable on one no
> matter what is attached to it.

Whichever side installs a file, nothing is loaded into a running server by copying a jar into it, so
the usual **Restart required** notice follows — see [Plugins and mods](../#plugins-and-mods).

## Files, backups and schedules

| | Node only | Plugin only | Both |
| --- | --- | --- | --- |
| **Files** — browse, read, edit, upload, download | **Node**, inside that one server's directory | Needs the plugin's `files` capability: it serves the directory of the server it is running in, with the same sandbox and the same denylist | **Node** |
| **Backups** — create, list, delete | **Node**, into `<node-data>/backups/<server-uuid>/` | Needs `backups`: the archive is written beside the server, and **Keep the last N** prunes it exactly the same way | **Node** |
| **Restore a backup** | Immediately, with the server stopped | **On the next start** — see below | **Node**, which restores immediately |
| **Schedules** — restart, command and backup tasks on a cron | The node runs them, so they keep firing while Pano itself is restarted | The plugin runs them when there is no node to do it | **Node** |

### A restore the plugin does happens on the next start

A plugin cannot overwrite the files of the server it is running inside — it would be pulling the
floor out from under itself, and the worlds it replaced would be written back over by the server
that is still holding them open. So a restore on a plugin-only server is a two-step affair: the
plugin writes a marker file, `.pano/restore-pending.json`, and replies that the restore is pending.

The panel shows the task as **applies on the next start** until it has happened. When somebody next
boots that server, the plugin applies the archive before the worlds are loaded, deletes the marker
and reports the result as soon as it has reconnected to Pano — at which point the task finishes,
successfully or with the error it hit. A node restores immediately instead, with the server stopped,
which is why a server with a node behind it always uses the node for this.

## How Pano picks a side

Every server carries a **features** map, and it is that map — not "linked" or "managed" — that the
panel and the API both go by. Pano recomputes it whenever anything that feeds it changes: a node
connecting or going away, the Pano plugin connecting or disconnecting, the server starting or
stopping, or the plugin announcing a different set of capabilities after an update. The panel is
told about the new one over the same realtime connection it already has, so a control becomes
available the moment the thing it needed arrives.

The rule for each feature is **plugin first where the plugin does it better, node otherwise**:

- the **plugin** is preferred wherever the answer has to come from inside the running game — TPS,
  MSPT, the heap, the real roster, player actions, and the list of plugins that actually loaded;
- the **node** is preferred wherever the job is about the machine rather than the game — starting
  and killing a process, reading the log of a stopped server, files, backups, plugin installs and
  running schedules — and it is also the fallback whenever the plugin is missing, too old, or
  switched off;
- a handful of things have only one possible source and are simply unavailable without it: **Start**
  and **Kill** need a node, **TPS** and **MSPT** need the plugin.

An endpoint uses the same answer as the panel. Asking Pano to do something the current setup cannot
do is refused with an explicit "this feature is unavailable here" rather than silently doing nothing.

## What a missing feature looks like

**Navigation is never hidden.** A section whose features are all unavailable is still listed, still
opens, and says on the page what is missing — a page that quietly vanishes only leaves people
hunting for it. Individual controls inside a page are disabled the same way, each with a tooltip
naming what would bring it back:

| What it says | What to do |
| --- | --- |
| Neither the node nor the Pano plugin can do this right now. | Attach one of the two — install the [Pano MC Plugin](../../integrations/) in the server, or put it on a node. |
| The Pano plugin on this server is too old for _the section_. Update pano-mc-plugin on the server. | Update `pano-mc-plugin` on the game server and restart it. |
| The Pano plugin on this server does not provide _the section_. Turn it on in the plugin's config or update the plugin. | Enable it in the plugin's `config.conf` on the game server (or update `pano-mc-plugin` if it predates the feature) and restart the server. |
| The node that runs this server is offline, so Pano cannot do this until it reconnects. | Bring the [node](../#nodes) back; nothing else is needed. |
| The server is not running, so nothing inside it can answer. Start it to use this. | Start it. Anything that has to ask the running game needs it running. |

## An outdated plugin simply does less

The Pano plugin announces what it can do the moment it connects: its protocol version, its own
version and a list of **capabilities**. In current builds that list is

```
console, commands, power, metrics, players, plugins, files, backups, plugin-install, schedules
```

An older plugin announces fewer of them — an older one still announces none at all — and everything
it leaves out simply falls back to the node, if there is one. Nothing breaks and nothing has to be
reconfigured: updating the jar on the game server and restarting it is all it takes for the features
to come back to the better source. The server's overview page lists the capabilities it announced,
next to the protocol and plugin version Pano sees.

The same tolerance applies to the node: Pano accepts a daemon that speaks an older
[protocol version](../pano-node/#protocol-version) and leaves out what that version cannot do.

## Need help?

- Check the [FAQ page](../../FAQ/)
- Ask on our [Discord community](https://discord.gg/6vVy72wgXT)
- Open an issue on [GitHub](https://github.com/PanoMC/Pano/issues)
