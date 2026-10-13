# Pano Backend'ini Genişletme

## Pano'nun Backend'ini Genişletme (Önerilen)

Minecraft eklentinizin gönderdiği bir istek, Pano'da bir şey onu işleyene kadar hiçbir şey yapmaz. Her istek için bir sunucu olayı içeren bir **Pano eklentisi** (backend tarafında) oluşturun.

### Pano Eklenti Yapısı

Bir sunucu olayı `ServerEvent<Request, Response>` sınıfını genişletir. Olay adı, sınıf adının `Event` çıkarılmış, büyük harfli snake case halidir; yani `MyPlayerStatsEvent`, `MY_PLAYER_STATS` isteğini işler. Yanıtın adı, sınıf adının `EventResponse` çıkarılmış halidir. Pano isteği Gson ile doldurur: her property'ye varsayılan bir değer verin.

```kotlin
// In your Pano plugin (backend)
import com.panomc.platform.api.PanoPlugin
import com.panomc.platform.db.model.Server
import com.panomc.platform.server.ServerEvent
import com.panomc.platform.server.ServerEventRequest
import com.panomc.platform.server.ServerEventResponse
import com.panomc.platform.server.ServerManager

// MY_PLAYER_JOIN: no answer
class MyPlayerJoinEventRequest(
    val player: String = "",
    val uuid: String = ""
) : ServerEventRequest()

class MyPlayerJoinEvent : ServerEvent<MyPlayerJoinEventRequest, ServerEventResponse>() {
    override suspend fun handle(request: MyPlayerJoinEventRequest, server: Server): ServerEventResponse? {
        // Store in database, trigger events, etc.
        return null
    }
}

// MY_PLAYER_STATS: answered
class MyPlayerStatsEventRequest(val uuid: String = "") : ServerEventRequest()

data class MyPlayerStatsEventResponse(
    val kills: Int = 0,
    val deaths: Int = 0
) : ServerEventResponse()

class MyPlayerStatsEvent : ServerEvent<MyPlayerStatsEventRequest, MyPlayerStatsEventResponse>() {
    override suspend fun handle(request: MyPlayerStatsEventRequest, server: Server): MyPlayerStatsEventResponse {
        // Load the stats of request.uuid from your own tables
        return MyPlayerStatsEventResponse(kills = 12, deaths = 3)
    }
}

class MyIntegrationPanoPlugin : PanoPlugin() {
    private val events = listOf<ServerEvent<*, *>>(MyPlayerJoinEvent(), MyPlayerStatsEvent())

    override suspend fun onStart() {
        val serverManager = applicationContext.getBean(ServerManager::class.java)

        events.forEach {
            serverManager.unregisterEvent(it)
            serverManager.registerEvent(it)
        }
    }

    override suspend fun onStop() {
        val serverManager = applicationContext.getBean(ServerManager::class.java)

        events.forEach { serverManager.unregisterEvent(it) }
    }
}
```

Yanıtlanacak bir şey yoksa `null` döndürün. `server`, isteği gönderen Minecraft sunucusudur; bağlantı kimliği doğrulanmış olduğundan ona güvenebilirsiniz.

### Pano'dan Minecraft'a Mesaj Gönderme

`ServerManager.sendMessage`, bağlı bir sunucuya mesaj gönderir:

```kotlin
import com.panomc.platform.server.PlatformMessage

// Sent as the message PLAYER_REWARD
data class PlayerRewardMessage(
    val playerName: String,
    val reward: String,
    val amount: Int
) : PlatformMessage

// false when the server is not connected
val sent: Boolean = serverManager.sendMessage(serverId, PlayerRewardMessage("Steve", "coins", 100))
```

::: warning
Pano MC Eklentisi, gönderilen bir mesajı yalnızca kendi yerleşik işleyicilerine iletir; bu yüzden başka bir Minecraft eklentisi `PLAYER_REWARD` mesajını hiç görmez. Eklentinize bir şey ulaştırmak için onun sormasını sağlayın: sunucudan bir istek gönderin (örneğin birkaç saniyede bir) ve bekleyenleri yanıtta döndürün.
:::
## Güvenlik En İyi Uygulamaları

1. **Tüm Verileri Doğrulayın** — Gelen verilere doğrulama olmadan asla güvenmeyin
2. **Pano'nun Şifrelemesini Kullanın** — Sunucu bağlantısındaki mesajlar otomatik olarak AES-256-GCM ile şifrelenir
3. **İzinleri Kontrol Edin** — İşlemleri yürütmeden önce kullanıcı izinlerini doğrulayın
4. **Girişleri Temizleyin** — Enjeksiyon saldırılarını önleyin
5. **Hız Sınırlama** — Sık işlemler için hız sınırları uygulayın
6. **Hata Yönetimi** — Hataları her zaman düzgün bir şekilde ele alın
