# Mimari

[Başlangıç](/tr/addon/getting-started/) sayfasında bir eklenti oluşturup yüklediniz. Bu sayfa, aslında ne olduğunu açıklıyor: o tek jar'ın içinde ne var, Pano onu yüklediğinde ne yapar ve yazdığınız her dosya çalışma zamanında nerede son bulur.

Sayfanın sonunda, tüm yükleme yaşam döngüsünü açıklayabilecek, **`svelte`'i neden asla bir bağımlılık olarak eklememeniz gerektiğini** bilecek ve eklenti çalışırken depodaki her dosyanın nerede yaşadığını gösterebilecek durumda olacaksınız.

## Bir jar, üç çalışma ortamı

Bir eklenti **tek bir jar** olarak dağıtılır, ancak içindeki kod üç farklı yerde çalışır:

1. **Kotlin backend** — [PF4J](https://pf4j.org/) tarafından doğrudan Pano JVM'ine yüklenir. Bunlar sizin uç noktalarınız (endpoint), veritabanı tablolarınız, izinleriniz ve olay dinleyicilerinizdir. Pano'nun kendisiyle aynı süreçte çalışır.
2. **Bir Svelte *client* paketi** — ziyaretçinin tarayıcısında, **hem** panelin **hem de** etkin temanın içinde çalışır. Bu, bir kullanıcının gerçekten tıkladığı arayüzdür.
3. **Bir Svelte *server* paketi** — aynı arayüzün, **sunucu tarafı render (SSR)** için derlenmiş hali. Tema ve panel, bileşenlerinizi tarayıcı görmeden önce HTML'e render eden Node süreçleridir.

Önemli olan kısım: **tek bir** arayüz giriş dosyası vardır, `src/main.js`, ve o hem panele *hem de* temaya hizmet eder. İki arayüz yazmazsınız — bir tane yazar ve nerede çalıştığına göre dallanırsınız:

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

Yani jar, Pano'nun JVM'inde çalışan bir backend ile iki Node/tarayıcı bağlamında çalışan bir arayüz taşır; hepsi tek bir kaynak ağacından derlenir. Bu sayfanın geri kalanı, bunların her birini çalışma zamanındaki yerine kadar takip eder.

## Her dosya nerede son bulur

Shoutbox eklentisinin deposu, her parçanın çalışma zamanında neye dönüştüğüne dair bir notla birlikte aşağıda. Bunu boilerplate'in birlikte geldiği ağaçla karşılaştırın — klasör adları birer gelenektir, ancak `src/` (arayüz) ile `src/main/` (backend + kaynaklar) arasındaki ayrım sabittir.

```text
pano-plugin-shoutbox/
├─ build.gradle.kts             # Gradle build
├─ gradle.properties            # the manifest — id, class, versions (see Manifest page)
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
│     │  │  ├─ dao/             # ShoutDao (abstract)
│     │  │  ├─ impl/            # ShoutDaoImpl (@Dao)
│     │  │  ├─ model/           # Shout entity
│     │  │  └─ migration/       # DatabaseMigration classes
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
│        └─ plugin-ui/          # built UI — zipped into plugin-ui.zip at build time
```

Bunu okumak için iki kural:

- `src/main/kotlin` ve `src/main/resources` altındaki her şey **backend jar içeriğidir**. Olduğu gibi derlenir ve jar'a paketlenir.
- `src/` altındaki ancak `src/main/` *dışındaki* her şey (`main.js`, `panel/`, `theme/`) **arayüz kaynağıdır**. Derleme, bunu `src/main/resources/plugin-ui/` içine derler; bu klasör de aynı jar'ın içine zip'lenerek gönderilir.

::: tip Buradaki her klasör, giriş sınıfı dışında isteğe bağlıdır
`config/`, `db/`, `event/`, `permission/`, `log/` yalnızca geleneğin şeyleri koyduğu yerlerdir — Pano sınıflarınızı klasörlerine göre değil, anotasyonlarına göre bulur (bir sonraki bölümde daha fazlası). `pano-plugin-cookies` gibi yalnızca-yapılandırma bir eklentinin neredeyse hiçbiri yoktur; `pano-plugin-announcement` gibi bir CRUD eklentinin ise hepsi vardır.
:::

## Backend yüklenirken ne olur

Pano'nun **`plugin.yml`'si yoktur.** Tüm meta veriler — id, ana sınıf, gereken Pano sürümü — jar'ın `MANIFEST.MF`'inde bulunur ve derleme sırasında sizin için `gradle.properties`'ten yazılır. Tam olarak hangi anahtarın hangi özelliğe eşlendiği için [Manifesto Yapılandırması](/tr/addon/manifest/) sayfasına bakın.

Pano jar'ınızı yüklediğinde, PF4J manifestoda adı geçen ana sınıfı bulur, örneğini oluşturur ve yaşam döngüsü kancalarınızı **sırayla** çağırır:

```text
jar load → onCreate() → onEnable() → onStart() → … running … → onStop() → onDisable() → onUninstall()
```

- Tüm kancalar `suspend` fonksiyonlardır ve hepsinin varsayılanı **hiçbir şey yapmamaktır (no-op)** — yalnızca ihtiyaç duyduklarınızı geçersiz kılarsınız (override).
- `onStart()`, çoğu eklentinin kurulumunu yaptığı yerdir (veritabanını başlat, yapılandırmayı yükle). [Backend Geliştirme](/tr/addon/backend/) eğitimi kanonik deseni adım adım anlatır.
- `onUninstall()` yalnızca site sahibi eklentiyi panelde **sildiğinde** çağrılır — yalnızca devre dışı bıraktığında değil. `pano-plugin-shoutbox`'ın `shout` tablosunu düşüreceği (drop) yer burasıdır.

### Bean'leriniz otomatik bulunur

Eklentiniz yüklendiği anda Pano ona **kendi Spring uygulama bağlamını** verir ve **yalnızca sizin paket alt ağacınızı** bileşen olarak tarar (`com.panomc.plugins.shoutbox` ve altı). Bu anotasyonlardan birini taşıyan herhangi bir sınıf, yapıcı (constructor) bağımlılıkları enjekte edilerek sizin için örneklenir:

| Anotasyon | Neyi kaydeder |
|---|---|
| `@Endpoint` | bir HTTP rotası — eklenti yüklendiği an devreye girer |
| `@Dao` | tablolarınızdan biri için bir veritabanı erişim nesnesi |
| `@Migration` | bir şema veya yapılandırma migration'ı |
| `@EventListener` | platform olayları için bir dinleyici (kurulum tamamlandı, oyuncu silindi, …) |
| `@PermissionDefinition` | panelin verebileceği bir izin düğümü |

Asla bir "bu uç noktayı kaydet" metodu çağırmazsınız — sınıfı anotasyonlamak kaydın kendisidir. `@Endpoint` sınıfları tarafından bildirilen rotalar eklenti yüklendiğinde devreye girer ve tekrar kaldırıldığında yeniden çıkarılır, böylece bir eklentiyi etkinleştirmek ve devre dışı bırakmak, API'sini temiz bir şekilde ekler ve kaldırır.

::: tip İki Spring bağlamı ve hangi bean'leri enjekte edebileceğiniz
Eklentiniz `pluginBeanContext` içinde yaşar — *sizin* bean'leriniz (DAO'larınız, uç noktalarınız, dinleyicileriniz). Pano'nun kendi servisleri ayrı olan host `applicationContext` içinde yaşar: `DatabaseManager`, `AuthProvider`, `SetupManager`, `PluginDatabaseManager` ve daha fazlası.

