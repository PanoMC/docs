# Kurulum

Atölyemizi kurma zamanı. Bu sayfanın sonunda Shoutbox, Pano kurulumunuzun içinde gerçek bir klasör, bir jar'a derlenmiş ve **Panel → Eklentiler**'de listelenmiş olacak — el kitabının geri kalanı için hazır, hızlı bir düzenle-ve-yenile döngüsüyle birlikte.

Bu sayfanın tam referansı: [Başlangıç](/tr/addon/getting-started/).

## Adım 0 — Pano'nun çalıştığından emin olun (Geliştirme Modu açık)

Çalışırken bir eklenti, çalışan bir Pano'nun *içinde* yaşar. Bu yüzden her şeyden önce Pano'nuzun **geliştirme makinenizde** kurulu ve çalışır durumda olduğundan emin olun. Değilse, önce [Kurulum](/tr/platform/installation/) sayfasını izleyin ve buraya geri dönün.

Bu el kitabı için Pano'yu **8088** portunu dinleyen **geliştirme modunda** başlattığınızı varsayacağız:

```sh
# in your Pano folder
java -jar Pano-v1.0.0.jar --dev
```

(`--dev` olmadan varsayılan port **80**'dir.) Bunu kendi terminalinde çalışır durumda bırakın.

Şimdi **Geliştirme Modu'nu** açın — bu, arayüzünüzün ve yerel ayar dosyalarınızın önbelleğe alınmak yerine diskten canlı olarak yeniden yüklenmesini sağlayan ayardır:

**Panel → Platform Ayarları → Geliştirme Modu → Açık**, sonra kaydedin.

::: tip Kontrol noktası
Pano sitenizi `http://localhost:8088` adresinde açabiliyorsunuz, **/panel**'e giriş yapabiliyorsunuz ve Geliştirme Modu **Açık** olarak görünüyor.
:::

## Adım 1 — şablonu `plugins/` içine klonlayın

Pano, backend ve arayüzü zaten birbirine bağlanmış hazır bir şablonla, [`pano-boilerplate-plugin`](https://github.com/PanoMC/pano-boilerplate-plugin), gelir. Onu **Pano kurulumunuzun `plugins/` klasörüne** klonlayın — Pano jar'ını ve yapılandırmasını tutan aynı klasör. Bu önemlidir: bir eklenti, yalnızca çalışan kurulumun `plugins/` klasörünün içinde yaşadığında arayüzünü sıcak yeniden yükler.

Son argüman (`pano-plugin-shoutbox`) klasör adıdır — ve sonraki adımda ayarladığınız `pluginId` ile **tam olarak** eşleşmelidir, çünkü Pano klasörü kimlikle eşler.

```sh
cd <your-pano-instance>/plugins
git clone https://github.com/PanoMC/pano-boilerplate-plugin.git pano-plugin-shoutbox
cd pano-plugin-shoutbox
```

## Adım 2 — şablonu Shoutbox'a yeniden adlandırın

Şablon kendisine birkaç yerde `pano-boilerplate-plugin` der. Her birini değiştirin. 1–3. adımlar hepsi **aynı sınıfı** üç yerde tanımlar, dolayısıyla birbirleriyle tutarlı olmalıdırlar.

| # | Nerede | Değişiklik |
|---|---|---|
| 1 | `gradle.properties` | `pluginId` → `pano-plugin-shoutbox`; `pluginName` → `Shoutbox`; `pluginClass` → `com.panomc.plugins.shoutbox.ShoutboxPlugin`; ayrıca `pluginDescription`, `pluginDeveloper`, `pluginLicense`, `pluginSourceUrl`, `organization` → kendi değerleriniz. |
| 2 | Kotlin paket klasörü | `src/main/kotlin/com/panomc/plugins/boilerplate` → `.../shoutbox` olarak yeniden adlandırın, sonra `.kt` dosyasının içindeki `package` satırını `package com.panomc.plugins.shoutbox` olarak ayarlayın. |
| 3 | Kotlin ana sınıfı | `BoilerplatePlugin` sınıfını → `ShoutboxPlugin` olarak yeniden adlandırın. 1. adımdaki `pluginClass`'ın sonuyla eşleşmelidir. |
| 4 | `src/main.js` | `pluginId` sabiti `'pano-boilerplate-plugin'` → `'pano-plugin-shoutbox'`; sınıf adı `PanoExamplePlugin` → `ShoutboxUiPlugin`. |
| 5 | `package.json` | `"name"` → `pano-plugin-shoutbox`. |
| 6 | `settings.gradle.kts` | `rootProject.name = "pano-plugin-shoutbox"` satırını ekleyin. |

::: tip Sınıf yeniden adlandırmasını IntelliJ yapsın
`pluginClass` **tam nitelikli bir addır**: paket (eğik çizgileri noktaya çevrilmiş klasör yolu) artı sınıf adı. IntelliJ'de sınıf adına sağ tıklayın → **Refactor → Rename** ve dosyayı yeniden adlandırıp her referansı sizin için günceller. İki düzenleme birbiriyle uyuşmazsa gösterilen tam hata mesajlarıyla birlikte tam yeniden adlandırma anlatımı [Başlangıç](/tr/addon/getting-started/#sablonu-kendi-eklentinize-gore-yeniden-adlandırın) sayfasında.
:::

İki şey daha **içeriktir, bağlantı değil** — şimdi ya da sonradan istediğiniz zaman değiştirin:

- `src/main/resources/locales/en-US.json` — arayüz metniniz (şablon tek bir anahtarla gelir, `hello-world`).
- `src/main/resources/logo.png` — kendi logonuzla değiştirin.

## Adım 3 — ilk derleme

Eklenti klasörünüzden, arayüz bağımlılıklarını kurun ve bir kez derleyin:

```sh
bun install
./gradlew build
```

::: warning İlk derleme yavaştır — iptal etmeyin
İlk derleme Gradle'ı, iç Java araç zincirini ve tüm bağımlılıkları indirir. Donmuş gibi görünerek birkaç dakika boyunca öylece durabilir. Bu normaldir.
:::

`BUILD SUCCESSFUL` ile biter ve `build/libs/pano-plugin-shoutbox-local-build.jar` konumunda bir jar üretir.

::: tip `bun install` "Resolving…" adımında takılmış gibi görünürse
`Ctrl + C` ile durdurun ve bunun yerine `bun install --backend=copyfile` çalıştırın.
:::

## Adım 4 — jar'ı bir üst seviyeye kopyalayın ve yeniden başlatın

Pano yalnızca kurulumun `plugins/` klasöründe **doğrudan** duran jar'ları keşfeder — klonunuzun içindeki iç içe `build/libs/` içindekileri değil. Bu yüzden yeni derlenen jar'ı bir seviye yukarı kopyalayın:

```sh
cp build/libs/pano-plugin-shoutbox-local-build.jar ..   # into the instance's plugins/ folder
```

Şimdi **Pano'yu yeniden başlatın**: çalıştığı terminalde `Ctrl + C`'ye basın, sonra tam olarak önceki gibi yeniden başlatın. Yeni jar'lar yalnızca önyükleme sırasında alınır.

::: tip Klon ve jar iki ayrı şeydir
Eklentinizin artık iki kopyası `plugins/` içinde yan yana yaşıyor:

```
plugins/
├── pano-plugin-shoutbox/                    ← your clone (source: UI + locales)
└── pano-plugin-shoutbox-local-build.jar     ← the built jar Pano loads
```

**Jar**, Pano'nun çalıştırdığı backend'dir; **klasör** ise Geliştirme Modu açıkken canlı arayüz ve yerel ayar yeniden yüklemelerini besler. İkisi mutlu bir şekilde bir arada bulunur.
:::

## Adım 5 — panelde görün

**Panel → Eklentiler**'i açın. **Shoutbox** listelenmiş olmalı. Bu, "yüklendi mi?" kontrolüdür.

::: warning Eklenti listelenmedi mi?
Her zamanki üç neden: jar `plugins/` içinde **doğrudan** durmuyor (hâlâ `build/libs/` içinde); Pano'yu yeniden başlatmadınız; veya `pluginClass`, paket + sınıf adınızla eşleşmiyor. Bir eklenti-yükleme hatası için sunucu günlüğünü kontrol edin.
:::

**Artık görmelisiniz** ki Shoutbox eklenti listesinde. Backend yarısı doğru yüklendi — üzerinde çalışmaya hazırsınız.

## Adım 6 — geliştirme döngüsü

Geliştirirken neredeyse hiçbir zaman tam `./gradlew build`'i çalıştırmazsınız — arayüzü her seferinde yeniden derler, ki bu yavaştır. Bunun yerine, her yarı için, her ikisi de eklenti klasörünüzden olmak üzere, bir komut kullanın.

**Backend (Kotlin) işi** için, arayüzü atlayan hızlı bir yalnızca-backend jar'ı derleyin (`-Pnoui`, "arayüz derlemesini atla" demektir):

```sh
./gradlew build -Pnoui
```

**Arayüz (Svelte) işi** için, izleyiciyi başlatın ve çalışır durumda bırakın — her kayıtta arayüzü yeniden derler:

```sh
bun run dev
```

İşte her tür değişikliğin tam olarak neye ihtiyaç duyduğu:

| Değiştirdiğiniz | Görmek için |
|---|---|
| Svelte arayüzü (`src/main.js`, `src/panel/**`, `src/theme/**`) | `bun run dev` çalışıyor + tarayıcı yenilemesi (F5) |
| `locales/*.json` | Geliştirme Modu açıkken, tarayıcı yenilemesi (F5) |
| Kotlin kodu | `./gradlew build -Pnoui`, jar'ı `plugins/` içine kopyalayın, sonra **Pano'yu yeniden başlatın** |
| `gradle.properties`, `config.conf` | Tam `./gradlew build`, jar'ı `plugins/` içine kopyalayın, sonra yeniden başlatın |

::: warning Kotlin değişiklikleri yeniden derleme *ve* yeniden başlatma gerektirir
Kotlin **sıcak değildir**. Eklentiyi panelde devre dışı bırakıp yeniden etkinleştirmek yeni kodu **almaz** — tam bir yeniden başlatma yeni jar'ı yükleyene kadar sunucu eski kodu bellekte tutar. Arayüz ve yerel ayarlar Geliştirme Modu altında sıcak *iken*, Kotlin asla değildir. Bu ayrımı aklınızda tutun; el kitabının geri kalanı hızlı hissettirecek.
:::

Shoutbox canlı ve yüklü, ve hangi değişikliklerin sıcak, hangilerinin olmadığını biliyorsunuz. Şimdi ona bir hafıza ve bir API verelim.

**Sıradaki: [Backend →](/tr/handbook/addon/backend/)**
