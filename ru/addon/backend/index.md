# Разработка бэкенда

Бэкенд — это половина вашего аддона на Kotlin: часть, выполняющаяся внутри собственного Java-процесса Pano. Ей принадлежат ваши таблицы базы данных, ваши JSON-эндпоинты, ваши права доступа и ваши журналы административной активности. Эта страница строит **бэкенд-часть Shoutbox** — небольшого аддона, который мы проносим через всю документацию, где посетители видят последние «выкрики» (shouts) на главной странице, а администраторы публикуют и удаляют их из панели.

К концу вы добавите таблицу базы данных, откроете публичный JSON-API, защитите административный эндпоинт правом доступа и запишете строку в журнал активности — и всё это кодом, который компилируется. Мы останавливаемся на **контрольной точке** после каждого собираемого шага, чтобы вы подтверждали работу каждого куска перед тем, как двигаться дальше, — вместо того чтобы написать девять файлов и только на девятом обнаружить опечатку во втором.

::: tip Аддоны — это плагины в коде
Везде в тексте мы говорим **аддон**, но имена уровня кода все используют слово `plugin` — `PanoPlugin`, `pluginId`, `PluginConfig` и так далее. Так и задумано; ничего в коде не переименовывайте.
:::

## Прежде чем начать

У вас уже должен быть переименованный, собирающийся аддон из [Начала работы](/ru/addon/getting-started/) — та страница также настраивает работающий экземпляр Pano, внутри которого живёт ваш аддон. **Пожалуйста, сначала прочитайте [Архитектуру](/ru/addon/architecture/), если ещё не сделали этого**; вся эта страница опирается на неё. Одна идея, которую вы обязаны унести оттуда, простыми словами:

> **Spring** — это библиотека, которую Pano использует, чтобы создавать ваши классы за вас, так что вы никогда не пишете `new`. **Контекст** — это просто коробка с готовыми объектами, которую Spring наполняет. Pano даёт вашему аддону его собственную коробку и кладёт по одной копии каждого из ваших классов в неё — а вы затем просите у коробки то, что вам нужно. (Как Pano решает, что попадает в коробку, объяснено чуть ниже.)

Бэкенд живёт под `src/main/kotlin/com/panomc/plugins/shoutbox/`, разбитый на пакеты:

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

Вот для чего нужен каждый из этих файлов, простыми словами:

| Файл | Значение простыми словами | Собирается в |
|---|---|---|
| `ShoutboxPlugin.kt` | главный класс вашего аддона — Pano стартует здесь | Раздел 1 |
| `event/ SetupEventHandler.kt` | код, выполняющийся, когда мастер установки Pano завершается | Раздел 1 |
| `config/ ShoutboxConfig.kt` | настройки, которые владельцу сайта разрешено менять | Раздел 2 |
| `db/model/ Shout.kt` | одна строка вашей таблицы как объект Kotlin | Раздел 3 |
| `db/dao/ ShoutDao.kt` | список запросов к базе данных, которые вы обещаете предоставить | Раздел 3 |
| `db/impl/ ShoutDaoImpl.kt` | фактический SQL, выполняющий эти обещания | Раздел 3 |
| `db/migration/ ShoutboxMigration1to2.kt` | более позднее изменение формы таблицы | Раздел 4 |
| `routes/api/ GetShoutsAPI.kt` | публичный веб-адрес, возвращающий JSON | Раздел 5 |
| `routes/panel/ PanelAddShoutAPI.kt` | веб-адрес только для администраторов | Раздел 6 |
| `permission/ ManageShoutboxPermission.kt` | переключатель «может управлять shoutbox» для ролей | Раздел 7 |
| `log/ CreatedShoutLog.kt` | одна строка в ленте административной активности | Раздел 8 |

**Вы будете создавать эти файлы один за другим в разделах 1–8 ниже — не создавайте их все сейчас.** В каждом разделе указано, какой это файл.

### Как Pano строит ваши классы за вас

Вы никогда не связываете эти классы вручную — никаких `new`, никаких вызовов «зарегистрируй это». Весь трюк — это четыре простые идеи:

