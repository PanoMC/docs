# Konteyner Yapılandırması

Konteynerde Pano her şeyi **`/data`** biriminde tutar; veritabanı ve e-posta ayarlarını Kurulum
Sihirbazı yerine **ortam değişkenlerinden** alabilir.

> [!WARNING]
> **Henüz yayınlanmadı.** Ortam değişkeni desteği konteyner imajlarıyla birlikte gelecek. Adlar yayından
> önce değişebilir. Bkz. [Pano'yu Konteynerle Çalıştırma](../).

## `/data` birimi {#the-data-volume}

`/data`, Pano'nun yazdığı tek yerdir. Buraya bir birim ya da klasör bağlayın ve yedekleyin.

| `/data` içinde | Nedir |
| --- | --- |
| `Pano-<version>.jar` ve arayüzler | Pano sürümü (`pano-runtime` imajıyla) |
| `.pano-jar` | Başlatıcının çalıştırdığı jar'ın dosya adı. Bkz. [Konteyner modu](../runtime/#container-mode) |
| `config.conf` | Pano'nun [yapılandırma dosyası](../../configuration/) |
| `plugins/`, yüklemeler, loglar | Pano'nun çalışırken oluşturduğu her şey |

Konteynerin geri kalanı **salt okunur** kalabilir; Pano'nun yalnızca `/data`'ya ve geçici bir `/tmp`'ye
ihtiyacı vardır. Pano Host her Pano Instance'ı bu şekilde çalıştırır.

## Ortam değişkenleri {#environment-variables}

Pano ilk açılışta bu değişkenleri `config.conf` dosyasına yazar; böylece veritabanını ve e-posta
sunucusunu baştan bilir.

| Değişken | Ayarladığı |
| --- | --- |
| `PANO_DB_HOST` | Veritabanı sunucusu |
| `PANO_DB_NAME` | Veritabanı adı |
| `PANO_DB_USER` | Veritabanı kullanıcısı |
| `PANO_DB_PASSWORD` | Veritabanı şifresi |
| `PANO_SMTP_HOST` | SMTP sunucusu |
| `PANO_SMTP_PORT` | SMTP portu |
| `PANO_SMTP_USER` | SMTP kullanıcısı |
| `PANO_SMTP_PASSWORD` | SMTP şifresi |

Örnek:

```bash
docker run -d --name pano \
  -e PANO_DB_HOST=mariadb \
  -e PANO_DB_NAME=pano \
  -e PANO_DB_USER=pano \
  -e PANO_DB_PASSWORD=change-me \
  -v pano-data:/data \
  ghcr.io/panomc/pano:<version>
```

Şifreleri kabuk geçmişinde bırakmayın: `--env-file` ya da orkestratörünüzün secret yönetimini kullanın.

### Pano Host değişkenleri {#pano-host-variables}

Pano Host birkaç değişken daha ayarlar. Kendi kurulumlarınız için bunlara ihtiyacınız yoktur.

| Değişken | Amacı |
| --- | --- |
| `PANO_HOSTED` | `pano-host`, instance'ı Pano Host tarafından yönetilen olarak işaretler. Yalnızca bilgi amaçlıdır: panel "Pano Host tarafından yönetiliyor" ve kota bildirimlerini gösterir, hiçbir şey kilitlenmez |
| `PANO_HOST_WORKLOAD_ID` | Instance'ın Pano Host'taki kimliği |
| `PANO_HOST_INSTANCE_SECRET` | Instance'ın panomc.com'dan gelen panel girişlerini doğrulamasını ve bildirimlerini okumasını sağlar |
| `PANO_HOST_API_URL` | Pano Host API adresi |

Eski Pano sürümleri bu değişkenlerin hiçbirini dikkate almaz.

## config.conf {#config-conf}

Pano **kapanırken `config.conf` dosyasını yeniden yazar**. Konteyner çalışırken yapılan bir düzenleme
bir sonraki durdurmada kaybolur. Bir ayarı elle değiştirmek için:

1. Konteyneri durdurun (`docker stop pano`) ve tamamen kapanmasını bekleyin.
2. `/data/config.conf` dosyasını düzenleyin.
3. Konteyneri yeniden başlatın.

Panelden değiştirilebilen ayarları orada değiştirmek daha güvenlidir. Ortam değişkeni desteği olmayan
eski Pano sürümlerinde de aynı sıra işe yarar: `config.conf` oluşsun diye bir kez başlatın, durdurun,
ayarlarınızı ekleyin, başlatın.
