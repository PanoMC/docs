# Backend Geliştirme

**Bu sayfa size ne verir:** eklentinizin Kotlin yarısının haritası — Pano'nun başlattığı giriş sınıfı, onun yaşam döngüsü kancaları ve Pano'nun sınıflarınızı sizin için nasıl bulup oluşturduğu — artı backend'in yapabildiği her şey (endpoint'ler, veritabanı, yapılandırma, olaylar, izinler) için ilgili odak sayfasına bir yön levhası.

Backend, eklentinizin Kotlin yarısıdır: Pano'nun kendi Java sürecinin içinde çalışan kısım. Veritabanı tablolarınıza, JSON uç noktalarınıza, izinlerinize ve yönetici etkinlik günlüklerinize sahiptir. Bu sayfalar, bu dokümanlar boyunca taşıdığımız küçük eklenti olan **Shoutbox'ın backend dilimini** oluşturur; ziyaretçiler ana sayfada en son "shout"ları görür, yöneticiler bunları panelden yayınlar ve kaldırır.

::: tip Eklentiler kodda plugin'dir
Düz metnin her yerinde **eklenti** deriz, ama kod düzeyindeki adların hepsi `plugin` kelimesini kullanır — `PanoPlugin`, `pluginId`, `PluginConfig` vb. Bu beklenen bir durum; koddaki hiçbir şeyi yeniden adlandırmayın.
:::

## Başlamadan önce

[Başlangıç](/tr/addon/getting-started/) sayfasından, yeniden adlandırılmış ve derlenen bir eklentiniz olmalı — o sayfa ayrıca eklentinizin içinde yaşadığı çalışan Pano örneğini de kurar. **Henüz okumadıysanız lütfen önce [Mimari](/tr/addon/architecture/) sayfasını okuyun**; bu bölümün tamamı ona yaslanır. Oradan getirmeniz gereken tek fikir, düz kelimelerle:

> **Spring**, Pano'nun sınıflarınızı sizin için oluşturmak üzere kullandığı kütüphanedir, dolayısıyla asla `new` yazmazsınız. **Bağlam** (context), yalnızca Spring'in doldurduğu, hazır nesnelerden oluşan bir kutudur. Pano eklentinize kendi kutusunu verir ve her sınıfınızın birer kopyasını içine bırakır — siz sonra kutudan ihtiyaç duyduğunuz şeyi istersiniz.

Backend, `src/main/kotlin/com/panomc/plugins/shoutbox/` altında yaşar — giriş sınıfı `ShoutboxPlugin.kt` artı `config/`, `db/` (`model/`, `dao/`, `impl/`, `migration/`), `routes/` (`api/`, `panel/`), `permission/`, `event/` ve `log/` paketleri. Bu dosyaları tek tek oluşturursunuz; aşağıdaki her odak sayfası oluşturduğu dosyayı adıyla belirtir — hepsini şimdi oluşturmayın.

## Pano sınıflarınızı sizin için nasıl oluşturur

Bu sınıfları asla elle birbirine bağlamazsınız — `new` yok, "bunu kaydet" çağrıları yok. Bütün numara dört düz fikirdir:

- Bir **işaretleme** (annotation), `@` ile başlayan ve bir sınıfın hemen üstünde duran bir etikettir, `@Endpoint` gibi. Bir yorum **değildir** — hem derleyici hem de Pano onu okur.
- **Tarama:** eklentiniz yüklendiğinde Pano paketinizin içine bakar ve bu etiketlerden birini taşıyan her sınıfı bulur — `@Endpoint`, `@Dao`, `@Migration`, `@EventListener` veya `@PermissionDefinition`.
- Bulduğu her biri için Pano **bir örnek** (bir nesne) oluşturur ve onu saklar. Pano tarafından oluşturulan, Pano tarafından saklanan böyle bir nesneye **bean** denir — bu dokümanlarda "bean"in tek anlamı budur: Spring'in sizin için yaptığı bir nesne.
- **Kurucu enjeksiyonu:** sınıflarınızdan biri kurucusunda bean'lerinizden bir başkasını isterse — `class GetShoutsAPI(private val shoutDao: ShoutDao)` — Pano hazır olanı size verir. Bunu bir teslimat servisi gibi düşünün: sipariş formuna (kurucu parametrelerine) malzemeleri listelersiniz ve kapınıza gelirler — kurucuyu asla kendiniz çağırmazsınız.

