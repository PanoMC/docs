# Backend Development

The backend is the Kotlin half of your addon: the part that runs inside Pano's own Java process. It owns your database tables, your JSON endpoints, your permissions, and your admin activity logs. This page builds the **backend slice of Shoutbox** — the small addon we carry through these docs, where visitors see the latest "shouts" on the home page and admins post and remove them from the panel.

By the end you will have added a database table, exposed a public JSON API, guarded an admin endpoint with a permission, and written an activity-log entry — all with code that compiles. We stop at a **checkpoint** after each buildable step, so you confirm each piece works before moving on — instead of writing nine files and only discovering a typo in file 2 when file 9 fails.

::: tip Addons are plugins in code
Everywhere in prose we say **addon**, but the code-level names all use the word `plugin` — `PanoPlugin`, `pluginId`, `PluginConfig`, and so on. That is expected; do not rename anything in the code.
:::

## Before you start

You should already have a renamed, building addon from [Getting Started](/addon/getting-started/) — that page also sets up the running Pano instance your addon lives inside. **Please read [Architecture](/addon/architecture/) first if you haven't yet**; this whole page leans on it. The one idea you must carry in from there, in plain words:

> **Spring** is the library Pano uses to create your classes for you, so you never write `new`. A **context** is just a box of ready-made objects that Spring fills in. Pano gives your addon its own box and drops one copy of each of your classes into it — you then ask the box for whatever you need. (How Pano decides what goes in the box is explained just below.)

The backend lives under `src/main/kotlin/com/panomc/plugins/shoutbox/`, split into packages:

```
com/panomc/plugins/shoutbox/
├─ ShoutboxPlugin.kt
├─ config/       ShoutboxConfig.kt
├─ db/
│  ├─ model/     Shout.kt
│  ├─ dao/       ShoutDao.kt
│  ├─ impl/      ShoutDaoImpl.kt
│  └─ migration/ ShoutboxMigration1to2.kt
├─ routes/
│  ├─ api/       GetShoutsAPI.kt
│  └─ panel/     PanelAddShoutAPI.kt
├─ permission/   ManageShoutboxPermission.kt
├─ event/        SetupEventHandler.kt
└─ log/          CreatedShoutLog.kt
```

Here is what each of those files is for, in plain words:

| File | Plain-word meaning | Built in |
|---|---|---|
| `ShoutboxPlugin.kt` | your addon's main class — Pano starts here | Section 1 |
| `event/ SetupEventHandler.kt` | code that runs when Pano's setup wizard finishes | Section 1 |
| `config/ ShoutboxConfig.kt` | the settings the site owner is allowed to change | Section 2 |
| `db/model/ Shout.kt` | one row of your table, as a Kotlin object | Section 3 |
| `db/dao/ ShoutDao.kt` | the list of database queries you promise to provide | Section 3 |
| `db/impl/ ShoutDaoImpl.kt` | the actual SQL that keeps those promises | Section 3 |
| `db/migration/ ShoutboxMigration1to2.kt` | a later change to the table's shape | Section 4 |
| `routes/api/ GetShoutsAPI.kt` | a public web address that returns JSON | Section 5 |
| `routes/panel/ PanelAddShoutAPI.kt` | an admin-only web address | Section 6 |
| `permission/ ManageShoutboxPermission.kt` | the "can manage shoutbox" toggle for roles | Section 7 |
| `log/ CreatedShoutLog.kt` | one line in the admin activity feed | Section 8 |

**You will create these files one by one across sections 1–8 below — don't create them all now.** Each section says which file it is.

### How Pano builds your classes for you

You never wire these classes together by hand — no `new`, no "register this" calls. The whole trick is four plain ideas:

- An **annotation** is a label that starts with `@` and sits just above a class, like `@Endpoint`. It is **not** a comment — the compiler and Pano both read it.
- **Scanning:** when your addon loads, Pano looks through your package and finds every class wearing one of these labels — `@Endpoint`, `@Dao`, `@Migration`, `@EventListener`, or `@PermissionDefinition`.
- For each one it finds, Pano creates **one instance** (one object) and keeps it. A Pano-created, Pano-kept object like this is called a **bean** — that is all "bean" means anywhere on this page: an object Spring made for you.
- **Constructor injection:** if one of your classes asks for another of your beans in its constructor — `class GetShoutsAPI(private val shoutDao: ShoutDao)` — Pano hands you the ready-made one. Think of it like a delivery service: you list the ingredients on the order form (the constructor parameters) and they arrive at your door — you don't go shopping (you never call the constructor yourself).

One more thing that saves you the most common crash: there are **two boxes**.

