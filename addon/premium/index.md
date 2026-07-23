# Premium Addons & Licensing

You can sell your addon on the official Pano Marketplace and have Pano enforce that it only runs on servers that actually paid for it. This is the full walkthrough that [Building & Publishing](/addon/publishing/#premium-listings) points to: selling works through the exact same release flow as a free addon, plus two extra pieces — a **build-time license key** embedded in your jar, and a **runtime license check** in your code.

If you have not released a free addon yet, read [Building & Publishing](/addon/publishing/) first — everything there (the release build, versioning, release channels, `.releaserc.json`, creating the resource and API token) still applies. This page only adds the premium layer on top.

::: warning No protection is absolute
Be honest with yourself about what this system can and cannot do: **no license system can protect code 100%**. The goal here is to make unauthorized use as hard as possible for the vast majority of users — not to make it impossible. Like every piece of software, any code that ends up in the end user's hands is inherently exposed: someone sufficiently determined and skilled can always take it apart. This is true of every DRM ever made, not just Pano's. Price and support your addon with that reality in mind.
:::

## How the license system works (in plain words)

A premium addon carries a copy of panomc.com's **RS256 public key**, baked in at build time. From there:

1. When Pano starts your addon, the addon asks the host to fetch a short-lived (**1 hour**) signed license token (an RS256 JWT) from **panomc.com**.
2. The addon then **re-verifies that token itself**, using its own embedded public key — it does not trust the host to have done so.
3. The token is **bound** to four things: **this exact Pano install**, **your resource**, **the addon version**, and **the SHA-256 hash of the running jar**. A token issued for one server, version, or jar is worthless anywhere else.
4. If the check passes, the addon starts normally. If it fails, the addon **refuses to start** — but Pano itself keeps running, and the failure is surfaced in the panel so the operator can fix it.

The important design point: **your plugin code is the security boundary**, not Pano core. Pano core is open source and can be forked or patched — so the addon verifies the JWT signature with its *own* embedded key. Even a tampered host cannot forge a token, because it does not have panomc.com's private key.

::: tip Addons have no `premium` manifest field
Unlike themes — which flip `"premium": true` in `manifest.json` — an **addon's premium status is decided entirely at build time** by whether a license public key was embedded. There is no `premium` field in `gradle.properties` or the jar manifest. Build with a key → premium; build without → free. Nothing else in your code or manifest changes.
:::

## Step 1 — Embed the license key at build time

The premium build accepts a few extra inputs that embed the public key into your jar. These are **build flags, not manifest attributes** (see [Manifest Configuration → Premium build properties](/addon/manifest/#premium-build-properties)). If you pass **none** of them, your addon builds as a normal **free** jar and the runtime check becomes a no-op — so the same source can ship free or premium with no code changes.

| Input | Kind | What it does |
|---|---|---|
| `-PlicenseServer=dev\|prod\|<url>` | Gradle property | Fetches the public key from a license server. `dev` → `https://api-dev.panomc.com`, `prod` → `https://api.panomc.com`, or pass a full custom URL. **Recommended** — nothing secret to store. |
| `PANO_LICENSE_SERVER` | Environment variable | Same as `-PlicenseServer`, for CI (set it on the Gradle build step). Used when the property is unset. |
| `-PpanoLicensePublicKey=<base64>` | Gradle property | Supplies the key directly (Base64 or PEM), skipping any network call. |
| `PANO_LICENSE_PUBLIC_KEY` | Environment variable | Same as `-PpanoLicensePublicKey`, for CI. Used when the property is unset. |

**Priority:** an explicitly supplied key (`-PpanoLicensePublicKey`, then `PANO_LICENSE_PUBLIC_KEY`) always wins; only if neither is set does the build fall back to fetching from `-PlicenseServer`, then `PANO_LICENSE_SERVER`. If nothing is set, the embedded key is empty and the jar is free.

The simplest premium build is:

```bash
./gradlew build -PlicenseServer=prod
```

For CI, set `PANO_LICENSE_SERVER` on the Gradle build step of your workflow — for example `dev` on the `dev` branch, `prod` on `main` — so a push produces a correctly-keyed jar. The stock `pano-boilerplate-plugin` release workflow does **not** set it: its build step is a plain `./gradlew build`, so out of the box a push produces a **free** jar. Adding that env var to the build step is the one change a premium fork makes — the boilerplate's `gradle.properties` calls this out explicitly.

::: tip The key is public — the flag choice is about convenience, not secrecy
The embedded value is panomc.com's **public** verification key, so there is nothing sensitive to hide (this is unlike your Marketplace API token, which must stay a secret). Prefer `-PlicenseServer` / `PANO_LICENSE_SERVER` so the build always fetches the current key; use `-PpanoLicensePublicKey` / `PANO_LICENSE_PUBLIC_KEY` only when your CI cannot reach the license server at build time.
:::

::: warning Always do a clean full build for a premium release
As with any release jar, never build a premium release with `-Pnoui` — it skips the UI and can bake a stale bundle into the jar (see the callout in [Building & Publishing](/addon/publishing/#the-release-build)). Premium is orthogonal: add the license flag to a clean `./gradlew build`, not to a `-Pnoui` dev build.
:::

## Step 2 — Add the runtime license check

The check lives in your plugin class and uses `PluginLicenseClient` from the boilerplate. **The template already ships this wiring** — a fresh `pano-boilerplate-plugin` is license-ready and simply behaves as free until you build it with a key. The relevant pieces:

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

- **`requireValidLicense()`** is the gate. On a premium jar it fetches, verifies, and cross-checks the license; on a free jar (no embedded key) it returns immediately. Call it at the **top** of `onStart()` so any failure propagates before your addon does any work.
- **`verifyLicense()`** is an overridable `PanoPlugin` hook that the panel's *Refresh license* button calls after the host fetches a fresh token, so the panel reflects the real outcome. Delegate it to the same `requireValidLicense()`.

When `requireValidLicense()` fails it throws `LicenseRequiredException`. PF4J then marks **only your addon** as failed and the host records the reason; Pano core and every other addon keep running. Keeping the platform unbreakable by one misconfigured premium addon is deliberate — the operator can still reach their panel to resolve it.

### What `requireValidLicense()` actually checks

In order, it:

1. Returns immediately if the addon is not premium (no embedded key).
2. Asks the host (`getLicenseManager()`) to fetch a license for `resourceId = pluginId` and the built-in version.
3. **Re-verifies the JWT signature** with the embedded public key, against the expected issuer (`getLicenseJwtIssuer()`) — the real security boundary.
4. Confirms the token's resource matches your `pluginId`, the version matches, and the **jar SHA-256 matches the running jar** (`getOwnJarSha256()`).
5. Confirms the token has not expired, then caches it.

### Defense in depth: `LicenseGuard`

Because a cracker's easiest move is to patch out the single `onStart` check, the boilerplate also ships `LicenseGuard` for sprinkling **cheap, mostly-cached** re-checks across your hot paths — route handlers, scheduled jobs, WebSocket handlers:

```kotlin
override suspend fun handle(context: RoutingContext): Result {
    LicenseGuard.assert(plugin)
    // ... business logic
}
```

`LicenseGuard.assert(plugin)` reuses the cached license and only re-fetches if it expired, so the cost is negligible — but the more places it appears, the more edits a cracker needs to make.

## Step 3 — Publish as a paid resource

Publishing a premium addon uses the **same three steps** as a free one — create the resource, create an API token, let the automation upload versions — from [Publishing on the official Pano Marketplace](/addon/publishing/#publishing-on-the-official-pano-marketplace). Two things differ:

**1. Price it as paid.** When you create the resource, choose the **paid** pricing option instead of free. As always for addons, your Marketplace `resourceId` is exactly your `pluginId` (not a UUID) — see the [resource ID tip](/addon/publishing/#publishing-on-the-official-pano-marketplace).

**2. Upload the jar directly — do not use `useGitHubLink`.** Free addons set `useGitHubLink: true` to avoid a duplicate upload. Premium addons must let the Marketplace hold the **canonical jar** and record its SHA-256, because that recorded hash is what every buyer's license binds to. In your `.releaserc.json` Pano plugin config, drop `useGitHubLink` (or set it to `false`):

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

When a buyer's Pano starts your premium addon, panomc.com issues a license token **only if** that connected account has purchased your resource **and** the running jar's SHA-256 matches the hash recorded for that version. (You, as the resource author, always pass — so you can test your own paid addon.) That is why a directly-uploaded, hash-recorded jar matters: it is the fingerprint the whole check hangs on.

## Fingerprinting and version binding

For addons, the license fingerprint is the **SHA-256 of the jar**. The token carries that hash, and at runtime your addon compares it against the hash of the jar it is actually running (`getOwnJarSha256()`). If someone repacks or patches the jar, the hash no longer matches the licensed one and the check fails with a tamper status — the jar equivalent of the whole-zip fingerprint used for [premium themes](/theme/publishing/#how-the-protection-works-in-plain-words).

::: warning Keep versions moving via releases
A license is issued per **version + jar**. If you patch a jar that was already released, its hash changes and it will no longer be licensed. Always ship changes as a **new release** through the normal flow — never hand-edit a released `.jar`. A fresh hash on every release is also a feature: it invalidates any crack work done against the previous build.
:::

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

## Hardening notes

The system already layers several defenses — per-install/version/jar binding, the plugin-side signature re-check, short 1-hour tokens, and scattered `LicenseGuard` calls. You can raise the bar further:

- **Sprinkle `LicenseGuard.assert(plugin)` widely** so no single removed check disables the gate.
- **Ship every fix as a new release**, since each new jar hash forces fresh crack effort.
- **Obfuscate your jar** (for example with ProGuard) so patching out the checks is harder to locate.

But keep the honesty warning at the top of this page in mind: these measures raise the cost of cracking for the overwhelming majority of users; they do not make it impossible.

## Where to next

- **[Building & Publishing](/addon/publishing/)** — the release build, versioning, and the full Marketplace publishing flow this page builds on.
- **[Manifest Configuration](/addon/manifest/#premium-build-properties)** — the premium build properties in the context of the rest of `gradle.properties`.
- **[Backend Development](/addon/backend/)** — where your `PanoPlugin` class, endpoints, and the `onStart` lifecycle live.
