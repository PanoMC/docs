# Changing Page Designs

[Colors & Styling](../customization) lets you re-tint the whole site without code. When you need a page to have a **different layout or markup** — not just different colors — you change its **view**. This page shows how.

## The idea in plain words

Every page in Pano is made of two parts:

- **The logic** — loading data, handling logins, running plugins. The engine owns this, and you never touch it.
- **The view** — how that page *looks*: the markup and layout. This is yours to change.

Because the two are separate, you can **take ownership of any page's look without touching its logic**. The data still arrives, plugins still work, logins still happen — you only restyle the presentation.

There are **26 views** you can take over, one for each kind of page (home, login, register, profile, and so on).

## Step 1 — see what's available

List every view you can override, along with the data each one receives:

```sh
bunx @panomc/theme-core list-views
```

## Step 2 — take ownership of a view

To take over a view, **eject** it. Ejecting copies the engine's default version into your own `src/views/` folder and registers it in `theme.config.js`:

```sh
bunx @panomc/theme-core eject-view LoginView
```

After this you have a working `src/views/LoginView.svelte` that you can edit freely.

::: tip
Ejected files start as **working copies** of the real default — not a blank page. You *edit* an existing design, you don't write one from scratch. Start by changing small things and refreshing.
:::

## Step 3 — read the header ("the materials you're given")

Every ejected view begins with a comment header that documents **every prop** — the data and functions the engine hands your view. Think of it as the list of materials you have to work with. Here is a real excerpt from blaze-theme's `HomeView`:

```svelte
<!--
  @view HomeView (blaze override)
  Controller: $pano/lib/pages/HomePage.svelte
  Props:
    data.posts       array — posts of the current page
    data.postCount   number — total number of posts
    data.page        number — current page number
    data.totalPage   number — total page count for pagination
    themeSettings    object — theme settings from context
    onPageClick      function(data, page) — pagination handler
-->
```

Stores arrive as store objects (read them with a `$` prefix, like `$_`), and actions arrive as functions you call. Whatever the header lists is what you have; you don't need to know where any of it comes from.

## Keep the plugin mount points

::: warning
Two kinds of markers in a view are where **plugins** appear on the page: `<ViewComponent>` slots and `<Hook>` markers. When you redesign a view, **keep every one of them** — move them, restyle around them, but do not delete them. If you drop one, any plugin that relied on it silently disappears from your users' sites. `bun run check` fails if a mount point is missing, so the tool protects you before you can ship a broken theme.
:::

## Custom theme settings

If your redesigned view adds **new options** the site owner should be able to change (say, a hero title on the home page), those options need to be declared so the panel can **save and reset** them. You do this in `theme.config.js` under `settingsSchema`.

The rules are simple: entries are **additive** — your keys are appended to a tab (a new tab is created if it doesn't exist), and you can't remove or move a base key. `defaultTab` is optional; set it only if your view doesn't show the base default tab. Here is a compact, blaze-style example adding hero keys to the `header` tab:

```js
// theme.config.js
export default {
  views: {
    HomeView: () => import("./src/views/HomeView.svelte"),
  },
  settingsSchema: {
    tabs: {
      header: ["heroSubtitle", "heroSubtitleVisibility"],
    },
    defaultTab: "logo",
  },
};
```

Without this, your new inputs would render in the panel but never actually save. A key you only *read* in markup (with no input in the settings view) needs no entry here.

## An honest note

This tier needs **basic Svelte** — the templating language the views are written in. If you have never used it, the official [Svelte tutorial](https://svelte.dev/tutorial) is short and interactive, and covers everything a view uses.

Remember: you are never starting from a blank page. Every ejected view is a working copy of the real design — you edit it, refresh, and repeat.

## What's next?

Once your theme looks the way you want, the [Getting Started](../getting-started) guide covers building, checking the contract, packaging, and shipping.
