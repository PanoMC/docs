# Staff Page Eklentisi

**Staff Page** eklentisi, sunucunuzun ekibini web sitenizde sergilemenize olanak tanır. Bir yetkili kadrosunu — adlar, roller, avatarlar, açıklamalar ve sosyal bağlantılar — panelden yönetirsiniz ve ziyaretçiler bunu ya özel bir **Yetkililer** sayfası (sitenizin gezinmesine otomatik olarak eklenir) olarak ya da temanızın destek sayfasında gömülü bir **Destek Ekibi** bölümü olarak görür. Amaç, topluluğunuzun arkasındaki insanları öne çıkarmanın temiz, özelleştirilebilir bir yoludur.

## Özellikler

- **Yetkili Kadrosu:** Her üyeyi bir ad, rol (bir rozet olarak gösterilir), sıralama önceliği, avatar görseli, serbest metin açıklaması ve istediğiniz sayıda sosyal bağlantıyla ekleyin.
- **Minotar Avatarları:** Üyenin Minecraft kullanıcı adından bir avatarı otomatik doldurmak için **Minotar Kullan**'a tıklayın. Bir avatar URL'si ayarlanmamışsa, tema otomatik olarak Minotar helm render'ına geri döner.
- **Akıllı Sosyal Simgeler:** Discord, Twitter/X, Instagram, GitHub, YouTube ve Twitch bağlantıları otomatik olarak marka simgeleriyle (araç ipuçlarıyla) eşleştirilir; başka herhangi bir şey genel bir bağlantı simgesi alır.
- **Üç Görünüm Modu:** Yetkilileri **List** (yatay satırlar), **Card** (ortalanmış kartlar — varsayılan) veya **Grid** (üzerine gelince kaplama gösteren fotoğraf karoları) olarak görüntüleyin.
- **İki Görüntüleme Konumu:** Yetkilileri seçtiğiniz bir URL'de özel bir **Tema Sayfası**'nda gösterin ya da temanızın **Destek** sayfasına ekleyin.
- **Etkinlik Günlüğü:** Her oluşturma, güncelleme, silme ve ayar değişikliği, işlemi yapan yöneticinin kullanıcı adıyla panel etkinlik günlüğüne kaydedilir.
- **Yerelleştirme:** İngilizce, Türkçe ve Rusça'ya tamamen çevrilmiştir.

## Yetkililerinizi Yönetme

Panel kenar çubuğunda, **Oyuncular**'ın hemen ardından bir **Staffs** bağlantısı (users-cog simgesi) görünür. Bu, **Yetkili Yönetimi** sayfasını açar; burada şunları yapabilirsiniz:

- Toplam yetkili sayınızı görün.
- Bir pencere aracılığıyla **Yetkili Ekle**yin ya da tablodan herhangi bir üyeyi **düzenleyin** / **silin**.

Üyeler **önceliğe** göre (önce daha küçük sayılar), ardından ada göre alfabetik olarak sıralanır.

## Ayarlar

Görüntüleme ayarları, yönetim sayfasında değil, eklentinin kendi **detay sayfasında**, **Ayarlar** kartı altında yer alır:

- **Görüntüleme Konumu:** Tema Sayfası veya Destek Bölümü.
- **Sayfa URL'si:** Özel sayfanın yolu (varsayılan `/staff`). Yalnızca Tema Sayfası modunda düzenlenebilir.
- **Görünüm Modu:** List, Card veya Grid.

::: tip
**Destek Bölümü** konumunu kullandığınızda, Görünüm Modu ayarından bağımsız olarak yetkililer her zaman **Card** düzeninde gösterilir.
:::

::: tip
**Sayfa URL'si**'ni değiştirmek, sayfa ve gezinme öğesi başlangıçta kaydedildiği için, ziyaretçiler için tema uygulaması bir sonraki yüklenişinde geçerli olur.
:::

## Gerekli İzinler

- **`MANAGE_STAFF`** — yetkili üyeleri ekleyin, düzenleyin ve silin (ayrıca kenar çubuğu bağlantısının ve yönetim sayfasının kilidini açar).
- **`MANAGE_STAFF_SETTINGS`** — sayfa URL'sini, görünüm modunu ve görüntüleme konumunu değiştirin.

## Açık Kaynak

Bu eklenti açık kaynaklıdır ve **GPLv3** ile lisanslanmıştır. Kaynak koduna GitHub üzerinden erişebilirsiniz:
- [Kaynak Kodu](https://github.com/panomc/pano-plugin-staff-page)

## Kurulum

1. Eklentiyi **Pano Yönetim Paneli**'nden etkinleştirin.
2. **Panel → Staffs**'ı açın ve ekip üyelerinizi ekleyin.
3. Bir görüntüleme konumu ve görünüm modu seçmek için eklentinin **detay sayfası → Ayarlar**'ını açın.
4. Yetkililerinizi görmek için sitenizi ziyaret edin (varsayılan olarak Card modunda `/staff`)!
