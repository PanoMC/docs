# Cookies Plugin

The **Cookies** plugin adds a customizable cookie-consent notice to your Pano site. You configure the banner's text, style, placement, and colors from the admin panel, and visitors then see a consent banner on your theme until they click the accept button — after which the choice is remembered in that browser and the banner never reappears. It is an informational notice ("we use cookies… Got it!"), not a full consent-management tool.

::: warning Not a GDPR consent manager
This is a simple, informational consent notice. There is **no reject option, no cookie categories, and no server-side record of consent** — acceptance is stored only in the visitor's browser (localStorage key `pano-cookies-accepted`). Do not rely on it as GDPR compliance tooling.
:::

## Features
- **Enable / Disable:** A single toggle for the whole banner.
- **Editable Text:** Customize the message, the accept-button label, and an optional **Learn more** link (text + URL) pointing to your cookie or privacy policy.
- **Three Designs:** **Bar** (full-width strip), **Floating** (a card up to 400px wide), or **Modal** (a centered dialog over a dimmed page).
- **Position Options:** The dropdown offers **Top**, **Bottom**, and four corners (Top/Bottom Left/Right), but not every design honors them. **Bar** positions correctly for **Top** and **Bottom**. **Floating** positions only for plain **Top** / **Bottom**; its four corner options are not wired to any CSS and have no effect. **Modal** ignores the position setting entirely — it always renders as a centered dialog. (See Known Limitations.)
- **Colors:** Three pickers — primary (button, link, border), text, and background. Defaults: `#007bff`, `#ffffff`, `#343a40`.
- **Custom HTML Mode:** Replace the built-in layout entirely with your own HTML, edited in the panel's rich-text/HTML editor with a live preview. When you use this, remember to include your own accept mechanism in the markup.
- **Activity Log:** Configuration changes are recorded in the panel activity log.

## Where Are the Settings?
The plugin has no dedicated menu entry. Its settings appear as a **Cookies Settings** card on the plugin's own detail page.

1. Enable the plugin in the **Pano Admin Panel**.
2. Go to **Plugins/Addons → Cookies**.
3. Adjust the message, design, position, and colors on the **Cookies Settings** card.
4. Press **Save** — the button stays disabled until you change something, and a toast confirms the result.

::: tip Works out of the box
There are no prerequisites — no external service, database tables, or premium account. The plugin ships enabled with a sensible English default message, so the banner appears immediately after install until a visitor accepts it.
:::

## What Visitors See
A single consent banner is injected at the top of your theme on every page, styled per your chosen design, position, and colors. It shows your message, the optional policy link (which opens in a new tab), and the accept button. Clicking accept hides it permanently for that browser. Nothing is shown once accepted, or while the plugin is disabled.

## Known Limitations
::: warning
- The **Modal** design has a hardcoded heading in Turkish ("Çerez Politikası" / "Cookie Policy") that is not translated — English and Russian sites will show Turkish text there.
- The position dropdown is only partly wired up for **Floating** and **Modal**. For **Floating**, use plain **Top** or **Bottom** — the four corner options (Top/Bottom Left/Right) map to CSS classes that don't exist, so a corner-configured card falls back to rendering in-flow at the top of the page instead of pinned to a corner. For **Modal**, the position setting is inert: it always renders as a centered dialog over a dimmed page regardless of what you pick.
:::

## Required Permission
To view or save the settings, users need the **Manage Cookies** permission:
`pano.plugin.pano-plugin-cookies.manage.cookies`

## Localization
The plugin interface is fully translated in **English**, **Turkish**, and **Russian**.

## Open Source
This plugin is open source and licensed under the **MIT License**. You can access the source code on GitHub:
- [Source Code](https://github.com/PanoMC/pano-plugin-cookies)
