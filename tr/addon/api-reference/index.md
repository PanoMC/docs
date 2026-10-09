# Arayüz API Referansı

Bu sayfa, eklentinizin arayüzünün kullanabileceği **her kanca adını, view slotunu, yaşam döngüsü olayını, gezinme yardımcısını ve `@panomc/sdk` dışa aktarımını** tek yerde listeler. Bu bir **arama sayfasıdır**, bir eğitim değil.

**Burada yeni misiniz? Bu sayfanın kataloglandığı dört şey, sade sözlerle:**

- Bir **kanca** = bir host sayfasında bileşeninizin render edildiği adlandırılmış bir yer.
- Bir **view slotu** = bir kanca gibi, ama öğeler sıralıdır (bir öncelik numarasına göre) ve tek tek gizlenebilir veya gösterilebilir.
- Bir **yaşam döngüsü olayı** = sayfa yüklemesi sırasında kod çalıştırabileceğiniz bir an.
- Bir **gezinme yardımcısı** = site menüsüne veya yönetici kenar çubuğuna bağlantı eklemek veya düzenlemek için bir API.

::: tip Bu sayfa nasıl okunur
API alanına göre gruplanmış (§1–§11) yoğun referans tablolarından oluşur. Onu baştan sona okumazsınız — bağladığınız şey için bölüme atlarsınız. Her bölüm ne için olduğunu ve **nerede çalıştığını** (tema, panel veya her ikisi) söyleyen sade bir cümleyle açılır. Bir tablo hücresindeki bir terim tanıdık değilse, neredeyse kesinlikle hemen aşağıdaki "Bu sayfanın varsaydığı kavramlar" kutusunda tanımlanmıştır — önce o kutuyu bir kez okuyun.
:::

::: tip Bu sayfanın varsaydığı kavramlar (bir kez okuyun, ~60 saniye)
Bu sayfa birkaç kelimeyi her biri onlarca kez yeniden kullanır. İşte her biri tek bir sade cümlede:

- **Host** — eklentinizin JavaScript'ini yükleyen ve çalıştıran çalışan Pano frontend'i. İki uygulamadan biridir: **tema** veya **panel** (sonraki madde). Buradaki "host" asla kiraladığınız bir sunucu anlamına gelmez.
- **Tema vs panel** — iki frontend. **Tema**, oyuncuların gördüğü herkese açık sitedir, `/`'te. **Panel**, yönetici panosudur, `/panel`'de. Eklentiniz her ikisinde de çalışabilir ve her biri **farklı** API'ler açığa çıkarır. `pano.isPanel` kodunuza hangisinde olduğunu söyler.
- **Svelte deposu (store)** — abone olabileceğiniz bir değer. Bir `.svelte` bileşeninde, onu reaktif olarak okumak için önüne `$` koyun (`$myStore`). Düz JS'te, `store.subscribe(fn)` çağırın ve daha sonra dinlemeyi durdurabilmek için döndürdüğü fonksiyonu tutun (o fonksiyonu `this._unsubscribers`'a itin, §1'e bakın). Aşağıdaki birkaç API "bir depo döndürür". ([Svelte dokümanları: stores](https://svelte.dev/docs/svelte/stores))
- **`load(event)`** — bir sayfanın veya kancanın dışa aktarabileceği isteğe bağlı bir fonksiyon. Host onu sayfayı hazırlarken çağırır. `event` isteği tanımlar (URL'si, parametreleri, çerezleri). Aşağıdaki "üç tür `load()`" kutusuna bakın.
- **props** — bir Svelte bileşeninin onu render eden şeyden aldığı değerler. `load()`'unuzun döndürdüğü nesne bileşeninizin props'u olur.
- **SSR / hydration** — SSR ("sunucu tarafı render") bir ziyaretçi bir sayfayı **ilk** açtığında HTML'inin sunucuda oluşturulduğu anlamına gelir; sonraki gezinmeler tarayıcıda oluşturulur. **Hydration**, Svelte'in o sunucu-oluşturulmuş HTML'i tarayıcıda bağlaması, böylece düğmelerin vb. etkileşimli hale gelmesidir.
- **çıplak belirteç / harici** — bir *çıplak belirteç*, `./` veya `/` olmayan bir içe aktarma yoludur, örn. `import { x } from 'svelte'`. Derlemeniz izin verilenleri **harici** bırakır — onları eklentinizin JS'ine kopyalamaz; host onları çalışma zamanında sağlar. §10'a bakın.
- **izin düğümü** — kimin bir şeyi görmesine veya yapmasına izin verildiğine karar veren `x.y.z` gibi bir izin dizesi. Düğümlerin listesi ve eklentilerin kendilerininkini nasıl tanımladığı için [Backend API Referansı](/tr/addon/backend-reference/)'na bakın.
:::

::: tip Bu sayfadaki üç tür `load()`
`load` kelimesi üç farklı rolde görünür. **Birbirlerinin yerine geçmezler** — onları karıştırmak klasik bir ilk hafta hatasıdır:

| Nerede | Siz yazarsınız | O şunu alır | Dönüşü ne anlama gelir |
|---|---|---|---|
| **Sayfa** (§2) | bir sayfa modülünde `export function load(event)` | `event` (istek) | sayfa bileşeninin props'u (`pageTitle` gibi dört özel anahtar host için çekilir) |
| **Kanca** (§3) | bir kanca modülünde `export function load(event)` | `event` (istek) | kanca bileşeninin props'u; kancayı gizlemek için `{ hookOptions: { invisible: true } }` döndürün |
| **Yaşam döngüsü işleyicisi** (§4, §6, §7) | bir `onLoad(...)` / `lifecycle.on(...)` çağrısına geçirilen `(data, event) => { … }` | `data` (sayfanın verisi, bazen değiştirilebilir) **ve** `event` | genellikle hiçbir şey — okursunuz veya işaretli olaylar için `data`'yı yerinde değiştirirsiniz |
:::

Bu API'lerin gerçek bir eklentide kullanıldığını görmek istiyorsanız, Shoutbox arayüzünü adım adım oluşturan [Frontend Geliştirme](/tr/addon/frontend/) ile başlayın. Buradaki her şey o sayfanın beslendiği yüzeydir.

Eklentinizin Kotlin yarısı için, bu sayfanın bir kardeşi var: **[Backend API Referansı](/tr/addon/backend-reference/)** backend yüzeyi için aynı işi yapar — eklenti yaşam döngüsü, veritabanı, endpoint'ler, izinler ve olaylar.

::: tip Bunlar nereden gelir
`import { X } from 'svelte'` yazarsınız, ama derlemeniz Svelte'i asla eklentinizin çıktısına paketlemez — o içe aktarmayı **harici** bırakır ve çalışan Pano sitesi (host) tek paylaşılan kopyayı çalışma zamanında sağlar. Yalnızca belirli içe aktarmalara izin verilmesinin nedeni budur (§10'a bakın). Aşağıda belgelenen `pano.*` ağacı eklentinize `this.pano` olarak enjekte edilir; `@panomc/sdk` modülleri bu sayfanın sonundaki dondurulmuş içe aktarma listesidir. (Tam mekanizma: [Mimari](/tr/addon/architecture/).)
:::

