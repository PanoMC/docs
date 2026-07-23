# Backend

Shoutbox is loaded, but it has no memory yet. On this page we give it a **database table** to store shouts, a **JSON API** the home page can read, and a **permission** so only trusted admins can post. This is the Kotlin half — the part that runs inside Pano's own Java process.

Full reference (with every file's complete code): [Backend Development](/addon/backend/). We'll show the key pieces here and link there for the rest.

::: warning The rebuild-and-restart rhythm
Kotlin is never hot. Every time you finish a step below, run this from your addon folder, then **restart Pano**:

```sh
./gradlew build -Pnoui
cp build/libs/pano-plugin-shoutbox-local-build.jar ..
```

Disabling/enabling the addon in the panel is **not** enough — only a full restart loads new Kotlin. We'll remind you at each checkpoint.
:::

## How Pano finds your code

You never wire these classes together by hand — no `new`, no "register this" call. You put an **annotation** (a `@Something` label) above a class, and when the addon loads Pano scans your package, creates one instance of each annotated class, and hands each one whatever other classes it asks for in its constructor. That last part is **dependency injection**: list what you need as constructor parameters, and Pano delivers it.

One gotcha to carry through the whole page: there are **two boxes**. Your own classes (endpoints, DAOs) live in *your* box and inject into each other freely. Pano's own services (`DatabaseManager`, `SetupManager`, …) live in a *separate* box — you fetch those by hand with `applicationContext.getBean(Service::class.java)`. See [Architecture](/addon/architecture/) for the full mental model.

## 1. The entry class and the setup gate

Your main class extends `PanoPlugin`. On startup it does one job: initialize the config and database — but **only after Pano's first-run setup wizard has finished** (before that there's no database, and `initialize()` would fail).

```kotlin
class ShoutboxPlugin : PanoPlugin() {
    private val pluginDatabaseManager by lazy { applicationContext.getBean(PluginDatabaseManager::class.java) }
    private val setupManager by lazy { applicationContext.getBean(SetupManager::class.java) }
    private var isInitialized = false

    override suspend fun onStart() { startPlugin() }

    internal suspend fun startPlugin() {
        if (isInitialized || !setupManager.isSetupDone()) return

        val configManager = PluginConfigManager(this, ShoutboxConfig::class.java)
        pluginBeanContext.beanFactory.registerSingleton(PluginConfigManager::class.java.name, configManager)

        pluginDatabaseManager.initialize(this)   // creates tables, runs pending migrations
        isInitialized = true
    }

    override suspend fun onUninstall() { pluginDatabaseManager.uninstall(this) }
}
```

