# Backend Geliştirme (Kotlin)

## 🚀 Eklenti Yaşam Döngüsü ve Bağlam
Eklentiler `PanoPlugin` sınıfını genişletir. Temel bağlamlar şunlardır:
-   `applicationContext`: Pano'nun ana DI bağlamı.
-   `pluginBeanContext`: Eklenti içi bean'leri yönetir.
-   `pluginGlobalBeanContext`: Farklı eklentiler arasında bean paylaşımı yapar.

### Kurulum Etkileşimi
Veritabanı ağırlıklı işlemleri başlatmadan önce kurulumun tamamlanmasını bekleyin.

**Olay İşleyici Örneği:**
```kotlin
@EventListener
class SetupEventHandler(private val plugin: YourPlugin): SetupEventListener {
    override suspend fun onSetupFinished() {
        if (plugin.pluginState == PluginState.STARTED) {
            plugin.startPlugin()
        }
    }
}
```

**Ana Eklenti Sınıfı Yöntemleri:**
```kotlin
override suspend fun onStart() {
    if (!setupManager.isSetupDone()) {
        return // SetupEventHandler'ı bekle
    }
    startPlugin()
}

override suspend fun onUninstall() {
    pluginDatabaseManager.uninstall(this)
}
```

## 🗄️ Veritabanı ve Modeller
- **Paket Yapısı**: `db/daos/`, `db/impl/`, `db/models/`, `db/migrations/`.
- **Anotasyonlar**: `@DBEntity` (modeller), `@Migration` (sürümlü değişiklikler), `@Dao` (uygulamalar).
- **İsimlendirme Kuralı**: **DAO** ve **Model** isimlerini benzer tutun (örn: `AnnouncementModel` ve `AnnouncementDao`).
- **Uygulama**: Soyut Dao sınıflarını genişletin ve model sınıfını sağlayın. `uninstall` mantığının uygulandığından emin olun.

## 🛣️ API ve Yönlendirme
- **Konum**: `routes/` paketi.
- **Türler**: `PanelApi` (yönetici), `LoggedInApi` (kimliği doğrulanmış kullanıcılar).
- **Doğrulama**:
    -   Doğrulama işleyicileri zorunludur.
    -   `:id` gibi yol değişkenlerini kullanın.
    -   Şema tabanlı nesneler için `required body` belirtin.
- **İzinler**: `applicationContext` içindeki `authProvider`'ı kullanın.
- **Etkinlik Kayıtları**: Tüm Panel API'leri **mutlaka** etkinlik kayıtları tanımlamalıdır.
- **Hata Yönetimi**: Yerleşik hataları (`com.panomc.platform.error`) tercih edin. Özel hataları `error/` içinde `com.panomc.platform.model.Error` sınıfını genişleterek tanımlayın.

## 🔐 İzinler ve Yapılandırma
- **İzinler**: `permission/` paketinde tanımlayın, `@PermissionDefinition` ile `PanelPermission` sınıfını genişletin.
    -   **İkon**: `PanelPermission` kurucusuna bir FontAwesome ikon adı sağlayın (örn: `PanelPermission("fa-question-circle")`).
    -   **Node**: İzin nodedu, sınıf adından otomatik olarak oluşturulur (örn: `ManageFAQPermission` -> `MANAGE_FAQ`).

**İzin Tanımlama Örneği:**
::: code-group
```kotlin [Kotlin]
@PermissionDefinition
class ManageFAQPermission : PanelPermission("fa-question-circle")
```

```java [Java]
@PermissionDefinition
public class ManageFAQPermission extends PanelPermission {
    public ManageFAQPermission() {
        super("fa-question-circle");
    }
}
```
:::
- **Yapılandırma**: `PluginConfigManager` kullanın.
    -   Genel ayarları **Config** sınıflarında tutun.
    -   **Önce Enum**: Tip güvenliği için statik dizeler yerine Enum kullanın.
