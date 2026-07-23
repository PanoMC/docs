# Başlangıç

Bu sayfa sizi sıfırdan alıp, kendi **eklentinizin** yüklenip **Panel → Eklentiler** altında listelenmesine kadar götürür; ayrıca bu eğitimlerin geri kalanında kullanacağınız hızlı bir düzenle-ve-yenile döngüsü kurar. Önceden Pano deneyiminiz olması gerekmez — yalnızca biraz Kotlin ve JavaScript yeterli.

Bir Pano **eklentisi** bir Pano sitesine özellikler ekler: *panelde* (yani `/panel` adresindeki yönetici panosunda) yeni sayfalar, *temada* (ziyaretçilerinizin gördüğü herkese açık site) yeni bölümler ve backend'de (yani Pano sunucusunun kendisinde) yeni API'ler — hepsi tek bir kurulabilir dosyada. Onu hazır bir şablondan derler ve çalışan bir Pano'nun içine bırakırsınız.

::: tip Eklenti ve plugin aynı şeydir
Eklentiler, Pano *plugin*'leridir — kod düzeyindeki API'ler, klasör adları ve sınıfların hepsi `plugin` kelimesini kullanır (örn. `PanoPlugin`, `pluginId`). Bu sayfa (ve bu dokümanların geri kalanı) düz metinde **eklenti** der, ama kodda sürekli `plugin` görmeye devam edersiniz. Bu beklenen bir durum; hiçbir şey yeniden adlandırılmamıştır.
:::

