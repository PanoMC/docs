# Разработка бэкенда

Бэкенд — это половина вашего аддона на Kotlin: та часть, что выполняется внутри собственного Java-процесса Pano. Она владеет вашими таблицами базы данных, вашими JSON-эндпоинтами, вашими правами доступа и вашими журналами активности администратора. Эта страница собирает **бэкенд-срез Shoutbox** — небольшого аддона, который мы проносим через всю документацию: посетители видят последние «выкрики» (shouts) на главной странице, а администраторы публикуют и удаляют их из панели.

К концу вы добавите таблицу базы данных, откроете публичный JSON-API, защитите админский эндпоинт правом доступа и запишете строку в журнал активности — и всё это кодом, который компилируется.

::: tip Аддоны — это плагины в коде
Везде в тексте мы говорим **аддон**, но имена уровня кода все используют слово `plugin` — `PanoPlugin`, `pluginId`, `PluginConfig` и так далее. Так и задумано; не переименовывайте ничего в коде.
:::

## Прежде чем начать

У вас уже должен быть переименованный, собирающийся аддон из раздела [Начало работы](/ru/addon/getting-started/), и полезно прочитать [Архитектуру](/ru/addon/architecture/), чтобы структура папок и два контекста Spring обрели смысл. Бэкенд живёт под `src/main/kotlin/com/panomc/plugins/shoutbox/`, разбитый на пакеты:

```
com/panomc/plugins/shoutbox/
├─ ShoutboxPlugin.kt
├─ config/       ShoutboxConfig.kt
├─ db/
│  ├─ model/     Shout.kt
│  ├─ dao/       ShoutDao.kt
│  ├─ impl/      ShoutDaoImpl.kt
│  └─ migration/ ShoutboxMigration1to2.kt
├─ routes/
│  ├─ api/       GetShoutsAPI.kt
│  └─ panel/     PanelAddShoutAPI.kt
├─ permission/   ManageShoutboxPermission.kt
├─ event/        SetupEventHandler.kt
└─ log/          CreatedShoutLog.kt
```

Вы никогда не связываете эти классы вручную. Когда Pano загружает ваш аддон, он даёт ему **собственный контекст Spring**, который сканирует только ваше поддерево пакетов, и любой класс, аннотированный `@Endpoint`, `@Dao`, `@Migration`, `@EventListener` или `@PermissionDefinition`, создаётся за вас с внедрением через конструктор.

::: warning Изменения в Kotlin никогда не горячие
Редактирование файла `.kt` ничего не меняет, пока вы не пересоберёте jar, не скопируете его в папку `plugins/` вашего экземпляра и не **перезапустите Pano**:

```bash
./gradlew build -Pnoui
cp build/libs/pano-plugin-shoutbox-local-build.jar <your-pano-instance>/plugins/
```

Отключение и повторное включение аддона в **Панель → Аддоны** *не* загружает пересобранный байт-код — PF4J держит уже загруженный загрузчик классов, — поэтому именно полный перезапуск Pano подхватывает новый jar. Только UI на Svelte живой при `bun run dev`. Держите это в голове, пока прорабатываете примеры ниже.
:::

## 1. Класс-точка входа

У каждого аддона есть один главный класс, расширяющий `PanoPlugin`. Наш — `ShoutboxPlugin`, и при запуске он делает ровно одну работу: инициализирует конфигурацию и базу данных — но **только после того, как завершился собственный мастер установки Pano**.

```kotlin
package com.panomc.plugins.shoutbox

import com.panomc.platform.api.PanoPlugin
import com.panomc.platform.api.PluginDatabaseManager
import com.panomc.platform.api.config.PluginConfigManager
import com.panomc.platform.setup.SetupManager
import com.panomc.plugins.shoutbox.config.ShoutboxConfig

class ShoutboxPlugin : PanoPlugin() {
    private val pluginDatabaseManager by lazy { applicationContext.getBean(PluginDatabaseManager::class.java) }
    private val setupManager by lazy { applicationContext.getBean(SetupManager::class.java) }
    private var isInitialized = false

    override suspend fun onStart() {
        startPlugin()
    }

    internal suspend fun startPlugin() {
        if (isInitialized || !setupManager.isSetupDone()) return

        val configManager = PluginConfigManager(this, ShoutboxConfig::class.java)
        pluginBeanContext.beanFactory.registerSingleton(PluginConfigManager::class.java.name, configManager)

        pluginDatabaseManager.initialize(this)
        isInitialized = true
    }

    override suspend fun onDisable() {
        isInitialized = false
    }

    override suspend fun onUninstall() {
        pluginDatabaseManager.uninstall(this)
    }
}
```

