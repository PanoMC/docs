# Frontend

Backend, shout'ları saklayıp sunabiliyor. Şimdi onları *gösterelim*. Bu sayfada ana sayfaya bir widget yerleştiriyoruz, sonra yöneticilerin shout'ları yönettiği bir panel sayfası ekliyoruz. Bu, Svelte yarısıdır — ziyaretçilerin ve yöneticilerin gerçekten görüp tıkladığı kısım.

Tam referans: [Arayüz Geliştirme](/tr/addon/frontend/).

::: tip Bu yarı sıcaktır — yeniden derleme yok
Kotlin'in aksine, arayüz sıcak yeniden yüklenir. İzleyiciyi bir kez başlatın ve tüm süre boyunca çalışır durumda bırakın:

```sh
bun run dev
```

Aşağıdaki her değişiklik, Geliştirme Modu açık olduğu ve klonunuz kurulumun `plugins/` klasörünün altında bulunduğu sürece bir tarayıcı yenilemesinde (F5) görünür.
:::

## Giriş noktası: `src/main.js`

Her şey `main.js`'te başlar, ki boilerplate onu zaten içerir. `PanoPlugin`'i genişleten tek bir varsayılan sınıf dışa aktarır. Pano onun `onLoad()`'ını **iki kez** çalıştırır — bir kez temada (herkese açık site) ve bir kez panelde (yönetici paneli). Bunları `pano.isPanel` ile ayırt edersiniz:

```js
export default class ShoutboxUiPlugin extends PanoPlugin {
  onLoad() {
    const { pano } = this;

    if (pano.isPanel) {
      // panel registrations go here
    } else {
      // theme registrations go here
    }
  }
}
```

Aşağıdaki her yerde önemli olan iki kural:

- **Her bileşeni `viewComponent(() => import('./File.svelte'))` ile sarın.** Bu isteğe bağlı değildir — bu, Pano'ya dosyanızı sayfanın kendi Svelte kopyasıyla yüklemek için bir *tarif* verir.
- **`pluginId`, backend'den gelen kimlikle tam olarak eşleşmelidir** (`pano-plugin-shoutbox`). Çeviriler ve kancalar ona göre anahtarlanır.

::: warning `package.json`'a asla `svelte` eklemeyin
Paketiniz Svelte, `svelte-i18n` veya `@panomc/sdk` göndermez — host onları sağlar, böylece tüm sayfa tek bir Svelte örneğini paylaşır. Kendi kopyanızı eklemek hidrasyonu bozar. Bir `bun add`'ın hemen ardından derlemeniz başarısız olmaya başlarsa, başıboş bir `svelte` girdisi olup olmadığını kontrol edin ve kaldırın. Nedenini [Mimari](/tr/addon/architecture/)'de görün.
:::

## Adım 1 — widget'ı ana sayfaya yerleştirin

Tema, adlandırılmış **kancalar** (hook) sunar — eklentilerin bir bileşen enjekte edebileceği noktalar. Shoutbox'ı ana sayfanın en üstüne koymak için, `else` (tema) dalında `page:home:top` kancası için bir bileşen kaydedin:

```js
pano.ui.hook.register({
  name: 'page:home:top',
  component: viewComponent(() => import('./theme/ShoutboxWidget.svelte')),
});
```

::: tip Kontrol
Sitenin ana sayfasını açın. Widget'ın kapsayıcısını en tepede görmelisiniz (devtools ile inceleyin). Sonraki adıma kadar boş olacak — bu beklenen bir durum. Tamamen eksikse, tarayıcı konsolunu kontrol edin ve doğru `pluginId` ile `else` dalında kaydettiğinizi doğrulayın.
:::

## Adım 2 — widget'a `load()` ile verisini verin

Bir widget veriye ihtiyaç duyar ve bu veriye **ilk sunucu yanıtında** ihtiyaç duyar ki ziyaretçiler ve arama motorları shout'ları hemen görsün. Bir kanca bileşeni bunu, **modül betiğinden** — `<script module>` bloğu — bir `load(event)` dışa aktararak yapar. Pano, sayfa hazırlanırken `load()`'ı çalıştırır ve döndürdüğünüz şeyi bileşene props olarak verir:

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

Bu, [Backend](/tr/handbook/addon/backend/) sayfasında inşa ettiğiniz herkese açık uç noktayı çağırır. `load()` için iki kural:

- **Her zaman `request: event` geçirin** ki sunucu tarafındaki çağrı ziyaretçinin oturumunu taşısın. Onu unutursanız fetch, SSR sırasında *çıkış yapmış* olarak çalışır — veri yalnızca sert bir yenilemede kaybolur, ki bu kovalanması kafa karıştırıcı bir hatadır.
- **`load()`, sunucuda *ve* istemcide çalışır**, o yüzden onu yan etkisiz tutun: yalnızca veri getirin ve döndürün.