- **Аннотация** — это метка, которая начинается с `@` и сидит прямо над классом, вроде `@Endpoint`. Это **не** комментарий — и компилятор, и Pano её читают.
- **Сканирование:** когда ваш аддон загружается, Pano просматривает ваш пакет и находит каждый класс, носящий одну из этих меток — `@Endpoint`, `@Dao`, `@Migration`, `@EventListener` или `@PermissionDefinition`.
- Для каждого найденного Pano создаёт **один экземпляр** (один объект) и держит его. Созданный Pano и хранимый Pano объект, как этот, называется **bean** — это всё, что «bean» означает где-либо на этой странице: объект, который Spring сделал для вас.
- **Внедрение через конструктор:** если один из ваших классов просит другой из ваших bean-ов в своём конструкторе — `class GetShoutsAPI(private val shoutDao: ShoutDao)` — Pano передаёт вам готовый. Думайте об этом как о службе доставки: вы перечисляете ингредиенты в бланке заказа (параметры конструктора), и они прибывают к вашей двери — вы не идёте за покупками (вы никогда не вызываете конструктор сами).

Ещё одна вещь, которая избавит вас от самого частого краха: есть **две коробки**.

- **Коробка Pano** (*контекст хоста*) держит собственные сервисы Pano: `DatabaseManager`, `AuthProvider`, `SetupManager`, `PluginDatabaseManager`.
- **Ваша коробка** (*контекст плагина*) держит классы, которые пишете вы: ваши эндпоинты, DAO, слушатели.

Внедрение через конструктор дотягивается только до **вашей** коробки. Чтобы достать что-то из коробки **Pano**, вы просите это вручную: `applicationContext.getBean(SomeService::class.java)`. Вы увидите это почти в каждом разделе.

::: warning Изменения в Kotlin никогда не горячие — пересоберите и перезапустите
Редактирование файла `.kt` само по себе ничего не меняет. Каждый раз, когда вы трогаете Kotlin, вы должны пересобрать jar, скопировать его в папку `plugins/` вашего экземпляра и **перезапустить Pano**:

```bash
./gradlew build -Pnoui
cp build/libs/pano-plugin-shoutbox-local-build.jar <your-pano-instance>/plugins/
```

`-Pnoui` пропускает пересборку UI на Svelte, которая вам не нужна при работе над Kotlin, — это делает сборку намного быстрее.

Отключения и повторного включения аддона из **Панель → Аддоны** **недостаточно**: Pano не может подменить Java-код, который уже работает, поэтому только полный перезапуск загружает новый jar. (Техническая причина, если хотите: загрузчик плагинов PF4J в Pano держит уже загруженный *classloader*, а работающая JVM не может заменить его на месте.) **UI на Svelte** вашего аддона перезагружается на лету под `bun run dev` — но **Kotlin никогда**. Держите этот шаг «пересобрать-и-перезапустить» в уме для каждого раздела ниже.
:::

::: tip Контрольная точка: загрузилось ли?
После перезапуска следите за консолью Pano — она должна залогировать загрузку вашего аддона — и откройте **Панель → Аддоны**: **Shoutbox** должен быть в списке. Если имя jar в строке `cp` выше не совпадает с тем, что вы фактически собрали, загляните в `build/libs/` — имя приходит из вашего `pluginId` (который вы задали ещё в [Начале работы](/ru/addon/getting-started/)).
:::

## 1. Класс-точка входа

У каждого аддона есть один главный класс, расширяющий `PanoPlugin`. Наш — `ShoutboxPlugin` (файл `ShoutboxPlugin.kt`), и при запуске он делает ровно одну работу: инициализирует конфигурацию и базу данных — но **только после того, как завершится собственный мастер установки Pano**.

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

Перед разбором — три кусочка синтаксиса Kotlin, которые вы увидите по всей этой странице:

- `suspend` помечает функцию, которой разрешено **ждать** — базу данных, сеть — не замораживая весь сервер. Большинство функций, которые вы переопределяете на этой странице, — хуки жизненного цикла и каждый `handle()` — объявлены как `suspend`, поэтому сохраняйте его, даже если сами никогда не пишете корутинный код. (Единственное исключение, которое вы встретите ниже, — это `getValidationHandler`, который базовый класс объявляет **без** `suspend`; всегда точно повторяйте сигнатуру той функции, которую переопределяете.)
- `by lazy { ... }` означает «не выполняй это, пока оно впервые не понадобится».
- `getBean(X::class.java)` означает «дай мне готовый объект X от Pano» — он дотягивается в коробку Pano (контекст хоста) сверху.

