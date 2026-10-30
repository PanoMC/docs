# Kurulum Sihirbazı

![](/img/installer-view.png)

Pano başlatıldıktan sonra tarayıcınızı açın ve şu adrese gidin:

```
http://<sunucu-ip-adresiniz>/
```

> Adres, Pano'yu nasıl kurduğunuza bağlıdır: [tek komutla kurulum](../installer/) ve [Docker](../../containers/) **8088** portunu kullanır (`http://<sunucu-ip-adresiniz>:8088/`), elle çalıştırılan [`.jar`](../manual/) ise **80** portunu. Bu portun açık olduğundan ve başka bir uygulama tarafından kullanılmadığından emin olun.

> `--mariadb` veya Docker Compose ile mi kurdunuz? Veritabanı adımı önceden doldurulmuştur; şifreyi korumak için şifre alanını boş bırakın.

> [!IMPORTANT]
> **Cloudflare mi kullanıyorsunuz?** Pano varsayılan olarak 80 numaralı portta düz HTTP servis eder; bu nedenle Cloudflare'de **SSL/TLS modu: Flexible** olarak ayarlanmalıdır — aksi takdirde alan adınızı açtığınızda yönlendirme döngüleri veya `521`/`525` hataları alırsınız. Devam etmeden önce ayrıntılı [Cloudflare rehberini →](../../advanced/cloudflare/) okuyun.

Ekranda sizi beş basit adımdan geçiren **Kurulum Sihirbazı** görünecektir:

