# Theme Settings

Theme settings are the options a **site owner** can change without touching any code — colors, the logo, what the footer says, whether the sidebar shows. This page explains where those settings live, which ones every theme gets for free, and how to add your **own** settings to your theme, end to end.

## Where the site owner sees them

A site admin opens **`<your site>/theme-settings`** (it is also linked from the panel under **View → Theme Settings**). The page is a form with **tabs** — General, Logo, Header, Navbar and so on — and every input on it changes the live theme.

Two things are important to know about how it behaves:

- **Save and Reset work per tab.** Each tab saves its own keys and resets its own keys. That is why a setting key always belongs to exactly one tab.
- The values land in the **`themeSettings`** object your views receive — the same one you have already seen in view headers.

## What you get for free

The theme core ships a complete settings page with these base tabs and keys. You do not build any of this — it is already there in every theme:

| Tab | Keys |
|---|---|
| `general` | `themeColor`, `backgroundColor`, `bgImagePosition`, `bgImageRepeat`, `bgImageSize`, `backgroundImage` |
| `logo` | `logoVisibility`, `logoPosition`, `logoHeight`, `logoWidth`, `logoAnimation` |
| `header` | `defaultHeaderBg`, `headerBgColor`, `headerHeight`, `headerWidthOption`, `headerNavBarGap`, `headerBgImagePosition`, `headerBgImageRepeat`, `headerBgImageSize`, `headerBackgroundImage` |
| `navbar` | `navbarWidthOption`, `navbarBgColor`, `navRoundLevel`, `navLinksEnabled`, `navLinksEnableStatus`, `navLinksOrder` |
| `sidebar` | `sidebarEnabled`, `sidebarPosition`, `sidebarCarts` |
| `play-card` | `playCardStyle`, `defaultPlayCardBg`, `playCardBgOpacity`, `playCardBgEffect`, `playCardBackgroundImage`, `playCardIpText`, `playCardStatusBadge`, `playCardPlayerCount`, `playCardVersionInfo`, `playCardIpColor`, `playCardBorderColor` |
| `post-card` | `postsEnabled`, `postCoverImageEnabled`, `postReadMoreButtonEnabled`, `postAuthorImageEnabled`, `postViewCountEnabled`, `postPreviousPageEnabled`, `postNextPageEnabled` |
| `footer` | `footerEnabled`, `footerLogoEnabled`, `footerTitleEnabled`, `footerTitle`, `footerContentEnabled`, `footerContent`, `footerLinksEnabled`, `footerPluginLinksEnabled`, `footerLinksEnableStatus`, `footerLinksOrder` |
| `advanced` | `customCss` |

::: tip Reading a base setting costs nothing
Your views can read any of these right away — no declaration needed. For example, `themeSettings.postsEnabled` is how the default home view decides whether to render the post list.
:::

## Reading a setting in your views

