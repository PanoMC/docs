# Справочник Backend API

**Что даёт вам эта страница:** каждый бэкенд-класс, функцию и аннотацию, которые может использовать ваше дополнение, отсортированные по тому, что вы пытаетесь сделать. Это справочник-компаньон к руководству [Разработка бэкенда](/ru/addon/backend/) — руководство показывает, *как* связать части вместе на примере Shoutbox; эта страница перечисляет, *что существует*, чтобы вам никогда не пришлось читать исходники платформы для поиска точки расширения по имени. (*Точка расширения* = место, где Pano позволяет вашему коду подключиться: хук, аннотация или базовый класс, который вы расширяете.)

Каждая запись даёт своё имя, назначение в одну строку и минимальную сигнатуру (имя функции, её параметры и что она возвращает). Обращайтесь к руководству за проработанным, компилирующимся кодом; обращайтесь к этой странице, чтобы ответить на вопрос «существует ли API для этого и как он называется?».

::: warning Новичок в дополнениях Pano? Сначала прочтите руководство
Это **справочник**, а не отправная точка — он предполагает, что вы уже собрали дополнение. Если вы попали на эту страницу из поиска и ничего не понятно, сначала пройдите руководство [Разработка бэкенда](/ru/addon/backend/). До него эта страница будет иметь очень мало смысла.
:::

### Какой раздел мне нужен?

- Добавить HTTP-эндпоинт (URL, на который отвечает ваше дополнение) → **§3**
- Хранить данные в базе данных → **§4**
- Читать или писать собственный файл конфигурации → **§5**
- Реагировать на входы, настройку, маршрутизацию или удаление аккаунта → **§6**
- Ограничить страницу панели определёнными админами (разрешения) → **§7**
- Общаться с плагином Minecraft-сервера → **§8**
- Выдавать ссылки волшебного входа или одноразовые токены → **§9**
- Отправить уведомление или письмо → **§10**
- Добавить консольную команду → **§11**
- Записать админское действие в ленту активности → **§12**
- Взять один из собственных сервисов Pano (база данных, аутентификация, …) → **§13**
- Проверить премиум-лицензию → **§14**
- Прочитать файл, упакованный в ваш jar, или запустить фоновую задачу → **§15**

::: tip Словарь за 60 секунд
Эти слова встречаются по всей странице. Пробегитесь по ним один раз.

- **хост** — работающий сервер Pano, который загружает jar вашего дополнения. Когда в строке написано «хост делает X», имеется в виду сам Pano, а не ваш код.
- **bean** — объект, который фреймворк создаёт один раз и разделяет. Вы *просите* bean вместо того, чтобы конструировать его.
- **контекст** — коробка, в которой живут эти bean-ы. Вы получаете три: `pluginBeanContext` (ваш), `pluginGlobalBeanContext` (общий между дополнениями) и `applicationContext` (собственный Pano — где живут его сервисы).
- **аннотация** — метка вроде `@Endpoint`, которую вы пишете над классом. Pano сканирует ваш jar и связывает всё, что несёт её.
- **DAO** — Data Access Object: один небольшой класс, содержащий весь SQL для одной таблицы базы данных.
- **миграция** — одноразовый шаг обновления, который преобразует существующую таблицу или конфигурацию пользователя из версии N в N+1 при обновлении вашего дополнения.
- **suspend** — функция, которая может приостановиться и подождать без блокировки потока (смотрите блок ниже).
- **Future / `coAwait()`** — результат Vert.x, который ещё не готов; внутри `suspend`-функции вы добавляете `.coAwait()`, чтобы дождаться его.
- **JWT / токен** — подписанная строка: любой может прочитать, что внутри, но только сервер мог её создать, так что подделать её нельзя.
- **узел разрешения** — строка с точками вроде `pano.plugin.x.manage`, называющая одно разрешение; админы выдают узлы группам пользователей.
- **HOCON** — дружелюбный к человеку вариант JSON, допускающий комментарии; формат `config.conf`.
- **PF4J** — библиотека загрузки плагинов, которую Pano использует внутри; вы никогда не вызываете её напрямую.
:::

::: tip О `suspend`
`suspend` помечает функцию, которая может приостановиться и подождать — запрос к базе данных, HTTP-вызов — не блокируя поток. Единственное правило: **вы можете вызвать `suspend`-функцию только из другой `suspend`-функции.** Вам редко приходится об этом думать, потому что большинство точек входа, которые вам передаёт Pano, уже `suspend`: все хуки жизненного цикла (`onStart()`, …) и каждый `handle()` эндпоинта. Свободно вызывайте другие `suspend`-функции внутри них. (Несколько точек входа — исключение и являются обычными, не-`suspend` функциями — методы `RouterEventListener` (§6) и обработчики `@Command` (§11); внутри них нельзя напрямую вызывать `suspend`-функции.) Если вы вызовете `suspend`-функцию из обычной (не-`suspend`) функции, вы получите ошибку компилятора вроде *«suspend function should be called only from a coroutine or another suspend function»*.
:::

::: tip Как читать эту страницу
У каждой группы ниже есть **таблица** (имя API, назначение в одну строку и его сигнатура) и строка `Source:` — файл, где он определён (пакет `com.panomc.platform`, под `Pano/src/main/kotlin/` в репозитории `pano-web-platform`), так что вы всегда можете открыть реальный код. Всё здесь переписано прямо из этого исходника. Следите за словом `suspend` в сигнатурах — смотрите блок чуть выше.
:::

::: tip Дополнения в коде — это плагины
Как и везде в этой документации: в тексте — **дополнение**, но код использует `plugin` — `PanoPlugin`, `pluginId`, `PluginConfig`. Метаданные дополнения (id, имя, главный класс, зависимости) не задаются в коде; они живут в манифесте jar (*манифест jar* = небольшой текстовый файл метаданных, упакованный внутрь вашего собранного `.jar`; Gradle пишет его за вас из `gradle.properties`) — смотрите [Конфигурация манифеста](/ru/addon/manifest/).
:::

