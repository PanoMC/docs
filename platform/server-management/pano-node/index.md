# pano-node & Pano Agent

`pano-node` is the daemon that runs managed servers on a machine. It always runs as its own
process, so restarting or updating Pano never takes the game servers down. On Pano's own machine
Pano runs it for you (the **Local** node); this page is for running it yourself.

## Installing {#installing}

Download it from your own Pano, so the version always matches — it is also attached to every
[Pano release](https://github.com/PanoMC/Pano/releases). It needs **Java 17 or newer**.

```bash
curl -fsSL https://panel.example.com/api/node/pano-node.jar -o pano-node.jar

# First start: pair with the code from Nodes → Add node → Manual
java -jar pano-node.jar --pano https://panel.example.com --code 123456 --data ./node-data

# Every start after that
java -jar pano-node.jar --data ./node-data
```

| Flag | Variable | |
| --- | --- | --- |
| `--pano <url>` | `PANO_URL` | Your Pano's address |
| `--code <code>` | `PANO_PAIR_CODE` | The pairing code |
| `--data <dir>` | `PANO_NODE_DATA` | The data folder (default `./node-data`) |
| `--name <name>` | `PANO_NODE_NAME` | The node's name in the panel |
| `--runtime DOCKER` | `PANO_NODE_RUNTIME` | Run each server in its own Docker container |
| `--port-range <a-b>` | `PANO_NODE_PORT_RANGE` | Ports for its servers (default `25565-25600`) |
| `--service install` | | Write a systemd / launchd / Windows service file and exit |

**In a container:** the image is `ghcr.io/panomc/pano-node`. Mount a volume at **`/data`** (or
everything is lost with the container), publish the same ports as `PANO_NODE_PORT_RANGE`, and use a
restart policy such as `--restart unless-stopped`.

## Data and configuration {#data-and-configuration}

Everything lives in the data folder: `config.conf`, `servers/`, `backups/`, `java/` and a few caches.
Only one daemon can use a folder at a time.

```jsonc
platform {
  url = "https://panel.example.com"
  token = "<secret>"
  encryption-key = "<secret>"
}
node {
  stop-servers-on-exit = false
  java-auto-download = true
  tool-auto-download = true
}
```

- **The token and keys are secrets.** Never copy or share the file. If it leaks, delete the node in
  the panel and pair again.
- `stop-servers-on-exit = false` keeps servers running while the daemon restarts.
- Missing Java versions are downloaded into `java/`, and a small `git` for compiling Spigot into
  `tools/`. Set the two `auto-download` keys to `false` to prevent that.
- Edit the file only while the daemon is stopped.

## Updating and removing {#updating-and-removing}

- **Updating:** the Nodes page shows **Update available**. The daemon downloads the new jar, checks it
  and restarts in a few seconds; its servers keep running. On Windows, copy the new jar over by hand.
- **Removing:** **Nodes → Delete** deletes every server, backup and downloaded Java on the node,
  after asking for its name and your password. An offline node can only be forgotten; its files stay.

| Exit code | Meaning |
| --- | --- |
| **75** | Update staged — start it again |
| **76** | Another daemon already uses this folder |
| **78** | Removed from Pano — do not restart |

## Pano Agent {#pano-agent}

The Pano Agent hands a server you already run to Pano **where it is**: put `pano-agent.jar` in the
server's folder and start it **instead of the server jar**. It starts the server, keeps its console
in your terminal, and lets Pano manage the rest. Nothing is moved.

**Add server → Link with the Pano Agent** shows the download and a ready-made command:

```bash
cd /home/mc/survival
curl -fLo pano-agent.jar 'https://panel.example.com/api/node/pano-agent.jar'

# Stop the server, then run the dialog's command once (the code works once, for 1 minute)
java -jar pano-agent.jar --pano 'https://panel.example.com' --code k7m2x9qa4tj3n8wp

# Every start after that
java -jar pano-agent.jar
```

- The first run asks for the server jar, memory and Java arguments; **Enter** keeps the defaults it
  read from your start script. On a hosting panel such as Pterodactyl, set the server jar to
  `pano-agent.jar` and answer in the web console.
- Typing `stop` stops only the server; the agent keeps running so Pano can start it again.
  <kbd>Ctrl</kbd>+<kbd>C</kbd> stops both.
- The agent keeps its data in `.pano-agent/` — leave it out when copying the folder for a new
  server.
- It updates itself without stopping the server. To remove it, remove the server in Pano, then start
  the server jar directly again.

## Security {#security}

- The node only connects **out** to Pano; nothing on it has to be opened.
- Every message is AES-256-GCM encrypted — still use **HTTPS** for a node on another machine.
- A node paired with a code must be approved in the panel.
- File access stays inside each server's folder, and servers are started without a shell.
