# Backend API Referansı

**Bu sayfa size ne verir:** eklentinizin kullanabileceği her backend sınıfı, fonksiyonu ve işaretlemesi, ne yapmaya çalıştığınıza göre sıralanmış. [Backend Geliştirme](/tr/addon/backend/) eğitiminin arama eşlikçisidir — eğitim, parçaları Shoutbox örneği üzerinde *nasıl* birbirine bağlayacağınızı gösterir; bu sayfa *neyin var olduğunu* listeler, böylece bir genişletme noktasını adıyla bulmak için asla platform kaynağını okumak zorunda kalmazsınız. (Bir *genişletme noktası* = Pano'nun kodunuzun takılmasına izin verdiği bir yer: bir kanca, bir işaretleme veya genişlettiğiniz bir temel sınıf.)

Her girdi adını, bir satırlık amacını ve minimal bir imzasını (fonksiyonun adı, parametreleri ve neyi döndürdüğü) verir. İşlenmiş, derlenen kod için eğitime başvurun; "bunun için bir API var mı ve adı ne?" sorusunu yanıtlamak için bu sayfaya başvurun.

::: warning Pano eklentilerinde yeni misiniz? Önce eğitimi okuyun
Bu bir **referanstır**, bir başlangıç noktası değil — zaten bir eklenti oluşturmuş olduğunuzu varsayar. Bu sayfayı aramadan bulduysanız ve hiçbiri anlam ifade etmiyorsa, önce [Backend Geliştirme](/tr/addon/backend/) eğitimini yapın. Bu sayfa ondan önce çok az anlam ifade edecektir.
:::

### Hangi bölüme ihtiyacım var?

- Bir HTTP uç noktası ekleyin (eklentinizin yanıtladığı bir URL) → **§3**
- Veriyi veritabanında saklayın → **§4**
- Kendi yapılandırma dosyanızı okuyun veya yazın → **§5**
- Girişlere, kuruluma, yönlendirmeye veya hesap silmeye tepki verin → **§6**
- Bir panel sayfasını belirli yöneticilerle sınırlayın (izinler) → **§7**
- Minecraft sunucu eklentisiyle konuşun → **§8**
- Sihirli-giriş bağlantıları veya tek seferlik jetonlar çıkarın → **§9**
- Bir bildirim veya e-posta gönderin → **§10**
- Bir konsol komutu ekleyin → **§11**
- Bir yönetici eylemini Etkinlik akışına kaydedin → **§12**
- Pano'nun kendi servislerinden birini yakalayın (veritabanı, kimlik doğrulama, …) → **§13**
- Bir premium lisansı doğrulayın → **§14**
- Jar'ınızda paketlenmiş bir dosyayı okuyun veya bir arka plan işi çalıştırın → **§15**

::: tip 60 saniyede sözlük
Bu kelimeler bu sayfanın her yerinde görünür. Bir kez göz gezdirin.

- **host** — eklenti jar'ınızı yükleyen çalışan Pano sunucusu. Bir satır "host X yapar" derse, bu kodunuz değil, Pano'nun kendisi demektir.
- **bean** — çerçevenin bir kez oluşturup paylaştığı bir nesne. Onu kurmak (construct) yerine *istersiniz*.
- **bağlam** (context) — bu bean'lerin yaşadığı kutu. Üç tane alırsınız: `pluginBeanContext` (sizinki), `pluginGlobalBeanContext` (eklentiler arasında paylaşılan) ve `applicationContext` (Pano'nun kendisi — servislerinin yaşadığı yer).
- **işaretleme** (annotation) — bir sınıfın üstüne yazdığınız `@Endpoint` gibi bir etiket. Pano jar'ınızı tarar ve birini taşıyan her şeyi bağlar.
- **DAO** — Data Access Object (Veri Erişim Nesnesi): tek bir veritabanı tablosuna ait tüm SQL'i tutan küçük bir sınıf.
- **migrasyon** (migration) — kullanıcının eklentinizi güncellediğinde mevcut tablosunu veya yapılandırmasını N sürümünden N+1'e dönüştüren tek seferlik bir yükseltme adımı.
- **suspend** — bir iş parçacığını (thread) engellemeden duraklayıp bekleyebilen bir fonksiyon (aşağıdaki kutuya bakın).
- **Future / `coAwait()`** — henüz hazır olmayan bir Vert.x sonucu; bir `suspend` fonksiyonunun içinde onu beklemek için sonuna `.coAwait()` eklersiniz.
- **JWT / jeton** — imzalı bir dize: içindekini herkes okuyabilir, ama onu yalnızca sunucu üretmiş olabilir, dolayısıyla taklit edilemez.
- **izin düğümü** (permission node) — bir izni adlandıran `pano.plugin.x.manage` gibi noktalı bir dize; yöneticiler düğümleri kullanıcı gruplarına verir.
- **HOCON** — yorumlara izin veren, insan dostu bir JSON çeşidi; `config.conf`'un biçimi.
- **PF4J** — Pano'nun dâhili olarak kullandığı eklenti-yükleme kütüphanesi; onu asla doğrudan çağırmazsınız.
:::

::: tip `suspend` hakkında
`suspend`, bir iş parçacığını engellemeden — bir veritabanı sorgusu, bir HTTP çağrısı için — duraklayıp bekleyebilen bir fonksiyonu işaretler. Tek kural: **bir `suspend` fonksiyonunu yalnızca başka bir `suspend` fonksiyonundan çağırabilirsiniz.** Bunu nadiren düşünmeniz gerekir, çünkü Pano'nun size verdiği çoğu giriş noktası zaten `suspend`'dir: tüm yaşam döngüsü kancaları (`onStart()`, …) ve her uç nokta `handle()`'ı. Onların içinde başka `suspend` fonksiyonlarını serbestçe çağırın. (Birkaç giriş noktası istisnadır ve düz, `suspend` olmayan fonksiyonlardır — `RouterEventListener`'ın metotları (§6) ve `@Command` işleyicileri (§11); bunların içinde `suspend` fonksiyonlarını doğrudan çağıramazsınız.) Birini düz (`suspend` olmayan) bir fonksiyondan çağırırsanız *"suspend function should be called only from a coroutine or another suspend function"* gibi bir derleyici hatası alırsınız.
:::

::: tip Bu sayfa nasıl okunur
Aşağıdaki her grubun bir **tablosu** (API adı, bir satırlık amaç ve imzası) ve bir `Source:` satırı vardır — tanımlandığı dosya (paket `com.panomc.platform`, `pano-web-platform` deposundaki `Pano/src/main/kotlin/` altında), böylece gerçek kodu her zaman açabilirsiniz. Buradaki her şey doğrudan o kaynaktan aktarılmıştır. İmzalarda `suspend` kelimesine dikkat edin — hemen yukarıdaki kutuya bakın.
:::

