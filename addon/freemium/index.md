# Freemium Addons & Packages

A **freemium** addon is free to install and free to run — but some of its features stay locked until the server owner buys a **package** (say *Pro* or *Ultra*) from the Marketplace. It is the middle ground between a fully free addon and a [premium](/addon/premium/) one: everybody can install it, and only the extras are paid.

::: warning Not open to third-party authors yet
Freemium is currently limited to accounts with **panel access** on panomc.com. There is no in-addon purchase programme for third-party addon authors yet, so the option is shown as *coming soon* on the pricing step and the API rejects it for everyone else. This page documents how it works so you can plan for it — build your addon free or [premium](/addon/premium/) in the meantime.
:::

## Freemium vs premium in one table

| | Premium | Freemium |
|---|---|---|
| Can anyone install it? | No — needs a purchase | **Yes** |
| Does it run without paying? | No, it refuses to start | **Yes**, with paid features locked |
| What is sold | The whole addon | **Individual packages** (Pro, Ultra …) |
| How your code checks | `requireValidLicense()` at startup | `hasTier("pro")` where the feature is used |
| Where the price lives | The resource price | Each package's price |

The two are **mutually exclusive**. A freemium addon that asks for a license fails to start on purpose — pick one model.

## Step 1 — Mark the addon freemium

In `gradle.properties`:

```properties
pluginFreemium=true
```

That is the whole declaration. The build writes it into your jar manifest and Pano reads it at load time, so the panel knows your addon is freemium before it even starts. A fresh `pano-boilerplate-plugin` already ships this property set to `false` with a comment.

::: tip Remove the license check if you switch
The boilerplate calls `licenseClient.requireValidLicense()` in `onStart`. Delete that call when you go freemium — keeping both models is the one combination Pano refuses.
:::

## Step 2 — Gate the paid features in your code

Wrap whatever the package unlocks:

```kotlin
override suspend fun onStart() {
    if (hasTier("pro")) {
        enableProFeature()
    } else {
        logger.info("Pro features are locked")
    }
}
```

`hasTier(id)` means **"at least this package"**. Packages are ordered, so a server that bought *Ultra* also satisfies `hasTier("pro")` — you never have to enumerate the higher packages, and adding a new top tier later needs no code change.

`activeTier()` returns the owned package id (or `null`) if you want it for a log line or a status page. Prefer `hasTier` for actual gating.

::: warning Buying does not unlock instantly
Your addon asks about packages while it starts, and a purchase made later is not pushed to the server. Until something re-checks, the feature stays locked. That is what the **refresh** button on the addon's panel page is for — see [In the panel](#in-the-panel). Answers come from a cached snapshot, so `hasTier` never blocks your code.
:::

Both methods only work on an addon that declared `pluginFreemium=true`; calling them from a normal addon throws, so a wrong-model mistake surfaces immediately instead of silently returning `false`.

## Step 3 — Define the packages on the Marketplace

Packages are **published by the store**, not declared in your code. You define them on your resource — either on the pricing step of the create wizard, or later in the resource editor — after choosing the *Freemium* plan:

| Field | Notes |
|---|---|
| **Package ID** | Lowercase slug (`pro`, `ultra`). **This is the id your code passes to `hasTier()`** — keep it stable, changing it silently unlocks nothing. |
| **Name** | What buyers see (*Pro*). |
| **Price** | One-time, above 0. |
| **Features** | The list shown to buyers under the package. |

The **order of the list is the upgrade chain**: the first package is the lowest level, the next one is above it, and so on. There is no level field to fill in — moving a package up or down is how you change the ranking, which makes colliding or skipped levels impossible.

Up to 5 packages per addon, 10 features each.

::: tip Keep ids and code in sync
The store decides which packages exist; your jar decides which ids it asks about. If they drift apart — a package renamed from `pro` to `professional`, say — the check silently stops matching. Treat the id as part of your public API.
:::

## In the panel

On the addon's detail page in a server's panel, a freemium addon gets:

- a **Freemium badge**, next to the verified mark, in the addon list and on the detail page;
- a **Packages** card showing the current catalogue, which package is active, and a buy/upgrade button — this view is served by panomc.com and embedded, so it always reflects the store rather than a stale copy;
- a **Refresh** button, the equivalent of the premium license refresh. It re-reads what the server owns, which is the way out of *"I bought Pro but the addon still says locked"*.

The panel needs a connected Pano account to show any of this; without one it asks the operator to connect first.

## What Pano rejects

Worth knowing before you hit them:

- **Freemium + a price** on the same resource — freemium means free to install, so it cannot also cost money.
- **Freemium on a theme** — in-addon purchases are an addon concept.
- **A freemium addon calling `requireValidLicense()`** — mutually exclusive with premium; the addon fails to start.
- **`hasTier()` from a non-freemium addon** — throws, to catch the wrong model early.
- **Duplicate package ids, empty names, prices at or below 0** — rejected when you save the packages.

## Where to next

- **[Premium & Licensing](/addon/premium/)** — the all-or-nothing model, if you would rather sell the whole addon.
- **[Building & Publishing](/addon/publishing/)** — the release flow and creating the resource these packages hang off.
- **[Manifest Configuration](/addon/manifest/)** — `pluginFreemium` in the context of the rest of `gradle.properties`.
- **[Backend Development](/addon/backend/)** — where `onStart` and your `PanoPlugin` class live.
