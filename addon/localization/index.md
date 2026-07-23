# Localization (i18n)

Localization (often shortened to **i18n**) means showing your addon's text in different languages. Every string your addon puts on screen — panel buttons, permission titles, the lines on the Activity page — lives in JSON files inside the jar, one file per language.

Your translation files live in `src/main/resources/locales/`, one per language:

```
src/main/resources/locales/
├─ en-US.json
├─ tr.json
└─ ru.json
```

- **File format:** every file is plain, valid `.json`.
- **The file name is the locale code:** `en-US.json` is the code `en-US`, `tr.json` is `tr`, and so on.

::: warning en-US is the fallback
If a key is missing for the visitor's language, Pano falls back to `en-US.json`. Keep that file present and complete — it is the safety net for every other language.
:::

## The namespace — where your keys live

The platform serves every key you write under `plugins.<pluginId>.<key>`. For our example addon **Shoutbox** (`pluginId` = `pano-plugin-shoutbox`), a key called `widget.title` becomes `plugins.pano-plugin-shoutbox.widget.title` at lookup time.

You never write that prefix yourself. Inside your JSON files the keys stay **unprefixed** (`widget.title`); Pano adds the `plugins.<pluginId>.` part automatically. This is what keeps your keys from ever colliding with the core platform's or another addon's.

## Editing locales: hot in development, baked in a release

How a locale change reaches the screen depends on **Development Mode**:

- **With Development Mode on** (and your addon cloned into the instance's `plugins/<pluginId>/`, as [Getting Started](/addon/getting-started/) sets up), Pano reads your `locales/*.json` **live from disk** on every request. Edit a file, refresh (F5), and the new text appears — no rebuild, exactly like the Svelte UI.
- **With Development Mode off, or in a released jar**, locale files are baked-in **resources**. A refresh will not pick up a change; you have to rebuild the jar:

```bash
./gradlew build -Pnoui
```

then copy the jar into `plugins/` and **restart Pano** (disabling and re-enabling the addon does not reload jar contents). See [Getting Started](/addon/getting-started/) for the full hot-vs-rebuild table.

::: tip Why the two modes?
In production, locales ship inside the jar so an addon stays one self-contained file. Development Mode trades that for a live-from-disk read so you can iterate on translations without rebuilding — the same reason it re-serves your Svelte UI each request.
:::

## User customization & overrides

One of Pano's nicer touches: administrators can edit your addon's translations straight from the panel.

- **Overrides:** an admin can change any key you defined — new wording without touching your jar.
- **New languages:** an admin can add a language your addon does not ship, by translating your keys in the panel.

These edits are stored separately by Pano and survive addon updates, so a site owner's wording is never lost when you release a new version.

## Defining translations

### Custom keys

These are the ordinary key–value pairs your UI uses. Nest them however you like:

```json
{
  "widget": {
    "title": "Latest shouts",
    "empty": "No shouts yet — be the first!"
  },
  "welcome-message": "Welcome back, {username}!"
}
```

Placeholders use **single** braces (`{username}`) because the UI renders them with svelte-i18n. (There is one exception on the backend — see the [Backend](#backend-kotlin) note below.)

### Permissions

If your addon defines a permission, give it a human-readable title and description so admins can understand it on the panel's **Permissions** page.

**Definition:**

```kotlin
@PermissionDefinition
class ManageShoutboxPermission : PanelPermission("fa-bullhorn")
```

**Translation:**

```json
{
  "permissions": {
    "MANAGE_SHOUTBOX": {
      "title": "Manage Shoutbox",
      "description": "Allows managing shouts shown on the home page."
    }
  }
}
```

The key is deterministic: take the permission class name, drop the `Permission` suffix, and convert to `UPPER_SNAKE_CASE`.

- `ManageShoutboxPermission` → `MANAGE_SHOUTBOX`

### Activity logs

If your addon records admin actions, define a template for each one under `activity-logs`. These lines appear on the panel's **Activity** page.

**Definition:**

```kotlin
class CreatedShoutLog(
    userId: Long,
    username: String,
    pluginId: String,
    message: String,
) : PluginActivityLog(
    userId = userId,
    pluginId = pluginId,
    details = JsonObject().put("target", message).put("username", username),
)
```

**Translation:**

```json
{
  "activity-logs": {
    "CREATED_SHOUT": "<b>{username}</b> posted a shout: {target}."
  }
}
```

The key follows the same rule as permissions, but drops the `Log` suffix instead:

- `CreatedShoutLog` → `CREATED_SHOUT`

The `{username}` and `{target}` placeholders are filled from the log's `details` JSON — the Kotlin class supplies the *data*, and this locale entry supplies the *wording*.

::: info Both live at the root of your file
`permissions` and `activity-logs` must sit at the **root** of your JSON file, alongside your custom keys — not nested inside another object. Pano reads these two sections directly to wire them into the core Permissions and Activity pages.
:::

## Using translations

### Frontend (Svelte)

Nothing is auto-injected into your components. Your `src/main.js` exports a small `derived` store that wraps svelte-i18n and prepends your addon's namespace for you:

```js
// src/main.js
import { derived } from 'svelte/store';
import { _ as i18n } from '@panomc/sdk/utils/language';

export const pluginId = 'pano-plugin-shoutbox';
export const _ = derived(i18n, ($t) => (key, options) => $t(`plugins.${pluginId}.${key}`, options));
```

Then any component imports that `_` and uses it with a **short, unprefixed** key:

```svelte
<script>
  import { _ } from '../main.js';
</script>

<h2>{$_('widget.title')}</h2>
```

`$_('widget.title')` looks up `plugins.pano-plugin-shoutbox.widget.title` for you. See [Frontend Development](/addon/frontend/) for where this store is set up and used.

::: tip Reaching keys outside your namespace
If you need a key that is *not* under your addon's namespace, import svelte-i18n's own store — `import { _ } from '@panomc/sdk/utils/language'` — and pass the **full path** yourself (for example `$_('plugins.pano-plugin-shoutbox.widget.title')`). The `_` in your `main.js` is just this same store with the prefix added.
:::

### Backend (Kotlin)

Two backend features read your locale files:

- **Activity logs.** When your addon records an admin action, you insert a `PluginActivityLog` subclass (see [Backend Development](/addon/backend/)). The Activity page renders it by looking up `activity-logs.<KEY>` and filling the `{...}` placeholders from the log's `details` payload. The localized text lives *here*, in the locale file — never in Kotlin.
- **Email.** If your addon sends mail, the subject and body come from Handlebars templates.

::: warning Single vs double braces
Everything the UI renders — custom keys, permission titles, activity-log lines — goes through svelte-i18n and interpolates with **single** braces: `{username}`. The **only** place you write **double** braces `{{variable}}` is inside backend email templates, which Pano renders with Handlebars. Using the wrong style leaves the raw `{...}` visible on screen.
:::

## Where to next

- **[Backend Development](/addon/backend/)** — record activity logs and define permissions in Kotlin.
- **[Frontend Development](/addon/frontend/)** — set up the `_` store and use translations in your components.
- **[Building & Publishing](/addon/publishing/)** — package and ship your addon (locales included).
