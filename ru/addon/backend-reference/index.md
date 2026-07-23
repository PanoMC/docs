# Справочник Backend API

Полная бэкенд-поверхность аддона Pano, сгруппированная по темам. Это справочный компаньон к туториалу [Разработка бэкенда](/ru/addon/backend/): туториал показывает, *как* связать части воедино на примере Shoutbox, а эта страница перечисляет, *что существует*, чтобы вам никогда не приходилось читать исходники платформы в поисках точки расширения по имени.

Каждая запись даёт своё имя, однострочное назначение и минимальную сигнатуру. Обращайтесь к туториалу за проработанным, компилирующимся кодом; обращайтесь к этой странице, чтобы ответить на вопрос «существует ли API для этого и как он называется?»

::: tip Проверено по исходникам
Всё на этой странице переписано из исходников платформы. Строка `Источник:` под каждой группой указывает на определяющий файл в `pano-web-platform` (пакет `com.panomc.platform`, под `Pano/src/main/kotlin/`), так что вы всегда можете подтвердить сигнатуру или прочитать окружающий код.
:::

::: tip Аддоны в коде — это плагины
Как и везде в этой документации: в тексте говорится **аддон**, но в коде используется `plugin` — `PanoPlugin`, `pluginId`, `PluginConfig`. Метаданные аддона (id, имя, главный класс, зависимости) не задаются в коде; они живут в манифесте jar, генерируемом из `gradle.properties` — см. [Конфигурацию манифеста](/ru/addon/manifest/).
:::

## 1. Класс-точка входа и жизненный цикл — `PanoPlugin`

У каждого аддона есть ровно один класс, расширяющий `PanoPlugin`. Это ваша точка входа, держатель внедрённых дескрипторов среды выполнения и владелец хуков жизненного цикла.

*Источник: `com.panomc.platform.api.PanoPlugin`*

### Внедряемые свойства

Устанавливаются хостом до `onCreate()`; читайте их откуда угодно в классе.

| Свойство | Тип | Что это |
|---|---|---|
| `pluginId` | `String` | id вашего аддона (из манифеста) |
| `vertx` | `Vertx` | Экземпляр Vert.x — таймеры, шина событий, `WebClient` |
| `pluginBeanContext` | `AnnotationConfigApplicationContext` | Контекст Spring, содержащий *ваши* бины |
| `pluginGlobalBeanContext` | `AnnotationConfigApplicationContext` | Общий контекст для межаддонных бинов |
| `applicationContext` | `AnnotationConfigApplicationContext` | Контекст хоста — получайте сервисы Pano через `getBean(...)` |
| `pluginEventManager` | `PluginEventManager` | Порождать/получать межаддонные события |
| `pluginUiManager` | `PluginUiManager` | Реестр UI-бандлов (управляется за вас) |
| `environmentType` | `Main.Companion.EnvironmentType` | `DEVELOPMENT` / `RELEASE` |
| `releaseStage` | `ReleaseStage` | канал alpha / beta / stable |
| `pluginState` | `PluginState` | Состояние загрузки PF4J |
| `pluginDataFolder` | `File` | Каталог данных `plugins/<pluginId>/` (создаётся автоматически) |
| `logger` | `Logger` | Логгер SLF4J, привязанный к вашему классу |

### Хуки жизненного цикла

Все — `open suspend fun`, по умолчанию ничего не делают — переопределяйте только то, что нужно. По порядку:

```
загрузка jar → onCreate() → onEnable() → onStart()
        …работает…
onStop() → onDisable() → onUninstall()
```

| Хук | Когда выполняется |
|---|---|
| `onCreate()` | Объект плагина сконструирован |
| `onEnable()` | Аддон включён |
| `onStart()` | Аддон запускается — сюда идёт ваша инициализация (ставьте заслон на установку) |
| `onStop()` | Аддон останавливается — отменяйте здесь таймеры/задачи |
| `onDisable()` | Аддон отключён (данные сохраняются) |
| `onUninstall()` | Аддон **удалён** — сбрасывайте здесь свои таблицы |
| `verifyLicense()` | Кнопка «Обновить лицензию» в панели (премиум-аддоны) |

### Методы

