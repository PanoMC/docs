# Frontend API Reference

Every hook name, view slot, lifecycle event, navigation helper, and `@panomc/sdk` export your addon's UI can use — in one page.

This is a **lookup page**, not a tutorial. If you want to see these APIs used in a real addon, start with [Frontend Development](/addon/frontend/), which builds the Shoutbox UI step by step. Everything here is the surface that page draws from.

For the Kotlin half of your addon, this page has a sibling: the **[Backend API Reference](/addon/backend-reference/)** does the same job for the backend surface — the plugin lifecycle, database, endpoints, permissions, and events.

::: tip Where these come from
Your addon's UI never bundles Svelte or the SDK — it imports them as bare specifiers that the host resolves to a shared runtime (see [Architecture](/addon/architecture/)). The `pano.*` tree below is injected into your plugin as `this.pano`; the `@panomc/sdk` modules are the frozen import list at the end of this page.
:::

## The `pano` object

Everything is reached through the `pano` object the host injects into your plugin as `this.pano`. Two flags live at the top; the rest hangs off `pano.ui.*`.

| Property | Type | What it is |
|---|---|---|
| `pano.isPanel` | boolean | `true` when your code is running inside the admin panel, `false` inside the theme. Branch on this in `onLoad()`. |
| `pano.debug` | boolean | Reserved flag on the `pano` object. It is currently hardcoded `false` and no host ever sets it, so do **not** rely on it to detect a development build. |

The panel and the theme expose **different** `pano.ui` trees — a helper that exists in one may not exist in the other. Panel-only and theme-only members are marked as such throughout this page.

## 1. Plugin entry contract

Your `src/main.js` default-exports a class extending `PanoPlugin` (from `@panomc/sdk`). The host constructs it, injects `this.pano`, and calls the lifecycle methods.

| Member | Kind | Purpose |
|---|---|---|
| `onLoad()` | method (override) | Called once after the plugin loads. Do all your registrations here. `this.pano` is available. |
| `onUnload()` | method (override) | Called when the plugin is torn down. Undo anything that must not linger (e.g. `pano.ui.page.unregister(...)`). |
| `this.pano` | property | The injected API object documented on this page. |
| `this.context` | property | The plugin-scoped context object. |
| `this.setContext(partial)` | method | Shallow-merge values into `this.context` and notify subscribers. |
| `this._unsubscribers` | array | Push store-unsubscribe functions here; the host runs them all when the plugin is destroyed. |

Two functions come from `@panomc/sdk` alongside the base class:

| Export | Purpose |
|---|---|
| `viewComponent(importer)` | **Mandatory** wrapper for every component you hand to any registration API. It attaches the correct shared-runtime `mount`/`hydrate`/`unmount`, so pass `viewComponent(() => import('./X.svelte'))`, never the bare importer. |
| `getPanoContext()` | Returns the current Pano host context. Rarely needed directly. |

::: warning `onContextUpdate` is not called
Older boilerplate ships an `onContextUpdate()` method on the plugin class. **No host ever invokes it.** It is dead code — do not build behavior on it. Use `onLoad()` for setup and store subscriptions for reacting to changes.
:::

## 2. Pages — `pano.ui.page`

Register full pages under the theme (`/…`) or the panel (`/panel/…`).

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
| `systemLayout` | string | Wrap the page in one of the host layouts (names below). |
| `layout` | `viewComponent(...)` | Use your own layout component instead. |
| `resetLayout` | boolean | Render with no host chrome at all. |
| `permission` | string | Permission node required to view; if the current user lacks it the page renders **404**. |

**Path forms:**

| Form | Example | Matches |
|---|---|---|
| literal | `/shoutbox` | exactly that path |
| dynamic segment | `/shout/[id]` or `/shout/:id` | one segment, captured as a param |
| catch-all | `/docs/[...rest]` | the remaining segments (must be the final segment) |
| regex | `re:/shout/\d+` | the pattern, fully anchored (`^…$`) |

A page module may also **export `load(event)`**; its return becomes the page's props. The keys `pageTitle`, `breadcrumbs`, `sidebar`, and `sidebarProps` are hoisted out of the returned object and used by the host chrome.

**`systemLayout` names — theme:** `AppLayout`, `AuthLayout`, `MainLayout`, `ProfileLayout`, `ThemeSettingsLayout`, `TicketsLayout`.