En yaygın çökmeden sizi kurtaran bir şey daha: **iki kutu** vardır.

- **Pano'nun kutusu** (*host bağlamı*) Pano'nun kendi servislerini tutar: `DatabaseManager`, `AuthProvider`, `SetupManager`, `PluginDatabaseManager`.
- **Sizin kutunuz** (*eklenti bağlamı*) yazdığınız sınıfları tutar: uç noktalarınız, DAO'larınız, dinleyicileriniz.

Kurucu enjeksiyonu yalnızca **sizin** kutunuza ulaşır. **Pano'nun** kutusundan bir şey almak için onu elle istersiniz: `applicationContext.getBean(SomeService::class.java)`. Bunu neredeyse her sayfada göreceksiniz.

::: warning Kotlin değişiklikleri asla sıcak değildir — yeniden derleyin ve yeniden başlatın
Bir `.kt` dosyasını düzenlemek tek başına hiçbir şeyi değiştirmez. Kotlin'e her dokunduğunuzda jar'ı yeniden derlemeli, örneğinizin `plugins/` klasörüne kopyalamalı ve **Pano'yu yeniden başlatmalısınız**:

```bash
./gradlew build -Pnoui
cp build/libs/pano-plugin-shoutbox-local-build.jar <your-pano-instance>/plugins/
```

`-Pnoui`, Kotlin üzerinde çalışırken ihtiyaç duymadığınız Svelte arayüzünü yeniden derlemeyi atlar — derlemeyi çok daha hızlı yapar.

Eklentiyi **Panel → Eklentiler**'den devre dışı bırakıp yeniden etkinleştirmek **yeterli değildir**: Pano zaten çalışan Java kodunu değiştiremez, dolayısıyla yeni jar'ı yalnızca tam bir yeniden başlatma yükler. (Teknik neden, isterseniz: Pano'nun PF4J eklenti yükleyicisi zaten yüklenmiş *classloader*'ı tutar ve çalışan bir JVM onu yerinde değiştiremez.) Eklentinizin **Svelte arayüzü**, `bun run dev` altında sıcak yeniden yüklenir — ama **Kotlin asla yüklenmez**. Aşağıdaki her sayfa için bu yeniden-derle-ve-yeniden-başlat adımını aklınızda tutun.
:::

## Giriş sınıfı

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

Bu sayfaların her yerinde göreceğiniz üç Kotlin söz dizimi parçası:

- `suspend`, veritabanı veya ağ için — tüm sunucuyu dondurmadan — **beklemesine** izin verilen bir fonksiyonu işaretler. Geçersiz kıldığınız fonksiyonların çoğu `suspend` olarak bildirilir, dolayısıyla hiç coroutine kodu yazmasanız bile onu koruyun. (Tanışacağınız tek istisna, temel sınıfın `suspend` **olmadan** bildirdiği `getValidationHandler`'dır — her zaman geçersiz kıldığınız fonksiyonun tam imzasıyla eşleşin.)
- `by lazy { ... }`, "bu, gerçekten ilk kullanılana kadar çalıştırılmasın" demektir.
- `getBean(X::class.java)`, "bana Pano'nun hazır X nesnesini ver" demektir — yukarıdan Pano'nun kutusuna (host bağlamı) uzanır. `PluginDatabaseManager` ve `SetupManager` kurucularınıza enjekte edilemez, dolayısıyla onları böyle getirirsiniz.

Sınıfın ne yaptığı, baştan sona:

- `onStart()`, eklenti yüklendiğinde çalışır ve `startPlugin()`'i çağırır.
- `PluginConfigManager` bir kez oluşturulur ve **kendi kutunuzda** (`pluginBeanContext`) bir bean olarak kaydedilir. **Bir uç noktada `PluginConfigManager`'ı asla bir kurucu parametresi olarak almayın** — uç noktalarınız oluşturulduğu an henüz mevcut değildir, dolayısıyla onu enjekte etmek çökmeye yol açar. [Yapılandırma](/tr/addon/configuration/) nedenini tam olarak açıklar ve yapılandırmayı okumanın güvenli yolunu gösterir.
- `pluginDatabaseManager.initialize(this)` tablolarınızı oluşturur ve bekleyen migrasyonları çalıştırır.

**Erken dönüş neden?** Birisi eklentinizi, Pano'nun ilk çalıştırma kurulum sihirbazını bitirmeden *önce* kurarsa, henüz bir veritabanı yoktur — `initialize()` başarısız olurdu. Bu yüzden `startPlugin()` erkenden döner ve küçük bir etkinlik dinleyicisi, kurulum tamamlandığı an onu yeniden çalıştırır. O kurulum-kapısı dinleyicisi ve platform eylemlerine tepki vermeyle ilgili diğer her şey [Olaylar (Events)](/tr/addon/events/) sayfasında yaşar.

::: tip `PluginDatabaseManager` vs `DatabaseManager`
İki farklı bean, ikisi de `getBean` ile getirilir:
- **`PluginDatabaseManager`** *sizin* tablolarınızı ve migrasyonlarınızı yönetir — `initialize(plugin)` ve `uninstall(plugin)`.
- **`DatabaseManager`** host'un veritabanı servisidir. Onu paylaşılan SQL istemcisi (`databaseManager.getSqlClient()`) için ve Pano'nun kendi **çekirdek DAO'larına** — kullanıcılar, gönderiler, etkinlik günlükleri, … — ulaşmak için kullanın; onları bunun aracılığıyla hem okur *hem de* yazarsınız. Pano'nun kendi tablolarıyla bu şekilde çalışmak, tam da `pano-plugin-bans`'ın yaptığı şeydir — o deseni orada arayın.
:::

::: tip Kontrol noktası: yüklendi mi?
Yeniden derleyip yeniden başlattıktan sonra, Pano'nun konsolunu izleyin — eklentinizin yüklendiğini günlüğe kaydetmeli — ve **Panel → Eklentiler**'i açın: **Shoutbox** listelenmiş olmalı. Yukarıdaki `cp` satırındaki jar adı gerçekte derlediğinizle eşleşmiyorsa, `build/libs/` içine bakın — ad, `pluginId`'nizden gelir (onu [Başlangıç](/tr/addon/getting-started/) sayfasında ayarlamıştınız).
:::

## Gerisini tek tek inşa edin

Her yetenek kendi odak sayfasıdır. Eklediğiniz şeye uyanı seçin:

- **Bir API ekleyin** (JSON döndüren bir URL) → **[Endpoint'ler](/tr/addon/endpoints/)**
- **Veri saklayın** bir tabloda → **[Veritabanı ve Migrasyonlar](/tr/addon/database/)**
- **Bir ayarlar dosyası ekleyin** site sahibinin düzenleyebileceği → **[Yapılandırma](/tr/addon/configuration/)**
- **Platform eylemlerine tepki verin** (kurulumun bitmesi, girişler, kendi eklentiler-arası olaylarınız) → **[Olaylar (Events)](/tr/addon/events/)**
- **Yönetici özelliklerini kapılayın** ve yönetici eylemlerini kaydedin → **[İzinler ve Etkinlik Günlükleri](/tr/addon/permissions/)**

Shoutbox, backend yüzeyinin yalnızca bir dilimini kullanır. Daha fazlası mevcut — eklentiler-arası olaylar, imzalı jetonlar ve şablonlu e-postalar (`pano-plugin-auth-guard`), panel ve kullanıcı bildirimleri, Minecraft-sunucu iletişimi, konsol komutları ve dosya yüklemeleri. Her genişletme noktası [Backend API Referansı](/tr/addon/backend-reference/)'nda kataloglanmıştır.

## Sırada ne var

- **[Endpoint'ler](/tr/addon/endpoints/)** — ilk herkese açık JSON API'nizi ve yalnızca-yönetici bir panel uç noktasını sunun.
- **[Veritabanı ve Migrasyonlar](/tr/addon/database/)** — bir model, bir DAO ve SQL'iyle bir tablo ekleyin.
- **[Backend API Referansı](/tr/addon/backend-reference/)** — adıyla her backend genişletme noktası, imzası ve kaynak konumuyla birlikte.
- **[Frontend Geliştirme](/tr/addon/frontend/)** — yazdığınız uç noktaları çağıran Shoutbox widget'ını ve panel arayüzünü oluşturun.
