# Çeviriler (i18n)

**Bu sayfa size ne verir:** sonunda bir dil dosyanız, ekranda görünen bir çevrilmiş satırınız olacak ve nasıl daha fazla dil ekleyeceğinizi, izin başlıklarını çevireceğinizi ve etkinlik-günlüğü satırlarını çevireceğinizi bileceksiniz.

Yerelleştirme/uluslararasılaştırma (ekosistem kısaltması **i18n**'dir, *internationalization*'ın kısaltması) eklentinizin metnini farklı dillerde göstermek anlamına gelir. Eklentinizin gösterdiği her metin parçası, jar'ın içine paketlenmiş JSON dosyalarında yaşar — dil başına bir dosya. (Bir `.jar`, bir Kotlin/Java eklentisinin paketlendiği tek zip-benzeri dosyadır, bir npm paketi tarball'ı gibi; onu asla elle açmazsınız.)

::: tip Bunu yapmak zorunda mıyım?
Evet, en azından biraz. İngilizce dizeleri doğrudan Svelte bileşenlerinize sabit-kodlayabilirsiniz — ama iki tür metnin başka yaşayacak yeri yoktur: **izin başlıkları** (panelin İzinler sayfasında gösterilir) ve **etkinlik-günlüğü satırları** (panelin Etkinlik sayfasında gösterilir) *yalnızca* dil dosyalarından gelebilir. Yani yalnızca-İngilizce bir eklentinin bile bir `en-US.json`'a ihtiyacı vardır. İkisiyle de aşağıda karşılaşacaksınız.
:::

## Dil dosyalarınızı kurun

Eklenti projenizin ([Başlangıç](/tr/addon/getting-started/) sayfasının iskele olarak oluşturduğu) içinde, henüz yoksa `src/main/resources/locales/` klasörünü oluşturun ve yalnızca `{}` içeren bir `en-US.json` dosyası ekleyin. (`resources`, jar'a paketlenen kod-olmayan dosyalar için — JSON, görseller vb. — Gradle'ın adıdır. Ada rağmen yalnızca görseller için değildir.)

Dil başına bir dosya elde edersiniz, dosya adı o dilin kodudur:

```
src/main/resources/locales/
├─ en-US.json
├─ tr.json
└─ ru.json
```

Yalnızca `en-US.json` gereklidir. Çevirmeye hazır olduğunuzda diğer dilleri (`tr.json`, `ru.json`, …) ekleyin.

::: tip Kontrol noktası
Artık diskte `{}` içeren `src/main/resources/locales/en-US.json`'a sahip olmalısınız.
:::

- **Dosya formatı:** her dosya düz, geçerli `.json`'dur — yorum yok ve sonda virgül yok (ikisinden biri tüm dosyayı geçersiz kılar) — ve Türkçe veya Rusça karakterlerin `Ã¶`-tarzı bozuk metne dönüşmemesi için onu **UTF-8** olarak kaydedin.
- **Dosya adı yerel ayar kodudur:** `en-US.json`, `en-US` kodudur, `tr.json`, `tr`'dir vb. Pano `en-US` veya `tr` gibi kısa kodları kabul eder — site dili olarak ayarladığınız aynı kodlar (bkz. [Yapılandırma](/tr/platform/configuration/)).

**Bir ziyaretçinin hangi dili gördüğü.** Sitenin varsayılan bir dili vardır (`locale` ayarı) ve yönetici izin verdiğinde, her ziyaretçi gönderdiğiniz diller arasından kendisininkini seçebilir. `tr.json`'unuzu test etmek için, kendi dilinizi **Panel → Ayarlar → Platform → Tercihler**'de (veya sitenin dil seçici aracılığıyla) Türkçe'ye değiştirin ve yenileyin.

