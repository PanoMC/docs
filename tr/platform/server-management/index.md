# Sunucu Yönetimi (Server Management)

Pano'ya bağladığınız Minecraft sunucularını panelden yönetirsiniz: komut girişi olan **canlı konsol**,
oyuncu işlemleriyle birlikte **çevrimiçi oyuncu listesi**, **kurulu eklenti listesi**, **güç
kontrolleri** ve **performans ölçümleri**. Hepsi, [Pano MC Eklentisi](../integrations/)'nin zaten
açtığı tek bir şifreli WebSocket bağlantısı üzerinden gider — oyun sunucusuna kurulacak ayrı bir ajan
yoktur ve Pano'nun o makineye erişmesine gerek yoktur.

> Sunucu yönetimi artık **Pano çekirdeğinin** bir parçasıdır. Bir zamanlar ayrı bir eklenti olarak
> planlanmıştı; o eklenti hiçbir şey yapmadan emekliye ayrıldı ve Pano tarafında ek bir şey kurmanız
> gerekmiyor. Bkz. [Server Management Eklentisi](../../plugins/server-management/).

> ⚠️ Bu özellikler önce **alpha** kanalında, `pano-mc-plugin`'in kendi `alpha` kanalındaki sürümüyle
> birlikte yayınlanır. Ardından alışıldık sırayla `beta` ve kararlı sürüme iner; yani kararlı bir
> kurulumda henüz bulunmayabilirler.

## Bağlı sunucu nedir

**Bağlı** (linked) sunucu, sizin çalıştırdığınız yerde — kendi makinenizde, bir oyun sunucusu
sağlayıcısında, bir konteynerde — çalışan ve Pano ile Pano MC Eklentisi üzerinden konuşan bir
Minecraft sunucusudur. Pano'nun o sunucunun dosya sistemine ve sürecine erişimi yoktur; yalnızca
eklentiden bir şey yapmasını isteyebilir, eklenti de yanıt verir.

Bağlamak üç adımdır:

