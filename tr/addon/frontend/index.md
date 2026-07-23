# Arayüz Geliştirme

Eklentiniz, [backend'iyle](/tr/addon/backend/) aynı jar'da bir **Svelte arayüzü (UI)** gönderir. O arayüz iki yerde çalışır: ziyaretçilerin gördüğü herkese açık **tema** ve yöneticilerin kullandığı **panel**. Tek bir dosya — `src/main.js` — ikisinin de giriş noktasıdır.

Bu sayfa, çalışan örneğimiz **Shoutbox**'ın frontend'ini oluşturur: ana sayfanın üstünde en son "shout"lardan oluşan küçük bir widget, artı yöneticilerin bunları yönettiği bir panel. Sayfanın sonunda şunları yapabilirsiniz:

- ana sayfaya bir bileşen yerleştirmek ve ona sunucuda render edilmiş veri vermek,
- eklentinizin panel detay sayfasına bir ayarlar bölümü eklemek,
- kendi gezinme bağlantısıyla birlikte tam bir panel sayfası kaydetmek,
- backend API'nizi çağırmak ve bir toast göstermek,
- bileşenlerinizin içindeki metni çevirmek.

Bu sayfadaki her imza gerçektir. (Bu sayfanın eski sürümü `pano.ui.page.register({ name, view, scopes })` ve `import { Button, Card } from '@panomc/sdk/components/panel'` gibi çağrılar kullanıyordu — **bunların hiçbiri mevcut değil.** Yalnızca burada ve [Arayüz API Referansı](/tr/addon/api-reference/)'nda gösterilenleri kullanın.)

::: tip Svelte'te yeni misiniz?
Eklenti arayüzleri, tıpkı Pano temaları gibi Svelte ile yazılır. Hiç kullanmadıysanız, etkileşimli [Svelte eğitimi](https://svelte.dev/tutorial) bir eklenti arayüzünün ihtiyaç duyduğu her şeyi kapsar.
:::

## Giriş noktası: `src/main.js`

Her şey burada başlar. `main.js`, `PanoPlugin`'i genişleten bir varsayılan sınıf (default class) dışa aktarır. Pano tek bir örnek oluşturur, `this.pano`'yu enjekte eder ve `onLoad()`'unuzu çağırır — bir kez panel sürecinde ve bir kez tema sürecinde. İkisini `pano.isPanel` ile ayırt eder ve arayüzünüzü doğru dalda kaydedersiniz.

Tüm eklentinin üzerine inşa edildiği iskelet aşağıda:

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

Önem taşıyan ve referans eklentilerin hepsinin izlediği birkaç kural:

- **Sınıf, `default` dışa aktarım olmalıdır.** Pano tam olarak bir tane arar.
- **`this.pano` sizin tüm API'nizdir.** `onLoad()` çalışmadan önce enjekte edilir — `pano.isPanel`'i okuyun ve `pano.ui.*`'yı `onLoad()`'un içinden kullanın.
- **Her bileşeni `viewComponent(() => import(...))` içine sarın.** Bu isteğe bağlı değildir. Bir `register` çağrısına verdiğiniz her bileşen — kancalar, sayfalar, görünüm yuvaları — bu şekilde sarılmalıdır. `viewComponent`, host'a bileşeninizi tembel (lazy) olarak nasıl yükleyeceğini ve paylaşılan Svelte çalışma zamanıyla nasıl render edeceğini öğretir.
- **Paylaşılan durumu `main.js`'te tutun.** Modül kapsamındaki her şey (yukarıdaki `_` store'u gibi) burada yaşar. Host, **giriş** dosyanızı önbellek-kırıcı bir `?v=<uiHash>` sorgusuyla içe aktarırken, tembel parçalar (chunk) onu sorgusuz içe aktarır — aksi halde girişi iki kez değerlendirecek iki URL — bu yüzden derleme onu sanal bir cephe (facade) üzerinden yönlendirir ve `main.js`'i tam olarak bir kez çalışan tek bir paylaşılan parçaya zorlar. (Diğer dosyalar sıradan, sorgusuz parçalardır, her biri zaten bir kez yüklenmiştir; `main.js` yalnızca paylaşılan durumun garantili-tek yuvasıdır.)

::: warning `svelte`'i `package.json`'da asla bildirmeyin
Paketiniz Svelte'i, `svelte-i18n`'i veya `@panomc/sdk`'yi **göndermez** — bunları host sağlar, böylece tüm sayfa tek bir Svelte örneğini paylaşır. `svelte`'i kendiniz eklemek ikinci bir kopyayı sabitler ve hydration'ı bozar; derleme bunun üzerine başarısız olacak şekilde ayarlanmıştır. Nedeni için [Mimari](/tr/addon/architecture/) sayfasına bakın.
:::

Yukarıda `onUnload()`'u gördünüz ama `onContextUpdate()`'i görmediniz. Eski boilerplate `onContextUpdate` tanımlar — **hiçbir host onu asla çağırmaz**, bu yüzden oraya mantık koymayın.

## Tema: ana sayfaya bir widget yerleştirme

Tema, adlandırılmış **kancalar (hook)** açığa çıkarır — eklentilerin bir bileşen enjekte edebileceği noktalar. Shoutbox'ı ana sayfada göstermek için, `else` (tema) dalında, `page:home:top` kancası için bir bileşen kaydedin:

```js
pano.ui.hook.register({
  name: 'page:home:top',
  component: viewComponent(() => import('./theme/ShoutboxWidget.svelte')),
});
```

Widget'ı render etmek için bu kadarı yeterli. Ama iyi bir widget'ın veriye ihtiyacı vardır ve o verinin **ilk sunucu yanıtında** hazır olması gerekir — daha sonra tarayıcıda getirilmesi değil — böylece ziyaretçiler ve arama motorları shout'ları hemen görür.

### Widget'a `load()` ile sunucuda render edilmiş veri verme

Bir kanca bileşeni, **modül script'inden** bir `load(event)` fonksiyonu dışa aktarabilir. Tema, sayfa hazırlanırken (SSR sırasında sunucuda ve gezinirken istemcide) onu çalıştırır ve döndürdüğünüz her şeyi bileşene prop olarak verir. Shoutbox'ta `load()`, herkese açık uç noktamızı çağırır:

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

Döndürdüğünüz nesne, bileşenin prop'ları olur — burada `shouts`, render edilmeye hazır şekilde gelir. Host'un **`hookProps`** dediği prop akışı budur.

::: warning `load()` sunucuda *ve* istemcide çalışır
Aynı `load()`, SSR sırasında ve tekrar istemci tarafı gezinmede çalışır. Onu **idempotent** tutun — yan etki yok, ve size verilen nesneleri asla değiştirmeyin. Sunucu tarafı çağrısının ziyaretçinin oturumunu taşıması için `ApiUtil`'e her zaman `request: event` geçin (sonraki bölüm).
:::

Gerçek eklentilerin kullandığı iki ek püf noktası:

- **Widget'ı koşullu olarak gizleyin.** `load()`, `{ hookOptions: { invisible: true } }` döndürürse, host o kanca için hiçbir şey render etmez. Announcement eklentisi, gösterilecek bir şey olmadığında kaybolmak için bunu kullanır.
- **`load()`'u atlayın ve başka yerden getirin.** `skipLoad: true` ile kaydedin ve verinizi bunun yerine `pano.ui.app.onLoad(async (data, event) => { ... })`'dan getirin. Bu, alternatif veri yoludur — tek bir getirme birden fazla kaydı beslediğinde FAQ ve Pages eklentileri bunu kullanır.

## Panel: eklentinizin detay sayfasında bir ayarlar bölümü

Bir yönetici eklentinizi **Panel → Eklentiler**'de açtığında, detay sayfasının `panel:plugin-detail:content:<pluginId>` adlı bir kancası olur. Oraya bir bileşen kaydetmek, eklentinize bir ayarlar ekranı vermenin en ucuz yoludur — çoğu yerleşik eklenti tam olarak bunu yapar. Bunu `if (pano.isPanel)` dalına koyun:

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

`pano.ui.addon.onLoad`, herhangi bir eklenti detay sayfası yüklendiğinde tetiklenir, bu yüzden ilk satır, getirmeden önce onun **sizinki** olduğunu kontrol eder. `data.addon.config`'e eklediğiniz yapılandırma, ardından `addon` prop'u aracılığıyla `ShoutboxSettings.svelte`'e erişilebilir olur:

```svelte
<!-- src/panel/ShoutboxSettings.svelte -->
<script>
  export let addon;
  let config = addon?.config ?? { enabled: true, maxShouts: 5 };
</script>
```

## Panel: kendi gezinme bağlantısıyla tam bir sayfa

Bir ayarlar bölümü, eklenti detay sayfasının içinde yaşar. Eklentiniz kendine ait bir sayfaya ihtiyaç duyduğunda — `/shoutbox`'ta bir yönetim ekranı — onu bir **sayfa** olarak kaydedin ve panel kenar çubuğuna bir bağlantı ekleyin:

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

Filodaki her eklentinin izlediği iki geleneğe dikkat edin:

- **Bir çıpaya göre ekleyin.** Mevcut bir bağlantı bulun (burada `/posts`) ve bağlantınızı onun yanına yerleştirin, çıpa yoksa `push`'a geri düşün — böylece bağlantınız her zaman sona değil, mantıklı bir yere düşer.
- **Yinelenenlere karşı koruyun.** `editNavLinks` birden fazla kez çalışabilir, bu yüzden eklemeden önce `links.some((l) => l.href === '/shoutbox')`'u kontrol edin. Diziyi her zaman **döndürün**.

::: tip İzin dizesini senkron tutun
Yukarıdaki `permission` dizesi, Kotlin `ManageShoutboxPermission` sınıfınızın türettiği düğümün elle yazılmış bir kopyasıdır (`pano.plugin.pano-plugin-shoutbox.manage.shoutbox`). Paylaşılan bir sabit yoktur — Kotlin sınıfını yeniden adlandırırsanız, türetilen düğüm değişir ve bu arayüz kapısı sessizce eşleşmeyi bırakır. İkisini birlikte değiştirin. İzin kuralını [Backend Geliştirme](/tr/addon/backend/)'de görün.
:::

`permission` karşılanmazsa, sayfa 404 döndürür ve gezinme bağlantısı gizlenir. Sayfalar için iki seçenek daha vardır: `systemLayout`, yerleşik bir panel düzenini yeniden kullanır (Comments eklentisi, sayfasının Gönderiler bölümünün altında yer alması için `systemLayout: 'PostsLayout'` kullanır) ve `resetLayout`, çevredeki kabuğu (chrome) kaldırır. Düzen adlarının tam listesi [Arayüz API Referansı](/tr/addon/api-reference/)'ndadır.

## API'nizi çağırma ve toast gösterme

Tüm ağ çağrıları `ApiUtil` üzerinden geçer. Varsayılan dışa aktarımı içe aktarın ve her biri tek bir seçenek nesnesi alan fiil metotlarını kullanın:

```js
import ApiUtil from '@panomc/sdk/utils/api';

// In a load() — pass request so the server-side call has the session:
const res = await ApiUtil.get({ path: '/api/shoutbox/list', request: event });

// In a browser event handler — body is your JSON payload:
await ApiUtil.post({ path: '/api/panel/shoutbox', body: { message } });
await ApiUtil.delete({ path: `/api/panel/shoutbox/${id}` });
await ApiUtil.put({ path: '/api/panel/shoutbox/config', body: config });
```

Kural: **bir `load()` içinde her zaman `request: event` geçin** ki getirme, SSR sırasında ziyaretçinin oturumuyla çalışsın. Tarayıcıda çalışan bir tıklama işleyicisinde onu atlayabilirsiniz.

Bir eylemi onaylamak için bir toast gösterin:

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

::: warning Bu eski imzalar mevcut değil
Düz bir dizeyle `ApiUtil.get('/api/...')` **yanlıştır** — her çağrı bir seçenek nesnesi alır. Ayrıca **`pano.utils.toast` yoktur**; toast'lar yalnızca `@panomc/sdk/toasts`'tan gelir.
:::

## Bileşenlerinizdeki metni çevirme

Bileşenlerinize otomatik olarak hiçbir şey enjekte edilmez. Çeviri yardımcısı, bu sayfanın başında `main.js`'ten dışa aktardığınız `_` store'udur — her anahtarı `plugins.<pluginId>.` ile önekleyen bir `derived` store. Onu içe aktarın ve `$` önekiyle okuyun:

```svelte
<script>
  import { _ } from '../main.js';
</script>

<h2>{$_('widget.title')}</h2>
```

`{$_('widget.title')}`, yerelleştirme dosyalarınızdaki `plugins.pano-plugin-shoutbox.widget.title` anahtarına çözümlenir. O anahtarların nerede yaşadığı ve nasıl ad alanına alındığı için [Çeviriler](/tr/addon/localization/) sayfasına bakın.

## Dinamik sayfalar ve temizlik

Bazen kaydettiğiniz sayfalar derleme zamanında bilinmez — backend'inizden gelirler (özel URL'ler, yönlendirmeler ve benzerleri). Onları, listeyi getirdikten sonra `pano.ui.app.onLoad`'un içinden kaydedin. Pages eklentisi tam olarak bunu yapar.

Burada keskin bir kenar var. Temanın SSR süreci **uzun ömürlüdür**: `pano.ui.app.onLoad` her istekte çalışır, ancak kaydettiğiniz rotalar ve bağlantılar istekler arasında o süreçte kalıcı olur. Panelde bir sayfa silinirse, daha önce kaydettiğiniz girdi kalır — süreç yeniden başlayana kadar SSR hâlâ hayalet rotayı sunar, tarayıcı artık ondan haberdar olmasa bile.

Çözüm, kaydettiklerinizi izlemek ve `pano.ui.page.unregister(path)` kullanarak artık var olmayan girdileri kaldırmaktır:

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

::: warning SSR'deki hayalet rotalar
Veriden kaydedilen dinamik sayfalar, Node sürecinde hayatta kalır. Kaldırılan öğeleri asla kayıttan silmezseniz, silinen sayfalar Pano yeniden başlayana kadar SSR sırasında sunulmaya devam eder. `pano-plugin-link-redirects` eklentisi, eklediğiniz bayat gezinme bağlantılarını kaldırmak da dahil olmak üzere bu temizlik deseninin eksiksiz referansıdır.
:::

## Sırada ne var

Artık tüm Shoutbox arayüzüne sahipsiniz: SSR verili bir ana-sayfa widget'ı, bir panel ayarları bölümü, gezinme bağlantılı tam bir panel sayfası, API çağrıları ve çeviriler.

- **[Arayüz API Referansı](/tr/addon/api-reference/)** — her kanca adı, görünüm yuvası, yaşam döngüsü olayı ve `@panomc/sdk` dışa aktarımı tek bir yerde.
- **[Çeviriler](/tr/addon/localization/)** — `plugins.<pluginId>.<key>` dizelerinizin nerede yaşadığı ve panelin yöneticilerin bunları geçersiz kılmasına nasıl izin verdiği.
- **[Backend Geliştirme](/tr/addon/backend/)** — bu sayfanın çağırdığı uç noktaların ve iznin Kotlin tarafı.
- **[Derleme ve Yayınlama](/tr/addon/publishing/)** — bitmiş eklentiyi bir yayın jar'ına dönüştürün (unutmayın: bir yayın derlemesi arayüzü **içermek zorundadır**, bu yüzden onun için asla `-Pnoui` kullanmayın).
