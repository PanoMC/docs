# Getting Started

This page takes you from nothing to your own **addon** loaded and listed in **Panel → Addons**, with a fast edit-and-refresh loop you'll use for the rest of these tutorials. You don't need prior Pano experience — just a little Kotlin and JavaScript.

A Pano **addon** adds features to a Pano site: new pages in the *panel* (the admin dashboard at `/panel`), new sections on the *theme* (the public site your visitors see), and new APIs on the backend (the Pano server itself) — all in one installable file. You build it from a ready-made template and drop it into a running Pano.

::: tip Addon and plugin are the same thing
Addons are Pano *plugins* — the code-level APIs, folder names, and classes all use the word `plugin` (e.g. `PanoPlugin`, `pluginId`). This page (and the rest of these docs) says **addon** in the prose, but you will keep seeing `plugin` in the code. That is expected; nothing is renamed.
:::

An addon is a single **JAR file** (a JAR is a zip of compiled Kotlin/Java code plus resources) that contains two halves that work together:

- a **Kotlin backend** that runs inside the Pano server. Pano loads it through a library called PF4J — PF4J is just the plumbing Pano uses to load addon jars, and you never interact with it directly. The backend can add database tables, JSON APIs, permissions, and more — you'll build each of these step by step in [Backend Development](/addon/backend/).
- a **Svelte UI** that runs in the browser. Here's the part that surprises people at first: your one UI gets injected into whichever site the visitor is on — the admin *panel* or the public *theme* (the "theme" is whichever front-end design the site owner has activated).

You don't have to use both halves — a UI-only addon or a backend-only addon is fine — but the template ships with both wired up. Finish this page first; then [Architecture](/addon/architecture/) explains the internals afterwards, showing exactly where each piece runs. If you just want to *install* addons rather than build them, see the user-facing [Addons](/platform/addons/) page.

Our running example across these tutorials is a small addon called **Shoutbox** — visitors see the latest "shouts" on the home page, admins manage them from the panel — so we'll name our project `pano-plugin-shoutbox` from the start.

## Before you start: get Pano running locally

Everything on this page assumes you already have Pano running **on the same machine you'll write code on**. Your addon lives *inside* that Pano install while you work — you drop it into the install's `plugins/` folder — so for addon development, run Pano locally on your development machine, not on a remote server or VPS.

If you don't have a local Pano yet, do the [Installation](/platform/installation/) guide first, then come back.

::: tip Checkpoint
You can open your Pano site in a browser (the address you chose during setup, e.g. `http://localhost:<port>`) and log into **/panel**.
:::

### Turn on Development Mode

Development Mode makes your UI and locale files load **live from disk** instead of being cached — this is what gives you the fast refresh loop later on. Turn it on in the panel:

**Panel → Platform Settings → Development Mode → On**, then save.

After saving, the setting shows as **On**. That's all you need to do.

::: tip
Under the hood this is the `development-mode` config key, but you never have to touch the config file by hand — the panel toggle is the whole job.
:::

## What you need

Four things on your development machine. Verify each with the command shown — if a command is "not found", install that tool first.

1. **A JDK, version 11 or newer.** Install any Java 11+ (a JDK, not just a JRE). The build automatically fetches and uses the exact internal Java version it needs (Java 11) — you never manage that yourself, so any JDK that can run Gradle is enough.
   - Verify: run `java -version`. Any version number **11 or higher** means you're fine. "Command not found" means you need to install a JDK.
