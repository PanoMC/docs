# Справочник Backend API

**Что даёт вам эта страница:** каждый бэкенд-класс, функцию и аннотацию, которые может использовать ваш аддон, отсортированные по тому, что вы пытаетесь сделать. Это справочник-компаньон к руководству [Разработка бэкенда](/ru/addon/backend/) — руководство показывает, *как* связать куски вместе на примере Shoutbox; эта страница перечисляет, *что существует*, чтобы вам никогда не приходилось читать исходники платформы ради поиска точки расширения по имени. (*Точка расширения* = место, где Pano позволяет вашему коду подключиться: хук, аннотация или базовый класс, который вы расширяете.)

Каждая запись даёт своё имя, назначение в одну строку и минимальную сигнатуру (имя функции, её параметры и то, что она возвращает). Обращайтесь к руководству за проработанным, компилирующимся кодом; обращайтесь к этой странице, чтобы ответить на вопрос «существует ли API для этого и как он называется?».

::: warning Новичок в аддонах Pano? Сначала прочитайте руководство
Это **справочник**, а не отправная точка — он предполагает, что вы уже собрали аддон. Если вы попали на эту страницу из поиска и ничего из неё не имеет смысла, сначала пройдите руководство [Разработка бэкенда](/ru/addon/backend/). До него эта страница будет иметь очень мало смысла.
:::

### Какой раздел мне нужен?

- Добавить HTTP-эндпоинт (URL, на который отвечает ваш аддон) → **§3**
- Хранить данные в базе данных → **§4**
- Читать или писать собственный файл конфигурации → **§5**
- Реагировать на входы, установку, маршрутизацию или удаление учётной записи → **§6**
- Ограничить страницу панели для определённых администраторов (права доступа) → **§7**
- Общаться с плагином сервера Minecraft → **§8**
- Выпускать волшебные ссылки-входы или одноразовые токены → **§9**
- Отправить уведомление или письмо → **§10**
- Добавить консольную команду → **§11**
- Записать административное действие в ленту Активности → **§12**
- Достать один из собственных сервисов Pano (базу данных, авторизацию, …) → **§13**
- Проверить премиум-лицензию → **§14**
- Прочитать файл, упакованный в ваш jar, или запустить фоновую задачу → **§15**

::: tip Словарь за 60 секунд
Эти слова появляются по всей странице. Пробегитесь по ним один раз.

- **host (хост)** — работающий сервер Pano, который загружает jar вашего аддона. Когда строка говорит «хост делает X», это значит сам Pano, а не ваш код.
- **bean** — объект, который фреймворк создаёт один раз и разделяет между всеми. Вы *просите* bean, а не конструируете его.
- **context (контекст)** — коробка, в которой живут эти bean-ы. Вы получаете три: `pluginBeanContext` (ваш), `pluginGlobalBeanContext` (общий между аддонами) и `applicationContext` (собственный Pano — где живут его сервисы).
- **annotation (аннотация)** — метка вроде `@Endpoint`, которую вы пишете над классом. Pano сканирует ваш jar и подключает всё, что её несёт.
- **DAO** — Data Access Object: один небольшой класс, который держит весь SQL для одной таблицы базы данных.
- **migration (миграция)** — одноразовый шаг обновления, который преобразует существующую у пользователя таблицу или конфигурацию из версии N в N+1, когда он обновляет ваш аддон.
- **suspend** — функция, которая может приостановиться и подождать, не блокируя поток (см. врезку ниже).
- **Future / `coAwait()`** — результат Vert.x, который ещё не готов; внутри `suspend`-функции вы добавляете `.coAwait()`, чтобы дождаться его.
- **JWT / token** — подписанная строка: любой может прочитать, что внутри, но произвести её мог только сервер, поэтому её нельзя подделать.
- **permission node (узел права доступа)** — строка с точками вроде `pano.plugin.x.manage`, именующая одно право доступа; администраторы выдают узлы группам пользователей.
- **HOCON** — дружественный к человеку вариант JSON, допускающий комментарии; формат `config.conf`.
- **PF4J** — библиотека загрузки плагинов, которую Pano использует внутри; вы никогда не вызываете её напрямую.
:::

::: tip О `suspend`
`suspend` помечает функцию, которая может приостановиться и подождать — запрос к базе данных, HTTP-вызов — не блокируя поток. Единственное правило: **вы можете вызвать `suspend`-функцию только из другой `suspend`-функции.** Вам редко приходится об этом думать, потому что большинство точек входа, которые Pano вам даёт, уже `suspend`: все хуки жизненного цикла (`onStart()`, …) и каждый `handle()` эндпоинта. Вызывайте другие `suspend`-функции свободно внутри них. (Несколько точек входа — исключение и являются обычными, не-`suspend` функциями — методы `RouterEventListener` (§6) и обработчики `@Command` (§11); внутри них вы не можете вызывать `suspend`-функции напрямую.) Если вы вызовете такую из обычной (не-`suspend`) функции, вы получите ошибку компилятора вроде *«suspend function should be called only from a coroutine or another suspend function»*.
:::

::: tip Как читать эту страницу
У каждой группы ниже есть **таблица** (имя API, назначение в одну строку и его сигнатура) и строка `Source:` — файл, где он определён (пакет `com.panomc.platform`, под `Pano/src/main/kotlin/` в репозитории `pano-web-platform`), чтобы вы всегда могли открыть настоящий код. Всё здесь переписано прямо из этих исходников. Следите за словом `suspend` в сигнатурах — см. врезку прямо выше.
:::

::: tip Аддоны — это плагины в коде
Как и везде в этой документации: в тексте говорится **аддон**, но в коде используется `plugin` — `PanoPlugin`, `pluginId`, `PluginConfig`. Метаданные аддона (id, имя, главный класс, зависимости) не задаются в коде; они живут в манифесте jar (*манифест jar* = небольшой текстовый файл метаданных, упакованный внутрь вашего собранного `.jar`; Gradle пишет его за вас из `gradle.properties`) — см. [Конфигурация манифеста](/ru/addon/manifest/).
:::

::: tip Примеры плагинов, упоминаемые на этой странице
Несколько строк указывают на настоящие, работающие плагины в качестве примеров — `pano-plugin-slider`, `pano-plugin-auth-guard`, `pano-plugin-market`, `pano-plugin-social-login`, `pano-plugin-premium-login`. Это встроенные плагины, поставляемые с Pano; их исходники живут в репозитории `pano-web-platform` под `plugins/pano-plugin-*`. Когда строка говорит «см. `pano-plugin-slider` `PanelAddSliderItemAPI`», откройте исходники этого плагина, чтобы прочитать полный пример.
:::

