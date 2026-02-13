# Duyurular (Announcement) Eklentisi

**Announcement** eklentisi, topluluğunuza bilgi iletmek için kullanılan güçlü bir araçtır. **Banner** ve **Modal** (Açılır Pencere) olmak üzere iki ana gösterim türünü destekler ve her biri kendine özgü özelleştirme seçeneklerine sahiptir.

## 📢 Gösterim Türleri

### 1. Banner
Banner'lar web sitenizin en üstünde görünür ve hızlı güncellemeler veya kalıcı bildirimler için idealdir.
- **Çoklu İçerik:** Tek bir banner'a birden fazla içerik sekmesi ekleyebilirsiniz.
- **Efektler:** `NONE` (Yok), `MARQUEE` (Kayan yazı) ve `FLASH` efektlerinden birini seçin.
- **Özel Stiller:** Çeşitli renk şemaları seçin (`PRIMARY`, `SUCCESS`, `DANGER`, `WARNING` vb.).
- **Hizalama:** Metninizi `SOL`, `ORTA` veya `SAĞ` olarak hizalayın.
- **Konum:** Banner'ı `GLOBAL` (tüm sayfalar) veya sadece `ANA SAYFA` üzerinde gösterin.
- **Kapatılabilir:** İsteğe bağlı olarak kullanıcıların banner'ı kapatmasına izin verin.

### 2. Modal (Açılır Pencere)
Modal'lar, kullanıcının dikkatini anında çeken açılır pencerelerdir.
- **Zengin İçerik:** Yerleşik editör aracılığıyla HTML ve zengin metin desteği.
- **Görsel Desteği:** Tanıtım görselleri veya afişler yükleyin (maksimum 2MB).
- **Boyutlar:** `KÜÇÜK`, `NORMAL`, `BÜYÜK` veya `TAM EKRAN` seçeneklerinden birini seçin.
- **Sıklık:** Modal'ı kullanıcılara `HER ZAMAN` veya oturum başına sadece `BİR KEZ` gösterin.

## 🗓️ Planlama ve Görünürlük
- **Durum Yönetimi:** `AKTİF` ve `TASLAK` modları arasında geçiş yapın.
- **Gecikmeli Başlatma:** Bir duyuruyu ileri bir tarihte yayınlamak için **Başlangıç Tarihi** özelliğini kullanın.
- **Otomatik Bitiş:** Duyuru artık geçerli olmadığında otomatik olarak gizlenmesi için bir **Bitiş Tarihi** ayarlayın.

## 🎨 Gelişmiş Özelleştirme
- **Özel CSS:** Her duyurunun kendi CSS bölümü vardır. Benzersiz ID seçiciyi (örneğin `#pano-announcement-5`) kullanarak doğrudan stil uygulayın.
- **Eylem Çağrısı (CTA):** Duyurularınıza iç veya dış bağlantılar ekleyin ve yeni sekmede açılma seçeneğini kullanın.

## 🛡️ Gereken İzin
Duyuruları yönetmek için kullanıcıların aşağıdaki izne sahip olması gerekir:
`pano.plugin.pano-plugin-announcement.manage.announcements`

## 📖 Açık Kaynak
Bu eklenti açık kaynaklıdır ve **GPLv3** ile lisanslanmıştır. Kaynak koduna GitHub üzerinden erişebilirsiniz:
- [Kaynak Kodu](https://github.com/PanoMC/pano-plugin-announcement)

## 🔧 Kurulum
1. Pano Yönetim Panelinden eklentiyi etkinleştirin.
2. **Panel → Duyurular** yolunu izleyin.
3. İlk duyurunuzu oluşturun ve görünümünü özelleştirin!
