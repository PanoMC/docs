# Setup

Time to build our workshop. By the end of this page, Shoutbox will be a real folder inside your Pano install, built into a jar, and listed in **Panel → Addons** — with a fast edit-and-refresh loop ready for the rest of this handbook.

Full reference for this page: [Getting Started](/addon/getting-started/).

## Step 0 — make sure Pano is running (with Development Mode on)

An addon lives *inside* a running Pano while you work. So before anything else, make sure your Pano is installed and running **on your development machine**. If it isn't, follow [Installation](/platform/installation/) first and come back.

For this handbook we'll assume you started Pano in **development mode**, which listens on port **8088**:

```sh
# in your Pano folder
java -jar Pano-v1.0.0.jar --dev
```

(Without `--dev`, the default port is **80**.) Keep this running in its own terminal.

Now turn on **Development Mode** — this is what makes your UI and locale files reload live from disk instead of being cached:

**Panel → Platform Settings → Development Mode → On**, then save.

::: tip Checkpoint
You can open your Pano site at `http://localhost:8088`, log into **/panel**, and Development Mode shows as **On**.
:::

## Step 1 — clone the template into `plugins/`

Pano ships a ready-made template, [`pano-boilerplate-plugin`](https://github.com/PanoMC/pano-boilerplate-plugin), with the backend and UI already wired together. Clone it **into your Pano install's `plugins/` folder** — the same folder that holds the Pano jar and its config. This matters: an addon only hot-reloads its UI when it lives inside the running install's `plugins/` folder.

The last argument (`pano-plugin-shoutbox`) is the folder name — and it must **exactly** match the `pluginId` you set in the next step, because Pano pairs the folder with the id.

```sh
cd <your-pano-instance>/plugins
git clone https://github.com/PanoMC/pano-boilerplate-plugin.git pano-plugin-shoutbox
cd pano-plugin-shoutbox
```

## Step 2 — rename the template to Shoutbox

The template calls itself `pano-boilerplate-plugin` in several places. Change each one. Steps 1–3 all describe the **same class** in three places, so they must agree with each other.

| # | Where | Change |
|---|---|---|
| 1 | `gradle.properties` | `pluginId` → `pano-plugin-shoutbox`; `pluginName` → `Shoutbox`; `pluginClass` → `com.panomc.plugins.shoutbox.ShoutboxPlugin`; plus `pluginDescription`, `pluginDeveloper`, `pluginLicense`, `pluginSourceUrl`, `organization` → your own values. |
| 2 | Kotlin package folder | Rename `src/main/kotlin/com/panomc/plugins/boilerplate` → `.../shoutbox`, then set the `package` line inside the `.kt` file to `package com.panomc.plugins.shoutbox`. |
| 3 | Kotlin main class | Rename the class `BoilerplatePlugin` → `ShoutboxPlugin`. It must match the end of `pluginClass` in step 1. |
| 4 | `src/main.js` | The `pluginId` constant `'pano-boilerplate-plugin'` → `'pano-plugin-shoutbox'`; the class name `PanoExamplePlugin` → `ShoutboxUiPlugin`. |
| 5 | `package.json` | `"name"` → `pano-plugin-shoutbox`. |
| 6 | `settings.gradle.kts` | Add the line `rootProject.name = "pano-plugin-shoutbox"`. |

::: tip Let IntelliJ do the class rename
`pluginClass` is a **fully-qualified name**: the package (the folder path with slashes turned into dots) plus the class name. In IntelliJ, right-click the class name → **Refactor → Rename** and it renames the file and updates every reference for you. The full rename walkthrough — with the exact failure messages if two edits disagree — is in [Getting Started](/addon/getting-started/#rename-the-template-to-your-addon).
:::

Two more things are **content, not wiring** — change them now or any time later:

- `src/main/resources/locales/en-US.json` — your UI text (the template ships one key, `hello-world`).
- `src/main/resources/logo.png` — replace with your own logo.

## Step 3 — first build

From your addon folder, install the UI dependencies and build once:

```sh
bun install
./gradlew build
```

::: warning The first build is slow — don't cancel it
The first build downloads Gradle, the internal Java toolchain, and all dependencies. It can sit for several minutes looking frozen. That's normal.
:::

It finishes with `BUILD SUCCESSFUL` and produces a jar at `build/libs/pano-plugin-shoutbox-local-build.jar`.

::: tip If `bun install` seems stuck on "Resolving…"
Stop it with `Ctrl + C` and run `bun install --backend=copyfile` instead.
:::

## Step 4 — copy the jar up a level and restart

Pano only discovers jars sitting **directly** in the install's `plugins/` folder — not the nested `build/libs/` inside your clone. So copy the freshly built jar up one level:

```sh
cp build/libs/pano-plugin-shoutbox-local-build.jar ..   # into the instance's plugins/ folder
```

Now **restart Pano**: press `Ctrl + C` in the terminal where it's running, then start it again exactly as before. New jars are picked up only at boot.

::: tip The clone and the jar are two separate things
Two copies of your addon now live side by side in `plugins/`:

```
plugins/
├── pano-plugin-shoutbox/                    ← your clone (source: UI + locales)
└── pano-plugin-shoutbox-local-build.jar     ← the built jar Pano loads
```

The **jar** is the backend Pano runs; the **folder** feeds live UI and locale reloads while Development Mode is on. Both coexist happily.
:::

## Step 5 — see it in the panel

Open **Panel → Addons**. **Shoutbox** should be listed. That's the "did it load?" check.

::: warning Addon not listed?
Three usual causes: the jar isn't sitting **directly** in `plugins/` (still in `build/libs/`); you didn't restart Pano; or `pluginClass` doesn't match your package + class name. Check the server log for a plugin-load error.
:::

**You should now see** Shoutbox in the addon list. The backend half loaded correctly — you're ready to iterate.

## Step 6 — the dev loop

You almost never run the full `./gradlew build` while developing — it rebuilds the UI every time, which is slow. Instead, use one command per half, both from your addon folder.

For **backend (Kotlin) work**, build a fast backend-only jar that skips the UI (`-Pnoui` means "skip the UI build"):

```sh
./gradlew build -Pnoui
```

For **UI (Svelte) work**, start the watcher and leave it running — it rebuilds the UI on every save:

```sh
bun run dev
```

Here is exactly what each kind of change needs:

| You changed | To see it |
|---|---|
| Svelte UI (`src/main.js`, `src/panel/**`, `src/theme/**`) | `bun run dev` running + browser refresh (F5) |
| `locales/*.json` | With Development Mode on, browser refresh (F5) |
| Kotlin code | `./gradlew build -Pnoui`, copy the jar into `plugins/`, then **restart Pano** |
| `gradle.properties`, `config.conf` | Full `./gradlew build`, copy the jar into `plugins/`, then restart |

::: warning Kotlin changes need a rebuild *and* a restart
Kotlin is **not** hot. Disabling and re-enabling the addon in the panel does **not** pick up new code — the server keeps the old code in memory until a full restart loads the new jar. UI and locales *are* hot under Development Mode; Kotlin never is. Keep this split in mind and the rest of this handbook will feel fast.
:::

Shoutbox is alive and loaded, and you know which changes are hot and which are not. Now let's give it a memory and an API.

**Next: [Backend →](/handbook/addon/backend/)**
