# Backend API Reference

The complete backend surface of a Pano addon, grouped by concern. This is the lookup companion to the [Backend Development](/addon/backend/) tutorial: the tutorial shows *how* to wire the pieces together on the Shoutbox example, this page lists *what exists* so you never have to read platform source to find an extension point by name.

Each entry gives its name, a one-line purpose, and a minimal signature. Reach for the tutorial for worked, compiling code; reach for this page to answer "does an API for this exist, and what is it called?"

::: tip Verified against source
Everything on this page is transcribed from the platform source. The `Source:` line under each group points at the defining file in `pano-web-platform` (package `com.panomc.platform`, under `Pano/src/main/kotlin/`), so you can always confirm a signature or read the surrounding code.
:::

::: tip Addons are plugins in code
As everywhere in these docs: prose says **addon**, but the code uses `plugin` — `PanoPlugin`, `pluginId`, `PluginConfig`. Addon metadata (id, name, main class, dependencies) is not set in code; it lives in the jar manifest, generated from `gradle.properties` — see [Manifest Configuration](/addon/manifest/).
:::

## 1. Entry class & lifecycle — `PanoPlugin`

Every addon has exactly one class extending `PanoPlugin`. It is your entry point, the holder of the injected runtime handles, and the owner of the lifecycle hooks.

*Source: `com.panomc.platform.api.PanoPlugin`*

### Injected properties

Set by the host before `onCreate()`; read them from anywhere in the class.

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
| `pluginState` | `PluginState` | PF4J load state |
| `pluginDataFolder` | `File` | `plugins/<pluginId>/` data dir (auto-created) |
| `logger` | `Logger` | SLF4J logger scoped to your class |

### Lifecycle hooks

All are `open suspend fun`, default no-op — override only what you need. Ordered:

```
jar load → onCreate() → onEnable() → onStart()
        …running…
onStop() → onDisable() → onUninstall()
```

| Hook | Runs when |
|---|---|
| `onCreate()` | The plugin object is constructed |
| `onEnable()` | The addon is enabled |
| `onStart()` | The addon starts — your init goes here (gate on setup) |
| `onStop()` | The addon is stopping — cancel timers/jobs here |
| `onDisable()` | The addon is disabled (data kept) |
| `onUninstall()` | The addon is **deleted** — drop your tables here |
| `verifyLicense()` | Panel "Refresh license" button (premium addons) |

### Methods

| Method | Signature | Purpose |
|---|---|---|
| `registerSingletonGlobal` | `(bean: Any)` | Share a bean with other addons |
| `unRegisterGlobal` | `(bean: Any)` | Remove a shared bean |
| `register` | `(listener: PluginEventListener)` | Register a dynamic event listener |
| `unRegister` | `(listener: PluginEventListener)` | Remove a dynamic event listener |
| `registerCommands` | `(obj: Any)` | Register `@Command` methods on an object |
| `unRegisterCommands` | `(obj: Any)` | Remove them |
| `getLicenseManager` | `(): LicenseManager` | Host license service (premium) |
| `getLicenseJwtIssuer` | `(): String` | Expected `iss` for license JWTs |
| `getOwnJarSha256` | `(): String?` | SHA-256 of the loaded jar, or null |

::: warning Host beans are not injectable
Constructor injection only works for *your* beans (in `pluginBeanContext`). Pano's own services (`DatabaseManager`, `AuthProvider`, `SetupManager`, …) live in `applicationContext` — fetch them with `applicationContext.getBean(SomeService::class.java)`, ideally `by lazy`.
:::

## 2. Stereotype annotations

Classes carrying these are discovered and instantiated automatically when your addon loads — there is no manual registration call. All live in `com.panomc.platform.annotation` **except** `@EventListener`.

*Source: `com.panomc.platform.annotation.*`, `com.panomc.platform.api.annotation.EventListener`*

| Annotation | Put it on | Purpose |
|---|---|---|
| `@Endpoint` | an `Api` subclass | Register the HTTP route |
| `@Dao` | a `Dao` impl (pair with `@Lazy @Scope(SCOPE_SINGLETON)`) | Register the DAO singleton |
| `@Migration` | a `DatabaseMigration` or `PluginConfigMigration` | Register the migration |
| `@EventListener` | an event-listener class | Register the listener |
| `@PermissionDefinition` | a `Permission` subclass | Register the permission |
| `@NotificationDefinition` | a notification type | Register the notification type |
| `@Event` | an MC-server WS handler (host only) | Addons use `ServerManager.registerEvent` instead |
| `@Ignore` | an entity field | Exclude the field from column mapping |

