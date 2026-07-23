# Çeviriler (i18n)

**Bu sayfa size ne verir:** sona geldiğinizde bir yerelleştirme dosyanız, ekranda görünen tek bir çevrilmiş satırınız olacak ve daha fazla dil eklemeyi, izin başlıklarını çevirmeyi ve etkinlik günlüğü satırlarını çevirmeyi bileceksiniz.

Yerelleştirme/uluslararasılaştırma (ekosistem kısaltması **i18n**'dir, *internationalization*'ın kısası) eklentinizin metnini farklı dillerde göstermek demektir. Eklentinizin gösterdiği her metin parçası, jar'ın içinde paketlenmiş JSON dosyalarında yaşar — dil başına bir dosya. (Bir `.jar`, bir Kotlin/Java eklentisinin paketlendiği tek zip-benzeri dosyadır, bir npm paketi tarball'ı gibi; onu asla elle açmazsınız.)

::: tip Bunu yapmak zorunda mıyım?
Evet, en azından biraz. İngilizce dizeleri doğrudan Svelte bileşenlerinize sabit-kodlayabilirsiniz — ama iki tür metnin başka yaşayacak yeri yoktur: **izin başlıkları** (panelin İzinler sayfasında gösterilir) ve **etkinlik günlüğü satırları** (panelin Etkinlik sayfasında gösterilir) *yalnızca* yerelleştirme dosyalarından gelebilir. Yani yalnızca-İngilizce bir eklentinin bile bir `en-US.json`'a ihtiyacı var. İkisiyle de aşağıda tanışacaksınız.
:::

## Yerelleştirme dosyalarınızı kurun