::: tip Примеры плагинов, упомянутые на этой странице
Несколько строк указывают на реальные, работающие плагины как примеры — `pano-plugin-slider`, `pano-plugin-auth-guard`, `pano-plugin-market`, `pano-plugin-social-login`, `pano-plugin-premium-login`. Это встроенные плагины, поставляемые с Pano; их исходники живут в репозитории `pano-web-platform` под `plugins/pano-plugin-*`. Когда строка говорит «смотрите `pano-plugin-slider` `PanelAddSliderItemAPI`», откройте исходники этого плагина, чтобы прочитать полный пример.
:::

## 1. Входной класс и жизненный цикл — `PanoPlugin`

У каждого дополнения ровно один класс, расширяющий `PanoPlugin`. Он — три вещи сразу: ваша точка входа (первый класс, который загружает Pano), место, где Pano передаёт вам готовые объекты — ваш логгер, вашу папку данных, экземпляр Vert.x — как свойства, которые вы никогда не конструируете сами, и владелец хуков жизненного цикла (функций, которые Pano вызывает в фиксированные моменты).

*Source: `com.panomc.platform.api.PanoPlugin`*

### Внедряемые свойства

Pano заполняет их за вас до того, как выполнится `onCreate()`; читайте их откуда угодно в классе и никогда не присваивайте их сами. (Помните: *хост* = работающий сервер Pano, который загружает jar вашего дополнения.)

Три из строк ниже — это Spring **контексты** — коробки bean-ов. **Bean** — объект, который фреймворк создаёт один раз и разделяет; **контекст** — коробка, в которой живут эти bean-ы. Вы получаете три коробки: `pluginBeanContext` (ваша), `pluginGlobalBeanContext` (общая между дополнениями) и `applicationContext` (собственная Pano — где живут его сервисы).

| Свойство | Тип | Что это |
|---|---|---|
| `pluginId` | `String` | id вашего дополнения (из манифеста) |
| `vertx` | `Vertx` | экземпляр Vert.x — таймеры, шина событий, `WebClient` |
| `pluginBeanContext` | `AnnotationConfigApplicationContext` | контекст Spring, содержащий *ваши* bean-ы |
| `pluginGlobalBeanContext` | `AnnotationConfigApplicationContext` | общий контекст для межаддонных bean-ов |
| `applicationContext` | `AnnotationConfigApplicationContext` | контекст хоста — извлекайте сервисы Pano через `getBean(...)` |
| `pluginEventManager` | `PluginEventManager` | генерировать/принимать межаддонные события |
| `pluginUiManager` | `PluginUiManager` | реестр UI-бандлов (управляется за вас) |
| `environmentType` | `Main.Companion.EnvironmentType` | `DEVELOPMENT` / `RELEASE` |
| `releaseStage` | `ReleaseStage` | канал alpha / beta / stable |
| `pluginState` | `PluginState` | состояние загрузки PF4J (PF4J = внутренний загрузчик плагинов Pano; вы никогда его не вызываете) |
| `pluginDataFolder` | `File` | директория данных `plugins/<pluginId>/` (создаётся автоматически) |
| `logger` | `Logger` | логгер SLF4J, привязанный к вашему классу |

### Хуки жизненного цикла

Все являются `open suspend fun` с пустым телом по умолчанию (`open` = вы можете переопределить его; *no-op* = ничего не делает, пока вы не переопределите; `suspend` = смотрите блок вверху). Переопределяйте только то, что нужно. Они выполняются в таком порядке:

```
jar load → onCreate() → onEnable() → onStart()
        …running…
onStop() → onDisable() → onUninstall()
```

`verifyLicense()` **не** часть этой последовательности — он выполняется по требованию, когда админ сайта нажимает *Обновить лицензию* в панели (только премиум-дополнения).

| Хук | Выполняется когда |
|---|---|
| `onCreate()` | Объект плагина сконструирован — первый выполняющийся хук (ваши внедрённые свойства к этому моменту уже установлены) |
| `onEnable()` | Дополнение включено — при загрузке сервера или когда админ нажимает *Включить* в панели |
| `onStart()` | Дополнение стартует — поместите сюда код настройки. Сначала проверьте `setupManager.isSetupDone()` и вернитесь рано, если `false` (смотрите §13), чтобы никогда не трогать базу данных до установки сайта |
| `onStop()` | Дополнение останавливается — отменяйте здесь таймеры/задачи |
| `onDisable()` | Дополнение отключено, его данные сохранены — при выключении сервера или когда админ нажимает *Отключить* |
| `onUninstall()` | Дополнение **удалено** (админ нажимает *Удалить*) — сбрасывайте здесь ваши таблицы |
| `verifyLicense()` | Кнопка «Обновить лицензию» в панели (премиум-дополнения) |

### Методы

| Метод | Сигнатура | Назначение |
|---|---|---|
| `registerSingletonGlobal` | `(bean: Any)` | Поделиться bean-ом с другими дополнениями |
| `unRegisterGlobal` | `(bean: Any)` | Убрать общий bean |
| `register` | `(listener: PluginEventListener)` | Зарегистрировать динамический слушатель событий |
| `unRegister` | `(listener: PluginEventListener)` | Убрать динамический слушатель событий |
| `registerCommands` | `(obj: Any)` | Зарегистрировать методы `@Command` на объекте (`@Command` = аннотация, добавляющая консольную команду — смотрите §11) |
| `unRegisterCommands` | `(obj: Any)` | Убрать их |
| `getLicenseManager` | `(): LicenseManager` | Сервис лицензий хоста (премиум) |
| `getLicenseJwtIssuer` | `(): String` | Ожидаемый `iss` для лицензионных JWT |
| `getOwnJarSha256` | `(): String?` | SHA-256 загруженного jar или null |

::: warning Собственные сервисы Pano не являются параметрами конструктора
Когда Pano создаёт *ваши* классы, он может передать ваши собственные DAO и bean-ы как параметры конструктора (это называется *внедрением через конструктор*). Но вы **не можете** просить собственные сервисы Pano (`DatabaseManager`, `AuthProvider`, `SetupManager`, …) таким образом — они живут в `applicationContext`, не в вашем контексте. Извлекайте их вручную:

