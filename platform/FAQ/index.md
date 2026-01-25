# Frequently Asked Questions (FAQ)

Everything you need to know about Pano. If you can't find the answer you're looking for, feel free to join our [Discord community](https://discord.gg/6vVy72wgXT).

---

### 🌐 General

#### What is Pano?
Pano is an advanced, open-source web platform designed for Minecraft server owners. It unifies your website, community management, and game integration into one powerful system.

#### Is Pano free?
Yes! Pano is licensed under GPLv3 and is free to use for anyone. We also support an ecosystem where developers can create and sell their own addons and themes.

#### Do I need a powerful server to run Pano?
No. Pano is optimized for performance. A basic VPS with 1GB of RAM and Java 9+ is usually more than enough for most communities.

---

### 🚀 Installation & Setup

#### Which ports do I need to open?
By default, Pano uses port **80** for HTTP. If you configure SSL/HTTPS, you will also need to open port **443**.

#### Can I run Pano on Windows/Linux/macOS?
Yes! Since Pano is a Java application (.jar), it runs on any system with a JVM installed.

#### What is the "Portable DB" option during setup?
On Windows (x64/ARM64), Pano can automatically download and manage a portable MariaDB instance for you. This is perfect for local testing or small servers where you don't want to manually set up a database.

#### Pano is stuck on "Starting..." or "Extracting..."
On the first run, Pano needs to download dependencies and extract necessary files. Depending on your internet speed, this may take a few minutes. Please be patient!

---

### 🕹️ Game Integration

#### What does the `pano: true` context mean in permissions?
When you add a permission node via the Pano panel, it automatically includes the `pano: true` context. This means the permission is only active on the **Pano platform (web)** and is **not** reflected in-game. This keeps your server's internal permissions clean.

#### Why am I kicked after registering in-game?
This is a security feature called **"Kick After Register"**. It ensures that players must verify their email addresses or perform other necessary steps on the website before they are allowed to log in and play. You can disable this in **Panel → Server Settings → Game Integration**.

#### Does Pano support Bungeecord/Velocity?
Yes, Pano supports both Bungeecord and Velocity proxies, as well as standalone Spigot/Paper servers.

---

### 🧩 Addons & Themes

#### Where can I find more addons and themes?
Official and community resources will be available on the [Pano Market](https://panomc.com/market) (coming soon).

#### Can I develop my own addons?
Absolutely! Check out our [Addon Development Guide](../../addon/getting-started/) to get started.

---

### 💬 Support

#### I found a bug. What should I do?
Please report it on our [GitHub repository](https://github.com/PanoMC/pano/issues) with as much detail as possible, or let us know on Discord.

#### How can I contribute to Pano?
We love contributions! See our [Contribution Guide](../../contribution/getting-started/) for more information.