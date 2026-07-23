# Panel UI

**What this page gives you:** the admin side of your addon — a settings section on its detail page, a full panel page with its own sidebar link, and toasts to confirm actions. By the end admins can manage Shoutbox from the panel.

Everything here goes in the **`if (pano.isPanel)` branch** of `onLoad()` in [`main.js`](/addon/frontend/). If you have not set up `main.js` yet, read [Frontend Development](/addon/frontend/) first. Network calls use `ApiUtil` — its rules and error handling are covered in [Calling your API](/addon/theme-ui/#calling-your-api).

## A settings section on your addon's detail page

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
A `load()` should never mutate objects it was handed. `onLoad` callbacks are the deliberate exception: the `data` object is **meant** to be extended, and attaching your config to `data.addon.config` is the supported way to pass it to your components.
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

## A full page with its own nav link

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

To confirm an action to the admin, show a toast (a small pop-up message). Import `showToast` from `@panomc/sdk/toasts` — and note it uses the `$_` translate helper from [Translating text](/addon/frontend/#translating-text-in-your-components):

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

## Where to next

The admin side is done: a settings section, a full panel page with a nav link, and toasts.

- **[Localization](/addon/localization/)** — add the `plugins.<pluginId>.<key>` strings behind your nav label and toast messages so they show real text.
- **[Frontend API Reference](/addon/api-reference/)** — every hook name, nav area, page layout, and lifecycle event in one place.
- **[Theme UI](/addon/theme-ui/)** — the visitor-facing side, including `ApiUtil` in full.
- **[Backend Development](/addon/backend/)** — the Kotlin endpoints and the permission this page gates on.
- **[Building & Publishing](/addon/publishing/)** — turn the finished addon into a release jar. A release build **must** include the UI, so never use `-Pnoui` for it.
- **Reference addons** — the built-in addons on the [PanoMC GitHub org](https://github.com/PanoMC) are the working reference for every pattern here: the **Announcement** addon (conditional `invisible`), the **FAQ** and **Pages** addons (`skipLoad` + `app.onLoad`), the **Comments** addon (`systemLayout`), and **`pano-plugin-link-redirects`** (dynamic pages + cleanup).
