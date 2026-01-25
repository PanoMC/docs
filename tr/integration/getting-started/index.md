# Entegrasyon Geliştirmeye Başlangıç

Bu rehber, **Pano MC Eklentisi API**'sini kullanarak Pano ve Minecraft sunucu eklentileri arasında özel entegrasyonlar oluşturmanıza yardımcı olacaktır.

## 🎯 Entegrasyon Geliştirme Nedir?

Entegrasyon geliştirme, üçüncü taraf Minecraft eklentileri ile Pano'nun web platformu arasında sorunsuz bağlantılar oluşturmanıza olanak tanır. Pano MC Eklentisi API'sini kullanarak şunları yapabilirsiniz:

- Oyun ve web arasında verileri gerçek zamanlı senkronize etme
- Minecraft eklentinizden Pano'nun web platformuna istekler gönderme
- Pano'dan mesajlar alma ve işleme
- Oyun içi etkinliklerden web aksiyonlarını tetikleme
- Her iki platform arasında birleşik deneyimler oluşturma

## 🔧 Ön Gereksinimler

Entegrasyon geliştirmeye başlamadan önce şunlara sahip olduğunuzdan emin olun:

1. **Java Development Kit (JDK 11+)** — Eklenti geliştirme için gerekli
2. **Java veya Kotlin Bilgisi** — Pano MC Eklentisi API'si ile her iki dili de kullanabilirsiniz
3. **Minecraft Eklenti Geliştirme Deneyimi** — Spigot/Paper/Bukkit API anlayışı
4. **Pano MC Eklentisi API** — [GitHub Repository](https://github.com/PanoMC/pano-mc-plugin)
5. **Çalışan Bir Pano Örneği** — Entegrasyonunuzu test etmek için
6. **Bir Minecraft Test Sunucusu** — Geliştirme için Spigot, Paper veya Folia sunucusu

> 💡 **Not:** Bu rehberdeki tüm örnekler kolaylığınız için hem **Kotlin** hem de **Java** dilinde sağlanmıştır.

## 🏗️ Mimari Genel Bakış

Pano'nun entegrasyon sistemi üç ana bileşenden oluşur:

```
┌─────────────────────┐         ┌──────────────────────┐         ┌─────────────────┐
│  MC Eklentiniz      │ ◄─────► │  Pano MC Eklentisi   │ ◄─────► │  Pano Backend   │
│  (Entegrasyon)      │         │  (İletişim API)      │         │  (Web Platform) │
└─────────────────────┘         └──────────────────────┘         └─────────────────┘
    (Eklenti Hooks)              (Güvenli WebSocket API)          (Platform API)
```

### İletişim Akışı

1. **Eklentiniz → Pano MC Eklentisi API:** İstek veya mesaj göndermek için API'yi kullanırsınız
2. **Pano MC Eklentisi → Pano Backend:** Güvenli şifreli WebSocket iletişimi (RSA + AES-256)
3. **Pano Backend → Eklentiniz:** Pano otomatik olarak bağlantıları yönetir ve mesajları geri yönlendirir
4. **Pano Backend → Web:** Veriler senkronize edilir ve web sitesinde görüntülenir

> **Önemli:** Pano MC Eklentisini fork'lamayın. Bunun yerine kendi ayrı eklentinizi oluşturun ve Pano MC Eklentisi API'sini kullanın.

## 📚 Temel API Kavramları

### 1. PlatformRequest

Pano'nun web platformuna istek göndermek için `PlatformRequest` abstract class'ını extend edin:

```kotlin
abstract class PlatformRequest {
    abstract fun getRequestType(): String
    abstract fun getData(): Map<String, Any>
}
```

::: code-group

```kotlin [Kotlin]
import com.panomc.plugin.api.PlatformRequest

class MyCustomRequest(
    private val playerName: String,
    private val data: String
) : PlatformRequest() {

    override fun getRequestType(): String = "my_custom_request"

    override fun getData(): Map<String, Any> {
        return mapOf(
            "player" to playerName,
            "data" to data,
            "timestamp" to System.currentTimeMillis()
        )
    }
}
```

```java [Java]
import com.panomc.plugin.api.PlatformRequest;
import java.util.HashMap;
import java.util.Map;

public class MyCustomRequest extends PlatformRequest {
    private final String playerName;
    private final String data;

    public MyCustomRequest(String playerName, String data) {
        this.playerName = playerName;
        this.data = data;
    }

    @Override
    public String getRequestType() {
        return "my_custom_request";
    }

    @Override
    public Map<String, Object> getData() {
        Map<String, Object> dataMap = new HashMap<>();
        dataMap.put("player", playerName);
        dataMap.put("data", data);
        dataMap.put("timestamp", System.currentTimeMillis());
        return dataMap;
    }
}
```

:::

### 2. PlatformMessageResponse

Pano'dan yanıt bekliyorsanız, `PlatformMessageResponse` interface'ini extend edin:

```kotlin
interface PlatformMessageResponse {
    fun onResponse(response: Map<String, Any>)
    fun onError(error: String)
}
```

::: code-group

```kotlin [Kotlin]
import com.panomc.plugin.api.PlatformMessageResponse

class MyRequestWithResponse(
    private val playerName: String
) : PlatformRequest(), PlatformMessageResponse {

    override fun getRequestType(): String = "player_data_request"

    override fun getData(): Map<String, Any> {
        return mapOf("player" to playerName)
    }

    override fun onResponse(response: Map<String, Any>) {
        // Başarılı yanıtı işle
        val points = response["points"] as? Int ?: 0
        println("Oyuncu $playerName $points puana sahip")
    }

    override fun onError(error: String) {
        // Hatayı işle
        println("Hata: $error")
    }
}
```

```java [Java]
import com.panomc.plugin.api.PlatformRequest;
import com.panomc.plugin.api.PlatformMessageResponse;
import java.util.HashMap;
import java.util.Map;

public class MyRequestWithResponse extends PlatformRequest implements PlatformMessageResponse {
    private final String playerName;

    public MyRequestWithResponse(String playerName) {
        this.playerName = playerName;
    }

    @Override
    public String getRequestType() {
        return "player_data_request";
    }

    @Override
    public Map<String, Object> getData() {
        Map<String, Object> data = new HashMap<>();
        data.put("player", playerName);
        return data;
    }

    @Override
    public void onResponse(Map<String, Object> response) {
        // Başarılı yanıtı işle
        Integer points = (Integer) response.getOrDefault("points", 0);
        System.out.println("Oyuncu " + playerName + " " + points + " puana sahip");
    }

    @Override
    public void onError(String error) {
        // Hatayı işle
        System.out.println("Hata: " + error);
    }
}
```

:::

### 3. PlatformMessageHandler

Pano'nun web platformundan mesaj almak ve işlemek için `PlatformMessageHandler<R : PlatformMessage>` sınıfını extend edin:

```kotlin
abstract class PlatformMessageHandler<R : PlatformMessage> {
    abstract fun handle(message: R)
    abstract fun getMessageType(): String
}
```

::: code-group

```kotlin [Kotlin]
import com.panomc.plugin.api.PlatformMessageHandler
import com.panomc.plugin.api.PlatformMessage
import com.panomc.plugin.api.PlatformManager

// Mesaj yapınızı tanımlayın
data class PlayerRewardMessage(
    val playerName: String,
    val reward: String,
    val amount: Int
) : PlatformMessage

// Handler oluşturun
class PlayerRewardHandler : PlatformMessageHandler<PlayerRewardMessage>() {

    override fun getMessageType(): String = "player_reward"

    override fun handle(message: PlayerRewardMessage) {
        val player = Bukkit.getPlayer(message.playerName)
        if (player != null) {
            // Oyuncuya ödül ver
            when (message.reward) {
                "coins" -> giveCoins(player, message.amount)
                "items" -> giveItems(player, message.amount)
            }
            player.sendMessage("${message.amount} ${message.reward} aldın!")
        }
    }
}

// Handler'ı kaydet
fun registerHandlers(platformManager: PlatformManager) {
    platformManager.registerMessageHandler(PlayerRewardHandler())
}
```

```java [Java]
import com.panomc.plugin.api.PlatformMessageHandler;
import com.panomc.plugin.api.PlatformMessage;
import com.panomc.plugin.api.PlatformManager;
import org.bukkit.Bukkit;
import org.bukkit.entity.Player;

// Mesaj yapınızı tanımlayın
public class PlayerRewardMessage implements PlatformMessage {
    private final String playerName;
    private final String reward;
    private final int amount;

    public PlayerRewardMessage(String playerName, String reward, int amount) {
        this.playerName = playerName;
        this.reward = reward;
        this.amount = amount;
    }

    public String getPlayerName() { return playerName; }
    public String getReward() { return reward; }
    public int getAmount() { return amount; }
}

// Handler oluşturun
public class PlayerRewardHandler extends PlatformMessageHandler<PlayerRewardMessage> {

    @Override
    public String getMessageType() {
        return "player_reward";
    }

    @Override
    public void handle(PlayerRewardMessage message) {
        Player player = Bukkit.getPlayer(message.getPlayerName());
        if (player != null) {
            // Oyuncuya ödül ver
            switch (message.getReward()) {
                case "coins":
                    giveCoins(player, message.getAmount());
                    break;
                case "items":
                    giveItems(player, message.getAmount());
                    break;
            }
            player.sendMessage(message.getAmount() + " " + message.getReward() + " aldın!");
        }
    }
}

// Handler'ı kaydet
public void registerHandlers(PlatformManager platformManager) {
    platformManager.registerMessageHandler(new PlayerRewardHandler());
}
```

:::

## 🚀 İlk Entegrasyon Eklentinizi Oluşturma

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

## 🔗 Pano'nun Backend'ini Genişletme (Önerilen)

Tam bir entegrasyon için, özel isteklerinizi ve mesajlarınızı işleyen bir **Pano eklentisi** (backend tarafında) oluşturmanız **şiddetle önerilir**.

### Pano Eklenti Yapısı

Özel entegrasyon mantığınızı işlemek için Pano'nun backend'inde bir eklenti oluşturun:

```kotlin
// Pano eklentinizde (backend)
class MyIntegrationPanoPlugin : PanoPlugin() {

    override fun onEnable() {
        // İstek handler'larını kaydet
        registerRequestHandler("player_join") { data, connection ->
            handlePlayerJoin(data, connection)
        }

        registerRequestHandler("player_stats") { data, connection ->
            handlePlayerStatsRequest(data, connection)
        }
    }

    private fun handlePlayerJoin(data: Map<String, Any>, connection: Connection) {
        val playerName = data["player"] as String
        val uuid = data["uuid"] as String
        
        // Veritabanına kaydet, event tetikle vb.
        database.updatePlayerLastJoin(uuid)
        
        // İsteğe bağlı yanıt gönder
        connection.sendResponse("success", mapOf("message" to "Giriş kaydedildi"))
    }

    private fun handlePlayerStatsRequest(data: Map<String, Any>, connection: Connection) {
        val uuid = data["uuid"] as String
        val stats = database.getPlayerStats(uuid)
        
        // İstatistikleri MC eklentisine geri gönder
        connection.sendResponse("player_stats_response", stats)
    }
}
```

### Pano'dan Minecraft'a Mesaj Gönderme

Pano eklentinizden bağlı Minecraft sunucularına mesaj gönderebilirsiniz:

```kotlin
// Oyuncuya ödül gönder
platformManager.sendMessage("player_reward", mapOf(
    "playerName" to "Steve",
    "reward" to "coins",
    "amount" to 100
))
```

Bu mesaj, Minecraft sunucusundaki `PlayerRewardHandler` tarafından alınacaktır.

## 🔒 Güvenlik En İyi Uygulamaları

1. **Tüm Verileri Doğrulayın** — Gelen verilere doğrulama olmadan asla güvenmeyin
2. **Pano'nun Şifrelemesini Kullanın** — Tüm iletişim WebSocket üzerinden otomatik olarak şifrelenir
3. **İzinleri Kontrol Edin** — İşlemleri yürütmeden önce kullanıcı izinlerini doğrulayın
4. **Girişleri Temizleyin** — Enjeksiyon saldırılarını önleyin
5. **Hız Sınırlama** — Sık işlemler için hız sınırları uygulayın
6. **Hata Yönetimi** — Hataları her zaman düzgün bir şekilde ele alın

## 📦 Örnek Proje

Örnek entegrasyon eklentisi repository'mize göz atın:

- [Örnek Entegrasyon Eklentisi](https://github.com/PanoMC/example-integration-plugin) (Referans implementasyon)

Bu repository şunları gösterir:
- Pano MC Eklentisi API dependency kurulumu
- Özel istek ve handler'lar oluşturma
- Üçüncü taraf eklentilere bağlanma
- En iyi uygulamalar ve desenler

## 🧪 Entegrasyonunuzu Test Etme

### Yerel Test

1. Eklentinizi build edin:
```bash
./gradlew build
```

2. JAR dosyasını test sunucunuzun `plugins/` klasörüne kopyalayın
3. Pano MC Eklentisinin kurulu ve bağlı olduğundan emin olun
4. Hedef eklentinizi kurun
5. Sunucuyu başlatın ve işlevselliği test edin

### Hata Ayıklama (Debugging)

Eklentinizde hata ayıklama günlüğünü etkinleştirin:

```kotlin
if (config.getBoolean("debug", false)) {
    logger.info("[Debug] İstek gönderildi: ${request.getRequestType()}")
}
```

## 📚 API Referansı

### PlatformManager Metotları

```kotlin
interface PlatformManager {
    // Pano'ya istek gönder
    fun sendRequest(request: PlatformRequest)
    
    // Mesaj handler'ı kaydet
    fun registerMessageHandler(handler: PlatformMessageHandler<*>)
    
    // Pano'ya bağlı mı kontrol et
    fun isConnected(): Boolean
    
    // Bağlantı durumunu al
    fun getConnectionStatus(): ConnectionStatus
}
```

### PlatformRequest

```kotlin
abstract class PlatformRequest {
    abstract fun getRequestType(): String
    abstract fun getData(): Map<String, Any>
}
```

### PlatformMessageResponse

```kotlin
interface PlatformMessageResponse {
    fun onResponse(response: Map<String, Any>)
    fun onError(error: String)
}
```

### PlatformMessageHandler

```kotlin
abstract class PlatformMessageHandler<R : PlatformMessage> {
    abstract fun handle(message: R)
    abstract fun getMessageType(): String
}
```

## 💬 Yardıma mı İhtiyacınız Var?

- **Discord:** [Geliştirme kanalımıza](https://discord.gg/6vVy72wgXT) katılın
- **GitHub Discussions:** [Pano MC Eklentisi Discussions](https://github.com/PanoMC/pano-mc-plugin/discussions)
- **Issue Tracker:** [Hata bildirin veya özellik isteyin](https://github.com/PanoMC/pano-mc-plugin/issues)
- **Örnek Proje:** [Referans İmplementasyon](https://github.com/PanoMC/example-integration-plugin)

## 📚 İlgili Dokümantasyon

- [Platform Entegrasyonları](../../platform/integrations/)
- [AuthMeReloaded Entegrasyonu](../../platform/integrations/authme/)
- [Pano MC Eklentisi Repository](https://github.com/PanoMC/pano-mc-plugin)
- [Addon Geliştirme](../../addon/getting-started/)

> Mutlu kodlamalar! 🚀
