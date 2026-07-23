# İlk Eklentini Yap

Pano eklenti el kitabına hoş geldin. Bu bir **yemek kitabı**: her özelliği soyut olarak anlatmak yerine, hazır şablondan başlayıp Marketplace'te yayınlanmış bir eklentiye kadar **birlikte gerçek bir eklenti** inşa ediyoruz.

Sonunda her adımı en az bir kez kendin yapmış olacaksın — ve daha derine inmek istediğinde tam olarak nereye bakacağını bileceksin.

::: tip Referans mı, el kitabı mı
[Eklenti Geliştirme](/tr/addon/getting-started/) bölümü **referanstır** — her konuyu eksiksiz anlatır. Bu el kitabı ise **rehberli yapımdır**. Bir adımda daha fazla derinlik istediğinde, seni ilgili referans sayfasına doğrudan yönlendiririz. Buradaki hiçbir şey ona ters düşmez; sadece onun içinden tek, somut bir yol yürüyoruz.
:::

::: tip Eklenti ve plugin aynı şeydir
Eklentiler, Pano *plugin*'leridir — kod düzeyindeki adların hepsi `plugin` sözcüğünü kullanır (`PanoPlugin`, `pluginId` vb.). Bu el kitabı düz metinde **eklenti** der, ama kodda `plugin`'i görmeye devam edeceksin. Bu beklenen bir durumdur; hiçbir şey yeniden adlandırılmamıştır.
:::

## İnşa edeceğimiz eklenti: **Shoutbox**

Örnek projemizle tanışın. **Shoutbox**, topluluğunuzun sunucunuzun sitesine kısa mesajlar — "shout"lar — bırakmasını sağlayan minik bir eklentidir. Ne yapar:

- Ziyaretçiler, ana sayfanın en üstündeki küçük bir widget'ta **en son shout'ları** görür.
- Yöneticiler, bir izinle korunarak panelden shout **yayınlar ve kaldırır**.
- Sunucunuzun konuştuğu her dile çevrilmiş kendi metnini taşır.

Bir eklenti, birlikte çalışan iki yarısı olan tek bir **JAR dosyasıdır**:

- Pano sunucusunun içinde çalışan bir **Kotlin backend'i** — veritabanı tablosuna, JSON API'ye ve izne sahiptir.
- Tarayıcıda çalışan bir **Svelte arayüzü** — ana sayfa widget'ı ve panel yönetim sayfası.

Baştan sona kullanacağımız kimliği:

| Alan | Değer |
|---|---|
| `pluginId` | `pano-plugin-shoutbox` |
| `pluginName` | Shoutbox |
| Ana sınıf | `com.panomc.plugins.shoutbox.ShoutboxPlugin` |

::: warning `pluginId` sonsuza kadardır
`pano-plugin-shoutbox`'ı `pluginId` olarak bilerek seçtik ve yayınladıktan sonra **onu asla değiştirmeyeceğiz** — Pano onu perde arkasında birçok yere gömer ve aynı zamanda Marketplace kaynak (resource) kimliğiniz olarak da iş görür. Nerede kullanıldığı hakkında daha fazlası [Manifesto Yapılandırması](/tr/addon/manifest/) sayfasında.
:::

## Neye ihtiyacın var

Buradaki her şey, Pano'nun **kod yazacağınız makinenin aynısında** çalıştığını varsayar — çalışırken eklentiniz o kurulumun *içinde* yaşar.

| İhtiyacın olan | Nedir |
|---|---|
| **Bir JDK, sürüm 11 veya daha yenisi** | Gradle derlemesini çalıştırır. Herhangi bir Java 11+ işini görür — derleme, ihtiyaç duyduğu tam iç Java'yı kendi başına getirir. `java -version` ile doğrulayın. |
| **Bun** | Arayüzü kurar ve derler, ayrıca geliştirme izleyicisini çalıştırır. [bun.sh](https://bun.sh) adresinden edinin. `bun --version` ile doğrulayın. |
| **Git** | Şablonu indirir. `git --version` ile doğrulayın. |
| **Çalışan bir Pano** | Çalışırken eklentiniz canlı bir Pano ile konuşur. Henüz yoksa önce [Kurulum](/tr/platform/installation/) sayfasını izleyin — ve **Geliştirme Modu'nu açın** (bunu sonraki sayfada yapacağız). |
| **Bir kod editörü** | Her şey işe yarar, ama Kotlin için tam bir IDE baş ağrısından kurtarır — [IntelliJ IDEA Community](https://www.jetbrains.com/idea/download/) ücretsizdir ve şablonun proje dosyalarıyla birlikte gelir. |

Uzman olmanıza **gerek yok**. Biraz Kotlin ve biraz Svelte yardımcı olur, ama buradaki her adım kopyala-yapıştır yapılabilir. Nazik bir giriş isterseniz [Svelte eğitimi](https://svelte.dev/tutorial) mükemmel ve ücretsizdir.

## Yol haritası

İşte tüm yolculuk. Her adım bir sayfadır ve her sayfa bir sonrakine giden bir bağlantıyla biter.

1. **[Kurulum](/tr/handbook/addon/setup/)** — araçları kurun, şablonu klonlayıp yeniden adlandırın, derleyin ve Shoutbox'ı **Panel → Eklentiler**'de listelenmiş görün.
2. **[Backend](/tr/handbook/addon/backend/)** — Shoutbox'a bir hafıza ve bir API verin: bir veritabanı tablosu, bir JSON uç noktası ve bir izin.
3. **[Frontend](/tr/handbook/addon/frontend/)** — shout'ları ana sayfada gösterin, sonra bunları yönetmek için bir panel sayfası ekleyin.
4. **[Çeviriler](/tr/handbook/addon/translate/)** — Shoutbox'ın metnini yerel ayar dosyalarına taşıyın ve birden fazla dil konuşun.
5. **[Yayına Çıkar](/tr/handbook/addon/ship/)** — yayın jar'ını derleyin, sürümleme ve yayınları otomatikleştirin ve GitHub ile Marketplace'te yayınlayın (isteğe bağlı premium yol ile birlikte).

Hazır mısın? Atölyemizi kuralım.

**Sıradaki: [Kurulum →](/tr/handbook/addon/setup/)**
