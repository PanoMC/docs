# Translations

Ember's welcome banner currently speaks only English. On a survival server with players from everywhere, that's a missed opportunity. Let's make Ember greet each visitor in their own language.

The good news: the engine already ships **complete translations** for the languages it supports. You only ever write down the pieces *you* add or change. Full reference: [Localization](/theme/localization/).

## How it works in one picture

Your theme carries only the **differences**, in a folder called `lang-overrides/`, one file per language:

```
lang-overrides/
├─ en-US.json
├─ tr.json
└─ ru.json
```

When you run `bun run sync`, Pano merges your overrides **on top of** the engine's translations. The merge is additive: you can add new text or replace existing text, but you can never lose an engine key. Anything you don't mention keeps the engine's default.

## Step 1 — use translation keys in the view

Back on the previous page we hard-coded Ember's banner. Let's swap those strings for translation keys. In `src/views/HomeView.svelte`, `$_` looks up a key inside your theme's namespace — we'll use the `ember` namespace:

```svelte
<section class="ember-hero">
  <h1>{$_("ember.hero-title")}</h1>
  <p>{$_("ember.hero-subtitle")}</p>
</section>
```

## Step 2 — add the English text

The `lang-overrides/` folder starts out empty — create a file named `en-US.json` inside it with the keys:

```json
{
  "ember": {
    "hero-title": "Welcome to Ember SMP",
    "hero-subtitle": "Grab a torch. Your adventure starts at the campfire."
  }
}
```

## Step 3 — translate into the other languages

Add the same keys to the other files. Turkish, in `lang-overrides/tr.json`:

```json
{
  "ember": {
    "hero-title": "Ember SMP'ye hoş geldin",
    "hero-subtitle": "Bir meşale kap. Maceran kamp ateşinde başlıyor."
  }
}
```

Russian, in `lang-overrides/ru.json`:

```json
{
  "ember": {
    "hero-title": "Добро пожаловать на Ember SMP",
    "hero-subtitle": "Бери факел. Твоё приключение начинается у костра."
  }
}
```

Now run the merge so your new keys are picked up:

```sh
bun run sync
```

Refresh the site. **You should now see** the banner in your active language, and switching the site language switches the greeting.

## Adding a whole new language

Ember's community has a lot of German players? You're not limited to the three built-in languages. Create a new file whose **name is the locale code** — for German, `de`:

```
lang-overrides/
└─ de.json
```

```json
{
  "ember": {
    "hero-title": "Willkommen auf Ember SMP",
    "hero-subtitle": "Schnapp dir eine Fackel. Dein Abenteuer beginnt am Lagerfeuer."
  }
}
```

After `bun run sync`, a new language is built on top of the engine's **English** base — so any key you haven't translated yet falls back to English instead of showing a raw key.

::: warning The panel decides which languages appear
Adding `de.json` alone does **not** make German show up. The list of available languages comes from Pano itself: an admin must first define a locale with the **same code** (`de`) in the panel. Once that locale exists, visitors can pick it and your `de.json` is used. Without a matching panel locale, the file is simply ignored.
:::

::: tip Spotting a missing translation
If a key has no translation anywhere, the raw key name (like `ember.hero-title`) shows on screen — an easy tell. `bun run check` also warns about keys your views use but never translated, so you catch them before shipping.
:::

Ember now looks the part *and* speaks the language. All that's left is to package it up and share it with the world.

**Next: [Ship It →](/handbook/theme/ship/)**
