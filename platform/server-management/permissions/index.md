# Permissions & Alerts

## Permissions {#permissions}

Set in **Panel → Permissions**, like every other permission.

| Permission | Node | Allows |
| --- | --- | --- |
| Manage Servers | `pano.panel.manage.servers` | See, link and remove servers; overview and settings |
| Manage Server Console | `pano.panel.manage.server.console` | Console and commands |
| Manage Server Power | `pano.panel.manage.server.power` | Start, stop, restart, kill |
| Manage Server Players | `pano.panel.manage.server.players` | Roster and player actions |
| Manage Server Plugins | `pano.panel.manage.server.plugins` | Plugins and mods |
| Manage Server Files | `pano.panel.manage.server.files` | File manager |
| Manage Server Backups | `pano.panel.manage.server.backups` | Backups and restores |
| Manage Server Schedules | `pano.panel.manage.server.schedules` | Schedules |
| Manage Server Startup | `pano.panel.manage.server.startup` | Memory, Java, port, JVM arguments |
| Create Servers | `pano.panel.create.servers` | Create, reinstall, change software |
| Manage Nodes | `pano.panel.manage.nodes` | Add, update, remove nodes |

**One server only:** every `pano.panel.manage.server.*` permission can be limited to some servers
with the **Which servers** list. Leave it empty for all servers.

**Forbidden commands:** a console permission can carry commands it may never send:

```jsonc
"denyCommands": ["op", "deop", "stop", "whitelist*"]
```

The first word is compared, case-insensitively; `*` matches the start. Accounts with `*` are never
blocked.

> Console access is operator access — grant it as carefully as OP, and limit it per server.

Every server's **Activity** tab lists who did what: commands, power and player actions, plugin and
file changes, backups and schedule runs. What Pano did by itself — a crash, a schedule run, an
automatic update — is shown as **System**. Actions are rate-limited per user and server — for example
10 commands per 10 seconds and 3 backups per 10 minutes.

## Alerts {#alerts}

| Alert | When |
| --- | --- |
| **Server crashed** | A server exited without being asked to. |
| **Node offline** | A node stopped answering. |
| **Backup failed** | A backup did not finish. |
| **Disk almost full** | A node's disk is over 90% full. |
| **Low TPS** | A server stayed under 15 TPS. |
| **Schedule failed** | A scheduled run ended with an error. |
| **Plugin updates** | Newer plugin builds are available (checked daily). |

Each alert becomes a panel notification for everyone who manages servers, and is not repeated for a
while. **Settings → Platform → Server alerts** turns each kind on or off and can also send it by
e-mail. A server's own **Settings → Alerts** can switch its server alerts on or off for that server
only.
