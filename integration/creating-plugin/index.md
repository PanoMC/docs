# Creating Your First Integration Plugin

## Creating Your First Integration Plugin

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
