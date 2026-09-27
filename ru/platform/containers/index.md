# Установка через Docker

Docker — альтернатива [установке из `.jar`](../installation/): один образ содержит Java, Pano и всё,
что нужно Pano для работы. [Pano Host](https://panomc.com/host) запускает так каждый Pano Instance.
[Конфигурация](configuration/) описывает переменные окружения и том `/data`; [Среда выполнения](runtime/) —
обновление, runtime-образ, Java и память.

> [!NOTE]
> Образы публикуются начиная с Pano **1.0.0-alpha.520**. Более старые релизы поставляются только как `.jar`.

## Образ

Все теги лежат в одном публичном пакете `ghcr.io/panomc/pano-web-platform`, собранном для **amd64** и **arm64**:

| Тег | Что вы получаете |
| --- | --- |
| `latest` | Новейший стабильный релиз |
| `beta`, `alpha` | Новейший релиз этого канала предварительных версий |
| `<version>`, напр. `1.0.0-alpha.520` | Ровно этот релиз, никогда не меняется |
| `runtime-jre<N>` | Java `N` и лаунчер, **без** Pano. См. [Runtime-образ](runtime/#runtime-image) |

Образ запускает Pano на Java 11 от непривилегированного пользователя. Pano всё равно нужна база **MySQL
или MariaDB**; оба примера ниже запускают MariaDB рядом с ним.

## Docker Compose (рекомендуется) {#compose}

1. Создайте папку и положите в неё этот `compose.yaml`:

   ```yaml
   # Pano with MariaDB, the self-host Docker install (docs mirror this file 1:1).
   #   echo "PANO_DB_PASSWORD=$(openssl rand -hex 24)" > .env
   #   docker compose up -d        # then open http://<server>:8088 and finish the setup wizard
   # PANO_TAG picks the image tag (latest, beta, alpha or a version such as 1.0.0), PANO_PORT the host port.
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

2. Создайте файл `.env` с паролем базы данных и запустите оба контейнера:

   ```bash
   echo "PANO_DB_PASSWORD=$(openssl rand -hex 24)" > .env
   docker compose up -d
   ```

   Добавьте в `.env` строку `PANO_PORT=80`, чтобы Pano работал на порту 80, и `PANO_TAG=beta` (или версию),
   чтобы выбрать тег.

3. Откройте `http://<ip-вашего-сервера>:8088/` и пройдите [мастер настройки](../installation/).
   Шаг базы данных уже заполнен из переменных окружения.

## docker run {#docker-run}

Без Compose поместите Pano и MariaDB в одну сеть:

```bash
docker network create pano
docker run -d --name pano-db --network pano --restart unless-stopped \
  -e MARIADB_DATABASE=pano -e MARIADB_USER=pano -e MARIADB_PASSWORD=change-me \
  -e MARIADB_RANDOM_ROOT_PASSWORD=1 -v pano-db:/var/lib/mysql mariadb:11.4
docker run -d --name pano --network pano --restart unless-stopped -p 8088:8088 \
  -e PANO_DB_HOST=pano-db -e PANO_DB_NAME=pano -e PANO_DB_USER=pano -e PANO_DB_PASSWORD=change-me \
  -v pano-data:/data ghcr.io/panomc/pano-web-platform:latest
```

Уже есть сервер баз данных? Пропустите первые две команды и укажите его в `PANO_DB_HOST`.

## Полезно знать

- Всё, что пишет Pano, лежит в томе **`/data`**. Делайте его резервную копию вместе с базой данных. См.
  [Том `/data`](configuration/#the-data-volume).
- **Не** редактируйте `config.conf`, пока контейнер работает. См. [config.conf](configuration/#config-conf).
- Останавливайте через `docker compose stop` или `docker stop pano`; Pano корректно завершится и сохранит конфигурацию.
- Для обновления скачайте более новый тег. См. [Обновление](runtime/#upgrading).
- Запускаете Pano для других? Модель описана в [Хостинг Pano Instance для других](../hosting/).
