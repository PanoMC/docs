# Sayfa Tasarımlarını Değiştirme

[Renkler ve Stil](../customization), tüm siteyi kod olmadan yeniden renklendirmenizi sağlar. Bir sayfanın **farklı bir düzene veya markup'a** sahip olmasını istediğinizde — yalnızca farklı renkler değil — onun **view'ını (görünümünü)** değiştirirsiniz. Bu sayfa bunun nasıl yapılacağını gösterir.

## Fikir, sade bir dille

Pano'daki her sayfa iki parçadan oluşur:

- **Mantık (logic)** — veri yükleme, girişleri işleme, eklentileri çalıştırma. Tema çekirdeği buna sahiptir ve siz asla dokunmazsınız.
- **View (görünüm)** — o sayfanın nasıl *göründüğü*: markup ve düzen. Bunu değiştirmek size aittir.

İkisi ayrı olduğu için, **herhangi bir sayfanın mantığına dokunmadan görünümünün sahipliğini alabilirsiniz**. Veri yine gelir, eklentiler yine çalışır, girişler yine gerçekleşir — siz yalnızca sunumu yeniden stillendirirsiniz.

Devralabileceğiniz **26 view** vardır; her sayfa türü için bir tane (ana sayfa, giriş, kayıt, profil vb.).

## Adım 1 — nelerin mevcut olduğunu görün

Geçersiz kılabileceğiniz her view'ı, her birinin aldığı verilerle birlikte listeleyin:

```sh
bunx @panomc/theme-core list-views
```

Bunları **örnek verilerle çizilmiş** görmek için tema geliştirme modundayken `<Pano adresiniz>/__pano/views` adresini açın. Bu, view kataloğudur: her motor view'ı ve her eklenti view'ı tek sayfada.

## Adım 2 — bir view'ın sahipliğini alın

Bir view'ı devralmak için onu **eject** edin. Eject etmek, tema çekirdeğinin varsayılan sürümünü kendi `src/views/` klasörünüze kopyalar ve `theme.config.js` içinde kaydeder:

```sh
bunx @panomc/theme-core eject-view HomeView
```

Bundan sonra, serbestçe düzenleyebileceğiniz çalışan bir `src/views/HomeView.svelte` dosyanız olur.

::: tip
Eject edilen dosyalar, gerçek varsayılanın **çalışan kopyaları** olarak başlar — boş bir sayfa değil. Sıfırdan bir tasarım *yazmaz*, mevcut bir tasarımı *düzenlersiniz*. Küçük şeyleri değiştirerek ve yenileyerek başlayın.
:::

## Adım 3 — başlığı okuyun ("size verilen malzemeler")

Eject edilen her view, **her prop'u** belgeleyen bir yorum başlığıyla başlar — tema çekirdeğinin view'ınıza verdiği veriler ve fonksiyonlar. Bunu, çalışmak için elinizdeki malzemelerin listesi olarak düşünün. İşte blaze-theme'in `HomeView`'ından gerçek bir alıntı:

```svelte
<!--
  @view HomeView (blaze override)
  Controller: $pano/lib/pages/HomePage.svelte
  Props:
    data.posts       array — mevcut sayfanın gönderileri
    data.postCount   number — toplam gönderi sayısı
    data.page        number — mevcut sayfa numarası
    data.totalPage   number — sayfalama için toplam sayfa sayısı
    themeSettings    object — context'ten gelen tema ayarları
    onPageClick      function(data, page) — sayfalama işleyicisi
-->
```

Store'lar birer store nesnesi olarak gelir (bunları `$_` gibi bir `$` önekiyle okuyun) ve action'lar çağıracağınız fonksiyonlar olarak gelir. Başlığın listelediği her şey elinizdedir; bunların nereden geldiğini bilmeniz gerekmez.

## Uygulamalı bir örnek — ana sayfayı yeniden tasarlamak

Hadi gerçekten yapalım. `eject-view HomeView` sonrasında `src/views/HomeView.svelte` dosyanız şöyle görünür (okumayı kolaylaştırmak için biraz kısaltıldı):

