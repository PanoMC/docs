# Backend Development

The backend is the Kotlin half of your addon: the part that runs inside Pano's own Java process. It owns your database tables, your JSON endpoints, your permissions, and your admin activity logs. This page builds the **backend slice of Shoutbox** — the small addon we carry through these docs, where visitors see the latest "shouts" on the home page and admins post and remove them from the panel.

By the end you will have added a database table, exposed a public JSON API, guarded an admin endpoint with a permission, and written an activity-log entry — all with code that compiles.

::: tip Addons are plugins in code
Everywhere in prose we say **addon**, but the code-level names all use the word `plugin` — `PanoPlugin`, `pluginId`, `PluginConfig`, and so on. That is expected; do not rename anything in the code.
:::

## Before you start

You should already have a renamed, building addon from [Getting Started](/addon/getting-started/), and it helps to have read [Architecture](/addon/architecture/) so the folder layout and the two Spring contexts make sense. The backend lives under `src/main/kotlin/com/panomc/plugins/shoutbox/`, split into packages:

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

You never wire these classes together by hand. When Pano loads your addon it gives it its **own Spring context** that scans only your package subtree, and any class annotated `@Endpoint`, `@Dao`, `@Migration`, `@EventListener`, or `@PermissionDefinition` is created for you with constructor injection.

::: warning Kotlin changes are never hot
Editing a `.kt` file changes nothing until you rebuild the jar, copy it into your instance's `plugins/` folder, and **restart Pano**:

```bash
./gradlew build -Pnoui
cp build/libs/pano-plugin-shoutbox-local-build.jar <your-pano-instance>/plugins/
```

Disabling and re-enabling the addon from **Panel → Addons** does *not* load rebuilt bytecode — PF4J keeps the already-loaded classloader — so a full Pano restart is what picks up the new jar. Only the Svelte UI is live under `bun run dev`. Keep this in mind as you work through the examples below.
:::

## 1. The entry class

Every addon has one main class extending `PanoPlugin`. Ours is `ShoutboxPlugin`, and it does exactly one job on startup: initialize the config and the database — but **only after Pano's own setup wizard has finished**.

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

Read it top to bottom:

- `applicationContext.getBean(...)` reaches **host beans** — Pano's own services. `PluginDatabaseManager` and `SetupManager` are not injectable into your constructors; you fetch them like this. (See the callout at the end of this section.)
- `onStart()` runs when the addon loads. It calls `startPlugin()`, which bails out early if setup is not done yet.
- `PluginConfigManager` is created once and registered as a singleton **in your own bean context** (`pluginBeanContext`). Do **not** take it as a constructor parameter in an endpoint — your `@Endpoint` beans are instantiated when the addon *loads*, before `onStart()` registers this singleton, so constructor injection would fail with `NoSuchBeanDefinitionException`. Instead fetch it lazily, at request time: `plugin.pluginBeanContext.getBean(PluginConfigManager::class.java)`.
- `pluginDatabaseManager.initialize(this)` creates your tables and runs any pending migrations.

### Why the setup gate

If someone installs your addon *before* they have finished Pano's first-run setup wizard, there is no database yet — `initialize()` would fail. So `startPlugin()` returns early. To pick things back up the moment setup completes, add a small event listener next to the plugin class:

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

When the wizard finishes, Pano fires `onSetupFinished()`, `startPlugin()` runs again, and because of the `isInitialized` guard it is safe to call more than once. This setup-gating idiom is the canonical shape for every addon that touches the database — copy it verbatim, changing only the class names.

::: warning Use Pano's `@EventListener`, not Spring's
The annotation is `com.panomc.platform.api.annotation.EventListener` — **not** Spring's `org.springframework.context.event.EventListener`. They have the same simple name, so it is easy to import the wrong one; if you do, the event system silently never calls your listener.
:::

::: tip `PluginDatabaseManager` vs `DatabaseManager`
Two different beans, both fetched with `getBean`:
- **`PluginDatabaseManager`** manages *your* tables and migrations — `initialize(plugin)` and `uninstall(plugin)`.
- **`DatabaseManager`** is the host's database service. Use it for the shared SQL client (`databaseManager.getSqlClient()`) and for core DAOs (users, posts, activity logs, …). Reading Pano's own tables is exactly what `pano-plugin-bans` does — look there for that pattern.
:::

## 2. Configuration

Settings that the site owner should be able to tweak live in a config class extending `PluginConfig`:

```kotlin
package com.panomc.plugins.shoutbox.config

import com.panomc.platform.api.config.PluginConfig

class ShoutboxConfig(
    val enabled: Boolean = true,
    val maxShouts: Int = 5
) : PluginConfig()
```

On first run Pano writes this out as a HOCON file at `plugins/pano-plugin-shoutbox/config.conf`, using your defaults. From anywhere you hold the `PluginConfigManager` you registered in step 1, you read the typed values with `configManager.config` (which gives you a `ShoutboxConfig`) and persist changes with `configManager.saveConfig(JsonObject.mapFrom(...))`.

You can document individual keys in the generated file with `@ConfigComment("…")` on a field, and group related keys under a banner with `@ConfigSection("…")`. When you later need to add or rename keys, do it with a `PluginConfigMigration(from, to, versionInfo)` class annotated `@Migration` — never by editing the on-disk file by hand.

