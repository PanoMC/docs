# Frontend Geliştirme

**Bu sayfa size ne verir:** her eklenti frontend'inin paylaştığı tek giriş noktası — `src/main.js` — artı arayüzün kendisini oluşturan iki konu sayfasına bir harita.

Eklentinizin iki yarımı vardır: bir Kotlin [backend](/tr/addon/backend/) ve bir **Svelte** frontend (kullanıcıların gördüğü ve tıkladığı görsel kısım). Eklentinizi derlediğinizde, derlenmiş Kotlin backend'i ve derlenmiş Svelte dosyalarınız tek bir `.jar` dosyasına birlikte ziplenir — o dosyanın tamamı eklentinizin *kendisidir*. Bunun için özel bir şey yapmazsınız; derleme halleder.

Pano iki ayrı web sitesi çalıştırır: **tema** (ziyaretçilerin `siteniz.com`'da gördüğü) ve **panel** (`siteniz.com/panel`'deki yönetici panosu). Tek eklentiniz her ikisine de arayüz ekler. Tek bir dosya — `src/main.js` — her ikisi için de giriş noktasıdır.

Bu sayfalar boyunca kullanacağımız örnek **Shoutbox**'tır: ana sayfanın üstünde son "shout"lardan oluşan küçük bir bileşen, artı yöneticilerin onları yönettiği bir panel. Bu sayfa `main.js`'i bağlar; iki konu sayfası — [Tema Arayüzü](/tr/addon/theme-ui/) ve [Panel Arayüzü](/tr/addon/panel-ui/) — gerçek ekranları oluşturur ([Sonraki adım](#sonraki-adım)'a bakın).

> Bir yapay zeka asistanı veya eski bir eğitim size bu sayfalarda veya [Arayüz API Referansı](/tr/addon/api-reference/)'nda olmayan bir API verirse, o var değildir. Yaygın sahte veya kaldırılmış çağrılar bu [sayfanın altında](#var-olmayan-ai-tarafından-uydurulan-apiler) listelenmiştir.

::: tip Svelte'te yeni misiniz?
Eklenti arayüzleri, Pano temalarıyla aynı şekilde Svelte'te yazılır. Onu hiç kullanmadıysanız, etkileşimli [Svelte eğitimi](https://svelte.dev/tutorial) bir eklenti arayüzünün ihtiyaç duyduğu her şeyi kapsar.
:::

::: tip Başlamadan önce
Eklentinizi **pano-boilerplate-plugin** şablonundan iskele olarak oluşturmuş ve [Backend Geliştirme](/tr/addon/backend/)'yi tamamlamış olmalısınız. `src/main.js` dosyası boilerplate'te zaten var — onu oluşturmayacak, *düzenleyeceksiniz*. Dev döngüsünü `bun run dev` ile başlatın ve tüm süre boyunca çalışır bırakın; bu sayfalardaki her değişiklik sıcak yeniden yüklenir, böylece onu hemen görebilirsiniz. (Bitmiş eklentiyi bir yayına dönüştürmek [Derleme ve Yayınlama](/tr/addon/publishing/)'da kapsanır.)
:::

## View'lar: sayfa veya widget başına bir dosya

Bir eklentinin site arayüzü **adlandırılmış view'lardan** oluşur. Bir view, `src/theme/views/` altındaki bir `.svelte` dosyasıdır. Adı dosya adıdır, kimliği `<ns>:<Name>`'dir (`ns`, eklenti kimliğinden `pano-plugin-` çıkarılmış hâlidir; yani `shoutbox:ShoutboxWidget`). View ile ilgili her şey o dosyadadır: kayıt kodu yoktur ve `main.js`'e hiçbir şey eklenmez.

```svelte
<!-- src/theme/views/ShoutboxPage.svelte  ->  view "shoutbox:ShoutboxPage", /shoutbox -->
<script module>
  import { api } from '@panomc/sdk/plugin-api';

  export const view = { path: '/shoutbox' };

  export async function load(event) {
    const res = await api.get({ path: '/shouts', request: event });
    return { shouts: res.items ?? [] };
  }
</script>

<script>
  let { shouts = [] } = $props();
</script>

{#each shouts as shout}<p>{shout.message}</p>{/each}
```

`export const view` yalnızca sabit değerler taşır (okunur, çalıştırılmaz). Anahtarlar:

| Anahtar | Anlamı |
|---|---|
| `path` (artı `layout`, `permission`, `loginRequired`) | view bir sayfadır |
| `slot`, `hook`, `sidebar`, `priority` | view kendini bir slota, hook'a veya kenar çubuğuna bağlar |
| `block` | temanın `<PluginBlock id="shoutbox:Latest" />` ile yerleştirmesi için yapılmış |
| `home: { label }` | bu sayfayı yöneticiye ana sayfa seçeneği olarak sun |
| `widget` | her web sayfası için bir web bileşeni de üret (`<pano-shoutbox-latest>`) |
| `controller` | sayfanın `load`'u bu controller'dan gelir |
| `contract` | bir tema override'ının yazıldığı tamsayı sürüm (varsayılan `1`) |

Derlemenin zorunlu kıldığı kurallar (her biri dosya, satır ve çözümle): bir view yalnızca `svelte*`, `svelte-i18n`, `@panomc/sdk*`, diğer view'ları ve yardımcıları import eder; `setContext` veya `getContext` çağırmaz; yinelenen dosya adı olmaz; kendi ad alanınızın dışında slot kimliği olmaz.

**Stil.** Bir eklentinin varsayılan view'ları vanilla görünümüyle çizilir ve vanilla hiçbirini ezmez; görünümünüz kendi view'larınızda durur. Anlamlı sınıflara yazın (`shoutbox-latest__title`), gerekirse bir `<style>` bloğu kullanın. `style-block-scope` kuralı, her seçici `shoutbox-...` sınıfıyla başlamıyorsa, `:global` varsa ya da keyframes ve özel özellikler `shoutbox-...` diye adlanmamışsa derlemeyi durdurur. Tema değerlerini `var(--pano-*)` ile okuyun. Diğer temalar view'larınızı kendi yollarıyla yeniden biçimlendirir.

**Yalnızca SDK 2.** `panoSdk 2` olmadan derlenen eklenti atlanır. `view` olmadan `component` ile kaydedilen öğe hata verilerek düşürülür; dosyada `export const view` veya `view: 'shoutbox:Ad'` kullanın.

**Yardımcılar.** View'ların yanındaki herhangi bir `.js` dosyası olağan biçimde import edilir, okunabilir kaynak olarak gönderilir ve bir tema view'ı yeniden çizerken onunla gider.

**Controller'lar.** Markup olmayan mantık (sepet, biçimleyici), `@panomc/plugin-kit/controller` içinden çerçevesiz bir `defineController({ name, version, state, actions })` olarak `src/theme/controllers/<name>.js` içine yazılır. Derlenmiş ve kapalı gönderilir. View'lar, tema sayfaları, widget'lar ve Svelte olmayan ön yüzler aynısını kullanır: `@panomc/sdk/controllers` içinden `plugin('shoutbox').require('counter')`. Bir state veya action anahtarını kaldırır ya da yeniden adlandırırsanız `version`'ı yükseltin; aksi halde derleme başarısız olur.

**Örnekler.** `bunx pano-plugin samples ShoutboxPage`, `ShoutboxPage.samples.js` yazar (boş, yükleniyor, dolu ve hata durumları). `/__pano/views` tema kataloğu bunları çizer, `bunx pano-plugin check` da kullanır.

**Widget'lar.** `view` içine `widget: true` ekleyin; derleme bir web bileşeni de üretir. Şöyle gömülür: `<script type="module" src="https://your-pano/api/v1/widgets/loader.js"></script>` ve `<pano-shoutbox-latest></pano-shoutbox-latest>`. Aynı view bir temada ve başka bir sitede çalışır; verisi yine kendi `load`'undan gelir.

**Sözleşme.** Bir tema view'ınızı yeniden çizebilir (`theme-core eject-view shoutbox:ShoutboxPage`). Derleme `pano-plugin.lock.json` yazar (commit'leyin) ve `contract`'ı yükseltmeden bir prop kaldırırsanız değiştirilecek satırla başarısız olur.

View olmayan her şey (panel sayfaları, panel hook'ları, yaşam döngüsü işleyicileri) aşağıda anlatıldığı gibi hâlâ `src/main.js` içinde kaydedilir.

## Eklentinizin dosyaları

İşte bu sayfaların atıfta bulunduğu düzen. `theme/` ve `panel/` klasörleri yalnızca ziyaretçi bileşenleri ile yönetici bileşenlerini ayrı tutmak için düzenli bir gelenektir — Pano adları zorlamaz, dosyaları istediğiniz gibi düzenleyebilirsiniz.

```text
src/
├─ main.js                    ← entry point; Pano loads this first
├─ theme/                     ← components shown to visitors (the public site)
│   └─ ShoutboxWidget.svelte
└─ panel/                     ← components shown to admins (the dashboard)
    ├─ ShoutboxSettings.svelte
    └─ ShoutboxPage.svelte
```

## Giriş noktası: `src/main.js`

Her şey `main.js`'te başlar. `PanoPlugin`'i genişleten varsayılan bir sınıf dışa aktarır. Pano sınıfınızın bir örneğini oluşturur, üzerine sizin için `this.pano`'yu ayarlar (onu asla kendiniz ayarlamazsınız), sonra `onLoad()` metodunuzu çağırır.

`onLoad()`'ı **iki kez** çağırır — bir kez panelde ve bir kez temada. Tema ve panel iki ayrı çalışan programdır ve her biri eklentinizi bağımsız olarak yükler, bu yüzden `onLoad()` gerçekten iki kez, her birinde bir kez, çalışır. Bu normaldir, bir hata değildir. `pano.isPanel` kontrolü, her tarafa farklı arayüz vermenizin yoludur: panelde `true`, temada `false`'tur.

İşte tüm eklentinin üzerine inşa edildiği iskelet. İçindeki bir satır — `export const _ = ...` — korkutucu görünüyor; şimdilik olduğu gibi kopyalayın, o aşağıdaki [Metni çevirme](#bilesenlerinizde-metni-cevirme) bölümünde tam olarak açıklanan bir çeviri yardımcısıdır ve iskeleti kullanmak için onu anlamanıza gerek yok.

```js
// src/main.js
import { PanoPlugin, viewComponent } from '@panomc/sdk';
import { api } from '@panomc/sdk/plugin-api';
import { derived } from 'svelte/store';
import { _ as i18n } from '@panomc/sdk/utils/language';

export const pluginId = 'pano-plugin-shoutbox';

// A translate function scoped to your addon's keys — see the i18n section below.
export const _ = derived(i18n, ($t) => (key, options) => $t(`plugins.${pluginId}.${key}`, options));

export default class ShoutboxUiPlugin extends PanoPlugin {
  onLoad() {
    const { pano } = this;

    if (pano.isPanel) {
      // panel registrations go here
    } else {
      // theme registrations go here
    }
  }

  onUnload() {}
}
```

Önemli olan birkaç kural, hepsine yerleşik eklentiler ([PanoMC GitHub org](https://github.com/PanoMC)'daki çalışan referans eklentileri) uyar:

- **Sınıf `default` dışa aktarım olmalıdır.** Pano tam olarak bir tane arar.
- **`this.pano` tüm API'nizdir.** Pano onu `onLoad()` çalışmadan önce sizin için ayarlar — `onLoad()` içinde yalnızca `pano.isPanel`'i okur ve `pano.ui.*`'ı kullanırsınız.
- **`pluginId`, eklentinizin ID'siyle tam olarak eşleşmelidir** — [Backend Geliştirme](/tr/addon/backend/)'den / plugin manifestonuzdan. Çeviriler ve panel detay-sayfası kancası ona göre anahtarlanır, bu yüzden bir uyumsuzluk onları sessizce bozar.
- **Her bileşeni `viewComponent(() => import('./File.svelte'))` içine sarın.** Bu isteğe bağlı değildir. Bir `register` çağrısına verdiğiniz her bileşen — kancalar, sayfalar, view slotları — bu şekilde sarılmalıdır. Sade sözlerle: bu, Pano'ya dosyanın kendisi yerine dosyanızı yüklemek için bir *tarif* verir, böylece Pano onu sayfanın kendi Svelte kopyasıyla doğru anda yükleyebilir. Ayrıntılara ihtiyacınız yok — meraklıysanız [Mimari](/tr/addon/architecture/)'ye bakın.
- **Paylaşılan durumu `main.js`'te tutun.** `main.js`'in üst düzeyinde bildirdiğiniz değişkenler (yukarıdaki `_` deposu gibi) tam olarak bir kez var olur ve tüm bileşenleriniz tarafından paylaşılır. Derleme bunu yalnızca `main.js` için garanti eder, bu yüzden paylaşılan durum için başka dosyalara güvenmeyin. (Mekaniği [Mimari](/tr/addon/architecture/)'dedir.)
- **`onUnload()` eklentiniz devre dışı bırakıldığında çalışır.** Şimdilik boş bırakın; çoğu eklentinin ona hiç ihtiyacı olmaz.

::: warning `package.json`'da asla `svelte` bildirmeyin
Paketiniz Svelte, `svelte-i18n` veya `@panomc/sdk` **göndermez** — host bunları sağlar, böylece tüm sayfa tek bir Svelte örneği paylaşır. Derlemeniz siz (veya `bun add` ile kurduğunuz bir kütüphane) `package.json`'a `svelte` ekledikten hemen sonra başarısız olmaya başlarsa, neden budur: `svelte`'i `package.json`'dan kaldırın. Sade sözlerle, sayfa yalnızca bir Svelte kopyası çalıştırabilir ve host onu zaten sağlar; kendinizinkini eklemek ikinci bir kopyayı sabitler ve **hydration**'ı (sunucu-render'lı HTML'in tarayıcıda etkileşimli hale gelmek için bağlandığı adım) bozar. Nedenini [Mimari](/tr/addon/architecture/)'de görün.
:::

::: tip İlerlemenizi kontrol edin
Bu iskelet tek başına ekranda henüz hiçbir şey çizmez — yalnızca eklentinizi kurar. `bun run dev` çalışırken, hem `siteniz.com`'u (tema) hem de `siteniz.com/panel`'i (panel) yeniden yükleyin ve tarayıcı konsolunu açın (F12). Eklentinizden **kırmızı hata görmemelisiniz**. Eksik bir `default` dışa aktarımı veya kötü bir `pluginId` hakkında bir tane görürseniz, daha ileri gitmeden önce onu düzeltin — aşağıdaki her şey bu çalışan iskeletin üzerine yığılır.
:::

Şimdi iki dalı doldurun. Her birine ne gireceğinin kendi sayfası var: `else` (tema) dalı için **[Tema Arayüzü](/tr/addon/theme-ui/)**, `if (pano.isPanel)` dalı için **[Panel Arayüzü](/tr/addon/panel-ui/)**. Bu sayfanın geri kalanı her iki dalın da kullandığı iki şeyi kapsar.

## Bileşenlerinizde metni çevirme

Tema geliştirmenin aksine, **eklenti bileşenlerinize otomatik olarak bir çeviri yardımcısı enjekte edilmez** — `_`'yi kendi `main.js`'inizden içe aktarmalısınız. O `_`, iskeletten korkutucu satırdır:

```js
export const _ = derived(i18n, ($t) => (key, options) => $t(`plugins.${pluginId}.${key}`, options));
```

İşte tüm yaptığı: Pano'nun çeviri fonksiyonunu saran bir Svelte `derived` **deposudur** (kaynağı değiştiğinde yeniden hesaplayan bir değer) ve geçtiğiniz her anahtarın önüne otomatik olarak `plugins.<pluginId>.` ekler. Yani bir bileşende `$_('widget.title')` yazarsınız ve o `plugins.pano-plugin-shoutbox.widget.title`'ı arar. Onu kullanmak için içeride nasıl inşa edildiğini anlamanıza gerek yok — yalnızca içe aktarın ve `$` önekiyle okuyun:

```svelte
<script>
  import { _ } from '../main.js';
</script>

<h2>{$_('widget.title')}</h2>
```

`{$_('widget.title')}` dil dosyalarınızdaki `plugins.pano-plugin-shoutbox.widget.title` anahtarına çözümlenir. O anahtarların nerede yaşadığı ve nasıl ad-alanlandığı için [Çeviriler](/tr/addon/localization/)'e bakın.

::: tip İlerlemenizi kontrol edin
O anahtarı [Çeviriler](/tr/addon/localization/)'de gerçekten ekleyene kadar, ekran güzel bir etiket yerine ham anahtar dizesini (`plugins.pano-plugin-shoutbox.widget.title`) gösterir. Bu, bu aşamada beklenendir — yardımcının doğru bağlandığının ve yalnızca dil dosyasını beklediğinin işaretidir.
:::

## Var olmayan, AI tarafından uydurulan API'ler

Bir AI aracı, eski bir eğitim veya iskele bunlardan herhangi birini önerirse, onu görmezden gelin — hiçbiri var değil. Yalnızca bu sayfalarda ve [Arayüz API Referansı](/tr/addon/api-reference/)'nda olanı kullanın.

- **`pano.ui.page.register({ name, view, scopes })`** — gerçek `page.register`, `{ path, component, permission, ... }` alır (bkz. [Panel Arayüzü](/tr/addon/panel-ui/)). `name`/`view`/`scopes` biçimi yoktur.
- **`import { Button, Card } from '@panomc/sdk/components/panel'`** — SDK'da böyle bir bileşen kütüphanesi yoktur.
- **`onContextUpdate`** — eski boilerplate bu metodu tanımlar, ama **hiçbir host onu çağırmaz**. İskele oluşturulan `main.js`'iniz `onContextUpdate` içeriyorsa, onu silin.
- **Düz bir dizeyle `api.get('/shouts')`** ya da `/api` ile başlayan bir yol — her çağrı, göreli bir yol içeren bir seçenekler nesnesi alır, örn. `api.get({ path: '/shouts' })`.
- **`pano.utils.toast`** — böyle bir şey yoktur; toast'lar yalnızca `@panomc/sdk/toasts`'tan gelir.

## Sonraki adım

`main.js` kuruldu. Şimdi arayüzü oluşturun:

- **Sitede bir şeyler gösterin → [Tema Arayüzü](/tr/addon/theme-ui/)** — tema kancaları, ana sayfa bileşeni, sunucu-render'lı veri ve API'nizi çağırma.
- **Yönetici ekranları ekleyin → [Panel Arayüzü](/tr/addon/panel-ui/)** — ayarlar bölümleri, gezinme bağlantılı tam panel sayfaları ve toast'lar.
- **Tam arama → [Arayüz API Referansı](/tr/addon/api-reference/)** — her kanca adı, view slotu, yaşam döngüsü olayı ve `@panomc/sdk` dışa aktarımı tek yerde.
- **[Çeviriler](/tr/addon/localization/)** — `plugins.<pluginId>.<key>` dizelerinizin nerede yaşadığı ve panelin yöneticilerin bunları geçersiz kılmasına nasıl izin verdiği.
- **[Backend Geliştirme](/tr/addon/backend/)** — bu sayfaların çağırdığı endpoint'lerin ve izinlerin Kotlin tarafı.
- **[Derleme ve Yayınlama](/tr/addon/publishing/)** — bitmiş eklentiyi bir yayın jar'ına dönüştürün. Bir yayın derlemesi arayüzü içermek **zorundadır**, bu yüzden onun için asla `-Pnoui` kullanmayın (`-Pnoui`, yalnızca-backend yinelemesi sırasında arayüz derlemesini atlayan Gradle bayrağıdır — bkz. Derleme ve Yayınlama).
- **Referans eklentiler** — [PanoMC GitHub org](https://github.com/PanoMC)'daki yerleşik eklentiler, bu sayfalardaki her desen için çalışan referanstır.
