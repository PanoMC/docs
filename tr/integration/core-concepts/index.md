# Temel API Kavramları

## Temel API Kavramları

Sınıflar Pano MC Eklentisi'nin `Core` modülünde, `com.panomc.plugins.pano.core.platform` paketinde bulunur. Her mesaj, bir `event` adı ve bir `eventId` taşıyan, AES-256-GCM ile şifrelenmiş JSON'dur.

### 1. PlatformRequest

Minecraft sunucusundan Pano'ya giden bir mesaj, `PlatformRequest` sınıfını genişleten bir sınıftır:

```kotlin
package com.panomc.plugins.pano.core.platform

abstract class PlatformRequest(val eventId: UUID = UUID.randomUUID()) {
    open fun encode(): String
}
```

Override edilecek bir şey yoktur. Olay adı, sınıf adının `Request` çıkarılmış ve büyük harfli snake case'e çevrilmiş halidir (`MyPlayerJoinRequest`, `MY_PLAYER_JOIN` olur); her public property bir JSON alanı olur:

```kotlin
import com.panomc.plugins.pano.core.platform.PlatformRequest

// Sent as {"event":"MY_PLAYER_JOIN","eventId":"...","player":"Steve","uuid":"..."}
class MyPlayerJoinRequest(
    val player: String,
    val uuid: String
) : PlatformRequest()
```

Yanıt beklemiyorsanız `platformManager.sendMessage(request)` ile gönderin.

### 2. PlatformMessageResponse

Pano'dan bir yanıt bekliyorsanız, onu `PlatformMessageResponse` arayüzünü uygulayan bir sınıfla tanımlayın:

```kotlin
package com.panomc.plugins.pano.core.platform

interface PlatformMessageResponse : PlatformMessage
```

Sınıf adının `Message` çıkarılmış, büyük harfli snake case hali isteğin olay adı olmalıdır (`MyPlayerStatsMessage`, `MY_PLAYER_STATS` olayını yanıtlar). Pano bu sınıfı Gson ile doldurur; bu yüzden her property'ye varsayılan bir değer verin.

```kotlin
import com.panomc.plugins.pano.core.platform.PlatformMessageResponse
import com.panomc.plugins.pano.core.platform.PlatformRequest

class MyPlayerStatsRequest(val uuid: String) : PlatformRequest()

// Answers the event MY_PLAYER_STATS
data class MyPlayerStatsMessage(
    val kills: Int = 0,
    val deaths: Int = 0
) : PlatformMessageResponse

suspend fun fetchStats(platformManager: PlatformManager, uuid: String): MyPlayerStatsMessage =
    platformManager.sendMessageAwaitResponse<MyPlayerStatsMessage>(
        MyPlayerStatsRequest(uuid),
        MyPlayerStatsMessage::class.java,
        10_000
    )
```

`sendMessageAwaitResponse` bir `suspend` fonksiyondur. Sunucu Pano'ya bağlı değilse, yanıt başka bir türdeyse veya yanıt zamanında gelmezse (varsayılan 15 saniye) hata fırlatır.

### 3. PlatformMessageHandler

Pano'nun kendiliğinden gönderdiği bir mesajı bir `PlatformMessageHandler<R : PlatformMessage>` işler:

```kotlin
package com.panomc.plugins.pano.core.platform

abstract class PlatformMessageHandler<R : PlatformMessage> {
    abstract suspend fun handle(response: R)
    fun getHandlerName(): String
}
```

İşleyici adı, sınıf adının `Handler` çıkarılmış, büyük harfli snake case halidir.

```kotlin
// From the Pano MC Plugin itself: handles the message POWER
class PowerHandler(
    private val pluginMain: PanoPluginMain,
    private val logger: Logger
) : PlatformMessageHandler<PowerMessage>() {
    override suspend fun handle(response: PowerMessage) {
        when (response.action?.trim()?.uppercase()) {
            "STOP" -> pluginMain.shutdown()
            "RESTART" -> pluginMain.restart()
        }
    }
}
```

::: warning
İşleyiciler Pano MC Eklentisi'nin içindeki sabit bir listedir; başka bir eklenti kendi işleyicisini kaydedemez. Pano'dan bir şey almak için bir istek gönderin ve yanıtını bekleyin (örneğin bir zamanlayıcıyla); [Eklenti Oluşturma](../creating-plugin/) sayfasındaki örnekler böyle yapar.
:::
