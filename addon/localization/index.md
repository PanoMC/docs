# Localization (i18n)

**What this page gives you:** by the end you will have a locale file, one translated line showing on screen, and you will know how to add more languages, translate permission titles, and translate activity-log lines.

Localization/internationalization (the ecosystem shorthand is **i18n**, short for *internationalization*) means showing your addon's text in different languages. Every piece of text your addon shows lives in JSON files packed inside the jar — one file per language. (A `.jar` is the single zip-like file a Kotlin/Java addon is packaged into, like an npm package tarball; you never open it by hand.)

::: tip Do I even have to do this?
Yes, at least a little. You *can* hardcode English strings straight into your Svelte components — but two kinds of text have nowhere else to live: **permission titles** (shown on the panel's Permissions page) and **activity-log lines** (shown on the panel's Activity page) can *only* come from locale files. So even an English-only addon needs an `en-US.json`. You will meet both of those below.
:::

## Set up your locale files

Inside your addon project (the one [Getting Started](/addon/getting-started/) scaffolded), create the folder `src/main/resources/locales/` if it isn't there already, and add a file `en-US.json` containing just `{}`. (`resources` is Gradle's name for non-code files — JSON, images, and the like — that get packed into the jar. Despite the name it is not only for images.)

You end up with one file per language, the file name being that language's code:

```
src/main/resources/locales/
├─ en-US.json
├─ tr.json
└─ ru.json
```

Only `en-US.json` is required. Add other languages (`tr.json`, `ru.json`, …) whenever you're ready to translate.

::: tip Checkpoint
You should now have `src/main/resources/locales/en-US.json` on disk, containing `{}`.
:::

- **File format:** every file is plain, valid `.json` — no comments and no trailing commas (either one makes the whole file invalid), and save it as **UTF-8** so Turkish or Russian characters don't turn into garbled `Ã¶`-style text.
- **The file name is the locale code:** `en-US.json` is the code `en-US`, `tr.json` is `tr`, and so on. Pano accepts short codes like `en-US` or `tr` — the same codes you set as the site language (see [Configuration](/platform/configuration/)).