::: tip Eklentiler kodda plugin'dir
Bu dokümanların her yerinde olduğu gibi: düz metin **eklenti** der, ama kod `plugin` kullanır — `PanoPlugin`, `pluginId`, `PluginConfig`. Eklenti üst verisi (id, ad, ana sınıf, bağımlılıklar) kodda ayarlanmaz; jar manifestosunda yaşar (*jar manifestosu* = derlenmiş `.jar`'ınızın içine paketlenmiş küçük bir üst veri metin dosyası; Gradle onu sizin için `gradle.properties`'ten yazar) — bkz. [Manifesto Yapılandırması](/tr/addon/manifest/).
:::

::: tip Bu sayfada anılan örnek eklentiler
Birkaç satır örnek olarak gerçek, çalışan eklentilere işaret eder — `pano-plugin-slider`, `pano-plugin-auth-guard`, `pano-plugin-market`, `pano-plugin-social-login`, `pano-plugin-premium-login`. Bunlar Pano ile gelen yerleşik eklentilerdir; kaynakları `pano-web-platform` deposunda `plugins/pano-plugin-*` altında yaşar. Bir satır "bkz. `pano-plugin-slider` `PanelAddSliderItemAPI`" derse, tam örneği okumak için o eklentinin kaynağını açın.
:::

## 1. Giriş sınıfı ve yaşam döngüsü — `PanoPlugin`

Her eklentinin `PanoPlugin`'i genişleten tam olarak bir sınıfı vardır. Aynı anda üç şeydir: giriş noktanız (Pano'nun yüklediği ilk sınıf), Pano'nun size hazır nesneleri — günlükçünüz, veri klasörünüz, Vert.x örneği — asla kendiniz kurmadığınız özellikler olarak verdiği yer ve yaşam döngüsü kancalarının (Pano'nun sabit anlarda çağırdığı fonksiyonlar) sahibi.

*Kaynak: `com.panomc.platform.api.PanoPlugin`*

### Enjekte edilen özellikler

Pano bunları `onCreate()` çalışmadan önce sizin için doldurur; onları sınıfın herhangi bir yerinden okuyun ve asla kendiniz atamayın. (Hatırlayın: *host* = eklenti jar'ınızı yükleyen çalışan Pano sunucusu.)

Aşağıdaki satırlardan üçü Spring **bağlamıdır** — bean kutuları. Bir **bean**, çerçevenin bir kez oluşturup paylaştığı bir nesnedir; bir **bağlam**, bu bean'lerin yaşadığı kutudur. Üç kutu alırsınız: `pluginBeanContext` (sizinki), `pluginGlobalBeanContext` (eklentiler arasında paylaşılan) ve `applicationContext` (Pano'nun kendisi — servislerinin yaşadığı yer).

