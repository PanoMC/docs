# Container Runtime

How Pano behaves inside a container: restarts, upgrades, the runtime image, Java, memory and users.

## Container mode {#container-mode}

Outside a container, a restart or an update from the panel starts a new, detached `java` process and
the old one exits. In a container that would stop the container: when the main process exits, the
container ends. In container mode Pano does this instead:

1. It stages the new jar in `/data` and writes its file name to `/data/.pano-jar`.
2. It exits with code **75**.
3. The image's launcher, running under `tini`, sees exit code 75 and starts the jar named in
   `/data/.pano-jar`. The container keeps running.

Any other exit code ends the container as usual, so your restart policy (for example
`--restart unless-stopped`) still handles crashes.

## Upgrading {#upgrading}

Pull a newer image and recreate the container. With [Compose](../#compose):

```bash
docker compose pull && docker compose up -d
```

- **Channel tags** (`latest`, `beta`, `alpha`) move with each release, so a pull is enough.
- **Version tags** never move: set `PANO_TAG=<version>` in `.env` (or change the tag in `docker run`).

On start, the image's `pano-seed` step copies the image's jar into `/data` **only when the image
carries a different release than the one it installed last**. So:

- An update made **in the panel** stays in place across container restarts, until you change the image.
- Changing the image always installs the image's release, even over a newer in-panel update.

Going back to an older tag installs the older jar, but the **database is not downgraded**. Back up
`/data` and the database before every upgrade.

## Never use `-bg` {#never-use-bg}

[`-bg`](../../installation/#background-mode-bg) makes Pano respawn itself as a detached process and
exit. In a container that exit ends the container. The images never pass `-bg`; do not add it.

## The runtime image (advanced) {#runtime-image}

`ghcr.io/panomc/pano-web-platform:runtime-jre<N>` holds Java `N`, Bun and the launcher, but **no**
Pano release. The jar lives in `/data` and `.pano-jar` names it. Pano Host runs every instance this way.

```bash
mkdir pano && cd pano
# download Pano-<version>.jar from https://panomc.com/download into this folder
echo "Pano-<version>.jar" > .pano-jar
docker run -d --name pano --user "$(id -u):$(id -g)" --memory 1g \
  -v "$PWD":/data -p 8088:8088 ghcr.io/panomc/pano-web-platform:runtime-jre11
```

Nothing is seeded: you change the Pano version by replacing the jar and `.pano-jar`. `<N>` is 11, 17,
21 or 25; `runtime-jre<N>-<version>` pins the build that came with a release.

## Java version {#java-version}

Pano targets **Java 11**, so Java 11 is its minimum and the full image uses it. Pick a newer
`runtime-jre<N>` when a plugin you use needs it. [Managed servers](../../server-management/managed-servers/)
on the local `pano-node` need Java 17 or newer.

The images use a **glibc** base (Eclipse Temurin on Ubuntu). Some of Pano's native libraries, such as
the Argon2 password hashing, only ship glibc builds; on a musl image like **Alpine**, logging in
fails. If you build your own image, start from a glibc-based Java image.

## Memory {#memory}

The Java heap follows the container's memory limit (`-XX:MaxRAMPercentage=75` by default), so set one
(`--memory`, or `mem_limit` in Compose). The limit covers the JVM **and** the Bun processes that
render the UIs; see [Memory & Limits](../../configuration/memory/). `PANO_JVM_ARGS` replaces the
default Java options.

## Non-root {#non-root}

The images run Pano as uid **10000** and need no extra capabilities. Pano Host runs instances with all
capabilities dropped, `no-new-privileges`, a read-only root filesystem, a writable `/data` and a
temporary `/tmp`. If you run with `--user`, make sure that user can write to `/data`.
