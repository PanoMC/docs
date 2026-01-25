# Начало разработки интеграций

Это руководство поможет вам создать индивидуальные интеграции между Pano и плагинами серверов Minecraft, используя **Pano MC Plugin API**.

## 🎯 Что такое разработка интеграций?

Разработка интеграций позволяет создавать бесшовные соединения между сторонними плагинами Minecraft и веб-платформой Pano. Используя API Pano MC Plugin, вы можете:

- Синхронизировать данные между игрой и вебом в режиме реального времени.
- Отправлять запросы из вашего плагина Minecraft на веб-платформу Pano.
- Получать и обрабатывать сообщения от Pano.
- Запускать веб-действия на основе игровых событий.
- Создавать единый пользовательский опыт на обеих платформах.

## 🔧 Предварительные требования

Перед началом разработки интеграций убедитесь, что у вас есть:

1. **Java Development Kit (JDK 11+)** — необходим для разработки плагинов.
2. **Знание Java или Kotlin** — вы можете использовать любой из этих языков с API Pano MC Plugin.
3. **Опыт разработки плагинов Minecraft** — понимание Spigot/Paper/Bukkit API.
4. **Pano MC Plugin API** — [репозиторий GitHub](https://github.com/PanoMC/pano-mc-plugin).
5. **Запущенный экземпляр Pano** — для тестирования вашей интеграции.
6. **Тестовый сервер Minecraft** — сервер Spigot, Paper или Folia для разработки.

> 💡 **Примечание:** Все примеры в этом руководстве приведены как на **Kotlin**, так и на **Java** для вашего удобства.

## 🏗️ Обзор архитектуры

Система интеграции Pano состоит из трех основных компонентов:

```
┌─────────────────────┐         ┌──────────────────────┐         ┌─────────────────┐
│  Ваш MC плагин      │ ◄─────► │  Pano MC Plugin      │ ◄─────► │  Бэкенд Pano    │
│  (Интеграция)       │         │  (API связи)         │         │  (Веб-платформа)│
└─────────────────────┘         └──────────────────────┘         └─────────────────┘
    (Хуки плагина)              (Безопасный WebSocket API)        (API платформы)
```

### Поток данных

1. **Ваш плагин → API Pano MC Plugin:** Вы используете API для отправки запросов или сообщений.
2. **Pano MC Plugin → Бэкенд Pano:** Безопасная зашифрованная связь через WebSocket (RSA + AES-256).
3. **Бэкенд Pano → Ваш плагин:** Pano автоматически обрабатывает соединения и направляет сообщения обратно.
4. **Бэкенд Pano → Веб:** Данные синхронизируются и отображаются на веб-сайте.

> **Важно:** НЕ делайте форк Pano MC Plugin. Вместо этого создайте свой отдельный плагин и используйте API Pano MC Plugin.

## 📚 Основные концепции API

### 1. PlatformRequest

Чтобы отправить запрос на веб-платформу Pano, наследуйте абстрактный класс `PlatformRequest`:

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

Если вы ожидаете ответ от Pano, реализуйте интерфейс `PlatformMessageResponse`:

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
        // Обработка успешного ответа
        val points = response["points"] as? Int ?: 0
        println("Игрок $playerName имеет $points очков")
    }

    override fun onError(error: String) {
        // Обработка ошибки
        println("Ошибка: $error")
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
        // Обработка успешного ответа
        Integer points = (Integer) response.getOrDefault("points", 0);
        System.out.println("Игрок " + playerName + " имеет " + points + " очков");
    }

    @Override
    public void onError(String error) {
        // Обработка ошибки
        System.out.println("Ошибка: " + error);
    }
}
```

:::

### 3. PlatformMessageHandler

Чтобы получать и обрабатывать сообщения от веб-платформы Pano, наследуйте `PlatformMessageHandler<R : PlatformMessage>`:

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

// Определение структуры вашего сообщения
data class PlayerRewardMessage(
    val playerName: String,
    val reward: String,
    val amount: Int
) : PlatformMessage

// Создание обработчика
class PlayerRewardHandler : PlatformMessageHandler<PlayerRewardMessage>() {

    override fun getMessageType(): String = "player_reward"

    override fun handle(message: PlayerRewardMessage) {
        val player = Bukkit.getPlayer(message.playerName)
        if (player != null) {
            // Выдача награды игроку
            when (message.reward) {
                "coins" -> giveCoins(player, message.amount)
                "items" -> giveItems(player, message.amount)
            }
            player.sendMessage("Вы получили ${message.amount} ${message.reward}!")
        }
    }
}

// Регистрация обработчика
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

// Определение структуры вашего сообщения
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

// Создание обработчика
public class PlayerRewardHandler extends PlatformMessageHandler<PlayerRewardMessage> {

    @Override
    public String getMessageType() {
        return "player_reward";
    }

    @Override
    public void handle(PlayerRewardMessage message) {
        Player player = Bukkit.getPlayer(message.getPlayerName());
        if (player != null) {
            // Выдача награды игроку
            switch (message.getReward()) {
                case "coins":
                    giveCoins(player, message.getAmount());
                    break;
                case "items":
                    giveItems(player, message.getAmount());
                    break;
            }
            player.sendMessage("Вы получили " + message.getAmount() + " " + message.getReward() + "!");
        }
    }
}

// Регистрация обработчика
public void registerHandlers(PlatformManager platformManager) {
    platformManager.registerMessageHandler(new PlayerRewardHandler());
}
```