Bir eklenti tek bir **JAR dosyasıdır** (JAR, derlenmiş Kotlin/Java kodunun ve kaynakların bir zip'idir) ve birlikte çalışan iki yarımdan oluşur:

- Pano sunucusunun içinde çalışan bir **Kotlin backend**'i. Pano onu PF4J adlı bir kütüphane aracılığıyla yükler — PF4J, Pano'nun eklenti jar'larını yüklemek için kullandığı bir altyapıdan ibarettir ve onunla asla doğrudan ilgilenmezsiniz. Backend; veritabanı tabloları, JSON API'leri, izinler ve daha fazlasını ekleyebilir — bunların her birini adım adım [Backend Geliştirme](/tr/addon/backend/) sayfasında oluşturacaksınız.
- Tarayıcıda çalışan bir **Svelte arayüzü**. İşte başta insanları şaşırtan kısım: tek bir arayüzünüz, ziyaretçinin bulunduğu siteye — yönetici *paneline* mi yoksa herkese açık *temaya* mı ("tema", site sahibinin etkinleştirdiği ön yüz tasarımıdır) — göre enjekte edilir.

İki yarımı da kullanmak zorunda değilsiniz — yalnızca arayüzden ya da yalnızca backend'den oluşan bir eklenti gayet olur — ama şablon ikisi de birbirine bağlanmış olarak gelir. Önce bu sayfayı bitirin; ardından [Mimari](/tr/addon/architecture/) her parçanın tam olarak nerede çalıştığını göstererek iç işleyişi açıklar. Eklentileri derlemek yerine yalnızca *kurmak* istiyorsanız, kullanıcıya yönelik [Eklentiler](/tr/platform/addons/) sayfasına bakın.

Bu eğitimler boyunca kullanacağımız örnek, **Shoutbox** adlı küçük bir eklentidir — ziyaretçiler ana sayfada en son "shout"ları görür, yöneticiler bunları panelden yönetir — bu yüzden projemizi en baştan `pano-plugin-shoutbox` olarak adlandıracağız.

## Başlamadan önce: Pano'yu yerelde çalıştırın

Bu sayfadaki her şey, Pano'nun zaten **kod yazacağınız makinede** çalıştığını varsayar. Siz çalışırken eklentiniz o Pano kurulumunun *içinde* yaşar — onu kurulumun `plugins/` klasörüne bırakırsınız — bu yüzden eklenti geliştirme için Pano'yu uzak bir sunucuda veya VPS'te değil, geliştirme makinenizde yerel olarak çalıştırın.

Henüz yerel bir Pano'nuz yoksa, önce [Kurulum](/tr/platform/installation/) rehberini yapın, sonra buraya dönün.

::: tip Kontrol noktası
Pano sitenizi bir tarayıcıda açabiliyorsunuz (kurulum sırasında seçtiğiniz adres, örn. `http://localhost:<port>`) ve **/panel**'e giriş yapabiliyorsunuz.
:::

### Geliştirme Modu'nu açın

Geliştirme Modu, arayüzünüzün ve yerelleştirme dosyalarınızın önbelleğe alınmak yerine **diskten canlı** yüklenmesini sağlar — sonradan kullanacağınız hızlı yenileme döngüsünü mümkün kılan şey budur. Panelden açın:

**Panel → Platform Ayarları → Geliştirme Modu → Açık**, sonra kaydedin.

Kaydettikten sonra ayar **Açık** olarak görünür. Yapmanız gereken tek şey bu.

::: tip
Arka planda bu, `development-mode` yapılandırma anahtarıdır, ama yapılandırma dosyasına elle dokunmanız gerekmez — panel düğmesi işin tamamıdır.
:::

## Neye ihtiyacınız var

Geliştirme makinenizde dört şey. Her birini gösterilen komutla doğrulayın — bir komut "bulunamadı" (not found) diyorsa, önce o aracı kurun.

1. **Bir JDK, sürüm 11 veya daha yeni.** Herhangi bir Java 11+ kurun (JRE değil, JDK). Derleme, ihtiyaç duyduğu tam iç Java sürümünü (Java 11) otomatik olarak indirir ve kullanır — onu asla siz yönetmezsiniz, dolayısıyla Gradle'ı çalıştırabilen herhangi bir JDK yeterlidir.
   - Doğrulama: `java -version` çalıştırın. **11 veya daha yüksek** herhangi bir sürüm numarası iyi olduğunuz anlamına gelir. "Command not found" bir JDK kurmanız gerektiği anlamına gelir.
2. **Bun** — arayüzü kuran ve derleyen araç. [bun.sh](https://bun.sh) adresinden kurun. Geliştirme izleyicisi (`bun run dev`) için buna ihtiyacınız var. (Yayın derlemeleri kendi Bun kopyalarını indirir; onu şimdilik boş verin.)
   - Doğrulama: `bun --version` çalıştırın.
3. **Git** — sonraki adımda şablonu indirmek için kullanılır.
   - Doğrulama: `git --version` çalıştırın.
4. **Bir kod editörü.** Herhangi bir editör çalışır, ama Kotlin için tam bir IDE çok baş ağrısından kurtarır — [IntelliJ IDEA Community Edition](https://www.jetbrains.com/idea/download/) ücretsizdir ve şablon zaten IntelliJ proje dosyalarını içerir.

::: tip Windows kullanıcıları
Bu dokümanlar Unix benzeri bir kabuk (macOS, Linux, WSL veya Git Bash) varsayar. `cmd` veya PowerShell'de, `./gradlew` gördüğünüz her yerde `gradlew.bat` (veya `.\gradlew`) çalıştırın.
:::

## Şablondan kendi eklentinizi oluşturun

Pano, backend ve arayüz zaten birbirine bağlanmış hazır bir şablon olan [`pano-boilerplate-plugin`](https://github.com/PanoMC/pano-boilerplate-plugin) ile birlikte gelir. Onu klonlar, ardından her şeyi kendi eklentinize göre yeniden adlandırırsınız.

Onu **Pano kurulumunuzun `plugins/` dizinine** klonlayın — bu, kurulumu tamamladığınız klasördür; Pano jar'ını, yapılandırmasını ve bir `plugins/` alt klasörünü içeren klasör. Bu önemlidir: bir eklenti, yalnızca çalışan kurulumun `plugins/` klasörünün içinde yaşadığında arayüzünü sıcak yeniden yükler (hot-reload).

Aşağıdaki `git clone` satırındaki son argüman (`pano-plugin-shoutbox`), git'in klonunuz için oluşturduğu klasör adıdır — ve sonraki bölümde ayarlayacağınız `pluginId` ile **tam olarak** eşleşmelidir, çünkü Pano klasörü id ile eşleştirir.

```bash
cd <your-pano-instance>/plugins
git clone https://github.com/PanoMC/pano-boilerplate-plugin.git pano-plugin-shoutbox
cd pano-plugin-shoutbox
```

## Şablonu kendi eklentinize göre yeniden adlandırın

Şablon kendine birkaç yerde `pano-boilerplate-plugin` der. Bunların her birini eklentinizin adına göre değiştireceksiniz. Çoğu `gradle.properties` içinde yaşar — o dosyayı eklentinizin **manifestosu** olarak düşünün: üst verilerinin (id, ad, sürüm, ana sınıf vb.) tutulduğu dosya.

::: tip İsteğe bağlı: yeniden adlandırmadan önce ortamınızı kanıtlayın
Hiçbir şeye dokunmadan önce Java ve Bun kurulumunuzun çalıştığından emin olmak isterseniz, **dokunulmamış** şablonu şimdi bir kez derleyin — eklenti klasörünüzden `bun install`, ardından `./gradlew build` çalıştırın. Buradaki `BUILD SUCCESSFUL`, yeniden adlandırmadan *sonraki* herhangi bir hatanın ortam sorunu değil, yeniden adlandırma hatası olduğu anlamına gelir. (Bu ilk derleme çok şey indirir ve birkaç dakika sürebilir — bu normaldir; iptal etmeyin.)
:::

Bu düzenlemeleri sırayla yapın. 1–3. adımların hepsi aynı sınıfı üç ayrı yerde tarif eder, dolayısıyla birbirleriyle uyuşmaları gerekir:

1. **`gradle.properties`** — şu anahtarları ayarlayın:
   - `pluginId` → `pano-plugin-shoutbox`
   - `pluginName` → `Shoutbox`
   - `pluginClass` → `com.panomc.plugins.shoutbox.ShoutboxPlugin`
   - `pluginDescription`, `pluginDeveloper`, `pluginLicense`, `pluginSourceUrl`, `organization` → kendi değerleriniz

   `pluginClass` **tam nitelikli bir sınıf adıdır**: paket adı artı sınıf adı. Paket, `src/main/kotlin` altındaki klasör yolunu yansıtır; eğik çizgiler noktaya çevrilir. Yani bu değer, 2. adımdaki klasör ve 3. adımdaki sınıf adı aynı şeyi heceler.

2. **Kotlin paket klasörünü yeniden adlandırın.** `src/main/kotlin/com/panomc/plugins/boilerplate` klasörünü → `src/main/kotlin/com/panomc/plugins/shoutbox` olarak yeniden adlandırın. Ardından o klasördeki tek `.kt` dosyası olan `BoilerplatePlugin.kt`'yi açın ve ilk satırını — `package` satırını — eşleşecek şekilde değiştirin: `package com.panomc.plugins.shoutbox`.

3. **Kotlin ana sınıfını yeniden adlandırın.** Aynı dosyada `BoilerplatePlugin` sınıfını → `ShoutboxPlugin` olarak yeniden adlandırın. Bu, 1. adımdaki `pluginClass`'ın sonundaki sınıf adıyla eşleşmelidir. (IntelliJ'de sınıf adına sağ tıklayıp → Refactor → Rename bunu yapar ve dosya adını ve her referansı sizin için günceller.)

4. **`src/main.js`** — iki şeyi değiştirin:
   - `pluginId` sabiti `'pano-boilerplate-plugin'` → `'pano-plugin-shoutbox'`
   - `export default class PanoExamplePlugin …` satırındaki sınıf adını → kendi adınıza (örn. `ShoutboxUiPlugin`)

5. **`package.json`** — `"name"` → `pano-plugin-shoutbox` olarak ayarlayın.

6. **`settings.gradle.kts`** — şablon projenin adını burada ayarlamaz, bu yüzden şu satırı ekleyin:

   `rootProject.name = "pano-plugin-shoutbox"`

   Bu olmadan Gradle, projeyi klasörün adıyla adlandırır. Klasör bir gün başka bir adla adlandırılsa bile derlenmiş jar'ınızın her zaman doğru adı taşıması ve eklentinizin kimliğiyle eşleşmesi için bunu açıkça ayarlayın.

Bu, **gerekli** olanların tamamı. İki şey daha var ki bunlar bağlantı değil, içerik — şimdi ya da sonra istediğiniz zaman değiştirin:

- **`src/main/resources/locales/en-US.json`** — arayüz metin dizeleriniz. Şablon tek bir anahtar getirir: `hello-world`.
- **`src/main/resources/logo.png`** — kendi logonuzla değiştirin.

::: tip `pluginId`'nizi bir kez seçin ve asla değiştirmeyin
`gradle.properties` içinde ayarladığınız `pluginId` yalnızca bir etiket değildir — Pano onu arka planda birçok yere gömer, bu yüzden bir kez seçin ve kararlı tutun. [Manifesto Yapılandırması](/tr/addon/manifest/) sayfası nerede kullanıldığını tam olarak listeler.
:::

Şimdi derleyip yükleyin (sonraki bölüm) — başarılı bir derleme, altı yeniden adlandırmanızın uyuştuğunu doğrular.

## Eklentinizi derleyin ve yükleyin

Eklenti klasörünüzden (`plugins/pano-plugin-shoutbox/`), arayüz bağımlılıklarını kurun ve bir kez derleyin:

```bash
bun install
./gradlew build
```

**İlk** derleme Gradle'ın kendisini, iç Java araç zincirini ve tüm bağımlılıkları indirir — birkaç dakika donmuş gibi durabilir. Bu normaldir; iptal etmeyin. `BUILD SUCCESSFUL` ile biter ve `build/libs/` altında bir jar üretir (adı `pano-plugin-shoutbox-local-build.jar`).

::: tip Kontrol noktası
`BUILD SUCCESSFUL`, yeniden adlandırmalarınızın uyuştuğu anlamına gelir. Derleme **başarısız** olursa, iki düzenleme birbiriyle uyuşmuyordur — en yaygın nedenler:

- **`ClassNotFoundException` / "plugin class not found"** → `pluginClass` (1. adım), paket + sınıf adınızla (2–3. adımlar) eşleşmiyordur. Üçü de aynı `com.panomc.plugins.shoutbox.ShoutboxPlugin`'i hecelemelidir.
- **Çözümlenmemiş referans / paket derleme hatası** → `.kt` dosyasının içindeki `package` satırı (2. adım), yeniden adlandırdığınız klasörle eşleşmiyordur.
:::

Pano yalnızca kurulumun `plugins/` klasöründe **doğrudan** duran jar'ları keşfeder — klonunuzun içindeki iç içe `build/libs/` klasörünü *taramaz* — bu yüzden eklenti klasörünüzden, yeni derlenen jar'ı bir seviye yukarı kopyalayın:

```bash
cp build/libs/pano-plugin-shoutbox-local-build.jar ..   # into the instance's plugins/ folder
```

Şimdi **Pano'yu yeniden başlatın**: çalışan işlemi durdurun (Pano'nun çalıştığı terminalde Ctrl+C'ye basın) ve kurulum sırasında yaptığınız gibi tam olarak yeniden başlatın. Ardından **Panel → Eklentiler**'i açın — eklentiniz orada listelenmiş olmalı. Bu, "yüklendi mi?" kontrolüdür. (Yeni jar'lar yalnızca başlangıçta alınır; panelin eklenti eylemleri etkinleştir / devre dışı bırak / sil / yükle şeklindedir, yeniden tarama değil.) Görünüyorsa, backend yarısı doğru yüklenmiştir ve yinelemeye (iterate) hazırsınız.

::: tip Eklenti listelenmedi mi?
Görünmüyorsa: jar, `plugins/` içinde **doğrudan** mı duruyor (hâlâ `build/libs/` içinde değil)? Sunucu günlüğünde bir eklenti yükleme hatası olup olmadığını kontrol edin ve `pluginClass`'ın paket + sınıf adınızla eşleştiğini yeniden kontrol edin.
:::

::: tip Klon ile yüklenebilir jar iki ayrı şeydir
Şimdi eklentinizin iki kopyası `plugins/` içinde yan yana yaşıyor:

```
plugins/
├── pano-plugin-shoutbox/                       ← your clone (source)
│   └── src/…, locales/…, plugin-ui/…
└── pano-plugin-shoutbox-local-build.jar        ← the built jar Pano loads
```

- **Jar**, Pano'nun gerçekten çalıştırdığı backend kodudur.
- **Klasör** (adı `pluginId`'nizle eşleşir), Geliştirme Modu açıkken Pano'nun canlı arayüz ve yerelleştirme dosyaları için okuduğu şeydir.

İkisi mutlu bir şekilde bir arada yaşar — jar backend'inizi çalıştırır, klasör canlı arayüz ve yerelleştirme yeniden yüklemelerini besler.
:::

## Geliştirme döngüsü

Bu, sayfanın en önemli kısmı. Geliştirirken neredeyse hiçbir zaman tam `./gradlew build`'i çalıştırmak istemezsiniz — bu arayüzü her seferinde yeniden derler ve yavaştır. Bunun yerine, eklentinin her yarısı için birer tane olmak üzere **iki komut** kullanın. İkisini de eklenti klasörünüzden, `plugins/pano-plugin-shoutbox/`'tan çalıştırın.

**Backend (Kotlin) işi** için, arayüzü atlayan hızlı, yalnızca-backend bir JAR derleyin. (`-P`, Gradle derlemesine bir bayrak geçirir; burada `noui` "arayüz derlemesini atla" anlamına gelir.)

```bash
./gradlew build -Pnoui   # fast backend-only jar, skips the UI build
```

**Arayüz (Svelte) işi** için, izleyiciyi başlatın ve çalışır bırakın. Arayüz kaynak dosyalarınızı izler ve her kaydettiğinizde çıktıyı `src/main/resources/plugin-ui/` içine yeniden derler. (Yorumdaki `rollup watch` notu yalnızca işi yapan aracı adlandırır — onu doğrudan çalıştırmazsınız.)

```bash
bun run dev              # rollup watch → src/main/resources/plugin-ui/{client,server}
```

Geliştirme Modu açık olduğu ve eklenti kurulumun `plugins/` klasöründe yaşadığı sürece, Pano sitenizin herhangi bir sayfasını — kurulum sırasında kullandığınız aynı adres, örn. `http://localhost:<port>` — yenilemek yeni arayüz derlemesini anında alır, JAR yeniden derlemesi gerekmez.

Yine de her değişiklik o kadar hızlı değildir. İşte her tür değişikliğin tam olarak neye ihtiyaç duyduğu:

| Değiştirdiğiniz | Görmek için |
|---|---|
| Svelte arayüzü (`src/main.js`, `src/panel/**`, `src/theme/**`) | `bun run dev` çalışıyor + tarayıcı yenileme (F5) |
| `locales/*.json` | Geliştirme Modu açıkken, tarayıcı yenileme (F5) — yerelleştirmeler kaynak ağacınızdan canlı okunur |
| Kotlin kodu | `./gradlew build -Pnoui`, yeni jar'ı `plugins/` içine kopyalayın, sonra **Pano'yu yeniden başlatın** |
| `gradle.properties`, kaynak `config.conf` | Tam `./gradlew build`, jar'ı `plugins/` içine kopyalayın, sonra Pano'yu yeniden başlatın |

(`config.conf`, `src/main/resources/config.conf`'taki eklentinin varsayılan yapılandırma şablonudur — onunla [Backend Geliştirme](/tr/addon/backend/) sayfasında tanışacaksınız.)

::: warning Kotlin değişiklikleri yeniden derleme *ve* yeniden başlatma gerektirir
Kotlin kodu **sıcak** değildir. Bir `.kt` dosyasını düzenledikten sonra: yeniden derleyin (yalnızca-backend kod için `./gradlew build -Pnoui` yeterlidir), yeni jar'ı kurulumunuzun `plugins/` klasörüne kopyalayın ve **Pano'yu yeniden başlatın**. Eklentiyi panelde devre dışı bırakıp yeniden etkinleştirmek yeni kodunuzu **almaz** — sunucu, tam bir yeniden başlatma yeni jar'ı yükleyene kadar eski kodunuzu bellekte tutar. `gradle.properties` veya kaynak `config.conf` değişiklikleri aynı şekilde tam bir `./gradlew build` gerektirir.
:::

## 2 dakikada ilk değişikliğiniz

Her türden birer değişiklik yapalım ki sıcak-ile-yeniden-derleme ayrımı gerçekten oturasın.

**Bir arayüz değişikliği (sıcak — F5 yeterli).** `src/main.js`'i açın. `onLoad()` içine bir `console.log` satırı ekleyeceksiniz. `const pano = this.pano;` satırı ve çevresindeki kod **zaten dosyada** — bunları yeniden yazmayın, aşağıdaki `// ...` yalnızca zaten orada olan kodun yerini tutar. Yalnızca kendi günlük satırınızı ekleyin:

```js
onLoad() {
  const pano = this.pano;
  console.log('Shoutbox UI loaded! isPanel =', pano.isPanel);
  // ...
}
```

`bun run dev`'in çalıştığından emin olun, dosyayı kaydedin, sonra Pano sitenizi (`http://localhost:<port>`) yenileyin ve tarayıcı konsolunu açın (F12 → Console). Mesajınız orada — yeniden derleme gerekmez.

::: tip Mesaj yok mu?
Bir terminalde `bun run dev`'in hâlâ çalıştığını, panelde Geliştirme Modu'nun **Açık** olduğunu ve klonunuzun kurulumun `plugins/` klasörü altında olduğunu kontrol edin. Bunlar üç olağan nedendir.
:::

**Bir yerelleştirme değişikliği (Geliştirme Modu'nda o da sıcak).** `src/main/resources/locales/en-US.json`'ı açın ve şablonun tek dizesini değiştirin:

```json
{
  "hello-world": "Hello from Shoutbox!"
}
```

Kaydedin ve F5'e basın. Geliştirme Modu açık olduğu ve klonunuz `plugins/<pluginId>/` içinde yaşadığı için Pano yerelleştirme dosyalarını **kaynak ağacınızdan canlı** okur — yani yeniden derleme gerekmez.

Dürüst bir uyarı: standart şablon `hello-world` dizesini *tanımlar* ama henüz herhangi bir sayfada **göstermez** (panel ve tema klasörleri boş gelir — yerelleştirme dizelerini arayüzünüze [Arayüz Geliştirme](/tr/addon/frontend/) sayfasında bağlayacaksınız). Yani burada *henüz* ekranda değişimini izleyeceğiniz bir şey yok. Buradan çıkarılacak nokta **kuraldır**: arayüzünüz bir yerelleştirme dizesi gösterdikten sonra, JSON'u düzenleyip F5'e basmak tek gereken şeydir — ve yukarıdaki `console.log` kontrolü bu canlı yeniden yüklemenin çalıştığını zaten kanıtladı.

**Bir Kotlin değişikliği (yeniden derleme + yeniden başlatma gerektirir).** İşte sıcak *olmayan* olan bu. `ShoutboxPlugin` sınıfınızın bulunduğu dosyayı açın ve `onStart()` içinde zaten bulunan `logger.info("Starting...")` satırındaki mesajı değiştirin — örneğin:

```kotlin
logger.info("Shoutbox is starting up!")
```

Ardından, eklenti klasörünüzden, yeniden derleyip jar'ı bir seviye yukarı kopyalayın:

```bash
./gradlew build -Pnoui
cp build/libs/pano-plugin-shoutbox-local-build.jar ..
```

Şimdi Pano'yu yeniden başlatın (çalışan işlemi Ctrl+C, sonra tekrar başlatın). Pano açılırken onu çalıştıran terminali izleyin — yeni mesajınız sunucu konsolunda belirir. Panelde devre dışı bırak → etkinleştir eski kodu çalıştırmaya devam eder ki yeniden başlatmanın tam olarak gerekli olmasının nedeni budur.

Döngünün özeti bundan ibaret: **arayüz ve yerelleştirmeler Geliştirme Modu'nda canlıdır; Kotlin ve manifesto (`gradle.properties`) değişiklikleri yeniden derleme ve bir Pano yeniden başlatması gerektirir.** Bu ayrımı aklınızda tutun, bu eğitimlerin geri kalanı hızlı hissettirecek.

## Çalışmadığında

İlk kez yaşanan sorunların çoğu beş şeye dayanır. Onları sırayla kontrol edin:

1. **Eklentiniz Panel → Eklentiler'de listelenmiyor.** Derlenmiş jar, kurulumun `plugins/` klasöründe **doğrudan** mı duruyor (hâlâ `build/libs/` altında değil)? Yeni jar'lar yalnızca başlangıçta yüklenir — Pano'yu yeniden başlattınız mı? Sunucu günlüğünde bir eklenti yükleme hatası olup olmadığını kontrol edin ve `pluginClass`'ın paket + sınıf adınızla eşleştiğini yeniden kontrol edin.
2. **Bir arayüz veya yerelleştirme düzenlemesi görünmüyor.** `bun run dev` hâlâ çalışıyor mu? Panelde Geliştirme Modu **Açık** mı? Klonunuz kurulumun `plugins/` klasörü altında mı (`plugins/<pluginId>/`)?
3. **Bir Kotlin düzenlemesi etkili olmuyor.** Kotlin sıcak değildir — yeniden derlemeli (`./gradlew build -Pnoui`), jar'ı `plugins/` içine kopyalamalı ve Pano'yu **yeniden başlatmalısınız**. Panelde devre dışı bırak/etkinleştir yeterli değildir.
4. **Yeniden adlandırmadan hemen sonra derleme başarısız oluyor.** Yeniden adlandırma düzenlemelerinizden ikisi uyuşmuyor — hata nedenleri için [Derleyip yükleyin](#eklentinizi-derleyin-ve-yukleyin) kontrol noktasına bakın. `pluginClass`'ın, paket klasörünün ve sınıf adının hepsinin aynı şeyi hecelediğini yeniden kontrol edin.
5. **Geliştirme sunucunuz askıda kalıyor (yalnızca ayrıca bir tema veya panel geliştirme sunucusu çalıştırıyorsanız geçerli).** O geliştirme sunucusunun Vite yapılandırmasına `/plugins` için bir proxy kuralı **eklemeyin**. Arayüz sunucusu o yolu zaten sunuyor; onu geri proxy'lemek, geliştirme sunucusunu askıda bırakan bir istek döngüsü oluşturur.

## Sırada ne var

Artık kendi eklentiniz yüklü ve hangi değişikliklerin sıcak, hangilerinin olmadığını biliyorsunuz. Önerilen yol:

- **[Mimari](/tr/addon/architecture/)** — zihinsel model: Pano JAR'ınızı yüklediğinde ne olur ve her dosya çalışma zamanında nerede sonlanır. Gerçek kod yazmadan önce bunu okuyun.
- **[Backend Geliştirme](/tr/addon/backend/)** — Shoutbox backend'ini oluşturun: bir veritabanı tablosu, bir JSON API'si, bir izin ve bir etkinlik günlüğü.
- **[Arayüz Geliştirme](/tr/addon/frontend/)** — Shoutbox arayüzünü oluşturun: ana sayfaya bir widget yerleştirin, bir panel ayarlar bölümü ve tam bir panel sayfası ekleyin.
- **[Derleme ve Yayınlama](/tr/addon/publishing/)** — eklentinizi bir yayına dönüştürün ve pazar yerine gönderin.