Итак, первая строка, `private val pluginDatabaseManager by lazy { applicationContext.getBean(PluginDatabaseManager::class.java) }`, читается так: *извлеки менеджер базы данных Pano, но только когда он мне впервые понадобится.*

Теперь что делает класс, сверху вниз:

- `applicationContext.getBean(...)` дотягивается до **bean-ов хоста** — собственных сервисов Pano (это коробка Pano). `PluginDatabaseManager` и `SetupManager` нельзя внедрить в ваши конструкторы, поэтому вы извлекаете их так.
- `onStart()` выполняется, когда аддон загружается. Он вызывает `startPlugin()`, который заранее выходит, если установка ещё не завершена.
- `PluginConfigManager` создаётся один раз и регистрируется как bean **в вашей собственной коробке** (`pluginBeanContext`). **Никогда не берите `PluginConfigManager` как параметр конструктора в эндпоинте** — в момент, когда строятся ваши эндпоинты, он ещё не существует, поэтому его внедрение приведёт к краху. Раздел 2 объясняет, почему именно, и показывает безопасный способ читать конфигурацию.
- `pluginDatabaseManager.initialize(this)` создаёт ваши таблицы и выполняет любые ожидающие миграции.

### Зачем нужна проверка установки

Если кто-то установит ваш аддон *до* того, как завершит мастер первичной установки Pano, базы данных ещё нет — `initialize()` провалился бы. Поэтому `startPlugin()` заранее выходит. Чтобы подхватить всё в тот момент, когда установка завершится, добавьте небольшой слушатель событий рядом с классом плагина (файл `event/SetupEventHandler.kt`):

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

Когда мастер завершается, Pano вызывает `onSetupFinished()`, `startPlugin()` выполняется снова, а защита `isInitialized` делает безопасным вызвать его более одного раза.

- Откуда берётся `plugin` в этом конструкторе? **Ваш собственный класс плагина тоже внедряем.** Pano кладёт единственный экземпляр `ShoutboxPlugin` в вашу коробку, поэтому любой из ваших классов может взять его как параметр конструктора — вот как этот слушатель (и позже эндпоинт панели) получает его. Так что правило «что я могу внедрить?» такое: всё, что в вашей коробке, — ваши классы `@Dao`/`@Endpoint`/и т. д., плюс экземпляр вашего плагина.

Каждому аддону, трогающему базу данных, нужен ровно этот паттерн проверки установки. Скопируйте оба класса как есть и меняйте только имена классов.

::: warning Используйте `@EventListener` от Pano, а не от Spring
Аннотация — это `com.panomc.platform.api.annotation.EventListener` — а **не** `org.springframework.context.event.EventListener` от Spring. У них одинаковое простое имя, поэтому легко импортировать не тот; если так, система событий молча никогда не вызовет ваш слушатель.
:::

::: tip `PluginDatabaseManager` против `DatabaseManager`
Два разных bean-а, оба извлекаются через `getBean`:
- **`PluginDatabaseManager`** управляет *вашими* таблицами и миграциями — `initialize(plugin)` и `uninstall(plugin)`.
- **`DatabaseManager`** — это сервис базы данных хоста. Используйте его для общего SQL-клиента (`databaseManager.getSqlClient()`) и чтобы дотянуться до собственных **основных DAO** Pano — пользователи, посты, журналы активности, … — которые вы через него и читаете, *и* пишете (Раздел 6 пишет строку журнала активности через `databaseManager.panelActivityLogDao.add(...)`). Работа с собственными таблицами Pano именно так — это ровно то, что делает `pano-plugin-bans`; посмотрите там на этот паттерн.
:::

## 2. Конфигурация

Настройки, которые владелец сайта должен иметь возможность подкручивать, живут в классе конфигурации, расширяющем `PluginConfig` (файл `config/ShoutboxConfig.kt`):

