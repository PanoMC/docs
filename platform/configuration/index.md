# Configuration Guide

Pano uses a **HOCON** (Human-Optimized Config Object Notation) configuration file to manage its settings.  
HOCON is similar to JSON but easier to read — it supports comments, unquoted strings, and trailing commas.  
Learn more about it here:  
👉 [Lightbend HOCON Documentation](https://github.com/lightbend/config/blob/main/HOCON.md)

When Pano starts for the first time, it automatically generates a configuration file named **`config.conf`** in the same
directory as your **`Pano-<version>.jar`**.  
By default, Pano looks for this file using:

```kotlin
System.getProperty("pano.configFile", "config.conf")
```

This means you can specify a **custom configuration path** using the JVM parameter **`-Dpano.configFile`**, like this:

```bash
java -Dpano.configFile=/path/to/custom.conf -jar Pano-1.0.0.jar
```

If not specified, Pano will use the default `config.conf` in the same folder as the JAR file.

During the **installation process**, some values such as database information, admin credentials, and URLs are
automatically **written or overridden**.  
If you modify them manually, Pano may **overwrite** them during startup or future updates.  
Only edit what you understand and always make a backup before changing anything.

## 🪄 Auto-Migrations

Every time Pano starts, it checks the **`config-version`** field within your configuration. If the version in the file is older than the current Pano version's requirements, Pano will **automatically perform necessary migrations**. This ensures your configuration and database remains compatible with the latest features and security updates without manual intervention.

## 🔤 General Settings

```jsonc
# Configuration version used for migrations (DO NOT manually change)
config-version = <int>

# Enable or disable development mode (default: false)
development-mode = false

# Interface language code (added/edited through the admin panel)
locale = "en-US"

# The public URL of your website (required for emails, cookies, etc.)
website-url = "http://yourdomain.com"

# Allow users to select their preferred language (default: true)
allow-user-locale-selection = true

# The registration agreement shown to users (supports HTML)
register-agreement = ""

# Website name and description
website-name = ""
website-description = ""

# Support email used for notifications and password resets
support-email = ""

# Minecraft server information shown to players
server-ip-address = "play.ipadress.com"
server-game-version = "1.8.x"

# SEO keywords
keywords = []
```

**Tips**

- `config-version`: used internally for migrations — **do not rename or edit it**.
- `development-mode`: default is **false** for performance and security; set **true** only for debugging.
- `locale`: use short codes like `en-US` or `tr` (languages can be added in the panel).
- `website-url`: the base URL of your website. This is **mandatory** for generating system emails, managing session cookies, and other platform features.
- `allow-user-locale-selection`: enables/disables the ability for users to choose their own language from available locales (default: `true`). Can be managed in **Panel → Settings → Platform → Preferences**.
- `register-agreement`: defines the terms or rules shown during user registration. This field **supports HTML tags** for formatting.
- `server-ip-address`: visible in your theme — players can **copy and use it to join** your Minecraft server.

## 🗄️ Database Configuration

```jsonc
database {
  type = "mariadb" # "mariadb" (for both MySQL/MariaDB) or "portable"
  host = ""        # e.g., "127.0.0.1:3306"
  name = ""        # database name
  username = ""
  password = ""    # can be empty if your database has no password
  prefix = "pano_" # table prefix (do not change after installation)
}
```

**Notes**

- **Database Types:**
    - `mariadb`: Default type, compatible with both **MySQL 5.5+** and **MariaDB**.
    - `portable`: Only supported on **Windows (x64 and ARM64)**. Automatically managed by Pano (see [Installation Guide →](../installation) for details).
- Password can be blank if authentication is disabled.
- **Warning:** Changing `type` or `prefix` after installation is not supported and will require a **reinstallation**.

## 👤 Pano Account (Optional)

```jsonc
pano-account {
  username = ""
  email = ""
  access-token = ""   # secure token for your Pano account
  platform-id = ""    # account ID
  
  connect {
    public-key = ""
    private-key = ""
    state = ""
  }
}
```

**Important**

- If unsure what this does, **do not edit manually**.
- Manage linking in **Panel → Settings → Platform**.
- Required for **Marketplace features** (updates, store installs).
- See [Connect Your Pano Account →](./advanced/connect-pano-account) for more info.

## 🎨 Theme

```jsonc
current-theme = "vanilla-theme"
```

**Details**

- Defines which theme is active.
- If an invalid theme ID is used, **Pano falls back to `vanilla-theme`**.
- Can be changed via **Panel → View → Themes**.

## ✉️ Email (SMTP)

```jsonc
email {
  enabled = false
  sender = ""      # e.g., "Pano <no-reply@domain.com>" - mostly must be same with username
  hostname = ""    # e.g., "smtp.gmail.com"
  port = 465
  username = ""    # e.g., "no-reply@domain.com"
  password = ""
  ssl = true
  starttls = ""    # "DISABLED" or "OPTIONAL" or "REQUIRED
  authMethods = "" # optional, mostly "PLAIN"
}
```

**Info**

- Optional during setup; configurable later via **Panel → Settings → Platform**.
- Without SMTP, password recovery and verification emails will not work.

## 🌐 Server Settings

```jsonc
server {
  host = "0.0.0.0"
  http-port = 80
  https-port = 443
  ssl-mode = "DISABLED" # "DISABLED", "LETS_ENCRYPT", "MANUAL"
  redirect-https = false
  ssl-cert = null # Raw certificate content (if MANUAL)
  ssl-key = null  # Raw private key content (if MANUAL)
}
```

- `host`: `0.0.0.0` makes the panel accessible to external networks; `127.0.0.1` restricts access to local only.
- `http-port`: Default port for HTTP traffic (usually **80**).
- `https-port`: Default port for HTTPS traffic (usually **443**).
- `ssl-mode`:
    - `DISABLED`: No HTTPS server will be started.
    - `LETS_ENCRYPT`: Automatically attempts to obtain and configure an SSL certificate. **Note:** For this to work, a valid `website-url` must be configured, **http-port** must be set to `80`, and **https-port** must be set to `443`.
    - `MANUAL`: Allows you to provide your own certificate and key strings directly via `ssl-cert` and `ssl-key`.
- `redirect-https`: If set to `true`, all HTTP traffic will be automatically redirected to HTTPS.
- **Advanced:** For complex setups, you can still use a **reverse proxy** (Nginx, Apache) or Cloudflare.

## 🧩 Initialization, UI, and Updates

```jsonc
init-ui = true
accept-plugin-auth = true
jwt-key = "<auto-generated-base64>"
update-period = "ONCE_PER_DAY" # "ONCE_PER_DAY" or "ONCE_PER_WEEK" or "ONCE_PER_MONTH"
release-channel = "RELEASE" # "ALPHA", "BETA", "RELEASE"
```

**Details**

- `init-ui`: launches the **setup wizard, panel, and theme engine** at startup.
- `accept-plugin-auth`: enables/disables the connection of the Pano MC plugin (default: `true`). Can be managed from the **Connect Server** modal. For better security, disable it if not in use.
- `jwt-key`: auto-generated **Base64 authentication key** — **do not modify manually**.
- `update-period`: defines update-check frequency.
- `release-channel`: determines which update stream Pano follows:
    - `ALPHA`: Early access to new features. High risk of bugs and breaking changes.
    - `BETA`: Pre-release features with lower risk than Alpha, but may still contain bugs.
    - `RELEASE`: Most stable version. Receives updates less frequently but ensures maximum reliability.

## 📁 File Uploads and Paths

```jsonc
file-uploads-folder = "file-uploads"

file-paths = {
  favicon {
    path = "uploads/favicon.png"
    hash = "<sha256-hash>"
  }
  websiteLogo {
    path = "uploads/logo.png"
    hash = "<sha256-hash>"
  }
}
```

**Notes**

- Controlled by **Panel → Settings → Website**.
- Each entry is a **FileInfo** object containing:
    - `path`: Relative path to the file.
    - `hash`: SHA-256 hash used by Pano to verify file integrity.
- Only supports two entries: `favicon` and `websiteLogo`.
- These fields are **automatically managed by Pano** — manual edits are overwritten on updates or settings changes.

## 🔗 Pano Service URLs (Do Not Modify)

```jsonc
pano-api-url = "..."     # auto-set based on environment
pano-website-url = "..."
```

- These are managed by Pano automatically.
- Changing them can break connectivity with the Pano ecosystem.

## 🧱 Setup Progress (Internal)

```jsonc
setup {
  step = 0
}
```

**Usage**

- Tracks installation progress.
- Always **stop Pano before editing**.
- `step = 0`: restarts the setup wizard.
- `step = 5`: marks setup as complete.
- Only modify if instructed by support; improper edits may cause broken installations.

## ✅ Production Checklist

- `development-mode = false`
- Port **80 (TCP)** open and reachable
- HTTPS enabled (via Pano SSL or Reverse Proxy) and Port **443 (TCP)** open
- Secure and private `jwt-key`
- Valid SMTP credentials configured
- Database prefix unchanged post-install
- Correct theme ID set or falls back to Vanilla Theme
- Regular backups for database and uploads

## 🧪 Example Minimal Configuration

```jsonc
development-mode = false
locale = "en-US"

website-name = "My Awesome Server"
website-description = "Survival • Events • Friendly Community"
support-email = "support@myserver.com"

server-ip-address = "mc.myserver.com"
server-game-version = "1.20.x"

database {
  host = "127.0.0.1:3306"
  name = "pano_prod"
  username = "pano_user"
  password = ""
  prefix = "pano_"
}

current-theme = "vanilla-theme"

email {
  enabled = true
  sender = "Pano <no-reply@myserver.com>"
  hostname = "smtp.myserver.com"
  port = 465
  username = "no-reply@myserver.com"
  password = "REPLACE_ME"
  ssl = true
}

server {
  host = "0.0.0.0"
  port = 80
}
```

## 🔄 After Editing

- Save and **restart Pano** after editing.
- Avoid changing auto-generated fields (e.g., `jwt-key`, `config-version`).
- Check for syntax issues if startup fails.
- Always back up before upgrading or reinstalling.

> Need help? Visit the FAQ, join our [Discord community](https://discord.gg/6vVy72wgXT), or report issues
> on [GitHub](https://github.com/PanoMC/Pano/issues).
