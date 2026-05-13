# Test ve Örnekler

## Örnek Proje

Örnek entegrasyon eklentisi repository'mize göz atın:

- [Örnek Entegrasyon Eklentisi](https://github.com/PanoMC/example-integration-plugin) (Referans implementasyon)

Bu repository şunları gösterir:
- Pano MC Eklentisi API dependency kurulumu
- Özel istek ve handler'lar oluşturma
- Üçüncü taraf eklentilere bağlanma
- En iyi uygulamalar ve desenler
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
    logger.info("[Debug] İstek gönderildi: ${request.getRequestType()}")
}
```
