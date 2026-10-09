# Başlangıç

Bir Pano **teması**, sitenizin nasıl göründüğünü belirler: renkler, fontlar ve düzen. Zor kısımları (giriş, eklentiler, veri yükleme, derleme) `@panomc/theme-core` adlı bir motor sizin yerinize yapar. Temanız onun üzerinde durur ve yalnızca görünümü değiştirir.

Bu sayfa sizi sıfırdan, kendi renginize sahip çalışan bir temaya götürür. Üç adımdır ve renge gelene kadar elle hiçbir dosya yazmazsınız.

::: tip Uzman olmanız gerekmez
Her adım kopyala-yapıştırdır. Biraz **HTML**, **CSS**, **JavaScript** ve **Svelte** bilmek yardımcı olur ama başlamak için şart değildir. Ücretsiz rehberler: [svelte.dev/tutorial](https://svelte.dev/tutorial) ve [MDN Web Docs](https://developer.mozilla.org/).
:::

## Neye ihtiyacınız var

| İhtiyacınız olan | Nedir |
|---|---|
| **Bun** | Pano ön yüzlerini kurar ve çalıştırır. [bun.sh](https://bun.sh) adresinden alın. |
| **Çalışan bir Pano** | Kendi sunucunuz ya da bilgisayarınızdaki bir Pano. Kurulu değilse [Kurulum](/tr/platform/installation/) sayfasına bakın. Temanız çalışırken onunla konuşur. |
| **Bir kod editörü** | [VS Code](https://code.visualstudio.com/) gibi herhangi bir editör. |

## Hızlı başlangıç

```sh
bunx @panomc/theme-core new my-theme     # dört soru sorar, sonra kurar
cd my-theme && bun run dev:ui            # bir kez ayarlanacak tek panel alanını yazdırır
```

Sonra panelde **Platform Ayarları → Geliştirme Modu**'nu açın ve **Görünüm → Ön yüz → Tema geliştirme sunucusu** alanına komutun yazdırdığı adresi (`http://localhost:3000`) girin. Kaydedin ve Pano adresinizi açın. Temanız çalışıyor.

Hepsi bu: **üç adım** (iskele, dev, bir panel alanı). Pano yapılandırma dosyasını düzenlemezsiniz ve Pano'yu yeniden başlatmazsınız; böylece çalışırken panel erişilebilir kalır.

::: tip `bun install` takılırsa
"Resolving..." üzerinde kalırsa `Ctrl + C` ile durdurun ve klasörde `bun install --backend=copyfile` çalıştırın.
:::

::: tip Komut satırında ad vermek
Ad vererek çalıştırılan `bunx @panomc/theme-core new my-theme` hiçbir şey sormaz ve kurulum yapmaz. `bun run dev:ui` öncesinde klasörde `bun install` çalıştırın. İlk kurulum rotaları, dil dosyalarını ve köprüleri de üretir; ayrı bir senkronizasyon adımı yoktur.
:::

::: warning Temanın portundan değil, Pano üzerinden gezinin
Bir tema her zaman Pano'nun arkasında çalışır. Pano adresinizi açın (örneğin Pano `--dev` ile çalışıyorsa `http://localhost:8088`). Temanın kendi portu sizi oraya yönlendirir.
:::

## Panel alanı ne yapar

**Tema geliştirme sunucusu** alanı doluyken ön yüz modu `THEME`'dir ve Geliştirme Modu açıktır: Pano kendi tema sürecini başlatmaz ve siteyi geliştirme sunucunuza yönlendirir. Panel, kurulum ve eklenti arayüzleri her zamanki gibi çalışır. Alanı boşaltırsanız Pano yüklü temaya döner.

## İlk değişiklik

`src/styles/tokens.scss` dosyasını açın. Her token'ın yorum satırı olarak yazılmış bir menüsüdür. Birini açın:

```scss
$primary: #10b981;
```

Kaydedin. Sayfa kendiliğinden güncellenir. Vanilla'dan farklı görünen bir tema **dört adımdır**: yukarıdaki üçü ve bu düzenleme.

`bun run dev:ui` her kayıtta stilleri de yeniden derler. Yalnızca `bun run dev` sunucuyu başlatır; stil değişiklikleri görünmez.

## Sonraki adım

- **[Tema yapısı](/tr/theme/structure/)**: hangi dosyalar sizin, hangileri üretilmiş.
- **[Özelleştirme](/tr/theme/customization/)**: token'lar, `--pano-*` değişkenleri ve kendi CSS'iniz.
- **[View'lar](/tr/theme/views/)**: işaretlemeyi değiştirin, bir eklentinin view'ını yeniden çizin, blok yerleştirin, rotaları yeniden adlandırın, ana sayfa seçin.
- **[Yerelleştirme](/tr/theme/localization/)**: temanızı çevirin.
- **[Paketleme](/tr/theme/packaging/)** ve **[Yayınlama](/tr/theme/publishing/)**: yayına alın.

Aynı sayfanın kısası motor deposunda `QUICKSTART-THEME.md` olarak, uzun başvuru ise `THEME-AUTHOR-GUIDE.md` olarak durur.