::: tip `ApiUtil` hataları nasıl bildirir
`ApiUtil`, API hatalarında asla exception fırlatmaz — başarısız bir çağrı, `error`'ı ayarlanmış bir nesneye çözümlenir. Yanıtı kullanmadan önce `res.error`'ı kontrol edin; yukarıdaki `load()`'ın `res.shouts ?? []`'e geri düşmesinin nedeni budur.
:::

::: tip Kontrol
Ana sayfayı yenileyin — widget artık her shout için bir `<p class="shout">` gösteriyor (backend'inizde varsa; aşağıdaki panel sayfası üzerinden bir tane yayınlayın). Verinin *ilk* yanıtta olduğunu kanıtlamak için, sert bir yenileme yapın (Ctrl/Cmd+Shift+R) ve **Kaynağı görüntüle**'yi kullanın — shout'lar boş değil, HTML'de zaten olmalı.
:::

## Adım 3 — shout'ları yönetmek için bir panel sayfası

Şimdi yönetici tarafı. Eklentiniz kendine ait bir sayfaya ihtiyaç duyduğunda — `/shoutbox`'ta bir yönetim ekranı — onu bir **sayfa** olarak kaydedin ve panel kenar çubuğuna bir bağlantı ekleyin, her ikisi de `if (pano.isPanel)` dalında:

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

Bilmeye değer birkaç şey:

- **`nav.site`, panelin ana kenar çubuğudur.** Fazladan `site` sözcüğü bir yazım hatası değildir — başka gezinme alanları da vardır.
- **O `permission` dizesi, elle yazılmış bir kopyadır** — Kotlin `ManageShoutboxPermission` sınıfınızın türettiği düğümün. Paylaşılan bir sabit yoktur — Kotlin sınıfını yeniden adlandırırsanız, ikisini birlikte değiştirin, yoksa kapı sessizce eşleşmeyi bırakır.
- **`text` bir çeviri anahtarıdır, bir etiket değil.** Onu ekleyene kadar (sonraki sayfa), kenar çubuğu ham anahtarı gösterir: `plugins.pano-plugin-shoutbox.nav.shoutbox`. Bu burada beklenen bir durumdur.
- **Yinelenenlere karşı koruyun.** `editNavLinks`, uzun ömürlü sunucuda her sayfa yüklemesinde yeniden çalışır, dolayısıyla eklemeden önce `links.some(...)`'i kontrol edin — ve diziyi her zaman **döndürün**.

`ShoutboxPage.svelte` içinde asıl yönetim arayüzünü inşa edersiniz: shout'ları listeleyin, bir tane eklemek için `ApiUtil.post({ path: '/api/panel/shoutbox', body: { message } })`'yi çağıran bir form ve bir silme butonu. Bir eylemi onaylamak için, `@panomc/sdk/toasts`'tan `showToast` ile bir toast gösterin. Tam örnekler [Panel Arayüzü](/tr/addon/panel-ui/#toast-ları-gosterme)'nde.

::: tip Kontrol
Paneli yeniden yükleyin. **Gönderiler**'in hemen altındaki kenar çubuğunda bir megafon simgesi belirir, ham anahtarla etiketlenmiş (sonraki sayfada yerel ayar anahtarını ekleyince gerçek metne dönüşür). Sayfanızı `/shoutbox`'ta açmak için ona tıklayın. `permission` karşılanmazsa, sayfa 404 verir ve bağlantı gizlenir.
:::

::: tip Daha ucuz bir alternatif: bir ayarlar bölümü
Bütün bir sayfaya ihtiyacınız yoksa, bunun yerine eklentinizin detay sayfasına bir bileşen ekleyebilirsiniz (`panel:plugin-detail:content:<pluginId>` kancası) — bir eklentiye ayarlar ekranı vermenin en ucuz yolu. Çoğu yerleşik eklenti tam olarak bunu yapar; bkz. [Panel Arayüzü](/tr/addon/panel-ui/#eklentinizin-detay-sayfasında-bir-ayarlar-bolumu).
:::

## Sahte API'lere dikkat edin

Bir YZ asistanı veya eski bir eğitim size [Arayüz API Referansı](/tr/addon/api-reference/)'nda olmayan bir çağrı verirse, o çağrı yoktur. Yaygın sahteler: düz bir dizeyle `ApiUtil.get('/api/...')` (her çağrı bir seçenek nesnesi alır), bir `@panomc/sdk/components/panel` bileşen kütüphanesi (öyle bir şey yok) ve `onContextUpdate` (hiçbir host onu asla çağırmaz — iskele eklediyse silin). Tam liste [Arayüz referansının altında](/tr/addon/frontend/#var-olmayan-eski-ve-yz-uydurması-api-ler).

## Nerede olduğumuz

Shoutbox'ın artık sunucu tarafında işlenmiş verili bir ana sayfa widget'ı ve kendi gezinme bağlantısı olan bir panel sayfası var. Ama metni hâlâ sabit-kodlanmış İngilizce. Bunu düzeltelim.

**Sıradaki: [Çeviriler →](/tr/handbook/addon/translate/)**