## 1. Класс-точка входа и жизненный цикл — `PanoPlugin`

У каждого аддона есть ровно один класс, расширяющий `PanoPlugin`. Он — три вещи сразу: ваша точка входа (первый класс, который Pano загружает), место, где Pano передаёт вам готовые объекты — ваш логгер, вашу папку данных, экземпляр Vert.x — как свойства, которые вы никогда не конструируете сами, и владелец хуков жизненного цикла (функций, которые Pano вызывает в фиксированные моменты).

*Source: `com.panomc.platform.api.PanoPlugin`*

### Внедряемые свойства

Pano заполняет их за вас до того, как выполнится `onCreate()`; читайте их откуда угодно в классе и никогда не присваивайте сами. (Помните: *хост* = работающий сервер Pano, который загружает jar вашего аддона.)

Три строки ниже — это Spring-**контексты** — коробки для bean-ов. **bean** — это объект, который фреймворк создаёт один раз и разделяет; **контекст** — коробка, в которой живут эти bean-ы. Вы получаете три коробки: `pluginBeanContext` (ваша), `pluginGlobalBeanContext` (общая между аддонами) и `applicationContext` (собственная Pano — где живут его сервисы).

| Свойство | Тип | Что это |
|---|---|---|
| `pluginId` | `String` | id вашего аддона (из манифеста) |
| `vertx` | `Vertx` | Экземпляр Vert.x — таймеры, шина событий, `WebClient` |
| `pluginBeanContext` | `AnnotationConfigApplicationContext` | Контекст Spring, держащий *ваши* bean-ы |
| `pluginGlobalBeanContext` | `AnnotationConfigApplicationContext` | Общий контекст для межаддонных bean-ов |
| `applicationContext` | `AnnotationConfigApplicationContext` | Контекст хоста — извлекайте сервисы Pano через `getBean(...)` |
| `pluginEventManager` | `PluginEventManager` | Запуск/приём межаддонных событий |
| `pluginUiManager` | `PluginUiManager` | Реестр UI-бандлов (управляется за вас) |
| `environmentType` | `Main.Companion.EnvironmentType` | `DEVELOPMENT` / `RELEASE` |
| `releaseStage` | `ReleaseStage` | канал alpha / beta / stable |
| `pluginState` | `PluginState` | Состояние загрузки PF4J (PF4J = внутренний загрузчик плагинов Pano; вы никогда его не вызываете) |
| `pluginDataFolder` | `File` | Каталог данных `plugins/<pluginId>/` (создаётся автоматически) |
| `logger` | `Logger` | Логгер SLF4J, привязанный к вашему классу |

### Хуки жизненного цикла

Все они — `open suspend fun` с телом по умолчанию, ничего не делающим (`open` = вы можете его переопределить; *no-op* = ничего не делает, пока вы не переопределите; `suspend` = см. врезку в начале). Переопределяйте только то, что нужно. Они выполняются в этом порядке:

```
jar load → onCreate() → onEnable() → onStart()
        …running…
onStop() → onDisable() → onUninstall()
```

`verifyLicense()` **не** является частью этой последовательности — он выполняется по требованию, когда администратор сайта нажимает *Обновить лицензию* в панели (только премиум-аддоны).

| Хук | Выполняется, когда |
|---|---|
| `onCreate()` | Объект плагина сконструирован — первый выполняемый хук (ваши внедряемые свойства к этому моменту уже установлены) |
| `onEnable()` | Аддон включён — при загрузке сервера или когда администратор нажимает *Включить* в панели |
| `onStart()` | Аддон стартует — поместите код настройки сюда. Сначала проверьте `setupManager.isSetupDone()` и заранее выйдите, если он `false` (см. §13), чтобы вы никогда не трогали базу данных до того, как сайт установлен |
| `onStop()` | Аддон останавливается — отмените таймеры/задачи здесь |
| `onDisable()` | Аддон отключён, его данные сохранены — при выключении сервера или когда администратор нажимает *Отключить* |
| `onUninstall()` | Аддон **удалён** (администратор нажимает *Удалить*) — удалите свои таблицы здесь |
| `verifyLicense()` | Кнопка «Обновить лицензию» в панели (премиум-аддоны) |

### Методы

| Метод | Сигнатура | Назначение |
|---|---|---|
| `registerSingletonGlobal` | `(bean: Any)` | Поделиться bean-ом с другими аддонами |
| `unRegisterGlobal` | `(bean: Any)` | Удалить общий bean |
| `register` | `(listener: PluginEventListener)` | Зарегистрировать динамический слушатель событий |
| `unRegister` | `(listener: PluginEventListener)` | Удалить динамический слушатель событий |
| `registerCommands` | `(obj: Any)` | Зарегистрировать методы `@Command` на объекте (`@Command` = аннотация, добавляющая консольную команду — см. §11) |
| `unRegisterCommands` | `(obj: Any)` | Удалить их |
| `getLicenseManager` | `(): LicenseManager` | Сервис лицензий хоста (премиум) |
| `getLicenseJwtIssuer` | `(): String` | Ожидаемый `iss` для лицензионных JWT |
| `getOwnJarSha256` | `(): String?` | SHA-256 загруженного jar, или null |

::: warning Собственные сервисы Pano — не параметры конструктора
Когда Pano создаёт *ваши* классы, он может передать ваши собственные DAO и bean-ы как параметры конструктора (это называется *внедрением через конструктор*). Но вы **не можете** так попросить собственные сервисы Pano (`DatabaseManager`, `AuthProvider`, `SetupManager`, …) — они живут в `applicationContext`, а не в вашем контексте. Вместо этого извлекайте их вручную:

```kotlin
// `by lazy` delays the lookup until first use, after the host has finished wiring everything up
private val authProvider by lazy { applicationContext.getBean(AuthProvider::class.java) }
```
:::

## 2. Аннотации, которые авторегистрируют ваши классы

**Аннотация** — это метка (вроде `@Endpoint`), которую вы пишете над классом. Когда ваш аддон загружается, Pano сканирует ваш jar и автоматически подключает любой класс, несущий одну из этих меток, — вызова ручной регистрации нет. Сканирование укоренено в пакете вашего главного класса плагина, поэтому ваши аннотированные классы должны жить в этом пакете или его подпакете (класс в несвязанном пакете молча никогда не регистрируется). Все эти аннотации живут в `com.panomc.platform.annotation`, **кроме** `@EventListener`.

