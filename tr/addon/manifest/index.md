# Eklenti Manifestosu

Her Pano eklentisi küçük bir meta veri dosyasıyla — **manifesto** — gelir; bu dosya Pano'ya eklentinizin ne olarak adlandırıldığını, kimin yaptığını, önce hangi sınıfı çalıştıracağını ve neye bağlı olduğunu söyler. Bu sayfa size ayarladığınız birkaç değeri, onları nerede ayarladığınızı ve derlenen eklentinizde gerçekten yer aldıklarını nasıl doğrulayacağınızı gösterir.

::: tip JavaScript'ten mi geliyorsunuz?
Bir manifesto, Java dünyasının `package.json` karşılığıdır — projenizi tanımlayan küçük bir dosya. Bir **giriş noktası** yalnızca Pano'nun eklentinizi yüklerken önce çalıştırdığı sınıf anlamına gelir.
:::

Bu sayfada göreceğiniz birkaç terim:

- **PF4J** (Plugin Framework for Java) — Pano çalışırken eklenti jar'larını bulan ve yükleyen bir kütüphane. Onu asla kendiniz çağırmazsınız; yalnızca belirli meta verilerin var olmasına ihtiyaç duyar.
- **JAR** — Java'nın paketlenmiş çıktısı, ki gerçekte yalnızca bir zip dosyasıdır. Eklentinizi derlediğinizde bir `.jar` elde edersiniz.
- **`MANIFEST.MF`** — o jar'ın *içinde* (`META-INF/` altında) bulunan, PF4J'nin okuduğu meta veriyi tutan düz metin bir dosya.

`MANIFEST.MF`'i elle **düzenlemezsiniz**. Bunun yerine her şeyi bir properties dosyasında ayarlarsınız ve derleme değerlerinizi sizin için manifest'e kopyalar.

::: tip Bu sayfa boilerplate'ten iskele oluşturduğunuzu varsayar
Bu talimatlar Pano boilerplate'inden oluşturulmuş bir eklenti projesi için geçerlidir. Bunu henüz yapmadıysanız, [Başlangıç](/tr/addon/getting-started/) ile başlayın. Boilerplate zaten aşağıdaki her anahtarın doldurulduğu bir `gradle.properties` ile gelir.
:::

**Buna gerçekten ne zaman dokunursunuz?** Pratikte ilk derlemenizden önce yalnızca beş satırı değiştirirsiniz — `pluginId`, `pluginName`, `pluginDescription`, `pluginClass` ve `pluginDeveloper`. Geri kalan her şey tam olarak boilerplate'in geldiği gibi kalabilir.

## `gradle.properties`'i yapılandırma

Eklenti projenizin kök klasöründeki **`gradle.properties`**'i açın — boilerplate zaten aşağıdaki tüm anahtarlarla önceden doldurulmuş bir tane içerir. Bir derleme sırasında, Gradle bu değerleri okur ve sizin için son JAR manifestine enjekte eder.

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

*Bu değerleri düz ASCII'de tutun (aksansız harfler, rakamlar, temel noktalama). Bir uzun tire, bir aksan veya bir emoji gerekiyorsa, önce aşağıdaki [Tuzaklar](#tuzaklar) altındaki kodlama notunu okuyun.*

**Kontrol noktası.** Bir kez derleyin ve jar'ın içine bakın:

```bash
./gradlew build
unzip -p build/libs/*.jar META-INF/MANIFEST.MF
```

Yazdırılan satırlar arasında `id`, `name` ve `main-class`'ınızı görmelisiniz.

### Ne üretilir

Yukarıdaki `gradle.properties` verildiğinde, derleme `META-INF/MANIFEST.MF`'e şunun gibi satırlar yazar (öznitelik adları PF4J'den gelir; değerler doğrudan properties'inizden gelir):

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