```kotlin
// `by lazy` delays the lookup until first use, after the host has finished wiring everything up
private val authProvider by lazy { applicationContext.getBean(AuthProvider::class.java) }
```
:::

## 2. Аннотации, которые автоматически регистрируют ваши классы

**Аннотация** — это метка (вроде `@Endpoint`), которую вы пишете над классом. Когда ваше дополнение загружается, Pano сканирует ваш jar и автоматически связывает любой класс, несущий одну из этих меток — нет ручного вызова регистрации. Сканирование укоренено в пакете вашего главного класса плагина, так что ваши аннотированные классы должны жить в этом пакете или его подпакете (класс в несвязанном пакете незаметно никогда не регистрируется). Все эти аннотации живут в `com.panomc.platform.annotation` **кроме** `@EventListener`.

*Source: `com.panomc.platform.annotation.*`, `com.panomc.platform.api.annotation.EventListener`*

| Аннотация | Ставьте на | Назначение |
|---|---|---|
| `@Endpoint` | подкласс `Api` | Зарегистрировать HTTP-маршрут |
| `@Dao` | реализацию `Dao` (в паре с `@Lazy @Scope(SCOPE_SINGLETON)`) | Зарегистрировать синглтон DAO |
| `@Migration` | `DatabaseMigration` или `PluginConfigMigration` | Зарегистрировать миграцию |
| `@EventListener` | класс-слушатель событий | Зарегистрировать слушатель |
| `@PermissionDefinition` | подкласс `Permission` | Зарегистрировать разрешение |
| `@NotificationDefinition` | тип уведомления | Зарегистрировать тип уведомления |
| `@Event` | обработчик WebSocket Minecraft-сервера (используется самой платформой) | Вы увидите это в исходниках платформы, но дополнения не могут его использовать — используйте `ServerManager.registerEvent` (§8) вместо этого |
| `@Ignore` | поле сущности | Исключить поле из сопоставления со столбцами |

**DAO** (Data Access Object) — класс, содержащий SQL для одной таблицы. Его реализация `@Dao` требует все три аннотации, сложенные вместе, плюс два импорта Spring. Вот весь заголовок класса для примера Shoutbox (`ShoutDao` — ваш абстрактный DAO, `ShoutDaoImpl` — тот, что с SQL):

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

(**Миграция** = одноразовый шаг обновления, преобразующий существующую таблицу или конфигурацию пользователя из версии N в N+1 при обновлении вашего дополнения; смотрите §4 и §5.)

::: warning Используйте `@EventListener` от Pano, а не от Spring
Аннотация — это `com.panomc.platform.api.annotation.EventListener` — **не** `org.springframework.context.event.EventListener`. У них одинаковое короткое имя, но они приходят из разных импортов; импортируйте неправильный, и система событий незаметно никогда не вызовет ваш слушатель. Проверьте, что ваша строка импорта читается ровно как `import com.panomc.platform.api.annotation.EventListener`.
:::

## 3. HTTP-эндпоинты и маршрутизация

**Эндпоинт** = один URL, на который отвечает ваше дополнение, например `GET /api/shouts`. Вы создаёте его, написав класс с аннотацией `@Endpoint`, расширяющий один из базовых API-классов ниже; Pano передаёт ваши DAO и bean-ы в его конструктор за вас (внедрение через конструктор).

Наименьший компилирующийся эндпоинт — это класс, пути, на которые он отвечает, и `handle`, возвращающий результат:

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
| `RouteType` | `ROUTE`, `GET`, `POST`, `PUT`, `DELETE` | HTTP-метод — `ROUTE` соответствует *любому* методу, используется для маршрутов `Template` (HTML) |
| `Route.paths` | `val paths: List<Path>` | Пути, которые обрабатывает этот маршрут (обязательно) |
| `Route.order` | `open val order = 1` | Если два маршрута могут совпасть с одним URL, тот, у кого `order` меньше, пробуется первым |
| `Route.getValidationHandler` | `(schemaRepository): ValidationHandler?` | Валидация тела/query запроса |
| `Route.corsHandler` | `open fun corsHandler(): Handler?` | Переопределить CORS (значения по умолчанию предоставлены) |
| `Route.bodyHandler` | `open fun bodyHandler(): Handler?` | Переопределить парсинг тела (смотрите загрузки) |

### Базовые классы — выбирайте по тому, кто может вызывать

| Базовый класс | Кому разрешено | Объявляйте пути как |
|---|---|---|
| `Api` | Кому угодно (публично) | `/api/...` |
| `LoggedInApi` | Любому вошедшему пользователю | `/api/...` |
| `PanelApi` | Админам (расширяет `LoggedInApi`) | `/api/panel/...` |
| `SetupApi` | Только во время первоначальной настройки | `/api/...` |
| `Template` | Маршрут HTML, отрисованный на сервере | — |

Маршруты `SetupApi` существуют только пока работает мастер первоначальной установки и исчезают, как только сайт настроен — он вам редко понадобится.

::: tip Пути панели объявляются как `/api/panel/...`
UI панели вызывает URL вроде `/panel/api/...`, но Pano перенаправляет их на `/api/...` внутри — так что вы всегда объявляете форму `/api/panel/...`. Конкретно:

- Браузер вызывает: `GET /panel/api/shouts`
- Вы объявляете: `Path("/api/panel/shouts", RouteType.GET)`
:::

### Обработка запроса (члены `Api`)

| Член | Сигнатура | Назначение |
|---|---|---|
| `handle` | `abstract suspend fun handle(context: RoutingContext): Result?` | Тело вашего эндпоинта — возвращайте `Successful(...)` при успехе; чтобы сообщить об ошибке, **бросьте** `Error` (смотрите ниже), не возвращайте её. (Возврат `null` не отправляет ничего обратно по обычному пути — делайте это, только если вы сами написали ответ.) |
| `getSqlClient` | `suspend fun getSqlClient(): SqlClient` | Общий SQL-клиент |
| `getParameters` | `fun getParameters(context): RequestParameters` | Валидированные параметры тела/query/пути |
| `checkSetup` | `fun checkSetup()` | Бросить `InstallationRequired`, если настройка не завершена |
| `isAllowedInDemo` | `open fun isAllowedInDemo(method: HttpMethod): Boolean` | Ограждать записи, когда экземпляр работает в демо-режиме |

