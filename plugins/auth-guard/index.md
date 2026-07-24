# Pano Auth Guard Plugin

**Pano Auth Guard** is an official Pano plugin that hardens your site's login and registration stack with three layers of protection in one addon: **captcha** bot protection, **two-factor authentication (2FA)** for user accounts, and passwordless **magic login** via one-time email links. It hooks into Pano's core authentication events server-side, so protection applies to the core auth APIs and even to plugin-driven flows such as social-login register and account linking. The Pano team describes it as "an all-in-one authentication plugin providing robust bot protection and seamless multi-layered login options."

::: tip Premium plugin
Pano Auth Guard is a paid plugin. Official builds verify a panomc.com license at startup and will not start without a valid one — Pano core keeps running and the panel shows the failure, with a "refresh license" option. You can obtain a license from the Pano resource store.
:::

## Features

### Captcha Bot Protection
- **Providers:** Choose **None**, **Google reCAPTCHA** (Enterprise by default, with a **Legacy Mode** toggle for classic secret keys), **hCaptcha**, or **Cloudflare Turnstile**.
- **Per-form toggles:** Enable the widget independently on the **login**, **register**, **password reset**, **email verification (account activation)**, **new-email confirmation**, and **set / renew password** forms — each on by default.
- **Server-side enforcement:** Every captcha is verified on the backend *before* the password is checked.
- **Fails open on purpose:** If keys are blank, a secret is invalid, or the provider's API is unreachable, the check is skipped (and logged as a warning/error) so a misconfiguration can never lock you out of your own site.

### Two-Factor Authentication (TOTP)
- **Standard TOTP:** 6-digit codes, 30-second step, SHA-1, with ±2-step clock-drift tolerance — compatible with Google Authenticator and similar apps.
- **Easy enrolment:** Users scan a **QR code** or type a manual key; the **issuer name** shown in the app is configurable (defaults to your site name).
- **Opt-in per user** once you enable 2FA site-wide. At login, users with 2FA get a code prompt *after* their password is accepted, and a short-lived internal token means they don't re-solve the captcha on the 2FA step.
- **Safe disable:** Turning off 2FA requires both the current 2FA code **and** the account password.

### Magic Login (passwordless)
- A **Sign in with Email Link** button on the login page emails a branded one-time link that logs the user straight in.
- Requests always report success (to prevent email enumeration), and each new request invalidates any previous link. Links are valid for **15 minutes**.

### Admin & Auditing
- **Player 2FA tooling:** View a player's 2FA status, remove/reset it, or set up and verify 2FA on their behalf from the panel.
- **Activity log:** Settings changes, a user enabling/disabling their own 2FA, and an admin removing a player's 2FA are all recorded.
- **Localized:** Complete translations for **English (en-US)**, **Turkish**, and **Russian**.

## Panel Settings

All configuration lives on the plugin's own detail page in the **Pano Admin Panel** (Addons → Pano Auth Guard), on an **Auth Guard Settings** card: the captcha **provider** dropdown, **site key**, **secret key** (write-only and masked — the API only reports whether a key is set), the **Legacy Mode** toggle, the **Google Cloud project ID**, the six per-form captcha toggles, the **2FA** enable switch and **issuer name**, and the **magic login** enable switch and link-expiration field — then **Save**. (A `debugLogging` option exists in the plugin's config file only and is not exposed in the panel.)

Player 2FA controls appear in two more places: a **2FA** status card in the player-detail sidebar and a row in the edit-player modal. Both show **Enabled / Not set up / Setup not finished**, let you **Remove** a player's 2FA or run an admin-driven setup (QR + code verify), and are disabled with an explanatory note when site-wide 2FA is off.

## What Visitors See

- The chosen **captcha widget** on the login, register, forgot/reset-password, account-activation, new-email-confirmation, and renew-password forms (the provider script is loaded on demand).
- A **6-digit 2FA code dialog** after they enter a correct password, if they have 2FA enabled.
- A **Sign in with Email Link** button plus a **"Check Your Email"** flow, and a verification page at `/auth-guard/magic-login` that consumes the emailed link.
- A **Two-Factor Authentication** setup card (QR code, manual key, verify, and a disable dialog) in their account settings.

## Required Permissions

- **Manage Auth Guard Settings** (`MANAGE_AUTH_GUARD_SETTINGS`) — configure captcha, 2FA, and magic login.
- **Manage players' 2FA** (`MANAGE_PLAYER_TWO_FACTOR`) — view, remove, and set up 2FA on behalf of players.

## Prerequisites

- **A premium license.** Official builds embed the panomc.com license key and require a valid license fetched from api.panomc.com to start.
- **A captcha account and keys** from your chosen provider. Google reCAPTCHA **Enterprise** additionally needs a **Google Cloud project ID** and API key (switch on **Legacy Mode** to use classic reCAPTCHA secret keys instead).
- **Configured outgoing email (SMTP)** in Pano — magic login sends its links by email.
- The plugin waits for Pano's **first-run setup** to finish before it initializes.

::: warning Magic-link expiration is fixed at 15 minutes
The panel's **Magic Link Expiration (minutes)** field is currently cosmetic — magic-login links always expire after **15 minutes** regardless of the value you enter, and the email's expiration sentence is not fed the configured value either.
:::

## Setup

1. Ensure your Pano site has an active **premium license**, then enable the plugin in the **Pano Admin Panel**.
2. Open **Addons → Pano Auth Guard** and expand the **Auth Guard Settings** card.
3. Pick a **captcha provider**, paste in your **site/secret keys** (plus a Google Cloud project ID for reCAPTCHA Enterprise), and choose which forms to protect.
4. Optionally enable **2FA** (set an issuer name) and **magic login** — make sure your site's **SMTP email** is configured first.