```svelte
<div class="vstack gap-3">
  <Hook name="page:home:top" />

  <!-- Posts -->
  <Posts posts={data.posts} />

  <!-- Pagination -->
  {#if data.postCount > 0}
    <Pagination
      page={data.page}
      totalPage={data.totalPage}
      on:pageLinkClick={(event) => onPageClick(data, event.detail.page)} />
  {/if}
</div>

<script>
  import { _ } from "svelte-i18n";
  import Hook from "$pano/lib/components/Hook.svelte";
  import Pagination from "$pano/lib/components/Pagination.svelte";
  import Posts from "$pano/lib/components/Posts.svelte";

  export let data;
  export let themeSettings;
  export let onPageClick;
</script>
```

Yukarıdan aşağıya okuyun: bir eklenti alanı (`<Hook>`), gönderi listesi ve sayfalama. Ana sayfanın tamamı bu. Şimdi onu, her seferinde küçük bir düzenleme yaparak değiştirelim.

### Düzenleme 1 — kendi markup'ınızı ekleyin

Markup'ta yazdığınız her şey sayfada olduğu gibi görünür. Gönderilerin üstüne bir karşılama afişi ekleyin:

```svelte
<div class="vstack gap-3">
  <Hook name="page:home:top" />

  <div class="welcome-banner">
    <h1>Welcome, adventurer!</h1>
    <p>Grab your pickaxe — the server awaits.</p>
  </div>

  <!-- Posts -->
  <Posts posts={data.posts} />
  ...
```

Kaydedin, yenileyin → afiş ana sayfanızda. `.welcome-banner`'ı temanızın SCSS'inde diğer herhangi bir CSS sınıfı gibi stillendirin. Tema çalışmasının büyük bölümü özünde budur: **view'ın içine yazılan, sade HTML ve CSS.**

### Düzenleme 2 — size verilen veriyi kullanın

Başlık bize `data.posts`'un bir gönderi dizisi olduğunu söyledi. Hazır `<Posts>` bileşenini kullanmak zorunda değilsiniz — gönderileri bir `{#each}` döngüsüyle **kendi tarzınızda** düzenleyebilirsiniz:

```svelte
  <!-- Posts — replaced with our own card grid -->
  <div class="post-grid">
    {#each data.posts as post}
      <a class="post-card" href="/post/{post.url}">
        <h3>{post.title}</h3>
      </a>
    {/each}
  </div>
```

Kaydedin, yenileyin → aynı gönderiler, tamamen farklı bir düzen ve her pikseline siz sahipsiniz. Tema çekirdeği veriyi yine yükler, yine sayfalar, yine eklentileri çalıştırır — siz yalnızca bir gönderinin nasıl göründüğüne karar verdiniz.

::: tip `post`'un içinde ne olduğunu nasıl bilirim?
İki kolay yol: varsayılan markup'ın onu nasıl kullandığına bakın ya da bir anlığına döngünün içine `<pre>{JSON.stringify(post, null, 2)}</pre>` bırakın — nesnenin tamamını sayfaya yazdırır. İşiniz bitince silin.
:::

### Düzenleme 3 — bir ayara tepki verin

`themeSettings`, site sahibinin panelde yapılandırdığı şeyleri tutar. Tasarımınızın bazı bölümlerini isteğe bağlı yapmak için bunu kullanın:

```svelte
  {#if themeSettings.welcomeBannerVisible !== false}
    <div class="welcome-banner">
      <h1>Welcome, adventurer!</h1>
    </div>
  {/if}
```

