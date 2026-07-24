# Avatar Plugin

The **Avatar** plugin lets every registered user choose where their profile picture comes from — their **Minecraft skin head**, their **Gravatar**, or a **custom uploaded image**. The chosen avatar then replaces the default profile picture site-wide, wherever a user's picture is shown. Admins decide which sources are allowed, set upload size and type limits, and can change any player's avatar directly from the panel.

## Features

- **Three avatar sources:**
  - **Minotar** — the player's Minecraft skin face, loaded from `minotar.net`. This is the default for users who have never picked a source.
  - **Gravatar** — the globally recognized avatar tied to the user's account email (with an `identicon` fallback).
  - **Custom Upload** — a user-supplied image.
- **Optimized uploads:** JPG, PNG and GIF are accepted (configurable). Images are compressed and downscaled to a maximum of 256px, while GIFs are stored as-is to keep their animation. Old files are cleaned up automatically when a user replaces their image or switches sources.
- **Admin override:** change or remove any player's avatar from the player edit modal in the panel.
- **Activity logging:** setting and player-avatar changes are recorded in the panel activity log.
- **Localized:** ships with English, Turkish and Russian translations.
- **Clean uninstall:** removes its database table and all uploaded files when the plugin is removed.

::: tip
Minotar avatars only make sense when your website usernames match real Minecraft accounts. Minotar and Gravatar images are loaded by each visitor's browser directly from `minotar.net` / `gravatar.com`, so those services need to be reachable from your visitors.
:::

## For your users

Once the plugin is enabled, logged-in users find a **Profile Avatar Settings** section at the top of their account **Settings** page. There they can pick an allowed source, see a live preview, and — for custom uploads — upload, preview or remove their image. Only the sources you allow are shown.

## Admin settings

- **Plugin settings:** open **Panel → Plugins → Avatar**. The **Avatar Settings** card lets you set the **Max Upload Size** (in MB), the **Allowed Image Types** (PNG / JPEG / GIF), and the **Allowed Avatar Sources** (Minotar / Gravatar / Custom Upload).
- **Editing a player's avatar:** open a player's detail page and use the **Profile Avatar** row in the edit modal to change or remove their picture.

## Required Permissions

- **Manage Avatar Settings** — configure the plugin's allowed sources, file types and size limits.
- **Manage Player Avatar** — change player profile avatars from the player detail page.

::: warning
The **Custom URL Sources** builder in the settings card is not yet functional. You can configure entries, but nothing consumes them yet — they will not appear as a selectable avatar source. Leave this section empty for now.
:::

## Open Source

This plugin is open source and licensed under the **MIT License**. You can access the source code on GitHub:
- [Source Code](https://github.com/panomc/pano-plugin-avatar)

## Setup

1. Enable the plugin in the **Pano Admin Panel**.
2. Navigate to **Panel → Plugins → Avatar**.
3. Configure your **Avatar Settings** (allowed sources, image types and max upload size).
4. Users can now choose their avatar from their account **Settings** page!
