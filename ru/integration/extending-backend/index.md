# Расширение бэкенда Pano

## Расширение бэкенда Pano (рекомендуется)

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
## Лучшие практики безопасности

1. **Проверяйте все данные** — никогда не доверяйте входящим данным без валидации.
2. **Используйте шифрование Pano** — вся связь автоматически шифруется через WebSocket.
3. **Проверяйте права доступа** — убедитесь в наличии прав у пользователя перед выполнением действий.
4. **Очищайте ввод** — предотвращайте инъекционные атаки.
5. **Ограничение частоты (Rate Limiting)** — внедряйте ограничения для частых операций.
6. **Обработка ошибок** — всегда корректно обрабатывайте ошибки.
