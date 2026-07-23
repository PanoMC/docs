# Yayına Çıkar

Shoutbox makinenizde çalışıyor: bir tablo, bir API, bir widget, bir panel sayfası ve çeviriler. Onu gerçek, kurulabilir bir eklentiye dönüştürme — ve dünyanın önüne çıkarma zamanı. Bu, bitiş çizgisi.

Derinlik için referans sayfaları: [Derleme ve Yayınlama](/tr/addon/publishing/) ve [Premium Eklentiler ve Lisanslama](/tr/addon/premium/).

## Tüm iş, sırayla

Bunun çoğu **tek seferlik bir kurulumdur**. Ondan sonra, gelecekteki her yayın yalnızca son adımdır — commit'leyip push'lamak.

1. **Bir jar üretildiğini doğrulamak için yerelde bir kez derleyin.**
2. panomc.com'da **Marketplace kaynağınızı oluşturun**.
3. **İki GitHub secret'ı ekleyin** — `PANO_PROD_TOKEN` ve `TOKEN_GITHUB`.
4. Pano yayınlama eklentisiyle **`.releaserc.json` ekleyin**.
5. Yayın workflow'una **bir kurulum adımı ekleyin**.
6. **Bir conventional-commit mesajıyla commit'leyip `main`'e push'layın.**

## Adım 1 — yayın derlemesi

Bir yayın derlemesi, Kotlin backend'inizi derler **ve** Svelte arayüzünü derleyip tek bir kendi kendine yeten jar'a gömer. Bu, düz bir:

```sh
./gradlew build
```

`BUILD SUCCESSFUL` ve `build/libs/pano-plugin-shoutbox-local-build.jar` konumunda bir jar görmelisiniz. Yerelde sürüm her zaman `local-build`'tir; gerçek sürüm numaraları CI'dan gelir.

::: warning Yayın jar'ları arayüze ihtiyaç duyar — asla `-Pnoui` kullanmayın
`-Pnoui`, arayüz derlemesini atlar. Bir yayın için bu, bozuk bir eklenti gönderir: ya **hiç arayüz yok** (onu hiç derlemediyseniz) ya da **bayat bir arayüz** (eski bir derleme geride bir `plugin-ui.zip` bıraktıysa). `-Pnoui` yalnızca hızlı yalnızca-backend geliştirme döngüsü içindir. Hiçbir eski arayüzün yeniden kullanılmadığından emin olmak için `./gradlew clean build` çalıştırın.
:::

## Adım 2 — sürümleme otomatiktir

