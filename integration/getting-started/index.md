# Getting Started with Integration Development

This guide will help you create custom integrations between Pano and Minecraft server plugins using the **Pano MC Plugin API**.

## 🎯 What is Integration Development?

Integration development allows you to create seamless connections between third-party Minecraft plugins and Pano's web platform. By using the Pano MC Plugin API, you can:

- Synchronize data between game and web in real-time
- Send requests from your Minecraft plugin to Pano's web platform
- Receive and handle messages from Pano
- Trigger web actions from in-game events
- Create unified experiences across both platforms

## 🔧 Prerequisites

Before you start developing integrations, make sure you have:

1. **Java Development Kit (JDK 11+)** — Required for plugin development
2. **Java or Kotlin Knowledge** — You can use either language with the Pano MC Plugin API
3. **Minecraft Plugin Development Experience** — Understanding of Spigot/Paper/Bukkit API
4. **Pano MC Plugin API** — [GitHub Repository](https://github.com/PanoMC/pano-mc-plugin)
5. **A Running Pano Instance** — For testing your integration
6. **A Minecraft Test Server** — Spigot, Paper, or Folia server for development

> 💡 **Note:** All examples in this guide are provided in both **Kotlin** and **Java** for your convenience.

## 🏗️ Architecture Overview

Pano's integration system consists of three main components:

```
┌─────────────────────┐         ┌──────────────────────┐         ┌─────────────────┐
│  Your MC Plugin     │ ◄─────► │  Pano MC Plugin      │ ◄─────► │  Pano Backend   │
│  (Integration)      │         │  (Communication API) │         │  (Web Platform) │
└─────────────────────┘         └──────────────────────┘         └─────────────────┘
    (Plugin Hooks)              (Secure WebSocket API)            (Platform API)
```

### Communication Flow

1. **Your Plugin → Pano MC Plugin API:** You use the API to send requests or messages
2. **Pano MC Plugin → Pano Backend:** Secure encrypted WebSocket communication (RSA + AES-256)
3. **Pano Backend → Your Plugin:** Pano automatically handles connections and routes messages back
4. **Pano Backend → Web:** Data is synchronized and displayed on the website

> **Important:** Do NOT fork the Pano MC Plugin. Instead, create your own separate plugin and use the Pano MC Plugin API.

## 📚 Core API Concepts

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

## 🚀 Creating Your First Integration Plugin

### Step 1: Create a New Plugin Project

Create a standard Spigot/Paper plugin with `plugin.yml`:

```yaml
name: MyPanoIntegration
version: 1.0.0
main: com.example.integration.MyIntegrationPlugin
api-version: 1.19
depend: [Pano, YourTargetPlugin]  # Depend on Pano MC Plugin
```

### Step 2: Add Pano MC Plugin as Dependency

Add Pano MC Plugin to your build configuration:

**Maven:**
```xml
<dependency>
    <groupId>com.panomc</groupId>
    <artifactId>pano-mc-plugin</artifactId>
    <version>1.0.0</version>
    <scope>provided</scope>
</dependency>
```

**Gradle (Kotlin DSL):**
```kotlin
dependencies {
    compileOnly("com.panomc:pano-mc-plugin:1.0.0")
}
```

### Step 3: Initialize Your Integration

::: code-group

```kotlin [Kotlin]
package com.example.integration

import com.panomc.plugin.api.PlatformManager
import org.bukkit.plugin.java.JavaPlugin

class MyIntegrationPlugin : JavaPlugin() {

    private lateinit var platformManager: PlatformManager

    override fun onEnable() {
        // Get PlatformManager from Pano MC Plugin
        val panoPlugin = server.pluginManager.getPlugin("Pano")
        if (panoPlugin == null) {
            logger.severe("Pano MC Plugin not found! Disabling...")
            server.pluginManager.disablePlugin(this)
            return
        }

        platformManager = panoPlugin.getPlatformManager()

        // Register message handlers
        registerHandlers()

        // Hook into your target plugin
        setupIntegration()

        logger.info("Integration enabled successfully!")
    }

    private fun registerHandlers() {
        // Register handlers to receive messages from Pano
        platformManager.registerMessageHandler(PlayerRewardHandler())
        platformManager.registerMessageHandler(ConfigUpdateHandler())
    }

    private fun setupIntegration() {
        // Hook into your target plugin's API
        // Listen to events, register commands, etc.
    }

    fun sendRequestToPano(request: PlatformRequest) {
        platformManager.sendRequest(request)
    }
}
```

```java [Java]
package com.example.integration;

import com.panomc.plugin.api.PlatformManager;
import com.panomc.plugin.api.PlatformRequest;
import org.bukkit.plugin.Plugin;
import org.bukkit.plugin.java.JavaPlugin;

public class MyIntegrationPlugin extends JavaPlugin {

    private PlatformManager platformManager;

    @Override
    public void onEnable() {
        // Get PlatformManager from Pano MC Plugin
        Plugin panoPlugin = getServer().getPluginManager().getPlugin("Pano");
        if (panoPlugin == null) {
            getLogger().severe("Pano MC Plugin not found! Disabling...");
            getServer().getPluginManager().disablePlugin(this);
            return;
        }

        platformManager = panoPlugin.getPlatformManager();

        // Register message handlers
        registerHandlers();

        // Hook into your target plugin
        setupIntegration();

        getLogger().info("Integration enabled successfully!");
    }

    private void registerHandlers() {
        // Register handlers to receive messages from Pano
        platformManager.registerMessageHandler(new PlayerRewardHandler());
        platformManager.registerMessageHandler(new ConfigUpdateHandler());
    }

    private void setupIntegration() {
        // Hook into your target plugin's API
        // Listen to events, register commands, etc.
    }

    public void sendRequestToPano(PlatformRequest request) {
        platformManager.sendRequest(request);
    }

    public PlatformManager getPlatformManager() {
        return platformManager;
    }
}
```

:::

### Step 4: Hook Into Target Plugin Events

::: code-group

```kotlin [Kotlin]
import org.bukkit.event.EventHandler
import org.bukkit.event.Listener
import org.bukkit.event.player.PlayerJoinEvent

class PlayerJoinListener(
    private val plugin: MyIntegrationPlugin
) : Listener {

    @EventHandler
    fun onPlayerJoin(event: PlayerJoinEvent) {
        val player = event.player

        // Send player join event to Pano
        val request = object : PlatformRequest() {
            override fun getRequestType() = "player_join"
            override fun getData() = mapOf(
                "player" to player.name,
                "uuid" to player.uniqueId.toString(),
                "ip" to player.address?.address?.hostAddress
            )
        }

        plugin.sendRequestToPano(request)
    }
}
```

```java [Java]
import com.panomc.plugin.api.PlatformRequest;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;
import java.util.HashMap;
import java.util.Map;

public class PlayerJoinListener implements Listener {
    
    private final MyIntegrationPlugin plugin;
    
    public PlayerJoinListener(MyIntegrationPlugin plugin) {
        this.plugin = plugin;
    }
    
    @EventHandler
    public void onPlayerJoin(PlayerJoinEvent event) {
        Player player = event.getPlayer();
        
        // Send player join event to Pano
        PlatformRequest request = new PlatformRequest() {
            @Override
            public String getRequestType() {
                return "player_join";
            }
            
            @Override
            public Map<String, Object> getData() {
                Map<String, Object> data = new HashMap<>();
                data.put("player", player.getName());
                data.put("uuid", player.getUniqueId().toString());
                data.put("ip", player.getAddress().getAddress().getHostAddress());
                return data;
            }
        };
        
        plugin.sendRequestToPano(request);
    }
}
```

:::

### Step 5: Send Requests with Responses

::: code-group

```kotlin [Kotlin]
class PlayerStatsRequest(
    private val playerUUID: String,
    private val callback: (Map<String, Any>) -> Unit
) : PlatformRequest(), PlatformMessageResponse {

    override fun getRequestType() = "player_stats"

    override fun getData() = mapOf("uuid" to playerUUID)

    override fun onResponse(response: Map<String, Any>) {
        callback(response)
    }

    override fun onError(error: String) {
        println("Failed to fetch player stats: $error")
    }
}

// Usage in command
fun onCommand(player: Player) {
    val request = PlayerStatsRequest(player.uniqueId.toString()) { stats ->
        player.sendMessage("Your stats:")
        player.sendMessage("Kills: ${stats["kills"]}")
        player.sendMessage("Deaths: ${stats["deaths"]}")
    }
    
    platformManager.sendRequest(request)
}
```

```java [Java]
import com.panomc.plugin.api.PlatformRequest;
import com.panomc.plugin.api.PlatformMessageResponse;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Consumer;

public class PlayerStatsRequest extends PlatformRequest implements PlatformMessageResponse {
    
    private final String playerUUID;
    private final Consumer<Map<String, Object>> callback;
    
    public PlayerStatsRequest(String playerUUID, Consumer<Map<String, Object>> callback) {
        this.playerUUID = playerUUID;
        this.callback = callback;
    }
    
    @Override
    public String getRequestType() {
        return "player_stats";
    }
    
    @Override
    public Map<String, Object> getData() {
        Map<String, Object> data = new HashMap<>();
        data.put("uuid", playerUUID);
        return data;
    }
    
    @Override
    public void onResponse(Map<String, Object> response) {
        callback.accept(response);
    }
    
    @Override
    public void onError(String error) {
        System.out.println("Failed to fetch player stats: " + error);
    }
}

// Usage in command
public void onCommand(Player player) {
    PlayerStatsRequest request = new PlayerStatsRequest(
        player.getUniqueId().toString(),
        stats -> {
            player.sendMessage("Your stats:");
            player.sendMessage("Kills: " + stats.get("kills"));
            player.sendMessage("Deaths: " + stats.get("deaths"));
        }
    );
    
    platformManager.sendRequest(request);
}
```

:::

## 🔗 Extending Pano's Backend (Recommended)

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

## 🔒 Security Best Practices

1. **Validate All Data** — Never trust incoming data without validation
2. **Use Pano's Encryption** — All communication is automatically encrypted via WebSocket
3. **Check Permissions** — Verify user permissions before executing actions
4. **Sanitize Input** — Prevent injection attacks
5. **Rate Limiting** — Implement rate limits for frequent operations
6. **Error Handling** — Always handle errors gracefully

## 📦 Example Project

Check out our example integration plugin repository:

- [Example Integration Plugin](https://github.com/PanoMC/example-integration-plugin) (Reference implementation)

This repository demonstrates:
- Setting up Pano MC Plugin API dependency
- Creating custom requests and handlers
- Hooking into third-party plugins
- Best practices and patterns

## 🧪 Testing Your Integration

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

## 📚 API Reference

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

## 💬 Need Help?

- **Discord:** Join our [development channel](https://discord.gg/6vVy72wgXT)
- **GitHub Discussions:** [Pano MC Plugin Discussions](https://github.com/PanoMC/pano-mc-plugin/discussions)
- **Issue Tracker:** [Report bugs or request features](https://github.com/PanoMC/pano-mc-plugin/issues)
- **Example Project:** [Reference Implementation](https://github.com/PanoMC/example-integration-plugin)

## 📚 Related Documentation

- [Platform Integrations](../../platform/integrations/)
- [AuthMeReloaded Integration](../../platform/integrations/authme/)
- [Pano MC Plugin Repository](https://github.com/PanoMC/pano-mc-plugin)
- [Addon Development](../../addon/getting-started/)

> Happy coding! 🚀
