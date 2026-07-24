# Premium Eklentiler ve Lisanslama

Bu sayfa size eklentinizi resmi Pano Pazar Yeri'nde nasıl satacağınızı ve Pano'nun onun yalnızca gerçekten ödeme yapan sunucularda çalışmasını nasıl sağlayacağını gösterir.

Satış, ücretsiz bir eklentiyle tam olarak aynı yayın akışıyla, artı iki ekstra parçayla çalışır: **jar'ınıza** (eklentinizin gönderildiği tek derlenmiş dosya) gömülü bir **derleme-zamanı lisans anahtarı** ve kodunuzda bir **çalışma-zamanı lisans kontrolü**. Başka bir deyişle: eklentinizi derlerken içine küçük bir doğrulama anahtarı dosyası eklersiniz (bu *derleme-zamanı* kısmıdır) ve eklenti başladığında o anahtarı sunucunun ödeme yaptığını kontrol etmek için kullanır (bu *çalışma-zamanı* kısmıdır). Bu, [Derleme ve Yayınlama](/tr/addon/publishing/#premium-ilanlar)'nın işaret ettiği tam adım adım kılavuzdur.

Henüz ücretsiz bir eklenti yayınlamadıysanız, önce [Derleme ve Yayınlama](/tr/addon/publishing/)'yı okuyun — oradaki her şey (yayın derlemesi, sürümleme, yayın kanalları, `.releaserc.json`, kaynağı ve API jetonunu oluşturma) hâlâ geçerlidir. Bu sayfa yalnızca premium katmanını üstüne ekler.

::: tip Özet — premium'a geçmek üç küçük değişikliktir
Bu sayfanın çoğu arka plandır. Asıl iş minicik:

