# Yapılandırma

**Bu sayfa size ne verir:** sona geldiğinizde site sahibinin düzenleyebileceği bir ayarlar dosyanız olacak — Pano'nun ilk çalıştırmada diske yazdığı türlü (typed) bir Kotlin yapılandırma sınıfı — ve o değerleri bir uç noktanın içinden güvenle okumanın tek kuralını bileceksiniz.

Site sahibinin ince ayar yapabilmesi gereken ayarlar, `PluginConfig`'i genişleten bir yapılandırma sınıfında yaşar (dosya `config/ShoutboxConfig.kt`):

```kotlin
package com.panomc.plugins.shoutbox.config

import com.panomc.platform.api.config.PluginConfig

class ShoutboxConfig(
    val enabled: Boolean = true,
    val maxShouts: Int = 5
) : PluginConfig()
```

İlk çalıştırmada Pano bu sınıfı bir **yapılandırma dosyası** olarak yazar — HOCON biçiminde, ki JSON'a benzer ama daha az tırnak ve virgülle — `plugins/pano-plugin-shoutbox/config.conf` konumunda, varsayılanlarınızı doldurarak. Her backend düzenlemesinin, yürürlüğe girmeden önce bir yeniden-derle-ve-yeniden-başlat gerektirdiğini unutmayın — bkz. [Backend genel bakışı](/tr/addon/backend/).

::: tip Yapılandırma yöneticisi nerede oluşturulur
Bu dosyayı yükleyen ve kaydeden `PluginConfigManager`, giriş sınıfınızın `startPlugin()`'inde oluşturulur ve kaydedilir — bkz. [Backend genel bakışı](/tr/addon/backend/#giris-sınıfı). O zamanlama, aşağıda yapılandırmayı nasıl okuduğunuz için önemlidir.
:::

::: tip Kontrol noktası: üretilen yapılandırmayı açın
Eklentiniz bir kez yüklendikten sonra (yeniden derle → kopyala → yeniden başlat), `plugins/pano-plugin-shoutbox/config.conf`'u açın. İki anahtarınızı varsayılan değerleriyle görmelisiniz: `enabled`, `true`'ya ve `maxShouts`, `5`'e ayarlı.
:::

## Bir uç noktadan yapılandırma okuma (ve neden bir kurucudan değil)

Yapılandırmayı okumanın tek bir kuralı var: **`PluginConfigManager`'ı asla bir kurucuda istemeyin.** İşte nedeni, eklentiniz yüklendiğinde ne olduğunun zaman çizelgesi olarak:

```text
addon loads → your @Endpoint objects are created → onStart() runs → PluginConfigManager is registered → (later) a request arrives
```

Uç noktalarınız 2. adımda oluşturulur, ama `PluginConfigManager` 4. adıma kadar kaydedilmez. Yani bir uç noktanın kurucusu onu isteseydi, Pano'nun verecek hiçbir şeyi olmazdı ve `NoSuchBeanDefinitionException` ile çökerdi. Çözüm, onu uç nokta oluşturulduğunda değil, **bir istek gerçekten geldiğinde** (5. adım) getirmektir. İşte bir uç noktanın `handle`'ı içinde bir yapılandırma değerini okumanın eksiksiz, güvenli yolu:

```kotlin
// fetch the config manager only now, at request time — never in the constructor
val configManager = plugin.pluginBeanContext.getBean(PluginConfigManager::class.java)
val config = configManager.config as ShoutboxConfig
val limit = config.maxShouts   // e.g. 5
```

`configManager.config` size türlü (typed) bir `ShoutboxConfig` geri verir. Değişiklikleri diske kaydetmek için, doldurulmuş bir yapılandırma nesnesiyle `configManager.saveConfig(JsonObject.mapFrom(newConfig))` çağırırsınız. Bu tam okuma desenini [Endpoint'ler](/tr/addon/endpoints/) sayfasında işe koşacaksınız; orada isteğe bağlı `GetShoutsAPI` varyantı, kaç shout döndüreceğini sınırlamak için `maxShouts`'u kullanır.

## Anahtarları belgeleme ve geliştirme

Üretilen dosyada tek tek anahtarları bir alanın üstüne `@ConfigComment("…")` koyarak belgeleyebilir ve ilgili anahtarları bir başlık altında `@ConfigSection("…")` ile gruplayabilirsiniz.

Daha sonra yapılandırma anahtarları eklemeniz veya yeniden adlandırmanız gerektiğinde, diskteki dosyayı elle düzenlemeyin — Pano'nun bunun için bir `PluginConfigMigration` sınıfı vardır (`@Migration` ile işaretlenmiş). İlk gün buna ihtiyaç duymayacaksınız; zamanı geldiğinde onu [Backend API Referansı](/tr/addon/backend-reference/#_5-yapılandırma)'nda görün.

## Sırada ne var

- **[Endpoint'ler](/tr/addon/endpoints/)** — `maxShouts`'u istek anında işe koşun.
- **[Backend genel bakışı](/tr/addon/backend/)** — `PluginConfigManager`'ın başlangıçta nerede kaydedildiği.
- **[Backend API Referansı](/tr/addon/backend-reference/#_5-yapılandırma)** — adıyla `PluginConfig`, `PluginConfigManager`, `@ConfigComment`, `@ConfigSection` ve `PluginConfigMigration`.
