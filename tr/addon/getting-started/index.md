# Başlangıç

Bu sayfa sizi sıfırdan, sitenizde bir sayfa gösteren kendi **eklentinize** götürür: üç adım, elle yazılmış tek dosya yok. Önceden Pano deneyimi gerekmez, biraz Kotlin ve JavaScript yeterli.

Bir Pano **eklentisi** siteye özellik ekler: *tema* (herkese açık site) üzerinde sayfalar ve widget'lar, *panel* (`/panel` adresindeki yönetici paneli) içinde ekranlar ve arka uçta API'ler; hepsi tek bir kurulabilir JAR içinde.

::: tip Eklenti ve plugin aynı şeydir
Eklentiler Pano *plugin*'leridir. Kod düzeyindeki adlar `plugin` kelimesini kullanır (`PanoPlugin`, `pluginId`). Metin **eklenti** der; hiçbir şey yeniden adlandırılmadı.
:::

Bir eklentinin birlikte çalışan iki yarısı vardır: Pano'nun içinde çalışan bir **Kotlin arka ucu** (PF4J ile yüklenir, ona hiç dokunmazsınız) ve bir **Svelte arayüzü**. Birini tek başına da yayımlayabilirsiniz, ama iskele ikisini de yazar. İç işleyişi [Mimari](/tr/addon/architecture/) anlatır. Eklenti geliştirmek yerine *kurmak* isterseniz [Eklentiler](/tr/platform/addons/) sayfasına bakın.

## Neye ihtiyacınız var

