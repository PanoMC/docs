# Media Page Plugin

The **Media Page** plugin lets you display and manage images, videos, and other media content in clean, organized galleries. Admins create any number of **media pages** (for example *Screenshots*, *Events*, or *Builds*), organize each one into categories, and upload images and videos. Every active page automatically becomes a public gallery at `/gallery/<slug>` on your theme — optionally linked in the navigation menu — where visitors browse a thumbnail grid and open media in a full-screen lightbox.

## Features

- **Unlimited Media Pages:** Each page has a title, a URL slug (auto-generated from the title as you type, with uniqueness enforced), a description, an `Active` / `Passive` status, and a **Show in Navigation** toggle.
- **Categories:** Organize each page into categories — add, edit, delete, drag-and-drop to reorder, toggle visibility per category, or move a category to another page.
- **Media Upload:** Drag-and-drop or pick multiple files at once (images and videos, up to **100 MB** per request). Add an optional title and description (defaults to the filename), edit them later, delete, and drag to reorder within a category.
- **Automatic Thumbnails:** Images get a 400px-wide thumbnail automatically; videos show their first frame with a play badge in the grid.
- **Fast, Safe Delivery:** Files are stored with unique names and served with a one-week immutable browser cache and path-traversal protection.
- **Activity Log:** Page creates/updates/deletes and media uploads/deletes are recorded in the panel activity log, along with the acting user.

## Managing Media

All management happens under the new **Media** item in the panel sidebar (added right after **View**) — there is no separate settings screen.

1. Enable the plugin in the **Pano Admin Panel**.
2. Go to **Panel → Media** to see your media pages (a paginated table of ID, Title, Slug, and Status).
3. Click **Create** to add a page, fill in its title and description, then **save it** — you must save the page before you can upload media.
4. Add **categories**, then open the upload modal to drag in your images and videos.
5. Set the page to **Active** (and enable **Show in Navigation** if you want a menu link) to publish it.

## What Visitors See

Each active page becomes a gallery at `/gallery/<slug>`, with the page title and description shown as a header. Every visible category appears as its own section with a responsive, hover-zoom thumbnail grid. Clicking a thumbnail opens a lightbox with previous/next arrows, keyboard navigation (arrow keys and `Escape`), autoplaying video with controls, and a title/description caption. Passive pages return a 404 and hidden categories are filtered out.

::: tip Free and official
Media Page is developed and maintained by the Pano team and licensed under **MIT**. Default builds are free — no panomc.com account or license key is required — and it has no external or plugin dependencies. Database tables are created automatically on first run.
:::

::: warning Uninstalling deletes your media
Uninstalling the plugin permanently removes its database tables and every uploaded file. Back up anything you want to keep before removing it.
:::

## Required Permission
To manage media pages, categories, and media items, users need the following permission:
`pano.plugin.pano-plugin-media-page.manage.media.page`

## Open Source
This plugin is open source and licensed under **MIT**. You can access the source code on GitHub:
- [Source Code](https://github.com/panomc/pano-plugin-media-page)
