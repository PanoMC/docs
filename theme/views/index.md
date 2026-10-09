# Changing Page Designs

[Colors & Styling](../customization) lets you re-tint the whole site without code. When you need a page to have a **different layout or markup** — not just different colors — you change its **view**. This page shows how.

## The idea in plain words

Every page in Pano is made of two parts:

- **The logic** — loading data, handling logins, running plugins. The engine owns this, and you never touch it.
- **The view** — how that page *looks*: the markup and layout. This is yours to change.

Because the two are separate, you can **take ownership of any page's look without touching its logic**. The data still arrives, plugins still work, logins still happen — you only restyle the presentation.

There are **26 engine views** you can take over, one for each kind of page (home, login, register, profile, and so on), plus every view that installed plugins offer.

## Step 1 — see what's available

List every view you can override (engine views and the views of installed plugins), with the contract of each and which ones you already override:

```sh
bunx @panomc/theme-core list-views
```

To see them **rendered with sample data**, open `<your Pano address>/__pano/views` while the theme runs in dev mode. It is the view catalogue: every engine view and every plugin view on one page, so you can pick the one to change.

## Step 2 — take ownership of a view

To take over a view, **eject** it. Ejecting copies the engine's default version into your own `src/views/` folder and registers it in `theme.config.js`:

```sh
bunx @panomc/theme-core eject-view HomeView
```

After this you have a working `src/views/HomeView.svelte` that you can edit freely.

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

## A worked example — redesigning the home page

Let's actually do it. After `eject-view HomeView`, your `src/views/HomeView.svelte` looks like this (trimmed a little for reading):

```svelte
<div class="vstack gap-3">
  <Hook name="page:home:top" />

  <!-- Posts -->
  <Posts posts={data.posts} />

  <!-- Pagination -->
  {#if data.postCount > 0}
    <Pagination
      page={data.page}
      totalPage={data.totalPage}
      on:pageLinkClick={(event) => onPageClick(data, event.detail.page)} />
  {/if}
</div>

<script>
  import { _ } from "svelte-i18n";
  import Hook from "$pano/lib/components/Hook.svelte";
  import Pagination from "$pano/lib/components/Pagination.svelte";
  import Posts from "$pano/lib/components/Posts.svelte";

  export let data;
  export let themeSettings;
  export let onPageClick;
</script>
```

Read it top to bottom: a plugin area (`<Hook>`), the post list, and pagination. That's the whole home page. Now let's change it, one small edit at a time.

### Edit 1 — add your own markup

Anything you write in the markup just appears on the page. Add a welcome banner above the posts:

```svelte
<div class="vstack gap-3">
  <Hook name="page:home:top" />

  <div class="welcome-banner">
    <h1>Welcome, adventurer!</h1>
    <p>Grab your pickaxe — the server awaits.</p>
  </div>

  <!-- Posts -->
  <Posts posts={data.posts} />
  ...
```

Save, refresh → the banner is on your home page. Style `.welcome-banner` in your theme's SCSS like any other CSS class. This is most of theme work in a nutshell: **plain HTML and CSS, written inside the view.**

### Edit 2 — use the data you're given

The header told us `data.posts` is an array of posts. You don't have to use the ready-made `<Posts>` component — you can lay the posts out **your own way** with an `{#each}` loop:

```svelte
  <!-- Posts — replaced with our own card grid -->
  <div class="post-grid">
    {#each data.posts as post}
      <a class="post-card" href="/post/{post.url}">
        <h3>{post.title}</h3>
      </a>
    {/each}
  </div>
```

Save, refresh → same posts, completely different layout, and you own every pixel of it. The engine still loads the data, still paginates, still runs plugins — you only decided what a post looks like.

::: tip How do I know what's inside `post`?
Two easy ways: look at how the default markup used it, or drop `<pre>{JSON.stringify(post, null, 2)}</pre>` inside the loop for a moment — it prints the whole object on the page. Delete it when you're done.
:::

### Edit 3 — react to a setting

`themeSettings` holds what the site owner configured in the panel. Use it to make parts of your design optional:

```svelte
  {#if themeSettings.welcomeBannerVisible !== false}
    <div class="welcome-banner">
      <h1>Welcome, adventurer!</h1>
    </div>
  {/if}
```

Now the banner can be switched off from the panel — see [Custom theme settings](#custom-theme-settings) below for how to declare the key so it saves properly.

### That's the whole loop

Every view works exactly like this, whatever the page: eject → read the header to see your materials → edit markup → refresh. The login page, the profile, the post detail — same recipe, different props. When something breaks, undo your last edit; when in doubt, compare against the engine's default view (it's always visible in `node_modules/@panomc/theme-core/src/lib/views/`).

## The plugin API inside your views

Installed plugins show up on the page through markers that live **inside the views**. There are two kinds:

