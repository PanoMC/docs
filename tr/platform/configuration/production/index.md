# Üretim Kurulumu

## Son Kontrol Listesi

- `development-mode = false`
- Port **80 (TCP)** açık ve erişilebilir
- HTTPS etkin (Pano SSL veya Reverse Proxy aracılığıyla) ve Port **443 (TCP)** açık
- Güvenli ve özel `jwt-key`
- Geçerli SMTP bilgileri yapılandırılmış
- Veritabanı öneki kurulum sonrası değiştirilmemiş
- Doğru tema ID’si ayarlanmış aksi taktirde Vanilla Tema çalışır
- Veritabanı ve yüklemeler için düzenli yedekleme yapılmış
## Örnek Minimal Yapılandırma

```jsonc
development-mode = false
locale = "en-US"

website-name = "Harika Sunucum"
website-description = "Survival • Etkinlikler • Dost Canlısı Topluluk"
support-email = "destek@sunucum.com"

server-ip-address = "mc.sunucum.com"
server-game-version = "1.20.x"

database {
  host = "127.0.0.1:3306"
  name = "pano_prod"
  username = "pano_user"
  password = ""
  prefix = "pano_"
}

current-theme = "vanilla-theme"

email {
  enabled = true
  sender = "Pano <no-reply@sunucum.com>"
  hostname = "smtp.sunucum.com"
  port = 465
  username = "no-reply@sunucum.com"
  password = "DEGISTIRIN"
  ssl = true
}

server {
  host = "0.0.0.0"
  port = 80
}
```
## Düzenleme Sonrası

- Düzenledikten sonra **Pano’yu yeniden başlatın**.
- Otomatik oluşturulan alanları (ör. `jwt-key`, `config-version`) değiştirmeyin.
- Başlatma başarısız olursa, sözdizimini kontrol edin.
- Yükseltme veya yeniden kurulumdan önce her zaman yedek alın.

> Yardıma mı ihtiyacınız var? SSS’ye göz atın, [Discord topluluğumuza](https://discord.gg/6vVy72wgXT) katılın veya  
> [GitHub](https://github.com/PanoMC/Pano/issues) üzerinden sorun bildirin.
