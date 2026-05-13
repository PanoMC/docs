# Production Setup

## Production Checklist

- `development-mode = false`
- Port **80 (TCP)** open and reachable
- HTTPS enabled (via Pano SSL or Reverse Proxy) and Port **443 (TCP)** open
- Secure and private `jwt-key`
- Valid SMTP credentials configured
- Database prefix unchanged post-install
- Correct theme ID set or falls back to Vanilla Theme
- Regular backups for database and uploads
## Example Minimal Configuration

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
## After Editing

- Save and **restart Pano** after editing.
- Avoid changing auto-generated fields (e.g., `jwt-key`, `config-version`).
- Check for syntax issues if startup fails.
- Always back up before upgrading or reinstalling.

> Need help? Visit the FAQ, join our [Discord community](https://discord.gg/6vVy72wgXT), or report issues
> on [GitHub](https://github.com/PanoMC/Pano/issues).
