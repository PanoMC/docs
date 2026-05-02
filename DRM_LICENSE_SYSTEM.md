# Pano DRM / License System

End-to-end design for the Pano plugin DRM gate. Lives in 4 repos:

- **`pano-web-platform/Pano`** — host (issuer trampoline, failure tracker, refusal gate)
- **`website-back-end/plugins/pano-platform-management`** — license authority (mints RS256 JWTs)
- **`pano-boilerplate-plugin`** — premium-plugin SDK (`PluginLicenseClient`, `LicenseGuard`)
- **5 premium plugins** in `pano-web-platform/plugins` (`auth-guard`, `comments`, `media-page`, `countdown-timer`, `premium-login`)

## Decisions

- **Authority:** centralized — only `panomc.com` issues licenses.
- **Mode:** strict immediate (default ON, configurable). No offline grace period in v1.
- **Trigger:** plugin-driven. Plugin self-asserts via `licenseClient.requireValidLicense()`. Manifest has NO `premium` field.
- **Security boundary:** plugin code (host is open source and not obfuscated).
- **Token format:** RS256 JWT, 1h TTL. Bound to `(panoPlatformId, resourceId, version, jarSha256)`.
- **Anti-cracking:** JAR hash binding + version binding + multi-site checks + ProGuard + per-release hash invalidates older crack work.

## Token claims

```json
{
  "iss": "panomc.com",
  "sub": "<panoPlatformId>",
  "aud": "<resourceId>",
  "uid": "<userId>",
  "ver": "<plugin version>",
  "hash": "<jarSha256 hex>",
  "iat": ...,
  "exp": ...,
  "jti": "...",
  "kid": "panomc-license-v1"
}
```

## Endpoints (added)

### website-back-end (`pano-platform-management`)

- `POST /platform/api/licenses/issue`
  - Auth: `PlatformApi` (existing PanoPlatformAuthorizationToken).
  - Body: `{ resourceId, version, jarSha256 }`.
  - Logic: `PaymentManager.hasUserPurchasedResource(userId, resourceId)` AND `ResourceVersion.hash == jarSha256` (resource authors auto-pass).
  - Returns: `{ jwt, expiresAt, jti }`.

### Pano core (panel)

- `GET /api/panel/plugins` / `GET /api/panel/plugins/:id` — same as before, plus license fields:
  - `premium`, `licensed`, `licenseStatus`, `licenseExpiresAt`, `licenseLastChecked`, `licenseFailureReason`, `licenseFailureMessage`, `resourceId`, `licenseVersion`, `purchaseUrl`.
- `GET /api/panel/plugins/:id/license` — full claims + status.
- `POST /api/panel/plugins/:id/license/refresh` — manual re-fetch.
- `GET /api/panel/dashboard` — adds `licenseFailedPluginCount`, `licenseFailedPluginIds`.

### Plugin failure handling

A premium plugin that fails its license check throws `LicenseRequiredException` from
`onStart`; PF4J then marks that plugin as failed and `LicenseManager` records the
failure. Pano itself continues to start normally so the operator can reach the panel,
read the failure (per-addon status badge, addon detail license card, dashboard banner),
and resolve it. There is no host-level "refuse-to-start" gate — keeping the platform
unbreakable by a single misconfigured premium plugin is more important than gating the
admin out of their own panel.

## Plugin author quickstart (premium plugins)

In `gradle.properties`:

```properties
panoLicensePublicKey=<base64 panomc.com RSA public key>
pluginResourceId=<your-resource-id-on-panomc.com>   # optional, defaults to pluginId
```

In `build.gradle.kts`:

```kotlin
apply(from = "${rootProject.projectDir}/plugins/pano-premium-plugin.gradle.kts")
```

(Or for forked boilerplate plugins, the snippet is already inlined.)

In your plugin class:

```kotlin
class MyPremiumPlugin : PanoPlugin() {
    private val licenseClient by lazy { PluginLicenseClient(this) }

    override suspend fun onStart() {
        licenseClient.requireValidLicense()  // throws if invalid → plugin disabled, Pano keeps running
        // ... rest of init
    }
}
```

In hot route handlers (defense in depth):

```kotlin
override suspend fun handle(context: RoutingContext): Result {
    LicenseGuard.assert(plugin)
    // ... business logic
}
```

For maximum anti-cracking, also enable ProGuard (`proguard-rules.pro` template ships with the boilerplate).

## Operator quickstart

There is no Pano-side configuration for licensing — premium plugins handle their own
license check on `onStart`, and unlicensed ones simply remain disabled while Pano runs
normally.

If a premium plugin appears as `LICENSE_REQUIRED` on the addons page:

1. Check the panel "License" card on the addon detail page.
2. If status is `NO_PURCHASE` → click "Buy License" (panomc.com).
3. If status is `NOT_CONNECTED` → settings → connect Pano account.
4. If status is `NETWORK_ERROR` → click Refresh after fixing connectivity.
5. If status is `JAR_TAMPERED` → the JAR was modified or repacked; re-download from panomc.com.

## Threat model coverage

| Attack | Defense |
|---|---|
| User drops a paid JAR onto an unauthorised Pano | Plugin's onStart calls `requireValidLicense`; website checks order ownership for that user → fails. |
| User shares their JWT with a friend | JWT bound to `(panoPlatformId, jarSha256, version)`; friend's Pano has different platformId → plugin self-check fails. |
| Cracker patches plugin to skip license check | Multi-site assertions + ProGuard + new release per fix means each release needs fresh patch effort. |
| Cracker rebuilds modified JAR | Hash differs from the panomc.com release record → license issuance fails. |
| Cracker forks Pano core to inject forged JWT | Plugin's own embedded panomc.com pubkey re-verifies the JWT signature; forged JWT fails. |
| panomc.com signing key compromised | Rotation procedure (single-key in v1, dual-key planned for v2). All issued tokens revoke within TTL (1h). |
| panomc.com offline | Premium plugins fail their license check and remain disabled; Pano core and free plugins keep running so the operator can react. |

## Limitations / future work

- **No offline grace period in v1.** If `panomc.com` is down, premium plugins fail until connectivity returns. Could add disk-cached encrypted JWTs with N-day grace.
- **Single signing key.** Rotation requires shipping all dependent JARs in lockstep.
- **No revocation list.** A compromised individual JWT remains valid until its 1h TTL expires.
- **Stateless.** Every panomc.com restart loses no state; everything reads through the existing orders table.

## Files added/changed

See [`pano_drm_license_system.plan.md`](.) (the planning doc) for the full file inventory.
