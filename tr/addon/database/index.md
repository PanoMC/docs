# Veritabanı ve Migrasyonlar

**Bu sayfa size ne verir:** sona geldiğinizde Shoutbox için gerçek bir veritabanı tablonuz olacak — bir satırı yansıtan bir model, sorgularınızı listeleyen bir DAO ve bunları yanıtlayan SQL — artı yayınladıktan sonra o tablonun şeklini değiştirmek için migrasyon deseni.

Bir tablo üç küçük dosyadır:

- bir **model** — tablonun **bir satırını** yansıtan bir Kotlin nesnesi;
- bir **soyut DAO** — **DAO**, *Data Access Object* (Veri Erişim Nesnesi) demektir; "tek işi tek bir tabloyla konuşmak olan sınıf" için kullanılan jargon. İkiye bölünmüştür: yalnızca **metot adlarını** (imzalarını) bir söz olarak **listeleyen**, içinde hiç kod olmayan *soyut* bir sınıf ve…
- bir **impl** — *implementation* (uygulama) kısaltması; söz verilen her metodu gerçek SQL ile dolduran dosya.

Pano, kodunuzun geri kalanına yalnızca soyut DAO'yu (sözü) gösterir; impl onun arkasında gizli kalır. Her backend düzenlemesinin bir yeniden-derle-ve-yeniden-başlat gerektirdiğini unutmayın — o adım için [Backend genel bakışı](/tr/addon/backend/)'na bakın.

## Model

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

Her model `DBEntity`'yi genişletir, böylece Pano veritabanı satırlarını Kotlin nesnelerinize ve geri dönüştürebilir. Her seferinde kopyalanacak üç alışkanlık:

- sınıfı `open` tutun (böylece Pano onunla çalışabilir),
- her alana bir varsayılan değer verin,
- `id`'yi null olabilir yapın (`Long? = null`) — Pano satırı ekledikten *sonra* `id`'yi sizin için doldurur, dolayısıyla eklemeden önce bir id yoktur.

Pano satırları nesnelere **ada göre** eşler: `message` adlı bir alan `message` adlı bir sütuna, `username` `username`'e ve böyle devam eder. (Meraklıysanız, arka planda Google'ın Gson kütüphanesini kullanır — ama doğru yapmanız gereken tek şey alan adlarıyla sütun adlarının hizalanmasıdır.)

Tablo adı, sınıf adının snake_case hâli artı örneğinizin **tablo önekidir**. Önek, site sahibinin Pano'nun kurulum sihirbazında seçtiği şeydir — varsayılan `pano_`'dur — dolayısıyla varsayılan bir kurulumda `Shout`, `` `pano_shout` `` tablosu olur.

## DAO sözleşmesi

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

- `: Dao<Shout>(Shout::class.java)` kısmını olduğu gibi kopyalayın — bu, Pano'ya bu DAO'nun hangi modele ait olduğunu söyler.
- Her metodun, DAO'nun kendi bağlantısını tutması yerine, bir parametre olarak `sqlClient: SqlClient` aldığına dikkat edin. Bu başta tuhaf görünür ("neden bu şeyi sürekli dolaştırıyorum?"), ama bilinçlidir: *çağıran* taraf, **tek** bir veritabanı bağlantısını birkaç sorgu boyunca geçirebilir — ki işlemler (transaction) daha sonra böyle çalışır. Şimdilik yalnızca parametreyi kabul edin ve onu sorgunuzda kullanın.

