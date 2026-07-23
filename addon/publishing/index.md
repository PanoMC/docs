# Building & Publishing

This page takes you from an addon that works on your machine to an addon that server owners can install. You will make one release build, learn how versions are chosen for you, and publish to the official Pano Marketplace on panomc.com — for free, or (with a little more wiring) as a paid addon.

"Publishing" here means turning your addon into a **release jar** (a `.jar` — a single zip-like file that holds your whole compiled addon) and putting it where others can get it.

Examples on this page use the **Shoutbox** addon from [Getting Started](/addon/getting-started/) — a small addon whose plugin ID is `pano-plugin-shoutbox`. Wherever you see `shoutbox` or `pano-plugin-shoutbox`, substitute your own addon's `pluginId`.

If you have not built your addon yet, start with [Getting Started](/addon/getting-started/) and [Backend Development](/addon/backend/).

## Before you start

Have these four things ready. The rest of the page assumes them:

- **Your addon already builds locally** — running `./gradlew build` in your addon's folder finishes without errors. If it does not, go back to [Getting Started](/addon/getting-started/) and [Backend Development](/addon/backend/) first.
- **Your addon's code lives in a GitHub repository.**
- **GitHub Actions is enabled** for that repository (it is on by default for new repositories).
- **You have a free account on [panomc.com](https://panomc.com).**

## First release checklist

The rest of this page explains each part in detail, but here is the whole job in order, so you always know what is left. Each step links to its full explanation, and ends with how to tell it worked.

Most of the work is a one-time setup (steps 2–6). After that, every future release is just step 7 — commit and push.

1. **Build once locally** to confirm a jar is produced. → [The release build](#the-release-build). *Done when you see `BUILD SUCCESSFUL` and a jar in `build/libs/`.*
2. **Create your Marketplace resource** on panomc.com. → [Create the resource](#_1-create-the-resource). *Done when your addon has a page on panomc.com with an empty version list.*
3. **Create an API token** and store it as a repository secret named `PANO_PROD_TOKEN` (for the `main` branch). → [Create an API token](#_2-create-an-api-token). *Done when the secret is listed in your repo settings.*
4. **Create a `TOKEN_GITHUB` secret** (a GitHub Personal Access Token). Miss this and every release fails at the very first step. → [Required: a `TOKEN_GITHUB` secret](#required-a-token-github-secret).
5. **Add `.releaserc.json`** with the Pano publishing plugin, and replace the placeholders in it. → [The `.releaserc.json` walkthrough](#the-releaserc-json-walkthrough).
6. **Add one install step to the workflow, in both jobs**, so the Pano publishing plugin is available. Miss this and the release fails with `Cannot find module @PanoMC/semantic-release-pano`. → [The Pano plugin must be installed in the workflow](#the-pano-plugin-must-be-installed-in-the-workflow).
7. **Commit with a [conventional-commit](https://www.conventionalcommits.org/) message and push** to `main`. → [Push and watch it publish](#_3-push-and-watch-it-publish). *Done when the Actions run shows a green check and the new version appears on your resource.*

## The release build

A release build compiles your Kotlin backend **and** builds and embeds the Svelte UI into the jar (the `.jar` — the single self-contained file you ship). That is a plain:

```bash
./gradlew build
```

Run this from your addon's root folder. Gradle is the build tool for the Kotlin side — think of `./gradlew build` as the `npm run build` of the JVM world, and `./gradlew` (the "Gradle wrapper") as a script in your project that runs the right Gradle version for you. You should see `BUILD SUCCESSFUL` after a minute or two.

The output lands in:

```
build/libs/pano-plugin-shoutbox-<version>.jar
```

Locally the `<version>` is always `local-build` (so the file is `pano-plugin-shoutbox-local-build.jar`). You should now see that file inside `build/libs/`. Real version numbers come from CI — **CI** (continuous integration) is the automated build GitHub runs on its own servers every time you push. See [Versioning](#versioning) below.

::: warning Release jars need the UI
**For a release, always run a plain `./gradlew build` — never add `-Pnoui`.** The `-Pnoui` flag skips the Bun/rollup UI build, and that can ship a broken addon in two different ways:

- **If you have never built the UI:** the jar ships with **no UI at all** — your addon loads with no panel or theme screens.
- **If an old full build left a `plugin-ui.zip` behind:** the jar silently bakes in that **stale** UI, so you ship an outdated interface without noticing.

If you want to be certain no old UI zip is reused, run `./gradlew clean build` (the `clean` task deletes previous build output first). `-Pnoui` is only for the fast backend-only dev loop (see [Getting Started](/addon/getting-started/#the-dev-loop)).
:::

The jar is fully self-contained: Kotlin backend, embedded UI bundle, locales, and `logo.png` all live inside it. There is nothing else to ship.

## Versioning

Every release has a version number (like `1.0.0`) so servers know when an update is available.

You do **not** bump the version by hand. Versions are decided from your commit messages, which must follow [Conventional Commits](https://www.conventionalcommits.org/) — a simple format where each commit starts with a word like `feat:` (a new feature), `fix:` (a bug fix), or `chore:` (housekeeping). These words drive both the next version number and the generated changelog. In a version like `1.2.3`, `1` is the **major**, `2` is the **minor**, and `3` is the **patch**. A `feat:` bumps the minor version, a `fix:` bumps the patch version, and a `feat:` with a `BREAKING CHANGE:` footer bumps the major version.

Four different names in this project sound alike but mean different things. This table is the one to keep straight:

| Name | Lives in | Who sets it | What it means |
|---|---|---|---|
| `version` | `gradle.properties` | CI, at release time | **Your addon's own version** (like `1.1.0`). Stays `local-build` in your working copy; never edit it by hand. |
| `pluginPanoVersion` | `gradle.properties` | You (leave it at `local-build`) | Copied into the jar manifest. CI does **not** touch it. |
| `pano-version` | the jar's manifest | comes straight from `pluginPanoVersion` | Just the baked-in copy of `pluginPanoVersion` inside the built jar. |
| `panoVersion` | `.releaserc.json` | You | The Pano platform version shown on your **Marketplace** listing (set in the config file below). |

::: warning Do not hand-edit versions
Leave both `version` and `pluginPanoVersion` in `gradle.properties` at `local-build`. At release time CI injects the real `version` (via `-Pversion` — the way Gradle accepts a value from the command line, `-Pversion=1.1.0`) from your commit history. Hand-bumping it, or editing the tag (the git tag semantic-release creates for each release), breaks the automation. CI does **not** inject `pluginPanoVersion`; the manifest's `pano-version` attribute stays `local-build`. The Pano version *advertised on the Marketplace* is a separate value, set by the `panoVersion` option in `.releaserc.json` (below). Let your commit messages drive the version. See [Manifest Configuration](/addon/manifest/) for details.
:::

## Release channels

The boilerplate is set up for two release channels, decided by which branch you push to:

| Branch | Channel | Version looks like |
|---|---|---|
| `dev` | Prerelease | `1.1.0-dev.3` |
| `main` | Stable | `1.1.0` |

A **prerelease** is a test build you can try before a real release. The `-dev.3` suffix means "the 3rd dev build on the way to `1.1.0`". Server owners installing the stable channel never see these; a prerelease is for you to rehearse a release safely.

::: tip What GitHub Actions is (read this first)
**GitHub Actions** runs scripts on GitHub's own servers whenever you push. The script is a YAML file in your repository — here `.github/workflows/release.yml`. One file contains one or more **jobs**; each job is a list of **steps**; a step runs a command or a prebuilt action. That file is what does everything below: builds your jar and publishes it.
:::

Pushing to `dev` or `main` triggers the GitHub Actions workflow that ships with `pano-boilerplate-plugin` at `.github/workflows/release.yml`. That workflow figures out the next version from your commits, runs `./gradlew build` (a real UI build — not `-Pnoui`), and then runs **semantic-release** — a tool that reads your commit messages, decides the next version number, writes the changelog, and publishes the release, all automatically.

**One edit is required to publish to the Marketplace.** Out of the box the boilerplate workflow runs semantic-release *without* the Pano publishing plugin installed. To also publish to the Marketplace, you must add one install step to the workflow — this is spelled out under [The Pano plugin must be installed in the workflow](#the-pano-plugin-must-be-installed-in-the-workflow) below, and it is step 6 of the [checklist](#first-release-checklist). Beyond that one edit and the secrets it expects, you do not touch the workflow for a normal addon.

The trigger at the top of that workflow is simply:

```yaml
on:
  push:
    branches: ['dev', 'main']
```

This is already in the boilerplate — you do not change it. It is shown so you know that **pushing to `dev` or `main` is the entire release trigger**: there is no separate "publish" button.

## The `.releaserc.json` walkthrough

`.releaserc.json` is where semantic-release is configured. This file mentions an API token and a Marketplace resource that you create in the [next section](#publishing-on-the-official-pano-marketplace) — that is fine. Read this walkthrough to understand the file, set it up, then create those things after.

The boilerplate ships a `.releaserc.json` that creates the GitHub release with the jar attached. To also publish to the Marketplace, you add the `@PanoMC/semantic-release-pano` plugin.

Three names here all contain the word "release" — keep them apart:

- **`semantic-release`** — the tool itself.
- **`@semantic-release/commit-analyzer`, `@semantic-release/release-notes-generator`, `@semantic-release/github`** — standard, off-the-shelf plugins for that tool.
- **`@PanoMC/semantic-release-pano`** — the one Pano-specific plugin you add, which does the Marketplace publish.

In the `plugins` list below, each entry is either a plugin name on its own, or a `[name, options]` pair — a two-item array of the plugin name plus its settings. Here is the complete file for Shoutbox — adapted 1:1 from the real `pano-plugin-faq` release config:

```json
{
  "branches": [
    { "name": "dev", "prerelease": true },
    "main"
  ],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    ["@semantic-release/github", {
      "assets": [
        { "path": "build/libs/*.jar", "label": false },
        { "path": "LICENSE", "label": false }
      ]
    }],
    ["@PanoMC/semantic-release-pano", {
      "file": "build/libs/pano-plugin-shoutbox-${version}.jar",
      "panoVersion": "1.0.0",
      "useGitHubLink": true,
      "repositoryUrl": "https://github.com/YourName/pano-plugin-shoutbox.git",
      "configs": [
        {
          "resourceId": "pano-plugin-shoutbox",
          "panoUrl": "https://api-dev.panomc.com",
          "tokenVar": "PANO_TOKEN",
          "branches": ["dev"]
        },
        {
          "resourceId": "pano-plugin-shoutbox",
          "panoUrl": "https://api.panomc.com",
          "tokenVar": "PANO_PROD_TOKEN",
          "branches": ["main"]
        }
      ]
    }]
  ],
  "repositoryUrl": "https://github.com/YourName/pano-plugin-shoutbox.git"
}
```

::: tip Replace these placeholders
Before this file works, replace the example values with your own:

- `YourName` (**2 places** — both `repositoryUrl` lines) → your GitHub username or organization.
- `pano-plugin-shoutbox` (**5 places** — the `file` path, both `resourceId` values, and inside both `repositoryUrl` lines) → your own `pluginId`.

The `file` path must contain your `pluginId` **exactly**, or the release fails much later with a confusing "file not found". And yes, `repositoryUrl` appears **twice** on purpose (once inside the Pano plugin options, once at the top level) — set your repo URL in **both**.
:::

Field by field:

| Field | What it does |
|---|---|
| `commit-analyzer` and `release-notes-generator` | The first two entries in `plugins`. Standard semantic-release plugins — leave them exactly as-is. |
| `@semantic-release/github` `assets` | Attaches your `build/libs/*.jar` (and `LICENSE`) to the GitHub release. **Keep the plugins in this order — the GitHub plugin must run before the Pano plugin**, so the jar is already attached when `useGitHubLink` needs it. (`"label": false` just keeps each file's own name as its download label — leave it.) |
| `file` | Path to the built jar. `${version}` is substituted with the release version. |
| `panoVersion` | The Pano platform version your addon is built and tested against (for example `1.0.0`) — this is the value shown on your Marketplace listing. It is **not** your addon's own version. |
| `useGitHubLink` | `true` = do not re-upload the jar; instead point the Marketplace at the jar already attached to the GitHub release (plus its SHA-256 hash — a fingerprint so the download can be verified). Ideal for free addons — no duplicate upload. Premium addons upload the jar directly instead (premium: set `useGitHubLink: false`; see [Premium Addons & Licensing](/addon/premium/)). |
| `configs[]` | One entry per channel. Each says **which Marketplace to publish to** and **with which token**, scoped by `branches`. |
| `resourceId` | Your Marketplace resource — for addons this is your `pluginId` (see below). |
| `panoUrl` | The Marketplace API: `https://api-dev.panomc.com` for the `dev` channel, `https://api.panomc.com` for `main`. |
| `tokenVar` | Name of the GitHub secret holding the API token: `PANO_TOKEN` for dev, `PANO_PROD_TOKEN` for production. |
| `branches` | Restricts a config to one channel, so a `dev` push never touches the production Marketplace (and a missing `PANO_PROD_TOKEN` won't fail a `dev` build). |

::: tip Why two `configs` — and what the "dev Marketplace" is
`api-dev.panomc.com` is a separate **sandbox** Marketplace: it has its own resources, its own tokens, and its own login, and nothing you publish there is ever seen by real server owners. Splitting by branch means you can rehearse a release on `api-dev.panomc.com` from your `dev` branch, then ship the exact same code to the real `api.panomc.com` from `main`.

**If you are publishing your first addon, keep it simple: publish only to `main`.** Delete the `dev` config entry (and the `{ "name": "dev", "prerelease": true }` branch), and you only need one token, `PANO_PROD_TOKEN`. Add the dev sandbox later if you ever want a rehearsal channel.
:::

### The Pano plugin must be installed in the workflow

`@PanoMC/semantic-release-pano` is **not** published to npm and is not a boilerplate dependency, so listing it in `.releaserc.json` is not enough on its own — semantic-release will fail with *"Cannot find module @PanoMC/semantic-release-pano"*.

::: warning This is the one required workflow edit
You must add this install step to **both** jobs in `.github/workflows/release.yml` — the version dry-run job (`get-next-version`) and the release job (`build-and-release`) — placed **before** each job's `semantic-release` step:

```yaml
- run: npm install -D git+https://github.com/PanoMC/semantic-release-pano.git
```

(`-D` = install it as a dev dependency; the `git+` URL installs the plugin straight from GitHub because it is not on npm. This one step uses `npm`/`npx` even though the rest of the project uses Bun — that is expected here.)

For example, in the release job it goes right before the existing `Release` step:

```yaml
      # add this line...
      - run: npm install -D git+https://github.com/PanoMC/semantic-release-pano.git

      # ...before the step already in the file:
      - name: Release
        env:
          GITHUB_TOKEN: ${{ secrets.TOKEN_GITHUB }}
        run: npx semantic-release@24.2.6
```

Do the same in the dry-run job, before its `npx semantic-release --dry-run` step. If you add it to only one job, the run fails on the other with `Cannot find module @PanoMC/semantic-release-pano` — that error means you missed one of the two jobs. The `pano-plugin-faq` workflow this config is copied from has exactly this step.
:::

## Publishing on the official Pano Marketplace

The Marketplace on [panomc.com](https://panomc.com) is where server owners discover and install addons straight from their panel. A **resource** is your addon's store listing on panomc.com. Publishing takes three steps: create the resource, create an API token, then let the automation upload versions. (A `TOKEN_GITHUB` secret is also required — see the box after step 2.)

### 1. Create the resource

1. Sign up (or log in) at **panomc.com**.
2. From your profile area, open **Create Resource** and choose the type **Plugin**.
3. Pick a category, fill in the title and description.
4. Choose the pricing: **free**, or **paid**. If you are just publishing a free addon, choose **free** — that is the whole of this page. Choosing **paid** adds a license step covered in [Premium Addons & Licensing](/addon/premium/).

You should now see your addon's page on panomc.com with an **empty version list** — the automation fills it in when you push.

::: tip Your addon's resource ID is your plugin ID
Your addon's Marketplace `resourceId` is **exactly your `pluginId`** — for Shoutbox that is `pano-plugin-shoutbox`. That is why the `configs[]` above use `"resourceId": "pano-plugin-shoutbox"` and not a random ID. (Themes are different — they use a random UUID — but addons do not.) The `pluginId` is the single identity Pano uses everywhere your addon touches the system; the full list is on [Manifest Configuration](/addon/manifest/).
:::

### 2. Create an API token

1. On panomc.com, open **Profile → Settings → API Tokens** and click **Create**.
2. Copy the token immediately — it is shown **only once**, in the modal right after creation.
3. In your GitHub repository, go to **Settings → Secrets and variables → Actions** and add the token as a **repository secret** (an encrypted value that only your Actions runs can read), named to match your `tokenVar`:
   - `PANO_PROD_TOKEN` for the `main` (production) channel — the one to set up first.
   - `PANO_TOKEN` for the `dev` channel, **only if** you kept the dev sandbox config. This is a *different* token, created on the separate `api-dev.panomc.com` sandbox — not the same value as `PANO_PROD_TOKEN`.

Your repo's **Settings → Secrets and variables → Actions** page should now list `PANO_PROD_TOKEN` (and `PANO_TOKEN` too, if you publish to `dev`).

::: warning Never commit a token
The API token grants publish rights to your resource. Store it only as a GitHub secret (or a local environment variable). Never put it in `.releaserc.json`, a commit, or any file in the repo.
:::

### Required: a `TOKEN_GITHUB` secret

The GitHub release itself needs a second secret, `TOKEN_GITHUB`, which the boilerplate workflow reads (as `secrets.TOKEN_GITHUB`) in several places, including the version dry-run — the rehearsal job that computes the next version without publishing anything. GitHub's built-in `GITHUB_TOKEN` is **not** exposed under that name, so you must create one yourself.

::: warning Without this, every release fails at the very first step
Create `TOKEN_GITHUB` as a **Personal Access Token (PAT)** — a token you generate under your own GitHub account:

1. On GitHub, go to your avatar → **Settings → Developer settings → Personal access tokens**.
2. Create a **classic** token with the **`repo`** scope (semantic-release needs it to create releases and push tags).
3. Copy it, then add it in your repository under **Settings → Secrets and variables → Actions** as a secret named exactly **`TOKEN_GITHUB`**.

Your repo's secrets list should now show `TOKEN_GITHUB`.
:::

::: tip Prefer GitHub's built-in token instead?
If you would rather not create a PAT, you can edit the workflow to read `secrets.GITHUB_TOKEN` (GitHub's automatic per-run token) instead of `secrets.TOKEN_GITHUB`. The PAT route above is the boilerplate's default and needs no workflow edit, so it is the recommended path.
:::

### 3. Push and watch it publish

With the resource created, both required secrets added, and `.releaserc.json` (plus the workflow install step) in place, publishing is just a commit with a [conventional-commit](https://www.conventionalcommits.org/) message and a push:

```bash
git push origin main    # or dev, if you kept the dev sandbox
```

Now open your repository's **Actions** tab. A run named after the workflow (**Pano Plugin Build**) should appear within a minute. It usually takes a few minutes to finish.

- **Green check** = released. Open your resource on panomc.com — the new version should be listed, and server owners will see the update in their panel under **Panel → Addons**.
- **Red X** = something failed. Click into the failing step to read the error. The two most common ones are:
  - `Cannot find module @PanoMC/semantic-release-pano` — you missed the install step in one of the two jobs (step 6 / the [install callout](#the-pano-plugin-must-be-installed-in-the-workflow)).
  - An auth failure in the very first step — a missing or wrong `TOKEN_GITHUB` secret (the [`TOKEN_GITHUB` box](#required-a-token-github-secret) above).

## Manual distribution

You do not have to use the Marketplace. Because the release jar is fully self-contained, anyone can install it directly:

- Attach the jar to a GitHub release and share the link, or
- Hand the `.jar` to a server owner to upload via **Panel → Addons → Upload**.

The difference the user sees: addons downloaded from the Marketplace are marked **verified**, while manually uploaded jars are not. For a public addon the Marketplace is strongly preferred — it gives you update delivery, a store page, and the verified badge for free.

## Premium listings

Selling your addon works through the same release flow, plus a build-time license key and a runtime license check baked into your code. The full walkthrough — embedding the key at build time, adding the runtime check, and wiring it into CI — lives in **[Premium Addons & Licensing](/addon/premium/)**. It builds directly on this page.

## Where to next

- **[Manifest Configuration](/addon/manifest/)** — the `gradle.properties` fields CI injects at release time.
- **[Localization](/addon/localization/)** — ship your addon in more than one language before you publish.
