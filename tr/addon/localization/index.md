# Çeviriler (i18n)

Yerelleştirme (sıklıkla **i18n** olarak kısaltılır), eklentinizin metnini farklı dillerde göstermek demektir. Eklentinizin ekrana koyduğu her dize — panel butonları, izin başlıkları, Etkinlik sayfasındaki satırlar — jar'ın içindeki JSON dosyalarında, her dil için bir dosya olacak şekilde yaşar.

Çeviri dosyalarınız `src/main/resources/locales/` içinde, her dile bir tane olacak şekilde yaşar:

```
src/main/resources/locales/
├─ en-US.json
├─ tr.json
└─ ru.json
```

- **Dosya formatı:** her dosya düz, geçerli `.json`'dur.
- **Dosya adı, yerel ayar (locale) kodudur:** `en-US.json`, `en-US` kodudur, `tr.json`, `tr`'dir ve böyle devam eder.

::: warning en-US yedektir (fallback)
Ziyaretçinin dili için bir anahtar eksikse, Pano `en-US.json`'a geri döner. O dosyayı mevcut ve eksiksiz tutun — diğer her dil için güvenlik ağıdır.
:::

## Ad alanı — anahtarlarınızın yaşadığı yer

Platform, yazdığınız her anahtarı `plugins.<pluginId>.<key>` altında sunar. Örnek eklentimiz **Shoutbox** için (`pluginId` = `pano-plugin-shoutbox`), `widget.title` adlı bir anahtar, arama zamanında `plugins.pano-plugin-shoutbox.widget.title` olur.

O öneki asla kendiniz yazmazsınız. JSON dosyalarınızın içinde anahtarlar **öneksiz** kalır (`widget.title`); Pano, `plugins.<pluginId>.` kısmını otomatik ekler. Anahtarlarınızın çekirdek platformunkiyle veya başka bir eklentininkiyle asla çakışmamasını sağlayan şey budur.

## Yerelleştirmeleri düzenleme: geliştirmede sıcak, yayında gömülü

Bir yerelleştirme değişikliğinin ekrana nasıl ulaştığı **Geliştirme Modu**'na bağlıdır:

- **Geliştirme Modu açıkken** (ve eklentiniz, [Başlangıç](/tr/addon/getting-started/)'ın kurduğu gibi örneğin `plugins/<pluginId>/`'sine klonlanmışken), Pano `locales/*.json`'ınızı her istekte **diskten canlı** okur. Bir dosyayı düzenleyin, yenileyin (F5) ve yeni metin belirir — yeniden derleme yok, tıpkı Svelte arayüzü gibi.
- **Geliştirme Modu kapalıyken ya da yayınlanmış bir jar'da**, yerelleştirme dosyaları gömülü **kaynaklardır**. Bir yenileme değişikliği almaz; jar'ı yeniden derlemeniz gerekir:

```bash
./gradlew build -Pnoui
```

ardından jar'ı `plugins/` içine kopyalayın ve **Pano'yu yeniden başlatın** (eklentiyi devre dışı bırakıp yeniden etkinleştirmek jar içeriğini yeniden yüklemez). Sıcak-mı-yeniden-derleme-mi tablosunun tamamı için [Başlangıç](/tr/addon/getting-started/) sayfasına bakın.

::: tip Neden iki mod var?
Üretimde, yerelleştirmeler jar'ın içinde gönderilir, böylece bir eklenti tek, kendi kendine yeten bir dosya olarak kalır. Geliştirme Modu, çevirileri yeniden derlemeden yineleyebilmeniz için bunu diskten-canlı bir okumayla değiştirir — Svelte arayüzünüzü her istekte yeniden sunmasıyla aynı nedenle.
:::

## Kullanıcı özelleştirmesi ve geçersiz kılmalar

Pano'nun hoş dokunuşlarından biri: yöneticiler eklentinizin çevirilerini doğrudan panelden düzenleyebilir.

- **Geçersiz kılmalar:** bir yönetici tanımladığınız herhangi bir anahtarı değiştirebilir — jar'ınıza dokunmadan yeni bir ifade.
- **Yeni diller:** bir yönetici, panelde anahtarlarınızı çevirerek eklentinizin göndermediği bir dili ekleyebilir.

Bu düzenlemeler Pano tarafından ayrı olarak saklanır ve eklenti güncellemelerinde varlığını sürdürür, böylece yeni bir sürüm yayınladığınızda bir site sahibinin ifadesi asla kaybolmaz.

## Çevirileri tanımlama

### Özel anahtarlar

Bunlar, arayüzünüzün kullandığı sıradan anahtar-değer çiftleridir. Onları dilediğiniz gibi iç içe yerleştirin:

```json
{
  "widget": {
    "title": "Latest shouts",
    "empty": "No shouts yet — be the first!"
  },
  "welcome-message": "Welcome back, {username}!"
}
```

