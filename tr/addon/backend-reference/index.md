# Backend API Referansı

**Bu sayfa size ne verir:** eklentinizin kullanabileceği her backend sınıfı, fonksiyonu ve açıklaması, yapmaya çalıştığınız şeye göre sıralanmış. [Backend Geliştirme](/tr/addon/backend/) eğitiminin arama arkadaşıdır — eğitim parçaları Shoutbox örneğinde *nasıl* birbirine bağlayacağınızı gösterir; bu sayfa *neyin var olduğunu* listeler, böylece bir uzatma noktasını adıyla bulmak için asla platform kaynağını okumak zorunda kalmazsınız. (Bir *uzatma noktası* = Pano'nun kodunuzun bağlanmasına izin verdiği bir yer: bir kanca, bir açıklama veya genişlettiğiniz bir temel sınıf.)

Her girdi adını, tek satırlık amacını ve minimal bir imzasını (fonksiyonun adı, parametreleri ve ne döndürdüğü) verir. Çalışan, derlenen kod için eğitime başvurun; "bunun için bir API var mı ve ne olarak adlandırılıyor?" sorusunu yanıtlamak için bu sayfaya başvurun.

::: warning Pano eklentilerinde yeni misiniz? Önce eğitimi okuyun
Bu bir **referanstır**, bir başlangıç noktası değil — zaten bir eklenti oluşturduğunuzu varsayar. Bu sayfayı aramadan bulduysanız ve hiçbir şey anlamlı gelmiyorsa, önce [Backend Geliştirme](/tr/addon/backend/) eğitimini yapın. Bu sayfa ondan önce çok az anlamlı gelecektir.
:::

### Hangi bölüme ihtiyacım var?

- Bir HTTP endpoint'i ekleyin (eklentinizin yanıtladığı bir URL) → **§3**
- Veritabanında veri depolayın → **§4**
- Kendi yapılandırma dosyanızı okuyun veya yazın → **§5**
- Girişlere, kuruluma, yönlendirmeye veya hesap silmeye tepki verin → **§6**
- Bir panel sayfasını belirli yöneticilerle kısıtlayın (izinler) → **§7**
- Minecraft sunucu eklentisiyle konuşun → **§8**
- Sihirli-giriş bağlantıları veya tek seferlik jetonlar verin → **§9**
- Bir bildirim veya e-posta gönderin → **§10**
- Bir konsol komutu ekleyin → **§11**
- Etkinlik akışında bir yönetici eylemini kaydedin → **§12**
- Pano'nun kendi servislerinden birine ulaşın (veritabanı, kimlik doğrulama, …) → **§13**
- Bir premium lisansı doğrulayın → **§14**
- Jar'ınızda paketlenmiş bir dosyayı okuyun veya bir arka plan işi çalıştırın → **§15**

::: tip 60 saniyede kelime dağarcığı
Bu kelimeler bu sayfanın her yerinde görünür. Bir kez göz gezdirin.

- **host** — eklenti jar'ınızı yükleyen çalışan Pano sunucusu. Bir satır "host X yapar" dediğinde, bu kodunuzu değil, Pano'nun kendisini kastediyor.
- **bean** — çerçevenin bir kez oluşturup paylaştığı bir nesne. Onu inşa etmek yerine *istersiniz*.
- **bağlam** — o bean'lerin yaşadığı kutu. Üç tane alırsınız: `pluginBeanContext` (sizin), `pluginGlobalBeanContext` (eklentiler arasında paylaşılan) ve `applicationContext` (Pano'nun kendi — servislerinin yaşadığı yer).
- **açıklama** — bir sınıfın üstüne yazdığınız `@Endpoint` gibi bir etiket. Pano jar'ınızı tarar ve birini taşıyan her şeyi bağlar.
- **DAO** — Data Access Object (Veri Erişim Nesnesi): bir veritabanı tablosunun tüm SQL'ini tutan tek küçük bir sınıf.
- **migration** — bir kullanıcı eklentinizi güncellediğinde mevcut tablosunu veya yapılandırmasını N sürümünden N+1'e dönüştüren tek seferlik bir yükseltme adımı.
- **suspend** — bir iş parçacığını engellemeden duraklayıp bekleyebilen bir fonksiyon (aşağıdaki kutuya bakın).
- **Future / `coAwait()`** — henüz hazır olmayan bir Vert.x sonucu; bir `suspend` fonksiyonunun içinde onu beklemek için `.coAwait()` eklersiniz.
- **JWT / token** — imzalı bir dize: herkes içindekini okuyabilir, ama onu yalnızca sunucu üretebilirdi, bu yüzden taklit edilemez.
- **izin düğümü** — bir izni adlandıran `pano.plugin.x.manage` gibi noktalı bir dize; yöneticiler kullanıcı gruplarına düğümler verir.
- **HOCON** — yorumlara izin veren, insan dostu bir JSON çeşidi; `config.conf`'un formatı.
- **PF4J** — Pano'nun dahili olarak kullandığı eklenti-yükleme kütüphanesi; onu asla doğrudan çağırmazsınız.
:::

::: tip `suspend` hakkında
`suspend`, bir iş parçacığını engellemeden duraklayıp bekleyebilen — bir veritabanı sorgusu, bir HTTP çağrısı için — bir fonksiyonu işaretler. Tek kural: **bir `suspend` fonksiyonunu yalnızca başka bir `suspend` fonksiyonundan çağırabilirsiniz.** Bunu nadiren düşünmek zorunda kalırsınız, çünkü Pano'nun size verdiği çoğu giriş noktası zaten `suspend`'dir: tüm yaşam döngüsü kancaları (`onStart()`, …) ve her endpoint `handle()`'ı. Bunların içinde başka `suspend` fonksiyonlarını serbestçe çağırın. (Birkaç giriş noktası istisnadır ve düz, `suspend` olmayan fonksiyonlardır — `RouterEventListener`'ın metotları (§6) ve `@Command` işleyicileri (§11); bunların içinde `suspend` fonksiyonlarını doğrudan çağıramazsınız.) Birini düz (`suspend` olmayan) bir fonksiyondan çağırırsanız *"suspend function should be called only from a coroutine or another suspend function"* gibi bir derleyici hatası alırsınız.
:::