:::

## 🚀 Создание вашего первого плагина интеграции

### Шаг 1: Создание нового проекта плагина

Создайте стандартный плагин Spigot/Paper с файлом `plugin.yml`:

```yaml
name: MyPanoIntegration
version: 1.0.0
main: com.example.integration.MyIntegrationPlugin
api-version: 1.19
depend: [Pano, YourTargetPlugin]  # Зависимость от Pano MC Plugin
```

### Шаг 2: Добавление Pano MC Plugin в зависимости

Добавьте Pano MC Plugin в конфигурацию сборки:

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

### Шаг 3: Инициализация вашей интеграции

::: code-group

```kotlin [Kotlin]
package com.example.integration

import com.panomc.plugin.api.PlatformManager
import org.bukkit.plugin.java.JavaPlugin

class MyIntegrationPlugin : JavaPlugin() {

    private lateinit var platformManager: PlatformManager

    override fun onEnable() {
        // Получение PlatformManager из Pano MC Plugin
        val panoPlugin = server.pluginManager.getPlugin("Pano")
        if (panoPlugin == null) {
            logger.severe("Pano MC Plugin не найден! Отключение...")
            server.pluginManager.disablePlugin(this)
            return
        }

        platformManager = panoPlugin.getPlatformManager()

        // Регистрация обработчиков сообщений
        registerHandlers()

        // Подключение к целевому плагину
        setupIntegration()

        logger.info("Интеграция успешно включена!")
    }

    private fun registerHandlers() {
        // Регистрация обработчиков для получения сообщений от Pano
        platformManager.registerMessageHandler(PlayerRewardHandler())
        platformManager.registerMessageHandler(ConfigUpdateHandler())
    }

    private fun setupIntegration() {
        // Подключение к API вашего целевого плагина
        // Слушайте события, регистрируйте команды и т.д.
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
        // Получение PlatformManager из Pano MC Plugin
        Plugin panoPlugin = getServer().getPluginManager().getPlugin("Pano");
        if (panoPlugin == null) {
            getLogger().severe("Pano MC Plugin не найден! Отключение...");
            getServer().getPluginManager().disablePlugin(this);
            return;
        }

        platformManager = panoPlugin.getPlatformManager();

        // Регистрация обработчиков сообщений
        registerHandlers();

        // Подключение к целевому плагину
        setupIntegration();

        getLogger().info("Интеграция успешно включена!");
    }

    private void registerHandlers() {
        // Регистрация обработчиков для получения сообщений от Pano
        platformManager.registerMessageHandler(new PlayerRewardHandler());
        platformManager.registerMessageHandler(new ConfigUpdateHandler());
    }

    private void setupIntegration() {
        // Подключение к API вашего целевого плагина
        // Слушайте события, регистрируйте команды и т.д.
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

### Шаг 4: Подключение к событиям целевого плагина

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

        // Отправка события входа игрока в Pano
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
        
        // Отправка события входа игрока в Pano
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

### Шаг 5: Отправка запросов с ожиданием ответа

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
        println("Не удалось получить статистику игрока: $error")
    }
}

// Использование в команде
fun onCommand(player: Player) {
    val request = PlayerStatsRequest(player.uniqueId.toString()) { stats ->
        player.sendMessage("Ваша статистика:")
        player.sendMessage("Убийств: ${stats["kills"]}")
        player.sendMessage("Смертей: ${stats["deaths"]}")
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
        System.out.println("Не удалось получить статистику игрока: " + error);
    }
}

// Использование в команде
public void onCommand(Player player) {
    PlayerStatsRequest request = new PlayerStatsRequest(
        player.getUniqueId().toString(),
        stats -> {
            player.sendMessage("Ваша статистика:");
            player.sendMessage("Убийств: " + stats.get("kills"));
            player.sendMessage("Смертей: " + stats.get("deaths"));
        }
    );
    
    platformManager.sendRequest(request);
}
```

