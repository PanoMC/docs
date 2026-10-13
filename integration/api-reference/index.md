# API Reference

## API Reference

### PlatformManager Methods

Get it from the Pano MC Plugin: `(pluginManager.getPlugin("Pano") as PanoPluginMain).getPano().platformManager`.

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

Used by the Pano MC Plugin's built-in handlers only.

```kotlin
abstract class PlatformMessageHandler<R : PlatformMessage> {
    abstract suspend fun handle(response: R)
    fun getHandlerName(): String
}
```

### Backend (Pano plugin)

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
## Need Help?

- **Discord:** Join our [development channel](https://discord.gg/6vVy72wgXT)
- **Issue Tracker:** [Report bugs or request features](https://github.com/PanoMC/pano-mc-plugin/issues)
## Related Documentation

- [Platform Integrations](../../platform/integrations/)
- [AuthMeReloaded Integration](../../platform/integrations/authme/)
- [Pano MC Plugin Repository](https://github.com/PanoMC/pano-mc-plugin)
- [Addon Development](../../addon/getting-started/)

> Happy coding!
