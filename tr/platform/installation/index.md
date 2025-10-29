# Pano'yu Yükleme

Bu rehberi takip ederek **Pano**’yu kurabilir ve Minecraft sunucunuzda birkaç dakika içinde çalışır hale getirebilirsiniz.

## ⚙️ Gereksinimler

Pano’yu kurmadan önce aşağıdaki gereksinimlerin karşılandığından emin olun:

1. **Java (JVM 9+)**
    - Pano, Java 9 veya üzeri sürümlerde çalışır.
    - **JDK** veya **JRE**’nin kurulu olduğundan ve komut satırında erişilebilir olduğundan emin olun.
    - [→ Java’yı İndir](https://www.oracle.com/java/technologies/javase-downloads.html)

2. **MySQL 5.5+ veya MariaDB**
    - Verilerinizi saklamak için bir MySQL veya MariaDB veritabanı gereklidir.
    - Varsayılan tablo ön eki: `pano_` (kurulum sırasında değiştirilebilir).
    - [→ MySQL Kurulum Rehberi](https://dev.mysql.com/doc/mysql-installation-excerpt/5.7/en/)

3. **İnternet Bağlantısı**
    - Kurulum sırasında **aktif bir internet bağlantısı** gereklidir, çünkü Pano ilk kaynakları ve bağımlılıkları indirir.

4. **80 Numaralı Port (HTTP) Açık Olmalı**
    - Uzak bir sunucuya kurulum yapıyorsanız, TCP port **80**’in açık ve erişilebilir olduğundan emin olun.

## 📦 Pano’yu İndirme

Pano’nun en son sürümünü resmi web sitesinden indirebilirsiniz:

- [En Son Sürümü İndir →](https://panomc.com/download)
- Daha eski sürümler için [GitHub Releases](https://github.com/your-repo/Pano/releases) sayfasını ziyaret edin.

Pano, **`.jar`** dosyası olarak dağıtılır — tıpkı **Spigot** veya **Paper** gibi.  
İndirdikten sonra dosyayı uygun bir klasöre (örneğin `/pano`) kaydedin.

## 🚀 Pano’yu Çalıştırma

Pano’yu başlatmak için terminali (veya komut istemini) açın ve şu komutu girin:

```bash
java -jar Pano-<version>.jar
```

Eğer sisteminizde bir masaüstü ortamı varsa, **Pano otomatik olarak GUI (grafik arayüz)** ile açılacaktır.  
Aksi halde, **konsol modu** ile devam eder.

### 🖥️ GUI Davranışı

- `.jar` dosyasına **çift tıklamak**, GUI’yi otomatik olarak başlatmayı dener.
- Konsol modunda çalıştırmak isterseniz şu komutu kullanabilirsiniz:

  ```bash
  java -jar Pano-<version>.jar -nogui
  ```

- GUI’nin içinde, yalnızca **Pano komutlarını** çalıştırabileceğiniz küçük bir konsol yer alır.

GUI başlatılamazsa (örneğin, masaüstü ortamı olmayan bir sunucuda), konsol modu otomatik olarak devam eder.

## 🧭 Kurulum Sihirbazı (Adım Adım)

![](/img/installer-view.png)

Pano başlatıldıktan sonra tarayıcınızı açın ve şu adrese gidin:

```
http://<sunucu-ip-adresiniz>/
```

> Port **80**’in açık olduğundan ve başka bir uygulama tarafından kullanılmadığından emin olun.

Ekranda sizi beş basit adımdan geçiren **Kurulum Sihirbazı** görünecektir:

1. **Dil Seçimi**  
   Tercih ettiğiniz dili seçin.

2. **Web Sitesi Ayarları**  
   Site adı, URL gibi web sitesi bilgilerini girin.

3. **Veritabanı Ayarları**  
   **MySQL** veya **MariaDB** bilgilerinizi girin.  
   Varsayılan tablo ön eki: `pano_` (isterseniz değiştirebilirsiniz).

4. **SMTP Ayarları (Opsiyonel)**  
   E-posta gönderimi için SMTP ayarlarını yapabilirsiniz.  
   Bu adım **isteğe bağlıdır** ve atlamak isterseniz **endişelenmeyin!**  
   Daha sonra **Panel → Ayarlar → Platform** bölümünden SMTP ayarlarını yeniden etkinleştirebilir veya güncelleyebilirsiniz.  
   *(Ancak yapılandırılmazsa “şifremi unuttum” gibi bazı özellikler çalışmayabilir.)*

5. **Hesap Bağlama ve Yönetici Oluşturma**
    - Zaten bir **Pano Hesabınız** varsa, **Bağlan (Connect)** düğmesine tıklayarak hesabınızı bağlayabilirsiniz — e-posta ve kullanıcı adınız otomatik doldurulur.
    - Eğer hesabınız yoksa, yeni bir **yönetici (admin) hesabı** oluşturun.  
      (Şifrenizi unutmayın, panele giriş için gereklidir.)

Kurulumu tamamlamak için **Tamamla (Finish)** butonuna basın.  
Pano kurulumu sonlandıracak ve otomatik olarak yeni **yönetici panelinize** yönlendirecektir.

> 🪄 *Artık yazılar oluşturabilir, Minecraft sunucunuzu bağlayabilir, eklentiler kurabilir, temalar değiştirebilir ve çok daha fazlasını yapabilirsiniz!*


## 🎮 Minecraft Sunucunuzu Bağlama (Opsiyonel)

Oyun entegrasyonlarını etkinleştirmek ve Minecraft sunucunuzu Pano'ya bağlamak için **Pano MC Eklentisi**ni kurmanız gerekir.

### Pano MC Eklentisi Nedir?

Pano MC Eklentisi, Minecraft sunucunuz ile Pano arasında bir köprü görevi görür ve şunları sağlar:
- 🔒 Güvenli WebSocket iletişimi (RSA + AES-256 şifreleme)
- 🔄 Gerçek zamanlı oyuncu verisi senkronizasyonu
- 🧩 Otomatik eklenti tespit ve entegrasyon (AuthMe, izinler, vb.)
- 📡 Oyun içinden web'e iletişim için etkinlik sistemi

### Kurulum Adımları

1. **Eklentiyi İndirin**
   - [Pano MC Eklentisi Releases](https://github.com/PanoMC/pano-mc-plugin/releases) sayfasını ziyaret edin
   - Sunucu platformunuza uygun JAR dosyasını indirin:
     - `pano-spigot-<sürüm>.jar` — Spigot/Paper/Folia için
     - `pano-bungeecord-<sürüm>.jar` — Bungeecord için
     - `pano-velocity-<sürüm>.jar` — Velocity için

2. **Eklentiyi Kurun**
   - İndirdiğiniz JAR dosyasını sunucunuzun `plugins/` klasörüne yerleştirin
   - Minecraft sunucunuzu yeniden başlatın

3. **Pano'ya Bağlanın**
   - Yeniden başlatma sonrası **Pano Yönetici Panelinizi** açın
   - **Sunucular** (kenar çubuğunda) bölümüne gidin
   - **+** butonuna tıklayarak yeni sunucu ekleyin
   - Açılan bağlantı modalında adım adım talimatları göreceksiniz
   - Modal'da gösterilen adımları takip ederek Minecraft sunucunuzu bağlayın
   - Eklenti otomatik olarak güvenli şifreli bağlantı kuracaktır

4. **Bağlantıyı Doğrulayın**
   - Bağlandıktan sonra sunucunuz **Sunucular** listesinde görünecektir
   - Sunucu durumunu (çevrimiçi/çevrimdışı), oyuncu sayısını ve diğer bilgileri görebilirsiniz
   - Bağlantı artık aktif ve entegrasyonlar için hazır

> 💡 **Not:** Tek bir Pano örneğine birden fazla Minecraft sunucusu bağlayabilirsiniz.

### Desteklenen Platformlar

- ✅ Spigot
- ✅ Paper
- ✅ Folia
- ✅ Purpur
- ✅ Bungeecord
- ✅ Velocity

### Sırada Ne Var?

Sunucunuz bağlandıktan sonra şunları yapabilirsiniz:
- [Oyun entegrasyonlarını](../integrations/) etkinleştirin (AuthMeReloaded gibi)
- Gerçek zamanlı oyuncu istatistiklerini görüntüleyin
- Oyuncuları web panelinden yönetin
- Oyun içi etkinlikleri web sitenizle senkronize edin

## 🛠️ Kurulum Sonrası

Kurulum tamamlandıktan sonra isterseniz yapılandırma dosyasını düzenleyebilirsiniz.  
Detaylı bilgi için [Yapılandırma Rehberi →](../configuration) sayfasını inceleyin.

## 💬 Yardım ve Destek

Bir sorunla karşılaşırsanız:
- [SSS (Sıkça Sorulan Sorular)](../FAQ) sayfasını ziyaret edin.
- [**Discord topluluğumuzda**](https://discord.gg/6vVy72wgXT) yardım isteyin.
- Ya da [GitHub Issues](https://github.com/PanoMC/Pano/issues) üzerinden bir hata raporu oluşturun.

> Birlikte Pano’yu daha iyi hale getiriyoruz. 🚀
