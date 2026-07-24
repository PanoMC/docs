# Başlangıç

Bu sayfa sizi sıfırdan alır ve kendi **eklentinizin** yüklenip **Panel → Eklentiler** altında listelenmesine kadar götürür; ayrıca bu eğitimlerin geri kalanında kullanacağınız hızlı bir düzenle-ve-yenile döngüsü kurar. Önceden Pano deneyiminiz olması gerekmez — yalnızca biraz Kotlin ve JavaScript yeterli.

Bir Pano **eklentisi** bir Pano sitesine özellikler ekler: *panelde* (`/panel` adresindeki yönetici panosu) yeni sayfalar, *temada* (ziyaretçilerinizin gördüğü herkese açık site) yeni bölümler ve backend'de (yani Pano sunucusunun kendisinde) yeni API'ler — hepsi tek bir kurulabilir dosyada. Onu hazır bir şablondan derler ve çalışan bir Pano'nun içine bırakırsınız.

::: tip Eklenti ve plugin aynı şeydir
Eklentiler, Pano *plugin*'leridir — kod düzeyindeki API'ler, klasör adları ve sınıfların hepsi `plugin` kelimesini kullanır (örn. `PanoPlugin`, `pluginId`). Bu sayfa (ve bu dokümanların geri kalanı) düz metinde **eklenti** der, ama kodda sürekli `plugin` görmeye devam edersiniz. Bu beklenen bir durumdur; hiçbir şey yeniden adlandırılmamıştır.
:::

