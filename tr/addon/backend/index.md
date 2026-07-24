# Backend Geliştirme

**Bu sayfa size ne verir:** eklentinizin Kotlin yarısının haritası — Pano'nun başladığı giriş sınıfı, yaşam döngüsü kancaları ve Pano'nun sınıflarınızı sizin için nasıl bulup inşa ettiği — artı backend'in yapabileceği her şey (endpoint'ler, veritabanı, yapılandırma, olaylar, izinler) için odaklanmış sayfaya bir yön tabelası.

Backend, eklentinizin Kotlin yarısıdır: Pano'nun kendi Java işleminin içinde çalışan kısım. Veritabanı tablolarınıza, JSON endpoint'lerinize, izinlerinize ve yönetici etkinlik günlüklerinize sahiptir. Bu sayfalar **Shoutbox'ın backend dilimini** oluşturur — dokümanlar boyunca taşıdığımız küçük eklenti, ziyaretçilerin ana sayfada en son "shout"ları gördüğü ve yöneticilerin bunları panelden gönderip kaldırdığı.

::: tip Eklentiler kodda plugin'dir
Düz metinde her yerde **eklenti** deriz, ama kod düzeyindeki adların hepsi `plugin` kelimesini kullanır — `PanoPlugin`, `pluginId`, `PluginConfig` vb. Bu beklenen bir durumdur; koddaki hiçbir şeyi yeniden adlandırmayın.
:::

## Başlamadan önce

[Başlangıç](/tr/addon/getting-started/) sayfasından zaten yeniden adlandırılmış, derlenen bir eklentiniz olmalı — o sayfa ayrıca eklentinizin içinde yaşadığı çalışan Pano örneğini de kurar. **Henüz okumadıysanız lütfen önce [Mimari](/tr/addon/architecture/)'yi okuyun**; bütün bu bölüm ona dayanır. Oradan getirmeniz gereken tek fikir, sade sözlerle:

> **Spring**, Pano'nun sınıflarınızı sizin için oluşturmak için kullandığı kütüphanedir, bu yüzden asla `new` yazmazsınız. Bir **bağlam** yalnızca Spring'in doldurduğu hazır nesnelerin bir kutusudur. Pano eklentinize kendi kutusunu verir ve sınıflarınızın her birinin bir kopyasını içine bırakır — sonra ihtiyacınız olan şeyi kutudan istersiniz.

Backend, `src/main/kotlin/com/panomc/plugins/shoutbox/` altında yaşar. İşte her parçanın ne işe yaradığı, sade sözlerle:

- `ShoutboxPlugin.kt` — Pano'nun başladığı giriş sınıfı (bu sayfa).
- `config/` — site sahibinin düzenleyebileceği bir ayarlar dosyası.
- `db/` — veritabanı tablonuz hakkındaki her şey, `model/` (bir satır bir Kotlin nesnesi olarak), `dao/` (sağlamaya söz verdiğiniz sorguların listesi), `impl/` (o sözü yerine getiren gerçek SQL) ve `migration/` (sonraki bir sürümde tablonun şeklini değiştiren adımlar) olarak bölünmüş.
- `routes/` — URL'leriniz, `api/` (herkese açık) ve `panel/` (yalnızca yönetici) olarak bölünmüş.
- `permission/` — bir yönetici özelliğini koruyan bir izin.
- `event/` — platform eylemlerine (kurulumun bitmesi gibi) tepki veren kod.
- `log/` — yönetici etkinlik akışına yazılan bir giriş.

Bu dosyaları teker teker oluşturursunuz; aşağıdaki her odaklanmış sayfa oluşturduğu dosyayı adlandırır — hepsini şimdi oluşturmayın.

## Pano sınıflarınızı sizin için nasıl inşa eder

Bu sınıfları asla elle birbirine bağlamazsınız — `new` yok, "bunu kaydet" çağrıları yok. Tüm hile dört sade fikirdir:

- Bir **açıklama**, `@` ile başlayan ve bir sınıfın hemen üstünde duran bir etikettir, `@Endpoint` gibi. Bir yorum **değildir** — hem derleyici hem de Pano onu okur.
- **Tarama:** eklentiniz yüklendiğinde, Pano paketinize bakar ve bu etiketlerden birini taşıyan her sınıfı bulur — `@Endpoint`, `@Dao`, `@Migration`, `@EventListener` veya `@PermissionDefinition`.
- Bulduğu her biri için, Pano **bir örnek** (bir nesne) oluşturur ve onu tutar. Bunun gibi Pano tarafından oluşturulan, Pano tarafından tutulan bir nesneye **bean** denir — bu dokümanlarda "bean"in her yerdeki anlamı budur: Spring'in sizin için yaptığı bir nesne.
- **Kurucu enjeksiyonu:** sınıflarınızdan biri kurucusunda başka bir bean'inizi isterse — `class GetShoutsAPI(private val shoutDao: ShoutDao)` — Pano size hazır olanı verir. Bunu bir teslimat servisi gibi düşünün: malzemeleri sipariş formuna listelersiniz (kurucu parametreleri) ve onlar kapınıza gelir — kurucuyu asla kendiniz çağırmazsınız.

