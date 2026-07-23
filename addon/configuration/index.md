# Configuration

**What this page gives you:** by the end you'll have a settings file the site owner can edit — a typed Kotlin config class that Pano writes to disk on first run — and you'll know the one rule for reading those values safely from inside an endpoint.

Settings that the site owner should be able to tweak live in a config class extending `PluginConfig` (file `config/ShoutboxConfig.kt`):

```kotlin
package com.panomc.plugins.shoutbox.config

import com.panomc.platform.api.config.PluginConfig

class ShoutboxConfig(
    val enabled: Boolean = true,
    val maxShouts: Int = 5
) : PluginConfig()
```

On first run Pano writes this class out as a **config file** — in HOCON format, which looks like JSON with fewer quotes and commas — at `plugins/pano-plugin-shoutbox/config.conf`, filling in your defaults. Remember every backend edit needs a rebuild-and-restart before it takes effect — see the [Backend overview](/addon/backend/).

::: tip Where the config manager is created
The `PluginConfigManager` that loads and saves this file is created and registered in your entry class's `startPlugin()` — see the [Backend overview](/addon/backend/#the-entry-class). That timing matters for how you read config below.
:::

::: tip Checkpoint: open the generated config
After your addon has loaded once (rebuild → copy → restart), open `plugins/pano-plugin-shoutbox/config.conf`. You should see your two keys with their default values: `enabled` set to `true` and `maxShouts` set to `5`.
:::

## Reading config from an endpoint (and why not from a constructor)

There's one rule for reading config: **never ask for `PluginConfigManager` in a constructor.** Here's the reason, as a timeline of what happens when your addon loads:

```text
addon loads → your @Endpoint objects are created → onStart() runs → PluginConfigManager is registered → (later) a request arrives
```

Your endpoints are built at step 2, but `PluginConfigManager` isn't registered until step 4. So if an endpoint's constructor asked for it, Pano would have nothing to hand over and would crash with `NoSuchBeanDefinitionException`. The fix is to fetch it **when a request actually arrives** (step 5), not when the endpoint is built. Here is the complete, safe way to read a config value inside an endpoint's `handle`:

```kotlin
// fetch the config manager only now, at request time — never in the constructor
val configManager = plugin.pluginBeanContext.getBean(PluginConfigManager::class.java)
val config = configManager.config as ShoutboxConfig
val limit = config.maxShouts   // e.g. 5
```

`configManager.config` gives you back a typed `ShoutboxConfig`. To save changes to disk you call `configManager.saveConfig(JsonObject.mapFrom(newConfig))` with a filled-in config object. You'll put this exact read pattern to work in [Endpoints](/addon/endpoints/), where the optional `GetShoutsAPI` variant uses `maxShouts` to cap how many shouts it returns.

## Documenting and evolving keys

You can document individual keys in the generated file with `@ConfigComment("…")` on a field, and group related keys under a banner with `@ConfigSection("…")`.

When you later need to add or rename config keys, don't edit the on-disk file by hand — Pano has a `PluginConfigMigration` class (annotated `@Migration`) for that. You won't need it on day one; see it in the [Backend API Reference](/addon/backend-reference/#_5-configuration) when the time comes.

## Where to next

- **[Endpoints](/addon/endpoints/)** — put `maxShouts` to work at request time.
- **[Backend overview](/addon/backend/)** — where the `PluginConfigManager` is registered during startup.
- **[Backend API Reference](/addon/backend-reference/#_5-configuration)** — `PluginConfig`, `PluginConfigManager`, `@ConfigComment`, `@ConfigSection`, and `PluginConfigMigration` by name.
