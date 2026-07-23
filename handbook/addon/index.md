# Build Your First Addon

Welcome to the Pano addon handbook. This is a **cookbook**: instead of explaining every feature in the abstract, we build **one real addon together**, from the ready-made template all the way to a published addon on the Marketplace.

By the end, you will have done every step yourself at least once — and you will know exactly where to look when you want to go deeper.

::: tip Reference vs. handbook
The [Addon Development](/addon/getting-started/) section is the **reference** — it explains each topic in full. This handbook is the **guided build**. When you want more depth on a step, we link straight to the matching reference page. Nothing here contradicts it; we just walk a single, concrete path through it.
:::

::: tip Addon and plugin are the same thing
Addons are Pano *plugins* — the code-level names all use the word `plugin` (`PanoPlugin`, `pluginId`, and so on). This handbook says **addon** in the prose, but you will keep seeing `plugin` in the code. That is expected; nothing is renamed.
:::

## The addon we're building: **Shoutbox**

Meet our example project. **Shoutbox** is a tiny addon that lets your community leave short messages — "shouts" — on your server's site. What it does:

- Visitors see the **latest shouts** in a small widget at the top of the home page.
- Admins **post and remove** shouts from the panel, protected by a permission.
- It carries its own text, translated for every language your server speaks.

An addon is a single **JAR file** with two halves that work together:

- a **Kotlin backend** that runs inside the Pano server — it owns the database table, the JSON API, and the permission.
- a **Svelte UI** that runs in the browser — the home-page widget and the panel management page.

Its identity, which we'll use throughout:

| Field | Value |
|---|---|
| `pluginId` | `pano-plugin-shoutbox` |
| `pluginName` | Shoutbox |
| Main class | `com.panomc.plugins.shoutbox.ShoutboxPlugin` |

::: warning The `pluginId` is forever
We picked `pano-plugin-shoutbox` as the `pluginId` on purpose, and we will **never change it** after publishing — Pano bakes it into many places behind the scenes, and it doubles as your Marketplace resource ID. More on where it's used in [Manifest Configuration](/addon/manifest/).
:::

## What you need

Everything here assumes Pano is running **on the same machine you'll write code on** — your addon lives *inside* that install while you work.

| You need | What it is |
|---|---|
| **A JDK, version 11 or newer** | Runs the Gradle build. Any Java 11+ works — the build fetches the exact internal Java it needs on its own. Verify with `java -version`. |
| **Bun** | Installs and builds the UI, and runs the dev watcher. Get it from [bun.sh](https://bun.sh). Verify with `bun --version`. |
| **Git** | Downloads the template. Verify with `git --version`. |
| **A running Pano** | Your addon talks to a live Pano while you work. If you don't have one yet, follow [Installation](/platform/installation/) first — and turn **Development Mode on** (we'll do that on the next page). |
| **A code editor** | Anything works, but for Kotlin a full IDE saves pain — [IntelliJ IDEA Community](https://www.jetbrains.com/idea/download/) is free and ships with the template's project files. |

You do **not** need to be an expert. A little Kotlin and a little Svelte help, but every step here is copy-paste-able. If you want a gentle intro, the [Svelte tutorial](https://svelte.dev/tutorial) is excellent and free.

## The roadmap

Here's the whole journey. Each step is one page, and each page ends with a link to the next.

1. **[Setup](/handbook/addon/setup/)** — install the tools, clone and rename the template, build it, and see Shoutbox listed in **Panel → Addons**.
2. **[Backend](/handbook/addon/backend/)** — give Shoutbox a memory and an API: a database table, a JSON endpoint, and a permission.
3. **[Frontend](/handbook/addon/frontend/)** — show shouts on the home page, then add a panel page for managing them.
4. **[Translations](/handbook/addon/translate/)** — move Shoutbox's text into locale files and speak more than one language.
5. **[Ship It](/handbook/addon/ship/)** — build the release jar, automate versioning and releases, and publish on GitHub and the Marketplace (with an optional premium path).

Ready? Let's set up our workshop.

**Next: [Setup →](/handbook/addon/setup/)**
