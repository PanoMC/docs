# Tema Arayüzü

**Bu sayfa size ne verir:** eklentinizin ziyaretçiye dönük tarafı için her şey — temaya bir bileşen yerleştirin, ona sunucu tarafında işlenmiş veri verin ve backend'inizi çağırın. Sona geldiğinizde Shoutbox widget'ı ana sayfada en son shout'ları gösterir.

Buradaki her şey, [`main.js`](/tr/addon/frontend/)'teki `onLoad()`'ın **`else` (tema) dalına** girer. `main.js`'i henüz kurmadıysanız, önce [Frontend Geliştirme](/tr/addon/frontend/)'yi okuyun.

## Ana sayfaya bir widget yerleştirin

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

## Sırada ne var

Ziyaretçi tarafı bitti: SSR verili bir ana sayfa widget'ı, API çağrıları ve (isteğe bağlı olarak) dinamik sayfalar.

- **Yönetici ekranları ekleyin → [Panel Arayüzü](/tr/addon/panel-ui/)** — ayarlar bölümleri, gezinme bağlantılı tam panel sayfaları ve toast'lar.
- **[Arayüz API Referansı](/tr/addon/api-reference/)** — her kanca adı, görünüm yuvası ve yaşam döngüsü etkinliği tek bir yerde.
- **[Metni çevirme](/tr/addon/frontend/#bilesenlerinizdeki-metni-cevirme)** — bileşenlerinizin etiketler için kullandığı `$_` yardımcısı.
- **[Backend Geliştirme](/tr/addon/backend/)** — `load()` ve `ApiUtil` çağrılarınızın vurduğu Kotlin uç noktaları.