- **`<Hook>` markers** — named areas where plugins can inject their own components. A hook looks like `<Hook name="page:home:top" />` in the markup. The engine's views carry these hook names today:

  | Hook name | Where plugins appear |
  |---|---|
  | `theme:top` | The very top of every page |
  | `page:top` | The top of each page's content |
  | `page:home:top` | The top of the home page |
  | `theme:post-detail:bottom` | Under a post's content |
  | `theme:support:content` | Inside the support page |

- **`<ViewComponent>` slots** — places where a view renders a **list of plugin-registered components**, like extra login methods on the login page or extra rows on the profile card. These arrive through the props the view's header documents (stores such as `contentItems` or `altMethods`) and are rendered with `<ViewComponent component={item.component} … />`.

### What you must never remove

::: warning
When you redesign a view, **keep every `<Hook>` and every `<ViewComponent>` slot the original had** — move them, restyle around them, wrap them in your own markup, but do not delete them. If you drop one, any plugin that relied on it silently disappears from your users' sites. Also, a hook name must appear in **only one** view at a time — mounting the same hook in two places renders every plugin there twice.

You don't have to track this by hand: `bun run check` fails if an overridden view lost a mount point or a hook name is mounted twice, so the tool protects you before you can ship a broken theme.
:::

### Adding your own mount points

You are not limited to the built-in hooks — your theme can **extend the plugin API** by adding new hook areas of its own. Anywhere in a view you own, drop a new marker with a fresh name:

```svelte
<script>
  import Hook from "$pano/lib/components/Hook.svelte";
</script>

<Hook name="my-theme:hero:bottom" />
```

Any plugin that registers a component for `my-theme:hero:bottom` will now render there. Two rules keep this safe:

- **Namespace your names.** Start them with your theme's `id` (`my-theme:…`) so they can never collide with engine hooks or another theme's.
- **Don't repurpose existing names.** The built-in names in the table above have a fixed meaning that plugins depend on — add new names instead of reusing old ones somewhere else.

Once shipped, treat your custom hooks like a promise: plugins may start relying on them, so keep them across your theme's future versions just like the built-in ones.

### SSR and plugin loading — where plugin data comes from

Plugin content is not bolted on in the browser afterwards — it is part of **server-side rendering (SSR)**: when a page is rendered on the server, the plugin components mounted in hooks render right along with it, so visitors (and search engines) get the full page in the first response.

Behind the scenes, two plugin APIs make that work, and both are run by the **engine's controllers** — your theme never calls them, but it helps to know they exist:

- **Hook `load()` functions.** A plugin component mounted in a hook can export its own `load()`; the engine executes it during the page's load (on the server for SSR, on the client when navigating) and hands the results to the component automatically as **`hookProps`** — you may have noticed `hookProps` listed in some view headers' `data`. It flows through without you doing anything.
- **Lifecycle events.** Plugins can also subscribe to load-time events the engine fires while a page's data is prepared — `theme:app:load`, `theme:navbar:load`, `theme:profile:load`, `theme:post-detail:load`, `theme:support:load`, `theme:tickets:load`, `theme:settings:load` and friends. This is, for example, how plugins add items to the navbar early enough that they appear in the server-rendered HTML instead of popping in after the page loads.

What this means for you as a theme author:

- **Nothing to wire up** — as long as your overridden views keep the mount points, all of the above keeps working, SSR included.
- **One honest caveat about custom hooks:** the server-side `load()` pipeline runs only for the **built-in** hook names. A plugin mounted in a custom hook you added (like `my-theme:hero:bottom`) still renders — SSR included — but its `load()` data is not prepared by the engine, so such plugins typically fetch their data on the client.

## Redrawing a plugin's view

A plugin's site UI is a set of **named views**. The id of a view is `<ns>:<Name>` (for example `market:ProductCard`); engine views keep their bare names (`Navbar`). A theme can redraw any of them the same way as an engine view:

```sh
bunx @panomc/theme-core eject-view market:ProductCard
bunx @panomc/theme-core eject-view 'market:*' --pages
```

The command copies the plugin's readable source to `src/views/market/ProductCard.svelte`, removes `load` and `view` from it, rewrites imports of other plugin views to `pluginView("market:PriceTag")`, copies the helper files it needs, and writes the entry in `theme.config.js`:

```js
views: {
  Navbar: () => import("./src/views/Navbar.svelte"),
  "market:ProductCard": {
    contract: 2,
    controllers: ["market/cart"],
    component: () => import("./src/views/market/ProductCard.svelte"),
  },
},
```

Two rules keep this safe for both sides:

- **Data stays with the plugin.** Pages, injections and blocks keep the plugin's own `load`; your file supplies markup only. A `load` exported by an override is ignored.
- **A plugin update is never blocked by your theme.** The override is used only while its `contract` (and the version of every controller it pins) matches the plugin. Otherwise the plugin's own view renders and the panel lists the view as fallen back. To bring it up to date, run `eject-view market:ProductCard` again (it writes a `.new` file beside yours), merge, then `bunx @panomc/theme-core accept market:ProductCard`.

