# Eklenti Manifestosu

Pano eklentileri, kimliklerini, bağımlılıklarını ve giriş noktalarını tanımlamak için bir manifestoya dayanır. Pano, eklenti yükleme işlemi için **PF4J** kullanır, bu da JAR'ın `MANIFEST.MF` dosyasında belirli meta verilerin bulunmasını gerektirir.

Geliştirmeyi basitleştirmek için `MANIFEST.MF` dosyasını doğrudan düzenlemenize **gerek yoktur**. Bunun yerine, bu özellikleri `gradle.properties` dosyası içinde kolayca yönetebilirsiniz.

## `gradle.properties` Yapılandırması

Derleme (build) işlemi sırasında Gradle, bu değerleri otomatik olarak okur ve nihai JAR manifestosuna ekler.

### Temel Özellikler

*   `pluginId`: **(Zorunlu)** Eklentiniz için benzersiz tanımlayıcı. Tutarlı bir ID kullanın (örn. `pano-plugin-announcement`).
*   `pluginName`: **(Zorunlu)** Eklentinin insan tarafından okunabilir adı (örn. `Announcements`).
*   `pluginDescription`: **(İsteğe bağlı)** Eklentinizin ne yaptığına dair kısa bir açıklama.
*   `pluginPanoVersion`: **(Zorunlu)** Eklentinin hangi Pano sürümü için yapıldığı (örn. `local-build` veya `1.0.0`).
*   `pluginClass`: **(Zorunlu)** `PanoPlugin`'i genişleten ana sınıfınızın tam nitelikli adı.
*   `pluginDeveloper`: **(Zorunlu)** Eklentiyi geliştiren yazar veya kuruluş.
*   `pluginLicense`: **(İsteğe bağlı)** Eklentinin lisansı (örn. `MIT`, `Apache-2.0`). Derleme, bunu yalnızca ayarlandığında manifestoya eşler; PF4J'in kendisi yalnızca id, sınıf ve sürümü gerektirir.
*   `pluginSourceUrl`: **(İsteğe bağlı)** Eklentinin kaynak kodunun URL'si.
*   `pluginDependencies`: **(İsteğe bağlı)** Eklentinizin bağımlı olduğu diğer eklentilerin listesi.
*   `pluginRequires`: **(İsteğe bağlı)** Bir PF4J **sistem-sürümü kısıtlaması** — eklentinizin çalışması için gereken Pano sürümü aralığı. Manifestonun `requires` özelliğine eşlenir ve varsayılan olarak boştur ("herhangi bir sürüm" anlamına gelir). Belirli bir Pano sürümünde eklenen bir özelliğe dayanmadığınız sürece boş bırakın.

::: tip `pluginId` her yerde kullanılır
`pluginId`'niz yalnızca bir manifesto alanı değildir — Pano'nun eklentinizi sistem genelinde tanımlamak için kullandığı anahtardır. Aynı dize şu şekilde yeniden kullanılır:

- eklentinizin veri dizininin adı (`plugins/<pluginId>/`),
- eklentinizin veritabanı şema-sürümü takibinin anahtarı,
- eklentinizin arayüzü için URL segmenti,
- eklentinizin tanımladığı her izin düğümünün öneki (`pano.plugin.<pluginId>.…`) ve
- yayınladığınızda pazar yeri (marketplace) `resourceId`'si (bkz. [Derleme ve Yayınlama](/tr/addon/publishing/)).

Bir kez seçin ve eklentiniz yayına girdikten sonra asla değiştirmeyin — onu yeniden adlandırmak, depolanmış verileri ve izinleri öksüz bırakır.
:::

### Örnek

```properties
pluginId=pano-plugin-announcement
pluginName=Announcements
pluginDescription=Create, edit and manage your Minecraft server announcements!
pluginPanoVersion=local-build
pluginClass=com.panomc.plugins.announcement.AnnouncementPlugin
pluginDeveloper=Pano
pluginLicense=MIT
pluginSourceUrl=https://github.com/panomc/pano-plugin-announcement
pluginDependencies=
pluginRequires=
```

::: warning Sürümleri belirlemek size ait değil
`pluginPanoVersion=local-build`'i olduğu gibi bırakın ve **`version`'ı asla elle düzenlemeyin**. Gerçek bir yayında CI (semantic-release), gerçek `version`'ı commit geçmişinizden (`-Pversion` aracılığıyla) enjekte eder — onu elle yükseltmek yayın hattını (release pipeline) bozar. Yerelde `version` her zaman `local-build`'tir. CI, `pluginPanoVersion`'a **dokunmaz**; manifestonun `pano-version` özelliği burada ne ayarladıysanız o kalır (normal bir derleme için `local-build`). Pazar Yeri'nde (Marketplace) gösterilen Pano sürümü *ayrı* bir değerdir — `.releaserc.json` içindeki Pano yayınlama plugin'inin `panoVersion` seçeneği. Sürümlerin commit'lerinizden nasıl türetildiği için [Derleme ve Yayınlama](/tr/addon/publishing/) sayfasına bakın.
:::