### Результаты и ошибки

| Вещь | Сигнатура | Назначение |
|---|---|---|
| `Successful` | `Successful(map: Map<String, Any?> = emptyMap())` | Успех → `{"result":"ok", …map…}` |
| `Errors` | `Errors(map: Map<String, Any?>)` | Полезная нагрузка ошибок на уровне полей — например `Errors(mapOf("email" to true))` говорит фронтенду подсветить поле email |
| Подклассы `Error` | `throw NotFound()` / `BadRequest()` / … | ~100 предопределённых в `com.panomc.platform.error` (`NotFound`, `BadRequest`, `NoPermission`, `NotLoggedIn`, `InternalServerError`, …) |
| Своя ошибка | `class MyError : Error(statusCode, …)` | Код ошибки клиента = имя класса в `UPPER_SNAKE`: `class SlugTaken : Error(...)` → клиент получает `"error": "SLUG_TAKEN"` |

Чтобы сообщить об ошибке запроса, вы **бросаете** `Error` (Pano `com.panomc.platform.model.Error`, **не** встроенный `Error` Kotlin) — вы не возвращаете её. Сбои валидации превращаются в `BadRequest` за вас.

### Загрузка файлов — свой `bodyHandler()`

Переопределите `bodyHandler()`, чтобы принимать multipart-загрузки, и валидируйте через `Bodies.multipartFormData`. В сниппете ниже `FILE_UPLOAD_SIZE` — константа, которую определяете *вы* — максимальный размер загрузки в байтах, например `private const val FILE_UPLOAD_SIZE = 5 * 1024 * 1024`. Паттерн (смотрите `pano-plugin-slider` `PanelAddSliderItemAPI`):

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
- `ShoutDaoImpl.kt` — класс `@Dao`, содержащий реальный SQL.

Разделение позволяет вашим эндпоинтам зависеть от простого типа `ShoutDao`, пока Pano поставляет несущий SQL `ShoutDaoImpl` во время выполнения. Руководство [Разработка бэкенда](/ru/addon/backend/) строит один от начала до конца.

*Source: `com.panomc.platform.db` (`Dao`, `DBEntity`, `DatabaseMigration`), `com.panomc.platform.api.PluginDatabaseManager`*

| Тип | Сигнатура | Назначение |
|---|---|---|
| `DBEntity` | `abstract class` (имеет статический `gson`) | Базовый класс для модели строки — пишите `class Shout(...) : DBEntity()`. Внимание: в отличие от `@Dao`, вы его *расширяете*, а не аннотируете им |
| `@Ignore` | аннотация поля | Держать поле модели вне сопоставления со столбцами |
| `Dao<T : DBEntity>` | `abstract class Dao<T>(entityClass: Class<T>)` | Базовый DAO |
| `Dao.init` | `abstract suspend fun init(sqlClient: SqlClient)` | `CREATE TABLE IF NOT EXISTS …` здесь |
| `Dao.uninstall` | `open suspend fun uninstall(sqlClient: SqlClient)` | `DROP TABLE …` (необязательно) |
| `Dao.fields` | `open val fields: List<String>` | Имена столбцов для построения запросов |
| `Dao.tableName` | `protected val tableName` | Выводится автоматически из имени класса вашей сущности (`ShoutItem` → `shout_item`); только для чтения — вы его не задаёте |
| `Dao.getTablePrefix` | `fun getTablePrefix(): String` | Префикс таблиц экземпляра |
| `Row.toEntity()` | расширение | Одна строка → ваша модель (через Gson). Функция-расширение из `com.panomc.platform.db` — вызывайте `row.toEntity()` на строке результата |
| `RowSet.toEntities()` | расширение | Много строк → `List<T>`. Та же идея: вызывайте `rows.toEntities()` на результате запроса |
| `List<String>.toTableQuery()` | расширение | Список столбцов в обратных кавычках |
| `DatabaseMigration` | `DatabaseMigration(from: Int, to: Int, info: String)` | Шаг схемы; переопределите `val handlers: List<suspend (SqlClient) -> Unit>` |
| `PluginDatabaseManager.initialize` | `suspend fun initialize(plugin: PanoPlugin)` | Создать таблицы + выполнить ожидающие миграции |
| `PluginDatabaseManager.uninstall` | `suspend fun uninstall(plugin: PanoPlugin)` | Выполнить `uninstall()` каждого DAO |

**Ожидание результатов запроса (`coAwait`).** Каждый вызов базы данных Vert.x возвращает **Future** — результат, который ещё не готов. Внутри `suspend`-функции вы добавляете `.coAwait()`, чтобы дождаться его и получить значение:

```kotlin
// import io.vertx.kotlin.coroutines.coAwait
val rows = sqlClient.query("SELECT * FROM `shout`").execute().coAwait()
```

Сырой SQL к **собственным** таблицам Pano (не вашего дополнения) идёт через хост `DatabaseManager` — `databaseManager.getSqlClient()`, плюс core DAO вроде `userDao`.

**Миграция, полностью.** Класс `@Migration` поднимает схему на одну версию и перечисляет по одному обработчику на изменение. Каждый обработчик выполняет ваш `ALTER TABLE` (или подобное):

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

::: warning `onUninstall` сбрасывает ваши таблицы
`pluginDatabaseManager.uninstall(this)` выполняет **`uninstall()` каждого DAO** — это действие панели **Удалить**, а не **Отключить**. Отключение сохраняет данные.
:::

Для полного, компилирующегося запроса — реального `SELECT` и `INSERT`, написанных внутри DAO — следуйте странице руководства [База данных и миграции](/ru/addon/database/).

## 5. Конфигурация

