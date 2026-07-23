# Манифест плагина

Плагины Pano опираются на манифест для определения своей идентичности, зависимостей и точек входа. Pano использует **PF4J** для загрузки плагинов, что требует наличия определённых метаданных в файле `MANIFEST.MF` JAR-архива.

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
*   `pluginLicense`: **(Опционально)** Лицензия плагина (например, `MIT`, `Apache-2.0`). Сборка добавляет её в манифест только если она задана; самому PF4J нужны лишь id, класс и версия.
*   `pluginSourceUrl`: **(Опционально)** URL-адрес исходного кода плагина.
*   `pluginDependencies`: **(Опционально)** Список других плагинов, от которых зависит ваш плагин.
*   `pluginRequires`: **(Опционально)** **Ограничение версии системы** PF4J — диапазон версий Pano, необходимых вашему аддону для работы. Оно сопоставляется с атрибутом манифеста `requires` и по умолчанию пусто (что означает «любая версия»). Оставляйте его пустым, если только вы не полагаетесь на возможность, добавленную в конкретном релизе Pano.

::: tip `pluginId` используется повсюду
Ваш `pluginId` — это не просто поле манифеста; это ключ, по которому Pano идентифицирует ваш аддон во всей системе. Одна и та же строка переиспользуется как:

- имя каталога данных вашего аддона (`plugins/<pluginId>/`),
- ключ для отслеживания версии схемы базы данных вашего аддона,
- сегмент URL для UI вашего аддона,
- префикс для каждого узла права доступа, который определяет ваш аддон (`pano.plugin.<pluginId>.…`), и
- `resourceId` на маркетплейсе, когда вы публикуетесь (см. [Сборка и публикация](/ru/addon/publishing/)).

Выберите его один раз и никогда не меняйте после того, как ваш аддон запущен в работе — переименование осиротит сохранённые данные и права доступа.
:::

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
pluginRequires=
```

::: warning Версии — не ваше дело задавать
Оставьте `pluginPanoVersion=local-build` как есть и **никогда не редактируйте `version` вручную**. При настоящем релизе CI (semantic-release) внедряет настоящую `version` из истории ваших коммитов (через `-Pversion`) — правка вручную ломает конвейер выпуска. Локально `version` всегда равна `local-build`. CI **не** трогает `pluginPanoVersion`; атрибут манифеста `pano-version` остаётся тем, что вы здесь задали (`local-build` для обычной сборки). Версия Pano, показываемая на Маркетплейсе, — это *отдельное* значение: опция `panoVersion` плагина публикации Pano в `.releaserc.json`. См. [Сборка и публикация](/ru/addon/publishing/), чтобы узнать, как версии выводятся из ваших коммитов.
:::

::: warning `gradle.properties` читается как ISO-8859-1
Gradle разбирает файлы `.properties` в кодировке **ISO-8859-1 (Latin-1)**, а не UTF-8. Любой не-ASCII символ — длинное тире, буква с диакритикой или эмодзи в `pluginDescription`, например — должен быть записан как экранирование `\uXXXX`, иначе он будет искажён в манифесте. Буквальное длинное тире (`—`, которое в UTF-8 — это байты `0xE2 0x80 0x94`), прочитанное как Latin-1, превращается в `â€"`. Пишите экранирование вместо сырого символа:

```properties
# Неправильно — буквальное длинное тире искажается в â€"
pluginDescription=Manage your server — fast and simple.

# Правильно — \u2014 это экранирование для длинного тире
pluginDescription=Manage your server \u2014 fast and simple.
```
:::

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
    val pluginRequires: String? by project

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
        pluginRequires?.let { attributes["requires"] = it }
    }
}
```

## Свойства сборки для Premium

Если вы поставляете **премиум**-аддон, сборка также принимает несколько дополнительных свойств, которые вшивают публичный ключ лицензии в jar — `-PlicenseServer=dev|prod|<url>`, `-PpanoLicensePublicKey=<base64>` и переменную окружения `PANO_LICENSE_PUBLIC_KEY`. Это флаги сборки, а не атрибуты манифеста, и без любого из них ваш аддон собирается как бесплатный (нелицензированный) jar.
