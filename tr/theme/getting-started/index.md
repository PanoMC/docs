# Başlangıç

Bu bölüm, bir Pano teması oluşturmak için bilmeniz gereken her şeyi kapsar. Bir tema, genel sitenin **görünümünü ve hissini** (layout, renkler, tipografi ve markup) kontrol eder; backend, kimlik doğrulama, eklenti çalışma zamanı ve veri yükleme işlemleri ise sizin için halledilir.

## Bir tema artık nedir?

Modern bir Pano teması, npm üzerinde yayınlanan **`@panomc/theme-core`** motorunun üzerine kurulmuş **ince bir paket**tir (güncel sürüm hattı `1.0.0-dev.x`). Motor; kimlik doğrulama akışlarını, eklenti çalışma zamanını, veri yüklemeyi ve derleme hattını bir bağımlılık olarak sunar — siz bunu kullanır ve tıpkı diğer paketler gibi `bun update` ile güncellersiniz.

Tema deponuz genellikle yalnızca birkaç yüz satırdır: tasarım token'ları, isteğe bağlı görünüm (view) geçersiz kılmaları ve meta veriler. Zor olan her şey zaten motorun içinde yaşar.

> **`vanilla-theme`, dahili SİSTEM temasıdır, bir şablon değildir.** Onu **fork'lamayın veya kopyalamayın**. Korumalıdır ve Pano tarafından dahili olarak yönetilir. Bunun yerine yeni bir temaya aşağıdaki iskele oluşturucu (scaffolder) ile başlayın.

## Gereksinimler

Başlamadan önce aşağıdakilere sahip olduğunuzdan emin olun:

