# Yönetilen Sunucular

Yönetilen bir sunucuyu Pano bir **düğüm** üzerinde kurar ve çalıştırır — düğüm,
[`pano-node`](../pano-node/) arka plan sürecini çalıştıran bir makinedir. Düğüm Pano'ya **dışarı
doğru** bağlanır; bu yüzden üzerinde hiçbir portun açılması gerekmez. Düğümler, sunucu seçicinin
yanındaki **düğüm simgesinden** yönetilir ve **Düğümleri Yönet** izni gerektirir.

## Düğüm ekleme {#adding-a-node}

**Düğüm ekle** penceresinin dört sekmesi vardır:

| Sekme | |
| --- | --- |
| **Yerel** | Pano'nun kendi makinesi, tek tıkla. Java 17+ ister. Dosyalar `<pano-dir>/node-data/`, günlük `<pano-dir>/logs/pano-node.log` içine gider. |
| **Elle** | Herhangi bir makine: gösterdiği tek satırlık komutu çalıştırın, ardından düğümü onaylayın. |
| **SSH** | Makine anahtarını onayladıktan sonra kurulumu Pano sizin yerinize SSH üzerinden yapar. Giriş bilgileri hiçbir zaman saklanmaz. |
| **Coolify** | `ghcr.io/panomc/pano-node` konteynerini bir `/data` birimi ve oyun portlarıyla dağıtır. |

Elle komutu şuna benzer (kod her 30 saniyede bir yenilenir):

```bash
curl -fsSL https://panel.example.com/api/node/install.sh | sh -s -- --pano 'https://panel.example.com' --code '123456'
```

Yalnızca kendi kurduğunuz düğümleri kabul edin. Bir düğüm site adresinize ulaşamıyorsa (NAT, bir SSH
tüneli), **Gelişmiş** altında **Düğümün ulaşabileceği Pano adresi**'ni ayarlayın.

Daha eski bir arka plan süreci çalıştıran düğüm **Güncelleme var** gösterir; güncelleme birkaç saniye
sürer ve sunucuları çalışmaya devam eder. **Bir düğümü kaldırmak üzerindeki her sunucuyu ve yedeği
siler.**

## Sunucu oluşturma {#creating-a-server}

**Sunucu ekle → Yeni sunucu oluştur** (**Sunucu Oluştur** izni gerekir) sizi **Kaynak → Düğüm →
Yazılım → Ayarlar → Özet** adımlarından geçirir.

- **Yazılım:** Paper (önerilen), Purpur, Folia, Spigot, Fabric, Vanilla ve proxy'ler: Velocity
  (önerilen), Waterfall ve BungeeCord. **Spigot** düğümde BuildTools ile derlenir — bir sürümün ilk
  derlemesi yaklaşık on dakika sürer, sonrakiler onu yeniden kullanır. Derleme bir JDK ister; makinede
  yoksa düğüm bir tane indirir.
