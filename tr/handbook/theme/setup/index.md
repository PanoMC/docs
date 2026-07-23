# Kurulum

Atölyemizi kurma zamanı. Bu sayfanın sonunda Ember, bilgisayarınızda gerçek bir klasör olacak, çalışan bir Pano'ya bağlanacak, tarayıcınızda canlı görünecek — ve ilk değişikliğinizi yapmış olacaksınız.

## Adım 0 — Pano'nun çalıştığından emin olun

Bir tema yalnızca *görünüştür* — bir şey gösterebilmek için arkasında canlı bir Pano'ya ihtiyaç duyar. Bu yüzden her şeyden önce Pano'nuzun kurulu ve çalışır durumda olduğundan emin olun. Değilse, önce [Kurulum](/tr/platform/installation/) sayfasını izleyin ve buraya geri dönün.

Bu el kitabı için Pano'yu **geliştirme modunda** başlattığınızı varsayacağız:

```sh
# Pano klasörünüzde
./pano --dev
```

`--dev` modunda Pano **8088** portunu dinler. (`--dev` olmadan varsayılan **80** portudur.) Bunu kendi terminalinde çalışır durumda bırakın.

## Adım 1 — Ember'ı iskeletleyin

Yeni bir terminal açın. Temayı tek bir komutla oluşturun — her zaman tam olarak bu paket adıyla:

```sh
bunx @panomc/theme-core new ember
```

Bu, içinde bir temanın ihtiyaç duyduğu her şeyle birlikte `ember` adında bir klasör oluşturur. İçine girin ve parçalarını kurun:

```sh
cd ember
bun install
```

`bun install`, bağımlılıkları getirmekten fazlasını yapar — ayrıca **motorun sizin için sağladığı dosyaları da üretir**: sayfa route'ları, `$lib` köprüleri, temel `lang/` dosyaları ve bir lisans taslağı. Ayrı bir manuel adım yoktur; hepsi sizin için yapılır.

::: tip `bun install` "Resolving…" adımında takılmış gibi görünürse
`Ctrl + C` ile durdurun ve bunun yerine şunu çalıştırın:

```sh
bun install --backend=copyfile
```
:::

::: tip Sonradan yeniden üretme
Motoru güncellediğinizde veya o otomatik dosyaları yeniden üretmek istediğinizde `bun run sync` çalıştırın. Şu anda buna ihtiyacınız yok — `bun install` bunu zaten yaptı.
:::

Tüm o dosyaların ne olduğunu merak mı ediyorsunuz? [Tema Yapısı](/tr/theme/structure/) sayfasında tam bir harita var. Şimdilik kısa hali: **SİZİN** olarak işaretli dosyalar düzenlediklerinizdir; **otomatik** olanlar sizin için yeniden üretilir, o yüzden onları asla elle düzenlemeyin.

## Adım 2 — Ember'ı Pano'nuza yönlendirin

Ember'ın, çalışan Pano'nuzun nerede olduğunu bilmesi gerekir. Temanın kökündeki `.env` dosyasını açın ve adresi ayarlayın:

```sh
# .env
VITE_API_URL=http://localhost:8088/api
```

`8088` kullanıyoruz çünkü Pano'yu `--dev` ile başlattık. Pano'nuz başka bir yerde çalışıyorsa (örneğin varsayılan port `80`), o adresi kullanın.

## Adım 3 — Pano'ya temanızı kullanmasını söyleyin

Pano, kendi gömülü başlatma arayüzüyle gelir. Ember'ı geliştirirken Pano'nun **bizim** temamızı kullanmasını istiyoruz. Pano'nun yapılandırmasını açın, `init-ui` ayarını kapatın ve Pano'yu yeniden başlatın. [Sunucu yapılandırması](/tr/platform/configuration/server/#başlatma-arayüz-ve-güncellemeler) sayfası bu ayarın tam olarak nerede olduğunu gösterir.

## Adım 4 — Ember'ı başlatın ve canlı görün

`ember` klasörüne geri dönün ve geliştirme sunucusunu başlatın:

```sh
bun run dev
```

Şimdi sitenizi **Pano'nun adresi üzerinden** açın:

- Pano'yu `--dev` ile başlattıysanız `http://localhost:8088`, ya da
- aksi halde `http://localhost` (port `80`).

**Şimdi görmelisiniz** ki siteniz taptaze Ember temasıyla çalışıyor. Hâlâ varsayılan gibi görünüyor — bu beklenen bir durum. Birazdan bunu değiştireceğiz.

::: warning Her zaman Pano üzerinden gezinin, asla localhost:3000 değil
Bir tema her zaman Pano'nun *arkasında* çalışır. Temanın kendi portunu (`localhost:3000`) doğrudan açarsanız, sizi yalnızca Pano'nun adresine yönlendirir. Temanın değil, Pano'nun URL'sini yer imlerinize ekleyin.
:::

## Adım 5 — ilk değişikliğiniz

Döngünün çalıştığını kanıtlayalım. Editörünüzde `src/styles/tokens.scss` dosyasını açın ve ana renk satırını bulun — başlangıçta yorum satırına alınmış olarak gelir:

```scss
// $primary: #ff5722;
```

`//` işaretini kaldırın ve Ember'ın sıcak turuncusunu ayarlayın:

```scss
$primary: #ff6a3d;
```

Dosyayı kaydedin ve tarayıcınızı yenileyin. **Şimdi görmelisiniz** ki vurgu rengi butonlar, bağlantılar ve vurgular boyunca sıcak bir turuncuya kayıyor.

Tüm geliştirme döngüsü budur: **düzenle, kaydet, yenile.** Bu el kitabının geri kalanı boyunca bunu tekrarlayacaksınız.

Ember artık canlı ve bağlı olduğuna göre, ona gerçek bir kimlik verelim.

**Sıradaki: [Tasarım ve Stiller →](/tr/handbook/theme/design/)**