:::

## 🔗 Расширение бэкенда Pano (рекомендуется)

Для полноценной интеграции **настоятельно рекомендуется** также создать **плагин Pano** (на стороне бэкенда), который будет обрабатывать ваши пользовательские запросы и сообщения.

### Структура плагина Pano

Создайте плагин в бэкенде Pano для обработки вашей логики интеграции:

```kotlin
// В вашем плагине Pano (бэкенд)
class MyIntegrationPanoPlugin : PanoPlugin() {

    override fun onEnable() {
        // Регистрация обработчиков запросов
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
        
        // Сохранение в БД, вызов событий и т.д.
        database.updatePlayerLastJoin(uuid)
        
        // Опциональная отправка ответа
        connection.sendResponse("success", mapOf("message" to "Вход зафиксирован"))
    }

    private fun handlePlayerStatsRequest(data: Map<String, Any>, connection: Connection) {
        val uuid = data["uuid"] as String
        val stats = database.getPlayerStats(uuid)
        
        // Отправка статистики обратно в MC плагин
        connection.sendResponse("player_stats_response", stats)
    }
}
```

### Отправка сообщений из Pano в Minecraft

Из вашего плагина Pano вы можете отправлять сообщения на подключенные серверы Minecraft:

```kotlin
// Отправка награды игроку
platformManager.sendMessage("player_reward", mapOf(
    "playerName" to "Steve",
    "reward" to "coins",
    "amount" to 100
))
```

Это сообщение будет получено вашим `PlayerRewardHandler` на сервере Minecraft.

## 🔒 Лучшие практики безопасности

1. **Проверяйте все данные** — никогда не доверяйте входящим данным без валидации.
2. **Используйте шифрование Pano** — вся связь автоматически шифруется через WebSocket.
3. **Проверяйте права доступа** — убедитесь в наличии прав у пользователя перед выполнением действий.
4. **Очищайте ввод** — предотвращайте инъекционные атаки.
5. **Ограничение частоты (Rate Limiting)** — внедряйте ограничения для частых операций.
6. **Обработка ошибок** — всегда корректно обрабатывайте ошибки.

## 📦 Пример проекта

Ознакомьтесь с нашим репозиторием примера плагина интеграции:

- [Пример плагина интеграции](https://github.com/PanoMC/example-integration-plugin) (Эталонная реализация)

Этот репозиторий демонстрирует:
- Настройку зависимости Pano MC Plugin API.
- Создание пользовательских запросов и обработчиков.
- Подключение к сторонним плагинам.
- Лучшие практики и паттерны.

## 🧪 Тестирование вашей интеграции

### Локальное тестирование

1. Соберите ваш плагин:
```bash
./gradlew build
```

2. Скопируйте JAR-файл в папку `plugins/` вашего тестового сервера.
3. Убедитесь, что Pano MC Plugin установлен и подключен.
4. Установите ваш целевой плагин.
5. Запустите сервер и протестируйте функциональность.

### Отладка

Включите логирование отладки в вашем плагине:

```kotlin
if (config.getBoolean("debug", false)) {
    logger.info("[Debug] Запрос отправлен: ${request.getRequestType()}")
}
```

## 📚 Справочник API

### Методы PlatformManager

```kotlin
interface PlatformManager {
    // Отправить запрос в Pano
    fun sendRequest(request: PlatformRequest)
    
    // Зарегистрировать обработчик сообщений
    fun registerMessageHandler(handler: PlatformMessageHandler<*>)
    
    // Проверить наличие соединения с Pano
    fun isConnected(): Boolean
    
    // Получить статус соединения
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

## 💬 Нужна помощь?

- **Discord:** Присоединяйтесь к нашему [каналу разработки](https://discord.gg/6vVy72wgXT).
- **GitHub Discussions:** [Обсуждения Pano MC Plugin](https://github.com/PanoMC/pano-mc-plugin/discussions).
- **Трекер ошибок:** [Сообщайте об ошибках или предлагайте функции](https://github.com/PanoMC/pano-mc-plugin/issues).
- **Пример проекта:** [Эталонная реализация](https://github.com/PanoMC/example-integration-plugin).

## 📚 Связанная документация

- [Интеграции платформы](../../platform/integrations/)
- [Интеграция с AuthMeReloaded](../../platform/integrations/authme/)
- [Репозиторий Pano MC Plugin](https://github.com/PanoMC/pano-mc-plugin)
- [Разработка аддонов](../../addon/getting-started/)

> Приятного кодинга! 🚀
