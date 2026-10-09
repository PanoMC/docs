# Getting Started

A Pano **theme** controls how your website looks: its colors, fonts, and layout. The hard parts (login, plugins, loading data, building) are done for you by an engine called `@panomc/theme-core`. Your theme sits on top and changes the look.

This page takes you from nothing to a running theme with your own color. It is three steps, and you write no file by hand until the color.

::: tip You do not need to be an expert
Every step is copy and paste. A little **HTML**, **CSS**, **JavaScript** and **Svelte** helps, but none of it is required to start. Free guides: [svelte.dev/tutorial](https://svelte.dev/tutorial) and [MDN Web Docs](https://developer.mozilla.org/).
:::

## What you need

| You need | What it is |
|---|---|
| **Bun** | Installs and runs Pano front-ends. Get it from [bun.sh](https://bun.sh). |
| **A running Pano** | Your own server, or one on your computer. See [Installation](/platform/installation/) if it is not set up yet. Your theme talks to it while you work. |
| **A code editor** | Any editor, such as [VS Code](https://code.visualstudio.com/). |

## The quick-start

```sh
bunx @panomc/theme-core new my-theme     # asks four questions, then installs
cd my-theme && bun run dev:ui            # prints one panel field to set, once
```

Then, in the panel, switch **Platform Settings → Development Mode** on and fill **Appearance → Front-end → Theme dev server** with the address the command printed (`http://localhost:3000`). Save, and open your Pano address. Your theme is running.

That is all: **three steps** (scaffold, dev, one panel field). You edit no Pano config file and you do not restart Pano, so the panel stays available while you work.

::: tip If `bun install` seems stuck
If it hangs on "Resolving...", stop it (`Ctrl + C`) and run `bun install --backend=copyfile` inside the folder.
:::

::: tip Giving the theme a name on the command line
`bunx @panomc/theme-core new my-theme` with a name asks nothing and does not install. Run `bun install` in the folder before `bun run dev:ui`. The first install also generates the routes, language files and bridges, so there is no separate sync step.
:::

::: warning Browse through Pano, not through the theme's port
A theme always runs behind Pano. Open your Pano address (for example `http://localhost:8088` when Pano runs with `--dev`). The theme's own port redirects you there.
:::

## What the panel field does

While the **Theme dev server** field is set, the front-end mode is `THEME` and Development Mode is on: Pano does not start its own theme process and proxies the site to your dev server. The panel, setup and plugin UIs run as usual. Clear the field and Pano goes back to the installed theme.

## Your first change

Open `src/styles/tokens.scss`. It is a commented menu of every token. Turn one on:

```scss
$primary: #10b981;
```

Save. The page updates by itself. A theme that looks different from vanilla is **four steps**: the three above plus this edit.

`bun run dev:ui` also recompiles your styles on every save. Plain `bun run dev` starts only the server, so style edits would not show.

## Where to next

- **[Theme Structure](/theme/structure/)**: which files are yours and which are generated.
- **[Customization](/theme/customization/)**: tokens, `--pano-*` variables and your own CSS.
- **[Views](/theme/views/)**: change markup, redraw a plugin's view, place blocks, rename routes, pick a home page.
- **[Localization](/theme/localization/)**: translate your theme.
- **[Packaging](/theme/packaging/)** and **[Publishing](/theme/publishing/)**: ship it.

The same page, shorter, lives in the engine repository as `QUICKSTART-THEME.md`; the long reference is `THEME-AUTHOR-GUIDE.md`.