- **Ayarlar:** ad, bellek, port (boş = `25565-25600` aralığından boş bir port), Java sürümü, JVM
  argümanları, **Pano ile başlat**, **Çökünce yeniden başlat**, **Beyaz liste** (varsayılan olarak
  kapalı; içe aktarmalarda ve proxy'lerde yok) ve Minecraft EULA.
- Düğüm sunucuyu indirir, Pano eklentisini eşleşmiş hâlde kurar ve sunucuyu başlatılmaya hazır,
  **Durduruldu** durumunda bırakır.
- **Fabric** ve **Quilt**'te Pano modu Fabric API'ye ihtiyaç duyar; sunucuda yoksa düğüm onu da kurar
  (o Minecraft sürümüne ait yapıyı Modrinth'ten). Pano modu Minecraft 26.1+
  ister; daha eski sürümlerde ya da Fabric API yapısı yoksa kurulmaz ve görev bunu belirtir.

**İçe aktarma:** kaynak olarak **düğümdeki mevcut bir klasörü** (kopyalanır, asla taşınmaz), bir
**`.zip` yüklemesini** (1 GB'a kadar) ya da bir **Modrinth modpack**'ini de seçebilirsiniz. Yazılımı ve
sürümü Pano kendisi algılar. Sunucusu hâlâ çalışan bir klasörü asla içe aktarmayın.

> Proxy arkasındaki bir arka uç sunucu genellikle `online-mode=false` ile çalışır — onu internetten
> erişilemez tutun, yoksa herkes istediği kimlikle girebilir.

## Sunucu ayarları {#server-settings}

Değişiklikler bir sonraki açılışta uygulanır.

- **Başlangıç:** Java sürümü, bellek, port, JVM argümanları, **Pano ile başlat**, **Çökünce yeniden
  başlat**.
- **Bellek**, yalnızca Java heap'i değil sunucunun toplam belleğidir: JVM bunun 512 MB artı %15'ini
  (en fazla 2 GB) kendine ayırır, kalanı heap'e verilir ama heap asla yarısının altına düşmez —
  örneğin 2048 MB 1229 MB heap, 4096 MB ise 2970 MB heap demektir. Panel, ortaya çıkan heap'i alanın
  altında gösterir. Docker çalışma ortamında konteynerin sınırıdır. Heap, üst sınırının dörtte
  biriyle başlar ve gerektikçe büyür; Java 12+ üzerinde boşta duran sunucu belleği geri verir. Kendi
  JVM argümanlarınız yine önceliklidir.
- **Server properties:** `server.properties` için bir form. Yalnızca değiştirdiğiniz anahtarlar
  yazılır; dosyanın geri kalanı olduğu gibi kalır.
- **Java:** **Otomatik** seçiliyken Minecraft sürümünün desteklediği en düşük sürüm — 26.1+ için 25,
  1.20.5–1.21 için 21, 1.17–1.20.4 için 17, 1.16.5 için 16, daha eskiler için 8. Eksik bir Java'yı
  düğüm indirir.
- **Tehlikeli bölge → Yazılımı değiştir / Yeniden Yükle:** başka bir yazılıma ya da sürüme geçer;
  dünyaları, eklentileri ve yapılandırmayı uydukları ölçüde korur. Önce bir yedek alınır, başarısız
  bir değişiklik geri alınır. Dünyalar korunarak **daha eski** bir Minecraft sürümüne geçilirse sunucu
  açılışta durur — pencere bu konuda uyarır; geri dönmek için değişiklik öncesi yedeği geri yükleyin.
  **Sunucu Oluştur** izni ve parolanızı ister.
- **Sunucuyu kaldır:** yönetilen bir sunucuda bu, klasörünü **ve yedeklerini** siler. Bağlı bir sunucu
  ise yalnızca Pano'dan kaldırılır.

## Bir şeyler ters gittiğinde {#troubleshooting}

- **Düğüm çevrimdışı kalıyor** — yerel düğüm Java 17+ ister (`LOCAL_NODE_JAVA_MISSING`); Pano onu
  bulamıyorsa `local-node.java-path` ayarlayın. Aksi hâlde `pano-node.log` dosyasına bakın.
- **Kurulum başarısız oluyor** — düğümün indirme sitelerine internet erişimi ve boş disk alanı
  olmalı. Sunucu başlığı sebebiyle birlikte **Kurulum başarısız oldu** uyarısını ve **Yeniden
  Yükle** / **Yazılımı değiştir** düğmelerini göstermeye devam eder; bir kurulum başarılı olana
  kadar sunucu başlatılamaz. Çalışan bir sunucunun başarısız yeniden yüklemesi ise eski sunucuyu
  geri getirir.
- **Sunucu Çöktü durumunda** — hata konsolundadır. `137` çıkış kodu, dışarıdan öldürüldüğü anlamına
  gelir; çoğu zaman belleği tükendiği için.
- **Port kullanımda** — **Başlangıç** altından değiştirin ya da boş bir port için boş bırakın.