**`systemLayout` names — panel:** `AddonDetailLayout`, `AddonsLayout`, `AppLayout`, `MainLayout`, `MigrationLayout`, `PermissionsLayout`, `PlayerDetailLayout`, `PlayersLayout`, `PostsLayout`, `ServerLayout`, `ServerSettingsLayout`, `SettingsLayout`, `TicketsLayout`, `TranslationsLayout`, `ViewLayout`.

## 3. Hooks — `pano.ui.hook`

Hooks are single named injection points that the host renders in a fixed spot. Unlike view slots (below), a hook is a flat list of components under one name.

| Call | Where | Purpose |
|---|---|---|
| `pano.ui.hook.register(options)` | theme + panel | Mount a component into a named hook. |
| `pano.ui.hook.get(name)` | theme + panel | Store of the components registered for `name`. |
| `pano.ui.hook.setVisible(name, component, visible)` | theme only | Toggle a hook entry's visibility. |

**`register(options)`:**

| Option | Type | Meaning |
|---|---|---|
| `name` | string | The hook name (tables below). |
| `component` | `viewComponent(...)` | The component to mount. |
| `permission` | string | Only render for users holding this permission node. |
| `skipLoad` | boolean | Do not run the component's `load()` during page load. |
| `invisible` | boolean | Register but start hidden. |

**The `load()` / `hookProps` contract:** a hook component's module may export `load(event)`. The host runs it during page load (on the server for SSR, on the client when navigating) and passes the result to the component as props. A component can self-hide by returning `{ hookOptions: { invisible: true } }`.

### Theme hook names

| Hook name | Extra prop |
|---|---|
| `theme:top` | — |
| `page:top` | — |
| `page:home:top` | — |
| `theme:post-detail:bottom` | `post` |
| `theme:support:content` | — |

### Panel hook names

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

::: tip `:<pluginId>`-suffixed hooks
`panel:plugin-detail:content:<pluginId>` renders only on **your** addon's detail page — substitute your own `pluginId`. This is the standard place to put an addon's settings panel.
:::

## 4. View slots — `pano.ui.view` (theme only)

A view slot is a named container that renders a **priority-ordered list** of plugin components (extra login methods, extra profile rows, and so on). Unlike hooks, slot items carry an `id` and a `priority`.

::: warning `pano.ui.view` / `pano.ui.sidebar` exist only in the theme
This whole registry is a **theme-only** API — the panel does not expose `view.register/hide/show/move/get/onLoad/load` or `pano.ui.sidebar` at all. The panel's only `pano.ui.view` member is `themes.editMenu` (see §8), and its one player-edit-modal slot has a dedicated API documented below.
:::

| Call | Purpose |
|---|---|
| `pano.ui.view.register({ viewId, id, component, priority })` | Add a component to slot `viewId`. `priority` defaults to `10`; re-registering the same `id` replaces it. |
| `pano.ui.view.hide(viewId, id)` | Hide an item without removing it. |
| `pano.ui.view.show(viewId, id)` | Un-hide it. |
| `pano.ui.view.move(viewId, id, priority)` | Change an item's priority. |
| `pano.ui.view.get(viewId)` | Store of the visible, ordered items. |
| `pano.ui.view.onLoad(viewId, handler)` | Subscribe to `theme:view:<viewId>:load`. |
| `pano.ui.view.load(viewId, event)` | Run the slot's load pipeline and get the resolved items (for plugin pages that host a slot). |

`pano.ui.sidebar.*` is an **alias** of the same registry with the same methods, except the container key is `sidebarId` instead of `viewId` (and `onLoad` fires `theme:sidebar:<id>:load`).

**Slot item shape:** `{ id, component, priority, props? }`. Higher `priority` renders first. There is **no** per-item `permission` — slot items are not permission-filtered, so gate visibility inside the component itself. (Hooks and nav links *do* support `permission`.)

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
| `pano.ui.player.editModal.cardRows.edit(callback)` | Edit the list of card rows shown in the player edit modal. Return the array. |
| `pano.ui.player.editModal.cardRows.get()` | Read the current card rows. |

Avatar- and social-login-style addons use this to add a row to that modal.

### Priority conventions

Match these so your items land in a sensible order relative to the fleet:

| Slot kind | Convention |
|---|---|
| player-edit-modal rows | `100` |
| settings card rows | `105` |
| profile card rows | `90` |
| alternative auth methods | `50` |
| support injection | `-100` |
| everything else | `10` (default) |

## 5. Navigation — `pano.ui.nav`

