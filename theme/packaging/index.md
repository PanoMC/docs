# Building & Packaging

When you are happy with how your theme looks, you turn it into a single file that a Pano server can install. This page walks you through building, checking, and packaging your theme — no prior experience required.

## Dev build vs. production build

While you work, you run `bun run dev`. This is the **dev build**: it is fast, it updates the moment you save a file, and it skips slow steps you do not need while designing. It is meant for your eyes only, on your own computer.

When you are ready to ship, you make a **production build**. This is the polished version: everything is optimized, packed small, and prepared to run on a real server. Visitors to a real Pano site always see a production build.

You do not need to switch anything by hand — the commands below do the right thing.

## Your theme's identity — `manifest.json`

At the root of your theme folder sits `manifest.json` — the card that tells Pano (and everyone else) what this theme *is*. The scaffold created it for you, but before shipping you should fill it in:

```json
{
  "id": "my-theme",
  "title": "My Theme",
  "description": "A clean, dark theme for survival servers",
  "version": "1.0.0",
  "author": "YourName",
  "panoVersion": "1.0.0",
  "screenshots": ["screenshots/1.png"],
  "premium": false
}
```

| Field | What it is |
|---|---|
| `id` | Your theme's **unique identifier** — a lowercase, dash-separated name like `my-theme`. Pano uses it to tell themes apart, and the packaged file is named after it (`my-theme-1.0.0.zip`). Pick it once and **never change it** after publishing: a new `id` counts as a completely different theme. It also must not be `vanilla-theme` — `check` rejects that. |
| `title` | The human-readable name shown to users in the panel. |
| `description` | One or two sentences about what the theme looks like. |
| `version` | The release version. If you use the release automation, this is stamped for you — don't bump it by hand. |
| `author` | Your name or team name. |
| `panoVersion` | The Pano version your theme targets. |
| `screenshots` | A list of image paths (see below). |
| `premium` | `false` for a free theme; `true` enables paid-license protection. See [Publishing & Premium](/theme/publishing/). |

### Adding screenshots

Put your images in a `screenshots/` folder at the root of your theme and list them in the manifest:

```
my-theme/
├─ manifest.json
└─ screenshots/
   ├─ 1.png
   └─ 2.png
```

```json
"screenshots": ["screenshots/1.png", "screenshots/2.png"]
```

The build copies the `screenshots/` folder into your package automatically, so the images ship inside the `.zip`. A good screenshot is a full-page capture of your theme's home page — it is the first thing people see when browsing themes.

## Step 1 — Check

Before you build, run the safety net:

```sh
bun run check
```

This inspects your theme and stops you from shipping something broken. It checks:

| What it checks | Why it matters |
|---|---|
| **Svelte version** | Your `svelte` version must match the engine's exactly. A mismatch silently breaks installed plugins. |
| **Plugin slots kept** | Any view you changed must still contain every plugin mount point the original had. Drop one and installed plugins silently disappear. |
| **Settings schema valid** | Extra settings you added must be declared correctly, so the panel can save and reset them. |
| **Translations parse** | Every file in `lang-overrides/` must be valid and merge cleanly. See [Localization](/theme/localization/). |
| **Manifest complete** | `manifest.json` must carry all required fields, and its `id` must not be `vanilla-theme`. |

If `check` reports a problem, fix it and run it again. A green `check` means your theme is safe to build and package.

## Step 2 — Build

Open a terminal in your theme folder and run:

```sh
bun run build
```

This produces the finished, optimized version of your theme inside a `build/` folder. Think of `build/` as your theme fully assembled and ready — but not yet wrapped up.

::: tip Builds are reproducible
Building the same code twice gives you the **byte-identical** result. For premium themes this matters a lot: the package's SHA-256 (a unique fingerprint of the file) **is** your license identity. Same code in, same fingerprint out. See [Publishing & Premium](/theme/publishing/).
:::

## Step 3 — Package

Now wrap the build into a single installable file:

```sh
bun run package
```

This produces a **`.zip`** file — a self-contained package that a Pano server can install directly from the panel. That one file is your whole theme.

## Install and test on your own server

Before you share your theme, install it on your own Pano to make sure it works end-to-end:

1. Open your Pano panel in a browser and log in as an administrator.
2. Go to **View → Themes**.
3. Choose **Install** (or **Install Theme**) and upload the `.zip` you just built.
4. Activate your theme and open the site to see it live.

::: tip
This is the exact same install flow your users will follow. Testing it yourself first means no surprises when someone else installs your theme.
:::

## Where to next

- **[Publishing & Premium](/theme/publishing/)** — share your theme with others and, optionally, make it premium.
- **[Localization](/theme/localization/)** — translate your theme into other languages.
