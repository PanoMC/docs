# API Reference

## API Reference

### PlatformManager Methods

```kotlin
interface PlatformManager {
    // Send a request to Pano
    fun sendRequest(request: PlatformRequest)
    
    // Register a message handler
    fun registerMessageHandler(handler: PlatformMessageHandler<*>)
    
    // Check if connected to Pano
    fun isConnected(): Boolean
    
    // Get connection status
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
## Need Help?

- **Discord:** Join our [development channel](https://discord.gg/6vVy72wgXT)
- **GitHub Discussions:** [Pano MC Plugin Discussions](https://github.com/PanoMC/pano-mc-plugin/discussions)
- **Issue Tracker:** [Report bugs or request features](https://github.com/PanoMC/pano-mc-plugin/issues)
- **Example Project:** [Reference Implementation](https://github.com/PanoMC/example-integration-plugin)
## Related Documentation

- [Platform Integrations](../../platform/integrations/)
- [AuthMeReloaded Integration](../../platform/integrations/authme/)
- [Pano MC Plugin Repository](https://github.com/PanoMC/pano-mc-plugin)
- [Addon Development](../../addon/getting-started/)

> Happy coding!
