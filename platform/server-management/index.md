# Server Management

Pano manages the Minecraft servers you link to it, from the panel: a **live console** with a command
input, the **online roster** with player actions, the **installed plugin list**, **power controls**
and **performance metrics**. Everything travels over the one encrypted WebSocket connection the
[Pano MC Plugin](../integrations/) already opens — there is no agent to install on the game server
and Pano needs no access to the machine it runs on.

> Server management is part of **Pano core**. It was once planned as a separate plugin; that plugin
> was retired before it ever did anything and nothing extra has to be installed on the Pano side.
> See [Server Management Plugin](../../plugins/server-management/).

> ⚠️ These features ship on the **alpha** channel first, together with a `pano-mc-plugin` release
> from its own `alpha` channel. They reach `beta` and then stable in the usual order, so a stable
> installation may not have them yet.

## What a linked server is

A **linked** server is a Minecraft server that runs wherever you run it — your own machine, a game
host, a container — and talks to Pano through the Pano MC Plugin. Pano has no filesystem and no
process access to it; it can only ask the plugin to do something, and the plugin answers.

Linking one takes three steps:

1. **Install the plugin.** Download the jar for your platform from the
   [Pano MC Plugin releases](https://github.com/PanoMC/pano-mc-plugin/releases), drop it into your
   server's `plugins/` (or `mods/`) folder and restart the server. See the
   [installation guide](../installation/#connecting-your-minecraft-server-optional) for the full
   walkthrough.
2. **Run the connect command.** In the panel, open the **server switcher** in the top bar and press
   **Add server**. The modal shows a ready-made command:

   ```
   /pano connect <platform-address> <platform-code>
   ```

   Run it in your Minecraft server console (or in-game as an operator). The code rotates every 30
   seconds, so copy it fresh.
3. **Accept the request.** Pano tells everyone who may manage servers that a server asked to
   connect and opens the approval dialog. Confirm it — giving the server a **panel display name**
   if you like — and the connection is live.

Everything below then works without any further setup.

> Pano can also **create and run** a server for you, on a machine that runs the `pano-node` daemon.
> Those are *managed* servers: Pano owns the process, so it can start and kill it, read the boot log
> and install the plugin itself. See [Managed servers](#managed-servers) below.

> A server can therefore be attached to Pano in three ways — **a node only**, **the plugin only**, or
> **both** — and every feature is served by whichever of the two can do it best.
> [What works with what](what-works-with-what/) is the matrix.

## Requirements

- **Pano MC Plugin speaking protocol version 2.** The plugin announces its protocol version,
  its own version and a list of capabilities when it connects. Older plugins say nothing, so Pano
  treats them as legacy: the server still works exactly as it did before, and the console, players,
  plugins, power and metrics sections are still listed — they simply open with their controls
  disabled and a line saying what to update, and the overview carries an **Update pano-mc-plugin**
  notice. Updating the jar and restarting the Minecraft server is all it takes. A server that also
  sits on a [node](#nodes) loses much less: whatever the plugin cannot announce
  [falls back to the node](what-works-with-what/).
- **A supported platform.** What a server can do depends on the software it runs — see the table
  below. The header of every server page shows the protocol and plugin version Pano sees, and the
  overview lists the capabilities that server announced.

### What each platform can do

| | Paper · Folia · Purpur | Spigot · CraftBukkit | Velocity · BungeeCord | Fabric |
| --- | --- | --- | --- | --- |
| Console stream and commands | Yes | Yes | Yes | Yes |
| Stop / Restart | Yes | Yes | Stop only | Stop only |
| TPS | Yes | Yes | — (no world) | Yes |
| MSPT | Yes | — | — (no world) | Yes |
| Memory, CPU, player count | Yes | Yes | Yes | Yes |
| Roster, kick, message | Yes | Yes | Yes | Yes |
| OP / de-OP / gamemode | Yes | Yes | — (no world) | Yes |
| Whitelist commands | Yes | Yes | Forwarded as a command | Yes |
| Plugin / mod list | Yes | Yes | Read-only | Read-only (mods) |
| Enable / disable a plugin | Yes | Yes | — | — |

Vanilla, Forge and NeoForge have no Pano plugin module, so they cannot be *linked* at all. Vanilla
can still be run as a [managed server](#managed-servers), where the console and the power buttons
come from the node rather than from a plugin; Forge and NeoForge are not in the catalog yet.

## The panel layout

Server management lives behind the **Server** pill in the panel sidebar, and the sidebar lists one
thing: the sections of the server you are looking at. Everything around it is in the top bar.

- **The server switcher** carries the selected server's name. Clicking it opens the servers modal —
  every server you may see, a search box for when there are many, and the **Add server** button next
  to the title.
- **The node icon** beside the switcher opens the [Nodes](#nodes) page and stays lit while you are
  on it. It is there only for an account with the **Manage Nodes** permission.
- **The pills follow the page.** Everything under `/panel/servers` shows the server menu and every
  other address shows the site menu, so the sidebar always matches what is on screen. Clicking a
  pill yourself overrides that until the next page you open.

| Page | Address | Permission |
| --- | --- | --- |
| Nodes | `/panel/servers/nodes` | Manage Nodes |
| Overview | `/panel/servers/<id>` | Manage Servers |
| Console | `/panel/servers/<id>/console` | Manage Server Console |
| Players | `/panel/servers/<id>/players` | Manage Server Players |
| Files | `/panel/servers/<id>/files` | Manage Server Files |
| Plugins | `/panel/servers/<id>/plugins` | Manage Server Plugins |
| Backups | `/panel/servers/<id>/backups` | Manage Server Backups |
| Schedules | `/panel/servers/<id>/schedules` | Manage Server Schedules |
| Settings | `/panel/servers/<id>/settings` | Manage Servers |
| Activity | `/panel/servers/<id>/settings/activity` | Manage Servers |

Every address is a real URL: it can be bookmarked, shared with a colleague and opened in a second
tab on another server without the two fighting over a "currently selected server".

A section the server's current setup cannot serve is **listed anyway**. The page opens with its
controls disabled and a notice naming what is missing — *The Pano plugin on this server does not
provide Console*, *… is too old for Console. Update pano-mc-plugin on the server.*, *The node is
offline*, *Neither the node nor the Pano plugin can do this right now.* A hidden entry only left
people looking for a page that was never there. Which of the two sides actually answers a given page
depends on what is attached to the server — see [What works with what](what-works-with-what/) — and
the overview lists what that server announced.

## Console

The console page shows the server log as it happens, with an input box underneath.

- **History first.** Opening the page shows the **last 500 lines**, oldest first, and live lines
  follow. Pano keeps the newest **2 000 lines** per server in memory — memory only, never written to
  the database — and whatever is missing from that is read out of the server's own log files when
  the page asks for it: `logs/latest.log`, then the rotated `logs/*.log.gz` archives beside it. So
  the console opens on the boot log, or on last night's crash, even though Pano and the node have
  been restarted since. Nothing is tailed in the background and nothing is cached: a request reads a
  bounded window from the end of those files and lets go of it again.
- **Load older.** When something older is still there, a **Load older** button sits above the output
  and fetches another **500 lines** each time you press it, leaving the view on the line you were
  reading. It disappears when the logs run out. A [managed server](#managed-servers) pages through
  its node, which is running whether the server is or not, so the log of a stopped server can be
  read to its beginning; a **linked** server pages through its Pano plugin, so it can only page
  **while that server is online and connected**. A plugin too old to answer, or one whose console
  capture is [switched off](#plugin-configuration), reports no file history at all.
- **Timestamps from a file are second-precision.** `[12:34:56]` is the only clock a Minecraft log
  line carries, so a line read back out of a file is placed on that second; live lines keep the
  millisecond Pano stamped them with.
- **A plain BungeeCord has no file history.** It writes `proxy.log` in the server root instead of a
  `logs/` directory, so there is nothing to read back there — the live stream and Pano's own buffer
  are all of it. Waterfall writes `logs/latest.log` like everything else and pages normally.
- **Only while someone is watching.** The plugin starts streaming when the first viewer opens the
  page and stops 30 seconds after the last one leaves, so an unwatched server sends nothing.
- **Sending commands.** Type a command and press <kbd>Enter</kbd>; a leading `/` is optional. The
  <kbd>↑</kbd> and <kbd>↓</kbd> arrows browse the commands you sent to that server before (the
  history is kept in your own browser).
- **Everyone sees who ran what.** A command is echoed into the console before it runs, prefixed with
  the person who sent it:

  ```
  [Pano:admin] > say hello
  ```

  The command itself is not acknowledged separately — whatever it prints simply appears in the log.
- **Rate limit.** 10 commands per 10 seconds, per user and per server. Going over gets you a
  "too many requests" toast, not a queue. A single command may be at most 1 KB long.
- **Flood protection.** The plugin batches lines (every 250 ms, or every 100 lines) and sends at most
  500 lines per second. A server that spews more than that has its oldest lines dropped and the page
  shows a `... N lines dropped` marker where they were, so a stack-trace storm can never take the
  connection down.
- **Colours.** Terminal colour codes are stripped on the game server, before the line is sent.

The page also has a filter box, a pause/auto-scroll pill, timestamps you can switch on, **Copy
visible**, a download button for the whole `logs/latest.log` (it needs the files permission), and
<kbd>Ctrl</kbd>+<kbd>L</kbd> to clear your own view (nothing is deleted on the server).

**Find searches every log file the server kept**, not just what the console can scroll back to:
`latest.log` first, then the rotated `.log.gz` files, newest first. Matches appear as they are found,
with a line above the console counting the files searched; **Stop** ends it early. It shows the
newest 5,000 matches at most — a sharper search is the way to older ones.

## Players

The players page is the live roster of that server: username, UUID, ping, game mode, session length,
an **OP** and a **Whitelisted** badge, and the usual actions. The plugin reports each player's OP,
whitelist and game mode, and sends a fresh sample within a second of any of them changing — from the
panel or from an `/op` typed in game — so the badges and the menu follow along without a reload. The
menu only offers the action that changes something: *Take OP* for an operator, *Give OP* for anyone
else, and the current game mode is ticked.

| Action | How it is carried out |
| --- | --- |
| Kick | The plugin kicks the player directly, with the reason you type. |
| Message | The plugin sends your text to that player in chat. |
| Give OP / Take OP | `op` / `deop`, run as a console command. |
| Gamemode | `gamemode <mode> <player>` — survival, creative, adventure or spectator. |
| Whitelist add / remove | `whitelist add` / `whitelist remove`, run as a console command. |
| Ban | A player with a Pano account (same username) gets a **Pano ban**, described below. Anyone else is added to that server's own ban list with `ban <player> [reason]`. |

The commands are composed by Pano, on the server, from the username it already has on record — never
from anything typed into the panel — and a name that is not a valid Minecraft username never reaches
a command line.

> Proxies (Velocity, BungeeCord) run no world, so **OP, de-OP and gamemode do not exist there** and
> are refused. Kick and message work as usual; whitelist commands are forwarded to the proxy, where
> they only do something if a plugin there implements them.

### Banning from the roster

A Pano ban is the same ban the Players page issues, with the same reason, duration and email options:
the account is signed out of the website, and every server with ban integration kicks the player and
refuses them at login until the ban ends. It needs the global *Manage players* permission, not just
this server's. On a server that does not enforce Pano bans itself — ban integration switched off, or
a server with no Pano plugin — the player is also removed there directly: a permanent ban becomes
the server's own `ban`, a temporary one a kick.

A player without a Pano account has nothing for Pano to ban, so the modal says so and the ban goes to
that server's own ban list only, with no end date. Proxies have no such list, so there the button is
disabled for them. Everything about Pano bans is in
[Ban Management](../integrations/ban-management/).

> **A server with no Pano plugin in it still has a roster**, if it sits on a node: the node asks the
> server the same question a multiplayer list asks — a **server list ping** — which gives the exact
> player count and up to twelve names. The page says where the list came from, because a sample is
> not a roster. Player actions there are console commands, composed by Pano exactly as above and
> written to the server's input. See [What works with what](what-works-with-what/).

## Plugins

The plugins page lists what the server reported: name, version, authors, description and whether the
plugin is enabled. Fabric servers list **mods** in the same table. The list is refreshed whenever the
server reconnects, and again after every toggle.

**Enabling and disabling** a plugin works only on the Bukkit family — Paper, Spigot, CraftBukkit,
Folia and Purpur — because that is the only platform with a runtime plugin manager. Velocity,
BungeeCord and Fabric load their plugins and mods once at boot, so their lists are read-only.

> ⚠️ Not every plugin survives being enabled or disabled while the server runs; many register their
> listeners and commands only at startup. Restart the server afterwards if something misbehaves.

A server with **no Pano plugin in it** still has a plugin list, if it sits on a node: the node reads
the jars in the folder instead — name, version and whether the file is disabled — which is also what
you see while a server is stopped. That list is what is on disk rather than what the server loaded,
and the page says so.

Plugins and mods can also be **installed** from the panel and removed again, on any server with a
node behind it or a Pano plugin new enough to do it itself — see
[Plugins and mods](#plugins-and-mods).

## Power

The server header carries the power buttons. For a linked server, two of them work:

- **Stop** — the plugin shuts the server down through its own platform API. Everyone playing is
  disconnected, and because Pano does not own the process, **nothing starts it again**: someone has
  to bring it back up on the host.
- **Restart** — on Paper and Spigot this uses the server's own restart support, which needs a
  working `restart-script` in `spigot.yml` (and a wrapper that actually re-launches the jar).
  Without one, and on every other platform, a restart simply stops the server and logs a warning.

**Start** and **Kill** are greyed out on a linked server: they need Pano to own the process, which is
what a node gives it. Both work on a [managed server](#managed-servers).

Each button asks for confirmation before it fires, and both actions land in the activity log.

## Performance metrics

While a server is connected, the plugin sends a sample **every 10 seconds** — whether or not anyone
is looking at the panel. A sample carries TPS (1, 5 and 15 minute averages), MSPT, JVM memory used
and maximum, process CPU, the player count and the roster with pings. It is a few hundred bytes.

Pano keeps the newest sample in memory for the live figures on the overview, and writes **one row
per minute** for every online server into the database for the chart. That history is pruned
**daily to the last 30 days**; the chart can be read over the last hour, day, week or month.

Proxies report no TPS and no MSPT — they run no world. Plain Spigot and CraftBukkit report TPS but no
MSPT, which needs Paper's API.

## Managed servers

> ⚠️ Managed servers, nodes and the `pano-node` daemon ship on the **alpha** channel first. They
> reach `beta` and then stable in the usual order, so a stable installation may not have them yet.

A **linked** server is one you run and Pano talks to. A **managed** server is one **Pano runs**: it
creates the directory, downloads the server jar, writes `server.properties`, starts and stops the
process and reads the console straight from its output. The work is done by a small daemon called
**`pano-node`** on the machine that hosts the server — see the
[pano-node reference](pano-node/) for its flags, files and security model.

The two are not alternatives, they **compose**. Everything described above comes from the Minecraft
plugin, and Pano installs that plugin into every server it creates, so a managed server is a linked
server as well and has both sets of abilities. The node adds everything that is about the machine —
creating, reinstalling and deleting a server, **Start** and **Kill**, the startup settings, the
files, the backups, the console of a server that is stopped, the process's own CPU and memory — and
the plugin keeps providing everything that can only be known from inside the running game: TPS,
MSPT, the heap, the real roster and the plugins that actually loaded.

Neither half is required, though. A server with **only a node** and no Pano plugin in it, and a
server with **only the plugin** and no node, are both fully-fledged servers in the panel. Every
feature is served by whichever side can do it, and by the better of the two when both are there:
**[What works with what](what-works-with-what/)** is the full matrix, feature by feature.

That is also why the panel never gates on "linked" or "managed" — it gates on what this server can
actually do right now. A section whose sources are all missing still opens, with its controls
disabled and a notice naming what would bring them back: install the Pano plugin, update it, attach
a node, wait for an offline node to come back, or start the server.

### Nodes

A **node** is a machine that can run managed servers. It runs the `pano-node` daemon, which connects
**outwards** to Pano over the same kind of encrypted WebSocket the Minecraft plugin uses: nothing
has to be opened on the node's side, and Pano never logs into it.

The Nodes page is the **node icon** next to the server switcher in the top bar
(`/panel/servers/nodes`), behind the **Manage Nodes** permission. The table shows each node's kind,
status, version, operating system, how many servers it holds and its CPU, RAM and disk.

#### The local node

The machine Pano itself runs on can be a node, and that is the one-click case: the node icon →
**Add node** → **Local**.

Pano then

1. finds `pano-node.jar` — next to its own jar, in its working directory, or downloaded from the
   Pano release it is running and verified against the `pano-node.jar.sha256` published beside it,
2. starts it with a one-time bootstrap token, so there is no pairing code to type and the node is
   approved from the start,
3. supervises it, the way it already supervises the processes behind the panel and your theme.

What it needs from the host:

- **Java 17 or newer.** Pano itself still runs on Java 11+, but the daemon does not: handed a Java
  11 it dies with `UnsupportedClassVersionError` every time it is started. Pano looks for a suitable
  runtime — the JVM it is running on, `JAVA_HOME`, `/usr/lib/jvm`,
  `/Library/Java/JavaVirtualMachines`, the usual `C:\Program Files` locations and `java` on `PATH` —
  and if it finds none it fails the setup with a readable error instead of retrying forever.
- **Somewhere to put the servers.** Everything the node owns lives under **`<pano-dir>/node-data/`**:
  its `config.conf`, `servers/<uuid>/`, `backups/`, `java/` and `updates/`.
- Its output is redirected into **`<pano-dir>/logs/pano-node.log`** — that file is the first place to
  look when the node does not come up.

Two keys exist for the cases where the automatic choice is wrong, both in the `local-node` block of
Pano's own `config.conf` (see the [Configuration Guide](../configuration/#local-node)):

```jsonc
local-node {
  enabled = true
  jar-path = null   // explicit path to pano-node.jar
  java-path = null  // a Java 17+ home, or the java binary inside one
  stop-with-pano = false
}
```

**The dialog does the work in front of you.** **Add node → Local** moves to the same progress
screen the SSH and Coolify tabs use and narrates the setup line by line: the Java it found and where
it found it, the daemon started with its process id, waiting for the node to connect, connected. A
refusal is shown right there in Pano's own words — no Java 17 or newer on the host, or the
`local-node` block switched off in `config.conf` — rather than leaving the outcome to be discovered
later on the Nodes page.

`stop-with-pano` is **false** by default on purpose: restarting Pano is not a request to disconnect
everybody who is playing. The daemon and the servers keep running, and Pano reattaches to them when
it comes back.

Which is why, on the next boot, Pano **adopts the daemon it finds already running** instead of
starting a second one. It looks at the lock and the process id the daemon keeps in its data
directory (`node-data/pano-node.lock` and `node-data/pano-node.pid`), and an adopted daemon is
supervised exactly like one Pano started itself: if it exits, Pano starts it again. A daemon that is
started anyway while another one holds the directory notices, exits with code **76** and leaves it
to the one that was already there, so the race can never end with two daemons on the same servers —
see [the data directory](pano-node/#the-data-directory).

#### Remote nodes

Any other machine becomes a node in one of three ways. **Add node** has a tab for each, and all
three end in the same place: the daemon running on that host, connected outwards to Pano.

**Manual** works everywhere, including on a machine you can only reach through somebody else's web
console. The tab shows a six-digit pairing code — it rotates every 30 seconds — and a one-line
install command to paste on the other machine:

```bash
curl -fsSL https://panel.example.com/api/node/install.sh | sh -s -- --pano 'https://panel.example.com' --code '123456'
```

The script is served by **your own Pano**, so the daemon it installs is the one that matches your
version. Run as root, it checks for **Java 17 or newer** and installs a headless JRE through the
host's package manager when there is none; creates `/opt/pano-node` and a `pano-node` service user
whose data directory is `/var/lib/pano-node`; downloads `pano-node.jar` and checks it against the
checksum published beside it; writes the pairing details into a root-only environment file and a
systemd unit — including **`SuccessExitStatus=75`**, so the daemon's self-update is not mistaken for
a crash; then enables and starts the service. Pass `--user-install` to put everything under your own
home directory without root; the script then prints the command to start it instead of registering a
service. Windows has the same thing as a PowerShell one-liner, which registers a `PanoNode` service.

A node that paired with a code arrives as **Waiting for approval**. Accept it on the Nodes page, and
accept only machines you set up yourself. You can always skip the script and run the daemon by hand:

```
pano-node --pano https://panel.example.com --code 123456 --data ./node-data
```

**SSH** lets Pano run that installation for you. Give it the host, the port, a username and either a
password or a private key, say whether it may use `sudo`, and confirm your own account password.
Pano connects, shows you the **host key fingerprint** and waits for you to confirm it before
anything else is sent — the one moment where you, not the machine, decide that this really is the
server you meant. Then it pipes the install script into the session and relays its output into the
panel line by line, so a failure is visible where it happened. The node pairs itself with a one-time
token and needs no approval afterwards. The target host needs no internet access of its own for the
script — it arrives over the SSH session.

> The SSH password or key is used for that one installation and is **never stored**: it lives in
> memory for the length of the task, is wiped when it ends, and is never written to a log.

**Coolify** deploys the daemon as a container on a server your [Coolify](https://coolify.io)
instance manages. Give Pano the Coolify URL, an API token, the target server and the project, and it
creates an application from the **`ghcr.io/panomc/pano-node`** image, sets `PANO_URL`,
`PANO_BOOTSTRAP_TOKEN`, `PANO_NODE_NAME` and `PANO_NODE_DATA=/data` on it, asks for a persistent
volume mounted at **`/data`**, exposes and maps the port range the game servers will use
(`25565-25600` unless you change it) and deploys it. The same range is passed to the node as
`PANO_NODE_PORT_RANGE`, so the servers Pano creates on it get ports the container actually
publishes. The panel follows the deployment until the node
pairs, for up to ten minutes. The API token is used for that deployment and not kept.

> Give the container a **persistent volume for `/data`**. Everything the node owns lives there —
> the servers, the worlds and the backups — and a container without one loses all of it on the next
> deployment. Pano says so in the task when Coolify refused to attach one.

**The Pano address the node uses.** The SSH and Coolify tabs have an **Advanced** section holding
one field, *Pano address reachable from the node*. Left empty, the node is pointed at your website
URL, which is the right answer nearly every time — but not always: a machine behind NAT reaches Pano
at a private address the public hostname does not resolve to, a lab Pano may only be reachable
through an SSH tunnel on `http://127.0.0.1:18088`, and split-horizon DNS answers differently inside
and outside on purpose. What you type there becomes the node's **`PANO_URL` exactly as given, port
and all**, and it is also the host the installer downloads the daemon from. It has to be a full
`http://` or `https://` address with a real host and no longer than 255 characters; anything else is
refused outright rather than quietly replaced by the website URL, because an operator who mistyped
the tunnel address needs to hear about it now and not in ten minutes when the node still has not
paired. The Manual tab has the same field, where it only changes the address in the install command
Pano shows you.

**A different image, on the Coolify tab.** **Image** and **Tag** are there for a Coolify host that
cannot pull `ghcr.io/panomc/pano-node`: a private registry, a mirror on an air-gapped network, or a
build somebody makes themselves. The image is a plain registry reference such as
`registry.example.com:5000/team/pano-node` — lower case, and **without** a `:tag` suffix, because the
tag is a field of its own. Neither is tidied up when it looks wrong; a reference that has been
edited into something else is a different image, and deploying a different image than was asked for
is worse than refusing the request.

When Coolify refuses the deployment, the panel shows **Coolify's own message**
(`COOLIFY_BOOTSTRAP_FAILED`) along with the bootstrap task it was written to, instead of a bare
failure. A rejected project, token or port field is something only you can fix, and you cannot fix
what you are not told.

The Nodes page shows how each node was bootstrapped — local, manual, SSH or Coolify — and lets you
rename or remove one. **Removing a node deletes everything on it** — every server on it with its
files and backups, the Java runtimes Pano downloaded and the daemon's own data — so it asks for the
node's name and your password first. See [Removing a node](pano-node/#removing-a-node).

It also flags a node whose daemon is not the one this Pano would hand it with an **Update available**
badge, and updates that node in place from there — the daemon downloads the jar from Pano, verifies
it, swaps it in as it shuts down and comes back on the new version in one restart, a few seconds
later. Updating restarts the node, so its servers go down with it and only the ones set to **Start
with Pano** come back by themselves. See [Updating the daemon](pano-node/#updating-the-daemon).

#### Running servers in containers

A node normally starts each managed server as an ordinary process. Started with
**`--runtime DOCKER`** it starts each of them in **its own Docker container** instead:

- the host needs the **`docker` command** and permission to use it, and the daemon checks that when
  it starts rather than when someone presses Start;
- **one container per server**, from the official **`eclipse-temurin`** image for the Java version
  that server needs, with its memory as the container's limit and its game port published;
- the server directory stays on the host, so the console, the power buttons, the process metrics,
  the [file manager](#files) and the [backups](#backups) work exactly as they do otherwise.

The Nodes page shows which runtime a node uses. See the
[pano-node reference](pano-node/#running-servers-in-containers).

### Creating a server

With a node online, **Add server** — in the servers modal, or beside the switcher in the top bar —
opens a chooser: **Create new server**, which installs one on a node, or **Link existing server**,
which is the `/pano connect` flow above, unchanged. Creating needs the **Create Servers**
permission.

The wizard has five steps:

1. **Source.** A **fresh install**, or one of the three ways to bring a server you already have —
   see [Importing a server](#importing-a-server).
2. **Node.** Which machine runs it. If none is online, the step offers **Set up the local node** and
   **Add a node** right there.
3. **Software and version**, from Pano's own catalog, which is refreshed from upstream every hour.
   Each one is shown with its project's own logo, here and on the server cards, and there is nothing
   to configure for it:

   | Software | |
   | --- | --- |
   | **Paper** | **Recommended.** The plugin platform most things are built for. |
   | Purpur | A Paper fork with more configuration. Behaves like Paper. |
   | Folia | Paper's regionised threading, for very large worlds. |
   | Spigot | Carries the **Compiled on the node** badge: nobody may hand out a Spigot jar, so the node builds one with BuildTools — see [below](#spigot-is-compiled-on-the-node). |
   | Fabric | The mod loader. The Pano plugin has a Fabric module, so console and roster work. |
   | Vanilla | Mojang's own jar. It has no Pano plugin module, so its console and power come from the node alone — there is no roster and no TPS. |
   | Velocity | Proxy, and the recommended one. No world, so no gamemode or TPS. |
   | Waterfall | Proxy, **deprecated** upstream since 2024. Use Velocity for new networks. |
   | BungeeCord | Proxy, with the **Latest CI build** badge: it comes from the project's own Jenkins, so its versions are build numbers — see [below](#bungeecord-comes-from-its-jenkins). |

   Forge, NeoForge and Quilt are not in the catalog yet: each needs its own installer run on the
   node, which is its own piece of work. Pano already knows those types, so a server that reports
   itself as one is labelled correctly.
4. **Settings.** Name, memory, game port, Java version, JVM arguments (with an **Aikar's flags**
   preset), **Start with Pano**, **Restart after a crash**, **Automatic update check** (see
   [Keeping plugins up to date](#keeping-plugins-up-to-date)), and the Minecraft EULA checkbox — Pano
   refuses to create a server without it and the node writes `eula=true` into `eula.txt` for you.
5. **Review**, then **Create server**.

Two of those deserve a note:

- **Port.** Leave it empty and the node allocates one from **25565–25600**, skipping the ports its
  own servers already hold and then checking that the port really is free — something outside Pano
  entirely may be listening on it. Type a port instead and the node uses exactly that one.
- **Start with Pano / Restart after a crash.** The first starts the server when the node comes up.
  The second brings it back when the process dies unexpectedly, with a widening delay — 5 s, 15 s,
  60 s, then 10 minutes — so a server that cannot start does not spin. A stop you asked for is never
  a crash.

#### Spigot is compiled on the node

SpigotMC may not redistribute a finished jar, so there is nothing for Pano to download: the only
lawful install is to make one on the spot. Choose Spigot and the node fetches **BuildTools**, the
project's own build script, and runs it for the Minecraft version you picked (`--rev`) — it clones
Mojang's server, applies the Spigot patches and compiles the result.

- **The build needs `git`**, and a **Java of the vintage that version was built with**. You do not
  have to install git: a git on the host is used, and otherwise the node gets one for the build
  alone — see [Git for BuildTools](pano-node/#git-for-buildtools). The node picks that Java itself out of the runtimes the machine has: the exact major BuildTools asks for,
  or the nearest newer one when that major is not installed — 1.21.x builds on Java 21, 1.16 on
  Java 8.
- **The first build of a version takes roughly ten minutes**, and longer on a small machine. The
  install sits on that step while it runs; it is not stuck.
- **The jar is then cached per version**, under the node's data directory as
  `cache/spigot/spigot-<version>.jar`, so every later install of that same version is a file copy
  and finishes at once. See [the data directory](pano-node/#the-data-directory).
- **You watch it happen.** The install task streams BuildTools' own output line by line, exactly as
  it prints it, and the progress follows the phases that log announces — pulling, applying patches,
  compiling, success.
- **One build at a time on a node.** A second Spigot install started while one is running says that
  it is waiting and begins when the first has finished — and if that build was its version, it
  simply takes the cached jar.
- **A failure says what BuildTools said.** The task fails with the last error line out of the build
  and the path of the full log, which is left on the node at
  `<node-data>/cache/spigot/buildtools/work-<version>/buildtools.log`. A build still running after
  **45 minutes** is stopped.
- **Under the Docker runtime the build still happens on the host**, with the host's JDK and git;
  only the finished jar goes into the container. See
  [Running servers in containers](pano-node/#running-servers-in-containers).

**Paper is still the recommendation**, because it needs no compile step at all, does more than
Spigot and runs the same plugins. Spigot is here for the servers and the plugins that genuinely
want Spigot.

#### BungeeCord comes from its Jenkins

BungeeCord publishes no releases at all: every build goes straight onto
[md-5's Jenkins](https://ci.md-5.net/job/BungeeCord/), and that is where Pano takes it from. Its
"versions" are therefore **build numbers**, newest first, with **Latest build** offered first and
chosen by default — which is what a BungeeCord network is meant to run, rather than a build number
somebody pinned once and then forgot.

There is **no published checksum** for that download. Jenkins does fingerprint the build, but it
fingerprints a different artifact than the jar the download URL serves, so there is nothing
truthful to compare against; the node checks that what arrived really is a jar, as it does for
every download, and no more than that.

**Velocity stays the recommended proxy** — modern forwarding, and the only one of the three still
being developed. BungeeCord is here for the plugins and the setups that still need it, and it is
created and managed exactly like the other two — see [Proxy servers](#proxy-servers).

> A plain BungeeCord writes `proxy.log` in its server root instead of a `logs/` directory, so the
> console's **Load older** has nothing to read back there. See [Console](#console).

#### What happens during the install

The server row is written immediately, in the state **INSTALLING**, so the panel has somewhere to go
while the node works. The node then

1. prepares the directory `<node-data>/servers/<uuid>/`,
2. downloads the server jar, reporting progress into the panel — or, for
   [Spigot](#spigot-is-compiled-on-the-node), compiles one with BuildTools,
3. installs the **Pano Minecraft plugin** into it and writes that plugin's `config.conf` already
   paired — this is why a managed server is a linked server the moment it first starts,
4. writes `eula.txt` and merges the `server.properties` values from the wizard,
5. finishes, and the server settles into **Stopped**, ready to start.

The plugin in step 3 comes from **Pano itself**: `GET /api/node/plugin-jars/<platform>` when this
install has a build of it on disk, and the newest `PanoMC/pano-mc-plugin` release asset otherwise.
Every URL Pano hands a node for something Pano serves is relative, and the node resolves it against
the address it already reaches Pano on — which is what lets a node on a machine of its own install
the plugin at all, rather than being pointed at a path only Pano's own host could read. Software
with no Pano plugin module — Vanilla, Forge and NeoForge — skips the step, and those servers are
managed through the node alone.

A managed server needs no connect request: Pano created it, so it is approved by construction and
never shows up under **Requests**.

### Importing a server

A server that already exists does not have to be built again. Next to **Fresh install**, the
wizard's first step offers three ways to bring one in:

| Source | What you give it | What happens |
| --- | --- | --- |
| **Existing folder on the node** | An absolute path **on the node**, typed in | The node **copies** that directory into its own storage — it never moves it, so the original stays exactly where it is and a failed import costs you nothing. Symbolic links are skipped rather than followed. A folder inside the node's own data directory, or one with no server jar in it, is refused. |
| **Upload an existing server** | A `.zip` of a server directory, up to **1 GB** | Dropped onto the panel, handed to the node and unpacked there. A lone top-level folder inside the archive is flattened away, and an entry that would unpack outside the target is refused. The upload stays usable for 30 minutes. |
| **Modpack** | A modpack, searched on Modrinth | The node downloads every server-side file the pack lists, applies the pack's overrides, and installs the loader it asks for — Fabric and Quilt from their own metadata, Forge and NeoForge by running the official installer. |

**You are not asked for the software or the version.** The node reads them out of what it imported —
the launchable jar, the jar's manifest, `version.json`, the pack metadata, `server.properties` — and
Pano fills in the software, the Minecraft version, the Java version it needs and the port that was
already configured. The wizard says as much: *Pano reads the server software, the Minecraft version
and the port out of the import itself.*

The port follows the same rule: the one you asked for, otherwise the one the imported
`server.properties` already used if it is free, otherwise the first free port in the node's range.

Afterwards it is an ordinary managed server. The Pano plugin is installed into it, the worlds and
the configuration are the ones you brought, and the panel can start it.

> Importing copies data onto the node. Make sure its disk has room, and that the folder you point at
> is not a server that is **currently running** somewhere else — two processes in one directory
> corrupt worlds.

### Proxy servers {#proxy-servers}

Velocity, Waterfall and BungeeCord are created and managed like any other server: pick one in the
**Software and version** step and it gets its own console, files, backups and schedules. Pano does
not connect a proxy to the servers behind it — list them in the proxy's own configuration
(`velocity.toml` on Velocity, `config.yml` on Waterfall and BungeeCord) and set up forwarding on
each backend, both of which you can do in the [file manager](#files).

> A backend behind a proxy usually runs with `online-mode=false` so the proxy can forward players to
> it. Make sure such backends are **not reachable from the internet** — only the proxy should be. A
> backend with a public port and no online mode lets anyone join as anyone.

### Power and console on a managed server

All four power buttons work once a node owns the process:

- **Start** — the node launches the JVM with the startup settings below and follows its output.
  A server is called **Running** when it prints its `Done (…)` line, or after 60 seconds at the
  latest.
- **Stop** — the node writes the stop command, waits, then terminates the process and finally kills
  it. A server that ignores all three is not left half-alive.
- **Restart** — a stop followed by a start.
- **Kill** — straight to the kill, for a server that has hung. Nothing is saved, so use it when
  **Stop** has already failed.

The console page is the same page as for a linked server; for a managed server it simply has two
sources, and its [history](#console) is read by the node, which can do that while the server is
stopped. The node streams **everything the process prints** — the boot log, a stack trace at
startup, the crash that happens before the plugin ever loaded — and the plugin streams the runtime
log as before; Pano merges them into one buffer per server and remembers where each line came from.
A command you type is written to the server's input by the node and echoed into the console first,
exactly as it is for a linked server:

```
[Pano:admin] > say hello
```

Power actions echo the same way, so everyone watching sees who stopped the server.

#### Adopted servers

A node that stops does **not** stop the servers it supervises. Restart the daemon, update it, or
kill it, and every Minecraft server on that machine keeps running with its players in it — nobody is
thrown out of a world because the daemon was updated. When the daemon comes back it finds them
again: it wrote a small ownership record next to each server it started
([`.pano-node/process.json`](pano-node/#what-survives-a-restart-of-the-daemon)), and on its next
start it checks that the process in it is still alive and really is that server before taking it
over — **adopting** it.

An adopted server is shown as **Running** with an *adopted* badge in its header, and almost
everything works as before: the console keeps streaming, its history pages back through the log
files, the metrics keep coming, and **Stop**, **Restart** and **Kill** all work. The one thing
missing is the process's **standard input** — that pipe belonged to the daemon that is gone — so the
node cannot type into the server:

- **With the Pano plugin installed**, which is every server Pano created, you will not notice:
  commands are simply sent through the plugin instead.
- **Without it**, the console's input is disabled with a tooltip saying to restart the server from
  the panel once to get it back. One restart from Pano and the node owns the process properly again.

**An adopted server that dies is never restarted automatically**, even with *Restart after a crash*
switched on. The daemon did not start that process and cannot tell a crash apart from somebody
stopping the server by hand on the machine, and bringing back up a server that was deliberately shut
down is worse than leaving it down. Start it again from the panel.

> The old behaviour is one setting away: `node.stop-servers-on-exit = true` in the node's
> [`config.conf`](pano-node/#config-conf) makes the daemon stop its servers when it exits. The
> default is `false`.

### Startup settings

**Server → Settings → Startup** is where a managed server's launch is configured, behind the
**Manage Server Startup** permission.

| Field | |
| --- | --- |
| Java version | The major version to launch with, or **Automatic** — see below. |
| Memory | The heap the JVM is started with. |
| Game port | The port players connect to. |
| JVM arguments | Extra flags. Leave empty unless you know you need them. |
| Start with Pano | Start this server when the node comes up. |
| Restart after a crash | Bring it back when the process dies unexpectedly. |

**Settings → Server properties** edits `server.properties` itself: every key the server writes,
grouped (General, World, Performance, Players, Resource pack, Network) with a short explanation,
the right control for each — a switch, a bounded number, a list of the allowed values, a password
field for secrets — a **Find** box, and a *Reset to default* on any value that differs from a
fresh server's. The form is prefilled from **the file as it is on the node right now**, hand edits
included; when the node cannot be reached it says so and shows the values Pano stored instead. A
save sends only the keys you changed, and the node **merges** them into the real file, so anything
else an operator or a plugin put there survives untouched. Keys the page does not know — a
fork's own, or ones a newer server adds — are listed under **Other keys** and can be edited or added
as plain text. `server-port` is the one key it will not write: that is the port on the Startup tab,
allocated by the node.

> Startup settings are used on the **next launch**. Nothing is applied to a running process —
> change what you need, then restart the server.

### Reinstalling

**Server → Settings → Danger zone → Reinstall** installs the server's current software again from
scratch, optionally on a different version. It opens the same dialog as
[changing the software](#changing-the-server-software), with the software locked to the one the
server already runs, so you choose what is kept and whether a backup is taken first. It needs the
**Create Servers** permission and your account password, like Pano's other destructive actions, and
it is written to the activity log.

### Changing the server software {#changing-the-server-software}

**Server → Settings → Danger zone → Change software** moves a managed server to another software or
version — Paper to Purpur, Fabric to Paper, a game server to Velocity. Pano stops the server if it is
running, downloads the new server files and brings it back. The dialog has four parts:

1. **Software and version.** The same list as the create-server wizard, with the current software
   marked. The Java line shows which runtime the new version will run on, and says so when the node
   has to [download it](#which-java-a-server-runs-on) first.
2. **What to keep** — three switches, preset to everything that can safely be carried over:
   - **Worlds**: every folder with a `level.dat` (so a custom `level-name` survives) plus
     everything named `world*`.
   - **Plugins** (or **Mods**): the `plugins/` folder, or `mods/` and `config/` on Fabric and Forge.
   - **Configuration**: `server.properties`, the software's own files (`bukkit.yml`, `spigot.yml`,
     `config/paper-*.yml`, `purpur.yml`, `velocity.toml`, BungeeCord's `config.yml`), `eula.txt`,
     the whitelist, ops, bans and the user cache.
3. **Take a backup first** (on by default), **Start the server afterwards** (on when it is running
   now) and your account password.
4. The progress of the change, step by step. You can close the dialog; the server header keeps
   showing it.

**Software families.** What can be carried over depends on the family on each side:

| Family | Software | Kind |
| --- | --- | --- |
| Bukkit | Paper, Purpur, Folia, Spigot, CraftBukkit | Game server |
| Fabric | Fabric, Quilt | Game server |
| Forge | Forge, NeoForge | Game server |
| Vanilla | Vanilla | Game server |
| Velocity | Velocity | Proxy |
| BungeeCord | BungeeCord, Waterfall | Proxy |

- **Within one family** (Paper → Purpur) everything can be kept.
- **Between game servers of different families** the worlds carry over, plugins and mods do not (a
  Paper plugin does not load on Fabric), and of the configuration only the vanilla files
  (`server.properties`, whitelist, ops, bans, user cache) carry over between Bukkit, Fabric and
  vanilla.
- **Between a game server and a proxy** nothing carries over: a proxy has no worlds, and the two
  share neither plugins nor configuration. A server that is part of a [network](#proxy-servers)
  must be removed from it before it switches between proxy and game server.

A switch that makes no sense for the pair you picked is greyed out, and the panel warns you when
plugins or worlds are about to be left behind. The Pano plugin module is replaced by the one for the
new software.

**Backup first.** With the switch on, a full [backup](#backups) named
`before-<old>-to-<new>-<date>` has to finish before anything is touched. If the backup fails, the
change stops there and the server is left exactly as it was.

**Rollback on failure.** The node installs into a fresh directory and keeps the old one aside until
the new install is done; only then is the old directory deleted. If the download or the install
fails, the old directory is put back, so a failed change leaves the server as it was.

### Deleting a server {#deleting-a-server}

**Server → Settings → Remove server** asks for your account password and is written to the activity
log. On a **managed** server it is final:

- the node stops the server if it is running, and deletes its directory — the jar, the worlds, the
  plugins, everything under `servers/<server-uuid>/`;
- **its backups go with it**: every archive and the snapshot repository under
  `backups/<server-uuid>/`. The dialog says how many backups that is and how much space they take.
  [Download](#backups) the ones you want to keep before you press it.

If the node is offline when you delete the server, Pano removes the server from the panel straight
away and the node deletes its files and backups the next time it connects: it reports the servers it
has, and Pano tells it to delete the ones it no longer knows about. A node also clears out, when it
starts, backup folders whose server no longer exists.

A **linked** server is only removed from Pano: its files, and any backups the Pano plugin made beside
it, stay on the Minecraft server's own machine.

### Which Java a server runs on

Leave the Java version on **Automatic** and the node picks from the runtimes that machine actually
has, preferring **the lowest version the Minecraft version supports**:

| Minecraft | Needs at least |
| --- | --- |
| 26.1 and newer | Java 25 |
| 1.20.5 – 1.21.x | Java 21 |
| 1.17 – 1.20.4 | Java 17 |
| 1.16.5 | Java 16 |
| Older than 1.16.5 | Java 8, and it will not start on Java 17+ |

Newest-wins was the obvious rule and the wrong one: Paper 1.21.8 asks for Java 21, starts happily on
a much newer JVM and then dies in native code on shutdown, because "runs" and "is supported" are not
the same question. So the minimum wins whenever it is installed, and the choice and the reason for
it are printed in the server's console at launch.

**When the host has no suitable Java, the node downloads one.** A server that needs Java 21 on a
host that only has Java 17 does not fail any more: the node fetches a Java 21 runtime into its own
data directory and carries on — inside the install task when the server is being installed, or as a
separate **Downloading Java** task before a start. Where the runtimes come from, where they live and
how to switch this off is on the [pano-node page](./pano-node/#java-runtimes).

**The Java select** in the create-server wizard and in **Startup settings** lists two kinds of
entries:

- the majors **installed** on the node, as `Java 17`;
- the majors the node **can download** for its operating system and architecture, as
  `Java 21 — will be downloaded (~50 MB)`. Picking one is allowed: the runtime is downloaded before
  the install (in the wizard) or on the next start (in Startup settings). A major neither vendor
  builds for that machine is not listed at all.

**Automatic** names the Java it will end up on — `Automatic (Java 21)` — once the wizard knows the
Minecraft version, and says so underneath when that Java is not on the node yet and will be
downloaded first. The review step repeats both. On a node that is offline, older than this feature,
or has automatic downloads turned off, the select falls back to the installed majors only.

If a start still fails for want of Java — automatic downloads are off, or the download itself
failed — the server's **Overview** shows why, with a **Download Java N and start** button: it
installs that runtime on the node and starts the server as soon as the download is done. The
button needs the **Manage Nodes** and **Manage Server Power** permissions.

To take the decision yourself, set the Java version explicitly in the wizard or in
**Startup settings**. Every runtime a node has — found on the host or downloaded by Pano — is listed
on that node's page under **Servers → Nodes**.

**Compiling Spigot asks a different question**, and the node answers it on its own.
[BuildTools](#spigot-is-compiled-on-the-node) needs the JDK that version of Minecraft was *built*
with, which is not always the one the finished server is happiest running on, so the build takes
the exact major it asks for — or the nearest newer one that is installed. 1.21.x is built on
Java 21, 1.16 on Java 8. Nothing is second-guessed past that: BuildTools checks the JDK itself and
refuses an unsuitable one in its own words, which the install reports as it received them.

### Metrics on a managed server

A managed server has two sources of numbers, and the overview shows both:

- **From the node**, every 10 seconds while the process is alive: the process's **CPU** and
  **resident memory**, which is what the operating system sees — the whole JVM, not just its heap.
  The node also reports the **host's** CPU, RAM and disk, shown on the Nodes page. When there is no
  Pano plugin answering, the node adds the **player count** from a server list ping.
- **From the plugin**: TPS, MSPT, JVM heap, the player count and the roster, exactly as for a linked
  server. Those need the Pano plugin, which Pano installs into every managed server it creates — so
  a Paper, Purpur, Folia, Fabric or Velocity server has them from its first start. A **Vanilla**
  server has no plugin module at all, so its numbers are the node's: process CPU and memory, and the
  player count and up to twelve names from the ping. TPS and MSPT cannot be measured from outside
  the JVM and are not shown there at all.

### Files

**Server → Files** is a file manager, behind the **Manage Server Files** permission. Everything it
does happens inside that one server's directory — there is no shell on the host and nothing above
the directory can be reached. The work is done by the **node** where there is one, and otherwise by
a **Pano plugin** new enough to serve its own server's directory, under exactly the same rules.

- **Browse.** Name, size and modification time, sortable, with breadcrumbs from **Server root** down
  and a filter box for the folder you are in. The current folder is part of the address, so a path
  can be bookmarked or sent to a colleague.
- **Edit.** Opening a text file opens it in an editor with highlighting for the formats a server
  directory is full of — JSON, YAML, TOML and `.properties`/`.conf`/`.ini`. <kbd>Ctrl</kbd>+<kbd>S</kbd>
  saves. Files up to **256 KB** are opened in full; a larger one opens read-only with a note saying
  so, and a binary file is not opened at all — download it instead. A save may be at most **1 MB**.
  The title shows the file's size, and how much your unsaved edits change it.
- **Preview.** Images, videos and audio files (PNG, JPEG, GIF, WebP, MP4, WebM, MP3, OGG, WAV and
  similar) open in a viewer instead of the editor. SVG and HTML are never shown in the panel — they
  could run script there — so they are download-only.
- **Create, rename, delete.** New file, new folder, rename, and delete — one entry or a selection.
- **Extract.** A `.zip` in the folder can be extracted into a folder you name. Extraction refuses
  entries that would land outside it.
- **Permissions.** On a Linux or macOS node, an entry's POSIX mode can be changed (`0644` and
  friends). The action is not offered where the filesystem has no modes.
- **Upload.** Drag files onto the listing, or use the button, which opens a drop zone naming the
  folder they will land in. A single file may be up to **1 GB**; each upload shows its own progress
  and is streamed through Pano to the node.
- **Download.** One file downloads as itself. A folder, or a selection of several entries, downloads
  as **one zip that is built while it downloads** — nothing is written to the server's disk, and the
  credential files below are left out of it. The same streaming path carries it in the other
  direction.

**What the file manager will not touch.** A few files hold credentials that would let whoever reads
them impersonate this server to Pano, so they are hidden from the listing and every operation on
them is refused: the Pano plugin's own `config.conf` (wherever the platform keeps it), the node's
`server.json`, and the JVM's `hs_err_*` crash dumps. The folders that contain them cannot be deleted
or renamed either, although their other contents can be edited normally. The same refusal covers
anything that tries to leave the server directory — a path with `..` in it, an absolute path, or a
symlink pointing outside.

> A server with **neither** a node nor a plugin that serves files still lists the page, with its
> controls disabled and a notice saying so — there is simply nothing on the other end to ask. A
> plugin serving its own directory refuses to write over the jars the server it is running is
> holding open. See [What works with what](what-works-with-what/).

### Backups

**Server → Backups** archives a server, behind the **Manage Server Backups** permission. A backup is
a zip of the whole server directory, taken **on the node** and kept there under
`<node-data>/backups/<server-uuid>/` — so it is exactly as safe as that machine is. Copy the ones
that matter somewhere else. A server with no node behind it can still be backed up by a **Pano
plugin** new enough to do it, which writes the same archives beside the server itself and prunes
them by the same retention setting.

**Full or snapshot, and what to take.** **Create backup** opens a dialog with two choices, and a
schedule's backup step offers the same ones:

| | Full | Snapshot |
| --- | --- | --- |
| What is written | One self-contained `.zip` | An entry in the server's snapshot repository (`backups/<server-uuid>/repo/`) |
| Size on disk | The whole selection, every time | Only the data that changed since earlier snapshots; everything else is shared |
| Download | The zip | A zip built on the fly from the repository |
| Best for | "Before the update" copies, moving a server | Frequent (hourly) world backups |

Snapshots are Pano's own incremental store — no external tool is downloaded. Files are cut into
content-defined chunks (about 1 MiB), each stored once under its SHA-256 and compressed when that
helps, so a region file where a few chunks changed costs a few chunks, not the whole file. Every
snapshot is still a complete, independently restorable view: restoring one never needs the others.
Deleting a snapshot removes the chunks nothing else uses.

What to take:

- **Everything** — the whole server directory.
- **Worlds only** — the world named by `level-name` in `server.properties`, its `_nether` and
  `_the_end`, and any other top-level folder that holds a `level.dat` (Multiverse and friends). The
  dialog lists what it found.
- **Custom** — only the paths you list, one per line (`world/`, `plugins/Essentials/`,
  `server.properties`).

**Leave out** takes one pattern per line: a folder ending in `/`, a file-name pattern such as `*.log`,
or an exact path. `logs/`, `cache/` and half-downloaded jars are left out as well unless you untick
that; the credential files above are never included either way.

- **Creating one.** Give it a name if you like, press **Create backup** and the node does the work:
  on a running server it turns world saving off, flushes everything to disk and turns it back on
  around the archive, so a backup of a live server is consistent rather than half-written. `logs/`,
  `cache/` and half-downloaded jars are left out, as are the credential files above. Progress is
  shown while it runs, and everyone watching the page sees it.
- **The list** shows the name, the size, when it was taken, who took it, its state and its
  **SHA-256** checksum, which you can copy with a click to verify a downloaded archive.
- **Downloading** streams the archive through the node to your browser.
- **Restoring** replaces everything in the server directory with the contents of the archive. The
  server has to be **stopped** first — the button says so until it is — and Pano asks for **your
  account password**. Before it extracts anything the node zips the current `world*` directories
  into a `pre-restore-…` archive, so a restore you did not mean is itself recoverable.
- **Deleting** one also asks for your password. Both are written to the activity log.
- **Retention.** Full backups and snapshots are counted separately. **Full backups to keep**
  (default **10**, at most 100) and **Snapshots to keep** (default **24**, at most 500) prune the
  oldest successful ones beyond the limit when a backup finishes; failed attempts are cleared out
  first. Snapshots can also be held under a **disk cap** in GB: past it the oldest are removed, never
  the newest. A **pinned** backup (row menu → *Pin*) is never removed by either rule.
- **World folders are replaced whole on restore.** Every world folder the backup contains is emptied
  first and then written back, so regions explored after the backup cannot end up mixed into it.
  Everything else is written over what is there, as before. A snapshot is verified chunk by chunk
  before anything on the server is touched.

> **A restore done by the plugin happens on the next start.** A plugin cannot overwrite the files of
> the server it is running inside, so it writes a marker — `.pano/restore-pending.json` — and the
> archive is unpacked the next time that server boots, before its worlds are loaded. The task stays
> on *applies on the next start* until the server comes back and reports how it went. A node
> restores immediately instead, which is why a server that has one always uses it for this.

Backups can also run on a timetable — see [Schedules](#schedules).

> **Backups belong to their server.** [Deleting a managed server](#deleting-a-server) deletes its
> backups on the node as well, and [removing a node](pano-node/#removing-a-node) deletes the backups
> of every server on it. Download anything you want to keep first.

### Plugins and mods

The plugins page of a managed server has two tabs.

**Installed** is the list [described above](#plugins) — what the running server reported — merged
with the jars actually sitting in the server's `plugins/` (or `mods/`) folder. A jar the server has
not loaded is marked **Not loaded**, which is what you see right after installing something. Each
file can be removed; the Pano plugin's own jar is refused, because removing it would cut the server
off from the panel.

> **Restart required.** Nothing is loaded into a running server by copying a file into it. When the
> folder has changed since the server last reported its plugins, the page says so until it has been
> restarted.

**Browse** searches the plugin and mod sites without leaving the panel:

| Source | |
| --- | --- |
| **Modrinth** | Plugins and mods. Built in, nothing to configure. |
| **Hangar** | PaperMC's own plugin site. Built in, nothing to configure. |
| **CurseForge** | Off until you add an API key of your own — see below. |

The search is already narrowed to the server you are on: it asks each site for that server's loader
and Minecraft version. Every result and every version carries a badge — **Compatible**, or **May not
fit** when what it declares does not cover this server. A version that "may not fit" can still be
installed on purpose, because an older build often works; the badge is there so the choice is yours
rather than a surprise.

Installing downloads the file **on the node**, checks it against the checksum the site published,
makes sure it really is a jar and moves it into place — `mods/` on Fabric, Quilt, Forge and
NeoForge, `plugins/` everywhere else. A source that cannot be reached, or a project whose author
disallowed third-party downloads, simply offers nothing to install.

Installing and removing needs something that can write into the server's folder: a **node**, or a
**Pano plugin** new enough to install files itself. Where there is neither, the Browse tab is not
there. The search itself works from any server.

**CurseForge** needs a key of your own, because CurseForge requires every application to
authenticate. Put one in Pano's `config.conf`:

```jsonc
plugin-sources {
  curseforge-api-key = null
}
```

Until it is set, the source is shown switched off with the reason, and only Modrinth and Hangar are
searched. See the [Configuration Guide](../configuration/#plugin-sources).

#### Keeping plugins up to date

Pano writes down where every plugin it installs came from — the source, the project and the exact
version — and the **Installed** list shows it: every tracked jar carries a **Modrinth**, **Hangar**
or **CurseForge** badge next to its name.

When that project has a newer build that fits this server, the row gains an **Update available**
badge carrying the new version number and linking to the project page, and an **Update** button
beside it. The card header counts them — **N with updates** — and offers **Update all (N)**, which
starts the lot.

**"Fits" means compatible**, the same test the Browse tab's badge uses: the loader family and the
Minecraft version this server actually runs. Beyond that, a server on a **release** build is only
ever offered release builds, while one you deliberately put on a beta or an alpha channel keeps
being offered that channel as well — telling somebody "no updates" while their own channel moves on
would be a lie. Which of the candidates is newest is decided by **the date the source published
it**, not by comparing version strings, because no two plugin authors spell something like
`1.21.4-pre2` the same way.

An update is an install with the old jar named: the node downloads the file, checks it against the
published checksum, makes sure it really is a jar and moves it into place over the file it
supersedes. Nothing is loaded into a running server by replacing a file, so the usual **Restart
required** notice follows. **Update all** starts one node task per plugin and reports what it
skipped and why, rather than quietly leaving those behind.

The Pano plugin's own jar is never offered an update here — it did not come from a plugin site.

**The first page load may not know everything yet.** Every tracked row is a question for a
third-party API, so the list gives itself a budget of about **six seconds** and answers with
whatever it has learned; on a server with a long plugin list the rest simply carry no badge yet.
What was asked is cached for ten minutes, so reloading a minute later finishes the job. A row whose
jar is no longer in the folder — deleted or renamed through the file manager — is forgotten the
next time the list is opened.

Updating needs **Manage Server Plugins** and a side that can write the file — the node, or a plugin
that installs. It is under the same [rate limit](#rate-limits) as an install, and lands in the
[activity log](#activity) with the version it came from and the one it went to.

**Automatic update check.** Once a day Pano also runs this check on its own and raises a
[Plugin updates](#alerts) alert for a server with something outdated. Every managed server has a
switch for that — **Automatic update check**, under **Server → Settings → Preferences** and in the
create wizard's settings step — and it is on by default. Turned off, the daily check skips that
server entirely: no plugin-update alert, no panel notification and no e-mail about it, and no
requests to the plugin sites on its behalf. Nothing else changes — opening the server's plugins page
still shows what is outdated, and **Update** and **Update all** work as before.

#### Identifying jars Pano did not install

Pano knows the provenance of what it installed through the panel and nothing at all about the rest,
which on a real server is most of the folder: plugins arrive over SFTP and through file managers far
more often than through a panel. An unrecognised jar gets no source badge and no update check.

**Identify sources**, in the header of the plugins page, asks the node for those jars' hashes and
looks them up:

| Site | Looked up by |
| --- | --- |
| **Modrinth** | The file's **SHA-1**. |
| **CurseForge** | Its own **fingerprint**, and only when your [API key](../configuration/#plugin-sources) is configured. |
| **Hangar** | Nothing — it publishes no hash index at all. |

A match is recorded and that jar is tracked from then on exactly like one Pano installed; its badge
says it was matched by file hash rather than installed, because a hash match is a recognition and
not a receipt. A plugin downloaded from **Hangar** by hand therefore stays unknown until it is
installed — or reinstalled — through the Browse tab. That is a property of Hangar rather than
something Pano can work around.

The button needs the node to speak **protocol 2 or newer** and is not shown at all on an older
daemon: a button whose only possible answer is "this node cannot do that" is worse than no button.
[Update the node](pano-node/#updating-the-daemon) from the Nodes page and it appears. It is also
only there while something is actually unknown.

Pano does the same by itself, unasked, the first time somebody opens a server's plugins page — at
most **once every six hours** per server — and again inside the daily sweep behind the
[Plugin updates alert](#alerts). At most 200 jars a run, never the Pano plugin's own, and a source
having a bad minute costs the identification rather than the page.

### When something goes wrong

**The node stays offline.**

- **No Java 17+ on the host** — setting up the local node fails with `LOCAL_NODE_JAVA_MISSING`, and
  the **Add node** dialog says so on its progress screen. Install a JDK 17 or newer, or point
  `local-node.java-path` at one that is already there. Remember that Pano's own Java 11 is not
  enough for the daemon.
- **The daemon jar could not be downloaded** — a host with no internet access, or a Pano build with
  no matching release asset. Fetch `pano-node.jar` by hand and set `local-node.jar-path` to it.
- Whatever the cause, **`<pano-dir>/logs/pano-node.log`** holds the daemon's own output. A remote
  node logs to wherever its service writes standard output.

**The install fails.** The task progress carries the error. Almost always it is one of: the download
URL is unreachable (the node needs outbound internet access to PaperMC, Mojang, Purpur, Fabric,
SpigotMC or `ci.md-5.net`), the upstream build was withdrawn — pick another version — or the disk
under `node-data/` is full. Fix it and create the server again; a failed install leaves nothing
running.

**A Spigot install stops before it compiles anything.** BuildTools cannot do a thing without `git`.
A host without one normally gets [the node's own git](pano-node/#git-for-buildtools), so this only
happens when that download failed or is turned off, and the task says so: *Git is not installed on
this node and automatic tool download is disabled; BuildTools needs it (apt install git / pacman -S
git / brew install git).* Install git on the node's host, or turn downloads back on, and create the
server again. It is checked before the download and before the JDK lookup, so a missing `git` costs
seconds rather than being discovered ten minutes in.

**A Spigot build fails partway through.** The task reports the last error line BuildTools printed,
which is usually enough — and when it is not, the whole log is left on the node at
`<node-data>/cache/spigot/buildtools/work-<version>/buildtools.log`. A build that is simply slow is
not a failure: it reports while it works, and only a run still going after **45 minutes** is
stopped.

**The server goes to CRASHED.** The process exited on its own. Open the console: the node captured
everything the server printed, including the stack trace that a plugin-side console would have
missed because the plugin never loaded. The exit code is shown with the state — `1` is usually a
configuration or a plugin error, and a kill from outside Pano (the system's out-of-memory killer,
for instance) shows up as `137`. If **Restart after a crash** is on, the node is already retrying
with a widening delay.

**The port is in use.** The node checks the port before it starts a server, and a port held by
something outside Pano makes the launch fail with a message in the console. Change the port in
**Startup settings** and start it again, or leave the port empty when you create a server and let
the node allocate a free one from its range.

## Schedules

> ⚠️ Schedules ship on the **alpha** channel first, like the rest of this page.

**Server → Schedules** runs things on a timetable, behind the **Manage Server Schedules**
permission: a nightly restart, a backup before the weekend, a `save-all` every hour.

A schedule is a **cron expression** plus a **time zone** and a list of **tasks**.

| Field | |
| --- | --- |
| When it runs | Five-field cron — minute, hour, day of month, month, day of week. Presets are one click (**Daily 04:00** `0 4 * * *`, **Every 6 hours** `0 */6 * * *`, **Sunday 05:00** `0 5 * * 0`) and anything else is typed. The form shows what the expression means in words and **the next five runs** while you type, so a wrong one is visible before it is saved. |
| Time zone | The zone the expression is read in; it defaults to your browser's. `0 4 * * *` in `Europe/Istanbul` means four in the morning there, whatever the server's clock says. |
| Warn players | Minutes of warning before a stop or a restart. Players are told at that many minutes, then at 5, then at 1. **5** by default; zero switches the warning off. |
| Tasks | Run one after another, from top to bottom. |

| Task | |
| --- | --- |
| **Power** | **Restart** or **Stop**. (Starting a server on a timer is deliberately not offered — a server that should always run has **Start with Pano** instead.) |
| **Command** | A console command, exactly as if it had been typed into the console. |
| **Backup** | A backup, optionally named, optionally with its own keep-last count. |

**Who runs them** depends on what is attached to the server. The **node** runs them where there is
one: Pano pushes the schedules to it whenever they change and again whenever it reconnects, so they
keep firing even while Pano is being updated. Where there is no node, a **Pano plugin** new enough
to run them takes over — backup tasks included, since that plugin can archive its own server.
Failing both, Pano runs the schedule itself, which covers commands and stop/restart but **not
backups**: Pano has no filesystem on a server it does not run.

Each schedule can be switched off without deleting it, and **Run now** fires it immediately,
skipping the warning countdown. The list shows the next run and how the last one ended.

## Alerts

> ⚠️ Alerts ship on the **alpha** channel first, like the rest of this page.

Pano watches the things it already measures and says so when one of them goes wrong, so that nobody
has to keep the Nodes page open.

| Alert | Fires when | Not again for |
| --- | --- | --- |
| **Server crashed** | A server's process exited without anybody asking it to. | 5 minutes |
| **Node offline** | A node stopped answering. | 15 minutes |
| **Backup failed** | A backup did not finish. | 30 minutes |
| **Disk almost full** | A node's disk is more than **90%** full. | 6 hours |
| **Low TPS** | A server stayed under **15 TPS** for five samples in a row — a single spike does not count. | 30 minutes |
| **Schedule failed** | A scheduled run ended with an error. | 30 minutes |
| **Plugin updates** | A managed server is running plugins or mods whose authors have published a newer build. | 24 hours |

The cooldown is why a flapping node or a server that struggles all afternoon produces one alert
rather than a hundred. Coming back clears it: a node that reconnects can report its next outage
straight away. Restarting Pano does not: before raising an alert Pano looks up when it last raised
the same one, so a restart in the evening does not repeat the morning's plugin-update alert.

**Plugin updates** is the one kind here that is not about something breaking, and its cooldown says
so. Once a day — first a quarter of an hour after Pano starts, then every twenty-four hours — Pano
walks every managed server that has [tracked plugins](#keeping-plugins-up-to-date) and its
**Automatic update check** switched on, one server at a time, and raises a single alert per server
naming what has a newer build. It may say so once a day
per server; anything more often would be a newsletter.

Every alert becomes a **panel notification** for everyone who may manage servers, and clicking it
opens what it is about — the server for a crash, a failed backup, low TPS or a failed schedule,
that server's [plugins page](#plugins-and-mods) for plugin updates, the Nodes page for a node that
went offline or filled its disk.

**Settings → Platform → Server alerts** is the switch grid: each kind can be turned off, and each
kind can additionally be sent by **e-mail** to the administrators. By default every kind notifies
and none of them e-mails. The e-mail column needs a working mail configuration and the server-alert
mail template; where one is missing the switches are disabled with that reason and the in-panel
notifications keep working.

## Permissions

Server management uses its own permission nodes, set up in **Panel → Permissions** like every other
permission in Pano.

| Permission | Node | Allows |
| --- | --- | --- |
| Manage Servers | `pano.panel.manage.servers` | The umbrella: see the servers workspace and the server switcher, link, accept and remove servers, read the overview, metrics and settings. |
| Manage Server Console | `pano.panel.manage.server.console` | Read the console and send commands. |
| Manage Server Power | `pano.panel.manage.server.power` | Start, stop, restart and kill a server. |
| Manage Server Players | `pano.panel.manage.server.players` | The roster and the player actions. |
| Manage Server Plugins | `pano.panel.manage.server.plugins` | The plugin list, the enable/disable toggle, and [installing or removing](#plugins-and-mods) plugins and mods. |
| Manage Server Files | `pano.panel.manage.server.files` | The [file manager](#files). Needs a node or a Pano plugin that serves files. |
| Manage Server Backups | `pano.panel.manage.server.backups` | [Backups](#backups), restores and the retention setting. Needs a node or a Pano plugin that takes backups. |
| Manage Server Schedules | `pano.panel.manage.server.schedules` | [Scheduled tasks](#schedules). Backup tasks need a side that can take one. |
| Manage Server Startup | `pano.panel.manage.server.startup` | RAM, flags, Java version, port. [Managed servers](#startup-settings) only. |
| Create Servers | `pano.panel.create.servers` | [Create](#creating-a-server) a server on a node, and reinstall one. |
| Manage Nodes | `pano.panel.manage.nodes` | Add, configure and remove [nodes](#nodes). |

Two things can be attached to a permission node on top of the node itself: **which servers** it
counts for, and — for the console — **which commands it may not send**. Both are edited where the
node is, in **Panel → Permissions**.

### Scoping a permission to one server

Every `pano.panel.manage.server.*` node can be granted **globally** or for **specific servers only**.
A node granted with the context

```jsonc
"server": 3
```

counts only for server `3`; a list — `"server": [3, 7]` — counts for those two. A scoped node never
satisfies a global check, so someone whose only console node is scoped to server `3` can open that
server's console and no other.

Use it to hand a build team the console of one server without giving them the rest of the network.

In the panel you do not have to write that by hand: editing a `pano.panel.manage.server.*` node
shows a **Which servers** list with a checkbox per server. Leave everything unchecked and the node
counts for **all** servers, including the ones you add later; tick some and it counts only for
those. The permission list then shows *all servers*, *1 server* or *N servers* under the node.

> A context Pano cannot read (a malformed value, a name instead of an id) matches **nothing**, so a
> typo closes a door rather than opening one.

### Forbidding individual commands

Console access is operator access — but sometimes it should be *almost* operator access. A console
node (`pano.panel.manage.server.console`, or the umbrella `pano.panel.manage.servers`) can carry a
list of commands it may never send:

```jsonc
"denyCommands": ["op", "deop", "stop", "whitelist*"]
```

The editor takes them as chips, one per pattern. **Only the first word** of what is typed is
compared, the comparison ignores case, and a pattern ending in `*` covers everything that starts
with it — `world*` blocks both `worldedit` and `worldborder`. A command that matches is refused
before it leaves Pano, and the person sending it is told which pattern stopped it.

Because the list lives on the node, a moderator can have the console of one server without `stop`
while an administrator keeps everything everywhere. **Administrators are never blocked**: an account
with the `*` permission is not filtered, because a restriction its holder could lift by editing
their own group is theatre rather than security.

### Activity

Every server has an **Activity** tab under its settings, and its overview shows the last five
entries. It is Pano's activity log filtered to that one server, newest first: commands sent and by
whom, power actions, player actions, plugin installs, removals and toggles, file changes, backups,
schedule runs and crashes. The entries can be filtered by type and read further back page by page.

Reading it needs the **Access Activity Logs** permission, like the full log under **Panel → Logs**.

### Rate limits

Server actions are capped per user and per server, so that a stuck script or an impatient
administrator cannot flood a game server or fill a disk:

| Action | Limit |
| --- | --- |
| Console commands | 10 per 10 seconds |
| Power actions | 6 per minute |
| File writes | 60 per minute |
| Uploads | 10 per minute |
| Backups | 3 per 10 minutes |
| Plugin installs | 10 per 10 minutes |

Going over is answered with a "slow down" message and nothing is queued — the control comes back by
itself a moment later.

## Signing in without a website

> ⚠️ The panel's own sign-in page ships on the **alpha** channel first, like the rest of this page.

Pano can be run purely as a server manager, with no public site at all — that is the **Servers**
usage mode, picked in the setup wizard or later under **Settings → Platform → Preferences** (it is
stored as the [`usage-mode` key](../configuration/#general-settings)).

In that mode the panel has a sign-in page of its own at **`/panel/login`**, so there is no theme to
sign in through:

- Username or e-mail, password, and **Remember me**, which fills your username in next time.
- **Two-step verification** works as it does on the site: when the
  [Auth Guard](../../plugins/auth-guard/) plugin asks for a code, the page asks for it as a second
  step.
- **Forgot your password?** links to the theme's reset page when there is a site to link to. In
  Servers mode there is none, so the page points at your support address instead, or tells you to
  ask another administrator — a reset link that lands on a 404 helps nobody.
- Opening any panel address while signed out sends you here and back where you were going
  afterwards. **`/panel/logout`** ends the session.

In Servers mode Pano also **no longer starts the theme process at all** — one less Node process and
its memory — and the old public addresses (`/`, `/login`, `/reset-password`, the activation pages)
redirect to the panel, so an old bookmark still arrives somewhere useful. Switching the usage mode
in the panel starts or stops the theme without a restart.

## Plugin configuration

Console capture has a master switch in the Pano MC Plugin's own `config.conf`, on the game server:

```jsonc
console {
  enabled = true
}
```

- `enabled = true` (the default) — the plugin installs its log capture and answers Pano's stream
  requests.
- `enabled = false` — the capture is never installed and stream requests are ignored, so the console
  page stays empty for that server. Everything else keeps working: the server stays connected,
  metrics, the roster, the plugin list and power are unaffected, and a command sent from the panel
  still runs — you just do not see its output.

The block is added automatically the first time a server starts with a plugin new enough to have it
(plugin config version **6**); you never have to create it by hand. Restart the Minecraft server
after changing the value.

Nothing has to be configured on the Pano side for a linked server. What server management adds to
Pano's own `config.conf` is three blocks, all optional and all described in the
[Configuration Guide](../configuration/):

| Block | |
| --- | --- |
| [`local-node`](../configuration/#local-node) | The daemon Pano runs on its own machine. |
| [`managed-servers`](../configuration/#managed-servers) | Where the Pano plugin jar that goes into every managed server comes from. |
| [`plugin-sources`](../configuration/#plugin-sources) | The CurseForge API key, if you have one. |

## Security and auditing

- **Console output is untrusted text.** Anything a player types can end up in the log, so Pano
  renders every line as plain text — never as HTML — and the game server strips terminal colour
  codes before sending it.
- **Commands are data, never a shell.** A command is dispatched to the server's own console sender;
  it never touches a shell on the host, and Pano builds player-action commands itself rather than
  passing panel input through.
- **Everything is logged.** Every command sent, every power action, every player action and every
  plugin toggle is written to the panel activity log with the user who did it. Read it under
  **Panel → Logs** with the **Access Activity Logs** permission.
- **Console access is operator access.** Someone who can send commands to a Minecraft server can do
  anything an operator can. Treat `pano.panel.manage.server.console` as carefully as you treat OP
  in-game, and scope it per server where it makes sense.

## Need help?

- Check the [FAQ page](../FAQ/)
- Ask on our [Discord community](https://discord.gg/6vVy72wgXT)
- Open an issue on [GitHub](https://github.com/PanoMC/Pano/issues)