1. **Bir derleme bayrağı ekleyin** (veya bir CI ortam değişkeni), böylece jar'ınız bir lisans anahtarıyla derlenir — [Adım 1](#adım-1-lisans-anahtarını-derleme-zamanında-gomun).
2. **Boilerplate'in mevcut lisans kontrolünü tutun** — taze bir `pano-boilerplate-plugin`'in zaten sahip olduğu iki kısa metot — [Adım 2](#adım-2-calısma-zamanı-lisans-kontrolunu-ekleyin).
3. **Ücretli bir kaynak olarak yayınlayın** — *ücretli* fiyatlandırmayı seçin ve `useGitHubLink: false` ayarlayın — [Adım 3](#adım-3-ucretli-bir-kaynak-olarak-yayınlayın).

Sonra [kendiniz test edin](#kendiniz-test-edin). [Kaputun altında nasıl çalışır](#kaputun-altında-nasıl-calısır) altındaki her şey isteğe bağlı okumadır.
:::

::: warning Hiçbir koruma mutlak değildir
Bu sistemin ne yapabileceği ve ne yapamayacağı konusunda kendinize karşı dürüst olun: **hiçbir lisans sistemi kodu %100 koruyamaz**. Buradaki amaç, yetkisiz kullanımı kullanıcıların büyük çoğunluğu için mümkün olduğunca zorlaştırmaktır — imkânsız kılmak değil. Her yazılım parçası gibi, son kullanıcının eline geçen herhangi bir kod doğası gereği açıktır: yeterince kararlı ve yetenekli biri onu her zaman parçalayabilir. Bu, yalnızca Pano'nunki değil, şimdiye kadar yapılmış her DRM için geçerlidir. Eklentinizi bu gerçeği akılda tutarak fiyatlandırın ve destekleyin.
:::

## Adım 1: Lisans anahtarını derleme zamanında gömün

Premium derleme, genel doğrulama anahtarını jar'ınıza koyan birkaç ekstra girdi kabul eder. Bunlar **derlerken** geçirdiğiniz seçeneklerdir — komut satırında veya otomatik derlemenizde ortam değişkenleri olarak — deponuzdaki herhangi bir dosyaya yazdığınız bir şey **değil** (bkz. [Manifest Yapılandırması → Premium derleme properties'i](/tr/addon/manifest/#premium-derleme-propertiesi)).

Bunların **hiçbirini** geçirmezseniz, eklentiniz normal bir **ücretsiz** jar olarak derlenir ve çalışma-zamanı kontrolü hiçbir şey yapmaz (bir "no-op") — böylece aynı kaynak, kod değişikliği olmadan ücretsiz veya premium gönderilebilir.

::: tip Bir eklentiyi asla bir yapılandırma dosyasında "premium" olarak işaretlemezsiniz
Bir eklenti **yalnızca onu bir lisans anahtarıyla derlediğiniz için** premium'dur — başka hiçbir şey için değil. Bir anahtarla derleyin → premium; anahtarsız derleyin → ücretsiz, aralarında kod değişikliği yok. Hiçbir yapılandırma dosyasını düzenlemezsiniz ve hiçbir yerde bir `premium` alanı yoktur (ne `gradle.properties`'te, ne jar manifestinde). *(Temalar farklı çalışır — `manifest.json`'da `"premium": true`'yu çevirirler — ama bu eklentiler için geçerli değildir.)*

Bir *Gradle property'si*, derleme komutuna eklediğiniz bir seçenektir, örneğin `./gradlew build -PlicenseServer=prod`. Bir *ortam değişkeni*, CI'ınızın (otomatik derlemeniz, örn. GitHub Actions'ta) derlemeyi çalıştırmadan önce ayarladığı adlandırılmış bir değerdir. İşte kullanabileceğiniz tüm girdiler:

| Girdi | Tür | Ne yapar |
|---|---|---|
| `-PlicenseServer=dev\|prod\|<url>` | Gradle property'si | Genel anahtarı bir lisans sunucusundan getirir. `dev`, `prod` veya tam bir özel URL'den **birini** geçirin — `dev` → `https://api-dev.panomc.com`, `prod` → `https://api.panomc.com`. **Önerilir** — saklanacak gizli bir şey yok. |
| `PANO_LICENSE_SERVER` | Ortam değişkeni | `-PlicenseServer` ile aynı, CI için (onu Gradle derleme adımında ayarlayın). Property ayarlanmadığında kullanılır. |
| `-PpanoLicensePublicKey=<base64>` | Gradle property'si | Anahtarı doğrudan sağlar (Base64 veya PEM — bir anahtar için iki yaygın metin kodlaması; değeri panomc.com'dan alırsınız ve çoğu kişi bu seçeneğe asla ihtiyaç duymaz), herhangi bir ağ çağrısını atlar. |
| `PANO_LICENSE_PUBLIC_KEY` | Ortam değişkeni | `-PpanoLicensePublicKey` ile aynı, CI için. Property ayarlanmadığında kullanılır. |

**Hangi girdi kazanır?** Derleme, bunlardan ayarlanan **ilkini** kullanır:

1. `-PpanoLicensePublicKey` — komut satırında doğrudan sağladığınız bir anahtar
2. `PANO_LICENSE_PUBLIC_KEY` — aynısı, bir ortam değişkeninden
3. `-PlicenseServer` — anahtarı bir lisans sunucusundan getir
4. `PANO_LICENSE_SERVER` — aynısı, bir ortam değişkeninden

Bunlardan **hiçbiri** ayarlanmazsa, gömülü anahtar boştur ve jar **ücretsizdir**.

En basit premium derleme şudur:

```bash
./gradlew build -PlicenseServer=prod
```

::: tip Artık şunu görmelisiniz
`build/libs/` içinde panomc.com'un genel anahtarı gömülü olarak derlenmiş bir jar. Ayarlanacak ayrı bir "premium" bayrağı veya gözden geçirilecek bir yapılandırma dosyası yoktur — geçirdiğiniz derleme girdileri (Adım 1), doğrulama anahtarının ve onunla lisans kontrolünün gömülüp gömülmediğine karar veren şeydir. Premium davranışının gerçekten çalıştığını onaylamanın güvenilir yolu, onu baştan sona [Kendiniz test edin](#kendiniz-test-edin) içinde çalıştırmaktır.
:::

CI (GitHub Actions'taki otomatik derlemeniz) için, iş akışınızın Gradle derleme adımında `PANO_LICENSE_SERVER` ayarlayın — örneğin `dev` dalında `dev` ve `main`'de `prod` — böylece bir gönderi doğru anahtarlanmış bir jar üretir. Standart `pano-boilerplate-plugin` yayın iş akışı onu ayarlamaz: derleme adımı düz bir `./gradlew build`'dir, bu yüzden kutudan çıktığı hâliyle bir gönderi **ücretsiz** bir jar üretir. O ortam değişkenini derleme adımına eklemek, bir premium fork'un yaptığı tek değişikliktir (boilerplate'in `gradle.properties`'i bunu açıkça belirtir).

Somut olarak, bu, derleme adımına bir `env:` bloğu eklemek anlamına gelir. Aşağıdaki parçacık örnekleyicidir — onu kendi iş akışınızın derleme adımına uyarlayın:

```yaml
      # your existing release workflow, build step
      - name: Build
        env:
          PANO_LICENSE_SERVER: ${{ github.ref_name == 'main' && 'prod' || 'dev' }}
        run: ./gradlew build
```

::: tip Artık şunu görmelisiniz
Yayın dalınıza bir gönderi artık ücretsiz yerine bir **premium** jar üretir (`main`'de `prod`, dev dalınızda `dev`).
:::

::: tip Anahtar geneldir — bayrak seçimi gizlilikle değil, kolaylıkla ilgilidir
Gömülü değer panomc.com'un **genel** doğrulama anahtarıdır, bu yüzden gizlenecek hassas bir şey yoktur (bu, gizli kalması gereken Pazar Yeri API jetonunuzdan farklıdır). Derlemenin her zaman güncel anahtarı getirmesi için `-PlicenseServer` / `PANO_LICENSE_SERVER`'ı tercih edin; `-PpanoLicensePublicKey` / `PANO_LICENSE_PUBLIC_KEY`'i yalnızca CI'ınız derleme zamanında lisans sunucusuna ulaşamadığında kullanın.
:::

::: warning Bir premium yayın için her zaman temiz bir tam derleme yapın
Herhangi bir yayın jar'ında olduğu gibi, bir premium yayını asla `-Pnoui` ile derlemeyin — o bayrak eklentinin web arayüzünü yeniden derlemeyi atlar, böylece arayüzün eski bir kopyası jar'ın içinde bulunabilir (bkz. [Derleme ve Yayınlama](/tr/addon/publishing/#yayın-derlemesi)'daki uyarı). Lisans bayrağı **ayrı bir konudur**: onu bir `-Pnoui` dev derlemesine değil, normal, temiz bir `./gradlew build`'e ekleyin.
:::

## Adım 2: Çalışma zamanı lisans kontrolünü ekleyin

Kontrol, plugin sınıfınızda yaşar ve boilerplate'ten `PluginLicenseClient`'i kullanır.

**Boilerplate'ten başladıysanız, bu kod zaten var — tek işiniz hâlâ orada olduğunu onaylamak.** Taze bir `pano-boilerplate-plugin` zaten lisansa-hazırdır ve onu bir anahtarla derleyene kadar (Adım 1) yalnızca ücretsiz gibi davranır. `onStart()`'ın hâlâ `licenseClient.requireValidLicense()` ile başladığını kontrol edin. Onu kaldırdıysanız veya mevcut bir eklentiye premium ekliyorsanız, aşağıdakini ekleyin:

```kotlin
class ShoutboxPlugin : PanoPlugin() {
    private val licenseClient by lazy { PluginLicenseClient(this) }

    override suspend fun onStart() {
        licenseClient.requireValidLicense()  // no-op for free builds; throws if premium & invalid
        // ... the rest of your startup
    }

    override suspend fun verifyLicense() {
        licenseClient.requireValidLicense()  // backs the panel's "Refresh license" button
    }
}
```

O parçacıkta iki Kotlin söz dizimi parçası, size yeniyse: `by lazy { ... }` yalnızca "bu nesneyi öncesinde değil, ilk kullanıldığında oluştur" anlamına gelir ve `suspend`, Pano'nun bir coroutine olarak çalıştırdığı (kendi eşzamanlılık işleme yolu) bir fonksiyonu işaretler. İkisi de yük taşır — **imzaları tam olarak kopyalayın.**

- **`requireValidLicense()`** kapıdır. Bir premium jar'da lisansı getirir, doğrular ve çapraz kontrol eder; ücretsiz bir jar'da (gömülü anahtar yok) hemen döner. Onu `onStart()`'ın **en üstünde** çağırın, böylece lisans geçersizse, fırlattığı hata eklentinizi başlangıç kodunuzun herhangi biri çalışmadan önce hemen durdurur.
- **`verifyLicense()`**, panelin *Lisansı yenile* düğmesinin **host taze bir JWT getirdikten sonra** çağırdığı, geçersiz kılınabilir bir `PanoPlugin` kancasıdır (Pano'nun doldurmanız için sağladığı bir metot) — böylece panel bayat bir sonuç yerine gerçek, güncel sonucu yansıtır. Burada herhangi bir özel mantığa ihtiyacınız yok — yalnızca gösterildiği gibi içinde aynı `requireValidLicense()`'ı çağırın.

`requireValidLicense()` başarısız olduğunda bir `LicenseRequiredException` fırlatır. PF4J (Pano'nun içindeki eklenti motoru — doğrudan etkileşime girmediğiniz bir şey) sonra **yalnızca eklentinizi** başarısız olarak işaretler ve *host* (eklentinizin kurulduğu Pano platformu) nedeni kaydeder; Pano çekirdeği ve diğer her eklenti çalışmaya devam eder. Platformu yanlış yapılandırılmış tek bir premium eklenti tarafından kırılamaz tutmak kasıtlıdır — operatör onu çözmek için hâlâ paneline ulaşabilir.

### Kırmayı zorlaştıran ek kontroller: `LicenseGuard` (isteğe bağlı)

*Derinlemesine savunma* yalnızca tek bir kontrole güvenmemek anlamına gelir. Bir kırıcı (eklentinizi korsanlamaya çalışan biri) `onStart`'taki tek `requireValidLicense()` çağrısını silmeye çalışabilir. Bunu zorlaştırmak için, boilerplate ayrıca en sık çalışan koda — API endpoint'leriniz (rota işleyicileri), zamanlanmış işler, WebSocket işleyicileri — tek satırlık yeniden-kontroller eklemenizi sağlayan `LicenseGuard`'ı da gönderir. Bu yeniden-kontroller neredeyse bedavadır çünkü her seferinde panomc.com'a başvurmak yerine zaten getirilen lisansı yeniden kullanırlar:

```kotlin
override suspend fun handle(context: RoutingContext): Result {
    LicenseGuard.assert(plugin)
    // ... business logic
}
```

Burada `plugin` sizin `PanoPlugin` örneğinizdir — onu tutan değişkeni geçirin (örneğin, oluşturulduğunda plugin'in verildiği bir endpoint — "kurucu enjeksiyonu" yalnızca çerçevenin plugin'i endpoint'in kurucusuna sizin için geçirmesidir). Lisans geçerli değilse, `assert` isteği geçirmek yerine çağrıyı ana kontrol gibi durdurur (fırlatarak). `LicenseGuard.assert(plugin)` önbelleğe alınmış lisansı yeniden kullanır ve yalnızca süresi dolduysa yeniden getirir, bu yüzden maliyet ihmal edilebilir — ama ne kadar çok yerde görünürse, bir kırıcının o kadar çok düzenleme yapması gerekir.

Bu adım isteğe bağlıdır ve eklentiniz gerçekten satana kadar bekleyebilir.

## Adım 3: Ücretli bir kaynak olarak yayınlayın

Bir premium eklenti yayınlamak, bir ücretsiz olanla **aynı üç adımı** kullanır — kaynağı oluşturun, bir API jetonu oluşturun, otomasyonun sürümleri yüklemesine izin verin — [Resmi Pano Pazar Yeri'nde yayınlama](/tr/addon/publishing/#resmi-pano-pazar-yeri-nde-yayınlama)'dan. İki şey farklıdır:

**1. Onu ücretli fiyatlandırın.** panomc.com'daki *Kaynak oluştur* formunda, ücretsiz yerine **ücretli** fiyatlandırma seçeneğini seçin. Eklentiler için her zaman olduğu gibi, Pazar Yeri `resourceId`'niz tam olarak sizin `pluginId`'nizdir — [kaynak ID ipucu](/tr/addon/publishing/#resmi-pano-pazar-yeri-nde-yayınlama)'na bakın. (Temalar UUID adlı rastgele üretilmiş bir ID alır, ama eklentiler yalnızca `pluginId`'lerini yeniden kullanır.)

**2. Jar'ı doğrudan yükleyin — `useGitHubLink` kullanmayın.** Ücretsiz eklentiler bir çift yüklemeden kaçınmak için `useGitHubLink: true` ayarlar. Premium eklentiler, Pazar Yeri'nin **jar'ın resmi ana kopyasını** tutmasına ve SHA-256'sını (parmak izini — bkz. [Kaputun altında nasıl çalışır](#kaputun-altında-nasıl-calısır)) kaydetmesine izin vermelidir, çünkü o kaydedilen hash her alıcının lisansının bağlandığı şeydir. `.releaserc.json` Pano eklenti yapılandırmanızda, `useGitHubLink`'i bırakın (veya `false` olarak ayarlayın).

Aşağıdaki blok bir **diff** olarak gösterilmiştir: `-` ile başlayan satır **kaldırdığınız**, `+` ile başlayan satır **eklediğiniz** ve diğer her şey — değiştirilmeden bırakılan mevcut yapılandırmanızı temsil eden `...` yer tutucusu dahil — tam olarak zaten sahip olduğunuz gibi kalır:

```diff
 ["@PanoMC/semantic-release-pano", {
   "file": "build/libs/pano-plugin-shoutbox-${version}.jar",
   "panoVersion": "1.0.0",
-  "useGitHubLink": true,
+  "useGitHubLink": false,
   "repositoryUrl": "https://github.com/YourName/pano-plugin-shoutbox.git",
   "configs": [ ... ]
 }]
```

O yapılandırmadaki diğer her şey — iki kanal girdisi, `tokenVar`, `branches` — [`.releaserc.json` adım adım](/tr/addon/publishing/#releaserc-json-adım-adım)'dan değişmemiştir.

### Bir alıcı onu çalıştırdığında ne olur

Bir alıcının Pano'su premium eklentinizi başlattığında, panomc.com bir lisans jetonu **yalnızca** o bağlı hesap kaynağınızı satın aldıysa **ve** çalışan jar'ın SHA-256'sı o sürüm için kaydedilen hash ile eşleşiyorsa verir. (Siz, kaynak yazarı olarak, bu kontrolü her zaman geçersiniz — kendi ücretli eklentinizi [Kendiniz test edin](#kendiniz-test-edin) içinde test etmenize izin veren şey budur.) Doğrudan yüklenen, hash'i kaydedilen bir jar'ın önemli olmasının nedeni budur: tüm kontrolün asılı olduğu parmak izidir.

## Alıcılar panellerinde ne görür

Bir premium eklenti kendini lisanslayamıyorsa, operatör tahminde bırakılmaz — panel bunu üç yerde yüzeye çıkarır: **Panel → Eklentiler**'de bir **eklenti-başına durum rozeti**, eklenti detay sayfasında bir **Lisans kartı** ve panoda bir **afiş**. Yaygın durumlar ve düzeltmeleri:

| Durum | Anlamı | Düzeltme |
|---|---|---|
| `LICENSED` | Geçerli lisans, eklenti çalışıyor. | Yapılacak bir şey yok. |
| `NO_PURCHASE` | Hesap bağlı ama bu eklentiyi satın almamış. | panomc.com'da satın alın (kart dışarı bağlanır). |
| `NOT_CONNECTED` | Bu Pano'ya bağlı bir panomc.com hesabı yok. | Panel ayarlarında hesabı bağlayın. |
| `NETWORK_ERROR` | Kontrol zamanında panomc.com'a ulaşılamadı. | Bağlantıyı geri yükleyin, sonra **Yenile**'ye tıklayın. |
| `JAR_TAMPERED` | Çalışan jar'ın hash'i lisanslanmış olanla eşleşmiyor. | Eklentiyi panomc.com'dan yeniden indirin. |

Operatörün yanlış yapabileceği Pano tarafı bir lisanslama yapılandırması yoktur — premium eklentiler kendi kontrollerini halleder ve lisanssız bir tanesi, sitenin geri kalanı çalışırken yalnızca devre dışı kalır.

## Kendiniz test edin

Kimseden ücret almadan önce, tüm döngüyü kendi hesabınıza karşı çalıştırın. Kendi kaynağınız için satın alma kontrolünü her zaman geçersiniz, bu yüzden bu, bir premium eklentiyi baştan sona doğrulamanın amaçlanan yoludur:

1. **Bir sürüm yayınlayın** — normal yayın akışınız aracılığıyla bir ön-yayın kanalına (örneğin `dev`/alfa kanalınıza). Yayınlama, jar'ın SHA-256 hash'ini Pazar Yeri'ne kaydeden şeydir — kaydedilmiş bir hash olmadan lisansın bağlanacağı bir şey yoktur.
2. **O tam jar'ı yerel bir Pano'ya alın.** Ya aynı sürümü eşleşen lisans sunucusuyla derleyin — dev kanalı için `./gradlew build -PlicenseServer=dev` — ya da yayınlanan jar'ı indirin. Adım 1'de hash'i kaydedilen sürümle bayt-bayt aynı olmalıdır.
3. **panomc.com yazar hesabınızı** yerel Pano'nuza panel ayarlarında **bağlayın** (gerçek bir alıcının kullandığı aynı "hesabı bağla" eylemi).
4. **Eklentiyi başlatın.**

::: tip Artık şunu görmelisiniz
**Panel → Eklentiler**'de `LICENSED` rozeti ve eklentinin normal çalıştığı. Bunun yerine `NOT_CONNECTED` görürseniz, 3. adımı bitirin; kendi kaynağınızda `NO_PURCHASE` genellikle bağlı hesabın yazar hesabınız olmadığı anlamına gelir.
:::

İsteğe bağlı olarak, kurcalama kontrolünün çalıştığını kanıtlayın: jar'daki tek bir baytı değiştirin ve onu tekrar başlatın — hash artık eşleşmez ve durum `JAR_TAMPERED`'a döner.

## Kaputun altında nasıl çalışır

Aşağıdaki her şey arka plandır. Bir premium eklenti göndermek için ona ihtiyacınız yok, ama yukarıdaki adımların neden yeterli olduğunu açıklar.

### 30 saniyelik kripto özeti

Pano **asimetrik imzalama** kullanır. panomc.com, imzalı jetonlar oluşturabilen gizli bir **özel anahtar** tutar; herkes yalnızca o imzaları *kontrol edebilen*, asla oluşturamayan eşleşen bir **genel anahtar** alır. Genel anahtarı jar'ınıza gömmenin güvenli olmasının nedeni budur — doğrulayabilir, ama taklit edemez. **RS256** yalnızca bu imzalama algoritmasının adıdır.

Bu sayfanın kullandığı birkaç terim:

- **Genel anahtar / özel anahtar** — yukarıdaki çift. Genel anahtar doğrulayabilir; özel anahtar (panomc.com tarafından tutulur) imzalayabilir. "Genel" bir anahtarın dağıtılmasının güvenli olmasının nedeni budur.
- **JWT** — "bu sunucu bu eklentiyi satın aldı" gibi *claim*'leri (gerçekleri) taşıyan küçük, imzalı bir metin jetonu. Genel anahtara sahip herkes onu doğrulayabilir, ama özel anahtar olmayan hiç kimse onu taklit edemez. Bir jetonu **taklit etmek**, imza kontrolünü yine de geçen sahte bir tane basmak anlamına gelir — asimetrik imzalama bunu pratikte imkânsız kılan şeydir.
- **SHA-256 hash** — bir dosyanın tam baytlarından hesaplanan bir parmak izi. Tek bir baytı bile değiştirin, parmak izi tamamen değişir.
- **Host** — eklentinizin kurulduğu Pano platformu (alıcının kendi barındırdığı sunucu).

### Lisans sistemi nasıl çalışır (düz kelimelerle)

Bir premium eklenti, derleme zamanında gömülü, panomc.com'un genel anahtarının bir kopyasını taşır. Oradan:

1. Pano eklentinizi başlattığında, eklenti *host*'tan **panomc.com**'dan kısa ömürlü (**1 saat**) imzalı bir lisans jetonu — bir JWT — getirmesini ister.
2. Eklenti sonra o jetonu **kendisi yeniden doğrular**, kendi gömülü genel anahtarını kullanarak — bunu host'un yaptığına güvenmez.
3. Jeton dört şeye **bağlanmıştır**: **bu tam Pano kurulumu** (bağlı panomc.com hesabı aracılığıyla tanımlanır), **kaynağınız**, **eklenti sürümü** ve **çalışan jar'ın SHA-256 hash'i**. Bir sunucu, sürüm veya jar için verilen bir jeton başka hiçbir yerde değersizdir.
4. Kontrol geçerse, eklenti normal başlar. Başarısız olursa, eklenti **başlamayı reddeder** — ama Pano'nun kendisi çalışmaya devam eder ve başarısızlık panelde yüzeye çıkar, böylece operatör onu düzeltebilir.

Düz kelimelerle önemli tasarım noktası: **önemli olan kontrol Pano'nun içinde değil, eklentinizin içinde gerçekleşir.** Pano çekirdeği açık kaynaktır ve fork'lanabilir veya yamalanabilir, bu yüzden eklenti lisansı kontrol ettiğine dair host'a asla güvenmez — JWT imzasını kendi gömülü genel anahtarıyla kendisi yeniden doğrular. "Plugin kodunuz güvenlik sınırıdır"ın anlamı budur. Kurcalanmış bir host bile bir jeton taklit edemez, çünkü panomc.com'un özel anahtarına sahip değildir.

### `requireValidLicense()` gerçekte neyi kontrol eder

Bunun hiçbirini kendiniz çağırmazsınız — Adım 2'de zaten eklediğiniz tek metodun **içinde** olan şeydir, meraklılar için burada listelenmiştir. Sırayla:

1. Eklenti premium değilse (gömülü anahtar yok) hemen döner.
2. Host'tan (`getLicenseManager()`) `resourceId = pluginId` ve yerleşik sürüm için bir lisans getirmesini ister.
3. **JWT imzasını** gömülü genel anahtarla, beklenen düzenleyene karşı — jetonun geldiğini iddia ettiği kimlik, yani panomc.com (`getLicenseJwtIssuer()`) — **yeniden doğrular**. Gerçek güvenlik sınırı budur.
4. Jetonun kaynağının `pluginId`'nizle eşleştiğini, sürümün eşleştiğini ve **jar SHA-256'nın çalışan jar ile eşleştiğini** (`getOwnJarSha256()`) onaylar.
5. Jetonun süresinin dolmadığını onaylar, sonra onu önbelleğe alır.

### Parmak izi ve sürüm bağlama

Eklentiler için, lisans parmak izi **jar'ın SHA-256'sıdır**. Jeton o hash'i taşır ve çalışma zamanında eklentiniz onu gerçekten çalıştırdığı jar'ın hash'iyle (`getOwnJarSha256()`) karşılaştırır. Birisi jar'ı yeniden paketler veya yamalarsa, hash artık lisanslanmış olanla eşleşmez ve kontrol bir kurcalama durumuyla başarısız olur.

::: warning Sürümleri yayınlar aracılığıyla hareket ettirin
Bir lisans **sürüm + jar** başına verilir. Zaten yayınlanmış bir jar'ı **yamalar veya elle düzenlerseniz**, hash'i o sürüm için kaydedilenle artık eşleşmez, bu yüzden artık lisanslanmaz. Değişiklikleri her zaman normal akış aracılığıyla **yeni bir yayın** olarak gönderin; tek doğru yol budur. Her yayında taze bir hash aynı zamanda bir özelliktir: önceki derlemeye karşı yapılmış herhangi bir kırma çalışmasını geçersiz kılar.
:::

## Sağlamlaştırma notları

Sistem zaten birkaç savunmayı katmanlar — kurulum/sürüm/jar başına bağlama, plugin-tarafı imza yeniden-kontrolü, kısa 1 saatlik jetonlar ve dağınık `LicenseGuard` çağrıları. Çıtayı daha da yükseltebilirsiniz:

- **`LicenseGuard.assert(plugin)`'i geniş bir şekilde serpiştirin**, böylece kaldırılan tek bir kontrol kapıyı devre dışı bırakmaz.
- **Her düzeltmeyi yeni bir yayın olarak gönderin**, çünkü her yeni jar hash'i taze kırma çabası zorunlu kılar.
- **Jar'ınızı gizleyin (obfuscate).** Gizleme, derlenen sınıflarınızı ve metotlarınızı anlamsız sembollere yeniden adlandırır, böylece bir kırıcı onu kaldırmak için lisans kodunu kolayca bulamaz. [ProGuard](https://www.guardsquare.com/proguard) standart ücretsiz araçtır. Bu isteğe bağlıdır ve eklentiniz gerçekten satana kadar bekleyebilir.

Ama bu sayfanın en üstündeki dürüstlük uyarısını aklınızda tutun: bu önlemler kırmanın maliyetini kullanıcıların ezici çoğunluğu için yükseltir; onu imkânsız kılmaz.

## Sırada ne var

- **[Derleme ve Yayınlama](/tr/addon/publishing/)** — yayın derlemesi, sürümleme ve bu sayfanın üzerine inşa ettiği tam Pazar Yeri yayınlama akışı.
- **[Manifest Yapılandırması](/tr/addon/manifest/#premium-derleme-propertiesi)** — `gradle.properties`'in geri kalanı bağlamında premium derleme properties'i.
- **[Backend Geliştirme](/tr/addon/backend/)** — `PanoPlugin` sınıfınızın, endpoint'lerinizin ve `onStart` yaşam döngüsünün yaşadığı yer.
- Temalar benzer bir tüm-zip parmak izi şeması kullanır — bkz. [premium temalar](/tr/theme/publishing/#koruma-duz-kelimelerle-nasıl-calısır).
