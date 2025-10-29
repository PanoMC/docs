# AuthMeReloaded Integration

**AuthMe** and **AuthMeReloaded** are the same plugin — both names are used interchangeably in the Minecraft community. **AuthMeReloaded** is an advanced fork of the original AuthMe plugin and is the **recommended authentication management solution** for Minecraft servers.

> **Note:** This integration is only available for **Spigot** and its forks (Paper, Folia, Purpur, etc.). It is not available for proxy servers like Bungeecord or Velocity.

## 🎯 What is AuthMeReloaded?

AuthMeReloaded is a comprehensive authentication plugin that adds login and registration functionality to Minecraft servers. It's the most popular and trusted authentication solution in the Minecraft community.

When integrated with Pano, authentication becomes **seamless** — players can register, login, and manage their passwords through your website, while the plugin handles the in-game authentication automatically.

## ⚡ Features

When AuthMeReloaded integration is enabled, Pano provides:

- ✅ **Seamless Authentication** — Login and registration flows controlled by Pano
- ✅ **Password Management** — Change passwords from the website
- ✅ **Admin Controls** — Admins can reset player passwords from the panel
- ✅ **Automatic Synchronization** — Player data stays in sync between game and web
- ✅ **Plugin Command Support** — Execute specific AuthMe commands from Pano
- ✅ **Zero-Touch Auto-Configuration** — Pano automatically adjusts AuthMe settings with no manual configuration required

## 📦 Requirements

Before enabling the AuthMeReloaded integration, make sure you have:

1. **AuthMeReloaded** installed on your Minecraft server (Spigot/Paper/Folia)
2. **Pano MC Plugin** installed and connected to your Pano instance
3. AuthMeReloaded version **5.6.0** or newer (always use the latest version)

> ⚠️ **Important:** Pano always supports the latest version of AuthMeReloaded. Make sure your AuthMe plugin is up to date. The last tested version is **v5.6.0**.

## 🔧 Setup Guide

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
3. Find the **Auth Integration** checkbox
4. **Verify it's enabled** (it's enabled by default)
5. If it's disabled, enable it and save your settings

> 💡 **Note:** The Auth Integration is **enabled by default**. When enabled and AuthMeReloaded is detected on your server, Pano will automatically hook into it. You only need to verify it's active.

That's it! The Pano MC Plugin will automatically **detect AuthMeReloaded** and start managing authentication flows.

## 🔄 What Happens After Enabling?

Once the Auth Integration is enabled, Pano will:

### 1. Detect and Hook Into AuthMe Plugin

The Pano MC Plugin automatically detects if AuthMeReloaded is installed on your server. Once detected, it registers listeners for AuthMe's commands and events, allowing seamless communication between Pano and AuthMe.

### 2. Modify AuthMe Configuration (Zero-Touch)

Pano uses a **zero-touch configuration approach** — it automatically adjusts specific AuthMe configuration values to ensure compatibility without requiring any manual intervention. **Before making any changes, Pano creates a backup** of your `config.yml` file in the **Pano plugin folder** (`plugins/Pano/authme-backup/`).

The following settings are modified:

| Setting | New Value | Reason |
|---------|-----------|--------|
| `settings.security.passwordHash` | `CUSTOM` | Required for Pano's password validation integration |
| `settings.registration.type` | `PASSWORD` | Pano only supports password-based authentication (email-based features should be handled through Pano's website) |

> ⚠️ **Do not manually change these settings.** They are essential for full integration and compatibility. Changing them may break the integration or cause conflicts with other plugins.

### 3. Take Control of Authentication

With the integration active, Pano manages:

- **Player Registration** — New players register through your website
- **Player Login** — Authentication is handled by Pano and synchronized with AuthMe
- **Password Changes** — Players can change their passwords from the website
- **Password Recovery** — Forgotten passwords can be reset via email (if SMTP is configured)
- **Admin Password Management** — Admins can reset any player's password from the panel

## ✅ Supported Features

Pano supports the following AuthMe commands and features:

- ✅ `/register <password> <confirmPassword>` — Register a new account
- ✅ `/login <password>` — Login to your account
- ✅ `/logout` — Logout from your account
- ✅ `/authme forceLogin <player>` — Force login a player (admin)
- ✅ `/authme register <player> <password>` — Register a player (admin)
- ✅ `/authme reload` — Reload AuthMe configuration

Pano listens to these commands and synchronizes the actions with your website database.

## ❌ Unsupported Features

Due to integration limitations, the following AuthMe commands and features are **not supported**:

- ❌ `/unregister` — Unregistering must be done through Pano's panel or website
- ❌ `/authme unregister <player>` — Same as above
- ❌ `/email` — Email management is handled by Pano
- ❌ `/totp` — Two-factor authentication is not supported
- ❌ `/changepassword` — Use Pano's website to change passwords
- ❌ Command aliases (e.g., `/cp` for `/changepassword`) — Only standard commands are supported

If a player tries to use an unsupported command, they will be notified to use the website instead.

> 💡 **Recommended:** To prevent confusion and ensure a seamless experience, it's recommended to **disable access to these unsupported commands** using a permission plugin or AuthMe's own command configuration. This way, players will only have access to Pano-compatible features.

### 🎯 Best Practice: Redirect Players to Your Website

For an even better user experience and enhanced security, consider **disabling or restricting in-game registration** entirely:

**How to implement:**
1. Disable the `/register` command using permissions or AuthMe configuration
2. Set AuthMe to only allow already-registered players to join
3. Configure a server message that **directs new players to your website** to register

**Why this approach is better:**

- ✅ **Enhanced Security** — Web registration allows for email verification, CAPTCHA, and other security measures
- ✅ **Better UX** — Players can create accounts with proper forms, password strength indicators, and clear instructions
- ✅ **Centralized Management** — All registrations happen through Pano's website, making moderation easier
- ✅ **Professional Appearance** — Gives your server a more polished, modern feel
- ✅ **Additional Features** — You can add terms of service, privacy policy acceptance, and other requirements during registration

**Example AuthMe Configuration:**

```yaml
settings:
  registration:
    enabled: false  # Disable in-game registration
  
restrictions:
  allowCommands:
    - /login
    # /register removed from allowed commands
```

Then configure a kick or join message pointing players to your website: `"Please register at https://yourserver.com/register"`

## 🌐 Comparison with Other Web Scripts

Unlike traditional web scripts that require complex configuration and manual synchronization, **Pano's AuthMeReloaded integration is seamless**:

| Feature | Traditional Scripts | Pano |
|---------|---------------------|------|
| **Setup Complexity** | High — requires manual database setup, config editing, and PHP scripts | Low — just enable the checkbox |
| **Synchronization** | Manual or cron-based | Real-time via WebSocket |
| **Password Hashing** | Often incompatible or insecure | Native CUSTOM hash support |
| **Command Support** | Limited or none | Full command and event support |
| **Auto-Configuration** | Manual | Automatic with backup |

With Pano, everything just works. No manual database editing, no complex configuration — just plug and play.

## 🔒 Security & Compatibility

### Password Security

Pano uses AuthMe's **CUSTOM hash** type, which allows Pano to validate passwords securely without storing plaintext passwords or using weak hashing algorithms.

### Backup System

Before modifying any AuthMe configuration, Pano **automatically creates a backup** of your `config.yml` file. You can find backups in:

```
plugins/Pano/authme-backup/
```

If something goes wrong, you can always restore your previous configuration.

### Plugin Conflicts

Some AuthMe addons or related plugins may conflict with Pano's integration, especially if they:

- Modify the same configuration values
- Hook into the same AuthMe events
- Change password hashing methods

If you experience issues, try disabling conflicting plugins one by one to identify the cause.

## 🐛 Troubleshooting

### Integration Not Working

**Symptoms:** Players can't register or login, commands don't work

**Solutions:**
1. Make sure AuthMeReloaded is installed and running (check `/plugins`)
2. Verify the Pano MC Plugin is connected to Pano (check Panel → Server Status)
3. Ensure the integration checkbox is enabled in Panel → Server Settings → Game Integration
4. Restart your Minecraft server after enabling the integration
5. Check server logs for any errors

### Configuration Keeps Resetting

**Symptoms:** AuthMe config values change back after restart

**Solutions:**
1. Do not manually edit `passwordHash` or `registration.type` in AuthMe's config
2. Let Pano manage these settings automatically
3. If you need to change other AuthMe settings, edit them through AuthMe's config and reload

### Commands Not Responding

**Symptoms:** `/register` or `/login` commands don't work

**Solutions:**
1. Check if the integration is enabled in the panel
2. Verify the player is connected to the correct server
3. Make sure you're using the exact command syntax (no aliases)
4. Check if another plugin is overriding the commands

## 💬 Reporting Issues

If you encounter bugs, missing features, or compatibility issues with AuthMeReloaded integration:

- **GitHub Issues:** [PanoMC/pano-mc-plugin](https://github.com/PanoMC/pano-mc-plugin/issues)
- **Discord:** [Join our community](https://discord.gg/6vVy72wgXT)

When reporting an issue, please include:
- Your Pano version
- Your AuthMeReloaded version
- Your Minecraft server version (Spigot/Paper/Folia)
- Server logs showing the error
- Steps to reproduce the issue

> Together, we make Pano better. 🚀

## 📚 Related Documentation

- [Game Integrations](../)
- [Installing Pano](../../installation/)
- [Configuration Guide](../../configuration/)
- [FAQ](../../FAQ/)
- [Advanced Topics](../../advanced/)

