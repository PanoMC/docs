# Çeviriler

Shoutbox'ın widget'ı, izni ve gezinme bağlantısı şu anda hepsi sabit-kodlanmış İngilizce gösteriyor. Bu sayfada o metni **yerel ayar dosyalarına** taşıyoruz ki Shoutbox sunucunuzun konuştuğu her dili konuşsun — ve izin başlığı ile etkinlik günlüğü satırları ham anahtarlar yerine gerçek sözcükler göstersin.

Tam referans: [Çeviriler](/tr/addon/localization/).

::: tip Gerçekten yapmak zorunda mıyım?
Evet, en azından biraz. Svelte bileşenlerinize İngilizce'yi sabit-kodlayabilirsiniz — ama iki tür metnin başka yaşayacak yeri yoktur: **izin başlıkları** (panelin İzinler sayfası) ve **etkinlik günlüğü satırları** (Etkinlik sayfası) *yalnızca* yerel ayar dosyalarından gelebilir. Yani yalnızca-İngilizce bir eklentinin bile bir `en-US.json`'a ihtiyacı vardır.
:::

## Adım 1 — yerel ayar dosyalarınızı kurun

Metin, `src/main/resources/locales/` altında JSON dosyalarında yaşar, her dil için bir dosya, dosya adı o dilin kodudur:

```
src/main/resources/locales/
├─ en-US.json   ← required; also the fallback
├─ tr.json
└─ ru.json
```

Yalnızca `en-US.json` zorunludur. Henüz orada değilse, yalnızca `{}` içeren bir tane şimdi oluşturun.

::: warning en-US güvenlik ağıdır
Ziyaretçinin dili için bir anahtar eksikse, Pano `en-US.json`'a geri düşer. *Orada da* eksikse, ziyaretçi ekranda ham anahtar yolunu görür (`plugins.pano-plugin-shoutbox.widget.title` gibi). `en-US.json`'ı eksiksiz tutun — ekrandaki ham bir anahtar, eksik olduğunun ilk işaretinizdir. Ayrıca her dosyayı **UTF-8** olarak kaydedin, yoksa Türkçe/Rusça karakterler bozuk `Ã¶` metnine dönüşür.
:::

## Adım 2 — tek cümlede ad alanı

Pano, yazdığınız her anahtarı `plugins.<pluginId>.<key>` altında sunar. Shoutbox için o önek `plugins.pano-plugin-shoutbox.`'tır. **O öneki asla yazmazsınız** — JSON'unuzda anahtarlar kısa kalır (`widget.title`) ve Pano öneki otomatik olarak ekler. Anahtarlarınızın çekirdek platformunkiyle veya başka bir eklentininkiyle çakışmasını önleyen şey budur.

Önekin gerçekten yazıldığı tek yer, boilerplate'in `main.js`'te zaten getirdiği küçük bir yardımcıdır:

```js
export const _ = derived(i18n, ($t) => (key, options) => $t(`plugins.${pluginId}.${key}`, options));
```

Onu olduğu gibi kopyalayın; kullanmak için anlamanıza gerek yok.

## Adım 3 — ilk anahtarlarınızı tanımlayın

Arayüz metninizi `en-US.json`'a koyun, istediğiniz gibi iç içe. İç içe nesneler noktalı yollara dönüşür ve `{...}`, sonradan doldurduğunuz bir yer tutucuyu işaretler:

```json
{
  "widget": {
    "title": "Latest shouts",
    "empty": "No shouts yet — be the first!"
  },
  "nav": {
    "shoutbox": "Shoutbox"
  }
}
```

## Adım 4 — anahtarları bir bileşende kullanın

`_` yardımcısını `main.js`'inizden içe aktarın ve onu bir `$` önekiyle okuyun:

```svelte
<script>
  import { _ } from '../main.js';
</script>

<h2>{$_('widget.title')}</h2>
```

`{$_('widget.title')}`, sizin için `plugins.pano-plugin-shoutbox.widget.title`'ı arar. Bir yer tutucuyu doldurmak için, değerleri ikinci bir argüman olarak geçin: `$_('welcome-message', { values: { username: 'Ada' } })`.

::: tip `../`'yi dosyanızın derinliğine göre düzeltin
`import { _ } from '../main.js'`, bileşeninizin tam olarak `main.js`'in bir klasör altında oturduğunu varsayar. Daha derin iç içe bir route'ta, daha fazla `../` ekleyin (`../../main.js` gibi), yoksa içe aktarma 404 verir.
:::

::: tip Kontrol noktası: canlı yeniden yükleme kendini kanıtlar
Geliştirme Modu açık ve `bun run dev` çalışırken, widget artık **Latest shouts**'u işliyor. Şimdi `en-US.json`'daki dizeyi düzenleyin, kaydedin ve **F5**'e basın — yeni metin, hiçbir yeniden derleme olmadan belirir. Geliştirme Modu'nun getirisi budur: Pano, `locales/*.json`'unuzu her istekte **diskten canlı** okur. (Geliştirme Modu *kapalıyken* ya da yayınlanmış bir jar'da, yerel ayarlar jar'ın içinden okunur — bir değişikliği görmek için yeniden derleyip yeniden başlatmanız gerekir.)
:::