**Which language a visitor sees.** The site has a default language (the `locale` setting), and when the admin allows it, each visitor can pick their own from the languages you ship. To test your `tr.json`, switch your own language to Turkish in **Panel → Settings → Platform → Preferences** (or via the site's language selector) and refresh.

::: warning en-US is the fallback
If a key is missing for the visitor's language, Pano falls back to `en-US.json`. If the key is missing *there too*, the visitor sees the raw key path on screen — something like `plugins.pano-plugin-shoutbox.widget.title` instead of real words. Keep `en-US.json` present and complete: it is the safety net for every other language, and a raw key on screen is your first sign it is incomplete.
:::

## The namespace — where your keys live

The platform serves every key you write under `plugins.<pluginId>.<key>`. For our example addon **Shoutbox** (its `pluginId` is `pano-plugin-shoutbox` — the value you set in `gradle.properties` when you scaffolded the addon, see [Getting Started](/addon/getting-started/)), a key called `widget.title` becomes `plugins.pano-plugin-shoutbox.widget.title` at lookup time.

You never write that long prefix — not in your JSON files and not in your components. Inside your JSON the keys stay **unprefixed** (`widget.title`), and Pano adds the `plugins.<pluginId>.` part automatically. The *one* place the prefix actually appears is a small helper in `main.js` (shown below), and the boilerplate already contains it. This automatic prefixing is what keeps your keys from ever colliding with the core platform's or another addon's.

## Define your first key

Custom keys are the ordinary key–value pairs your UI shows. Put them in `en-US.json`, nested however you like:

```json
{
  "widget": {
    "title": "Latest shouts",
    "empty": "No shouts yet — be the first!"
  },
  "welcome-message": "Welcome back, {username}!"
}
```

**Nested objects become dotted paths.** The `title` above lives inside `widget`, so you look it up as the single key `widget.title` (do *not* write a literal `"widget.title"` key). Likewise, `empty` inside `widget` is the key `widget.empty`.

**Placeholders use single braces.** `{username}` is a slot you fill in later from your component (shown in the next section). Placeholders render with single braces (`{username}`) because the UI uses svelte-i18n. Backend email templates are the one exception — they use double braces; see [single vs double braces](#backend-kotlin) below.

## Show the key in a component (Svelte)

To show a translation in a component, import the `_` helper from your addon's `main.js` — the boilerplate already ships it:

```svelte
<script>
  import { _ } from '../main.js';
</script>

<h2>{$_('widget.title')}</h2>
```

Three things a junior reader trips on here, all normal:

- **Why is it called `_`?** `_` is svelte-i18n's conventional name for its translate function — a single character because you type it constantly.
- **Import `_`, use `$_`.** The `$` prefix is Svelte's way of reading a *store's* current value (a store is Svelte's reactive value box). You import `_`; you use it as `$_`.
- **Fix the `../` for your file's depth.** `import { _ } from '../main.js'` assumes your component sits exactly one folder below `main.js`. In a more deeply nested route, add more `../` (for example `../../main.js`), or the import will 404.

`{$_('widget.title')}` looks up `plugins.pano-plugin-shoutbox.widget.title` for you.

::: tip Checkpoint
The component now renders **Latest shouts**. If you instead see the raw `plugins.pano-plugin-shoutbox.widget.title`, the key is missing or misspelled in `en-US.json`.
:::

### Filling a placeholder

`welcome-message` above had a `{username}` slot. To fill it, pass a second argument — svelte-i18n calls it `options` — with your placeholder values under `values`:

```svelte
<p>{$_('welcome-message', { values: { username: 'Ada' } })}</p>
```

This renders **Welcome back, Ada!**. The names under `values` must match the `{...}` names in the string. If you forget the values argument entirely, the visitor sees the literal `{username}` on screen.

::: tip Plurals: "1 shout" vs "5 shouts"
Don't invent two keys and an `if`. svelte-i18n understands ICU message syntax, so a single key handles both — for example `{count, plural, one {# shout} other {# shouts}}` — and you call it with `$_('shout-count', { values: { count: n } })`. See the [svelte-i18n formatting docs](https://github.com/kaisermann/svelte-i18n).
:::

### How the `_` helper works (skip this if you're in a hurry)

You do **not** need to understand this snippet to use `_` — the boilerplate's `main.js` already contains it, so just confirm it is there. But here it is:

```js
// src/main.js
import { derived } from 'svelte/store';
import { _ as i18n } from '@panomc/sdk/utils/language';

export const pluginId = 'pano-plugin-shoutbox';
export const _ = derived(i18n, ($t) => (key, options) => $t(`plugins.${pluginId}.${key}`, options));
```

A *store* is Svelte's reactive value box; `derived` means "recompute whenever the thing I depend on changes" — so when the visitor switches language, every `$_(...)` on the page updates by itself. `@panomc/sdk` is bundled by the boilerplate (see [Frontend Development](/addon/frontend/)). Copy it as-is. This is the one place the `plugins.<pluginId>.` prefix from earlier is actually written.

::: tip Reaching keys outside your namespace
If you need a key that is *not* under your addon's namespace, import svelte-i18n's own store — `import { _ } from '@panomc/sdk/utils/language'` — and pass the **full path** yourself (for example `$_('plugins.pano-plugin-shoutbox.widget.title')`). The `_` in your `main.js` is just this same store with the prefix added.
:::

## When do my edits show up? Instantly in Development Mode, only after a rebuild otherwise

Now that you have a key on screen, here is how your *edits* to it reach the browser. It depends on **Development Mode** — the toggle you turned on in [Getting Started](/addon/getting-started/) (**Panel → Platform Settings**, config key `development-mode`). If you skipped it, do that first.

**With Development Mode on**, and your addon cloned into your running Pano server's `plugins/<pluginId>/` folder (the folder where the server runs is called the *instance*), Pano reads your `locales/*.json` **live from disk** on every request. Edit a file, refresh (F5), and the new text appears — no rebuild, exactly like the Svelte UI.

**With Development Mode off, or in a released jar**, the running server only reads the copy of your locale files packed *inside the jar* — it never looks at your source folder, so editing the file on disk does nothing until you rebuild the jar:

```bash
./gradlew build -Pnoui
```

(`gradlew` is the Gradle wrapper script already in your project — run it from the project root, which is what the leading `./` means. `-Pnoui` skips rebuilding the UI to save time.)

::: tip Checkpoint
You should now see a jar under `build/libs/` (for a local build, `pano-plugin-shoutbox-local-build.jar`). Copy that file into your Pano instance's `plugins/` folder, replacing the old one, then **restart Pano** — stop the running process and start it again (see [Getting Started](/addon/getting-started/)). Disabling and re-enabling the addon in the panel does *not* reload jar contents.
:::

::: tip Why the two modes?
In production, locales ship inside the jar so an addon stays one self-contained file. Development Mode trades that for a live-from-disk read so you can iterate on translations without rebuilding — the same reason it re-serves your Svelte UI each request. See [Getting Started](/addon/getting-started/) for the full hot-vs-rebuild table.
:::

## Permissions (only if your addon defines permissions)

If your addon defines a permission, give it a human-readable title and description so admins can understand it on the panel's **Permissions** page. Skip this section if your addon has no permissions.

**Definition (Kotlin):**

```kotlin
@PermissionDefinition
class ManageShoutboxPermission : PanelPermission("fa-bullhorn")
```

The `@PermissionDefinition` line is a Kotlin *annotation* — a marker Pano scans for so your class is registered automatically; copy it exactly (details in [Backend Development](/addon/backend/)). `fa-bullhorn` is a Font Awesome icon name, shown next to the permission in the panel.

**Translation (in your locale file):**

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

You do not choose the `MANAGE_SHOUTBOX` key — it is derived from the class name by a fixed rule: drop the `Permission` suffix, then convert to `UPPER_SNAKE_CASE`.

- `ManageShoutboxPermission` → `MANAGE_SHOUTBOX`

::: tip Checkpoint
Open **Panel → Permissions**. Your entry should now read **Manage Shoutbox** with its description, instead of the raw `MANAGE_SHOUTBOX` key.
:::

## Activity logs (only if your addon records activity)

If your addon records admin actions, define a template for each one under `activity-logs`. These lines appear on the panel's **Activity** page. Skip this section if your addon records no activity.

**Definition (Kotlin):**

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

For translation, only the `details` line matters: each key you `put` into it — here `target` and `username` — becomes a `{placeholder}` you can use in the text. The rest (`userId`, `pluginId`, the constructor plumbing) is backend wiring covered in [Backend Development](/addon/backend/).

**Translation (in your locale file):**

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

::: tip Can I use HTML like `<b>` in my strings?
Here, yes: the `<b>...</b>` works because the Activity page renders these particular strings as HTML. This is **not** a general license to put HTML in every locale string. In ordinary custom keys shown with `{$_(...)}`, svelte-i18n returns the raw string and Svelte escapes it, so `<b>` would appear as literal `<b>` text on screen. Keep HTML markup to activity-log lines only.
:::

::: tip Checkpoint
Perform the action, then open **Panel → Activity**. The rendered sentence should appear with the username in bold.
:::

## One complete `en-US.json`

The examples above were fragments. Here is how they fit together in a single file. **`permissions` and `activity-logs` sit at the root**, alongside your custom keys — never nested inside another object. Pano reads those two sections directly to wire them into the core Permissions and Activity pages.

```json
{
  "widget": {
    "title": "Latest shouts",
    "empty": "No shouts yet — be the first!"
  },
  "welcome-message": "Welcome back, {username}!",
  "permissions": {
    "MANAGE_SHOUTBOX": {
      "title": "Manage Shoutbox",
      "description": "Allows managing shouts shown on the home page."
    }
  },
  "activity-logs": {
    "CREATED_SHOUT": "<b>{username}</b> posted a shout: {target}."
  }
}
```

## Backend (Kotlin)

Two backend systems — and *only* these two — read your locale files. Your own Kotlin code never looks a translation up directly; if you need text on the backend, it flows through one of these:

- **Activity logs.** When your addon records an admin action, you insert a `PluginActivityLog` subclass (see [Backend Development](/addon/backend/)). The Activity page renders it by looking up `activity-logs.<KEY>` and filling the `{...}` placeholders from the log's `details` payload. The localized text lives *here*, in the locale file — never in Kotlin.
- **Email.** If your addon sends mail, the subject and body come from **Handlebars** templates. (Handlebars is a template language; `{{name}}` marks a variable to fill in.) These templates are **not** part of your `locales/*.json` — they live alongside your addon's mail code, not in the locale files. The `pano-plugin-auth-guard` addon is the reference for sending templated email (see [Backend Development](/addon/backend/)).

::: warning Single vs double braces
Everything the UI renders — custom keys, permission titles, activity-log lines — goes through svelte-i18n and interpolates with **single** braces: `{username}`. The **only** place you write **double** braces `{{variable}}` is inside backend email (Handlebars) templates. Using the wrong style leaves the raw `{...}` visible on screen.
:::

## Admin overrides & new languages

One of Pano's nicer touches: administrators can edit your addon's translations straight from the panel.

- **Overrides:** an admin can change any key you defined — new wording without touching your jar.
- **New languages:** an admin can add a language your addon does not ship, by translating your keys in the panel.

These edits are stored separately by Pano and survive addon updates. **Whose text wins?** An admin's override always beats the text in your jar. So if you change your own wording in a new release, an admin's customized value stays in force for the keys they overrode; your new default only shows for keys the admin never touched. A site owner's wording is never silently overwritten by an update.

## If something looks wrong

| You see | Likely cause | Fix |
|---|---|---|
| A raw key path on screen (`plugins.pano-plugin-shoutbox.widget.title`) | The key is missing or misspelled, in the visitor's language *and* in `en-US.json` | Add or fix the key in `en-US.json` (the fallback) |
| A literal `{username}` on screen | You didn't pass a value for the placeholder | Pass it: `$_('welcome-message', { values: { username: ... } })` |
| A literal `{{name}}` on screen | Wrong brace style for the renderer | The UI uses single `{ }`; only email/Handlebars uses double `{{ }}` |
| Edits to a locale file don't appear after refresh | Development Mode is off, or you're running a released jar | Turn Development Mode on, or rebuild the jar and restart Pano |
| Turkish/Russian text shows as `Ã¶`-style garble | The file was saved in the wrong encoding | Re-save the file as UTF-8 |

::: warning A broken JSON file breaks all its keys, not one
JSON is strict: a single trailing comma, a stray comment, or an unclosed brace makes the *whole file* invalid. When a file can't be parsed, none of its keys resolve, so you'll see raw key paths where those strings should be — often across a whole page at once. If a page suddenly shows key paths everywhere, suspect a JSON syntax error first, and run the file through any JSON validator.
:::

## Where to next

- **[Backend Development](/addon/backend/)** — record activity logs and define permissions in Kotlin.
- **[Frontend Development](/addon/frontend/)** — set up the `_` store and use translations in your components.
- **[Building & Publishing](/addon/publishing/)** — package and ship your addon (locales included).
