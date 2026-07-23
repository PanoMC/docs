# Yayınlama ve Premium

Temanız derlenip paketlendikten sonra onu dünyayla paylaşabilirsiniz — ücretsiz olarak ya da premium (ücretli) bir tema olarak. Bu sayfa, temayı nasıl yayınlayacağınızı, tüm süreci nasıl otomatikleştireceğinizi ve premium korumanın nasıl çalıştığını anlatır.

Temanızı henüz derlemediyseniz, [Derleme ve Paketleme](/tr/theme/packaging/) ile başlayın.

## Sürümleme

Temanızın her yayını bir sürüm numarasına sahiptir (örneğin `1.0.0`). Bu, sunucuların bir güncelleme olduğunu bilmesini sağlar.

Aşağıdaki otomasyonu kullanırsanız sürümü elle yükseltmezsiniz. Bunun yerine sürümler, [Conventional Commits](https://www.conventionalcommits.org/) biçimini izlemesi gereken commit mesajlarınızdan belirlenir — her commit'in `feat:` (yeni bir özellik), `fix:` (bir hata düzeltmesi) veya `chore:` (bakım) gibi bir kelimeyle başladığı basit bir biçim. Bu kelimeler hem sürüm numarasını hem de oluşturulan değişiklik günlüğünü yönlendirir.

## Dağıtım

Pano temaları şu yollarla dağıtılır:

- **GitHub Releases** — deponuzda etiketlenmiş bir sürüme eklenen, indirilebilir bir `.zip`.
- **Resmi Pano Marketplace** — sunucu sahiplerinin temalara göz atıp kurduğu yer.

GitHub'da elle yayınlamak için:

1. Commit'inizi etiketleyin.
2. Yeni bir Release oluşturun.
3. `package` adımından çıkan `.zip` dosyasını yükleyin.

Uygulamada, bunu neredeyse her zaman aşağıdaki otomasyona bırakırsınız.

## GitHub Actions otomasyonu

Pano, tüm yayın işini sizin yerinize yapan **yeniden kullanılabilir bir workflow** sunar: denetimleri çalıştırır, temanızı derler, deterministik `.zip`'i paketler ve o dosyayı ekleyerek GitHub sürümünü oluşturur. Deponuza yalnızca ona işaret eden küçük bir "çağırıcı" (caller) workflow eklersiniz.

`.github/workflows/release.yml` dosyasını oluşturun:

```yaml
name: Release

on:
  push:
    branches: [main, dev]

jobs:
  release:
    uses: PanoMC/sdk/.github/workflows/theme-release.yml@dev
    with:
      theme-id: my-theme
    secrets:
      TOKEN_GITHUB: ${{ secrets.GITHUB_TOKEN }}
```

Dosyanın tamamı bu kadar. Push yaptığınızda paylaşılan workflow:

1. `sync` + `check` çalıştırır ([Paketleme](/tr/theme/packaging/)'deki güvenlik ağı).
2. Temanızı derler.
3. Deterministik `.zip`'i paketler.
4. Bir GitHub sürümü oluşturur ve o `.zip`'i otomatik olarak ekler.

`my-theme` yerine `manifest.json` içindeki temanızın `id` değerini yazın.

::: tip
`GITHUB_TOKEN`, GitHub Actions tarafından otomatik olarak sağlanır — oluşturmanıza gerek yoktur. Yalnızca gösterildiği gibi iletin.
:::

## Resmi Pano Marketplace'te yayınlama

[panomc.com](https://panomc.com) üzerindeki Marketplace, sunucu sahiplerinin temaları doğrudan panellerinden keşfedip kurduğu yerdir. Orada yayınlamak üç adımdan oluşur: bir hesap oluşturun, bir kaynak (resource) oluşturun, sonra sürümleri yükleyin (elle ya da otomatik olarak).

### 1. Bir hesap ve bir kaynak oluşturun

1. **panomc.com** adresinde kaydolun (veya giriş yapın).
2. **Create Resource**'u açın.
3. Tür olarak **Theme** seçin, bir kategori seçin, başlık ile açıklamayı doldurun ve en az bir **ekran görüntüsü** yükleyin — ekran görüntüleri temalar için gereklidir, çünkü insanların bir temayı bir bakışta değerlendirme biçimi budur.
4. Fiyatlandırmayı seçin: **ücretsiz** ya da satmayı planlıyorsanız **ücretli** (aşağıdaki premium bölümüne bakın).

Kaynak oluşturulduğunda bir **resource ID** (uzun, benzersiz bir kod, bir UUID) alır. Kaynaklarınızı ve kimliklerini sonradan **Profile → Resources** altında bulursunuz. Bu kimlik, yayın araçlarının temanıza Marketplace üzerinde nasıl atıfta bulunduğudur — elinizin altında tutun.

::: tip İki farklı kimlik
`manifest.json` `id`'niz (`my-theme` gibi) tema *paketinin* kendisini tanımlar. Marketplace **resource ID**'si (UUID) ise temanızın panomc.com'daki *mağaza sayfasını* tanımlar. Bunlar ayrı şeylerdir ve yayın otomasyonu UUID'ye ihtiyaç duyar.
:::

### 2. Sürümleri yükleyin — elle ya da otomatik olarak

Basit yol: kaynak sayfanızı açın ve her yayınladığınızda `bun run package`'tan çıkan `.zip`'i yeni bir sürüm olarak yükleyin.

Daha iyi yol, bunu **`semantic-release-pano`** ile otomatikleştirmektir; böylece her push tek seferde hem GitHub'a *hem de* Marketplace'e yayınlanır:

1. panomc.com'da **Profile → Security → API tokens** altında bir **API token** oluşturun ve GitHub deponuza `PANO_TOKEN` adlı bir gizli anahtar (secret) olarak ekleyin (**Settings → Secrets → Actions**).
2. `semantic-release-pano`'yu yayın yapılandırmanıza (`.releaserc.json`) ekleyin ve kaynak kimliğinize yönlendirin:

```json
["semantic-release-pano", {
  "resourceId": "YOUR-RESOURCE-UUID",
  "file": "my-theme-${version}.zip",
  "panoVersion": "1.0.0",
  "useGitHubLink": true,
  "repositoryUrl": "https://github.com/YourName/my-theme.git"
}]
```

`useGitHubLink` ile ücretsiz temalar iki kez yüklenmez: Marketplace, GitHub sürümünüze zaten eklenmiş `.zip`'e bağlantı verir (bu yüzden GitHub sürüm adımı bu eklentiden *önce* çalışmalıdır). O olmadan, eklenti dosyayı doğrudan Marketplace'e yükler — premium temalar için istediğiniz budur.

## Temanızı premium yapma

Premium bir tema, insanların panomc.com üzerinden satın aldığı ve yalnızca gerçekten satın alan sunucularda çalışacak şekilde korunan bir temadır.

Bir temayı premium yapmak için `manifest.json` içinde tek bir alanı ayarlayın:

```diff
- "premium": false
+ "premium": true
```

Tek kaynak değişikliği budur. Koruma sizin için bağlanmıştır.

### Derlemenin ihtiyacı olanlar

Bir premium derleme, lisansı paketinize bağlayabilmek için bir açık anahtar (public key) almak zorundadır. Bunu derleme sırasında bir ortam değişkeniyle sağlarsınız:

- `PANO_LICENSE_SERVER` — derlemeye anahtarı hangi sunucudan alacağını söyler (örneğin `prod`). Yeniden kullanılabilir workflow bunu dalınıza (branch) göre zaten ayarlar, bu yüzden normalde ona dokunmazsınız.
- `PANO_LICENSE_PUBLIC_KEY` — alternatif olarak anahtarın kendisini bir CI gizli anahtarı (secret) olarak saklayabilirsiniz. Ayarlandığında derleme anahtarı doğrudan okur ve hiçbir ağ çağrısı yapmaz. Deponuzda **Settings → Secrets → Actions** altına ekleyin.

Ücretsiz bir tema (`"premium": false`) için bu değişkenler yok sayılır — hiçbir zararı olmaz.

### Koruma nasıl çalışır (sade anlatımla)

- Bir production derlemesi yaptığınızda Pano, paketinizin SHA-256 parmak izini hesaplar ve **lisansı tam olarak o parmak izine bağlar**.
- Premium temanızı kullanmak için bir sunucunun panelinde **bağlı bir panomc.com hesabı** olmalı ve o hesabın temanızı satın almış olması gerekir. Pano bunu hem tema **kurulduğunda** hem de **çalışırken** denetler.
- Paket kurcalanır veya yeniden paketlenirse, parmak izi lisanslı olanla artık eşleşmez ve Pano onu reddeder.
- `bun run dev` sırasında lisans kapısı **kapalıdır**, bu yüzden herhangi bir lisans olmadan özgürce geliştirebilirsiniz. Koruma yalnızca production derlemelerinde geçerlidir.

::: warning Hiçbir koruma mutlak değildir
Bu sistemin ne yapabileceği ve ne yapamayacağı konusunda kendinize karşı dürüst olun: **hiçbir lisans sistemi kodu %100 koruyamaz**. Buradaki amaç, yetkisiz kullanımı kullanıcıların büyük çoğunluğu için mümkün olduğunca zorlaştırmaktır — imkansız kılmak değil. Her yazılım parçası gibi, son kullanıcının eline geçen her kod doğası gereği açıktır: yeterince kararlı ve yetenekli biri onu her zaman parçalarına ayırabilir. Bu, yalnızca Pano'nunki için değil, yapılmış her DRM için geçerlidir. Temanızı bu gerçeği aklınızda tutarak fiyatlandırın ve destekleyin.
:::

::: warning Sürümleri yayınlarla ilerletin
Bir premium lisans, **sürüm + paket** başına verilir. Zaten yayınlanmış bir `.zip`'i düzenlerseniz parmak izi değişir ve artık lisanslı olmaz. Değişiklikleri her zaman yukarıdaki normal akış üzerinden **yeni bir yayın** olarak gönderin — yayınlanmış bir `.zip`'i asla elle düzenlemeyin.
:::

## Sırada ne var

- **[Derleme ve Paketleme](/tr/theme/packaging/)** — derleme, denetleme ve paketleme adımları ayrıntılı olarak.
- **[Çeviriler](/tr/theme/localization/)** — temanızı başka dillere çevirin.
