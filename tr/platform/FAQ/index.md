# Sıkça Sorulan Sorular (SSS)

Pano hakkında bilmeniz gereken her şey. Aradığınız cevabı bulamazsanız, [Discord topluluğumuza](https://discord.gg/6vVy72wgXT) katılmaktan çekinmeyin.

---

### 🌐 Genel

#### Pano nedir?
Pano, Minecraft sunucu sahipleri için tasarlanmış gelişmiş, açık kaynaklı bir web platformudur. Web sitenizi, topluluk yönetiminizi ve oyun entegrasyonunuzu tek bir güçlü sistemde birleştirir.

#### Pano ücretsiz mi?
Evet! Pano, GPLv3 lisansı ile lisanslanmıştır ve herkes için ücretsizdir. Ayrıca geliştiricilerin kendi eklentilerini ve temalarını oluşturup satabildikleri bir ekosistemi de destekliyoruz.

#### Pano'yu çalıştırmak için güçlü bir sunucuya ihtiyacım var mı?
Hayır. Pano performans için optimize edilmiştir. 1 GB RAM ve Java 9+ yüklü temel bir VPS, çoğu topluluk için genellikle fazlasıyla yeterlidir.

---

### 🚀 Kurulum ve Yapılandırma

#### Hangi portları açmam gerekiyor?
Varsayılan olarak Pano, HTTP için **80** portunu kullanır. Eğer SSL/HTTPS yapılandırırsanız, **443** portunu da açmanız gerekecektir.

#### Pano'yu Windows/Linux/macOS üzerinde çalıştırabilir miyim?
Evet! Pano bir Java uygulaması (.jar) olduğu için, JVM yüklü olan her sistemde çalışır.

#### Kurulum sırasındaki "Portable DB" seçeneği nedir?
Windows (x64/ARM64) üzerinde Pano, sizin için taşınabilir bir MariaDB örneğini otomatik olarak indirip yönetebilir. Bu, veritabanını manuel olarak kurmak istemediğiniz yerel testler veya küçük sunucular için mükemmeldir.

#### Pano "Başlatılıyor..." veya "Çıkartılıyor..." ekranında takılı kaldı.
İlk çalıştırmada Pano'nun bağımlılıkları indirmesi ve gerekli dosyaları çıkarması gerekir. İnternet hızınıza bağlı olarak bu işlem birkaç dakika sürebilir. Lütfen sabırlı olun!

---

### 🕹️ Oyun Entegrasyonu

#### İzinlerdeki `pano: true` context'i ne anlama geliyor?
Pano paneli aracılığıyla bir izin nodu eklediğinizde, bu otomatik olarak `pano: true` context'ini içerir. Bu, iznin yalnızca **Pano platformunda (web)** aktif olduğu ve oyuna **yansıtılmadığı** anlamına gelir. Bu, sunucunuzun dahili izinlerini temiz tutar.

#### Oyun içinde kayıt olduktan sonra neden sunucudan atılıyorum?
Bu, **"Kayıt Sonrası At (Kick After Register)"** adı verilen bir güvenlik özelliğidir. Oyuncuların oyuna girmelerine ve oynamalarına izin verilmeden önce web sitesinde e-posta adreslerini doğrulamalarını veya diğer gerekli adımları tamamlamalarını sağlar. Bunu **Panel → Sunucu Ayarları → Oyun Entegrasyonu** bölümünden devre dışı bırakabilirsiniz.

#### Pano, Bungeecord/Velocity destekliyor mu?
Evet, Pano hem Bungeecord ve Velocity proxy'lerini hem de bağımsız Spigot/Paper sunucularını destekler.

---

### 🧩 Eklentiler ve Temalar

#### Daha fazla eklenti ve temayı nerede bulabilirim?
Resmi ve topluluk kaynakları [Pano Market](https://panomc.com/market) üzerinden erişilebilir olacaktır (yakında).

#### Kendi eklentilerimi geliştirebilir miyim?
Kesinlikle! Başlamak için [Eklenti Geliştirme Rehberimize](../../addon/getting-started/) göz atın.

---

### 💬 Destek

#### Bir hata buldum. Ne yapmalıyım?
Lütfen bunu [GitHub depomuzda](https://github.com/PanoMC/pano/issues) mümkün olduğunca çok detayla bildirin veya Discord üzerinden bize haber verin.

#### Pano'ya nasıl katkıda bulunabilirim?
Katkıları seviyoruz! Daha fazla bilgi için [Katkıda Bulunma Rehberimize](../../contribution/getting-started/) bakın.