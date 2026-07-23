# Arayüz API Referansı

Eklentinizin arayüzünün kullanabileceği her kanca (hook) adı, görünüm yuvası (view slot), yaşam döngüsü olayı, gezinme yardımcısı ve `@panomc/sdk` dışa aktarımı — tek bir sayfada.

Bu bir **başvuru sayfasıdır**, bir eğitim değil. Bu API'lerin gerçek bir eklentide kullanıldığını görmek istiyorsanız, Shoutbox arayüzünü adım adım oluşturan [Arayüz Geliştirme](/tr/addon/frontend/) ile başlayın. Buradaki her şey, o sayfanın yararlandığı yüzeydir.

::: tip Bunlar nereden gelir
Eklentinizin arayüzü Svelte'i veya SDK'yı asla paketlemez — onları, host'un paylaşılan bir çalışma zamanına çözümlediği çıplak belirteçler (bare specifier) olarak içe aktarır (bkz. [Mimari](/tr/addon/architecture/)). Aşağıdaki `pano.*` ağacı, eklentinize `this.pano` olarak enjekte edilir; `@panomc/sdk` modülleri ise bu sayfanın sonundaki dondurulmuş içe aktarma listesidir.
:::

## `pano` nesnesi

Her şeye, host'un eklentinize `this.pano` olarak enjekte ettiği `pano` nesnesi aracılığıyla ulaşılır. En üstte iki bayrak yaşar; geri kalan her şey `pano.ui.*`'dan sarkar.

| Özellik | Tür | Ne olduğu |
|---|---|---|
| `pano.isPanel` | boolean | Kodunuz yönetim panelinin içinde çalışırken `true`, temanın içinde `false`. `onLoad()`'da buna göre dallanın. |
| `pano.debug` | boolean | `pano` nesnesindeki ayrılmış bir bayrak. Şu anda sabit olarak `false`'tur ve hiçbir host onu ayarlamaz, bu yüzden bir geliştirme derlemesini algılamak için ona **güvenmeyin**. |

Panel ve tema **farklı** `pano.ui` ağaçları açığa çıkarır — birinde var olan bir yardımcı diğerinde olmayabilir. Yalnızca-panel ve yalnızca-tema üyeleri bu sayfa boyunca öyle işaretlenmiştir.

## 1. Plugin giriş sözleşmesi

