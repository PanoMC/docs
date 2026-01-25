# Pages Plugin

The **Pages** plugin allows you to create custom static pages for your website. Whether you need a simple "Rules" page or a complex landing page, this plugin provides the flexibility and tools required.

## 📄 Page Configuration

When creating or editing a page, you have access to several configuration options:

### 🔗 URL & Navigation
- **Custom URL Path:** Define the exact path for your page (e.g., `/rules` or `/about-us`).
- **Link Name:** Set a custom display name for navigation menus.
- **Register to Theme Nav:** Automatically add the page to your theme's main navigation bar.
- **Target:** Choose whether links to this page open in the same tab (`_self`) or a new tab (`_blank`).

> [!TIP]
> **Reordering:** If you are using an official Pano theme, you can reorder these dynamic links via the **Theme Settings** page using drag-and-drop.

### 🔒 Access & Permissions
- **Login Required:** Restrict the page visibility strictly to logged-in users.
- **Permission Node:** Assign a specific permission node (e.g., `server.admin`) required to view the page.

### 🎨 Layout & Design
- **Reset Layout:** A powerful feature that removes the default theme headers and footers for this specific page. Ideal for creating custom landing pages or distraction-free content.
- **Show Breadcrumb:** Toggle the visibility of the breadcrumb navigation at the top of the page.
- **Rich Text Editor:** Use the built-in Editor to create content with HTML, Markdown, and custom components.

## 🛡️ Required Permission
To create and manage pages, users must have the following permission:
`pano.plugin.pano-plugin-pages.manage.pages`

## 🔧 Setup
1. Enable the plugin in the **Pano Admin Panel**.
2. Navigate to **Panel → Pages**.
3. Click **Create New Page** and start building your custom content!
