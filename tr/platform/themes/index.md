# Temalar (Themes)

> ⚠️ Pano’da tema yönetimi için **Görünüm Yönetimi (View Management) izni** gerekir.  
> **Yönetici (Admin)** olarak oturum açmadıysanız, tema sayfasını açmak ve tema ile ilgili işlemleri gerçekleştirmek
> için **Görünüm erişimine** sahip olmalısınız.

Temalar, Pano web sitenizin **görünüm ve hissini** tanımlar.  
Düzenleri, renkleri, bileşenleri ve kullanıcı deneyimini kontrol eder — böylece her Pano kurulumu, arka uca uyumlu
kalırken benzersiz görünebilir.

Temalar, arka uç eklentilerinden bağımsız çalışır; bu sayede temaları **Pano’yu yeniden başlatmadan** ve arka uç
eklentilerini etkilemeden değiştirebilirsiniz.

## 🎨 Kendi Temanızı Oluşturma

**Kendi temanızı geliştirmek** istiyorsanız, Pano bunu hem basit hem de güçlü kılar.  
Temalar, Pano’nun kendi arayüzlerini de güçlendiren modern web çatısı **[SvelteKit](https://kit.svelte.dev/)** ile
geliştirilir.

Her tema, derlemeden sonra `.zip` paket olarak hazırlanmış ayrı bir **SvelteKit uygulamasıdır**.  
Geleneksel temalardan farklı olarak, elle yönetmeniz gereken `assets/` veya `build/` klasörleri yoktur — paketleme
süreci bunları sizin için halleder.

Bir tema şunları yapabilir:

- Özel düzenler, rotalar (routes) veya bileşenler tanımlamak.
- Kendi stil sistemini ve değişken yapılandırmasını eklemek.
- Pano’nun arka ucu ile REST API’ler üzerinden haberleşmek.
- İsteğe bağlı olarak belirli eklentilere bağımlı olmak veya diğerleri için özel API’ler sağlamak.

> Temalar, arka uç verilerine **yalnızca Pano’nun API katmanı** üzerinden erişebilir; ancak yine de gerçek bir UI
> uygulaması olarak çalışırlar.

📘 Temanızı nasıl geliştirip paketleyeceğinizi burada öğrenin:  
👉 [Tema Geliştirme Rehberi →](../../theme/getting-started)

## 💡 Neden Temalar Önemli

Temalar, sunucunuzun web sitesinin **kullanıcı deneyimini** şekillendirir.  
Ziyaretçilerin içeriğinizle nasıl etkileşime girdiğini ve topluluğunuzun markanızı nasıl gördüğünü tanımlarlar.

Temalar sayesinde:

- Sitenizin **kimliğini ve tasarımını** özelleştirebilirsiniz.
- Renk şemalarını, düzeni ve yapıyı ayarlayabilirsiniz.
- Farklı kitleler için farklı stiller oluşturabilirsiniz.
- Genişletilmiş işlevsellik için eklentilerle entegre olabilirsiniz.
- Temanızı **Pano Marketplace**’te yayınlayıp paylaşabilirsiniz.

> Bazı eklentiler belirli temaları gerektirebilir ve bazı temalar da doğru çalışmak için belirli eklentilere ihtiyaç
> duyabilir.  
> Ayrıca, bazı temalar gelişmiş özellikler sağlamak için Pano’nun varsayılan API davranışını genişletebilir veya
> geçersiz kılabilir.

## ⚙️ Temalar Nasıl Çalışır (Arka Plan)

Pano, temaları `themes/` dizininden bağımsız **UI uygulamaları** olarak yükler.  
Her temanın, meta verilerini (id, sürüm, yazar, uyumluluk vb.) içeren **`manifest.json`** adlı bir bildirim dosyası
vardır.  
Bu dosya Pano tarafından otomatik oluşturulur ve yönetilir — **manuel olarak düzenlemeyin.**

Pano başlatıldığında:

1. `themes/` klasöründe geçerli temaları tarar.
2. Geçersiz veya bozuk temalar **otomatik olarak atlanır**.
3. Yalnızca geçerli temalar **Panel → Görünüm → Temalar** içinde görünür.
4. Pano, başlangıçta mevcut tüm temaları yeniden yükler.
5. **Yeni yüklenen temalar otomatik olarak algılanır ve listelenir** — manuel yenileme gerekmez.

### Pano’daki Varsayılan Arayüzler

Varsayılan olarak Pano, **üç yerleşik UI uygulaması** ile gelir:

- `panel-ui` → Yönetim paneli.
- `setup-ui` → İlk yapılandırma sırasında gösterilen kurulum arayüzü.
- `vanilla-theme` → Varsayılan herkese açık web sitesi teması.

> Yalnızca `vanilla-theme` gerçek bir **tema**dır.  
> Diğer ikisi (`panel-ui`, `setup-ui`) **tema değil**, **UI uygulamalarıdır** ve Temalar listesinde görünmez.

Pano henüz kurulmadıysa, kurulum tamamlanana kadar **Setup UI** otomatik olarak gösterilir.

**Yönetim Paneli**’ne erişmek için tarayıcınızda `/panel` adresine gidin —  
oturum açtıysanız ve gerekli izinlere sahipseniz, panel arayüzüne yönlendirilirsiniz.

## 📦 Tema Yükleme

Temaları **iki şekilde** yükleyebilirsiniz:

### 1. Bilgisayarınızdan (Yerel)

1. **Panel → Görünüm → Temalar** bölümünü açın.
2. **Tema Yükle**’ye tıklayın.
3. Tema `.zip` dosyanızı sürükleyip bırakın veya elle seçin.
4. Yeni tema, **yeniden yükleme gerekmeksizin** otomatik olarak listeye eklenecektir.

> ⚠️ **Doğrulanmamış Tema Uyarısı:**  
> Bilinmeyen veya resmi olmayan kaynaklardan tema yüklemek kendi sorumluluğunuzdadır.  
> Doğrulanmamış temalar güvensiz veya uyumsuz kod içerebilir.  
> Yalnızca güvendiğiniz veya **Pano Mağazası**’nda yayımlanan temaları yükleyin.

### 2. Pano Mağazasından

1. **Tema Yükle** penceresinde **Mağazada Ara (Browse Store)**’a tıklayın.
2. Bir tema seçin — ücretsiz veya ücretli olabilir.
3. **Yükle**’ye tıklayın ve kalan her şeyi Pano’nun otomatik olarak yapmasına izin verin.
4. Tema, kurulum tamamlandıktan sonra otomatik olarak görünecektir.

> 🛍️ Marketplace için bağlı bir [Pano Hesabı](./advanced/connect-pano-account.md) gerekir.

## 🧩 Temaları Etkinleştirme ve Yönetme

Aynı anda yalnızca **bir tema etkin** olabilir.  
Gerektiğinde etkin tema **durdurulabilir** veya **yeniden başlatılabilir**.  
Etkin tema durdurulursa, genel web sitesi **yeniden başlatılana kadar erişilemez** hale gelir.  
Bu durumda, Pano’yu yeniden başlatmanız önerilir.

Temaları yönetmek için:

1. **Panel → Görünüm → Temalar**’a gidin.
2. Bir tema seçin.
3. **Başlat (Start)** veya **Durdur (Stop)** ile etkinleştirin ya da devre dışı bırakın.

> Etkin temayı durdurmak web sitesini geçici olarak devre dışı bırakır.  
> Başka bir temayı durdurmadan önce her zaman geçerli bir temanın etkin olduğundan emin olun.

## ⚙️ Temaları Özelleştirme

Her temanın kendi yapılandırma seçenekleri vardır ve bunlar temadan temaya değişebilir.  
Genel olarak şunları özelleştirebilirsiniz:

- Renkler ve renk değişkenleri
- Üstbilgi (header) ve altbilgi (footer) düzeni
- Yazı tipleri ve tipografi
- Arka plan görselleri ve gradyanlar
- Düzen genişliği, boşluklar ve konteyner boyutu
- Site logosu, favicon veya marka öğeleri

Etkin tema ayarlarına şu bölümden erişebilir ve düzenleyebilirsiniz:  
**Panel → Görünüm → Tema Ayarları**

Değişiklikler anında uygulanır — yeniden başlatma gerekmez.

## ⚠️ Tema Kaldırma

Temalar yalnızca **detay sayfalarından** **kaldırılabilir** — genel tema listesinden kaldırılamaz.

Kaldırırken:

- Tema şu anda etkinse, Pano **otomatik olarak `vanilla-theme`’e geri döner**.
- Yerleşik UI uygulamaları (`panel-ui`, `setup-ui`, `vanilla-theme`) **silinemez, değiştirilemez veya ayrı ayrı
  güncellenemez**.
- Başlangıçta bozulmuş veya kaldırılmış oldukları tespit edilirse, Pano eksik yerleşik UI uygulamalarını otomatik olarak
  yeniden yükler.

Özel (kullanıcı) temasını silmek için:

1. **Panel → Görünüm → Temalar → [Tema Detayları]**’na gidin.
2. **Sil**’e tıklayın.
3. İşlemi onaylayın.

## 🧱 Dizin Yapısı

Temalarla birlikte örnek Pano dizin yerleşimi:

```
/pano/
├── Pano-1.0.0.jar
├── config.conf
├── panel-ui/
├── setup-ui/
├── themes/
│    ├── vanilla-theme/
│    ├── dark-matter-theme/
└── file-uploads/
```

**Önemli:**

- `panel-ui`, `setup-ui` veya `vanilla-theme`’i **değiştirmeyin** veya yerine başka bir şey koymayın.
- Bunlar Pano tarafından dahili olarak yönetilir ve eksik/bozuk olmaları halinde başlangıçta **otomatik olarak yeniden
  yüklenir**.
- Yalnızca kullanıcı tarafından yüklenen `tema klasörlerini` manuel yönetin.

## 🧠 Özet

| İşlem                  | Konum                                                   | Açıklama                                 |
|------------------------|---------------------------------------------------------|------------------------------------------|
| **Yükle (yerel)**      | `Panel → Görünüm → Temalar → Tema Yükle`                | Sürükle-bırak veya yükleme               |
| **Yükle (mağaza)**     | `Panel → Görünüm → Temalar → Tema Yükle → Mağazada Ara` | Doğrudan marketten indir                 |
| **Etkinleştir/Durdur** | `Panel → Görünüm → Temalar → Başlat/Durdur`             | Temayı etkinleştir veya devre dışı bırak |
| **Özelleştir**         | `Panel → Görünüm → Tema Ayarları`                       | Renkler, düzen, yazı tipleri             |
| **Sil**                | `Panel → Görünüm → Temalar → Tema Detayları → Sil`      | Özel temayı güvenle kaldır               |

## 🧩 Gelişmiş Notlar

- Yalnızca **geçerli temalar** listede görünür; bozuk veya eksik temalar yok sayılır.
- Her tema, **SvelteKit derleme paketi (.zip)** olarak paketlenir.
- Her temanın, otomatik oluşturulan bir **`manifest.json`** dosyası vardır — **manuel düzenlemeyin.**
- Bazı eklentiler belirli temalara, bazı temalar da belirli eklentilere bağımlıdır.
- Bazı temalar, gelişmiş işlevler için varsayılan API’leri ortaya çıkarır veya geçersiz kılar.
- Yerleşik UI uygulamaları (`panel-ui`, `setup-ui`, `vanilla-theme`) **korunur** ve değiştirilemez.
- Eksik veya bozuklarsa, Pano başlangıçta bunları otomatik olarak yeniden yükler.
- Temalar **sandbox** değildir; ancak arka uca erişimleri **yalnızca HTTP API uç noktaları** ile sınırlıdır.

> 🌈 Temalar, Pano’nuzun kişiliğini belirler — sizin dünyanız, sizin tasarımınız, sizin kimliğiniz.