| İhtiyacınız olan | Nasıl denetlenir |
|---|---|
| **JDK 17 veya üstü** | `java -version` |
| **Bun** ([bun.sh](https://bun.sh)) | `bun --version` |
| **Bu makinede çalışan Pano**, **Panel → Platform Ayarları → Geliştirme Modu** açık | `/panel` adresini açın |

Pano yerelde çalışmalıdır: eklenti, siz çalışırken o kurulumun `plugins/` klasöründe durur. Yoksa [Kurulum](/tr/platform/installation/) sayfasına bakın. `cmd` veya PowerShell'de `./gradlew` yerine `gradlew.bat` kullanın.

## Hızlı başlangıç

```sh
cd <pano-klasörünüz>/plugins && bunx @panomc/plugin-kit new my-plugin    # beş soru sorar, sonra kurar
cd my-plugin && bun run dev        # ilk çalıştırma jar'ı derler (dakikalar); Pano'yu bir kez yeniden başlatın, sonra /my-plugin adresini açın
```

Üç adım: iskele, dev, Pano'yu yeniden başlat. İskele her zaman Pano'nun `plugins/` klasöründe oluşturulur, çünkü Pano bir eklentinin geliştirme kaynaklarını `plugins/<pluginId>` altında bulur; klasör eklenti kimliğidir ve var olan bir klasör reddedilir. Kimlik verilmezse komut kimliği, adı, yazarı, Kotlin paketini ve hemen kurulup kurulmayacağını sorar. `new <id> [--package x.y]` hiçbir şey sormaz.

Yeniden başlatmadan sonra `http://<pano adresiniz>/my-plugin` adresini açın: sayfa oradadır ve iskelenin yazdığı bir uç noktanın yanıtını gösterir. **Panel → Eklentiler** de eklentiyi listeler.

::: tip Yavaş ilk derleme, takılan kurulum
İlk Gradle derlemesi Gradle'ı ve toolchain'i indirir ve dakikalarca donmuş gibi görünebilir; iptal etmeyin. `bun install` "Resolving..." üzerinde takılırsa durdurup `bun install --backend=copyfile` çalıştırın.
:::

## Ne elde edersiniz

| Dosya | Nedir |
|---|---|
| `src/theme/views/HelloPage.svelte` | `/my-plugin` adresindeki sayfa; `GetHelloAPI` yanıtını gösterir |
| `src/main/kotlin/<paket>/routes/GetHelloAPI.kt` | `GET /api/plugins/my-plugin/hello`, `/hello` olarak bildirilir |
| `src/main/kotlin/<paket>/MyPlugin.kt` | eklenti sınıfı |
| `src/main/resources/frontend-targets.json` | eklentinizin dışarı gönderdiği bağlantılar (boş), bkz. [API başvurusu](/tr/addon/api-reference/#link-targets-and-fallback-pages) |
| `build.gradle.kts`, `gradle.properties`, Gradle wrapper | derleme; `copyJar` jar'ı `panoPluginsDir` (`..`) klasörüne koyar |
| `package.json`, `rollup.config.js` | iki devDependency (`@panomc/sdk`, `@panomc/plugin-kit`) ve iki satırlık bir rollup dosyası |

Yazarın yazacağı en basit sayfa ve uç noktası:

```svelte
<!-- src/theme/views/HelloPage.svelte -->
<script module>export const view = { path: '/hello' };</script>
<h1>Hello</h1>
```

```kotlin
@Endpoint
class GetHelloAPI : Api() {
    override val paths = listOf(Path("/hello", RouteType.GET))
    override suspend fun handle(context: RoutingContext) = Successful(mapOf("message" to "hi"))
}
```

## Dev döngüsü {#the-dev-loop}

`bun run dev`, jar yoksa bir kez (arayüzsüz) derler, Geliştirme Modu'nun açık olduğunu denetler, sonra arayüzü izler. Her değişikliğin ihtiyacı:

| Değiştirdiğiniz | Görmek için |
|---|---|
| `src/theme/` altında bir view, yardımcı veya controller | `bun run dev` çalışırken yenileyin |
| `src/main/resources/locales/*.json` | yenileyin (Geliştirme Modu açık) |
| Kotlin kodu | `./gradlew build -Pnoui`, sonra **Pano'yu yeniden başlatın** |
| `gradle.properties` | tam `./gradlew build`, sonra yeniden başlatın |

::: warning Kotlin asla sıcak yüklenmez
Eklentiyi panelde kapatıp açmak yeni Kotlin kodunu yüklemez; sunucu, yeniden başlatma yeni jar'ı yükleyene kadar eski kodu tutar.
:::

`-Pnoui` arayüz derlemesini atlar ve yalnızca arka uç denemeleri içindir; yayın derlemesi arayüzü içermelidir (bkz. [Derleme ve Yayınlama](/tr/addon/publishing/)).

## Eklemeler

```
Yeni sayfa:    src/theme/views/X.svelte içinde  export const view = { path: '/x' }
Yardımcı:      yanındaki herhangi bir .js, olağan biçimde içe aktarılır (okunabilir gönderilir)
Kapalı mantık: src/theme/controllers/x.js   ->   plugin('my-plugin').require('x')
Panel sayfası: src/main.js  ->  pano.ui.page.register({ path, component })
Örnek veri:    bunx pano-plugin samples X          Denetim: bunx pano-plugin check
```

Her biri [Ön Yüz](/tr/addon/frontend/) sayfasında anlatılır.

## Çalışmadığında

1. **Panel → Eklentiler'de listelenmiyor.** İlk derlemeden sonra Pano'yu yeniden başlattınız mı? Jar doğrudan `plugins/` içinde mi? Sunucu günlüğünde eklenti yükleme hatasına bakın.
2. **Bir arayüz veya dil düzenlemesi görünmüyor.** `bun run dev` hâlâ çalışıyor mu, Geliştirme Modu açık mı, klasör `plugins/<pluginId>/` altında mı?
3. **Bir Kotlin düzenlemesi etkisiz.** `./gradlew build -Pnoui` ile derleyin ve yeniden başlatın.
4. **Geliştirme sunucusu donuyor.** `/plugins` için asla Vite proxy kuralı eklemeyin: arayüz sunucusu onu zaten sunar, proxy döngü yapar.
5. **"needs API level 0".** İskele `gradle.properties` içine `apiLevel=1` yazar; silmeyin.

## Sonraki adım

- **[Ön Yüz](/tr/addon/frontend/)**: adlandırılmış view'lar, yardımcılar, controller'lar, örnekler, widget'lar.
- **[API başvurusu](/tr/addon/api-reference/)**: göreli uç nokta yolları, `api.get`, hata kodları, sayfalar, bağlantı hedefleri, webhook'lar.
- **[Arka Uç](/tr/addon/backend/)**: tablolar, uç noktalar, izinler.
- **[Mimari](/tr/addon/architecture/)**: Pano JAR'ınızı yüklediğinde ne olur.
- **[Derleme ve Yayınlama](/tr/addon/publishing/)**: bir sürüm çıkarın.