*Source: `com.panomc.platform.annotation.*`, `com.panomc.platform.api.annotation.EventListener`*

| Аннотация | Ставьте на | Назначение |
|---|---|---|
| `@Endpoint` | подкласс `Api` | Зарегистрировать HTTP-маршрут |
| `@Dao` | impl DAO (в паре с `@Lazy @Scope(SCOPE_SINGLETON)`) | Зарегистрировать singleton DAO |
| `@Migration` | `DatabaseMigration` или `PluginConfigMigration` | Зарегистрировать миграцию |
| `@EventListener` | класс слушателя событий | Зарегистрировать слушатель |
| `@PermissionDefinition` | подкласс `Permission` | Зарегистрировать право доступа |
| `@NotificationDefinition` | тип уведомления | Зарегистрировать тип уведомления |
| `@Event` | обработчик WebSocket сервера Minecraft (используется самой платформой) | Вы увидите это в исходниках платформы, но аддоны не могут его использовать — используйте вместо этого `ServerManager.registerEvent` (§8) |
| `@Ignore` | поле сущности | Исключить поле из сопоставления столбцам |

**DAO** (Data Access Object) — это класс, который держит SQL для одной таблицы. Его реализации `@Dao` нужны все три аннотации, сложенные стопкой, плюс два импорта Spring. Вот весь заголовок класса для примера Shoutbox (`ShoutDao` — ваш абстрактный DAO, `ShoutDaoImpl` — тот, что с SQL):

```kotlin
import com.panomc.platform.annotation.Dao
import org.springframework.beans.factory.config.ConfigurableBeanFactory
import org.springframework.context.annotation.Lazy
import org.springframework.context.annotation.Scope

@Dao
@Lazy
@Scope(value = ConfigurableBeanFactory.SCOPE_SINGLETON)
class ShoutDaoImpl : ShoutDao()
```

(**миграция** = одноразовый шаг обновления, который преобразует существующую у пользователя таблицу или конфигурацию из версии N в N+1, когда он обновляет ваш аддон; см. §4 и §5.)

::: warning Используйте `@EventListener` от Pano, а не от Spring
Аннотация — это `com.panomc.platform.api.annotation.EventListener` — а **не** `org.springframework.context.event.EventListener`. У них одинаковое короткое имя, но они приходят из разных импортов; импортируйте не тот — и система событий молча никогда не вызовет ваш слушатель. Проверьте, что ваша строка импорта читается ровно как `import com.panomc.platform.api.annotation.EventListener`.
:::

## 3. HTTP-эндпоинты и маршрутизация

**Эндпоинт** = один URL, на который отвечает ваш аддон, например `GET /api/shouts`. Вы делаете его, написав класс с аннотацией `@Endpoint`, который расширяет один из базовых классов API ниже; Pano передаёт ваши DAO и bean-ы в его конструктор за вас (внедрение через конструктор).

Наименьший эндпоинт, который компилируется, — это класс, пути, на которые он отвечает, и `handle`, возвращающий результат:

```kotlin
// imports: com.panomc.platform.model.* (Api, Path, RouteType, Result, Successful), com.panomc.platform.annotation.Endpoint
@Endpoint
class GetShoutsAPI : Api() {
    override val paths = listOf(Path("/api/shouts", RouteType.GET))

    override suspend fun handle(context: RoutingContext): Result {
        return Successful(mapOf("shouts" to listOf<String>()))
    }
}
```

*Source: `com.panomc.platform.model` (`Route`, `Path`, `RouteType`, `Api`, `LoggedInApi`, `PanelApi`, `SetupApi`, `Template`, `Result`, `Error`)*

### Примитивы маршрутов

| Тип | Сигнатура | Назначение |
|---|---|---|
| `Path` | `Path(url: String, routeType: RouteType)` | Один URL + метод, на который отвечает эндпоинт |
| `RouteType` | `ROUTE`, `GET`, `POST`, `PUT`, `DELETE` | HTTP-метод — `ROUTE` совпадает с *любым* методом, используется для маршрутов `Template` (HTML) |
| `Route.paths` | `val paths: List<Path>` | Пути, которые обрабатывает этот маршрут (обязательно) |
| `Route.order` | `open val order = 1` | Если два маршрута могут совпасть с одним URL, первым пробуется тот, у кого `order` меньше |
| `Route.getValidationHandler` | `(schemaRepository): ValidationHandler?` | Валидация тела/запроса |
| `Route.corsHandler` | `open fun corsHandler(): Handler?` | Переопределить CORS (по умолчанию предоставлен) |
| `Route.bodyHandler` | `open fun bodyHandler(): Handler?` | Переопределить разбор тела (см. загрузки) |

### Базовые классы — выбирайте по тому, кто может вызывать

| Базовый класс | Кому разрешено | Объявляйте пути как |
|---|---|---|
| `Api` | Любому (публичный) | `/api/...` |
| `LoggedInApi` | Любому вошедшему пользователю | `/api/...` |
| `PanelApi` | Администраторам (расширяет `LoggedInApi`) | `/api/panel/...` |
| `SetupApi` | Только во время первичной установки | `/api/...` |
| `Template` | Серверно-отрисованный HTML-маршрут | — |

Маршруты `SetupApi` существуют только пока работает мастер первичной установки и исчезают, как только сайт настроен, — вам он редко понадобится.

::: tip Пути панели объявляются как `/api/panel/...`
UI панели вызывает URL вроде `/panel/api/...`, но Pano внутри перенаправляет их на `/api/...` — поэтому вы всегда объявляете форму `/api/panel/...`. Конкретно:

- Браузер вызывает: `GET /panel/api/shouts`
- Вы объявляете: `Path("/api/panel/shouts", RouteType.GET)`
:::

### Обработка запроса (члены `Api`)

| Член | Сигнатура | Назначение |
|---|---|---|
| `handle` | `abstract suspend fun handle(context: RoutingContext): Result?` | Тело вашего эндпоинта — верните `Successful(...)` при успехе; чтобы провалить, **бросьте** `Error` (см. ниже), не возвращайте его. (Возврат `null` ничего не отправляет обратно обычным путём — делайте так, только если вы сами написали ответ.) |
| `getSqlClient` | `suspend fun getSqlClient(): SqlClient` | Общий SQL-клиент |
| `getParameters` | `fun getParameters(context): RequestParameters` | Провалидированные параметры тела/запроса/пути |
| `checkSetup` | `fun checkSetup()` | Бросить `InstallationRequired`, если установка не завершена |
| `isAllowedInDemo` | `open fun isAllowedInDemo(method: HttpMethod): Boolean` | Ограничить записи, когда экземпляр работает в демо-режиме |

