# Panel Arayüzü

**Bu sayfa size ne verir:** eklentinizin yönetici tarafı — detay sayfasında bir ayarlar bölümü, kendi kenar çubuğu bağlantısı olan tam bir panel sayfası ve eylemleri onaylayan toast'lar. Sona geldiğinizde yöneticiler Shoutbox'ı panelden yönetebilir.

Buradaki her şey, [`main.js`](/tr/addon/frontend/)'teki `onLoad()`'ın **`if (pano.isPanel)` dalına** girer. `main.js`'i henüz kurmadıysanız, önce [Frontend Geliştirme](/tr/addon/frontend/)'yi okuyun. Ağ çağrıları `ApiUtil` kullanır — kuralları ve hata işleme [API'nizi çağırma](/tr/addon/theme-ui/#api-nizi-cagırma)'da ele alınmıştır.

## Eklentinizin detay sayfasında bir ayarlar bölümü

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
Bir `load()`, size verilen nesneleri asla değiştirmemelidir. `onLoad` geri çağırmaları kasıtlı istisnadır: `data` nesnesi genişletilmek **için** vardır ve yapılandırmanızı `data.addon.config`'e eklemek, onu bileşenlerinize geçirmenin desteklenen yoludur.
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

## Kendi gezinme bağlantısı olan tam bir sayfa

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

Bir eylemi yöneticiye doğrulamak için, bir toast gösterin (küçük bir açılır mesaj). `showToast`'ı `@panomc/sdk/toasts`'tan içe aktarın — ve [Metni çevirme](/tr/addon/frontend/#bilesenlerinizdeki-metni-cevirme) bölümündeki `$_` çeviri yardımcısını kullandığına dikkat edin:

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

## Sırada ne var

Yönetici tarafı bitti: bir ayarlar bölümü, gezinme bağlantısı olan tam bir panel sayfası ve toast'lar.

- **[Çeviriler](/tr/addon/localization/)** — gezinme etiketinizin ve toast mesajlarınızın arkasındaki `plugins.<pluginId>.<key>` dizelerini ekleyin, böylece gerçek metin gösterirler.
- **[Arayüz API Referansı](/tr/addon/api-reference/)** — her kanca adı, gezinme alanı, sayfa düzeni ve yaşam döngüsü etkinliği tek bir yerde.
- **[Tema Arayüzü](/tr/addon/theme-ui/)** — ziyaretçiye dönük taraf, `ApiUtil` dâhil eksiksiz.
- **[Backend Geliştirme](/tr/addon/backend/)** — Kotlin uç noktaları ve bu sayfanın kapıladığı izin.
- **[Derleme ve Yayınlama](/tr/addon/publishing/)** — bitmiş eklentiyi bir yayın jar'ına dönüştürün. Bir yayın derlemesi arayüzü **içermek zorundadır**, dolayısıyla onun için asla `-Pnoui` kullanmayın.
- **Referans eklentiler** — [PanoMC GitHub org](https://github.com/PanoMC)'undaki yerleşik eklentiler, buradaki her desen için çalışan referanstır: **Announcement** eklentisi (koşullu `invisible`), **FAQ** ve **Pages** eklentileri (`skipLoad` + `app.onLoad`), **Comments** eklentisi (`systemLayout`) ve **`pano-plugin-link-redirects`** (dinamik sayfalar + temizlik).
