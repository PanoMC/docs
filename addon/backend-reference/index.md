# Backend API Reference

**What this page gives you:** every backend class, function, and annotation your addon can use, sorted by what you're trying to do. It is the lookup companion to the [Backend Development](/addon/backend/) tutorial — the tutorial shows *how* to wire the pieces together on the Shoutbox example; this page lists *what exists* so you never have to read platform source to find an extension point by name. (An *extension point* = a place where Pano lets your code plug in: a hook, an annotation, or a base class you extend.)

Each entry gives its name, a one-line purpose, and a minimal signature (the function's name, its parameters, and what it returns). Reach for the tutorial for worked, compiling code; reach for this page to answer "does an API for this exist, and what is it called?"

::: warning New to Pano addons? Read the tutorial first
This is a **reference**, not a starting point — it assumes you have already built an addon. If you found this page from search and none of it makes sense, do the [Backend Development](/addon/backend/) tutorial first. This page will make very little sense before it.
:::

### Which section do I need?

- Add an HTTP endpoint (a URL your addon answers) → **§3**
- Store data in the database → **§4**
- Read or write your own config file → **§5**
- React to logins, setup, routing, or account deletion → **§6**
- Restrict a panel page to certain admins (permissions) → **§7**
- Talk to the Minecraft server plugin → **§8**
- Issue magic-login links or one-time tokens → **§9**
- Send a notification or an email → **§10**
- Add a console command → **§11**
- Record an admin action in the Activity feed → **§12**
- Grab one of Pano's own services (database, auth, …) → **§13**
- Verify a premium license → **§14**
- Read a file bundled in your jar, or run a background job → **§15**

::: tip Vocabulary in 60 seconds
These words appear all over this page. Skim them once.

- **host** — the running Pano server that loads your addon jar. When a row says "the host does X", it means Pano itself, not your code.
- **bean** — an object the framework creates once and shares. You *ask for* a bean instead of constructing it.
- **context** — the box those beans live in. You get three: `pluginBeanContext` (yours), `pluginGlobalBeanContext` (shared between addons), and `applicationContext` (Pano's own — where its services live).
- **annotation** — a label like `@Endpoint` you write above a class. Pano scans your jar and wires up anything carrying one.
- **DAO** — Data Access Object: one small class that holds all the SQL for one database table.
- **migration** — a one-off upgrade step that converts a user's existing table or config from version N to N+1 when they update your addon.
- **suspend** — a function that can pause and wait without blocking a thread (see the box below).
- **Future / `coAwait()`** — a Vert.x result that isn't ready yet; inside a `suspend` function you append `.coAwait()` to wait for it.
- **JWT / token** — a signed string: anyone can read what's inside, but only the server could have produced it, so it can't be forged.
- **permission node** — a dotted string like `pano.plugin.x.manage` naming one permission; admins grant nodes to user groups.
- **HOCON** — a human-friendly JSON variant that allows comments; the format of `config.conf`.
- **PF4J** — the plugin-loading library Pano uses internally; you never call it directly.
:::

::: tip About `suspend`
`suspend` marks a function that can pause and wait — for a database query, an HTTP call — without blocking a thread. The one rule: **you can only call a `suspend` function from another `suspend` function.** You rarely have to think about it, because most entry points Pano hands you are already `suspend`: all the lifecycle hooks (`onStart()`, …) and every endpoint `handle()`. Call other `suspend` functions freely inside them. (A few entry points are the exception and are plain, non-`suspend` functions — `RouterEventListener`'s methods (§6) and `@Command` handlers (§11); you can't call `suspend` functions directly inside those.) If you call one from a plain (non-`suspend`) function you'll get a compiler error like *"suspend function should be called only from a coroutine or another suspend function"*.
:::

::: tip How to read this page
Each group below has a **table** (the API name, a one-line purpose, and its signature) and a `Source:` line — the file where it is defined (package `com.panomc.platform`, under `Pano/src/main/kotlin/` in the `pano-web-platform` repo), so you can always open the real code. Everything here is transcribed straight from that source. Watch for the word `suspend` in signatures — see the box just above.
:::

::: tip Addons are plugins in code
As everywhere in these docs: prose says **addon**, but the code uses `plugin` — `PanoPlugin`, `pluginId`, `PluginConfig`. Addon metadata (id, name, main class, dependencies) is not set in code; it lives in the jar manifest (the *jar manifest* = a small metadata text file packed inside your built `.jar`; Gradle writes it for you from `gradle.properties`) — see [Manifest Configuration](/addon/manifest/).
:::

::: tip Example plugins referenced on this page
Several rows point at real, working plugins as examples — `pano-plugin-slider`, `pano-plugin-auth-guard`, `pano-plugin-market`, `pano-plugin-social-login`, `pano-plugin-premium-login`. These are the built-in plugins that ship with Pano; their source lives in the `pano-web-platform` repository under `plugins/pano-plugin-*`. When a row says "see `pano-plugin-slider` `PanelAddSliderItemAPI`", open that plugin's source to read the full example.
:::

## 1. Entry class & lifecycle — `PanoPlugin`

Every addon has exactly one class extending `PanoPlugin`. It is three things at once: your entry point (the first class Pano loads), the place where Pano hands you ready-made objects — your logger, your data folder, the Vert.x instance — as properties you never construct yourself, and the owner of the lifecycle hooks (functions Pano calls at fixed moments).

*Source: `com.panomc.platform.api.PanoPlugin`*

### Injected properties

Pano fills these in for you before `onCreate()` runs; read them from anywhere in the class, and never assign them yourself. (Remember: *the host* = the running Pano server that loads your addon jar.)

Three of the rows below are Spring **contexts** — bean boxes. A **bean** is an object the framework creates once and shares; a **context** is the box those beans live in. You get three boxes: `pluginBeanContext` (yours), `pluginGlobalBeanContext` (shared between addons), and `applicationContext` (Pano's own — where its services live).

| Property | Type | What it is |
|---|---|---|
| `pluginId` | `String` | Your addon's id (from the manifest) |
| `vertx` | `Vertx` | The Vert.x instance — timers, event bus, `WebClient` |
| `pluginBeanContext` | `AnnotationConfigApplicationContext` | Spring context holding *your* beans |
| `pluginGlobalBeanContext` | `AnnotationConfigApplicationContext` | Shared context for cross-addon beans |
| `applicationContext` | `AnnotationConfigApplicationContext` | Host context — fetch Pano services with `getBean(...)` |
| `pluginEventManager` | `PluginEventManager` | Fire/receive cross-addon events |
| `pluginUiManager` | `PluginUiManager` | UI bundle registry (managed for you) |
| `environmentType` | `Main.Companion.EnvironmentType` | `DEVELOPMENT` / `RELEASE` |
| `releaseStage` | `ReleaseStage` | alpha / beta / stable channel |
| `pluginState` | `PluginState` | PF4J load state (PF4J = Pano's internal plugin loader; you never call it) |
| `pluginDataFolder` | `File` | `plugins/<pluginId>/` data dir (auto-created) |
| `logger` | `Logger` | SLF4J logger scoped to your class |

### Lifecycle hooks

All are `open suspend fun` with a default no-op body (`open` = you may override it; *no-op* = does nothing until you override it; `suspend` = see the box at the top). Override only what you need. They run in this order:

```
jar load → onCreate() → onEnable() → onStart()
        …running…
onStop() → onDisable() → onUninstall()
```

`verifyLicense()` is **not** part of this sequence — it runs on demand, when a site admin clicks *Refresh license* in the panel (premium addons only).

| Hook | Runs when |
|---|---|
| `onCreate()` | The plugin object is constructed — the first hook to run (your injected properties are already set by this point) |
| `onEnable()` | The addon is enabled — at server boot, or when an admin clicks *Enable* in the panel |
| `onStart()` | The addon starts — put your setup code here. First check `setupManager.isSetupDone()` and return early if it is `false` (see §13), so you never touch the database before the site is installed |
| `onStop()` | The addon is stopping — cancel timers/jobs here |
| `onDisable()` | The addon is disabled, its data kept — at server shutdown, or when an admin clicks *Disable* |
| `onUninstall()` | The addon is **deleted** (admin clicks *Delete*) — drop your tables here |
| `verifyLicense()` | Panel "Refresh license" button (premium addons) |

### Methods

| Method | Signature | Purpose |
|---|---|---|
| `registerSingletonGlobal` | `(bean: Any)` | Share a bean with other addons |
| `unRegisterGlobal` | `(bean: Any)` | Remove a shared bean |
| `register` | `(listener: PluginEventListener)` | Register a dynamic event listener |
| `unRegister` | `(listener: PluginEventListener)` | Remove a dynamic event listener |
| `registerCommands` | `(obj: Any)` | Register `@Command` methods on an object (`@Command` = an annotation that adds a console command — see §11) |
| `unRegisterCommands` | `(obj: Any)` | Remove them |
| `getLicenseManager` | `(): LicenseManager` | Host license service (premium) |
| `getLicenseJwtIssuer` | `(): String` | Expected `iss` for license JWTs |
| `getOwnJarSha256` | `(): String?` | SHA-256 of the loaded jar, or null |

::: warning Pano's own services are not constructor parameters
When Pano creates *your* classes it can pass your own DAOs and beans in as constructor parameters (this is called *constructor injection*). But you **cannot** ask for Pano's own services (`DatabaseManager`, `AuthProvider`, `SetupManager`, …) that way — those live in `applicationContext`, not in your context. Fetch them by hand instead:

```kotlin
// `by lazy` delays the lookup until first use, after the host has finished wiring everything up
private val authProvider by lazy { applicationContext.getBean(AuthProvider::class.java) }
```
:::

## 2. Annotations that auto-register your classes

An **annotation** is a label (like `@Endpoint`) you write above a class. When your addon loads, Pano scans your jar and automatically wires up any class carrying one of these labels — there is no manual registration call. The scan is rooted at your plugin main class's package, so your annotated classes must live in that package or a sub-package of it (a class in an unrelated package is silently never registered). All these annotations live in `com.panomc.platform.annotation` **except** `@EventListener`.

*Source: `com.panomc.platform.annotation.*`, `com.panomc.platform.api.annotation.EventListener`*

| Annotation | Put it on | Purpose |
|---|---|---|
| `@Endpoint` | an `Api` subclass | Register the HTTP route |
| `@Dao` | a `Dao` impl (pair with `@Lazy @Scope(SCOPE_SINGLETON)`) | Register the DAO singleton |
| `@Migration` | a `DatabaseMigration` or `PluginConfigMigration` | Register the migration |
| `@EventListener` | an event-listener class | Register the listener |
| `@PermissionDefinition` | a `Permission` subclass | Register the permission |
| `@NotificationDefinition` | a notification type | Register the notification type |
| `@Event` | a Minecraft-server WebSocket handler (used by the platform itself) | You'll see this in platform source, but addons can't use it — use `ServerManager.registerEvent` (§8) instead |
| `@Ignore` | an entity field | Exclude the field from column mapping |

A **DAO** (Data Access Object) is the class that holds the SQL for one table. Its `@Dao` implementation needs all three annotations stacked, plus the two Spring imports. Here is the whole class header for the Shoutbox example (`ShoutDao` is your abstract DAO, `ShoutDaoImpl` the one with the SQL):

```kotlin
import com.panomc.platform.annotation.Dao
import org.springframework.beans.factory.config.ConfigurableBeanFactory
import org.springframework.context.annotation.Lazy
import org.springframework.context.annotation.Scope

@Dao
@Lazy
@Scope(value = ConfigurableBeanFactory.SCOPE_SINGLETON)
class ShoutDaoImpl : ShoutDao()
```

(A **migration** = a one-off upgrade step that converts a user's existing table or config from version N to N+1 when they update your addon; see §4 and §5.)

::: warning Use Pano's `@EventListener`, not Spring's
The annotation is `com.panomc.platform.api.annotation.EventListener` — **not** `org.springframework.context.event.EventListener`. They have the same short name but come from different imports; import the wrong one and the event system silently never calls your listener. Check that your import line reads exactly `import com.panomc.platform.api.annotation.EventListener`.
:::

## 3. HTTP endpoints & routing

An **endpoint** = one URL your addon answers, for example `GET /api/shouts`. You make one by writing an `@Endpoint`-annotated class that extends one of the base API classes below; Pano passes your DAOs and beans into its constructor for you (constructor injection).

The smallest endpoint that compiles is a class, the paths it answers, and a `handle` that returns a result:

```kotlin
// imports: com.panomc.platform.model.* (Api, Path, RouteType, Result, Successful), com.panomc.platform.annotation.Endpoint
@Endpoint
class GetShoutsAPI : Api() {
    override val paths = listOf(Path("/api/shouts", RouteType.GET))

    override suspend fun handle(context: RoutingContext): Result {
        return Successful(mapOf("shouts" to listOf<String>()))
    }
}
```

*Source: `com.panomc.platform.model` (`Route`, `Path`, `RouteType`, `Api`, `LoggedInApi`, `PanelApi`, `SetupApi`, `Template`, `Result`, `Error`)*

### Route primitives

| Type | Signature | Purpose |
|---|---|---|
| `Path` | `Path(url: String, routeType: RouteType)` | One URL + method the endpoint answers |
| `RouteType` | `ROUTE`, `GET`, `POST`, `PUT`, `DELETE` | HTTP method — `ROUTE` matches *any* method, used for `Template` (HTML) routes |
| `Route.paths` | `val paths: List<Path>` | The paths this route handles (required) |
| `Route.order` | `open val order = 1` | If two routes could match the same URL, the one with the lower `order` is tried first |
| `Route.getValidationHandler` | `(schemaRepository): ValidationHandler?` | Request-body/query validation |
| `Route.corsHandler` | `open fun corsHandler(): Handler?` | Override CORS (defaults provided) |
| `Route.bodyHandler` | `open fun bodyHandler(): Handler?` | Override body parsing (see uploads) |

### Base classes — pick by who may call

| Base class | Who is allowed | Declare paths as |
|---|---|---|
| `Api` | Anyone (public) | `/api/...` |
| `LoggedInApi` | Any signed-in user | `/api/...` |
| `PanelApi` | Admins (extends `LoggedInApi`) | `/api/panel/...` |
| `SetupApi` | Only during first-run setup | `/api/...` |
| `Template` | Server-rendered HTML route | — |

`SetupApi` routes only exist while the first-run install wizard is running and disappear once the site is set up — you'll rarely need it.

::: tip Panel paths are declared `/api/panel/...`
The panel UI calls URLs like `/panel/api/...`, but Pano reroutes those to `/api/...` internally — so you always declare the `/api/panel/...` form. Concretely:

- Browser calls: `GET /panel/api/shouts`
- You declare: `Path("/api/panel/shouts", RouteType.GET)`
:::

### Handling a request (`Api` members)

| Member | Signature | Purpose |
|---|---|---|
| `handle` | `abstract suspend fun handle(context: RoutingContext): Result?` | Your endpoint body — return `Successful(...)` on success; to fail, **throw** an `Error` (see below), don't return it. (Returning `null` sends nothing back through the normal path — only do that if you wrote the response yourself.) |
| `getSqlClient` | `suspend fun getSqlClient(): SqlClient` | The shared SQL client |
| `getParameters` | `fun getParameters(context): RequestParameters` | Validated body/query/path params |
| `checkSetup` | `fun checkSetup()` | Throw `InstallationRequired` if setup isn't done |
| `isAllowedInDemo` | `open fun isAllowedInDemo(method: HttpMethod): Boolean` | Gate writes when the instance runs in demo mode |

### Results & errors

| Thing | Signature | Purpose |
|---|---|---|
| `Successful` | `Successful(map: Map<String, Any?> = emptyMap())` | Success → `{"result":"ok", …map…}` |
| `Errors` | `Errors(map: Map<String, Any?>)` | Field-level error payload — e.g. `Errors(mapOf("email" to true))` tells the frontend to highlight the email field |
| `Error` subclasses | `throw NotFound()` / `BadRequest()` / … | ~100 predefined in `com.panomc.platform.error` (`NotFound`, `BadRequest`, `NoPermission`, `NotLoggedIn`, `InternalServerError`, …) |
| Custom error | `class MyError : Error(statusCode, …)` | Client error code = the class name in `UPPER_SNAKE`: `class SlugTaken : Error(...)` → the client receives `"error": "SLUG_TAKEN"` |

To fail a request you **throw** an `Error` (Pano's `com.panomc.platform.model.Error`, **not** Kotlin's built-in `Error`) — you do not return it. Validation failures are turned into `BadRequest` for you.

### File uploads — custom `bodyHandler()`

Override `bodyHandler()` to accept multipart uploads, and validate with `Bodies.multipartFormData`. In the snippet below, `FILE_UPLOAD_SIZE` is a constant *you* define — a maximum upload size in bytes, e.g. `private const val FILE_UPLOAD_SIZE = 5 * 1024 * 1024`. Pattern (see `pano-plugin-slider` `PanelAddSliderItemAPI`):

```kotlin
override fun bodyHandler(): Handler<RoutingContext> =
    BodyHandler.create()
        .setDeleteUploadedFilesOnEnd(true)
        .setBodyLimit(FILE_UPLOAD_SIZE)

override fun getValidationHandler(schemaRepository: SchemaRepository): ValidationHandler =
    ValidationHandlerBuilder.create(schemaRepository)
        .body(Bodies.multipartFormData(objectSchema().property("title", stringSchema())))
        .predicate(RequestPredicate.MULTIPART)
        .build()
// uploaded files: context.fileUploads()
```

## 4. Database

Each database table needs **three small files** (plus optional migrations):

- `Shout.kt` — the row itself, a data class that extends `DBEntity`.
- `ShoutDao.kt` — an abstract class that *declares* the queries. **This is the type you inject** into endpoints.
- `ShoutDaoImpl.kt` — the `@Dao` class that holds the actual SQL.

The split lets your endpoints depend on the plain `ShoutDao` type while Pano supplies the SQL-carrying `ShoutDaoImpl` at runtime. The [Backend Development](/addon/backend/) tutorial builds one end to end.

*Source: `com.panomc.platform.db` (`Dao`, `DBEntity`, `DatabaseMigration`), `com.panomc.platform.api.PluginDatabaseManager`*

| Type | Signature | Purpose |
|---|---|---|
| `DBEntity` | `abstract class` (has static `gson`) | Base class for a row model — write `class Shout(...) : DBEntity()`. Heads-up: unlike `@Dao`, you *extend* this, you don't annotate with it |
| `@Ignore` | field annotation | Keep a model field out of column mapping |
| `Dao<T : DBEntity>` | `abstract class Dao<T>(entityClass: Class<T>)` | Base DAO |
| `Dao.init` | `abstract suspend fun init(sqlClient: SqlClient)` | `CREATE TABLE IF NOT EXISTS …` here |
| `Dao.uninstall` | `open suspend fun uninstall(sqlClient: SqlClient)` | `DROP TABLE …` (optional) |
| `Dao.fields` | `open val fields: List<String>` | Column names for query building |
| `Dao.tableName` | `protected val tableName` | Derived automatically from your entity class name (`ShoutItem` → `shout_item`); read-only — you don't set it |
| `Dao.getTablePrefix` | `fun getTablePrefix(): String` | The instance's table prefix |
| `Row.toEntity()` | extension | One row → your model (via Gson). Extension function from `com.panomc.platform.db` — call `row.toEntity()` on a result row |
| `RowSet.toEntities()` | extension | Many rows → `List<T>`. Same idea: call `rows.toEntities()` on a query result |
| `List<String>.toTableQuery()` | extension | Backtick-quoted column list |
| `DatabaseMigration` | `DatabaseMigration(from: Int, to: Int, info: String)` | A schema step; override `val handlers: List<suspend (SqlClient) -> Unit>` |
| `PluginDatabaseManager.initialize` | `suspend fun initialize(plugin: PanoPlugin)` | Create tables + run pending migrations |
| `PluginDatabaseManager.uninstall` | `suspend fun uninstall(plugin: PanoPlugin)` | Run every DAO's `uninstall()` |

**Waiting for query results (`coAwait`).** Every Vert.x database call returns a **Future** — a result that isn't ready yet. Inside a `suspend` function you append `.coAwait()` to wait for it and get the value:

```kotlin
// import io.vertx.kotlin.coroutines.coAwait
val rows = sqlClient.query("SELECT * FROM `shout`").execute().coAwait()
```

Raw SQL against **Pano's own** tables (not your addon's) goes through the host `DatabaseManager` — `databaseManager.getSqlClient()`, plus core DAOs like `userDao`.

**A migration, in full.** A `@Migration` class bumps the schema one version and lists one handler per change. Each handler runs your `ALTER TABLE` (or similar):

```kotlin
// import com.panomc.platform.annotation.Migration, com.panomc.platform.db.DatabaseMigration
@Migration
class ShoutMigration1to2(
    private val shoutDao: ShoutDao
) : DatabaseMigration(1, 2, "Add color column to shout table") {
    override val handlers: List<suspend (SqlClient) -> Unit> = listOf(
        { sqlClient: SqlClient ->
            val query = "ALTER TABLE `${shoutDao.getTablePrefix() + "shout"}` ADD COLUMN `color` VARCHAR(7) NOT NULL DEFAULT '#000000'"
            sqlClient.query(query).execute().coAwait()
        }
    )
}
```

::: warning `onUninstall` drops your tables
`pluginDatabaseManager.uninstall(this)` runs **every DAO's `uninstall()`** — that is the panel **Delete** action, not **Disable**. Disabling keeps the data.
:::

For a complete, compiling query — a real `SELECT` and `INSERT` written inside a DAO — follow the tutorial's [Database & Migrations](/addon/database/#the-implementation) page.

## 5. Configuration

A config class extending `PluginConfig` is written to `plugins/<pluginId>/config.conf` (HOCON — a human-friendly JSON variant that allows comments) the first time your addon runs, and read back as a normal Kotlin object — you write `config.apiKey`, not string lookups.

*Source: `com.panomc.platform.api.config` (`PluginConfig`, `PluginConfigManager`, `PluginConfigMigration`, `ConfigComment`, `ConfigSection`)*

| Type | Signature | Purpose |
|---|---|---|
| `PluginConfig` | `open class PluginConfig` (has `version: Int`) | Base for your config; add your own fields with defaults |
| `PluginConfigManager<T>` | `PluginConfigManager(plugin, T::class.java)` | Loads/saves the file for one config class |
| `.config` | `val config: T` | The current typed values |
| `.saveConfig` | `fun saveConfig(config: JsonObject)` | Persist changes to disk |
| `.configFilePath` | `val configFilePath: String` | Resolved path of `config.conf` |
| `PluginConfigMigration` | `PluginConfigMigration(from: Int, to: Int, versionInfo: String)` | Override `fun migrate(config: JsonObject)`; annotate `@Migration` |
| `@ConfigComment` | `@ConfigComment(vararg lines: String)` | Doc comment above a field in the generated file |
| `@ConfigSection` | `@ConfigSection(title: String)` | Group keys under a banner |

Why is `.config` a typed `T` but `.saveConfig` takes a `JsonObject`? Reading gives you your own typed class; saving takes a raw `JsonObject` so you can change just the keys you want. A save looks like:

```kotlin
configManager.saveConfig(JsonObject().put("apiKey", "new-value"))
```

Register the manager as a **singleton** (one shared instance) in your own `pluginBeanContext` during `onStart()`, then fetch it lazily when a request needs it. The two lines are:

```kotlin
val configManager = PluginConfigManager(this, ShoutboxConfig::class.java)
pluginBeanContext.beanFactory.registerSingleton(PluginConfigManager::class.java.name, configManager)
```

::: tip Checkpoint
After the first start, `plugins/<pluginId>/config.conf` should exist on disk, holding your default values.
:::

## 6. Event listeners

Most event listeners work the same way. (1) Implement the interface. (2) Annotate the class `@EventListener`. (3) Pano calls your methods when the event fires. The methods are `suspend` and do nothing by default, so you override only the ones you care about. Two listeners break that pattern — see the callouts under the table.

*Source: `com.panomc.platform.api.event.*`*

| Interface | Methods (plugin-relevant) |
|---|---|
| `SetupEventListener` | `onSetupFinished()` |
| `RouterEventListener` | `onInitRouteList(routes: MutableList<Route>)`, `onRouterCreate(router: Router)` |
| `AuthEventListener` | `onBeforeAuthenticate(context, sqlClient): LoginDecision?`, `onBeforeVerifyLinkCode(context, sqlClient): LoginDecision?`, `onBeforeLogin(user, context, sqlClient): LoginDecision?`, `onAfterLogin(user, context, sqlClient)`, `onAfterRegister(user, sqlClient)` |
| `PlayerEventListener` | `onDelete(user: User)` — account-deletion cleanup |
| `ProfilePictureEventListener` | `resolveProfilePictureUrl(user: User): String?` |
| `PluginLifecycleListener` | `onPluginLoad/Enable/Disable/Unload/Uninstall(plugin: PanoPlugin)` |
| `PluginEventListener` | Marker for your own cross-addon events |

**`AuthEventListener` methods** (the crowded row above, one per line):

- `onBeforeAuthenticate(context, sqlClient): LoginDecision?`
- `onBeforeVerifyLinkCode(context, sqlClient): LoginDecision?`
- `onBeforeLogin(user, context, sqlClient): LoginDecision?`
- `onAfterLogin(user, context, sqlClient)`
- `onAfterRegister(user, sqlClient)`

`onBeforeLogin` and friends return a `LoginDecision`: `Deny(errorKey, extras)`, `RequireUsername(userId)`, or `Allow`. (`errorKey` = a localization key — the id of a translated message shown to the user; see [Localization](/addon/localization/).)

Two ways to register a listener: an `@EventListener` class in your package (**fixed** — discovered once when the addon loads), or `plugin.register(listener)` / `plugin.unRegister(listener)` to add and remove listeners **while the addon is running**.

::: warning Exception 1 — `RouterEventListener` is not `suspend`
Unlike the others, `RouterEventListener`'s `onInitRouteList` and `onRouterCreate` are plain (non-`suspend`) **abstract** functions. You *must* implement both, and you can't call `suspend` functions directly inside them.
:::

::: warning Exception 2 — `PluginLifecycleListener` has no `@EventListener`
`PluginLifecycleListener` does **not** extend the `EventListener` marker, so you must **not** annotate it `@EventListener`: doing so never fires *and* breaks the host's internal `as EventListener` cast — it throws a `ClassCastException` while your plugin initializes. Register it explicitly instead:

```kotlin
applicationContext.getBean(PluginManager::class.java).addLifecycleListener(listener)
```
:::

::: tip Cross-addon events (advanced)
To let *other* addons react to something your addon does: define an interface that extends `PluginEventListener`, share your plugin so others can find it, then fire to every subscriber. Note that `getEventListeners` is a **companion-object** function (a function belonging to the class itself, not an instance), so you call it as `PluginEventManager.getEventListeners<...>()`, not on the injected `pluginEventManager`.

```kotlin
// Your addon (firing side): share yourself, then notify every subscriber
registerSingletonGlobal(this)
PluginEventManager.getEventListeners<ShoutCreatedListener>()
    .forEach { it.onShoutCreated(shout) }

// Another addon (listening side): implement the shared interface + annotate it
@EventListener
class MyShoutListener : ShoutCreatedListener {
    override suspend fun onShoutCreated(shout: Shout) { /* … */ }
}
```
:::

## 7. Permissions & authentication

A **permission node** is a dotted string (like `pano.plugin.x.manage`) that names one permission. Admins grant nodes to user groups in the panel; your code then checks whether the current user holds a node.

*Source: `com.panomc.platform.auth` (`Permission`, `PanelPermission`, `AuthProvider`)*

| Type | Signature | Node it produces |
|---|---|---|
| `Permission` | `open class Permission(iconName: String)` | `pano.<key>` |
| `PanelPermission` | `open class PanelPermission(iconName: String)` | `pano.plugin.<pluginId>.<dotted.key>` |
| `@PermissionDefinition` | class annotation | Auto-registers the permission |

(`iconName` = a Font Awesome icon name shown next to the permission in the panel, e.g. `"fa-bullhorn"` or `"fa-comments"`.)

The node is derived automatically from the class name. Example first:

`ManageShoutboxPermission` → `pano.plugin.pano-plugin-shoutbox.manage.shoutbox`

The rule: drop the trailing `Permission`, split the remaining words, lowercase them, join with dots, and (for a plugin `PanelPermission`) prefix `pano.plugin.<pluginId>.`. You repeat this exact string in your frontend code to gate (show/hide) panel pages and nav links — see the [Frontend API Reference](/addon/api-reference/).

**`AuthProvider`** (host bean via `getBean`):

| Method | Signature | Purpose |
|---|---|---|
| `requirePermission` | `suspend fun requirePermission(permission: Permission, context: RoutingContext)` | Throw if the user lacks it |
| `hasPermission` | `suspend fun hasPermission(permission: Permission, context: RoutingContext): Boolean` | Non-throwing check |
| `isLoggedIn` | `suspend fun isLoggedIn(context: RoutingContext): Boolean` | — |
| `hasAccessPanel` | `suspend fun hasAccessPanel(context: RoutingContext): Boolean` | Any panel access at all |
| `getUserIdFromRoutingContext` | `fun getUserIdFromRoutingContext(context: RoutingContext): Long` | Current user id |
| `requirePassword` | `suspend fun requirePassword(password: String?, context: RoutingContext)` | Re-auth (throws if wrong) |
| `isUserAdmin` | `suspend fun isUserAdmin(userId: Long): Boolean` | — |

## 8. Minecraft server communication

If the site owner runs the companion `pano-mc-plugin` on their Minecraft server, that plugin keeps an **encrypted WebSocket** connection open to Pano (a WebSocket = a two-way, always-open network connection, unlike a normal one-shot HTTP request; Pano encrypts every message on it with AES-256-GCM). `ServerManager` is your handle on that connection: register handlers for messages coming *in*, and send messages *out* (see `pano-plugin-premium-login`). If no server is connected, there's nothing to talk to.

*Source: `com.panomc.platform.server` (`ServerManager`, `ServerEvent`, `PlatformMessage`)*

| Member | Signature | Purpose |
|---|---|---|
| `ServerManager.registerEvent` | `fun registerEvent(event: ServerEvent<*, *>)` | Handle an inbound event type |
| `ServerManager.unregisterEvent` | `fun unregisterEvent(event: ServerEvent<*, *>)` | Stop handling it |
| `ServerManager.sendMessage` | `fun sendMessage(message: PlatformMessage, server: Server)` | Fire-and-forget to one server |
| `ServerManager.getConnectedServers` | `fun getConnectedServers(): Map<Server, ServerWebSocket>` | Currently connected servers (key = the `Server`, value = its live WebSocket) |
| `ServerManager.isConnected` | `fun isConnected(id: Long): Boolean` | — |
| `ServerEvent<R, M>` | `abstract suspend fun handle(request: R, server: Server): M?` | Inbound event handler (R = the request payload you receive, M = the message type you optionally reply with; `M?` means the reply is optional) |
| `PlatformMessage` | `interface` | Outbound message shape |

(`ServerEvent<*, *>` in the rows above just means "a `ServerEvent` of any request/response types".)

**Wire names** are derived from the class name: a `ServerEvent` strips the `Event` suffix, a `PlatformMessage` strips `Message`, then both convert to `UPPER_SNAKE` (`getEventName()` / `getResponseName()`). So `PlayerJoinEvent` ⇄ wire name `PLAYER_JOIN`.

## 9. Tokens

A **token** here is a signed string in **JWT** format: anyone can read what's inside it, but only the server could have produced it, so it can't be forged. Use tokens for magic-login links and one-time actions. Register your token *type* with the host so it is unregistered automatically when your addon unloads (see `pano-plugin-auth-guard` `MagicLoginTokenType`).

*Source: `com.panomc.platform.token` (`TokenType`, `TokenTypeRegistry`, `TokenProvider`)*

| Member | Signature | Purpose |
|---|---|---|
| `TokenType` | `interface` — `getName(): String`, `getExpireDate(): Long` (expiry as epoch millis) | Your token type (name defaults from class name minus `TokenType`, `UPPER_SNAKE`) |
| `TokenTypeRegistry.registerPluginToken` | `fun registerPluginToken(pluginId: String, tokenType: TokenType)` | Register (auto-removed on unload) |
| `TokenProvider.generateToken` | `fun generateToken(subject: String, tokenType: TokenType): Pair<String, Long>` | Returns `(tokenString, expiresAtEpochMillis)` — the signed token and when it expires (epoch milliseconds) |
| `TokenProvider.saveToken` | `suspend fun saveToken(token: String, subject: String, tokenType: TokenType, expireDate: Long, sqlClient: SqlClient, ipAddress: String? = null, userAgent: String? = null)` | Persist it |
| `TokenProvider.isTokenValid` | `suspend fun isTokenValid(token: String, tokenType: TokenType, sqlClient: SqlClient): Boolean` | — |
| `TokenProvider.invalidateToken` | `suspend fun invalidateToken(token: String, sqlClient: SqlClient)` | Revoke one |
| `TokenProvider.invalidateTokensBySubjectAndType` | `suspend fun invalidateTokensBySubjectAndType(subject: String, type: TokenType, sqlClient: SqlClient)` | Revoke a subject's tokens of a type |
| `TokenProvider.parseToken` | `fun parseToken(token: String): DecodedJWT` | Decode claims |

## 10. Notifications & mail

*Source: `com.panomc.platform.notification` (`NotificationManager`, `UserNotificationType`, `PanelUserNotificationType`), `com.panomc.platform.mail` (`MailManager`, `Mail`)*

**Notifications** appear under the bell icon in the theme and panel top bar. Subclass `UserNotificationType` or `PanelUserNotificationType`, annotate `@NotificationDefinition`, then send via `NotificationManager`:

| Method | Sends to |
|---|---|
| `sendNotification(…)` | One user |
| `sendPanelNotification(…)` | One user's panel |
| `sendNotificationToAll(…)` | Every user |
| `sendPanelNotificationToAll(…)` | Every user's panel |
| `sendNotificationToAllAdmins(…)` | All admins |
| `sendNotificationToAllWithPermission(…)` | Everyone holding a permission |

The common one, in full: `suspend fun sendNotification(userId: Long, userNotificationType: UserNotificationType, sqlClient: SqlClient)`. The other five follow the same shape (see `NotificationManager`, from source line 33).

**Mail** — implement `Mail`, send with `MailManager` (see `pano-plugin-auth-guard` `MagicLoginMail`):

| Member | Signature | Purpose |
|---|---|---|
| `MailManager.sendMail` | `suspend fun sendMail(sqlClient, userId: Long?, mail: Mail, email: String? = null)` | Render + send |
| `Mail.templatePath` | `val templatePath: String` | Path to your Handlebars template (Handlebars = an HTML template language with `{{placeholders}}`). The path points inside your jar's resources — see §15 "Jar resource read" |
| `Mail.subject` | `val subject: String` | Subject line |
| `Mail.generateParameters` | `suspend fun generateParameters(systemParameters, i18nManager, locale): MailParameters` | Template variables |

## 11. Console commands

Pano has an interactive **console** — the terminal window where the platform jar runs. `@Command` methods let you add your own commands to it. Annotate methods `@Command`, then register the object that holds them.

*Source: `com.panomc.platform.command` (`Command`, `CommandSender`)*

| Member | Signature | Purpose |
|---|---|---|
| `@Command` | `@Command(name, aliases = [], description = "", usage = "")` | Marks a command method |
| method shape | `(sender: CommandSender)` or `(sender: CommandSender, args: Array<String>)` | The handler |
| `PanoPlugin.registerCommands` | `fun registerCommands(obj: Any)` | Register all `@Command` methods on `obj` |
| `PanoPlugin.unRegisterCommands` | `fun unRegisterCommands(obj: Any)` | Remove them |
| `CommandSender.sendMessage` | `fun sendMessage(message: String)` | Reply to the caller |

::: tip Checkpoint
After registering, type `help` in the console — your command's name and description should be listed.
:::

## 12. Activity logs

Record admin actions so they appear on the panel's Activity feed. Subclass `PluginActivityLog` and insert through the host `DatabaseManager`.

*Source: `com.panomc.platform.db.model.PluginActivityLog`*

| Member | Signature | Purpose |
|---|---|---|
| `PluginActivityLog` | `open class PluginActivityLog(userId: Long, pluginId: String, details: JsonObject = JsonObject())` | Your log entry |
| insert | `databaseManager.panelActivityLogDao.add(log, sqlClient)` | Write it |

Inside an endpoint, wire it up like this — grab the SQL client, grab the host `DatabaseManager`, then add your log:

```kotlin
val sqlClient = getSqlClient()
val databaseManager = applicationContext.getBean(DatabaseManager::class.java)
databaseManager.panelActivityLogDao.add(CreatedShoutLog(userId, pluginId), sqlClient)
```

::: tip Checkpoint
The entry now shows up on the panel's **Activity** page.
:::

The panel renders each entry with a locale key derived from the class name (minus `Log`, `UPPER_SNAKE`) under an `activity-logs` object — `CreatedShoutLog` → `activity-logs.CREATED_SHOUT`. Each key in the `details` `JsonObject` you pass is substituted into the matching `{{placeholder}}` in that locale string. See [Localization](/addon/localization/).

## 13. Host beans

Pano's own services are **beans** (objects the framework creates once and shares) living in the host `applicationContext`. Fetch any of them with `applicationContext.getBean(SomeService::class.java)`. They are **not** injected into your constructors — you always fetch them by hand (ideally `by lazy`, see §1).

::: details Spring implementation detail (safe to skip)
Most of the beans below (`DatabaseManager`, `PluginDatabaseManager`, `SetupManager`, `AuthProvider`, `ServerManager`, `TokenProvider`, `NotificationManager`, `MailManager`, `LicenseManager`, `ConfigManager`, `PluginManager`) are `@Component` classes — and `TokenTypeRegistry` a `@Service` — discovered by `@ComponentScan("com.panomc.platform")`; only the infrastructure beans (`Vertx`, `Router`, `WebClient`, `Gson`, `SchemaRepository`, plus the logger, template engine, `HttpClient`, `PluginUiManager` and `PluginEventManager`) are declared with `@Bean` in `com.panomc.platform.SpringConfig`. You don't need any of this to *use* them — `getBean(...)` works the same either way.
:::

| Bean | Use it for |
|---|---|
| `DatabaseManager` | Shared SQL client, core DAOs, `panelActivityLogDao` |
| `PluginDatabaseManager` | Your tables & migrations |
| `SetupManager` | `isSetupDone()` — call it first and skip database access until it returns `true` (this is the "gate on setup" from §1) |
| `AuthProvider` | Permission & login checks |
| `ServerManager` | Minecraft server comms |
| `TokenProvider` / `TokenTypeRegistry` | Tokens |
| `NotificationManager` | Notifications |
| `MailManager` | Email |
| `LicenseManager` | Premium license fetch |
| `ConfigManager` | Host (platform) config |
| `Vertx` | Timers, event bus |
| `WebClient` | Outbound HTTP |
| `Gson` | JSON (shared instance) |
| `Router` | The Vert.x web router |
| `SchemaRepository` | Validation schemas |
| `PluginManager` | Plugin registry |

## 14. License (premium addons)

Premium addons verify a signed license against a build-time public key. Pano only *downloads* the license file for you — it does **not** check it; your addon must verify the signature itself. This is a summary — the full wiring, the copy-in `PluginLicenseClient`/`LicenseGuard`, and failure behavior are covered in [Premium Addons & Licensing](/addon/premium/).

*Source: `com.panomc.platform.license` (`LicenseManager`, `SignedLicense`, `LicenseClaims`, `LicenseRequiredException`)*

| Member | Signature | Purpose |
|---|---|---|
| `PanoPlugin.getLicenseManager` | `(): LicenseManager` | Host service that fetches the JWT |
| `LicenseManager.requireLicense` | `(plugin, resourceId, version)` | Fetch (cached) license for your addon |
| `SignedLicense.verifySignature` | `(publicKey, expectedIssuer)` | Check the signature (RS256 = a public/private-key signature scheme) using the public key you ship inside your jar |
| `LicenseClaims` | `issuer, platformId, resourceId, userId, version, jarSha256, issuedAtMs, expiresAtMs, keyId, tokenId` | Parsed claims to cross-check |
| `LicenseRequiredException` | `(pluginId, reason, message, cause)` | Throw this from `onStart()` so the addon refuses to start without a valid license (safer than starting anyway) |

## 15. Miscellaneous & patterns

Small utilities and two recurring idioms that are not single APIs but are worth naming.

| Thing | Where | Purpose |
|---|---|---|
| Jar resource read | your class loader | Files you bundle inside your jar (mail templates, keys) are read with `javaClass.classLoader.getResourceAsStream(path)` (a *class loader* is the thing that reads files packed in the jar). Note: `PanoPlugin` has no `getResource` helper of its own. See `pano-plugin-auth-guard` `MagicLoginMail` |
| `pluginDataFolder` | `PanoPlugin` | Your `plugins/<pluginId>/` dir (uploads, `config.conf`) |
| `logger` | `PanoPlugin` | Class-scoped SLF4J logger |

**Background jobs** — schedule with Vert.x and guard against overlap with an `AtomicBoolean`; cancel in `onStop()`/`onDisable()` (see `pano-plugin-market` `MarketPlugin`). In the snippet below, `setPeriodic`'s argument is in **milliseconds**, so `60_000` means every 60 seconds; the `AtomicBoolean` flag stops a new run from starting while the previous one is still going:

```kotlin
private var timerId: Long? = null
private val running = AtomicBoolean(false)

override suspend fun onStart() {
    timerId = vertx.setPeriodic(60_000) {
        if (!running.compareAndSet(false, true)) return@setPeriodic
        // …launch work, then running.set(false) in a finally…
    }
}

override suspend fun onDisable() {
    timerId?.let { vertx.cancelTimer(it) }
    timerId = null
}
```

The commented line hides the tricky part — launching `suspend` work from the (non-`suspend`) timer callback. For the full, compiling version, read `pano-plugin-market` `MarketPlugin`.

**Masking secrets** — a config `GET` endpoint should return secret fields masked (hidden). Reveal the real value only through a *separate* endpoint that first re-checks the admin's password. Two ways to do that check:

- **Option A:** `authProvider.requirePassword(password, context)` — see `pano-plugin-auth-guard` `TwoFactorDisableAPI`.
- **Option B:** a manual `databaseManager.userDao.isLoginCorrect(...)` check — see `pano-plugin-social-login` `PanelRevealSecretAPI`.

## Where to next

- **[Backend Development](/addon/backend/)** — the worked Shoutbox tutorial that puts these APIs together into compiling code.
- **[Localization](/addon/localization/)** — locale keys for permissions and activity logs.
- **[Premium Addons & Licensing](/addon/premium/)** — the full license-verification wiring for group 14.
- **[Frontend API Reference](/addon/api-reference/)** — the `pano.*` and `@panomc/sdk` surface for the UI half.
