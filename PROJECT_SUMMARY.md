# Pano Project Overview

## 🎯 Proje Tanımı

**Pano**, Minecraft için geliştirilmiş ileri seviye bir web platformudur. Geleneksel web scriptlerinden farklı olarak,
tek bir JAR dosyası ile çalıştırılabilen, CMS benzeri özelliklere sahip kapsamlı bir platformdur.

### 🚀 Temel Amaçlar

- **Oyun İçi Entegrasyon:** LuckPerms, AuthMe Reloaded ve Ban yönetim sistemleri ile sorunsuz ve derinlemesine entegrasyon sağlar.
- **Kesintisiz Etkileşim:** Oyuncular oyundan çıksa dahi, web platformu üzerinden oyun içi dinamiklerle etkileşimde kalmalarını sürdürmeyi amaçlar.
- **Kapsamlı Sunucu Yönetimi:** Sunucu başlatma, durdurma, restart işlemlerinin yanı sıra komut yönetimi, dosya yönetimi ve eklenti (plugin) yönetimi gibi yönetimsel araçlar sunar.
- **Kullanım Kolaylığı:** Tıpkı Spigot/Paper gibi tek bir JAR dosyası üzerinden, ek bir web sunucusu kurulumuna ihtiyaç duymadan (alışılmış düzen) çalıştırılabilir.


---

## 🏗️ Teknik Mimari

### Backend

- **Dil:** Kotlin

- **Framework:** Vert.x

- **Dependency Injection:** Spring DI

- **Runtime:** JVM 11+

- **Database:** MySQL 5.5+ / MariaDB

- **Ağ (Portlar):**
  - **Port 80 (HTTP):** Kurulum ve arayüz erişimi için açık olmalıdır.
  - **Port 443 (HTTPS):** (Opsiyonel) Kurulum tamamlandıktan sonra SSL yapılandırılmışsa açık olmalıdır.

### Frontend

- **Framework:** SvelteKit

- **UI Framework:** Bootstrap 5, Animate.css

- **Runtime & Package Manager:** Bun (Host için), Rollup (Pluginler için)

- **Style:** SASS desteği

- **Dil:** JavaScript (TypeScript kullanılmıyor)

### Mimari Özellikler

- **SSR (Server-Side Rendering):** SEO odaklı

- **Microservices:** Her arayüz ayrı portta çalışır

- **Reverse Proxy:** Backend gerekli arayüze otomatik yönlendirme yapar

- **Build:** Tek .jar dosyası olarak dağıtılır (Paper, Spigot, Bungeecord benzeri)

- **İletişim:** WebSocket protokolü (MC Plugin ↔ Backend)

- **Güvenlik:** End-to-end encryption (RSA + AES-256 hybrid)

- **Multi-Server:** Birden fazla Minecraft sunucusu bağlantısı

---

## 📦 Dağıtım ve Build Süreci

### Deployment Yapısı

1. Her UI projesi ayrı ayrı `.zip` olarak build edilir

2. ZIP dosyaları GitHub'dan indirilip JAR içine eklenir

3. Pano ayağa kalkarken:

&nbsp; - UI ZIP dosyalarını extract eder

&nbsp; - Platforma özgü Bun portable runtime'ı indirir (örn: ARM 64-bit)

&nbsp; - Config.conf dosyası oluşturur

&nbsp; - `plugins/` klasörü oluşturur

&nbsp; - `themes/` klasörü oluşturur

### CI/CD

- **Platform:** GitHub Actions

- **Release:** Tüm projeler GitHub Releases'e otomatik publish edilir

---

## 🔄 Release Döngüsü

| Release Türü | Branch | Stabilite | Açıklama |

|-------------|--------|-----------|-----------|

| **Alpha** | `alpha` | Düşük | Aktif geliştirme, sık güncellemeler, breaking changes olabilir |

| **Beta** | `beta` | Orta | Pre-release, daha stabil |

| **Release** | `main` | Yüksek | Production-ready, en stabil versiyon |

---

## 📁 Proje Yapısı

### 1. **panel-ui**

- Pano'nun yönetim arayüzü

- SvelteKit + Bootstrap 5

- Build: ZIP dosyası

### 2. **setup-ui**

- İlk kurulum arayüzü

- Sadece ilk başta görünür, kurulum sonrası devre dışı kalır

- SvelteKit + Bootstrap 5

- Build: ZIP dosyası

### 3. **vanilla-theme**

- Default tema

