# Katkıda Bulunmaya Başlayın

Hoş geldiniz! Pano açık kaynaklı bir projedir ve topluluk katkılarını seviyoruz. İster hata düzeltin, ister yeni özellikler ekleyin veya dokümantasyonu geliştirin, yardımınız değerlidir.

## Depolarımız (Repositories)

Pano, her biri belirli bir amaca hizmet eden birkaç depodan oluşur:

- [**Pano (Core)**](https://github.com/PanoMC/Pano): Ana backend deposu (Kotlin/Vert.x).
- [**panel-ui**](https://github.com/PanoMC/panel-ui): Yönetim paneli arayüzü (SvelteKit).
- [**setup-ui**](https://github.com/PanoMC/setup-ui): İlk kurulum sihirbazı (SvelteKit).
- [**vanilla-theme**](https://github.com/PanoMC/vanilla-theme): Varsayılan resmi tema (SvelteKit).
- [**sdk (theme-core motoru)**](https://github.com/PanoMC/sdk): `@panomc/theme-core` ve `@panomc/sdk` paketlerini yayınlayan motor deposu.
- [**pano-mc-plugin**](https://github.com/PanoMC/pano-mc-plugin): Minecraft sunucu tarafı entegrasyon eklentisi.
- [**docs**](https://github.com/PanoMC/docs): Bu dokümantasyon deposu.

## Versiyon Türleri (Release Types)

Dallarımızda (branches) üç aşamalı bir yayın döngüsü izliyoruz:

| Tür | Dal (Branch) | Stabilite | Açıklama |
|------|--------|-----------|-------------|
| **Alpha** | `alpha` | Düşük | Aktif geliştirme, sık güncellemeler. Köklü değişiklikler içerebilir. |
| **Beta** | `beta` | Orta | Yayın öncesi aşama. Genellikle stabildir ancak küçük hatalar olabilir. |
| **Release**| `main` | Yüksek | Yayına hazır. En stabil versiyon. |

## Teknoloji Yığını

Pano, performans ve esneklik sağlamak için modern teknolojilerle oluşturulmuştur:

- **Backend**: Kotlin, Vert.x, Spring DI, JVM 17+ hedefli (testler JDK 21 üzerinde çalışır).
- **Frontend**: SvelteKit, Bootstrap 5, SASS.
- **Çalışma Zamanı**: Frontend servislerimizi çalıştırmak için [Bun](https://bun.sh) kullanılır.
- **Paketleme**: Projeler ZIP dosyaları halinde paketlenir ve tek bir çalıştırılabilir JAR dosyasına gömülür.

## Katkı Kuralları

Kod tabanının kalitesini korumak için lütfen şu kurallara uyun:

- **Branching Politikası**: 
  - **Pano (Core)**: Aktif geliştirme dalı `alpha`'dır. Tüm Pull Request'ler `alpha` dalına açılmalıdır.
  - **UI Projeleri**: Bu projelerde genellikle iki dal bulunur ancak varsayılan geliştirme dalı `dev`'dir. PR'larınızı lütfen `dev` dalına hedefleyin.
- **Conventional Commits**: [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) standartlarını takip ediyoruz. Tüm commit mesajları için bu zorunludur.
- **Semantic Versioning & Release**: Pano, **Semantic Versioning (SemVer)** ve **Semantic Release** kullanır. Commit mesajları, changelog'ların otomatik oluşturulması ve versiyon numarasının belirlenmesi için kritik öneme sahiptir.
- **Otomatik Dağıtım**: Sürekli entegrasyon ve otomatik dağıtım için **GitHub Actions** kullanıyoruz.
- **Veritabanı Desteği**: **MariaDB** ve **MySQL 5.5+** desteği vermeye çalışıyoruz. Veritabanı sorgularınızın ve şema değişikliklerinizin bu sürümlerle uyumlu olduğundan emin olun.
- **Migrationlar**: **Config ve veritabanı migration'larına** büyük önem veriyoruz ve olabildiğince geriye dönük uyumluluk sağlamaya çalışıyoruz.
- **Kod Formatlaması**: Yazdığınız kodun projenin genel yapısına ve stiline uygun olması yeterlidir.
- **AI Tarafından Üretilen Kod**: Kod üretmek için AI (Yapay Zeka) kullanılabilir; ancak gizli, özel mülkiyetli veya açık kaynak hedeflerimizle çelişen lisanslara sahip hiçbir kodu kabul edemeyiz.
- **Kalite**: PR'lar (Pull Request) temiz olmalı, gerektiğinde iyi yorumlanmalı ve gönderilmeden önce test edilmelidir.

## Pano Nasıl Çalışır?

Pano geleneksel bir web scripti değildir. Tek bir JAR dosyası olarak çalışan (Minecraft sunucusuna benzer) bağımsız bir platformdur. JAR'ı çalıştırdığınızda:
1. Gerekli UI dosyalarını dışarı çıkarır.
2. Taşınabilir bir Bun çalışma zamanı indirir.
3. **Başlatma Kontrolleri**:
   - Platformun halihazırda kurulu olup olmadığını kontrol eder.
   - Mevcut sürümle uyumluluk sağlamak için **yapılandırma (config) migration'larını** gerçekleştirir.
   - Eğer platform kurulu ise, **veritabanı migration'larını** kontrol eder ve uygular.
4. Trafiği uygun **arayüzlere** yönlendiren bir ters proxy (reverse proxy) görevi gören bir backend servisi başlatır:
   - Eğer platform **kurulu değilse**, tüm trafiği **setup-ui**'a yönlendirir.
   - Eğer platform **kurulu ise**, varsayılan olarak **vanilla-theme**'i gösterir.
   - **`/panel`** ile başlayan tüm rotalar (routes) **panel-ui**'a proxy edilir.
5. Minecraft sunucularıyla şifreli bir WebSocket bağlantısı üzerinden iletişim kurar.

---

Dalmaya hazır mısınız? [Backend](./backend) ve [Frontend](./frontend) için özel geliştirme kılavuzlarına göz atın.