### Результаты и ошибки

| Штука | Сигнатура | Назначение |
|---|---|---|
| `Successful` | `Successful(map: Map<String, Any?> = emptyMap())` | Успех → `{"result":"ok", …map…}` |
| `Errors` | `Errors(map: Map<String, Any?>)` | Нагрузка ошибок на уровне полей — например, `Errors(mapOf("email" to true))` говорит фронтенду подсветить поле email |
| Подклассы `Error` | `throw NotFound()` / `BadRequest()` / … | ~100 предопределённых в `com.panomc.platform.error` (`NotFound`, `BadRequest`, `NoPermission`, `NotLoggedIn`, `InternalServerError`, …) |
| Своя ошибка | `class MyError : Error(statusCode, …)` | Код ошибки для клиента = имя класса в `UPPER_SNAKE`: `class SlugTaken : Error(...)` → клиент получает `"error": "SLUG_TAKEN"` |

Чтобы провалить запрос, вы **бросаете** `Error` (`com.panomc.platform.model.Error` от Pano, **а не** встроенный `Error` из Kotlin) — вы не возвращаете его. Сбои валидации превращаются в `BadRequest` за вас.

### Загрузка файлов — свой `bodyHandler()`

Переопределите `bodyHandler()`, чтобы принимать multipart-загрузки, и валидируйте через `Bodies.multipartFormData`. В сниппете ниже `FILE_UPLOAD_SIZE` — это константа, которую определяете *вы*, — максимальный размер загрузки в байтах, например `private const val FILE_UPLOAD_SIZE = 5 * 1024 * 1024`. Паттерн (см. `pano-plugin-slider` `PanelAddSliderItemAPI`):

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

Каждой таблице базы данных нужны **три небольших файла** (плюс необязательные миграции):

- `Shout.kt` — сама строка, data-класс, расширяющий `DBEntity`.
- `ShoutDao.kt` — абстрактный класс, который *объявляет* запросы. **Это тип, который вы внедряете** в эндпоинты.
- `ShoutDaoImpl.kt` — класс `@Dao`, который держит фактический SQL.

Разделение позволяет вашим эндпоинтам зависеть от простого типа `ShoutDao`, тогда как Pano поставляет несущий SQL `ShoutDaoImpl` во время выполнения. Руководство [Разработка бэкенда](/ru/addon/backend/) строит один от начала до конца.

*Source: `com.panomc.platform.db` (`Dao`, `DBEntity`, `DatabaseMigration`), `com.panomc.platform.api.PluginDatabaseManager`*

| Тип | Сигнатура | Назначение |
|---|---|---|
| `DBEntity` | `abstract class` (имеет статический `gson`) | Базовый класс для модели строки — пишите `class Shout(...) : DBEntity()`. Внимание: в отличие от `@Dao`, вы его *расширяете*, а не аннотируете им |
| `@Ignore` | аннотация поля | Держать поле модели вне сопоставления столбцам |
| `Dao<T : DBEntity>` | `abstract class Dao<T>(entityClass: Class<T>)` | Базовый DAO |
| `Dao.init` | `abstract suspend fun init(sqlClient: SqlClient)` | `CREATE TABLE IF NOT EXISTS …` здесь |
| `Dao.uninstall` | `open suspend fun uninstall(sqlClient: SqlClient)` | `DROP TABLE …` (необязательно) |
| `Dao.fields` | `open val fields: List<String>` | Имена столбцов для построения запросов |
| `Dao.tableName` | `protected val tableName` | Выводится автоматически из имени класса вашей сущности (`ShoutItem` → `shout_item`); только для чтения — вы его не задаёте |
| `Dao.getTablePrefix` | `fun getTablePrefix(): String` | Префикс таблиц экземпляра |
| `Row.toEntity()` | extension | Одна строка → ваша модель (через Gson). Функция-расширение из `com.panomc.platform.db` — вызывайте `row.toEntity()` на строке результата |
| `RowSet.toEntities()` | extension | Много строк → `List<T>`. Та же идея: вызывайте `rows.toEntities()` на результате запроса |
| `List<String>.toTableQuery()` | extension | Список столбцов в обратных кавычках |
| `DatabaseMigration` | `DatabaseMigration(from: Int, to: Int, info: String)` | Шаг схемы; переопределите `val handlers: List<suspend (SqlClient) -> Unit>` |
| `PluginDatabaseManager.initialize` | `suspend fun initialize(plugin: PanoPlugin)` | Создать таблицы + выполнить ожидающие миграции |
| `PluginDatabaseManager.uninstall` | `suspend fun uninstall(plugin: PanoPlugin)` | Выполнить `uninstall()` каждого DAO |

**Ожидание результатов запроса (`coAwait`).** Каждый вызов базы данных Vert.x возвращает **Future** — результат, который ещё не готов. Внутри `suspend`-функции вы добавляете `.coAwait()`, чтобы дождаться его и получить значение:

```kotlin
// import io.vertx.kotlin.coroutines.coAwait
val rows = sqlClient.query("SELECT * FROM `shout`").execute().coAwait()
```

Сырой SQL против **собственных** таблиц Pano (не вашего аддона) идёт через хостовый `DatabaseManager` — `databaseManager.getSqlClient()`, плюс основные DAO вроде `userDao`.

**Миграция, целиком.** Класс `@Migration` повышает схему на одну версию и перечисляет по одному обработчику на изменение. Каждый обработчик выполняет ваш `ALTER TABLE` (или подобное):

```kotlin
// import com.panomc.platform.annotation.Migration, com.panomc.platform.db.DatabaseMigration
@Migration
class ShoutMigration1to2(
    private val shoutDao: ShoutDao
) : DatabaseMigration(1, 2, "Add color column to shout table") {
    override val handlers: List<suspend (SqlClient) -> Unit> = listOf(
        { sqlClient: SqlClient ->
            val query = "ALTER TABLE `${shoutDao.getTablePrefix() + "shout"}` ADD COLUMN `color` VARCHAR(7) NOT NULL DEFAULT '#000000'"
            sqlClient.query(query).execute().coAwait()
        }
    )
}
```