1. **Dil Seçimi ve Kullanım Şekli**  
   Tercih ettiğiniz dili seçin; ardından aynı ekranda **"Pano'yu nasıl kullanacaksınız?"** sorusunu yanıtlayın:
   - **Web sitesi** — yalnızca herkese açık bir web sitesi (klasik Pano deneyimi).
   - **Sunucu yönetimi** — yalnızca Minecraft sunucu yönetimi: asıl ürün paneldir, **Yazılar**, **Talepler** ve **Görünüm** (temalar) kapatılır ve herkese açık sayfalar `/panel` adresine yönlendirilir.
   - **Her ikisi** — web sitesi + sunucu yönetimi. Önerilen seçenektir ve hazır olarak seçili gelir.

   Bu seçim kalıcı değildir — daha sonra **Panel → Ayarlar → Platform → Tercihler** bölümünden değiştirebilirsiniz. Seçiminiz `config.conf` dosyasında [`usage-mode`](../../configuration/#genel-ayarlar) anahtarı olarak saklanır.  
   <small>*(Devam ederek, Pano'nun Kullanım Koşullarını ve Gizlilik Politikasını kabul etmiş sayılırsınız.)*</small>

2. **Web Sitesi Ayarları**  
   Site adı, URL gibi web sitesi bilgilerini girin.  
   **Sunucu yönetimi** modunda bu adım site adı yerine bir **panel adı** ister ve açıklama alanını gizler.

3. **Veritabanı Ayarları**  
   **MySQL** veya **MariaDB** bilgilerinizi girin.  
   Varsayılan tablo ön eki: `pano_` (isterseniz değiştirebilirsiniz).  
   > **Portable DB Seçeneği:** Windows, macOS ve Linux sistemlerde (x64, ARM ve diğer çoğu mimari), **Portable Database** kullanma seçeneğini göreceksiniz. Bunu seçmek, Pano'nun sizin için otomatik olarak taşınabilir bir MariaDB örneği indirmesine, yapılandırmasına ve yönetmesine neden olacaktır.

4. **SMTP Ayarları (Opsiyonel)**  
   E-posta gönderimi için SMTP ayarlarını yapabilirsiniz.  
   Bu adım **isteğe bağlıdır** ve atlamak isterseniz **endişelenmeyin!**  
   Daha sonra **Panel → Ayarlar → Platform** bölümünden SMTP ayarlarını yeniden etkinleştirebilir veya güncelleyebilirsiniz.  
   *(Ancak yapılandırılmazsa “şifremi unuttum” gibi bazı özellikler çalışmayabilir.)*  
   E-posta sunucunuz yok mu? Burada **Pano Mail**'i seçin: Pano hesabınızla giriş yapın, e-posta ayar gerekmeden, ücretsiz ve hemen çalışır. Bkz. [Pano Mail](../../configuration/services/#pano-mail).

5. **Hesap Bağlama ve Yönetici Oluşturma**
    - Zaten bir **Pano Hesabınız** varsa, **Bağlan (Connect)** düğmesine tıklayarak hesabınızı bağlayabilirsiniz — e-posta ve kullanıcı adınız otomatik doldurulur.
    - Eğer hesabınız yoksa, yeni bir **yönetici (admin) hesabı** oluşturun.  
      (Şifrenizi unutmayın, panele giriş için gereklidir.)
    - Hesap bağlıysa **Ücretsiz Pano Backup ile günlük yedek al** kutusunu işaretleyerek ilk günden günlük yedek alabilirsiniz. Bkz. [Yedekler](../../backups/).

> Başka bir Pano'dan mı taşınıyorsunuz? Sihirbazdaki **Transfer Et** düğmesi **Yedek dosyasından geri yükle** seçeneğini sunar: bir `.panoarc` dosyası seçin, Pano o siteyi geri yükler. Bkz. [Yedekler](../../backups/#download).

Kurulumu tamamlamak için **Tamamla (Finish)** butonuna basın.  
Pano kurulumu sonlandıracak ve otomatik olarak yeni **yönetici panelinize** yönlendirecektir.

> *Artık yazılar oluşturabilir, Minecraft sunucunuzu bağlayabilir, eklentiler kurabilir, temalar değiştirebilir ve çok daha fazlasını yapabilirsiniz!*

## Minecraft Sunucunuzu Bağlama (Opsiyonel) {#connect-minecraft}

Oyun entegrasyonlarını etkinleştirmek ve Minecraft sunucunuzu Pano'ya bağlamak için **Pano MC Eklentisi**ni kurmanız gerekir.

### Pano MC Eklentisi Nedir?

Pano MC Eklentisi, Minecraft sunucunuz ile Pano arasında bir köprü görevi görür ve şunları sağlar:
- Güvenli WebSocket iletişimi (RSA + AES-256 şifreleme)
- Gerçek zamanlı oyuncu verisi senkronizasyonu
- Otomatik eklenti tespit ve entegrasyon (AuthMe, izinler, vb.)
- Oyun içinden web'e iletişim için etkinlik sistemi

### Kurulum Adımları

1. **Eklentiyi İndirin**
   - [Pano MC Eklentisi Releases](https://github.com/PanoMC/pano-mc-plugin/releases) sayfasını ziyaret edin
   - Sunucu platformunuza uygun JAR dosyasını indirin:
     - `pano-spigot-<sürüm>.jar` — Spigot/Paper/Folia için
     - `pano-bungeecord-<sürüm>.jar` — Bungeecord için
     - `pano-velocity-<sürüm>.jar` — Velocity için
     - `pano-fabric-<sürüm>.jar` — Fabric için (`mods/` klasörüne konur)

2. **Eklentiyi Kurun**
   - İndirdiğiniz JAR dosyasını sunucunuzun `plugins/` klasörüne yerleştirin
   - Minecraft sunucunuzu yeniden başlatın

3. **Pano'ya Bağlanın**
   - Yeniden başlatma sonrası **Pano Yönetici Panelinizi** açın
   - Üst çubuktaki **sunucu seçiciyi** açın
   - Yanındaki **+** butonuna tıklayarak yeni sunucu ekleyin
   - Açılan bağlantı modalında adım adım talimatları göreceksiniz
   - Modal'da gösterilen adımları takip ederek Minecraft sunucunuzu bağlayın
   - Eklenti otomatik olarak güvenli şifreli bağlantı kuracaktır

4. **Bağlantıyı Doğrulayın**
   - Bağlandıktan sonra sunucunuz sunucu seçicinin listesinde görünecektir
   - Sunucu durumunu (çevrimiçi/çevrimdışı), oyuncu sayısını ve diğer bilgileri görebilirsiniz
   - Bağlantı artık aktif ve entegrasyonlar için hazır

> **Not:** Tek bir Pano örneğine birden fazla Minecraft sunucusu bağlayabilirsiniz.

Desteklenen platformlar: Spigot, Paper, Folia, Purpur, Bungeecord, Velocity ve Fabric.

### Sırada Ne Var?

Sunucunuz bağlandıktan sonra şunları yapabilirsiniz:
- [Oyun entegrasyonlarını](../../integrations/) etkinleştirin (AuthMeReloaded gibi)
- Gerçek zamanlı oyuncu istatistiklerini görüntüleyin
- Oyuncuları web panelinden yönetin
- Oyun içi etkinlikleri web sitenizle senkronize edin
