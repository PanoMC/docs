# Ayar Dosyası Rehberi

Pano, ayarlarını yönetmek için **HOCON** (Human-Optimized Config Object Notation) yapılandırma dosyasını kullanır.  
HOCON, JSON’a benzer ancak okunması daha kolaydır — yorum satırlarını, tırnaksız dizeleri ve sondaki virgülleri destekler.  
Daha fazla bilgi için:  
 [Lightbend HOCON Belgeleri](https://github.com/lightbend/config/blob/main/HOCON.md)

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

## Otomatik Geçişler (Auto-Migrations)

Pano her başlatıldığında, yapılandırmanızdaki **`config-version`** alanını kontrol eder. Dosyadaki sürüm mevcut Pano sürümünün gereksinimlerinden daha eskiyse, Pano **otomatik olarak gerekli geçişleri gerçekleştirir**. Bu, yapılandırmanızın ve veritabanınızın manuel müdahale olmaksızın en son özellikler ve güvenlik güncellemeleriyle uyumlu kalmasını sağlar.
## Genel Ayarlar

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
## Tema

```jsonc
current-theme = "vanilla-theme"
```

**Detaylar**

- Hangi temanın aktif olduğunu belirler.
- Geçersiz bir tema ID’si kullanılırsa, **Pano `vanilla-theme`’e döner**.
- **Panel → Görünüm → Temalar** üzerinden değiştirilebilir.