```kotlin
package com.panomc.plugins.shoutbox.config

import com.panomc.platform.api.config.PluginConfig

class ShoutboxConfig(
    val enabled: Boolean = true,
    val maxShouts: Int = 5
) : PluginConfig()
```

При первом запуске Pano записывает этот класс как **файл конфигурации** — в формате HOCON, который выглядит как JSON с меньшим числом кавычек и запятых, — по адресу `plugins/pano-plugin-shoutbox/config.conf`, заполняя ваши значения по умолчанию.

::: tip Контрольная точка: откройте сгенерированную конфигурацию
После того как ваш аддон загрузился хотя бы раз (пересборка → копирование → перезапуск), откройте `plugins/pano-plugin-shoutbox/config.conf`. Вы должны увидеть свои два ключа с их значениями по умолчанию: `enabled` установлен в `true`, а `maxShouts` — в `5`.
:::

### Чтение конфигурации из эндпоинта — и почему не из конструктора

Помните предупреждение из Раздела 1: не просите `PluginConfigManager` в конструкторе. Вот причина, как временная шкала того, что происходит при загрузке аддона:

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

`configManager.config` возвращает вам типизированный `ShoutboxConfig`. Чтобы сохранить изменения на диск, вы вызываете `configManager.saveConfig(JsonObject.mapFrom(newConfig))` с заполненным объектом конфигурации. Вы примените этот самый паттерн чтения на практике в Разделе 5, где `GetShoutsAPI` использует `maxShouts`, чтобы ограничить, сколько выкриков он возвращает.

Вы можете документировать отдельные ключи в сгенерированном файле с помощью `@ConfigComment("…")` над полем и группировать связанные ключи под баннером с помощью `@ConfigSection("…")`. Когда позже вам понадобится добавить или переименовать ключи конфигурации, не редактируйте файл на диске вручную — у Pano для этого есть класс `PluginConfigMigration` (аннотированный `@Migration`). В первый день он вам не понадобится; посмотрите на него в [Справочнике Backend API](/ru/addon/backend-reference/), когда придёт время.

## 3. Таблица базы данных

Таблица — это три небольших файла:

- **модель** — один объект Kotlin, который отражает **одну строку** таблицы;
- **абстрактный DAO** — **DAO** расшифровывается как *Data Access Object*, жаргон для «единственного класса, чья единственная работа — общаться с одной таблицей». Он разбит надвое: *абстрактный* класс, который просто **перечисляет имена методов** (их сигнатуры) как обещание, без кода внутри, и…
- **impl** — сокращение от *implementation* (реализация), файл, который заполняет каждый обещанный метод настоящим SQL.

Pano всегда показывает остальному вашему коду только абстрактный DAO (обещание); impl остаётся скрытым за ним.

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

Каждая модель расширяет `DBEntity`, чтобы Pano мог превращать строки базы данных в ваши объекты Kotlin и обратно. Три привычки, которые стоит копировать каждый раз:

- держите класс `open` (чтобы Pano мог с ним работать),
- давайте каждому полю значение по умолчанию,
- делайте `id` nullable (`Long? = null`) — Pano заполняет `id` за вас *после* того, как вставит строку, так что до вставки id нет.

Pano сопоставляет строки объектам **по имени**: полю под названием `message` нужен столбец под названием `message`, `username` нужен `username` и так далее. (Под капотом он использует библиотеку Gson от Google, если вам любопытно, — но всё, что нужно сделать правильно, это чтобы имена полей и имена столбцов совпадали.)

Имя таблицы — это имя класса в snake_case плюс **префикс таблиц** вашего экземпляра. Префикс — это то, что владелец сайта выбрал в мастере установки Pano — по умолчанию `pano_` — так что на установке по умолчанию `Shout` становится таблицей `` `pano_shout` ``.

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

- Копируйте часть `: Dao<Shout>(Shout::class.java)` в точности — она говорит Pano, какой модели принадлежит этот DAO.
- Обратите внимание, что каждый метод принимает `sqlClient: SqlClient` как параметр, вместо того чтобы DAO держал собственное соединение. Сначала это выглядит странно («зачем я постоянно передаю эту штуку по кругу?»), но это сделано намеренно: *вызывающий* может протянуть **одно** соединение с базой данных через несколько запросов — вот как позже работают транзакции. Пока просто принимайте параметр и используйте его в своём запросе.

