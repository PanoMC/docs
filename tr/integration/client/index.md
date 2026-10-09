# Tipli İstemci

`@panomc/client`, bağımlılığı olmayan küçük bir JavaScript istemcisidir. Fonksiyonları kendi Pano'nuzun OpenAPI belgelerinden üretilir, yani kurulu eklentilerinizle eşleşir. JSDoc tipleri, TypeScript gerekmez.

## Çekin

Proje klasörünüzden:

```sh
bunx @panomc/client-gen pull --url http://localhost:8088 --out src/lib/pano
```

`pull`, `/api/v1/openapi.json` ve eklenti paket listesini okur, sonra şunları yazar:

```
src/lib/pano/core/                 çekirdek işlem başına bir fonksiyon
src/lib/pano/plugins/market/       her etkin eklenti için aynısı
src/lib/pano/plugins/index.json    eklenti, sürüm ve özetler
```

UI paketi olmayan bir eklenti için `--plugin pano-plugin-name` ekleyin. Hiçbir şey anahtar istemez: `pull`'un okuduğu her şey herkese açıktır. Pano cevap vermezse mesaj hangi URL'yi denediğini söyler.

## Kullanın

```js
import { createClient } from '@panomc/client';
import { getPosts } from './lib/pano/core/index.js';

const client = createClient({ baseUrl: 'http://localhost:8088' });

const result = await getPosts(client, { query: { page: 1, pageSize: 5 } });
if (result.ok) console.log(result.data.items);
else console.log(result.error.code);
```

- `baseUrl`, `/api/v1` öncesidir: Pano'nun adresi ya da `/pano` gibi bir vekil ön eki.
- Çağrı HTTP veya ağ sorununda asla hata fırlatmaz. `{ ok: true, status, data }` veya `{ ok: false, status, error }` döner. Ağ hatası `status: 0` ve `error.code: 'NETWORK_ERROR'` olur.
- İstisna mı istiyorsunuz? Sarmalayın: `unwrap(result)` `data` döner ya da `code`, `status` ve `fields` taşıyan `PanoApiError` fırlatır.
- Fonksiyon adları, ilk harfi küçük `operationId` değeridir: `GetPosts` olur `getPosts`.

## Seçenekler

| Seçenek | Kullanım |
|---|---|
| `frontendKey` | Yalnızca sunucu. `X-Pano-Frontend-Key` olarak gönderilir. |
| `sessionToken` | Metin ya da fonksiyon. `Authorization: Bearer` olarak gönderilir. |
| `clientIp` | Ziyaretçinin adresi; yalnızca anahtarla gönderilir. |
| `locale` | `Accept-Language` olarak gönderilir. |
| `credentials` | Tarayıcıda `include` (çerez oturumu), başka yerde `omit`. |
| `csrf` | Çerez oturumları için varsayılan `auto`: istemci belirteci alır ve gönderir, `INVALID_CSRF_TOKEN` olursa bir kez yeniden dener. Bearer için `off`. |
| `onUnauthorized` | `401` olunca çağrılır. |

Anahtarlı bir sunucu:

```js
const client = createClient({
  baseUrl: process.env.API_URL.replace(/\/api\/?$/, ''),
  frontendKey: process.env.PANO_FRONTEND_KEY,
  sessionToken: sessionFromCookie,
  clientIp: visitorIp
});
```

## OpenAPI'si olmayan eklenti

Herhangi bir yolu elle çağırın:

```js
await client.request({ method: 'GET', path: '/api/plugins/pano-plugin-x/things' });
```

## Uyumlu tutun

Pano'yu ya da bir eklentiyi güncelleyin, sonra neyin değiştiğine bakın:

```sh
bunx @panomc/client-gen check --url http://localhost:8088 --dir src/lib/pano
```

Komut 1 ile çıkar ve kaldırılan ya da değişen işlemleri listeler. Güncellemek için `pull` komutunu yeniden çalıştırın. Çalışan Pano olmadan kayıtlı bir dosyadan üretmek için:

```sh
bunx @panomc/client-gen generate --input pano-openapi.json --out src/lib/pano/core
```

Kullanımdan kaldırılan işlemler `@deprecated` ile işaretlenir, böylece editörünüz üzerini çizer.