Views receive the current settings as the `themeSettings` prop (documented in every view's header). Use it like any object:

```svelte
{#if themeSettings.footerEnabled}
  <Footer />
{/if}
```

That is all there is to reading. Adding a **new** setting takes three steps — here is the whole chain, using a "hero subtitle" as the example.

## Adding your own settings, end to end

Let's build something real: a **hero banner** on the home page that the site owner fully controls — its text, whether it shows at all, and its style. Three settings, three different input types, one new tab. When we're done, the settings page will have a brand-new **"Hero"** tab that looks and behaves exactly like the built-in ones.

The three settings:

| Key | Type | What it controls |
|---|---|---|
| `heroEnabled` | on/off switch | whether the banner renders at all |
| `heroSubtitle` | text field | the banner's subtitle line |
| `heroStyle` | dropdown | `gradient` or `solid` background |

### Step 1 — take ownership of the settings page

The settings page is a view like any other, so you take ownership of it the same way:

```sh
bunx @panomc/theme-core eject-view ThemeSettingsView
```

Open your new `src/views/ThemeSettingsView.svelte` and look around before changing anything. Two things matter:

- `themeSettings` arrives as a **writable store**: every input edits `$themeSettings.someKey` directly, live. No save logic in the markup — the page's Save button handles that.
- Tabs come in pairs: a **nav button** at the top (setting `$activeTab`) and a **tab pane** below holding the inputs.

### Step 2 — add a "Hero" tab button

Find the tab nav (the row of `nav-link` buttons near the top — you'll see `general`, `logo`, `header`, …) and add yours after the last one, following the exact same pattern:

```svelte
<button
  class="nav-link"
  class:active={$activeTab === "hero"}
  data-bs-toggle="tab"
  data-bs-target="#hero"
  on:click={() => ($activeTab = "hero")}>
  {$_("theme-settings.hero.title")}
</button>
```

Note the `$_("theme-settings.hero.title")` — labels are translation keys, not hard-coded text, just like the built-in tabs. We'll add the translations in Step 5.

### Step 3 — add the tab pane with the three inputs

Scroll to the tab panes (`<div class="tab-pane" id="...">` blocks) and add a pane whose `id` matches your `data-bs-target`. Each input type follows a pattern that already exists in the file — copy the neighbors:

```svelte
<div class="tab-pane" class:active={$activeTab === "hero"} id="hero" role="tabpanel">

  <!-- on/off switch -->
  <div class="row mb-3">
    <label class="col-md-6 col-form-label" for="hero-enabled">
      {$_("theme-settings.hero.enabled")}
    </label>
    <div class="col-md-6 d-flex align-items-center">
      <div class="form-check form-switch">
        <input
          id="hero-enabled"
          class="form-check-input"
          type="checkbox"
          checked={$themeSettings.heroEnabled}
          on:change={(e) => ($themeSettings.heroEnabled = e.target.checked)} />
      </div>
    </div>
  </div>

  <!-- text field -->
  <div class="row mb-3">
    <label class="col-md-6 col-form-label" for="hero-subtitle">
      {$_("theme-settings.hero.subtitle")}
    </label>
    <div class="col-md-6">
      <input
        id="hero-subtitle"
        class="form-control"
        type="text"
        value={$themeSettings.heroSubtitle || ""}
        on:input={(e) => ($themeSettings.heroSubtitle = e.target.value)} />
    </div>
  </div>

  <!-- dropdown -->
  <div class="row mb-3">
    <label class="col-md-6 col-form-label" for="hero-style">
      {$_("theme-settings.hero.style")}
    </label>
    <div class="col-md-6">
      <select
        id="hero-style"
        class="form-select"
        value={$themeSettings.heroStyle || "gradient"}
        on:change={(e) => ($themeSettings.heroStyle = e.target.value)}>
        <option value="gradient">{$_("theme-settings.hero.styles.gradient")}</option>
        <option value="solid">{$_("theme-settings.hero.styles.solid")}</option>
      </select>
    </div>
  </div>

</div>
```

Notice the defaulting pattern on every input: `$themeSettings.heroStyle || "gradient"`. A fresh site has no saved value yet, so the input shows your default instead of an empty control. Use the same `||` fallback when you *read* the setting later.

::: tip Want a color picker or an image upload?
Both already exist in the file — the background-color input (`type="color"` with `form-control-form-color`) and the background-image upload are right there in the `general` pane. Copy their markup the same way. Image uploads additionally use a `bind:files` store (see `backgroundImageFiles` in the view header's prop list).
:::

### Step 4 — declare the keys in `theme.config.js`

Without a declaration, your inputs render but **never save**. Declare the new tab and its keys under `settingsSchema`:

```js
// theme.config.js
export default {
  views: {
    ThemeSettingsView: () => import("./src/views/ThemeSettingsView.svelte"),
    HomeView: () => import("./src/views/HomeView.svelte"),
  },
  settingsSchema: {
    tabs: {
      // "hero" doesn't exist as a base tab → a NEW tab is created with these keys
      hero: ["heroEnabled", "heroSubtitle", "heroStyle"],
      // adding to an EXISTING base tab works too, e.g.:
      // header: ["headerTagline"],
    },
  },
};
```

The rules are simple:

- Entries are **additive** — your keys are appended to a tab, and a brand-new tab name creates a new tab.
- You **cannot move or remove a base key**. Save/reset work per tab, so a key living in two different tabs would be ambiguous — `bun run check` rejects it.
- `defaultTab` is optional; set it only if your settings view does not show the base default tab.

### Step 5 — add the labels to your translations

The `$_()` keys from Steps 2-3 need text. Add them to `lang-overrides/` (create the files if they don't exist yet — see [Localization](/theme/localization/)):

```json
// lang-overrides/en-US.json
{
  "theme-settings": {
    "hero": {
      "title": "Hero",
      "enabled": "Show hero banner",
      "subtitle": "Hero subtitle",
      "style": "Banner style",
      "styles": { "gradient": "Gradient", "solid": "Solid color" }
    }
  }
}
```

Then run `bun run sync` so the merge picks the keys up. Without this the tab still works — you'd just see raw key names like `theme-settings.hero.title` instead of labels.

### Step 6 — read the settings where they matter

In your `HomeView` override, use all three:

```svelte
{#if themeSettings.heroEnabled}
  <section class="ember-hero" class:hero-solid={themeSettings.heroStyle === "solid"}>
    <h1>{$_("my-theme.hero-title")}</h1>
    {#if themeSettings.heroSubtitle}
      <p>{themeSettings.heroSubtitle}</p>
    {/if}
  </section>
{/if}
```

### Try the whole loop

1. `bun run check` — validates your `settingsSchema` (a typo'd tab or a base key in the wrong tab fails here, not in production).
2. Refresh the site, open **`/theme-settings`** as an admin → the **Hero** tab is there with your three inputs.
3. Toggle the switch, type a subtitle, pick "Solid color", press **Save** on the tab.
4. Open the home page → the banner reflects every choice. Press **Reset** on the Hero tab → your `||` defaults come back.

That is the complete chain: **input (view) → declaration (schema) → label (translations) → read (your views)**.

::: warning The declaration is the part people forget
If your new field seems to "not stick" after saving, the missing `settingsSchema` entry is almost always why. The input edits the live object in the browser, but only declared keys are persisted.
:::

## Where to next

- **[Changing Page Designs](/theme/views/)** — ejecting views, the worked example this page builds on.
- **[Building & Packaging](/theme/packaging/)** — `bun run check` validates your `settingsSchema` before you ship.