::: warning Use Pano's `@EventListener`, not Spring's
The annotation is `com.panomc.platform.api.annotation.EventListener` — **not** `org.springframework.context.event.EventListener`. They share a simple name; import the wrong one and the event system silently never calls your listener.
:::

## 3. HTTP endpoints & routing

An endpoint is an `@Endpoint`-annotated class extending one of the base API classes. Constructor injection wires in your DAOs and beans.

*Source: `com.panomc.platform.model` (`Route`, `Path`, `RouteType`, `Api`, `LoggedInApi`, `PanelApi`, `SetupApi`, `Template`, `Result`, `Error`)*

### Route primitives

| Type | Signature | Purpose |
|---|---|---|
| `Path` | `Path(url: String, routeType: RouteType)` | One URL + method the endpoint answers |
| `RouteType` | `ROUTE`, `GET`, `POST`, `PUT`, `DELETE` | HTTP method (`ROUTE` = any/template) |
| `Route.paths` | `val paths: List<Path>` | The paths this route handles (required) |
| `Route.order` | `open val order = 1` | Match order among competing routes |
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

::: tip Panel paths are declared `/api/panel/...`
Pano reroutes the panel UI's `/panel/api/*` calls to `/api/*` internally, so a `PanelApi` declares its `Path` with the `/api/panel/...` form even though the browser requests `/panel/api/...`.
:::

### Handling a request (`Api` members)

| Member | Signature | Purpose |
|---|---|---|
| `handle` | `abstract suspend fun handle(context: RoutingContext): Result?` | Your endpoint body |
| `getSqlClient` | `suspend fun getSqlClient(): SqlClient` | The shared SQL client |
| `getParameters` | `fun getParameters(context): RequestParameters` | Validated body/query/path params |
| `checkSetup` | `fun checkSetup()` | Throw `InstallationRequired` if setup isn't done |
| `isAllowedInDemo` | `open fun isAllowedInDemo(method: HttpMethod): Boolean` | Gate writes when the instance runs in demo mode |

### Results & errors

| Thing | Signature | Purpose |
|---|---|---|
| `Successful` | `Successful(map: Map = emptyMap())` | Success → `{"result":"ok", …map…}` |
| `Errors` | `Errors(map: Map)` | Field-level error payload |
| `Error` subclasses | `throw NotFound()` / `BadRequest()` / … | ~100 predefined in `com.panomc.platform.error` (`NotFound`, `BadRequest`, `NoPermission`, `NotLoggedIn`, `InternalServerError`, …) |
| Custom error | `class MyError : Error(statusCode, …)` | Client error code = class simple name in `UPPER_SNAKE` |

To fail a request you **throw** an `Error` — you do not return it. Validation failures are turned into `BadRequest` for you.

### File uploads — custom `bodyHandler()`

Override `bodyHandler()` to accept multipart uploads, and validate with `Bodies.multipartFormData`. Pattern (see `pano-plugin-slider` `PanelAddSliderItemAPI`):

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

Three files per table — model, abstract DAO, `@Dao` impl — plus optional migrations. The [Backend Development](/addon/backend/) tutorial builds one end to end.

*Source: `com.panomc.platform.db` (`Dao`, `DBEntity`, `DatabaseMigration`), `com.panomc.platform.api.PluginDatabaseManager`*

| Type | Signature | Purpose |
|---|---|---|
| `DBEntity` | `abstract class` (has static `gson`) | Base for a row model; **not** an annotation |
| `@Ignore` | field annotation | Keep a model field out of column mapping |
| `Dao<T : DBEntity>` | `abstract class Dao<T>(entityClass: Class<T>)` | Base DAO |
| `Dao.init` | `abstract suspend fun init(sqlClient: SqlClient)` | `CREATE TABLE IF NOT EXISTS …` here |
| `Dao.uninstall` | `open suspend fun uninstall(sqlClient: SqlClient)` | `DROP TABLE …` (optional) |
| `Dao.fields` | `open val fields: List<String>` | Column names for query building |
| `Dao.tableName` | `protected val tableName` | Entity class name in `snake_case` |
| `Dao.getTablePrefix` | `fun getTablePrefix(): String` | The instance's table prefix |
| `Row.toEntity()` | extension | One row → your model (via Gson) |
| `RowSet.toEntities()` | extension | Many rows → `List<T>` |
| `List<String>.toTableQuery()` | extension | Backtick-quoted column list |
| `DatabaseMigration` | `DatabaseMigration(from: Int, to: Int, info: String)` | A schema step; override `val handlers: List<suspend (SqlClient) -> Unit>` |
| `PluginDatabaseManager.initialize` | `suspend fun initialize(plugin: PanoPlugin)` | Create tables + run pending migrations |
| `PluginDatabaseManager.uninstall` | `suspend fun uninstall(plugin: PanoPlugin)` | Run every DAO's `uninstall()` |

