# Sayfaları Yeniden Şekillendir

Renkler ve fontlar Ember'ı epey ileriye taşıdı. Şimdi **ana sayfanın kendisinin** farklı görünmesini istiyoruz — sıcak bir karşılama banner'ı, altında haberler. Bu, bir sayfanın **görünümünü** (view) — markup'ını ve düzenini — değiştirmek demektir.

Bu, **temel Svelte** gerektiren tek adımdır. Panik yapmayın: asla boş bir sayfadan başlamazsınız — gerçek tasarımın çalışan bir kopyasını düzenlersiniz. Svelte sizin için yeniyse, [Svelte eğitimi](https://svelte.dev/tutorial) bir görünümün kullandığı her şeyi kapsar.

Tam referans: [Sayfa Tasarımlarını Değiştirme](/tr/theme/views/).

## Fikir tek cümlede

Her sayfa **mantık** (veri yükleme, girişler, eklentiler — bunlara motor sahiptir) artı bir **görünümden** (nasıl göründüğü — değiştirmesi sizin) oluşur. Herhangi bir görünümün *görünüşünü*, *mantığına* dokunmadan devralabilirsiniz.

## Adım 1 — hangi görünümlerin olduğunu görün

Devralabileceğiniz her görünümü, her birinin aldığı veriyle birlikte listeleyin:

```sh
bunx @panomc/theme-core list-views
```

Tüm seti göreceksiniz — home, login, register, profile ve daha fazlası. Biz `HomeView` olan ana sayfayı istiyoruz.

## Adım 2 — HomeView'ı çıkarın (eject)

Bir görünümün sahipliğini almak için onu **çıkarın** (eject). Bu, motorun varsayılan `HomeView`'ını kendi `src/views/` klasörünüze kopyalar ve `theme.config.js` içinde kaydeder:

```sh
bunx @panomc/theme-core eject-view HomeView
```

Artık serbestçe düzenleyebileceğiniz, çalışan bir `src/views/HomeView.svelte`'e sahipsiniz — gerçek, işleyen bir kopya.

## Adım 3 — önce başlığı okuyun

`src/views/HomeView.svelte` dosyasını açın. Motorun görünümünüze verdiği **her prop'u** listeleyen bir yorum başlığıyla başlar — bunları çalışmak için elinizdeki malzemeler olarak düşünün. Şuna benzer:

```svelte
<!--
  @view HomeView
  Props:
    data.posts       array — posts of the current page
    data.postCount   number — total number of posts
    data.page        number — current page number
    data.totalPage   number — total page count for pagination
    themeSettings    object — theme settings from context
    onPageClick      function(data, page) — pagination handler
-->
```

Başlık ne listeliyorsa elinizdeki odur. Store'lar store nesneleri olarak gelir (bunları `$_` gibi bir `$` önekiyle okuyun); action'lar çağırdığınız fonksiyonlar olarak gelir.

## Adım 4 — Ember'ın karşılama banner'ını ekleyin

Haber listesinin üstüne sıcak bir hero ekleyelim. Markup'ın en üstünü bulun ve bir banner ekleyin:

```svelte
<section class="ember-hero">
  <h1>Welcome to Ember SMP</h1>
  <p>Grab a torch. Your adventure starts at the campfire.</p>
</section>
```

Sonra `src/styles/style.scss` içinde (import'ların altında) ona biraz stil verin:

```scss
.ember-hero {
  padding: 3rem 1.5rem;
  text-align: center;
  background: linear-gradient(135deg, #ff6a3d, #ffb347);
  border-radius: 14px;
  color: #fff;
}
```

Kaydedin ve yenileyin. **Şimdi görmelisiniz** ki haber akışının üstünde parlayan turuncu bir karşılama banner'ı oturuyor.

::: tip Şimdi sabit yazılmış, sonra çevrilebilir
Banner metnini şimdilik doğrudan markup'a yazdık. Sonraki sayfada bu metinleri çeviri dosyalarına taşıyacağız; böylece Ember her ziyaretçiyi kendi dilinde karşılayacak.
:::

## Adım 5 — eklenti slot'larını koruyun

Bu, bozmamanız gereken tek kuraldır. Görünümler **eklenti bağlama noktaları** içerir — `<ViewComponent>` slot'ları ve `<Hook>` işaretçileri — ve kurulu eklentiler sayfada işte orada belirir. Yeniden tasarlarken, **her birini koruyun**. Onları taşıyın, etraflarını yeniden stillendirin, ama asla birini silmeyin.

::: warning Bir slot'u atarsan, bir eklentiyi kaybedersin
Bir bağlama noktasını kaldırırsanız, ona güvenen herhangi bir eklenti kullanıcılarınızın sitelerinden sessizce kaybolur. Serbestçe yeniden düzenleyin, ama hepsini koruyun.
:::

## Adım 6 — çalışmanızı denetleyin

Motor, bozuk bir tema yayınlamanızdan önce eksik bir eklenti slot'unu (ve daha fazlasını) yakalayan bir güvenlik ağıyla gelir:

```sh
bun run check
```

Yeşil bir `check`, görünümünüzün hâlâ sözleşmesine sadık kaldığı anlamına gelir. Eksik bir bağlama noktasından şikayet ederse, geri koyun ve tekrar çalıştırın.

::: tip Site sahibi için yeni ayarlar ekleme
Yeniden tasarımınız site sahibinin panelden kontrol etmesi gereken bir seçenek eklerse (diyelim özel bir hero başlığı), bu `theme.config.js` içinde `settingsSchema` altında bildirilmelidir, yoksa girdi kaydedilmez. [Sayfa Tasarımlarını Değiştirme](/tr/theme/views/#custom-theme-settings) referansı tam şeklini gösterir.
:::

Ember'ın ana sayfası artık kendi şekline sahip. Sözcüklerinin her dili konuşmasını sağlayalım.

**Sıradaki: [Çeviriler →](/tr/handbook/theme/translate/)**