Host bean'leri yapıcılarınıza enjekte **edilemez** — tarayıcı yalnızca sizin paketinizi görür. Bir host servisine ulaşmak için onu açıkça getirin:

```kotlin
private val setupManager by lazy {
    applicationContext.getBean(SetupManager::class.java)
}
```

Her host bean'ine bu yolla ulaşırsınız — bean'in türüyle birlikte `applicationContext.getBean(...)`.
:::

## Arayüz yüklenirken ne olur

Arayüz asla gevşek dosyalar olarak gönderilmez. Bir yayın (release) derlemesi çalıştırdığınızda, derlenmiş `plugin-ui/{client,server}` klasörleri tek bir jar kaynağı olan **`plugin-ui.zip`** içine zip'lenir. Oradan itibaren:

1. Yüklemede, Pano o zip'in bir **arayüz hash'ini (UI hash)** hesaplar ve eklentiniz için `{ version, uiHash }`'i, tema ve panelin zaten çağırdığı site-bilgisi (site-info) API'si üzerinden duyurur.
2. Tema (tarayıcı), **client** paketinizi bir önbellek-kırıcı sorguyla içe aktarır — `client.mjs?v=<uiHash>` — böylece yeni bir derleme, eski önbelleklenmiş kopyayı geçersiz kılar. Node süreci ise SSR için **server** paketini, `server/server.mjs`'i içe aktarır.
3. İçe aktarıldıktan sonra Pano, varsayılan olarak dışa aktardığınız sınıfı oluşturur ve onun `onLoad()`'unu çağırır. Bu, arayüzün eklediği her şeyi kaydettiğiniz tek giriş noktasıdır — kancalar, sayfalar, gezinme bağlantıları.

