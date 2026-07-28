# Bakım Modu (Maintenance Mode)

> ⚠️ **Panel → Ayarlar → Platform** bölümünden yapılandırılır ve **Platform Ayarlarını Yönet** izni gerektirir.

**Bakım modu**, Pano'yu durdurmadan herkese açık web sitenizi kapatır. Açıkken ziyaretçiler temanıza hiç ulaşmaz; Pano
bunun yerine doğrudan arka uçtan kendi sayfasını sunar. Yönetim paneliniz, bağlı Minecraft sunucularınız ve panel API'si
çalışmaya devam eder; herkese açık API uç noktaları `503` döner.

Sayfayı Pano'nun kendisi ürettiği için bakım modu **her tema ile** çalışır ve temadan destek beklemez. Bakım modu açıkken
temanızı kurabilir, değiştirebilir, güncelleyebilir, hatta tamamen bozabilirsiniz.

## Açma

1. **Panel → Ayarlar → Platform → Bakım Modu** bölümüne gidin.
2. **Bakım Modunu Aç** anahtarını açıp hesap şifrenizi yazın. Siteyi kapatmak — ve geri açmak — diğer kritik ayarlar gibi
   yeniden kimlik doğrulaması ister. Kartın geri kalanı şifresiz kaydedilir.
3. Aşağıdaki ayarları düzenleyip **Kaydet**'e basın.

Değişiklik bir sonraki istekte geçerli olur: yeniden başlatma gerekmez, kendi panel oturumunuz da kesilmez. Bakım modu
açıkken panelin her sayfasında kapatılamaz bir uyarı bandı görünür.

> ⚠️ Bakım modu, kurulumunuz tamamlanana kadar etkisizdir. Kurulum sihirbazı sürerken hiçbir şey yapmaz.

## Ayarlar

- **Bakım Modunu Kimler Atlayabilir** — kullanıcının sahip olması gereken izin node'u. Boş bırakırsanız panel erişim
  izni (`pano.panel.access.panel`) kullanılır; placeholder da bunu yazar. Doldurursanız — örneğin `admins.test` — siteyi
  görmesi gereken ama paneli asla görmemesi gereken kişileri içeri alırsınız. Node **birebir** eşleşir ve `*` içeremez.
- **Giriş Butonunu Göster** — bakım sayfasına giriş butonu koyar.
- **Özel Giriş Adresi** — giriş formunu sunacak gizli bir adres, örneğin `/personel-girisi`. Yalnızca giriş butonu
  kapalıyken kullanılabilir; boş bırakırsanız form `/login` adresinde kalır.
