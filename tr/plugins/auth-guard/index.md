# Pano Auth Guard Eklentisi

**Pano Auth Guard**, sitenizin giriş ve kayıt altyapısını tek bir eklentide üç koruma katmanıyla güçlendiren resmi bir Pano eklentisidir: bot korumasına yönelik **captcha**, kullanıcı hesapları için **iki adımlı kimlik doğrulama (2FA)** ve tek kullanımlık e-posta bağlantıları aracılığıyla şifresiz **sihirli giriş (magic login)**. Sunucu tarafında Pano'nun temel kimlik doğrulama olaylarına bağlanır; böylece koruma hem temel kimlik doğrulama API'lerine hem de social-login kaydı ve hesap bağlama gibi eklenti kaynaklı akışlara uygulanır. Pano ekibi bu eklentiyi "sağlam bot koruması ve kusursuz, çok katmanlı giriş seçenekleri sunan hepsi bir arada bir kimlik doğrulama eklentisi" olarak tanımlıyor.

::: tip Premium eklenti
Pano Auth Guard ücretli bir eklentidir. Resmi derlemeler başlangıçta bir panomc.com lisansını doğrular ve geçerli bir lisans olmadan başlamaz — Pano çekirdeği çalışmaya devam eder ve panel, "lisansı yenile" seçeneğiyle birlikte hatayı gösterir. Lisansı Pano kaynak mağazasından edinebilirsiniz.
:::

## Özellikler

### Captcha Bot Koruması
- **Sağlayıcılar:** **None** (Yok), **Google reCAPTCHA** (varsayılan olarak Enterprise, klasik gizli anahtarlar için bir **Legacy Mode** anahtarıyla), **hCaptcha** veya **Cloudflare Turnstile** arasından seçim yapın.
- **Form bazında anahtarlar:** Widget'ı **giriş**, **kayıt**, **şifre sıfırlama**, **e-posta doğrulama (hesap etkinleştirme)**, **yeni e-posta onayı** ve **şifre belirleme / yenileme** formlarında birbirinden bağımsız olarak etkinleştirin — her biri varsayılan olarak açıktır.
- **Sunucu tarafında zorunlu kılma:** Her captcha, şifre kontrol edilmeden *önce* arka uçta doğrulanır.
- **Bilinçli olarak "fails open" (açık kalır):** Anahtarlar boşsa, bir gizli anahtar geçersizse veya sağlayıcının API'sine ulaşılamıyorsa, kontrol atlanır (ve uyarı/hata olarak günlüğe kaydedilir); böylece bir yanlış yapılandırma sizi kendi sitenizden asla kilitleyemez.

### İki Adımlı Kimlik Doğrulama (TOTP)
- **Standart TOTP:** 6 haneli kodlar, 30 saniyelik adım, SHA-1 ve ±2 adımlık saat kayması toleransı — Google Authenticator ve benzeri uygulamalarla uyumludur.
- **Kolay kayıt:** Kullanıcılar bir **QR kodu** tarar ya da bir anahtarı elle girer; uygulamada görünen **yayıncı adı (issuer name)** yapılandırılabilir (varsayılan olarak site adınız).
- **Kullanıcı bazında isteğe bağlı:** 2FA'yı site genelinde etkinleştirdiğinizde her kullanıcı kendisi açabilir. Girişte, 2FA'sı olan kullanıcılar şifreleri kabul edildikten *sonra* bir kod ister; kısa ömürlü bir dahili token sayesinde 2FA adımında captcha'yı yeniden çözmeleri gerekmez.
- **Güvenli devre dışı bırakma:** 2FA'yı kapatmak hem geçerli 2FA kodunu **hem de** hesap şifresini gerektirir.

### Sihirli Giriş (Magic Login — şifresiz)
- Giriş sayfasındaki bir **E-posta Bağlantısıyla Giriş Yap** düğmesi, kullanıcıyı doğrudan oturuma sokan, markalı, tek kullanımlık bir bağlantıyı e-postayla gönderir.
- İstekler her zaman başarılı olarak raporlanır (e-posta numaralandırmasını önlemek için) ve her yeni istek önceki bağlantıyı geçersiz kılar. Bağlantılar **15 dakika** boyunca geçerlidir.

### Yönetim ve Denetim
- **Oyuncu 2FA araçları:** Bir oyuncunun 2FA durumunu görüntüleyin, kaldırın/sıfırlayın ya da panelden onun adına 2FA kurup doğrulayın.
- **Etkinlik günlüğü:** Ayar değişiklikleri, bir kullanıcının kendi 2FA'sını açması/kapatması ve bir yöneticinin bir oyuncunun 2FA'sını kaldırması kayıt altına alınır.
- **Yerelleştirme:** **İngilizce (en-US)**, **Türkçe** ve **Rusça** için eksiksiz çeviriler.

