# Tema Ayarları

Tema ayarları, bir **site sahibinin** hiçbir koda dokunmadan değiştirebileceği seçeneklerdir — renkler, logo, alt bilgide ne yazacağı, kenar çubuğunun görünüp görünmeyeceği. Bu sayfa, bu ayarların nerede durduğunu, her temanın hangi ayarları hazır olarak aldığını ve temanıza baştan sona **kendi** ayarlarınızı nasıl ekleyeceğinizi anlatır.

## Site sahibi bunları nerede görür

Bir site yöneticisi **`<siteniz>/theme-settings`** adresini açar (buraya panelde **Görüntüle → Tema Ayarları** üzerinden de bağlantı verilir). Sayfa, **sekmeler** içeren bir formdur — Genel, Logo, Üst Bilgi, Gezinme Çubuğu vb. — ve üzerindeki her giriş alanı canlı temayı değiştirir.

Nasıl davrandığına dair bilinmesi gereken iki önemli nokta var:

- **Kaydet ve Sıfırla sekme bazında çalışır.** Her sekme kendi anahtarlarını kaydeder ve kendi anahtarlarını sıfırlar. Bir ayar anahtarının her zaman yalnızca tek bir sekmeye ait olmasının nedeni budur.
- Değerler, görünümlerinizin aldığı **`themeSettings`** nesnesine düşer — bu, görünüm başlıklarında zaten gördüğünüz nesnenin aynısıdır.

## Hazır olarak neler gelir

Tema çekirdeği, aşağıdaki temel sekmeler ve anahtarlarla eksiksiz bir ayarlar sayfasıyla gelir. Bunların hiçbirini siz oluşturmazsınız — hepsi her temada zaten mevcuttur:

| Sekme | Anahtarlar |
|---|---|
| `general` | `themeColor`, `backgroundColor`, `bgImagePosition`, `bgImageRepeat`, `bgImageSize`, `backgroundImage` |
| `logo` | `logoVisibility`, `logoPosition`, `logoHeight`, `logoWidth`, `logoAnimation` |
| `header` | `defaultHeaderBg`, `headerBgColor`, `headerHeight`, `headerWidthOption`, `headerNavBarGap`, `headerBgImagePosition`, `headerBgImageRepeat`, `headerBgImageSize`, `headerBackgroundImage` |
| `navbar` | `navbarWidthOption`, `navbarBgColor`, `navRoundLevel`, `navLinksEnabled`, `navLinksEnableStatus`, `navLinksOrder` |
| `sidebar` | `sidebarEnabled`, `sidebarPosition`, `sidebarCarts` |
| `play-card` | `playCardStyle`, `defaultPlayCardBg`, `playCardBgOpacity`, `playCardBgEffect`, `playCardBackgroundImage`, `playCardIpText`, `playCardStatusBadge`, `playCardPlayerCount`, `playCardVersionInfo`, `playCardIpColor`, `playCardBorderColor` |
| `post-card` | `postsEnabled`, `postCoverImageEnabled`, `postReadMoreButtonEnabled`, `postAuthorImageEnabled`, `postViewCountEnabled`, `postPreviousPageEnabled`, `postNextPageEnabled` |
| `footer` | `footerEnabled`, `footerLogoEnabled`, `footerTitleEnabled`, `footerTitle`, `footerContentEnabled`, `footerContent`, `footerLinksEnabled`, `footerPluginLinksEnabled`, `footerLinksEnableStatus`, `footerLinksOrder` |
| `advanced` | `customCss` |

::: tip Temel bir ayarı okumak hiçbir şeye mal olmaz
Görünümleriniz bunların herhangi birini hemen okuyabilir — herhangi bir bildirim gerekmez. Örneğin, `themeSettings.postsEnabled`, varsayılan ana sayfa görünümünün gönderi listesini oluşturup oluşturmayacağına bu şekilde karar verir.
:::

## Bir ayarı görünümlerinizde okuma

Görünümler, mevcut ayarları `themeSettings` prop'u olarak alır (her görünümün başlığında belgelenmiştir). Onu herhangi bir nesne gibi kullanın:

```svelte
{#if themeSettings.footerEnabled}
  <Footer />
{/if}
```

Okuma işleminin tamamı bu kadar. **Yeni** bir ayar eklemek üç adım alır — işte örnek olarak bir "hero alt başlığı" kullanarak zincirin tamamı.

## Kendi ayarlarınızı baştan sona ekleme

Gerçek bir şey inşa edelim: ana sayfada, site sahibinin tamamen kontrol ettiği bir **hero afişi** — metni, hiç görünüp görünmeyeceği ve stili. Üç ayar, üç farklı giriş türü, bir yeni sekme. İşimiz bittiğinde, ayarlar sayfasında yerleşik sekmelerin tam olarak göründüğü ve davrandığı gibi görünen, yepyeni bir **"Hero"** sekmesi olacak.

