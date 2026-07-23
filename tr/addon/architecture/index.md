# Mimari

[Başlangıç](/tr/addon/getting-started/) sayfasında bir eklenti derleyip yüklediniz. Bu sayfa haritadır. Gerçekte ne olduğunu açıklar: o tek jar'ın içinde ne var (jar, derlenmiş kod ve kaynakların bir zip'idir — herhangi bir arşiv aracıyla açabilirsiniz), Pano onu yüklerken ne yapar ve yazdığınız her dosya eklenti çalışırken nerede sonlanır.

Sona geldiğinizde tüm yükleme yaşam döngüsünü açıklayabilecek, **`svelte`'yi neden asla bir bağımlılık olarak eklememeniz gerektiğini** bilecek ve depodaki her dosyanın eklenti çalışırken nerede yaşadığını gösterebileceksiniz. Yol boyunca "Kendiniz görün" kutuları size açacak, çözecek ya da tıklayacak bir şey verir, böylece fikirler yalnızca kelimeler olarak kalmaz.

## Tek jar, üç çalışma ortamı

Bir eklenti **tek bir jar** olarak gönderilir, ama içindeki kod üç farklı yerde çalışır. İşte bütün resim bir bakışta:

```text
                        ┌──────────────────────┐
                        │  your addon = 1 jar   │
                        └───────────┬──────────┘
          ┌─────────────────────────┼─────────────────────────┐
          ▼                         ▼                         ▼
     Browser                  Node (theme + panel)       JVM (Pano server)
     client bundle            server bundle              Kotlin backend
     the UI users click       renders your UI to HTML    endpoints, DB, events
```

