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

## Eklenti bağlantı noktalarını koruyun

::: warning
Bir view'daki iki tür işaretçi, **eklentilerin** sayfada göründüğü yerdir: `<ViewComponent>` slot'ları ve `<Hook>` işaretçileri. Bir view'ı yeniden tasarladığınızda, **her birini koruyun** — taşıyın, etraflarını yeniden stillendirin, ancak silmeyin. Birini kaldırırsanız, ona güvenen herhangi bir eklenti kullanıcılarınızın sitelerinden sessizce kaybolur. Bir bağlantı noktası eksikse `bun run check` başarısız olur, böylece araç, bozuk bir tema gönderemeden önce sizi korur.
:::

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
