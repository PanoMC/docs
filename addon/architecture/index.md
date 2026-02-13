# General Architecture

## 🏗️ General Architecture

A Pano plugin consists of two main parts:
1.  **Plugin UI**: A Svelte-based frontend that runs in both the Panel (admin interface) and the Theme (public interface).
2.  **Plugin Backend**: A Kotlin (preferred) or Java backend that integrates directly with the Pano host.

### Structure
The following directory structure illustrates a typical Pano plugin, based on the `pano-plugin-announcement` example:

```text
pano-plugin-announcement/
├── .github/workflows/          # CI/CD workflows (Optional) (e.g., release.yml)
├── build.gradle.kts/           # Gradle build configuration
├── gradle.properties/          # Plugin manifest (ID, version, etc.)
├── package.json/               # Frontend dependencies and scripts
├── rollup.config.js/           # Frontend build configuration
└── src/                        # Source code
    ├── main/
    │   ├── kotlin/             # Backend source code
    │   │   └── com/panomc/plugins/announcement/
    │   │       ├── AnnouncementPlugin.kt  # Main plugin class
    │   │       ├── db/                    # Database models and tables
    │   │       ├── event/                 # Event listeners
    │   │       ├── log/                   # Activity logs
    │   │       ├── permission/            # Permission definitions
    │   │       ├── routes/                # API routes
    │   │       └── util/                  # Utility classes
    │   └── resources/          # Backend resources
    │       ├── locales/        # Translation files (en.json, etc.)
    │       └── config.conf     # Default configuration
    ├── panel/                  # Panel UI (Admin Interface)
    │   ├── AnnouncementsPage.svelte
    │   └── components/
    ├── theme/                  # Theme UI (Public Interface)
    │   └── Announcements.svelte
    └── main.js                 # Frontend entry point
```

- **Architecture**:
    Pano's plugin architecture is unique, designed to seamlessly handle **Backend logic**, **User Interface (SSR & CSR)**, and **Database management** within a single structure.

    While we strive to make this structure as simple and intuitive as possible for developers, it is a specialized environment tailored to Pano's needs.

    ::: tip Feedback
    We are always open to improving our developer experience. If you have ideas or suggestions for a better plugin structure, please reach out to us on [Discord](https://discord.gg/GZvaK3wpHF).
    :::

    Under the hood, it shares similarities with Spigot plugins but leverages **PF4J** for loading. You can refer to the [PF4J documentation](https://pf4j.org/) for deeper technical details.
- **Manifest**: Plugins are defined using a manifest file. Pano simplifies this by managing properties in `gradle.properties`. See the [Manifest Configuration](../manifest/) guide for details.
