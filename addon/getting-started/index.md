# Getting Started

This page takes you from nothing to your own **addon** showing a page on your site, in three steps and with no file written by hand. You don't need prior Pano experience, only a little Kotlin and JavaScript.

A Pano **addon** adds features to a Pano site: pages and widgets on the *theme* (the public site), screens in the *panel* (the admin dashboard at `/panel`), and APIs on the backend, all in one installable JAR.

::: tip Addon and plugin are the same thing
Addons are Pano *plugins*. The code-level names use the word `plugin` (`PanoPlugin`, `pluginId`). The prose says **addon**; nothing is renamed.
:::

An addon has two halves that work together: a **Kotlin backend** that runs inside Pano (loaded through PF4J, which you never touch) and a **Svelte UI**. You can ship either half alone, but the scaffold writes both. [Architecture](/addon/architecture/) explains the internals afterwards. To *install* addons rather than build them, see [Addons](/platform/addons/).

## What you need

| You need | Check it with |
|---|---|
| **A JDK, 17 or newer** | `java -version` |
| **Bun** ([bun.sh](https://bun.sh)) | `bun --version` |
| **Pano running on this machine**, with **Panel → Platform Settings → Development Mode** switched on | open `/panel` |

Pano must run locally: the addon lives in that install's `plugins/` folder while you work. See [Installation](/platform/installation/) if you have none yet. In `cmd` or PowerShell use `gradlew.bat` where you see `./gradlew`.

## The quick-start

```sh
cd <your-pano>/plugins && bunx @panomc/plugin-kit new my-plugin    # asks five questions, then installs
cd my-plugin && bun run dev        # first run builds the jar (minutes); restart Pano once, then open /my-plugin
```

Three steps: scaffold, dev, restart Pano. The scaffold is always created inside Pano's `plugins/` folder, because Pano finds a plugin's development sources at `plugins/<pluginId>`; the folder is the plugin id, and an existing folder is refused. Without an id the command asks for the id, a name, the author, the Kotlin package and whether to install now. `new <id> [--package x.y]` asks nothing.

After the restart, open `http://<your Pano address>/my-plugin`: the page is there, and it shows the answer of a scaffolded endpoint. **Panel → Addons** lists the addon too.

::: tip Slow first build, stuck install
The first Gradle build downloads Gradle and the toolchain and can look frozen for several minutes; do not cancel it. If `bun install` hangs on "Resolving...", stop it and run `bun install --backend=copyfile`.
:::

## What you get

| File | What it is |
|---|---|
| `src/theme/views/HelloPage.svelte` | the page at `/my-plugin`; it shows the answer of `GetHelloAPI` |
| `src/main/kotlin/<package>/routes/GetHelloAPI.kt` | `GET /api/plugins/my-plugin/hello`, declared as `/hello` |
| `src/main/kotlin/<package>/MyPlugin.kt` | the plugin class |
| `src/main/resources/frontend-targets.json` | links your plugin sends out (empty), see [API reference](/addon/api-reference/#link-targets-and-fallback-pages) |
| `build.gradle.kts`, `gradle.properties`, Gradle wrapper | the build; `copyJar` puts the jar in the folder named by `panoPluginsDir` (`..`) |
| `package.json`, `rollup.config.js` | two devDependencies (`@panomc/sdk`, `@panomc/plugin-kit`) and a two-line rollup file |

The simplest page the author ever writes, and its endpoint:

```svelte
<!-- src/theme/views/HelloPage.svelte -->
<script module>export const view = { path: '/hello' };</script>
<h1>Hello</h1>
```

```kotlin
@Endpoint
class GetHelloAPI : Api() {
    override val paths = listOf(Path("/hello", RouteType.GET))
    override suspend fun handle(context: RoutingContext) = Successful(mapOf("message" to "hi"))
}
```

## The dev loop

`bun run dev` builds the jar once (without the UI) if none exists, checks that Development Mode is on, then watches the UI. What each change needs:

| You changed | To see it |
|---|---|
| a view, a helper or a controller under `src/theme/` | `bun run dev` running, then refresh |
| `src/main/resources/locales/*.json` | refresh (Development Mode on) |
| Kotlin code | `./gradlew build -Pnoui`, then **restart Pano** |
| `gradle.properties` | full `./gradlew build`, then restart |

::: warning Kotlin is never hot
Disabling and re-enabling the addon in the panel does not load new Kotlin code; the server keeps the old code until a restart loads the new jar.
:::

`-Pnoui` skips the UI build and is only for backend iteration; a release build must include the UI (see [Building & Publishing](/addon/publishing/)).

## Adding things

```
New page:     src/theme/views/X.svelte with  export const view = { path: '/x' }
Helper:       any .js beside it, imported as usual (ships readable)
Closed logic: src/theme/controllers/x.js   ->   plugin('my-plugin').require('x')
Panel page:   src/main.js  ->  pano.ui.page.register({ path, component })
Sample data:  bunx pano-plugin samples X          Check: bunx pano-plugin check
```

The [Frontend](/addon/frontend/) page covers each of these.

## When it doesn't work

1. **Not listed in Panel → Addons.** Did you restart Pano after the first build? Is the jar directly in `plugins/`? Check the server log for a plugin-load error.
2. **A UI or locale edit doesn't show.** Is `bun run dev` still running, Development Mode on, and the folder at `plugins/<pluginId>/`?
3. **A Kotlin edit has no effect.** Rebuild with `./gradlew build -Pnoui` and restart.
4. **The dev server hangs.** Never add a Vite proxy rule for `/plugins`: the UI server already serves it and a proxy loops.
5. **"needs API level 0".** The scaffold writes `apiLevel=1` in `gradle.properties`; do not remove it.

## Where to next

- **[Frontend](/addon/frontend/)**: named views, helpers, controllers, samples, widgets.
- **[API reference](/addon/api-reference/)**: relative endpoint paths, `api.get`, error codes, pages, link targets, webhooks.
- **[Backend](/addon/backend/)**: tables, endpoints, permissions.
- **[Architecture](/addon/architecture/)**: what happens when Pano loads your JAR.
- **[Building & Publishing](/addon/publishing/)**: ship a release.