Arayüz hash'i esas olarak **yayınlanmış** eklentiler için önemlidir: yeni bir sürüm yeni bir zip gönderir, hash değişir ve önbellek-kırıcı sorgu taze paketi çeker. Geliştirme sırasında mekanizma farklıdır — [Geliştirme Modu](/tr/addon/getting-started/) açıkken Pano arayüz zip'inizi her istekte diskten yeniden derler (hash, bir içerik hash'i yerine bir `dev-build` işaretine dönüşür) ve tema o paketi önbelleklemek yerine her istekte yeniden getirir. Bir `bun run dev` değişikliğinin F5'te görünmesini sağlayan şey budur. [Arayüz Geliştirme](/tr/addon/frontend/) eğitimi, `onLoad()` içinde neler yaptığınızı kapsar.

## Paylaşılan Svelte çalışma zamanı

Bu, arayüz hakkında anlaşılması gereken en önemli tek şeydir ve herkesi şaşırtan bir kuralı açıklar.

Client paketiniz Svelte'i, `svelte-i18n`'i veya `@panomc/sdk`'yi **içermez.** Rollup derlemesi, bu içe aktarımları gönderilen pakette bilerek *external* — çözümlenmemiş — bırakır. Çalışma zamanında host (tema veya panel), bunların her birini kararlı bir `/runtime` shim'ine çözümleyen bir içe aktarma haritası (import map) sağlar ve her shim, **host'un kendi** canlı modül örneğini yeniden dışa aktarır.

Sonuç olarak Pano ve tüm eklentileri **tek** bir Svelte çalışma zamanını ve **tek** bir SDK örneğini paylaşır: aynı efekt zamanlayıcısı, aynı store'lar, aynı bağlamlar. Eğer eklentiniz Svelte'in veya SDK'nın kendi özel kopyasını paketleseydi, o kopyanın kendi ayrı durumu olurdu ve hydration — tarayıcının sunucuda render edilmiş HTML'e yeniden bağlanması — bozulurdu.

Bunun katı bir sonucu var: derlenmiş Svelte çıktısının yalnızca üzerinde çalışacağı **tam olarak aynı** Svelte sürümüne karşı çalışması garanti edildiğinden, derlemenizin derleyici sürümü host'unkiyle tam olarak eşleşmelidir. Svelte'i kendiniz asla sabitlemenizin nedeni budur — `@panomc/sdk` doğru sürümü sabitler ve `rollup.config.js`'iniz bir uyuşmazlıkta derlemeyi reddeder.

::: warning `svelte`'i `package.json`'ınıza asla eklemeyin
Svelte sürümü sizden değil, `@panomc/sdk`'nin sabitlemesinden gelir. `svelte`'i kendiniz bildirirseniz, bir geçersiz kılma (override) Pano host'unun sunduğu sürümden sapabilir ve derleme tam da buna karşı korur: bir sürüm uyuşmazlığında `rollup.config.js` bir hata yazdırır ve **1 koduyla çıkar** — derleme bilerek başarısız olur. Sürüm sapması, hydration'ı hata ayıklaması acı verici şekillerde bozar, bu yüzden koruma sizi göndermeden önce durdurur. Herhangi bir `svelte` girdisini kaldırın ve yeniden kurun.
:::

Bunun açıkladığı bir şey daha: external kalan *tek* çıplak içe aktarımlar (bare imports) Svelte, `svelte-i18n` ve `@panomc/sdk`'dir (ve onların alt yolları). İçe aktardığınız başka her şey — bir grafik kütüphanesi gibi üçüncü taraf bir paket — hiçbir host shim'ine sahip değildir ve derlemenize **paketlenmelidir**. İzin verilen çıplak belirteçlerin (bare specifier) tam kümesini [Arayüz API Referansı](/tr/addon/api-reference/) listeler.

## Verileriniz çalışma zamanında nerede yaşar

Çalışma zamanında eklentiniz çok farklı iki depolama konumuna dokunur ve bunları ayrı tutmak yararlıdır:

| Konum | Ne tutar | Kim yazar |
|---|---|---|
| `plugins/<pluginId>/` (veri dizini) | `config.conf`, yüklenen dosyalar, eklentinizin diske kalıcılaştırdığı her şey | ilk yüklemede otomatik oluşturulur; onu siz yazarsınız (örn. `PluginConfigManager` aracılığıyla) |
| Jar'ın içinde (kaynaklar) | `locales/*.json`, `logo.png`, `plugin-ui.zip` | derleme sırasında gömülür — çalışma zamanında **salt okunur** |

Veri dizini `pluginId`'nizden sonra adlandırılır (Shoutbox için `plugins/pano-plugin-shoutbox/`) ve yeniden başlatmalar boyunca varlığını sürdürür — kurulum başına durumun ait olduğu yer burasıdır. **Yayınlanmış** bir jar'da bu kaynaklar, jar derlendiği anda sabitlenir. Ancak **geliştirme** sırasında Pano bunları kaynak ağacınızdan canlı olarak sunar: Geliştirme Modu açıkken `locales/*.json`'ı doğrudan diskten okur ve arayüz zip'inizi her istekte diskten yeniden derler — düzenle-ve-yenile döngüsünü işleten şey tam olarak budur. Asla sıcak olmayan tek şey Kotlin kodudur: bir yeniden derleme ve bir Pano yeniden başlatması gerektirir. (Sıcak-mı-yeniden-derleme-mi tablosunun tamamı Başlangıç'tadır.)

## Sırada ne var

Artık zihinsel modele sahip olduğunuza göre, oluşturmak için bir taraf seçin:

- **[Backend Geliştirme](/tr/addon/backend/)** — bir tablo ekleyin, bir API açığa çıkarın, onu bir izinle koruyun, bir eylemi günlüğe kaydedin.
- **[Arayüz Geliştirme](/tr/addon/frontend/)** — ana sayfaya bir bileşen yerleştirin, bir panel sayfası ekleyin, API'nizi çağırın.
- **[Manifesto Yapılandırması](/tr/addon/manifest/)** — jar'ınızın manifestosu olan `gradle.properties` anahtarları.
