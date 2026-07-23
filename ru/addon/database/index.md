# База данных и миграции

**Что даёт вам эта страница:** к концу у вас будет настоящая таблица базы данных для Shoutbox — модель, отражающая одну строку, DAO, перечисляющий ваши запросы, и SQL, который на них отвечает, — плюс паттерн миграции для изменения формы этой таблицы после того, как вы её выпустили.

Таблица — это три небольших файла:

- **модель** — один объект Kotlin, который отражает **одну строку** таблицы;
- **абстрактный DAO** — **DAO** расшифровывается как *Data Access Object*, жаргон для «единственного класса, чья единственная работа — общаться с одной таблицей». Он разбит надвое: *абстрактный* класс, который просто **перечисляет имена методов** (их сигнатуры) как обещание, без кода внутри, и…
- **impl** — сокращение от *implementation* (реализация), файл, который заполняет каждый обещанный метод настоящим SQL.

Pano всегда показывает остальному вашему коду только абстрактный DAO (обещание); impl остаётся скрытым за ним. Помните, что каждая правка бэкенда требует пересборки-и-перезапуска — см. этот шаг в [Обзоре бэкенда](/ru/addon/backend/).

## Модель

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

## Контракт DAO

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

Этот абстрактный `ShoutDao` — тип, который внедряют ваши эндпоинты (см. [Эндпоинты](/ru/addon/endpoints/)), — никогда не impl ниже.

## Реализация

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
Как только у вас на месте класс плагина, конфигурация, модель, DAO и его impl, докажите, что они работают: пересоберите, скопируйте jar в `plugins/` и перезапустите Pano (шаг «пересобрать-и-перезапустить»). Затем подтвердите все три:

- **Панель → Аддоны** перечисляет **Shoutbox**.
- `plugins/pano-plugin-shoutbox/config.conf` существует на диске (см. [Конфигурацию](/ru/addon/configuration/)).
- в вашей базе данных теперь есть таблица `pano_shout` (проверьте своим инструментом для базы данных или выполните `SHOW TABLES;`).

Если чего-то из этого не хватает, исправьте сейчас — опечатку, пойманную здесь, найти гораздо легче, чем ту же опечатку, пойманную после ещё пяти файлов.
:::

## Эволюция схемы через миграцию

::: tip Сегодня это вам не нужно
Этот раздел решает проблему, которой у вас не будет, пока вы не выпустите **версию 2** своего аддона. Пробегитесь по нему сейчас, чтобы знать о его существовании, затем вернитесь, когда действительно понадобится изменить таблицу, которая уже живёт на реальных установках. Если это ваша первая сборка Shoutbox, смело переходите дальше.
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

## Что дальше

- **[Эндпоинты](/ru/addon/endpoints/)** — внедрите этот `ShoutDao` в публичный API и административный эндпоинт панели.
- **[Конфигурация](/ru/addon/configuration/)** — файл конфигурации, который генерируется рядом с вашей таблицей.
- **[Справочник Backend API](/ru/addon/backend-reference/)** — `Dao`, `DBEntity`, `DatabaseMigration` и помощники сопоставления строк по имени.
