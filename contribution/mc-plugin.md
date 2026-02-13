# MC Plugin Development

The `pano-mc-plugin` is the bridge between your Minecraft server and the Pano web platform.

## 📡 Communication (WebSocket)
Communication is handled over WebSocket for real-time performance. To ensure security, we use a hybrid encryption method:
- **RSA**: Used for the initial key exchange.
- **AES-256**: Used for encrypting all subsequent messages.

## 🎮 Supported Platforms
We support a wide range of Minecraft server platforms:
- Spigot / Paper / Folia
- Bungeecord / Velocity

::: warning COMPATIBILITY
When developing features or fixing bugs, you **must** ensure the code works correctly across all supported platforms. Use platform-specific modules for any logic that cannot be shared.
:::

## 🌍 Translations
If you want to add, change, or remove translations for the Minecraft plugin (or the core platform), please modify the files in the Pano repository under:
`Pano/src/main/resources/locales`

## 🛠️ Development
The plugin repository uses a modular structure where common logic is shared in a `core` module, while platform-specific implementations reside in their respective modules.

### Branching Policy
Just like the Pano Core, this project follows a three-branch release cycle.
- **alpha**: The active development branch. All Pull Requests should be opened against the `alpha` branch.
- **beta**: Pre-release stage for testing.
- **main**: The stable release branch.

### Key Integrations
The plugin integrates with popular Minecraft plugins to provide a seamless experience:
- **AuthMeReloaded**: For unified authentication.
- **LuckPerms**: For permission synchronization.
- **Ban Managers**: For viewing and managing bans via the web.

---

Want to add support for a new platform? Open a PR on [GitHub](https://github.com/PanoMC/pano-mc-plugin)!