Читайте сверху вниз:

- `applicationContext.getBean(...)` дотягивается до **хост-бинов** — собственных сервисов Pano. `PluginDatabaseManager` и `SetupManager` нельзя внедрить в ваши конструкторы; вы получаете их именно так. (См. выноску в конце этого раздела.)
- `onStart()` выполняется, когда аддон загружается. Он вызывает `startPlugin()`, который сразу выходит, если установка ещё не завершена.
- `PluginConfigManager` создаётся один раз и регистрируется как синглтон **в вашем собственном контексте бинов** (`pluginBeanContext`). **Не** принимайте его как параметр конструктора в эндпоинте — ваши бины `@Endpoint` создаются, когда аддон *загружается*, до того как `onStart()` зарегистрирует этот синглтон, так что внедрение через конструктор упадёт с `NoSuchBeanDefinitionException`. Вместо этого получайте его лениво, во время запроса: `plugin.pluginBeanContext.getBean(PluginConfigManager::class.java)`.
- `pluginDatabaseManager.initialize(this)` создаёт ваши таблицы и выполняет все ожидающие миграции.

### Зачем нужна проверка установки

Если кто-то установит ваш аддон *до* того, как завершит мастер первоначальной установки Pano, базы данных ещё нет — `initialize()` упал бы. Поэтому `startPlugin()` выходит раньше времени. Чтобы подхватить работу в тот момент, когда установка завершится, добавьте небольшой слушатель событий рядом с классом плагина:

```kotlin
package com.panomc.plugins.shoutbox.event

import com.panomc.platform.api.annotation.EventListener
import com.panomc.platform.api.event.SetupEventListener
import com.panomc.plugins.shoutbox.ShoutboxPlugin

@EventListener
class SetupEventHandler(private val plugin: ShoutboxPlugin) : SetupEventListener {
    override suspend fun onSetupFinished() {
        plugin.startPlugin()
    }
}
```

Когда мастер завершается, Pano вызывает `onSetupFinished()`, `startPlugin()` выполняется снова, а благодаря защите `isInitialized` его безопасно вызывать более одного раза. Эта идиома с проверкой установки — каноническая форма для каждого аддона, который трогает базу данных, — копируйте её дословно, меняя только имена классов.

::: warning Используйте `@EventListener` от Pano, а не от Spring
Аннотация — это `com.panomc.platform.api.annotation.EventListener`, а **не** спринговская `org.springframework.context.event.EventListener`. У них одинаковое простое имя, поэтому легко импортировать не ту; если вы это сделаете, система событий молча никогда не вызовет ваш слушатель.
:::

::: tip `PluginDatabaseManager` против `DatabaseManager`
Два разных бина, оба получаемые через `getBean`:
- **`PluginDatabaseManager`** управляет *вашими* таблицами и миграциями — `initialize(plugin)` и `uninstall(plugin)`.
- **`DatabaseManager`** — это хост-сервис базы данных. Используйте его для общего SQL-клиента (`databaseManager.getSqlClient()`) и для основных DAO (пользователи, записи, журналы активности, …). Чтение собственных таблиц Pano — это ровно то, что делает `pano-plugin-bans`, — загляните туда за этим шаблоном.
:::

## 2. Конфигурация

Настройки, которые владелец сайта должен иметь возможность подстроить, живут в классе конфигурации, расширяющем `PluginConfig`:

```kotlin
package com.panomc.plugins.shoutbox.config

import com.panomc.platform.api.config.PluginConfig

class ShoutboxConfig(
    val enabled: Boolean = true,
    val maxShouts: Int = 5
) : PluginConfig()
```

При первом запуске Pano записывает это как HOCON-файл по пути `plugins/pano-plugin-shoutbox/config.conf`, используя ваши значения по умолчанию. Из любого места, где у вас есть `PluginConfigManager`, зарегистрированный на шаге 1, вы читаете типизированные значения через `configManager.config` (который даёт вам `ShoutboxConfig`) и сохраняете изменения через `configManager.saveConfig(JsonObject.mapFrom(...))`.

Вы можете документировать отдельные ключи в сгенерированном файле с помощью `@ConfigComment("…")` над полем, и группировать связанные ключи под заголовком с помощью `@ConfigSection("…")`. Когда позже вам понадобится добавить или переименовать ключи, делайте это через класс `PluginConfigMigration(from, to, versionInfo)`, аннотированный `@Migration`, — но никогда не редактируя файл на диске вручную.