| Метод | Сигнатура | Назначение |
|---|---|---|
| `registerSingletonGlobal` | `(bean: Any)` | Поделиться бином с другими аддонами |
| `unRegisterGlobal` | `(bean: Any)` | Удалить общий бин |
| `register` | `(listener: PluginEventListener)` | Зарегистрировать динамический слушатель событий |
| `unRegister` | `(listener: PluginEventListener)` | Удалить динамический слушатель событий |
| `registerCommands` | `(obj: Any)` | Зарегистрировать методы `@Command` на объекте |
| `unRegisterCommands` | `(obj: Any)` | Удалить их |
| `getLicenseManager` | `(): LicenseManager` | Хост-сервис лицензий (премиум) |
| `getLicenseJwtIssuer` | `(): String` | Ожидаемый `iss` для JWT-лицензий |
| `getOwnJarSha256` | `(): String?` | SHA-256 загруженного jar или null |

::: warning Хост-бины нельзя внедрить
Внедрение через конструктор работает только для *ваших* бинов (в `pluginBeanContext`). Собственные сервисы Pano (`DatabaseManager`, `AuthProvider`, `SetupManager`, …) живут в `applicationContext` — получайте их через `applicationContext.getBean(SomeService::class.java)`, в идеале `by lazy`.
:::

## 2. Стереотипные аннотации

Классы, несущие их, обнаруживаются и создаются автоматически при загрузке вашего аддона — вызова ручной регистрации нет. Все живут в `com.panomc.platform.annotation`, **кроме** `@EventListener`.

*Источник: `com.panomc.platform.annotation.*`, `com.panomc.platform.api.annotation.EventListener`*

| Аннотация | Ставится на | Назначение |
|---|---|---|
| `@Endpoint` | подкласс `Api` | Зарегистрировать HTTP-маршрут |
| `@Dao` | реализацию `Dao` (в паре с `@Lazy @Scope(SCOPE_SINGLETON)`) | Зарегистрировать синглтон DAO |
| `@Migration` | `DatabaseMigration` или `PluginConfigMigration` | Зарегистрировать миграцию |
| `@EventListener` | класс слушателя событий | Зарегистрировать слушатель |
| `@PermissionDefinition` | подкласс `Permission` | Зарегистрировать право доступа |
| `@NotificationDefinition` | тип уведомления | Зарегистрировать тип уведомления |
| `@Event` | WS-обработчик MC-сервера (только хост) | Аддоны используют вместо этого `ServerManager.registerEvent` |
| `@Ignore` | поле сущности | Исключить поле из отображения на столбцы |

::: warning Используйте `@EventListener` от Pano, а не от Spring
Аннотация — это `com.panomc.platform.api.annotation.EventListener`, а **не** `org.springframework.context.event.EventListener`. У них одинаковое простое имя; импортируете не ту — и система событий молча никогда не вызовет ваш слушатель.
:::

## 3. HTTP-эндпоинты и маршрутизация

Эндпоинт — это класс, аннотированный `@Endpoint` и расширяющий один из базовых API-классов. Внедрение через конструктор подключает ваши DAO и бины.

*Источник: `com.panomc.platform.model` (`Route`, `Path`, `RouteType`, `Api`, `LoggedInApi`, `PanelApi`, `SetupApi`, `Template`, `Result`, `Error`)*

### Примитивы маршрутов

| Тип | Сигнатура | Назначение |
|---|---|---|
| `Path` | `Path(url: String, routeType: RouteType)` | Один URL + метод, на который отвечает эндпоинт |
| `RouteType` | `ROUTE`, `GET`, `POST`, `PUT`, `DELETE` | HTTP-метод (`ROUTE` = любой/шаблон) |
| `Route.paths` | `val paths: List<Path>` | Пути, которые обрабатывает этот маршрут (обязательно) |
| `Route.order` | `open val order = 1` | Порядок сопоставления среди конкурирующих маршрутов |
| `Route.getValidationHandler` | `(schemaRepository): ValidationHandler?` | Валидация тела/параметров запроса |
| `Route.corsHandler` | `open fun corsHandler(): Handler?` | Переопределить CORS (значения по умолчанию предоставлены) |
| `Route.bodyHandler` | `open fun bodyHandler(): Handler?` | Переопределить разбор тела (см. загрузки) |

