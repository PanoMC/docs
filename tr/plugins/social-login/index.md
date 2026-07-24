# Social Login Eklentisi

**Social Login** eklentisi, ziyaretçilerin Pano tabanlı web sitenize şifre yerine popüler sosyal platformlarla giriş yapmasına olanak tanır. **Google, Discord, Facebook, X (Twitter), GitHub, Twitch ve Instagram** için OAuth 2.0 girişi ekler — ziyaretçiler tek tıkla giriş yapabilir veya kayıt olabilir, mevcut üyeler bu hesapları profillerine bağlayıp bağlantısını kaldırabilir ve yöneticiler her sağlayıcıyı panelden yapılandırır. Her şey, üçüncü taraf bir aracı servis olmadan, doğrudan her sağlayıcının resmi OAuth API'sine karşı çalışır. Pano ekibi tarafından geliştirilmiştir, kullanımı ücretsizdir ve açık kaynaklıdır.

## Özellikler

- **Yedi Sağlayıcı:** Google, Discord, Facebook, X (Twitter), GitHub, Twitch ve Instagram — her biri bağımsız olarak etkinleştirilir.
- **Giriş ve Kayıt:** En az bir sağlayıcı etkin olduğunda, hem giriş hem de kayıt sayfalarında markalı "{sağlayıcı} ile Devam Et" düğmeleri görünür.
- **Akıllı Giriş Akışları:** Bağlı bir hesabı olan geri dönen kullanıcılar doğrudan giriş yapar; yeni ziyaretçiler bir kullanıcı adı ve şifre seçmek için bir "Hesabınızı Oluşturun" sayfası alır; ve e-postalarının zaten bir hesabı varsa, onu bağlamak için bir kez giriş yapmaları istenir.
- **Adımlı (Step-up) Destek:** Bir tamamlama adımı, diğer eklentilerden gelen 2FA kodları veya captcha gibi ekstra giriş kontrollerini yönetir (örneğin auth-guard'ın iki adımlı doğrulama istemi).
- **Hesap Bağlama:** Kullanıcı ayarlarındaki bir "Sosyal Hesaplar" kartı, üyelerin sağlayıcıları bağlamasına veya bağlantısını kaldırmasına olanak tanır ve profilleri salt-okunur bir "Bağlı Sosyal Hesaplar" kartı gösterir.
- **Yönetici Yönetimi:** Herhangi bir oyuncunun bağlı hesaplarını paneldeki detay sayfasından görüntüleyin ve bağlantısını kaldırın.
- **Dostça Hatalar:** İptal edilen girişler, süresi dolmuş bağlantılar, zaten bağlı hesaplar ve daha fazlası için net, yerelleştirilmiş mesajlar. İngilizce, Türkçe ve Rusça olarak mevcuttur.

## Yapılandırma

Tüm ayarlar, **Pano Yönetim Paneli**'nde eklentinin kendi detay sayfasında (Eklentiler → Social Login) yer alır — ayrı bir menü yoktur.

- **Sağlayıcı Bazında:** bir etkinleştir anahtarı, **Client ID**, **Client Secret** ve kaydedilecek tam **Redirect URI** için bir kopyalama düğmesi. Her sağlayıcının ayrıca, gerekli kapsamlarla (scope) ve o sağlayıcının geliştirici konsoluna ve resmi dokümanlarına doğrudan bağlantılarla, adım adım yerleşik bir kurulum kılavuzu vardır.
- **Genel Ayarlar:** bir **Redirect Base URL** (herkese açık kaynağınız, örn. `https://example.com`; platform web sitesi URL'sine geri dönmek için boş bırakın) ve adım adım OAuth sorun giderme için bir **Debug Logging** anahtarı.
- **Gizli Anahtar Yönetimi:** kaydedilen bir Client Secret maskelenir (`••••`). Açığa çıkarmak, kendi yönetici şifrenizi yeniden girmenizi gerektirir ve alana dokunmadan bırakmak saklanan değeri korur.

## Gerekli İzinler

- **Social Login Ayarlarını Yönet** — sağlayıcıları ve OAuth kimlik bilgilerini yapılandırın.
- **Sosyal Bağlantıları Yönet** — oyuncuların bağlı hesaplarını görüntüleyin ve bağlantısını kaldırın.

Panel kontrolleri bu izinlerle denetlenir.

## Ön Koşullar

Bir sağlayıcıyı etkinleştirmeden önce, o sağlayıcının geliştirici konsolunda bir OAuth uygulaması oluşturmalı ve panelde gösterilen tam yönlendirme URI'sini kaydetmelisiniz:

`{your-site}/api/social-login/{provider}/callback`

Siteniz herkese açık bir URL'den erişilebilir olmalıdır. Birkaç sağlayıcının, panel içi kılavuzun belirttiği ekstra gereksinimleri vardır:

- **Facebook:** uygulama **Live** moduna geçirilmelidir.
- **Instagram:** Instagram API ürünü olan bir Meta **Business** uygulaması gerektirir; App Review onayına kadar yalnızca eklenen test kullanıcıları giriş yapabilir.
- **X (Twitter):** bir OAuth 2.0 **Web App** (gizli istemci) kurulumu gerektirir.

::: tip Ücretsiz ve resmi
Social Login, Pano ekibi tarafından geliştirilip sürdürülür. Premium lisans veya panomc.com hesabı gerektirmez ve etkinleşmeden önce Pano'nun ilk kurulum sihirbazının tamamlanmasını bekler.
:::

## Açık Kaynak

Bu eklenti açık kaynaklıdır ve açıkta geliştirilir. Geliştirmeyi takip edebilir ve kaynak kodunu GitHub üzerinden görüntüleyebilirsiniz:
- [Kaynak Kodu](https://github.com/PanoMC/pano-plugin-social-login)

## Kurulum
1. Eklentiyi **Pano Yönetim Paneli**'nden etkinleştirin.
2. **Social Login** eklentisinin detay sayfasını açın.
3. İstediğiniz her sağlayıcı için, geliştirici konsolunda bir OAuth uygulaması oluşturun, gösterilen **Redirect URI**'yi kaydedin, ardından **Client ID** ve **Client Secret**'ı yapıştırın ve açın.
4. Herkese açık kaynağınız platform web sitesi URL'nizden farklıysa **Redirect Base URL**'yi ayarlayın, ardından kaydedin.
