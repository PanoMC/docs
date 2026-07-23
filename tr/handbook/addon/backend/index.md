# Backend

Shoutbox yüklendi, ama henüz bir hafızası yok. Bu sayfada ona shout'ları saklamak için bir **veritabanı tablosu**, ana sayfanın okuyabileceği bir **JSON API'si** ve yalnızca güvenilir yöneticilerin yayınlayabilmesi için bir **izin** veriyoruz. Bu, Kotlin yarısıdır — Pano'nun kendi Java sürecinin içinde çalışan kısım.

Tam referans (her dosyanın eksiksiz koduyla): [Backend Geliştirme](/tr/addon/backend/). Anahtar parçaları burada gösteriyoruz ve gerisi için oraya bağlantı veriyoruz.

::: warning Yeniden-derle-ve-yeniden-başlat ritmi
Kotlin asla sıcak değildir. Aşağıdaki her adımı bitirdiğinizde, eklenti klasörünüzden şunu çalıştırın, sonra **Pano'yu yeniden başlatın**:

```sh
./gradlew build -Pnoui
cp build/libs/pano-plugin-shoutbox-local-build.jar ..
```

Eklentiyi panelde devre dışı bırakıp etkinleştirmek **yeterli değildir** — yalnızca tam bir yeniden başlatma yeni Kotlin'i yükler. Her kontrol noktasında size hatırlatacağız.
:::

## Pano kodunuzu nasıl bulur

Bu sınıfları elle birbirine bağlamazsınız — ne `new`, ne de "bunu kaydet" çağrısı. Bir sınıfın üstüne bir **annotation** (bir `@BirŞey` etiketi) koyarsınız ve eklenti yüklendiğinde Pano paketinizi tarar, her etiketli sınıftan bir örnek oluşturur ve her birine, kurucusunda istediği diğer sınıfları verir. Bu son kısım **bağımlılık enjeksiyonudur**: ihtiyacınız olanı kurucu parametreleri olarak listeleyin, Pano onu size ulaştırsın.

