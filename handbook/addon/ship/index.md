# Ship It

Shoutbox works on your machine: a table, an API, a widget, a panel page, and translations. Time to turn it into a real, installable addon — and put it in front of the world. This is the finish line.

Reference pages for depth: [Building & Publishing](/addon/publishing/) and [Premium Addons & Licensing](/addon/premium/).

## The whole job, in order

Most of this is a **one-time setup**. After that, every future release is just the last step — commit and push.

1. **Build once locally** to confirm a jar is produced.
2. **Create your Marketplace resource** on panomc.com.
3. **Add two GitHub secrets** — `PANO_PROD_TOKEN` and `TOKEN_GITHUB`.
4. **Add `.releaserc.json`** with the Pano publishing plugin.
5. **Add one install step** to the release workflow.
6. **Commit with a conventional-commit message and push** to `main`.

## Step 1 — the release build

A release build compiles your Kotlin backend **and** builds and embeds the Svelte UI into one self-contained jar. That's a plain:

```sh
./gradlew build
```

You should see `BUILD SUCCESSFUL` and a jar at `build/libs/pano-plugin-shoutbox-local-build.jar`. Locally the version is always `local-build`; real version numbers come from CI.

::: warning Release jars need the UI — never use `-Pnoui`
`-Pnoui` skips the UI build. For a release that ships a broken addon: either **no UI at all** (if you never built it) or a **stale UI** (if an old build left a `plugin-ui.zip` behind). `-Pnoui` is only for the fast backend-only dev loop. To be certain no old UI is reused, run `./gradlew clean build`.
:::

## Step 2 — versioning is automatic

