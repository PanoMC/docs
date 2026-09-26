# Container Configuration

In a container, Pano keeps everything in the **`/data`** volume and can take its database and mail
settings from **environment variables** instead of the Setup Wizard.

> [!WARNING]
> **Not released yet.** Environment variable support ships together with the container images. Names
> may change before release. See [Run Pano with Containers](../).

## The `/data` volume

`/data` is the only place Pano writes to. Mount a volume or a folder there and back it up.

| In `/data` | What it is |
| --- | --- |
| `Pano-<version>.jar` and the UIs | The Pano release (with the `pano-runtime` image) |
| `.pano-jar` | File name of the jar the launcher starts. See [Container mode](../runtime/#container-mode) |
| `config.conf` | Pano's [configuration file](../../configuration/) |
| `plugins/`, uploads, logs | Everything Pano creates while it runs |

The rest of the container can stay **read-only**; Pano only needs `/data` and a temporary `/tmp`.
Pano Host runs every Pano Instance that way.

## Environment variables {#environment-variables}

On first boot Pano writes these variables into `config.conf`, so it already knows its database and
mail server.

| Variable | Sets |
| --- | --- |
| `PANO_DB_HOST` | Database host |
| `PANO_DB_NAME` | Database name |
| `PANO_DB_USER` | Database user |
| `PANO_DB_PASSWORD` | Database password |
| `PANO_SMTP_HOST` | SMTP server |
| `PANO_SMTP_PORT` | SMTP port |
| `PANO_SMTP_USER` | SMTP user |
| `PANO_SMTP_PASSWORD` | SMTP password |

Example:

```bash
docker run -d --name pano \
  -e PANO_DB_HOST=mariadb \
  -e PANO_DB_NAME=pano \
  -e PANO_DB_USER=pano \
  -e PANO_DB_PASSWORD=change-me \
  -v pano-data:/data \
  ghcr.io/panomc/pano:<version>
```

Keep passwords out of shell history: use `--env-file` or your orchestrator's secrets.

### Pano Host variables

Pano Host sets a few more. You do not need them for your own installs.

| Variable | Purpose |
| --- | --- |
| `PANO_HOSTED` | `pano-host` marks the instance as managed by Pano Host. Informational: the panel shows "managed by Pano Host" and quota notices, nothing is locked |
| `PANO_HOST_WORKLOAD_ID` | The instance's id at Pano Host |
| `PANO_HOST_INSTANCE_SECRET` | Lets the instance redeem panel sign-ins from panomc.com and read its notices |
| `PANO_HOST_API_URL` | Pano Host API address |

Older Pano versions ignore all of these variables.

## config.conf {#config-conf}

Pano **rewrites `config.conf` when it shuts down**. An edit made while the container runs is lost
on the next stop. To change a setting by hand:

1. Stop the container (`docker stop pano`) and wait until it has exited.
2. Edit `/data/config.conf`.
3. Start the container again.

Settings you can change from the panel are safer to change there. For older Pano versions without
environment variable support, the same order works: start once so Pano creates `config.conf`, stop,
add your settings, start.
