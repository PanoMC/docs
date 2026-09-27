# Install with Docker

Docker is an alternative to the [`.jar` install](../installation/): one image holds Java, Pano and
everything Pano needs to run. [Pano Host](https://panomc.com/host) runs every Pano Instance the same way.
[Configuration](configuration/) covers environment variables and the `/data` volume; [Runtime](runtime/)
covers upgrades, the runtime image, Java and memory.

> [!NOTE]
> The images are published from Pano **1.0.0-alpha.520** on. Older releases only ship the `.jar`.

## The image

All tags live in one public package, `ghcr.io/panomc/pano-web-platform`, built for **amd64** and **arm64**:

| Tag | What you get |
| --- | --- |
| `latest` | The newest stable release |
| `beta`, `alpha` | The newest release of that prerelease channel |
| `<version>`, e.g. `1.0.0-alpha.520` | Exactly that release, never moves |
| `runtime-jre<N>` | Java `N` and the launcher, **no** Pano. See [The runtime image](runtime/#runtime-image) |

The image runs Pano as a non-root user on Java 11. Pano still needs a **MySQL or MariaDB** database;
both examples below start MariaDB next to it.

## Docker Compose (recommended) {#compose}

1. Create a folder with this `compose.yaml` in it:

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

2. Create a `.env` file with a database password and start both containers:

   ```bash
   echo "PANO_DB_PASSWORD=$(openssl rand -hex 24)" > .env
   docker compose up -d
   ```

   Add `PANO_PORT=80` to `.env` to serve Pano on port 80, and `PANO_TAG=beta` (or a version) to pick a tag.

3. Open `http://<your-server-ip>:8088/` and follow the [Setup Wizard](../installation/#setup-wizard-step-by-step).
   The database step is already filled in from the environment.

## docker run {#docker-run}

Without Compose, put Pano and MariaDB on one network:

```bash
docker network create pano
docker run -d --name pano-db --network pano --restart unless-stopped \
  -e MARIADB_DATABASE=pano -e MARIADB_USER=pano -e MARIADB_PASSWORD=change-me \
  -e MARIADB_RANDOM_ROOT_PASSWORD=1 -v pano-db:/var/lib/mysql mariadb:11.4
docker run -d --name pano --network pano --restart unless-stopped -p 8088:8088 \
  -e PANO_DB_HOST=pano-db -e PANO_DB_NAME=pano -e PANO_DB_USER=pano -e PANO_DB_PASSWORD=change-me \
  -v pano-data:/data ghcr.io/panomc/pano-web-platform:latest
```

Already have a database server? Skip the first two commands and point `PANO_DB_HOST` at it.

## Good to know

- Everything Pano writes lives in the **`/data`** volume. Back it up together with the database. See
  [The `/data` volume](configuration/#the-data-volume).
- Do **not** edit `config.conf` while the container runs. See [config.conf](configuration/#config-conf).
- Stop with `docker compose stop` or `docker stop pano`; Pano shuts down cleanly and saves its config.
- To upgrade, pull a newer tag. See [Upgrading](runtime/#upgrading).
- Running Pano for other people? [Hosting Pano Instances for Others](../hosting/) describes the model.