- **Pano's box** (the *host context*) holds Pano's own services: `DatabaseManager`, `AuthProvider`, `SetupManager`, `PluginDatabaseManager`.
- **Your box** (the *plugin context*) holds the classes you write: your endpoints, DAOs, listeners.

Constructor injection only reaches **your** box. To grab something out of **Pano's** box you ask for it by hand: `applicationContext.getBean(SomeService::class.java)`. You will see this in almost every section.

::: warning Kotlin changes are never hot — rebuild and restart
Editing a `.kt` file changes nothing on its own. Every time you touch Kotlin you must rebuild the jar, copy it into your instance's `plugins/` folder, and **restart Pano**:

```bash
./gradlew build -Pnoui
cp build/libs/pano-plugin-shoutbox-local-build.jar <your-pano-instance>/plugins/
```

`-Pnoui` skips rebuilding the Svelte UI, which you don't need while working on Kotlin — it makes the build much faster.

Disabling and re-enabling the addon from **Panel → Addons** is **not** enough: Pano can't swap Java code that is already running, so only a full restart loads the new jar. (The technical reason, if you want it: Pano's PF4J plugin loader keeps the already-loaded *classloader*, and a running JVM can't replace it in place.) Your addon's **Svelte UI** does hot-reload under `bun run dev` — but **Kotlin never does**. Keep this rebuild-and-restart step in mind for every section below.
:::

::: tip Checkpoint: did it load?
After the restart, watch Pano's console — it should log your addon loading — and open **Panel → Addons**: **Shoutbox** should be listed. If the jar name in the `cp` line above doesn't match what you actually built, look in `build/libs/` — the name comes from your `pluginId` (which you set back in [Getting Started](/addon/getting-started/)).
:::

## 1. The entry class

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

Before the walkthrough, three bits of Kotlin syntax you'll see all over this page:

- `suspend` marks a function that is allowed to **wait** — for the database, the network — without freezing the whole server. Most functions you override on this page — the lifecycle hooks and every `handle()` — are declared `suspend`, so keep it even if you never write coroutine code yourself. (The one exception you'll meet below is `getValidationHandler`, which the base class declares **without** `suspend` — always match the exact signature of the function you're overriding.)
- `by lazy { ... }` means "don't run this until the first time it's actually used."
- `getBean(X::class.java)` means "give me Pano's ready-made X object" — it reaches into Pano's box (the host context) from above.

So the first line, `private val pluginDatabaseManager by lazy { applicationContext.getBean(PluginDatabaseManager::class.java) }`, reads as: *fetch Pano's database manager, but only when I first need it.*

Now what the class does, top to bottom:

- `applicationContext.getBean(...)` reaches **host beans** — Pano's own services (that's Pano's box). `PluginDatabaseManager` and `SetupManager` cannot be injected into your constructors, so you fetch them like this.
- `onStart()` runs when the addon loads. It calls `startPlugin()`, which bails out early if setup is not done yet.
- `PluginConfigManager` is created once and registered as a bean **in your own box** (`pluginBeanContext`). **Never take `PluginConfigManager` as a constructor parameter in an endpoint** — it doesn't exist yet at the moment your endpoints are built, so injecting it would crash. Section 2 explains exactly why and shows the safe way to read config.
- `pluginDatabaseManager.initialize(this)` creates your tables and runs any pending migrations.

### Why the setup gate

If someone installs your addon *before* they have finished Pano's first-run setup wizard, there is no database yet — `initialize()` would fail. So `startPlugin()` returns early. To pick things back up the moment setup completes, add a small event listener next to the plugin class (file `event/SetupEventHandler.kt`):

```kotlin
package com.panomc.plugins.shoutbox.event

import com.panomc.platform.api.annotation.EventListener
import com.panomc.platform.api.event.SetupEventListener
import com.panomc.plugins.shoutbox.ShoutboxPlugin

@EventListener
class SetupEventHandler(private val plugin: ShoutboxPlugin) : SetupEventListener {
    override suspend fun onSetupFinished() {
        plugin.startPlugin()
    }
}
```

When the wizard finishes, Pano fires `onSetupFinished()`, `startPlugin()` runs again, and the `isInitialized` guard makes it safe to call more than once.

- Where does `plugin` come from in that constructor? **Your own plugin class is injectable too.** Pano puts the single `ShoutboxPlugin` instance into your box, so any of your classes may take it as a constructor parameter — that's how this listener (and later the panel endpoint) gets hold of it. So the rule for "what can I inject?" is: anything in your box — your `@Dao`/`@Endpoint`/etc. classes, plus your plugin instance.

Every addon that touches the database needs this exact setup-gate pattern. Copy both classes as they are and change only the class names.

::: warning Use Pano's `@EventListener`, not Spring's
The annotation is `com.panomc.platform.api.annotation.EventListener` — **not** Spring's `org.springframework.context.event.EventListener`. They have the same simple name, so it is easy to import the wrong one; if you do, the event system silently never calls your listener.
:::

