# İlk Temanı Yap

Pano tema el kitabına hoş geldin. Bu bir **yemek kitabı**: her özelliği soyut olarak anlatmak yerine, boş bir klasörden başlayıp Marketplace'te yayınlanmış bir temaya kadar **birlikte gerçek bir tema** inşa ediyoruz.

Sonunda her adımı en az bir kez kendin yapmış olacaksın — ve daha derine inmek istediğinde tam olarak nereye bakacağını bileceksin.

::: tip Referans mı, el kitabı mı
[Tema Geliştirme](/tr/theme/getting-started/) bölümü **referanstır** — her konuyu eksiksiz anlatır. Bu el kitabı ise **rehberli yapımdır**. Bir adımda daha fazla derinlik istediğinde, seni ilgili referans sayfasına doğrudan yönlendiririz. Buradaki hiçbir şey ona ters düşmez; sadece onun içinden tek, somut bir yol yürüyoruz.
:::

## İnşa edeceğimiz tema: **Ember**

Örnek projemizle tanışın. **Ember**, dostane bir survival Minecraft sunucusu için bir temadır. Kişiliği:

- **Sıcak turuncu** bir palet — kamp ateşlerini ve alacakaranlıktaki lavı düşünün.
- Yuvarlak hatlı, samimi bir his.
- Oyuncuları karşılayan ve en son haberleri gösteren bir ana sayfa.
- Sunucunun konuştuğu her dile çevrilmiş kendi sloganı.

Baştan sona kullanacağımız kimliği:

| Alan | Değer |
|---|---|
| `id` | `ember` |
| `title` | Ember |
| Karakter | sıcak, samimi survival sunucusu |
| Vurgu rengi | sıcak bir turuncu (`#ff6a3d`) |

::: warning `id` sonsuza kadardır
Tema `id`'sini bilerek `ember` seçtik ve yayınladıktan sonra **onu asla değiştirmeyeceğiz** — yeni bir `id`, Pano için bambaşka bir tema sayılır. Ayrıca asla `vanilla-theme` olamaz. Bunun hakkında daha fazlası [Derleme ve Paketleme](/tr/theme/packaging/) sayfasında.
:::

## Neye ihtiyacın var

Her Pano teması gibi üç şey:

| İhtiyacın olan | Nedir |
|---|---|
| **Bun** | Pano frontend'lerini kurar ve çalıştırır. [bun.sh](https://bun.sh) adresinden edinin. |
| **Çalışan bir Pano** | Çalışırken temanız canlı bir Pano ile konuşur. Henüz yoksa önce [Kurulum](/tr/platform/installation/) sayfasını izleyin — temanız bir şey gösterebilmeden önce Pano ayakta olmalı. |
| **Bir kod editörü** | [VS Code](https://code.visualstudio.com/) gibi beğendiğiniz herhangi bir editör. |

Uzman olmanıza **gerek yok**. Biraz HTML, CSS ve Svelte yardımcı olur, ama buradaki her adım kopyala-yapıştır yapılabilir. Nazik bir giriş isterseniz [Svelte eğitimi](https://svelte.dev/tutorial) ve [MDN](https://developer.mozilla.org/) mükemmel ve ücretsizdir.

## Yol haritası

İşte tüm yolculuk. Her adım bir sayfadır ve her sayfa bir sonrakine giden bir bağlantıyla biter.

1. **[Kurulum](/tr/handbook/theme/setup/)** — araçları kurun, Ember'ı iskeletleyin, Pano'ya bağlayın ve tarayıcınızda canlı görün.
2. **[Tasarım ve Stiller](/tr/handbook/theme/design/)** — token'lar, renkler ve fontlarla Ember'a sıcak turuncu görünümünü verin.
3. **[Sayfaları Yeniden Şekillendir](/tr/handbook/theme/pages/)** — ana sayfayı devralın: görünümünü çıkarın, markup'ını düzenleyin ve eklenti slot'larını koruyun.
4. **[Çeviriler](/tr/handbook/theme/translate/)** — Ember'ın kendi metinlerini sunucunuzun konuştuğu her dile çevirin.
5. **[Yayına Çıkar](/tr/handbook/theme/ship/)** — manifest'i cilalayın, derleyin, denetleyin, paketleyin, kendi Pano'nuza kurun ve GitHub ile Marketplace'te yayınlayın (isteğe bağlı premium yol ile birlikte).

Hazır mısın? Atölyemizi kuralım.

**Sıradaki: [Kurulum →](/tr/handbook/theme/setup/)**
