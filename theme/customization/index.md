# Colors & Styling

This is the **no-code path** to your own theme. You will change colors, spacing, and fonts by editing two SCSS files — no Svelte, HTML, or JavaScript required. If you have never written CSS before, don't worry: every change here is "find a value, change the value, refresh".

::: tip
This tier needs no Svelte or JavaScript at all. A single color change already produces a visibly different theme — and because you are only setting values the engine already understands, **engine updates never break your theme**.
:::

## The two files you edit

Everything on this page happens in two files inside your theme:

| File | What it is for |
|---|---|
| `src/styles/tokens.scss` | A **menu** of every color and font variable the engine uses. Uncomment a line and change its value. |
| `src/styles/style.scss` | Where your own **extra** CSS goes, after the engine's styles. |

## tokens.scss — the menu of values

When you scaffold a theme, `src/styles/tokens.scss` ships as a **commented-out menu of every variable the engine uses** — colors like `$primary` and `$secondary`, fonts, and named dark themes. Each line starts with `//`, which means "off". To use one:

1. Find the variable you want in the file.
2. Remove the `//` at the start of its line (this is called *uncommenting*).
3. Change the value to what you want.
4. Save the file and refresh the browser.

Colors and fonts in `tokens.scss` are declared with `!default`, which means **your value wins**. Radius, spacing and shadows are set with the `--pano-*` variables instead (next sections).

### Example 1 — change the primary color

The primary color is the theme's main accent — buttons, links, highlights. Change it and the whole site re-tints:

```scss
// src/styles/tokens.scss
$primary: #ff5722;
```

### Example 2 — change the border radius

Corner radius is not a `tokens.scss` variable. Set the `--pano-radius` family in your own CSS (`src/styles/style.scss`, below the imports); every default view and the engine's own views read it:

```scss
// src/styles/style.scss — after the imports
:root {
  --pano-radius: 12px;
  --pano-radius-sm: 8px;
  --pano-radius-lg: 18px;
}
```

A bigger number is softer; `0` is square. See [The `--pano-*` tokens](#the-pano-tokens) below.

### Example 3 — change the font

Set the base font used across the site. Use a font you know is available (a web-safe font, or one you load yourself):

```scss
// src/styles/tokens.scss
$font-family-base: "Inter", sans-serif;
```

::: tip
You do **not** have to uncomment every line. Change only the handful of values you care about and leave the rest commented — the engine fills in sensible defaults for everything you don't touch.
:::

## The `--pano-*` tokens

Besides the SCSS menu, a theme reads **34 CSS variables** named `--pano-*`: colors (`--pano-color-bg`, `--pano-color-text`, `--pano-color-primary`, `--pano-color-border`...), radii (`--pano-radius`, `-sm`, `-lg`, `-pill`), `--pano-border-width`, shadows (`--pano-shadow-sm`, `--pano-shadow`, `--pano-shadow-lg`), fonts (`--pano-font-body`, `--pano-font-heading`, `--pano-font-mono`, `--pano-font-size`...) and `--pano-space`. In a Bootstrap theme they mirror the matching Bootstrap variable, so changing the SCSS color changes both. Plugins style their default views with the same variables, so one set of values re-tints the plugins too:

```css
:root { --pano-color-primary: #7c3aed; --pano-radius: 0.5rem; }
```

Each plugin view also carries semantic classes (`market-product-card__title`). Your CSS is not layered, so it beats the plugin's fallback styles: `.market-product-card__title { margin: 1rem }` just works. A theme without Bootstrap is covered in [Views](/theme/views/#themes-without-bootstrap).

## style.scss — your own extra CSS

`tokens.scss` covers the values the engine already knows about. When you want to add CSS of your own — something the engine has no variable for — put it in `src/styles/style.scss`, **after the imports at the top of the file**. Anything you add there is loaded last, so it layers on top of the engine's styles.

For example, to give cards a stronger shadow:

```scss
// src/styles/style.scss — after the imports

.section-card {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}
```

::: warning
Add your CSS **below** the existing `@use` / `@import` lines, never above them. The engine's styles must load first so your rules can build on top of them.
:::

## Seeing your changes live

SCSS is compiled to CSS separately from the rest of the build. Two commands cover it:

- **Live watch while you work** — recompiles automatically every time you save:

  ```sh
  bun run dev:ui
  ```

- **One-shot compile** — build the styles once (useful before a full build):

  ```sh
  bun run build:ui
  ```

With `bun run dev:ui` running, the loop is simply: edit a value, save, and watch the browser update.

## What's next?

When a color and font change isn't enough — when you need the **layout or markup** of a page to be different — move up to [Changing Page Designs](../views), which shows how to take ownership of a page's look.
