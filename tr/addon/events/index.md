# Olaylar (Events)

**Bu sayfa size ne verir:** sona geldiğinizde ilk etkinlik dinleyicinizi yazmış olacaksınız — veritabanına dokunan her eklentinin ihtiyaç duyduğu kurulum-kapısı dinleyicisi — ve diğer platform eylemlerine (girişler, kayıtlar, hesap silme) nasıl tepki vereceğinizi, hatta kendi eklentiler-arası olaylarınızı nasıl tetikleyeceğinizi bileceksiniz.

Bir **etkinlik dinleyicisi** (event listener), platformda bir şey olduğunda Pano'nun çağırdığı sınıflarınızdan biridir. Bir dinleyici arayüzünü uygularsınız, sınıfı `@EventListener` ile etiketlersiniz ve Pano onu tarama sırasında bağlar — kayıt çağrısı yok. Her backend düzenlemesinin bir yeniden-derle-ve-yeniden-başlat gerektirdiğini unutmayın — bkz. [Backend genel bakışı](/tr/addon/backend/).

## Kurulum kapısı

Giriş sınıfınız, yapılandırmayı ve veritabanını `startPlugin()`'de başlatır, ama Pano'nun ilk çalıştırma kurulum sihirbazı bitene kadar erkenden döner — yoksa başlatılacak bir veritabanı olmazdı. (O koruma, [Backend genel bakışı](/tr/addon/backend/#giris-sınıfı)'ndaki `ShoutboxPlugin`'de yaşar.) Kurulum tamamlandığı an işleri kaldığı yerden almak için, eklenti sınıfının yanına küçük bir etkinlik dinleyicisi ekleyin (dosya `event/SetupEventHandler.kt`):

```kotlin
package com.panomc.plugins.shoutbox.event

import com.panomc.platform.api.annotation.EventListener
import com.panomc.platform.api.event.SetupEventListener
import com.panomc.plugins.shoutbox.ShoutboxPlugin

@EventListener
class SetupEventHandler(private val plugin: ShoutboxPlugin) : SetupEventListener {
    override suspend fun onSetupFinished() {
        plugin.startPlugin()
    }
}
```

Sihirbaz bittiğinde Pano `onSetupFinished()`'ı tetikler, `startPlugin()` yeniden çalışır ve `isInitialized` koruması onu birden fazla kez çağırmayı güvenli kılar.

- O kurucuda `plugin` nereden geliyor? **Kendi eklenti sınıfınız da enjekte edilebilir.** Pano tek `ShoutboxPlugin` örneğini kutunuza koyar, dolayısıyla sınıflarınızdan herhangi biri onu bir kurucu parametresi olarak alabilir — bu dinleyicinin (ve panel uç noktasının) ona nasıl eriştiğidir. Yani "neyi enjekte edebilirim?" kuralı şudur: kutunuzdaki her şey — `@Dao`/`@Endpoint`/vb. sınıflarınız, artı eklenti örneğiniz.

Veritabanına dokunan her eklenti tam olarak bu kurulum-kapısı desenine ihtiyaç duyar. Her iki sınıfı da — [Backend genel bakışı](/tr/addon/backend/#giris-sınıfı)'ndaki eklenti sınıfını ve bu dinleyiciyi — olduğu gibi kopyalayın ve yalnızca sınıf adlarını değiştirin.

::: warning Spring'inkini değil, Pano'nun `@EventListener`'ını kullanın
İşaretleme `com.panomc.platform.api.annotation.EventListener`'dır — Spring'in `org.springframework.context.event.EventListener`'ı **değil**. Aynı basit ada sahiptirler, dolayısıyla yanlış olanı içe aktarmak kolaydır; yaparsanız, etkinlik sistemi dinleyicinizi sessizce hiç çağırmaz.
:::

## Diğer platform eylemlerine tepki verme

`SetupEventListener`, birkaç dinleyici arayüzünden biridir. Desen her zaman aynıdır — arayüzü uygulayın, sınıfı `@EventListener` ile işaretleyin, yalnızca ilgilendiğiniz metotları geçersiz kılın. Tepki verebileceğiniz diğerleri arasında:

- **girişler ve kayıtlar** — bir kullanıcı kimlik doğrulamadan önce veya sonra kod çalıştırın ya da bir girişi veto edin.
- **hesap silme** — bir kullanıcı kaldırıldığında kendi tablolarınızı temizleyin.
- **kendi eklentiler-arası olaylarınız** — *başka* eklentilerin, eklentinizin yaptığı bir şeye tepki vermesine izin verin ve onlarınkine tepki verin.

Tam katalog — kimlik doğrulama kancaları, hesap-silme temizliği, eklenti-yaşam-döngüsü dinleyicileri ve kendi eklentiler-arası olaylarınızı tetikleme (`getEventListeners` companion-object çağrısı ve `PluginLifecycleListener` `ClassCastException` tuzağı dâhil) — [Backend API Referansı § 6](/tr/addon/backend-reference/#_6-etkinlik-dinleyicileri)'da imzalarıyla listelenmiştir.

## Sırada ne var

- **[Backend API Referansı § 6](/tr/addon/backend-reference/#_6-etkinlik-dinleyicileri)** — her etkinlik-dinleyici arayüzü, metotları ve olağan deseni bozan ikisi.
- **[Backend genel bakışı](/tr/addon/backend/#giris-sınıfı)** — bu dinleyicinin yeniden başlattığı `ShoutboxPlugin` giriş sınıfı.
- **[İzinler ve Etkinlik Günlükleri](/tr/addon/permissions/)** — bir yönetici eyleminin diğer yarısı: onu kapılamak ve günlüğe kaydetmek.
