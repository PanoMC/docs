# Backend API Referansı

Bir Pano eklentisinin eksiksiz backend yüzeyi, ilgi alanına göre gruplanmış halde. Bu, [Backend Geliştirme](/tr/addon/backend/) eğitiminin başvuru eşlikçisidir: eğitim, parçaların Shoutbox örneği üzerinde *nasıl* birbirine bağlanacağını gösterir; bu sayfa ise *neyin var olduğunu* listeler; böylece bir genişletme noktasını adıyla bulmak için asla platform kaynağını okumak zorunda kalmazsınız.

Her girdi; adını, tek satırlık amacını ve asgari bir imzasını verir. İşlenmiş, derlenen kod için eğitime; "bunun için bir API var mı ve adı ne?" sorusunu yanıtlamak için bu sayfaya başvurun.

::: tip Kaynağa karşı doğrulandı
Bu sayfadaki her şey platform kaynağından bire bir aktarılmıştır. Her grubun altındaki `Kaynak:` satırı, `pano-web-platform` içindeki tanımlayıcı dosyayı işaret eder (`com.panomc.platform` paketi, `Pano/src/main/kotlin/` altında); böylece bir imzayı her zaman doğrulayabilir ya da çevresindeki kodu okuyabilirsiniz.
:::

::: tip Eklentiler kodda plugin'dir
Bu dokümanlarda her yerde olduğu gibi: düz metinde **eklenti** deriz, ama kod `plugin` kullanır — `PanoPlugin`, `pluginId`, `PluginConfig`. Eklenti meta verisi (id, ad, ana sınıf, bağımlılıklar) kodda ayarlanmaz; jar manifestosunda, `gradle.properties`'ten üretilerek yaşar — bkz. [Manifesto Yapılandırması](/tr/addon/manifest/).
:::

## 1. Giriş sınıfı ve yaşam döngüsü — `PanoPlugin`

Her eklentinin `PanoPlugin`'i genişleten tam olarak bir sınıfı vardır. O sizin giriş noktanız, enjekte edilen çalışma zamanı tutamaçlarının (handle) sahibi ve yaşam döngüsü kancalarının (hook) sahibidir.

*Kaynak: `com.panomc.platform.api.PanoPlugin`*

### Enjekte edilen özellikler

Host tarafından `onCreate()`'ten önce ayarlanır; sınıfın herhangi bir yerinden okuyun.

| Özellik | Tür | Ne olduğu |
|---|---|---|
| `pluginId` | `String` | Eklentinizin id'si (manifestodan) |
| `vertx` | `Vertx` | Vert.x örneği — zamanlayıcılar, olay veri yolu (event bus), `WebClient` |
| `pluginBeanContext` | `AnnotationConfigApplicationContext` | *Sizin* bean'lerinizi tutan Spring bağlamı |
| `pluginGlobalBeanContext` | `AnnotationConfigApplicationContext` | Eklentiler-arası bean'ler için paylaşılan bağlam |
| `applicationContext` | `AnnotationConfigApplicationContext` | Host bağlamı — Pano servislerini `getBean(...)` ile alın |
| `pluginEventManager` | `PluginEventManager` | Eklentiler-arası olayları tetikleyin/alın |
| `pluginUiManager` | `PluginUiManager` | Arayüz paketi kaydı (sizin için yönetilir) |
| `environmentType` | `Main.Companion.EnvironmentType` | `DEVELOPMENT` / `RELEASE` |
| `releaseStage` | `ReleaseStage` | alpha / beta / stable kanalı |
| `pluginState` | `PluginState` | PF4J yükleme durumu |
| `pluginDataFolder` | `File` | `plugins/<pluginId>/` veri dizini (otomatik oluşturulur) |
| `logger` | `Logger` | Sınıfınıza kapsamlı SLF4J logger'ı |

### Yaşam döngüsü kancaları

Hepsi `open suspend fun`'dır, varsayılan olarak no-op — yalnızca ihtiyacınız olanı override edin. Sıralı:

```
jar load → onCreate() → onEnable() → onStart()
        …running…
onStop() → onDisable() → onUninstall()
```

