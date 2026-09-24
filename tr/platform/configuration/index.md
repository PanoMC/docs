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

# Bu kurulumun nasıl kullanıldığı: "WEBSITE", "SERVERS" veya "BOTH" (varsayılan: "BOTH")
usage-mode = "BOTH"

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
- `usage-mode`: bu kurulumun nasıl kullanıldığını belirler. Kurulum sihirbazının ilk ekranında seçilir ve istediğiniz zaman **Panel → Ayarlar → Platform → Tercihler** bölümünden (üç seçilebilir kutu) değiştirilebilir.
  - `"WEBSITE"`: yalnızca web sitesi — klasik Pano deneyimi. Sunucu yönetimi sayfalarıyla ve API'leriyle birlikte kapatılır. Pano MC Plugin ile Minecraft sunucusu bağlamak çalışmaya devam eder, zaten eşleşmiş düğümler de sunucularını çalıştırmayı sürdürür.
  - `"SERVERS"`: yalnızca Minecraft sunucu yönetimi — asıl ürün paneldir. **Yazılar**, **Talepler** ve **Görünüm** (temalar) sayfalarıyla ve API'leriyle birlikte kapatılır; herkese açık tüm adresler `/panel` adresine yönlendirilir. Geri geçince yeniden başlatmaya gerek kalmadan geri gelirler; mevcut yazılar ve talepler korunur.
  - `"BOTH"`: web sitesi + sunucu yönetimi. Varsayılan değerdir; mevcut kurulumlar bu değere taşınır — yani davranışları hiç değişmez.
  - `"SERVERS"` modunda Pano tema sürecini hiç başlatmaz: oturumu kapalı ziyaretçiler her panel adresinde [panelin kendi giriş formunu](../server-management/#using-pano-without-a-website) görür ve yalnızca panel erişimi olan hesaplar giriş yapabilir. Modu buradan değiştirmek, yeniden başlatmaya gerek kalmadan temayı başlatır ya da durdurur.
- `allow-user-locale-selection`: kullanıcıların mevcut diller arasından kendi dillerini seçme yeteneğini etkinleştirir/devre dışı bırakır (varsayılan: `true`). **Panel → Ayarlar → Platform → Tercihler** bölümünden yönetilebilir.
- `register-agreement`: kullanıcı kaydı sırasında gösterilen şartları veya kuralları tanımlar. Bu alan biçimlendirme için **HTML etiketlerini destekler**.
- `server-ip-address`: temada görünür — oyuncular bunu **kopyalayıp sunucuya bağlanabilir**.

> Siteyi bir süreliğine kapatmanız mı gerekiyor? `maintenance` bloğunun kendi sayfası var: [Bakım Modu →](../maintenance/).
## Tema

```jsonc
current-theme = "vanilla-theme"
```

**Detaylar**

- Hangi temanın aktif olduğunu belirler.
- Geçersiz bir tema ID’si kullanılırsa, **Pano `vanilla-theme`’e döner**.
- **Panel → Görünüm → Temalar** üzerinden değiştirilebilir.
## Minecraft Sunucu Bağlantısı

```jsonc
mc-server-connection {
  heartbeat-interval-seconds = 25
  heartbeat-timeout-seconds = 75
}
```

**Detaylar**

- **Pano'nun kendisinin**, bağlı her Minecraft sunucusuna (`pano-mc-plugin` üzerinden) gönderdiği
  uygulama seviyesindeki WebSocket heartbeat'i. Bu, eklentinin **kendi** `config.conf` dosyasındaki
  `heartbeat-interval` / `heartbeat-timeout` ayarlarından ayrıdır ve onlara ek olarak çalışır: her iki
  taraf da bağımsız olarak, kendi zamanlamasında ping gönderir. İki ayarın bir ters vekilin boşta kalma
  zaman aşımıyla nasıl etkileştiğini görmek için bkz.
  [Ters Vekil Arkasında WebSocket Bağlantısını Canlı Tutma](server/#ters-vekil-arkasında-websocket-baglantısını-canlı-tutma).
- `heartbeat-interval-seconds`: Pano'nun bağlı her Minecraft sunucusuna gönderdiği heartbeat ping'leri
  arasındaki saniye sayısı. Varsayılan **25**.
- `heartbeat-timeout-seconds`: bir pong gelmeden beklenecek saniye sayısı; bu süre dolarsa Pano o
  Minecraft sunucusunun bağlantısını ölü sayar ve kapatır. Varsayılan **75**.
- Her iki değer de başlangıçta doğrulanır: `heartbeat-interval-seconds` `0`'dan büyük ve en fazla **55**
  olmalıdır; `heartbeat-timeout-seconds` ise aralığın en az **iki katı** olmalıdır. Bu sınırların dışında
  kalan bir çift sessizce reddedilmez — Pano başlatılamamak yerine bir uyarı kaydeder ve her iki
  değer için de varsayılan **25s** / **75s**'ye döner. Eklenti tarafının (biraz daha katı) kuralı için
  bkz.
  [Ters Vekil Arkasında WebSocket Bağlantısını Canlı Tutma](server/#ters-vekil-arkasında-websocket-baglantısını-canlı-tutma).

## Yerel Düğüm (Local Node)

```jsonc
local-node {
  enabled = true
  jar-path = null
  java-path = null
  stop-with-pano = false
}
```

**Detaylar**

- Pano'nun **kendi makinesinde** çalıştırdığı `pano-node` arka plan süreci — bkz.
  [Düğüm ekleme →](../server-management/managed-servers/#adding-a-node).
- `enabled`: `false`, Pano'nun hiç yerel düğüm başlatmamasını sağlar. Varsayılan **true**.
- `jar-path`: `pano-node.jar` için açık bir yol; Pano bunu hiçbir zaman değiştirmez. Boş bırakılırsa Pano kendi yanına ve çalışma klasörüne bakar, kendi jar'ında gömülü kopyayı oraya çıkarır.
- `java-path`: arka plan süreci için bir **Java 17+** kökü (ya da içindeki `java` ikilisi). Boş
  bırakılırsa Pano uygun birini kendisi arar. Pano'nun kendisi Java 11 ile çalışır, ama arka plan
  süreci 17 ister.
- `stop-with-pano`: Pano durduğunda arka plan sürecini de durdurur. Varsayılan **false**; böylece
  sunucular Pano yeniden başlatılırken çalışmaya devam eder.

## Yönetilen Sunucular (Managed Servers)

```jsonc
managed-servers {
  plugin-jar-dir = null
  node-auto-update = true
  accept-agent-links = true
}
```

**Detaylar**

- Pano'nun bir düğüm üzerinden çalıştırdığı sunucuların ayarları — bkz.
  [Sunucu Yönetimi →](../server-management/#linked-and-managed-servers).
- `plugin-jar-dir`: yayınlanmış sürüm yerine kurulacak, yerelde derlenmiş `pano-mc-plugin` jar'larının
  bulunduğu klasör. Yalnızca eklenti geliştirme içindir; boş bırakın.
- `node-auto-update`: daha eski bir sürümle bağlanan düğümleri ve
  [Pano Agent'ları](../server-management/pano-node/#pano-agent) Pano'nun kendi arka plan süreci sürümüne
  günceller. Sunucular çalışmaya devam eder. Varsayılan **true**. **Panel → Ayarlar → Güncellemeler**
  aynı anahtarı değiştirir.
- `accept-agent-links`: yeni Pano Agent bağlantılarını kabul eder. Varsayılan **true**. `false`
  olduğunda yeni hiçbir agent eşleşemez; zaten bağlı agent'lar çalışmaya devam eder.

## Eklenti Kaynakları (Plugin Sources)

```jsonc
plugin-sources {
  curseforge-api-key = null
}
```

**Detaylar**

- Bir sunucunun **Keşfet** sekmesinin aradığı eklenti siteleri — bkz.
  [Eklentiler ve Modlar →](../server-management/server-pages/#plugins-and-mods).
- Modrinth ve Hangar anahtar istemez.
- `curseforge-api-key`: [console.curseforge.com](https://console.curseforge.com) adresinden
  alacağınız kendi anahtarınız CurseForge'u açar. Boş bırakılırsa kapalı kalır.
