# Ajanla Geliştirme

Bir yapay zekâ ajanına Pano için eklenti, tema ya da headless site yaptırmanın yolu. Kalıp her seferinde aynıdır: resmi iskeletten başlayın, ajan rehberi okusun, her seferinde tek bir şey isteyin, denetimleri çalıştırın, elle gözden geçirin.

## Ajan rehberi

Pano'nun ajanlar için kuralları bu doküman deposunda, [`PanoMC/docs`](https://github.com/PanoMC/docs/tree/dev/guidelines) içindeki `guidelines/` klasöründedir: `agent-guide/` (işe göre yönlendiren kısa bir `README.md`, "yeni eklenti yapmak", "işaretlemeye dokunmadan görünümü değiştirmek", "headless ön yüz"..., ve her iş için küçük bir dosya) ve `design/` (panel tasarım kuralları). Resmi Pano depolarının hepsinde bu depo `docs/` git alt modülü olarak durur; `AGENTS.md` ajanı yalnızca oraya yönlendirir, `CLAUDE.md`, `GEMINI.md` ve `.github/copilot-instructions.md` de `AGENTS.md`'yi gösterir.

| Depo | `docs/` alt modülü var mı |
|---|---|
| [`PanoMC/pano-starter-sveltekit`](https://github.com/PanoMC/pano-starter-sveltekit) (headless başlangıç) | evet |
| [`PanoMC/pano-boilerplate-plugin`](https://github.com/PanoMC/pano-boilerplate-plugin) (eklenti şablonu) | evet |
| [`PanoMC/vanilla-theme`](https://github.com/PanoMC/vanilla-theme) (varsayılan tema) | evet |

Eklenti ve tema iskelet komutları bunu yeni projeye eklemez. Projenizin git deposunda bir kez ekleyin:

```sh
git submodule add -b dev https://github.com/PanoMC/docs.git docs
```

Sonra isteklerinize "Önce `docs/guidelines/agent-guide/README.md` dosyasını oku" diye başlayın ya da bu cümleyi kendi `AGENTS.md` dosyanıza yazın.

## Eklenti {#plugin}

[Eklenti Başlangıç](../../addon/getting-started/) sayfasındaki gibi başlayın; Pano yerelde çalışıyor ve Geliştirme Modu açık olmalı:

```sh
cd <your-pano>/plugins && bunx @panomc/plugin-kit new my-plugin
cd my-plugin && bun run dev
```

Örnek istekler:

```text
Önce docs/guidelines/agent-guide/README.md dosyasını oku. /my-plugin/rules adresinde sunucu kurallarının
listesini gösteren bir site sayfası ekle. Kuralları eklentinin kendi tablosunda sakla ve
onları listeleyen uç noktayı ekle.
```

```text
Önce docs/guidelines/agent-guide/README.md dosyasını oku. Yöneticinin kuralları ekleyip düzenleyip
silebileceği, bu eklentinin bir izniyle korunan bir panel sayfası ekle. docs/guidelines/design/README.md'ye uy.
```

```text
Bu eklentinin bütün metinlerini src/main/resources/locales/ altına taşı ve Türkçe çeviri ekle.
```

Sonucu denetleyin: `bun run check` (ya da `bunx pano-plugin check --strict`), sonra `./gradlew build`. Kotlin değişikliklerini görmek için `./gradlew build -Pnoui` ve Pano'yu yeniden başlatmak gerekir.

## Tema {#theme}

[Tema Başlangıç](../../theme/getting-started/) sayfasındaki gibi başlayın:

```sh
bunx @panomc/theme-core new my-theme
cd my-theme && bun install && bun run dev:ui
```

Örnek istekler:

```text
Önce docs/guidelines/agent-guide/README.md dosyasını oku. Bu temaya yeşil vurgulu koyu bir görünüm ver.
Yalnızca src/styles/tokens.scss ve src/styles/style.scss dosyalarını değiştir; hiçbir view'ı eject etme.
```

```text
Önce docs/guidelines/agent-guide/README.md dosyasını oku. Ana sayfayı bir karşılama sayfasıyla değiştir:
sunucu adresini gösteren bir üst bölüm, ardından son üç yazı. Bütün eklenti slotlarını koru.
```

```text
Market eklentisinin ürün kartını bu temaya uyacak şekilde yeniden biçimlendir. İşe yarayan
en ucuz adımı seç ve hangisini seçtiğini söyle.
```

Sonucu denetleyin: `bunx @panomc/theme-core check --strict`, `bun run build`; ayrıca her view'ı örnek veriyle görmek için `<Pano adresiniz>/__pano/views` adresini açın.

## Headless ön yüz {#headless-front-end}

[Ön Yüz Hızlı Başlangıç (Headless)](../../integration/headless/) sayfasındaki gibi başlayın. Bu iskelet `AGENTS.md`, `CLAUDE.md` ve `docs/` için bir `.gitmodules` kaydıyla gelir (alt modülü yukarıdaki gibi ekleyin):

```sh
bunx @panomc/client-gen new my-site --url http://localhost:8088
cd my-site && bun run dev
```

Örnek istekler:

```text
Önce AGENTS.md dosyasını oku. Bu Pano'nun Minecraft sunucularını çevrimiçi oyuncu sayılarıyla
listeleyen bir /servers sayfası ekle. src/lib/pano içindeki üretilmiş istemciyi kullan, onu düzenleme.
```

```text
bun run pano:pull çalıştır, sonra market eklentisinin işlemleri üzerine bir mağaza sayfası ekle.
```

Sonucu denetleyin: `bun run check`, `bun test`, `bun run build`. `bun run package`, "Yüklediğim site" olarak yükleyeceğiniz zip'i üretir.

## Yayınlamadan önce elle gözden geçirin

- **Çalıştırın.** Yeşil bir denetim, çalışan bir eklenti ya da tema demek değildir. Sayfayı Geliştirme Modu açık bir Pano'da, telefon genişliğinde de açın.
- **Farkı (diff) okuyun.** Üretilen klasörlerdeki düzenlemelere (temada `src/routes/`, `src/lib/`, `lang/`; eklentide `src/main/resources/plugin-ui/`; headless sitede `src/lib/pano/`), TypeScript dosyalarına ve değişmiş `svelte` sürümüne bakın. Rehber bunların hepsini yasaklar.
- **Eklentiler:** her panel uç noktasında izin denetimi, girdi doğrulama ve eklentinin yalnızca kendi tablolarına yazması. `pluginId` ilk yayından sonra bir daha değişemez.
- **Gizli bilgiler:** kodda ya da commit'te ön yüz anahtarı, lisans anahtarı ya da parola olmamalı.
- **Sürümler ve yayınlar:** ajan sürüm yükseltmemeli, etiket atmamalı, push yapmamalıdır. Yayınlar commit mesajlarınızdan çıkar: [Derleme ve Yayınlama](../../addon/publishing/) ve [Yayınlama ve Premium](../../theme/publishing/).
