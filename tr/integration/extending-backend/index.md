# Pano Backend'ini Genişletme

## Pano'nun Backend'ini Genişletme (Önerilen)

Tam bir entegrasyon için, özel isteklerinizi ve mesajlarınızı işleyen bir **Pano eklentisi** (backend tarafında) oluşturmanız **şiddetle önerilir**.

### Pano Eklenti Yapısı

Özel entegrasyon mantığınızı işlemek için Pano'nun backend'inde bir eklenti oluşturun:

```kotlin
// Pano eklentinizde (backend)
class MyIntegrationPanoPlugin : PanoPlugin() {

    override fun onEnable() {
        // İstek handler'larını kaydet
        registerRequestHandler("player_join") { data, connection ->
            handlePlayerJoin(data, connection)
        }

        registerRequestHandler("player_stats") { data, connection ->
            handlePlayerStatsRequest(data, connection)
        }
    }

    private fun handlePlayerJoin(data: Map<String, Any>, connection: Connection) {
        val playerName = data["player"] as String
        val uuid = data["uuid"] as String
        
        // Veritabanına kaydet, event tetikle vb.
        database.updatePlayerLastJoin(uuid)
        
        // İsteğe bağlı yanıt gönder
        connection.sendResponse("success", mapOf("message" to "Giriş kaydedildi"))
    }

    private fun handlePlayerStatsRequest(data: Map<String, Any>, connection: Connection) {
        val uuid = data["uuid"] as String
        val stats = database.getPlayerStats(uuid)
        
        // İstatistikleri MC eklentisine geri gönder
        connection.sendResponse("player_stats_response", stats)
    }
}
```

### Pano'dan Minecraft'a Mesaj Gönderme

Pano eklentinizden bağlı Minecraft sunucularına mesaj gönderebilirsiniz:

```kotlin
// Oyuncuya ödül gönder
platformManager.sendMessage("player_reward", mapOf(
    "playerName" to "Steve",
    "reward" to "coins",
    "amount" to 100
))
```

Bu mesaj, Minecraft sunucusundaki `PlayerRewardHandler` tarafından alınacaktır.
## Güvenlik En İyi Uygulamaları

1. **Tüm Verileri Doğrulayın** — Gelen verilere doğrulama olmadan asla güvenmeyin
2. **Pano'nun Şifrelemesini Kullanın** — Tüm iletişim WebSocket üzerinden otomatik olarak şifrelenir
3. **İzinleri Kontrol Edin** — İşlemleri yürütmeden önce kullanıcı izinlerini doğrulayın
4. **Girişleri Temizleyin** — Enjeksiyon saldırılarını önleyin
5. **Hız Sınırlama** — Sık işlemler için hız sınırları uygulayın
6. **Hata Yönetimi** — Hataları her zaman düzgün bir şekilde ele alın