En yaygın çökmeden sizi kurtaran bir şey daha: **iki kutu** vardır.

- **Pano'nun kutusu** (*host bağlamı*) Pano'nun kendi servislerini tutar: `DatabaseManager`, `AuthProvider`, `SetupManager`, `PluginDatabaseManager`.
- **Sizin kutunuz** (*eklenti bağlamı*) yazdığınız sınıfları tutar: endpoint'leriniz, DAO'larınız, dinleyicileriniz.

Kurucu enjeksiyonu yalnızca **sizin** kutunuza ulaşır. **Pano'nun** kutusundan bir şey almak için onu elle istersiniz: `applicationContext.getBean(SomeService::class.java)`. Bunu neredeyse her sayfada göreceksiniz.

::: warning Kotlin değişiklikleri asla sıcak değildir — yeniden derleyin ve yeniden başlatın
Bir `.kt` dosyasını düzenlemek kendi başına hiçbir şeyi değiştirmez. Kotlin'e her dokunuşunuzda jar'ı yeniden derlemeli, örneğinizin `plugins/` klasörüne kopyalamalı ve **Pano'yu yeniden başlatmalısınız**:

```bash
./gradlew build -Pnoui
cp build/libs/pano-plugin-shoutbox-local-build.jar <your-pano-instance>/plugins/
```

`-Pnoui`, Kotlin üzerinde çalışırken ihtiyaç duymadığınız Svelte arayüzünü yeniden derlemeyi atlar — derlemeyi çok daha hızlı yapar.

Eklentiyi **Panel → Eklentiler**'den devre dışı bırakıp yeniden etkinleştirmek **yeterli değildir**: Pano zaten çalışan Java kodunu değiştiremez, bu yüzden yalnızca tam bir yeniden başlatma yeni jar'ı yükler. (Teknik neden: Pano'nun PF4J eklenti yükleyicisi zaten yüklenmiş *classloader*'ı tutar ve çalışan bir JVM onu yerinde değiştiremez.) Eklentinizin **Svelte arayüzü** `bun run dev` altında sıcak yeniden yükler — ama **Kotlin asla yüklemez**. Aşağıdaki her sayfa için bu yeniden-derle-ve-yeniden-başlat adımını aklınızda tutun.
:::

## Giriş sınıfı

Her eklentinin `PanoPlugin`'i genişleten bir ana sınıfı vardır. Bizimki `ShoutboxPlugin`'dir (dosya `ShoutboxPlugin.kt`) ve başlangıçta tam olarak bir iş yapar: yapılandırmayı ve veritabanını başlatmak — ama **yalnızca Pano'nun kendi kurulum sihirbazı bittikten sonra**.

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

Bu sayfalarda her yerde göreceğiniz üç Kotlin söz dizimi parçası:

