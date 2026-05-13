# Core API Concepts

## Core API Concepts

### 1. PlatformRequest

To send a request to Pano's web platform, extend the `PlatformRequest` abstract class:

```kotlin
abstract class PlatformRequest {
    abstract fun getRequestType(): String
    abstract fun getData(): Map<String, Any>
}
```

::: code-group

```kotlin [Kotlin]
import com.panomc.plugin.api.PlatformRequest

class MyCustomRequest(
    private val playerName: String,
    private val data: String
) : PlatformRequest() {

    override fun getRequestType(): String = "my_custom_request"

    override fun getData(): Map<String, Any> {
        return mapOf(
            "player" to playerName,
            "data" to data,
            "timestamp" to System.currentTimeMillis()
        )
    }
}
```

```java [Java]
import com.panomc.plugin.api.PlatformRequest;
import java.util.HashMap;
import java.util.Map;

public class MyCustomRequest extends PlatformRequest {
    private final String playerName;
    private final String data;

    public MyCustomRequest(String playerName, String data) {
        this.playerName = playerName;
        this.data = data;
    }

    @Override
    public String getRequestType() {
        return "my_custom_request";
    }

    @Override
    public Map<String, Object> getData() {
        Map<String, Object> dataMap = new HashMap<>();
        dataMap.put("player", playerName);
        dataMap.put("data", data);
        dataMap.put("timestamp", System.currentTimeMillis());
        return dataMap;
    }
}
```

:::

### 2. PlatformMessageResponse

If you expect a response from Pano, extend the `PlatformMessageResponse` interface:

```kotlin
interface PlatformMessageResponse {
    fun onResponse(response: Map<String, Any>)
    fun onError(error: String)
}
```

::: code-group

```kotlin [Kotlin]
import com.panomc.plugin.api.PlatformMessageResponse

class MyRequestWithResponse(
    private val playerName: String
) : PlatformRequest(), PlatformMessageResponse {

    override fun getRequestType(): String = "player_data_request"

    override fun getData(): Map<String, Any> {
        return mapOf("player" to playerName)
    }

    override fun onResponse(response: Map<String, Any>) {
        // Handle successful response
        val points = response["points"] as? Int ?: 0
        println("Player $playerName has $points points")
    }

    override fun onError(error: String) {
        // Handle error
        println("Error: $error")
    }
}
```

```java [Java]
import com.panomc.plugin.api.PlatformRequest;
import com.panomc.plugin.api.PlatformMessageResponse;
import java.util.HashMap;
import java.util.Map;

public class MyRequestWithResponse extends PlatformRequest implements PlatformMessageResponse {
    private final String playerName;

    public MyRequestWithResponse(String playerName) {
        this.playerName = playerName;
    }

    @Override
    public String getRequestType() {
        return "player_data_request";
    }

    @Override
    public Map<String, Object> getData() {
        Map<String, Object> data = new HashMap<>();
        data.put("player", playerName);
        return data;
    }

    @Override
    public void onResponse(Map<String, Object> response) {
        // Handle successful response
        Integer points = (Integer) response.getOrDefault("points", 0);
        System.out.println("Player " + playerName + " has " + points + " points");
    }

    @Override
    public void onError(String error) {
        // Handle error
        System.out.println("Error: " + error);
    }
}
```

:::

### 3. PlatformMessageHandler

To receive and handle messages from Pano's web platform, extend `PlatformMessageHandler<R : PlatformMessage>`:

```kotlin
abstract class PlatformMessageHandler<R : PlatformMessage> {
    abstract fun handle(message: R)
    abstract fun getMessageType(): String
}
```

::: code-group

```kotlin [Kotlin]
import com.panomc.plugin.api.PlatformMessageHandler
import com.panomc.plugin.api.PlatformMessage
import com.panomc.plugin.api.PlatformManager

// Define your message structure
data class PlayerRewardMessage(
    val playerName: String,
    val reward: String,
    val amount: Int
) : PlatformMessage

// Create a handler
class PlayerRewardHandler : PlatformMessageHandler<PlayerRewardMessage>() {

    override fun getMessageType(): String = "player_reward"

    override fun handle(message: PlayerRewardMessage) {
        val player = Bukkit.getPlayer(message.playerName)
        if (player != null) {
            // Give reward to player
            when (message.reward) {
                "coins" -> giveCoins(player, message.amount)
                "items" -> giveItems(player, message.amount)
            }
            player.sendMessage("You received ${message.amount} ${message.reward}!")
        }
    }
}

// Register the handler
fun registerHandlers(platformManager: PlatformManager) {
    platformManager.registerMessageHandler(PlayerRewardHandler())
}
```

```java [Java]
import com.panomc.plugin.api.PlatformMessageHandler;
import com.panomc.plugin.api.PlatformMessage;
import com.panomc.plugin.api.PlatformManager;
import org.bukkit.Bukkit;
import org.bukkit.entity.Player;

// Define your message structure
public class PlayerRewardMessage implements PlatformMessage {
    private final String playerName;
    private final String reward;
    private final int amount;

    public PlayerRewardMessage(String playerName, String reward, int amount) {
        this.playerName = playerName;
        this.reward = reward;
        this.amount = amount;
    }

    public String getPlayerName() { return playerName; }
    public String getReward() { return reward; }
    public int getAmount() { return amount; }
}

// Create a handler
public class PlayerRewardHandler extends PlatformMessageHandler<PlayerRewardMessage> {

    @Override
    public String getMessageType() {
        return "player_reward";
    }

    @Override
    public void handle(PlayerRewardMessage message) {
        Player player = Bukkit.getPlayer(message.getPlayerName());
        if (player != null) {
            // Give reward to player
            switch (message.getReward()) {
                case "coins":
                    giveCoins(player, message.getAmount());
                    break;
                case "items":
                    giveItems(player, message.getAmount());
                    break;
            }
            player.sendMessage("You received " + message.getAmount() + " " + message.getReward() + "!");
        }
    }
}

// Register the handler
public void registerHandlers(PlatformManager platformManager) {
    platformManager.registerMessageHandler(new PlayerRewardHandler());
}
```

:::