### Реализация

В этом файле больше всего шаблонного кода на странице. **Копируйте его как есть** — единственные части, которые вы когда-либо будете править, — это SQL-строки и тела методов.

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

Несколько вещей, которые стоит отметить, — но здесь нет ничего, что нужно полностью понять, чтобы это использовать:

- Тройка `@Dao @Lazy @Scope(SCOPE_SINGLETON)` обязательна — вместе они — это то, как Pano обнаруживает ваш DAO и держит его единственный экземпляр. Копируйте все три как есть.
- `init()` — это место, где живёт ваш `CREATE TABLE IF NOT EXISTS`; он выполняется, когда инициализируется база данных аддона. `uninstall()` необязателен и выполняется только тогда, когда аддон удаляется.
- В методах запросов появляются три помощника Vert.x, и вот всё, что нужно о них знать: `coAwait()` означает «дождись, пока база данных ответит»; `Tuple.of(a, b)` заполняет плейсхолдеры `?` в SQL по порядку; а `rows.property(MySQLClient.LAST_INSERTED_ID)` даёт вам автосгенерированный `id` только что вставленной строки.
- `Row.toEntity()` / `RowSet.toEntities()` превращают строки запроса прямо в объекты `Shout`, а `fields.toTableQuery()` строит за вас список столбцов в обратных кавычках.

Обратите внимание, что столбцы выше — `message`, `username`, `date` — это **те же имена**, что и поля модели. Когда вы пишете собственные операторы `CREATE TABLE`, держите имя каждого столбца идентичным имени его поля в Kotlin, **включая camelCase**: если поле вашей модели — `createdAt`, столбец тоже должен быть `createdAt` — **а не** SQL-соглашение `created_at`. Сопоставление строк объектам по имени зависит от этого. Следуйте этому прецеденту для своих таблиц.

::: danger `onUninstall` удаляет ваши таблицы
`pluginDatabaseManager.uninstall(this)` выполняет **`uninstall()` каждого DAO** — что для нас означает `DROP TABLE`. Это срабатывает на действие панели **Удалить**, а не **Отключить**. Отключение сохраняет данные; удаление выбрасывает их. Убедитесь, что ваш `uninstall()` удаляет только то, чем вы действительно владеете.
:::

::: tip Контрольная точка: соберите один раз и осмотритесь
Вы уже написали шесть файлов — класс плагина, обработчик событий, конфигурацию, модель, DAO и его impl. Прежде чем писать что-то ещё, докажите, что они работают: пересоберите, скопируйте jar в `plugins/` и перезапустите Pano (шаг «пересобрать-и-перезапустить» из начала страницы). Затем подтвердите все три:

- **Панель → Аддоны** перечисляет **Shoutbox**.
- `plugins/pano-plugin-shoutbox/config.conf` существует на диске.
- в вашей базе данных теперь есть таблица `pano_shout` (проверьте своим инструментом для базы данных или выполните `SHOW TABLES;`).

Если чего-то из этого не хватает, исправьте сейчас — опечатку, пойманную здесь, найти гораздо легче, чем ту же опечатку, пойманную после ещё пяти файлов.
:::

## 4. Эволюция схемы через миграцию

::: tip Сегодня это вам не нужно
Этот раздел решает проблему, которой у вас не будет, пока вы не выпустите **версию 2** своего аддона. Пробегитесь по нему сейчас, чтобы знать о его существовании, затем вернитесь, когда действительно понадобится изменить таблицу, которая уже живёт на реальных установках. Если это ваша первая сборка Shoutbox, смело переходите сразу к Разделу 5.
:::

Как только ваш аддон вышел в мир, вы не можете изменить исходный `CREATE TABLE` — реальные установки уже имеют старую форму. Чтобы позже добавить столбец, напишите миграцию (файл `db/migration/ShoutboxMigration1to2.kt`):

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

Пара вещей в этом коде выглядит продвинуто, но означает нечто простое:

