# Server Management Eklentisi

**Server Management** eklentisi, Minecraft sunucularınızı doğrudan Pano üzerinden yönetmenizi sağlamak için tasarlanmış resmi bir Pano eklentisidir — konsol, başlat/durdur ve oyuncu kontrolü tek bir yerde. Pano ekibi tarafından geliştirilmiştir, kullanımı ücretsizdir ve açık kaynaklıdır.

::: warning Geliştirme aşamasında — henüz işlevsel değil
Bu eklenti şu anda erken bir iskelet. Aşağıda açıklanan sunucu yönetimi işlevlerinin hiçbiri henüz uygulanmamıştır: hiçbir panel sayfası, API endpoint'i, ayar veya izin kaydetmez ve kurmak sitenize kullanılabilir bir özellik eklemez. Bu sayfa, neyin planlandığını bilmeniz için **amaçlanan** kapsamı belgeler. İlerleme için GitHub deposunu takip edin.
:::

## Planlanan Özellikler

Aşağıdaki yetenekler, eklentinin amaçlanan kapsamını tanımlar. Bunlar **bugün mevcut değildir** ve yalnızca bir yol haritası olarak listelenmiştir:

- **Panel İçi Konsol:** Minecraft sunucu konsolunuzu doğrudan Pano yönetim panelinden görüntüleyin ve etkileşime geçin.
- **Başlat / Durdur Kontrolü:** Bağlı sunucularınızı Pano'dan ayrılmadan başlatın ve durdurun.
- **Oyuncu Kontrolü:** Çevrimiçi oyuncuları tek bir merkezi yerden yönetin.

Bu özelliklerin, Pano'ya **pano-mc-plugin** bağlantısı aracılığıyla zaten bağlı olan sunucular üzerine inşa edilmesi beklenmektedir, ancak şu anda hiçbir kod bunların hiçbirini desteklememektedir.

## Panel Kontrolleri

Henüz yok. Uygulandığında, eklentinin kontrollerini **Pano Yönetim Paneli**'ne eklemesi beklenmektedir. Şu anda hiçbir panel sayfası, bölümü veya gezinme bağlantısı yoktur.

## Ayarlar ve İzinler

Tanımlı değil. Eklenti, bu aşamada kullanıcıya yönelik hiçbir ayar ve hiçbir izinle gelmez.

## Ön Koşullar

- Standart bir Pano eklenti kurulumu (jar'ı `plugins/` klasörünüze bırakın).
- Lisans anahtarı gerekmez — eklenti **ücretsizdir**.

::: tip Ücretsiz ve resmi
Server Management, Pano ekibi tarafından geliştirilip sürdürülür ve premium lisans gerektirmez.
:::

## Açık Kaynak

Bu eklenti açık kaynaklıdır ve açıkta geliştirilir. Geliştirmeyi takip edebilir ve kaynak kodunu GitHub üzerinden görüntüleyebilirsiniz:
- [Kaynak Kodu](https://github.com/PanoMC/pano-plugin-server-management)
