# İlk Entegrasyon Eklentinizi Oluşturma

## İlk Entegrasyon Eklentinizi Oluşturma

### Adım 1: Yeni Bir Eklenti Projesi Oluşturun

`plugin.yml` ile standart bir Spigot/Paper eklentisi oluşturun:

```yaml
name: MyPanoIntegration
version: 1.0.0
main: com.example.integration.MyIntegrationPlugin
api-version: 1.19
depend: [Pano, YourTargetPlugin]  # Pano MC Eklentisine bağımlı
```

### Adım 2: Pano MC Eklentisini Dependency Olarak Ekleyin

Build yapılandırmanıza Pano MC Eklentisini ekleyin:

**Maven:**
```xml
<dependency>
    <groupId>com.panomc</groupId>
    <artifactId>pano-mc-plugin</artifactId>
    <version>1.0.0</version>
    <scope>provided</scope>
</dependency>
```

**Gradle (Kotlin DSL):**
```kotlin
dependencies {
    compileOnly("com.panomc:pano-mc-plugin:1.0.0")
}
```

### Adım 3: Entegrasyonunuzu Başlatın

::: code-group

```kotlin [Kotlin]
package com.example.integration

import com.panomc.plugin.api.PlatformManager
import org.bukkit.plugin.java.JavaPlugin

class MyIntegrationPlugin : JavaPlugin() {

    private lateinit var platformManager: PlatformManager

    override fun onEnable() {
        // Pano MC Eklentisinden PlatformManager'ı al
        val panoPlugin = server.pluginManager.getPlugin("Pano")
        if (panoPlugin == null) {
            logger.severe("Pano MC Eklentisi bulunamadı! Devre dışı bırakılıyor...")
            server.pluginManager.disablePlugin(this)
            return
        }

        platformManager = panoPlugin.getPlatformManager()

        // Mesaj handler'larını kaydet
        registerHandlers()

        // Hedef eklentiye bağlan
        setupIntegration()

        logger.info("Entegrasyon başarıyla etkinleştirildi!")
    }

    private fun registerHandlers() {
        // Pano'dan mesaj almak için handler'ları kaydet
        platformManager.registerMessageHandler(PlayerRewardHandler())
        platformManager.registerMessageHandler(ConfigUpdateHandler())
    }

    private fun setupIntegration() {
        // Hedef eklentinizin API'sine bağlanın
        // Etkinlikleri dinleyin, komutları kaydedin, vb.
    }

    fun sendRequestToPano(request: PlatformRequest) {
        platformManager.sendRequest(request)
    }
}
```

```java [Java]
package com.example.integration;

import com.panomc.plugin.api.PlatformManager;
import com.panomc.plugin.api.PlatformRequest;
import org.bukkit.plugin.Plugin;
import org.bukkit.plugin.java.JavaPlugin;

public class MyIntegrationPlugin extends JavaPlugin {

    private PlatformManager platformManager;

    @Override
    public void onEnable() {
        // Pano MC Eklentisinden PlatformManager'ı al
        Plugin panoPlugin = getServer().getPluginManager().getPlugin("Pano");
        if (panoPlugin == null) {
            getLogger().severe("Pano MC Eklentisi bulunamadı! Devre dışı bırakılıyor...");
            getServer().getPluginManager().disablePlugin(this);
            return;
        }

        platformManager = panoPlugin.getPlatformManager();

        // Mesaj handler'larını kaydet
        registerHandlers();

        // Hedef eklentiye bağlan
        setupIntegration();

        getLogger().info("Entegrasyon başarıyla etkinleştirildi!");
    }

    private void registerHandlers() {
        // Pano'dan mesaj almak için handler'ları kaydet
        platformManager.registerMessageHandler(new PlayerRewardHandler());
        platformManager.registerMessageHandler(new ConfigUpdateHandler());
    }

    private void setupIntegration() {
        // Hedef eklentinizin API'sine bağlanın
        // Etkinlikleri dinleyin, komutları kaydedin, vb.
    }

    public void sendRequestToPano(PlatformRequest request) {
        platformManager.sendRequest(request);
    }

    public PlatformManager getPlatformManager() {
        return platformManager;
    }
}
```

:::

### Adım 4: Hedef Eklenti Etkinliklerine Bağlanma