## Panel Ayarları

Tüm yapılandırma, **Pano Yönetim Paneli**'nde eklentinin kendi detay sayfasında (Eklentiler → Pano Auth Guard), bir **Auth Guard Ayarları** kartında yer alır: captcha **sağlayıcı** açılır menüsü, **site anahtarı**, **gizli anahtar** (yalnızca yazılabilir ve maskeli — API yalnızca bir anahtarın ayarlanıp ayarlanmadığını bildirir), **Legacy Mode** anahtarı, **Google Cloud proje kimliği**, altı form bazlı captcha anahtarı, **2FA** etkinleştirme düğmesi ve **yayıncı adı**, ayrıca **sihirli giriş** etkinleştirme düğmesi ve bağlantı süre-sonu alanı — ardından **Kaydet**. (Bir `debugLogging` seçeneği yalnızca eklentinin yapılandırma dosyasında bulunur ve panelde gösterilmez.)

Oyuncu 2FA kontrolleri iki yerde daha görünür: oyuncu detay kenar çubuğundaki bir **2FA** durum kartı ve oyuncu düzenleme penceresindeki bir satır. Her ikisi de **Etkin / Kurulmadı / Kurulum tamamlanmadı** durumlarını gösterir, bir oyuncunun 2FA'sını **Kaldır**manıza veya yönetici kaynaklı bir kurulum (QR + kod doğrulama) yürütmenize izin verir ve site genelinde 2FA kapalıyken açıklayıcı bir notla devre dışı bırakılır.

## Ziyaretçiler Ne Görür

- Giriş, kayıt, şifremi unuttum/sıfırla, hesap etkinleştirme, yeni e-posta onayı ve şifre yenileme formlarında seçilen **captcha widget'ı** (sağlayıcı betiği ihtiyaç halinde yüklenir).
- 2FA'ları etkinse, doğru bir şifre girdikten sonra bir **6 haneli 2FA kod penceresi**.
- Bir **E-posta Bağlantısıyla Giriş Yap** düğmesi ve bir **"E-postanızı Kontrol Edin"** akışı ile e-postayla gönderilen bağlantıyı tüketen `/auth-guard/magic-login` adresindeki bir doğrulama sayfası.
- Hesap ayarlarında bir **İki Adımlı Kimlik Doğrulama** kurulum kartı (QR kodu, elle giriş anahtarı, doğrulama ve bir devre dışı bırakma penceresi).

## Gerekli İzinler

- **Auth Guard Ayarlarını Yönet** (`MANAGE_AUTH_GUARD_SETTINGS`) — captcha, 2FA ve sihirli girişi yapılandırın.
- **Oyuncuların 2FA'sını Yönet** (`MANAGE_PLAYER_TWO_FACTOR`) — oyuncuların 2FA'sını görüntüleyin, kaldırın ve onlar adına kurun.

## Ön Koşullar

- **Bir premium lisans.** Resmi derlemeler panomc.com lisans anahtarını gömer ve başlamak için api.panomc.com'dan alınan geçerli bir lisans gerektirir.
- Seçtiğiniz sağlayıcıdan **bir captcha hesabı ve anahtarları**. Google reCAPTCHA **Enterprise** ayrıca bir **Google Cloud proje kimliği** ve API anahtarı gerektirir (klasik reCAPTCHA gizli anahtarlarını kullanmak için **Legacy Mode**'u açın).
- Pano'da **yapılandırılmış giden e-posta (SMTP)** — sihirli giriş bağlantılarını e-postayla gönderir.
- Eklenti, başlatılmadan önce Pano'nun **ilk kurulumunun** tamamlanmasını bekler.

::: warning Sihirli bağlantı süresi 15 dakikada sabittir
Panelin **Sihirli Bağlantı Süresi (dakika)** alanı şu anda yalnızca görseldir — sihirli giriş bağlantıları, girdiğiniz değere bakılmaksızın her zaman **15 dakika** sonra sona erer ve e-postadaki süre-sonu cümlesine de yapılandırılan değer aktarılmaz.
:::

## Kurulum

1. Pano sitenizde aktif bir **premium lisans** olduğundan emin olun, ardından eklentiyi **Pano Yönetim Paneli**'nden etkinleştirin.
2. **Eklentiler → Pano Auth Guard**'ı açın ve **Auth Guard Ayarları** kartını genişletin.
3. Bir **captcha sağlayıcısı** seçin, **site/gizli anahtarlarınızı** (reCAPTCHA Enterprise için ayrıca bir Google Cloud proje kimliği) yapıştırın ve hangi formların korunacağını seçin.
4. İsteğe bağlı olarak **2FA** (bir yayıncı adı belirleyin) ve **sihirli girişi** etkinleştirin — önce sitenizin **SMTP e-postasının** yapılandırıldığından emin olun.
