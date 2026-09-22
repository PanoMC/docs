# pano-node Arka Plan Süreci

`pano-node`, bir makinede **yönetilen** Minecraft sunucularını kuran ve gözeten küçük arka plan
sürecidir. Bir makineyi [düğüme](../#dugumler) dönüştüren şey odur: Pano ona neyi kuracağını, bir
sunucuyu ne zaman başlatıp durduracağını ve `server.properties` dosyasına ne yazacağını söyler; o da
durumu, konsol çıktısını ve ölçümleri geri bildirir.

> ⚠️ Arka plan süreci önce **alpha** kanalında, ait olduğu Pano sürümüyle birlikte yayınlanır.
> Ardından alışıldık sırayla `beta` ve kararlı sürüme iner; yani kararlı bir kurulumda henüz
> bulunmayabilir.

Her zaman **ayrı bir süreçtir**, asla Pano'nun kendi JVM'inin parçası değildir. Zaten amaç budur:
Pano'yu güncellemek ya da yeniden başlatmak, onun yönettiği Minecraft sunucularını çevrimdışı
bırakmamalıdır. Pano'nun kendisinin çalıştığı makinede arka plan sürecini Pano indirir, başlatır ve
çalışır tutar — bkz. [yerel düğüm](../#yerel-dugum). Bu sayfadaki her şey, süreci kendiniz
çalıştırdığınız durumlar içindir: ikinci bir makine, bir konteyner ya da sürecin makineyle birlikte
başlamasını istediğiniz bir sunucu — ve tek bir sunucunun klasörünün içinden başlatılan aynı jar olan
[Pano Agent](#the-pano-agent).

## Nereden alınır

**Kendi Pano'nuzdan** — tercih edilmesi gereken kaynak budur. Çalışan bir Pano, kendisiyle birlikte
yayınlanan arka plan sürecini olduğu gibi sunar; yani aldığınız jar, yapısı gereği o Pano'nun
protokolünü konuştuğu jar'dır ve bunun için kendi ağınızın dışında hiçbir yerin erişilebilir olması
gerekmez:

```bash
curl -fsSL https://panel.example.com/api/node/pano-node.jar -o pano-node.jar
curl -fsSL https://panel.example.com/api/node/pano-node.jar.sha256 | sha256sum -c -
```

İki adres de herkese açıktır ve kimlik doğrulaması istemez: jar bir sır değil, yayınlanmış bir
üründür ve tek başına hiçbir yetki vermez — onu indiren makinenin Pano ile konuşabilmesi için yine de
eşleşmesi gerekir. Sağlama `sha256sum` biçiminde sunulur, yani tam olarak yukarıdaki gibi
doğrulanabilir. [Kurulum betiği](../#uzak-dugumler) de jar'ı buradan alır. Diskinde arka plan süreci
jar'ı bulunmayan bir Pano ikisine de **404** yanıtı verir; betik o durumda aşağıdaki GitHub sürümüne
geri düşer.

**GitHub sürümünden** — diğer seçenek. `pano-node.jar`, her Pano sürümüyle birlikte platform jar'ının
yanında ve doğrulayabilmeniz için bir `pano-node.jar.sha256` ile yayınlanır. **Pano'nuzun çalıştırdığı
sürümdeki jar'ı kullanın**: arka plan süreci ile platform birlikte yayınlanır, böylece aralarındaki
protokol her zaman uyuşur.

Kendisi için **Java 17 veya daha yeni** bir çalışma zamanı ister. Bu, hâlâ Java 11+ ile çalışan
Pano'dan daha katıdır; arka plan sürecine Java 11 verirseniz her başlatmada
`UnsupportedClassVersionError` ile ölür. *Oyun sunucularının* hangi Java ile çalışacağı ayrı bir
konudur — bkz. [Java sürümü seçimi](../#java-surumu-secimi).

**`git` gerekmez.** Bir [Spigot](../#spigot-dugumde-derlenir) sunucusu burada, `git` çalıştıran
BuildTools ile derlenir; `PATH` üzerinde bir git varsa o kullanılır, yoksa düğüm yalnızca o derleme
için taşınabilir bir git indirir — bkz. [BuildTools için git](#git-for-buildtools). Arka plan
sürecinin yaptığı başka hiçbir iş git'e dokunmaz.

Bunu makine başına yalnızca bir kez yaparsınız. Zaten kurulu olan bir düğüm bunun yerine panelden
güncellenir — bkz. [Arka plan sürecini güncelleme](#arka-plan-surecini-guncelleme).

## Çalıştırma

```bash
# Bir Pano ile eşleştirin. Kod, Panel -> Sunucular -> Düğümler -> Düğüm ekle -> Elle
# ekranından gelir ve her 30 saniyede bir yenilenir.
java -jar pano-node.jar --pano https://panel.example.com --code 123456 --data ./node-data

# İlk seferden sonraki her başlatma: eşleştirme <veri-klasörü>/config.conf içindedir.
java -jar pano-node.jar --data ./node-data

# Bu makine için bir servis dosyası yaz ve çık.
java -jar pano-node.jar --data ./node-data --service install
```

Eşleştirme bir kez olur. Sonrasında düğümün kendi anahtarı vardır; Pano ya da ağ kaybolduğunda
aralığı açarak kendi kendine yeniden bağlanır.

### Parametreler

| Parametre | |
| --- | --- |
| `--pano <adres>` | Bu düğümün ait olduğu Pano'nun temel adresi, örneğin `https://panel.example.com`. `--platform` da olur. |
| `--code <kod>` | Panelden alınan altı haneli eşleştirme kodu. `--pair`, `--pairing-code` de olur. |
| `--bootstrap-token <anahtar>` | Pano kendi makinesinde bir düğüm başlatırken ürettiği tek kullanımlık anahtar. Elle yazılacak bir şey değildir. |
| `--data <klasör>` | Veri klasörü. Varsayılan `./node-data`, mutlak yola çevrilir. |
| `--name <ad>` | Bu düğümün panelde görünen adı. |
| `--runtime <PROCESS\|DOCKER>` | Sunucuların nasıl çalıştırılacağı: her biri düz bir süreç olarak (varsayılan) ya da her biri kendi Docker konteynerinde. Bkz. [Sunucuları konteynerlerde çalıştırma](#sunucuları-konteynerlerde-calıstırma). |
| `--port-range <başlangıç-bitiş>` | Bu düğümün sunucularının kullanabileceği portlar, örneğin `25660-25669` (varsayılan `25565-25600`; tek port `25565-25565` diye yazılır). `config.conf` içindeki `node.port-range` ayarına yazılır, sonraki açılışlar da onu korur; Pano'ya da bildirilir ve Pano bu düğümdeki yeni sunuculara portu bu aralığın içinden verir. 1–65535 arasında, sırası doğru iki port dışındaki her değer açılışta reddedilir. Bir konteynerde dışarı açılan portlarla aynı olmalıdır. |
| `--service install` | Bu makine için bir servis dosyası yaz ve çık. |
| `--service uninstall` | O dosyayı sil ve çık. |
| `--help`, `-h` | Kullanım metnini yazdır. |

### Ortam değişkenleri

Her parametrenin bir ortam değişkeni karşılığı vardır; çünkü bir konteyner tüm yapılandırmasını
ortamdan alır ve imajı yeniden kurmadan ona komut satırı verilemez. **Parametre, karşılığı olan
değişkene üstün gelir.**

| Değişken | Karşılığı |
| --- | --- |
| `PANO_URL` | `--pano` |
| `PANO_PAIR_CODE` | `--code` |
| `PANO_BOOTSTRAP_TOKEN` | `--bootstrap-token` |
| `PANO_NODE_DATA` | `--data` |
| `PANO_NODE_NAME` | `--name` |
| `PANO_NODE_RUNTIME` | `--runtime` |
| `PANO_NODE_PORT_RANGE` | `--port-range` (`başlangıç-bitiş`, örn. `25660-25669`; boş bırakılırsa ayarlanmamış sayılır) |
| `PANO_NODE_JAVA_AUTO_DOWNLOAD` | `config.conf` içindeki `node.java-auto-download` (`true` / `false`) |
| `PANO_NODE_TOOL_AUTO_DOWNLOAD` | `config.conf` içindeki `node.tool-auto-download` (`true` / `false`) |

## Pano Agent {#the-pano-agent}

Pano Agent, zaten çalıştırdığınız bir sunucuyu Pano'ya **olduğu yerde** bağlar. Bu sayfadaki arka plan
sürecinin ta kendisidir, yalnızca ikinci bir adla — `pano-agent.jar` — sunulur: onu **sunucunun
klasörüne koyar ve sunucu jar'ı yerine başlatırsınız**. Sunucuyu kendine ait bir süreç olarak
başlatır, sunucunun konsolunu terminalde sanki sunucu jar'ını kendiniz başlatmışsınız gibi gösterir ve
gerisini Pano'ya bırakır: güç düğmeleri, konsol, dosyalar, yedekler ve zamanlamalar, hepsi sunucunun
zaten bulunduğu klasörden çalışır. Hiçbir şey kopyalanmaz ya da taşınmaz; agent panelde hiçbir zaman
düğüm olarak görünmez — yalnızca sunucu görünür.

Her düğüm gibi **Java 17 veya daha yenisini** ister. Sunucunun kendisi ise Minecraft sürümünün
gerektirdiği Java ile çalışmaya devam eder — bkz. [Java çalışma zamanları](#java-runtimes).

### Bir sunucuyu bağlama

**Panel → Sunucular → Sunucu ekle → Pano Agent ile bağla** üç kısa adım gösterir: `pano-agent.jar`
için bir **İndir** düğmesi, onu çalıştıran komut — Pano'nuzun adresi ve bir eşleştirme kodu zaten
içindedir — ve sunucu göründüğünde **Sunucuyu aç** düğmesine dönüşen bir bekleme göstergesi. O
makinedeki bir kabuktan:

```bash
cd /home/mc/survival        # sunucunun klasörü

# 1. Agent'ı içine koyun: penceredeki İndir düğmesi, FTP, bir dosya yöneticisi ya da
curl -fLo pano-agent.jar 'https://panel.example.com/api/node/pano-agent.jar'

# 2. Sunucuyu durdurun, sonra agent'ı penceredeki komutla bir kez çalıştırın.
java -jar pano-agent.jar --pano 'https://panel.example.com' --code k7m2x9qa4tj3n8wp

# 3. Bundan sonraki her başlatma.
java -jar pano-agent.jar
```

Windows'ta 1. adım `Invoke-WebRequest -Uri '<aynı adres>' -OutFile pano-agent.jar` olur; gerisi
aynıdır.

- **`pano-agent.jar`, arka plan sürecinin başka bir adla sunulan jar'ıdır.** `/api/node/pano-agent.jar`,
  `/api/node/pano-node.jar` ile aynı baytları yanında bir `.sha256` ile sunar ve —
  [arka plan süreci](#nereden-alınır) gibi — oturum açmayı gerektirmez. Önemli olan addır: adı
  `pano-agent` ile başlayan bir jar agent olarak çalışır.
- **Kod** 16 karakterlik rastgele bir anahtardır (elle yazılmaz, yapıştırılır; bu yüzden kimsenin
  tahmin edemeyeceği kadar uzun olabilir), **1 dakika** geçerlidir ve **bir kez** kullanılır. Pencere
  her dakika yeni bir kod gösterir; yani içindeki komut her zaman geçerli bir kod taşır: onu
  çalıştırmadan hemen önce kopyalayın. Bu kodla eşleşen bir agent anında kabul edilir; onaylanacak bir
  şey yoktur. Kodun süresi agent onu kullanmadan dolarsa agent bunu söyler ve geçerli kodu ister.
- **İlk çalıştırma** eşleşir, sunucunun nasıl başlatıldığını sorar ([aşağıda](#agent-first-run)) ve
  sunucuyu olduğu yerde bağlar. Pano, sunucusu hâlâ çalışan bir klasörü reddeder, çünkü aynı dünya
  üzerinde çalışan iki süreç onu bozar; sunucunun önce durdurulması gerekmesinin nedeni budur.
  Bağlandıktan sonra agent sunucuyu hemen başlatır, bundan sonra `java -jar pano-agent.jar` ile
  başlatmanızı söyler ve onu servise çeviren komutu yazar; paneldeki pencerede de **Sunucuyu aç**
  düğmesi belirir.

### İlk çalıştırma {#agent-first-run}

Eşleşene kadar agent, eksik olanı her satırda bir soru olarak sorar. **Enter, `[köşeli parantez]`
içindeki değeri korur.** Arkasına hiçbir şey eklenmeden çalıştırılan `java -jar pano-agent.jar` her
şeyi sorar (agent'ın soruları İngilizcedir):

```text
$ java -jar pano-agent.jar
Pano Agent — linking /home/mc/survival to Pano. Press Enter to keep a [default].
Found start.sh — using its settings as defaults.
Pano address (your website, e.g. https://example.com): https://panel.example.com
Server jar [paper.jar]:
Memory for the server [4G]:
Extra Java arguments [-XX:+UseG1GC -XX:+ParallelRefProcEnabled]:

  Pano address:    https://panel.example.com
  Server folder:   /home/mc/survival
  Server jar:      paper.jar
  Memory:          4G
  Java arguments:  -XX:+UseG1GC -XX:+ParallelRefProcEnabled

Link this folder to Pano? [Y/n]
Pairing code (Pano panel → Add Server → Link with the Pano Agent): k7m2x9qa4tj3n8wp
```

Eşleştirme kodu en son, agent eşleşmeden hemen önce sorulur; böylece yalnızca bir dakika geçerli
olan kod hâlâ tazedir. Penceredeki komut adresi ve kodu `--pano` ve `--code` ile yanıtlar; bu yüzden
terminalde yalnızca sunucunun nasıl başlatılacağı sorulur.

- **Pano address** (Pano adresi): sitenizin tarayıcıdaki adresi. Yazılmazsa `https://` eklenir,
  sondaki `/panel` atılır. Agent orada bir Pano'nun yanıt verdiğini denetler; yanıt vermiyorsa
  nedenini söyler — ulaşılamıyor, Pano değil ya da agent'lar için fazla eski bir Pano — ve yeniden
  sorar.
- **Server jar** (sunucu jar'ı): klasördeki jar'lar, agent'ın kendisi hiçbir zaman değil. Birden
  fazlaysa numaralı olarak listelenir; numarayla ya da adıyla yanıt verin.
- **Memory for the server** (sunucunun belleği): `4G`, `4096M` ya da yalnızca `4096` (megabayt); en
  az 512 MB.
- **Extra Java arguments** (ek Java parametreleri): komut satırındaki gibi, tırnaklarıyla birlikte
  yazılır; `-` varsayılanı temizler. Belleğin ve jar'ın kendi soruları olduğu için `-Xms`, `-Xmx` ve
  `-jar` bir notla birlikte çıkarılır.
- **Link this folder to Pano?** (bu klasör Pano'ya bağlansın mı?) Enter bağlar. `n`, yanıtlarınızı
  varsayılan yaparak soruları baştan sorar. Herhangi bir soruda `q` ya da Ctrl+D, hiçbir şey yazmadan
  çıkar.
- **Pairing code** (eşleştirme kodu): penceredeki komutta `--code`'dan sonraki kısım; pencere her
  dakika yeni bir kod gösterir. Pano kodu kabul etmezse — daha önce kullanılmışsa ya da süresi
  dolmuşsa — agent bunu söyler ve kapanmak yerine geçerli kodu ister.

**Başlatma betiğinden varsayılanlar.** Agent sormadan önce klasörde `start.sh`, `run.sh`,
`start.command`, `start.bat`, `run.bat` ya da `start.cmd` arar ve `java … -jar` çalıştıran ilk
satırı okur: o satırın jar'ı, `-Xmx` değeri ve diğer Java bayrakları varsayılan olur, agent da
`Found start.sh — using its settings as defaults.` yazar. Çalışan bir betiği olan bir klasör çoğu
zaman yalnızca Enter'a basılarak bağlanır. Anlamlandıramadığı bir satırı yok sayar. Belleğin
varsayılanı sırasıyla agent'ın kendisine verilen bir `-Xmx` (`java -Xmx4G -jar pano-agent.jar`),
betikteki değer ya da 2G'dir.

**Sonradan değiştirmek.** Yanıtlar kayıt olarak `.pano-agent/launch.json` dosyasında tutulur ve
yalnızca bir kez, sunucu bağlanırken kullanılır. Bundan sonra sunucunun belleği ve Java parametreleri
Pano'ya aittir: onları o dosyada değil, sunucunun [Başlangıç ayarları](../#baslangıc-ayarları)
içinde değiştirin.

#### Terminal olmadan {#agent-without-a-terminal}

- **Pterodactyl gibi hosting panelleri** web konsollarını agent'a iletir. Sunucu jar'ını
  `pano-agent.jar` yapıp sunucuyu başlatın: sorular konsolda satır satır görünür, her yanıtı konsolun
  komut kutusuna yazarsınız.
- **Tek satırlık biçim** — penceredeki komut,
  `java -jar pano-agent.jar --pano '<adres>' --code <kod>` — adres ve kod için yanıt gerektirmez,
  diğer soruları da yalnızca gerçek bir terminalde sorar. Başka her yerde, örneğin bir betikte ya da
  bir panelin başlangıç komutunda, varsayılanlarla bağlar: bulduğu jar, başlatma betiğinin ayarları,
  betik yoksa 2G. Komutu değil de ortam değişkenlerini ayarlamanıza izin veren bir panel için
  `PANO_URL` ve `PANO_PAIR_CODE` bu iki bayrak gibi çalışır.
- **Hiç soru sorulmaması**: `--no-input` ya da `PANO_AGENT_NO_INPUT=true` soruları kapatır; kapalı
  bir girdi de — bir servis ya da `< /dev/null` — aynısını yapar. Adres ve kod verilmişse agent
  varsayılanlarla bağlar; verilmemişse nasıl bağlanacağını yazar. Her iki durumda da eşleşemeyen bir
  çalıştırma **77** koduyla çıkar; yazdığı servis dosyası onu bu durumda yeniden başlatmaz.
- **Eşleştikten sonra hiç soru sormaz**: `java -jar pano-agent.jar` doğrudan sunucuyu başlatır.

### Bundan sonra başlatma

`java -jar pano-agent.jar`, sunucu jar'ının daha önce başlatıldığı her yere gider ve sunucuyu da
onunla birlikte başlatır — sunucunun [Başlangıç ayarları](../#baslangıc-ayarları) içinde *Pano ile
başlat* kapalı değilse.

- **Bir başlatma betiği** (`start.sh`, `start.bat`): sunucu jar'ının yerine `pano-agent.jar` yazın.
  İlk çalıştırmada o satırdaki bir `-Xmx`, sunucunun belleği olarak önerilir; sonrasında oradaki
  seçenekler oyun için değil, agent içindir: sunucunun belleği ve JVM parametreleri Pano'da, sunucunun
  **Başlangıç ayarları** içinde belirlenir.
- **screen ya da tmux**: eskisi gibi `screen -S survival java -jar pano-agent.jar`. Konsolu görmek ve
  komut yazmak için ona bağlanın.
- **Bir servis**: klasörde `java -jar pano-agent.jar --service install` çalıştırın. O klasör için bir
  servis dosyası yazar — adı `pano-agent-` ile klasörün yolundan üretilen kısa bir kimlikten oluşur,
  böylece aynı makinedeki birkaç sunucu çakışmaz — ve bu dosya agent'ı orada, geçerli kullanıcıyla
  çalıştırır ve bir hatadan sonra yeniden başlatır. [Bir düğümde](#servis-dosyaları) olduğu gibi dosya
  yalnızca yazılır; onu etkinleştiren komut, sizin çalıştırmanız için ekrana yazdırılır.
- **Bir hosting paneli**: sunucunun başlatıldığı jar'ı — çoğu zaman bir *Server Jar File* ayarıdır —
  `pano-agent.jar` yapın. İlk çalıştırma sorularını panelin web konsolunda sorar
  ([terminal olmadan](#agent-without-a-terminal)). Konsol girdi gönderemiyorsa, panel başlatma
  komutunu düzenlemenize izin veriyorsa ona `--pano` ve `--code` ekleyin, ortam değişkeni
  tanımlamanıza izin veriyorsa `PANO_URL` ve `PANO_PAIR_CODE` değişkenlerini ayarlayın. Eşleştikten sonra agent ikisini de yok sayar; yerinde
  kalmaları bir sorun çıkarmaz.

Agent'ın terminaline yazdığınız satırlar, Pano'nun konsoluna yazılan komutlar gibi sunucuya gider ve
onun geçmişinde görünür; sunucu durmuşken agent bunun yerine durduğunu söyler. Agent'ın kendisi
sessizdir: kendi birkaç satırı — eşleştirme, bağlantı, sunucunun bağlanması, bir güncelleme, bir ret
— ile uyarıları ve hataları `[Pano Agent]` önekiyle yazılır; geri kalan her şey
`.pano-agent/agent.log` dosyasına gider.

### stop, Ctrl+C ve Pano'daki Durdur

| Ne yaparsınız | Ne olur |
| --- | --- |
| Agent'ın terminaline `stop` yazarsınız — ya da bir hosting panelinin bunu sizin yerinize yazan **Stop** düğmesine basarsınız | **Yalnızca sunucu durur.** Agent çalışmaya devam eder ve Pano sunucuyu yönetmeyi sürdürür; sunucuyu Pano'dan yeniden başlatın. |
| Pano'da **Durdur**'a basarsınız ya da Pano'nun konsoluna `stop` yazarsınız | Aynısı: sunucu durur, agent bekler. |
| Ctrl+C'ye basarsınız ya da `systemctl stop`, `docker stop` veya bir hosting paneli SIGTERM gönderir | Agent sunucuyu düzgünce durdurur — Pano'nun kullandığı durdurmayla, onun süre sınırıyla — ve ardından kendisi kapanır. |

**İkisini birden yalnızca agent'ın kendisini durdurmak kapatır.** Bu bilinçli bir tercihtir: `stop`
yazmak bir sunucunun Pano ile bağını asla koparmamalıdır.

Bir çökme her düğümde olduğu gibi ele alınır — *Çökünce yeniden başlat* geçerlidir — ve agent her iki
durumda da çalışmaya devam eder.

### Dosyaları nerede durur

```
survival/                  sunucunun klasörü
├── pano-agent.jar
├── server.json            Pano'nun sunucu hakkındaki kaydı
├── .pano-node/            sunucu çalışırken process.json
└── .pano-agent/           agent'ın kendi verisi
    ├── config.conf        eşleştirmesi ve anahtarları
    ├── agent.log          günlüğü
    ├── java/              sunucu için indirdiği Java çalışma zamanları
    ├── backups/           sunucunun yedekleri
    ├── updates/           agent'ın hazırlanmış bir güncellemesi
    └── cache/
```

- `.pano-agent/`, agent için bir düğümün [veri klasörünün](#veri-klasoru) karşılığıdır ve sunucunun
  klasörünün içinde durur: klasörü taşımak agent'ı da onunla birlikte taşır. `server.json` ve
  `.pano-node/`, [her düğümün bir sunucu klasörüne yazdıklarıdır](#bir-sunucu-klasorune-neler-yazar).
- **Panel ona dokunmaz.** Dosya yöneticisi `.pano-agent/` ve `.pano-node/` klasörlerini göremez ve
  değiştiremez, yedekler ikisini de agent'ın jar'ıyla birlikte dışarıda bırakır ve bir geri yükleme
  onların içine asla yazmaz.
- `config.conf` agent'ın anahtarını tutar — ona [bir düğümünkine](#config-conf) davrandığınız gibi
  davranın. **Yeni bir sunucu yapmak için sunucu klasörünü mü kopyalıyorsunuz?** `.pano-agent/`
  klasörünü dışarıda bırakın ve kopyayı kendi koduyla bağlayın: aynı anahtarı paylaşan iki agent,
  Pano'nun gözünde tek bir düğümdür.

### Güncellemeler

Agent kendini her düğüm gibi günceller: Pano'da daha yeni bir sürüm olur olmaz —
[`node-auto-update`](../../configuration/#yonetilen-sunucular-managed-servers) kapalı değilse — aksi
halde **Panel → Ayarlar → Güncellemeler** üzerinden elle.

Başlattığınız şey küçük bir **başlatıcıdır**. Pano ile konuşan kısım onun altında ikinci bir süreç
olarak, sunucu da üçüncü bir süreç olarak çalışır. Bir güncelleme yeni jar'ı indirir ve doğrular,
`pano-agent.jar`'ın üzerine yazar ve yalnızca o ortadaki süreci yeni sürümle yeniden başlatır:
**sunucu çalışmaya devam eder** ve kimsenin bağlantısı kesilmez; başlatıcı — terminaliniz, screen
oturumunuz ya da servisiniz — da kesintiye uğramaz. O ortadaki süreç beklenmedik şekilde durursa
başlatıcı onu kısa bir aradan sonra yeniden başlatır. Windows'ta çalışan jar kilitli olduğundan
yenisinin, [bir düğümde](#linux-macos-ve-windows) olduğu gibi, elle kopyalanması gerekir.

### Kaldırma

Sunucuyu Pano'dan kaldırın. Ardından

1. sunucu durdurulur ve Pano'nun kendi dosyaları klasöründen çıkarılır — `server.json`,
   `.pano-node/` ve agent'ın `.pano-agent/` klasörü — dünyalar, eklentiler ve yapılandırma ise yerinde
   kalır;
2. agent Pano'dan kaldırıldığını söyler ve temiz bir şekilde kapanır, böylece bir servis onu yeniden
   başlatmaz;
3. `pano-agent.jar` geride kalır: onu silin ve sunucu jar'ını eskisi gibi yine doğrudan başlatın.

## Sunucuları konteynerlerde çalıştırma

Arka plan süreci varsayılan olarak her yönetilen sunucuyu makinede sıradan bir süreç olarak başlatır.
`--runtime DOCKER` (ya da `PANO_NODE_RUNTIME=DOCKER`) ile başlatıldığında ise her birini **kendi
Docker konteynerinde** çalıştırır.

```bash
java -jar pano-node.jar --data ./node-data --runtime DOCKER
```

- Makinede `PATH` üzerinde **`docker` komutu** ve onu kullanma izni olmalıdır. Arka plan süreci bunu
  açılışta denetler; Docker yanıt vermiyorsa, birinin başlatmaya çalıştığı ilk sunucuda keşfetmek
  yerine çalışmayı baştan reddeder.
- **Sunucu başına bir konteyner**; adını o sunucudan alır ve sunucunun ihtiyaç duyduğu Java sürümü
  için resmî **`eclipse-temurin`** imajından başlatılır. İmaj, ilk gerektiğinde indirilir.
- Sunucu için ayarladığınız bellek konteynerin bellek sınırı olur, oyun portu dışarı açılır ve
  sunucunun klasörü konteynerin içine bağlanır — yani dünyalar, yapılandırma ve eklentiler makinede,
  `<veri-klasörü>/servers/<uuid>/` altında durmaya devam eder.
- Panelin yaptığı her şey aynı şekilde çalışmayı sürdürür: konsol (konteynerin girdisi ve çıktısı),
  güç düğmeleri, süreç ölçümleri, dosya yöneticisi ve yedekler.
- **Bir Spigot sunucusu yine burada, makinenin üzerinde derlenir**; makinenin JDK'si ve `git`'iyle (ya da
  [düğümün kendi git'iyle](#git-for-buildtools)) — konteynerin içine yalnızca BuildTools'un ürettiği jar girer. Bkz.
  [Spigot düğümde derlenir](../#spigot-dugumde-derlenir).

Çalıştırma biçimi, arka plan süreci bağlanırken Pano'ya bildirilir; böylece Düğümler sayfası bir
makinenin sunucularını süreç olarak mı yoksa konteynerlerde mi çalıştırdığını gösterir. Geçişten önce
oluşturulmuş sunucular panelde etkilenmez; ama bir sonraki açılışlarında yeni biçimde başlatılırlar.

## Konteyner imajı

Arka plan sürecinin kendisi de bir konteynerde çalışabilir — paneldeki **Coolify** kurulumunun sizin
için kurduğu şey tam olarak budur. İmaj, her Pano sürümüyle birlikte **`ghcr.io/panomc/pano-node`**
olarak yayınlanır ve sürüm numarasıyla (kararlı sürümlerde ayrıca `latest` ile) etiketlenir.

Hiç komut satırı taşımaz: her şey ortam üzerinden yapılandırılır ve `/data` bir birimdir.

```bash
docker run -d --name pano-node \
  -e PANO_URL=https://panel.example.com \
  -e PANO_PAIR_CODE=123456 \
  -e PANO_NODE_NAME=my-node \
  -e PANO_NODE_PORT_RANGE=25565-25600 \
  -v pano-node-data:/data \
  -p 25565-25600:25565-25600 \
  ghcr.io/panomc/pano-node:latest
```

- `PANO_NODE_DATA` imajda zaten `/data` olarak ayarlıdır ve o klasör bir birim olarak tanımlanmıştır
  — bir birim bağlayın; yoksa düğümün kurduğu her şey konteynerle birlikte kaybolur.
- Sunucuların kullanacağı **port aralığını** dışarı açın ve **aynı aralığı** düğüme
  `PANO_NODE_PORT_RANGE` ile verin. Düğüm sunucularına yalnızca bu aralıktan port verir (kendi
  `config.conf` dosyasındaki `node.port-range`; aksi söylenmedikçe `25565-25600`, imajın açtığı
  aralık da budur) ve aralığı Pano'ya bildirir, Pano da portu bu aralığın içinden ayırır. Pano'nun
  aralık dışından istediği bir port aralığın içine taşınır ve bildirilir; böylece hiçbir sunucu
  konteynerin dışarı açmadığı bir porta düşmez. **Coolify** kurulumu `PANO_NODE_PORT_RANGE`
  değişkenini dışarı açtığı aralığa sizin yerinize ayarlar.
- Yeniden başlatma politikası: arka plan süreci kendine bir güncelleme hazırladığında **75** ile
  çıkar; bu yüzden konteynere düz bir `--restart unless-stopped` verin (ya da Coolify yeniden
  başlatsın), süreç yeni sürümle geri gelsin.

## Veri klasörü

Arka plan sürecine ait her şey tek bir klasörde yaşar; böylece tek bir birim olarak bağlanabilir ve
tek bir şey olarak yedeklenebilir. Bu klasörün dışına hiçbir şey yazılmaz.

```
node-data/
├── config.conf            eşleştirme, anahtarlar ve bu düğümün ayarları
├── pano-node.lock         klasör başına tek süreci güvenceye alan kilit; süreç çalıştıkça tutulur
├── pano-node.pid          çalışan sürecin işlem kimliği
├── servers/<uuid>/        yönetilen her sunucu için bir klasör: jar, dünyalar, eklentiler
├── backups/<uuid>/        yedek arşivleri ve üstverileri
├── cache/spigot/          düğümün derlediği Spigot jar'ları ve BuildTools'un kendi dosyaları
├── java/                  Java çalışma zamanları: Pano'nun indirdikleri ve sizin elle bıraktıklarınız
├── cache/java/            inerken Java arşivleri; açıldıktan sonra silinir
├── tools/git/             git'i olmayan bir makinede BuildTools'un kullandığı taşınabilir git
├── cache/tools/           inerken araç arşivleri; açıldıktan sonra silinir
├── updates/               takas edilmeyi bekleyen, hazırlanmış bir güncelleme
├── .pano-node-retired     yalnızca düğüm Pano'dan kaldırıldıktan sonra: bir daha başlamaz
└── service/               --service install ile yazılan servis dosyası
```

Düğümü Pano kendi makinesinde çalıştırdığında bu klasör `<pano-klasörü>/node-data/` olur ve sürecin
kendi çıktısı `<pano-klasörü>/logs/pano-node.log` dosyasına yazılır.

**Veri klasörü başına tek bir süreç.** Arka plan süreci açılışta — eşleşmeden önce, çünkü kaybeden
bir sürecin kendini boşuna Pano'ya kaydettirmesi gereksizdir — `pano-node.lock` dosyası üzerinde bir
işletim sistemi kilidi alır ve yanına `pano-node.pid` dosyasına kendi işlem kimliğini yazar. Aynı
klasöre yöneltilen ikinci bir süreç kilidi tutulmuş bulur, şunu yazar

```
Another pano-node is already running on /var/lib/pano-node (pid 4121); leaving it to it.
```

ve başlamak yerine [76](#cıkıs-kodları) ile çıkar. Tek bir klasördeki iki süreç aynı sunucu
süreçlerini gözetir ve Pano'ya aynı düğüm olarak yanıt verirdi; iki tarafta da bunu kaldıracak bir
şey yok. Kilidi sürecin kendisi tutar, yani nasıl ölürse ölsün kilidi bırakır; pid dosyası ise ancak
onu yazan süreç kadar günceldir ve hem o günlük satırı hem de Pano için vardır — Pano ikisini birden
okuyup zaten çalışan bir süreci tanır ve ikinci bir tane başlatmaz.

## Bir sunucu klasörüne neler yazar

Bir sunucu klasörü, o sunucuyu çalıştıran kişiye aittir; bu yüzden arka plan süreci oraya
olabildiğince az şey yazar ve yeniden üretmek yerine **harmanlar**:

| Ne | |
| --- | --- |
| `server.json` | Düğümün o sunucuya dair kendi kaydı: uuid'si, adı, yazılımı, sürümü, Java sürümü, belleği, JVM parametreleri, portu, jar'ı ve başlatma/çökünce yeniden başlatma anahtarları. Düğümün yeniden başladıktan sonra neye sahip olduğunu hâlâ bilmesini sağlayan dosya budur. Dosya yöneticisi onu göremez. |
| `.pano-node/process.json` | Bir sunucu başlatılır başlatılmaz yazılır ve o süreç, arka plan sürecinin gözetiminde sona erdiğinde silinir: sürecin kimliği, ne zaman başlatıldığı, komutu ve çalışma biçimi. Yeniden başlayan bir arka plan sürecinin [hâlâ çalışan bir sunucuyu sahiplenmesini](#arka-plan-sureci-yeniden-baslarken-neler-korunur) sağlayan dosya budur. |
| `eula.txt` | Yalnızca panelde Minecraft EULA kutusunu işaretlediyseniz yazılır; içe aktarmada ise yalnızca dosya zaten yoksa. |
| `server.properties` | Dosya **harmanlanır, asla yeniden yazılmaz**: sihirbazdaki ya da **Başlangıç ayarları**ndaki değerler, sonra oyun portu ve — yalnızca dosyada hiç yoksa — bir `motd` ile `max-players`. İçe aktarmada yalnızca porta dokunulur. Bir yöneticinin ya da bir eklentinin oraya koyduğu her şey olduğu gibi kalır. |
| Pano eklentisi | Eklenti jar'ı `plugins/` (ya da `mods/`) klasörüne; `config.conf` dosyası ise düğümde üretilen bir RSA anahtar çiftiyle, eşleşmiş hâlde yazılır. Yol platforma göre değişir: Bukkit ailesinde ve BungeeCord'da `plugins/Pano/config.conf`, Velocity'de `plugins/pano/config.conf`, Fabric'te `config/pano/config.conf`. Dosya sisteminin desteklediği yerlerde yalnızca sahibine açık izinlerle. |

Eklenti jar'ının kendisi **Pano'dan** gelir; düğümün onu nereden bulacağını bilmesi gerekmez. Bu
Pano'nun diskinde bir yapı varsa — `managed-servers.plugin-jar-dir` ile bir klasöre yönlendirilmiş
bir geliştirme kurulumunda olduğu gibi — Pano o jar'ı `GET /api/node/plugin-jars/<platform>`
adresinde yayınlar (platform: `spigot`, `bungeecord`, `velocity` ya da `fabric`) ve düğüme bu yolu
verir; yoksa düğüm doğrudan en yeni `PanoMC/pano-mc-plugin` sürüm dosyasına yönlendirilir. Her iki
durumda da düğüm onu başka herhangi bir dosya gibi indirir ve sunulduğu adla kaydeder.

Pano'nun **kendi sunduğu** bir şey için düğüme verdiği her adres, bu da dahil, **görelidir**. Pano bu
düğümün kendisine hangi adresten ulaştığını bilmez — NAT arkasında bir yerel ağ adresi, `127.0.0.1`
üzerinde bir SSH tüneli, herkese açık alan adı; hepsi aynı Pano için — ve kesin olarak işe yarayan
tek adres, düğümün zaten bağlı olduğu adrestir; düğüm de yolu o adrese ekler. Mutlak adresler, yani
bir Paper yapısından bir Modrinth dosyasına kadar her üçüncü taraf indirmesi, olduğu gibi geçer.

Eklentinin `config.conf` dosyası ile düğümün `server.json` dosyası kimlik bilgisi taşır;
[dosya yöneticisinin](../#dosyalar) onları göstermeyi ve onlara dokunmayı reddetmesinin nedeni budur.

## Var olan bir sunucuyu içe aktarma

Pano'dan bir [sunucuyu içe aktarması](../#sunucu-ice-aktarma) istendiğinde iş burada yapılır ve her
zaman `<veri-klasörü>/servers/<uuid>/` altındaki **yeni** bir klasöre yapılır:

- **Bu makinedeki bir klasörden** geliyorsa klasör **kopyalanır**, asla taşınmaz — özgün klasör
  dokunulmadan kalır, yani başarısız bir içe aktarmanın bedeli olmaz. Sembolik bağlar izlenmez,
  atlanır; düğümün kendi veri klasörünün içindeki bir klasör reddedilir, içinde sunucu jar'ı olmayan
  bir klasör de öyle.
- **Yüklenen bir zip'ten** geliyorsa arşiv Pano üzerinden çekilip açılır. Hedefin dışına düşecek bir
  girdi reddedilir; arşivin içindeki tek bir üst klasör ise düzleştirilir, böylece
  `sunucum/server.jar` dosyası `sunucum/sunucum/server.jar` olmaz.
- **Bir modpack'ten** geliyorsa `.mrpack` indirilip okunur: içindeki sunucu tarafının ihtiyaç duyduğu
  her dosya getirilir, paketin önce `overrides/` sonra `server-overrides/` klasörü uygulanır ve
  paketin istediği yükleyici kurulur — Fabric ve Quilt kendi üstveri servislerinden, Forge ve
  NeoForge ise resmî yükleyici çalıştırılarak.

Sonra düğüm **elinde ne olduğuna bakar** ve Pano'ya söyler: hangi jar çalıştırılabilir olanıdır, bu
hangi yazılıma benziyor (önce jar'ın manifestosundan, sonra adından), Minecraft sürümü nedir
(jar'dan, paket üstverisinden ya da `server.properties` dosyasından), hâlihazırda yapılandırılmış
port hangisidir ve o Minecraft sürümünün istediği Java sürümü nedir. Panelde sonradan görünenler
bunlardır — sihirbazda yazdıklarınız yalnızca bir ipucudur.

Port da aynı sırayla belirlenir: istediğiniz port; bir port belirtmediyseniz, boşsa içe aktarılan
`server.properties` dosyasının kullandığı port; o da olmazsa düğümün aralığındaki ilk boş port.

## config.conf

Pano'nun kendi `config.conf` dosyası ve Minecraft eklentisininki gibi HOCON biçimindedir. Eşleştirme
her değiştiğinde arka plan süreci tarafından yazılır — geçici bir dosya ve taşıma ile atomik olarak,
ayrıca dosya sisteminin desteklediği yerlerde yalnızca sahibine açık izinlerle.

```jsonc
platform {
  url = "https://panel.example.com"
  token = "<düğümün taşıyıcı anahtarı>"
  encryption-key = "<AES-256 anahtarı, base64>"
}

node {
  name = "pano-node"
  public-key = "<RSA açık anahtarı, base64>"
  private-key = "<RSA özel anahtarı, base64>"

  stop-servers-on-exit = false

  port-range {
    start = 25565
    end = 25600
  }
}
```

- `platform.token`, `platform.encryption-key` ve `node.private-key` birer **sırdır**. İlk ikisini
  elinde tutan biri, Pano'nuza karşı bu düğümün kimliğine bürünebilir. Dosyaya bir özel anahtar gibi
  davranın: makineler arasında kopyalamayın, sürüm kontrolüne koymayın, destek talebine eklemeyin.
  Sızdıysa düğümü panelden silin ve makineyi yeniden eşleştirin — eski anahtar çalışmaz olur.
- **RSA çifti** ilk eşleştirmede bir kez üretilir ve saklanır. Yeniden üretmek yeniden eşleştirme
  demek olurdu; her açılışta yeniden eşleşen bir düğüm de Pano'da satır yığardı.
- `node.stop-servers-on-exit`, arka plan sürecinin kendisi durduğunda Minecraft sunucularına ne
  olacağını belirler. Varsayılan olan **`false`**, onları çalışır bırakır ve bir sonraki açılışta
  [sahiplenir](#arka-plan-sureci-yeniden-baslarken-neler-korunur). `true` yaptığınızda süreç,
  çıkarken gözettiği her sunucuyu eskiden olduğu gibi durdurur.
- `node.java-auto-download` (varsayılan **`true`**), bir sunucunun ihtiyaç duyduğu ama bu makinede
  olmayan Java'yı düğümün indirmesine izin verir — bkz. [Java çalışma zamanları](#java-runtimes).
- `node.tool-auto-download` (varsayılan **`true`**) aynısını bir Spigot derlemesinin ihtiyaç duyduğu
  araçlar için yapar — şimdilik yalnızca git — bkz. [BuildTools için git](#git-for-buildtools).
- `node.port-range`, bu düğümün sunucularının kullanabileceği port aralığıdır. Düğüm bağlandığında
  aralığı Pano'ya bildirir ve Pano yeni sunucuların portunu bu aralığın içinden ayırır; Pano'nun
  aralık dışından istediği bir port (elle yazılmış ya da aralığı henüz bilmeyen bir Pano'dan gelmiş)
  tıpkı dolu bir port gibi aralık içindeki boş bir porta taşınır ve bildirilir. Yerinde benimsenen
  bir sunucunun kendi `server.properties` dosyasında zaten kullandığı port korunur.
  `--port-range` / `PANO_NODE_PORT_RANGE` bu ayarı açılışta yazar; elle düzenlenmiş dosyada ters
  yazılmış sınırlar reddedilmez, düzeltilir.
- `node.agent` ve `node.agent-server` yalnızca bir [Pano Agent](#the-pano-agent)'ta,
  `.pano-agent/config.conf` içinde bulunur: süreç o tek sunucuyu bulunduğu yerden çalıştırır ve başka
  bir sunucu kurmayı ya da içe aktarmayı reddeder. Bunları düzenlemek yerine sunucuyu panelden
  kaldırın — bu, `.pano-agent/` klasörünü siler ve sunucunun dosyalarını yerinde bırakır.
- Pano anahtarı reddederse — örneğin düğüm panelden silinmişse — süreç bunu söyler ve denemeyi
  bırakır. `config.conf` dosyasını silip taze bir kodla yeniden eşleştirin.

## Java çalışma zamanları {#java-runtimes}

Arka plan sürecinin kendisi Java 17+ ister, ama yönettiği **sunucular** Minecraft sürümlerinin
istediği Java'ya ihtiyaç duyar — 1.16.4 ve öncesi için Java 8, 1.16.5 için 16, 1.20.4'e kadar 17,
1.20.5'ten itibaren 21, 26.1'den itibaren 25. Düğüm iki tür çalışma zamanı kullanır ve ikisini de
paneldeki düğüm sayfasında listeler (**Sunucular → Düğümler → düğümün adı → Java sürümleri**):

- **Sistem** — makinede bulunanlar: sürecin kendi JVM'i, `JAVA_HOME`, `PATH` ve alışılmış JDK
  klasörleri (`/usr/lib/jvm`, `C:\Program Files\Java`, `/Library/Java/JavaVirtualMachines`, …). Pano
  bunları kullanır ama asla güncellemez ya da silmez.
- **Pano** — düğümün `<data>/java/<dağıtıcı>-<sürüm>/` altına indirdikleri, örneğin
  `<data>/java/temurin-21.0.12+1/`. Sisteme genel bir kurulum yapılmaz; root ya da yönetici yetkisi
  gerekmez.

Aynı ana sürümden birden fazla çalışma zamanı varsa, türü ne olursa olsun o sürümün **en yenisi**
kullanılır.

**İndirmeler nereden gelir.** API'si üzerinden [Eclipse Temurin](https://adoptium.net) JRE'leri;
Temurin'in bu makinede o sürüm için derlemesi yoksa — Temurin 16 hiç yok, Apple Silicon için Java 8
yok, ARM üzerinde Windows'ta da birkaç boşluk var — düğüm [Azul Zulu](https://www.azul.com/downloads/)
kullanır. Alpine gibi musl sistemler musl derlemelerini alır. Her arşiv, dağıtıcısının yayımladığı
**SHA-256** ile karşılaştırılır ve uymazsa silinir; yolları denetlenerek açılır (hiçbir dosya çalışma
zamanının klasörü dışına çıkamaz), yeni çalışma zamanı `java -version` komutuna yanıt vermek zorundadır
ve ancak ondan sonra yerine taşınır. Klasöründeki `.pano-managed.json` dosyası, düğümün onu kendi
indirdiği bir sürüm olarak tanımasını sağlar.

**Otomatik indirme.** Bir kurulum ya da başlatma bu makinede olmayan bir Java'ya ihtiyaç duyduğunda
düğüm hangi ana sürümün gerektiğini bulur — **Başlangıç ayarları**nda sabitlenen sürüm, yoksa Minecraft
sürümünün en düşüğü, jar'ın kendisi daha yükseğini istiyorsa o — indirir ve devam eder. Kurulum
sırasında indirme, kurulumun ilerlemesinin parçasıdır; başlatmadan önce ise ayrı bir **Java
indiriliyor** görevidir ve sunucu bu sırada **Başlatılıyor** durumunda kalır. Başarısız bir indirme
başlatmayı nedeniyle birlikte bir durdurma olarak bitirir — çökme olarak değil; böylece çökme sonrası
yeniden başlatma bunun üzerinde döngüye girmez.

Bunu [`config.conf`](#config-conf) içinde `node.java-auto-download = false` ile (süreç dururken
düzenleyin) ya da `PANO_NODE_JAVA_AUTO_DOWNLOAD=false` ile kapatabilirsiniz. Eksik bir Java isteyen
başlatma o zaman `No Java 21 runtime on this host; automatic Java download is disabled` hatasıyla
başarısız olur ve sunucunun genel bakış sayfası onu bir kereliğine indirmeyi önerir.

**Panelden.** Düğümün **Java sürümleri** kartında **Java yükle** düğmesi vardır; bu makinenin
indirebileceği ana sürümleri dağıtıcısı, sürümü, boyutu ve ne için olduğuyla listeler, iki dağıtıcının
da derlemediği sürümler soluk gösterilir. Pano'nun kurduğu bir çalışma zamanında, o ana sürümün daha
yeni bir derlemesi varsa **Güncelle** — yenisi eskisinin yanına kurulur, eskisi üzerinde artık hiçbir
şey çalışmadığında kaldırılır — ve **Kaldır** düğmeleri bulunur. Çalışan bir sunucu o çalışma
zamanıyla başlatılmışsa ya da bir sunucu o ana sürüme sabitlenmişken bu, o sürümün son çalışma
zamanıysa kaldırma reddedilir; düğme hangi sunucuların engel olduğunu söyler. Sistem çalışma zamanları
Pano'dan kaldırılamaz. Yüklemek ve kaldırmak **Düğümleri Yönet** izni ve çevrimiçi bir düğüm gerektirir;
bu özellikten eski bir düğüm sahip olduğu çalışma zamanlarını gösterir ama
[güncellenene](#arka-plan-surecini-guncelleme) kadar indirme sunmaz.

**İnternetsiz makineler.** Bir JDK ya da JRE'yi kendiniz indirip `<data>/java/` altında kendi
klasörüne açın (örneğin içinde `bin/java` olan `<data>/java/jdk-21/`). Düğüm onu bir sonraki
açılışta bulur ve **Sistem** çalışma zamanı olarak listeler. Bu, her dağıtıcı ve her sürüm için
geçerlidir.

Yarıda kalmış bir indirmeden ya da kaldırmadan artakalanlar (`<data>/java/.tmp-*`,
`<data>/java/.trash-*`, `<data>/cache/java/` içindeki arşivler) süreç açılırken temizlenir.

## BuildTools için git {#git-for-buildtools}

[Spigot](../#spigot-dugumde-derlenir), BuildTools ile derlenir. BuildTools klonlamayı kendi içindeki
git kütüphanesiyle yapar ama Spigot yamalarını uygulamak gibi yerel işler için yine `git` çalıştırır.
Artık bunu sizin kurmanız gerekmez. Düğüm git'i şu sırayla bulur:

1. **Makinenin `PATH`'indeki bir git** önceliklidir ve hiçbir şey indirilmez.
2. **Windows'ta** başka bir şey gerekmez: BuildTools kendi PortableGit'ini (her Spigot sürümü için
   yaklaşık 60 MB) kendi çalışma klasörüne indirir.
3. **Linux ve macOS'ta** düğüm, Pano'nun GitHub sürümleriyle birlikte `pano-git-<os>-<arch>.tar.gz`
   adıyla yayımlanan küçük bir git'i (yaklaşık 8 MB, x64 ve arm64) indirir. Arşiv SHA-256'sına göre
   doğrulanır, `<data>/tools/git/<os>-<arch>-<sürüm>/` içine açılır ve `git --version` sorusuna yanıt
   vermek zorundadır.

Düğümün git'i `PATH`'in başına **yalnızca BuildTools süreci için** eklenir — sisteme hiçbir zaman
kurulmaz; ne kabuğunuz ne de sunucular onu görür. Bir kez indirildikten sonra, indirmeler kapalı olsa
bile sonraki her derlemede yeniden kullanılır. İndirme, kurulumun ilerlemesinin bir parçası olarak
görünür (*Downloading git …*).

Bunu [`config.conf`](#config-conf) içinde `node.tool-auto-download = false` ile (süreç dururken
düzenleyin) ya da `PANO_NODE_TOOL_AUTO_DOWNLOAD=false` ile kapatabilirsiniz. Git'i olmayan bir
makinedeki Spigot kurulumu o zaman daha hiçbir şey derlenmeden başarısız olur:

```
Git is not installed on this node and automatic tool download is disabled; BuildTools needs it (apt install git / pacman -S git / brew install git).
```

Başarısız bir indirme nedenini söyler ve aynı paketleri önerir. İnternetsiz bir makinede git'i
sistemin paket yöneticisiyle kurun.

## Protokol sürümü

Arka plan süreci **protokol sürümü 2** konuşur ve bağlandığı anda bunu; kendi sürümünü, işletim
sistemini, mimarisini, sahip olduğu CPU, bellek ve diski, bulduğu Java çalışma zamanlarını ve
hâlihazırda sahip olduğu sunucuları bildirir.

Ayrıca `CONSOLE_HISTORY` isteğini yanıtlar; konsoldaki **Daha eski satırları yükle** düğmesinin
arkasındaki istek budur: o sunucunun `logs/latest.log` dosyasından ve döndürülmüş arşivlerinden geri
okunan bir sayfa satır, günlüğün sonundan sayılan bir `skip` ve geride daha eskisinin kalıp
kalmadığını söyleyen bir `hasMore` ile.

Pano, daha eski bir sürüm konuşan bir düğümü **reddetmek yerine kabul eder** ve o sürümün
yapamadıklarını dışarıda bırakır — eski Minecraft eklentilerine zaten gösterdiği hoşgörünün aynısı.
Protokol **2**, [Pano'nun kurmadığı jar dosyalarını tanımanın](../#elle-yuklenen-jar-dosyalarını-tanıma)
arkasındaki isteği ekledi: bundan eskisini konuşan bir düğüme **Kaynakları bul** düğmesi hiç
sunulmaz, çünkü tek olası yanıtı "bu düğüm bunu yapamaz" olan bir düğme, hiç düğme olmamasından
kötüdür. Düğümler sayfasından [düğümü güncelleyin](#arka-plan-surecini-guncelleme), düğme belirir.

Jar'ın, çalıştırdığınız Pano sürümünden gelmesi gerekmesinin nedeni budur: ikisi birlikte yayınlanır,
böylece protokolleri her zaman uyuşur. Konuştuğu Pano'dan eski kalan bir arka plan süreci en yeni
iletileri anlamaz — alışıldık belirti, "beklemede" durumundan hiç çıkmayan bir kurulumdur; çözüm de
jar'ı güncelleyip süreci yeniden başlatmaktır.

## Arka plan süreci yeniden başlarken neler korunur

Arka plan sürecinin durması, o makinedeki Minecraft sunucularını **durdurmaz**. Yeniden başlatılan,
güncellenen ya da öldürülen bir süreç, gözettiği her sunucuyu çalışır bırakır — çıkarken kaç tanesini
geride bıraktığını da yazar — ve bir sonraki açılışında onları yeniden devralır. Düğümün güncellemesi
boyunca oyuncular dünyalarında kalır; sürecin uzakta olduğu birkaç saniyede değişen tek şey, panelin
ona bir şey soramamasıdır.

Bunu tek bir küçük dosya sayesinde yapabilir. Arka plan süreci bir sunucuyu başlatır başlatmaz
`<sunucu klasörü>/.pano-node/process.json` dosyasını yazar — sürecin kimliği, başlatıldığı an, komutu
ve çalışma biçimi (düz bir süreç ya da Docker konteynerinin adı) — ve o süreç kendi gözetiminde sona
erdiğinde dosyayı siler. Bir sonraki açılışında kayıtları geri okur ve hâlâ ayakta olanları
**sahiplenir**. Bir kayda ancak şu üç koşulda inanılır:

- süreç kimliği hâlâ yaşıyorsa,
- o süreç, kaydın söylediği anda başlamışsa (birkaç saniye payla) — aksi hâlde işletim sistemi o
  numarayı çoktan bambaşka bir şeye vermiştir,
- ve komut satırı gerçekten o sunucuysa (Docker çalışma biçiminde: konteyner hâlâ çalışıyorsa).

Bunlardan birini geçemeyen kayıt bayattır: silinir ve sunucu **Durduruldu** olarak bildirilir. Geçen
kayıt ise Pano'ya çalışıyor diye bildirilir ve panelde *sahiplenildi* rozetiyle görünür.

Sahiplenilen bir sunucu her şeyiyle sıradan bir sunucu gibi davranır; tek bir istisnayla: arka plan
süreci süreci devraldı ama **standart girdisini** devralamadı, çünkü o boru artık olmayan sürecindi.
Konsol yine akar — düğüm `logs/latest.log` dosyasını bulunduğu yerden, dosya döndürülse bile izler —
geçmişi yine günlük dosyalarından sayfalanır, ölçümler gelmeyi sürdürür; **Durdur**, **Yeniden
başlat** ve **Öldür** işletim sisteminin kendi sinyalleriyle çalışır. Kullanılamayan tek şey sunucuya
yazmaktır; sunucuda bir eklenti varsa Pano komutları
[Pano eklentisi](../#sahiplenilen-sunucular) üzerinden iletir. Panelden tek bir yeniden başlatmanın
ardından düğüm süreci yeniden tam olarak sahiplenir.

**Sahiplenilen bir sunucu ölürse otomatik olarak yeniden başlatılmaz**; *Çökme sonrası yeniden
başlat* ne derse desin. O süreci arka plan süreci başlatmadı; bu yüzden bir çökmeyi, birinin makinede
sunucuyu elle durdurmasından ayırt edemez — bilerek kapatılmış bir sunucuyu geri açmak ise ikisinin
arasında daha büyük hatadır.

> Arka plan sürecinin, eskiden olduğu gibi çıkarken sunucularını da durdurmasını istiyorsanız
> [`config.conf`](#config-conf) içinde `node.stop-servers-on-exit = true` deyin. Varsayılan değer
> `false`'tur.

## Arka plan sürecini güncelleme

Eskiden bir düğüm, kurulduğu arka plan süreciyle kalırdı; onu değiştirmenin tek yolu makineye girip
jar'ı elle değiştirmekti. Artık gerekmiyor: Pano [kendi arka plan sürecini](#nereden-alınır) sunduğu
için bir düğümü güncellemek tek bir düğmedir.

**Panel → Sunucular → Düğümler**, çalıştırdığı arka plan süreci Pano'nun vereceği sürüm olmayan
düğümleri bir **Güncelleme Mevcut** rozetiyle işaretler; yanındaki işlem de o düğümü yerinde
günceller. Bunun için **Düğümleri yönet** izni gerekir; altta çalışan uç nokta
`POST /api/panel/nodes/:id/update`.

"Pano'nun vereceği sürüm olmayan" kararının nasıl verildiği, iki tarafın ne olduğuna bağlıdır:

- **Yayınlanmış yapılarda** **sürümler** karşılaştırılır: her Pano sürümü kendi arka plan sürecini
  taşır ve Pano elindeki kopyayı o sürümde tutar — açılırken hiç yoksa ya da başka bir sürümdense
  (örneğin Pano kendini güncelledikten hemen sonra) kendi sürümünün `pano-node.jar`'ını indirir.
  Yani ikisi birlikte ilerler ve sürüm dizileri yeterlidir.
- **Geliştirme yapılarının** ikisi de sonsuza kadar kendine `local-build` der, buna rağmen saatte
  birkaç kez yeniden derlenirler. Orada yanıt, düğümün bağlanırken bildirdiği **SHA-256** ile
  Pano'nun o an sunduğu jar'ın sağlamasının karşılaştırılmasından gelir.
- **Bilinmeyen asla "evet" değildir.** Sürümünü bildirmemiş bir düğüm ya da sunacak jar'ı olmayan bir
  Pano hiç rozet almaz: verilemeyecek bir güncellemeyi önermek, hiç önermemekten kötüdür.

Düğmeye bastığınızda Pano önce o düğümün zaten tam olarak aynı baytları çalıştırıp çalıştırmadığına
bakar ve öyleyse `upToDate: true` yanıtını verir. Bu bir incelik değil: güncellemeyi yine de
göndermek, arka plan sürecinin kendi çalıştığı jar'ı indirmesine, kendi üzerine koymasına ve yeniden
başlamasına yol açardı — yani o düğümdeki her sunucuya, başladığı yere dönmek için bir dakikalık
kesinti. Aksi hâlde Pano; sürümü, sağlamayı ve jar'ın **göreli** adresini taşıyan bir `SELF_UPDATE`
gönderir, düğüm de bu adresi zaten bağlı olduğu adrese göre çözer. Ardından arka plan süreci

1. jar'ı indirir ve ilerlemeyi panele bir `SELF_UPDATE` görevi olarak bildirir,
2. **SHA-256'yı** ve gelenin gerçekten bir jar olup olmadığını **doğrular** — arka plan sürecinin kod
   indirip onu kendisi olarak çalıştırdığı tek yer burasıdır, bu yüzden bir uyuşmazlık hiçbir şey
   kurmadan dosyayı siler ve görevi başarısız sayar,
3. dosyayı, neyin beklediğini anlatan bir notla birlikte `<veri-klasörü>/updates/` altına koyar,
4. kapanır, **hazırlanmış jar'ı çıkarken kendi jar'ının üzerine taşır** ve **75** ile çıkar.

75 çıkış kodu "kendime bir güncelleme hazırladım, beni yeniden başlat" demektir — bkz.
[Çıkış kodları](#cıkıs-kodları). Süreci asıl yeniden başlatan, onu gözeten şeydir:
[kurulum betiğinin](../#uzak-dugumler) yazdığı systemd birimi hem `SuccessExitStatus=75` hem
`Restart=always` içerir, bir konteynerin yeniden başlatma politikası olmalıdır
(`--restart unless-stopped` ya da Coolify'ın kendi politikası) ve Pano'nun yerel düğüm için kendi
gözetleyicisi bunu zaten yeniden başlatma sayar. Takas çıkarken yapıldığı için **tek bir yeniden
başlatma yeter**: bundan sonra başlatılan süreç zaten yeni jar'dır. Yerel ölçümde düğüm yaklaşık
**üç saniye** çevrimdışı kalır.

Yapılamayan bir takas, hazırlanmış jar'ı ve notunu `<veri-klasörü>/updates/` altında bırakır; arka
plan süreci bir sonraki açılışında yeniden dener, hiçbir şeyi ikinci kez indirmez ve bu deneme
tutarsa bir kez daha 75 ile çıkarak bir yeniden başlatma daha ister. Süreci hiçbir şey yeniden
başlatmazsa düğüm, güncelleme beklerken kapalı kalır.

Güncelleme, arka plan sürecinin yeniden başlatılmasıdır; ama **gözettiği sunucuların değil**: onlar
boyunca çalışmaya devam eder ve süreç geri geldiğinde yeniden
[sahiplenilir](#arka-plan-sureci-yeniden-baslarken-neler-korunur) — kimsenin bağlantısı kesilmez,
hiçbir dünya bunun için kaydedilip yeniden yüklenmez. O birkaç saniye boyunca çevrimdışı olan şey
oyun değil, düğümdür. Sunucunun sonradan fark ettiği tek şey konsolun komut girişidir — arka plan
sürecinin, kendisinin başlatmadığı bir sürece borusu yoktur — ki o sunucu panelden bir dahaki sefer
yeniden başlatılana kadar bunu Pano eklentisi karşılar.

**Windows'ta** çalışan bir sürecin başlatıldığı jar kilitlidir; bu yüzden takas hem çıkışta hem de
sonraki denemede başarısız olur. Arka plan süreci yeni jar'ın nerede olduğunu söyler, siz de onu
eskisinin üzerine kopyalarsınız — bkz. [Linux, macOS ve Windows](#linux-macos-ve-windows).

## Bir düğümü kaldırma {#removing-a-node}

**Bir düğümü silmek, üzerindeki her şeyi siler.** **Panel → Sunucular → Düğümler → Sil** (ya da
düğümün kendi sayfasındaki **Bu düğüm silinsin mi?** düğmesi) **Düğümleri Yönet** izni, düğümün
adının elle yazılması ve hesap parolanızı ister; altında `POST /api/panel/nodes/:id/delete` vardır.
Onaylamadan önce pencere, silmeyle birlikte gidecekleri listeler: düğümdeki her sunucu, bunların
kaç yedeği olduğu ve ne kadar yer kapladığı, Pano'nun oraya indirdiği Java çalışma zamanları.

Düğüm **çevrimiçiyse** Pano, arka plan sürecinden kendini kaldırmasını ister ve onu bekler — en fazla
iki dakika; ilerleme pencerede görünür. Arka plan süreci

1. üzerindeki her sunucuyu, sunucu silmedeki gibi durdurur (önce nazikçe, sonra sonlandırarak, en son
   öldürerek); zamanlanmış görevleri, yedeklemeleri ve aktarımları da durdurur;
2. `servers/`, `backups/`, `java/`, `tools/`, `cache/` klasörlerini, günlüklerini ve çalışma dosyalarını
   siler; geriye yalnızca bir işaret dosyası bırakır: `<data>/.pano-node-retired`;
3. yapabildiği yerde kendi servisini kaldırır: `--service install` ile yazılan birimi ya da — root
   olarak çalışıyorsa — [kurulum betiğinin](../#uzak-dugumler) oluşturduğu `pano-node` systemd
   birimini ve `/opt/pano-node` klasörünü;
4. sonucu bildirir, bağlantıyı kapatır, `config.conf` dosyasını ve veri klasöründen silebildiği her
   şeyi siler ve [**78**](#cıkıs-kodları) koduyla çıkar.

Ardından Pano, o düğümün bütün sunucularını veritabanından siler — her biri normal bir sunucu silme
gibi etkinlik günlüğüne yazılır — ve düğümün jetonunu, yedek kayıtlarını, görevlerini, uyarılarını
ve en son düğümün kendisini kaldırır.

**Elle yapılması gerekenler.** Arka plan sürecinin kendisinin kaldıramadığı ne varsa kısa bir komut
listesi olarak geri gelir ve **Makineden kaldırmayı tamamla** başlığının altında, kopyalama düğmesiyle
gösterilir. Liste, düğümün nasıl kurulduğuna göre değişir:

| Kurulum şekli | Sonrasında çalıştıracaklarınız |
| --- | --- |
| root olarak `install.sh` | Genellikle hiçbir şey: arka plan süreci kendi birimini devre dışı bırakıp siler. Bunu yapamadıysa `sudo systemctl disable --now pano-node`, `sudo rm -rf /etc/systemd/system/pano-node.service /etc/pano-node /opt/pano-node /var/lib/pano-node`, `sudo systemctl daemon-reload` ve `sudo userdel pano-node`. |
| `install.sh --user-install` | `rm -rf ~/.pano-node` |
| `--service install` (Linux) | `systemctl disable --now pano-node`, kopyaladığınız birimin silinmesi, ardından veri klasörü. |
| `--service install` (macOS) | `launchctl unload` ve `~/Library/LaunchAgents/com.panomc.node.plist` dosyasının silinmesi, ardından veri klasörü. |
| Windows kurucusu ya da servisi | `sc.exe stop PanoNode`, `sc.exe delete PanoNode`, ardından klasörleri için `Remove-Item`. |
| Coolify ya da başka bir konteyner | Coolify'da pano-node uygulamasını **kalıcı depolamasıyla birlikte** silin ya da konteyneri `docker rm -f`, birimini `docker volume rm` ile kaldırın. |
| Elle başlatılmış | Veri klasörünü `rm -rf` ile silin. Jar dosyası yalnızca belirtilir: başka bir node onu kullanmıyorsa kendiniz silin. |

**Emekliye ayrılma işareti.** İçinde `.pano-node-retired` bulunan bir veri klasöründe başlatılan
arka plan süreci `This node was removed from Pano; nothing to do` yazar ve hemen 78 koduyla çıkar:
yeniden eşleşmez ve döngü halinde yeniden bağlanmaya çalışmaz. Pano'nun yazdığı systemd birimleri
`RestartPreventExitStatus=78` ayarını içerir; böylece systemd de onu yeniden başlatmayı bırakır. O
makineyi yeniden düğüm olarak kullanmadan önce klasörü (ya da en azından işareti) silin.

**Çevrimdışı bir düğüm.** Bağlı olmayan bir düğüm hiçbir şeyi silemez; bu yüzden Pano `NODE_OFFLINE`
ile reddeder ve pencere *Düğüm çevrimdışı — Pano onu yalnızca unutabilir; dosyalar makinede kalır*
der. Yine de silmek için **Yine de Pano'dan kaldır** kutusunu işaretleyin (`force: true`): sunucular
ve düğüm panelden kalkar, makinede hiçbir şey silinmez ve pencere, Pano'nun düğümün nasıl kurulduğuna
bakarak çıkarabildiği adımları — veri klasörünün silinmesi dahil — gösterir. Aynı seçenek, kaldırma
işleminin kendisi başarısız olduğunda (`NODE_UNINSTALL_FAILED`, düğümün kendi hata mesajıyla) ya da
arka plan süreci kendini kaldıramayacak kadar eski olduğunda da çıkar — temiz bir kaldırma için önce
düğümü güncelleyin.

**Yerel düğüm** de aynı şekilde kaldırılır; tek fark, Pano'nun önce onu gözetmeyi bırakmasıdır —
böylece çıkış onu yeniden başlatmaz — ve ardından `node-data` klasörünü kendisinin silmesidir. Düğüm
yeniden *kurulmamış* durumuna döner ve **Düğüm ekle → Yerel** ile yenisi kurulabilir.

## Çıkış kodları

| Kod | |
| --- | --- |
| **0** | Temiz bir kapanış. `--help` ile `--service install` / `--service uninstall` de bununla biter. |
| **1** | Eşleşemedi: Pano adresi yok, eşleştirme kodu ya da önyükleme anahtarı yok ya da Pano eşleştirmeyi reddetti. |
| **2** | Komut satırı yanlıştı — kullanım metnini yazdırır. Süreç bir jar'dan başlatılmamışken verilen `--service install` de buraya düşer. |
| **75** | **"Kendime bir güncelleme hazırladım, beni yeniden başlat"** — bir hata değil. |
| **76** | **Bu veri klasörünü başka bir süreç tutuyor** — bu da bir hata değildir ve yeniden başlatılacak bir şey yoktur: düğüm, çalışmaya devam edendir. |
| **78** | **Bu düğüm Pano'dan kaldırıldı** — kendini kaldırdı ya da açılışta `.pano-node-retired` işaretini buldu. Asla yeniden başlatmayın. Bkz. [Bir düğümü kaldırma](#removing-a-node). |

Süreci gözeten her ne ise, onun için önemli olan kod `75`'tir. Yeni jar, düğüm çalışmaya devam
ederken indirilip sağlaması doğrulanarak `<veri-klasörü>/updates/` altına konur ve her şey
durdurulduktan sonra, süreç bitmeden hemen önce — yani **çıkarken** — sürecin başlatıldığı jar'ın
üzerine taşınır; böylece bundan sonra başlatılan süreç zaten yeni arka plan sürecidir ve tek bir
yeniden başlatma yeter. Yani:

- `--service install` ile yazılan systemd birimi `SuccessExitStatus=75` ayarını içerir,
- [kurulum betiğinin](../#uzak-dugumler) yazdığı birim de bu ayarı içerir,
- Pano'nun yerel düğüm için kendi gözetleyicisi bunu yeniden başlatma sayar,
- elle yazılmış bir sarmalayıcı ya da bir konteyner yeniden başlatma politikası da süreci yeniden
  başlatmalıdır.

`Restart=always` politikası da işe yarar; zaten sürecin hemen geri gelmesi beklenir. Yapılamayan bir
takas, bir sonraki açılışta yeniden denenir ve bu deneme tutarsa süreç bir kez daha 75 ile çıkıp bir
yeniden başlatma daha ister; Windows'ta jar iki durumda da kilitli kaldığı için dosyayı elle
kopyalarsınız.

`78`, 75'in tersidir: düğüm [kaldırılmıştır](#removing-a-node) ve kapalı kalmalıdır. Pano'nun
yazdığı birimler `RestartPreventExitStatus=78` ayarını içerir, Pano'nun yerel düğüm gözetleyicisi onu
asla yeniden başlatmaz; elle yazılmış bir sarmalayıcı ya da konteynerin yeniden başlatma politikası
da bunu kesin bir son olarak görmelidir. Bu birimler onu `143` ile (JVM'in `systemctl stop`
komutunun SIGTERM'iyle çıkması) birlikte `SuccessExitStatus=75 78 143` satırında da sayar; böylece
ne kaldırma ne de durdurma birimi başarısız (failed) gösterir.

`76` gözetleyiciden hiçbir şey istemez: arka plan süreci, veri klasörünün kilidini başka bir sürecin
tuttuğunu görüp bunu söylemiş ve durmuştur; bu, yeniden başlatılacak bir durum değil, doğru
sonuçtur. Bkz. [Veri klasörü](#veri-klasoru).

## Servis dosyaları

`--service install`, `<veri-klasörü>/service/` altına bir birim dosyası **yazar** ve onu
etkinleştiren tek komutu ekrana basar. O komutu asla kendisi çalıştırmaz: servis kaydı üç işletim
sisteminde de root ister ve asıl amacı bir konteynerde yetkisiz bir kullanıcı tarafından
başlatılabilmek olan bir süreç ne sessizce yetki yükseltmeli ne de yükseltemediği için çalışmayı
reddetmelidir.

| Makine | Dosya | Etkinleştirme |
| --- | --- | --- |
| Linux | `pano-node.service` | `/etc/systemd/system` altına kopyalayın ve `systemctl enable --now pano-node` çalıştırın |
| macOS | `com.panomc.node.plist` | `~/Library/LaunchAgents` altına kopyalayın ve `launchctl load com.panomc.node.plist` çalıştırın |
| Windows | `pano-node-service.cmd` | Yükseltilmiş bir komut isteminden çalıştırın — servisi `sc create` ile kaydeder |

`--service uninstall` dosyayı siler ve karşılığı olan `systemctl disable --now pano-node`,
`launchctl unload` ya da `sc delete PanoNode` komutunu ekrana basar.

## Linux, macOS ve Windows

Jar taşınabilirdir ve arka plan süreci **Linux, macOS ve Windows** üzerinde, x64 ve arm64 mimarileriyle
desteklenir (arm32 elden geldiğince). Aralarındaki farklar yalıtılmıştır ve bilinmeye değer:

- **Bir sunucuyu durdurmak.** Windows'ta bir sürece "kibarca kapan" diyen bir sinyal yoktur; oradaki
  sıra sunucunun kendi durdurma komutu, sonra sonlandırma, sonra öldürmedir — Pano'nun size gösterdiği
  aynı üç adım, ortadakinin Linux ve macOS'taki kadar iş yapmadığı hâliyle. Büyük bir dünyaya
  kaydetmesi için biraz daha zaman tanıyın.
- **Servis kaydı** yukarıda anlatıldığı gibi değişir; Windows'ta birim dosyası yoktur, yalnızca
  `sc create` çağıran bir betik vardır.
- **Kendini güncelleme.** Windows, bir sürecin çalıştığı jar'ı kilitler; bu yüzden takas orada
  başarısız olur ve süreç yeni jar'ın nerede olduğunu söyler — **eskisinin üzerine kopyalayıp servisi
  yeniden başlatın**. Linux ve macOS'ta takas kendiliğinden olur. Windows tarafını halleden bir
  yükleyici planlanıyor.
- **Yollar ve izinler** her platforma göre ele alınır; `config.conf` üzerindeki yalnızca sahibine açık
  izinler, dosya sisteminin desteklediği yerlerde uygulanır.

## Güvenlik

- **Yalnızca dışarı doğru.** Bağlantıyı Pano'ya arka plan süreci açar ve açık tutar; Pano düğüme hiç
  bağlanmaz ve düğüm tarafında **hiçbir port açılmaz**. NAT arkasında ve içeri hiçbir şeye izin
  vermeyen bir güvenlik duvarının ardında çalışır.
- **Kimlik doğrulamalı ve şifreli.** Eşleştirme sırasında AES-256 anahtarı, düğümün kendi RSA açık
  anahtarıyla sarmalanarak verdiğiniz adres üzerinden iletilir — aynı makinede olmayan bir düğüm için
  **HTTPS** kullanın. WebSocket sonrasında bir JWT taşıyıcı anahtar taşır ve üzerindeki her çerçeve,
  tıpkı Minecraft eklentisinin bağlantısındaki gibi **AES-256-GCM** ile şifrelenir.
- **Eşleştirme kodu kısa ömürlüdür.** Altı hane, her 30 saniyede bir yenilenir ve bu kodla eşleşen bir
  düğüm, panelde **bir yönetici kabul edene kadar güvenilmez**. Yalnızca kendi kurduğunuz makineleri
  kabul edin.
- **Dosya sistemi kum havuzundadır.** Pano'nun gönderdiği her yol normalleştirilir ve yalnızca o
  sunucunun klasörünün içinde olduğu denetlenir; `..`, mutlak yollar ve dışarı çıkan sembolik bağlar
  reddedilir. Bir de yasak liste vardır: panel, kimlik bilgisi taşıyan dosyalara — aralarında Pano
  eklentisinin kendi `config.conf` dosyası da var — hiç yaklaşamaz.
- **Kabuk yok.** Sunucular bir kabuk üzerinden değil, bir parametre listesiyle başlatılır; yani bir
  addaki, bayraktaki ya da yoldaki hiçbir şey ikinci bir komuda dönüşemez. Süreç ayrıca bir sunucunun
  devraldığı ortamdan `JAVA_TOOL_OPTIONS`, `_JAVA_OPTIONS`, `JDK_JAVA_OPTIONS` ve `CLASSPATH`
  değişkenlerini temizler; böylece arka plan süreci için konmuş bayraklar oyuna ulaşmaz.
- **Yetki yükseltmez.** Süreç, onu başlatan kullanıcı olarak çalışır ve yalnızca kendi veri klasörünün
  içine yazar.

## Yardım gerekiyor mu?

- [SSS sayfasına](../../FAQ/) göz atın
- [Discord topluluğumuzda](https://discord.gg/6vVy72wgXT) sorun
- [GitHub](https://github.com/PanoMC/Pano/issues) üzerinden bir issue açın
