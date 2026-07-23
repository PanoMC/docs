# Эндпоинты (маршруты и JSON API)

**Что даёт вам эта страница:** к концу у вас будет собственный публичный URL, возвращающий JSON, и URL панели только для администраторов, который валидирует тело своего запроса, — два эндпоинта, которые нужны Shoutbox, чтобы тема могла читать выкрики, а администратор — их публиковать.

**Эндпоинт** — это один веб-адрес, на который отвечает ваш аддон. Вы пишете класс с аннотацией `@Endpoint`, расширяющий один из базовых API-классов Pano; Pano регистрирует маршрут в тот миг, как ваш аддон загружается, — вызова регистрации нигде нет.

Каждая правка бэкенда требует пересборки-и-перезапуска, прежде чем вступит в силу, — см. этот шаг в [Обзоре бэкенда](/ru/addon/backend/).

## Публичный API-эндпоинт

Откройте выкрики теме. Публичный JSON-эндпоинт расширяет `Api` (файл `routes/api/GetShoutsAPI.kt`):

```kotlin
package com.panomc.plugins.shoutbox.routes.api

import com.panomc.platform.annotation.Endpoint
import com.panomc.platform.model.*
import com.panomc.plugins.shoutbox.db.dao.ShoutDao
import io.vertx.ext.web.RoutingContext
import io.vertx.ext.web.validation.ValidationHandler
import io.vertx.ext.web.validation.builder.ValidationHandlerBuilder
import io.vertx.json.schema.SchemaRepository

@Endpoint
class GetShoutsAPI(private val shoutDao: ShoutDao) : Api() {
    override val paths = listOf(Path("/api/shoutbox/list", RouteType.GET))

    override fun getValidationHandler(schemaRepository: SchemaRepository): ValidationHandler =
        ValidationHandlerBuilder.create(schemaRepository).build()

    override suspend fun handle(context: RoutingContext): Result {
        val sqlClient = getSqlClient()
        return Successful(mapOf("shouts" to shoutDao.getAll(sqlClient)))
    }
}
```

Что происходит:

