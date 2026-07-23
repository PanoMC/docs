# Events

**What this page gives you:** by the end you'll have written your first event listener — the setup-gate listener every database-touching addon needs — and you'll know how to react to the other platform actions (logins, registrations, account deletion) and even fire your own cross-addon events.

An **event listener** is one of your classes that Pano calls when something happens on the platform. You implement a listener interface, tag the class `@EventListener`, and Pano wires it up during the scan — no registration call. Remember every backend edit needs a rebuild-and-restart — see the [Backend overview](/addon/backend/).

## The setup gate

Your entry class initializes the config and database in `startPlugin()`, but it returns early until Pano's first-run setup wizard has finished — otherwise there'd be no database to initialize. (That guard lives in `ShoutboxPlugin` on the [Backend overview](/addon/backend/#the-entry-class).) To pick things back up the moment setup completes, add a small event listener next to the plugin class (file `event/SetupEventHandler.kt`):

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

- Where does `plugin` come from in that constructor? **Your own plugin class is injectable too.** Pano puts the single `ShoutboxPlugin` instance into your box, so any of your classes may take it as a constructor parameter — that's how this listener (and the panel endpoint) gets hold of it. So the rule for "what can I inject?" is: anything in your box — your `@Dao`/`@Endpoint`/etc. classes, plus your plugin instance.

Every addon that touches the database needs this exact setup-gate pattern. Copy both classes — the plugin class from the [Backend overview](/addon/backend/#the-entry-class) and this listener — as they are and change only the class names.

::: warning Use Pano's `@EventListener`, not Spring's
The annotation is `com.panomc.platform.api.annotation.EventListener` — **not** Spring's `org.springframework.context.event.EventListener`. They have the same simple name, so it is easy to import the wrong one; if you do, the event system silently never calls your listener.
:::

## Reacting to other platform actions

`SetupEventListener` is one of several listener interfaces. The pattern is always the same — implement the interface, annotate the class `@EventListener`, override only the methods you care about. Among the others you can react to:

- **logins and registrations** — run code before or after a user authenticates, or veto a login.
- **account deletion** — clean up your own tables when a user is removed.
- **your own cross-addon events** — let *other* addons react to something your addon does, and react to theirs.

The full catalog — the auth hooks, account-deletion cleanup, plugin-lifecycle listeners, and firing your own cross-addon events (including the `getEventListeners` companion-object call and the `PluginLifecycleListener` `ClassCastException` gotcha) — is listed with signatures in [Backend API Reference § 6](/addon/backend-reference/#_6-event-listeners).

## Where to next

- **[Backend API Reference § 6](/addon/backend-reference/#_6-event-listeners)** — every event-listener interface, its methods, and the two that break the usual pattern.
- **[Backend overview](/addon/backend/#the-entry-class)** — the `ShoutboxPlugin` entry class this listener re-starts.
- **[Permissions & Activity Logs](/addon/permissions/)** — the other half of an admin action: gating it and logging it.
