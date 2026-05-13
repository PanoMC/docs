# AuthMeReloaded Integration

**AuthMe** and **AuthMeReloaded** are the same plugin — both names are used interchangeably in the Minecraft community. **AuthMeReloaded** is an advanced fork of the original AuthMe plugin and is the **recommended authentication management solution** for Minecraft servers.

> **Note:** This integration is only available for **Spigot** and its forks (Paper, Folia, Purpur, etc.). It is not available for proxy servers like Bungeecord or Velocity.

## What is AuthMeReloaded?

AuthMeReloaded is a comprehensive authentication plugin that adds login and registration functionality to Minecraft servers. It's the most popular and trusted authentication solution in the Minecraft community.

When integrated with Pano, authentication becomes **seamless** — players can register, login, and manage their passwords through your website, while the plugin handles the in-game authentication automatically.
## Features

When AuthMeReloaded integration is enabled, Pano provides:

- **Seamless Authentication** — Login and registration flows controlled by Pano
- **Password Management** — Change passwords from the website
- **Admin Controls** — Admins can reset player passwords from the panel
- **Automatic Synchronization** — Player data stays in sync between game and web
- **Plugin Command Support** — Execute specific AuthMe commands from Pano
- **Zero-Touch Auto-Configuration** — Pano automatically adjusts AuthMe settings with no manual configuration required
## Requirements

Before enabling the AuthMeReloaded integration, make sure you have:

1. **AuthMeReloaded** installed on your Minecraft server (Spigot/Paper/Folia)
2. **Pano MC Plugin** installed and connected to your Pano instance
3. AuthMeReloaded version **5.6.0** or newer (always use the latest version)

> ⚠️ **Important:** Pano always supports the latest version of AuthMeReloaded. Make sure your AuthMe plugin is up to date. The last tested version is **v5.6.0**.
## Setup Guide

### Step 1: Install AuthMeReloaded

Download and install AuthMeReloaded on your Minecraft server:

- [Download from SpigotMC](https://www.spigotmc.org/resources/authmereloaded.6269/)
- [Download from GitHub](https://github.com/AuthMe/AuthMeReloaded/releases)

Place the **`AuthMe-<version>.jar`** file in your server's **`plugins/`** folder and restart your server.

### Step 2: Connect Your Minecraft Server to Pano

If you haven't already, install the **Pano MC Plugin** on your Minecraft server and connect it to your Pano instance:

1. Install the Pano MC Plugin on your Minecraft server
2. In the panel, go to **Servers** → Click **+** button
3. Follow the connection steps in the modal

For detailed instructions, see the [Installation Guide](../../installation/).

> This documentation assumes you already have the Pano MC Plugin installed and connected.

### Step 3: Verify Auth Integration is Enabled in Panel

1. Log in to your **Pano Admin Panel**
2. Navigate to **Panel → Server Settings → Game Integration**
3. Find the **Auth Integration** section. Here you can configure:
   - **Auth Integration (Enabled by default):** The main toggle for the integration.
   - **Require Verified (Enabled by default):** If enabled, players must have a verified email address to log in to the server.
   - **Kick After Register (Enabled by default):** If enabled, players are automatically kicked from the server immediately after successful in-game registration. This is primarily used to ensure players verify their email addresses before being allowed to log in and play.
4. **Verify your preferred settings** and click save.

> **Note:** The Auth Integration and its sub-settings are **enabled by default**. When enabled and AuthMeReloaded is detected on your server, Pano will automatically hook into it and apply these rules.

That's it! The Pano MC Plugin will automatically **detect AuthMeReloaded** and start managing authentication flows.
## What Happens After Enabling?

Once the Auth Integration is enabled, Pano will:

### 1. Detect and Hook Into AuthMe Plugin

The Pano MC Plugin automatically detects if AuthMeReloaded is installed on your server. Once detected, it registers listeners for AuthMe's commands and events, allowing seamless communication between Pano and AuthMe.

### 2. Modify AuthMe Configuration (Zero-Touch)

Pano uses a **zero-touch configuration approach** — it automatically adjusts specific AuthMe configuration values to ensure compatibility without requiring any manual intervention. **Before making any changes, Pano creates a backup** of your `config.yml` file as **`authme-backup.yml`** in the **Pano plugin folder** (`plugins/Pano/`).

The following settings are modified:

| Setting | New Value | Reason |
|---------|-----------|--------|
| `settings.security.passwordHash` | `CUSTOM` | Required for Pano's password validation integration |
| `settings.registration.type` | `PASSWORD` | Pano only supports password-based authentication (email-based features should be handled through Pano's website) |
| `settings.security.minPasswordLength` | `6` | Ensures a minimum standard for account security |
| `settings.security.passwordMaxLength` | `128` | Standardized maximum length for password compatibility across the platform |
| `settings.restrictions.allowedNicknameCharacters` | `[a-zA-Z0-9_]*` | Restricts nicknames to alphanumeric characters and underscores for platform compatibility |

> ⚠️ **Do not manually change these settings.** They are essential for full integration and compatibility. Changing them may break the integration or cause conflicts with other plugins.

### 3. Take Control of Authentication

With the integration active, Pano manages:

- **Player Registration** — New players register through your website
- **Player Login** — Authentication is handled by Pano and synchronized with AuthMe
- **Password Changes** — Players can change their passwords from the website
- **Password Recovery** — Forgotten passwords can be reset via email (if SMTP is configured)
- **Admin Password Management** — Admins can reset any player's password from the panel