Every release has a version like `1.0.0`. You do **not** bump it by hand. Versions come from your **[Conventional Commits](https://www.conventionalcommits.org/)** — each commit starts with a word like `feat:` (a feature), `fix:` (a bug fix), or `chore:` (housekeeping):

- `fix:` → bumps the **patch** (`1.0.0` → `1.0.1`)
- `feat:` → bumps the **minor** (`1.0.0` → `1.1.0`)
- `feat:` with a `BREAKING CHANGE:` footer → bumps the **major** (`1.0.0` → `2.0.0`)

Leave `version` in `gradle.properties` at `local-build` — CI injects the real number from your commit history. Hand-editing it breaks the automation.

::: tip Two release channels, chosen by branch
The boilerplate publishes a **prerelease** (`1.1.0-dev.3`) when you push to `dev`, and a **stable** release (`1.1.0`) when you push to `main`. Server owners only ever see stable. Publishing your first addon? Keep it simple and publish only to `main`.
:::

## Step 3 — create the Marketplace resource

The Marketplace on [panomc.com](https://panomc.com) is where server owners discover and install addons from their panel.

1. Sign up (or log in) at **panomc.com**.
2. Open **Create Resource** and choose the type **Plugin**.
3. Pick a category, fill in title and description.
4. Choose pricing: **free**, or **paid** (paid adds the premium step at the end).

You should now see your addon's page with an **empty version list** — the automation fills it in when you push.

::: tip Your resource ID *is* your plugin ID
For addons, the Marketplace `resourceId` is **exactly your `pluginId`** — `pano-plugin-shoutbox`. (Themes use a random UUID; addons do not.) That's why the config below uses `"resourceId": "pano-plugin-shoutbox"`.
:::

## Step 4 — add the two required secrets

In your GitHub repo, go to **Settings → Secrets and variables → Actions** and add:

- **`PANO_PROD_TOKEN`** — an API token from panomc.com (**Profile → Settings → API Tokens → Create**). It's shown only once; copy it immediately.
- **`TOKEN_GITHUB`** — a **Personal Access Token** (classic, with the `repo` scope) you generate under your GitHub **Settings → Developer settings**. The boilerplate workflow reads this in several places, including the version dry-run.

::: warning Miss `TOKEN_GITHUB` and every release fails at the very first step
GitHub's built-in `GITHUB_TOKEN` is **not** exposed under that name, so you must create the PAT yourself. And **never commit** the API token — store it only as a GitHub secret.
:::

## Step 5 — configure `.releaserc.json`

`.releaserc.json` is where the release tool (semantic-release) is configured. The boilerplate ships one that creates the GitHub release; to *also* publish to the Marketplace, add the `@PanoMC/semantic-release-pano` plugin. Here is the complete file for Shoutbox:

```json
{
  "branches": [{ "name": "dev", "prerelease": true }, "main"],
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

::: tip Replace the placeholders
Swap `YourName` (both `repositoryUrl` lines) for your GitHub username, and make sure `pano-plugin-shoutbox` (the `file` path and `resourceId`) is your own `pluginId`. Keep the plugins **in this order** — the GitHub plugin must run before the Pano plugin, so the jar is already attached when `useGitHubLink` needs it. `useGitHubLink: true` points the Marketplace at the jar already on your GitHub release instead of re-uploading it — ideal for a free addon.
:::

The full field-by-field walkthrough, plus how to add the optional `dev` sandbox channel, is in [Building & Publishing](/addon/publishing/#the-releaserc-json-walkthrough).

## Step 6 — install the Pano plugin in the workflow

`@PanoMC/semantic-release-pano` isn't on npm, so listing it in `.releaserc.json` isn't enough — semantic-release fails with *"Cannot find module @PanoMC/semantic-release-pano"* until you install it.

Add this one line to **both** jobs in `.github/workflows/release.yml` (the version dry-run job and the release job), **before** each job's semantic-release step:

```yaml
- run: npm install -D git+https://github.com/PanoMC/semantic-release-pano.git
```

::: warning Both jobs, or it fails on the one you missed
If you add it to only one job, the run fails on the other with that same "Cannot find module" error. This is the one required workflow edit — everything else in the boilerplate workflow you leave alone.
:::

## Step 7 — push and watch it publish

With the resource created, both secrets added, and `.releaserc.json` plus the workflow step in place, publishing is just a conventional-commit and a push:

```sh
git push origin main
```

Open your repo's **Actions** tab. A run named **Pano Plugin Build** appears within a minute and takes a few minutes to finish.

- **Green check** = released. Open your resource on panomc.com — the new version is listed, and server owners see the update under **Panel → Addons**.
- **Red X** = click into the failing step. The two most common errors are the "Cannot find module" one (you missed the install step in one job) and an auth failure at the first step (a missing or wrong `TOKEN_GITHUB`).

::: tip You can also distribute manually
Because the jar is fully self-contained, you can attach it to a GitHub release or hand it to a server owner to upload via **Panel → Addons → Upload**. Marketplace addons get a **verified** badge and automatic update delivery; manual jars don't — so the Marketplace is strongly preferred for a public addon.
:::

## Optional — sell Shoutbox as a premium addon

Want to charge for it? The release flow is the same, plus two small pieces: build the jar **with a license key** and keep the boilerplate's runtime license check. In short:

- Build with `./gradlew build -PlicenseServer=prod` (or set `PANO_LICENSE_SERVER` in CI) so panomc.com's public verification key is baked into the jar.
- Keep `licenseClient.requireValidLicense()` at the top of `onStart()` — a fresh boilerplate already has it, and it's a no-op on free builds.
- Price the resource **paid**, and set `useGitHubLink: false` so the Marketplace holds the master jar and records its SHA-256.

The full walkthrough — embedding the key, the runtime check, and testing it against your own account — is in [Premium Addons & Licensing](/addon/premium/).

::: warning No license system is absolute
No DRM protects code 100% — any code that reaches the end user can be taken apart by someone determined enough. The goal is to make unauthorized use hard for the vast majority, not impossible. Price and support your addon with that reality in mind.
:::

## You did it

Shoutbox went from a cloned template to a working addon — a database table, a JSON API, a permission, a home-page widget, a panel page, translations — installed on your own Pano and published on the Marketplace. That's the whole journey.

Where to go deeper, in the reference docs:

- **[Backend API Reference](/addon/backend-reference/)** — every backend extension point by name.
- **[Frontend API Reference](/addon/api-reference/)** — every hook, view slot, and SDK export.
- **[Localization](/addon/localization/)** and **[Premium](/addon/premium/)** — the full versions of the last two pages.

Happy building. 🚀

**Next: [Addon reference: Getting Started →](/addon/getting-started/)**
