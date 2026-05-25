# Bellek ve Kaynak Limitleri

Pano düşük bütçeyle çalışacak şekilde tasarlandı — tam bir örnek (JVM **artı** spawn ettiği UI runtime'ları) **~1 GB RAM** hedefler; ayrı bir servis olarak çalışan veritabanı bu hesaba dahil değildir.

## Pano belleği nasıl kullanır

Çalışan bir örnek bağımsız işletim sistemi süreçlerinden oluşur:

1. **Pano çekirdeği (JVM)** — ana `Pano.jar` süreci. **Başlatma anında** verilen JVM bayraklarıyla (`-Xmx`, …) sınırlanır.
2. **UI runtime'ları (Bun)** — Pano sunduğu her UI için küçük bir [Bun](https://bun.sh) süreci spawn eder: `setup-ui`, `panel-ui` ve **aktif tema**. Bunlar stateless SSR render'cılardır (backend'den veri alıp HTML üretirler), bu yüzden küçük kalırlar.
3. **Veritabanı** — **ayrı** bir uygulama (MariaDB/MySQL). Onu kendi başına sınırlayın.

> **Toplam RAM ≈ JVM (`-Xmx` + metaspace + direct + ek yük) + Σ her UI runtime'ı.**
> Bunlar ayrı süreçlerdir: JVM bayrakları Bun UI'larını **sınırlamaz**, UI limiti de JVM'i **sınırlamaz**. İkisini de boyutlandırın.

## Pano çekirdeğini (JVM) sınırlama

Heap boyutu **başlangıçta** sabitlenir ve çalışırken küçülemez; bu yüzden Pano'yu başlatırken onu (ve off-heap bölgeleri) sınırlayın.

### `JAVA_TOOL_OPTIONS` (önerilen)

JVM bu ortam değişkenini otomatik okur — başlatma komutunuz olduğu gibi kalır:

```bash
export JAVA_TOOL_OPTIONS="-Xms128m -Xmx512m -XX:MaxMetaspaceSize=256m -XX:MaxDirectMemorySize=64m -XX:+UseSerialGC -XX:+ExitOnOutOfMemoryError"
java -jar Pano.jar
```

### Komut satırı bayrakları

```bash
java -Xms128m -Xmx512m -XX:MaxMetaspaceSize=256m -XX:MaxDirectMemorySize=64m -XX:+UseSerialGC -XX:+ExitOnOutOfMemoryError -jar Pano.jar
```

| Bayrak | Amaç |
| --- | --- |
| `-Xmx512m` | Maksimum heap — en büyük kaldıraç. |
| `-XX:MaxMetaspaceSize=256m` | Sınıf meta verisini sınırlar. |
| `-XX:MaxDirectMemorySize=64m` | Netty/Vert.x off-heap buffer'larını sınırlar. |
| `-XX:+UseSerialGC` | Küçük heap'ler için en düşük ek yüklü GC. |
| `-XX:+ExitOnOutOfMemoryError` | OOM'da takılmak yerine çıkar (supervisor yeniden başlatsın). |

### Docker

```dockerfile
ENV JAVA_OPTS="-Xms128m -Xmx512m -XX:MaxMetaspaceSize=256m -XX:MaxDirectMemorySize=64m -XX:+UseSerialGC -XX:+ExitOnOutOfMemoryError"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar Pano.jar"]
```

Konteynerin tamamını sınırlayın ki JVM **ve** Bun UI'ları tek bir kesin tavanı paylaşsın:

```bash
docker run --memory=1g --memory-swap=1g your-pano-image
```

### systemd (Linux host)

```ini
[Service]
Environment="JAVA_TOOL_OPTIONS=-Xms128m -Xmx512m -XX:MaxMetaspaceSize=256m -XX:MaxDirectMemorySize=64m -XX:+UseSerialGC -XX:+ExitOnOutOfMemoryError"
ExecStart=/usr/bin/java -jar /opt/pano/Pano.jar
# Tüm servisi kesin sınırla (JVM + spawn edilen UI'lar):
MemoryMax=1G
MemorySwapMax=0
```

## UI runtime'larını sınırlama (setup-ui, panel-ui, tema)

Spawn edilen Bun UI'ları için taşınabilir bir per-process hard-cap yoktur (cgroup yalnız Linux'ta, Windows Job Objects yalnız Windows'ta, macOS'ta hiçbiri), bu yüzden **Pano onları kendisi sınırlar** — çalıştığı her platformda aynı şekilde (Linux, macOS, Windows, Android):

- Bun'ı düşük-bellek modunda (`--smol`) başlatır.
- Yerleşik bir watchdog periyodik olarak her UI sürecinin resident belleğini okur ve limiti aşanı **yeniden başlatır**. Restart aynı dahili portu kullanır, böylece routing'e dokunulmaz; UI'lar stateless olduğundan güvenlidir.

Per-UI tavanını config'inizde ayarlayın (bkz. [Sunucu Yapılandırması](../server/)):

```jsonc
server {
  ui-max-memory-mb = 200   # UI runtime başına maksimum MB; 0 limiti kapatır
}
```

- UI başına varsayılan **200 MB**.
- `--smol` ile UI'lar normalde bunun baya altında kalır — limit, bir sızıntıya/kaçağa karşı güvenlik ağıdır.
- `0` zorlamayı kapatır.

## Örnek ~1 GB bütçesi

Veritabanı başka yerdeyken, JVM'e daha büyük payı verin ve genelde çalışan bir-iki UI'a (panel-ui + aktif tema) yer bırakın:

```bash
# Pano çekirdeği (JVM)
export JAVA_TOOL_OPTIONS="-Xms128m -Xmx448m -XX:MaxMetaspaceSize=256m -XX:MaxDirectMemorySize=64m -XX:+UseSerialGC -XX:+ExitOnOutOfMemoryError"
java -jar Pano.jar
```

```jsonc
// config — her UI'ı küçük tut
server {
  ui-max-memory-mb = 200
}
```

Kaba hesap: JVM ≈ 448 MB heap + ~250 MB ek yük ≈ **~700 MB**, artı 2 × ~120 MB UI ≈ **~240 MB** → **~940 MB**, 1 GB'ın rahatça altında. Trafiğinize göre `-Xmx` ve `ui-max-memory-mb` değerlerini ayarlayın.

> Veritabanı ayrıdır — ona kendi limitini verin (örn. kendi `--memory`'si olan ayrı bir konteyner).
