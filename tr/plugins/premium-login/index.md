# Premium Login Eklentisi

**Premium Login** eklentisi, Pano tabanlı web siteniz ile Minecraft sunucunuz arasında Minecraft hesabı kimlik doğrulamasını köprüler. Ziyaretçiler, tam Microsoft OAuth zinciri (Microsoft → Xbox Live → XSTS → Minecraft Services) aracılığıyla gerçek Microsoft/Minecraft (premium) hesaplarıyla giriş yapabilir veya kayıt olabilir; böylece gerçek oyun sahipliği doğrulanır. Eklenti ardından oyuncu bazında bir kimlik doğrulama durumunu — **PREMIUM**, **CRACKED** veya **AUTO** — web sitesi ile oyun sunucusu arasında canlı olarak senkronize tutar; böylece premium oyuncular şifresiz olarak otomatik giriş yaparken cracked oyuncular offline-mode kimlik doğrulaması kullanır. Pano ekibi tarafından geliştirilmiştir.

::: tip Tek jar, iki kurulum
Aynı jar, hem bir **Pano platform eklentisi** (web sitenize kurulur) hem de Spigot/Paper (Folia desteğiyle), BungeeCord ve Velocity için bir **Minecraft sunucu eklentisidir**. Sunucu tarafı, **Pano MC eklentisi** ve **FastLogin**'e bağımlıdır — Pano MC eklentisi eksikse kendini devre dışı bırakır ve FastLogin dinleyicilerini yalnızca web sitesine giden WebSocket bağlıyken etkinleştirir.
:::

## Özellikler

- **Minecraft ile giriş yap:** Microsoft girişi etkin olduğunda giriş ve kayıt sayfalarında "Minecraft Hesabıyla Giriş Yap / Kayıt Ol" düğmeleri görünür.
- **Akıllı Hesap Yönetimi:** Microsoft girişinde, yeni bir ziyaretçi MC kullanıcı adı, UUID ve (önceden doğrulanmış) Microsoft e-postasından otomatik olarak kayıt edilip oturuma alınır; zaten bağlı bir UUID doğrudan giriş yapar; ve bir cracked hesap kullanıcı adına zaten sahipse, o hesap `tmp_xxxxxx` olarak yeniden adlandırılır ve premium oyuncunun adı sahiplenebilmesi için kendisine bir **Yeni Kullanıcı Adı Belirle** bağlantısı (15 dakikalık süre) e-postayla gönderilir.
- **Hesap Bağlama:** Giriş yapmış üyeler, premium Minecraft hesaplarını ayarlarından bağlayabilir veya bağlantısını kaldırabilir — premium'a geçerken veriler korunur ve her UUID yalnızca bir hesaba bağlanabilir.
- **Kimlik Doğrulama Durumu:** Her oyuncunun, eklentinin kendi veritabanında saklanan, kaynak izlemeli (PANEL, SERVER, FASTLOGIN, USER, MICROSOFT) bir **PREMIUM / CRACKED / AUTO** durumu vardır. Kullanıcılar, ayarlarından sade dilli bir açılır menü aracılığıyla kendi durumlarını seçebilir.
- **Canlı Sunucu Senkronizasyonu:** Eklenti, kimlik doğrulama modu belirlenmeden önce Pano'nun yetkili durumunu enjekte etmek için FastLogin'in ön-giriş olayını yakalar, FastLogin'in otomatik algıladığı premium girişlerini Pano'ya geri iletir ve bir yönetici panelde bir durumu değiştirdiğinde anında güncellemeler uygular.
- **Yerelleştirme:** İngilizce, Türkçe ve Rusça olarak mevcuttur.

## Panel Ayarları

Ayarlar, **Pano Yönetim Paneli**'nde eklentinin kendi detay sayfasında (Eklentiler → Premium Login), **Microsoft Giriş Ayarları** altında yer alır:

