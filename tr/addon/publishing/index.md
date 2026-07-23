# Derleme ve Yayınlama

Eklentiniz yerelde çalıştıktan sonra, bir sonraki adım onu bir yayın jar'ına (release jar) dönüştürmek ve sunucu sahiplerinin önüne çıkarmaktır. Bu sayfa, yayın derlemesini, sürümlerin sizin için nasıl belirlendiğini ve panomc.com üzerindeki resmi Pano Pazar Yeri'ne (Marketplace) nasıl yayınlayacağınızı kapsar — ücretsiz olarak ya da (biraz daha bağlantı işiyle) bir premium eklenti olarak.

Eklentinizi henüz derlemediyseniz, [Başlangıç](/tr/addon/getting-started/) ve [Backend Geliştirme](/tr/addon/backend/) ile başlayın.

## Yayın derlemesi

Bir yayın derlemesi, Kotlin backend'inizi derler **ve** Svelte arayüzünü jar'a derleyip gömer. Bu, düz bir:

```bash
./gradlew build
```

komutudur. Çıktı şuraya iner:

```
build/libs/pano-plugin-shoutbox-<version>.jar
```

Yerelde `<version>` her zaman `local-build`'tir (yani dosya `pano-plugin-shoutbox-local-build.jar`'dır). Gerçek sürüm numaraları CI'dan gelir — aşağıdaki [Sürümleme](#surumleme) bölümüne bakın.

