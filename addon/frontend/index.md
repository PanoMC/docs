# Frontend Development

Your addon ships a **Svelte UI** in the same jar as its [backend](/addon/backend/). That UI runs in two places: the public **theme** that visitors see, and the **panel** that admins use. One file — `src/main.js` — is the entry point for both.

This page builds the frontend of our running example, **Shoutbox**: a small widget of recent "shouts" at the top of the home page, plus a panel where admins manage them. By the end you can:

- mount a component on the home page and give it server-rendered data,
- add a settings section to your addon's panel detail page,
- register a full panel page with its own nav link,
- call your backend API and show a toast,
- translate text inside your components.

Every signature on this page is real. (The old version of this page used calls like `pano.ui.page.register({ name, view, scopes })` and `import { Button, Card } from '@panomc/sdk/components/panel'` — **none of those exist.** Use only what is shown here and in the [Frontend API Reference](/addon/api-reference/).)

::: tip New to Svelte?
Addon UIs are written in Svelte, the same as Pano themes. If you have never used it, the interactive [Svelte tutorial](https://svelte.dev/tutorial) covers everything an addon UI needs.
:::

## The entry point: `src/main.js`

Everything starts here. `main.js` exports a default class that extends `PanoPlugin`. Pano creates one instance, injects `this.pano`, and calls your `onLoad()` — once in the panel process and once in the theme process. You tell the two apart with `pano.isPanel` and register your UI in the right branch.

Here is the skeleton the whole addon builds on:

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

A few rules that matter, all of which the reference plugins follow:

- **The class must be the `default` export.** Pano looks for exactly one.
- **`this.pano` is your whole API.** It is injected before `onLoad()` runs — read `pano.isPanel` and use `pano.ui.*` from inside `onLoad()`.
- **Wrap every component in `viewComponent(() => import(...))`.** This is not optional. Every component you hand to a `register` call — hooks, pages, view slots — must be wrapped this way. `viewComponent` teaches the host how to load your component lazily and render it with the shared Svelte runtime.
- **Keep shared state in `main.js`.** Anything at module scope (like the `_` store above) lives here. The host imports your **entry** with a cache-busting `?v=<uiHash>` query while lazy chunks import it query-less — two URLs that would otherwise evaluate the entry twice — so the build routes it through a virtual facade and forces `main.js` into a single shared chunk that runs exactly once. (Other files are ordinary query-less chunks, each already loaded once; `main.js` is simply the guaranteed-single home for shared state.)

::: warning Never declare `svelte` in `package.json`
Your bundle does **not** ship Svelte, `svelte-i18n`, or `@panomc/sdk` — the host provides them so the whole page shares one Svelte instance. Adding `svelte` yourself pins a second copy and breaks hydration; the build is set up to fail on it. See [Architecture](/addon/architecture/) for why.
:::

You saw `onUnload()` above but not `onContextUpdate()`. Older boilerplate defines `onContextUpdate` — **no host ever calls it**, so don't put logic there.

## Theme: mount a widget on the home page

The theme exposes named **hooks** — spots where addons can inject a component. To show the Shoutbox on the home page, register a component for the `page:home:top` hook, in the `else` (theme) branch:

```js
pano.ui.hook.register({
  name: 'page:home:top',
  component: viewComponent(() => import('./theme/ShoutboxWidget.svelte')),
});
```

That is enough to render the widget. But a good widget needs data, and it needs that data to be there in the **first server response** — not fetched later in the browser — so visitors and search engines see the shouts immediately.

### Give the widget server-rendered data with `load()`

A hook component can export a `load(event)` function from its **module script**. The theme runs it while the page is being prepared (on the server during SSR, and on the client when navigating), and hands whatever you return to the component as props. In Shoutbox, `load()` calls our public endpoint:

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

The object you return becomes the component's props — here `shouts` arrives ready to render. This is the props flow the host calls **`hookProps`**.

::: warning `load()` runs on the server *and* the client
The same `load()` executes during SSR and again on client-side navigation. Keep it **idempotent** — no side effects, and never mutate objects you were handed. Always pass `request: event` to `ApiUtil` (next section) so the server-side call carries the visitor's session.
:::

Two extra tricks the real addons use:

- **Hide the widget conditionally.** If `load()` returns `{ hookOptions: { invisible: true } }`, the host renders nothing for that hook. The Announcement addon uses this to disappear when there is nothing to show.
- **Skip `load()` and fetch elsewhere.** Register with `skipLoad: true` and fetch your data from `pano.ui.app.onLoad(async (data, event) => { ... })` instead. This is the alternative data path — the FAQ and Pages addons use it when one fetch feeds several registrations.

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

`pano.ui.addon.onLoad` fires when any addon detail page loads, so the first line checks it is **yours** before fetching. The config you attach to `data.addon.config` is then available to `ShoutboxSettings.svelte` through the `addon` prop:

```svelte
<!-- src/panel/ShoutboxSettings.svelte -->
<script>
  export let addon;
  let config = addon?.config ?? { enabled: true, maxShouts: 5 };
</script>
```

## Panel: a full page with its own nav link

A settings section lives inside the addon detail page. When your addon needs a page of its own — a management screen at `/shoutbox` — register it as a **page** and add a link to the panel sidebar:

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

Notice two conventions every addon in the fleet follows:

- **Insert relative to an anchor.** Find an existing link (here `/posts`) and splice your link next to it, falling back to `push` if the anchor is missing — so your link lands in a sensible spot rather than always at the end.
- **Guard against duplicates.** `editNavLinks` can run more than once, so check `links.some((l) => l.href === '/shoutbox')` before adding. Always **return** the array.

::: tip Keep the permission string in sync
The `permission` string above is a hand-typed copy of the node your Kotlin `ManageShoutboxPermission` class derives (`pano.plugin.pano-plugin-shoutbox.manage.shoutbox`). There is no shared constant — if you rename the Kotlin class, the derived node changes and this UI gate silently stops matching. Change both together. See the permission rule in [Backend Development](/addon/backend/).
:::

If `permission` is not met, the page returns 404 and the nav link is hidden. Two more options exist for pages: `systemLayout` reuses a built-in panel layout (the Comments addon uses `systemLayout: 'PostsLayout'` so its page sits under the Posts section), and `resetLayout` drops the surrounding chrome. The full list of layout names is in the [Frontend API Reference](/addon/api-reference/).

## Calling your API and showing toasts

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

To confirm an action, show a toast:

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

::: warning These old signatures do not exist
`ApiUtil.get('/api/...')` with a plain string is **wrong** — every call takes an options object. There is also **no `pano.utils.toast`**; toasts come only from `@panomc/sdk/toasts`.
:::

## Translating text in your components

Nothing is injected into your components automatically. The translate helper is the `_` store you exported from `main.js` at the top of this page — a `derived` store that prefixes every key with `plugins.<pluginId>.`. Import it and read it with the `$` prefix:

```svelte
<script>
  import { _ } from '../main.js';
</script>

<h2>{$_('widget.title')}</h2>
```

`{$_('widget.title')}` resolves to the key `plugins.pano-plugin-shoutbox.widget.title` in your locale files. See [Localization](/addon/localization/) for where those keys live and how they are namespaced.

## Dynamic pages and cleanup

Sometimes the pages you register aren't known at build time — they come from your backend (custom URLs, redirects, and the like). Register them from inside `pano.ui.app.onLoad`, after fetching the list. The Pages addon does exactly this.

There is a sharp edge here. The theme's SSR process is **long-lived**: `pano.ui.app.onLoad` runs on every request, but the routes and links you register persist in that process between requests. If a page is deleted in the panel, the entry you registered earlier lingers — SSR still serves the ghost route until the process restarts, even though the browser no longer knows about it.

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

::: warning Ghost routes in SSR
Dynamic pages registered from data survive in the Node process. If you never unregister removed items, deleted pages keep serving during SSR until Pano restarts. The `pano-plugin-link-redirects` addon is the complete reference for this cleanup pattern, including removing stale nav links you added.
:::

## Where to next

You now have the whole Shoutbox UI: a home-page widget with SSR data, a panel settings section, a full panel page with a nav link, API calls, and translations.

- **[Frontend API Reference](/addon/api-reference/)** — every hook name, view slot, lifecycle event, and `@panomc/sdk` export in one place.
- **[Localization](/addon/localization/)** — where your `plugins.<pluginId>.<key>` strings live and how the panel lets admins override them.
- **[Backend Development](/addon/backend/)** — the Kotlin side of the endpoints and the permission this page calls.
- **[Building & Publishing](/addon/publishing/)** — turn the finished addon into a release jar (remember: a release build **must** include the UI, so never use `-Pnoui` for it).