::: tip `PluginDatabaseManager` vs `DatabaseManager`
Two different beans, both fetched with `getBean`:
- **`PluginDatabaseManager`** manages *your* tables and migrations — `initialize(plugin)` and `uninstall(plugin)`.
- **`DatabaseManager`** is the host's database service. Use it for the shared SQL client (`databaseManager.getSqlClient()`) and to reach Pano's own **core DAOs** — users, posts, activity logs, … — which you both read *and* write through it (Section 6 writes an activity-log entry with `databaseManager.panelActivityLogDao.add(...)`). Working with Pano's own tables this way is exactly what `pano-plugin-bans` does — look there for that pattern.
:::

## 2. Configuration

Settings that the site owner should be able to tweak live in a config class extending `PluginConfig` (file `config/ShoutboxConfig.kt`):

```kotlin
package com.panomc.plugins.shoutbox.config

import com.panomc.platform.api.config.PluginConfig

class ShoutboxConfig(
    val enabled: Boolean = true,
    val maxShouts: Int = 5
) : PluginConfig()
```

On first run Pano writes this class out as a **config file** — in HOCON format, which looks like JSON with fewer quotes and commas — at `plugins/pano-plugin-shoutbox/config.conf`, filling in your defaults.

::: tip Checkpoint: open the generated config
After your addon has loaded once (rebuild → copy → restart), open `plugins/pano-plugin-shoutbox/config.conf`. You should see your two keys with their default values: `enabled` set to `true` and `maxShouts` set to `5`.
:::

### Reading config from an endpoint — and why not from a constructor

Remember the warning in Section 1: don't ask for `PluginConfigManager` in a constructor. Here's the reason, as a timeline of what happens when your addon loads:

```text
addon loads → your @Endpoint objects are created → onStart() runs → PluginConfigManager is registered → (later) a request arrives
```

Your endpoints are built at step 2, but `PluginConfigManager` isn't registered until step 4. So if an endpoint's constructor asked for it, Pano would have nothing to hand over and would crash with `NoSuchBeanDefinitionException`. The fix is to fetch it **when a request actually arrives** (step 5), not when the endpoint is built. Here is the complete, safe way to read a config value inside an endpoint's `handle`:

```kotlin
// fetch the config manager only now, at request time — never in the constructor
val configManager = plugin.pluginBeanContext.getBean(PluginConfigManager::class.java)
val config = configManager.config as ShoutboxConfig
val limit = config.maxShouts   // e.g. 5
```

`configManager.config` gives you back a typed `ShoutboxConfig`. To save changes to disk you call `configManager.saveConfig(JsonObject.mapFrom(newConfig))` with a filled-in config object. You will put this exact read pattern to work in Section 5, where `GetShoutsAPI` uses `maxShouts` to cap how many shouts it returns.

You can document individual keys in the generated file with `@ConfigComment("…")` on a field, and group related keys under a banner with `@ConfigSection("…")`. When you later need to add or rename config keys, don't edit the on-disk file by hand — Pano has a `PluginConfigMigration` class (annotated `@Migration`) for that. You won't need it on day one; see it in the [Backend API Reference](/addon/backend-reference/) when the time comes.

## 3. A database table

A table is three small files:

- a **model** — one Kotlin object that mirrors **one row** of the table;
- an **abstract DAO** — **DAO** stands for *Data Access Object*, jargon for "the one class whose only job is talking to one table." It's split in two: an *abstract* class that just **lists the method names** (their signatures) as a promise, with no code inside, and…
- an **impl** — short for *implementation*, the file that fills in each promised method with real SQL.

Pano only ever shows the abstract DAO (the promise) to the rest of your code; the impl stays hidden behind it.

### The model

```kotlin
package com.panomc.plugins.shoutbox.db.model

import com.panomc.platform.db.DBEntity

open class Shout(
    val id: Long? = null,
    val message: String = "",
    val username: String = "",
    val date: Long = 0
) : DBEntity()
```

Every model extends `DBEntity` so Pano can turn database rows into your Kotlin objects and back. Three habits to copy every time:

- keep the class `open` (so Pano can work with it),
- give every field a default value,
- make `id` nullable (`Long? = null`) — Pano fills `id` in for you *after* it inserts the row, so before insert there is no id.

Pano matches rows to objects **by name**: a field called `message` needs a column called `message`, `username` needs `username`, and so on. (Under the hood it uses Google's Gson library, if you're curious — but all you have to get right is that the field names and column names line up.)

The table name is the class name in snake_case plus your instance's **table prefix**. The prefix is whatever the site owner chose in Pano's setup wizard — the default is `pano_` — so on a default install `Shout` becomes the table `` `pano_shout` ``.

