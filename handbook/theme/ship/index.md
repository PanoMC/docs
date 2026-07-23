# Ship It

Ember looks warm, its home page is reshaped, and it speaks three languages. Time to turn it into a real, installable theme — and put it in front of the world. This is the finish line.

Reference pages for depth: [Building & Packaging](/theme/packaging/) and [Publishing & Premium](/theme/publishing/).

## Step 1 — polish the manifest

At the root of the theme sits `manifest.json` — the card that tells Pano (and everyone else) what Ember *is*. Fill it in properly before shipping:

```json
{
  "id": "ember",
  "title": "Ember",
  "description": "A warm, cozy orange theme for survival servers.",
  "version": "1.0.0",
  "author": "YourName",
  "panoVersion": "1.0.0",
  "screenshots": ["screenshots/1.png"],
  "premium": false
}
```

| Field | Notes |
|---|---|
| `id` | Ember's unique, lowercase, dash-style identifier: `ember`. **Never change it after publishing** — a new `id` is a whole new theme. It can never be `vanilla-theme`. The package file is named after it: `ember-1.0.0.zip`. |
| `title` | The friendly name people see: **Ember**. |
| `description` | One or two sentences about the look. |
| `version` | The release automation stamps this for you — don't bump it by hand. |
| `author` | Your name or team. |
| `panoVersion` | The Pano version Ember targets. |
| `screenshots` | Image paths from the `screenshots/` folder (below). |
| `premium` | `false` for free; `true` for paid (see the optional section at the end). |

### Add a screenshot

Screenshots are how people judge a theme at a glance — and the Marketplace **requires at least one**. Put your images in a `screenshots/` folder at the theme root and list them in the manifest:

```
ember/
├─ manifest.json
└─ screenshots/
   └─ 1.png
```

A good first screenshot is a full-page capture of Ember's home page — banner and all. The build copies `screenshots/` into the package automatically, so the images ship inside the `.zip`.

## Step 2 — check, build, package

Three commands take Ember from source to an installable file:

```sh
bun run check      # the safety net — Svelte version, plugin slots, settings, translations, manifest
bun run build      # produces the optimized build/ folder
bun run package    # wraps build/ into ember-1.0.0.zip
```

If `check` reports a problem, fix it and run it again. A green `check` means Ember is safe to package.

::: tip Builds are reproducible
Building the same code twice gives a **byte-identical** result. That matters a lot for premium themes, where the package's SHA-256 fingerprint *is* the license identity.
:::

## Step 3 — install it on your own Pano

Before sharing, install Ember on your own Pano to confirm it works end to end — the exact flow your users will follow:

1. Open your Pano panel and log in as an administrator.
2. Go to **View → Themes**.
3. Choose **Install** and upload the `ember-1.0.0.zip` you just built.
4. **Activate** it and open the site.

**You should now see** Ember running as a properly installed theme — no dev server involved.

## Step 4 — publish on GitHub

In practice you'll automate releases. Pano ships a **reusable workflow** that runs the checks, builds, packages the deterministic `.zip`, and creates the GitHub release for you. Add a tiny caller workflow at `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    branches: [main, dev]

jobs:
  release:
    uses: PanoMC/sdk/.github/workflows/theme-release.yml@dev
    with:
      theme-id: ember
    secrets:
      TOKEN_GITHUB: ${{ secrets.GITHUB_TOKEN }}
```

`GITHUB_TOKEN` is provided by GitHub Actions automatically — just pass it through. Versions come from your **[Conventional Commits](https://www.conventionalcommits.org/)** (`feat:`, `fix:`, `chore:`), so you never bump `version` by hand.

## Step 5 — publish on the Marketplace

The Marketplace on [panomc.com](https://panomc.com) is where server owners discover and install themes straight from their panel.

**Create the resource:**

1. Sign up (or log in) at **panomc.com**.
2. Open **Create Resource**, choose type **Theme**, pick a category, and fill in title and description.
3. Upload **at least one screenshot** — required for themes.
4. Choose pricing: **free** or **paid**.

When the resource is created it gets a **resource ID** (a UUID). Find it later under **Profile → Resources**.

::: tip Two different IDs
Your `manifest.json` `id` (`ember`) identifies the theme *package*. The Marketplace **resource ID** (the UUID) identifies its *store page*. They're separate, and the release automation needs the UUID.
:::

**Automate uploads with `semantic-release-pano`:**

1. On panomc.com, create an **API token** under **Profile → Security → API tokens**, and add it to your GitHub repo as a secret named `PANO_TOKEN` (**Settings → Secrets → Actions**).
2. Point `semantic-release-pano` at your resource ID in `.releaserc.json`:

```json
["semantic-release-pano", {
  "resourceId": "YOUR-RESOURCE-UUID",
  "file": "ember-${version}.zip",
  "panoVersion": "1.0.0",
  "useGitHubLink": true,
  "repositoryUrl": "https://github.com/YourName/ember.git"
}]
```

With `useGitHubLink`, a free theme isn't uploaded twice — the Marketplace just links to the `.zip` already attached to your GitHub release (so the GitHub release must run first). Without it, the plugin uploads the file directly, which is what you want for a premium theme.

That's it — push a `feat:` commit and Ember publishes to GitHub **and** the Marketplace in one go.

## Optional — make Ember premium

Want to sell Ember? Flip one field in `manifest.json`:

```diff
- "premium": false
+ "premium": true
```

That's the only source change; the protection is wired up for you. At build time you provide a key so the build can bind the license to your package — either `PANO_LICENSE_SERVER` (the reusable workflow sets this per branch) or `PANO_LICENSE_PUBLIC_KEY` stored as a CI secret. In `bun run dev` the license gate is **off**, so you develop freely.

How it works, in plain words: a production build computes the package's SHA-256 fingerprint and binds the license to it. To run the premium theme, a server must have a panomc.com account connected in its panel that purchased Ember — checked both at install and while running. Tamper with or repack the `.zip` and its fingerprint no longer matches, so Pano rejects it.

::: warning No protection is absolute — be honest with yourself
**No license system protects code 100%.** The goal is to make unauthorized use as hard as possible for the vast majority of users, not to make it impossible. Like every piece of software, any code that reaches the end user is inherently exposed — someone determined and skilled enough can always take it apart. That's true of every DRM ever made, not just Pano's. Price and support Ember with that reality in mind.
:::

::: warning Ship changes as new releases
A premium license is issued per **version + package**. If you edit a `.zip` that was already released, its fingerprint changes and it stops being licensed. Always ship changes as a **new release** through the flow above — never hand-edit a released `.zip`.
:::

## You did it

Ember went from an empty folder to a themed, translated, published theme — installed on your own Pano and live on the Marketplace. That's the whole journey, start to finish.

Where to go from here:

- **[Colors & Styling](/theme/customization/)** — go deeper on tokens and SCSS.
- **[Changing Page Designs](/theme/views/)** — reshape more of the 26 views.
- **[Localization](/theme/localization/)** — more on translations and new languages.
- **[Publishing & Premium](/theme/publishing/)** — the full release and premium reference.

Happy theming. 🔥
