# Permissions & Activity Logs

**What this page gives you:** by the end you'll have defined the permission that gates the Shoutbox admin endpoint, know how its node string is derived, and have written the activity-log entry that records who posted a shout. These are the two classes the panel endpoint on [Endpoints](/addon/endpoints/) refers to.

Every backend edit needs a rebuild-and-restart before it takes effect — see the [Backend overview](/addon/backend/).

## The permission

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

You never type that node in Kotlin — passing `ManageShoutboxPermission()` to `requirePermission` is enough (the panel endpoint on [Endpoints](/addon/endpoints/) does exactly that). But you **do** repeat the exact string in your frontend code to gate panel pages and nav links. See [Frontend Development](/addon/frontend/) for where; if you rename the Kotlin class, remember to update that copied string.

::: tip Checkpoint: see the permission in the panel
After a rebuild and restart, open **Panel → Roles** and edit a role — you should see a new permission with a **bullhorn** icon (that's the `fa-bullhorn` from the constructor). Grant it to a role to let that role's members post shouts.

One thing that surprises people: **admins bypass permission checks** — an admin account always passes `requirePermission`, so as an admin you can call the panel endpoint even without granting yourself anything. To actually see the `NO_PERMISSION` rejection, test with a **non-admin** role that has *not* been granted the permission.
:::

## The activity log

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

The panel endpoint writes one of these with `databaseManager.panelActivityLogDao.add(...)` — see [Endpoints](/addon/endpoints/). The panel then shows each log line on its **Activity** page. To find the text to display, it derives a locale key from your class name, the same way permissions derive their node:

1. Drop the trailing `Log` → `CreatedShout`.
2. Convert to `UPPER_SNAKE` → `CREATED_SHOUT`.
3. Look it up under an `activity-logs` object in your locale files → `activity-logs.CREATED_SHOUT`.

That locale string uses the `{username}` and `{target}` values from the `details` payload you built above. Setting it up is covered in [Localization](/addon/localization/).

::: warning You'll see a raw key until you add the locale string
Until you add `activity-logs.CREATED_SHOUT` to your locale files, the Activity page shows the raw key `CREATED_SHOUT` instead of a sentence. That's expected — it's not a bug, just the missing translation.
:::

## Where to next

- **[Endpoints](/addon/endpoints/)** — the panel endpoint that calls `requirePermission` and writes this log entry.
- **[Localization](/addon/localization/)** — translate the permission title and the `CREATED_SHOUT` activity-log line.
- **[Backend API Reference § 7](/addon/backend-reference/#_7-permissions-authentication)** — `Permission`, `PanelPermission`, and the full `AuthProvider` method list.
