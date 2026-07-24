# Media Page Eklentisi

**Media Page** eklentisi, görselleri, videoları ve diğer medya içeriklerini temiz, düzenli galerilerde görüntülemenize ve yönetmenize olanak tanır. Yöneticiler istedikleri sayıda **medya sayfası** oluşturur (örneğin *Ekran Görüntüleri*, *Etkinlikler* veya *Yapılar*), her birini kategorilere ayırır ve görsel ve video yükler. Her etkin sayfa, temanızda otomatik olarak `/gallery/<slug>` adresinde herkese açık bir galeriye dönüşür — isteğe bağlı olarak gezinme menüsüne bağlanır — ve ziyaretçiler burada bir küçük-resim ızgarasına göz atar ve medyayı tam ekran bir lightbox'ta açar.

## Özellikler

- **Sınırsız Medya Sayfası:** Her sayfanın bir başlığı, bir URL slug'ı (siz yazarken başlıktan otomatik oluşturulur, benzersizlik zorunludur), bir açıklaması, bir `Active` / `Passive` durumu ve bir **Gezinmede Göster** anahtarı vardır.
- **Kategoriler:** Her sayfayı kategorilere ayırın — ekleyin, düzenleyin, silin, yeniden sıralamak için sürükle-bırak yapın, kategori bazında görünürlüğü açıp kapatın veya bir kategoriyi başka bir sayfaya taşıyın.
- **Medya Yükleme:** Sürükle-bırak yapın veya aynı anda birden fazla dosya seçin (görseller ve videolar, istek başına **100 MB**'a kadar). İsteğe bağlı bir başlık ve açıklama ekleyin (varsayılan olarak dosya adı), bunları daha sonra düzenleyin, silin ve bir kategori içinde yeniden sıralamak için sürükleyin.
- **Otomatik Küçük Resimler:** Görseller otomatik olarak 400px genişliğinde bir küçük resim alır; videolar ızgarada bir oynat rozetiyle ilk karesini gösterir.
- **Hızlı, Güvenli Sunum:** Dosyalar benzersiz adlarla saklanır ve bir haftalık değişmez tarayıcı önbelleği ile yol-geçişi (path-traversal) korumasıyla sunulur.
- **Etkinlik Günlüğü:** Sayfa oluşturma/güncelleme/silme ve medya yükleme/silme işlemleri, işlemi yapan kullanıcıyla birlikte panel etkinlik günlüğüne kaydedilir.

## Medyayı Yönetme

Tüm yönetim, panel kenar çubuğundaki yeni **Media** öğesi altında gerçekleşir (**Görüntüle**'nin hemen ardından eklenir) — ayrı bir ayarlar ekranı yoktur.

1. Eklentiyi **Pano Yönetim Paneli**'nden etkinleştirin.
2. Medya sayfalarınızı görmek için **Panel → Media**'ya gidin (ID, Başlık, Slug ve Durum içeren sayfalanmış bir tablo).
3. Bir sayfa eklemek için **Oluştur**'a tıklayın, başlığını ve açıklamasını doldurun, ardından **kaydedin** — medya yükleyebilmek için önce sayfayı kaydetmelisiniz.
4. **Kategoriler** ekleyin, ardından görsellerinizi ve videolarınızı sürüklemek için yükleme penceresini açın.
5. Sayfayı yayınlamak için **Active** olarak ayarlayın (ve bir menü bağlantısı istiyorsanız **Gezinmede Göster**'i etkinleştirin).

## Ziyaretçiler Ne Görür

Her etkin sayfa, sayfa başlığı ve açıklaması bir başlık olarak gösterilen `/gallery/<slug>` adresinde bir galeriye dönüşür. Her görünür kategori, duyarlı, üzerine gelince yakınlaşan bir küçük-resim ızgarasıyla kendi bölümü olarak görünür. Bir küçük resme tıklamak, önceki/sonraki oklarıyla, klavye gezinmesiyle (ok tuşları ve `Escape`), kontrollerle otomatik oynatılan videoyla ve bir başlık/açıklama alt yazısıyla bir lightbox açar. Pasif sayfalar bir 404 döndürür ve gizli kategoriler filtrelenir.

::: tip Ücretsiz ve resmi
Media Page, Pano ekibi tarafından geliştirilip sürdürülür ve **MIT** ile lisanslanmıştır. Varsayılan derlemeler ücretsizdir — panomc.com hesabı veya lisans anahtarı gerekmez — ve harici veya eklenti bağımlılığı yoktur. Veritabanı tabloları ilk çalıştırmada otomatik olarak oluşturulur.
:::

::: warning Kaldırma işlemi medyanızı siler
Eklentiyi kaldırmak, veritabanı tablolarını ve yüklenen her dosyayı kalıcı olarak kaldırır. Kaldırmadan önce saklamak istediğiniz her şeyi yedekleyin.
:::

## Gerekli İzin
Medya sayfalarını, kategorileri ve medya öğelerini yönetmek için kullanıcıların aşağıdaki izne ihtiyacı vardır:
`pano.plugin.pano-plugin-media-page.manage.media.page`

## Açık Kaynak
Bu eklenti açık kaynaklıdır ve **MIT** ile lisanslanmıştır. Kaynak koduna GitHub üzerinden erişebilirsiniz:
- [Kaynak Kodu](https://github.com/panomc/pano-plugin-media-page)
