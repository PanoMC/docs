# Kullanım Verileri (Telemetri)

Çalışan bir Pano kurulumu, günde bir kez kendisi hakkında kısa bir rapor **panomc.com**'a gönderir. Buna **kullanım
verileri** diyoruz. Bu rapor bize sahada hangi Pano sürümlerinin, temaların ve eklentilerin gerçekten kullanıldığını
söyler; böylece zamanımızı insanların gerçekten çalıştırdığı şeylere ayırabilir ve bağımlı oldukları şeyleri
bozmaktan kaçınabiliriz.

Bu sayfa, raporun **tam olarak** neleri içerdiğini ve nasıl kapatılacağını anlatır. Burada gizli saklı bir şey yok:
aynı bilgiler [Gizlilik Politikası](https://panomc.com/privacy-policy)'nda da yazılıdır.

> Kullanım verileri **anonim değildir**. Web sitesi adresinizi, sunucunuzun IP adresini ve bu adresten türetilen ülke
> bilgisini içerir. Bu sizin kurulumunuz için uygun değilse kapatın — aşağıdaki [Kapatma](#kapatma) bölümüne bakın.

## Neden toplanıyor

- **Kullanımı anlamak** — kaç kurulumun etkin olduğu ve nasıl yapılandırıldıkları.
- **Geliştirme önceliklerini belirlemek** — gerçekten kullanılan sürümler, temalar ve eklentiler önce ele alınır.
- **Uyumluluk ve güvenlik kararları** — hangi Java sürümlerinin ve işletim sistemlerinin hâlâ sahada olduğunu bilmek,
  bir desteği ne zaman güvenle bırakabileceğimizi ve güvenlik açığı olan bir sürüm hakkında kimlerin uyarılması
  gerektiğini gösterir.
- **Toplu genel istatistikler** — örneğin etkin Pano kurulumlarının sayısı.

## Neler gönderiliyor

Her günlük rapor şunları içerir:

- Kullanılan **Pano sürümü, aşaması ve sürüm kanalı**.
- Kurulumun çalıştığı **Java sürümü** ve **işletim sistemi**.
- Kuruluma ayrılmış **işlemci ve bellek** bilgisi.
- **Web sitesi adresi** ve **alan adı**.
- **Sunucunun IP adresi** ve bu adresten türetilen **ülke** bilgisi.
- **Etkin tema** ve **kurulu eklentiler** ile sürümleri.
- **Toplam sayılar** — kayıtlı kullanıcı, gönderi, açık destek talebi, bağlı Minecraft sunucusu ve çevrim içi oyuncu
  sayıları.
- **Sunucu yönetimi kullanımı** — kullanım kipi, kaç bağlı ve kaç yönetilen sunucu ile kaç düğüm bulunduğu (ve bu
  düğümlerin kaçının çevrim içi olduğu), ayrıca son 24 saatte kaç konsol komutu çalıştırıldığı ve kaç yedek
  alındığı. Yalnızca sayılar: sunucu adı, adresi, yazılımı veya düğüm adresi hiçbir zaman gönderilmez.
- Kuruluma bir **panomc.com hesabının** bağlı olup olmadığı.
- **Kurulum tarihi** ve **rastgele oluşturulmuş bir kurulum kimliği**.

Rapor **hiçbir zaman** kullanıcı hesaplarını, e-posta adreslerini, parolaları, site içeriklerini veya herhangi bir
kimlik bilgisini içermez — sunucunuzdan hiçbir veritabanı kaydı çıkmaz. Yukarıdaki sayılar yalnızca sayıdır, arkasındaki
kayıtlar değil.

Ham raporlar **13 ay** boyunca saklanır. Tek bir kuruluma geri götürülemeyen toplu istatistikler ise süresiz olarak
saklanır.

## Ne zaman gönderiliyor

- Kurulum çalıştığı sürece **günde bir kez**.
- Bir oturumun ilk raporu, **Pano başladıktan 5 dakika sonra** gönderilir; bu sayede kısa bir yeniden başlatma hiçbir
  zaman rapor üretmez.
- Geliştirme ve demo sürümlerinden **hiçbir zaman** gönderilmez; bu sürümler ayar ne olursa olsun tamamen hariç
  tutulur.

## Kapatma

Kullanım verileri varsayılan olarak açıktır ve site sahibi bunu üç yerden kapatabilir. Üçü de aynı değeri ayarlar.

### 1. Kurulum sırasında

Kurulum sihirbazında bir **kullanım verileri** onay kutusu bulunur. Bu kutunun işaretini kaldırırsanız bu kurulumdan
hiçbir zaman rapor gönderilmez.

### 2. Panelden

**Panel → Ayarlar → Platform** bölümüne gidin ve **kullanım verileri** anahtarını kapatın. Zaten çalışan bir kurulumda
en kolay yol budur.

### 3. Yapılandırma dosyasından

`config.conf` dosyasındaki `telemetry` bloğunu ekleyin veya düzenleyin:

```jsonc
telemetry {
    enabled = false
}
```

`config.conf` **anında yeniden yüklenir**: Pano değişikliği kendisi algılar, bu yüzden dosyayı düzenledikten sonra
kurulumu yeniden başlatmanıza gerek yoktur.

## Gizlilik

[Pano Gizlilik Politikası](https://panomc.com/privacy-policy)'nın **Kendi Sunucusunda Barındırılan Pano
Kurulumlarından Gelen Kullanım Verileri** bölümü bu verileri, hangi amaçlarla kullanıldıklarını ve ne kadar süreyle
saklandıklarını açıklar. Veriler yalnızca Pano tarafından, Avrupa Birliği'nde bulunan sunucularda işlenir; üçüncü
taraflarla paylaşılmaz ve satılmaz.
