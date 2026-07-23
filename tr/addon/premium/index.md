# Premium Eklentiler ve Lisanslama

Eklentinizi resmi Pano Pazar Yeri'nde (Marketplace) satabilir ve Pano'nun yalnızca gerçekten ödeme yapmış sunucularda çalışmasını zorunlu kılmasını sağlayabilirsiniz. Bu, [Derleme ve Yayınlama](/tr/addon/publishing/#premium-listeler)'nın işaret ettiği tam adım-adım anlatımdır: satış, tıpatıp ücretsiz bir eklenti ile aynı yayın akışıyla çalışır, artı iki ekstra parça — jar'ınıza gömülü bir **derleme zamanı lisans anahtarı** ve kodunuzda bir **çalışma zamanı lisans kontrolü**.

Henüz ücretsiz bir eklenti yayınlamadıysanız, önce [Derleme ve Yayınlama](/tr/addon/publishing/) sayfasını okuyun — oradaki her şey (yayın derlemesi, sürümleme, yayın kanalları, `.releaserc.json`, kaynağı ve API token'ını oluşturma) hâlâ geçerlidir. Bu sayfa yalnızca premium katmanını üstüne ekler.

::: warning Hiçbir koruma mutlak değildir
Bu sistemin neyi yapıp neyi yapamayacağı konusunda kendinize karşı dürüst olun: **hiçbir lisans sistemi kodu %100 koruyamaz**. Buradaki amaç, yetkisiz kullanımı kullanıcıların büyük çoğunluğu için mümkün olduğunca zorlaştırmaktır — imkânsız kılmak değil. Her yazılım parçası gibi, son kullanıcının eline geçen her kod doğası gereği açığa çıkmıştır: yeterince kararlı ve yetenekli biri onu her zaman parçalarına ayırabilir. Bu, yalnızca Pano'nunki için değil, şimdiye kadar yapılmış her DRM için geçerlidir. Eklentinizi bu gerçeği aklınızda tutarak fiyatlandırın ve destekleyin.
:::

## Lisans sistemi nasıl çalışır (sade anlatımla)

Bir premium eklenti, panomc.com'un **RS256 açık anahtarının** bir kopyasını taşır ve bu, derleme zamanında gömülür. Oradan itibaren:

1. Pano eklentinizi başlattığında, eklenti host'tan **panomc.com**'dan kısa ömürlü (**1 saat**) imzalı bir lisans token'ı (bir RS256 JWT) getirmesini ister.
2. Eklenti daha sonra, kendi gömülü açık anahtarını kullanarak **o token'ı kendisi yeniden doğrular** — bunu host'un yaptığına güvenmez.
3. Token dört şeye **bağlıdır**: **tam olarak bu Pano kurulumu**, **kaynağınız**, **eklenti sürümü** ve **çalışan jar'ın SHA-256 hash'i**. Bir sunucu, sürüm ya da jar için verilen bir token başka hiçbir yerde işe yaramaz.
4. Kontrol geçerse, eklenti normal şekilde başlar. Başarısız olursa, eklenti **başlamayı reddeder** — ama Pano'nun kendisi çalışmaya devam eder ve başarısızlık, operatörün düzeltebilmesi için panelde gösterilir.

Önemli tasarım noktası: **güvenlik sınırı sizin plugin kodunuzdur**, Pano çekirdeği değil. Pano çekirdeği açık kaynaktır ve fork'lanabilir ya da yamalanabilir — bu yüzden eklenti, JWT imzasını *kendi* gömülü anahtarıyla doğrular. Kurcalanmış bir host bile bir token'ı taklit edemez, çünkü panomc.com'un özel anahtarına sahip değildir.

::: tip Eklentilerin `premium` manifesto alanı yoktur
`manifest.json` içinde `"premium": true` yapan temaların aksine, bir **eklentinin premium durumu tamamen derleme zamanında** bir lisans açık anahtarının gömülüp gömülmediğine göre belirlenir. `gradle.properties` içinde ya da jar manifestosunda `premium` alanı yoktur. Bir anahtarla derle → premium; anahtarsız derle → ücretsiz. Kodunuzda ya da manifestonuzda başka hiçbir şey değişmez.
:::

## Adım 1 — Lisans anahtarını derleme zamanında göm

Premium derleme, açık anahtarı jar'ınıza gömen birkaç ekstra girdi kabul eder. Bunlar **derleme bayraklarıdır, manifesto öznitelikleri değil** (bkz. [Manifesto Yapılandırması → Premium derleme özellikleri](/tr/addon/manifest/#premium-derleme-ozellikleri)). Bunların **hiçbirini** geçmezseniz, eklentiniz normal bir **ücretsiz** jar olarak derlenir ve çalışma zamanı kontrolü bir no-op'a dönüşür — böylece aynı kaynak, hiçbir kod değişikliği olmadan ücretsiz ya da premium olarak gönderilebilir.

| Girdi | Tür | Ne yapar |
|---|---|---|
| `-PlicenseServer=dev\|prod\|<url>` | Gradle özelliği | Açık anahtarı bir lisans sunucusundan getirir. `dev` → `https://api-dev.panomc.com`, `prod` → `https://api.panomc.com` ya da tam bir özel URL geçin. **Önerilir** — saklanacak gizli bir şey yok. |
| `PANO_LICENSE_SERVER` | Ortam değişkeni | `-PlicenseServer` ile aynı, CI için (Gradle derleme adımında ayarlayın). Özellik ayarlanmadığında kullanılır. |
| `-PpanoLicensePublicKey=<base64>` | Gradle özelliği | Anahtarı doğrudan sağlar (Base64 ya da PEM), herhangi bir ağ çağrısını atlar. |
| `PANO_LICENSE_PUBLIC_KEY` | Ortam değişkeni | `-PpanoLicensePublicKey` ile aynı, CI için. Özellik ayarlanmadığında kullanılır. |

**Öncelik:** açıkça sağlanan bir anahtar (`-PpanoLicensePublicKey`, ardından `PANO_LICENSE_PUBLIC_KEY`) her zaman kazanır; yalnızca ikisi de ayarlı değilse derleme, `-PlicenseServer`'dan, ardından `PANO_LICENSE_SERVER`'dan getirmeye geri döner. Hiçbir şey ayarlı değilse, gömülü anahtar boştur ve jar ücretsizdir.

En basit premium derleme şudur:

```bash
./gradlew build -PlicenseServer=prod
```

CI için, iş akışınızın Gradle derleme adımında `PANO_LICENSE_SERVER`'ı ayarlayın — örneğin `dev` dalında `dev`, `main`'de `prod` — böylece bir push, doğru anahtarlanmış bir jar üretir. Stok `pano-boilerplate-plugin` yayın iş akışı bunu ayarla**maz**: derleme adımı düz bir `./gradlew build`'dir, bu yüzden kutudan çıktığı haliyle bir push, **ücretsiz** bir jar üretir. O ortam değişkenini derleme adımına eklemek, bir premium fork'un yaptığı tek değişikliktir — boilerplate'in `gradle.properties` dosyası bunu açıkça belirtir.

::: tip Anahtar açıktır — bayrak seçimi gizlilikle değil, kolaylıkla ilgilidir
Gömülü değer, panomc.com'un **açık** doğrulama anahtarıdır, bu yüzden gizlenecek hassas bir şey yoktur (bu, gizli kalması gereken Pazar Yeri API token'ınızın aksinedir). Derlemenin her zaman güncel anahtarı getirmesi için `-PlicenseServer` / `PANO_LICENSE_SERVER`'ı tercih edin; `-PpanoLicensePublicKey` / `PANO_LICENSE_PUBLIC_KEY`'i yalnızca CI'nız derleme zamanında lisans sunucusuna ulaşamadığında kullanın.
:::

::: warning Premium bir yayın için her zaman temiz, tam bir derleme yapın
Herhangi bir yayın jar'ında olduğu gibi, bir premium yayını asla `-Pnoui` ile derlemeyin — arayüzü atlar ve jar'a bayat bir paket gömebilir (bkz. [Derleme ve Yayınlama](/tr/addon/publishing/#yayın-derlemesi)'ndaki uyarı). Premium diktir (orthogonal): lisans bayrağını bir `-Pnoui` geliştirme derlemesine değil, temiz bir `./gradlew build`'e ekleyin.
:::

## Adım 2 — Çalışma zamanı lisans kontrolünü ekle

Kontrol, plugin sınıfınızda yaşar ve boilerplate'ten `PluginLicenseClient`'ı kullanır. **Şablon bu bağlantı işini zaten gönderir** — taze bir `pano-boilerplate-plugin` lisansa hazırdır ve onu bir anahtarla derleyene kadar basitçe ücretsiz olarak davranır. İlgili parçalar:

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

- **`requireValidLicense()`** kapıdır. Bir premium jar'da lisansı getirir, doğrular ve çapraz kontrol eder; ücretsiz bir jar'da (gömülü anahtar yok) hemen döner. Onu `onStart()`'ın **en üstünde** çağırın; böylece herhangi bir başarısızlık, eklentiniz herhangi bir iş yapmadan önce yayılır.
- **`verifyLicense()`**, panelin *Lisansı yenile* butonunun, host taze bir token getirdikten sonra çağırdığı, override edilebilir bir `PanoPlugin` kancasıdır; böylece panel gerçek sonucu yansıtır. Onu aynı `requireValidLicense()`'a devredin.

`requireValidLicense()` başarısız olduğunda `LicenseRequiredException` fırlatır. Ardından PF4J **yalnızca sizin eklentinizi** başarısız olarak işaretler ve host nedeni kaydeder; Pano çekirdeği ve diğer her eklenti çalışmaya devam eder. Platformun, yanlış yapılandırılmış tek bir premium eklenti tarafından bozulamaz tutulması bilinçlidir — operatör bunu çözmek için hâlâ paneline ulaşabilir.

### `requireValidLicense()` aslında neyi kontrol eder

Sırasıyla şunları yapar:

1. Eklenti premium değilse (gömülü anahtar yok) hemen döner.
2. Host'tan (`getLicenseManager()`) `resourceId = pluginId` ve gömülü sürüm için bir lisans getirmesini ister.
3. Gömülü açık anahtarla, beklenen yayıncıya (`getLicenseJwtIssuer()`) karşı **JWT imzasını yeniden doğrular** — gerçek güvenlik sınırı.
4. Token'ın kaynağının `pluginId`'nizle eşleştiğini, sürümün eşleştiğini ve **jar SHA-256'sının çalışan jar ile eşleştiğini** (`getOwnJarSha256()`) doğrular.
5. Token'ın süresinin dolmadığını doğrular, ardından onu önbelleğe alır.

### Derinlemesine savunma: `LicenseGuard`

Bir kırıcının (cracker) en kolay hamlesi tek `onStart` kontrolünü yamalayıp çıkarmak olduğundan, boilerplate ayrıca sıcak yollarınıza — rota işleyicileri, zamanlanmış işler, WebSocket işleyicileri — **ucuz, çoğunlukla önbelleklenmiş** yeniden kontroller serpiştirmek için `LicenseGuard` gönderir:

```kotlin
override suspend fun handle(context: RoutingContext): Result {
    LicenseGuard.assert(plugin)
    // ... business logic
}
```

`LicenseGuard.assert(plugin)`, önbelleklenmiş lisansı yeniden kullanır ve yalnızca süresi dolmuşsa yeniden getirir, bu yüzden maliyet ihmal edilebilir — ama ne kadar çok yerde görünürse, bir kırıcının yapması gereken düzenleme de o kadar artar.

## Adım 3 — Ücretli bir kaynak olarak yayınla

Bir premium eklenti yayınlamak, ücretsiz bir eklenti ile **aynı üç adımı** kullanır — kaynağı oluştur, bir API token'ı oluştur, otomasyonun sürümleri yüklemesine izin ver — [Resmi Pano Pazar Yeri'nde yayınlama](/tr/addon/publishing/#resmi-pano-pazar-yeri-nde-yayınlama) sayfasından. İki şey farklıdır:

**1. Ücretli olarak fiyatlandırın.** Kaynağı oluştururken, ücretsiz yerine **ücretli** fiyatlandırma seçeneğini seçin. Eklentiler için her zaman olduğu gibi, Pazar Yeri `resourceId`'niz tam olarak `pluginId`'nizdir (bir UUID değil) — bkz. [kaynak ID ipucu](/tr/addon/publishing/#resmi-pano-pazar-yeri-nde-yayınlama).

**2. Jar'ı doğrudan yükleyin — `useGitHubLink` kullanmayın.** Ücretsiz eklentiler, yinelenen bir yüklemeyi önlemek için `useGitHubLink: true` ayarlar. Premium eklentiler, Pazar Yeri'nin **kanonik jar'ı** tutmasına ve SHA-256'sını kaydetmesine izin vermelidir, çünkü kaydedilen o hash, her alıcının lisansının bağlandığı şeydir. `.releaserc.json` Pano plugin yapılandırmanızda, `useGitHubLink`'i düşürün (ya da `false` olarak ayarlayın):

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

O yapılandırmadaki diğer her şey — iki kanal girdisi, `tokenVar`, `branches` — [`.releaserc.json` adım adım](/tr/addon/publishing/#releaserc-json-adım-adım) anlatımından değişmemiştir.

### Bir alıcı onu çalıştırdığında ne olur

Bir alıcının Pano'su premium eklentinizi başlattığında, panomc.com bir lisans token'ını **yalnızca** o bağlı hesap kaynağınızı satın aldıysa **ve** çalışan jar'ın SHA-256'sı o sürüm için kaydedilen hash ile eşleşiyorsa verir. (Kaynak yazarı olarak siz her zaman geçersiniz — böylece kendi ücretli eklentinizi test edebilirsiniz.) Doğrudan yüklenmiş, hash'i kaydedilmiş bir jar'ın önemli olmasının nedeni budur: tüm kontrolün asılı olduğu parmak izidir.

## Parmak izi ve sürüm bağlama

Eklentiler için, lisans parmak izi **jar'ın SHA-256'sıdır**. Token o hash'i taşır ve çalışma zamanında eklentiniz onu, gerçekte çalıştırdığı jar'ın hash'iyle (`getOwnJarSha256()`) karşılaştırır. Biri jar'ı yeniden paketler ya da yamalarsa, hash artık lisanslı olanla eşleşmez ve kontrol bir kurcalama (tamper) durumuyla başarısız olur — [premium temalar](/tr/theme/publishing/#koruma-nasıl-calısır-sade-anlatımla) için kullanılan tüm-zip parmak izinin jar karşılığı.

::: warning Sürümleri yayınlar aracılığıyla hareket ettirmeye devam edin
Bir lisans, **sürüm + jar** başına verilir. Zaten yayınlanmış bir jar'ı yamalarsanız, hash'i değişir ve artık lisanslı olmaz. Değişiklikleri her zaman normal akış üzerinden bir **yeni yayın** olarak gönderin — yayınlanmış bir `.jar`'ı asla elle düzenlemeyin. Her yayında taze bir hash aynı zamanda bir özelliktir: önceki derlemeye karşı yapılan herhangi bir kırma (crack) çalışmasını geçersiz kılar.
:::

## Alıcılar panellerinde ne görür

Bir premium eklenti kendini lisanslayamazsa, operatör tahmin yürütmek zorunda kalmaz — panel bunu üç yerde gösterir: **Panel → Eklentiler**'de bir **eklenti-başına durum rozeti**, eklenti detay sayfasında bir **Lisans kartı** ve panonun (dashboard) üzerinde bir **afiş (banner)**. Yaygın durumlar ve düzeltmeleri:

| Durum | Anlamı | Düzeltme |
|---|---|---|
| `LICENSED` | Geçerli lisans, eklenti çalışıyor. | Yapılacak bir şey yok. |
| `NO_PURCHASE` | Hesap bağlı ama bu eklentiyi satın almadı. | panomc.com'da satın alın (kart dışarı bağlantı verir). |
| `NOT_CONNECTED` | Bu Pano'ya bağlı bir panomc.com hesabı yok. | Panel ayarlarında hesabı bağlayın. |
| `NETWORK_ERROR` | Kontrol anında panomc.com'a ulaşılamadı. | Bağlantıyı geri yükleyin, ardından **Yenile**'ye tıklayın. |
| `JAR_TAMPERED` | Çalışan jar'ın hash'i lisanslı olanla eşleşmiyor. | Eklentiyi panomc.com'dan yeniden indirin. |

Operatörün yanlış yapabileceği Pano tarafında bir lisanslama yapılandırması yoktur — premium eklentiler kendi kontrollerini yönetir ve lisanssız olan, sitenin geri kalanı çalışırken basitçe devre dışı kalır.

## Sağlamlaştırma notları

Sistem zaten birkaç savunma katmanı sağlar — kurulum/sürüm/jar başına bağlama, plugin tarafında imza yeniden-kontrolü, kısa 1 saatlik token'lar ve dağıtılmış `LicenseGuard` çağrıları. Çıtayı daha da yükseltebilirsiniz:

- **`LicenseGuard.assert(plugin)`'i geniş bir şekilde serpiştirin**, böylece kaldırılan tek bir kontrol kapıyı devre dışı bırakmaz.
- **Her düzeltmeyi bir yeni yayın olarak gönderin**, çünkü her yeni jar hash'i taze kırma çabası gerektirir.
- **Jar'ınızı gizleyin (obfuscate)** (örneğin ProGuard ile), böylece kontrolleri yamalayıp çıkarmak daha zor bulunur.

Ama bu sayfanın başındaki dürüstlük uyarısını aklınızda tutun: bu önlemler, kullanıcıların ezici çoğunluğu için kırma maliyetini yükseltir; onu imkânsız kılmaz.

## Sırada ne var

- **[Derleme ve Yayınlama](/tr/addon/publishing/)** — bu sayfanın üzerine inşa edildiği yayın derlemesi, sürümleme ve tam Pazar Yeri yayınlama akışı.
- **[Manifesto Yapılandırması](/tr/addon/manifest/#premium-derleme-ozellikleri)** — `gradle.properties`'in geri kalanı bağlamında premium derleme özellikleri.
- **[Backend Geliştirme](/tr/addon/backend/)** — `PanoPlugin` sınıfınızın, uç noktalarınızın ve `onStart` yaşam döngüsünün yaşadığı yer.
