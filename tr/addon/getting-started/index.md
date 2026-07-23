# Başlangıç

Bir Pano **eklentisi** (addon), bir Pano sitesine özellikler ekler: panelde yeni sayfalar, temada yeni bölümler, backend'de yeni API'ler — hepsi tek bir kurulabilir dosyada. Onu hazır bir şablondan oluşturur ve çalışan bir Pano'nun içine bırakırsınız.

::: tip Eklenti (addon) ile plugin aynı şeydir
Eklentiler, Pano *plugin*'leridir — kod düzeyindeki API'ler, klasör adları ve sınıfların hepsi `plugin` kelimesini kullanır (örn. `PanoPlugin`, `pluginId`). Bu sayfa (ve bu dokümanların geri kalanı) düz metinde **eklenti** der, ancak kodda `plugin` ifadesini görmeye devam edeceksiniz. Bu beklenen bir durumdur; hiçbir şey yeniden adlandırılmamıştır.
:::

Bir eklenti, birlikte çalışan iki yarımı içeren tek bir JAR dosyasıdır:

- Pano sunucusunun içinde çalışan bir **Kotlin backend** (bir PF4J plugin'i) — veritabanı tabloları, JSON API'leri, izinler ve daha fazlasını ekler;
- tarayıcıda, **hem** yönetim panelinin **hem de** etkin temanın içinde çalışan bir **Svelte arayüz (UI) paketi**.

İki yarımı da kullanmak zorunda değilsiniz — yalnızca arayüzden oluşan ya da yalnızca backend'den oluşan bir eklenti gayet olur — ancak şablon ikisi de birbirine bağlanmış olarak gelir. Her parçanın tam olarak nerede çalıştığını anlamak için sırada [Mimari](/tr/addon/architecture/) sayfasını okuyun. Eklentileri oluşturmak yerine yalnızca *kurmak* istiyorsanız, kullanıcıya yönelik [Eklentiler](/tr/platform/addons/) sayfasına bakın.

Bu sayfa sizi sıfırdan, **Panel → Eklentiler** içinde görünen kendi eklentinize kadar, çalışan bir düzenle-ve-yenile döngüsüyle birlikte götürür. Bu eğitimler boyunca kullanacağımız örnek, **Shoutbox** adlı küçük bir eklentidir — ziyaretçiler ana sayfada en son "shout"ları görür, yöneticiler bunları panelden yönetir — bu yüzden projemizi en baştan `pano-plugin-shoutbox` olarak adlandıracağız.

## Neye ihtiyacınız var

| Gereksinim | Notlar |
|---|---|
| **JDK 11 veya daha yenisi** | Eklenti bir **Java 11 araç zinciriyle (toolchain)** derlenir; böylece Pano'nun desteklediği her sunucuda çalışır (Pano'nun kendisi de yalnızca Java 11+ ister). Gradle'ı JDK 11 veya daha yenisi çalıştırabilir; JDK'nız 11'den yeniyse şablon, Java 11 araç zincirini sizin için otomatik indirir. |
| **Bun** | Arayüz (UI) paket yöneticisi ve derleyicisi. [bun.sh](https://bun.sh) adresinden kurun. Gradle, yayın (release) derlemeleri için Bun 1.2.0'ı otomatik indirir, ancak `bun run dev`'i çalıştırabilmeniz için yerelde kurulu olmasını istersiniz. |
| **Çalışan bir Pano örneği** | Kurulum sihirbazı zaten tamamlanmış, kendi sunucunuzda barındırılan bir örnek. Eklentiniz, siz çalışırken bu örneğin içinde yaşar. Henüz kurmadıysanız [Kurulum](/tr/platform/installation/) sayfasına bakın. |
| **Geliştirme Modu** | **Panel → Platform Ayarları** içinde bir anahtar (yapılandırma anahtarı `development-mode`). Temanın eklenti-arayüzü önbelleklemesini devre dışı bırakır (böylece paketiniz her istekte yeniden getirilir) ve yerelleştirme (locale) dosyalarının diskten canlı yüklenmesini sağlar. |
| **Geliştirme ortamında çalışan bir Pano** | Canlı arayüz sıcak (hot) döngüsü yalnızca Pano *sürecinin* DEVELOPMENT ortamında çalışması durumunda işler — Pano'nun bir geliştirme derlemesi ya da `EnvironmentType=DEVELOPMENT` ortam değişkeniyle başlatılmış platform. Stok bir yayın örneğinde backend her zaman jar'ınıza gömülü arayüz paketini sunar, bu yüzden Geliştirme Modu açık olsa bile `bun run dev` çıktısı yenilemede görünmez. |
| **`init-ui = true`** | Pano'ya başlangıçta arayüz motorlarını (kurulum, panel, tema) başlatmasını söyleyen bir yapılandırma ayarı — bunlar olmadan eklenti arayüzünüzü yükleyecek bir panel veya tema olmaz. Varsayılan değeri **`true`**'dur, bu yüzden normalde ona dokunmazsınız; sadece devre dışı bırakılmadığından emin olun. |

::: tip Bir değil, iki anahtar
Arayüz sıcak döngüsü **ikisini birden** gerektirir: Geliştirme Modu açık *ve* geliştirme ortamında çalışan bir Pano. Geliştirme Modu (bir yapılandırma anahtarı) temanın eklenti-arayüzü önbelleklemesini devre dışı bırakır ve canlı yerelleştirme yüklemesini açar. Geliştirme **ortamı** (Pano'nun bir geliştirme derlemesi ya da süreçte `EnvironmentType=DEVELOPMENT`), backend'in arayüz zip'inizi jar'ınıza gömülü kopyayı akıtmak yerine her istekte diskten taze olarak derlemesini sağlayan şeydir. Normal bir yayın örneğinde yalnızca Geliştirme Modu'nu açmak yeterli değildir — backend yine de jar'daki paketi sunar. Başlamadan önce ikisini de açın.
:::

## Eklentinizi şablondan oluşturun

Pano, backend ve arayüz zaten birbirine bağlanmış hazır bir şablon olan [`pano-boilerplate-plugin`](https://github.com/PanoMC/pano-boilerplate-plugin) ile birlikte gelir. Onu klonlar, ardından her şeyi kendi eklentinize göre yeniden adlandırırsınız.

**Onu Pano örneğinizin `plugins/` dizinine klonlayın.** Bu önemlidir: bir eklenti, arayüzünü yalnızca çalışan örneğin `plugins/` klasörünün içinde yaşadığında sıcak yeniden yükler (hot-reload).

```bash
cd <your-pano-instance>/plugins
git clone https://github.com/PanoMC/pano-boilerplate-plugin.git pano-plugin-shoutbox
cd pano-plugin-shoutbox
```

Şimdi şablonu kendi eklentinize göre yeniden adlandırın. Şablon kendine birkaç yerde `pano-boilerplate-plugin` der — her birini değiştirin. Shoutbox örneğimiz için tam değerlerle birlikte kontrol listesinin tamamı aşağıda:

| Konum | Ne değiştirilecek |
|---|---|
| `gradle.properties` | `pluginId` → `pano-plugin-shoutbox`; `pluginName` → `Shoutbox`; `pluginDescription`, `pluginDeveloper`, `pluginLicense`, `pluginSourceUrl`, `organization` → kendi değerleriniz; `pluginClass` → `com.panomc.plugins.shoutbox.ShoutboxPlugin` |
| Kotlin paketi | `src/main/kotlin/com/panomc/plugins/boilerplate` klasörünü `.../shoutbox` olarak yeniden adlandırın ve dosyanın içindeki `package` satırını güncelleyin |
| Kotlin ana sınıfı | `BoilerplatePlugin` → `ShoutboxPlugin` (yukarıdaki `pluginClass` ile eşleşmeli) |
| `src/main.js` | `pluginId` sabiti `'pano-boilerplate-plugin'` → `'pano-plugin-shoutbox'` ve varsayılan sınıf adı `PanoExamplePlugin` → kendinizinki (örn. `ShoutboxUiPlugin`) |
| `package.json` | `"name"` → `pano-plugin-shoutbox` |
| `settings.gradle.kts` | `rootProject.name = "pano-plugin-shoutbox"` satırını ekleyin — şablon bu dosyayı **boş** getirir, bu yüzden bu satır olmadan Gradle proje adı klasör adına geri düşer |
| `src/main/resources/locales/en-US.json` | Metin dizeleriniz (şablonun tek bir anahtarı vardır, `hello-world`) |
| `src/main/resources/logo.png` | Kendi logonuzla değiştirin |

::: tip `pluginId` her yerde kullanılır
`gradle.properties` içinde belirlediğiniz `pluginId` yalnızca bir etiket değildir — veri dizininizin adı, arayüz URL segmentiniz, izin-düğümü önekiniz ve pazar yeri (marketplace) kaynak kimliğiniz olur. Bir kez seçin ve sabit tutun. Manifesto hakkında tüm ayrıntılar [Manifesto Yapılandırması](/tr/addon/manifest/) sayfasındadır.
:::

## İlk derleme ve doğrulama

Arayüz bağımlılıklarını kurun ve eklentinin tamamını bir kez derleyin:

```bash
bun install
./gradlew build
```

Bu, `build/libs/` altında bir JAR üretir (`pano-plugin-shoutbox-local-build.jar` adında). Pano yalnızca örneğin `plugins/` klasöründe **doğrudan** duran jar'ları keşfeder — klonunuzun bulunduğu iç içe `build/libs/` dizinini *taramaz* — bu yüzden yeni derlenen jar'ı bir üst seviyeye kopyalayın:

```bash
cp build/libs/pano-plugin-shoutbox-local-build.jar ..   # into the instance's plugins/ folder
```

Ardından Pano'yu yeniden başlatın ve **Panel → Eklentiler**'i açın — eklentiniz orada listelenmiş olmalı. Bu, "yüklendi mi?" kontrolüdür. (Yeni jar'lar yalnızca başlangıçta alınır; panelin eklenti eylemleri etkinleştir / devre dışı bırak / sil / yükle şeklindedir, yeniden tarama değil.) Görünüyorsa, backend yarısı doğru yüklenmiştir ve yinelemeye (iterate) hazırsınız.

::: tip Klon ile yüklenebilir jar iki ayrı şeydir
Klonunuz `plugins/pano-plugin-shoutbox/` konumunda kalır — bu yol (`pluginId`'nizle eşleşen), Pano'nun geliştirme sırasında canlı arayüz ve yerelleştirme dosyaları için okuduğu yerdir. **Yüklenebilir** backend jar'ı ise doğrudan `plugins/` içine yerleştirdiğiniz kopyadır. İkisi sorunsuz bir arada bulunur.
:::

## Geliştirme döngüsü

Bu, sayfanın en önemli kısmıdır. Geliştirirken neredeyse hiçbir zaman tam `./gradlew build`'i çalıştırmak istemezsiniz — bu, arayüzü her seferinde yeniden derler ve yavaştır. Bunun yerine, eklentinin her yarısı için birer tane olmak üzere **iki komut** kullanın.

**Backend (Kotlin) çalışması** için, arayüzü atlayan hızlı, yalnızca-backend bir JAR derleyin:

```bash
./gradlew build -Pnoui   # fast backend-only jar, skips the UI build
```

**Arayüz (Svelte) çalışması** için, izleyiciyi başlatın ve çalışır durumda bırakın:

```bash
bun run dev              # rollup watch → src/main/resources/plugin-ui/{client,server}
```

`bun run dev`, siz her kaydettiğinizde arayüzünüzü eklentinin `plugin-ui` klasörüne yeniden derler. Geliştirme Modu açık olduğu, Pano bir geliştirme ortamında çalıştığı ve eklenti örneğin `plugins/` klasöründe bulunduğu sürece, bir tarayıcı yenilemesi yeni derlemeyi anında alır — JAR yeniden derlemesi gerekmez.

Ancak her değişiklik bu kadar hızlı değildir. Her tür değişikliğin tam olarak neye ihtiyaç duyduğu aşağıda:

| Değiştirdiğiniz | Görmek için |
|---|---|
| Svelte arayüzü (`src/main.js`, `src/panel/**`, `src/theme/**`) | `bun run dev` çalışıyor + tarayıcı yenileme (F5) |
| `locales/*.json` | Geliştirme Modu açıkken, tarayıcı yenileme (F5) — yerelleştirmeler kaynak ağacınızdan canlı okunur |
| Kotlin kodu | `./gradlew build -Pnoui`, yeni jar'ı `plugins/` içine kopyalayın, sonra **Pano'yu yeniden başlatın** |
| `gradle.properties`, kaynak `config.conf` | Tam `./gradlew build`, jar'ı `plugins/` içine kopyalayın, sonra Pano'yu yeniden başlatın |

::: warning Kotlin değişiklikleri bir yeniden derleme *ve* bir yeniden başlatma gerektirir
Kotlin kodu sıcak (hot) **değildir**. Bir `.kt` dosyasını düzenledikten sonra yeniden derleyin (yalnızca-backend kod için `./gradlew build -Pnoui` yeterlidir), yeni jar'ı örneğinizin `plugins/` klasörüne kopyalayın ve **Pano'yu yeniden başlatın**. Eklentiyi panelde devre dışı bırakıp yeniden etkinleştirmek, yeniden derlenmiş bytecode'u *almaz* — PF4J zaten yüklü olan sınıf yükleyicisini (classloader) korur, bu yüzden yalnızca yeniden başlatma yeni jar'ı yükler. `gradle.properties` veya kaynak `config.conf` değişiklikleri de aynı şekilde tam bir `./gradlew build` gerektirir.
:::

::: warning Bir Vite/geliştirme yapılandırmasında `/plugins`'i asla proxy'lemeyin
Ayrıca bir tema veya panel geliştirme sunucusu da çalıştırıyorsanız, yapılandırmasına `/plugins` için bir proxy kuralı **eklemeyin**. Arayüz sunucusu zaten o yolu sunar; onu geri proxy'lemek, geliştirme sunucunuzu askıda bırakacak bir istek döngüsü oluşturur.
:::

## 2 dakikada ilk değişikliğiniz

Sıcak-mı-yeniden-derleme-mi ayrımının iyice oturması için her türden birer değişiklik yapalım.

**Bir arayüz değişikliği (sıcak — F5 yeterli).** `src/main.js`'i açın ve `onLoad()` içine bir log satırı ekleyin:

```js
onLoad() {
  const pano = this.pano;
  console.log('Shoutbox UI loaded! isPanel =', pano.isPanel);
  // ...
}
```

`bun run dev`'in çalıştığından emin olun, dosyayı kaydedin, ardından Pano sitenizi yenileyin ve tarayıcı konsolunu açın. Mesajınız orada — yeniden derleme gerekmez.

**Bir yerelleştirme değişikliği (Geliştirme Modu'nda bu da sıcaktır).** `src/main/resources/locales/en-US.json`'ı açın ve şablonun tek dizesini değiştirin:

```json
{
  "hello-world": "Hello from Shoutbox!"
}
```

Kaydedin ve F5'e basın. Geliştirme Modu açık olduğu ve klonunuz `plugins/<pluginId>/` içinde bulunduğu için, Pano yerelleştirme dosyalarını **kaynak ağacınızdan canlı** okur — böylece yeni metin, tıpkı arayüz gibi, yeniden derleme olmadan görünür.

**Bir Kotlin değişikliği (yeniden derleme + yeniden başlatma gerektirir).** Sıcak *olmayan* şey budur. Herhangi bir `.kt` dosyasını değiştirin, `./gradlew build -Pnoui` çalıştırın, jar'ı `plugins/` içine kopyalayın ve Pano'yu yeniden başlatın — panelde devre dışı bırak → etkinleştir, eski bytecode'u çalıştırmaya devam eder.

Kısaca tüm döngü budur: **Arayüz ve yerelleştirmeler Geliştirme Modu altında canlıdır; Kotlin ve manifesto değişiklikleri bir yeniden derleme ve bir Pano yeniden başlatması gerektirir.** Bu ayrımı aklınızda tutun, bu eğitimlerin geri kalanı hızlı hissettirecek.

## Sırada ne var

Artık kendi eklentiniz yüklü ve hangi değişikliklerin sıcak, hangilerinin olmadığını biliyorsunuz. Önerilen yol aşağıda:

- **[Mimari](/tr/addon/architecture/)** — zihinsel model: Pano JAR'ınızı yüklediğinde ne olur ve her dosya çalışma zamanında nerede son bulur. Gerçek kod yazmadan önce bunu okuyun.
- **[Backend Geliştirme](/tr/addon/backend/)** — Shoutbox backend'ini oluşturun: bir veritabanı tablosu, bir JSON API'si, bir izin ve bir etkinlik günlüğü.
- **[Arayüz Geliştirme](/tr/addon/frontend/)** — Shoutbox arayüzünü oluşturun: ana sayfaya bir widget yerleştirin, bir panel ayarları bölümü ve tam bir panel sayfası ekleyin.
- **[Derleme ve Yayınlama](/tr/addon/publishing/)** — eklentinizi bir yayına dönüştürün ve pazar yerine gönderin.