::: warning Yayın jar'ları arayüze ihtiyaç duyar
Bir yayın için asla `./gradlew build -Pnoui` kullanmayın. `-Pnoui` bayrağı, Bun/rollup arayüz derlemesini atlar. Hiç `plugin-ui.zip` derlenmemişse, jar herhangi bir arayüz **olmadan** gönderilir ve eklentiniz hiç panel veya tema ekranı olmadan yüklenir. Daha kötüsü, önceki bir tam derleme geride bir `src/main/resources/plugin-ui.zip` bıraktıysa (gitignore'ludur ama çalışma ağacınızda kalır), bir `-Pnoui` derlemesi o **bayat** zip'i jar'a gömer — sessizce güncel olmayan bir arayüz göndererek, gözden kaçırması kolay. Her iki durumda da, yayınlar için her zaman temiz, tam bir `./gradlew build` çalıştırın; `-Pnoui` yalnızca hızlı, yalnızca-backend geliştirme döngüsü içindir (bkz. [Başlangıç](/tr/addon/getting-started/#gelistirme-dongusu)).
:::

Jar tamamen kendi kendine yeter: Kotlin backend, gömülü arayüz paketi, yerelleştirmeler ve `logo.png`'nin hepsi onun içinde yaşar. Gönderilecek başka hiçbir şey yoktur.

## Sürümleme

Her yayının bir sürüm numarası vardır (`1.0.0` gibi), böylece sunucular bir güncellemenin ne zaman mevcut olduğunu bilir.

Sürümü elle yükseltmezsiniz. Sürümler, [Conventional Commits](https://www.conventionalcommits.org/)'i izlemesi gereken commit mesajlarınızdan belirlenir — her commit'in `feat:` (yeni bir özellik), `fix:` (bir hata düzeltmesi) ya da `chore:` (bakım) gibi bir kelimeyle başladığı basit bir biçim. Bu kelimeler hem bir sonraki sürüm numarasını hem de üretilen değişiklik günlüğünü (changelog) yönlendirir. Bir `feat:` minor sürümü, bir `fix:` patch sürümü ve bir `BREAKING CHANGE:` altbilgisi (footer) olan bir `feat:` major sürümü yükseltir.

::: warning Sürümleri elle düzenlemeyin
`gradle.properties`'teki hem `version`'ı hem de `pluginPanoVersion`'ı `local-build`'te bırakın. Yayın zamanında CI, gerçek `version`'ı commit geçmişinizden (`-Pversion` aracılığıyla) enjekte eder — onu elle yükseltmek ya da etiketi düzenlemek otomasyonu bozar. CI, `pluginPanoVersion`'ı **enjekte etmez**; manifestonun `pano-version` özelliği `local-build` kalır. Pazar Yeri'nde *duyurulan* Pano sürümü ayrı bir değerdir ve `.releaserc.json` (aşağıda) içindeki `panoVersion` seçeneğiyle ayarlanır. Sürümü commit mesajlarınızın yönlendirmesine izin verin. Ayrıntılar için [Manifesto Yapılandırması](/tr/addon/manifest/) sayfasına bakın.
:::

## Yayın kanalları

Boilerplate, hangi dala push yaptığınıza göre belirlenen iki yayın kanalı için ayarlanmıştır:

| Dal | Kanal | Sürüm şuna benzer |
|---|---|---|
| `dev` | Ön-yayın (Prerelease) | `1.1.0-dev.3` |
| `main` | Kararlı (Stable) | `1.1.0` |

Her iki dala push yapmak, `pano-boilerplate-plugin` ile birlikte `.github/workflows/release.yml`'de gelen GitHub Actions iş akışını tetikler. O iş akışı, commit'lerinizden bir sonraki sürümü hesaplar, `./gradlew build`'i çalıştırır (gerçek bir arayüz derlemesi — `-Pnoui` değil) ve ardından GitHub yayınını oluşturan semantic-release'i çalıştırır. Boilerplate iş akışı **çıplak** bir `semantic-release` çalıştırır, bu yüzden Pazar Yeri'ne de yayınlamak için iş akışına, Pano yayınlama plugin'ini kuran bir adım eklemeniz gerekir — sonraki bölümdeki uyarıya bakın. O bir düzenlemenin ve beklediği secret'ların ötesinde, normal bir eklenti için iş akışına dokunmazsınız.

O iş akışının en üstündeki tetikleyici basitçe şudur:

```yaml
on:
  push:
    branches: ['dev', 'main']
```

## `.releaserc.json` adım adım

`.releaserc.json`, semantic-release'in yapılandırıldığı yerdir. Boilerplate, GitHub yayınını jar ekli olarak oluşturan bir tane gönderir. Pazar Yeri'ne de yayınlamak için, `@PanoMC/semantic-release-pano` plugin'ini ekleyin. Shoutbox için tam dosya aşağıda — gerçek `pano-plugin-faq` yayın yapılandırmasından bire bir uyarlanmıştır:

```json
{
  "branches": [
    { "name": "dev", "prerelease": true },
    "main"
  ],
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
          "panoUrl": "https://api-dev.panomc.com",
          "tokenVar": "PANO_TOKEN",
          "branches": ["dev"]
        },
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

::: warning Pano plugin'i iş akışında kurulmalıdır
`@PanoMC/semantic-release-pano`, npm'ye yayınlanmamıştır ve bir boilerplate bağımlılığı değildir, bu yüzden onu `.releaserc.json`'da listelemek tek başına yeterli değildir — semantic-release, *"Cannot find module @PanoMC/semantic-release-pano"* diyerek başarısız olur. `.github/workflows/release.yml`'deki **her iki** işe de (sürüm kuru-çalıştırma işi ve yayın işi), onların `semantic-release` adımından önce bir kurulum adımı ekleyin:

```yaml
- run: npm install -D git+https://github.com/PanoMC/semantic-release-pano.git
```

Bu, Pazar Yeri'ne yayınlayan bir eklentinin ihtiyaç duyduğu tek iş akışı düzenlemesidir; bu yapılandırmanın kopyalandığı `pano-plugin-faq` iş akışında tam olarak bu adım bulunur.
:::

Alan alan:

| Alan | Ne yapar |
|---|---|
| `@semantic-release/github` `assets` | `build/libs/*.jar`'ınızı (ve `LICENSE`'ı) GitHub yayınına ekler. Bu adım, `useGitHubLink`'in ona ihtiyaç duyduğu anda asset'in var olması için Pano plugin'inden **önce** çalışır. |
| `file` | Derlenen jar'ın yolu. `${version}`, yayın sürümüyle değiştirilir. |
| `panoVersion` | Bu yayının hedeflediği Pano platform sürümü. |
| `useGitHubLink` | `true` = jar'ı yeniden yükleme; bunun yerine Pazar Yeri'ni GitHub yayınına zaten ekli olan jar'a (artı SHA-256 hash'ine) yönlendir. Ücretsiz eklentiler için idealdir — yinelenen yükleme yok. Premium eklentiler ise jar'ı doğrudan yükler. |
| `configs[]` | Kanal başına bir girdi. Her biri, `branches` ile kapsamlandırılmış olarak **hangi Pazar Yeri'ne** ve **hangi token ile** yayınlanacağını söyler. |
| `resourceId` | Pazar Yeri kaynağınız — eklentiler için bu, `pluginId`'nizdir (aşağıya bakın). |
| `panoUrl` | Pazar Yeri API'si: `dev` kanalı için `https://api-dev.panomc.com`, `main` için `https://api.panomc.com`. |
| `tokenVar` | API token'ını tutan GitHub secret'ının adı: dev için `PANO_TOKEN`, üretim için `PANO_PROD_TOKEN`. |
| `branches` | Bir yapılandırmayı tek bir kanala kısıtlar, böylece bir `dev` push'u asla üretim Pazar Yeri'ne dokunmaz (ve eksik bir `PANO_PROD_TOKEN` bir `dev` derlemesini başarısız etmez). |

::: tip Neden iki `configs`
Dala göre bölmek, bir yayını `dev` dalınızdan `api-dev.panomc.com`'da prova edip ardından tam olarak aynı kodu `main`'den `api.panomc.com`'a gönderebilmeniz anlamına gelir — her biri kendi kaynak durumu ve token'ıyla. Yalnızca bir Pazar Yeri'ne yayınlıyorsanız, yalnızca `main` yapılandırmasını tutun.
:::

## Resmi Pano Pazar Yeri'nde yayınlama

[panomc.com](https://panomc.com) üzerindeki Pazar Yeri, sunucu sahiplerinin eklentileri doğrudan panellerinden keşfedip kurduğu yerdir. Orada yayınlamak üç adım gerektirir: kaynağı oluşturun, bir API token'ı oluşturun, sonra otomasyonun sürümleri yüklemesine izin verin.

### 1. Kaynağı oluşturun

1. **panomc.com**'da kaydolun (ya da giriş yapın).
2. **Kaynak Oluştur**'u (Create Resource) açın ve **Plugin** türünü seçin.
3. Bir kategori seçin, başlığı ve açıklamayı doldurun.
4. Fiyatlandırmayı seçin: **ücretsiz** ya da satmayı planlıyorsanız **ücretli**.

::: tip Kaynak kimliği, plugin kimliğinizdir
Temalar, Pazar Yeri kaynak kimliği için paket `id`'lerinden ayrı, rastgele bir UUID kullanır. **Eklentiler bunu yapmaz.** Eklentinizin Pazar Yeri `resourceId`'si, **tam olarak `pluginId`'niz** olacak şekilde ayarlanır — Shoutbox için bu `pano-plugin-shoutbox`'tır. Yukarıdaki `configs[]`'in bir UUID değil `"resourceId": "pano-plugin-shoutbox"` kullanmasının nedeni budur. `pluginId`, her yerde kullanılan tek kimliktir: veri-dizini adı, izin-düğümü öneki, arayüz URL segmenti ve Pazar Yeri kaynağı. Bkz. [Manifesto Yapılandırması](/tr/addon/manifest/).
:::

### 2. Bir API token'ı oluşturun

1. panomc.com'da **Profil → Ayarlar → API Tokenları**'nı açın ve **Oluştur**'a tıklayın.
2. Token'ı hemen kopyalayın — o, oluşturmanın hemen ardından çıkan modalda yalnızca **bir kez** gösterilir.
3. GitHub deponuzda, **Settings → Secrets and variables → Actions**'a gidin ve token'ı, `tokenVar`'ınızla eşleşecek şekilde adlandırılmış bir depo secret'ı olarak ekleyin:
   - `dev` kanalı için `PANO_TOKEN`,
   - `main` kanalı için `PANO_PROD_TOKEN`.

::: warning Bir token'ı asla commit'lemeyin
API token'ı, kaynağınıza yayınlama hakları verir. Onu yalnızca bir GitHub secret'ı (ya da yerel bir ortam değişkeni) olarak saklayın. Onu asla `.releaserc.json`'a, bir commit'e ya da depodaki herhangi bir dosyaya koymayın.
:::

GitHub yayınının kendisi, boilerplate iş akışının birkaç yerde (ilk sürüm kuru-çalıştırması dahil) okuduğu (`secrets.TOKEN_GITHUB` olarak) ayrı bir token, `TOKEN_GITHUB` kullanır. GitHub'ın yerleşik `GITHUB_TOKEN`'ı o ad altında **açığa çıkmaz**, bu yüzden bir Kişisel Erişim Token'ı (Personal Access Token) oluşturup onu `TOKEN_GITHUB` adlı bir depo secret'ı olarak saklamanız gerekir — aksi halde her yayın çalışması ilk semantic-release adımında başarısız olur. (Alternatif olarak, iş akışını bunun yerine `secrets.GITHUB_TOKEN`'ı okuyacak şekilde düzenleyin.)

### 3. Push yapın ve yayınlanmasını izleyin

Kaynak oluşturulmuş, token bir secret olarak eklenmiş ve `.releaserc.json` yerinde olduğunda, yayınlamak yalnızca şudur:

```bash
git push origin dev    # or main
```

İş akışı çalışır, semantic-release sürümü hesaplar, GitHub yayını jar ekli olarak oluşturulur ve `@PanoMC/semantic-release-pano` o sürümü Pazar Yeri'nde kaydeder. Sunucu sahipleri güncellemeyi panellerinde **Panel → Eklentiler** altında görecektir.

## Manuel dağıtım

Pazar Yeri'ni kullanmak zorunda değilsiniz. Yayın jar'ı tamamen kendi kendine yettiği için, herkes onu doğrudan kurabilir:

- Jar'ı bir GitHub yayınına ekleyip bağlantıyı paylaşın ya da
- `.jar`'ı bir sunucu sahibine, **Panel → Eklentiler → Yükle** aracılığıyla yüklemesi için verin.

Kullanıcının gördüğü fark: Pazar Yeri'nden indirilen eklentiler **doğrulanmış (verified)** olarak işaretlenir, elle yüklenen jar'lar ise değildir. Herkese açık bir eklenti için Pazar Yeri kesinlikle tercih edilir — size güncelleme teslimatını, bir mağaza sayfasını ve doğrulanmış rozetini ücretsiz verir.

## Premium listeler

Eklentinizi satmak, aynı yayın akışıyla, artı derleme-zamanı bir lisans anahtarı ve kodunuza gömülü bir çalışma-zamanı lisans kontrolüyle işler. Derleme, [Manifesto Yapılandırması](/tr/addon/manifest/) altında açıklanan ek lisans bayraklarını kabul eder (`-PlicenseServer`, `-PpanoLicensePublicKey` ve `PANO_LICENSE_PUBLIC_KEY` ortam değişkeni); tam bir premium adım-adım anlatımı henüz bu eğitimlerin parçası değildir.

## Sırada ne var

- **[Manifesto Yapılandırması](/tr/addon/manifest/)** — CI'ın yayın zamanında enjekte ettiği `gradle.properties` alanları.
- **[Çeviriler](/tr/addon/localization/)** — yayınlamadan önce eklentinizi birden fazla dilde gönderin.
