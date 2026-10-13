# AuthMeReloaded Entegrasyonu

**AuthMe** ve **AuthMeReloaded** aynı eklentidir — her iki isim de Minecraft topluluğunda birbirinin yerine kullanılır. **AuthMeReloaded**, orijinal AuthMe eklentisinin gelişmiş bir fork'udur ve Minecraft sunucuları için **önerilen kimlik doğrulama yönetim çözümüdür**.

> **Not:** Bu entegrasyon yalnızca **Spigot** ve fork'ları (Paper, Folia, Purpur, vb.) için kullanılabilir. AuthMe'nin kendisi BungeeCord veya Velocity gibi proxy sunucularda çalışmaz; Velocity'de aynı **Kimlik Doğrulama Entegrasyonu** anahtarı bunun yerine LimboAuth'un `pano-limbo-auth` fork'uyla çalışır.

## AuthMeReloaded Nedir?

AuthMeReloaded, Minecraft sunucularına giriş ve kayıt işlevselliği ekleyen kapsamlı bir kimlik doğrulama eklentisidir. Minecraft topluluğunda en popüler ve güvenilir kimlik doğrulama çözümüdür.

Pano ile entegre edildiğinde, kimlik doğrulama **sorunsuz** hale gelir — oyuncular web siteniz üzerinden kaydolabilir, giriş yapabilir ve şifrelerini yönetebilirken, eklenti oyun içi kimlik doğrulamayı otomatik olarak halleder.
## Özellikler

AuthMeReloaded entegrasyonu etkinleştirildiğinde, Pano şunları sağlar:

- **Sorunsuz Kimlik Doğrulama** — Pano tarafından kontrol edilen giriş ve kayıt akışları
- **Şifre Yönetimi** — Web sitesinden şifre değiştirme
- **Yönetici Kontrolleri** — Yöneticiler panel'den oyuncu şifrelerini sıfırlayabilir
- **Otomatik Senkronizasyon** — Oyuncu verileri oyun ve web arasında senkronize kalır
- **Sıfır Dokunma Otomatik Yapılandırma** — Pano, manuel yapılandırma gerektirmeden AuthMe ayarlarını otomatik olarak düzenler
## Gereksinimler

AuthMeReloaded entegrasyonunu etkinleştirmeden önce şunlara sahip olduğunuzdan emin olun:

1. Minecraft sunucunuzda (Spigot/Paper/Folia) **AuthMeReloaded** kurulu
2. **Pano MC Eklentisi** kurulu ve Pano örneğinize bağlı
3. AuthMeReloaded sürümü **5.6.0** veya daha yeni (her zaman en son sürümü kullanın)

> ⚠️ **Önemli:** Pano her zaman AuthMeReloaded'ın en son sürümünü destekler. AuthMe eklentinizin güncel olduğundan emin olun. Son test edilen sürüm **v5.6.0**'dır.
## Kurulum Rehberi

### Adım 1: AuthMeReloaded'ı Kurun

AuthMeReloaded'ı Minecraft sunucunuza indirin ve kurun:

- [SpigotMC'den İndir](https://www.spigotmc.org/resources/authmereloaded.6269/)
- [GitHub'dan İndir](https://github.com/AuthMe/AuthMeReloaded/releases)

**`AuthMe-<sürüm>.jar`** dosyasını sunucunuzun **`plugins/`** klasörüne yerleştirin ve sunucunuzu yeniden başlatın.

### Adım 2: Minecraft Sunucunuzu Pano'ya Bağlayın

Henüz yapmadıysanız, **Pano MC Eklentisi**ni Minecraft sunucunuza kurun ve Pano örneğinize bağlayın:

1. Pano MC Eklentisini Minecraft sunucunuza kurun
2. Panel'de kenar çubuğunun üstündeki **Sunucular** → **Sunucu ekle** → **Pano eklentisiyle bağla** yolunu izleyin
3. Modal'da gösterilen bağlantı adımlarını takip edin

Detaylı talimatlar için [Sunucu bağlama](../../server-management/#linking-a-server) bölümüne bakın.

> Bu dokümantasyon, Pano MC Eklentisi'nin kurulu ve bağlı olduğunu varsayar.

### Adım 3: Auth Entegrasyonunun Panel'de Etkin Olduğunu Doğrulayın {#step-3-verify-auth-integration-is-enabled-in-panel}

1. **Pano Yönetici Paneli**nize giriş yapın
2. Sunucuyu seçin ve **Ayarlar → Oyun Entegrasyonu** sekmesini açın (ayarlar sunucu başınadır)
3. **Kimlik Doğrulama Entegrasyonu** bölümünü bulun. Burada şunları ayarlayabilirsiniz:
   - **Kimlik Doğrulama Entegrasyonu (varsayılan olarak etkin):** Entegrasyonun ana anahtarı.
   - **E-Mail Doğrulama Gerekli (varsayılan olarak etkin):** Etkinse oyuncuların sunucuya girebilmesi için e-posta adreslerini doğrulamış olması gerekir. Yalnızca e-posta doğrulaması platform genelinde açıkken çalışır (`auth.require-email-verification`, **Ayarlar → Platform**).
   - **Kayıt Sonrası At (varsayılan olarak etkin):** Etkinse oyuncular oyun içi kayıttan hemen sonra sunucudan atılır; böylece giriş yapmadan önce e-postalarını doğrularlar.
4. **Tercihlerinizi doğrulayın** ve kaydedin.

> **Not:** Auth Entegrasyonu **varsayılan olarak etkindir**. Etkinleştirildiğinde ve AuthMeReloaded sunucunuzda tespit edildiğinde, Pano otomatik olarak bağlanacaktır. Sadece aktif olduğunu doğrulamanız gerekir.

Bu kadar! Pano MC Eklentisi otomatik olarak **AuthMeReloaded'ı tespit edecek** ve kimlik doğrulama akışlarını yönetmeye başlayacaktır.
## Etkinleştirdikten Sonra Ne Olur?

Auth Entegrasyonu etkinleştirildiğinde, Pano şunları yapar:

### 1. AuthMe Eklentisini Tespit Eder ve Bağlanır

Pano MC Eklentisi, AuthMeReloaded'ın sunucunuzda kurulu olup olmadığını otomatik olarak tespit eder. Tespit edildiğinde, AuthMe'nin komutları ve etkinlikleri için dinleyiciler kaydeder ve Pano ile AuthMe arasında sorunsuz iletişim sağlar.

### 2. AuthMe Yapılandırmasını Değiştirir (Sıfır Dokunma)

Pano, **sıfır dokunma yapılandırma yaklaşımı** kullanır — herhangi bir manuel müdahale gerektirmeden uyumluluğu sağlamak için belirli AuthMe yapılandırma değerlerini otomatik olarak düzenler. **Herhangi bir değişiklik yapmadan önce, Pano** değiştireceği ayarların **önceki değerlerini** **Pano eklenti klasörüne** (`plugins/Pano/`) **`authme-backup.yml`** adıyla kaydeder ve entegrasyon kapatıldığında ya da sunucunun bağlantısı kesildiğinde bunları geri yükler.

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

- **Oyuncu Kaydı** — Yeni oyuncular web sitenizden ya da oyun içinde `/register` ile kaydolur; ikisi de Pano hesabını oluşturur
- **Oyuncu Girişi** — Kimlik doğrulama Pano tarafından yönetilir ve AuthMe ile senkronize edilir
- **Şifre Değişiklikleri** — Oyuncular web sitesinden şifrelerini değiştirebilir
- **Şifre Kurtarma** — Unutulan şifreler e-posta ile sıfırlanabilir (SMTP yapılandırılmışsa)
- **Yönetici Şifre Yönetimi** — Yöneticiler panel'den herhangi bir oyuncunun şifresini sıfırlayabilir