- `suspend`, bütün sunucuyu dondurmadan — veritabanı, ağ için — **beklemesine** izin verilen bir fonksiyonu işaretler. Geçersiz kıldığınız çoğu fonksiyon `suspend` olarak bildirilir, bu yüzden kendiniz hiç coroutine kodu yazmasanız bile onu tutun. (Karşılaşacağınız tek istisna `getValidationHandler`'dır; temel sınıf onu `suspend` **olmadan** bildirir — geçersiz kıldığınız fonksiyonun tam imzasıyla her zaman eşleşin.)
- `by lazy { ... }`, "bunu gerçekten kullanılana kadar çalıştırma" anlamına gelir.
- `getBean(X::class.java)`, "bana Pano'nun hazır X nesnesini ver" anlamına gelir — yukarıdan Pano'nun kutusuna (host bağlamı) ulaşır. `PluginDatabaseManager` ve `SetupManager` kurucularınıza enjekte edilemez, bu yüzden onları böyle getirirsiniz.

Sınıfın ne yaptığı, yukarıdan aşağıya:

- `onStart()`, eklenti yüklendiğinde çalışır ve `startPlugin()`'i çağırır.
- `PluginConfigManager` bir kez oluşturulur ve **kendi kutunuzda** (`pluginBeanContext`) bir bean olarak kaydedilir. **`PluginConfigManager`'ı bir endpoint'te kurucu parametresi olarak asla almayın** — endpoint'leriniz inşa edildiği anda henüz mevcut değildir, bu yüzden onu enjekte etmek çökertir. [Yapılandırma](/tr/addon/configuration/) tam olarak nedenini açıklar ve yapılandırmayı okumanın güvenli yolunu gösterir.
- `pluginDatabaseManager.initialize(this)` tablolarınızı oluşturur ve bekleyen migration'ları çalıştırır.

**Neden erken dönüş?** Birisi eklentinizi Pano'nun ilk kurulum sihirbazını bitirmeden *önce* kurarsa, henüz bir veritabanı yoktur — `initialize()` başarısız olurdu. Bu yüzden `startPlugin()` erken döner ve küçük bir olay dinleyicisi kurulum tamamlanır tamamlanmaz onu yeniden çalıştırır. O kurulum-kapısı dinleyicisi ve platform eylemlerine tepki vermekle ilgili her şey [Olaylar](/tr/addon/events/)'da yaşar.

::: tip `PluginDatabaseManager` vs `DatabaseManager`
İki farklı bean, ikisi de `getBean` ile getirilir:
- **`PluginDatabaseManager`** *sizin* tablolarınızı ve migration'larınızı yönetir — `initialize(plugin)` ve `uninstall(plugin)`.
- **`DatabaseManager`** host'un veritabanı servisidir. Onu paylaşılan SQL istemcisi (`databaseManager.getSqlClient()`) için ve Pano'nun kendi yerleşik tablolarına — kullanıcılar, gönderiler, etkinlik günlükleri, … — **çekirdek DAO'ları** aracılığıyla ulaşmak için kullanın (bir DAO, tek işi bir veritabanı tablosuyla konuşmak olan küçük bir sınıftır) ki onları bunun üzerinden hem okur *hem de* yazarsınız. Pano'nun kendi tablolarıyla bu şekilde çalışmak tam olarak `pano-plugin-bans`'ın yaptığı şeydir — o deseni için oraya bakın.
:::

::: tip Kontrol noktası: yüklendi mi?
Yeniden derleyip yeniden başlattıktan sonra, Pano'nun konsolunu izleyin — eklentinizin yüklendiğini günlüğe kaydetmeli — ve **Panel → Eklentiler**'i açın: **Shoutbox** listelenmeli. Yukarıdaki `cp` satırındaki jar adı gerçekten derlediğinizle eşleşmiyorsa, `build/libs/`'e bakın — ad `pluginId`'nizden gelir (bunu [Başlangıç](/tr/addon/getting-started/)'ta ayarladınız).
:::

## Geri kalanı, teker teker inşa edin

Her yetenek kendi odaklanmış sayfasıdır. Eklediğiniz şeyle eşleşene başvurun:

- **Bir API ekleyin** (JSON döndüren bir URL) → **[Endpoint'ler](/tr/addon/endpoints/)**
- Bir tabloda **veri depolayın** → **[Veritabanı ve Migration'lar](/tr/addon/database/)**
- Site sahibinin düzenleyebileceği bir **ayarlar dosyası ekleyin** → **[Yapılandırma](/tr/addon/configuration/)**
- **Platform eylemlerine tepki verin** (kurulumun bitmesi, girişler, kendi eklentiler-arası olaylarınız) → **[Olaylar](/tr/addon/events/)**
- Yönetici özelliklerini **koruyun** ve yönetici eylemlerini kaydedin → **[İzinler ve Etkinlik Günlükleri](/tr/addon/permissions/)**

Shoutbox backend yüzeyinin yalnızca bir dilimini kullanır. Daha fazlası mevcuttur — eklentiler-arası olaylar, imzalı jetonlar ve şablonlanmış e-postalar (`pano-plugin-auth-guard`), panel ve kullanıcı bildirimleri, Minecraft-sunucusu iletişimi, konsol komutları ve dosya yüklemeleri. Her uzatma noktası [Backend API Referansı](/tr/addon/backend-reference/)'nda kataloglanmıştır.

## Sonraki adım

- **[Endpoint'ler](/tr/addon/endpoints/)** — ilk herkese açık JSON API'nizi ve yalnızca-yönetici bir panel endpoint'i açığa çıkarın.
- **[Veritabanı ve Migration'lar](/tr/addon/database/)** — bir model, bir DAO ve SQL'iyle bir tablo ekleyin.
- **[Backend API Referansı](/tr/addon/backend-reference/)** — her backend uzatma noktası, adıyla, imzasıyla ve kaynak konumuyla.
- **[Frontend Geliştirme](/tr/addon/frontend/)** — yazdığınız endpoint'leri çağıran Shoutbox bileşenini ve panel arayüzünü oluşturun.