Bu soyut `ShoutDao`, uç noktalarınızın enjekte ettiği türdür (bkz. [Endpoint'ler](/tr/addon/endpoints/)) — asla aşağıdaki impl değil.

## Uygulama (impl)

Bu dosya, sayfadaki en çok tekrar-koda (boilerplate) sahip olandır. **Olduğu gibi kopyalayın** — asla düzenleyeceğiniz tek kısımlar SQL dizeleri ve metot gövdeleridir.

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

Vurgulamaya değer birkaç şey — ama burada kullanmak için tam olarak anlamanız gereken hiçbir şey yok:

- `@Dao @Lazy @Scope(SCOPE_SINGLETON)` üçlüsü gereklidir — birlikte, Pano'nun DAO'nuzu keşfetme ve onun tek bir örneğini tutma biçimidir. Üçünü de olduğu gibi kopyalayın.
- `init()`, `CREATE TABLE IF NOT EXISTS`'inizin yaşadığı yerdir; eklentinin veritabanı başlatıldığında çalışır. `uninstall()` isteğe bağlıdır ve yalnızca eklenti silindiğinde çalışır.
- Sorgu metotlarında üç Vert.x yardımcısı belirir ve onlar hakkında bilmeniz gereken tek şey şudur: `coAwait()`, "veritabanının yanıtlamasını bekle" demektir; `Tuple.of(a, b)`, SQL'deki `?` yer tutucularını sırayla doldurur; ve `rows.property(MySQLClient.LAST_INSERTED_ID)` az önce eklediğiniz satırın otomatik üretilen `id`'sini verir.
- `Row.toEntity()` / `RowSet.toEntities()` sorgu satırlarını doğrudan `Shout` nesnelerine çevirir ve `fields.toTableQuery()` ters tırnaklı sütun listesini sizin için oluşturur.

Yukarıdaki sütunların `message`, `username`, `date` olduğuna dikkat edin — modelin alanlarıyla **aynı adlar**. Kendi `CREATE TABLE` ifadelerinizi yazarken, her sütun adını Kotlin alan adıyla birebir aynı tutun, **camelCase de dâhil**: model alanınız `createdAt` ise, sütun da `createdAt` olmalı — SQL geleneği olan `created_at` **değil**. Ada göre eşleyen satır eşlemesi buna bağlıdır. Kendi tablolarınız için bu örneği izleyin.

::: danger `onUninstall` tablolarınızı düşürür
`pluginDatabaseManager.uninstall(this)`, **her DAO'nun `uninstall()`'ını** çalıştırır — ki bizim için bu `DROP TABLE` demektir. Bu, panelin **Sil** eyleminde tetiklenir, **Devre dışı bırak**'ta değil. Devre dışı bırakmak veriyi korur; silmek onu atar. `uninstall()`'ınızın yalnızca gerçekten size ait olanı kaldırdığından emin olun.
:::

::: tip Kontrol noktası: bir kez derleyin ve etrafa bakının
Eklenti sınıfı, yapılandırma, model, DAO ve impl'i yerine koyduğunuzda, çalıştıklarını kanıtlayın: yeniden derleyin, jar'ı `plugins/` içine kopyalayın ve Pano'yu yeniden başlatın (yeniden-derle-ve-yeniden-başlat adımı). Sonra şu üçünü de doğrulayın:

- **Panel → Eklentiler**, **Shoutbox**'ı listeliyor.
- `plugins/pano-plugin-shoutbox/config.conf` diskte var (bkz. [Yapılandırma](/tr/addon/configuration/)).
- veritabanınızda artık bir `pano_shout` tablosu var (veritabanı aracınızla kontrol edin veya `SHOW TABLES;` çalıştırın).

Bunlardan biri eksikse, şimdi düzeltin — burada yakalanan bir yazım hatasını bulmak, beş dosya sonra yakalanan aynı yazım hatasından çok daha kolaydır.
:::

## Şemayı bir migrasyonla geliştirme

::: tip Buna bugün ihtiyacınız yok
Bu bölüm, eklentinizin **sürüm 2**'sini göndermeden yaşamayacağınız bir sorunu çözer. Var olduğunu bilmek için şimdi göz gezdirin, sonra gerçek kurulumlarda zaten canlı olan bir tabloyu değiştirmeniz gerçekten gerektiğinde geri gelin. Bu, Shoutbox'ın ilk derlemenizse, doğrudan ileriye atlayabilirsiniz.
:::

Eklentiniz dünyaya çıktıktan sonra orijinal `CREATE TABLE`'ı değiştiremezsiniz — gerçek kurulumlarda zaten eski şekil vardır. Daha sonra bir sütun eklemek için, bir migrasyon yazın (dosya `db/migration/ShoutboxMigration1to2.kt`):

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

O koddaki birkaç şey ileri düzey görünür ama basit bir şey ifade eder:

- `override val handlers: List<suspend (SqlClient) -> Unit>` — `suspend (SqlClient) -> Unit` türü yalnızca "SQL istemcisini alan ve bir şey yapan (ve hiçbir şey döndürmeyen) bir adım" demektir. Yani `handlers`, basitçe bu migrasyonun çalıştırdığı **sıralı adım listesidir**.
- `DatabaseMigration(1, 2, "Add pinned column")` içindeki üç değer, sırayla: bu migrasyonun yükselttiği **kaynak** sürüm (`1`), yükselttiği **hedef** sürüm (`2`) ve kısa, insan tarafından okunabilir bir etiket.

Pano **eklenti başına bir şema sürümü** izler (platform bunu *scheme* olarak yazar, ama olağan terim *schema version* ile aynı anlama gelir). `pluginId`'nizle anahtarlanır — [Başlangıç](/tr/addon/getting-started/) sayfasında seçtiğiniz id. `from`'u kayıtlı sürümle eşleşen bir migrasyon çalışır ve sürüm sonra `to`'suna yükseltilir — yani `1 → 2` bir kez, hâlâ 1. sürümde olan kurulumlarda çalışır ve bir daha asla çalışmaz. Yeni kurulumlar doğrudan en sona atlar. Daha sonra başka bir değişiklik eklemek için, bir `ShoutboxMigration2to3` yazın ve böyle devam edin.

::: warning Satır içi `ALTER TABLE` yerine `@Migration` sınıflarını tercih edin
Bir DAO'nun `init()`'i içine başıboş `ALTER TABLE` ifadeleri eklemek caziptir. Yapmayın — bu, şema-sürüm izlemesini atlar, dolayısıyla değişiklik kaydedilmez ve yükseltmede yeniden çalışabilir veya çakışabilir. 1. sürümden sonraki şema değişiklikleri bir `@Migration` sınıfına aittir.
:::

## Sırada ne var

- **[Endpoint'ler](/tr/addon/endpoints/)** — bu `ShoutDao`'yu herkese açık bir API'ye ve bir yönetici panel uç noktasına enjekte edin.
- **[Yapılandırma](/tr/addon/configuration/)** — tablonuzla birlikte üretilen yapılandırma dosyası.
- **[Backend API Referansı](/tr/addon/backend-reference/)** — adıyla `Dao`, `DBEntity`, `DatabaseMigration` ve satır-eşleme yardımcıları.
