# The pano-node Daemon

`pano-node` is the small daemon that installs and supervises **managed** Minecraft servers on a
host. It is what turns a machine into a [node](../#nodes): Pano tells it what to install, when to
start and stop a server and what to write into `server.properties`, and it reports state, console
output and metrics back.

> ⚠️ The daemon ships on the **alpha** channel first, together with the Pano release it belongs to.
> It reaches `beta` and then stable in the usual order, so a stable installation may not have it yet.

It is always a **separate process**, never part of Pano's own JVM. That is the point: updating or
restarting Pano must not take the Minecraft servers it manages offline. On the machine Pano itself
runs on, Pano downloads the daemon, starts it and keeps it running for you — see
[the local node](../#the-local-node). Everything on this page is for the cases where you run it
yourself: a second machine, a container, or a host you want the daemon to start with — and for
[the Pano Agent](#the-pano-agent), the same jar started from inside one server's folder.

## Getting it

**From your own Pano**, which is the source to prefer. A running Pano serves the exact daemon it was
released with, so the jar you get is by construction the one that Pano speaks its protocol with —
and nothing outside your own network has to be reachable for it to work:

```bash
curl -fsSL https://panel.example.com/api/node/pano-node.jar -o pano-node.jar
curl -fsSL https://panel.example.com/api/node/pano-node.jar.sha256 | sha256sum -c -
```

Both URLs are public and unauthenticated. The jar is a published artifact rather than a secret and
grants nothing on its own — whoever downloads it still has to pair before Pano will talk to them —
and the checksum is served in `sha256sum` format so it can be checked exactly as above. This is
where the [install script](../#remote-nodes) gets the jar too. A Pano that has no daemon jar on
disk answers **404** on both, and the installer then falls back to the release below.

**From the GitHub release**, the alternative. `pano-node.jar` is published with every Pano release,
next to the platform jar, together with a `pano-node.jar.sha256` you can verify it against. **Use
the jar from the release your Pano is running**: the daemon and the platform ship together so that
the protocol between them always matches.

It needs a **Java 17 or newer** runtime for itself. That is stricter than Pano, which still runs on
Java 11+, and handing the daemon a Java 11 makes it die with `UnsupportedClassVersionError` on every
start. The Java versions the *game servers* run on are a separate matter — see
[Which Java a server runs on](../#which-java-a-server-runs-on).

**`git` is not needed.** Installing a [Spigot](../#spigot-is-compiled-on-the-node) server
compiles it here with BuildTools, which runs `git`; a git on the `PATH` is used, and a host without
one gets a portable git the node downloads for that build alone — see
[Git for BuildTools](#git-for-buildtools). Nothing else the daemon does touches git.

This is a once-per-machine job. A node that is already installed is updated from the panel instead —
see [Updating the daemon](#updating-the-daemon).

## Running it

```bash
# Pair with a Pano. The code comes from Panel -> Servers -> Nodes -> Add node -> Manual
# and rotates every 30 seconds.
java -jar pano-node.jar --pano https://panel.example.com --code 123456 --data ./node-data

# Every start after the first: the pairing is in <data>/config.conf.
java -jar pano-node.jar --data ./node-data

# Write a service file for this host and exit.
java -jar pano-node.jar --data ./node-data --service install
```

Pairing happens once. Afterwards the node has its own token and reconnects on its own, with backoff,
whenever Pano or the network goes away.

### Flags

| Flag | |
| --- | --- |
| `--pano <url>` | Base URL of the Pano this node belongs to, for example `https://panel.example.com`. Also `--platform`. |
| `--code <code>` | The six-digit pairing code from the panel. Also `--pair`, `--pairing-code`. |
| `--bootstrap-token <token>` | The one-time token Pano mints when it starts a node on its own machine. Not something you type by hand. |
| `--data <dir>` | The data directory. Default `./node-data`, resolved to an absolute path. |
| `--name <name>` | What this node is called in the panel. |
| `--runtime <PROCESS\|DOCKER>` | How servers are run: each as a plain process (the default) or each in its own Docker container. See [Running servers in containers](#running-servers-in-containers). |
| `--port-range <start-end>` | The ports this node's servers may bind, for example `25660-25669` (default `25565-25600`; one port is `25565-25565`). Written into `node.port-range` in `config.conf`, so later starts keep it, and announced to Pano, which gives new servers on this node a port inside it. Anything but two ports in 1–65535, in order, is refused on start. In a container it must match the published ports. |
| `--service install` | Write a service file for this host and exit. |
| `--service uninstall` | Remove that file and exit. |
| `--help`, `-h` | Print the usage text. |

### Environment variables

Every flag has an environment equivalent, because a container gets its whole configuration from the
environment and cannot be given a command line without rebuilding the image. **A flag wins over the
matching variable.**

| Variable | Same as |
| --- | --- |
| `PANO_URL` | `--pano` |
| `PANO_PAIR_CODE` | `--code` |
| `PANO_BOOTSTRAP_TOKEN` | `--bootstrap-token` |
| `PANO_NODE_DATA` | `--data` |
| `PANO_NODE_NAME` | `--name` |
| `PANO_NODE_RUNTIME` | `--runtime` |
| `PANO_NODE_PORT_RANGE` | `--port-range` (`start-end`, e.g. `25660-25669`; empty means unset) |
| `PANO_NODE_JAVA_AUTO_DOWNLOAD` | `node.java-auto-download` in `config.conf` (`true` / `false`) |
| `PANO_NODE_TOOL_AUTO_DOWNLOAD` | `node.tool-auto-download` in `config.conf` (`true` / `false`) |

## The Pano Agent {#the-pano-agent}

The Pano Agent links a server you already run to Pano **where it is**. It is this same daemon, served
under a second name — `pano-agent.jar` — and you put it **in the server's folder and start it instead
of the server jar**. It starts the server as a process of its own, shows the server's console in the
terminal as if you had started the server jar yourself, and hands the rest to Pano: the power
buttons, the console, files, backups and schedules all run from the folder the server already lives
in. Nothing is copied or moved, and the agent never shows up as a node in the panel — only the
server does.

It needs **Java 17 or newer**, like any node. The server itself keeps running on whatever Java its
Minecraft version needs — see [Java runtimes](#java-runtimes).

### Linking a server

**Panel → Servers → Add server → Link with the Pano Agent** shows three short steps: a **Download**
button for `pano-agent.jar`, the command that runs it — with your Pano's address and a pairing code
already filled in — and a spinner that turns into **Open server** once the server shows up. From a
shell on that machine:

```bash
cd /home/mc/survival        # the server's folder

# 1. Put the agent in it: the dialog's Download button, FTP, a file manager, or
curl -fLo pano-agent.jar 'https://panel.example.com/api/node/pano-agent.jar'

# 2. Stop the server, then run the agent once with the command from the dialog.
java -jar pano-agent.jar --pano 'https://panel.example.com' --code k7m2x9qa4tj3n8wp

# 3. Every start after that.
java -jar pano-agent.jar
```

On Windows, step 1 is `Invoke-WebRequest -Uri '<the same URL>' -OutFile pano-agent.jar`; the rest is
the same.

- **`pano-agent.jar` is the daemon's jar under another name.** `/api/node/pano-agent.jar` serves the
  same bytes as `/api/node/pano-node.jar`, with a `.sha256` next to it, and — like
  [the daemon](#getting-it) — needs no login. The name is what matters: a jar whose name starts with
  `pano-agent` runs as an agent.
- **The code** is a 16-character random token (it is pasted, never typed, so it can be long enough
  that nobody can guess it), valid for **1 minute** and works **once**. The dialog shows a fresh
  one every minute, so the command in it always holds a valid code: copy it right before you run
  it. An agent that pairs with it is accepted on the spot; there is nothing to approve. If the code
  runs out before the agent uses it, the agent says so and asks for the current one.
- **The first run** pairs, asks how the server is started ([below](#agent-first-run)) and links the
  server where it is. Pano refuses a folder whose server is still running, because two processes on
  one world corrupt it; that is why the server has to be stopped first. Once it is linked, the agent
  starts it straight away and says to start it with `java -jar pano-agent.jar` from now on, along
  with the command that turns it into a service, and the dialog in the panel offers **Open server**.

### The first run {#agent-first-run}

Until it is paired, the agent asks for what it still needs, one question per line. **Enter keeps the
value in `[brackets]`.** Plain `java -jar pano-agent.jar`, with nothing after it, asks for
everything:

```text
$ java -jar pano-agent.jar
Pano Agent — linking /home/mc/survival to Pano. Press Enter to keep a [default].
Found start.sh — using its settings as defaults.
Pano address (your website, e.g. https://example.com): https://panel.example.com
Server jar [paper.jar]:
Memory for the server [4G]:
Extra Java arguments [-XX:+UseG1GC -XX:+ParallelRefProcEnabled]:

  Pano address:    https://panel.example.com
  Server folder:   /home/mc/survival
  Server jar:      paper.jar
  Memory:          4G
  Java arguments:  -XX:+UseG1GC -XX:+ParallelRefProcEnabled

Link this folder to Pano? [Y/n]
Pairing code (Pano panel → Add Server → Link with the Pano Agent): k7m2x9qa4tj3n8wp
```

The pairing code comes last, right before the agent pairs, so a code that only lasts a minute is
still fresh. The dialog's command answers the address and the code with `--pano` and `--code`, so in
a terminal it only asks how to start the server.

- **Pano address**: your website's address, as in the browser. `https://` is added when it is left
  out, and a trailing `/panel` is dropped. The agent checks that a Pano answers there; if none does,
  it says why — unreachable, not a Pano, or a Pano too old for agents — and asks again.
- **Server jar**: the jars in the folder, never the agent's own. When there is more than one they are
  listed with numbers; answer with a number or a name.
- **Memory for the server**: `4G`, `4096M` or just `4096` (megabytes), at least 512 MB.
- **Extra Java arguments**: typed as on a command line, quotes included; `-` clears the default.
  `-Xms`, `-Xmx` and `-jar` are left out, with a note, because the memory and the jar have questions
  of their own.
- **Link this folder to Pano?** Enter links it. `n` goes through the questions again with your
  answers as the defaults. `q` at any question, or Ctrl+D, quits without writing anything.
- **Pairing code**: the part after `--code` in the dialog's command, which shows a fresh code every
  minute. If Pano does not accept it — used already, or run out — the agent says so and asks for the
  current one instead of exiting.

**Defaults from a start script.** Before asking, the agent looks in the folder for `start.sh`,
`run.sh`, `start.command`, `start.bat`, `run.bat` or `start.cmd`, and reads the first line that runs
`java … -jar`: its jar, its `-Xmx` and its other Java flags become the defaults, and the agent says
`Found start.sh — using its settings as defaults.` A folder that already had a working script is
usually linked by pressing Enter. A line it cannot make sense of is ignored. The memory default is,
in this order, an `-Xmx` given to the agent itself (`java -Xmx4G -jar pano-agent.jar`), the start
script's, or 2G.

**Changing it later.** The answers are kept in `.pano-agent/launch.json` as a record and are used
once, when the server is linked. From then on the server's memory and Java arguments belong to Pano:
change them in its [Startup settings](../#startup-settings), not in that file.

#### Without a terminal {#agent-without-a-terminal}

- **Hosting panels** such as Pterodactyl pass their web console to the agent. Set the server jar to
  `pano-agent.jar` and start the server: the questions show up in the console one per line, and you
  type each answer into the console's command box.
- **The one-line form** — the dialog's command,
  `java -jar pano-agent.jar --pano '<address>' --code <code>` — needs no answers for the address and
  the code, and asks the other questions only in a real terminal. Anywhere else, such as a script or a panel's startup command, it links with the
  defaults: the jar it finds, the start script's settings, and 2G without one. `PANO_URL` and
  `PANO_PAIR_CODE` work like the two flags, for a panel that lets you set environment variables but
  not the command.
- **No questions at all**: `--no-input` or `PANO_AGENT_NO_INPUT=true` turns them off, and so does an
  input that is closed — a service, or `< /dev/null`. With an address and a code the agent links with
  the defaults; without them it prints how to link. Either way, a run that cannot pair exits with
  code **77**, which the service file it writes does not restart.
- **Once it is paired it never asks**: `java -jar pano-agent.jar` just starts the server.

### Starting it from then on

`java -jar pano-agent.jar` goes wherever the server jar was started before, and it starts the server
with it — unless *Start with Pano* is off in the server's [Startup settings](../#startup-settings).

- **A start script** (`start.sh`, `start.bat`): swap the server jar for `pano-agent.jar`. On the
  first run an `-Xmx` on that line is offered as the server's memory; after that the options there
  are for the agent, not the game: the server's memory and JVM arguments are set in its **Startup
  settings** in Pano.
- **screen or tmux**: `screen -S survival java -jar pano-agent.jar`, as before. Attach to it to see
  the console and type commands.
- **A service**: run `java -jar pano-agent.jar --service install` in the folder. It writes a service
  file for that folder — named `pano-agent-` plus a short id made from the folder's path, so several
  servers on one machine do not collide — that runs the agent there as the current user and restarts
  it after a failure. As [for a node](#service-files), the file is only written; the command that
  activates it is printed for you to run.
- **A hosting panel**: set the jar the server is started with — often a *Server Jar File* setting —
  to `pano-agent.jar`. The first run asks its questions in the panel's web console
  ([without a terminal](#agent-without-a-terminal)). If the console cannot send input, add `--pano`
  and `--code` to the startup command if the panel lets you edit it, or set `PANO_URL` and
  `PANO_PAIR_CODE` if it lets you set environment variables. Once it has paired, the agent ignores
  both, so leaving them in place does no harm.

Lines you type into the agent's terminal go to the server exactly like commands typed into Pano's
console, and show up in its history; while the server is stopped, the agent says so instead. The
agent itself is quiet: its own few lines — paired, connected, linked, an update, a refusal — are
marked `[Pano Agent]`, as are its warnings and errors, and everything else goes to
`.pano-agent/agent.log`.

### stop, Ctrl+C and Stop in Pano

| What you do | What happens |
| --- | --- |
| Type `stop` in the agent's terminal — or press a hosting panel's **Stop**, which types it for you | **Only the server stops.** The agent keeps running and Pano keeps managing the server; start it again from Pano. |
| **Stop** in Pano, or `stop` typed into Pano's console | The same: the server stops and the agent waits. |
| Ctrl+C, or a SIGTERM from `systemctl stop`, `docker stop` or a hosting panel | The agent stops the server gracefully — the same stop Pano uses, with its timeout — and then exits. |

**Only stopping the agent itself ends both.** That is deliberate: typing `stop` should never cut a
server off from Pano.

A crash is handled as on any node — *Restart after a crash* applies — and the agent keeps running
either way.

### Where its files are

```
survival/                  the server's folder
├── pano-agent.jar
├── server.json            Pano's record of the server
├── .pano-node/            process.json, while the server runs
└── .pano-agent/           the agent's own data
    ├── config.conf        its pairing: the token and the keys
    ├── agent.log          its log
    ├── java/              Java runtimes it downloaded for the server
    ├── backups/           the server's backups
    ├── updates/           a staged update of the agent
    └── cache/
```

- `.pano-agent/` is to the agent what [the data directory](#the-data-directory) is to a node, and it
  lives inside the server's folder: moving the folder moves the agent with it. `server.json` and
  `.pano-node/` are what [every node writes into a server directory](#what-it-writes-into-a-server-directory).
- **The panel stays out of it.** The file manager cannot see or change `.pano-agent/` or
  `.pano-node/`, backups leave out both along with the agent's jar, and a restore never writes into
  them.
- `config.conf` holds the agent's token — treat it like [a node's](#config-conf). **Copying the
  server folder to make a new server?** Leave `.pano-agent/` out and link the copy with a code of its
  own: two agents with one token are one node as far as Pano is concerned.

### Updates

The agent updates itself like any node: as soon as Pano has a newer one, unless
[`node-auto-update`](../../configuration/#managed-servers) is off, and otherwise by hand from
**Panel → Settings → Updates**.

What you start is a small **launcher**. The part that talks to Pano runs as a second process under
it, and the server as a third. An update downloads and checks the new jar, writes it over
`pano-agent.jar` and restarts only that middle process on the new version: **the server keeps
running** and nobody is disconnected, and the launcher — your terminal, screen session or service —
is not interrupted either. If that middle process ever stops unexpectedly, the launcher starts it
again after a short pause. On Windows the running jar is locked, so the new one has to be copied over
by hand, as [for a node](#linux-macos-and-windows).

### Removing it

Remove the server in Pano. Then

1. the server is stopped and Pano's own files come out of its folder — `server.json`, `.pano-node/`
   and the agent's `.pano-agent/` — while the worlds, the plugins and the configuration stay where
   they are;
2. the agent says it was removed from Pano and exits cleanly, so a service does not start it again;
3. `pano-agent.jar` stays behind: delete it, and start the server jar directly again, the way you did
   before.

## Running servers in containers

By default the daemon starts every managed server as an ordinary process on the host. Started with
`--runtime DOCKER` (or `PANO_NODE_RUNTIME=DOCKER`) it starts each of them in **its own Docker
container** instead.

```bash
java -jar pano-node.jar --data ./node-data --runtime DOCKER
```

- The host needs the **`docker` command** on `PATH` and the permission to use it. The daemon checks
  that at startup and refuses to start if Docker does not answer, rather than discovering it on the
  first server somebody tries to launch.
- **One container per server**, named after it, started from the official **`eclipse-temurin`**
  image for the Java version that server needs. The image is pulled the first time it is needed.
- The memory you set for the server becomes the container's memory limit, its game port is
  published, and its directory is mounted inside — so the worlds, the configuration and the plugins
  still live on the host, under `<data>/servers/<uuid>/`.
- Everything the panel does keeps working the same way: the console (the container's input and
  output), the power buttons, the process metrics, the file manager and the backups.
- **A Spigot server is still compiled out here on the host**, with the host's JDK and `git` (or
  [the node's own git](#git-for-buildtools)) — only
  the jar BuildTools produces ends up inside a container. See
  [Spigot is compiled on the node](../#spigot-is-compiled-on-the-node).

The runtime is reported to Pano when the daemon connects, so the Nodes page shows whether a machine
runs its servers as processes or in containers. Servers created before the switch are unaffected in
the panel, but they are launched the new way the next time they start.

## The container image

The daemon itself can also run in a container — that is what the **Coolify** bootstrap in the panel
deploys for you. The image is published with every Pano release as
**`ghcr.io/panomc/pano-node`**, tagged with the version (and `latest` for stable releases).

It carries no command line at all: everything is configured through the environment, and `/data` is
a volume.

```bash
docker run -d --name pano-node \
  -e PANO_URL=https://panel.example.com \
  -e PANO_PAIR_CODE=123456 \
  -e PANO_NODE_NAME=my-node \
  -e PANO_NODE_PORT_RANGE=25565-25600 \
  -v pano-node-data:/data \
  -p 25565-25600:25565-25600 \
  ghcr.io/panomc/pano-node:latest
```

- `PANO_NODE_DATA` is already set to `/data` in the image, and that directory is declared as a
  volume — mount one, or everything the node installs disappears with the container.
- Publish the **port range** the servers will use, and give the node **the same range** in
  `PANO_NODE_PORT_RANGE`. The node only gives its servers ports from that range (`node.port-range`
  in its `config.conf`, `25565-25600` unless told otherwise, which is also what the image exposes)
  and tells Pano, which allocates inside it. A port Pano asks for outside it is moved into it and
  reported, so a server never ends up on a port the container does not publish. The **Coolify**
  bootstrap sets `PANO_NODE_PORT_RANGE` for you to the range it publishes.
- Restart policy: the daemon exits with **75** when it has staged an update of itself, so give the
  container a plain `--restart unless-stopped` (or let Coolify restart it) and it comes back on the
  new version.

## The data directory

Everything the daemon owns lives under one directory, so it can be mounted as a single volume and
backed up as one thing. Nothing is written outside it.

```
node-data/
├── config.conf            the pairing, the keys and this node's settings
├── pano-node.lock         the lock that keeps one daemon per directory, held while it runs
├── pano-node.pid          the running daemon's process id
├── servers/<uuid>/        one directory per managed server: the jar, the worlds, the plugins
├── backups/<uuid>/        backup archives and their metadata
├── cache/spigot/          Spigot jars this node built, one per version, and BuildTools' own files
├── java/                  Java runtimes: the ones Pano downloaded and any you drop in yourself
├── cache/java/            Java archives while they download, deleted once unpacked
├── tools/git/             the portable git BuildTools uses on a host without one
├── cache/tools/           tool archives while they download, deleted once unpacked
├── updates/               a staged daemon update, waiting to be swapped in
├── .pano-node-retired     only after the node was removed from Pano: it will not start again
└── service/               the service file written by --service install
```

When Pano runs the node on its own machine, this is `<pano-dir>/node-data/` and the daemon's own
output goes to `<pano-dir>/logs/pano-node.log`.

**One daemon per data directory.** On startup — before it pairs, so a daemon that loses does not
register itself with Pano for nothing — the daemon takes an operating-system lock on
`pano-node.lock` and writes its process id into `pano-node.pid` next to it. A second daemon pointed
at the same directory finds the lock held, prints

```
Another pano-node is already running on /var/lib/pano-node (pid 4121); leaving it to it.
```

and exits with [76](#exit-codes) rather than starting. Two daemons on one directory would supervise
the same server processes and answer Pano as the same node, and nothing on either side is built to
survive that. The lock is held by the process itself, so a daemon that dies in any way at all
releases it; the pid file is only as fresh as the daemon that wrote it, and is there for that log
line and for Pano, which reads both to recognise a daemon that is already running instead of
starting a second one.

## What it writes into a server directory

A server directory belongs to whoever runs the server, so the daemon writes as little into it as it
can and **merges** rather than regenerates:

| What | |
| --- | --- |
| `server.json` | The node's own record of that server: its uuid, name, software, version, Java version, memory, JVM arguments, port, jar and the start/crash-restart switches. It is how the node still knows what it owns after a restart. The file manager cannot see it. |
| `.pano-node/process.json` | Written the moment a server is launched and deleted when that process exits under the daemon's watch: the process id, when it was started, the command and the runtime. It is what lets a restarted daemon [adopt a server that is still running](#what-survives-a-restart-of-the-daemon). |
| `eula.txt` | Written only when you ticked the Minecraft EULA in the panel, and on an import only when the file was not there already. |
| `server.properties` | The file is **merged, never rewritten**: the values from the wizard or from **Startup settings**, then the game port, and — only if the file had none — a `motd` and `max-players`. On an import only the port is touched. Everything else an operator or a plugin put there survives. |
| The Pano plugin | The plugin jar into `plugins/` (or `mods/`), and its `config.conf` written already paired, with an RSA key pair generated on the node. The path follows the platform: `plugins/Pano/config.conf` on the Bukkit family and BungeeCord, `plugins/pano/config.conf` on Velocity, `config/pano/config.conf` on Fabric. Owner-only permissions where the filesystem has them. |

The plugin jar itself comes from **Pano**, not from anywhere the node has to know about. When this
Pano has a build on disk — a development install pointed at one with
`managed-servers.plugin-jar-dir` — it publishes that jar at `GET /api/node/plugin-jars/<platform>`,
where the platform is `spigot`, `bungeecord`, `velocity` or `fabric`, and hands the node that path;
otherwise the node is pointed at the newest `PanoMC/pano-mc-plugin` release asset instead. Either
way the node downloads it like any other artifact, and keeps the file name it was served under.

Every URL Pano hands a node for something **Pano itself serves is relative**, that one included.
Pano does not know which address this particular node reaches it on — a LAN address behind NAT, an
SSH tunnel on `127.0.0.1`, the public hostname, all for the same Pano — and the one address certain
to work is the one the node is already connected over, so the node joins the path to that. Absolute
URLs, which is every third-party download from a Paper build to a Modrinth file, pass through
untouched.

The plugin's `config.conf` and the node's `server.json` hold credentials, which is why the
[file manager](../#files) refuses to show or touch them.

## Importing an existing server

When Pano is asked to [import a server](../#importing-a-server), the work happens here, and always
into a **new** directory under `<data>/servers/<uuid>/`:

- **From a folder on this host** the directory is **copied**, never moved — the original stays
  untouched, so a failed import costs nothing. Symbolic links are skipped rather than followed, a
  folder inside the node's own data directory is refused, and so is one with no server jar in it.
- **From an uploaded zip** the archive is pulled through Pano and unpacked. An entry that would land
  outside the target is refused, and a single top-level folder inside the archive is flattened away
  so that `my-server/server.jar` does not become `my-server/my-server/server.jar`.
- **From a modpack** the `.mrpack` is downloaded and read: every file in it that the server side
  needs is fetched, the pack's `overrides/` and then its `server-overrides/` are applied, and the
  loader the pack asks for is installed — Fabric and Quilt from their own metadata services, Forge
  and NeoForge by running the official installer.

Then the node **inspects what it ended up with** and tells Pano: which jar is the launchable one,
what software it looks like (from the jar's manifest, then its name), the Minecraft version (from
the jar, the pack metadata or `server.properties`), the port that is already configured, and the
Java version that version of Minecraft needs. Those are what the panel then shows — whatever you
typed in the wizard is only a hint.

The port is decided in that order too: the one you asked for, otherwise the one the imported
`server.properties` already used if it is free, otherwise the first free port in the node's range.

## config.conf

HOCON, like Pano's own `config.conf` and the Minecraft plugin's. It is written by the daemon
whenever the pairing changes — atomically, through a temporary file and a move, and with owner-only
permissions where the filesystem has them.

```jsonc
platform {
  url = "https://panel.example.com"
  token = "<the node's bearer token>"
  encryption-key = "<the AES-256 key, base64>"
}

node {
  name = "pano-node"
  public-key = "<RSA public key, base64>"
  private-key = "<RSA private key, base64>"

  stop-servers-on-exit = false

  port-range {
    start = 25565
    end = 25600
  }
}
```

- `platform.token`, `platform.encryption-key` and `node.private-key` are **secrets**. Anyone holding
  the first two can impersonate this node to your Pano. Treat the file the way you treat a private
  key: do not copy it between machines, do not commit it, and do not put it in a support ticket.
  If it leaks, delete the node in the panel and pair the machine again — the old token stops working.
- The **RSA pair** is generated once, at first pairing, and kept. Regenerating it would mean
  re-pairing, and a node that re-pairs on every restart would pile up rows in Pano.
- `node.stop-servers-on-exit` decides what happens to the Minecraft servers when the daemon itself
  stops. The default, **`false`**, leaves them running and
  [adopts them](#what-survives-a-restart-of-the-daemon) on the next start. Set it to `true` and the
  daemon stops every server it supervises on its way out, the way it used to.
- `node.java-auto-download` (default **`true`**) lets the node download a Java runtime a server needs
  and this host lacks — see [Java runtimes](#java-runtimes).
- `node.tool-auto-download` (default **`true`**) does the same for the tools a Spigot build needs —
  today only git — see [Git for BuildTools](#git-for-buildtools).
- `node.port-range` is the range of ports this node's servers may bind. The node announces it to
  Pano when it connects, and Pano allocates new servers' ports inside it; a port Pano asks for
  outside it (typed by hand, or from a Pano that does not know the range yet) is moved to a free one
  inside it and reported, like a port that is already taken. A port an adopted server's own
  `server.properties` already uses is kept. `--port-range` / `PANO_NODE_PORT_RANGE` write it on
  start; reversed bounds in a hand-edited file are corrected rather than rejected.
- `node.agent` and `node.agent-server` are only present on a [Pano Agent](#the-pano-agent), in
  `.pano-agent/config.conf`: the daemon runs that one server from where it is and refuses to install
  or import any other. Remove the server in the panel rather than editing them — that removes
  `.pano-agent/` and leaves the server's files where they are.
- If Pano rejects the token — because the node was deleted from the panel — the daemon says so and
  stops trying. Delete `config.conf` and pair again with a fresh code.

## Java runtimes {#java-runtimes}

The daemon itself needs Java 17+, but the **servers** it runs need whatever their Minecraft version
asks for — Java 8 for 1.16.4 and older, 16 for 1.16.5, 17 up to 1.20.4, 21 from 1.20.5, 25 from
26.1. The node uses two kinds of runtime and lists both on the node's page in the panel
(**Servers → Nodes → the node's name → Java runtimes**):

- **System** — found on the host: the JVM the daemon runs on, `JAVA_HOME`, `PATH` and the usual JDK
  folders (`/usr/lib/jvm`, `C:\Program Files\Java`, `/Library/Java/JavaVirtualMachines`, …). Pano
  uses them but never updates or deletes them.
- **Pano** — downloaded by the node into `<data>/java/<vendor>-<version>/`, for example
  `<data>/java/temurin-21.0.12+1/`. Nothing is installed system-wide and no root or administrator
  rights are needed.

When several runtimes of the same major are present, the **newest version** of that major is used,
whichever kind it is.

**Where downloads come from.** [Eclipse Temurin](https://adoptium.net) JREs, from the Adoptium API;
where Temurin has no build for that major on this machine — there is no Temurin 16 at all, no Java 8
for Apple Silicon and several gaps on Windows on ARM — the node falls back to
[Azul Zulu](https://www.azul.com/downloads/). musl systems such as Alpine get the musl builds. Every
archive is checked against the **SHA-256** its vendor publishes and deleted if it does not match;
it is unpacked with its paths checked (nothing may land outside the runtime's folder), the new
runtime has to answer `java -version`, and only then is it moved into place. A
`.pano-managed.json` file in its folder is how the node recognises it as one of its own.

**Automatic downloads.** When an install or a start needs a Java this host does not have, the node
works out which major — the one pinned in **Startup settings**, otherwise the minimum for the
Minecraft version, raised to what the jar itself requires — downloads it and continues. During an
install the download is part of the install's progress; before a start it is a separate
**Downloading Java** task and the server stays **Starting** meanwhile. A download that fails ends the
start with the reason, as a stop — not a crash, so crash-restart does not loop on it.

Turn it off with `node.java-auto-download = false` in [`config.conf`](#config-conf) (edit it while
the daemon is stopped) or with `PANO_NODE_JAVA_AUTO_DOWNLOAD=false`. A start that needs a missing
Java then fails with `No Java 21 runtime on this host; automatic Java download is disabled`, and
the server's overview offers to download it once.

**From the panel.** The node's **Java runtimes** card has **Install Java**, which lists the majors
this machine can download with their vendor, version, size and what they are for; majors neither
vendor builds for it are shown greyed out. A runtime Pano installed has **Update** when a newer build
of that major exists — the new one is installed next to the old, which is removed once nothing runs
from it — and **Remove**. Removal is refused while a running server was started from that runtime,
or while a server is pinned to that major and it is the last runtime of it; the button says which
servers are in the way. System runtimes cannot be removed from Pano. Installing and removing needs
the **Manage Nodes** permission and the node online, and a node older than this feature shows the
runtimes it has but offers no downloads until it is [updated](#updating-the-daemon).

**Hosts without internet.** Download a JDK or JRE yourself and unpack it into its own folder under
`<data>/java/` (for example `<data>/java/jdk-21/`, with `bin/java` inside). The node finds it on
its next start and lists it as a **System** runtime. The same works for any vendor and any major.

Leftovers of an interrupted download or removal (`<data>/java/.tmp-*`, `<data>/java/.trash-*`,
archives in `<data>/cache/java/`) are cleaned up when the daemon starts.

## Git for BuildTools {#git-for-buildtools}

[Spigot](../#spigot-is-compiled-on-the-node) is compiled with BuildTools, which clones with its own
built-in git library but still runs `git` for local work such as applying the Spigot patches. You no
longer have to install it. The node finds one in this order:

1. **A git on the host's `PATH`** wins, and nothing is downloaded.
2. **On Windows**, nothing more is needed: BuildTools downloads its own PortableGit (about 60 MB per
   Spigot version) into its working directory.
3. **On Linux and macOS**, the node downloads a small git (about 8 MB, x64 and arm64) published with
   Pano's releases on GitHub as `pano-git-<os>-<arch>.tar.gz`. It is checked against its SHA-256,
   unpacked into `<data>/tools/git/<os>-<arch>-<version>/` and has to answer `git --version`.

The node's git is put in front of `PATH` **only for the BuildTools process** — it is never installed
system-wide, and neither your shell nor the servers see it. Once downloaded it is reused by every
later build, even with downloads turned off. The download is part of the install's progress
(*Downloading git …*).

Turn it off with `node.tool-auto-download = false` in [`config.conf`](#config-conf) (edit it while
the daemon is stopped) or with `PANO_NODE_TOOL_AUTO_DOWNLOAD=false`. A Spigot install on a host
without git then fails before anything is compiled:

```
Git is not installed on this node and automatic tool download is disabled; BuildTools needs it (apt install git / pacman -S git / brew install git).
```

A download that fails says why and names the same packages. On a host without internet, install git
with the system's package manager.

## Protocol version

The daemon speaks **protocol version 2** and announces it, along with its own version, the operating
system, the architecture, the CPU, memory and disk it has, the Java runtimes it found and the
servers it already owns, the moment it connects.

It also answers `CONSOLE_HISTORY`, the request behind the console's **Load older** button: a page of
lines read back out of that server's `logs/latest.log` and its rotated archives, with a `skip`
counted from the end of the log and a `hasMore` saying whether anything older was left behind.

Pano **accepts a node that speaks an older version** rather than refusing it and leaves out what
that version cannot do — the same tolerance it already extends to older Minecraft plugins. Protocol
**2** added the request behind
[identifying jars Pano did not install](../#identifying-jars-pano-did-not-install): a node below it
is simply not offered the **Identify sources** button, because a button whose only possible answer
is "this node cannot do that" is worse than no button.
[Update the node](#updating-the-daemon) from the Nodes page and it appears.

This is why the jar should come from the Pano release you are running: the two ship together, so
their protocol always matches. A daemon that is older than the Pano it talks to will not understand
the newest messages — an install that never leaves "pending" is the usual symptom, and the fix is to
update the jar and restart the daemon.

## What survives a restart of the daemon

Stopping the daemon does **not** stop the Minecraft servers on that machine. A daemon that is
restarted, updated or killed leaves every server it supervises running — it says how many it left
behind on its way out — and picks them up again on its next start. Players stay in their worlds
through an update of the node, and the only thing that changes for the few seconds the daemon is
away is that the panel cannot ask it anything.

It can do that because of one small file. Right after it spawns a server, the daemon writes
`<server dir>/.pano-node/process.json` — the process id, the instant it was started, the command and
the runtime (a plain process, or the name of its Docker container) — and deletes it again when that
process exits under its own watch. On the next start it reads those records back and **adopts**
whatever is still there. A record is only believed when

- the process id is still alive,
- that process started when the record says it did, give or take a few seconds — otherwise the
  operating system has since handed the number to something else entirely,
- and its command line really is that server (or, on the Docker runtime, the container is still
  running).

A record that fails any of those is stale: it is deleted and the server is reported **Stopped**. One
that passes is reported to Pano as running, with an *adopted* badge in the panel.

An adopted server behaves like any other, with one exception: the daemon inherited the process but
not its **standard input**, because that pipe belonged to the daemon that is gone. The console still
streams — the node follows `logs/latest.log` from where it is, across rotation — its history still
pages back through the log files, the metrics keep coming and **Stop**, **Restart** and **Kill** all
work, using the operating system's own signals. Only typing into the server is unavailable, and Pano
routes commands through the [Pano plugin](../#adopted-servers) instead where the server has one. One
restart from the panel and the node owns the process properly again.

**An adopted server that dies is not restarted automatically**, whatever *Restart after a crash*
says. The daemon did not start that process, so it cannot tell a crash apart from an operator
stopping the server by hand on the machine — and starting a server back up that somebody
deliberately shut down is the worse mistake of the two.

> Set `node.stop-servers-on-exit = true` in [`config.conf`](#config-conf) to have the daemon stop
> its servers when it exits, as it used to. The default is `false`.

## Updating the daemon

A node used to stay on whatever daemon it was installed with until somebody logged into the machine
and replaced the jar by hand. It does not have to: Pano serves [its own daemon](#getting-it), so
updating a node is one button.

**Panel → Servers → Nodes** marks a node whose daemon is not the one this Pano would hand it with an
**Update available** badge, and the action beside it updates that node in place. It needs the
**Manage Nodes** permission and is `POST /api/panel/nodes/:id/update` underneath.

How "not the one this Pano would hand it" is decided depends on what the two sides are:

- **Release builds** are compared by **version**: every Pano release carries its daemon, and Pano
  keeps its copy on that release — when it starts, it downloads its own release's `pano-node.jar`
  if it has none or one from another version (for example right after Pano updated itself). So the
  two move together and the version strings are enough.
- **Development builds** both call themselves `local-build` forever and are nonetheless rebuilt
  several times an hour. There the answer comes from the **SHA-256** the node reports when it
  connects, against the checksum of the jar Pano is serving right now.
- **Unknown is never "yes".** A node that reported no version, or a Pano with no jar to serve, gets
  no badge at all: offering an update that cannot be delivered is worse than not offering one.

Pressing it, Pano first checks whether that node is already running those exact bytes and answers
`upToDate: true` if it is. That is not a formality — sending the update anyway would have the daemon
download the jar it is executing from, stage it over itself and restart, which costs every server on
that node a minute of downtime to end up exactly where it started. Otherwise Pano sends a
`SELF_UPDATE` carrying the version, the checksum and the jar's **relative** URL, which the node
resolves against the address it is already connected on. The daemon then

1. downloads the jar, reporting progress into the panel as a `SELF_UPDATE` task,
2. **verifies the SHA-256**, and that what arrived is a jar at all — this is the one place where the
   daemon downloads code and then runs it as itself, so a mismatch deletes the file and fails the
   task rather than installing anything,
3. stages it under `<data>/updates/` together with a note of what is waiting,
4. shuts down, **moves the staged jar over its own on the way out**, and exits with **75**.

Exit code 75 means "I staged an update of myself, start me again" — see [Exit codes](#exit-codes).
Whatever supervises the daemon is what actually restarts it: the systemd unit the
[install script](../#remote-nodes) writes sets both `SuccessExitStatus=75` and `Restart=always`, a
container wants a restart policy (`--restart unless-stopped`, or Coolify's own), and Pano's
supervisor for the local node already treats it as a restart. Because the swap happens on the way
out, **one restart is enough**: the process that is started next is already the new jar. Measured
locally, the node is offline for about **three seconds**.

A swap that could not happen leaves the staged jar and its note in `<data>/updates/`, and the
daemon tries again the next time it starts rather than downloading anything a second time; a retry
that succeeds exits 75 once more, for one more restart. If nothing restarts the daemon at all, the
node simply stays down with the update still waiting.

An update is a restart of the daemon, but **not of the servers it supervises**: they keep running
through it and are [adopted again](#what-survives-a-restart-of-the-daemon) when the daemon comes
back, so nobody is disconnected and no world is saved and reloaded for it. What is offline for those
few seconds is the node, not the game. The one thing a server notices afterwards is the console's
command input — the daemon has no pipe into a process it did not start — which the Pano plugin
covers until that server is next restarted from the panel.

**On Windows** the jar a running process was started from is locked, so the swap fails — on the way
out and on the retry alike. The daemon tells you where the new jar is and you copy it over the old
one yourself — see [Linux, macOS and Windows](#linux-macos-and-windows).

## Removing a node {#removing-a-node}

**Deleting a node deletes everything on it.** **Panel → Servers → Nodes → Delete** (or **Delete
node** on the node's own page) needs the **Manage Nodes** permission, the node's name typed out and
your account password, and it is `POST /api/panel/nodes/:id/delete` underneath. Before you confirm,
the dialog lists what goes with it: every server on the node, how many backups they have and how
much space those take, and the Java runtimes Pano downloaded there.

When the node is **online**, Pano asks the daemon to uninstall itself and waits for it — up to two
minutes, with the progress shown in the dialog. The daemon

1. stops every server on it, the way deleting a server does (a graceful stop, then terminate, then
   kill), and stops its schedules, backups and transfers;
2. deletes `servers/`, `backups/`, `java/`, `tools/`, `cache/`, its logs and its runtime files, keeping
   only a marker file, `<data>/.pano-node-retired`;
3. removes its own service where it can: the unit written by `--service install`, or — when it runs
   as root — the `pano-node` systemd unit and `/opt/pano-node` that the
   [install script](../#remote-nodes) created;
4. reports back, disconnects, deletes `config.conf` and whatever else of the data directory it can,
   and exits with [**78**](#exit-codes).

Pano then deletes every server of that node from its database — each one written to the activity log
like a normal server delete — along with the node's token, backups, tasks and alerts, and finally
the node itself.

**What still has to be done by hand.** Whatever the daemon could not remove itself comes back as a
short list of commands, shown under **Finish removing it from the machine** with a copy button. It
depends on how the node was installed:

| Installed with | What you run afterwards |
| --- | --- |
| `install.sh` as root | Usually nothing: the daemon disables and removes its own unit. If it could not, `sudo systemctl disable --now pano-node`, `sudo rm -rf /etc/systemd/system/pano-node.service /etc/pano-node /opt/pano-node /var/lib/pano-node`, `sudo systemctl daemon-reload` and `sudo userdel pano-node`. |
| `install.sh --user-install` | `rm -rf ~/.pano-node` |
| `--service install` (Linux) | `systemctl disable --now pano-node` and removing the copied unit, then the data directory. |
| `--service install` (macOS) | `launchctl unload` and deleting `~/Library/LaunchAgents/com.panomc.node.plist`, then the data directory. |
| Windows installer or service | `sc.exe stop PanoNode`, `sc.exe delete PanoNode`, then `Remove-Item` on its folders. |
| Coolify or another container | Delete the pano-node application **with its persistent storage** in Coolify, or `docker rm -f` the container and `docker volume rm` its volume. |
| Started by hand | `rm -rf` the data directory. The jar is only pointed at: delete it yourself if no other node runs from it. |

**The retired marker.** A daemon that starts on a data directory containing `.pano-node-retired`
logs `This node was removed from Pano; nothing to do` and exits with 78 straight away: it does not
pair again and does not reconnect in a loop. The systemd units Pano writes set
`RestartPreventExitStatus=78`, so systemd stops restarting it too. Delete the directory (or at least
the marker) before you want to use that machine as a node again.

**An offline node.** A node that is not connected cannot remove anything, so Pano refuses with
`NODE_OFFLINE` and the dialog says *The node is offline — Pano can only forget it; files stay on the
machine*. Tick **Remove from Pano anyway** to delete it from Pano regardless (`force: true`): the
servers and the node disappear from the panel, nothing is deleted on the machine, and the dialog
shows the steps Pano can work out from how the node was installed — including deleting its data
directory. The same choice appears when the uninstall itself fails (`NODE_UNINSTALL_FAILED`, with
the node's own error) or when the daemon is too old to uninstall itself — update it first to remove
it cleanly.

**The local node** is removed the same way, except that Pano stops supervising it first, so the exit
does not start it again, and then deletes its `node-data` directory itself. The node goes back to
*not set up*, and **Add node → Local** sets up a fresh one.

## Exit codes

| Code | |
| --- | --- |
| **0** | A clean shutdown. Also what `--help` and `--service install` / `--service uninstall` end with. |
| **1** | It could not pair: no Pano URL, no pairing code or bootstrap token, or Pano refused the pairing. |
| **2** | The command line was wrong — it prints the usage text. Also `--service install` when the daemon was not started from a jar. |
| **75** | **"I have staged an update of myself, start me again"** — not a failure. |
| **76** | **Another daemon already holds this data directory** — not a failure either, and nothing to restart: the one that is running is the node. |
| **78** | **This node was removed from Pano** — it uninstalled itself, or it found the `.pano-node-retired` marker on startup. Never restart it. See [Removing a node](#removing-a-node). |

`75` is the one that matters for whatever supervises the daemon. The new jar is downloaded and
checked into `<data>/updates/` while the node is still running, and moved over the jar the daemon
was started from **on the way out**, after everything has been stopped and just before the process
ends — so the one that is started next is already the new daemon and a single restart is enough. So:

- the systemd unit written by `--service install` sets `SuccessExitStatus=75`,
- the unit the [install script](../#remote-nodes) writes sets it too,
- Pano's own supervisor for the local node treats it as a restart,
- a hand-rolled wrapper or a container restart policy should simply start the process again.

A `Restart=always` policy also works, because the daemon is expected to come straight back. A swap
that could not happen is retried the next time the daemon starts, and a retry that succeeds exits 75
again for one more restart; on Windows the jar stays locked either way and you copy it over by hand.

`78` is the opposite of 75: the node was [removed](#removing-a-node) and must stay down. The units
Pano writes set `RestartPreventExitStatus=78`, Pano's supervisor for the local node never restarts
it, and a hand-rolled wrapper or a container restart policy should treat it as final too. Those
units list it in `SuccessExitStatus=75 78 143` as well, next to `143` (the JVM leaving on the
SIGTERM of `systemctl stop`), so neither a retirement nor a stop shows the unit as failed.

`76` asks nothing of the supervisor: the daemon found the lock on its data directory held by another
one, said so and stopped, which is the right outcome rather than something to start again. See
[the data directory](#the-data-directory).

## Service files

`--service install` **writes** a unit file into `<data>/service/` and prints the one command that
activates it. It never runs that command itself: registering a service needs root on all three
operating systems, and a daemon whose whole point is to be startable inside a container by an
unprivileged user should not quietly escalate — nor refuse to run because it could not.

| Host | File | Activate with |
| --- | --- | --- |
| Linux | `pano-node.service` | Copy to `/etc/systemd/system` and run `systemctl enable --now pano-node` |
| macOS | `com.panomc.node.plist` | Copy to `~/Library/LaunchAgents` and run `launchctl load com.panomc.node.plist` |
| Windows | `pano-node-service.cmd` | Run it from an elevated prompt — it registers the service with `sc create` |

`--service uninstall` deletes the file and prints the matching `systemctl disable --now pano-node`,
`launchctl unload` or `sc delete PanoNode`.

## Linux, macOS and Windows

The jar is portable and the daemon is supported on **Linux, macOS and Windows**, on x64 and arm64
(arm32 is best-effort). What differs between them is isolated, and worth knowing about:

- **Stopping a server.** Windows has no signal that asks a process to shut down politely, so the
  sequence there is the server's own stop command, then terminate, then kill — the same three steps
  Pano shows you, with the middle one doing less than it does on Linux and macOS. Give a big world a
  moment longer to save.
- **Service registration** differs as described above; there is no unit file on Windows, only a
  script that calls `sc create`.
- **Self-update.** Windows locks the jar a process is running from, so the swap fails there and the
  daemon tells you where the new jar is — **copy it over the old one and start the service again**.
  On Linux and macOS the swap happens by itself. An installer that handles this on Windows is
  planned.
- **Paths and permissions** are handled per platform; the owner-only permissions on `config.conf`
  are applied where the filesystem supports them.

## Security

- **Outbound only.** The daemon opens the connection to Pano and keeps it; Pano never connects to
  the node, and **no port has to be opened** on the node's side. It works behind NAT and a firewall
  that allows nothing inbound.
- **Authenticated and encrypted.** Pairing hands over an AES-256 key wrapped with the node's own RSA
  public key, over the URL you gave it — use **HTTPS** for a node that is not on the same machine.
  The WebSocket then carries a JWT bearer token, and every frame on it is **AES-256-GCM** encrypted,
  exactly like the Minecraft plugin's connection.
- **A pairing code is short-lived.** Six digits, rotating every 30 seconds, and a node that pairs
  with one is **not trusted until an administrator accepts it** in the panel. Accept only machines
  you set up yourself.
- **The filesystem is sandboxed.** Every path Pano sends is normalised and checked to be inside that
  one server's directory; `..`, absolute paths and symlinks pointing out of it are refused, and a
  denylist keeps the panel away from the files that hold credentials — the Pano plugin's own
  `config.conf` among them.
- **No shell.** Servers are launched as an argument list, never through a shell, so nothing in a
  name, a flag or a path can become a second command. The daemon also strips `JAVA_TOOL_OPTIONS`,
  `_JAVA_OPTIONS`, `JDK_JAVA_OPTIONS` and `CLASSPATH` from what a server inherits, so flags meant
  for the daemon never reach the game.
- **It does not escalate.** The daemon runs as whatever user started it and writes only inside its
  data directory.

## Need help?

- Check the [FAQ page](../../FAQ/)
- Ask on our [Discord community](https://discord.gg/6vVy72wgXT)
- Open an issue on [GitHub](https://github.com/PanoMC/Pano/issues)
