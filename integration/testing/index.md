# Testing & Examples

## Example Project

There is no separate example repository. The Pano MC Plugin's own messages are the reference; they use the same classes as your plugin:

- [Requests](https://github.com/PanoMC/pano-mc-plugin/tree/alpha/Core/src/main/kotlin/com/panomc/plugins/pano/core/platform/request) (for example `GetPlayerInfoRequest`)
- [Responses](https://github.com/PanoMC/pano-mc-plugin/tree/alpha/Core/src/main/kotlin/com/panomc/plugins/pano/core/platform/message/response) (for example `GetPlayerInfoMessage`)
## Testing Your Integration

### Local Testing

1. Build your plugin:
```bash
./gradlew build
```

2. Copy the JAR to your test server's `plugins/` folder
3. Ensure Pano MC Plugin is installed and connected
4. Install your target plugin
5. Start the server and test functionality

### Debugging

Enable debug logging in your plugin:

```kotlin
if (config.getBoolean("debug", false)) {
    logger.info("[Debug] Request sent: ${request::class.simpleName} (${request.eventId})")
}
```