| Kanca | Ne zaman çalışır |
|---|---|
| `onCreate()` | Plugin nesnesi oluşturulduğunda |
| `onEnable()` | Eklenti etkinleştirildiğinde |
| `onStart()` | Eklenti başladığında — başlatma kodunuz buraya gelir (kurulum kapısıyla) |
| `onStop()` | Eklenti durdurulurken — zamanlayıcıları/işleri burada iptal edin |
| `onDisable()` | Eklenti devre dışı bırakıldığında (veri korunur) |
| `onUninstall()` | Eklenti **silindiğinde** — tablolarınızı burada düşürün |
| `verifyLicense()` | Panelin "Lisansı yenile" butonu (premium eklentiler) |

### Metotlar

| Metot | İmza | Amaç |
|---|---|---|
| `registerSingletonGlobal` | `(bean: Any)` | Bir bean'i diğer eklentilerle paylaş |
| `unRegisterGlobal` | `(bean: Any)` | Paylaşılan bir bean'i kaldır |
| `register` | `(listener: PluginEventListener)` | Dinamik bir olay dinleyicisi kaydet |
| `unRegister` | `(listener: PluginEventListener)` | Dinamik bir olay dinleyicisini kaldır |
| `registerCommands` | `(obj: Any)` | Bir nesnedeki `@Command` metotlarını kaydet |
| `unRegisterCommands` | `(obj: Any)` | Onları kaldır |
| `getLicenseManager` | `(): LicenseManager` | Host lisans servisi (premium) |
| `getLicenseJwtIssuer` | `(): String` | Lisans JWT'leri için beklenen `iss` |
| `getOwnJarSha256` | `(): String?` | Yüklenen jar'ın SHA-256'sı ya da null |

::: warning Host bean'leri enjekte edilemez
Yapıcı enjeksiyonu (constructor injection) yalnızca *sizin* bean'leriniz için çalışır (`pluginBeanContext` içindekiler). Pano'nun kendi servisleri (`DatabaseManager`, `AuthProvider`, `SetupManager`, …) `applicationContext` içinde yaşar — onları `applicationContext.getBean(SomeService::class.java)` ile, ideal olarak `by lazy` şeklinde alın.
:::

## 2. Stereotip anotasyonlar

Bunları taşıyan sınıflar, eklentiniz yüklendiğinde otomatik olarak keşfedilir ve örneklenir — elle kayıt çağrısı yoktur. `@EventListener` **hariç** hepsi `com.panomc.platform.annotation` içinde yaşar.

*Kaynak: `com.panomc.platform.annotation.*`, `com.panomc.platform.api.annotation.EventListener`*

| Anotasyon | Şuna koyun | Amaç |
|---|---|---|
| `@Endpoint` | bir `Api` alt sınıfına | HTTP rotasını kaydeder |
| `@Dao` | bir `Dao` uygulamasına (`@Lazy @Scope(SCOPE_SINGLETON)` ile eşleştirin) | DAO singleton'ını kaydeder |
| `@Migration` | bir `DatabaseMigration` veya `PluginConfigMigration`'a | Migration'ı kaydeder |
| `@EventListener` | bir olay-dinleyici sınıfına | Dinleyiciyi kaydeder |
| `@PermissionDefinition` | bir `Permission` alt sınıfına | İzni kaydeder |
| `@NotificationDefinition` | bir bildirim türüne | Bildirim türünü kaydeder |
| `@Event` | bir MC-sunucu WS işleyicisine (yalnızca host) | Eklentiler bunun yerine `ServerManager.registerEvent` kullanır |
| `@Ignore` | bir varlık (entity) alanına | Alanı sütun eşlemesinden hariç tutar |

::: warning Spring'inkini değil, Pano'nun `@EventListener`'ını kullanın
Anotasyon `com.panomc.platform.api.annotation.EventListener`'dır — `org.springframework.context.event.EventListener` **değil**. Basit adları aynıdır; yanlış olanı içe aktarırsanız olay sistemi dinleyicinizi sessizce hiç çağırmaz.
:::

## 3. HTTP uç noktaları ve yönlendirme

Bir uç nokta, temel API sınıflarından birini genişleten, `@Endpoint` ile anotasyonlanmış bir sınıftır. Yapıcı enjeksiyonu (constructor injection) DAO'larınızı ve bean'lerinizi bağlar.

*Kaynak: `com.panomc.platform.model` (`Route`, `Path`, `RouteType`, `Api`, `LoggedInApi`, `PanelApi`, `SetupApi`, `Template`, `Result`, `Error`)*

### Rota ilkelleri (primitive)

