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

Open `lang-overrides/tr.json` and add the key you want to change:

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

::: tip Missing a translation?
If a key has no translation, the raw key name (like `my-theme.hero-slogan`) shows up on screen instead of real text — an easy way to spot the problem. `bun run check` also warns you about keys your views use that are not translated, so you catch them before shipping. See [Packaging](/theme/packaging/).
:::

## Where to next

- **[Building & Packaging](/theme/packaging/)** — build, check, and package your theme.
- **[Publishing & Premium](/theme/publishing/)** — share your theme with others.