2. **Bun** — the tool that installs and builds the UI. Install it from [bun.sh](https://bun.sh). You need it for the dev watcher (`bun run dev`). (Release builds fetch their own copy of Bun; ignore that for now.)
   - Verify: run `bun --version`.
3. **Git** — used to download the template in the next step.
   - Verify: run `git --version`.
4. **A code editor.** Any editor works, but for Kotlin a full IDE saves a lot of pain — [IntelliJ IDEA Community Edition](https://www.jetbrains.com/idea/download/) is free, and the template already includes IntelliJ project files.

::: tip Windows users
These docs assume a Unix-like shell (macOS, Linux, WSL, or Git Bash). In `cmd` or PowerShell, run `gradlew.bat` (or `.\gradlew`) wherever you see `./gradlew`.
:::

## Create your addon from the template

Pano ships a ready-made template, [`pano-boilerplate-plugin`](https://github.com/PanoMC/pano-boilerplate-plugin), with the backend and UI already wired together. You clone it, then rename everything to your own addon.

Clone it **into your Pano install's `plugins/` directory** — that's the folder where you completed setup, the one that contains the Pano jar, its config, and a `plugins/` subfolder. This matters: an addon only hot-reloads its UI when it lives inside the running install's `plugins/` folder.

The last argument on the `git clone` line below (`pano-plugin-shoutbox`) is the folder name git creates for your clone — and it must **exactly** match the `pluginId` you'll set in the next section, because Pano pairs the folder with the id.

```bash
cd <your-pano-instance>/plugins
git clone https://github.com/PanoMC/pano-boilerplate-plugin.git pano-plugin-shoutbox
cd pano-plugin-shoutbox
```

## Rename the template to your addon

The template calls itself `pano-boilerplate-plugin` in several places. You'll change each one to your addon's name. Most of them live in `gradle.properties` — think of that file as your addon's **manifest**: its metadata file (id, name, version, main class, and so on).

::: tip Optional: prove your environment before you rename
If you'd like to be sure your Java and Bun setup works before touching anything, build the **untouched** template once now — from your addon folder run `bun install`, then `./gradlew build`. A `BUILD SUCCESSFUL` here means any failure *after* renaming is a rename mistake, not a broken environment. (This first build downloads a lot and can take several minutes — that's normal; don't cancel it.)
:::

Make these edits in order. Steps 1–3 all describe the same class in three places, so they must agree with each other:

1. **`gradle.properties`** — set these keys:
   - `pluginId` → `pano-plugin-shoutbox`
   - `pluginName` → `Shoutbox`
   - `pluginClass` → `com.panomc.plugins.shoutbox.ShoutboxPlugin`
   - `pluginDescription`, `pluginDeveloper`, `pluginLicense`, `pluginSourceUrl`, `organization` → your own values

   `pluginClass` is a **fully-qualified class name**: the package name plus the class name. The package mirrors the folder path under `src/main/kotlin`, with the slashes turned into dots. So this value, the folder in step 2, and the class name in step 3 must all spell out the same thing.

2. **Rename the Kotlin package folder.** Rename the folder `src/main/kotlin/com/panomc/plugins/boilerplate` → `src/main/kotlin/com/panomc/plugins/shoutbox`. Then open the only `.kt` file in that folder, `BoilerplatePlugin.kt`, and change its first line — the `package` line — to match: `package com.panomc.plugins.shoutbox`.

3. **Rename the Kotlin main class.** In that same file, rename the class `BoilerplatePlugin` → `ShoutboxPlugin`. It must match the class name at the end of `pluginClass` in step 1. (In IntelliJ, right-click the class name → Refactor → Rename does this and updates the file name and every reference for you.)

4. **`src/main.js`** — change two things:
   - the `pluginId` constant `'pano-boilerplate-plugin'` → `'pano-plugin-shoutbox'`
   - the class name in the line `export default class PanoExamplePlugin …` → your own name (e.g. `ShoutboxUiPlugin`)

5. **`package.json`** — set `"name"` → `pano-plugin-shoutbox`.

6. **`settings.gradle.kts`** — the template doesn't set the project's name here, so add this line:

   `rootProject.name = "pano-plugin-shoutbox"`

   Without it, Gradle names the project after the folder instead. Set it explicitly so your built jar always carries the right name and matches your addon's identity, even if the folder is ever named something else.

That's everything **required**. Two more things are content, not wiring — change them now or any time later:

- **`src/main/resources/locales/en-US.json`** — your UI text strings. The template ships one key, `hello-world`.
- **`src/main/resources/logo.png`** — replace with your own logo.

::: tip Pick your `pluginId` once and never change it
The `pluginId` you set in `gradle.properties` isn't just a label — Pano bakes it into many places behind the scenes, so pick it once and keep it stable. The [Manifest Configuration](/addon/manifest/) page lists exactly where it's used.
:::

Now build and load it (next section) — a successful build confirms your six renames line up.

## Build and load your addon

From your addon folder (`plugins/pano-plugin-shoutbox/`), install the UI dependencies and build once:

```bash
# in plugins/pano-plugin-shoutbox/ (your addon folder)
bun install
./gradlew build
```

The **first** build downloads Gradle itself, the internal Java toolchain, and all dependencies — it can sit for several minutes looking frozen. That's normal; don't cancel it. It finishes with `BUILD SUCCESSFUL` and produces a jar under `build/libs/` (named `pano-plugin-shoutbox-local-build.jar`).

::: tip Checkpoint
`BUILD SUCCESSFUL` means your renames line up. If the build **fails**, two edits disagree — the most common causes:

- **`ClassNotFoundException` / "plugin class not found"** → `pluginClass` (step 1) doesn't match your package + class name (steps 2–3). All three must spell the same `com.panomc.plugins.shoutbox.ShoutboxPlugin`.
- **An unresolved-reference / package compile error** → the `package` line inside the `.kt` file (step 2) doesn't match the folder you renamed.
:::

Pano only discovers jars sitting **directly** in the install's `plugins/` folder — it does *not* scan the nested `build/libs/` folder inside your clone — so, from your addon folder, copy the freshly built jar up one level:

```bash
cp build/libs/pano-plugin-shoutbox-local-build.jar ..   # into the instance's plugins/ folder
```

Now **restart Pano**: stop the running process (press Ctrl+C in the terminal where Pano is running) and start it again exactly the way you did during installation. Then open **Panel → Addons** — your addon should be listed. That's the "did it load?" check. (New jars are picked up only at boot; the panel's addon actions are enable / disable / delete / upload, not a rescan.) If it shows up, the backend half loaded correctly and you're ready to iterate.

::: tip Addon not listed?
If it doesn't show up: is the jar sitting **directly** in `plugins/` (not still in `build/libs/`)? Check the server log for a plugin-load error, and re-check that `pluginClass` matches your package + class name.
:::

::: tip The clone and the loadable jar are two separate things
Two copies of your addon now live side by side in `plugins/`:

```
plugins/
├── pano-plugin-shoutbox/                       ← your clone (source)
│   └── src/…, locales/…, plugin-ui/…
└── pano-plugin-shoutbox-local-build.jar        ← the built jar Pano loads
```

- **The jar** is the backend code Pano actually runs.
- **The folder** (its name matches your `pluginId`) is what Pano reads for live UI and locale files while Development Mode is on.

Both coexist happily — the jar runs your backend, the folder feeds live UI and locale reloads.
:::

## The dev loop

This is the most important part of the page. You almost never want to run the full `./gradlew build` while developing — it rebuilds the UI every time, which is slow. Instead, use **two commands**, one for each half of the addon. Run both from your addon folder, `plugins/pano-plugin-shoutbox/`.

For **backend (Kotlin) work**, build a fast backend-only JAR that skips the UI. (`-P` passes a flag into the Gradle build; here `noui` means "skip the UI build".)

```bash
./gradlew build -Pnoui   # fast backend-only jar, skips the UI build
```

For **UI (Svelte) work**, start the watcher and leave it running. It watches your UI source files and rebuilds the output into `src/main/resources/plugin-ui/` every time you save. (The `rollup watch` note in the comment just names the tool doing the work — you don't run it directly.)

```bash
bun run dev              # rollup watch → src/main/resources/plugin-ui/{client,server}
```

As long as Development Mode is on and the addon lives in the install's `plugins/` folder, refreshing any page of your Pano site — the same address you used during setup, e.g. `http://localhost:<port>` — picks up the new UI build immediately, with no JAR rebuild.

Not every change is that fast, though. Here is exactly what each kind of change needs:

| You changed | To see it |
|---|---|
| Svelte UI (`src/main.js`, `src/panel/**`, `src/theme/**`) | `bun run dev` running + browser refresh (F5) |
| `locales/*.json` | With Development Mode on, browser refresh (F5) — locales are read live from your source tree |
| Kotlin code | `./gradlew build -Pnoui`, copy the new jar into `plugins/`, then **restart Pano** |
| `gradle.properties`, source `config.conf` | Full `./gradlew build`, copy the jar into `plugins/`, then restart Pano |

(`config.conf` is the addon's default config template at `src/main/resources/config.conf` — you'll meet it in [Backend Development](/addon/backend/).)

::: warning Kotlin changes need a rebuild *and* a restart
Kotlin code is **not** hot. After editing a `.kt` file: rebuild (`./gradlew build -Pnoui` is enough for backend-only code), copy the new jar into your install's `plugins/` folder, and **restart Pano**. Disabling and re-enabling the addon in the panel does **not** pick up your new code — the server keeps your old code in memory until a full restart loads the new jar. Changes to `gradle.properties` or the source `config.conf` need a full `./gradlew build` the same way.
:::

## Your first change in 2 minutes

Let's make one change of each kind, so the hot-versus-rebuild split really lands.

**A UI change (hot — F5 is enough).** Open `src/main.js`. Inside `onLoad()` you'll add one `console.log` line. The `const pano = this.pano;` line and the surrounding code are **already in the file** — don't retype them, and the `// ...` below just stands in for the code that's already there. Add only your log line:

```js
onLoad() {
  const pano = this.pano;
  console.log('Shoutbox UI loaded! isPanel =', pano.isPanel);
  // ...
}
```

Make sure `bun run dev` is running, save the file, then refresh your Pano site (`http://localhost:<port>`) and open the browser console (F12 → Console). Your message is there — no rebuild needed.

::: tip No message?
Check that `bun run dev` is still running in a terminal, that Development Mode is **On** in the panel, and that your clone is under the install's `plugins/` folder. Those are the three usual causes.
:::

**A locale change (also hot in Development Mode).** Open `src/main/resources/locales/en-US.json` and change the template's one string:

```json
{
  "hello-world": "Hello from Shoutbox!"
}
```

Save it and press F5. Because Development Mode is on and your clone lives in `plugins/<pluginId>/`, Pano reads locale files **live from your source tree** — so no rebuild is needed.

One honest caveat: the stock template *defines* the `hello-world` string but doesn't yet **display** it on any page (the panel and theme folders ship empty — you'll wire locale strings into your UI in [Frontend Development](/addon/frontend/)). So there's nothing on screen to watch change here *yet*. The point to take away is the **rule**: once your UI does show a locale string, editing the JSON and pressing F5 is all it takes — and the `console.log` check above already proved this live-reload works.

**A Kotlin change (needs a rebuild + restart).** This is the one that's *not* hot. Open the file with your `ShoutboxPlugin` class and change the message in the `logger.info("Starting...")` line that's already inside `onStart()` — for example:

```kotlin
logger.info("Shoutbox is starting up!")
```

Then, from your addon folder, rebuild and copy the jar up one level:

```bash
# in plugins/pano-plugin-shoutbox/ (your addon folder)
./gradlew build -Pnoui
cp build/libs/pano-plugin-shoutbox-local-build.jar ..
```

Now restart Pano (Ctrl+C the running process, then start it again). As Pano boots, watch the terminal running it — your new message appears in the server console. A panel disable → enable would keep running the old code, which is exactly why the restart is required.

That is the whole loop in a nutshell: **UI and locales are live under Development Mode; Kotlin and manifest (`gradle.properties`) changes need a rebuild and a Pano restart.** Keep this split in mind and the rest of these tutorials will feel fast.

## When it doesn't work

Most first-time problems come down to five things. Check them in order:

1. **Your addon isn't listed in Panel → Addons.** Is the built jar sitting **directly** in the install's `plugins/` folder (not still under `build/libs/`)? New jars load only at boot — did you restart Pano? Check the server log for a plugin-load error, and re-check that `pluginClass` matches your package + class name.
2. **A UI or locale edit doesn't show up.** Is `bun run dev` still running? Is Development Mode **On** in the panel? Is your clone under the install's `plugins/` folder (at `plugins/<pluginId>/`)?
3. **A Kotlin edit doesn't take effect.** Kotlin isn't hot — you must rebuild (`./gradlew build -Pnoui`), copy the jar into `plugins/`, and **restart** Pano. Disable/enable in the panel is not enough.
4. **The build fails right after renaming.** Two of your rename edits disagree — see the failure causes in the [Build and load](#build-and-load-your-addon) checkpoint. Re-check that `pluginClass`, the package folder, and the class name all spell the same thing.
5. **Your dev server hangs (only relevant if you also run a theme or panel dev server).** Do **not** add a proxy rule for `/plugins` in that dev server's Vite config. The UI server already serves that path; proxying it back creates a request loop that hangs the dev server.

## Where to next

You now have your own addon loaded, and you know which changes are hot and which are not. Here is the recommended path:

- **[Architecture](/addon/architecture/)** — the mental model: what happens when Pano loads your JAR, and where every file ends up at runtime. Read this before writing real code.
- **[Backend Development](/addon/backend/)** — build the Shoutbox backend: a database table, a JSON API, a permission, and an activity log.
- **[Frontend Development](/addon/frontend/)** — build the Shoutbox UI: mount a widget on the home page, add a panel settings section and a full panel page.
- **[Building & Publishing](/addon/publishing/)** — turn your addon into a release and ship it to the marketplace.
