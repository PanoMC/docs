# API Temelleri

Pano'nun ziyaretçiler için yaptığı her şey HTTP üzerinden erişilebilir. Bu sayfa kısa özet: API nerede, bir cevap nasıl görünür, listeler nasıl sayfalanır ve Pano bir şeyin kaldırılacağını nasıl bildirir.

## Nerede

Her genel yol `/api/v1` ile başlar. Kendi sitenizde deneyin:

```sh
curl http://localhost:8088/api/v1/site-info
```

| Bölüm | Yol | Söz |
|---|---|---|
| Site API'si (çekirdek) | `/api/v1/...` | Genel. Yalnızca eklemeler. |
| Bir eklentinin API'si | `/api/plugins/<pluginId>/...` | Genel. `<pluginId>` tam kimliktir, örneğin `pano-plugin-market`. |
| Çekirdeğin eklenti başına servisleri | `/api/v1/plugins/<pluginId>/_/...` | Genel. `_` çekirdek için ayrılmıştır. |
| Panel API'si | `/api/v1/panel/...` | Dahili. Panel ve platform birlikte yayınlanır. |
| Kurulum, düğüm, bakım | `/api/v1/setup`, `/node`, `/maintenance` | Dahili. |

Eklenti panel uç noktaları `/api/plugins/<pluginId>/panel/...` altındadır. Bunun dışında `/api` altında hiçbir şey sunulmaz ve `/panel/api` artık yoktur.

## Eklenti ad alanı

- Bir eklentinin yollarında sürüm yoktur: `/api/plugins/<pluginId>/...`. Eklenti API'sini kendisi sahiplenir ve kendisi sürümler; çekirdeğin `/api/v1` sözü onu kapsamaz. Eski `/api/v1/plugins/<pluginId>/...` yolları 404 verir.
- `panel` ve `_` ayrılmış ilk bölümlerdir. `panel` eklentinin yönetici uç noktalarını, `_` çekirdeğin eklentiyle ilgili kendi servislerini (`translations`, `openapi.json`, `ui.zip`) işaretler; bunlar `/api/v1/plugins/<pluginId>/_/` altında kalır.
- Eklenti yönetimi çekirdekte `/api/v1/panel/plugins/...` altında kalır.
- Beş çekirdek liste `items` olarak yeniden adlandırıldı: destek kenar çubuğu `onlineAdmins`, panel oyuncu araması `players`, bekleyen sunucular `servers`, sunucu oyuncuları `players` ve yazılımlar `software`. Yalnızca sayfalı listeler `page` taşır.

## Cevaplar

Başarılı cevap düz bir JSON nesnesidir. `result` sarmalayıcısı yoktur:

```json
{ "message": "hi" }
```

Başarısız cevap, uç nokta ne olursa olsun tek biçimdedir:

```json
{ "error": { "code": "INVALID_FIELDS", "fields": { "email": "EXISTS" } } }
```

`code` her zaman vardır ve sürümler arasında değişmez. `message` (İngilizce, günlük okuyan insanlar için), `details` ve `fields` yalnızca söyleyecek bir şey varsa gelir. HTTP metnine değil, `code` değerine bakın.

Her cevap ayrıca `Pano-Api-Level` başlığını taşır: bu Pano'nun API seviyesi. Eklenti sözleşmesi yeni bir şey kazandığında yükselir.

## Listeler ve sayfalar

Sayfayı `page` (1'den başlar) ve `pageSize` (en fazla 100) ile isteyin:

```sh
curl "http://localhost:8088/api/v1/posts?page=2&pageSize=20"
```

```json
{ "items": [ ], "page": { "number": 2, "size": 20, "totalItems": 57, "totalPages": 3 } }
```

- `1..100` dışındaki `pageSize` `INVALID_FIELDS` ve `fields.pageSize = OUT_OF_RANGE` ile reddedilir. Sessizce kırpılmaz.
- Son sayfadan sonraki sayfa `404 PAGE_NOT_FOUND` döner. Boş liste, 1. sayfa ve `totalPages: 0` döner.
- Birkaç dahili liste (konsol araması, uyarılar) `limit` ve `cursor` kullanır ve `page.nextCursor` döner.

## Seviyeler, kararlılık, kullanımdan kaldırma

- **Genel işlemler yalnızca büyür.** Hiçbir şey kaldırılmaz veya yeniden adlandırılmaz, hiçbir alanın türü değişmez veya kaybolmaz, hiçbir istek alanı zorunlu olmaz, hiçbir hata kodu değişmez.
- **Kullanımdan kaldırılan** işlemler çalışmaya devam eder. OpenAPI belgesinde `deprecated: true` ile işaretlenir ve `Deprecation: true` ile `Sunset: <tarih>` başlıklarını döner.
- Kullanımdan kaldırılan bir işlem, onu kullanımdan kaldıran sürümden en erken **6 ay** sonra, `Sunset` tarihinde kaldırılır.
- Eklentiler ve temalar ihtiyaç duydukları API seviyesini bildirir. Pano bir kaynağı yalnızca seviyesi sitenin en düşük ve güncel seviyesi arasındaysa başlatır.

## Hız sınırları

Çağrılar ziyaretçi adresi başına sınırlanır. Sınırlanan çağrılar `429 TOO_MANY_REQUESTS` ile `X-RateLimit-Limit`, `X-RateLimit-Remaining` ve `Retry-After` başlıklarını döner. Çok sayıda ziyaretçiye hizmet veren bir ön yüz, kendi kovalarını almak için bir [ön yüz anahtarı](../access/) kullanır.

## Sonraki

- [API referansını okuma](../openapi/): her işlemi ve şemasını bulun.
- [Erişim](../access/): çerezler, CSRF, anahtarlar, WebSocket.
