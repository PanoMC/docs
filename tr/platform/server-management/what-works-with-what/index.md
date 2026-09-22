# Hangi Özellik Neyle Çalışır

Bir Minecraft sunucusu Pano'ya üç farklı şekilde bağlanabilir ve her birinin kendi yetenekleri
vardır:

- **Yalnızca bir düğüm.** Sunucuyu [`pano-node`](../pano-node/) arka plan süreci kurmuştur ve süreç
  ona aittir; böylece sunucuyu başlatabilir, öldürebilir, dosyalarını okuyabilir ve sunucu dururken
  bile arşivleyebilir — ama oyunun dışındadır; tick'lerden, dünyalardan ve kimin oynadığından haberi
  yoktur. Böyle bir sunucuda Pano eklentisi hiç yoktur.
- **Yalnızca Pano eklentisi.** Eklenti sunucunun *içinde* çalışır; bu yüzden TPS'i, gerçek oyuncu
  listesini ve hangi eklentilerin yüklendiğini bilir — ama çalışmayan bir sunucuyu başlatamaz ve
  içinden çalıştığı dosyaların üzerine yazamaz. Bu, bir
  [bağlı sunucudur](../#baglı-sunucu-nedir): siz çalıştırırsınız, Pano onunla konuşur.
- **İkisi birden.** Pano'nun oluşturduğu bir sunucuda olağan durum budur: düğüm, kurduğu her sunucuya
  Pano eklentisini de kurar; yani [yönetilen bir sunucu](../#yonetilen-sunucular) aynı zamanda bağlı
  bir sunucudur.

Üçünden hiçbiri "eksik kip" değildir. Her özelliği **o işi daha iyi yapabilen taraf** üstlenir; bir
şeyi yalnızca bir taraf yapabiliyorsa onu o taraf yapar. Pano bunu özellik özellik ve sunucu sunucu
hesaplar; bu yüzden panel hiçbir zaman "bu sunucu yönetilen mi?" diye sormaz — "bu sunucu şu anda
neler yapabiliyor?" diye sorar.

> ⚠️ Sunucu yönetiminin geri kalanı gibi bu da önce **alpha** kanalında, ilgili `pano-mc-plugin` ve
> `pano-node` sürümleriyle birlikte yayınlanır. Ardından alışıldık sırayla `beta` ve kararlı sürüme
> iner.

## Konsol

| | Yalnızca düğüm | Yalnızca eklenti | İkisi birden |
| --- | --- | --- | --- |
| **Canlı akış** | Sürecin yazdırdığı her şey: açılış günlüğünün ilk satırından, üzerinde öldüğü hata yığınına kadar | Sunucunun kendi günlüğü; eklenti yüklenir yüklenmez oyunun içinden yakalanır | **Düğüm**, eklentinin satırları da harmanlanarak — böylece eklenti yüklenmeden önce olan hiçbir şey kaçmaz |
| **Geçmiş ve Daha eskisini yükle** | `logs/latest.log` ve yanındaki döndürülmüş `logs/*.log.gz` dosyalarından okunur; sunucu çalışsa da dursa da | Aynı dosyalardan, istendiği anda ve yalnızca sunucu çevrimiçiyken eklenti okur. Bunun için bellekte hiçbir şey tutulmaz | **Düğüm**, çünkü duran bir sunucunun günlüğünü de okuyabilir |
| **Komut girişi** | Doğrudan sürecin standart girdisine yazılır | Oyunun içinden, sunucunun kendi konsol göndericisine iletilir | **Düğüm** — yazacak bir girdisi yoksa, ki [sahiplenilen bir sunucuda](../#sahiplenilen-sunucular) durum budur, komutu eklenti gönderir |

İki taraf da aynı biçimde sayfalar: **Daha eskisini yükle**'ye her basış günlük dosyalarında bir
pencere daha geriye gider ve dosyalar tükendiğinde düğme kaybolur. Taşma koruması, hız sınırı ve
BungeeCord proxy'sinin yapamadıkları için [Konsol](../#konsol) bölümüne bakın.

## Güç

| | Yalnızca düğüm | Yalnızca eklenti | İkisi birden |
| --- | --- | --- | --- |
| **Başlat** | **Düğüm.** | — Bir eklenti çalışmayan bir sunucuyu başlatamaz; orada soracak kimse yoktur. | **Düğüm.** |
| **Durdur** | Düğüm önce durdurma komutunu yazar, sonra süreci sonlandırır, en sonunda öldürür | Eklenti, sunucuyu kendi platform API'siyle kapatır | **Düğüm**; nazik isteği yok sayan bir sunucuda sonuna kadar gidebilen taraf odur |
| **Yeniden başlat** | Durdurup başlatır | Yalnızca platformun kendi yeniden başlatma desteği varsa — çalışan bir `restart-script` ile Paper ve Spigot; diğerlerinde sunucuyu durdurur ve bunu söyler | **Düğüm** |
| **Öldür** | **Düğüm.** | — Takılmış bir JVM'i içeriden hiçbir şey öldüremez. | **Düğüm.** |

## Ölçümler ve oyuncular

| | Yalnızca düğüm | Yalnızca eklenti | İkisi birden |
| --- | --- | --- | --- |
| **TPS ve MSPT** | — JVM'in dışından hiçbir şey bir tick'i ölçemez. | **Eklenti.** | **Eklenti.** |
| **Bellek** | Sürecin yerleşik belleği — işletim sisteminin gördüğü hâliyle JVM'in tamamı | JVM yığını: kullanılan ve azami | Yığın için **eklenti**, yanında düğümün süreç değerleriyle |
| **Süreç CPU'su, makine CPU / RAM / disk** | **Düğüm.** | — | **Düğüm.** |
| **Oyuncu sayısı** | Sunucunun kendi portuna yapılan bir **sunucu listesi ping'inden** — çok oyunculu listenin sorduğu sorunun aynısı | Oyunun içinden, kesin olarak | **Eklenti** |
| **Oyuncu listesi** | Ping'in örneklemi: sayı kesindir ama **en çok 12 ad** döner, bazı sunucular hiç ad döndürmez | UUID, ping ve oturum süresiyle birlikte tam liste | **Eklenti** |
| **Oyuncu işlemleri** (atma, mesaj, OP, gamemode, whitelist) | Pano, eklentiye vereceği konsol komutlarının aynısını oluşturur ve düğümün girdisinden gönderir | Eklenti atma ve mesajı doğrudan yapar, gerisini konsol komutu olarak çalıştırır | **Eklenti** |

Sunucu listesi ping'inden gelen bir liste, oyuncular sayfasında böyle etiketlenir: eksik bir ad
listesi işe yarar, yeter ki kimse onu tam liste sanmasın.

## Eklentiler ve modlar

| | Yalnızca düğüm | Yalnızca eklenti | İkisi birden |
| --- | --- | --- | --- |
| **Liste** | `plugins/` (ya da `mods/`) içindeki jar'lardan taranır: `plugin.yml`, `paper-plugin.yml`, `velocity-plugin.json`, `bungee.yml`, `fabric.mod.json`, `quilt.mod.json` ve `META-INF/mods.toml` | Çalışan sunucunun bildirdiği gerçek: geliştiriciler, açıklamalar ve her birinin açık olup olmadığı | Sunucu çevrimiçiyken **eklenti**, dururken **düğüm** |
| **Açma / kapatma** | `x.jar` dosyasını `x.jar.disabled` yapar ve geri alır; bir sonraki yeniden başlatmada etkili olur | Yalnızca Bukkit ailesi: çalışan sunucuda anında açılır ya da kapanır | **Eklenti** |
| **Modrinth, Hangar ya da CurseForge'dan kurma** | **Düğüm.** | Eklentinin `plugin-install` yeteneğini gerektirir | **Düğüm** |
| **Tanınmayan jar'ları tanıma, güncelleme denetimi** | **Düğüm.** | `plugin-install` gerektirir | **Düğüm** |

> **Vanilla** sunucusunun eklenti klasörü hiç yoktur; bu yüzden orada, ne bağlı olursa olsun, bu
> grubun tamamı kullanılamaz.

Dosyayı hangi taraf kurarsa kursun, çalışan bir sunucuya jar kopyalamakla hiçbir şey yüklenmez; bu
yüzden her zamanki **Yeniden başlatma gerekli** uyarısı gelir — bkz.
[Eklentiler ve modlar](../#eklentiler-ve-modlar).

## Dosyalar, yedekler ve zamanlanmış görevler

| | Yalnızca düğüm | Yalnızca eklenti | İkisi birden |
| --- | --- | --- | --- |
| **Dosyalar** — gezinme, okuma, düzenleme, yükleme, indirme | **Düğüm**, yalnızca o sunucunun klasörünün içinde | Eklentinin `files` yeteneğini gerektirir: eklenti, içinde çalıştığı sunucunun klasörünü aynı kum havuzu ve aynı yasak listesiyle sunar | **Düğüm** |
| **Yedekler** — alma, listeleme, silme | **Düğüm**, `<node-data>/backups/<sunucu-uuid>/` altına | `backups` yeteneğini gerektirir: arşiv sunucunun yanına yazılır ve **son N tanesini sakla** onu da tıpatıp aynı şekilde budar | **Düğüm** |
| **Yedeği geri yükleme** | Sunucu durdurulmuşken hemen | **Bir sonraki açılışta** — aşağıya bakın | Hemen geri yükleyen **düğüm** |
| **Zamanlanmış görevler** — cron ile yeniden başlatma, komut ve yedek | Düğüm çalıştırır; böylece Pano yeniden başlatılırken bile çalışmayı sürdürürler | Ortada düğüm yoksa eklenti çalıştırır | **Düğüm** |

### Eklentinin yaptığı geri yükleme bir sonraki açılışta gerçekleşir

Bir eklenti, içinde çalıştığı sunucunun dosyalarının üzerine yazamaz — altından zemini çekmiş olur ve
değiştirdiği dünyaların üzerine, onları hâlâ açık tutan sunucu yeniden yazar. Bu yüzden yalnızca
eklentisi olan bir sunucuda geri yükleme iki adımlıdır: eklenti `.pano/restore-pending.json` adında
bir işaret dosyası yazar ve geri yüklemenin beklemede olduğunu bildirir.

Panel, iş bitene kadar görevi **bir sonraki açılışta uygulanacak** diye gösterir. O sunucuyu biri
bir dahaki sefer açtığında eklenti arşivi, dünyalar yüklenmeden önce uygular, işaret dosyasını siler
ve Pano'ya yeniden bağlanır bağlanmaz sonucu bildirir — görev de o anda başarıyla ya da aldığı hatayla
kapanır. Düğüm bunun yerine, sunucu durdurulmuşken hemen geri yükler; arkasında düğüm olan bir
sunucunun bu iş için her zaman düğümü kullanmasının nedeni budur.

## Pano tarafı nasıl seçer

Her sunucu bir **özellikler (features)** haritası taşır ve panel de API de "bağlı" ya da "yönetilen"
ayrımına değil, o haritaya bakar. Pano haritayı, onu besleyen her şey değiştiğinde yeniden hesaplar:
bir düğüm bağlandığında ya da gittiğinde, Pano eklentisi bağlandığında ya da koptuğunda, sunucu
başlayıp durduğunda ya da eklenti bir güncellemenin ardından farklı bir yetenek listesi bildirdiğinde.
Yeni hesap, panele zaten açık olan canlı bağlantı üzerinden iletilir; yani bir kontrol, ihtiyaç
duyduğu şey gelir gelmez kullanılabilir olur.

Her özellik için kural şudur: **eklentinin daha iyi yaptığı yerde eklenti, onun dışında düğüm.**

- Yanıtın çalışan oyunun içinden gelmesi gereken her yerde **eklenti** tercih edilir: TPS, MSPT,
  yığın, gerçek oyuncu listesi, oyuncu işlemleri ve gerçekten yüklenmiş eklentilerin listesi;
- iş oyundan çok makineyle ilgiliyse **düğüm** tercih edilir: bir süreci başlatmak ve öldürmek,
  duran bir sunucunun günlüğünü okumak, dosyalar, yedekler, eklenti kurulumları ve zamanlanmış
  görevleri çalıştırmak — ayrıca eklenti yoksa, çok eskiyse ya da kapatılmışsa her durumda yedek
  çözüm düğümdür;
- birkaç şeyin tek bir kaynağı vardır ve o olmadan hiç yapılamaz: **Başlat** ile **Öldür** bir düğüm,
  **TPS** ile **MSPT** ise eklenti ister.

API uçları da panelle aynı yanıtı kullanır. Pano'dan, o anki kurulumun yapamayacağı bir şey istemek
sessizce görmezden gelinmez; "bu özellik burada kullanılamıyor" diyen açık bir yanıtla reddedilir.

## Eksik bir özellik neye benzer

**Gezinme hiçbir zaman gizlenmez.** Özelliklerinin tamamı kullanılamaz durumda olan bir bölüm yine
listede kalır, yine açılır ve neyin eksik olduğunu sayfanın kendisi söyler — sessizce kaybolan bir
sayfa, insanları onu aramaya bırakmaktan başka işe yaramaz. Sayfa içindeki tek tek kontroller de
aynı şekilde kapalı gelir ve her biri, onu geri getirecek şeyi söyleyen bir ipucu taşır:

| Ne der | Ne yapmalı |
| --- | --- |
| Şu anda bunu ne düğüm ne de Pano eklentisi yapabiliyor. | İkisinden birini ekleyin — sunucuya [Pano MC Eklentisi'ni](../../integrations/) kurun ya da sunucuyu bir düğüme taşıyın. |
| Bu sunucudaki Pano eklentisi _bölüm_ için çok eski. Sunucudaki pano-mc-plugin'i güncelle. | Oyun sunucusundaki `pano-mc-plugin`'i güncelleyin ve sunucuyu yeniden başlatın. |
| Bu sunucudaki Pano eklentisi _bölüm_ sunmuyor. Eklentinin ayarından aç ya da eklentiyi güncelle. | Oyun sunucusundaki eklentinin `config.conf` dosyasında açın (özellik eklentiden yeniyse `pano-mc-plugin`'i güncelleyin) ve sunucuyu yeniden başlatın. |
| Bu sunucuyu çalıştıran düğüm çevrimdışı; yeniden bağlanana kadar Pano bunu yapamaz. | [Düğümü](../#dugumler) geri getirin; başka bir şey gerekmez. |
| Sunucu çalışmıyor, bu yüzden içinden kimse yanıt veremez. Kullanmak için sunucuyu başlat. | Başlatın. Çalışan oyuna sorulması gereken her şey, sunucunun çalışmasını ister. |

## Eski bir eklenti yalnızca daha azını yapar

Pano eklentisi bağlanır bağlanmaz ne yapabildiğini bildirir: protokol sürümünü, kendi sürümünü ve bir
**yetenek** listesini. Güncel sürümlerde bu liste şudur:

```
console, commands, power, metrics, players, plugins, files, backups, plugin-install, schedules
```

Daha eski bir eklenti bunların daha azını bildirir — çok eskisi hiçbirini bildirmez — ve bildirmediği
her şey, varsa düğüme devredilir. Hiçbir şey bozulmaz, yeniden yapılandırılacak bir şey de yoktur:
özelliklerin daha iyi kaynağa geri dönmesi için oyun sunucusundaki jar'ı güncelleyip sunucuyu yeniden
başlatmak yeterlidir. Sunucunun genel bakış sayfası, Pano'nun gördüğü protokol ve eklenti sürümünün
yanında bildirilen yetenekleri de listeler.

Aynı hoşgörü düğüm için de geçerlidir: Pano, daha eski bir
[protokol sürümü](../pano-node/#protokol-surumu) konuşan bir arka plan sürecini kabul eder ve o
sürümün yapamadıklarını listeden çıkarır.

## Yardım gerekiyor mu?

- [SSS sayfasına](../../FAQ/) bakın
- [Discord topluluğumuzda](https://discord.gg/6vVy72wgXT) sorun
- [GitHub](https://github.com/PanoMC/Pano/issues) üzerinden bir issue açın