The theme and the panel expose different nav helpers.

**Theme:**

| Call | Purpose |
|---|---|
| `pano.ui.nav.site.editNavLinks(callback)` | Synchronous. Receives the current links array; mutate it or return a new one. Result is re-sorted by the host. |
| `pano.ui.nav.site.getNavLinks()` | Store of the current site nav links. |
| `pano.ui.nav.profileDropdown.edit(callback)` / `.get()` | Edit / read the profile-dropdown items (a `navbar-profile-dropdown` slot). |
| `pano.ui.nav.rightComponents.edit(callback)` / `.get()` | Edit / read the navbar-right components (a `navbar-right` slot). |
| `pano.ui.nav.onLoad(handler)` | Subscribe to `theme:navbar:load`. |

**Theme nav-link shape:** `{ href, text, icon?, target?, startsWith, loginRequired?, permission?, priority? }`.

**Panel:**

| Call | Purpose |
|---|---|
| `pano.ui.nav.site.editNavLinks(async handler)` | **Async, must return the array.** Edits the panel's main sidebar links. |
| `pano.ui.nav.server.editNavLinks(async handler)` | Async, must return the array. Edits the server-section sidebar links. |

::: warning Panel nav callbacks must return the array
The theme's `editNavLinks` accepts an in-place mutation, but the panel's `editNavLinks` (and `server.editNavLinks`) are **async** and set the list to whatever you return — forget the `return` and you wipe the menu.
:::

## 6. Lifecycle events

Load-time events the host fires while a page's data is prepared. Every handler has the signature `async (data, event)`. Register with the sugar helpers below, or with the generic primitive:

| Call | Purpose |
|---|---|
| `pano.ui.lifecycle.on(name, handler)` | Subscribe to any lifecycle event by name (theme + panel). |
| `pano.ui.lifecycle.execute(name, data, event)` | **Theme only.** Run a lifecycle (for plugin pages that want to take part in a host flow). The panel's `pano.ui.lifecycle` exposes only `on`. |

### Theme lifecycle events

| Event | Sugar helper | Data notes |
|---|---|---|
| `theme:app:load` | `pano.ui.app.onLoad(h)` | — |
| `theme:navbar:load` | `pano.ui.nav.onLoad(h)` | — |
| `theme:profile:load` | `pano.ui.profile.onLoad(h)` | — |
| `theme:settings:load` | `pano.ui.settings.onLoad(h)` | — |
| `theme:tickets:load` | `pano.ui.tickets.onLoad(h)` | — |
| `theme:login:load` | `pano.ui.auth.login.onLoad(h)` | `data = { error, event }` — `error` is read back (mutable) |
| `theme:register:load` | `pano.ui.auth.register.onLoad(h)` | `data = { error, username, event }` — `error` and `username` read back (mutable) |
| `theme:reset-password:load` | `pano.ui.auth.resetPassword.onLoad(h)` | — |
| `theme:activate:load` | `pano.ui.auth.activate.onLoad(h)` | `data = { token }` |
| `theme:activate-new-email:load` | `pano.ui.auth.activateNewEmail.onLoad(h)` | `data = { token }` |
| `theme:renew-password:load` | `pano.ui.auth.renewPassword.onLoad(h)` | `data = { token }` |
| `theme:post-detail:load` | `pano.ui.post.onLoad(h)` | — |
| `theme:support:load` | `pano.ui.support.onLoad(h)` | — |
| `theme:view:<viewId>:load` | `pano.ui.view.onLoad(viewId, h)` | fired per slot |
| `theme:sidebar:<id>:load` | `pano.ui.sidebar.onLoad(id, h)` | fired per sidebar |

### Panel lifecycle events

| Event | Sugar helper | Data notes |
|---|---|---|
| `panel:posts:load` | `pano.ui.posts.onLoad(h)` | — |
| `panel:addon-detail:load` | `pano.ui.addon.onLoad(h)` | `data = { addon }` |
| `panel:player-detail:edit-modal:load` | `pano.ui.player.onEditLoad(h)` | `data = { player }` |

## 7. Auth surfaces (theme)

Helpers for the auth pages. `<page>` is one of `login`, `register`, `resetPassword`, `activate`, `activateNewEmail`, `renewPassword`.

