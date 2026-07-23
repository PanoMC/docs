# Getting Started

A Pano **addon** adds features to a Pano site: new pages in the panel, new sections on the theme, new APIs on the backend — all in one installable file. You build it from a ready-made template and drop it into a running Pano.

::: tip Addon and plugin are the same thing
Addons are Pano *plugins* — the code-level APIs, folder names, and classes all use the word `plugin` (e.g. `PanoPlugin`, `pluginId`). This page (and the rest of these docs) says **addon** in the prose, but you will keep seeing `plugin` in the code. That is expected; nothing is renamed.
:::

An addon is a single JAR file that contains two halves that work together:

- a **Kotlin backend** (a PF4J plugin) that runs inside the Pano server — it adds database tables, JSON APIs, permissions, and more;
- a **Svelte UI bundle** that runs in the browser, inside **both** the admin panel and the active theme.

You do not have to use both halves — a UI-only addon or a backend-only addon is fine — but the template ships with both wired up. To understand exactly where each piece runs, read [Architecture](/addon/architecture/) next. If you just want to *install* addons rather than build them, see the user-facing [Addons](/platform/addons/) page.

This page gets you from nothing to your own addon showing in **Panel → Addons**, with a working edit-and-refresh loop. Our running example across these tutorials is a small addon called **Shoutbox** — visitors see the latest "shouts" on the home page, admins manage them from the panel — so we will name our project `pano-plugin-shoutbox` from the start.

## What you need

