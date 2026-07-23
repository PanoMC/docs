# Yayına Çıkar

Ember sıcak görünüyor, ana sayfası yeniden şekillendirildi ve üç dil konuşuyor. Onu gerçek, kurulabilir bir temaya dönüştürme — ve dünyanın önüne çıkarma zamanı. Bu, bitiş çizgisi.

Derinlik için referans sayfaları: [Derleme ve Paketleme](/tr/theme/packaging/) ve [Yayınlama ve Premium](/tr/theme/publishing/).

## Adım 1 — manifest'i cilalayın

Temanın kökünde `manifest.json` bulunur — Pano'ya (ve herkese) Ember'ın *ne olduğunu* söyleyen kart. Yayınlamadan önce onu düzgünce doldurun:

```json
{
  "id": "ember",
  "title": "Ember",
  "description": "A warm, cozy orange theme for survival servers.",
  "version": "1.0.0",
  "author": "YourName",
  "panoVersion": "1.0.0",
  "screenshots": ["screenshots/1.png"],
  "premium": false
}
```

| Alan | Notlar |
|---|---|
| `id` | Ember'ın benzersiz, küçük harfli, tire biçimli tanımlayıcısı: `ember`. **Yayınladıktan sonra asla değiştirmeyin** — yeni bir `id`, bambaşka bir temadır. Asla `vanilla-theme` olamaz. Paket dosyası ona göre adlandırılır: `ember-1.0.0.zip`. |
| `title` | İnsanların gördüğü dostane ad: **Ember**. |
| `description` | Görünüm hakkında bir iki cümle. |
| `version` | Yayın otomasyonu bunu sizin için damgalar — elle yükseltmeyin. |
| `author` | Adınız veya ekibiniz. |
| `panoVersion` | Ember'ın hedeflediği Pano sürümü. |
| `screenshots` | `screenshots/` klasöründeki görsel yolları (aşağıda). |
| `premium` | Ücretsiz için `false`; ücretli için `true` (sondaki isteğe bağlı bölüme bakın). |

### Bir ekran görüntüsü ekleyin

Ekran görüntüleri, insanların bir temayı bir bakışta değerlendirme biçimidir — ve Marketplace **en az bir tane ister**. Görsellerinizi temanın kökündeki bir `screenshots/` klasörüne koyun ve manifest'te listeleyin:

```
ember/
├─ manifest.json
└─ screenshots/
   └─ 1.png
```

İyi bir ilk ekran görüntüsü, Ember'ın ana sayfasının tam sayfa yakalanmış hali — banner'ıyla birlikte. Derleme, `screenshots/` klasörünü otomatik olarak pakete kopyalar, bu yüzden görseller `.zip`'in içinde yayınlanır.

## Adım 2 — derleyin, denetleyin, paketleyin

Üç komut Ember'ı kaynaktan kurulabilir bir dosyaya taşır:

```sh
bun run build      # produces the optimized build/ folder
bun run check      # the safety net — Svelte version, plugin slots, settings, translations, manifest
bun run package    # wraps build/ into ember-1.0.0.zip
```

`check` bir sorun bildirirse düzeltin ve tekrar çalıştırın. Yeşil bir `check`, Ember'ın paketlenmeye güvenli olduğu anlamına gelir.

::: tip Derlemeler yeniden üretilebilir
Aynı kodu iki kez derlemek **bayt bayt aynı** sonucu verir. Bu, premium temalar için çok önemlidir; orada paketin SHA-256 parmak izi lisans kimliğinin *ta kendisidir*.
:::

## Adım 3 — kendi Pano'nuza kurun

Paylaşmadan önce, uçtan uca çalıştığını doğrulamak için Ember'ı kendi Pano'nuza kurun — kullanıcılarınızın izleyeceği tam akış:

1. Pano panelinizi açın ve yönetici olarak giriş yapın.
2. **Görünüm → Temalar** bölümüne gidin.
3. **Kur**'u seçin ve az önce derlediğiniz `ember-1.0.0.zip` dosyasını yükleyin.
4. Onu **etkinleştirin** ve siteyi açın.

**Şimdi görmelisiniz** ki Ember, düzgünce kurulmuş bir tema olarak çalışıyor — hiçbir geliştirme sunucusu devrede değil.

## Adım 4 — GitHub'da yayınlayın

Uygulamada yayınları otomatikleştirirsiniz. Pano, denetimleri çalıştıran, derleyen, deterministik `.zip`'i paketleyen ve sizin için GitHub sürümünü oluşturan **yeniden kullanılabilir bir workflow** sunar. `.github/workflows/release.yml` konumuna küçük bir çağırıcı workflow ekleyin:

```yaml
name: Release

on:
  push:
    branches: [main, dev]

jobs:
  release:
    uses: PanoMC/sdk/.github/workflows/theme-release.yml@dev
    with:
      theme-id: ember
    secrets:
      TOKEN_GITHUB: ${{ secrets.GITHUB_TOKEN }}
```

