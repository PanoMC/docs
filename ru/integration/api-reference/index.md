# Справочник API

## Справочник API

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
## Нужна помощь?

- **Discord:** Присоединяйтесь к нашему [каналу разработки](https://discord.gg/6vVy72wgXT).
- **GitHub Discussions:** [Обсуждения Pano MC Plugin](https://github.com/PanoMC/pano-mc-plugin/discussions).
- **Трекер ошибок:** [Сообщайте об ошибках или предлагайте функции](https://github.com/PanoMC/pano-mc-plugin/issues).
- **Пример проекта:** [Эталонная реализация](https://github.com/PanoMC/example-integration-plugin).
## Связанная документация

- [Интеграции платформы](../../platform/integrations/)
- [Интеграция с AuthMeReloaded](../../platform/integrations/authme/)
- [Репозиторий Pano MC Plugin](https://github.com/PanoMC/pano-mc-plugin)
- [Разработка аддонов](../../addon/getting-started/)

> Приятного кодинга!
