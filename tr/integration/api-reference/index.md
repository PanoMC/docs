# API Referansı

## API Referansı

### PlatformManager Metotları

```kotlin
interface PlatformManager {
    // Pano'ya istek gönder
    fun sendRequest(request: PlatformRequest)
    
    // Mesaj handler'ı kaydet
    fun registerMessageHandler(handler: PlatformMessageHandler<*>)
    
    // Pano'ya bağlı mı kontrol et
    fun isConnected(): Boolean
    
    // Bağlantı durumunu al
    fun getConnectionStatus(): ConnectionStatus
}
```

### PlatformRequest

```kotlin
abstract class PlatformRequest {
    abstract fun getRequestType(): String
    abstract fun getData(): Map<String, Any>
}
```

### PlatformMessageResponse

```kotlin
interface PlatformMessageResponse {
    fun onResponse(response: Map<String, Any>)
    fun onError(error: String)
}
```

### PlatformMessageHandler

```kotlin
abstract class PlatformMessageHandler<R : PlatformMessage> {
    abstract fun handle(message: R)
    abstract fun getMessageType(): String
}
```
## Yardıma mı İhtiyacınız Var?

- **Discord:** [Geliştirme kanalımıza](https://discord.gg/6vVy72wgXT) katılın
- **GitHub Discussions:** [Pano MC Eklentisi Discussions](https://github.com/PanoMC/pano-mc-plugin/discussions)
- **Issue Tracker:** [Hata bildirin veya özellik isteyin](https://github.com/PanoMC/pano-mc-plugin/issues)
- **Örnek Proje:** [Referans İmplementasyon](https://github.com/PanoMC/example-integration-plugin)
## İlgili Dokümantasyon

- [Platform Entegrasyonları](../../platform/integrations/)
- [AuthMeReloaded Entegrasyonu](../../platform/integrations/authme/)
- [Pano MC Eklentisi Repository](https://github.com/PanoMC/pano-mc-plugin)
- [Addon Geliştirme](../../addon/getting-started/)

> Mutlu kodlamalar!
