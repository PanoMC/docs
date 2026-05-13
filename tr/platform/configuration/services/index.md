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
    - `portable`: Yalnızca **Windows (x64 ve ARM64)** üzerinde desteklenir. Pano tarafından otomatik olarak yönetilir (detaylar için [Kurulum Rehberi →](../installation) sayfasına bakın).
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
- Daha fazla bilgi için bkz. [Pano Hesabınızı Bağlayın →](./advanced/connect-pano-account)
## E-posta (SMTP)

```jsonc
email {
  enabled = false
  sender = ""      # örn: "Pano <no-reply@domain.com>" - genelde kullanıcı adıyla aynı olmalıdır
  hostname = ""    # örn: "smtp.gmail.com"
  port = 465
  username = ""    # örn: "no-reply@domain.com"
  password = ""
  ssl = true
  starttls = ""    # "DISABLED" veya "OPTIONAL" veya "REQUIRED"
  authMethods = "" # opsiyonel, genelde "PLAIN"
}
```

**Bilgi**

- Kurulum sırasında opsiyoneldir; sonradan **Panel → Ayarlar → Platform** üzerinden yapılandırılabilir.
- SMTP olmadan, şifre sıfırlama ve doğrulama e-postaları çalışmaz.