- **Site Logosunu Göster** — **Panel → Ayarlar → Website** bölümündeki logoyu gösterir.
- **Bakım Sayfasını Düzenle** — sayfa kaynak kodu düzenleyicisi. Bkz. [Sayfayı düzenleme](#sayfayı-düzenleme).
- **Yasaklı IP Adresleri** — bakım girişinin dışarıda bıraktığı adresler. Bkz.
  [Engellenen adresler](#engellenen-adresler).

| Giriş Butonunu Göster | Özel Giriş Adresi | Giriş formunu sunan adres |
| --- | --- | --- |
| Açık | *(yok sayılır, alan pasif)* | `/login` |
| Kapalı | *(boş)* | `/login` |
| Kapalı | `/personel-girisi` | `/personel-girisi` |

`/panel` adresini — ya da altındaki yer imine eklenmiş bir bağlantıyı — açan oturumsuz ziyaretçiler, formu sunan adrese
yönlendirilir; böylece kayıtlı bir panel bağlantısı çıkmaz sokağa değil, bir yere çıkar.

## Kim ne görür

**Ziyaretçiler** bakım sayfasını `503 Service Unavailable` ve `Retry-After` ile alır; arama motorları bunu "kalıcı olarak
gitti" değil, "geçici olarak kapalı, sonra tekrar gel" diye okur. Temanızdan hiçbir şey sunulmaz ve sayfa tema dosyası
taşımaz, bu yüzden hiçbir tema başlatılamasa bile görüntülenir.

**Atlama izni olan ekip üyeleri** aynı sayfayı, üstüne bir **Bakım modunu atla** butonuyla görür. Butona basınca gerçek
tema açılır — ama yalnızca sayfa yenilenene kadar: atlama, verildiği gezinmede harcanır; <kbd>F5</kbd>, yeni sekme veya
elle yazılan adres bakım sayfasını geri getirir. Bu bilinçlidir; sitenin kapalı olduğu unutulmamalı. Panel erişimi olan
için `/panel` her hâlükârda engellenmez ve API erişimi atlamaya değil **izne** bakar.

İzin her istekte sunucuda yeniden doğrulanır, yani geri aldığınızda erişim de gider — ancak değişikliğin Pano'nun izin
önbelleğinden geçmesi bir dakikayı bulabilir.

## Giriş

Bakım girişi bilinçli olarak sadedir: **kullanıcı adı veya e-posta ve şifre**. Giriş eklentileri burada çalışmaz —
captcha, 2FA, social veya premium login yok — çünkü bu kapının varlık sebebi, bozulan şey bir eklentiyken bile açılıyor
olması. Bakım modu kapanır kapanmaz o eklentiler geri döner.

Bir kullanıcı adının var olup olmadığını asla söylemez ve adres başına hız sınırı vardır.

## Engellenen adresler

Bir adresten üç hatalı girişe izin verilir; dördüncüsü o adresi **kalıcı olarak** engeller. Engellenen ziyaretçi bakım
sayfasını formsuz, yalnızca bir uyarıyla görür. Başarılı giriş sayacı sıfırlar.

- Listeyi kartın altındaki **Yasaklı IP Adresleri**'nden yönetin — tek tek kaldırın ya da **Tümünü Temizle**.
- **Loopback (`127.0.0.1`, `::1`) asla sayılmaz ve engellenmez**; makineye terminalden erişim her zaman bir yoldur.
- Yasaklar `maintenance/maintenance-mode-banned-ips.json` içinde durur ve yeniden başlatmaya dayanır. Her otomatik
  engelleme panel etkinlik günlüğüne yazılır.

> ⚠️ Ters vekil (reverse proxy) arkasındaysanız `server.trusted-proxies` ayarını doldurun — bkz.
> [sunucu yapılandırması](../configuration/server/). Boş bırakılırsa Pano `X-Forwarded-For` başlığını tamamen yok sayar
> ve her istek vekilden geliyormuş gibi görünür; tek bir ziyaretçinin hataları herkesi engeller.

## Sayfayı düzenleme

**Bakım Sayfasını Düzenle**, altında canlı önizleme olan ve her dosya için bir sekme taşıyan bir kaynak kodu
düzenleyicisi açar. Beş dosya da Pano'nun çalıştığı klasörde durur ve düz birer Handlebars şablonudur — zengin metin
editörü yoktur, markup'ı siz yazarsınız.

| Sekme | Dosya |
| --- | --- |
| **Sayfa** | `maintenance/page.hbs` — belgenin tamamı |
| **Giriş formu** | `maintenance/login.hbs` |
| **Giriş butonu** | `maintenance/login-button.hbs` |
| **Atlama butonu** | `maintenance/skip.hbs` |
| **Bildirim** | `maintenance/notice.hbs` |

Önizleme açık sekmeyi izler ve o bloğun gerçekten göründüğü sayfa durumunu gösterir; yani hep düzenlediğiniz şeye
bakarsınız. Bozuk bir direktif canlı sitede değil orada görünür.

**Kaydet**'e basmak dosyaları yazar ve `custom-page = true` yapar: Pano sayfayı artık `title`, `message-html` ve
`custom-css` alanlarından üretmez ve **yeni bir varsayılan tasarımla gelen güncelleme dosyalarınızı değiştirmez**.
**Varsayılana sıfırla** beşini de geri yükler ve bunu kapatır.

::: v-pre

Sayfa şu yuvaları taşır; birini koymazsanız getirdiği özellik de görünmez.

| Yuva | Ne olur |
| --- | --- |
| `{{{noticeBlock}}}` | Varsa bildirim bandı |
| `{{{loginBlock}}}` | Giriş butonu ya da giriş adresinde giriş formu |
| `{{{skipBlock}}}` | **Bakım modunu atla** butonu |
| `{{{creditBlock}}}` | **Pano ile oluşturuldu** satırı |
| `{{logoUrl}}` · `{{lang}}` | Site logosunun adresi, platform dil kodu |
| `{{defaultTitle}}` · `{{{defaultMessage}}}` | Pano'nun kendi metni, platform dilinde |

Blokların kendi değişkenleri var — etiketler, `{{action}}`, `{{url}}`, `{{text}}` ve benzeri. **`{{nonce}}` ve
`{{nonceField}}`'i giriş formunda bırakın**: başka bir sitenin ziyaretçilerinizin adreslerini engelletmesini önleyen
same-origin kontrolünü onlar taşır.

:::

Her etiket ve mesaj Pano'nun çevirilerinden gelir ve **Panel → Ayarlar → Platform → Tercihler → Dil** ayarını izler.
Hepsini **Panel → Çeviriler** altında **PLATFORM** türünde, `maintenance.` başlığı altında değiştirebilirsiniz.

## Yapılandırma anahtarları

```jsonc
maintenance {
  enabled = false

  # Atlamak için gereken node. Boş = pano.panel.access.panel. Joker karakter yok.
  bypass-permission-node = ""

  show-login-button = true

  # Boş = /login. Yalnızca show-login-button kapalıyken dikkate alınır.
  custom-login-url = ""

  show-site-logo = true

  # Varsayılan sayfayı üretmek için kullanılır; panelden düzenlenmez.
  title = ""
  message-html = ""
  custom-css = ""

  # Bir IP engellenmeden önceki hatalı şifre denemesi. 0 engellemeyi kapatır.
  max-login-attempts = 3

  # Sayfa panel editöründen yazıldıysa true olur; bkz. "Sayfayı düzenleme".
  custom-page = false
}
```

Klasörü, Pano'nun diğer klasörleri gibi başlatırken taşıyabilirsiniz:

```bash
java -Dpano.maintenanceFolder=/var/lib/pano/maintenance -jar Pano-<version>.jar
```

## Kendinizi kilitlediniz mi?

Tercih sırasıyla:

1. **Pano'nun çalıştığı makineden giriş yapın** — loopback asla engellenmez.
2. **`config.conf`'ta `enabled = false`** yapın. Yaklaşık beş saniyede algılanır, yeniden başlatma ve şifre gerekmez —
   panel anahtarı şifrenizi kabul etmiyorsa da çıkış yolu budur.
3. **Engelleri temizleyin** — panelden ya da `maintenance/maintenance-mode-banned-ips.json` dosyasını silerek.
4. **Sayfayı sıfırlayın** — `maintenance/page.hbs` dosyasını silin, Pano yeniden üretir.
5. **Özel giriş adresini unuttunuz ya da node yüzünden mi kilitlendiniz?** `config.conf`'taki `custom-login-url` ve
   `bypass-permission-node` değerlerini okuyun veya boşaltın.

> ⚠️ `config.conf` üzerinde büyük elle düzenlemelerden önce yedek alın. Bkz.
> [Yapılandırma Rehberi](../configuration/).
