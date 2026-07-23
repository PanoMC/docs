# Entegrasyon Geliştirmeye Başlangıç

## Entegrasyon Geliştirme Nedir?

Entegrasyon geliştirme, üçüncü taraf Minecraft eklentileri ile Pano'nun web platformu arasında sorunsuz bağlantılar oluşturmanıza olanak tanır. Pano MC Eklentisi API'sini kullanarak şunları yapabilirsiniz:

- Oyun ve web arasında verileri gerçek zamanlı senkronize etme
- Minecraft eklentinizden Pano'nun web platformuna istekler gönderme
- Pano'dan mesajlar alma ve işleme
- Oyun içi etkinliklerden web aksiyonlarını tetikleme
- Her iki platform arasında birleşik deneyimler oluşturma
## Ön Gereksinimler

Entegrasyon geliştirmeye başlamadan önce şunlara sahip olduğunuzdan emin olun:

1. **Java Development Kit (JDK 17+)** — Eklenti geliştirme için gerekli
2. **Java veya Kotlin Bilgisi** — Pano MC Eklentisi API'si ile her iki dili de kullanabilirsiniz
3. **Minecraft Eklenti Geliştirme Deneyimi** — Spigot/Paper/Bukkit API anlayışı
4. **Pano MC Eklentisi API** — [GitHub Repository](https://github.com/PanoMC/pano-mc-plugin)
5. **Çalışan Bir Pano Örneği** — Entegrasyonunuzu test etmek için
6. **Bir Minecraft Test Sunucusu** — Geliştirme için Spigot, Paper veya Folia sunucusu

> **Not:** Bu rehberdeki tüm örnekler kolaylığınız için hem **Kotlin** hem de **Java** dilinde sağlanmıştır.
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

1. **Eklentiniz → Pano MC Eklentisi API:** İstek veya mesaj göndermek için API'yi kullanırsınız
2. **Pano MC Eklentisi → Pano Backend:** Güvenli şifreli WebSocket iletişimi (RSA + AES-256)
3. **Pano Backend → Eklentiniz:** Pano otomatik olarak bağlantıları yönetir ve mesajları geri yönlendirir
4. **Pano Backend → Web:** Veriler senkronize edilir ve web sitesinde görüntülenir

> **Önemli:** Pano MC Eklentisini fork'lamayın. Bunun yerine kendi ayrı eklentinizi oluşturun ve Pano MC Eklentisi API'sini kullanın.
