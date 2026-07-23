# Localization (i18n)

Localization (often shortened to **i18n**) means showing your theme's text in different languages. The good news: the Pano engine already ships full translations, so you only ever write down the pieces you actually change.

## How it works

The engine comes with complete translations for the languages it supports today — **en-US** (English), **tr** (Turkish), and **ru** (Russian). You do **not** copy or maintain those big files.

Instead, your theme carries only the **differences** in a folder called `lang-overrides/`, with one file per language:

```
lang-overrides/
├─ en-US.json
├─ tr.json
└─ ru.json
```

When you run `bun run sync`, Pano merges your overrides on top of the engine's translations. The merge is **additive**: you can add brand-new text or replace existing text, but you can never lose an engine key. Anything you do not mention keeps the engine's default.

So your job is small: write only the keys you want to change or add.

## Example 1 — Change existing text

Say you want the footer to say something different in Turkish. You do not need to touch the engine's files — you just override that one key.

Create (or open, if you already made it) `lang-overrides/tr.json` and add the key you want to change:

```json
{
  "footer": {
    "copyright": "Benim harika sunucum tarafından yapıldı"
  }
}
```

After `bun run sync`, Turkish visitors see your text there, while every other footer key still comes from the engine untouched. To change the same label in English, add it to `en-US.json` as well; to change it in Russian, add it to `ru.json`.

## Example 2 — Add a brand-new key

If you added your own markup — say a hero slogan in a view you overrode — you can add a new translation key for it.

**1. Use the key in your view.** In your `.svelte` file, `$_` looks up a key inside your theme's namespace:

```svelte
<h1>{$_("my-theme.hero-slogan")}</h1>
```

**2. Add the key for each language** in `lang-overrides/`:

```json
// lang-overrides/en-US.json
{
  "my-theme": {
    "hero-slogan": "Your adventure starts here"
  }
}
```

```json
// lang-overrides/tr.json
{
  "my-theme": {
    "hero-slogan": "Maceran burada başlıyor"
  }
}
```

```json
// lang-overrides/ru.json
{
  "my-theme": {
    "hero-slogan": "Твоё приключение начинается здесь"
  }
}
```

Now the slogan shows in the visitor's language automatically. Run `bun run sync` after adding keys so the merge picks them up.

## Adding a whole new language

You are not limited to the three built-in languages. To add one — say German — create a new file in `lang-overrides/`:

```
lang-overrides/
└─ de.json
```

**The file name is the locale code.** `de.json` means the locale code `de`, `en-US.json` means `en-US` — the part before `.json` is the code, in the same style as codes like `en-US`, `tr`, `de` (a lowercase language code, optionally followed by a dash and an uppercase region code). Put your translations inside using the same key structure as the other files.

After `bun run sync`, your new language is built on top of the engine's **English** translations — so any key you have not translated yet falls back to English instead of showing a raw key.

::: warning The panel decides which languages exist
Adding the file alone does **not** make the language appear on your site. The list of available languages comes from Pano itself: an admin must first define a locale with the **same locale code** (for example `de`) in the panel. Once that locale exists panel-side, visitors can pick it and your `de.json` translations are used. If no matching locale is defined in the panel, the file is simply ignored.
:::

::: tip Missing a translation?
If a key has no translation, the raw key name (like `my-theme.hero-slogan`) shows up on screen instead of real text — an easy way to spot the problem. `bun run check` also warns you about keys your views use that are not translated, so you catch them before shipping. See [Packaging](/theme/packaging/).
:::

## Where to next

- **[Building & Packaging](/theme/packaging/)** — build, check, and package your theme.
- **[Publishing & Premium](/theme/publishing/)** — share your theme with others.
