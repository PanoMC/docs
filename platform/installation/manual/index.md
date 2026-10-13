# Manual Install (.jar)

Run the Pano `.jar` yourself, the way you run **Spigot** or **Paper**. You bring **Java 11 or newer** and a
MySQL / MariaDB database, and you keep Pano running yourself. Prefer it done for you? Use the
[one-command installer](../installer/) or [Docker](../../containers/).

## Downloading Pano

You can get the latest version of Pano from the official website:

- [Download Latest Version →](https://panomc.com/downloads)
- For older releases, visit [GitHub Releases](https://github.com/PanoMC/Pano/releases)

Pano is distributed as a **`.jar`** file — just like **Spigot** or **Paper**.  
After downloading, save the file somewhere convenient (for example, in a dedicated folder like `/pano`).

> [!NOTE]
> When you first run Pano, it will extract necessary files, create directories (like `plugins/` and `themes/`), and download required dependencies or runtimes. It is highly recommended to run it in its own dedicated folder.

## Running Pano

To start Pano, open your terminal (or command prompt) and run:

```bash
java -jar Pano-<version>.jar
```

If a desktop environment is available, **Pano will automatically launch its GUI**.  
Otherwise, it will continue in console mode.

### GUI Behavior

- **Double-clicking** the `.jar` file will attempt to launch the GUI automatically.
- Use the **`-nogui`** flag if you prefer running Pano in console mode:

```bash
  java -jar Pano-<version>.jar -nogui
```

- The built-in GUI includes a minimal console for **Pano-specific commands only**.

If the GUI cannot start (for example, in a headless environment), the console will continue automatically.

### Background Mode (`-bg`) {#background-mode-bg}

If you launch Pano from a terminal or SSH session, closing that session will normally kill the platform. Use the **`-bg`** flag to detach Pano from the launching terminal so it keeps running on its own:

```bash
java -jar Pano-<version>.jar -bg
```

When you pass `-bg`, the launcher process re-spawns itself as a detached child and exits. Standard output and standard error of the detached process are discarded — check the `logs/` folder for runtime logs.

`-bg` is **independent** of `-nogui`:

| Flags | GUI | Detached from terminal |
| --- | --- | --- |
| _(none)_ | Yes | No |
| `-nogui` | No | No |
| `-bg` | Yes | Yes |
| `-bg -nogui` | No | Yes |

> [!TIP]
> When you launch a platform update or restart from the panel and the platform is currently **terminal-attached**, the confirmation modal offers a "Restart in background mode" toggle. Enabling it ensures the new process is detached from your terminal — useful if you want to close the SSH session right after.

> [!NOTE]
> A process started with `-bg` has no interactive stdin, so the JLine console reader is skipped. Type commands through the panel UI or, if `-nogui` was not passed, through the built-in GUI console.

## Next step

Open `http://<your-server-ip>/` (the `.jar` listens on port **80** by default; change it with
[`http-port`](../../configuration/server/) in `config.conf`) and follow the [Setup Wizard](../setup/).
