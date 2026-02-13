# Bans Plugin

The **Bans** plugin adds a professional and transparent banned players list to your Pano website. It allows your community to see active bans, reasons, and durations in a clean, searchable interface.

## 📋 Features

### 1. Public Ban List
- **Searchable:** Users can search for specific players to see their ban status.
- **Pagination:** Handles large ban lists efficiently with configurable page sizes.
- **Detailed Info:** Display ban reasons, durations, expiry dates, and the administrator who issued the ban.

### 2. Customization
- **Display Options:** Toggle the visibility of avatars, ban reasons, banners, and more via the configuration.
- **Layouts:** Choose between different view layouts (e.g., Grid or List).
- **Avatar Sizes:** Customize the size of player avatars displayed in the list.

### 3. Integration
- **Minecraft Backend:** Syncs directly with your server's ban management system to ensure accurate information.
- **Real-time Updates:** Reflects the latest ban data automatically.

## 🛡️ Required Permission
To configure settings for the bans list, users must have the following permission:
`pano.plugin.pano-plugin-bans.manage.bans`

## 📖 Open Source
This plugin is open source and licensed under **GPLv3**. You can access the source code on GitHub:
- [Source Code](https://github.com/PanoMC/pano-plugin-bans)

## 🔧 Setup
1. Enable the plugin in the **Pano Admin Panel**.
2. Navigate to **Panel → Plugins → Bans → Settings** to configure the display settings.
3. The ban list will be available on your website at the `/bans` route (depending on your theme).
