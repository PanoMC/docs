# Game Integrations

Pano supports seamless integration with various game plugins to enhance your Pano experience. These integrations work in a **plug-and-play** manner — when configured properly, they automatically connect and synchronize with your Minecraft server.

## Pano MC Plugin

All game integrations require the **Pano MC Plugin** to be installed and connected to your Pano instance. The Pano MC Plugin acts as a bridge between your Minecraft server and Pano, enabling real-time communication and data synchronization.

**Key Features:**

- **End-to-End Encryption** — Secure WebSocket communication using RSA + AES-256 hybrid encryption
- **Real-Time Sync** — Instant player data synchronization between game and web
- **Multi-Platform Support** — Works with Spigot, Paper, Folia, Bungeecord, and Velocity
- **Plugin Hooks** — Automatically detects and hooks into supported plugins (AuthMe, permissions, etc.)
- **Event System** — Listens to in-game events and sends them to Pano
- **Auto-Configuration** — Automatically adjusts plugin settings for compatibility

> ⚠️ **Important:** Always use the **latest version** of the Pano MC Plugin to ensure compatibility with all integrations and latest features.

[→ Download Pano MC Plugin](https://github.com/PanoMC/pano-mc-plugin/releases) | [→ Installation Guide](../installation/)

## Available Integrations

### Authentication & Player Management

- [**AuthMeReloaded**](./authme/) — Seamless authentication system integration
- [**LuckPerms**](./luckperms/) — Full integration with Minecraft's most advanced permissions system
- [**Ban Management**](./ban-management/) — Real-time, synchronized ban management between game and web

## How Integrations Work

Pano's integrations are designed to work **seamlessly** with supported plugins:

1. **Install** the supported plugin on your Minecraft server (Spigot/Paper/Folia)
2. **Connect** your Minecraft server to Pano using the [Pano MC Plugin](../installation/) (via **Servers** tab → **+** button in the panel)
3. **Verify** the integration is enabled from **Panel → Server Settings → Game Integration** (most integrations are enabled by default)
4. That's it! Pano will automatically detect and hook into the plugin

## Integration Features

When an integration is active, Pano can:

- Synchronize player data between game and web
- Handle authentication flows (login, register, password management)
- Execute plugin commands from the panel
- Listen to plugin events and react accordingly
- Automatically configure plugin settings for optimal compatibility

## Coming Soon

We're constantly working to add more integrations. Some plugins we're considering:

- **Economy Plugins**
- **Shop Plugins**

Have a plugin you'd like to see integrated? Let us know on [Discord](https://discord.gg/6vVy72wgXT) or open a feature request on [GitHub](https://github.com/PanoMC/pano-mc-plugin/issues)! 

> The more requests we receive for a specific integration, the more likely it is to be prioritized and implemented.

## ‍ Developing Your Own Integration

Are you a developer looking to create custom integrations between Pano and your Minecraft server plugins?

Check out our [**Integration Development Guide**](/integration/getting-started/) to learn how to:

- Hook into the Pano MC Plugin API
- Create custom event listeners and handlers
- Synchronize data between game and web
- Build seamless plugin integrations

## Need Help?

If you encounter any issues with integrations:

- Check the specific integration page for detailed setup instructions
- Visit the [FAQ page](../FAQ)
- Ask for help on our [**Discord community**](https://discord.gg/6vVy72wgXT)
- Or open an issue on [GitHub](https://github.com/PanoMC/pano-mc-plugin/issues)

> Together, we make Pano better.

