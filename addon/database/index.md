# Database & Migrations

**What this page gives you:** by the end you'll have a real database table for Shoutbox — a model that mirrors one row, a DAO that lists your queries, and the SQL that answers them — plus the migration pattern for changing that table's shape after you've shipped.

A table is three small files:

- a **model** — one Kotlin object that mirrors **one row** of the table;
- an **abstract DAO** — **DAO** stands for *Data Access Object*, jargon for "the one class whose only job is talking to one table." It's split in two: an *abstract* class that just **lists the method names** (their signatures) as a promise, with no code inside, and…
- an **impl** — short for *implementation*, the file that fills in each promised method with real SQL.

Pano only ever shows the abstract DAO (the promise) to the rest of your code; the impl stays hidden behind it. Remember that every backend edit needs a rebuild-and-restart — see the [Backend overview](/addon/backend/) for that step.

## The model

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

Every model extends `DBEntity` so Pano can turn database rows into your Kotlin objects and back. Three habits to copy every time:

- keep the class `open` (so Pano can work with it),
- give every field a default value,
- make `id` nullable (`Long? = null`) — Pano fills `id` in for you *after* it inserts the row, so before insert there is no id.

Pano matches rows to objects **by name**: a field called `message` needs a column called `message`, `username` needs `username`, and so on. (Under the hood it uses Google's Gson library, if you're curious — but all you have to get right is that the field names and column names line up.)

The table name is the class name in snake_case plus your instance's **table prefix**. The prefix is whatever the site owner chose in Pano's setup wizard — the default is `pano_` — so on a default install `Shout` becomes the table `` `pano_shout` ``.

## The DAO contract

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

- Copy the `: Dao<Shout>(Shout::class.java)` part exactly — it tells Pano which model this DAO belongs to.
- Notice every method takes `sqlClient: SqlClient` as a parameter, instead of the DAO holding its own connection. That looks odd at first ("why do I keep passing this thing around?"), but it's deliberate: the *caller* can thread **one** database connection through several queries — which is how transactions work later. For now, just accept the parameter and use it in your query.

This abstract `ShoutDao` is the type your endpoints inject (see [Endpoints](/addon/endpoints/)) — never the impl below.

## The implementation

This file has the most boilerplate here. **Copy it as-is** — the only parts you will ever edit are the SQL strings and the method bodies.

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

A few things worth calling out — but nothing here you must fully understand to use it:

- The `@Dao @Lazy @Scope(SCOPE_SINGLETON)` trio is required — together they are how Pano discovers your DAO and keeps a single instance of it. Copy all three as-is.
- `init()` is where your `CREATE TABLE IF NOT EXISTS` lives; it runs when the addon's database is initialized. `uninstall()` is optional and runs only when the addon is deleted.
- Three Vert.x helpers show up in the query methods, and this is all you need to know about them: `coAwait()` means "wait for the database to answer"; `Tuple.of(a, b)` fills the `?` placeholders in the SQL in order; and `rows.property(MySQLClient.LAST_INSERTED_ID)` gives you the auto-generated `id` of the row you just inserted.
- `Row.toEntity()` / `RowSet.toEntities()` turn query rows straight into `Shout` objects, and `fields.toTableQuery()` builds the backtick-quoted column list for you.

Notice the columns above are `message`, `username`, `date` — the **same names** as the model's fields. When you write your own `CREATE TABLE` statements, keep every column name identical to its Kotlin field name, **camelCase and all**: if your model field is `createdAt`, the column must be `createdAt` too — **not** the SQL convention `created_at`. The name-matching row mapping depends on this. Follow that precedent for your own tables.

::: danger `onUninstall` drops your tables
`pluginDatabaseManager.uninstall(this)` runs **every DAO's `uninstall()`** — which for us means `DROP TABLE`. That fires on the panel's **Delete** action, not on **Disable**. Disabling keeps the data; deleting throws it away. Make sure your `uninstall()` only removes what you truly own.
:::

::: tip Checkpoint: build once and look around
Once you have the plugin class, the config, the model, the DAO, and its impl in place, prove they work: rebuild, copy the jar into `plugins/`, and restart Pano (the rebuild-and-restart step). Then confirm all three of these:

- **Panel → Addons** lists **Shoutbox**.
- `plugins/pano-plugin-shoutbox/config.conf` exists on disk (see [Configuration](/addon/configuration/)).
- your database now has a `pano_shout` table (check with your database tool, or run `SHOW TABLES;`).

If any of these is missing, fix it now — a typo caught here is far easier to find than the same typo caught after five more files.
:::

## Evolving the schema with a migration

::: tip You don't need this today
This section solves a problem you won't have until you ship **version 2** of your addon. Skim it now so you know it exists, then come back when you actually need to change a table that's already live on real installs. If this is your first build of Shoutbox, feel free to skip ahead.
:::

Once your addon is out in the world you can't change the original `CREATE TABLE` — real installs already have the old shape. To add a column later, write a migration (file `db/migration/ShoutboxMigration1to2.kt`):

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

A couple of things in that code look advanced but mean something simple:

- `override val handlers: List<suspend (SqlClient) -> Unit>` — the type `suspend (SqlClient) -> Unit` just means "a step that takes the SQL client and does something (and returns nothing)." So `handlers` is simply the **ordered list of steps** this migration runs.
- The three values in `DatabaseMigration(1, 2, "Add pinned column")` are, in order: the version this migration upgrades **from** (`1`), the version it upgrades **to** (`2`), and a short human-readable label.

Pano tracks a **scheme version per addon** (the platform spells it *scheme*, but it means the same thing as the usual term *schema version*). It's keyed by your `pluginId` — the id you chose in [Getting Started](/addon/getting-started/). A migration whose `from` matches the stored version runs, and the version is then bumped to its `to` — so `1 → 2` runs once, on installs still at version 1, and never again. Fresh installs skip straight to the latest. To add another change later, write a `ShoutboxMigration2to3`, and so on.

::: warning Prefer `@Migration` classes over inline `ALTER TABLE`
It is tempting to add stray `ALTER TABLE` statements inside a DAO's `init()`. Don't — that bypasses the scheme-version tracking, so the change isn't recorded and can re-run or clash on upgrade. Schema changes after version 1 belong in a `@Migration` class.
:::

## Where to next

- **[Endpoints](/addon/endpoints/)** — inject this `ShoutDao` into a public API and an admin panel endpoint.
- **[Configuration](/addon/configuration/)** — the config file that's generated alongside your table.
- **[Backend API Reference](/addon/backend-reference/)** — `Dao`, `DBEntity`, `DatabaseMigration`, and the row-mapping helpers by name.
