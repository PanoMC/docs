# Plugin Manifest

Every Pano addon ships with a small metadata file — the **manifest** — that tells Pano what your addon is called, who made it, which class to run first, and what it depends on. This page shows you the handful of values you set, where you set them, and how to confirm they ended up in your built addon.

::: tip Coming from JavaScript?
A manifest is the Java-world equivalent of `package.json` — a small file that describes your project. An **entry point** just means the class Pano runs first when it loads your addon.
:::

A few terms you will see on this page:

- **PF4J** (Plugin Framework for Java) — a library that finds and loads plugin jars while Pano is running. You never call it yourself; it just needs certain metadata to exist.
- **JAR** — Java's packaged output, which is really just a zip file. When you build your addon you get one `.jar`.
- **`MANIFEST.MF`** — a plain-text file *inside* that jar (under `META-INF/`) that holds the metadata PF4J reads.

You do **not** edit `MANIFEST.MF` by hand. Instead you set everything in a properties file, and the build copies your values into the manifest for you.

::: tip This page assumes you scaffolded from the boilerplate
These instructions apply to a plugin project created from the Pano boilerplate. If you have not done that yet, start with [Getting Started](/addon/getting-started/). The boilerplate already ships a `gradle.properties` with every key below filled in.
:::

**When do you actually touch this?** In practice you change only five lines before your first build — `pluginId`, `pluginName`, `pluginDescription`, `pluginClass`, and `pluginDeveloper`. Everything else can stay exactly as the boilerplate ships it.

## Configuring `gradle.properties`

Open **`gradle.properties`** in the root folder of your plugin project — the boilerplate already contains one, pre-filled with all the keys below. During a build, Gradle reads these values and injects them into the final JAR manifest for you.

### Example

Here is a complete `gradle.properties` from the Announcements addon:

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