`src/main.js`'iniz, `PanoPlugin`'i (`@panomc/sdk`'den) genişleten bir sınıfı varsayılan olarak dışa aktarır. Host onu oluşturur, `this.pano`'yu enjekte eder ve yaşam döngüsü metotlarını çağırır.

| Üye | Tür | Amaç |
|---|---|---|
| `onLoad()` | metot (override) | Plugin yüklendikten sonra bir kez çağrılır. Tüm kayıtlarınızı burada yapın. `this.pano` mevcuttur. |
| `onUnload()` | metot (override) | Plugin sökülürken çağrılır. Kalmaması gereken her şeyi geri alın (örn. `pano.ui.page.unregister(...)`). |
| `this.pano` | özellik | Bu sayfada belgelenen enjekte edilmiş API nesnesi. |
| `this.context` | özellik | Plugin kapsamlı bağlam nesnesi. |
| `this.setContext(partial)` | metot | `this.context`'e değerleri sığ birleştirir (shallow-merge) ve abonelere bildirir. |
| `this._unsubscribers` | dizi | Store abonelik-iptal fonksiyonlarını buraya ekleyin; plugin yok edildiğinde host hepsini çalıştırır. |

Taban sınıfla birlikte `@panomc/sdk`'den iki fonksiyon gelir:

| Dışa aktarım | Amaç |
|---|---|
| `viewComponent(importer)` | Herhangi bir kayıt API'sine verdiğiniz her bileşen için **zorunlu** sarmalayıcı. Doğru paylaşılan-çalışma-zamanı `mount`/`hydrate`/`unmount`'unu iliştirir, bu yüzden çıplak importer'ı değil, `viewComponent(() => import('./X.svelte'))` geçin. |
| `getPanoContext()` | Mevcut Pano host bağlamını döndürür. Nadiren doğrudan gerekir. |

::: warning `onContextUpdate` çağrılmaz
Eski boilerplate, plugin sınıfında bir `onContextUpdate()` metodu gönderir. **Hiçbir host onu asla çağırmaz.** O ölü koddur — üzerine davranış inşa etmeyin. Kurulum için `onLoad()`'u ve değişikliklere tepki vermek için store aboneliklerini kullanın.
:::

## 2. Sayfalar — `pano.ui.page`

Tam sayfaları temanın (`/…`) ya da panelin (`/panel/…`) altında kaydedin.

| Çağrı | Amaç |
|---|---|
| `pano.ui.page.register(options)` | Bir yolda (path) bir sayfa kaydeder. |
| `pano.ui.page.unregister(path)` | Kaydettiğiniz bir sayfayı kaldırır (temizlik için kullanılır — bkz. [Arayüz Geliştirme](/tr/addon/frontend/)). |
| `pano.ui.page.isPluginPage(path)` | Bir plugin o yolu kaydetmişse `true`. |

**`register(options)`:**

| Seçenek | Tür | Anlamı |
|---|---|---|
| `path` | string | Rota (aşağıdaki yol biçimlerine bakın). |
| `component` | `viewComponent(...)` | Sayfa bileşeni. |
| `systemLayout` | string | Sayfayı host düzenlerinden birine sarar (adlar aşağıda). |
| `layout` | `viewComponent(...)` | Bunun yerine kendi düzen bileşeninizi kullanın. |
| `resetLayout` | boolean | Hiç host kabuğu (chrome) olmadan render eder. |
| `permission` | string | Görüntülemek için gereken izin düğümü; mevcut kullanıcı ona sahip değilse sayfa **404** render eder. |

**Yol biçimleri:**

| Biçim | Örnek | Eşleştirdiği |
|---|---|---|
| birebir (literal) | `/shoutbox` | tam olarak o yol |
| dinamik segment | `/shout/[id]` veya `/shout/:id` | bir segment, bir parametre olarak yakalanır |
| tümünü-yakala (catch-all) | `/docs/[...rest]` | kalan segmentler (son segment olmalı) |
| regex | `re:/shout/\d+` | tam çapalanmış desen (`^…$`) |

Bir sayfa modülü ayrıca **`load(event)` dışa aktarabilir**; döndürdüğü şey sayfanın prop'ları olur. `pageTitle`, `breadcrumbs`, `sidebar` ve `sidebarProps` anahtarları döndürülen nesneden çıkarılır (hoist) ve host kabuğu tarafından kullanılır.

**`systemLayout` adları — tema:** `AppLayout`, `AuthLayout`, `MainLayout`, `ProfileLayout`, `ThemeSettingsLayout`, `TicketsLayout`.

**`systemLayout` adları — panel:** `AddonDetailLayout`, `AddonsLayout`, `AppLayout`, `MainLayout`, `MigrationLayout`, `PermissionsLayout`, `PlayerDetailLayout`, `PlayersLayout`, `PostsLayout`, `ServerLayout`, `ServerSettingsLayout`, `SettingsLayout`, `TicketsLayout`, `TranslationsLayout`, `ViewLayout`.

## 3. Kancalar — `pano.ui.hook`

Kancalar (hook), host'un sabit bir noktada render ettiği tekil adlandırılmış enjeksiyon noktalarıdır. Görünüm yuvalarının (aşağıda) aksine, bir kanca tek bir ad altında düz bir bileşen listesidir.

| Çağrı | Nerede | Amaç |
|---|---|---|
| `pano.ui.hook.register(options)` | tema + panel | Adlandırılmış bir kancaya bir bileşen yerleştirir. |
| `pano.ui.hook.get(name)` | tema + panel | `name` için kaydedilmiş bileşenlerin store'u. |
| `pano.ui.hook.setVisible(name, component, visible)` | yalnızca tema | Bir kanca girdisinin görünürlüğünü açıp kapatır. |

**`register(options)`:**

| Seçenek | Tür | Anlamı |
|---|---|---|
| `name` | string | Kanca adı (aşağıdaki tablolar). |
| `component` | `viewComponent(...)` | Yerleştirilecek bileşen. |
| `permission` | string | Yalnızca bu izin düğümüne sahip kullanıcılar için render et. |
| `skipLoad` | boolean | Sayfa yüklemesi sırasında bileşenin `load()`'unu çalıştırma. |
| `invisible` | boolean | Kaydet ama gizli başla. |

**`load()` / `hookProps` sözleşmesi:** bir kanca bileşeninin modülü `load(event)` dışa aktarabilir. Host onu sayfa yüklemesi sırasında (SSR için sunucuda, gezinirken istemcide) çalıştırır ve sonucu bileşene prop olarak geçer. Bir bileşen, `{ hookOptions: { invisible: true } }` döndürerek kendini gizleyebilir.

### Tema kanca adları

| Kanca adı | Ek prop |
|---|---|
| `theme:top` | — |
| `page:top` | — |
| `page:home:top` | — |
| `theme:post-detail:bottom` | `post` |
| `theme:support:content` | — |

### Panel kanca adları

| Kanca adı | Ek prop |
|---|---|
| `panel:plugin-detail:content` | `addon` |
| `panel:plugin-detail:content:<pluginId>` | `addon` |
| `panel:player-detail:bottom` | `playerData` |
| `panel:player-detail:sidebar` | `playerData` |
| `panel:post-editor:actions:right` | `post` |
| `panel:post-editor:sidebar:before` | `post` |
| `panel:post-editor:sidebar:after` | `post` |
| `panel:post-editor:content:bottom` | `post` |
| `panel:posts:layout:actions:right` | — |
| `panel:posts:table:header:start` | `tag="th"` |
| `panel:posts:table:header:after-title` | `tag="th"` |
| `panel:posts:table:header:after-category` | `tag="th"` |
| `panel:posts:table:header:after-views` | `tag="th"` |
| `panel:posts:table:header:after-author` | `tag="th"` |
| `panel:posts:table:header:end` | `tag="th"` |
| `panel:posts:table:row:start` | `post`, `tag="td"` |
| `panel:posts:table:row:after-thumbnail` | `post`, `tag="td"` |
| `panel:posts:table:row:after-title` | `post`, `tag="td"` |
| `panel:posts:table:row:after-category` | `post`, `tag="td"` |
| `panel:posts:table:row:after-views` | `post`, `tag="td"` |
| `panel:posts:table:row:after-author` | `post`, `tag="td"` |
| `panel:posts:table:row:end` | `post`, `tag="td"` |
| `panel:players:table:header:start` | `tag="th"` |
| `panel:players:table:header:after-name` | `tag="th"` |
| `panel:players:table:header:after-perm-group` | `tag="th"` |
| `panel:players:table:header:after-status` | `tag="th"` |
| `panel:players:table:header:after-last-login` | `tag="th"` |
| `panel:players:table:header:end` | `tag="th"` |
| `panel:players:table:row:start` | `player`, `tag="td"` |
| `panel:players:table:row:after-name` | `player`, `tag="td"` |
| `panel:players:table:row:after-perm-group` | `player`, `tag="td"` |
| `panel:players:table:row:after-status` | `player`, `tag="td"` |
| `panel:players:table:row:after-last-login` | `player`, `tag="td"` |
| `panel:players:table:row:end` | `player`, `tag="td"` |
| `panel:post-categories:table:header:start` | `tag="th"` |
| `panel:post-categories:table:header:after-category` | `tag="th"` |
| `panel:post-categories:table:header:after-description` | `tag="th"` |
| `panel:post-categories:table:header:after-url` | `tag="th"` |
| `panel:post-categories:table:header:end` | `tag="th"` |
| `panel:post-categories:table:row:start` | `category`, `tag="td"` |
| `panel:post-categories:table:row:after-category` | `category`, `tag="td"` |
| `panel:post-categories:table:row:after-description` | `category`, `tag="td"` |
| `panel:post-categories:table:row:after-url` | `category`, `tag="td"` |
| `panel:post-categories:table:row:end` | `category`, `tag="td"` |

::: tip `:<pluginId>` sonekli kancalar
`panel:plugin-detail:content:<pluginId>`, yalnızca **sizin** eklentinizin detay sayfasında render edilir — kendi `pluginId`'nizi yerine koyun. Bu, bir eklentinin ayarlar panelini koymak için standart yerdir.
:::

## 4. Görünüm yuvaları — `pano.ui.view` (yalnızca tema)

Bir görünüm yuvası (view slot), **öncelik sırasına dizilmiş** bir plugin bileşenleri listesini render eden adlandırılmış bir kaptır (ek giriş yöntemleri, ek profil satırları vb.). Kancaların aksine, yuva öğeleri bir `id` ve bir `priority` taşır.

::: warning `pano.ui.view` / `pano.ui.sidebar` yalnızca temada bulunur
Bu registry'nin tamamı **yalnızca-tema** bir API'dir — panel, `view.register/hide/show/move/get/onLoad/load`'u veya `pano.ui.sidebar`'ı hiç açığa çıkarmaz. Panelin tek `pano.ui.view` üyesi `themes.editMenu`'dür (bkz. §8) ve onun tek oyuncu-düzenleme-modalı yuvasının, aşağıda belgelenen özel bir API'si vardır.
:::

| Çağrı | Amaç |
|---|---|
| `pano.ui.view.register({ viewId, id, component, priority })` | `viewId` yuvasına bir bileşen ekler. `priority` varsayılan olarak `10`'dur; aynı `id`'yi yeniden kaydetmek onu değiştirir. |
| `pano.ui.view.hide(viewId, id)` | Bir öğeyi kaldırmadan gizler. |
| `pano.ui.view.show(viewId, id)` | Gizlemeyi kaldırır. |
| `pano.ui.view.move(viewId, id, priority)` | Bir öğenin önceliğini değiştirir. |
| `pano.ui.view.get(viewId)` | Görünür, sıralı öğelerin store'u. |
| `pano.ui.view.onLoad(viewId, handler)` | `theme:view:<viewId>:load`'a abone olur. |
| `pano.ui.view.load(viewId, event)` | Yuvanın yükleme hattını çalıştırır ve çözümlenmiş öğeleri alır (bir yuvaya ev sahipliği yapan plugin sayfaları için). |

`pano.ui.sidebar.*`, aynı registry'nin aynı metotlarla bir **takma adıdır (alias)**, tek fark kap anahtarının `viewId` yerine `sidebarId` olmasıdır (ve `onLoad`, `theme:sidebar:<id>:load`'u tetikler).

