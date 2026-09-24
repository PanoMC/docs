# Server Pages

Every server has these pages under **Server** in the panel sidebar. Each page needs its own
permission — see [Permissions & Alerts](../permissions/).

## Console {#console}

- Opens on the **last 500 lines**; **Load older** reads further back from the server's log files. A
  managed server's history can be read even while it is stopped, a linked server's only while it is
  online.
- **Find** searches every log file the server kept (up to 5,000 matches).
- <kbd>Enter</kbd> sends a command, <kbd>↑</kbd> / <kbd>↓</kbd> browse your history. Every command
  is shown with its sender — `[Pano:admin] > say hello` — and at most 10 can be sent per 10 seconds. A
  stopped managed server takes no commands.
- Output is plain text. A server printing more than 500 lines a second has the extra lines dropped
  and marked.
- `console.enabled = false` in the plugin's `config.conf` turns console capture off for that server.

## Players {#players}

The live roster: name, UUID, ping, game mode and OP / whitelist badges, with **kick**, **message**,
**OP**, **gamemode**, **whitelist** and **ban**. Pano builds the commands itself from the stored
username, never from what is typed into the panel.

- **Ban:** a player with a Pano account gets a Pano ban — signed out of the website and refused by
  every server with ban integration (see [Ban Management](../../integrations/ban-management/)). Anyone
  else goes on the server's own ban list.
- Proxies have no OP or gamemode.
- Without the plugin, a node pings the server instead: exact player count, up to 12 names.

## Power {#power}

| | Linked server | Managed server |
| --- | --- | --- |
| **Start** | — | Yes |
| **Stop** | The plugin stops the server; nothing starts it again | Stop command, then terminate, then kill |
| **Restart** | Only with Paper / Spigot's `restart-script` | Stop, then start |
| **Kill** | — | Yes — nothing is saved |

A managed server can **Start with Pano** and **Restart after a crash** (with a growing delay, up to
10 minutes). Restarting or updating a node does not stop its servers: they keep running and show an
*adopted* badge. An adopted server takes commands through the plugin and is not restarted
automatically after a crash.

## Metrics {#metrics}

The plugin sends TPS, MSPT, heap, CPU and the player count every 10 seconds; the chart covers the
last hour up to 30 days. A node adds the process's CPU and memory and the host's CPU, RAM and disk.
Proxies report no TPS or MSPT, and Spigot no MSPT.

## Plugins & mods {#plugins-and-mods}

- **Installed** lists what the server loaded plus the jars in its folder; new ones show **Not
  loaded**. Each jar has an on / off switch: on a managed server the node renames it to
  `.jar.disabled` and the change applies on the next start (**Restart required** shows until then);
  a linked server without a node switches it in game, on Paper, Spigot, Folia and Purpur only. The
  Pano plugin cannot be switched off.
- **Upload** adds `.jar` files (up to 256 MB each) to `plugins/`, or `mods/` on modded servers.
- **Browse** opens on the most downloaded plugins and searches **Modrinth**, **Hangar** and
  **CurseForge**, filtered to this server's loader and version, with a **Compatible** or **May not
  fit** badge. CurseForge needs your own key in
  [`plugin-sources`](../../configuration/#plugin-sources).
- **Updates:** plugins installed through Pano show their source and **Update available**; **Update
  all** does them at once. **Identify sources** recognises other jars by their hash (Modrinth and
  CurseForge). A daily check raises a *Plugin updates* alert unless the server's **Automatic update
  check** is off.

## Files {#files}

A file manager for the server's folder: browse, edit (files up to 256 KB), preview media, create,
rename, delete, extract `.zip`, change permissions, upload (up to 1 GB) and download files or whole
folders as a zip. Files that hold credentials are hidden, and nothing outside the folder can be
reached.

## Backups {#backups}

- **Full** writes one `.zip`; **Snapshot** stores only what changed since the last one. Choose
  **Everything**, **Worlds only** or **Custom** paths, and patterns to **Leave out**.
- A running server is saved to disk first, so the backup is consistent.
- **Restore** needs the server stopped and your password. The current worlds are saved to a
  `pre-restore-…` backup first. With only the plugin, the restore happens on the next start.
- By default the newest 10 full backups and 24 snapshots are kept. **Pinned** backups are never
  removed.

> Backups live on the node (or beside the server). Deleting a managed server or its node deletes its
> backups too — download the ones you want to keep.

## Schedules {#schedules}

A schedule is a cron expression, a time zone and a list of tasks: **Restart** / **Stop**, a
**Command** or a **Backup**. Players are warned before a stop or restart (5 minutes by default).
**Run now** fires it at once. Schedules are run by the node, so they keep working while Pano
restarts; without a node the plugin runs them.
