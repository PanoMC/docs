# Backend Geliştirme

Backend, eklentinizin Kotlin yarısıdır: Pano'nun kendi Java sürecinin içinde çalışan kısım. Veritabanı tablolarınız, JSON uç noktalarınız (endpoint), izinleriniz ve yönetici etkinlik günlükleriniz ona aittir. Bu sayfa, bu dokümanlar boyunca taşıdığımız küçük eklenti olan **Shoutbox'ın backend dilimini** oluşturur — ziyaretçilerin ana sayfada en son "shout"ları gördüğü, yöneticilerin bunları panelden gönderip kaldırdığı eklenti.

Sayfanın sonunda bir veritabanı tablosu eklemiş, herkese açık bir JSON API'si açığa çıkarmış, bir yönetici uç noktasını bir izinle korumuş ve bir etkinlik-günlüğü girdisi yazmış olacaksınız — hepsi de derlenen kodla.

::: tip Eklentiler kodda plugin'dir
Düz metinde her yerde **eklenti** deriz, ancak kod düzeyindeki adların hepsi `plugin` kelimesini kullanır — `PanoPlugin`, `pluginId`, `PluginConfig` vb. Bu beklenen bir durumdur; koddaki hiçbir şeyi yeniden adlandırmayın.
:::

## Başlamadan önce

[Başlangıç](/tr/addon/getting-started/) sayfasından yeniden adlandırılmış, derlenen bir eklentiniz zaten olmalı ve klasör düzeni ile iki Spring bağlamının anlamlı gelmesi için [Mimari](/tr/addon/architecture/) sayfasını okumuş olmanız yardımcı olur. Backend, `src/main/kotlin/com/panomc/plugins/shoutbox/` altında yaşar ve paketlere bölünmüştür:

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

Bu sınıfları asla elle birbirine bağlamazsınız. Pano eklentinizi yüklediğinde ona yalnızca sizin paket alt ağacınızı tarayan **kendi Spring bağlamını** verir ve `@Endpoint`, `@Dao`, `@Migration`, `@EventListener` ya da `@PermissionDefinition` ile anotasyonlanmış herhangi bir sınıf, yapıcı enjeksiyonuyla (constructor injection) sizin için oluşturulur.

::: warning Kotlin değişiklikleri asla sıcak değildir
Bir `.kt` dosyasını düzenlemek, jar'ı yeniden derleyip örneğinizin `plugins/` klasörüne kopyalayana ve **Pano'yu yeniden başlatana** kadar hiçbir şeyi değiştirmez:

```bash
./gradlew build -Pnoui
cp build/libs/pano-plugin-shoutbox-local-build.jar <your-pano-instance>/plugins/
```

Eklentiyi **Panel → Eklentiler**'den devre dışı bırakıp yeniden etkinleştirmek, yeniden derlenmiş bytecode'u *yüklemez* — PF4J zaten yüklü olan sınıf yükleyicisini (classloader) korur — bu yüzden yeni jar'ı alan şey tam bir Pano yeniden başlatmasıdır. Yalnızca Svelte arayüzü `bun run dev` altında canlıdır. Aşağıdaki örnekler üzerinde çalışırken bunu aklınızda tutun.
:::

## 1. Giriş sınıfı

Her eklentinin `PanoPlugin`'i genişleten tek bir ana sınıfı vardır. Bizimki `ShoutboxPlugin`'dir ve başlangıçta tam olarak bir iş yapar: yapılandırmayı ve veritabanını başlatmak — ama **yalnızca Pano'nun kendi kurulum sihirbazı bittikten sonra**.

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

Yukarıdan aşağıya okuyun:

