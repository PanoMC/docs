# Extending Pano's Backend

## Extending Pano's Backend (Recommended)

A request your Minecraft plugin sends does nothing until something in Pano handles it. Create a **Pano plugin** (backend side) with one server event per request.

### Pano Plugin Structure

A server event extends `ServerEvent<Request, Response>`. Its event name is the class name without `Event`, in upper snake case, so `MyPlayerStatsEvent` handles `MY_PLAYER_STATS`. The response name is the class name without `EventResponse`. Pano fills the request with Gson: give every property a default value.

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

Return `null` when there is nothing to answer. `server` is the Minecraft server that sent the request; the connection is authenticated, so you can trust it.

### Sending Messages from Pano to Minecraft

`ServerManager.sendMessage` pushes a message to one connected server:

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
The Pano MC Plugin passes a pushed message only to its own built-in handlers, so another Minecraft plugin never sees `PLAYER_REWARD`. To deliver something to your plugin, let it ask: send a request from the server (for example every few seconds) and return what is waiting in the response.
:::
## Security Best Practices

1. **Validate All Data** — Never trust incoming data without validation
2. **Use Pano's Encryption** — Messages on the server connection are encrypted with AES-256-GCM automatically
3. **Check Permissions** — Verify user permissions before executing actions
4. **Sanitize Input** — Prevent injection attacks
5. **Rate Limiting** — Implement rate limits for frequent operations
6. **Error Handling** — Always handle errors gracefully
