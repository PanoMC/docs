# Architecture

You built and loaded an addon in [Getting Started](/addon/getting-started/). This page explains what actually happened: what is inside that one jar, what Pano does when it loads it, and where every file you write ends up at runtime.

By the end you will be able to explain the full load lifecycle, know **why you must never add `svelte` as a dependency**, and point to where each file in the repo lives once the addon is running.

## One jar, three runtimes

An addon ships as a **single jar**, but the code inside it runs in three different places:

1. **The Kotlin backend** — loaded by [PF4J](https://pf4j.org/) straight into the Pano JVM. This is your endpoints, database tables, permissions, and event listeners. It runs in the same process as Pano itself.
2. **A Svelte *client* bundle** — runs in the visitor's browser, inside **both** the panel and the active theme. This is the UI a user actually clicks.
3. **A Svelte *server* bundle** — the same UI, compiled for **server-side rendering (SSR)**. The theme and panel are Node processes that render your components into HTML before the browser ever sees them.

The important part: there is **one** UI entry file, `src/main.js`, and it serves the panel *and* the theme. You do not write two UIs — you write one and branch on where it is running:

```js
onLoad() {
  const { pano } = this;
  if (pano.isPanel) {
    // panel registrations
  } else {
    // theme registrations
  }
}
```

So the jar carries a backend that runs in Pano's JVM and a UI that runs in two Node/browser contexts, all built from one source tree. The rest of this page follows each of those to where it lives at runtime.

## Where every file ends up

Here is the Shoutbox addon's repository, with a note on what each part becomes at runtime. Compare it to the tree the boilerplate ships with — the folder names are conventions, but the split between `src/` (UI) and `src/main/` (backend + resources) is fixed.

```text
pano-plugin-shoutbox/
├─ build.gradle.kts             # Gradle build
├─ gradle.properties            # the manifest — id, class, versions (see Manifest page)
├─ package.json                 # UI dependencies (never lists svelte — see below)
├─ rollup.config.js             # builds the Svelte UI
├─ src/
│  ├─ main.js                   # the single UI entry (panel + theme)
│  ├─ panel/                    # Svelte components shown in the panel
│  │  └─ ShoutboxSettings.svelte
│  ├─ theme/                    # Svelte components shown in the theme
│  │  └─ ShoutboxWidget.svelte
│  └─ main/
│     ├─ kotlin/com/panomc/plugins/shoutbox/
│     │  ├─ ShoutboxPlugin.kt   # your PanoPlugin subclass — the entry point
│     │  ├─ config/             # ShoutboxConfig
│     │  ├─ db/
│     │  │  ├─ dao/             # ShoutDao (abstract)
│     │  │  ├─ impl/            # ShoutDaoImpl (@Dao)
│     │  │  ├─ model/           # Shout entity
│     │  │  └─ migration/       # DatabaseMigration classes
│     │  ├─ routes/
│     │  │  ├─ api/             # public endpoints (GetShoutsAPI)
│     │  │  └─ panel/           # panel endpoints (PanelApi)
│     │  ├─ event/              # event listeners
│     │  ├─ permission/         # ManageShoutboxPermission
│     │  └─ log/                # CreatedShoutLog
│     └─ resources/
│        ├─ config.conf         # default config
│        ├─ logo.png            # addon icon shown in the panel
│        ├─ locales/            # en-US.json, tr.json, ru.json
│        └─ plugin-ui/          # built UI — zipped into plugin-ui.zip at build time
```

Two rules to read this by:

- Everything under `src/main/kotlin` and `src/main/resources` is the **backend jar contents**. It is compiled and packaged into the jar as-is.
- Everything under `src/` but *outside* `src/main/` (`main.js`, `panel/`, `theme/`) is the **UI source**. The build compiles it into `src/main/resources/plugin-ui/`, which is then zipped and shipped inside the same jar.

::: tip Every folder here is optional except the entry class
`config/`, `db/`, `event/`, `permission/`, `log/` are just where the convention puts things — Pano finds your classes by their annotations, not by their folder (more on that next). A config-only addon like `pano-plugin-cookies` has almost none of these; a CRUD addon like `pano-plugin-announcement` has all of them.
:::

## What happens when the backend loads

Pano has **no `plugin.yml`**. All the metadata — id, main class, required Pano version — lives in the jar's `MANIFEST.MF`, written for you from `gradle.properties` at build time. See [Manifest Configuration](/addon/manifest/) for exactly which key maps to which attribute.

When Pano loads your jar, PF4J finds the main class named in the manifest, instantiates it, and calls your lifecycle hooks **in order**:

```text
jar load → onCreate() → onEnable() → onStart() → … running … → onStop() → onDisable() → onUninstall()
```

- All hooks are `suspend` functions and all default to **no-op** — you only override the ones you need.
- `onStart()` is where most addons do their setup (initialize the database, load config). The [Backend Development](/addon/backend/) tutorial walks through the canonical pattern.
- `onUninstall()` is called only when the site owner **deletes** the addon in the panel — not when they merely disable it. This is where `pano-plugin-shoutbox` would drop its `shout` table.

### Your beans are found automatically

The moment your addon loads, Pano gives it its **own Spring application context** and component-scans **only your package subtree** (`com.panomc.plugins.shoutbox` and below). Any class carrying one of these annotations is instantiated for you, with its constructor dependencies injected:

| Annotation | What it registers |
|---|---|
| `@Endpoint` | an HTTP route — goes live the instant the addon loads |
| `@Dao` | a database access object for one of your tables |
| `@Migration` | a schema or config migration |
| `@EventListener` | a listener for platform events (setup finished, player deleted, …) |
| `@PermissionDefinition` | a permission node the panel can grant |

You never call a "register this endpoint" method — annotating the class is the registration. Routes declared by `@Endpoint` classes come up when the addon loads and are removed again when it unloads, so enabling and disabling an addon cleanly adds and removes its API.

::: tip Two Spring contexts, and which beans you can inject
Your addon lives in `pluginBeanContext` — *your* beans (your DAOs, endpoints, listeners). Pano's own services live in the separate host `applicationContext`: `DatabaseManager`, `AuthProvider`, `SetupManager`, `PluginDatabaseManager`, and more.

Host beans are **not** injectable into your constructors — the scanner only sees your package. To reach a host service, fetch it explicitly:

```kotlin
private val setupManager by lazy {
    applicationContext.getBean(SetupManager::class.java)
}
```

You reach every host bean this way — `applicationContext.getBean(...)` with the bean's type.
:::

## What happens when the UI loads

The UI never ships as loose files. When you run a release build, the compiled `plugin-ui/{client,server}` folders are zipped into a single jar resource, **`plugin-ui.zip`**. From there:

1. On load, Pano computes a **UI hash** of that zip and advertises `{ version, uiHash }` for your addon through the site-info API that the theme and panel already call.
2. The theme (browser) imports your **client** bundle with a cache-busting query — `client.mjs?v=<uiHash>` — so a new build invalidates the old cached copy. The Node process imports the **server** bundle, `server/server.mjs`, for SSR.
3. Once imported, Pano constructs your default-exported class and calls its `onLoad()`. That is the single entry point where you register everything the UI adds — hooks, pages, nav links.

The UI hash matters mainly for **released** addons: a new version ships a new zip, the hash changes, and the cache-busting query pulls the fresh bundle. During development the mechanism is different — with [Development Mode](/addon/getting-started/) on, Pano rebuilds your UI zip from disk on each request (the hash becomes a `dev-build` sentinel rather than a content hash) and the theme re-fetches that bundle every request instead of caching it. That is what makes a `bun run dev` change show up on F5. The [Frontend Development](/addon/frontend/) tutorial covers what you do inside `onLoad()`.

## The shared Svelte runtime

This is the single most important thing to understand about the UI, and it explains a rule that surprises everyone.

Your client bundle **does not contain Svelte, `svelte-i18n`, or `@panomc/sdk`.** The rollup build deliberately leaves those imports *external* — unresolved — in the shipped bundle. At runtime, the host (theme or panel) supplies an import map that resolves each of them to a stable `/runtime` shim, and every shim re-exports the **host's own** live module instance.

The result is that Pano and all its addons share **one** Svelte runtime and **one** SDK instance: the same effect scheduler, the same stores, the same contexts. If your addon bundled its own private copy of Svelte or the SDK, that copy would have its own separate state, and hydration — the browser re-attaching to the server-rendered HTML — would break.

There is a hard consequence: because compiled Svelte output is only guaranteed to work against the **exact same** Svelte version it will run on, your build's compiler version must match the host's precisely. This is why you never pin Svelte yourself — `@panomc/sdk` pins the correct version, and your `rollup.config.js` refuses to build on a mismatch.

::: warning Never add `svelte` to your `package.json`
The Svelte version comes from `@panomc/sdk`'s pin, not from you. If you declare `svelte` yourself, an override can drift from the version the Pano host serves, and the build guards against exactly that: on a version mismatch, `rollup.config.js` prints an error and **exits 1** — the build fails on purpose. Version skew breaks hydration in ways that are painful to debug, so the guard stops you before you ship. Remove any `svelte` entry and re-install.
:::

One more thing this explains: the *only* bare imports that stay external are Svelte, `svelte-i18n`, and `@panomc/sdk` (and their subpaths). Anything else you import — a third-party package like a chart library — has no host shim and **must be bundled** into your build. The [Frontend API Reference](/addon/api-reference/) lists the exact set of allowed bare specifiers.

## Where your data lives at runtime

At runtime your addon touches two very different storage locations, and it helps to keep them straight:

| Location | What it holds | Who writes it |
|---|---|---|
| `plugins/<pluginId>/` (data directory) | `config.conf`, uploaded files, anything your addon persists to disk | created automatically on first load; you write it (e.g. via `PluginConfigManager`) |
| Inside the jar (resources) | `locales/*.json`, `logo.png`, `plugin-ui.zip` | baked in at build time — **read-only** at runtime |

The data directory is named after your `pluginId` (for Shoutbox, `plugins/pano-plugin-shoutbox/`) and survives across restarts — it is where per-installation state belongs. In a **released** jar these resources are fixed the moment the jar is built. During **development**, though, Pano serves them live from your source tree: with Development Mode on it reads `locales/*.json` straight from disk and rebuilds your UI zip from disk on each request — which is exactly what makes the edit-and-refresh loop work. Kotlin code is the one thing that is never hot: it needs a rebuild and a Pano restart. (Getting Started has the full hot-vs-rebuild table.)

## Where to next

Now that you have the mental model, pick a side to build:

- **[Backend Development](/addon/backend/)** — add a table, expose an API, guard it with a permission, log an action.
- **[Frontend Development](/addon/frontend/)** — mount a component on the home page, add a panel page, call your API.
- **[Manifest Configuration](/addon/manifest/)** — the `gradle.properties` keys that become your jar's manifest.