If someone installs Shoutbox *before* finishing setup, `startPlugin()` bails out early. To pick it back up the moment setup completes, add a small event listener (`event/SetupEventHandler.kt`) that calls `plugin.startPlugin()` again. Every addon that touches the database needs this exact setup-gate pattern — copy both classes from [Backend Development § 1](/addon/backend/#_1-the-entry-class) and change only the names.

::: warning Use Pano's `@EventListener`, not Spring's
The event listener's annotation must be `com.panomc.platform.api.annotation.EventListener` — **not** Spring's `org.springframework.context.event.EventListener`. They share a name; import the wrong one and your listener silently never fires.
:::

## 2. Config (optional but easy)

Settings the site owner can tweak live in a `PluginConfig` subclass:

```kotlin
class ShoutboxConfig(
    val enabled: Boolean = true,
    val maxShouts: Int = 5
) : PluginConfig()
```

On first run Pano writes these defaults to `plugins/pano-plugin-shoutbox/config.conf`. Reading a value **from inside an endpoint** has one rule — fetch the config manager at request time, never in a constructor — explained in [Backend Development § 2](/addon/backend/#_2-configuration).

## 3. A database table

A table is three small files:

- **model** (`Shout.kt`) — one Kotlin object mirroring one row;
- **abstract DAO** (`ShoutDao.kt`) — the list of queries you promise to provide;
- **impl** (`ShoutDaoImpl.kt`) — the actual SQL that keeps those promises.

The model:

```kotlin
open class Shout(
    val id: Long? = null,
    val message: String = "",
    val username: String = "",
    val date: Long = 0
) : DBEntity()
```

Three habits to copy every time: keep the class `open`, give every field a default, and make `id` nullable (Pano fills it in after insert). Pano matches rows to objects **by name** — a field `message` needs a column `message`, camelCase and all.

The DAO contract lists the queries you'll use:

```kotlin
abstract class ShoutDao : Dao<Shout>(Shout::class.java) {
    abstract suspend fun add(shout: Shout, sqlClient: SqlClient): Long
    abstract suspend fun getAll(sqlClient: SqlClient): List<Shout>
    abstract suspend fun deleteById(id: Long, sqlClient: SqlClient)
}
```

The **impl** carries the `@Dao @Lazy @Scope(SCOPE_SINGLETON)` trio and holds the SQL (`CREATE TABLE IF NOT EXISTS`, `INSERT`, `SELECT`, `DELETE`). It's the most boilerplate on the page — **copy it as-is** from [Backend Development § 3](/addon/backend/#_3-a-database-table) and edit only the SQL strings. The table name is your class in snake_case plus the site's prefix, so on a default install `Shout` becomes the table `pano_shout`.

::: danger Delete drops your table
`onUninstall()` runs every DAO's `uninstall()` (a `DROP TABLE`). That fires on the panel's **Delete** action, not **Disable**. Disabling keeps the data; deleting throws it away.
:::

::: tip Checkpoint: build once and look around
Rebuild, copy the jar into `plugins/`, and **restart Pano**. Then confirm all three:

- **Panel → Addons** lists **Shoutbox**.
- `plugins/pano-plugin-shoutbox/config.conf` exists on disk.
- your database now has a `pano_shout` table (check with `SHOW TABLES;`).

A typo caught here is far easier to find than the same typo after five more files.
:::

### Changing the table later: migrations

You can't change the original `CREATE TABLE` once real installs have the old shape. To add a column in **version 2**, write a `DatabaseMigration` class annotated `@Migration`. You don't register it anywhere — the `@Migration` annotation *is* the registration, and `pluginDatabaseManager.initialize(this)` (from Section 1) runs any pending migration once, on installs that are behind. You won't need this on day one; the full pattern is in [Backend Development § 4](/addon/backend/#_4-evolving-the-schema-with-a-migration).

## 4. A public JSON endpoint

Now expose the shouts to the theme. A public endpoint extends `Api`, and `ShoutDao` is injected straight into the constructor because it lives in your box:

```kotlin
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

- `@Endpoint` makes the route register itself the instant the addon loads — there's no registration call.
- The base class picks who's allowed in: `Api` (public), `LoggedInApi` (signed-in), `PanelApi` (admins), `SetupApi` (setup only).
- **You must override `getValidationHandler` even with nothing to validate** — return the empty builder exactly as shown. Don't delete it; the build needs it.
- `Successful(map)` serializes to `{"result":"ok", …your map…}`.

::: tip Checkpoint: hit your first endpoint
Rebuild, copy, restart, then open your endpoint in a browser (or `curl` it):

```
http://localhost:8088/api/shoutbox/list
```

(Port `8088` is Pano's `--dev` address; on a default install use `http://localhost/api/shoutbox/list`.) You should see:

```json
{"result":"ok","shouts":[]}
```

An **empty** list — nothing has posted a shout yet. That empty `shouts` array is proof your table, DAO, and endpoint all line up.
:::

## 5. A permission

Posting a shout should be admin-only. Define a permission with a single small class:

```kotlin
@PermissionDefinition
class ManageShoutboxPermission : PanelPermission("fa-bullhorn")
```

`@PermissionDefinition` registers it automatically; the string is the Font Awesome icon shown in the panel. The **permission node** you'll check elsewhere is derived from the class name by rule → `pano.plugin.pano-plugin-shoutbox.manage.shoutbox`. You never type that node in Kotlin — passing `ManageShoutboxPermission()` to `requirePermission` is enough — but you **will** repeat the exact string in your frontend code, so remember it.

::: tip Checkpoint: see the permission
After a rebuild and restart, open **Panel → Roles** and edit a role — a new permission with a **bullhorn** icon should appear. One surprise: **admins bypass permission checks**, so to actually see a `NO_PERMISSION` rejection you must test with a non-admin role that hasn't been granted it.
:::

## Posting a shout (the panel endpoint)

The public `GET` only reads. To *post* a shout you add a panel `POST` endpoint (`PanelApi`) that validates the body, checks `ManageShoutboxPermission`, writes the row, and records an activity-log entry. It's the biggest code block in the backend, so we won't reprint it here — build it from [Backend Development § 6](/addon/backend/#_6-a-panel-endpoint).

::: tip Panel paths start with `/api/panel/`
The panel UI calls `POST /panel/api/shoutbox`, but Pano rewrites it, so in Kotlin you always write the path as `Path("/api/panel/shoutbox", RouteType.POST)`.
:::

Once that endpoint exists, post `{"message":"Hello Pano!"}` to it as an admin and refresh `/api/shoutbox/list` — your shout is now in the JSON. (The easiest way to send that POST is from the panel UI, which we build next.)

## Where we are

Shoutbox now has a table, a public API, and a permission — a working backend. Time to make it visible: let's put those shouts on the home page.

**Next: [Frontend →](/handbook/addon/frontend/)**
