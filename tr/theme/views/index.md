# Sayfa Tasarımlarını Değiştirme

[Renkler ve Stil](../customization), tüm siteyi kod olmadan yeniden renklendirmenizi sağlar. Bir sayfanın **farklı bir düzene veya markup'a** sahip olmasını istediğinizde — yalnızca farklı renkler değil — onun **view'ını (görünümünü)** değiştirirsiniz. Bu sayfa bunun nasıl yapılacağını gösterir.

## Fikir, sade bir dille

Pano'daki her sayfa iki parçadan oluşur:

- **Mantık (logic)** — veri yükleme, girişleri işleme, eklentileri çalıştırma. Motor buna sahiptir ve siz asla dokunmazsınız.
- **View (görünüm)** — o sayfanın nasıl *göründüğü*: markup ve düzen. Bunu değiştirmek size aittir.

İkisi ayrı olduğu için, **herhangi bir sayfanın mantığına dokunmadan görünümünün sahipliğini alabilirsiniz**. Veri yine gelir, eklentiler yine çalışır, girişler yine gerçekleşir — siz yalnızca sunumu yeniden stillendirirsiniz.

Devralabileceğiniz **26 view** vardır; her sayfa türü için bir tane (ana sayfa, giriş, kayıt, profil vb.).

## Adım 1 — nelerin mevcut olduğunu görün

Geçersiz kılabileceğiniz her view'ı, her birinin aldığı verilerle birlikte listeleyin:

```sh
bunx @panomc/theme-core list-views
```

## Adım 2 — bir view'ın sahipliğini alın

Bir view'ı devralmak için onu **eject** edin. Eject etmek, motorun varsayılan sürümünü kendi `src/views/` klasörünüze kopyalar ve `theme.config.js` içinde kaydeder:

```sh
bunx @panomc/theme-core eject-view LoginView
```

Bundan sonra, serbestçe düzenleyebileceğiniz çalışan bir `src/views/LoginView.svelte` dosyanız olur.

::: tip
Eject edilen dosyalar, gerçek varsayılanın **çalışan kopyaları** olarak başlar — boş bir sayfa değil. Sıfırdan bir tasarım *yazmaz*, mevcut bir tasarımı *düzenlersiniz*. Küçük şeyleri değiştirerek ve yenileyerek başlayın.
:::

## Adım 3 — başlığı okuyun ("size verilen malzemeler")

Eject edilen her view, **her prop'u** belgeleyen bir yorum başlığıyla başlar — motorun view'ınıza verdiği veriler ve fonksiyonlar. Bunu, çalışmak için elinizdeki malzemelerin listesi olarak düşünün. İşte blaze-theme'in `HomeView`'ından gerçek bir alıntı:

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

## View'larınızın içindeki eklenti API'si

Kurulu eklentiler, **view'ların içinde** yaşayan işaretçiler aracılığıyla sayfada görünür. İki tür vardır:

- **`<Hook>` işaretçileri** — eklentilerin kendi bileşenlerini enjekte edebileceği adlandırılmış alanlar. Bir hook, markup'ta `<Hook name="page:home:top" />` şeklinde görünür. Motorun view'ları bugün şu hook adlarını taşır:

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

- **Adlarınızı ad alanına alın (namespace).** Motor hook'larıyla veya başka bir temanınkiyle asla çakışamamaları için onları temanızın `id`'siyle başlatın (`my-theme:…`).
- **Mevcut adları yeniden kullanmayın.** Yukarıdaki tablodaki yerleşik adların, eklentilerin dayandığı sabit bir anlamı vardır — eski adları başka bir yerde yeniden kullanmak yerine yeni adlar ekleyin.

Bir kez gönderdikten sonra, özel hook'larınıza bir söz gibi davranın: eklentiler onlara dayanmaya başlayabilir, bu yüzden onları tıpkı yerleşik olanlar gibi temanızın gelecekteki sürümlerinde koruyun.

### SSR ve eklenti yüklemesi — eklenti verisi nereden gelir

Eklenti içeriği sonradan tarayıcıda üzerine cıvatalanmaz — bu, **sunucu tarafı render'ın (SSR)** bir parçasıdır: bir sayfa sunucuda render edildiğinde, hook'lara bağlanan eklenti bileşenleri de onunla birlikte render edilir, böylece ziyaretçiler (ve arama motorları) ilk yanıtta tam sayfayı alır.

Perde arkasında bunu iki eklenti API'si mümkün kılar ve her ikisi de **motorun controller'ları** tarafından çalıştırılır — temanız onları asla çağırmaz, ama var olduklarını bilmek faydalıdır:

- **Hook `load()` fonksiyonları.** Bir hook'a bağlanan bir eklenti bileşeni kendi `load()`'unu dışa aktarabilir; motor bunu sayfanın yüklenmesi sırasında çalıştırır (SSR için sunucuda, gezinirken istemcide) ve sonuçları bileşene otomatik olarak **`hookProps`** olarak iletir — bazı view başlıklarının `data`'sında `hookProps`'un listelendiğini fark etmiş olabilirsiniz. Siz hiçbir şey yapmadan akıp gelir.
- **Yaşam döngüsü olayları.** Eklentiler ayrıca, bir sayfanın verisi hazırlanırken motorun tetiklediği yükleme zamanı olaylarına da abone olabilir — `theme:app:load`, `theme:navbar:load`, `theme:profile:load`, `theme:post-detail:load`, `theme:support:load`, `theme:tickets:load`, `theme:settings:load` ve benzerleri. Örneğin eklentiler, öğeleri navbar'a sayfa yüklendikten sonra belirmek yerine sunucuda render edilen HTML'de görünecek kadar erken bu şekilde ekler.

Bunun bir tema yazarı olarak sizin için anlamı:

- **Bağlanacak hiçbir şey yok** — geçersiz kıldığınız view'lar bağlama noktalarını koruduğu sürece, SSR dahil yukarıdakilerin hepsi çalışmaya devam eder.
- **Özel hook'lar hakkında dürüst bir uyarı:** sunucu tarafı `load()` hattı yalnızca **yerleşik** hook adları için çalışır. Eklediğiniz özel bir hook'a (örneğin `my-theme:hero:bottom`) bağlanan bir eklenti yine de render edilir — SSR dahil — ama `load()` verisi motor tarafından hazırlanmaz, bu yüzden böyle eklentiler verilerini genellikle istemcide çeker.

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

## Dürüst bir not

Bu katman **temel Svelte** gerektirir — view'ların yazıldığı şablon dilidir. Daha önce hiç kullanmadıysanız, resmi [Svelte eğitimi](https://svelte.dev/tutorial) kısa ve etkileşimlidir ve bir view'ın kullandığı her şeyi kapsar.

Unutmayın: asla boş bir sayfadan başlamazsınız. Eject edilen her view, gerçek tasarımın çalışan bir kopyasıdır — düzenlersiniz, yenilersiniz ve tekrarlarsınız.

## Sırada ne var?

Temanız istediğiniz gibi göründüğünde, [Başlangıç](../getting-started) rehberi derleme, sözleşme kontrolü, paketleme ve gönderme işlemlerini kapsar.
