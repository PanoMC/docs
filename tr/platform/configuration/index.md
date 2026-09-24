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
  - `"WEBSITE"`: yalnızca web sitesi — klasik Pano deneyimi.
  - `"SERVERS"`: yalnızca Minecraft sunucu yönetimi — asıl ürün paneldir. Kenar çubuğunda **Yazılar**, **Talepler** ve **Görünüm** gizlenir; herkese açık tüm adresler `/panel` adresine yönlendirilir.
  - `"BOTH"`: web sitesi + sunucu yönetimi. Varsayılan değerdir; mevcut kurulumlar bu değere taşınır — yani davranışları hiç değişmez.
  - `"SERVERS"` modunda Pano tema sürecini hiç başlatmaz: panelin `/panel/login` adresinde [kendi giriş sayfası](../server-management/#web-sitesi-olmadan-oturum-acma) vardır. Modu buradan değiştirmek, yeniden başlatmaya gerek kalmadan temayı başlatır ya da durdurur.
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

- Pano'nun **kendi makinesinde** çalıştırabildiği `pano-node` arka plan servisini (daemon) yönetir;
  **Panel → Sunucular → Düğümler → Yerel düğüm** üzerinden tek tuşla kurulur. Bu servis, *yönetilen*
  Minecraft sunucularını kuran ve gözeten bileşendir; bkz. [Sunucu Yönetimi →](../server-management/).
- Servis her zaman **ayrı bir süreç** olarak çalışır, hiçbir zaman Pano'nun JVM'inin içinde değil —
  amaç tam da budur: Pano'yu yeniden başlatmak veya güncellemek, yönettiği Minecraft sunucularını
  çevrimdışına almamalıdır.
- `enabled`: `false` yapıldığında Pano hiç yerel düğüm başlatmaz ve gözetmez. Panel bu durumda yerel
  düğümü devre dışı olarak gösterir. Varsayılan **true**.
- `jar-path`: `pano-node.jar` için açık yol. Boş bırakılırsa Pano önce kendi jar dosyasının yanına ve
  çalışma dizinine bakar; bulamazsa kendi jar'ının içinde taşıdığı `pano-node.jar` dosyasını oraya
  çıkarır — `/api/node/pano-node.jar` adresinden sunduğu dosya da budur ve Pano kendini her
  güncellediğinde yenilenir.
- `java-path`: servisin başlatılacağı **17 veya üzeri** Java dizini (ya da içindeki `java` çalıştırılabilir
  dosyası). Boş bırakılırsa Pano kendisi arar: üzerinde çalıştığı JVM, `JAVA_HOME`, `/usr/lib/jvm`,
  `/Library/Java/JavaVirtualMachines`, Windows'taki alışılmış `C:\Program Files` konumları ve `PATH`
  üzerindeki `java` — ardından bulduklarının en yenisini seçer. Bu ayrı bir ayardır çünkü **Pano'nun
  kendisi Java 11+ ile çalışırken `pano-node.jar` 17+ ister**: Java 11 üzerinde çalışan bir sunucuda
  servise Pano'nun kendi JVM'ini vermek, her başlatmada `UnsupportedClassVersionError` ile ölmesi
  demektir. Uygun bir sürüm bulunamazsa yerel düğüm kurulumu sonsuza kadar yeniden denemek yerine
  okunabilir bir hatayla başarısız olur ve **Panel → Sunucular → Düğümler** nedeni gösterir.
- `stop-with-pano`: Pano dururken servisin de durdurulup durdurulmayacağı. Varsayılan **false**;
  böylece yönetilen sunucular panel yeniden başlatılırken çalışmaya devam eder — Pano'yu yeniden
  başlatan bir yönetici, oyuncularının bağlantısının kesilmesini istemiş değildir. Her şeyin birlikte
  kapanmasını istiyorsanız `true` yapın.
## Yönetilen Sunucular (Managed Servers)

```jsonc
managed-servers {
  plugin-jar-dir = null
  node-auto-update = true
  accept-agent-links = true
}
```

**Detaylar**

- Pano'nun bir düğüm üzerinden kurup çalıştırdığı Minecraft sunucularıyla ilgili ayarlar — bkz.
  [Yönetilen sunucular →](../server-management/#yonetilen-sunucular).
- Pano, oluşturduğu her yönetilen sunucuya **Pano MC Eklentisi**'ni kurar; böylece çalıştırdığı bir
  sunucu aynı zamanda konuşabildiği bir sunucu olur. Varsayılan olarak yayınlanmış en yeni eklenti
  sürümünü kullanır.
- `plugin-jar-dir`: eklentiyi indirmek **yerine** kullanılacak, yerelde derlenmiş `pano-mc-plugin`
  jar'larının bulunduğu klasör. Bir `pano-mc-plugin` çalışma kopyasını gösterirseniz, orada bulunan
  en yeni `<modül>/build/libs/pano-<platform>-*.jar` dosyası Pano'nun kurduğu her sunucuya
  kopyalanır. Bu bir **eklenti geliştirme** ayarıdır; gerçek bir kurulumda boş bırakın, Pano
  yayınlanmış en yeni sürümü alsın.
- `node-auto-update`: bir düğüm, Pano'nun sunduğundan daha eski bir `pano-node` ile bağlandığında
  Pano'nun onu — ve her **Pano Agent**'ı — kendi sunduğu sürüme otomatik olarak güncelleyip
  güncellemeyeceği. Varsayılan **true**. Düğüm yeni daemon'u Pano'dan indirir, sağlama toplamını
  doğrular ve yeniden başlar; Minecraft sunucuları çalışmaya devam eder. Pano bunu **düğüm ve sürüm
  başına 30 dakikada en fazla bir kez** dener, düğüm bir görev çalıştırırken (kurulum, içe aktarma,
  yedekleme) asla denemez — 5 dakikada bir yeniden bakar — ve her otomatik güncellemeyi etkinlik
  kaydına yazar. Düğümleri yalnızca **Panel → Sunucular → Düğümler** üzerinden elle güncellemek için
  `false` yapın. **Panel → Ayarlar → Güncellemeler** aynı anahtarı yazar.
- `accept-agent-links`: Pano'nun yeni **Pano Agent** bağlantılarını kabul edip etmeyeceği —
  **Pano Agent ile bağla** penceresindeki anahtar aynı ayarı yazar. Varsayılan **true**. `false`
  olduğunda pencere kod vermez, daha önce gösterdiği her kod anında geçersiz olur ve bu kodlardan
  biriyle eşleşmeye çalışan agent, yanlış bir kod girilmiş gibi reddedilir. Zaten bağlı olan
  agent'lar çalışmaya devam eder; bir düğümü düğüm koduyla eşleştirmek bundan etkilenmez. Bkz.
  [Pano Agent →](../server-management/pano-node/#the-pano-agent).
## Eklenti Kaynakları (Plugin Sources)

```jsonc
plugin-sources {
  curseforge-api-key = null
}
```

**Detaylar**

- Panelin, yönetilen bir sunucuya kurmak üzere eklenti ve modları nerede aradığı — bir sunucunun
  eklentiler sayfasındaki **Gözat** sekmesi. Bkz.
  [Eklentiler ve modlar →](../server-management/#eklentiler-ve-modlar).
- **Modrinth** ve **Hangar** anahtar istemez ve her zaman açıktır. Onlar için yapılandırılacak bir
  şey yoktur.
- `curseforge-api-key`: bir **CurseForge Eternal API anahtarı**, CurseForge kaynağını etkinleştirir.
  CurseForge her uygulamanın kendi anahtarını kullanmasını şart koştuğu için Pano hazır bir anahtar
  dağıtamaz — [console.curseforge.com](https://console.curseforge.com) adresinden bir tane isteyip
  buraya yapıştırın. Varsayılan **boş**tur; bu da kaynağı kapalı bırakır: panel, CurseForge'u
  nedeniyle birlikte kullanılamaz olarak listeler ve diğer ikisinde arama yapar.
- Geliştiricisinin üçüncü taraf indirmelerine izin vermediği bir CurseForge projesi hiçbir dosya
  sunmaz. Yine de listelenir ama içinden hiçbir şey kurulamaz — onu CurseForge'dan indirip jar'ı
  [dosya yöneticisiyle](../server-management/#dosyalar) yükleyin.
