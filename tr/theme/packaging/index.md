# Derleme ve Paketleme

Temanızın görünümünden memnun olduğunuzda, onu bir Pano sunucusunun kurabileceği tek bir dosyaya dönüştürürsünüz. Bu sayfa, temanızı derleme, denetleme ve paketleme adımlarında size yol gösterir — önceden deneyim gerektirmez.

## Geliştirme derlemesi ve production derlemesi

Çalışırken `bun run dev` komutunu çalıştırırsınız. Bu **geliştirme derlemesidir**: hızlıdır, bir dosyayı kaydettiğiniz anda güncellenir ve tasarım yaparken ihtiyacınız olmayan yavaş adımları atlar. Yalnızca kendi bilgisayarınızda, sizin gözleriniz için tasarlanmıştır.

Yayınlamaya hazır olduğunuzda bir **production derlemesi** oluşturursunuz. Bu, cilalanmış sürümdür: her şey optimize edilir, küçük paketlenir ve gerçek bir sunucuda çalışmaya hazır hale getirilir. Gerçek bir Pano sitesini ziyaret edenler her zaman bir production derlemesi görür.

Elle bir şey değiştirmenize gerek yoktur — aşağıdaki komutlar doğru olanı yapar.

## Temanızın kimliği — `manifest.json`

Tema klasörünüzün kökünde `manifest.json` bulunur — Pano'ya (ve herkese) bu temanın *ne olduğunu* söyleyen kart. İskelet onu sizin için oluşturdu, ama yayınlamadan önce doldurmalısınız:

```json
{
  "id": "my-theme",
  "title": "My Theme",
  "description": "A clean, dark theme for survival servers",
  "version": "1.0.0",
  "author": "YourName",
  "panoVersion": "1.0.0",
  "screenshots": ["screenshots/1.png"],
  "premium": false
}
```

| Alan | Nedir |
|---|---|
| `id` | Temanızın **benzersiz tanımlayıcısı** — `my-theme` gibi küçük harfli, tireyle ayrılmış bir ad. Pano temaları birbirinden ayırmak için bunu kullanır ve paketlenen dosya ona göre adlandırılır (`my-theme-1.0.0.zip`). Bir kez seçin ve yayınladıktan sonra **asla değiştirmeyin**: yeni bir `id`, tamamen farklı bir tema sayılır. Ayrıca `vanilla-theme` olmamalıdır — `check` bunu reddeder. |
| `title` | Panelde kullanıcılara gösterilen, okunabilir ad. |
| `description` | Temanın nasıl göründüğü hakkında bir iki cümle. |
| `version` | Yayın sürümü. Yayın otomasyonunu kullanırsanız bu sizin için damgalanır — elle yükseltmeyin. |
| `author` | Adınız veya ekibinizin adı. |
| `panoVersion` | Temanızın hedeflediği Pano sürümü. |
| `screenshots` | Görsel yollarının bir listesi (aşağıya bakın). |
| `premium` | Ücretsiz bir tema için `false`; `true` ücretli lisans korumasını etkinleştirir. Bkz. [Yayınlama ve Premium](/tr/theme/publishing/). |

### Ekran görüntüleri ekleme

Görsellerinizi temanızın kökündeki bir `screenshots/` klasörüne koyun ve manifest'te listeleyin:

```
my-theme/
├─ manifest.json
└─ screenshots/
   ├─ 1.png
   └─ 2.png
```

```json
"screenshots": ["screenshots/1.png", "screenshots/2.png"]
```

Derleme, `screenshots/` klasörünü otomatik olarak paketinize kopyalar, bu yüzden görseller `.zip`'in içinde yayınlanır. İyi bir ekran görüntüsü, temanızın ana sayfasının tam sayfa yakalanmış halidir — temalara göz atarken insanların gördüğü ilk şey odur.

## Adım 1 — Derleme

Temanızın klasöründe bir terminal açın ve şunu çalıştırın:

```sh
bun run build
```

Bu komut, temanızın bitmiş, optimize edilmiş sürümünü bir `build/` klasörünün içinde üretir. `build/` klasörünü, tamamen monte edilmiş ve hazır — ama henüz paketlenmemiş — temanız olarak düşünün.

::: tip Derlemeler yeniden üretilebilir
Aynı kodu iki kez derlemek size **bayt bayt aynı** sonucu verir. Premium temalar için bu çok önemlidir: paketin SHA-256 değeri (dosyanın benzersiz parmak izi) **sizin lisans kimliğinizdir**. Aynı kod girer, aynı parmak izi çıkar. Bkz. [Yayınlama ve Premium](/tr/theme/publishing/).
:::

## Adım 2 — Denetleme

Paketlemeden önce güvenlik ağını çalıştırın:

```sh
bun run check
```

Bu komut temanızı inceler ve bozuk bir şey yayınlamanızı engeller. Şunları denetler:

| Denetlediği şey | Neden önemli |
|---|---|
| **Svelte sürümü** | `svelte` sürümünüz tema çekirdeğininkiyle tam olarak eşleşmelidir. Bir uyumsuzluk, kurulu eklentileri sessizce bozar. |
| **Eklenti slot'larının korunması** | Değiştirdiğiniz her görünüm, orijinalinde bulunan tüm eklenti bağlama noktalarını hâlâ içermelidir. Birini kaldırırsanız kurulu eklentiler sessizce kaybolur. |
| **Ayar şemasının geçerliliği** | Eklediğiniz ek ayarlar doğru bildirilmelidir; böylece panel bunları kaydedip sıfırlayabilir. |
| **Çevirilerin ayrıştırılabilirliği** | `lang-overrides/` içindeki her dosya geçerli olmalı ve sorunsuz birleşmelidir. Bkz. [Yerelleştirme](/tr/theme/localization/). |
| **Manifest bütünlüğü** | `manifest.json` gerekli tüm alanları taşımalı ve `id` değeri `vanilla-theme` olmamalıdır. |

`check` bir sorun bildirirse düzeltin ve tekrar çalıştırın. Yeşil bir `check`, temanızın paketlenmeye hazır olduğu anlamına gelir.

## Adım 3 — Paketleme

Şimdi derlemeyi kurulabilir tek bir dosyaya sarın:

```sh
bun run package
```

Bu komut bir **`.zip`** dosyası üretir — bir Pano sunucusunun panel üzerinden doğrudan kurabileceği, kendi kendine yeten bir paket. O tek dosya, temanızın tamamıdır.

## Kendi sunucunuza kurma ve test etme

Temanızı paylaşmadan önce, uçtan uca çalıştığından emin olmak için kendi Pano'nuza kurun:

1. Tarayıcınızda Pano panelinizi açın ve yönetici olarak giriş yapın.
2. **Görünüm → Temalar** bölümüne gidin.
3. **Kur** (veya **Tema Yükle**) seçeneğini seçin ve az önce derlediğiniz `.zip` dosyasını yükleyin.
4. Temanızı etkinleştirin ve canlı görmek için siteyi açın.

::: tip
Bu, kullanıcılarınızın izleyeceği kurulum akışının tam olarak aynısıdır. Önce kendiniz test etmek, bir başkası temanızı kurduğunda sürprizle karşılaşmayacağınız anlamına gelir.
:::

## Sırada ne var

- **[Yayınlama ve Premium](/tr/theme/publishing/)** — temanızı başkalarıyla paylaşın ve isteğe bağlı olarak premium yapın.
- **[Yerelleştirme](/tr/theme/localization/)** — temanızı başka dillere çevirin.
