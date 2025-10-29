# Oyun Entegrasyonları

Pano, Pano deneyiminizi geliştirmek için çeşitli oyun eklentileriyle sorunsuz entegrasyon destekler. Bu entegrasyonlar **tak-çalıştır** mantığıyla çalışır — doğru yapılandırıldığında, otomatik olarak Minecraft sunucunuzla bağlantı kurar ve senkronize olur.

## 🔌 Pano MC Eklentisi

Tüm oyun entegrasyonları, **Pano MC Eklentisi**nin kurulu ve Pano örneğinize bağlı olmasını gerektirir. Pano MC Eklentisi, Minecraft sunucunuz ile Pano arasında bir köprü görevi görerek gerçek zamanlı iletişim ve veri senkronizasyonu sağlar.

**Temel Özellikler:**

- 🔒 **Uçtan Uca Şifreleme** — RSA + AES-256 hibrit şifreleme kullanarak güvenli WebSocket iletişimi
- 🔄 **Gerçek Zamanlı Senkronizasyon** — Oyun ve web arasında anlık oyuncu verisi senkronizasyonu
- 🎮 **Çoklu Platform Desteği** — Spigot, Paper, Folia, Bungeecord ve Velocity ile çalışır
- 🧩 **Eklenti Hook'ları** — Desteklenen eklentileri (AuthMe, izinler, vb.) otomatik olarak tespit eder ve bağlanır
- 📡 **Etkinlik Sistemi** — Oyun içi etkinlikleri dinler ve Pano'ya gönderir
- ⚙️ **Otomatik Yapılandırma** — Uyumluluk için eklenti ayarlarını otomatik olarak düzenler

> ⚠️ **Önemli:** Tüm entegrasyonlar ve en son özelliklerle uyumluluk için her zaman **Pano MC Eklentisi**nin **en son sürümünü** kullanın.

[→ Pano MC Eklentisini İndir](https://github.com/PanoMC/pano-mc-plugin/releases) | [→ Kurulum Rehberi](../installation/)

## 📋 Mevcut Entegrasyonlar

### Kimlik Doğrulama ve Oyuncu Yönetimi

- [**AuthMeReloaded**](./authme/) — Sorunsuz kimlik doğrulama sistemi entegrasyonu

## 🎯 Entegrasyonlar Nasıl Çalışır?

Pano'nun entegrasyonları desteklenen eklentilerle **sorunsuz** bir şekilde çalışacak şekilde tasarlanmıştır:

1. Desteklenen eklentiyi Minecraft sunucunuza kurun (Spigot/Paper/Folia)
2. Minecraft sunucunuzu [Pano MC Eklentisi](../installation/) kullanarak Pano'ya bağlayın (panel'deki **Sunucular** sekmesi → **+** butonu üzerinden)
3. Entegrasyonun **Panel → Sunucu Ayarları → Oyun Entegrasyonu**'ndan etkin olduğunu doğrulayın (çoğu entegrasyon varsayılan olarak etkindir)
4. Bu kadar! Pano otomatik olarak eklentiyi tespit edip bağlanacaktır

## 🔌 Entegrasyon Özellikleri

Bir entegrasyon aktif olduğunda, Pano şunları yapabilir:

- ✅ Oyuncu verilerini oyun ve web arasında senkronize eder
- ✅ Kimlik doğrulama akışlarını yönetir (giriş, kayıt, şifre yönetimi)
- ✅ Panel'den eklenti komutlarını çalıştırır
- ✅ Eklenti etkinliklerini dinler ve buna göre tepki verir
- ✅ Optimal uyumluluk için eklenti ayarlarını otomatik olarak yapılandırır

## 🚀 Yakında Gelenler

Sürekli olarak daha fazla entegrasyon eklemek için çalışıyoruz. Düşündüğümüz bazı eklentiler:

- **İzin Eklentileri** (LuckPerms, vb.)
- **Ban Yönetim Eklentileri**

Entegre edilmesini istediğiniz bir eklenti mi var? [Discord](https://discord.gg/6vVy72wgXT) üzerinden bize bildirin veya [GitHub](https://github.com/PanoMC/pano-mc-plugin/issues)'da bir özellik isteği açın! 

> Belirli bir entegrasyon için ne kadar çok istek alırsak, önceliklendirilip uygulanma olasılığı o kadar artar.

## 🧑‍💻 Kendi Entegrasyonunuzu Geliştirme

Pano ve Minecraft sunucu eklentileriniz arasında özel entegrasyonlar oluşturmak isteyen bir geliştirici misiniz?

Şunları öğrenmek için [**Entegrasyon Geliştirme Rehberimizi**](/tr/integration/getting-started/) inceleyin:

- Pano MC Eklentisi API'sine nasıl bağlanılır
- Özel olay dinleyicileri ve işleyiciler nasıl oluşturulur
- Oyun ve web arasında veri nasıl senkronize edilir
- Sorunsuz eklenti entegrasyonları nasıl oluşturulur

## 💬 Yardıma mı İhtiyacınız Var?

Entegrasyonlarla ilgili herhangi bir sorunla karşılaşırsanız:

- Detaylı kurulum talimatları için ilgili entegrasyon sayfasını kontrol edin
- [SSS sayfası](../FAQ)nı ziyaret edin
- [**Discord topluluğumuz**](https://discord.gg/6vVy72wgXT)dan yardım isteyin
- Veya [GitHub](https://github.com/PanoMC/pano-mc-plugin/issues)'da bir sorun bildirin

> Birlikte, Pano'yu daha iyi hale getiriyoruz. 🚀
