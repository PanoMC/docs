# LuckPerms Integration

**LuckPerms** is the most advanced, fast, and secure permissions plugin for Minecraft servers. Pano provides a deep, bidirectional integration with LuckPerms, allowing you to manage your entire server's permission structure directly from the web panel.

Unlike traditional setups where web panels only view data, Pano acts as a **centralized management hub** for LuckPerms.

## 🎯 What is LuckPerms Integration?

Pano's LuckPerms integration synchronizes your server's **Groups**, **Tracks**, and **Permission Nodes** in real-time. Changes made on the Pano Panel are instantly reflected in-game, and changes made in-game (via LuckPerms commands or other plugins) are automatically pushed to Pano.

## ⚡ Features

- ✅ **Full Bidirectional Sync** — Real-time synchronization between Game and Web.
- ✅ **Group Management** — Create, edit, and delete groups from the panel.
- ✅ **Track Support** — Manage promotion and demotion paths (Tracks) seamlessly.
- ✅ **Permission Node Editor** — Add or remove permission nodes for groups and users.
- ✅ **Metadata Support** — Full support for **Prefixes**, **Suffixes**, **Display Names**, and **Weights**.
- ✅ **Context Awareness** — Support for LuckPerms contexts (server, world, etc.).
- ✅ **Temporary Permissions** — Manage permissions that expire automatically (Expiry support).
- ✅ **Managed States** — Pano uses markers (`pano-managed`) to safely manage entities without conflicting with manual in-game changes.

## 📦 Requirements

1. **LuckPerms** (v5.0+) installed on your Minecraft server (Spigot, Paper, Folia, etc.).
2. **Pano MC Plugin** installed and connected to your Pano instance.
3. **Permission Integration** enabled in your Pano settings.

## 🔧 Setup Guide

### Step 1: Install LuckPerms
Ensure LuckPerms is installed and working on your Minecraft server.
- [Download LuckPerms →](https://luckperms.net/download)

### Step 2: Enable Integration
1. Log in to your **Pano Admin Panel**.
2. Navigate to **Panel → Server Settings → Game Integration**.
3. Enable the **Permission Integration** toggle.
4. Click **Save**.

### Step 3: Wait for Synchronization
Once enabled, the Pano MC Plugin will automatically detect LuckPerms. 
- It will perform an initial sync to pull your existing LuckPerms data into Pano.
- It will then hook into the LuckPerms Event Bus to listen for future changes.

## 🌐 Pano-Exclusive Permissions

> [!IMPORTANT]
> When you add a permission node via the Pano Panel, it automatically includes a **`pano: true`** context. This indicates that the permission node is specific to the Pano platform and is **not reflected in-game**.
>
> This feature allows you to manage web-only permissions (such as panel access levels or specific website features) without cluttering your Minecraft server's internal permissions or causing conflicts in-game.

## 🔄 How Synchronization Works

### Pano to Game (Inbound)
When you save changes in the **Permissions** section of the Pano Panel:
1. Pano sends a snapshot update to the Pano MC Plugin.
2. The plugin applies these changes to LuckPerms instantly.
3. Groups and Tracks are updated, and nodes are synchronized.


### Game to Pano (Outbound)
When a permission change occurs in-game (e.g., using `/lp user ... permission set ...`):
1. LuckPerms triggers an event.
2. Pano MC Plugin catches this event and waits for a short debounce period (to handle bulk changes).
3. The plugin pushes a fresh snapshot of your current permissions state to Pano.

## 🔒 Safety & Conflict Management

Pano is designed to coexist with manual LuckPerms usage:
- **Managed Markers:** Pano adds a `meta.pano-managed.true` node to entities it manages.
- **Wipe Protection:** When syncing, Pano carefully identifies which groups and tracks it should manage to avoid accidentally deleting your manually created server data.
- **Verification:** Pano verifies every node's hash to ensure data integrity during transfers.

## 🐛 Troubleshooting

### Integration Not Loading
- Check if LuckPerms is installed (type `/plugins` in-game).
- Look for `[Pano] Permission integration is enabled, loading...` in your server console.
- Ensure the **Permission Integration** toggle is ON in the panel.

### Sync Delay
- Pano uses a short debounce period (approx. 1.5 seconds) for outbound syncs to prevent network flooding during bulk operations.
- If changes aren't appearing, check if the **Pano MC Plugin** is connected (Panel → Servers).

## 💬 Need Help?
If you encounter issues or have feedback:
- Visit our [**Discord community**](https://discord.gg/6vVy72wgXT).
- Open an issue on [**GitHub**](https://github.com/PanoMC/pano-mc-plugin/issues).

> LuckPerms integration makes managing complex server permissions as easy as clicking a button. 🚀