1. **Kotlin backend'i** — Pano'nun kullandığı eklenti yükleyicisi [PF4J](https://pf4j.org/) tarafından yüklenir: jar'ınızı `plugins` klasöründe bulur ve sınıflarını çalışan Pano sunucusuna (JVM) yükler. Bu, uç noktalarınız, veritabanı tablolarınız, izinleriniz ve etkinlik dinleyicilerinizdir. Pano'nun kendisiyle aynı süreçte çalışır.
2. **Bir Svelte *client* paketi** — burada paket, yalnızca `.svelte` dosyalarınızın tek bir `.mjs` dosyasına derlenmiş hâli anlamına gelir. Ziyaretçinin tarayıcısında, **hem** panel hem de etkin temanın içinde çalışır. Kullanıcının gerçekten tıkladığı arayüz budur.
3. **Bir Svelte *server* paketi** — aynı arayüz, ama tema ve panelin (bunlar Node süreçleridir) bileşenlerinizi tarayıcı görmeden önce HTML'e işleyebilmesi için derlenmiş hâli — buna sunucu tarafı işleme (SSR) denir. Tarayıcı daha sonra bu HTML'i "hidrasyon" ile canlandırır: aynı bileşenleri yeniden çalıştırır ve sayfada zaten bulunan işaretlemeye bağlanır. Hidrasyonun çalışması için **her iki tarafın da tam olarak aynı Svelte'yi çalıştırması** gerekir — bunu aklınızda tutun, bu sayfanın sonuna yakın büyük kuralın nedeni budur.

Önemli kısım: **tek** bir arayüz giriş dosyası vardır, `src/main.js`, ve o hem panele *hem de* temaya hizmet eder. İki arayüz yazmazsınız — bir tane yazar ve nerede çalıştığına göre dallanırsınız.

Bu, `src/main.js`'ten varsayılan olarak dışa aktardığınız sınıfın bir metodudur (Başlangıç sayfasında gördüğünüz aynı sınıf). Arayüz yüklendiğinde Pano onu sizin için çağırır — aşağıdaki [Arayüz yüklendiğinde ne olur](#arayuz-yuklendiginde-ne-olur) bölümüne bakın — ve ona `isPanel` bayrağı olan bir `pano` nesnesi geçer:

```js
onLoad() {
  const { pano } = this;
  if (pano.isPanel) {
    // panel registrations
  } else {
    // theme registrations
  }
}
```

Yani jar, Pano'nun JVM'inde çalışan bir backend ve iki Node/tarayıcı bağlamında çalışan bir arayüz taşır; hepsi tek bir kaynak dosyası klasöründen derlenir. Bu sayfanın geri kalanı, bunların her birini çalışma zamanında yaşadıkları yere kadar takip eder.

## Her dosya nerede sonlanır

İşte Shoutbox eklentisinin deposu; her parçanın çalışma zamanında ne hâle geldiğine dair bir notla birlikte. Klasör adları birer gelenektir, ama `src/` (arayüz) ile `src/main/` (backend + kaynaklar) arasındaki ayrım sabittir.

```text
pano-plugin-shoutbox/
├─ build.gradle.kts             # Gradle build
├─ gradle.properties            # the addon's metadata (explained below)
├─ package.json                 # UI dependencies (never lists svelte — see below)
├─ rollup.config.js             # builds the Svelte UI
├─ src/
│  ├─ main.js                   # the single UI entry (panel + theme)
│  ├─ panel/                    # Svelte components shown in the panel
│  │  └─ ShoutboxSettings.svelte
│  ├─ theme/                    # Svelte components shown in the theme
│  │  └─ ShoutboxWidget.svelte
│  └─ main/
│     ├─ kotlin/com/panomc/plugins/shoutbox/
│     │  ├─ ShoutboxPlugin.kt   # your PanoPlugin subclass — the entry point
│     │  ├─ config/             # ShoutboxConfig
│     │  ├─ db/
│     │  │  ├─ dao/             # ShoutDao (abstract): one class per table, declares its queries
│     │  │  ├─ impl/            # ShoutDaoImpl — carries the @Dao annotation, runs the dao's queries
│     │  │  ├─ model/           # Shout entity
│     │  │  └─ migration/       # DatabaseMigration classes (see note under the tree)
│     │  ├─ routes/
│     │  │  ├─ api/             # public endpoints (GetShoutsAPI)
│     │  │  └─ panel/           # panel endpoints (PanelApi)
│     │  ├─ event/              # event listeners
│     │  ├─ permission/         # ManageShoutboxPermission
│     │  └─ log/                # CreatedShoutLog
│     └─ resources/
│        ├─ config.conf         # default config
│        ├─ logo.png            # addon icon shown in the panel
│        ├─ locales/            # en-US.json, tr.json, ru.json
│        └─ plugin-ui/          # generated by the build — never edit by hand (gitignored)
```

Yukarıdaki klasör adlarından ikisi düz bir açıklamayı hak ediyor:

- `dao/` ile `impl/` arasındaki ayrım: `dao/` sınıfı **soyuttur** ve yalnızca her veritabanı sorgusunu *bildirir*; eşleşen `impl/` sınıfı somut olandır — `@Dao` işaretlemesini (annotation) taşıyan ve sorguları gerçekten *çalıştıran* kodu tutan sınıf odur.
- `migration/` — bir migrasyon (geçiş), eklentinizin yeni bir sürümü tabloların veya yapılandırmanın şeklini değiştirdiğinde (örneğin bir sütun eklerken) mevcut bir kurulumun tablolarını veya yapılandırmasını yükselten küçük bir sınıftır. Yalnızca geride kalmış kurulumlarda, bir kez çalışır.

Ağacın geri kalanını okumak için iki kural:

- `src/main/kotlin` ve `src/main/resources` altındaki her şey **backend jar içeriğidir**. Kotlin sınıflara derlenir; kaynaklar (yapılandırma, görseller, yerelleştirmeler) olduğu gibi kopyalanır; ikisi de jar'a girer.
- `src/` altında ama `src/main/` *dışındaki* her şey (`main.js`, `panel/`, `theme/`) **arayüz kaynağıdır**. Derlediğinizde, derleyici onu backend kaynaklarınızın içine düşen dosyalara dönüştürür:

| Arayüz kaynağı (siz yazarsınız) | Derlenmiş çıktı (derleme yazar) |
|---|---|
| `src/main.js`, `src/panel/`, `src/theme/` | `src/main/resources/plugin-ui/` |

Evet — derleme çıktısını *kaynak ağacınıza geri*, `src/main/resources/` içine yazar. Bu bilinçlidir: derlenmiş arayüzü `resources/` altına koymak, onun tam da aynı jar'ın içine zip'lenip gönderilmesini sağlar. (Ayrıca `plugin-ui/`'nin gitignore'da olmasının nedeni de budur — her derlemede yeniden üretilir, dolayısıyla commit'lenecek bir şey yoktur.)

::: tip Giriş sınıfı hariç buradaki her klasör isteğe bağlıdır
`config/`, `db/`, `event/`, `permission/`, `log/` yalnızca geleneğin şeyleri koyduğu yerlerdir. Pano sınıflarınızı klasörlerinden değil, **işaretlemelerinden** bulur — işaretleme, bir sınıfın üstüne yazılan `@Bir şey` etiketidir ve Pano derlenmiş sınıflarınızı bu etiketler için tarar (bir sonraki bölümde daha fazlası). `pano-plugin-cookies` gibi yalnızca-yapılandırma bir eklentinin bu klasörlerin neredeyse hiçbiri yoktur; `pano-plugin-announcement` gibi tam bir CRUD (create/read/update/delete — yani veritabanı tabloları *ve* uç noktaları olan) eklentinin hepsi vardır.
:::

::: tip Kendiniz görün
Derlenmiş `*.jar` dosyanızı kopyalayın ve kopyayı `*.zip` olarak yeniden adlandırıp açın (jar zaten bir zip'tir). İçinde `locales/` klasörünüzün ve `logo.png`'nizin yanında duran bir `plugin-ui.zip` bulmalısınız — o tek `plugin-ui.zip`, derlenmiş arayüzünüzün tamamının paketlenmiş hâlidir.
:::

## Backend yüklendiğinde ne olur

Daha önce Minecraft eklentileri yazdıysanız, burada **`plugin.yml` olmadığına** dikkat edin. Her hâlükârda, tüm üst veriler — id, ana sınıf, gereken Pano sürümü — jar'ın `MANIFEST.MF` dosyasında yaşar (her jar'ın içinde onu tanımlayan küçük bir metin dosyası) ve derleme zamanında sizin için `gradle.properties`'ten yazılır. Hangi anahtarın hangi niteliğe eşlendiğini tam olarak görmek için [Manifesto Yapılandırması](/tr/addon/manifest/) sayfasına bakın.

::: tip Kendiniz görün
Derlenmiş jar'ınızı yine bir zip olarak açın ve `META-INF/MANIFEST.MF`'i bir metin editöründe okuyun — içinde eklentinizin id'sini ve ana sınıfını listelenmiş görmelisiniz.
:::

Pano jar'ınızı yüklediğinde, PF4J manifestoda adı geçen ana sınıfı bulur, ondan bir örnek oluşturur ve yaşam döngüsü kancalarınızı **sırayla** çağırır:

```text
jar load → onCreate() → onEnable() → onStart() → … running … → onStop() → onDisable() → onUninstall()
```

- Tüm kancalar `suspend` fonksiyonlarıdır (`suspend`, Kotlin'in async işaretidir — pratikte Pano'nun veritabanı ve ağ fonksiyonlarını doğrudan bu kancaların içinde çağırabileceğiniz anlamına gelir) ve hepsi varsayılan olarak hiçbir şey yapmaz — yalnızca ihtiyaç duyduklarınızı geçersiz kılarsınız (override).
- `onStart()`, çoğu eklentinin kurulumunu yaptığı yerdir (veritabanını başlat, yapılandırmayı yükle). [Backend Geliştirme](/tr/addon/backend/) eğitimi kanonik deseni adım adım gösterir.
- `onUninstall()` yalnızca site sahibi eklentiyi panelde **sildiğinde** çağrılır — yalnızca devre dışı bıraktığında değil. `pano-plugin-shoutbox`'un veritabanından `shout` tablosunu silebileceği yer burasıdır.

::: tip Kendiniz görün
`onStart()` içine bir `logger.info(...)` satırı koyun, yeniden derleyin ve eklentiyi yeniden yükleyin — satır Pano'nun konsolunda belirir. Yaşam döngüsünün gerçekten tetiklendiğini izlemenin en basit yolu budur.
:::

### Sınıflarınız otomatik olarak bulunur

Eklentiniz yüklendiğinde Pano paketinizdeki her sınıfın içinden geçer — `com.panomc.plugins.shoutbox` ve altındaki her şey. Aşağıdaki tablodaki etiketlerden birini (`@Bir şey` işaretlemeleri) taşıyan herhangi bir sınıf sizin için otomatik olarak oluşturulur; bunları asla kendiniz kurmaz (construct) etmezsiniz.

Dahası, Pano her sınıfın neye ihtiyacı olduğunu doldurur. Uç noktanızın veritabanını okumak için `ShoutDao`'ya ihtiyacı varsa, `ShoutDao`'yu bir kurucu (constructor) parametresi olarak listelemeniz yeterli; Pano hazır bir örneği sizin için geçer — asla kendiniz `ShoutDaoImpl()` yazmazsınız. Bir sınıfa, bağımlı olduğu şeyleri kendisi inşa ettirmek yerine onları teslim etmeye **bağımlılık enjeksiyonu** (dependency injection) denir.

| İşaretleme | Neyi kaydeder |
|---|---|
| `@Endpoint` | bir HTTP rotası — eklenti yüklendiği anda devreye girer |
| `@Dao` | tablolarınızdan biri için bir veritabanı erişim nesnesi — soyut DAO'ya değil, somut *impl* sınıfına konur |
| `@Migration` | eski bir veritabanını veya yapılandırmayı yeni sürümünüze getirmek için kurulum başına bir kez çalışır |
| `@EventListener` | platform etkinlikleri için bir dinleyici (kurulum bitti, oyuncu silindi, …) |
| `@PermissionDefinition` | panelin verebileceği bir izin düğümü (node) |

Asla bir "bu uç noktayı kaydet" metodu çağırmazsınız — sınıfı işaretlemenin kendisi *kayıttır*. `@Endpoint` sınıfları tarafından bildirilen rotalar eklenti yüklendiğinde devreye girer ve yeniden kaldırıldığında geri alınır; böylece bir eklentiyi etkinleştirmek ve devre dışı bırakmak API'sini temiz bir şekilde ekler ve kaldırır.

Tüm bunları yapan çerçeve **Spring**'dir. Her eklenti kendi Spring *uygulama bağlamını* (application context — Spring'in oluşturduğu nesneleri tutan izole bir kap) alır ve Spring paketinizi *bileşen tarar* (component-scan) — bu tarama, yukarıdaki "her sınıfın içinden geç" adımıdır. Spring'in oluşturup yönettiği bir nesne için kullandığı sözcük **bean**'dir; yani "bean'leriniz otomatik olarak bulunur", "işaretlenmiş sınıflarınız sizin için oluşturulur" demenin süslü bir yoludur yalnızca.

::: tip Pano'nun kendi servislerine ulaşmak
**Kısa versiyon:** kendi sınıflarınız kuruculara otomatik olarak gelir; Pano'nun yerleşik servislerinden birini kullanmak için onu aşağıdaki tek satırla getirirsiniz. Bu servisler arasında `DatabaseManager`, `AuthProvider`, `SetupManager`, `PluginDatabaseManager` ve daha fazlası vardır — kodunuz, Pano'nun kendisine ait bir şeye ihtiyaç duyduğunda bunlara başvurursunuz (örneğin, `SetupManager`'a ilk kurulumun bitip bitmediğini sormak).

Aşağıdaki satır hakkında iki şey: `applicationContext`, `PanoPlugin`'den miras alınır (giriş sınıfınız onu genişletir) ve `by lazy`, bean'in başlangıçta değil, `setupManager`'ı gerçekten ilk kullandığınızda getirildiği anlamına gelir. (`SetupManager::class.java` yalnızca Kotlin'in istediğiniz türü adlandırma biçimidir.)

```kotlin
private val setupManager by lazy {
    applicationContext.getBean(SetupManager::class.java)
}
```

Her host servisine bu şekilde ulaşırsınız — `applicationContext.getBean(...)` ve servisin türü.

**İleri düzey, getirmenin neden gerektiğini merak ediyorsanız:** eklentinizin bean'leri `pluginBeanContext` adlı bir bağlamda yaşar, Pano'nun servisleriyse *ayrı* bir host bağlamında (`applicationContext`). Bileşen taraması yalnızca sizin paketinizi görür, dolayısıyla host servisleri kuruculara **enjekte edilemez** — onları yukarıdaki gibi açıkça istemeniz gerekir.
:::

## Arayüz yüklendiğinde ne olur

Arayüz asla gevşek dosyalar olarak gönderilmez. Bir yayın derlemesi çalıştırdığınızda, derlenmiş `plugin-ui/{client,server}` klasörleri tek bir jar kaynağına, **`plugin-ui.zip`**'e zip'lenir. Oradan:

1. Yüklendiğinde Pano bu zip'in bir **arayüz hash'ini** (UI hash) hesaplar ve tema ile panelin zaten çağırdığı site bilgisi API'si (`/api/siteInfo`) aracılığıyla eklentiniz için `{ version, uiHash }` duyurur.
2. Tema (tarayıcı) **client** paketinizi önbellek kıran (cache-busting) bir sorguyla içe aktarır — `client.mjs?v=<uiHash>` — böylece yeni bir derleme, eski önbelleğe alınmış kopyayı geçersiz kılar. Node süreci SSR için **server** paketini, `server/server.mjs`'i içe aktarır.
3. İçe aktarıldıktan sonra Pano varsayılan olarak dışa aktardığınız sınıfı kurar ve onun `onLoad()`'ını çağırır — bu sayfanın başındaki aynı `onLoad()`. Arayüzün eklediği her şeyi kaydettiğiniz tek giriş noktası budur: kancalar, sayfalar, gezinme bağlantıları.

::: tip Kendiniz görün
Tarayıcınızın geliştirici araçlarını açın, **Network** sekmesine gidin ve eklentinizi kullanan bir sayfayı yükleyin. `client.mjs?v=<hash>` isteğini bulun — o `<hash>`, Pano'nun az önce tarayıcıya verdiği arayüz hash'idir.
:::

Arayüz hash'i esas olarak **yayınlanmış** eklentiler için önemlidir ve geliştirmede farklı davranır:

- **Yayınlanmış:** yeni bir sürüm yeni bir zip gönderir, dolayısıyla hash değişir ve önbellek kıran sorgu taze paketi çeker.
- **Geliştirme modu:** [Geliştirme Modu](/tr/addon/getting-started/) açıkken Pano her istekte arayüz zip'inizi diskten yeniden derler. Hash o zaman gerçek bir içerik hash'i değildir — sabit bir yer tutucu değerdir, `dev-build` — ve tema paketi önbelleğe almak yerine her istekte yeniden getirir. Bir `bun run dev` değişikliğinin F5'te görünmesini sağlayan şey budur.

[Arayüz Geliştirme](/tr/addon/frontend/) eğitimi `onLoad()` içinde ne yaptığınızı kapsar.

## Paylaşılan Svelte çalışma ortamı

Bu, arayüz hakkında anlaşılması gereken tek en önemli şeydir ve herkesi şaşırtan bir kuralı açıklar.

Client paketiniz **Svelte, `svelte-i18n` veya `@panomc/sdk` içermez.** Rollup derlemesi bu içe aktarmaları bilinçli olarak *harici* (external) bırakır: derlenmiş dosya hâlâ tam anlamıyla `import ... from 'svelte'` der ve içine hiçbir şey kopyalanmamıştır — dolayısıyla çalışma zamanında bir şeyin bu içe aktarmayı yanıtlaması gerekir.

O bir şey, host'tur (tema veya panel). Bir **içe aktarma haritası** (import map) sağlar — `'svelte'` gibi çıplak bir adın gerçekte nereden yükleneceğini tarayıcının öğrenmesi için okuduğu küçük bir JSON parçası — ve bu harita, bu içe aktarmaların her birini bir `/runtime/...` URL'sine yönlendirir. Her `/runtime` URL'si yalnızca host'un kendi canlı modül kopyasını yeniden dışa aktarır.

Sonuç: Pano ve tüm eklentileri **tek** bir Svelte çalışma ortamını ve **tek** bir SDK örneğini paylaşır. Pratikte bu, bileşenlerinizin ve temanın bileşenlerinin durumu paylaştığı ve sanki hep tek bir uygulamaymış gibi birlikte yeniden işlendiği anlamına gelir. Eklentiniz kendi özel Svelte veya SDK kopyasını paketleseydi, o kopyanın kendi ayrı durumu olurdu ve hidrasyon (bu sayfanın başından — tarayıcının sunucu tarafında işlenmiş HTML'e yeniden bağlanması) bozulurdu.

::: tip Kendiniz görün
Herhangi bir tema sayfasını açın ve **Kaynağı Görüntüle** (JavaScript çalışmadan önceki ham HTML) kullanın. Eklentiniz o sayfada bir şey işliyorsa, işaretlemesini HTML içinde zaten duruyor göreceksiniz — bu, tarayıcının hidrate etmek üzere olduğu sunucu tarafında işlenmiş çıktıdır.
:::

Sert bir sonucu var: derlenmiş Svelte çıktısının yalnızca üzerinde çalışacağı **tam olarak aynı** Svelte sürümüne karşı çalışacağı garanti edildiğinden, derlemenizin derleyici sürümü host'unkiyle tam olarak eşleşmelidir. Svelte'yi asla kendiniz sabitlememenizin (pin) nedeni budur — `@panomc/sdk` doğru sürümü sabitler ve `rollup.config.js`'iniz bir uyuşmazlıkta derlemeyi reddeder.

::: warning `svelte`'yi asla `package.json`'unuza eklemeyin
Svelte sürümü sizden değil, `@panomc/sdk`'nin sabitlemesinden gelir. `svelte`'yi kendiniz listelerseniz, bun `@panomc/sdk`'nin sabitlediğinden farklı bir sürüm kurabilir ve derleme tam da buna karşı korur: bir sürüm uyuşmazlığında `rollup.config.js` bir hata yazdırır ve derleme başarısız olur (çıkış kodu 1) — bilerek. Sürüm sapması hidrasyonu hata ayıklaması acı verici şekillerde bozar, dolayısıyla koruma sizi göndermeden önce durdurur. Her türlü `svelte` girişini kaldırın ve yeniden kurun.
:::

Bunun açıkladığı bir şey daha: harici kalan *tek* çıplak içe aktarmalar Svelte, `svelte-i18n` ve `@panomc/sdk`'dir (ve alt yolları). "Çıplak" bir içe aktarma, `./file.js` gibi bir yol yerine paket adıyla yazılandır — `import x from 'chart.js'`. İçe aktardığınız başka her şey — bir grafik kütüphanesi gibi üçüncü taraf bir paket — host şim'ine (shim) sahip değildir, dolayısıyla derlemenize **paketlenmeli** (bundle) dir. O kısım otomatiktir: yalnızca `bun add` edin ve içe aktarın; derleme onu kendi başına kopyalar — yalnızca o üç paylaşılan ad özeldir. [Arayüz API Referansı](/tr/addon/api-reference/) izin verilen çıplak belirteçlerin (specifier) tam kümesini listeler.

## Verileriniz çalışma zamanında nerede yaşar

Çalışma zamanında eklentiniz çok farklı iki depolama konumuna dokunur ve bunları birbirinden ayrı tutmak işe yarar:

| Konum | Neyi tutar | Onu kim yazar |
|---|---|---|
| `plugins/<pluginId>/` (veri dizini) | `config.conf`, yüklenen dosyalar, eklentinizin diske kalıcı yazdığı her şey | ilk yüklemede otomatik olarak oluşturulur; onu siz yazarsınız (örn. Backend Geliştirme'de gösterilen `PluginConfigManager` aracılığıyla) |
| Jar'ın içinde (kaynaklar) | `locales/*.json`, `logo.png`, `plugin-ui.zip` | derleme zamanında gömülür — çalışma zamanında **salt okunur** |

Veri dizini `pluginId`'nizle adlandırılır (Shoutbox için `plugins/pano-plugin-shoutbox/`) ve yeniden başlatmalar boyunca hayatta kalır — kurulum başına durumun yeri burasıdır. **Yayınlanmış** bir jar'da bu kaynaklar, jar derlendiği an sabitlenir. **Geliştirme** sırasındaysa Pano onları kaynak ağacınızdan canlı sunar: Geliştirme Modu açıkken `locales/*.json`'ı doğrudan diskten okur ve arayüz zip'inizi her istekte diskten yeniden derler — düzenle-ve-yenile döngüsünü tam olarak çalıştıran şey budur. Kotlin kodu asla sıcak yeniden yüklenmeyen tek şeydir — Kotlin değişiklikleri bir yeniden derleme ve bir Pano yeniden başlatması gerektirir. (Başlangıç sayfasında tam sıcak-ile-yeniden-derleme tablosu var.)

## Sırada ne var

Artık zihinsel modele sahip olduğunuza göre, oluşturmak için bir taraf seçin:

- **[Backend Geliştirme](/tr/addon/backend/)** — bir tablo ekleyin, bir API sunun, bir izinle koruyun, bir eylemi günlüğe kaydedin.
- **[Arayüz Geliştirme](/tr/addon/frontend/)** — ana sayfaya bir bileşen yerleştirin, bir panel sayfası ekleyin, API'nizi çağırın.
- **[Manifesto Yapılandırması](/tr/addon/manifest/)** — jar'ınızın manifestosuna dönüşen `gradle.properties` anahtarları.

Gerçek eklenti kodu okumak ister misiniz? Yukarıda anılan iki örnek `pano-plugin-cookies` (yalnızca-yapılandırma, neredeyse hiç backend klasörü yok) ve `pano-plugin-announcement` (hepsini kullanan tam bir CRUD eklentisi).
