# Server Management Plugin

::: warning Retired — server management is now part of Pano core
The **Server Management** plugin never shipped a working feature and has been retired. Everything it
was meant to do — the in-panel console, start/stop control and player management — is built into
**Pano itself**, so there is nothing to install.

**→ [Server Management](../../platform/server-management/)**
:::

## What happened

Server management was originally planned as an optional plugin. It stayed an empty scaffold: it
registered no panel pages, API endpoints, settings or permissions. Rather than ship it as an add-on
that every server owner would have to find and install, the features were built into the platform,
where they can use the existing Minecraft server connection directly.

The `pano-plugin-server-management` repository is archived and its plugin is not published. If you
ever installed it, you can safely delete the jar from your `plugins/` folder — it does nothing.

## Where the features live now

Connect a Minecraft server with the [Pano MC Plugin](../../platform/integrations/) and open
**Panel → Servers**. Each server gets:

- **Console** — the live server log with a command input.
- **Players** — the online roster with kick, message, OP, gamemode and whitelist actions.
- **Plugins** — the installed plugin and mod list, with enable/disable on Bukkit-family servers.
- **Power** — stop and restart.
- **Metrics** — TPS, MSPT, memory, CPU and player history.
- **Files**, **Backups** and **Schedules** — the server's own directory, its archives and cron
  tasks, served by the plugin from inside the server.

## The Pano MC Plugin works on its own

None of this needs the [`pano-node`](../../platform/server-management/pano-node/) daemon. A server
with only the Pano MC Plugin in it is a fully-fledged server in the panel: the plugin announces what
it can do when it connects — currently

```
console, commands, power, metrics, players, plugins, files, backups, plugin-install, schedules
```

— and Pano offers exactly that. A node adds what a process outside the game can do and nothing else
can: **Start** and **Kill**, the console of a server that is stopped, creating and reinstalling
servers, and an immediate backup restore. Where both are there, each feature is served by whichever
of the two does it better; where only one is, that one does it. An older plugin announces fewer
capabilities and Pano falls back to the node for those.

**[What works with what](../../platform/server-management/what-works-with-what/)** is the matrix,
feature by feature. The full documentation — the requirements, the permission nodes and the
per-platform differences — is on the
[Server Management](../../platform/server-management/) page.
