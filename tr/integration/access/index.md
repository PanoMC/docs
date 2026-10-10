# Erişim

API'yi kimin çağırabileceği ve bir ön yüzün bunu nasıl kanıtladığı. Karşılaşacağınız sırayla üç durum.

## 1. Sitedeki bir tarayıcı (çerez + CSRF)

Varsayılan. Bir tema ya da sitenizin alan adındaki herhangi bir sayfa giriş yapar ve Pano çerez koyar. Pano çerezleri yalnızca ana makineye aittir ve `SameSite=Lax` taşır.

Giriş yapmış bir çerez oturumunun her yazma isteği (`POST`, `PUT`, `PATCH`, `DELETE`) bir CSRF belirteci taşımalıdır:

```sh
curl -s -b jar -c jar http://localhost:8088/api/v1/auth/csrf
# {"csrfToken":"..."}
```

```js
await fetch('/api/plugins/pano-plugin-market/cart/items', {
  method: 'POST',
  credentials: 'include',
  headers: { 'content-type': 'application/json', 'X-CSRF-Token': token },
  body: JSON.stringify({ productId: 1 })
});
```

Eksik veya yanlış belirteç `403 INVALID_CSRF_TOKEN` döner. `@panomc/sdk` ve [tipli istemci](../client/) belirteci sizin yerinize alır ve gönderir. Kimse giriş yapmamışsa `GET /auth/csrf` `401` döner: bu bir hata değildir, önce giriş yapın.

## 2. Başka bir adresteki tarayıcı (izinli kaynaklar)

`https://play.example.com` adresindeki bir sayfa `https://example.com` adresindeki Pano'yu çağırıyorsa: sayfanın kaynağını panelde **Görünüm -> Temalar -> dişli düğmesi (Site gösterim ayarları)** altında "Başka web sitelerinin bu Pano'ya erişmesine izin ver" anahtarını açarak açılan "Bu Pano'ya erişebilecek web siteleri" listesine ekleyin (ya da `PUT /api/v1/panel/frontend/origins`, en fazla 20).

- Biçim `scheme://host[:port]`, yol yok, joker yok. `localhost` veya IP değilse `https`.
- `website-url` ile aynı kayıtlı alan adını paylaşmalıdır. Farklı alan adı reddedilir (`ORIGIN_DIFFERENT_SITE`): bunun yerine ön yüz anahtarı kullanın.
- İzinli kaynaklar CORS başlıkları alır (`credentials: 'include'`, asla `*`). Preflight `204` döner.
- Tarayıcılar `content-type`, `accept`, `x-csrf-token`, `x-requested-with` gönderebilir. Tarayıcıdan `Authorization` başlığı gönderilmez.
- Diğer kaynaklar okumada CORS başlığı almaz, yazmada `403 ORIGIN_NOT_ALLOWED` alır.

## 3. Bir sunucu (ön yüz anahtarı + oturum belirteci)

BFF, özel bir ön yüz ya da Pano'yu çok sayıda ziyaretçi adına çağıran herhangi bir sunucu **ön yüz anahtarı** (panelde: "Site bağlantı anahtarı") kullanır. **Görünüm -> Temalar -> dişli düğmesi (Site gösterim ayarları) -> Site bağlantı anahtarları -> Yönet** altında oluşturun. Bir kez gösterilir, iki `.env` satırıyla birlikte:

```sh
PANO_API_URL=https://example.com/api
PANO_FRONTEND_KEY=pfk_...
```

| Başlık | Anlamı |
|---|---|
| `X-Pano-Frontend-Key: pfk_...` | Sunucunuzu tanıtır. Yanlış anahtar: `401 INVALID_FRONTEND_KEY`. |
| `X-Pano-Client-Ip: 203.0.113.9` | Ziyaretçinin adresi. Yalnızca geçerli anahtarla dikkate alınır; aksi halde `400 INVALID_CLIENT_IP`. |
| `Authorization: Bearer <sessionToken>` | Ziyaretçinin oturumu, giriş cevabından. |

Anahtarlar yalnızca ön yüz modu Tema değilken çalışır ("Site bağlantı anahtarları" satırı seçim "Tema" iken gösterilmez): Tema modunda anahtar oluşturulamaz ve kayıtlı anahtarla gelen istek `403 FRONTEND_ACCESS_DISABLED` döner. Kayıtlı anahtarlar `CUSTOM_APP`, `EXTERNAL` ya da `NONE` modunda yeniden çalışır. İzinli kaynaklar her modda çalışır.

Anahtar kaynak denetimini atlar ve ziyaretçi adresi başına kendi hız sınırı kovalarına sahiptir. Parola, captcha ve 2FA kuralları aynen çalışır.

Anahtarla giriş, çerez yerine gövdede bir belirteç döner:

```sh
curl -s http://localhost:8088/api/v1/auth/login \
  -H 'X-Pano-Frontend-Key: pfk_...' -H 'X-Pano-Client-Ip: 203.0.113.9' \
  -H 'content-type: application/json' \
  -d '{"usernameOrEmail":"steve","password":"secret"}'
# {"sessionToken":"eyJ...","expiresAt":1790000000000}
```

Bundan sonra bu belirteci `Bearer` olarak gönderin. CSRF belirteci gerekmez. Kendi sitenizin `HttpOnly` çerezinde saklayın.

Belirteç bir **site** oturumudur: panel API'sinde asla çalışmaz (`403 SITE_TOKEN_NOT_ALLOWED`) ve çerez olarak da çalışmaz. Çıkış, yasaklama veya parola değişikliği onu diğer oturumlar gibi sonlandırır.

## WebSocket bileti

Tarayıcılar WebSocket'e başlık ekleyemez. Tek kullanımlık bir bilet isteyin (30 saniye) ve URL'ye koyun:

```sh
curl -s -X POST http://localhost:8088/api/v1/auth/ws-ticket -b jar -H 'X-CSRF-Token: ...'
# {"ticket":"...","expiresIn":30}
```

Soketi `?ticket=<ticket>` ile açın. Kullanılmış veya süresi dolmuş bilet `401 INVALID_WS_TICKET` döner. Bir BFF, bileti ziyaretçinin Bearer belirteciyle alır ve tarayıcıya iletir.

## Ters vekil sunucunun arkasında

Pano ziyaretçi adresini `X-Forwarded-For` başlığından yalnızca güvenilir bir eşten okur (`server.trusted-proxies`, ayrıca loopback ve özel adresler). Tüm ziyaretçiler tek adres gibi görünüyorsa panel, eklenecek satırı gösteren bir uyarı çıkarır.
