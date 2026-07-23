# Endpoints (Routes & JSON APIs)

**What this page gives you:** by the end you'll have a public URL of your own that returns JSON, and an admin-only panel URL that validates its request body — the two endpoints Shoutbox needs so a theme can read shouts and an admin can post them.

An **endpoint** is one web address your addon answers. You write an `@Endpoint`-annotated class extending one of Pano's base API classes; Pano registers the route the moment your addon loads — there is no registration call anywhere.

Every backend edit needs a rebuild-and-restart before it takes effect — see the [Backend overview](/addon/backend/) for that step.

## A public API endpoint

Expose the shouts to the theme. A public JSON endpoint extends `Api` (file `routes/api/GetShoutsAPI.kt`):

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

- `@Endpoint` makes the route register itself the moment the addon loads.
- `ShoutDao` is injected straight into the constructor, because it lives in **your box** alongside this endpoint (constructor injection — see the [Backend overview](/addon/backend/#how-pano-builds-your-classes-for-you)). The DAO itself is built on the [Database & Migrations](/addon/database/) page.
- `paths` lists the URL and HTTP method. Choose a base class by who is allowed in: `Api` (public), `LoggedInApi` (any signed-in user), `PanelApi` (admins), `SetupApi` (only during setup).
- `getSqlClient()` is a convenience on `Api` that hands you the shared SQL client.
- **You must override `getValidationHandler` even when there is nothing to validate** — return the empty builder exactly as shown (`ValidationHandlerBuilder.create(schemaRepository).build()`). Don't delete this override; the build needs it. The panel endpoint below shows it doing real work on a request body.
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

**Optional: put `maxShouts` to work.** If you added the `maxShouts` config key on the [Configuration](/addon/configuration/) page, this endpoint is where it earns its keep. Using the request-time config-read pattern from that page, you can cap the list to the configured number. Everything else you have already seen; the only additions are injecting `plugin` (your plugin class is injectable) and Kotlin's standard `take(n)`:

```kotlin
// Optional variant of handle(): respect maxShouts.
// For this to compile, also add `private val plugin: ShoutboxPlugin` to the constructor,
// alongside `shoutDao`, so you can reach pluginBeanContext.
val sqlClient = getSqlClient()
val configManager = plugin.pluginBeanContext.getBean(PluginConfigManager::class.java)
val limit = (configManager.config as ShoutboxConfig).maxShouts
return Successful(mapOf("shouts" to shoutDao.getAll(sqlClient).take(limit)))
```

## A panel endpoint

Posting a shout is an admin action, so this endpoint does three things the public one didn't: it **validates the request body**, **checks a permission**, and **writes an activity-log entry**. It's the biggest code block here — as you read it, look for those three jobs in order.

::: tip Panel paths start with `/api/panel/`
Panel URLs get rewritten once on the way in, which trips everyone up the first time. Read it as a mapping, left to right:

| The panel UI calls… | Pano rewrites it to… | So in Kotlin you write… |
|---|---|---|
| `POST /panel/api/shoutbox` | `/api/panel/shoutbox` | `Path("/api/panel/shoutbox", RouteType.POST)` |

**Rule of thumb:** in Kotlin, always start a panel endpoint's path with `/api/panel/`.
:::

::: warning Heads up: this file won't compile on its own yet
`PanelAddShoutAPI` refers to two classes covered on [Permissions & Activity Logs](/addon/permissions/) — `ManageShoutboxPermission` and `CreatedShoutLog`. Write all three, **then** build once. If you build right after this section, expect "unresolved reference" errors; that's the two missing classes, not a mistake in this file.
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
- **Permission check:** `authProvider.requirePermission(ManageShoutboxPermission(), context)` is the very first line of `handle`. If the logged-in admin lacks the permission, it throws and the request is denied. (`AuthProvider` and `DatabaseManager` are Pano's own services, so you fetch them from Pano's box with `getBean`.) The permission class is defined on [Permissions & Activity Logs](/addon/permissions/).
- **Activity log:** `databaseManager.panelActivityLogDao.add(CreatedShoutLog(...), sqlClient)` records who posted what, so the admin panel's activity feed can show it. The `CreatedShoutLog` class is defined on that same [Permissions & Activity Logs](/addon/permissions/) page.
- One bit of Kotlin syntax: `getUsernameFromUserId(userId, sqlClient)!!` ends with `!!`, which asserts "this value is not null — crash if it somehow is." It's safe here because a logged-in admin always has a username.

## Try it end to end

Here is the full loop the backend promised — a database table, a public JSON API, a guarded admin endpoint, and an activity-log entry, all working together. You've already seen the empty list; now create a shout and watch it appear.

1. **Before:** open `http://localhost:8088/api/shoutbox/list` (or the port `80` form on a default install). You should still see `{"result":"ok","shouts":[]}`.
2. **Post a shout:** send `POST /panel/api/shoutbox` with the JSON body `{"message":"Hello Pano!"}` as a logged-in admin. The easiest way is from the panel UI you'll build in [Frontend Development](/addon/frontend/); to do it right now, `curl` that URL through your browser's authenticated session (the endpoint needs your admin session cookie, which is why the panel UI is the simpler route).
3. **After:** refresh `http://localhost:8088/api/shoutbox/list` — your shout is now in the JSON:

```json
{"result":"ok","shouts":[{"id":1,"message":"Hello Pano!","username":"<you>","date":1700000000000}]}
```

4. **Activity feed:** open **Panel → Activity** — you'll see your `CREATED_SHOUT` entry (shown as the raw key until you add the locale string in [Localization](/addon/localization/)).

If all four steps line up, the backend half of Shoutbox is done.

## If it doesn't work

The failures the backend pages warn about, in one place — symptom, cause, fix:

| Symptom | Likely cause | Fix |
|---|---|---|
| Addon not listed in **Panel → Addons** | jar wasn't copied into `plugins/`, or Pano wasn't restarted | rebuild, `cp` the jar into the instance's `plugins/`, and **restart** Pano |
| Your event listener never fires (setup gate never runs) | you imported Spring's `@EventListener` instead of Pano's | use `com.panomc.platform.api.annotation.EventListener` (see [Events](/addon/events/)) |
| Crash: `NoSuchBeanDefinitionException` | you took `PluginConfigManager` (or another bean registered in `onStart`) as a constructor parameter | fetch it at request time with `plugin.pluginBeanContext.getBean(...)` instead (see [Configuration](/addon/configuration/)) |
| Request rejected with `NO_PERMISSION` | the (non-admin) role calling the panel endpoint hasn't been granted the permission | grant it in **Panel → Roles**, or test as an admin (admins bypass the check — see [Permissions](/addon/permissions/)) |
| A Kotlin edit seems ignored | you disabled/enabled the addon instead of restarting | Kotlin isn't hot — rebuild and **restart** Pano |

## Where to next

- **[Database & Migrations](/addon/database/)** — the `ShoutDao` this page injects, plus the model and SQL behind it.
- **[Permissions & Activity Logs](/addon/permissions/)** — define `ManageShoutboxPermission` and `CreatedShoutLog` so the panel endpoint compiles.
- **[Configuration](/addon/configuration/)** — add the `maxShouts` key the optional variant reads.
- **[Backend API Reference](/addon/backend-reference/)** — every route primitive, base class, result, and error by name.
