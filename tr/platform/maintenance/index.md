# Bakım Modu (Maintenance Mode)

> ⚠️ Bakım modu **Panel → Ayarlar → Platform** bölümünden yapılandırılır ve **Platform Ayarlarını Yönet** izni
> gerektirir.  
> **Yönetici (Admin)** olarak oturum açmadıysanız, **Bakım Modu** kartını görmek veya değiştirmek için bu izne sahip
> olmalısınız.

**Bakım modu**, Pano'yu durdurmadan herkese açık web sitenizi kapatır. Açıkken ziyaretçiler temanıza hiç ulaşmaz; Pano
bunun yerine doğrudan arka uçtan kendi bağımsız bakım sayfasını sunar. Yönetim paneliniz, bağlı Minecraft sunucularınız
ve işi bitirmek için ihtiyaç duyduğunuz her şey normal şekilde çalışmaya devam eder.

Bu sayfa Pano'nun kendisi tarafından oluşturulduğu için bakım modu **her tema ile** çalışır ve temadan hiçbir destek
beklemez. Bakım modu açıkken temanızı kurabilir, değiştirebilir, güncelleyebilir, hatta tamamen bozabilirsiniz —
ziyaretçiler yine de bir hata yerine düzgün bir sayfa görür.

## Özellikler

- **Tek anahtar.** Herkese açık siteyi **Panel → Ayarlar → Platform → Bakım Modu** üzerinden, hesap şifrenizle
  onaylayarak kapatıp açın. Değişiklik anında uygulanır — yeniden başlatma gerekmez ve kendi panel oturumunuz hiç
  kesilmez.
- **Temadan bağımsız sayfa.** Bakım sayfası Pano tarafından üretilir ve diskte tek bir Handlebars dosyası olarak
  saklanır; bu yüzden hiçbir tema başlatılamasa bile görüntülenir.
- **Düzenlenebilir içerik.** Sayfa başlığı, zengin metin mesajı (kayıt sözleşmesindeki editörün aynısı), site logonuz ve
  kendi CSS'iniz.
- **İzne dayalı atlama.** Doğru izne sahip ekip üyeleri giriş yapıp gerçek siteyi gezmeye devam edebilir.
- **Atlama butonu.** Yetkili bir ziyaretçi, bakım sayfasında gerçek temayı açan bir **Bakım modunu atla** butonu görür.
- **Yerleşik giriş.** Pano tarafından sunulan, bilinçli olarak sade tutulmuş kullanıcı adı/e-posta + parola formu;
  hiçbir giriş eklentisine bağlı değildir.
- **Kaba kuvvet koruması.** Hatalı giriş sınırını (varsayılan üç deneme) aşan bir IP adresi kalıcı olarak yasaklanır,
  panel etkinlik günlüğüne yazılır ve panelden yönetilebilir.
- **Açık API'ler kapalı.** Bakım modu açıkken herkese açık API uç noktaları sıradan ziyaretçilere kapalıdır; bakım
  modunu atlayabilen bir kullanıcı için çalışmaya devam eder.
- **Arama motoru dostu.** Sayfalar `Retry-After` başlığıyla birlikte `503 Service Unavailable` döner; arama motorları
  bunu "kalıcı olarak gitti" değil, "geçici olarak kapalı, sonra tekrar gel" diye okur.

## Bakım Modunu Açma

1. **Panel → Ayarlar → Platform** bölümüne gidin.
2. **Bakım Modu** kartına inin.
3. Kart başlığındaki **Bakım Modunu Aç** anahtarını açın ve hesap şifrenizi yazın. Siteyi kapatmak — ve geri açmak —
   diğer kritik ayarlar gibi yeniden kimlik doğrulaması ister ve şifre kabul edildiği anda uygulanır. Kartın geri
   kalanı şifresiz kaydedilir.
4. Kart gövdesindeki ayarları düzenleyin: kimlerin atlayabileceği, giriş butonu, sayfa içeriği.
5. **Kaydet**'e basın.

Değişiklik bir sonraki istekte geçerlidir. Bakım modu yeniden başlatma **gerektirmez** ve port veya URL değişikliklerinin
çıkardığı "yeniden başlatma gerekli" uyarısını **tetiklemez**.

Bakım modu açıkken panelin her sayfasında *"Bakım modu açık. Ziyaretçiler web siteniz yerine bakım sayfasını görüyor."*
uyarısı ve yanında bir **Ayarlara git** bağlantısı görünür. Bu uyarı kapatılamaz; bakım modunu kapattığınızda kendiliğinden
kaybolur.

