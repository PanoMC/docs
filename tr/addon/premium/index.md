# Premium Eklentiler ve Lisanslama

Bu sayfa, eklentinizi resmi Pano Pazar Yeri'nde nasıl satacağınızı ve Pano'nun onun yalnızca gerçekten ödeme yapmış sunucularda çalışmasını nasıl sağlayacağını gösterir.

Satış, ücretsiz bir eklentiyle tam olarak aynı yayın akışı, artı iki ek parça aracılığıyla çalışır: **jar'ınıza** (eklentinizin gönderildiği tek derlenmiş dosya) gömülü bir **derleme zamanı lisans anahtarı** ve kodunuzda bir **çalışma zamanı lisans kontrolü**. Başka bir deyişle: eklentinizi derlediğinizde içine küçük bir doğrulama anahtarı dosyası eklersiniz (bu, *derleme zamanı* kısmıdır) ve eklenti başladığında o anahtarı kullanarak sunucunun ödeme yapıp yapmadığını kontrol eder (bu, *çalışma zamanı* kısmıdır). Bu, [Derleme ve Yayınlama](/tr/addon/publishing/#premium-ilanlar)'ın işaret ettiği tam anlatımdır.

Henüz ücretsiz bir eklenti yayınlamadıysanız, önce [Derleme ve Yayınlama](/tr/addon/publishing/)'yı okuyun — oradaki her şey (yayın derlemesi, sürümleme, yayın kanalları, `.releaserc.json`, kaynak ve API jetonu oluşturma) hâlâ geçerlidir. Bu sayfa yalnızca premium katmanını üstüne ekler.

::: tip TL;DR — premium'a geçmek üç küçük değişiklik
Bu sayfanın çoğu arka plandır. Asıl iş küçüktür:

