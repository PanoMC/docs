# İlk Entegrasyon Eklentinizi Oluşturma

## İlk Entegrasyon Eklentinizi Oluşturma

### Adım 1: Yeni Bir Eklenti Projesi Oluşturun

`plugin.yml` ile standart bir Spigot/Paper eklentisi oluşturun:

```yaml
name: MyPanoIntegration
version: 1.0.0
main: com.example.integration.MyIntegrationPlugin
api-version: 1.19
depend: [Pano, YourTargetPlugin]  # Depend on Pano MC Plugin
```

### Adım 2: Pano MC Eklentisini Dependency Olarak Ekleyin

API, Pano MC Eklentisi'nin `Core` jar'ıdır. Maven Central'da yoktur; repodan derleyin:

```bash
# in a checkout of https://github.com/PanoMC/pano-mc-plugin
./gradlew :Core:build      # Core/build/libs/pano-core-<version>.jar
```

Jar'ı projenize kopyalayın ve ona karşı derleyin. Jar'ı kendi eklentinize gömmeyin (shade etmeyin): çalışma anında sınıflar, Kotlin standart kütüphanesi ve coroutine'ler kurulu Pano MC Eklentisi'nden gelir.

**Gradle (Kotlin DSL):**
```kotlin
dependencies {
    compileOnly(files("libs/pano-core-<version>.jar"))
    compileOnly(kotlin("stdlib-jdk8"))
}
```

### Adım 3: Entegrasyonunuzu Başlatın

```kotlin
package com.example.integration

import com.panomc.plugins.pano.core.helper.PanoPluginMain
import com.panomc.plugins.pano.core.platform.PlatformManager
import org.bukkit.plugin.java.JavaPlugin

class MyIntegrationPlugin : JavaPlugin() {

    private var panoMain: PanoPluginMain? = null

    override fun onEnable() {
        // The Pano MC Plugin's main class implements PanoPluginMain
        panoMain = server.pluginManager.getPlugin("Pano") as? PanoPluginMain
        if (panoMain == null) {
            logger.severe("Pano MC Plugin not found! Disabling...")
            server.pluginManager.disablePlugin(this)
            return
        }

        server.pluginManager.registerEvents(PlayerJoinListener(this), this)

        logger.info("Integration enabled successfully!")
    }

    // Look the manager up on every call: Pano replaces it when it re-initialises itself
    fun platformManager(): PlatformManager? = try {
        panoMain?.getPano()?.platformManager
    } catch (_: Throwable) {
        null
    }

    fun connectedManager(): PlatformManager? =
        platformManager()?.takeIf { it.isPlatformConfigured() && it.getWebSocket() != null }
}
```

### Adım 4: Hedef Eklenti Etkinliklerine Bağlanma

```kotlin
import com.panomc.plugins.pano.core.platform.PlatformRequest
import org.bukkit.event.EventHandler
import org.bukkit.event.Listener
import org.bukkit.event.player.PlayerJoinEvent

// Event name: MY_PLAYER_JOIN
class MyPlayerJoinRequest(
    val player: String,
    val uuid: String
) : PlatformRequest()

class PlayerJoinListener(
    private val plugin: MyIntegrationPlugin
) : Listener {

    @EventHandler
    fun onPlayerJoin(event: PlayerJoinEvent) {
        val player = event.player

        // Send the join to Pano; nothing is sent while the server is not connected
        plugin.connectedManager()?.sendMessage(
            MyPlayerJoinRequest(player.name, player.uniqueId.toString())
        )
    }
}
```

### Adım 5: Yanıt Bekleyen İstekler Gönderme

`sendMessageAwaitResponse` bir `suspend` fonksiyondur: onu bir coroutine içinden çağırın, asla sunucu thread'inde çağırmayın.

```kotlin
import com.panomc.plugins.pano.core.platform.PlatformMessageResponse
import com.panomc.plugins.pano.core.platform.PlatformRequest
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import org.bukkit.Bukkit
import org.bukkit.entity.Player

// Event name: MY_PLAYER_STATS
class MyPlayerStatsRequest(val uuid: String) : PlatformRequest()

data class MyPlayerStatsMessage(
    val kills: Int = 0,
    val deaths: Int = 0
) : PlatformMessageResponse

private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

// Usage in command
fun onCommand(plugin: MyIntegrationPlugin, player: Player) {
    val manager = plugin.connectedManager() ?: return

    scope.launch {
        try {
            val stats = manager.sendMessageAwaitResponse<MyPlayerStatsMessage>(
                MyPlayerStatsRequest(player.uniqueId.toString()),
                MyPlayerStatsMessage::class.java,
                10_000
            )

            // Back to the server thread before touching the Bukkit API
            Bukkit.getScheduler().runTask(plugin, Runnable {
                player.sendMessage("Your stats:")
                player.sendMessage("Kills: ${stats.kills}")
                player.sendMessage("Deaths: ${stats.deaths}")
            })
        } catch (e: Exception) {
            plugin.logger.warning("Failed to fetch player stats: ${e.message}")
        }
    }
}
```

Diğer yarı, yani `MY_PLAYER_JOIN` isteğini alan ve `MY_PLAYER_STATS` isteğini yanıtlayan sunucu olayları [Backend'i Genişletme](../extending-backend/) sayfasındadır. Kimsenin işlemediği bir istek yanıt almaz ve çağrı zaman aşımına uğrar.
