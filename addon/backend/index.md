# Backend Development

**What this page gives you:** the map of your addon's Kotlin half — the entry class Pano starts from, its lifecycle hooks, and how Pano finds and builds your classes for you — plus a signpost to the focused page for each thing the backend can do (endpoints, database, config, events, permissions).

The backend is the Kotlin half of your addon: the part that runs inside Pano's own Java process. It owns your database tables, your JSON endpoints, your permissions, and your admin activity logs. These pages build the **backend slice of Shoutbox** — the small addon we carry through the docs, where visitors see the latest "shouts" on the home page and admins post and remove them from the panel.

::: tip Addons are plugins in code
Everywhere in prose we say **addon**, but the code-level names all use the word `plugin` — `PanoPlugin`, `pluginId`, `PluginConfig`, and so on. That is expected; do not rename anything in the code.
:::

## Before you start

You should already have a renamed, building addon from [Getting Started](/addon/getting-started/) — that page also sets up the running Pano instance your addon lives inside. **Please read [Architecture](/addon/architecture/) first if you haven't yet**; this whole section leans on it. The one idea you must carry in from there, in plain words:

> **Spring** is the library Pano uses to create your classes for you, so you never write `new`. A **context** is just a box of ready-made objects that Spring fills in. Pano gives your addon its own box and drops one copy of each of your classes into it — you then ask the box for whatever you need.

The backend lives under `src/main/kotlin/com/panomc/plugins/shoutbox/` — the entry class `ShoutboxPlugin.kt` plus packages `config/`, `db/` (`model/`, `dao/`, `impl/`, `migration/`), `routes/` (`api/`, `panel/`), `permission/`, `event/`, and `log/`. You create these files one at a time; each focused page below names the file it builds — don't create them all now.

## How Pano builds your classes for you

You never wire these classes together by hand — no `new`, no "register this" calls. The whole trick is four plain ideas:

- An **annotation** is a label that starts with `@` and sits just above a class, like `@Endpoint`. It is **not** a comment — the compiler and Pano both read it.
- **Scanning:** when your addon loads, Pano looks through your package and finds every class wearing one of these labels — `@Endpoint`, `@Dao`, `@Migration`, `@EventListener`, or `@PermissionDefinition`.
- For each one it finds, Pano creates **one instance** (one object) and keeps it. A Pano-created, Pano-kept object like this is called a **bean** — that is all "bean" means anywhere in these docs: an object Spring made for you.
- **Constructor injection:** if one of your classes asks for another of your beans in its constructor — `class GetShoutsAPI(private val shoutDao: ShoutDao)` — Pano hands you the ready-made one. Think of it like a delivery service: you list the ingredients on the order form (the constructor parameters) and they arrive at your door — you never call the constructor yourself.

One more thing that saves you the most common crash: there are **two boxes**.

- **Pano's box** (the *host context*) holds Pano's own services: `DatabaseManager`, `AuthProvider`, `SetupManager`, `PluginDatabaseManager`.
- **Your box** (the *plugin context*) holds the classes you write: your endpoints, DAOs, listeners.

Constructor injection only reaches **your** box. To grab something out of **Pano's** box you ask for it by hand: `applicationContext.getBean(SomeService::class.java)`. You will see this on almost every page.

::: warning Kotlin changes are never hot — rebuild and restart
Editing a `.kt` file changes nothing on its own. Every time you touch Kotlin you must rebuild the jar, copy it into your instance's `plugins/` folder, and **restart Pano**:

```bash
./gradlew build -Pnoui
cp build/libs/pano-plugin-shoutbox-local-build.jar <your-pano-instance>/plugins/
```

`-Pnoui` skips rebuilding the Svelte UI, which you don't need while working on Kotlin — it makes the build much faster.

Disabling and re-enabling the addon from **Panel → Addons** is **not** enough: Pano can't swap Java code that is already running, so only a full restart loads the new jar. (The technical reason: Pano's PF4J plugin loader keeps the already-loaded *classloader*, and a running JVM can't replace it in place.) Your addon's **Svelte UI** does hot-reload under `bun run dev` — but **Kotlin never does**. Keep this rebuild-and-restart step in mind for every page below.
:::

## The entry class

Every addon has one main class extending `PanoPlugin`. Ours is `ShoutboxPlugin` (file `ShoutboxPlugin.kt`), and it does exactly one job on startup: initialize the config and the database — but **only after Pano's own setup wizard has finished**.

