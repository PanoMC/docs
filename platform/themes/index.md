# Themes

> ⚠️ Managing themes in Pano requires **View Management permission**.  
> If you are not logged in as an **Admin**, you must have **View access** to open the themes page and perform
> theme-related actions.

Themes define the **look and feel** of your Pano website.  
They control layouts, colors, components, and user experience — allowing every Pano installation to look unique while
staying compatible with the backend.

Themes operate independently of backend addons, meaning you can switch themes **without restarting your Pano or
affecting backend addons.**

## 🎨 Creating Your Own Theme

If you want to **build your own theme**, Pano makes it simple and powerful.  
Themes are developed using **[SvelteKit](https://kit.svelte.dev/)** — the same modern web framework that powers Pano’s
own interfaces.

Each theme is a separate **SvelteKit application**, packaged as a `.zip` bundle after being built.  
Unlike traditional themes, there are no `assets/` or `build/` folders to manage manually — the bundling process handles
that for you.

A theme can:

- Define custom layouts, routes, or widgets.
- Add its own style system and variable configuration.
- Communicate with Pano’s backend via REST APIs.
- Optionally depend on specific addons, or provide custom APIs for others.

> Themes can access backend data **only through Pano’s API layer**, but still run as real UI applications.

📘 Learn how to build and package your theme here:  
👉 [Theme Development Guide →](../../theme/getting-started)

## 💡 Why Themes Matter

Themes are what shape the **user experience** of your server’s website.  
They define how visitors interact with your content and how your community sees your brand.

Themes let you:

- Customize your site’s **identity and design**.
- Adjust color schemes, layout, and structure.
- Create different styles for different audiences.
- Integrate with addons for extended functionality.
- Publish and share your theme with others in the **Pano Marketplace**.

> Some addons may require specific themes, and some themes may require certain addons to function properly.  
> Additionally, some themes extend or override Pano’s default API behavior to provide advanced features.

## ⚙️ How Themes Work (Behind the Scenes)

Pano loads themes as independent **UI applications** from its `themes/` directory.  
Each theme has a manifest file called **`manifest.json`** that contains its metadata (id, version, author,
compatibility, etc.).  
This file is automatically created and managed by Pano — **do not edit it manually.**

When Pano starts:

1. It scans the `themes/` folder for valid themes.
2. Invalid or broken themes are **skipped automatically**.
3. Only valid themes appear inside **Panel → View → Themes**.
4. Pano reloads all available themes at startup.
5. **Newly installed themes are automatically detected and displayed** — no manual reload required.

### Default Interfaces in Pano

By default, Pano ships with **three built-in UI applications**:

- `panel-ui` → The admin panel.
- `setup-ui` → The setup interface (shown during initial configuration).
- `vanilla-theme` → The default public website theme.

> Only `vanilla-theme` is an actual **theme**.  
> The other two (`panel-ui`, `setup-ui`) are **UI applications**, not themes, and will not appear under the Themes list.

If Pano has not been set up yet, it automatically shows the **Setup UI** until installation is complete.

To access the **Admin Panel**, visit `/panel` in your browser —  
if you are logged in and have the required permissions, you’ll be redirected to the panel interface.

## 📦 Installing Themes

You can install themes in **two ways**:

### 1. From Your Local Computer

1. Open **Panel → View → Themes**.
2. Click **Install Theme**.
3. Drag & drop your theme `.zip` file, or select it manually.
4. The new theme will be automatically loaded and visible in the list — no reload required.

> ⚠️ **Unverified Theme Warning:**  
> Installing themes from unknown or unofficial sources is at your own risk.  
> Unverified themes may contain unsafe or incompatible code.  
> Only install themes you trust or those published on the **Pano Store**.

### 2. From the Pano Store

1. In the **Install Theme** modal, click **Browse Store**.
2. Choose a theme — free or premium.
3. Click **Install** and let Pano handle everything automatically.
4. The theme will appear automatically after installation.

> 🛍️ The Marketplace requires a connected [Pano Account](./advanced/connect-pano-account.md).

## 🧩 Activating and Managing Themes

Only **one theme can be active** at a time.  
An active theme can be **stopped** or **restarted** manually if needed.  
If the currently active theme is stopped, the public website will become **unreachable** until restarted.  
In that case, restarting Pano is recommended.

To manage your themes:

1. Go to **Panel → View → Themes**.
2. Select a theme.
3. Click **Start** or **Stop** to activate or deactivate it.

> Stopping the active theme disables the website temporarily.  
> Always ensure a valid theme is active before stopping another.

## ⚙️ Customizing Themes

Each theme has its own configuration options, and these may differ from one theme to another.  
In general, you can customize:

- Colors and color variables
- Header and footer layout
- Fonts and typography
- Background images and gradients
- Layout width, spacing, and container size
- Site logo, favicon, or branding

You can access and modify active theme settings under:
**Panel → View → Theme Settings**

Changes apply instantly — no restart required.

## ⚠️ Removing a Theme

Themes can only be **removed** from their **details page** — not from the general theme list.

When deleting:

- If the theme is currently active, Pano will **switch back to `vanilla-theme`** automatically.
- Built-in UI applications (`panel-ui`, `setup-ui`, `vanilla-theme`) **cannot** be deleted, modified, or updated
  individually.
- Pano automatically reinstalls any missing built-in UI applications during startup if they are found to be corrupted or
  removed.

To delete a custom theme:

1. Go to **Panel → View → Themes → [Theme Details]**.
2. Click **Delete**.
3. Confirm your action.

## 🧱 Directory Structure

Example Pano directory layout with themes:

```
/pano/
├── Pano-1.0.0.jar
├── config.conf
├── panel-ui/
├── setup-ui/
├── themes/
│    ├── vanilla-theme/
│    ├── dark-matter-theme/
└── file-uploads/
```

**Important:**

- Do **not modify** or replace `panel-ui`, `setup-ui`, or `vanilla-theme`.
- They are managed internally by Pano and will be **reinstalled automatically** at startup if missing or corrupted.
- Only manage user-installed `theme folders` manually.

## 🧠 Summary

| Action              | Location                                               | Description                        |
|---------------------|--------------------------------------------------------|------------------------------------|
| **Install (local)** | `Panel → View → Themes → Install Theme`                | Drag & drop or upload              |
| **Install (store)** | `Panel → View → Themes → Install Theme → Browse Store` | Download directly from marketplace |
| **Activate / Stop** | `Panel → View → Themes → Start/Stop`                   | Enable or disable the theme        |
| **Customize**       | `Panel → View → Theme Settings`                        | Change colors, layout, fonts       |
| **Delete**          | `Panel → View → Themes → Theme Details → Delete`       | Remove a custom theme safely       |

## 🧩 Advanced Notes

- Only **valid themes** appear in the list; broken or incomplete themes are ignored.
- Each theme is packaged as a **SvelteKit build bundle (.zip)**.
- Each theme has a **`manifest.json`**, automatically generated — **do not edit manually.**
- Some addons depend on certain themes, and vice versa.
- Some themes expose or override default APIs for advanced functionality.
- Built-in UI applications (`panel-ui`, `setup-ui`, `vanilla-theme`) are **protected** and cannot be changed.
- If they are corrupted or missing, Pano will automatically reinstall them during startup.
- Themes are **not sandboxed**, but their access to the backend is limited to **HTTP API endpoints**.

> 🌈 Themes define your Pano’s personality — your world, your design, your identity.
