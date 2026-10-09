# Webhooklar

Pano, bir şey olduğunda başka bir sisteme haber verebilir: bir oyuncu kaydolur, bir destek talebi açılır, bir yazı yayınlanır, bir sipariş ödenir. Pano'ya bir adres verirsiniz; Pano o adrese imzalı bir `POST` gönderir.

Panelde **Ayarlar -> Webhooklar** altında oluşturun: ad, adres, olaylar, bir gizli anahtar (bir kez gösterilir). **Test** hemen bir ping gönderir.

## Olaylar

Adlar `kaynak.konu.fiil` biçimindedir. Kaynak `core` ya da eklentinin kısa adıdır.

| Olay | Ne zaman |
|---|---|
| `core.user.registered` | Bir oyuncu kaydolur |
| `core.user.deleted` | Bir oyuncu panelde silinir |
| `core.ticket.created` | Bir destek talebi açılır |
| `core.ticket.replied` | Talebe mesaj gelir (`staff` kimin yazdığını söyler) |
| `core.post.published` | Bir yazı yayınlanır |
| `core.test.ping` | **Test**'e bastınız |

Eklentiler kendilerininkini ekler, örneğin `market.order.paid`, `market.order.refunded`, `market.subscription.renewed`, `market.shipment.shipped`. Panel her olayı örnekle listeler.

Tam adlara, `core.*` veya `market.*` gibi önek joker karakterine ya da `*` abone olabilirsiniz. Joker karakterler `core.test.ping` olayını içermez.

Yükler e-posta adresi, IP adresi veya mesaj metni taşımaz.

## Ne alırsınız

```json
{
  "id": "6c1f1b0e-0d4b-3a5e-9b0e-2f5c7e1a9d11",
  "event": "core.post.published",
  "source": "core",
  "createdAt": 1790000000000,
  "apiVersion": 1,
  "site": { "name": "My server", "url": "https://example.com" },
  "data": { "id": 7, "title": "Hello", "url": "/post/hello", "categoryId": 1, "publishedAt": 1790000000000 }
}
```

İleride yeni anahtarlar eklenebilir; bilmediğiniz bir anahtarda asla hata vermeyin. `id`, bir olay ve bir uç nokta için sabittir: tekrarları yok saymak için kullanın.

Başlıklar: `X-Pano-Event`, `X-Pano-Event-Id`, `X-Pano-Delivery`, `X-Pano-Attempt`, `X-Pano-Signature`.

## İmzayı doğrulayın

`X-Pano-Signature` değeri `t=<unix saniye>,v1=<hex>` biçimindedir; `v1`, gizli anahtarınızla `<t>.<ham gövde>` metninin HMAC-SHA256 değeridir. Ayrıştırılmış JSON'u değil, ham gövdeyi kullanın. `t` değeri 300 saniyeden eskiyse reddedin.

```js
import { createHmac, timingSafeEqual } from 'node:crypto';

export function verify(rawBody, header, secret) {
  const parts = Object.fromEntries(header.split(',').map((p) => p.split('=')));
  if (Math.abs(Date.now() / 1000 - Number(parts.t)) > 300) return false;
  const expected = createHmac('sha256', secret).update(`${parts.t}.${rawBody}`).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(parts.v1 ?? '');
  return a.length === b.length && timingSafeEqual(a, b);
}
```

Başka yoldan güvendiğiniz uç noktalar için imza kapatılabilir. Discord biçimi imzasız bir embed gönderir.

## Yeniden denemeler

10 saniye içinde herhangi bir `2xx` ile cevap verin. Aksi halde Pano varsayılan olarak 8 denemeye kadar (1 ile 20) yeniden dener:

- Bekleme 30 saniyeden başlayıp ikiye katlanarak 6 saate kadar çıkar, küçük bir sapmayla.
- `429` veya `503` üzerindeki `Retry-After` dikkate alınır (en fazla 1 saat).
- `410 Gone` hemen durdurur. Yönlendirmeler izlenmez.
- Üst üste 50 başarısızlıktan sonra webhook kapatılır.

Pano kendi ağının içine işaret eden adresleri reddeder. Yerel bir test alıcısı için `config.conf` içinde `webhooks.allow-private-targets = true` ayarlayın (barındırılan Pano'da yok sayılır).

## Kayıt

Her gönderim durumu (`PENDING`, `SENDING`, `SUCCEEDED`, `FAILED`, `DEAD`), denemeleri, cevabı ve süresiyle saklanır. Son cevabı görmek ya da birini **yeniden göndermek** için panelde açın. Biten kayıtlar 30 gün sonra silinir. Site başına en fazla 50 webhook.
