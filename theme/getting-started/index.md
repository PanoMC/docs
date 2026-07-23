# Getting Started

A Pano **theme** controls how your website looks — its colors, fonts, and layout. The hard parts (login, plugins, loading data, building) are already done for you by an engine called `@panomc/theme-core`. Your theme just sits on top and changes the look.

This page gets you from nothing to a running theme, and makes your first change in about two minutes.

::: tip You do not need to be an expert
You can follow every step here by copying and pasting commands. It **helps** to know a little **HTML**, **CSS**, **JavaScript**, and **Svelte**, but none of it is required to start.

New to these? These free guides are great:

- **Svelte** — [svelte.dev/tutorial](https://svelte.dev/tutorial)
- **HTML / CSS / JavaScript** — [MDN Web Docs](https://developer.mozilla.org/)
:::

## What you need

Before you start, make sure you have these three things:

| You need | What it is |
|---|---|
| **Bun** | The tool that installs and runs Pano front-ends. Install it from [bun.sh](https://bun.sh). |
| **A running Pano** | Your own Pano server, or one running on your computer — Pano must be installed and running first; see [Installation](/platform/installation/) if you haven't set it up yet. Your theme talks to it while you work. |
| **A code editor** | Any text editor for code, such as [VS Code](https://code.visualstudio.com/). |

## Create your theme

You create a new theme with **one command**. Open a terminal and run:

```sh
bunx @panomc/theme-core new my-theme
```

This makes a new folder called `my-theme` with everything a theme needs inside it.

Now go into that folder and install its parts:

```sh
cd my-theme
bun install
```

::: tip If `bun install` seems stuck
If it hangs on "Resolving…", stop it (press `Ctrl + C`) and run this instead:

```sh
bun install --backend=copyfile
```
:::

Next, generate the files the engine provides for you:

```sh
bun run sync
```

Now tell your theme where your running Pano is. Open the file called `.env` and set the address:

```sh
# .env
VITE_API_URL=http://localhost:8088/api
```

::: tip
Pano's default port is `80`. When you start Pano with `--dev`, it runs on `8088` — that's the usual setup while developing a theme. If your Pano runs somewhere else, use that address instead.
:::

One more step on the Pano side: open Pano's config file, disable the `init-ui` setting, and restart Pano. This tells Pano to use **your** development theme instead of launching its own built-in one. The [Server configuration](/platform/configuration/server/#initialization-ui-and-updates) page shows where this setting lives.

Finally, start the theme:

```sh
bun run dev:ui
```

::: tip Why `dev:ui`?
`dev:ui` runs the dev server **plus a style watcher** that recompiles your styles whenever you save. Plain `bun run dev` starts only the server, so color and token changes would not show up.
:::

Now open your site **through Pano's address**: `http://localhost:8088` if you started Pano with `--dev`, or `http://localhost` (port `80` by default — or whatever port you configured). You should see your site, running with your new theme.

::: warning
Don't browse the theme at `localhost:3000` — a theme always runs behind Pano. If you open the theme's own port directly, it automatically redirects you to Pano's address.
:::

## Your first change in 2 minutes

Let's change the main color of your theme.

1. In your editor, open `src/styles/tokens.scss`.
2. Find the line for the primary color. It starts commented out, like this:
   ```scss
   // $primary: #ff5722;
   ```
3. Remove the `//` at the start to turn it on, and change the color:
   ```scss
   $primary: #10b981;
   ```
4. Save the file, then refresh your browser.

Your site now uses the new color. That is the whole loop: edit, save, refresh.

::: tip What just happened
`tokens.scss` is a list of your theme's design values — colors, fonts, sizes. Every value in the engine can be replaced from here. Change a token, and it changes everywhere it is used.
:::

## Where to next

You now have a running theme and know how to change it. Here is where to go depending on what you want to do:

- **[Theme Structure](/theme/structure/)** — what all the files are, and which ones are yours to edit.
- **[Customization](/theme/customization/)** — go deeper with tokens and styles.
- **[Views](/theme/views/)** — change the actual layout and markup, not just colors.
- **[Localization](/theme/localization/)** — translate your theme into other languages.
- **[Packaging](/theme/packaging/)** — build your theme into a file you can install.
- **[Publishing](/theme/publishing/)** — share your theme with others.
