# Server Management Eklentisi

::: warning Emekliye ayrıldı — sunucu yönetimi artık Pano çekirdeğinde
**Server Management** eklentisi hiçbir zaman çalışan bir özellik yayınlamadı ve emekliye ayrıldı.
Yapması planlanan her şey — panel içi konsol, başlat/durdur kontrolü ve oyuncu yönetimi — artık
**Pano'nun kendisinde** yerleşik geliyor; kuracak bir şey yok.

**→ [Sunucu Yönetimi](../../platform/server-management/)**
:::

## Ne oldu

Sunucu yönetimi başlangıçta isteğe bağlı bir eklenti olarak planlanmıştı. Boş bir iskelet olarak
kaldı: hiçbir panel sayfası, API endpoint'i, ayar veya izin kaydetmedi. Her sunucu sahibinin bulup
kurması gereken bir eklenti olarak yayınlamak yerine, özellikler doğrudan mevcut Minecraft sunucu
bağlantısını kullanabilecekleri yere — platformun içine — taşındı.

`pano-plugin-server-management` deposu arşivlendi ve eklentisi yayınlanmıyor. Bir zamanlar
kurduysanız, jar dosyasını `plugins/` klasörünüzden gönül rahatlığıyla silebilirsiniz — hiçbir işe
yaramıyor.

## Özellikler şimdi nerede

Bir Minecraft sunucusunu [Pano MC Eklentisi](../../platform/integrations/) ile bağlayın ve
**Panel → Sunucular** sayfasını açın. Her sunucuda şunlar bulunur:

- **Konsol** — komut girişi olan canlı sunucu günlüğü.
- **Oyuncular** — atma, mesaj, OP, gamemode ve whitelist işlemleriyle çevrimiçi oyuncu listesi.
- **Eklentiler** — kurulu eklenti ve mod listesi; Bukkit ailesindeki sunucularda açma/kapatma.
- **Güç** — durdurma ve yeniden başlatma.
- **Ölçümler** — TPS, MSPT, bellek, CPU ve oyuncu geçmişi.
- **Dosyalar**, **Yedekler** ve **Zamanlanmış görevler** — sunucunun kendi klasörü, arşivleri ve cron
  görevleri; bunları eklenti sunucunun içinden sunar.

## Pano MC Eklentisi tek başına çalışır

Bunların hiçbiri [`pano-node`](../../platform/server-management/pano-node/) arka plan sürecini
gerektirmez. İçinde yalnızca Pano MC Eklentisi olan bir sunucu, panelde tam yetkili bir sunucudur:
eklenti bağlanırken neler yapabildiğini bildirir — şu anda

```
console, commands, power, metrics, players, plugins, files, backups, plugin-install, schedules
```

— Pano da tam olarak bunları sunar. Düğüm, oyunun dışındaki bir sürecin yapabildiği ve başka hiçbir
şeyin yapamadığı şeyleri ekler: **Başlat** ile **Öldür**, duran bir sunucunun konsolu, sunucu
oluşturma ve yeniden kurma, bir de anında yedek geri yükleme. İkisi birden varsa her özelliği, o işi
daha iyi yapan taraf üstlenir; yalnızca biri varsa onu o taraf yapar. Eski bir eklenti daha az yetenek
bildirir ve Pano, kalanlar için düğüme devreder.

Özellik özellik hazırlanmış tablo:
**[Hangi özellik neyle çalışır](../../platform/server-management/what-works-with-what/)**.
Gereksinimler, izin node'ları ve platformlar arası farklar dâhil tüm belgeler ise
[Sunucu Yönetimi](../../platform/server-management/) sayfasındadır.