**Yuva öğesi şekli:** `{ id, component, priority, props? }`. Daha yüksek `priority` önce render edilir. Öğe başına `permission` **yoktur** — yuva öğeleri izin filtresine tabi değildir, bu yüzden görünürlüğü bileşenin kendi içinde kapılayın. (Kancalar ve gezinme bağlantıları `permission`'ı *destekler*.)

### Tema yuva kimlikleri (slot ID'leri)

| Yuva kimliği | Nerede render edilir |
|---|---|
| `login-content` | giriş sayfası gövdesi |
| `login-alt-methods` | alternatif giriş yöntemleri |
| `register-content` | kayıt sayfası gövdesi |
| `register-alt-methods` | alternatif kayıt yöntemleri |
| `profile-content` | profil sayfası gövdesi |
| `profile-card-rows` | profil kartındaki satırlar |
| `settings-content` | ayarlar sayfası gövdesi |
| `settings-card-rows` | ayarlar kartındaki satırlar |
| `tickets-content` | destek biletleri sayfası gövdesi |
| `navbar-right` | gezinme çubuğunun sağ tarafı |
| `navbar-profile-dropdown` | profil açılır menüsü |
| `support-content` | destek sayfası gövdesi |
| `support-options` | destek sayfası seçenekler listesi |
| `reset-password-content` | parola-sıfırlama sayfası gövdesi |
| `renew-password-content` | parola-yenileme sayfası gövdesi |
| `activate-content` | hesap-etkinleştirme sayfası gövdesi |
| `activate-new-email-content` | yeni-e-posta-etkinleştirme sayfası gövdesi |

### Panel: oyuncu düzenleme-modalı satırları

Panelin `pano.ui.view` yuva registry'si **yoktur**. Bu türden tek uzatma noktası — oyuncu düzenleme modalındaki ek satırlar — bunun yerine kendi özel API'sine sahiptir:

| Çağrı | Amaç |
|---|---|
| `pano.ui.player.editModal.cardRows.edit(callback)` | Oyuncu düzenleme modalında gösterilen kart satırları listesini düzenler. Diziyi döndürün. |
| `pano.ui.player.editModal.cardRows.get()` | Mevcut kart satırlarını okur. |

Avatar ve sosyal-giriş tarzı eklentiler, o modala bir satır eklemek için bunu kullanır.

### Öncelik gelenekleri

Öğelerinizin filoya göre mantıklı bir sıraya düşmesi için bunlara uyun:

| Yuva türü | Gelenek |
|---|---|
| oyuncu-düzenleme-modalı satırları | `100` |
| ayarlar kartı satırları | `105` |
| profil kartı satırları | `90` |
| alternatif kimlik doğrulama yöntemleri | `50` |
| destek enjeksiyonu | `-100` |
| diğer her şey | `10` (varsayılan) |

## 5. Gezinme — `pano.ui.nav`

Tema ve panel farklı gezinme yardımcıları açığa çıkarır.

**Tema:**

| Çağrı | Amaç |
|---|---|
| `pano.ui.nav.site.editNavLinks(callback)` | Senkron. Mevcut bağlantılar dizisini alır; onu değiştirin ya da yenisini döndürün. Sonuç host tarafından yeniden sıralanır. |
| `pano.ui.nav.site.getNavLinks()` | Mevcut site gezinme bağlantılarının store'u. |
| `pano.ui.nav.profileDropdown.edit(callback)` / `.get()` | Profil-açılır-menü öğelerini düzenle / oku (bir `navbar-profile-dropdown` yuvası). |
| `pano.ui.nav.rightComponents.edit(callback)` / `.get()` | Gezinme-çubuğu-sağ bileşenlerini düzenle / oku (bir `navbar-right` yuvası). |
| `pano.ui.nav.onLoad(handler)` | `theme:navbar:load`'a abone olur. |

**Tema gezinme-bağlantısı şekli:** `{ href, text, icon?, target?, startsWith, loginRequired?, permission?, priority? }`.

**Panel:**

| Çağrı | Amaç |
|---|---|
| `pano.ui.nav.site.editNavLinks(async handler)` | **Async, diziyi döndürmelidir.** Panelin ana kenar çubuğu bağlantılarını düzenler. |
| `pano.ui.nav.server.editNavLinks(async handler)` | Async, diziyi döndürmelidir. Sunucu-bölümü kenar çubuğu bağlantılarını düzenler. |

::: warning Panel gezinme geri çağrıları diziyi döndürmelidir
Temanın `editNavLinks`'i yerinde bir değişikliği kabul eder, ancak panelin `editNavLinks`'i (ve `server.editNavLinks`'i) **async**'tir ve listeyi ne döndürürseniz ona ayarlar — `return`'ü unutursanız menüyü silersiniz.
:::

## 6. Yaşam döngüsü olayları

Bir sayfanın verisi hazırlanırken host'un tetiklediği yükleme-zamanı olayları. Her işleyicinin imzası `async (data, event)`'tir. Aşağıdaki şeker (sugar) yardımcılarıyla ya da genel ilkelle (primitive) kaydedin:

| Çağrı | Amaç |
|---|---|
| `pano.ui.lifecycle.on(name, handler)` | Herhangi bir yaşam döngüsü olayına adıyla abone olur (tema + panel). |
| `pano.ui.lifecycle.execute(name, data, event)` | **Yalnızca tema.** Bir yaşam döngüsünü çalıştırır (bir host akışına katılmak isteyen plugin sayfaları için). Panelin `pano.ui.lifecycle`'ı yalnızca `on`'u açığa çıkarır. |

### Tema yaşam döngüsü olayları

| Olay | Şeker yardımcı | Veri notları |
|---|---|---|
| `theme:app:load` | `pano.ui.app.onLoad(h)` | — |
| `theme:navbar:load` | `pano.ui.nav.onLoad(h)` | — |
| `theme:profile:load` | `pano.ui.profile.onLoad(h)` | — |
| `theme:settings:load` | `pano.ui.settings.onLoad(h)` | — |
| `theme:tickets:load` | `pano.ui.tickets.onLoad(h)` | — |
| `theme:login:load` | `pano.ui.auth.login.onLoad(h)` | `data = { error, event }` — `error` geri okunur (değiştirilebilir) |
| `theme:register:load` | `pano.ui.auth.register.onLoad(h)` | `data = { error, username, event }` — `error` ve `username` geri okunur (değiştirilebilir) |
| `theme:reset-password:load` | `pano.ui.auth.resetPassword.onLoad(h)` | — |
| `theme:activate:load` | `pano.ui.auth.activate.onLoad(h)` | `data = { token }` |
| `theme:activate-new-email:load` | `pano.ui.auth.activateNewEmail.onLoad(h)` | `data = { token }` |
| `theme:renew-password:load` | `pano.ui.auth.renewPassword.onLoad(h)` | `data = { token }` |
| `theme:post-detail:load` | `pano.ui.post.onLoad(h)` | — |
| `theme:support:load` | `pano.ui.support.onLoad(h)` | — |
| `theme:view:<viewId>:load` | `pano.ui.view.onLoad(viewId, h)` | yuva başına tetiklenir |
| `theme:sidebar:<id>:load` | `pano.ui.sidebar.onLoad(id, h)` | kenar çubuğu başına tetiklenir |

### Panel yaşam döngüsü olayları

| Olay | Şeker yardımcı | Veri notları |
|---|---|---|
| `panel:posts:load` | `pano.ui.posts.onLoad(h)` | — |
| `panel:addon-detail:load` | `pano.ui.addon.onLoad(h)` | `data = { addon }` |
| `panel:player-detail:edit-modal:load` | `pano.ui.player.onEditLoad(h)` | `data = { player }` |

## 7. Kimlik doğrulama yüzeyleri (tema)

Kimlik doğrulama (auth) sayfaları için yardımcılar. `<page>`, şunlardan biridir: `login`, `register`, `resetPassword`, `activate`, `activateNewEmail`, `renewPassword`.

| Çağrı | Amaç |
|---|---|
| `pano.ui.auth.<page>.content.edit(callback)` / `.get()` | O sayfanın içerik yuvasını düzenle / oku. |
| `pano.ui.auth.<page>.onLoad(handler)` | O sayfanın yükleme olayına abone ol. |
| `pano.ui.auth.login.alternativeMethods.add(method)` / `.get()` | Bir alternatif giriş yöntemi ekle / oku (örn. sosyal giriş). |
| `pano.ui.auth.register.alternativeMethods.add(method)` / `.get()` | Kayıt için aynısı. |
| `pano.ui.auth.login.load(event)` | Giriş yükleme akışını çalıştırır (bir giriş sunan plugin sayfası için). `{ error, username, event }` döndürür. |
| `pano.ui.auth.register.load(event)` | Bir plugin kayıt sayfası için aynısı. |
| `pano.ui.auth.login.form.get()` | Temanın giriş formu gövdesi bileşenini çözümler. |
| `pano.ui.auth.register.form.get()` | Temanın kayıt formu gövdesi bileşenini çözümler. |

`resetPassword`, `activate`, `activateNewEmail` ve `renewPassword` yalnızca `content.edit`/`content.get` ve `onLoad`'u açığa çıkarır.

## 8. Çeşitli

| Çağrı | Nerede | Amaç |
|---|---|---|
| `pano.ui.avatar.updateVersion()` | tema + panel | Profil resimlerinin yenilenmesi için avatar önbellek-kırıcısını yükseltir. |
| `pano.ui.avatar.getVersion()` | tema + panel | Mevcut avatar sürüm dizesinin store'u. |
| `pano.ui.view.themes.editMenu(async handler)` | yalnızca panel | Temalar-sayfası bağlam menüsü öğelerini düzenler (diziyi döndürmelidir). |
| `pano.ui.posts.editMenu(async handler)` | yalnızca panel | Gönderiler bağlam menüsü öğelerini düzenler (diziyi döndürmelidir). |

## 9. `@panomc/sdk` modül dışa aktarımları

Dondurulmuş içe aktarma yüzeyi. Her belirteç, kararlı bir host çalışma zamanı modülüne eşlenir — tam olarak bu yollardan içe aktarın, asla başka bir şeyi derin-içe-aktarmayın (deep-import).

| Belirteç | Dışa aktarımlar |
|---|---|
| `@panomc/sdk` | `PanoPlugin`, `viewComponent`, `getPanoContext` |
| `@panomc/sdk/utils/api` | `ApiUtil` (default), `NETWORK_ERROR`, `networkErrorBody`, `buildQueryParams` |
| `@panomc/sdk/utils/auth` | `hasPermission(permission, user)` |
| `@panomc/sdk/utils/tooltip` | `tooltip` (aynı zamanda default) |
| `@panomc/sdk/utils/text` | `copy` |
| `@panomc/sdk/utils/language` | `_`, `languageLoading`, `currentLanguage`, `Languages`, `init`, `getAcceptedLanguage`, `loadLanguage`, `changeLanguage`, `getLanguageByLocale` |
| `@panomc/sdk/utils/component` | `viewComponent` |
| `@panomc/sdk/toasts` | `showToast`, `limitTitle` |
| `@panomc/sdk/components/theme` | `PlayerHead`, `NoContent`, `Date`, `Toast`, `PageTitle`, `PageActions`, `Pagination` |
| `@panomc/sdk/components/panel` | `NoContent`, `Editor`, `DragAndDropZone`, `Date`, `Toast`, `PageLoading`, `PageActions`, `PageLoader`, `PageNavItem`, `PageNav`, `Pagination`, `CardFilters`, `CardFiltersItem`, `CardHeader`, `SearchInput` |
| `@panomc/sdk/variables` | `API_URL`, `UI_URL`, `PANEL_URL`, `SETUP_URL`, `PANO_WEBSITE_URL`, `PANO_WEBSITE_API_URL`, `PRERELEASE`, `COOKIE_PREFIX`, `CSRF_TOKEN_COOKIE_NAME`, `JWT_COOKIE_NAME`, `CSRF_HEADER`, `updateApiUrl`, `updatePanoWebsiteUrl`, `updatePanoWebsiteApiUrl` |
| `@panomc/sdk/svelte` | `page`, `base`, `navigating`, `browser`, `goto`, `invalidate`, `invalidateAll`, `error`, `redirect` |
| `@panomc/sdk/internal` | `setPanoContext`, `getPanoContext` |

::: warning `Button`, `Card` veya `Input` yok
`@panomc/sdk/components/panel` ve `.../theme`, tam olarak yukarıda listelenen bileşenleri dışa aktarır. Genel bir `Button`/`Card`/`Input` yoktur — eski dokümanlar bunları uydurdu. Basit kontrolleri düz markup ile inşa edin ya da listelenen bileşenleri yeniden kullanın.
:::

**`ApiUtil` metot imzaları** (hepsi `async`, hepsi tek bir seçenek nesnesi alır):

| Metot | Seçenekler |
|---|---|
| `ApiUtil.get(...)` | `{ path, request, csrfToken, token, blob, handler }` |
| `ApiUtil.post(...)` | `{ path, request, body, headers, csrfToken, token, blob, handler, onUploadProgress }` |
| `ApiUtil.put(...)` | `{ path, request, body, headers, csrfToken, token, blob, handler, onUploadProgress }` |
| `ApiUtil.delete(...)` | `{ path, request, headers, csrfToken, token, blob, handler }` |
| `ApiUtil.customRequest(...)` | `{ path, data, request, csrfToken, token, blob, handler, onUploadProgress }` |

Bu metotları bir `load()` içinde çağırdığınızda, isteğin SSR sırasında çalışması için her zaman `request: event` geçin.

**`showToast` imzası:** `showToast(text, params = {}, toastComponent)`.

## 10. Neleri içe aktarabilirsiniz

::: warning Yalnızca dondurulmuş liste host çalışma zamanına çözümlenir
Bir plugin derlemesi bu çıplak belirteçleri **external** bırakır — host onları sağlar, böylece her eklenti tek bir Svelte örneğini paylaşır. Listenin dışında bir şey içe aktarırsanız çalışma zamanında çözümlenmez.
:::

İzin verilen çıplak belirteçler tam olarak şunlardır:

- Yukarıdaki tablodaki her `@panomc/sdk` belirteci.
- Svelte: `svelte`, `svelte/store`, `svelte/transition`, `svelte/easing`, `svelte/motion`, `svelte/animate`, `svelte/legacy`, `svelte/events`, `svelte/attachments`, `svelte/reactivity`, `svelte/reactivity/window` ve `svelte-i18n`.
- **Sabit** bir Svelte iç modülü kümesi — `svelte/internal`, `svelte/internal/client`, `svelte/internal/disclose-version`, `svelte/internal/flags/legacy`, `svelte/internal/flags/async` ve `svelte/internal/flags/tracing`. Bu tam bir listedir, bir `svelte/internal/*` joker karakteri (wildcard) **değildir**; başka herhangi bir `svelte/internal/...` alt yolu çözümlenmez.

Başka her şey — `chart.js`, `svelte-select`, başka herhangi bir npm paketi — çıplak içe aktarılmak yerine, rollup derlemeniz tarafından **eklentinize paketlenmelidir**. (Market eklentisi, Chart.js'i göndermek için tam olarak bunu yapar.)

::: warning `svelte`'i `package.json`'ınıza asla eklemeyin
Svelte derleyici sürümü `@panomc/sdk`'nin sabitlemesinden gelir ve derleme bir uyuşmazlıkta başarısız olur. Kendi `svelte` bağımlılığınızı eklemek, hydration'ı bozan sürüm sapmasına yol açar. Bkz. [Mimari](/tr/addon/architecture/).
:::

## Sırada ne var

- **[Arayüz Geliştirme](/tr/addon/frontend/)** — bu API'leri iş başında gösteren Shoutbox adım-adım anlatımı.
- **[Çeviriler](/tr/addon/localization/)** — `_` store'unun ve yerelleştirme dosyalarınızın nasıl bir araya geldiği.
- **[Sayfa Tasarımlarını Değiştirme](/tr/theme/views/)** — ayrıca tema da geliştiriyorsanız, tema tarafındaki görünüm/kanca modeli.
