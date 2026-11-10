# Docker ile Kurulum

Docker, [tek komutla kuruluma](../installation/installer/) ve [`.jar` kurulumuna](../installation/manual/) bir alternatiftir: tek bir imaj Java'yı, Pano'yu ve Pano'nun
çalışması için gereken her şeyi içerir. [Pano Host](https://panomc.com/host) her Pano Instance'ı aynı
şekilde çalıştırır. [Yapılandırma](configuration/) ortam değişkenlerini ve `/data` birimini,
[Çalışma Ortamı](runtime/) ise güncellemeyi, runtime imajını, Java'yı ve belleği anlatır.

En hızlı yol, tek komutla kurulumun [Docker modudur](../installation/installer/#docker): `curl -fsSL https://panomc.com/install | bash -s -- --docker`
aşağıdaki Compose dosyasını (ek olarak bir bellek sınırıyla) ve `.env` dosyasını yazar, ardından başlatır. Bu sayfa aynısını elle yapar.

> [!NOTE]
> İmajlar Pano **1.0.0-alpha.522** sürümünden itibaren yayınlanır. Daha eski sürümler yalnızca `.jar` olarak gelir.

## İmaj

Tüm etiketler herkese açık tek bir pakette, `ghcr.io/panomc/pano`, **amd64** ve **arm64** için:

| Etiket | Ne alırsınız |
| --- | --- |
| `latest` | En yeni kararlı sürüm (önerilen) |
| `beta`, `alpha` | O ön sürüm kanalının en yeni sürümü |
| `<version>`, ör. `1.0.0` | Tam olarak o sürüm, hiç değişmez |
| `runtime-jre<N>` | Java `N` ve başlatıcı, Pano **yok**. Bkz. [Runtime imajı](runtime/#runtime-image) |

İmaj Pano'yu Java 11 üzerinde root olmayan bir kullanıcıyla çalıştırır. Pano yine de bir **MySQL veya
MariaDB** veritabanına ihtiyaç duyar; aşağıdaki iki örnek de yanında bir MariaDB başlatır.

## Docker Compose (önerilen) {#compose}

1. Bir klasör oluşturun ve içine şu `compose.yaml` dosyasını koyun:

   ```yaml
   # Pano with MariaDB, the self-host Docker install (docs mirror this file 1:1).
   #   echo "PANO_DB_PASSWORD=$(openssl rand -hex 24)" > .env
   #   docker compose up -d        # then open http://<server> and finish the setup wizard
   # PANO_TAG picks the image tag (latest, beta, alpha or a version such as 1.0.0), PANO_PORT the host port.
   # latest = newest stable release.
   name: pano

   services:
     pano:
       image: ghcr.io/panomc/pano:${PANO_TAG:-latest}
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
         - "${PANO_PORT:-80}:8088"
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

   Pano 80 portunda sunulur. 80 portu doluysa `.env` dosyasına `PANO_PORT=8088` (ya da başka bir port),
   başka bir etiket için `PANO_TAG=beta` (ya da bir sürüm) ekleyin.

3. `http://<sunucu-ip-adresiniz>/` adresini açın ve [Kurulum Sihirbazı](../installation/setup/)'nı
   izleyin. Veritabanı adımı ortam değişkenlerinden önceden doldurulmuştur; `PANO_DB_PASSWORD` kullanılsın diye şifreyi boş bırakın.

## docker run {#docker-run}

Compose olmadan Pano'yu ve MariaDB'yi aynı ağa koyun:

```bash
docker network create pano
docker run -d --name pano-db --network pano --restart unless-stopped \
  -e MARIADB_DATABASE=pano -e MARIADB_USER=pano -e MARIADB_PASSWORD=change-me \
  -e MARIADB_RANDOM_ROOT_PASSWORD=1 -v pano-db:/var/lib/mysql mariadb:11.4
docker run -d --name pano --network pano --restart unless-stopped -p 80:8088 \
  -e PANO_DB_HOST=pano-db -e PANO_DB_NAME=pano -e PANO_DB_USER=pano -e PANO_DB_PASSWORD=change-me \
  -v pano-data:/data ghcr.io/panomc/pano:latest
```

Zaten bir veritabanı sunucunuz mu var? İlk iki komutu atlayın ve `PANO_DB_HOST`'u ona yönlendirin.

## Coolify {#coolify}

[Coolify](https://coolify.io) ile yönetilen bir sunucuda Pano tek bir Compose dosyasıyla çalışır. Coolify'ın proxy'si
onu alan adınızda HTTPS ile sunar, veritabanı kullanıcısını ve şifrelerini de kendisi oluşturur.

1. Coolify'da projenizi açın, **New Resource**'a tıklayın ve **Docker Compose Empty**'yi seçin.
2. Bu dosyayı yapıştırın:

   ```yaml
   # documentation: https://panomc.com/docs/
   # slogan: Pano is a website, store and server panel for Minecraft servers.
   # category: cms
   # tags: minecraft,cms,website,forum,store,server,panel,game
   # logo: svgs/pano.svg
   # port: 8088
   #
   # Pano on Coolify: New Resource -> Docker Compose Empty, paste this file, set the domain of `pano`, deploy.
   # Coolify generates the database user and passwords. To pin a release, change the image tag (beta, alpha or a
   # version such as 1.2.1). The header above is Coolify's one-click template metadata.

   services:
     pano:
       image: ghcr.io/panomc/pano:latest
       environment:
         - SERVICE_URL_PANO_8088
         - PANO_DB_HOST=mariadb
         - PANO_DB_PORT=3306
         - PANO_DB_NAME=${MARIADB_DATABASE:-pano}
         - PANO_DB_USER=${SERVICE_USER_MARIADB}
         - PANO_DB_PASSWORD=${SERVICE_PASSWORD_MARIADB}
         - PANO_JVM_ARGS=${PANO_JVM_ARGS:--XX:MaxRAMPercentage=75}
       volumes:
         - pano-data:/data
       depends_on:
         mariadb:
           condition: service_healthy
       healthcheck:
         test: ["CMD-SHELL", "curl -so /dev/null http://127.0.0.1:8088/api/v1/setup/step"]
         interval: 10s
         timeout: 5s
         retries: 10
         start_period: 60s

     mariadb:
       image: mariadb:11.4
       environment:
         - MARIADB_DATABASE=${MARIADB_DATABASE:-pano}
         - MARIADB_USER=${SERVICE_USER_MARIADB}
         - MARIADB_PASSWORD=${SERVICE_PASSWORD_MARIADB}
         - MARIADB_ROOT_PASSWORD=${SERVICE_PASSWORD_MARIADBROOT}
       volumes:
         - pano-mariadb-data:/var/lib/mysql
       healthcheck:
         test: ["CMD", "healthcheck.sh", "--connect", "--innodb_initialized"]
         interval: 5s
         timeout: 5s
         retries: 30
   ```

3. `pano` servisinin alan adını girin, örneğin `https://mc.example.com`, ve **Deploy**'a tıklayın.
   Önce alan adının DNS kaydını sunucuya yönlendirin.
4. Alan adını açın ve [Kurulum Sihirbazı](../installation/setup/)'nı izleyin. Veritabanı adımı zaten doldurulmuştur.

`latest` en yeni kararlı sürümdür. Bir sürüme sabitlemek için imaj etiketini değiştirin, örneğin `ghcr.io/panomc/pano:1.2.1`.

## Bilmekte fayda var

- Pano'nun yazdığı her şey **`/data`** biriminde durur. Onu veritabanıyla birlikte yedekleyin. Bkz.
  [`/data` birimi](configuration/#the-data-volume).
- Konteyner çalışırken `config.conf` dosyasını **düzenlemeyin**. Bkz. [config.conf](configuration/#config-conf).
- `docker compose stop` ya da `docker stop pano` ile durdurun; Pano düzgünce kapanır ve yapılandırmasını kaydeder.
- Güncellemek için daha yeni bir etiket çekin. Bkz. [Güncelleme](runtime/#upgrading).
- Pano'yu başkaları için mi çalıştırıyorsunuz? [Başkaları için Pano Instance Barındırma](../hosting/) modeli anlatır.
