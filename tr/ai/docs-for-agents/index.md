# Ajanlar için Dokümanlar

Bu dokümantasyonu bir yapay zekâ ajanının önüne koymanın dört yolu. Aracınız destekliyorsa MCP sunucusunu kullanın; dosyalar diğer her yerde çalışır.

## llms.txt

```text
https://panomc.com/docs/llms.txt
```

Dil modelleri için kısa bir dizin: dokümantasyonun her sayfası, başlığı ve adresiyle. URL açabilen bir ajana verin, ihtiyacı olan sayfaları kendisi seçsin. Bir sayfanın tam adresini bulmanın güvenilir yeri de burasıdır.

## llms-full.txt

```text
https://panomc.com/docs/llms-full.txt
```

Tüm dokümantasyon tek bir Markdown dosyasında. Araç web'de gezemiyorsa kullanın: indirip ekleyin ya da projenin bilgi kaynaklarına koyun. Dosya büyüktür; hangi sayfaların önemli olduğunu biliyorsanız tek tek sayfaları tercih edin.

## Bir sayfa Markdown olarak

Her sayfa düz Markdown olarak da sunulur: sayfa adresinin sonuna (sondaki eğik çizgi olmadan) `.md` ekleyin.

| Sayfa | Markdown |
|---|---|
| `https://panomc.com/docs/platform/installation/` | `https://panomc.com/docs/platform/installation.md` |

```sh
curl -s https://panomc.com/docs/platform/installation.md
```

Bir adres cevap vermiyorsa tam adresi `llms.txt` içinden alın.

## MCP sunucusu

`https://panomc.com/mcp`, bu dokümanlar için bir Model Context Protocol sunucusudur. Aktarım: Streamable HTTP. Giriş yok. Salt okunur: hiçbir Pano sitesini göremez ve değiştiremez.

| Araç | Girdi | Döndürdüğü |
|---|---|---|
| `search_docs` | bir sorgu | eşleşen sayfalar |
| `get_doc` | bir sayfa yolu | o sayfanın Markdown hali |

### Claude Code

```sh
claude mcp add --transport http pano-docs https://panomc.com/mcp
```

### Cursor ve diğer istemciler

Sunucuyu istemcinin MCP yapılandırmasına ekleyin (Cursor'da: projedeki `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "pano-docs": { "url": "https://panomc.com/mcp" }
  }
}
```

### VS Code

VS Code `servers` anahtarını kullanır ve tür ister (projedeki `.vscode/mcp.json`):

```json
{
  "servers": {
    "pano-docs": { "type": "http", "url": "https://panomc.com/mcp" }
  }
}
```

Streamable HTTP üzerinden uzak MCP sunucularını destekleyen başka her istemci aynı adresle çalışır.

## Deneyin

```text
pano-docs araçlarını kullan. Bir sunucu kendini tanıtmak için Pano'ya hangi başlığı gönderir
ve o anahtarı panelde nerede oluştururum? Bilgiyi aldığın sayfayı belirt.
```

Doğru cevap `X-Pano-Frontend-Key` başlığını ve [Erişim](../../integration/access/) sayfasındaki panel yolunu verir. Ajan `search_docs` ya da `get_doc` çağırmadan cevaplıyorsa araçları kullanmasını söyleyin: ezberden gelen cevap çoğu zaman eskidir.

## İpuçları

- Ajandan kullandığı **sayfanın adını** isteyin. Böylece açıp denetleyebilirsiniz.
- Bu dokümanlar Pano'yu genel olarak anlatır. **Kendi** sitenizin, kendi eklentilerinizle API'si için ajana kendi OpenAPI belgenizi verin: [Pano API'sini Ajanla Kullanma](../using-pano/).
- Bir eklenti, tema ya da başlangıç şablonu deposunda ajan önce `agent-guide/` klasörünü okumalıdır: [Ajanla Geliştirme](../building/).