## 3. A database table

A table is three small files: a **model** (one row), an **abstract DAO** (the query methods you promise), and an **impl** (the SQL).

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

`DBEntity` is an **abstract class** (not an annotation). Rows are converted to and from your model with Gson, so **each field name maps to a column of the same name**. The table name is the class name in snake_case plus your instance's table prefix — so `Shout` becomes `` `<prefix>shout` ``.

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

### The implementation

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

Three details worth calling out:

- The `@Dao @Lazy @Scope(SCOPE_SINGLETON)` trio is required — that is how Pano discovers your DAO and keeps one instance of it.
- `init()` is where your `CREATE TABLE IF NOT EXISTS` lives; it runs when the addon's database is initialized. `uninstall()` is optional and runs only when the addon is deleted.
- `Row.toEntity()` / `RowSet.toEntities()` turn query rows straight into `Shout` objects, and `fields.toTableQuery()` builds the backtick-quoted column list for you.

Notice the columns above are `message`, `username`, `date` — plain field names, and `date` is camelCase-friendly rather than SQL-style `created_at`. Existing addons write their own DDL with **camelCase column names that match the model's field names**, because that is what the Gson row mapping expects. Follow that precedent for your own tables.

::: danger `onUninstall` drops your tables
`pluginDatabaseManager.uninstall(this)` runs **every DAO's `uninstall()`** — which for us means `DROP TABLE`. That fires on the panel's **Delete** action, not on **Disable**. Disabling keeps the data; deleting throws it away. Make sure your `uninstall()` only removes what you truly own.
:::

## 4. Evolving the schema with a migration

Once your addon is out in the world you can't change the original `CREATE TABLE` — real installs already have the old shape. To add a column later, write a migration:

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

Pano tracks a **scheme version per addon** (keyed by your `pluginId`). A migration whose `from` matches the stored version runs, and the version is bumped to its `to` — so `1 → 2` runs once, on installs still at version 1, and never again. Fresh installs skip straight to the latest. To add another change later, write a `ShoutboxMigration2to3` and so on.

::: warning Prefer `@Migration` classes over inline `ALTER TABLE`
It is tempting to add stray `ALTER TABLE` statements inside a DAO's `init()`. Don't — that bypasses the scheme-version tracking, so the change isn't recorded and can re-run or clash on upgrade. Schema changes after version 1 belong in a `@Migration` class.
:::

## 5. A public API endpoint

Now expose the shouts to the theme. A public JSON endpoint extends `Api`:

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
- `ShoutDao` is injected straight into the constructor, because it lives in your bean context alongside this endpoint.
- `paths` lists the URL and HTTP method. Choose a base class by who is allowed in: `Api` (public), `LoggedInApi` (any signed-in user), `PanelApi` (admins), `SetupApi` (only during setup).
- `getSqlClient()` is a convenience on `Api` that hands you the shared SQL client.
- Success is `Successful(map)`, which serializes to `{"result":"ok", …your map…}`. To fail, you **throw** a platform `Error` subclass (`NotFound`, `BadRequest`, `NoPermission`, …) or your own; the error code sent to the client is the class name in `UPPER_SNAKE`.
- The `getValidationHandler` here is empty because a `GET` list needs no body. You will see it do real work in the next section.

::: tip Panel paths start with `/api/panel/`
Pano reroutes `/panel/api/*` to `/api/*` internally, so **panel endpoints declare their path as `/api/panel/...`** even though the panel UI calls `/panel/api/...`. That is why the endpoint below uses `/api/panel/shoutbox`.
:::

## 6. A panel endpoint

Posting a shout is an admin action, so it needs three things the public endpoint didn't: **request validation**, a **permission check**, and an **activity-log entry**. All three appear in one endpoint:

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

Walking through the new pieces:

- **Validation** uses the `Schemas` DSL (`objectSchema()`, `requiredProperty`, `stringSchema()`) plus `RequestPredicate.BODY_REQUIRED`. A request with a missing or malformed body is rejected before your `handle` ever runs.
- **`authProvider.requirePermission(ManageShoutboxPermission(), context)`** is the very first line of `handle`. If the logged-in admin lacks the permission, it throws and the request is denied. Fetch `AuthProvider` and `DatabaseManager` from the host with `getBean`, exactly as before.
- **The activity log** is written with `databaseManager.panelActivityLogDao.add(CreatedShoutLog(...), sqlClient)`, so the admin panel's activity feed shows who posted what.

The endpoint references two classes we haven't written yet — `ManageShoutboxPermission` and `CreatedShoutLog`. They are the next two sections.

## 7. The permission

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

## 8. The activity log

An activity-log entry is a small class extending `PluginActivityLog`, carrying a `JsonObject` of details:

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

The panel renders this on its Activity page using a locale string keyed by the class name (minus the `Log` suffix, in `UPPER_SNAKE`) under an `activity-logs` object in your locale files — so `CreatedShoutLog` looks up `activity-logs.CREATED_SHOUT`. That string uses the `{username}` and `{target}` values from the details payload. Setting it up is covered in [Localization](/addon/localization/).

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
