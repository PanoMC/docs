# Ban Yönetimi Entegrasyonu

Pano, sunucu erişimini doğrudan web panelinizden yönetmenize olanak tanıyan yerleşik, senkronize bir ban yönetimi sistemi içerir. Bu entegrasyon, web platformunda yasaklanan oyuncuların Minecraft sunucularınıza katılmasının anında kısıtlanmasını sağlar.

## 🎯 Ban Yönetimi Nedir?

Ban Yönetimi entegrasyonu, web sitenizin moderasyon araçları ile Minecraft sunucunuz arasındaki boşluğu doldurur. Bir moderatör **Pano Yönetici Paneli** aracılığıyla bir oyuncuyu yasakladığında, Pano MC Eklentisi bu yasağı oyuncu bağlı herhangi bir sunucuya katılmaya çalıştığı anda uygular.

## ⚡ Özellikler

- ✅ **Anında Uygulama** — Web'de uygulanan banlar oyun içinde anında aktif olur.
- ✅ **Süreli ve Kalıcı Banlar** — Hem süreli uzaklaştırmalar hem de ömür boyu yasaklamalar için destek.
- ✅ **Dinamik Kick Mesajları** — Sebepler ve sona erme süreleri ile otomatik olarak yerelleştirilmiş kick mesajları oluşturur.
- ✅ **Platform Geneli Senkronizasyon** — Pano'da uygulanan bir ban, o Pano örneğine bağlı tüm sunucuları etkiler.
- ✅ **Kolay Yönetim** — Tek bir modern arayüzden banları görüntüleyin, arayın ve iptal edin.

## 📦 Gereksinimler

1. **Pano MC Eklentisi** kurulu ve Pano örneğinize bağlı olmalıdır.
2. Pano ayarlarınızda **Ban Entegrasyonu** etkin olmalıdır.

## 🔧 Kurulum Rehberi

### Adım 1: Entegrasyonu Etkinleştirin
1. **Pano Yönetici Panelinize** giriş yapın.
2. **Panel → Sunucu Ayarları → Oyun Entegrasyonu** bölümüne gidin.
3. **Ban Entegrasyonu** anahtarını etkinleştirin.
4. **Kaydet**'e tıklayın.

### Adım 2: Ban Mesajlarını Yapılandırın
Ban mesajları, Pano platformunuzun çeviri dosyalarından alınır. Bunları panelinizin **Çeviriler** bölümünden özelleştirebilirsiniz:
- `auth.ban-kick-temporary`: Süreli banlar için gösterilen mesaj.
- `auth.ban-kick-permanent`: Kalıcı banlar için gösterilen mesaj.

## 🔄 Nasıl Çalışır?

1. **Oyuncu Katılır:** Bir oyuncu Minecraft sunucunuza bağlanmaya çalıştığında, Pano MC Eklentisi katılma olayını durdurur.
2. **Durum Kontrolü:** Eklenti, oyuncunun durumunu kontrol etmek için Pano platformuna gerçek zamanlı bir istek gönderir.
3. **Uygulama:**
   - Eğer oyuncu **yasaklı değilse**, normal şekilde katılmasına izin verilir.
   - Eğer oyuncu **yasaklıysa**, eklenti kalan süreyi (varsa) hesaplar ve oyuncuyu belirlenen sebeple sunucudan atar.

## 💬 Yardıma mı İhtiyacınız Var?
Sorunlarla karşılaşırsanız veya geri bildiriminiz varsa:
- [**Discord topluluğumuzu**](https://discord.gg/6vVy72wgXT) ziyaret edin.
- [**GitHub**](https://github.com/PanoMC/pano-mc-plugin/issues) üzerinde bir sorun açın.

> Pano'nun merkezi ban yönetimi ile topluluğunuzu güvende tutun. 🛡️
