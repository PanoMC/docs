# Market Eklentisi

**Market** eklentisi, kendi barındırdığınız Pano sitenize tam bir web mağazası ekler. Yönetim panelinden bir ürün kataloğu oluşturup yönetirsiniz — ürünler, hiyerarşik kategoriler, karşılaştırma tabloları, hediye kodları, otomatik indirimler, kupon ve içerik üretici (creator) kodları, siparişler ve ayrıntılı satış istatistikleri — ve mağazanın nasıl göründüğünü ve hangi ödeme geçitlerini sunduğunu yapılandırırsınız. Ziyaretçiler, temanızda arama, öne çıkanlar ve en çok satanlar bölümleri, ürün detayları, karşılaştırmalar ve bir sepet içeren herkese açık bir **Mağaza** sayfasına göz atar. Pano ekibi tarafından geliştirilmiştir, kullanımı ücretsizdir ve açık kaynaklıdır.

::: warning Satış henüz aktif değil — ödemeler yakında geliyor
Bugün Market, çalışan bir ödeme sistemi değil, eksiksiz bir **mağaza kataloğu ve yönetim sistemidir**. Yönetim tarafı bitmiş ve cilalanmıştır, ancak henüz hiçbir şey gerçekten satılamaz: mağaza vitrinindeki **Ödeme** düğmesi *"Ödeme yakında geliyor"* notuyla devre dışıdır, hiçbir sipariş oluşturulamaz, yapılandırılan ödeme geçitleri hiçbir ücret almaz, hediye ve kupon kodlarının ziyaretçi kullanım akışı yoktur ve ürün **teslimat işlemleri** saklanır ama asla yürütülmez. Mağazanızı şimdi kurun, ödeme akışı yayınlandığında satışı açın.
:::

## Özellikler

- **Ürünler:** Ad, slug, açıklama, kategori, ayrı **para** ve **kredi** fiyatları, isteğe bağlı stok, ön koşul ürünler (tümü-gerekli veya herhangi-biri-gerekli), gerekli izin, `ACTIVE` / `INACTIVE` / `HIDDEN` durumu, öne çıkan işareti, ömür boyu veya zaman aralıklı erişilebilirlik, öncelik sıralaması, bir FontAwesome simge seçici, otomatik küçük resimlerle görsel yükleme ve tek tıkla kopyalama. Her ürün, **pano-mc-plugin** aracılığıyla bağlı Minecraft sunucularını hedefleyen **teslimat işlemleri** (`CREDIT`, `PERMISSION`, `COMMAND`) taşır — *bugün saklanır ve düzenlenebilir, ancak henüz yürütülmez*.
- **Kategoriler:** Simge, renk, görsel, açıklama ve `ACTIVE` / `INACTIVE` / `HIDDEN` durumuyla hiyerarşik, sürükle-sırala bir ağaç (etkin olmayan bir alt ağaç, mağaza vitrininden tamamen kaybolur).
- **Karşılaştırmalar:** Ürün bazında evet/hayır/özel hücre değerleriyle özellik satırları içeren ürün karşılaştırma tabloları oluşturun; kopyalanabilir ve mağaza vitrininde gösterilir.
- **Hediyeler:** `PRODUCT`, `CREDIT` (bir tutar) veya `RANDOM` (bir ürün listesinden seçilen) türünde, durum ve başlangıç/bitiş tarihleriyle hediye kodları. *(Şimdilik yalnızca panel CRUD — henüz ziyaretçi kullanımı yok.)*
- **İndirimler ve Kuponlar:** Otomatik **indirimler** (yüzde veya sabit; kapsam tümü / ürünler / kategoriler; minimum tutar, tarih aralığı, kullanım limiti), kod tabanlı **kuponlar** (yüzde/sabit, ürün bazında veya tümü, minimum tutar, tarih aralığı, genel ve müşteri bazında limitler) ve komisyon yüzdesi ile izlenen kullanım sayısı ve kazançlar içeren oyuncu bazında **içerik üretici (creator) kodları**.
- **Siparişler:** `PENDING` / `COMPLETED` / `REFUNDED` / `FAILED` durumlu liste ve detay görünümleri ve sipariş bazında döviz kuru görüntüleme/yenileme/geçersiz kılma. *(Ödeme sistemi yayınlanana kadar hiçbir sipariş oluşturulamaz; bir kullanıcı hesabını silmek, kullanıcı adını finansal bir kayıt olarak korurken siparişlerini anonimleştirir.)*
- **İstatistikler:** Haftalık ve aylık gelir grafikleri, bu-hafta / bu-ay / toplam satış özetleri, en çok satan ürünler, en çok kullanılan ödeme yöntemleri ve sipariş durumu dağılımlı yakın-satış tablosu — tümü ayrı bir **istatistik para birimi** üzerinden görüntülenebilir.
- **Para birimi ve döviz:** Satış ve istatistik para birimleri (her biri `TRY` / `USD` / `EUR` / `GBP`), **AUTO** (yapılandırılabilir bir aralıkta, en az 1 saat, alınan) veya **MANUAL** olarak sürdürülen bir döviz kuru ve bir manuel-yenileme düğmesi. Her yenileme günlüğe kaydedilir.
- **Etkinlik Günlüğü:** Katalog öğelerinin her oluşturma/güncelleme/silmesi, ayar ve ödeme yöntemi değişiklikleri, sipariş ve döviz kuru değişiklikleri ve ödeme-gizli-anahtar açığa çıkarmaları Pano'nun panel etkinlik günlüğüne kaydedilir.

