# Yerelleştirme (i18n)

Pano, güçlü bir yerelleştirme sistemini destekler. Eklentinizin `src/main/resources/locales` dizini, desteklenen diller için çeviri dosyalarını içermelidir.

- **Dosya Formatı**: Tüm çeviri dosyaları geçerli `.json` formatında olmalıdır.
::: warning Varsayılan Dil (Fallback)
Kullanıcının mevcut dili için bir çeviri eksikse, Pano otomatik olarak `en-US.json` dosyasına geri döner. Bu dosyanın mevcut ve eksiksiz olduğundan emin olun.
:::
 
## Kullanıcı Özelleştirmesi ve Geçersiz Kılmalar

Pano'nun güçlü özelliklerinden biri, yöneticilerin eklenti çevirilerinizi doğrudan Pano Panelinden değiştirebilmesidir.

- **Geçersiz Kılma (Override)**: Kullanıcılar tanımladığınız herhangi bir çeviri anahtarını düzenleyebilir, böylece eklenti JAR dosyanızı değiştirmeden varsayılan metninizi etkili bir şekilde geçersiz kılabilirler.
- **Yeni Diller**: Kullanıcılar, Panelde yeni çeviri girişleri oluşturarak eklentinizin yerel olarak sağlamadığı diller için destek ekleyebilirler.

Bu özelleştirmeler Pano tarafından ayrı olarak saklanır ve eklentiniz için güncellemeler yayınlasanız bile korunur.

## Çevirileri Tanımlama

### İzinler (Permissions)
Eklentiniz Pano'nun izin sistemini kullanıyorsa, her bir izin düğümü için insan tarafından okunabilir başlıklar ve açıklamalar sağlamalısınız.

`permissions` içindeki anahtar, izin sınıfı adınızın **SCREAMING_SNAKE_CASE** formatına dönüştürülmüş halidir.

**Tanım:**
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

**Çeviri:**
```json
{
  "permissions": {
    "MANAGE_FAQ": {
      "title": "SSS Yönetimi",
      "description": "SSS girişlerini ve kategorilerini yönetmeye izin verir."
    }
  }
}
```

Bu başlıklar ve açıklamalar, Pano Panelindeki **Yetkiler** sayfasında görüntülenir ve yöneticilerin izinleri etkili bir şekilde anlamasını ve atamasını sağlar.

### Etkinlik Kayıtları (Activity Logs)
Eklentiniz etkinlik kayıtları tutuyorsa, bunlar için `activity-logs` nesnesi altında şablonlar tanımlamanız gerekir. Pano, günlük mesajlarındaki dinamik yer tutucular için **{degisken}** sözdizimini (tek süslü parantez) kullanır.

`activity-logs` içindeki anahtar, log sınıfı adınızın **SCREAMING_SNAKE_CASE** formatına dönüştürülmüş halidir ('Log' soneki olmadan).

**Kotlin Tanımı:**
```kotlin
class CreatedFAQCategoryLog(
    userId: Long,
    username: String,
    pluginId: String,
    name: String
) : PluginActivityLog(
    userId = userId,
    pluginId = pluginId,
    details = JsonObject().put("target", name).put("username", username)
)
```

**Çeviri:**
```json
{
  "activity-logs": {
    "CREATED_FAQ_CATEGORY": "<b>{username}</b> SSS kategorisi oluşturdu: {target}."
  }
}
```

::: info Önemli
Hem `permissions` hem de `activity-logs` JSON dosyanızın **kök (root)** seviyesinde olmalıdır. Pano sistemi, bu bölümleri temel platformla entegre etmek için otomatik olarak yönetir.
:::

### Özel Anahtarlar
Eklentinizin arayüzünde veya backend mesajlarında kullanmak üzere keyfi anahtar-değer çiftleri tanımlayabilirsiniz.

```json
{
  "dashboard-title": "Eklenti Kontrol Panelim",
  "welcome-message": "Tekrar hoş geldin, {{username}}!"
}
```

## Çevirileri Kullanma

### Backend (Kotlin)
Backend'den yerelleştirilmiş mesajlar veya bildirimler gönderirken, Pano'nun yerelleştirme sistemi **Handlebars** değiştirmelerini sizin yerinize halleder. Sadece çeviri anahtarını ve bir değişken haritasını (map) iletmeniz yeterlidir.

### Frontend (Svelte)
Pano arayüzü [svelte-i18n](https://github.com/kaisermann/svelte-i18n) kütüphanesine dayanır. Gelişmiş kullanım için kütüphanenin dokümantasyonuna başvurabilirsiniz.

#### `$_` Yardımcısı
Pano Boilerplate kurulumu, Svelte bileşenlerinize enjekte edilen kullanışlı bir `$_` metodu sağlar.
*   **Amaç**: Çeviri anahtarlarınızı otomatik olarak eklenti kimliğinizle (plugin ID) önekleyen bir kısayol görevi görür.
*   **Kullanım**: `$_('dashboard-title')`
*   **Etki**: Sistem `plugins.your-plugin-id.dashboard-title` anahtarını arar.

#### Ham Erişim (Yardımcı Olmadan)
`$_` yardımcısı sadece sözdizimsel bir kolaylıktır (syntactic sugar). Arka planda, tüm eklenti çevirileri `plugins.<plugin-id>` altında adlandırılır (namespaced).

Eğer yardımcıyı kullanmıyorsanız veya eklentinizin ad alanı dışındaki bir çeviri anahtarına (örneğin global bir Pano buton metnine) erişmeniz gerekirse, tam yolu kullanmalısınız:

```javascript
// Eklentinizin çevirisine manuel erişim
$t('plugins.your-plugin-id.dashboard-title')

// Global bir Pano çevirisine erişim
$t('global.save')
```
