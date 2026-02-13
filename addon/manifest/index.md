# Plugin Manifest

Pano plugins rely on a manifest to define their identity, dependencies, and entry points. Pano uses **PF4J** for plugin loading, which requires specific metadata in the JAR's `MANIFEST.MF` file.

To simplify development, you do **not** need to edit the `MANIFEST.MF` directly. Instead, you manage these properties easily within the `gradle.properties` file.

## Configuring `gradle.properties`

During the build process, Gradle automatically reads these values and injects them into the final JAR manifest.

### Key Properties

*   `pluginId`: **(Required)** Unique identifier for your plugin. Use a consistent ID (e.g., `pano-plugin-announcement`).
*   `pluginName`: **(Required)** Human-readable name of the plugin (e.g., `Announcements`).
*   `pluginDescription`: **(Optional)** A brief description of what your plugin does.
*   `pluginPanoVersion`: **(Required)** The version of Pano this plugin is built for (e.g., `local-build` or `1.0.0`).
*   `pluginClass`: **(Required)** The fully qualified name of your main class extending `PanoPlugin`.
*   `pluginDeveloper`: **(Required)** The author or organization developing the plugin.
*   `pluginLicense`: **(Required)** License of the plugin (e.g., `MIT`, `Apache-2.0`).
*   `pluginSourceUrl`: **(Optional)** URL to the plugin's source code.
*   `pluginDependencies`: **(Optional)** List of other plugins your plugin depends on.

### Example

```properties
pluginId=pano-plugin-announcement
pluginName=Announcements
pluginDescription=Create, edit and manage your Minecraft server announcements!
pluginPanoVersion=local-build
pluginClass=com.panomc.plugins.announcement.AnnouncementPlugin
pluginDeveloper=Pano
pluginLicense=MIT
pluginSourceUrl=https://github.com/panomc/pano-plugin-announcement
pluginDependencies=
```

## Dependencies

Pano (via PF4J) supports advanced dependency management directly through the manifest.

### Plugin Dependencies (`pluginDependencies`)
You can define which other plugins your addon needs to function.
- **Syntax**: `pluginId` or `pluginId@version`
- **Optional Dependency**: Append `?` to the plugin ID.

**Examples:**
*   `pluginDependencies=other-plugin`: Requires any version of `other-plugin`.
*   `pluginDependencies=other-plugin@1.2.0`: Requires exactly version `1.2.0`.
*   `pluginDependencies=other-plugin@>=1.2.0`: Requires version `1.2.0` or higher.
*   `pluginDependencies=other-plugin?`: Optional dependency. If present, it will be loaded before your plugin.

## PF4J

Pano utilizes **PF4J** in the background to handle plugin loading and management. While you don't need to interact with it directly for standard development, you can consult the [PF4J documentation](https://pf4j.org/) if you need deeper technical insights into the underlying architecture.

## Advanced: Manual Configuration

The `gradle.properties` file is a convenience layer. If you prefer to manually configure your manifest or need dynamic values, you can modify the `shadowJar` task in `build.gradle.kts`.

Here is how the Pano Boilerplate maps properties to the manifest:

```kotlin
shadowJar {
    val pluginId: String by project
    val pluginName: String by project
    val pluginDescription: String? by project
    val pluginPanoVersion: String by project
    val pluginClass: String by project
    val pluginDeveloper: String by project
    val pluginLicense: String? by project
    val pluginSourceUrl: String? by project
    val pluginDependencies: String? by project

    manifest {
        attributes["id"] = pluginId
        attributes["name"] = pluginName
        pluginDescription?.let { attributes["description"] = it }
        attributes["pano-version"] = pluginPanoVersion
        attributes["main-class"] = pluginClass
        attributes["version"] = version
        attributes["developer"] = pluginDeveloper
        pluginLicense?.let { attributes["license"] = it }
        pluginSourceUrl?.let { attributes["source-url"] = it }
        pluginDependencies?.let { attributes["dependencies"] = it }
    }
}
```
