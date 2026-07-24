# Whitelist Plugin

The **Whitelist** plugin is designed to help server owners control who can join during a **closed or open beta**. The goal is automated whitelist management, invitations, and player notifications, all driven from the website panel instead of in-game commands.

::: warning Experimental — not ready for production
This plugin is an early-stage scaffold. Today it only adds a single, **display-only** panel page — there is no backend, no database, no settings, and no public-facing UI. Installing it will not actually whitelist any players yet. The features described below are the plugin's intended direction, not shipped functionality.
:::

## Current State

What you get after enabling the plugin right now:

- A **Whitelist** item in the panel sidebar (scroll icon, placed just above **Players**).
- A single page at **Panel → Whitelist** with one **Overview** tab.
- A **Modes** card showing a horizontal timeline of access modes. This currently renders two hardcoded demo entries — **Closed Beta** (inactive) → **Open Beta** (marked *Active*) — as a static diagram. There is no way to create, edit, or activate modes yet.

That is the extent of the plugin at this stage: a sidebar link and a static mock diagram.

## Planned Features

These are described in the plugin but **not yet implemented**:

- **Access Modes:** Switch your site between states like *Closed Beta* and *Open Beta*.
- **Automated Whitelist Management:** Manage which players are allowed to join from the panel.
- **Invitations:** Invite players into a closed beta.
- **Player Notifications:** Notify players about their whitelist / access status.

## Required Permission

The panel page and its sidebar link are gated on the following permission:
`pano.plugin.pano-plugin-whitelist.manage.whitelist`

::: tip Free plugin
Whitelist is a free plugin — no premium account, license key, or external service is required. The only prerequisite is a working Pano installation.
:::

## Open Source

This plugin is open source and licensed under the **MIT License**. You can access the source code on GitHub:
- [Source Code](https://github.com/PanoMC/pano-plugin-whitelist)

## Setup

1. Enable the plugin in the **Pano Admin Panel**.
2. Navigate to **Panel → Whitelist**.
3. Open the **Overview** tab to see the current (demo) access modes.
