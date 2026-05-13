# Бэкенд-разработка (Kotlin)

## Жизненный цикл плагина и контекст
Плагины расширяют класс `PanoPlugin`. Ключевые контексты включают:
-   `applicationContext`: Основной контекст DI Pano.
-   `pluginBeanContext`: Управляет внутренними бинами плагина.
-   `pluginGlobalBeanContext`: Делит бины между различными плагинами.

### Взаимодействие при установке
Дождитесь завершения установки перед инициализацией тяжелых операций с базой данных.

**Пример обработчика событий:**
```kotlin
@EventListener
class SetupEventHandler(private val plugin: YourPlugin): SetupEventListener {
    override suspend fun onSetupFinished() {
        if (plugin.pluginState == PluginState.STARTED) {
            plugin.startPlugin()
        }
    }
}
```

**Методы основного класса плагина:**
```kotlin
override suspend fun onStart() {
    if (!setupManager.isSetupDone()) {
        return // Ждем SetupEventHandler
    }
    startPlugin()
}

override suspend fun onUninstall() {
    pluginDatabaseManager.uninstall(this)
}
```

## База данных и модели
- **Структура пакетов**: `db/daos/`, `db/impl/`, `db/models/`, `db/migrations/`.
- **Аннотации**: `@DBEntity` (модели), `@Migration` (версионированные изменения), `@Dao` (реализации).
- **Соглашение об именовании**: Имена **DAO** и **Model** должны быть похожи (например, `AnnouncementModel` и `AnnouncementDao`).
- **Реализация**: Расширяйте абстрактные классы Dao и предоставляйте класс модели. Убедитесь, что логика `uninstall` реализована.

## API и маршрутизация
- **Расположение**: пакет `routes/`.
- **Типы**: `PanelApi` (администратор), `LoggedInApi` (аутентифицированные пользователи).
- **Валидация**:
    -   Обработчики валидации обязательны.
    -   Используйте переменные пути, такие как `:id`.
    -   Указывайте `required body` для объектов на основе схемы.
- **Разрешения**: Используйте `authProvider` из `applicationContext`.
- **Журналы активности**: Все API Панели **должны** определять журналы активности.
- **Обработка ошибок**: Предпочитайте встроенные ошибки (`com.panomc.platform.error`). Определяйте пользовательские ошибки в `error/`, расширяя `com.panomc.platform.model.Error`.

## Разрешения и конфигурация
- **Разрешения**: Определяйте в пакете `permission/`, расширяя `PanelPermission` с `@PermissionDefinition`.
    -   **Иконка**: Передайте имя иконки FontAwesome в конструктор `PanelPermission` (например, `PanelPermission("fa-question-circle")`).
    -   **Узел**: ID узла разрешения генерируется автоматически из имени класса (например, `ManageFAQPermission` -> `MANAGE_FAQ`).

**Пример определения разрешения:**
::: code-group
```kotlin [Kotlin]
@PermissionDefinition
class ManageFAQPermission : PanelPermission("fa-question-circle")
```

```java [Java]
@PermissionDefinition
public class ManageFAQPermission extends PanelPermission {
    public ManageFAQPermission() {
        super("fa-question-circle");
    }
}
```
:::
- **Конфигурация**: Используйте `PluginConfigManager`.
    -   Храните общие настройки в классах **Config**.
    -   **Сначала Enum**: Используйте Enum вместо статических строк для безопасности типов.
