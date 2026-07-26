# Freemium Eklentiler ve Paketler

**Freemium** bir eklenti kurulumu ve çalışması ücretsizdir — ancak bazı özellikleri, sunucu sahibi Pazar Yeri'nden bir **paket** (örneğin *Pro* veya *Ultra*) satın alana kadar kilitli kalır. Tamamen ücretsiz bir eklenti ile [premium](/tr/addon/premium/) bir eklentinin arasındaki orta yoldur: herkes kurabilir, yalnızca ekstralar ücretlidir.

::: warning Ücretli kaynaklar henüz üçüncü taraf geliştiricilere açık değil
Freemium şu anda panomc.com üzerinde **panel erişimi** olan hesaplarla sınırlıdır — [premium](/tr/addon/premium/) de öyle; eklentide de temada da. Pazar Yeri'nde satış üçüncü taraf geliştiricilere henüz açılmadı; bu yüzden fiyatlandırma adımında iki seçenek de kapalı gelir ve API diğer herkes için reddeder. Bu sayfa, planlama yapabilesiniz diye freemium'un nasıl çalıştığını anlatır; program açılana kadar eklentinizi ücretsiz olarak yayımlayın.
:::

## Tek tabloda freemium ve premium

| | Premium | Freemium |
|---|---|---|
| Herkes kurabilir mi? | Hayır — satın alma gerekir | **Evet** |
| Ödeme yapmadan çalışır mı? | Hayır, başlamayı reddeder | **Evet**, ücretli özellikler kilitli |
| Satılan şey | Eklentinin tamamı | **Tek tek paketler** (Pro, Ultra …) |
| Kodunuz nasıl kontrol eder | Başlangıçta `requireValidLicense()` | Özelliğin kullanıldığı yerde `hasTier("pro")` |
| Fiyat nerede durur | Kaynağın fiyatı | Her paketin kendi fiyatı |

İkisi **birbirini dışlar**. Lisans isteyen bir freemium eklenti bilerek başlatılmaz — birini seçin.

## Adım 1 — Eklentiyi freemium olarak işaretleyin

`gradle.properties` içinde:

```properties
pluginFreemium=true
```

Beyanın tamamı bu. Derleme bunu jar manifest'inize yazar ve Pano yüklenirken okur; böylece panel, eklentiniz daha başlamadan freemium olduğunu bilir. Taze bir `pano-boilerplate-plugin` bu özelliği zaten `false` değeriyle ve açıklamasıyla getirir.

::: tip Geçiş yapıyorsanız lisans kontrolünü kaldırın
Boilerplate, `onStart` içinde `licenseClient.requireValidLicense()` çağırır. Freemium'a geçerken o çağrıyı silin — Pano'nun reddettiği tek kombinasyon, iki modeli birlikte tutmaktır.
:::

## Adım 2 — Ücretli özellikleri kodda kilitleyin

Paketin açtığı şeyi sarın:

```kotlin
override suspend fun onStart() {
    if (hasTier("pro")) {
        enableProFeature()
    } else {
        logger.info("Pro özellikleri kilitli")
    }
}
```

`hasTier(id)` **"en az bu paket"** demektir. Paketler sıralıdır; *Ultra* alan bir sunucu `hasTier("pro")` kontrolünü de geçer — üst paketleri tek tek saymanız gerekmez ve ileride en üste yeni bir paket eklemek kod değişikliği istemez.

`activeTier()` sahip olunan paket id'sini (yoksa `null`) döner; bir log satırı veya durum ekranı için kullanabilirsiniz. Asıl kilitleme için `hasTier` tercih edin.

