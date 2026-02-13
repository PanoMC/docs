# Манифест плагина

Плагины Pano опираются на манифест для определения своей идентичности, зависимостей и точек входа. Pano использует **PF4J** для загрузки плагинов, что требует наличия определенных метаданных в файле `MANIFEST.MF` JAR-архива.

Для упрощения разработки вам **не** нужно редактировать `MANIFEST.MF` напрямую. Вместо этого вы легко управляете этими свойствами в файле `gradle.properties`.

## Настройка `gradle.properties`

В процессе сборки Gradle автоматически считывает эти значения и внедряет их в манифест финального JAR-файла.

### Ключевые свойства

*   `pluginId`: **(Обязательно)** Уникальный идентификатор вашего плагина. Используйте последовательный ID (например, `pano-plugin-announcement`).
*   `pluginName`: **(Обязательно)** Человекочитаемое имя плагина (например, `Announcements`).
*   `pluginDescription`: **(Опционально)** Краткое описание того, что делает ваш плагин.
*   `pluginPanoVersion`: **(Обязательно)** Версия Pano, для которой создан этот плагин (например, `local-build` или `1.0.0`).
*   `pluginClass`: **(Обязательно)** Полное имя вашего основного класса, расширяющего `PanoPlugin`.
*   `pluginDeveloper`: **(Обязательно)** Автор или организация, разрабатывающая плагин.
*   `pluginLicense`: **(Обязательно)** Лицензия плагина (например, `MIT`, `Apache-2.0`).
*   `pluginSourceUrl`: **(Опционально)** URL-адрес исходного кода плагина.
*   `pluginDependencies`: (Опционально) Список других плагинов, от которых зависит ваш плагин.

### Пример

```properties
pluginId=pano-plugin-announcement
pluginName=Announcements
pluginDescription=Create, edit and manage your Minecraft server announcements!
pluginPanoVersion=local-build
pluginClass=com.panomc.plugins.announcement.AnnouncementPlugin
pluginDeveloper=Pano
pluginLicense=MIT
pluginSourceUrl=https://github.com/panomc/pano-plugin-announcement
pluginDependencies=
```

## Зависимости

Pano (через PF4J) поддерживает расширенное управление зависимостями непосредственно через манифест.

### Зависимости плагина (`pluginDependencies`)
Вы можете определить, какие другие плагины необходимы вашему аддону для работы.
- **Синтаксис**: `pluginId` или `pluginId@version`
- **Опциональная зависимость**: Добавьте `?` к ID плагина.

**Примеры:**
*   `pluginDependencies=other-plugin`: Требует любую версию `other-plugin`.
*   `pluginDependencies=other-plugin@1.2.0`: Требует точно версию `1.2.0`.
*   `pluginDependencies=other-plugin@>=1.2.0`: Требует версию `1.2.0` или выше.
*   `pluginDependencies=other-plugin?`: Опциональная зависимость. Если присутствует, она будет загружена раньше вашего плагина.

## PF4J

Pano использует **PF4J** в фоновом режиме для загрузки и управления плагинами. Хотя для стандартной разработки вам не нужно взаимодействовать с ним напрямую, вы можете обратиться к [документации PF4J](https://pf4j.org/), если вам нужны более глубокие технические сведения об используемой архитектуре.

## Дополнительно: Ручная конфигурация

Файл `gradle.properties` — это уровень удобства. Если вы предпочитаете настраивать манифест вручную или вам нужны динамические значения, вы можете изменить задачу `shadowJar` в `build.gradle.kts`.

Ниже показано, как Pano Boilerplate сопоставляет свойства с манифестом:

```kotlin
shadowJar {
    val pluginId: String by project
    val pluginName: String by project
    val pluginDescription: String? by project
    val pluginPanoVersion: String by project
    val pluginClass: String by project
    val pluginDeveloper: String by project
    val pluginLicense: String? by project
    val pluginSourceUrl: String? by project
    val pluginDependencies: String? by project

    manifest {
        attributes["id"] = pluginId
        attributes["name"] = pluginName
        pluginDescription?.let { attributes["description"] = it }
        attributes["pano-version"] = pluginPanoVersion
        attributes["main-class"] = pluginClass
        attributes["version"] = version
        attributes["developer"] = pluginDeveloper
        pluginLicense?.let { attributes["license"] = it }
        pluginSourceUrl?.let { attributes["source-url"] = it }
        pluginDependencies?.let { attributes["dependencies"] = it }
    }
}
```