`GITHUB_TOKEN`, GitHub Actions tarafından otomatik olarak sağlanır — yalnızca iletin. Sürümler **[Conventional Commits](https://www.conventionalcommits.org/)** commit'lerinizden gelir (`feat:`, `fix:`, `chore:`), bu yüzden `version`'ı asla elle yükseltmezsiniz.

## Adım 5 — Marketplace'te yayınlayın

[panomc.com](https://panomc.com) üzerindeki Marketplace, sunucu sahiplerinin temaları doğrudan panellerinden keşfedip kurduğu yerdir.

**Kaynağı (resource) oluşturun:**

1. **panomc.com** adresinde kaydolun (veya giriş yapın).
2. **Create Resource**'u açın, tür olarak **Theme** seçin, bir kategori seçin ve başlık ile açıklamayı doldurun.
3. **En az bir ekran görüntüsü** yükleyin — temalar için gereklidir.
4. Fiyatlandırmayı seçin: **ücretsiz** veya **ücretli**.

Kaynak oluşturulduğunda bir **resource ID** (bir UUID) alır. Sonradan **Profile → Resources** altında bulun.

::: tip İki farklı kimlik
`manifest.json` `id`'niz (`ember`) tema *paketini* tanımlar. Marketplace **resource ID**'si (UUID) *mağaza sayfasını* tanımlar. Bunlar ayrıdır ve yayın otomasyonu UUID'ye ihtiyaç duyar.
:::

**`semantic-release-pano` ile yüklemeleri otomatikleştirin:**

1. panomc.com'da **Profile → Security → API tokens** altında bir **API token** oluşturun ve GitHub deponuza `PANO_TOKEN` adlı bir gizli anahtar (secret) olarak ekleyin (**Settings → Secrets → Actions**).
2. `.releaserc.json` içinde `semantic-release-pano`'yu kaynak kimliğinize yönlendirin:

```json
["semantic-release-pano", {
  "resourceId": "YOUR-RESOURCE-UUID",
  "file": "ember-${version}.zip",
  "panoVersion": "1.0.0",
  "useGitHubLink": true,
  "repositoryUrl": "https://github.com/YourName/ember.git"
}]
```

`useGitHubLink` ile ücretsiz bir tema iki kez yüklenmez — Marketplace, GitHub sürümünüze zaten eklenmiş `.zip`'e yalnızca bağlantı verir (bu yüzden GitHub sürümü önce çalışmalıdır). O olmadan, eklenti dosyayı doğrudan yükler; premium bir tema için istediğiniz budur.

İşte bu — bir `feat:` commit'i push edin ve Ember tek seferde hem GitHub'a **hem de** Marketplace'e yayınlansın.

## İsteğe bağlı — Ember'ı premium yapın

Ember'ı satmak mı istiyorsunuz? `manifest.json` içinde tek bir alanı değiştirin:

```diff
- "premium": false
+ "premium": true
```

Tek kaynak değişikliği budur; koruma sizin için bağlanmıştır. Derleme sırasında, derlemenin lisansı paketinize bağlayabilmesi için bir anahtar sağlarsınız — ya `PANO_LICENSE_SERVER` (yeniden kullanılabilir workflow bunu dal başına ayarlar) ya da bir CI gizli anahtarı olarak saklanan `PANO_LICENSE_PUBLIC_KEY`. `bun run dev` içinde lisans kapısı **kapalıdır**, bu yüzden özgürce geliştirirsiniz.

Sade sözlerle nasıl çalıştığı: bir production derlemesi paketin SHA-256 parmak izini hesaplar ve lisansı ona bağlar. Premium temayı çalıştırmak için, bir sunucunun panelinde bağlı ve Ember'ı satın almış bir panomc.com hesabı olmalıdır — hem kurulumda hem de çalışırken denetlenir. `.zip`'i kurcalayın ya da yeniden paketleyin, parmak izi artık eşleşmez ve Pano onu reddeder.

::: warning Hiçbir koruma mutlak değildir — kendinize karşı dürüst olun
**Hiçbir lisans sistemi kodu %100 korumaz.** Amaç, yetkisiz kullanımı kullanıcıların büyük çoğunluğu için mümkün olduğunca zorlaştırmaktır, imkansız kılmak değil. Her yazılım parçası gibi, son kullanıcıya ulaşan her kod doğası gereği açıktır — yeterince kararlı ve yetenekli biri onu her zaman parçalarına ayırabilir. Bu, yalnızca Pano'nunki için değil, yapılmış her DRM için geçerlidir. Ember'ı bu gerçeği aklınızda tutarak fiyatlandırın ve destekleyin.
:::

::: warning Değişiklikleri yeni yayınlar olarak gönderin
Bir premium lisans, **sürüm + paket** başına verilir. Zaten yayınlanmış bir `.zip`'i düzenlerseniz parmak izi değişir ve lisanslı olmaktan çıkar. Değişiklikleri her zaman yukarıdaki akış üzerinden **yeni bir yayın** olarak gönderin — yayınlanmış bir `.zip`'i asla elle düzenlemeyin.
:::

## Başardınız

Ember boş bir klasörden, temalı, çevrilmiş, yayınlanmış bir temaya dönüştü — kendi Pano'nuza kuruldu ve Marketplace'te canlı. Baştan sona tüm yolculuk budur.

Buradan nereye gidebilirsiniz:

- **[Renkler ve Stiller](/tr/theme/customization/)** — token'lar ve SCSS'te daha derine inin.
- **[Sayfa Tasarımlarını Değiştirme](/tr/theme/views/)** — 26 görünümün daha fazlasını yeniden şekillendirin.
- **[Yerelleştirme](/tr/theme/localization/)** — çeviriler ve yeni diller hakkında daha fazlası.
- **[Yayınlama ve Premium](/tr/theme/publishing/)** — tam yayın ve premium referansı.

İyi temalamalar. 🔥