1. **Eklentiyi kurun.** Platformunuza uygun jar dosyasını
   [Pano MC Plugin sürümleri](https://github.com/PanoMC/pano-mc-plugin/releases) sayfasından indirin,
   sunucunuzun `plugins/` (ya da `mods/`) klasörüne bırakıp sunucuyu yeniden başlatın. Ayrıntılı
   anlatım için [kurulum rehberine](../installation/) bakın.
2. **Bağlantı komutunu çalıştırın.** Panelde üst çubuktaki **sunucu seçiciyi** açıp
   **Sunucu ekle**'ye basın. Açılan pencere hazır bir komut verir:

   ```
   /pano connect <platform-adresi> <platform-kodu>
   ```

   Bu komutu Minecraft sunucu konsolunuzda (ya da oyun içinde yetkili olarak) çalıştırın. Kod her 30
   saniyede bir yenilenir, bu yüzden taze kopyalayın.
3. **İsteği kabul edin.** Pano, sunucuları yönetebilen herkese bir sunucunun bağlanmak istediğini
   bildirir ve onay penceresini açar. İsterseniz sunucuya bir **panel görünen adı** vererek
   onaylayın; bağlantı o anda kurulur.

Bundan sonrası için başka bir ayar gerekmez.

> Pano bir sunucuyu sizin için **oluşturup çalıştırabilir** de; bunun için o makinede `pano-node`
> arka plan sürecinin çalışması yeterlidir. Bunlara *yönetilen* sunucu denir: süreç Pano'nun
> olduğundan başlatıp öldürebilir, açılış günlüğünü okuyabilir ve eklentiyi kendisi kurabilir. Bkz.
> aşağıdaki [Yönetilen sunucular](#yonetilen-sunucular).

> Yani bir sunucu Pano'ya üç şekilde bağlanabilir — **yalnızca bir düğümle**, **yalnızca eklentiyle**
> ya da **ikisiyle birden** — ve her özelliği, ikisinden hangisi daha iyi yapabiliyorsa o üstlenir.
> Ayrıntılı tablo: [Hangi özellik neyle çalışır](what-works-with-what/).

## Gereksinimler

- **Protokol sürümü 2 konuşan bir Pano MC Eklentisi.** Eklenti bağlanırken protokol sürümünü, kendi
  sürümünü ve yetenek listesini bildirir. Eski eklentiler hiçbir şey bildirmez; Pano da onları eski
  sürüm sayar: sunucu eskisi gibi çalışmaya devam eder; konsol, oyuncular, eklentiler, güç ve ölçüm
  bölümleri de yerinde kalır — yalnızca kontrolleri kapalı açılır ve neyi güncellemeniz gerektiğini
  söyleyen bir satır gösterirler; genel bakış sayfasında da **pano-mc-plugin'i güncelleyin** uyarısı
  çıkar. Jar'ı güncelleyip Minecraft sunucusunu yeniden başlatmak yeterlidir. Bir
  [düğüm](#dugumler) üzerindeki sunucu çok daha azını kaybeder: eklentinin bildiremediği ne varsa
  [düğüme devredilir](what-works-with-what/).
- **Desteklenen bir platform.** Bir sunucunun neler yapabildiği, üzerinde çalışan yazılıma bağlıdır —
  aşağıdaki tabloya bakın. Her sunucu sayfasının başlığında Pano'nun gördüğü protokol ve eklenti
  sürümü yazar; genel bakış sayfası da o sunucunun bildirdiği yetenekleri listeler.

### Hangi platform neler yapabilir

| | Paper · Folia · Purpur | Spigot · CraftBukkit | Velocity · BungeeCord | Fabric |
| --- | --- | --- | --- | --- |
| Konsol akışı ve komutlar | Var | Var | Var | Var |
| Durdurma / Yeniden başlatma | Var | Var | Yalnızca durdurma | Yalnızca durdurma |
| TPS | Var | Var | — (dünya yok) | Var |
| MSPT | Var | — | — (dünya yok) | Var |
| Bellek, CPU, oyuncu sayısı | Var | Var | Var | Var |
| Oyuncu listesi, atma, mesaj | Var | Var | Var | Var |
| OP verme / alma, gamemode | Var | Var | — (dünya yok) | Var |
| Whitelist komutları | Var | Var | Komut olarak iletilir | Var |
| Eklenti / mod listesi | Var | Var | Salt okunur | Salt okunur (mod) |
| Eklenti açma / kapatma | Var | Var | — | — |

Vanilla, Forge ve NeoForge için bir Pano eklenti modülü yok; bu yüzden hiçbiri *bağlanamıyor*.
Vanilla yine de [yönetilen sunucu](#yonetilen-sunucular) olarak çalıştırılabilir: orada konsol ve güç
düğmeleri eklentiden değil düğümden gelir. Forge ve NeoForge ise henüz katalogda değil.

## Panel düzeni

Sunucu yönetimi, panel kenar çubuğundaki **Sunucu** sekmesinin altındadır ve kenar çubuğu tek bir şey
listeler: baktığınız sunucunun bölümlerini. Geri kalan her şey üst çubuktadır.

- **Sunucu seçici** seçili sunucunun adını taşır. Üzerine tıklamak sunucular penceresini açar:
  görmeye yetkili olduğunuz bütün sunucular, kalabalık listeler için bir arama kutusu ve başlığın
  yanındaki **Sunucu ekle** düğmesi.
- **Düğüm simgesi** seçicinin yanındadır; [Düğümler](#dugumler) sayfasını açar ve siz o sayfadayken
  yanık kalır. Yalnızca **Düğümleri Yönet** izni olan hesaplarda görünür.
- **Sekmeler sayfayı takip eder.** `/panel/servers` altındaki her adres sunucu menüsünü, diğer her
  adres site menüsünü gösterir; böylece kenar çubuğu her zaman ekrandakiyle aynı yerden bahseder.
  Sekmeye kendiniz tıklarsanız bu seçim, açtığınız bir sonraki sayfaya kadar geçerli olur.

| Sayfa | Adres | İzin |
| --- | --- | --- |
| Düğümler | `/panel/servers/nodes` | Düğümleri Yönet |
| Genel bakış | `/panel/servers/<id>` | Sunucuları Yönet |
| Konsol | `/panel/servers/<id>/console` | Sunucu Konsolunu Yönet |
| Oyuncular | `/panel/servers/<id>/players` | Sunucu Oyuncularını Yönet |
| Dosyalar | `/panel/servers/<id>/files` | Sunucu Dosyalarını Yönet |
| Eklentiler | `/panel/servers/<id>/plugins` | Sunucu Eklentilerini Yönet |
| Yedekler | `/panel/servers/<id>/backups` | Sunucu Yedeklerini Yönet |
| Zamanlanmış görevler | `/panel/servers/<id>/schedules` | Sunucu Görevlerini Yönet |
| Ayarlar | `/panel/servers/<id>/settings` | Sunucuları Yönet |
| Etkinlik | `/panel/servers/<id>/settings/activity` | Sunucuları Yönet |

Her adres gerçek bir URL'dir: yer imine eklenebilir, bir arkadaşınıza gönderilebilir ve ikinci bir
sekmede başka bir sunucu için açılabilir — "şu an seçili sunucu" yüzünden iki sekme birbiriyle
çakışmaz.

Sunucunun o anki kurulumunun sunamadığı bir bölüm yine de **listede kalır**. Sayfa, kontrolleri
kapalı olarak açılır ve neyin eksik olduğunu söyleyen bir uyarı gösterir — *Bu sunucudaki Pano
eklentisi Konsol sunmuyor*, *… Konsol için çok eski. Sunucudaki pano-mc-plugin'i güncelle.*, *Düğüm
çevrimdışı*, *Şu anda bunu ne düğüm ne de Pano eklentisi yapabiliyor.* Bağlantıyı gizlemek, insanları
hiç var olmamış bir sayfayı aramaya bırakıyordu. Hangi sayfayı iki taraftan hangisinin yanıtladığı,
sunucuya neyin bağlı olduğuna göre değişir — bkz.
[Hangi özellik neyle çalışır](what-works-with-what/) — genel bakış sayfası da sunucunun neleri
bildirdiğini listeler.

## Konsol

Konsol sayfası sunucu günlüğünü anlık olarak gösterir; altında da bir komut kutusu vardır.

- **Önce geçmiş.** Sayfayı açtığınızda **son 500 satır** eskiden yeniye gösterilir, ardından canlı
  satırlar gelir. Pano sunucu başına **son 2 000 satırı** bellekte tutar — yalnızca bellekte,
  veritabanına hiç yazılmaz — eksik kalanı ise sayfa istediğinde sunucunun kendi günlük
  dosyalarından okur: önce `logs/latest.log`, sonra yanındaki `logs/*.log.gz` arşivleri. Bu yüzden
  konsol, aradan Pano da düğüm de yeniden başlatılmış olsa bile açılış günlüğünün ya da dün geceki
  çökmenin üzerinde açılır. Arka planda hiçbir dosya izlenmez ve hiçbir şey saklanmaz: her istek, bu
  dosyaların sonundan sınırlı bir pencere okur ve bitince bırakır.
- **Daha eski satırları yükle.** Geride hâlâ bir şey varsa çıktının üstünde bir
  **Daha eski satırları yükle** düğmesi durur; her basışta **500 satır** daha getirir ve görünümü
  okuduğunuz satırın üzerinde bırakır. Günlükler tükenince düğme kaybolur.
  [Yönetilen bir sunucu](#yonetilen-sunucular) geçmişi düğümü üzerinden sayfalar; düğüm sunucu dursa
  da çalıştığı için duran bir sunucunun günlüğü başına kadar okunabilir. **Bağlı** bir sunucu ise
  geçmişi Pano eklentisi üzerinden sayfalar; yani ancak **o sunucu çevrimiçi ve bağlıyken** geriye
  gidilebilir. Yanıt veremeyecek kadar eski bir eklenti ya da konsol yakalaması kapatılmış bir
  eklenti hiçbir dosya geçmişi bildirmez.
- **Dosyadan gelen zaman damgaları saniye hassasiyetindedir.** Bir Minecraft günlük satırının
  taşıdığı tek saat `[12:34:56]` olduğundan, dosyadan okunan satır o saniyeye yerleşir; canlı satırlar
  Pano'nun vurduğu milisaniyeyi korur.
- **Sade BungeeCord'da dosya geçmişi yoktur.** O, `logs/` klasörü yerine sunucu kökündeki
  `proxy.log` dosyasına yazar; dolayısıyla geri okunacak bir şey yoktur — canlı akış ve Pano'nun
  kendi tamponu kadarı vardır. Waterfall ise herkes gibi `logs/latest.log` yazar; onun geçmişi normal
  biçimde sayfalanır.
- **Yalnızca biri bakarken.** Eklenti, ilk izleyici sayfayı açtığında akışı başlatır ve son izleyici
  ayrıldıktan 30 saniye sonra durdurur; kimsenin bakmadığı bir sunucu hiçbir şey göndermez.
- **Komut gönderme.** Komutu yazıp <kbd>Enter</kbd>'a basın; baştaki `/` isteğe bağlıdır.
  <kbd>↑</kbd> ve <kbd>↓</kbd> tuşları o sunucuya daha önce gönderdiğiniz komutlarda gezinir (geçmiş
  sizin tarayıcınızda tutulur).
- **Kimin ne çalıştırdığını herkes görür.** Komut, çalıştırılmadan önce onu gönderen kişinin adıyla
  konsola yazılır:

  ```
  [Pano:admin] > say merhaba
  ```

  Komut için ayrı bir onay mesajı yoktur — ne yazdırıyorsa günlükte öyle görünür.
- **Hız sınırı.** Kullanıcı ve sunucu başına 10 saniyede 10 komut. Sınırı aşarsanız komut sıraya
  alınmaz, "çok fazla istek" uyarısı alırsınız. Tek bir komut en fazla 1 KB olabilir.
- **Taşkın koruması.** Eklenti satırları toplu gönderir (250 ms'de bir ya da 100 satırda bir) ve
  saniyede en fazla 500 satır yollar. Bundan fazlasını kusan bir sunucuda en eski satırlar düşürülür
  ve sayfada düşürüldükleri yerde `... N satır düşürüldü` işareti belirir; böylece bir hata yığını
  fırtınası bağlantıyı asla düşüremez.
- **Renkler.** Terminal renk kodları, satır gönderilmeden önce oyun sunucusunda temizlenir.

Sayfada ayrıca bir filtre kutusu, duraklat/otomatik kaydır düğmesi, açılabilen zaman damgaları,
**Görüneni kopyala**, `logs/latest.log` dosyasının tamamını indiren bir düğme (dosya izni gerekir) ve
kendi görünümünüzü temizleyen <kbd>Ctrl</kbd>+<kbd>L</kbd> vardır (sunucuda hiçbir şey silinmez).

**Bul, sunucunun sakladığı tüm log dosyalarında arar** — yalnızca konsolun geriye kaydırabildiği
kısımda değil: önce `latest.log`, sonra döndürülmüş `.log.gz` dosyaları, en yeniden eskiye. Sonuçlar
bulundukça gelir; konsolun üstündeki satır aranan dosyaları sayar, **Durdur** aramayı erken bitirir.
En fazla en yeni 5.000 sonucu gösterir — daha eskilerine ulaşmanın yolu aramayı daraltmaktır.

## Oyuncular

Oyuncular sayfası, o sunucunun canlı listesidir: kullanıcı adı, UUID, ping, oyun modu, oturum süresi,
**OP** ve **Beyaz listede** rozetleri ve alışıldık işlemler. Eklenti her oyuncunun OP, whitelist ve
oyun modu bilgisini bildirir ve bunlardan biri değiştiğinde — panelden de olsa, oyunda yazılan bir
`/op` da olsa — bir saniye içinde yeni bir örnek gönderir; rozetler ve menü sayfa yenilenmeden
güncellenir. Menü yalnızca bir şeyi değiştirecek işlemi gösterir: operatör için *OP al*, diğerleri
için *OP ver*; mevcut oyun modu işaretlidir.

| İşlem | Nasıl uygulanır |
| --- | --- |
| At (kick) | Eklenti, yazdığınız gerekçeyle oyuncuyu doğrudan atar. |
| Mesaj | Eklenti, yazdığınız metni o oyuncuya sohbette gönderir. |
| OP ver / OP al | Konsol komutu olarak `op` / `deop`. |
| Gamemode | `gamemode <mod> <oyuncu>` — survival, creative, adventure ya da spectator. |
| Whitelist ekle / çıkar | Konsol komutu olarak `whitelist add` / `whitelist remove`. |
| Yasakla | Pano hesabı olan (aynı kullanıcı adı) oyuncuya aşağıda anlatılan **Pano yasağı** uygulanır. Diğerleri `ban <oyuncu> [gerekçe]` ile o sunucunun kendi ban listesine eklenir. |

Komutları Pano sunucu tarafında, kayıtlarında zaten bulunan kullanıcı adından oluşturur — panele
yazılan hiçbir şeyden değil — ve geçerli bir Minecraft kullanıcı adı olmayan bir ad hiçbir zaman komut
satırına ulaşmaz.

> Proxy'lerde (Velocity, BungeeCord) dünya yoktur; bu yüzden **OP verme, OP alma ve gamemode oralarda
> yoktur** ve reddedilir. Atma ve mesaj her zamanki gibi çalışır; whitelist komutları proxy'ye
> iletilir ve orada yalnızca bunu uygulayan bir eklenti varsa bir işe yarar.

### Listeden yasaklama

Pano yasağı, Oyuncular sayfasının verdiği yasağın aynısıdır; gerekçe, süre ve e-posta seçenekleri de
aynıdır: hesabın siteden çıkışı yapılır, ban entegrasyonu açık her sunucu oyuncuyu atar ve yasak
bitene kadar girişine izin vermez. Yalnızca bu sunucunun değil, genel *Oyuncuları yönet* yetkisi
gerekir. Pano yasaklarını kendisi uygulamayan bir sunucuda — ban entegrasyonu kapalıysa ya da
sunucuda Pano eklentisi yoksa — oyuncu ayrıca doğrudan oradan da çıkarılır: kalıcı yasak sunucunun
kendi `ban` komutuna, süreli yasak ise bir atmaya dönüşür.

Pano hesabı olmayan bir oyuncuda Pano'nun yasaklayacağı bir şey yoktur; pencere bunu belirtir ve
yasak yalnızca o sunucunun kendi ban listesine, bitiş tarihi olmadan eklenir. Proxy'lerde böyle bir
liste olmadığından orada bu oyuncular için düğme devre dışıdır. Pano yasaklarıyla ilgili her şey
[Ban Yönetimi](../integrations/ban-management/) sayfasında.

> **İçinde Pano eklentisi olmayan bir sunucunun da oyuncu listesi olur** — yeter ki bir düğüm
> üzerinde olsun: düğüm sunucuya, çok oyunculu listenin sorduğu sorunun aynısını sorar — bir
> **sunucu listesi ping'i** — ve buradan kesin oyuncu sayısı ile en çok on iki ad gelir. Listenin
> nereden geldiğini sayfa söyler; çünkü bir örneklem, tam liste değildir. Oradaki oyuncu işlemleri
> konsol komutlarıdır: Pano bunları yukarıdaki gibi oluşturur ve sunucunun girdisine yazar. Bkz.
> [Hangi özellik neyle çalışır](what-works-with-what/).

## Eklentiler

Eklentiler sayfası sunucunun bildirdiklerini listeler: ad, sürüm, geliştiriciler, açıklama ve
eklentinin açık olup olmadığı. Fabric sunucuları aynı tabloda **mod**ları listeler. Liste, sunucu her
yeniden bağlandığında ve her açma/kapama işleminden sonra tazelenir.

Bir eklentiyi **açıp kapatmak** yalnızca Bukkit ailesinde — Paper, Spigot, CraftBukkit, Folia ve
Purpur — çalışır; çünkü çalışma zamanında eklenti yöneticisi olan tek platform ailesi budur. Velocity,
BungeeCord ve Fabric eklentilerini ve modlarını yalnızca açılışta yükler, bu yüzden listeleri salt
okunurdur.

> ⚠️ Her eklenti, sunucu çalışırken açılıp kapatılmayı kaldıramaz; çoğu dinleyicilerini ve komutlarını
> yalnızca açılışta kaydeder. Bir şey ters giderse sunucuyu yeniden başlatın.

**İçinde Pano eklentisi olmayan** bir sunucunun da eklenti listesi olur — yeter ki bir düğüm
üzerinde olsun: düğüm bunun yerine klasördeki jar'ları okur — ad, sürüm ve dosyanın kapalı olup
olmadığı — ki sunucu dururken gördüğünüz de budur. O liste, sunucunun yüklediklerini değil diskte
duranı gösterir ve sayfa bunu söyler.

Eklenti ve modlar panelden **kurulabilir** ve dosyaları yine panelden kaldırılabilir; bunun için
sunucunun arkasında bir düğüm ya da bu işi kendisi yapabilecek kadar yeni bir Pano eklentisi olması
yeterlidir — bkz. [Eklentiler ve modlar](#eklentiler-ve-modlar).

## Güç

Güç düğmeleri sunucu başlığındadır. Bağlı bir sunucuda bunlardan ikisi çalışır:

- **Durdur** — eklenti, sunucuyu kendi platform API'siyle kapatır. Oynayan herkesin bağlantısı kesilir
  ve Pano süreci sahiplenmediği için **onu kimse geri başlatmaz**: sunucuyu makinede birinin yeniden
  açması gerekir.
- **Yeniden başlat** — Paper ve Spigot'ta bu, sunucunun kendi yeniden başlatma desteğini kullanır ve
  `spigot.yml` içinde çalışan bir `restart-script` ister (ayrıca jar'ı gerçekten yeniden başlatan bir
  sarmalayıcı). Böyle bir betik yoksa — ve diğer tüm platformlarda — yeniden başlatma yalnızca
  sunucuyu durdurur ve bir uyarı yazar.

**Başlat** ve **Sonlandır** (kill) bağlı bir sunucuda pasiftir: bunlar için Pano'nun süreci
sahiplenmesi gerekir, onu da düğüm sağlar. İkisi de bir
[yönetilen sunucuda](#yonetilen-sunucular) çalışır.

Her düğme, çalışmadan önce onay ister ve her iki işlem de etkinlik günlüğüne yazılır.

## Performans ölçümleri

Bir sunucu bağlıyken eklenti **her 10 saniyede** bir ölçüm gönderir — panele biri bakıyor olsun ya da
olmasın. Bir ölçüm; TPS (1, 5 ve 15 dakikalık ortalamalar), MSPT, kullanılan ve azami JVM belleği,
süreç CPU'su, oyuncu sayısı ve ping'leriyle birlikte oyuncu listesini taşır. Birkaç yüz bayttır.

Pano, genel bakıştaki canlı değerler için en yeni ölçümü bellekte tutar; grafik içinse çevrimiçi her
sunucu için veritabanına **dakikada bir satır** yazar. Bu geçmiş **her gün son 30 güne** göre budanır;
grafiği son bir saat, bir gün, bir hafta veya bir ay için okuyabilirsiniz.

Proxy'ler TPS ve MSPT bildirmez — dünya çalıştırmazlar. Düz Spigot ve CraftBukkit TPS bildirir ama
Paper'ın API'sini gerektiren MSPT'yi bildirmez.

## Yönetilen sunucular

> ⚠️ Yönetilen sunucular, düğümler ve `pano-node` arka plan süreci önce **alpha** kanalında
> yayınlanır. Ardından alışıldık sırayla `beta` ve kararlı sürüme iner; yani kararlı bir kurulumda
> henüz bulunmayabilirler.

**Bağlı** sunucu, sizin çalıştırdığınız ve Pano'nun yalnızca konuştuğu sunucudur. **Yönetilen**
sunucu ise **Pano'nun çalıştırdığı** sunucudur: klasörü Pano oluşturur, sunucu jar'ını Pano indirir,
`server.properties` dosyasını Pano yazar, süreci Pano başlatıp durdurur ve konsolu doğrudan sürecin
çıktısından okur. Bu işi, sunucuyu barındıran makinede çalışan **`pano-node`** adlı küçük bir arka
plan süreci yapar — parametreleri, dosyaları ve güvenlik modeli için
[pano-node referansına](pano-node/) bakın.

İkisi birbirinin alternatifi değildir, **birbirini tamamlar**. Yukarıda anlatılan her şey Minecraft
eklentisinden gelir; Pano da oluşturduğu her sunucuya o eklentiyi kurar. Bu yüzden yönetilen bir
sunucu aynı zamanda bağlı bir sunucudur ve iki kümenin yeteneklerine de sahiptir. Düğüm, makineyle
ilgili olan her şeyi ekler — sunucu oluşturma, yeniden kurma ve silme, **Başlat** ile **Öldür**,
başlangıç ayarları, dosyalar, yedekler, duran bir sunucunun konsolu, sürecin kendi CPU ve belleği —
eklenti ise yalnızca çalışan oyunun içinden bilinebilecek her şeyi sunmayı sürdürür: TPS, MSPT,
yığın, gerçek oyuncu listesi ve gerçekten yüklenmiş eklentiler.

Yine de ikisinden biri zorunlu değildir. **Yalnızca düğümü olan** (içinde Pano eklentisi bulunmayan)
bir sunucu da, **yalnızca eklentisi olan** (arkasında düğüm bulunmayan) bir sunucu da panelde tam
yetkili birer sunucudur. Her özelliği, o işi yapabilen taraf üstlenir; ikisi de varsa daha iyi olan
üstlenir. Özellik özellik hazırlanmış tam tablo:
**[Hangi özellik neyle çalışır](what-works-with-what/)**.

Panelin hiçbir zaman "bağlı" ya da "yönetilen" ayrımına bakmamasının nedeni de budur — panel, bu
sunucunun şu anda neler yapabildiğine bakar. Kaynaklarının tamamı eksik olan bir bölüm yine açılır;
kontrolleri kapalı olur ve onları geri getirecek şeyi söyleyen bir uyarı çıkar: Pano eklentisini
kurun, güncelleyin, bir düğüm ekleyin, çevrimdışı düğümün dönmesini bekleyin ya da sunucuyu başlatın.

### Düğümler

**Düğüm** (node), yönetilen sunucu çalıştırabilen bir makinedir. Üzerinde `pano-node` arka plan
süreci çalışır ve bu süreç Pano'ya **dışarı doğru**, Minecraft eklentisininkiyle aynı türden şifreli
bir WebSocket bağlantısı açar: düğüm tarafında hiçbir port açılmaz ve Pano o makineye hiç bağlanmaz.

Düğümler sayfası, üst çubukta sunucu seçicinin yanındaki **düğüm simgesidir**
(`/panel/servers/nodes`) ve **Düğümleri Yönet** izniyle korunur. Tablo her düğümün türünü, durumunu,
sürümünü, işletim sistemini, üzerindeki sunucu sayısını ve CPU, RAM ve disk kullanımını gösterir.

#### Yerel düğüm

Pano'nun kendisinin çalıştığı makine de bir düğüm olabilir ve tek tıklık iş budur: düğüm simgesi →
**Düğüm ekle** → **Yerel**.

Pano bunun üzerine

1. `pano-node.jar` dosyasını bulur — kendi jar'ının yanında ya da çalışma klasöründe; orada yoksa ya
   da oradaki başka bir Pano sürümündense, kendi jar'ının içinde taşıdığı kopyayı oraya çıkarır,
2. tek kullanımlık bir önyükleme anahtarıyla başlatır; böylece yazılacak bir eşleştirme kodu olmaz ve
   düğüm baştan onaylı gelir,
3. paneli ve temanızı çalıştıran süreçleri zaten gözettiği gibi onu da gözetir.

Makineden beklenenler:

- **Java 17 veya daha yenisi.** Pano'nun kendisi hâlâ Java 11+ ile çalışır ama arka plan süreci
  çalışmaz: eline Java 11 verildiğinde her başlatmada `UnsupportedClassVersionError` ile ölür. Pano
  uygun bir çalışma zamanı arar — kendi çalıştığı JVM, `JAVA_HOME`, `/usr/lib/jvm`,
  `/Library/Java/JavaVirtualMachines`, Windows'taki alışıldık `C:\Program Files` konumları ve `PATH`
  üzerindeki `java` — ve hiçbirini bulamazsa sonsuza kadar denemek yerine okunabilir bir hatayla
  kurulumu durdurur.
- **Sunucuları koyacak bir yer.** Düğüme ait her şey **`<pano-klasörü>/node-data/`** altında yaşar:
  kendi `config.conf` dosyası, `servers/<uuid>/`, `backups/`, `java/` ve `updates/`.
- Çıktısı **`<pano-klasörü>/logs/pano-node.log`** dosyasına yönlendirilir — düğüm ayağa kalkmadığında
  ilk bakılacak yer burasıdır.

Otomatik seçimin yanlış olduğu durumlar için iki anahtar vardır; ikisi de Pano'nun kendi
`config.conf` dosyasındaki `local-node` bloğundadır (bkz.
[Yapılandırma Rehberi](../configuration/#yerel-dugum-local-node)):

```jsonc
local-node {
  enabled = true
  jar-path = null   // pano-node.jar dosyasının tam yolu
  java-path = null  // bir Java 17+ kökü ya da içindeki java ikilisi
  stop-with-pano = false
}
```

**Pencere işi gözünüzün önünde yapar.** **Düğüm ekle → Yerel**, SSH ve Coolify sekmelerinin
kullandığı ilerleme ekranına geçer ve kurulumu satır satır anlatır: bulduğu Java'yı ve nerede
bulduğunu, başlattığı arka plan sürecini ve işlem kimliğini, düğümün bağlanmasının beklendiğini, en
sonunda da bağlandığını. Başlatma reddedilirse gerekçe Pano'nun kendi cümlesiyle orada yazar —
makinede Java 17 veya daha yenisi yoktur ya da `config.conf` içindeki `local-node` bloğu kapalıdır —
sonucun daha sonra Düğümler sayfasında keşfedilmesi beklenmez.

`stop-with-pano` bilerek **false** gelir: Pano'yu yeniden başlatmak, oynayan herkesin bağlantısını
kesme isteği değildir. Arka plan süreci ve sunucular çalışmaya devam eder, Pano geri geldiğinde
onlara yeniden bağlanır.

Bir sonraki açılışta Pano'nun, ikinci bir süreç başlatmak yerine **zaten çalışan süreci
sahiplenmesinin** nedeni de budur. Pano, arka plan sürecinin veri klasöründe tuttuğu kilide ve işlem
kimliğine bakar (`node-data/pano-node.lock` ve `node-data/pano-node.pid`); sahiplenilen süreç de
Pano'nun kendi başlattığı bir süreçle tıpatıp aynı biçimde gözetilir: çıkarsa Pano onu yeniden
başlatır. Klasörü başka bir süreç tutarken yine de başlatılan bir süreç bunu fark eder, **76** koduyla
çıkar ve klasörü zaten orada olana bırakır; yani bu yarış hiçbir zaman aynı sunucuların başında iki
süreçle sonuçlanmaz — bkz. [Veri klasörü](pano-node/#veri-klasoru).

#### Uzak düğümler

Başka bir makine üç yoldan biriyle düğüm olur. **Düğüm ekle** ekranında her biri için bir sekme
vardır ve üçü de aynı yere çıkar: o makinede çalışan ve Pano'ya dışarı doğru bağlanan bir arka plan
süreci.

**Elle** kurulum her yerde çalışır; yalnızca başkasının web konsolu üzerinden erişebildiğiniz bir
makinede bile. Sekme, her 30 saniyede bir yenilenen altı haneli bir eşleştirme kodunu ve diğer
makineye yapıştıracağınız tek satırlık bir kurulum komutunu gösterir:

```bash
curl -fsSL https://panel.example.com/api/node/install.sh | sh -s -- --pano 'https://panel.example.com' --code '123456'
```

Betiği **kendi Pano'nuz** sunar; yani kurduğu arka plan süreci sizin sürümünüzle eşleşen sürümdür.
root olarak çalıştırıldığında betik şunları yapar: **Java 17 veya daha yenisini** arar, yoksa
makinenin paket yöneticisiyle başsız (headless) bir JRE kurar; `/opt/pano-node` klasörünü ve veri
klasörü `/var/lib/pano-node` olan bir `pano-node` servis kullanıcısı oluşturur; `pano-node.jar`
dosyasını indirip yanında yayınlanan sağlamayla doğrular; eşleştirme bilgilerini yalnızca root'un
okuyabildiği bir ortam dosyasına ve bir systemd birimine yazar — birimde **`SuccessExitStatus=75`**
de vardır, böylece sürecin kendini güncellemesi çökme sanılmaz; sonra servisi etkinleştirip başlatır.
`--user-install` verirseniz her şey root'suz olarak kendi ev klasörünüze kurulur; betik bu durumda
servis kaydetmek yerine süreci başlatan komutu ekrana basar. Windows'ta aynı işi yapan ve bir
`PanoNode` servisi kaydeden bir PowerShell tek satırlığı vardır.

Kodla eşleşen bir düğüm **Onay bekliyor** olarak gelir. Düğümler sayfasından kabul edin ve yalnızca
kendi kurduğunuz makineleri kabul edin. Betiği atlayıp arka plan sürecini her zaman elle de
çalıştırabilirsiniz:

```
pano-node --pano https://panel.example.com --code 123456 --data ./node-data
```

**SSH**, o kurulumu Pano'nun sizin yerinize yapmasını sağlar. Makine adresini, portu, bir kullanıcı
adını ve bir parola ya da özel anahtar verin, `sudo` kullanıp kullanamayacağını söyleyin ve kendi
hesap parolanızı onaylayın. Pano bağlanır, size **makine anahtarının parmak izini** gösterir ve başka
hiçbir şey göndermeden önce onu onaylamanızı bekler — bunun gerçekten kastettiğiniz makine olduğuna
makinenin değil sizin karar verdiğiniz tek an budur. Ardından kurulum betiğini oturuma aktarır ve
çıktısını satır satır panele yansıtır; böylece bir hata, olduğu yerde görünür. Düğüm kendini tek
kullanımlık bir anahtarla eşleştirir ve sonrasında onay gerektirmez. Hedef makinenin betik için kendi
internet erişimine ihtiyacı yoktur — betik SSH oturumu üzerinden gelir.

> SSH parolası ya da anahtarı yalnızca o tek kurulum için kullanılır ve **hiçbir zaman saklanmaz**:
> görev sürdüğü sürece bellekte durur, görev bitince silinir ve hiçbir günlüğe yazılmaz.

**Coolify**, arka plan sürecini [Coolify](https://coolify.io) örneğinizin yönettiği bir makineye
konteyner olarak kurar. Pano'ya Coolify adresini, bir API anahtarını, hedef makineyi ve projeyi
verin; Pano **`ghcr.io/panomc/pano-node`** imajından bir uygulama oluşturur, üzerinde `PANO_URL`,
`PANO_BOOTSTRAP_TOKEN`, `PANO_NODE_NAME` ve `PANO_NODE_DATA=/data` değişkenlerini ayarlar, **`/data`**
altına bağlanmış kalıcı bir birim ister, oyun sunucularının kullanacağı port aralığını (siz
değiştirmedikçe `25565-25600`) açıp eşler ve dağıtımı başlatır. Aynı aralık düğüme
`PANO_NODE_PORT_RANGE` olarak da verilir; böylece Pano'nun o düğümde oluşturduğu sunucular konteynerin
gerçekten dışarı açtığı portları alır. Panel, düğüm eşleşene kadar dağıtımı
en fazla on dakika boyunca izler. API anahtarı yalnızca o dağıtım için kullanılır ve saklanmaz.

> Konteynere **`/data` için kalıcı bir birim** verin. Düğüme ait her şey orada yaşar — sunucular,
> dünyalar ve yedekler — ve kalıcı birimi olmayan bir konteyner bir sonraki dağıtımda bunların
> hepsini kaybeder. Coolify bir birim bağlamayı reddettiyse Pano bunu görevde söyler.

**Düğümün kullandığı Pano adresi.** SSH ve Coolify sekmelerinde tek bir alan taşıyan bir **Gelişmiş**
bölümü vardır: *Düğümün ulaşabileceği Pano adresi*. Boş bırakılırsa düğüm site adresinize
yönlendirilir ve bu neredeyse her zaman doğru yanıttır — ama her zaman değil: NAT arkasındaki bir
makine Pano'ya, herkese açık alan adının çözmediği özel bir adresten ulaşır; bir test Pano'suna
yalnızca `http://127.0.0.1:18088` üzerindeki bir SSH tünelinden erişiliyor olabilir; bölünmüş DNS
kurulumları içeriye ve dışarıya bilerek farklı yanıt verir. Buraya yazdığınız değer, düğümün
**`PANO_URL` değişkeni olarak, portuyla birlikte aynen** kullanılır ve kurulum betiğinin arka plan
sürecini indirdiği adres de odur. `http://` ya da `https://` ile başlayan, gerçek bir makine adı
taşıyan ve en fazla 255 karakterlik tam bir adres olmalıdır; bunun dışındaki her şey sessizce site
adresiyle değiştirilmek yerine doğrudan reddedilir, çünkü tünel adresini yanlış yazan bir yöneticinin
bunu on dakika sonra düğüm hâlâ eşleşmemişken değil, hemen o anda öğrenmesi gerekir. Aynı alan Elle
sekmesinde de vardır; orada yalnızca Pano'nun size gösterdiği kurulum komutundaki adresi değiştirir.

**Coolify sekmesinde farklı bir imaj.** **İmaj** ve **Etiket** alanları, `ghcr.io/panomc/pano-node`
imajını çekemeyen bir Coolify makinesi içindir: özel bir kayıt defteri (registry), internete kapalı
bir ağdaki bir ayna ya da birinin kendi derlediği bir yapı. İmaj,
`registry.example.com:5000/team/pano-node` gibi düz bir kayıt defteri referansıdır — küçük harfli ve
sonunda `:etiket` **olmadan**, çünkü etiket kendi alanıdır. İkisi de yanlış göründüğünde
düzeltilmez: başka bir şeye dönüştürülmüş bir referans artık başka bir imajdır ve istenenden farklı
bir imajı dağıtmak, isteği reddetmekten kötüdür.

Coolify dağıtımı reddettiğinde panel, çıplak bir hata yerine **Coolify'ın kendi mesajını**
(`COOLIFY_BOOTSTRAP_FAILED`) ve mesajın yazıldığı kurulum görevini gösterir. Reddedilmiş bir proje,
anahtar ya da port alanını yalnızca siz düzeltebilirsiniz ve size söylenmeyeni düzeltemezsiniz.

Düğümler sayfası her düğümün nasıl kurulduğunu — yerel, elle, SSH ya da Coolify — gösterir; bir
düğümü yeniden adlandırmanıza ya da kaldırmanıza da izin verir. **Bir düğümü kaldırmak üzerindeki
her şeyi siler** — üzerindeki her sunucuyu dosyaları ve yedekleriyle, Pano'nun indirdiği Java çalışma
zamanlarını ve arka plan sürecinin kendi verilerini — bu yüzden önce düğümün adını ve parolanızı
ister. Bkz. [Bir düğümü kaldırma](pano-node/#removing-a-node).

Sayfa ayrıca, çalıştırdığı arka plan süreci Pano'nun vereceği sürüm olmayan düğümleri bir
**Güncelleme Mevcut** rozetiyle işaretler ve o düğümü oradan yerinde günceller: arka plan süreci
jar'ı Pano'dan indirir, doğrular, kapanırken yerine takar ve tek bir yeniden başlatmayla, birkaç
saniye içinde yeni sürümle geri döner. Güncelleme düğümü yeniden başlattığı için üzerindeki sunucular
da iner; yalnızca **Pano ile başlat** seçili olanlar kendiliğinden geri gelir. Bkz.
[Arka plan sürecini güncelleme](pano-node/#arka-plan-surecini-guncelleme).

#### Sunucuları konteynerlerde çalıştırma

Bir düğüm normalde her yönetilen sunucuyu sıradan bir süreç olarak başlatır. **`--runtime DOCKER`**
ile başlatıldığında ise her birini **kendi Docker konteynerinde** çalıştırır:

- makinede **`docker` komutu** ve onu kullanma izni gerekir; arka plan süreci bunu, biri Başlat'a
  bastığında değil, kendi açılışında denetler;
- **sunucu başına bir konteyner**, o sunucunun ihtiyaç duyduğu Java sürümü için resmî
  **`eclipse-temurin`** imajından; sunucunun belleği konteynerin sınırı olur ve oyun portu dışarı
  açılır;
- sunucu klasörü makinede kalır; bu yüzden konsol, güç düğmeleri, süreç ölçümleri,
  [dosya yöneticisi](#dosyalar) ve [yedekler](#yedekler) her zamanki gibi çalışır.

Düğümler sayfası her düğümün hangi çalıştırma biçimini kullandığını gösterir. Bkz.
[pano-node referansı](pano-node/#sunucuları-konteynerlerde-calıstırma).

### Sunucu oluşturma

Çevrimiçi bir düğüm varken **Sunucu ekle** — sunucular penceresinde ya da üst çubukta seçicinin
yanında — bir seçim ekranı açar: **Yeni sunucu oluştur** (Pano sunucuyu bir düğüme kurar) ya da
**Var olan sunucuyu bağla** (yukarıdaki `/pano connect` akışı, değişmeden). Oluşturmak için
**Sunucu Oluştur** izni gerekir.

Sihirbaz beş adımdır:

1. **Kaynak.** **Sıfırdan kurulum** ya da hâlihazırda sahip olduğunuz bir sunucuyu getirmenin üç
   yolundan biri — bkz. [Sunucu içe aktarma](#sunucu-ice-aktarma).
2. **Düğüm.** Sunucuyu hangi makine çalıştıracak. Çevrimiçi düğüm yoksa adımın kendisi
   **Yerel düğümü kur** ve **Düğüm ekle** seçeneklerini sunar.
3. **Yazılım ve sürüm**, Pano'nun her saat başı tazelediği kendi kataloğundan. Her yazılım burada ve
   sunucu kartlarında kendi projesinin logosuyla görünür; bunun için yapılandırılacak bir şey yoktur:

   | Yazılım | |
   | --- | --- |
   | **Paper** | **Önerilen.** Eklentilerin çoğunun yazıldığı platform. |
   | Purpur | Daha fazla ayar sunan bir Paper çatallaması. Paper gibi davranır. |
   | Folia | Paper'ın bölgelere ayrılmış iş parçacığı modeli; çok büyük dünyalar için. |
   | Spigot | **Düğümde derlenir** rozetini taşır: kimse hazır bir Spigot jar'ı dağıtamaz, o yüzden jar'ı düğüm BuildTools ile derler — bkz. [aşağıda](#spigot-dugumde-derlenir). |
   | Fabric | Mod yükleyicisi. Pano eklentisinin Fabric modülü var, yani konsol ve oyuncu listesi çalışır. |
   | Vanilla | Mojang'ın kendi jar'ı. Pano eklenti modülü yok; konsolu ve güç düğmeleri yalnızca düğümden gelir — oyuncu listesi ve TPS olmaz. |
   | Velocity | Proxy — ve önerilen olanı. Dünyası olmadığı için gamemode ve TPS yok. |
   | Waterfall | Proxy; 2024'ten beri üretici tarafından **terk edilmiş**. Yeni ağlar için Velocity kullanın. |
   | BungeeCord | Proxy; **Son CI derlemesi** rozetiyle gelir: projenin kendi Jenkins sunucusundan indirilir, dolayısıyla sürümleri birer derleme numarasıdır — bkz. [aşağıda](#bungeecord-jenkins-uzerinden-gelir). |

   Forge, NeoForge ve Quilt henüz katalogda değil: her biri düğümde kendi yükleyicisini çalıştırmayı
   gerektiriyor ve bu kendi başına bir iş. Pano bu türleri zaten tanıyor, dolayısıyla kendini böyle
   bildiren bir sunucu doğru etiketlenir.
4. **Ayarlar.** Ad, bellek, oyun portu, Java sürümü, JVM parametreleri (**Aikar bayrakları** hazır
   ayarıyla), **Pano ile başlat**, **Çökünce yeniden başlat**, **Otomatik güncelleme denetimi**
   ([Eklentileri güncel tutma](#eklentileri-guncel-tutma) bölümüne bakın) ve Minecraft EULA onay
   kutusu — Pano onay verilmeden sunucu oluşturmaz, düğüm de sizin yerinize `eula.txt` dosyasına
   `eula=true` yazar.
5. **Özet**, ardından **Sunucu oluştur**.

Bunlardan ikisi ayrıca not ister:

- **Port.** Boş bırakırsanız düğüm **25565–25600** aralığından bir port ayırır: kendi sunucularının
  tuttuğu portları atlar, sonra da portun gerçekten boş olduğunu denetler — Pano'nun dışından bir şey
  orayı dinliyor olabilir. Bir port yazarsanız düğüm tam olarak onu kullanır.
- **Pano ile başlat / Çökünce yeniden başlat.** İlki, düğüm ayağa kalktığında sunucuyu başlatır.
  İkincisi, süreç beklenmedik şekilde öldüğünde onu geri getirir; aralık gitgide açılır — 5 sn,
  15 sn, 60 sn, sonra 10 dakika — böylece hiç açılamayan bir sunucu sonsuz döngüye girmez. Sizin
  istediğiniz bir durdurma asla çökme sayılmaz.

#### Spigot düğümde derlenir

SpigotMC hazır bir jar'ı yeniden dağıtamaz; yani Pano'nun indirebileceği bir dosya yoktur ve hukuken
mümkün olan tek kurulum onu yerinde üretmektir. Spigot'u seçtiğinizde düğüm, projenin kendi derleme
betiği olan **BuildTools**'u indirir ve seçtiğiniz Minecraft sürümü için çalıştırır (`--rev`):
BuildTools, Mojang'ın sunucusunu klonlar, Spigot yamalarını uygular ve sonucu derler.

- **Derleme `git` ister**, bir de **o sürümün derlendiği kuşaktan bir Java**. Git'i kurmanız
  gerekmez: makinede bir git varsa o kullanılır, yoksa düğüm yalnızca bu derleme için bir tane
  edinir — bkz. [BuildTools için git](pano-node/#git-for-buildtools). Java'yı ise düğüm,
  makinedeki çalışma zamanları arasından kendisi seçer: BuildTools'un istediği sürümün tam
  karşılığını, o kurulu değilse ondan sonraki en yakın sürümü — 1.21.x Java 21 ile, 1.16 Java 8 ile
  derlenir.
- **Bir sürümün ilk derlemesi aşağı yukarı on dakika sürer**, küçük bir makinede daha da uzun.
  Kurulum o adımda bekler; takılmış değildir.
- **Sonuç sürüm başına önbelleğe alınır**: düğümün veri klasöründe `cache/spigot/spigot-<sürüm>.jar`
  olarak durur, böylece aynı sürümün sonraki her kurulumu bir dosya kopyalamasıdır ve anında biter.
  Bkz. [veri klasörü](pano-node/#veri-klasoru).
- **Olan biteni izlersiniz.** Kurulum görevi, BuildTools'un kendi çıktısını yazdırdığı gibi satır
  satır aktarır; ilerleme de o günlüğün duyurduğu aşamaları izler — çekme, yamaların uygulanması,
  derleme, başarı.
- **Bir düğümde aynı anda tek bir derleme.** Biri sürerken başlatılan ikinci bir Spigot kurulumu
  beklediğini söyler ve ilki bitince başlar — beklediği derleme kendi sürümüyse de önbellekteki
  jar'ı alır.
- **Hata, BuildTools ne dediyse onu söyler.** Görev, derlemenin son hata satırıyla ve tam günlüğün
  yoluyla başarısız olur; günlük düğümde
  `<node-data>/cache/spigot/buildtools/work-<sürüm>/buildtools.log` dosyasında kalır. **45 dakika**
  sonra hâlâ süren bir derleme durdurulur.
- **Docker çalıştırma biçiminde de derleme makinede yapılır**, makinenin JDK'si ve git'iyle;
  konteynere yalnızca elde edilen jar girer. Bkz.
  [Sunucuları konteynerlerde çalıştırma](pano-node/#sunucuları-konteynerlerde-calıstırma).

**Önerilen yine Paper'dır**: hiçbir derleme adımı istemez, Spigot'un yaptığından fazlasını yapar ve
aynı eklentileri çalıştırır. Spigot burada, gerçekten Spigot isteyen sunucular ve eklentiler için
var.

#### BungeeCord Jenkins üzerinden gelir

BungeeCord hiç sürüm yayımlamaz: her derleme doğrudan
[md-5'in Jenkins sunucusuna](https://ci.md-5.net/job/BungeeCord/) düşer ve Pano da onu oradan alır.
Dolayısıyla "sürümleri" birer **derleme numarasıdır**; en yenisi başta olmak üzere sıralanır ve en
başta, öntanımlı olarak seçilen **Son derleme** durur — bir BungeeCord ağının çalıştırması gereken de
budur, bir kez sabitlenip sonra unutulmuş bir derleme numarası değil.

O indirme için **yayımlanmış bir sağlama yoktur**. Jenkins derlemenin parmak izini tutar ama indirme
adresinin sunduğu jar'ın değil, başka bir ürünün parmak izini tutar; yani karşılaştırılacak doğru bir
değer yok. Düğüm, her indirmede yaptığı gibi gelenin gerçekten bir jar olduğunu denetler, o kadar.

**Önerilen proxy Velocity olmayı sürdürüyor** — modern yönlendirme, üstelik üçünün içinde hâlâ
geliştirilen tek proxy. BungeeCord, onu hâlâ gerektiren eklentiler ve kurulumlar için burada ve
tıpkı diğer ikisi gibi oluşturulup yönetilir — bkz. [Proxy sunucuları](#proxy-sunuculari).

> Sade bir BungeeCord, `logs/` klasörü yerine sunucu kökünde `proxy.log` dosyasına yazar; bu yüzden
> konsolun **Daha eski satırları yükle** düğmesinin orada geri okuyacağı bir şey olmaz. Bkz.
> [Konsol](#konsol).

#### Kurulum sırasında ne olur

Sunucu satırı hemen, **INSTALLING** (kuruluyor) durumunda yazılır; böylece düğüm çalışırken panelin
gidecek bir yeri olur. Ardından düğüm

1. `<node-data>/servers/<uuid>/` klasörünü hazırlar,
2. sunucu jar'ını indirir ve ilerlemeyi panele bildirir — ya da
   [Spigot](#spigot-dugumde-derlenir) için onu BuildTools ile derler,
3. **Pano Minecraft eklentisini** kurar ve eklentinin `config.conf` dosyasını eşleşmiş hâlde yazar —
   yönetilen bir sunucunun ilk açılışından itibaren bağlı olmasının nedeni budur,
4. `eula.txt` dosyasını yazar ve sihirbazdaki `server.properties` değerlerini dosyaya işler,
5. bitirir; sunucu **Durduruldu** durumuna geçer ve başlatılmaya hazırdır.

Üçüncü adımdaki eklenti **Pano'nun kendisinden** gelir: bu kurulumun diskinde eklentinin bir yapısı
varsa `GET /api/node/plugin-jars/<platform>` adresinden, yoksa en yeni `PanoMC/pano-mc-plugin` sürüm
dosyasından. Pano'nun kendi sunduğu bir şey için düğüme verdiği her adres görelidir ve düğüm onu
zaten Pano'ya ulaştığı adrese göre çözer — başka bir makinedeki bir düğümün eklentiyi kurabilmesinin
nedeni budur; aksi hâlde yalnızca Pano'nun kendi makinesinin okuyabileceği bir yola yönlendirilirdi.
Pano eklenti modülü olmayan yazılımlar — Vanilla, Forge ve NeoForge — bu adımı atlar; o sunucular
yalnızca düğüm üzerinden yönetilir.

Yönetilen bir sunucu için bağlantı isteği gerekmez: onu Pano oluşturduğu için baştan onaylıdır ve
**İstekler** bölümünde hiç görünmez.

### Sunucu içe aktarma

Hâlihazırda var olan bir sunucuyu baştan kurmanız gerekmez. Sihirbazın ilk adımı, **Sıfırdan
kurulum**un yanında var olan bir sunucuyu içeri almanın üç yolunu sunar:

| Kaynak | Ne verirsiniz | Ne olur |
| --- | --- | --- |
| **Düğümdeki var olan klasör** | **Düğüm üzerindeki** mutlak bir yol, elle yazılır | Düğüm o klasörü kendi deposuna **kopyalar** — asla taşımaz; yani özgün klasör tam olduğu yerde kalır ve başarısız bir içe aktarmanın size bir bedeli olmaz. Sembolik bağlar izlenmez, atlanır. Düğümün kendi veri klasörünün içindeki bir klasör ya da içinde sunucu jar'ı olmayan bir klasör reddedilir. |
| **Var olan bir sunucuyu yükleme** | Bir sunucu klasörünün **1 GB**'a kadar olan `.zip` dosyası | Panele bırakılır, düğüme verilir ve orada açılır. Arşivin içindeki tek bir üst klasör düzleştirilir; hedefin dışına açılacak bir girdi reddedilir. Yükleme 30 dakika boyunca kullanılabilir kalır. |
| **Modpack** | Modrinth üzerinde aranan bir modpack | Düğüm, paketin listelediği sunucu tarafı dosyaların hepsini indirir, paketin üzerine yazma (override) dosyalarını uygular ve paketin istediği yükleyiciyi kurar — Fabric ve Quilt kendi üstverilerinden, Forge ve NeoForge ise resmî yükleyici çalıştırılarak. |

**Size yazılım ya da sürüm sorulmaz.** Düğüm bunları içe aktardığı şeyin içinden okur —
çalıştırılabilir jar, jar'ın manifestosu, `version.json`, paket üstverisi, `server.properties` — ve
Pano; yazılımı, Minecraft sürümünü, gereken Java sürümünü ve hâlihazırda yapılandırılmış olan portu
kendiliğinden doldurur. Sihirbaz da bunu söyler: *Pano; sunucu yazılımını, Minecraft sürümünü ve
portu içe aktarılan şeyin kendisinden okur.*

Port da aynı kurala uyar: istediğiniz port; bir port belirtmediyseniz, boşsa içe aktarılan
`server.properties` dosyasının kullandığı port; o da olmazsa düğümün aralığındaki ilk boş port.

Sonrası sıradan bir yönetilen sunucudur. Pano eklentisi içine kurulur, dünyalar ve yapılandırma sizin
getirdikleriniz olur ve panel sunucuyu başlatabilir.

> İçe aktarma, düğüme veri kopyalar. Diskinde yer olduğundan ve gösterdiğiniz klasörün başka bir
> yerde **şu anda çalışan** bir sunucuya ait olmadığından emin olun — tek bir klasördeki iki süreç
> dünyaları bozar.

### Proxy sunucuları {#proxy-sunuculari}

Velocity, Waterfall ve BungeeCord da diğer sunucular gibi oluşturulur ve yönetilir: **Yazılım ve
sürüm** adımında birini seçin; kendi konsolu, dosyaları, yedekleri ve zamanlanmış görevleri olur.
Pano bir proxy'yi arkasındaki sunuculara kendisi bağlamaz — onları proxy'nin kendi yapılandırmasına
(Velocity'de `velocity.toml`, Waterfall ve BungeeCord'da `config.yml`) ekleyin ve her arka uçta
yönlendirmeyi (forwarding) ayarlayın; ikisini de [dosya yöneticisinden](#dosyalar) yapabilirsiniz.

> Proxy'nin arkasındaki bir sunucu, proxy'nin oyuncuları ona yönlendirebilmesi için genellikle
> `online-mode=false` ile çalışır. Bu sunucuların **internetten erişilebilir olmadığından** emin olun
> — yalnızca proxy erişilebilir olmalı. Portu herkese açık ve online modu kapalı bir sunucu,
> isteyenin istediği kimlikle girmesine izin verir.

### Yönetilen sunucuda güç ve konsol

Süreç bir düğüme ait olduğunda dört güç düğmesi de çalışır:

- **Başlat** — düğüm, aşağıdaki başlangıç ayarlarıyla JVM'i başlatır ve çıktısını izler. Sunucu,
  `Done (…)` satırını yazdığında ya da en geç 60 saniye sonra **Çalışıyor** sayılır.
- **Durdur** — düğüm durdurma komutunu yazar, bekler, sonra süreci sonlandırır ve en sonunda öldürür.
  Üçünü de yok sayan bir sunucu yarı canlı bırakılmaz.
- **Yeniden başlat** — durdurup başlatır.
- **Öldür** — takılıp kalmış bir sunucu için doğrudan öldürme. Hiçbir şey kaydedilmez; bu yüzden
  **Durdur** zaten başarısız olduğunda kullanın.

Konsol sayfası, bağlı bir sunucudakiyle aynı sayfadır; yönetilen bir sunucuda yalnızca iki kaynağı
olur ve [geçmişini](#konsol) düğüm okuduğu için sunucu dururken de geriye gidilebilir. Düğüm,
**sürecin yazdırdığı her şeyi** aktarır — açılış günlüğü, başlangıçtaki bir hata yığını, eklenti
daha yüklenmeden gerçekleşen çökme — eklenti de çalışma zamanı günlüğünü eskisi gibi aktarır;
Pano bunları sunucu başına tek bir tampona harmanlar ve hangi satırın nereden geldiğini hatırlar.
Yazdığınız komutu sunucunun girdisine düğüm yazar ve komut, bağlı bir sunucuda olduğu gibi önce
konsola yankılanır:

```
[Pano:admin] > say merhaba
```

Güç işlemleri de aynı şekilde yankılanır; böylece izleyen herkes sunucuyu kimin durdurduğunu görür.

#### Sahiplenilen sunucular

Bir düğümün durması, onun gözettiği sunucuları **durdurmaz**. Arka plan sürecini yeniden başlatın,
güncelleyin ya da öldürün; o makinedeki her Minecraft sunucusu, içindeki oyuncularla birlikte
çalışmaya devam eder — arka plan süreci güncellendi diye kimse dünyasından atılmaz. Süreç geri
geldiğinde onları yeniden bulur: başlattığı her sunucunun yanına küçük bir sahiplik kaydı yazmıştır
([`.pano-node/process.json`](pano-node/#arka-plan-sureci-yeniden-baslarken-neler-korunur)) ve bir
sonraki açılışında, kayıttaki sürecin hâlâ yaşadığını ve gerçekten o sunucu olduğunu doğruladıktan
sonra onu devralır — yani **sahiplenir**.

Sahiplenilen bir sunucu başlığında *sahiplenildi* rozetiyle **Çalışıyor** görünür ve neredeyse her
şey eskisi gibidir: konsol akmaya devam eder, geçmişi günlük dosyalarından geriye sayfalanır,
ölçümler gelmeyi sürdürür; **Durdur**, **Yeniden başlat** ve **Öldür** çalışır. Eksik olan tek şey,
sürecin **standart girdisidir** — o boru, artık olmayan arka plan sürecinindi — yani düğüm sunucuya
yazamaz:

- **Pano eklentisi kuruluysa** — ki Pano'nun oluşturduğu her sunucuda kuruludur — bunu fark etmezsiniz:
  komutlar basitçe eklenti üzerinden gönderilir.
- **Kurulu değilse** konsolun giriş kutusu kapalı gelir ve ipucu, girişi geri kazanmak için sunucuyu
  panelden bir kez yeniden başlatmanızı söyler. Panelden tek bir yeniden başlatma yeter; düğüm süreci
  yeniden tam olarak sahiplenir.

**Sahiplenilen bir sunucu ölürse otomatik olarak yeniden başlatılmaz**; *Çökme sonrası yeniden
başlat* açık olsa bile. O süreci arka plan süreci başlatmadı; bu yüzden bir çökmeyi, birinin makinede
sunucuyu elle durdurmasından ayırt edemez — bilerek kapatılmış bir sunucuyu geri açmak ise onu kapalı
bırakmaktan daha kötüdür. Sunucuyu panelden yeniden başlatın.

> Eski davranış tek bir ayar uzaklıktadır: düğümün [`config.conf`](pano-node/#config-conf) dosyasında
> `node.stop-servers-on-exit = true` dediğinizde arka plan süreci, çıkarken sunucularını da durdurur.
> Varsayılan değer `false`'tur.

### Başlangıç ayarları

**Sunucu → Ayarlar → Başlangıç**, yönetilen bir sunucunun nasıl başlatılacağını belirler ve
**Sunucu Başlatmasını Yönet** izniyle korunur.

| Alan | |
| --- | --- |
| Java sürümü | Başlatmada kullanılacak ana sürüm ya da **Otomatik** — aşağıya bakın. |
| Bellek | JVM'in başlatıldığı yığın boyutu. |
| Oyun portu | Oyuncuların bağlandığı port. |
| JVM parametreleri | Ek bayraklar. Gerektiğini bilmiyorsanız boş bırakın. |
| Pano ile başlat | Düğüm ayağa kalktığında bu sunucuyu başlat. |
| Çökünce yeniden başlat | Süreç beklenmedik şekilde öldüğünde geri getir. |

**Ayarlar → Server properties**, `server.properties` dosyasının kendisini düzenler: sunucunun
yazdığı her anahtar, gruplanmış (Genel, Dünya, Performans, Oyuncular, Kaynak paketi, Ağ) ve kısa bir
açıklamayla; her biri için doğru kontrol — anahtar, sınırlı bir sayı, izinli değerlerin listesi,
gizli bilgiler için şifre alanı — bir **Bul** kutusu ve taze bir sunucununkinden farklı her değerde
*Varsayılana döndür*. Form **node'daki dosyanın şu anki halinden** doldurulur, elle yapılan
düzenlemeler dahil; node'a ulaşılamıyorsa bunu söyler ve Pano'nun kaydettiği değerleri gösterir.
Kaydetmek yalnızca değiştirdiğiniz anahtarları gönderir; düğüm bunları gerçek dosyanın üzerine
**harmanlar**, yani bir yöneticinin ya da bir eklentinin oraya koyduğu her şey olduğu gibi kalır.
Sayfanın bilmediği anahtarlar — bir fork'un kendi ayarları ya da yeni bir sürümün eklediği —
**Diğer anahtarlar** altında listelenir; düz metin olarak düzenlenebilir ya da eklenebilir.
Yazmayacağı tek anahtar `server-port`: o, Startup sekmesindeki, düğümün ayırdığı porttur.

> Başlangıç ayarları **bir sonraki açılışta** kullanılır. Çalışan bir sürece hiçbir şey uygulanmaz —
> istediğinizi değiştirin, sonra sunucuyu yeniden başlatın.

### Yeniden kurma

**Sunucu → Ayarlar → Tehlikeli bölge → Yeniden kur**, sunucunun mevcut yazılımını baştan kurar;
isterseniz farklı bir sürümle. [Yazılımı değiştirme](#sunucu-yazilimini-degistirme) ile aynı
pencereyi açar, yalnızca yazılım sunucunun zaten çalıştırdığına sabitlenir; neyin korunacağını ve
önce yedek alınıp alınmayacağını siz seçersiniz. **Sunucu Oluştur** izni ve hesap parolanız gerekir —
Pano'nun diğer yıkıcı işlemleri gibi — ve işlem etkinlik günlüğüne yazılır.

### Sunucu yazılımını değiştirme {#sunucu-yazilimini-degistirme}

**Sunucu → Ayarlar → Tehlikeli bölge → Yazılımı değiştir**, yönetilen bir sunucuyu başka bir yazılıma
ya da sürüme taşır — Paper'dan Purpur'a, Fabric'ten Paper'a, bir oyun sunucusundan Velocity'ye.
Pano sunucu çalışıyorsa onu durdurur, yeni sunucu dosyalarını indirir ve sunucuyu geri getirir.
Pencere dört bölümden oluşur:

1. **Yazılım ve sürüm.** Sunucu oluşturma sihirbazındaki listenin aynısı; mevcut yazılım işaretlidir.
   Java satırı yeni sürümün hangi Java ile çalışacağını gösterir, düğümün onu önce indirmesi
   gerekiyorsa bunu da belirtir.
2. **Neler korunsun** — taşınması güvenli olan her şey açık gelen üç anahtar:
   - **Dünyalar**: içinde `level.dat` olan her klasör (özel bir `level-name` da korunur) ve adı
     `world*` ile başlayan her şey.
   - **Eklentiler** (ya da **Modlar**): `plugins/` klasörü; Fabric ve Forge'da `mods/` ile `config/`.
   - **Yapılandırma**: `server.properties`, yazılımın kendi dosyaları (`bukkit.yml`, `spigot.yml`,
     `config/paper-*.yml`, `purpur.yml`, `velocity.toml`, BungeeCord'un `config.yml` dosyası),
     `eula.txt`, beyaz liste, operatörler, yasaklar ve kullanıcı önbelleği.
3. **Önce yedek al** (varsayılan olarak açık), **Ardından sunucuyu başlat** (sunucu şu an çalışıyorsa
   açık) ve hesap parolanız.
4. Değişikliğin adım adım ilerlemesi. Pencereyi kapatabilirsiniz; sunucu başlığı ilerlemeyi
   göstermeye devam eder.

**Yazılım aileleri.** Neyin taşınabileceği iki taraftaki aileye bağlıdır:

| Aile | Yazılım | Tür |
| --- | --- | --- |
| Bukkit | Paper, Purpur, Folia, Spigot, CraftBukkit | Oyun sunucusu |
| Fabric | Fabric, Quilt | Oyun sunucusu |
| Forge | Forge, NeoForge | Oyun sunucusu |
| Vanilla | Vanilla | Oyun sunucusu |
| Velocity | Velocity | Proxy |
| BungeeCord | BungeeCord, Waterfall | Proxy |

- **Aynı aile içinde** (Paper → Purpur) her şey korunabilir.
- **Farklı ailelerden oyun sunucuları arasında** dünyalar taşınır, eklentiler ve modlar taşınmaz
  (Paper eklentisi Fabric'te yüklenmez); yapılandırmadan yalnızca vanilla dosyaları
  (`server.properties`, beyaz liste, operatörler, yasaklar, kullanıcı önbelleği) Bukkit, Fabric ve
  vanilla arasında taşınır.
- **Oyun sunucusu ile proxy arasında** hiçbir şey taşınmaz: proxy'nin dünyası yoktur ve ikisi ne
  eklenti ne de yapılandırma paylaşır. Bir [ağın](#proxy-sunuculari) parçası olan sunucu, proxy ile oyun sunucusu arasında
  geçiş yapmadan önce ağdan çıkarılmalıdır.

Seçtiğiniz ikili için anlamsız olan anahtar gri görünür; eklentiler ya da dünyalar geride kalacaksa
panel sizi uyarır. Pano eklenti modülü de yeni yazılımınkiyle değiştirilir.

**Önce yedek.** Anahtar açıkken, hiçbir şeye dokunulmadan önce `before-<eski>-to-<yeni>-<tarih>`
adlı tam bir [yedeğin](#yedekler) bitmesi gerekir. Yedek başarısız olursa değişiklik orada durur ve
sunucu olduğu gibi kalır.

**Başarısızlıkta geri alma.** Düğüm, kurulumu yeni bir klasöre yapar ve eski klasörü yeni kurulum
bitene kadar kenarda tutar; eski klasör ancak o zaman silinir. İndirme ya da kurulum başarısız
olursa eski klasör geri konur; yani başarısız bir değişiklik sunucuyu olduğu gibi bırakır.

### Bir sunucuyu silme {#deleting-a-server}

**Sunucu → Ayarlar → Sunucuyu Kaldır** hesap parolanızı ister ve etkinlik günlüğüne yazılır.
**Yönetilen** bir sunucuda bu işlem geri alınamaz:

- düğüm, çalışıyorsa sunucuyu durdurur ve klasörünü siler — jar, dünyalar, eklentiler,
  `servers/<sunucu-uuid>/` altındaki her şey;
- **yedekleri de onunla birlikte gider**: `backups/<sunucu-uuid>/` altındaki bütün arşivler ve
  anlık görüntü deposu. Pencere bunun kaç yedek olduğunu ve ne kadar yer kapladığını söyler.
  Saklamak istediklerinizi düğmeye basmadan önce [indirin](#yedekler).

Sunucuyu sildiğinizde düğüm çevrimdışıysa Pano sunucuyu hemen panelden kaldırır; düğüm dosyaları ve
yedekleri bir sonraki bağlanışında siler: elindeki sunucuları bildirir, Pano da artık tanımadıklarını
silmesini söyler. Bir düğüm açılırken, sunucusu artık var olmayan yedek klasörlerini de temizler.

**Bağlı** bir sunucu ise yalnızca Pano'dan kaldırılır: dosyaları ve Pano eklentisinin yanına aldığı
yedekler Minecraft sunucusunun kendi makinesinde kalır.

### Java sürümü seçimi

Java sürümünü **Otomatik** bırakırsanız düğüm, o makinede gerçekten kurulu olan çalışma zamanları
arasından seçer ve **Minecraft sürümünün desteklediği en düşük sürümü** tercih eder:

| Minecraft | En az |
| --- | --- |
| 26.1 ve yenisi | Java 25 |
| 1.20.5 – 1.21.x | Java 21 |
| 1.17 – 1.20.4 | Java 17 |
| 1.16.5 | Java 16 |
| 1.16.5'ten eskisi | Java 8; Java 17+ ile hiç açılmaz |

"En yenisi kazansın" kuralı akla ilk geleni ama yanlış olanıydı: Paper 1.21.8 Java 21 ister, çok daha
yeni bir JVM ile mutlu mesut açılır ve sonra kapanırken yerel kodda ölür; çünkü "çalışıyor" ile
"destekleniyor" aynı soru değildir. Bu yüzden kurulu olduğu sürece en düşük sürüm kazanır; seçim ve
gerekçesi de sunucunun konsoluna açılışta yazılır.

**Makinede uygun bir Java yoksa düğüm onu indirir.** Yalnızca Java 17 bulunan bir makinede Java 21
isteyen bir sunucu artık hata vermez: düğüm kendi veri klasörüne bir Java 21 çalışma zamanı indirir
ve devam eder — sunucu kuruluyorsa kurulum görevinin içinde, başlatılıyorsa başlatmadan önce ayrı
bir **Java indiriliyor** göreviyle. Çalışma zamanlarının nereden geldiği, nerede durduğu ve bu
özelliğin nasıl kapatılacağı [pano-node sayfasında](./pano-node/#java-runtimes) anlatılıyor.

Sunucu oluşturma sihirbazındaki ve **Başlangıç ayarları**ndaki **Java seçimi** iki tür seçenek
listeler:

- düğümde **kurulu** olan ana sürümler, `Java 17` biçiminde;
- düğümün işletim sistemi ve mimarisi için **indirebileceği** ana sürümler,
  `Java 21 — indirilecek (~50 MB)` biçiminde. Bunlardan birini seçmek serbesttir: çalışma zamanı
  kurulumdan önce (sihirbazda) ya da bir sonraki başlatmada (Başlangıç ayarlarında) indirilir. O
  makine için iki dağıtıcının da derlemesi olmayan bir sürüm hiç listelenmez.

**Otomatik**, sihirbaz Minecraft sürümünü öğrendiği anda hangi Java'ya düşeceğini de söyler —
`Otomatik (Java 21)` — ve o Java düğümde henüz yoksa önce indirileceğini altında belirtir. Gözden
geçirme adımı ikisini de tekrarlar. Düğüm çevrimdışıysa, bu özellikten eskiyse ya da otomatik indirme
kapalıysa seçim yalnızca kurulu sürümlere geri döner.

Bir başlatma yine de Java yüzünden başarısız olursa — otomatik indirme kapalıdır ya da indirmenin
kendisi başarısız olmuştur — sunucunun **Genel bakış** sayfası nedenini **Java N indir ve başlat**
düğmesiyle birlikte gösterir: düğme o çalışma zamanını düğüme kurar ve indirme biter bitmez sunucuyu
başlatır. Düğme için **Düğümleri Yönet** ve **Sunucu Gücünü Yönet** izinleri gerekir.

Kararı kendiniz vermek isterseniz Java sürümünü sihirbazda ya da **Başlangıç ayarları**nda açıkça
seçin. Bir düğümdeki her çalışma zamanı — makinede bulunan ya da Pano'nun indirdiği — **Sunucular →
Düğümler** altında o düğümün sayfasında listelenir.

**Spigot derlemesi başka bir soru sorar** ve düğüm bu soruyu kendisi yanıtlar.
[BuildTools](#spigot-dugumde-derlenir), o Minecraft sürümünün *derlendiği* JDK'yi ister; bu da her
zaman bitmiş sunucunun en rahat çalıştığı JDK değildir. Bu yüzden derleme, istenen sürümün tam
karşılığını — o kurulu değilse ondan sonraki en yakın sürümü — kullanır: 1.21.x Java 21 ile, 1.16
Java 8 ile derlenir. Ötesi sorgulanmaz: JDK'yi BuildTools'un kendisi denetler ve uygun olmayanı
kendi sözleriyle geri çevirir; kurulum da bunu olduğu gibi aktarır.

### Yönetilen sunucuda ölçümler

Yönetilen bir sunucunun iki sayı kaynağı vardır ve genel bakış ikisini de gösterir:

- **Düğümden**, süreç yaşadığı sürece her 10 saniyede bir: sürecin **CPU** kullanımı ve **yerleşik
  bellek** kullanımı, yani işletim sisteminin gördüğü değer — yalnızca yığın değil, JVM'in tamamı.
  Düğüm ayrıca **makinenin** CPU, RAM ve disk durumunu da bildirir; bunlar Düğümler sayfasında görünür.
  Yanıt veren bir Pano eklentisi yoksa düğüm, bir sunucu listesi ping'inden **oyuncu sayısını** da
  ekler.
- **Eklentiden**: TPS, MSPT, JVM yığını, oyuncu sayısı ve oyuncu listesi — bağlı bir sunucudakiyle
  tıpatıp aynı. Bunlar Pano eklentisini gerektirir; Pano da oluşturduğu her yönetilen sunucuya o
  eklentiyi kurar, yani bir Paper, Purpur, Folia, Fabric ya da Velocity sunucusunda ilk açılıştan
  itibaren vardır. **Vanilla** sunucusunun eklenti modülü hiç yoktur; oradaki sayılar düğümündür:
  süreç CPU'su ve belleği, ping'den gelen oyuncu sayısı ve en çok on iki ad. TPS ile MSPT ise JVM'in
  dışından ölçülemez ve orada hiç gösterilmez.

### Dosyalar

**Sunucu → Dosyalar** bir dosya yöneticisidir ve **Sunucu Dosyalarını Yönet** izniyle korunur.
Yaptığı her şey yalnızca o sunucunun kendi klasörünün içinde olur — makinede bir kabuk yoktur ve
klasörün üstündeki hiçbir yere erişilemez. İşi, varsa **düğüm** yapar; yoksa sunucunun içindeki
**Pano eklentisi** kendi klasörünü tıpatıp aynı kurallarla sunar.

- **Gezinme.** Ad, boyut ve değiştirilme zamanı; sıralanabilir hâlde, **Sunucu kökü**nden aşağı inen
  bir kırıntı yolu ve bulunduğunuz klasör için bir filtre kutusuyla. Geçerli klasör adresin
  parçasıdır; yani bir yol yer imine eklenebilir ya da bir arkadaşınıza gönderilebilir.
- **Düzenleme.** Bir metin dosyasını açtığınızda, bir sunucu klasörünün dolu olduğu biçimler — JSON,
  YAML, TOML ve `.properties`/`.conf`/`.ini` — için renklendirme yapan bir düzenleyici açılır.
  <kbd>Ctrl</kbd>+<kbd>S</kbd> kaydeder. **256 KB**'a kadar dosyalar tamamen açılır; daha büyüğü
  bunu söyleyen bir notla salt okunur açılır; ikili (binary) bir dosya ise hiç açılmaz — onu indirin.
  Tek bir kayıt en fazla **1 MB** olabilir. Başlık dosyanın boyutunu ve kaydedilmemiş
  değişikliklerin onu ne kadar değiştirdiğini gösterir.
- **Önizleme.** Resim, video ve ses dosyaları (PNG, JPEG, GIF, WebP, MP4, WebM, MP3, OGG, WAV ve
  benzerleri) düzenleyici yerine bir görüntüleyicide açılır. SVG ve HTML panelde hiçbir zaman
  gösterilmez — orada betik çalıştırabilirler — bu yüzden yalnızca indirilebilirler.
- **Oluşturma, yeniden adlandırma, silme.** Yeni dosya, yeni klasör, yeniden adlandırma ve silme —
  tek bir girdi ya da bir seçim.
- **Çıkarma.** Klasördeki bir `.zip`, adını verdiğiniz bir klasöre çıkarılabilir. Çıkarma, o
  klasörün dışına düşecek girdileri reddeder.
- **İzinler.** Linux ya da macOS düğümünde bir girdinin POSIX kipi değiştirilebilir (`0644` ve
  benzerleri). Dosya sisteminin kip kavramı olmadığı yerlerde bu işlem sunulmaz.
- **Yükleme.** Dosyaları listenin üzerine sürükleyin ya da düğmeyi kullanın; düğme, dosyaların hangi
  klasöre gideceğini gösteren bir bırakma alanı açar. Tek bir dosya **1 GB**'a kadar olabilir; her
  yükleme kendi ilerlemesini gösterir ve Pano üzerinden düğüme akıtılır.
- **İndirme.** Tek bir dosya kendisi olarak iner. Bir klasör ya da birden fazla öğeden oluşan bir
  seçim, **indirilirken oluşturulan tek bir zip** olarak iner — sunucunun diskine hiçbir şey
  yazılmaz ve aşağıdaki kimlik bilgisi dosyaları bu zip'e girmez.

**Dosya yöneticisinin dokunmayacağı şeyler.** Birkaç dosya, okuyan kişinin bu sunucunun kimliğine
bürünüp Pano ile konuşmasına yetecek kimlik bilgileri taşır; bu yüzden listede gizlenirler ve
üzerlerindeki her işlem reddedilir: Pano eklentisinin kendi `config.conf` dosyası (platform onu
nerede tutuyorsa), düğümün `server.json` dosyası ve JVM'in `hs_err_*` çökme dökümleri. Bunları içeren
klasörler de silinemez ve yeniden adlandırılamaz; ama içlerindeki diğer şeyler normal biçimde
düzenlenebilir. Aynı ret, sunucu klasörünün dışına çıkmaya çalışan her şeyi kapsar — içinde `..`
geçen bir yol, mutlak bir yol ya da dışarıyı gösteren bir sembolik bağ.

> **Hiçbiri** olmayan — ne düğümü ne de dosya sunabilen bir eklentisi bulunan — bir sunucuda sayfa
> yine listelenir; kontrolleri kapalı gelir ve bunu söyleyen bir uyarı çıkar: karşı tarafta soracak
> kimse yoktur. Kendi klasörünü sunan bir eklenti, içinde çalıştığı sunucunun açık tuttuğu jar'ların
> üzerine yazmayı reddeder. Bkz. [Hangi özellik neyle çalışır](what-works-with-what/).

### Yedekler

**Sunucu → Yedekler** bir sunucuyu arşivler ve **Sunucu Yedeklerini Yönet** izniyle korunur. Bir
yedek, tüm sunucu klasörünün zip'idir; **düğümde** alınır ve orada
`<node-data>/backups/<sunucu-uuid>/` altında tutulur — yani tam olarak o makine kadar güvendedir.
Önemsediklerinizi başka bir yere kopyalayın. Arkasında düğüm olmayan bir sunucuyu da, bu işi
yapabilecek kadar yeni bir **Pano eklentisi** yedekleyebilir: aynı arşivleri sunucunun yanına yazar
ve aynı saklama ayarıyla budar.

**Tam mı snapshot mı, ve neler alınsın.** **Yedek oluştur** iki seçenekli bir pencere açar; bir
zamanlamanın yedek adımı da aynı seçenekleri sunar:

| | Tam | Snapshot |
| --- | --- | --- |
| Ne yazılır | Kendi başına yeten tek bir `.zip` | Sunucunun snapshot deposunda bir kayıt (`backups/<sunucu-uuid>/repo/`) |
| Diskteki boyut | Seçimin tamamı, her seferinde | Yalnızca önceki snapshot'lardan bu yana değişen veri; gerisi paylaşılır |
| İndirme | Zip'in kendisi | Depodan anında oluşturulan bir zip |
| En uygun | "Güncellemeden önce" kopyaları, sunucu taşıma | Sık (saatlik) dünya yedekleri |

Snapshot'lar Pano'nun kendi artımlı deposudur — dışarıdan hiçbir araç indirilmez. Dosyalar içeriğe
göre belirlenen parçalara (yaklaşık 1 MiB) bölünür; her parça SHA-256'sıyla bir kez saklanır ve işe
yarıyorsa sıkıştırılır. Böylece birkaç parçası değişen bir region dosyası, dosyanın tamamına değil o
birkaç parçaya mal olur. Her snapshot yine de eksiksiz ve tek başına geri yüklenebilir bir görünümdür;
birini geri yüklemek diğerlerine ihtiyaç duymaz. Bir snapshot silindiğinde başka hiçbir şeyin
kullanmadığı parçalar da silinir.

Neler alınsın:

- **Her şey** — sunucu klasörünün tamamı.
- **Sadece dünyalar** — `server.properties`'teki `level-name` dünyası, onun `_nether` ve `_the_end`'i
  ve `level.dat` içeren diğer üst düzey klasörler (Multiverse ve benzerleri). Pencere bulduklarını
  listeler.
- **Özel** — yalnızca her satıra bir tane yazdığınız yollar (`world/`, `plugins/Essentials/`,
  `server.properties`).

**Hariç tut** her satıra bir desen alır: `/` ile biten bir klasör, `*.log` gibi bir dosya adı deseni
ya da tam bir yol. İşareti kaldırmadıkça `logs/`, `cache/` ve yarım inmiş jar'lar da hariç tutulur;
yukarıdaki kimlik bilgisi dosyaları her durumda dahil edilmez.

- **Yedek almak.** İsterseniz bir ad verin, **Yedek oluştur**'a basın; gerisini düğüm yapar: çalışan
  bir sunucuda arşivin etrafında dünya kaydını kapatır, her şeyi diske yazdırır ve kaydı yeniden
  açar; böylece canlı bir sunucunun yedeği yarım yazılmış değil, tutarlı olur. `logs/`, `cache/` ve
  yarım inmiş jar'lar dışarıda bırakılır; yukarıdaki kimlik bilgisi dosyaları da öyle. İşlem
  sürerken ilerleme gösterilir ve sayfaya bakan herkes bunu görür.
- **Liste**; adı, boyutu, ne zaman ve kimin tarafından alındığını, durumunu ve indirdiğiniz bir
  arşivi doğrulamak için tek tıkla kopyalayabileceğiniz **SHA-256** sağlamasını gösterir.
- **İndirme**, arşivi düğüm üzerinden tarayıcınıza akıtır.
- **Geri yükleme**, sunucu klasöründeki her şeyi arşivin içeriğiyle değiştirir. Sunucunun önce
  **durdurulmuş** olması gerekir — düğme, durana kadar bunu söyler — ve Pano **hesap parolanızı**
  ister. Düğüm, herhangi bir şey çıkarmadan önce o anki `world*` klasörlerini bir `pre-restore-…`
  arşivine sıkıştırır; böylece istemeden yaptığınız bir geri yükleme de geri alınabilir olur.
- **Silme** de parolanızı ister. İkisi de etkinlik günlüğüne yazılır.
- **Saklama.** Tam yedekler ve snapshot'lar ayrı sayılır. **Saklanacak tam yedek** (varsayılan
  **10**, en fazla 100) ve **Saklanacak snapshot** (varsayılan **24**, en fazla 500), bir yedek
  bittiğinde sınırın ötesindeki en eski başarılıları budar; başarısız denemeler önce temizlenir.
  Snapshot'lar ayrıca GB cinsinden bir **disk sınırı** altında tutulabilir: aşılınca en eskiler
  silinir, en yenisi asla. **Sabitlenmiş** bir yedek (satır menüsü → *Sabitle*) iki kural tarafından
  da hiç silinmez.
- **Geri yüklemede dünya klasörleri bütünüyle değiştirilir.** Yedeğin içerdiği her dünya klasörü önce
  boşaltılır, sonra geri yazılır; böylece yedekten sonra keşfedilen bölgeler ona karışamaz. Diğer her
  şey eskisi gibi olanın üzerine yazılır. Bir snapshot, sunucuda herhangi bir şeye dokunulmadan önce
  parça parça doğrulanır.

> **Eklentinin yaptığı geri yükleme bir sonraki açılışta gerçekleşir.** Bir eklenti, içinde çalıştığı
> sunucunun dosyalarının üzerine yazamaz; bu yüzden bir işaret dosyası — `.pano/restore-pending.json`
> — yazar ve arşiv, o sunucu bir dahaki sefer açıldığında, dünyaları yüklenmeden önce çıkarılır.
> Görev, sunucu geri gelip sonucu bildirene kadar *bir sonraki açılışta uygulanacak* durumunda kalır.
> Düğüm bunun yerine hemen geri yükler; arkasında düğüm olan bir sunucunun bu iş için her zaman
> düğümü kullanmasının nedeni budur.

Yedekler bir zaman çizelgesine göre de alınabilir — bkz.
[Zamanlanmış görevler](#zamanlanmıs-gorevler).

> **Yedekler sunucularına aittir.** [Yönetilen bir sunucuyu silmek](#deleting-a-server) onun
> düğümdeki yedeklerini de siler; [bir düğümü kaldırmak](pano-node/#removing-a-node) üzerindeki her
> sunucunun yedeklerini siler. Saklamak istediklerinizi önce indirin.

### Eklentiler ve modlar

Yönetilen bir sunucunun eklentiler sayfasında iki sekme vardır.

**Kurulu**, [yukarıda anlatılan](#eklentiler) listedir — çalışan sunucunun bildirdikleri — ve
sunucunun `plugins/` (ya da `mods/`) klasöründe gerçekten duran jar'larla harmanlanır. Sunucunun
yüklemediği bir jar **Yüklenmedi** olarak işaretlenir; bir şey kurduktan hemen sonra göreceğiniz şey
budur. Her dosya kaldırılabilir; Pano eklentisinin kendi jar'ı ise reddedilir, çünkü onu kaldırmak
sunucunun panelle bağını koparırdı.

> **Yeniden başlatma gerekir.** Çalışan bir sunucuya dosya kopyalayarak hiçbir şey yüklenmez. Klasör,
> sunucunun eklentilerini son bildirdiği andan beri değiştiyse sayfa, sunucu yeniden başlatılana
> kadar bunu söyler.

**Gözat**, panelden çıkmadan eklenti ve mod sitelerinde arama yapar:

| Kaynak | |
| --- | --- |
| **Modrinth** | Eklentiler ve modlar. Yerleşiktir, ayarlanacak bir şey yoktur. |
| **Hangar** | PaperMC'nin kendi eklenti sitesi. Yerleşiktir, ayarlanacak bir şey yoktur. |
| **CurseForge** | Kendi API anahtarınızı ekleyene kadar kapalıdır — aşağıya bakın. |

Arama zaten bulunduğunuz sunucuya göre daraltılmıştır: her siteye o sunucunun yükleyicisini ve
Minecraft sürümünü sorar. Her sonuç ve her sürüm bir rozet taşır — **Uyumlu**, ya da bildirdikleri bu
sunucuyu kapsamıyorsa **Uymayabilir**. "Uymayabilir" diyen bir sürüm yine de bilerek kurulabilir,
çünkü eski bir derleme çoğu zaman çalışır; rozet, seçimin bir sürpriz değil sizin kararınız olması
için oradadır.

Kurulum, dosyayı **düğümde** indirir, sitenin yayınladığı sağlamayla doğrular, gerçekten bir jar
olduğundan emin olur ve yerine taşır — Fabric, Quilt, Forge ve NeoForge'da `mods/`, diğer her yerde
`plugins/`. Erişilemeyen bir kaynak ya da geliştiricisinin üçüncü taraf indirmelerine izin vermediği
bir proje, kurulacak hiçbir şey sunmaz.

Kurmak ve kaldırmak, sunucunun klasörüne yazabilen bir taraf gerektirir: bir **düğüm** ya da
dosyaları kendisi kurabilecek kadar yeni bir **Pano eklentisi**. İkisi de yoksa Gözat sekmesi orada
görünmez. Aramanın kendisi her sunucudan çalışır.

**CurseForge** için kendinize ait bir anahtar gerekir; çünkü CurseForge her uygulamanın kimlik
doğrulaması yapmasını şart koşar. Anahtarı Pano'nun `config.conf` dosyasına koyun:

```jsonc
plugin-sources {
  curseforge-api-key = null
}
```

Anahtar ayarlanana kadar kaynak, nedeniyle birlikte kapalı gösterilir ve yalnızca Modrinth ile Hangar
aranır. Bkz. [Yapılandırma Rehberi](../configuration/#eklenti-kaynakları-plugin-sources).

#### Eklentileri güncel tutma

Pano, kurduğu her eklentinin nereden geldiğini — kaynağını, projesini ve tam sürümünü — yazar ve
**Kurulu** listesi bunu gösterir: izlenen her jar, adının yanında bir **Modrinth**, **Hangar** ya da
**CurseForge** rozeti taşır.

O projenin bu sunucuya uyan daha yeni bir derlemesi varsa satır, yeni sürüm numarasını taşıyan ve
proje sayfasına bağlanan bir **Güncelleme var** rozetiyle yanında bir **Güncelle** düğmesi kazanır.
Kart başlığı bunları sayar — **N güncellenebilir** — ve hepsini birden başlatan bir
**Tümünü güncelle (N)** düğmesi sunar.

**"Uyan" demek uyumlu demektir**; ölçüt, Gözat sekmesindeki rozetin kullandığının aynısıdır:
yükleyici ailesi ve bu sunucunun gerçekten çalıştırdığı Minecraft sürümü. Bunun ötesinde,
**kararlı** bir derleme çalıştıran sunucuya yalnızca kararlı derlemeler önerilir; bilerek bir beta
ya da alfa kanalına aldığınız bir sunucuya ise o kanal da önerilmeye devam eder — kendi kanalı
ilerlerken birine "güncelleme yok" demek yalan olurdu. Adaylardan hangisinin en yeni olduğuna,
sürüm dizgeleri karşılaştırılarak değil **kaynağın yayımlama tarihine** bakılarak karar verilir;
çünkü `1.21.4-pre2` gibi bir şeyi iki eklenti geliştiricisi aynı biçimde yazmaz.

Güncelleme, eski jar'ın adının verildiği bir kurulumdur: düğüm dosyayı indirir, yayımlanan sağlamayla
doğrular, gerçekten bir jar olduğundan emin olur ve yerine geçtiği dosyanın üzerine taşır. Çalışan
bir sunucuya dosya değiştirilerek hiçbir şey yüklenmediği için ardından alışıldık
**Yeniden başlatma gerekir** uyarısı gelir. **Tümünü güncelle**, her eklenti için ayrı bir düğüm
görevi başlatır ve atladıklarını sessizce geride bırakmak yerine nedenleriyle birlikte bildirir.

Pano eklentisinin kendi jar'ına burada hiçbir zaman güncelleme önerilmez — o bir eklenti sitesinden
gelmedi.

**İlk sayfa açılışı her şeyi bilmiyor olabilir.** İzlenen her satır, üçüncü taraf bir API'ye sorulan
bir sorudur; bu yüzden liste kendine yaklaşık **altı saniyelik** bir bütçe tanır ve o ana kadar
öğrendikleriyle yanıt verir — eklenti listesi uzun bir sunucuda geri kalanlar henüz rozet taşımaz.
Sorulanlar on dakika önbellekte durduğu için, bir dakika sonra sayfayı yenilemek işi tamamlar. Jar'ı
artık klasörde olmayan — dosya yöneticisinden silinmiş ya da adı değiştirilmiş — bir satır, liste
bir sonraki açılışında unutulur.

Güncelleme **Sunucu Eklentilerini Yönet** iznini ve dosyayı yazabilen bir tarafı gerektirir — düğüm
ya da kurulum yapabilen bir eklenti. Bir kurulumla aynı [hız sınırına](#hız-sınırları) tabidir ve
hangi sürümden hangi sürüme geçildiğiyle birlikte [etkinlik günlüğüne](#etkinlik) yazılır.

**Otomatik güncelleme denetimi.** Pano bu denetimi günde bir kez kendiliğinden de yapar ve eskimiş
bir şeyi olan sunucu için bir [Eklenti güncellemeleri](#uyarılar) uyarısı çıkarır. Her yönetilen
sunucunun bunun için bir anahtarı vardır — **Sunucu → Ayarlar → Tercihler** altında ve sunucu
oluşturma sihirbazının ayarlar adımında **Otomatik güncelleme denetimi** — ve varsayılan olarak
açıktır. Kapatıldığında günlük denetim o sunucuyu tamamen atlar: onun için eklenti güncelleme
uyarısı, panel bildirimi ya da e-posta gelmez, onun adına eklenti sitelerine istek de atılmaz. Başka
hiçbir şey değişmez — sunucunun eklentiler sayfasını açmak eskimiş olanları yine gösterir,
**Güncelle** ve **Tümünü güncelle** de eskisi gibi çalışır.

#### Elle yüklenen jar dosyalarını tanıma

Pano, panelden kurduğu şeylerin nereden geldiğini bilir ve geri kalan hakkında hiçbir şey bilmez;
gerçek bir sunucuda klasörün çoğu da budur, çünkü eklentiler panelden çok SFTP ve dosya
yöneticileriyle gelir. Tanınmayan bir jar ne kaynak rozeti alır ne de güncelleme denetimine girer.

Eklentiler sayfasının başlığındaki **Kaynakları bul**, bu jar'ların özetlerini düğümden ister ve
onları arar:

| Site | Neye göre aranır |
| --- | --- |
| **Modrinth** | Dosyanın **SHA-1** özeti. |
| **CurseForge** | Kendi **parmak izi** — ve yalnızca [API anahtarınız](../configuration/#eklenti-kaynakları-plugin-sources) ayarlıysa. |
| **Hangar** | Hiçbir şeye göre — hiçbir özet dizini yayımlamaz. |

Eşleşen bir dosya kaydedilir ve o andan sonra, Pano'nun kurduğu bir dosya gibi izlenir; rozeti ise
kurulduğunu değil dosya özetiyle eşleştirildiğini söyler, çünkü bir özet eşleşmesi bir tanımadır,
makbuz değil. Bu yüzden **Hangar**'dan elle indirilmiş bir eklenti, Gözat sekmesinden kurulana — ya
da yeniden kurulana — kadar bilinmeyen kalır. Bu, Hangar'ın bir özelliğidir; Pano'nun etrafından
dolaşabileceği bir şey değil.

Düğme, düğümün **protokol 2 ya da daha yenisini** konuşmasını gerektirir ve daha eski bir arka plan
sürecinde hiç gösterilmez: tek olası yanıtı "bu düğüm bunu yapamaz" olan bir düğme, hiç düğme
olmamasından kötüdür. Düğümler sayfasından
[düğümü güncelleyin](pano-node/#arka-plan-surecini-guncelleme), düğme belirir. Ayrıca yalnızca
gerçekten bilinmeyen bir şey varken oradadır.

Pano aynısını, kimse istemeden de yapar: bir sunucunun eklentiler sayfası açıldığında — sunucu
başına en fazla **altı saatte bir** — ve bir de [Eklenti güncellemeleri uyarısının](#uyarılar)
arkasındaki günlük taramanın içinde. Her seferinde en fazla 200 jar, asla Pano eklentisinin kendi
jar'ı; kötü bir dakika geçiren bir kaynağın bedeli de sayfa değil, o taramadır.

### Bir şeyler ters gittiğinde

**Düğüm çevrimdışı kalıyor.**

- **Makinede Java 17+ yok** — yerel düğüm kurulumu `LOCAL_NODE_JAVA_MISSING` ile başarısız olur ve
  **Düğüm ekle** penceresi bunu ilerleme ekranında söyler. Java 17 veya daha yeni bir JDK kurun ya
  da hâlihazırda kurulu olanı `local-node.java-path` ile gösterin. Pano'nun kendi Java 11'inin arka
  plan süreci için yeterli olmadığını unutmayın.
- **Arka plan sürecinin jar'ı çıkarılamadı** — Pano `pano-node.jar` dosyasını yanına yazamadı (salt
  okunur ya da dolu bir disk) ya da içinde süreç bulunmayan, elle derlenmiş bir Pano jar'ı. Eşleşen
  sürümün `pano-node.jar` dosyasını elle indirip `local-node.jar-path` ayarına yazın.
- Nedeni ne olursa olsun, arka plan sürecinin kendi çıktısı
  **`<pano-klasörü>/logs/pano-node.log`** dosyasındadır. Uzak bir düğüm ise servisinin standart
  çıktısını nereye yazıyorsa oraya yazar.

**Kurulum başarısız oluyor.** Hata, görev ilerlemesinde yazar. Neredeyse her zaman şunlardan biridir:
indirme adresine erişilemiyor (düğümün PaperMC, Mojang, Purpur, Fabric, SpigotMC ya da `ci.md-5.net`
adreslerine dışarı doğru internet erişimi olmalı), yukarı akışta o derleme geri çekilmiş — başka bir
sürüm seçin — ya da `node-data/` altındaki disk dolu. Düzeltip sunucuyu yeniden oluşturun; başarısız
bir kurulum arkasında çalışan bir şey bırakmaz.

**Spigot kurulumu daha derlemeye başlamadan duruyor.** BuildTools, `git` olmadan hiçbir şey yapamaz.
Git'i olmayan bir makine normalde [düğümün kendi git'ini](pano-node/#git-for-buildtools) alır; yani
bu yalnızca o indirme başarısız olduğunda ya da kapalıyken olur ve görev bunu söyler: *Git is not
installed on this node and automatic tool download is disabled; BuildTools needs it (apt install
git / pacman -S git / brew install git).* Düğümün makinesine git kurun ya da indirmeleri yeniden
açın ve sunucuyu yeniden oluşturun. Bu denetim hem indirmeden hem de JDK aramasından önce yapılır; yani eksik bir `git`, on
dakika sonra keşfedilmek yerine yalnızca saniyelere mal olur.

**Spigot derlemesi yarıda kalıyor.** Görev, BuildTools'un yazdırdığı son hata satırını bildirir — bu
çoğu zaman yeter; yetmediğinde günlüğün tamamı düğümde
`<node-data>/cache/spigot/buildtools/work-<sürüm>/buildtools.log` dosyasında durur. Yalnızca yavaş
olan bir derleme başarısızlık değildir: çalıştığı sürece durumunu bildirir ve ancak **45 dakika**
sonra hâlâ sürüyorsa durdurulur.

**Sunucu CRASHED durumuna düşüyor.** Süreç kendiliğinden sonlandı. Konsolu açın: düğüm, sunucunun
yazdırdığı her şeyi yakaladı — eklenti hiç yüklenmediği için eklenti tarafındaki bir konsolun
kaçıracağı hata yığını dahil. Çıkış kodu durumla birlikte gösterilir: `1` genellikle bir yapılandırma
ya da eklenti hatasıdır; Pano dışından gelen bir öldürme (örneğin sistemin bellek yetersizliği
öldürücüsü) `137` olarak görünür. **Çökünce yeniden başlat** açıksa düğüm gitgide açılan aralıklarla
zaten yeniden deniyordur.

**Port kullanımda.** Düğüm, bir sunucuyu başlatmadan önce portu denetler; Pano'nun dışındaki bir şey
tarafından tutulan bir port, açılışın konsolda bir iletiyle başarısız olmasına yol açar. Portu
**Başlangıç ayarları**ndan değiştirip yeniden başlatın ya da sunucuyu oluştururken portu boş bırakıp
düğümün kendi aralığından boş bir port ayırmasına izin verin.

## Zamanlanmış görevler

> ⚠️ Zamanlanmış görevler de bu sayfanın geri kalanı gibi önce **alpha** kanalında yayınlanır.

**Sunucu → Zamanlanmış görevler**, işleri bir zaman çizelgesine göre çalıştırır ve **Sunucu
Görevlerini Yönet** izniyle korunur: her gece bir yeniden başlatma, hafta sonundan önce bir yedek,
saat başı bir `save-all`.

Bir zamanlanmış görev; bir **cron ifadesi**, bir **saat dilimi** ve bir **görev listesi** demektir.

| | |
| --- | --- |
| Ne zaman çalışır | Beş alanlı cron — dakika, saat, ayın günü, ay, haftanın günü. Hazır ayarlar tek tıktır (**Her gün 04:00** `0 4 * * *`, **6 saatte bir** `0 */6 * * *`, **Pazar 05:00** `0 5 * * 0`); gerisi elle yazılır. Form, siz yazarken ifadenin ne anlama geldiğini sözcüklerle ve **sonraki beş çalışmayı** gösterir; böylece yanlış bir ifade kaydedilmeden önce görünür. |
| Saat dilimi | İfadenin hangi dilimde okunacağı; varsayılan olarak tarayıcınızınki gelir. `Europe/Istanbul` diliminde `0 4 * * *`, sunucunun saati ne derse desin oradaki sabahın dördü demektir. |
| Oyuncuları uyar | Bir durdurma ya da yeniden başlatmadan kaç dakika önce uyarılacakları. Oyunculara önce o dakikada, sonra 5. dakikada, sonra 1. dakikada haber verilir. Varsayılan **5**; sıfır uyarıyı kapatır. |
| Görevler | Yukarıdan aşağıya, birbiri ardına çalışır. |

| Görev | |
| --- | --- |
| **Güç** | **Yeniden başlat** ya da **Durdur**. (Bir sunucuyu zamanlayıcıyla başlatmak bilerek sunulmuyor — her zaman çalışması gereken bir sunucu için **Pano ile başlat** var.) |
| **Komut** | Bir konsol komutu; tıpkı konsola yazılmış gibi. |
| **Yedek** | Bir yedek; isterseniz adlandırılmış, isterseniz kendi "son N tanesini sakla" sayısıyla. |

**Bunları kimin çalıştırdığı**, sunucuya neyin bağlı olduğuna göre değişir. Varsa **düğüm**
çalıştırır: Pano, görevler her değiştiğinde ve düğüm her yeniden bağlandığında onları düğüme
gönderir; böylece Pano güncellenirken bile çalışmayı sürdürürler. Düğüm yoksa, bu işi yapabilecek
kadar yeni bir **Pano eklentisi** devralır — yedek görevleri dâhil, çünkü o eklenti kendi sunucusunun
yedeğini alabilir. İkisi de yoksa görevleri Pano'nun kendisi çalıştırır; bu da komutları ve
durdurma/yeniden başlatmayı kapsar ama **yedekleri kapsamaz**: Pano'nun kendi çalıştırmadığı bir
sunucuda dosya sistemi yoktur.

Her zamanlanmış görev silinmeden kapatılabilir; **Şimdi çalıştır** ise uyarı geri sayımını atlayarak
görevi hemen çalıştırır. Liste, bir sonraki çalışmayı ve sonuncusunun nasıl bittiğini gösterir.

## Uyarılar

> ⚠️ Uyarılar da bu sayfanın geri kalanı gibi önce **alpha** kanalında yayınlanır.

Pano zaten ölçtüğü şeyleri izler ve biri ters gittiğinde bunu söyler; böylece kimsenin Düğümler
sayfasını açık tutması gerekmez.

| Uyarı | Ne zaman tetiklenir | Tekrarı için bekleme süresi |
| --- | --- | --- |
| **Sunucu çöktü** | Bir sunucunun süreci, kimse istemeden sonlandı. | 5 dakika |
| **Düğüm çevrimdışı** | Bir düğüm yanıt vermeyi bıraktı. | 15 dakika |
| **Yedek başarısız** | Bir yedek tamamlanmadı. | 30 dakika |
| **Disk neredeyse dolu** | Bir düğümün diski **%90**'dan fazla dolu. | 6 saat |
| **Düşük TPS** | Bir sunucu üst üste beş ölçüm boyunca **15 TPS**'nin altında kaldı — tek bir ani düşüş sayılmaz. | 30 dakika |
| **Görev başarısız** | Zamanlanmış bir çalışma hatayla bitti. | 30 dakika |
| **Eklenti güncellemeleri** | Yönetilen bir sunucu, geliştiricilerinin daha yeni bir derlemesini yayımladığı eklenti ya da modlar çalıştırıyor. | 24 saat |

Bu bekleme süresi, sürekli kopup bağlanan bir düğümün ya da bütün öğleden sonra zorlanan bir
sunucunun yüz değil tek bir uyarı üretmesinin nedenidir. Durum düzelince bekleme de sıfırlanır:
yeniden bağlanan bir düğüm, bir sonraki kopmasını hemen bildirebilir. Pano'yu yeniden başlatmak ise
sıfırlamaz: Pano bir uyarıyı çıkarmadan önce aynısını en son ne zaman çıkardığına bakar; böylece
akşam yapılan bir yeniden başlatma, sabahki eklenti güncelleme uyarısını tekrarlamaz.

**Eklenti güncellemeleri**, buradaki türler arasında bir şeyin bozulmasıyla ilgili olmayan tek
türdür ve bekleme süresi de bunu söyler. Günde bir kez — önce Pano açıldıktan çeyrek saat sonra,
sonra her yirmi dört saatte bir — Pano, [izlenen eklentisi](#eklentileri-guncel-tutma) olan ve
**Otomatik güncelleme denetimi** açık olan her yönetilen sunucuyu teker teker dolaşır ve daha yeni bir derlemesi olanları adlarıyla anan tek bir
uyarı çıkarır. Sunucu başına günde bir kez söyleyebilir; daha sıkı bir aralık bülten olurdu.

Her uyarı, sunucuları yönetebilen herkes için bir **panel bildirimi** olur; üzerine tıklamak neyle
ilgiliyse onu açar — bir çökme, başarısız bir yedek, düşük TPS ya da başarısız bir görev için
sunucuyu; eklenti güncellemeleri için o sunucunun
[eklentiler sayfasını](#eklentiler-ve-modlar); çevrimdışı olan ya da diski dolan bir düğüm için
Düğümler sayfasını.

**Ayarlar → Platform → Sunucu uyarıları**, anahtar ızgarasıdır: her tür kapatılabilir ve her tür
ayrıca yöneticilere **e-posta** ile gönderilebilir. Varsayılan olarak her tür bildirim gönderir,
hiçbiri e-posta göndermez. E-posta sütunu, çalışan bir e-posta yapılandırması ve sunucu uyarısı
e-posta şablonu gerektirir; bunlardan biri eksikse anahtarlar nedeniyle birlikte pasifleştirilir ve
panel içi bildirimler çalışmaya devam eder.

## İzinler

Sunucu yönetiminin kendi izin node'ları vardır; Pano'daki diğer izinler gibi
**Panel → İzinler** bölümünden verilirler.

| İzin | Node | Neye izin verir |
| --- | --- | --- |
| Sunucuları Yönet | `pano.panel.manage.servers` | Şemsiye izin: sunucu çalışma alanını ve sunucu seçiciyi görme, sunucu bağlama, kabul etme ve kaldırma, genel bakışı, ölçümleri ve ayarları okuma. |
| Sunucu Konsolunu Yönet | `pano.panel.manage.server.console` | Konsolu okuma ve komut gönderme. |
| Sunucu Gücünü Yönet | `pano.panel.manage.server.power` | Bir sunucuyu başlatma, durdurma, yeniden başlatma ve sonlandırma. |
| Sunucu Oyuncularını Yönet | `pano.panel.manage.server.players` | Oyuncu listesi ve oyuncu işlemleri. |
| Sunucu Eklentilerini Yönet | `pano.panel.manage.server.plugins` | Eklenti listesi, açma/kapatma düğmesi ve eklentilerle modları [kurma ya da kaldırma](#eklentiler-ve-modlar). |
| Sunucu Dosyalarını Yönet | `pano.panel.manage.server.files` | [Dosya yöneticisi](#dosyalar). Bir düğüm ya da dosya sunan bir Pano eklentisi gerektirir. |
| Sunucu Yedeklerini Yönet | `pano.panel.manage.server.backups` | [Yedekler](#yedekler), geri yüklemeler ve saklama ayarı. Bir düğüm ya da yedek alabilen bir Pano eklentisi gerektirir. |
| Sunucu Görevlerini Yönet | `pano.panel.manage.server.schedules` | [Zamanlanmış görevler](#zamanlanmıs-gorevler). Yedek görevleri, yedek alabilen bir taraf gerektirir. |
| Sunucu Başlatmasını Yönet | `pano.panel.manage.server.startup` | RAM, JVM bayrakları, Java sürümü, port. Yalnızca [yönetilen sunucular](#yonetilen-sunucular). |
| Sunucu Oluştur | `pano.panel.create.servers` | Bir düğüm üzerinde sunucu [oluşturma](#sunucu-olusturma) ve yeniden kurma. |
| Düğümleri Yönet | `pano.panel.manage.nodes` | [Düğüm](#dugumler) ekleme, ayarlama ve kaldırma. |

Bir izin node'una, node'un kendisinin üstüne iki şey daha iliştirilebilir: **hangi sunucular** için
geçerli olduğu ve — konsol için — **hangi komutları gönderemeyeceği**. İkisi de node'un bulunduğu
yerde, **Panel → İzinler** bölümünde düzenlenir.

### Bir izni tek bir sunucuya daraltma

Her `pano.panel.manage.server.*` node'u **genel** olarak ya da **yalnızca belirli sunucular** için
verilebilir. Şu bağlam (context) ile verilen bir node

```jsonc
"server": 3
```

yalnızca `3` numaralı sunucu için geçerlidir; liste verilirse — `"server": [3, 7]` — o iki sunucu için
geçerli olur. Daraltılmış bir node, genel bir kontrolü asla karşılamaz; yani konsol node'u yalnızca
`3` numaralı sunucuya daraltılmış biri, sadece o sunucunun konsolunu açabilir.

Bunu, bir yapı ekibine ağın geri kalanını vermeden tek bir sunucunun konsolunu emanet etmek için
kullanın.

Panelde bunu elle yazmanız gerekmez: bir `pano.panel.manage.server.*` node'unu düzenlediğinizde her
sunucu için bir onay kutusu bulunan bir **Hangi sunucular** listesi çıkar. Hiçbirini
işaretlemezseniz node **tüm** sunucular için geçerli olur — sonradan eklediğiniz sunucular dahil;
bazılarını işaretlerseniz yalnızca onlar için geçerli olur. İzin listesi de node'un altında *tüm
sunucular*, *1 sunucu* ya da *N sunucu* yazar.

> Pano'nun okuyamadığı bir bağlam (bozuk bir değer, id yerine bir ad) **hiçbir şeyle** eşleşmez; yani
> yazım hatası bir kapıyı açmaz, kapatır.

### Tek tek komutları yasaklama

Konsol erişimi, yetkili erişimidir — ama bazen *neredeyse* yetkili erişimi olmalıdır. Bir konsol
node'u (`pano.panel.manage.server.console` ya da şemsiye `pano.panel.manage.servers`), asla
gönderemeyeceği komutların listesini taşıyabilir:

```jsonc
"denyCommands": ["op", "deop", "stop", "whitelist*"]
```

Düzenleyici bunları, her desen için bir tane olmak üzere etiket hâlinde alır. Yazılanın yalnızca
**ilk sözcüğü** karşılaştırılır, karşılaştırma büyük/küçük harf ayırmaz ve `*` ile biten bir desen
onunla başlayan her şeyi kapsar — `world*` hem `worldedit`'i hem `worldborder`'ı engeller. Eşleşen
bir komut, Pano'dan çıkmadan reddedilir ve gönderen kişiye onu hangi desenin durdurduğu söylenir.

Liste node'un üzerinde durduğu için bir moderatör, bir sunucunun konsoluna `stop` olmadan sahip
olabilirken bir yönetici her yerde her şeye sahip olmayı sürdürür. **Yöneticiler asla engellenmez**:
`*` iznine sahip bir hesap süzgeçten geçirilmez; çünkü sahibinin kendi grubunu düzenleyerek
kaldırabileceği bir kısıtlama, güvenlik değil tiyatrodur.

### Etkinlik

Her sunucunun ayarları altında bir **Etkinlik** sekmesi vardır ve genel bakışı son beş kaydı
gösterir. Burası, Pano'nun etkinlik günlüğünün yalnızca o sunucuya süzülmüş hâlidir, en yeniden
eskiye: gönderilen komutlar ve kimin gönderdiği, güç işlemleri, oyuncu işlemleri, eklenti
kurulumları, kaldırmaları ve açma/kapatmaları, dosya değişiklikleri, yedekler, görev çalışmaları ve
çökmeler. Kayıtlar türe göre süzülebilir ve sayfa sayfa daha geriye doğru okunabilir.

Okumak için, **Panel → Günlükler** altındaki tam günlükte olduğu gibi **Etkinlik Günlüklerine Eriş**
izni gerekir.

### Hız sınırları

Sunucu işlemleri kullanıcı ve sunucu başına sınırlandırılmıştır; böylece takılıp kalmış bir betik ya
da sabırsız bir yönetici ne bir oyun sunucusunu boğabilir ne de bir diski doldurabilir:

| İşlem | Sınır |
| --- | --- |
| Konsol komutları | 10 saniyede 10 |
| Güç işlemleri | Dakikada 6 |
| Dosya yazma | Dakikada 60 |
| Yüklemeler | Dakikada 10 |
| Yedekler | 10 dakikada 3 |
| Eklenti kurulumları | 10 dakikada 10 |

Sınırı aşmanın karşılığı bir "yavaşlayın" iletisidir ve hiçbir şey sıraya alınmaz — denetim biraz
sonra kendiliğinden geri gelir.

## Web sitesi olmadan oturum açma

> ⚠️ Panelin kendi giriş sayfası da bu sayfanın geri kalanı gibi önce **alpha** kanalında yayınlanır.

Pano, hiç herkese açık bir site olmadan yalnızca bir sunucu yöneticisi olarak da çalıştırılabilir —
bu, kurulum sihirbazında ya da sonradan **Ayarlar → Platform → Tercihler** altında seçilen
**Sunucular** kullanım modudur ([`usage-mode` anahtarı](../configuration/#genel-ayarlar) olarak
saklanır).

Bu modda panelin **`/panel/login`** adresinde kendine ait bir giriş sayfası vardır; yani üzerinden
giriş yapılacak bir temaya gerek kalmaz:

- Kullanıcı adı ya da e-posta, parola ve bir dahaki sefere kullanıcı adınızı dolduran **Beni
  hatırla**.
- **İki adımlı doğrulama** sitedeki gibi çalışır: [Auth Guard](../../plugins/auth-guard/) eklentisi
  bir kod istediğinde sayfa da onu ikinci adım olarak sorar.
- **Parolanızı mı unuttunuz?**, bağlantı verilecek bir site varsa temanın sıfırlama sayfasına gider.
  Sunucular modunda böyle bir site yoktur; bu yüzden sayfa onun yerine destek adresinizi gösterir ya
  da başka bir yöneticiye sormanızı söyler — 404'e düşen bir sıfırlama bağlantısı kimseye yaramaz.
- Oturumunuz kapalıyken herhangi bir panel adresini açmak sizi buraya getirir, sonra da gitmek
  istediğiniz yere geri götürür. **`/panel/logout`** oturumu sonlandırır.

Sunucular modunda Pano ayrıca **tema sürecini hiç başlatmaz** — bir Node süreci ve onun belleği eksik
— ve eski herkese açık adresler (`/`, `/login`, `/reset-password`, etkinleştirme sayfaları) panele
yönlendirilir; böylece eski bir yer imi yine işe yarar bir yere varır. Kullanım modunu panelden
değiştirmek, yeniden başlatmaya gerek kalmadan temayı başlatır ya da durdurur.

## Eklenti yapılandırması

Konsol yakalamanın ana anahtarı, oyun sunucusundaki Pano MC Eklentisi'nin kendi `config.conf`
dosyasındadır:

```jsonc
console {
  enabled = true
}
```

- `enabled = true` (varsayılan) — eklenti günlük yakalayıcısını kurar ve Pano'nun akış isteklerini
  yanıtlar.
- `enabled = false` — yakalayıcı hiç kurulmaz ve akış istekleri yok sayılır; o sunucu için konsol
  sayfası boş kalır. Geri kalan her şey çalışmaya devam eder: sunucu bağlı kalır, ölçümler, oyuncu
  listesi, eklenti listesi ve güç etkilenmez, panelden gönderilen bir komut da yine çalışır — sadece
  çıktısını görmezsiniz.

Bu blok, sunucu bu özelliğe sahip yeni bir eklentiyle ilk kez başladığında otomatik eklenir (eklenti
yapılandırma sürümü **6**); elle oluşturmanız gerekmez. Değeri değiştirdikten sonra Minecraft
sunucusunu yeniden başlatın.

Bağlı bir sunucu için Pano tarafında yapılandırılacak bir şey yok. Sunucu yönetiminin Pano'nun kendi
`config.conf` dosyasına eklediği şey üç bloktur; üçü de isteğe bağlıdır ve üçü de
[Yapılandırma Rehberi](../configuration/)'nde anlatılır:

| Blok | |
| --- | --- |
| [`local-node`](../configuration/#yerel-dugum-local-node) | Pano'nun kendi makinesinde çalıştırdığı arka plan süreci. |
| [`managed-servers`](../configuration/#yonetilen-sunucular-managed-servers) | Her yönetilen sunucuya giren Pano eklentisi jar'ının nereden geldiği. |
| [`plugin-sources`](../configuration/#eklenti-kaynakları-plugin-sources) | Varsa CurseForge API anahtarınız. |

## Güvenlik ve denetim

- **Konsol çıktısı güvenilmeyen metindir.** Bir oyuncunun yazdığı her şey günlüğe düşebilir; bu yüzden
  Pano her satırı düz metin olarak gösterir — asla HTML olarak değil — ve oyun sunucusu göndermeden
  önce terminal renk kodlarını temizler.
- **Komutlar veridir, kabuk değildir.** Komut, sunucunun kendi konsol göndericisine iletilir; makinede
  hiçbir kabuğa dokunmaz ve Pano oyuncu işlemi komutlarını panelden gelen girdiyi geçirerek değil,
  kendisi kurar.
- **Her şey günlüğe yazılır.** Gönderilen her komut, her güç işlemi, her oyuncu işlemi ve her eklenti
  açma/kapatma işlemi, bunu yapan kullanıcıyla birlikte panel etkinlik günlüğüne yazılır.
  **Etkinlik Günlüklerine Eriş** izniyle **Panel → Günlükler** bölümünden okuyabilirsiniz.
- **Konsol erişimi, yetkili erişimidir.** Bir Minecraft sunucusuna komut gönderebilen biri, bir
  yetkilinin (OP) yapabildiği her şeyi yapabilir. `pano.panel.manage.server.console` iznini, oyun
  içinde OP vermek kadar dikkatli dağıtın ve mantıklı olan yerlerde sunucu bazında daraltın.

## Yardım gerekiyor mu?

- [SSS sayfasına](../FAQ/) göz atın
- [Discord topluluğumuzda](https://discord.gg/6vVy72wgXT) sorun
- [GitHub](https://github.com/PanoMC/Pano/issues) üzerinden bir issue açın
