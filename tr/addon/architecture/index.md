# Genel Mimari

## Genel Mimari

Bir Pano eklentisi iki ana bölümden oluşur:
1.  **Eklenti Arayüzü (UI)**: Hem Panel (yönetici arayüzü) hem de Tema (genel arayüz) üzerinde çalışan Svelte tabanlı bir frontend bölümü.
2.  **Eklenti Arka Planı (Backend)**: Pano ana sunucusu ile doğrudan entegre olan Kotlin (tercih edilen) veya Java backend bölümü.

### Yapı
Aşağıdaki dizin yapısı, `pano-plugin-announcement` örneğine dayanan tipik bir Pano eklentisini göstermektedir:

```text
pano-plugin-announcement/
├── .github/workflows/          # CI/CD iş akışları (İsteğe bağlı) (örn: release.yml)
├── build.gradle.kts/           # Gradle derleme yapılandırması
├── gradle.properties/          # Eklenti manifestosu (ID, sürüm vb.)
├── package.json/               # Frontend bağımlılıkları ve komut dosyaları
├── rollup.config.js/           # Frontend derleme yapılandırması
└── src/                        # Kaynak kodu
    ├── main/
    │   ├── kotlin/             # Backend kaynak kodu
    │   │   └── com/panomc/plugins/announcement/
    │   │       ├── AnnouncementPlugin.kt  # Ana eklenti sınıfı
    │   │       ├── db/                    # Veritabanı modelleri ve tabloları
    │   │       ├── event/                 # Olay dinleyicileri (Listeners)
    │   │       ├── log/                   # Etkinlik kayıtları (Logs)
    │   │       ├── permission/            # İzin tanımları
    │   │       ├── routes/                # API rotaları
    │   │       └── util/                  # Yardımcı sınıflar
    │   └── resources/          # Backend kaynakları
    │       ├── locales/        # Çeviri dosyaları (en.json vb.)
    │       └── config.conf     # Varsayılan yapılandırma
    ├── panel/                  # Panel Arayüzü (Yönetici Arayüzü)
    │   ├── AnnouncementsPage.svelte
    │   └── components/
    ├── theme/                  # Tema Arayüzü (Genel Arayüz)
    │   └── Announcements.svelte
    └── main.js                 # Frontend giriş noktası
```

- **Mimari**:
    Pano'nun eklenti mimarisi benzersizdir; **Backend mantığını**, **Kullanıcı Arayüzünü (SSR & CSR)** ve **Veritabanı yönetimini** tek bir yapı içinde sorunsuz bir şekilde ele almak üzere tasarlanmıştır.

    Bu yapıyı geliştiriciler için olabildiğince basit ve sezgisel hale getirmeye çalışsak da, Pano'nun ihtiyaçlarına göre uyarlanmış özelleşmiş bir ortamdır.

    ::: tip Geri Bildirim
    Geliştirici deneyimini iyileştirmeye her zaman açığız. Daha iyi bir eklenti yapısı için fikirleriniz veya önerileriniz varsa, lütfen [Discord](https://discord.gg/GZvaK3wpHF) üzerinden bize ulaşın.
    :::

    Arka planda Spigot eklentileriyle benzerlikler taşır ancak yükleme için **PF4J** kullanır. Daha derin teknik detaylar için [PF4J dokümantasyonuna](https://pf4j.org/) bakabilirsiniz.
- **Manifest**: Eklentiler bir manifesto dosyası kullanılarak tanımlanır. Pano, özellikleri `gradle.properties` içinde yöneterek bunu basitleştirir. Ayrıntılar için [Manifesto Yapılandırması](../manifest/) kılavuzuna bakın.