- Tüm temaların base'i

- **Önemli:** Tüm temalar vanilla-theme fork'u olmak zorunda

- Build: ZIP dosyası

### 4. **pano-mc-plugin**

- Minecraft sunucu entegrasyonu

- **Desteklenen Platformlar:**

&nbsp;- Spigot

&nbsp;- Paper

&nbsp;- Folia

&nbsp;- Bungeecord

&nbsp;- Velocity

&nbsp;- Core (sadece API JAR'ı)

- **Plugin Entegrasyonları:**

&nbsp;- AuthMeReloaded

&nbsp;- Diğer auth pluginleri

&nbsp;- Ban pluginleri

&nbsp;- Permission pluginleri

- **Bağlantı:**

&nbsp;- Birden fazla Minecraft sunucusu Pano'ya bağlanabilir

&nbsp;- WebSocket üzerinden iletişim

&nbsp;- End-to-end encrypted

- **Build:** Her platform için ayrı JAR dosyası

- **Dağıtım:** GitHub Releases

### 5. **website** (Kapalı Kaynak)

- Pano'nun resmi web sitesi

- **Özellikler:**

&nbsp;- Marketplace (resource pazarı)

&nbsp;- Üyelik sistemi

&nbsp;- Tema ve addon paylaşım sistemi

- **Deployment:** Cloudflare (Serverless, SSR destekli)

- **URL:**

&nbsp;- Dev: `https://dev.panomc.com` (şu anki aktif)

&nbsp;- Production: `https://panomc.com` (yakında)

- `/docs` altında documentation barındırır

### 6. **website-backend** (Kapalı Kaynak)

- Website'in backend servisi

- **Framework:** Parsek (Kotlin + Vert.x)

- **Deployment:** Coolify (VPS üzerinde)

- **CI/CD:** Otomatik deployment

### 7. **docs**

- Proje dokümantasyonu

- **Framework:** VitePress

- **Dil:** JavaScript

- **Build:** Website projesi tarafından indirilip `/docs` altına yerleştirilir

---

## 🔒 Güvenlik ve İletişim

### WebSocket Bağlantısı (MC Plugin ↔ Pano Backend)

Pano ile Minecraft sunucuları arasındaki iletişim WebSocket protokolü üzerinden gerçekleşir ve end-to-end şifreleme
kullanır.

#### Encryption Mekanizması (Hybrid Encryption: RSA + AES)

**Bağlantı Kurulum Adımları:**

1. **RSA Key Pair Oluşturma (Plugin)**

&nbsp; - Plugin sunucuda bir RSA key pair oluşturur

&nbsp; - Public key base64 encoded şekilde Pano backend'e gönderilir

2. **AES Key Oluşturma (Backend)**

&nbsp; - Pano backend 256-bit AES key oluşturur

&nbsp; - AES key, plugin'den gelen RSA public key ile encrypt edilir

&nbsp; - Encrypted AES key, base64 encoded şekilde plugin'e geri gönderilir

3. **AES Key Decrypt (Plugin)**

&nbsp; - Plugin, RSA private key'i kullanarak encrypted AES key'i decrypt eder

&nbsp; - AES key'i güvenli şekilde saklar

4. **Mesajlaşma**

&nbsp; - Her mesaj gönderiminde her iki taraf da kaydedilmiş AES key'i kullanır

&nbsp; - Tüm mesajlar AES-256 ile encrypt/decrypt edilir

&nbsp; - End-to-end encryption sağlanmış olur

**Güvenlik Özellikleri:**

- ✅ RSA public-key cryptography (key exchange için)

- ✅ AES-256 symmetric encryption (mesajlaşma için)

- ✅ Base64 encoding

- ✅ End-to-end encryption

- ✅ Her bağlantı için unique AES key

---

## 🔌 Eklenti Sistemi

### Addon Sistemi

- **Backend:** Plugin olarak geçer (Kotlin/Java)

- **Frontend:** Addon olarak geçer (Svelte)

- **Genel Bilgiler:**
  - **Lisans:** MIT
  - **Repository:** `panomc/` altında
  - **Manifest:** `gradle.properties` (id, name, description, dependencies, main class)

- **Yetenekler:**

&nbsp;- Seçili temaya özellik ekleme

&nbsp;- Panel'e özellik ekleme

&nbsp;- Mevcut özellikleri değiştirme

&nbsp;- Özellikleri kaldırma

### Eklenti Dosya Yapısı

- `src/panel/`: Panel'e özel mantık ve sayfalar
- `src/theme/`: Temaya özel mantık ve sayfalar
- `src/panel/components/`: Panel arayüz bileşenleri
- `src/theme/components/`: Tema arayüz bileşenleri
- `src/panel/modals/`, `src/theme/modals/`: Modal bileşenleri
- `src/panel/pages/`, `src/theme/pages/`: Sayfa bileşenleri
- `main.js`: Panel ve Tema tanımlarının kaydedildiği ana dosya

### Tema Sistemi

- Vanilla-theme tabanlı

- Özelleştirilebilir

- Addon desteği

---

## 🏛️ Resmi Eklentiler

Pano ekibi tarafından geliştirilen ve desteklenen resmi eklentiler:

- **pano-plugin-announcement:** Duyuru yönetimi eklentisi. Panel üzerinden duyurular oluşturmanıza ve yönetmenize olanak tanır.

---

## 🛠️ UI Eklenti Geliştirme (Hızlı Yöntem)

UI tarafında eklenti geliştirirken hızlıca test etmek için aşağıdaki adımları izleyebilirsiniz:

1.  Eklenti dosyalarınızı doğrudan `plugins/` klasörü altına yerleştirin.
2.  `bun dev` komutunu çalıştırarak geliştirme sunucusunu başlatın.
3.  Sayfayı yenileyerek değişiklikleri anında görebilirsiniz.

> [!IMPORTANT]
> Geliştirdiğiniz UI eklentisinin çalışabilmesi için **Panel -> Ayarlar -> Dev Mode** seçeneğinin aktif olması gerekmektedir.

---

## 🛠️ Pano SDK

Pano ekosistemi için geliştirilen resmi SDK:

- **Paket Adı:** `@panomc/sdk` (npm üzerinden erişilebilir)
- **Versiyonlar:**
  - `master`: Stabil (production-ready) versiyon.
  - `dev`: En güncel, geliştirme aşamasındaki versiyon.
- **Amacı:** Host (Pano) ile pluginler arasında bir köprü görevi görür. Eklentilere API erişimi ve hazır component'ler (Component Provider) sağlar.
- **Yetenekler:**
  - **SvelteKit Wrappers:** `page`, `base`, `navigating`, `browser`, `goto`, `invalidate`, `invalidateAll` erişimi sağlar.
  - **API Araçları:** `ApiUtil` (network request) ve `buildQueryParams`.
  - **Localization:** `_` (underscore) fonksiyonu ile namespace bazlı çeviri desteği.
  - **Component Provider:** `viewComponent` ile dinamik import ve Svelte hydration desteği.
  - **UI Kayıt:** `pano.ui.page.register` ile yeni rotalar ekleme.
  - **Navigasyon:** `pano.ui.nav.site.editNavLinks` ile dinamik menü düzenleme.
  - **Ortam Bilgisi:** `pano.isPanel` ile admin paneli kontrolü.
  - **UI Bildirimleri:** `pano.utils.toast` ve `pano.utils.tooltip`.
  - **Yaşam Döngüsü:** `onLoad(pano)` ve `onUnload()` hook'ları.
- **Entegrasyon Yapısı:**
  - **Development (UI):** `panel-ui`, `vanilla-theme` ve `setup-ui` gibi projelerde SDK, `src/pano-sdk` dizini altında bir **Git Submodule** olarak eklenmiştir ve projeyle birlikte derlenir. Bu projeler SDK'yı bir **Host** olarak kullanır.
  - **Production (Plugin):** Eklentiler SDK'yı bir **Client** gibi kullanır; npm paketi (`@panomc/sdk`) üzerinden projeye dahil edilir.

---

## 👥 Takım Yapısı

| Rol | Sorumluluklar |

|-----|---------------|

| **Lead Developer** | Backend + Frontend geliştirme |

| **Designer & UI Coder** | Tasarım, Bootstrap SASS, CSS |

**Toplam:** 2 kişi

---

## 🛠️ Geliştirme Standartları

### Frontend Bilgileri
- **Kod Sıralaması:** Svelte dosyalarında sıralama: `<head>`, `<styles>`, `<html>`, `<script module>`, `<script>`.
- **Dinamik Yükleme:** Pano API'sine kayıtlı bileşenler, yükü azaltmak için dinamik (lazy) yüklenmelidir.
- **Format:** Kodlar her zaman **Prettier** ile formatlanmalıdır.
- **Tasarım:** Tasarımlar `panel-ui` ve `vanilla-theme` ile tutarlı olmalı. Tablo yapıları (arama, pagination) mevcut sayfaları taklit etmelidir.
- **Eklenti Ayarları:** Genel ayarlar, karmaşık bir yapı gerekmiyorsa ayrı bir sayfa yerine **Addon Detail** sayfasındaki Hook'lar kullanılarak entegre edilmelidir.

### Backend Bilgileri
- **Plugin Lifecycle:** `PanoPlugin` sınıfı extend edilir. `onStart` ve `onUninstall` kullanılır.
- **Context Yönetimi:** `applicationContext` (Host), `pluginBeanContext` (Plugin içi), `pluginGlobalBeanContext` (Eklentiler arası).
- **Setup Entegrasyonu:** Veritabanı işlemleri için Pano kurulumunun bitmesi (`SetupEventListener`) beklenmelidir.
- **Database:** `@DBEntity`, `@Migration`, `@Dao` anotasyonları kullanılır. Enum kullanımı statik stringlere tercih edilmelidir.
- **API Yapısı:** `PanelApi` (admin) ve `LoggedInApi` (kullanıcı) tipleri kullanılır.
- **Activity Logs:** Tüm `PanelApi` endpointleri için activity log tanımlanması **zorunludur**.
- **Permissions:** `PanelPermission` extend edilerek ve `@PermissionDefinition` anotasyonuyla tanımlanır.
- **Config:** `PluginConfigManager` kullanılır. Ayarlarda statik string yerine **Enum** kullanımı zorunludur.

---

## 🌐 Çeviri ve Dil Desteği

- **Desteklenen Diller:** Türkçe (tr), İngilizce (en), Rusça (ru).
- **Namespace:** Eklentiler kendi namespace'lerini (`plugins.plugin-id.*`) kullanır.
- **Activity Logs Çevirisi:** Activity log mesajları da çeviri dosyalarında tanımlanmalıdır.

---

## 🌐 Resource Terminolojisi

**Resource:** Tema ve addonların genel ve ortak ismi

- Temalar = Resource

- Addonlar = Resource

Website üzerinde "resource" paylaşımı bu iki türü kapsar.

---

## 📝 Notlar

1. Pano, geleneksel web scriptler gibi kurulmaz - tek JAR dosyası ile çalışır

2. Her arayüz farklı portlarda çalışır, backend reverse proxy yapar

3. Tüm UI projeleri Bun runtime kullanır

4. SEO odaklı tasarım (SSR sayesinde)

5. Platform bağımsız Bun runtime otomatik indirilir

6. GitHub Actions ile tam otomatik CI/CD pipeline

7. Birden fazla Minecraft sunucusu aynı Pano instance'ına bağlanabilir

8. WebSocket iletişimi end-to-end encrypted (RSA + AES-256 hybrid encryption)

---

## 🔗 Kaynaklar

- **Production URL:** https://panomc.com (yakında)

- **Dev URL:** https://dev.panomc.com

- **Docs:** /docs endpoint üzerinden erişilebilir

- **Releases:** GitHub Releases sayfaları

### ⚖️ Lisans

Pano core platformu **GNU General Public License v3.0 (GPLv3)** ile lisanslanmıştır. Ancak, Pano için geliştirilen **Addonlar ve Temalar** bağımsız olarak lisanslanabilir (Kapalı kaynak veya ticari olabilir).

---

### 🔒 Premium Plugin DRM

Pano, plugin yazarlarının panomc.com store üzerinden ücretli plugin satabilmesi için merkezi bir DRM/lisanslama sistemi içerir:

- Premium plugin'ler `onStart()`'ta `panomc.com`'dan kısa ömürlü (1h) RS256 JWT ister.
- Token `(panoPlatformId, resourceId, version, jarSha256)`'a bağlı; başka bir Pano'da veya patch'lenmiş bir JAR'da geçersizdir.
- Plugin token'ı kendi gömülü pubkey'i ile bağımsız doğrular (host'a güvenmez).
- Lisansı geçersiz olan premium plugin başlamaz; Pano normal çalışmaya devam eder, hata panel UI'da (per-addon badge, addon detay license card, dashboard banner) gösterilir.
- Detaylı tasarım: [`/documentation/DRM_LICENSE_SYSTEM.md`](DRM_LICENSE_SYSTEM.md).

---

_Son Güncelleme: 2025_
