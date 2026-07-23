# İzinler ve Etkinlik Günlükleri

**Bu sayfa size ne verir:** sona geldiğinizde Shoutbox yönetici uç noktasını kapılayan izni tanımlamış, düğüm dizesinin nasıl türetildiğini bilmiş ve bir shout'u kimin yayınladığını kaydeden etkinlik günlüğü girdisini yazmış olacaksınız. Bunlar, [Endpoint'ler](/tr/addon/endpoints/) sayfasındaki panel uç noktasının atıfta bulunduğu iki sınıftır.

Her backend düzenlemesi yürürlüğe girmeden önce bir yeniden-derle-ve-yeniden-başlat gerektirir — bkz. [Backend genel bakışı](/tr/addon/backend/).

## İzin

Dosya `permission/ManageShoutboxPermission.kt`:

```kotlin
package com.panomc.plugins.shoutbox.permission

import com.panomc.platform.annotation.PermissionDefinition
import com.panomc.platform.auth.PanelPermission

@PermissionDefinition
class ManageShoutboxPermission : PanelPermission("fa-bullhorn")
```

`@PermissionDefinition` izni otomatik olarak kaydeder ve kurucudaki dize, panelin izin listesinde onun yanında gösterilen FontAwesome simgesidir.

**İzin düğümü** (permission node) — başka her yerde karşılaştırdığınız dize — sınıf adından bir kuralla türetilir:

1. Sondaki `Permission`'ı düşürün → `ManageShoutbox`.
2. Kelimelere bölün, küçük harfe çevirin, noktalarla birleştirin → `manage.shoutbox`.
3. `pano.plugin.<pluginId>.` ile öne ekleyin → **`pano.plugin.pano-plugin-shoutbox.manage.shoutbox`**.

O düğümü Kotlin'de asla yazmazsınız — `requirePermission`'a `ManageShoutboxPermission()` geçmek yeterlidir ([Endpoint'ler](/tr/addon/endpoints/) sayfasındaki panel uç noktası tam olarak bunu yapar). Ama panel sayfalarını ve gezinme bağlantılarını kapılamak (gate) için o tam dizeyi frontend kodunuzda **tekrarlarsınız**. Nerede olduğu için [Frontend Geliştirme](/tr/addon/frontend/) sayfasına bakın; Kotlin sınıfını yeniden adlandırırsanız, o kopyalanmış dizeyi güncellemeyi unutmayın.

::: tip Kontrol noktası: izni panelde görün
Bir yeniden derleme ve yeniden başlatmadan sonra, **Panel → Roller**'i açın ve bir rolü düzenleyin — bir **megafon** (bullhorn) simgeli yeni bir izin görmelisiniz (kurucudaki `fa-bullhorn` bu). Bir role vererek o rolün üyelerinin shout yayınlamasına izin verin.

İnsanları şaşırtan bir şey: **yöneticiler izin kontrollerini atlar** — bir yönetici hesabı `requirePermission`'ı her zaman geçer, dolayısıyla bir yönetici olarak kendinize hiçbir şey vermeden bile panel uç noktasını çağırabilirsiniz. `NO_PERMISSION` reddini gerçekten görmek için, izin verilmemiş **yönetici-olmayan** bir rolle test edin.
:::

## Etkinlik günlüğü

Bir etkinlik günlüğü girdisi, `PluginActivityLog`'u genişleten, ayrıntılardan oluşan bir `JsonObject` taşıyan küçük bir sınıftır (dosya `log/CreatedShoutLog.kt`):

```kotlin
package com.panomc.plugins.shoutbox.log

import com.panomc.platform.db.model.PluginActivityLog
import io.vertx.core.json.JsonObject

class CreatedShoutLog(
    userId: Long,
    username: String,
    pluginId: String,
    message: String
) : PluginActivityLog(
    userId = userId,
    pluginId = pluginId,
    details = JsonObject().put("target", message).put("username", username)
)
```

Panel uç noktası bunlardan birini `databaseManager.panelActivityLogDao.add(...)` ile yazar — bkz. [Endpoint'ler](/tr/addon/endpoints/). Panel sonra her günlük satırını **Etkinlik** sayfasında gösterir. Gösterilecek metni bulmak için, izinlerin düğümlerini türettiği aynı yolla, sınıf adınızdan bir yerelleştirme anahtarı türetir:

1. Sondaki `Log`'u düşürün → `CreatedShout`.
2. `UPPER_SNAKE`'e çevirin → `CREATED_SHOUT`.
3. Yerelleştirme dosyalarınızda bir `activity-logs` nesnesi altında arayın → `activity-logs.CREATED_SHOUT`.

O yerelleştirme dizesi, yukarıda oluşturduğunuz `details` yükünden gelen `{username}` ve `{target}` değerlerini kullanır. Kurulumu [Çeviriler](/tr/addon/localization/) sayfasında ele alınmıştır.

::: warning Yerelleştirme dizesini ekleyene kadar ham bir anahtar göreceksiniz
Yerelleştirme dosyalarınıza `activity-logs.CREATED_SHOUT`'u ekleyene kadar, Etkinlik sayfası bir cümle yerine ham `CREATED_SHOUT` anahtarını gösterir. Bu beklenen bir durum — bir hata değil, yalnızca eksik çeviri.
:::

## Sırada ne var

- **[Endpoint'ler](/tr/addon/endpoints/)** — `requirePermission`'ı çağıran ve bu günlük girdisini yazan panel uç noktası.
- **[Çeviriler](/tr/addon/localization/)** — izin başlığını ve `CREATED_SHOUT` etkinlik günlüğü satırını çevirin.
- **[Backend API Referansı § 7](/tr/addon/backend-reference/#_7-izinler-ve-kimlik-dogrulama)** — `Permission`, `PanelPermission` ve tam `AuthProvider` metot listesi.
