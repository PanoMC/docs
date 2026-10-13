# API Referansı

## API Referansı

### PlatformManager Metotları

Pano MC Eklentisi'nden alınır: `(pluginManager.getPlugin("Pano") as PanoPluginMain).getPano().platformManager`.

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

Yalnızca Pano MC Eklentisi'nin yerleşik işleyicileri tarafından kullanılır.

```kotlin
abstract class PlatformMessageHandler<R : PlatformMessage> {
    abstract suspend fun handle(response: R)
    fun getHandlerName(): String
}
```

### Backend (Pano eklentisi)

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
## Yardıma mı İhtiyacınız Var?

- **Discord:** [Geliştirme kanalımıza](https://discord.gg/6vVy72wgXT) katılın
- **Issue Tracker:** [Hata bildirin veya özellik isteyin](https://github.com/PanoMC/pano-mc-plugin/issues)
## İlgili Dokümantasyon

- [Platform Entegrasyonları](../../platform/integrations/)
- [AuthMeReloaded Entegrasyonu](../../platform/integrations/authme/)
- [Pano MC Eklentisi Repository](https://github.com/PanoMC/pano-mc-plugin)
- [Addon Geliştirme](../../addon/getting-started/)

> Mutlu kodlamalar!