::: warning `gradle.properties` ISO-8859-1 olarak okunur
Gradle, `.properties` dosyalarını UTF-8 değil, **ISO-8859-1 (Latin-1)** kodlamasıyla ayrıştırır. ASCII olmayan herhangi bir karakter — örneğin bir em tire, aksanlı bir harf ya da `pluginDescription` içindeki bir emoji — bir `\uXXXX` kaçış dizisi olarak yazılmalıdır, yoksa manifestoda bozulur. Latin-1 olarak okunan gerçek bir em tire (`—`, UTF-8 baytları `0xE2 0x80 0x94`) `â€"` haline gelir. Ham karakter yerine kaçış dizisini yazın:

```properties
# Wrong — the literal em dash is mangled to â€"
pluginDescription=Manage your server — fast and simple.

# Right - \u2014 is the escape for an em dash
pluginDescription=Manage your server \u2014 fast and simple.
```
:::

## Bağımlılıklar

Pano (PF4J aracılığıyla), doğrudan manifesto üzerinden gelişmiş bağımlılık yönetimini destekler.

### Eklenti Bağımlılıkları (`pluginDependencies`)
Eklentinizin çalışması için hangi diğer eklentilere ihtiyaç duyduğunu tanımlayabilirsiniz.
- **Sözdizimi**: `pluginId` veya `pluginId@version`
- **İsteğe Bağlı Bağımlılık**: Eklenti kimliğinin sonuna `?` ekleyin.

**Örnekler:**
*   `pluginDependencies=other-plugin`: `other-plugin` eklentisinin herhangi bir sürümünü gerektirir.
*   `pluginDependencies=other-plugin@1.2.0`: Tam olarak `1.2.0` sürümünü gerektirir.
*   `pluginDependencies=other-plugin@>=1.2.0`: `1.2.0` veya daha yüksek bir sürümü gerektirir.
*   `pluginDependencies=other-plugin?`: İsteğe bağlı bağımlılık. Mevcutsa, eklentinizden önce yüklenir.

## PF4J

Pano, eklenti yükleme ve yönetimini gerçekleştirmek için arka planda **PF4J** kullanır. Standart geliştirme süreçlerinde bununla doğrudan etkileşime girmeniz gerekmese de, altyapı hakkında daha derin teknik bilgilere ihtiyaç duyarsanız [PF4J dokümantasyonuna](https://pf4j.org/) başvurabilirsiniz.

## Gelişmiş: Manuel Yapılandırma

`gradle.properties` dosyası bir kolaylık katmanıdır. Manifestonuzu manuel olarak yapılandırmayı tercih ederseniz veya dinamik değerlere ihtiyacınız varsa, `build.gradle.kts` içindeki `shadowJar` görevini değiştirebilirsiniz.

Pano Boilerplate'inin özellikleri manifestoya nasıl eşlediği aşağıda gösterilmiştir:

```kotlin
shadowJar {
    val pluginId: String by project
    val pluginName: String by project
    val pluginDescription: String? by project
    val pluginPanoVersion: String by project
    val pluginClass: String by project
    val pluginDeveloper: String by project
    val pluginLicense: String? by project
    val pluginSourceUrl: String? by project
    val pluginDependencies: String? by project
    val pluginRequires: String? by project

    manifest {
        attributes["id"] = pluginId
        attributes["name"] = pluginName
        pluginDescription?.let { attributes["description"] = it }
        attributes["pano-version"] = pluginPanoVersion
        attributes["main-class"] = pluginClass
        attributes["version"] = version
        attributes["developer"] = pluginDeveloper
        pluginLicense?.let { attributes["license"] = it }
        pluginSourceUrl?.let { attributes["source-url"] = it }
        pluginDependencies?.let { attributes["dependencies"] = it }
        pluginRequires?.let { attributes["requires"] = it }
    }
}
```

## Premium derleme özellikleri

Bir **premium** eklenti gönderiyorsanız, derleme ayrıca jar'a bir lisans genel anahtarı (public key) gömen birkaç ek özelliği de kabul eder — `-PlicenseServer=dev|prod|<url>`, `-PpanoLicensePublicKey=<base64>` ve `PANO_LICENSE_PUBLIC_KEY` ortam değişkeni. Bunlar manifesto özellikleri değil, derleme bayraklarıdır (build flags) ve bunların hiçbiri olmadan eklentiniz ücretsiz (lisanssız) bir jar olarak derlenir.
