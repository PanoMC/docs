# Frontend Geliştirme

**Bu sayfa size ne verir:** her eklenti arayüzünün paylaştığı tek giriş noktası — `src/main.js` — artı arayüzün kendisini oluşturan iki konu sayfasına bir harita.

Eklentinizin iki yarısı vardır: bir Kotlin [backend'i](/tr/addon/backend/) ve bir **Svelte** arayüzü (kullanıcıların gördüğü ve tıkladığı görsel kısım). Eklentinizi derlediğinizde, derlenmiş Kotlin backend'i ve derlenmiş Svelte dosyalarınız tek bir `.jar` dosyasına birlikte zip'lenir — o dosyanın tamamı *eklentinizin kendisidir*. Bunun için özel bir şey yapmazsınız; derleme halleder.

Pano iki ayrı web sitesi çalıştırır: **tema** (ziyaretçilerin `yoursite.com`'da gördüğü) ve **panel** (`yoursite.com/panel`'deki yönetici panosu). Tek eklentiniz ikisine de arayüz ekler. Tek dosya — `src/main.js` — ikisi için de giriş noktasıdır.

Bu sayfalar boyunca çalışan örnek **Shoutbox**'tır: ana sayfanın üstünde en son "shout"lardan oluşan küçük bir widget, artı yöneticilerin bunları yönettiği bir panel. Bu sayfa `main.js`'i kurar; iki konu sayfası — [Tema Arayüzü](/tr/addon/theme-ui/) ve [Panel Arayüzü](/tr/addon/panel-ui/) — asıl ekranları oluşturur (bkz. [Sırada ne var](#sırada-ne-var)).

> Bir YZ asistanı veya eski bir eğitim size bu sayfalarda ya da [Arayüz API Referansı](/tr/addon/api-reference/)'nda olmayan bir API verirse, o mevcut değildir. Yaygın sahte veya kaldırılmış çağrılar bu [sayfanın altında](#var-olmayan-eski-ve-yz-uydurması-api-ler) listelenmiştir.

::: tip Svelte'de yeni misiniz?
Eklenti arayüzleri Svelte ile yazılır, tıpkı Pano temaları gibi. Hiç kullanmadıysanız, etkileşimli [Svelte eğitimi](https://svelte.dev/tutorial) bir eklenti arayüzünün ihtiyaç duyduğu her şeyi kapsar.
:::

::: tip Başlamadan önce
Eklentinizi **pano-boilerplate-plugin** şablonundan iskeleletmiş ve [Backend Geliştirme](/tr/addon/backend/)'yi tamamlamış olmalısınız. `src/main.js` dosyası boilerplate'te zaten var — onu oluşturmayacak, *düzenleyeceksiniz*. Geliştirme döngüsünü `bun run dev` ile başlatın ve tüm süre boyunca çalışır bırakın; aşağıdaki her değişiklik sıcak yeniden yüklenir, böylece onu anında görebilirsiniz. (Bitmiş eklentiyi bir yayına dönüştürmek [Derleme ve Yayınlama](/tr/addon/publishing/)'da ele alınmıştır.)
:::

## Eklentinizin dosyaları

İşte bu sayfaların atıfta bulunduğu düzen. `theme/` ve `panel/` klasörleri, ziyaretçi bileşenlerini ve yönetici bileşenlerini ayrı tutmak için yalnızca düzenli bir gelenektir — Pano adları zorunlu kılmaz, dosyaları istediğiniz gibi düzenleyebilirsiniz.

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

Şimdi iki dalı doldurun. Her birine ne gireceğinin kendi sayfası var: `else` (tema) dalı için **[Tema Arayüzü](/tr/addon/theme-ui/)**, `if (pano.isPanel)` dalı için **[Panel Arayüzü](/tr/addon/panel-ui/)**. Bu sayfanın geri kalanı, her iki dalın da kullandığı iki şeyi ele alır.

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

## Var olmayan eski ve YZ-uydurması API'ler

Bir YZ aracı, eski bir eğitim veya iskele bunlardan herhangi birini önerirse, onu yok sayın — hiçbiri mevcut değil. Yalnızca bu sayfalardaki ve [Arayüz API Referansı](/tr/addon/api-reference/)'ndaki olanları kullanın.

- **`pano.ui.page.register({ name, view, scopes })`** — gerçek `page.register`, `{ path, component, permission, ... }` alır (bkz. [Panel Arayüzü](/tr/addon/panel-ui/)). `name`/`view`/`scopes` biçimi yoktur.
- **`import { Button, Card } from '@panomc/sdk/components/panel'`** — SDK'de böyle bir bileşen kütüphanesi yoktur.
- **`onContextUpdate`** — eski boilerplate bu metodu tanımlar, ama **hiçbir host onu çağırmaz**. İskeletlenmiş `main.js`'iniz `onContextUpdate` içeriyorsa, onu silin.
- **Düz bir dizeyle `ApiUtil.get('/api/...')`** — her `ApiUtil` çağrısı bir seçenek nesnesi alır, örn. `ApiUtil.get({ path: '/api/...' })`.
- **`pano.utils.toast`** — böyle bir şey yoktur; toast'lar yalnızca `@panomc/sdk/toasts`'tan gelir.

## Sırada ne var

`main.js` kuruldu. Şimdi arayüzü inşa edin:

- **Sitede bir şeyler gösterin → [Tema Arayüzü](/tr/addon/theme-ui/)** — tema kancaları, ana sayfa widget'ı, sunucu tarafında işlenmiş veri ve API'nizi çağırma.
- **Yönetici ekranları ekleyin → [Panel Arayüzü](/tr/addon/panel-ui/)** — ayarlar bölümleri, gezinme bağlantılı tam panel sayfaları ve toast'lar.
- **Tam arama → [Arayüz API Referansı](/tr/addon/api-reference/)** — her kanca adı, görünüm yuvası, yaşam döngüsü etkinliği ve `@panomc/sdk` dışa aktarması tek bir yerde.
- **[Çeviriler](/tr/addon/localization/)** — `plugins.<pluginId>.<key>` dizeleriniz nerede yaşar ve panel yöneticilerin bunları geçersiz kılmasına nasıl izin verir.
- **[Backend Geliştirme](/tr/addon/backend/)** — bu sayfaların çağırdığı uç noktaların ve izinlerin Kotlin tarafı.
- **[Derleme ve Yayınlama](/tr/addon/publishing/)** — bitmiş eklentiyi bir yayın jar'ına dönüştürün. Bir yayın derlemesi arayüzü **içermek zorundadır**, dolayısıyla onun için asla `-Pnoui` kullanmayın (`-Pnoui`, yalnızca-backend yinelemesi sırasında arayüz derlemesini atlayan Gradle bayrağıdır — bkz. Derleme ve Yayınlama).
- **Referans eklentiler** — [PanoMC GitHub org](https://github.com/PanoMC)'undaki yerleşik eklentiler, bu sayfalardaki her desen için çalışan referanstır.
