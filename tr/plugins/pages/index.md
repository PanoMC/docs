# Sayfalar (Pages) Eklentisi

**Pages** eklentisi, web siteniz için özel statik sayfalar oluşturmanıza olanak tanır. İster basit bir "Kurallar" sayfası, ister karmaşık bir tanıtım sayfası (landing page) ihtiyacınız olsun; bu eklenti gerekli esnekliği ve araçları sağlar.

## Sayfa Yapılandırması

Bir sayfa oluştururken veya düzenlerken aşağıdaki yapılandırma seçeneklerine erişebilirsiniz:

### URL ve Navigasyon
- **Özel URL Yolu:** Sayfanız için tam yolu tanımlayın (örneğin: `/kurallar` veya `/hakkimizda`).
- **Bağlantı Adı:** Navigasyon menülerinde görünecek özel bir isim belirleyin.
- **Temaya Kaydet (Register to Theme Nav):** Sayfayı temanızın ana navigasyon çubuğuna otomatik olarak ekler.
- **Hedef (Target):** Sayfa bağlantılarının ayn sekmede mi (`_self`) yoksa yeni sekmede mi (`_blank`) açılacağını seçin.

> [!TIP]
> **Sıralama:** Resmi bir Pano teması kullanıyorsanız, bu dinamik bağlantıların sırasını **Tema Ayarları** sayfası üzerinden sürükle-bırak yöntemiyle değiştirebilirsiniz.

### Erişim ve İzinler
- **Giriş Gerekli:** Sayfa görünürlüğünü kesin olarak sadece giriş yapmış kullanıcılarla sınırlandırın.
- **İzin Düğümü (Permission Node):** Sayfayı görüntülemek için gereken özel bir izin düğümü (örneğin: `sunucu.admin`) atayın.

### Yerleşim ve Tasarım
- **Yerleşimi Sıfırla (Reset Layout):** Bu sayfa için temanın varsayılan başlık (header) ve altbilgi (footer) bölümlerini kaldıran güçlü bir özellik. Özel tanıtım sayfaları veya sade içerikler oluşturmak için idealdir.
- **Ekmek Kırıntısı (Breadcrumb) Göster:** Sayfanın üst kısmındaki navigasyon yolunu (breadcrumb) açıp kapatın.
- **Zengin Metin Düzenleyici:** HTML, Markdown ve özel bileşenler içeren içerikler oluşturmak için yerleşik Düzenleyiciyi kullanın.

## Gereken İzin
Sayfa oluşturmak ve yönetmek için kullanıcıların aşağıdaki izne sahip olması gerekir:
`pano.plugin.pano-plugin-pages.manage.pages`

## Açık Kaynak
Bu eklenti açık kaynaklıdır ve **GPLv3** ile lisanslanmıştır. Kaynak koduna GitHub üzerinden erişebilirsiniz:
- [Kaynak Kodu](https://github.com/PanoMC/pano-plugin-pages)

## Kurulum
1. Pano Yönetim Panelinden eklentiyi etkinleştirin.
2. **Panel → Sayfalar** yolunu izleyin.
3. **Yeni Sayfa Oluştur** butonuna tıklayarak içeriğinizi oluşturmaya başlayın!
