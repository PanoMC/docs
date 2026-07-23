# Eklenti Manifestosu

Her Pano eklentisi, küçük bir üst veri dosyasıyla — **manifesto** — birlikte gelir; bu dosya Pano'ya eklentinizin adının ne olduğunu, kimin yaptığını, önce hangi sınıfı çalıştıracağını ve neye bağlı olduğunu söyler. Bu sayfa, ayarladığınız birkaç değeri, onları nerede ayarladığınızı ve derlenmiş eklentinize ulaştıklarını nasıl doğrulayacağınızı gösterir.

::: tip JavaScript'ten mi geliyorsunuz?
Bir manifesto, Java dünyasının `package.json` karşılığıdır — projenizi tanımlayan küçük bir dosya. **Giriş noktası** (entry point) yalnızca, Pano eklentinizi yüklediğinde önce çalıştırdığı sınıf demektir.
:::

Bu sayfada göreceğiniz birkaç terim:

- **PF4J** (Plugin Framework for Java) — Pano çalışırken eklenti jar'larını bulup yükleyen bir kütüphane. Onu asla kendiniz çağırmazsınız; yalnızca belirli üst verilerin var olmasına ihtiyaç duyar.
- **JAR** — Java'nın paketlenmiş çıktısı; aslında yalnızca bir zip dosyası. Eklentinizi derlediğinizde bir `.jar` elde edersiniz.
- **`MANIFEST.MF`** — o jar'ın *içindeki* (`META-INF/` altında) düz metin bir dosya; PF4J'nin okuduğu üst veriyi tutar.

`MANIFEST.MF`'i elle **düzenlemezsiniz**. Bunun yerine her şeyi bir properties dosyasında ayarlarsınız ve derleme, değerlerinizi sizin için manifestoya kopyalar.

::: tip Bu sayfa boilerplate'ten iskele kurduğunuzu varsayar
Bu talimatlar, Pano boilerplate'inden oluşturulmuş bir eklenti projesi için geçerlidir. Henüz bunu yapmadıysanız, [Başlangıç](/tr/addon/getting-started/) ile başlayın. Boilerplate, aşağıdaki her anahtar doldurulmuş bir `gradle.properties` ile zaten gelir.
:::

**Buna gerçekte ne zaman dokunursunuz?** Pratikte, ilk derlemenizden önce yalnızca beş satırı değiştirirsiniz — `pluginId`, `pluginName`, `pluginDescription`, `pluginClass` ve `pluginDeveloper`. Geri kalan her şey boilerplate'in geldiği gibi kalabilir.

## `gradle.properties`'i yapılandırma

Eklenti projenizin kök klasöründeki **`gradle.properties`**'i açın — boilerplate, aşağıdaki tüm anahtarlar önceden doldurulmuş bir tane zaten içerir. Bir derleme sırasında Gradle bu değerleri okur ve sizin için son JAR manifestosuna enjekte eder.

### Örnek

İşte Announcements eklentisinden eksiksiz bir `gradle.properties`:

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

*Bu değerleri düz ASCII'de tutun (aksansız harfler, rakamlar, temel noktalama). Bir uzun tire, aksan veya emoji gerekiyorsa, önce aşağıdaki [Tuzaklar](#tuzaklar) altındaki kodlama notunu okuyun.*

**Kontrol noktası.** Bir kez derleyin ve jar'ın içine bakın:

```bash
./gradlew build
unzip -p build/libs/*.jar META-INF/MANIFEST.MF
```

Yazdırılan satırlar arasında `id`, `name` ve `main-class`'ınızı görmelisiniz.

### Ne üretilir

Yukarıdaki `gradle.properties` verildiğinde, derleme `META-INF/MANIFEST.MF` içine şuna benzer satırlar yazar (nitelik adları PF4J'den gelir; değerler doğrudan properties'inizden gelir):

```
id: pano-plugin-announcement
name: Announcements
description: Create, edit and manage your Minecraft server announcements!
pano-version: local-build
main-class: com.panomc.plugins.announcement.AnnouncementPlugin
version: local-build
developer: Pano
license: MIT
source-url: https://github.com/panomc/pano-plugin-announcement
```

