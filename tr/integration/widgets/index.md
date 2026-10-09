# Widget'lar

Widget, bir Pano eklentisinin (hedef çubuğu, en iyi destekçiler, mağaza istatistikleri) özel bir HTML etiketi olarak herhangi bir web sayfasına bırakabileceğiniz parçasıdır. Kendi verisini ve kendi stilini getirir.

## Gömme

```html
<script type="module" src="https://pano.example.com/api/v1/widgets/loader.js"></script>
<pano-market-goal></pano-market-goal>
```

Yükleyici küçüktür. Pano'ya hangi widget'ların olduğunu sorar, sonra bir widget'ı etiketi sayfada ilk göründüğünde yükler; sonradan eklenen etiketler de dahildir. Bilinmeyen `pano-*` etiketleri yok sayılır.

Pano'nuzun neler sunduğunu görün:

```sh
curl http://localhost:8088/api/v1/widgets/index.json
```

Etiketler `pano-<eklenti kısa adı>-<widget>` biçimindedir. Etkin olmayan eklentinin widget'ı yoktur ve etiketleri boş kalır.

## Stil

Widget'lar bir shadow root içinde durur ve varsayılan görünümü Pano'nun tasarım belirteçlerinden alır. Sayfanızdan CSS değişkenleriyle, sayfada ya da tek bir öğede stilleyin:

```css
:root { --pano-color-primary: #e33; }
pano-market-goal { --pano-color-primary: #28a; }
```

Paleti betikte ya da bir öğede ayarlayın: `data-palette="dark"` (varsayılan `light`). Metin dili betikteki `data-locale` değerini, yoksa sitenin dilini izler.

Daha derin değişiklikler için her widget parçası `part` ile açılır:

```css
pano-market-goal::part(market-goal__bar) { border-radius: 0; }
```

Bir widget'ı normal sayfada çizmek için `no-shadow` özniteliğini ekleyin; sayfanızın CSS'i içeri ulaşır.

## Öznitelikler

Widget'ın basit ayarları (metin, sayı, anahtar) kebab-case özniteliklerdir; `/api/v1/widgets/index.json` içindeki widget listesi bunları `attrs` altında adlandırır. Daha karmaşık her şey öğe oluştuktan sonra özellik olarak atanır:

```js
document.querySelector('pano-market-goal').someSetting = 'value';
```

Bir özniteliği değiştirmek widget'ı yeniden yüklemeden günceller.

## Olaylar

Olaylar kabarır ve shadow sınırını geçer:

| Olay | Ne zaman | Ayrıntı |
|---|---|---|
| `pano:ready` | Veri yüklendi, widget gösterildi | yok |
| `pano:error` | Yükleme başarısız | `{ code }` |
| `pano:toast` | Widget bir mesaj göstermek istiyor | metin, varyant |
| `pano:navigate` | Widget bir sayfaya gitmek istiyor | `{ url }` |

`pano:toast` ve `pano:navigate`, `preventDefault()` ile iptal edilebilir; böylece sayfanız ilgilenir:

```js
document.addEventListener('pano:navigate', (e) => { e.preventDefault(); router.go(e.detail.url); });
```

Widget bağlantılarını URL haritasıyla kendi sayfalarınıza yönlendirin:

```js
window.PanoWidgets.configure({ urls: { 'market.store': '/shop', 'market.order': '/shop/o/{id}', 'auth.login': '/login' } });
```

## Hangi adresi kullanmalı

| Sayfanız | Yükleyici adresi | Ziyaretçi girişi |
|---|---|---|
| Pano'nun kendi adresinde | `https://pano.example.com/api/v1/widgets/loader.js` | Çerez, çalışır |
| [İzinli bir kaynakta](../access/) | Aynı | Çerez, çalışır |
| Başka herhangi bir alan adında | Kendi sitenizde Pano'ya ileten bir yol, örneğin `/pano/api/v1/widgets/loader.js` | Sunucunuz üzerinden (şablon bunu yapar) |

Pano CORS'u yalnızca izinli kaynaklara verir; bu yüzden yabancı alan adındaki bir sayfa widget'ları kendi vekil yolu üzerinden yükler. Yol ön ekinin arkasında yükleyici ayar istemez: `/api/v1` yolunu kendi adresinden çıkarır.

Herkese açık (anonim) widget'lar için sade bir ters vekil kuralı yeter. [Başlangıç şablonunun](../headless/) `/pano` rotası ziyaretçinin oturumunu da iletir.

## Eklenti yazarları için

Bir blok view'ını metadata içinde widget olarak işaretleyin, gerisini derleme yapar:

```svelte
<script module>export const view = { widget: true };</script>
```