- `applicationContext.getBean(...)`, **host bean'lerine** ulaşır — Pano'nun kendi servisleri. `PluginDatabaseManager` ve `SetupManager`, yapıcılarınıza enjekte edilemez; onları bu şekilde getirirsiniz. (Bu bölümün sonundaki uyarıya bakın.)
- `onStart()`, eklenti yüklendiğinde çalışır. `startPlugin()`'i çağırır; o da kurulum henüz tamamlanmadıysa erkenden çıkar.
- `PluginConfigManager` bir kez oluşturulur ve **kendi bean bağlamınızda** (`pluginBeanContext`) bir singleton olarak kaydedilir. Onu bir uç noktada yapıcı parametresi olarak **almayın** — `@Endpoint` bean'leriniz, `onStart()` bu singleton'ı kaydetmeden önce, eklenti *yüklenirken* örneklenir, bu yüzden yapıcı enjeksiyonu `NoSuchBeanDefinitionException` ile başarısız olurdu. Bunun yerine onu istek anında, tembel (lazy) olarak getirin: `plugin.pluginBeanContext.getBean(PluginConfigManager::class.java)`.
- `pluginDatabaseManager.initialize(this)`, tablolarınızı oluşturur ve bekleyen migration'ları çalıştırır.

### Kurulum kapısı neden var

Birisi eklentinizi Pano'nun ilk-çalıştırma kurulum sihirbazını bitirmeden *önce* kurarsa, henüz bir veritabanı yoktur — `initialize()` başarısız olurdu. Bu yüzden `startPlugin()` erkenden döner. Kurulum tamamlandığı anda işleri tekrar başlatmak için, plugin sınıfının yanına küçük bir olay dinleyicisi ekleyin:

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

Sihirbaz bittiğinde Pano `onSetupFinished()`'i tetikler, `startPlugin()` tekrar çalışır ve `isInitialized` koruması sayesinde onu birden fazla kez çağırmak güvenlidir. Bu kurulum-kapılama deyimi, veritabanına dokunan her eklenti için kanonik biçimdir — yalnızca sınıf adlarını değiştirerek onu aynen kopyalayın.

::: warning Spring'inkini değil, Pano'nun `@EventListener`'ını kullanın
Anotasyon `com.panomc.platform.api.annotation.EventListener`'dır — Spring'in `org.springframework.context.event.EventListener`'ı **değil**. Aynı basit ada sahip oldukları için yanlış olanı içe aktarmak kolaydır; yaparsanız, olay sistemi dinleyicinizi sessizce hiç çağırmaz.
:::

::: tip `PluginDatabaseManager` ile `DatabaseManager`
İki farklı bean, ikisi de `getBean` ile getirilir:
- **`PluginDatabaseManager`**, *sizin* tablolarınızı ve migration'larınızı yönetir — `initialize(plugin)` ve `uninstall(plugin)`.
- **`DatabaseManager`**, host'un veritabanı servisidir. Onu paylaşılan SQL istemcisi (`databaseManager.getSqlClient()`) ve çekirdek DAO'lar (kullanıcılar, gönderiler, etkinlik günlükleri, …) için kullanın. Pano'nun kendi tablolarını okumak tam olarak `pano-plugin-bans`'ın yaptığı şeydir — bu desen için oraya bakın.
:::

## 2. Yapılandırma

Site sahibinin ayarlayabilmesi gereken ayarlar, `PluginConfig`'i genişleten bir yapılandırma sınıfında yaşar:

```kotlin
package com.panomc.plugins.shoutbox.config

import com.panomc.platform.api.config.PluginConfig

class ShoutboxConfig(
    val enabled: Boolean = true,
    val maxShouts: Int = 5
) : PluginConfig()
```

İlk çalıştırmada Pano bunu, varsayılanlarınızı kullanarak `plugins/pano-plugin-shoutbox/config.conf` konumunda bir HOCON dosyası olarak yazar. 1. adımda kaydettiğiniz `PluginConfigManager`'ı tuttuğunuz herhangi bir yerden, tipli değerleri `configManager.config` ile okur (bu size bir `ShoutboxConfig` verir) ve değişiklikleri `configManager.saveConfig(JsonObject.mapFrom(...))` ile kalıcılaştırırsınız.

