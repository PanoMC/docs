# Installing Pano

Follow this guide to set up **Pano** and get it running in just a few minutes.

## Quick start {#quick-start}

The [one-command installer](installer/) is the recommended way. It installs Pano, its own Java, a
service and the `pano` command:

::: code-group

```bash [Linux / macOS]
curl -fsSL https://panomc.com/install | bash
```

```powershell [Windows]
powershell -c "irm https://panomc.com/install.ps1 | iex"
```

:::

Add `--mariadb` (Windows: `-MariaDB`) and it also installs a database for Pano. Then open
`http://localhost` (or the address the installer prints) and follow the [Setup Wizard](setup/).

## Choosing a method {#methods}

| Method | Good for | You bring |
| --- | --- | --- |
| [One-command installer](installer/) (recommended) | Most servers and your own computer | Nothing; MariaDB is optional (`--mariadb`) |
| [Docker](../containers/) | Servers that already run Docker | Docker with the compose plugin |
| [Manual `.jar`](manual/) | Full control, or a panel that only runs a `.jar` | Java 11+, a database, your own start script |

Do not want to run a server at all? [Pano Host](https://panomc.com/host) runs Pano for you.

All three end at the same place: the [Setup Wizard](setup/) in your browser.

## Requirements {#requirements}

1. **Java 11 or newer**
   - Only for the manual `.jar`: the installer downloads its own Java and the Docker image contains one.
   - The local `pano-node` for [managed servers](../server-management/managed-servers/) runs on the
     same Java, so it needs nothing extra.

2. **MySQL 5.5+ or MariaDB**
   - A MySQL or MariaDB database is required to store your data.
   - The installer creates one with `--mariadb`; Docker Compose starts one next to Pano.
   - Default table prefix: `pano_` (you can change it during setup).

3. **Internet connection**
   - Required during the setup, as Pano downloads its interface and dependencies on the first start.

4. **An open port**
   - The installer and the manual `.jar` serve Pano on port **80**, Docker on port **8088**. The installer
     falls back to **8088** when port 80 is taken, or when it installs for one user on Linux (only the
     system install may use port 80 there).
   - **Optional:** if you configure SSL after installation, port **443 (HTTPS)** must also be open.

5. **Operating system**
   - The installer runs on Linux, macOS and Windows. The `.jar` runs wherever Java does.

## After installation {#after-installation}

- Finish the [Setup Wizard](setup/) and [connect your Minecraft server](setup/#connect-minecraft).
- Adjust the configuration file if needed: [Configuration Guide →](../configuration/).

## Need help?

If you encounter any issues:
- Visit the [FAQ page](../FAQ/)
- Ask for help on our [**Discord community**](https://discord.gg/6vVy72wgXT)
- Or open an issue on [GitHub Issues](https://github.com/PanoMC/Pano/issues)

> Together, we make Pano better.
