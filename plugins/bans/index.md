# Bans Plugin

The **Bans** plugin adds a professional and transparent banned players list to your Pano website. It allows your community to see active bans, reasons, and durations in a clean, searchable interface.

## Features

### 1. Public Ban List
- **Searchable:** Users can search for specific players to see their ban status.
- **Pagination:** Handles large ban lists efficiently with configurable page sizes.
- **Detailed Info:** Display ban reasons, durations, expiry dates, and the administrator who issued the ban.

### 2. Customization
- **Display Options:** Toggle the visibility of avatars, ban reasons, who issued the ban, duration, expiry, the total count and the search box.
- **Layouts:** Choose between different view layouts (e.g., Grid or List).
- **Avatar Sizes:** Show player avatars at 16, 32 or 64 px.

### 3. Integration
- **Pano's Own Bans:** The list shows the users banned on your Pano website from the panel. It does not read the ban list of a Minecraft ban plugin.
- **History:** Optionally list past bans as well, not only the active ones.

## Required Permission
To configure settings for the bans list, users must have the following permission:
`pano.plugin.pano-plugin-bans.manage.bans`

## Open Source
This plugin is open source and licensed under **GPLv3**. You can access the source code on GitHub:
- [Source Code](https://github.com/PanoMC/pano-plugin-bans)

## Setup
1. Enable the plugin in the **Pano Admin Panel**.
2. Navigate to **Panel → Addons → Bans** to configure the display settings.
3. The ban list will be available on your website at the `/bans` route (depending on your theme).