Класс конфигурации, расширяющий `PluginConfig`, записывается в `plugins/<pluginId>/config.conf` (HOCON — дружелюбный к человеку вариант JSON, допускающий комментарии) при первом запуске вашего дополнения и читается обратно как обычный объект Kotlin — вы пишете `config.apiKey`, а не строковые поиски.

*Source: `com.panomc.platform.api.config` (`PluginConfig`, `PluginConfigManager`, `PluginConfigMigration`, `ConfigComment`, `ConfigSection`)*

| Тип | Сигнатура | Назначение |
|---|---|---|
| `PluginConfig` | `open class PluginConfig` (имеет `version: Int`) | База для вашей конфигурации; добавляйте свои поля со значениями по умолчанию |
| `PluginConfigManager<T>` | `PluginConfigManager(plugin, T::class.java)` | Загружает/сохраняет файл для одного класса конфигурации |
| `.config` | `val config: T` | Текущие типизированные значения |
| `.saveConfig` | `fun saveConfig(config: JsonObject)` | Сохранить изменения на диск |
| `.configFilePath` | `val configFilePath: String` | Разрешённый путь к `config.conf` |
| `PluginConfigMigration` | `PluginConfigMigration(from: Int, to: Int, versionInfo: String)` | Переопределите `fun migrate(config: JsonObject)`; аннотируйте `@Migration` |
| `@ConfigComment` | `@ConfigComment(vararg lines: String)` | Комментарий-документация над полем в сгенерированном файле |
| `@ConfigSection` | `@ConfigSection(title: String)` | Сгруппировать ключи под баннером |

Почему `.config` — типизированный `T`, а `.saveConfig` принимает `JsonObject`? Чтение даёт вам ваш собственный типизированный класс; сохранение принимает сырой `JsonObject`, чтобы вы могли менять только нужные ключи. Сохранение выглядит так:

```kotlin
configManager.saveConfig(JsonObject().put("apiKey", "new-value"))
```

Зарегистрируйте менеджер как **синглтон** (один общий экземпляр) в вашем собственном `pluginBeanContext` во время `onStart()`, затем извлекайте его лениво, когда запрос нуждается в нём. Две строки:

```kotlin
val configManager = PluginConfigManager(this, ShoutboxConfig::class.java)
pluginBeanContext.beanFactory.registerSingleton(PluginConfigManager::class.java.name, configManager)
```

::: tip Контрольная точка
После первого запуска `plugins/<pluginId>/config.conf` должен существовать на диске, содержа ваши значения по умолчанию.
:::

## 6. Слушатели событий

Большинство слушателей событий работают одинаково. (1) Реализуйте интерфейс. (2) Аннотируйте класс `@EventListener`. (3) Pano вызывает ваши методы, когда событие срабатывает. Методы — `suspend` и по умолчанию ничего не делают, так что вы переопределяете только те, что вам важны. Два слушателя нарушают этот паттерн — смотрите выноски под таблицей.

*Source: `com.panomc.platform.api.event.*`*

| Интерфейс | Методы (относящиеся к плагину) |
|---|---|
| `SetupEventListener` | `onSetupFinished()` |
| `RouterEventListener` | `onInitRouteList(routes: MutableList<Route>)`, `onRouterCreate(router: Router)` |
| `AuthEventListener` | `onBeforeAuthenticate(context, sqlClient): LoginDecision?`, `onBeforeVerifyLinkCode(context, sqlClient): LoginDecision?`, `onBeforeLogin(user, context, sqlClient): LoginDecision?`, `onAfterLogin(user, context, sqlClient)`, `onAfterRegister(user, sqlClient)` |
| `PlayerEventListener` | `onDelete(user: User)` — очистка при удалении аккаунта |
| `ProfilePictureEventListener` | `resolveProfilePictureUrl(user: User): String?` |
| `PluginLifecycleListener` | `onPluginLoad/Enable/Disable/Unload/Uninstall(plugin: PanoPlugin)` |
| `PluginEventListener` | Маркер для ваших собственных межаддонных событий |

**Методы `AuthEventListener`** (переполненная строка выше, по одному на строку):

- `onBeforeAuthenticate(context, sqlClient): LoginDecision?`
- `onBeforeVerifyLinkCode(context, sqlClient): LoginDecision?`
- `onBeforeLogin(user, context, sqlClient): LoginDecision?`
- `onAfterLogin(user, context, sqlClient)`
- `onAfterRegister(user, sqlClient)`

`onBeforeLogin` и его собратья возвращают `LoginDecision`: `Deny(errorKey, extras)`, `RequireUsername(userId)` или `Allow`. (`errorKey` = ключ локализации — id переведённого сообщения, показываемого пользователю; смотрите [Локализация](/ru/addon/localization/).)

Два способа зарегистрировать слушатель: класс `@EventListener` в вашем пакете (**фиксированный** — обнаруживается один раз при загрузке дополнения) или `plugin.register(listener)` / `plugin.unRegister(listener)`, чтобы добавлять и убирать слушатели **пока дополнение работает**.

::: warning Исключение 1 — `RouterEventListener` не `suspend`
В отличие от остальных, `onInitRouteList` и `onRouterCreate` у `RouterEventListener` — обычные (не-`suspend`) **абстрактные** функции. Вы *должны* реализовать обе, и внутри них нельзя напрямую вызывать `suspend`-функции.
:::

::: warning Исключение 2 — у `PluginLifecycleListener` нет `@EventListener`
`PluginLifecycleListener` **не** расширяет маркер `EventListener`, так что аннотирование его `@EventListener` не делает ничего полезного — он никогда не срабатывает, *и* он ломает внутреннее приведение `as EventListener` хоста, бросая `ClassCastException` во время инициализации вашего плагина. Регистрируйте его явно:

```kotlin
applicationContext.getBean(PluginManager::class.java).addLifecycleListener(listener)
```
:::

