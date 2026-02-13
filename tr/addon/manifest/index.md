# Eklenti Manifestosu

Pano eklentileri, kimliklerini, bağımlılıklarını ve giriş noktalarını tanımlamak için bir manifestoya dayanır. Pano, eklenti yükleme işlemi için **PF4J** kullanır, bu da JAR'ın `MANIFEST.MF` dosyasında belirli meta verilerin bulunmasını gerektirir.

Geliştirmeyi basitleştirmek için `MANIFEST.MF` dosyasını doğrudan düzenlemenize **gerek yoktur**. Bunun yerine, bu özellikleri `gradle.properties` dosyası içinde kolayca yönetebilirsiniz.

## `gradle.properties` Yapılandırması

Derleme (build) işlemi sırasında Gradle, bu değerleri otomatik olarak okur ve nihai JAR manifestosuna ekler.

### Temel Özellikler

*   `pluginId`: **(Zorunlu)** Eklentiniz için benzersiz tanımlayıcı. Tutarlı bir ID kullanın (örn: `pano-plugin-announcement`).
*   `pluginName`: **(Zorunlu)** Eklentinin insan tarafından okunabilir adı (örn: `Announcements`).
*   `pluginDescription`: **(İsteğe bağlı)** Eklentinizin ne yaptığına dair kısa bir açıklama.
*   `pluginPanoVersion`: **(Zorunlu)** Eklentinin hangi Pano sürümü için yapıldığı (örn: `local-build` veya `1.0.0`).
*   `pluginClass`: **(Zorunlu)** `PanoPlugin` sınıfını genişleten ana sınıfınızın tam nitelikli adı.
*   `pluginDeveloper`: **(Zorunlu)** Eklentiyi geliştiren yazar veya kuruluş.
*   `pluginLicense`: **(Zorunlu)** Eklentinin lisansı (örn: `MIT`, `Apache-2.0`).
*   `pluginSourceUrl`: **(İsteğe bağlı)** Eklentinin kaynak kodunun URL'si.
*   `pluginDependencies`: **(İsteğe bağlı)** Eklentinizin bağımlı olduğu diğer eklentilerin listesi.

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
```

## Bağımlılıklar

Pano (PF4J aracılığıyla), doğrudan manifesto üzerinden gelişmiş bağımlılık yönetimini destekler.

### Eklenti Bağımlılıkları (`pluginDependencies`)
Eklentinizin çalışması için hangi diğer eklentilere ihtiyaç duyduğunu tanımlayabilirsiniz.
- **Sözdizimi**: `pluginId` veya `pluginId@surum`
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
    }
}
```