## 3. Таблица базы данных

Таблица — это три небольших файла: **модель** (одна строка), **абстрактный DAO** (методы запросов, которые вы обещаете) и **impl** (SQL).

### Модель

```kotlin
package com.panomc.plugins.shoutbox.db.model

import com.panomc.platform.db.DBEntity

open class Shout(
    val id: Long? = null,
    val message: String = "",
    val username: String = "",
    val date: Long = 0
) : DBEntity()
```

`DBEntity` — это **абстрактный класс** (не аннотация). Строки преобразуются в вашу модель и обратно через Gson, поэтому **имя каждого поля соответствует столбцу с тем же именем**. Имя таблицы — это имя класса в snake_case плюс префикс таблиц вашего экземпляра, так что `Shout` становится `` `<prefix>shout` ``.

### Контракт DAO

```kotlin
package com.panomc.plugins.shoutbox.db.dao

import com.panomc.platform.db.Dao
import com.panomc.plugins.shoutbox.db.model.Shout
import io.vertx.sqlclient.SqlClient

abstract class ShoutDao : Dao<Shout>(Shout::class.java) {
    abstract suspend fun add(shout: Shout, sqlClient: SqlClient): Long
    abstract suspend fun getAll(sqlClient: SqlClient): List<Shout>
    abstract suspend fun deleteById(id: Long, sqlClient: SqlClient)
}
```

### Реализация