Üretilen dosyada tek tek anahtarları bir alandaki `@ConfigComment("…")` ile belgeleyebilir ve ilgili anahtarları bir başlık altında `@ConfigSection("…")` ile gruplayabilirsiniz. Daha sonra anahtar eklemeniz veya yeniden adlandırmanız gerektiğinde, bunu diskteki dosyayı elle düzenleyerek değil, `@Migration` ile anotasyonlanmış bir `PluginConfigMigration(from, to, versionInfo)` sınıfıyla yapın.

## 3. Bir veritabanı tablosu

Bir tablo üç küçük dosyadır: bir **model** (tek bir satır), bir **soyut DAO** (söz verdiğiniz sorgu metotları) ve bir **impl** (SQL).

### Model

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

`DBEntity` bir **soyut sınıftır** (bir anotasyon değil). Satırlar Gson ile modelinize ve modelinizden dönüştürülür, bu yüzden **her alan adı aynı adlı bir sütuna eşlenir**. Tablo adı, snake_case biçimindeki sınıf adı artı örneğinizin tablo önekidir — yani `Shout`, `` `<prefix>shout` `` olur.

### DAO sözleşmesi

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

### Uygulama (implementation)

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

Vurgulanmaya değer üç ayrıntı:

- `@Dao @Lazy @Scope(SCOPE_SINGLETON)` üçlüsü zorunludur — Pano'nun DAO'nuzu bu şekilde keşfeder ve onun tek bir örneğini tutar.
- `init()`, `CREATE TABLE IF NOT EXISTS`'inizin yaşadığı yerdir; eklentinin veritabanı başlatıldığında çalışır. `uninstall()` isteğe bağlıdır ve yalnızca eklenti silindiğinde çalışır.
- `Row.toEntity()` / `RowSet.toEntities()`, sorgu satırlarını doğrudan `Shout` nesnelerine dönüştürür ve `fields.toTableQuery()`, tırnak-içi (backtick) sütun listesini sizin için oluşturur.

Yukarıdaki sütunların `message`, `username`, `date` olduğuna dikkat edin — düz alan adları, ve `date` de SQL tarzı `created_at` yerine camelCase dostudur. Mevcut eklentiler kendi DDL'lerini **modelin alan adlarıyla eşleşen camelCase sütun adlarıyla** yazar, çünkü Gson satır eşlemesinin beklediği budur. Kendi tablolarınız için bu emsali izleyin.

::: danger `onUninstall`, tablolarınızı düşürür
`pluginDatabaseManager.uninstall(this)`, **her DAO'nun `uninstall()`'unu** çalıştırır — ki bu bizim için `DROP TABLE` demektir. Bu, **Devre dışı bırak**'ta değil, panelin **Sil** eyleminde tetiklenir. Devre dışı bırakmak veriyi korur; silmek onu çöpe atar. `uninstall()`'unuzun yalnızca gerçekten size ait olanı kaldırdığından emin olun.
:::

## 4. Şemayı bir migration ile geliştirme

Eklentiniz dünyaya çıktıktan sonra orijinal `CREATE TABLE`'ı değiştiremezsiniz — gerçek kurulumlarda zaten eski yapı vardır. Daha sonra bir sütun eklemek için bir migration yazın:

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

