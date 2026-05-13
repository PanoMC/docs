# Extending Pano's Backend

## Extending Pano's Backend (Recommended)

For a complete integration, it's **highly recommended** to also create a **Pano plugin** (backend side) that handles your custom requests and messages.

### Pano Plugin Structure

Create a plugin in Pano's backend to handle your integration logic:

```kotlin
// In your Pano plugin (backend)
class MyIntegrationPanoPlugin : PanoPlugin() {

    override fun onEnable() {
        // Register request handlers
        registerRequestHandler("player_join") { data, connection ->
            handlePlayerJoin(data, connection)
        }

        registerRequestHandler("player_stats") { data, connection ->
            handlePlayerStatsRequest(data, connection)
        }
    }

    private fun handlePlayerJoin(data: Map<String, Any>, connection: Connection) {
        val playerName = data["player"] as String
        val uuid = data["uuid"] as String
        
        // Store in database, trigger events, etc.
        database.updatePlayerLastJoin(uuid)
        
        // Optionally send response
        connection.sendResponse("success", mapOf("message" to "Join recorded"))
    }

    private fun handlePlayerStatsRequest(data: Map<String, Any>, connection: Connection) {
        val uuid = data["uuid"] as String
        val stats = database.getPlayerStats(uuid)
        
        // Send stats back to MC plugin
        connection.sendResponse("player_stats_response", stats)
    }
}
```

### Sending Messages from Pano to Minecraft

From your Pano plugin, you can send messages to connected Minecraft servers:

```kotlin
// Send reward to player
platformManager.sendMessage("player_reward", mapOf(
    "playerName" to "Steve",
    "reward" to "coins",
    "amount" to 100
))
```

This message will be received by your `PlayerRewardHandler` on the Minecraft server.
## Security Best Practices

1. **Validate All Data** — Never trust incoming data without validation
2. **Use Pano's Encryption** — All communication is automatically encrypted via WebSocket
3. **Check Permissions** — Verify user permissions before executing actions
4. **Sanitize Input** — Prevent injection attacks
5. **Rate Limiting** — Implement rate limits for frequent operations
6. **Error Handling** — Always handle errors gracefully
