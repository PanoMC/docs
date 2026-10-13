# Ban Yönetimi Entegrasyonu

Pano, sunucu erişimini doğrudan web panelinizden yönetmenize olanak tanıyan yerleşik, senkronize bir ban yönetimi sistemi içerir. Bu entegrasyon, web platformunda yasaklanan oyuncuların Minecraft sunucularınıza katılmasının anında kısıtlanmasını sağlar.

## Ban Yönetimi Nedir?

Ban Yönetimi entegrasyonu, web sitenizin moderasyon araçları ile Minecraft sunucunuz arasındaki boşluğu doldurur. Bir moderatör **Pano Yönetici Paneli** aracılığıyla bir oyuncuyu yasakladığında, Pano MC Eklentisi bu yasağı oyuncu bağlı herhangi bir sunucuya katılmaya çalıştığı anda uygular.

## Özellikler

- **Anında Uygulama** — Web'de uygulanan banlar oyun içinde anında aktif olur.
- **Süreli ve Kalıcı Banlar** — Hem süreli uzaklaştırmalar hem de ömür boyu yasaklamalar için destek.
- **Dinamik Kick Mesajları** — Sebepler ve sona erme süreleri ile otomatik olarak yerelleştirilmiş kick mesajları oluşturur.
- **Platform Geneli Senkronizasyon** — Pano'da uygulanan bir ban, o Pano örneğine bağlı tüm sunucuları etkiler.
- **Kolay Yönetim** — Oyuncunun sayfasından banlayın ve banı kaldırın; **Oyuncular** sayfasında **Yasaklı** filtresi vardır.

## Gereksinimler

1. **Pano MC Eklentisi** kurulu ve Pano örneğinize bağlı olmalıdır.
2. O sunucu için **Yasaklama Entegrasyonu** etkin olmalıdır (varsayılan olarak etkindir).

## Kurulum Rehberi

### Adım 1: Entegrasyonu Kontrol Edin
1. **Pano Yönetici Panelinize** giriş yapın.
2. Sunucuyu seçin ve **Ayarlar → Oyun Entegrasyonu** sekmesini açın (ayarlar sunucu başınadır).
3. **Yasaklama Entegrasyonu** anahtarının açık olduğundan emin olun — varsayılan olarak açıktır.
4. Değiştirdiyseniz **Kaydet**'e tıklayın.

### Adım 2: Ban Mesajlarını Yapılandırın
Ban mesajları, Pano platformunuzun çeviri dosyalarından alınır. Bunları panelinizin **Çeviriler** bölümünde, **MC Eklentisi** türü altında özelleştirebilirsiniz:
- `auth.ban-kick-temporary`: Süreli banlar için gösterilen mesaj.
- `auth.ban-kick-permanent`: Kalıcı banlar için gösterilen mesaj.

## Nasıl Çalışır?

1. **Oyuncu Katılır:** Bir oyuncu Minecraft sunucunuza bağlanmaya çalıştığında, Pano MC Eklentisi katılma olayını durdurur.
2. **Durum Kontrolü:** Eklenti, oyuncunun durumunu kontrol etmek için Pano platformuna gerçek zamanlı bir istek gönderir.
3. **Uygulama:**
   - Eğer oyuncu **yasaklı değilse**, normal şekilde katılmasına izin verilir.
   - Eğer oyuncu **yasaklıysa**, eklenti oyuncuyu sebeple ve süreli banlarda bitiş tarihiyle birlikte sunucudan atar.
4. **Zaten çevrimiçiyse:** oynarken banlanan oyuncu hemen sunucudan atılır.

Sunucu o anda Pano'ya ulaşamıyorsa oyuncunun girişine izin verilir.

## Yardıma mı İhtiyacınız Var?
Sorunlarla karşılaşırsanız veya geri bildiriminiz varsa:
- [**Discord topluluğumuzu**](https://discord.gg/6vVy72wgXT) ziyaret edin.
- [**GitHub**](https://github.com/PanoMC/pano-mc-plugin/issues) üzerinde bir sorun açın.

> Pano'nun merkezi ban yönetimi ile topluluğunuzu güvende tutun.
