# Frontend Development

**What this page gives you:** by the end you'll have built the complete frontend of a small example addon, step by step, checking your work after each step.

Your addon has two halves: a Kotlin [backend](/addon/backend/) and a **Svelte** frontend (the visual part users see and click). When you build your addon, the compiled Kotlin backend and your built Svelte files get zipped together into one `.jar` file — that whole file *is* your addon. You don't do anything special for this; the build handles it.

Pano runs two separate websites: the **theme** (what visitors see at `yoursite.com`) and the **panel** (the admin dashboard at `yoursite.com/panel`). Your one addon adds UI to both. One file — `src/main.js` — is the entry point for both.

This page builds the frontend of our running example, **Shoutbox**: a small widget of recent "shouts" at the top of the home page, plus a panel where admins manage them. By the end you can:

- mount a component on the home page and give it server-rendered data,
- add a settings section to your addon's panel detail page,
- register a full panel page with its own nav link,
- call your backend API and show a toast,
- translate text inside your components.

> If an AI assistant or an old tutorial hands you an API that is not on this page or in the [Frontend API Reference](/addon/api-reference/), it does not exist. The common fake or removed calls are listed at the [bottom of this page](#old-and-ai-hallucinated-apis-that-do-not-exist).

::: tip New to Svelte?
Addon UIs are written in Svelte, the same as Pano themes. If you have never used it, the interactive [Svelte tutorial](https://svelte.dev/tutorial) covers everything an addon UI needs.
:::

::: tip Before you start
You should have scaffolded your addon from the **pano-boilerplate-plugin** template and completed [Backend Development](/addon/backend/). The file `src/main.js` already exists in the boilerplate — you'll be *editing* it, not creating it. Start the dev loop with `bun run dev` and keep it running the whole time; every change below hot-reloads, so you can see it immediately. (Turning the finished addon into a release is covered in [Building & Publishing](/addon/publishing/).)
:::

## Your addon's files

Here is the layout this page refers to. The `theme/` and `panel/` folders are just a tidy convention for keeping visitor components and admin components apart — Pano does not enforce the names, you could organise the files however you like.

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

A few rules that matter, all of which the built-in addons follow:

- **The class must be the `default` export.** Pano looks for exactly one.
- **`this.pano` is your whole API.** Pano sets it for you before `onLoad()` runs — inside `onLoad()` you just read `pano.isPanel` and use `pano.ui.*`.
- **`pluginId` must exactly match your addon's ID** from [Backend Development](/addon/backend/) / your plugin manifest. Translations and the panel detail-page hook are keyed on it, so a mismatch breaks them silently.
- **Wrap every component in `viewComponent(() => import('./File.svelte'))`.** This is not optional. Every component you hand to a `register` call — hooks, pages, view slots — must be wrapped this way. In plain terms: this hands Pano a *recipe* for loading your file instead of the file itself, so Pano can load it at the right moment with the page's own copy of Svelte. You don't need the details — see [Architecture](/addon/architecture/) if curious.
- **Keep shared state in `main.js`.** Variables you declare at the top level of `main.js` (like the `_` store above) exist exactly once and are shared by all your components. The build guarantees this only for `main.js`, so don't rely on other files for shared state. (The mechanics are in [Architecture](/addon/architecture/).)
- **`onUnload()` runs when your addon is disabled.** Leave it empty for now; most addons never need it.

::: warning Never declare `svelte` in `package.json`
Your bundle does **not** ship Svelte, `svelte-i18n`, or `@panomc/sdk` — the host provides them so the whole page shares one Svelte instance. If your build starts failing right after you (or a library you installed with `bun add`) added `svelte` to `package.json`, that is the cause: remove `svelte` from `package.json`. In plain terms, the page can only run one copy of Svelte and the host already provides it; adding your own pins a second copy and breaks **hydration** (the step where the server-rendered HTML gets wired up to become interactive in the browser). See [Architecture](/addon/architecture/) for why.
:::

## Theme: mount a widget on the home page

The theme exposes named **hooks** — spots where addons can inject a component (the full list of hook names is in the [Frontend API Reference](/addon/api-reference/); this tutorial uses `page:home:top`). To show the Shoutbox on the home page, register a component for the `page:home:top` hook, in the `else` (theme) branch:

```js
pano.ui.hook.register({
  name: 'page:home:top',
  component: viewComponent(() => import('./theme/ShoutboxWidget.svelte')),
});
```

::: tip Check
With the dev servers running, open the site's home page. You should see the `<div class="shoutbox">` container at the very top of the page (inspect it with your browser devtools). If you have not added `load()` yet — the next step — it will be empty; that is expected. If you don't see it at all, check the browser console for errors and confirm your `pluginId` and that you registered in the `else` branch.
:::

### Give the widget server-rendered data with `load()`

A good widget needs data, and it needs that data to be there in the **first server response** — not fetched later in the browser — so visitors and search engines see the shouts immediately. Pano does this with **SSR** (server-side rendering — the server builds the finished HTML before sending it, instead of sending an empty page that fetches its data afterwards).

A hook component can export a `load(event)` function from its **module script** — the `<script module>` block. That block runs once when the file is first loaded, before any instance of the component exists, which is why `load()` lives there and your normal per-instance component code lives in the plain `<script>` below it. The theme runs `load()` while the page is being prepared (on the server during SSR, and again on the client when navigating between pages) and hands whatever you return to the component as props. In Shoutbox, `load()` calls our public endpoint:

```svelte
<!-- src/theme/ShoutboxWidget.svelte -->
<script module>
  import ApiUtil from '@panomc/sdk/utils/api';

  export async function load(event) {
    const res = await ApiUtil.get({ path: '/api/shoutbox/list', request: event });
    return { shouts: res.shouts ?? [] };
  }
</script>

<script>
  export let shouts = [];
</script>

<div class="shoutbox">
  {#each shouts as shout}
    <p class="shout">{shout.message}</p>
  {/each}
</div>
```

`event` is the incoming page request — it carries the visitor's cookies and session. You mostly just forward it to `ApiUtil` (as `request: event`) so the API knows who is asking.

The object you return becomes the component's props — here `shouts` arrives ready to render. (The host calls this props flow `hookProps`; you'll meet that name in the API reference and in error messages.)

::: warning `load()` runs on the server *and* the client
The same `load()` executes during SSR and again on client-side navigation, so keep it **safe to run twice**: it should only fetch and return data. Don't change global variables, don't write anything, and don't modify the objects you were handed — because the same function runs once on the server and again in the browser. (The one-word name for "safe to run twice with no side effects" is *idempotent*.) Always pass `request: event` to `ApiUtil` (next section) so the server-side call carries the visitor's session.
:::

::: tip Check
Refresh the home page. The `<div class="shoutbox">` should now contain one `<p class="shout">` per shout (assuming your backend has any). To confirm the data really is in the *first* response, do a hard refresh (Ctrl/Cmd+Shift+R) and use "View source" — you should see the shouts already present in the HTML, not blank.
:::

::: tip Hide the widget when it has nothing to show
If `load()` returns `{ hookOptions: { invisible: true } }`, the host renders nothing for that hook. The Announcement addon uses this to disappear when there is nothing to display.
:::

## Calling your API

All network calls go through `ApiUtil`. Import the default export and use the verb methods, each taking a single options object:

```js
import ApiUtil from '@panomc/sdk/utils/api';

// In a load() — pass request so the server-side call has the session:
const res = await ApiUtil.get({ path: '/api/shoutbox/list', request: event });

// In a browser event handler — body is your JSON payload:
await ApiUtil.post({ path: '/api/panel/shoutbox', body: { message } });
await ApiUtil.delete({ path: `/api/panel/shoutbox/${id}` });
await ApiUtil.put({ path: '/api/panel/shoutbox/config', body: config });
```

The rule: **inside `load()`, always pass `request: event`** so the fetch runs with the visitor's session during SSR. In a click handler running in the browser you can omit it.

::: warning If you forget `request: event`
The call still works in the browser, but during SSR it runs **logged out**. The symptom is confusing: data is missing or you get permission errors only on a hard refresh, while everything looks fine after clicking around. If you ever see that, check your `load()` calls first.
:::

::: tip How `ApiUtil` reports errors
`ApiUtil` never throws on API errors — a failed call resolves to an object with `error` set (it does not throw and you do not check an HTTP status). Always check `res.error` before using the response; you'll see this in every example below.
:::

## Translating text in your components

Unlike theme development, **no translate helper is injected into your addon components automatically** — you must import `_` from your own `main.js`. That `_` is the scary line from the skeleton:

```js
export const _ = derived(i18n, ($t) => (key, options) => $t(`plugins.${pluginId}.${key}`, options));
```

Here is all it does: it is a Svelte `derived` **store** (a value that recomputes when its source changes) wrapping Pano's translate function, and it automatically prefixes every key you pass with `plugins.<pluginId>.`. So in a component you write `$_('widget.title')` and it looks up `plugins.pano-plugin-shoutbox.widget.title`. You do not need to follow the currying to use it — just import it and read it with the `$` prefix:

```svelte
<script>
  import { _ } from '../main.js';
</script>

<h2>{$_('widget.title')}</h2>
```

`{$_('widget.title')}` resolves to the key `plugins.pano-plugin-shoutbox.widget.title` in your locale files. See [Localization](/addon/localization/) for where those keys live and how they are namespaced.

## Panel: a settings section on your addon's detail page

When an admin opens your addon in **Panel → Addons**, its detail page has a hook named `panel:plugin-detail:content:<pluginId>`. Registering a component there is the cheapest way to give your addon a settings screen — most built-in addons do exactly this. Put this in the `if (pano.isPanel)` branch:

```js
pano.ui.hook.register({
  name: `panel:plugin-detail:content:${pluginId}`,
  component: viewComponent(() => import('./panel/ShoutboxSettings.svelte')),
});

pano.ui.addon.onLoad(async (data, event) => {
  if (data.addon.id !== pluginId) return;
  const res = await ApiUtil.get({ path: '/api/panel/shoutbox/config', request: event });
  if (!res.error) data.addon.config = res;
});
```

`pano.ui.addon.onLoad(callback)` registers a function that Pano runs every time **any** addon detail page opens. Your callback receives `(data, event)`:

- `data.addon` describes the addon whose page is opening. Its known field is `data.addon.id` (the plugin ID). You may also attach your own properties to it — like `data.addon.config` here — and they arrive on the `addon` prop of components on this page. (See the `addon` entry in the [Frontend API Reference](/addon/api-reference/) for the full shape.)
- `event` is the page request, exactly like the `event` in `load()`.

Because it fires for *every* addon, the first line checks `data.addon.id !== pluginId` and bails out if the page is not yours before fetching.

::: tip You *may* extend `data` here
Earlier, `load()` warned you never to mutate objects you were handed. `onLoad` callbacks are the deliberate exception: the `data` object is **meant** to be extended, and attaching your config to `data.addon.config` is the supported way to pass it to your components.
:::

Components registered on this hook receive the page's `addon` object as a prop, so `ShoutboxSettings.svelte` can read the config you attached:

```svelte
<!-- src/panel/ShoutboxSettings.svelte -->
<script>
  export let addon;
  let config = addon?.config ?? { enabled: true, maxShouts: 5 };
</script>
```

::: tip Check
Open **Panel → Addons → Shoutbox**. Your settings component should render on the detail page, with `config` populated from the API (or the `{ enabled: true, maxShouts: 5 }` fallback if the request failed).
:::

## Panel: a full page with its own nav link

A settings section lives inside the addon detail page. When your addon needs a page of its own — a management screen at `/shoutbox` — register it as a **page** and add a link to the panel sidebar.

The `permission` string below follows a fixed pattern: `pano.plugin.<pluginId>.<permission class name in dot-case>`. It must match your Kotlin permission class **exactly** — here `ManageShoutboxPermission` becomes `manage.shoutbox`, giving `pano.plugin.pano-plugin-shoutbox.manage.shoutbox`.

```js
pano.ui.page.register({
  path: '/shoutbox',
  component: viewComponent(() => import('./panel/ShoutboxPage.svelte')),
  permission: 'pano.plugin.pano-plugin-shoutbox.manage.shoutbox',
});

pano.ui.nav.site.editNavLinks(async (links) => {
  if (!links.some((l) => l.href === '/shoutbox')) {
    const i = links.findIndex((l) => l.href === '/posts');
    const link = {
      href: '/shoutbox',
      icon: 'fas fa-bullhorn',
      text: `plugins.${pluginId}.nav.shoutbox`,
      startsWith: true,
      permission: 'pano.plugin.pano-plugin-shoutbox.manage.shoutbox',
    };
    i >= 0 ? links.splice(i + 1, 0, link) : links.push(link);
  }
  return links;
});
```

A few things worth explaining:

- **`nav.site` is the panel's main sidebar.** Other nav areas exist and are listed in the [Frontend API Reference](/addon/api-reference/), which is why the namespace has the extra `site` word — it is not a typo.
- **`text` is a translation key, not a literal label.** Until you add this key in [Localization](/addon/localization/), the sidebar shows the raw key string (`plugins.pano-plugin-shoutbox.nav.shoutbox`). That is expected at this stage.
- **`icon` is a Font Awesome class.** The panel already bundles Font Awesome; browse the available names at [fontawesome.com](https://fontawesome.com/icons).
- **Insert relative to an anchor.** Find an existing link (here `/posts`) and splice your link next to it, falling back to `push` if the anchor is missing — so your link lands in a sensible spot rather than always at the end.
- **Guard against duplicates.** `editNavLinks` re-runs on every page load inside the long-lived server, so it can run many times — check `links.some((l) => l.href === '/shoutbox')` before adding, or you would stack duplicate links. Always **return** the array.

::: tip Keep the permission string in sync
The `permission` string above is a hand-typed copy of the node your Kotlin `ManageShoutboxPermission` class derives (`pano.plugin.pano-plugin-shoutbox.manage.shoutbox`). There is no shared constant — if you rename the Kotlin class, the derived node changes and this UI gate silently stops matching. Change both together. See the permission rule in [Backend Development](/addon/backend/).
:::

If `permission` is not met, the page returns 404 and the nav link is hidden. Two more options exist for pages: `systemLayout` reuses a built-in panel layout (the Comments addon uses `systemLayout: 'PostsLayout'` so its page sits under the Posts section), and `resetLayout` drops the surrounding panel frame (sidebar, header) so your page renders full-bleed. The full list of layout names is in the [Frontend API Reference](/addon/api-reference/).

::: tip Check
Reload the panel. A bullhorn icon should appear in the sidebar just under **Posts**, labelled with the raw key `plugins.pano-plugin-shoutbox.nav.shoutbox` (the label turns into real text once you add that locale key). Click it to open your page at `/shoutbox`.
:::

## Showing toasts

To confirm an action to the admin, show a toast (a small pop-up message). Import `showToast` from `@panomc/sdk/toasts` — and note it uses the `$_` translate helper from the section above:

```svelte
<script>
  import { showToast } from '@panomc/sdk/toasts';
  import { _ } from '../main.js';

  async function save(config) {
    const res = await ApiUtil.put({ path: '/api/panel/shoutbox/config', body: config });
    showToast(res.error ? $_('toasts.save-error') : $_('toasts.save-success'));
  }
</script>
```

::: tip Check
Wire this `save` up to a button and click it. You should see a toast slide in — the success message when the request works, the error message when it fails.
:::

## Advanced — skip on first read

Everything below is for cases you will not hit on your first addon. Come back when you need it.

### Fetch shared data once with `pano.ui.app.onLoad`

`pano.ui.app.onLoad(callback)` registers a function the **theme** runs on every page request, before the page renders. Its callback receives `(data, event)`, where `data` is a shared bag of page data and `event` is the request (the same kind you pass to `ApiUtil`). Use it when one fetch needs to feed several registrations at once.

It is the alternative to a per-component `load()`: register a hook with `skipLoad: true` and fetch its data from a single `pano.ui.app.onLoad(async (data, event) => { ... })` instead. The FAQ and Pages addons use this when one fetch feeds several registrations.

### Dynamic pages and cleanup

Sometimes the pages you register aren't known at build time — they come from your backend (custom URLs, redirects, and the like). Register them from inside `pano.ui.app.onLoad`, after fetching the list. The Pages addon does exactly this.

First, the mental model, because this section depends on it: the theme is **one long-running server program shared by every visitor**. Anything you register is remembered by that program until it restarts — it is not per-visitor and not per-page-load. So if your data changes, old registrations stick around unless you remove them.

That is the sharp edge here. `pano.ui.app.onLoad` runs on every request, but the routes and links you register persist in that process between requests. If a page is deleted in the panel, the entry you registered earlier lingers — SSR still serves the ghost route until the process restarts, even though the browser no longer knows about it.

The fix is to track what you registered and remove entries that are gone, using `pano.ui.page.unregister(path)`:

```js
const registeredPaths = new Set();
const customPageComponent = viewComponent(() => import('./theme/CustomPage.svelte'));

pano.ui.app.onLoad(async (data, event) => {
  const res = await ApiUtil.get({ path: '/api/pages', request: event });
  const incoming = new Set(res.pages.map((p) => p.url));

  // Remove routes we registered before that are no longer present.
  for (const path of registeredPaths) {
    if (!incoming.has(path)) {
      pano.ui.page.unregister(path);
      registeredPaths.delete(path);
    }
  }

  for (const page of res.pages) {
    pano.ui.page.register({ path: page.url, component: customPageComponent });
    registeredPaths.add(page.url);
  }
});
```

Re-registering a page with `pano.ui.page.register` is safe: the same path simply overwrites the previous entry, so no duplicate guard is needed here — unlike nav links, which *would* duplicate, which is why `editNavLinks` needs its `some(...)` check.

::: warning Ghost routes in SSR
Dynamic pages registered from data survive in the Node process (SSR — server-side rendering — runs in one long-lived program). If you never unregister removed items, deleted pages keep serving during SSR until Pano restarts. The `pano-plugin-link-redirects` addon is the complete reference for this cleanup pattern, including removing stale nav links you added.
:::

## Old and AI-hallucinated APIs that do not exist

If an AI tool, an old tutorial, or scaffolding suggests any of these, ignore it — none of them exist. Use only what is on this page and in the [Frontend API Reference](/addon/api-reference/).

- **`pano.ui.page.register({ name, view, scopes })`** — the real `page.register` takes `{ path, component, permission, ... }` (see above). There is no `name`/`view`/`scopes` form.
- **`import { Button, Card } from '@panomc/sdk/components/panel'`** — there is no such component library in the SDK.
- **`onContextUpdate`** — older boilerplate defines this method, but **no host ever calls it**. If your scaffolded `main.js` contains `onContextUpdate`, delete it.
- **`ApiUtil.get('/api/...')` with a plain string** — every `ApiUtil` call takes an options object, e.g. `ApiUtil.get({ path: '/api/...' })`.
- **`pano.utils.toast`** — there is no such thing; toasts come only from `@panomc/sdk/toasts`.

## Where to next

You now have the whole Shoutbox UI: a home-page widget with SSR data, a panel settings section, a full panel page with a nav link, API calls, and translations.

- **[Frontend API Reference](/addon/api-reference/)** — every hook name, view slot, lifecycle event, and `@panomc/sdk` export in one place.
- **[Localization](/addon/localization/)** — where your `plugins.<pluginId>.<key>` strings live and how the panel lets admins override them.
- **[Backend Development](/addon/backend/)** — the Kotlin side of the endpoints and the permission this page calls.
- **[Building & Publishing](/addon/publishing/)** — turn the finished addon into a release jar. A release build **must** include the UI, so never use `-Pnoui` for it (`-Pnoui` is the Gradle flag that skips the UI build during backend-only iteration — see Building & Publishing).
- **Reference addons** — the built-in addons on the [PanoMC GitHub org](https://github.com/PanoMC) are the working reference for every pattern here: the **Announcement** addon (conditional `invisible`), the **FAQ** and **Pages** addons (`skipLoad` + `app.onLoad`), the **Comments** addon (`systemLayout`), and **`pano-plugin-link-redirects`** (dynamic pages + cleanup).
