# Mimari

[Başlangıç](/tr/addon/getting-started/) sayfasında bir eklenti derleyip yüklediniz. Bu sayfa haritadır. Aslında ne olduğunu açıklar: o tek jar'ın içinde ne var (jar yalnızca derlenmiş kod ve kaynakların bir zip'idir — onu herhangi bir arşiv aracıyla açabilirsiniz), Pano onu yüklerken ne yapar ve yazdığınız her dosya eklenti çalışırken nerede biter.

Sonunda, tam yükleme yaşam döngüsünü açıklayabilir, **neden asla `svelte`'i bir bağımlılık olarak eklememeniz gerektiğini** bilir ve depodaki her dosyanın eklenti çalışırken nerede yaşadığını gösterebilirsiniz. Yol boyunca, "Kendiniz görün" kutuları size açacak, çıkaracak veya tıklayacak bir şey verir, böylece fikirler yalnızca kelimeler olmaz.

## Bir jar, üç çalışma zamanı

Bir eklenti **tek bir jar** olarak gönderilir, ama içindeki kod üç farklı yerde çalışır. İşte tüm resim bir bakışta:

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

1. **Kotlin backend** — Pano'nun kullandığı eklenti yükleyicisi [PF4J](https://pf4j.org/) tarafından yüklenir: jar'ınızı `plugins` klasöründe bulur ve sınıflarını çalışan Pano sunucusuna (JVM) yükler. Bu, endpoint'leriniz, veritabanı tablolarınız, izinleriniz ve olay dinleyicilerinizdir. Pano'nun kendisiyle aynı işlemde çalışır.
2. **Bir Svelte *istemci* paketi** — buradaki bir paket, yalnızca `.svelte` dosyalarınızın tek bir `.mjs` dosyasına derlenmiş halidir. Ziyaretçinin tarayıcısında, **hem** panel hem de etkin tema içinde çalışır. Bu, bir kullanıcının gerçekten tıkladığı arayüzdür.
3. **Bir Svelte *sunucu* paketi** — aynı arayüz, tema ve panelin (bunlar Node işlemleridir) bileşenlerinizi tarayıcı görmeden önce HTML'e render edebilmesi için derlenmiş — bu sunucu tarafı render'dır (SSR). Tarayıcı sonra o HTML'i "hydrate" eder: aynı bileşenleri yeniden çalıştırır ve zaten sayfada olan işaretlemeye bağlanır. Hydration'ın çalışması için, **her iki taraf da tam olarak aynı Svelte'i çalıştırmalıdır** — bunu aklınızda tutun, bu sayfanın sonundaki büyük kuralın nedenidir.

Önemli kısım: `src/main.js` adında **tek** bir arayüz giriş dosyası vardır ve o hem paneli *hem de* temayı sunar. İki arayüz yazmazsınız — bir tane yazar ve nerede çalıştığına göre dallanırsınız.