Raw SQL against Pano's own tables goes through the host `DatabaseManager` (`databaseManager.getSqlClient()`, core DAOs like `userDao`); coroutines await Vert.x futures with `coAwait()`.

::: warning `onUninstall` drops your tables
`pluginDatabaseManager.uninstall(this)` runs **every DAO's `uninstall()`** — that is the panel **Delete** action, not **Disable**. Disabling keeps the data.
:::

## 5. Configuration

A config class extending `PluginConfig` is written to `plugins/<pluginId>/config.conf` (HOCON) on first run, read back typed.

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

Register the manager as a singleton in `pluginBeanContext` during `onStart()` (see the [Backend Development](/addon/backend/) tutorial's entry class); fetch it lazily at request time.

## 6. Event listeners

Most of these work the same way: implement the interface, annotate the class `@EventListener`, and Pano calls you when the event fires. Their methods are `suspend` with a default no-op unless marked abstract, so you override only what you need — the exception is `RouterEventListener`, whose `onInitRouteList` and `onRouterCreate` are plain (non-`suspend`) **abstract** functions you must implement. (`PluginLifecycleListener` is the odd one out — see the note below the table.)

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

`onBeforeLogin` and friends return a `LoginDecision`: `Deny(errorKey, extras)`, `RequireUsername(userId)`, or `Allow`.

Two ways to register: an `@EventListener` class in your package (static), or `plugin.register(listener)` / `plugin.unRegister(listener)` for dynamic listeners at runtime.

::: warning `PluginLifecycleListener` is the exception — no `@EventListener`
Unlike every other row in the table, `PluginLifecycleListener` does **not** extend the `EventListener` marker and is **not** discovered by `@EventListener` (annotating it that way never fires, and would break the host's internal `as EventListener` cast). Register it explicitly with `applicationContext.getBean(PluginManager::class.java).addLifecycleListener(listener)`.
:::

::: tip Cross-addon events
Define a `PluginEventListener` sub-interface, share your plugin bean with `registerSingletonGlobal(this)`, and fire to subscribers via `PluginEventManager.getEventListeners<YourListener>()` — a **companion-object** function, so call it class-qualified (`PluginEventManager.…`), not on the injected `pluginEventManager` instance.
:::

## 7. Permissions & authentication

*Source: `com.panomc.platform.auth` (`Permission`, `PanelPermission`, `AuthProvider`)*

| Type | Signature | Node it produces |
|---|---|---|
| `Permission` | `open class Permission(iconName: String)` | `pano.<key>` |
| `PanelPermission` | `open class PanelPermission(iconName: String)` | `pano.plugin.<pluginId>.<dotted.key>` |
| `@PermissionDefinition` | class annotation | Auto-registers the permission |

The node is derived from the class name: drop the trailing `Permission`, split into words, lowercase, join with dots, and (for a plugin `PanelPermission`) prefix `pano.plugin.<pluginId>.` — so `ManageShoutboxPermission` → `pano.plugin.pano-plugin-shoutbox.manage.shoutbox`. The same string is repeated verbatim in your frontend code to gate panel pages and nav links.

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

Talk to the in-game plugin over the encrypted WebSocket link. Register handlers and send messages through `ServerManager` (see `pano-plugin-premium-login`).

*Source: `com.panomc.platform.server` (`ServerManager`, `ServerEvent`, `PlatformMessage`)*

| Member | Signature | Purpose |
|---|---|---|
| `ServerManager.registerEvent` | `fun registerEvent(event: ServerEvent<*, *>)` | Handle an inbound event type |
| `ServerManager.unregisterEvent` | `fun unregisterEvent(event: ServerEvent<*, *>)` | Stop handling it |
| `ServerManager.sendMessage` | `fun sendMessage(message: PlatformMessage, server: Server)` | Fire-and-forget to one server |
| `ServerManager.getConnectedServers` | `fun getConnectedServers(): Map<…>` | Currently connected servers |
| `ServerManager.isConnected` | `fun isConnected(id: Long): Boolean` | — |
| `ServerEvent<R, M>` | `abstract suspend fun handle(request: R, server: Server): M?` | Inbound event handler |
| `PlatformMessage` | `interface` | Outbound message shape |

**Wire names** are derived from the class name: a `ServerEvent` strips the `Event` suffix, a `PlatformMessage` strips `Message`, then both convert to `UPPER_SNAKE` (`getEventName()` / `getResponseName()`). So `PlayerJoinEvent` ⇄ wire name `PLAYER_JOIN`.

## 9. Tokens

Issue and verify signed tokens (magic-login links, one-time actions). Register your type so the host cleans it up on unload (see `pano-plugin-auth-guard` `MagicLoginTokenType`).

*Source: `com.panomc.platform.token` (`TokenType`, `TokenTypeRegistry`, `TokenProvider`)*

| Member | Signature | Purpose |
|---|---|---|
| `TokenType` | `interface` — `getName(): String`, `getExpireDate(): Long` (expiry as epoch millis) | Your token type (name defaults from class name minus `TokenType`, `UPPER_SNAKE`) |
| `TokenTypeRegistry.registerPluginToken` | `fun registerPluginToken(pluginId: String, tokenType: TokenType)` | Register (auto-removed on unload) |
| `TokenProvider.generateToken` | `fun generateToken(subject: String, tokenType: TokenType): Pair<String, Long>` | New token + expiry |
| `TokenProvider.saveToken` | `suspend fun saveToken(…)` | Persist it |
| `TokenProvider.isTokenValid` | `suspend fun isTokenValid(token, tokenType, sqlClient): Boolean` | — |
| `TokenProvider.invalidateToken` | `suspend fun invalidateToken(token, sqlClient)` | Revoke one |
| `TokenProvider.invalidateTokensBySubjectAndType` | `suspend fun (…)` | Revoke a subject's tokens of a type |
| `TokenProvider.parseToken` | `fun parseToken(token: String): DecodedJWT` | Decode claims |

## 10. Notifications & mail

*Source: `com.panomc.platform.notification` (`NotificationManager`, `UserNotificationType`, `PanelUserNotificationType`), `com.panomc.platform.mail` (`MailManager`, `Mail`)*

**Notifications** — subclass `UserNotificationType` or `PanelUserNotificationType`, annotate `@NotificationDefinition`, then send via `NotificationManager`:

| Method | Sends to |
|---|---|
| `sendNotification(…)` | One user |
| `sendPanelNotification(…)` | One user's panel |
| `sendNotificationToAll(…)` | Every user |
| `sendPanelNotificationToAll(…)` | Every user's panel |
| `sendNotificationToAllAdmins(…)` | All admins |
| `sendNotificationToAllWithPermission(…)` | Everyone holding a permission |

**Mail** — implement `Mail`, send with `MailManager` (see `pano-plugin-auth-guard` `MagicLoginMail`):

| Member | Signature | Purpose |
|---|---|---|
| `MailManager.sendMail` | `suspend fun sendMail(sqlClient, userId: Long?, mail: Mail, email: String? = null)` | Render + send |
| `Mail.templatePath` | `val templatePath: String` | Handlebars template path |
| `Mail.subject` | `val subject: String` | Subject line |
| `Mail.generateParameters` | `suspend fun generateParameters(systemParameters, i18nManager, locale): MailParameters` | Template variables |

## 11. Console commands

Annotate methods `@Command`, then register the holding object.

*Source: `com.panomc.platform.command` (`Command`, `CommandSender`)*

| Member | Signature | Purpose |
|---|---|---|
| `@Command` | `@Command(name, aliases = [], description = "", usage = "")` | Marks a command method |
| method shape | `(sender: CommandSender)` or `(sender: CommandSender, args: Array<String>)` | The handler |
| `PanoPlugin.registerCommands` | `fun registerCommands(obj: Any)` | Register all `@Command` methods on `obj` |
| `PanoPlugin.unRegisterCommands` | `fun unRegisterCommands(obj: Any)` | Remove them |
| `CommandSender.sendMessage` | `fun sendMessage(message: String)` | Reply to the caller |

## 12. Activity logs

Record admin actions so they appear on the panel's Activity feed. Subclass `PluginActivityLog` and insert through the host `DatabaseManager`.

*Source: `com.panomc.platform.db.model.PluginActivityLog`*

| Member | Signature | Purpose |
|---|---|---|
| `PluginActivityLog` | `open class PluginActivityLog(userId: Long, pluginId: String, details: JsonObject = JsonObject())` | Your log entry |
| insert | `databaseManager.panelActivityLogDao.add(log, sqlClient)` | Write it |

The panel renders each entry with a locale key derived from the class name (minus `Log`, `UPPER_SNAKE`) under an `activity-logs` object — `CreatedShoutLog` → `activity-logs.CREATED_SHOUT`, filled from the `details` payload. See [Localization](/addon/localization/).

## 13. Host beans

Pano's own services are Spring-managed beans in the host `applicationContext`, fetched with `applicationContext.getBean(<Class>::class.java)` — they are not injectable into your constructors. Most of the ones below (`DatabaseManager`, `PluginDatabaseManager`, `SetupManager`, `AuthProvider`, `ServerManager`, `TokenProvider`, `NotificationManager`, `MailManager`, `LicenseManager`, `ConfigManager`, `PluginManager`) are `@Component` classes — and `TokenTypeRegistry` a `@Service` — discovered by `@ComponentScan("com.panomc.platform")`; only the infrastructure beans (`Vertx`, `Router`, `WebClient`, `Gson`, `SchemaRepository`, plus the logger, template engine, `HttpClient`, `PluginUiManager` and `PluginEventManager`) are declared with `@Bean` in `com.panomc.platform.SpringConfig`.

| Bean | Use it for |
|---|---|
| `DatabaseManager` | Shared SQL client, core DAOs, `panelActivityLogDao` |
| `PluginDatabaseManager` | Your tables & migrations |
| `SetupManager` | `isSetupDone()` — gate DB work |
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

Premium addons verify a signed license against a build-time public key. The host is transport-only; verification is your addon's boundary. This is a summary — the full wiring, the copy-in `PluginLicenseClient`/`LicenseGuard`, and failure behavior are covered in [Premium Addons & Licensing](/addon/premium/).

*Source: `com.panomc.platform.license` (`LicenseManager`, `SignedLicense`, `LicenseClaims`, `LicenseRequiredException`)*

| Member | Signature | Purpose |
|---|---|---|
| `PanoPlugin.getLicenseManager` | `(): LicenseManager` | Host service that fetches the JWT |
| `LicenseManager.requireLicense` | `(plugin, resourceId, version)` | Fetch (cached) license for your addon |
| `SignedLicense.verifySignature` | `(publicKey, expectedIssuer)` | RS256 verify against *your* embedded key |
| `LicenseClaims` | `issuer, platformId, resourceId, userId, version, jarSha256, issuedAtMs, expiresAtMs, keyId, tokenId` | Parsed claims to cross-check |
| `LicenseRequiredException` | `(pluginId, reason, message, cause)` | Throw from `onStart()` to fail closed |

## 15. Miscellaneous & patterns

Small utilities and two recurring idioms that are not single APIs but are worth naming.

| Thing | Where | Purpose |
|---|---|---|
| Jar resource read | classloader | `javaClass.classLoader.getResourceAsStream(path)` — `PanoPlugin` has no `getResource`; see `pano-plugin-auth-guard` `MagicLoginMail` |
| `pluginDataFolder` | `PanoPlugin` | Your `plugins/<pluginId>/` dir (uploads, `config.conf`) |
| `logger` | `PanoPlugin` | Class-scoped SLF4J logger |

**Background jobs** — schedule with Vert.x and guard against overlap with an `AtomicBoolean`; cancel in `onStop()`/`onDisable()` (see `pano-plugin-market` `MarketPlugin`):

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

**Masking secrets** — a config `GET` endpoint should return secret fields masked; expose the real value only through a separate endpoint gated by a password re-auth check — either `authProvider.requirePassword(password, context)` (see `pano-plugin-auth-guard` `TwoFactorDisableAPI`) or a manual `databaseManager.userDao.isLoginCorrect(...)` check (the masking pattern in `pano-plugin-social-login` `PanelRevealSecretAPI`).

## Where to next

- **[Backend Development](/addon/backend/)** — the worked Shoutbox tutorial that puts these APIs together into compiling code.
- **[Localization](/addon/localization/)** — locale keys for permissions and activity logs.
- **[Premium Addons & Licensing](/addon/premium/)** — the full license-verification wiring for group 14.
- **[Frontend API Reference](/addon/api-reference/)** — the `pano.*` and `@panomc/sdk` surface for the UI half.
