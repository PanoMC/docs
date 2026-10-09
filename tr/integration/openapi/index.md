# OpenAPI Referansını Okuma

Pano kendi API'sini kendisi anlatır. Senkron tutulacak ayrı bir referans yoktur: çalışan site OpenAPI 3.1 belgesiyle cevap verir, her eklenti de öyle.

## Belgeler

| Belge | URL | İçerik |
|---|---|---|
| Çekirdek | `/api/v1/openapi.json` | Pano'nun genel işlemleri |
| Bir eklenti | `/api/v1/plugins/<pluginId>/_/openapi.json` | O eklentinin genel işlemleri |
| Panel | `/api/v1/panel/openapi.json` | Dahili işlemler, panel oturumu gerekir |

Yerel bir Pano'dan çekirdek belgeyi alın:

```sh
curl -s http://localhost:8088/api/v1/openapi.json -o pano-openapi.json
```

Market eklentisinin belgesini alın:

```sh
curl -s http://localhost:8088/api/plugins/pano-plugin-market/_/openapi.json -o market-openapi.json
```

Eklentilerin fazladan bir şey yapması gerekmez: Pano belgeyi eklentinin uç noktalarından üretir, kapalı kaynaklı eklentiler dahil. Kurulu ama durdurulmuş eklentilerin belgesi yoktur.

## Bir işlem nasıl okunur

- `servers[0].url` ön ektir: çekirdek için `/api/v1`, eklenti için `/api/plugins/<pluginId>`. İşlem yolları bunun ardından gelir.
- `operationId`, uç nokta sınıf adının `API` olmayan halidir, örneğin `GetPosts`. [Tipli istemci](../client/) fonksiyonlarını buna göre adlandırır.
- `parameters` ve `requestBody`, uç noktanın kendi doğrulamasından alınan JSON Schema'dır.
- `responses` başarı gövdesini ve hata zarfını listeler. Ortak hata kodları (`NOT_LOGGED_IN`, `NO_PERMISSION`, `INVALID_CSRF_TOKEN`, `TOO_MANY_REQUESTS`, `MAINTENANCE_MODE_ENABLED`) paylaşılır.
- `deprecated: true` bir yerine geçenin olduğunu söyler; `x-pano-removal` en erken kaldırma tarihidir.
- `x-pano-stability` değeri `public` veya `internal`dır. Yalnızca genel işlemler [API Temelleri](../api-basics/) sayfasındaki sözü taşır.
- `x-pano-undocumented: true`, yazarın açıklama vermediği anlamına gelir: yol ve girdiler gerçektir, cevap serbest biçimlidir.

## Hızlıca bakın

Tüm genel yolları ve yöntemleri `jq` ile listeleyin:

```sh
jq -r '.paths | to_entries[] | .key as $p | .value | keys[] | "\(.) \($p)"' pano-openapi.json
```

Tek bir işlemi gösterin:

```sh
jq '.paths["/posts"].get' pano-openapi.json
```

Herhangi bir OpenAPI 3.1 görüntüleyicisi veya üreteci dosyaları olduğu gibi okuyabilir.

## Bir kopya tutmak

Belgeyi kodunuzun yanına kaydedin ve güncellemelerden sonra karşılaştırın. Bir işlemi veya cevap alanını kaldıran bir değişiklik (süresi dolmuş kullanımdan kaldırılanlar hariç) bir hatadır: bildirin.

JavaScript için dosyanın kendisine nadiren ihtiyaç duyarsınız. [`pano-client pull`](../client/) çekirdek belgeyi ve etkin eklentilerin belgelerini indirir ve fonksiyonlara çevirir.

## Belgelerde olmayanlar

- Gerçek zamanlı soketler: [Erişim](../access/#websocket-bileti) sayfasına bakın.
- Ön yüzün sayfa yolları ve `/_pano/*` yedek sayfaları: [Ön Yüz Hızlı Başlangıç](../headless/) sayfasına bakın.
- Giden olaylar: [Webhooklar](../webhooks/) sayfasına bakın.