### Базовые классы — выбирайте по тому, кто может вызывать

| Базовый класс | Кому разрешено | Объявляйте пути как |
|---|---|---|
| `Api` | Кто угодно (публично) | `/api/...` |
| `LoggedInApi` | Любой вошедший пользователь | `/api/...` |
| `PanelApi` | Администраторы (расширяет `LoggedInApi`) | `/api/panel/...` |
| `SetupApi` | Только во время первоначальной установки | `/api/...` |
| `Template` | Маршрут HTML, отрисованного на сервере | — |

::: tip Пути панели объявляются как `/api/panel/...`
Pano внутренне перенаправляет вызовы UI панели `/panel/api/*` на `/api/*`, поэтому `PanelApi` объявляет свой `Path` в форме `/api/panel/...`, хотя браузер запрашивает `/panel/api/...`.
:::

### Обработка запроса (члены `Api`)

| Член | Сигнатура | Назначение |
|---|---|---|
| `handle` | `abstract suspend fun handle(context: RoutingContext): Result?` | Тело вашего эндпоинта |
| `getSqlClient` | `suspend fun getSqlClient(): SqlClient` | Общий SQL-клиент |
| `getParameters` | `fun getParameters(context): RequestParameters` | Проверенные параметры тела/запроса/пути |
| `checkSetup` | `fun checkSetup()` | Бросает `InstallationRequired`, если установка не завершена |
| `isAllowedInDemo` | `open fun isAllowedInDemo(method: HttpMethod): Boolean` | Заслон для записи, когда экземпляр работает в демо-режиме |

### Результаты и ошибки

| Сущность | Сигнатура | Назначение |
|---|---|---|
| `Successful` | `Successful(map: Map = emptyMap())` | Успех → `{"result":"ok", …map…}` |
| `Errors` | `Errors(map: Map)` | Полезная нагрузка ошибок на уровне полей |
| Подклассы `Error` | `throw NotFound()` / `BadRequest()` / … | ~100 предопределённых в `com.panomc.platform.error` (`NotFound`, `BadRequest`, `NoPermission`, `NotLoggedIn`, `InternalServerError`, …) |
| Своя ошибка | `class MyError : Error(statusCode, …)` | Код ошибки для клиента = простое имя класса в `UPPER_SNAKE` |

Чтобы завалить запрос, вы **бросаете** `Error` — а не возвращаете его. Ошибки валидации превращаются в `BadRequest` за вас.

### Загрузка файлов — свой `bodyHandler()`

Переопределите `bodyHandler()`, чтобы принимать multipart-загрузки, и проверяйте через `Bodies.multipartFormData`. Паттерн (см. `pano-plugin-slider` `PanelAddSliderItemAPI`):

```kotlin
override fun bodyHandler(): Handler<RoutingContext> =
    BodyHandler.create()
        .setDeleteUploadedFilesOnEnd(true)
        .setBodyLimit(FILE_UPLOAD_SIZE)

override fun getValidationHandler(schemaRepository: SchemaRepository): ValidationHandler =
    ValidationHandlerBuilder.create(schemaRepository)
        .body(Bodies.multipartFormData(objectSchema().property("title", stringSchema())))
        .predicate(RequestPredicate.MULTIPART)
        .build()
// uploaded files: context.fileUploads()
```

## 4. База данных

Три файла на таблицу — модель, абстрактный DAO, реализация `@Dao` — плюс необязательные миграции. Туториал [Разработка бэкенда](/ru/addon/backend/) собирает одну от начала до конца.

*Источник: `com.panomc.platform.db` (`Dao`, `DBEntity`, `DatabaseMigration`), `com.panomc.platform.api.PluginDatabaseManager`*

