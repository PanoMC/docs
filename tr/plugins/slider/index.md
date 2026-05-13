# Slider Eklentisi

**Slider** eklentisi, web sitenize dinamik ve etkileşimli bir içerik karuzeli ekler. Yüksek ölçüde özelleştirilebilir yapısı sayesinde ana sayfanız veya diğer sayfalarınız için etkileyici bölümler oluşturmanıza olanak tanır.

## Genel Ayarlar

Slider'ın davranışı, ayarlar panelinden küresel olarak yapılandırılabilir:

### Gösterim ve Konum
- **Render Hook (Yerleşim):** Slider'ın nerede görüneceğini seçin (örneğin: `ANA SAYFA ÜST` veya `SAYFA ÜSTÜ`).
- **Sadece Ana Sayfa:** Slider görünürlüğünü kesin olarak sadece ana sayfa ile sınırlandırma seçeneği.

### Geçişler ve Davranış
- **Otomatik Kaydırma:** Özelleştirilebilir bir **Aralık** (milisaniye) ile otomatik slayt geçişlerini etkinleştirin.
- **Üzerine Gelince Duraklat:** Bir kullanıcı fareyi slider üzerine getirdiğinde otomatik kaydırmayı geçici olarak durdurur.
- **Geçiş Efektleri:** **Kayma (Slide)** veya **Kararma (Fade)** animasyonları arasında geçiş yapın.
- **Döngü:** Sonsuz slayt döngüsünü etkinleştirmek için **Wrap** ayarlarını kullanın.

### Görsel Kontroller
- **Göstergeler ve Kontroller:** Navigasyon noktalarının (göstergeler) ve önceki/sonraki oklarının görünürlüğünü ayarlayın.
- **Başlık Stilleri:** `SOLID` (Katı), `GLASS` (Cam) veya `GRADIENT` (Gradyan) başlık arka planlarından birini seçin.
- **Şeffaflık ve Bulanıklık:** Başlık opaklığını ve arka plan bulanıklığını (Cam efekti için) ayarlayın.
- **Tipografi:** Başlıklar ve alt başlıklar için özel renkler belirleyin ve uygun SEO başlık etiketini (`H1`–`H6`) seçin.

## Slider Öğeleri

Karuzeldeki her bir slayt aşağıdaki alanlarla bireysel olarak yönetilebilir:

- **Görsel:** Yüksek kaliteli görsel yükleme (5MB'a kadar PNG, JPEG, GIF, WEBP desteği).
- **Başlık ve Alt Başlık:** Görselin üzerinde görüntülenen metin içeriği.
- **Bağlantı URL'si:** Slaytı tıklanabilir bir eylem çağrısı (CTA) haline getirin.
- **Yeni Sekme:** Bağlantıların aynı sayfada mı yoksa yeni bir tarayıcı sekmesinde mi açılacağını kontrol edin.
- **Sürükle-Bırak Sıralama:** Yönetim tablosundaki satırları sürükleyerek slaytları kolayca yeniden sıralayın.

## Gereken İzin
Slider ayarlarını ve öğelerini yönetmek için kullanıcıların aşağıdaki izne sahip olması gerekir:
`pano.plugin.pano-plugin-slider.manage.slider`

## Açık Kaynak
Bu eklenti açık kaynaklıdır ve **GPLv3** ile lisanslanmıştır. Kaynak koduna GitHub üzerinden erişebilirsiniz:
- [Kaynak Kodu](https://github.com/PanoMC/pano-plugin-slider)

## Kurulum
1. Pano Yönetim Panelinden eklentiyi etkinleştirin.
2. **Panel → Görünüm → Slider** yolunu izleyin.
3. Önce **Genel Ayarlarınızı** yapılandırın.
4. **Slider Öğelerinizi** ekleyin ve tercih ettiğiniz sıraya sürükleyin!
