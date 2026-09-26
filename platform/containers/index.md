# Run Pano with Containers

Pano can run in a container, the same way [Pano Host](https://panomc.com/host) runs every Pano Instance.
This page covers the images and a quick start. [Configuration](configuration/) explains environment
variables and the `/data` volume; [Runtime](runtime/) explains container mode, Java and memory.

> [!WARNING]
> **Not released yet.** The container images and container mode are still being built and are not part
> of any Pano release yet. Image names and behaviour on these pages follow the current plan and may
> change before release. Until then, install Pano with the [`.jar`](../installation/).

## The images

There are two image families, both published by Pano's CI to the GitHub Container Registry:

| Image | Contains | Use it when |
| --- | --- | --- |
| `ghcr.io/panomc/pano:<version>` | Java runtime **and** that Pano release | You want a ready-to-run Pano with Docker |
| `ghcr.io/panomc/pano-runtime:jre<N>` | Java `N` and a launcher, **no** Pano | You keep the Pano jar and UIs in your own volume |

- `<version>` is a Pano release version, like the ones on [GitHub Releases](https://github.com/PanoMC/Pano/releases).
- `<N>` is a Java version. The runtime family **always** has Pano's minimum, `jre11`, plus newer Java
  lines. See [Java version](runtime/#java-version).
- The runtime images are **multi-arch** (amd64 and arm64), run as a **non-root** user and are built on
  a **glibc** base. See [Runtime](runtime/).

With `pano-runtime`, the Pano release (jar + UIs) lives in the `/data` volume, not in the image.
Changing the Pano version means swapping files in `/data`; updates made from the panel are written to
`/data` too, so they survive a container restart. Pano Host works this way.

## Quick start

1. Create a folder for Pano's data and put a Pano jar in it:

   ```bash
   mkdir pano && cd pano
   # download Pano-<version>.jar from https://panomc.com/download into this folder
   echo "Pano-<version>.jar" > .pano-jar
   ```

   `.pano-jar` holds the **file name** of the jar to start. See [Container mode](runtime/#container-mode).

2. Start the runtime image with the folder mounted at `/data`:

   ```bash
   docker run -d --name pano \
     --user "$(id -u):$(id -g)" \
     --memory 1g \
     -v "$PWD":/data \
     -p 80:<http-port> \
     ghcr.io/panomc/pano-runtime:jre11
   ```

   - `--user` keeps the files in the folder owned by you; the container never needs root.
   - `--memory` also sizes the Java heap. See [Memory](runtime/#memory).
   - `<http-port>` is Pano's `server.http-port` from [`config.conf`](../configuration/).

3. Open `http://<your-server-ip>/` and follow the [Setup Wizard](../installation/#setup-wizard-step-by-step).

Pano still needs a **MySQL or MariaDB** database. Run it as its own container or service, and give
Pano its address in the wizard or through [environment variables](configuration/#environment-variables).

## Good to know

- Do **not** start Pano with `-bg` in a container. See [Never use `-bg`](runtime/#never-use-bg).
- Do **not** edit `config.conf` while the container runs. See [config.conf](configuration/#config-conf).
- Stop the container with `docker stop`; Pano shuts down cleanly and saves its config.

## Hosting Pano for others

Pano Host runs one container per Pano Instance, with the same images and the environment variables
described in [Configuration](configuration/).
