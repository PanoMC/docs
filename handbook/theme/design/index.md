# Design & Styling

Ember is alive and orange. Now let's make it *feel* like Ember — warm, cozy, and unmistakably its own. This whole page is the **no-code path**: we only change values in two SCSS files. No Svelte required.

Keep `bun run dev` running from the last page, and open `bun run dev:ui` in a second terminal so your styles recompile the moment you save:

```sh
bun run dev:ui
```

For the full reference on these files, see [Colors & Styling](/theme/customization/). Here we'll just build Ember's look.

## The two files you touch

| File | What it's for |
|---|---|
| `src/styles/tokens.scss` | A **menu** of every color, font, and radius the engine uses. Uncomment a line, change its value. |
| `src/styles/style.scss` | Your own **extra** CSS, layered on top of the engine's styles. |

## Step 1 — set Ember's palette

Open `src/styles/tokens.scss`. It ships as a commented-out menu — every line starts with `//`, meaning "off". To use a value, remove the `//` and set it. Every engine variable is declared `!default`, so **your value always wins**.

We already turned on `$primary`. Let's complete the campfire palette:

```scss
// src/styles/tokens.scss
$primary: #ff6a3d;    // warm ember orange
$secondary: #ffb347;  // soft flame gold
```

Save, and watch the accents warm up across the whole site.

::: tip You don't have to uncomment everything
Change only the handful of values you care about. Every line you leave commented keeps the engine's sensible default.
:::

## Step 2 — round the corners

Ember is cozy, so let's soften every card, button, and input. Find the radius token and give it a bigger value:

```scss
// src/styles/tokens.scss
$radius: 14px;
```

Save and refresh — the interface immediately feels rounder and friendlier.

## Step 3 — give Ember a font

Set the base font used across the site. Use a web-safe font, or one you load yourself:

```scss
// src/styles/tokens.scss
$font-family-base: "Poppins", sans-serif;
```

::: tip Loading a custom font
If you use a font that isn't already on the page, drop the font files into `static/` and add its `@font-face` in `style.scss` (below the imports). Then reference it in the token above.
:::

## Step 4 — add the finishing touch in style.scss

Tokens cover the values the engine already knows about. When you want something the engine has **no variable for**, put your own CSS in `src/styles/style.scss`, **below the imports at the top**.

Let's give Ember's cards a warm, glowing shadow:

```scss
// src/styles/style.scss — after the @use / @import lines

.section-card {
  box-shadow: 0 8px 28px rgba(255, 106, 61, 0.18);
}
```

Save and refresh. **You should now see** cards lifting off the page with a soft orange glow.

::: warning Add your CSS below the imports, never above
The engine's styles must load first so your rules can build on top of them. Anything you put above the imports will be overridden.
:::

## Where we are

Ember now has its palette, its rounded corners, its font, and a glow — all without writing a line of Svelte. For most themes, this is already a finished, shippable look.

But Ember's home page still uses the default layout. Let's reshape it.

**Next: [Reshaping Pages →](/handbook/theme/pages/)**
