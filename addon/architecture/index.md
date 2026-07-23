# Architecture

You built and loaded an addon in [Getting Started](/addon/getting-started/). This page is the map. It explains what actually happened: what is inside that one jar (a jar is just a zip of compiled code and resources — you can open it with any archive tool), what Pano does when it loads it, and where every file you write ends up while the addon is running.

By the end you will be able to explain the full load lifecycle, know **why you must never add `svelte` as a dependency**, and point to where each file in the repo lives once the addon is running. Along the way, "See it for yourself" boxes give you something to unzip, open, or click, so the ideas are not just words.

## One jar, three runtimes

An addon ships as a **single jar**, but the code inside it runs in three different places. Here is the whole picture at a glance:

```text
                        ┌──────────────────────┐
                        │  your addon = 1 jar   │
                        └───────────┬──────────┘
          ┌─────────────────────────┼─────────────────────────┐
          ▼                         ▼                         ▼
     Browser                  Node (theme + panel)       JVM (Pano server)
     client bundle            server bundle              Kotlin backend
     the UI users click       renders your UI to HTML    endpoints, DB, events
```

1. **The Kotlin backend** — loaded by [PF4J](https://pf4j.org/), the plugin loader Pano uses: it finds your jar in the `plugins` folder and loads its classes into the running Pano server (the JVM). This is your endpoints, database tables, permissions, and event listeners. It runs in the same process as Pano itself.
2. **A Svelte *client* bundle** — a bundle here just means your `.svelte` files compiled into one `.mjs` file. It runs in the visitor's browser, inside **both** the panel and the active theme. This is the UI a user actually clicks.
3. **A Svelte *server* bundle** — the same UI, compiled so the theme and panel (which are Node processes) can render your components into HTML before the browser ever sees them — that is server-side rendering (SSR). The browser then "hydrates" that HTML: it re-runs the same components and attaches to the markup that is already on the page. For hydration to work, **both sides must run the exact same Svelte** — hold on to that, it is the reason for the big rule near the end of this page.

The important part: there is **one** UI entry file, `src/main.js`, and it serves the panel *and* the theme. You do not write two UIs — you write one and branch on where it is running.

This is a method of the class you default-export from `src/main.js` (the same class you saw in Getting Started). Pano calls it for you when the UI loads — see [What happens when the UI loads](#what-happens-when-the-ui-loads) below — and passes it a `pano` object with an `isPanel` flag:

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

So the jar carries a backend that runs in Pano's JVM and a UI that runs in two Node/browser contexts, all built from one folder of source files. The rest of this page follows each of those to where it lives at runtime.

## Where every file ends up

Here is the Shoutbox addon's repository, with a note on what each part becomes at runtime. The folder names are conventions, but the split between `src/` (UI) and `src/main/` (backend + resources) is fixed.

```text
pano-plugin-shoutbox/
├─ build.gradle.kts             # Gradle build
├─ gradle.properties            # the addon's metadata (explained below)
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
│     │  │  ├─ dao/             # ShoutDao (abstract): one class per table, declares its queries
│     │  │  ├─ impl/            # ShoutDaoImpl — carries the @Dao annotation, runs the dao's queries
│     │  │  ├─ model/           # Shout entity
│     │  │  └─ migration/       # DatabaseMigration classes (see note under the tree)
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
│        └─ plugin-ui/          # generated by the build — never edit by hand (gitignored)
```

Two of the folder names above deserve a plain-word note:

- The split between `dao/` and `impl/`: the `dao/` class is **abstract** and only *declares* each database query; the matching `impl/` class is the concrete one — it is the class that carries the `@Dao` annotation and holds the code that actually *runs* the queries.
- `migration/` — a migration is a small class that upgrades an existing install's tables or config when a new version of your addon changes their shape (for example, adding a column). It runs once, only on installs that are behind.

Two rules to read the rest of the tree by:

- Everything under `src/main/kotlin` and `src/main/resources` is the **backend jar contents**. Kotlin is compiled to classes; resources (config, images, locales) are copied unchanged; both go into the jar.
- Everything under `src/` but *outside* `src/main/` (`main.js`, `panel/`, `theme/`) is the **UI source**. When you build, the compiler turns it into files that land inside your backend resources:

| UI source (you write) | Compiled output (the build writes) |
|---|---|
| `src/main.js`, `src/panel/`, `src/theme/` | `src/main/resources/plugin-ui/` |

Yes — the build writes its output *back into your source tree*, inside `src/main/resources/`. That is intended: putting the compiled UI under `resources/` is exactly what gets it zipped and shipped inside the same jar. (It is also why `plugin-ui/` is gitignored — it is regenerated on every build, so there is nothing to commit.)

::: tip Every folder here is optional except the entry class
`config/`, `db/`, `event/`, `permission/`, `log/` are just where the convention puts things. Pano finds your classes by their **annotations** — an annotation is the `@Something` tag written above a class, and Pano scans your compiled classes for these tags — not by their folder (more on that next). A config-only addon like `pano-plugin-cookies` has almost none of these folders; a full CRUD addon (create/read/update/delete — i.e. it has database tables *and* endpoints) like `pano-plugin-announcement` has all of them.
:::

::: tip See it for yourself
Copy your built `*.jar` and rename the copy to `*.zip`, then open it (a jar is just a zip). Inside you should find `plugin-ui.zip` sitting next to your `locales/` folder and `logo.png` — that single `plugin-ui.zip` is your whole compiled UI, packed in.
:::

## What happens when the backend loads

If you have written Minecraft plugins before, note there is **no `plugin.yml`** here. Either way, all the metadata — id, main class, required Pano version — lives in the jar's `MANIFEST.MF` (a small text file inside every jar that describes it), written for you from `gradle.properties` at build time. See [Manifest Configuration](/addon/manifest/) for exactly which key maps to which attribute.

::: tip See it for yourself
Open your built jar as a zip again and read `META-INF/MANIFEST.MF` in a text editor — you should see your addon's id and main class listed inside it.
:::

When Pano loads your jar, PF4J finds the main class named in the manifest, instantiates it, and calls your lifecycle hooks **in order**:

```text
jar load → onCreate() → onEnable() → onStart() → … running … → onStop() → onDisable() → onUninstall()
```

- All hooks are `suspend` functions (`suspend` is Kotlin's async marker — in practice it means you can call Pano's database and network functions directly inside these hooks) and all do nothing by default — you only override the ones you need.
- `onStart()` is where most addons do their setup (initialize the database, load config). The [Backend Development](/addon/backend/) tutorial walks through the canonical pattern.
- `onUninstall()` is called only when the site owner **deletes** the addon in the panel — not when they merely disable it. This is where `pano-plugin-shoutbox` would delete its `shout` table from the database.

::: tip See it for yourself
Put a `logger.info(...)` line inside `onStart()`, rebuild, and reload the addon — the line appears in Pano's console. That is the simplest way to watch the lifecycle actually fire.
:::

### Your classes are found automatically

When your addon loads, Pano walks through every class in your package — `com.panomc.plugins.shoutbox` and everything below it. Any class carrying one of the tags in the table below (the `@Something` annotations) is created for you automatically; you never construct these yourself.

More than that, Pano fills in what each class needs. If your endpoint needs `ShoutDao` to read the database, you just list `ShoutDao` as a constructor parameter, and Pano passes a ready-made instance in — you never write `ShoutDaoImpl()` yourself. Handing a class the things it depends on, instead of making it build them, is called **dependency injection**.

| Annotation | What it registers |
|---|---|
| `@Endpoint` | an HTTP route — goes live the instant the addon loads |
| `@Dao` | a database access object for one of your tables — goes on the concrete *impl* class, not the abstract DAO |
| `@Migration` | runs once per install to bring an old database or config up to your new version |
| `@EventListener` | a listener for platform events (setup finished, player deleted, …) |
| `@PermissionDefinition` | a permission node the panel can grant |

You never call a "register this endpoint" method — annotating the class *is* the registration. Routes declared by `@Endpoint` classes come up when the addon loads and are removed again when it unloads, so enabling and disabling an addon cleanly adds and removes its API.

The framework doing all of this is **Spring**. Each addon gets its own Spring *application context* (an isolated container that holds the objects Spring created), and Spring *component-scans* your package — that scan is the "walk every class" step above. Spring's word for an object it creates and manages is a **bean**, so "your beans are found automatically" is just a fancy way of saying "your annotated classes are created for you."

::: tip Reaching Pano's own services
**Short version:** your own classes show up in constructors automatically; to use one of Pano's built-in services, you fetch it with the one line below. Those services include `DatabaseManager`, `AuthProvider`, `SetupManager`, `PluginDatabaseManager`, and more — you reach for them when your code needs something Pano itself owns (for example, asking `SetupManager` whether first-time setup is finished).

Two things about the line below: `applicationContext` is inherited from `PanoPlugin` (your entry class extends it), and `by lazy` means the bean is fetched the first time you actually use `setupManager`, not at startup. (`SetupManager::class.java` is just Kotlin's way of naming the type you want.)

```kotlin
private val setupManager by lazy {
    applicationContext.getBean(SetupManager::class.java)
}
```

You reach every host service this way — `applicationContext.getBean(...)` with the service's type.

**Advanced, if you are wondering why the fetch is needed:** your addon's beans live in a context called `pluginBeanContext`, while Pano's services live in a *separate* host context (`applicationContext`). The component scan only sees your package, so host services are **not** injectable into your constructors — you have to ask for them explicitly, as above.
:::

## What happens when the UI loads

The UI never ships as loose files. When you run a release build, the compiled `plugin-ui/{client,server}` folders are zipped into a single jar resource, **`plugin-ui.zip`**. From there:

1. On load, Pano computes a **UI hash** of that zip and advertises `{ version, uiHash }` for your addon through the site-info API (`/api/siteInfo`) that the theme and panel already call.
2. The theme (browser) imports your **client** bundle with a cache-busting query — `client.mjs?v=<uiHash>` — so a new build invalidates the old cached copy. The Node process imports the **server** bundle, `server/server.mjs`, for SSR.
3. Once imported, Pano constructs your default-exported class and calls its `onLoad()` — the same `onLoad()` from the top of this page. That is the single entry point where you register everything the UI adds: hooks, pages, nav links.

::: tip See it for yourself
Open your browser's dev tools, go to the **Network** tab, and load a page that uses your addon. Find the request for `client.mjs?v=<hash>` — that `<hash>` is the UI hash Pano just handed the browser.
:::

The UI hash matters mainly for **released** addons, and it behaves differently in development:

- **Released:** a new version ships a new zip, so the hash changes, and the cache-busting query pulls the fresh bundle.
- **Development mode:** with [Development Mode](/addon/getting-started/) on, Pano rebuilds your UI zip from disk on every request. The hash is not a real content hash then — it is a fixed placeholder value, `dev-build` — and the theme re-fetches the bundle every request instead of caching it. That is what makes a `bun run dev` change show up on F5.

The [Frontend Development](/addon/frontend/) tutorial covers what you do inside `onLoad()`.

## The shared Svelte runtime

This is the single most important thing to understand about the UI, and it explains a rule that surprises everyone.

Your client bundle **does not contain Svelte, `svelte-i18n`, or `@panomc/sdk`.** The rollup build deliberately leaves those imports *external*: the built file still literally says `import ... from 'svelte'`, and nothing was copied in — so something at runtime has to answer that import.

That something is the host (the theme or panel). It supplies an **import map** — a small piece of JSON the browser reads to learn where a bare name like `'svelte'` should actually load from — and that map points each of those imports at a `/runtime/...` URL. Each `/runtime` URL simply re-exports the host's own live copy of the module.

The result is that Pano and all its addons share **one** Svelte runtime and **one** SDK instance. In practice that means your components and the theme's components share state and re-render together, as if they had always been one app. If your addon bundled its own private copy of Svelte or the SDK, that copy would have its own separate state, and hydration (from the top of this page — the browser re-attaching to the server-rendered HTML) would break.

::: tip See it for yourself
Open any theme page and use **View Source** (the raw HTML, before JavaScript runs). If your addon renders something on that page, you will see its markup already sitting there in the HTML — that is the server-rendered output the browser is about to hydrate.
:::

There is a hard consequence: because compiled Svelte output is only guaranteed to work against the **exact same** Svelte version it will run on, your build's compiler version must match the host's precisely. This is why you never pin Svelte yourself — `@panomc/sdk` pins the correct version, and your `rollup.config.js` refuses to build on a mismatch.

::: warning Never add `svelte` to your `package.json`
The Svelte version comes from `@panomc/sdk`'s pin, not from you. If you list `svelte` yourself, bun may install a different version than the one `@panomc/sdk` pinned, and the build guards against exactly that: on a version mismatch, `rollup.config.js` prints an error and the build fails (exit code 1) — on purpose. Version skew breaks hydration in ways that are painful to debug, so the guard stops you before you ship. Remove any `svelte` entry and re-install.
:::

One more thing this explains: the *only* bare imports that stay external are Svelte, `svelte-i18n`, and `@panomc/sdk` (and their subpaths). A "bare" import is one written by package name — `import x from 'chart.js'` — as opposed to a path like `./file.js`. Anything else you import — a third-party package like a chart library — has no host shim, so it **must be bundled** into your build. That part is automatic: just `bun add` it and import it, and the build copies it in on its own — only those three shared names are special. The [Frontend API Reference](/addon/api-reference/) lists the exact set of allowed bare specifiers.

## Where your data lives at runtime

At runtime your addon touches two very different storage locations, and it helps to keep them straight:

| Location | What it holds | Who writes it |
|---|---|---|
| `plugins/<pluginId>/` (data directory) | `config.conf`, uploaded files, anything your addon persists to disk | created automatically on first load; you write it (e.g. via `PluginConfigManager`, shown in Backend Development) |
| Inside the jar (resources) | `locales/*.json`, `logo.png`, `plugin-ui.zip` | baked in at build time — **read-only** at runtime |

The data directory is named after your `pluginId` (for Shoutbox, `plugins/pano-plugin-shoutbox/`) and survives across restarts — it is where per-installation state belongs. In a **released** jar these resources are fixed the moment the jar is built. During **development**, though, Pano serves them live from your source tree: with Development Mode on it reads `locales/*.json` straight from disk and rebuilds your UI zip from disk on each request — which is exactly what makes the edit-and-refresh loop work. Kotlin code is the one thing that is never hot-reloaded — Kotlin changes need a rebuild and a Pano restart. (Getting Started has the full hot-vs-rebuild table.)

## Where to next

Now that you have the mental model, pick a side to build:

- **[Backend Development](/addon/backend/)** — add a table, expose an API, guard it with a permission, log an action.
- **[Frontend Development](/addon/frontend/)** — mount a component on the home page, add a panel page, call your API.
- **[Manifest Configuration](/addon/manifest/)** — the `gradle.properties` keys that become your jar's manifest.

Want to read real addon code? The two examples referenced above are `pano-plugin-cookies` (config-only, almost no backend folders) and `pano-plugin-announcement` (a full CRUD addon that uses all of them).