::: tip Bu sayfa nasıl okunur
Aşağıdaki her grup bir **tablo** (API adı, tek satırlık amaç ve imzası) ve bir `Source:` satırına sahiptir — tanımlandığı dosya (`com.panomc.platform` paketi, [`PanoMC/Pano`](https://github.com/PanoMC/Pano) deposundaki `Pano/src/main/kotlin/` altında), böylece gerçek kodu her zaman açabilirsiniz. Buradaki her şey doğrudan o kaynaktan aktarılmıştır. İmzalarda `suspend` kelimesine dikkat edin — hemen yukarıdaki kutuya bakın.
:::

::: tip Eklentiler kodda plugin'dir
Bu dokümanlarda her yerde olduğu gibi: düz metin **eklenti** der, ama kod `plugin` kullanır — `PanoPlugin`, `pluginId`, `PluginConfig`. Eklenti meta verisi (id, ad, ana sınıf, bağımlılıklar) kodda ayarlanmaz; jar manifestinde yaşar (*jar manifesti* = derlenen `.jar`'ınızın içine paketlenmiş küçük bir meta veri metin dosyası; Gradle onu `gradle.properties`'ten sizin için yazar) — [Manifest Yapılandırması](/tr/addon/manifest/)'na bakın.
:::

::: tip Bu sayfada başvurulan örnek eklentiler
Birkaç satır örnek olarak gerçek, çalışan eklentilere işaret eder — `pano-plugin-slider`, `pano-plugin-auth-guard`, `pano-plugin-market`, `pano-plugin-social-login`, `pano-plugin-premium-login`. Bunlar Pano ile gelen yerleşik eklentilerdir; her birinin [github.com/PanoMC](https://github.com/PanoMC) altında aynı adlı kendi deposu vardır (örneğin [`PanoMC/pano-plugin-slider`](https://github.com/PanoMC/pano-plugin-slider)). Bir satır "bkz. `pano-plugin-slider` `PanelAddSliderItemAPI`" dediğinde, tam örneği okumak için o eklentinin kaynağını açın.
:::

## 1. Giriş sınıfı ve yaşam döngüsü — `PanoPlugin`

Her eklentinin tam olarak `PanoPlugin`'i genişleten bir sınıfı vardır. Aynı anda üç şeydir: giriş noktanız (Pano'nun yüklediği ilk sınıf), Pano'nun size hazır nesneleri — logger'ınız, veri klasörünüz, Vert.x örneği — asla kendiniz inşa etmediğiniz özellikler olarak verdiği yer ve yaşam döngüsü kancalarının (Pano'nun sabit anlarda çağırdığı fonksiyonlar) sahibi.

*Source: `com.panomc.platform.api.PanoPlugin`*

### Enjekte edilen özellikler

Pano bunları sizin için `onCreate()` çalışmadan önce doldurur; onları sınıfın herhangi bir yerinden okuyun ve asla kendiniz atamayın. (Hatırlayın: *host* = eklenti jar'ınızı yükleyen çalışan Pano sunucusu.)

Aşağıdaki satırlardan üçü Spring **bağlamlarıdır** — bean kutuları. Bir **bean**, çerçevenin bir kez oluşturup paylaştığı bir nesnedir; bir **bağlam**, o bean'lerin yaşadığı kutudur. Üç kutu alırsınız: `pluginBeanContext` (sizin), `pluginGlobalBeanContext` (eklentiler arasında paylaşılan) ve `applicationContext` (Pano'nun kendi — servislerinin yaşadığı yer).

| Özellik | Tür | Nedir |
|---|---|---|
| `pluginId` | `String` | Eklentinizin id'si (manifestten) |
| `vertx` | `Vertx` | Vert.x örneği — zamanlayıcılar, olay veri yolu, `WebClient` |
| `pluginBeanContext` | `AnnotationConfigApplicationContext` | *Sizin* bean'lerinizi tutan Spring bağlamı |
| `pluginGlobalBeanContext` | `AnnotationConfigApplicationContext` | Eklentiler-arası bean'ler için paylaşılan bağlam |
| `applicationContext` | `AnnotationConfigApplicationContext` | Host bağlamı — Pano servislerini `getBean(...)` ile getirin |
| `pluginEventManager` | `PluginEventManager` | Eklentiler-arası olayları tetikle/al |
| `pluginUiManager` | `PluginUiManager` | Arayüz paketi kayıt defteri (sizin için yönetilir) |
| `environmentType` | `Main.Companion.EnvironmentType` | `DEVELOPMENT` / `RELEASE` |
| `releaseStage` | `ReleaseStage` | alpha / beta / stable kanalı |
| `pluginState` | `PluginState` | PF4J yükleme durumu (PF4J = Pano'nun dahili eklenti yükleyicisi; onu asla çağırmazsınız) |
| `pluginDataFolder` | `File` | `plugins/<pluginId>/` veri dizini (otomatik oluşturulur) |
| `logger` | `Logger` | Sınıfınıza kapsamlanmış SLF4J logger |

### Yaşam döngüsü kancaları

Hepsi varsayılan boş gövdeli `open suspend fun`'dır (`open` = onu geçersiz kılabilirsiniz; *boş* = onu geçersiz kılana kadar hiçbir şey yapmaz; `suspend` = en üstteki kutuya bakın). Yalnızca ihtiyacınız olanı geçersiz kılın. Hangilerinin çalışacağı eklentiye ne olduğuna bağlıdır:

```
server boot:    jar load → onCreate() → onStart() → …running… → onStop()
panel Enable:   onEnable() → onStart()
panel Disable:  onStop() → onDisable()
panel Delete:   onUninstall() → onStop()
```

`verifyLicense()` bu dizinin **parçası değildir** — talep üzerine çalışır, bir site yöneticisi panelde *Lisansı yenile*'ye tıkladığında (yalnızca premium eklentiler).

| Kanca | Ne zaman çalışır |
|---|---|
| `onCreate()` | Eklenti nesnesi inşa edildiğinde — çalışan ilk kanca (enjekte edilen özellikleriniz bu noktada zaten ayarlanmış) |
| `onEnable()` | Bir yönetici panelde *Etkinleştir*'e tıkladığında veya eklenti yeni kurulduğunda. Normal bir sunucu açılışında çağrılmaz |
| `onStart()` | Eklenti başladığında — kurulum kodunuzu buraya koyun. Önce `setupManager.isSetupDone()`'ı kontrol edin ve `false` ise erken dönün (§13'e bakın), böylece site kurulmadan önce veritabanına asla dokunmazsınız |
| `onStop()` | Eklenti durduruluyor (sunucu kapanışı, *Devre dışı bırak*, *Sil*) — zamanlayıcıları/işleri burada iptal edin |
| `onDisable()` | Bir yönetici *Devre dışı bırak*'a tıkladı; eklentinin verisi tutulur. Sunucu kapanışında çağrılmaz |
| `onUninstall()` | Eklenti **silindi** (yönetici *Sil*'e tıkladı) — tablolarınızı burada düşürün. Eklenti durdurulmadan önce çalışır |
| `verifyLicense()` | Panel "Lisansı yenile" düğmesi (premium eklentiler) |

### Metotlar

| Metot | İmza | Amaç |
|---|---|---|
| `registerSingletonGlobal` | `(bean: Any)` | Bir bean'i diğer eklentilerle paylaş |
| `unRegisterGlobal` | `(bean: Any)` | Paylaşılan bir bean'i kaldır |
| `register` | `(eventListener: PluginEventListener)` | Dinamik bir olay dinleyicisi kaydet |
| `unRegister` | `(eventListener: PluginEventListener)` | Dinamik bir olay dinleyicisini kaldır |
| `registerCommands` | `(obj: Any)` | Bir nesnedeki `@Command` metotlarını kaydet (`@Command` = bir konsol komutu ekleyen bir açıklama — §11'e bakın) |
| `unRegisterCommands` | `(obj: Any)` | Onları kaldır |
| `getLicenseManager` | `(): LicenseManager` | Host lisans servisi (premium) |
| `getLicenseJwtIssuer` | `(): String` | Lisans JWT'leri için beklenen `iss` |
| `getOwnJarSha256` | `(): String?` | Yüklenen jar'ın SHA-256'sı veya null |

::: warning Pano'nun kendi servisleri kurucu parametreleri değildir
Pano *sizin* sınıflarınızı oluşturduğunda kendi DAO'larınızı ve bean'lerinizi kurucu parametreleri olarak geçirebilir (buna *kurucu enjeksiyonu* denir). Ama Pano'nun kendi servislerini (`DatabaseManager`, `AuthProvider`, `SetupManager`, …) bu şekilde **isteyemezsiniz** — bunlar sizin bağlamınızda değil, `applicationContext`'te yaşar. Bunun yerine onları elle getirin:

```kotlin
// `by lazy` delays the lookup until first use, after the host has finished wiring everything up
private val authProvider by lazy { applicationContext.getBean(AuthProvider::class.java) }
```
:::

## 2. Sınıflarınızı otomatik kaydeden açıklamalar

Bir **açıklama**, bir sınıfın üstüne yazdığınız bir etikettir (`@Endpoint` gibi). Eklentiniz yüklendiğinde, Pano jar'ınızı tarar ve bu etiketlerden birini taşıyan herhangi bir sınıfı otomatik olarak bağlar — manuel bir kayıt çağrısı yoktur. Tarama eklenti ana sınıfınızın paketinde köklenir, bu yüzden açıklamalı sınıflarınız o pakette veya onun bir alt paketinde yaşamalıdır (ilgisiz bir paketteki bir sınıf sessizce asla kaydedilmez). Tüm bu açıklamalar, `@EventListener` **hariç**, `com.panomc.platform.annotation`'da yaşar.

*Source: `com.panomc.platform.annotation.*`, `com.panomc.platform.api.annotation.EventListener`*

| Açıklama | Onu şuna koyun | Amaç |
|---|---|---|
| `@Endpoint` | bir `Api` alt sınıfı | HTTP rotasını kaydet |
| `@Dao` | bir `Dao` impl'i (`@Lazy @Scope(SCOPE_SINGLETON)` ile eşleştir) | DAO singleton'ını kaydet |
| `@Migration` | bir `DatabaseMigration` veya `PluginConfigMigration` | Migration'ı kaydet |
| `@EventListener` | bir olay-dinleyici sınıfı | Dinleyiciyi kaydet |
| `@PermissionDefinition` | bir `Permission` alt sınıfı | İzni kaydet |
| `@NotificationDefinition` | bir bildirim türü | Bildirim türünü kaydet |
| `@Event` | bir Minecraft-sunucusu WebSocket işleyicisi (platformun kendisi tarafından kullanılır) | Bunu platform kaynağında göreceksiniz, ama eklentiler kullanamaz — bunun yerine `ServerManager.registerEvent` (§8) kullanın |
| `@Ignore` | bir entity alanı | Alanı sütun eşlemesinden hariç tut |

Bir **DAO** (Data Access Object), bir tablonun SQL'ini tutan sınıftır. Onun `@Dao` uygulaması, üç açıklamanın hepsinin üst üste dizilmiş olmasını, artı iki Spring içe aktarmasını gerektirir. İşte Shoutbox örneği için tüm sınıf başlığı (`ShoutDao` soyut DAO'nuz, `ShoutDaoImpl` SQL'i olan):

```kotlin
import com.panomc.platform.annotation.Dao
import org.springframework.beans.factory.config.ConfigurableBeanFactory
import org.springframework.context.annotation.Lazy
import org.springframework.context.annotation.Scope

@Dao
@Lazy
@Scope(value = ConfigurableBeanFactory.SCOPE_SINGLETON)
class ShoutDaoImpl : ShoutDao()
```

(Bir **migration** = bir kullanıcı eklentinizi güncellediğinde mevcut tablosunu veya yapılandırmasını N sürümünden N+1'e dönüştüren tek seferlik bir yükseltme adımı; §4 ve §5'e bakın.)

::: warning Spring'inkini değil, Pano'nun `@EventListener`'ını kullanın
Açıklama `com.panomc.platform.api.annotation.EventListener`'dır — `org.springframework.context.event.EventListener` **değil**. Aynı kısa ada sahiptirler ama farklı içe aktarmalardan gelirler; yanlış olanı içe aktarın ve olay sistemi sessizce dinleyicinizi asla çağırmaz. İçe aktarma satırınızın tam olarak `import com.panomc.platform.api.annotation.EventListener` yazdığını kontrol edin.
:::

## 3. HTTP endpoint'leri ve yönlendirme

Bir **endpoint** = eklentinizin yanıtladığı bir URL, örneğin `GET /api/plugins/pano-plugin-shoutbox/shouts`. Aşağıdaki temel API sınıflarından birini genişleten `@Endpoint`-açıklamalı bir sınıf yazarak bir tane yaparsınız; Pano DAO'larınızı ve bean'lerinizi kurucusuna sizin için geçirir (kurucu enjeksiyonu).

Derlenen en küçük endpoint bir sınıf, yanıtladığı yollar ve bir sonuç döndüren bir `handle`'dır:

```kotlin
// imports: com.panomc.platform.model.* (Api, Path, RouteType, Result, Successful), com.panomc.platform.annotation.Endpoint
@Endpoint
class GetShoutsAPI : Api() {
    override val paths = listOf(Path("/shouts", RouteType.GET))

    override suspend fun handle(context: RoutingContext): Result {
        return Successful(mapOf("shouts" to listOf<String>()))
    }
}
```

*Source: `com.panomc.platform.model` (`Route`, `Path`, `RouteType`, `Api`, `LoggedInApi`, `PanelApi`, `SetupApi`, `Template`, `Result`, `Error`)*

### Rota temelleri

| Tür | İmza | Amaç |
|---|---|---|
| `Path` | `Path(url: String, routeType: RouteType)` | Endpoint'in yanıtladığı bir URL + metot |
| `RouteType` | `ROUTE`, `GET`, `POST`, `PUT`, `DELETE` | HTTP metodu — `ROUTE` *herhangi bir* metotla eşleşir, `Template` (HTML) rotaları için kullanılır |
| `Route.paths` | `val paths: List<Path>` | Bu rotanın işlediği yollar (gerekli) |
| `Route.order` | `open val order = 1` | İki rota aynı URL ile eşleşebiliyorsa, daha düşük `order`'a sahip olan önce denenir |
| `Route.getValidationHandler` | `(schemaRepository): ValidationHandler?` | İstek gövdesi/sorgu doğrulaması |
| `Route.bodyHandler` | `open fun bodyHandler(): Handler?` | Gövde ayrıştırmayı geçersiz kıl (yüklemelere bakın) |

### Temel sınıflar — kimin çağırabileceğine göre seçin

| Temel sınıf | Kime izin veriliyor | Yolları şöyle bildirin |
|---|---|---|
| `Api` | Herkes (herkese açık) | `/shouts` (`/api/plugins/<pluginId>` altında) |
| `LoggedInApi` | Giriş yapmış herhangi bir kullanıcı | `/shouts` |
| `PanelApi` | Yöneticiler (`LoggedInApi`'yi genişletir) | `/shouts` (`/api/plugins/<pluginId>/panel`) |
| `SetupApi` | Yalnızca ilk kurulum sırasında | `/...` (core) |
| `Template` | Sunucu-render'lı HTML rotası | — |

`SetupApi` rotaları yalnızca ilk kurulum sihirbazı çalışırken var olur ve site kurulduğunda kaybolur — ona nadiren ihtiyacınız olur.

::: tip Yalnızca göreli yollar bildirin
Bir `Path` içine asla `/api`, `/v1`, `/panel` ya da eklenti kimliğini yazmayın. Pano uç noktayı `/api/plugins/<pluginId>/...` altına, sınıf `PanelApi` ise `/api/plugins/<pluginId>/panel/...` altına bağlar. `/api` ya da `/panel` ile başlayan, boş olan ya da parametreyle (veya `_` ile) başlayan bir yol, eklentinizi sınıfı adlandıran bir iletiyle başlangıçta durdurur. Bkz. [Göreli uç nokta yolları](/tr/addon/api-reference/#relative-endpoint-paths).
:::

### Bir isteği işleme (`Api` üyeleri)

| Üye | İmza | Amaç |
|---|---|---|
| `handle` | `abstract suspend fun handle(context: RoutingContext): Result?` | Endpoint gövdeniz — başarıda `Successful(...)` döndürün; başarısız olmak için bir `Error` **fırlatın** (aşağıya bakın), döndürmeyin. (`null` döndürmek normal yoldan hiçbir şey geri göndermez — bunu yalnızca yanıtı kendiniz yazdıysanız yapın.) |
| `getSqlClient` | `suspend fun getSqlClient(): SqlClient` | Paylaşılan SQL istemcisi |
| `getParameters` | `fun getParameters(context): RequestParameters` | Doğrulanmış gövde/sorgu/yol parametreleri |
| `checkSetup` | `fun checkSetup()` | Kurulum yapılmadıysa `InstallationRequired` fırlat |
| `isAllowedInDemo` | `open fun isAllowedInDemo(method: HttpMethod): Boolean` | Örnek demo modunda çalışırken yazmaları kapıla |

### Sonuçlar ve hatalar

| Şey | İmza | Amaç |
|---|---|---|
| `Successful` | `Successful(responseMap: Map<String, Any?> = mapOf())` | Başarı → `{…map…}` |
| `InvalidFields` | `InvalidFields(mapOf("email" to "EXISTS"))` | Alan düzeyinde hatalar → `{"error":{"code":"INVALID_FIELDS","fields":{"email":"EXISTS"}}}` |
| `Error` alt sınıfları | `throw NotFound()` / `BadRequest()` / … | `com.panomc.platform.error`'da 130'dan fazla önceden tanımlı (`NotFound`, `BadRequest`, `NoPermission`, `NotLoggedIn`, `InternalServerError`, …) |
| Özel hata | `class SlugTaken : Error("SLUG_TAKEN", 409)` | Kodu (`^[A-Z][A-Z0-9_]*$`) ve durumu siz bildirirsiniz; istemci `{"error":{"code":"SLUG_TAKEN"}}` alır |

Bir isteği başarısız kılmak için bir `Error` (Pano'nun `com.panomc.platform.model.Error`'ı, Kotlin'in yerleşik `Error`'ı **değil**) **fırlatırsınız** — onu döndürmezsiniz. Doğrulama hataları sizin için `BadRequest`'e dönüştürülür.

### Dosya yüklemeleri — özel `bodyHandler()`

Çok parçalı yüklemeleri kabul etmek için `bodyHandler()`'ı geçersiz kılın ve `Bodies.multipartFormData` ile doğrulayın. Aşağıdaki parçacıkta, `FILE_UPLOAD_SIZE` *sizin* tanımladığınız bir sabittir — bayt cinsinden maksimum yükleme boyutu, örn. `private const val FILE_UPLOAD_SIZE = 5 * 1024 * 1024`. Desen (bkz. `pano-plugin-slider` `PanelAddSliderItemAPI`):

```kotlin
override fun bodyHandler(): Handler<RoutingContext> =
    BodyHandler.create()
        .setDeleteUploadedFilesOnEnd(true)
        .setBodyLimit(FILE_UPLOAD_SIZE)

override fun getValidationHandler(schemaRepository: SchemaRepository): ValidationHandler =
    ValidationHandlerBuilder.create(schemaRepository)
        .body(Bodies.multipartFormData(objectSchema().property("title", stringSchema())))
        .predicate(RequestPredicate.MULTIPART)
        .build()
// uploaded files: context.fileUploads()
```

## 4. Veritabanı

Her veritabanı tablosu **üç küçük dosya** gerektirir (artı isteğe bağlı migration'lar):

- `Shout.kt` — satırın kendisi, `DBEntity`'yi genişleten bir sınıf.
- `ShoutDao.kt` — sorguları *bildiren* bir soyut sınıf. **Endpoint'lere enjekte ettiğiniz tür budur.**
- `ShoutDaoImpl.kt` — gerçek SQL'i tutan `@Dao` sınıfı.

Bu ayrım, endpoint'lerinizin düz `ShoutDao` türüne bağımlı olmasına izin verirken Pano çalışma zamanında SQL taşıyan `ShoutDaoImpl`'i sağlar. [Backend Geliştirme](/tr/addon/backend/) eğitimi baştan sona bir tane oluşturur.

*Source: `com.panomc.platform.db` (`Dao`, `DBEntity`, `DatabaseMigration`), `com.panomc.platform.api.PluginDatabaseManager`*

| Tür | İmza | Amaç |
|---|---|---|
| `DBEntity` | `abstract class` (statik `gson`'a sahip) | Bir satır modeli için temel sınıf — `class Shout(...) : DBEntity()` yazın. Dikkat: `@Dao`'nun aksine, bunu açıklamayla işaretlemezsiniz, *genişletirsiniz* |
| `@Ignore` | alan açıklaması | Bir model alanını sütun eşlemesinin dışında tut |
| `Dao<T : DBEntity>` | `abstract class Dao<T>(entityClass: Class<T>)` | Temel DAO |
| `Dao.init` | `abstract suspend fun init(sqlClient: SqlClient)` | Buraya `CREATE TABLE IF NOT EXISTS …` |
| `Dao.uninstall` | `open suspend fun uninstall(sqlClient: SqlClient)` | `DROP TABLE …` (isteğe bağlı) |
| `Dao.fields` | `open val fields: List<String>` | Sorgu oluşturma için sütun adları |
| `Dao.tableName` | `protected val tableName` | Entity sınıfı adınızdan otomatik türetilir (`ShoutItem` → `shout_item`); salt okunur — onu ayarlamazsınız |
| `Dao.getTablePrefix` | `fun getTablePrefix(): String` | Örneğin tablo öneki |
| `Row.toEntity()` | uzantı | Bir satır → modeliniz (Gson aracılığıyla). `Dao`'nun içinde tanımlıdır, bu yüzden yalnızca DAO sınıfınızın içinde çalışır — bir sonuç satırında `row.toEntity()` çağırın |
| `RowSet.toEntities()` | uzantı | Birçok satır → `List<T>`. Aynı fikir: bir sorgu sonucunda `rows.toEntities()` çağırın |
| `List<String>.toTableQuery()` | uzantı | Ters tırnaklı sütun listesi |
| `DatabaseMigration` | `DatabaseMigration(from: Int, to: Int, info: String)` | Bir şema adımı; `val handlers: List<suspend (SqlClient) -> Unit>`'i geçersiz kılın |
| `PluginDatabaseManager.initialize` | `suspend fun initialize(plugin: PanoPlugin)` | Tabloları oluştur + bekleyen migration'ları çalıştır |
| `PluginDatabaseManager.uninstall` | `suspend fun uninstall(plugin: PanoPlugin)` | Her DAO'nun `uninstall()`'ını çalıştır |

**Sorgu sonuçlarını beklemek (`coAwait`).** Her Vert.x veritabanı çağrısı bir **Future** döndürür — henüz hazır olmayan bir sonuç. Bir `suspend` fonksiyonunun içinde onu beklemek ve değeri almak için `.coAwait()` eklersiniz:

```kotlin
// import io.vertx.kotlin.coroutines.coAwait
val rows = sqlClient.query("SELECT * FROM `shout`").execute().coAwait()
```

**Pano'nun kendi** tablolarına karşı ham SQL (eklentinizinkine değil) host `DatabaseManager` üzerinden gider — `databaseManager.getSqlClient()`, artı `userDao` gibi çekirdek DAO'lar.

**Tam bir migration.** Bir `@Migration` sınıfı şemayı bir sürüm yükseltir ve değişiklik başına bir işleyici listeler. Her işleyici `ALTER TABLE`'ınızı (veya benzerini) çalıştırır:

```kotlin
// import com.panomc.platform.annotation.Migration, com.panomc.platform.db.DatabaseMigration
@Migration
class ShoutMigration1to2(
    private val shoutDao: ShoutDao
) : DatabaseMigration(1, 2, "Add color column to shout table") {
    override val handlers: List<suspend (SqlClient) -> Unit> = listOf(
        { sqlClient: SqlClient ->
            val query = "ALTER TABLE `${shoutDao.getTablePrefix() + "shout"}` ADD COLUMN `color` VARCHAR(7) NOT NULL DEFAULT '#000000'"
            sqlClient.query(query).execute().coAwait()
        }
    )
}
```

::: warning `onUninstall` tablolarınızı düşürür
`pluginDatabaseManager.uninstall(this)`, **her DAO'nun `uninstall()`'ını** çalıştırır — bu panel **Sil** eylemidir, **Devre dışı bırak** değil. Devre dışı bırakmak veriyi tutar.
:::

Tam, derlenen bir sorgu için — bir DAO içine yazılmış gerçek bir `SELECT` ve `INSERT` — eğitimin [Veritabanı ve Migration'lar](/tr/addon/database/#uygulama-impl) sayfasını izleyin.

## 5. Yapılandırma

`PluginConfig`'i genişleten bir yapılandırma sınıfı, eklentiniz ilk çalıştığında `plugins/<pluginId>/config.conf`'a (HOCON — yorumlara izin veren, insan dostu bir JSON çeşidi) yazılır ve normal bir Kotlin nesnesi olarak geri okunur — dize aramaları değil, `config.apiKey` yazarsınız.

*Source: `com.panomc.platform.api.config` (`PluginConfig`, `PluginConfigManager`, `PluginConfigMigration`, `ConfigComment`, `ConfigSection`)*

| Tür | İmza | Amaç |
|---|---|---|
| `PluginConfig` | `open class PluginConfig` (`version: Int`'e sahip) | Yapılandırmanız için temel; kendi alanlarınızı varsayılanlarla ekleyin |
| `PluginConfigManager<T>` | `PluginConfigManager(plugin, T::class.java)` | Bir yapılandırma sınıfı için dosyayı yükler/kaydeder |
| `.config` | `var config: T` (`private set`) | Mevcut türlü değerler |
| `.saveConfig` | `fun saveConfig(config: JsonObject)` | Değişiklikleri diske kalıcı kıl |
| `.configFilePath` | `val configFilePath: String` | `config.conf`'un çözümlenen yolu |
| `PluginConfigMigration` | `PluginConfigMigration(from: Int, to: Int, versionInfo: String)` | `fun migrate(config: JsonObject)`'i geçersiz kılın; `@Migration` ile açıklama ekleyin |
| `@ConfigComment` | `@ConfigComment(vararg lines: String)` | Üretilen dosyada bir alanın üstünde doküman yorumu |
| `@ConfigSection` | `@ConfigSection(title: String)` | Anahtarları bir başlık altında grupla |

`.config` neden türlü bir `T` ama `.saveConfig` bir `JsonObject` alıyor? Okumak size kendi türlü sınıfınızı verir; kaydetmek ham bir `JsonObject` alır ve **tüm dosyayı ondan yeniden yazar** — dışarıda bıraktığınız bir anahtar dosyadan düşer ve varsayılan değerine döner. Bu yüzden mevcut yapılandırmadan başlayın ve gerekeni değiştirin:

```kotlin
val current = JsonObject.mapFrom(configManager.config)
configManager.saveConfig(current.put("apiKey", "new-value"))
```

Yöneticiyi `onStart()` sırasında kendi `pluginBeanContext`'inizde bir **singleton** (bir paylaşılan örnek) olarak kaydedin, sonra bir istek ona ihtiyaç duyduğunda tembel olarak getirin. İki satır şudur:

```kotlin
val configManager = PluginConfigManager(this, ShoutboxConfig::class.java)
pluginBeanContext.beanFactory.registerSingleton(PluginConfigManager::class.java.name, configManager)
```

::: tip Kontrol noktası
İlk başlangıçtan sonra, `plugins/<pluginId>/config.conf` diskte var olmalı ve varsayılan değerlerinizi tutmalı.
:::

## 6. Olay dinleyicileri

Çoğu olay dinleyicisi aynı şekilde çalışır. (1) Arayüzü uygulayın. (2) Sınıfı `@EventListener` ile açıklama yapın. (3) Olay tetiklendiğinde Pano metotlarınızı çağırır. Metotlar `suspend`'dir ve varsayılan olarak hiçbir şey yapmaz, bu yüzden yalnızca önemsediğiniz olanları geçersiz kılarsınız. İki dinleyici bu deseni bozar — tablonun altındaki uyarılara bakın.

*Source: `com.panomc.platform.api.event.*`*

| Arayüz | Metotlar (eklentiyle-ilgili) |
|---|---|
| `SetupEventListener` | `onSetupFinished()` |
| `RouterEventListener` | `onInitRouteList(routes: MutableList<Route>)`, `onRouterCreate(router: Router)` |
| `AuthEventListener` | `onBeforeAuthenticate(context, sqlClient): LoginDecision?`, `onBeforeVerifyLinkCode(context, sqlClient): LoginDecision?`, `onBeforeLogin(user, context, sqlClient): LoginDecision?`, `onAfterLogin(user, context, sqlClient)`, `onAfterRegister(user, sqlClient)` |
| `PlayerEventListener` | `onDelete(user: User)` — hesap-silme temizliği |
| `ProfilePictureEventListener` | `resolveProfilePictureUrl(user: User): String?` (varsayılan gövdesi yoktur — uygulamanız gerekir) |
| `PluginLifecycleListener` | `onPluginLoad/Enable/Disable/Unload/Uninstall(plugin: PanoPlugin)` |
| `PluginEventListener` | Kendi eklentiler-arası olaylarınız için işaretleyici |

**`AuthEventListener` metotları** (yukarıdaki kalabalık satır, her biri bir satırda):

- `onBeforeAuthenticate(context, sqlClient): LoginDecision?`
- `onBeforeVerifyLinkCode(context, sqlClient): LoginDecision?`
- `onBeforeLogin(user, context, sqlClient): LoginDecision?`
- `onAfterLogin(user, context, sqlClient)`
- `onAfterRegister(user, sqlClient)`

`onBeforeLogin` ve arkadaşları bir `LoginDecision` döndürür: `Deny(errorKey, extras)`, `RequireUsername(userId)` veya `Allow`. (`errorKey` = bir çeviri anahtarı — kullanıcıya gösterilen çevrilmiş bir mesajın id'si; [Çeviriler](/tr/addon/localization/)'e bakın.)

Bir dinleyiciyi kaydetmenin iki yolu: paketinizde bir `@EventListener` sınıfı (**sabit** — eklenti yüklendiğinde bir kez keşfedilir) veya **eklenti çalışırken** dinleyici eklemek ve kaldırmak için `plugin.register(listener)` / `plugin.unRegister(listener)`.

::: warning İstisna 1 — `RouterEventListener` `suspend` değildir
Diğerlerinin aksine, `RouterEventListener`'ın `onInitRouteList` ve `onRouterCreate`'i düz (`suspend` olmayan) **soyut** fonksiyonlardır. İkisini de uygulamak *zorundasınız* ve içlerinde `suspend` fonksiyonlarını doğrudan çağıramazsınız.
:::

::: warning İstisna 2 — `PluginLifecycleListener`'ın `@EventListener`'ı yoktur
`PluginLifecycleListener`, `EventListener` işaretleyicisini genişletmez, bu yüzden onu `@EventListener` ile açıklama yapmak yararlı hiçbir şey yapmaz — asla tetiklenmez, *ve* host'un dahili `as EventListener` dönüşümünü bozar, eklentiniz başlatılırken bir `ClassCastException` fırlatır. Onun yerine açıkça kaydedin:

```kotlin
applicationContext.getBean(PluginManager::class.java).addLifecycleListener(listener)
```
:::

::: tip Eklentiler-arası olaylar (ileri düzey)
*Diğer* eklentilerin, eklentinizin yaptığı bir şeye tepki vermesine izin vermek için: `PluginEventListener`'ı genişleten bir arayüz tanımlayın, eklentinizi başkalarının bulabilmesi için paylaşın, sonra her aboneye tetikleyin. `getEventListeners`'ın bir **companion-object** fonksiyonu olduğuna dikkat edin (bir örneğe değil, sınıfın kendisine ait bir fonksiyon), bu yüzden onu enjekte edilen `pluginEventManager` üzerinde değil, `PluginEventManager.getEventListeners<...>()` olarak çağırırsınız.

```kotlin
// Your addon (firing side): share yourself, then notify every subscriber
registerSingletonGlobal(this)
PluginEventManager.getEventListeners<ShoutCreatedListener>()
    .forEach { it.onShoutCreated(shout) }

// Another addon (listening side): implement the shared interface + annotate it
@EventListener
class MyShoutListener : ShoutCreatedListener {
    override suspend fun onShoutCreated(shout: Shout) { /* … */ }
}
```
:::

## 7. İzinler ve kimlik doğrulama

Bir **izin düğümü**, bir izni adlandıran noktalı bir dizedir (`pano.plugin.x.manage` gibi). Yöneticiler panelde kullanıcı gruplarına düğümler verir; kodunuz sonra mevcut kullanıcının bir düğüme sahip olup olmadığını kontrol eder.

*Source: `com.panomc.platform.auth` (`Permission`, `PanelPermission`, `AuthProvider`)*

| Tür | İmza | Ürettiği düğüm |
|---|---|---|
| `Permission` | `open class Permission(iconName: String = "")` | `pano.<key>` |
| `PanelPermission` | `open class PanelPermission(iconName: String = "")` | `pano.plugin.<pluginId>.<dotted.key>` |
| `@PermissionDefinition` | sınıf açıklaması | İzni otomatik kaydeder |

(`iconName` = panelde iznin yanında gösterilen bir Font Awesome ikon adı, örn. `"fa-bullhorn"` veya `"fa-comments"`.)

Düğüm sınıf adından otomatik türetilir. Önce örnek:

`ManageShoutboxPermission` → `pano.plugin.pano-plugin-shoutbox.manage.shoutbox`

Kural: sondaki `Permission`'ı bırakın, kalan kelimeleri bölün, küçük harf yapın, noktalarla birleştirin ve (bir plugin `PanelPermission`'ı için) `pano.plugin.<pluginId>.` önekini ekleyin. Panel sayfalarını ve gezinme bağlantılarını koruma (gösterme/gizleme) için bu tam dizeyi frontend kodunuzda tekrarlarsınız — [Arayüz API Referansı](/tr/addon/api-reference/)'na bakın.

**`AuthProvider`** (`getBean` aracılığıyla host bean'i):

| Metot | İmza | Amaç |
|---|---|---|
| `requirePermission` | `suspend fun requirePermission(permission: Permission, context: RoutingContext)` | Kullanıcı ona sahip değilse fırlat |
| `hasPermission` | `suspend fun hasPermission(permission: Permission, context: RoutingContext): Boolean` | Fırlatmayan kontrol |
| `isLoggedIn` | `suspend fun isLoggedIn(context: RoutingContext): Boolean` | — |
| `hasAccessPanel` | `suspend fun hasAccessPanel(context: RoutingContext): Boolean` | Herhangi bir panel erişimi |
| `getUserIdFromRoutingContext` | `fun getUserIdFromRoutingContext(context: RoutingContext): Long` | Mevcut kullanıcı id'si |
| `requirePassword` | `suspend fun requirePassword(password: String?, context: RoutingContext)` | Yeniden-kimlik doğrulama (yanlışsa fırlatır) |
| `isUserAdmin` | `suspend fun isUserAdmin(userId: Long): Boolean` | — |

## 8. Minecraft sunucu iletişimi

Site sahibi Minecraft sunucusunda tamamlayıcı `pano-mc-plugin`'i çalıştırırsa, o eklenti Pano'ya **şifreli bir WebSocket** bağlantısı açık tutar (bir WebSocket = normal bir tek seferlik HTTP isteğinin aksine, iki yönlü, her zaman açık bir ağ bağlantısı; Pano üzerindeki her mesajı AES-256-GCM ile şifreler). `ServerManager`, o bağlantı üzerindeki tutamacınızdır: *gelen* mesajlar için işleyiciler kaydedin ve mesajları *dışarı* gönderin (bkz. `pano-plugin-premium-login`). Bağlı bir sunucu yoksa, konuşulacak bir şey de yoktur.

*Source: `com.panomc.platform.server` (`ServerManager`, `ServerEvent`, `PlatformMessage`)*

| Üye | İmza | Amaç |
|---|---|---|
| `ServerManager.registerEvent` | `fun registerEvent(event: ServerEvent<*, *>)` | Bir gelen olay türünü işle |
| `ServerManager.unregisterEvent` | `fun unregisterEvent(event: ServerEvent<*, *>)` | Onu işlemeyi durdur |
| `ServerManager.sendMessage` | `fun sendMessage(platformMessage: PlatformMessage, server: Server)` | Bir sunucuya gönder-ve-unut |
| `ServerManager.getConnectedServers` | `fun getConnectedServers(): Map<Server, ServerWebSocket>` | Şu anda bağlı sunucular (anahtar = `Server`, değer = canlı WebSocket'i) |
| `ServerManager.isConnected` | `fun isConnected(id: Long): Boolean` | — |
| `ServerEvent<R, M>` | `abstract suspend fun handle(request: R, server: Server): M?` | Gelen olay işleyicisi (R = aldığınız istek yükü, M = isteğe bağlı yanıt verdiğiniz mesaj türü; `M?` yanıtın isteğe bağlı olduğu anlamına gelir) |
| `PlatformMessage` | `interface` | Giden mesaj şekli |

(Yukarıdaki satırlardaki `ServerEvent<*, *>` yalnızca "herhangi bir istek/yanıt türünün bir `ServerEvent`'i" anlamına gelir.)

**Kablo adları** sınıf adından türetilir: bir `ServerEvent` `Event` sonekini soyar, bir `PlatformMessage` `Message`'ı soyar, sonra ikisi de `UPPER_SNAKE`'e dönüşür (`getEventName()` / `getResponseName()`). Yani `PlayerJoinEvent` ⇄ kablo adı `PLAYER_JOIN`.

## 9. Jetonlar

Buradaki bir **jeton**, **JWT** formatında imzalı bir dizedir: herkes içindekini okuyabilir, ama onu yalnızca sunucu üretebilirdi, bu yüzden taklit edilemez. Jetonları sihirli-giriş bağlantıları ve tek seferlik eylemler için kullanın. Jeton *türünüzü* host'a kaydedin, böylece eklentiniz kaldırıldığında otomatik olarak kaydı silinir (bkz. `pano-plugin-auth-guard` `MagicLoginTokenType`).

*Source: `com.panomc.platform.token` (`TokenType`, `TokenTypeRegistry`, `TokenProvider`)*

| Üye | İmza | Amaç |
|---|---|---|
| `TokenType` | `interface` — `getName(): String`, `getExpireDate(): Long` (epoch milis olarak son kullanma) | Jeton türünüz (ad sınıf adı eksi `TokenType`'tan varsayılan alınır, `UPPER_SNAKE`) |
| `TokenTypeRegistry.registerPluginToken` | `fun registerPluginToken(pluginId: String, tokenType: TokenType)` | Kaydet (kaldırmada otomatik silinir) |
| `TokenProvider.generateToken` | `fun generateToken(subject: String, tokenType: TokenType, claims: Map<String, String> = emptyMap()): Pair<String, Long>` | `(tokenString, expiresAtEpochMillis)` döndürür — imzalı jeton ve ne zaman sona erdiği (epoch milisaniye) |
| `TokenProvider.saveToken` | `suspend fun saveToken(token: String, subject: String, tokenType: TokenType, expireDate: Long, sqlClient: SqlClient, ipAddress: String? = null, userAgent: String? = null)` | Onu kalıcı kıl |
| `TokenProvider.isTokenValid` | `suspend fun isTokenValid(token: String, tokenType: TokenType, sqlClient: SqlClient): Boolean` | — |
| `TokenProvider.invalidateToken` | `suspend fun invalidateToken(token: String, sqlClient: SqlClient)` | Birini iptal et |
| `TokenProvider.invalidateTokensBySubjectAndType` | `suspend fun invalidateTokensBySubjectAndType(subject: String, type: TokenType, sqlClient: SqlClient)` | Bir subject'in bir türdeki jetonlarını iptal et |
| `TokenProvider.parseToken` | `fun parseToken(token: String): DecodedJWT` | Claim'leri çöz |

## 10. Bildirimler ve posta

*Source: `com.panomc.platform.notification` (`NotificationManager`, `UserNotificationType`, `PanelUserNotificationType`), `com.panomc.platform.mail` (`MailManager`, `TemplateMail`, `Mail`)*

**Bildirimler** temadaki ve panel üst çubuğundaki zil simgesi altında görünür. `UserNotificationType` veya `PanelUserNotificationType`'ı alt sınıflayın, `@NotificationDefinition` ile açıklama yapın, sonra `NotificationManager` aracılığıyla gönderin:

| Metot | Kime gönderir |
|---|---|
| `sendNotification(…)` | Bir kullanıcı |
| `sendPanelNotification(…)` | Bir kullanıcının paneli |
| `sendNotificationToAll(…)` | Bir kullanıcı listesi (`userIdList`) |
| `sendPanelNotificationToAll(…)` | Bir kullanıcı listesinin panelleri (`userIdList`) |
| `sendNotificationToAllAdmins(…)` | Tüm yöneticiler |
| `sendNotificationToAllWithPermission(…)` | Bir izne sahip herkes |

Yaygın olan, tam hâliyle: `suspend fun sendNotification(userId: Long, userNotificationType: UserNotificationType, sqlClient: SqlClient)`. Diğer beşi aynı şekli izler (bkz. `NotificationManager`, kaynak satır 33'ten).

**Posta** — `MailManager` ile bir `TemplateMail` gönderin. Metinleri Kotlin'de de `locales/*.json`'da da değildir: her
dilin jar'ınızda kendi Handlebars dosyası vardır ve yöneticiler bunları **Ayarlar → E-posta şablonları**'ndan yeniden
yazabilir (bkz. [E-posta Şablonları](/tr/platform/configuration/mail-templates/)). Ortak düzeni (logo, kart, buton,
alt bilgi) Pano ekler.

*1. Varsayılanları paketleyin:* `src/main/resources/mail-templates/` altında, her e-posta × varyant × dil için bir dosya:

```text
mail-templates/
  index.json
  magic-login/default/en-US.hbs     # <key>/<variant>/<locale>.hbs
  magic-login/default/tr.hbs
  magic-login/default/ru.hbs
```

`index.json` e-postalarınızı panele tanıtır. Anahtarlar ve varyant anahtarları `[a-z0-9-]+` biçimindedir; alt türü
olmayan bir e-postanın tek varyantı `default`'tur. Adlar ve etiketler dil başınadır ve `en-US`'e düşer:

```json
{
  "mails": [{
    "key": "magic-login",
    "name": { "en-US": "Magic login link", "tr": "Sihirli giriş bağlantısı", "ru": "Ссылка для входа" },
    "description": { "en-US": "Sent when a visitor asks for a sign-in link." },
    "variants": [{
      "key": "default",
      "name": { "en-US": "Default", "tr": "Varsayılan", "ru": "По умолчанию" },
      "variables": [
        { "name": "username", "type": "text", "label": { "en-US": "Username" }, "sample": "Steve" },
        { "name": "magicLoginLink", "type": "url", "label": { "en-US": "Sign-in link" }, "sample": "https://example.com/auth-guard/magic-login?token=abc" }
      ]
    }]
  }]
}
```

::: v-pre

*Düzenler (isteğe bağlı).* Bir e-posta, aksi belirtilmedikçe Pano'nun ana düzenine yerleştirilir: `index.json` içinde
e-postaya `"layout"` ekleyin — başka bir düzen kimliği ya da `"none"`. Bir eklenti kendi düzenlerini getirebilir:
bunları `"layouts"` altında listeleyin ve her birini `mail-templates/layouts/<key>.hbs` dosyasına koyun; kimliği
`<pluginId>:<key>` olur. Bir düzen `{{{content}}}` içermek zorundadır ve ana düzenle aynı yuvaları kullanabilir
(`subject`, `preheader`, `buttonLabel`, `buttonUrl`, `footer`, `websiteName`, `websiteUrl`, `websiteLogo`, `year`,
`locale`). Yöneticiler düzenlerinizi düzenleyip sıfırlayabilir ve e-posta başına başka bir düzen seçebilir, ama
silemez.

```json
{
  "layouts": [{ "key": "plain", "name": { "en-US": "Plain", "tr": "Sade", "ru": "Простой" } }],
  "mails": [{ "key": "magic-login", "layout": "pano-plugin-auth-guard:plain", "...": "..." }]
}
```

:::

*2. Her `<locale>.hbs` dosyasını yazın:* `---` satırları arasında tek satırlık `anahtar: değer` çiftlerinden oluşan bir
başlık (değerler olduğu gibi alınır, tırnak yok), ardından HTML parçası olarak gövde:

```handlebars
---
subject: {{websiteName}} — giriş bağlantın
preheader: Tek tıkla içeridesin
buttonLabel: Giriş yap
buttonUrl: {{magicLoginLink}}
footer: Bu bağlantıyı sen istemediysen bu e-postayı yok sayabilirsin. Bağlantı 15 dakika geçerlidir.
---
<p>Merhaba <strong>{{username}}</strong>,</p>
<p>{{websiteName}} sitesine şifresiz giriş yapmak için aşağıdaki butonu kullan.</p>
```

Başlık anahtarları: `subject` (zorunlu), `preheader`, `buttonLabel`, `buttonUrl`, `footer` ve `mode` — `fields`
(varsayılan) ya da `html`; ikincisinde gövde, düzen olmadan gönderilen eksiksiz bir HTML belgesidir. Her alan bir
[Handlebars](https://handlebarsjs.com/guide/) şablonudur; yalnızca yerleşik yardımcılar (`if`, `unless`, `each`, `with`,
`lookup`) kullanılabilir.

::: v-pre

| Değişken `type` | Kullanımı |
|---|---|
| `text`, `url`, `number` | `{{name}}` (kaçışlı) |
| `boolean` | `{{#if name}}…{{/if}}` |
| `html` | `{{{name}}}` — **sizin kodunuzun** ürettiği hazır, güvenli bir HTML bloğu (ürün tablosu, adres); kullanıcı girdisi asla olduğu gibi konmaz |

Sistem değişkenleri tanımlanmadan kullanılabilir: `{{websiteName}}`, `{{websiteUrl}}`, `{{websiteLogo}}` (`cid:logo`),
`{{year}}`, `{{locale}}`.

:::

*3. Gönderin:*

| Üye | İmza | Amaç |
|---|---|---|
| `TemplateMail.of` | `fun of(owner: String, key: String, variant: String = "default", variables: Map<String, Any?> = emptyMap())` | Değişkenleri elinizde olan bir e-posta |
| `TemplateMail.variables` | `open suspend fun variables(locale: String, system: SystemParameters): Map<String, Any?>` | Bir değer dile ya da bir ön yüz bağlantısına (`system.linkTo(…)`) ihtiyaç duyuyorsa alt sınıfta ezin |
| `MailManager.sendTemplate` | `suspend fun sendTemplate(sqlClient, userId: Long?, mail: TemplateMail, options: MailOptions = MailOptions()): MailResult` | Render + gönder; e-posta kapalıysa `DISABLED` |
| `MailManager.sendRequiredTemplate` | `suspend fun sendRequiredTemplate(sqlClient, userId: Long?, mail: TemplateMail, options: MailOptions = MailOptions())` | Aynısı, ama gitmeyen e-posta hata fırlatır (`MailDisabled`, `PanoMailUnavailable`, `PanoMailConnectRequired`) |

```kotlin
class MagicLoginMail(pluginId: String, private val token: String, private val username: String) :
    TemplateMail(pluginId, "magic-login") {
    override suspend fun variables(locale: String, system: MailManager.Companion.SystemParameters) = mapOf(
        "username" to username,
        "magicLoginLink" to system.linkTo("auth-guard.magic-login", mapOf("token" to token), "/auth-guard/magic-login?token=$token")
    )
}

mailManager.sendTemplate(sqlClient, userId, MagicLoginMail(pluginId, token, username))
```

`owner` eklenti kimliğinizdir (`PanoPlugin.pluginId`). Alıcı ve dil eskisi gibi seçilir (`MailOptions.email` /
`locale`, yoksa kullanıcınınki, yoksa sitenin); metin sonra ana dile ve `en-US`'e düşer, bir yöneticinin düzenlemesi de
dosyanızın önüne geçer. `MailOptions.subject` ve `text` hâlâ konuyu ve düz metin kısmını ezer. **Geliştirme Modu**'nda,
eklentiniz çalışan Pano'nun `plugins/<pluginId>/` klasörüne klonlanmışsa ([yerel ayarlarda](/tr/addon/localization/)
olduğu gibi), paketlenen `.hbs` dosyaları kaynak klasörünüzden okunur; bir değişiklik yeniden derlemeden bir sonraki
gönderimde görünür.

::: warning `Mail` kullanımdan kaldırıldı
Eski `Mail` arayüzü (`templatePath`, `subject`, `generateParameters`) ve iki `sendMail` aşırı yüklemesi hâlâ çalışır;
yayımlanmış eklentiler çalışmaya devam eder. Ama `@Deprecated` olarak işaretlidir: e-postaları panelden düzenlenemez.
`TemplateMail`'e geçin ve `mail.*` anahtarlarını yerel ayar dosyalarınızdan kaldırın.
:::

## 11. Konsol komutları

Pano'nun etkileşimli bir **konsolu** vardır — platform jar'ının çalıştığı terminal penceresi. `@Command` metotları ona kendi komutlarınızı eklemenizi sağlar. Metotları `@Command` ile açıklama yapın, sonra onları tutan nesneyi kaydedin.

*Source: `com.panomc.platform.command` (`Command`, `CommandSender`)*

| Üye | İmza | Amaç |
|---|---|---|
| `@Command` | `@Command(name, aliases = [], description = "", usage = "")` | Bir komut metodunu işaretler |
| metot şekli | `(sender: CommandSender)` veya `(sender: CommandSender, args: Array<String>)` | İşleyici |
| `PanoPlugin.registerCommands` | `fun registerCommands(obj: Any)` | `obj` üzerindeki tüm `@Command` metotlarını kaydet |
| `PanoPlugin.unRegisterCommands` | `fun unRegisterCommands(obj: Any)` | Onları kaldır |
| `CommandSender.sendMessage` | `fun sendMessage(message: String)` | Çağırana yanıt ver |

::: tip Kontrol noktası
Kaydettikten sonra, konsolda `help` yazın — komutunuzun adı ve açıklaması listelenmeli.
:::

## 12. Etkinlik günlükleri

Yönetici eylemlerini kaydedin, böylece panelin Etkinlik akışında görünürler. `PluginActivityLog`'u alt sınıflayın ve host `DatabaseManager` aracılığıyla ekleyin.

*Source: `com.panomc.platform.db.model.PluginActivityLog`*

| Üye | İmza | Amaç |
|---|---|---|
| `PluginActivityLog` | `open class PluginActivityLog(userId: Long, pluginId: String, details: JsonObject = JsonObject())` | Günlük girdiniz |
| ekleme | `databaseManager.panelActivityLogDao.add(log, sqlClient)` | Onu yaz |

Bir endpoint içinde, onu şöyle bağlayın — SQL istemcisini alın, host `DatabaseManager`'ı alın, sonra günlüğünüzü ekleyin:

```kotlin
// `plugin` is your plugin class, taken as a constructor parameter of the endpoint
val sqlClient = getSqlClient()
val databaseManager = plugin.applicationContext.getBean(DatabaseManager::class.java)
databaseManager.panelActivityLogDao.add(CreatedShoutLog(userId, username, plugin.pluginId, message), sqlClient)
```

::: tip Kontrol noktası
Girdi artık panelin **Kayıtlar** sayfasında (*Aktivite Kayıtları*) görünüyor.
:::

Panel her girdiyi, bir `activity-logs` nesnesi altında sınıf adından türetilen bir dil anahtarıyla render eder (eksi `Log`, `UPPER_SNAKE`) — `CreatedShoutLog` → `activity-logs.CREATED_SHOUT`. Geçtiğiniz `details` `JsonObject`'indeki her anahtar, o dil dizesindeki eşleşen `{placeholder}`'a yerleştirilir. [Çeviriler](/tr/addon/localization/)'e bakın.

## 13. Host bean'leri

Pano'nun kendi servisleri, host `applicationContext`'te yaşayan **bean**'lerdir (çerçevenin bir kez oluşturup paylaştığı nesneler). Onların herhangi birini `applicationContext.getBean(SomeService::class.java)` ile getirin. Kurucularınıza enjekte **edilmezler** — onları her zaman elle getirirsiniz (ideal olarak `by lazy`, §1'e bakın).

::: details Spring uygulama ayrıntısı (atlamak güvenli)
Aşağıdaki bean'lerin çoğu (`DatabaseManager`, `PluginDatabaseManager`, `SetupManager`, `AuthProvider`, `ServerManager`, `TokenProvider`, `NotificationManager`, `MailManager`, `LicenseManager`, `ConfigManager`, `PluginManager`) `@Component` sınıflarıdır — ve `TokenTypeRegistry` bir `@Service` — `@ComponentScan("com.panomc.platform")` tarafından keşfedilir; yalnızca altyapı bean'leri (`Vertx`, `Router`, `WebClient`, `Gson`, `SchemaRepository`, artı logger, şablon motoru, `HttpClient`, `PluginUiManager` ve `PluginEventManager`) `com.panomc.platform.SpringConfig`'te `@Bean` ile bildirilir. Onları *kullanmak* için bunların hiçbirine ihtiyacınız yok — `getBean(...)` her iki şekilde de aynı çalışır.
:::

| Bean | Ne için kullanın |
|---|---|
| `DatabaseManager` | Paylaşılan SQL istemcisi, çekirdek DAO'lar, `panelActivityLogDao` |
| `PluginDatabaseManager` | Tablolarınız ve migration'larınız |
| `SetupManager` | `isSetupDone()` — onu önce çağırın ve `true` döndürene kadar veritabanı erişimini atlayın (bu, §1'deki "kurulumu kapıla") |
| `AuthProvider` | İzin ve giriş kontrolleri |
| `ServerManager` | Minecraft sunucu iletişimleri |
| `TokenProvider` / `TokenTypeRegistry` | Jetonlar |
| `NotificationManager` | Bildirimler |
| `MailManager` | E-posta |
| `LicenseManager` | Premium lisans getirme |
| `ConfigManager` | Host (platform) yapılandırması |
| `Vertx` | Zamanlayıcılar, olay veri yolu |
| `WebClient` | Giden HTTP |
| `Gson` | JSON (paylaşılan örnek) |
| `Router` | Vert.x web yönlendiricisi |
| `SchemaRepository` | Doğrulama şemaları |
| `PluginManager` | Eklenti kayıt defteri |

## 14. Lisans (premium eklentiler)

Premium eklentiler imzalı bir lisansı derleme zamanlı bir genel anahtara karşı doğrular. Pano lisans dosyasını yalnızca sizin için *indirir* — onu **kontrol etmez**; eklentiniz imzayı kendisi doğrulamalıdır. Bu bir özettir — tam bağlantı, kopyalanan `PluginLicenseClient`/`LicenseGuard` ve hata davranışı [Premium Eklentiler ve Lisanslama](/tr/addon/premium/)'da kapsanır.

*Source: `com.panomc.platform.license` (`LicenseManager`, `SignedLicense`, `LicenseClaims`, `LicenseRequiredException`)*

| Üye | İmza | Amaç |
|---|---|---|
| `PanoPlugin.getLicenseManager` | `(): LicenseManager` | JWT'yi getiren host servisi |
| `LicenseManager.requireLicense` | `(plugin, resourceId, version)` | Eklentiniz için (önbelleğe alınmış) lisansı getir |
| `SignedLicense.verifySignature` | `(publicKey, expectedIssuer)` | Jar'ınızın içinde gönderdiğiniz genel anahtarı kullanarak imzayı kontrol et (RS256 = bir genel/özel anahtar imza şeması) |
| `LicenseClaims` | `issuer, platformId, resourceId, userId, version, jarSha256, issuedAtMs, expiresAtMs, keyId, tokenId` | Çapraz kontrol için ayrıştırılmış claim'ler |
| `LicenseRequiredException` | `(pluginId, reason, message, cause)` | Bunu `onStart()`'tan fırlatın, böylece eklenti geçerli bir lisans olmadan başlamayı reddeder (yine de başlatmaktan daha güvenli) |

## 15. Çeşitli ve desenler

Küçük yardımcı araçlar ve tek API olmayan ama adlandırılmayı hak eden iki yinelenen deyim.

| Şey | Nerede | Amaç |
|---|---|---|
| Jar kaynağı okuma | sınıf yükleyiciniz | Jar'ınızın içine paketlediğiniz dosyalar (anahtarlar, veri dosyaları) `javaClass.classLoader.getResourceAsStream(path)` ile okunur (bir *sınıf yükleyici*, jar'a paketlenmiş dosyaları okuyan şeydir). Not: `PanoPlugin`'in kendi `getResource` yardımcısı yoktur. Posta şablonları istisnadır: `mail-templates/` klasörünü Pano kendisi okur (§10) |
| `pluginDataFolder` | `PanoPlugin` | `plugins/<pluginId>/` diziniz (yüklemeler, `config.conf`) |
| `logger` | `PanoPlugin` | Sınıfa kapsamlanmış SLF4J logger |

**Arka plan işleri** — Vert.x ile zamanlayın ve bir `AtomicBoolean` ile çakışmaya karşı koruyun; `onStop()`/`onDisable()`'da iptal edin (bkz. `pano-plugin-market` `MarketPlugin`). Aşağıdaki parçacıkta, `setPeriodic`'in argümanı **milisaniye** cinsindendir, bu yüzden `60_000` her 60 saniye anlamına gelir; `AtomicBoolean` bayrağı önceki çalıştırma hâlâ devam ederken yeni bir çalıştırmanın başlamasını durdurur:

```kotlin
private var timerId: Long? = null
private val running = AtomicBoolean(false)

override suspend fun onStart() {
    timerId = vertx.setPeriodic(60_000) {
        if (!running.compareAndSet(false, true)) return@setPeriodic
        // …launch work, then running.set(false) in a finally…
    }
}

override suspend fun onDisable() {
    timerId?.let { vertx.cancelTimer(it) }
    timerId = null
}
```

Yorumlanan satır zor kısmı gizler — (`suspend` olmayan) zamanlayıcı geri çağrısından `suspend` işini başlatmak. Tam, derlenen sürüm için `pano-plugin-market` `MarketPlugin`'i okuyun.

**Gizli anahtarları maskeleme** — bir yapılandırma `GET` endpoint'i gizli alanları maskelenmiş (gizlenmiş) döndürmelidir. Gerçek değeri yalnızca önce yöneticinin şifresini yeniden kontrol eden *ayrı* bir endpoint aracılığıyla açığa çıkarın. O kontrolü yapmanın iki yolu:

- **Seçenek A:** `authProvider.requirePassword(password, context)` — bkz. `pano-plugin-auth-guard` `TwoFactorDisableAPI`.
- **Seçenek B:** manuel bir `databaseManager.userDao.isLoginCorrect(...)` kontrolü — bkz. `pano-plugin-social-login` `PanelRevealSecretAPI`.

## Sonraki adım

- **[Backend Geliştirme](/tr/addon/backend/)** — bu API'leri derlenen koda birleştiren işlenmiş Shoutbox eğitimi.
- **[Çeviriler](/tr/addon/localization/)** — izinler ve etkinlik günlükleri için dil anahtarları.
- **[Premium Eklentiler ve Lisanslama](/tr/addon/premium/)** — grup 14 için tam lisans-doğrulama bağlantısı.
- **[Arayüz API Referansı](/tr/addon/api-reference/)** — arayüz yarısı için `pano.*` ve `@panomc/sdk` yüzeyi.
