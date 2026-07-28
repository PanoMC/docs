# Maintenance Mode

> ⚠️ Configured in **Panel → Settings → Platform** and requires the **Manage Platform Settings** permission.

**Maintenance mode** takes your public website offline without stopping Pano. While it is on, visitors never reach your
theme — Pano serves its own page straight from the backend instead. Your admin panel, your connected Minecraft servers
and the panel API keep working; public API endpoints answer `503`.

Because Pano renders that page itself, maintenance mode works with **every theme** and needs no theme support. You can
install, switch, update or outright break your theme while it is on.

## Turning it on

1. Go to **Panel → Settings → Platform → Maintenance Mode**.
2. Flip **Enable Maintenance Mode** and type your account password. Taking the site offline — and putting it back up —
   is re-authenticated like the other critical settings. The rest of the card saves without a password.
3. Adjust the settings below and press **Save**.

It applies on the very next request: no restart, and your own panel session is never interrupted. While it is on, every
panel page shows a banner you cannot dismiss.

> ⚠️ Maintenance mode is inert until your installation is set up. During the setup wizard it does nothing.

## Settings

- **Who Can Bypass** — the permission node a user must hold. Leave it empty for the panel access permission
  (`pano.panel.access.panel`), which is what the placeholder shows. Fill it in — `admins.test`, say — to let in people
  who should see the site but never the panel. The node is matched **literally** and may not contain `*`.
- **Show Login Button** — puts a login button on the maintenance page.
- **Custom Login URL** — a secret address that serves the login form instead, for example `/staff-entrance`. Available
  only while the login button is off; leave it empty and the form stays on `/login`.
