# Getting Started

This area covers everything you need to build a Pano theme. A theme controls the **look and feel** of the public website — layouts, colors, typography, and markup — while the backend, authentication, plugin runtime, and data loading are handled for you.

## What a theme is now

A modern Pano theme is a **thin package** built on top of the **`@panomc/theme-core`** engine, published on npm (current line `1.0.0-dev.x`). The engine ships the auth flows, plugin runtime, data loading, and build pipeline as a dependency — you consume it and update it with `bun update`, the same way you update any package.

Your theme repo is typically only a few hundred lines: design tokens, optional view overrides, and metadata. Everything hard already lives in the engine.

> **`vanilla-theme` is the built-in SYSTEM theme, not a template.** Do **not** fork or copy it. It is protected and managed internally by Pano. Start a new theme with the scaffolder below instead.

## Prerequisites

Before you begin, make sure you have:

- **Bun** installed (Pano front-ends use Bun, not npm/pnpm).
- A **Pano instance running locally** — your theme's dev server proxies API calls to it.
- Basic familiarity with **Svelte 5** and **SCSS** (only needed once you go beyond tokens).

## Create a theme

Scaffold a new theme with the `theme-core` CLI:

```sh
bunx theme-core new my-theme
```

This generates a **17-file scaffold** — manifest, config, style tokens, hooks shims, and the SvelteKit skeleton. Then install and boot it:

```sh
cd my-theme
bun install
bun run sync          # generates route/lib bridges from the engine
bun run dev           # dev server against a running Pano backend
```

> **If `bun install` hangs at "Resolving…"**, cancel and retry with:
> ```sh
> bun install --backend=copyfile
> ```

The dev server proxies API calls to your local Pano backend. Set the target in `.env`:

```sh
# .env
VITE_API_URL=http://localhost:8088/api
```

## What you own vs. what is generated

Knowing which files are yours and which are regenerated is the key to painless upgrades.

**Yours — edit freely, committed to your repo:**

| Path | Purpose |
|---|---|
| `manifest.json` | id, title, version, author, `panoVersion`, screenshots |
| `theme.config.js` | view overrides + settings-schema extensions |
| `src/styles/tokens.scss` | your design tokens (colors, radii, fonts, shadows) |
| `src/styles/style.scss` | tokens first, then engine SCSS, then your CSS |
| `src/views/` | your view overrides (only the ones you eject) |
| `lang-overrides/` | only the i18n keys you change (deep-merged, additive) |
| `static/` | your assets |

**Generated — never hand-edit (`bun run sync` recreates them):**

| Path | Purpose |
|---|---|
| `src/routes/` | route shims generated from the engine |
| `src/lib/` | generated bridges + SDK host-provides stubs |
| `lang/` | base language files (override via `lang-overrides/`) |

> Hand-editing generated files means your changes vanish on the next `sync` or engine update. Put every change in the files you own.

## Tier 1 — Tokens (zero-maintenance restyle)

The simplest theme changes nothing but tokens. `src/styles/tokens.scss` ships as a **commented menu of every engine variable**. Uncomment the ones you want and change their values:

```scss
// src/styles/tokens.scss
$color-primary:    #ff5722;
$color-background: #0f1115;
$radius-base:      12px;
$font-family-base: "Inter", sans-serif;
```

Every engine variable is declared `!default`, so your value always wins. A tokens-only theme is **zero-maintenance forever** — it keeps working across engine minors and even majors with no edits. This alone produces a visibly distinct theme.

## Tier 2 — Views (custom markup)

When tokens aren't enough and you need different markup, override a **view**. List every overridable view and its props:

```sh
bunx theme-core list-views
```

There are **26 overridable views**. To customize one, eject it:

```sh
bunx theme-core eject-view LoginView
```

This copies the engine's default view into `src/views/LoginView.svelte` and registers it in `theme.config.js`. The file's header documents **every prop** — stores arrive as store objects (use `$store`), actions arrive as functions.

The page chrome (`Navbar`, `Header`, `Footer`) and plugin-facing components (`LoginFormBody`, `RegisterForm`, `Pagination`, …) are individually overridable the same way — you don't have to eject a whole layout to restyle a navbar.

> **Keep every plugin mount point.** An overridden view **must** retain the `<ViewComponent>` slots and `<Hook>` markers the default view mounted. If you drop one, installed plugins silently disappear — and `bun run check` fails before you can ship.

## Extra theme settings

The theme-settings page is driven by a tab → settings-key map. If an overridden view renders extra inputs — new keys, or a whole new tab — declare them in `theme.config.js` so the panel **saves and resets** them (otherwise they render but never persist):

```js
// theme.config.js
export default {
  views: {
    ThemeSettingsView: () => import("./src/views/ThemeSettingsView.svelte"),
  },
  settingsSchema: {
    // Additive only: keys are APPENDED to a tab (a new tab is created if
    // absent). You cannot remove or move a base key.
    tabs: {
      header: ["heroSubtitle", "heroSubtitleVisibility"],
      "support-page": ["supportPageDiscordLink"],
    },
    // Optional: the tab the page opens on. Only required when your view does
    // not render the base default tab ("general").
    defaultTab: "logo",
  },
};
```

Rules: a key may live in exactly **one** tab (save/reset are per-tab), and `defaultTab` must be a real tab. A key you only *read* in markup (with no input in the settings view) needs no schema entry.

## Ship a theme

Building and packaging is reproducible by design:

```sh
bun run build        # reproducible build (kit version pinned, deterministic)
bun run check        # verifies the contract — fails on any violation
bun run package      # deterministic zip
```

Then install the produced `.zip` from **Panel → View → Themes → Install Theme**.

**Premium themes:** the zip's **sha256 is the license identity**. The license gate is **skipped under `vite dev`** so you can develop freely, and **enforced in production builds**.

`bun run check` enforces the contract before you ship:

- `svelte` pinned exactly to core's version (skew silently drops plugins)
- every registered view exists and is a known contract name
- overridden views keep every plugin slot/hook the default mounts
- `lang-overrides/*.json` parse and merge additively
- `settingsSchema` is shape-valid, appends only, and its `defaultTab` is real
- `manifest.json` carries the required keys and its `id` is not `vanilla-theme`

## Update the engine

Upgrading is a three-command loop:

```sh
bun update @panomc/theme-core && bunx theme-core sync && bun run build
```

- **Tokens-only themes** need nothing more — this is the entire migration, **even across majors**.
- **View overrides** are unaffected by minors (props are only added, never changed or removed). On a **major**, only the views you overrode may need attention — `bun run check` lists every contract violation, and the engine's changelog documents the prop changes per view.

That's the whole model: stay on tokens for a maintenance-free theme, drop down to views only where you need custom markup, and let the engine carry the rest.
