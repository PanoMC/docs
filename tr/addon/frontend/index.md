# Arayüz Geliştirme

**Bu sayfa size ne verir:** sona geldiğinizde, adım adım, her adımdan sonra işinizi kontrol ederek küçük bir örnek eklentinin tam arayüzünü oluşturmuş olacaksınız.

Eklentinizin iki yarısı vardır: bir Kotlin [backend'i](/tr/addon/backend/) ve bir **Svelte** arayüzü (kullanıcıların gördüğü ve tıkladığı görsel kısım). Eklentinizi derlediğinizde, derlenmiş Kotlin backend'i ve derlenmiş Svelte dosyalarınız tek bir `.jar` dosyasına birlikte zip'lenir — o dosyanın tamamı *eklentinizin kendisidir*. Bunun için özel bir şey yapmazsınız; derleme halleder.

Pano iki ayrı web sitesi çalıştırır: **tema** (ziyaretçilerin `yoursite.com`'da gördüğü) ve **panel** (`yoursite.com/panel`'deki yönetici panosu). Tek eklentiniz ikisine de arayüz ekler. Tek dosya — `src/main.js` — ikisi için de giriş noktasıdır.

Bu sayfa örneğimiz **Shoutbox**'ın arayüzünü oluşturur: ana sayfanın üstünde en son "shout"lardan oluşan küçük bir widget, artı yöneticilerin bunları yönettiği bir panel. Sona geldiğinizde şunları yapabilirsiniz:

- ana sayfaya bir bileşen yerleştirmek ve ona sunucu tarafında işlenmiş veri vermek,
- eklentinizin panel detay sayfasına bir ayarlar bölümü eklemek,
- kendi gezinme bağlantısına sahip tam bir panel sayfası kaydetmek,
- backend API'nizi çağırmak ve bir toast göstermek,
- bileşenlerinizin içindeki metni çevirmek.

> Bir YZ asistanı veya eski bir eğitim size bu sayfada ya da [Arayüz API Referansı](/tr/addon/api-reference/)'nda olmayan bir API verirse, o mevcut değildir. Yaygın sahte veya kaldırılmış çağrılar bu [sayfanın altında](#var-olmayan-eski-ve-yz-uydurması-api-ler) listelenmiştir.

::: tip Svelte'de yeni misiniz?
Eklenti arayüzleri Svelte ile yazılır, tıpkı Pano temaları gibi. Hiç kullanmadıysanız, etkileşimli [Svelte eğitimi](https://svelte.dev/tutorial) bir eklenti arayüzünün ihtiyaç duyduğu her şeyi kapsar.
:::

::: tip Başlamadan önce
Eklentinizi **pano-boilerplate-plugin** şablonundan iskeleletmiş ve [Backend Geliştirme](/tr/addon/backend/)'yi tamamlamış olmalısınız. `src/main.js` dosyası boilerplate'te zaten var — onu oluşturmayacak, *düzenleyeceksiniz*. Geliştirme döngüsünü `bun run dev` ile başlatın ve tüm süre boyunca çalışır bırakın; aşağıdaki her değişiklik sıcak yeniden yüklenir, böylece onu anında görebilirsiniz. (Bitmiş eklentiyi bir yayına dönüştürmek [Derleme ve Yayınlama](/tr/addon/publishing/)'da ele alınmıştır.)
:::

## Eklentinizin dosyaları

İşte bu sayfanın atıfta bulunduğu düzen. `theme/` ve `panel/` klasörleri, ziyaretçi bileşenlerini ve yönetici bileşenlerini ayrı tutmak için yalnızca düzenli bir gelenektir — Pano adları zorunlu kılmaz, dosyaları istediğiniz gibi düzenleyebilirsiniz.

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

Her şey `main.js`'te başlar. `PanoPlugin`'i genişleten bir varsayılan sınıf dışa aktarır. Pano sınıfınızın bir örneğini oluşturur, `this.pano`'yu sizin için ayarlar (onu asla kendiniz ayarlamazsınız), sonra `onLoad()` metodunuzu çağırır.

`onLoad()`'ı **iki kez** çağırır — bir kez panelde ve bir kez temada. Tema ve panel iki ayrı çalışan programdır ve her biri eklentinizi bağımsız olarak yükler, dolayısıyla `onLoad()` gerçekten iki kez çalışır, her birinde bir kez. Bu normaldir, bir hata değil. `pano.isPanel` kontrolü, her tarafa farklı arayüz vermenizin yoludur: panelde `true`, temada `false`'tur.

İşte tüm eklentinin üzerine inşa edildiği iskelet. İçindeki bir satır — `export const _ = ...` — korkutucu görünür; şimdilik olduğu gibi kopyalayın, o aşağıda [Metni çevirme](#bilesenlerinizdeki-metni-cevirme) bölümünde tam olarak açıklanan bir çeviri yardımcısıdır ve iskeleti kullanmak için onu anlamanıza gerek yoktur.

```js
// src/main.js
import { PanoPlugin, viewComponent } from '@panomc/sdk';
import ApiUtil from '@panomc/sdk/utils/api';
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

Önemli olan ve tüm yerleşik eklentilerin izlediği birkaç kural:

- **Sınıf, `default` dışa aktarma olmalı.** Pano tam olarak bir tane arar.
- **`this.pano` tüm API'nizdir.** Pano onu `onLoad()` çalışmadan önce sizin için ayarlar — `onLoad()` içinde yalnızca `pano.isPanel`'i okur ve `pano.ui.*`'ı kullanırsınız.
- **`pluginId`, [Backend Geliştirme](/tr/addon/backend/)'den / eklenti manifestonuzdan gelen eklenti ID'nizle tam olarak eşleşmeli.** Çeviriler ve panel detay-sayfası kancası ona göre anahtarlanır, dolayısıyla bir uyuşmazlık onları sessizce bozar.
- **Her bileşeni `viewComponent(() => import('./File.svelte'))` ile sarın.** Bu isteğe bağlı değildir. Bir `register` çağrısına verdiğiniz her bileşen — kancalar, sayfalar, görünüm yuvaları — bu şekilde sarılmalıdır. Düz ifadeyle: bu, Pano'ya dosyanın kendisi yerine dosyanızı yüklemek için bir *tarif* verir, böylece Pano onu doğru anda, sayfanın kendi Svelte kopyasıyla yükleyebilir. Ayrıntılara ihtiyacınız yok — meraklıysanız [Mimari](/tr/addon/architecture/)'ye bakın.
- **Paylaşılan durumu `main.js`'te tutun.** `main.js`'in en üst düzeyinde bildirdiğiniz değişkenler (yukarıdaki `_` deposu gibi) tam olarak bir kez var olur ve tüm bileşenleriniz tarafından paylaşılır. Derleme bunu yalnızca `main.js` için garanti eder, dolayısıyla paylaşılan durum için diğer dosyalara güvenmeyin. (Mekanizma [Mimari](/tr/addon/architecture/)'dedir.)
- **`onUnload()`, eklentiniz devre dışı bırakıldığında çalışır.** Şimdilik boş bırakın; çoğu eklenti asla buna ihtiyaç duymaz.

::: warning `svelte`'yi asla `package.json`'da bildirmeyin
Paketiniz Svelte, `svelte-i18n` veya `@panomc/sdk` **göndermez** — host onları sağlar, böylece tüm sayfa tek bir Svelte örneğini paylaşır. Siz (veya `bun add` ile kurduğunuz bir kütüphane) `package.json`'a `svelte` ekledikten hemen sonra derlemeniz başarısız olmaya başlarsa, neden budur: `svelte`'yi `package.json`'dan kaldırın. Düz ifadeyle, sayfa yalnızca tek bir Svelte kopyası çalıştırabilir ve host onu zaten sağlar; kendinizinkini eklemek ikinci bir kopyayı sabitler ve **hidrasyonu** (sunucu tarafında işlenmiş HTML'in tarayıcıda etkileşimli olmak üzere bağlandığı adım) bozar. Nedenini [Mimari](/tr/addon/architecture/)'de görün.
:::

## Tema: ana sayfaya bir widget yerleştirin

Tema, adlandırılmış **kancalar** (hook) sunar — eklentilerin bir bileşen enjekte edebileceği noktalar (kanca adlarının tam listesi [Arayüz API Referansı](/tr/addon/api-reference/)'nda; bu eğitim `page:home:top`'u kullanır). Shoutbox'ı ana sayfada göstermek için, `else` (tema) dalında `page:home:top` kancası için bir bileşen kaydedin:

```js
pano.ui.hook.register({
  name: 'page:home:top',
  component: viewComponent(() => import('./theme/ShoutboxWidget.svelte')),
});
```

::: tip Kontrol
Geliştirme sunucuları çalışırken, sitenin ana sayfasını açın. Sayfanın en tepesinde `<div class="shoutbox">` kapsayıcısını görmelisiniz (tarayıcı geliştirici araçlarıyla inceleyin). Henüz `load()` eklemediyseniz — sonraki adım — boş olacaktır; bu beklenen bir durum. Onu hiç görmüyorsanız, tarayıcı konsolunda hataları kontrol edin ve `pluginId`'nizi ve `else` dalında kaydettiğinizi doğrulayın.
:::

### Widget'a `load()` ile sunucu tarafında işlenmiş veri verin

İyi bir widget'ın veriye ihtiyacı vardır ve o verinin **ilk sunucu yanıtında** orada olması gerekir — sonradan tarayıcıda getirilmesi değil — böylece ziyaretçiler ve arama motorları shout'ları anında görür. Pano bunu **SSR** (sunucu tarafı işleme — sunucu, verisini sonradan getiren boş bir sayfa göndermek yerine, göndermeden önce bitmiş HTML'i oluşturur) ile yapar.

Bir kanca bileşeni, **modül betiğinden** — `<script module>` bloğu — bir `load(event)` fonksiyonu dışa aktarabilir. O blok, dosya ilk yüklendiğinde, bileşenin herhangi bir örneği var olmadan önce bir kez çalışır ki `load()`'ın orada yaşamasının ve normal örnek-başına bileşen kodunuzun altındaki düz `<script>`'te yaşamasının nedeni budur. Tema, sayfa hazırlanırken `load()`'ı çalıştırır (SSR sırasında sunucuda ve sayfalar arasında gezinirken tekrar istemcide) ve döndürdüğünüz her şeyi bileşene props olarak verir. Shoutbox'ta, `load()` herkese açık uç noktamızı çağırır:

```svelte
<!-- src/theme/ShoutboxWidget.svelte -->
<script module>
  import ApiUtil from '@panomc/sdk/utils/api';

  export async function load(event) {
    const res = await ApiUtil.get({ path: '/api/shoutbox/list', request: event });
    return { shouts: res.shouts ?? [] };
  }
</script>

<script>
  export let shouts = [];
</script>

<div class="shoutbox">
  {#each shouts as shout}
    <p class="shout">{shout.message}</p>
  {/each}
</div>
```

`event`, gelen sayfa isteğidir — ziyaretçinin çerezlerini ve oturumunu taşır. Çoğunlukla onu API'nin kimin sorduğunu bilmesi için (yani `request: event` olarak) `ApiUtil`'e iletirsiniz.

Döndürdüğünüz nesne bileşenin props'u olur — burada `shouts` işlenmeye hazır olarak gelir. (Host bu props akışına `hookProps` der; o adla API referansında ve hata mesajlarında tanışacaksınız.)

::: warning `load()` sunucuda *ve* istemcide çalışır
Aynı `load()`, SSR sırasında ve yeniden istemci tarafı gezinmede çalışır, dolayısıyla onu **iki kez çalışmaya güvenli** tutun: yalnızca veri getirmeli ve döndürmelidir. Global değişkenleri değiştirmeyin, hiçbir şey yazmayın ve size verilen nesneleri değiştirmeyin — çünkü aynı fonksiyon sunucuda bir kez ve tarayıcıda tekrar çalışır. ("Yan etkisi olmadan iki kez çalışmaya güvenli" için tek kelimelik ad *idempotent*'tir.) Sunucu tarafı çağrının ziyaretçinin oturumunu taşıması için `ApiUtil`'e her zaman `request: event` geçin (sonraki bölüm).
:::

::: tip Kontrol
Ana sayfayı yenileyin. `<div class="shoutbox">` artık her shout için bir `<p class="shout">` içermeli (backend'inizde herhangi biri varsa). Verinin gerçekten *ilk* yanıtta olduğunu doğrulamak için, sert bir yenileme yapın (Ctrl/Cmd+Shift+R) ve "Kaynağı görüntüle"yi kullanın — shout'ları HTML'de zaten mevcut görmelisiniz, boş değil.
:::

::: tip Gösterecek bir şeyi olmadığında widget'ı gizleyin
`load()` `{ hookOptions: { invisible: true } }` döndürürse, host o kanca için hiçbir şey işlemez. Announcement eklentisi, gösterilecek bir şey olmadığında kaybolmak için bunu kullanır.
:::

## API'nizi çağırma

Tüm ağ çağrıları `ApiUtil` üzerinden gider. Varsayılan dışa aktarmayı içe aktarın ve her biri tek bir seçenek nesnesi alan fiil metotlarını kullanın:

```js
import ApiUtil from '@panomc/sdk/utils/api';

// In a load() — pass request so the server-side call has the session:
const res = await ApiUtil.get({ path: '/api/shoutbox/list', request: event });

// In a browser event handler — body is your JSON payload:
await ApiUtil.post({ path: '/api/panel/shoutbox', body: { message } });
await ApiUtil.delete({ path: `/api/panel/shoutbox/${id}` });
await ApiUtil.put({ path: '/api/panel/shoutbox/config', body: config });
```

Kural: **bir `load()` içinde, her zaman `request: event` geçin** ki getirme (fetch), SSR sırasında ziyaretçinin oturumuyla çalışsın. Tarayıcıda çalışan bir tıklama işleyicisinde onu atlayabilirsiniz.

::: warning `request: event`'i unutursanız
Çağrı tarayıcıda yine çalışır, ama SSR sırasında **çıkış yapmış** olarak çalışır. Belirti kafa karıştırıcıdır: veri eksiktir veya yalnızca sert bir yenilemede izin hataları alırsınız, oysa etrafta tıklandığında her şey iyi görünür. Bunu görürseniz, önce `load()` çağrılarınızı kontrol edin.
:::

::: tip `ApiUtil` hataları nasıl bildirir
`ApiUtil`, API hatalarında asla fırlatmaz — başarısız bir çağrı, `error` ayarlı bir nesneye çözümlenir (fırlatmaz ve bir HTTP durumunu kontrol etmezsiniz). Yanıtı kullanmadan önce her zaman `res.error`'ı kontrol edin; bunu aşağıdaki her örnekte göreceksiniz.
:::

## Bileşenlerinizdeki metni çevirme

Tema geliştirmenin aksine, **eklenti bileşenlerinize otomatik olarak bir çeviri yardımcısı enjekte edilmez** — `_`'yi kendi `main.js`'inizden içe aktarmalısınız. O `_`, iskeletdeki korkutucu satırdır:

```js
export const _ = derived(i18n, ($t) => (key, options) => $t(`plugins.${pluginId}.${key}`, options));
```

Yaptığı her şey şu: Pano'nun çeviri fonksiyonunu saran bir Svelte `derived` **deposudur** (kaynağı değiştiğinde yeniden hesaplanan bir değer) ve geçtiğiniz her anahtarı otomatik olarak `plugins.<pluginId>.` ile öne ekler. Yani bir bileşende `$_('widget.title')` yazarsınız ve o `plugins.pano-plugin-shoutbox.widget.title`'ı arar. Onu kullanmak için currying'i takip etmenize gerek yok — yalnızca içe aktarın ve `$` önekiyle okuyun:

```svelte
<script>
  import { _ } from '../main.js';
</script>

<h2>{$_('widget.title')}</h2>
```

`{$_('widget.title')}`, yerelleştirme dosyalarınızdaki `plugins.pano-plugin-shoutbox.widget.title` anahtarına çözümlenir. O anahtarların nerede yaşadığını ve nasıl ad-alanlandırıldığını görmek için [Çeviriler](/tr/addon/localization/)'e bakın.

## Panel: eklentinizin detay sayfasında bir ayarlar bölümü

Bir yönetici eklentinizi **Panel → Eklentiler**'de açtığında, detay sayfasının `panel:plugin-detail:content:<pluginId>` adlı bir kancası olur. Orada bir bileşen kaydetmek, eklentinize bir ayarlar ekranı vermenin en ucuz yoludur — çoğu yerleşik eklenti tam olarak bunu yapar. Bunu `if (pano.isPanel)` dalına koyun:

```js
pano.ui.hook.register({
  name: `panel:plugin-detail:content:${pluginId}`,
  component: viewComponent(() => import('./panel/ShoutboxSettings.svelte')),
});

pano.ui.addon.onLoad(async (data, event) => {
  if (data.addon.id !== pluginId) return;
  const res = await ApiUtil.get({ path: '/api/panel/shoutbox/config', request: event });
  if (!res.error) data.addon.config = res;
});
```

`pano.ui.addon.onLoad(callback)`, Pano'nun **herhangi** bir eklenti detay sayfası açıldığında çalıştırdığı bir fonksiyon kaydeder. Geri çağırmanız `(data, event)` alır:

- `data.addon`, sayfası açılan eklentiyi tanımlar. Bilinen alanı `data.addon.id`'dir (eklenti ID'si). Ona kendi özelliklerinizi de ekleyebilirsiniz — buradaki `data.addon.config` gibi — ve bunlar bu sayfadaki bileşenlerin `addon` prop'unda gelir. (Tam şekil için [Arayüz API Referansı](/tr/addon/api-reference/)'ndaki `addon` girdisine bakın.)
- `event`, sayfa isteğidir, tıpkı `load()`'taki `event` gibi.

*Her* eklenti için tetiklendiğinden, ilk satır `data.addon.id !== pluginId`'yi kontrol eder ve getirmeden önce sayfa sizinki değilse çıkar.

::: tip Burada `data`'yı genişletebilirsiniz
Daha önce, `load()` size verilen nesneleri asla değiştirmemeniz konusunda uyarmıştı. `onLoad` geri çağırmaları kasıtlı istisnadır: `data` nesnesi genişletilmek **için** vardır ve yapılandırmanızı `data.addon.config`'e eklemek, onu bileşenlerinize geçirmenin desteklenen yoludur.
:::

Bu kancada kaydedilen bileşenler, sayfanın `addon` nesnesini bir prop olarak alır, dolayısıyla `ShoutboxSettings.svelte` eklediğiniz yapılandırmayı okuyabilir:

```svelte
<!-- src/panel/ShoutboxSettings.svelte -->
<script>
  export let addon;
  let config = addon?.config ?? { enabled: true, maxShouts: 5 };
</script>
```

::: tip Kontrol
**Panel → Eklentiler → Shoutbox**'ı açın. Ayarlar bileşeniniz detay sayfasında işlenmeli ve `config` API'den doldurulmuş olmalı (veya istek başarısız olursa `{ enabled: true, maxShouts: 5 }` yedeğiyle).
:::

## Panel: kendi gezinme bağlantısı olan tam bir sayfa

Bir ayarlar bölümü, eklenti detay sayfasının içinde yaşar. Eklentinizin kendine ait bir sayfaya ihtiyacı olduğunda — `/shoutbox`'ta bir yönetim ekranı — onu bir **sayfa** olarak kaydedin ve panel kenar çubuğuna bir bağlantı ekleyin.

Aşağıdaki `permission` dizesi sabit bir deseni izler: `pano.plugin.<pluginId>.<nokta-durumunda izin sınıfı adı>`. Kotlin izin sınıfınızla **tam olarak** eşleşmelidir — burada `ManageShoutboxPermission`, `manage.shoutbox` olur ve `pano.plugin.pano-plugin-shoutbox.manage.shoutbox`'ı verir.

```js
pano.ui.page.register({
  path: '/shoutbox',
  component: viewComponent(() => import('./panel/ShoutboxPage.svelte')),
  permission: 'pano.plugin.pano-plugin-shoutbox.manage.shoutbox',
});

pano.ui.nav.site.editNavLinks(async (links) => {
  if (!links.some((l) => l.href === '/shoutbox')) {
    const i = links.findIndex((l) => l.href === '/posts');
    const link = {
      href: '/shoutbox',
      icon: 'fas fa-bullhorn',
      text: `plugins.${pluginId}.nav.shoutbox`,
      startsWith: true,
      permission: 'pano.plugin.pano-plugin-shoutbox.manage.shoutbox',
    };
    i >= 0 ? links.splice(i + 1, 0, link) : links.push(link);
  }
  return links;
});
```

Açıklanmaya değer birkaç şey:

- **`nav.site`, panelin ana kenar çubuğudur.** Başka gezinme alanları da vardır ve [Arayüz API Referansı](/tr/addon/api-reference/)'nda listelenmiştir; ad alanının fazladan `site` kelimesine sahip olmasının nedeni budur — yazım hatası değildir.
- **`text`, düz bir etiket değil, bir çeviri anahtarıdır.** Bu anahtarı [Çeviriler](/tr/addon/localization/)'de ekleyene kadar, kenar çubuğu ham anahtar dizesini gösterir (`plugins.pano-plugin-shoutbox.nav.shoutbox`). Bu, bu aşamada beklenen bir durumdur.
- **`icon`, bir Font Awesome sınıfıdır.** Panel Font Awesome'ı zaten paketler; mevcut adlara [fontawesome.com](https://fontawesome.com/icons)'dan göz atın.
- **Bir çıpaya göre yerleştirin.** Mevcut bir bağlantı bulun (burada `/posts`) ve bağlantınızı onun yanına ekleyin (splice), çıpa eksikse `push`'a düşün — böylece bağlantınız her zaman en sona değil, mantıklı bir yere iner.
- **Yinelenenlere karşı koruyun.** `editNavLinks`, uzun ömürlü sunucunun içinde her sayfa yüklemesinde yeniden çalışır, dolayısıyla birçok kez çalışabilir — eklemeden önce `links.some((l) => l.href === '/shoutbox')` kontrol edin, yoksa yinelenen bağlantılar yığarsınız. Diziyi her zaman **döndürün**.

::: tip İzin dizesini senkronda tutun
Yukarıdaki `permission` dizesi, Kotlin `ManageShoutboxPermission` sınıfınızın türettiği düğümün elle yazılmış bir kopyasıdır (`pano.plugin.pano-plugin-shoutbox.manage.shoutbox`). Paylaşılan bir sabit yoktur — Kotlin sınıfını yeniden adlandırırsanız, türetilen düğüm değişir ve bu arayüz kapısı sessizce eşleşmeyi durdurur. İkisini birlikte değiştirin. İzin kuralı için [Backend Geliştirme](/tr/addon/backend/)'ye bakın.
:::

`permission` karşılanmazsa, sayfa 404 döndürür ve gezinme bağlantısı gizlenir. Sayfalar için iki seçenek daha var: `systemLayout`, yerleşik bir panel düzenini yeniden kullanır (Comments eklentisi, sayfasının Gönderiler bölümü altında oturması için `systemLayout: 'PostsLayout'` kullanır) ve `resetLayout`, çevredeki panel çerçevesini (kenar çubuğu, başlık) kaldırır, böylece sayfanız tam-genişlikte (full-bleed) işlenir. Düzen adlarının tam listesi [Arayüz API Referansı](/tr/addon/api-reference/)'ndadır.

::: tip Kontrol
Paneli yeniden yükleyin. Kenar çubuğunda, **Gönderiler**'in hemen altında, ham anahtar `plugins.pano-plugin-shoutbox.nav.shoutbox` ile etiketlenmiş bir megafon simgesi belirmeli (o yerelleştirme anahtarını ekledikten sonra etiket gerçek metne dönüşür). `/shoutbox`'taki sayfanızı açmak için ona tıklayın.
:::

## Toast'ları gösterme

Bir eylemi yöneticiye doğrulamak için, bir toast gösterin (küçük bir açılır mesaj). `showToast`'ı `@panomc/sdk/toasts`'tan içe aktarın — ve yukarıdaki bölümdeki `$_` çeviri yardımcısını kullandığına dikkat edin:

```svelte
<script>
  import { showToast } from '@panomc/sdk/toasts';
  import { _ } from '../main.js';

  async function save(config) {
    const res = await ApiUtil.put({ path: '/api/panel/shoutbox/config', body: config });
    showToast(res.error ? $_('toasts.save-error') : $_('toasts.save-success'));
  }
</script>
```

::: tip Kontrol
Bu `save`'i bir düğmeye bağlayın ve ona tıklayın. Bir toast'ın kayarak geldiğini görmelisiniz — istek çalıştığında başarı mesajı, başarısız olduğunda hata mesajı.
:::

## İleri düzey — ilk okumada atlayın

Aşağıdaki her şey, ilk eklentinizde karşılaşmayacağınız durumlar içindir. İhtiyaç duyduğunuzda geri gelin.

### `pano.ui.app.onLoad` ile paylaşılan veriyi bir kez getirme

`pano.ui.app.onLoad(callback)`, **temanın** her sayfa isteğinde, sayfa işlenmeden önce çalıştırdığı bir fonksiyon kaydeder. Geri çağırması `(data, event)` alır; burada `data`, paylaşılan bir sayfa verisi torbası ve `event`, istektir (`ApiUtil`'e geçtiğinizle aynı tür). Bir getirmenin aynı anda birkaç kaydı beslemesi gerektiğinde kullanın.

Bileşen-başına bir `load()`'a alternatiftir: `skipLoad: true` ile bir kanca kaydedin ve verisini bunun yerine tek bir `pano.ui.app.onLoad(async (data, event) => { ... })`'tan getirin. FAQ ve Pages eklentileri, bir getirme birkaç kaydı beslediğinde bunu kullanır.

### Dinamik sayfalar ve temizlik

Bazen kaydettiğiniz sayfalar derleme zamanında bilinmez — backend'inizden gelirler (özel URL'ler, yönlendirmeler ve benzerleri). Onları listeyi getirdikten sonra `pano.ui.app.onLoad`'ın içinden kaydedin. Pages eklentisi tam olarak bunu yapar.

Önce zihinsel model, çünkü bu bölüm ona bağlıdır: tema, **her ziyaretçi tarafından paylaşılan, tek, uzun ömürlü bir sunucu programıdır**. Kaydettiğiniz her şey, o program yeniden başlayana kadar onun tarafından hatırlanır — ziyaretçi-başına ve sayfa-yüklemesi-başına değildir. Yani veriniz değişirse, siz kaldırmadıkça eski kayıtlar takılı kalır.

Buradaki keskin kenar budur. `pano.ui.app.onLoad` her istekte çalışır, ama kaydettiğiniz rotalar ve bağlantılar istekler arasında o süreçte kalır. Bir sayfa panelde silinirse, daha önce kaydettiğiniz girdi oyalanır — tarayıcı artık onu bilmese bile, süreç yeniden başlayana kadar SSR o hayalet rotayı sunmaya devam eder.

Çözüm, kaydettiğinizi izlemek ve gitmiş girdileri `pano.ui.page.unregister(path)` kullanarak kaldırmaktır:

```js
const registeredPaths = new Set();
const customPageComponent = viewComponent(() => import('./theme/CustomPage.svelte'));

pano.ui.app.onLoad(async (data, event) => {
  const res = await ApiUtil.get({ path: '/api/pages', request: event });
  const incoming = new Set(res.pages.map((p) => p.url));

  // Remove routes we registered before that are no longer present.
  for (const path of registeredPaths) {
    if (!incoming.has(path)) {
      pano.ui.page.unregister(path);
      registeredPaths.delete(path);
    }
  }

  for (const page of res.pages) {
    pano.ui.page.register({ path: page.url, component: customPageComponent });
    registeredPaths.add(page.url);
  }
});
```

Bir sayfayı `pano.ui.page.register` ile yeniden kaydetmek güvenlidir: aynı yol yalnızca önceki girdinin üzerine yazar, dolayısıyla burada yinelenen koruması gerekmez — gezinme bağlantılarının aksine, ki onlar *yinelenirdi*, `editNavLinks`'in `some(...)` kontrolüne ihtiyaç duymasının nedeni budur.

::: warning SSR'de hayalet rotalar
Veriden kaydedilen dinamik sayfalar Node sürecinde hayatta kalır (SSR — sunucu tarafı işleme — tek, uzun ömürlü bir programda çalışır). Kaldırılan öğelerin kaydını asla silmezseniz, silinen sayfalar Pano yeniden başlayana kadar SSR sırasında sunulmaya devam eder. `pano-plugin-link-redirects` eklentisi, eklediğiniz eskimiş gezinme bağlantılarını kaldırmak da dâhil, bu temizlik deseninin tam referansıdır.
:::

## Var olmayan eski ve YZ-uydurması API'ler

Bir YZ aracı, eski bir eğitim veya iskele bunlardan herhangi birini önerirse, onu yok sayın — hiçbiri mevcut değil. Yalnızca bu sayfadaki ve [Arayüz API Referansı](/tr/addon/api-reference/)'ndaki olanları kullanın.

- **`pano.ui.page.register({ name, view, scopes })`** — gerçek `page.register`, `{ path, component, permission, ... }` alır (yukarıya bakın). `name`/`view`/`scopes` biçimi yoktur.
- **`import { Button, Card } from '@panomc/sdk/components/panel'`** — SDK'de böyle bir bileşen kütüphanesi yoktur.
- **`onContextUpdate`** — eski boilerplate bu metodu tanımlar, ama **hiçbir host onu çağırmaz**. İskeletlenmiş `main.js`'iniz `onContextUpdate` içeriyorsa, onu silin.
- **Düz bir dizeyle `ApiUtil.get('/api/...')`** — her `ApiUtil` çağrısı bir seçenek nesnesi alır, örn. `ApiUtil.get({ path: '/api/...' })`.
- **`pano.utils.toast`** — böyle bir şey yoktur; toast'lar yalnızca `@panomc/sdk/toasts`'tan gelir.

## Sırada ne var

Artık tüm Shoutbox arayüzüne sahipsiniz: SSR verili bir ana sayfa widget'ı, bir panel ayarlar bölümü, gezinme bağlantısı olan tam bir panel sayfası, API çağrıları ve çeviriler.

- **[Arayüz API Referansı](/tr/addon/api-reference/)** — her kanca adı, görünüm yuvası, yaşam döngüsü etkinliği ve `@panomc/sdk` dışa aktarması tek bir yerde.
- **[Çeviriler](/tr/addon/localization/)** — `plugins.<pluginId>.<key>` dizeleriniz nerede yaşar ve panel yöneticilerin bunları geçersiz kılmasına nasıl izin verir.
- **[Backend Geliştirme](/tr/addon/backend/)** — bu sayfanın çağırdığı uç noktaların ve iznin Kotlin tarafı.
- **[Derleme ve Yayınlama](/tr/addon/publishing/)** — bitmiş eklentiyi bir yayın jar'ına dönüştürün. Bir yayın derlemesi arayüzü **içermek zorundadır**, dolayısıyla onun için asla `-Pnoui` kullanmayın (`-Pnoui`, yalnızca-backend yinelemesi sırasında arayüz derlemesini atlayan Gradle bayrağıdır — bkz. Derleme ve Yayınlama).
- **Referans eklentiler** — [PanoMC GitHub org](https://github.com/PanoMC)'undaki yerleşik eklentiler, buradaki her desen için çalışan referanstır: **Announcement** eklentisi (koşullu `invisible`), **FAQ** ve **Pages** eklentileri (`skipLoad` + `app.onLoad`), **Comments** eklentisi (`systemLayout`) ve **`pano-plugin-link-redirects`** (dinamik sayfalar + temizlik).