| Тип | Сигнатура | Назначение |
|---|---|---|
| `DBEntity` | `abstract class` (имеет статический `gson`) | Основа для модели строки; **не** аннотация |
| `@Ignore` | аннотация поля | Держать поле модели вне отображения на столбцы |
| `Dao<T : DBEntity>` | `abstract class Dao<T>(entityClass: Class<T>)` | Базовый DAO |
| `Dao.init` | `abstract suspend fun init(sqlClient: SqlClient)` | Здесь `CREATE TABLE IF NOT EXISTS …` |
| `Dao.uninstall` | `open suspend fun uninstall(sqlClient: SqlClient)` | `DROP TABLE …` (необязательно) |
| `Dao.fields` | `open val fields: List<String>` | Имена столбцов для построения запросов |
| `Dao.tableName` | `protected val tableName` | Имя класса сущности в `snake_case` |
| `Dao.getTablePrefix` | `fun getTablePrefix(): String` | Префикс таблиц экземпляра |
| `Row.toEntity()` | расширение | Одна строка → ваша модель (через Gson) |
| `RowSet.toEntities()` | расширение | Много строк → `List<T>` |
| `List<String>.toTableQuery()` | расширение | Список столбцов в обратных кавычках |
| `DatabaseMigration` | `DatabaseMigration(from: Int, to: Int, info: String)` | Шаг схемы; переопределите `val handlers: List<suspend (SqlClient) -> Unit>` |
| `PluginDatabaseManager.initialize` | `suspend fun initialize(plugin: PanoPlugin)` | Создать таблицы + выполнить ожидающие миграции |
| `PluginDatabaseManager.uninstall` | `suspend fun uninstall(plugin: PanoPlugin)` | Выполнить `uninstall()` каждого DAO |

Сырой SQL к собственным таблицам Pano идёт через хост-`DatabaseManager` (`databaseManager.getSqlClient()`, ядровые DAO вроде `userDao`); корутины ожидают Vert.x-future через `coAwait()`.

::: warning `onUninstall` сбрасывает ваши таблицы
`pluginDatabaseManager.uninstall(this)` выполняет **`uninstall()` каждого DAO** — это действие панели **Удалить**, а не **Отключить**. Отключение сохраняет данные.
:::

## 5. Конфигурация

Класс конфигурации, расширяющий `PluginConfig`, записывается в `plugins/<pluginId>/config.conf` (HOCON) при первом запуске и читается обратно типизированным.

*Источник: `com.panomc.platform.api.config` (`PluginConfig`, `PluginConfigManager`, `PluginConfigMigration`, `ConfigComment`, `ConfigSection`)*

| Тип | Сигнатура | Назначение |
|---|---|---|
| `PluginConfig` | `open class PluginConfig` (имеет `version: Int`) | Основа для вашей конфигурации; добавляйте свои поля со значениями по умолчанию |
| `PluginConfigManager<T>` | `PluginConfigManager(plugin, T::class.java)` | Загружает/сохраняет файл для одного класса конфигурации |
| `.config` | `val config: T` | Текущие типизированные значения |
| `.saveConfig` | `fun saveConfig(config: JsonObject)` | Сохранить изменения на диск |
| `.configFilePath` | `val configFilePath: String` | Разрешённый путь к `config.conf` |
| `PluginConfigMigration` | `PluginConfigMigration(from: Int, to: Int, versionInfo: String)` | Переопределите `fun migrate(config: JsonObject)`; аннотируйте `@Migration` |
| `@ConfigComment` | `@ConfigComment(vararg lines: String)` | Комментарий-документация над полем в генерируемом файле |
| `@ConfigSection` | `@ConfigSection(title: String)` | Сгруппировать ключи под заголовком |

Регистрируйте менеджер как синглтон в `pluginBeanContext` во время `onStart()` (см. класс-точку входа в туториале [Разработка бэкенда](/ru/addon/backend/)); получайте его лениво во время запроса.

## 6. Слушатели событий

Большинство из них работают одинаково: реализуйте интерфейс, аннотируйте класс `@EventListener`, и Pano вызовет вас, когда событие сработает. Их методы — `suspend` с пустой реализацией по умолчанию, если не помечены абстрактными, так что вы переопределяете только то, что нужно — исключение составляет `RouterEventListener`, чьи `onInitRouteList` и `onRouterCreate` — это обычные (не-`suspend`) **абстрактные** функции, которые вы обязаны реализовать. (`PluginLifecycleListener` стоит особняком — см. заметку под таблицей.)

*Источник: `com.panomc.platform.api.event.*`*

