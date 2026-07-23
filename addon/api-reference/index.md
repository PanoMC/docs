# Frontend API Reference

This page lists **every hook name, view slot, lifecycle event, navigation helper, and `@panomc/sdk` export** your addon's UI can use — in one place. It is a **lookup page**, not a tutorial.

**New here? The four things this page is a catalogue of, in plain words:**

- A **hook** = a named spot in a host page where your component gets rendered.
- A **view slot** = like a hook, but the items are ordered (by a priority number) and can be hidden or shown individually.
- A **lifecycle event** = a moment during page load that you can run code at.
- A **navigation helper** = an API for adding or editing links in the site menu or the admin sidebar.

::: tip How to read this page
It is a set of dense reference tables, grouped by API area (§1–§10). You don't read it top to bottom — you jump to the section for the thing you're wiring up. Each section opens with one plain sentence saying what it's for and **where it works** (theme, panel, or both). If a term in a table cell is unfamiliar, it's almost certainly defined in the "Concepts this page assumes" box just below — read that box once first.
:::

::: tip Concepts this page assumes (read once, ~60 seconds)
This page reuses a handful of words dozens of times each. Here is each in one plain sentence:

- **The host** — the running Pano frontend that loads and runs your addon's JavaScript. It is one of two apps: the **theme** or the **panel** (next bullet). "Host" here never means a server you rent.
- **Theme vs panel** — the two frontends. The **theme** is the public site players see, at `/`. The **panel** is the admin dashboard, at `/panel`. Your addon can run in both, and each exposes **different** APIs. `pano.isPanel` tells your code which one it is in.
- **Svelte store** — a value you can subscribe to. In a `.svelte` component, put `$` in front of it to read it reactively (`$myStore`). In plain JS, call `store.subscribe(fn)` and keep the function it returns so you can stop listening later (push that function into `this._unsubscribers`, see §1). Several APIs below "return a store". ([Svelte docs: stores](https://svelte.dev/docs/svelte/stores))
- **`load(event)`** — an optional function a page or hook can export. The host calls it while preparing the page. `event` describes the request (its URL, params, cookies). See the "three kinds of `load()`" box below.
- **props** — the values a Svelte component receives from whatever rendered it. Whatever object your `load()` returns becomes your component's props.
- **SSR / hydration** — SSR ("server-side rendering") means the **first** time a visitor opens a page, its HTML is built on the server; later navigations are built in the browser. **Hydration** is Svelte wiring up that server-built HTML in the browser so buttons, etc. become interactive.
- **bare specifier / external** — a *bare specifier* is an import path with no `./` or `/`, e.g. `import { x } from 'svelte'`. Your build leaves the allowed ones **external** — it does **not** copy them into your addon's JS; the host supplies them at runtime. See §10.
- **permission node** — a permission string like `x.y.z` that decides who is allowed to see or do something. For the list of nodes and how addons define their own, see the [Backend API Reference](/addon/backend-reference/).
:::

::: tip The three kinds of `load()` on this page
The word `load` shows up in three different roles. They are **not** interchangeable — mixing them up is a classic first-week bug:

| Where | You write | It receives | What its return means |
|---|---|---|---|
| **Page** (§2) | `export function load(event)` in a page module | `event` (the request) | the page component's props (four special keys like `pageTitle` are pulled out for the host) |
| **Hook** (§3) | `export function load(event)` in a hook module | `event` (the request) | the hook component's props; return `{ hookOptions: { invisible: true } }` to hide the hook |
| **Lifecycle handler** (§4, §6, §7) | `(data, event) => { … }` passed to an `onLoad(...)` / `lifecycle.on(...)` call | `data` (the page's data, sometimes mutable) **and** `event` | usually nothing — you read, or for marked events tweak, `data` in place |
:::

If you want to see these APIs used in a real addon, start with [Frontend Development](/addon/frontend/), which builds the Shoutbox UI step by step. Everything here is the surface that page draws from.

For the Kotlin half of your addon, this page has a sibling: the **[Backend API Reference](/addon/backend-reference/)** does the same job for the backend surface — the plugin lifecycle, database, endpoints, permissions, and events.

::: tip Where these come from
You write `import { X } from 'svelte'`, but your build never bundles Svelte into your addon's output — it leaves that import **external**, and the running Pano site (the host) supplies the one shared copy at runtime. That's why only certain imports are allowed (see §10). The `pano.*` tree documented below is injected into your plugin as `this.pano`; the `@panomc/sdk` modules are the frozen import list at the end of this page. (Full mechanism: [Architecture](/addon/architecture/).)
:::

## 0. The `pano` object

Everything is reached through the `pano` object the host injects into your plugin as `this.pano`. One flag lives at the top; the rest hangs off `pano.ui.*`.

| Property | Type | What it is |
|---|---|---|
| `pano.isPanel` | boolean | `true` when your code is running inside the admin **panel**, `false` inside the **theme**. Use it to run different registrations in each — i.e. `if (this.pano.isPanel) { /* panel registrations */ } else { /* theme registrations */ }`. |

The panel and the theme expose **different** `pano.ui` trees — a helper that exists in one may not exist in the other. So throughout this page each section says where its members live: **theme + panel**, **theme only**, or **panel only**. When a whole section is one-sided (like §4, theme only), its heading and a box at the top say so.

## 1. Plugin entry contract

Your `src/main.js` default-exports a class that extends `PanoPlugin` (from `@panomc/sdk`). The host creates one instance of it, injects `this.pano`, and calls the lifecycle methods below.

The smallest possible entry file is just this:

<!-- src/main.js — the whole file; your registrations go inside onLoad() -->
```js
import { PanoPlugin } from '@panomc/sdk';

export default class extends PanoPlugin {
  onLoad() {
    // your register(...) calls from sections 2–5 go here
  }
}
```

Every table further down is easier to read once you picture that skeleton.

| Member | Kind | Purpose |
|---|---|---|
| `onLoad()` | method (override) | Called once after the plugin loads. Do all your **registrations** here (the `register(...)` calls from sections 2–5 below). `this.pano` is available. **Don't touch `this.pano` in the constructor** — it is only injected just before `onLoad()` runs. |
| `onUnload()` | method (override) | Called when the plugin is torn down. Undo anything that must not linger (e.g. `pano.ui.page.unregister(...)`). |
| `this.pano` | property | The injected API object documented on this page. |
| `this.context` | property | A plain object where your plugin keeps state it wants to share with its components (e.g. settings you fetched). |
| `this.setContext(partial)` | method | Copies the keys of `partial` into `this.context` (like `Object.assign` — a **shallow** merge, one level deep) and notifies anything subscribed to the context that it changed. |
| `this._unsubscribers` | array | Push store-unsubscribe functions here (see the store bullet in the Concepts box); the host runs them all when the plugin is destroyed, so your subscriptions don't leak. |

Two functions come from `@panomc/sdk` alongside the base class:

| Export | Purpose |
|---|---|
| `viewComponent(importer)` | **Rule: always write `viewComponent(() => import('./X.svelte'))` when you hand a component to any `register` call** — never the bare `() => import(...)` and never the component itself. (It attaches the correct shared-runtime `mount`/`hydrate`/`unmount` for the host; that plumbing is why the wrapper is mandatory.) |
| `getPanoContext()` | Returns the current Pano host context. You can ignore this unless you need the raw host context from code that isn't a `PanoPlugin` method (a plain method has `this.context` instead) — rarely needed. |

::: warning `onContextUpdate` is not called
If the class you scaffolded from the boilerplate contains an `onContextUpdate()` method, **delete it — no host ever calls it.** It is dead code; do not build behavior on it. Use `onLoad()` for setup, and store subscriptions (see the Concepts box) for reacting to changes.
:::

## 2. Pages — `pano.ui.page` (theme + panel)

Use these to register whole pages of your own — under the theme (`/…`) or the panel (`/panel/…`).

| Call | Purpose |
|---|---|
| `pano.ui.page.register(options)` | Register a page at a path. |
| `pano.ui.page.unregister(path)` | Remove a page you registered (used for cleanup — see [Frontend Development](/addon/frontend/)). |
| `pano.ui.page.isPluginPage(path)` | `true` if some plugin has registered that path. |

**`register(options)`:**

| Option | Type | Meaning |
|---|---|---|
| `path` | string | The route (see path forms below). |
| `component` | `viewComponent(...)` | The page component. |
| `systemLayout` | string | Wrap your page in one of the host's built-in layouts (names listed below). Use `MainLayout` for a normal page; the other names match specific host sections (e.g. `ProfileLayout`, `SettingsLayout`). |
| `layout` | `viewComponent(...)` | Use your own layout component instead of a built-in one. |
| `resetLayout` | boolean | Render with **no** host header, sidebar, or footer — your component gets the whole page. ("Chrome" is the general word for that surrounding host UI.) |
| `permission` | string | Permission node (a permission string like `x.y.z` — see the [Backend API Reference](/addon/backend-reference/) for the list) required to view. If the current user lacks it, the page renders **404**. |

**Path forms:**

| Form | Example | Matches |
|---|---|---|
| literal | `/shoutbox` | exactly that path |
| dynamic segment | `/shout/[id]` or `/shout/:id` | one segment, captured as a param — read it in your `load(event)` as `event.params.id` |
| catch-all | `/docs/[...rest]` | the remaining segments (must be the final segment) |
| regex | `re:/shout/\d+` | the pattern must match the **whole** path, not just part of it — the host wraps it in `^…$` ("fully anchored") for you |

A page module may also **export `load(event)`** (see the "three kinds of `load()`" box near the top). `event` describes the request — its URL, params, and cookies. Whatever object you return is handed to your page component as its **props**. Four special keys are **removed** from that returned object and used by the host chrome instead of being passed as props:

- `pageTitle` — the title shown for the page (e.g. the browser tab).
- `breadcrumbs` — the breadcrumb trail the host renders above the page.
- `sidebar` — a sidebar for this page.
- `sidebarProps` — the props handed to that sidebar.

**`systemLayout` names — theme:** `AppLayout`, `AuthLayout`, `MainLayout`, `ProfileLayout`, `ThemeSettingsLayout`, `TicketsLayout`.

**`systemLayout` names — panel:** `AddonDetailLayout`, `AddonsLayout`, `AppLayout`, `MainLayout`, `MigrationLayout`, `PermissionsLayout`, `PlayerDetailLayout`, `PlayersLayout`, `PostsLayout`, `ServerLayout`, `ServerSettingsLayout`, `SettingsLayout`, `TicketsLayout`, `TranslationsLayout`, `ViewLayout`.

::: tip Checkpoint — did my page register?
After a `pano.ui.page.register({ path: '/your-path', component })` call, rebuild your addon and reload the site. Visiting `/your-path` should now show your component. Nothing there? Check that `component` is wrapped in `viewComponent(() => import('./X.svelte'))` and that `register` ran inside `onLoad()`.
:::

## 3. Hooks — `pano.ui.hook` (theme + panel)

A **hook** is a named hole in a host page: anything you register under that hook's name gets rendered at that fixed spot. A hook is a flat list of components under one name. (View slots in §4 add ordering and hiding on top of this same idea.)

| Call | Where | Purpose |
|---|---|---|
| `pano.ui.hook.register(options)` | theme + panel | Mount a component into a named hook. |
| `pano.ui.hook.get(name)` | theme + panel | Returns a **store** (see the Concepts box) of the components registered for `name`. |
| `pano.ui.hook.setVisible(name, component, visible)` | theme only | Toggle a hook entry's visibility. Pass the **same component reference** you gave to `register`. |

**`register(options)`:**

| Option | Type | Meaning |
|---|---|---|
| `name` | string | The hook name (tables below). |
| `component` | `viewComponent(...)` | The component to mount. |
| `permission` | string | Only render for users holding this permission node. |
| `skipLoad` | boolean | Do not run the component's `load()` during page load. Use this when your hook fetches its own data on mount, so a page-load run would be wasted or would fail. |
| `invisible` | boolean | Register but start hidden. |

**The hook `load()` / `hookProps` contract:** a hook component's module may export `load(event)`. The host runs it during page load — on the server the first time a page is opened (SSR), and in the browser when navigating between pages — and passes the result to your component as its props (that combined props object is the component's `hookProps`). A component can hide itself by returning `{ hookOptions: { invisible: true } }` **from its `load()`**.

::: tip Reading a hook name
A hook name tells you roughly where it renders. The **prefix** is the area: `theme:` = the public site, `page:` = the page content area, `panel:` = the admin panel. The **middle** names the page or table. The **suffix** names the spot: `:top`, `:bottom`, `:content`, `:sidebar`, or a table position like `:header:...` / `:row:...`. Not sure exactly where one lands? Register a component that renders a visible marker, rebuild, and look.
:::

The **Extra prop** column below lists any prop the host passes to your component **in addition** to your `load()` result.

### Theme hook names

| Hook name | Extra prop |
|---|---|
| `theme:top` | — |
| `page:top` | — |
| `page:home:top` | — |
| `theme:post-detail:bottom` | `post` |
| `theme:support:content` | — |

### Panel hook names

::: tip Table hooks and the `tag` prop
The panel hooks whose names contain `table:header` or `table:row` render **inside** the host's `<tr>` rows. The host passes you `tag` (either `'th'` for a header cell or `'td'` for a body cell); render `<svelte:element this={tag}>…</svelte:element>` so your cell is valid table HTML.
:::

| Hook name | Extra prop |
|---|---|
| `panel:plugin-detail:content` | `addon` |
| `panel:plugin-detail:content:<pluginId>` | `addon` |
| `panel:player-detail:bottom` | `playerData` |
| `panel:player-detail:sidebar` | `playerData` |
| `panel:post-editor:actions:right` | `post` |
| `panel:post-editor:sidebar:before` | `post` |
| `panel:post-editor:sidebar:after` | `post` |
| `panel:post-editor:content:bottom` | `post` |
| `panel:posts:layout:actions:right` | — |
| `panel:posts:table:header:start` | `tag="th"` |
| `panel:posts:table:header:after-title` | `tag="th"` |
| `panel:posts:table:header:after-category` | `tag="th"` |
| `panel:posts:table:header:after-views` | `tag="th"` |
| `panel:posts:table:header:after-author` | `tag="th"` |
| `panel:posts:table:header:end` | `tag="th"` |
| `panel:posts:table:row:start` | `post`, `tag="td"` |
| `panel:posts:table:row:after-thumbnail` | `post`, `tag="td"` |
| `panel:posts:table:row:after-title` | `post`, `tag="td"` |
| `panel:posts:table:row:after-category` | `post`, `tag="td"` |
| `panel:posts:table:row:after-views` | `post`, `tag="td"` |
| `panel:posts:table:row:after-author` | `post`, `tag="td"` |
| `panel:posts:table:row:end` | `post`, `tag="td"` |
| `panel:players:table:header:start` | `tag="th"` |
| `panel:players:table:header:after-name` | `tag="th"` |
| `panel:players:table:header:after-perm-group` | `tag="th"` |
| `panel:players:table:header:after-status` | `tag="th"` |
| `panel:players:table:header:after-last-login` | `tag="th"` |
| `panel:players:table:header:end` | `tag="th"` |
| `panel:players:table:row:start` | `player`, `tag="td"` |
| `panel:players:table:row:after-name` | `player`, `tag="td"` |
| `panel:players:table:row:after-perm-group` | `player`, `tag="td"` |
| `panel:players:table:row:after-status` | `player`, `tag="td"` |
| `panel:players:table:row:after-last-login` | `player`, `tag="td"` |
| `panel:players:table:row:end` | `player`, `tag="td"` |
| `panel:post-categories:table:header:start` | `tag="th"` |
| `panel:post-categories:table:header:after-category` | `tag="th"` |
| `panel:post-categories:table:header:after-description` | `tag="th"` |
| `panel:post-categories:table:header:after-url` | `tag="th"` |
| `panel:post-categories:table:header:end` | `tag="th"` |
| `panel:post-categories:table:row:start` | `category`, `tag="td"` |
| `panel:post-categories:table:row:after-category` | `category`, `tag="td"` |
| `panel:post-categories:table:row:after-description` | `category`, `tag="td"` |
| `panel:post-categories:table:row:after-url` | `category`, `tag="td"` |
| `panel:post-categories:table:row:end` | `category`, `tag="td"` |

The `post`, `playerData`, `addon`, `player`, and `category` props above are the **same objects the host page already uses** for that post / player / addon / category. Their exact fields aren't listed here — `console.log` the prop to inspect it, or open the matching host page's code.

::: tip `:<pluginId>`-suffixed hooks
`panel:plugin-detail:content:<pluginId>` renders only on **your** addon's detail page — substitute your own `pluginId` (the `id` your plugin declares — see the [Backend API Reference](/addon/backend-reference/)). This is the standard place to put an addon's settings panel.
:::

::: tip Checkpoint — did my hook render?
After `pano.ui.hook.register({ name: 'theme:top', component })`, rebuild and reload a themed page. Your component should appear at that hook's spot. If not, confirm you used a real hook name from the tables above and wrapped the component in `viewComponent(...)`.
:::

## 4. View slots — `pano.ui.view` (theme only)

A **view slot** is a named container that renders a **priority-ordered list** of plugin components (extra login methods, extra profile rows, and so on). Like a hook, but each slot item carries an `id` and a `priority`, so items can be individually hidden, reordered, or replaced.

**Hooks vs view slots at a glance:**

| | Hook (§3) | View slot (§4) |
|---|---|---|
| Ordering | none (a flat list) | by `priority` (higher renders first) |
| Per-item id | no | yes (`id`) — lets you hide/move/replace one item |
| Where it works | theme + panel | **theme only** |

::: warning `pano.ui.view` / `pano.ui.sidebar` exist only in the theme
- **Building for the panel?** Skip this whole section — the panel does not expose `view.register/hide/show/move/get/onLoad/load` or `pano.ui.sidebar` at all.
- **Panel exception 1:** extra rows in the player edit modal have their own dedicated API — see "Panel: player edit-modal rows" below.
- **Panel exception 2:** the panel's only `pano.ui.view` member is `pano.ui.view.themes.editMenu` — see §8.
:::

| Call | Purpose |
|---|---|
| `pano.ui.view.register({ viewId, id, component, priority })` | Add a component to slot `viewId`. `priority` defaults to `10`; re-registering the same `id` replaces it. |
| `pano.ui.view.hide(viewId, id)` | Hide an item without removing it. |
| `pano.ui.view.show(viewId, id)` | Un-hide it. |
| `pano.ui.view.move(viewId, id, priority)` | Change an item's priority. |
| `pano.ui.view.get(viewId)` | Returns a **store** (see the Concepts box) of the visible, ordered items. |
| `pano.ui.view.onLoad(viewId, handler)` | Run your handler each time this slot's data is loaded. (Under the hood this is the lifecycle event `theme:view:<viewId>:load` — see §6.) |
| `pano.ui.view.load(viewId, event)` | Run the slot's load pipeline and get the resolved items (for a plugin page that itself hosts a slot). |

`pano.ui.sidebar.*` is an **alias** of the same registry with the same methods, except the container key is `sidebarId` instead of `viewId` (and `onLoad` fires `theme:sidebar:<id>:load`).

**Slot item shape:** `{ id, component, priority, props? }`. Higher `priority` renders first. There is **no** per-item `permission` field — slot items are not permission-filtered. To restrict one, check the permission **inside your component** — `import { hasPermission } from '@panomc/sdk/utils/auth'` — and render nothing if it fails. (Hooks and nav links *do* support a `permission` option.)

### Theme slot IDs

| Slot ID | Where it renders |
|---|---|
| `login-content` | login page body |
| `login-alt-methods` | alternative login methods |
| `register-content` | register page body |
| `register-alt-methods` | alternative register methods |
| `profile-content` | profile page body |
| `profile-card-rows` | rows on the profile card |
| `settings-content` | settings page body |
| `settings-card-rows` | rows on the settings card |
| `tickets-content` | support tickets page body |
| `navbar-right` | right side of the navbar |
| `navbar-profile-dropdown` | profile dropdown menu |
| `support-content` | support page body |
| `support-options` | support page options list |
| `reset-password-content` | reset-password page body |
| `renew-password-content` | renew-password page body |
| `activate-content` | account-activation page body |
| `activate-new-email-content` | new-email-activation page body |

### Panel: player edit-modal rows

The panel has **no** `pano.ui.view` slot registry. Its one extension point of this kind — extra rows in the player edit modal — has its own dedicated API instead:

| Call | Purpose |
|---|---|
| `pano.ui.player.editModal.cardRows.edit(callback)` | Edit the list of card rows shown in the player edit modal. `callback` receives the current rows array; mutate it in place and return it. |
| `pano.ui.player.editModal.cardRows.get()` | Read the current card rows. |

The row objects mirror the modal's existing rows; their exact fields aren't listed here — call `cardRows.get()` (or `console.log` the array your `edit` callback receives) to inspect them. Avatar- and social-login-style addons use this to add a row to that modal.

### Priority conventions

Match these numbers so your items land in a sensible order **relative to other installed addons**. Reminder: **higher priority renders first**, so the negative `-100` deliberately puts support injections **last**.

| Slot kind | Convention |
|---|---|
| player-edit-modal rows | `100` |
| settings card rows | `105` |
| profile card rows | `90` |
| alternative auth methods | `50` |
| support injection | `-100` |
| everything else | `10` (default) |

## 5. Navigation — `pano.ui.nav`

Add or edit links in the site menu (theme) or the admin sidebar (panel). The theme and the panel expose **different** helpers.

**Theme (theme only):**

| Call | Purpose |
|---|---|
| `pano.ui.nav.site.editNavLinks(callback)` | **Synchronous.** Receives the current links array; either mutate it in place or return a new array. The result is re-sorted by the host by each link's `priority`. |
| `pano.ui.nav.site.getNavLinks()` | Store of the current site nav links. |
| `pano.ui.nav.profileDropdown.edit(callback)` / `.get()` | Edit / read the profile-dropdown items (this edits the `navbar-profile-dropdown` slot from §4). |
| `pano.ui.nav.rightComponents.edit(callback)` / `.get()` | Edit / read the navbar-right components (this edits the `navbar-right` slot from §4). |
| `pano.ui.nav.onLoad(handler)` | Subscribe to `theme:navbar:load` (a lifecycle event — see §6). |

**Theme nav-link shape** — `{ href, text, icon?, target?, startsWith, loginRequired?, permission?, priority? }`, field by field:

| Field | Required | Meaning |
|---|---|---|
| `href` | yes | Where the link points, e.g. `/shoutbox`. |
| `text` | yes | The visible label. If the string contains a `.` it is treated as a translation key and run through `_` (see §9 / Localization); otherwise it is shown as-is. |
| `startsWith` | yes | A **boolean** that controls active-link highlighting. When `true`, the link is highlighted whenever the current URL path *starts with* its `href` (so `/shoutbox` stays highlighted on `/shoutbox/123`); when `false`, only an exact path match highlights it. |
| `icon` | no | An icon **CSS class string** rendered on an `<i>`, e.g. `'fa-solid fa-comments'`. |
| `target` | no | Standard anchor `target`, e.g. `'_blank'` for a new tab. |
| `loginRequired` | no | If `true`, only show the link to logged-in users. |
| `permission` | no | Permission node; only show the link to users who hold it. |
| `priority` | no | Sort order among links (lower number runs first; links without one sort last). |

**Panel (panel only):**

| Call | Purpose |
|---|---|
| `pano.ui.nav.site.editNavLinks(async handler)` | **Async, must return the array.** Edits the panel's main sidebar links. |
| `pano.ui.nav.server.editNavLinks(async handler)` | Async, must return the array. Edits the server-section sidebar links. |

::: warning Panel nav callbacks must return the array
The theme's `editNavLinks` accepts an in-place mutation, but the panel's `editNavLinks` (and `server.editNavLinks`) are **async** and set the list to whatever you **return** — forget the `return` and you wipe the menu. It looks like this:

```js
pano.ui.nav.site.editNavLinks(async (links) => {
  links.push({ href: '/panel/shoutbox', text: 'Shoutbox' });
  return links; // forget this line and the sidebar goes blank
});
```
:::

## 6. Lifecycle events

Load-time events the host fires while a page's data is being prepared. Every handler has the signature `async (data, event)` — `event` is the same request-event object your `load()` receives (§2), and `data` is the page's in-progress data. In most handlers you just **read** `data`; for the marked events below you may **modify** it (see the Data notes column). Register with the shortcut helpers below, or with the generic primitive:

| Call | Purpose |
|---|---|
| `pano.ui.lifecycle.on(name, handler)` | Subscribe to any lifecycle event by name (theme + panel). |
| `pano.ui.lifecycle.execute(name, data, event)` | **Theme only.** Run a lifecycle yourself — e.g. your plugin renders its own login page and wants the host's login lifecycle (and other addons' handlers) to run on it. The panel's `pano.ui.lifecycle` exposes only `on`. |

### Theme lifecycle events

| Event | Shortcut | Data notes |
|---|---|---|
| `theme:app:load` | `pano.ui.app.onLoad(h)` | — |
| `theme:navbar:load` | `pano.ui.nav.onLoad(h)` | — |
| `theme:profile:load` | `pano.ui.profile.onLoad(h)` | — |
| `theme:settings:load` | `pano.ui.settings.onLoad(h)` | — |
| `theme:tickets:load` | `pano.ui.tickets.onLoad(h)` | — |
| `theme:login:load` | `pano.ui.auth.login.onLoad(h)` | `data = { error, event }` — you may set `data.error = '…'`; after your handler runs the host reads it and shows it on the login page |
| `theme:register:load` | `pano.ui.auth.register.onLoad(h)` | `data = { error, username, event }` — you may set `data.error` and `data.username`; the host reads them back |
| `theme:reset-password:load` | `pano.ui.auth.resetPassword.onLoad(h)` | — |
| `theme:activate:load` | `pano.ui.auth.activate.onLoad(h)` | `data = { token }` — `token` is the activation code from the link in the user's email (taken from the URL) |
| `theme:activate-new-email:load` | `pano.ui.auth.activateNewEmail.onLoad(h)` | `data = { token }` — same idea, for confirming a new email |
| `theme:renew-password:load` | `pano.ui.auth.renewPassword.onLoad(h)` | `data = { token }` — same idea, for a password-reset link |
| `theme:post-detail:load` | `pano.ui.post.onLoad(h)` | — |
| `theme:support:load` | `pano.ui.support.onLoad(h)` | — |
| `theme:view:<viewId>:load` | `pano.ui.view.onLoad(viewId, h)` | fired per slot |
| `theme:sidebar:<id>:load` | `pano.ui.sidebar.onLoad(id, h)` | fired per sidebar |

### Panel lifecycle events

| Event | Shortcut | Data notes |
|---|---|---|
| `panel:posts:load` | `pano.ui.posts.onLoad(h)` | — |
| `panel:addon-detail:load` | `pano.ui.addon.onLoad(h)` | `data = { addon }` |
| `panel:player-detail:edit-modal:load` | `pano.ui.player.onEditLoad(h)` | `data = { player }` |

## 7. Auth surfaces (theme only)

Helpers for the auth pages. `<page>` is one of `login`, `register`, `resetPassword`, `activate`, `activateNewEmail`, `renewPassword`.

| Call | Purpose |
|---|---|
| `pano.ui.auth.<page>.content.edit(callback)` / `.get()` | Edit / read that page's content slot. This is the same slot as §4's `<page>-content` (e.g. `pano.ui.auth.login.content.edit` edits the `login-content` slot) — a shortcut to it, not a separate mechanism. |
| `pano.ui.auth.<page>.onLoad(handler)` | Subscribe to that page's load event (the `theme:<page>:load` events in §6). |
| `pano.ui.auth.login.alternativeMethods.add(method)` / `.get()` | Add / read an alternative login method (e.g. a social-login button). |
| `pano.ui.auth.register.alternativeMethods.add(method)` / `.get()` | Same for register. |
| `pano.ui.auth.login.load(event)` | Run the login load flow (for a plugin page that presents its own login). Returns `{ error, username, event }`. |
| `pano.ui.auth.register.load(event)` | Same for a plugin registration page. |
| `pano.ui.auth.login.form.get()` | Returns the theme's own login-form body component, so a plugin page can render the standard login form inside its own layout. |
| `pano.ui.auth.register.form.get()` | Same, for the register form. |

`resetPassword`, `activate`, `activateNewEmail`, and `renewPassword` expose only `content.edit`/`content.get` and `onLoad`.

## 8. Miscellaneous

| Call | Where | Purpose |
|---|---|---|
| `pano.ui.avatar.updateVersion()` | theme + panel | Increment the avatar "cache-buster" — a version number appended to avatar image URLs — so browsers re-download the picture instead of showing the cached (old) one. Call it after a user changes their avatar. |
| `pano.ui.avatar.getVersion()` | theme + panel | Store of the current avatar version string. |
| `pano.ui.view.themes.editMenu(async handler)` | panel only | Edit the themes-page context-menu items. Async; the handler receives the current items and must **return** the array. |
| `pano.ui.posts.editMenu(async handler)` | panel only | Edit the posts context-menu items. Async; must **return** the array. |

For the two `editMenu` calls, the exact fields of a menu item aren't listed here — `console.log` the array your handler receives to see each item's shape before you add or change one.

## 9. `@panomc/sdk` module exports

This is the frozen **`@panomc/sdk`** import surface — each specifier maps to a stable host runtime module. Import from these exact paths, and never deep-import inside these packages (e.g. `@panomc/sdk/utils/api/something` will not resolve). (Svelte's own specifiers and any npm package you bundle also resolve — see §10 for the complete import picture.)

| Specifier | Exports |
|---|---|
| `@panomc/sdk` | `PanoPlugin`, `viewComponent`, `getPanoContext` |
| `@panomc/sdk/utils/api` | `ApiUtil` (default), `NETWORK_ERROR`, `networkErrorBody`, `buildQueryParams` |
| `@panomc/sdk/utils/auth` | `hasPermission(permission, user)` |
| `@panomc/sdk/utils/tooltip` | `tooltip` (also default) |
| `@panomc/sdk/utils/text` | `copy` |
| `@panomc/sdk/utils/language` | `_`, `languageLoading`, `currentLanguage`, `Languages`, `init`, `getAcceptedLanguage`, `loadLanguage`, `changeLanguage`, `getLanguageByLocale` |
| `@panomc/sdk/utils/component` | `viewComponent` |
| `@panomc/sdk/toasts` | `showToast`, `limitTitle` |
| `@panomc/sdk/components/theme` | `PlayerHead`, `NoContent`, `Date`, `Toast`, `PageTitle`, `PageActions`, `Pagination` |
| `@panomc/sdk/components/panel` | `NoContent`, `Editor`, `DragAndDropZone`, `Date`, `Toast`, `PageLoading`, `PageActions`, `PageLoader`, `PageNavItem`, `PageNav`, `Pagination`, `CardFilters`, `CardFiltersItem`, `CardHeader`, `SearchInput` |
| `@panomc/sdk/variables` | `API_URL`, `UI_URL`, `PANEL_URL`, `SETUP_URL`, `PANO_WEBSITE_URL`, `PANO_WEBSITE_API_URL`, `PRERELEASE`, `COOKIE_PREFIX`, `CSRF_TOKEN_COOKIE_NAME`, `JWT_COOKIE_NAME`, `CSRF_HEADER`, `updateApiUrl`, `updatePanoWebsiteUrl`, `updatePanoWebsiteApiUrl` |
| `@panomc/sdk/svelte` | `page`, `base`, `navigating`, `browser`, `goto`, `invalidate`, `invalidateAll`, `error`, `redirect` |
| `@panomc/sdk/internal` | `setPanoContext`, `getPanoContext` |

`viewComponent` appears twice — in `@panomc/sdk` and `@panomc/sdk/utils/component`. It's the **same function**; import from either (`@panomc/sdk` is the usual path).

The exports whose names aren't self-explanatory:

- `_` — the translation function/store: `$_('some.key')` in a component. See [Localization](/addon/localization/).
- `languageLoading`, `currentLanguage` — stores for the current i18n state.
- `tooltip` — a Svelte action: attach it with `use:tooltip` on an element.
- `copy` — copies a string to the clipboard.
- `hasPermission(permission, user)` — returns `true` if `user` holds `permission`; use it to show/hide UI (see §4).
- `showToast` / `limitTitle` — pop up a toast notification / truncate a long title string for one (see the `showToast` signature below).
- `NoContent` — an "empty state" placeholder component.
- `PageLoading` / `PageLoader` — loading-state UI (two variants; drop each in to see which fits your case).
- `PlayerHead` — renders a Minecraft player's head image.

::: tip Which `@panomc/sdk/variables` you actually need
Everyday use: `API_URL`, `UI_URL`, `PANEL_URL` (and `PRERELEASE` to detect a prerelease build). The rest — `CSRF_TOKEN_COOKIE_NAME`, `JWT_COOKIE_NAME`, `CSRF_HEADER`, `COOKIE_PREFIX`, the `update*Url` setters — are auth/security plumbing that `ApiUtil` already handles for you; you rarely touch them.
:::

::: tip `@panomc/sdk/svelte` = SvelteKit's own APIs
These mirror SvelteKit's exports — `page`, `navigating`, `browser` (from `$app/state` / `$app/environment`), `base` (from `$app/paths`), `goto`, `invalidate`, `invalidateAll` (from `$app/navigation`), and `error`, `redirect` (from `@sveltejs/kit`). See the SvelteKit docs for how each behaves. Import them from `@panomc/sdk/svelte`, not from `$app/...`, so they resolve to the host runtime.
:::

::: warning No `Button`, `Card`, or `Input`
`@panomc/sdk/components/panel` and `.../theme` export exactly the components listed above. There is no generic `Button`/`Card`/`Input` — some earlier examples referenced components that never existed; the list above is authoritative. Build simple controls with plain markup, or reuse the listed components.
:::

**`ApiUtil` method signatures** (all `async`, all take a single options object):

| Method | Options |
|---|---|
| `ApiUtil.get(...)` | `{ path, request, csrfToken, token, blob, handler }` |
| `ApiUtil.post(...)` | `{ path, request, body, headers, csrfToken, token, blob, handler, onUploadProgress }` |
| `ApiUtil.put(...)` | `{ path, request, body, headers, csrfToken, token, blob, handler, onUploadProgress }` |
| `ApiUtil.delete(...)` | `{ path, request, headers, csrfToken, token, blob, handler }` |
| `ApiUtil.customRequest(...)` | `{ path, data, request, csrfToken, token, blob, handler, onUploadProgress }` |

**What each option means** (not every option appears on every method — use the signature table above):

| Option | Meaning |
|---|---|
| `path` | The API path, **relative to `/api`** — pass `'shoutbox/list'` and the util calls `/api/shoutbox/list`. |
| `request` | The `load(event)` argument. Pass it whenever you call from inside a `load()` so the request has the CSRF token and works during SSR (see the note under the example). |
| `body` | The request payload (an object, sent as JSON; or a `FormData` for file uploads). POST/PUT only. |
| `headers` | Extra request headers. POST/PUT/DELETE. |
| `csrfToken` | CSRF token. You normally omit it — the util reads it from the session via `request`. |
| `token` | A bearer token; when set it is sent as `Authorization: Bearer <token>`. Omit for normal logged-in calls — cookies handle auth. |
| `blob` | Set `true` when the response is a file/binary, so it's read as a Blob instead of parsed as JSON. |
| `handler` | Optional `(data, reject) => data` callback that post-processes the parsed response before it is returned to you. |
| `onUploadProgress` | Upload-progress callback (POST/PUT/customRequest) — use it to drive a progress bar. |
| `data` | (customRequest only) the raw fetch options — `method`, `body`, `headers`. The `get`/`post`/etc. helpers build this for you. |

A minimal GET during page load — note `path` (relative to `/api`) and `request: event` in position:

```js
import ApiUtil from '@panomc/sdk/utils/api';

export async function load(event) {
  // pass request: event so the call works during SSR (the first page view)
  const response = await ApiUtil.get({ path: 'your-endpoint', request: event });
  return { response }; // this object becomes your page component's props
}
```

Always pass `request: event` when you call these inside a `load()`. If you forget, the call can't pick up the CSRF token or reuse the server's fetch during SSR — it may fail, or it may silently re-run in the browser after the page loads. That last case is the confusing one: it looks like it works when you click around the site, but breaks on a fresh page load or a hard refresh.

**`showToast` signature:** `showToast(text, params = {}, toastComponent)`.

| Argument | Meaning |
|---|---|
| `text` | The message. If it's a translation key (contains a `.`) it's translated; otherwise shown as-is. |
| `params` | With the default toast, these become the translation **values** interpolated into `text`. With a custom `toastComponent`, they're passed to that component as its props. Optional (defaults to `{}`). |
| `toastComponent` | Optional custom Svelte component to render instead of the default toast. |

## 10. What you may import

::: warning Only the frozen list resolves to the host runtime
Your build deliberately does **not** bundle these imports into your addon's JS — it leaves them **external**, and the host provides them at runtime so every addon shares one Svelte instance. Import anything outside the list and it will not resolve at runtime.
:::

Allowed bare specifiers are exactly:

- Every `@panomc/sdk` specifier in the §9 table.
- Svelte: `svelte`, `svelte/store`, `svelte/transition`, `svelte/easing`, `svelte/motion`, `svelte/animate`, `svelte/legacy`, `svelte/events`, `svelte/attachments`, `svelte/reactivity`, `svelte/reactivity/window`, and `svelte-i18n`.
- A **fixed** set of Svelte internals *(advanced — the compiler emits these imports into your built code for you; you never write them by hand)*: `svelte/internal`, `svelte/internal/client`, `svelte/internal/disclose-version`, `svelte/internal/flags/legacy`, `svelte/internal/flags/async`, and `svelte/internal/flags/tracing`. This is an exact list, **not** a `svelte/internal/*` wildcard; any other `svelte/internal/...` subpath does not resolve.

Anything else — `chart.js`, `svelte-select`, any other npm package — must be **bundled into your addon** by your rollup build, not imported bare. You don't do anything special for this: the boilerplate's rollup build already bundles anything you `bun add` and then `import` normally. (The market addon does exactly this to ship Chart.js.)

::: warning Never add `svelte` to your `package.json`
The SDK controls which Svelte version everyone compiles with (its version is pinned), and the build **fails** on a mismatch. A second copy of `svelte` in your `package.json` silently breaks your pages (the two copies disagree during hydration). See [Architecture](/addon/architecture/).
:::

## Known dead surfaces (don't use)

For completeness, two members exist on the surface but do nothing — don't build on them:

- `pano.debug` — a boolean flag on the `pano` object. It is currently hardcoded `false` and no host ever sets it, so do **not** use it to detect a development build.
- `onContextUpdate()` — an old boilerplate method that no host ever calls (see §1).

## Where to next

- **[Frontend Development](/addon/frontend/)** — the Shoutbox walkthrough that puts these APIs to work.
- **[Localization](/addon/localization/)** — how the `_` store and your locale files fit together.
- **[Changing Page Designs](/theme/views/)** — the theme-side view/hook model, if you also build themes.