- `@Endpoint` заставляет маршрут зарегистрировать себя в тот миг, как загружается аддон, — вызова регистрации нигде нет.
- `ShoutDao` внедряется прямо в конструктор, потому что он живёт в **вашей коробке** рядом с этим эндпоинтом (внедрение через конструктор — см. [Обзор бэкенда](/ru/addon/backend/#как-pano-строит-ваши-классы-за-вас)). Сам DAO строится на странице [База данных и миграции](/ru/addon/database/).
- `paths` перечисляет URL и HTTP-метод. Выбирайте базовый класс по тому, кому разрешён вход: `Api` (публичный), `LoggedInApi` (любой вошедший пользователь), `PanelApi` (администраторы), `SetupApi` (только во время установки).
- `getSqlClient()` — это удобство на `Api`, которое передаёт вам общий SQL-клиент.
- **Вы должны переопределить `getValidationHandler`, даже когда валидировать нечего** — верните пустой builder ровно как показано (`ValidationHandlerBuilder.create(schemaRepository).build()`). Не удаляйте это переопределение; сборке оно нужно. Эндпоинт панели ниже показывает его за настоящей работой над телом запроса.
- Успех — это `Successful(map)`, который сериализуется в `{"result":"ok", …ваша map…}`. Чтобы провалить, вы **бросаете** подкласс платформенного `Error` (`NotFound`, `BadRequest`, `NoPermission`, …) или свой собственный; код ошибки, отправляемый клиенту, — это имя класса в `UPPER_SNAKE`.

::: tip Контрольная точка: постучитесь в свой первый эндпоинт
Это награда — ваш URL, возвращающий ваш JSON. Пересоберите, скопируйте, перезапустите, затем откройте свой эндпоинт в браузере (или `curl` его):

```
http://localhost:8088/api/shoutbox/list
```

Порт `8088` — это адрес Pano, когда вы запустили его с `--dev`; на установке по умолчанию Pano слушает порт `80`, поэтому используйте вместо этого `http://localhost/api/shoutbox/list`. В любом случае вы должны увидеть:

```json
{"result":"ok","shouts":[]}
```

**Пустой** список `shouts` — потому что пока никто не опубликовал выкрик. Вы опубликуете один в конце этой страницы.
:::

**Необязательно: примените `maxShouts`.** Если вы добавили ключ конфигурации `maxShouts` на странице [Конфигурация](/ru/addon/configuration/), этот эндпоинт — то место, где он оправдывает своё существование. Используя паттерн чтения конфигурации во время запроса с той страницы, вы можете ограничить список настроенным числом. Всё остальное вы уже видели; единственные добавления — это внедрение `plugin` (ваш класс плагина внедряем) и стандартный `take(n)` из Kotlin:

```kotlin
// Optional variant of handle(): respect maxShouts.
// For this to compile, also add `private val plugin: ShoutboxPlugin` to the constructor,
// alongside `shoutDao`, so you can reach pluginBeanContext.
val sqlClient = getSqlClient()
val configManager = plugin.pluginBeanContext.getBean(PluginConfigManager::class.java)
val limit = (configManager.config as ShoutboxConfig).maxShouts
return Successful(mapOf("shouts" to shoutDao.getAll(sqlClient).take(limit)))
```

## Эндпоинт панели

Публикация выкрика — административное действие, поэтому этот эндпоинт делает три вещи, которых не делал публичный: он **валидирует тело запроса**, **проверяет право доступа** и **пишет строку в журнал активности**. Это самый большой блок кода здесь — пока читаете его, ищите эти три работы по порядку.

::: tip Пути панели начинаются с `/api/panel/`
URL-адреса панели переписываются один раз на входе, что каждого спотыкает в первый раз. Читайте это как отображение, слева направо:

| UI панели вызывает… | Pano переписывает это в… | Значит в Kotlin вы пишете… |
|---|---|---|
| `POST /panel/api/shoutbox` | `/api/panel/shoutbox` | `Path("/api/panel/shoutbox", RouteType.POST)` |

**Правило большого пальца:** в Kotlin всегда начинайте путь эндпоинта панели с `/api/panel/`.
:::

::: warning Внимание: этот файл сам по себе пока не скомпилируется
`PanelAddShoutAPI` ссылается на два класса, рассмотренные на странице [Права доступа и журналы активности](/ru/addon/permissions/), — `ManageShoutboxPermission` и `CreatedShoutLog`. Напишите все три, **затем** соберите один раз. Если вы соберёте сразу после этого раздела, ждите ошибок «unresolved reference»; это два отсутствующих класса, а не ошибка в этом файле.
:::

Файл `routes/panel/PanelAddShoutAPI.kt`:

```kotlin
package com.panomc.plugins.shoutbox.routes.panel

import com.panomc.platform.annotation.Endpoint
import com.panomc.platform.auth.AuthProvider
import com.panomc.platform.db.DatabaseManager
import com.panomc.platform.error.BadRequest
import com.panomc.platform.model.*
import com.panomc.plugins.shoutbox.ShoutboxPlugin
import com.panomc.plugins.shoutbox.db.dao.ShoutDao
import com.panomc.plugins.shoutbox.db.model.Shout
import com.panomc.plugins.shoutbox.log.CreatedShoutLog
import com.panomc.plugins.shoutbox.permission.ManageShoutboxPermission
import io.vertx.ext.web.RoutingContext
import io.vertx.ext.web.validation.RequestPredicate
import io.vertx.ext.web.validation.ValidationHandler
import io.vertx.ext.web.validation.builder.Bodies
import io.vertx.ext.web.validation.builder.ValidationHandlerBuilder
import io.vertx.json.schema.SchemaRepository
import io.vertx.json.schema.common.dsl.Schemas.*

@Endpoint
class PanelAddShoutAPI(
    private val plugin: ShoutboxPlugin,
    private val shoutDao: ShoutDao
) : PanelApi() {
    override val paths = listOf(Path("/api/panel/shoutbox", RouteType.POST))

    private val authProvider by lazy { plugin.applicationContext.getBean(AuthProvider::class.java) }
    private val databaseManager by lazy { plugin.applicationContext.getBean(DatabaseManager::class.java) }

    override fun getValidationHandler(schemaRepository: SchemaRepository): ValidationHandler =
        ValidationHandlerBuilder.create(schemaRepository)
            .body(
                Bodies.json(
                    objectSchema()
                        .requiredProperty("message", stringSchema())
                )
            )
            .predicate(RequestPredicate.BODY_REQUIRED)
            .build()

    override suspend fun handle(context: RoutingContext): Result {
        authProvider.requirePermission(ManageShoutboxPermission(), context)

        val data = getParameters(context).body().jsonObject
        val message = data.getString("message")

        if (message.isNullOrBlank()) {
            throw BadRequest()
        }

        val sqlClient = getSqlClient()
        val userId = authProvider.getUserIdFromRoutingContext(context)
        val username = databaseManager.userDao.getUsernameFromUserId(userId, sqlClient)!!

        shoutDao.add(Shout(message = message, username = username, date = System.currentTimeMillis()), sqlClient)
        databaseManager.panelActivityLogDao.add(CreatedShoutLog(userId, username, plugin.pluginId, message), sqlClient)

        return Successful()
    }
}
```

Проходя по трём новым работам:

- **Валидация** использует DSL `Schemas` (`objectSchema()`, `requiredProperty`, `stringSchema()`) плюс `RequestPredicate.BODY_REQUIRED`. Запрос с отсутствующим или некорректным телом отклоняется ещё до того, как ваш `handle` вообще запустится.
- **Проверка права доступа:** `authProvider.requirePermission(ManageShoutboxPermission(), context)` — самая первая строка `handle`. Если у вошедшего администратора нет права доступа, она бросает исключение, и запрос отклоняется. (`AuthProvider` и `DatabaseManager` — собственные сервисы Pano, поэтому вы извлекаете их из коробки Pano через `getBean`.) Класс права доступа определён на странице [Права доступа и журналы активности](/ru/addon/permissions/).
- **Журнал активности:** `databaseManager.panelActivityLogDao.add(CreatedShoutLog(...), sqlClient)` записывает, кто что опубликовал, чтобы лента активности административной панели могла это показать. Класс `CreatedShoutLog` определён на той же странице [Права доступа и журналы активности](/ru/addon/permissions/).
- Один кусочек синтаксиса Kotlin там: `getUsernameFromUserId(userId, sqlClient)!!` заканчивается на `!!`, что утверждает «это значение не null — упади, если оно вдруг null». Здесь это безопасно, потому что у вошедшего администратора всегда есть имя пользователя.

## Попробуйте от начала до конца

Вот полный цикл, который обещал бэкенд, — таблица базы данных, публичный JSON-API, защищённый административный эндпоинт и строка журнала активности, работающие вместе. Вы уже видели пустой список; теперь создайте выкрик и посмотрите, как он появится.

1. **До:** откройте `http://localhost:8088/api/shoutbox/list` (или форму с портом `80` на установке по умолчанию). Вы всё ещё должны видеть `{"result":"ok","shouts":[]}`.
2. **Опубликуйте выкрик:** отправьте `POST /panel/api/shoutbox` с телом JSON `{"message":"Hello Pano!"}` от имени вошедшего администратора. Проще всего — из UI панели, который вы построите в [Разработке фронтенда](/ru/addon/frontend/); чтобы сделать это прямо сейчас, `curl` этот URL через аутентифицированную сессию вашего браузера (эндпоинту нужна ваша админская сессионная кука, поэтому UI панели — более простой путь).
3. **После:** обновите `http://localhost:8088/api/shoutbox/list` — ваш выкрик теперь в JSON:

```json
{"result":"ok","shouts":[{"id":1,"message":"Hello Pano!","username":"<you>","date":1700000000000}]}
```

4. **Лента активности:** откройте **Панель → Активность** — вы увидите свою запись `CREATED_SHOUT` (показанную как сырой ключ, пока вы не добавите строку локали в [Локализации](/ru/addon/localization/)).

Если все четыре шага сходятся, бэкенд-половина Shoutbox готова.

## Если это не работает

Сбои, о которых предупреждают страницы бэкенда, в одном месте — симптом, причина, исправление:

| Симптом | Вероятная причина | Исправление |
|---|---|---|
| Аддона нет в **Панель → Аддоны** | jar не был скопирован в `plugins/` или Pano не был перезапущен | пересоберите, `cp` jar в `plugins/` экземпляра и **перезапустите** Pano |
| Ваш слушатель событий никогда не срабатывает (барьер установки никогда не выполняется) | вы импортировали `@EventListener` от Spring вместо Pano | используйте `com.panomc.platform.api.annotation.EventListener` (см. [События](/ru/addon/events/)) |
| Крах: `NoSuchBeanDefinitionException` | вы взяли `PluginConfigManager` (или другой bean, зарегистрированный в `onStart`) как параметр конструктора | извлекайте его во время запроса через `plugin.pluginBeanContext.getBean(...)` (см. [Конфигурацию](/ru/addon/configuration/)) |
| Запрос отклонён с `NO_PERMISSION` | роли (не-администратора), вызывающей эндпоинт панели, не выдано право доступа | выдайте его в **Панель → Роли** или тестируйте как администратор (администраторы обходят проверку — см. [Права доступа](/ru/addon/permissions/)) |
| Правка в Kotlin как будто игнорируется | вы отключили/включили аддон вместо перезапуска | Kotlin не горячий — пересоберите и **перезапустите** Pano |

## Что дальше

- **[База данных и миграции](/ru/addon/database/)** — `ShoutDao`, который внедряет эта страница, плюс модель и SQL за ним.
- **[Права доступа и журналы активности](/ru/addon/permissions/)** — определите `ManageShoutboxPermission` и `CreatedShoutLog`, чтобы эндпоинт панели скомпилировался.
- **[Конфигурация](/ru/addon/configuration/)** — добавьте ключ `maxShouts`, который читает необязательный вариант.
- **[Справочник Backend API](/ru/addon/backend-reference/)** — каждый примитив маршрута, базовый класс, результат и ошибку по имени.