| Интерфейс | Методы (значимые для плагина) |
|---|---|
| `SetupEventListener` | `onSetupFinished()` |
| `RouterEventListener` | `onInitRouteList(routes: MutableList<Route>)`, `onRouterCreate(router: Router)` |
| `AuthEventListener` | `onBeforeAuthenticate(context, sqlClient): LoginDecision?`, `onBeforeVerifyLinkCode(context, sqlClient): LoginDecision?`, `onBeforeLogin(user, context, sqlClient): LoginDecision?`, `onAfterLogin(user, context, sqlClient)`, `onAfterRegister(user, sqlClient)` |
| `PlayerEventListener` | `onDelete(user: User)` — очистка при удалении аккаунта |
| `ProfilePictureEventListener` | `resolveProfilePictureUrl(user: User): String?` |
| `PluginLifecycleListener` | `onPluginLoad/Enable/Disable/Unload/Uninstall(plugin: PanoPlugin)` |
| `PluginEventListener` | Маркер для ваших собственных межаддонных событий |

`onBeforeLogin` и ему подобные возвращают `LoginDecision`: `Deny(errorKey, extras)`, `RequireUsername(userId)` или `Allow`.

Два способа зарегистрировать: класс с `@EventListener` в вашем пакете (статически) или `plugin.register(listener)` / `plugin.unRegister(listener)` для динамических слушателей во время выполнения.

::: warning `PluginLifecycleListener` — исключение — без `@EventListener`
В отличие от любой другой строки таблицы, `PluginLifecycleListener` **не** расширяет маркер `EventListener` и **не** обнаруживается через `@EventListener` (аннотирование его так никогда не срабатывает и сломало бы внутреннее приведение хоста `as EventListener`). Регистрируйте его явно через `applicationContext.getBean(PluginManager::class.java).addLifecycleListener(listener)`.
:::

::: tip Межаддонные события
Определите под-интерфейс `PluginEventListener`, поделитесь бином вашего плагина через `registerSingletonGlobal(this)` и порождайте события подписчикам через `PluginEventManager.getEventListeners<YourListener>()` — функцию **объекта-компаньона (companion object)**, поэтому вызывайте её с указанием класса (`PluginEventManager.…`), а не на внедрённом экземпляре `pluginEventManager`.
:::

## 7. Права доступа и аутентификация

*Источник: `com.panomc.platform.auth` (`Permission`, `PanelPermission`, `AuthProvider`)*

| Тип | Сигнатура | Узел, который он производит |
|---|---|---|
| `Permission` | `open class Permission(iconName: String)` | `pano.<key>` |
| `PanelPermission` | `open class PanelPermission(iconName: String)` | `pano.plugin.<pluginId>.<dotted.key>` |
| `@PermissionDefinition` | аннотация класса | Автоматически регистрирует право доступа |

Узел выводится из имени класса: отбросьте завершающее `Permission`, разбейте на слова, приведите к нижнему регистру, соедините точками и (для плагинового `PanelPermission`) добавьте префикс `pano.plugin.<pluginId>.` — так `ManageShoutboxPermission` → `pano.plugin.pano-plugin-shoutbox.manage.shoutbox`. Ровно та же строка дословно повторяется в вашем коде фронтенда, чтобы ставить заслон на страницы панели и ссылки навигации.

**`AuthProvider`** (хост-бин через `getBean`):

| Метод | Сигнатура | Назначение |
|---|---|---|
| `requirePermission` | `suspend fun requirePermission(permission: Permission, context: RoutingContext)` | Бросает исключение, если у пользователя его нет |
| `hasPermission` | `suspend fun hasPermission(permission: Permission, context: RoutingContext): Boolean` | Проверка без выброса исключения |
| `isLoggedIn` | `suspend fun isLoggedIn(context: RoutingContext): Boolean` | — |
| `hasAccessPanel` | `suspend fun hasAccessPanel(context: RoutingContext): Boolean` | Хоть какой-то доступ к панели |
| `getUserIdFromRoutingContext` | `fun getUserIdFromRoutingContext(context: RoutingContext): Long` | id текущего пользователя |
| `requirePassword` | `suspend fun requirePassword(password: String?, context: RoutingContext)` | Повторная аутентификация (бросает, если неверно) |
| `isUserAdmin` | `suspend fun isUserAdmin(userId: Long): Boolean` | — |

