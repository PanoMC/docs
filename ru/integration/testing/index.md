# Тестирование и примеры

## Пример проекта

Отдельного репозитория с примером нет. Образцом служат собственные сообщения Pano MC Plugin; они используют те же классы, что и ваш плагин:

- [Запросы](https://github.com/PanoMC/pano-mc-plugin/tree/alpha/Core/src/main/kotlin/com/panomc/plugins/pano/core/platform/request) (например, `GetPlayerInfoRequest`)
- [Ответы](https://github.com/PanoMC/pano-mc-plugin/tree/alpha/Core/src/main/kotlin/com/panomc/plugins/pano/core/platform/message/response) (например, `GetPlayerInfoMessage`)
## Тестирование вашей интеграции

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
    logger.info("[Debug] Запрос отправлен: ${request::class.simpleName} (${request.eventId})")
}
```
