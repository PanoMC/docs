# Çeviriler

Ember'ın karşılama banner'ı şu anda yalnızca İngilizce konuşuyor. Her yerden oyuncuların olduğu bir survival sunucusunda bu, kaçırılmış bir fırsat. Ember'ın her ziyaretçiyi kendi dilinde karşılamasını sağlayalım.

İyi haber: tema çekirdeği, desteklediği diller için **eksiksiz çevirilerle** gelir. Yalnızca *sizin* eklediğiniz veya değiştirdiğiniz parçaları yazarsınız. Tam referans: [Çeviriler](/tr/theme/localization/).

## Tek bir resimde nasıl çalıştığı

Temanız yalnızca **farklılıkları** taşır, `lang-overrides/` adlı bir klasörde, her dil için bir dosya:

```
lang-overrides/
├─ en-US.json
├─ tr.json
└─ ru.json
```

`bun run sync` çalıştırdığınızda Pano, override'larınızı tema çekirdeğinin çevirilerinin **üzerine** birleştirir. Birleştirme eklemelidir: yeni metin ekleyebilir veya mevcut metni değiştirebilirsiniz, ama asla bir tema çekirdeği anahtarını kaybedemezsiniz. Bahsetmediğiniz her şey tema çekirdeğinin varsayılanını korur.

## Adım 1 — görünümde çeviri anahtarlarını kullanın

Önceki sayfada Ember'ın banner'ını sabit yazmıştık. Bu metinleri çeviri anahtarlarıyla değiştirelim. `src/views/HomeView.svelte` içinde `$_`, temanızın ad alanı içindeki bir anahtarı arar — biz `ember` ad alanını kullanacağız:

```svelte
<section class="ember-hero">
  <h1>{$_("ember.hero-title")}</h1>
  <p>{$_("ember.hero-subtitle")}</p>
</section>
```

## Adım 2 — İngilizce metni ekleyin

`lang-overrides/` klasörü başlangıçta boştur — içinde `en-US.json` adında bir dosya oluşturun ve anahtarları ekleyin:

```json
{
  "ember": {
    "hero-title": "Welcome to Ember SMP",
    "hero-subtitle": "Grab a torch. Your adventure starts at the campfire."
  }
}
```

## Adım 3 — diğer dillere çevirin

Aynı anahtarları diğer dosyalara ekleyin. Türkçe, `lang-overrides/tr.json` içinde:

```json
{
  "ember": {
    "hero-title": "Ember SMP'ye hoş geldin",
    "hero-subtitle": "Bir meşale kap. Maceran kamp ateşinde başlıyor."
  }
}
```

Rusça, `lang-overrides/ru.json` içinde:

```json
{
  "ember": {
    "hero-title": "Добро пожаловать на Ember SMP",
    "hero-subtitle": "Бери факел. Твоё приключение начинается у костра."
  }
}
```

Şimdi yeni anahtarlarınızın alınması için birleştirmeyi çalıştırın:

```sh
bun run sync
```

Siteyi yenileyin. **Şimdi görmelisiniz** ki banner aktif dilinizde görünüyor ve site dilini değiştirmek karşılamayı da değiştiriyor.

## Yepyeni bir dil ekleme

Ember'ın topluluğunda çok sayıda Alman oyuncu mu var? Yerleşik üç dille sınırlı değilsiniz. **Adı yerel ayar kodu (locale code) olan** yeni bir dosya oluşturun — Almanca için `de`:

```
lang-overrides/
└─ de.json
```

```json
{
  "ember": {
    "hero-title": "Willkommen auf Ember SMP",
    "hero-subtitle": "Schnapp dir eine Fackel. Dein Abenteuer beginnt am Lagerfeuer."
  }
}
```

`bun run sync` sonrasında yeni bir dil, tema çekirdeğinin **İngilizce** temeli üzerine inşa edilir — böylece henüz çevirmediğiniz herhangi bir anahtar, ham anahtarı göstermek yerine İngilizce'ye geri düşer.

::: warning Hangi dillerin görüneceğine panel karar verir
Yalnızca `de.json` eklemek Almanca'nın görünmesini **sağlamaz**. Mevcut dillerin listesi Pano'nun kendisinden gelir: bir yönetici önce panelde **aynı kodla** (`de`) bir yerel ayar tanımlamalıdır. O yerel ayar var olduğunda ziyaretçiler onu seçebilir ve `de.json`'unuz kullanılır. Eşleşen bir panel yerel ayarı olmadan dosya basitçe yok sayılır.
:::

::: tip Eksik bir çeviriyi yakalama
Bir anahtarın hiçbir yerde çevirisi yoksa, ham anahtar adı (örneğin `ember.hero-title`) ekranda görünür — kolay bir ipucu. `bun run check` ayrıca görünümlerinizin kullandığı ama asla çevirmediğiniz anahtarlar hakkında da uyarır; böylece bunları yayınlamadan önce yakalarsınız.
:::

Ember artık hem rolüne yakışıyor *hem de* dili konuşuyor. Geriye kalan tek şey onu paketleyip dünyayla paylaşmak.

**Sıradaki: [Yayına Çıkar →](/tr/handbook/theme/ship/)**
