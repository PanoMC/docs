# Frontend Geliştirme

Pano'nun frontend'i birkaç SvelteKit projesine bölünmüştür. Bağımsız olarak geliştirilseler de, sonuçta ana JAR içinde birlikte paketlenirler.

::: info ÖN KOŞUL: ÇALIŞAN BACKEND
Frontend geliştirmeye başlamadan önce, **mutlaka** çalışan bir Pano backend'ine sahip olmalısınız.
- **Sadece Frontend Geliştirme**: En son Pano `.jar` dosyasını [Releases](https://github.com/PanoMC/Pano/releases) sayfamızdan indirin.
- **Full-Stack Geliştirme**: Eğer backend tarafında da değişiklik yapacaksanız, lütfen kaynak koddan çalıştırmak için [Backend Geliştirme](./backend) kılavuzunu izleyin.
:::

## 🛠️ Teknoloji Yığını
- **Framework**: SvelteKit
- **Stil**: Bootstrap 5 + SASS
- **Çalışma Zamanı**: Bun (Hızlı JavaScript çalışma zamanı)
- **Dil**: **JavaScript** (Saf JS zorunludur. Saf JS ile daha iyi bir dünyanın mümkün olduğuna inanıyoruz!)

## 📜 Dil Felsefesi (JavaScript vs. TypeScript)
Pano projesinde dil seçimimiz konusunda net bir duruşumuz var:
- **Her zaman JavaScript kullanın**: Her şeyi basit ve hafif tutmaya kararlıyız.
- **TypeScript'e Karşıyız**: Uyumluluğu ve sadeliği korumak için TypeScript kullanmaktan kaçınıyoruz.
- **Neden?**: Temiz ve iyi yazılmış saf (Vanilla) JS ile daha iyi ve daha verimli bir dünyanın mümkün olduğuna inanıyoruz. Frontend projelerimizde TypeScript kabul edilmemektedir.

## 🚀 Performans ve SEO
Pano, hibrit bir **SSR (Sunucu Taraflı Oluşturma)** ve **CSR (İstemci Taraflı Oluşturma)** deneyimi sunmak için **SvelteKit**'in gücünden yararlanır.
- **SEO Odaklı**: SEO optimizasyonuna büyük önem veriyoruz. SSR kullanarak tüm içeriğin arama motorları tarafından kolayca indekslenebilir olmasını sağlıyoruz.
- **Akıcı Deneyim**: Dinamik etkileşimler için CSR kullanılır, bu da tam sayfa yenilemeleri olmadan hızlı ve akıcı bir kullanıcı deneyimi sağlar.

::: tip GELİŞTİRİCİ SORUMLULUĞU
Frontend bileşenleri geliştirirken, bunların **SSR uyumlu** olduğundan emin olmalısınız. Svelte'in `onMount` yaşam döngüsü dışında doğrudan `window` veya `document` erişiminden kaçının. SEO standartlarımızı korumak için her zaman semantik HTML kullanın.
:::

- **vanilla-theme**: Tüm temalar için temel.

## 📥 Klonlama ve Alt Modüller (Submodules)
Tüm arayüz projelerimiz, çekirdek mantığı ve bileşenleri paylaşmak için [**pano-sdk**](https://github.com/PanoMC/pano-sdk)'yı bir git alt modülü (submodule) olarak kullanır.

### Tavsiye Edilen Klonlama Yöntemi
SDK'yı ve tüm bağımlılıkları aldığınızdan emin olmak için `--recursive` bayrağını kullanın:
```bash
git clone https://github.com/PanoMC/setup-ui.git --recursive
```

### Normal Klonlama Yaptıysanız
Eğer `--recursive` bayrağını kullanmadıysanız, alt modülleri manuel olarak başlatmanız ve güncellemeniz gerekir:
```bash
git submodule init
git submodule update
```

## 🚦 Geliştirme Kılavuzu
Depoyu ve alt modülleri klonladıktan sonra şu adımları izleyin:

### 1. Kurulum
Bağımlılıkları Bun kullanarak yükleyin:
```bash
bun i
```

### 2. Geliştirme İçin Çalıştırma
Geliştirme sunucusunu başlatın:
```bash
bun dev
```

### 3. Portlar ve Erişim
Her arayüz belirli bir port üzerinde çalışır. **Bu portları değiştirmeyin** ve sisteminizde uygun olduklarından emin olun.

| Arayüz | Port | Koşul |
| :--- | :--- | :--- |
| **setup-ui** | `3002` | Kurulum **yapılmamış** olmalıdır. |
| **vanilla-theme** | `3000` | Kurulum tamamlanmış olmalıdır. |
| **panel-ui** | `3001` | Kurulum tamamlanmış olmalıdır. |

::: danger ÖNEMLİ ERİŞİM NOTU
- **Doğrudan Erişim Yok**: Bu portlara tarayıcınız üzerinden doğrudan erişemezsiniz. Pano'nun proxy'si üzerinden sunulurlar.
- **Otomatik Yönlendirme**: UI portlarına manuel olarak erişmeye çalışırsanız, varsayılan olarak `http://localhost:8088` (Pano'nun varsayılan backend portu) adresine yönlendirilebilirsiniz.
- **Admin Girişi**: `/panel` rotası üzerinden `panel-ui`'a erişmek için, kurulum sırasında tanımladığınız kimlik bilgilerini kullanarak **Admin** olarak giriş yapmalısınız.
:::

## 🔄 Paketleme Süreci
1. Her UI projesi derlenir ve bir `.zip` dosyası halinde sıkıştırılır.
2. Pano derleme işlemi sırasında bu ZIP'ler indirilir ve nihai JAR'a gömülür.
3. Çalışma zamanında Pano bunları `ui/` dizinine çıkarır ve Bun kullanarak bir mikro servis olarak sunar.

## 🔌 UI Eklenti Sistemi
Panel'e veya Temalara özellik ekleyen eklentiler oluşturabilirsiniz.
- **Backend tarafı**: Bir JAR eklentisi olarak tanımlanır.
- **Frontend tarafı**: Svelte ile geliştirilir ve `plugins/` klasörüne yerleştirilir.

### UI Eklentileri Geliştirme
UI değişikliklerini hızlıca test etmek için:
1. Eklenti dosyalarınızı Pano kurulumunuzun `plugins/` dizinine yerleştirin.
2. `Panel -> Ayarlar` kısmından **Dev Mode**'u etkinleştirin.
3. Değişiklikleri anında görmek için `bun dev` komutunu kullanın.

---

Svelte entegrasyonu hakkında sorularınız mı var? [Discord](https://panomc.com/discord) üzerinden bize sorun!
