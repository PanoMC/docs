# Başkaları için Pano Instance Barındırma

Pano'yu başkaları için — arkadaşlarınız, müşterileriniz, bir topluluk ağı — çalıştırıyorsanız her
birinin, başkasınınkine dokunmadan yönetebileceği, güncelleyebileceği ve yedekleyebileceği kendi
Pano'su olmalıdır. Bu sayfalar [Pano Host](https://panomc.com/host)'un kullandığı modeli anlatır. Aynı
modeli kendi sunucularınızda da uygulayabilirsiniz.

- Bu sayfa: bir instance = bir konteyner + bir veritabanı, `/data` içindeki sürüm, sürümler.
- [İzolasyon](isolation/): konteyner sıkılaştırma, ağlar, veritabanı kullanıcıları, giden trafik, e-posta, kotalar.
- [İşletim](operations/): güncelleme ve geri alma, yedekler, çökmeler, loglar.

> [!WARNING]
> **Henüz yayınlanmadı.** Bu sayfalar henüz hiçbir Pano sürümünde olmayan
> [konteyner imajlarına ve konteyner moduna](../containers/) dayanır. Ayrıntılar yayından önce değişebilir.

## Instance başına bir konteyner ve bir veritabanı {#model}

Her Pano Instance'ın şunları olur:

| Parça | Instance başına | Paylaşılan |
| --- | --- | --- |
| Konteyner | bir tane, `ghcr.io/panomc/pano-runtime:jre<N>` imajından | — |
| Veri birimi | `/data` olarak bağlanan kendi klasörü | — |
| Veritabanı | kendi veritabanı ve veritabanı kullanıcıları | MySQL / MariaDB sunucusu |
| Ağ | kendi Docker ağı | reverse proxy, veritabanı ve e-posta relay'i bu ağa bağlanır |
| Disk | kendi kotası | — |

İki instance'ı asla tek konteynerde çalıştırmayın ve bir veritabanını paylaştırmayın: her instance tek
başına taşınabilmeli, geri yüklenebilmeli ve silinebilmelidir.

Pano Host her şeyi müşteri girdisine göre değil, iç instance kimliğine göre adlandırır. Örneğin
konteyner ve ağ `pw-<id>`, veritabanı `w_<id>` olur. Müşterinin seçtiği adlar yalnızca alan adlarında
ve arayüzde görünür.

## Sürüm `/data` içinde durur {#release-in-data}

`pano-runtime` imajında imaj yalnızca Java'yı ve bir başlatıcıyı içerir. Pano sürümünün kendisi — jar
ve arayüzleri — instance'ın `/data` klasöründe `config.conf`, eklentiler, temalar ve yüklemelerle
birlikte durur:

1. Seçilen sürümün jar'ını ve arayüzlerini
   [`PanoMC/Pano` GitHub sürümünden](https://github.com/PanoMC/Pano/releases) indirin, sha256'larını
   kontrol edin.
2. Bunları instance'ın `/data` klasörüne koyun ve jar'ın dosya adını `/data/.pano-jar` dosyasına yazın.
3. Konteyneri başlatın. Başlatıcı `.pano-jar` içinde adı geçen jar'ı çalıştırır.

Bu, yalnızca imajı derlenmiş sürümler için değil, **geçmişteki her Pano sürümü** için çalışır. Pano'nun
kendi panelinden yapılan güncellemeler de `/data` içine yazılır, yeniden başlatmadan sonra korunur.
Bkz. [Konteyner modu](../containers/runtime/#container-mode).

Çalışan sürümü instance'ın API'sinden değil, `/data` içindeki jar'ın manifest'inden okuyun. Instance
başkasına aittir, bu yüzden ona güvenilemez (bkz. [İzolasyon](isolation/)).

## Sürümler {#versions}

- Sahibinin, instance oluşturulurken herhangi bir kanalı (alpha, beta, stable) ve herhangi bir sürümü
  seçmesine izin verin. Pano Host varsayılan olarak en son stable sürümü kullanır.
- Güncellemeyi zorlamayın. "Güncelleme mevcut" gösterin; sahibi güncellesin ya da otomatik
  güncellemeyi açsın. Bkz. [İşletim](operations/#updates-and-rollback).
- Java sürümünü instance başına seçin. Runtime ailesinde Pano'nun minimumu olan **Java 11** her zaman
  vardır; daha yenileri kabul edilir, daha eskileri reddedilir. Pano Host yeni instance'ları seçilen
  Pano sürümünün gerektirdiği minimumla başlatır ve sahiplerin daha yenisini seçmesine izin verir
  (örneğin Java 21 isteyen bir eklenti için). Bkz. [Java sürümü](../containers/runtime/#java-version).
- Heap'i konteynerin bellek sınırından belirleyin. Pano Host instance belleğinin yaklaşık %75'ini
  ayırır ve sahiplerin kendi JVM argümanlarıyla heap'i artırmasına izin vermez. Bkz.
  [Bellek](../containers/runtime/#memory).

## Yapılandırma

Veritabanı ve SMTP ayarlarını [ortam değişkenleri](../containers/configuration/#environment-variables)
olarak verin. Pano bunları ilk açılışta `config.conf` dosyasına yazar. Pano kapanırken `config.conf`
dosyasını yeniden yazar; elle değiştirmeniz gerekirse önce konteyneri durdurun, düzenleyin, sonra
başlatın.

Pano Host ayrıca `PANO_HOSTED` ve diğer [Pano Host değişkenlerini](../containers/configuration/#pano-host-variables)
ayarlar. Bunlar yalnızca bilgilendirme amaçlıdır: destekleyen Pano sürümleri "Pano Host tarafından
yönetiliyor" yazısı ve bir kota bandı gösterir. Pano içinde hiçbir şey bunlar yüzünden kilitlenmez.