## Mağazayı Yönetme

Her şey, panel kenar çubuğundaki **Market** öğesinden (mağaza simgesi, İstatistikler'in hemen ardından eklenir) yönetilir:

- **/market** — İstatistik paneli.
- **/market/orders**, **/market/categories**, **/market/products**, **/market/comparisons**, **/market/gifts** — katalog ve sipariş yönetimi (oluşturma/düzenleme sayfalarıyla).
- **/market/discounts** — üç sekme: genel indirimler, kupon kodları ve içerik üretici kodları.
- **/market/settings** — üç bölüm:
  - **Genel:** mağaza adı/açıklaması, satış ve istatistik para birimleri, döviz kuru modu/aralığı, KDV yüzdesi ve fiyata dahil et, test modu, misafir ödeme, minimum sipariş tutarı, kuruşları kaldır, en-çok-satan/öne-çıkan/karşılaştırma anahtarları, satın alma e-postaları ve indirimleri-kuponlarla-birleştir.
  - **Ödemeler:** 13 geçidi etkinleştirin ve yapılandırın — Tebex, iyzico, Shopier, PayTR, Sipay, Param, Mobil Ödeme, Stripe, PayPal, Mollie, Coinbase Commerce, BTCPay Server ve Banka Havalesi.
  - **Krediler:** kredileri etkinleştir, kredi görünen adı, geri ödeme (cashback) yüzdesi ve bir "yalnızca kredi kabul et" modu.

Ayarlar, eklentinin yapılandırmasında saklanır ve tamamen panelden düzenlenir — elle düzenleme gerekmez. Varsayılanlar Türk pazarına uygundur (para birimi `TRY`, KDV %20 dahil, 6 saatlik aralıkta `AUTO` döviz, misafir ödeme açık, krediler etkin).

::: tip Gizli alanlar korunur
Ödeme API anahtarları, satıcı anahtarları ve diğer gizli bilgiler **maskeli** olarak saklanır. Birini açığa çıkarmak, yönetici şifrenizi yeniden girmenizi gerektirir ve her açığa çıkarma etkinlik günlüğüne kaydedilir.
:::

## Ziyaretçiler Ne Görür

Site gezinmesine, `/store`'a yönlendiren bir **Mağaza** bağlantısı eklenir: bir kategori kenar çubuğu (ürün sayılarıyla bir ağaç), ürün araması, açılıp kapanabilen **Öne Çıkanlar** ve **En Çok Satanlar** bölümleri, fiyat / kredi-fiyatı / stok / öne-çıkan rozetli bir ürün ızgarası, bir ürün-detay penceresi, karşılaştırma tabloları ve tarayıcıda saklanan kayan bir sepet. Kategori seçimi `?category=` ile derin bağlantı verilebilir ve mağaza adınız ile açıklamanız sayfa başlığı ve alt başlığı olarak görünür. Mağaza vitrini giriş gerektirmez. Yukarıda belirtildiği gibi, sepetin **Ödeme** düğmesi devre dışıdır — *"Ödeme yakında geliyor."*

## Ön Koşullar

- Çalışan, tamamen kurulmuş, kendi barındırdığınız bir Pano kurulumu (eklenti, kurulumun tamamlanmasını bekler).
- **AUTO** döviz kurları için giden internet erişimi.
- Ürün `COMMAND` / `PERMISSION` işlemlerini hedeflemek için **pano-mc-plugin** aracılığıyla bağlı Minecraft sunucuları.
- Etkinleştirdiğiniz her ödeme geçidi için bir satıcı hesabı ve kimlik bilgileri.

::: tip Ücretsiz ve resmi
Market, Pano ekibi tarafından geliştirilip sürdürülür ve **MIT** ile lisanslanmıştır — premium hesap veya lisans anahtarı gerekmez. **İngilizce, Türkçe ve Rusça** olarak yerelleştirilmiştir.
:::

::: warning Kaldırma işlemi mağaza verilerinizi siler
Eklentiyi kaldırmak, veritabanı tablolarını düşürür ve yüklenen her ürün görselini siler. Kaldırmadan önce saklamak istediğiniz her şeyi yedekleyin.
:::

## Gerekli İzin

Tüm panel sayfaları ve kenar çubuğu bağlantısı tek bir izinle denetlenir:
`pano.plugin.pano-plugin-market.manage.market`

## Açık Kaynak

Bu eklenti açık kaynaklıdır ve **MIT Lisansı** ile lisanslanmıştır. Kaynak koduna GitHub üzerinden erişebilirsiniz:
- [Kaynak Kodu](https://github.com/PanoMC/pano-plugin-market)
