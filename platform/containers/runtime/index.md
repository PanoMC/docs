# Container Runtime

How Pano behaves inside a container: restarts and updates, Java, memory and users.

> [!WARNING]
> **Not released yet.** Container mode ships together with the container images and is not in any
> Pano release yet. See [Run Pano with Containers](../).

## Container mode {#container-mode}

Outside a container, a restart or an update from the panel starts a new, detached `java` process and
the old one exits. In a container that would stop the container: when the main process exits, the
container ends.

In container mode Pano does this instead:

1. It stages the new jar in `/data` and writes its file name to `/data/.pano-jar`.
2. It exits with code **75**.
3. The image's launcher, running as PID 1 under `tini`, sees exit code 75 and starts the jar named in
   `/data/.pano-jar`. The container keeps running.

Any other exit code ends the container as usual, so your restart policy (for example
`--restart unless-stopped`) still handles crashes. Pano Host treats exit 75 as a planned restart,
not a crash.

## Never use `-bg` {#never-use-bg}

[`-bg`](../../installation/#background-mode-bg) makes Pano respawn itself as a detached process and
exit. In a container that exit ends the container. The images never pass `-bg`; do not add it.

## Java version {#java-version}

Pano targets **Java 11**, so Java 11 is its minimum and every runtime family includes `jre11`. Newer
Java versions work too; pick one when a plugin you use needs it. [Managed servers](../../server-management/managed-servers/)
on the local `pano-node` need Java 17 or newer.

Pano Host starts a new instance on the minimum Java that its Pano version needs (read from the jar)
and lets you choose a newer one. An older one is refused.

## glibc, not Alpine

The images use a **glibc** base (Eclipse Temurin on Ubuntu). Some of Pano's native libraries, such as
the Argon2 password hashing, only ship glibc builds. On a musl image like **Alpine**, logging in
fails. If you build your own image, start from a glibc-based Java image.

## Memory {#memory}

The Java heap follows the container's memory limit (`-XX:MaxRAMPercentage`), so always set one
(`--memory`). The limit covers the JVM **and** the Bun processes that render the UIs; see
[Memory & Limits](../../configuration/memory/) for how Pano uses memory. Pano Host sets the heap to
about 75 % of the instance's memory.

The images ship Bun, so Pano does not download it on first boot.

## Non-root

The images run Pano as a **non-root** user and need no extra capabilities. Pano Host runs instances
with all capabilities dropped, `no-new-privileges`, a read-only root filesystem, a writable `/data`
and a temporary `/tmp`. If you run with `--user`, make sure that user can write to `/data`.
