# Link Redirects Plugin

The **Link Redirects** plugin lets you create short vanity URLs on your own website — for example `yoursite.com/discord` — that forward visitors to any external address such as `https://discord.gg/pano`. Redirects can be instant, or show a branded "Redirecting..." countdown page with a choice of designs (including a fully custom HTML page). Each redirect can optionally appear as a link in your site's navigation menu and be restricted to logged-in users or a specific permission node. It is an official Pano plugin, free to use, and MIT-licensed.

## Features

- **Unlimited redirects:** Map any site path (must start with `/` and be unique) to a target URL.
- **Instant redirect:** With no delay or intermediate page configured, visitors are forwarded server-side (HTTP 302) — they never see a blank page.
- **Intermediate "Redirecting" page:** Optionally show a countdown page with a configurable delay (in seconds) and one of four designs:
  - **Default:** White card with a spinner, the target URL, and a countdown.
  - **Minimal:** A spinner with a single line — "Redirecting to {hostname} in {n}s".
  - **Modern:** A dark card with an animated progress bar.
  - **Custom:** Your own page content, authored in the panel's rich-text editor with HTML source and preview modes. The countdown overlay stays on top.
- **Show in navigation:** Add the redirect to your theme's nav menu using its title as the link text, with a per-link **Open in new tab** option.
- **Access control:** Per redirect, **Require login** (anonymous visitors are bounced to `/login?redirect=<path>`) and **Require permission** with a free-form permission node (e.g. `pano.custom.perm`). Unauthorized visitors get a denied/404 response.
- **Panel conveniences:** A paginated table (10 per page) showing ID, title, address, target, and delay; row actions to view the path and target, **Copy Link**, **Edit**, and **Delete** (with a confirmation modal); plus success toasts.
- **Audit trail:** Creating, updating, and deleting a redirect is written to Pano's panel activity log.
- **Localization:** Available in English, Turkish, and Russian.

## Managing Redirects

A **Link Redirect** item (chain-link icon) appears in the panel sidebar right after **Posts**, opening the Link Redirects page. Everything is managed from a single **Create / Edit** modal — there is no separate settings page and no site-wide options; every setting is per-redirect. The delay and design fields are enabled only when **Show intermediate page** is on, the custom-content editor appears only when the design is set to **Custom**, the permission-node field appears only when **Require permission** is on, and **Open in new tab** is enabled only when **Show in navigation** is on.

::: tip Free and official
Link Redirects is developed and maintained by the Pano team, requires no premium license, and has no external dependencies — nothing beyond a working Pano installation is needed.
:::

## Required Permission

To manage redirects in the panel, users need the **Edit Redirects** (`MANAGE_REDIRECTS`) permission — "Can create, delete and edit a redirect which will be used in theme." It gates both the sidebar entry / panel page and all management endpoints. Note that this is separate from the per-redirect permission node a visitor may be required to hold.

## Open Source

This plugin is open source and licensed under the **MIT** license. You can view the source code on GitHub:
- [Source Code](https://github.com/PanoMC/pano-plugin-link-redirects)

## Setup

1. Enable the plugin in the **Pano Admin Panel**.
2. Navigate to **Panel → Link Redirect**.
3. Click **Create**, enter a title and a path (starting with `/`) plus the target URL, and save.
4. Optionally add a countdown page, show the link in your navigation, or restrict access.
