# Tema Yapısı

Bir tema iskeleti oluşturduğunuzda, 17 dosyalık bir klasör elde edersiniz. Bu çok görünebilir, ama çoğu sizin uğraşmanız gereken dosyalar değildir. Bu sayfa her bir dosyanın ne işe yaradığını ve gerçekte hangilerini düzenlediğinizi açıklar.

## Ana fikir

Bir Pano temasını birlikte çalışan iki parça olarak düşünün:

- **Tema çekirdeği** (`@panomc/theme-core`) — *çalışan* her şeyi bu yapar: giriş, kayıt, eklentiler, sunucunuzdan veri yükleme ve siteyi derleme. Bunların hiçbirini siz yazmazsınız. Bir paket olarak gelir ve onu diğer paketler gibi güncellersiniz.
- **Temanız** — bu yalnızca *görünüm*tür: renkler, fontlar, düzen ve metin. Sahip olduğunuz ve düzenlediğiniz kısım budur.

::: tip vanilla-theme bir şablon değildir
`vanilla-theme`, Pano'nun birlikte geldiği **dahili varsayılan görünüm**dür. Kopyalanacak veya fork'lanacak bir başlangıç noktası **değildir**. Yeni bir temaya her zaman `bunx @panomc/theme-core new` ile başlayın ve ağır işi tema çekirdeğinin yapmasına izin verin.
:::

## Dosyalar

İşte iskelesi oluşturulmuş bir tema, her parçaya dair bir notla birlikte:

```text
my-theme/
├─ manifest.json          ← SİZİN   ad, sürüm, yazar, ekran görüntüleri
├─ theme.config.js        ← SİZİN   görünüm geçersiz kılmalarınız + ek ayarlar
├─ core-meta.json         ← oto     temanızın kullandığı tema çekirdeği katmanı
├─ package.json           ← oto     bağımlılıklar (svelte tema çekirdeğine sabitlenmiş)
├─ svelte.config.js       ← oto     tema çekirdeğine tek satırlık çağrı
├─ vite.config.js         ← oto     tema çekirdeğine tek satırlık çağrı
├─ lang-overrides/        ← SİZİN   yalnızca değiştirmek istediğiniz metin
├─ screenshots/           ← SİZİN   temanızın önizleme görselleri
├─ static/                ← SİZİN   görselleriniz, fontlarınız, diğer varlıklarınız
├─ src/
│  ├─ styles/tokens.scss  ← SİZİN   renkleriniz, fontlarınız, boyutlarınız
│  ├─ styles/style.scss   ← SİZİN   ek CSS'iniz
│  ├─ views/              ← SİZİN   düzen geçersiz kılmalarınız (gerektiğinde)
│  ├─ routes/             ← oto     `bun run sync` üretir — asla düzenlemeyin
│  ├─ lib/                ← oto     `bun run sync` üretir — asla düzenlemeyin
│  ├─ hooks.server.js     ← oto     üretilmiş
│  └─ hooks.client.js     ← oto     üretilmiş
└─ lang/                  ← oto     temel metin dosyaları — asla düzenlemeyin
```

### Size ait dosyalar

Bunlar düzenlediğiniz dosyalardır. Temanızı *sizin* temanız yapan şey bunlardır.

| Dosya veya klasör | Ne için kullanırsınız |
|---|---|
| `manifest.json` | Temanızın adı, sürümü ve ayrıntıları (aşağıya bakın). |
| `theme.config.js` | Düzen geçersiz kılmalarını ve ek ayarları kaydeder. |
| `src/styles/tokens.scss` | Tasarım değerleriniz — renkler, fontlar, köşe yarıçapları, gölgeler. |
| `src/styles/style.scss` | Eklemek istediğiniz ek CSS. |
| `src/views/` | Renkler tek başına yetmediğinde özel düzen. |
| `lang-overrides/` | Yalnızca değiştirmek istediğiniz kelimeler ve ifadeler. |
| `screenshots/` | Temanız için gösterilen önizleme görselleri. |
| `static/` | Görselleriniz, fontlarınız ve diğer dosyalarınız. |

### Üretilen dosyalar

Bu dosyalar tema çekirdeği tarafından sizin **için** oluşturulur. Onları asla elle düzenlemeyin — bir sonraki `bun run sync` veya tema çekirdeği güncellemesi bunların üzerine yazar ve değişiklikleriniz kaybolur.

| Dosya veya klasör | Nedir |
|---|---|
| `src/routes/` | Tema çekirdeğinden yeniden üretilen sayfa bağlantıları. |
| `src/lib/` | Tema çekirdeğinden yeniden üretilen yardımcı kod ve köprüler. |
| `lang/` | Her dilin temel metni (metni bunun yerine `lang-overrides/` ile değiştirin). |
| `hooks.server.js`, `hooks.client.js` | Tema çekirdeği çağıran küçük kurulum dosyaları. |
| `core-meta.json`, `package.json`, `svelte.config.js`, `vite.config.js` | İskele oluşturucunun sizin için ayarladığı yapılandırma. |

::: warning Her değişikliği size ait bir dosyaya koyun
Üretilen bir dosyayı düzenlerseniz, bir sonraki `bun run sync` çalıştırdığınızda emeğiniz kaybolur. Yalnızca yukarıda "sizin" olarak işaretlenen dosyaları düzenleyin.
:::

## Manifest

`manifest.json`, temanızı Pano'ya tanıtır. Küçük bir alan kümesi vardır:

| Alan | Anlamı |
|---|---|
| `id` | Temanız için benzersiz bir ad. `vanilla-theme` **olamaz**. |
| `title` | İnsanların gördüğü kullanıcı dostu ad. |
| `version` | Temanızın sürümü, örn. `1.0.0`. |
| `author` | Adınız. |
| `panoVersion` | Temanızın yapıldığı Pano sürümü. |
| `screenshots` | `screenshots/` klasörünüzdeki önizleme görsellerinin listesi. |
| `premium` | Temanız ücretliyse `true`, ücretsizse `false`. |

## "Tema çekirdeği güncellenir" sizin için ne demek

Tema çekirdeği bir paket olduğu için, onu güncellemek yalnızca iki komuttur:

```sh
bun update @panomc/theme-core
bunx @panomc/theme-core sync
```

İlk satır en yeni tema çekirdeği çeker. İkincisi, ona uyacak şekilde yukarıdaki "oto" dosyalarını yeniden üretir.

::: tip Görünümünüz kalır
"Sizin" listesindeki her şey — renkleriniz, metniniz, varlıklarınız — bir güncellemeden etkilenmez. Tema çekirdeğinin yeni özelliklerini ve düzeltmelerini alırken temanız tam olarak yaptığınız gibi görünmeye devam eder.
:::
