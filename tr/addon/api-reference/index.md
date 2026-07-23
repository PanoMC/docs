# Arayüz API Referansı

Bu sayfa, eklentinizin arayüzünün kullanabileceği **her kanca adını, görünüm yuvasını, yaşam döngüsü etkinliğini, gezinme yardımcısını ve `@panomc/sdk` dışa aktarmasını** tek bir yerde listeler. Bu bir **arama sayfasıdır**, bir eğitim değil.

**Burada yeni misiniz? Bu sayfanın bir kataloğu olduğu dört şey, düz kelimelerle:**

- Bir **kanca** (hook) = bir host sayfasında, bileşeninizin işlendiği adlandırılmış bir nokta.
- Bir **görünüm yuvası** (view slot) = bir kanca gibi, ama öğeler sıralıdır (bir öncelik numarasına göre) ve tek tek gizlenip gösterilebilir.
- Bir **yaşam döngüsü etkinliği** = sayfa yüklemesi sırasında kod çalıştırabileceğiniz bir an.
- Bir **gezinme yardımcısı** = site menüsüne veya yönetici kenar çubuğuna bağlantı ekleme veya düzenleme API'si.

::: tip Bu sayfa nasıl okunur
API alanına göre gruplanmış (§1–§10) yoğun referans tabloları kümesidir. Onu baştan sona okumazsınız — bağladığınız şeyin bölümüne atlarsınız. Her bölüm, ne için olduğunu ve **nerede çalıştığını** (tema, panel veya ikisi) söyleyen düz bir cümleyle açılır. Bir tablo hücresindeki bir terim tanıdık değilse, neredeyse kesinlikle hemen aşağıdaki "Bu sayfanın varsaydığı kavramlar" kutusunda tanımlanmıştır — önce o kutuyu bir kez okuyun.
:::

::: tip Bu sayfanın varsaydığı kavramlar (bir kez okuyun, ~60 saniye)
Bu sayfa birkaç kelimeyi her biri düzinelerce kez yeniden kullanır. İşte her biri tek düz cümlede:

