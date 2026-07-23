# Translations

Shoutbox's widget, its permission, and its nav link all show hard-coded English right now. On this page we move that text into **locale files** so Shoutbox speaks every language your server does — and so its permission title and activity-log lines show real words instead of raw keys.

Full reference: [Localization](/addon/localization/).

::: tip Do I even have to?
Yes, at least a little. You *can* hard-code English in your Svelte components — but two kinds of text have nowhere else to live: **permission titles** (the panel's Permissions page) and **activity-log lines** (the Activity page) can *only* come from locale files. So even an English-only addon needs an `en-US.json`.
:::

## Step 1 — set up your locale files

Text lives in JSON files under `src/main/resources/locales/`, one file per language, the file name being that language's code:

```
src/main/resources/locales/
├─ en-US.json   ← required; also the fallback
├─ tr.json
└─ ru.json
```

Only `en-US.json` is required. Create it now containing just `{}` if it isn't there already.

::: warning en-US is the safety net
If a key is missing for the visitor's language, Pano falls back to `en-US.json`. If it's missing *there too*, the visitor sees the raw key path on screen (like `plugins.pano-plugin-shoutbox.widget.title`). Keep `en-US.json` complete — a raw key on screen is your first sign it isn't. Also save every file as **UTF-8**, or Turkish/Russian characters turn into garbled `Ã¶` text.
:::

## Step 2 — the namespace, in one sentence

Pano serves every key you write under `plugins.<pluginId>.<key>`. For Shoutbox that prefix is `plugins.pano-plugin-shoutbox.`. **You never write that prefix** — in your JSON the keys stay short (`widget.title`), and Pano adds the prefix automatically. This is what keeps your keys from colliding with the core platform's or another addon's.

The one place the prefix is actually written is a small helper the boilerplate already ships in `main.js`:

```js
export const _ = derived(i18n, ($t) => (key, options) => $t(`plugins.${pluginId}.${key}`, options));
```

Copy it as-is; you don't need to understand it to use it.

## Step 3 — define your first keys

Put your UI text in `en-US.json`, nested however you like. Nested objects become dotted paths, and `{...}` marks a placeholder you fill in later:

```json
{
  "widget": {
    "title": "Latest shouts",
    "empty": "No shouts yet — be the first!"
  },
  "nav": {
    "shoutbox": "Shoutbox"
  }
}
```

## Step 4 — use the keys in a component

Import the `_` helper from your `main.js` and read it with a `$` prefix:

```svelte
<script>
  import { _ } from '../main.js';
</script>

<h2>{$_('widget.title')}</h2>
```

`{$_('widget.title')}` looks up `plugins.pano-plugin-shoutbox.widget.title` for you. To fill a placeholder, pass values as a second argument: `$_('welcome-message', { values: { username: 'Ada' } })`.

::: tip Fix the `../` for your file's depth
`import { _ } from '../main.js'` assumes your component sits exactly one folder below `main.js`. In a more deeply nested route, add more `../` (like `../../main.js`), or the import 404s.
:::

::: tip Checkpoint: live reload proves itself
With Development Mode on and `bun run dev` running, the widget now renders **Latest shouts**. Now edit the string in `en-US.json`, save, and press **F5** — the new text appears with no rebuild. That's the payoff of Development Mode: Pano reads your `locales/*.json` **live from disk** every request. (With Development Mode *off*, or in a released jar, locales are read from inside the jar — you'd have to rebuild and restart to see a change.)
:::

## Step 5 — translate your permission and activity log

These two sections don't come from your components — Pano reads them directly to fill the panel's Permissions and Activity pages. **Both sit at the root** of the file, alongside your custom keys.

The key names are *derived* from your Kotlin class names, so you don't choose them:

- Permission `ManageShoutboxPermission` → drop `Permission`, UPPER_SNAKE → `MANAGE_SHOUTBOX`.
- Activity log `CreatedShoutLog` → drop `Log`, UPPER_SNAKE → `CREATED_SHOUT`.

```json
{
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

The `{username}` and `{target}` placeholders are filled from the log's `details` payload (built in the Kotlin class). HTML like `<b>` works **only** in activity-log lines — the Activity page renders those as HTML; ordinary keys shown with `{$_(...)}` escape it.

::: tip Checkpoint
Open **Panel → Permissions** — your entry now reads **Manage Shoutbox** instead of the raw `MANAGE_SHOUTBOX`. Post a shout, then open **Panel → Activity** — the sentence appears with the username in bold.
:::

## Step 6 — add another language

You're not limited to English. Add a file whose **name is the locale code** — Turkish in `tr.json`, Russian in `ru.json` — with the same keys translated:

```json
{
  "widget": {
    "title": "Son bağırışlar",
    "empty": "Henüz bağırış yok — ilk sen ol!"
  }
}
```

Any key you don't translate falls back to `en-US.json`, so a partial translation never shows a raw key. To test your `tr.json`, switch your own language to Turkish in **Panel → Settings → Platform → Preferences** (or the site's language selector) and refresh.

::: tip Admins can translate for you
Administrators can override any key or add a whole new language straight from the panel, without touching your jar — and their edits survive addon updates. An admin's override always beats your jar's text, so a site owner's custom wording is never silently overwritten by an update.
:::

## One complete `en-US.json`

Here's how the fragments fit together — custom keys, `permissions`, and `activity-logs` all at the root:

```json
{
  "widget": {
    "title": "Latest shouts",
    "empty": "No shouts yet — be the first!"
  },
  "nav": { "shoutbox": "Shoutbox" },
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

::: warning A broken JSON file breaks *all* its keys
JSON is strict: one trailing comma, a stray comment, or an unclosed brace makes the whole file invalid, and then none of its keys resolve — you'll see raw key paths across a whole page at once. If that happens, suspect a JSON syntax error first and run the file through any validator.
:::

Shoutbox now looks the part *and* speaks the language. All that's left is to package it up and share it with the world.

**Next: [Ship It →](/handbook/addon/ship/)**