::: tip Межаддонные события (продвинутое)
Чтобы позволить *другим* дополнениям реагировать на что-то, что делает ваше дополнение: определите интерфейс, расширяющий `PluginEventListener`, поделитесь вашим плагином, чтобы другие могли его найти, затем оповестите каждого подписчика. Обратите внимание, что `getEventListeners` — функция **объекта-компаньона** (функция, принадлежащая самому классу, а не экземпляру), так что вы вызываете её как `PluginEventManager.getEventListeners<...>()`, а не на внедрённом `pluginEventManager`.

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

## 7. Разрешения и аутентификация

**Узел разрешения** — строка с точками (вроде `pano.plugin.x.manage`), называющая одно разрешение. Админы выдают узлы группам пользователей в панели; ваш код затем проверяет, держит ли текущий пользователь узел.

*Source: `com.panomc.platform.auth` (`Permission`, `PanelPermission`, `AuthProvider`)*

| Тип | Сигнатура | Узел, который он производит |
|---|---|---|
| `Permission` | `open class Permission(iconName: String)` | `pano.<key>` |
| `PanelPermission` | `open class PanelPermission(iconName: String)` | `pano.plugin.<pluginId>.<dotted.key>` |
| `@PermissionDefinition` | аннотация класса | Автоматически регистрирует разрешение |

(`iconName` = имя иконки Font Awesome, показываемой рядом с разрешением в панели, например `"fa-bullhorn"` или `"fa-comments"`.)

Узел выводится автоматически из имени класса. Сначала пример:

`ManageShoutboxPermission` → `pano.plugin.pano-plugin-shoutbox.manage.shoutbox`

Правило: отбросьте завершающее `Permission`, разбейте оставшиеся слова, переведите в нижний регистр, соедините точками и (для `PanelPermission` плагина) добавьте префикс `pano.plugin.<pluginId>.`. Вы повторяете эту точную строку в коде фронтенда, чтобы ограждать (показывать/скрывать) страницы панели и ссылки навигации — смотрите [Справочник API фронтенда](/ru/addon/api-reference/).

**`AuthProvider`** (bean хоста через `getBean`):

| Метод | Сигнатура | Назначение |
|---|---|---|
| `requirePermission` | `suspend fun requirePermission(permission: Permission, context: RoutingContext)` | Бросить, если у пользователя его нет |
| `hasPermission` | `suspend fun hasPermission(permission: Permission, context: RoutingContext): Boolean` | Проверка без броска |
| `isLoggedIn` | `suspend fun isLoggedIn(context: RoutingContext): Boolean` | — |
| `hasAccessPanel` | `suspend fun hasAccessPanel(context: RoutingContext): Boolean` | Любой доступ к панели вообще |
| `getUserIdFromRoutingContext` | `fun getUserIdFromRoutingContext(context: RoutingContext): Long` | id текущего пользователя |
| `requirePassword` | `suspend fun requirePassword(password: String?, context: RoutingContext)` | Повторная аутентификация (бросает при неверном) |
| `isUserAdmin` | `suspend fun isUserAdmin(userId: Long): Boolean` | — |

## 8. Коммуникация с Minecraft-сервером

Если владелец сайта запускает сопутствующий `pano-mc-plugin` на своём Minecraft-сервере, этот плагин держит открытым **зашифрованное WebSocket**-соединение с Pano (WebSocket = двунаправленное, постоянно открытое сетевое соединение, в отличие от обычного одноразового HTTP-запроса; Pano шифрует каждое сообщение в нём с помощью AES-256-GCM). `ServerManager` — ваша рукоятка на этом соединении: регистрируйте обработчики для входящих сообщений и отправляйте исходящие (смотрите `pano-plugin-premium-login`). Если сервер не подключён, говорить не с кем.

*Source: `com.panomc.platform.server` (`ServerManager`, `ServerEvent`, `PlatformMessage`)*

| Член | Сигнатура | Назначение |
|---|---|---|
| `ServerManager.registerEvent` | `fun registerEvent(event: ServerEvent<*, *>)` | Обработать тип входящего события |
| `ServerManager.unregisterEvent` | `fun unregisterEvent(event: ServerEvent<*, *>)` | Прекратить обрабатывать его |
| `ServerManager.sendMessage` | `fun sendMessage(message: PlatformMessage, server: Server)` | Отправить-и-забыть на один сервер |
| `ServerManager.getConnectedServers` | `fun getConnectedServers(): Map<Server, ServerWebSocket>` | Подключённые в данный момент серверы (ключ = `Server`, значение = его живой WebSocket) |
| `ServerManager.isConnected` | `fun isConnected(id: Long): Boolean` | — |
| `ServerEvent<R, M>` | `abstract suspend fun handle(request: R, server: Server): M?` | Обработчик входящего события (R = полезная нагрузка запроса, которую вы получаете, M = тип сообщения, которым вы можете ответить; `M?` означает, что ответ необязателен) |
| `PlatformMessage` | `interface` | Форма исходящего сообщения |

(`ServerEvent<*, *>` в строках выше просто означает «`ServerEvent` любых типов запроса/ответа».)

**Имена в проводе** выводятся из имени класса: `ServerEvent` отбрасывает суффикс `Event`, `PlatformMessage` отбрасывает `Message`, затем оба преобразуются в `UPPER_SNAKE` (`getEventName()` / `getResponseName()`). Так `PlayerJoinEvent` ⇄ имя в проводе `PLAYER_JOIN`.

## 9. Токены

**Токен** здесь — подписанная строка в формате **JWT**: любой может прочитать, что внутри, но только сервер мог её создать, так что подделать её нельзя. Используйте токены для ссылок волшебного входа и одноразовых действий. Зарегистрируйте *тип* вашего токена у хоста, чтобы он снимался с регистрации автоматически при выгрузке вашего дополнения (смотрите `pano-plugin-auth-guard` `MagicLoginTokenType`).

*Source: `com.panomc.platform.token` (`TokenType`, `TokenTypeRegistry`, `TokenProvider`)*