Artık afiş panelden kapatılabilir — anahtarı düzgün kaydedilecek şekilde nasıl tanımlayacağınız için aşağıdaki [Özel tema ayarları](#özel-tema-ayarları) bölümüne bakın.

### Döngünün tamamı bu

Her view tam olarak böyle çalışır, sayfa ne olursa olsun: eject → malzemelerinizi görmek için başlığı okuyun → markup'ı düzenleyin → yenileyin. Giriş sayfası, profil, gönderi detayı — aynı tarif, farklı prop'lar. Bir şey bozulduğunda son düzenlemenizi geri alın; kararsız kaldığınızda tema çekirdeğinin varsayılan view'ıyla karşılaştırın (her zaman `node_modules/@panomc/theme-core/src/lib/views/` içinde görünür).

## View'larınızın içindeki eklenti API'si

Kurulu eklentiler, **view'ların içinde** yaşayan işaretçiler aracılığıyla sayfada görünür. İki tür vardır:

- **`<Hook>` işaretçileri** — eklentilerin kendi bileşenlerini enjekte edebileceği adlandırılmış alanlar. Bir hook, markup'ta `<Hook name="page:home:top" />` şeklinde görünür. Tema çekirdeğinin view'ları bugün şu hook adlarını taşır:

  | Hook adı | Eklentilerin göründüğü yer |
  |---|---|
  | `theme:top` | Her sayfanın en üstü |
  | `page:top` | Her sayfanın içeriğinin üstü |
  | `page:home:top` | Ana sayfanın üstü |
  | `theme:post-detail:bottom` | Bir gönderinin içeriğinin altı |
  | `theme:support:content` | Destek sayfasının içi |

- **`<ViewComponent>` slot'ları** — bir view'ın, giriş sayfasındaki ek giriş yöntemleri veya profil kartındaki ek satırlar gibi, **eklenti tarafından kaydedilmiş bir bileşen listesini** render ettiği yerler. Bunlar, view'ın başlığında belgelenen prop'lar aracılığıyla gelir (`contentItems` veya `altMethods` gibi store'lar) ve `<ViewComponent component={item.component} … />` ile render edilir.

### Asla kaldırmamanız gerekenler

::: warning
Bir view'ı yeniden tasarladığınızda, **orijinalin sahip olduğu her `<Hook>` ve her `<ViewComponent>` slot'unu koruyun** — taşıyın, etraflarını yeniden stillendirin, kendi markup'ınıza sarın, ancak silmeyin. Birini kaldırırsanız, ona güvenen herhangi bir eklenti kullanıcılarınızın sitelerinden sessizce kaybolur. Ayrıca, bir hook adı aynı anda yalnızca **tek bir** view'da görünmelidir — aynı hook'u iki yerde bağlamak, oradaki her eklentiyi iki kez render eder.

Bunu elle takip etmeniz gerekmez: geçersiz kılınan bir view bir bağlama noktasını kaybederse ya da bir hook adı iki kez bağlanırsa `bun run check` başarısız olur; böylece araç, siz bozuk bir tema gönderemeden önce sizi korur.
:::

### Kendi bağlama noktalarınızı ekleme

Yerleşik hook'larla sınırlı değilsiniz — temanız, kendi yeni hook alanlarını ekleyerek **eklenti API'sini genişletebilir**. Sahip olduğunuz bir view'ın herhangi bir yerinde, taze bir adla yeni bir işaretçi bırakın:

```svelte
<script>
  import Hook from "$pano/lib/components/Hook.svelte";
</script>

<Hook name="my-theme:hero:bottom" />
```

`my-theme:hero:bottom` için bir bileşen kaydeden herhangi bir eklenti artık orada render edilir. İki kural bunu güvende tutar:

- **Adlarınızı ad alanına alın (namespace).** Tema çekirdeği hook'larıyla veya başka bir temanınkiyle asla çakışamamaları için onları temanızın `id`'siyle başlatın (`my-theme:…`).
- **Mevcut adları yeniden kullanmayın.** Yukarıdaki tablodaki yerleşik adların, eklentilerin dayandığı sabit bir anlamı vardır — eski adları başka bir yerde yeniden kullanmak yerine yeni adlar ekleyin.

Bir kez gönderdikten sonra, özel hook'larınıza bir söz gibi davranın: eklentiler onlara dayanmaya başlayabilir, bu yüzden onları tıpkı yerleşik olanlar gibi temanızın gelecekteki sürümlerinde koruyun.

### SSR ve eklenti yüklemesi — eklenti verisi nereden gelir

Eklenti içeriği sonradan tarayıcıda üzerine cıvatalanmaz — bu, **sunucu tarafı render'ın (SSR)** bir parçasıdır: bir sayfa sunucuda render edildiğinde, hook'lara bağlanan eklenti bileşenleri de onunla birlikte render edilir, böylece ziyaretçiler (ve arama motorları) ilk yanıtta tam sayfayı alır.

Perde arkasında bunu iki eklenti API'si mümkün kılar ve her ikisi de **tema çekirdeğinin controller'ları** tarafından çalıştırılır — temanız onları asla çağırmaz, ama var olduklarını bilmek faydalıdır:

- **Hook `load()` fonksiyonları.** Bir hook'a bağlanan bir eklenti bileşeni kendi `load()`'unu dışa aktarabilir; tema çekirdeği bunu sayfanın yüklenmesi sırasında çalıştırır (SSR için sunucuda, gezinirken istemcide) ve sonuçları bileşene otomatik olarak **`hookProps`** olarak iletir — bazı view başlıklarının `data`'sında `hookProps`'un listelendiğini fark etmiş olabilirsiniz. Siz hiçbir şey yapmadan akıp gelir.
- **Yaşam döngüsü olayları.** Eklentiler ayrıca, bir sayfanın verisi hazırlanırken tema çekirdeğinin tetiklediği yükleme zamanı olaylarına da abone olabilir — `theme:app:load`, `theme:navbar:load`, `theme:profile:load`, `theme:post-detail:load`, `theme:support:load`, `theme:tickets:load`, `theme:settings:load` ve benzerleri. Örneğin eklentiler, öğeleri navbar'a sayfa yüklendikten sonra belirmek yerine sunucuda render edilen HTML'de görünecek kadar erken bu şekilde ekler.

Bunun bir tema yazarı olarak sizin için anlamı:

- **Bağlanacak hiçbir şey yok** — geçersiz kıldığınız view'lar bağlama noktalarını koruduğu sürece, SSR dahil yukarıdakilerin hepsi çalışmaya devam eder.
- **Özel hook'lar hakkında dürüst bir uyarı:** sunucu tarafı `load()` hattı yalnızca **yerleşik** hook adları için çalışır. Eklediğiniz özel bir hook'a (örneğin `my-theme:hero:bottom`) bağlanan bir eklenti yine de render edilir — SSR dahil — ama `load()` verisi tema çekirdeği tarafından hazırlanmaz, bu yüzden böyle eklentiler verilerini genellikle istemcide çeker.

## Eklenti view'ını yeniden çizmek

Bir eklentinin site arayüzü **adlandırılmış view'lardan** oluşur. Bir view'ın kimliği `<ns>:<Name>`'dir (örneğin `market:ProductCard`); motor view'ları çıplak adlarını korur (`Navbar`). Bir tema bunlardan herhangi birini motor view'ı gibi yeniden çizebilir:

```sh
bunx @panomc/theme-core eject-view market:ProductCard
bunx @panomc/theme-core eject-view 'market:*' --pages
```

Komut, eklentinin okunabilir kaynağını `src/views/market/ProductCard.svelte` dosyasına kopyalar, içinden `load` ve `view`'ı çıkarır, diğer eklenti view'larının import'larını `pluginView("market:PriceTag")` olarak yeniden yazar, gereken yardımcı dosyaları kopyalar ve girdiyi `theme.config.js` içine yazar:

```js
views: {
  Navbar: () => import("./src/views/Navbar.svelte"),
  "market:ProductCard": {
    contract: 2,
    controllers: ["market/cart"],
    component: () => import("./src/views/market/ProductCard.svelte"),
  },
},
```

İki kural iki tarafı da korur:

- **Veri eklentide kalır.** Sayfalar, enjeksiyonlar ve bloklar eklentinin kendi `load`'unu korur; sizin dosyanız yalnızca işaretleme sağlar. Bir override'ın dışa aktardığı `load` yok sayılır.
- **Bir eklenti güncellemesi temanız yüzünden asla engellenmez.** Override yalnızca `contract`'ı (ve sabitlediği her controller'ın sürümü) eklentiyle eşleştiği sürece kullanılır. Aksi halde eklentinin kendi view'ı çizilir ve panel view'ı geri düşmüş olarak listeler. Güncellemek için `eject-view market:ProductCard` komutunu yeniden çalıştırın (yanınıza bir `.new` dosyası yazar), birleştirin, sonra `bunx @panomc/theme-core accept market:ProductCard` çalıştırın.

Markup olmayan eklenti mantığı (sepet, oturum) bir **controller**'dır ve `<ns>/<name>` olarak adlandırılır. Kendi view'larınızda ve sayfalarınızda kullanın: `@panomc/sdk/controllers` içinden `plugin('market').use('cart')`. `bunx @panomc/theme-core check --fix` sürüm sabitlerini sizin için yazar.

## Bloklar, sahiplenmeler ve slotlar

**Bloklar.** Bir eklenti view'ını işaretlemenizin herhangi bir yerine `<PluginBlock>` ile yerleştirin. Verisi her yerleştirme için sunucuda yüklenir; farklı prop'lu iki ızgara iki ayrı veri kümesi alır. Prop'lar sabit değer olmalıdır:

```svelte
<script>
  import { PluginBlock } from "@panomc/sdk/components/theme";
</script>
<PluginBlock id="market:ProductGrid" limit={8} category="vip" />
```

Bilinmeyen bir kimlik ya da kurulu olmayan eklenti hiçbir şey çizmez.

**Sahiplenmeler (claims).** Bir eklentinin kendiliğinden bağladığı gezinme öğesi, kenar çubuğu widget'ı veya hook bir *enjeksiyondur*. Aynı view'ı `<PluginBlock id="market:NavCart" />` ile kendiniz yerleştirirseniz otomatik kopya kaybolur: temanız onu sahiplenmiştir. `theme.config.js` bunu elle ayarlayabilir (`false` otomatik kopyayı korur):

```js
claims: { "market:NavCart": true, "market:CartOffcanvas": false },
```

**Slotlar.** Bir eklenti view'ı diğer eklentiler için `<PluginSlot id="market:checkout:payment" />` ile slot açabilir. Bu view'ı override ederseniz varsayılandaki her `<PluginSlot>`'u koruyun.

## Bir eklenti kurulu olduğunda veya olmadığında {#plugin-installed}

En çok emekten en aza üç yol:

1. **Davranış ve yerleşim: `hasPlugin`.** `siteInfo.plugins`, kurulu ve çalışan eklentileri eklenti kimliğiyle listeler. `hasPlugin(siteInfo, "market")` (`$pano/lib/plugins.js` içinden) bunu yanıtlar; tam kimlik `"pano-plugin-market"` esastır, kısa ad alanı da çalışır. `pluginInfo(siteInfo, "market")` `{ version, uiHash, dependencies }` ya da `null` döndürür. Kendi durumunu tutmaz, bu yüzden sunucuda güvenlidir. `load()` içinde `siteInfo`'yu `(await parent()).session`'dan alın, bileşende `$session.siteInfo` kullanın:

```svelte
<Hero cta={hasPlugin($session.siteInfo, "market") ? "store" : "register"} />
```

2. **Şu bloğu ya da bunu göster.** Eklenti yoksa `<PluginBlock>` `fallback` snippet'ini çizer: `<PluginBlock id="market:GoalWidget">{#snippet fallback()}<p>Bize katılın!</p>{/snippet}</PluginBlock>`.
3. **Override'lar ve eklenti CSS'i için koruma gerekmez.** Eklenti yoksa kullanılmadan kalırlar; panel eklentiyi hata olarak değil "kurulu değil" olarak gösterir.

Kontrol etmeden bir eklentinin API'sini ya da controller'ını çağırmayın ve menüye bir eklenti sayfasına giden girdiyi elle yazmayın.

## Rotalar

`theme.config.js` rota ekleyebilir, devre dışı bırakabilir ve yeniden adlandırabilir. Rota dosyalarındaki ve eklenti sayfalarındaki kanonik yollar asla değişmez; yapılandırma yalnızca ziyaretçilerin gördüğünü değiştirir:

```js
routes: {
  add:     { "/staff-team": "./src/pages/StaffTeam.svelte" },
  disable: ["/rules"],
  rename:  { "/store": "/shop", "/store/[slug]": "/shop/[slug]" },
},
```

Yeniden adlandırılarak terk edilen yol yenisine 308 verir, devre dışı bırakılan yol 404'tür ve yeniden adlandırmanın iki tarafı da aynı `[param]` adlarına ihtiyaç duyar. Kendi işaretlemenizde bağlantılar haritayı izlesin diye `href={route("/store")}` yazın. Pano'nun gönderdiği e-postalar ve yönlendirmeler de yeniden adlandırmayı izler. Hiçbir şey `/posts` veya `/__pano*` yolunu hedefleyemez.

## Ana sayfa

Ana sayfayı yönetici panelde bir seçim kutusundan seçer; seçenekleri siz bildirirsiniz:

```js
home: {
  default: "landing",
  options: {
    posts:   { label: "Posts" },
    landing: { label: { "en-US": "Landing", tr: "Acilis" }, page: "./src/pages/Landing.svelte" },
    store:   { label: "Store", path: "/store" },
    custom:  { label: "Custom page", path: "*" },
  },
},
```

`home` anahtarı yoksa seçenekler gönderi akışı, kendini ana sayfa olarak sunan her kurulu eklenti sayfası ve özel bir yoldur. Gösterilemeyen bir seçim (eklenti kaldırıldı) önce `default`'a, sonra gönderi akışına düşer.

## Bootstrap'siz temalar {#themes-without-bootstrap}

Tüm resmî temalar Bootstrap ve Font Awesome ile gelir ve eklentilerin varsayılan view'ları onlara göre yazılmıştır. Kendi CSS'i olan bir tema bunu söyler:

```js
provides: { bootstrap: false, fontawesome: false },
```

Birini `bunx @panomc/theme-core new my-theme --bare` ile oluşturun. Motor, override etmediğiniz her varsayılan eklenti view'ı için kapsamlı bir yedek stil sayfası bağlar; bu sayfa [Özelleştirme](/tr/theme/customization/#the-pano-tokens) sayfasındaki `--pano-*` değişkenleriyle çalışır. `bootstrap: false` deyip Bootstrap'i hâlâ import eden tema için `check` uyarır. Yedek stil Chrome 118, Safari 17.4 veya Firefox 146 ister; altında Bootstrap'siz temada varsayılan bir eklenti view'ı stilsiz kalır. Bir CSS çocuk birleştiricisi (`.a > .b`), motorun her eklentinin varsayılan view'ı etrafına koyduğu sarmalayıcıyı aşamaz.

## Özel tema ayarları

Yeniden tasarladığınız view, site sahibinin değiştirebilmesi gereken **yeni seçenekler** eklerse (örneğin ana sayfada bir hero başlığı), bu seçeneklerin panelin **kaydedip sıfırlayabilmesi** için tanımlanması gerekir. Bunu `theme.config.js` içinde `settingsSchema` altında yaparsınız.

Kurallar basittir: girişler **eklemelidir (additive)** — anahtarlarınız bir sekmeye eklenir (yoksa yeni bir sekme oluşturulur) ve bir temel anahtarı kaldıramaz veya taşıyamazsınız. `defaultTab` isteğe bağlıdır; yalnızca view'ınız temel varsayılan sekmeyi göstermiyorsa ayarlayın. İşte `header` sekmesine hero anahtarları ekleyen kompakt, blaze tarzı bir örnek:

```js
// theme.config.js
export default {
  views: {
    HomeView: () => import("./src/views/HomeView.svelte"),
  },
  settingsSchema: {
    tabs: {
      header: ["heroSubtitle", "heroSubtitleVisibility"],
    },
    defaultTab: "logo",
  },
};
```

Bu olmadan, yeni girişleriniz panelde görüntülenir ancak asla gerçekten kaydedilmez. Yalnızca markup'ta *okuduğunuz* bir anahtarın (ayarlar view'ında bir girişi olmayan) burada bir kaydı olması gerekmez.

## Denetim

```sh
bunx @panomc/theme-core check            # uyarılar ve hatalar
bunx @panomc/theme-core check --strict   # uyarılar hata sayılır
```

## Dürüst bir not

Bu katman **temel Svelte** gerektirir — view'ların yazıldığı şablon dilidir. Daha önce hiç kullanmadıysanız, resmi [Svelte eğitimi](https://svelte.dev/tutorial) kısa ve etkileşimlidir ve bir view'ın kullandığı her şeyi kapsar.

Unutmayın: asla boş bir sayfadan başlamazsınız. Eject edilen her view, gerçek tasarımın çalışan bir kopyasıdır — düzenlersiniz, yenilersiniz ve tekrarlarsınız.

## Sırada ne var?

Temanız istediğiniz gibi göründüğünde, [Başlangıç](../getting-started) rehberi derleme, sözleşme kontrolü, paketleme ve gönderme işlemlerini kapsar.
