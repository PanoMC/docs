# Права доступа и журналы активности

**Что даёт вам эта страница:** к концу вы определите право доступа, которое закрывает административный эндпоинт Shoutbox, узнаете, как выводится строка его узла, и напишете строку журнала активности, которая записывает, кто опубликовал выкрик. Это два класса, на которые ссылается эндпоинт панели на странице [Эндпоинты](/ru/addon/endpoints/).

Каждая правка бэкенда требует пересборки-и-перезапуска, прежде чем вступит в силу, — см. [Обзор бэкенда](/ru/addon/backend/).

## Право доступа

Файл `permission/ManageShoutboxPermission.kt`:

```kotlin
package com.panomc.plugins.shoutbox.permission

import com.panomc.platform.annotation.PermissionDefinition
import com.panomc.platform.auth.PanelPermission

@PermissionDefinition
class ManageShoutboxPermission : PanelPermission("fa-bullhorn")
```

`@PermissionDefinition` регистрирует право доступа автоматически, а строка в конструкторе — это иконка FontAwesome, показываемая рядом с ним в списке прав доступа панели.

**Узел права доступа** — строка, которую вы проверяете везде остальном, — выводится из имени класса по правилу:

1. Отбросьте завершающее `Permission` → `ManageShoutbox`.
2. Разбейте на слова, приведите их к нижнему регистру, соедините точками → `manage.shoutbox`.
3. Добавьте префикс `pano.plugin.<pluginId>.` → **`pano.plugin.pano-plugin-shoutbox.manage.shoutbox`**.

Вы никогда не печатаете этот узел в Kotlin — передачи `ManageShoutboxPermission()` в `requirePermission` достаточно (эндпоинт панели на странице [Эндпоинты](/ru/addon/endpoints/) делает именно это). Но вы **действительно** повторяете эту точную строку в своём фронтенд-коде, чтобы закрыть страницы панели и ссылки навигации. См. [Разработку фронтенда](/ru/addon/frontend/) о том, где; если вы переименуете класс Kotlin, не забудьте обновить эту скопированную строку.

::: tip Контрольная точка: увидьте право доступа в панели
После пересборки и перезапуска откройте **Панель → Роли** и отредактируйте роль — вы должны увидеть новое право доступа с иконкой **рупора** (это `fa-bullhorn` из конструктора). Выдайте его роли, чтобы позволить участникам этой роли публиковать выкрики.

Одна вещь, которая удивляет людей: **администраторы обходят проверки прав доступа** — учётная запись администратора всегда проходит `requirePermission`, так что как администратор вы можете вызвать эндпоинт панели даже не выдав себе ничего. Чтобы действительно увидеть отказ `NO_PERMISSION`, тестируйте с ролью **не-администратора**, которой это право доступа *не* выдано.
:::

## Журнал активности

Строка журнала активности — это небольшой класс, расширяющий `PluginActivityLog`, несущий `JsonObject` с деталями (файл `log/CreatedShoutLog.kt`):

```kotlin
package com.panomc.plugins.shoutbox.log

import com.panomc.platform.db.model.PluginActivityLog
import io.vertx.core.json.JsonObject

class CreatedShoutLog(
    userId: Long,
    username: String,
    pluginId: String,
    message: String
) : PluginActivityLog(
    userId = userId,
    pluginId = pluginId,
    details = JsonObject().put("target", message).put("username", username)
)
```

Эндпоинт панели пишет одну из таких через `databaseManager.panelActivityLogDao.add(...)` — см. [Эндпоинты](/ru/addon/endpoints/). Затем панель показывает каждую строку журнала на своей странице **Активность**. Чтобы найти текст для отображения, она выводит ключ локали из имени вашего класса — тем же способом, каким права доступа выводят свой узел:

1. Отбросьте завершающее `Log` → `CreatedShout`.
2. Преобразуйте в `UPPER_SNAKE` → `CREATED_SHOUT`.
3. Найдите его под объектом `activity-logs` в ваших файлах локалей → `activity-logs.CREATED_SHOUT`.

Эта строка локали использует значения `{username}` и `{target}` из нагрузки `details`, которую вы построили выше. Её настройка описана в [Локализации](/ru/addon/localization/).

::: warning Вы будете видеть сырой ключ, пока не добавите строку локали
Пока вы не добавите `activity-logs.CREATED_SHOUT` в свои файлы локалей, страница Активность показывает сырой ключ `CREATED_SHOUT` вместо предложения. Так и должно быть — это не баг, а лишь отсутствующий перевод.
:::

## Что дальше

- **[Эндпоинты](/ru/addon/endpoints/)** — эндпоинт панели, который вызывает `requirePermission` и пишет эту строку журнала.
- **[Локализация](/ru/addon/localization/)** — переведите заголовок права доступа и строку журнала активности `CREATED_SHOUT`.
- **[Справочник Backend API § 7](/ru/addon/backend-reference/#_7-права-доступа-и-аутентификация)** — `Permission`, `PanelPermission` и полный список методов `AuthProvider`.