Her yayının `1.0.0` gibi bir sürümü vardır. Onu elle yükseltmezsiniz. Sürümler, **[Conventional Commits](https://www.conventionalcommits.org/)** commit'lerinizden gelir — her commit `feat:` (bir özellik), `fix:` (bir hata düzeltmesi) veya `chore:` (bakım) gibi bir sözcükle başlar:

- `fix:` → **yamayı** (patch) yükseltir (`1.0.0` → `1.0.1`)
- `feat:` → **minör'ü** yükseltir (`1.0.0` → `1.1.0`)
- bir `BREAKING CHANGE:` altbilgisiyle `feat:` → **majör'ü** yükseltir (`1.0.0` → `2.0.0`)

`gradle.properties`'deki `version`'ı `local-build`'te bırakın — CI, gerçek numarayı commit geçmişinizden enjekte eder. Onu elle düzenlemek otomasyonu bozar.

::: tip Dal tarafından seçilen iki yayın kanalı
Boilerplate, `dev`'e push'ladığınızda bir **ön yayın** (`1.1.0-dev.3`), `main`'e push'ladığınızda ise bir **kararlı** yayın (`1.1.0`) yayınlar. Sunucu sahipleri yalnızca kararlıyı görür. İlk eklentinizi mi yayınlıyorsunuz? Basit tutun ve yalnızca `main`'e yayınlayın.
:::

## Adım 3 — Marketplace kaynağını oluşturun

[panomc.com](https://panomc.com) üzerindeki Marketplace, sunucu sahiplerinin eklentileri panellerinden keşfedip kurduğu yerdir.

1. **panomc.com**'da kaydolun (veya giriş yapın).
2. **Create Resource**'u açın ve türü **Plugin** seçin.
3. Bir kategori seçin, başlık ve açıklamayı doldurun.
4. Fiyatlandırmayı seçin: **ücretsiz** veya **ücretli** (ücretli, sona premium adımını ekler).

Artık eklentinizin sayfasını **boş bir sürüm listesiyle** görmelisiniz — push'ladığınızda otomasyon onu doldurur.

::: tip Kaynak kimliğiniz *eklenti kimliğinizdir*
Eklentiler için, Marketplace `resourceId`'si **tam olarak `pluginId`'nizdir** — `pano-plugin-shoutbox`. (Temalar rastgele bir UUID kullanır; eklentiler kullanmaz.) Aşağıdaki yapılandırmanın `"resourceId": "pano-plugin-shoutbox"` kullanmasının nedeni budur.
:::

## Adım 4 — gerekli iki secret'ı ekleyin

GitHub deponuzda, **Settings → Secrets and variables → Actions**'a gidin ve ekleyin:

- **`PANO_PROD_TOKEN`** — panomc.com'dan bir API token'ı (**Profile → Settings → API Tokens → Create**). Yalnızca bir kez gösterilir; onu hemen kopyalayın.
- **`TOKEN_GITHUB`** — GitHub **Settings → Developer settings** altında oluşturduğunuz bir **Personal Access Token** (klasik, `repo` kapsamıyla). Boilerplate workflow'u bunu, sürüm dry-run'ı dahil birkaç yerde okur.

::: warning `TOKEN_GITHUB`'ı kaçırın ve her yayın en ilk adımda başarısız olur
GitHub'ın yerleşik `GITHUB_TOKEN`'ı o adla **açığa çıkarılmaz**, dolayısıyla PAT'ı kendiniz oluşturmalısınız. Ve API token'ını **asla commit'lemeyin** — onu yalnızca bir GitHub secret'ı olarak saklayın.
:::

## Adım 5 — `.releaserc.json`'ı yapılandırın

`.releaserc.json`, yayın aracının (semantic-release) yapılandırıldığı yerdir. Boilerplate, GitHub yayınını oluşturan bir tane getirir; Marketplace'e *de* yayınlamak için `@PanoMC/semantic-release-pano` eklentisini ekleyin. İşte Shoutbox için eksiksiz dosya:

```json
{
  "branches": [{ "name": "dev", "prerelease": true }, "main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    ["@semantic-release/github", {
      "assets": [
        { "path": "build/libs/*.jar", "label": false },
        { "path": "LICENSE", "label": false }
      ]
    }],
    ["@PanoMC/semantic-release-pano", {
      "file": "build/libs/pano-plugin-shoutbox-${version}.jar",
      "panoVersion": "1.0.0",
      "useGitHubLink": true,
      "repositoryUrl": "https://github.com/YourName/pano-plugin-shoutbox.git",
      "configs": [
        {
          "resourceId": "pano-plugin-shoutbox",
          "panoUrl": "https://api.panomc.com",
          "tokenVar": "PANO_PROD_TOKEN",
          "branches": ["main"]
        }
      ]
    }]
  ],
  "repositoryUrl": "https://github.com/YourName/pano-plugin-shoutbox.git"
}
```

::: tip Yer tutucuları değiştirin
`YourName`'i (her iki `repositoryUrl` satırında) GitHub kullanıcı adınızla değiştirin ve `pano-plugin-shoutbox`'ın (`file` yolu ve `resourceId`) kendi `pluginId`'niz olduğundan emin olun. Eklentileri **bu sırada** tutun — GitHub eklentisi Pano eklentisinden önce çalışmalıdır ki `useGitHubLink` jar'a ihtiyaç duyduğunda jar zaten ekli olsun. `useGitHubLink: true`, Marketplace'i yeniden yüklemek yerine GitHub yayınınızda zaten bulunan jar'a yönlendirir — ücretsiz bir eklenti için idealdir.
:::

Alan alan tam anlatım ve isteğe bağlı `dev` sandbox kanalını nasıl ekleyeceğiniz [Derleme ve Yayınlama](/tr/addon/publishing/#releaserc-json-adım-adım) sayfasında.

## Adım 6 — Pano eklentisini workflow'da kurun

`@PanoMC/semantic-release-pano` npm'de değildir, dolayısıyla onu `.releaserc.json`'da listelemek yeterli değildir — siz onu kurana kadar semantic-release *"Cannot find module @PanoMC/semantic-release-pano"* ile başarısız olur.

Bu tek satırı `.github/workflows/release.yml`'deki **her iki** işe (sürüm dry-run işi ve yayın işi), her işin semantic-release adımından **önce** ekleyin:

```yaml
- run: npm install -D git+https://github.com/PanoMC/semantic-release-pano.git
```

::: warning Her iki iş de, yoksa kaçırdığınızda başarısız olur
Onu yalnızca bir işe eklerseniz, çalıştırma diğerinde aynı "Cannot find module" hatasıyla başarısız olur. Bu, gerekli tek workflow düzenlemesidir — boilerplate workflow'undaki diğer her şeye dokunmazsınız.
:::

## Adım 7 — push'layın ve yayınlanmasını izleyin

Kaynak oluşturulmuş, her iki secret eklenmiş ve `.releaserc.json` artı workflow adımı yerinde olduğunda, yayınlamak yalnızca bir conventional-commit ve bir push'tur:

```sh
git push origin main
```

Deponuzun **Actions** sekmesini açın. **Pano Plugin Build** adlı bir çalıştırma bir dakika içinde belirir ve bitmesi birkaç dakika sürer.

- **Yeşil onay** = yayınlandı. Kaynağınızı panomc.com'da açın — yeni sürüm listelenmiş ve sunucu sahipleri güncellemeyi **Panel → Eklentiler** altında görüyor.
- **Kırmızı X** = başarısız olan adıma tıklayın. En yaygın iki hata, "Cannot find module" hatası (bir işte kurulum adımını kaçırdınız) ve ilk adımda bir kimlik doğrulama hatasıdır (eksik veya yanlış bir `TOKEN_GITHUB`).

::: tip Elle de dağıtabilirsiniz
Jar tamamen kendi kendine yettiği için, onu bir GitHub yayınına ekleyebilir veya bir sunucu sahibine **Panel → Eklentiler → Yükle** üzerinden yüklemesi için verebilirsiniz. Marketplace eklentileri bir **doğrulanmış** rozeti ve otomatik güncelleme teslimi alır; elle verilen jar'lar almaz — dolayısıyla herkese açık bir eklenti için Marketplace kesinlikle tercih edilir.
:::

## İsteğe bağlı — Shoutbox'ı premium bir eklenti olarak satın

Onun için ücret almak mı istiyorsunuz? Yayın akışı aynıdır, artı iki küçük parça: jar'ı **bir lisans anahtarıyla** derleyin ve boilerplate'in çalışma zamanı lisans kontrolünü koruyun. Kısaca:

- panomc.com'un herkese açık doğrulama anahtarının jar'a gömülmesi için `./gradlew build -PlicenseServer=prod` ile derleyin (veya CI'da `PANO_LICENSE_SERVER` ayarlayın).
- `onStart()`'ın en üstünde `licenseClient.requireValidLicense()`'ı koruyun — taze bir boilerplate onu zaten içerir ve ücretsiz derlemelerde bir no-op'tur.
- Kaynağı **ücretli** fiyatlandırın ve Marketplace'in ana jar'ı tutup SHA-256'sını kaydetmesi için `useGitHubLink: false` ayarlayın.

Tam anlatım — anahtarı gömme, çalışma zamanı kontrolü ve onu kendi hesabınıza karşı test etme — [Premium Eklentiler ve Lisanslama](/tr/addon/premium/) sayfasında.

::: warning Hiçbir lisans sistemi mutlak değildir
Hiçbir DRM kodu %100 korumaz — son kullanıcıya ulaşan her kod, yeterince kararlı biri tarafından parçalarına ayrılabilir. Amaç, yetkisiz kullanımı büyük çoğunluk için zorlaştırmaktır, imkansız kılmak değil. Eklentinizi bu gerçeği aklınızda tutarak fiyatlandırın ve destekleyin.
:::

## Başardınız

Shoutbox, klonlanmış bir şablondan çalışan bir eklentiye dönüştü — bir veritabanı tablosu, bir JSON API, bir izin, bir ana sayfa widget'ı, bir panel sayfası, çeviriler — kendi Pano'nuza kuruldu ve Marketplace'te yayınlandı. Baştan sona tüm yolculuk budur.

Referans dokümanlarında daha derine nereden inebilirsiniz:

- **[Backend API Referansı](/tr/addon/backend-reference/)** — her backend genişletme noktası ada göre.
- **[Arayüz API Referansı](/tr/addon/api-reference/)** — her kanca, görünüm yuvası ve SDK dışa aktarımı.
- **[Çeviriler](/tr/addon/localization/)** ve **[Premium](/tr/addon/premium/)** — son iki sayfanın tam sürümleri.

İyi eklentilemeler. 🚀

**Sıradaki: [Eklenti referansı: Başlangıç →](/tr/addon/getting-started/)**