## 8. Связь с сервером Minecraft

Общайтесь с внутриигровым плагином по зашифрованному WebSocket-каналу. Регистрируйте обработчики и отправляйте сообщения через `ServerManager` (см. `pano-plugin-premium-login`).

*Источник: `com.panomc.platform.server` (`ServerManager`, `ServerEvent`, `PlatformMessage`)*

| Член | Сигнатура | Назначение |
|---|---|---|
| `ServerManager.registerEvent` | `fun registerEvent(event: ServerEvent<*, *>)` | Обрабатывать тип входящего события |
| `ServerManager.unregisterEvent` | `fun unregisterEvent(event: ServerEvent<*, *>)` | Прекратить его обработку |
| `ServerManager.sendMessage` | `fun sendMessage(message: PlatformMessage, server: Server)` | Отправить одному серверу без ожидания ответа |
| `ServerManager.getConnectedServers` | `fun getConnectedServers(): Map<…>` | Сейчас подключённые серверы |
| `ServerManager.isConnected` | `fun isConnected(id: Long): Boolean` | — |
| `ServerEvent<R, M>` | `abstract suspend fun handle(request: R, server: Server): M?` | Обработчик входящих событий |
| `PlatformMessage` | `interface` | Форма исходящего сообщения |

**Имена в протоколе (wire names)** выводятся из имени класса: `ServerEvent` отбрасывает суффикс `Event`, `PlatformMessage` отбрасывает `Message`, затем оба преобразуются в `UPPER_SNAKE` (`getEventName()` / `getResponseName()`). Так `PlayerJoinEvent` ⇄ имя в протоколе `PLAYER_JOIN`.

## 9. Токены

Выпускайте и проверяйте подписанные токены (magic-login-ссылки, одноразовые действия). Зарегистрируйте свой тип, чтобы хост очистил его при выгрузке (см. `pano-plugin-auth-guard` `MagicLoginTokenType`).

*Источник: `com.panomc.platform.token` (`TokenType`, `TokenTypeRegistry`, `TokenProvider`)*

| Член | Сигнатура | Назначение |
|---|---|---|
| `TokenType` | `interface` — `getName(): String`, `getExpireDate(): Long` (срок как epoch-миллисекунды) | Ваш тип токена (имя по умолчанию из имени класса минус `TokenType`, `UPPER_SNAKE`) |
| `TokenTypeRegistry.registerPluginToken` | `fun registerPluginToken(pluginId: String, tokenType: TokenType)` | Зарегистрировать (автоматически удаляется при выгрузке) |
| `TokenProvider.generateToken` | `fun generateToken(subject: String, tokenType: TokenType): Pair<String, Long>` | Новый токен + срок действия |
| `TokenProvider.saveToken` | `suspend fun saveToken(…)` | Сохранить его |
| `TokenProvider.isTokenValid` | `suspend fun isTokenValid(token, tokenType, sqlClient): Boolean` | — |
| `TokenProvider.invalidateToken` | `suspend fun invalidateToken(token, sqlClient)` | Отозвать один |
| `TokenProvider.invalidateTokensBySubjectAndType` | `suspend fun (…)` | Отозвать токены субъекта определённого типа |
| `TokenProvider.parseToken` | `fun parseToken(token: String): DecodedJWT` | Декодировать claims |

## 10. Уведомления и почта

*Источник: `com.panomc.platform.notification` (`NotificationManager`, `UserNotificationType`, `PanelUserNotificationType`), `com.panomc.platform.mail` (`MailManager`, `Mail`)*

**Уведомления** — унаследуйтесь от `UserNotificationType` или `PanelUserNotificationType`, аннотируйте `@NotificationDefinition`, затем отправляйте через `NotificationManager`:

| Метод | Кому отправляет |
|---|---|
| `sendNotification(…)` | Одному пользователю |
| `sendPanelNotification(…)` | В панель одного пользователя |
| `sendNotificationToAll(…)` | Каждому пользователю |
| `sendPanelNotificationToAll(…)` | В панель каждого пользователя |
| `sendNotificationToAllAdmins(…)` | Всем администраторам |
| `sendNotificationToAllWithPermission(…)` | Всем, у кого есть право доступа |

