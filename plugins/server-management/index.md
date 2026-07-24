# Server Management Plugin

The **Server Management** plugin is an official Pano plugin designed to let you manage your Minecraft servers directly from Pano — console, start/stop, and player control in one place. It is developed by the Pano team, free to use, and open source.

::: warning In development — not yet functional
This plugin is currently an early scaffold. None of the server-management functionality described below is implemented yet: it registers no panel pages, API endpoints, settings, or permissions, and installing it will not add any usable features to your site. This page documents the **intended** scope so you know what is planned. Follow the GitHub repository for progress.
:::

## Planned Features

The following capabilities describe the plugin's intended scope. They are **not available today** and are listed here as a roadmap only:

- **In-Panel Console:** View and interact with your Minecraft server console directly from the Pano admin panel.
- **Start / Stop Control:** Start and stop your connected servers without leaving Pano.
- **Player Control:** Manage online players from one central place.

These features are expected to build on servers already linked to Pano through the **pano-mc-plugin** connection, but no code currently backs any of this.

## Panel Controls

None yet. Once implemented, the plugin is expected to add its controls to the **Pano Admin Panel**. There are currently no panel pages, sections, or navigation links.

## Settings & Permissions

None defined. The plugin ships with no user-facing settings and no permissions at this stage.

## Prerequisites

- A standard Pano plugin installation (drop the jar into your `plugins/` folder).
- No license key required — the plugin is **free**.

::: tip Free and official
Server Management is developed and maintained by the Pano team and does not require a premium license.
:::

## Open Source

This plugin is open source and developed in the open. You can follow development and view the source code on GitHub:
- [Source Code](https://github.com/PanoMC/pano-plugin-server-management)
