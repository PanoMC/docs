# AuthMe Sorun Giderme ve Yardım

## Güvenlik ve Uyumluluk

### Şifre Güvenliği

Pano, AuthMe'nin **CUSTOM hash** türünü kullanır, bu da Pano'nun düz metin şifreler saklamadan veya zayıf hash algoritmaları kullanmadan şifreleri güvenli bir şekilde doğrulamasına olanak tanır.

### Yedekleme Sistemi

Herhangi bir AuthMe yapılandırmasını değiştirmeden önce, Pano **otomatik olarak** `config.yml` dosyanızın bir **yedeğini oluşturur**. Yedekleri şurada bulabilirsiniz:

```
plugins/Pano/authme-backup/
```

Bir şeyler ters giderse, her zaman önceki yapılandırmanızı geri yükleyebilirsiniz.

### Eklenti Çakışmaları

Bazı AuthMe eklentileri veya ilgili eklentiler Pano'nun entegrasyonuyla çakışabilir, özellikle şunları yaparlarsa:

- Aynı yapılandırma değerlerini değiştirirler
- Aynı AuthMe etkinliklerine bağlanırlar
- Şifre hash'leme yöntemlerini değiştirirler

Sorunlarla karşılaşırsanız, nedeni belirlemek için çakışan eklentileri birer birer devre dışı bırakmayı deneyin.
## Sorun Giderme

### Entegrasyon Çalışmıyor

**Belirtiler:** Oyuncular kaydolamıyor veya giriş yapamıyor, komutlar çalışmıyor

**Çözümler:**
1. AuthMeReloaded'ın kurulu ve çalışır durumda olduğundan emin olun (`/plugins` kontrol edin)
2. Pano MC Eklentisi'nin Pano'ya bağlı olduğunu doğrulayın (Panel → Sunucu Durumu kontrol edin)
3. Entegrasyon onay kutusunun Panel → Sunucu Ayarları → Oyun Entegrasyonu'ndan etkinleştirildiğinden emin olun
4. Entegrasyonu etkinleştirdikten sonra Minecraft sunucunuzu yeniden başlatın
5. Hata için sunucu loglarını kontrol edin

### Yapılandırma Sürekli Sıfırlanıyor

**Belirtiler:** AuthMe yapılandırma değerleri yeniden başlatmadan sonra geri değişiyor

**Çözümler:**
1. AuthMe'nin yapılandırmasında `passwordHash` veya `registration.type`'ı manuel olarak düzenlemeyin
2. Pano'nun bu ayarları otomatik olarak yönetmesine izin verin
3. Diğer AuthMe ayarlarını değiştirmeniz gerekiyorsa, bunları AuthMe'nin yapılandırması üzerinden düzenleyin ve yeniden yükleyin

### Komutlar Yanıt Vermiyor

**Belirtiler:** `/register` veya `/login` komutları çalışmıyor

**Çözümler:**
1. Entegrasyonun panel'de etkin olup olmadığını kontrol edin
2. Oyuncunun doğru sunucuya bağlı olduğunu doğrulayın
3. Tam komut sözdizimini kullandığınızdan emin olun (takma ad yok)
4. Başka bir eklentinin komutları geçersiz kılıp kılmadığını kontrol edin
## Sorun Bildirme

AuthMeReloaded entegrasyonuyla ilgili hata, eksik özellik veya uyumluluk sorunlarıyla karşılaşırsanız:

- **GitHub Sorunları:** [PanoMC/pano-mc-plugin](https://github.com/PanoMC/pano-mc-plugin/issues)
- **Discord:** [Topluluğumuza katılın](https://discord.gg/6vVy72wgXT)

Bir sorun bildirirken lütfen şunları ekleyin:
- Pano sürümünüz
- AuthMeReloaded sürümünüz
- Minecraft sunucu sürümünüz (Spigot/Paper/Folia)
- Hatayı gösteren sunucu logları
- Sorunu yeniden üretme adımları

> Birlikte, Pano'yu daha iyi hale getiriyoruz.
## İlgili Dokümantasyon

- [Oyun Entegrasyonları](../)
- [Pano'yu Kurma](../../installation/)
- [Yapılandırma Rehberi](../../configuration/)
- [SSS](../../FAQ/)
- [Gelişmiş Konular](../../advanced/)
