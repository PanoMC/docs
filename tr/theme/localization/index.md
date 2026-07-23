# Yerelleştirme (i18n)

Yerelleştirme (kısaca **i18n**), temanızın metnini farklı dillerde göstermek demektir. İyi haber: Pano motoru zaten tam çevirilerle gelir, bu yüzden yalnızca gerçekten değiştirdiğiniz parçaları yazarsınız.

## Nasıl çalışır

Motor, bugün desteklediği diller için tam çevirilerle gelir — **en-US** (İngilizce), **tr** (Türkçe) ve **ru** (Rusça). Bu büyük dosyaları **kopyalamaz veya bakımını yapmazsınız**.

Bunun yerine temanız yalnızca **farklılıkları**, her dil için bir dosya olacak şekilde `lang-overrides/` adlı bir klasörde taşır:

```
lang-overrides/
├─ en-US.json
├─ tr.json
└─ ru.json
```

`bun run sync` çalıştırdığınızda Pano, override'larınızı motorun çevirilerinin üzerine birleştirir. Birleştirme **eklemelidir**: yepyeni metin ekleyebilir veya mevcut metni değiştirebilirsiniz, ancak asla bir motor anahtarını kaybedemezsiniz. Belirtmediğiniz her şey motorun varsayılanını korur.

Yani işiniz küçüktür: yalnızca değiştirmek veya eklemek istediğiniz anahtarları yazın.

## Örnek 1 — Mevcut metni değiştirme

Diyelim ki alt bilginin (footer) Türkçe'de farklı bir şey söylemesini istiyorsunuz. Motorun dosyalarına dokunmanıza gerek yok — yalnızca o tek anahtarı override edersiniz.

`lang-overrides/tr.json` dosyasını açın ve değiştirmek istediğiniz anahtarı ekleyin:

```json
{
  "footer": {
    "copyright": "Benim harika sunucum tarafından yapıldı"
  }
}
```

`bun run sync` sonrasında Türkçe ziyaretçiler orada sizin metninizi görür, diğer tüm footer anahtarları ise motordan dokunulmadan gelir. Aynı etiketi İngilizce'de değiştirmek için onu `en-US.json` dosyasına da ekleyin; Rusça'da değiştirmek için `ru.json` dosyasına ekleyin.

## Örnek 2 — Yepyeni bir anahtar ekleme

Kendi markup'ınızı eklediyseniz — diyelim ki override ettiğiniz bir görünümde bir kahraman sloganı (hero slogan) — bunun için yeni bir çeviri anahtarı ekleyebilirsiniz.

**1. Anahtarı görünümünüzde kullanın.** `.svelte` dosyanızda `$_`, temanızın ad alanı (namespace) içindeki bir anahtarı arar:

```svelte
<h1>{$_("my-theme.hero-slogan")}</h1>
```

**2. Anahtarı her dil için** `lang-overrides/` içinde ekleyin:

```json
// lang-overrides/en-US.json
{
  "my-theme": {
    "hero-slogan": "Your adventure starts here"
  }
}
```

```json
// lang-overrides/tr.json
{
  "my-theme": {
    "hero-slogan": "Maceran burada başlıyor"
  }
}
```

```json
// lang-overrides/ru.json
{
  "my-theme": {
    "hero-slogan": "Твоё приключение начинается здесь"
  }
}
```

Artık slogan, ziyaretçinin dilinde otomatik olarak gösterilir. Birleştirmenin bunları alması için anahtarları ekledikten sonra `bun run sync` çalıştırın.

::: tip Çeviri mi eksik?
Bir anahtarın çevirisi yoksa, gerçek metin yerine ekranda ham anahtar adı (örneğin `my-theme.hero-slogan`) görünür — sorunu fark etmenin kolay bir yolu. `bun run check` ayrıca görünümlerinizin kullandığı ama çevrilmemiş anahtarlar hakkında sizi uyarır, böylece bunları göndermeden önce yakalarsınız. Bkz. [Paketleme](/tr/theme/packaging/).
:::

## Sırada ne var

- **[Derleme ve Paketleme](/tr/theme/packaging/)** — temanızı derleyin, denetleyin ve paketleyin.
- **[Yayınlama ve Premium](/tr/theme/publishing/)** — temanızı başkalarıyla paylaşın.