- `override val handlers: List<suspend (SqlClient) -> Unit>` — тип `suspend (SqlClient) -> Unit` просто означает «шаг, который принимает SQL-клиент и что-то делает (и ничего не возвращает)». Так что `handlers` — это просто **упорядоченный список шагов**, которые выполняет эта миграция.
- Три значения в `DatabaseMigration(1, 2, "Add pinned column")` — это, по порядку: версия, **с** которой эта миграция обновляет (`1`), версия, **до** которой она обновляет (`2`), и короткая человекочитаемая метка.

Pano отслеживает **версию схемы на каждый аддон** (платформа пишет это как *scheme*, но означает то же, что и обычный термин *версия схемы*). Она привязана к вашему `pluginId` — идентификатору, который вы выбрали в [Начале работы](/ru/addon/getting-started/). Миграция, чей `from` совпадает с сохранённой версией, выполняется, и версия затем повышается до её `to` — так что `1 → 2` выполняется один раз, на установках, всё ещё на версии 1, и больше никогда. Свежие установки прыгают сразу до последней. Чтобы позже добавить ещё одно изменение, напишите `ShoutboxMigration2to3` и так далее.

::: warning Предпочитайте классы `@Migration`, а не встроенный `ALTER TABLE`
Соблазнительно добавить случайные операторы `ALTER TABLE` внутрь `init()` какого-нибудь DAO. Не делайте этого — это обходит отслеживание версии схемы, поэтому изменение не записывается и может повторно выполниться или столкнуться при обновлении. Изменения схемы после версии 1 принадлежат классу `@Migration`.
:::

## 5. Публичный API-эндпоинт

Теперь откройте выкрики теме. Публичный JSON-эндпоинт расширяет `Api` (файл `routes/api/GetShoutsAPI.kt`):

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
- `ShoutDao` внедряется прямо в конструктор, потому что он живёт в **вашей коробке** рядом с этим эндпоинтом (это внедрение через конструктор из начала страницы).
- `paths` перечисляет URL и HTTP-метод. Выбирайте базовый класс по тому, кому разрешён вход: `Api` (публичный), `LoggedInApi` (любой вошедший пользователь), `PanelApi` (администраторы), `SetupApi` (только во время установки).
- `getSqlClient()` — это удобство на `Api`, которое передаёт вам общий SQL-клиент.
- **Вы должны переопределить `getValidationHandler`, даже когда валидировать нечего** — верните пустой builder ровно как показано (`ValidationHandlerBuilder.create(schemaRepository).build()`). Не удаляйте это переопределение; сборке оно нужно. Раздел 6 показывает его за настоящей работой над телом запроса.
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

**Необязательно: примените `maxShouts`.** Помните `maxShouts` из Раздела 2? Этот эндпоинт — то место, где он оправдывает своё существование. Используя паттерн чтения конфигурации из Раздела 2, вы можете ограничить список настроенным числом. Каждый API ниже вы уже видели; единственные добавления — это внедрение `plugin` (ваш класс плагина внедряем) и стандартный `take(n)` из Kotlin:

```kotlin
// Optional variant of handle(): respect maxShouts.
// For this to compile, also add `private val plugin: ShoutboxPlugin` to the constructor,
// alongside `shoutDao`, so you can reach pluginBeanContext.
val sqlClient = getSqlClient()
val configManager = plugin.pluginBeanContext.getBean(PluginConfigManager::class.java)
val limit = (configManager.config as ShoutboxConfig).maxShouts
return Successful(mapOf("shouts" to shoutDao.getAll(sqlClient).take(limit)))
```

Это единственное изменение заставляет класс конфигурации, правило извлечения во время запроса и эндпоинт усиливать друг друга — вместо того чтобы `maxShouts` оставался неиспользованным.

::: tip Пути панели начинаются с `/api/panel/`
URL-адреса панели переписываются один раз на входе, что каждого спотыкает в первый раз. Читайте это как отображение, слева направо:

| UI панели вызывает… | Pano переписывает это в… | Значит в Kotlin вы пишете… |
|---|---|---|
| `POST /panel/api/shoutbox` | `/api/panel/shoutbox` | `Path("/api/panel/shoutbox", RouteType.POST)` |

