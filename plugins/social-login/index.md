# Social Login Plugin

The **Social Login** plugin lets visitors sign in to your Pano-powered website with popular social platforms instead of a password. It adds OAuth 2.0 sign-in for **Google, Discord, Facebook, X (Twitter), GitHub, Twitch, and Instagram** — visitors can log in or register with one click, existing members can link and unlink these accounts to their profile, and admins configure each provider from the panel. Everything runs directly against each provider's official OAuth API, with no third-party middleman service. It is developed by the Pano team, free to use, and open source.

## Features

- **Seven Providers:** Google, Discord, Facebook, X (Twitter), GitHub, Twitch, and Instagram — each enabled independently.
- **Login & Register:** Branded "Continue with {provider}" buttons appear on both the login and register pages whenever at least one provider is enabled.
- **Smart Sign-in Flows:** Returning users with a linked account sign straight in; new visitors get a "Create Your Account" page to choose a username and password; and if their email already has an account, they are asked to log in once to link it.
- **Step-up Support:** A completion step handles extra login checks such as 2FA codes or captcha from other plugins (for example, auth-guard's two-factor prompt).
- **Account Linking:** A "Social Accounts" card in user settings lets members link or unlink providers, and their profile shows a read-only "Linked Social Accounts" card.
- **Admin Management:** View and unlink any player's connected accounts from their detail page in the panel.
- **Friendly Errors:** Clear, localized messages for cancelled sign-ins, expired links, already-linked accounts, and more. Available in English, Turkish, and Russian.

## Configuration

All settings live on the plugin's own detail page in the **Pano Admin Panel** (Plugins → Social Login) — there is no separate menu.

- **Per Provider:** an enable toggle, **Client ID**, **Client Secret**, and a copy button for the exact **Redirect URI** to register. Each provider also has a built-in, step-by-step setup guide with the required scopes and direct links to that provider's developer console and official docs.
- **Global Settings:** a **Redirect Base URL** (your public origin, e.g. `https://example.com`; leave empty to fall back to the platform website URL) and a **Debug Logging** toggle for step-by-step OAuth troubleshooting.
- **Secret Handling:** a saved Client Secret is masked (`••••`). Revealing it requires re-entering your own admin password, and leaving the field untouched keeps the stored value.

## Required Permissions

- **Manage Social Login Settings** — configure providers and their OAuth credentials.
- **Manage Social Links** — view and unlink players' connected accounts.

Panel controls are gated on these permissions.

## Prerequisites

Before enabling a provider you must create an OAuth application in that provider's developer console and register the exact redirect URI shown in the panel:

`{your-site}/api/social-login/{provider}/callback`

Your site must be reachable at a public URL. A few providers have extra requirements that the in-panel guide calls out:

- **Facebook:** the app must be switched to **Live** mode.
- **Instagram:** requires a Meta **Business** app with the Instagram API product; only added testers can sign in until App Review approval.
- **X (Twitter):** requires an OAuth 2.0 **Web App** (confidential client) setup.

::: tip Free and official
Social Login is developed and maintained by the Pano team. It requires no premium license and no panomc.com account, and it waits for Pano's initial setup wizard to finish before activating.
:::

## Open Source

This plugin is open source and developed in the open. You can follow development and view the source code on GitHub:
- [Source Code](https://github.com/PanoMC/pano-plugin-social-login)

## Setup
1. Enable the plugin in the **Pano Admin Panel**.
2. Open the **Social Login** plugin's detail page.
3. For each provider you want, create an OAuth app in its developer console, register the shown **Redirect URI**, then paste in the **Client ID** and **Client Secret** and toggle it on.
4. Set the **Redirect Base URL** if your public origin differs from your platform website URL, then save.
