# Memory & Resource Limits

Pano is built to run on a tight budget — a full instance (the JVM **plus** the UI runtimes it spawns) targets **~1 GB of RAM**, not counting the database, which runs as a separate service.

## How Pano uses memory

A running instance is made of independent OS processes:

1. **Pano core (JVM)** — the main `Pano.jar` process. Bounded by JVM flags (`-Xmx`, …) given **at launch**.
2. **UI runtimes (Bun)** — Pano spawns one small [Bun](https://bun.sh) process per UI it serves: `setup-ui`, `panel-ui` and the **active theme**. They are stateless SSR renderers (take data from the backend, render HTML), so they stay small.
3. **Database** — a **separate** application (MariaDB/MySQL). Limit it on its own.

> **Total RAM ≈ JVM (`-Xmx` + metaspace + direct + overhead) + Σ each UI runtime.**
> They are separate processes: JVM flags do **not** limit the Bun UIs, and the UI cap does **not** limit the JVM. Size both.

## Limit the Pano core (JVM)

Heap size is fixed **at startup** and cannot shrink while running, so cap it (and the off-heap regions) when you launch Pano.

### `JAVA_TOOL_OPTIONS` (recommended)

The JVM reads this environment variable automatically — your start command stays unchanged:

```bash
export JAVA_TOOL_OPTIONS="-Xms128m -Xmx512m -XX:MaxMetaspaceSize=256m -XX:MaxDirectMemorySize=64m -XX:+UseSerialGC -XX:+ExitOnOutOfMemoryError"
java -jar Pano.jar
```

### Flags on the command line

```bash
java -Xms128m -Xmx512m -XX:MaxMetaspaceSize=256m -XX:MaxDirectMemorySize=64m -XX:+UseSerialGC -XX:+ExitOnOutOfMemoryError -jar Pano.jar
```

| Flag | Purpose |
| --- | --- |
| `-Xmx512m` | Max heap — the biggest lever. |
| `-XX:MaxMetaspaceSize=256m` | Caps class metadata. |
| `-XX:MaxDirectMemorySize=64m` | Caps Netty/Vert.x off-heap buffers. |
| `-XX:+UseSerialGC` | Lowest-overhead GC for small heaps. |
| `-XX:+ExitOnOutOfMemoryError` | Exit (so the supervisor restarts) instead of hanging on OOM. |

### Docker

```dockerfile
ENV JAVA_OPTS="-Xms128m -Xmx512m -XX:MaxMetaspaceSize=256m -XX:MaxDirectMemorySize=64m -XX:+UseSerialGC -XX:+ExitOnOutOfMemoryError"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar Pano.jar"]
```

Cap the whole container so the JVM **and** the Bun UIs share one hard ceiling:

```bash
docker run --memory=1g --memory-swap=1g your-pano-image
```

### systemd (Linux host)

```ini
[Service]
Environment="JAVA_TOOL_OPTIONS=-Xms128m -Xmx512m -XX:MaxMetaspaceSize=256m -XX:MaxDirectMemorySize=64m -XX:+UseSerialGC -XX:+ExitOnOutOfMemoryError"
ExecStart=/usr/bin/java -jar /opt/pano/Pano.jar
# Hard-cap the whole service (JVM + spawned UIs):
MemoryMax=1G
MemorySwapMax=0
```

## Limit the UI runtimes (setup-ui, panel-ui, theme)

There is no portable per-process hard cap for the spawned Bun UIs (cgroups are Linux-only, Windows Job Objects are Windows-only, macOS has neither), so **Pano caps them itself** — the same way on every platform it runs (Linux, macOS, Windows, Android):

- It launches Bun in low-memory mode (`--smol`).
- A built-in watchdog periodically reads each UI process's resident memory and **restarts** any that exceeds the limit. The restart reuses the same internal port, so routing is untouched; the UIs are stateless, so it's safe.

Set the per-UI ceiling in your config (see [Server Configuration](../server/)):

```jsonc
server {
  ui-max-memory-mb = 200   # max MB per UI runtime; 0 disables the limit
}
```

- Default **200 MB** per UI.
- With `--smol` the UIs normally sit well below this — the cap is a safety net against a leak or runaway.
- `0` disables enforcement.

## A worked ~1 GB budget

With the database elsewhere, give the JVM the larger share and leave room for the one or two UIs usually running (panel-ui + the active theme):

```bash
# Pano core (JVM)
export JAVA_TOOL_OPTIONS="-Xms128m -Xmx448m -XX:MaxMetaspaceSize=256m -XX:MaxDirectMemorySize=64m -XX:+UseSerialGC -XX:+ExitOnOutOfMemoryError"
java -jar Pano.jar
```

```jsonc
// config — keep each UI small
server {
  ui-max-memory-mb = 200
}
```

Rough math: JVM ≈ 448 MB heap + ~250 MB overhead ≈ **~700 MB**, plus 2 × ~120 MB UIs ≈ **~240 MB** → **~940 MB**, comfortably under 1 GB. Tune `-Xmx` and `ui-max-memory-mb` for your traffic.

> The database is separate — give it its own limit (e.g. another container with its own `--memory`).
