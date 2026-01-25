# AuthMeReloaded Entegrasyonu

**AuthMe** ve **AuthMeReloaded** aynı eklentidir — her iki isim de Minecraft topluluğunda birbirinin yerine kullanılır. **AuthMeReloaded**, orijinal AuthMe eklentisinin gelişmiş bir fork'udur ve Minecraft sunucuları için **önerilen kimlik doğrulama yönetim çözümüdür**.

> **Not:** Bu entegrasyon yalnızca **Spigot** ve fork'ları (Paper, Folia, Purpur, vb.) için kullanılabilir. Bungeecord veya Velocity gibi proxy sunucular için kullanılamaz.

## 🎯 AuthMeReloaded Nedir?

AuthMeReloaded, Minecraft sunucularına giriş ve kayıt işlevselliği ekleyen kapsamlı bir kimlik doğrulama eklentisidir. Minecraft topluluğunda en popüler ve güvenilir kimlik doğrulama çözümüdür.

Pano ile entegre edildiğinde, kimlik doğrulama **sorunsuz** hale gelir — oyuncular web siteniz üzerinden kaydolabilir, giriş yapabilir ve şifrelerini yönetebilirken, eklenti oyun içi kimlik doğrulamayı otomatik olarak halleder.

## ⚡ Özellikler

AuthMeReloaded entegrasyonu etkinleştirildiğinde, Pano şunları sağlar:

- ✅ **Sorunsuz Kimlik Doğrulama** — Pano tarafından kontrol edilen giriş ve kayıt akışları
- ✅ **Şifre Yönetimi** — Web sitesinden şifre değiştirme
- ✅ **Yönetici Kontrolleri** — Yöneticiler panel'den oyuncu şifrelerini sıfırlayabilir
- ✅ **Otomatik Senkronizasyon** — Oyuncu verileri oyun ve web arasında senkronize kalır
- ✅ **Eklenti Komut Desteği** — Pano'dan belirli AuthMe komutlarını çalıştırma
- ✅ **Sıfır Dokunma Otomatik Yapılandırma** — Pano, manuel yapılandırma gerektirmeden AuthMe ayarlarını otomatik olarak düzenler

## 📦 Gereksinimler

AuthMeReloaded entegrasyonunu etkinleştirmeden önce şunlara sahip olduğunuzdan emin olun:

1. Minecraft sunucunuzda (Spigot/Paper/Folia) **AuthMeReloaded** kurulu
2. **Pano MC Eklentisi** kurulu ve Pano örneğinize bağlı
3. AuthMeReloaded sürümü **5.6.0** veya daha yeni (her zaman en son sürümü kullanın)

> ⚠️ **Önemli:** Pano her zaman AuthMeReloaded'ın en son sürümünü destekler. AuthMe eklentinizin güncel olduğundan emin olun. Son test edilen sürüm **v5.6.0**'dır.

## 🔧 Kurulum Rehberi

### Adım 1: AuthMeReloaded'ı Kurun

AuthMeReloaded'ı Minecraft sunucunuza indirin ve kurun:

- [SpigotMC'den İndir](https://www.spigotmc.org/resources/authmereloaded.6269/)
- [GitHub'dan İndir](https://github.com/AuthMe/AuthMeReloaded/releases)

**`AuthMe-<sürüm>.jar`** dosyasını sunucunuzun **`plugins/`** klasörüne yerleştirin ve sunucunuzu yeniden başlatın.

### Adım 2: Minecraft Sunucunuzu Pano'ya Bağlayın

Henüz yapmadıysanız, **Pano MC Eklentisi**ni Minecraft sunucunuza kurun ve Pano örneğinize bağlayın:

1. Pano MC Eklentisini Minecraft sunucunuza kurun
2. Panel'de **Sunucular** → **+** butonuna tıklayın
3. Modal'da gösterilen bağlantı adımlarını takip edin

Detaylı talimatlar için [Kurulum Rehberi](../../installation/)'ne bakın.

> Bu dokümantasyon, Pano MC Eklentisi'nin kurulu ve bağlı olduğunu varsayar.

### Adım 3: Auth Entegrasyonunun Panel'de Etkin Olduğunu Doğrulayın

1. **Pano Yönetici Paneli**nize giriş yapın
2. **Panel → Sunucu Ayarları → Oyun Entegrasyonu**'na gidin
3. **Auth Entegrasyonu** onay kutusunu bulun
4. **Etkin olduğunu doğrulayın** (varsayılan olarak etkindir)
5. Devre dışıysa, etkinleştirin ve ayarlarınızı kaydedin

> 💡 **Not:** Auth Entegrasyonu **varsayılan olarak etkindir**. Etkinleştirildiğinde ve AuthMeReloaded sunucunuzda tespit edildiğinde, Pano otomatik olarak bağlanacaktır. Sadece aktif olduğunu doğrulamanız gerekir.

Bu kadar! Pano MC Eklentisi otomatik olarak **AuthMeReloaded'ı tespit edecek** ve kimlik doğrulama akışlarını yönetmeye başlayacaktır.

## 🔄 Etkinleştirdikten Sonra Ne Olur?

Auth Entegrasyonu etkinleştirildiğinde, Pano şunları yapar:

### 1. AuthMe Eklentisini Tespit Eder ve Bağlanır

Pano MC Eklentisi, AuthMeReloaded'ın sunucunuzda kurulu olup olmadığını otomatik olarak tespit eder. Tespit edildiğinde, AuthMe'nin komutları ve etkinlikleri için dinleyiciler kaydeder ve Pano ile AuthMe arasında sorunsuz iletişim sağlar.

### 2. AuthMe Yapılandırmasını Değiştirir (Sıfır Dokunma)

Pano, **sıfır dokunma yapılandırma yaklaşımı** kullanır — herhangi bir manuel müdahale gerektirmeden uyumluluğu sağlamak için belirli AuthMe yapılandırma değerlerini otomatik olarak düzenler. **Herhangi bir değişiklik yapmadan önce, Pano** `config.yml` dosyanızın bir **yedeğini oluşturur** ve bunu **Pano eklenti klasörüne** (`plugins/Pano/`) **`authme-backup.yml`** adıyla kaydeder.

Aşağıdaki ayarlar değiştirilir:

| Ayar | Yeni Değer | Neden |
|------|-----------|-------|
| `settings.security.passwordHash` | `CUSTOM` | Pano'nun şifre doğrulama entegrasyonu için gerekli |
| `settings.registration.type` | `PASSWORD` | Pano yalnızca şifre tabanlı kimlik doğrulamayı destekler (e-posta tabanlı özellikler Pano'nun web sitesi üzerinden gerçekleştirilmelidir) |
| `settings.security.minPasswordLength` | `6` | Hesap güvenliği için minimum standart sağlar |
| `settings.security.passwordMaxLength` | `128` | Platform genelinde şifre uyumluluğu için standartlaştırılmış maksimum uzunluk |
| `settings.restrictions.allowedNicknameCharacters` | `[a-zA-Z0-9_]*` | Takma adları platform uyumluluğu için alfanümerik karakterler ve alt çizgi ile sınırlar |

> ⚠️ **Bu ayarları manuel olarak değiştirmeyin.** Tam entegrasyon ve uyumluluk için gereklidirler. Değiştirmek entegrasyonu bozabilir veya diğer eklentilerle çakışmalara neden olabilir.

### 3. Kimlik Doğrulamanın Kontrolünü Alır

Entegrasyon aktifken, Pano şunları yönetir:

- **Oyuncu Kaydı** — Yeni oyuncular web siteniz üzerinden kaydolur
- **Oyuncu Girişi** — Kimlik doğrulama Pano tarafından yönetilir ve AuthMe ile senkronize edilir
- **Şifre Değişiklikleri** — Oyuncular web sitesinden şifrelerini değiştirebilir
- **Şifre Kurtarma** — Unutulan şifreler e-posta ile sıfırlanabilir (SMTP yapılandırılmışsa)
- **Yönetici Şifre Yönetimi** — Yöneticiler panel'den herhangi bir oyuncunun şifresini sıfırlayabilir

## ✅ Desteklenen Özellikler

Pano aşağıdaki AuthMe komutlarını ve özelliklerini destekler:

- ✅ `/register <şifre> <şifreTekrar>` — Yeni hesap kaydı
- ✅ `/login <şifre>` — Hesaba giriş
- ✅ `/logout` — Hesaptan çıkış
- ✅ `/changepassword <eskiŞifre> <yeniŞifre>` — Hesap şifresini değiştirme
- ✅ `/authme forceLogin <oyuncu>` — Oyuncuyu zorla giriş yaptır (yönetici)
- ✅ `/authme register <oyuncu> <şifre>` — Oyuncu kaydı (yönetici)
- ✅ `/authme reload` — AuthMe yapılandırmasını yeniden yükle
- ✅ `/authme changepassword <oyuncu> <yeniŞifre>` — Bir oyuncunun şifresini değiştirme (yönetici)

Pano bu komutları dinler ve eylemleri web sitesi veritabanınızla senkronize eder.

## ❌ Desteklenmeyen Özellikler

Entegrasyon sınırlamaları nedeniyle, aşağıdaki AuthMe komutları ve özellikleri **desteklenmez**:

- ❌ `/unregister` — Kayıt silme Pano'nun paneli veya web sitesi üzerinden yapılmalıdır
- ❌ `/authme unregister <oyuncu>` — Yukarıdakiyle aynı
- ❌ `/email` — E-posta yönetimi Pano tarafından yapılır
- ❌ `/totp` — İki faktörlü kimlik doğrulama desteklenmez

Bir oyuncu desteklenmeyen bir komutu kullanmaya çalışırsa, bunun yerine web sitesini kullanması bildirilir.

> 💡 **Önerilen:** Karışıklığı önlemek ve sorunsuz bir deneyim sağlamak için, bir izin eklentisi veya AuthMe'nin kendi komut yapılandırması kullanarak **bu desteklenmeyen komutlara erişimi devre dışı bırakmanız önerilir**. Bu şekilde oyuncular yalnızca Pano uyumlu özelliklere erişebilir.

### 🎯 En İyi Uygulama: Oyuncuları Web Sitenize Yönlendirin

Daha da iyi bir kullanıcı deneyimi ve gelişmiş güvenlik için, **oyun içi kaydı tamamen devre dışı bırakmayı veya kısıtlamayı** düşünün:

**Nasıl uygulanır:**
1. İzinler veya AuthMe yapılandırması kullanarak `/register` komutunu devre dışı bırakın
2. AuthMe'yi yalnızca zaten kayıtlı oyuncuların katılmasına izin verecek şekilde ayarlayın
3. Yeni oyuncuları kaydolmak için **web sitenize yönlendiren** bir sunucu mesajı yapılandırın

**Bu yaklaşım neden daha iyidir:**

- ✅ **Gelişmiş Güvenlik** — Web kaydı, e-posta doğrulama, CAPTCHA ve diğer güvenlik önlemlerine olanak tanır
- ✅ **Daha İyi UX** — Oyuncular uygun formlar, şifre güçlendirme göstergeleri ve net talimatlarla hesap oluşturabilir
- ✅ **Merkezi Yönetim** — Tüm kayıtlar Pano'nun web sitesi üzerinden gerçekleşir, moderasyonu kolaylaştırır
- ✅ **Profesyonel Görünüm** — Sunucunuza daha cilalı, modern bir his verir
- ✅ **Ek Özellikler** — Kayıt sırasında kullanım şartları, gizlilik politikası kabulü ve diğer gereksinimleri ekleyebilirsiniz

**Örnek AuthMe Yapılandırması:**

```yaml
settings:
  registration:
    enabled: false  # Oyun içi kaydı devre dışı bırak
  
restrictions:
  allowCommands:
    - /login
    # /register izin verilen komutlardan kaldırıldı
```

Ardından oyuncuları web sitenize yönlendiren bir kick veya katılım mesajı yapılandırın: `"Lütfen https://sunucunuz.com/register adresinden kaydolun"`

## 🌐 Diğer Web Scriptleriyle Karşılaştırma

Karmaşık yapılandırma ve manuel senkronizasyon gerektiren geleneksel web scriptlerin aksine, **Pano'nun AuthMeReloaded entegrasyonu sorunsuzdur**:

| Özellik | Geleneksel Scriptler | Pano |
|---------|---------------------|------|
| **Kurulum Karmaşıklığı** | Yüksek — manuel veritabanı kurulumu, yapılandırma düzenleme ve PHP scriptleri gerektirir | Düşük — sadece onay kutusunu etkinleştirin |
| **Senkronizasyon** | Manuel veya cron tabanlı | WebSocket üzerinden gerçek zamanlı |
| **Şifre Hash'leme** | Genellikle uyumsuz veya güvensiz | Yerel CUSTOM hash desteği |
| **Komut Desteği** | Sınırlı veya yok | Tam komut ve etkinlik desteği |
| **Otomatik Yapılandırma** | Manuel | Yedekleme ile otomatik |

Pano ile her şey çalışır. Manuel veritabanı düzenleme yok, karmaşık yapılandırma yok — sadece tak ve çalıştır.

## 🔒 Güvenlik ve Uyumluluk

### Şifre Güvenliği

Pano, AuthMe'nin **CUSTOM hash** türünü kullanır, bu da Pano'nun düz metin şifreler saklamadan veya zayıf hash algoritmaları kullanmadan şifreleri güvenli bir şekilde doğrulamasına olanak tanır.

### Yedekleme Sistemi

Herhangi bir AuthMe yapılandırmasını değiştirmeden önce, Pano **otomatik olarak** `config.yml` dosyanızın bir **yedeğini oluşturur**. Yedekleri şurada bulabilirsiniz:

```
plugins/Pano/authme-backup/
```

Bir şeyler ters giderse, her zaman önceki yapılandırmanızı geri yükleyebilirsiniz.

### Eklenti Çakışmaları

Bazı AuthMe eklentileri veya ilgili eklentiler Pano'nun entegrasyonuyla çakışabilir, özellikle şunları yaparlarsa:

- Aynı yapılandırma değerlerini değiştirirler
- Aynı AuthMe etkinliklerine bağlanırlar
- Şifre hash'leme yöntemlerini değiştirirler

Sorunlarla karşılaşırsanız, nedeni belirlemek için çakışan eklentileri birer birer devre dışı bırakmayı deneyin.

## 🐛 Sorun Giderme

### Entegrasyon Çalışmıyor

**Belirtiler:** Oyuncular kaydolamıyor veya giriş yapamıyor, komutlar çalışmıyor

**Çözümler:**
1. AuthMeReloaded'ın kurulu ve çalışır durumda olduğundan emin olun (`/plugins` kontrol edin)
2. Pano MC Eklentisi'nin Pano'ya bağlı olduğunu doğrulayın (Panel → Sunucu Durumu kontrol edin)
3. Entegrasyon onay kutusunun Panel → Sunucu Ayarları → Oyun Entegrasyonu'ndan etkinleştirildiğinden emin olun
4. Entegrasyonu etkinleştirdikten sonra Minecraft sunucunuzu yeniden başlatın
5. Hata için sunucu loglarını kontrol edin

### Yapılandırma Sürekli Sıfırlanıyor

**Belirtiler:** AuthMe yapılandırma değerleri yeniden başlatmadan sonra geri değişiyor

**Çözümler:**
1. AuthMe'nin yapılandırmasında `passwordHash` veya `registration.type`'ı manuel olarak düzenlemeyin
2. Pano'nun bu ayarları otomatik olarak yönetmesine izin verin
3. Diğer AuthMe ayarlarını değiştirmeniz gerekiyorsa, bunları AuthMe'nin yapılandırması üzerinden düzenleyin ve yeniden yükleyin

### Komutlar Yanıt Vermiyor

**Belirtiler:** `/register` veya `/login` komutları çalışmıyor

**Çözümler:**
1. Entegrasyonun panel'de etkin olup olmadığını kontrol edin
2. Oyuncunun doğru sunucuya bağlı olduğunu doğrulayın
3. Tam komut sözdizimini kullandığınızdan emin olun (takma ad yok)
4. Başka bir eklentinin komutları geçersiz kılıp kılmadığını kontrol edin

## 💬 Sorun Bildirme

AuthMeReloaded entegrasyonuyla ilgili hata, eksik özellik veya uyumluluk sorunlarıyla karşılaşırsanız:

- **GitHub Sorunları:** [PanoMC/pano-mc-plugin](https://github.com/PanoMC/pano-mc-plugin/issues)
- **Discord:** [Topluluğumuza katılın](https://discord.gg/6vVy72wgXT)

Bir sorun bildirirken lütfen şunları ekleyin:
- Pano sürümünüz
- AuthMeReloaded sürümünüz
- Minecraft sunucu sürümünüz (Spigot/Paper/Folia)
- Hatayı gösteren sunucu logları
- Sorunu yeniden üretme adımları

> Birlikte, Pano'yu daha iyi hale getiriyoruz. 🚀

## 📚 İlgili Dokümantasyon

- [Oyun Entegrasyonları](../)
- [Pano'yu Kurma](../../installation/)
- [Yapılandırma Rehberi](../../configuration/)
- [SSS](../../FAQ/)
- [Gelişmiş Konular](../../advanced/)