Bu, `src/main.js`'ten varsayılan-dışa aktardığınız sınıfın bir metodudur (Başlangıç'ta gördüğünüz aynı sınıf). Arayüz yüklendiğinde Pano onu sizin için çağırır — aşağıdaki [Arayüz yüklendiğinde ne olur](#arayuz-yuklendiginde-ne-olur) bölümüne bakın — ve ona `isPanel` bayrağı olan bir `pano` nesnesi geçirir:

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

Yani jar, Pano'nun JVM'inde çalışan bir backend ve iki Node/tarayıcı bağlamında çalışan bir arayüz taşır, hepsi tek bir kaynak dosyaları klasöründen derlenir. Bu sayfanın geri kalanı bunların her birini çalışma zamanında yaşadığı yere kadar takip eder.

## Her dosya nerede biter

İşte Shoutbox eklentisinin deposu, her parçanın çalışma zamanında neye dönüştüğüne dair bir notla. Klasör adları geleneksel kurallardır, ama `src/` (arayüz) ile `src/main/` (backend + kaynaklar) arasındaki ayrım sabittir.

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

Yukarıdaki klasör adlarından ikisi sade bir açıklamayı hak eder:

- `dao/` ile `impl/` arasındaki ayrım: `dao/` sınıfı **soyuttur** ve yalnızca her veritabanı sorgusunu *bildirir*; eşleşen `impl/` sınıfı somut olanıdır — `@Dao` açıklamasını taşıyan ve sorguları gerçekten *çalıştıran* kodu tutan sınıf odur.
- `migration/` — bir migration (göç), eklentinizin yeni bir sürümü tabloların veya yapılandırmanın şeklini değiştirdiğinde (örneğin bir sütun eklemek) mevcut bir kurulumun tablolarını veya yapılandırmasını yükselten küçük bir sınıftır. Yalnızca geride kalmış kurulumlarda, bir kez çalışır.

Ağacın geri kalanını okumak için iki kural:

- `src/main/kotlin` ve `src/main/resources` altındaki her şey **backend jar içeriğidir**. Kotlin sınıflara derlenir; kaynaklar (yapılandırma, görseller, dil dosyaları) değişmeden kopyalanır; ikisi de jar'a gider.
- `src/` altındaki ama `src/main/` *dışındaki* her şey (`main.js`, `panel/`, `theme/`) **arayüz kaynağıdır**. Derlediğinizde, derleyici onu backend kaynaklarınızın içine inen dosyalara dönüştürür:

| Arayüz kaynağı (siz yazarsınız) | Derlenen çıktı (derleme yazar) |
|---|---|
| `src/main.js`, `src/panel/`, `src/theme/` | `src/main/resources/plugin-ui/` |

Evet — derleme çıktısını *kaynak ağacınıza geri*, `src/main/resources/` içine yazar. Bu kasıtlıdır: derlenen arayüzü `resources/` altına koymak, tam olarak onu aynı jar'ın içine zipleyip gönderen şeydir. (Bu, `plugin-ui/`'nin neden gitignore edildiğinin de nedenidir — her derlemede yeniden üretilir, bu yüzden commit'lenecek bir şey yoktur.)

::: tip Buradaki her klasör giriş sınıfı hariç isteğe bağlıdır
`config/`, `db/`, `event/`, `permission/`, `log/` yalnızca geleneğin şeyleri koyduğu yerlerdir. Pano sınıflarınızı **açıklamalarına** göre bulur — bir açıklama, bir sınıfın üstüne yazılan `@BirŞey` etiketidir ve Pano derlenmiş sınıflarınızı bu etiketler için tarar — klasörlerine göre değil (bir sonraki bölümde daha fazlası). `pano-plugin-cookies` gibi yalnızca-yapılandırma eklentisi bu klasörlerin neredeyse hiçbirine sahip değildir; `pano-plugin-announcement` gibi tam bir CRUD eklentisi (create/read/update/delete — yani hem veritabanı tabloları *hem de* endpoint'leri vardır) hepsine sahiptir.
:::

::: tip Kendiniz görün
Derlenen `*.jar`'ınızı kopyalayın ve kopyayı `*.zip` olarak yeniden adlandırın, sonra onu açın (jar yalnızca bir zip'tir). İçinde `locales/` klasörünüzün ve `logo.png`'nin yanında duran bir `plugin-ui.zip` bulmalısınız — o tek `plugin-ui.zip`, içine paketlenmiş, tüm derlenmiş arayüzünüzdür.
:::

## Backend yüklendiğinde ne olur

Daha önce Minecraft eklentileri yazdıysanız, burada **`plugin.yml` olmadığını** not edin. Her iki durumda da, tüm meta veriler — id, ana sınıf, gerekli Pano sürümü — jar'ın `MANIFEST.MF`'inde (her jar'ın içinde onu tanımlayan küçük bir metin dosyası) yaşar, derleme zamanında `gradle.properties`'ten sizin için yazılmıştır. Hangi anahtarın hangi özniteliğe eşlendiğini görmek için [Manifest Yapılandırması](/tr/addon/manifest/) sayfasına bakın.

::: tip Kendiniz görün
Derlenen jar'ınızı yine bir zip olarak açın ve `META-INF/MANIFEST.MF`'i bir metin editöründe okuyun — içinde listelenmiş eklentinizin id'sini ve ana sınıfını görmelisiniz.
:::

Pano jar'ınızı yüklediğinde, PF4J manifestte adlandırılan ana sınıfı bulur, onu örnekler ve yaşam döngüsü kancalarınızı **sırayla** çağırır:

```text
jar load → onCreate() → onEnable() → onStart() → … running … → onStop() → onDisable() → onUninstall()
```

- Tüm kancalar `suspend` fonksiyonlarıdır (`suspend`, Kotlin'in asenkron işaretçisidir — pratikte Pano'nun veritabanı ve ağ fonksiyonlarını doğrudan bu kancaların içinde çağırabileceğiniz anlamına gelir) ve hepsi varsayılan olarak hiçbir şey yapmaz — yalnızca ihtiyacınız olanları geçersiz kılarsınız.
- `onStart()`, çoğu eklentinin kurulumunu yaptığı yerdir (veritabanını başlatın, yapılandırmayı yükleyin). [Backend Geliştirme](/tr/addon/backend/) eğitimi kanonik deseni adım adım anlatır.
- `onUninstall()`, yalnızca site sahibi eklentiyi panelde **sildiğinde** çağrılır — yalnızca devre dışı bıraktığında değil. `pano-plugin-shoutbox`'ın `shout` tablosunu veritabanından burada sileceği yer burasıdır.

::: tip Kendiniz görün
`onStart()` içine bir `logger.info(...)` satırı koyun, yeniden derleyin ve eklentiyi yeniden yükleyin — satır Pano'nun konsolunda görünür. Yaşam döngüsünün gerçekten tetiklendiğini izlemenin en basit yolu budur.
:::

### Sınıflarınız otomatik olarak bulunur

Eklentiniz yüklendiğinde, Pano paketinizdeki her sınıfı — `com.panomc.plugins.shoutbox` ve altındaki her şey — gezer. Aşağıdaki tablodaki etiketlerden birini (yani `@BirŞey` açıklamaları) taşıyan herhangi bir sınıf sizin için otomatik olarak oluşturulur; bunları asla kendiniz inşa etmezsiniz.

Dahası, Pano her sınıfın ihtiyaç duyduğu şeyi doldurur. Endpoint'iniz veritabanını okumak için `ShoutDao`'ya ihtiyaç duyuyorsa, yalnızca `ShoutDao`'yu bir kurucu parametresi olarak listelersiniz, Pano da hazır bir örneği içeri geçirir — asla `ShoutDaoImpl()` yazmazsınız. Bir sınıfa bağımlı olduğu şeyleri onları inşa etmesini sağlamak yerine vermeye **bağımlılık enjeksiyonu** denir.

| Açıklama | Neyi kaydeder |
|---|---|
| `@Endpoint` | bir HTTP rotası — eklenti yüklenir yüklenmez canlıya geçer |
| `@Dao` | tablolarınızdan biri için bir veritabanı erişim nesnesi — soyut DAO'ya değil, somut *impl* sınıfına konur |
| `@Migration` | eski bir veritabanını veya yapılandırmayı yeni sürümünüze getirmek için kurulum başına bir kez çalışır |
| `@EventListener` | platform olayları için bir dinleyici (kurulum tamamlandı, oyuncu silindi, …) |
| `@PermissionDefinition` | panelin verebileceği bir izin düğümü |

Asla bir "bu endpoint'i kaydet" metodu çağırmazsınız — sınıfı açıklamayla işaretlemek kaydın *kendisidir*. `@Endpoint` sınıfları tarafından bildirilen rotalar eklenti yüklendiğinde gelir ve eklenti kaldırıldığında yeniden kaldırılır, bu yüzden bir eklentiyi etkinleştirmek ve devre dışı bırakmak onun API'sini temiz bir şekilde ekler ve kaldırır.

Tüm bunları yapan çerçeve **Spring**'dir. Her eklenti kendi Spring *uygulama bağlamını* alır (Spring'in oluşturduğu nesneleri tutan izole bir kap) ve Spring paketinizi *bileşen-tarar* — o tarama, yukarıdaki "her sınıfı gez" adımıdır. Spring'in oluşturduğu ve yönettiği bir nesne için kullandığı kelime **bean**'dir, bu yüzden "bean'leriniz otomatik olarak bulunur" yalnızca "açıklamalı sınıflarınız sizin için oluşturulur"un süslü bir söyleniş biçimidir.

::: tip Pano'nun kendi servislerine ulaşmak
**Kısa versiyon:** kendi sınıflarınız kuruculara otomatik olarak görünür; Pano'nun yerleşik servislerinden birini kullanmak için, onu aşağıdaki tek satırla getirirsiniz. Bu servisler `DatabaseManager`, `AuthProvider`, `SetupManager`, `PluginDatabaseManager` ve daha fazlasını içerir — kodunuz Pano'nun kendisine ait bir şeye ihtiyaç duyduğunda onlara başvurursunuz (örneğin, `SetupManager`'a ilk kurulumun bitip bitmediğini sormak).

Aşağıdaki satır hakkında iki şey: `applicationContext`, `PanoPlugin`'den miras alınır (giriş sınıfınız onu genişletir) ve `by lazy`, bean'in başlangıçta değil, `setupManager`'ı gerçekten kullandığınız ilk seferde getirildiği anlamına gelir. (`SetupManager::class.java` yalnızca Kotlin'in istediğiniz türü adlandırma biçimidir.)

```kotlin
private val setupManager by lazy {
    applicationContext.getBean(SetupManager::class.java)
}
```

Her host servisine bu şekilde ulaşırsınız — servisin türüyle `applicationContext.getBean(...)`.

**İleri düzey, getirmenin neden gerekli olduğunu merak ediyorsanız:** eklentinizin bean'leri `pluginBeanContext` adlı bir bağlamda yaşarken, Pano'nun servisleri *ayrı* bir host bağlamında (`applicationContext`) yaşar. Bileşen taraması yalnızca sizin paketinizi görür, bu yüzden host servisleri kurucularınıza **enjekte edilemez** — onları yukarıdaki gibi açıkça istemeniz gerekir.
:::

## Arayüz yüklendiğinde ne olur

Arayüz asla gevşek dosyalar olarak gönderilmez. Bir yayın derlemesi çalıştırdığınızda, derlenmiş `plugin-ui/{client,server}` klasörleri tek bir jar kaynağına, **`plugin-ui.zip`**'e ziplenir. Oradan:

1. Yüklemede, Pano o zip'in bir **arayüz hash'ini** hesaplar ve eklentiniz için tema ve panelin zaten çağırdığı site-info API'si (`/api/siteInfo`) aracılığıyla `{ version, uiHash }` duyurur.
2. Tema (tarayıcı), önbellek kırıcı bir sorguyla — `client.mjs?v=<uiHash>` — **istemci** paketinizi içe aktarır, böylece yeni bir derleme eski önbelleğe alınmış kopyayı geçersiz kılar. Node işlemi SSR için **sunucu** paketini, `server/server.mjs`, içe aktarır.
3. İçe aktarıldıktan sonra, Pano varsayılan-dışa aktarılan sınıfınızı inşa eder ve onun `onLoad()`'ını çağırır — bu sayfanın başındaki aynı `onLoad()`. Bu, arayüzün eklediği her şeyi kaydettiğiniz tek giriş noktasıdır: kancalar, sayfalar, gezinme bağlantıları.

::: tip Kendiniz görün
Tarayıcınızın geliştirici araçlarını açın, **Network** sekmesine gidin ve eklentinizi kullanan bir sayfa yükleyin. `client.mjs?v=<hash>` isteğini bulun — o `<hash>`, Pano'nun tarayıcıya az önce verdiği arayüz hash'idir.
:::

Arayüz hash'i esas olarak **yayınlanmış** eklentiler için önemlidir ve geliştirmede farklı davranır:

- **Yayınlanmış:** yeni bir sürüm yeni bir zip gönderir, böylece hash değişir ve önbellek kırıcı sorgu taze paketi çeker.
- **Geliştirme modu:** [Geliştirme Modu](/tr/addon/getting-started/) açıkken, Pano her istekte arayüz zip'inizi diskten yeniden derler. Hash o zaman gerçek bir içerik hash'i değildir — sabit bir yer tutucu değer, `dev-build`'dir — ve tema paketi önbelleğe almak yerine her istekte yeniden getirir. Bir `bun run dev` değişikliğinin F5'te görünmesini sağlayan şey budur.

[Frontend Geliştirme](/tr/addon/frontend/) eğitimi `onLoad()` içinde ne yaptığınızı kapsar.

## Paylaşılan Svelte çalışma zamanı

Bu, arayüz hakkında anlaşılması gereken en önemli tek şeydir ve herkesi şaşırtan bir kuralı açıklar.

İstemci paketiniz **Svelte, `svelte-i18n` veya `@panomc/sdk` içermez.** Rollup derlemesi bu içe aktarmaları kasten *harici* bırakır: derlenen dosya hâlâ tam anlamıyla `import ... from 'svelte'` der ve hiçbir şey içeri kopyalanmamıştır — bu yüzden çalışma zamanında bir şeyin o içe aktarmayı yanıtlaması gerekir.

O bir şey host'tur (tema veya panel). Bir **import map** sağlar — tarayıcının `'svelte'` gibi çıplak bir adın aslında nereden yüklenmesi gerektiğini öğrenmek için okuduğu küçük bir JSON parçası — ve o harita bu içe aktarmaların her birini bir `/runtime/...` URL'sine yönlendirir. Her `/runtime` URL'si yalnızca host'un modülün kendi canlı kopyasını yeniden dışa aktarır.

Sonuç, Pano'nun ve tüm eklentilerinin **tek bir** Svelte çalışma zamanı ve **tek bir** SDK örneği paylaşmasıdır. Pratikte bu, bileşenlerinizin ve temanın bileşenlerinin, sanki her zaman tek bir uygulamaymışlar gibi durumu paylaştığı ve birlikte yeniden render edildiği anlamına gelir. Eklentiniz Svelte veya SDK'nın kendi özel kopyasını paketleseydi, o kopyanın kendi ayrı durumu olurdu ve hydration (bu sayfanın başından — tarayıcının sunucu-render'lı HTML'e yeniden bağlanması) bozulurdu.

::: tip Kendiniz görün
Herhangi bir tema sayfasını açın ve **Kaynağı Görüntüle**'yi kullanın (JavaScript çalışmadan önceki ham HTML). Eklentiniz o sayfada bir şey render ediyorsa, işaretlemesini HTML'de zaten orada duruyor göreceksiniz — bu, tarayıcının hydrate etmek üzere olduğu sunucu-render'lı çıktıdır.
:::

Sert bir sonucu var: derlenmiş Svelte çıktısının yalnızca üzerinde çalışacağı **tam olarak aynı** Svelte sürümüne karşı çalışması garanti edildiğinden, derlemenizin derleyici sürümü host'unkiyle tam olarak eşleşmelidir. Svelte'i asla kendiniz sabitlememenizin nedeni budur — `@panomc/sdk` doğru sürümü sabitler ve `rollup.config.js`'iniz bir uyumsuzlukta derlemeyi reddeder.

::: warning `package.json`'ınıza asla `svelte` eklemeyin
Svelte sürümü sizden değil, `@panomc/sdk`'nın sabitlemesinden gelir. `svelte`'i kendiniz listelerseniz, bun `@panomc/sdk`'nın sabitlediğinden farklı bir sürüm kurabilir ve derleme tam olarak buna karşı korur: bir sürüm uyumsuzluğunda, `rollup.config.js` bir hata yazdırır ve derleme başarısız olur (çıkış kodu 1) — kasten. Sürüm sapması hydration'ı hata ayıklaması acı verici şekillerde bozar, bu yüzden koruma sizi göndermeden önce durdurur. Herhangi bir `svelte` girişini kaldırın ve yeniden kurun.
:::

Bunun açıkladığı bir şey daha: harici kalan *tek* çıplak içe aktarmalar Svelte, `svelte-i18n` ve `@panomc/sdk`'dır (ve alt yollarıdır). "Çıplak" bir içe aktarma, `./file.js` gibi bir yol yerine paket adıyla yazılan — `import x from 'chart.js'` — bir içe aktarmadır. İçe aktardığınız başka her şey — bir grafik kütüphanesi gibi üçüncü taraf bir paket — host shim'i yoktur, bu yüzden derlemenize **paketlenmelidir**. O kısım otomatiktir: yalnızca `bun add` ile ekleyin ve içe aktarın, derleme onu kendisi içeri kopyalar — yalnızca o üç paylaşılan ad özeldir. [Arayüz API Referansı](/tr/addon/api-reference/) izin verilen çıplak belirteçlerin tam kümesini listeler.

## Verileriniz çalışma zamanında nerede yaşar

Çalışma zamanında eklentiniz çok farklı iki depolama konumuna dokunur ve onları ayrı tutmak yardımcı olur:

| Konum | Ne tutar | Onu kim yazar |
|---|---|---|
| `plugins/<pluginId>/` (veri dizini) | `config.conf`, yüklenen dosyalar, eklentinizin diske kalıcı kıldığı her şey | ilk yüklemede otomatik oluşturulur; onu siz yazarsınız (örn. Backend Geliştirme'de gösterilen `PluginConfigManager` aracılığıyla) |
| Jar'ın içinde (kaynaklar) | `locales/*.json`, `logo.png`, `plugin-ui.zip` | derleme zamanında gömülür — çalışma zamanında **salt okunur** |

Veri dizini `pluginId`'nizin adını taşır (Shoutbox için `plugins/pano-plugin-shoutbox/`) ve yeniden başlatmalar boyunca hayatta kalır — kurulum başına durumun ait olduğu yer burasıdır. **Yayınlanmış** bir jar'da bu kaynaklar jar derlendiği anda sabittir. **Geliştirme** sırasında ise Pano onları kaynak ağacınızdan canlı sunar: Geliştirme Modu açıkken `locales/*.json`'ı doğrudan diskten okur ve her istekte arayüz zip'inizi diskten yeniden derler — bu, düzenle-ve-yenile döngüsünü çalıştıran şeydir. Kotlin kodu, asla sıcak yeniden yüklenmeyen tek şeydir — Kotlin değişiklikleri bir yeniden derleme ve bir Pano yeniden başlatması gerektirir. (Başlangıç'ta tam sıcak-ile-yeniden-derleme tablosu var.)

## Sonraki adım

Artık zihinsel modele sahip olduğunuza göre, inşa edecek bir taraf seçin:

- **[Backend Geliştirme](/tr/addon/backend/)** — bir tablo ekleyin, bir API açığa çıkarın, onu bir izinle koruyun, bir eylemi günlüğe kaydedin.
- **[Frontend Geliştirme](/tr/addon/frontend/)** — ana sayfaya bir bileşen yerleştirin, bir panel sayfası ekleyin, API'nizi çağırın.
- **[Manifest Yapılandırması](/tr/addon/manifest/)** — jar'ınızın manifestosu olan `gradle.properties` anahtarları.

Gerçek eklenti kodu okumak ister misiniz? Yukarıda başvurulan iki örnek `pano-plugin-cookies` (yalnızca-yapılandırma, neredeyse hiç backend klasörü yok) ve `pano-plugin-announcement`'tır (hepsini kullanan tam bir CRUD eklentisi).
