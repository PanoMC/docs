# Reshaping Pages

Colors and fonts got Ember a long way. Now we want the **home page itself** to look different — a warm welcome banner, then the news below. That means changing a page's **view**: its markup and layout.

This is the one step that needs **basic Svelte**. Don't panic: you never start from a blank page — you edit a working copy of the real design. If Svelte is new to you, the [Svelte tutorial](https://svelte.dev/tutorial) covers everything a view uses.

Full reference: [Changing Page Designs](/theme/views/).

## The idea in one sentence

Every page is **logic** (loading data, logins, plugins — the engine owns this) plus a **view** (how it looks — yours to change). You can take over any view's *look* without touching its *logic*.

## Step 1 — see what views exist

List every view you can take over, along with the data each one receives:

```sh
bunx @panomc/theme-core list-views
```

You'll see the whole set — home, login, register, profile, and more. We want the home page, which is `HomeView`.

## Step 2 — eject HomeView

To take ownership of a view, **eject** it. This copies the engine's default `HomeView` into your own `src/views/` folder and registers it in `theme.config.js`:

```sh
bunx @panomc/theme-core eject-view HomeView
```

You now have a working `src/views/HomeView.svelte` — a real, functioning copy you can edit freely.

## Step 3 — read the header first

Open `src/views/HomeView.svelte`. It starts with a comment header listing **every prop** the engine hands your view — think of it as the materials you have to work with. It looks something like:

```svelte
<!--
  @view HomeView
  Props:
    data.posts       array — posts of the current page
    data.postCount   number — total number of posts
    data.page        number — current page number
    data.totalPage   number — total page count for pagination
    themeSettings    object — theme settings from context
    onPageClick      function(data, page) — pagination handler
-->
```

Whatever the header lists is what you have. Stores arrive as store objects (read them with a `$` prefix, like `$_`); actions arrive as functions you call.

## Step 4 — add Ember's welcome banner

Let's add a warm hero above the news list. Find the top of the markup and drop in a banner:

```svelte
<section class="ember-hero">
  <h1>Welcome to Ember SMP</h1>
  <p>Grab a torch. Your adventure starts at the campfire.</p>
</section>
```

Then give it a little style in `src/styles/style.scss` (below the imports):

```scss
.ember-hero {
  padding: 3rem 1.5rem;
  text-align: center;
  background: linear-gradient(135deg, #ff6a3d, #ffb347);
  border-radius: 14px;
  color: #fff;
}
```

Save and refresh. **You should now see** a glowing orange welcome banner sitting above the news feed.

::: tip Hard-coded now, translatable later
We wrote the banner text directly in the markup for now. On the next page we'll move those strings into translation files so Ember greets every visitor in their own language.
:::

## Step 5 — keep the plugin slots

This is the one rule you must not break. Views contain **plugin mount points** — `<ViewComponent>` slots and `<Hook>` markers — and that's where installed plugins appear on the page. When you redesign, **keep every one of them**. Move them, restyle around them, but never delete one.

::: warning Drop a slot, lose a plugin
If you remove a mount point, any plugin that relied on it silently vanishes from your users' sites. Rearrange freely, but keep them all.
:::

## Step 6 — check your work

The engine ships a safety net that catches a missing plugin slot (and more) before you can ship a broken theme:

```sh
bun run check
```

A green `check` means your view still honors its contract. If it complains about a missing mount point, put it back and run again.

::: tip Adding new settings for the site owner
If your redesign adds an option the site owner should control from the panel (say, a custom hero title), it must be declared under `settingsSchema` in `theme.config.js`, or the input won't save. The [Changing Page Designs](/theme/views/#custom-theme-settings) reference shows the exact shape.
:::

Ember's home page now has its own shape. Let's make its words speak every language.

**Next: [Translations →](/handbook/theme/translate/)**