| Requirement | Notes |
|---|---|
| **JDK 11 or newer** | The addon compiles against a **Java 11 toolchain**, so it runs on every server Pano supports (Pano itself only needs Java 11+). Any JDK 11 or newer can run Gradle; if yours is newer than 11, the template auto-downloads the Java 11 toolchain for you. |
| **Bun** | The UI package manager and builder. Install it from [bun.sh](https://bun.sh). Gradle auto-downloads Bun 1.2.0 for release builds, but you want it installed locally so you can run `bun run dev`. |
| **A running Pano instance, with Development Mode on** | Self-hosted, with the setup wizard already completed — your addon lives inside this instance while you work. Turn on **Development Mode** in **Panel → Platform Settings** (config key `development-mode`): it makes your UI bundle and locale files load live from disk instead of being cached. See [Installation](/platform/installation/) if you have not set one up. |

## Create your addon from the template

Pano ships a ready-made template, [`pano-boilerplate-plugin`](https://github.com/PanoMC/pano-boilerplate-plugin), with the backend and UI already wired together. You clone it, then rename everything to your own addon.

**Clone it into your Pano instance's `plugins/` directory.** This is important: an addon only hot-reloads its UI when it lives inside the running instance's `plugins/` folder.

```bash
cd <your-pano-instance>/plugins
git clone https://github.com/PanoMC/pano-boilerplate-plugin.git pano-plugin-shoutbox
cd pano-plugin-shoutbox
```

Now rename the template to your addon. The template calls itself `pano-boilerplate-plugin` in a handful of places — change each one. Here is the full checklist, with the exact values for our Shoutbox example:

| Location | What to change |
|---|---|
| `gradle.properties` | `pluginId` → `pano-plugin-shoutbox`; `pluginName` → `Shoutbox`; `pluginDescription`, `pluginDeveloper`, `pluginLicense`, `pluginSourceUrl`, `organization` → your own values; `pluginClass` → `com.panomc.plugins.shoutbox.ShoutboxPlugin` |
| Kotlin package | Rename the folder `src/main/kotlin/com/panomc/plugins/boilerplate` → `.../shoutbox`, and update the `package` line inside the file |
| Kotlin main class | `BoilerplatePlugin` → `ShoutboxPlugin` (must match `pluginClass` above) |
| `src/main.js` | The `pluginId` constant `'pano-boilerplate-plugin'` → `'pano-plugin-shoutbox'`, and the default class name `PanoExamplePlugin` → your own (e.g. `ShoutboxUiPlugin`) |
| `package.json` | `"name"` → `pano-plugin-shoutbox` |
| `settings.gradle.kts` | Add `rootProject.name = "pano-plugin-shoutbox"` — the template ships this file **empty**, so without this line the Gradle project name falls back to the folder name |
| `src/main/resources/locales/en-US.json` | Your text strings (the template has one key, `hello-world`) |
| `src/main/resources/logo.png` | Replace with your own logo |

::: tip `pluginId` is used everywhere
The `pluginId` you set in `gradle.properties` is not just a label — it becomes your data-directory name, your UI URL segment, your permission-node prefix, and your marketplace resource ID. Pick it once and keep it stable. Full details on the manifest are on the [Manifest Configuration](/addon/manifest/) page.
:::

## First build and verify

Install the UI dependencies and build the whole addon once:

```bash
bun install
./gradlew build
```

This produces a JAR under `build/libs/` (named `pano-plugin-shoutbox-local-build.jar`). Pano only discovers jars sitting **directly** in the instance's `plugins/` folder — it does *not* scan the nested `build/libs/` directory your clone lives in — so copy the freshly built jar up one level:

```bash
cp build/libs/pano-plugin-shoutbox-local-build.jar ..   # into the instance's plugins/ folder
```

Then restart Pano and open **Panel → Addons** — your addon should be listed there. That is the "did it load?" check. (New jars are only picked up at boot; the panel's addon actions are enable / disable / delete / upload, not a rescan.) If it shows up, the backend half loaded correctly and you are ready to iterate.

::: tip The clone and the loadable jar are two things
Your clone stays at `plugins/pano-plugin-shoutbox/` — that path (matching your `pluginId`) is what Pano reads for live UI and locale files during development. The **loadable** backend jar is the copy you place directly in `plugins/`. Both coexist happily.
:::

## The dev loop

This is the most important part of the page. You almost never want to run the full `./gradlew build` while developing — it rebuilds the UI every time, which is slow. Instead, use **two commands**, one for each half of the addon.

For **backend (Kotlin) work**, build a fast backend-only JAR that skips the UI:

```bash
./gradlew build -Pnoui   # fast backend-only jar, skips the UI build
```

For **UI (Svelte) work**, start the watcher and leave it running:

```bash
bun run dev              # rollup watch → src/main/resources/plugin-ui/{client,server}
```

`bun run dev` recompiles your UI into the addon's `plugin-ui` folder every time you save. As long as Development Mode is on and the addon lives in the instance's `plugins/` folder, a browser refresh picks the new build up immediately — no JAR rebuild.

Not every change is that fast, though. Here is exactly what each kind of change needs:

| You changed | To see it |
|---|---|
| Svelte UI (`src/main.js`, `src/panel/**`, `src/theme/**`) | `bun run dev` running + browser refresh (F5) |
| `locales/*.json` | With Development Mode on, browser refresh (F5) — locales are read live from your source tree |
| Kotlin code | `./gradlew build -Pnoui`, copy the new jar into `plugins/`, then **restart Pano** |
| `gradle.properties`, source `config.conf` | Full `./gradlew build`, copy the jar into `plugins/`, then restart Pano |

::: warning Kotlin changes need a rebuild *and* a restart
Kotlin code is **not** hot. After editing a `.kt` file, rebuild (`./gradlew build -Pnoui` is enough for backend-only code), copy the new jar into your instance's `plugins/` folder, and **restart Pano**. Disabling and re-enabling the addon in the panel does *not* pick up rebuilt bytecode — PF4J keeps the already-loaded classloader, so only a restart loads the new jar. Changes to `gradle.properties` or the source `config.conf` need a full `./gradlew build` the same way.
:::

::: warning Never proxy `/plugins` in a Vite/dev config
If you also run a theme or panel dev server, do **not** add a proxy rule for `/plugins` in its config. The UI server already serves that path; proxying it back creates a request loop that will hang your dev server.
:::

## Your first change in 2 minutes

Let's make one change of each kind, so the hot-versus-rebuild split really lands.

**A UI change (hot — F5 is enough).** Open `src/main.js` and add a log line inside `onLoad()`:

```js
onLoad() {
  const pano = this.pano;
  console.log('Shoutbox UI loaded! isPanel =', pano.isPanel);
  // ...
}
```

Make sure `bun run dev` is running, save the file, then refresh your Pano site and open the browser console. Your message is there — no rebuild needed.

**A locale change (also hot in Development Mode).** Open `src/main/resources/locales/en-US.json` and change the template's one string:

```json
{
  "hello-world": "Hello from Shoutbox!"
}
```

Save it and press F5. Because Development Mode is on and your clone lives in `plugins/<pluginId>/`, Pano reads locale files **live from your source tree** — so the new text appears with no rebuild, just like the UI.

**A Kotlin change (needs a rebuild + restart).** This is the one that is *not* hot. Change any `.kt` file, run `./gradlew build -Pnoui`, copy the jar into `plugins/`, and restart Pano — a panel disable → enable would keep running the old bytecode.

That is the whole loop in a nutshell: **UI and locales are live under Development Mode; Kotlin and manifest changes need a rebuild and a Pano restart.** Keep this split in mind and the rest of these tutorials will feel fast.

## Where to next

You now have your own addon loaded, and you know which changes are hot and which are not. Here is the recommended path:

- **[Architecture](/addon/architecture/)** — the mental model: what happens when Pano loads your JAR, and where every file ends up at runtime. Read this before writing real code.
- **[Backend Development](/addon/backend/)** — build the Shoutbox backend: a database table, a JSON API, a permission, and an activity log.
- **[Frontend Development](/addon/frontend/)** — build the Shoutbox UI: mount a widget on the home page, add a panel settings section and a full panel page.
- **[Building & Publishing](/addon/publishing/)** — turn your addon into a release and ship it to the marketplace.
