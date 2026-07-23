# Tasarım ve Stiller

Ember canlı ve turuncu. Şimdi onun gerçekten *Ember gibi hissettirmesini* sağlayalım — sıcak, samimi ve şüphesiz kendine özgü. Bu sayfanın tamamı **kod gerektirmeyen yoldur**: yalnızca iki SCSS dosyasındaki değerleri değiştiriyoruz. Svelte gerekmez.

Önceki sayfadan `bun run dev` çalışır durumda kalsın ve stillerinizin kaydettiğiniz anda yeniden derlenmesi için ikinci bir terminalde `bun run dev:ui` açın:

```sh
bun run dev:ui
```

Bu dosyaların tam referansı için [Renkler ve Stiller](/tr/theme/customization/) sayfasına bakın. Burada yalnızca Ember'ın görünümünü inşa edeceğiz.

## Dokunacağınız iki dosya

| Dosya | Ne işe yarar |
|---|---|
| `src/styles/tokens.scss` | Motorun kullandığı her renk, font ve köşe yarıçapının bir **menüsü**. Bir satırın yorumunu kaldırın, değerini değiştirin. |
| `src/styles/style.scss` | Motorun stillerinin üzerine katmanlanan, size ait **ekstra** CSS. |

## Adım 1 — Ember'ın paletini ayarlayın

`src/styles/tokens.scss` dosyasını açın. Yorum satırına alınmış bir menü olarak gelir — her satır `//` ile başlar, yani "kapalı". Bir değeri kullanmak için `//` işaretini kaldırın ve ayarlayın. Her motor değişkeni `!default` olarak bildirilir, bu yüzden **sizin değeriniz her zaman kazanır**.

`$primary`'yi zaten açtık. Kamp ateşi paletini tamamlayalım:

```scss
// src/styles/tokens.scss
$primary: #ff6a3d;    // warm ember orange
$secondary: #ffb347;  // soft flame gold
```

Kaydedin ve vurguların tüm site boyunca ısındığını izleyin.

::: tip Her şeyin yorumunu kaldırmak zorunda değilsiniz
Yalnızca önemsediğiniz birkaç değeri değiştirin. Yorum satırında bıraktığınız her satır, motorun mantıklı varsayılanını korur.
:::

## Adım 2 — köşeleri yuvarlayın

Ember samimidir, o yüzden her kartı, butonu ve girişi yumuşatalım. Köşe yarıçapı (radius) token'ını bulun ve ona daha büyük bir değer verin:

```scss
// src/styles/tokens.scss
$radius: 14px;
```

Kaydedin ve yenileyin — arayüz anında daha yuvarlak ve daha sıcak hissettirir.

## Adım 3 — Ember'a bir font verin

Site boyunca kullanılan temel fontu ayarlayın. Web'de güvenli bir font kullanın ya da kendiniz yükleyin:

```scss
// src/styles/tokens.scss
$font-family-base: "Poppins", sans-serif;
```

::: tip Özel bir font yükleme
Sayfada henüz bulunmayan bir font kullanıyorsanız, font dosyalarını `static/` içine bırakın ve `@font-face`'ini `style.scss` içinde (import'ların altına) ekleyin. Sonra yukarıdaki token'da ona referans verin.
:::

## Adım 4 — son dokunuşu style.scss içinde ekleyin

Token'lar, motorun zaten bildiği değerleri kapsar. Motorun **hiç değişkeni olmayan** bir şey istediğinizde, kendi CSS'inizi `src/styles/style.scss` içine, **en üstteki import'ların altına** koyun.

Ember'ın kartlarına sıcak, parlayan bir gölge verelim:

```scss
// src/styles/style.scss — after the @use / @import lines

.section-card {
  box-shadow: 0 8px 28px rgba(255, 106, 61, 0.18);
}
```

Kaydedin ve yenileyin. **Şimdi görmelisiniz** ki kartlar yumuşak turuncu bir parıltıyla sayfadan yukarı kalkıyor.

::: warning CSS'inizi import'ların altına ekleyin, asla üstüne değil
Kurallarınızın üzerine inşa edebilmesi için motorun stilleri önce yüklenmelidir. Import'ların üstüne koyduğunuz her şey ezilecektir.
:::

## Nerede olduğumuz

Ember artık paletine, yuvarlak köşelerine, fontuna ve bir parıltıya sahip — hepsi bir satır Svelte yazmadan. Çoğu tema için bu, halihazırda bitmiş, yayınlanabilir bir görünümdür.

Ama Ember'ın ana sayfası hâlâ varsayılan düzeni kullanıyor. Onu yeniden şekillendirelim.

**Sıradaki: [Sayfaları Yeniden Şekillendir →](/tr/handbook/theme/pages/)**
