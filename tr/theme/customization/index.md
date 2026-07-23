# Renkler ve Stil

Bu, kendi temanıza giden **kod gerektirmeyen yoldur**. Renkleri, boşlukları ve fontları iki SCSS dosyasını düzenleyerek değiştireceksiniz — Svelte, HTML veya JavaScript gerekmez. Daha önce hiç CSS yazmadıysanız endişelenmeyin: buradaki her değişiklik "bir değeri bul, değeri değiştir, yenile" kadar basittir.

::: tip
Bu katman hiç Svelte veya JavaScript gerektirmez. Tek bir renk değişikliği bile gözle görülür şekilde farklı bir tema üretir — ve yalnızca motorun zaten anladığı değerleri ayarladığınız için, **motor güncellemeleri temanızı asla bozmaz**.
:::

## Düzenleyeceğiniz iki dosya

Bu sayfadaki her şey temanızın içindeki iki dosyada gerçekleşir:

| Dosya | Ne işe yarar |
|---|---|
| `src/styles/tokens.scss` | Motorun kullandığı her renk, font ve köşe yarıçapının bir **menüsü**. Bir satırın yorumunu kaldırın ve değerini değiştirin. |
| `src/styles/style.scss` | Kendi **ek** CSS'inizin gittiği yer; motorun stillerinden sonra gelir. |

## tokens.scss — değerlerin menüsü

Bir tema iskelesi oluşturduğunuzda, `src/styles/tokens.scss` **motorun kullandığı her değişkenin yorum satırına alınmış bir menüsü** olarak gelir — `$primary` ve `$secondary` gibi renkler, köşe yarıçapı, fontlar ve adlandırılmış koyu temalar. Her satır `//` ile başlar; bu "kapalı" anlamına gelir. Birini kullanmak için:

1. Dosyada istediğiniz değişkeni bulun.
2. Satırının başındaki `//` işaretini kaldırın (buna *yorumu kaldırmak* denir).
3. Değeri istediğinizle değiştirin.
4. Dosyayı kaydedin ve tarayıcıyı yenileyin.

Her motor değişkeni `!default` ile tanımlanmıştır; bu, "**sizin değeriniz her zaman kazanır**" demenin süslü bir yoludur. Motorla asla mücadele etmeniz gerekmez.

### Örnek 1 — birincil rengi değiştirin

Birincil renk, temanın ana vurgusudur — düğmeler, bağlantılar, öne çıkanlar. Değiştirin, tüm site yeniden renklenir:

```scss
// src/styles/tokens.scss
$primary: #ff5722;
```

### Örnek 2 — köşe yarıçapını değiştirin

Köşe yarıçapı, köşelerin ne kadar yuvarlak olduğunu kontrol eder (kartlar, düğmeler, girişler). Daha büyük bir sayı daha yumuşak ve yuvarlaktır; `0` tamamen köşelidir:

```scss
// src/styles/tokens.scss
$radius: 12px;
```

### Örnek 3 — fontu değiştirin

Site genelinde kullanılan temel fontu ayarlayın. Kullanılabilir olduğundan emin olduğunuz bir font kullanın (web'de güvenli bir font veya kendinizin yüklediği bir font):

```scss
// src/styles/tokens.scss
$font-family-base: "Inter", sans-serif;
```

::: tip
Her satırın yorumunu kaldırmanız **gerekmez**. Yalnızca önemsediğiniz birkaç değeri değiştirin ve gerisini yorum satırında bırakın — motor, dokunmadığınız her şey için makul varsayılanları doldurur.
:::

## style.scss — kendi ek CSS'iniz

`tokens.scss`, motorun zaten bildiği değerleri kapsar. Kendi CSS'inizi eklemek istediğinizde — motorun bir değişkene sahip olmadığı bir şey — bunu **dosyanın en üstündeki içe aktarmalardan sonra** `src/styles/style.scss` içine koyun. Oraya eklediğiniz her şey en son yüklenir, böylece motorun stillerinin üzerine katmanlanır.

Örneğin, kartlara daha güçlü bir gölge vermek için:

```scss
// src/styles/style.scss — içe aktarmalardan sonra

.section-card {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}
```

::: warning
CSS'inizi mevcut `@use` / `@import` satırlarının **altına** ekleyin, asla üstüne değil. Kurallarınızın üzerine inşa edilebilmesi için motorun stilleri önce yüklenmelidir.
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