```kotlin
package com.panomc.plugins.shoutbox

import com.panomc.platform.api.PanoPlugin
import com.panomc.platform.api.PluginDatabaseManager
import com.panomc.platform.api.config.PluginConfigManager
import com.panomc.platform.setup.SetupManager
import com.panomc.plugins.shoutbox.config.ShoutboxConfig

class ShoutboxPlugin : PanoPlugin() {
    private val pluginDatabaseManager by lazy { applicationContext.getBean(PluginDatabaseManager::class.java) }
    private val setupManager by lazy { applicationContext.getBean(SetupManager::class.java) }
    private var isInitialized = false

    override suspend fun onStart() {
        startPlugin()
    }

    internal suspend fun startPlugin() {
        if (isInitialized || !setupManager.isSetupDone()) return

        val configManager = PluginConfigManager(this, ShoutboxConfig::class.java)
        pluginBeanContext.beanFactory.registerSingleton(PluginConfigManager::class.java.name, configManager)

        pluginDatabaseManager.initialize(this)
        isInitialized = true
    }

    override suspend fun onDisable() {
        isInitialized = false
    }

    override suspend fun onUninstall() {
        pluginDatabaseManager.uninstall(this)
    }
}
```

Three bits of Kotlin syntax you'll see all over these pages:

- `suspend` marks a function that is allowed to **wait** — for the database, the network — without freezing the whole server. Most functions you override are declared `suspend`, so keep it even if you never write coroutine code yourself. (The one exception you'll meet is `getValidationHandler`, which the base class declares **without** `suspend` — always match the exact signature of the function you're overriding.)
- `by lazy { ... }` means "don't run this until the first time it's actually used."
- `getBean(X::class.java)` means "give me Pano's ready-made X object" — it reaches into Pano's box (the host context) from above. `PluginDatabaseManager` and `SetupManager` cannot be injected into your constructors, so you fetch them like this.

What the class does, top to bottom:

- `onStart()` runs when the addon loads and calls `startPlugin()`.
- `PluginConfigManager` is created once and registered as a bean **in your own box** (`pluginBeanContext`). **Never take `PluginConfigManager` as a constructor parameter in an endpoint** — it doesn't exist yet at the moment your endpoints are built, so injecting it would crash. [Configuration](/addon/configuration/) explains exactly why and shows the safe way to read config.
- `pluginDatabaseManager.initialize(this)` creates your tables and runs any pending migrations.

**Why the early return?** If someone installs your addon *before* they finish Pano's first-run setup wizard, there is no database yet — `initialize()` would fail. So `startPlugin()` returns early, and a small event listener re-runs it the moment setup completes. That setup-gate listener, and everything else about reacting to platform actions, lives in [Events](/addon/events/).

::: tip `PluginDatabaseManager` vs `DatabaseManager`
Two different beans, both fetched with `getBean`:
- **`PluginDatabaseManager`** manages *your* tables and migrations — `initialize(plugin)` and `uninstall(plugin)`.
- **`DatabaseManager`** is the host's database service. Use it for the shared SQL client (`databaseManager.getSqlClient()`) and to reach Pano's own **core DAOs** — users, posts, activity logs, … — which you both read *and* write through it. Working with Pano's own tables this way is exactly what `pano-plugin-bans` does — look there for that pattern.
:::

::: tip Checkpoint: did it load?
After you rebuild and restart, watch Pano's console — it should log your addon loading — and open **Panel → Addons**: **Shoutbox** should be listed. If the jar name in the `cp` line above doesn't match what you actually built, look in `build/libs/` — the name comes from your `pluginId` (which you set back in [Getting Started](/addon/getting-started/)).
:::

## Build the rest, one piece at a time

Each capability is its own focused page. Reach for the one that matches what you're adding:

- **Add an API** (a URL that returns JSON) → **[Endpoints](/addon/endpoints/)**
- **Store data** in a table → **[Database & Migrations](/addon/database/)**
- **Add a settings file** the site owner can edit → **[Configuration](/addon/configuration/)**
- **React to platform actions** (setup finishing, logins, your own cross-addon events) → **[Events](/addon/events/)**
- **Gate admin features** and record admin actions → **[Permissions & Activity Logs](/addon/permissions/)**

Shoutbox uses only a slice of the backend surface. There is more available — cross-addon events, signed tokens and templated emails (`pano-plugin-auth-guard`), panel and user notifications, Minecraft-server communication, console commands, and file uploads. Every extension point is catalogued in the [Backend API Reference](/addon/backend-reference/).

## Where to next

- **[Endpoints](/addon/endpoints/)** — expose your first public JSON API and an admin-only panel endpoint.
- **[Database & Migrations](/addon/database/)** — add a table with a model, a DAO, and its SQL.
- **[Backend API Reference](/addon/backend-reference/)** — every backend extension point by name, with its signature and source location.
- **[Frontend Development](/addon/frontend/)** — build the Shoutbox widget and panel UI that call the endpoints you write.