::: code-group

```kotlin [Kotlin]
import org.bukkit.event.EventHandler
import org.bukkit.event.Listener
import org.bukkit.event.player.PlayerJoinEvent

class PlayerJoinListener(
    private val plugin: MyIntegrationPlugin
) : Listener {

    @EventHandler
    fun onPlayerJoin(event: PlayerJoinEvent) {
        val player = event.player

        // Pano'ya oyuncu katılım etkinliği gönder
        val request = object : PlatformRequest() {
            override fun getRequestType() = "player_join"
            override fun getData() = mapOf(
                "player" to player.name,
                "uuid" to player.uniqueId.toString(),
                "ip" to player.address?.address?.hostAddress
            )
        }

        plugin.sendRequestToPano(request)
    }
}
```

```java [Java]
import com.panomc.plugin.api.PlatformRequest;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;
import java.util.HashMap;
import java.util.Map;

public class PlayerJoinListener implements Listener {
    
    private final MyIntegrationPlugin plugin;
    
    public PlayerJoinListener(MyIntegrationPlugin plugin) {
        this.plugin = plugin;
    }
    
    @EventHandler
    public void onPlayerJoin(PlayerJoinEvent event) {
        Player player = event.getPlayer();
        
        // Pano'ya oyuncu katılım etkinliği gönder
        PlatformRequest request = new PlatformRequest() {
            @Override
            public String getRequestType() {
                return "player_join";
            }
            
            @Override
            public Map<String, Object> getData() {
                Map<String, Object> data = new HashMap<>();
                data.put("player", player.getName());
                data.put("uuid", player.getUniqueId().toString());
                data.put("ip", player.getAddress().getAddress().getHostAddress());
                return data;
            }
        };
        
        plugin.sendRequestToPano(request);
    }
}
```

:::

### Adım 5: Yanıt Bekleyen İstekler Gönderme

::: code-group

```kotlin [Kotlin]
class PlayerStatsRequest(
    private val playerUUID: String,
    private val callback: (Map<String, Any>) -> Unit
) : PlatformRequest(), PlatformMessageResponse {

    override fun getRequestType() = "player_stats"

    override fun getData() = mapOf("uuid" to playerUUID)

    override fun onResponse(response: Map<String, Any>) {
        callback(response)
    }

    override fun onError(error: String) {
        println("Oyuncu istatistikleri alınamadı: $error")
    }
}

// Komut içinde kullanım
fun onCommand(player: Player) {
    val request = PlayerStatsRequest(player.uniqueId.toString()) { stats ->
        player.sendMessage("İstatistiklerin:")
        player.sendMessage("Öldürme: ${stats["kills"]}")
        player.sendMessage("Ölme: ${stats["deaths"]}")
    }
    
    platformManager.sendRequest(request)
}
```

```java [Java]
import com.panomc.plugin.api.PlatformRequest;
import com.panomc.plugin.api.PlatformMessageResponse;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Consumer;

public class PlayerStatsRequest extends PlatformRequest implements PlatformMessageResponse {
    
    private final String playerUUID;
    private final Consumer<Map<String, Object>> callback;
    
    public PlayerStatsRequest(String playerUUID, Consumer<Map<String, Object>> callback) {
        this.playerUUID = playerUUID;
        this.callback = callback;
    }
    
    @Override
    public String getRequestType() {
        return "player_stats";
    }
    
    @Override
    public Map<String, Object> getData() {
        Map<String, Object> data = new HashMap<>();
        data.put("uuid", playerUUID);
        return data;
    }
    
    @Override
    public void onResponse(Map<String, Object> response) {
        callback.accept(response);
    }
    
    @Override
    public void onError(String error) {
        System.out.println("Oyuncu istatistikleri alınamadı: " + error);
    }
}

// Komut içinde kullanım
public void onCommand(Player player) {
    PlayerStatsRequest request = new PlayerStatsRequest(
        player.getUniqueId().toString(),
        stats -> {
            player.sendMessage("İstatistiklerin:");
            player.sendMessage("Öldürme: " + stats.get("kills"));
            player.sendMessage("Ölme: " + stats.get("deaths"));
        }
    );
    
    platformManager.sendRequest(request);
}
```

:::