| Член | Сигнатура | Назначение |
|---|---|---|
| `TokenType` | `interface` — `getName(): String`, `getExpireDate(): Long` (истечение как epoch millis) | Ваш тип токена (имя по умолчанию из имени класса минус `TokenType`, `UPPER_SNAKE`) |
| `TokenTypeRegistry.registerPluginToken` | `fun registerPluginToken(pluginId: String, tokenType: TokenType)` | Зарегистрировать (автоматически убирается при выгрузке) |
| `TokenProvider.generateToken` | `fun generateToken(subject: String, tokenType: TokenType): Pair<String, Long>` | Возвращает `(tokenString, expiresAtEpochMillis)` — подписанный токен и когда он истекает (epoch миллисекунды) |
| `TokenProvider.saveToken` | `suspend fun saveToken(token: String, subject: String, tokenType: TokenType, expireDate: Long, sqlClient: SqlClient, ipAddress: String? = null, userAgent: String? = null)` | Сохранить его |
| `TokenProvider.isTokenValid` | `suspend fun isTokenValid(token: String, tokenType: TokenType, sqlClient: SqlClient): Boolean` | — |
| `TokenProvider.invalidateToken` | `suspend fun invalidateToken(token: String, sqlClient: SqlClient)` | Отозвать один |
| `TokenProvider.invalidateTokensBySubjectAndType` | `suspend fun invalidateTokensBySubjectAndType(subject: String, type: TokenType, sqlClient: SqlClient)` | Отозвать токены субъекта определённого типа |
| `TokenProvider.parseToken` | `fun parseToken(token: String): DecodedJWT` | Декодировать claims |

## 10. Уведомления и почта

*Source: `com.panomc.platform.notification` (`NotificationManager`, `UserNotificationType`, `PanelUserNotificationType`), `com.panomc.platform.mail` (`MailManager`, `Mail`)*

**Уведомления** появляются под иконкой колокольчика в верхней панели темы и панели. Подкласс `UserNotificationType` или `PanelUserNotificationType`, аннотируйте `@NotificationDefinition`, затем отправляйте через `NotificationManager`:

| Метод | Отправляет |
|---|---|
| `sendNotification(…)` | Одному пользователю |
| `sendPanelNotification(…)` | В панель одного пользователя |
| `sendNotificationToAll(…)` | Каждому пользователю |
| `sendPanelNotificationToAll(…)` | В панель каждого пользователя |
| `sendNotificationToAllAdmins(…)` | Всем админам |
| `sendNotificationToAllWithPermission(…)` | Всем, кто держит разрешение |

Самый частый, полностью: `suspend fun sendNotification(userId: Long, userNotificationType: UserNotificationType, sqlClient: SqlClient)`. Остальные пять следуют той же форме (смотрите `NotificationManager`, начиная со строки исходника 33).

**Почта** — реализуйте `Mail`, отправляйте через `MailManager` (смотрите `pano-plugin-auth-guard` `MagicLoginMail`):

| Член | Сигнатура | Назначение |
|---|---|---|
| `MailManager.sendMail` | `suspend fun sendMail(sqlClient, userId: Long?, mail: Mail, email: String? = null)` | Отрисовать + отправить |
| `Mail.templatePath` | `val templatePath: String` | Путь к вашему шаблону Handlebars (Handlebars = язык HTML-шаблонов с `{{placeholders}}`). Путь указывает внутрь ресурсов вашего jar — смотрите §15 «Чтение ресурса jar» |
| `Mail.subject` | `val subject: String` | Строка темы |
| `Mail.generateParameters` | `suspend fun generateParameters(systemParameters, i18nManager, locale): MailParameters` | Переменные шаблона |

## 11. Консольные команды

У Pano есть интерактивная **консоль** — окно терминала, где выполняется jar платформы. Методы `@Command` позволяют добавить в неё свои команды. Аннотируйте методы `@Command`, затем зарегистрируйте объект, который их содержит.

*Source: `com.panomc.platform.command` (`Command`, `CommandSender`)*

| Член | Сигнатура | Назначение |
|---|---|---|
| `@Command` | `@Command(name, aliases = [], description = "", usage = "")` | Помечает метод-команду |
| форма метода | `(sender: CommandSender)` или `(sender: CommandSender, args: Array<String>)` | Обработчик |
| `PanoPlugin.registerCommands` | `fun registerCommands(obj: Any)` | Зарегистрировать все методы `@Command` на `obj` |
| `PanoPlugin.unRegisterCommands` | `fun unRegisterCommands(obj: Any)` | Убрать их |
| `CommandSender.sendMessage` | `fun sendMessage(message: String)` | Ответить вызывающему |

::: tip Контрольная точка
После регистрации наберите `help` в консоли — имя и описание вашей команды должны быть в списке.
:::

## 12. Журналы активности

Записывайте админские действия, чтобы они появлялись в ленте активности панели. Подкласс `PluginActivityLog` и вставка через хост `DatabaseManager`.

*Source: `com.panomc.platform.db.model.PluginActivityLog`*

| Член | Сигнатура | Назначение |
|---|---|---|
| `PluginActivityLog` | `open class PluginActivityLog(userId: Long, pluginId: String, details: JsonObject = JsonObject())` | Ваша запись журнала |
| вставка | `databaseManager.panelActivityLogDao.add(log, sqlClient)` | Записать её |

Внутри эндпоинта свяжите это так — возьмите SQL-клиент, возьмите хост `DatabaseManager`, затем добавьте ваш журнал:

```kotlin
val sqlClient = getSqlClient()
val databaseManager = applicationContext.getBean(DatabaseManager::class.java)
databaseManager.panelActivityLogDao.add(CreatedShoutLog(userId, pluginId), sqlClient)
```

::: tip Контрольная точка
Запись теперь появляется на странице **Активность** панели.
:::

Панель отрисовывает каждую запись с ключом локализации, выведенным из имени класса (минус `Log`, `UPPER_SNAKE`) под объектом `activity-logs` — `CreatedShoutLog` → `activity-logs.CREATED_SHOUT`. Каждый ключ в `JsonObject` `details`, который вы передаёте, подставляется в соответствующий `{{placeholder}}` в этой строке локализации. Смотрите [Локализация](/ru/addon/localization/).