> ⚠️ Bakım modu yalnızca kurulumunuz tamamlandıktan sonra devreye girer. Kurulum sihirbazı sürerken ayar ne derse desin
> etkisizdir.

## Panel Ayarları

Her şey **Panel → Ayarlar → Platform** içindeki tek bir kartta:

- **Bakım Modunu Aç** *(başlık anahtarı)* — ana anahtar. Kapalıyken karttaki diğer her şey soluklaşır ve devre dışı
  kalır — tıpkı altındaki **SMTP** kartı gibi.
- **Bakım Modunu Kimler Atlayabilir** — tek bir alan: Pano'nun aradığı izin node'u. Boş bırakırsanız panel erişim izni
  kullanılır; alanın placeholder'ı da bunu yazar.
  [Bakım Modunu Kimler Atlayabilir](#bakım-modunu-kimler-atlayabilir) bölümüne bakın.
- **Giriş Butonunu Göster** — bakım sayfasına bir giriş butonu ekler.
- **Özel Giriş Adresi** — bakım giriş formunu sunacak kendi yolunuz, örneğin `/personel-girisi`. Yalnızca
  **Giriş Butonunu Göster** kapalıyken kullanılabilir; boş bırakırsanız form `/login` adresinde kalır. `/` ile başlamalı, boşluk içermemeli, 128 karakteri geçmemeli ve
  `/api` ya da `/panel/api` altını göstermemelidir.
- **Site Logosunu Göster** — **Panel → Ayarlar → Website** bölümündeki logoyu başlığın üstünde gösterir.
- **Bakım Sayfasını Düzenle** — sayfanın ve bloklarının kaynak kodu düzenleyicisini, altında canlı önizlemeyle birlikte
  açar. Bkz. [Bakım Sayfasını Düzenleme](#bakım-sayfasını-düzenleme). Bakım modu kapalıyken de açılabilir; böylece
  sayfayı ihtiyacınız olmadan önce hazırlayabilirsiniz.
- **Bakım Sayfasını Önizle** — bakım modunu zaten atlamış olsanız bile bakım sayfasını yeni sekmede açar.
- **Yasaklı IP Adresleri** — kartın alt kısmında; bakım girişinin dışarıda bıraktığı adresleri kendi penceresinde açar.
  [Yasaklı IP Adresleri](#yasaklı-ip-adresleri) bölümüne bakın.

Kartı uygulamak için **Kaydet**'e basın. **Kaydet** butonu siz bir şey değiştirene kadar pasif kalır ve sonucu bir
bildirim onaylar. Buradaki her değişiklik bir sonraki istekte geçerli olur — hiçbiri yeniden başlatma istemez.

## Bakım Modunu Kimler Atlayabilir

Bir ziyaretçi bakım modunu ancak **oturum açmışsa** ve **gerekli izne sahipse** atlayabilir.

Karttaki **Bakım Modunu Kimler Atlayabilir** alanı, Pano'nun aradığı node'dur. Tek alan, iki durum:

- **Boş bırakılırsa** — varsayılan. Pano `pano.panel.access.panel` iznini (panelde **Panel'e Erişim**) ister; alanın
  placeholder'ı da bunu yazar. Yani yönetim panelinizi zaten açabilen herkes bakım sayfasını da geçebilir.
- **Doldurulursa** — örneğin `admins.test`. Pano bunun yerine tam olarak o node'u ister. Böylece siteyi görmesi gereken
  ama paneli asla görmemesi gereken kişileri içeri alabilirsiniz.

> ⚠️ Yazdığınız node **birebir** eşleştirilir ve **joker karakter içeremez** — Pano `*` içeren bir node'u kaydetmeyi
> reddeder. Joker karakterler kullanıcının **sahip olduğu** node'da çalışır, sizin **istediğiniz** node'da değil:
> `admins.test` node'una sahip bir kullanıcı, gerekli node `admins.*` ise **eşleşmez**; `admins.*` node'una sahip olan
> ise gerekli `admins.test` ile eşleşir. Verdiğiniz node'u tam olarak yazın — boşluksuz ve en fazla 128 karakter.

Bilmekte fayda olan birkaç nokta:

- `*` (tam yönetici) node'una sahip kullanıcılar her node'u geçer.
- Pano izin grafiğini önbelleğe aldığı için izin değişikliklerinin geçerli olması **bir dakikayı** bulabilir; bakım
  kapısı da kendi kararını 30 saniye boyunca saklar. Yeni bir atlama kullanıcısı reddediliyorsa, bir şeyleri
  değiştirmeden önce bekleyip tekrar deneyin.
- LuckPerms'ten `pano: false` bağlamıyla aktarılan node'lar Pano'nun web izinlerinde yok sayılır. Atlama node'unu
  **Panel → Yetkiler** üzerinden verin ki `pano: true` bağlamını taşısın. Bkz.
  [LuckPerms entegrasyonu](../integrations/luckperms/).
- İzin her istekte sunucuda yeniden doğrulanır. İzni geri aldığınızda kullanıcı erişimini kaybeder — atlama butonuna
  daha önce basmış olsa bile.

## Giriş Butonu ve Giriş Adresi

Bakım giriş formunun nerede olduğu iki ayara bağlıdır:

| Giriş Butonunu Göster | Özel Giriş Adresi | Sayfada buton | Giriş formunu sunan adres |
| --- | --- | --- | --- |
| Açık | *(yok sayılır, alan pasif)* | Evet → `/login` | `/login` |
| Kapalı | *(boş)* | Hayır | `/login` — form yerinde kalır, yalnızca buton kaybolur |
| Kapalı | `/personel-girisi` | Hayır | `/personel-girisi` — ve `/login` artık formu göstermez |

Akılda tutulması gereken üç sonuç:

- Gizli bir adres yalnızca görünür bir butonun **alternatifi** olarak anlamlıdır; bu yüzden buton açıkken
  **Özel Giriş Adresi** alanı pasif olur. Buton açıkken giriş yalnızca `/login` adresindedir ve o adresi **Pano** sunar,
  temanız değil. Bakım modu açık kaldığı sürece temanızın kendi giriş sayfasına ulaşılamaz — bu bilinçli bir tercihtir.
- Buton kapalıyken belirlediğiniz özel adres, formu sunan **tek** adres olur. Kaydetmeden önce bir yere not edin.
- `/panel` adresini — ya da yer imine eklenmiş `/panel/posts` gibi altındaki herhangi bir derin bağlantıyı — açan
  oturumsuz ziyaretçiler, giriş formunu sunan adrese yönlendirilir; böylece kayıtlı bir panel bağlantısı çıkmaz sokağa
  değil, bir yere çıkar.

## Ziyaretçiler Ne Görür

Sıradan bir ziyaretçi sitenizin **her** adresinde bakım sayfasını görür — ana sayfa, derin bağlantılar ve tema dosyaları
dahil. Sayfa sırasıyla şunları gösterir: site logonuz (etkinse), sayfa başlığı, mesajınız ve etkinleştirdiyseniz giriş
butonu. Özel CSS'iniz en son uygulanır, yani yerleşik stillerin üzerine yazar.

Perde arkasında:

- Sayfalar, `Retry-After` başlığı ve `X-Robots-Tag: noindex` ile birlikte `503 Service Unavailable` döner. Arama
  motorları 503'ü *geçici* olarak okur: bakım modu açıkken taramayı duraklatır, kapattığınızda kaldığı yerden devam
  eder; bir `404`'te olduğu gibi sayfalarınızı dizinden düşürmez. Bakım metninin hiçbir kısmı dizine girmez.
- Giriş sayfasının kendisi `200 OK` döner (yine de `noindex`), çünkü parola yöneticileri ve tarayıcı form davranışı
  503'te bozuluyor.
- `/robots.txt`, `User-agent: *` / `Disallow: /` içeren düz metin bir 503 döner.
- Herkese açık API uç noktaları `MAINTENANCE_MODE_ENABLED` hata koduyla `503` döner; böylece temanızın normalde çektiği
  hiçbir veri dışarı sızmaz. Eklentilerin eklediği API'ler de aynı şekilde davranır — eklenti açıkça muafiyet
  istemedikçe kapalıdırlar.
- `GET` veya `HEAD` dışındaki her istek kısa, düz metin bir 503 alır.

## Yetkili Bir Kullanıcı Ne Görür

Gerekli izne sahip, oturum açmış bir kullanıcı **da bakım sayfasına düşer**, ancak sayfada bir **Bakım modunu atla**
butonu görür. Bu butona bastığında gerçek temayı normal şekilde gezebilir: sayfalar açılır ve temanızın yaptığı API
çağrıları onun için yeniden çalışır.

- **Atlama, sayfa yenilenene kadar geçerlidir.** Verildiği sayfada harcanır; tema içinde gezinmeye devam edebilirsiniz
  ama <kbd>F5</kbd>'e basmak, yeni sekme açmak veya adresi elle yazmak bakım sayfasını doğrudan geri getirir ve
  **Bakım modunu atla**'ya yeniden basarsınız. Bu bilinçli bir tercihtir: saatler önce atladınız diye sitenin kapalı
  olduğunu kimse unutmamalı.
- Atlama `pano_maintenance_skip` çerezinde taşınır. Bu çerez yalnızca bir niyet beyanıdır — tek başına hiçbir kapı
  açmaz, çünkü izin her istekte sunucuda doğrulanır.
- **Sayfayı yenilemeden bakım sayfasına dönmek için** `/api/maintenance/exit` adresini açın — panelde
  **Bakım Sayfasını Önizle**'nin yaptığı tam olarak budur — ya da yalnızca çıkış yapın. Çıkış yaparken oturumla birlikte
  atlama çerezi de temizlenir.
- Panele erişebilen bir kullanıcı için **`/panel` ve altındaki her şey hiçbir zaman engellenmez** — atlama butonuna
  bassa da basmasa da.
- API erişimi çereze değil **izne** bakar: bakım modunu atlayabilen bir kullanıcı, atlama butonuna basmadan önce de
  normal API yanıtları alır. Çerez hangi arayüzün sunulacağına, izin hangi API'lerin cevap vereceğine karar verir.
- **Hiçbir tema çalışmıyorken** atlarsanız — örneğin tema değiştirirken — Pano bir hata yerine kısa bir notla bakım
  sayfasını göstermeye devam eder ve tema yeniden etkinleşir etkinleşmez sizi temaya alır.

## Bakım Girişi

Pano'nun bakım sırasında sunduğu form yalnızca iki şey ister: **kullanıcı adı veya e-posta** ve **parola**. Form sunucuda
oluşturulur ve JavaScript gerektirmez; böylece sayfada elle yapılmış bozuk bir düzenleme sizi tek kapının dışında
bırakamaz.

> ⚠️ Giriş eklentileri bilinçli olarak devre dışıdır. Captcha, iki adımlı doğrulama (2FA), e-posta ile sihirli bağlantı
> ve sosyal giriş bakım girişine **uygulanmaz** — buna
> [Pano Auth Guard](../../plugins/auth-guard/), [Social Login](../../plugins/social-login/) ve
> [Premium Login](../../plugins/premium-login/) dahildir. Bu kasıtlıdır: normalde girişinizi koruyan eklentinin kendisi
> bozulduğunda bile içeri girebilmenizi garanti eder. Bakım modu kapandığı anda bu eklentiler yeniden tam olarak devreye
> girer.

Normal girişten bilinçli olarak ayrılan diğer noktalar:

- **Doğrulanmamış e-posta adresi burada kabul edilir.** Zaten bozuk bir e-posta sunucusu, bakım modunda olmanızın en sık
  sebeplerinden biridir. Sitenizde yasaklı olan bir kullanıcı yine de içeri alınmaz.
- **Hiçbir bilgi sızmaz.** Form, "böyle bir kullanıcı yok" ile "parola yanlış" arasında ayrım yapmaz; her hata aynı
  mesajı verir.
- **Form yalnızca Pano'nun kendi sayfasından çalışır.** Başka bir siteden gelen gönderim `403` ile reddedilir ve hatalı
  deneme **sayılmaz** — aksi halde herhangi bir web sayfası, ziyaretçilerini sitenizde yasaklatabilirdi. Yalnızca kendi
  form anahtarınızın süresi dolduysa cevap çıkmaz sokak değil, tazelenmiş anahtarıyla formun kendisi ve kısa bir uyarı
  olur.
- **Hız sınırı vardır.** Bakım girişinin kendine ait bir bütçesi vardır — birkaç saniyede birkaç deneme — ve bu bütçeyi
  başka hiçbir uç nokta harcayamaz; yani kimse normal giriş adresini döverek onu tüketemez. Bütçeyi aşmak sizi
  yasaklamaz: "çok fazla deneme" uyarısıyla bakım sayfasına geri gönderilirsiniz. Bütçe, tıpkı aşağıdaki yasaklar gibi
  bağlanan adres başına sayılır; Pano bir vekil sunucu arkasındaysa oradaki ters vekil sunucu notunu okuyun.

Başarılı girişten sonra nereye düşersiniz:

- Panel erişimi varsa → **panel**.
- Yalnızca özel atlama node'u varsa → **bakım sayfası**, artık atlama butonuyla birlikte.
- Parola doğru ama atlama izni yoksa → "erişim yok" notuyla bakım sayfası. Bu **hatalı deneme sayılmaz**; böylece sıradan
  bir üye, giriş denemesiyle ofisinizi yasaklatamaz.

## Yasaklı IP Adresleri

- Aynı adresten gelen **üç** başarısız girişe göz yumulur; **bir sonraki** hata o adresi **kalıcı olarak yasaklar** ve o
  andan sonra her deneme parola hiç kontrol edilmeden reddedilir. Yasaklı ziyaretçiler bakım sayfasını hiç giriş formu
  olmadan görür; yalnızca adresin engellendiğini ve site sahibiyle iletişime geçmeleri gerektiğini söyleyen bir uyarı
  görünür.
- **Başarılı** bir giriş o adresin sayacını sıfırlar; Pano'yu yeniden başlatmak da sınıra ulaşmamış sayaçları affeder.
  Yasakların kendisi yeniden başlatmadan etkilenmez.
- Eşik değeri `config.conf` içindeki `max-login-attempts` anahtarıdır (varsayılan `3`). `0` yapmak yasaklamayı tamamen
  kapatır.
- **Loopback adresleri (`127.0.0.1` ve `::1`) asla sayılmaz ve asla yasaklanmaz.** Pano'nun çalıştığı makineye terminal
  erişimi olan biri her zaman giriş yapabilir.
- Her otomatik yasak, yasak kaldırma ve açma/kapatma olaylarıyla birlikte panel etkinlik günlüğüne yazılır.

Yasaklar diskte, Pano'nun çalıştığı klasörde saklanır:

```
maintenance/maintenance-mode-banned-ips.json
```

```json
{
  "version": 1,
  "bans": [
    {
      "ip": "203.0.113.44",
      "bannedAt": 1753612800000,
      "attempts": 4,
      "lastUsernameTried": "admin",
      "lastUserAgent": "Mozilla/5.0 (X11; Linux x86_64)",
      "socketPeer": "203.0.113.44"
    }
  ]
}
```

Yönetmek için **Bakım Modu** kartının altındaki **Yasaklı IP Adresleri**'ne basın; liste kendi penceresinde açılır.
Liste; **IP**, isteğin gerçekte geldiği **Bağlantı Adresi**, **Hatalı Deneme** sayısı, **Son Denenen Kullanıcı Adı** ve
**Yasaklanma Tarihi** sütunlarını gösterir. Tek bir adres için **Yasağı kaldır** diyebilir veya **Tümünü Temizle**'ye
basabilirsiniz. Bir yasağı kaldırmak o adresin hata sayacını da sıfırlar. Yasaklar bakım modundan bağımsızdır, bu yüzden
liste bakım modu kapalıyken de açılabilir.

Liste en fazla 10 000 kayıt tutar ve bozuk bir yasak dosyası kimseyi dışarıda bırakmaz: Pano dosyayı
`maintenance-mode-banned-ips.json.corrupt-<zaman-damgası>` adıyla yedekler ve boş bir listeyle devam eder.

> ⚠️ **Ters vekil sunucu (reverse proxy) veya CDN arkasında mısınız?** Pano bakım girişindeki istemciyi, gerçekten
> aldığı bağlantının adresine göre tanır. `X-Forwarded-For` başlığı, bağlanan adres `server.trusted-proxies` listesinde
> yer almadıkça **tamamen** yok sayılır — ve aynı kimlik hem bu yasak listesini hem de bakım girişinin hız sınırını
> yönetir. Pano'yu Nginx, Cloudflare veya başka bir vekil sunucu arkasında çalıştırıp bu listeyi doldurmazsanız **tüm**
> istekler vekil sunucudan geliyormuş gibi görünür: herhangi birinin hatalı girişleri o tek adresi yasaklar ve onunla
> birlikte herkesin bakım girişine erişimini keser. Listeye vekil sunucunuzu ekleyin — ve yalnızca onu, çünkü listedeki
> bir adrese gerçek istemciyi bildirme konusunda güvenilir. Bkz. [Cloudflare rehberi](../advanced/cloudflare/).

Bu liste, site genelindeki yasaklı IP özelliğinden ayrıdır; yalnızca bakım girişini ilgilendirir.

## Bakım Sayfasını Düzenleme

Karttaki **Bakım Sayfasını Düzenle**, bir kaynak kodu düzenleyicisi açar: üstte markup, hemen altında gerçek sayfanın
canlı önizlemesi ve düzenlenebilir her blok için bir sekme.

| Sekme | Dosya | Nedir |
| --- | --- | --- |
| **Sayfa** | `maintenance/page.hbs` | Belgenin tamamı — head, stiller, yerleşim. Aşağıdaki bloklar bunun yuvalarına girer. |
| **Giriş formu** | `maintenance/login.hbs` | Giriş adresinde sunulan kullanıcı adı/şifre formu. |
| **Giriş butonu** | `maintenance/login-button.hbs` | Ziyaretçiyi giriş sayfasına gönderen buton. |
| **Atlama butonu** | `maintenance/skip.hbs` | Yetkili ziyaretçilerin gördüğü **Bakım modunu atla** butonu. |
| **Bildirim** | `maintenance/notice.hbs` | Hata ve durum mesajlarını taşıyan bant. |

Önizleme, hangi sekmede olursanız olun **bütün** blokları birden gösterir; böylece biçimlendirdiğiniz arayüzün tamamını
görürsünüz. Canlı bir istek yalnızca kendisine uyan blokları gösterir.

Beş dosya da Pano'nun çalıştığı klasörde durur ve düz birer Handlebars şablonudur. Zengin metin editörü yoktur: markup'ı
siz yazarsınız.

### Kaydetmek neyi değiştirir

**Kaydet**'e basmak dosyaları yazar ve `custom-page = true` yapar. O andan itibaren:

- Pano sayfayı artık `config.conf`'taki `title`, `message-html` ve `custom-css` alanlarından üretmez.
- Yeni bir varsayılan tasarımla gelen Pano güncellemesi **dosyalarınızı değiştirmez** — siz sıfırlayana kadar o
  iyileştirme size ulaşmaz.

**Varsayılana sıfırla**, beş dosyayı da Pano'nun gönderdiği tasarımdan geri yükler ve `custom-page`'i kapatır; böylece
ileriki tasarım güncellemeleri yeniden devreye girer. `config.conf`'ta `custom-page = false` yapmak da aynı işi görür.

### Yuvalar ve değişkenler

::: v-pre

Sayfa şunları taşır; birini koymazsanız getirdiği özellik de görünmez: `{{{loginBlock}}}` olmayan bir sayfada giriş
butonu hiç çıkmaz, `{{{skipBlock}}}` olmayan bir sayfada yetkili ziyaretçinin siteye ulaşmasının yolu kalmaz.

| Yuva | Ne olur |
| --- | --- |
| `{{{noticeBlock}}}` | Varsa bildirim bandı |
| `{{{loginBlock}}}` | Giriş butonu ya da giriş adresinde giriş formu |
| `{{{skipBlock}}}` | Yetkili ziyaretçiler için **Bakım modunu atla** butonu |
| `{{{creditBlock}}}` | **Pano ile oluşturuldu** satırı |
| `{{logoUrl}}` | Site logosunun adresi |
| `{{lang}}` | `<html lang>` için platform dil kodu |
| `{{defaultTitle}}` / `{{{defaultMessage}}}` | Pano'nun kendi metni, platform dilinde |

Blokların kendi değişkenleri var: giriş formunda `{{action}}`, `{{nonce}}`, `{{nonceField}}`, `{{usernameField}}`,
`{{passwordField}}` ve bunların etiket/placeholder'ları; giriş butonunda `{{url}}` ve `{{label}}`; atlama bloğunda
`{{action}}`, `{{label}}` ve `{{description}}`; bildirimde `{{text}}`, `{{modifier}}` ve `{{role}}`.
**`{{nonce}}` ve `{{nonceField}}`'i giriş formunda bırakın** — başka bir sitenin ziyaretçilerinizin adreslerini
yasaklatmasını engelleyen same-origin kontrolünü onlar taşır.

:::

Her etiket, buton ve mesaj Pano'nun kendi çevirilerinden gelir ve
**Panel → Ayarlar → Platform → Tercihler → Dil** ayarını izler. Bu metinleri **Panel → Çeviriler** altında **PLATFORM**
türünde değiştirebilirsiniz; bakım anahtarları `maintenance.` altında toplanmıştır.

Bozuk bir direktif canlı sitede değil önizlemede görünür; çünkü önizleme de aynı motordan geçer. Bir blok render
edilemezse sayfa o blok olmadan yine açılır; sayfanın kendisi hiç okunamazsa Pano asgari düzeyde yerleşik bir sayfaya
döner, yani site hiçbir zaman yanıtsız kalmaz.

### Varsayılan tasarım hakkında

- Dosyalar bilinçli olarak bağımsızdır: tema dosyası, dış stil sayfası veya sitenizden betik içermez. Temanız çökmüşken
  bile görüntülenebilmesini sağlayan şey budur.
- Varsayılan tasarım sade, düz (flat) ve **her zaman açık temadır** — ziyaretçinin koyu tema tercihini izlemez, yani
  sayfa herkeste aynı görünür. Temaların altbilgisinde gördüğünüz **Pano ile oluşturuldu** satırını taşır.
- `config.conf`'taki `title`, `message-html` ve `custom-css`, Pano'nun *varsayılan* sayfayı ürettiği alanlardır. Artık
  panelden düzenlenmezler: editöre girdiğiniz andan itibaren düzenlediğiniz şey markup'ın kendisidir.

Diğer Pano klasörleri gibi, başlatırken klasörü başka bir yere de taşıyabilirsiniz:

```bash
java -Dpano.maintenanceFolder=/var/lib/pano/maintenance -jar Pano-<version>.jar
```

## Bakım Sırasında Çalışmaya Devam Edenler

Bakım modu herkese açık web sitesini kapatır, platformu değil. Şunlar her zaman çalışmaya devam eder:

- **Yönetim paneli** ve tüm panel API'leri — panele erişebilen kullanıcılar için.
- **Pano MC Eklentisi bağlantısı.** Minecraft sunucularınız bağlı kalır, oyuncu verileri eşitlenmeye devam eder ve
  [AuthMeReloaded](../integrations/authme/) ile [LuckPerms](../integrations/luckperms/) gibi oyun içi entegrasyonlar
  etkilenmez.
- **Sağlık uç noktası** `/api/health`; böylece çalışma süresi izleyicileri ve yük dengeleyiciler normal yanıt almaya
  devam eder.
- **Bakım sayfası ve girişi**, ayrıca ihtiyaç duydukları site bilgisi, logo, favicon ve arayüz çevirileri.
- **Let's Encrypt sertifika yenilemesi** (`/.well-known/acme-challenge/`), böylece siz çalışırken SSL'iniz süresi
  dolmaz. Muafiyet yalnızca bu doğrulama yoluna aittir: `/.well-known/` altındaki diğer her şey, sitenizin herhangi bir
  adresi gibi bakım sayfasını alır.

Bunun dışındaki her şey — temanız, dosyaları, herkese açık API ve bir eklentinin eklediği API'ler — sıradan
ziyaretçilere kapalıdır ve bakım modunu atlayabilen bir kullanıcıya açıktır.

> ⚠️ Bakım modu bir **güvenlik sınırı değil, bir kapatma anahtarıdır.** Kimliği zaten doğrulanmış Minecraft sunucuları ve
> atlama izni olan herkes tasarım gereği çalışmaya devam eder. Onu yarım kalmış bir siteyi gizlemek için kullanın, bir
> güvenlik olayını çevrelemek için değil.

## Yapılandırma Anahtarları

Bakım modu `config.conf` içinde saklanır. Pano, güncellemeden sonraki ilk başlatmada bloğu otomatik olarak ekler;
normalde panelden yönetirsiniz ve dosyaya yalnızca kurtarma için dokunursunuz.

```jsonc
maintenance {
  # Ana anahtar. Açıkken sıradan ziyaretçiler tema yerine bakım sayfasını görür
  # ve herkese açık her API uç noktası 503 döner.
  enabled = false

  # Bakım modunu atlamak için gereken izin node'u.
  # Boş = panel erişim izni (pano.panel.access.panel).
  # Burada joker karakter KULLANILAMAZ: node birebir hedef olarak eşleştirilir.
  bypass-permission-node = ""

  # Bakım sayfasında bir "Giriş yap" butonu göster.
  show-login-button = true

  # Bakım giriş formunu sunan yol, örneğin "/personel-girisi".
  # Boş = /login. Yalnızca show-login-button kapalıyken dikkate alınır.
  custom-login-url = ""

  # Bakım sayfasının üstünde web sitesi logosunu göster.
  show-site-logo = true

  # Bakım sayfası başlığı (tarayıcı sekmesinde de kullanılır). Boş = yerleşik varsayılan.
  title = ""

  # Bakım sayfası gövdesi (HTML; panelde zengin metin editörüyle düzenlenir).
  message-html = ""

  # Bakım sayfasının <style> bloğuna eklenen ek CSS.
  custom-css = ""

  # Bir IP'nin bakım girişinden kalıcı olarak yasaklanması için gereken hatalı parola denemesi
  # sayısı. 0 IP yasaklamayı kapatır. Loopback adresleri asla yasaklanmaz.
  max-login-attempts = 3

  # Sayfanın tamamı panelin tam sayfa editöründen yazıldıysa true olur.
  # O andan itibaren sayfanın sahibi maintenance/page.hbs'tir: yukarıdaki alanlar sayfayı
  # üretmez ve güncellemeyle gelen yeni varsayılan tasarım da onu değiştirmez.
  custom-page = false
}
```

**Detaylar**

- `enabled`: kilitlenmeden kurtulmak için dokunmanız gereken tek anahtar.
- `bypass-permission-node`: birebir bir node, örneğin `admins.test`. Varsayılan için boş bırakın.
- `show-login-button` / `custom-login-url`: [Giriş Butonu ve Giriş Adresi](#giris-butonu-ve-giris-adresi) bölümündeki
  tabloya bakın.
- `title`, `message-html`, `custom-css`, `show-site-logo`: sayfa içeriğinin asıl kaynağı. `maintenance/page.hbs` her
  kayıtta bunlardan yeniden üretilir; bu yüzden o dosyada elle yapılan düzenlemeler bir sonraki panel kaydında silinir.
- `max-login-attempts`: panelde gösterilmez — bu anahtar, değeri değiştirebileceğiniz tek yerdir.
- Bu bloğu elle düzenlemeniz **birkaç saniye içinde, yeniden başlatmadan** algılanır. Panelden kaydetmek dosyanın
  tamamını yeniden yazar; bu yüzden aynı anda yapılan bir panel kaydı ile elle düzenleme birbirinin üzerine yazar.

`server` bloğundaki bir anahtar da aynı hikâyenin parçasıdır:

```jsonc
server {
  # X-Forwarded-For ile gerçek istemci IP'sini bildirebilecek ters vekil sunucular.
  # Başlık YALNIZCA bağlanan soket adresi burada listeliyse dikkate alınır;
  # aksi halde istemci IP'si olarak soket adresinin kendisi kullanılır.
  # Boş liste = her bağlantı doğrudan sayılır — hiçbir başlığa güvenilmez.
  # Örnek: ["127.0.0.1", "::1"]
  trusted-proxies = []
}
```

- `trusted-proxies`: Pano'nun `X-Forwarded-For` başlığına inandığı adresler. Liste **varsayılan olarak boştur**; bu
  durumda her istek doğrudan bağlantı sayılır ve başlık tamamen yok sayılır — güvenli varsayılan budur, ama vekil sunucu
  arkasındaki bir site için yanlıştır. Bakım moduna canlı ortamda güvenmeden önce listeye vekil sunucunuzun adresini
  yazın, başka bir şey değil. Şu an yalnızca bakım modu tarafından okunur: bakım girişinin IP yasakları ve hız sınırı
  için. Diğer uç noktaların hız sınırlaması bu anahtardan etkilenmez.

## Kendinizi Kilitlediniz mi?

Bakım modu her zaman geri girebilmeniz için tasarlandı. Tercih sırasıyla:

1. **Pano'nun çalıştığı makineden giriş yapın.** Loopback adresleri (`127.0.0.1`, `::1`) asla yasaklanmaz; sunucunun
   kendisindeki bir tarayıcı veya SSH tüneli her zaman giriş formuna ulaşır.
2. **`config.conf` üzerinden kapatın.** Panel anahtarı şifrenizi kabul etmiyorsa da izlenecek yol budur: dosya yeniden
   kimlik doğrulaması istemez. `maintenance` bloğunda `enabled = false` yapıp kaydedin. Pano değişikliği yaklaşık
   beş saniye içinde alır — yeniden başlatma gerekmez.
3. **Yasaklı adresleri temizleyin.** Panelden kaldırın veya `maintenance/maintenance-mode-banned-ips.json` dosyasını
   silin. Pano onu boş olarak yeniden oluşturur.
4. **Sayfayı sıfırlayın.** Hatalı bir özel CSS veya bozuk bir elle düzenleme sayfayı kullanılmaz hale getirdiyse
   `maintenance/page.hbs` dosyasını silin; Pano onu varsayılan şablondan yeniden üretir.
5. **Özel giriş adresini mi unuttunuz?** `config.conf` içindeki `maintenance` bloğundan `custom-login-url` değerini
   okuyun veya boşaltın — form o zaman yeniden `/login` adresine döner.
6. **İzin node'u yüzünden mi kilitlendiniz?** `bypass-permission-node` değerini boşaltın; panel erişim iznine geri
   dönersiniz.

> ⚠️ `config.conf` üzerinde büyük elle düzenlemeler yapmadan önce mutlaka yedek alın; tek bir değerden fazlasını
> değiştirecekseniz önce Pano'yu durdurun. Bkz. [Ayar Dosyası Rehberi](../configuration/).

## Gerekli Yetkiler

- **Platform Ayarlarını Yönet** (`pano.panel.manage.platform.settings`) — bakım modunu yapılandırmak ve yasaklı IP
  listesini yönetmek.
- **Panel'e Erişim** (`pano.panel.access.panel`) — özel bir node belirlemediğiniz sürece bakım modunu atlamak için
  gereken varsayılan izin.

> Bakım modunu bir şey bozulduktan sonra değil, işe başlamadan önce açın — bkz.
> [production kontrol listesi](../configuration/production/).