Üç ayar:

| Anahtar | Tür | Neyi kontrol eder |
|---|---|---|
| `heroEnabled` | aç/kapa anahtarı | afişin hiç oluşturulup oluşturulmayacağı |
| `heroSubtitle` | metin alanı | afişin alt başlık satırı |
| `heroStyle` | açılır liste | `gradient` veya `solid` arka plan |

### Adım 1 — ayarlar sayfasının sahipliğini alın

Ayarlar sayfası diğerleri gibi bir görünümdür, dolayısıyla sahipliğini de aynı şekilde alırsınız:

```sh
bunx @panomc/theme-core eject-view ThemeSettingsView
```

Yeni `src/views/ThemeSettingsView.svelte` dosyanızı açın ve herhangi bir şeyi değiştirmeden önce etrafına bakın. İki şey önemli:

- `themeSettings`, bir **writable store** olarak gelir: her giriş alanı doğrudan, canlı olarak `$themeSettings.someKey` üzerinde düzenleme yapar. İşaretlemede kaydetme mantığı yoktur — bunu sayfanın Kaydet düğmesi halleder.
- Sekmeler çiftler halinde gelir: üstte bir **gezinme düğmesi** (`$activeTab`'ı ayarlar) ve altında giriş alanlarını barındıran bir **sekme bölmesi**.

### Adım 2 — bir "Hero" sekme düğmesi ekleyin

Sekme gezinmesini bulun (üstteki `nav-link` düğmelerinin sırası — `general`, `logo`, `header`, … göreceksiniz) ve sonuncusunun ardına, birebir aynı deseni izleyerek kendinizinkini ekleyin:

```svelte
<button
  class="nav-link"
  class:active={$activeTab === "hero"}
  data-bs-toggle="tab"
  data-bs-target="#hero"
  on:click={() => ($activeTab = "hero")}>
  {$_("theme-settings.hero.title")}
</button>
```

`$_("theme-settings.hero.title")` ifadesine dikkat edin — etiketler, tıpkı yerleşik sekmelerde olduğu gibi, sabit kodlanmış metin değil, çeviri anahtarlarıdır. Çevirileri Adım 5'te ekleyeceğiz.

### Adım 3 — üç giriş alanıyla sekme bölmesini ekleyin

Sekme bölmelerine (`<div class="tab-pane" id="...">` blokları) inin ve `id`'si `data-bs-target`'ınızla eşleşen bir bölme ekleyin. Her giriş türü, dosyada zaten var olan bir deseni izler — komşuları kopyalayın:

```svelte
<div class="tab-pane" class:active={$activeTab === "hero"} id="hero" role="tabpanel">

  <!-- on/off switch -->
  <div class="row mb-3">
    <label class="col-md-6 col-form-label" for="hero-enabled">
      {$_("theme-settings.hero.enabled")}
    </label>
    <div class="col-md-6 d-flex align-items-center">
      <div class="form-check form-switch">
        <input
          id="hero-enabled"
          class="form-check-input"
          type="checkbox"
          checked={$themeSettings.heroEnabled}
          on:change={(e) => ($themeSettings.heroEnabled = e.target.checked)} />
      </div>
    </div>
  </div>

  <!-- text field -->
  <div class="row mb-3">
    <label class="col-md-6 col-form-label" for="hero-subtitle">
      {$_("theme-settings.hero.subtitle")}
    </label>
    <div class="col-md-6">
      <input
        id="hero-subtitle"
        class="form-control"
        type="text"
        value={$themeSettings.heroSubtitle || ""}
        on:input={(e) => ($themeSettings.heroSubtitle = e.target.value)} />
    </div>
  </div>

  <!-- dropdown -->
  <div class="row mb-3">
    <label class="col-md-6 col-form-label" for="hero-style">
      {$_("theme-settings.hero.style")}
    </label>
    <div class="col-md-6">
      <select
        id="hero-style"
        class="form-select"
        value={$themeSettings.heroStyle || "gradient"}
        on:change={(e) => ($themeSettings.heroStyle = e.target.value)}>
        <option value="gradient">{$_("theme-settings.hero.styles.gradient")}</option>
        <option value="solid">{$_("theme-settings.hero.styles.solid")}</option>
      </select>
    </div>
  </div>

</div>
```

Her giriş alanındaki varsayılan atama desenine dikkat edin: `$themeSettings.heroStyle || "gradient"`. Yeni bir sitede henüz kaydedilmiş bir değer yoktur, dolayısıyla giriş alanı boş bir denetim yerine varsayılanınızı gösterir. Ayarı daha sonra *okurken* de aynı `||` yedeğini kullanın.

::: tip Bir renk seçici veya görsel yükleme mi istiyorsunuz?
Her ikisi de dosyada zaten var — arka plan rengi girişi (`form-control-form-color` ile `type="color"`) ve arka plan görseli yüklemesi tam orada, `general` bölmesinde. İşaretlemelerini aynı şekilde kopyalayın. Görsel yüklemeleri ayrıca bir `bind:files` store kullanır (görünüm başlığının prop listesindeki `backgroundImageFiles`'a bakın).
:::

### Adım 4 — anahtarları `theme.config.js` içinde bildirin

Bir bildirim olmadan giriş alanlarınız görüntülenir ama **asla kaydedilmez**. Yeni sekmeyi ve anahtarlarını `settingsSchema` altında bildirin:

```js
// theme.config.js
export default {
  views: {
    ThemeSettingsView: () => import("./src/views/ThemeSettingsView.svelte"),
    HomeView: () => import("./src/views/HomeView.svelte"),
  },
  settingsSchema: {
    tabs: {
      // "hero" doesn't exist as a base tab → a NEW tab is created with these keys
      hero: ["heroEnabled", "heroSubtitle", "heroStyle"],
      // adding to an EXISTING base tab works too, e.g.:
      // header: ["headerTagline"],
    },
  },
};
```

Kurallar basittir:

- Girdiler **eklemelidir** — anahtarlarınız bir sekmeye eklenir ve tamamen yeni bir sekme adı yeni bir sekme oluşturur.
- Bir **temel anahtarı taşıyamaz veya kaldıramazsınız**. Kaydet/sıfırla sekme bazında çalıştığından, iki farklı sekmede bulunan bir anahtar belirsiz olur — `bun run check` bunu reddeder.
- `defaultTab` isteğe bağlıdır; yalnızca ayarlar görünümünüz temel varsayılan sekmeyi göstermiyorsa ayarlayın.

### Adım 5 — etiketleri çevirilerinize ekleyin

Adım 2-3'teki `$_()` anahtarlarının metne ihtiyacı var. Bunları `lang-overrides/` içine ekleyin (henüz yoksa dosyaları oluşturun — bkz. [Çeviriler](/tr/theme/localization/)):

```json
// lang-overrides/en-US.json
{
  "theme-settings": {
    "hero": {
      "title": "Hero",
      "enabled": "Show hero banner",
      "subtitle": "Hero subtitle",
      "style": "Banner style",
      "styles": { "gradient": "Gradient", "solid": "Solid color" }
    }
  }
}
```

Ardından, birleştirmenin anahtarları alması için `bun run sync` komutunu çalıştırın. Bu olmadan sekme yine çalışır — yalnızca etiketler yerine `theme-settings.hero.title` gibi ham anahtar adlarını görürsünüz.

### Adım 6 — ayarları önemli oldukları yerde okuyun

`HomeView` geçersiz kılmanızda, üçünü de kullanın:

```svelte
{#if themeSettings.heroEnabled}
  <section class="ember-hero" class:hero-solid={themeSettings.heroStyle === "solid"}>
    <h1>{$_("my-theme.hero-title")}</h1>
    {#if themeSettings.heroSubtitle}
      <p>{themeSettings.heroSubtitle}</p>
    {/if}
  </section>
{/if}
```

### Tüm döngüyü deneyin

1. `bun run check` — `settingsSchema` yapınızı doğrular (yanlış yazılmış bir sekme veya yanlış sekmedeki bir temel anahtar, üretimde değil, burada başarısız olur).
2. Siteyi yenileyin, yönetici olarak **`/theme-settings`** sayfasını açın → üç giriş alanınızla **Hero** sekmesi orada.
3. Anahtarı açıp kapatın, bir alt başlık yazın, "Solid color" seçin, sekmede **Kaydet**'e basın.
4. Ana sayfayı açın → afiş her seçimi yansıtır. Hero sekmesinde **Sıfırla**'ya basın → `||` varsayılanlarınız geri gelir.

Zincirin tamamı budur: **giriş (görünüm) → bildirim (şema) → etiket (çeviriler) → okuma (görünümleriniz)**.

::: warning İnsanların unuttuğu kısım bildirimdir
Yeni alanınız kaydettikten sonra "yerinde kalmıyor" gibi görünüyorsa, neredeyse her zaman nedeni eksik `settingsSchema` girdisidir. Giriş alanı tarayıcıdaki canlı nesneyi düzenler, ancak yalnızca bildirilen anahtarlar kalıcı olur.
:::

## Sıradaki adım

- **[Sayfa Tasarımlarını Değiştirme](/tr/theme/views/)** — görünümleri devralma, bu sayfanın üzerine kurulduğu işlenmiş örnek.
- **[Derleme ve Paketleme](/tr/theme/packaging/)** — `bun run check`, göndermeden önce `settingsSchema` yapınızı doğrular.
