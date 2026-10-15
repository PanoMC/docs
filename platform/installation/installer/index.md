# One-Command Installer

One command sets up Pano with everything around it: the Pano release, a private Java runtime, a
launcher that restarts Pano after a crash, a service that starts it with the system and the `pano`
command. Everything Pano writes stays in one folder.

## Run it {#run}

::: code-group

```bash [Linux / macOS]
curl -fsSL https://panomc.com/install | bash
```

```powershell [Windows]
powershell -c "irm https://panomc.com/install.ps1 | iex"
```

:::

No `curl`? Use `wget -qO- https://panomc.com/install | bash`. Linux and macOS need `curl` or `wget`, and
`tar`. The [downloads page](https://panomc.com/downloads) builds the command for you.

The installer first asks for a language (English, Turkish or Russian), then shows the options screen:
**Up / Down** move, **Enter** changes a row or starts the install, **q** quits. With `-y`, or without a
terminal, it asks nothing and installs with the defaults and the options you passed.

When it is done, open the address it prints, `http://localhost` (or `http://<your-server-ip>`), and follow the
[Setup Wizard](../setup/).

## Options {#options}

Options go after `bash -s --`; on Windows the script runs as a script block:

```bash
curl -fsSL https://panomc.com/install | bash -s -- --mariadb --version 1.0.0
```

```powershell
powershell -c "& ([scriptblock]::Create((irm https://panomc.com/install.ps1))) -MariaDB -Version 1.0.0"
```

| Linux / macOS | Windows | What it does |
| --- | --- | --- |
| `--mariadb` | `-MariaDB` | Install MariaDB and create the database and user `pano` for Pano |
| `--docker` | — | Run Pano and MariaDB as containers. See [Docker mode](#docker) |
| `--gui` | `-Gui` | Run Pano with its window instead of hidden in the background |
| `--version <version>` | `-Version` | Install this version. Default: the latest |
| `--channel <channel>` | `-Channel` | Newest version of a channel: `release`, `beta` or `alpha` |
| `--system`, `--user` | `-System`, `-User` | Install for the whole system or only for the current user |
| `--dir <folder>`, `--here` | `-Dir`, `-Here` | Install into this folder, or into the current one |
| `--port <port>` | `-Port` | Port Pano listens on. Default: `80`; `8088` when 80 is taken or, on Linux, for a one-user install |
| `--java <version>` | `-Java` | Java Pano runs on: `11` (default), `17`, `21` or `25` |
| `--system-java` | — | Install that Java with the package manager instead of in Pano's folder |
| `--memory <amount>` | `-Memory` | The most memory Pano's Java may use, in MB or GB (`1024`, `2g`). Default `1g`, at least `512` |
| `--no-restart` | `-NoRestart` | Do not restart Pano after a crash |
| `--no-autostart` | `-NoAutostart` | Do not start Pano when the system starts |
| `--lang <en\|tr\|ru>` | `-Lang` | Language of the install |
| `-y`, `--yes` | `-Yes` | Do not ask anything |
| `-h`, `--help` | `-Help` | Show the options |

- **Version:** without `--version` or `--channel` you get the newest stable release; while there is
  none, the newest beta, else the newest alpha. The download is checked against its SHA-256.
- **Scope:** run as root / administrator it installs for the whole system, otherwise for the current
  user. A system install asks for `sudo` (Windows: administrator rights).
- **Memory:** under 1 GB Pano runs, but it may run out of memory.

## What it installs {#what-it-installs}

| | Current user | Whole system |
| --- | --- | --- |
| Folder on Linux / macOS | `~/pano` | `/opt/pano` |
| Folder on Windows | `%USERPROFILE%\Pano` | `C:\Pano` (the system drive) |
| `pano` command on Linux / macOS | `~/.local/bin/pano` | `/usr/local/bin/pano` |

In the folder: `Pano-<version>.jar`, the Java runtime in `runtime/jre`, the launcher and the `pano`
command in `bin/`, the settings file `pano.env`, and everything Pano creates itself (`config.conf`,
`plugins/`, `themes/`, `logs/`, …).

- **Service:** a systemd unit `pano` on Linux, a launchd job `com.panomc.pano` on macOS, a scheduled
  task `Pano` on Windows. On Linux without systemd there is no service: start Pano yourself after a
  reboot with `pano start`. With `--gui` on Linux you get an applications menu entry instead.
- **Crashes:** the launcher restarts Pano after a crash, at most 5 times in 5 minutes, and never
  after a stop you asked for. Restarts and updates from the panel go through it too.
- **`--mariadb`:** uses the system's package manager on Linux, Homebrew on macOS and `winget` on
  Windows. The password lands in `pano.env` and the database step of the Setup Wizard is filled in.
  If MariaDB cannot be set up, Pano is installed anyway and the wizard asks for a database.
- **`pano.env`:** `PANO_MEMORY` and `PANO_JVM_ARGS` are read on every start. The port and the
  database are only copied into `config.conf` on the first start; change them in the panel later.
- **Updating:** run the installer again in the same folder. Pano is updated, your data stays.

## Docker mode {#docker}

`--docker` (Linux and macOS, needs Docker with the compose plugin) installs nothing but two containers,
Pano and MariaDB. It writes `compose.yaml` and `.env` (database password, image tag, port, memory
limit) into the install folder, `~/pano` by default, pulls the images and starts them. There is no
Java, no service and no `pano` command: run `docker compose ps`, `logs -f`, `stop` or `up -d` in that
folder, and `docker compose down -v` to remove it with its data. See [Install with Docker](../../containers/).

## The `pano` command {#pano-command}

| Command | Does |
| --- | --- |
| `pano start`, `pano stop`, `pano restart` | Start, stop or restart Pano |
| `pano status` | Is it running? |
| `pano logs` | Follow the log |
| `pano dir` | Print the install folder |
| `pano uninstall` | Remove Pano |

On Windows open a new terminal first. If the installer says the command's folder is not in your
`PATH`, call `<folder>/bin/pano` instead.

## Uninstall {#uninstall}

`pano uninstall` removes the program, its Java runtime, the service and the `pano` command, and
**keeps your data** (config, plugins, themes, uploads). Add `--purge` (Windows: `-Purge`) to delete the
data too. MariaDB and its `pano` database are never removed.
