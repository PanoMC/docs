# Основные концепции API

## Основные концепции API

Классы находятся в модуле `Core` плагина Pano MC Plugin, в пакете `com.panomc.plugins.pano.core.platform`. Каждое сообщение — это JSON с именем `event` и идентификатором `eventId`, зашифрованный AES-256-GCM.

### 1. PlatformRequest

Сообщение от сервера Minecraft к Pano — это класс, наследующий `PlatformRequest`:

```kotlin
package com.panomc.plugins.pano.core.platform

abstract class PlatformRequest(val eventId: UUID = UUID.randomUUID()) {
    open fun encode(): String
}
```

Переопределять ничего не нужно. Имя события — это имя класса без `Request` в верхнем snake case (`MyPlayerJoinRequest` становится `MY_PLAYER_JOIN`), а каждое публичное свойство становится полем JSON:

```kotlin
import com.panomc.plugins.pano.core.platform.PlatformRequest

// Sent as {"event":"MY_PLAYER_JOIN","eventId":"...","player":"Steve","uuid":"..."}
class MyPlayerJoinRequest(
    val player: String,
    val uuid: String
) : PlatformRequest()
```

Если ответ не нужен, отправьте его через `platformManager.sendMessage(request)`.

### 2. PlatformMessageResponse

Если вы ожидаете ответ от Pano, опишите его классом, реализующим `PlatformMessageResponse`:

```kotlin
package com.panomc.plugins.pano.core.platform

interface PlatformMessageResponse : PlatformMessage
```

Имя класса без `Message` в верхнем snake case должно совпадать с именем события запроса (`MyPlayerStatsMessage` отвечает на `MY_PLAYER_STATS`). Pano заполняет его через Gson, поэтому задайте каждому свойству значение по умолчанию.

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

`sendMessageAwaitResponse` — это `suspend`-функция. Она бросает исключение, если сервер не подключён к Pano, если ответ другого типа или если ответ не пришёл вовремя (по умолчанию 15 секунд).

### 3. PlatformMessageHandler

Сообщение, которое Pano отправляет само, обрабатывает `PlatformMessageHandler<R : PlatformMessage>`:

```kotlin
package com.panomc.plugins.pano.core.platform

abstract class PlatformMessageHandler<R : PlatformMessage> {
    abstract suspend fun handle(response: R)
    fun getHandlerName(): String
}
```

Имя обработчика — это имя класса без `Handler` в верхнем snake case.

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
Обработчики — это фиксированный список внутри Pano MC Plugin; другой плагин не может зарегистрировать свой. Чтобы получить что-то от Pano, отправьте запрос и дождитесь ответа (например, по таймеру), как в примерах на странице [Создание плагина](../creating-plugin/).
:::
