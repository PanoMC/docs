# Servis Yapılandırması

## Veritabanı Yapılandırması

```jsonc
database {
  type = "mariadb" # "mariadb" (MySQL/MariaDB için) veya "portable"
  host = ""        # örn: "127.0.0.1:3306"
  name = ""        # veritabanı adı
  username = ""
  password = ""    # veritabanında şifre yoksa boş olabilir
  prefix = "pano_" # tablo öneki (kurulumdan sonra değiştirmeyin)
}
```

**Notlar**

- **Veritabanı Türleri:**
    - `mariadb`: Varsayılan tür, hem **MySQL 5.5+** hem de **MariaDB** ile uyumludur.
    - `portable`: Yalnızca **Windows (x64 ve ARM64)** üzerinde desteklenir. Pano tarafından otomatik olarak yönetilir (detaylar için [Kurulum Sihirbazı →](../../installation/setup/) sayfasına bakın).
- Şifre boş bırakılabilir (kimlik doğrulama devre dışıysa).
- **Uyarı:** Kurulumdan sonra `type` veya `prefix` değiştirmek desteklenmez ve **yeniden kurulum** gerektirebilir.
## Pano Hesabı (Opsiyonel)

```jsonc
pano-account {
  username = ""
  email = ""
  access-token = ""   # Pano hesabınız için güvenli token
  platform-id = ""    # hesap ID’si
  
  connect {
    public-key = ""
    private-key = ""
    state = ""
  }
}
```

**Önemli**

- Ne yaptığınızı bilmiyorsanız **manuel olarak düzenlemeyin**.
- **Panel → Ayarlar → Platform** üzerinden bağlantıyı yönetin.
- **Market özellikleri** (güncellemeler, mağaza yüklemeleri) için gereklidir.
## E-posta (SMTP)

```jsonc
email {
  enabled = false
  provider = "SMTP" # "SMTP" (aşağıdaki ayarlar) veya "PANO_MAIL"
  sender = ""      # örn: "Pano <no-reply@domain.com>" - genelde kullanıcı adıyla aynı olmalıdır
  hostname = ""    # örn: "smtp.gmail.com"
  port = 465
  username = ""    # örn: "no-reply@domain.com"
  password = ""
  ssl = true
  starttls = ""    # "DISABLED" veya "OPTIONAL" veya "REQUIRED"
  authMethods = "" # opsiyonel, genelde "PLAIN"
  host-managed = true # yalnızca Pano Host
  host-sender = null  # yalnızca Pano Host
  custom = null       # yalnızca Pano Host
}
```

**Bilgi**

- Kurulum sırasında opsiyoneldir; sonradan **Panel → Ayarlar → Platform** üzerinden yapılandırılabilir.
- SMTP olmadan, şifre sıfırlama ve doğrulama e-postaları çalışmaz.
- `provider`: e-postanın nasıl gönderileceği. `SMTP` bu bloktaki ayarları kullanır. `PANO_MAIL`, kurulumun bağlı olduğu Pano hesabının [Pano Mail](#pano-mail) hizmetiyle gönderir; SMTP ayarları kullanılmaz. Varsayılan **SMTP**. Dosyayı düzenlemek yerine **Panel → Ayarlar → Platform**'dan değiştirin.
- `host-managed`, `host-sender` ve `custom` yalnızca bir **Pano Host** kurulumunda işe yarar; başka yerde dokunmayın.
    - `host-managed`: `true` ise bu blok kurulumun Pano Host e-postasını izler ve her açılışta yeniden yazılır. **Panel → Ayarlar**'da başka e-posta ayarları kaydetmek bunu `false` yapar, böylece ayarlarınız kalır. Varsayılan **true**.
    - `host-sender`: Pano Host e-postasında kurulumun varsayılanı yerine kullanılan gönderen; açılışlar arasında korunur. Boş (`null`) varsayılan demektir.
    - `custom`: kendi SMTP ayarlarınızın bir kopyası (`sender`, `hostname`, `port`, `username`, `password`, `ssl`, `starttls`, `authMethods`); Pano Host e-postası kullanılırken saklanır, böylece onlara geri dönünce hiçbir şey kaybolmaz. Otomatik doldurulur.

### Pano Mail {#pano-mail}

**Pano Mail**, Pano hesabınızla gelen e-posta gönderimidir; kendi e-posta sunucunuza ihtiyacınız kalmaz. Kurulum
sihirbazının e-posta adımında ya da sonradan **Panel → Ayarlar → Platform**'da **Kendi e-posta sunucum** yerine
**Pano Mail**'i seçin. Kurulumun Pano hesabınıza bağlı olması gerekir.

- **Ücretsiz paket.** Her hesap için ücretsizdir, aylık ve günlük bir hakkı vardır (panel ikisini de gösterir) ve
  hiçbir ayar gerekmeden hemen çalışır. Daha büyük paketler Pano web sitesinden seçilebilir.
- **Gönderici adresi.** Her hesaba bizim verdiğimiz bir alt alan adında bir adres ücretsiz verilir. Adı
  değiştirilebilir ama kaldırılamaz. Pano web sitesinden kendi alan adınızı da ekleyebilirsiniz; site sizden birkaç
  DNS kaydı eklemenizi ister. `@` işaretinden önceki kısmı panelden değiştirebilirsiniz.
- **Kullanım.** Panel bugün ve bu ay ne kadar kullanıldığını ve hakkın ne zaman sıfırlandığını gösterir. Bir
  limite yaklaştığınızda uyarılırsınız; e-posta, limit sıfırlanana ya da daha büyük bir pakete geçene kadar durur.
- **Pano web sitesinde.** Hesabınızın **E-posta** sekmesi paketi, tüm Pano'larınızın kullanımını ve son 30 günde
  gönderilen e-postaların kaydını gösterir.
