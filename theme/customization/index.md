# Colors & Styling

This is the **no-code path** to your own theme. You will change colors, spacing, and fonts by editing two SCSS files — no Svelte, HTML, or JavaScript required. If you have never written CSS before, don't worry: every change here is "find a value, change the value, refresh".

::: tip
This tier needs no Svelte or JavaScript at all. A single color change already produces a visibly different theme — and because you are only setting values the engine already understands, **engine updates never break your theme**.
:::

## The two files you edit

Everything on this page happens in two files inside your theme:

| File | What it is for |
|---|---|
| `src/styles/tokens.scss` | A **menu** of every color, font, and radius the engine uses. Uncomment a line and change its value. |
| `src/styles/style.scss` | Where your own **extra** CSS goes, after the engine's styles. |

## tokens.scss — the menu of values

When you scaffold a theme, `src/styles/tokens.scss` ships as a **commented-out menu of every variable the engine uses** — colors like `$primary` and `$secondary`, border radius, fonts, and named dark themes. Each line starts with `//`, which means "off". To use one:

1. Find the variable you want in the file.
2. Remove the `//` at the start of its line (this is called *uncommenting*).
3. Change the value to what you want.
4. Save the file and refresh the browser.

Every engine variable is declared with `!default`, which is a fancy way of saying **your value always wins**. You never have to fight the engine.

### Example 1 — change the primary color

The primary color is the theme's main accent — buttons, links, highlights. Change it and the whole site re-tints:

```scss
// src/styles/tokens.scss
$primary: #ff5722;
```

### Example 2 — change the border radius

Border radius controls how rounded corners are (cards, buttons, inputs). A bigger number is softer and rounder; `0` is fully square:

```scss
// src/styles/tokens.scss
$radius: 12px;
```

### Example 3 — change the font

Set the base font used across the site. Use a font you know is available (a web-safe font, or one you load yourself):

```scss
// src/styles/tokens.scss
$font-family-base: "Inter", sans-serif;
```

::: tip
You do **not** have to uncomment every line. Change only the handful of values you care about and leave the rest commented — the engine fills in sensible defaults for everything you don't touch.
:::

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