## 0. `pano` nesnesi

Her şeye, host'un eklentinize `this.pano` olarak enjekte ettiği `pano` nesnesi aracılığıyla ulaşılır. Bir bayrak en üstte yaşar; geri kalanı `pano.ui.*`'a asılıdır.

| Özellik | Tür | Nedir |
|---|---|---|
| `pano.isPanel` | boolean | Kodunuz yönetici **panelinin** içinde çalışırken `true`, **temanın** içinde `false`. Her birinde farklı kayıtlar çalıştırmak için kullanın — yani `if (this.pano.isPanel) { /* panel registrations */ } else { /* theme registrations */ }`. |

Panel ve tema **farklı** `pano.ui` ağaçları açığa çıkarır — birinde var olan bir yardımcı diğerinde olmayabilir. Bu yüzden bu sayfa boyunca her bölüm üyelerinin nerede yaşadığını söyler: **tema + panel**, **yalnızca tema** veya **yalnızca panel**. Bütün bir bölüm tek taraflı olduğunda (§4 gibi, yalnızca tema), başlığı ve üstündeki bir kutu bunu söyler.

## 1. Eklenti giriş sözleşmesi

`src/main.js`'iniz `PanoPlugin`'i (`@panomc/sdk`'dan) genişleten bir sınıfı varsayılan-dışa aktarır. Host onun bir örneğini oluşturur, `this.pano`'yu enjekte eder ve aşağıdaki yaşam döngüsü metotlarını çağırır.

Mümkün olan en küçük giriş dosyası yalnızca şudur:

<!-- src/main.js — the whole file; your registrations go inside onLoad() -->
```js
import { PanoPlugin } from '@panomc/sdk';

export default class extends PanoPlugin {
  onLoad() {
    // your register(...) calls from sections 2–5 go here
  }
}
```

Aşağıdaki her tablo, o iskeleti gözünüzde canlandırdığınızda okumak daha kolaydır.

| Üye | Tür | Amaç |
|---|---|---|
| `onLoad()` | metot (geçersiz kıl) | Eklenti yüklendikten sonra bir kez çağrılır. Tüm **kayıtlarınızı** burada yapın (aşağıdaki 2–5. bölümlerdeki `register(...)` çağrıları). `this.pano` mevcuttur. **Kurucuda `this.pano`'ya dokunmayın** — yalnızca `onLoad()` çalışmadan hemen önce enjekte edilir. |
| `onUnload()` | metot (geçersiz kıl) | Eklenti sökülürken çağrılır. Kalmaması gereken her şeyi geri alın (örn. `pano.ui.page.unregister(...)`). |
| `this.pano` | özellik | Bu sayfada belgelenen enjekte edilen API nesnesi. |
| `this.context` | özellik | Eklentinizin bileşenleriyle paylaşmak istediği durumu tuttuğu düz bir nesne (örn. getirdiğiniz ayarlar). |
| `this.setContext(partial)` | metot | `partial`'ın anahtarlarını `this.context`'e kopyalar (`Object.assign` gibi — **sığ** bir birleştirme, bir seviye derin) ve bağlama abone olan her şeye değiştiğini bildirir. |
| `this._unsubscribers` | dizi | Depo-abonelik-iptal fonksiyonlarını buraya itin (Kavramlar kutusundaki depo maddesine bakın); eklenti yok edildiğinde host hepsini çalıştırır, böylece abonelikleriniz sızmaz. |

İki fonksiyon temel sınıfla birlikte `@panomc/sdk`'dan gelir:

| Dışa aktarım | Amaç |
|---|---|
| `viewComponent(importer)` | **Kural: bir bileşeni herhangi bir `register` çağrısına verdiğinizde her zaman `viewComponent(() => import('./X.svelte'))` yazın** — asla çıplak `() => import(...)` ve asla bileşenin kendisini değil. (Host için doğru paylaşılan-çalışma-zamanı `mount`/`hydrate`/`unmount`'unu ekler; sarmalayıcının zorunlu olmasının nedeni o altyapıdır.) |
| `getPanoContext()` | Mevcut Pano host bağlamını döndürür. Bir `PanoPlugin` metodu olmayan koddan ham host bağlamına ihtiyacınız olmadıkça bunu görmezden gelebilirsiniz (düz bir metodun bunun yerine `this.context`'i vardır) — nadiren gerekir. |

::: warning `onContextUpdate` çağrılmaz
Boilerplate'ten iskele oluşturduğunuz sınıf bir `onContextUpdate()` metodu içeriyorsa, **onu silin — hiçbir host onu çağırmaz.** Ölü koddur; onun üzerine davranış inşa etmeyin. Kurulum için `onLoad()`'ı ve değişikliklere tepki vermek için depo aboneliklerini (Kavramlar kutusuna bakın) kullanın.
:::

## 2. Sayfalar — `pano.ui.page` (tema + panel)

Bunları kendi tam sayfalarınızı kaydetmek için kullanın — tema (`/…`) veya panel (`/panel/…`) altında.

| Çağrı | Amaç |
|---|---|
| `pano.ui.page.register(options)` | Bir yola bir sayfa kaydet. |
| `pano.ui.page.unregister(path)` | Kaydettiğiniz bir sayfayı kaldır (temizlik için kullanılır — bkz. [Frontend Geliştirme](/tr/addon/frontend/)). |
| `pano.ui.page.isPluginPage(path)` | Bir eklenti o yolu kaydettiyse `true`. |

**`register(options)`:**

| Seçenek | Tür | Anlamı |
|---|---|---|
| `path` | string | Rota (aşağıdaki yol biçimlerine bakın). |
| `component` | `viewComponent(...)` | Sayfa bileşeni. |
| `systemLayout` | string | Sayfanızı host'un yerleşik düzenlerinden birine sarın (adlar aşağıda listelenmiş). Normal bir sayfa için `MainLayout` kullanın; diğer adlar belirli host bölümlerine karşılık gelir (örn. `ProfileLayout`, `SettingsLayout`). |
| `layout` | `viewComponent(...)` | Yerleşik bir tane yerine kendi düzen bileşeninizi kullanın. |
| `resetLayout` | boolean | Host başlığı, kenar çubuğu veya alt bilgisi **olmadan** render et — bileşeniniz tüm sayfayı alır. ("Chrome", o çevreleyen host arayüzü için genel kelimedir.) |
| `permission` | string | Görüntülemek için gereken izin düğümü (`x.y.z` gibi bir izin dizesi — liste için [Backend API Referansı](/tr/addon/backend-reference/)'na bakın). Mevcut kullanıcı ona sahip değilse, sayfa **404** render eder. |
| `public` | boolean | **Yalnızca panel.** Sayfa oturum olmadan açılır — girişin parçası olan sayfalar için (OAuth dönüşü, e-postadaki sihirli bağlantının açıldığı sayfa). `systemLayout`/`resetLayout`'u kendiniz vermezseniz giriş kabuğunda (`AuthShell`, panel çerçevesi olmadan) render edilir. Diğer tüm panel sayfaları oturumu olmayan ziyaretçiye giriş formunu gösterir. |

**Yol biçimleri:**

| Biçim | Örnek | Eşleşir |
|---|---|---|
| literal | `/shoutbox` | tam olarak o yol |
| dinamik segment | `/shout/[id]` veya `/shout/:id` | bir segment, bir parametre olarak yakalanır — onu `load(event)`'inizde `event.params.id` olarak okuyun |
| yakala-tümü | `/docs/[...rest]` | kalan segmentler (son segment olmalı) |
| regex | `re:/shout/\d+` | desen yalnızca bir kısmını değil, **tüm** yolu eşleştirmelidir — host onu sizin için `^…$` içine sarar ("tamamen sabitlenmiş") |

Bir sayfa modülü ayrıca **`load(event)` dışa aktarabilir** (üstteki "üç tür `load()`" kutusuna bakın). `event` isteği tanımlar — URL'sini, parametrelerini ve çerezlerini. Döndürdüğünüz nesne, sayfa bileşeninize **props** olarak verilir. Dört özel anahtar o döndürülen nesneden **çıkarılır** ve props olarak geçirilmek yerine host chrome tarafından kullanılır:

- `pageTitle` — sayfa için gösterilen başlık (örn. tarayıcı sekmesi).
- `breadcrumbs` — host'un sayfanın üstünde render ettiği kırıntı izi.
- `sidebar` — bu sayfa için bir kenar çubuğu.
- `sidebarProps` — o kenar çubuğuna verilen props.

**`systemLayout` adları — tema:** `AppLayout`, `AuthLayout`, `MainLayout`, `ProfileLayout`, `ThemeSettingsLayout`, `TicketsLayout`.

**`systemLayout` adları — panel:** `AddonDetailLayout`, `AddonsLayout`, `AppLayout`, `AuthShell`, `MainLayout`, `MigrationLayout`, `PermissionsLayout`, `PlayerDetailLayout`, `PlayersLayout`, `PostsLayout`, `ServerDetailLayout`, `ServerSettingsLayout`, `ServersLayout`, `SettingsLayout`, `TicketsLayout`, `TranslationsLayout`, `ViewLayout`.

::: tip Kontrol noktası — sayfam kaydoldu mu?
Bir `pano.ui.page.register({ path: '/your-path', component })` çağrısından sonra, eklentinizi yeniden derleyin ve siteyi yeniden yükleyin. `/your-path`'i ziyaret etmek artık bileşeninizi göstermeli. Orada bir şey yok mu? `component`'in `viewComponent(() => import('./X.svelte'))` içine sarıldığını ve `register`'ın `onLoad()` içinde çalıştığını kontrol edin.
:::

## 3. Kancalar — `pano.ui.hook` (tema + panel)

Bir **kanca**, bir host sayfasındaki adlandırılmış bir deliktir: o kancanın adı altında kaydettiğiniz her şey o sabit yerde render edilir. Bir kanca, tek bir ad altındaki düz bir bileşen listesidir. (§4'teki view slotları bu aynı fikrin üstüne sıralama ve gizleme ekler.)

| Çağrı | Nerede | Amaç |
|---|---|---|
| `pano.ui.hook.register(options)` | tema + panel | Bir bileşeni adlandırılmış bir kancaya yerleştir. |
| `pano.ui.hook.get(name)` | tema + panel | `name` için kaydedilmiş bileşenlerin bir **deposunu** (Kavramlar kutusuna bakın) döndürür. |
| `pano.ui.hook.setVisible(name, component, visible)` | yalnızca tema | Bir kanca girdisinin görünürlüğünü değiştir. `register`'a verdiğiniz **aynı bileşen referansını** geçirin. |

**`register(options)`:**

| Seçenek | Tür | Anlamı |
|---|---|---|
| `name` | string | Kanca adı (aşağıdaki tablolar). |
| `component` | `viewComponent(...)` | Yerleştirilecek bileşen. |
| `permission` | string | Yalnızca bu izin düğümüne sahip kullanıcılar için render et. |
| `skipLoad` | boolean | Sayfa yüklemesi sırasında bileşenin `load()`'unu çalıştırma. Kancanız yerleştiğinde kendi verisini getirdiğinde bunu kullanın, böylece bir sayfa-yükleme çalıştırması boşa gitmez veya başarısız olmaz. |
| `invisible` | boolean | Kaydet ama gizli başla. |

**Kanca `load()` / `hookProps` sözleşmesi:** bir kanca bileşeninin modülü `load(event)` dışa aktarabilir. Host onu sayfa yüklemesi sırasında çalıştırır — bir sayfa ilk açıldığında sunucuda (SSR) ve sayfalar arasında gezinirken tarayıcıda — ve sonucu bileşeninize props olarak geçirir (o birleşik props nesnesi bileşenin `hookProps`'udur). Bir bileşen, **`load()`'undan** `{ hookOptions: { invisible: true } }` döndürerek kendini gizleyebilir.

::: tip Bir kanca adını okuma
Bir kanca adı kabaca nerede render ettiğini söyler. **Önek** alandır: `theme:` = herkese açık site, `page:` = sayfa içerik alanı, `panel:` = yönetici paneli. **Orta** kısım sayfayı veya tabloyu adlandırır. **Son ek** yeri adlandırır: `:top`, `:bottom`, `:content`, `:sidebar` veya `:header:...` / `:row:...` gibi bir tablo konumu. Bir tanesinin tam olarak nereye indiğinden emin değil misiniz? Görünür bir işaretçi render eden bir bileşen kaydedin, yeniden derleyin ve bakın.
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
Adları `table:header` veya `table:row` içeren panel kancaları, host'un `<tr>` satırlarının **içinde** render eder. Host size `tag`'i geçirir (bir başlık hücresi için `'th'` veya bir gövde hücresi için `'td'`); hücreniz geçerli tablo HTML'i olsun diye `<svelte:element this={tag}>…</svelte:element>` render edin.
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

Yukarıdaki `post`, `playerData`, `addon`, `player` ve `category` prop'ları, o post / player / addon / category için **host sayfasının zaten kullandığı aynı nesnelerdir**. Tam alanları burada listelenmemiştir — onu incelemek için prop'u `console.log`'layın veya eşleşen host sayfasının kodunu açın.

::: tip `:<pluginId>`-son ekli kancalar
`panel:plugin-detail:content:<pluginId>` yalnızca **sizin** eklentinizin detay sayfasında render eder — kendi `pluginId`'nizi (plugin'inizin bildirdiği `id` — bkz. [Backend API Referansı](/tr/addon/backend-reference/)) yerine koyun. Bu, bir eklentinin ayarlar panelini koymak için standart yerdir.
:::

::: tip Kontrol noktası — kancam render etti mi?
`pano.ui.hook.register({ name: 'theme:top', component })`'ten sonra, yeniden derleyin ve temalı bir sayfayı yeniden yükleyin. Bileşeniniz o kancanın yerinde görünmeli. Değilse, yukarıdaki tablolardan gerçek bir kanca adı kullandığınızı ve bileşeni `viewComponent(...)` içine sardığınızı onaylayın.
:::

## 4. View slotları — `pano.ui.view` (tema + panel)

Bir **view slotu**, eklenti bileşenlerinin **önceliğe göre sıralı bir listesini** render eden adlandırılmış bir kaptır (ekstra giriş yöntemleri, ekstra profil satırları vb.). Bir kanca gibi, ama her slot öğesi bir `id` ve bir `priority` taşır, böylece öğeler tek tek gizlenebilir, yeniden sıralanabilir veya değiştirilebilir.

**Kancalar vs view slotları bir bakışta:**

| | Kanca (§3) | View slotu (§4) |
|---|---|---|
| Sıralama | yok (düz bir liste) | `priority`'ye göre (yüksek olan önce render eder) |
| Öğe başına id | hayır | evet (`id`) — bir öğeyi gizlemenizi/taşımanızı/değiştirmenizi sağlar |
| Nerede çalışır | tema + panel | tema + panel (panel yalnızca giriş slotlarını render eder) |

::: warning Panel yalnızca iki slot render eder
- Panelde de aynı `view.register/hide/show/move/get/onLoad/load` çağrıları var, ama render ettiği slotlar yalnızca kendi giriş sayfasındaki `login-content` ve `login-alt-methods`'tur (§7). Oradaki `onLoad`, `panel:view:<viewId>:load`'u tetikler.
- `pano.ui.sidebar` yalnızca temada var.
- Oyuncu düzenleme modalındaki ekstra satırların kendi özel API'si vardır — aşağıdaki "Panel: oyuncu düzenleme-modalı satırları"na bakın.
:::

| Çağrı | Amaç |
|---|---|
| `pano.ui.view.register({ viewId, id, component, priority })` | `viewId` slotuna bir bileşen ekle. `priority` varsayılan `10`'dur; aynı `id`'yi yeniden kaydetmek onu değiştirir. |
| `pano.ui.view.hide(viewId, id)` | Bir öğeyi kaldırmadan gizle. |
| `pano.ui.view.show(viewId, id)` | Onu tekrar göster. |
| `pano.ui.view.move(viewId, id, priority)` | Bir öğenin önceliğini değiştir. |
| `pano.ui.view.get(viewId)` | Görünür, sıralı öğelerin bir **deposunu** (Kavramlar kutusuna bakın) döndürür. |
| `pano.ui.view.onLoad(viewId, handler)` | Bu slotun verisi her yüklendiğinde işleyicinizi çalıştır. (Perde arkasında bu, `theme:view:<viewId>:load` yaşam döngüsü olayıdır — §6'ya bakın.) |
| `pano.ui.view.load(viewId, event)` | Slotun yükleme hattını çalıştır ve çözümlenen öğeleri al (bir slotu kendisi barındıran bir eklenti sayfası için). |

`pano.ui.sidebar.*`, aynı metotlarla aynı kayıt defterinin bir **takma adıdır**, tek fark kap anahtarının `viewId` yerine `sidebarId` olmasıdır (ve `onLoad`, `theme:sidebar:<id>:load`'ı tetikler).

**Slot öğesi şekli:** `{ id, component, priority, props? }`. Yüksek `priority` önce render eder. Öğe başına **`permission` alanı yoktur** — slot öğeleri izin-filtrelenmez. Birini kısıtlamak için, izni **bileşeninizin içinde** kontrol edin — `import { hasPermission } from '@panomc/sdk/utils/auth'` — ve başarısız olursa hiçbir şey render etmeyin. (Kancalar ve gezinme bağlantıları bir `permission` seçeneğini *destekler*.)

### Tema slot ID'leri

| Slot ID | Nerede render eder |
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
| `support-options` | destek sayfası seçenekler listesi |
| `reset-password-content` | şifre-sıfırlama sayfası gövdesi |
| `renew-password-content` | şifre-yenileme sayfası gövdesi |
| `activate-content` | hesap-etkinleştirme sayfası gövdesi |
| `activate-new-email-content` | yeni-e-posta-etkinleştirme sayfası gövdesi |

### Panel: oyuncu düzenleme-modalı satırları

Oyuncu düzenleme modalındaki ekstra satırlar bir view slotu değildir; kendi özel API'leri vardır:

| Çağrı | Amaç |
|---|---|
| `pano.ui.player.editModal.cardRows.edit(callback)` | Oyuncu düzenleme modalında gösterilen kart satırları listesini düzenle. `callback` mevcut satırlar dizisini alır; onu yerinde değiştir ve döndür. |
| `pano.ui.player.editModal.cardRows.get()` | Mevcut kart satırlarını oku. |

Satır nesneleri modalın mevcut satırlarını yansıtır; tam alanları burada listelenmemiştir — onları incelemek için `cardRows.get()` çağırın (veya `edit` geri çağrınızın aldığı diziyi `console.log`'layın). Avatar- ve sosyal-giriş tarzı eklentiler o modala bir satır eklemek için bunu kullanır.

### Öncelik gelenekleri

Öğeleriniz **diğer kurulu eklentilere göre** mantıklı bir sırada insin diye bu sayılarla eşleşin. Hatırlatma: **yüksek öncelik önce render eder**, bu yüzden negatif `-100` destek enjeksiyonlarını kasten **en sona** koyar.

| Slot türü | Gelenek |
|---|---|
| oyuncu-düzenleme-modalı satırları | `100` |
| ayarlar kartı satırları | `105` |
| profil kartı satırları | `90` |
| alternatif kimlik doğrulama yöntemleri | `50` |
| destek enjeksiyonu | `-100` |
| diğer her şey | `10` (varsayılan) |

## 5. Gezinme — `pano.ui.nav`

Site menüsüne (tema) veya yönetici kenar çubuğuna (panel) bağlantı ekleyin veya düzenleyin. Tema ve panel **farklı** yardımcılar açığa çıkarır.

**Tema (yalnızca tema):**

| Çağrı | Amaç |
|---|---|
| `pano.ui.nav.site.editNavLinks(callback)` | **Senkron.** Mevcut bağlantılar dizisini alır; ya onu yerinde değiştirin ya da yeni bir dizi döndürün. Sonuç host tarafından her bağlantının `priority`'sine göre yeniden sıralanır. |
| `pano.ui.nav.site.getNavLinks()` | Mevcut site gezinme bağlantılarının deposu. |
| `pano.ui.nav.profileDropdown.edit(callback)` / `.get()` | Profil-açılır öğelerini düzenle / oku (bu, §4'teki `navbar-profile-dropdown` slotunu düzenler). |
| `pano.ui.nav.rightComponents.edit(callback)` / `.get()` | Gezinme-çubuğu-sağ bileşenlerini düzenle / oku (bu, §4'teki `navbar-right` slotunu düzenler). |
| `pano.ui.nav.onLoad(handler)` | `theme:navbar:load`'a abone ol (bir yaşam döngüsü olayı — §6'ya bakın). |

**Tema gezinme-bağlantısı şekli** — `{ href, text, icon?, target?, startsWith, loginRequired?, permission?, priority? }`, alan alan:

| Alan | Gerekli | Anlamı |
|---|---|---|
| `href` | evet | Bağlantının işaret ettiği yer, örn. `/shoutbox`. |
| `text` | evet | Görünür etiket. Dize bir `.` içeriyorsa bir çeviri anahtarı olarak ele alınır ve `_` üzerinden çalıştırılır (bkz. §9 / Çeviriler); aksi halde olduğu gibi gösterilir. |
| `startsWith` | evet | Etkin-bağlantı vurgulamasını kontrol eden bir **boolean**. `true` olduğunda, bağlantı mevcut URL yolu `href`'iyle *başladığında* vurgulanır (böylece `/shoutbox`, `/shoutbox/123`'te vurgulu kalır); `false` olduğunda, yalnızca tam yol eşleşmesi onu vurgular. |
| `icon` | hayır | Bir `<i>` üzerinde render edilen bir ikon **CSS sınıf dizesi**, örn. `'fa-solid fa-comments'`. |
| `target` | hayır | Standart bağlantı `target`'ı, örn. yeni sekme için `'_blank'`. |
| `loginRequired` | hayır | `true` ise, bağlantıyı yalnızca giriş yapmış kullanıcılara göster. |
| `permission` | hayır | İzin düğümü; bağlantıyı yalnızca ona sahip kullanıcılara göster. |
| `priority` | hayır | Bağlantılar arasında sıralama düzeni (düşük sayı önce çalışır; onsuz bağlantılar en sona sıralanır). |

**Panel (yalnızca panel):**

| Çağrı | Amaç |
|---|---|
| `pano.ui.nav.site.editNavLinks(async handler)` | **Asenkron, diziyi döndürmelidir.** Panelin ana kenar çubuğu bağlantılarını düzenler. |
| `pano.ui.nav.server.editNavLinks(async handler)` | Asenkron, diziyi döndürmelidir. Sunucu-bölümü kenar çubuğu bağlantılarını düzenler. |

::: warning Panel gezinme geri çağrıları diziyi döndürmelidir
Temanın `editNavLinks`'i yerinde bir değişikliği kabul eder, ama panelin `editNavLinks`'i (ve `server.editNavLinks`'i) **asenkrondur** ve listeyi **döndürdüğünüz** şeye ayarlar — `return`'ü unutun ve menüyü silersiniz. Şöyle görünür:

```js
pano.ui.nav.site.editNavLinks(async (links) => {
  links.push({ href: '/panel/shoutbox', text: 'Shoutbox' });
  return links; // forget this line and the sidebar goes blank
});
```
:::

## 6. Yaşam döngüsü olayları

Host'un bir sayfanın verisi hazırlanırken tetiklediği yükleme-zamanı olayları. Her işleyicinin imzası `async (data, event)`'dir — `event`, `load()`'unuzun aldığı aynı istek-olay nesnesidir (§2) ve `data` sayfanın devam eden verisidir. Çoğu işleyicide yalnızca `data`'yı **okursunuz**; aşağıdaki işaretli olaylar için onu **değiştirebilirsiniz** (Veri notları sütununa bakın). Aşağıdaki kısayol yardımcılarıyla veya genel temel ile kaydedin:

| Çağrı | Amaç |
|---|---|
| `pano.ui.lifecycle.on(name, handler)` | Herhangi bir yaşam döngüsü olayına ada göre abone ol (tema + panel). |
| `pano.ui.lifecycle.execute(name, data, event)` | Tema + panel. Bir yaşam döngüsünü kendiniz çalıştırın — örn. eklentiniz kendi giriş sayfasını render eder ve host'un giriş yaşam döngüsünün (ve diğer eklentilerin işleyicilerinin) onun üzerinde çalışmasını ister. `data`'yı döndürür. |

### Tema yaşam döngüsü olayları

| Olay | Kısayol | Veri notları |
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
| `theme:renew-password:load` | `pano.ui.auth.renewPassword.onLoad(h)` | `data = { token }` — aynı fikir, bir şifre-sıfırlama bağlantısı için |
| `theme:post-detail:load` | `pano.ui.post.onLoad(h)` | — |
| `theme:support:load` | `pano.ui.support.onLoad(h)` | — |
| `theme:view:<viewId>:load` | `pano.ui.view.onLoad(viewId, h)` | slot başına tetiklenir |
| `theme:sidebar:<id>:load` | `pano.ui.sidebar.onLoad(id, h)` | kenar çubuğu başına tetiklenir |

### Panel yaşam döngüsü olayları

| Olay | Kısayol | Veri notları |
|---|---|---|
| `panel:posts:load` | `pano.ui.posts.onLoad(h)` | — |
| `panel:addon-detail:load` | `pano.ui.addon.onLoad(h)` | `data = { addon }` |
| `panel:player-detail:edit-modal:load` | `pano.ui.player.onEditLoad(h)` | `data = { player }` |
| `panel:login:load` | `pano.ui.auth.login.onLoad(h)` | `data = { error, username, event }` — `theme:login:load` ile aynı; panelin kendi giriş sayfasında tetiklenir (§7) |
| `panel:view:<viewId>:load` | `pano.ui.view.onLoad(viewId, h)` | her slot için tetiklenir |

## 7. Kimlik doğrulama yüzeyleri (tema; giriş panelde de) {#auth-surfaces}

Kimlik doğrulama sayfaları için yardımcılar. `<page>`, şunlardan biridir: `login`, `register`, `resetPassword`, `activate`, `activateNewEmail`, `renewPassword`.

| Çağrı | Amaç |
|---|---|
| `pano.ui.auth.<page>.content.edit(callback)` / `.get()` | O sayfanın içerik slotunu düzenle / oku. Bu, §4'ün `<page>-content`'iyle aynı slottur (örn. `pano.ui.auth.login.content.edit`, `login-content` slotunu düzenler) — ona bir kısayol, ayrı bir mekanizma değil. |
| `pano.ui.auth.<page>.onLoad(handler)` | O sayfanın yükleme olayına abone ol (§6'daki `theme:<page>:load` olayları). |
| `pano.ui.auth.login.alternativeMethods.add(method)` / `.get()` | Alternatif bir giriş yöntemi ekle / oku (örn. bir sosyal-giriş düğmesi). |
| `pano.ui.auth.register.alternativeMethods.add(method)` / `.get()` | Kayıt için aynısı. |
| `pano.ui.auth.login.load(event)` | Giriş yükleme akışını çalıştır (kendi girişini sunan bir eklenti sayfası için). `{ error, username, event }` döndürür. |
| `pano.ui.auth.register.load(event)` | Bir eklenti kayıt sayfası için aynısı. |
| `pano.ui.auth.login.form.get()` | Temanın kendi giriş-formu gövde bileşenini döndürür, böylece bir eklenti sayfası standart giriş formunu kendi düzeninin içinde render edebilir. |
| `pano.ui.auth.register.form.get()` | Kayıt formu için aynısı. |

`resetPassword`, `activate`, `activateNewEmail` ve `renewPassword` yalnızca `content.edit`/`content.get` ve `onLoad`'ı açığa çıkarır.

**Panelde.** Kullanım modu **Sunucu Yönetimi** olan bir kurulum tema çalıştırmaz; bu yüzden panelin kendi giriş sayfası vardır ve aynı eklentileri alır: `pano.ui.auth.login` panelde de vardır; `content`, `alternativeMethods`, `onLoad` (`panel:login:load`'u tetikler) ve `load` ile. Aynı öğeleri `if (pano.isPanel)` dalında kaydedin — eski bir panel atlasın diye `if (pano.ui.auth?.login)` ile koruyun. `priority`'si `100`'ün altındaki öğeler formun içinde (captcha), diğerleri formun ardından (2FA modalı) render edilir; alternatif yöntemler "veya" ayracının altında görünür. Panelde `form.get()` ve başka kimlik doğrulama sayfası yoktur. Panele özgü tek bir çağrı ekler:

| Çağrı | Amaç |
|---|---|
| `pano.ui.auth.login.complete(csrfToken, { target? })` | **Yalnızca panel.** Çerezlerini backend'inizin zaten ayarladığı bir girişi tamamlar: hesabın panel erişimi olduğunu kontrol eder (yoksa oturumu yeniden kapatır), sonra `?next=`, `target` ya da panoyu açar. `'ok'` veya `'NO_PANEL_ACCESS'` döndürür. |

Bir giriş akışının vardığı sayfalar (OAuth dönüşleri, e-postayla gelen bağlantılar) panelde `public: true` ile kaydedilir (§2). Böyle bir kurulumda Pano, sorgu dizesi taşıyan bir site adresini olduğu gibi `/panel` altına taşır — `/my-plugin/callback?code=…`, `/panel/my-plugin/callback?code=…`'yu açar — bu yüzden aynı yolu panelde kaydedin ve `pano.isPanel` doğruyken sayfalarınız arasındaki bağlantıları `/panel/…`'a yönlendirin.

## 8. Çeşitli

| Çağrı | Nerede | Amaç |
|---|---|---|
| `pano.ui.avatar.updateVersion()` | tema + panel | Avatar "önbellek-kırıcısını" — avatar resim URL'lerine eklenen bir sürüm numarası — artır, böylece tarayıcılar önbelleğe alınmış (eski) olanı göstermek yerine resmi yeniden indirir. Bir kullanıcı avatarını değiştirdikten sonra onu çağırın. |
| `pano.ui.avatar.getVersion()` | tema + panel | Mevcut avatar sürüm dizesinin deposu. |
| `pano.ui.view.themes.editMenu(async handler)` | yalnızca panel | Temalar-sayfası bağlam menüsü öğelerini düzenle. Asenkron; işleyici mevcut öğeleri alır ve diziyi **döndürmelidir**. |
| `pano.ui.posts.editMenu(async handler)` | yalnızca panel | Gönderiler bağlam menüsü öğelerini düzenle. Asenkron; diziyi **döndürmelidir**. |

İki `editMenu` çağrısı için, bir menü öğesinin tam alanları burada listelenmemiştir — birini eklemeden veya değiştirmeden önce her öğenin şeklini görmek için işleyicinizin aldığı diziyi `console.log`'layın.

## 9. `@panomc/sdk` modül dışa aktarımları

Bu, dondurulmuş **`@panomc/sdk`** içe aktarma yüzeyidir — her belirteç kararlı bir host çalışma zamanı modülüne eşlenir. Bu tam yollardan içe aktarın ve bu paketlerin içinde asla derin içe aktarma yapmayın (örn. `@panomc/sdk/utils/api-internals` çözülmez). (Svelte'in kendi belirteçleri ve paketlediğiniz herhangi bir npm paketi de çözülür — tam içe aktarma resmi için §10'a bakın.)

| Belirteç | Dışa aktarımlar |
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

`viewComponent` iki kez görünür — `@panomc/sdk`'da ve `@panomc/sdk/utils/component`'te. **Aynı fonksiyondur**; her ikisinden de içe aktarın (`@panomc/sdk` olağan yoldur).

Adları açıklayıcı olmayan dışa aktarımlar:

- `_` — çeviri fonksiyonu/deposu: bir bileşende `$_('some.key')`. [Çeviriler](/tr/addon/localization/)'e bakın.
- `languageLoading`, `currentLanguage` — mevcut i18n durumu için depolar.
- `tooltip` — bir Svelte action'ı: onu bir öğede `use:tooltip` ile ekleyin.
- `copy` — bir dizeyi panoya kopyalar.
- `hasPermission(permission, user)` — `user`, `permission`'a sahipse `true` döndürür; arayüzü göster/gizle için kullanın (§4'e bakın).
- `showToast` / `limitTitle` — bir toast bildirimi aç / birinin için uzun bir başlık dizesini kısalt (aşağıdaki `showToast` imzasına bakın).
- `NoContent` — bir "boş durum" yer tutucu bileşeni.
- `PageLoading` / `PageLoader` — yükleme-durumu arayüzü (iki varyant; durumunuza hangisinin uyduğunu görmek için her birini deneyin).
- `PlayerHead` — bir Minecraft oyuncusunun kafa resmini render eder.

::: tip Aslında hangi `@panomc/sdk/variables`'a ihtiyacınız var
Günlük kullanım: `API_URL`, `UI_URL`, `PANEL_URL` (ve bir ön-yayın derlemesini algılamak için `PRERELEASE`). Geri kalanı — `CSRF_TOKEN_COOKIE_NAME`, `JWT_COOKIE_NAME`, `CSRF_HEADER`, `COOKIE_PREFIX`, `update*Url` ayarlayıcıları — `ApiUtil`'in sizin için zaten işlediği kimlik-doğrulama/güvenlik altyapısıdır; onlara nadiren dokunursunuz.
:::

::: tip `@panomc/sdk/svelte` = SvelteKit'in kendi API'leri
Bunlar SvelteKit'in dışa aktarımlarını yansıtır — `page`, `navigating`, `browser` (`$app/state` / `$app/environment`'tan), `base` (`$app/paths`'ten), `goto`, `invalidate`, `invalidateAll` (`$app/navigation`'dan) ve `error`, `redirect` (`@sveltejs/kit`'ten). Her birinin nasıl davrandığı için SvelteKit dokümanlarına bakın. Onları host çalışma zamanına çözülsünler diye `$app/...`'tan değil, `@panomc/sdk/svelte`'ten içe aktarın.
:::

::: warning `Button`, `Card` veya `Input` yok
`@panomc/sdk/components/panel` ve `.../theme` tam olarak yukarıda listelenen bileşenleri dışa aktarır. Genel bir `Button`/`Card`/`Input` yoktur — bazı eski örnekler asla var olmayan bileşenlere atıfta bulundu; yukarıdaki liste yetkilidir. Basit kontrolleri düz işaretlemeyle inşa edin veya listelenen bileşenleri yeniden kullanın.
:::

**`ApiUtil` metot imzaları** (hepsi `async`, hepsi tek bir seçenekler nesnesi alır):

| Metot | Seçenekler |
|---|---|
| `ApiUtil.get(...)` | `{ path, request, csrfToken, token, blob, handler }` |
| `ApiUtil.post(...)` | `{ path, request, body, headers, csrfToken, token, blob, handler, onUploadProgress }` |
| `ApiUtil.put(...)` | `{ path, request, body, headers, csrfToken, token, blob, handler, onUploadProgress }` |
| `ApiUtil.delete(...)` | `{ path, request, headers, csrfToken, token, blob, handler }` |
| `ApiUtil.customRequest(...)` | `{ path, data, request, csrfToken, token, blob, handler, onUploadProgress }` |

**Her seçeneğin ne anlama geldiği** (her seçenek her metotta görünmez — yukarıdaki imza tablosunu kullanın):

| Seçenek | Anlamı |
|---|---|
| `path` | API yolu, **`/api/v1`'e göreli**, `/` ile başlar — `'/posts'` `/api/v1/posts`'u çağırır. `/api` ile başlayan yol geliştirmede reddedilir. Kendi eklentinizin uç noktaları için `api` kullanın (bkz. §11); eklenti önekini sizin yerinize ekler. |
| `request` | `load(event)` argümanı. İsteğin CSRF jetonuna sahip olması ve SSR sırasında çalışması için bir `load()`'un içinden çağırdığınızda onu her zaman geçirin (örnekten sonraki nota bakın). |
| `body` | İstek yükü (bir nesne, JSON olarak gönderilir; veya dosya yüklemeleri için bir `FormData`). Yalnızca POST/PUT. |
| `headers` | Ekstra istek başlıkları. POST/PUT/DELETE. |
| `csrfToken` | CSRF jetonu. Normalde onu atlarsınız — yardımcı onu `request` aracılığıyla oturumdan okur. |
| `token` | Bir bearer jeton; ayarlandığında `Authorization: Bearer <token>` olarak gönderilir. Normal giriş yapmış çağrılar için atlayın — çerezler kimlik doğrulamayı halleder. |
| `blob` | Yanıt bir dosya/ikili olduğunda `true` ayarlayın, böylece JSON olarak ayrıştırılmak yerine bir Blob olarak okunur. |
| `handler` | İsteğe bağlı `(data, reject) => data` geri çağrısı; ayrıştırılmış yanıtı size döndürülmeden önce son-işler. |
| `onUploadProgress` | Yükleme-ilerleme geri çağrısı (POST/PUT/customRequest) — bir ilerleme çubuğunu sürmek için kullanın. |
| `data` | (yalnızca customRequest) ham fetch seçenekleri — `method`, `body`, `headers`. `get`/`post`/vb. yardımcıları bunu sizin için inşa eder. |

Sayfa yüklemesi sırasında minimal bir GET — `path`'e (`/api`'ye göreli) ve konumundaki `request: event`'e dikkat edin:

```js
import ApiUtil from '@panomc/sdk/utils/api';

export async function load(event) {
  // pass request: event so the call works during SSR (the first page view)
  const response = await ApiUtil.get({ path: '/posts', request: event });
  return { response }; // this object becomes your page component's props
}
```

Bunları bir `load()` içinde çağırdığınızda her zaman `request: event`'i geçirin. Unutursanız, çağrı CSRF jetonunu alamaz veya SSR sırasında sunucunun fetch'ini yeniden kullanamaz — başarısız olabilir veya sayfa yüklendikten sonra tarayıcıda sessizce yeniden çalışabilir. O son durum kafa karıştırıcı olanıdır: sitede tıklarken çalışıyor gibi görünür, ama taze bir sayfa yüklemesinde veya sert bir yenilemede bozulur.

**`showToast` imzası:** `showToast(text, params = {}, toastComponent)`.

| Argüman | Anlamı |
|---|---|
| `text` | Mesaj. Bir çeviri anahtarıysa (bir `.` içerir) çevrilir; aksi halde olduğu gibi gösterilir. |
| `params` | Varsayılan toast ile, bunlar `text`'e enterpole edilen çeviri **değerleri** olur. Özel bir `toastComponent` ile, o bileşene props olarak geçirilir. İsteğe bağlı (varsayılan `{}`). |
| `toastComponent` | Varsayılan toast yerine render edilecek isteğe bağlı özel Svelte bileşeni. |

## 10. Neyi içe aktarabilirsiniz

::: warning Yalnızca dondurulmuş liste host çalışma zamanına çözülür
Derlemeniz bu içe aktarmaları kasten eklentinizin JS'ine **paketlemez** — onları **harici** bırakır ve host onları çalışma zamanında sağlar, böylece her eklenti tek bir Svelte örneği paylaşır. Listenin dışındaki herhangi bir şeyi içe aktarın ve çalışma zamanında çözülmez.
:::

İzin verilen çıplak belirteçler tam olarak şunlardır:

- §9 tablosundaki her `@panomc/sdk` belirteci.
- Svelte: `svelte`, `svelte/store`, `svelte/transition`, `svelte/easing`, `svelte/motion`, `svelte/animate`, `svelte/legacy`, `svelte/events`, `svelte/attachments`, `svelte/reactivity`, `svelte/reactivity/window` ve `svelte-i18n`.
- **Sabit** bir Svelte iç öğesi kümesi *(ileri düzey — derleyici bu içe aktarmaları sizin için derlenen kodunuza yayar; onları asla elle yazmazsınız)*: `svelte/internal`, `svelte/internal/client`, `svelte/internal/disclose-version`, `svelte/internal/flags/legacy`, `svelte/internal/flags/async` ve `svelte/internal/flags/tracing`. Bu tam bir listedir, bir `svelte/internal/*` joker karakteri **değil**; başka herhangi bir `svelte/internal/...` alt yolu çözülmez.

Başka her şey — `chart.js`, `svelte-select`, başka herhangi bir npm paketi — rollup derlemeniz tarafından çıplak içe aktarılmak yerine **eklentinize paketlenmelidir**. Bunun için özel bir şey yapmazsınız: boilerplate'in rollup derlemesi `bun add` ile eklediğiniz ve sonra normal şekilde `import` ettiğiniz her şeyi zaten paketler. (Market eklentisi Chart.js'i göndermek için tam olarak bunu yapar.)

::: warning `package.json`'ınıza asla `svelte` eklemeyin
SDK, herkesin hangi Svelte sürümüyle derlediğini kontrol eder (sürümü sabitlenmiştir) ve derleme bir uyumsuzlukta **başarısız olur**. `package.json`'ınızdaki ikinci bir `svelte` kopyası sayfalarınızı sessizce bozar (iki kopya hydration sırasında anlaşmazlığa düşer). [Mimari](/tr/addon/architecture/)'ye bakın.
:::

## 11. Eklentinizin API'si arayüzden

### Göreli uç nokta yolları {#relative-endpoint-paths}

Bir Kotlin uç noktası yolunu **kapsamına göre göreli** bildirir ve Pano öneki ekler:

| Sınıf | Bildirilen | Sunulduğu yer |
|---|---|---|
| `Api`, `LoggedInApi` | `Path("/hello", GET)` | `/api/plugins/<pluginId>/hello` |
| `PanelApi` | `Path("/hello", GET)` | `/api/plugins/<pluginId>/panel/hello` |
| çekirdek (sizin değil) | `/posts` | `/api/v1/posts` |

Bildirilen bir yolun `/api` veya `/panel` ile başlaması, boş olması ya da parametreyle veya `_` ile başlaması (`/:id`) eklentinizi sınıfı ve çözümü adlandıran bir iletiyle başlangıçta durdurur. Her yanıt `Pano-Api-Level` başlığını taşır.

### `api.get` ve diğerleri

Eklenti kapsamlı istemciyi import edin. Eklenti kimliği kodunuzda hiç geçmez; derleme ekler:

```js
import { api } from '@panomc/sdk/plugin-api';          // main.js, bileşenler ve load()

const body = await api.get({ path: '/hello', request: event });   // site
await api.post({ path: '/shouts', body: { message } });
await api.panel.get({ path: '/hello' });                          // PanelApi uç noktaları
```

`api` içinde `get`, `post`, `put`, `delete` ve `customRequest` vardır (`ApiUtil` ile aynı seçenekler, bölüm 9); `api.panel` altında da aynı küme bulunur. Bir tema ya da başka bir eklenti, ait olmadığı bir eklentiyi `@panomc/sdk/utils/api` içindeki `createPluginApi('pano-plugin-market')` ile çağırır; tam eklenti kimliği gerekir. Hatalar fırlatılmaz; aşağıdaki hata gövdesine çözülür.

### Hata kodları {#error-codes}

Başarısız her çağrı tek bir biçimdedir; artık `result` anahtarı yoktur:

```json
{ "error": { "code": "EMPTY_CART", "message": "isteğe bağlı İngilizce metin",
             "details": { "any": "extra" }, "fields": { "email": "EXISTS" } } }
```

`code` her zaman vardır; `message`, `details` ve `fields` yalnızca boş değilse. `res.error?.code` okuyun, `res.error`'ı asla bir dizeyle karşılaştırmayın. Ağ hatası `{ error: { code: "NETWORK_ERROR" } }` olarak çözülür. Kotlin'de kod sizin bildirdiğiniz bir sabittir; bu yüzden sınıfı yeniden adlandırmak istemciyi bozamaz:

```kotlin
class EmptyCart : Error("EMPTY_CART", 400)     // kod: ^[A-Z][A-Z0-9_]*$, sonra HTTP durumu
throw EmptyCart()
```

Eklenti kodlarına önek eklenmez ve eklenti içinde benzersiz olmalıdır. Başarı gövdesi tam olarak döndürdüğünüz haritadır ve üst düzey bir `error` ya da `result` anahtarı içeremez.

### Sayfalar {#pages}

Her liste uç noktası aynı biçimde yanıt verir. İstek `page` (1 tabanlı, varsayılan 1) ve `pageSize` (uç noktaya göre varsayılan, en çok 100) alır; aralık dışı değer `INVALID_FIELDS` ile, son sayfadan sonrası `PAGE_NOT_FOUND` ile reddedilir:

```json
{ "items": [ ... ], "page": { "number": 2, "size": 20, "totalItems": 57, "totalPages": 3 } }
```

Diğer üst düzey anahtarlara (`category`, `filters`) izin verilir. Kotlin yardımcıları `com.panomc.platform.model` içindeki `PageRequest` ve `Paging`'dir.

### Bağlantı hedefleri ve yedek sayfalar {#link-targets-and-fallback-pages}

Eklentinizin dışarı gönderdiği bir bağlantı (e-posta, ödeme dönüşü) bir yol değil, bir **hedeftir**; böylece temanın rota yeniden adlandırmalarını izler. Hedefleri `src/main/resources/frontend-targets.json` içinde bildirin; kimliklerin başına ad alanınız eklenir:

```json
{ "store": "/store", "product": "/store/{slug}", "order": { "path": "/store/order/{id}", "fallback": true } }
```

Kotlin'de: `frontendUrlMap.url("market.order", mapOf("id" to publicId))`. URL şu sırayla çözülür: yöneticinin override'ı, etkin ön yüzün kendi haritası, varsayılan yolunuza uygulanan temanın rota yapılandırması ve son olarak hedefi `fallback: true` işaretlediyseniz `/_pano/<target>`. `null` "böyle bir sayfa yok" demektir: bağlantıyı atlayın. `fallback: true` bir hedef, bir ön yüz sahiplenene kadar düz yerleşik bir sayfa çizen bir Kotlin `FallbackPage` bean'i ister (`FallbackPage(target, template)` sınıfını genişletir, `@FallbackPageDefinition` ile işaretlenir). `bunx pano-plugin check`, eklentinin hiçbir sayfasıyla eşleşmeyen varsayılan yol için uyarır.

### Webhook'lar

Çekirdek ve eklentiler olayları yöneticinin webhook uç noktalarına tek bir enjekte edilebilir bean ile yayınlar, `WebhookPublisher`:

```kotlin
if (webhooks.hasListeners(plugin, "order.paid", conn)) {
    webhooks.publish(plugin, "order.paid", subjectKey = orderId.toString(), data = data, sqlClient = conn)
}
```

`event` kaynak olmadan verilir; Pano ad alanınızı başa ekler (`market.order.paid`) ve bir eklenti `core.*` yayınlayamaz. Çağıranın `sqlClient`'ını vermek teslimatı aynı işlemde yazar. İsteğe bağlı `register(plugin, listOf(WebhookEventType("order.paid", sample)))` panel kataloğunu doldurur. Alıcılar `{ id, event, source, createdAt, apiVersion, site, data }` biçiminde imzalı bir JSON zarfı ve `X-Pano-Event`, `X-Pano-Event-Id`, `X-Pano-Delivery`, `X-Pano-Attempt` ile `X-Pano-Signature: t=<unix s>,v1=<hex HMAC-SHA256(secret, "<t>.<body>")>` başlıklarını alır. Başarısız teslimatlar artan gecikmeyle yeniden denenir (varsayılan 8 deneme). Çekirdek olayları: `core.user.registered`, `core.user.deleted`, `core.ticket.created`, `core.ticket.replied`, `core.post.published`.

## Bilinen ölü yüzeyler (kullanmayın)

Tamlık için, yüzeyde var olan ama hiçbir şey yapmayan iki üye — onların üzerine inşa etmeyin:

- `pano.debug` — `pano` nesnesindeki bir boolean bayrak. Şu anda `false` olarak sabit kodlanmıştır ve hiçbir host onu ayarlamaz, bu yüzden onu bir geliştirme derlemesini algılamak için **kullanmayın**.
- `onContextUpdate()` — hiçbir host'un asla çağırmadığı eski bir boilerplate metodu (§1'e bakın).

## Sonraki adım

- **[Frontend Geliştirme](/tr/addon/frontend/)** — bu API'leri çalışmaya koyan Shoutbox adım adım kılavuzu.
- **[Çeviriler](/tr/addon/localization/)** — `_` deposu ve dil dosyalarınız nasıl bir araya gelir.
- **[Sayfa Tasarımlarını Değiştirme](/tr/theme/views/)** — tema tarafı view/kanca modeli, tema da inşa ediyorsanız.
