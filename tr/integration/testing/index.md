# Test ve Örnekler

## Örnek Proje

Ayrı bir örnek repository yoktur. Referans, Pano MC Eklentisi'nin kendi mesajlarıdır; eklentinizle aynı sınıfları kullanırlar:

- [İstekler](https://github.com/PanoMC/pano-mc-plugin/tree/alpha/Core/src/main/kotlin/com/panomc/plugins/pano/core/platform/request) (örneğin `GetPlayerInfoRequest`)
- [Yanıtlar](https://github.com/PanoMC/pano-mc-plugin/tree/alpha/Core/src/main/kotlin/com/panomc/plugins/pano/core/platform/message/response) (örneğin `GetPlayerInfoMessage`)
## Entegrasyonunuzu Test Etme

### Yerel Test

1. Eklentinizi build edin:
```bash
./gradlew build
```

2. JAR dosyasını test sunucunuzun `plugins/` klasörüne kopyalayın
3. Pano MC Eklentisinin kurulu ve bağlı olduğundan emin olun
4. Hedef eklentinizi kurun
5. Sunucuyu başlatın ve işlevselliği test edin

### Hata Ayıklama (Debugging)

Eklentinizde hata ayıklama günlüğünü etkinleştirin:

```kotlin
if (config.getBoolean("debug", false)) {
    logger.info("[Debug] İstek gönderildi: ${request::class.simpleName} (${request.eventId})")
}
```
