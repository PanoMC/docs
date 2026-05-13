# Testing & Examples

## Example Project

Check out our example integration plugin repository:

- [Example Integration Plugin](https://github.com/PanoMC/example-integration-plugin) (Reference implementation)

This repository demonstrates:
- Setting up Pano MC Plugin API dependency
- Creating custom requests and handlers
- Hooking into third-party plugins
- Best practices and patterns
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
    logger.info("[Debug] Request sent: ${request.getRequestType()}")
}
```
