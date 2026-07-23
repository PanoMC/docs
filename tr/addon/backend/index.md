# Backend Geliştirme

Backend, eklentinizin Kotlin yarısıdır: Pano'nun kendi Java sürecinin içinde çalışan kısım. Veritabanı tablolarınıza, JSON uç noktalarınıza, izinlerinize ve yönetici etkinlik günlüklerinize sahiptir. Bu sayfa, bu dokümanlar boyunca taşıdığımız küçük eklenti olan **Shoutbox'ın backend dilimini** oluşturur; ziyaretçiler ana sayfada en son "shout"ları görür, yöneticiler bunları panelden yayınlar ve kaldırır.

Sona geldiğinizde bir veritabanı tablosu eklemiş, herkese açık bir JSON API sunmuş, bir yönetici uç noktasını bir izinle korumuş ve bir etkinlik günlüğü girdisi yazmış olacaksınız — hepsi derlenen kodla. Derlenebilen her adımdan sonra bir **kontrol noktasında** duruyoruz, böylece her parçanın çalıştığını devam etmeden önce doğrularsınız — dokuz dosya yazıp da 2. dosyadaki bir yazım hatasını ancak 9. dosya başarısız olduğunda keşfetmek yerine.

::: tip Eklentiler kodda plugin'dir
Düz metnin her yerinde **eklenti** deriz, ama kod düzeyindeki adların hepsi `plugin` kelimesini kullanır — `PanoPlugin`, `pluginId`, `PluginConfig` vb. Bu beklenen bir durum; koddaki hiçbir şeyi yeniden adlandırmayın.
:::

## Başlamadan önce

[Başlangıç](/tr/addon/getting-started/) sayfasından, yeniden adlandırılmış ve derlenen bir eklentiniz olmalı — o sayfa ayrıca eklentinizin içinde yaşadığı çalışan Pano örneğini de kurar. **Henüz okumadıysanız lütfen önce [Mimari](/tr/addon/architecture/) sayfasını okuyun**; bu sayfanın tamamı ona yaslanır. Oradan getirmeniz gereken tek fikir, düz kelimelerle:

> **Spring**, Pano'nun sınıflarınızı sizin için oluşturmak üzere kullandığı kütüphanedir, dolayısıyla asla `new` yazmazsınız. **Bağlam** (context), yalnızca Spring'in doldurduğu, hazır nesnelerden oluşan bir kutudur. Pano eklentinize kendi kutusunu verir ve her sınıfınızın birer kopyasını içine bırakır — siz sonra kutudan ihtiyaç duyduğunuz şeyi istersiniz. (Pano'nun kutuya neyin gireceğine nasıl karar verdiği hemen aşağıda açıklanıyor.)

Backend, `src/main/kotlin/com/panomc/plugins/shoutbox/` altında yaşar; paketlere bölünmüştür:

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

İşte bu dosyaların her birinin ne işe yaradığı, düz kelimelerle:

| Dosya | Düz-kelime anlamı | Oluşturulduğu yer |
|---|---|---|
| `ShoutboxPlugin.kt` | eklentinizin ana sınıfı — Pano buradan başlar | Bölüm 1 |
| `event/ SetupEventHandler.kt` | Pano'nun kurulum sihirbazı bittiğinde çalışan kod | Bölüm 1 |
| `config/ ShoutboxConfig.kt` | site sahibinin değiştirmesine izin verilen ayarlar | Bölüm 2 |
| `db/model/ Shout.kt` | tablonuzun bir satırı, bir Kotlin nesnesi olarak | Bölüm 3 |
| `db/dao/ ShoutDao.kt` | sağlamaya söz verdiğiniz veritabanı sorgularının listesi | Bölüm 3 |
| `db/impl/ ShoutDaoImpl.kt` | bu sözleri tutan gerçek SQL | Bölüm 3 |
| `db/migration/ ShoutboxMigration1to2.kt` | tablonun şekline sonradan gelen bir değişiklik | Bölüm 4 |
| `routes/api/ GetShoutsAPI.kt` | JSON döndüren herkese açık bir web adresi | Bölüm 5 |
| `routes/panel/ PanelAddShoutAPI.kt` | yalnızca-yönetici bir web adresi | Bölüm 6 |
| `permission/ ManageShoutboxPermission.kt` | roller için "shoutbox'ı yönetebilir" anahtarı | Bölüm 7 |
| `log/ CreatedShoutLog.kt` | yönetici etkinlik akışında bir satır | Bölüm 8 |

**Bu dosyaları aşağıdaki 1–8. bölümler boyunca tek tek oluşturacaksınız — hepsini şimdi oluşturmayın.** Her bölüm hangi dosya olduğunu söyler.

### Pano sınıflarınızı sizin için nasıl oluşturur

Bu sınıfları asla elle birbirine bağlamazsınız — `new` yok, "bunu kaydet" çağrıları yok. Bütün numara dört düz fikirdir:

- Bir **işaretleme** (annotation), `@` ile başlayan ve bir sınıfın hemen üstünde duran bir etikettir, `@Endpoint` gibi. Bir yorum **değildir** — hem derleyici hem de Pano onu okur.
- **Tarama:** eklentiniz yüklendiğinde Pano paketinizin içine bakar ve bu etiketlerden birini taşıyan her sınıfı bulur — `@Endpoint`, `@Dao`, `@Migration`, `@EventListener` veya `@PermissionDefinition`.
- Bulduğu her biri için Pano **bir örnek** (bir nesne) oluşturur ve onu saklar. Pano tarafından oluşturulan, Pano tarafından saklanan böyle bir nesneye **bean** denir — bu sayfada "bean"in tek anlamı budur: Spring'in sizin için yaptığı bir nesne.
- **Kurucu enjeksiyonu:** sınıflarınızdan biri kurucusunda bean'lerinizden bir başkasını isterse — `class GetShoutsAPI(private val shoutDao: ShoutDao)` — Pano hazır olanı size verir. Bunu bir teslimat servisi gibi düşünün: sipariş formuna (kurucu parametrelerine) malzemeleri listelersiniz ve kapınıza gelirler — alışverişe gitmezsiniz (kurucuyu asla kendiniz çağırmazsınız).

En yaygın çökmeden sizi kurtaran bir şey daha: **iki kutu** vardır.

- **Pano'nun kutusu** (*host bağlamı*) Pano'nun kendi servislerini tutar: `DatabaseManager`, `AuthProvider`, `SetupManager`, `PluginDatabaseManager`.
- **Sizin kutunuz** (*eklenti bağlamı*) yazdığınız sınıfları tutar: uç noktalarınız, DAO'larınız, dinleyicileriniz.

Kurucu enjeksiyonu yalnızca **sizin** kutunuza ulaşır. **Pano'nun** kutusundan bir şey almak için onu elle istersiniz: `applicationContext.getBean(SomeService::class.java)`. Bunu neredeyse her bölümde göreceksiniz.

::: warning Kotlin değişiklikleri asla sıcak değildir — yeniden derleyin ve yeniden başlatın
Bir `.kt` dosyasını düzenlemek tek başına hiçbir şeyi değiştirmez. Kotlin'e her dokunduğunuzda jar'ı yeniden derlemeli, örneğinizin `plugins/` klasörüne kopyalamalı ve **Pano'yu yeniden başlatmalısınız**:

```bash
./gradlew build -Pnoui
cp build/libs/pano-plugin-shoutbox-local-build.jar <your-pano-instance>/plugins/
```

`-Pnoui`, Kotlin üzerinde çalışırken ihtiyaç duymadığınız Svelte arayüzünü yeniden derlemeyi atlar — derlemeyi çok daha hızlı yapar.

Eklentiyi **Panel → Eklentiler**'den devre dışı bırakıp yeniden etkinleştirmek **yeterli değildir**: Pano zaten çalışan Java kodunu değiştiremez, dolayısıyla yeni jar'ı yalnızca tam bir yeniden başlatma yükler. (Teknik neden, isterseniz: Pano'nun PF4J eklenti yükleyicisi zaten yüklenmiş *classloader*'ı tutar ve çalışan bir JVM onu yerinde değiştiremez.) Eklentinizin **Svelte arayüzü**, `bun run dev` altında sıcak yeniden yüklenir — ama **Kotlin asla yüklenmez**. Aşağıdaki her bölüm için bu yeniden-derle-ve-yeniden-başlat adımını aklınızda tutun.
:::

::: tip Kontrol noktası: yüklendi mi?
Yeniden başlatmadan sonra, Pano'nun konsolunu izleyin — eklentinizin yüklendiğini günlüğe kaydetmeli — ve **Panel → Eklentiler**'i açın: **Shoutbox** listelenmiş olmalı. Yukarıdaki `cp` satırındaki jar adı gerçekte derlediğinizle eşleşmiyorsa, `build/libs/` içine bakın — ad, `pluginId`'nizden gelir (onu [Başlangıç](/tr/addon/getting-started/) sayfasında ayarlamıştınız).
:::

## 1. Giriş sınıfı

Her eklentinin `PanoPlugin`'i genişleten bir ana sınıfı vardır. Bizimki `ShoutboxPlugin` (dosya `ShoutboxPlugin.kt`) ve başlangıçta tam olarak tek bir iş yapar: yapılandırmayı ve veritabanını başlatmak — ama **yalnızca Pano'nun kendi kurulum sihirbazı bittikten sonra**.

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

Açıklamadan önce, bu sayfanın her yerinde göreceğiniz üç Kotlin söz dizimi parçası:

- `suspend`, veritabanı veya ağ için — tüm sunucuyu dondurmadan — **beklemesine** izin verilen bir fonksiyonu işaretler. Bu sayfada geçersiz kıldığınız fonksiyonların çoğu — yaşam döngüsü kancaları ve her `handle()` — `suspend` olarak bildirilir, dolayısıyla hiç coroutine kodu yazmasanız bile onu koruyun. (Aşağıda tanışacağınız tek istisna, temel sınıfın `suspend` **olmadan** bildirdiği `getValidationHandler`'dır — her zaman geçersiz kıldığınız fonksiyonun tam imzasıyla eşleşin.)
- `by lazy { ... }`, "bu, gerçekten ilk kullanılana kadar çalıştırılmasın" demektir.
- `getBean(X::class.java)`, "bana Pano'nun hazır X nesnesini ver" demektir — yukarıdan Pano'nun kutusuna (host bağlamı) uzanır.

Yani ilk satır, `private val pluginDatabaseManager by lazy { applicationContext.getBean(PluginDatabaseManager::class.java) }`, şöyle okunur: *Pano'nun veritabanı yöneticisini getir, ama yalnızca ilk ihtiyaç duyduğumda.*

Şimdi sınıfın ne yaptığı, baştan sona:

- `applicationContext.getBean(...)` **host bean'lerine** ulaşır — Pano'nun kendi servisleri (Pano'nun kutusu). `PluginDatabaseManager` ve `SetupManager` kurucularınıza enjekte edilemez, dolayısıyla onları böyle getirirsiniz.
- `onStart()`, eklenti yüklendiğinde çalışır. `startPlugin()`'i çağırır ki o da kurulum henüz bitmediyse erkenden çıkar.
- `PluginConfigManager` bir kez oluşturulur ve **kendi kutunuzda** (`pluginBeanContext`) bir bean olarak kaydedilir. **Bir uç noktada `PluginConfigManager`'ı asla bir kurucu parametresi olarak almayın** — uç noktalarınız oluşturulduğu an henüz mevcut değildir, dolayısıyla onu enjekte etmek çökmeye yol açar. Bölüm 2 nedenini tam olarak açıklar ve yapılandırmayı okumanın güvenli yolunu gösterir.
- `pluginDatabaseManager.initialize(this)` tablolarınızı oluşturur ve bekleyen migrasyonları çalıştırır.

### Kurulum kapısı neden

Birisi eklentinizi, Pano'nun ilk çalıştırma kurulum sihirbazını bitirmeden *önce* kurarsa, henüz bir veritabanı yoktur — `initialize()` başarısız olur. Bu yüzden `startPlugin()` erkenden döner. Kurulum tamamlandığı an işleri kaldığı yerden almak için, eklenti sınıfının yanına küçük bir etkinlik dinleyicisi ekleyin (dosya `event/SetupEventHandler.kt`):

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

Sihirbaz bittiğinde Pano `onSetupFinished()`'ı tetikler, `startPlugin()` yeniden çalışır ve `isInitialized` koruması onu birden fazla kez çağırmayı güvenli kılar.

- O kurucuda `plugin` nereden geliyor? **Kendi eklenti sınıfınız da enjekte edilebilir.** Pano tek `ShoutboxPlugin` örneğini kutunuza koyar, dolayısıyla sınıflarınızdan herhangi biri onu bir kurucu parametresi olarak alabilir — bu dinleyicinin (ve daha sonra panel uç noktasının) ona nasıl eriştiğidir. Yani "neyi enjekte edebilirim?" kuralı şudur: kutunuzdaki her şey — `@Dao`/`@Endpoint`/vb. sınıflarınız, artı eklenti örneğiniz.

Veritabanına dokunan her eklenti tam olarak bu kurulum-kapısı desenine ihtiyaç duyar. Her iki sınıfı da olduğu gibi kopyalayın ve yalnızca sınıf adlarını değiştirin.

::: warning Spring'inkini değil, Pano'nun `@EventListener`'ını kullanın
İşaretleme `com.panomc.platform.api.annotation.EventListener`'dır — Spring'in `org.springframework.context.event.EventListener`'ı **değil**. Aynı basit ada sahiptirler, dolayısıyla yanlış olanı içe aktarmak kolaydır; yaparsanız, etkinlik sistemi dinleyicinizi sessizce hiç çağırmaz.
:::

::: tip `PluginDatabaseManager` vs `DatabaseManager`
İki farklı bean, ikisi de `getBean` ile getirilir:
- **`PluginDatabaseManager`** *sizin* tablolarınızı ve migrasyonlarınızı yönetir — `initialize(plugin)` ve `uninstall(plugin)`.
- **`DatabaseManager`** host'un veritabanı servisidir. Onu paylaşılan SQL istemcisi (`databaseManager.getSqlClient()`) için ve Pano'nun kendi **çekirdek DAO'larına** — kullanıcılar, gönderiler, etkinlik günlükleri, … — ulaşmak için kullanın; onları bunun aracılığıyla hem okur *hem de* yazarsınız (Bölüm 6 `databaseManager.panelActivityLogDao.add(...)` ile bir etkinlik günlüğü girdisi yazar). Pano'nun kendi tablolarıyla bu şekilde çalışmak, tam da `pano-plugin-bans`'ın yaptığı şeydir — o deseni orada arayın.
:::

## 2. Yapılandırma

Site sahibinin ince ayar yapabilmesi gereken ayarlar, `PluginConfig`'i genişleten bir yapılandırma sınıfında yaşar (dosya `config/ShoutboxConfig.kt`):

```kotlin
package com.panomc.plugins.shoutbox.config

import com.panomc.platform.api.config.PluginConfig

class ShoutboxConfig(
    val enabled: Boolean = true,
    val maxShouts: Int = 5
) : PluginConfig()
```

İlk çalıştırmada Pano bu sınıfı bir **yapılandırma dosyası** olarak yazar — HOCON biçiminde, ki JSON'a benzer ama daha az tırnak ve virgülle — `plugins/pano-plugin-shoutbox/config.conf` konumunda, varsayılanlarınızı doldurarak.

::: tip Kontrol noktası: üretilen yapılandırmayı açın
Eklentiniz bir kez yüklendikten sonra (yeniden derle → kopyala → yeniden başlat), `plugins/pano-plugin-shoutbox/config.conf`'u açın. İki anahtarınızı varsayılan değerleriyle görmelisiniz: `enabled`, `true`'ya ve `maxShouts`, `5`'e ayarlı.
:::

### Bir uç noktadan yapılandırma okuma — ve neden bir kurucudan değil

Bölüm 1'deki uyarıyı hatırlayın: `PluginConfigManager`'ı bir kurucuda istemeyin. İşte nedeni, eklentiniz yüklendiğinde ne olduğunun zaman çizelgesi olarak:

```text
addon loads → your @Endpoint objects are created → onStart() runs → PluginConfigManager is registered → (later) a request arrives
```

Uç noktalarınız 2. adımda oluşturulur, ama `PluginConfigManager` 4. adıma kadar kaydedilmez. Yani bir uç noktanın kurucusu onu isteseydi, Pano'nun verecek hiçbir şeyi olmazdı ve `NoSuchBeanDefinitionException` ile çökerdi. Çözüm, onu uç nokta oluşturulduğunda değil, **bir istek gerçekten geldiğinde** (5. adım) getirmektir. İşte bir uç noktanın `handle`'ı içinde bir yapılandırma değerini okumanın eksiksiz, güvenli yolu:

```kotlin
// fetch the config manager only now, at request time — never in the constructor
val configManager = plugin.pluginBeanContext.getBean(PluginConfigManager::class.java)
val config = configManager.config as ShoutboxConfig
val limit = config.maxShouts   // e.g. 5
```

`configManager.config` size türlü (typed) bir `ShoutboxConfig` geri verir. Değişiklikleri diske kaydetmek için, doldurulmuş bir yapılandırma nesnesiyle `configManager.saveConfig(JsonObject.mapFrom(newConfig))` çağırırsınız. Bu tam okuma desenini Bölüm 5'te işe koşacaksınız; orada `GetShoutsAPI`, kaç shout döndüreceğini sınırlamak için `maxShouts`'u kullanır.

Üretilen dosyada tek tek anahtarları bir alanın üstüne `@ConfigComment("…")` koyarak belgeleyebilir ve ilgili anahtarları bir başlık altında `@ConfigSection("…")` ile gruplayabilirsiniz. Daha sonra yapılandırma anahtarları eklemeniz veya yeniden adlandırmanız gerektiğinde, diskteki dosyayı elle düzenlemeyin — Pano'nun bunun için bir `PluginConfigMigration` sınıfı vardır (`@Migration` ile işaretlenmiş). İlk gün buna ihtiyaç duymayacaksınız; zamanı geldiğinde onu [Backend API Referansı](/tr/addon/backend-reference/) sayfasında görün.

## 3. Bir veritabanı tablosu

Bir tablo üç küçük dosyadır:

- bir **model** — tablonun **bir satırını** yansıtan bir Kotlin nesnesi;
- bir **soyut DAO** — **DAO**, *Data Access Object* (Veri Erişim Nesnesi) demektir; "tek işi tek bir tabloyla konuşmak olan sınıf" için kullanılan jargon. İkiye bölünmüştür: yalnızca **metot adlarını** (imzalarını) bir söz olarak **listeleyen**, içinde hiç kod olmayan *soyut* bir sınıf ve…
- bir **impl** — *implementation* (uygulama) kısaltması; söz verilen her metodu gerçek SQL ile dolduran dosya.

Pano, kodunuzun geri kalanına yalnızca soyut DAO'yu (sözü) gösterir; impl onun arkasında gizli kalır.

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

Her model `DBEntity`'yi genişletir, böylece Pano veritabanı satırlarını Kotlin nesnelerinize ve geri dönüştürebilir. Her seferinde kopyalanacak üç alışkanlık:

- sınıfı `open` tutun (böylece Pano onunla çalışabilir),
- her alana bir varsayılan değer verin,
- `id`'yi null olabilir yapın (`Long? = null`) — Pano satırı ekledikten *sonra* `id`'yi sizin için doldurur, dolayısıyla eklemeden önce bir id yoktur.

Pano satırları nesnelere **ada göre** eşler: `message` adlı bir alan `message` adlı bir sütuna, `username` `username`'e ve böyle devam eder. (Meraklıysanız, arka planda Google'ın Gson kütüphanesini kullanır — ama doğru yapmanız gereken tek şey alan adlarıyla sütun adlarının hizalanmasıdır.)

Tablo adı, sınıf adının snake_case hâli artı örneğinizin **tablo önekidir**. Önek, site sahibinin Pano'nun kurulum sihirbazında seçtiği şeydir — varsayılan `pano_`'dur — dolayısıyla varsayılan bir kurulumda `Shout`, `` `pano_shout` `` tablosu olur.

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

- `: Dao<Shout>(Shout::class.java)` kısmını olduğu gibi kopyalayın — bu, Pano'ya bu DAO'nun hangi modele ait olduğunu söyler.
- Her metodun, DAO'nun kendi bağlantısını tutması yerine, bir parametre olarak `sqlClient: SqlClient` aldığına dikkat edin. Bu başta tuhaf görünür ("neden bu şeyi sürekli dolaştırıyorum?"), ama bilinçlidir: *çağıran* taraf, **tek** bir veritabanı bağlantısını birkaç sorgu boyunca geçirebilir — ki işlemler (transaction) daha sonra böyle çalışır. Şimdilik yalnızca parametreyi kabul edin ve onu sorgunuzda kullanın.

### Uygulama (impl)

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
Şimdi altı dosya yazdınız — eklenti sınıfı, etkinlik işleyicisi, yapılandırma, model, DAO ve impl'i. Daha fazla yazmadan önce çalıştıklarını kanıtlayın: yeniden derleyin, jar'ı `plugins/` içine kopyalayın ve Pano'yu yeniden başlatın (sayfanın başındaki yeniden-derle-ve-yeniden-başlat adımı). Sonra şu üçünü de doğrulayın:

- **Panel → Eklentiler**, **Shoutbox**'ı listeliyor.
- `plugins/pano-plugin-shoutbox/config.conf` diskte var.
- veritabanınızda artık bir `pano_shout` tablosu var (veritabanı aracınızla kontrol edin veya `SHOW TABLES;` çalıştırın).

Bunlardan biri eksikse, şimdi düzeltin — burada yakalanan bir yazım hatasını bulmak, beş dosya sonra yakalanan aynı yazım hatasından çok daha kolaydır.
:::

## 4. Şemayı bir migrasyonla geliştirme

::: tip Buna bugün ihtiyacınız yok
Bu bölüm, eklentinizin **sürüm 2**'sini göndermeden yaşamayacağınız bir sorunu çözer. Var olduğunu bilmek için şimdi göz gezdirin, sonra gerçek kurulumlarda zaten canlı olan bir tabloyu değiştirmeniz gerçekten gerektiğinde geri gelin. Bu, Shoutbox'ın ilk derlemenizse, doğrudan Bölüm 5'e atlayabilirsiniz.
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

## 5. Herkese açık bir API uç noktası

Şimdi shout'ları temaya sunun. Herkese açık bir JSON uç noktası `Api`'yi genişletir (dosya `routes/api/GetShoutsAPI.kt`):

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

Ne oluyor:

- `@Endpoint`, rotanın eklenti yüklendiği an kendini kaydetmesini sağlar — hiçbir yerde bir kayıt çağrısı yoktur.
- `ShoutDao` doğrudan kurucuya enjekte edilir, çünkü bu uç noktayla birlikte **sizin kutunuzda** yaşar (bu, sayfanın başındaki kurucu enjeksiyonudur).
- `paths`, URL'yi ve HTTP metodunu listeler. Temel sınıfı, kime izin verildiğine göre seçin: `Api` (herkese açık), `LoggedInApi` (giriş yapmış herhangi bir kullanıcı), `PanelApi` (yöneticiler), `SetupApi` (yalnızca kurulum sırasında).
- `getSqlClient()`, `Api` üzerinde paylaşılan SQL istemcisini size veren bir kolaylıktır.
- **Doğrulanacak bir şey olmasa bile `getValidationHandler`'ı geçersiz kılmalısınız** — boş oluşturucuyu tam olarak gösterildiği gibi döndürün (`ValidationHandlerBuilder.create(schemaRepository).build()`). Bu geçersiz kılmayı silmeyin; derleme buna ihtiyaç duyar. Bölüm 6, onun bir istek gövdesi üzerinde gerçek iş yaptığını gösterir.
- Başarı `Successful(map)`'tir, ki bu `{"result":"ok", …haritanız…}`'a serileştirilir. Başarısız olmak için, bir platform `Error` alt sınıfını (`NotFound`, `BadRequest`, `NoPermission`, …) veya kendinizinkini **fırlatırsınız** (throw); istemciye gönderilen hata kodu, sınıf adının `UPPER_SNAKE` hâlidir.

::: tip Kontrol noktası: ilk uç noktanıza vurun
Ödül budur — JSON'unuzu döndüren size ait bir URL. Yeniden derleyin, kopyalayın, yeniden başlatın, sonra uç noktanızı bir tarayıcıda açın (veya `curl` ile isteyin):

```
http://localhost:8088/api/shoutbox/list
```

`8088` portu, Pano'yu `--dev` ile başlattığınızdaki adrestir; varsayılan bir kurulumda Pano `80` portunu dinler, dolayısıyla bunun yerine `http://localhost/api/shoutbox/list` kullanın. Her hâlükârda şunu görmelisiniz:

```json
{"result":"ok","shouts":[]}
```

**Boş** bir `shouts` listesi — çünkü henüz kimse bir shout yayınlamadı. Bu sayfanın sonunda bir tane yayınlayacaksınız.
:::

**İsteğe bağlı: `maxShouts`'u işe koşun.** Bölüm 2'deki `maxShouts`'u hatırlıyor musunuz? Bu uç nokta, onun ekmeğini kazandığı yerdir. Bölüm 2'deki yapılandırma-okuma desenini kullanarak, listeyi yapılandırılmış sayıyla sınırlayabilirsiniz. Aşağıdaki her API'yi zaten gördünüz; tek ekler `plugin`'i enjekte etmek (eklenti sınıfınız enjekte edilebilir) ve Kotlin'in standart `take(n)`'idir:

```kotlin
// Optional variant of handle(): respect maxShouts.
// For this to compile, also add `private val plugin: ShoutboxPlugin` to the constructor,
// alongside `shoutDao`, so you can reach pluginBeanContext.
val sqlClient = getSqlClient()
val configManager = plugin.pluginBeanContext.getBean(PluginConfigManager::class.java)
val limit = (configManager.config as ShoutboxConfig).maxShouts
return Successful(mapOf("shouts" to shoutDao.getAll(sqlClient).take(limit)))
```

Bu tek değişiklik, yapılandırma sınıfının, istek-anı getirme kuralının ve uç noktanın birbirini pekiştirmesini sağlar — `maxShouts` kullanılmadan durmak yerine.

::: tip Panel yolları `/api/panel/` ile başlar
Panel URL'leri girişte bir kez yeniden yazılır ki bu ilk seferde herkesi şaşırtır. Onu soldan sağa bir eşleme olarak okuyun:

| Panel arayüzü şunu çağırır… | Pano onu şuna yeniden yazar… | Yani Kotlin'de şunu yazarsınız… |
|---|---|---|
| `POST /panel/api/shoutbox` | `/api/panel/shoutbox` | `Path("/api/panel/shoutbox", RouteType.POST)` |

**Pratik kural:** Kotlin'de, bir panel uç noktasının yolunu her zaman `/api/panel/` ile başlatın. Sonraki bölümdeki uç noktanın `/api/panel/shoutbox` kullanmasının nedeni budur.
:::

## 6. Bir panel uç noktası

Bir shout yayınlamak bir yönetici eylemidir, dolayısıyla bu uç nokta, herkese açık olanın yapmadığı üç şeyi yapar: **istek gövdesini doğrular**, **bir izni kontrol eder** ve **bir etkinlik günlüğü girdisi yazar**. Sayfadaki en büyük kod bloğudur — onu okurken bu üç işi sırayla arayın (koddan sonraki üç maddeye eşlenirler).

::: warning Dikkat: bu dosya henüz tek başına derlenmez
`PanelAddShoutAPI`, henüz yazmadığınız iki sınıfa atıfta bulunur — `ManageShoutboxPermission` ve `CreatedShoutLog` — ki bunlar Bölüm 7 ve 8'dir. Üçünü de yazın, **sonra** bir kez derleyin. Bu bölümden hemen sonra derlerseniz, "unresolved reference" hataları bekleyin; bu, eksik iki sınıftan kaynaklanır, bu dosyadaki bir hatadan değil.
:::

Dosya `routes/panel/PanelAddShoutAPI.kt`:

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

Üç yeni işin içinden geçelim:

- **Doğrulama** `Schemas` DSL'ini (`objectSchema()`, `requiredProperty`, `stringSchema()`) artı `RequestPredicate.BODY_REQUIRED`'ı kullanır. Eksik veya bozuk gövdeli bir istek, sizin `handle`'ınız hiç çalışmadan reddedilir.
- **İzin kontrolü:** `authProvider.requirePermission(ManageShoutboxPermission(), context)`, `handle`'ın en ilk satırıdır. Giriş yapmış yöneticide izin yoksa, fırlatır ve istek reddedilir. (`AuthProvider` ve `DatabaseManager` Pano'nun kendi servisleridir, dolayısıyla onları Bölüm 1'deki gibi tam olarak `getBean` ile Pano'nun kutusundan getirirsiniz.)
- **Etkinlik günlüğü:** `databaseManager.panelActivityLogDao.add(CreatedShoutLog(...), sqlClient)`, kimin ne yayınladığını kaydeder, böylece yönetici panelinin etkinlik akışı onu gösterebilir.
- Oradaki bir Kotlin söz dizimi parçası: `getUsernameFromUserId(userId, sqlClient)!!` `!!` ile biter, ki bu "bu değer null değildir — bir şekilde null'sa çök" iddiasında bulunur. Burada güvenlidir, çünkü giriş yapmış bir yöneticinin her zaman bir kullanıcı adı vardır.

## 7. İzin

Dosya `permission/ManageShoutboxPermission.kt`:

```kotlin
package com.panomc.plugins.shoutbox.permission

import com.panomc.platform.annotation.PermissionDefinition
import com.panomc.platform.auth.PanelPermission

@PermissionDefinition
class ManageShoutboxPermission : PanelPermission("fa-bullhorn")
```

`@PermissionDefinition` izni otomatik olarak kaydeder ve kurucudaki dize, panelin izin listesinde onun yanında gösterilen FontAwesome simgesidir.

**İzin düğümü** (permission node) — başka her yerde karşılaştırdığınız dize — sınıf adından bir kuralla türetilir:

1. Sondaki `Permission`'ı düşürün → `ManageShoutbox`.
2. Kelimelere bölün, küçük harfe çevirin, noktalarla birleştirin → `manage.shoutbox`.
3. `pano.plugin.<pluginId>.` ile öne ekleyin → **`pano.plugin.pano-plugin-shoutbox.manage.shoutbox`**.

O düğümü Kotlin'de asla yazmazsınız — `requirePermission`'a `ManageShoutboxPermission()` geçmek yeterlidir. Ama panel sayfalarını ve gezinme bağlantılarını kapılamak (gate) için o tam dizeyi frontend kodunuzda **tekrarlarsınız**. Nerede olduğu için [Arayüz Geliştirme](/tr/addon/frontend/) sayfasına bakın; Kotlin sınıfını yeniden adlandırırsanız, o kopyalanmış dizeyi güncellemeyi unutmayın.

::: tip Kontrol noktası: izni panelde görün
Bir yeniden derleme ve yeniden başlatmadan sonra, **Panel → Roller**'i açın ve bir rolü düzenleyin — bir **megafon** (bullhorn) simgeli yeni bir izin görmelisiniz (kurucudaki `fa-bullhorn` bu). Bir role vererek o rolün üyelerinin shout yayınlamasına izin verin.

İnsanları şaşırtan bir şey: **yöneticiler izin kontrollerini atlar** — bir yönetici hesabı `requirePermission`'ı her zaman geçer, dolayısıyla bir yönetici olarak kendinize hiçbir şey vermeden bile Bölüm 6'nın uç noktasını çağırabilirsiniz. `NO_PERMISSION` reddini gerçekten görmek için, izin verilmemiş **yönetici-olmayan** bir rolle test edin.
:::

## 8. Etkinlik günlüğü

Bir etkinlik günlüğü girdisi, `PluginActivityLog`'u genişleten, ayrıntılardan oluşan bir `JsonObject` taşıyan küçük bir sınıftır (dosya `log/CreatedShoutLog.kt`):

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

Panel her günlük satırını **Etkinlik** sayfasında gösterir. Gösterilecek metni bulmak için, izinlerin düğümlerini türettiği aynı yolla, sınıf adınızdan bir yerelleştirme anahtarı türetir:

1. Sondaki `Log`'u düşürün → `CreatedShout`.
2. `UPPER_SNAKE`'e çevirin → `CREATED_SHOUT`.
3. Yerelleştirme dosyalarınızda bir `activity-logs` nesnesi altında arayın → `activity-logs.CREATED_SHOUT`.

O yerelleştirme dizesi, yukarıda oluşturduğunuz `details` yükünden gelen `{username}` ve `{target}` değerlerini kullanır. Kurulumu [Çeviriler](/tr/addon/localization/) sayfasında ele alınmıştır.

::: warning Yerelleştirme dizesini ekleyene kadar ham bir anahtar göreceksiniz
Yerelleştirme dosyalarınıza `activity-logs.CREATED_SHOUT`'u ekleyene kadar, Etkinlik sayfası bir cümle yerine ham `CREATED_SHOUT` anahtarını gösterir. Bu beklenen bir durum — bir hata değil, yalnızca eksik çeviri.
:::

## Baştan sona deneyin

İşte bu sayfanın vaat ettiği tam döngü — bir veritabanı tablosu, herkese açık bir JSON API'si, korumalı bir yönetici uç noktası ve bir etkinlik günlüğü girdisi, hepsi birlikte çalışıyor. Boş listeyi zaten gördünüz; şimdi bir shout oluşturun ve belirişini izleyin.

1. **Önce:** `http://localhost:8088/api/shoutbox/list`'i açın (veya varsayılan bir kurulumda `80` port biçimini). Hâlâ `{"result":"ok","shouts":[]}` görmelisiniz.
2. **Bir shout yayınlayın:** giriş yapmış bir yönetici olarak, JSON gövdesi `{"message":"Hello Pano!"}` ile `POST /panel/api/shoutbox` gönderin. En kolay yol, [Arayüz Geliştirme](/tr/addon/frontend/) sayfasında oluşturacağınız panel arayüzünden; şimdi hemen yapmak için, o URL'yi tarayıcınızın kimliği doğrulanmış oturumu üzerinden `curl` ile isteyin (uç nokta yönetici oturum çerezinize ihtiyaç duyar, panel arayüzünün daha basit yol olmasının nedeni budur).
3. **Sonra:** `http://localhost:8088/api/shoutbox/list`'i yenileyin — shout'unuz artık JSON'da:

```json
{"result":"ok","shouts":[{"id":1,"message":"Hello Pano!","username":"<you>","date":1700000000000}]}
```

4. **Etkinlik akışı:** **Panel → Etkinlik**'i açın — `CREATED_SHOUT` girdinizi göreceksiniz ([Çeviriler](/tr/addon/localization/) sayfasında yerelleştirme dizesini ekleyene kadar ham anahtar olarak gösterilir).

Dört adım da uyuşuyorsa, Shoutbox'ın backend yarısı bitti.

## Çalışmazsa

Bu sayfanın uyardığı beş hata, tek bir yerde — belirti, neden, çözüm:

| Belirti | Olası neden | Çözüm |
|---|---|---|
| Eklenti **Panel → Eklentiler**'de listelenmemiş | jar `plugins/` içine kopyalanmamış veya Pano yeniden başlatılmamış | yeniden derleyin, jar'ı örneğin `plugins/`'ine `cp` edin ve Pano'yu **yeniden başlatın** |
| Etkinlik dinleyiciniz hiç tetiklenmiyor (kurulum kapısı hiç çalışmıyor) | Pano'nunki yerine Spring'in `@EventListener`'ını içe aktardınız | `com.panomc.platform.api.annotation.EventListener` kullanın |
| Çökme: `NoSuchBeanDefinitionException` | `PluginConfigManager`'ı (veya `onStart`'ta kaydedilen başka bir bean'i) bir kurucu parametresi olarak aldınız | onu bunun yerine istek anında `plugin.pluginBeanContext.getBean(...)` ile getirin (Bölüm 2) |
| İstek `NO_PERMISSION` ile reddedildi | panel uç noktasını çağıran (yönetici-olmayan) role izin verilmemiş | onu **Panel → Roller**'de verin veya bir yönetici olarak test edin (yöneticiler kontrolü atlar) |
| Bir Kotlin düzenlemesi yok sayılıyor gibi | yeniden başlatmak yerine eklentiyi devre dışı bırakıp/etkinleştirdiniz | Kotlin sıcak değildir — yeniden derleyin ve Pano'yu **yeniden başlatın** |

## Backend başka neler yapabilir

Shoutbox, backend yüzeyinin yalnızca bir dilimini kullanır. Daha fazlası mevcut — bunların arasında:

- **Etkinlikler** — girişlere, kayıtlara, hesap silmelerine tepki verin ve kendi eklentiler-arası etkinliklerinizi tetikleyin.
- **Jetonlar ve posta** — imzalı jetonlar çıkarın ve şablonlu e-postalar gönderin (bkz. `pano-plugin-auth-guard`).
- **Bildirimler** — panel ve kullanıcı bildirimleri gönderin.
- **Minecraft sunucu iletişimi** — oyun içi eklentiye mesaj gönderin ve ondan gelen etkinlikleri işleyin.
- **Konsol komutları** ve **dosya yüklemeleri** — CLI komutları kaydedin ve multipart yüklemeleri kabul edin.

## Sırada ne var

- **[Backend API Referansı](/tr/addon/backend-reference/)** — bu eğitimin tam arama eşlikçisi: adıyla her backend genişletme noktası, imzası ve kaynak konumuyla birlikte, böylece platform kaynağını okumadan bir API bulabilirsiniz.
- **[Arayüz Geliştirme](/tr/addon/frontend/)** — az önce yazdığınız uç noktaları çağıran Shoutbox widget'ını ve panel arayüzünü oluşturun.
- **[Çeviriler](/tr/addon/localization/)** — izin etiketlerinizi ve etkinlik günlüğü mesajlarınızı çevirin.
- **[Mimari](/tr/addon/architecture/)** — yükleme yaşam döngüsünü ve iki Spring bağlamını yeniden ziyaret edin.