| Call | Purpose |
|---|---|
| `pano.ui.auth.<page>.content.edit(callback)` / `.get()` | Edit / read that page's content slot. |
| `pano.ui.auth.<page>.onLoad(handler)` | Subscribe to that page's load event. |
| `pano.ui.auth.login.alternativeMethods.add(method)` / `.get()` | Add / read an alternative login method (e.g. social login). |
| `pano.ui.auth.register.alternativeMethods.add(method)` / `.get()` | Same for register. |
| `pano.ui.auth.login.load(event)` | Run the login load flow (for a plugin page that presents a login). Returns `{ error, username, event }`. |
| `pano.ui.auth.register.load(event)` | Same for a plugin registration page. |
| `pano.ui.auth.login.form.get()` | Resolve the theme's login form body component. |
| `pano.ui.auth.register.form.get()` | Resolve the theme's register form body component. |

`resetPassword`, `activate`, `activateNewEmail`, and `renewPassword` expose only `content.edit`/`content.get` and `onLoad`.

## 8. Miscellaneous

| Call | Where | Purpose |
|---|---|---|
| `pano.ui.avatar.updateVersion()` | theme + panel | Bump the avatar cache-buster so profile pictures refresh. |
| `pano.ui.avatar.getVersion()` | theme + panel | Store of the current avatar version string. |
| `pano.ui.view.themes.editMenu(async handler)` | panel only | Edit the themes-page context menu items (must return the array). |
| `pano.ui.posts.editMenu(async handler)` | panel only | Edit the posts context menu items (must return the array). |

## 9. `@panomc/sdk` module exports

The frozen import surface. Each specifier maps to a stable host runtime module — import from these exact paths, never deep-import anything else.

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

::: warning No `Button`, `Card`, or `Input`
`@panomc/sdk/components/panel` and `.../theme` export exactly the components listed above. There is no generic `Button`/`Card`/`Input` — older docs invented those. Build simple controls with plain markup, or reuse the listed components.
:::

**`ApiUtil` method signatures** (all `async`, all take a single options object):

| Method | Options |
|---|---|
| `ApiUtil.get(...)` | `{ path, request, csrfToken, token, blob, handler }` |
| `ApiUtil.post(...)` | `{ path, request, body, headers, csrfToken, token, blob, handler, onUploadProgress }` |
| `ApiUtil.put(...)` | `{ path, request, body, headers, csrfToken, token, blob, handler, onUploadProgress }` |
| `ApiUtil.delete(...)` | `{ path, request, headers, csrfToken, token, blob, handler }` |
| `ApiUtil.customRequest(...)` | `{ path, data, request, csrfToken, token, blob, handler, onUploadProgress }` |

Always pass `request: event` when you call these inside a `load()` so the request works during SSR.

**`showToast` signature:** `showToast(text, params = {}, toastComponent)`.

## 10. What you may import

::: warning Only the frozen list resolves to the host runtime
A plugin build leaves these bare specifiers **external** — the host provides them so every addon shares one Svelte instance. Import anything outside the list and it will not resolve at runtime.
:::

Allowed bare specifiers are exactly:

- Every `@panomc/sdk` specifier in the table above.
- Svelte: `svelte`, `svelte/store`, `svelte/transition`, `svelte/easing`, `svelte/motion`, `svelte/animate`, `svelte/legacy`, `svelte/events`, `svelte/attachments`, `svelte/reactivity`, `svelte/reactivity/window`, and `svelte-i18n`.
- A **fixed** set of Svelte internals — `svelte/internal`, `svelte/internal/client`, `svelte/internal/disclose-version`, `svelte/internal/flags/legacy`, `svelte/internal/flags/async`, and `svelte/internal/flags/tracing`. This is an exact list, **not** a `svelte/internal/*` wildcard; any other `svelte/internal/...` subpath does not resolve.

Anything else — `chart.js`, `svelte-select`, any other npm package — must be **bundled into your addon** by your rollup build, not imported bare. (The market addon does exactly this to ship Chart.js.)

::: warning Never add `svelte` to your `package.json`
The Svelte compiler version comes from `@panomc/sdk`'s pin, and the build fails on a mismatch. Adding your own `svelte` dependency causes version skew that breaks hydration. See [Architecture](/addon/architecture/).
:::

## Where to next

- **[Frontend Development](/addon/frontend/)** — the Shoutbox walkthrough that puts these APIs to work.
- **[Localization](/addon/localization/)** — how the `_` store and your locale files fit together.
- **[Changing Page Designs](/theme/views/)** — the theme-side view/hook model, if you also build themes.
