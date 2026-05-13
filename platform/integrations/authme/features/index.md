# AuthMe Features

## Supported Features

Pano supports the following AuthMe commands and features:

- `/register <password> <confirmPassword>` — Register a new account
- `/login <password>` — Login to your account
- `/logout` — Logout from your account
- `/changepassword <oldPassword> <newPassword>` — Change account password
- `/authme forceLogin <player>` — Force login a player (admin)
- `/authme register <player> <password>` — Register a player (admin)
- `/authme reload` — Reload AuthMe configuration
- `/authme changepassword <player> <newPassword>` — Change a player's password (admin)

Pano listens to these commands and synchronizes the actions with your website database.
## Unsupported Features

Due to integration limitations, the following AuthMe commands and features are **not supported**:

- `/unregister` — Unregistering must be done through Pano's panel or website
- `/authme unregister <player>` — Same as above
- `/email` — Email management is handled by Pano
- `/totp` — Two-factor authentication is not supported
- `/totp` — Two-factor authentication is not supported

If a player tries to use an unsupported command, they will be notified to use the website instead.

> **Recommended:** To prevent confusion and ensure a seamless experience, it's recommended to **disable access to these unsupported commands** using a permission plugin or AuthMe's own command configuration. This way, players will only have access to Pano-compatible features.

### Best Practice: Redirect Players to Your Website

For an even better user experience and enhanced security, consider **disabling or restricting in-game registration** entirely:

**How to implement:**
1. Disable the `/register` command using permissions or AuthMe configuration
2. Set AuthMe to only allow already-registered players to join
3. Configure a server message that **directs new players to your website** to register

**Why this approach is better:**

- **Enhanced Security** — Web registration allows for email verification, CAPTCHA, and other security measures
- **Better UX** — Players can create accounts with proper forms, password strength indicators, and clear instructions
- **Centralized Management** — All registrations happen through Pano's website, making moderation easier
- **Professional Appearance** — Gives your server a more polished, modern feel
- **Additional Features** — You can add terms of service, privacy policy acceptance, and other requirements during registration

**Example AuthMe Configuration:**

```yaml
settings:
  registration:
    enabled: false  # Disable in-game registration
  
restrictions:
  allowCommands:
    - /login
    # /register removed from allowed commands
```

Then configure a kick or join message pointing players to your website: `"Please register at https://yourserver.com/register"`
## Comparison with Other Web Scripts

Unlike traditional web scripts that require complex configuration and manual synchronization, **Pano's AuthMeReloaded integration is seamless**:

| Feature | Traditional Scripts | Pano |
|---------|---------------------|------|
| **Setup Complexity** | High — requires manual database setup, config editing, and PHP scripts | Low — just enable the checkbox |
| **Synchronization** | Manual or cron-based | Real-time via WebSocket |
| **Password Hashing** | Often incompatible or insecure | Native CUSTOM hash support |
| **Command Support** | Limited or none | Full command and event support |
| **Auto-Configuration** | Manual | Automatic with backup |

With Pano, everything just works. No manual database editing, no complex configuration — just plug and play.
