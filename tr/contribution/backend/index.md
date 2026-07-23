# Backend Geliştirme

Pano backend'i platformun kalbidir. API isteklerini yönetir, veritabanını idare eder, UI yaşam döngülerini kontrol eder ve Minecraft sunucularıyla iletişim kurar.

Dokümantasyon genelinde proje; **Pano Platform**, **Pano Core Platform** veya **Pano Web Platform** olarak anılabilir.

## Depo Uygulamaları

Ana [**Pano Core**](https://github.com/PanoMC/Pano) deposu aslında iki ayrı uygulama barındırır:

1. **Pano Core**: Tüm web ve sunucu yönetimi mantığını yürüten ana platform.
2. **Updater**: Ana platformu güncellemekten sorumlu ikincil uygulama. Pano ile birlikte derlenir ve nihai `.jar` dosyası içine eklenir. Sadece güncelleme işlemi sırasında çalışır.

## Teknoloji Yığını
- **Dil**: Kotlin
- **Framework**: Vert.x (Olay tabanlı, engellemesiz)
- **Bağımlılık Enjeksiyonu**: Spring DI
- **Veritabanı**: Güncel bir MariaDB/MySQL (MariaDB 10.6+ / MySQL 8+)

## Mimari
Backend, modüler ve esnek bir yapıda tasarlanmıştır. Özelliklerin dinamik olarak eklenebileceği veya kaldırılabileceği bir eklenti (plugin) sistemini destekler.

### UI ve Arayüz Yönetimi
**UI Manager**, arayüzlerin nasıl sunulduğunu yönetir. Başlangıçta kurulu temaları tarar ve **Setup Manager**'a danışır. Kurulum durumuna göre ya `setup-ui`'ı ya da ana web arayüzünü ayağa kaldırır.

### Komut Sistemi
Pano, başlatma sırasında aktive olan güçlü bir komut satırı sistemine sahiptir:
- **Komut Geçmişi (Command History)**: Önceki komutlar arasında gezinmeye olanak tanır.
- **Varsayılan Tanımlamalar**: Platformun başlatıldığı andan itibaren yönetilebilir olması için çekirdek komutlar önceden tanımlanmıştır.

### Grafik Arayüzü (GUI)
Pano varsayılan olarak bir grafik kullanıcı arayüzü ile başlar. Sunucu ortamlarında terminal üzerinden (headless) çalıştırmak için `-nogui` argümanını kullanın:
```bash
java -jar Pano.jar -nogui
```

### Bağımlılık Enjeksiyonu (Spring DI)
Bileşen yönetimi için **Spring DI** kullanıyoruz. Tüm bean'ler, kullanım gereksinimlerine göre `SpringConfig` içinde tanımlanır. Başlangıç süresini optimize etmek için uygun yerlerde **Lazy Loading** (`@Lazy`) kullanılır.

### Arayüz İlklendirme (`init-ui`)
`init-ui` yapılandırması açıkça `false` yapılmadığı sürece, Pano depoda bulunan varsayılan arayüzleri otomatik olarak ayağa kaldırır.
- **Proxy İşlemi**: Pano'nun ters proxy'si, dışarıda açık başka arayüzler olsa dahi sadece bu yönetilen örneklere trafik yönlendirir.
- **Geliştirme Ortamı Notu**: Eğer `init-ui` aktifse ve Pano düzgün kapatılmazsa (çökme veya zorla kapatma gibi), arayüzlerin arkasındaki **Bun** servisleri arkaplanda açık kalmaya devam edebilir.

### Eklenti Yaşam Döngüsü ve PF4J
Pano, güçlü eklenti sistemi için [**PF4J**](https://pf4j.org/) (Plugin Framework for Java) kullanır. Eklenti yaşam döngüsü `PluginManager` tarafından yönetilir:

1. **Başlatma**: Pano Core hazır olduktan sonra `PluginManager` tüm eklentileri ilklendirir. Eğer bir eklenti devre dışı (disabled) değilse ve gerekli gereksinimleri (requirements) karşılıyorsa, `start()` metodu otomatik olarak çağrılır.
2. **Kapatma**: Platform kapatılırken, `PluginManager` her aktif eklenti için `stop()` metodunu çağırarak güvenli bir çıkış sağlar.

Her backend eklentisi `PanoPlugin` sınıfını genişletir (bu sınıf PF4J `Plugin` arayüzünü uygular).

### Bağlam (Context) Yönetimi
- `applicationContext`: Ana ana bilgisayar bağlamı.
- `pluginBeanContext`: Tek bir eklentiye özgü bağlam.
- `pluginGlobalBeanContext`: Tüm eklentiler arasında paylaşılan bağlam.

## Geliştirme Akışı

::: warning İLK ÇALIŞTIRMA YAPILANDIRMASI
Pano'yu ilk kez çalıştırdıktan sonra, kurulumu tamamlamadan **önce** uygulamayı kapatmanızı şiddetle öneririz. Oluşturulan `config.conf` dosyasını açın ve çakışmaları önlemek ve sorunsuz bir geliştirme deneyimi sağlamak için portu `8088` olarak değiştirin.
:::

1. **Core'u Klonlayın**: `https://github.com/PanoMC/Pano`
2. **Ortamı Kurun**: JDK 17+ (testler JDK 21 üzerinde çalışır) ve güncel bir MariaDB/MySQL örneğine sahip olduğunuzdan emin olun.
3. **Derleme**: Projeyi derlemek için `./gradlew build` kullanın.
4. **Çalıştırma**: Oluşturulan JAR'ı çalıştırın veya geliştirme için `./gradlew run -Pnogui` komutunu kullanın (Gradle ile JAR oluşturmadan çalıştırır).

### Geliştirme Modu (-Pdev)
`--dev` parametresi (veya Gradle ile `-Pdev`) kullanıldığında platform dahili geliştirme sunucularımıza bağlanır. Lütfen unutmayın:
- Bu parametre sadece **kurulum henüz yapılmamışsa** geçerlidir.
- Bu sunuculara erişim sadece yetkili kişilerle sınırlandırılmıştır.
- Test veya çekirdek geliştirme için erişime ihtiyacınız varsa [Discord](https://panomc.com/discord) üzerinden bizimle iletişime geçin.
- Yetki, duruma göre değerlendirilir ve herkese koşulsuz şartsız verilmez.

### Aktivite Günlükleri ve İzinler
Tüm yönetimsel API uç noktaları **Aktivite Günlükleri** (Activity Logs) tanımlamalı ve `PanelPermission` sınıfını genişleterek **İzin** sistemini kullanmalıdır.

---

Yardıma mı ihtiyacınız var? [Discord](https://panomc.com/discord) kanalımıza katılın veya GitHub'da bir konu (issue) açın.