::: warning en-US yedektir
Ziyaretçinin dili için bir anahtar eksikse, Pano `en-US.json`'a geri döner. Anahtar *orada da* eksikse, ziyaretçi ekranda ham anahtar yolunu görür — gerçek kelimeler yerine `plugins.pano-plugin-shoutbox.widget.title` gibi bir şey. `en-US.json`'ı mevcut ve eksiksiz tutun: her diğer dil için güvenlik ağıdır ve ekranda ham bir anahtar onun eksik olduğunun ilk işaretidir.
:::

## Ad alanı — anahtarlarınızın yaşadığı yer

Platform, yazdığınız her anahtarı `plugins.<pluginId>.<key>` altında sunar. Örnek eklentimiz **Shoutbox** için (`pluginId`'si `pano-plugin-shoutbox`'tır — eklentiyi iskele olarak oluşturduğunuzda `gradle.properties`'te ayarladığınız değer, bkz. [Başlangıç](/tr/addon/getting-started/)), `widget.title` adlı bir anahtar arama zamanında `plugins.pano-plugin-shoutbox.widget.title` olur.

O uzun öneki asla yazmazsınız — ne JSON dosyalarınızda ne de bileşenlerinizde. JSON'unuzun içinde anahtarlar **öneksiz** kalır (`widget.title`) ve Pano `plugins.<pluginId>.` kısmını otomatik ekler. Önekin gerçekten göründüğü *tek* yer, `main.js`'teki küçük bir yardımcıdır (aşağıda gösterilmiştir) ve boilerplate onu zaten içerir. Bu otomatik önekleme, anahtarlarınızın çekirdek platformunkiyle veya başka bir eklentininkiyle asla çakışmamasını sağlayan şeydir.

## İlk anahtarınızı tanımlayın

Özel anahtarlar, arayüzünüzün gösterdiği sıradan anahtar–değer çiftleridir. Onları `en-US.json`'a koyun, istediğiniz gibi iç içe:

```json
{
  "widget": {
    "title": "Latest shouts",
    "empty": "No shouts yet — be the first!"
  },
  "welcome-message": "Welcome back, {username}!"
}
```

**İç içe nesneler noktalı yollar olur.** Yukarıdaki `title`, `widget`'in içinde yaşar, bu yüzden onu tek anahtar `widget.title` olarak ararsınız (literal bir `"widget.title"` anahtarı *yazmayın*). Aynı şekilde, `widget` içindeki `empty`, `widget.empty` anahtarıdır.

**Yer tutucular tek süslü parantez kullanır.** `{username}`, daha sonra bileşeninizden doldurduğunuz bir slottur (sonraki bölümde gösterilmiştir). Yer tutucular tek süslü parantezle (`{username}`) render eder çünkü arayüz svelte-i18n kullanır. Backend e-posta şablonları tek istisnadır — çift süslü parantez kullanırlar; aşağıdaki [tek vs çift süslü parantez](#backend-kotlin)'e bakın.

## Anahtarı bir bileşende gösterin (Svelte)

Bir bileşende bir çeviri göstermek için, `_` yardımcısını eklentinizin `main.js`'inden içe aktarın — boilerplate onu zaten gönderir:

```svelte
<script>
  import { _ } from '../main.js';
</script>

<h2>{$_('widget.title')}</h2>
```

Burada bir junior okuyucunun takıldığı üç şey, hepsi normal:

- **Neden `_` deniyor?** `_`, svelte-i18n'in çeviri fonksiyonu için geleneksel adıdır — sürekli yazdığınız için tek bir karakter.
- **`_`'yi içe aktarın, `$_`'yi kullanın.** `$` öneki, Svelte'in bir *deponun* mevcut değerini okuma yoludur (bir depo, Svelte'in reaktif değer kutusudur). `_`'yi içe aktarırsınız; onu `$_` olarak kullanırsınız.
- **`../`'yi dosyanızın derinliğine göre düzeltin.** `import { _ } from '../main.js'`, bileşeninizin `main.js`'in tam olarak bir klasör altında oturduğunu varsayar. Daha derin iç içe bir rotada, daha fazla `../` ekleyin (örneğin `../../main.js`), yoksa içe aktarma 404 verir.

`{$_('widget.title')}` sizin için `plugins.pano-plugin-shoutbox.widget.title`'ı arar.

::: tip Kontrol noktası
Bileşen artık **Latest shouts**'u render eder. Bunun yerine ham `plugins.pano-plugin-shoutbox.widget.title`'ı görürseniz, anahtar `en-US.json`'da eksik veya yanlış yazılmıştır.
:::

### Bir yer tutucuyu doldurma

Yukarıdaki `welcome-message`'ın bir `{username}` slotu vardı. Onu doldurmak için, ikinci bir argüman geçirin — svelte-i18n buna `options` der — yer tutucu değerlerinizi `values` altında koyarak:

```svelte
<p>{$_('welcome-message', { values: { username: 'Ada' } })}</p>
```

Bu **Welcome back, Ada!**'yı render eder. `values` altındaki adlar dizedeki `{...}` adlarıyla eşleşmelidir. Değerler argümanını tamamen unutursanız, ziyaretçi ekranda literal `{username}`'i görür.

::: tip Çoğullar: "1 shout" vs "5 shouts"
İki anahtar ve bir `if` uydurmayın. svelte-i18n ICU mesaj söz dizimini anlar, bu yüzden tek bir anahtar her ikisini de halleder — örneğin `{count, plural, one {# shout} other {# shouts}}` — ve onu `$_('shout-count', { values: { count: n } })` ile çağırırsınız. [svelte-i18n biçimlendirme dokümanlarına](https://github.com/kaisermann/svelte-i18n) bakın.
:::

### `_` yardımcısı nasıl çalışır (acele ediyorsanız bunu atlayın)

`_`'yi kullanmak için bu parçacığı anlamanıza **gerek yok** — boilerplate'in `main.js`'i onu zaten içerir, bu yüzden yalnızca orada olduğunu onaylayın. Ama işte burada:

```js
// src/main.js
import { derived } from 'svelte/store';
import { _ as i18n } from '@panomc/sdk/utils/language';

export const pluginId = 'pano-plugin-shoutbox';
export const _ = derived(i18n, ($t) => (key, options) => $t(`plugins.${pluginId}.${key}`, options));
```

Bir *depo*, Svelte'in reaktif değer kutusudur; `derived`, "bağlı olduğum şey değiştiğinde yeniden hesapla" anlamına gelir — böylece ziyaretçi dili değiştirdiğinde, sayfadaki her `$_(...)` kendiliğinden güncellenir. `@panomc/sdk` boilerplate tarafından paketlenir (bkz. [Frontend Geliştirme](/tr/addon/frontend/)). Onu olduğu gibi kopyalayın. Daha önceki `plugins.<pluginId>.` önekinin gerçekten yazıldığı tek yer burasıdır.

::: tip Ad alanınızın dışındaki anahtarlara ulaşma
Eklentinizin ad alanı altında *olmayan* bir anahtara ihtiyacınız varsa, svelte-i18n'in kendi deposunu içe aktarın — `import { _ } from '@panomc/sdk/utils/language'` — ve **tam yolu** kendiniz geçirin (örneğin `$_('plugins.pano-plugin-shoutbox.widget.title')`). `main.js`'inizdeki `_`, yalnızca önek eklenmiş bu aynı depodur.
:::

## Düzenlemelerim ne zaman görünür? Geliştirme Modu'nda anında, aksi halde yalnızca bir yeniden derlemeden sonra

Artık ekranda bir anahtarınız olduğuna göre, ona yaptığınız *düzenlemelerin* tarayıcıya nasıl ulaştığı şöyle. **Geliştirme Modu**'na bağlıdır — [Başlangıç](/tr/addon/getting-started/)'ta açtığınız anahtar (**Panel → Platform Ayarları**, yapılandırma anahtarı `development-mode`). Onu atladıysanız, önce bunu yapın.

**Geliştirme Modu açıkken**, ve eklentiniz çalışan Pano sunucunuzun `plugins/<pluginId>/` klasörüne klonlanmışken (sunucunun çalıştığı klasöre *örnek* denir), Pano `locales/*.json`'unuzu her istekte **diskten canlı** okur. Bir dosyayı düzenleyin, yenileyin (F5) ve yeni metin görünür — yeniden derleme yok, tam olarak Svelte arayüzü gibi.

**Geliştirme Modu kapalıyken veya bir yayınlanmış jar'da**, çalışan sunucu yalnızca dil dosyalarınızın jar'ın *içindeki* kopyasını okur — kaynak klasörünüze asla bakmaz, bu yüzden diskteki dosyayı düzenlemek, siz jar'ı yeniden derleyene kadar hiçbir şey yapmaz:

```bash
./gradlew build -Pnoui
```

(`gradlew`, projenizde zaten bulunan Gradle wrapper betiğidir — onu proje kökünden çalıştırın, öndeki `./`'nin anlamı budur. `-Pnoui` zaman kazanmak için arayüzü yeniden derlemeyi atlar.)

::: tip Kontrol noktası
Artık `build/libs/` altında bir jar (yerel bir derleme için `pano-plugin-shoutbox-local-build.jar`) görmelisiniz. O dosyayı Pano örneğinizin `plugins/` klasörüne kopyalayın, eskisinin yerine koyun, sonra **Pano'yu yeniden başlatın** — çalışan işlemi durdurun ve tekrar başlatın (bkz. [Başlangıç](/tr/addon/getting-started/)). Eklentiyi panelde devre dışı bırakıp yeniden etkinleştirmek jar içeriğini *yeniden yüklemez*.
:::

::: tip Neden iki mod?
Üretimde, diller jar'ın içinde gönderilir, böylece bir eklenti tek, kendi kendine yeten bir dosya olarak kalır. Geliştirme Modu bunu, çevirilerde yeniden derlemeden yineleme yapabilesiniz diye diskten-canlı bir okumayla değiştirir — Svelte arayüzünüzü her istekte yeniden sunmasının aynı nedeni. Tam sıcak-ile-yeniden-derleme tablosu için [Başlangıç](/tr/addon/getting-started/)'a bakın.
:::

## İzinler (yalnızca eklentiniz izinler tanımlıyorsa)

Eklentiniz bir izin tanımlıyorsa, ona insan tarafından okunabilir bir başlık ve açıklama verin, böylece yöneticiler onu panelin **İzinler** sayfasında anlayabilir. Eklentinizin izni yoksa bu bölümü atlayın.

**Tanım (Kotlin):**

```kotlin
@PermissionDefinition
class ManageShoutboxPermission : PanelPermission("fa-bullhorn")
```

`@PermissionDefinition` satırı bir Kotlin *açıklamasıdır* — sınıfınızın otomatik olarak kaydedilmesi için Pano'nun taradığı bir işaretleyici; onu tam olarak kopyalayın (ayrıntılar [Backend Geliştirme](/tr/addon/backend/)'de). `fa-bullhorn`, panelde iznin yanında gösterilen bir Font Awesome ikon adıdır.

**Çeviri (dil dosyanızda):**

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

`MANAGE_SHOUTBOX` anahtarını siz seçmezsiniz — sabit bir kuralla sınıf adından türetilir: `Permission` sonekini bırakın, sonra `UPPER_SNAKE_CASE`'e dönüştürün.

- `ManageShoutboxPermission` → `MANAGE_SHOUTBOX`

::: tip Kontrol noktası
**Panel → İzinler**'i açın. Girdiniz artık ham `MANAGE_SHOUTBOX` anahtarı yerine açıklamasıyla **Manage Shoutbox** okumalı.
:::

## Etkinlik günlükleri (yalnızca eklentiniz etkinlik kaydediyorsa)

Eklentiniz yönetici eylemlerini kaydediyorsa, her biri için `activity-logs` altında bir şablon tanımlayın. Bu satırlar panelin **Etkinlik** sayfasında görünür. Eklentiniz etkinlik kaydetmiyorsa bu bölümü atlayın.

**Tanım (Kotlin):**

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

Çeviri için, yalnızca `details` satırı önemlidir: içine `put` ettiğiniz her anahtar — burada `target` ve `username` — metinde kullanabileceğiniz bir `{placeholder}` olur. Geri kalanı (`userId`, `pluginId`, kurucu altyapısı) [Backend Geliştirme](/tr/addon/backend/)'de kapsanan backend bağlantısıdır.

**Çeviri (dil dosyanızda):**

```json
{
  "activity-logs": {
    "CREATED_SHOUT": "<b>{username}</b> posted a shout: {target}."
  }
}
```

Anahtar izinlerle aynı kuralı izler, ama bunun yerine `Log` sonekini bırakır:

- `CreatedShoutLog` → `CREATED_SHOUT`

`{username}` ve `{target}` yer tutucuları günlüğün `details` JSON'undan doldurulur — Kotlin sınıfı *veriyi* sağlar ve bu dil girdisi *ifadeyi* sağlar.

::: tip Dizelerimde `<b>` gibi HTML kullanabilir miyim?
Burada, evet: `<b>...</b>` çalışır çünkü Etkinlik sayfası bu belirli dizeleri HTML olarak render eder. Bu, her dil dizesine HTML koymak için genel bir izin **değildir**. `{$_(...)}` ile gösterilen sıradan özel anahtarlarda, svelte-i18n ham dizeyi döndürür ve Svelte onu kaçırır, bu yüzden `<b>` ekranda literal `<b>` metni olarak görünürdü. HTML işaretlemesini yalnızca etkinlik-günlüğü satırlarıyla sınırlayın.
:::

::: tip Kontrol noktası
Eylemi gerçekleştirin, sonra **Panel → Etkinlik**'i açın. Render edilen cümle kullanıcı adı kalın olarak görünmeli.
:::

## Tek bir eksiksiz `en-US.json`

Yukarıdaki örnekler parçalardı. İşte tek bir dosyada nasıl bir araya geldikleri. **`permissions` ve `activity-logs` kökte oturur**, özel anahtarlarınızın yanında — asla başka bir nesnenin içinde iç içe değil. Pano bu iki bölümü doğrudan okuyarak onları çekirdek İzinler ve Etkinlik sayfalarına bağlar.

```json
{
  "widget": {
    "title": "Latest shouts",
    "empty": "No shouts yet — be the first!"
  },
  "welcome-message": "Welcome back, {username}!",
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

## Backend (Kotlin)

İki backend sistemi — ve *yalnızca* bu ikisi — dil dosyalarınızı okur. Kendi Kotlin kodunuz asla doğrudan bir çeviri aramaz; backend'de metne ihtiyacınız varsa, bunlardan biri aracılığıyla akar:

- **Etkinlik günlükleri.** Eklentiniz bir yönetici eylemini kaydettiğinde, bir `PluginActivityLog` alt sınıfı eklersiniz (bkz. [Backend Geliştirme](/tr/addon/backend/)). Etkinlik sayfası onu `activity-logs.<KEY>`'i arayarak ve `{...}` yer tutucularını günlüğün `details` yükünden doldurarak render eder. Yerelleştirilmiş metin *burada*, dil dosyasında yaşar — asla Kotlin'de değil.
- **E-posta.** Eklentiniz posta gönderiyorsa, konu ve gövde **Handlebars** şablonlarından gelir. (Handlebars bir şablon dilidir; `{{name}}` doldurulacak bir değişkeni işaretler.) Bu şablonlar `locales/*.json`'unuzun **parçası değildir** — dil dosyalarında değil, eklentinizin posta kodunun yanında yaşarlar. `pano-plugin-auth-guard` eklentisi şablonlanmış e-posta göndermek için referanstır (bkz. [Backend Geliştirme](/tr/addon/backend/)).

::: warning Tek vs çift süslü parantez
Arayüzün render ettiği her şey — özel anahtarlar, izin başlıkları, etkinlik-günlüğü satırları — svelte-i18n'den geçer ve **tek** süslü parantezle enterpole eder: `{username}`. **Çift** süslü parantez `{{variable}}` yazdığınız **tek** yer backend e-posta (Handlebars) şablonlarının içidir. Yanlış stili kullanmak ekranda ham `{...}`'yı görünür bırakır.
:::

## Yönetici geçersiz kılmaları ve yeni diller

Pano'nun güzel dokunuşlarından biri: yöneticiler eklentinizin çevirilerini doğrudan panelden düzenleyebilir.

- **Geçersiz kılmalar:** bir yönetici tanımladığınız herhangi bir anahtarı değiştirebilir — jar'ınıza dokunmadan yeni ifade.
- **Yeni diller:** bir yönetici, panelde anahtarlarınızı çevirerek eklentinizin göndermediği bir dili ekleyebilir.

Bu düzenlemeler Pano tarafından ayrı olarak saklanır ve eklenti güncellemelerinden sağ çıkar. **Kimin metni kazanır?** Bir yöneticinin geçersiz kılması her zaman jar'ınızdaki metni yener. Yani yeni bir yayında kendi ifadenizi değiştirirseniz, bir yöneticinin özelleştirdiği değer, geçersiz kıldıkları anahtarlar için yürürlükte kalır; yeni varsayılanınız yalnızca yöneticinin hiç dokunmadığı anahtarlar için görünür. Bir site sahibinin ifadesi bir güncellemeyle asla sessizce üzerine yazılmaz.

## Bir şey yanlış görünüyorsa

| Şunu görüyorsunuz | Muhtemel neden | Düzeltme |
|---|---|---|
| Ekranda ham bir anahtar yolu (`plugins.pano-plugin-shoutbox.widget.title`) | Anahtar, ziyaretçinin dilinde *ve* `en-US.json`'da eksik veya yanlış yazılmış | `en-US.json`'a (yedek) anahtarı ekleyin veya düzeltin |
| Ekranda literal bir `{username}` | Yer tutucu için bir değer geçirmediniz | Onu geçirin: `$_('welcome-message', { values: { username: ... } })` |
| Ekranda literal bir `{{name}}` | Render edici için yanlış süslü parantez stili | Arayüz tek `{ }` kullanır; yalnızca e-posta/Handlebars çift `{{ }}` kullanır |
| Bir dil dosyasına yapılan düzenlemeler yenilemeden sonra görünmüyor | Geliştirme Modu kapalı veya yayınlanmış bir jar çalıştırıyorsunuz | Geliştirme Modu'nu açın veya jar'ı yeniden derleyip Pano'yu yeniden başlatın |
| Türkçe/Rusça metin `Ã¶`-tarzı bozuk gösteriliyor | Dosya yanlış kodlamada kaydedildi | Dosyayı UTF-8 olarak yeniden kaydedin |

::: warning Bozuk bir JSON dosyası bir anahtarını değil, tüm anahtarlarını bozar
JSON katıdır: sonda tek bir virgül, başıboş bir yorum veya kapatılmamış bir süslü parantez *tüm dosyayı* geçersiz kılar. Bir dosya ayrıştırılamadığında, anahtarlarının hiçbiri çözülmez, bu yüzden o dizelerin olması gereken yerde ham anahtar yolları görürsünüz — genellikle bir anda tüm bir sayfa boyunca. Bir sayfa aniden her yerde anahtar yolları gösteriyorsa, önce bir JSON söz dizimi hatasından şüphelenin ve dosyayı herhangi bir JSON doğrulayıcıdan geçirin.
:::

## Sonraki adım

- **[Backend Geliştirme](/tr/addon/backend/)** — Kotlin'de etkinlik günlükleri kaydedin ve izinler tanımlayın.
- **[Frontend Geliştirme](/tr/addon/frontend/)** — `_` deposunu kurun ve bileşenlerinizde çevirileri kullanın.
- **[Derleme ve Yayınlama](/tr/addon/publishing/)** — eklentinizi paketleyin ve gönderin (diller dahil).
