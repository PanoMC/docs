# Başlangıç

Bir Pano **teması**, web sitenizin nasıl göründüğünü kontrol eder — renklerini, fontlarını ve düzenini. Zor kısımlar (giriş, eklentiler, veri yükleme, derleme) `@panomc/theme-core` adlı bir motor tarafından sizin için önceden halledilmiştir. Temanız yalnızca bunun üzerine oturur ve görünümü değiştirir.

Bu sayfa sizi sıfırdan çalışan bir temaya götürür ve yaklaşık iki dakikada ilk değişikliğinizi yaptırır.

::: tip Uzman olmanıza gerek yok
Buradaki her adımı komutları kopyalayıp yapıştırarak izleyebilirsiniz. Biraz **HTML**, **CSS**, **JavaScript** ve **Svelte** bilmek **yardımcı olur**, ancak başlamak için hiçbiri gerekli değildir.

Bunlar sizin için yeni mi? Bu ücretsiz kaynaklar harika:

- **Svelte** — [svelte.dev/tutorial](https://svelte.dev/tutorial)
- **HTML / CSS / JavaScript** — [MDN Web Docs](https://developer.mozilla.org/)
:::

## Neye ihtiyacınız var

Başlamadan önce şu üç şeye sahip olduğunuzdan emin olun:

| İhtiyacınız olan | Nedir |
|---|---|
| **Bun** | Pano frontend'lerini kuran ve çalıştıran araç. [bun.sh](https://bun.sh) adresinden kurun. |
| **Çalışan bir Pano** | Kendi Pano sunucunuz veya bilgisayarınızda çalışan bir tane. Çalışırken temanız onunla konuşur. |
| **Bir kod editörü** | [VS Code](https://code.visualstudio.com/) gibi herhangi bir kod metin editörü. |

## Temanızı oluşturun

Yeni bir temayı **tek komutla** oluşturursunuz. Bir terminal açın ve şunu çalıştırın:

```sh
bunx @panomc/theme-core new my-theme
```

Bu, içinde bir temanın ihtiyaç duyduğu her şeyle birlikte `my-theme` adında yeni bir klasör oluşturur.

Şimdi o klasöre girin ve parçalarını kurun:

```sh
cd my-theme
bun install
```

::: tip `bun install` takılmış gibi görünürse
"Resolving…" adımında takılırsa, durdurun (`Ctrl + C`'ye basın) ve bunun yerine şunu çalıştırın:

```sh
bun install --backend=copyfile
```
:::

Ardından, motorun sizin için sağladığı dosyaları üretin:

```sh
bun run sync
```

Şimdi temanıza çalışan Pano'nuzun nerede olduğunu söyleyin. `.env` adlı dosyayı açın ve adresi ayarlayın:

```sh
# .env
VITE_API_URL=http://localhost:8088/api
```

::: tip
Pano'nun varsayılan portu `80`'dir. Pano'yu `--dev` ile başlatırsanız `8088` portunda çalışır — tema geliştirirken alışıldık düzen budur. Pano'nuz başka bir yerde çalışıyorsa, onun adresini kullanın.
:::

Pano tarafında bir adım daha: Pano'nun yapılandırma dosyasını açıp `init-ui` ayarını kapatın ve Pano'yu yeniden başlatın. Bu, Pano'ya kendi gömülü teması yerine **sizin** geliştirme temanızı kullanmasını söyler. Bu ayarın yeri için [Sunucu yapılandırması](/tr/platform/configuration/server/#başlatma-arayüz-ve-güncellemeler) sayfasına bakın.

Son olarak, temayı başlatın:

```sh
bun run dev
```

Şimdi sitenizi **Pano'nun adresi üzerinden** açın: Pano'yu `--dev` ile başlattıysanız `http://localhost:8088`, aksi halde `http://localhost` (varsayılan port `80` — ya da yapılandırmada ne ayarladıysanız). Sitenizi yeni temanızla çalışırken görmelisiniz.

::: warning
Temaya `localhost:3000` üzerinden gitmeyin — tema her zaman Pano'nun arkasında çalışır. Temanın kendi portunu doğrudan açarsanız, sizi otomatik olarak Pano'nun adresine yönlendirir.
:::

## 2 dakikada ilk değişikliğiniz

Temanızın ana rengini değiştirelim.

1. Editörünüzde `src/styles/tokens.scss` dosyasını açın.
2. Ana renk (primary) için olan satırı bulun. Başlangıçta yorum satırına alınmış olarak gelir, şöyle:
   ```scss
   // $primary: #ff5722;
   ```
3. Etkinleştirmek için baştaki `//` işaretini kaldırın ve rengi değiştirin:
   ```scss
   $primary: #10b981;
   ```
4. Dosyayı kaydedin, sonra tarayıcınızı yenileyin.

Siteniz artık yeni rengi kullanıyor. Bütün döngü budur: düzenle, kaydet, yenile.

::: tip Az önce ne oldu
`tokens.scss`, temanızın tasarım değerlerinin bir listesidir — renkler, fontlar, boyutlar. Motordaki her değer buradan değiştirilebilir. Bir token'ı değiştirin, kullanıldığı her yerde değişir.
:::

## Sırada ne var

Artık çalışan bir temanız var ve onu nasıl değiştireceğinizi biliyorsunuz. Ne yapmak istediğinize göre nereye gideceğiniz aşağıda:

- **[Tema Yapısı](/tr/theme/structure/)** — tüm dosyaların ne olduğu ve hangilerinin size ait olduğu.
- **[Özelleştirme](/tr/theme/customization/)** — token'lar ve stillerle daha derine inin.
- **[Görünümler](/tr/theme/views/)** — yalnızca renkleri değil, gerçek düzeni ve markup'ı değiştirin.
- **[Yerelleştirme](/tr/theme/localization/)** — temanızı başka dillere çevirin.
- **[Paketleme](/tr/theme/packaging/)** — temanızı kurabileceğiniz bir dosyaya derleyin.
- **[Yayınlama](/tr/theme/publishing/)** — temanızı başkalarıyla paylaşın.