## Adım 5 — izninizi ve etkinlik günlüğünüzü çevirin

Bu iki bölüm bileşenlerinizden gelmez — Pano onları, panelin İzinler ve Etkinlik sayfalarını doldurmak için doğrudan okur. **Her ikisi de dosyanın kökünde oturur**, özel anahtarlarınızın yanında.

Anahtar adları Kotlin sınıf adlarınızdan *türetilir*, dolayısıyla onları siz seçmezsiniz:

- İzin `ManageShoutboxPermission` → `Permission`'ı düşürün, UPPER_SNAKE → `MANAGE_SHOUTBOX`.
- Etkinlik günlüğü `CreatedShoutLog` → `Log`'u düşürün, UPPER_SNAKE → `CREATED_SHOUT`.

```json
{
  "permissions": {
    "MANAGE_SHOUTBOX": {
      "title": "Manage Shoutbox",
      "description": "Allows managing shouts shown on the home page."
    }
  },
  "activity-logs": {
    "CREATED_SHOUT": "<b>{username}</b> posted a shout: {target}."
  }
}
```

`{username}` ve `{target}` yer tutucuları, günlüğün `details` yükünden doldurulur (Kotlin sınıfında oluşturulur). `<b>` gibi HTML, **yalnızca** etkinlik günlüğü satırlarında çalışır — Etkinlik sayfası bunları HTML olarak işler; `{$_(...)}` ile gösterilen sıradan anahtarlar onu kaçış-karakterlerle işler.

::: tip Kontrol noktası
**Panel → İzinler**'i açın — girdiniz artık ham `MANAGE_SHOUTBOX` yerine **Manage Shoutbox** okuyor. Bir shout yayınlayın, sonra **Panel → Etkinlik**'i açın — cümle, kullanıcı adı kalın olarak görünür.
:::

## Adım 6 — başka bir dil ekleyin

İngilizce ile sınırlı değilsiniz. **Adı yerel ayar kodu olan** bir dosya ekleyin — Türkçe `tr.json`'da, Rusça `ru.json`'da — aynı anahtarlar çevrilmiş olarak:

```json
{
  "widget": {
    "title": "Son bağırışlar",
    "empty": "Henüz bağırış yok — ilk sen ol!"
  }
}
```

Çevirmediğiniz her anahtar `en-US.json`'a geri düşer, dolayısıyla kısmi bir çeviri asla ham bir anahtar göstermez. `tr.json`'unuzu test etmek için, kendi dilinizi **Panel → Ayarlar → Platform → Tercihler**'den (veya sitenin dil seçicisinden) Türkçe'ye geçirin ve yenileyin.

::: tip Yöneticiler sizin için çevirebilir
Yöneticiler, jar'ınıza dokunmadan herhangi bir anahtarı geçersiz kılabilir veya doğrudan panelden bütün bir yeni dil ekleyebilir — ve düzenlemeleri eklenti güncellemelerinden sağ çıkar. Bir yöneticinin geçersiz kılması her zaman jar'ınızın metnini yener, dolayısıyla bir site sahibinin özel ifadesi bir güncellemeyle asla sessizce üzerine yazılmaz.
:::

## Tek bir eksiksiz `en-US.json`

İşte parçalar nasıl bir araya geliyor — özel anahtarlar, `permissions` ve `activity-logs` hepsi kökte:

```json
{
  "widget": {
    "title": "Latest shouts",
    "empty": "No shouts yet — be the first!"
  },
  "nav": { "shoutbox": "Shoutbox" },
  "permissions": {
    "MANAGE_SHOUTBOX": {
      "title": "Manage Shoutbox",
      "description": "Allows managing shouts shown on the home page."
    }
  },
  "activity-logs": {
    "CREATED_SHOUT": "<b>{username}</b> posted a shout: {target}."
  }
}
```

::: warning Bozuk bir JSON dosyası *tüm* anahtarlarını bozar
JSON katıdır: sondaki tek bir virgül, başıboş bir yorum veya kapatılmamış bir parantez tüm dosyayı geçersiz kılar ve o zaman anahtarlarının hiçbiri çözümlenmez — bir sayfa boyunca ham anahtar yollarını aynı anda görürsünüz. Bu olursa, önce bir JSON söz dizimi hatasından şüphelenin ve dosyayı herhangi bir doğrulayıcıdan geçirin.
:::

Shoutbox artık hem rolüne yakışıyor *hem de* dili konuşuyor. Geriye kalan tek şey onu paketleyip dünyayla paylaşmak.

**Sıradaki: [Yayına Çıkar →](/tr/handbook/addon/ship/)**
