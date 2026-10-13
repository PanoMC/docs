# Pano ve Yapay Zekâ Ajanları

Pano için bir yapay zekâ kodlama ajanıyla geliştirme yapabilirsiniz: Claude Code, Cursor, Codex, GitHub Copilot ya da dosya okuyup komut çalıştırabilen başka bir araç. Bu bölüm, Pano'nun böyle bir araca okuması için neler sunduğunu ve ondan eklenti, tema, headless site ya da betik isterken nasıl ilerleyeceğinizi gösterir.

Bir ajan, okuduğu kadar iyidir. Pano'nun paketleri yeni ve sık değişiyor; ezberden cevap veren bir ajan tahmin yürütür. Onu aşağıdaki kaynaklara yönlendirin.

## Neler var

| Ne | Nerede | Ne işe yarar |
|---|---|---|
| LLM'ler için sayfa dizini | `https://panomc.com/docs/llms.txt` | Her dokümantasyon sayfasının adresiyle birlikte listesi |
| Tüm dokümantasyon tek dosyada | `https://panomc.com/docs/llms-full.txt` | Araç web'de gezemiyorsa yapıştırın ya da ekleyin |
| Her sayfa Markdown olarak | sayfa adresinin sonuna `.md` | Ajana tek bir sayfayı tam olarak verin |
| Doküman MCP sunucusu | `https://panomc.com/mcp` | Ajan dokümanlarda kendisi arar ve okur |
| Şablon depolarındaki ajan rehberi | `AGENTS.md`, `CLAUDE.md` ve `agent-guide/` | Eklenti, tema ya da headless site yazma kuralları |
| Kendi Pano'nuzun OpenAPI belgesi | sitenizde `/api/v1/openapi.json` | Sitenizin tam API'si, eklentiler dahil |

## Şunu yapmak istiyorum...

| İstediğim | Gidilecek yer |
|---|---|
| Ajanım bu dokümanlarda arama yapsın | [Ajanlar için Dokümanlar](./docs-for-agents/) |
| Ajanla bir eklenti (addon) yapmak | [Ajanla Geliştirme](./building/#plugin) |
| Ajanla tema yapmak ya da görünümünü değiştirmek | [Ajanla Geliştirme](./building/#theme) |
| Pano'nun API'si üzerine kendi sitemi kurmak (headless) | [Ajanla Geliştirme](./building/#headless-front-end) |
| Ajan, çalışan Pano'ma karşı bir betik yazsın | [Pano API'sini Ajanla Kullanma](./using-pano/) |
| Aynı şeyleri kendim okumak | [Eklenti el kitabı](../handbook/addon/), [Tema el kitabı](../handbook/theme/), [API Temelleri](../integration/api-basics/) |

## Bir dakikalık kurulum

Dokümanları ajanınıza bir kez bağlayın. Claude Code'da:

```sh
claude mcp add --transport http pano-docs https://panomc.com/mcp
```

Cursor'da ve diğer araçların çoğunda MCP yapılandırma dosyasına şunu ekleyin:

```json
{
  "mcpServers": {
    "pano-docs": { "url": "https://panomc.com/mcp" }
  }
}
```

Sunucu giriş istemez ve yalnızca dokümantasyonu okuyabilir. VS Code için olan biçim ve aracınız MCP desteklemiyorsa yapılacaklar [Ajanlar için Dokümanlar](./docs-for-agents/) sayfasındadır.

Sonra çalıştığını görmek için bir şey sorun:

```text
pano-docs araçlarını kullan. Yeni bir Pano temasına nasıl başlarım ve ana rengi değiştirmek için hangi dosyayı düzenlerim?
```

Cevapta, [Tema Başlangıç](../theme/getting-started/) sayfasındaki gibi `bunx @panomc/theme-core new` ve `src/styles/tokens.scss` geçmelidir.

## Ajanın sizin yerinize yapamayacakları

- **Çalışan bir Pano'nun yerini tutmaz.** Eklenti ve tema, Geliştirme Modu açık kendi Pano'nuza karşı geliştirilir. [Kurulum](../platform/installation/) sayfasına bakın.
- **Sitenizi yönetmez.** Pano'nun bir siteyi değiştiren MCP sunucusu yoktur. Tek MCP sunucusu, bu dokümanlar için olan salt okunur sunucudur. Ajan çalışan bir Pano'ya yalnızca HTTP API'siyle ve sizin verdiğiniz erişimle ulaşır: [Pano API'sini Ajanla Kullanma](./using-pano/).
- **Sizin yerinize yayınlamaz.** Yayınlamadan önce farkı (diff) okuyun, denetimleri çalıştırın ve sonucu tarayıcıda deneyin. Bu bölümün her sayfası, elle neyi gözden geçirmeniz gerektiğiyle biter.
