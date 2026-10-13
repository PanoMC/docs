# Entegrasyon Geliştirmeye Başlangıç

## Entegrasyon Geliştirme Nedir?

Entegrasyon geliştirme, üçüncü taraf Minecraft eklentileri ile Pano'nun web platformu arasında sorunsuz bağlantılar oluşturmanıza olanak tanır. Pano MC Eklentisi'nin sınıflarını kullanarak şunları yapabilirsiniz:

- Oyun ve web arasında verileri senkronize etme
- Minecraft eklentinizden Pano'nun web platformuna istekler gönderme
- Pano'nun bu isteklere verdiği yanıtları alma
- Oyun içi etkinliklerden web aksiyonlarını tetikleme
- Her iki platform arasında birleşik deneyimler oluşturma
## Ön Gereksinimler

Entegrasyon geliştirmeye başlamadan önce şunlara sahip olduğunuzdan emin olun:

1. **Java Development Kit (JDK 11+)** — Pano MC Eklentisi'nin ortak kodu Java 11'i hedefler (Velocity modülü Java 17 ister)
2. **Kotlin Bilgisi** — API Kotlin'dir; yanıt beklemek bir `suspend` fonksiyondur
3. **Minecraft Eklenti Geliştirme Deneyimi** — Spigot/Paper/Bukkit API anlayışı
4. **Pano MC Eklentisi** — [GitHub Repository](https://github.com/PanoMC/pano-mc-plugin)
5. **Çalışan Bir Pano Örneği** — Entegrasyonunuzu test etmek için
6. **Bir Minecraft Test Sunucusu** — Geliştirme için Spigot, Paper veya Folia sunucusu

> **Not:** Bu rehberdeki tüm örnekler **Kotlin** dilindedir.
## Mimari Genel Bakış

Pano'nun entegrasyon sistemi üç ana bileşenden oluşur:

```
┌─────────────────────┐         ┌──────────────────────┐         ┌─────────────────┐
│  MC Eklentiniz      │ ◄─────► │  Pano MC Eklentisi   │ ◄─────► │  Pano Backend   │
│  (Entegrasyon)      │         │  (İletişim API)      │         │  (Web Platform) │
└─────────────────────┘         └──────────────────────┘         └─────────────────┘
    (Eklenti Hooks)              (Güvenli WebSocket API)          (Platform API)
```

### İletişim Akışı

1. **Eklentiniz → Pano MC Eklentisi:** İsteği onun `PlatformManager` nesnesi üzerinden gönderirsiniz
2. **Pano MC Eklentisi → Pano Backend:** Tek bir şifreli WebSocket bağlantısı (sunucu bağlanırken RSA ile anahtar değişimi, her mesaj için AES-256-GCM)
3. **Pano Backend → Eklentiniz:** İsteği Pano eklentinizin bir sunucu olayı işler; yanıtı aynı bağlantıdan geri gelir
4. **Pano Backend → Web:** Veriler saklanır ve web sitesinde görüntülenir

> **Önemli:** Pano MC Eklentisini fork'lamayın. Bunun yerine ona bağımlı, kendi ayrı eklentinizi oluşturun. Eklentiniz ikinci bir bağlantı açmaz ve ikinci bir kimlik bilgisine ihtiyaç duymaz.
