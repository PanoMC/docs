# Конфигурация

**Что даёт вам эта страница:** к концу у вас будет файл настроек, который может редактировать владелец сайта — типизированный класс конфигурации на Kotlin, который Pano записывает на диск при первом запуске, — и вы будете знать единственное правило безопасного чтения этих значений изнутри эндпоинта.

Настройки, которые владелец сайта должен иметь возможность подкручивать, живут в классе конфигурации, расширяющем `PluginConfig` (файл `config/ShoutboxConfig.kt`):

```kotlin
package com.panomc.plugins.shoutbox.config

import com.panomc.platform.api.config.PluginConfig

class ShoutboxConfig(
    val enabled: Boolean = true,
    val maxShouts: Int = 5
) : PluginConfig()
```

При первом запуске Pano записывает этот класс как **файл конфигурации** — в формате HOCON, который выглядит как JSON с меньшим числом кавычек и запятых, — по адресу `plugins/pano-plugin-shoutbox/config.conf`, заполняя ваши значения по умолчанию. Помните, что каждая правка бэкенда требует пересборки-и-перезапуска, прежде чем вступит в силу, — см. [Обзор бэкенда](/ru/addon/backend/).

::: tip Где создаётся менеджер конфигурации
`PluginConfigManager`, который загружает и сохраняет этот файл, создаётся и регистрируется в `startPlugin()` вашего класса-точки входа — см. [Обзор бэкенда](/ru/addon/backend/#класс-точка-входа). Этот момент во времени важен для того, как вы читаете конфигурацию ниже.
:::

::: tip Контрольная точка: откройте сгенерированную конфигурацию
После того как ваш аддон загрузился хотя бы раз (пересборка → копирование → перезапуск), откройте `plugins/pano-plugin-shoutbox/config.conf`. Вы должны увидеть свои два ключа с их значениями по умолчанию: `enabled` установлен в `true`, а `maxShouts` — в `5`.
:::

## Чтение конфигурации из эндпоинта — и почему не из конструктора

Есть одно правило для чтения конфигурации: **никогда не просите `PluginConfigManager` в конструкторе.** Вот причина, как временная шкала того, что происходит при загрузке аддона:

```text
addon loads → your @Endpoint objects are created → onStart() runs → PluginConfigManager is registered → (later) a request arrives
```

Ваши эндпоинты строятся на шаге 2, но `PluginConfigManager` не регистрируется до шага 4. Так что если бы конструктор эндпоинта попросил его, Pano нечего было бы передать, и он рухнул бы с `NoSuchBeanDefinitionException`. Исправление — извлекать его, **когда запрос фактически приходит** (шаг 5), а не когда строится эндпоинт. Вот полный, безопасный способ прочитать значение конфигурации внутри `handle` эндпоинта:

```kotlin
// fetch the config manager only now, at request time — never in the constructor
val configManager = plugin.pluginBeanContext.getBean(PluginConfigManager::class.java)
val config = configManager.config as ShoutboxConfig
val limit = config.maxShouts   // e.g. 5
```

`configManager.config` возвращает вам типизированный `ShoutboxConfig`. Чтобы сохранить изменения на диск, вы вызываете `configManager.saveConfig(JsonObject.mapFrom(newConfig))` с заполненным объектом конфигурации. Вы примените этот самый паттерн чтения на практике в [Эндпоинтах](/ru/addon/endpoints/), где необязательный вариант `GetShoutsAPI` использует `maxShouts`, чтобы ограничить, сколько выкриков он возвращает.

## Документирование и эволюция ключей

Вы можете документировать отдельные ключи в сгенерированном файле с помощью `@ConfigComment("…")` над полем и группировать связанные ключи под баннером с помощью `@ConfigSection("…")`.

Когда позже вам понадобится добавить или переименовать ключи конфигурации, не редактируйте файл на диске вручную — у Pano для этого есть класс `PluginConfigMigration` (аннотированный `@Migration`). В первый день он вам не понадобится; посмотрите на него в [Справочнике Backend API](/ru/addon/backend-reference/#_5-конфигурация), когда придёт время.

## Что дальше

- **[Эндпоинты](/ru/addon/endpoints/)** — примените `maxShouts` во время запроса.
- **[Обзор бэкенда](/ru/addon/backend/)** — где `PluginConfigManager` регистрируется во время запуска.
- **[Справочник Backend API](/ru/addon/backend-reference/#_5-конфигурация)** — `PluginConfig`, `PluginConfigManager`, `@ConfigComment`, `@ConfigSection` и `PluginConfigMigration` по имени.
