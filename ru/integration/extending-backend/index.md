# Расширение бэкенда Pano

## Расширение бэкенда Pano (рекомендуется)

Запрос, который отправляет ваш плагин Minecraft, ничего не делает, пока что-то в Pano его не обработает. Создайте **плагин Pano** (на стороне бэкенда) с одним серверным событием на каждый запрос.

### Структура плагина Pano

Серверное событие наследует `ServerEvent<Request, Response>`. Имя события — это имя класса без `Event` в верхнем snake case, то есть `MyPlayerStatsEvent` обрабатывает `MY_PLAYER_STATS`. Имя ответа — это имя класса без `EventResponse`. Pano заполняет запрос через Gson: задайте каждому свойству значение по умолчанию.

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

Верните `null`, если отвечать нечего. `server` — это сервер Minecraft, отправивший запрос; соединение аутентифицировано, поэтому ему можно доверять.

### Отправка сообщений из Pano в Minecraft

`ServerManager.sendMessage` отправляет сообщение одному подключённому серверу:

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
Pano MC Plugin передаёт такое сообщение только своим встроенным обработчикам, поэтому другой плагин Minecraft никогда не увидит `PLAYER_REWARD`. Чтобы доставить что-то вашему плагину, пусть он спрашивает сам: отправляйте запрос с сервера (например, раз в несколько секунд) и возвращайте в ответе то, что ожидает доставки.
:::
## Лучшие практики безопасности

1. **Проверяйте все данные** — никогда не доверяйте входящим данным без валидации.
2. **Используйте шифрование Pano** — сообщения в соединении с сервером автоматически шифруются AES-256-GCM.
3. **Проверяйте права доступа** — убедитесь в наличии прав у пользователя перед выполнением действий.
4. **Очищайте ввод** — предотвращайте инъекционные атаки.
5. **Ограничение частоты (Rate Limiting)** — внедряйте ограничения для частых операций.
6. **Обработка ошибок** — всегда корректно обрабатывайте ошибки.
