# Pano API'sini Ajanla Kullanma

Bir ajan, çalışan bir Pano ile HTTP üzerinden konuşan betikler, botlar ve küçük servisler yazabilir. Ona iki şey verin: kendi sitenizin OpenAPI belgesi ve işin gerektirdiği kadar erişim.

::: warning Pano'nun site yöneten bir MCP sunucusu yoktur
`https://panomc.com/mcp` adresindeki MCP sunucusu yalnızca bu dokümantasyonu okur. Bir ajanın MCP üzerinden bir Pano sitesini yönetmesini sağlayan hiçbir şey yoktur. Ajan bir siteye ne yapıyorsa, burada anlatılan HTTP API'siyle ve sizin verdiğiniz erişimle yapar.
:::

## Ajana OpenAPI belgenizi verin

Her Pano kendi API'sini kendisi anlatır, eklentiler dahil. Belgeleri kaydedin ve ajanın üzerinde çalıştığı kodun yanına koyun ([OpenAPI Referansını Okuma](../../integration/openapi/)):

```sh
curl -s http://localhost:8088/api/v1/openapi.json -o pano-openapi.json
curl -s http://localhost:8088/api/v1/plugins/pano-plugin-market/_/openapi.json -o market-openapi.json
```

Bu ikisi herkese açıktır, anahtar gerekmez. **Sizin** siteniz ve sürümünüz için doğru olan bunlardır; bu dokümanlar Pano'yu yalnızca genel olarak anlatır. JavaScript'te ajan `fetch` çağrılarını elle yazmak yerine bir [tipli istemci](../../integration/client/) üretsin:

```sh
bunx @panomc/client-gen pull --url http://localhost:8088 --out src/lib/pano
```

## Hangi iş için hangi erişim

Pano'da kişisel bir "yönetici API token'ı" yoktur. Giriş yolları şunlardır ([Erişim](../../integration/access/)):

| İş | Erişim | Nereden alınır |
|---|---|---|
| Herkese açık veriyi okumak: yazılar, sunucular, site bilgisi | yok | oluşturulacak bir şey yok |
| Ziyaretçiler adına çalışan bir sunucu (bir site, oyuncu girişi olan bir bot) | ön yüz anahtarı (`pfk_...`), girişten sonra da ziyaretçinin oturum token'ı | **Görünüm -> Temalar -> dişli düğmesi (Site gösterim ayarları) -> Site bağlantı anahtarları -> Yönet** |
| Olaylara tepki vermek (oyuncu kaydoldu, yazı yayınlandı, sipariş ödendi) | gizli anahtarıyla bir webhook | **Ayarlar -> Webhooklar**, bkz. [Webhooklar](../../integration/webhooks/) |
| Panel işlemleri (`/api/v1/panel/...`) | panel giriş oturumu; dahili, kararlılık sözü yok | betikler için değildir |

Ajanların yanlış yaptığı iki ayrıntı: site bir Tema gösterirken "Site bağlantı anahtarları" satırı gizlidir ve bir site oturum token'ı panel API'sinde hiçbir zaman çalışmaz (`403 SITE_TOKEN_NOT_ALLOWED`).

## Örnek istekler

```text
pano-openapi.json dosyasını oku. http://localhost:8088 adresindeki son beş yazının başlığını ve
adresini yazdıran bir Bun betiği yaz. page ve pageSize kullan, hata olursa error.code yazdır.
```

```text
pano-openapi.json dosyasını oku. Pano'mdaki Minecraft sunucularından hangilerinin çevrimiçi
olduğunu ve oyuncu sayılarını GET /api/v1/servers üzerinden gösteren küçük bir Discord bot
komutu yaz. Anahtar gerekmez.
```

```text
Pano'nun core.user.registered olayı için bir webhook alıcısı yaz. X-Pano-Signature başlığını
Pano dokümanlarının Webhooklar sayfasındaki gibi doğrula, tekrar eden olay kimliklerini yok say,
10 saniye içinde 2xx cevabı ver.
```

```text
pano-openapi.json ve market-openapi.json dosyalarını oku. Bir oyuncunun kendi siparişlerini
göstermek için bir betiğin ihtiyaç duyacağı işlemleri listele ve hangilerinin giriş gerektirdiğini
söyle. Henüz kod yazma.
```

## En az yetki

- **Anahtarsız başlayın.** Bir betiğin ihtiyaç duyduğu şeylerin çoğu herkese açıktır. Anahtarı ancak iş giriş gerektirdiğinde ekleyin.
- **Anahtarlar `.env` içinde durur, istekte ya da depoda değil.** Ön yüz anahtarı bir kez gösterilir; bir sohbete ya da commit'e düştüyse panelde silin ve yenisini oluşturun.
- **Kendiniz olarak değil, bir test oyuncusu olarak giriş yapın.** Oturum gerektiren bir betik, panel izni olmayan bir hesap kullanmalıdır.
- **Girişle yoklama yapmak yerine webhook tercih edin.** Webhook içerikleri e-posta adresi, IP adresi ya da mesaj metni taşımaz.
- **Genel API'de kalın.** Ajana `/api/v1/panel/...` çağırmamasını söyleyin: dahilidir ve her sürümde değişebilir.

## Güvenlik

::: danger Yönetici erişiminize sahip bir ajan sitenizi değiştirebilir
Bir ajana panel parolanızı, tarayıcınızdaki panel oturumunu ya da Pano'nun çalıştığı makinede bir kabuk verirseniz, sizin yapabildiğiniz her şeyi yapabilir: oyuncu silmek, izinleri değiştirmek, ön yüzü değiştirmek, sunucuları durdurmak. Yanlış bir komut da doğrusu kadar kolay uygulanır.
:::

- **Bir test sitesi kullanın.** Ajan canlı siteye değil, yerel bir Pano'ya ya da bir kopyaya karşı çalışsın. [Kurulum](../../platform/installation/) birkaç dakika sürer.
- **Çalıştırmadan önce okuyun.** Ajan betiği önce yazsın ve açıklasın; siz çalıştırın. Canlı bir sitede yazma işlemlerini (`POST`, `PUT`, `PATCH`, `DELETE`) gözetimsiz çalıştırmasına izin vermeyin.
- **Önce yedek alın**, betik veri değiştiriyorsa.
- **Hız sınırlarına dikkat edin.** Döngüye giren bir betik `429 RATE_LIMIT_EXCEEDED` alır; `Retry-After` başlığına uymalıdır ([API Temelleri](../../integration/api-basics/)).
