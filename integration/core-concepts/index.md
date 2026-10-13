# Core API Concepts

## Core API Concepts

The classes live in the `Core` module of the Pano MC Plugin, package `com.panomc.plugins.pano.core.platform`. Every message is JSON with an `event` name and an `eventId`, encrypted with AES-256-GCM.

### 1. PlatformRequest

A message from the Minecraft server to Pano is a class that extends `PlatformRequest`:

```kotlin
package com.panomc.plugins.pano.core.platform

abstract class PlatformRequest(val eventId: UUID = UUID.randomUUID()) {
    open fun encode(): String
}
```

There is nothing to override. The event name is the class name without `Request`, in upper snake case (`MyPlayerJoinRequest` becomes `MY_PLAYER_JOIN`), and every public property becomes a JSON field:

```kotlin
import com.panomc.plugins.pano.core.platform.PlatformRequest

// Sent as {"event":"MY_PLAYER_JOIN","eventId":"...","player":"Steve","uuid":"..."}
class MyPlayerJoinRequest(
    val player: String,
    val uuid: String
) : PlatformRequest()
```

Send it with `platformManager.sendMessage(request)` when you expect no answer.

### 2. PlatformMessageResponse

If you expect an answer from Pano, describe it with a class that implements `PlatformMessageResponse`:

```kotlin
package com.panomc.plugins.pano.core.platform

interface PlatformMessageResponse : PlatformMessage
```

The class name without `Message`, in upper snake case, must be the event name of the request (`MyPlayerStatsMessage` answers `MY_PLAYER_STATS`). Pano fills it with Gson, so give every property a default value.

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

`sendMessageAwaitResponse` is a `suspend` function. It throws when the server is not connected to Pano, when the answer has another type, or when no answer arrives in time (15 seconds by default).

### 3. PlatformMessageHandler

A message that Pano pushes on its own is handled by a `PlatformMessageHandler<R : PlatformMessage>`:

```kotlin
package com.panomc.plugins.pano.core.platform

abstract class PlatformMessageHandler<R : PlatformMessage> {
    abstract suspend fun handle(response: R)
    fun getHandlerName(): String
}
```

The handler name is the class name without `Handler`, in upper snake case.

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
The handlers are a fixed list inside the Pano MC Plugin; another plugin cannot register its own. To get something from Pano, send a request and await the answer (for example on a timer), as the examples in [Creating a Plugin](../creating-plugin/) do.
:::