**Правило большого пальца:** в Kotlin всегда начинайте путь эндпоинта панели с `/api/panel/`. Именно поэтому эндпоинт в следующем разделе использует `/api/panel/shoutbox`.
:::

## 6. Эндпоинт панели

Публикация выкрика — административное действие, поэтому этот эндпоинт делает три вещи, которых не делал публичный: он **валидирует тело запроса**, **проверяет право доступа** и **пишет строку в журнал активности**. Это самый большой блок кода на странице — пока читаете его, ищите эти три работы по порядку (они соответствуют трём пунктам под кодом).

::: warning Внимание: этот файл сам по себе пока не скомпилируется
`PanelAddShoutAPI` ссылается на два класса, которые вы ещё не написали, — `ManageShoutboxPermission` и `CreatedShoutLog` — это Разделы 7 и 8. Напишите все три, **затем** соберите один раз. Если вы соберёте сразу после этого раздела, ждите ошибок «unresolved reference»; это два отсутствующих класса, а не ошибка в этом файле.
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
- **Проверка права доступа:** `authProvider.requirePermission(ManageShoutboxPermission(), context)` — самая первая строка `handle`. Если у вошедшего администратора нет права доступа, она бросает исключение, и запрос отклоняется. (`AuthProvider` и `DatabaseManager` — собственные сервисы Pano, поэтому вы извлекаете их из коробки Pano через `getBean`, ровно как в Разделе 1.)
- **Журнал активности:** `databaseManager.panelActivityLogDao.add(CreatedShoutLog(...), sqlClient)` записывает, кто что опубликовал, чтобы лента активности административной панели могла это показать.
- Один кусочек синтаксиса Kotlin там: `getUsernameFromUserId(userId, sqlClient)!!` заканчивается на `!!`, что утверждает «это значение не null — упади, если оно вдруг null». Здесь это безопасно, потому что у вошедшего администратора всегда есть имя пользователя.

## 7. Право доступа

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

Вы никогда не печатаете этот узел в Kotlin — передачи `ManageShoutboxPermission()` в `requirePermission` достаточно. Но вы **действительно** повторяете эту точную строку в своём фронтенд-коде, чтобы закрыть страницы панели и ссылки навигации. См. [Разработку фронтенда](/ru/addon/frontend/) о том, где; если вы переименуете класс Kotlin, не забудьте обновить эту скопированную строку.

::: tip Контрольная точка: увидьте право доступа в панели
После пересборки и перезапуска откройте **Панель → Роли** и отредактируйте роль — вы должны увидеть новое право доступа с иконкой **рупора** (это `fa-bullhorn` из конструктора). Выдайте его роли, чтобы позволить участникам этой роли публиковать выкрики.

Одна вещь, которая удивляет людей: **администраторы обходят проверки прав доступа** — учётная запись администратора всегда проходит `requirePermission`, так что как администратор вы можете вызвать эндпоинт из Раздела 6 даже не выдав себе ничего. Чтобы действительно увидеть отказ `NO_PERMISSION`, тестируйте с ролью **не-администратора**, которой это право доступа *не* выдано.
:::

## 8. Журнал активности

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

Панель показывает каждую строку журнала на своей странице **Активность**. Чтобы найти текст для отображения, она выводит ключ локали из имени вашего класса — тем же способом, каким права доступа выводят свой узел:

1. Отбросьте завершающее `Log` → `CreatedShout`.
2. Преобразуйте в `UPPER_SNAKE` → `CREATED_SHOUT`.
3. Найдите его под объектом `activity-logs` в ваших файлах локалей → `activity-logs.CREATED_SHOUT`.

Эта строка локали использует значения `{username}` и `{target}` из нагрузки `details`, которую вы построили выше. Её настройка описана в [Локализации](/ru/addon/localization/).

::: warning Вы будете видеть сырой ключ, пока не добавите строку локали
Пока вы не добавите `activity-logs.CREATED_SHOUT` в свои файлы локалей, страница Активность показывает сырой ключ `CREATED_SHOUT` вместо предложения. Так и должно быть — это не баг, а лишь отсутствующий перевод.
:::