Plugin logic that is not markup (a cart, a session) is a **controller**, named `<ns>/<name>`. Use it in your own views and pages: `plugin('market').use('cart')` from `@panomc/sdk/controllers`. `bunx @panomc/theme-core check --fix` writes the version pins for you.

## Blocks, claims and slots

**Blocks.** Place a plugin view anywhere in your markup with `<PluginBlock>`. Its data loads per placement on the server, so two grids with different props get two data sets. Props must be literals:

```svelte
<script>
  import { PluginBlock } from "@panomc/sdk/components/theme";
</script>
<PluginBlock id="market:ProductGrid" limit={8} category="vip" />
```

An unknown id or a plugin that is not installed renders nothing.

**Claims.** A nav item, sidebar widget or hook that a plugin mounts by itself is an *injection*. When you place the same view yourself with `<PluginBlock id="market:NavCart" />`, the automatic copy disappears: your theme has claimed it. `theme.config.js` can set it by hand (`false` keeps the automatic copy):

```js
claims: { "market:NavCart": true, "market:CartOffcanvas": false },
```

**Slots.** A plugin view can open a slot for other plugins with `<PluginSlot id="market:checkout:payment" />`. If you override that view, keep every `<PluginSlot>` of the default.

## When a plugin is or is not installed {#plugin-installed}

Three ways, from most to least work:

1. **Behaviour and layout: `hasPlugin`.** `siteInfo.plugins` lists the installed, running plugins by plugin id. `hasPlugin(siteInfo, "market")` (from `$pano/lib/plugins.js`) answers it; the full id `"pano-plugin-market"` is canonical and the short namespace works too. `pluginInfo(siteInfo, "market")` returns `{ version, uiHash, dependencies }` or `null`. It keeps no state, so it is safe on the server. In a `load()` take `siteInfo` from `(await parent()).session`, in a component use `$session.siteInfo`:

```svelte
<Hero cta={hasPlugin($session.siteInfo, "market") ? "store" : "register"} />
```

2. **Show this block or that.** `<PluginBlock>` renders its `fallback` snippet when the plugin is missing: `<PluginBlock id="market:GoalWidget">{#snippet fallback()}<p>Join us!</p>{/snippet}</PluginBlock>`.
3. **Overrides and plugin CSS need no guard.** They stay unused when the plugin is missing, and the panel shows the plugin as "not installed", not as an error.

Do not call a plugin's API or controller without the check, and do not hard-code a menu entry to a plugin page.

## Routes

`theme.config.js` can add, disable and rename routes. The canonical paths in route files and plugin pages never change; the config changes only what visitors see:

```js
routes: {
  add:     { "/staff-team": "./src/pages/StaffTeam.svelte" },
  disable: ["/rules"],
  rename:  { "/store": "/shop", "/store/[slug]": "/shop/[slug]" },
},
```

A renamed-away path answers 308 to the new one, a disabled path is a 404, and both sides of a rename need the same `[param]` names. In your own markup write `href={route("/store")}` so links follow the map. Emails and redirects sent by Pano follow a rename too. Nothing may target `/posts` or `/__pano*`.

## The home page

The admin picks the home page from a select in the panel; you declare the options:

```js
home: {
  default: "landing",
  options: {
    posts:   { label: "Posts" },
    landing: { label: { "en-US": "Landing", tr: "Acilis" }, page: "./src/pages/Landing.svelte" },
    store:   { label: "Store", path: "/store" },
    custom:  { label: "Custom page", path: "*" },
  },
},
```

Without a `home` key the options are the posts feed, every installed plugin page that offers itself as a home page, and a custom path. A choice that cannot be shown (plugin removed) falls back to `default`, then to the posts feed.

## Themes without Bootstrap

All official themes ship Bootstrap and Font Awesome, and plugin default views are written for them. A theme with its own CSS says so:

```js
provides: { bootstrap: false, fontawesome: false },
```

Scaffold one with `bunx @panomc/theme-core new my-theme --bare`. The engine then links a scoped fallback stylesheet for every default plugin view you did not override, driven by the `--pano-*` variables from [Customization](/theme/customization/#the-pano-tokens). `check` reports a theme that says `bootstrap: false` but still imports Bootstrap. The fallback needs Chrome 118, Safari 17.4 or Firefox 146; below that a default plugin view is unstyled in a Bootstrap-free theme. A CSS child combinator (`.a > .b`) cannot cross the wrapper element the engine puts around each plugin's default view.

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

## Checking

```sh
bunx @panomc/theme-core check            # warnings and errors
bunx @panomc/theme-core check --strict   # warnings count as errors
```

## An honest note

This tier needs **basic Svelte** — the templating language the views are written in. If you have never used it, the official [Svelte tutorial](https://svelte.dev/tutorial) is short and interactive, and covers everything a view uses.

Remember: you are never starting from a blank page. Every ejected view is a working copy of the real design — you edit it, refresh, and repeat.

## What's next?

Once your theme looks the way you want, the [Getting Started](../getting-started) guide covers building, checking the contract, packaging, and shipping.
