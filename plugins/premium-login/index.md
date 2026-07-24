# Premium Login Plugin

The **Premium Login** plugin bridges Minecraft account authentication between your Pano-powered website and your Minecraft server. Visitors can sign in or register with their real Microsoft/Minecraft (premium) account through the full Microsoft OAuth chain (Microsoft → Xbox Live → XSTS → Minecraft Services), so actual game ownership is verified. The plugin then keeps a per-player authentication status — **PREMIUM**, **CRACKED**, or **AUTO** — synchronized live between the website and the game server, so premium players auto-log in with no password while cracked players use offline-mode auth. It is developed by the Pano team.

::: tip One jar, two installs
The same jar is both a **Pano platform plugin** (installed on your website) and a **Minecraft server plugin** for Spigot/Paper (with Folia support), BungeeCord, and Velocity. The server side depends on the **Pano MC plugin** and **FastLogin** — it disables itself if the Pano MC plugin is missing and only activates its FastLogin listeners while the WebSocket to the website is connected.
:::

## Features

- **Sign in with Minecraft:** "Sign in / Sign up with Minecraft Account" buttons appear on the login and register pages whenever Microsoft login is enabled.
- **Smart Account Handling:** On Microsoft login, a new visitor is auto-registered and logged in from their MC username, UUID, and (pre-verified) Microsoft email; an already-linked UUID logs straight in; and if a cracked account already holds the username, that account is renamed to `tmp_xxxxxx` and emailed a **Set New Username** link (15-minute expiry) so the premium player can claim the name.
- **Account Linking:** Logged-in members can link or unlink their premium Minecraft account from their settings — data is preserved when switching to premium, and each UUID can only be linked to one account.
- **Authentication Status:** Each player has a **PREMIUM / CRACKED / AUTO** status with source tracking (PANEL, SERVER, FASTLOGIN, USER, MICROSOFT), stored in the plugin's own database. Users can pick their own status from their settings via a plain-language dropdown.
- **Live Server Sync:** The plugin intercepts FastLogin's pre-login event to inject Pano's authoritative status before the auth mode is decided, pushes FastLogin's auto-detected premium logins back to Pano, and applies instant updates when an admin changes a status in the panel.
- **Localized:** Available in English, Turkish, and Russian.

## Panel Settings

Settings live on the plugin's own detail page in the **Pano Admin Panel** (Addons → Premium Login), under **Microsoft Login Settings**:

- An **enable** toggle, **Client ID**, **Client Secret**, and **Redirect URI**, plus a **Debug Logging** toggle for step-by-step OAuth troubleshooting.
- The **Client Secret** is stored masked — revealing it requires the admin to re-enter their own password.
- An embedded **step-by-step Azure Portal setup guide**, and a note that Microsoft requires app verification (aka.ms/AppRegInfo) before all users can use the feature.
- **Player Management:** an *Authentication Status* row in the player-edit modal and an *Authentication Status* card on the player detail page — showing account type, last-update source, and premium-link state, with an unlink button (with undo).

## What Visitors See

- Microsoft login/register buttons (with an "or" divider) on the login and register pages.
- An *Authentication Status* row in their account settings (a type dropdown plus link/unlink premium account).
- An *Authentication Status* card in their public profile sidebar, a success toast after signing in, and a `/set-username` page reached from the username-change email.

## Required Permissions

- **Manage Premium Status** (`MANAGE_PREMIUM_STATUS`) — view and change a player's authentication status from the player pages.
- **Manage Premium Login Settings** (`MANAGE_PREMIUM_LOGIN_SETTINGS`) — configure the Microsoft OAuth settings.

Both are grantable to panel roles, and the panel controls are gated on them.

## Prerequisites

- **A premium license.** Premium Login is a paid plugin: it verifies a panomc.com license at startup and will not start without one.
- **A Microsoft Azure app.** Register an application in the Azure Portal (personal Microsoft accounts type), supply the **Client ID** and **Client Secret**, and set the redirect URI to `https://yoursite.com/api/premium-login/microsoft/callback`. Submit the app to Microsoft for verification to open the feature to the general public.
- **Server-side sync** requires the **Pano MC plugin** (connected to your website) and **FastLogin** installed on your Spigot/Bungee/Velocity server (FastLogin implies ProtocolLib on Spigot).
- **A configured mail system** for the username-conflict emails, and a completed site setup before the plugin initializes.

::: tip Premium plugin
Premium Login requires an active panomc.com license. You can obtain it from the Pano resource store; free and development builds no-op the license check.
:::

## Source Code

Development happens in the open — you can follow it on GitHub:
- [Source Code](https://github.com/PanoMC/pano-plugin-premium-login)

## Setup

1. Ensure your Pano site has an active **premium license** and enable the plugin in the **Pano Admin Panel**.
2. Open the **Premium Login** plugin's detail page and expand **Microsoft Login Settings**.
3. Follow the embedded Azure guide to create an app, then paste in your **Client ID**, **Client Secret**, and **Redirect URI** and toggle Microsoft login on.
4. Install the **Pano MC plugin** and **FastLogin** on your Minecraft server so authentication status syncs live between the site and the game.
