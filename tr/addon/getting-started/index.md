# Addon Geliştirmeye Başlayın

Pano, geliştiricilerin hem **Addon** (Frontend) hem de **Plugin** (Backend) aracılığıyla işlevselliğini genişletmesine olanak tanıyan modüler bir platformdur. Bu kılavuz, Pano ekosisteminin temel kavramlarını ve mimarisini anlamanıza yardımcı olacaktır.

## 🏗️ Temel Mimari

Pano, geleneksel bir web scripti değildir. Dahili bir reverse proxy aracılığıyla birden fazla SvelteKit arayüzü sunan, tek bir JAR dosyası olarak çalışan bağımsız bir platformdur.

- **Backend**: Kotlin (Vert.x, Spring DI)
- **Frontend**: SvelteKit, Bootstrap 5, Saf JavaScript (TypeScript kullanılmaz)
- **Çalışma Zamanı**: Bun (Hızlı JS çalışma zamanı)

### Pano Plugin/Addon Nedir?
Tam bir eklenti genellikle iki bölümden oluşur:
1. **Plugin Backend**: Pano Core içinde çalışan bir Kotlin/Java JAR dosyası.
2. **Plugin UI (Addon)**: Backend ile birlikte paketlenen veya dinamik olarak sunulan Svelte tabanlı bir frontend.

---

## 🛠️ Pano SDK (`@panomc/sdk`)

SDK, addon geliştirmenin kalbidir. Host (Pano) ile eklentiniz arasında bir köprü görevi görür.

- **Bileşen Sağlayıcı**: `Button`, `Modal`, `Editor` ve `Card` gibi hazır bileşenlere erişim sağlar.
- **UI Kaydı**: `pano.ui.page.register` kullanarak Panel'e veya Temaya yeni rotalar ekleyin.
- **Navigasyon Kontrolü**: `pano.ui.nav.site.editNavLinks` aracılığıyla yan menü bağlantılarını dinamik olarak düzenleyin.
- **API Araçları**: Güvenli ağ istekleri için `ApiUtil` kullanın.
- **Yerelleştirme**: Çoklu dil desteği (EN, TR, RU) için yerelleştirilmiş `_` fonksiyonunu kullanın.

---

## 🎨 Frontend Standartları

Tüm addonların Pano'nun yerel bir parçası gibi hissettirmesini sağlamak için katı tasarım ve kodlama standartlarını takip ediyoruz.

### Dil ve Stil
- **Saf JavaScript**: Saf JS ile daha iyi bir dünyanın mümkün olduğuna inanıyoruz. Frontend projelerinde TypeScript kabul edilmemektedir.
- **Svelte ve Bootstrap 5**: Temel UI framework'ü. Stil işlemleri için SASS kullanın.
- **Tasarım Tutarlılığı**: `panel-ui` ve `vanilla-theme` estetiğiyle eşleşin. Tutarlı tablo yapıları, arama girişleri ve sayfalama (varsayılan 10 öğe) kullanın.

### Performans
- **SSR ve CSR**: Pano, hibrit Sunucu Taraflı ve İstemci Taraflı oluşturma kullanır. Bileşenlerinizin SSR uyumlu olduğundan emin olun (`onMount` dışında `window`/`document` erişiminden kaçının).
- **Dinamik Yükleme**: Pano API'sine kayıtlı bileşenler, başlangıç sayfa yükünü düşük tutmak için **dinamik olarak** yüklenmelidir.

---

## ⚙️ Backend Standartları (Kotlin)

### Yaşam Döngüsü Yönetimi
Eklentiler `PanoPlugin` sınıfını extend etmeli, `onStart` ve `onUninstall` hook'larını yönetmelidir. Veritabanı işlemleri için her zaman `SetupEventListener` kullanarak Pano kurulumunun bitmesini bekleyin.

### Veritabanı ve İzinler
- **Tip Güvenliği**: Yapılandırma ve veritabanı varlıkları için statik stringler yerine **Enum** kullanın.
- **DAO Deseni**: `@DBEntity`, `@Migration` ve `@Dao` anotasyonlarını kullanın.
- **Güvenlik**: Özel FontAwesome ikonlarıyla `PanelPermission` sınıfını extend ederek izinleri tanımlayın.
- **Aktivite Günlükleri**: Tüm yönetimsel API endpoint'leri şeffaflık için **Aktivite Günlükleri** (Activity Logs) tanımlamak zorundadır.

---

## 📥 Geliştirme İş Akışı

### Hızlı UI Testi
UI değişikliklerini derleme yapmadan test etmek için:
1. **Panel -> Ayarlar** kısmından **Dev Mode**'u etkinleştirin.
2. Eklenti dosyalarınızı Pano kurulumunuzun `plugins/` dizinine yerleştirin.
3. Değişiklikleri anında görmek için `bun dev` komutunu kullanın (HMR desteği ile).

### Dallanma ve Commit'ler
- **Önce Alpha**: Pano Core için her zaman `alpha`, UI projeleri için `dev` dalını hedefleyin.
- **Conventional Commits**: [Conventional Commits](https://www.conventionalcommits.org/) standartlarını sıkı bir şekilde takip ediyoruz. Değişim günlükleri (changelogs) **Semantic Release** aracılığıyla otomatik oluşturulduğu için bu zorunludur.

---

## 🔗 Kaynaklar ve Lisanslama
- **Lisans**: Resmi eklentiler ve boilerplate **MIT** lisansı ile sunulur.
- **Topluluk**: Destek için [Discord](https://panomc.com/discord) sunucumuza katılın.
- **Boilerplate**: Projenize [Pano Boilerplate Plugin](https://github.com/PanoMC/pano-boilerplate-plugin) ile başlayın.

Geliştirmeye hazır mısınız? Ortamınızı kurmak için bir sonraki bölüme geçin!