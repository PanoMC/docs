# Docker ile Kurulum

Docker, [`.jar` kurulumuna](../installation/) bir alternatiftir: tek bir imaj Java'yı, Pano'yu ve Pano'nun
çalışması için gereken her şeyi içerir. [Pano Host](https://panomc.com/host) her Pano Instance'ı aynı
şekilde çalıştırır. [Yapılandırma](configuration/) ortam değişkenlerini ve `/data` birimini,
[Çalışma Ortamı](runtime/) ise güncellemeyi, runtime imajını, Java'yı ve belleği anlatır.

> [!NOTE]
> İmajlar Pano **1.0.0-alpha.520** sürümünden itibaren yayınlanır. Daha eski sürümler yalnızca `.jar` olarak gelir.

## İmaj

Tüm etiketler herkese açık tek bir pakette, `ghcr.io/panomc/pano-web-platform`, **amd64** ve **arm64** için:

| Etiket | Ne alırsınız |
| --- | --- |
| `latest` | En yeni kararlı sürüm. 1.0.0 çıkana kadar: en yeni beta (beta imajı yokken en yeni alpha) |
| `beta`, `alpha` | O ön sürüm kanalının en yeni sürümü |
| `<version>`, ör. `1.0.0-alpha.520` | Tam olarak o sürüm, hiç değişmez |
| `runtime-jre<N>` | Java `N` ve başlatıcı, Pano **yok**. Bkz. [Runtime imajı](runtime/#runtime-image) |

İmaj Pano'yu Java 11 üzerinde root olmayan bir kullanıcıyla çalıştırır. Pano yine de bir **MySQL veya
MariaDB** veritabanına ihtiyaç duyar; aşağıdaki iki örnek de yanında bir MariaDB başlatır.

## Docker Compose (önerilen) {#compose}

1. Bir klasör oluşturun ve içine şu `compose.yaml` dosyasını koyun:

   ```yaml
   # Pano with MariaDB, the self-host Docker install (docs mirror this file 1:1).
   #   echo "PANO_DB_PASSWORD=$(openssl rand -hex 24)" > .env
   #   docker compose up -d        # then open http://<server>:8088 and finish the setup wizard
   # PANO_TAG picks the image tag (latest, beta, alpha or a version such as 1.0.0), PANO_PORT the host port.
   # latest = newest stable release, or the most stable prerelease channel until 1.0.0 ships.
   name: pano

   services:
     pano:
       image: ghcr.io/panomc/pano-web-platform:${PANO_TAG:-latest}
       restart: unless-stopped
       depends_on:
         db:
           condition: service_healthy
       environment:
         PANO_DB_HOST: db
         PANO_DB_PORT: "3306"
         PANO_DB_NAME: pano
         PANO_DB_USER: pano
         PANO_DB_PASSWORD: ${PANO_DB_PASSWORD:?set PANO_DB_PASSWORD in .env}
       ports:
         - "${PANO_PORT:-8088}:8088"
       volumes:
         - pano-data:/data

     db:
       image: mariadb:11.4
       restart: unless-stopped
       environment:
         MARIADB_DATABASE: pano
         MARIADB_USER: pano
         MARIADB_PASSWORD: ${PANO_DB_PASSWORD:?set PANO_DB_PASSWORD in .env}
         MARIADB_RANDOM_ROOT_PASSWORD: "1"
       healthcheck:
         test: ["CMD", "healthcheck.sh", "--connect", "--innodb_initialized"]
         interval: 5s
         timeout: 5s
         retries: 30
       volumes:
         - db-data:/var/lib/mysql

   volumes:
     pano-data:
     db-data:
   ```

2. Veritabanı şifresiyle bir `.env` dosyası oluşturun ve iki konteyneri başlatın:

   ```bash
   echo "PANO_DB_PASSWORD=$(openssl rand -hex 24)" > .env
   docker compose up -d
   ```

   Pano'yu 80 portunda sunmak için `.env` dosyasına `PANO_PORT=80`, başka bir etiket için
   `PANO_TAG=beta` (ya da bir sürüm) ekleyin.

3. `http://<sunucu-ip-adresiniz>:8088/` adresini açın ve [Kurulum Sihirbazı](../installation/)'nı
   izleyin. Veritabanı adımı ortam değişkenlerinden önceden doldurulmuştur; `PANO_DB_PASSWORD` kullanılsın diye şifreyi boş bırakın.

## docker run {#docker-run}

Compose olmadan Pano'yu ve MariaDB'yi aynı ağa koyun:

```bash
docker network create pano
docker run -d --name pano-db --network pano --restart unless-stopped \
  -e MARIADB_DATABASE=pano -e MARIADB_USER=pano -e MARIADB_PASSWORD=change-me \
  -e MARIADB_RANDOM_ROOT_PASSWORD=1 -v pano-db:/var/lib/mysql mariadb:11.4
docker run -d --name pano --network pano --restart unless-stopped -p 8088:8088 \
  -e PANO_DB_HOST=pano-db -e PANO_DB_NAME=pano -e PANO_DB_USER=pano -e PANO_DB_PASSWORD=change-me \
  -v pano-data:/data ghcr.io/panomc/pano-web-platform:latest
```

Zaten bir veritabanı sunucunuz mu var? İlk iki komutu atlayın ve `PANO_DB_HOST`'u ona yönlendirin.

## Bilmekte fayda var

- Pano'nun yazdığı her şey **`/data`** biriminde durur. Onu veritabanıyla birlikte yedekleyin. Bkz.
  [`/data` birimi](configuration/#the-data-volume).
- Konteyner çalışırken `config.conf` dosyasını **düzenlemeyin**. Bkz. [config.conf](configuration/#config-conf).
- `docker compose stop` ya da `docker stop pano` ile durdurun; Pano düzgünce kapanır ve yapılandırmasını kaydeder.
- Güncellemek için daha yeni bir etiket çekin. Bkz. [Güncelleme](runtime/#upgrading).
- Pano'yu başkaları için mi çalıştırıyorsunuz? [Başkaları için Pano Instance Barındırma](../hosting/) modeli anlatır.
