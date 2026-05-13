# Yorumlar (Comments) Eklentisi

**Comments** eklentisi; blog yazılarınız, sayfalarınız ve diğer platform içerikleriniz için gelişmiş bir tartışma sistemi sağlar. Pano kullanıcı sistemiyle derin entegrasyona sahip modern bir arayüz sunar.

## Yapılandırma

Yöneticiler, tartışma deneyimini panelden detaylıca ayarlayabilir:

### Etkileşim Özellikleri
- **Yanıtlar Etkin:** Kullanıcıların mevcut yorumlara yanıt verip veremeyeceğini belirleyin.
- **Beğeniler Etkin:** Kullanıcıların yorumları ve yanıtları "beğenmesine" izin verin.
- **Bekleme Süresi (Cooldown):** Spam'i önlemek için ardışık yorumlar arasında zorunlu bir bekleme süresi (saniye cinsinden) ayarlayın.

### İzinler
- **Yorum İzni:** Yorum yapabilmek için gereken özel bir izin düğümü atayın.
- **Yanıt İzni:** Yorumlara yanıt verebilmek için gereken özel bir izin düğümü atayın.
*(Tüm kayıtlı kullanıcılara izin vermek için boş bırakın.)*

### Gösterim ve Arayüz
- **Giriş Stili:** `MODAL` (açılır pencere editörü) veya `INLINE` (satır içi form) arasından seçim yapın.
- **Sayfalama Türü:** `PAGINATION` (numaralı sayfalar) veya modern bir deneyim için `LOAD MORE` (daha fazla yükle) seçeneklerini belirleyin.

## Moderasyon ve Yönetim

**Pano Yönetim Paneli** üzerinden erişilebilen yerleşik moderasyon araçlarıyla topluluğunuzu sağlıklı tutun:

- **Genel Yönetim:** Tüm platformdaki yorum ve yanıtları tek bir yerden görmek ve yönetmek için **Panel → Yazılar → Yorumlar** yolunu izleyin.
- **Yazıya Özel Yorumlar:** Belirli bir yazıya ait yorumları doğrudan **Panel → Yazılar → Yazı Detayı** sayfası altından görüntüleyebilir ve moderasyon yapabilirsiniz.
- **Vurgulama ve Paylaşma:** Belirli bir yorumun bağlantısını kopyalayarak diğer yetkili moderatörler için o yorumu vurgulayabilir (highlight), dikkat çekilmesi gereken tartışmaları kolayca paylaşabilirsiniz.
- **Kullanıcı Entegrasyonu:** Oyuncu profillerine ve avatarlarına doğrudan bağlantılarla kimin ne yazdığını tam olarak görün.
- **Temizlik:** Uygunsuz içeriği doğrudan yönetim tablolarından hızla silin.

## Gereken İzin
Yorumları yönetmek ve moderasyon yapmak için kullanıcıların aşağıdaki izne sahip olması gerekir:
`pano.plugin.pano-plugin-comments.manage.comments`

## Kurulum ve Yapılandırma
1. Pano Yönetim Panelinden eklentiyi etkinleştirin.
2. **Ayarları Yapılandırın:** Beğenileri açmak, izinleri veya bekleme sürelerini ayarlamak için **Panel → Eklentiler → Yorumlar** yolunu izleyin.
3. **Moderasyona Başlayın:** Topluluğunuzun tartışmalarını yönetmek için **Panel → Yazılar → Yorumlar** sayfasını ziyaret edin.
