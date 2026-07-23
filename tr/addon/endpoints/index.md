# Endpoint'ler (Rotalar ve JSON API'leri)

**Bu sayfa size ne verir:** sona geldiğinizde, JSON döndüren size ait herkese açık bir URL'niz ve istek gövdesini doğrulayan yalnızca-yönetici bir panel URL'niz olacak — Shoutbox'ın, bir temanın shout'ları okuyabilmesi ve bir yöneticinin bunları yayınlayabilmesi için ihtiyaç duyduğu iki uç nokta.

Bir **uç nokta** (endpoint), eklentinizin yanıtladığı bir web adresidir. Pano'nun temel API sınıflarından birini genişleten, `@Endpoint` ile işaretlenmiş bir sınıf yazarsınız; Pano, eklentiniz yüklendiği an rotayı kaydeder — hiçbir yerde bir kayıt çağrısı yoktur.

Her backend düzenlemesi yürürlüğe girmeden önce bir yeniden-derle-ve-yeniden-başlat gerektirir — o adım için [Backend genel bakışı](/tr/addon/backend/)'na bakın.

## Herkese açık bir API uç noktası

Shout'ları temaya sunun. Herkese açık bir JSON uç noktası `Api`'yi genişletir (dosya `routes/api/GetShoutsAPI.kt`):

```kotlin
package com.panomc.plugins.shoutbox.routes.api

import com.panomc.platform.annotation.Endpoint
import com.panomc.platform.model.*
import com.panomc.plugins.shoutbox.db.dao.ShoutDao
import io.vertx.ext.web.RoutingContext
import io.vertx.ext.web.validation.ValidationHandler
import io.vertx.ext.web.validation.builder.ValidationHandlerBuilder
import io.vertx.json.schema.SchemaRepository

@Endpoint
class GetShoutsAPI(private val shoutDao: ShoutDao) : Api() {
    override val paths = listOf(Path("/api/shoutbox/list", RouteType.GET))

    override fun getValidationHandler(schemaRepository: SchemaRepository): ValidationHandler =
        ValidationHandlerBuilder.create(schemaRepository).build()

    override suspend fun handle(context: RoutingContext): Result {
        val sqlClient = getSqlClient()
        return Successful(mapOf("shouts" to shoutDao.getAll(sqlClient)))
    }
}
```

Ne oluyor:

