# Installing Pano

Follow this guide to set up **Pano** and get it running on your Minecraft server in just a few minutes.

## ⚙️ Requirements

Before installing Pano, make sure your environment meets the following requirements:

1. **Java (JVM 9+)**
   - Pano runs on Java 9 or higher.
   - Make sure the **JDK** or **JRE** is installed and accessible via your command line.
   - [→ Download Java](https://www.oracle.com/java/technologies/javase-downloads.html)

2. **MySQL 5.5+ or MariaDB**
   - A MySQL or MariaDB database is required to store your data.
   - Default table prefix: `pano_` (you can change it during setup).
   - [→ MySQL Installation Guide](https://dev.mysql.com/doc/mysql-installation-excerpt/5.7/en/)

3. **Internet Connection**
   - An active internet connection is **required during the setup process**, as Pano downloads initial resources and dependencies.

4. **Port 80 (HTTP) Open**
   - Make sure TCP port **80** is accessible if you’re installing on a remote server.

## 📦 Downloading Pano

You can get the latest version of Pano from the official website:

- [Download Latest Version →](https://panomc.com/download)
- For older releases, visit [GitHub Releases](https://github.com/your-repo/Pano/releases)

Pano is distributed as a **`.jar`** file — just like **Spigot** or **Paper**.  
After downloading, save the file somewhere convenient (for example, in a dedicated folder like `/pano`).

## 🚀 Running Pano

To start Pano, open your terminal (or command prompt) and run:

```bash
java -jar Pano-<version>.jar
```

If a desktop environment is available, **Pano will automatically launch its GUI**.  
Otherwise, it will continue in console mode.

### 🖥️ GUI Behavior

- **Double-clicking** the `.jar` file will attempt to launch the GUI automatically.
- Use the **`-nogui`** flag if you prefer running Pano in console mode:

```bash
  java -jar Pano-<version>.jar -nogui
```

- The built-in GUI includes a minimal console for **Pano-specific commands only**.

If the GUI cannot start (for example, in a headless environment), the console will continue automatically.

## 🧭 Setup Wizard (Step-by-Step)

![](/img/installer-view.png)

Once Pano starts, open your browser and navigate to:

```
http://<your-server-ip>/
```

> Make sure port **80** is open and not used by another application.

You’ll see the **Setup Wizard**, guiding you through five simple steps:

1. **Language Selection**  
   Choose your preferred language.

2. **Website Configuration**  
   Set up your website details (site name, URL, etc.).

3. **Database Setup**  
   Enter your **MySQL** or **MariaDB** credentials.  
   Default table prefix: `pano_` (you can change it if needed).

4. **SMTP Settings (Optional)**  
   Configure email sending if you wish.  
   This step is **optional**, and if you decide to skip it — **no worries!**  
   You can always enable or update SMTP settings later inside the **Panel → Settings → Platform** section.  
   *(However, some features like password recovery may not work until it’s configured.)*

5. **Account Linking & Admin Creation**
   - If you already have a **Pano Account**, you can link it here by pressing **connect** button — your email and username will auto-fill.
   - Otherwise, create a new **admin account** (don’t forget your password — it’s required for login!).

To finish the setup, click **Finish**.  
Pano will finalize the installation and automatically redirect you to your new **admin panel**.

> 🪄 *You’ll now be able to create posts, connect your Minecraft server, install addons, change themes, and much more!*


## 🛠️ After Installation

Once installation is complete, you can customize your configuration file if needed.  
Check out the [Configuration Guide →](../configuration) for detailed instructions.

## 💬 Need Help?

If you encounter any issues:
- Visit the [FAQ page](../FAQ)
- Ask for help on our [**Discord community**](https://discord.gg/6vVy72wgXT)
- Or open an issue on [GitHub Issues](https://github.com/PanoMC/Pano/issues)

> Together, we make Pano better. 🚀