- **Show Site Logo** — shows the logo from **Panel → Settings → Website**.
- **Edit Maintenance Page** — the page source editor. See [Editing the page](#editing-the-page).
- **Banned IP Addresses** — the list the maintenance login has locked out. See [Blocked addresses](#blocked-addresses).

| Show Login Button | Custom Login URL | URL that serves the login form |
| --- | --- | --- |
| On | *(ignored, field greyed out)* | `/login` |
| Off | *(empty)* | `/login` |
| Off | `/staff-entrance` | `/staff-entrance` |

Anonymous visitors who open `/panel` — or a bookmarked link under it — are redirected to whichever address serves the
form, so a saved panel link still leads somewhere useful.

## What people see

**Visitors** get the maintenance page with `503 Service Unavailable` and `Retry-After`, which search engines read as
"temporarily down, come back later" rather than "gone". Nothing of your theme is served, and the page carries no theme
assets, so it renders even when no theme can start.

**Staff who may bypass** get the same page plus a **Skip maintenance mode** button. Pressing it hands them the real
theme — but only until the page is reloaded: the skip is spent by the navigation it was granted for, so <kbd>F5</kbd>,
a new tab or a typed URL brings the maintenance page back. That is deliberate; nobody should forget the site is closed.
`/panel` is never blocked for a panel-access holder either way, and API access follows the **permission**, not the skip.

The permission is re-checked on the server on every request, so revoking it takes access away immediately — though a
change can take up to a minute to propagate through Pano's permission cache.

## The login

The maintenance login is deliberately minimal: **username or e-mail, and a password**. Login plugins do not run here —
no captcha, no 2FA, no social or premium login — because the whole point is a door that still opens when a plugin is
what broke. Those plugins are back the moment maintenance mode is off.

It never says whether a username exists, and it is rate-limited per address.

## Blocked addresses

Three failed logins from one address are tolerated; the next failure blocks it **permanently**. Blocked visitors get the
maintenance page with no form, just a notice. A successful login resets the counter.

- Manage the list from **Banned IP Addresses** at the bottom of the card — remove one, or **Clear All**.
- **Loopback (`127.0.0.1`, `::1`) is never counted or blocked**, so terminal access to the machine is always a way in.
- Bans live in `maintenance/maintenance-mode-banned-ips.json` and survive restarts. Every automatic block is written to
  the panel activity log.

> ⚠️ Behind a reverse proxy, set `server.trusted-proxies` — see the
> [server configuration](../configuration/server/). Left empty, Pano ignores `X-Forwarded-For` entirely and every
> request looks like it comes from the proxy, so one visitor's failures would block everyone.

## Editing the page

**Edit Maintenance Page** opens a source editor with a live preview underneath and one tab per file. All five live in
the folder Pano runs from and are plain Handlebars templates — there is no rich-text editor, you write the markup.

| Tab | File |
| --- | --- |
| **Page** | `maintenance/page.hbs` — the whole document |
| **Login form** | `maintenance/login.hbs` |
| **Login button** | `maintenance/login-button.hbs` |
| **Skip button** | `maintenance/skip.hbs` |
| **Notice** | `maintenance/notice.hbs` |

The preview follows the open tab and renders the page state that block actually appears in, so you always look at the
thing you are editing. A broken directive shows up there rather than on the live site.

Pressing **Save** writes the files and sets `custom-page = true`: Pano stops composing the page from `title`,
`message-html` and `custom-css`, and **a Pano update that ships a new default design no longer replaces your files**.
**Reset to default** restores all five and turns that back off.

::: v-pre

The page carries these slots; leave one out and the feature it brings does not appear.

| Slot | What it becomes |
| --- | --- |
| `{{{noticeBlock}}}` | The notice banner, when there is one |
| `{{{loginBlock}}}` | The login button, or the login form on a login URL |
| `{{{skipBlock}}}` | The **Skip maintenance mode** button |
| `{{{creditBlock}}}` | The **Created with Pano** line |
| `{{logoUrl}}` · `{{lang}}` | Site logo URL, platform language code |
| `{{defaultTitle}}` · `{{{defaultMessage}}}` | Pano's own copy, in the platform language |

The blocks have their own variables — labels, `{{action}}`, `{{url}}`, `{{text}}` and so on. **Keep `{{nonce}}` and
`{{nonceField}}` in the login form**: they carry the same-origin check that stops another site from getting your
visitors' addresses blocked.

:::

Every label and message comes from Pano's translations and follows **Panel → Settings → Platform → Preferences →
Language**. Rewrite any of them in **Panel → Translations** under the **PLATFORM** type, under `maintenance.`.

## Configuration keys

```jsonc
maintenance {
  enabled = false

  # Node required to bypass. Empty = pano.panel.access.panel. No wildcards.
  bypass-permission-node = ""

  show-login-button = true

  # Empty = /login. Only honoured while show-login-button is false.
  custom-login-url = ""

  show-site-logo = true

  # Used to compose the default page; not editable from the panel.
  title = ""
  message-html = ""
  custom-css = ""

  # Wrong-password attempts from one IP before it is blocked. 0 disables blocking.
  max-login-attempts = 3

  # True once the page has been written from the panel editor; see "Editing the page".
  custom-page = false
}
```

You can move the folder at launch, like Pano's other folders:

```bash
java -Dpano.maintenanceFolder=/var/lib/pano/maintenance -jar Pano-<version>.jar
```

## Locked yourself out?

In order of preference:

1. **Log in from the machine Pano runs on** — loopback is never blocked.
2. **Set `enabled = false`** in the `maintenance` block of `config.conf`. Picked up in about five seconds, no restart,
   and no password needed — this is also the way out if the panel switch is refusing yours.
3. **Clear the blocks** — from the panel, or delete `maintenance/maintenance-mode-banned-ips.json`.
4. **Reset the page** — delete `maintenance/page.hbs` and Pano regenerates it.
5. **Forgot the custom login URL, or locked out by the node?** Read or clear `custom-login-url` and
   `bypass-permission-node` in `config.conf`.

> ⚠️ Back up before large manual edits to `config.conf`. See the [Configuration Guide](../configuration/).
