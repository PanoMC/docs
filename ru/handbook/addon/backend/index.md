# Бэкенд

Shoutbox загружен, но у него пока нет памяти. На этой странице мы даём ему **таблицу базы данных** для хранения выкриков, **JSON-API**, который может читать главная страница, и **право доступа**, чтобы публиковать могли только доверенные администраторы. Это половина на Kotlin — часть, которая выполняется внутри собственного Java-процесса Pano.

Полный справочник (с полным кодом каждого файла): [Разработка бэкенда](/ru/addon/backend/). Здесь мы покажем ключевые части и сошлёмся туда за остальным.

::: warning Ритм «пересобери-и-перезапусти»
Kotlin никогда не горячий. Каждый раз, закончив шаг ниже, выполните это из папки вашего аддона, затем **перезапустите Pano**:

```sh
./gradlew build -Pnoui
cp build/libs/pano-plugin-shoutbox-local-build.jar ..
```

Отключить/включить аддон в панели **недостаточно** — только полный перезапуск загружает новый Kotlin. Мы будем напоминать об этом на каждой контрольной точке.
:::

## Как Pano находит ваш код

Вы никогда не связываете эти классы вручную — ни `new`, ни вызова «зарегистрируй это». Вы ставите **аннотацию** (метку `@Что-то`) над классом, и когда аддон загружается, Pano сканирует ваш пакет, создаёт по одному экземпляру каждого аннотированного класса и передаёт каждому те другие классы, которые он запросил в своём конструкторе. Эта последняя часть и есть **внедрение зависимостей** (dependency injection): перечислите то, что вам нужно, как параметры конструктора, и Pano это доставит.

Одна тонкость, которую нужно пронести через всю страницу: есть **две коробки**. Ваши собственные классы (эндпоинты, DAO) живут в *вашей* коробке и свободно внедряются друг в друга. Собственные службы Pano (`DatabaseManager`, `SetupManager`, …) живут в *отдельной* коробке — их вы достаёте вручную через `applicationContext.getBean(Service::class.java)`. Полную ментальную модель смотрите в [Архитектуре](/ru/addon/architecture/).

## 1. Класс-точка входа и барьер установки

Ваш главный класс наследуется от `PanoPlugin`. При запуске он делает одну работу: инициализирует конфигурацию и базу данных — но **только после того, как завершился мастер первичной установки Pano** (до этого базы данных нет, и `initialize()` упал бы).

```kotlin
class ShoutboxPlugin : PanoPlugin() {
    private val pluginDatabaseManager by lazy { applicationContext.getBean(PluginDatabaseManager::class.java) }
    private val setupManager by lazy { applicationContext.getBean(SetupManager::class.java) }
    private var isInitialized = false

    override suspend fun onStart() { startPlugin() }

    internal suspend fun startPlugin() {
        if (isInitialized || !setupManager.isSetupDone()) return

        val configManager = PluginConfigManager(this, ShoutboxConfig::class.java)
        pluginBeanContext.beanFactory.registerSingleton(PluginConfigManager::class.java.name, configManager)

        pluginDatabaseManager.initialize(this)   // creates tables, runs pending migrations
        isInitialized = true
    }

    override suspend fun onUninstall() { pluginDatabaseManager.uninstall(this) }
}
```