| Özellik | Tür | Ne olduğu |
|---|---|---|
| `pluginId` | `String` | Eklentinizin id'si (manifestodan) |
| `vertx` | `Vertx` | Vert.x örneği — zamanlayıcılar, olay veri yolu (event bus), `WebClient` |
| `pluginBeanContext` | `AnnotationConfigApplicationContext` | *Sizin* bean'lerinizi tutan Spring bağlamı |
| `pluginGlobalBeanContext` | `AnnotationConfigApplicationContext` | Eklentiler-arası bean'ler için paylaşılan bağlam |
| `applicationContext` | `AnnotationConfigApplicationContext` | Host bağlamı — Pano servislerini `getBean(...)` ile getirin |
| `pluginEventManager` | `PluginEventManager` | Eklentiler-arası etkinlikleri tetikleyin/alın |
| `pluginUiManager` | `PluginUiManager` | Arayüz paketi kaydı (sizin için yönetilir) |
| `environmentType` | `Main.Companion.EnvironmentType` | `DEVELOPMENT` / `RELEASE` |
| `releaseStage` | `ReleaseStage` | alpha / beta / stable kanalı |
| `pluginState` | `PluginState` | PF4J yükleme durumu (PF4J = Pano'nun dâhili eklenti yükleyicisi; onu asla çağırmazsınız) |
| `pluginDataFolder` | `File` | `plugins/<pluginId>/` veri dizini (otomatik oluşturulur) |
| `logger` | `Logger` | Sınıfınıza kapsamlanmış SLF4J günlükçüsü |

### Yaşam döngüsü kancaları

Hepsi varsayılan olarak hiçbir şey yapmayan (no-op) bir gövdeye sahip `open suspend fun`'dır (`open` = geçersiz kılabilirsiniz; *no-op* = siz geçersiz kılana kadar hiçbir şey yapmaz; `suspend` = üstteki kutuya bakın). Yalnızca ihtiyaç duyduğunuzu geçersiz kılın. Bu sırayla çalışırlar:

```
jar load → onCreate() → onEnable() → onStart()
        …running…
onStop() → onDisable() → onUninstall()
```

`verifyLicense()` bu dizinin bir parçası **değildir** — talep üzerine, bir site yöneticisi panelde *Lisansı yenile*'ye tıkladığında çalışır (yalnızca premium eklentiler).

| Kanca | Ne zaman çalışır |
|---|---|
| `onCreate()` | Eklenti nesnesi kurulur — çalışan ilk kanca (enjekte edilen özellikleriniz bu noktada zaten ayarlanmıştır) |
| `onEnable()` | Eklenti etkinleştirilir — sunucu açılışında veya bir yönetici panelde *Etkinleştir*'e tıkladığında |
| `onStart()` | Eklenti başlar — kurulum kodunuzu buraya koyun. Önce `setupManager.isSetupDone()`'ı kontrol edin ve `false` ise erkenden dönün (bkz. §13), böylece site kurulmadan önce veritabanına asla dokunmazsınız |
| `onStop()` | Eklenti duruyor — zamanlayıcıları/işleri burada iptal edin |
| `onDisable()` | Eklenti devre dışı bırakılır, verisi korunur — sunucu kapanışında veya bir yönetici *Devre dışı bırak*'a tıkladığında |
| `onUninstall()` | Eklenti **silinir** (yönetici *Sil*'e tıklar) — tablolarınızı burada düşürün |
| `verifyLicense()` | Panelin "Lisansı yenile" düğmesi (premium eklentiler) |

### Metotlar

| Metot | İmza | Amaç |
|---|---|---|
| `registerSingletonGlobal` | `(bean: Any)` | Bir bean'i diğer eklentilerle paylaşın |
| `unRegisterGlobal` | `(bean: Any)` | Paylaşılan bir bean'i kaldırın |
| `register` | `(listener: PluginEventListener)` | Dinamik bir etkinlik dinleyicisi kaydedin |
| `unRegister` | `(listener: PluginEventListener)` | Dinamik bir etkinlik dinleyicisini kaldırın |
| `registerCommands` | `(obj: Any)` | Bir nesnedeki `@Command` metotlarını kaydedin (`@Command` = bir konsol komutu ekleyen bir işaretleme — bkz. §11) |
| `unRegisterCommands` | `(obj: Any)` | Onları kaldırın |
| `getLicenseManager` | `(): LicenseManager` | Host lisans servisi (premium) |
| `getLicenseJwtIssuer` | `(): String` | Lisans JWT'leri için beklenen `iss` |
| `getOwnJarSha256` | `(): String?` | Yüklenen jar'ın SHA-256'sı veya null |

::: warning Pano'nun kendi servisleri kurucu parametreleri değildir
Pano *sizin* sınıflarınızı oluştururken kendi DAO'larınızı ve bean'lerinizi kurucu parametreleri olarak geçebilir (buna *kurucu enjeksiyonu* denir). Ama Pano'nun kendi servislerini (`DatabaseManager`, `AuthProvider`, `SetupManager`, …) bu şekilde **isteyemezsiniz** — onlar sizin bağlamınızda değil, `applicationContext`'te yaşar. Onları bunun yerine elle getirin:

```kotlin
// `by lazy` delays the lookup until first use, after the host has finished wiring everything up
private val authProvider by lazy { applicationContext.getBean(AuthProvider::class.java) }
```
:::

## 2. Sınıflarınızı otomatik kaydeden işaretlemeler

Bir **işaretleme**, bir sınıfın üstüne yazdığınız (`@Endpoint` gibi) bir etikettir. Eklentiniz yüklendiğinde Pano jar'ınızı tarar ve bu etiketlerden birini taşıyan her sınıfı otomatik olarak bağlar — elle kayıt çağrısı yoktur. Tarama, eklenti ana sınıfınızın paketinden köklenir, dolayısıyla işaretlenmiş sınıflarınız o pakette veya onun bir alt paketinde yaşamalıdır (ilgisiz bir paketteki bir sınıf sessizce hiç kaydedilmez). `@EventListener` **hariç** tüm bu işaretlemeler `com.panomc.platform.annotation` içinde yaşar.

*Kaynak: `com.panomc.platform.annotation.*`, `com.panomc.platform.api.annotation.EventListener`*

| İşaretleme | Şunun üstüne koyun | Amaç |
|---|---|---|
| `@Endpoint` | bir `Api` alt sınıfı | HTTP rotasını kaydeder |
| `@Dao` | bir `Dao` impl'i (`@Lazy @Scope(SCOPE_SINGLETON)` ile eşleştirin) | DAO singleton'ını kaydeder |
| `@Migration` | bir `DatabaseMigration` veya `PluginConfigMigration` | Migrasyonu kaydeder |
| `@EventListener` | bir etkinlik-dinleyici sınıfı | Dinleyiciyi kaydeder |
| `@PermissionDefinition` | bir `Permission` alt sınıfı | İzni kaydeder |
| `@NotificationDefinition` | bir bildirim türü | Bildirim türünü kaydeder |
| `@Event` | bir Minecraft-sunucu WebSocket işleyicisi (platformun kendisi tarafından kullanılır) | Bunu platform kaynağında göreceksiniz, ama eklentiler kullanamaz — bunun yerine `ServerManager.registerEvent` (§8) kullanın |
| `@Ignore` | bir varlık (entity) alanı | Alanı sütun eşlemesinden hariç tutar |

Bir **DAO** (Data Access Object), bir tabloya ait SQL'i tutan sınıftır. `@Dao` uygulaması üç işaretlemenin de üst üste dizilmesine, artı iki Spring içe aktarmasına ihtiyaç duyar. İşte Shoutbox örneği için sınıf başlığının tamamı (`ShoutDao` soyut DAO'nuz, `ShoutDaoImpl` SQL'e sahip olandır):

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

(Bir **migrasyon** = kullanıcının eklentinizi güncellediğinde mevcut tablosunu veya yapılandırmasını N sürümünden N+1'e dönüştüren tek seferlik bir yükseltme adımı; bkz. §4 ve §5.)

::: warning Spring'inkini değil, Pano'nun `@EventListener`'ını kullanın
İşaretleme `com.panomc.platform.api.annotation.EventListener`'dır — `org.springframework.context.event.EventListener` **değil**. Aynı kısa ada sahiptirler ama farklı içe aktarmalardan gelirler; yanlış olanı içe aktarın, etkinlik sistemi dinleyicinizi sessizce hiç çağırmaz. İçe aktarma satırınızın tam olarak `import com.panomc.platform.api.annotation.EventListener` olduğunu kontrol edin.
:::

## 3. HTTP uç noktaları ve yönlendirme

Bir **uç nokta** = eklentinizin yanıtladığı bir URL, örneğin `GET /api/shouts`. Aşağıdaki temel API sınıflarından birini genişleten, `@Endpoint` ile işaretlenmiş bir sınıf yazarak bir tane oluşturursunuz; Pano DAO'larınızı ve bean'lerinizi sizin için kurucusuna geçer (kurucu enjeksiyonu).

Derlenen en küçük uç nokta bir sınıf, yanıtladığı yollar ve bir sonuç döndüren bir `handle`'dır:

```kotlin
// imports: com.panomc.platform.model.* (Api, Path, RouteType, Result, Successful), com.panomc.platform.annotation.Endpoint
@Endpoint
class GetShoutsAPI : Api() {
    override val paths = listOf(Path("/api/shouts", RouteType.GET))

    override suspend fun handle(context: RoutingContext): Result {
        return Successful(mapOf("shouts" to listOf<String>()))
    }
}
```

*Kaynak: `com.panomc.platform.model` (`Route`, `Path`, `RouteType`, `Api`, `LoggedInApi`, `PanelApi`, `SetupApi`, `Template`, `Result`, `Error`)*

### Rota ilkelleri

| Tür | İmza | Amaç |
|---|---|---|
| `Path` | `Path(url: String, routeType: RouteType)` | Uç noktanın yanıtladığı bir URL + metot |
| `RouteType` | `ROUTE`, `GET`, `POST`, `PUT`, `DELETE` | HTTP metodu — `ROUTE` *herhangi* bir metotla eşleşir, `Template` (HTML) rotaları için kullanılır |
| `Route.paths` | `val paths: List<Path>` | Bu rotanın işlediği yollar (gerekli) |
| `Route.order` | `open val order = 1` | İki rota aynı URL ile eşleşebiliyorsa, daha düşük `order`'a sahip olan önce denenir |
| `Route.getValidationHandler` | `(schemaRepository): ValidationHandler?` | İstek-gövdesi/sorgu doğrulaması |
| `Route.corsHandler` | `open fun corsHandler(): Handler?` | CORS'u geçersiz kılar (varsayılanlar sağlanır) |
| `Route.bodyHandler` | `open fun bodyHandler(): Handler?` | Gövde ayrıştırmasını geçersiz kılar (bkz. yüklemeler) |

### Temel sınıflar — kimin çağırabileceğine göre seçin

| Temel sınıf | Kime izin verilir | Yolları şöyle bildirin |
|---|---|---|
| `Api` | Herkes (herkese açık) | `/api/...` |
| `LoggedInApi` | Giriş yapmış herhangi bir kullanıcı | `/api/...` |
| `PanelApi` | Yöneticiler (`LoggedInApi`'yi genişletir) | `/api/panel/...` |
| `SetupApi` | Yalnızca ilk çalıştırma kurulumu sırasında | `/api/...` |
| `Template` | Sunucu tarafında işlenmiş HTML rotası | — |

`SetupApi` rotaları yalnızca ilk çalıştırma kurulum sihirbazı çalışırken var olur ve site kurulduktan sonra kaybolur — ona nadiren ihtiyaç duyarsınız.

::: tip Panel yolları `/api/panel/...` olarak bildirilir
Panel arayüzü `/panel/api/...` gibi URL'ler çağırır, ama Pano onları dâhili olarak `/api/...`'ye yeniden yönlendirir — dolayısıyla her zaman `/api/panel/...` biçimini bildirirsiniz. Somut olarak:

- Tarayıcı çağırır: `GET /panel/api/shouts`
- Siz bildirirsiniz: `Path("/api/panel/shouts", RouteType.GET)`
:::

### Bir isteği işleme (`Api` üyeleri)

| Üye | İmza | Amaç |
|---|---|---|
| `handle` | `abstract suspend fun handle(context: RoutingContext): Result?` | Uç nokta gövdeniz — başarıda `Successful(...)` döndürün; başarısız olmak için bir `Error` **fırlatın** (aşağıya bakın), onu döndürmeyin. (`null` döndürmek normal yoldan hiçbir şey geri göndermez — yalnızca yanıtı kendiniz yazdıysanız yapın.) |
| `getSqlClient` | `suspend fun getSqlClient(): SqlClient` | Paylaşılan SQL istemcisi |
| `getParameters` | `fun getParameters(context): RequestParameters` | Doğrulanmış gövde/sorgu/yol parametreleri |
| `checkSetup` | `fun checkSetup()` | Kurulum bitmemişse `InstallationRequired` fırlatır |
| `isAllowedInDemo` | `open fun isAllowedInDemo(method: HttpMethod): Boolean` | Örnek demo modunda çalışırken yazmaları kapılar |

### Sonuçlar ve hatalar

| Şey | İmza | Amaç |
|---|---|---|
| `Successful` | `Successful(map: Map<String, Any?> = emptyMap())` | Başarı → `{"result":"ok", …map…}` |
| `Errors` | `Errors(map: Map<String, Any?>)` | Alan düzeyinde hata yükü — örn. `Errors(mapOf("email" to true))` frontend'e e-posta alanını vurgulamasını söyler |
| `Error` alt sınıfları | `throw NotFound()` / `BadRequest()` / … | `com.panomc.platform.error` içinde ~100 tanımlı (`NotFound`, `BadRequest`, `NoPermission`, `NotLoggedIn`, `InternalServerError`, …) |
| Özel hata | `class MyError : Error(statusCode, …)` | İstemci hata kodu = sınıf adının `UPPER_SNAKE` hâli: `class SlugTaken : Error(...)` → istemci `"error": "SLUG_TAKEN"` alır |

Bir isteği başarısız kılmak için bir `Error` **fırlatırsınız** (Pano'nun `com.panomc.platform.model.Error`'ı, Kotlin'in yerleşik `Error`'ı **değil**) — onu döndürmezsiniz. Doğrulama hataları sizin için `BadRequest`'e çevrilir.

### Dosya yüklemeleri — özel `bodyHandler()`

Multipart yüklemelerini kabul etmek için `bodyHandler()`'ı geçersiz kılın ve `Bodies.multipartFormData` ile doğrulayın. Aşağıdaki parçada, `FILE_UPLOAD_SIZE`, *sizin* tanımladığınız bir sabittir — bayt cinsinden maksimum yükleme boyutu, örn. `private const val FILE_UPLOAD_SIZE = 5 * 1024 * 1024`. Desen (bkz. `pano-plugin-slider` `PanelAddSliderItemAPI`):

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

Her veritabanı tablosu **üç küçük dosyaya** ihtiyaç duyar (artı isteğe bağlı migrasyonlar):

- `Shout.kt` — satırın kendisi, `DBEntity`'yi genişleten bir data class.
- `ShoutDao.kt` — sorguları *bildiren* soyut bir sınıf. **Uç noktalara enjekte ettiğiniz tür budur.**
- `ShoutDaoImpl.kt` — gerçek SQL'i tutan `@Dao` sınıfı.

Bu bölünme, uç noktalarınızın düz `ShoutDao` türüne bağlı olmasını sağlarken Pano çalışma zamanında SQL taşıyan `ShoutDaoImpl`'i sağlar. [Backend Geliştirme](/tr/addon/backend/) eğitimi birini baştan sona oluşturur.

*Kaynak: `com.panomc.platform.db` (`Dao`, `DBEntity`, `DatabaseMigration`), `com.panomc.platform.api.PluginDatabaseManager`*

| Tür | İmza | Amaç |
|---|---|---|
| `DBEntity` | `abstract class` (statik `gson`'a sahip) | Bir satır modeli için temel sınıf — `class Shout(...) : DBEntity()` yazın. Dikkat: `@Dao`'nun aksine, bunu *genişletirsiniz*, onunla işaretlemezsiniz |
| `@Ignore` | alan işaretlemesi | Bir model alanını sütun eşlemesinin dışında tutar |
| `Dao<T : DBEntity>` | `abstract class Dao<T>(entityClass: Class<T>)` | Temel DAO |
| `Dao.init` | `abstract suspend fun init(sqlClient: SqlClient)` | `CREATE TABLE IF NOT EXISTS …` buraya |
| `Dao.uninstall` | `open suspend fun uninstall(sqlClient: SqlClient)` | `DROP TABLE …` (isteğe bağlı) |
| `Dao.fields` | `open val fields: List<String>` | Sorgu oluşturmak için sütun adları |
| `Dao.tableName` | `protected val tableName` | Varlık sınıfı adınızdan otomatik türetilir (`ShoutItem` → `shout_item`); salt okunur — onu siz ayarlamazsınız |
| `Dao.getTablePrefix` | `fun getTablePrefix(): String` | Örneğin tablo öneki |
| `Row.toEntity()` | uzantı | Bir satır → modeliniz (Gson aracılığıyla). `com.panomc.platform.db`'den uzantı fonksiyonu — bir sonuç satırında `row.toEntity()` çağırın |
| `RowSet.toEntities()` | uzantı | Çok satır → `List<T>`. Aynı fikir: bir sorgu sonucunda `rows.toEntities()` çağırın |
| `List<String>.toTableQuery()` | uzantı | Ters tırnaklı sütun listesi |
| `DatabaseMigration` | `DatabaseMigration(from: Int, to: Int, info: String)` | Bir şema adımı; `val handlers: List<suspend (SqlClient) -> Unit>`'i geçersiz kılın |
| `PluginDatabaseManager.initialize` | `suspend fun initialize(plugin: PanoPlugin)` | Tabloları oluştur + bekleyen migrasyonları çalıştır |
| `PluginDatabaseManager.uninstall` | `suspend fun uninstall(plugin: PanoPlugin)` | Her DAO'nun `uninstall()`'ını çalıştır |

**Sorgu sonuçlarını bekleme (`coAwait`).** Her Vert.x veritabanı çağrısı bir **Future** döndürür — henüz hazır olmayan bir sonuç. Bir `suspend` fonksiyonunun içinde onu beklemek ve değeri almak için sonuna `.coAwait()` eklersiniz:

```kotlin
// import io.vertx.kotlin.coroutines.coAwait
val rows = sqlClient.query("SELECT * FROM `shout`").execute().coAwait()
```

**Pano'nun kendi** tablolarına (sizin eklentinizin değil) karşı ham SQL, host `DatabaseManager` üzerinden gider — `databaseManager.getSqlClient()`, artı `userDao` gibi çekirdek DAO'lar.

**Bir migrasyon, tam hâliyle.** Bir `@Migration` sınıfı şemayı bir sürüm yükseltir ve her değişiklik için bir işleyici listeler. Her işleyici sizin `ALTER TABLE`'ınızı (veya benzerini) çalıştırır:

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
`pluginDatabaseManager.uninstall(this)`, **her DAO'nun `uninstall()`'ını** çalıştırır — bu, panel **Sil** eylemidir, **Devre dışı bırak** değil. Devre dışı bırakmak veriyi korur.
:::

Eksiksiz, derlenen bir sorgu için — bir DAO içinde yazılmış gerçek bir `SELECT` ve `INSERT` — eğitimin [Bir veritabanı tablosu](/tr/addon/backend/#_3-bir-veritabanı-tablosu) bölümünü izleyin.

## 5. Yapılandırma

`PluginConfig`'i genişleten bir yapılandırma sınıfı, eklentiniz ilk çalıştığında `plugins/<pluginId>/config.conf`'a (HOCON — yorumlara izin veren, insan dostu bir JSON çeşidi) yazılır ve normal bir Kotlin nesnesi olarak geri okunur — `config.apiKey` yazarsınız, dize aramaları değil.

*Kaynak: `com.panomc.platform.api.config` (`PluginConfig`, `PluginConfigManager`, `PluginConfigMigration`, `ConfigComment`, `ConfigSection`)*

| Tür | İmza | Amaç |
|---|---|---|
| `PluginConfig` | `open class PluginConfig` (`version: Int`'e sahip) | Yapılandırmanız için temel; kendi alanlarınızı varsayılanlarla ekleyin |
| `PluginConfigManager<T>` | `PluginConfigManager(plugin, T::class.java)` | Bir yapılandırma sınıfı için dosyayı yükler/kaydeder |
| `.config` | `val config: T` | Mevcut türlü değerler |
| `.saveConfig` | `fun saveConfig(config: JsonObject)` | Değişiklikleri diske kalıcı yazar |
| `.configFilePath` | `val configFilePath: String` | `config.conf`'un çözümlenmiş yolu |
| `PluginConfigMigration` | `PluginConfigMigration(from: Int, to: Int, versionInfo: String)` | `fun migrate(config: JsonObject)`'i geçersiz kılın; `@Migration` ile işaretleyin |
| `@ConfigComment` | `@ConfigComment(vararg lines: String)` | Üretilen dosyada bir alanın üstüne doküman yorumu |
| `@ConfigSection` | `@ConfigSection(title: String)` | Anahtarları bir başlık altında gruplar |

`.config` neden türlü bir `T` ama `.saveConfig` bir `JsonObject` alıyor? Okumak size kendi türlü sınıfınızı verir; kaydetmek ham bir `JsonObject` alır, böylece yalnızca istediğiniz anahtarları değiştirebilirsiniz. Bir kaydetme şöyle görünür:

```kotlin
configManager.saveConfig(JsonObject().put("apiKey", "new-value"))
```

Yöneticiyi `onStart()` sırasında kendi `pluginBeanContext`'inizde bir **singleton** (tek paylaşılan örnek) olarak kaydedin, sonra bir istek ona ihtiyaç duyduğunda tembel olarak getirin. İki satır şudur:

```kotlin
val configManager = PluginConfigManager(this, ShoutboxConfig::class.java)
pluginBeanContext.beanFactory.registerSingleton(PluginConfigManager::class.java.name, configManager)
```

::: tip Kontrol noktası
İlk başlangıçtan sonra, `plugins/<pluginId>/config.conf` diskte var olmalı ve varsayılan değerlerinizi tutmalıdır.
:::

## 6. Etkinlik dinleyicileri

Çoğu etkinlik dinleyicisi aynı şekilde çalışır. (1) Arayüzü (interface) uygulayın. (2) Sınıfı `@EventListener` ile işaretleyin. (3) Etkinlik tetiklendiğinde Pano metotlarınızı çağırır. Metotlar `suspend`'dir ve varsayılan olarak hiçbir şey yapmaz, dolayısıyla yalnızca önemsediklerinizi geçersiz kılarsınız. İki dinleyici bu deseni bozar — tablonun altındaki uyarılara bakın.

*Kaynak: `com.panomc.platform.api.event.*`*

| Arayüz | Metotlar (eklentiyle ilgili) |
|---|---|
| `SetupEventListener` | `onSetupFinished()` |
| `RouterEventListener` | `onInitRouteList(routes: MutableList<Route>)`, `onRouterCreate(router: Router)` |
| `AuthEventListener` | `onBeforeAuthenticate(context, sqlClient): LoginDecision?`, `onBeforeVerifyLinkCode(context, sqlClient): LoginDecision?`, `onBeforeLogin(user, context, sqlClient): LoginDecision?`, `onAfterLogin(user, context, sqlClient)`, `onAfterRegister(user, sqlClient)` |
| `PlayerEventListener` | `onDelete(user: User)` — hesap silme temizliği |
| `ProfilePictureEventListener` | `resolveProfilePictureUrl(user: User): String?` |
| `PluginLifecycleListener` | `onPluginLoad/Enable/Disable/Unload/Uninstall(plugin: PanoPlugin)` |
| `PluginEventListener` | Kendi eklentiler-arası etkinlikleriniz için işaretçi (marker) |

**`AuthEventListener` metotları** (yukarıdaki kalabalık satır, satır başına bir tane):

- `onBeforeAuthenticate(context, sqlClient): LoginDecision?`
- `onBeforeVerifyLinkCode(context, sqlClient): LoginDecision?`
- `onBeforeLogin(user, context, sqlClient): LoginDecision?`
- `onAfterLogin(user, context, sqlClient)`
- `onAfterRegister(user, sqlClient)`

`onBeforeLogin` ve benzerleri bir `LoginDecision` döndürür: `Deny(errorKey, extras)`, `RequireUsername(userId)` veya `Allow`. (`errorKey` = bir yerelleştirme anahtarı — kullanıcıya gösterilen çevrilmiş bir mesajın id'si; bkz. [Çeviriler](/tr/addon/localization/).)

Bir dinleyiciyi kaydetmenin iki yolu: paketinizde bir `@EventListener` sınıfı (**sabit** — eklenti yüklendiğinde bir kez keşfedilir) veya eklenti **çalışırken** dinleyici eklemek ve kaldırmak için `plugin.register(listener)` / `plugin.unRegister(listener)`.

::: warning İstisna 1 — `RouterEventListener` `suspend` değildir
Diğerlerinin aksine, `RouterEventListener`'ın `onInitRouteList` ve `onRouterCreate`'i düz (`suspend` olmayan) **soyut** fonksiyonlardır. İkisini de uygulamak **zorundasınız** ve içlerinde `suspend` fonksiyonlarını doğrudan çağıramazsınız.
:::

::: warning İstisna 2 — `PluginLifecycleListener`'ın `@EventListener`'ı yoktur
`PluginLifecycleListener`, `EventListener` işaretçisini genişletmez, dolayısıyla onu `@EventListener` ile işaretlemek **yasaktır**: bunu yapmak hem hiç tetiklenmez *hem de* host'un dâhili `as EventListener` dönüşümünü bozar — eklentiniz başlarken bir `ClassCastException` fırlatır. Bunun yerine onu açıkça kaydedin:

```kotlin
applicationContext.getBean(PluginManager::class.java).addLifecycleListener(listener)
```
:::

::: tip Eklentiler-arası etkinlikler (ileri düzey)
*Diğer* eklentilerin, eklentinizin yaptığı bir şeye tepki vermesini sağlamak için: `PluginEventListener`'ı genişleten bir arayüz tanımlayın, diğerlerinin sizi bulabilmesi için eklentinizi paylaşın, sonra her aboneye tetikleyin. `getEventListeners`'ın bir **companion-object** fonksiyonu olduğuna dikkat edin (bir örneğe değil, sınıfın kendisine ait bir fonksiyon), dolayısıyla onu enjekte edilen `pluginEventManager` üzerinde değil, `PluginEventManager.getEventListeners<...>()` olarak çağırırsınız.

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

Bir **izin düğümü**, bir izni adlandıran noktalı bir dizedir (`pano.plugin.x.manage` gibi). Yöneticiler düğümleri panelde kullanıcı gruplarına verir; kodunuz sonra mevcut kullanıcının bir düğüme sahip olup olmadığını kontrol eder.

*Kaynak: `com.panomc.platform.auth` (`Permission`, `PanelPermission`, `AuthProvider`)*

| Tür | İmza | Ürettiği düğüm |
|---|---|---|
| `Permission` | `open class Permission(iconName: String)` | `pano.<key>` |
| `PanelPermission` | `open class PanelPermission(iconName: String)` | `pano.plugin.<pluginId>.<dotted.key>` |
| `@PermissionDefinition` | sınıf işaretlemesi | İzni otomatik kaydeder |

(`iconName` = panelde iznin yanında gösterilen bir Font Awesome simge adı, örn. `"fa-bullhorn"` veya `"fa-comments"`.)

Düğüm, sınıf adından otomatik olarak türetilir. Önce örnek:

`ManageShoutboxPermission` → `pano.plugin.pano-plugin-shoutbox.manage.shoutbox`

Kural: sondaki `Permission`'ı düşürün, kalan kelimeleri bölün, küçük harfe çevirin, noktalarla birleştirin ve (bir eklenti `PanelPermission`'ı için) `pano.plugin.<pluginId>.` ile öne ekleyin. Panel sayfalarını ve gezinme bağlantılarını kapılamak (göster/gizle) için bu tam dizeyi frontend kodunuzda tekrarlarsınız — bkz. [Arayüz API Referansı](/tr/addon/api-reference/).

**`AuthProvider`** (`getBean` aracılığıyla host bean'i):

| Metot | İmza | Amaç |
|---|---|---|
| `requirePermission` | `suspend fun requirePermission(permission: Permission, context: RoutingContext)` | Kullanıcıda yoksa fırlatır |
| `hasPermission` | `suspend fun hasPermission(permission: Permission, context: RoutingContext): Boolean` | Fırlatmayan kontrol |
| `isLoggedIn` | `suspend fun isLoggedIn(context: RoutingContext): Boolean` | — |
| `hasAccessPanel` | `suspend fun hasAccessPanel(context: RoutingContext): Boolean` | Herhangi bir panel erişimi |
| `getUserIdFromRoutingContext` | `fun getUserIdFromRoutingContext(context: RoutingContext): Long` | Mevcut kullanıcı id'si |
| `requirePassword` | `suspend fun requirePassword(password: String?, context: RoutingContext)` | Yeniden kimlik doğrulama (yanlışsa fırlatır) |
| `isUserAdmin` | `suspend fun isUserAdmin(userId: Long): Boolean` | — |

## 8. Minecraft sunucu iletişimi

Site sahibi Minecraft sunucusunda eşlik eden `pano-mc-plugin`'i çalıştırıyorsa, o eklenti Pano'ya **şifreli bir WebSocket** bağlantısı açık tutar (bir WebSocket = normal tek atımlık bir HTTP isteğinin aksine, iki yönlü, her zaman açık bir ağ bağlantısı; Pano üzerindeki her mesajı AES-256-GCM ile şifreler). `ServerManager`, o bağlantı üzerindeki tutamağınızdır: *gelen* mesajlar için işleyiciler kaydedin ve *giden* mesajlar gönderin (bkz. `pano-plugin-premium-login`). Bağlı bir sunucu yoksa, konuşulacak bir şey yoktur.

*Kaynak: `com.panomc.platform.server` (`ServerManager`, `ServerEvent`, `PlatformMessage`)*

| Üye | İmza | Amaç |
|---|---|---|
| `ServerManager.registerEvent` | `fun registerEvent(event: ServerEvent<*, *>)` | Gelen bir etkinlik türünü işle |
| `ServerManager.unregisterEvent` | `fun unregisterEvent(event: ServerEvent<*, *>)` | İşlemeyi durdur |
| `ServerManager.sendMessage` | `fun sendMessage(message: PlatformMessage, server: Server)` | Bir sunucuya at-ve-unut |
| `ServerManager.getConnectedServers` | `fun getConnectedServers(): Map<Server, ServerWebSocket>` | Şu anda bağlı sunucular (anahtar = `Server`, değer = onun canlı WebSocket'i) |
| `ServerManager.isConnected` | `fun isConnected(id: Long): Boolean` | — |
| `ServerEvent<R, M>` | `abstract suspend fun handle(request: R, server: Server): M?` | Gelen etkinlik işleyicisi (R = aldığınız istek yükü, M = isteğe bağlı olarak yanıtladığınız mesaj türü; `M?` yanıtın isteğe bağlı olduğu anlamına gelir) |
| `PlatformMessage` | `interface` | Giden mesaj şekli |

(Yukarıdaki satırlardaki `ServerEvent<*, *>` yalnızca "herhangi bir istek/yanıt türünde bir `ServerEvent`" demektir.)

**Kablo adları** (wire names) sınıf adından türetilir: bir `ServerEvent`, `Event` ekini çıkarır, bir `PlatformMessage`, `Message`'ı çıkarır, sonra ikisi de `UPPER_SNAKE`'e dönüşür (`getEventName()` / `getResponseName()`). Yani `PlayerJoinEvent` ⇄ kablo adı `PLAYER_JOIN`.

## 9. Jetonlar

Buradaki bir **jeton**, **JWT** biçiminde imzalı bir dizedir: içindekini herkes okuyabilir, ama onu yalnızca sunucu üretmiş olabilir, dolayısıyla taklit edilemez. Jetonları sihirli-giriş bağlantıları ve tek seferlik eylemler için kullanın. Jeton *türünüzü* host'a kaydedin, böylece eklentiniz kaldırıldığında otomatik olarak kaydı silinir (bkz. `pano-plugin-auth-guard` `MagicLoginTokenType`).

*Kaynak: `com.panomc.platform.token` (`TokenType`, `TokenTypeRegistry`, `TokenProvider`)*

| Üye | İmza | Amaç |
|---|---|---|
| `TokenType` | `interface` — `getName(): String`, `getExpireDate(): Long` (epoch milis olarak son kullanma) | Jeton türünüz (ad, sınıf adından eksi `TokenType`, `UPPER_SNAKE` olarak varsayılır) |
| `TokenTypeRegistry.registerPluginToken` | `fun registerPluginToken(pluginId: String, tokenType: TokenType)` | Kaydet (kaldırmada otomatik silinir) |
| `TokenProvider.generateToken` | `fun generateToken(subject: String, tokenType: TokenType): Pair<String, Long>` | `(tokenString, expiresAtEpochMillis)` döndürür — imzalı jeton ve ne zaman sona ereceği (epoch milisaniye) |
| `TokenProvider.saveToken` | `suspend fun saveToken(token: String, subject: String, tokenType: TokenType, expireDate: Long, sqlClient: SqlClient, ipAddress: String? = null, userAgent: String? = null)` | Onu kalıcı yaz |
| `TokenProvider.isTokenValid` | `suspend fun isTokenValid(token: String, tokenType: TokenType, sqlClient: SqlClient): Boolean` | — |
| `TokenProvider.invalidateToken` | `suspend fun invalidateToken(token: String, sqlClient: SqlClient)` | Birini iptal et |
| `TokenProvider.invalidateTokensBySubjectAndType` | `suspend fun invalidateTokensBySubjectAndType(subject: String, type: TokenType, sqlClient: SqlClient)` | Bir konunun bir türdeki jetonlarını iptal et |
| `TokenProvider.parseToken` | `fun parseToken(token: String): DecodedJWT` | İddiaları (claim) çöz |

## 10. Bildirimler ve posta

*Kaynak: `com.panomc.platform.notification` (`NotificationManager`, `UserNotificationType`, `PanelUserNotificationType`), `com.panomc.platform.mail` (`MailManager`, `Mail`)*

**Bildirimler**, tema ve panel üst çubuğundaki zil simgesi altında görünür. `UserNotificationType` veya `PanelUserNotificationType`'ı alt sınıflayın, `@NotificationDefinition` ile işaretleyin, sonra `NotificationManager` aracılığıyla gönderin:

| Metot | Kime gönderir |
|---|---|
| `sendNotification(…)` | Bir kullanıcı |
| `sendPanelNotification(…)` | Bir kullanıcının paneli |
| `sendNotificationToAll(…)` | Her kullanıcı |
| `sendPanelNotificationToAll(…)` | Her kullanıcının paneli |
| `sendNotificationToAllAdmins(…)` | Tüm yöneticiler |
| `sendNotificationToAllWithPermission(…)` | Bir izne sahip herkes |

Yaygın olanı, tam hâliyle: `suspend fun sendNotification(userId: Long, userNotificationType: UserNotificationType, sqlClient: SqlClient)`. Diğer beşi aynı şekli izler (bkz. `NotificationManager`, kaynak satır 33'ten).

**Posta** — `Mail`'i uygulayın, `MailManager` ile gönderin (bkz. `pano-plugin-auth-guard` `MagicLoginMail`):

| Üye | İmza | Amaç |
|---|---|---|
| `MailManager.sendMail` | `suspend fun sendMail(sqlClient, userId: Long?, mail: Mail, email: String? = null)` | İşle + gönder |
| `Mail.templatePath` | `val templatePath: String` | Handlebars şablonunuza yol (Handlebars = `{{placeholder}}` yer tutucuları olan bir HTML şablon dili). Yol, jar'ınızın kaynaklarının içine işaret eder — bkz. §15 "Jar kaynak okuma" |
| `Mail.subject` | `val subject: String` | Konu satırı |
| `Mail.generateParameters` | `suspend fun generateParameters(systemParameters, i18nManager, locale): MailParameters` | Şablon değişkenleri |

## 11. Konsol komutları

Pano'nun etkileşimli bir **konsolu** vardır — platform jar'ının çalıştığı terminal penceresi. `@Command` metotları, ona kendi komutlarınızı eklemenize izin verir. Metotları `@Command` ile işaretleyin, sonra onları tutan nesneyi kaydedin.

*Kaynak: `com.panomc.platform.command` (`Command`, `CommandSender`)*

| Üye | İmza | Amaç |
|---|---|---|
| `@Command` | `@Command(name, aliases = [], description = "", usage = "")` | Bir komut metodunu işaretler |
| metot şekli | `(sender: CommandSender)` veya `(sender: CommandSender, args: Array<String>)` | İşleyici |
| `PanoPlugin.registerCommands` | `fun registerCommands(obj: Any)` | `obj` üzerindeki tüm `@Command` metotlarını kaydeder |
| `PanoPlugin.unRegisterCommands` | `fun unRegisterCommands(obj: Any)` | Onları kaldırır |
| `CommandSender.sendMessage` | `fun sendMessage(message: String)` | Çağırana yanıt ver |

::: tip Kontrol noktası
Kaydettikten sonra, konsola `help` yazın — komutunuzun adı ve açıklaması listelenmiş olmalı.
:::

## 12. Etkinlik günlükleri

Yönetici eylemlerini, panelin Etkinlik akışında görünmeleri için kaydedin. `PluginActivityLog`'u alt sınıflayın ve host `DatabaseManager` aracılığıyla ekleyin.

*Kaynak: `com.panomc.platform.db.model.PluginActivityLog`*

| Üye | İmza | Amaç |
|---|---|---|
| `PluginActivityLog` | `open class PluginActivityLog(userId: Long, pluginId: String, details: JsonObject = JsonObject())` | Günlük girdiniz |
| ekleme | `databaseManager.panelActivityLogDao.add(log, sqlClient)` | Onu yaz |

Bir uç noktanın içinde şöyle bağlayın — SQL istemcisini yakalayın, host `DatabaseManager`'ı yakalayın, sonra günlüğünüzü ekleyin:

```kotlin
val sqlClient = getSqlClient()
val databaseManager = applicationContext.getBean(DatabaseManager::class.java)
databaseManager.panelActivityLogDao.add(CreatedShoutLog(userId, pluginId), sqlClient)
```

::: tip Kontrol noktası
Girdi artık panelin **Etkinlik** sayfasında görünür.
:::

Panel her girdiyi, bir `activity-logs` nesnesi altında sınıf adından (eksi `Log`, `UPPER_SNAKE`) türetilen bir yerelleştirme anahtarıyla işler — `CreatedShoutLog` → `activity-logs.CREATED_SHOUT`. Geçtiğiniz `details` `JsonObject`'indeki her anahtar, o yerelleştirme dizesindeki eşleşen `{{placeholder}}` yer tutucusuna yerleştirilir. Bkz. [Çeviriler](/tr/addon/localization/).

## 13. Host bean'leri

Pano'nun kendi servisleri, host `applicationContext`'te yaşayan **bean'lerdir** (çerçevenin bir kez oluşturup paylaştığı nesneler). Herhangi birini `applicationContext.getBean(SomeService::class.java)` ile getirin. Onlar kurucularınıza **enjekte edilmez** — her zaman elle getirirsiniz (tercihen `by lazy`, bkz. §1).

::: details Spring uygulama ayrıntısı (atlanabilir)
Aşağıdaki bean'lerin çoğu (`DatabaseManager`, `PluginDatabaseManager`, `SetupManager`, `AuthProvider`, `ServerManager`, `TokenProvider`, `NotificationManager`, `MailManager`, `LicenseManager`, `ConfigManager`, `PluginManager`) `@Component` sınıflarıdır — ve `TokenTypeRegistry` bir `@Service`'tir — `@ComponentScan("com.panomc.platform")` tarafından keşfedilir; yalnızca altyapı bean'leri (`Vertx`, `Router`, `WebClient`, `Gson`, `SchemaRepository`, artı günlükçü, şablon motoru, `HttpClient`, `PluginUiManager` ve `PluginEventManager`) `com.panomc.platform.SpringConfig` içinde `@Bean` ile bildirilir. Onları *kullanmak* için bunların hiçbirine ihtiyacınız yok — `getBean(...)` her iki şekilde de aynı çalışır.
:::

| Bean | Ne için |
|---|---|
| `DatabaseManager` | Paylaşılan SQL istemcisi, çekirdek DAO'lar, `panelActivityLogDao` |
| `PluginDatabaseManager` | Tablolarınız ve migrasyonlarınız |
| `SetupManager` | `isSetupDone()` — önce onu çağırın ve `true` döndürene kadar veritabanı erişimini atlayın (§1'deki "kurulumda kapılama") |
| `AuthProvider` | İzin ve giriş kontrolleri |
| `ServerManager` | Minecraft sunucu iletişimi |
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
| `PluginManager` | Eklenti kaydı |

## 14. Lisans (premium eklentiler)

Premium eklentiler, imzalı bir lisansı derleme zamanı bir genel anahtara karşı doğrular. Pano lisans dosyasını sizin için yalnızca *indirir* — onu **kontrol etmez**; eklentinizin imzayı kendisi doğrulaması gerekir. Bu bir özettir — tam bağlantı, kopyalanan `PluginLicenseClient`/`LicenseGuard` ve hata davranışı [Premium Eklentiler ve Lisanslama](/tr/addon/premium/) sayfasında ele alınmıştır.

*Kaynak: `com.panomc.platform.license` (`LicenseManager`, `SignedLicense`, `LicenseClaims`, `LicenseRequiredException`)*

| Üye | İmza | Amaç |
|---|---|---|
| `PanoPlugin.getLicenseManager` | `(): LicenseManager` | JWT'yi getiren host servisi |
| `LicenseManager.requireLicense` | `(plugin, resourceId, version)` | Eklentiniz için (önbelleğe alınmış) lisansı getir |
| `SignedLicense.verifySignature` | `(publicKey, expectedIssuer)` | Jar'ınızın içinde gönderdiğiniz genel anahtarı kullanarak imzayı kontrol et (RS256 = bir genel/özel-anahtar imza şeması) |
| `LicenseClaims` | `issuer, platformId, resourceId, userId, version, jarSha256, issuedAtMs, expiresAtMs, keyId, tokenId` | Çapraz kontrol edilecek ayrıştırılmış iddialar |
| `LicenseRequiredException` | `(pluginId, reason, message, cause)` | Bunu `onStart()`'tan fırlatın, böylece eklenti geçerli bir lisans olmadan başlamayı reddeder (yine de başlamaktan daha güvenli) |

## 15. Çeşitli ve desenler

Küçük yardımcı araçlar ve tek bir API olmayan ama adlandırmaya değer, sık tekrarlanan iki deyim.

| Şey | Nerede | Amaç |
|---|---|---|
| Jar kaynak okuma | sınıf yükleyiciniz | Jar'ınızın içinde paketlediğiniz dosyalar (posta şablonları, anahtarlar) `javaClass.classLoader.getResourceAsStream(path)` ile okunur (bir *sınıf yükleyici*, jar'da paketlenmiş dosyaları okuyan şeydir). Not: `PanoPlugin`'in kendine ait bir `getResource` yardımcısı yoktur. Bkz. `pano-plugin-auth-guard` `MagicLoginMail` |
| `pluginDataFolder` | `PanoPlugin` | `plugins/<pluginId>/` diziniz (yüklemeler, `config.conf`) |
| `logger` | `PanoPlugin` | Sınıf kapsamlı SLF4J günlükçüsü |

**Arka plan işleri** — Vert.x ile zamanlayın ve bir `AtomicBoolean` ile çakışmaya karşı koruyun; `onStop()`/`onDisable()`'da iptal edin (bkz. `pano-plugin-market` `MarketPlugin`). Aşağıdaki parçada, `setPeriodic`'in argümanı **milisaniye** cinsindendir, dolayısıyla `60_000` her 60 saniye demektir; `AtomicBoolean` bayrağı, önceki hâlâ devam ederken yeni bir çalıştırmanın başlamasını durdurur:

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

Yorumlu satır zor kısmı gizler — işi (`suspend`) düz (`suspend` olmayan) zamanlayıcı geri çağırmasından başlatmak. Tam, derlenen sürüm için `pano-plugin-market` `MarketPlugin`'i okuyun.

**Gizli bilgileri maskeleme** — bir yapılandırma `GET` uç noktası, gizli alanları maskeli (gizli) döndürmelidir. Gerçek değeri yalnızca, önce yöneticinin parolasını yeniden kontrol eden *ayrı* bir uç nokta aracılığıyla açığa çıkarın. Bu kontrolü yapmanın iki yolu:

- **Seçenek A:** `authProvider.requirePassword(password, context)` — bkz. `pano-plugin-auth-guard` `TwoFactorDisableAPI`.
- **Seçenek B:** manuel bir `databaseManager.userDao.isLoginCorrect(...)` kontrolü — bkz. `pano-plugin-social-login` `PanelRevealSecretAPI`.

## Sırada ne var

- **[Backend Geliştirme](/tr/addon/backend/)** — bu API'leri derlenen koda dönüştüren işlenmiş Shoutbox eğitimi.
- **[Çeviriler](/tr/addon/localization/)** — izinler ve etkinlik günlükleri için yerelleştirme anahtarları.
- **[Premium Eklentiler ve Lisanslama](/tr/addon/premium/)** — grup 14 için tam lisans-doğrulama bağlantısı.
- **[Arayüz API Referansı](/tr/addon/api-reference/)** — arayüz yarısı için `pano.*` ve `@panomc/sdk` yüzeyi.