**Почта** — реализуйте `Mail`, отправляйте через `MailManager` (см. `pano-plugin-auth-guard` `MagicLoginMail`):

| Член | Сигнатура | Назначение |
|---|---|---|
| `MailManager.sendMail` | `suspend fun sendMail(sqlClient, userId: Long?, mail: Mail, email: String? = null)` | Отрисовать + отправить |
| `Mail.templatePath` | `val templatePath: String` | Путь к шаблону Handlebars |
| `Mail.subject` | `val subject: String` | Строка темы |
| `Mail.generateParameters` | `suspend fun generateParameters(systemParameters, i18nManager, locale): MailParameters` | Переменные шаблона |

## 11. Консольные команды

Аннотируйте методы `@Command`, затем зарегистрируйте держащий их объект.

*Источник: `com.panomc.platform.command` (`Command`, `CommandSender`)*

| Член | Сигнатура | Назначение |
|---|---|---|
| `@Command` | `@Command(name, aliases = [], description = "", usage = "")` | Помечает метод команды |
| форма метода | `(sender: CommandSender)` или `(sender: CommandSender, args: Array<String>)` | Обработчик |
| `PanoPlugin.registerCommands` | `fun registerCommands(obj: Any)` | Зарегистрировать все методы `@Command` на `obj` |
| `PanoPlugin.unRegisterCommands` | `fun unRegisterCommands(obj: Any)` | Удалить их |
| `CommandSender.sendMessage` | `fun sendMessage(message: String)` | Ответить вызывающему |

## 12. Журналы активности

Записывайте действия администраторов, чтобы они появлялись в ленте активности панели. Унаследуйтесь от `PluginActivityLog` и вставляйте через хост-`DatabaseManager`.

*Источник: `com.panomc.platform.db.model.PluginActivityLog`*

| Член | Сигнатура | Назначение |
|---|---|---|
| `PluginActivityLog` | `open class PluginActivityLog(userId: Long, pluginId: String, details: JsonObject = JsonObject())` | Ваша запись журнала |
| вставка | `databaseManager.panelActivityLogDao.add(log, sqlClient)` | Записать её |

Панель отрисовывает каждую запись с ключом локали, выведенным из имени класса (минус `Log`, `UPPER_SNAKE`) под объектом `activity-logs` — `CreatedShoutLog` → `activity-logs.CREATED_SHOUT`, заполняется из полезной нагрузки `details`. См. [Локализацию](/ru/addon/localization/).

## 13. Хост-бины

Собственные сервисы Pano — это управляемые Spring бины в хост-`applicationContext`, получаемые через `applicationContext.getBean(<Class>::class.java)` — их нельзя внедрить в ваши конструкторы. Большинство из перечисленных ниже (`DatabaseManager`, `PluginDatabaseManager`, `SetupManager`, `AuthProvider`, `ServerManager`, `TokenProvider`, `NotificationManager`, `MailManager`, `LicenseManager`, `ConfigManager`, `PluginManager`) — это классы `@Component`, а `TokenTypeRegistry` — `@Service`, обнаруживаемые через `@ComponentScan("com.panomc.platform")`; только инфраструктурные бины (`Vertx`, `Router`, `WebClient`, `Gson`, `SchemaRepository`, плюс логгер, движок шаблонов, `HttpClient`, `PluginUiManager` и `PluginEventManager`) объявлены через `@Bean` в `com.panomc.platform.SpringConfig`.

| Бин | Для чего использовать |
|---|---|
| `DatabaseManager` | Общий SQL-клиент, ядровые DAO, `panelActivityLogDao` |
| `PluginDatabaseManager` | Ваши таблицы и миграции |
| `SetupManager` | `isSetupDone()` — заслон на работу с БД |
| `AuthProvider` | Проверки прав доступа и входа |
| `ServerManager` | Связь с сервером Minecraft |
| `TokenProvider` / `TokenTypeRegistry` | Токены |
| `NotificationManager` | Уведомления |
| `MailManager` | Электронная почта |
| `LicenseManager` | Получение премиум-лицензии |
| `ConfigManager` | Конфигурация хоста (платформы) |
| `Vertx` | Таймеры, шина событий |
| `WebClient` | Исходящий HTTP |
| `Gson` | JSON (общий экземпляр) |
| `Router` | Веб-роутер Vert.x |
| `SchemaRepository` | Схемы валидации |
| `PluginManager` | Реестр плагинов |

