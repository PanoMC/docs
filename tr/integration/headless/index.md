# Ön Yüz Hızlı Başlangıç (Headless)

"Headless", Pano'nun sitenin verisini, hesaplarını ve eklentilerini çalıştırması, sayfaları ise kendi kodunuzun çizmesi demektir. İki komutla başlayın.

## İki komut

Pano çalışıyor olmalı (burada `http://localhost:8088`). Önce bir anahtar oluşturun: **Görünüm -> Temalar -> dişli düğmesi (Ön yüz ayarları) -> Anahtarlar -> Anahtar Oluştur** ve gösterdiği `.env` satırlarını saklayın.

```sh
bunx @panomc/client-gen new my-site --url http://localhost:8088
cd my-site && bun run dev
```

İlk komut SvelteKit başlangıç şablonunu kopyalar, `.env` yazar ve bağımlılıkları kurar. Anahtarı `.env` içine yapıştırın:

```sh
API_URL=http://localhost:8088/api
PANO_FRONTEND_KEY=pfk_...
PANO_SITE_URL=http://localhost:5173
```

Anahtar yoksa herkese açık sayfalar (yazılar, mağaza) çalışır; giriş ve kayıt anahtar oluşturmanızı ister.

Şablon bir BFF'dir: Pano'ya yapılan her çağrıyı sunucusu yapar, oturum belirteci `HttpOnly` çerezde durur ve `/pano` vekili üzerinden [tipli istemciye](../client/) ve [widget'lara](../widgets/) zaten bağlıdır.

## Ön yüz modları

**Görünüm -> Temalar -> dişli düğmesi (Ön yüz ayarları) -> Mod** altında seçin:

| Mod | Ne çalışır | Ne zaman |
|---|---|---|
| Tema | Pano'nun başlattığı bir tema | Olağan site |
| Özel uygulama | Pano'nun başlattığı zip'iniz | Kendi siteniz olsun, Pano barındırsın |
| Harici | Hiçbir şey; Pano `/` isteğini adresinize yönlendirir | Siteniz başka yerde çalışıyor |
| Yok | Hiçbir şey; yalnızca panel ve API | Yalnızca sunucular ya da tamamen ayrı site |

Özel uygulama: şablonda `bun run package`, zip'i yükleyin, seçin. Zip'in kökünde `manifest.json` ve `index.js` olmalıdır:

```json
{ "id": "my-site", "type": "custom-app", "title": "My site", "version": "1.0.0", "author": "me" }
```

```js
Bun.serve({ port: process.env.PORT, hostname: process.env.HOST, fetch: () => new Response('hello') });
```

Pano şunları iletir: `PORT`, `HOST`, `API_URL`, `PANO_API_URL`, `PANO_FRONTEND_KEY`, `PANO_SITE_URL`, `PROTOCOL_HEADER`, `HOST_HEADER`. Harici modda adresi girin (örneğin `http://127.0.0.1:4000`) ve uygulamanızda `ORIGIN` değerini Pano'nun herkese açık adresine ayarlayın.

`/panel`, `/api` ve `/_pano` her zaman Pano'da kalır. Geri dönmek güvenlidir: yeni ön yüz başlamazsa öncekisi hizmet vermeye devam eder.

## Yedek sayfalar

Pano ziyaretçilere bağlantılar gönderir: etkinleştirme postaları, parola sıfırlama, ödeme dönüşleri. Ön yüzünüzde bu sayfalar henüz olmayabilir; bu yüzden Pano `/_pano/<hedef>` altında sade sayfalar sunar:

| Hedef | Sayfa |
|---|---|
| `auth.activate`, `auth.activate-new-email`, `auth.renew-password` | Posta bağlantıları |
| `auth.login` | Giriş |
| `market.order` | Ödeme dönüşü, sipariş durumu |

Hedefi siz üstlenene kadar vardırlar.

## URL haritası

Pano'nun oluşturduğu her bağlantının bir hedef adı vardır. Çözümleme sırası, ilk bulunan kazanır:

1. **Görünüm -> Temalar -> dişli düğmesi (Ön yüz ayarları)** altında koyduğunuz geçersiz kılma (`PUT /api/v1/panel/frontend/urls`).
2. Ön yüzünüzün manifest veya tanımlayıcısındaki `urls`. `false` "böyle bir sayfa yok" demektir.
3. Tema modunda, temanın o sayfa için kendi rotası.
4. Varsa `/_pano/<hedef>` yedek sayfası; yoksa bağlantı bırakılır.

Sonucu okuyun:

```sh
curl http://localhost:8088/api/v1/frontend/urls
```

Özel uygulamanın `manifest.json` dosyasında iki hedefi üstlenin:

```json
{ "urls": { "auth.activate": "/welcome/confirm?token={token}", "market.order": "/shop/o/{id}" } }
```

Başka alan adındaki sunucu tarafı bir ön yüz, oturum başlatan hedefleri (`createsSession`) üstlenmelidir: panel bunları "sunucu tarafı ön yüzler için gerekli" diye işaretler.

## Ayar formu

Bir ön yüz kendi ayarlarını tanımlayabilir (`fields` içeren `settingsSchema`); panel formu çizer ve `GET /api/v1/frontend/settings` değerleri döner. Alan türleri: `text`, `textarea`, `boolean`, `number`, `select`, `color`, `url`, `image`.