- Bir **etkinleştir** anahtarı, **Client ID**, **Client Secret** ve **Redirect URI**, ayrıca adım adım OAuth sorun giderme için bir **Debug Logging** anahtarı.
- **Client Secret** maskeli olarak saklanır — açığa çıkarmak, yöneticinin kendi şifresini yeniden girmesini gerektirir.
- Gömülü bir **adım adım Azure Portal kurulum kılavuzu** ve tüm kullanıcıların özelliği kullanabilmesi için Microsoft'un uygulama doğrulaması (aka.ms/AppRegInfo) gerektirdiğine dair bir not.
- **Oyuncu Yönetimi:** oyuncu düzenleme penceresinde bir *Kimlik Doğrulama Durumu* satırı ve oyuncu detay sayfasında bir *Kimlik Doğrulama Durumu* kartı — hesap türünü, son-güncelleme kaynağını ve premium-bağlantı durumunu, bir bağlantı kaldırma düğmesiyle (geri al ile birlikte) gösterir.

## Ziyaretçiler Ne Görür

- Giriş ve kayıt sayfalarında (bir "veya" ayırıcısıyla) Microsoft giriş/kayıt düğmeleri.
- Hesap ayarlarında bir *Kimlik Doğrulama Durumu* satırı (bir tür açılır menüsü ile premium hesap bağla/bağlantı kaldır).
- Herkese açık profil kenar çubuğunda bir *Kimlik Doğrulama Durumu* kartı, giriş yaptıktan sonra bir başarı bildirimi ve kullanıcı-adı-değiştirme e-postasından ulaşılan bir `/set-username` sayfası.

## Gerekli İzinler

- **Premium Durumunu Yönet** (`MANAGE_PREMIUM_STATUS`) — oyuncu sayfalarından bir oyuncunun kimlik doğrulama durumunu görüntüleyin ve değiştirin.
- **Premium Login Ayarlarını Yönet** (`MANAGE_PREMIUM_LOGIN_SETTINGS`) — Microsoft OAuth ayarlarını yapılandırın.

Her ikisi de panel rollerine atanabilir ve panel kontrolleri bunlarla denetlenir.

## Ön Koşullar

- **Bir premium lisans.** Premium Login ücretli bir eklentidir: başlangıçta bir panomc.com lisansını doğrular ve biri olmadan başlamaz.
- **Bir Microsoft Azure uygulaması.** Azure Portal'da bir uygulama kaydedin (kişisel Microsoft hesapları türü), **Client ID** ve **Client Secret**'ı sağlayın ve yönlendirme URI'sini `https://yoursite.com/api/premium-login/microsoft/callback` olarak ayarlayın. Özelliği genel kullanıma açmak için uygulamayı Microsoft'a doğrulama için gönderin.
- **Sunucu tarafı senkronizasyon**, Spigot/Bungee/Velocity sunucunuzda kurulu **Pano MC eklentisini** (web sitenize bağlı) ve **FastLogin**'i gerektirir (FastLogin, Spigot'ta ProtocolLib'i ima eder).
- Kullanıcı-adı-çakışması e-postaları için **yapılandırılmış bir posta sistemi** ve eklenti başlatılmadan önce tamamlanmış bir site kurulumu.

::: tip Premium eklenti
Premium Login, aktif bir panomc.com lisansı gerektirir. Bunu Pano kaynak mağazasından edinebilirsiniz; ücretsiz ve geliştirme derlemeleri lisans kontrolünü es geçer.
:::

## Kaynak Kodu

Geliştirme açıkta yapılır — GitHub üzerinden takip edebilirsiniz:
- [Kaynak Kodu](https://github.com/PanoMC/pano-plugin-premium-login)

## Kurulum

1. Pano sitenizde aktif bir **premium lisans** olduğundan emin olun ve eklentiyi **Pano Yönetim Paneli**'nden etkinleştirin.
2. **Premium Login** eklentisinin detay sayfasını açın ve **Microsoft Giriş Ayarları**'nı genişletin.
3. Bir uygulama oluşturmak için gömülü Azure kılavuzunu izleyin, ardından **Client ID**, **Client Secret** ve **Redirect URI**'nizi yapıştırın ve Microsoft girişini açın.
4. Kimlik doğrulama durumunun site ile oyun arasında canlı senkronize olması için Minecraft sunucunuza **Pano MC eklentisini** ve **FastLogin**'i kurun.