## Попробуйте от начала до конца

Вот полный цикл, который обещала эта страница, — таблица базы данных, публичный JSON-API, защищённый административный эндпоинт и строка журнала активности, работающие вместе. Вы уже видели пустой список; теперь создайте выкрик и посмотрите, как он появится.

1. **До:** откройте `http://localhost:8088/api/shoutbox/list` (или форму с портом `80` на установке по умолчанию). Вы всё ещё должны видеть `{"result":"ok","shouts":[]}`.
2. **Опубликуйте выкрик:** отправьте `POST /panel/api/shoutbox` с телом JSON `{"message":"Hello Pano!"}` от имени вошедшего администратора. Проще всего — из UI панели, который вы построите в [Разработке фронтенда](/ru/addon/frontend/); чтобы сделать это прямо сейчас, `curl` этот URL через аутентифицированную сессию вашего браузера (эндпоинту нужна ваша админская сессионная кука, поэтому UI панели — более простой путь).
3. **После:** обновите `http://localhost:8088/api/shoutbox/list` — ваш выкрик теперь в JSON:

```json
{"result":"ok","shouts":[{"id":1,"message":"Hello Pano!","username":"<you>","date":1700000000000}]}
```

4. **Лента активности:** откройте **Панель → Активность** — вы увидите свою запись `CREATED_SHOUT` (показанную как сырой ключ, пока вы не добавите строку локали в [Локализации](/ru/addon/localization/)).

Если все четыре шага сходятся, бэкенд-половина Shoutbox готова.

## Если это не работает

Пять сбоев, о которых предупреждает эта страница, в одном месте — симптом, причина, исправление:

| Симптом | Вероятная причина | Исправление |
|---|---|---|
| Аддона нет в **Панель → Аддоны** | jar не был скопирован в `plugins/` или Pano не был перезапущен | пересоберите, `cp` jar в `plugins/` экземпляра и **перезапустите** Pano |
| Ваш слушатель событий никогда не срабатывает (проверка установки никогда не выполняется) | вы импортировали `@EventListener` от Spring вместо Pano | используйте `com.panomc.platform.api.annotation.EventListener` |
| Крах: `NoSuchBeanDefinitionException` | вы взяли `PluginConfigManager` (или другой bean, зарегистрированный в `onStart`) как параметр конструктора | извлекайте его во время запроса через `plugin.pluginBeanContext.getBean(...)` (Раздел 2) |
| Запрос отклонён с `NO_PERMISSION` | роли (не-администратора), вызывающей эндпоинт панели, не выдано право доступа | выдайте его в **Панель → Роли** или тестируйте как администратор (администраторы обходят проверку) |
| Правка в Kotlin как будто игнорируется | вы отключили/включили аддон вместо перезапуска | Kotlin не горячий — пересоберите и **перезапустите** Pano |

## Что ещё может делать бэкенд

Shoutbox использует лишь часть поверхности бэкенда. Доступно больше — среди прочего:

- **События** — реагируйте на входы, регистрации, удаления учётных записей и запускайте собственные межаддонные события.
- **Токены и почта** — выпускайте подписанные токены и отправляйте шаблонные письма (см. `pano-plugin-auth-guard`).
- **Уведомления** — отправляйте уведомления в панель и пользователям.
- **Связь с сервером Minecraft** — отправляйте сообщения в игровой плагин и обрабатывайте события от него.
- **Консольные команды** и **загрузка файлов** — регистрируйте CLI-команды и принимайте multipart-загрузки.

## Что дальше

- **[Справочник Backend API](/ru/addon/backend-reference/)** — полный справочник-компаньон к этому руководству: каждая точка расширения бэкенда по имени, с её сигнатурой и расположением в исходниках, чтобы вы могли найти API, не читая исходники платформы.
- **[Разработка фронтенда](/ru/addon/frontend/)** — постройте виджет Shoutbox и UI панели, которые вызывают только что написанные вами эндпоинты.
- **[Локализация](/ru/addon/localization/)** — переведите ярлыки прав доступа и сообщения журнала активности.
- **[Архитектура](/ru/addon/architecture/)** — вернитесь к жизненному циклу загрузки и двум контекстам Spring.