Pano, **eklenti başına bir şema sürümü** izler (`pluginId`'nize göre anahtarlanır). `from`'u depolanmış sürümle eşleşen bir migration çalışır ve sürüm onun `to`'suna yükseltilir — yani `1 → 2`, hâlâ 1. sürümdeki kurulumlarda bir kez çalışır ve bir daha asla. Yeni kurulumlar doğrudan en sona atlar. Daha sonra başka bir değişiklik eklemek için bir `ShoutboxMigration2to3` yazın ve böyle devam edin.

::: warning Satır içi `ALTER TABLE` yerine `@Migration` sınıflarını tercih edin
Bir DAO'nun `init()`'i içine başıboş `ALTER TABLE` ifadeleri eklemek cazip gelir. Yapmayın — bu, şema-sürümü takibini atlar, böylece değişiklik kaydedilmez ve yükseltmede yeniden çalışabilir ya da çakışabilir. 1. sürümden sonraki şema değişiklikleri bir `@Migration` sınıfına aittir.
:::

## 5. Herkese açık bir API uç noktası

Şimdi shout'ları temaya açığa çıkarın. Herkese açık bir JSON uç noktası `Api`'yi genişletir:

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

Neler oluyor:

- `@Endpoint`, eklenti yüklendiği an rotanın kendini kaydetmesini sağlar — hiçbir yerde bir kayıt çağrısı yoktur.
- `ShoutDao` doğrudan yapıcıya enjekte edilir, çünkü o da bu uç noktayla birlikte sizin bean bağlamınızda yaşar.
- `paths`, URL'yi ve HTTP metodunu listeler. Bir taban sınıfı, kimin girmesine izin verildiğine göre seçin: `Api` (herkese açık), `LoggedInApi` (oturum açmış herhangi bir kullanıcı), `PanelApi` (yöneticiler), `SetupApi` (yalnızca kurulum sırasında).
- `getSqlClient()`, `Api` üzerindeki, size paylaşılan SQL istemcisini veren bir kolaylıktır.
- Başarı `Successful(map)`'tir; bu, `{"result":"ok", …haritanız…}`'a serileştirilir. Başarısız olmak için, bir platform `Error` alt sınıfını (`NotFound`, `BadRequest`, `NoPermission`, …) ya da kendinizinkini **fırlatırsınız (throw)**; istemciye gönderilen hata kodu, `UPPER_SNAKE` biçimindeki sınıf adıdır.
- Buradaki `getValidationHandler` boştur, çünkü bir `GET` listesi gövdeye ihtiyaç duymaz. Bir sonraki bölümde onun gerçek iş yaptığını göreceksiniz.

::: tip Panel yolları `/api/panel/` ile başlar
Pano, `/panel/api/*`'yi dahili olarak `/api/*`'ye yeniden yönlendirir, bu yüzden **panel uç noktaları yollarını `/api/panel/...` olarak bildirir** — panel arayüzü `/panel/api/...`'yi çağırsa bile. Aşağıdaki uç noktanın `/api/panel/shoutbox`'ı kullanmasının nedeni budur.
:::

## 6. Bir panel uç noktası

Bir shout göndermek bir yönetici eylemidir, bu yüzden herkese açık uç noktanın ihtiyaç duymadığı üç şeye ihtiyaç duyar: **istek doğrulaması**, bir **izin kontrolü** ve bir **etkinlik-günlüğü girdisi**. Üçü de tek bir uç noktada görünür:

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

Yeni parçaları adım adım geçelim:

- **Doğrulama**, `Schemas` DSL'ini (`objectSchema()`, `requiredProperty`, `stringSchema()`) artı `RequestPredicate.BODY_REQUIRED`'ı kullanır. Eksik veya bozuk gövdeli bir istek, `handle`'ınız hiç çalışmadan önce reddedilir.
- **`authProvider.requirePermission(ManageShoutboxPermission(), context)`**, `handle`'ın ilk satırıdır. Oturum açmış yönetici izne sahip değilse, fırlatır ve istek reddedilir. `AuthProvider` ve `DatabaseManager`'ı host'tan tam da öncesi gibi `getBean` ile getirin.
- **Etkinlik günlüğü**, `databaseManager.panelActivityLogDao.add(CreatedShoutLog(...), sqlClient)` ile yazılır, böylece yönetim panelinin etkinlik akışı kimin ne gönderdiğini gösterir.

Uç nokta, henüz yazmadığımız iki sınıfa atıfta bulunur — `ManageShoutboxPermission` ve `CreatedShoutLog`. Bunlar sonraki iki bölümdür.

## 7. İzin

```kotlin
package com.panomc.plugins.shoutbox.permission

import com.panomc.platform.annotation.PermissionDefinition
import com.panomc.platform.auth.PanelPermission

@PermissionDefinition
class ManageShoutboxPermission : PanelPermission("fa-bullhorn")
```

`@PermissionDefinition`, izni otomatik olarak kaydeder ve yapıcıdaki dize, panelin izin listesinde onun yanında gösterilen FontAwesome ikonudur.

**İzin düğümü** — başka her yerde kontrol ettiğiniz dize — sınıf adından bir kurala göre türetilir:

1. Sondaki `Permission`'ı at → `ManageShoutbox`.
2. Kelimelere böl, küçük harfe çevir, noktalarla birleştir → `manage.shoutbox`.
3. `pano.plugin.<pluginId>.` ile öne ekle → **`pano.plugin.pano-plugin-shoutbox.manage.shoutbox`**.

Bu düğümü Kotlin'de asla yazmazsınız — `requirePermission`'a `ManageShoutboxPermission()` geçmek yeterlidir. Ancak panel sayfalarını ve gezinme bağlantılarını kapılamak için bu tam dizeyi frontend kodunuzda **tekrarlarsınız**. Nerede olduğu için [Arayüz Geliştirme](/tr/addon/frontend/) sayfasına bakın; Kotlin sınıfını yeniden adlandırırsanız, kopyalanmış o dizeyi güncellemeyi unutmayın.

## 8. Etkinlik günlüğü

Bir etkinlik-günlüğü girdisi, `PluginActivityLog`'u genişleten, ayrıntıların bir `JsonObject`'ini taşıyan küçük bir sınıftır:

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

Panel bunu, Etkinlik sayfasında, sınıf adıyla (sondaki `Log` eki atılıp `UPPER_SNAKE` biçiminde) anahtarlanan ve yerelleştirme dosyalarınızda bir `activity-logs` nesnesi altında bulunan bir yerelleştirme dizesi kullanarak render eder — yani `CreatedShoutLog`, `activity-logs.CREATED_SHOUT`'a bakar. O dize, ayrıntı yükündeki `{username}` ve `{target}` değerlerini kullanır. Bunu ayarlamak [Çeviriler](/tr/addon/localization/) sayfasında ele alınır.

## Backend başka neler yapabilir

Shoutbox, backend yüzeyinin yalnızca bir dilimini kullanır. Daha fazlası mevcuttur — bunların arasında:

- **Olaylar** — girişlere, kayıtlara, hesap silmelere tepki verin ve kendi eklentiler-arası olaylarınızı tetikleyin.
- **Token'lar ve e-posta** — imzalı token'lar verin ve şablonlu e-postalar gönderin (bkz. `pano-plugin-auth-guard`).
- **Bildirimler** — panel ve kullanıcı bildirimleri gönderin.
- **Minecraft sunucu iletişimi** — oyun içi eklentiye mesaj gönderin ve ondan gelen olayları işleyin.
- **Konsol komutları** ve **dosya yüklemeleri** — CLI komutları kaydedin ve çok parçalı (multipart) yüklemeleri kabul edin.

## Sırada ne var

- **[Arayüz Geliştirme](/tr/addon/frontend/)** — az önce yazdığınız uç noktaları çağıran Shoutbox widget'ını ve panel arayüzünü oluşturun.
- **[Çeviriler](/tr/addon/localization/)** — izin etiketlerinizi ve etkinlik-günlüğü mesajlarınızı çevirin.
- **[Mimari](/tr/addon/architecture/)** — yükleme yaşam döngüsünü ve iki Spring bağlamını yeniden ziyaret edin.