Bir eklenti tek bir **JAR dosyasıdır** (JAR, derlenmiş Kotlin/Java kodu artı kaynakların bir zip'idir) ve birlikte çalışan iki yarımdan oluşur:

- Pano sunucusunun içinde çalışan bir **Kotlin backend**. Pano onu PF4J adlı bir kütüphane aracılığıyla yükler — PF4J, Pano'nun eklenti jar'larını yüklemek için kullandığı altyapıdan ibarettir ve onunla asla doğrudan ilgilenmezsiniz. Backend; veritabanı tabloları, JSON API'leri, izinler ve daha fazlasını ekleyebilir — bunların her birini adım adım [Backend Geliştirme](/tr/addon/backend/) sayfasında oluşturacaksınız.
- Tarayıcıda çalışan bir **Svelte arayüzü**. İşte başta insanları şaşırtan kısım: tek bir arayüzünüz, ziyaretçinin bulunduğu siteye — yönetici *paneline* veya herkese açık *temaya* ("tema", site sahibinin etkinleştirdiği herhangi bir ön yüz tasarımıdır) — enjekte edilir.

İki yarımı da kullanmak zorunda değilsiniz — yalnızca arayüzden ya da yalnızca backend'den oluşan bir eklenti gayet olur — ama şablon ikisi de birbirine bağlanmış olarak gelir. Önce bu sayfayı bitirin; ardından [Mimari](/tr/addon/architecture/) iç işleyişi açıklar ve her parçanın tam olarak nerede çalıştığını gösterir. Eklentileri *derlemek* yerine yalnızca *kurmak* istiyorsanız, kullanıcıya yönelik [Eklentiler](/tr/platform/addons/) sayfasına bakın.

Bu eğitimler boyunca kullanacağımız örnek, **Shoutbox** adlı küçük bir eklentidir — ziyaretçiler ana sayfada en son "shout"ları görür, yöneticiler bunları panelden yönetir — bu yüzden projemizi en baştan `pano-plugin-shoutbox` olarak adlandıracağız.

## Başlamadan önce: Pano'yu yerelde çalıştırın

Bu sayfadaki her şey, Pano'nun zaten **kod yazacağınız makinede** çalıştığını varsayar. Siz çalışırken eklentiniz o Pano kurulumunun *içinde* yaşar — onu kurulumun `plugins/` klasörüne bırakırsınız — bu yüzden eklenti geliştirme için Pano'yu uzak bir sunucuda veya VPS'te değil, geliştirme makinenizde yerel olarak çalıştırın.

Henüz yerel bir Pano'nuz yoksa, önce [Kurulum](/tr/platform/installation/) kılavuzunu yapın, sonra geri dönün.

::: tip Kontrol noktası
Pano sitenizi bir tarayıcıda açabilirsiniz (kurulum sırasında seçtiğiniz adres, örn. `http://localhost:<port>`) ve **/panel**'e giriş yapabilirsiniz.
:::

### Geliştirme Modu'nu açın

Geliştirme Modu, arayüzünüzün ve dil dosyalarınızın önbelleğe alınmak yerine **diskten canlı olarak** yüklenmesini sağlar — daha sonra size hızlı yenileme döngüsünü veren şey budur. Onu panelden açın:

**Panel → Platform Ayarları → Geliştirme Modu → Açık**, ardından kaydedin.

Kaydettikten sonra ayar **Açık** olarak görünür. Yapmanız gereken tek şey budur.

::: tip
Perde arkasında bu `development-mode` yapılandırma anahtarıdır, ama yapılandırma dosyasına asla elle dokunmanız gerekmez — paneldeki anahtar işin tamamıdır.
:::

## Neye ihtiyacınız var

Geliştirme makinenizde dört şey. Her birini gösterilen komutla doğrulayın — bir komut "not found" (bulunamadı) diyorsa, önce o aracı kurun.

1. **Bir JDK, sürüm 11 veya daha yeni.** Herhangi bir Java 11+ kurun (sadece JRE değil, bir JDK). Derleme, ihtiyaç duyduğu tam iç Java sürümünü (Java 11) otomatik olarak indirir ve kullanır — bunu asla siz yönetmezsiniz, bu yüzden Gradle'ı çalıştırabilen herhangi bir JDK yeterlidir.
   - Doğrulayın: `java -version` çalıştırın. **11 veya daha yüksek** herhangi bir sürüm numarası sorun olmadığı anlamına gelir. "Command not found" bir JDK kurmanız gerektiği anlamına gelir.
2. **Bun** — arayüzü kuran ve derleyen araç. Onu [bun.sh](https://bun.sh) adresinden kurun. Dev izleyicisi (`bun run dev`) için ona ihtiyacınız var. (Yayın derlemeleri kendi Bun kopyalarını indirir; şimdilik bunu görmezden gelin.)
   - Doğrulayın: `bun --version` çalıştırın.
3. **Git** — sonraki adımda şablonu indirmek için kullanılır.
   - Doğrulayın: `git --version` çalıştırın.
4. **Bir kod editörü.** Herhangi bir editör işe yarar, ama Kotlin için tam bir IDE çok zahmetten kurtarır — [IntelliJ IDEA Community Edition](https://www.jetbrains.com/idea/download/) ücretsizdir ve şablon zaten IntelliJ proje dosyalarını içerir.

::: tip Windows kullanıcıları
Bu dokümanlar Unix benzeri bir kabuk (macOS, Linux, WSL veya Git Bash) varsayar. `cmd` veya PowerShell'de, `./gradlew` gördüğünüz her yerde `gradlew.bat` (veya `.\gradlew`) çalıştırın.
:::

## Eklentinizi şablondan oluşturun

Pano, backend ve arayüz zaten birbirine bağlanmış hazır bir şablon, [`pano-boilerplate-plugin`](https://github.com/PanoMC/pano-boilerplate-plugin), ile gelir. Onu klonlar, sonra her şeyi kendi eklentinize göre yeniden adlandırırsınız.

Onu **Pano kurulumunuzun `plugins/` dizinine** klonlayın — kurulumu tamamladığınız klasör, Pano jar'ını, yapılandırmasını ve bir `plugins/` alt klasörünü içeren klasör budur. Bu önemlidir: bir eklenti, arayüzünü yalnızca çalışan kurulumun `plugins/` klasörünün içinde yaşadığında sıcak yeniden yükler.

Aşağıdaki `git clone` satırındaki son argüman (`pano-plugin-shoutbox`), git'in klonunuz için oluşturduğu klasör adıdır — ve sonraki bölümde ayarlayacağınız `pluginId` ile **tam olarak** eşleşmelidir, çünkü Pano klasörü id ile eşleştirir.

```bash
cd <your-pano-instance>/plugins
git clone https://github.com/PanoMC/pano-boilerplate-plugin.git pano-plugin-shoutbox
cd pano-plugin-shoutbox
```

## Şablonu eklentinize göre yeniden adlandırın

Şablon kendisini birkaç yerde `pano-boilerplate-plugin` olarak adlandırır. Her birini eklentinizin adına değiştireceksiniz. Çoğu `gradle.properties` içinde yaşar — o dosyayı eklentinizin **manifestosu** olarak düşünün: meta veri dosyası (id, ad, sürüm, ana sınıf vb.).

::: tip İsteğe bağlı: yeniden adlandırmadan önce ortamınızı kanıtlayın
Bir şeye dokunmadan önce Java ve Bun kurulumunuzun çalıştığından emin olmak isterseniz, **dokunulmamış** şablonu şimdi bir kez derleyin — eklenti klasörünüzden `bun install`, ardından `./gradlew build` çalıştırın. Buradaki bir `BUILD SUCCESSFUL`, yeniden adlandırmadan *sonra* gelen herhangi bir hatanın bir yeniden adlandırma hatası olduğunu, bozuk bir ortam olmadığını gösterir. (Bu ilk derleme çok şey indirir ve birkaç dakika sürebilir — bu normaldir; iptal etmeyin.)
:::

Bu düzenlemeleri sırayla yapın. 1–3. adımların hepsi aynı sınıfı üç yerde tanımlar, bu yüzden birbirleriyle uyumlu olmalıdırlar:

1. **`gradle.properties`** — şu anahtarları ayarlayın:
   - `pluginId` → `pano-plugin-shoutbox`
   - `pluginName` → `Shoutbox`
   - `pluginClass` → `com.panomc.plugins.shoutbox.ShoutboxPlugin`
   - `pluginDescription`, `pluginDeveloper`, `pluginLicense`, `pluginSourceUrl`, `organization` → kendi değerleriniz

   `pluginClass` bir **tam nitelikli sınıf adıdır**: paket adı artı sınıf adı. Paket, `src/main/kotlin` altındaki klasör yolunu yansıtır, eğik çizgiler noktalara dönüştürülmüştür. Yani bu değer, 2. adımdaki klasör ve 3. adımdaki sınıf adının hepsi aynı şeyi hecelemek zorundadır.

2. **Kotlin paket klasörünü yeniden adlandırın.** `src/main/kotlin/com/panomc/plugins/boilerplate` klasörünü → `src/main/kotlin/com/panomc/plugins/shoutbox` olarak yeniden adlandırın. Sonra o klasördeki tek `.kt` dosyasını, `BoilerplatePlugin.kt`, açın ve ilk satırını — `package` satırını — eşleşecek şekilde değiştirin: `package com.panomc.plugins.shoutbox`.

3. **Kotlin ana sınıfını yeniden adlandırın.** Aynı dosyada, `BoilerplatePlugin` sınıfını → `ShoutboxPlugin` olarak yeniden adlandırın. Bu, 1. adımdaki `pluginClass`'ın sonundaki sınıf adıyla eşleşmelidir. (IntelliJ'de, sınıf adına sağ tıklayın → Refactor → Rename bunu yapar ve dosya adını ve her referansı sizin için günceller.)

4. **`src/main.js`** — iki şeyi değiştirin:
   - `pluginId` sabiti `'pano-boilerplate-plugin'` → `'pano-plugin-shoutbox'`
   - `export default class PanoExamplePlugin …` satırındaki sınıf adı → kendi adınız (örn. `ShoutboxUiPlugin`)

5. **`package.json`** — `"name"` → `pano-plugin-shoutbox` olarak ayarlayın.

6. **`settings.gradle.kts`** — şablon projenin adını burada ayarlamaz, bu yüzden şu satırı ekleyin:

   `rootProject.name = "pano-plugin-shoutbox"`

   Bu olmadan, Gradle projeyi klasörün adına göre adlandırır. Klasör bir gün başka bir şeyle adlandırılsa bile derlenen jar'ınız her zaman doğru adı taşısın ve eklentinizin kimliğiyle eşleşsin diye onu açıkça ayarlayın.

İşte **gerekli** olan her şey budur. İki şey daha içeriktir, bağlantı değil — onları şimdi veya daha sonra istediğiniz zaman değiştirin:

- **`src/main/resources/locales/en-US.json`** — arayüz metin dizeleriniz. Şablon tek bir anahtarla gelir, `hello-world`.
- **`src/main/resources/logo.png`** — kendi logonuzla değiştirin.

::: tip `pluginId`'nizi bir kez seçin ve asla değiştirmeyin
`gradle.properties` içinde ayarladığınız `pluginId` yalnızca bir etiket değildir — Pano onu perde arkasında birçok yere gömer, bu yüzden onu bir kez seçin ve sabit tutun. [Manifest Yapılandırması](/tr/addon/manifest/) sayfası onun tam olarak nerede kullanıldığını listeler.
:::

Şimdi onu derleyin ve yükleyin (sonraki bölüm) — başarılı bir derleme, altı yeniden adlandırmanızın uyumlu olduğunu doğrular.

## Eklentinizi derleyin ve yükleyin

Eklenti klasörünüzden (`plugins/pano-plugin-shoutbox/`), arayüz bağımlılıklarını kurun ve bir kez derleyin:

```bash
# in plugins/pano-plugin-shoutbox/ (your addon folder)
bun install
./gradlew build
```

**İlk** derleme, Gradle'ın kendisini, iç Java araç zincirini ve tüm bağımlılıkları indirir — birkaç dakika donmuş gibi görünebilir. Bu normaldir; iptal etmeyin. `BUILD SUCCESSFUL` ile biter ve `build/libs/` altında bir jar (`pano-plugin-shoutbox-local-build.jar` olarak adlandırılmış) üretir.

::: tip Kontrol noktası
`BUILD SUCCESSFUL`, yeniden adlandırmalarınızın uyumlu olduğu anlamına gelir. Derleme **başarısız olursa**, iki düzenleme uyuşmuyordur — en yaygın nedenler:

- **`ClassNotFoundException` / "plugin class not found"** → `pluginClass` (1. adım) paket + sınıf adınızla eşleşmiyor (2–3. adımlar). Üçü de aynı `com.panomc.plugins.shoutbox.ShoutboxPlugin`'i hecelemelidir.
- **Çözülmemiş referans / paket derleme hatası** → `.kt` dosyasının içindeki `package` satırı (2. adım) yeniden adlandırdığınız klasörle eşleşmiyor.
:::

Pano yalnızca kurulumun `plugins/` klasöründe **doğrudan** duran jar'ları keşfeder — klonunuzun içindeki iç içe `build/libs/` klasörünü *taramaz* — bu yüzden, eklenti klasörünüzden yeni derlenen jar'ı bir seviye yukarı kopyalayın:

```bash
cp build/libs/pano-plugin-shoutbox-local-build.jar ..   # into the instance's plugins/ folder
```

Şimdi **Pano'yu yeniden başlatın**: çalışan işlemi durdurun (Pano'nun çalıştığı terminalde Ctrl+C'ye basın) ve tam olarak kurulum sırasında yaptığınız gibi tekrar başlatın. Sonra **Panel → Eklentiler**'i açın — eklentiniz listelenmiş olmalı. Bu, "yüklendi mi?" kontrolüdür. (Yeni jar'lar yalnızca açılışta alınır; panelin eklenti eylemleri etkinleştir / devre dışı bırak / sil / yükle'dir, yeniden tarama değil.) Görünüyorsa, backend yarısı doğru yüklenmiştir ve yinelemeye hazırsınız.

::: tip Eklenti listelenmiyor mu?
Görünmezse: jar `plugins/` içinde **doğrudan** mı duruyor (hâlâ `build/libs/` içinde değil)? Sunucu günlüğünde bir plugin-yükleme hatası olup olmadığına bakın ve `pluginClass`'ın paket + sınıf adınızla eşleştiğini yeniden kontrol edin.
:::

::: tip Klon ve yüklenebilir jar iki ayrı şeydir
Eklentinizin iki kopyası şimdi `plugins/` içinde yan yana yaşıyor:

```
plugins/
├── pano-plugin-shoutbox/                       ← your clone (source)
│   └── src/…, locales/…, plugin-ui/…
└── pano-plugin-shoutbox-local-build.jar        ← the built jar Pano loads
```

- **Jar**, Pano'nun gerçekten çalıştırdığı backend kodudur.
- **Klasör** (adı `pluginId`'nizle eşleşir), Geliştirme Modu açıkken Pano'nun canlı arayüz ve dil dosyaları için okuduğu şeydir.

İkisi de mutlu bir şekilde bir arada var olur — jar backend'inizi çalıştırır, klasör canlı arayüz ve dil yeniden yüklemelerini besler.
:::

## Dev döngüsü

Bu, sayfanın en önemli kısmıdır. Geliştirme sırasında neredeyse hiçbir zaman tam `./gradlew build`'i çalıştırmak istemezsiniz — her seferinde arayüzü yeniden derler, bu yavaştır. Bunun yerine, eklentinin her yarısı için birer tane olmak üzere **iki komut** kullanın. İkisini de eklenti klasörünüzden, `plugins/pano-plugin-shoutbox/`, çalıştırın.

**Backend (Kotlin) işi** için, arayüzü atlayan hızlı bir yalnızca-backend JAR derleyin. (`-P` Gradle derlemesine bir bayrak geçirir; burada `noui` "arayüz derlemesini atla" anlamına gelir.)

```bash
./gradlew build -Pnoui   # fast backend-only jar, skips the UI build
```

**Arayüz (Svelte) işi** için, izleyiciyi başlatın ve çalışır bırakın. Arayüz kaynak dosyalarınızı izler ve her kaydettiğinizde çıktıyı `src/main/resources/plugin-ui/` içine yeniden derler. (Yorumdaki `rollup watch` notu yalnızca işi yapan aracı adlandırır — onu doğrudan çalıştırmazsınız.)

```bash
bun run dev              # rollup watch → src/main/resources/plugin-ui/{client,server}
```

Geliştirme Modu açık olduğu ve eklenti kurulumun `plugins/` klasöründe yaşadığı sürece, Pano sitenizin herhangi bir sayfasını — kurulum sırasında kullandığınız aynı adres, örn. `http://localhost:<port>` — yenilemek yeni arayüz derlemesini hemen alır, JAR yeniden derlemesi olmadan.

Yine de her değişiklik o kadar hızlı değildir. İşte her tür değişikliğin tam olarak neye ihtiyaç duyduğu:

| Şunu değiştirdiniz | Görmek için |
|---|---|
| Svelte arayüzü (`src/main.js`, `src/panel/**`, `src/theme/**`) | Çalışan `bun run dev` + tarayıcı yenilemesi (F5) |
| `locales/*.json` | Geliştirme Modu açıkken, tarayıcı yenilemesi (F5) — dil dosyaları kaynak ağacınızdan canlı okunur |
| Kotlin kodu | `./gradlew build -Pnoui`, yeni jar'ı `plugins/`'e kopyalayın, sonra **Pano'yu yeniden başlatın** |
| `gradle.properties`, kaynak `config.conf` | Tam `./gradlew build`, jar'ı `plugins/`'e kopyalayın, sonra Pano'yu yeniden başlatın |

(`config.conf`, `src/main/resources/config.conf` konumundaki eklentinin varsayılan yapılandırma şablonudur — onunla [Backend Geliştirme](/tr/addon/backend/) sayfasında tanışacaksınız.)

::: warning Kotlin değişiklikleri yeniden derleme *ve* yeniden başlatma gerektirir
Kotlin kodu **sıcak değildir**. Bir `.kt` dosyasını düzenledikten sonra: yeniden derleyin (yalnızca backend kodu için `./gradlew build -Pnoui` yeterlidir), yeni jar'ı kurulumunuzun `plugins/` klasörüne kopyalayın ve **Pano'yu yeniden başlatın**. Eklentiyi panelde devre dışı bırakıp yeniden etkinleştirmek yeni kodunuzu **almaz** — sunucu, tam bir yeniden başlatma yeni jar'ı yükleyene kadar eski kodunuzu bellekte tutar. `gradle.properties` veya kaynak `config.conf`'taki değişiklikler de aynı şekilde tam bir `./gradlew build` gerektirir.
:::

## 2 dakikada ilk değişikliğiniz

Sıcak-ile-yeniden-derleme ayrımının gerçekten oturması için her türden bir değişiklik yapalım.

**Bir arayüz değişikliği (sıcak — F5 yeterli).** `src/main.js`'i açın. `onLoad()` içinde bir `console.log` satırı ekleyeceksiniz. `const pano = this.pano;` satırı ve etrafındaki kod **zaten dosyada** — onları tekrar yazmayın, ve aşağıdaki `// ...` yalnızca zaten orada olan kodun yerini tutar. Yalnızca log satırınızı ekleyin:

```js
onLoad() {
  const pano = this.pano;
  console.log('Shoutbox UI loaded! isPanel =', pano.isPanel);
  // ...
}
```

`bun run dev`'in çalıştığından emin olun, dosyayı kaydedin, sonra Pano sitenizi (`http://localhost:<port>`) yenileyin ve tarayıcı konsolunu açın (F12 → Console). Mesajınız orada — yeniden derleme gerekmedi.

::: tip Mesaj yok mu?
Bir terminalde `bun run dev`'in hâlâ çalıştığını, panelde Geliştirme Modu'nun **Açık** olduğunu ve klonunuzun kurulumun `plugins/` klasörü altında olduğunu kontrol edin. Üç olağan neden bunlardır.
:::

**Bir dil değişikliği (Geliştirme Modu'nda da sıcak).** `src/main/resources/locales/en-US.json`'ı açın ve şablonun tek dizesini değiştirin:

```json
{
  "hello-world": "Hello from Shoutbox!"
}
```

Onu kaydedin ve F5'e basın. Geliştirme Modu açık olduğu ve klonunuz `plugins/<pluginId>/` içinde yaşadığı için, Pano dil dosyalarını **kaynak ağacınızdan canlı** okur — bu yüzden yeniden derleme gerekmez.

Dürüst bir uyarı: standart şablon `hello-world` dizesini *tanımlar* ama onu henüz hiçbir sayfada **göstermez** (panel ve tema klasörleri boş gelir — dil dizelerini arayüzünüze [Frontend Geliştirme](/tr/addon/frontend/) sayfasında bağlayacaksınız). Yani burada *henüz* değiştiğini izleyecek ekranda bir şey yoktur. Alınacak nokta **kuraldır**: arayüzünüz bir dil dizesi gösterir göstermez, JSON'ı düzenleyip F5'e basmak tek gerekendir — ve yukarıdaki `console.log` kontrolü bu canlı yeniden yüklemenin çalıştığını zaten kanıtladı.

**Bir Kotlin değişikliği (yeniden derleme + yeniden başlatma gerektirir).** Bu, sıcak *olmayanıdır*. `ShoutboxPlugin` sınıfınızın bulunduğu dosyayı açın ve `onStart()` içinde zaten bulunan `logger.info("Starting...")` satırındaki mesajı değiştirin — örneğin:

```kotlin
logger.info("Shoutbox is starting up!")
```

Sonra, eklenti klasörünüzden, yeniden derleyin ve jar'ı bir seviye yukarı kopyalayın:

```bash
# in plugins/pano-plugin-shoutbox/ (your addon folder)
./gradlew build -Pnoui
cp build/libs/pano-plugin-shoutbox-local-build.jar ..
```

Şimdi Pano'yu yeniden başlatın (çalışan işleme Ctrl+C, sonra tekrar başlatın). Pano açılırken onu çalıştıran terminali izleyin — yeni mesajınız sunucu konsolunda görünür. Bir panel devre dışı → etkinleştir eski kodu çalıştırmaya devam ederdi, yeniden başlatmanın tam olarak bu yüzden gerekli olması işte budur.

Kısacası döngünün tamamı budur: **Arayüz ve dil dosyaları Geliştirme Modu altında canlıdır; Kotlin ve manifest (`gradle.properties`) değişiklikleri bir yeniden derleme ve bir Pano yeniden başlatması gerektirir.** Bu ayrımı aklınızda tutun, bu eğitimlerin geri kalanı hızlı hissettirecek.

## Çalışmadığında

İlk kez karşılaşılan sorunların çoğu beş şeye dayanır. Onları sırayla kontrol edin:

1. **Eklentiniz Panel → Eklentiler'de listelenmiyor.** Derlenen jar kurulumun `plugins/` klasöründe **doğrudan** mı duruyor (hâlâ `build/libs/` altında değil)? Yeni jar'lar yalnızca açılışta yüklenir — Pano'yu yeniden başlattınız mı? Sunucu günlüğünde bir plugin-yükleme hatası olup olmadığına bakın ve `pluginClass`'ın paket + sınıf adınızla eşleştiğini yeniden kontrol edin.
2. **Bir arayüz veya dil düzenlemesi görünmüyor.** `bun run dev` hâlâ çalışıyor mu? Panelde Geliştirme Modu **Açık** mı? Klonunuz kurulumun `plugins/` klasörü altında mı (`plugins/<pluginId>/` konumunda)?
3. **Bir Kotlin düzenlemesi etkili olmuyor.** Kotlin sıcak değildir — yeniden derlemeli (`./gradlew build -Pnoui`), jar'ı `plugins/`'e kopyalamalı ve Pano'yu **yeniden başlatmalısınız**. Panelde devre dışı bırak/etkinleştir yeterli değildir.
4. **Yeniden adlandırmadan hemen sonra derleme başarısız oluyor.** Yeniden adlandırma düzenlemelerinizden ikisi uyuşmuyor — hata nedenleri için [Derleyip yükleyin](#eklentinizi-derleyin-ve-yukleyin) kontrol noktasına bakın. `pluginClass`'ın, paket klasörünün ve sınıf adının hepsinin aynı şeyi hecelediğini yeniden kontrol edin.
5. **Dev sunucunuz takılıyor (yalnızca bir tema veya panel dev sunucusu da çalıştırıyorsanız geçerlidir).** O dev sunucusunun Vite yapılandırmasında `/plugins` için bir proxy kuralı **eklemeyin**. Arayüz sunucusu o yolu zaten sunar; onu geri proxylemek dev sunucusunu takan bir istek döngüsü oluşturur.

## Sonraki adım

Artık kendi eklentiniz yüklü ve hangi değişikliklerin sıcak, hangilerinin olmadığını biliyorsunuz. İşte önerilen yol:

- **[Mimari](/tr/addon/architecture/)** — zihinsel model: Pano JAR'ınızı yüklediğinde ne olur ve çalışma zamanında her dosya nerede biter. Gerçek kod yazmadan önce bunu okuyun.
- **[Backend Geliştirme](/tr/addon/backend/)** — Shoutbox backend'ini oluşturun: bir veritabanı tablosu, bir JSON API'si, bir izin ve bir etkinlik günlüğü.
- **[Frontend Geliştirme](/tr/addon/frontend/)** — Shoutbox arayüzünü oluşturun: ana sayfaya bir bileşen yerleştirin, bir panel ayarlar bölümü ve tam bir panel sayfası ekleyin.
- **[Derleme ve Yayınlama](/tr/addon/publishing/)** — eklentinizi bir yayına dönüştürün ve pazar yerine gönderin.
