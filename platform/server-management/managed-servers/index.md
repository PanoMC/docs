# Managed Servers

A managed server is installed and run by Pano on a **node** — a machine running the
[`pano-node`](../pano-node/) daemon. The node connects **outwards** to Pano, so no port has to be
opened on it. Nodes are managed from the **node icon** next to the server switcher and need the
**Manage Nodes** permission.

## Adding a node {#adding-a-node}

**Add node** has four tabs:

| Tab | |
| --- | --- |
| **Local** | Pano's own machine, in one click. Needs Java 17+. Files go to `<pano-dir>/node-data/`, the log to `<pano-dir>/logs/pano-node.log`. |
| **Manual** | Any machine: run the one-line command it shows, then approve the node. |
| **SSH** | Pano runs the install for you over SSH, after you confirm the host key. The login is never stored. |
| **Coolify** | Deploys the `ghcr.io/panomc/pano-node` container with a `/data` volume and the game ports. |

The Manual command looks like this (the code rotates every 30 seconds):

```bash
curl -fsSL https://panel.example.com/api/node/install.sh | sh -s -- --pano 'https://panel.example.com' --code '123456'
```

Accept only nodes you set up yourself. When a node cannot reach your website URL (NAT, an SSH
tunnel), set **Pano address reachable from the node** under **Advanced**.

A node with an older daemon shows **Update available**; updating takes a few seconds and its servers
keep running. **Removing a node deletes every server and backup on it.**

## Creating a server {#creating-a-server}

**Add server → Create a new server** (needs **Create Servers**) walks through **Source → Node →
Software → Settings → Review**.

- **Software:** Paper (recommended), Purpur, Folia, Spigot, Fabric, Vanilla, and the proxies Velocity
  (recommended), Waterfall and BungeeCord. **Spigot** is compiled on the node with BuildTools — the
  first build of a version takes about ten minutes, later ones reuse it.
- **Settings:** name, memory, port (empty = a free one from `25565-25600`), Java version, JVM
  arguments, **Start with Pano**, **Restart after a crash**, **Whitelist** (off by default; not for
  imports or proxies) and the Minecraft EULA.
- The node downloads the server, installs the Pano plugin already paired, and leaves the server
  **Stopped**, ready to start.
- On **Fabric** and **Quilt**, the Pano mod needs Fabric API, so the node installs it too (the build
  for that Minecraft version, from Modrinth) unless the server already has it. The Pano mod needs
  Minecraft 26.1+; on older versions, or with no Fabric API build, it is left out and the task says
  so.

**Importing:** as the source you can also pick an **existing folder on the node** (copied, never
moved), a **`.zip` upload** (up to 1 GB) or a **Modrinth modpack**. Pano detects the software and
version itself. Never import a folder whose server is still running.

> A backend behind a proxy usually runs with `online-mode=false` — keep it unreachable from the
> internet, or anyone can join as anyone.

## Server settings {#server-settings}

Changes apply on the next start.

- **Startup:** Java version, memory, port, JVM arguments, **Start with Pano**, **Restart after a
  crash**.
- **Memory** is the server's whole memory, not just the Java heap: the heap gets it minus a share for
  the JVM (25 %, between 384 MB and 1 GB) — for example 2048 MB gives a 1536 MB heap. Under the
  Docker runtime it is the container's limit. The heap starts at a quarter of its maximum and grows
  as needed; on Java 12+ an idle server hands memory back. Your own JVM arguments still win.
- **Server properties:** a form for `server.properties`. Only the keys you change are written; the
  rest of the file stays as it is.
- **Java:** on **Automatic**, the lowest version the Minecraft version supports — 25 for 26.1+, 21
  for 1.20.5–1.21, 17 for 1.17–1.20.4, 16 for 1.16.5, 8 for older. A missing Java is downloaded by
  the node.
- **Danger zone → Change software / Reinstall:** switch to another software or version, keeping
  worlds, plugins and configuration where they fit. A backup is taken first, and a failed change is
  rolled back. Needs **Create Servers** and your password.
- **Remove server:** on a managed server this deletes its folder **and its backups**. A linked server
  is only removed from Pano.

## When something goes wrong {#troubleshooting}

- **The node stays offline** — the local node needs Java 17+ (`LOCAL_NODE_JAVA_MISSING`); set
  `local-node.java-path` if Pano cannot find it. Otherwise read `pano-node.log`.
- **The install fails** — the node needs internet access to the download sites, and free disk space.
- **The server shows CRASHED** — its console has the error. Exit code `137` means it was killed from
  outside, usually for running out of memory.
- **The port is in use** — change it in **Startup**, or leave it empty for a free one.