- `@Endpoint`, rotanın eklenti yüklendiği an kendini kaydetmesini sağlar — hiçbir yerde bir kayıt çağrısı yoktur.
- `ShoutDao` doğrudan kurucuya enjekte edilir, çünkü bu uç noktayla birlikte **sizin kutunuzda** yaşar (kurucu enjeksiyonu — bkz. [Backend genel bakışı](/tr/addon/backend/#pano-sınıflarınızı-sizin-icin-nasıl-olusturur)). DAO'nun kendisi [Veritabanı ve Migrasyonlar](/tr/addon/database/) sayfasında inşa edilir.
- `paths`, URL'yi ve HTTP metodunu listeler. Temel sınıfı, kime izin verildiğine göre seçin: `Api` (herkese açık), `LoggedInApi` (giriş yapmış herhangi bir kullanıcı), `PanelApi` (yöneticiler), `SetupApi` (yalnızca kurulum sırasında).
- `getSqlClient()`, `Api` üzerinde paylaşılan SQL istemcisini size veren bir kolaylıktır.
- **Doğrulanacak bir şey olmasa bile `getValidationHandler`'ı geçersiz kılmalısınız** — boş oluşturucuyu tam olarak gösterildiği gibi döndürün (`ValidationHandlerBuilder.create(schemaRepository).build()`). Bu geçersiz kılmayı silmeyin; derleme buna ihtiyaç duyar. Aşağıdaki panel uç noktası, onun bir istek gövdesi üzerinde gerçek iş yaptığını gösterir.
- Başarı `Successful(map)`'tir, ki bu `{"result":"ok", …haritanız…}`'a serileştirilir. Başarısız olmak için, bir platform `Error` alt sınıfını (`NotFound`, `BadRequest`, `NoPermission`, …) veya kendinizinkini **fırlatırsınız** (throw); istemciye gönderilen hata kodu, sınıf adının `UPPER_SNAKE` hâlidir.

::: tip Kontrol noktası: ilk uç noktanıza vurun
Ödül budur — JSON'unuzu döndüren size ait bir URL. Yeniden derleyin, kopyalayın, yeniden başlatın, sonra uç noktanızı bir tarayıcıda açın (veya `curl` ile isteyin):

```
http://localhost:8088/api/shoutbox/list
```

`8088` portu, Pano'yu `--dev` ile başlattığınızdaki adrestir; varsayılan bir kurulumda Pano `80` portunu dinler, dolayısıyla bunun yerine `http://localhost/api/shoutbox/list` kullanın. Her hâlükârda şunu görmelisiniz:

```json
{"result":"ok","shouts":[]}
```

**Boş** bir `shouts` listesi — çünkü henüz kimse bir shout yayınlamadı. Bu sayfanın sonunda bir tane yayınlayacaksınız.
:::

**İsteğe bağlı: `maxShouts`'u işe koşun.** [Yapılandırma](/tr/addon/configuration/) sayfasında `maxShouts` yapılandırma anahtarını eklediyseniz, bu uç nokta onun ekmeğini kazandığı yerdir. O sayfadaki istek-anı yapılandırma-okuma desenini kullanarak, listeyi yapılandırılmış sayıyla sınırlayabilirsiniz. Geri kalan her şeyi zaten gördünüz; tek ekler `plugin`'i enjekte etmek (eklenti sınıfınız enjekte edilebilir) ve Kotlin'in standart `take(n)`'idir:

```kotlin
// Optional variant of handle(): respect maxShouts.
// For this to compile, also add `private val plugin: ShoutboxPlugin` to the constructor,
// alongside `shoutDao`, so you can reach pluginBeanContext.
val sqlClient = getSqlClient()
val configManager = plugin.pluginBeanContext.getBean(PluginConfigManager::class.java)
val limit = (configManager.config as ShoutboxConfig).maxShouts
return Successful(mapOf("shouts" to shoutDao.getAll(sqlClient).take(limit)))
```

## Bir panel uç noktası

Bir shout yayınlamak bir yönetici eylemidir, dolayısıyla bu uç nokta, herkese açık olanın yapmadığı üç şeyi yapar: **istek gövdesini doğrular**, **bir izni kontrol eder** ve **bir etkinlik günlüğü girdisi yazar**. Buradaki en büyük kod bloğudur — onu okurken bu üç işi sırayla arayın.

::: tip Panel yolları `/api/panel/` ile başlar
Panel URL'leri girişte bir kez yeniden yazılır ki bu ilk seferde herkesi şaşırtır. Onu soldan sağa bir eşleme olarak okuyun:

| Panel arayüzü şunu çağırır… | Pano onu şuna yeniden yazar… | Yani Kotlin'de şunu yazarsınız… |
|---|---|---|
| `POST /panel/api/shoutbox` | `/api/panel/shoutbox` | `Path("/api/panel/shoutbox", RouteType.POST)` |

**Pratik kural:** Kotlin'de, bir panel uç noktasının yolunu her zaman `/api/panel/` ile başlatın.
:::

::: warning Dikkat: bu dosya henüz tek başına derlenmez
`PanelAddShoutAPI`, [İzinler ve Etkinlik Günlükleri](/tr/addon/permissions/) sayfasında ele alınan iki sınıfa atıfta bulunur — `ManageShoutboxPermission` ve `CreatedShoutLog`. Üçünü de yazın, **sonra** bir kez derleyin. Bu bölümden hemen sonra derlerseniz, "unresolved reference" hataları bekleyin; bu, eksik iki sınıftan kaynaklanır, bu dosyadaki bir hatadan değil.
:::

Dosya `routes/panel/PanelAddShoutAPI.kt`:

```kotlin
package com.panomc.plugins.shoutbox.routes.panel

import com.panomc.platform.annotation.Endpoint
import com.panomc.platform.auth.AuthProvider
import com.panomc.platform.db.DatabaseManager
import com.panomc.platform.error.BadRequest
import com.panomc.platform.model.*
import com.panomc.plugins.shoutbox.ShoutboxPlugin
import com.panomc.plugins.shoutbox.db.dao.ShoutDao
import com.panomc.plugins.shoutbox.db.model.Shout
import com.panomc.plugins.shoutbox.log.CreatedShoutLog
import com.panomc.plugins.shoutbox.permission.ManageShoutboxPermission
import io.vertx.ext.web.RoutingContext
import io.vertx.ext.web.validation.RequestPredicate
import io.vertx.ext.web.validation.ValidationHandler
import io.vertx.ext.web.validation.builder.Bodies
import io.vertx.ext.web.validation.builder.ValidationHandlerBuilder
import io.vertx.json.schema.SchemaRepository
import io.vertx.json.schema.common.dsl.Schemas.*

@Endpoint
class PanelAddShoutAPI(
    private val plugin: ShoutboxPlugin,
    private val shoutDao: ShoutDao
) : PanelApi() {
    override val paths = listOf(Path("/api/panel/shoutbox", RouteType.POST))

    private val authProvider by lazy { plugin.applicationContext.getBean(AuthProvider::class.java) }
    private val databaseManager by lazy { plugin.applicationContext.getBean(DatabaseManager::class.java) }

    override fun getValidationHandler(schemaRepository: SchemaRepository): ValidationHandler =
        ValidationHandlerBuilder.create(schemaRepository)
            .body(
                Bodies.json(
                    objectSchema()
                        .requiredProperty("message", stringSchema())
                )
            )
            .predicate(RequestPredicate.BODY_REQUIRED)
            .build()

    override suspend fun handle(context: RoutingContext): Result {
        authProvider.requirePermission(ManageShoutboxPermission(), context)

        val data = getParameters(context).body().jsonObject
        val message = data.getString("message")

        if (message.isNullOrBlank()) {
            throw BadRequest()
        }

        val sqlClient = getSqlClient()
        val userId = authProvider.getUserIdFromRoutingContext(context)
        val username = databaseManager.userDao.getUsernameFromUserId(userId, sqlClient)!!

        shoutDao.add(Shout(message = message, username = username, date = System.currentTimeMillis()), sqlClient)
        databaseManager.panelActivityLogDao.add(CreatedShoutLog(userId, username, plugin.pluginId, message), sqlClient)

        return Successful()
    }
}
```

Üç yeni işin içinden geçelim:

- **Doğrulama** `Schemas` DSL'ini (`objectSchema()`, `requiredProperty`, `stringSchema()`) artı `RequestPredicate.BODY_REQUIRED`'ı kullanır. Eksik veya bozuk gövdeli bir istek, sizin `handle`'ınız hiç çalışmadan reddedilir.
- **İzin kontrolü:** `authProvider.requirePermission(ManageShoutboxPermission(), context)`, `handle`'ın en ilk satırıdır. Giriş yapmış yöneticide izin yoksa, fırlatır ve istek reddedilir. (`AuthProvider` ve `DatabaseManager` Pano'nun kendi servisleridir, dolayısıyla onları `getBean` ile Pano'nun kutusundan getirirsiniz.) İzin sınıfı [İzinler ve Etkinlik Günlükleri](/tr/addon/permissions/) sayfasında tanımlanır.
- **Etkinlik günlüğü:** `databaseManager.panelActivityLogDao.add(CreatedShoutLog(...), sqlClient)`, kimin ne yayınladığını kaydeder, böylece yönetici panelinin etkinlik akışı onu gösterebilir. `CreatedShoutLog` sınıfı aynı [İzinler ve Etkinlik Günlükleri](/tr/addon/permissions/) sayfasında tanımlanır.
- Oradaki bir Kotlin söz dizimi parçası: `getUsernameFromUserId(userId, sqlClient)!!` `!!` ile biter, ki bu "bu değer null değildir — bir şekilde null'sa çök" iddiasında bulunur. Burada güvenlidir, çünkü giriş yapmış bir yöneticinin her zaman bir kullanıcı adı vardır.

## Baştan sona deneyin

İşte bu sayfanın vaat ettiği tam döngü — bir veritabanı tablosu, herkese açık bir JSON API'si, korumalı bir yönetici uç noktası ve bir etkinlik günlüğü girdisi, hepsi birlikte çalışıyor. Boş listeyi zaten gördünüz; şimdi bir shout oluşturun ve belirişini izleyin.

1. **Önce:** `http://localhost:8088/api/shoutbox/list`'i açın (veya varsayılan bir kurulumda `80` port biçimini). Hâlâ `{"result":"ok","shouts":[]}` görmelisiniz.
2. **Bir shout yayınlayın:** giriş yapmış bir yönetici olarak, JSON gövdesi `{"message":"Hello Pano!"}` ile `POST /panel/api/shoutbox` gönderin. En kolay yol, [Frontend Geliştirme](/tr/addon/frontend/) sayfasında oluşturacağınız panel arayüzünden; şimdi hemen yapmak için, o URL'yi tarayıcınızın kimliği doğrulanmış oturumu üzerinden `curl` ile isteyin (uç nokta yönetici oturum çerezinize ihtiyaç duyar, panel arayüzünün daha basit yol olmasının nedeni budur).
3. **Sonra:** `http://localhost:8088/api/shoutbox/list`'i yenileyin — shout'unuz artık JSON'da:

```json
{"result":"ok","shouts":[{"id":1,"message":"Hello Pano!","username":"<you>","date":1700000000000}]}
```

4. **Etkinlik akışı:** **Panel → Etkinlik**'i açın — `CREATED_SHOUT` girdinizi göreceksiniz ([Çeviriler](/tr/addon/localization/) sayfasında yerelleştirme dizesini ekleyene kadar ham anahtar olarak gösterilir).

Dört adım da uyuşuyorsa, Shoutbox'ın backend yarısı bitti.

## Çalışmazsa

Backend sayfalarının uyardığı hatalar, tek bir yerde — belirti, neden, çözüm:

| Belirti | Olası neden | Çözüm |
|---|---|---|
| Eklenti **Panel → Eklentiler**'de listelenmemiş | jar `plugins/` içine kopyalanmamış veya Pano yeniden başlatılmamış | yeniden derleyin, jar'ı örneğin `plugins/`'ine `cp` edin ve Pano'yu **yeniden başlatın** |
| Etkinlik dinleyiciniz hiç tetiklenmiyor (kurulum kapısı hiç çalışmıyor) | Pano'nunki yerine Spring'in `@EventListener`'ını içe aktardınız | `com.panomc.platform.api.annotation.EventListener` kullanın (bkz. [Olaylar (Events)](/tr/addon/events/)) |
| Çökme: `NoSuchBeanDefinitionException` | `PluginConfigManager`'ı (veya `onStart`'ta kaydedilen başka bir bean'i) bir kurucu parametresi olarak aldınız | onu bunun yerine istek anında `plugin.pluginBeanContext.getBean(...)` ile getirin (bkz. [Yapılandırma](/tr/addon/configuration/)) |
| İstek `NO_PERMISSION` ile reddedildi | panel uç noktasını çağıran (yönetici-olmayan) role izin verilmemiş | onu **Panel → Roller**'de verin veya bir yönetici olarak test edin (yöneticiler kontrolü atlar — bkz. [İzinler](/tr/addon/permissions/)) |
| Bir Kotlin düzenlemesi yok sayılıyor gibi | yeniden başlatmak yerine eklentiyi devre dışı bırakıp/etkinleştirdiniz | Kotlin sıcak değildir — yeniden derleyin ve Pano'yu **yeniden başlatın** |

## Sırada ne var

- **[Veritabanı ve Migrasyonlar](/tr/addon/database/)** — bu sayfanın enjekte ettiği `ShoutDao`, artı arkasındaki model ve SQL.
- **[İzinler ve Etkinlik Günlükleri](/tr/addon/permissions/)** — panel uç noktasının derlenmesi için `ManageShoutboxPermission` ve `CreatedShoutLog`'u tanımlayın.
- **[Yapılandırma](/tr/addon/configuration/)** — isteğe bağlı varyantın okuduğu `maxShouts` anahtarını ekleyin.
- **[Backend API Referansı](/tr/addon/backend-reference/)** — adıyla her rota ilkeli, temel sınıf, sonuç ve hata.