Eklenti projenizin içinde (yani [Başlangıç](/tr/addon/getting-started/)'ın iskeleteldiği projede), yoksa `src/main/resources/locales/` klasörünü oluşturun ve yalnızca `{}` içeren bir `en-US.json` dosyası ekleyin. (`resources`, Gradle'ın jar'a paketlenen kod-olmayan dosyalar — JSON, görseller ve benzeri — için verdiği addır. Adına rağmen yalnızca görseller için değildir.)

Dil başına bir dosyayla sonuçlanırsınız; dosya adı o dilin kodudur:

```
src/main/resources/locales/
├─ en-US.json
├─ tr.json
└─ ru.json
```

Yalnızca `en-US.json` gereklidir. Çevirmeye hazır olduğunuzda diğer dilleri (`tr.json`, `ru.json`, …) ekleyin.

::: tip Kontrol noktası
Artık diskte, `{}` içeren `src/main/resources/locales/en-US.json`'a sahip olmalısınız.
:::

- **Dosya biçimi:** her dosya düz, geçerli `.json`'dur — yorum yok ve sondaki virgül yok (her ikisi de tüm dosyayı geçersiz kılar) ve Türkçe veya Rusça karakterlerin bozuk `Ã¶` tarzı metne dönüşmemesi için onu **UTF-8** olarak kaydedin.
- **Dosya adı, yerel koddur:** `en-US.json`, `en-US` kodudur, `tr.json`, `tr`'dir ve böyle devam eder. Pano `en-US` veya `tr` gibi kısa kodları kabul eder — site dili olarak ayarladığınız aynı kodlar (bkz. [Yapılandırma](/tr/platform/configuration/)).

**Bir ziyaretçinin hangi dili gördüğü.** Sitenin varsayılan bir dili vardır (`locale` ayarı) ve yönetici izin verdiğinde, her ziyaretçi gönderdiğiniz dillerden kendininkini seçebilir. `tr.json`'unuzu test etmek için, kendi dilinizi **Panel → Ayarlar → Platform → Tercihler**'den (veya sitenin dil seçicisinden) Türkçe'ye geçirin ve yenileyin.

::: warning en-US yedektir
Ziyaretçinin dili için bir anahtar eksikse, Pano `en-US.json`'a geri döner. Anahtar *orada da* eksikse, ziyaretçi ekranda ham anahtar yolunu görür — gerçek kelimeler yerine `plugins.pano-plugin-shoutbox.widget.title` gibi bir şey. `en-US.json`'u mevcut ve eksiksiz tutun: her diğer dil için güvenlik ağıdır ve ekranda ham bir anahtar, eksik olduğunun ilk işaretidir.
:::

## Ad alanı — anahtarlarınız nerede yaşar

Platform, yazdığınız her anahtarı `plugins.<pluginId>.<key>` altında sunar. Örnek eklentimiz **Shoutbox** için (`pluginId`'si `pano-plugin-shoutbox`'tur — eklentiyi iskeleteltiğinizde `gradle.properties`'te ayarladığınız değer, bkz. [Başlangıç](/tr/addon/getting-started/)), `widget.title` adlı bir anahtar arama anında `plugins.pano-plugin-shoutbox.widget.title` olur.

O uzun öneki asla yazmazsınız — ne JSON dosyalarınızda ne de bileşenlerinizde. JSON'unuzun içinde anahtarlar **öneksiz** kalır (`widget.title`) ve Pano `plugins.<pluginId>.` kısmını otomatik olarak ekler. Önekin gerçekten göründüğü *tek* yer, `main.js`'teki küçük bir yardımcıdır (aşağıda gösterilmiştir) ve boilerplate onu zaten içerir. Bu otomatik önekleme, anahtarlarınızın çekirdek platformunkiyle veya başka bir eklentininkiyle asla çakışmamasını sağlayan şeydir.

## İlk anahtarınızı tanımlayın

Özel anahtarlar, arayüzünüzün gösterdiği sıradan anahtar–değer çiftleridir. Onları `en-US.json`'a, istediğiniz gibi iç içe koyun:

```json
{
  "widget": {
    "title": "Latest shouts",
    "empty": "No shouts yet — be the first!"
  },
  "welcome-message": "Welcome back, {username}!"
}
```

**İç içe nesneler noktalı yollara dönüşür.** Yukarıdaki `title`, `widget`'in içinde yaşar, dolayısıyla onu tek anahtar `widget.title` olarak ararsınız (düz bir `"widget.title"` anahtarı *yazmayın*). Aynı şekilde, `widget` içindeki `empty`, `widget.empty` anahtarıdır.

**Yer tutucular tek süslü parantez kullanır.** `{username}`, daha sonra bileşeninizden doldurduğunuz bir yuvadır (sonraki bölümde gösterilmiştir). Yer tutucular tek süslü parantezle (`{username}`) işlenir, çünkü arayüz svelte-i18n kullanır. Backend e-posta şablonları tek istisnadır — çift parantez kullanırlar; aşağıdaki [tek vs çift parantez](#backend-kotlin)'e bakın.

## Anahtarı bir bileşende gösterin (Svelte)

Bir çeviriyi bir bileşende göstermek için, `_` yardımcısını eklentinizin `main.js`'inden içe aktarın — boilerplate onu zaten gönderir:

```svelte
<script>
  import { _ } from '../main.js';
</script>

<h2>{$_('widget.title')}</h2>
```

Burada bir junior okuyucunun takıldığı üç şey, hepsi normal:

- **Neden `_` deniyor?** `_`, svelte-i18n'in çeviri fonksiyonu için geleneksel adıdır — sürekli yazdığınız için tek karakter.
- **`_`'yi içe aktar, `$_`'yi kullan.** `$` öneki, Svelte'nin bir *deponun* mevcut değerini okuma yoludur (bir depo, Svelte'nin tepkisel değer kutusudur). `_`'yi içe aktarırsınız; onu `$_` olarak kullanırsınız.
- **Dosyanızın derinliğine göre `../`'yi düzeltin.** `import { _ } from '../main.js'`, bileşeninizin tam olarak `main.js`'in bir klasör altında oturduğunu varsayar. Daha derin iç içe bir rotada, daha fazla `../` ekleyin (örneğin `../../main.js`), yoksa içe aktarma 404 verir.

`{$_('widget.title')}`, sizin için `plugins.pano-plugin-shoutbox.widget.title`'ı arar.

::: tip Kontrol noktası
Bileşen artık **Latest shouts** işliyor. Bunun yerine ham `plugins.pano-plugin-shoutbox.widget.title`'ı görüyorsanız, anahtar `en-US.json`'da eksik veya yanlış yazılmış demektir.
:::

### Bir yer tutucuyu doldurma

Yukarıdaki `welcome-message`'ın bir `{username}` yuvası vardı. Onu doldurmak için, ikinci bir argüman geçin — svelte-i18n ona `options` der — yer tutucu değerlerinizi `values` altında:

```svelte
<p>{$_('welcome-message', { values: { username: 'Ada' } })}</p>
```

Bu, **Welcome back, Ada!** işler. `values` altındaki adlar, dizedeki `{...}` adlarıyla eşleşmelidir. Değerler argümanını tamamen unutursanız, ziyaretçi ekranda düz `{username}`'i görür.

::: tip Çoğullar: "1 shout" vs "5 shouts"
İki anahtar ve bir `if` uydurmayın. svelte-i18n, ICU mesaj söz dizimini anlar, dolayısıyla tek bir anahtar her ikisini de halleder — örneğin `{count, plural, one {# shout} other {# shouts}}` — ve onu `$_('shout-count', { values: { count: n } })` ile çağırırsınız. Bkz. [svelte-i18n biçimlendirme dokümanları](https://github.com/kaisermann/svelte-i18n).
:::

### `_` yardımcısı nasıl çalışır (acele ediyorsanız atlayın)

`_`'yi kullanmak için bu parçayı anlamanıza **gerek yok** — boilerplate'in `main.js`'i onu zaten içerir, dolayısıyla yalnızca orada olduğunu doğrulayın. Ama işte burada:

```js
// src/main.js
import { derived } from 'svelte/store';
import { _ as i18n } from '@panomc/sdk/utils/language';

export const pluginId = 'pano-plugin-shoutbox';
export const _ = derived(i18n, ($t) => (key, options) => $t(`plugins.${pluginId}.${key}`, options));
```

Bir *depo*, Svelte'nin tepkisel değer kutusudur; `derived`, "bağlı olduğum şey değiştiğinde yeniden hesapla" demektir — böylece ziyaretçi dil değiştirdiğinde, sayfadaki her `$_(...)` kendiliğinden güncellenir. `@panomc/sdk`, boilerplate tarafından paketlenir (bkz. [Arayüz Geliştirme](/tr/addon/frontend/)). Onu olduğu gibi kopyalayın. Bu, önceki `plugins.<pluginId>.` önekinin gerçekten yazıldığı tek yerdir.

::: tip Ad alanınızın dışındaki anahtarlara ulaşma
Eklentinizin ad alanının *altında olmayan* bir anahtara ihtiyaç duyarsanız, svelte-i18n'in kendi deposunu içe aktarın — `import { _ } from '@panomc/sdk/utils/language'` — ve **tam yolu** kendiniz geçin (örneğin `$_('plugins.pano-plugin-shoutbox.widget.title')`). `main.js`'inizdeki `_`, yalnızca önek eklenmiş bu aynı depodur.
:::

## Düzenlemelerim ne zaman görünür? Geliştirme Modu'nda anında, aksi hâlde yalnızca yeniden derlemeden sonra

Artık ekranda bir anahtarınız olduğuna göre, ona yaptığınız *düzenlemelerin* tarayıcıya nasıl ulaştığı işte burada. **Geliştirme Modu**'na bağlıdır — [Başlangıç](/tr/addon/getting-started/)'ta açtığınız anahtar (**Panel → Platform Ayarları**, yapılandırma anahtarı `development-mode`). Onu atladıysanız, önce bunu yapın.

**Geliştirme Modu açıkken**, ve eklentiniz çalışan Pano sunucunuzun `plugins/<pluginId>/` klasörüne klonlanmışken (sunucunun çalıştığı klasöre *örnek* denir), Pano `locales/*.json`'unuzu her istekte **diskten canlı** okur. Bir dosyayı düzenleyin, yenileyin (F5) ve yeni metin belirir — yeniden derleme yok, tıpkı Svelte arayüzü gibi.

**Geliştirme Modu kapalıyken veya yayınlanmış bir jar'da**, çalışan sunucu yalnızca yerelleştirme dosyalarınızın *jar'ın içindeki* kopyasını okur — kaynak klasörünüze asla bakmaz, dolayısıyla diskteki dosyayı düzenlemek, jar'ı yeniden derleyene kadar hiçbir şey yapmaz:

```bash
./gradlew build -Pnoui
```

(`gradlew`, projenizde zaten bulunan Gradle sarıcı betiğidir — onu proje kökünden çalıştırın, ki baştaki `./`'ün anlamı budur. `-Pnoui`, zaman kazanmak için arayüzü yeniden derlemeyi atlar.)

::: tip Kontrol noktası
Artık `build/libs/` altında bir jar görmelisiniz (yerel bir derleme için, `pano-plugin-shoutbox-local-build.jar`). O dosyayı Pano örneğinizin `plugins/` klasörüne kopyalayın, eskisinin yerine koyun, sonra **Pano'yu yeniden başlatın** — çalışan işlemi durdurun ve tekrar başlatın (bkz. [Başlangıç](/tr/addon/getting-started/)). Eklentiyi panelde devre dışı bırakıp yeniden etkinleştirmek jar içeriğini *yeniden yüklemez*.
:::

::: tip Neden iki mod?
Üretimde, yerelleştirmeler jar'ın içinde gönderilir, böylece bir eklenti tek, kendine yeten bir dosya olarak kalır. Geliştirme Modu, çevirileri yeniden derlemeden yineleyebilmeniz için bunu diskten-canlı bir okumayla değiştirir — Svelte arayüzünüzü her istekte yeniden sunmasının aynı nedeni. Tam sıcak-ile-yeniden-derleme tablosu için [Başlangıç](/tr/addon/getting-started/)'a bakın.
:::

## İzinler (yalnızca eklentiniz izin tanımlıyorsa)

Eklentiniz bir izin tanımlıyorsa, yöneticilerin onu panelin **İzinler** sayfasında anlayabilmesi için ona insan tarafından okunabilir bir başlık ve açıklama verin. Eklentinizin izni yoksa bu bölümü atlayın.

**Tanım (Kotlin):**

```kotlin
@PermissionDefinition
class ManageShoutboxPermission : PanelPermission("fa-bullhorn")
```

`@PermissionDefinition` satırı bir Kotlin *işaretlemesidir* — Pano'nun sınıfınızın otomatik olarak kaydedilmesi için taradığı bir işaretçi; onu tam olarak kopyalayın (ayrıntılar [Backend Geliştirme](/tr/addon/backend/)'de). `fa-bullhorn`, panelde iznin yanında gösterilen bir Font Awesome simge adıdır.

**Çeviri (yerelleştirme dosyanızda):**

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

`MANAGE_SHOUTBOX` anahtarını siz seçmezsiniz — sabit bir kuralla sınıf adından türetilir: `Permission` ekini düşürün, sonra `UPPER_SNAKE_CASE`'e çevirin.

- `ManageShoutboxPermission` → `MANAGE_SHOUTBOX`

::: tip Kontrol noktası
**Panel → İzinler**'i açın. Girdiniz artık ham `MANAGE_SHOUTBOX` anahtarı yerine açıklamasıyla birlikte **Manage Shoutbox** okumalı.
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

Çeviri için, yalnızca `details` satırı önemlidir: içine `put` ettiğiniz her anahtar — burada `target` ve `username` — metinde kullanabileceğiniz bir `{placeholder}` olur. Geri kalanı (`userId`, `pluginId`, kurucu altyapısı) [Backend Geliştirme](/tr/addon/backend/)'de ele alınan backend bağlantısıdır.

**Çeviri (yerelleştirme dosyanızda):**

```json
{
  "activity-logs": {
    "CREATED_SHOUT": "<b>{username}</b> posted a shout: {target}."
  }
}
```

Anahtar, izinlerle aynı kuralı izler, ama bunun yerine `Log` ekini düşürür:

- `CreatedShoutLog` → `CREATED_SHOUT`

`{username}` ve `{target}` yer tutucuları, günlüğün `details` JSON'undan doldurulur — Kotlin sınıfı *veriyi* sağlar ve bu yerelleştirme girdisi *ifadeyi* sağlar.

::: tip Dizelerimde `<b>` gibi HTML kullanabilir miyim?
Burada, evet: `<b>...</b>` çalışır, çünkü Etkinlik sayfası bu belirli dizeleri HTML olarak işler. Bu, her yerelleştirme dizesine HTML koymak için **genel** bir izin değildir. `{$_(...)}` ile gösterilen sıradan özel anahtarlarda, svelte-i18n ham dizeyi döndürür ve Svelte onu kaçış-karakterler (escape) ekleyerek işler, dolayısıyla `<b>` ekranda düz `<b>` metni olarak görünür. HTML işaretlemesini yalnızca etkinlik günlüğü satırlarıyla sınırlı tutun.
:::

::: tip Kontrol noktası
Eylemi gerçekleştirin, sonra **Panel → Etkinlik**'i açın. İşlenen cümle, kullanıcı adı kalın olarak görünmelidir.
:::

## Tam bir `en-US.json`

Yukarıdaki örnekler parçalardı. İşte tek bir dosyada nasıl bir araya geldikleri. **`permissions` ve `activity-logs`, kökte oturur**, özel anahtarlarınızın yanında — asla başka bir nesnenin içinde iç içe değil. Pano bu iki bölümü doğrudan okuyarak onları çekirdek İzinler ve Etkinlik sayfalarına bağlar.

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

İki backend sistemi — ve *yalnızca* bu ikisi — yerelleştirme dosyalarınızı okur. Kendi Kotlin kodunuz bir çeviriyi asla doğrudan aramaz; backend'de metne ihtiyaç duyarsanız, bunlardan biri üzerinden akar:

- **Etkinlik günlükleri.** Eklentiniz bir yönetici eylemini kaydettiğinde, bir `PluginActivityLog` alt sınıfı eklersiniz (bkz. [Backend Geliştirme](/tr/addon/backend/)). Etkinlik sayfası onu `activity-logs.<KEY>`'i arayarak ve `{...}` yer tutucularını günlüğün `details` yükünden doldurarak işler. Yerelleştirilmiş metin *burada*, yerelleştirme dosyasında yaşar — asla Kotlin'de değil.
- **E-posta.** Eklentiniz posta gönderiyorsa, konu ve gövde **Handlebars** şablonlarından gelir. (Handlebars bir şablon dilidir; `{{name}}` doldurulacak bir değişkeni işaretler.) Bu şablonlar `locales/*.json`'unuzun parçası **değildir** — yerelleştirme dosyalarında değil, eklentinizin posta kodunun yanında yaşarlar. `pano-plugin-auth-guard` eklentisi, şablonlu e-posta göndermenin referansıdır (bkz. [Backend Geliştirme](/tr/addon/backend/)).

::: warning Tek vs çift parantez
Arayüzün işlediği her şey — özel anahtarlar, izin başlıkları, etkinlik günlüğü satırları — svelte-i18n üzerinden gider ve **tek** parantezle yerleştirilir: `{username}`. **Çift** parantez `{{variable}}` yazdığınız **tek** yer, backend e-posta (Handlebars) şablonlarının içidir. Yanlış stili kullanmak ham `{...}`'yi ekranda görünür bırakır.
:::

## Yönetici geçersiz kılmaları ve yeni diller

Pano'nun güzel dokunuşlarından biri: yöneticiler eklentinizin çevirilerini doğrudan panelden düzenleyebilir.

- **Geçersiz kılmalar:** bir yönetici tanımladığınız herhangi bir anahtarı değiştirebilir — jar'ınıza dokunmadan yeni ifade.
- **Yeni diller:** bir yönetici, anahtarlarınızı panelde çevirerek eklentinizin göndermediği bir dili ekleyebilir.

Bu düzenlemeler Pano tarafından ayrı olarak saklanır ve eklenti güncellemelerinden sağ çıkar. **Kimin metni kazanır?** Bir yöneticinin geçersiz kılması her zaman jar'ınızdaki metni yener. Yani yeni bir yayında kendi ifadenizi değiştirirseniz, bir yöneticinin özelleştirdiği değer, geçersiz kıldıkları anahtarlar için yürürlükte kalır; yeni varsayılanınız yalnızca yöneticinin hiç dokunmadığı anahtarlar için görünür. Bir site sahibinin ifadesi bir güncelleme tarafından asla sessizce üzerine yazılmaz.

## Bir şey yanlış görünüyorsa

| Gördüğünüz | Olası neden | Çözüm |
|---|---|---|
| Ekranda ham bir anahtar yolu (`plugins.pano-plugin-shoutbox.widget.title`) | Anahtar, ziyaretçinin dilinde *ve* `en-US.json`'da eksik veya yanlış yazılmış | Anahtarı `en-US.json`'a (yedek) ekleyin veya düzeltin |
| Ekranda düz bir `{username}` | Yer tutucu için bir değer geçmediniz | Onu geçin: `$_('welcome-message', { values: { username: ... } })` |
| Ekranda düz bir `{{name}}` | İşleyici için yanlış parantez stili | Arayüz tek `{ }` kullanır; yalnızca e-posta/Handlebars çift `{{ }}` kullanır |
| Bir yerelleştirme dosyasına yapılan düzenlemeler yenilemeden sonra görünmüyor | Geliştirme Modu kapalı veya yayınlanmış bir jar çalıştırıyorsunuz | Geliştirme Modu'nu açın veya jar'ı yeniden derleyip Pano'yu yeniden başlatın |
| Türkçe/Rusça metin `Ã¶` tarzı bozuk gösteriliyor | Dosya yanlış kodlamada kaydedilmiş | Dosyayı UTF-8 olarak yeniden kaydedin |

::: warning Bozuk bir JSON dosyası tek anahtarını değil, tüm anahtarlarını bozar
JSON katıdır: tek bir sondaki virgül, başıboş bir yorum veya kapatılmamış bir parantez, *tüm dosyayı* geçersiz kılar. Bir dosya ayrıştırılamadığında, anahtarlarının hiçbiri çözümlenmez, dolayısıyla bu dizelerin olması gereken yerde ham anahtar yolları görürsünüz — genellikle bir anda tüm bir sayfada. Bir sayfa aniden her yerde anahtar yolları gösteriyorsa, önce bir JSON söz dizimi hatasından şüphelenin ve dosyayı herhangi bir JSON doğrulayıcıdan geçirin.
:::

## Sırada ne var

- **[Backend Geliştirme](/tr/addon/backend/)** — Kotlin'de etkinlik günlükleri kaydedin ve izinler tanımlayın.
- **[Arayüz Geliştirme](/tr/addon/frontend/)** — `_` deposunu kurun ve bileşenlerinizde çevirileri kullanın.
- **[Derleme ve Yayınlama](/tr/addon/publishing/)** — eklentinizi paketleyin ve gönderin (yerelleştirmeler dâhil).
