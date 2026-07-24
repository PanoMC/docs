# Countdown Timer Plugin

The **Countdown Timer** plugin displays a countdown to a launch or event and automatically restores normal site access when the timer reaches zero. Use it as a full-site "coming soon" cover, a dedicated countdown page, or a compact widget on your homepage sidebar — with an optional celebration effect when time is up. The plugin is **disabled by default**, so nothing appears until you turn it on.

## Display Modes

Choose one of three ways to show the countdown:

- **Cover:** A full-page overlay that locks the site behind a "coming soon" screen. You can scope it to **All Pages** or **Home Page Only**, and optionally let visitors dismiss it with a **Skip** button.
- **Page:** A dedicated countdown page at a configurable URL (default `/countdown`), which can optionally be added to your site navigation bar with custom link text.
- **Sidebar:** A small countdown card shown in the theme's homepage sidebar.

## Features

- **Precise Timer:** Set an exact end date and time down to the second, with quick-add buttons for minutes, hours, and days. The counter ticks live every second.
- **Title & Message:** Freely editable heading and description text.
- **5 Visual Themes:** Dark, Light, Blur (glassmorphism), Minimal, and Gradient (with start/end color pickers), plus custom background and text colors.
- **5 Counter Styles:** Simple, Boxed, Circular, Minimal (no labels), and Separated Digits.
- **Background Image:** Upload a WEBP, JPEG, PNG, or GIF (up to 5MB). It replaces any previous upload and can be deleted from the panel.
- **Branding:** Toggle your website logo (6 sizes, from Small 64px to Massive 512px) and optionally show your Minecraft server IP.
- **Opening Effects:** Play a **Confetti**, **Fireworks**, or **Sparkle** effect (or **None**) when the countdown hits zero, just before the cover disappears.

## Where to Find the Settings

The Countdown Timer has no dedicated menu item. Its settings render as a single **Countdown Timer Settings** card on the plugin's own detail page:

1. Enable the plugin in the **Pano Admin Panel**.
2. Navigate to **Panel → Plugins → Countdown Timer**.
3. Configure the timer, display mode, appearance, and effects, then press **Save**.

Every settings and background change is recorded in the panel activity log.

::: tip Admins can always sign in
In **Cover** mode the login page (`/login`) is always exempt, so administrators can still sign in even while the rest of the site is locked. An optional admin link is shown at the bottom of the cover for quick access.
:::

::: warning "Actions When Timer Ends" is limited to Auto Hide
Today the only end-of-timer action is **Auto Hide** — when the timer expires, the plugin disables itself on the next config fetch and normal site access returns. Arbitrary custom actions are not available yet.
:::

## Required Permission

To view or change these settings — and to upload or delete the background image — a user needs the **MANAGE_COUNTDOWN_TIMER** permission ("Can change countdown timer settings").

## Localization

The plugin ships with full translations for **English (en-US)**, **Turkish (tr)**, and **Russian (ru)**, covering both the settings panel and the visitor-facing countdown.
