# Theme UI

**What this page gives you:** everything for the visitor-facing side of your addon — mount a component on the theme, give it server-rendered data, and call your backend. By the end the Shoutbox widget shows recent shouts on the home page.

Everything here goes in the **`else` (theme) branch** of `onLoad()` in [`main.js`](/addon/frontend/). If you have not set up `main.js` yet, read [Frontend Development](/addon/frontend/) first.

## Mount a widget on the home page

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
`ApiUtil` never throws on API errors — a failed call resolves to an object with `error` set (it does not throw and you do not check an HTTP status). Always check `res.error` before using the response; you'll see this in every example.
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

## Where to next

The visitor side is done: a home-page widget with SSR data, API calls, and (optionally) dynamic pages.

- **Add admin screens → [Panel UI](/addon/panel-ui/)** — settings sections, full panel pages with nav links, and toasts.
- **[Frontend API Reference](/addon/api-reference/)** — every hook name, view slot, and lifecycle event in one place.
- **[Translating text](/addon/frontend/#translating-text-in-your-components)** — the `$_` helper your components use for labels.
- **[Backend Development](/addon/backend/)** — the Kotlin endpoints your `load()` and `ApiUtil` calls hit.
