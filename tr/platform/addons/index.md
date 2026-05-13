# Eklentiler (Addons/Plugins)

> ⚠️ Pano’da eklenti yönetimi için **Eklenti Yönetimi (Addon Management) izni** gerekir.  
> **Yönetici (Admin)** olarak oturum açmadıysanız, eklentiler sayfasını açmak ve eklentiler ile ilgili işlemleri gerçekleştirmek
> için **Eklenti Yönetimi erişimine** sahip olmalısınız.

Eklentiler, **Pano’nun kalbidir**.  
Minecraft sunucu yönetiminizi ve web sitesi özelliklerinizi **genişletmenize, özelleştirmenize ve geliştirmenize**
olanak tanır —  
bunun için Pano çekirdeğini değiştirmenize gerek yoktur.

Pano ekosisteminde:

- **Arka uç (backend)** bunlara **plugin** (PF4J tabanlı modüller) der.
- **Ön uç / kullanıcı arayüzü (frontend)** bunlara **addon** (yüklenebilir uzantılar) der.

İsim farklı olsa da, her ikisi de Pano’yu güçlü, esnek ve topluluk odaklı kılan **modüler sistemi** temsil eder.

## Kendi Eklentinizi Oluşturma

Bir geliştiriciyseniz ve **kendi eklentinizi oluşturmak** istiyorsanız, Pano **PF4J** tabanlı güçlü ve geliştirici dostu
bir API ve yaşam döngüsü sistemi sunar.

Eklentiler şunları yapabilir:

- Pano’nun arka ucunu yeni özellikler veya API’lerle genişletmek,
- Web sitesindeki temalara veya panele özel UI bileşenleri eklemek,
- Minecraft sunucu verileri, oyuncu bilgileri veya oyun olaylarıyla entegre olmak.

Her eklenti, meta verilerini ve bağımlılıklarını tanımlayan bir tanımlayıcıyla birlikte bir **JAR dosyası** olarak
paketlenir.  
Eklentilerinizi **Pano Mağazası** üzerinden herkese açık olarak veya kendi sunucularınızda özel olarak dağıtabilirsiniz.

 Eklenti oluşturmayı, derlemeyi ve yayınlamayı öğrenin:
 [Eklenti Geliştirme Rehberi →](../../addon/getting-started)

## Neden Eklentiler Önemlidir

Pano, sadece bir uygulama değil, bir **platform** olarak tasarlanmıştır.  
Bu, giriş entegrasyonlarından analiz panolarına kadar her özelliğin bir **eklenti** olarak geliştirilebileceği anlamına
gelir.

Eklentiler önemlidir çünkü:

- **Yeni işlevler eklemenizi** sağlar, çekirdek koda dokunmanıza gerek kalmaz.
- Topluluğun **özelleştirilmiş özellikleri paylaşmasına veya satmasına** izin verir.
- Sisteminizi modüler ve kolay bakım yapılabilir hale getirir.
- **Pano Marketplace** üzerinden otomatik güncelleme ve uyumluluk kontrollerini etkinleştirir.

Eklentiler sayesinde, Pano kurulumunuz sunucunuzun ihtiyaçlarına göre evrilir —  
basit web uzantılarından derin oyun içi entegrasyonlara kadar.

## Eklentiler Nasıl Çalışır (Kapsamlı Bakış)

