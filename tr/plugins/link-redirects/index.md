# Link Redirects Eklentisi

**Link Redirects** eklentisi, kendi web sitenizde kısa, akılda kalıcı URL'ler oluşturmanıza olanak tanır — örneğin `yoursite.com/discord` — ziyaretçileri `https://discord.gg/pano` gibi herhangi bir harici adrese yönlendiren. Yönlendirmeler anında olabilir ya da tasarım seçenekli (tamamen özel bir HTML sayfası dahil) markalı bir "Yönlendiriliyor..." geri sayım sayfası gösterebilir. Her yönlendirme isteğe bağlı olarak sitenizin gezinme menüsünde bir bağlantı olarak görünebilir ve giriş yapmış kullanıcılarla ya da belirli bir izin düğümüyle sınırlandırılabilir. Resmi bir Pano eklentisidir, kullanımı ücretsizdir ve MIT ile lisanslanmıştır.

## Özellikler

- **Sınırsız yönlendirme:** Herhangi bir site yolunu (`/` ile başlamalı ve benzersiz olmalı) bir hedef URL'ye eşleyin.
- **Anında yönlendirme:** Yapılandırılmış bir gecikme veya ara sayfa olmadan, ziyaretçiler sunucu tarafında yönlendirilir (HTTP 302) — asla boş bir sayfa görmezler.
- **Ara "Yönlendiriliyor" sayfası:** İsteğe bağlı olarak, yapılandırılabilir bir gecikmeyle (saniye cinsinden) ve dört tasarımdan biriyle bir geri sayım sayfası gösterin:
  - **Default (Varsayılan):** Bir spinner, hedef URL ve bir geri sayım içeren beyaz kart.
  - **Minimal:** Tek satırlı bir spinner — "Redirecting to {hostname} in {n}s".
  - **Modern:** Animasyonlu bir ilerleme çubuğuyla koyu bir kart.
  - **Custom (Özel):** Panelin zengin metin editöründe, HTML kaynak ve önizleme modlarıyla hazırlanan kendi sayfa içeriğiniz. Geri sayım kaplaması üstte kalır.
- **Gezinmede göster:** Yönlendirmeyi, başlığını bağlantı metni olarak kullanarak temanızın gezinme menüsüne ekleyin; bağlantı bazında bir **Yeni sekmede aç** seçeneğiyle.
- **Erişim kontrolü:** Yönlendirme bazında, **Giriş gerektir** (anonim ziyaretçiler `/login?redirect=<path>`'e yönlendirilir) ve serbest biçimli bir izin düğümüyle **İzin gerektir** (örneğin `pano.custom.perm`). Yetkisiz ziyaretçiler bir reddedildi/404 yanıtı alır.
- **Panel kolaylıkları:** ID, başlık, adres, hedef ve gecikmeyi gösteren sayfalanmış bir tablo (sayfa başına 10); yolu ve hedefi görüntüleme, **Bağlantıyı Kopyala**, **Düzenle** ve **Sil** (bir onay penceresiyle) gibi satır işlemleri; ayrıca başarı bildirimleri.
- **Denetim izi:** Bir yönlendirmeyi oluşturma, güncelleme ve silme, Pano'nun panel etkinlik günlüğüne yazılır.
- **Yerelleştirme:** İngilizce, Türkçe ve Rusça olarak mevcuttur.

## Yönlendirmeleri Yönetme

Panel kenar çubuğunda **Yazılar**'ın hemen ardından bir **Link Redirect** öğesi (zincir-bağlantı simgesi) görünür ve Link Redirects sayfasını açar. Her şey tek bir **Oluştur / Düzenle** penceresinden yönetilir — ayrı bir ayarlar sayfası ve site genelinde seçenek yoktur; her ayar yönlendirme bazındadır. Gecikme ve tasarım alanları yalnızca **Ara sayfa göster** açıkken etkinleşir, özel içerik editörü yalnızca tasarım **Custom** olarak ayarlandığında görünür, izin düğümü alanı yalnızca **İzin gerektir** açıkken görünür ve **Yeni sekmede aç** yalnızca **Gezinmede göster** açıkken etkinleşir.

::: tip Ücretsiz ve resmi
Link Redirects, Pano ekibi tarafından geliştirilip sürdürülür, premium lisans gerektirmez ve harici bağımlılığı yoktur — çalışan bir Pano kurulumundan başka bir şeye ihtiyaç yoktur.
:::

## Gerekli İzin

Panelde yönlendirmeleri yönetmek için kullanıcıların **Yönlendirmeleri Düzenle** (`MANAGE_REDIRECTS`) iznine ihtiyacı vardır — "Temada kullanılacak bir yönlendirmeyi oluşturabilir, silebilir ve düzenleyebilir." Bu izin hem kenar çubuğu girişini / panel sayfasını hem de tüm yönetim endpoint'lerini denetler. Bunun, bir ziyaretçinin sahip olması gerekebilecek yönlendirme bazlı izin düğümünden ayrı olduğunu unutmayın.

## Açık Kaynak

Bu eklenti açık kaynaklıdır ve **MIT** lisansı ile lisanslanmıştır. Kaynak kodunu GitHub üzerinden görüntüleyebilirsiniz:
- [Kaynak Kodu](https://github.com/PanoMC/pano-plugin-link-redirects)

## Kurulum

1. Eklentiyi **Pano Yönetim Paneli**'nden etkinleştirin.
2. **Panel → Link Redirect**'e gidin.
3. **Oluştur**'a tıklayın, bir başlık ve bir yol (`/` ile başlayan) ile hedef URL'yi girin ve kaydedin.
4. İsteğe bağlı olarak bir geri sayım sayfası ekleyin, bağlantıyı gezinmenizde gösterin veya erişimi kısıtlayın.