Dosyanın tüm amacı budur: **`gradle.properties` girer, `MANIFEST.MF` çıkar.** (Tam satırlar hangi isteğe bağlı properties'i doldurduğunuza bağlıdır.)

### Anahtar Properties

Şimdi değerler, satır satır. **(Gerekli)**, Pano derlemesinin onsuz başarısız olduğu anlamına gelir — gerekli bir property eksikse, `./gradlew build` `shadowJar` adımında property'yi adlandıran bir hatayla durur. PF4J'nin ona ihtiyaç duyduğu anlamına *gelmez*. **(İsteğe bağlı)** properties boş bırakılabilir veya kaldırılabilir.

*   `pluginId`: **(Gerekli)** Eklentiniz için benzersiz bir id. Yalnızca küçük harfler, rakamlar ve tireler kullanın — boşluk yok. Gelenek `pano-plugin-<name>`'dir (örn. `pano-plugin-announcement`); `pano-plugin-` öneki bir gelenektir, katı bir gereklilik değil, ama buna bağlı kalın. Onu bir kez seçin ve asla değiştirmeyin (aşağıdaki ipucuna bakın).
*   `pluginName`: **(Gerekli)** Eklentinin insan tarafından okunabilir adı (örn. `Announcements`).
*   `pluginDescription`: **(İsteğe bağlı)** Eklentinizin ne yaptığının kısa bir açıklaması.
*   `pluginPanoVersion`: **(Gerekli)** Bu eklentinin derlendiği Pano sürümü. Geliştirme sırasında bunu `local-build` olarak bırakın — aşağıdaki sürümler uyarısına bakın.
*   `pluginClass`: **(Gerekli)** Eklentinizin ana sınıfının tam yolu — paket adı artı sınıf adı, örn. `com.example.myplugin.MyPlugin`. Bu, bildirimi `: PanoPlugin(` içeren `src/main/kotlin/...` içindeki sınıftır — Pano'nun eklentinizi yüklerken önce çalıştırdığı sınıf. (Geliştiriciler buna *tam nitelikli ad* der.)
*   `pluginDeveloper`: **(Gerekli)** Eklentiyi geliştiren yazar veya kuruluş.
*   `pluginLicense`: **(İsteğe bağlı)** Eklentinin lisansı (örn. `MIT`, `Apache-2.0`).
*   `pluginSourceUrl`: **(İsteğe bağlı)** Eklentinin kaynak koduna URL.
*   `pluginDependencies`: **(İsteğe bağlı)** Eklentinizin ihtiyaç duyduğu diğer Pano eklentileri, virgülle ayrılmış — örn. `pluginDependencies=other-plugin, some-plugin?`. Tam söz dizimi için aşağıdaki [Bağımlılıklar](#bagımlılıklar)'a bakın.
*   `pluginRequires`: **(İsteğe bağlı)** Eklentinizin üzerinde çalışmasına *izin verilen* Pano sürümleri, `>=1.0.0` gibi bir sürüm aralığı olarak yazılır. Boş (varsayılan) herhangi bir sürüm anlamına gelir. Yalnızca eklentiniz belirli bir Pano sürümünde eklenen bir özelliğe dayanıyorsa ayarlayın, örn. `pluginRequires=>=1.2.0`. (Bu, manifest `requires` özniteliğine eşlenir.)

::: tip `pluginPanoVersion` vs `pluginRequires`
Bu ikisi benzer görünür ama farklı işler yapar:

- **`pluginPanoVersion`** yalnızca hangi Pano sürümüne karşı derlediğinizi *kaydeder*. Bilgilendiricidir.
- **`pluginRequires`** *uygulanır*: bir aralık ayarlarsanız, Pano eklentinizi bunun dışındaki herhangi bir Pano sürümünde yüklemeyi reddeder.
:::

::: tip `pluginId`'niz her yerde kullanılır — onu dikkatle seçin
Pano bu tek dizeyi sistemin her yerinde yeniden kullanır, bu yüzden ayrıca şunları da adlandırır:

- eklentinizin veri klasörü (`plugins/<pluginId>/`),
- Pano'nun eklentinizin **veritabanı şema sürümünü** nasıl izlediği (tablolarınızın hangi migration'da olduğu),
- eklentinizin arayüzü için URL segmenti,
- eklentinizin tanımladığı her **izin** (her biri `pano.plugin.<pluginId>.…` önekli), ve
- yayınladığınızda **pazar yeri listelemenizin id'si** (`resourceId`) — [Derleme ve Yayınlama](/tr/addon/publishing/)'ya bakın.

Onu bir kez seçin ve eklentiniz yayınlandıktan sonra asla değiştirmeyin. Onu yeniden adlandırmak, Pano'nun eklentiyi yepyeni gibi ele almasına neden olur: eski veritabanı tablolarınız, dosyalarınız ve verilen izinler yok sayılır ve fiilen kaybolur.
:::

::: warning Sürüm numaralarını elle ayarlamazsınız
Sürüm numaraları sizin için hesaplanır ve bunu yanlış yapmak yayın hattını bozar — bu yüzden onlara dokunmayın:

- **Asla bir sürüm numarası yazmazsınız.** Boilerplate sizden bir Gradle `version` ayarlamanızı hiç istemez, bu yüzden bir tane eklemeyin.
- **Yerel derlemeler her zaman `local-build`'dir.** `pluginPanoVersion=local-build`'i tutun, Gradle `version`'ı da (derleme zamanında enjekte edilir) `local-build` kalır.
- **Yayında, hat onu doldurur.** Gönderdiğinizde, CI — GitHub'da çalışan otomatik derleme — commit mesajlarınızdan gerçek `version`'ı hesaplamak için **semantic-release** adlı bir araç kullanır. Onu elle düzenlemek bunu bozar.

Pazar Yeri'nde gösterilen Pano sürümü, yayınladığınızda yapılandırılan yine başka, ayrı bir değerdir. Sürümlerin commit'lerinizden nasıl türetildiği için [Derleme ve Yayınlama](/tr/addon/publishing/)'ya bakın.
:::

## Bağımlılıklar

Eklentinizin ihtiyaç duyduğu diğer Pano eklentilerini `gradle.properties`'te bildirirsiniz; derleme bunları sizin için manifest'e yazar.

::: warning Bir kütüphane bağımlılığıyla aynı değildir
Bu, bir `build.gradle.kts` kütüphane bağımlılığı **değildir** (`implementation(...)` satırları — Pano'nun `npm install` karşılığı). `pluginDependencies`, eklentinizin çalışması için çalışma zamanında sunucuda kurulu olması gereken *diğer Pano eklentileri* anlamına gelir.
:::

### Eklenti Bağımlılıkları (`pluginDependencies`)
Sizinkinin ihtiyaç duyduğu diğer eklentileri virgülle ayrılmış olarak listeleyin.

- **Söz dizimi**: `pluginId` veya `pluginId@version`
- **İsteğe bağlı Bağımlılık**: eklenti ID'sine `?` ekleyin.

`@`'den sonraki kısım bir sürüm aralığıdır. `>=`, `<=`, `>` ve `<` gibi standart karşılaştırma operatörleri desteklenir; tam dil bilgisi için [PF4J dokümantasyonuna](https://pf4j.org/) bakın.

**Örnekler:**

*   `pluginDependencies=other-plugin`: `other-plugin`'in herhangi bir sürümünü gerektirir.
*   `pluginDependencies=other-plugin@1.2.0`: Tam olarak `1.2.0` sürümünü gerektirir.
*   `pluginDependencies=other-plugin@>=1.2.0`: `1.2.0` veya daha yüksek sürümü gerektirir.
*   `pluginDependencies=other-plugin@<2.0.0`: `2.0.0`'ın altındaki herhangi bir sürümü gerektirir.
*   `pluginDependencies=other-plugin?`: İsteğe bağlı bağımlılık. Varsa, eklentinizden önce yüklenir; yoksa, sizinki yine de yüklenir.
*   `pluginDependencies=other-plugin, some-plugin?`: İki bağımlılık, virgülle ayrılmış — biri gerekli, biri isteğe bağlı.

::: tip Gerekli bir bağımlılık eksikse ne olur?
**Gerekli** bir bağımlılık sunucuda kurulu değilse, Pano eklentinizi yüklemeyi reddeder ve başlangıçta bir hata günlüğe kaydeder — hangisinin eksik olduğunu görmek için platform konsolunu/günlüğünü kontrol edin.
:::

## Tuzaklar

### `gradle.properties` ISO-8859-1 olarak okunur

::: warning `gradle.properties` değerlerinde düz ASCII kullanın
Bu değerlerde yalnızca düz ASCII karakterler kullanın — aksansız İngilizce harfler, rakamlar ve temel noktalama. Başka herhangi bir şey için (bir uzun tire, aksanlı bir harf veya bir emoji), ham karakter yerine Unicode `\uXXXX` kaçışını yazın, yoksa manifest'te bozulur.

**Neden:** Gradle, `.properties` dosyalarını UTF-8 değil **ISO-8859-1 (Latin-1)** kodlamasında ayrıştırır. (Merak edenler için: literal bir uzun tire `—`, UTF-8 baytları `0xE2 0x80 0x94`'tür ve bu Latin-1 olarak geri okununca `â€"`'ye döner.)

Aşağıdaki iki satır yalnızca değerde farklıdır — ilki ham bir uzun tire kullanır, ikincisi onun `\u2014` kaçışını kullanır:

```properties
# Wrong — the literal em dash is mangled to â€"
pluginDescription=Manage your server — fast and simple.

# Right - \u2014 is the escape for an em dash
pluginDescription=Manage your server \u2014 fast and simple.
```

Herhangi bir karakterin kaçışını bulmak için, onu bir Unicode sitesinde arayın (örneğin "unicode code point for é" araması yapın) ve `\uXXXX` olarak yazın — örneğin `é`, `\u00E9`'dir.
:::

## İleri Düzey: Manuel Yapılandırma

`gradle.properties` dosyası yalnızca bir kolaylık katmanıdır. Manifestinizi kendiniz yapılandırmayı tercih ediyorsanız veya dinamik değerlere ihtiyacınız varsa, `build.gradle.kts` içindeki **`shadowJar`** görevini düzenleyebilirsiniz. (`shadowJar`, eklentinizi artı kütüphanelerini Pano'nun yüklediği tek `.jar`'a paketleyen derleme adımıdır.)

İşte Pano Boilerplate'in properties'i manifest'e nasıl eşlediği. Her `val … by project` satırı eşleşen değeri `gradle.properties`'ten çeker; `manifest { }` bloğu sonra onu PF4J'nin beklediği öznitelik adı altında `MANIFEST.MF`'e yazar:

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

::: warning Öznitelik anahtarlarını yeniden adlandırmayın
Özellikleri serbestçe ekleyebilirsiniz, ama mevcut anahtarları (`id`, `name`, `main-class`, `pano-version` vb.) yeniden adlandırmayın. PF4J onları bu tam adlarla arar, bu yüzden yeniden adlandırılmış bir anahtar eklentinizin yüklenmesini sessizce durdurur. Referans olarak, PF4J'nin kendisi yalnızca `id`, `main-class` ve `version`'ı *gerektirir*; geri kalan her şey isteğe bağlıdır ve yalnızca ayarladığınızda manifest'e yazılır.
:::

Pano, tüm eklenti yüklemesini ve yönetimini işlemek için arka planda **PF4J** kullanır. Standart geliştirme için onunla asla doğrudan etkileşime girmezsiniz, ama daha derin teknik ayrıntıları istiyorsanız [PF4J dokümantasyonuna](https://pf4j.org/) başvurabilirsiniz.

## Premium derleme properties'i

Bir **premium** (ücretli) eklenti mi gönderiyorsunuz? Derleme, derleme zamanında jar'ınıza bir **lisans genel anahtarı** — Pano'nun bir alıcının gerçekten ödeme yaptığını doğrulamak için kullandığı küçük bir anahtar — gömer. Bu, manifest properties'i değil, derleme bayraklarıyla ayarlanır ve bunların hiçbiri olmadan eklentiniz ücretsiz (lisanssız) bir jar olarak derlenir. Tüm iş akışı [Premium eklentiler](/tr/addon/premium/) sayfasında yaşar; kullandığı bayraklar şunlardır:

- `-PlicenseServer=dev|prod|<url>` — derlemenin hangi lisans sunucusuna işaret ettiği.
- `-PpanoLicensePublicKey=<base64>` — genel anahtarın kendisi, base64 dizesi olarak geçirilir.
- `PANO_LICENSE_PUBLIC_KEY` — yukarıdaki bayrak yerine kullanabileceğiniz bir ortam değişkeni.

## Çalışmanızı kontrol edin

Beş satırınızı düzenledikten sonra, tüm hattı baştan sona doğrulayın:

1. **Derleyin:** `./gradlew build` çalıştırın. Hatasız bitmeli. (Bir **(Gerekli)** property eksikse, derleme `shadowJar` sırasında durur ve onu adlandırır.)
2. **Jar'ın içindeki manifesti inceleyin:** `unzip -p build/libs/*.jar META-INF/MANIFEST.MF` çalıştırın. `id`, `name`, `main-class` ve yukarıdaki *Ne üretilir*'deki diğer satırları görmelisiniz.
3. **Onu kurun:** jar'ı bir Pano kurulumunun `plugins/` klasörüne bırakın.
4. **Yüklendiğini onaylayın:** Pano'yu başlatın ve **Panel → Eklentiler**'i açın — artık eklentinizi `pluginName`'iyle listelenmiş görmelisiniz.