Dosyanın bütün amacı budur: **`gradle.properties` girer, `MANIFEST.MF` çıkar.** (Tam satırlar, hangi isteğe bağlı properties'i doldurduğunuza bağlıdır.)

### Anahtar Özellikler

Şimdi değerler, satır satır. **(Gerekli)**, Pano derlemesinin o olmadan başarısız olduğu anlamına gelir — gerekli bir özellik eksikse, `./gradlew build`, `shadowJar` adımı sırasında özelliği adlandıran bir hatayla durur. Bu, PF4J'nin ona *ihtiyaç duyduğu* anlamına *gelmez*. **(İsteğe bağlı)** özellikler boş bırakılabilir veya kaldırılabilir.

*   `pluginId`: **(Gerekli)** Eklentiniz için benzersiz bir id. Yalnızca küçük harf, rakam ve tire kullanın — boşluk yok. Gelenek `pano-plugin-<ad>` şeklindedir (örn. `pano-plugin-announcement`); `pano-plugin-` öneki bir gelenektir, katı bir zorunluluk değil, ama buna bağlı kalın. Onu bir kez seçin ve asla değiştirmeyin (aşağıdaki ipucuna bakın).
*   `pluginName`: **(Gerekli)** Eklentinin insan tarafından okunabilir adı (örn. `Announcements`).
*   `pluginDescription`: **(İsteğe bağlı)** Eklentinizin ne yaptığına dair kısa bir açıklama.
*   `pluginPanoVersion`: **(Gerekli)** Bu eklentinin derlendiği Pano sürümü. Geliştirme sırasında bunu `local-build` olarak bırakın — aşağıdaki sürüm uyarısına bakın.
*   `pluginClass`: **(Gerekli)** Eklentinizin ana sınıfına giden tam yol — paket adı artı sınıf adı, örn. `com.example.myplugin.MyPlugin`. Bu, `src/main/kotlin/...` içindeki, bildiriminde `: PanoPlugin(` bulunan sınıftır — Pano eklentinizi yüklediğinde önce çalıştırdığı sınıf. (Geliştiriciler buna *tam nitelikli ad* der.)
*   `pluginDeveloper`: **(Gerekli)** Eklentiyi geliştiren yazar veya kuruluş.
*   `pluginLicense`: **(İsteğe bağlı)** Eklentinin lisansı (örn. `MIT`, `Apache-2.0`).
*   `pluginSourceUrl`: **(İsteğe bağlı)** Eklentinin kaynak koduna URL.
*   `pluginDependencies`: **(İsteğe bağlı)** Eklentinizin ihtiyaç duyduğu diğer Pano eklentileri, virgülle ayrılmış — örn. `pluginDependencies=other-plugin, some-plugin?`. Tam söz dizimi için aşağıdaki [Bağımlılıklar](#bagımlılıklar) bölümüne bakın.
*   `pluginRequires`: **(İsteğe bağlı)** Eklentinizin çalışmasına *izin verilen* Pano sürümleri, `>=1.0.0` gibi bir sürüm aralığı olarak yazılır. Boş (varsayılan) herhangi bir sürüm demektir. Yalnızca eklentiniz belirli bir Pano sürümünde eklenen bir özelliğe dayanıyorsa ayarlayın, örn. `pluginRequires=>=1.2.0`. (Bu, manifesto `requires` niteliğine eşlenir.)

::: tip `pluginPanoVersion` vs `pluginRequires`
Bu ikisi benzer gelir ama farklı işler yapar:

- **`pluginPanoVersion`** yalnızca hangi Pano sürümüne karşı derlediğinizi *kaydeder*. Bilgilendirmedir.
- **`pluginRequires`** *zorlanır*: bir aralık ayarlarsanız, Pano eklentinizi bu aralığın dışındaki herhangi bir Pano sürümüne yüklemeyi reddeder.
:::

::: tip `pluginId`'niz her yerde kullanılır — dikkatle seçin
Pano bu tek dizeyi sistemin her yerinde yeniden kullanır, dolayısıyla şunları da adlandırır:

- eklentinizin veri klasörü (`plugins/<pluginId>/`),
- Pano'nun eklentinizin **veritabanı şema sürümünü** nasıl izlediği (tablolarınızın hangi migrasyonda olduğu),
- eklentinizin arayüzü için URL parçası,
- eklentinizin tanımladığı her **izin** (her biri `pano.plugin.<pluginId>.…` önekli) ve
- yayınladığınızda **pazar yeri ilan id'niz** (`resourceId`) — bkz. [Derleme ve Yayınlama](/tr/addon/publishing/).

Onu bir kez seçin ve eklentiniz yayına girdikten sonra asla değiştirmeyin. Yeniden adlandırmak, Pano'nun eklentiyi yepyeni bir eklenti gibi ele almasına yol açar: eski veritabanı tablolarınız, dosyalarınız ve verilen izinleriniz yok sayılır ve fiilen kaybolur.
:::

::: warning Sürüm numaralarını elle ayarlamazsınız
Sürüm numaraları sizin için hesaplanır ve bunu yanlış yapmak yayın hattını bozar — bu yüzden onlara dokunmayın:

- **Asla bir sürüm numarası yazmazsınız.** Boilerplate sizden bir Gradle `version` ayarlamanızı hiç istemez, o yüzden bir tane eklemeyin.
- **Yerel derlemeler her zaman `local-build`'tir.** `pluginPanoVersion=local-build` olarak tutun; Gradle `version`'ı (derleme zamanında enjekte edilen) da `local-build` kalır.
- **Yayında, hat onu doldurur.** Gönderdiğinizde CI — GitHub'da çalışan otomatik derleme — **semantic-release** adlı bir araç kullanarak gerçek `version`'ı commit mesajlarınızdan hesaplar. Onu elle düzenlemek bunu bozar.

Pazar yerinde gösterilen Pano sürümü, yayınladığınızda yapılandırılan yine ayrı, başka bir değerdir. Sürümlerin commit'lerinizden nasıl türetildiğini görmek için [Derleme ve Yayınlama](/tr/addon/publishing/) sayfasına bakın.
:::

## Bağımlılıklar

Eklentinizin ihtiyaç duyduğu diğer Pano eklentilerini `gradle.properties` içinde bildirirsiniz; derleme onları sizin için manifestoya yazar.

::: warning Bir kütüphane bağımlılığıyla aynı şey değil
Bu, **bir** `build.gradle.kts` kütüphane bağımlılığı değildir (`implementation(...)` satırları — Pano'nun `npm install` karşılığı). `pluginDependencies`, eklentinizin çalışması için sunucuda çalışma zamanında kurulmuş olması gereken *diğer Pano eklentileri* demektir.
:::

### Eklenti Bağımlılıkları (`pluginDependencies`)
Eklentinizin ihtiyaç duyduğu diğer eklentileri virgülle ayrılmış olarak listeleyin.

- **Söz dizimi**: `pluginId` veya `pluginId@version`
- **İsteğe bağlı bağımlılık**: eklenti id'sine `?` ekleyin.

`@`'ten sonraki kısım bir sürüm aralığıdır. `>=`, `<=`, `>` ve `<` gibi standart karşılaştırma operatörleri desteklenir; tam dil bilgisi için [PF4J dokümantasyonuna](https://pf4j.org/) bakın.

**Örnekler:**

*   `pluginDependencies=other-plugin`: `other-plugin`'in herhangi bir sürümünü gerektirir.
*   `pluginDependencies=other-plugin@1.2.0`: Tam olarak `1.2.0` sürümünü gerektirir.
*   `pluginDependencies=other-plugin@>=1.2.0`: `1.2.0` veya daha yüksek sürüm gerektirir.
*   `pluginDependencies=other-plugin@<2.0.0`: `2.0.0` altındaki herhangi bir sürümü gerektirir.
*   `pluginDependencies=other-plugin?`: İsteğe bağlı bağımlılık. Varsa, eklentinizden önce yüklenir; yoksa, sizinki yine yüklenir.
*   `pluginDependencies=other-plugin, some-plugin?`: İki bağımlılık, virgülle ayrılmış — biri gerekli, biri isteğe bağlı.

::: tip Gerekli bir bağımlılık eksikse ne olur?
**Gerekli** bir bağımlılık sunucuda kurulu değilse, Pano eklentinizi yüklemeyi reddeder ve başlangıçta bir hata günlüğe kaydeder — hangisinin eksik olduğunu görmek için platform konsolunu/günlüğünü kontrol edin.
:::

## Tuzaklar

### `gradle.properties` ISO-8859-1 olarak okunur

::: warning `gradle.properties` değerlerinde düz ASCII kullanın
Bu değerlerde yalnızca düz ASCII karakterleri kullanın — aksansız İngilizce harfler, rakamlar ve temel noktalama. Başka herhangi bir şey için (bir uzun tire, aksanlı bir harf veya bir emoji), ham karakter yerine Unicode `\uXXXX` kaçışını (escape) yazın, aksi hâlde manifestoda bozulur.

**Neden:** Gradle `.properties` dosyalarını UTF-8 değil, **ISO-8859-1 (Latin-1)** kodlamasında ayrıştırır. (Meraklısı için: gerçek bir uzun tire `—`, UTF-8 baytları `0xE2 0x80 0x94`'tür ve Latin-1 olarak geri okunduğunda `â€"`'ye dönüşür.)

Aşağıdaki iki satır yalnızca değerde farklıdır — ilki ham bir uzun tire kullanır, ikincisi onun `\u2014` kaçışını kullanır:

```properties
# Wrong — the literal em dash is mangled to â€"
pluginDescription=Manage your server — fast and simple.

# Right - \u2014 is the escape for an em dash
pluginDescription=Manage your server \u2014 fast and simple.
```

Herhangi bir karakterin kaçışını bulmak için onu bir Unicode sitesinde aratın (örn. "unicode code point for é") ve `\uXXXX` olarak yazın — örneğin `é`, `\u00E9`'dur.
:::

## İleri Düzey: Elle Yapılandırma

`gradle.properties` dosyası yalnızca bir kolaylık katmanıdır. Manifestonuzu kendiniz yapılandırmayı tercih ederseniz veya dinamik değerlere ihtiyaç duyarsanız, `build.gradle.kts` içindeki **`shadowJar`** görevini düzenleyebilirsiniz. (`shadowJar`, eklentinizi kütüphaneleriyle birlikte Pano'nun yüklediği tek `.jar`'a paketleyen derleme adımıdır.)

İşte Pano Boilerplate'in properties'i manifestoya nasıl eşlediği. Her `val … by project` satırı, eşleşen değeri `gradle.properties`'ten çeker; `manifest { }` bloğu sonra onu PF4J'nin beklediği nitelik adı altında `MANIFEST.MF`'e yazar:

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

::: warning Nitelik anahtarlarını yeniden adlandırmayın
İstediğiniz kadar nitelik ekleyebilirsiniz, ama mevcut anahtarları (`id`, `name`, `main-class`, `pano-version` vb.) yeniden **adlandırmayın**. PF4J onları bu tam adlarla arar, dolayısıyla yeniden adlandırılmış bir anahtar eklentinizin sessizce yüklenmesini durdurur. Referans olarak, PF4J'nin kendisi yalnızca `id`, `main-class` ve `version`'a *ihtiyaç duyar*; geri kalan her şey isteğe bağlıdır ve yalnızca ayarladığınızda manifestoya yazılır.
:::

Pano, tüm eklenti yükleme ve yönetimini işlemek için arka planda **PF4J** kullanır. Standart geliştirme için onunla asla doğrudan etkileşime girmezsiniz, ama daha derin teknik ayrıntılar isterseniz [PF4J dokümantasyonuna](https://pf4j.org/) başvurabilirsiniz.

## Premium derleme özellikleri

**Premium** (ücretli) bir eklenti mi gönderiyorsunuz? Derleme, jar'ınıza derleme zamanında bir **lisans genel anahtarı** — Pano'nun bir alıcının gerçekten ödeme yaptığını doğrulamak için kullandığı küçük bir anahtar — gömer. Bu, manifesto özellikleriyle değil, derleme bayraklarıyla ayarlanır ve bunların hiçbiri olmadan eklentiniz ücretsiz (lisanssız) bir jar olarak derlenir. Tam iş akışı [Premium eklentiler](/tr/addon/premium/) sayfasında yaşar; kullandığı bayraklar:

- `-PlicenseServer=dev|prod|<url>` — derlemenin hangi lisans sunucusuna yöneldiği.
- `-PpanoLicensePublicKey=<base64>` — genel anahtarın kendisi, base64 dizesi olarak geçirilir.
- `PANO_LICENSE_PUBLIC_KEY` — yukarıdaki bayrak yerine kullanabileceğiniz bir ortam değişkeni.

## İşinizi kontrol edin

Beş satırınızı düzenledikten sonra, tüm hattı baştan sona doğrulayın:

1. **Derleyin:** `./gradlew build` çalıştırın. Hatasız bitmelidir. (Bir **(Gerekli)** özellik eksikse, derleme `shadowJar` sırasında durur ve onu adlandırır.)
2. **Jar'ın içindeki manifestoyu inceleyin:** `unzip -p build/libs/*.jar META-INF/MANIFEST.MF` çalıştırın. Yukarıdaki *Ne üretilir* bölümündeki `id`, `name`, `main-class` ve diğer satırları görmelisiniz.
3. **Kurun:** jar'ı bir Pano kurulumunun `plugins/` klasörüne bırakın.
4. **Yüklendiğini doğrulayın:** Pano'yu başlatın ve **Panel → Eklentiler**'i açın — eklentinizi artık `pluginName`'iyle listelenmiş görmelisiniz.
