# Frontend Development

**What this page gives you:** the one entry point every addon frontend shares — `src/main.js` — plus a map to the two topic pages that build the UI itself.

Your addon has two halves: a Kotlin [backend](/addon/backend/) and a **Svelte** frontend (the visual part users see and click). When you build your addon, the compiled Kotlin backend and your built Svelte files get zipped together into one `.jar` file — that whole file *is* your addon. You don't do anything special for this; the build handles it.

Pano runs two separate websites: the **theme** (what visitors see at `yoursite.com`) and the **panel** (the admin dashboard at `yoursite.com/panel`). Your one addon adds UI to both. One file — `src/main.js` — is the entry point for both.

The running example across these pages is **Shoutbox**: a small widget of recent "shouts" at the top of the home page, plus a panel where admins manage them. This page wires up `main.js`; the two topic pages — [Theme UI](/addon/theme-ui/) and [Panel UI](/addon/panel-ui/) — build the actual screens (see [Where to next](#where-to-next)).

> If an AI assistant or an old tutorial hands you an API that is not on these pages or in the [Frontend API Reference](/addon/api-reference/), it does not exist. The common fake or removed calls are listed at the [bottom of this page](#old-and-ai-hallucinated-apis-that-do-not-exist).

::: tip New to Svelte?
Addon UIs are written in Svelte, the same as Pano themes. If you have never used it, the interactive [Svelte tutorial](https://svelte.dev/tutorial) covers everything an addon UI needs.
:::

::: tip Before you start
You should have scaffolded your addon from the **pano-boilerplate-plugin** template and completed [Backend Development](/addon/backend/). The file `src/main.js` already exists in the boilerplate — you'll be *editing* it, not creating it. Start the dev loop with `bun run dev` and keep it running the whole time; every change on these pages hot-reloads, so you can see it immediately. (Turning the finished addon into a release is covered in [Building & Publishing](/addon/publishing/).)
:::

## Your addon's files

Here is the layout these pages refer to. The `theme/` and `panel/` folders are just a tidy convention for keeping visitor components and admin components apart — Pano does not enforce the names, you could organise the files however you like.

```text
src/
├─ main.js                    ← entry point; Pano loads this first
├─ theme/                     ← components shown to visitors (the public site)
│   └─ ShoutboxWidget.svelte
└─ panel/                     ← components shown to admins (the dashboard)
    ├─ ShoutboxSettings.svelte
    └─ ShoutboxPage.svelte
```

## The entry point: `src/main.js`

Everything starts in `main.js`. It exports a default class that extends `PanoPlugin`. Pano creates one instance of your class, sets `this.pano` on it for you (you never set it yourself), then calls your `onLoad()` method.

It calls `onLoad()` **twice** — once in the panel and once in the theme. The theme and the panel are two separate running programs, and each loads your addon independently, so `onLoad()` genuinely runs twice, once in each. That is normal, not a bug. The `pano.isPanel` check is how you give each side different UI: it is `true` in the panel and `false` in the theme.

Here is the skeleton the whole addon builds on. One line in it — `export const _ = ...` — looks scary; copy it as-is for now, it is a translate helper fully explained in [Translating text](#translating-text-in-your-components) below and you do not need to understand it to use the skeleton.

```js
// src/main.js
import { PanoPlugin, viewComponent } from '@panomc/sdk';
import ApiUtil from '@panomc/sdk/utils/api';
import { derived } from 'svelte/store';
import { _ as i18n } from '@panomc/sdk/utils/language';

export const pluginId = 'pano-plugin-shoutbox';

// A translate function scoped to your addon's keys — see the i18n section below.
export const _ = derived(i18n, ($t) => (key, options) => $t(`plugins.${pluginId}.${key}`, options));

export default class ShoutboxUiPlugin extends PanoPlugin {
  onLoad() {
    const { pano } = this;

    if (pano.isPanel) {
      // panel registrations go here
    } else {
      // theme registrations go here
    }
  }

  onUnload() {}
}
```

A few rules that matter, all of which the built-in addons (the working reference addons on the [PanoMC GitHub org](https://github.com/PanoMC)) follow:

- **The class must be the `default` export.** Pano looks for exactly one.
- **`this.pano` is your whole API.** Pano sets it for you before `onLoad()` runs — inside `onLoad()` you just read `pano.isPanel` and use `pano.ui.*`.
- **`pluginId` must exactly match your addon's ID** from [Backend Development](/addon/backend/) / your plugin manifest. Translations and the panel detail-page hook are keyed on it, so a mismatch breaks them silently.
- **Wrap every component in `viewComponent(() => import('./File.svelte'))`.** This is not optional. Every component you hand to a `register` call — hooks, pages, view slots — must be wrapped this way. In plain terms: this hands Pano a *recipe* for loading your file instead of the file itself, so Pano can load it at the right moment with the page's own copy of Svelte. You don't need the details — see [Architecture](/addon/architecture/) if curious.
- **Keep shared state in `main.js`.** Variables you declare at the top level of `main.js` (like the `_` store above) exist exactly once and are shared by all your components. The build guarantees this only for `main.js`, so don't rely on other files for shared state. (The mechanics are in [Architecture](/addon/architecture/).)
- **`onUnload()` runs when your addon is disabled.** Leave it empty for now; most addons never need it.

::: warning Never declare `svelte` in `package.json`
Your bundle does **not** ship Svelte, `svelte-i18n`, or `@panomc/sdk` — the host provides them so the whole page shares one Svelte instance. If your build starts failing right after you (or a library you installed with `bun add`) added `svelte` to `package.json`, that is the cause: remove `svelte` from `package.json`. In plain terms, the page can only run one copy of Svelte and the host already provides it; adding your own pins a second copy and breaks **hydration** (the step where the server-rendered HTML gets wired up to become interactive in the browser). See [Architecture](/addon/architecture/) for why.
:::

::: tip Check your progress
This skeleton on its own draws nothing on screen yet — it just sets your addon up. With `bun run dev` running, reload both `yoursite.com` (the theme) and `yoursite.com/panel` (the panel) and open the browser console (F12). You should see **no red errors** from your addon. If you see one about a missing `default` export or a bad `pluginId`, fix that before going further — everything below stacks on top of this working skeleton.
:::

Now fill in the two branches. What goes in each has its own page: **[Theme UI](/addon/theme-ui/)** for the `else` (theme) branch, **[Panel UI](/addon/panel-ui/)** for the `if (pano.isPanel)` branch. The rest of this page covers two things both branches use.

## Translating text in your components

Unlike theme development, **no translate helper is injected into your addon components automatically** — you must import `_` from your own `main.js`. That `_` is the scary line from the skeleton:

```js
export const _ = derived(i18n, ($t) => (key, options) => $t(`plugins.${pluginId}.${key}`, options));
```

Here is all it does: it is a Svelte `derived` **store** (a value that recomputes when its source changes) wrapping Pano's translate function, and it automatically prefixes every key you pass with `plugins.<pluginId>.`. So in a component you write `$_('widget.title')` and it looks up `plugins.pano-plugin-shoutbox.widget.title`. You do not need to understand how it is built inside to use it — just import it and read it with the `$` prefix:

```svelte
<script>
  import { _ } from '../main.js';
</script>

<h2>{$_('widget.title')}</h2>
```

`{$_('widget.title')}` resolves to the key `plugins.pano-plugin-shoutbox.widget.title` in your locale files. See [Localization](/addon/localization/) for where those keys live and how they are namespaced.

::: tip Check your progress
Until you actually add that key in [Localization](/addon/localization/), the screen shows the raw key string (`plugins.pano-plugin-shoutbox.widget.title`) instead of a nice label. That is expected at this stage — it is your sign the helper is wired up correctly and just waiting for the locale file.
:::

## Old and AI-hallucinated APIs that do not exist

If an AI tool, an old tutorial, or scaffolding suggests any of these, ignore it — none of them exist. Use only what is on these pages and in the [Frontend API Reference](/addon/api-reference/).

- **`pano.ui.page.register({ name, view, scopes })`** — the real `page.register` takes `{ path, component, permission, ... }` (see [Panel UI](/addon/panel-ui/)). There is no `name`/`view`/`scopes` form.
- **`import { Button, Card } from '@panomc/sdk/components/panel'`** — there is no such component library in the SDK.
- **`onContextUpdate`** — older boilerplate defines this method, but **no host ever calls it**. If your scaffolded `main.js` contains `onContextUpdate`, delete it.
- **`ApiUtil.get('/api/...')` with a plain string** — every `ApiUtil` call takes an options object, e.g. `ApiUtil.get({ path: '/api/...' })`.
- **`pano.utils.toast`** — there is no such thing; toasts come only from `@panomc/sdk/toasts`.

## Where to next

`main.js` is set up. Now build the UI:

- **Show things on the site → [Theme UI](/addon/theme-ui/)** — theme hooks, the home-page widget, server-rendered data, and calling your API.
- **Add admin screens → [Panel UI](/addon/panel-ui/)** — settings sections, full panel pages with nav links, and toasts.
- **Full lookup → [Frontend API Reference](/addon/api-reference/)** — every hook name, view slot, lifecycle event, and `@panomc/sdk` export in one place.
- **[Localization](/addon/localization/)** — where your `plugins.<pluginId>.<key>` strings live and how the panel lets admins override them.
- **[Backend Development](/addon/backend/)** — the Kotlin side of the endpoints and permissions these pages call.
- **[Building & Publishing](/addon/publishing/)** — turn the finished addon into a release jar. A release build **must** include the UI, so never use `-Pnoui` for it (`-Pnoui` is the Gradle flag that skips the UI build during backend-only iteration — see Building & Publishing).
- **Reference addons** — the built-in addons on the [PanoMC GitHub org](https://github.com/PanoMC) are the working reference for every pattern on these pages.
