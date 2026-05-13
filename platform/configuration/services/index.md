# Services Configuration

## Database Configuration

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
## Pano Account (Optional)

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
## Email (SMTP)

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