Если кто-то установит Shoutbox *до* завершения установки, `startPlugin()` рано выходит. Чтобы подхватить его в тот момент, когда установка завершится, добавьте небольшой слушатель событий (`event/SetupEventHandler.kt`), который снова вызывает `plugin.startPlugin()`. Каждому аддону, который трогает базу данных, нужен именно этот шаблон с барьером установки — скопируйте оба класса из [Разработки бэкенда § 1](/ru/addon/backend/#_1-класс-точка-входа) и измените только имена.

::: warning Используйте `@EventListener` из Pano, а не из Spring
Аннотация слушателя событий должна быть `com.panomc.platform.api.annotation.EventListener` — **не** `org.springframework.context.event.EventListener` из Spring. У них одинаковое имя; импортируйте не тот, и ваш слушатель молча никогда не сработает.
:::

## 2. Конфигурация (необязательно, но легко)

Настройки, которые может подкрутить владелец сайта, живут в подклассе `PluginConfig`:

```kotlin
class ShoutboxConfig(
    val enabled: Boolean = true,
    val maxShouts: Int = 5
) : PluginConfig()
```

При первом запуске Pano записывает эти значения по умолчанию в `plugins/pano-plugin-shoutbox/config.conf`. Чтение значения **изнутри эндпоинта** имеет одно правило — доставайте менеджер конфигурации во время запроса, никогда в конструкторе — это объяснено в [Разработке бэкенда § 2](/ru/addon/backend/#_2-конфигурация).

## 3. Таблица базы данных

Таблица — это три маленьких файла:

- **модель** (`Shout.kt`) — один Kotlin-объект, отражающий одну строку;
- **абстрактный DAO** (`ShoutDao.kt`) — список запросов, которые вы обещаете предоставить;
- **реализация** (`ShoutDaoImpl.kt`) — собственно SQL, который выполняет эти обещания.

Модель:

```kotlin
open class Shout(
    val id: Long? = null,
    val message: String = "",
    val username: String = "",
    val date: Long = 0
) : DBEntity()
```

Три привычки, которые нужно повторять каждый раз: держите класс `open`, задавайте каждому полю значение по умолчанию и делайте `id` nullable (Pano заполняет его после вставки). Pano сопоставляет строки объектам **по имени** — полю `message` нужен столбец `message`, включая camelCase.

Контракт DAO перечисляет запросы, которые вы будете использовать:

```kotlin
abstract class ShoutDao : Dao<Shout>(Shout::class.java) {
    abstract suspend fun add(shout: Shout, sqlClient: SqlClient): Long
    abstract suspend fun getAll(sqlClient: SqlClient): List<Shout>
    abstract suspend fun deleteById(id: Long, sqlClient: SqlClient)
}
```

**Реализация** несёт троицу `@Dao @Lazy @Scope(SCOPE_SINGLETON)` и содержит SQL (`CREATE TABLE IF NOT EXISTS`, `INSERT`, `SELECT`, `DELETE`). Это самая шаблонная часть страницы — **скопируйте её как есть** из [Разработки бэкенда § 3](/ru/addon/backend/#_3-таблица-базы-данных) и отредактируйте только SQL-строки. Имя таблицы — это ваш класс в snake_case плюс префикс сайта, так что на установке по умолчанию `Shout` становится таблицей `pano_shout`.

::: danger Удаление сбрасывает вашу таблицу
`onUninstall()` запускает `uninstall()` каждого DAO (`DROP TABLE`). Это срабатывает на действии **Удалить** в панели, а не **Отключить**. Отключение сохраняет данные; удаление их выбрасывает.
:::

::: tip Контрольная точка: соберите один раз и осмотритесь
Пересоберите, скопируйте jar в `plugins/` и **перезапустите Pano**. Затем подтвердите все три пункта:

- **Панель → Аддоны** перечисляет **Shoutbox**.
- Файл `plugins/pano-plugin-shoutbox/config.conf` существует на диске.
- В вашей базе данных теперь есть таблица `pano_shout` (проверьте через `SHOW TABLES;`).

Опечатку, пойманную здесь, найти гораздо легче, чем ту же опечатку после ещё пяти файлов.
:::

### Изменение таблицы позже: миграции

Вы не можете изменить исходный `CREATE TABLE` после того, как реальные установки получили старую форму. Чтобы добавить столбец в **версии 2**, напишите класс `DatabaseMigration` с аннотацией `@Migration`. Вы нигде его не регистрируете — аннотация `@Migration` *и есть* регистрация, а `pluginDatabaseManager.initialize(this)` (из раздела 1) один раз выполняет любую ожидающую миграцию на установках, которые отстают. В первый день это вам не понадобится; полный шаблон — в [Разработке бэкенда § 4](/ru/addon/backend/#_4-эволюция-схемы-через-миграцию).

## 4. Публичный JSON-эндпоинт

Теперь откроем выкрики теме. Публичный эндпоинт наследуется от `Api`, а `ShoutDao` внедряется прямо в конструктор, потому что он живёт в вашей коробке:

```kotlin
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

- `@Endpoint` заставляет маршрут зарегистрироваться сам в тот миг, когда аддон загружается — вызова регистрации нет.
- Базовый класс выбирает, кому разрешён вход: `Api` (публичный), `LoggedInApi` (авторизованные), `PanelApi` (администраторы), `SetupApi` (только установка).
- **Вы обязаны переопределить `getValidationHandler`, даже если проверять нечего** — верните пустой билдер ровно так, как показано. Не удаляйте его; сборке он нужен.
- `Successful(map)` сериализуется в `{"result":"ok", …ваша карта…}`.

::: tip Контрольная точка: обратитесь к своему первому эндпоинту
Пересоберите, скопируйте, перезапустите, затем откройте свой эндпоинт в браузере (или через `curl`):

```
http://localhost:8088/api/shoutbox/list
```

(Порт `8088` — это адрес `--dev` для Pano; на установке по умолчанию используйте `http://localhost/api/shoutbox/list`.) Вы должны увидеть:

```json
{"result":"ok","shouts":[]}
```

**Пустой** список — ещё никто не опубликовал выкрик. Этот пустой массив `shouts` доказывает, что ваша таблица, DAO и эндпоинт согласованы.
:::

## 5. Право доступа

Публикация выкрика должна быть доступна только администраторам. Определите право доступа одним маленьким классом:

```kotlin
@PermissionDefinition
class ManageShoutboxPermission : PanelPermission("fa-bullhorn")
```

`@PermissionDefinition` регистрирует его автоматически; строка — это иконка Font Awesome, показываемая в панели. **Узел права доступа**, который вы будете проверять в других местах, выводится из имени класса по правилу → `pano.plugin.pano-plugin-shoutbox.manage.shoutbox`. Этот узел вы никогда не пишете в Kotlin — достаточно передать `ManageShoutboxPermission()` в `requirePermission` — но вы **будете** повторять эту точную строку в коде фронтенда, так что запомните её.

::: tip Контрольная точка: увидьте право доступа
После пересборки и перезапуска откройте **Панель → Роли** и отредактируйте роль — должно появиться новое право доступа с иконкой **рупора**. Один сюрприз: **администраторы обходят проверки прав доступа**, так что, чтобы на самом деле увидеть отказ `NO_PERMISSION`, вы должны тестировать с ролью не-администратора, которой это право не выдано.
:::

## Публикация выкрика (эндпоинт панели)

Публичный `GET` только читает. Чтобы *опубликовать* выкрик, вы добавляете эндпоинт панели `POST` (`PanelApi`), который валидирует тело, проверяет `ManageShoutboxPermission`, записывает строку и заносит запись в журнал активности. Это самый большой блок кода в бэкенде, поэтому мы не будем перепечатывать его здесь — соберите его из [Разработки бэкенда § 6](/ru/addon/backend/#_6-эндпоинт-панели).

::: tip Пути панели начинаются с `/api/panel/`
UI панели вызывает `POST /panel/api/shoutbox`, но Pano переписывает это, поэтому в Kotlin вы всегда пишете путь как `Path("/api/panel/shoutbox", RouteType.POST)`.
:::

Как только этот эндпоинт существует, опубликуйте в него `{"message":"Hello Pano!"}` от имени администратора и обновите `/api/shoutbox/list` — ваш выкрик теперь в JSON. (Проще всего отправить этот POST из UI панели, который мы соберём следующим.)

## Где мы находимся

У Shoutbox теперь есть таблица, публичный API и право доступа — работающий бэкенд. Пора сделать его видимым: давайте разместим эти выкрики на главной странице.

**Далее: [Фронтенд →](/ru/handbook/addon/frontend/)**