```kotlin
package com.panomc.plugins.shoutbox.db.impl

import com.panomc.platform.annotation.Dao
import com.panomc.plugins.shoutbox.db.dao.ShoutDao
import com.panomc.plugins.shoutbox.db.model.Shout
import io.vertx.kotlin.coroutines.coAwait
import io.vertx.mysqlclient.MySQLClient
import io.vertx.sqlclient.SqlClient
import io.vertx.sqlclient.Tuple
import org.springframework.beans.factory.config.ConfigurableBeanFactory
import org.springframework.context.annotation.Lazy
import org.springframework.context.annotation.Scope

@Dao
@Lazy
@Scope(value = ConfigurableBeanFactory.SCOPE_SINGLETON)
class ShoutDaoImpl : ShoutDao() {
    override val fields = listOf("id", "message", "username", "date")

    override suspend fun init(sqlClient: SqlClient) {
        sqlClient.query(
            """
            CREATE TABLE IF NOT EXISTS `${getTablePrefix() + tableName}` (
                `id` bigint NOT NULL AUTO_INCREMENT,
                `message` MEDIUMTEXT NOT NULL,
                `username` varchar(255) NOT NULL,
                `date` bigint NOT NULL,
                PRIMARY KEY (`id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """
        ).execute().coAwait()
    }

    override suspend fun uninstall(sqlClient: SqlClient) {
        sqlClient.query("DROP TABLE IF EXISTS `${getTablePrefix() + tableName}`").execute().coAwait()
    }

    override suspend fun add(shout: Shout, sqlClient: SqlClient): Long {
        val query = "INSERT INTO `${getTablePrefix() + tableName}` (`message`, `username`, `date`) VALUES (?, ?, ?)"
        val rows = sqlClient.preparedQuery(query)
            .execute(Tuple.of(shout.message, shout.username, shout.date))
            .coAwait()
        return rows.property(MySQLClient.LAST_INSERTED_ID)
    }

    override suspend fun getAll(sqlClient: SqlClient): List<Shout> {
        val rows = sqlClient
            .preparedQuery("SELECT ${fields.toTableQuery()} FROM `${getTablePrefix() + tableName}` ORDER BY `id` DESC")
            .execute()
            .coAwait()
        return rows.toEntities()
    }

    override suspend fun deleteById(id: Long, sqlClient: SqlClient) {
        sqlClient.preparedQuery("DELETE FROM `${getTablePrefix() + tableName}` WHERE `id` = ?")
            .execute(Tuple.of(id)).coAwait()
    }
}
```

Три детали, на которые стоит обратить внимание:

- Тройка `@Dao @Lazy @Scope(SCOPE_SINGLETON)` обязательна — именно так Pano обнаруживает ваш DAO и держит один его экземпляр.
- `init()` — это место, где живёт ваш `CREATE TABLE IF NOT EXISTS`; он выполняется, когда инициализируется база данных аддона. `uninstall()` необязателен и выполняется только когда аддон удаляют.
- `Row.toEntity()` / `RowSet.toEntities()` превращают строки запроса прямо в объекты `Shout`, а `fields.toTableQuery()` строит для вас список столбцов в обратных кавычках.

Обратите внимание: столбцы выше — `message`, `username`, `date` — это простые имена полей, и `date` записан в camelCase-стиле, а не в SQL-стиле `created_at`. Существующие аддоны пишут свой собственный DDL с **именами столбцов в camelCase, совпадающими с именами полей модели**, потому что именно этого ожидает Gson-маппинг строк. Следуйте этому прецеденту для своих таблиц.

::: danger `onUninstall` удаляет ваши таблицы
`pluginDatabaseManager.uninstall(this)` выполняет **`uninstall()` каждого DAO** — что для нас означает `DROP TABLE`. Это срабатывает при действии панели **Удалить**, а не при **Отключить**. Отключение сохраняет данные; удаление их выбрасывает. Убедитесь, что ваш `uninstall()` удаляет только то, чем вы действительно владеете.
:::

## 4. Эволюция схемы через миграцию

Как только ваш аддон окажется в мире, вы уже не сможете изменить исходный `CREATE TABLE` — на реальных установках уже есть старая форма. Чтобы добавить столбец позже, напишите миграцию:

```kotlin
package com.panomc.plugins.shoutbox.db.migration

import com.panomc.platform.annotation.Migration
import com.panomc.platform.db.DatabaseMigration
import com.panomc.plugins.shoutbox.db.dao.ShoutDao
import io.vertx.kotlin.coroutines.coAwait
import io.vertx.sqlclient.SqlClient

@Migration
class ShoutboxMigration1to2(
    private val shoutDao: ShoutDao
) : DatabaseMigration(1, 2, "Add pinned column") {
    override val handlers: List<suspend (SqlClient) -> Unit> = listOf(
        addPinnedColumn()
    )

    private fun addPinnedColumn(): suspend (SqlClient) -> Unit =
        { sqlClient: SqlClient ->
            val query = "ALTER TABLE `${shoutDao.getTablePrefix() + "shout"}` " +
                "ADD COLUMN `pinned` TINYINT(1) NOT NULL DEFAULT 0"
            sqlClient.query(query).execute().coAwait()
        }
}
```

Pano отслеживает **версию схемы для каждого аддона** (по ключу вашего `pluginId`). Миграция, чей `from` совпадает с сохранённой версией, выполняется, и версия повышается до её `to` — так что `1 → 2` выполняется один раз, на установках, всё ещё находящихся на версии 1, и больше никогда. Свежие установки перескакивают сразу к последней версии. Чтобы добавить ещё одно изменение позже, напишите `ShoutboxMigration2to3` и так далее.

::: warning Предпочитайте классы `@Migration` встроенным `ALTER TABLE`
Заманчиво добавить случайные операторы `ALTER TABLE` внутрь `init()` какого-нибудь DAO. Не делайте этого — это обходит отслеживание версии схемы, так что изменение не записывается и может повторно выполниться или столкнуться при обновлении. Изменения схемы после версии 1 принадлежат классу `@Migration`.
:::

## 5. Публичный API-эндпоинт

Теперь откройте выкрики для темы. Публичный JSON-эндпоинт расширяет `Api`:

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

- `@Endpoint` заставляет маршрут регистрироваться сам в тот миг, когда загружается аддон — вызова регистрации нет нигде.
- `ShoutDao` внедряется прямо в конструктор, потому что он живёт в вашем контексте бинов рядом с этим эндпоинтом.
- `paths` перечисляет URL и HTTP-метод. Выбирайте базовый класс по тому, кому разрешён доступ: `Api` (публичный), `LoggedInApi` (любой авторизованный пользователь), `PanelApi` (администраторы), `SetupApi` (только во время установки).
- `getSqlClient()` — это удобство на `Api`, которое даёт вам общий SQL-клиент.
- Успех — это `Successful(map)`, который сериализуется в `{"result":"ok", …ваша map…}`. Чтобы вернуть ошибку, вы **бросаете** подкласс платформенного `Error` (`NotFound`, `BadRequest`, `NoPermission`, …) или свой собственный; код ошибки, отправляемый клиенту, — это имя класса в `UPPER_SNAKE`.
- `getValidationHandler` здесь пустой, потому что `GET`-списку не нужно тело. Вы увидите, как он делает настоящую работу, в следующем разделе.

::: tip Пути панели начинаются с `/api/panel/`
Pano внутренне перенаправляет `/panel/api/*` на `/api/*`, поэтому **эндпоинты панели объявляют свой путь как `/api/panel/...`**, хотя UI панели вызывает `/panel/api/...`. Именно поэтому эндпоинт ниже использует `/api/panel/shoutbox`.
:::

## 6. Эндпоинт панели

Публикация выкрика — это админское действие, поэтому ему нужны три вещи, которых не было у публичного эндпоинта: **валидация запроса**, **проверка права доступа** и **запись в журнал активности**. Все три появляются в одном эндпоинте:

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

Разбор новых частей:

- **Валидация** использует DSL `Schemas` (`objectSchema()`, `requiredProperty`, `stringSchema()`) плюс `RequestPredicate.BODY_REQUIRED`. Запрос с отсутствующим или некорректным телом отклоняется до того, как ваш `handle` вообще выполнится.
- **`authProvider.requirePermission(ManageShoutboxPermission(), context)`** — это самая первая строка `handle`. Если у авторизованного администратора нет права доступа, она бросает исключение и запрос отклоняется. Получайте `AuthProvider` и `DatabaseManager` из хоста через `getBean`, ровно как раньше.
- **Журнал активности** записывается через `databaseManager.panelActivityLogDao.add(CreatedShoutLog(...), sqlClient)`, так что лента активности панели администратора показывает, кто что опубликовал.

Эндпоинт ссылается на два класса, которые мы ещё не написали — `ManageShoutboxPermission` и `CreatedShoutLog`. Это следующие два раздела.

## 7. Право доступа

```kotlin
package com.panomc.plugins.shoutbox.permission

import com.panomc.platform.annotation.PermissionDefinition
import com.panomc.platform.auth.PanelPermission

@PermissionDefinition
class ManageShoutboxPermission : PanelPermission("fa-bullhorn")
```

`@PermissionDefinition` регистрирует право доступа автоматически, а строка в конструкторе — это иконка FontAwesome, показываемая рядом с ним в списке прав доступа панели.

**Узел права доступа** — строка, которую вы проверяете везде в другом коде, — выводится из имени класса по правилу:

1. Отбросьте завершающее `Permission` → `ManageShoutbox`.
2. Разбейте на слова, приведите их к нижнему регистру, соедините точками → `manage.shoutbox`.
3. Добавьте префикс `pano.plugin.<pluginId>.` → **`pano.plugin.pano-plugin-shoutbox.manage.shoutbox`**.

Вы никогда не набираете этот узел в Kotlin — передать `ManageShoutboxPermission()` в `requirePermission` достаточно. Но вы **действительно** повторяете эту точную строку в коде фронтенда, чтобы закрыть страницы панели и ссылки навигации. См. [Разработку фронтенда](/ru/addon/frontend/) о том, где именно; если вы переименуете класс Kotlin, не забудьте обновить эту скопированную строку.

## 8. Журнал активности

Запись журнала активности — это небольшой класс, расширяющий `PluginActivityLog` и несущий `JsonObject` с деталями:

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

Панель отрисовывает это на своей странице Активности, используя строку локали, ключом которой является имя класса (без суффикса `Log`, в `UPPER_SNAKE`) под объектом `activity-logs` в ваших файлах локалей — так что `CreatedShoutLog` ищет `activity-logs.CREATED_SHOUT`. Эта строка использует значения `{username}` и `{target}` из полезной нагрузки деталей. Её настройка описана в разделе [Локализация](/ru/addon/localization/).

## Что ещё может делать бэкенд

Shoutbox использует лишь срез поверхности бэкенда. Доступно больше — среди прочего:

- **События** — реагируйте на входы, регистрации, удаления аккаунтов и порождайте собственные межаддонные события.
- **Токены и почта** — выпускайте подписанные токены и отправляйте письма по шаблонам (см. `pano-plugin-auth-guard`).
- **Уведомления** — отправляйте уведомления в панель и пользователям.
- **Связь с сервером Minecraft** — отправляйте сообщения и обрабатывайте события от внутриигрового плагина.
- **Консольные команды** и **загрузка файлов** — регистрируйте CLI-команды и принимайте multipart-загрузки.

## Что дальше

- **[Разработка фронтенда](/ru/addon/frontend/)** — соберите виджет Shoutbox и UI панели, которые вызывают только что написанные вами эндпоинты.
- **[Локализация](/ru/addon/localization/)** — переведите метки прав доступа и сообщения журнала активности.
- **[Архитектура](/ru/addon/architecture/)** — вернитесь к жизненному циклу загрузки и двум контекстам Spring.