*Keep these values to plain ASCII (unaccented letters, digits, basic punctuation). If you need an em dash, an accent, or an emoji, read the encoding note under [Gotchas](#gotchas) below first.*

**Checkpoint.** Build once and look inside the jar:

```bash
./gradlew build
unzip -p build/libs/*.jar META-INF/MANIFEST.MF
```

You should see your `id`, `name`, and `main-class` among the lines printed.

### What gets generated

Given the `gradle.properties` above, the build writes lines like these into `META-INF/MANIFEST.MF` (the attribute names come from PF4J; the values come straight from your properties):

```
id: pano-plugin-announcement
name: Announcements
description: Create, edit and manage your Minecraft server announcements!
pano-version: local-build
main-class: com.panomc.plugins.announcement.AnnouncementPlugin
version: local-build
developer: Pano
license: MIT
source-url: https://github.com/panomc/pano-plugin-announcement
```

That is the whole point of the file: **`gradle.properties` in, `MANIFEST.MF` out.** (The exact lines depend on which optional properties you filled in.)

### Key Properties

Now the values, line by line. **(Required)** means the Pano build fails without it — if a required property is missing, `./gradlew build` stops during the `shadowJar` step with an error naming the property. It does *not* mean PF4J needs it. **(Optional)** properties can be left blank or removed.

*   `pluginId`: **(Required)** A unique id for your addon. Use lowercase letters, digits, and hyphens only — no spaces. The convention is `pano-plugin-<name>` (e.g. `pano-plugin-announcement`); the `pano-plugin-` prefix is a convention, not a hard requirement, but stick to it. Pick it once and never change it (see the tip below).
*   `pluginName`: **(Required)** Human-readable name of the plugin (e.g., `Announcements`).
*   `pluginDescription`: **(Optional)** A brief description of what your plugin does.
*   `pluginPanoVersion`: **(Required)** The version of Pano this plugin is built for. Leave this as `local-build` during development — see the versions warning below.
*   `pluginClass`: **(Required)** The full path to your addon's main class — its package name plus the class name, e.g. `com.example.myplugin.MyPlugin`. This is the class in `src/main/kotlin/...` whose declaration contains `: PanoPlugin(` — the class Pano runs first when it loads your addon. (Developers call this the *fully qualified name*.)
*   `pluginDeveloper`: **(Required)** The author or organization developing the plugin.
*   `pluginLicense`: **(Optional)** License of the plugin (e.g., `MIT`, `Apache-2.0`).
*   `pluginSourceUrl`: **(Optional)** URL to the plugin's source code.
*   `pluginDependencies`: **(Optional)** Other Pano plugins your addon needs, separated by commas — e.g. `pluginDependencies=other-plugin, some-plugin?`. See [Dependencies](#dependencies) below for the full syntax.
*   `pluginRequires`: **(Optional)** Which Pano versions your addon is *allowed* to run on, written as a version range like `>=1.0.0`. Empty (the default) means any version. Set it only if your addon relies on a feature added in a specific Pano release, e.g. `pluginRequires=>=1.2.0`. (This maps to the manifest `requires` attribute.)

::: tip `pluginPanoVersion` vs `pluginRequires`
These two sound alike but do different jobs:

- **`pluginPanoVersion`** just *records* which Pano version you built against. It is informational.
- **`pluginRequires`** is *enforced*: if you set a range, Pano refuses to load your addon on any Pano version outside it.
:::

::: tip Your `pluginId` is used everywhere — choose it carefully
Pano reuses this one string all over the system, so it also names:

- your addon's data folder (`plugins/<pluginId>/`),
- how Pano tracks your addon's **database schema version** (which migration your tables are on),
- the URL segment for your addon's UI,
- every **permission** your addon defines (each one is prefixed `pano.plugin.<pluginId>.…`), and
- your **marketplace listing id** (`resourceId`) when you publish — see [Building & Publishing](/addon/publishing/).

Pick it once, and never change it after your addon is live. Renaming it makes Pano treat the addon as brand-new: your old database tables, files, and granted permissions are ignored and effectively lost.
:::

::: warning You don't set version numbers by hand
Version numbers are computed for you, and getting this wrong breaks the release pipeline — so just leave them alone:

- **You never type a version number.** The boilerplate does not ask you to set a Gradle `version` at all, so don't add one.
- **Local builds are always `local-build`.** Keep `pluginPanoVersion=local-build`, and the Gradle `version` (injected at build time) stays `local-build` too.
- **On release, the pipeline fills it in.** When you push, CI — the automated build that runs on GitHub — uses a tool called **semantic-release** to compute the real `version` from your commit messages. Hand-editing it breaks that.

The Pano version shown on the Marketplace is yet another, separate value, configured when you publish. See [Building & Publishing](/addon/publishing/) for how versions are derived from your commits.
:::

## Dependencies

You declare which other Pano plugins your addon needs in `gradle.properties`; the build writes them into the manifest for you.

::: warning Not the same as a library dependency
This is **not** a `build.gradle.kts` library dependency (the `implementation(...)` lines — Pano's equivalent of `npm install`). `pluginDependencies` means *other Pano plugins* that must be installed on the server at runtime for your addon to work.
:::

### Plugin Dependencies (`pluginDependencies`)
List the other addons yours needs, separated by commas.

- **Syntax**: `pluginId` or `pluginId@version`
- **Optional Dependency**: append `?` to the plugin ID.

The part after `@` is a version range. Standard comparison operators like `>=`, `<=`, `>`, and `<` are supported; for the full grammar see the [PF4J documentation](https://pf4j.org/).

**Examples:**

*   `pluginDependencies=other-plugin`: Requires any version of `other-plugin`.
*   `pluginDependencies=other-plugin@1.2.0`: Requires exactly version `1.2.0`.
*   `pluginDependencies=other-plugin@>=1.2.0`: Requires version `1.2.0` or higher.
*   `pluginDependencies=other-plugin@<2.0.0`: Requires any version below `2.0.0`.
*   `pluginDependencies=other-plugin?`: Optional dependency. If present, it is loaded before your plugin; if not, yours still loads.
*   `pluginDependencies=other-plugin, some-plugin?`: Two dependencies, comma-separated — one required, one optional.

::: tip What if a required dependency is missing?
If a **required** dependency is not installed on the server, Pano refuses to load your addon and logs an error at startup — check the platform console/log to see which one is missing.
:::

## Gotchas

### `gradle.properties` is read as ISO-8859-1

::: warning Use plain ASCII in `gradle.properties` values
Use only plain ASCII characters — unaccented English letters, digits, and basic punctuation — in these values. For anything else (an em dash, an accented letter, or an emoji), write the Unicode `\uXXXX` escape instead of the raw character, or it will be mangled in the manifest.

**Why:** Gradle parses `.properties` files in **ISO-8859-1 (Latin-1)** encoding, not UTF-8. (For the curious: a literal em dash `—` is the UTF-8 bytes `0xE2 0x80 0x94`, which read back as Latin-1 turns into `â€"`.)

The two lines below differ only in the value — the first uses a raw em dash, the second uses its `\u2014` escape:

```properties
# Wrong — the literal em dash is mangled to â€"
pluginDescription=Manage your server — fast and simple.

# Right - \u2014 is the escape for an em dash
pluginDescription=Manage your server \u2014 fast and simple.
```

To find the escape for any character, look it up on a Unicode site (search e.g. "unicode code point for é") and write it as `\uXXXX` — for example `é` is `\u00E9`.
:::

## Advanced: Manual Configuration

The `gradle.properties` file is just a convenience layer. If you prefer to configure your manifest yourself or need dynamic values, you can edit the **`shadowJar`** task in `build.gradle.kts`. (`shadowJar` is the build step that packages your addon plus its libraries into the single `.jar` Pano loads.)

Here is how the Pano Boilerplate maps properties to the manifest. Each `val … by project` line pulls the matching value out of `gradle.properties`; the `manifest { }` block then writes it into `MANIFEST.MF` under the attribute name PF4J expects:

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

::: warning Don't rename the attribute keys
You can add attributes freely, but do **not** rename the existing keys (`id`, `name`, `main-class`, `pano-version`, and so on). PF4J looks them up by these exact names, so a renamed key silently stops your addon from loading. For reference, PF4J itself only *requires* `id`, `main-class`, and `version`; everything else is optional and is written to the manifest only when you set it.
:::

Pano uses **PF4J** in the background to handle all plugin loading and management. You never interact with it directly for standard development, but if you want the deeper technical details you can consult the [PF4J documentation](https://pf4j.org/).

## Premium build properties

Shipping a **premium** (paid) addon? The build embeds a **license public key** — a small key Pano uses to verify that a buyer actually paid — into your jar at build time. This is set with build flags, not manifest properties, and without any of them your addon builds as a free (unlicensed) jar. The full workflow lives on the [Premium addons](/addon/premium/) page; the flags it uses are:

- `-PlicenseServer=dev|prod|<url>` — which license server the build points at.
- `-PpanoLicensePublicKey=<base64>` — the public key itself, passed as a base64 string.
- `PANO_LICENSE_PUBLIC_KEY` — an environment variable you can use instead of the flag above.

## Check your work

Once you have edited your five lines, confirm the whole pipeline end to end:

1. **Build:** run `./gradlew build`. It should finish without errors. (If a **(Required)** property is missing, the build stops during `shadowJar` and names it.)
2. **Inspect the manifest inside the jar:** run `unzip -p build/libs/*.jar META-INF/MANIFEST.MF`. You should see your `id`, `name`, `main-class`, and the other lines from *What gets generated* above.
3. **Install it:** drop the jar into a Pano install's `plugins/` folder.
4. **Confirm it loaded:** start Pano and open **Panel → Addons** — you should now see your addon listed by its `pluginName`.
