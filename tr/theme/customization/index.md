# Renkler ve Stil

Bu, kendi temanıza giden **kod gerektirmeyen yoldur**. Renkleri, boşlukları ve fontları iki SCSS dosyasını düzenleyerek değiştireceksiniz — Svelte, HTML veya JavaScript gerekmez. Daha önce hiç CSS yazmadıysanız endişelenmeyin: buradaki her değişiklik "bir değeri bul, değeri değiştir, yenile" kadar basittir.

::: tip
Bu katman hiç Svelte veya JavaScript gerektirmez. Tek bir renk değişikliği bile gözle görülür şekilde farklı bir tema üretir — ve yalnızca tema çekirdeğinin zaten anladığı değerleri ayarladığınız için, **tema çekirdeği güncellemeleri temanızı asla bozmaz**.
:::

## Düzenleyeceğiniz iki dosya

Bu sayfadaki her şey temanızın içindeki iki dosyada gerçekleşir:

| Dosya | Ne işe yarar |
|---|---|
| `src/styles/tokens.scss` | Tema çekirdeğinin kullandığı her renk ve font değişkeninin bir **menüsü**. Bir satırın yorumunu kaldırın ve değerini değiştirin. |
| `src/styles/style.scss` | Kendi **ek** CSS'inizin gittiği yer; tema çekirdeğinin stillerinden sonra gelir. |

## tokens.scss — değerlerin menüsü

Bir tema iskelesi oluşturduğunuzda, `src/styles/tokens.scss` **tema çekirdeğinin kullandığı her değişkenin yorum satırına alınmış bir menüsü** olarak gelir — `$primary` ve `$secondary` gibi renkler, fontlar ve adlandırılmış koyu temalar. Her satır `//` ile başlar; bu "kapalı" anlamına gelir. Birini kullanmak için:

1. Dosyada istediğiniz değişkeni bulun.
2. Satırının başındaki `//` işaretini kaldırın (buna *yorumu kaldırmak* denir).
3. Değeri istediğinizle değiştirin.
4. Dosyayı kaydedin ve tarayıcıyı yenileyin.

Her tema çekirdeği değişkeni `!default` ile tanımlanmıştır; bu, "**sizin değeriniz her zaman kazanır**" demenin süslü bir yoludur. Tema çekirdeğiyle asla mücadele etmeniz gerekmez.

### Örnek 1 — birincil rengi değiştirin

Birincil renk, temanın ana vurgusudur — düğmeler, bağlantılar, öne çıkanlar. Değiştirin, tüm site yeniden renklenir:

```scss
// src/styles/tokens.scss
$primary: #ff5722;
```

### Örnek 2 — köşe yarıçapını değiştirin

Köşe yarıçapı bir `tokens.scss` değişkeni değildir. `--pano-radius` ailesini kendi CSS'inizde (`src/styles/style.scss`, import'ların altında) ayarlayın; her varsayılan view ve motorun kendi view'ları onu okur:

```scss
// src/styles/style.scss — import'lardan sonra
:root {
  --pano-radius: 12px;
  --pano-radius-sm: 8px;
  --pano-radius-lg: 18px;
}
```

Daha büyük bir sayı daha yumuşaktır; `0` köşelidir. Aşağıdaki [`--pano-*` token'ları](#the-pano-tokens) bölümüne bakın.

### Örnek 3 — fontu değiştirin

Site genelinde kullanılan temel fontu ayarlayın. Kullanılabilir olduğundan emin olduğunuz bir font kullanın (web'de güvenli bir font veya kendinizin yüklediği bir font):

```scss
// src/styles/tokens.scss
$font-family-base: "Inter", sans-serif;
```

::: tip
Her satırın yorumunu kaldırmanız **gerekmez**. Yalnızca önemsediğiniz birkaç değeri değiştirin ve gerisini yorum satırında bırakın — tema çekirdeği, dokunmadığınız her şey için makul varsayılanları doldurur.
:::

## `--pano-*` token'ları {#the-pano-tokens}

SCSS menüsüne ek olarak bir tema `--pano-*` adlı **34 CSS değişkeni** okur: renkler (`--pano-color-bg`, `--pano-color-text`, `--pano-color-primary`, `--pano-color-border`...), köşe yarıçapları (`--pano-radius`, `-sm`, `-lg`, `-pill`), `--pano-border-width`, gölgeler (`--pano-shadow-sm`, `--pano-shadow`, `--pano-shadow-lg`), fontlar (`--pano-font-body`, `--pano-font-heading`, `--pano-font-mono`, `--pano-font-size`...) ve `--pano-space`. Bootstrap'li bir temada ilgili Bootstrap değişkenini yansıtırlar. Eklentiler varsayılan view'larını aynı değişkenlerle biçimlendirir; böylece tek bir değer kümesi eklentileri de yeniden renklendirir:

```css
:root { --pano-color-primary: #7c3aed; --pano-radius: 0.5rem; }
```

Her eklenti view'ı ayrıca anlamsal sınıflar taşır (`market-product-card__title`). Sizin CSS'iniz katmanlı değildir, bu yüzden eklentinin yedek stillerini ezer: `.market-product-card__title { margin: 1rem }` doğrudan çalışır. Bootstrap'siz tema [View'lar](/tr/theme/views/#themes-without-bootstrap) sayfasında anlatılır.

## style.scss — kendi ek CSS'iniz

`tokens.scss`, tema çekirdeğinin zaten bildiği değerleri kapsar. Kendi CSS'inizi eklemek istediğinizde — tema çekirdeğinin bir değişkene sahip olmadığı bir şey — bunu **dosyanın en üstündeki içe aktarmalardan sonra** `src/styles/style.scss` içine koyun. Oraya eklediğiniz her şey en son yüklenir, böylece tema çekirdeğinin stillerinin üzerine katmanlanır.

Örneğin, kartlara daha güçlü bir gölge vermek için:

```scss
// src/styles/style.scss — içe aktarmalardan sonra

.section-card {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}
```

::: warning
CSS'inizi mevcut `@use` / `@import` satırlarının **altına** ekleyin, asla üstüne değil. Kurallarınızın üzerine inşa edilebilmesi için tema çekirdeğinin stilleri önce yüklenmelidir.
:::

## Değişikliklerinizi canlı görmek

SCSS, derlemenin geri kalanından ayrı olarak CSS'e derlenir. Bunu iki komut karşılar:

- **Çalışırken canlı izleme** — her kaydettiğinizde otomatik olarak yeniden derler:

  ```sh
  bun run dev:ui
  ```

- **Tek seferlik derleme** — stilleri bir kez derleyin (tam bir derlemeden önce yararlıdır):

  ```sh
  bun run build:ui
  ```

`bun run dev:ui` çalışırken döngü basitçe şudur: bir değeri düzenleyin, kaydedin ve tarayıcının güncellendiğini izleyin.

## Sırada ne var?

Bir renk ve font değişikliği yeterli olmadığında — bir sayfanın **düzeninin veya markup'ının** farklı olmasını istediğinizde — bir sayfanın görünümünün sahipliğini nasıl alacağınızı gösteren [Sayfa Tasarımlarını Değiştirme](../views) bölümüne geçin.