::: warning `onUninstall` удаляет ваши таблицы
`pluginDatabaseManager.uninstall(this)` выполняет **`uninstall()` каждого DAO** — это действие панели **Удалить**, а не **Отключить**. Отключение сохраняет данные.
:::

Полный, компилирующийся запрос — настоящий `SELECT` и `INSERT`, написанные внутри DAO, — см. в разделе руководства [Таблица базы данных](/ru/addon/backend/#_3-таблица-базы-данных).

## 5. Конфигурация

Класс конфигурации, расширяющий `PluginConfig`, записывается в `plugins/<pluginId>/config.conf` (HOCON — дружественный к человеку вариант JSON, допускающий комментарии) при первом запуске вашего аддона и читается обратно как обычный объект Kotlin — вы пишете `config.apiKey`, а не строковые поиски.

*Source: `com.panomc.platform.api.config` (`PluginConfig`, `PluginConfigManager`, `PluginConfigMigration`, `ConfigComment`, `ConfigSection`)*

| Тип | Сигнатура | Назначение |
|---|---|---|
| `PluginConfig` | `open class PluginConfig` (имеет `version: Int`) | База для вашей конфигурации; добавьте свои поля со значениями по умолчанию |
| `PluginConfigManager<T>` | `PluginConfigManager(plugin, T::class.java)` | Загружает/сохраняет файл для одного класса конфигурации |
| `.config` | `val config: T` | Текущие типизированные значения |
| `.saveConfig` | `fun saveConfig(config: JsonObject)` | Сохранить изменения на диск |
| `.configFilePath` | `val configFilePath: String` | Разрешённый путь `config.conf` |
| `PluginConfigMigration` | `PluginConfigMigration(from: Int, to: Int, versionInfo: String)` | Переопределите `fun migrate(config: JsonObject)`; аннотируйте `@Migration` |
| `@ConfigComment` | `@ConfigComment(vararg lines: String)` | Doc-комментарий над полем в сгенерированном файле |
| `@ConfigSection` | `@ConfigSection(title: String)` | Сгруппировать ключи под баннером |

Почему `.config` — типизированный `T`, но `.saveConfig` принимает `JsonObject`? Чтение даёт вам ваш собственный типизированный класс; сохранение принимает сырой `JsonObject`, чтобы вы могли изменить только нужные вам ключи. Сохранение выглядит так:

```kotlin
configManager.saveConfig(JsonObject().put("apiKey", "new-value"))
```

Зарегистрируйте менеджер как **singleton** (один общий экземпляр) в своём `pluginBeanContext` во время `onStart()`, затем извлекайте его лениво, когда он понадобится запросу. Две строки:

```kotlin
val configManager = PluginConfigManager(this, ShoutboxConfig::class.java)
pluginBeanContext.beanFactory.registerSingleton(PluginConfigManager::class.java.name, configManager)
```

::: tip Контрольная точка
После первого старта `plugins/<pluginId>/config.conf` должен существовать на диске, содержа ваши значения по умолчанию.
:::

## 6. Слушатели событий

Большинство слушателей событий работают одинаково. (1) Реализуйте интерфейс. (2) Аннотируйте класс `@EventListener`. (3) Pano вызывает ваши методы, когда событие срабатывает. Методы — `suspend` и по умолчанию ничего не делают, поэтому вы переопределяете только те, что вам важны. Два слушателя ломают этот паттерн — см. выноски под таблицей.

*Source: `com.panomc.platform.api.event.*`*

| Интерфейс | Методы (относящиеся к плагину) |
|---|---|
| `SetupEventListener` | `onSetupFinished()` |
| `RouterEventListener` | `onInitRouteList(routes: MutableList<Route>)`, `onRouterCreate(router: Router)` |
| `AuthEventListener` | `onBeforeAuthenticate(context, sqlClient): LoginDecision?`, `onBeforeVerifyLinkCode(context, sqlClient): LoginDecision?`, `onBeforeLogin(user, context, sqlClient): LoginDecision?`, `onAfterLogin(user, context, sqlClient)`, `onAfterRegister(user, sqlClient)` |
| `PlayerEventListener` | `onDelete(user: User)` — очистка при удалении учётной записи |
| `ProfilePictureEventListener` | `resolveProfilePictureUrl(user: User): String?` |
| `PluginLifecycleListener` | `onPluginLoad/Enable/Disable/Unload/Uninstall(plugin: PanoPlugin)` |
| `PluginEventListener` | Маркер для ваших собственных межаддонных событий |

**Методы `AuthEventListener`** (переполненная строка выше, по одному на строку):

- `onBeforeAuthenticate(context, sqlClient): LoginDecision?`
- `onBeforeVerifyLinkCode(context, sqlClient): LoginDecision?`
- `onBeforeLogin(user, context, sqlClient): LoginDecision?`
- `onAfterLogin(user, context, sqlClient)`
- `onAfterRegister(user, sqlClient)`

`onBeforeLogin` и его собратья возвращают `LoginDecision`: `Deny(errorKey, extras)`, `RequireUsername(userId)` или `Allow`. (`errorKey` = ключ локализации — id переведённого сообщения, показываемого пользователю; см. [Локализация](/ru/addon/localization/).)

Два способа зарегистрировать слушатель: класс `@EventListener` в вашем пакете (**фиксированный** — обнаруживается один раз при загрузке аддона) или `plugin.register(listener)` / `plugin.unRegister(listener)`, чтобы добавлять и удалять слушатели **пока аддон работает**.

::: warning Исключение 1 — `RouterEventListener` не `suspend`
В отличие от остальных, `onInitRouteList` и `onRouterCreate` у `RouterEventListener` — обычные (не-`suspend`) **абстрактные** функции. Вы *обязаны* реализовать обе, и внутри них нельзя напрямую вызывать `suspend`-функции.
:::

::: warning Исключение 2 — у `PluginLifecycleListener` нет `@EventListener`
`PluginLifecycleListener` **не** расширяет маркер `EventListener`, поэтому вы **не должны** аннотировать его `@EventListener`: если так сделать, он никогда не срабатывает *и* ломает внутреннее приведение хоста `as EventListener` — оно бросает `ClassCastException`, пока ваш плагин инициализируется. Вместо этого регистрируйте его явно:

```kotlin
applicationContext.getBean(PluginManager::class.java).addLifecycleListener(listener)
```
:::

::: tip Межаддонные события (продвинутое)
Чтобы позволить *другим* аддонам реагировать на что-то, что делает ваш аддон: определите интерфейс, расширяющий `PluginEventListener`, поделитесь своим плагином, чтобы другие могли его найти, затем запустите событие каждому подписчику. Обратите внимание, что `getEventListeners` — это функция **companion-object** (функция, принадлежащая самому классу, а не экземпляру), поэтому вы вызываете её как `PluginEventManager.getEventListeners<...>()`, а не на внедрённом `pluginEventManager`.

```kotlin
// Your addon (firing side): share yourself, then notify every subscriber
registerSingletonGlobal(this)
PluginEventManager.getEventListeners<ShoutCreatedListener>()
    .forEach { it.onShoutCreated(shout) }

// Another addon (listening side): implement the shared interface + annotate it
@EventListener
class MyShoutListener : ShoutCreatedListener {
    override suspend fun onShoutCreated(shout: Shout) { /* … */ }
}
```
:::

## 7. Права доступа и аутентификация

**Узел права доступа** — это строка с точками (вроде `pano.plugin.x.manage`), именующая одно право доступа. Администраторы выдают узлы группам пользователей в панели; ваш код затем проверяет, держит ли текущий пользователь узел.

*Source: `com.panomc.platform.auth` (`Permission`, `PanelPermission`, `AuthProvider`)*

| Тип | Сигнатура | Узел, который он производит |
|---|---|---|
| `Permission` | `open class Permission(iconName: String)` | `pano.<key>` |
| `PanelPermission` | `open class PanelPermission(iconName: String)` | `pano.plugin.<pluginId>.<dotted.key>` |
| `@PermissionDefinition` | аннотация класса | Авторегистрирует право доступа |

(`iconName` = имя иконки Font Awesome, показываемой рядом с правом доступа в панели, например `"fa-bullhorn"` или `"fa-comments"`.)

Узел выводится автоматически из имени класса. Сначала пример:

`ManageShoutboxPermission` → `pano.plugin.pano-plugin-shoutbox.manage.shoutbox`

Правило: отбросьте завершающее `Permission`, разбейте оставшиеся слова, приведите их к нижнему регистру, соедините точками и (для `PanelPermission` плагина) добавьте префикс `pano.plugin.<pluginId>.`. Вы повторяете эту точную строку в своём фронтенд-коде, чтобы закрыть (показать/скрыть) страницы панели и ссылки навигации — см. [Справочник API фронтенда](/ru/addon/api-reference/).

**`AuthProvider`** (bean хоста через `getBean`):

| Метод | Сигнатура | Назначение |
|---|---|---|
| `requirePermission` | `suspend fun requirePermission(permission: Permission, context: RoutingContext)` | Бросить, если у пользователя его нет |
| `hasPermission` | `suspend fun hasPermission(permission: Permission, context: RoutingContext): Boolean` | Проверка без броска |
| `isLoggedIn` | `suspend fun isLoggedIn(context: RoutingContext): Boolean` | — |
| `hasAccessPanel` | `suspend fun hasAccessPanel(context: RoutingContext): Boolean` | Хоть какой-то доступ к панели |
| `getUserIdFromRoutingContext` | `fun getUserIdFromRoutingContext(context: RoutingContext): Long` | id текущего пользователя |
| `requirePassword` | `suspend fun requirePassword(password: String?, context: RoutingContext)` | Повторная аутентификация (бросает при неверном) |
| `isUserAdmin` | `suspend fun isUserAdmin(userId: Long): Boolean` | — |

## 8. Связь с сервером Minecraft

Если владелец сайта запускает сопутствующий `pano-mc-plugin` на своём сервере Minecraft, этот плагин держит открытым **зашифрованный WebSocket** к Pano (WebSocket = двустороннее, всегда открытое сетевое соединение, в отличие от обычного одноразового HTTP-запроса; Pano шифрует каждое сообщение в нём с помощью AES-256-GCM). `ServerManager` — это ваша ручка на этом соединении: регистрируйте обработчики для входящих сообщений и отправляйте сообщения *наружу* (см. `pano-plugin-premium-login`). Если ни один сервер не подключён, разговаривать не с кем.

*Source: `com.panomc.platform.server` (`ServerManager`, `ServerEvent`, `PlatformMessage`)*

| Член | Сигнатура | Назначение |
|---|---|---|
| `ServerManager.registerEvent` | `fun registerEvent(event: ServerEvent<*, *>)` | Обработать тип входящего события |
| `ServerManager.unregisterEvent` | `fun unregisterEvent(event: ServerEvent<*, *>)` | Прекратить его обрабатывать |
| `ServerManager.sendMessage` | `fun sendMessage(message: PlatformMessage, server: Server)` | Отправить-и-забыть одному серверу |
| `ServerManager.getConnectedServers` | `fun getConnectedServers(): Map<Server, ServerWebSocket>` | Сейчас подключённые серверы (ключ = `Server`, значение = его живой WebSocket) |
| `ServerManager.isConnected` | `fun isConnected(id: Long): Boolean` | — |
| `ServerEvent<R, M>` | `abstract suspend fun handle(request: R, server: Server): M?` | Обработчик входящего события (R = получаемая вами нагрузка запроса, M = тип сообщения, которым вы опционально отвечаете; `M?` означает, что ответ необязателен) |
| `PlatformMessage` | `interface` | Форма исходящего сообщения |

(`ServerEvent<*, *>` в строках выше просто означает «`ServerEvent` любых типов запроса/ответа».)

**Имена на проводе** выводятся из имени класса: `ServerEvent` отбрасывает суффикс `Event`, `PlatformMessage` отбрасывает `Message`, затем оба преобразуются в `UPPER_SNAKE` (`getEventName()` / `getResponseName()`). Так что `PlayerJoinEvent` ⇄ имя на проводе `PLAYER_JOIN`.

## 9. Токены

**Токен** здесь — подписанная строка в формате **JWT**: любой может прочитать, что внутри неё, но произвести её мог только сервер, поэтому её нельзя подделать. Используйте токены для волшебных ссылок-входов и одноразовых действий. Зарегистрируйте *тип* вашего токена у хоста, чтобы он автоматически снимался с регистрации, когда ваш аддон выгружается (см. `pano-plugin-auth-guard` `MagicLoginTokenType`).

*Source: `com.panomc.platform.token` (`TokenType`, `TokenTypeRegistry`, `TokenProvider`)*

| Член | Сигнатура | Назначение |
|---|---|---|
| `TokenType` | `interface` — `getName(): String`, `getExpireDate(): Long` (срок как epoch-миллисекунды) | Ваш тип токена (имя по умолчанию из имени класса минус `TokenType`, `UPPER_SNAKE`) |
| `TokenTypeRegistry.registerPluginToken` | `fun registerPluginToken(pluginId: String, tokenType: TokenType)` | Зарегистрировать (автоудаляется при выгрузке) |
| `TokenProvider.generateToken` | `fun generateToken(subject: String, tokenType: TokenType): Pair<String, Long>` | Возвращает `(tokenString, expiresAtEpochMillis)` — подписанный токен и когда он истекает (epoch-миллисекунды) |
| `TokenProvider.saveToken` | `suspend fun saveToken(token: String, subject: String, tokenType: TokenType, expireDate: Long, sqlClient: SqlClient, ipAddress: String? = null, userAgent: String? = null)` | Сохранить его |
| `TokenProvider.isTokenValid` | `suspend fun isTokenValid(token: String, tokenType: TokenType, sqlClient: SqlClient): Boolean` | — |
| `TokenProvider.invalidateToken` | `suspend fun invalidateToken(token: String, sqlClient: SqlClient)` | Отозвать один |
| `TokenProvider.invalidateTokensBySubjectAndType` | `suspend fun invalidateTokensBySubjectAndType(subject: String, type: TokenType, sqlClient: SqlClient)` | Отозвать токены субъекта одного типа |
| `TokenProvider.parseToken` | `fun parseToken(token: String): DecodedJWT` | Декодировать claims |

## 10. Уведомления и почта

*Source: `com.panomc.platform.notification` (`NotificationManager`, `UserNotificationType`, `PanelUserNotificationType`), `com.panomc.platform.mail` (`MailManager`, `Mail`)*

**Уведомления** появляются под иконкой колокольчика в верхней панели темы и панели. Наследуйте `UserNotificationType` или `PanelUserNotificationType`, аннотируйте `@NotificationDefinition`, затем отправляйте через `NotificationManager`:

| Метод | Отправляет |
|---|---|
| `sendNotification(…)` | Одному пользователю |
| `sendPanelNotification(…)` | В панель одного пользователя |
| `sendNotificationToAll(…)` | Каждому пользователю |
| `sendPanelNotificationToAll(…)` | В панель каждого пользователя |
| `sendNotificationToAllAdmins(…)` | Всем администраторам |
| `sendNotificationToAllWithPermission(…)` | Всем, кто держит право доступа |

Самый частый, целиком: `suspend fun sendNotification(userId: Long, userNotificationType: UserNotificationType, sqlClient: SqlClient)`. Остальные пять следуют той же форме (см. `NotificationManager`, начиная со строки 33 исходника).

**Почта** — реализуйте `Mail`, отправляйте через `MailManager` (см. `pano-plugin-auth-guard` `MagicLoginMail`):

| Член | Сигнатура | Назначение |
|---|---|---|
| `MailManager.sendMail` | `suspend fun sendMail(sqlClient, userId: Long?, mail: Mail, email: String? = null)` | Отрисовать + отправить |
| `Mail.templatePath` | `val templatePath: String` | Путь к вашему шаблону Handlebars (Handlebars = язык HTML-шаблонов с `{{placeholders}}`). Путь указывает внутрь ресурсов вашего jar — см. §15 «Чтение ресурса jar» |
| `Mail.subject` | `val subject: String` | Строка темы письма |
| `Mail.generateParameters` | `suspend fun generateParameters(systemParameters, i18nManager, locale): MailParameters` | Переменные шаблона |

## 11. Консольные команды

У Pano есть интерактивная **консоль** — окно терминала, где выполняется jar платформы. Методы `@Command` позволяют добавлять в неё свои команды. Аннотируйте методы `@Command`, затем зарегистрируйте объект, который их содержит.

*Source: `com.panomc.platform.command` (`Command`, `CommandSender`)*

| Член | Сигнатура | Назначение |
|---|---|---|
| `@Command` | `@Command(name, aliases = [], description = "", usage = "")` | Помечает метод-команду |
| форма метода | `(sender: CommandSender)` или `(sender: CommandSender, args: Array<String>)` | Обработчик |
| `PanoPlugin.registerCommands` | `fun registerCommands(obj: Any)` | Зарегистрировать все методы `@Command` на `obj` |
| `PanoPlugin.unRegisterCommands` | `fun unRegisterCommands(obj: Any)` | Удалить их |
| `CommandSender.sendMessage` | `fun sendMessage(message: String)` | Ответить вызвавшему |

::: tip Контрольная точка
После регистрации наберите `help` в консоли — имя вашей команды и её описание должны быть в списке.
:::

## 12. Журналы активности

Записывайте административные действия, чтобы они появлялись в ленте Активности панели. Наследуйте `PluginActivityLog` и вставляйте через хостовый `DatabaseManager`.

*Source: `com.panomc.platform.db.model.PluginActivityLog`*

| Член | Сигнатура | Назначение |
|---|---|---|
| `PluginActivityLog` | `open class PluginActivityLog(userId: Long, pluginId: String, details: JsonObject = JsonObject())` | Ваша строка журнала |
| вставка | `databaseManager.panelActivityLogDao.add(log, sqlClient)` | Записать её |

Внутри эндпоинта свяжите это так — возьмите SQL-клиент, возьмите хостовый `DatabaseManager`, затем добавьте свой журнал:

```kotlin
val sqlClient = getSqlClient()
val databaseManager = applicationContext.getBean(DatabaseManager::class.java)
databaseManager.panelActivityLogDao.add(CreatedShoutLog(userId, pluginId), sqlClient)
```

::: tip Контрольная точка
Запись теперь появляется на странице **Активность** панели.
:::

Панель отрисовывает каждую запись с ключом локали, выведенным из имени класса (минус `Log`, `UPPER_SNAKE`) под объектом `activity-logs` — `CreatedShoutLog` → `activity-logs.CREATED_SHOUT`. Каждый ключ в `JsonObject` `details`, который вы передаёте, подставляется в соответствующий `{{placeholder}}` в этой строке локали. См. [Локализация](/ru/addon/localization/).

## 13. bean-ы хоста

Собственные сервисы Pano — это **bean-ы** (объекты, которые фреймворк создаёт один раз и разделяет), живущие в хостовом `applicationContext`. Извлекайте любой из них через `applicationContext.getBean(SomeService::class.java)`. Они **не** внедряются в ваши конструкторы — вы всегда извлекаете их вручную (в идеале `by lazy`, см. §1).

::: details Деталь реализации Spring (можно пропустить)
Большинство bean-ов ниже (`DatabaseManager`, `PluginDatabaseManager`, `SetupManager`, `AuthProvider`, `ServerManager`, `TokenProvider`, `NotificationManager`, `MailManager`, `LicenseManager`, `ConfigManager`, `PluginManager`) — это классы `@Component` — а `TokenTypeRegistry` — `@Service` — обнаруживаемые через `@ComponentScan("com.panomc.platform")`; только инфраструктурные bean-ы (`Vertx`, `Router`, `WebClient`, `Gson`, `SchemaRepository`, плюс логгер, движок шаблонов, `HttpClient`, `PluginUiManager` и `PluginEventManager`) объявлены с `@Bean` в `com.panomc.platform.SpringConfig`. Вам ничего из этого не нужно, чтобы их *использовать* — `getBean(...)` работает одинаково в любом случае.
:::

| bean | Используйте для |
|---|---|
| `DatabaseManager` | Общий SQL-клиент, основные DAO, `panelActivityLogDao` |
| `PluginDatabaseManager` | Ваши таблицы и миграции |
| `SetupManager` | `isSetupDone()` — вызывайте первым и пропускайте доступ к базе данных, пока он не вернёт `true` (это «проверка установки» из §1) |
| `AuthProvider` | Проверки прав доступа и входа |
| `ServerManager` | Связь с сервером Minecraft |
| `TokenProvider` / `TokenTypeRegistry` | Токены |
| `NotificationManager` | Уведомления |
| `MailManager` | Почта |
| `LicenseManager` | Получение премиум-лицензии |
| `ConfigManager` | Конфигурация хоста (платформы) |
| `Vertx` | Таймеры, шина событий |
| `WebClient` | Исходящий HTTP |
| `Gson` | JSON (общий экземпляр) |
| `Router` | Веб-роутер Vert.x |
| `SchemaRepository` | Схемы валидации |
| `PluginManager` | Реестр плагинов |

## 14. Лицензия (премиум-аддоны)

Премиум-аддоны проверяют подписанную лицензию против публичного ключа времени сборки. Pano только *скачивает* файл лицензии за вас — он его **не** проверяет; ваш аддон должен сам проверить подпись. Это сводка — полное связывание, копируемые `PluginLicenseClient`/`LicenseGuard` и поведение при сбое описаны в [Премиум-аддоны и лицензирование](/ru/addon/premium/).

*Source: `com.panomc.platform.license` (`LicenseManager`, `SignedLicense`, `LicenseClaims`, `LicenseRequiredException`)*

| Член | Сигнатура | Назначение |
|---|---|---|
| `PanoPlugin.getLicenseManager` | `(): LicenseManager` | Сервис хоста, который получает JWT |
| `LicenseManager.requireLicense` | `(plugin, resourceId, version)` | Получить (кешированную) лицензию для вашего аддона |
| `SignedLicense.verifySignature` | `(publicKey, expectedIssuer)` | Проверить подпись (RS256 = схема подписи с открытым/закрытым ключом), используя публичный ключ, который вы поставляете внутри своего jar |
| `LicenseClaims` | `issuer, platformId, resourceId, userId, version, jarSha256, issuedAtMs, expiresAtMs, keyId, tokenId` | Разобранные claims для перекрёстной проверки |
| `LicenseRequiredException` | `(pluginId, reason, message, cause)` | Бросьте это из `onStart()`, чтобы аддон отказался стартовать без действительной лицензии (безопаснее, чем стартовать всё равно) |

## 15. Разное и паттерны

Небольшие утилиты и две повторяющиеся идиомы, которые не являются одиночными API, но их стоит назвать.

| Штука | Где | Назначение |
|---|---|---|
| Чтение ресурса jar | ваш загрузчик классов | Файлы, которые вы упаковываете внутрь jar (шаблоны писем, ключи), читаются через `javaClass.classLoader.getResourceAsStream(path)` (*загрузчик классов* — то, что читает файлы, упакованные в jar). Примечание: у `PanoPlugin` нет собственного помощника `getResource`. См. `pano-plugin-auth-guard` `MagicLoginMail` |
| `pluginDataFolder` | `PanoPlugin` | Ваш каталог `plugins/<pluginId>/` (загрузки, `config.conf`) |
| `logger` | `PanoPlugin` | Логгер SLF4J, привязанный к классу |

**Фоновые задачи** — планируйте через Vert.x и защищайтесь от наложения с помощью `AtomicBoolean`; отменяйте в `onStop()`/`onDisable()` (см. `pano-plugin-market` `MarketPlugin`). В сниппете ниже аргумент `setPeriodic` — в **миллисекундах**, так что `60_000` означает каждые 60 секунд; флаг `AtomicBoolean` останавливает старт нового прогона, пока предыдущий ещё идёт:

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

Закомментированная строка прячет хитрую часть — запуск `suspend`-работы из (не-`suspend`) колбэка таймера. Полную, компилирующуюся версию читайте в `pano-plugin-market` `MarketPlugin`.

**Маскирование секретов** — эндпоинт `GET` конфигурации должен возвращать секретные поля замаскированными (скрытыми). Раскрывайте настоящее значение только через *отдельный* эндпоинт, который сначала перепроверяет пароль администратора. Два способа сделать эту проверку:

- **Вариант A:** `authProvider.requirePassword(password, context)` — см. `pano-plugin-auth-guard` `TwoFactorDisableAPI`.
- **Вариант B:** ручная проверка `databaseManager.userDao.isLoginCorrect(...)` — см. `pano-plugin-social-login` `PanelRevealSecretAPI`.

## Что дальше

- **[Разработка бэкенда](/ru/addon/backend/)** — проработанное руководство по Shoutbox, которое складывает эти API в компилирующийся код.
- **[Локализация](/ru/addon/localization/)** — ключи локали для прав доступа и журналов активности.
- **[Премиум-аддоны и лицензирование](/ru/addon/premium/)** — полное связывание проверки лицензии для группы 14.
- **[Справочник API фронтенда](/ru/addon/api-reference/)** — поверхность `pano.*` и `@panomc/sdk` для UI-половины.