## 13. Bean-ы хоста

Собственные сервисы Pano — это **bean-ы** (объекты, которые фреймворк создаёт один раз и разделяет), живущие в хост `applicationContext`. Извлекайте любой из них через `applicationContext.getBean(SomeService::class.java)`. Они **не** внедряются в ваши конструкторы — вы всегда извлекаете их вручную (в идеале `by lazy`, смотрите §1).

::: details Деталь реализации Spring (можно пропустить)
Большинство bean-ов ниже (`DatabaseManager`, `PluginDatabaseManager`, `SetupManager`, `AuthProvider`, `ServerManager`, `TokenProvider`, `NotificationManager`, `MailManager`, `LicenseManager`, `ConfigManager`, `PluginManager`) — это классы `@Component`, а `TokenTypeRegistry` — `@Service`, обнаруживаемые через `@ComponentScan("com.panomc.platform")`; только инфраструктурные bean-ы (`Vertx`, `Router`, `WebClient`, `Gson`, `SchemaRepository`, плюс логгер, движок шаблонов, `HttpClient`, `PluginUiManager` и `PluginEventManager`) объявлены через `@Bean` в `com.panomc.platform.SpringConfig`. Вам ничего из этого не нужно, чтобы *использовать* их — `getBean(...)` работает одинаково в любом случае.
:::

| Bean | Используйте для |
|---|---|
| `DatabaseManager` | Общий SQL-клиент, core DAO, `panelActivityLogDao` |
| `PluginDatabaseManager` | Ваши таблицы и миграции |
| `SetupManager` | `isSetupDone()` — вызывайте его первым и пропускайте доступ к базе данных, пока он не вернёт `true` (это «страж настройки» из §1) |
| `AuthProvider` | Проверки разрешений и входа |
| `ServerManager` | Коммуникация с Minecraft-сервером |
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

## 14. Лицензия (премиум-дополнения)

Премиум-дополнения проверяют подписанную лицензию против встроенного во время сборки публичного ключа. Pano только *скачивает* файл лицензии за вас — он **не** проверяет его; ваше дополнение должно проверить подпись само. Это сводка — полная связка, копируемые `PluginLicenseClient`/`LicenseGuard` и поведение при сбое рассмотрены в [Премиум-аддоны и лицензирование](/ru/addon/premium/).

*Source: `com.panomc.platform.license` (`LicenseManager`, `SignedLicense`, `LicenseClaims`, `LicenseRequiredException`)*

| Член | Сигнатура | Назначение |
|---|---|---|
| `PanoPlugin.getLicenseManager` | `(): LicenseManager` | Сервис хоста, который получает JWT |
| `LicenseManager.requireLicense` | `(plugin, resourceId, version)` | Получить (кэшированную) лицензию для вашего дополнения |
| `SignedLicense.verifySignature` | `(publicKey, expectedIssuer)` | Проверить подпись (RS256 = схема подписи с открытым/закрытым ключом) с помощью публичного ключа, который вы поставляете внутри вашего jar |
| `LicenseClaims` | `issuer, platformId, resourceId, userId, version, jarSha256, issuedAtMs, expiresAtMs, keyId, tokenId` | Разобранные claims для перекрёстной проверки |
| `LicenseRequiredException` | `(pluginId, reason, message, cause)` | Бросьте это из `onStart()`, чтобы дополнение отказалось стартовать без действительной лицензии (безопаснее, чем стартовать всё равно) |

## 15. Разное и паттерны

Небольшие утилиты и две повторяющиеся идиомы, которые не являются отдельными API, но заслуживают названия.

| Вещь | Где | Назначение |
|---|---|---|
| Чтение ресурса jar | ваш class loader | Файлы, которые вы упаковываете внутрь вашего jar (шаблоны писем, ключи), читаются через `javaClass.classLoader.getResourceAsStream(path)` (*class loader* — то, что читает файлы, упакованные в jar). Примечание: у `PanoPlugin` нет собственного помощника `getResource`. Смотрите `pano-plugin-auth-guard` `MagicLoginMail` |
| `pluginDataFolder` | `PanoPlugin` | Ваша директория `plugins/<pluginId>/` (загрузки, `config.conf`) |
| `logger` | `PanoPlugin` | Логгер SLF4J, привязанный к классу |

**Фоновые задачи** — планируйте через Vert.x и защищайтесь от наложения через `AtomicBoolean`; отменяйте в `onStop()`/`onDisable()` (смотрите `pano-plugin-market` `MarketPlugin`). В сниппете ниже аргумент `setPeriodic` — в **миллисекундах**, так что `60_000` означает каждые 60 секунд; флаг `AtomicBoolean` не даёт новому запуску начаться, пока предыдущий ещё идёт:

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

Закомментированная строка скрывает хитрую часть — запуск `suspend`-работы из (не-`suspend`) колбэка таймера. Полную, компилирующуюся версию смотрите в `pano-plugin-market` `MarketPlugin`.

**Маскировка секретов** — эндпоинт `GET` конфигурации должен возвращать секретные поля замаскированными (скрытыми). Раскрывайте реальное значение только через *отдельный* эндпоинт, который сначала перепроверяет пароль админа. Два способа сделать эту проверку:

- **Вариант A:** `authProvider.requirePassword(password, context)` — смотрите `pano-plugin-auth-guard` `TwoFactorDisableAPI`.
- **Вариант B:** ручная проверка `databaseManager.userDao.isLoginCorrect(...)` — смотрите `pano-plugin-social-login` `PanelRevealSecretAPI`.

## Куда дальше

- **[Разработка бэкенда](/ru/addon/backend/)** — проработанное руководство Shoutbox, собирающее эти API в компилирующийся код.
- **[Локализация](/ru/addon/localization/)** — ключи локализации для разрешений и журналов активности.
- **[Премиум-аддоны и лицензирование](/ru/addon/premium/)** — полная связка проверки лицензии для группы 14.
- **[Справочник API фронтенда](/ru/addon/api-reference/)** — поверхность `pano.*` и `@panomc/sdk` для UI-половины.
