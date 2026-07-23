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
*   `pluginLicense`: **(Optional)** License of the plugin (e.g., `MIT`, `Apache-2.0`). The build maps it to the manifest only when set; PF4J itself requires only the id, class and version.
*   `pluginSourceUrl`: **(Optional)** URL to the plugin's source code.
*   `pluginDependencies`: **(Optional)** List of other plugins your plugin depends on.
*   `pluginRequires`: **(Optional)** A PF4J **system-version constraint** — the range of Pano versions your addon needs to run. It maps to the manifest `requires` attribute and is empty by default (meaning "any version"). Leave it empty unless you rely on a feature added in a specific Pano release.

::: tip `pluginId` is used everywhere
Your `pluginId` is not just a manifest field — it is the key Pano uses to identify your addon throughout the system. The same string is reused as:

- the name of your addon's data directory (`plugins/<pluginId>/`),
- the key for your addon's database scheme-version tracking,
- the URL segment for your addon's UI,
- the prefix for every permission node your addon defines (`pano.plugin.<pluginId>.…`), and
- the marketplace `resourceId` when you publish (see [Building & Publishing](/addon/publishing/)).

Pick it once, and never change it after your addon is live — renaming it orphans stored data and permissions.
:::

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
pluginRequires=
```

::: warning Versions are not yours to set
Leave `pluginPanoVersion=local-build` as-is, and **never hand-edit `version`**. On a real release, CI (semantic-release) injects the real `version` from your commit history (via `-Pversion`) — bumping it by hand breaks the release pipeline. Locally, `version` is always `local-build`. CI does **not** touch `pluginPanoVersion`; the manifest's `pano-version` attribute stays whatever you set here (`local-build` for a normal build). The Pano version shown on the Marketplace is a *separate* value — the `panoVersion` option of the Pano publishing plugin in `.releaserc.json`. See [Building & Publishing](/addon/publishing/) for how versions are derived from your commits.
:::

::: warning `gradle.properties` is read as ISO-8859-1
Gradle parses `.properties` files in **ISO-8859-1 (Latin-1)** encoding, not UTF-8. Any non-ASCII character — an em dash, an accented letter, or an emoji in `pluginDescription`, for example — must be written as a `\uXXXX` escape, or it will be mangled in the manifest. A literal em dash (`—`, which is UTF-8 bytes `0xE2 0x80 0x94`) read as Latin-1 turns into `â€"`. Write the escape instead of the raw character:

```properties
# Wrong — the literal em dash is mangled to â€"
pluginDescription=Manage your server — fast and simple.

# Right - \u2014 is the escape for an em dash
pluginDescription=Manage your server \u2014 fast and simple.
```
:::

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
    val pluginRequires: String? by project

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
        pluginRequires?.let { attributes["requires"] = it }
    }
}
```

## Premium build properties

If you are shipping a **premium** addon, the build also accepts a few extra properties that embed a license public key into the jar — `-PlicenseServer=dev|prod|<url>`, `-PpanoLicensePublicKey=<base64>`, and the `PANO_LICENSE_PUBLIC_KEY` environment variable. These are build flags, not manifest attributes, and without any of them your addon builds as a free (unlicensed) jar.