- **Host** — eklentinizin JavaScript'ini yükleyen ve çalıştıran, çalışan Pano ön yüzü. İki uygulamadan biridir: **tema** veya **panel** (sonraki madde). Buradaki "host" asla kiraladığınız bir sunucu anlamına gelmez.
- **Tema vs panel** — iki ön yüz. **Tema**, oyuncuların gördüğü herkese açık sitedir, `/`'de. **Panel**, yönetici panosudur, `/panel`'de. Eklentiniz ikisinde de çalışabilir ve her biri **farklı** API'ler sunar. `pano.isPanel`, kodunuza hangisinde olduğunu söyler.
- **Svelte deposu (store)** — abone olabileceğiniz bir değer. Bir `.svelte` bileşeninde, onu tepkisel (reactive) olarak okumak için önüne `$` koyun (`$myStore`). Düz JS'te, `store.subscribe(fn)` çağırın ve daha sonra dinlemeyi durdurabilmek için döndürdüğü fonksiyonu tutun (o fonksiyonu `this._unsubscribers`'a itin, bkz. §1). Aşağıdaki birkaç API "bir depo döndürür". ([Svelte dokümanları: depolar](https://svelte.dev/docs/svelte/stores))
- **`load(event)`** — bir sayfanın veya kancanın dışa aktarabileceği isteğe bağlı bir fonksiyon. Host, sayfayı hazırlarken onu çağırır. `event`, isteği tanımlar (URL'si, parametreleri, çerezleri). Aşağıdaki "üç tür `load()`" kutusuna bakın.
- **props** — bir Svelte bileşeninin, onu işleyen şeyden aldığı değerler. `load()`'ınızın döndürdüğü nesne, bileşeninizin props'u olur.
- **SSR / hidrasyon** — SSR ("sunucu tarafı işleme"), bir ziyaretçi bir sayfayı **ilk** açtığında HTML'inin sunucuda oluşturulduğu anlamına gelir; sonraki gezinmeler tarayıcıda oluşturulur. **Hidrasyon**, Svelte'nin o sunucuda-oluşturulmuş HTML'i tarayıcıda bağlayarak düğmeleri vb. etkileşimli hâle getirmesidir.
- **çıplak belirteç (bare specifier) / harici (external)** — bir *çıplak belirteç*, `./` veya `/` olmayan bir içe aktarma yoludur, örn. `import { x } from 'svelte'`. Derlemeniz izin verilenleri **harici** bırakır — onları eklentinizin JS'ine kopyalamaz; host onları çalışma zamanında sağlar. Bkz. §10.
- **izin düğümü (permission node)** — kimin bir şeyi görmesine veya yapmasına izin verildiğine karar veren `x.y.z` gibi bir izin dizesi. Düğümlerin listesi ve eklentilerin kendilerininkini nasıl tanımladığı için [Backend API Referansı](/tr/addon/backend-reference/)'na bakın.
:::

::: tip Bu sayfadaki üç tür `load()`
`load` kelimesi üç farklı rolde ortaya çıkar. Bunlar **birbirinin yerine geçmez** — onları karıştırmak klasik bir ilk-hafta hatasıdır:

| Nerede | Ne yazarsınız | Ne alır | Döndürdüğünün anlamı |
|---|---|---|---|
| **Sayfa** (§2) | bir sayfa modülünde `export function load(event)` | `event` (istek) | sayfa bileşeninin props'u (`pageTitle` gibi dört özel anahtar host için çekilir) |
| **Kanca** (§3) | bir kanca modülünde `export function load(event)` | `event` (istek) | kanca bileşeninin props'u; kancayı gizlemek için `{ hookOptions: { invisible: true } }` döndürün |
| **Yaşam döngüsü işleyicisi** (§4, §6, §7) | bir `onLoad(...)` / `lifecycle.on(...)` çağrısına geçilen `(data, event) => { … }` | `data` (sayfanın verisi, bazen değiştirilebilir) **ve** `event` | genellikle hiçbir şey — okursunuz veya işaretli etkinlikler için `data`'yı yerinde ince ayarlarsınız |
:::

Bu API'lerin gerçek bir eklentide kullanıldığını görmek isterseniz, Shoutbox arayüzünü adım adım oluşturan [Arayüz Geliştirme](/tr/addon/frontend/) ile başlayın. Buradaki her şey, o sayfanın yararlandığı yüzeydir.

Eklentinizin Kotlin yarısı için, bu sayfanın bir kardeşi var: **[Backend API Referansı](/tr/addon/backend-reference/)**, backend yüzeyi için aynı işi yapar — eklenti yaşam döngüsü, veritabanı, uç noktalar, izinler ve etkinlikler.

::: tip Bunlar nereden gelir
`import { X } from 'svelte'` yazarsınız, ama derlemeniz Svelte'yi asla eklentinizin çıktısına paketlemez — o içe aktarmayı **harici** bırakır ve çalışan Pano sitesi (host) çalışma zamanında tek paylaşılan kopyayı sağlar. Yalnızca belirli içe aktarmalara izin verilmesinin nedeni budur (bkz. §10). Aşağıda belgelenen `pano.*` ağacı, eklentinize `this.pano` olarak enjekte edilir; `@panomc/sdk` modülleri, bu sayfanın sonundaki donmuş içe aktarma listesidir. (Tam mekanizma: [Mimari](/tr/addon/architecture/).)
:::

## 0. `pano` nesnesi

Her şeye, host'un eklentinize `this.pano` olarak enjekte ettiği `pano` nesnesi üzerinden ulaşılır. En üstte bir bayrak yaşar; geri kalanı `pano.ui.*`'a asılıdır.

| Özellik | Tür | Ne olduğu |
|---|---|---|
| `pano.isPanel` | boolean | Kodunuz yönetici **paneli**nin içinde çalışırken `true`, **tema**nın içinde `false`. Her birinde farklı kayıtlar çalıştırmak için kullanın — yani `if (this.pano.isPanel) { /* panel registrations */ } else { /* theme registrations */ }`. |

Panel ve tema **farklı** `pano.ui` ağaçları sunar — birinde var olan bir yardımcı diğerinde olmayabilir. Bu yüzden bu sayfa boyunca her bölüm üyelerinin nerede yaşadığını söyler: **tema + panel**, **yalnızca tema** veya **yalnızca panel**. Bir bölümün tamamı tek taraflıysa (§4, yalnızca tema gibi), başlığı ve üstündeki bir kutu bunu söyler.

## 1. Eklenti giriş sözleşmesi

`src/main.js`'iniz, `PanoPlugin`'i (`@panomc/sdk`'den) genişleten bir sınıfı varsayılan olarak dışa aktarır. Host onun bir örneğini oluşturur, `this.pano`'yu enjekte eder ve aşağıdaki yaşam döngüsü metotlarını çağırır.

Mümkün olan en küçük giriş dosyası yalnızca budur:

<!-- src/main.js — the whole file; your registrations go inside onLoad() -->
```js
import { PanoPlugin } from '@panomc/sdk';

export default class extends PanoPlugin {
  onLoad() {
    // your register(...) calls from sections 2–5 go here
  }
}
```

Aşağıdaki her tablo, bu iskeleti gözünüzde canlandırdığınızda daha kolay okunur.

| Üye | Tür | Amaç |
|---|---|---|
| `onLoad()` | metot (geçersiz kıl) | Eklenti yüklendikten sonra bir kez çağrılır. Tüm **kayıtlarınızı** burada yapın (aşağıdaki 2–5. bölümlerden gelen `register(...)` çağrıları). `this.pano` mevcuttur. **Kurucuda `this.pano`'ya dokunmayın** — o yalnızca `onLoad()` çalışmadan hemen önce enjekte edilir. |
| `onUnload()` | metot (geçersiz kıl) | Eklenti sökülürken çağrılır. Kalıcı olmaması gereken her şeyi geri alın (örn. `pano.ui.page.unregister(...)`). |
| `this.pano` | özellik | Bu sayfada belgelenen enjekte edilmiş API nesnesi. |
| `this.context` | özellik | Eklentinizin, bileşenleriyle paylaşmak istediği durumu (örn. getirdiğiniz ayarlar) tuttuğu düz bir nesne. |
| `this.setContext(partial)` | metot | `partial`'ın anahtarlarını `this.context`'e kopyalar (`Object.assign` gibi — **sığ** bir birleştirme, bir seviye derin) ve bağlama abone olan her şeye değiştiğini bildirir. |
| `this._unsubscribers` | dizi | Depo-abonelikten-çıkarma fonksiyonlarını buraya itin (Kavramlar kutusundaki depo maddesine bakın); host, eklenti yok edildiğinde hepsini çalıştırır, böylece abonelikleriniz sızmaz. |

`@panomc/sdk`'den temel sınıfın yanı sıra iki fonksiyon gelir:

| Dışa aktarma | Amaç |
|---|---|
| `viewComponent(importer)` | **Kural: bir bileşeni herhangi bir `register` çağrısına verdiğinizde her zaman `viewComponent(() => import('./X.svelte'))` yazın** — asla çıplak `() => import(...)` ve asla bileşenin kendisi değil. (Host için doğru paylaşılan-çalışma-ortamı `mount`/`hydrate`/`unmount`'ını iliştirir; o mekanizma sarıcının zorunlu olmasının nedenidir.) |
| `getPanoContext()` | Mevcut Pano host bağlamını döndürür. `PanoPlugin` metodu olmayan bir koddan ham host bağlamına ihtiyaç duymadıkça (düz bir metodun bunun yerine `this.context`'i vardır) bunu yok sayabilirsiniz — nadiren gerekir. |

::: warning `onContextUpdate` çağrılmaz
Boilerplate'ten iskeleletdiğiniz sınıf bir `onContextUpdate()` metodu içeriyorsa, **onu silin — hiçbir host onu çağırmaz.** O ölü koddur; üzerine davranış inşa etmeyin. Kurulum için `onLoad()` ve değişikliklere tepki vermek için depo abonelikleri (Kavramlar kutusuna bakın) kullanın.
:::

## 2. Sayfalar — `pano.ui.page` (tema + panel)

Kendinize ait tüm sayfaları kaydetmek için bunları kullanın — tema (`/…`) veya panel (`/panel/…`) altında.

| Çağrı | Amaç |
|---|---|
| `pano.ui.page.register(options)` | Bir yolda bir sayfa kaydedin. |
| `pano.ui.page.unregister(path)` | Kaydettiğiniz bir sayfayı kaldırın (temizlik için kullanılır — bkz. [Arayüz Geliştirme](/tr/addon/frontend/)). |
| `pano.ui.page.isPluginPage(path)` | Bir eklenti o yolu kaydettiyse `true`. |

**`register(options)`:**

| Seçenek | Tür | Anlamı |
|---|---|---|
| `path` | string | Rota (aşağıdaki yol biçimlerine bakın). |
| `component` | `viewComponent(...)` | Sayfa bileşeni. |
| `systemLayout` | string | Sayfanızı host'un yerleşik düzenlerinden birine sarar (adlar aşağıda listelenmiştir). Normal bir sayfa için `MainLayout` kullanın; diğer adlar belirli host bölümleriyle eşleşir (örn. `ProfileLayout`, `SettingsLayout`). |
| `layout` | `viewComponent(...)` | Yerleşik bir düzen yerine kendi düzen bileşeninizi kullanın. |
| `resetLayout` | boolean | Host başlığı, kenar çubuğu veya alt bilgisi **olmadan** işler — bileşeniniz tüm sayfayı alır. (Çevredeki host arayüzü için genel kelime "chrome"dur.) |
| `permission` | string | Görüntülemek için gereken izin düğümü (`x.y.z` gibi bir izin dizesi — liste için [Backend API Referansı](/tr/addon/backend-reference/)'na bakın). Mevcut kullanıcıda yoksa, sayfa **404** işler. |

**Yol biçimleri:**

| Biçim | Örnek | Eşleşir |
|---|---|---|
| düz | `/shoutbox` | tam olarak o yol |
| dinamik segment | `/shout/[id]` veya `/shout/:id` | bir segment, bir parametre olarak yakalanır — `load(event)`'inizde `event.params.id` olarak okuyun |
| hepsini yakala | `/docs/[...rest]` | kalan segmentler (son segment olmalı) |
| regex | `re:/shout/\d+` | desen, yalnızca bir kısmıyla değil, **tüm** yolla eşleşmelidir — host onu sizin için `^…$` ("tamamen çapalı") ile sarar |

Bir sayfa modülü ayrıca **`load(event)`'i dışa aktarabilir** (üstteki "üç tür `load()`" kutusuna bakın). `event`, isteği tanımlar — URL'si, parametreleri ve çerezleri. Döndürdüğünüz nesne, sayfa bileşeninize **props** olarak verilir. O döndürülen nesneden dört özel anahtar **çıkarılır** ve props olarak geçirilmek yerine host chrome'u tarafından kullanılır:

- `pageTitle` — sayfa için gösterilen başlık (örn. tarayıcı sekmesi).
- `breadcrumbs` — host'un sayfanın üstünde işlediği ekmek kırıntısı izi.
- `sidebar` — bu sayfa için bir kenar çubuğu.
- `sidebarProps` — o kenar çubuğuna verilen props.

**`systemLayout` adları — tema:** `AppLayout`, `AuthLayout`, `MainLayout`, `ProfileLayout`, `ThemeSettingsLayout`, `TicketsLayout`.

**`systemLayout` adları — panel:** `AddonDetailLayout`, `AddonsLayout`, `AppLayout`, `MainLayout`, `MigrationLayout`, `PermissionsLayout`, `PlayerDetailLayout`, `PlayersLayout`, `PostsLayout`, `ServerLayout`, `ServerSettingsLayout`, `SettingsLayout`, `TicketsLayout`, `TranslationsLayout`, `ViewLayout`.

::: tip Kontrol noktası — sayfam kaydoldu mu?
Bir `pano.ui.page.register({ path: '/your-path', component })` çağrısından sonra, eklentinizi yeniden derleyin ve siteyi yeniden yükleyin. `/your-path`'i ziyaret etmek artık bileşeninizi göstermeli. Orada bir şey yok mu? `component`'in `viewComponent(() => import('./X.svelte'))` ile sarıldığını ve `register`'ın `onLoad()` içinde çalıştığını kontrol edin.
:::

## 3. Kancalar — `pano.ui.hook` (tema + panel)

Bir **kanca**, bir host sayfasında adlandırılmış bir deliktir: o kancanın adı altında kaydettiğiniz her şey o sabit noktada işlenir. Bir kanca, tek bir ad altında düz bir bileşen listesidir. (§4'teki görünüm yuvaları, bu aynı fikrin üzerine sıralama ve gizleme ekler.)

| Çağrı | Nerede | Amaç |
|---|---|---|
| `pano.ui.hook.register(options)` | tema + panel | Bir bileşeni adlandırılmış bir kancaya yerleştir. |
| `pano.ui.hook.get(name)` | tema + panel | `name` için kaydedilmiş bileşenlerin bir **deposunu** (Kavramlar kutusuna bakın) döndürür. |
| `pano.ui.hook.setVisible(name, component, visible)` | yalnızca tema | Bir kanca girdisinin görünürlüğünü değiştir. `register`'a verdiğiniz **aynı bileşen referansını** geçin. |

**`register(options)`:**

| Seçenek | Tür | Anlamı |
|---|---|---|
| `name` | string | Kanca adı (aşağıdaki tablolar). |
| `component` | `viewComponent(...)` | Yerleştirilecek bileşen. |
| `permission` | string | Yalnızca bu izin düğümüne sahip kullanıcılar için işle. |
| `skipLoad` | boolean | Sayfa yüklemesi sırasında bileşenin `load()`'ını çalıştırma. Kancanız yerleştirmede kendi verisini getirdiğinde, sayfa-yükleme çalıştırması boşa gideceği veya başarısız olacağı için bunu kullanın. |
| `invisible` | boolean | Kaydet ama gizli başla. |

**Kanca `load()` / `hookProps` sözleşmesi:** bir kanca bileşeninin modülü `load(event)`'i dışa aktarabilir. Host onu sayfa yüklemesi sırasında çalıştırır — bir sayfa ilk açıldığında sunucuda (SSR) ve sayfalar arasında gezinirken tarayıcıda — ve sonucu bileşeninize props olarak geçer (o birleşik props nesnesi bileşenin `hookProps`'udur). Bir bileşen, **`load()`'ından** `{ hookOptions: { invisible: true } }` döndürerek kendini gizleyebilir.

::: tip Bir kanca adını okuma
Bir kanca adı size kabaca nerede işlendiğini söyler. **Önek** alandır: `theme:` = herkese açık site, `page:` = sayfa içerik alanı, `panel:` = yönetici paneli. **Orta** kısım sayfayı veya tabloyu adlandırır. **Son ek** noktayı adlandırır: `:top`, `:bottom`, `:content`, `:sidebar` veya `:header:...` / `:row:...` gibi bir tablo konumu. Birinin tam olarak nereye indiğinden emin değil misiniz? Görünür bir işaretçi işleyen bir bileşen kaydedin, yeniden derleyin ve bakın.
:::

Aşağıdaki **Ekstra prop** sütunu, host'un `load()` sonucunuza **ek olarak** bileşeninize geçirdiği herhangi bir prop'u listeler.

### Tema kanca adları

| Kanca adı | Ekstra prop |
|---|---|
| `theme:top` | — |
| `page:top` | — |
| `page:home:top` | — |
| `theme:post-detail:bottom` | `post` |
| `theme:support:content` | — |

### Panel kanca adları

::: tip Tablo kancaları ve `tag` prop'u
Adları `table:header` veya `table:row` içeren panel kancaları, host'un `<tr>` satırlarının **içinde** işlenir. Host size `tag` geçer (bir başlık hücresi için `'th'` veya bir gövde hücresi için `'td'`); hücrenizin geçerli tablo HTML'i olması için `<svelte:element this={tag}>…</svelte:element>` işleyin.
:::

| Kanca adı | Ekstra prop |
|---|---|
| `panel:plugin-detail:content` | `addon` |
| `panel:plugin-detail:content:<pluginId>` | `addon` |
| `panel:player-detail:bottom` | `playerData` |
| `panel:player-detail:sidebar` | `playerData` |
| `panel:post-editor:actions:right` | `post` |
| `panel:post-editor:sidebar:before` | `post` |
| `panel:post-editor:sidebar:after` | `post` |
| `panel:post-editor:content:bottom` | `post` |
| `panel:posts:layout:actions:right` | — |
| `panel:posts:table:header:start` | `tag="th"` |
| `panel:posts:table:header:after-title` | `tag="th"` |
| `panel:posts:table:header:after-category` | `tag="th"` |
| `panel:posts:table:header:after-views` | `tag="th"` |
| `panel:posts:table:header:after-author` | `tag="th"` |
| `panel:posts:table:header:end` | `tag="th"` |
| `panel:posts:table:row:start` | `post`, `tag="td"` |
| `panel:posts:table:row:after-thumbnail` | `post`, `tag="td"` |
| `panel:posts:table:row:after-title` | `post`, `tag="td"` |
| `panel:posts:table:row:after-category` | `post`, `tag="td"` |
| `panel:posts:table:row:after-views` | `post`, `tag="td"` |
| `panel:posts:table:row:after-author` | `post`, `tag="td"` |
| `panel:posts:table:row:end` | `post`, `tag="td"` |
| `panel:players:table:header:start` | `tag="th"` |
| `panel:players:table:header:after-name` | `tag="th"` |
| `panel:players:table:header:after-perm-group` | `tag="th"` |
| `panel:players:table:header:after-status` | `tag="th"` |
| `panel:players:table:header:after-last-login` | `tag="th"` |
| `panel:players:table:header:end` | `tag="th"` |
| `panel:players:table:row:start` | `player`, `tag="td"` |
| `panel:players:table:row:after-name` | `player`, `tag="td"` |
| `panel:players:table:row:after-perm-group` | `player`, `tag="td"` |
| `panel:players:table:row:after-status` | `player`, `tag="td"` |
| `panel:players:table:row:after-last-login` | `player`, `tag="td"` |
| `panel:players:table:row:end` | `player`, `tag="td"` |
| `panel:post-categories:table:header:start` | `tag="th"` |
| `panel:post-categories:table:header:after-category` | `tag="th"` |
| `panel:post-categories:table:header:after-description` | `tag="th"` |
| `panel:post-categories:table:header:after-url` | `tag="th"` |
| `panel:post-categories:table:header:end` | `tag="th"` |
| `panel:post-categories:table:row:start` | `category`, `tag="td"` |
| `panel:post-categories:table:row:after-category` | `category`, `tag="td"` |
| `panel:post-categories:table:row:after-description` | `category`, `tag="td"` |
| `panel:post-categories:table:row:after-url` | `category`, `tag="td"` |
| `panel:post-categories:table:row:end` | `category`, `tag="td"` |

Yukarıdaki `post`, `playerData`, `addon`, `player` ve `category` prop'ları, host sayfasının o gönderi / oyuncu / eklenti / kategori için zaten kullandığı **aynı nesnelerdir**. Tam alanları burada listelenmemiştir — incelemek için prop'u `console.log` edin veya eşleşen host sayfasının kodunu açın.

::: tip `:<pluginId>` son ekli kancalar
`panel:plugin-detail:content:<pluginId>`, yalnızca **sizin** eklentinizin detay sayfasında işlenir — kendi `pluginId`'nizle değiştirin (eklentinizin bildirdiği `id` — bkz. [Backend API Referansı](/tr/addon/backend-reference/)). Bu, bir eklentinin ayarlar panelini koymak için standart yerdir.
:::

::: tip Kontrol noktası — kancam işlendi mi?
`pano.ui.hook.register({ name: 'theme:top', component })`'ten sonra, yeniden derleyin ve temalı bir sayfayı yeniden yükleyin. Bileşeniniz o kancanın noktasında görünmeli. Değilse, yukarıdaki tablolardan gerçek bir kanca adı kullandığınızı ve bileşeni `viewComponent(...)` ile sardığınızı doğrulayın.
:::

## 4. Görünüm yuvaları — `pano.ui.view` (yalnızca tema)

Bir **görünüm yuvası**, bir **öncelik-sıralı eklenti bileşenleri listesi** işleyen adlandırılmış bir kapsayıcıdır (ek giriş yöntemleri, ek profil satırları vb.). Bir kanca gibi, ama her yuva öğesi bir `id` ve bir `priority` taşır, dolayısıyla öğeler tek tek gizlenebilir, yeniden sıralanabilir veya değiştirilebilir.

**Bir bakışta kancalar vs görünüm yuvaları:**

| | Kanca (§3) | Görünüm yuvası (§4) |
|---|---|---|
| Sıralama | yok (düz liste) | `priority`'ye göre (yüksek olan önce işlenir) |
| Öğe-başına id | hayır | evet (`id`) — bir öğeyi gizlemenizi/taşımanızı/değiştirmenizi sağlar |
| Nerede çalışır | tema + panel | **yalnızca tema** |

::: warning `pano.ui.view` / `pano.ui.sidebar` yalnızca temada vardır
- **Panel için mi geliştiriyorsunuz?** Bu bölümün tamamını atlayın — panel `view.register/hide/show/move/get/onLoad/load` veya `pano.ui.sidebar`'ı hiç sunmaz.
- **Panel istisnası 1:** oyuncu düzenleme modalindeki ek satırların kendine adanmış bir API'si vardır — aşağıdaki "Panel: oyuncu düzenleme-modal satırları"na bakın.
- **Panel istisnası 2:** panelin tek `pano.ui.view` üyesi `pano.ui.view.themes.editMenu`'dür — bkz. §8.
:::

| Çağrı | Amaç |
|---|---|
| `pano.ui.view.register({ viewId, id, component, priority })` | `viewId` yuvasına bir bileşen ekle. `priority` varsayılan olarak `10`; aynı `id`'yi yeniden kaydetmek onun yerine geçer. |
| `pano.ui.view.hide(viewId, id)` | Bir öğeyi kaldırmadan gizle. |
| `pano.ui.view.show(viewId, id)` | Onu geri göster. |
| `pano.ui.view.move(viewId, id, priority)` | Bir öğenin önceliğini değiştir. |
| `pano.ui.view.get(viewId)` | Görünür, sıralı öğelerin bir **deposunu** (Kavramlar kutusuna bakın) döndürür. |
| `pano.ui.view.onLoad(viewId, handler)` | Bu yuvanın verisi her yüklendiğinde işleyicinizi çalıştır. (Arka planda bu, `theme:view:<viewId>:load` yaşam döngüsü etkinliğidir — bkz. §6.) |
| `pano.ui.view.load(viewId, event)` | Yuvanın yükleme hattını çalıştır ve çözümlenmiş öğeleri al (kendisi bir yuva barındıran bir eklenti sayfası için). |

`pano.ui.sidebar.*`, aynı kaydın aynı metotlarla bir **takma adıdır** (alias), yalnızca kapsayıcı anahtarı `viewId` yerine `sidebarId`'dir (ve `onLoad`, `theme:sidebar:<id>:load` tetikler).

**Yuva öğesi şekli:** `{ id, component, priority, props? }`. Yüksek `priority` önce işlenir. Öğe-başına bir `permission` alanı **yoktur** — yuva öğeleri izin-filtreli değildir. Birini kısıtlamak için, izni **bileşeninizin içinde** kontrol edin — `import { hasPermission } from '@panomc/sdk/utils/auth'` — ve başarısız olursa hiçbir şey işlemeyin. (Kancalar ve gezinme bağlantıları bir `permission` seçeneğini *destekler*.)

### Tema yuva ID'leri

| Yuva ID | Nerede işlenir |
|---|---|
| `login-content` | giriş sayfası gövdesi |
| `login-alt-methods` | alternatif giriş yöntemleri |
| `register-content` | kayıt sayfası gövdesi |
| `register-alt-methods` | alternatif kayıt yöntemleri |
| `profile-content` | profil sayfası gövdesi |
| `profile-card-rows` | profil kartındaki satırlar |
| `settings-content` | ayarlar sayfası gövdesi |
| `settings-card-rows` | ayarlar kartındaki satırlar |
| `tickets-content` | destek biletleri sayfası gövdesi |
| `navbar-right` | gezinme çubuğunun sağ tarafı |
| `navbar-profile-dropdown` | profil açılır menüsü |
| `support-content` | destek sayfası gövdesi |
| `support-options` | destek sayfası seçenekleri listesi |
| `reset-password-content` | parola-sıfırlama sayfası gövdesi |
| `renew-password-content` | parola-yenileme sayfası gövdesi |
| `activate-content` | hesap-etkinleştirme sayfası gövdesi |
| `activate-new-email-content` | yeni-e-posta-etkinleştirme sayfası gövdesi |

### Panel: oyuncu düzenleme-modal satırları

Panelin `pano.ui.view` yuva kaydı **yoktur**. Bu türdeki tek genişletme noktasının — oyuncu düzenleme modalindeki ek satırlar — bunun yerine kendine adanmış bir API'si vardır:

| Çağrı | Amaç |
|---|---|
| `pano.ui.player.editModal.cardRows.edit(callback)` | Oyuncu düzenleme modalinde gösterilen kart satırları listesini düzenle. `callback`, mevcut satırlar dizisini alır; onu yerinde değiştirin ve döndürün. |
| `pano.ui.player.editModal.cardRows.get()` | Mevcut kart satırlarını oku. |

Satır nesneleri, modalin mevcut satırlarını yansıtır; tam alanları burada listelenmemiştir — onları incelemek için `cardRows.get()` çağırın (veya `edit` geri çağırmanızın aldığı diziyi `console.log` edin). Avatar ve sosyal-giriş tarzı eklentiler, o modale bir satır eklemek için bunu kullanır.

### Öncelik gelenekleri

Öğelerinizin **kurulu diğer eklentilere göre** mantıklı bir sırada inmesi için bu numaralarla eşleşin. Hatırlatma: **yüksek öncelik önce işlenir**, dolayısıyla negatif `-100`, destek enjeksiyonlarını kasıtlı olarak **en sona** koyar.

| Yuva türü | Gelenek |
|---|---|
| oyuncu-düzenleme-modal satırları | `100` |
| ayarlar kart satırları | `105` |
| profil kart satırları | `90` |
| alternatif kimlik doğrulama yöntemleri | `50` |
| destek enjeksiyonu | `-100` |
| diğer her şey | `10` (varsayılan) |

## 5. Gezinme — `pano.ui.nav`

Site menüsüne (tema) veya yönetici kenar çubuğuna (panel) bağlantı ekleyin veya düzenleyin. Tema ve panel **farklı** yardımcılar sunar.

**Tema (yalnızca tema):**

| Çağrı | Amaç |
|---|---|
| `pano.ui.nav.site.editNavLinks(callback)` | **Eşzamanlı.** Mevcut bağlantılar dizisini alır; onu ya yerinde değiştirin ya da yeni bir dizi döndürün. Sonuç, host tarafından her bağlantının `priority`'sine göre yeniden sıralanır. |
| `pano.ui.nav.site.getNavLinks()` | Mevcut site gezinme bağlantılarının deposu. |
| `pano.ui.nav.profileDropdown.edit(callback)` / `.get()` | Profil-açılır öğelerini düzenle / oku (bu, §4'teki `navbar-profile-dropdown` yuvasını düzenler). |
| `pano.ui.nav.rightComponents.edit(callback)` / `.get()` | Gezinme-çubuğu-sağ bileşenlerini düzenle / oku (bu, §4'teki `navbar-right` yuvasını düzenler). |
| `pano.ui.nav.onLoad(handler)` | `theme:navbar:load`'a abone ol (bir yaşam döngüsü etkinliği — bkz. §6). |

**Tema gezinme-bağlantısı şekli** — `{ href, text, icon?, target?, startsWith, loginRequired?, permission?, priority? }`, alan alan:

| Alan | Gerekli | Anlamı |
|---|---|---|
| `href` | evet | Bağlantının işaret ettiği yer, örn. `/shoutbox`. |
| `text` | evet | Görünür etiket. Dize bir `.` içeriyorsa bir çeviri anahtarı olarak ele alınır ve `_` üzerinden geçirilir (bkz. §9 / Çeviriler); aksi hâlde olduğu gibi gösterilir. |
| `startsWith` | evet | Aktif-bağlantı vurgulamasını kontrol eden bir **boolean**. `true` olduğunda, mevcut URL yolu `href` ile *başladığında* bağlantı vurgulanır (böylece `/shoutbox`, `/shoutbox/123`'te vurgulu kalır); `false` olduğunda, yalnızca tam bir yol eşleşmesi vurgular. |
| `icon` | hayır | Bir `<i>` üzerinde işlenen bir simge **CSS sınıf dizesi**, örn. `'fa-solid fa-comments'`. |
| `target` | hayır | Standart bağlantı `target`'ı, örn. yeni bir sekme için `'_blank'`. |
| `loginRequired` | hayır | `true` ise, bağlantıyı yalnızca giriş yapmış kullanıcılara göster. |
| `permission` | hayır | İzin düğümü; bağlantıyı yalnızca ona sahip kullanıcılara göster. |
| `priority` | hayır | Bağlantılar arasında sıralama düzeni (düşük numara önce gelir; numarasız bağlantılar en sona sıralanır). |

**Panel (yalnızca panel):**

| Çağrı | Amaç |
|---|---|
| `pano.ui.nav.site.editNavLinks(async handler)` | **Async, diziyi döndürmelidir.** Panelin ana kenar çubuğu bağlantılarını düzenler. |
| `pano.ui.nav.server.editNavLinks(async handler)` | Async, diziyi döndürmelidir. Sunucu-bölümü kenar çubuğu bağlantılarını düzenler. |

::: warning Panel gezinme geri çağırmaları diziyi döndürmelidir
Temanın `editNavLinks`'i yerinde bir değişikliği kabul eder, ama panelin `editNavLinks`'i (ve `server.editNavLinks`) **async**'tir ve listeyi **döndürdüğünüz** şeye ayarlar — `return`'ü unutun ve menüyü silersiniz. Şöyle görünür:

```js
pano.ui.nav.site.editNavLinks(async (links) => {
  links.push({ href: '/panel/shoutbox', text: 'Shoutbox' });
  return links; // forget this line and the sidebar goes blank
});
```
:::

## 6. Yaşam döngüsü etkinlikleri

Host'un bir sayfanın verisi hazırlanırken tetiklediği yükleme-anı etkinlikleri. Her işleyicinin imzası `async (data, event)`'tir — `event`, `load()`'ınızın aldığı aynı istek-etkinliği nesnesidir (§2) ve `data`, sayfanın devam eden verisidir. Çoğu işleyicide yalnızca `data`'yı **okursunuz**; aşağıdaki işaretli etkinlikler için onu **değiştirebilirsiniz** (Veri notları sütununa bakın). Aşağıdaki kısayol yardımcılarıyla veya genel ilkelle kaydedin:

| Çağrı | Amaç |
|---|---|
| `pano.ui.lifecycle.on(name, handler)` | Herhangi bir yaşam döngüsü etkinliğine ada göre abone ol (tema + panel). |
| `pano.ui.lifecycle.execute(name, data, event)` | **Yalnızca tema.** Bir yaşam döngüsünü kendiniz çalıştırın — örn. eklentiniz kendi giriş sayfasını işler ve host'un giriş yaşam döngüsünün (ve diğer eklentilerin işleyicilerinin) onun üzerinde çalışmasını ister. Panelin `pano.ui.lifecycle`'ı yalnızca `on`'u sunar. |

### Tema yaşam döngüsü etkinlikleri

| Etkinlik | Kısayol | Veri notları |
|---|---|---|
| `theme:app:load` | `pano.ui.app.onLoad(h)` | — |
| `theme:navbar:load` | `pano.ui.nav.onLoad(h)` | — |
| `theme:profile:load` | `pano.ui.profile.onLoad(h)` | — |
| `theme:settings:load` | `pano.ui.settings.onLoad(h)` | — |
| `theme:tickets:load` | `pano.ui.tickets.onLoad(h)` | — |
| `theme:login:load` | `pano.ui.auth.login.onLoad(h)` | `data = { error, event }` — `data.error = '…'` ayarlayabilirsiniz; işleyiciniz çalıştıktan sonra host onu okur ve giriş sayfasında gösterir |
| `theme:register:load` | `pano.ui.auth.register.onLoad(h)` | `data = { error, username, event }` — `data.error` ve `data.username` ayarlayabilirsiniz; host onları geri okur |
| `theme:reset-password:load` | `pano.ui.auth.resetPassword.onLoad(h)` | — |
| `theme:activate:load` | `pano.ui.auth.activate.onLoad(h)` | `data = { token }` — `token`, kullanıcının e-postasındaki bağlantıdan gelen etkinleştirme kodudur (URL'den alınır) |
| `theme:activate-new-email:load` | `pano.ui.auth.activateNewEmail.onLoad(h)` | `data = { token }` — aynı fikir, yeni bir e-postayı onaylamak için |
| `theme:renew-password:load` | `pano.ui.auth.renewPassword.onLoad(h)` | `data = { token }` — aynı fikir, bir parola-sıfırlama bağlantısı için |
| `theme:post-detail:load` | `pano.ui.post.onLoad(h)` | — |
| `theme:support:load` | `pano.ui.support.onLoad(h)` | — |
| `theme:view:<viewId>:load` | `pano.ui.view.onLoad(viewId, h)` | yuva başına tetiklenir |
| `theme:sidebar:<id>:load` | `pano.ui.sidebar.onLoad(id, h)` | kenar çubuğu başına tetiklenir |

### Panel yaşam döngüsü etkinlikleri

| Etkinlik | Kısayol | Veri notları |
|---|---|---|
| `panel:posts:load` | `pano.ui.posts.onLoad(h)` | — |
| `panel:addon-detail:load` | `pano.ui.addon.onLoad(h)` | `data = { addon }` |
| `panel:player-detail:edit-modal:load` | `pano.ui.player.onEditLoad(h)` | `data = { player }` |

## 7. Kimlik doğrulama yüzeyleri (yalnızca tema)

Kimlik doğrulama sayfaları için yardımcılar. `<page>`, şunlardan biridir: `login`, `register`, `resetPassword`, `activate`, `activateNewEmail`, `renewPassword`.

| Çağrı | Amaç |
|---|---|
| `pano.ui.auth.<page>.content.edit(callback)` / `.get()` | O sayfanın içerik yuvasını düzenle / oku. Bu, §4'ün `<page>-content` yuvasıyla aynı yuvadır (örn. `pano.ui.auth.login.content.edit`, `login-content` yuvasını düzenler) — ona bir kısayol, ayrı bir mekanizma değil. |
| `pano.ui.auth.<page>.onLoad(handler)` | O sayfanın yükleme etkinliğine abone ol (§6'daki `theme:<page>:load` etkinlikleri). |
| `pano.ui.auth.login.alternativeMethods.add(method)` / `.get()` | Bir alternatif giriş yöntemi ekle / oku (örn. bir sosyal-giriş düğmesi). |
| `pano.ui.auth.register.alternativeMethods.add(method)` / `.get()` | Kayıt için aynı. |
| `pano.ui.auth.login.load(event)` | Giriş yükleme akışını çalıştır (kendi girişini sunan bir eklenti sayfası için). `{ error, username, event }` döndürür. |
| `pano.ui.auth.register.load(event)` | Bir eklenti kayıt sayfası için aynı. |
| `pano.ui.auth.login.form.get()` | Temanın kendi giriş-formu gövde bileşenini döndürür, böylece bir eklenti sayfası standart giriş formunu kendi düzeninin içinde işleyebilir. |
| `pano.ui.auth.register.form.get()` | Kayıt formu için aynı. |

`resetPassword`, `activate`, `activateNewEmail` ve `renewPassword` yalnızca `content.edit`/`content.get` ve `onLoad`'ı sunar.

## 8. Çeşitli

| Çağrı | Nerede | Amaç |
|---|---|---|
| `pano.ui.avatar.updateVersion()` | tema + panel | Avatar "önbellek-kırıcısını" — avatar görsel URL'lerine eklenen bir sürüm numarası — artır, böylece tarayıcılar önbellekteki (eski) resmi göstermek yerine resmi yeniden indirir. Bir kullanıcı avatarını değiştirdikten sonra onu çağırın. |
| `pano.ui.avatar.getVersion()` | tema + panel | Mevcut avatar sürüm dizesinin deposu. |
| `pano.ui.view.themes.editMenu(async handler)` | yalnızca panel | Temalar-sayfası bağlam-menüsü öğelerini düzenle. Async; işleyici mevcut öğeleri alır ve diziyi **döndürmelidir**. |
| `pano.ui.posts.editMenu(async handler)` | yalnızca panel | Gönderiler bağlam-menüsü öğelerini düzenle. Async; **döndürmelidir**. |

İki `editMenu` çağrısı için, bir menü öğesinin tam alanları burada listelenmemiştir — birini eklemeden veya değiştirmeden önce her öğenin şeklini görmek için işleyicinizin aldığı diziyi `console.log` edin.

## 9. `@panomc/sdk` modül dışa aktarmaları

Bu, donmuş **`@panomc/sdk`** içe aktarma yüzeyidir — her belirteç, kararlı bir host çalışma-ortamı modülüne eşlenir. Tam olarak bu yollardan içe aktarın ve bu paketlerin içine asla derin içe aktarma yapmayın (örn. `@panomc/sdk/utils/api/something` çözümlenmez). (Svelte'nin kendi belirteçleri ve paketlediğiniz herhangi bir npm paketi de çözümlenir — tam içe aktarma resmi için §10'a bakın.)

| Belirteç | Dışa aktarmalar |
|---|---|
| `@panomc/sdk` | `PanoPlugin`, `viewComponent`, `getPanoContext` |
| `@panomc/sdk/utils/api` | `ApiUtil` (varsayılan), `NETWORK_ERROR`, `networkErrorBody`, `buildQueryParams` |
| `@panomc/sdk/utils/auth` | `hasPermission(permission, user)` |
| `@panomc/sdk/utils/tooltip` | `tooltip` (aynı zamanda varsayılan) |
| `@panomc/sdk/utils/text` | `copy` |
| `@panomc/sdk/utils/language` | `_`, `languageLoading`, `currentLanguage`, `Languages`, `init`, `getAcceptedLanguage`, `loadLanguage`, `changeLanguage`, `getLanguageByLocale` |
| `@panomc/sdk/utils/component` | `viewComponent` |
| `@panomc/sdk/toasts` | `showToast`, `limitTitle` |
| `@panomc/sdk/components/theme` | `PlayerHead`, `NoContent`, `Date`, `Toast`, `PageTitle`, `PageActions`, `Pagination` |
| `@panomc/sdk/components/panel` | `NoContent`, `Editor`, `DragAndDropZone`, `Date`, `Toast`, `PageLoading`, `PageActions`, `PageLoader`, `PageNavItem`, `PageNav`, `Pagination`, `CardFilters`, `CardFiltersItem`, `CardHeader`, `SearchInput` |
| `@panomc/sdk/variables` | `API_URL`, `UI_URL`, `PANEL_URL`, `SETUP_URL`, `PANO_WEBSITE_URL`, `PANO_WEBSITE_API_URL`, `PRERELEASE`, `COOKIE_PREFIX`, `CSRF_TOKEN_COOKIE_NAME`, `JWT_COOKIE_NAME`, `CSRF_HEADER`, `updateApiUrl`, `updatePanoWebsiteUrl`, `updatePanoWebsiteApiUrl` |
| `@panomc/sdk/svelte` | `page`, `base`, `navigating`, `browser`, `goto`, `invalidate`, `invalidateAll`, `error`, `redirect` |
| `@panomc/sdk/internal` | `setPanoContext`, `getPanoContext` |

`viewComponent` iki kez görünür — `@panomc/sdk`'de ve `@panomc/sdk/utils/component`'te. **Aynı fonksiyondur**; ikisinden de içe aktarın (`@panomc/sdk` olağan yoldur).

Adları kendiliğinden açık olmayan dışa aktarmalar:

- `_` — çeviri fonksiyonu/deposu: bir bileşende `$_('some.key')`. Bkz. [Çeviriler](/tr/addon/localization/).
- `languageLoading`, `currentLanguage` — mevcut i18n durumu için depolar.
- `tooltip` — bir Svelte eylemi: onu bir öğede `use:tooltip` ile iliştirin.
- `copy` — bir dizeyi panoya kopyalar.
- `hasPermission(permission, user)` — `user`, `permission`'a sahipse `true` döndürür; arayüzü göstermek/gizlemek için kullanın (bkz. §4).
- `showToast` / `limitTitle` — bir toast bildirimi göster / bir toast için uzun bir başlık dizesini kısalt (aşağıdaki `showToast` imzasına bakın).
- `NoContent` — bir "boş durum" yer tutucu bileşeni.
- `PageLoading` / `PageLoader` — yükleme-durumu arayüzü (iki çeşit; hangisinin durumunuza uyduğunu görmek için her birini deneyin).
- `PlayerHead` — bir Minecraft oyuncusunun kafa görselini işler.

::: tip Hangi `@panomc/sdk/variables`'a gerçekten ihtiyacınız var
Günlük kullanım: `API_URL`, `UI_URL`, `PANEL_URL` (ve bir ön-yayın derlemesini algılamak için `PRERELEASE`). Geri kalanı — `CSRF_TOKEN_COOKIE_NAME`, `JWT_COOKIE_NAME`, `CSRF_HEADER`, `COOKIE_PREFIX`, `update*Url` ayarlayıcıları — `ApiUtil`'in sizin için zaten hallettiği kimlik doğrulama/güvenlik altyapısıdır; onlara nadiren dokunursunuz.
:::

::: tip `@panomc/sdk/svelte` = SvelteKit'in kendi API'leri
Bunlar SvelteKit'in dışa aktarmalarını yansıtır — `page`, `navigating`, `browser` (`$app/state` / `$app/environment`'ten), `base` (`$app/paths`'ten), `goto`, `invalidate`, `invalidateAll` (`$app/navigation`'dan) ve `error`, `redirect` (`@sveltejs/kit`'ten). Her birinin nasıl davrandığı için SvelteKit dokümanlarına bakın. Onları host çalışma ortamına çözümlenmeleri için `$app/...`'tan değil, `@panomc/sdk/svelte`'ten içe aktarın.
:::

::: warning `Button`, `Card` veya `Input` yok
`@panomc/sdk/components/panel` ve `.../theme`, tam olarak yukarıda listelenen bileşenleri dışa aktarır. Genel bir `Button`/`Card`/`Input` yoktur — bazı eski örnekler asla var olmamış bileşenlere atıfta bulundu; yukarıdaki liste yetkilidir. Basit kontrolleri düz işaretlemeyle oluşturun veya listelenen bileşenleri yeniden kullanın.
:::

**`ApiUtil` metot imzaları** (hepsi `async`, hepsi tek bir seçenek nesnesi alır):

| Metot | Seçenekler |
|---|---|
| `ApiUtil.get(...)` | `{ path, request, csrfToken, token, blob, handler }` |
| `ApiUtil.post(...)` | `{ path, request, body, headers, csrfToken, token, blob, handler, onUploadProgress }` |
| `ApiUtil.put(...)` | `{ path, request, body, headers, csrfToken, token, blob, handler, onUploadProgress }` |
| `ApiUtil.delete(...)` | `{ path, request, headers, csrfToken, token, blob, handler }` |
| `ApiUtil.customRequest(...)` | `{ path, data, request, csrfToken, token, blob, handler, onUploadProgress }` |

**Her seçeneğin anlamı** (her seçenek her metotta görünmez — yukarıdaki imza tablosunu kullanın):

| Seçenek | Anlamı |
|---|---|
| `path` | API yolu, **`/api`'ye görecelidir** — `'shoutbox/list'` geçin ve yardımcı `/api/shoutbox/list`'i çağırır. |
| `request` | `load(event)` argümanı. Bir `load()` içinden çağırdığınızda, isteğin CSRF jetonuna sahip olması ve SSR sırasında çalışması için onu her zaman geçin (örnekten sonraki nota bakın). |
| `body` | İstek yükü (bir nesne, JSON olarak gönderilir; veya dosya yüklemeleri için bir `FormData`). Yalnızca POST/PUT. |
| `headers` | Ek istek başlıkları. POST/PUT/DELETE. |
| `csrfToken` | CSRF jetonu. Normalde onu atlarsınız — yardımcı onu oturumdan `request` aracılığıyla okur. |
| `token` | Bir taşıyıcı (bearer) jetonu; ayarlandığında `Authorization: Bearer <token>` olarak gönderilir. Normal giriş yapmış çağrılar için atlayın — çerezler kimlik doğrulamayı halleder. |
| `blob` | Yanıt bir dosya/ikili (binary) olduğunda `true` ayarlayın, böylece JSON olarak ayrıştırılmak yerine bir Blob olarak okunur. |
| `handler` | Ayrıştırılan yanıtı, size döndürülmeden önce son-işleyen isteğe bağlı bir `(data, reject) => data` geri çağırması. |
| `onUploadProgress` | Yükleme-ilerleme geri çağırması (POST/PUT/customRequest) — bir ilerleme çubuğunu sürmek için kullanın. |
| `data` | (yalnızca customRequest) ham fetch seçenekleri — `method`, `body`, `headers`. `get`/`post`/vb. yardımcıları bunu sizin için oluşturur. |

Sayfa yüklemesi sırasında minimal bir GET — `path`'in (`/api`'ye göreceli) ve `request: event`'in yerine dikkat edin:

```js
import ApiUtil from '@panomc/sdk/utils/api';

export async function load(event) {
  // pass request: event so the call works during SSR (the first page view)
  const response = await ApiUtil.get({ path: 'your-endpoint', request: event });
  return { response }; // this object becomes your page component's props
}
```

Bunları bir `load()` içinde çağırdığınızda her zaman `request: event` geçin. Unutursanız, çağrı CSRF jetonunu alamaz veya SSR sırasında sunucunun getirmesini yeniden kullanamaz — başarısız olabilir veya sayfa yüklendikten sonra tarayıcıda sessizce yeniden çalışabilir. O son durum kafa karıştırıcı olandır: sitede etrafta tıklandığında çalışıyor gibi görünür, ama taze bir sayfa yüklemesinde veya sert bir yenilemede bozulur.

**`showToast` imzası:** `showToast(text, params = {}, toastComponent)`.

| Argüman | Anlamı |
|---|---|
| `text` | Mesaj. Bir çeviri anahtarıysa (bir `.` içeriyorsa) çevrilir; aksi hâlde olduğu gibi gösterilir. |
| `params` | Varsayılan toast ile, bunlar `text` içine yerleştirilen çeviri **değerleri** olur. Özel bir `toastComponent` ile, o bileşene props olarak geçirilirler. İsteğe bağlı (varsayılan `{}`). |
| `toastComponent` | Varsayılan toast yerine işlenecek isteğe bağlı özel Svelte bileşeni. |

## 10. Neleri içe aktarabilirsiniz

::: warning Yalnızca donmuş liste host çalışma ortamına çözümlenir
Derlemeniz bu içe aktarmaları bilinçli olarak eklentinizin JS'ine **paketlemez** — onları **harici** bırakır ve host onları çalışma zamanında sağlar, böylece her eklenti tek bir Svelte örneğini paylaşır. Listenin dışındaki herhangi bir şeyi içe aktarın, o çalışma zamanında çözümlenmez.
:::

İzin verilen çıplak belirteçler tam olarak şunlardır:

- §9 tablosundaki her `@panomc/sdk` belirteci.
- Svelte: `svelte`, `svelte/store`, `svelte/transition`, `svelte/easing`, `svelte/motion`, `svelte/animate`, `svelte/legacy`, `svelte/events`, `svelte/attachments`, `svelte/reactivity`, `svelte/reactivity/window` ve `svelte-i18n`.
- **Sabit** bir Svelte iç öğeleri kümesi *(ileri düzey — derleyici bu içe aktarmaları derlenmiş kodunuza sizin için yayar; onları asla elle yazmazsınız)*: `svelte/internal`, `svelte/internal/client`, `svelte/internal/disclose-version`, `svelte/internal/flags/legacy`, `svelte/internal/flags/async` ve `svelte/internal/flags/tracing`. Bu tam bir listedir, bir `svelte/internal/*` joker karakteri **değil**; başka herhangi bir `svelte/internal/...` alt yolu çözümlenmez.

Başka her şey — `chart.js`, `svelte-select`, başka herhangi bir npm paketi — rollup derlemeniz tarafından **eklentinize paketlenmeli** (bundle), çıplak içe aktarılmamalıdır. Bunun için özel bir şey yapmazsınız: boilerplate'in rollup derlemesi, `bun add` yapıp sonra normal şekilde `import` ettiğiniz her şeyi zaten paketler. (Market eklentisi, Chart.js'i göndermek için tam olarak bunu yapar.)

::: warning `svelte`'yi asla `package.json`'unuza eklemeyin
SDK herkesin hangi Svelte sürümüyle derleyeceğini kontrol eder (sürümü sabitlenmiştir) ve derleme bir uyuşmazlıkta **başarısız olur**. `package.json`'unuzdaki ikinci bir `svelte` kopyası, sayfalarınızı sessizce bozar (iki kopya hidrasyon sırasında anlaşmazlığa düşer). Bkz. [Mimari](/tr/addon/architecture/).
:::

## Bilinen ölü yüzeyler (kullanmayın)

Bütünlük için, yüzeyde var olan ama hiçbir şey yapmayan iki üye — onların üzerine inşa etmeyin:

- `pano.debug` — `pano` nesnesindeki bir boolean bayrak. Şu anda sabit olarak `false`'tur ve hiçbir host onu ayarlamaz, dolayısıyla bir geliştirme derlemesini algılamak için onu **kullanmayın**.
- `onContextUpdate()` — hiçbir host'un çağırmadığı eski bir boilerplate metodu (bkz. §1).

## Sırada ne var

- **[Arayüz Geliştirme](/tr/addon/frontend/)** — bu API'leri işe koşan Shoutbox anlatımı.
- **[Çeviriler](/tr/addon/localization/)** — `_` deposu ve yerelleştirme dosyalarınız birlikte nasıl uyar.
- **[Sayfa Tasarımlarını Değiştirme](/tr/theme/views/)** — ayrıca tema da geliştiriyorsanız, tema tarafı görünüm/kanca modeli.
