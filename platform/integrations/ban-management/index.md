# Ban Management Integration

Pano includes a built-in, synchronized ban management system that allows you to manage server access directly from your web panel. This integration ensures that players who are banned on the web platform are instantly restricted from joining your Minecraft servers.

## 🎯 What is Ban Management?

The Ban Management integration bridges the gap between your website's moderation tools and your Minecraft server. When a moderator bans a player through the **Pano Admin Panel**, the Pano MC Plugin enforces this ban at the moment the player attempts to join any connected server.

## ⚡ Features

- ✅ **Instant Enforcement** — Bans applied on the web are active immediately in-game.
- ✅ **Temporary & Permanent Bans** — Support for both timed suspensions and lifetime bans.
- ✅ **Dynamic Kick Messages** — Automatically generates localized kick messages with reasons and expiry times.
- ✅ **Platform-Wide Synchronization** — A ban applied in Pano affects all servers connected to that Pano instance.
- ✅ **Easy Management** — View, search, and revoke bans from a single, modern interface.

## 📦 Requirements

1. **Pano MC Plugin** installed and connected to your Pano instance.
2. **Ban Integration** enabled in your Pano settings.

## 🔧 Setup Guide

### Step 1: Enable Integration
1. Log in to your **Pano Admin Panel**.
2. Navigate to **Panel → Server Settings → Game Integration**.
3. Enable the **Ban Integration** toggle.
4. Click **Save**.

### Step 2: Configure Ban Messages
Ban messages are pulled from your Pano platform's translation files. You can customize them in the **Translations** section of your panel:
- `auth.ban-kick-temporary`: Message shown for timed bans.
- `auth.ban-kick-permanent`: Message shown for permanent bans.

## 🔄 How It Works

1. **Player Joins:** When a player attempts to connect to your Minecraft server, the Pano MC Plugin intercepts the join event.
2. **Check Status:** The plugin sends a real-time request to the Pano platform to check the player's status.
3. **Enforcement:**
   - If the player is **not banned**, they are allowed to join normally.
   - If the player is **banned**, the plugin calculates the remaining time (if any) and kicks the player with the designated reason.

## 💬 Need Help?
If you encounter issues or have feedback:
- Visit our [**Discord community**](https://discord.gg/6vVy72wgXT).
- Open an issue on [**GitHub**](https://github.com/PanoMC/pano-mc-plugin/issues).

> Keep your community safe with Pano's centralized ban management. 🛡️