- Kurulu **Bun** (Pano frontend'leri npm/pnpm değil, Bun kullanır).
- **Yerelde çalışan bir Pano örneği** — temanızın geliştirme sunucusu API çağrılarını buraya yönlendirir (proxy).
- Temel düzeyde **Svelte 5** ve **SCSS** bilgisi (yalnızca token'ların ötesine geçtiğinizde gereklidir).

## Tema oluşturma

`theme-core` CLI ile yeni bir tema oluşturun:

```sh
bunx theme-core new my-theme
```

Bu komut, **17 dosyalık bir iskele** üretir — manifest, config, stil token'ları, hooks shim'leri ve SvelteKit iskeleti. Ardından kurun ve başlatın:

```sh
cd my-theme
bun install
bun run sync          # motordan rota/lib köprülerini üretir
bun run dev           # çalışan bir Pano backend'ine karşı geliştirme sunucusu
```

> **`bun install` "Resolving…" adımında takılırsa**, iptal edip şununla yeniden deneyin:
> ```sh
> bun install --backend=copyfile
> ```

Geliştirme sunucusu API çağrılarını yerel Pano backend'inize yönlendirir. Hedefi `.env` içinde ayarlayın:

```sh
# .env
VITE_API_URL=http://localhost:8088/api
```

## Sizin sahip olduklarınız ve üretilenler

Hangi dosyaların sizin, hangilerinin yeniden üretildiğini bilmek, sorunsuz güncellemelerin anahtarıdır.

**Sizin — özgürce düzenleyin, deponuza kaydedin:**

| Yol | Amaç |
|---|---|
| `manifest.json` | id, başlık, sürüm, yazar, `panoVersion`, ekran görüntüleri |
| `theme.config.js` | görünüm geçersiz kılmaları + ayar şeması genişletmeleri |
| `src/styles/tokens.scss` | tasarım token'larınız (renkler, köşe yarıçapları, fontlar, gölgeler) |
| `src/styles/style.scss` | önce token'lar, sonra motor SCSS'i, sonra kendi CSS'iniz |
| `src/views/` | görünüm geçersiz kılmalarınız (yalnızca eject ettikleriniz) |
| `lang-overrides/` | yalnızca değiştirdiğiniz i18n anahtarları (derin birleştirilir, eklemeli) |
| `static/` | varlıklarınız (asset) |

**Üretilen — asla elle düzenlemeyin (`bun run sync` bunları yeniden oluşturur):**

| Yol | Amaç |
|---|---|
| `src/routes/` | motordan üretilen rota shim'leri |
| `src/lib/` | üretilen köprüler + SDK host-provides stub'ları |
| `lang/` | temel dil dosyaları (`lang-overrides/` ile geçersiz kılın) |

> Üretilen dosyaları elle düzenlemek, değişikliklerinizin bir sonraki `sync` veya motor güncellemesinde kaybolması demektir. Her değişikliği, sahip olduğunuz dosyalara koyun.

## Katman 1 — Token'lar (bakım gerektirmeyen yeniden stilleme)

En basit tema, token'lardan başka hiçbir şeyi değiştirmez. `src/styles/tokens.scss`, **her motor değişkeninin yorum satırına alınmış bir menüsü** olarak gelir. İstediklerinizin yorumunu kaldırın ve değerlerini değiştirin:

```scss
// src/styles/tokens.scss
$color-primary:    #ff5722;
$color-background: #0f1115;
$radius-base:      12px;
$font-family-base: "Inter", sans-serif;
```

Her motor değişkeni `!default` olarak tanımlanmıştır, bu yüzden sizin değeriniz her zaman kazanır. Yalnızca token içeren bir tema **sonsuza dek bakım gerektirmez** — motor minor ve hatta major sürümleri boyunca hiçbir düzenleme olmadan çalışmaya devam eder. Tek başına bu bile gözle görülür biçimde farklı bir tema üretir.

## Katman 2 — Görünümler (özel markup)

Token'lar yeterli olmadığında ve farklı bir markup gerektiğinde, bir **görünümü (view)** geçersiz kılın. Geçersiz kılınabilen tüm görünümleri ve prop'larını listeleyin:

```sh
bunx theme-core list-views
```

Geçersiz kılınabilen **26 görünüm** vardır. Birini özelleştirmek için eject edin:

```sh
bunx theme-core eject-view LoginView
```

Bu komut, motorun varsayılan görünümünü `src/views/LoginView.svelte` içine kopyalar ve `theme.config.js` içinde kaydeder. Dosyanın başlığı (header) **her prop'u** belgeler — store'lar store nesnesi olarak gelir (`$store` kullanın), eylemler (action) ise fonksiyon olarak gelir.

Sayfa çerçevesi (`Navbar`, `Header`, `Footer`) ve eklentiye bakan bileşenler (`LoginFormBody`, `RegisterForm`, `Pagination`, …) aynı şekilde tek tek geçersiz kılınabilir — bir navbar'ı yeniden stillemek için tüm bir layout'u eject etmeniz gerekmez.

> **Her eklenti bağlama noktasını (mount point) koruyun.** Geçersiz kılınan bir görünüm, varsayılan görünümün bağladığı `<ViewComponent>` slot'larını ve `<Hook>` işaretçilerini **korumak zorundadır**. Birini kaldırırsanız, kurulu eklentiler sessizce kaybolur — ve `bun run check` gönderemeden önce hata verir.

## Ek tema ayarları

Tema ayarları sayfası, bir sekme → ayar anahtarı eşlemesiyle sürülür. Geçersiz kıldığınız bir görünüm ek girdiler (yeni anahtarlar veya tüm bir yeni sekme) oluşturuyorsa, panelin bunları **kaydetmesi ve sıfırlaması** için `theme.config.js` içinde bildirin (aksi halde görünürler ama asla kalıcı olmazlar):

```js
// theme.config.js
export default {
  views: {
    ThemeSettingsView: () => import("./src/views/ThemeSettingsView.svelte"),
  },
  settingsSchema: {
    // Yalnızca eklemeli: anahtarlar bir sekmeye EKLENİR (yoksa yeni bir sekme
    // oluşturulur). Bir temel anahtarı kaldıramaz veya taşıyamazsınız.
    tabs: {
      header: ["heroSubtitle", "heroSubtitleVisibility"],
      "support-page": ["supportPageDiscordLink"],
    },
    // İsteğe bağlı: sayfanın açılacağı sekme. Yalnızca görünümünüz temel
    // varsayılan sekmeyi ("general") oluşturmuyorsa gereklidir.
    defaultTab: "logo",
  },
};
```

Kurallar: bir anahtar tam olarak **bir** sekmede bulunabilir (kaydetme/sıfırlama sekme başınadır) ve `defaultTab` gerçek bir sekme olmalıdır. Yalnızca markup içinde *okuduğunuz* (ayar görünümünde girdisi olmayan) bir anahtar için şema girişi gerekmez.

## Bir temayı gönderme

Derleme ve paketleme, tasarımı gereği yeniden üretilebilir (reproducible):

```sh
bun run build        # yeniden üretilebilir derleme (kit sürümü sabitlenmiş, deterministik)
bun run check        # sözleşmeyi doğrular — herhangi bir ihlalde hata verir
bun run package      # deterministik zip
```

Ardından üretilen `.zip` dosyasını **Panel → Görünüm → Temalar → Tema Yükle** üzerinden kurun.

**Premium temalar:** zip'in **sha256 değeri lisans kimliğidir**. Lisans kapısı, özgürce geliştirebilmeniz için **`vite dev` altında atlanır** ve **production derlemelerinde uygulanır**.

`bun run check`, gönderimden önce sözleşmeyi uygular:

- `svelte`, core'un sürümüne tam olarak sabitlenmiş olmalı (uyumsuzluk eklentileri sessizce düşürür)
- kayıtlı her görünüm mevcut ve bilinen bir sözleşme adı olmalı
- geçersiz kılınan görünümler, varsayılanın bağladığı her slot/hook'u korumalı
- `lang-overrides/*.json` ayrıştırılabilir ve eklemeli olarak birleşmeli
- `settingsSchema` şekilce geçerli, yalnızca eklemeli olmalı ve `defaultTab` değeri gerçek olmalı
- `manifest.json` gerekli anahtarları taşımalı ve `id` değeri `vanilla-theme` olmamalı

## Motoru güncelleme

Yükseltme üç komutluk bir döngüdür:

```sh
bun update @panomc/theme-core && bunx theme-core sync && bun run build
```

- **Yalnızca token içeren temalar** başka bir şeye ihtiyaç duymaz — **major sürümlerde bile** tüm göç bundan ibarettir.
- **Görünüm geçersiz kılmaları** minor sürümlerden etkilenmez (prop'lar yalnızca eklenir, asla değiştirilmez veya kaldırılmaz). Bir **major** sürümde, yalnızca geçersiz kıldığınız görünümler dikkat gerektirebilir — `bun run check` her sözleşme ihlalini listeler ve motorun değişiklik günlüğü görünüm başına prop değişikliklerini belgeler.

Bütün model bundan ibarettir: bakım gerektirmeyen bir tema için token'larda kalın, yalnızca özel markup gerektiren yerlerde görünümlere inin ve gerisini motorun taşımasına izin verin.