## 14. Лицензия (премиум-аддоны)

Премиум-аддоны проверяют подписанную лицензию по публичному ключу, вшитому во время сборки. Хост занимается только транспортом; проверка — это граница вашего аддона. Это краткая сводка — полная обвязка, копируемые `PluginLicenseClient`/`LicenseGuard` и поведение при сбое описаны в [Премиум-аддонах и лицензировании](/ru/addon/premium/).

*Источник: `com.panomc.platform.license` (`LicenseManager`, `SignedLicense`, `LicenseClaims`, `LicenseRequiredException`)*

| Член | Сигнатура | Назначение |
|---|---|---|
| `PanoPlugin.getLicenseManager` | `(): LicenseManager` | Хост-сервис, получающий JWT |
| `LicenseManager.requireLicense` | `(plugin, resourceId, version)` | Получить (кешированную) лицензию для вашего аддона |
| `SignedLicense.verifySignature` | `(publicKey, expectedIssuer)` | Проверка RS256 по *вашему* встроенному ключу |
| `LicenseClaims` | `issuer, platformId, resourceId, userId, version, jarSha256, issuedAtMs, expiresAtMs, keyId, tokenId` | Разобранные claims для перекрёстной проверки |
| `LicenseRequiredException` | `(pluginId, reason, message, cause)` | Бросайте из `onStart()`, чтобы завершиться с отказом (fail closed) |

## 15. Разное и паттерны

Небольшие утилиты и два повторяющихся идиома, которые не являются отдельными API, но которые стоит назвать.

| Сущность | Где | Назначение |
|---|---|---|
| Чтение ресурса jar | загрузчик классов | `javaClass.classLoader.getResourceAsStream(path)` — у `PanoPlugin` нет `getResource`; см. `pano-plugin-auth-guard` `MagicLoginMail` |
| `pluginDataFolder` | `PanoPlugin` | Ваш каталог `plugins/<pluginId>/` (загрузки, `config.conf`) |
| `logger` | `PanoPlugin` | Логгер SLF4J, привязанный к классу |

**Фоновые задачи** — планируйте через Vert.x и защищайтесь от наложения с помощью `AtomicBoolean`; отменяйте в `onStop()`/`onDisable()` (см. `pano-plugin-market` `MarketPlugin`):

```kotlin
private var timerId: Long? = null
private val running = AtomicBoolean(false)

override suspend fun onStart() {
    timerId = vertx.setPeriodic(60_000) {
        if (!running.compareAndSet(false, true)) return@setPeriodic
        // …launch work, then running.set(false) in a finally…
    }
}

override suspend fun onDisable() {
    timerId?.let { vertx.cancelTimer(it) }
    timerId = null
}
```

**Маскирование секретов** — конфигурационный эндпоинт `GET` должен возвращать секретные поля замаскированными; раскрывайте настоящее значение только через отдельный эндпоинт, защищённый повторной проверкой пароля — либо `authProvider.requirePassword(password, context)` (см. `pano-plugin-auth-guard` `TwoFactorDisableAPI`), либо ручной проверкой `databaseManager.userDao.isLoginCorrect(...)` (паттерн маскирования в `pano-plugin-social-login` `PanelRevealSecretAPI`).

## Что дальше

- **[Разработка бэкенда](/ru/addon/backend/)** — проработанный туториал Shoutbox, который собирает эти API в компилирующийся код.
- **[Локализация](/ru/addon/localization/)** — ключи локали для прав доступа и журналов активности.
- **[Премиум-аддоны и лицензирование](/ru/addon/premium/)** — полная обвязка проверки лицензии для группы 14.
- **[Справочник API фронтенда](/ru/addon/api-reference/)** — поверхность `pano.*` и `@panomc/sdk` для UI-половины.
