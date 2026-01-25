# Ayar Dosyası Rehberi

Pano, ayarlarını yönetmek için **HOCON** (Human-Optimized Config Object Notation) yapılandırma dosyasını kullanır.  
HOCON, JSON’a benzer ancak okunması daha kolaydır — yorum satırlarını, tırnaksız dizeleri ve sondaki virgülleri destekler.  
Daha fazla bilgi için:  
👉 [Lightbend HOCON Belgeleri](https://github.com/lightbend/config/blob/main/HOCON.md)

Pano ilk kez başlatıldığında, **`Pano-<version>.jar`** dosyasıyla aynı dizinde otomatik olarak **`config.conf`** adlı bir yapılandırma dosyası oluşturur.  
Varsayılan olarak, Pano bu dosyayı şu şekilde arar:

```kotlin
System.getProperty("pano.configFile", "config.conf")
```

Bu, JVM parametresi **`-Dpano.configFile`** kullanarak **özel bir yapılandırma yolu** belirtebileceğiniz anlamına gelir:

```bash
java -Dpano.configFile=/path/to/custom.conf -jar Pano-1.0.0.jar
```

Eğer belirtilmezse, Pano JAR dosyasıyla aynı klasördeki varsayılan `config.conf` dosyasını kullanır.

**Kurulum süreci** sırasında; veritabanı bilgileri, yönetici kimlik bilgileri ve URL’ler gibi bazı değerler otomatik olarak **yazılır veya üzerine yazılır**.  
Bu değerleri manuel olarak değiştirirseniz, Pano bunları başlatma veya sonraki güncellemelerde **üzerine yazabilir**.  
Sadece ne yaptığınızı biliyorsanız düzenleyin ve değişiklik yapmadan önce her zaman yedek alın.

## 🪄 Otomatik Geçişler (Auto-Migrations)

Pano her başlatıldığında, yapılandırmanızdaki **`config-version`** alanını kontrol eder. Dosyadaki sürüm mevcut Pano sürümünün gereksinimlerinden daha eskiyse, Pano **otomatik olarak gerekli geçişleri gerçekleştirir**. Bu, yapılandırmanızın ve veritabanınızın manuel müdahale olmaksızın en son özellikler ve güvenlik güncellemeleriyle uyumlu kalmasını sağlar.

## 🔤 Genel Ayarlar

```jsonc
# Geçişler için kullanılan yapılandırma sürümü (ELLE değiştirmeyin)
config-version = <int>

# Geliştirme modunu etkinleştir veya devre dışı bırak (varsayılan: false)
development-mode = false

# Arayüz dili kodu (yönetim panelinden eklenip düzenlenebilir)
locale = "en-US"

# Web sitenizin genel URL'si (e-postalar, çerezler vb. için gereklidir)
website-url = "http://yourdomain.com"

# Kullanıcıların tercih ettikleri dili seçmelerine izin ver (varsayılan: true)
allow-user-locale-selection = true

# Kullanıcılara gösterilen kayıt sözleşmesi (HTML destekler)
register-agreement = ""

# Web sitesi adı ve açıklaması
website-name = ""
website-description = ""

# Bildirimler ve şifre sıfırlama için kullanılan destek e-postası
support-email = ""

# Oyunculara gösterilen Minecraft sunucu bilgileri
server-ip-address = "play.ipadress.com"
server-game-version = "1.8.x"

# SEO anahtar kelimeleri
keywords = []
```

**İpuçları**

- `config-version`: dahili olarak geçişler için kullanılır — **yeniden adlandırmayın veya düzenlemeyin**.
- `development-mode`: varsayılan olarak **false**’dur; yalnızca hata ayıklama için **true** yapın.
- `locale`: kısa kodlar kullanın, örneğin `en-US` veya `tr` (diller panelden eklenebilir).
- `website-url`: web sitenizin temel URL'si. Bu, sistem e-postaları oluşturmak, oturum çerezlerini yönetmek ve diğer platform özellikleri için **zorunludur**.
- `allow-user-locale-selection`: kullanıcıların mevcut diller arasından kendi dillerini seçme yeteneğini etkinleştirir/devre dışı bırakır (varsayılan: `true`). **Panel → Ayarlar → Platform → Tercihler** bölümünden yönetilebilir.
- `register-agreement`: kullanıcı kaydı sırasında gösterilen şartları veya kuralları tanımlar. Bu alan biçimlendirme için **HTML etiketlerini destekler**.
- `server-ip-address`: temada görünür — oyuncular bunu **kopyalayıp sunucuya bağlanabilir**.

## 🗄️ Veritabanı Yapılandırması

```jsonc
database {
  type = "mariadb" # "mariadb" (MySQL/MariaDB için) veya "portable"
  host = ""        # örn: "127.0.0.1:3306"
  name = ""        # veritabanı adı
  username = ""
  password = ""    # veritabanında şifre yoksa boş olabilir
  prefix = "pano_" # tablo öneki (kurulumdan sonra değiştirmeyin)
}
```

**Notlar**

- **Veritabanı Türleri:**
    - `mariadb`: Varsayılan tür, hem **MySQL 5.5+** hem de **MariaDB** ile uyumludur.
    - `portable`: Yalnızca **Windows (x64 ve ARM64)** üzerinde desteklenir. Pano tarafından otomatik olarak yönetilir (detaylar için [Kurulum Rehberi →](../installation) sayfasına bakın).
- Şifre boş bırakılabilir (kimlik doğrulama devre dışıysa).
- **Uyarı:** Kurulumdan sonra `type` veya `prefix` değiştirmek desteklenmez ve **yeniden kurulum** gerektirebilir.

## 👤 Pano Hesabı (Opsiyonel)

```jsonc
pano-account {
  username = ""
  email = ""
  access-token = ""   # Pano hesabınız için güvenli token
  platform-id = ""    # hesap ID’si
  
  connect {
    public-key = ""
    private-key = ""
    state = ""
  }
}
```

**Önemli**

- Ne yaptığınızı bilmiyorsanız **manuel olarak düzenlemeyin**.
- **Panel → Ayarlar → Platform** üzerinden bağlantıyı yönetin.
- **Market özellikleri** (güncellemeler, mağaza yüklemeleri) için gereklidir.
- Daha fazla bilgi için bkz. [Pano Hesabınızı Bağlayın →](./advanced/connect-pano-account)

## 🎨 Tema

```jsonc
current-theme = "vanilla-theme"
```

**Detaylar**

- Hangi temanın aktif olduğunu belirler.
- Geçersiz bir tema ID’si kullanılırsa, **Pano `vanilla-theme`’e döner**.
- **Panel → Görünüm → Temalar** üzerinden değiştirilebilir.

## ✉️ E-posta (SMTP)

```jsonc
email {
  enabled = false
  sender = ""      # örn: "Pano <no-reply@domain.com>" - genelde kullanıcı adıyla aynı olmalıdır
  hostname = ""    # örn: "smtp.gmail.com"
  port = 465
  username = ""    # örn: "no-reply@domain.com"
  password = ""
  ssl = true
  starttls = ""    # "DISABLED" veya "OPTIONAL" veya "REQUIRED"
  authMethods = "" # opsiyonel, genelde "PLAIN"
}
```

**Bilgi**

- Kurulum sırasında opsiyoneldir; sonradan **Panel → Ayarlar → Platform** üzerinden yapılandırılabilir.
- SMTP olmadan, şifre sıfırlama ve doğrulama e-postaları çalışmaz.

## 🌐 Sunucu Ayarları

```jsonc
server {
  host = "0.0.0.0"
  http-port = 80
  https-port = 443
  ssl-mode = "DISABLED" # "DISABLED", "LETS_ENCRYPT", "MANUAL"
  redirect-https = false
  ssl-cert = null # Ham sertifika içeriği (MANUAL ise)
  ssl-key = null  # Ham özel anahtar içeriği (MANUAL ise)
}
```

- `host`: `0.0.0.0` paneli dış ağlara açık hale getirir; `127.0.0.1` erişimi yalnızca yerel ile sınırlandırır.
- `http-port`: HTTP trafiği için varsayılan port (genellikle **80**).
- `https-port`: HTTPS trafiği için varsayılan port (genellikle **443**).
- `ssl-mode`:
    - `DISABLED`: HTTPS sunucusu başlatılmaz.
    - `LETS_ENCRYPT`: Otomatik olarak bir SSL sertifikası almaya ve yapılandırmaya çalışır. **Not:** Bunun çalışması için geçerli bir `website-url` yapılandırılmalı, **http-port** `80` ve **https-port** `443` olarak ayarlanmalıdır.
    - `MANUAL`: Kendi sertifikanızı ve anahtar dize bilgilerinizi doğrudan `ssl-cert` ve `ssl-key` üzerinden sağlamanıza olanak tanır.
- `redirect-https`: `true` olarak ayarlanırsa, tüm HTTP trafiği otomatik olarak HTTPS'ye yönlendirilir.
- **Gelişmiş:** Karmaşık kurulumlar için hala bir **reverse proxy** (Nginx, Apache) veya Cloudflare kullanabilirsiniz.

## 🧩 Başlatma, Arayüz ve Güncellemeler

```jsonc
init-ui = true
accept-plugin-auth = true
jwt-key = "<auto-generated-base64>"
update-period = "ONCE_PER_DAY" # "ONCE_PER_DAY" veya "ONCE_PER_WEEK" veya "ONCE_PER_MONTH"
release-channel = "RELEASE" # "ALPHA", "BETA", "RELEASE"
```

**Detaylar**

- `init-ui`: başlatma sırasında **kurulum sihirbazını, paneli ve tema motorunu** başlatır.
- `accept-plugin-auth`: Pano MC eklentisinin bağlantısını etkinleştirir/devre dışı bırakır (varsayılan: `true`). **Sunucu Bağla** modalından yönetilebilir. Daha iyi güvenlik için kullanılmadığında devre dışı bırakın.
- `jwt-key`: otomatik oluşturulan **Base64 kimlik anahtarıdır** — **manuel değiştirmeyin**.
- `update-period`: güncelleme kontrol sıklığını belirler.
- `release-channel`: Pano'nun hangi güncelleme akışını izleyeceğini belirler:
    - `ALPHA`: Yeni özelliklere erken erişim. Hatalar ve bozucu değişiklikler riski yüksektir.
    - `BETA`: Alfa'dan daha düşük riskli, ancak yine de hata içerebilen yayın öncesi özellikler.
    - `RELEASE`: En kararlı sürüm. Güncellemeleri daha seyrek alır ancak maksimum güvenilirlik sağlar.

## 📁 Dosya Yükleme ve Yollar

```jsonc
file-uploads-folder = "file-uploads"

file-paths = {
  favicon {
    path = "uploads/favicon.png"
    hash = "<sha256-hash>"
  }
  websiteLogo {
    path = "uploads/logo.png"
    hash = "<sha256-hash>"
  }
}
```

**Notlar**

- **Panel → Ayarlar → Website** tarafından yönetilir.
- Her giriş, şunları içeren bir **FileInfo** nesnesidir:
    - `path`: Dosyanın göreli yolu.
    - `hash`: Pano tarafından dosya bütünlüğünü doğrulamak için kullanılan SHA-256 karması.
- Yalnızca iki giriş desteklenir: `favicon` ve `websiteLogo`.
- Bu alanlar **Pano tarafından otomatik olarak yönetilir** — manuel değişiklikler güncellemelerde veya ayar değişikliklerinde üzerine yazılır.

## 🔗 Pano Servis URL’leri (Değiştirmeyin)

```jsonc
pano-api-url = "..."     # ortama göre otomatik ayarlanır
pano-website-url = "..."
```

- Pano tarafından otomatik olarak yönetilir.
- Bunları değiştirmek, Pano ekosistemiyle bağlantı sorunlarına yol açabilir.

## 🧱 Kurulum İlerlemesi (Dahili)

```jsonc
setup {
  step = 0
}
```

**Kullanım**

- Kurulum ilerlemesini takip eder.
- Düzenlemeden önce **Pano’yu kapatın**.
- `step = 0`: kurulum sihirbazını yeniden başlatır.
- `step = 5`: kurulumu tamamlanmış olarak işaretler.
- Sadece destek ekibinin yönlendirmesiyle değiştirin; yanlış düzenleme kurulumu bozabilir.

## ✅ Son Kontrol Listesi

- `development-mode = false`
- Port **80 (TCP)** açık ve erişilebilir
- HTTPS etkin (Pano SSL veya Reverse Proxy aracılığıyla) ve Port **443 (TCP)** açık
- Güvenli ve özel `jwt-key`
- Geçerli SMTP bilgileri yapılandırılmış
- Veritabanı öneki kurulum sonrası değiştirilmemiş
- Doğru tema ID’si ayarlanmış aksi taktirde Vanilla Tema çalışır
- Veritabanı ve yüklemeler için düzenli yedekleme yapılmış

## 🧪 Örnek Minimal Yapılandırma

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

## 🔄 Düzenleme Sonrası

- Düzenledikten sonra **Pano’yu yeniden başlatın**.
- Otomatik oluşturulan alanları (ör. `jwt-key`, `config-version`) değiştirmeyin.
- Başlatma başarısız olursa, sözdizimini kontrol edin.
- Yükseltme veya yeniden kurulumdan önce her zaman yedek alın.

> Yardıma mı ihtiyacınız var? SSS’ye göz atın, [Discord topluluğumuza](https://discord.gg/6vVy72wgXT) katılın veya  
> [GitHub](https://github.com/PanoMC/Pano/issues) üzerinden sorun bildirin.