### The DAO contract

```kotlin
package com.panomc.plugins.shoutbox.db.dao

import com.panomc.platform.db.Dao
import com.panomc.plugins.shoutbox.db.model.Shout
import io.vertx.sqlclient.SqlClient

abstract class ShoutDao : Dao<Shout>(Shout::class.java) {
    abstract suspend fun add(shout: Shout, sqlClient: SqlClient): Long
    abstract suspend fun getAll(sqlClient: SqlClient): List<Shout>
    abstract suspend fun deleteById(id: Long, sqlClient: SqlClient)
}
```

- Copy the `: Dao<Shout>(Shout::class.java)` part exactly — it tells Pano which model this DAO belongs to.
- Notice every method takes `sqlClient: SqlClient` as a parameter, instead of the DAO holding its own connection. That looks odd at first ("why do I keep passing this thing around?"), but it's deliberate: the *caller* can thread **one** database connection through several queries — which is how transactions work later. For now, just accept the parameter and use it in your query.

### The implementation

This file has the most boilerplate on the page. **Copy it as-is** — the only parts you will ever edit are the SQL strings and the method bodies.

```kotlin
package com.panomc.plugins.shoutbox.db.impl

import com.panomc.platform.annotation.Dao
import com.panomc.plugins.shoutbox.db.dao.ShoutDao
import com.panomc.plugins.shoutbox.db.model.Shout
import io.vertx.kotlin.coroutines.coAwait
import io.vertx.mysqlclient.MySQLClient
import io.vertx.sqlclient.SqlClient
import io.vertx.sqlclient.Tuple
import org.springframework.beans.factory.config.ConfigurableBeanFactory
import org.springframework.context.annotation.Lazy
import org.springframework.context.annotation.Scope

@Dao
@Lazy
@Scope(value = ConfigurableBeanFactory.SCOPE_SINGLETON)
class ShoutDaoImpl : ShoutDao() {
    override val fields = listOf("id", "message", "username", "date")

    override suspend fun init(sqlClient: SqlClient) {
        sqlClient.query(
            """
            CREATE TABLE IF NOT EXISTS `${getTablePrefix() + tableName}` (
                `id` bigint NOT NULL AUTO_INCREMENT,
                `message` MEDIUMTEXT NOT NULL,
                `username` varchar(255) NOT NULL,
                `date` bigint NOT NULL,
                PRIMARY KEY (`id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """
        ).execute().coAwait()
    }

    override suspend fun uninstall(sqlClient: SqlClient) {
        sqlClient.query("DROP TABLE IF EXISTS `${getTablePrefix() + tableName}`").execute().coAwait()
    }

    override suspend fun add(shout: Shout, sqlClient: SqlClient): Long {
        val query = "INSERT INTO `${getTablePrefix() + tableName}` (`message`, `username`, `date`) VALUES (?, ?, ?)"
        val rows = sqlClient.preparedQuery(query)
            .execute(Tuple.of(shout.message, shout.username, shout.date))
            .coAwait()
        return rows.property(MySQLClient.LAST_INSERTED_ID)
    }

    override suspend fun getAll(sqlClient: SqlClient): List<Shout> {
        val rows = sqlClient
            .preparedQuery("SELECT ${fields.toTableQuery()} FROM `${getTablePrefix() + tableName}` ORDER BY `id` DESC")
            .execute()
            .coAwait()
        return rows.toEntities()
    }

    override suspend fun deleteById(id: Long, sqlClient: SqlClient) {
        sqlClient.preparedQuery("DELETE FROM `${getTablePrefix() + tableName}` WHERE `id` = ?")
            .execute(Tuple.of(id)).coAwait()
    }
}
```

A few things worth calling out — but nothing here you must fully understand to use it:

- The `@Dao @Lazy @Scope(SCOPE_SINGLETON)` trio is required — together they are how Pano discovers your DAO and keeps a single instance of it. Copy all three as-is.
- `init()` is where your `CREATE TABLE IF NOT EXISTS` lives; it runs when the addon's database is initialized. `uninstall()` is optional and runs only when the addon is deleted.
- Three Vert.x helpers show up in the query methods, and this is all you need to know about them: `coAwait()` means "wait for the database to answer"; `Tuple.of(a, b)` fills the `?` placeholders in the SQL in order; and `rows.property(MySQLClient.LAST_INSERTED_ID)` gives you the auto-generated `id` of the row you just inserted.
- `Row.toEntity()` / `RowSet.toEntities()` turn query rows straight into `Shout` objects, and `fields.toTableQuery()` builds the backtick-quoted column list for you.

Notice the columns above are `message`, `username`, `date` — the **same names** as the model's fields. When you write your own `CREATE TABLE` statements, keep every column name identical to its Kotlin field name, **camelCase and all**: if your model field is `createdAt`, the column must be `createdAt` too — **not** the SQL convention `created_at`. The name-matching row mapping depends on this. Follow that precedent for your own tables.

::: danger `onUninstall` drops your tables
`pluginDatabaseManager.uninstall(this)` runs **every DAO's `uninstall()`** — which for us means `DROP TABLE`. That fires on the panel's **Delete** action, not on **Disable**. Disabling keeps the data; deleting throws it away. Make sure your `uninstall()` only removes what you truly own.
:::

::: tip Checkpoint: build once and look around
You've now written six files — the plugin class, the event handler, the config, the model, the DAO, and its impl. Before writing any more, prove they work: rebuild, copy the jar into `plugins/`, and restart Pano (the rebuild-and-restart step from the top of the page). Then confirm all three of these:

- **Panel → Addons** lists **Shoutbox**.
- `plugins/pano-plugin-shoutbox/config.conf` exists on disk.
- your database now has a `pano_shout` table (check with your database tool, or run `SHOW TABLES;`).

If any of these is missing, fix it now — a typo caught here is far easier to find than the same typo caught after five more files.
:::

## 4. Evolving the schema with a migration

::: tip You don't need this today
This section solves a problem you won't have until you ship **version 2** of your addon. Skim it now so you know it exists, then come back when you actually need to change a table that's already live on real installs. If this is your first build of Shoutbox, feel free to jump straight to Section 5.
:::

Once your addon is out in the world you can't change the original `CREATE TABLE` — real installs already have the old shape. To add a column later, write a migration (file `db/migration/ShoutboxMigration1to2.kt`):

```kotlin
package com.panomc.plugins.shoutbox.db.migration

import com.panomc.platform.annotation.Migration
import com.panomc.platform.db.DatabaseMigration
import com.panomc.plugins.shoutbox.db.dao.ShoutDao
import io.vertx.kotlin.coroutines.coAwait
import io.vertx.sqlclient.SqlClient

@Migration
class ShoutboxMigration1to2(
    private val shoutDao: ShoutDao
) : DatabaseMigration(1, 2, "Add pinned column") {
    override val handlers: List<suspend (SqlClient) -> Unit> = listOf(
        addPinnedColumn()
    )

    private fun addPinnedColumn(): suspend (SqlClient) -> Unit =
        { sqlClient: SqlClient ->
            val query = "ALTER TABLE `${shoutDao.getTablePrefix() + "shout"}` " +
                "ADD COLUMN `pinned` TINYINT(1) NOT NULL DEFAULT 0"
            sqlClient.query(query).execute().coAwait()
        }
}
```

A couple of things in that code look advanced but mean something simple:

- `override val handlers: List<suspend (SqlClient) -> Unit>` — the type `suspend (SqlClient) -> Unit` just means "a step that takes the SQL client and does something (and returns nothing)." So `handlers` is simply the **ordered list of steps** this migration runs.
- The three values in `DatabaseMigration(1, 2, "Add pinned column")` are, in order: the version this migration upgrades **from** (`1`), the version it upgrades **to** (`2`), and a short human-readable label.

Pano tracks a **scheme version per addon** (the platform spells it *scheme*, but it means the same thing as the usual term *schema version*). It's keyed by your `pluginId` — the id you chose in [Getting Started](/addon/getting-started/). A migration whose `from` matches the stored version runs, and the version is then bumped to its `to` — so `1 → 2` runs once, on installs still at version 1, and never again. Fresh installs skip straight to the latest. To add another change later, write a `ShoutboxMigration2to3`, and so on.

::: warning Prefer `@Migration` classes over inline `ALTER TABLE`
It is tempting to add stray `ALTER TABLE` statements inside a DAO's `init()`. Don't — that bypasses the scheme-version tracking, so the change isn't recorded and can re-run or clash on upgrade. Schema changes after version 1 belong in a `@Migration` class.
:::

## 5. A public API endpoint

Now expose the shouts to the theme. A public JSON endpoint extends `Api` (file `routes/api/GetShoutsAPI.kt`):

```kotlin
package com.panomc.plugins.shoutbox.routes.api

import com.panomc.platform.annotation.Endpoint
import com.panomc.platform.model.*
import com.panomc.plugins.shoutbox.db.dao.ShoutDao
import io.vertx.ext.web.RoutingContext
import io.vertx.ext.web.validation.ValidationHandler
import io.vertx.ext.web.validation.builder.ValidationHandlerBuilder
import io.vertx.json.schema.SchemaRepository

@Endpoint
class GetShoutsAPI(private val shoutDao: ShoutDao) : Api() {
    override val paths = listOf(Path("/api/shoutbox/list", RouteType.GET))

    override fun getValidationHandler(schemaRepository: SchemaRepository): ValidationHandler =
        ValidationHandlerBuilder.create(schemaRepository).build()

    override suspend fun handle(context: RoutingContext): Result {
        val sqlClient = getSqlClient()
        return Successful(mapOf("shouts" to shoutDao.getAll(sqlClient)))
    }
}
```

What is happening:

- `@Endpoint` makes the route register itself the moment the addon loads — there is no registration call anywhere.
- `ShoutDao` is injected straight into the constructor, because it lives in **your box** alongside this endpoint (that's constructor injection, from the top of the page).
- `paths` lists the URL and HTTP method. Choose a base class by who is allowed in: `Api` (public), `LoggedInApi` (any signed-in user), `PanelApi` (admins), `SetupApi` (only during setup).
- `getSqlClient()` is a convenience on `Api` that hands you the shared SQL client.
- **You must override `getValidationHandler` even when there is nothing to validate** — return the empty builder exactly as shown (`ValidationHandlerBuilder.create(schemaRepository).build()`). Don't delete this override; the build needs it. Section 6 shows it doing real work on a request body.
- Success is `Successful(map)`, which serializes to `{"result":"ok", …your map…}`. To fail, you **throw** a platform `Error` subclass (`NotFound`, `BadRequest`, `NoPermission`, …) or your own; the error code sent to the client is the class name in `UPPER_SNAKE`.

::: tip Checkpoint: hit your first endpoint
This is the payoff — a URL of yours that returns your JSON. Rebuild, copy, restart, then open your endpoint in a browser (or `curl` it):

```
http://localhost:8088/api/shoutbox/list
```

Port `8088` is Pano's address when you started it with `--dev`; on a default install Pano listens on port `80`, so use `http://localhost/api/shoutbox/list` instead. Either way you should see:

```json
{"result":"ok","shouts":[]}
```

An **empty** `shouts` list — because nothing has posted a shout yet. You'll post one at the end of this page.
:::

**Optional: put `maxShouts` to work.** Remember `maxShouts` from Section 2? This endpoint is where it earns its keep. Using the config-read pattern from Section 2, you can cap the list to the configured number. Every API below you have already seen; the only additions are injecting `plugin` (your plugin class is injectable) and Kotlin's standard `take(n)`:

```kotlin
// Optional variant of handle(): respect maxShouts.
// For this to compile, also add `private val plugin: ShoutboxPlugin` to the constructor,
// alongside `shoutDao`, so you can reach pluginBeanContext.
val sqlClient = getSqlClient()
val configManager = plugin.pluginBeanContext.getBean(PluginConfigManager::class.java)
val limit = (configManager.config as ShoutboxConfig).maxShouts
return Successful(mapOf("shouts" to shoutDao.getAll(sqlClient).take(limit)))
```

That single change makes the config class, the request-time fetch rule, and the endpoint reinforce each other — instead of `maxShouts` sitting unused.

::: tip Panel paths start with `/api/panel/`
Panel URLs get rewritten once on the way in, which trips everyone up the first time. Read it as a mapping, left to right:

| The panel UI calls… | Pano rewrites it to… | So in Kotlin you write… |
|---|---|---|
| `POST /panel/api/shoutbox` | `/api/panel/shoutbox` | `Path("/api/panel/shoutbox", RouteType.POST)` |

**Rule of thumb:** in Kotlin, always start a panel endpoint's path with `/api/panel/`. That is why the endpoint in the next section uses `/api/panel/shoutbox`.
:::

## 6. A panel endpoint

Posting a shout is an admin action, so this endpoint does three things the public one didn't: it **validates the request body**, **checks a permission**, and **writes an activity-log entry**. It's the biggest code block on the page — as you read it, look for those three jobs in order (they map to the three bullets below the code).

::: warning Heads up: this file won't compile on its own yet
`PanelAddShoutAPI` refers to two classes you haven't written yet — `ManageShoutboxPermission` and `CreatedShoutLog` — which are Sections 7 and 8. Write all three, **then** build once. If you build right after this section, expect "unresolved reference" errors; that's the two missing classes, not a mistake in this file.
:::

File `routes/panel/PanelAddShoutAPI.kt`:

```kotlin
package com.panomc.plugins.shoutbox.routes.panel

import com.panomc.platform.annotation.Endpoint
import com.panomc.platform.auth.AuthProvider
import com.panomc.platform.db.DatabaseManager
import com.panomc.platform.error.BadRequest
import com.panomc.platform.model.*
import com.panomc.plugins.shoutbox.ShoutboxPlugin
import com.panomc.plugins.shoutbox.db.dao.ShoutDao
import com.panomc.plugins.shoutbox.db.model.Shout
import com.panomc.plugins.shoutbox.log.CreatedShoutLog
import com.panomc.plugins.shoutbox.permission.ManageShoutboxPermission
import io.vertx.ext.web.RoutingContext
import io.vertx.ext.web.validation.RequestPredicate
import io.vertx.ext.web.validation.ValidationHandler
import io.vertx.ext.web.validation.builder.Bodies
import io.vertx.ext.web.validation.builder.ValidationHandlerBuilder
import io.vertx.json.schema.SchemaRepository
import io.vertx.json.schema.common.dsl.Schemas.*

@Endpoint
class PanelAddShoutAPI(
    private val plugin: ShoutboxPlugin,
    private val shoutDao: ShoutDao
) : PanelApi() {
    override val paths = listOf(Path("/api/panel/shoutbox", RouteType.POST))

    private val authProvider by lazy { plugin.applicationContext.getBean(AuthProvider::class.java) }
    private val databaseManager by lazy { plugin.applicationContext.getBean(DatabaseManager::class.java) }

    override fun getValidationHandler(schemaRepository: SchemaRepository): ValidationHandler =
        ValidationHandlerBuilder.create(schemaRepository)
            .body(
                Bodies.json(
                    objectSchema()
                        .requiredProperty("message", stringSchema())
                )
            )
            .predicate(RequestPredicate.BODY_REQUIRED)
            .build()

    override suspend fun handle(context: RoutingContext): Result {
        authProvider.requirePermission(ManageShoutboxPermission(), context)

        val data = getParameters(context).body().jsonObject
        val message = data.getString("message")

        if (message.isNullOrBlank()) {
            throw BadRequest()
        }

        val sqlClient = getSqlClient()
        val userId = authProvider.getUserIdFromRoutingContext(context)
        val username = databaseManager.userDao.getUsernameFromUserId(userId, sqlClient)!!

        shoutDao.add(Shout(message = message, username = username, date = System.currentTimeMillis()), sqlClient)
        databaseManager.panelActivityLogDao.add(CreatedShoutLog(userId, username, plugin.pluginId, message), sqlClient)

        return Successful()
    }
}
```

Walking through the three new jobs:

- **Validation** uses the `Schemas` DSL (`objectSchema()`, `requiredProperty`, `stringSchema()`) plus `RequestPredicate.BODY_REQUIRED`. A request with a missing or malformed body is rejected before your `handle` ever runs.
- **Permission check:** `authProvider.requirePermission(ManageShoutboxPermission(), context)` is the very first line of `handle`. If the logged-in admin lacks the permission, it throws and the request is denied. (`AuthProvider` and `DatabaseManager` are Pano's own services, so you fetch them from Pano's box with `getBean`, exactly as in Section 1.)
- **Activity log:** `databaseManager.panelActivityLogDao.add(CreatedShoutLog(...), sqlClient)` records who posted what, so the admin panel's activity feed can show it.
- One bit of Kotlin syntax in there: `getUsernameFromUserId(userId, sqlClient)!!` ends with `!!`, which asserts "this value is not null — crash if it somehow is." It's safe here because a logged-in admin always has a username.

## 7. The permission

File `permission/ManageShoutboxPermission.kt`:

```kotlin
package com.panomc.plugins.shoutbox.permission

import com.panomc.platform.annotation.PermissionDefinition
import com.panomc.platform.auth.PanelPermission

@PermissionDefinition
class ManageShoutboxPermission : PanelPermission("fa-bullhorn")
```

`@PermissionDefinition` registers the permission automatically, and the string in the constructor is the FontAwesome icon shown next to it in the panel's permission list.

The **permission node** — the string you check against everywhere else — is derived from the class name by rule:

1. Drop the trailing `Permission` → `ManageShoutbox`.
2. Split into words, lowercase them, join with dots → `manage.shoutbox`.
3. Prefix with `pano.plugin.<pluginId>.` → **`pano.plugin.pano-plugin-shoutbox.manage.shoutbox`**.

You never type that node in Kotlin — passing `ManageShoutboxPermission()` to `requirePermission` is enough. But you **do** repeat the exact string in your frontend code to gate panel pages and nav links. See [Frontend Development](/addon/frontend/) for where; if you rename the Kotlin class, remember to update that copied string.

::: tip Checkpoint: see the permission in the panel
After a rebuild and restart, open **Panel → Roles** and edit a role — you should see a new permission with a **bullhorn** icon (that's the `fa-bullhorn` from the constructor). Grant it to a role to let that role's members post shouts.

One thing that surprises people: **admins bypass permission checks** — an admin account always passes `requirePermission`, so as an admin you can call Section 6's endpoint even without granting yourself anything. To actually see the `NO_PERMISSION` rejection, test with a **non-admin** role that has *not* been granted the permission.
:::

## 8. The activity log

An activity-log entry is a small class extending `PluginActivityLog`, carrying a `JsonObject` of details (file `log/CreatedShoutLog.kt`):

```kotlin
package com.panomc.plugins.shoutbox.log

import com.panomc.platform.db.model.PluginActivityLog
import io.vertx.core.json.JsonObject

class CreatedShoutLog(
    userId: Long,
    username: String,
    pluginId: String,
    message: String
) : PluginActivityLog(
    userId = userId,
    pluginId = pluginId,
    details = JsonObject().put("target", message).put("username", username)
)
```

The panel shows each log line on its **Activity** page. To find the text to display, it derives a locale key from your class name, the same way permissions derive their node:

1. Drop the trailing `Log` → `CreatedShout`.
2. Convert to `UPPER_SNAKE` → `CREATED_SHOUT`.
3. Look it up under an `activity-logs` object in your locale files → `activity-logs.CREATED_SHOUT`.

That locale string uses the `{username}` and `{target}` values from the `details` payload you built above. Setting it up is covered in [Localization](/addon/localization/).

::: warning You'll see a raw key until you add the locale string
Until you add `activity-logs.CREATED_SHOUT` to your locale files, the Activity page shows the raw key `CREATED_SHOUT` instead of a sentence. That's expected — it's not a bug, just the missing translation.
:::

## Try it end to end

Here is the full loop this page promised — a database table, a public JSON API, a guarded admin endpoint, and an activity-log entry, all working together. You've already seen the empty list; now create a shout and watch it appear.

1. **Before:** open `http://localhost:8088/api/shoutbox/list` (or the port `80` form on a default install). You should still see `{"result":"ok","shouts":[]}`.
2. **Post a shout:** send `POST /panel/api/shoutbox` with the JSON body `{"message":"Hello Pano!"}` as a logged-in admin. The easiest way is from the panel UI you'll build in [Frontend Development](/addon/frontend/); to do it right now, `curl` that URL through your browser's authenticated session (the endpoint needs your admin session cookie, which is why the panel UI is the simpler route).
3. **After:** refresh `http://localhost:8088/api/shoutbox/list` — your shout is now in the JSON:

```json
{"result":"ok","shouts":[{"id":1,"message":"Hello Pano!","username":"<you>","date":1700000000000}]}
```

4. **Activity feed:** open **Panel → Activity** — you'll see your `CREATED_SHOUT` entry (shown as the raw key until you add the locale string in [Localization](/addon/localization/)).

If all four steps line up, the backend half of Shoutbox is done.

## If it doesn't work

The five failures this page warns about, in one place — symptom, cause, fix:

| Symptom | Likely cause | Fix |
|---|---|---|
| Addon not listed in **Panel → Addons** | jar wasn't copied into `plugins/`, or Pano wasn't restarted | rebuild, `cp` the jar into the instance's `plugins/`, and **restart** Pano |
| Your event listener never fires (setup gate never runs) | you imported Spring's `@EventListener` instead of Pano's | use `com.panomc.platform.api.annotation.EventListener` |
| Crash: `NoSuchBeanDefinitionException` | you took `PluginConfigManager` (or another bean registered in `onStart`) as a constructor parameter | fetch it at request time with `plugin.pluginBeanContext.getBean(...)` instead (Section 2) |
| Request rejected with `NO_PERMISSION` | the (non-admin) role calling the panel endpoint hasn't been granted the permission | grant it in **Panel → Roles**, or test as an admin (admins bypass the check) |
| A Kotlin edit seems ignored | you disabled/enabled the addon instead of restarting | Kotlin isn't hot — rebuild and **restart** Pano |

## What else the backend can do

Shoutbox uses only a slice of the backend surface. There is more available — among them:

- **Events** — react to logins, registrations, account deletions, and fire your own cross-addon events.
- **Tokens & mail** — issue signed tokens and send templated emails (see `pano-plugin-auth-guard`).
- **Notifications** — push panel and user notifications.
- **Minecraft server communication** — send messages to and handle events from the in-game plugin.
- **Console commands** and **file uploads** — register CLI commands and accept multipart uploads.

## Where to next

- **[Backend API Reference](/addon/backend-reference/)** — the full lookup companion to this tutorial: every backend extension point by name, with its signature and source location, so you can find an API without reading platform source.
- **[Frontend Development](/addon/frontend/)** — build the Shoutbox widget and panel UI that call the endpoints you just wrote.
- **[Localization](/addon/localization/)** — translate your permission labels and activity-log messages.
- **[Architecture](/addon/architecture/)** — revisit the load lifecycle and the two Spring contexts.