1. **Bir derleme bayrağı ekleyin** (veya bir CI ortam değişkeni), böylece jar'ınız bir lisans anahtarıyla derlenir — [Adım 1](#adım-1-lisans-anahtarını-derleme-zamanında-gomun).
2. **Boilerplate'in mevcut lisans kontrolünü koruyun** — taze bir `pano-boilerplate-plugin`'in zaten sahip olduğu iki kısa metot — [Adım 2](#adım-2-calısma-zamanı-lisans-kontrolunu-ekleyin).
3. **Ücretli bir kaynak olarak yayınlayın** — *ücretli* fiyatlandırmayı seçin ve `useGitHubLink: false` ayarlayın — [Adım 3](#adım-3-ucretli-bir-kaynak-olarak-yayınlayın).

Sonra [kendiniz test edin](#kendiniz-test-edin). [Kaputun altında nasıl çalışır](#kaputun-altında-nasıl-calısır) altındaki her şey isteğe bağlı okumadır.
:::

::: warning Hiçbir koruma mutlak değildir
Bu sistemin ne yapıp ne yapamayacağı konusunda kendinize karşı dürüst olun: **hiçbir lisans sistemi kodu %100 koruyamaz.** Buradaki amaç, izinsiz kullanımı kullanıcıların büyük çoğunluğu için olabildiğince zorlaştırmaktır — onu imkânsız kılmak değil. Her yazılım parçası gibi, son kullanıcının eline geçen herhangi bir kod doğası gereği açıktır: yeterince kararlı ve yetenekli biri onu her zaman parçalayabilir. Bu, yalnızca Pano'nunki için değil, şimdiye kadar yapılmış her DRM için doğrudur. Eklentinizi bu gerçeği akılda tutarak fiyatlandırın ve destekleyin.
:::

## Adım 1: Lisans anahtarını derleme zamanında gömün

Premium derlemesi, genel doğrulama anahtarını jar'ınızın içine koyan birkaç ek girdi kabul eder. Bunlar, **derlerken** geçtiğiniz seçeneklerdir — komut satırında veya otomatik derlemenizde ortam değişkenleri olarak — deponuzdaki herhangi bir dosyaya yazdığınız bir şey **değil** (bkz. [Manifesto Yapılandırması → Premium derleme özellikleri](/tr/addon/manifest/#premium-derleme-ozellikleri)).

Bunların **hiçbirini** geçmezseniz, eklentiniz normal bir **ücretsiz** jar olarak derlenir ve çalışma zamanı kontrolü hiçbir şey yapmaz (bir "no-op") — böylece aynı kaynak, kod değişikliği olmadan ücretsiz ya da premium olarak gönderilebilir.

::: tip Bir eklentiyi asla bir yapılandırma dosyasında "premium" olarak işaretlemezsiniz
Bir eklenti **yalnızca onu bir lisans anahtarıyla derlediğiniz için** premium'dur — başka hiçbir şey için. Bir anahtarla derleyin → premium; anahtarsız derleyin → ücretsiz ve aralarında kod değişikliği yok. Herhangi bir yapılandırma dosyasını düzenlemezsiniz ve hiçbir yerde bir `premium` alanı yoktur (ne `gradle.properties`'te ne de jar manifestosunda). *(Temalar farklı çalışır — `manifest.json`'da `"premium": true`'yu değiştirirler — ama bu eklentiler için geçerli değildir.)*
:::

Bir *Gradle özelliği*, derleme komutuna eklediğiniz bir seçenektir, örneğin `./gradlew build -PlicenseServer=prod`. Bir *ortam değişkeni*, CI'nızın (otomatik derlemeniz, örn. GitHub Actions'ta) derlemeyi çalıştırmadan önce ayarladığı adlandırılmış bir değerdir. İşte kullanabileceğiniz tüm girdiler:

| Girdi | Tür | Ne yapar |
|---|---|---|
| `-PlicenseServer=dev\|prod\|<url>` | Gradle özelliği | Genel anahtarı bir lisans sunucusundan getirir. **Şunlardan birini** geçin: `dev`, `prod` veya tam bir özel URL — `dev` → `https://api-dev.panomc.com`, `prod` → `https://api.panomc.com`. **Önerilir** — saklanacak gizli bir şey yok. |
| `PANO_LICENSE_SERVER` | Ortam değişkeni | `-PlicenseServer` ile aynı, CI için (Gradle derleme adımında ayarlayın). Özellik ayarlanmadığında kullanılır. |
| `-PpanoLicensePublicKey=<base64>` | Gradle özelliği | Anahtarı doğrudan sağlar (Base64 veya PEM — bir anahtar için iki yaygın metin kodlaması; değeri panomc.com'dan alırsınız ve çoğu kişinin bu seçeneğe asla ihtiyacı olmaz), herhangi bir ağ çağrısını atlayarak. |
| `PANO_LICENSE_PUBLIC_KEY` | Ortam değişkeni | `-PpanoLicensePublicKey` ile aynı, CI için. Özellik ayarlanmadığında kullanılır. |

**Hangi girdi kazanır?** Derleme, ayarlanmış olanların **ilkini** kullanır:

1. `-PpanoLicensePublicKey` — komut satırında doğrudan sağladığınız bir anahtar
2. `PANO_LICENSE_PUBLIC_KEY` — aynısı, bir ortam değişkeninden
3. `-PlicenseServer` — anahtarı bir lisans sunucusundan getir
4. `PANO_LICENSE_SERVER` — aynısı, bir ortam değişkeninden

Bunlardan **hiçbiri** ayarlanmamışsa, gömülü anahtar boştur ve jar **ücretsizdir**.

En basit premium derlemesi şudur:

```bash
./gradlew build -PlicenseServer=prod
```

::: tip Artık şunu görmelisiniz
`build/libs/` içinde, panomc.com'un genel anahtarı pişirilmiş bir jar. Ayarlanacak ayrı bir "premium" bayrağı veya göz gezdirilecek bir yapılandırma dosyası yoktur — geçtiğiniz derleme girdileri (Adım 1), doğrulama anahtarının ve onunla birlikte lisans kontrolünün gömülüp gömülmediğine karar veren şeydir. Premium davranışının gerçekten çalıştığını doğrulamanın güvenilir yolu, onu baştan sona [Kendiniz test edin](#kendiniz-test-edin) bölümünde çalıştırmaktır.
:::

CI için (GitHub Actions'taki otomatik derlemeniz), iş akışınızın Gradle derleme adımında `PANO_LICENSE_SERVER` ayarlayın — örneğin `dev` dalında `dev` ve `main`'de `prod` — böylece bir gönderim doğru şekilde anahtarlanmış bir jar üretir. Standart `pano-boilerplate-plugin` yayın iş akışı onu **ayarlamaz**: derleme adımı düz bir `./gradlew build`'dir, dolayısıyla kutudan çıktığı hâliyle bir gönderim **ücretsiz** bir jar üretir. O ortam değişkenini derleme adımına eklemek, bir premium çatalın (fork) yaptığı tek değişikliktir (boilerplate'in `gradle.properties`'i bunu açıkça belirtir).

Somut olarak bu, derleme adımına bir `env:` bloğu eklemek demektir. Aşağıdaki parça örnek amaçlıdır — onu kendi iş akışınızın derleme adımıyla eşleştirin:

```yaml
      # your existing release workflow, build step
      - name: Build
        env:
          PANO_LICENSE_SERVER: ${{ github.ref_name == 'main' && 'prod' || 'dev' }}
        run: ./gradlew build
```

::: tip Artık şunu görmelisiniz
Yayın dalınıza bir gönderim artık ücretsiz bir jar yerine **premium** bir jar üretir (`main`'de `prod`, dev dalınızda `dev`).
:::

::: tip Anahtar geneldir — bayrak seçimi gizlilikle değil, kolaylıkla ilgilidir
Gömülü değer panomc.com'un **genel** doğrulama anahtarıdır, dolayısıyla gizlenecek hassas bir şey yoktur (bu, gizli kalması gereken Pazar Yeri API jetonunuzun aksine). Derlemenin her zaman mevcut anahtarı getirmesi için `-PlicenseServer` / `PANO_LICENSE_SERVER`'ı tercih edin; `-PpanoLicensePublicKey` / `PANO_LICENSE_PUBLIC_KEY`'i yalnızca CI'nız derleme zamanında lisans sunucusuna ulaşamadığında kullanın.
:::

::: warning Bir premium yayını için her zaman temiz bir tam derleme yapın
Herhangi bir yayın jar'ında olduğu gibi, bir premium yayınını asla `-Pnoui` ile derlemeyin — o bayrak eklentinin web arayüzünü yeniden derlemeyi atlar, dolayısıyla arayüzün eski bir kopyası jar'ın içinde sonlanabilir (bkz. [Derleme ve Yayınlama](/tr/addon/publishing/#yayın-derlemesi)'daki uyarı). Lisans bayrağı **ayrı bir konudur**: onu normal, temiz bir `./gradlew build`'e ekleyin, bir `-Pnoui` geliştirme derlemesine değil.
:::

## Adım 2: Çalışma zamanı lisans kontrolünü ekleyin

Kontrol, eklenti sınıfınızda yaşar ve boilerplate'ten `PluginLicenseClient`'ı kullanır.

**Boilerplate'ten başladıysanız, bu kod zaten var — tek işiniz onun hâlâ orada olduğunu doğrulamak.** Taze bir `pano-boilerplate-plugin` zaten lisansa hazırdır ve siz onu bir anahtarla derleyene kadar (Adım 1) yalnızca ücretsiz gibi davranır. `onStart()`'ın hâlâ `licenseClient.requireValidLicense()` ile başladığını kontrol edin. Onu kaldırdıysanız veya mevcut bir eklentiye premium ekliyorsanız, aşağıdakini ekleyin:

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

O parçadaki iki Kotlin söz dizimi parçası, size yeniyse: `by lazy { ... }` yalnızca "bu nesneyi önce değil, ilk kullanıldığında oluştur" demektir ve `suspend`, Pano'nun bir coroutine olarak (kendi eşzamanlılık yönetme biçimi) çalıştırdığı bir fonksiyonu işaretler. İkisi de yük taşır — **imzaları tam olarak kopyalayın.**

- **`requireValidLicense()`** kapıdır. Premium bir jar'da lisansı getirir, doğrular ve çapraz kontrol eder; ücretsiz bir jar'da (gömülü anahtar yok) hemen döner. Lisans geçersizse fırlattığı hata eklentinizi hemen durdursun diye, başlangıç kodunuzun herhangi biri çalışmadan önce, onu `onStart()`'ın **en üstünde** çağırın.
- **`verifyLicense()`**, panelin *Lisansı yenile* düğmesinin **host taze bir JWT getirdikten sonra** çağırdığı, geçersiz kılınabilir bir `PanoPlugin` kancasıdır (Pano'nun sizin doldurmanız için sağladığı bir metot) — böylece panel eskimiş bir sonuç yerine gerçek, güncel sonucu yansıtır. Burada özel bir mantığa ihtiyacınız yok — yalnızca gösterildiği gibi içinde aynı `requireValidLicense()`'ı çağırın.

`requireValidLicense()` başarısız olduğunda `LicenseRequiredException` fırlatır. PF4J (Pano'nun içindeki eklenti motoru — doğrudan etkileşime girmediğiniz bir şey) sonra **yalnızca sizin eklentinizi** başarısız olarak işaretler ve *host* (eklentinizin kurulduğu Pano platformu) nedeni kaydeder; Pano çekirdeği ve diğer her eklenti çalışmaya devam eder. Platformu, yanlış yapılandırılmış tek bir premium eklenti tarafından kırılmaz tutmak bilinçlidir — operatör onu çözmek için panele hâlâ ulaşabilir.

### Kırmayı zorlaştıran ek kontroller: `LicenseGuard` (isteğe bağlı)

*Derinlemesine savunma* (defense in depth) yalnızca tek bir kontrole güvenmemek demektir. Bir kırıcı (eklentinizi korsanlamaya çalışan biri) `onStart`'taki tek `requireValidLicense()` çağrısını silmeyi deneyebilir. Bunu zorlaştırmak için, boilerplate ayrıca `LicenseGuard` gönderir; bu, en sık çalışan koda — API uç noktalarınıza (rota işleyicileri), zamanlanmış işler, WebSocket işleyicileri — tek satırlık yeniden-kontroller eklemenizi sağlar. Bu yeniden-kontroller neredeyse bedavadır, çünkü her seferinde panomc.com'a başvurmak yerine zaten getirilmiş lisansı yeniden kullanırlar:

```kotlin
override suspend fun handle(context: RoutingContext): Result {
    LicenseGuard.assert(plugin)
    // ... business logic
}
```

Burada `plugin`, `PanoPlugin` örneğinizdir — onu tutan hangi değişkense onu geçin (örneğin, eklentiyi kurucu enjeksiyonuyla alan bir uç nokta). Lisans geçerli değilse, `assert` çağrıyı, isteği geçirmek yerine, ana kontrolle aynı şekilde (fırlatarak) durdurur. `LicenseGuard.assert(plugin)`, önbelleğe alınmış lisansı yeniden kullanır ve yalnızca süresi dolmuşsa yeniden getirir, dolayısıyla maliyet önemsizdir — ama ne kadar çok yerde görünürse, bir kırıcının yapması gereken düzenleme o kadar artar.

Bu adım isteğe bağlıdır ve eklentiniz gerçekten satılana kadar bekleyebilir.

## Adım 3: Ücretli bir kaynak olarak yayınlayın

Bir premium eklenti yayınlamak, [Resmi Pano Pazar Yeri'nde yayınlama](/tr/addon/publishing/#resmi-pano-pazar-yeri-nde-yayınlama)'dan gelen ücretsiz olanla **aynı üç adımı** kullanır — kaynağı oluşturun, bir API jetonu oluşturun, otomasyonun sürümleri yüklemesine izin verin. İki şey farklıdır:

**1. Ücretli olarak fiyatlandırın.** panomc.com'daki *Kaynak oluştur* formunda, ücretsiz yerine **ücretli** fiyatlandırma seçeneğini seçin. Eklentiler için her zaman olduğu gibi, Pazar Yeri `resourceId`'niz tam olarak `pluginId`'nizdir — bkz. [kaynak ID ipucu](/tr/addon/publishing/#resmi-pano-pazar-yeri-nde-yayınlama). (Temalar UUID denen rastgele üretilmiş bir ID alır, ama eklentiler yalnızca `pluginId`'lerini yeniden kullanır.)

**2. Jar'ı doğrudan yükleyin — `useGitHubLink` kullanmayın.** Ücretsiz eklentiler, yinelenen bir yüklemeden kaçınmak için `useGitHubLink: true` ayarlar. Premium eklentiler, Pazar Yeri'nin jar'ın **resmi ana kopyasını** tutmasına ve SHA-256'sını (parmak izini — bkz. [Kaputun altında nasıl çalışır](#kaputun-altında-nasıl-calısır)) kaydetmesine izin vermelidir, çünkü o kaydedilen hash, her alıcının lisansının bağlandığı şeydir. `.releaserc.json` Pano eklenti yapılandırmanızda, `useGitHubLink`'i düşürün (veya `false` olarak ayarlayın).

Aşağıdaki blok bir **diff** olarak gösterilmiştir: `-` ile başlayan satır **kaldırdığınız**, `+` ile başlayan satır **eklediğiniz** satırdır ve geri kalan her şey — değişmeden bırakılan mevcut yapılandırmanızı temsil eden `...` yer tutucusu da dâhil — tam olarak zaten sahip olduğunuz gibi kalır:

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

O yapılandırmadaki diğer her şey — iki kanal girdisi, `tokenVar`, `branches` — [`.releaserc.json` adım adım](/tr/addon/publishing/#releaserc-json-adım-adım)'dan değişmeden kalır.

### Bir alıcı onu çalıştırdığında ne olur

Bir alıcının Pano'su premium eklentinizi başlattığında, panomc.com bir lisans jetonu **yalnızca** o bağlı hesap kaynağınızı satın **almışsa** **ve** çalışan jar'ın SHA-256'sı o sürüm için kaydedilen hash ile eşleşiyorsa çıkarır. (Kaynak yazarı olarak siz bu kontrolü her zaman geçersiniz — ki bu, kendi ücretli eklentinizi [Kendiniz test edin](#kendiniz-test-edin) bölümünde test etmenizi sağlayan şeydir.) Doğrudan yüklenen, hash'i kaydedilen bir jar'ın önemli olmasının nedeni budur: tüm kontrolün asıldığı parmak izidir.

## Alıcılar panellerinde ne görür

Bir premium eklenti kendini lisanslayamıyorsa, operatör tahmin etmekle baş başa bırakılmaz — panel onu üç yerde yüzeye çıkarır: **Panel → Eklentiler**'de bir **eklenti-başına durum rozeti**, eklenti detay sayfasında bir **Lisans kartı** ve panoda bir **afiş**. Yaygın durumlar ve çözümleri:

| Durum | Anlamı | Çözüm |
|---|---|---|
| `LICENSED` | Geçerli lisans, eklenti çalışıyor. | Yapılacak bir şey yok. |
| `NO_PURCHASE` | Hesap bağlı ama bu eklentiyi satın almamış. | panomc.com'da satın alın (kart dışarı bağlantı verir). |
| `NOT_CONNECTED` | Bu Pano'ya bağlı hiçbir panomc.com hesabı yok. | Hesabı panel ayarlarında bağlayın. |
| `NETWORK_ERROR` | Kontrol anında panomc.com'a ulaşılamadı. | Bağlantıyı geri yükleyin, sonra **Yenile**'ye tıklayın. |
| `JAR_TAMPERED` | Çalışan jar'ın hash'i lisanslı olanla eşleşmiyor. | Eklentiyi panomc.com'dan yeniden indirin. |

Operatörün yanlış yapabileceği Pano tarafı bir lisanslama yapılandırması yoktur — premium eklentiler kendi kontrollerini halleder ve lisanssız olan, sitenin geri kalanı çalışırken yalnızca devre dışı kalır.

## Kendiniz test edin

Kimseden ücret almadan önce, tüm döngüyü kendi hesabınıza karşı çalıştırın. Kendi kaynağınız için satın alma kontrolünü her zaman geçersiniz, dolayısıyla bu, bir premium eklentiyi baştan sona doğrulamanın amaçlanan yoludur:

1. **Bir sürüm yayınlayın**, normal yayın akışınızdan bir ön-yayın kanalına (örneğin `dev`/alpha kanalınıza). Yayınlama, jar'ın SHA-256 hash'ini Pazar Yeri'ne kaydeden şeydir — kaydedilmiş bir hash olmadan lisansın bağlanacağı bir şey yoktur.
2. **O tam jar'ı yerel bir Pano'ya alın.** Ya aynı sürümü eşleşen lisans sunucusuyla derleyin — dev kanalı için `./gradlew build -PlicenseServer=dev` — ya da yayınlanmış jar'ı indirin. Hash'i 1. adımda kaydedilen sürümle byte-byte aynı olmalıdır.
3. **panomc.com yazar hesabınızı** panelde yerel Pano'nuza bağlayın (gerçek bir alıcının kullandığı aynı "hesabı bağla" eylemi).
4. **Eklentiyi başlatın.**

::: tip Artık şunu görmelisiniz
**Panel → Eklentiler**'de `LICENSED` rozeti ve eklenti normal çalışıyor. Bunun yerine `NOT_CONNECTED` görüyorsanız, 3. adımı tamamlayın; kendi kaynağınızda `NO_PURCHASE` genellikle bağlı hesabın yazar hesabınız olmadığı anlamına gelir.
:::

İsteğe bağlı olarak, kurcalama (tamper) kontrolünün çalıştığını kanıtlayın: jar'da tek bir baytı değiştirin ve onu yeniden başlatın — hash artık eşleşmez ve durum `JAR_TAMPERED`'a döner.

## Kaputun altında nasıl çalışır

Aşağıdaki her şey arka plandır. Bir premium eklenti göndermek için ona ihtiyacınız yok, ama yukarıdaki adımların neden yeterli olduğunu açıklar.

### 30 saniyelik kripto özeti

Pano **asimetrik imzalama** kullanır. panomc.com, imzalı jetonlar oluşturabilen gizli bir **özel anahtar** tutar; diğer herkes, bu imzaları yalnızca *kontrol edebilen*, asla oluşturamayan, eşleşen bir **genel anahtar** alır. Genel anahtarı jar'ınıza pişirmenin güvenli olmasının nedeni budur — doğrulayabilir, ama taklit edemez. **RS256**, bu imzalama algoritmasının adıdır yalnızca.

Bu sayfanın kullandığı birkaç terim:

- **Genel anahtar / özel anahtar** — yukarıdaki çift. Genel anahtar doğrulayabilir; özel anahtar (panomc.com tarafından tutulur) imzalayabilir. "Genel" bir anahtarın dağıtılmasının güvenli olmasının nedeni budur.
- **JWT** — "bu sunucu bu eklentiyi satın aldı" gibi *iddialar* (claim — gerçekler) taşıyan küçük bir imzalı metin jetonu. Genel anahtara sahip herkes onu doğrulayabilir, ama özel anahtarı olmayan hiç kimse onu taklit edemez. Bir jetonu **taklit etmek** (forge), imza kontrolünü hâlâ geçen sahte bir tane basmak demektir — asimetrik imzalama, bunu pratik olarak imkânsız kılan şeydir.
- **SHA-256 hash** — bir dosyanın tam baytlarından hesaplanan bir parmak izi. Tek bir baytı bile değiştirin ve parmak izi tamamen değişir.
- **Host** — eklentinizin kurulduğu Pano platformu (alıcının kendi barındırdığı sunucusu).

### Lisans sistemi nasıl çalışır (düz kelimelerle)

Bir premium eklenti, derleme zamanında pişirilmiş, panomc.com'un genel anahtarının bir kopyasını taşır. Oradan:

1. Pano eklentinizi başlattığında, eklenti *host*'tan **panomc.com**'dan kısa ömürlü (**1 saat**) imzalı bir lisans jetonu — bir JWT — getirmesini ister.
2. Eklenti sonra o jetonu **kendisi yeniden doğrular**, kendi gömülü genel anahtarını kullanarak — bunu host'un yaptığına güvenmez.
3. Jeton dört şeye **bağlıdır**: **bu tam Pano kurulumu** (bağlı panomc.com hesabı aracılığıyla tanımlanır), **kaynağınız**, **eklenti sürümü** ve **çalışan jar'ın SHA-256 hash'i**. Bir sunucu, sürüm veya jar için çıkarılan bir jeton, başka herhangi bir yerde değersizdir.
4. Kontrol geçerse, eklenti normal başlar. Başarısız olursa, eklenti **başlamayı reddeder** — ama Pano'nun kendisi çalışmaya devam eder ve başarısızlık, operatörün onu düzeltebilmesi için panelde yüzeye çıkarılır.

Önemli tasarım noktası, düz kelimelerle: **önemli olan kontrol, Pano'nun içinde değil, eklentinizin içinde olur.** Pano çekirdeği açık kaynaktır ve çatallanabilir veya yamalanabilir, dolayısıyla eklenti lisansı kontrol ettiğine dair host'a asla güvenmez — JWT imzasını *kendi* gömülü genel anahtarıyla kendisi yeniden doğrular. "Eklenti kodunuz güvenlik sınırıdır"ın anlamı budur. Kurcalanmış bir host bile bir jetonu taklit edemez, çünkü panomc.com'un özel anahtarına sahip değildir.

### `requireValidLicense()` gerçekte neyi kontrol eder

Bunların hiçbirini kendiniz çağırmazsınız — bu, Adım 2'de eklediğiniz tek metodun **içinde** olan şeydir, meraklılar için burada listelenmiştir. Sırayla:

1. Eklenti premium değilse (gömülü anahtar yok) hemen döner.
2. Host'tan (`getLicenseManager()`) `resourceId = pluginId` ve yerleşik sürüm için bir lisans getirmesini ister.
3. Beklenen çıkaran (issuer) — jetonun geldiğini iddia ettiği kimlik, yani panomc.com (`getLicenseJwtIssuer()`) — karşı, gömülü genel anahtarla **JWT imzasını yeniden doğrular**. Asıl güvenlik sınırı budur.
4. Jetonun kaynağının `pluginId`'nizle eşleştiğini, sürümün eşleştiğini ve **jar SHA-256'nın çalışan jar'la eşleştiğini** (`getOwnJarSha256()`) doğrular.
5. Jetonun süresinin dolmadığını doğrular, sonra onu önbelleğe alır.

### Parmak izi ve sürüm bağlama

Eklentiler için, lisans parmak izi **jar'ın SHA-256'sıdır**. Jeton o hash'i taşır ve çalışma zamanında eklentiniz onu gerçekte çalıştırdığı jar'ın hash'iyle karşılaştırır (`getOwnJarSha256()`). Biri jar'ı yeniden paketler veya yamalıyorsa, hash artık lisanslı olanla eşleşmez ve kontrol bir kurcalama durumuyla başarısız olur.

::: warning Sürümleri yayınlar aracılığıyla hareket hâlinde tutun
Bir lisans, **sürüm + jar** başına çıkarılır. **Zaten yayınlanmış bir jar'ı yamalar veya elle düzenlerseniz**, hash'i o sürüm için kaydedilenle artık eşleşmez, dolayısıyla artık lisanslı olmaz. Değişiklikleri her zaman normal akış aracılığıyla **yeni bir yayın** olarak gönderin; tek doğru yol budur. Her yayında taze bir hash aynı zamanda bir özelliktir: önceki derlemeye karşı yapılmış herhangi bir kırma çalışmasını geçersiz kılar.
:::

## Sağlamlaştırma notları

Sistem zaten birkaç savunma katmanlar — kurulum/sürüm/jar başına bağlama, eklenti tarafı imza yeniden-kontrolü, kısa 1 saatlik jetonlar ve dağınık `LicenseGuard` çağrıları. Çıtayı daha da yükseltebilirsiniz:

- **`LicenseGuard.assert(plugin)`'i geniş şekilde serpiştirin**, böylece kaldırılan tek bir kontrol kapıyı devre dışı bırakmaz.
- **Her düzeltmeyi yeni bir yayın olarak gönderin**, çünkü her yeni jar hash'i taze kırma çabası zorunlu kılar.
- **Jar'ınızı gizleyin (obfuscate).** Gizleme, derlenmiş sınıflarınızı ve metotlarınızı anlamsız sembollere yeniden adlandırır, böylece bir kırıcı lisans kodunu kaldırmak için onu kolayca bulamaz. [ProGuard](https://www.guardsquare.com/proguard) standart ücretsiz araçtır. Bu isteğe bağlıdır ve eklentiniz gerçekten satılana kadar bekleyebilir.

Ama bu sayfanın üstündeki dürüstlük uyarısını aklınızda tutun: bu önlemler, kullanıcıların ezici çoğunluğu için kırma maliyetini yükseltir; onu imkânsız kılmaz.

## Sırada ne var

- **[Derleme ve Yayınlama](/tr/addon/publishing/)** — bu sayfanın üzerine inşa ettiği yayın derlemesi, sürümleme ve tam Pazar Yeri yayınlama akışı.
- **[Manifesto Yapılandırması](/tr/addon/manifest/#premium-derleme-ozellikleri)** — `gradle.properties`'in geri kalanının bağlamında premium derleme özellikleri.
- **[Backend Geliştirme](/tr/addon/backend/)** — `PanoPlugin` sınıfınızın, uç noktalarınızın ve `onStart` yaşam döngüsünün yaşadığı yer.
- Temalar benzer bir tüm-zip parmak izi şeması kullanır — bkz. [premium temalar](/tr/theme/publishing/#how-the-protection-works-in-plain-words).
