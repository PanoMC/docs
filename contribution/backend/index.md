# Backend Development

The Pano backend is the heart of the platform. It handles API requests, manages the database, controls the UI lifecycles, and communicates with Minecraft servers.

Throughout our documentation and code, the project may be referred to as **Pano Platform**, **Pano Core Platform**, or **Pano Web Platform**.

## 📱 Repository Applications

The main [**Pano Core**](https://github.com/PanoMC/Pano) repository actually contains two distinct applications:

1. **Pano Core**: The main platform that handles all web and server management logic.
2. **Updater**: A secondary application responsible for updating the core platform. It is compiled alongside Pano and embedded into the final `.jar` file. It only runs during the update process.

## 🛠️ Tech Stack
- **Language**: Kotlin
- **Framework**: Vert.x (Event-driven, non-blocking)
- **Dependency Injection**: Spring DI
- **Database**: MySQL 5.5+ / MariaDB

## 🏗️ Architecture
The backend is designed to be modular and resilient. It supports a plugin system where features can be added or removed dynamically.

### UI & Interface Management
The **UI Manager** orchestrates how interfaces are served. On startup, it scans for installed themes and consults the **Setup Manager**. Depending on the installation status, it launches either the `setup-ui` or the primary web interface.

### Command System
Pano includes a robust command-line system that initializes during startup. It features:
- **Command History**: Allows navigating through previous commands.
- **Default Definitions**: Core commands are pre-defined to ensure the platform is manageable immediately upon launch.

### Graphical Interface (GUI)
By default, Pano starts with a graphical user interface. To run in headless mode (e.g., on a server), use the `-nogui` argument:
```bash
java -jar Pano.jar -nogui
```

### Dependency Injection (Spring DI)
We use **Spring DI** for component management. All beans are defined in `SpringConfig` based on their usage requirements. We utilize **Lazy Loading** (`@Lazy`) where appropriate to keep startup times fast.

### 🔌 Interface Initialization (`init-ui`)
Unless the `init-ui` configuration is explicitly set to `false`, Pano will automatically attempt to launch the default interfaces included in the repository.
- **Proxying**: Pano's reverse proxy will only direct traffic to these internally managed instances, even if other interface instances are running externally.
- **Dev Environment Note**: If `init-ui` is enabled and Pano is not shut down cleanly (e.g., a crash or forced kill), the underlying **Bun** processes for the interfaces may remain running in the background.

### Plugin Lifecycle & PF4J
Pano utilizes [**PF4J**](https://pf4j.org/) (Plugin Framework for Java) for its robust plugin system. The plugin lifecycle is managed by the `PluginManager`:

1. **Startup**: Once the Pano Core is ready, the `PluginManager` initializes all plugins. If a plugin is not disabled and meets all its requirements, its `start()` method is automatically called.
2. **Shutdown**: When the platform is shutting down, the `PluginManager` ensures a clean exit by calling the `stop()` method for each active plugin.

Every backend plugin extends the `PanoPlugin` class (which implements the PF4J `Plugin` interface).

### Context Management
- `applicationContext`: The main host context.
- `pluginBeanContext`: Context specific to a single plugin.
- `pluginGlobalBeanContext`: Shared context across all plugins.

## 🚦 Development Flow

::: warning FIRST-RUN CONFIGURATION
After running Pano for the first time, we strongly recommend closing the application **before** completing the setup. Open the generated `config.conf` file and change the port to `8088` to avoid conflicts and ensure a smooth development experience.
:::

1. **Clone the Core**: `https://github.com/PanoMC/Pano`
2. **Setup Environment**: Ensure you have JDK 11+ and a MySQL/MariaDB instance.
3. **Build**: Use `./gradlew build` to compile the project.
4. **Run**: Run the generated JAR or use `./gradlew run -Pnogui` for development (runs via Gradle without creating a JAR).

### Development Mode (-Pdev)
Using the `--dev` parameter (or `-Pdev` with Gradle) connects the platform to our internal development servers. Please note:
- This is only valid if the **setup has not been performed** yet.
- Access is restricted to authorized contributors only.
- If you need access for testing or core development, contact us via [Discord](https://panomc.com/discord).
- Access is granted on a case-by-case basis and is not guaranteed for everyone.

### Activity Logs & Permissions
All administrative API endpoints must define **Activity Logs** and use the **Permission** system by extending `PanelPermission`.

---

Need help? Join our [Discord](https://panomc.com/discord) or open an issue on GitHub.
