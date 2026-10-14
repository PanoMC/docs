# E-posta Şablonları

Pano'nun gönderdiği her e-posta — platformun kendi e-postaları da eklentilerinizinkiler de — sitenizin sunduğu her
dilde panelden yeniden yazılabilir. **Panel → Ayarlar → E-posta şablonları** sayfasını açın. Gönderimin kendisi (SMTP
veya Pano Mail) [Servisler → E-posta](../services/#e-posta-smtp) bölümünde ayarlanır.

**E-posta Şablonlarını Yönet** yetkisine ihtiyacınız var. Her kaydetme ve sıfırlama etkinlik günlüğüne yazılır.

## Neleri düzenleyebilirsiniz

Sayfa e-postaları gönderene göre gruplar:

- **Platform:** hesap aktivasyonu, e-posta değişikliği onayı, şifre güncellendi, şifre sıfırlama, yasaklanma ve sunucu
  uyarıları.
- **Eklentiler:** e-posta gönderen, kurulu ve çalışan her eklenti; örneğin Auth Guard'ın sihirli giriş bağlantısı,
  Premium Login'in kullanıcı adı değişikliği e-postası ve Market'in mağaza e-postaları. Bir eklenti durdurulduğunda
  e-postaları listeden kalkar.

Bazı e-postaların **varyantları** vardır: her durum için ayrı metni olan tek bir e-posta. Sunucu uyarılarında her uyarı
için bir varyant bulunur (sunucu çöktü, düğüm çevrimdışı, yedekleme başarısız, disk az, TPS düşük, zamanlanmış görev
başarısız, eklenti güncellemeleri); Market'te her sipariş, abonelik ve kargo e-postası için bir varyant vardır. Böyle
türleri olmayan e-postaların tek bir **Varsayılan** varyantı olur.

Her seferinde bir **e-posta × varyant × dil** düzenlersiniz. Değiştirdiğiniz diller bir rozetle işaretlenir.

## Düzenleyici

Ortak görünüm (logo, beyaz kart, buton, alt bilgi satırı) yerleşimden gelir; bu yüzden bir şablon yalnızca metinlerinden
oluşur:

| Alan | Ne işe yarar |
| --- | --- |
| **Konu** | Konu satırı (zorunlu, en fazla 255 karakter) |
| **Ön başlık** | E-posta uygulamalarının konunun yanında gösterdiği kısa önizleme satırı; e-postanın içinde görünmez |
| **Gövde** | Mesajın kendisi, kod düzenleyicide HTML olarak (düzenli gösterilir, sıkıştırılarak kaydedilir) |
| **Buton metni / URL** | Ana buton; butonsuz bir e-posta için URL'yi boş bırakın |
| **Alt bilgi** | Kartın altındaki küçük not, ör. "Bunu siz istemediyseniz bu e-postayı yok sayın" |

::: v-pre

**Değişken ekleme.** Yan listede seçili e-postanın bildiği değerler durur (kullanıcı adı, bağlantılar, tutarlar…).
Birine tıklayınca imlecin olduğu yere `{{username}}` olarak eklenir. Değişkenler
konu ve buton URL'si dahil her alanda çalışır. Bazı değişkenler **listedir** (ör. Market'in
sipariş kalemleri): döngü olarak, `{{#each items}}…{{/each}}` şeklinde eklenir ve listede her satırın alanları görünür.
Birkaçı hazır **HTML bloğudur** (ör. bir ödeme yönteminde yazılan havale talimatları); bunlar `{{{instructions}}}` (üç
süslü parantez) olarak eklenir.

Şunlar her e-postada kullanılabilir: `{{websiteName}}`, `{{websiteUrl}}`, `{{websiteLogo}}`, `{{year}}`, `{{locale}}`.

**Gelişmiş (HTML).** **Gelişmiş** sekmesi e-postanın tamamını tek bir HTML belgesi olarak gösterir: alanlarınızın
yerleştirildiği ortak yerleşim. Orada kaydederseniz bu tam HTML saklanır ve e-posta artık ortak yerleşimi izlemez.


**Handlebars.** Tüm alanlar, gövde, tam HTML ve yerleşim birer [Handlebars](https://handlebarsjs.com/guide/) şablonudur:
`{{name}}` bir değişkeni yazar, `{{{name}}}` hazır bir HTML bloğunu yazar, `{{#if name}}…{{else}}…{{/if}}` bir kısmı
yalnızca değer varsa gösterir, `{{#each list}}…{{/each}}` bir kısmı tekrarlar. Yalnızca yerleşik yardımcılar çalışır
(`if`, `unless`, `each`, `with`, `lookup`); özel yardımcılar kullanılamaz. Sözdiziminin tamamı için
[Handlebars rehberine](https://handlebarsjs.com/guide/) bakın.
:::

**Önizleme** kaydedilmemiş değişikliklerinizi örnek değerlerle gösterir; e-postayı kimse almadan önce görürsünüz.
**Test e-postası gönder** bu önizlemeyi kendi adresinize yollar; çalışan e-posta ayarları ister ve gönderim kapalıysa ya
da Pano Mail'e ulaşılamıyorsa bunu söyler. **Kaydet** önce şablonu kontrol eder ve hatalı alanı gösterir (boş konu, çok
uzun konu ya da derlenmeyen Handlebars).

**Varsayılana sıfırla** o dildeki sürümünüzü siler ve varsayılan metin geri gelir.

### Yerleşim

::: v-pre

**Yerleşimi düzenle**, her e-postanın içine yerleştirildiği tek HTML yerleşimini açar: logo başlığı, kart, buton ve alt
bilgi. Kendi metni yoktur, böylece tek yerleşim her dile hizmet eder. Her e-postanın gövdesinin girdiği `{{{content}}}`
yuvasını içermek zorundadır. **Varsayılana sıfırla** Pano'nun yerleşimini geri getirir.

:::

## Hangi dil gönderilir

E-posta alıcının dilinde gider (hesabının dili, yoksa sitenin dili). Pano o dil için bulduğu ilk metni kullanır:

1. o dildeki düzenlediğiniz sürüm,
2. o dilin varsayılan metni,
3. ana dilin varsayılan metni (`pt-BR` için `pt`),
4. düzenlediğiniz İngilizce (`en-US`) sürüm,
5. varsayılan İngilizce metin.

Yani **Panel → Çeviriler**'den eklediğiniz bir dil, şablonlarını burada yazana kadar İngilizce e-posta gönderir;
düzenleyicide açtığınızda İngilizce metinden başlar ve düzenleyici varsayılanın hangi dilden geldiğini söyler.

## Güncellemeler

Düzenlemeleriniz veritabanında tutulur ve Pano ile eklenti güncellemelerinden etkilenmez. Bir güncelleme yeni varsayılan
metin getirdiğinde bunu yalnızca hiç değiştirmediğiniz dillerde görürsünüz; değiştirdiğiniz bir dilde yeni metni almak
için **Varsayılana sıfırla**'yı kullanın.
