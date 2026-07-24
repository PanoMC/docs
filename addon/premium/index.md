# Premium Addons & Licensing

This page shows you how to sell your addon on the official Pano Marketplace and have Pano make sure it only runs on servers that actually paid for it.

Selling works through the exact same release flow as a free addon, plus two extra pieces: a **build-time license key** embedded in your **jar** (the single compiled file your addon ships as), and a **runtime license check** in your code. In other words: when you compile your addon you include a small verification key file inside it (that is the *build-time* part), and when the addon launches it uses that key to check the server paid for it (that is the *runtime* part). This is the full walkthrough that [Building & Publishing](/addon/publishing/#premium-listings) points to.

If you have not released a free addon yet, read [Building & Publishing](/addon/publishing/) first — everything there (the release build, versioning, release channels, `.releaserc.json`, creating the resource and API token) still applies. This page only adds the premium layer on top.

::: tip TL;DR — going premium is three small changes
Most of this page is background. The actual work is tiny:

1. **Add one build flag** (or one CI environment variable) so your jar is built with a license key — [Step 1](#step-1-embed-the-license-key-at-build-time).
2. **Keep the boilerplate's existing license check** — two short methods that a fresh `pano-boilerplate-plugin` already has — [Step 2](#step-2-add-the-runtime-license-check).
3. **Publish as a paid resource** — pick *paid* pricing and set `useGitHubLink: false` — [Step 3](#step-3-publish-as-a-paid-resource).

Then [test it yourself](#test-it-yourself). Everything under [How it works under the hood](#how-it-works-under-the-hood) is optional reading.
:::

::: warning No protection is absolute
Be honest with yourself about what this system can and cannot do: **no license system can protect code 100%**. The goal here is to make unauthorized use as hard as possible for the vast majority of users — not to make it impossible. Like every piece of software, any code that ends up in the end user's hands is inherently exposed: someone sufficiently determined and skilled can always take it apart. This is true of every DRM ever made, not just Pano's. Price and support your addon with that reality in mind.
:::

## Step 1 — Embed the license key at build time

The premium build accepts a few extra inputs that put the public verification key inside your jar. These are options you pass **when you build** — on the command line, or as environment variables in your automated build — **not** something you write into any file in your repo (see [Manifest Configuration → Premium build properties](/addon/manifest/#premium-build-properties)).

If you pass **none** of them, your addon builds as a normal **free** jar and the runtime check does nothing at all (a "no-op") — so the same source can ship free or premium with no code changes.

::: tip You never mark an addon "premium" in a config file
An addon is premium **purely because you built it with a license key** — nothing else. Build with a key → premium; build without → free, and no code changes in between. You do not edit any config file, and there is no `premium` field anywhere (not in `gradle.properties`, not in the jar manifest). *(Themes work differently — they flip `"premium": true` in `manifest.json` — but that does not apply to addons.)*
:::

A *Gradle property* is an option you append to the build command, for example `./gradlew build -PlicenseServer=prod`. An *environment variable* is a named value your CI (your automated build, e.g. on GitHub Actions) sets before running the build. Here are all the inputs you can use:

| Input | Kind | What it does |
|---|---|---|
| `-PlicenseServer=dev\|prod\|<url>` | Gradle property | Fetches the public key from a license server. Pass **one of** `dev`, `prod`, or a full custom URL — `dev` → `https://api-dev.panomc.com`, `prod` → `https://api.panomc.com`. **Recommended** — nothing secret to store. |
| `PANO_LICENSE_SERVER` | Environment variable | Same as `-PlicenseServer`, for CI (set it on the Gradle build step). Used when the property is unset. |
| `-PpanoLicensePublicKey=<base64>` | Gradle property | Supplies the key directly (Base64 or PEM — two common text encodings for a key; you would get the value from panomc.com, and most people never need this option), skipping any network call. |
| `PANO_LICENSE_PUBLIC_KEY` | Environment variable | Same as `-PpanoLicensePublicKey`, for CI. Used when the property is unset. |

**Which input wins?** The build uses the **first** of these that is set:

1. `-PpanoLicensePublicKey` — a key you supplied directly on the command line
2. `PANO_LICENSE_PUBLIC_KEY` — the same, from an environment variable
3. `-PlicenseServer` — fetch the key from a license server
4. `PANO_LICENSE_SERVER` — the same, from an environment variable

If **none** of them is set, the embedded key is empty and the jar is **free**.

The simplest premium build is:

```bash
./gradlew build -PlicenseServer=prod
```

::: tip You should now see
A jar in `build/libs/` built with panomc.com's public key baked in. There is no separate "premium" flag to set or config file to eyeball — the build inputs you passed (Step 1) are what decide whether the verification key was embedded, and with it the license check. The reliable way to confirm the premium behavior actually works is to run it end to end in [Test it yourself](#test-it-yourself).
:::

For CI (your automated build on GitHub Actions), set `PANO_LICENSE_SERVER` on the Gradle build step of your workflow — for example `dev` on the `dev` branch and `prod` on `main` — so a push produces a correctly-keyed jar. The stock `pano-boilerplate-plugin` release workflow does **not** set it: its build step is a plain `./gradlew build`, so out of the box a push produces a **free** jar. Adding that environment variable to the build step is the one change a premium fork makes (the boilerplate's `gradle.properties` calls this out explicitly).

Concretely, that means adding an `env:` block to the build step. The snippet below is illustrative — match it to your own workflow's build step:

```yaml
      # your existing release workflow, build step
      - name: Build
        env:
          PANO_LICENSE_SERVER: ${{ github.ref_name == 'main' && 'prod' || 'dev' }}
        run: ./gradlew build
```

::: tip You should now see
A push to your release branch now produces a **premium** jar instead of a free one (`prod` on `main`, `dev` on your dev branch).
:::

::: tip The key is public — the flag choice is about convenience, not secrecy
The embedded value is panomc.com's **public** verification key, so there is nothing sensitive to hide (this is unlike your Marketplace API token, which must stay a secret). Prefer `-PlicenseServer` / `PANO_LICENSE_SERVER` so the build always fetches the current key; use `-PpanoLicensePublicKey` / `PANO_LICENSE_PUBLIC_KEY` only when your CI cannot reach the license server at build time.
:::

::: warning Always do a clean full build for a premium release
As with any release jar, never build a premium release with `-Pnoui` — that flag skips rebuilding the addon's web UI, so an old copy of the UI can end up inside the jar (see the callout in [Building & Publishing](/addon/publishing/#the-release-build)). The license flag is a **separate concern**: add it to a normal, clean `./gradlew build`, not to a `-Pnoui` dev build.
:::

## Step 2 — Add the runtime license check

The check lives in your plugin class and uses `PluginLicenseClient` from the boilerplate.

**If you started from the boilerplate, this code already exists — your only job is to confirm it's still there.** A fresh `pano-boilerplate-plugin` is already license-ready and simply behaves as free until you build it with a key (Step 1). Check that `onStart()` still begins with `licenseClient.requireValidLicense()`. If you removed it, or you are adding premium to an existing addon, add the following:

```kotlin
class ShoutboxPlugin : PanoPlugin() {
    private val licenseClient by lazy { PluginLicenseClient(this) }

    override suspend fun onStart() {
        licenseClient.requireValidLicense()  // no-op for free builds; throws if premium & invalid
        // ... the rest of your startup
    }

    override suspend fun verifyLicense() {
        licenseClient.requireValidLicense()  // backs the panel's "Refresh license" button
    }
}
```

Two bits of Kotlin syntax in that snippet, in case they are new to you: `by lazy { ... }` just means "create this object the first time it is used, not before," and `suspend` marks a function that Pano runs as a coroutine (its own way of handling concurrency). Both are load-bearing — **copy the signatures exactly.**

- **`requireValidLicense()`** is the gate. On a premium jar it fetches, verifies, and cross-checks the license; on a free jar (no embedded key) it returns immediately. Call it at the **top** of `onStart()` so that if the license is invalid, the error it throws stops your addon immediately, before any of your startup code runs.
- **`verifyLicense()`** is an overridable `PanoPlugin` hook (a method Pano provides for you to fill in) that the panel's *Refresh license* button calls **after the host has fetched a fresh JWT** — so the panel reflects the real, current outcome instead of a stale one. You do not need any custom logic here — just call the same `requireValidLicense()` inside it, as shown.

When `requireValidLicense()` fails it throws `LicenseRequiredException`. PF4J (the plugin engine inside Pano — nothing you interact with directly) then marks **only your addon** as failed, and the *host* (the Pano platform your addon is installed into) records the reason; Pano core and every other addon keep running. Keeping the platform unbreakable by one misconfigured premium addon is deliberate — the operator can still reach their panel to resolve it.

### Extra checks that make cracking harder: `LicenseGuard` (optional)

*Defense in depth* just means not relying on one single check. A cracker (someone trying to pirate your addon) can try to delete the one `requireValidLicense()` call in `onStart`. To make that harder, the boilerplate also ships `LicenseGuard`, which lets you add one-line re-checks to the code that runs most often — your API endpoints (route handlers), scheduled jobs, WebSocket handlers. These re-checks are nearly free because they reuse the license that was already fetched instead of contacting panomc.com every time:

```kotlin
override suspend fun handle(context: RoutingContext): Result {
    LicenseGuard.assert(plugin)
    // ... business logic
}
```

Here `plugin` is your `PanoPlugin` instance — pass whichever variable holds it (for example, an endpoint that was handed the plugin when it was created — "constructor injection" is just the framework passing the plugin into the endpoint's constructor for you). If the license is not valid, `assert` stops the call the same way the main check does (by throwing) rather than letting the request through. `LicenseGuard.assert(plugin)` reuses the cached license and only re-fetches if it expired, so the cost is negligible — but the more places it appears, the more edits a cracker needs to make.

This step is optional and can wait until your addon actually sells.

## Step 3 — Publish as a paid resource

Publishing a premium addon uses the **same three steps** as a free one — create the resource, create an API token, let the automation upload versions — from [Publishing on the official Pano Marketplace](/addon/publishing/#publishing-on-the-official-pano-marketplace). Two things differ:

**1. Price it as paid.** On the *Create resource* form on panomc.com, choose the **paid** pricing option instead of free. As always for addons, your Marketplace `resourceId` is exactly your `pluginId` — see the [resource ID tip](/addon/publishing/#publishing-on-the-official-pano-marketplace). (Themes get a random generated ID called a UUID, but addons just reuse their `pluginId`.)

**2. Upload the jar directly — do not use `useGitHubLink`.** Free addons set `useGitHubLink: true` to avoid a duplicate upload. Premium addons must let the Marketplace hold the **official master copy of the jar** and record its SHA-256 (its fingerprint — see [How it works under the hood](#how-it-works-under-the-hood)), because that recorded hash is what every buyer's license binds to. In your `.releaserc.json` Pano plugin config, drop `useGitHubLink` (or set it to `false`).

The block below is shown as a **diff**: the line starting with `-` is the one you **remove**, the line starting with `+` is the one you **add**, and everything else — including the `...` placeholder, which stands for your existing config left unchanged — stays exactly as you already have it:

```diff
 ["@PanoMC/semantic-release-pano", {
   "file": "build/libs/pano-plugin-shoutbox-${version}.jar",
   "panoVersion": "1.0.0",
-  "useGitHubLink": true,
+  "useGitHubLink": false,
   "repositoryUrl": "https://github.com/YourName/pano-plugin-shoutbox.git",
   "configs": [ ... ]
 }]
```

Everything else in that config — the two channel entries, `tokenVar`, `branches` — is unchanged from the [`.releaserc.json` walkthrough](/addon/publishing/#the-releaserc-json-walkthrough).

### What happens when a buyer runs it

When a buyer's Pano starts your premium addon, panomc.com issues a license token **only if** that connected account has purchased your resource **and** the running jar's SHA-256 matches the hash recorded for that version. (You, as the resource author, always pass this check — which is what lets you test your own paid addon in [Test it yourself](#test-it-yourself).) That is why a directly-uploaded, hash-recorded jar matters: it is the fingerprint the whole check hangs on.

## What buyers see in their panel

If a premium addon cannot license itself, the operator is not left guessing — the panel surfaces it in three places: a **per-addon status badge** on **Panel → Addons**, a **License card** on the addon detail page, and a **banner on the dashboard**. The common statuses and their fixes:

| Status | Meaning | Fix |
|---|---|---|
| `LICENSED` | Valid license, addon running. | Nothing to do. |
| `NO_PURCHASE` | Account is connected but has not bought this addon. | Buy it on panomc.com (the card links out). |
| `NOT_CONNECTED` | No panomc.com account connected to this Pano. | Connect the account in panel settings. |
| `NETWORK_ERROR` | panomc.com was unreachable at check time. | Restore connectivity, then click **Refresh**. |
| `JAR_TAMPERED` | The running jar's hash does not match the licensed one. | Re-download the addon from panomc.com. |

There is no Pano-side licensing configuration for the operator to get wrong — premium addons handle their own check, and an unlicensed one simply stays disabled while the rest of the site runs.

## Test it yourself

Before you charge anyone, run the whole loop against your own account. You always pass the purchase check for your own resource, so this is the intended way to verify a premium addon end to end:

1. **Publish a version** through your normal release flow to a pre-release channel (for example your `dev`/alpha channel). Publishing is what records the jar's SHA-256 hash on the Marketplace — without a recorded hash there is nothing for the license to bind to.
2. **Get that exact jar onto a local Pano.** Either build the same version with the matching license server — `./gradlew build -PlicenseServer=dev` for the dev channel — or download the published jar. It must be byte-for-byte the version whose hash was recorded in step 1.
3. **Connect your panomc.com author account** to your local Pano in the panel settings (the same "connect account" action a real buyer uses).
4. **Start the addon.**

::: tip You should now see
The `LICENSED` badge on **Panel → Addons**, and the addon running normally. If you instead see `NOT_CONNECTED`, finish step 3; `NO_PURCHASE` on your own resource usually means the connected account is not your author account.
:::

Optionally, prove the tamper check works: change a single byte in the jar and start it again — the hash no longer matches and the status flips to `JAR_TAMPERED`.

## How it works under the hood

Everything below is background. You do not need it to ship a premium addon, but it explains *why* the steps above are enough.

### A 30-second crypto primer

Pano uses **asymmetric signing**. panomc.com holds a secret **private key** that can create signed tokens; everyone else gets a matching **public key** that can only *check* those signatures, never create them. That is why it is safe to bake the public key into your jar — it can verify, but it cannot forge. **RS256** is just the name of this signing algorithm.

A few terms this page uses:

- **Public key / private key** — the pair above. The public key can verify; the private key (kept by panomc.com) can sign. That is why a "public" key is safe to hand out.
- **JWT** — a small signed text token that carries *claims* (facts) like "this server bought this addon." Anyone with the public key can verify it, but nobody without the private key can forge it. To **forge** a token means to mint a fake one that still passes the signature check — asymmetric signing is what makes that practically impossible.
- **SHA-256 hash** — a fingerprint computed from a file's exact bytes. Change even one byte and the fingerprint changes completely.
- **Host** — the Pano platform your addon is installed into (the buyer's self-hosted server).

### How the license system works (in plain words)

A premium addon carries a copy of panomc.com's public key, baked in at build time. From there:

1. When Pano starts your addon, the addon asks the *host* to fetch a short-lived (**1 hour**) signed license token — a JWT — from **panomc.com**.
2. The addon then **re-verifies that token itself**, using its own embedded public key — it does not trust the host to have done so.
3. The token is **bound** to four things: **this exact Pano install** (identified through its connected panomc.com account), **your resource**, **the addon version**, and **the SHA-256 hash of the running jar**. A token issued for one server, version, or jar is worthless anywhere else.
4. If the check passes, the addon starts normally. If it fails, the addon **refuses to start** — but Pano itself keeps running, and the failure is surfaced in the panel so the operator can fix it.

The important design point, in plain words: **the check that matters happens inside your addon, not inside Pano.** Pano core is open source and can be forked or patched, so the addon never trusts the host to have checked the license — it re-verifies the JWT signature itself, with its *own* embedded public key. That is what "your plugin code is the security boundary" means. Even a tampered host cannot forge a token, because it does not have panomc.com's private key.

### What `requireValidLicense()` actually checks

You never call any of this yourself — it is what happens **inside** the one method you already added in Step 2, listed here for the curious. In order, it:

1. Returns immediately if the addon is not premium (no embedded key).
2. Asks the host (`getLicenseManager()`) to fetch a license for `resourceId = pluginId` and the built-in version.
3. **Re-verifies the JWT signature** with the embedded public key, against the expected issuer — the identity the token claims to come from, i.e. panomc.com (`getLicenseJwtIssuer()`). This is the real security boundary.
4. Confirms the token's resource matches your `pluginId`, the version matches, and the **jar SHA-256 matches the running jar** (`getOwnJarSha256()`).
5. Confirms the token has not expired, then caches it.

### Fingerprinting and version binding

For addons, the license fingerprint is the **SHA-256 of the jar**. The token carries that hash, and at runtime your addon compares it against the hash of the jar it is actually running (`getOwnJarSha256()`). If someone repacks or patches the jar, the hash no longer matches the licensed one and the check fails with a tamper status.

::: warning Keep versions moving via releases
A license is issued per **version + jar**. If you **patch or hand-edit a jar that was already released**, its hash no longer matches the one recorded for that version, so it will no longer be licensed. Always ship changes as a **new release** through the normal flow; that is the only correct path. A fresh hash on every release is also a feature: it invalidates any crack work done against the previous build.
:::

## Hardening notes

The system already layers several defenses — per-install/version/jar binding, the plugin-side signature re-check, short 1-hour tokens, and scattered `LicenseGuard` calls. You can raise the bar further:

- **Sprinkle `LicenseGuard.assert(plugin)` widely** so no single removed check disables the gate.
- **Ship every fix as a new release**, since each new jar hash forces fresh crack effort.
- **Obfuscate your jar.** Obfuscation renames your compiled classes and methods to meaningless symbols, so a cracker cannot easily find the license code to remove it. [ProGuard](https://www.guardsquare.com/proguard) is the standard free tool. This is optional and can wait until your addon actually sells.

But keep the honesty warning at the top of this page in mind: these measures raise the cost of cracking for the overwhelming majority of users; they do not make it impossible.

## Where to next

- **[Building & Publishing](/addon/publishing/)** — the release build, versioning, and the full Marketplace publishing flow this page builds on.
- **[Manifest Configuration](/addon/manifest/#premium-build-properties)** — the premium build properties in the context of the rest of `gradle.properties`.
- **[Backend Development](/addon/backend/)** — where your `PanoPlugin` class, endpoints, and the `onStart` lifecycle live.
- Themes use an analogous whole-zip fingerprint scheme — see [premium themes](/theme/publishing/#how-the-protection-works-in-plain-words).