Tüm sayfa boyunca taşıyacağınız bir incelik: **iki kutu** vardır. Kendi sınıflarınız (uç noktalar, DAO'lar) *sizin* kutunuzda yaşar ve serbestçe birbirlerine enjekte olurlar. Pano'nun kendi servisleri (`DatabaseManager`, `SetupManager`, …) *ayrı* bir kutuda yaşar — onları `applicationContext.getBean(Service::class.java)` ile elle getirirsiniz. Tam zihinsel model için [Mimari](/tr/addon/architecture/) sayfasına bakın.

## 1. Giriş sınıfı ve kurulum kapısı

Ana sınıfınız `PanoPlugin`'i genişletir. Başlangıçta tek bir iş yapar: yapılandırmayı ve veritabanını başlatmak — ama **yalnızca Pano'nun ilk çalıştırma kurulum sihirbazı bittikten sonra** (ondan önce bir veritabanı yoktur ve `initialize()` başarısız olurdu).

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

Birisi Shoutbox'ı kurulumu bitirmeden *önce* kurarsa, `startPlugin()` erkenden çıkar. Kurulum tamamlandığı an işleri kaldığı yerden almak için, `plugin.startPlugin()`'i yeniden çağıran küçük bir etkinlik dinleyicisi (`event/SetupEventHandler.kt`) ekleyin. Veritabanına dokunan her eklenti tam olarak bu kurulum-kapısı desenine ihtiyaç duyar — her iki sınıfı da [Olaylar → kurulum kapısı](/tr/addon/events/#kurulum-kapısı)'ndan kopyalayın ve yalnızca adları değiştirin.

::: warning Spring'inkini değil, Pano'nun `@EventListener`'ını kullanın
Etkinlik dinleyicisinin annotation'ı `com.panomc.platform.api.annotation.EventListener` olmalıdır — Spring'in `org.springframework.context.event.EventListener`'ı **değil**. Aynı adı paylaşırlar; yanlış olanı içe aktarırsanız dinleyiciniz sessizce hiç tetiklenmez.
:::

## 2. Yapılandırma (isteğe bağlı ama kolay)

Site sahibinin ince ayar yapabileceği ayarlar bir `PluginConfig` alt sınıfında yaşar:

```kotlin
class ShoutboxConfig(
    val enabled: Boolean = true,
    val maxShouts: Int = 5
) : PluginConfig()
```

İlk çalıştırmada Pano bu varsayılanları `plugins/pano-plugin-shoutbox/config.conf`'a yazar. **Bir uç noktanın içinden** bir değer okumanın tek bir kuralı vardır — yapılandırma yöneticisini istek anında getirin, asla bir kurucuda değil — bu, [Yapılandırma](/tr/addon/configuration/#bir-uc-noktadan-yapılandırma-okuma-ve-neden-bir-kurucudan-degil)'da açıklanır.

## 3. Bir veritabanı tablosu

Bir tablo üç küçük dosyadır:

- **model** (`Shout.kt`) — bir satırı yansıtan bir Kotlin nesnesi;
- **soyut DAO** (`ShoutDao.kt`) — sağlamaya söz verdiğiniz sorguların listesi;
- **impl** (`ShoutDaoImpl.kt`) — o sözleri tutan asıl SQL.

Model:

```kotlin
open class Shout(
    val id: Long? = null,
    val message: String = "",
    val username: String = "",
    val date: Long = 0
) : DBEntity()
```

Her seferinde kopyalanacak üç alışkanlık: sınıfı `open` tutun, her alana bir varsayılan verin ve `id`'yi nullable yapın (Pano onu ekleme sonrası doldurur). Pano, satırları nesnelere **ada göre** eşler — bir `message` alanı, bir `message` sütununa ihtiyaç duyar, camelCase ve hepsi.

DAO sözleşmesi kullanacağınız sorguları listeler:

```kotlin
abstract class ShoutDao : Dao<Shout>(Shout::class.java) {
    abstract suspend fun add(shout: Shout, sqlClient: SqlClient): Long
    abstract suspend fun getAll(sqlClient: SqlClient): List<Shout>
    abstract suspend fun deleteById(id: Long, sqlClient: SqlClient)
}
```

**impl**, `@Dao @Lazy @Scope(SCOPE_SINGLETON)` üçlüsünü taşır ve SQL'i (`CREATE TABLE IF NOT EXISTS`, `INSERT`, `SELECT`, `DELETE`) tutar. Sayfadaki en fazla boilerplate odur — onu [Veritabanı ve Migrasyonlar](/tr/addon/database/#uygulama-impl)'dan **olduğu gibi kopyalayın** ve yalnızca SQL dizelerini düzenleyin. Tablo adı, sınıfınızın snake_case hâli artı sitenin önekidir, dolayısıyla varsayılan bir kurulumda `Shout`, `pano_shout` tablosu olur.

::: danger Silme tablonuzu düşürür
`onUninstall()`, her DAO'nun `uninstall()`'unu (bir `DROP TABLE`) çalıştırır. Bu, panelin **Disable** değil, **Delete** eyleminde tetiklenir. Devre dışı bırakma veriyi korur; silme onu çöpe atar.
:::

::: tip Kontrol noktası: bir kez derleyin ve etrafa bakın
Yeniden derleyin, jar'ı `plugins/` içine kopyalayın ve **Pano'yu yeniden başlatın**. Sonra üçünü de doğrulayın:

- **Panel → Eklentiler**, **Shoutbox**'ı listeliyor.
- `plugins/pano-plugin-shoutbox/config.conf` diskte var.
- veritabanınızda artık bir `pano_shout` tablosu var (`SHOW TABLES;` ile kontrol edin).

Burada yakalanan bir yazım hatasını bulmak, beş dosya sonra aynı yazım hatasını bulmaktan çok daha kolaydır.
:::

### Tabloyu sonradan değiştirme: migrasyonlar

Gerçek kurulumlar eski şekle sahip olduktan sonra orijinal `CREATE TABLE`'ı değiştiremezsiniz. **Sürüm 2**'de bir sütun eklemek için `@Migration` ile işaretlenmiş bir `DatabaseMigration` sınıfı yazın. Onu hiçbir yere kaydetmezsiniz — `@Migration` annotation'ı kaydın *ta kendisidir* ve `pluginDatabaseManager.initialize(this)` (Bölüm 1'den) geride kalmış kurulumlarda bekleyen her migrasyonu bir kez çalıştırır. İlk gün buna ihtiyacınız olmayacak; tam desen [Veritabanı ve Migrasyonlar](/tr/addon/database/#semayı-bir-migrasyonla-gelistirme)'da.

## 4. Herkese açık bir JSON uç noktası

Şimdi shout'ları temaya açın. Herkese açık bir uç nokta `Api`'yi genişletir ve `ShoutDao`, sizin kutunuzda yaşadığı için doğrudan kurucuya enjekte edilir:

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

- `@Endpoint`, eklenti yüklendiği an route'un kendini kaydetmesini sağlar — bir kayıt çağrısı yoktur.
- Temel sınıf, kimin girebileceğini seçer: `Api` (herkese açık), `LoggedInApi` (giriş yapmış), `PanelApi` (yöneticiler), `SetupApi` (yalnızca kurulum).
- **Doğrulanacak hiçbir şey olmasa bile `getValidationHandler`'ı geçersiz kılmalısınız** — boş oluşturucuyu tam gösterildiği gibi döndürün. Onu silmeyin; derleme buna ihtiyaç duyar.
- `Successful(map)`, `{"result":"ok", …haritanız…}`'a serileştirilir.

::: tip Kontrol noktası: ilk uç noktanıza ulaşın
Yeniden derleyin, kopyalayın, yeniden başlatın, sonra uç noktanızı bir tarayıcıda açın (veya `curl` ile isteyin):

```
http://localhost:8088/api/shoutbox/list
```

(Port `8088`, Pano'nun `--dev` adresidir; varsayılan bir kurulumda `http://localhost/api/shoutbox/list` kullanın.) Şunu görmelisiniz:

```json
{"result":"ok","shouts":[]}
```

**Boş** bir liste — henüz hiç kimse shout yayınlamadı. O boş `shouts` dizisi, tablonuzun, DAO'nuzun ve uç noktanızın hepsinin hizalandığının kanıtıdır.
:::

## 5. Bir izin

Bir shout yayınlamak yalnızca yöneticiye özel olmalıdır. Tek küçük bir sınıfla bir izin tanımlayın:

```kotlin
@PermissionDefinition
class ManageShoutboxPermission : PanelPermission("fa-bullhorn")
```

`@PermissionDefinition` onu otomatik olarak kaydeder; dize, panelde gösterilen Font Awesome simgesidir. Başka yerde kontrol edeceğiniz **izin düğümü**, sınıf adından bir kurala göre türetilir → `pano.plugin.pano-plugin-shoutbox.manage.shoutbox`. O düğümü Kotlin'de asla yazmazsınız — `requirePermission`'a `ManageShoutboxPermission()` geçirmek yeterlidir — ama frontend kodunuzda o tam dizeyi **tekrarlayacaksınız**, o yüzden onu hatırlayın.

::: tip Kontrol noktası: izni görün
Bir yeniden derleme ve yeniden başlatmadan sonra, **Panel → Roller**'i açın ve bir rolü düzenleyin — **bullhorn** (megafon) simgeli yeni bir izin görünmeli. Bir sürpriz: **yöneticiler izin kontrollerini atlar**, dolayısıyla bir `NO_PERMISSION` reddini gerçekten görmek için, o izin verilmemiş yönetici-olmayan bir rolle test etmelisiniz.
:::

## Bir shout yayınlama (panel uç noktası)

Herkese açık `GET` yalnızca okur. Bir shout *yayınlamak* için, gövdeyi doğrulayan, `ManageShoutboxPermission`'ı kontrol eden, satırı yazan ve bir etkinlik günlüğü girdisi kaydeden bir panel `POST` uç noktası (`PanelApi`) eklersiniz. Bu, backend'deki en büyük kod bloğudur, o yüzden onu burada yeniden basmıyoruz — onu [Endpoint'ler](/tr/addon/endpoints/#bir-panel-uc-noktası)'den inşa edin.

::: tip Panel yolları `/api/panel/` ile başlar
Panel arayüzü `POST /panel/api/shoutbox`'ı çağırır, ama Pano onu yeniden yazar, dolayısıyla Kotlin'de yolu her zaman `Path("/api/panel/shoutbox", RouteType.POST)` olarak yazarsınız.
:::

O uç nokta var olduğunda, bir yönetici olarak ona `{"message":"Hello Pano!"}` yayınlayın ve `/api/shoutbox/list`'i yenileyin — shout'unuz artık JSON'da. (O POST'u göndermenin en kolay yolu, birazdan inşa edeceğimiz panel arayüzünden.)

## Nerede olduğumuz

Shoutbox'ın artık bir tablosu, herkese açık bir API'si ve bir izni var — çalışan bir backend. Onu görünür kılma zamanı: o shout'ları ana sayfaya koyalım.

**Sıradaki: [Frontend →](/tr/handbook/addon/frontend/)**
