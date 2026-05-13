# MC Plugin Geliştirme

`pano-mc-plugin`, Minecraft sunucunuz ile Pano web platformu arasındaki köprüdür.

## İletişim (WebSocket)
İletişim, gerçek zamanlı performans için WebSocket üzerinden yürütülür. Güvenliği sağlamak için hibrit bir şifreleme yöntemi kullanıyoruz:
- **RSA**: İlk anahtar değişimi için kullanılır.
- **AES-256**: Sonraki tüm mesajların şifrelenmesi için kullanılır.

## Desteklenen Platformlar
Çok çeşitli Minecraft sunucu platformlarını destekliyoruz:
- Spigot / Paper / Folia
- Bungeecord / Velocity

::: warning UYUMLULUK
Yeni özellikler eklerken veya hataları düzeltirken, yazdığınız kodun desteklenen **tüm platformlarda** (Spigot/Paper, Velocity/Bungee vb.) sorunsuz çalıştığından emin olmalısınız. Ortak kullanılamayan mantıklar için platforma özel modülleri kullanın.
:::

## Çeviriler
Minecraft eklentisi (veya çekirdek platform) için çeviri eklemek, değiştirmek veya kaldırmak istiyorsanız, lütfen Pano deposundaki şu dizin altındaki dosyaları düzenleyin:
`Pano/src/main/resources/locales`

## Geliştirme
Eklenti deposu, ortak mantığın bir `core` modülünde paylaşıldığı, platforma özgü uygulamaların ise kendi modüllerinde bulunduğu modüler bir yapı kullanır.

### Branching Politikası
Pano Core projesinde olduğu gibi, bu proje de üç aşamalı bir yayın döngüsü izler.
- **alpha**: Aktif geliştirme dalıdır. Tüm Pull Request'ler `alpha` dalına açılmalıdır.
- **beta**: Test için yayın öncesi aşamadır.
- **main**: Stabil sürüm dalıdır.

### Temel Entegrasyonlar
Eklenti, kesintisiz bir deneyim sağlamak için popüler Minecraft eklentileriyle entegre olur:
- **AuthMeReloaded**: Birleşik kimlik doğrulama için.
- **LuckPerms**: İzin senkronizasyonu için.
- **Ban Yöneticileri**: Yasaklamaları web üzerinden görüntülemek ve yönetmek için.

---

Yeni bir platform için destek eklemek ister misiniz? [GitHub](https://github.com/PanoMC/pano-mc-plugin) üzerinden bir PR açın!
