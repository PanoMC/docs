# Setup

Time to build our workshop. By the end of this page, Ember will be a real folder on your computer, connected to a running Pano, showing live in your browser — and you'll have made your very first change.

## Step 0 — make sure Pano is running

A theme is only the *look* — it needs a live Pano behind it to show anything. So before anything else, make sure your Pano is installed and running. If it isn't, follow [Installation](/platform/installation/) first and come back here.

For this handbook we'll assume you started Pano in **development mode**:

```sh
# in your Pano folder
./pano --dev
```

In `--dev` mode Pano listens on port **8088**. (Without `--dev`, the default is port **80**.) Keep this running in its own terminal.

## Step 1 — scaffold Ember

Open a new terminal. Create the theme with a single command — always this exact package name:

```sh
bunx @panomc/theme-core new ember
```

This makes a folder called `ember` with everything a theme needs inside. Move into it and install its parts:

```sh
cd ember
bun install
```

`bun install` does more than fetch dependencies — it also **generates the files the engine provides for you**: the page routes, the `$lib` bridges, the base `lang/` files, and a license stub. There's no separate manual step; it's all done for you.

::: tip If `bun install` seems stuck on "Resolving…"
Stop it with `Ctrl + C` and run this instead:

```sh
bun install --backend=copyfile
```
:::

::: tip Re-generating later
Whenever you update the engine or want to regenerate those auto files, run `bun run sync`. You don't need it right now — `bun install` already did it.
:::

Want to know what all those files are? The [Theme Structure](/theme/structure/) page has the full map. For now, the short version: the files marked **YOURS** are the ones you edit; the **auto** ones are regenerated for you, so never edit them by hand.

## Step 2 — point Ember at your Pano

Ember needs to know where your running Pano lives. Open the `.env` file at the root of the theme and set the address:

```sh
# .env
VITE_API_URL=http://localhost:8088/api
```

We use `8088` because we started Pano with `--dev`. If your Pano runs elsewhere (for example the default port `80`), use that address instead.

## Step 3 — tell Pano to use your theme

Pano ships with its own built-in initialization UI. While developing Ember, we want Pano to use **our** theme instead. Open Pano's config, disable the `init-ui` setting, and restart Pano. The [Server configuration](/platform/configuration/server/#initialization-ui-and-updates) page shows exactly where that setting lives.

## Step 4 — start Ember and see it live

Back in the `ember` folder, start the dev server:

```sh
bun run dev
```

Now open your site **through Pano's address**:

- `http://localhost:8088` if you started Pano with `--dev`, or
- `http://localhost` (port `80`) otherwise.

**You should now see** your site running with the fresh Ember theme. It still looks like the default — that's expected. We're about to change that.

::: warning Always browse through Pano, never localhost:3000
A theme always runs *behind* Pano. If you open the theme's own port (`localhost:3000`) directly, it will just redirect you to Pano's address. Bookmark Pano's URL, not the theme's.
:::

## Step 5 — your first change

Let's prove the loop works. In your editor, open `src/styles/tokens.scss` and find the primary color line — it starts commented out:

```scss
// $primary: #ff5722;
```

Remove the `//` and set Ember's warm orange:

```scss
$primary: #ff6a3d;
```

Save the file and refresh your browser. **You should now see** the accent color shift to a warm orange across buttons, links, and highlights.

That's the whole development loop: **edit, save, refresh.** You'll repeat it for the rest of this handbook.

Now that Ember is alive and connected, let's give it a real identity.

**Next: [Design & Styling →](/handbook/theme/design/)**
