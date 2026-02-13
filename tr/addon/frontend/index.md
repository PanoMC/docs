# Arayüz Geliştirme (Frontend)

Pano'da frontend geliştirme **Svelte** üzerine kuruludur ve stillendirme için **Bootstrap 5** ile **Animate.css** kullanılır. Eklentinizin frontend etkileşiminin temelinde **@panomc/sdk** yatar.

## 📂 Dizin Yapısı

Kodlamaya başlamadan önce dosyalarınızın nerede bulunması gerektiğini anlamak önemlidir.

```text
src/
├── panel/                  # Yönetim Paneli için bileşenler ve sayfalar
│   ├── components/         # Tekrar kullanılabilir panel bileşenleri
│   ├── modals/             # Modal pencereleri
│   └── pages/              # Ana rota sayfaları
├── theme/                  # Genel Tema için bileşenler ve sayfalar
│   ├── components/         # Tekrar kullanılabilir tema bileşenleri
│   ├── modals/             # Modal pencereleri
│   └── pages/              # Ana rota sayfaları
└── main.js                 # Giriş noktası: Rotaları ve navigasyonu kaydeder
```

*   **`panel/`**: Yönetici arayüzü (dashboard) ile ilgili her şeyi içerir.
*   **`theme/`**: Web sitesinde normal kullanıcıların göreceği her şeyi içerir.
*   **`main.js`**: En önemli dosyadır. Pano'ya sayfalarınızın nerede olduğunu söyler ve gezinme menüsüne bağlantılar ekler.

---

## 🛠️ @panomc/sdk ile Geliştirme

`@panomc/sdk` paketi, Pano ile etkileşim kurmanız için gereken araç setinizdir. UI bileşenlerinden ağ isteklerine kadar, yerel hissettiren bir uygulama oluşturmak için ihtiyacınız olan her şeyi sağlar.

### 1. Sayfaları Kaydetme (Routing)
Yönetim paneline veya web sitesine yeni bir sayfa eklemek için `pano.ui.page.register` fonksiyonunu kullanırsınız.

```javascript
import { PanoPlugin } from '@panomc/sdk';

export default class AnnouncementPlugin extends PanoPlugin {
    onLoad(pano) {
        // Yönetim Panelinde bir sayfa kaydet
        pano.ui.page.register({
            name: 'announcements',
            path: '/announcements', // URL: /panel/announcements
            view: () => import('./panel/pages/AnnouncementsPage.svelte'),
            scopes: ['admin'] // Sadece yöneticiler görebilir
        });
    }
}
```

### 2. Navigasyon Bağlantıları Ekleme
Bir sayfa oluşturmak, onu otomatik olarak menüye eklemez. Onu kenar çubuğuna (sidebar) veya üst çubuğa (navbar) manuel olarak eklemeniz gerekir.

```javascript
pano.ui.nav.site.editNavLinks((navLinks) => {
    navLinks.push({
        id: 'announcements',
        title: 'Announcements',
        uipath: '/announcements', // Kayıtlı sayfa yoluyla eşleşmeli
        icon: 'fas fa-bullhorn', // FontAwesome ikonu
        scopes: ['admin']
    });
    return navLinks;
});
```

### 3. Yerel Bileşenleri Kullanma
Standart UI öğelerini sıfırdan oluşturmak yerine, Pano'nun yerel bileşenlerini yeniden kullanın. Bu, eklentinizin platformun bir parçası gibi görünmesini ve hissettirmesini sağlar.

```svelte
<script>
    // SDK üzerinden bileşenleri içe aktar
    import { Button, Card, Input } from '@panomc/sdk/components/panel';
</script>

<Card title="Yeni Duyuru">
    <Input label="Başlık" placeholder="Başlık girin..." />
    <Button color="primary">Oluştur</Button>
</Card>
```

### 4. API İstekleri Yapma
Backend'inizle iletişim kurmak için `ApiUtil` kullanın. Kimlik doğrulama (auth) ve temel URL işlemlerini otomatik olarak halleder.

```javascript
import { ApiUtil } from '@panomc/sdk/utils/api';

// GET isteği
const announcements = await ApiUtil.get('/api/announcement/list');

// POST isteği
await ApiUtil.post('/api/announcement/create', {
    title: 'Merhaba Dünya',
    content: 'Bu yeni bir duyurudur.'
});
```

### 5. Yerelleştirme (Çoklu Dil)
Pano varsayılan olarak çok dillidir. Metin dizelerini çevirmek için `_` (alt çizgi) fonksiyonunu kullanın.

```svelte
<script>
    import { _ } from '@panomc/sdk/utils/language';
</script>

<h1>{_('announcement.welcome_title')}</h1>
<p>{_('announcement.description')}</p>
```

### 6. Bildirimler (Toasts)
Kullanıcılara geri bildirim vermek için yerleşik bildirim sistemini kullanın.

```javascript
// Başarı mesajı
pano.utils.toast.success(_('announcement.created_success'));

// Hata mesajı
pano.utils.toast.error(_('announcement.created_error'));
```

## 📝 Kodlama Stili ve En İyi Uygulamalar

*   **Svelte Sıralaması**: Bloklarınızı şu sırayla düzenleyin: `<styles>`, `<html>`, `<script>`.
*   **Dinamik Yükleme**: Sayfaları kaydederken her zaman dinamik içe aktarma (örn. `() => import(...)`) kullanın; bu, başlangıç paket boyutunu küçük tutar.
*   **Performans**: Frontend tarafında ağır hesaplamalardan kaçının. Karmaşık mantığı backend API'nize devredin.
*   **Görsel Tutarlılık**: Standart sayfaların (örn. tablo düzenleri, başlıklar) nasıl yapılandırıldığını görmek için `panel-ui` ve `vanilla-theme` depolarını inceleyin.