Yer tutucular **tek** süslü parantez (`{username}`) kullanır, çünkü arayüz bunları svelte-i18n ile render eder. (Backend'de tek bir istisna vardır — aşağıdaki [Backend](#backend-kotlin) notuna bakın.)

### İzinler

Eklentiniz bir izin tanımlıyorsa, yöneticilerin bunu panelin **İzinler** sayfasında anlayabilmesi için ona insan tarafından okunabilir bir başlık ve açıklama verin.

**Tanım:**

```kotlin
@PermissionDefinition
class ManageShoutboxPermission : PanelPermission("fa-bullhorn")
```

**Çeviri:**

```json
{
  "permissions": {
    "MANAGE_SHOUTBOX": {
      "title": "Manage Shoutbox",
      "description": "Allows managing shouts shown on the home page."
    }
  }
}
```

Anahtar deterministiktir: izin sınıfı adını alın, `Permission` ekini atın ve `UPPER_SNAKE_CASE`'e dönüştürün.

- `ManageShoutboxPermission` → `MANAGE_SHOUTBOX`

### Etkinlik günlükleri

Eklentiniz yönetici eylemlerini kaydediyorsa, her biri için `activity-logs` altında bir şablon tanımlayın. Bu satırlar panelin **Etkinlik** sayfasında görünür.

**Tanım:**

```kotlin
class CreatedShoutLog(
    userId: Long,
    username: String,
    pluginId: String,
    message: String,
) : PluginActivityLog(
    userId = userId,
    pluginId = pluginId,
    details = JsonObject().put("target", message).put("username", username),
)
```

**Çeviri:**

```json
{
  "activity-logs": {
    "CREATED_SHOUT": "<b>{username}</b> posted a shout: {target}."
  }
}
```

Anahtar, izinlerle aynı kuralı izler, ancak bunun yerine `Log` ekini atar:

- `CreatedShoutLog` → `CREATED_SHOUT`

`{username}` ve `{target}` yer tutucuları, günlüğün `details` JSON'undan doldurulur — Kotlin sınıfı *veriyi* sağlar, bu yerelleştirme girdisi ise *ifadeyi* sağlar.

::: info İkisi de dosyanızın kökünde yaşar
`permissions` ve `activity-logs`, JSON dosyanızın **kökünde**, özel anahtarlarınızın yanında yer almalıdır — başka bir nesnenin içine iç içe yerleştirilmemelidir. Pano bu iki bölümü, onları çekirdek İzinler ve Etkinlik sayfalarına bağlamak için doğrudan okur.
:::

## Çevirileri kullanma

### Frontend (Svelte)

Bileşenlerinize otomatik olarak hiçbir şey enjekte edilmez. `src/main.js`'iniz, svelte-i18n'i saran ve eklentinizin ad alanını sizin için öne ekleyen küçük bir `derived` store dışa aktarır:

```js
// src/main.js
import { derived } from 'svelte/store';
import { _ as i18n } from '@panomc/sdk/utils/language';

export const pluginId = 'pano-plugin-shoutbox';
export const _ = derived(i18n, ($t) => (key, options) => $t(`plugins.${pluginId}.${key}`, options));
```

Ardından herhangi bir bileşen o `_`'yi içe aktarır ve onu **kısa, öneksiz** bir anahtarla kullanır:

```svelte
<script>
  import { _ } from '../main.js';
</script>

<h2>{$_('widget.title')}</h2>
```

`$_('widget.title')`, sizin için `plugins.pano-plugin-shoutbox.widget.title`'a bakar. Bu store'un nerede kurulup kullanıldığı için [Arayüz Geliştirme](/tr/addon/frontend/) sayfasına bakın.

::: tip Ad alanınızın dışındaki anahtarlara ulaşma
Eklentinizin ad alanının altında *olmayan* bir anahtara ihtiyacınız varsa, svelte-i18n'in kendi store'unu içe aktarın — `import { _ } from '@panomc/sdk/utils/language'` — ve **tam yolu** kendiniz geçin (örneğin `$_('plugins.pano-plugin-shoutbox.widget.title')`). `main.js`'inizdeki `_`, yalnızca öneki eklenmiş bu aynı store'dur.
:::

### Backend (Kotlin)

İki backend özelliği yerelleştirme dosyalarınızı okur:

- **Etkinlik günlükleri.** Eklentiniz bir yönetici eylemini kaydettiğinde, bir `PluginActivityLog` alt sınıfı eklersiniz (bkz. [Backend Geliştirme](/tr/addon/backend/)). Etkinlik sayfası bunu, `activity-logs.<KEY>`'e bakarak ve `{...}` yer tutucularını günlüğün `details` yükünden doldurarak render eder. Yerelleştirilmiş metin *burada*, yerelleştirme dosyasında yaşar — asla Kotlin'de değil.
- **E-posta.** Eklentiniz posta gönderiyorsa, konu ve gövde Handlebars şablonlarından gelir.

::: warning Tek mi çift mi süslü parantez
Arayüzün render ettiği her şey — özel anahtarlar, izin başlıkları, etkinlik-günlüğü satırları — svelte-i18n'den geçer ve **tek** süslü parantezle interpolasyon yapar: `{username}`. **Çift** süslü parantez `{{variable}}` yazdığınız **tek** yer, Pano'nun Handlebars ile render ettiği backend e-posta şablonlarının içidir. Yanlış stili kullanmak, ekranda ham `{...}`'in görünür kalmasına yol açar.
:::

## Sırada ne var

- **[Backend Geliştirme](/tr/addon/backend/)** — Kotlin'de etkinlik günlükleri kaydedin ve izinler tanımlayın.
- **[Arayüz Geliştirme](/tr/addon/frontend/)** — `_` store'unu kurun ve bileşenlerinizde çevirileri kullanın.
- **[Derleme ve Yayınlama](/tr/addon/publishing/)** — eklentinizi paketleyin ve gönderin (yerelleştirmeler dahil).
