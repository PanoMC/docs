# Whitelist Eklentisi

**Whitelist** eklentisi, sunucu sahiplerinin **kapalı veya açık beta** sırasında kimin katılabileceğini kontrol etmesine yardımcı olmak için tasarlanmıştır. Amaç, oyun içi komutlar yerine web sitesi panelinden yönetilen otomatik whitelist yönetimi, davetiyeler ve oyuncu bildirimleridir.

::: warning Deneysel — üretim için hazır değil
Bu eklenti erken aşama bir iskelettir. Bugün yalnızca tek bir **yalnızca-görüntüleme** panel sayfası ekler — arka uç, veritabanı, ayar veya herkese açık bir arayüz yoktur. Kurmak henüz hiçbir oyuncuyu gerçekten whitelist'e almaz. Aşağıda açıklanan özellikler, eklentinin amaçlanan yönüdür, yayınlanmış işlevsellik değildir.
:::

## Mevcut Durum

Şu anda eklentiyi etkinleştirdikten sonra elde ettikleriniz:

- Panel kenar çubuğunda bir **Whitelist** öğesi (scroll simgesi, **Oyuncular**'ın hemen üstünde yer alır).
- **Panel → Whitelist** adresinde, tek bir **Genel Bakış** sekmesi olan tek bir sayfa.
- Erişim modlarının yatay bir zaman çizelgesini gösteren bir **Modes** kartı. Bu şu anda sabit kodlanmış iki demo girişini — **Closed Beta** (etkin değil) → **Open Beta** (*Active* olarak işaretli) — statik bir diyagram olarak görüntüler. Henüz mod oluşturmanın, düzenlemenin veya etkinleştirmenin bir yolu yoktur.

Eklentinin bu aşamadaki kapsamı bu kadardır: bir kenar çubuğu bağlantısı ve statik bir taklit diyagram.

## Planlanan Özellikler

Bunlar eklentide açıklanmıştır ancak **henüz uygulanmamıştır**:

- **Erişim Modları:** Sitenizi *Closed Beta* ve *Open Beta* gibi durumlar arasında değiştirin.
- **Otomatik Whitelist Yönetimi:** Hangi oyuncuların katılmasına izin verildiğini panelden yönetin.
- **Davetiyeler:** Oyuncuları bir kapalı betaya davet edin.
- **Oyuncu Bildirimleri:** Oyuncuları whitelist / erişim durumları hakkında bilgilendirin.

## Gerekli İzin

Panel sayfası ve kenar çubuğu bağlantısı aşağıdaki izinle denetlenir:
`pano.plugin.pano-plugin-whitelist.manage.whitelist`

::: tip Ücretsiz eklenti
Whitelist ücretsiz bir eklentidir — premium hesap, lisans anahtarı veya harici servis gerekmez. Tek ön koşul, çalışan bir Pano kurulumudur.
:::

## Açık Kaynak

Bu eklenti açık kaynaklıdır ve **MIT Lisansı** ile lisanslanmıştır. Kaynak koduna GitHub üzerinden erişebilirsiniz:
- [Kaynak Kodu](https://github.com/PanoMC/pano-plugin-whitelist)

## Kurulum

1. Eklentiyi **Pano Yönetim Paneli**'nden etkinleştirin.
2. **Panel → Whitelist**'e gidin.
3. Mevcut (demo) erişim modlarını görmek için **Genel Bakış** sekmesini açın.