::: warning Satın alma anında açmaz
Eklentiniz paketleri başlarken sorar ve sonradan yapılan bir satın alma sunucuya kendiliğinden bildirilmez. Bir şey yeniden kontrol edene kadar özellik kilitli kalır. Eklentinin panel sayfasındaki **Yenile** butonu tam bunun içindir — bkz. [Panelde](#panelde). Cevaplar önbellekten geldiği için `hasTier` kodunuzu hiçbir zaman bekletmez.
:::

Her iki metot da yalnızca `pluginFreemium=true` beyan eden bir eklentide çalışır; normal bir eklentiden çağırmak hata fırlatır, böylece yanlış model seçimi sessizce `false` dönmek yerine hemen ortaya çıkar.

## Adım 3 — Paketleri Pazar Yeri'nde tanımlayın

Paketler kodunuzda değil, **mağazada** yayımlanır. *Freemium* planını seçtikten sonra kaynağınızın üzerinde tanımlarsınız — oluşturma sihirbazının fiyatlandırma adımında ya da sonradan kaynak düzenleyicisinde:

| Alan | Notlar |
|---|---|
| **Paket ID** | Küçük harfli kısa ad (`pro`, `ultra`). **Kodunuzun `hasTier()` içine verdiği id budur** — sabit tutun, değiştirmek hiçbir şeyi sessizce açmaz hâle getirir. |
| **Ad** | Alıcıların gördüğü isim (*Pro*). |
| **Fiyat** | Tek seferlik, 0'dan büyük. |
| **Özellikler** | Paketin altında alıcılara gösterilen liste. |

**Listenin sırası yükseltme zinciridir**: ilk paket en düşük seviye, sonraki onun üstü. Doldurmanız gereken bir seviye alanı yok — bir paketi yukarı ya da aşağı taşımak sıralamayı değiştirme yöntemidir; bu sayede çakışan veya atlanan seviye imkânsızdır.

Eklenti başına en fazla 5 paket, paket başına 10 özellik.

::: tip Id'leri kodla senkron tutun
Hangi paketlerin var olduğuna mağaza karar verir; jar'ınız hangi id'leri sorduğuna. İkisi ayrışırsa — örneğin `pro` iken `professional` yapılırsa — kontrol sessizce eşleşmeyi bırakır. Id'yi genel API'nizin parçası sayın.
:::

## Panelde

Bir sunucunun panelinde, eklentinin detay sayfasında freemium bir eklenti şunları alır:

- doğrulama işaretinin yanında, hem listede hem detayda **Freemium rozeti**;
- güncel katalogu, hangi paketin aktif olduğunu ve satın al/yükselt butonunu gösteren bir **Paketler** kartı — bu görünüm panomc.com tarafından sunulup gömülür, dolayısıyla bayat bir kopya değil her zaman mağazayı yansıtır;
- premium lisans yenilemesinin karşılığı olan bir **Yenile** butonu. Sunucunun neye sahip olduğunu yeniden okur; *"Pro'yu aldım ama eklenti hâlâ kilitli diyor"* durumundan çıkış yolu budur.

Bunların görünmesi için panelde bağlı bir Pano hesabı gerekir; yoksa panel önce hesabı bağlamayı ister.

## Pano'nun reddettikleri

Karşılaşmadan önce bilmekte fayda var:

- Aynı kaynakta **freemium + fiyat** — freemium kurulumu ücretsiz demektir, aynı anda para isteyemez.
- **Temada freemium** — eklenti içi satın alma bir eklenti kavramıdır.
- **`requireValidLicense()` çağıran freemium eklenti** — premium ile birbirini dışlar; eklenti başlatılmaz.
- **Freemium olmayan eklentiden `hasTier()`** — yanlış modeli erken yakalamak için hata fırlatır.
- **Tekrar eden paket id'leri, boş adlar, 0 veya altı fiyatlar** — paketleri kaydederken reddedilir.

## Sırada ne var

- **[Premium ve Lisanslama](/tr/addon/premium/)** — eklentinin tamamını satmayı tercih ederseniz, ya hep ya hiç modeli.
- **[Derleme ve Yayınlama](/tr/addon/publishing/)** — bu paketlerin bağlı olduğu kaynağı oluşturma ve yayın akışı.
- **[Manifest Yapılandırması](/tr/addon/manifest/)** — `gradle.properties`'in geri kalanı bağlamında `pluginFreemium`.
- **[Backend Geliştirme](/tr/addon/backend/)** — `onStart` ve `PanoPlugin` sınıfınızın yaşadığı yer.
