# Frontend

The backend can store and serve shouts. Now let's *show* them. On this page we mount a widget on the home page, then add a panel page where admins manage shouts. This is the Svelte half — the part visitors and admins actually see and click.

Full reference: [Frontend Development](/addon/frontend/).

::: tip This half is hot — no rebuilds
Unlike Kotlin, the UI hot-reloads. Start the watcher once and leave it running the whole time:

```sh
bun run dev
```

Every change below shows up on a browser refresh (F5), as long as Development Mode is on and your clone is under the install's `plugins/` folder.
:::

## The entry point: `src/main.js`

Everything starts in `main.js`, which the boilerplate already has. It exports one default class extending `PanoPlugin`. Pano runs its `onLoad()` **twice** — once in the theme (the public site) and once in the panel (the admin dashboard). You tell them apart with `pano.isPanel`:

```js
export default class ShoutboxUiPlugin extends PanoPlugin {
  onLoad() {
    const { pano } = this;

    if (pano.isPanel) {
      // panel registrations go here
    } else {
      // theme registrations go here
    }
  }
}
```

Two rules that matter everywhere below:

- **Wrap every component in `viewComponent(() => import('./File.svelte'))`.** This is not optional — it hands Pano a *recipe* for loading your file with the page's own copy of Svelte.
- **`pluginId` must exactly match** the id from the backend (`pano-plugin-shoutbox`). Translations and hooks are keyed on it.

::: warning Never add `svelte` to `package.json`
Your bundle does not ship Svelte, `svelte-i18n`, or `@panomc/sdk` — the host provides them so the whole page shares one Svelte instance. Adding your own copy breaks hydration. If your build starts failing right after a `bun add`, check for a stray `svelte` entry and remove it. See [Architecture](/addon/architecture/) for why.
:::

## Step 1 — mount the widget on the home page

The theme exposes named **hooks** — spots where addons can inject a component. To put Shoutbox at the top of the home page, register a component for the `page:home:top` hook, in the `else` (theme) branch:

```js
pano.ui.hook.register({
  name: 'page:home:top',
  component: viewComponent(() => import('./theme/ShoutboxWidget.svelte')),
});
```

::: tip Check
Open the site's home page. You should see the widget's container at the very top (inspect it with devtools). It'll be empty until the next step — that's expected. If it's missing entirely, check the browser console and confirm you registered in the `else` branch with the right `pluginId`.
:::

## Step 2 — give the widget its data with `load()`

A widget needs data, and it needs that data in the **first server response** so visitors and search engines see the shouts immediately. A hook component does this by exporting a `load(event)` from its **module script** — the `<script module>` block. Pano runs `load()` while the page is prepared and hands what you return to the component as props:

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

This calls the public endpoint you built on the [Backend](/handbook/addon/backend/) page. Two rules for `load()`:

- **Always pass `request: event`** so the server-side call carries the visitor's session. Forget it and the fetch runs *logged out* during SSR — data goes missing only on a hard refresh, which is a confusing bug to chase.
- **`load()` runs on the server *and* the client**, so keep it side-effect-free: only fetch and return data.

::: tip How `ApiUtil` reports errors
`ApiUtil` never throws on API errors — a failed call resolves to an object with `error` set. Check `res.error` before using the response; that's why the `load()` above falls back to `res.shouts ?? []`.
:::

::: tip Check
Refresh the home page — the widget now shows one `<p class="shout">` per shout (if your backend has any; post one via the panel page below). To prove the data is in the *first* response, hard-refresh (Ctrl/Cmd+Shift+R) and use **View source** — the shouts should already be in the HTML, not blank.
:::

## Step 3 — a panel page for managing shouts

Now the admin side. When your addon needs a page of its own — a management screen at `/shoutbox` — register it as a **page** and add a link to the panel sidebar, both in the `if (pano.isPanel)` branch:

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

A few things worth knowing:

- **`nav.site` is the panel's main sidebar.** The extra `site` word is not a typo — other nav areas exist.
- **That `permission` string is a hand-typed copy** of the node your Kotlin `ManageShoutboxPermission` class derives. There's no shared constant — if you rename the Kotlin class, change both together, or the gate silently stops matching.
- **`text` is a translation key, not a label.** Until you add it (next page), the sidebar shows the raw key `plugins.pano-plugin-shoutbox.nav.shoutbox`. That's expected here.
- **Guard against duplicates.** `editNavLinks` re-runs on every page load in the long-lived server, so check `links.some(...)` before adding — and always **return** the array.

Inside `ShoutboxPage.svelte` you build the actual management UI: list the shouts, a form that calls `ApiUtil.post({ path: '/api/panel/shoutbox', body: { message } })` to add one, and a delete button. To confirm an action, show a toast with `showToast` from `@panomc/sdk/toasts`. Full examples are in [Frontend Development](/addon/frontend/#showing-toasts).

::: tip Check
Reload the panel. A bullhorn icon appears in the sidebar just under **Posts**, labelled with the raw key (it turns into real text once you add the locale key next page). Click it to open your page at `/shoutbox`. If `permission` isn't met, the page 404s and the link is hidden.
:::

::: tip A cheaper alternative: a settings section
If you don't need a whole page, you can instead add a component to your addon's detail page (the `panel:plugin-detail:content:<pluginId>` hook) — the cheapest way to give an addon a settings screen. Most built-in addons do exactly this; see [Frontend Development](/addon/frontend/#panel-a-settings-section-on-your-addon-s-detail-page).
:::

## Beware fake APIs

If an AI assistant or an old tutorial hands you a call that isn't on the [Frontend API Reference](/addon/api-reference/), it doesn't exist. Common fakes: `ApiUtil.get('/api/...')` with a plain string (every call takes an options object), a `@panomc/sdk/components/panel` component library (there is none), and `onContextUpdate` (no host ever calls it — delete it if scaffolding added it). The full list is at the [bottom of the Frontend reference](/addon/frontend/#old-and-ai-hallucinated-apis-that-do-not-exist).

## Where we are

Shoutbox now has a home-page widget with server-rendered data and a panel page with its own nav link. But its text is still hard-coded English. Let's fix that.

**Next: [Translations →](/handbook/addon/translate/)**
