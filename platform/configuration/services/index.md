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
  host-managed = true # Pano Host only
  host-sender = null  # Pano Host only
  custom = null       # Pano Host only
}
```

**Info**

- Optional during setup; configurable later via **Panel → Settings → Platform**.
- Without SMTP, password recovery and verification emails will not work.
- `host-managed`, `host-sender` and `custom` only matter on a **Pano Host** instance; leave them alone elsewhere.
    - `host-managed`: `true` means this block follows the instance's Pano Host mail and is rewritten on every boot. Saving other mail settings in **Panel → Settings** sets it to `false`, so they stay. Default **true**.
    - `host-sender`: the sender used with Pano Host mail instead of the instance's default, kept across boots. Empty (`null`) means the default.
    - `custom`: a copy of your own SMTP settings (`sender`, `hostname`, `port`, `username`, `password`, `ssl`, `starttls`, `authMethods`), kept while Pano Host mail is in use so switching back to them loses nothing. Filled in automatically.