| Tür | İmza | Amaç |
|---|---|---|
| `Path` | `Path(url: String, routeType: RouteType)` | Uç noktanın yanıtladığı bir URL + metot |
| `RouteType` | `ROUTE`, `GET`, `POST`, `PUT`, `DELETE` | HTTP metodu (`ROUTE` = herhangi biri/template) |
| `Route.paths` | `val paths: List<Path>` | Bu rotanın işlediği yollar (zorunlu) |
| `Route.order` | `open val order = 1` | Rekabet eden rotalar arasında eşleşme sırası |
| `Route.getValidationHandler` | `(schemaRepository): ValidationHandler?` | İstek gövdesi/sorgu doğrulaması |
| `Route.corsHandler` | `open fun corsHandler(): Handler?` | CORS'u override et (varsayılanlar sağlanır) |
| `Route.bodyHandler` | `open fun bodyHandler(): Handler?` | Gövde ayrıştırmayı override et (yüklemelere bakın) |

### Temel sınıflar — kimin çağırabileceğine göre seçin

| Temel sınıf | Kime izin verilir | Yolları şöyle bildirin |
|---|---|---|
| `Api` | Herkes (public) | `/api/...` |
| `LoggedInApi` | Oturum açmış herhangi bir kullanıcı | `/api/...` |
| `PanelApi` | Yöneticiler (`LoggedInApi`'yi genişletir) | `/api/panel/...` |
| `SetupApi` | Yalnızca ilk kurulum sırasında | `/api/...` |
| `Template` | Sunucuda render edilen HTML rotası | — |

::: tip Panel yolları `/api/panel/...` olarak bildirilir
Pano, panel arayüzünün `/panel/api/*` çağrılarını dahili olarak `/api/*`'a yeniden yönlendirir; bu yüzden bir `PanelApi`, tarayıcı `/panel/api/...` istese de `Path`'ini `/api/panel/...` biçiminde bildirir.
:::

### Bir isteği işleme (`Api` üyeleri)

| Üye | İmza | Amaç |
|---|---|---|
| `handle` | `abstract suspend fun handle(context: RoutingContext): Result?` | Uç nokta gövdeniz |
| `getSqlClient` | `suspend fun getSqlClient(): SqlClient` | Paylaşılan SQL istemcisi |
| `getParameters` | `fun getParameters(context): RequestParameters` | Doğrulanmış gövde/sorgu/yol parametreleri |
| `checkSetup` | `fun checkSetup()` | Kurulum yapılmadıysa `InstallationRequired` fırlat |
| `isAllowedInDemo` | `open fun isAllowedInDemo(method: HttpMethod): Boolean` | Örnek demo modunda çalışırken yazmaları kapıla |

### Sonuçlar ve hatalar

| Şey | İmza | Amaç |
|---|---|---|
| `Successful` | `Successful(map: Map = emptyMap())` | Başarı → `{"result":"ok", …map…}` |
| `Errors` | `Errors(map: Map)` | Alan düzeyinde hata yükü |
| `Error` alt sınıfları | `throw NotFound()` / `BadRequest()` / … | `com.panomc.platform.error` içinde ~100 önceden tanımlı (`NotFound`, `BadRequest`, `NoPermission`, `NotLoggedIn`, `InternalServerError`, …) |
| Özel hata | `class MyError : Error(statusCode, …)` | İstemci hata kodu = sınıfın basit adı `UPPER_SNAKE` biçiminde |

Bir isteği başarısız kılmak için bir `Error` **fırlatırsınız** — onu döndürmezsiniz. Doğrulama başarısızlıkları sizin için `BadRequest`'e dönüştürülür.

### Dosya yüklemeleri — özel `bodyHandler()`

Multipart yüklemeleri kabul etmek için `bodyHandler()`'ı override edin ve `Bodies.multipartFormData` ile doğrulayın. Kalıp (bkz. `pano-plugin-slider` `PanelAddSliderItemAPI`):

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

Tablo başına üç dosya — model, soyut DAO, `@Dao` uygulaması — artı isteğe bağlı migration'lar. [Backend Geliştirme](/tr/addon/backend/) eğitimi bunu baştan sona inşa eder.

*Kaynak: `com.panomc.platform.db` (`Dao`, `DBEntity`, `DatabaseMigration`), `com.panomc.platform.api.PluginDatabaseManager`*

| Tür | İmza | Amaç |
|---|---|---|
| `DBEntity` | `abstract class` (statik `gson`'a sahip) | Bir satır modelinin tabanı; bir anotasyon **değil** |
| `@Ignore` | alan anotasyonu | Bir model alanını sütun eşlemesinin dışında tut |
| `Dao<T : DBEntity>` | `abstract class Dao<T>(entityClass: Class<T>)` | Temel DAO |
| `Dao.init` | `abstract suspend fun init(sqlClient: SqlClient)` | `CREATE TABLE IF NOT EXISTS …` buraya |
| `Dao.uninstall` | `open suspend fun uninstall(sqlClient: SqlClient)` | `DROP TABLE …` (isteğe bağlı) |
| `Dao.fields` | `open val fields: List<String>` | Sorgu oluşturma için sütun adları |
| `Dao.tableName` | `protected val tableName` | Entity sınıf adı `snake_case` biçiminde |
| `Dao.getTablePrefix` | `fun getTablePrefix(): String` | Örneğin tablo öneki |
| `Row.toEntity()` | uzantı (extension) | Bir satır → modeliniz (Gson aracılığıyla) |
| `RowSet.toEntities()` | uzantı | Birçok satır → `List<T>` |
| `List<String>.toTableQuery()` | uzantı | Ters tırnaklı sütun listesi |
| `DatabaseMigration` | `DatabaseMigration(from: Int, to: Int, info: String)` | Bir şema adımı; `val handlers: List<suspend (SqlClient) -> Unit>`'i override et |
| `PluginDatabaseManager.initialize` | `suspend fun initialize(plugin: PanoPlugin)` | Tabloları oluştur + bekleyen migration'ları çalıştır |
| `PluginDatabaseManager.uninstall` | `suspend fun uninstall(plugin: PanoPlugin)` | Her DAO'nun `uninstall()`'unu çalıştır |

Pano'nun kendi tablolarına karşı ham SQL, host `DatabaseManager` üzerinden gider (`databaseManager.getSqlClient()`, `userDao` gibi çekirdek DAO'lar); coroutine'ler Vert.x future'larını `coAwait()` ile bekler.

::: warning `onUninstall` tablolarınızı düşürür
`pluginDatabaseManager.uninstall(this)`, **her DAO'nun `uninstall()`'unu** çalıştırır — bu, panelin **Sil** eylemidir, **Devre dışı bırak** değil. Devre dışı bırakmak veriyi korur.
:::

## 5. Yapılandırma

`PluginConfig`'i genişleten bir yapılandırma sınıfı, ilk çalıştırmada `plugins/<pluginId>/config.conf`'a (HOCON) yazılır ve tipli olarak geri okunur.

*Kaynak: `com.panomc.platform.api.config` (`PluginConfig`, `PluginConfigManager`, `PluginConfigMigration`, `ConfigComment`, `ConfigSection`)*

| Tür | İmza | Amaç |
|---|---|---|
| `PluginConfig` | `open class PluginConfig` (`version: Int`'e sahip) | Yapılandırmanızın tabanı; kendi alanlarınızı varsayılanlarla ekleyin |
| `PluginConfigManager<T>` | `PluginConfigManager(plugin, T::class.java)` | Bir yapılandırma sınıfı için dosyayı yükler/kaydeder |
| `.config` | `val config: T` | Mevcut tipli değerler |
| `.saveConfig` | `fun saveConfig(config: JsonObject)` | Değişiklikleri diske kalıcılaştır |
| `.configFilePath` | `val configFilePath: String` | `config.conf`'un çözümlenmiş yolu |
| `PluginConfigMigration` | `PluginConfigMigration(from: Int, to: Int, versionInfo: String)` | `fun migrate(config: JsonObject)`'i override et; `@Migration` ile anotasyonla |
| `@ConfigComment` | `@ConfigComment(vararg lines: String)` | Üretilen dosyada bir alanın üzerine doküman yorumu |
| `@ConfigSection` | `@ConfigSection(title: String)` | Anahtarları bir başlık altında grupla |

Yöneticiyi `onStart()` sırasında `pluginBeanContext` içinde bir singleton olarak kaydedin (bkz. [Backend Geliştirme](/tr/addon/backend/) eğitiminin giriş sınıfı); istek zamanında onu tembel (lazy) olarak alın.

## 6. Olay dinleyicileri

Bunların çoğu aynı şekilde çalışır: arayüzü uygulayın, sınıfı `@EventListener` ile anotasyonlayın; olay tetiklendiğinde Pano sizi çağırır. Metotları, abstract olarak işaretlenmedikçe varsayılan no-op'lu `suspend`'dir, yani yalnızca ihtiyacınız olanı override edersiniz — istisna, `onInitRouteList` ve `onRouterCreate`'i uygulamanız gereken düz (non-`suspend`) **abstract** fonksiyonlar olan `RouterEventListener`'dır. (`PluginLifecycleListener` aykırı olandır — tablonun altındaki nota bakın.)

*Kaynak: `com.panomc.platform.api.event.*`*

| Arayüz | Metotlar (plugin ile ilgili) |
|---|---|
| `SetupEventListener` | `onSetupFinished()` |
| `RouterEventListener` | `onInitRouteList(routes: MutableList<Route>)`, `onRouterCreate(router: Router)` |
| `AuthEventListener` | `onBeforeAuthenticate(context, sqlClient): LoginDecision?`, `onBeforeVerifyLinkCode(context, sqlClient): LoginDecision?`, `onBeforeLogin(user, context, sqlClient): LoginDecision?`, `onAfterLogin(user, context, sqlClient)`, `onAfterRegister(user, sqlClient)` |
| `PlayerEventListener` | `onDelete(user: User)` — hesap-silme temizliği |
| `ProfilePictureEventListener` | `resolveProfilePictureUrl(user: User): String?` |
| `PluginLifecycleListener` | `onPluginLoad/Enable/Disable/Unload/Uninstall(plugin: PanoPlugin)` |
| `PluginEventListener` | Kendi eklentiler-arası olaylarınız için işaretleyici (marker) |

`onBeforeLogin` ve benzerleri bir `LoginDecision` döndürür: `Deny(errorKey, extras)`, `RequireUsername(userId)` veya `Allow`.

Kaydetmenin iki yolu: paketinizde bir `@EventListener` sınıfı (statik) ya da çalışma zamanında dinamik dinleyiciler için `plugin.register(listener)` / `plugin.unRegister(listener)`.

::: warning `PluginLifecycleListener` istisnadır — `@EventListener` yok
Tablodaki diğer her satırın aksine, `PluginLifecycleListener`, `EventListener` işaretleyicisini (marker) genişletmez ve `@EventListener` tarafından keşfedilmez (onu öyle anotasyonlamak asla tetiklenmez ve host'un dahili `as EventListener` dönüşümünü bozar). Onu açıkça `applicationContext.getBean(PluginManager::class.java).addLifecycleListener(listener)` ile kaydedin.
:::

::: tip Eklentiler-arası olaylar
Bir `PluginEventListener` alt arayüzü tanımlayın, plugin bean'inizi `registerSingletonGlobal(this)` ile paylaşın ve abonelere `PluginEventManager.getEventListeners<YourListener>()` aracılığıyla tetikleyin — bu bir **companion-object** fonksiyonudur, bu yüzden onu enjekte edilen `pluginEventManager` örneği üzerinde değil, sınıf-nitelikli (`PluginEventManager.…`) olarak çağırın.
:::

## 7. İzinler ve kimlik doğrulama

*Kaynak: `com.panomc.platform.auth` (`Permission`, `PanelPermission`, `AuthProvider`)*

| Tür | İmza | Ürettiği düğüm (node) |
|---|---|---|
| `Permission` | `open class Permission(iconName: String)` | `pano.<key>` |
| `PanelPermission` | `open class PanelPermission(iconName: String)` | `pano.plugin.<pluginId>.<dotted.key>` |
| `@PermissionDefinition` | sınıf anotasyonu | İzni otomatik kaydeder |

Düğüm, sınıf adından türetilir: sondaki `Permission`'ı atın, kelimelere bölün, küçük harfe çevirin, noktalarla birleştirin ve (bir plugin `PanelPermission`'ı için) başına `pano.plugin.<pluginId>.` ekleyin — yani `ManageShoutboxPermission` → `pano.plugin.pano-plugin-shoutbox.manage.shoutbox`. Aynı dize, panel sayfalarını ve gezinme bağlantılarını kapılamak için arayüz kodunuzda bire bir tekrarlanır.

**`AuthProvider`** (`getBean` aracılığıyla host bean'i):

| Metot | İmza | Amaç |
|---|---|---|
| `requirePermission` | `suspend fun requirePermission(permission: Permission, context: RoutingContext)` | Kullanıcıda yoksa fırlat |
| `hasPermission` | `suspend fun hasPermission(permission: Permission, context: RoutingContext): Boolean` | Fırlatmayan kontrol |
| `isLoggedIn` | `suspend fun isLoggedIn(context: RoutingContext): Boolean` | — |
| `hasAccessPanel` | `suspend fun hasAccessPanel(context: RoutingContext): Boolean` | Herhangi bir panel erişimi |
| `getUserIdFromRoutingContext` | `fun getUserIdFromRoutingContext(context: RoutingContext): Long` | Mevcut kullanıcı id'si |
| `requirePassword` | `suspend fun requirePassword(password: String?, context: RoutingContext)` | Yeniden kimlik doğrulama (yanlışsa fırlatır) |
| `isUserAdmin` | `suspend fun isUserAdmin(userId: Long): Boolean` | — |

## 8. Minecraft sunucu iletişimi

Oyun içi plugin ile şifreli WebSocket bağlantısı üzerinden konuşun. İşleyicileri kaydedin ve mesajları `ServerManager` aracılığıyla gönderin (bkz. `pano-plugin-premium-login`).

*Kaynak: `com.panomc.platform.server` (`ServerManager`, `ServerEvent`, `PlatformMessage`)*

| Üye | İmza | Amaç |
|---|---|---|
| `ServerManager.registerEvent` | `fun registerEvent(event: ServerEvent<*, *>)` | Gelen bir olay türünü işle |
| `ServerManager.unregisterEvent` | `fun unregisterEvent(event: ServerEvent<*, *>)` | Onu işlemeyi durdur |
| `ServerManager.sendMessage` | `fun sendMessage(message: PlatformMessage, server: Server)` | Tek bir sunucuya gönder-ve-unut |
| `ServerManager.getConnectedServers` | `fun getConnectedServers(): Map<…>` | Şu anda bağlı sunucular |
| `ServerManager.isConnected` | `fun isConnected(id: Long): Boolean` | — |
| `ServerEvent<R, M>` | `abstract suspend fun handle(request: R, server: Server): M?` | Gelen olay işleyicisi |
| `PlatformMessage` | `interface` | Giden mesaj şekli |

**Tel adları (wire name)** sınıf adından türetilir: bir `ServerEvent`, `Event` sonekini atar; bir `PlatformMessage`, `Message`'ı atar; ardından her ikisi de `UPPER_SNAKE`'e dönüşür (`getEventName()` / `getResponseName()`). Yani `PlayerJoinEvent` ⇄ tel adı `PLAYER_JOIN`.

## 9. Token'lar

İmzalı token'lar oluşturun ve doğrulayın (sihirli-giriş bağlantıları, tek seferlik eylemler). Host'un onu sökme (unload) sırasında temizlemesi için türünüzü kaydedin (bkz. `pano-plugin-auth-guard` `MagicLoginTokenType`).

*Kaynak: `com.panomc.platform.token` (`TokenType`, `TokenTypeRegistry`, `TokenProvider`)*

| Üye | İmza | Amaç |
|---|---|---|
| `TokenType` | `interface` — `getName(): String`, `getExpireDate(): Long` (son kullanma epoch milisaniye olarak) | Token türünüz (ad varsayılan olarak sınıf adından `TokenType` çıkarılmış, `UPPER_SNAKE`) |
| `TokenTypeRegistry.registerPluginToken` | `fun registerPluginToken(pluginId: String, tokenType: TokenType)` | Kaydet (sökme sırasında otomatik kaldırılır) |
| `TokenProvider.generateToken` | `fun generateToken(subject: String, tokenType: TokenType): Pair<String, Long>` | Yeni token + son kullanma |
| `TokenProvider.saveToken` | `suspend fun saveToken(…)` | Onu kalıcılaştır |
| `TokenProvider.isTokenValid` | `suspend fun isTokenValid(token, tokenType, sqlClient): Boolean` | — |
| `TokenProvider.invalidateToken` | `suspend fun invalidateToken(token, sqlClient)` | Birini iptal et |
| `TokenProvider.invalidateTokensBySubjectAndType` | `suspend fun (…)` | Bir öznenin (subject) bir türdeki token'larını iptal et |
| `TokenProvider.parseToken` | `fun parseToken(token: String): DecodedJWT` | İddiaları (claims) çöz |

## 10. Bildirimler ve e-posta

*Kaynak: `com.panomc.platform.notification` (`NotificationManager`, `UserNotificationType`, `PanelUserNotificationType`), `com.panomc.platform.mail` (`MailManager`, `Mail`)*

**Bildirimler** — `UserNotificationType` veya `PanelUserNotificationType`'ı alt sınıflayın, `@NotificationDefinition` ile anotasyonlayın, ardından `NotificationManager` aracılığıyla gönderin:

| Metot | Kime gönderir |
|---|---|
| `sendNotification(…)` | Bir kullanıcıya |
| `sendPanelNotification(…)` | Bir kullanıcının paneline |
| `sendNotificationToAll(…)` | Her kullanıcıya |
| `sendPanelNotificationToAll(…)` | Her kullanıcının paneline |
| `sendNotificationToAllAdmins(…)` | Tüm yöneticilere |
| `sendNotificationToAllWithPermission(…)` | Bir izne sahip herkese |

**E-posta** — `Mail`'i uygulayın, `MailManager` ile gönderin (bkz. `pano-plugin-auth-guard` `MagicLoginMail`):

| Üye | İmza | Amaç |
|---|---|---|
| `MailManager.sendMail` | `suspend fun sendMail(sqlClient, userId: Long?, mail: Mail, email: String? = null)` | Render et + gönder |
| `Mail.templatePath` | `val templatePath: String` | Handlebars şablon yolu |
| `Mail.subject` | `val subject: String` | Konu satırı |
| `Mail.generateParameters` | `suspend fun generateParameters(systemParameters, i18nManager, locale): MailParameters` | Şablon değişkenleri |

## 11. Konsol komutları

Metotları `@Command` ile anotasyonlayın, ardından onları tutan nesneyi kaydedin.

*Kaynak: `com.panomc.platform.command` (`Command`, `CommandSender`)*

| Üye | İmza | Amaç |
|---|---|---|
| `@Command` | `@Command(name, aliases = [], description = "", usage = "")` | Bir komut metodunu işaretler |
| metot şekli | `(sender: CommandSender)` veya `(sender: CommandSender, args: Array<String>)` | İşleyici |
| `PanoPlugin.registerCommands` | `fun registerCommands(obj: Any)` | `obj` üzerindeki tüm `@Command` metotlarını kaydet |
| `PanoPlugin.unRegisterCommands` | `fun unRegisterCommands(obj: Any)` | Onları kaldır |
| `CommandSender.sendMessage` | `fun sendMessage(message: String)` | Çağırana yanıt ver |

## 12. Etkinlik günlükleri

Yönetici eylemlerini, panelin Etkinlik akışında görünmeleri için kaydedin. `PluginActivityLog`'u alt sınıflayın ve host `DatabaseManager` aracılığıyla ekleyin.

*Kaynak: `com.panomc.platform.db.model.PluginActivityLog`*

| Üye | İmza | Amaç |
|---|---|---|
| `PluginActivityLog` | `open class PluginActivityLog(userId: Long, pluginId: String, details: JsonObject = JsonObject())` | Günlük girdiniz |
| ekleme | `databaseManager.panelActivityLogDao.add(log, sqlClient)` | Onu yaz |

Panel, her girdiyi, sınıf adından türetilen (`Log` çıkarılmış, `UPPER_SNAKE`) ve bir `activity-logs` nesnesi altında bulunan bir yerel ayar (locale) anahtarıyla render eder — `CreatedShoutLog` → `activity-logs.CREATED_SHOUT`, `details` yükünden doldurulur. Bkz. [Çeviriler](/tr/addon/localization/).

## 13. Host bean'leri

Pano'nun kendi servisleri, host `applicationContext` içinde Spring tarafından yönetilen bean'lerdir ve `applicationContext.getBean(<Class>::class.java)` ile alınır — yapıcılarınıza enjekte edilemezler. Aşağıdakilerin çoğu (`DatabaseManager`, `PluginDatabaseManager`, `SetupManager`, `AuthProvider`, `ServerManager`, `TokenProvider`, `NotificationManager`, `MailManager`, `LicenseManager`, `ConfigManager`, `PluginManager`) `@Component` sınıflarıdır — ve `TokenTypeRegistry` bir `@Service`'tir — `@ComponentScan("com.panomc.platform")` tarafından keşfedilir; yalnızca altyapı bean'leri (`Vertx`, `Router`, `WebClient`, `Gson`, `SchemaRepository`, artı logger, template engine, `HttpClient`, `PluginUiManager` ve `PluginEventManager`) `com.panomc.platform.SpringConfig` içinde `@Bean` ile bildirilir.

| Bean | Ne için kullanılır |
|---|---|
| `DatabaseManager` | Paylaşılan SQL istemcisi, çekirdek DAO'lar, `panelActivityLogDao` |
| `PluginDatabaseManager` | Tablolarınız ve migration'larınız |
| `SetupManager` | `isSetupDone()` — DB işini kapıla |
| `AuthProvider` | İzin ve giriş kontrolleri |
| `ServerManager` | Minecraft sunucu iletişimi |
| `TokenProvider` / `TokenTypeRegistry` | Token'lar |
| `NotificationManager` | Bildirimler |
| `MailManager` | E-posta |
| `LicenseManager` | Premium lisans getirme |
| `ConfigManager` | Host (platform) yapılandırması |
| `Vertx` | Zamanlayıcılar, olay veri yolu |
| `WebClient` | Giden HTTP |
| `Gson` | JSON (paylaşılan örnek) |
| `Router` | Vert.x web router'ı |
| `SchemaRepository` | Doğrulama şemaları |
| `PluginManager` | Plugin kaydı |

## 14. Lisans (premium eklentiler)

Premium eklentiler, imzalı bir lisansı derleme zamanı bir açık anahtara karşı doğrular. Host yalnızca taşımadır; doğrulama, eklentinizin sınırıdır. Bu bir özettir — tüm bağlantı işi, kopyalanan `PluginLicenseClient`/`LicenseGuard` ve başarısızlık davranışı [Premium Eklentiler](/tr/addon/premium/) sayfasında ele alınır.

*Kaynak: `com.panomc.platform.license` (`LicenseManager`, `SignedLicense`, `LicenseClaims`, `LicenseRequiredException`)*

| Üye | İmza | Amaç |
|---|---|---|
| `PanoPlugin.getLicenseManager` | `(): LicenseManager` | JWT'yi getiren host servisi |
| `LicenseManager.requireLicense` | `(plugin, resourceId, version)` | Eklentiniz için (önbelleklenmiş) lisansı getir |
| `SignedLicense.verifySignature` | `(publicKey, expectedIssuer)` | *Kendi* gömülü anahtarınıza karşı RS256 doğrulaması |
| `LicenseClaims` | `issuer, platformId, resourceId, userId, version, jarSha256, issuedAtMs, expiresAtMs, keyId, tokenId` | Çapraz kontrol için ayrıştırılmış iddialar (claims) |
| `LicenseRequiredException` | `(pluginId, reason, message, cause)` | Kapalı başarısız olmak için `onStart()`'tan fırlat |

## 15. Çeşitli ve kalıplar

Küçük yardımcılar ve tek bir API olmayan ama adlandırılmaya değer iki yinelenen deyim.

| Şey | Nerede | Amaç |
|---|---|---|
| Jar kaynak okuma | classloader | `javaClass.classLoader.getResourceAsStream(path)` — `PanoPlugin`'in `getResource`'u yoktur; bkz. `pano-plugin-auth-guard` `MagicLoginMail` |
| `pluginDataFolder` | `PanoPlugin` | `plugins/<pluginId>/` diziniz (yüklemeler, `config.conf`) |
| `logger` | `PanoPlugin` | Sınıf kapsamlı SLF4J logger'ı |

**Arka plan işleri** — Vert.x ile zamanlayın ve bir `AtomicBoolean` ile çakışmaya karşı koruyun; `onStop()`/`onDisable()` içinde iptal edin (bkz. `pano-plugin-market` `MarketPlugin`):

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

**Gizli bilgileri maskeleme** — bir yapılandırma `GET` uç noktası, gizli alanları maskelenmiş döndürmelidir; gerçek değeri yalnızca bir parola yeniden-kimlik-doğrulama kontrolüyle kapılanan ayrı bir uç nokta aracılığıyla açığa çıkarın — ya `authProvider.requirePassword(password, context)` (bkz. `pano-plugin-auth-guard` `TwoFactorDisableAPI`) ya da elle bir `databaseManager.userDao.isLoginCorrect(...)` kontrolü (`pano-plugin-social-login` `PanelRevealSecretAPI` içindeki maskeleme kalıbı).

## Sırada ne var

- **[Backend Geliştirme](/tr/addon/backend/)** — bu API'leri derlenen kodda bir araya getiren işlenmiş Shoutbox eğitimi.
- **[Çeviriler](/tr/addon/localization/)** — izinler ve etkinlik günlükleri için yerel ayar anahtarları.
- **[Premium Eklentiler](/tr/addon/premium/)** — 14. grup için tam lisans-doğrulama bağlantı işi.
- **[Arayüz API Referansı](/tr/addon/api-reference/)** — arayüz yarısı için `pano.*` ve `@panomc/sdk` yüzeyi.
