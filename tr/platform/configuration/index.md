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

## 🔤 Genel Ayarlar

```jsonc
# Geçişler için kullanılan yapılandırma sürümü (ELLE değiştirmeyin)
config-version = <int>

# Geliştirme modunu etkinleştir veya devre dışı bırak (varsayılan: false)
development-mode = false

# Arayüz dili kodu (yönetim panelinden eklenip düzenlenebilir)
locale = "en-US"

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
- `server-ip-address`: temada görünür — oyuncular bunu **kopyalayıp sunucuya bağlanabilir**.

## 🗄️ Veritabanı Yapılandırması

```jsonc
database {
    host = ""        # örn: "127.0.0.1:3306"
    name = ""        # veritabanı adı
    username = ""
    password = ""    # veritabanında şifre yoksa boş olabilir
    prefix = "pano_" # tablo öneki (kurulumdan sonra değiştirmeyin)
}
```

**Notlar**

- **MySQL 5.5+** ve **MariaDB** desteklenir.
- Şifre boş bırakılabilir (kimlik doğrulama devre dışıysa).
- `prefix`’i değiştirmek veri bozulmasına neden olabilir — **yeniden kurulum** gerekebilir.

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
    port = 80
}
```

**Açıklama**

- `127.0.0.1`: yalnızca yerel erişim sağlar.
- `0.0.0.0`: dış ağlardan erişim sağlar.
- Varsayılan port **80 (TCP)**’dir — açık olduğundan emin olun.
- HTTPS için **reverse proxy** (ör. Nginx) veya Cloudflare kullanın.

## 🧩 Başlatma, Arayüz ve Güncellemeler

```jsonc
init-ui = true
jwt-key = "<auto-generated-base64>"
update-period = "ONCE_PER_DAY" # "ONCE_PER_DAY" veya "ONCE_PER_WEEK" veya "ONCE_PER_MONTH"
ui-address = "http://localhost:3000"
```

**Detaylar**

- `init-ui`: başlatma sırasında **kurulum sihirbazını, paneli ve tema motorunu** başlatır.
- `jwt-key`: otomatik oluşturulan **Base64 kimlik anahtarıdır** — **manuel değiştirmeyin**.
- `update-period`: güncelleme kontrol sıklığını belirler.
- `ui-address`: sistem e-postalarındaki bağlantılar için kullanılır (ör. şifre sıfırlama).

## 📁 Dosya Yükleme ve Yollar

```jsonc
file-uploads-folder = "file-uploads"

file-paths = {
    favicon = "path/to/favicon"
    websiteLogo = "path/to/logo"
}
```

**Notlar**

- **Panel → Ayarlar → Website** tarafından yönetilir.
- Yalnızca iki giriş desteklenir:
    - `favicon`
    - `websiteLogo`
- Manuel değişiklikler güncellemelerde veya ayar değişikliklerinde üzerine yazılır.

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
- HTTPS için reverse proxy kurulmuş (opsiyonel)
- Güvenli ve özel `jwt-key` (otomatik)
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