Pano’nun eklenti sistemi, **[PF4J](https://pf4j.org)** — bilinen bir Java eklenti çerçevesi — tarafından desteklenir.  
Her eklenti, kendi meta verilerini, bağımlılıklarını ve yaşam döngüsü yöneticilerini içeren **bağımsız bir JAR
dosyasıdır**.

Pano başlatıldığında:

1. **plugins** dizinini (veya `-Dpf4j.pluginsDir` ile belirtilen yolu) tarar.
2. Bulunan her eklenti JAR dosyasını yükler ve doğrular.
3. Eklentiler arasındaki bağımlılıklar (`plugin-id` ve `dependencies`) otomatik olarak çözülür.
4. PF4J yapılandırmasına ve Pano’nun iç yöneticisine göre eklentiler **etkinleştirilir** veya **devre dışı bırakılır**.

Varsayılan olarak özel bir yol belirtmezseniz:

```bash
java -jar Pano-<version>.jar
```

Pano, JAR dosyasıyla aynı klasörde otomatik olarak bir `plugins/` dizini oluşturur ve kullanır.

Bu dizini değiştirmek için:

```bash
java -Dpf4j.pluginsDir=/path/to/custom/plugins -jar Pano-<version>.jar
```

## Eklenti Yükleme

Eklentileri yüklemenin **iki yolu** vardır:

### 1. Bilgisayarınızdan (Yerel)

1. **Yönetim Paneli → Eklentiler** sayfasını açın.
2. **Eklenti Yükle** butonuna tıklayın — bir modal pencere açılacaktır.
3. Eklenti JAR dosyanızı **sürükleyip bırakın** veya **Dosya Seç** ile manuel yükleyin.
4. Kurulum tamamlandığında, yeni eklentiniz listede görünecektir.

### 2. Pano Mağazasından

1. Aynı **Eklenti Yükle** penceresinde **Mağazaya Göz At** sekmesine tıklayın.
2. Kullanmak istediğiniz eklentiyi bulun — ücretsiz veya ücretli olabilir.
3. **Yükle** butonuna tıklayın.
4. Kurulum tamamlandığında, eklentiniz otomatik olarak etkin olacaktır.

Yeni eklentileri keşfedebilir, premium olanları satın alabilir veya mevcutları güncelleyebilirsiniz — hepsi doğrudan
**Pano Mağazası** üzerinden.

> Marketplace özelliği için bağlı bir [Pano Hesabı](./advanced/connect-pano-account.md) gereklidir.
>
> ⚠️ Pano tarafından doğrulanmamış herhangi bir eklenti riskli olabilir, **kendi sorumluluğunuzda kullanın!**

## Eklentileri Etkinleştirme veya Devre Dışı Bırakma

Eklentileri etkinleştirmenin veya devre dışı bırakmanın iki yolu vardır:

### 1. PF4J Üzerinden (Dosya Bazlı)

`plugins/` klasörünüzde, PF4J eklentilerin durumunu belirten meta veriler saklar.  
Bir eklentiyi manuel olarak devre dışı bırakmak için klasörün içine bir `disabled.txt` dosyası ekleyebilirsiniz —  
ancak bu yöntem yalnızca ileri düzey kullanıcılar içindir.

### 2. Yönetim Paneli Üzerinden (Önerilen)

**Panel → Eklentiler** sayfasına gidin ve eklentinin anahtarını **Etkin / Devre Dışı** olarak değiştirin.  
Devre dışı bırakıldığında:

- Eklenti durur ve artık yüklenmez.
- Bağımlı olan diğer eklentiler de **otomatik olarak devre dışı bırakılır**.

Yeniden etkinleştirildiğinde:

- Uyumluluk durumuna göre bağımlı eklentiler de yeniden etkinleşir.

> Bir eklentiyi etkinleştirirken hata oluşursa, Pano konsolunda hata kayıtlarını kontrol edin ve gerekirse
> geliştiriciye bildirin.

## ⚠️ Eklenti Sürüm Düşürme (Downgrade)

Teknik olarak mümkün olsa da, bir eklentinin eski sürümünü yüklemek (**downgrade**) **önerilmez**.

Sürüm düşürme şu sorunlara yol açabilir:

- Uyumluluk hataları
- Bozuk bağımlılıklar
- Veri kaybı veya sistem kararsızlığı

Eğer yapmak zorundaysanız, emin olun ki:

1. Veritabanı ve yapılandırmanın **tam yedeğini** aldınız.
2. Eski sürümün belgeleriyle uyumluluğu kontrol ettiniz.

> Yalnızca tamamen emin olduğunuzda devam edin — aksi halde Pano’yu yeniden kurmanız gerekebilir.
>
> Geliştiricilerimizin bu karara uymasını rica ediyoruz, ancak her zaman çalışacağının garantisi yoktur!

## Eklenti Silme

Bir eklentiyi sildiğinizde:

- Ona **bağımlı olan tüm eklentiler de otomatik olarak kaldırılır**.
- Bu, sistemin kararlı kalmasını ve sahipsiz bağımlılıkların olmamasını sağlar.

Silmek için:

1. **Panel → Eklentiler** sayfasına gidin.
2. İlgili eklentiye tıklayın ve detay sayfasındaki **Sil** düğmesine tıklayın.
3. İşlemi onaylayın — kaldırılacak bağımlı eklentiler listelenecektir.

> Bir eklentinin silinmeden önce kendi verilerini temizlemesi beklenir. Ancak her zaman küçük artıklar kalabilir!

## Eklenti Dizini Görünümü

Pano ve eklentiler için örnek dosya yapısı:

```
/pano/
├── Pano-1.0.0.jar
├── config.conf
├── plugins/
│    ├── disabled.txt (opsiyonel)
│    ├── pano-announcements-plugin/
│    │     └── plugin.conf
│    ├── pano-auth-integrations-plugin/
│    │     └── plugin.conf
│    ├── pano-announcements-plugin.jar
│    ├── pano-auth-integrations-plugin.jar
│    └── pano-feedback-plugin.jar
├── themes/
└── file-uploads/
```

## Özet

| İşlem                         | Konum                                         | Önerilen Yöntem                      |
|-------------------------------|-----------------------------------------------|--------------------------------------|
| **Eklenti Yükle (yerel)**     | `Panel → Eklentiler → Eklenti Yükle`          | Sürükle & bırak veya dosya seçici    |
| **Eklenti Yükle (mağaza)**    | `Panel → Eklentiler → Eklenti Yükle → Mağaza` | Yükle butonu                         |
| **Etkinleştir / Devre Dışı**  | `Panel → Eklentiler`                          | Anahtarı değiştir                    |
| **Eklenti Sil**               | `Panel → Eklentiler`                          | Onay ile silme işlemi                |
| **Eklenti Dizinini Değiştir** | JVM parametresi                               | `-Dpf4j.pluginsDir=/path/to/plugins` |

## Gelişmiş Notlar

- Eklentiler, platformun API’leri aracılığıyla hem **arka uç mantığını** hem de **ön uç bileşenlerini** ortaya
  çıkarabilir.
- Bazı eklentiler **özel rotalar, API uç noktaları veya UI bileşenleri** kaydedebilir.
- Çakışmalar veya eksik bağımlılıklar yaşarsanız, **logs** klasöründeki PF4J hata mesajlarını kontrol edin.

> Eklentiler, Pano’yu *canlı* hale getirir — kurulumunuzu topluluğunuzla birlikte büyüyen, özelleştirilebilir bir
> platforma dönüştürür.
