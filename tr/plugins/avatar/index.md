# Avatar Eklentisi

**Avatar** eklentisi, her kayıtlı kullanıcının profil resminin nereden geleceğini seçmesini sağlar — **Minecraft skin kafası**, **Gravatar**'ları ya da **özel olarak yüklenen bir görsel**. Seçilen avatar, ardından bir kullanıcının resminin gösterildiği her yerde site genelinde varsayılan profil resminin yerini alır. Yöneticiler hangi kaynaklara izin verileceğine karar verir, yükleme boyutu ve tür sınırlarını belirler ve herhangi bir oyuncunun avatarını doğrudan panelden değiştirebilir.

## Özellikler

- **Üç avatar kaynağı:**
  - **Minotar** — oyuncunun Minecraft skin yüzü, `minotar.net` üzerinden yüklenir. Bu, hiç kaynak seçmemiş kullanıcılar için varsayılandır.
  - **Gravatar** — kullanıcının hesap e-postasına bağlı, küresel olarak tanınan avatar (bir `identicon` yedeğiyle).
  - **Özel Yükleme** — kullanıcının sağladığı bir görsel.
- **Optimize edilmiş yüklemeler:** JPG, PNG ve GIF kabul edilir (yapılandırılabilir). Görseller sıkıştırılıp en fazla 256 piksele küçültülürken, GIF'ler animasyonlarını korumak için olduğu gibi saklanır. Bir kullanıcı görselini değiştirdiğinde veya kaynak değiştirdiğinde eski dosyalar otomatik olarak temizlenir.
- **Yönetici geçersiz kılma:** Paneldeki oyuncu düzenleme penceresinden herhangi bir oyuncunun avatarını değiştirin veya kaldırın.
- **Etkinlik günlüğü:** Ayar ve oyuncu avatarı değişiklikleri panel etkinlik günlüğüne kaydedilir.
- **Yerelleştirme:** İngilizce, Türkçe ve Rusça çevirilerle gelir.
- **Temiz kaldırma:** Eklenti kaldırıldığında veritabanı tablosunu ve yüklenen tüm dosyaları siler.

::: tip
Minotar avatarları yalnızca web sitesi kullanıcı adlarınız gerçek Minecraft hesaplarıyla eşleştiğinde anlamlıdır. Minotar ve Gravatar görselleri her ziyaretçinin tarayıcısı tarafından doğrudan `minotar.net` / `gravatar.com` üzerinden yüklenir; bu nedenle bu servislerin ziyaretçilerinizden erişilebilir olması gerekir.
:::

## Kullanıcılarınız için

Eklenti etkinleştirildiğinde, giriş yapmış kullanıcılar hesap **Ayarlar** sayfalarının en üstünde bir **Profil Avatar Ayarları** bölümü bulur. Buradan izin verilen bir kaynak seçebilir, canlı bir önizleme görebilir ve — özel yüklemeler için — görsellerini yükleyebilir, önizleyebilir veya kaldırabilirler. Yalnızca izin verdiğiniz kaynaklar gösterilir.

## Yönetici ayarları

- **Eklenti ayarları:** **Panel → Eklentiler → Avatar**'ı açın. **Avatar Ayarları** kartı, **Maksimum Yükleme Boyutu**'nu (MB cinsinden), **İzin Verilen Görsel Türleri**'ni (PNG / JPEG / GIF) ve **İzin Verilen Avatar Kaynakları**'nı (Minotar / Gravatar / Özel Yükleme) belirlemenizi sağlar.
- **Bir oyuncunun avatarını düzenleme:** Bir oyuncunun detay sayfasını açın ve resmini değiştirmek veya kaldırmak için düzenleme penceresindeki **Profil Avatarı** satırını kullanın.

## Gerekli İzinler

- **Avatar Ayarlarını Yönet** — eklentinin izin verilen kaynaklarını, dosya türlerini ve boyut sınırlarını yapılandırın.
- **Oyuncu Avatarını Yönet** — oyuncu detay sayfasından oyuncu profil avatarlarını değiştirin.

::: warning
Ayarlar kartındaki **Özel URL Kaynakları** oluşturucusu henüz çalışmıyor. Girdileri yapılandırabilirsiniz, ancak bunları tüketen henüz bir şey yok — seçilebilir bir avatar kaynağı olarak görünmezler. Şimdilik bu bölümü boş bırakın.
:::

## Açık Kaynak

Bu eklenti açık kaynaklıdır ve **MIT Lisansı** ile lisanslanmıştır. Kaynak koduna GitHub üzerinden erişebilirsiniz:
- [Kaynak Kodu](https://github.com/panomc/pano-plugin-avatar)

## Kurulum

1. Eklentiyi **Pano Yönetim Paneli**'nden etkinleştirin.
2. **Panel → Eklentiler → Avatar**'a gidin.
3. **Avatar Ayarları**'nızı (izin verilen kaynaklar, görsel türleri ve maksimum yükleme boyutu) yapılandırın.
4. Kullanıcılar artık avatarlarını hesap **Ayarlar** sayfalarından seçebilir!
