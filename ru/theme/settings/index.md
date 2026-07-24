# Настройки темы

Настройки темы — это параметры, которые **владелец сайта** может менять, не прикасаясь к коду: цвета, логотип, текст в подвале, отображение боковой панели. Эта страница объясняет, где хранятся эти настройки, какие из них получает каждая тема бесплатно и как добавить в вашу тему **собственные** настройки от начала до конца.

## Где их видит владелец сайта

Администратор сайта открывает **`<ваш сайт>/theme-settings`** (на неё также есть ссылка в панели через **Просмотр → Настройки темы**). Страница представляет собой форму со **вкладками** — Общие, Логотип, Шапка, Панель навигации и так далее — и каждое поле ввода на ней меняет живую тему.

Важно знать две вещи о её поведении:

- **Сохранение и Сброс работают по вкладкам.** Каждая вкладка сохраняет свои ключи и сбрасывает свои ключи. Именно поэтому ключ настройки всегда принадлежит ровно одной вкладке.
- Значения попадают в объект **`themeSettings`**, который получают ваши представления, — тот самый, что вы уже видели в заголовках представлений.

## Что вы получаете бесплатно

Ядро темы поставляется с полностью готовой страницей настроек со следующими базовыми вкладками и ключами. Вы ничего из этого не создаёте — всё уже есть в каждой теме:

| Вкладка | Ключи |
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

::: tip Чтение базовой настройки ничего не стоит
Ваши представления могут прочитать любую из них сразу — объявление не требуется. Например, именно так `themeSettings.postsEnabled` определяет, отрисовывать ли список постов в представлении домашней страницы по умолчанию.
:::

## Чтение настройки в ваших представлениях

Представления получают текущие настройки как проп `themeSettings` (задокументирован в заголовке каждого представления). Используйте его как любой объект:

```svelte
{#if themeSettings.footerEnabled}
  <Footer />
{/if}
```

Вот и всё, что касается чтения. Добавление **новой** настройки занимает три шага — вот вся цепочка на примере «подзаголовка героя» (hero subtitle).

## Добавление собственных настроек от начала до конца

Давайте построим что-то настоящее: **hero-баннер** на домашней странице, которым владелец сайта управляет полностью — его текст, показывается ли он вообще и его стиль. Три настройки, три разных типа ввода, одна новая вкладка. Когда мы закончим, на странице настроек появится совершенно новая вкладка **«Hero»**, которая выглядит и ведёт себя в точности как встроенные.

Три настройки:

| Ключ | Тип | Что контролирует |
|---|---|---|
| `heroEnabled` | переключатель вкл/выкл | отрисовывается ли баннер вообще |
| `heroSubtitle` | текстовое поле | строку подзаголовка баннера |
| `heroStyle` | выпадающий список | фон `gradient` или `solid` |

### Шаг 1 — возьмите страницу настроек под свой контроль

Страница настроек — это такое же представление, как и любое другое, поэтому вы берёте его под свой контроль тем же способом:

```sh
bunx @panomc/theme-core eject-view ThemeSettingsView
```

Откройте ваш новый `src/views/ThemeSettingsView.svelte` и осмотритесь, прежде чем что-либо менять. Важны две вещи:

- `themeSettings` приходит как **writable store**: каждое поле ввода редактирует `$themeSettings.someKey` напрямую, в реальном времени. Никакой логики сохранения в разметке — этим занимается кнопка Сохранить на странице.
- Вкладки идут парами: **кнопка навигации** сверху (устанавливает `$activeTab`) и **панель вкладки** ниже, содержащая поля ввода.

### Шаг 2 — добавьте кнопку вкладки «Hero»

Найдите навигацию по вкладкам (ряд кнопок `nav-link` наверху — вы увидите `general`, `logo`, `header`, …) и добавьте свою после последней, следуя точно такому же шаблону:

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

Обратите внимание на `$_("theme-settings.hero.title")` — метки являются ключами перевода, а не жёстко закодированным текстом, точно как у встроенных вкладок. Переводы мы добавим на шаге 5.

### Шаг 3 — добавьте панель вкладки с тремя полями ввода

Прокрутите до панелей вкладок (блоки `<div class="tab-pane" id="...">`) и добавьте панель, у которой `id` совпадает с вашим `data-bs-target`. Каждый тип ввода следует шаблону, который уже есть в файле — копируйте соседей:

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

Обратите внимание на шаблон значения по умолчанию у каждого поля ввода: `$themeSettings.heroStyle || "gradient"`. У нового сайта ещё нет сохранённого значения, поэтому поле показывает ваше значение по умолчанию вместо пустого элемента управления. Используйте тот же запасной вариант `||`, когда позже будете *читать* настройку.

::: tip Хотите выбор цвета или загрузку изображения?
И то, и другое уже есть в файле — поле ввода цвета фона (`type="color"` с `form-control-form-color`) и загрузка фонового изображения находятся прямо там, в панели `general`. Скопируйте их разметку тем же способом. Загрузка изображений дополнительно использует store `bind:files` (см. `backgroundImageFiles` в списке пропов в заголовке представления).
:::

### Шаг 4 — объявите ключи в `theme.config.js`

Без объявления ваши поля ввода отрисуются, но **никогда не сохранятся**. Объявите новую вкладку и её ключи в разделе `settingsSchema`:

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

Правила просты:

- Записи **добавляются** — ваши ключи дописываются во вкладку, а совершенно новое имя вкладки создаёт новую вкладку.
- Вы **не можете переместить или удалить базовый ключ**. Сохранение/сброс работают по вкладкам, поэтому ключ, находящийся сразу в двух вкладках, был бы неоднозначным — `bun run check` отклонит его.
- `defaultTab` необязателен; задавайте его, только если ваше представление настроек не показывает базовую вкладку по умолчанию.

### Шаг 5 — добавьте метки в ваши переводы

Ключам `$_()` из шагов 2-3 нужен текст. Добавьте их в `lang-overrides/` (создайте файлы, если их ещё нет — см. [Локализация](/ru/theme/localization/)):

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

Затем выполните `bun run sync`, чтобы слияние подхватило ключи. Без этого вкладка всё равно работает — вы просто увидите сырые имена ключей вроде `theme-settings.hero.title` вместо меток.

### Шаг 6 — прочитайте настройки там, где это важно

В вашем переопределении `HomeView` используйте все три:

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

### Опробуйте весь цикл

1. `bun run check` — проверяет ваш `settingsSchema` (опечатка во вкладке или базовый ключ в неправильной вкладке провалятся здесь, а не в продакшене).
2. Обновите сайт, откройте **`/theme-settings`** как администратор → вкладка **Hero** на месте с вашими тремя полями ввода.
3. Переключите переключатель, введите подзаголовок, выберите «Solid color», нажмите **Сохранить** на вкладке.
4. Откройте домашнюю страницу → баннер отражает каждый выбор. Нажмите **Сброс** на вкладке Hero → возвращаются ваши значения по умолчанию из `||`.

Это полная цепочка: **ввод (представление) → объявление (схема) → метка (переводы) → чтение (ваши представления)**.

::: warning Объявление — это то, о чём забывают
Если ваше новое поле после сохранения будто «не запоминается», причиной почти всегда является отсутствующая запись `settingsSchema`. Поле ввода редактирует живой объект в браузере, но сохраняются только объявленные ключи.
:::

## Что дальше

- **[Изменение дизайна страниц](/ru/theme/views/)** — извлечение представлений, разобранный пример, на котором строится эта страница.
- **[Сборка и упаковка](/ru/theme/packaging/)** — `bun run check` проверяет ваш `settingsSchema` перед выпуском.
