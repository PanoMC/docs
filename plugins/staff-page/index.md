# Staff Page Plugin

The **Staff Page** plugin lets you showcase your server's team on your website. You maintain a staff roster — names, roles, avatars, descriptions, and social links — from the panel, and visitors see it either as a dedicated **Staff** page (added automatically to your site navigation) or embedded as a **Support Team** section on your theme's support page. The goal is a clean, customizable way to put the people behind your community front and center.

## Features

- **Staff Roster:** Add each member with a name, role (shown as a badge), sort priority, avatar image, free-text description, and any number of social links.
- **Minotar Avatars:** Click **Use Minotar** to auto-fill an avatar from the member's Minecraft username. If no avatar URL is set, the theme falls back to the Minotar helm render automatically.
- **Smart Social Icons:** Discord, Twitter/X, Instagram, GitHub, YouTube, and Twitch links are auto-matched to their brand icons (with tooltips); anything else gets a generic link icon.
- **Three View Modes:** Display staff as a **List** (horizontal rows), **Card** (centered cards — the default), or **Grid** (photo tiles with a hover overlay).
- **Two Display Locations:** Show staff on a dedicated **Theme Page** at a URL you choose, or append them to your theme's **Support** page.
- **Activity Logging:** Every create, update, delete, and settings change is recorded in the panel activity log with the acting admin's username.
- **Localized:** Fully translated into English, Turkish, and Russian.

## Managing Your Staff

A **Staffs** link (users-cog icon) appears in the panel sidebar, right after **Players**. It opens the **Staff Management** page, where you can:

- See your total staff count.
- **Add Staff** through a modal, or **edit** / **delete** any member from the table.

Members are ordered by **priority** (lower numbers first), then alphabetically by name.

## Settings

Display settings live on the plugin's own **detail page**, under the **Settings** card — not on the management page:

- **Display Location:** Theme Page or Support Section.
- **Page URL:** The path for the dedicated page (defaults to `/staff`). Only editable in Theme Page mode.
- **View Mode:** List, Card, or Grid.

::: tip
When you use the **Support Section** location, staff are always shown in **Card** layout, regardless of the View Mode setting.
:::

::: tip
Changing the **Page URL** takes effect for visitors the next time the theme app loads, since the page and its nav item are registered at startup.
:::

## Required Permissions

- **`MANAGE_STAFF`** — add, edit, and delete staff members (also unlocks the sidebar link and management page).
- **`MANAGE_STAFF_SETTINGS`** — change the page URL, view mode, and display location.

## Open Source

This plugin is open source and licensed under **GPLv3**. You can access the source code on GitHub:
- [Source Code](https://github.com/panomc/pano-plugin-staff-page)

## Setup

1. Enable the plugin in the **Pano Admin Panel**.
2. Open **Panel → Staffs** and add your team members.
3. Open the plugin's **detail page → Settings** to pick a display location and view mode.
4. Visit your site to see your staff (defaults to `/staff` in Card mode)!
