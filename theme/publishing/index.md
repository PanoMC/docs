# Publishing & Premium

Once your theme is built and packaged, you can share it with the world — for free, or as a premium (paid) theme. This page covers how to release it, how to automate the whole process, and how premium protection works.

If you have not built your theme yet, start with [Building & Packaging](/theme/packaging/).

## Versioning

Every release of your theme has a version number (like `1.0.0`). This lets servers know when an update is available.

If you use the automation below, you do not bump the version by hand. Instead, versions are decided from your commit messages, which must follow [Conventional Commits](https://www.conventionalcommits.org/) — a simple format where each commit starts with a word like `feat:` (a new feature), `fix:` (a bug fix), or `chore:` (housekeeping). These words drive both the version number and the generated changelog.

## Distribution

Pano themes are distributed via:

- **GitHub Releases** — a downloadable `.zip` attached to a tagged release on your repository.
- **The Official Pano Marketplace** — where server owners browse and install themes.

To release manually on GitHub:

1. Tag your commit.
2. Create a new Release.
3. Upload the `.zip` from your `package` step.

In practice, you will almost always let the automation below do this for you.

## GitHub Actions automation

Pano ships a **reusable workflow** that does the whole release for you: it runs the checks, builds your theme, packages the deterministic `.zip`, and creates the GitHub release with that file attached. You only add a tiny "caller" workflow to your repository that points at it.

Create `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    branches: [main, dev]

jobs:
  release:
    uses: PanoMC/sdk/.github/workflows/theme-release.yml@dev
    with:
      theme-id: my-theme
    secrets:
      TOKEN_GITHUB: ${{ secrets.GITHUB_TOKEN }}
```

That is the whole file. When you push, the shared workflow:

1. Runs `sync` + `check` (the safety net from [Packaging](/theme/packaging/)).
2. Builds your theme.
3. Packages the deterministic `.zip`.
4. Creates a GitHub release and attaches that `.zip` automatically.

Replace `my-theme` with your theme's `id` from `manifest.json`.

::: tip
`GITHUB_TOKEN` is provided automatically by GitHub Actions — you do not need to create it. Just pass it through as shown.
:::

## Publishing on the official Pano Marketplace

The Marketplace on [panomc.com](https://panomc.com) is where server owners discover and install themes straight from their panel. Publishing there takes three steps: create an account, create a resource, then upload versions (by hand or automatically).

### 1. Create an account and a resource

1. Sign up (or log in) at **panomc.com**.
2. Open **Create Resource**.
3. Choose the type **Theme**, pick a category, fill in the title and description, and upload at least one **screenshot** — screenshots are required for themes, since they are how people judge a theme at a glance.
4. Choose the pricing: **free**, or **paid** if you plan to sell it (see the premium section below).

When the resource is created, it gets a **resource ID** (a long unique code, a UUID). You will find your resources and their IDs later under **Profile → Resources**. This ID is how release tools refer to your theme on the Marketplace — keep it handy.

::: tip Two different IDs
Your `manifest.json` `id` (like `my-theme`) identifies the theme *package* itself. The Marketplace **resource ID** (the UUID) identifies your theme's *store page* on panomc.com. They are separate things, and the release automation needs the UUID.
:::

### 2. Upload versions — manually or automatically

The simple way: open your resource page and upload the `.zip` from `bun run package` as a new version whenever you release.

The better way is to automate it with **`semantic-release-pano`**, so every push publishes to GitHub *and* the Marketplace in one go:

1. On panomc.com, create an **API token** under **Profile → Security → API tokens**, and add it to your GitHub repository as a secret named `PANO_TOKEN` (**Settings → Secrets → Actions**).
2. Add `semantic-release-pano` to your release configuration (`.releaserc.json`), pointing at your resource ID:

```json
["semantic-release-pano", {
  "resourceId": "YOUR-RESOURCE-UUID",
  "file": "my-theme-${version}.zip",
  "panoVersion": "1.0.0",
  "useGitHubLink": true,
  "repositoryUrl": "https://github.com/YourName/my-theme.git"
}]
```

With `useGitHubLink`, free themes are not uploaded twice: the Marketplace links to the `.zip` already attached to your GitHub release (so the GitHub release step must run *before* this plugin). Without it, the plugin uploads the file to the Marketplace directly — which is what you want for premium themes.

## Making your theme premium

A premium theme is one people pay for on panomc.com, protected so it only runs on servers that actually purchased it.

To make a theme premium, set one field in `manifest.json`:

```diff
- "premium": false
+ "premium": true
```

That is the only source change. The protection is wired up for you.

### What the build needs

A premium build has to fetch a public key so it can bind the license to your package. You provide it with an environment variable at build time:

- `PANO_LICENSE_SERVER` — tells the build which server to fetch the key from (for example `prod`). The reusable workflow already sets this based on your branch, so normally you do not touch it.
- `PANO_LICENSE_PUBLIC_KEY` — alternatively, you can store the key itself as a CI secret. When set, the build reads the key directly and makes no network calls. Add it under **Settings → Secrets → Actions** in your repository.

For a free theme (`"premium": false`), these variables are ignored — they do no harm.

### How the protection works (in plain words)

- When you make a production build, Pano computes the SHA-256 fingerprint of your package and **binds the license to that exact fingerprint**.
- To use your premium theme, a server must have a **panomc.com account connected** in its panel, and that account must have purchased your theme. Pano checks this both when the theme is **installed** and while it **runs**.
- If the package is tampered with or repacked, its fingerprint no longer matches the licensed one, and Pano rejects it.
- During `bun run dev` the license gate is **turned off**, so you can develop freely without any license at all. Protection only applies to production builds.

::: warning No protection is absolute
Be honest with yourself about what this system can and cannot do: **no license system can protect code 100%**. The goal here is to make unauthorized use as hard as possible for the vast majority of users — not to make it impossible. Like every piece of software, any code that ends up in the end user's hands is inherently exposed: someone sufficiently determined and skilled can always take it apart. This is true of every DRM ever made, not just Pano's. Price and support your theme with that reality in mind.
:::

::: warning Keep versions moving via releases
A premium license is issued per **version + package**. If you edit a `.zip` that was already released, its fingerprint changes and it will no longer be licensed. Always ship changes as a **new release** through the normal flow above — never hand-edit a released `.zip`.
:::

## Where to next

- **[Building & Packaging](/theme/packaging/)** — the build, check, and package steps in detail.
- **[Localization](/theme/localization/)** — translate your theme into other languages.
