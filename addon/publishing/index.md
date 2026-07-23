# Building & Publishing

Once your addon works locally, the next step is to turn it into a release jar and get it in front of server owners. This page covers the release build, how versions are decided for you, and how to publish to the official Pano Marketplace on panomc.com — for free, or (with a little more wiring) as a premium addon.

If you have not built your addon yet, start with [Getting Started](/addon/getting-started/) and [Backend Development](/addon/backend/).

## The release build

A release build compiles your Kotlin backend **and** builds and embeds the Svelte UI into the jar. That is a plain:

```bash
./gradlew build
```

The output lands in:

```
build/libs/pano-plugin-shoutbox-<version>.jar
```

Locally the `<version>` is always `local-build` (so the file is `pano-plugin-shoutbox-local-build.jar`). Real version numbers come from CI — see [Versioning](#versioning) below.

::: warning Release jars need the UI
Never use `./gradlew build -Pnoui` for a release. The `-Pnoui` flag skips the Bun/rollup UI build. If no `plugin-ui.zip` has ever been built, the jar ships **without** any UI and your addon loads with no panel or theme screens at all. Worse, if a previous full build left a `src/main/resources/plugin-ui.zip` behind (it is gitignored but stays in your working tree), a `-Pnoui` build bakes that **stale** zip into the jar — silently shipping an outdated UI that is easy to miss. Either way, always run a clean full `./gradlew build` for releases; `-Pnoui` is only for the fast backend-only dev loop (see [Getting Started](/addon/getting-started/#the-dev-loop)).
:::

The jar is fully self-contained: Kotlin backend, embedded UI bundle, locales, and `logo.png` all live inside it. There is nothing else to ship.

## Versioning

Every release has a version number (like `1.0.0`) so servers know when an update is available.

You do **not** bump the version by hand. Versions are decided from your commit messages, which must follow [Conventional Commits](https://www.conventionalcommits.org/) — a simple format where each commit starts with a word like `feat:` (a new feature), `fix:` (a bug fix), or `chore:` (housekeeping). These words drive both the next version number and the generated changelog. A `feat:` bumps the minor version, a `fix:` bumps the patch version, and a `feat:` with a `BREAKING CHANGE:` footer bumps the major version.

::: warning Do not hand-edit versions
Leave both `version` and `pluginPanoVersion` in `gradle.properties` at `local-build`. At release time CI injects the real `version` (via `-Pversion`) from your commit history — hand-bumping it, or editing the tag, breaks the automation. CI does **not** inject `pluginPanoVersion`; the manifest's `pano-version` attribute stays `local-build`. The Pano version *advertised on the Marketplace* is a separate value, set by the `panoVersion` option in `.releaserc.json` (below). Let your commit messages drive the version. See [Manifest Configuration](/addon/manifest/) for details.
:::

## Release channels

The boilerplate is set up for two release channels, decided by which branch you push to:

| Branch | Channel | Version looks like |
|---|---|---|
| `dev` | Prerelease | `1.1.0-dev.3` |
| `main` | Stable | `1.1.0` |

Pushing to either branch triggers the GitHub Actions workflow that ships with `pano-boilerplate-plugin` at `.github/workflows/release.yml`. That workflow figures out the next version from your commits, runs `./gradlew build` (a real UI build — not `-Pnoui`), and then runs semantic-release, which creates the GitHub release. The boilerplate workflow runs a **bare** `semantic-release`, so to also publish to the Marketplace you must add one step to the workflow that installs the Pano publishing plugin — see the callout in the next section. Beyond that one edit and the secrets it expects, you do not touch the workflow for a normal addon.

The trigger at the top of that workflow is simply:

```yaml
on:
  push:
    branches: ['dev', 'main']
```

## The `.releaserc.json` walkthrough

`.releaserc.json` is where semantic-release is configured. The boilerplate ships one that creates the GitHub release with the jar attached. To also publish to the Marketplace, add the `@PanoMC/semantic-release-pano` plugin. Here is the complete file for Shoutbox — adapted 1:1 from the real `pano-plugin-faq` release config:

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

::: warning The Pano plugin must be installed in the workflow
`@PanoMC/semantic-release-pano` is **not** published to npm and is not a boilerplate dependency, so listing it in `.releaserc.json` is not enough on its own — semantic-release will fail with *"Cannot find module @PanoMC/semantic-release-pano"*. Add an install step to **both** jobs in `.github/workflows/release.yml` (the version dry-run job and the release job), before their `semantic-release` step:

```yaml
- run: npm install -D git+https://github.com/PanoMC/semantic-release-pano.git
```

This is the one workflow edit a Marketplace-publishing addon needs; the `pano-plugin-faq` workflow this config is copied from has exactly this step.
:::

Field by field:

| Field | What it does |
|---|---|
| `@semantic-release/github` `assets` | Attaches your `build/libs/*.jar` (and `LICENSE`) to the GitHub release. This step runs **before** the Pano plugin so the asset exists when `useGitHubLink` needs it. |
| `file` | Path to the built jar. `${version}` is substituted with the release version. |
| `panoVersion` | The Pano platform version this release targets. |
| `useGitHubLink` | `true` = do not re-upload the jar; instead point the Marketplace at the jar already attached to the GitHub release (plus its SHA-256 hash). Ideal for free addons — no duplicate upload. Premium addons upload the jar directly instead. |
| `configs[]` | One entry per channel. Each says **which Marketplace to publish to** and **with which token**, scoped by `branches`. |
| `resourceId` | Your Marketplace resource — for addons this is your `pluginId` (see below). |
| `panoUrl` | The Marketplace API: `https://api-dev.panomc.com` for the `dev` channel, `https://api.panomc.com` for `main`. |
| `tokenVar` | Name of the GitHub secret holding the API token: `PANO_TOKEN` for dev, `PANO_PROD_TOKEN` for production. |
| `branches` | Restricts a config to one channel, so a `dev` push never touches the production Marketplace (and a missing `PANO_PROD_TOKEN` won't fail a `dev` build). |

::: tip Why two `configs`
Splitting by branch means you can rehearse a release on `api-dev.panomc.com` from your `dev` branch, then ship the exact same code to `api.panomc.com` from `main` — each with its own resource state and token. If you only publish to one Marketplace, keep just the `main` config.
:::

## Publishing on the official Pano Marketplace

The Marketplace on [panomc.com](https://panomc.com) is where server owners discover and install addons straight from their panel. Publishing there takes three steps: create the resource, create an API token, then let the automation upload versions.

### 1. Create the resource

1. Sign up (or log in) at **panomc.com**.
2. Open **Create Resource** and choose the type **Plugin**.
3. Pick a category, fill in the title and description.
4. Choose the pricing: **free**, or **paid** if you plan to sell it.

::: tip The resource ID is your plugin ID
Themes use a random UUID for their Marketplace resource ID, separate from their package `id`. **Addons do not.** Your addon's Marketplace `resourceId` is set to be **exactly your `pluginId`** — for Shoutbox that is `pano-plugin-shoutbox`. This is why the `configs[]` above use `"resourceId": "pano-plugin-shoutbox"` and not a UUID. The `pluginId` is the single identity used everywhere: the data-directory name, the permission-node prefix, the UI URL segment, and the Marketplace resource. See [Manifest Configuration](/addon/manifest/).
:::

### 2. Create an API token

1. On panomc.com, open **Profile → Settings → API Tokens** and click **Create**.
2. Copy the token immediately — it is shown **only once**, in the modal right after creation.
3. In your GitHub repository, go to **Settings → Secrets and variables → Actions** and add the token as a repository secret, named to match your `tokenVar`:
   - `PANO_TOKEN` for the `dev` channel,
   - `PANO_PROD_TOKEN` for the `main` channel.

::: warning Never commit a token
The API token grants publish rights to your resource. Store it only as a GitHub secret (or a local environment variable). Never put it in `.releaserc.json`, a commit, or any file in the repo.
:::

The GitHub release itself uses a separate token, `TOKEN_GITHUB`, which the boilerplate workflow reads (as `secrets.TOKEN_GITHUB`) in several places, including the initial version dry-run. GitHub's built-in `GITHUB_TOKEN` is **not** exposed under that name, so you must create a Personal Access Token and store it as a repository secret named `TOKEN_GITHUB` — otherwise every release run fails at the first semantic-release step. (Alternatively, edit the workflow to read `secrets.GITHUB_TOKEN` instead.)

### 3. Push and watch it publish

With the resource created, the token added as a secret, and `.releaserc.json` in place, publishing is just:

```bash
git push origin dev    # or main
```

The workflow runs, semantic-release computes the version, the GitHub release is created with the jar attached, and `@PanoMC/semantic-release-pano` registers that version on the Marketplace. Server owners will see the update in their panel under **Panel → Addons**.

## Manual distribution

You do not have to use the Marketplace. Because the release jar is fully self-contained, anyone can install it directly:

- Attach the jar to a GitHub release and share the link, or
- Hand the `.jar` to a server owner to upload via **Panel → Addons → Upload**.

The difference the user sees: addons downloaded from the Marketplace are marked **verified**, while manually uploaded jars are not. For a public addon the Marketplace is strongly preferred — it gives you update delivery, a store page, and the verified badge for free.

## Premium listings

Selling your addon works through the same release flow, plus a build-time license key and a runtime license check baked into your code. The full walkthrough — embedding the key at build time, adding the runtime check, and wiring it into CI — lives in **[Premium Addons & Licensing](/addon/premium/)**. It builds directly on this page; the extra license flags it uses (`-PlicenseServer`, `-PpanoLicensePublicKey`, and the `PANO_LICENSE_PUBLIC_KEY` environment variable) are also summarized under [Manifest Configuration](/addon/manifest/).

## Where to next

- **[Manifest Configuration](/addon/manifest/)** — the `gradle.properties` fields CI injects at release time.
- **[Localization](/addon/localization/)** — ship your addon in more than one language before you publish.
