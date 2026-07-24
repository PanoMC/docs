# Cookies Eklentisi

**Cookies** eklentisi, Pano sitenize özelleştirilebilir bir çerez onayı bildirimi ekler. Banner'ın metnini, stilini, konumunu ve renklerini yönetim panelinden yapılandırırsınız; ziyaretçiler ardından kabul düğmesine tıklayana kadar temanızda bir onay banner'ı görür — tıkladıktan sonra seçim o tarayıcıda hatırlanır ve banner bir daha görünmez. Bu, tam bir onay yönetimi aracı değil, bilgilendirici bir bildirimdir ("çerez kullanıyoruz… Anladım!").

::: warning GDPR onay yöneticisi değildir
Bu, basit ve bilgilendirici bir onay bildirimidir. **Reddetme seçeneği, çerez kategorileri veya sunucu tarafında onay kaydı yoktur** — kabul yalnızca ziyaretçinin tarayıcısında saklanır (localStorage anahtarı `pano-cookies-accepted`). Bunu GDPR uyumluluk aracı olarak kullanmayın.
:::

## Özellikler
- **Etkinleştir / Devre Dışı Bırak:** Tüm banner için tek bir anahtar.
- **Düzenlenebilir Metin:** Mesajı, kabul düğmesi etiketini ve çerez veya gizlilik politikanıza yönlendiren isteğe bağlı bir **Daha fazla bilgi** bağlantısını (metin + URL) özelleştirin.
- **Üç Tasarım:** **Bar** (tam genişlikte şerit), **Floating** (en fazla 400px genişliğinde bir kart) veya **Modal** (kararmış bir sayfa üzerinde ortalanmış bir pencere).
- **Konum Seçenekleri:** Açılır menü **Üst**, **Alt** ve dört köşe (Üst/Alt Sol/Sağ) sunar, ancak her tasarım bunlara uymaz. **Bar**, **Üst** ve **Alt** için doğru konumlanır. **Floating** yalnızca sade **Üst** / **Alt** için konumlanır; dört köşe seçeneği herhangi bir CSS'e bağlı değildir ve etkisi yoktur. **Modal** konum ayarını tamamen yok sayar — her zaman ortalanmış bir pencere olarak görüntülenir. (Bkz. Bilinen Kısıtlamalar.)
- **Renkler:** Üç seçici — birincil (düğme, bağlantı, kenarlık), metin ve arka plan. Varsayılanlar: `#007bff`, `#ffffff`, `#343a40`.
- **Özel HTML Modu:** Yerleşik düzeni tamamen kendi HTML'inizle değiştirin; panelin zengin metin/HTML editöründe canlı önizleme ile düzenlenir. Bunu kullandığınızda, kendi kabul mekanizmanızı işaretlemeye (markup) eklemeyi unutmayın.
- **Etkinlik Günlüğü:** Yapılandırma değişiklikleri panel etkinlik günlüğüne kaydedilir.

## Ayarlar Nerede?
Eklentinin özel bir menü girişi yoktur. Ayarları, eklentinin kendi detay sayfasında bir **Cookies Ayarları** kartı olarak görünür.

1. Eklentiyi **Pano Yönetim Paneli**'nden etkinleştirin.
2. **Eklentiler → Cookies**'e gidin.
3. **Cookies Ayarları** kartında mesajı, tasarımı, konumu ve renkleri ayarlayın.
4. **Kaydet**'e basın — düğme siz bir şey değiştirene kadar devre dışı kalır ve bir bildirim sonucu onaylar.

::: tip Kutudan çıktığı gibi çalışır
Ön koşul yoktur — harici bir servis, veritabanı tablosu veya premium hesap gerekmez. Eklenti, makul bir İngilizce varsayılan mesajla etkin olarak gelir; böylece banner, bir ziyaretçi kabul edene kadar kurulumdan hemen sonra görünür.
:::

## Ziyaretçiler Ne Görür
Her sayfada temanızın en üstüne tek bir onay banner'ı eklenir; seçtiğiniz tasarıma, konuma ve renklere göre stillendirilir. Mesajınızı, isteğe bağlı politika bağlantısını (yeni sekmede açılır) ve kabul düğmesini gösterir. Kabul'e tıklamak, onu o tarayıcı için kalıcı olarak gizler. Kabul edildikten sonra ya da eklenti devre dışıyken hiçbir şey gösterilmez.

## Bilinen Kısıtlamalar
::: warning
- **Modal** tasarımında çevrilmeyen, Türkçe sabit kodlanmış bir başlık ("Çerez Politikası" / "Cookie Policy") vardır — İngilizce ve Rusça siteler orada Türkçe metin gösterir.
- Konum açılır menüsü **Floating** ve **Modal** için yalnızca kısmen bağlanmıştır. **Floating** için sade **Üst** veya **Alt** kullanın — dört köşe seçeneği (Üst/Alt Sol/Sağ) var olmayan CSS sınıflarına eşlenir; bu nedenle köşeye ayarlanmış bir kart, bir köşeye sabitlenmek yerine sayfanın üstünde akış içinde görüntülenmeye geri döner. **Modal** için konum ayarı etkisizdir: seçtiğinizden bağımsız olarak her zaman kararmış bir sayfa üzerinde ortalanmış bir pencere olarak görüntülenir.
:::

## Gerekli İzin
Ayarları görüntülemek veya kaydetmek için kullanıcıların **Cookies Yönet** iznine ihtiyacı vardır:
`pano.plugin.pano-plugin-cookies.manage.cookies`

## Yerelleştirme
Eklenti arayüzü **İngilizce**, **Türkçe** ve **Rusça** dillerinde tamamen çevrilmiştir.

## Açık Kaynak
Bu eklenti açık kaynaklıdır ve **MIT Lisansı** ile lisanslanmıştır. Kaynak koduna GitHub üzerinden erişebilirsiniz:
- [Kaynak Kodu](https://github.com/PanoMC/pano-plugin-cookies)
