# Countdown Timer Eklentisi

**Countdown Timer** eklentisi, bir lansmana veya etkinliğe geri sayım gösterir ve sayaç sıfıra ulaştığında normal site erişimini otomatik olarak geri getirir. Bunu tüm siteyi kaplayan bir "yakında" örtüsü, özel bir geri sayım sayfası ya da ana sayfanızın kenar çubuğunda kompakt bir bileşen olarak kullanın — süre dolduğunda isteğe bağlı bir kutlama efektiyle. Eklenti **varsayılan olarak devre dışıdır**, bu yüzden siz açana kadar hiçbir şey görünmez.

## Görüntüleme Modları

Geri sayımı göstermek için üç yoldan birini seçin:

- **Cover (Örtü):** Siteyi bir "yakında" ekranının arkasına kilitleyen tam sayfa kaplama. Bunu **Tüm Sayfalar** veya **Yalnızca Ana Sayfa** olarak kapsamlandırabilir ve isteğe bağlı olarak ziyaretçilerin bir **Atla** düğmesiyle kapatmasına izin verebilirsiniz.
- **Page (Sayfa):** Yapılandırılabilir bir URL'de (varsayılan `/countdown`) özel bir geri sayım sayfası; isteğe bağlı olarak özel bağlantı metniyle sitenizin gezinme çubuğuna eklenebilir.
- **Sidebar (Kenar Çubuğu):** Temanın ana sayfa kenar çubuğunda gösterilen küçük bir geri sayım kartı.

## Özellikler

- **Hassas Sayaç:** Saniyeye kadar kesin bir bitiş tarihi ve saati belirleyin; dakika, saat ve gün için hızlı ekleme düğmeleriyle. Sayaç her saniye canlı olarak azalır.
- **Başlık ve Mesaj:** Serbestçe düzenlenebilir başlık ve açıklama metni.
- **5 Görsel Tema:** Koyu, Açık, Blur (glassmorphism), Minimal ve Gradyan (başlangıç/bitiş renk seçicileriyle), ayrıca özel arka plan ve metin renkleri.
- **5 Sayaç Stili:** Simple (Basit), Boxed (Kutulu), Circular (Dairesel), Minimal (etiketsiz) ve Separated Digits (Ayrılmış Rakamlar).
- **Arka Plan Görseli:** Bir WEBP, JPEG, PNG veya GIF yükleyin (en fazla 5MB). Önceki yüklemenin yerini alır ve panelden silinebilir.
- **Markalama:** Web sitesi logonuzu açıp kapatın (Small 64px'ten Massive 512px'e 6 boyut) ve isteğe bağlı olarak Minecraft sunucu IP'nizi gösterin.
- **Açılış Efektleri:** Geri sayım sıfıra ulaştığında, örtü kaybolmadan hemen önce bir **Confetti** (Konfeti), **Fireworks** (Havai Fişek) veya **Sparkle** (Parıltı) efekti oynatın (ya da **None** — Yok).

## Ayarları Nerede Bulabilirim

Countdown Timer'ın özel bir menü öğesi yoktur. Ayarları, eklentinin kendi detay sayfasında tek bir **Countdown Timer Ayarları** kartı olarak görüntülenir:

1. Eklentiyi **Pano Yönetim Paneli**'nden etkinleştirin.
2. **Panel → Eklentiler → Countdown Timer**'a gidin.
3. Sayacı, görüntüleme modunu, görünümü ve efektleri yapılandırın, ardından **Kaydet**'e basın.

Her ayar ve arka plan değişikliği panel etkinlik günlüğüne kaydedilir.

::: tip Yöneticiler her zaman giriş yapabilir
**Cover** modunda giriş sayfası (`/login`) her zaman muaftır; böylece sitenin geri kalanı kilitliyken bile yöneticiler yine de giriş yapabilir. Hızlı erişim için örtünün altında isteğe bağlı bir yönetici bağlantısı gösterilir.
:::

::: warning "Sayaç Bittiğinde Yapılacak İşlemler" yalnızca Otomatik Gizle ile sınırlı
Bugün, sayaç sonu için tek işlem **Otomatik Gizle**'dir — sayaç sona erdiğinde, eklenti bir sonraki yapılandırma alımında kendini devre dışı bırakır ve normal site erişimi geri döner. İsteğe bağlı özel işlemler henüz mevcut değildir.
:::

## Gerekli İzin

Bu ayarları görüntülemek veya değiştirmek — ve arka plan görselini yüklemek veya silmek — için bir kullanıcının **MANAGE_COUNTDOWN_TIMER** iznine ("Geri sayım sayacı ayarlarını değiştirebilir") ihtiyacı vardır.

## Yerelleştirme

Eklenti, hem ayarlar panelini hem de ziyaretçiye yönelik geri sayımı kapsayan, **İngilizce (en-US)**, **Türkçe (tr)** ve **Rusça (ru)** için eksiksiz çevirilerle gelir.
