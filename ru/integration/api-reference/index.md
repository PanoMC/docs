# Справочник API

## Справочник API

### Методы PlatformManager

Его получают у Pano MC Plugin: `(pluginManager.getPlugin("Pano") as PanoPluginMain).getPano().platformManager`.

```kotlin
// com.panomc.plugins.pano.core.platform
class PlatformManager {
    // Send a request to Pano without waiting for an answer
    fun sendMessage(platformRequest: PlatformRequest)

    // Send a request and wait for its answer (15 seconds by default)
    suspend fun <T : PlatformMessageResponse> sendMessageAwaitResponse(
        platformRequest: PlatformRequest,
        responseType: Class<out PlatformMessageResponse>,
        timeoutMillis: Long
    ): T

    // A platform (token and encryption key) is saved in the plugin's config
    fun isPlatformConfigured(): Boolean

    // The open connection, null while not connected
    fun getWebSocket(): WebSocket?

    // Get connection status
    fun connectionStatus(): ConnectionStatus
}
```

### PlatformRequest

```kotlin
abstract class PlatformRequest(val eventId: UUID = UUID.randomUUID()) {
    open fun encode(): String
}
```

### PlatformMessageResponse

```kotlin
interface PlatformMessage

interface PlatformMessageResponse : PlatformMessage
```

### PlatformMessageHandler

Используется только встроенными обработчиками Pano MC Plugin.

```kotlin
abstract class PlatformMessageHandler<R : PlatformMessage> {
    abstract suspend fun handle(response: R)
    fun getHandlerName(): String
}
```

### Бэкенд (плагин Pano)

```kotlin
// com.panomc.platform.server
abstract class ServerEvent<R : ServerEventRequest, M : ServerEventResponse> {
    abstract suspend fun handle(request: R, server: Server): M?
    fun getEventName(): String
}

class ServerManager {
    fun registerEvent(event: ServerEvent<*, *>)
    fun unregisterEvent(event: ServerEvent<*, *>)
    fun sendMessage(serverId: Long, platformMessage: PlatformMessage): Boolean
}
```
## Нужна помощь?

- **Discord:** Присоединяйтесь к нашему [каналу разработки](https://discord.gg/6vVy72wgXT).
- **Трекер ошибок:** [Сообщайте об ошибках или предлагайте функции](https://github.com/PanoMC/pano-mc-plugin/issues).
## Связанная документация

- [Интеграции платформы](../../platform/integrations/)
- [Интеграция с AuthMeReloaded](../../platform/integrations/authme/)
- [Репозиторий Pano MC Plugin](https://github.com/PanoMC/pano-mc-plugin)
- [Разработка аддонов](../../addon/getting-started/)

> Приятного кодинга!
