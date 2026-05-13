# Addons/Plugins

> ⚠️ Managing addons in Pano requires **Addon Management permission**.  
> If you are not logged in as an **Admin**, you must have **Addon Management access** to open the addons page and perform
> addon-related actions.

Addons are the heart of **Pano’s extensibility**.  
They allow you to **expand, customize, and enhance** both your Minecraft server management and your website features —
without modifying the Pano core itself.

In Pano’s ecosystem:

- The **backend** refers to them as **plugins** (PF4J-based modules).
- The **frontend / user interface** refers to them as **addons** (installable extensions).

Regardless of the name, they represent the same modular system that makes Pano powerful, flexible, and community-driven.

## Creating Your Own Addon

If you’re a developer and want to **build your own addon**, Pano provides a powerful developer-friendly API and lifecycle system based on **PF4J**.

Addons can:
- Extend Pano’s backend with new features or APIs.
- Add custom UI components to themes and panel in the website.
- Integrate with Minecraft server data, player info, or game events.

Each addon is packaged as a **JAR file** with a descriptor that defines its metadata and dependencies.  
You can distribute your addons publicly via the **Pano Store** or privately on your own servers.

 Learn how to create, build, and publish addons here:
 [Addon Development Guide →](../../addon/getting-started)


## Why Addons Matter

Pano is designed to be a **platform**, not just an application.  
That means every feature — from login integrations to analytics dashboards — can be built as an **addon**.

Addons are important because they:

- Let you **add new functionality** without touching the core codebase.
- Allow the community to **share or sell** custom features.
- Keep your system modular and easy to maintain.
- Enable automatic updates and compatibility checks through the **Pano Marketplace**.

With addons, your Pano installation evolves alongside your server’s needs — from simple website extensions to deep
in-game integrations.

## How Addons Work (Under-The-Hood)

Pano’s addon system is powered by **[PF4J](https://pf4j.org)** — a well-known Java plugin framework.  
Each addon is a **self-contained JAR file** that includes its own metadata, dependencies, and lifecycle handlers.

When Pano starts:

1. It scans the **plugins directory** (or the path defined with `-Dpf4j.pluginsDir`).
2. It loads and validates every detected addon JAR.
3. Dependencies between addons are resolved automatically (based on declared `plugin-id` and `dependencies`).
4. Addons are **enabled** or **disabled** based on PF4J’s configuration and Pano’s internal addon manager.

By default, if you don’t specify a custom path:

```bash
java -jar Pano-<version>.jar
```

Pano will automatically create and use a `plugins/` directory in the same folder as your JAR file.

You can override this directory with:

```bash
java -Dpf4j.pluginsDir=/path/to/custom/plugins -jar Pano-<version>.jar
```

## Installing Addons

There are **two ways** to install addons:

### 1. From Your Local Computer

1. Open the **Admin Panel → Addons** page.
2. Click **Install Addon** — a modal window will appear.
3. Either **drag & drop** your addon JAR file, or click **Select File** to upload manually.
4. Wait for installation to complete — your new addon will appear in the list.

### 2. From the Pano Store

1. In the same **Install Addon** modal, click **Browse Store**.
2. Find an addon you’d like to use — free or paid.
3. Click **Install**.
4. Once installation finishes, it will automatically be available in your addons list.

You can explore new addons, purchase premium ones, or update existing ones — all directly from the **Pano Store**.

> Marketplace requires a connected [Pano Account](./advanced/connect-pano-account.md).
>
> ⚠️ Any not verified by Pano addon might be unsafe, use at your own risk!

## Enabling or Disabling Addons

There are two methods to enable or disable addons:

### 1. Using PF4J (File-based)

Inside your `plugins/` folder, PF4J stores metadata files that define an addon’s status.  
You can manually disable an addon by editing or creating a `disabled.txt` file inside its folder —  
but this method is intended for advanced users only.

### 2. Using the Admin Panel (Recommended)

Go to **Panel → Addons** and simply toggle the addon’s switch to **Enable** or **Disable**.  
When disabled:

- The addon will stop and no longer load or run.
- Any dependent addons will also be **disabled automatically**.

When re-enabled:

- All compatible dependents will reactivate if possible.

> If an error occurred during enabling an addon, it will provide you some error logs. Check out error logs in Pano
> console for more details and report it to necessary developer.

## ⚠️ Downgrading Addons

While technically possible, **downgrading** an addon (installing an older version over a newer one) is
**not recommended**.

Downgrades may cause:

- Compatibility issues
- Broken dependencies
- Data corruption or unstable system behavior

If you must downgrade, ensure you have:

1. A **full backup** of your database and configuration.
2. Checked compatibility with the older version’s documentation.

> Proceed only if you are absolutely sure — otherwise, reinstalling Pano might be required.
>
> We kindly ask our addon developers to respect this decision, but bear in mind it may not work always!

## Deleting Addons

When deleting an addon:

- Any addons **depending on it** will also be **removed automatically**.
- This ensures the system remains stable and no orphaned dependencies exist.

To delete:

1. Go to **Panel → Addons**.
2. Click on the addon to go to addon detail page and click on **Delete** button.
3. Confirm the action — dependent addons will be listed before removal.

> Although, it's expected an addon to clean itself before deletion. Keep in mind, always there may be leakage!

## Addon Directory Overview

Example file structure for Pano and addons:

```
/pano/
├── Pano-1.0.0.jar
├── config.conf
├── plugins/
│    ├── disabled.txt (optional)
│    ├── pano-announcements-plugin/
│    │     └── plugin.conf
│    ├── pano-auth-integrations-plugin/
│    │     └── plugin.conf
│    ├── pano-announcements-plugin.jar
│    ├── pano-auth-integrations-plugin.jar
│    └── pano-feedback-plugin.jar
├── themes/
└── file-uploads/
```

## Summary

| Action                      | Location                                        | Recommended Method                   |
|-----------------------------|-------------------------------------------------|--------------------------------------|
| **Install Addon (local)**   | `Panel → Addons → Install Addon`                | Drag & drop or file picker           |
| **Install Addon (store)**   | `Panel → Addons → Install Addon → Browse Store` | Click install                        |
| **Enable / Disable**        | `Panel → Addons`                                | Toggle button                        |
| **Delete Addon**            | `Panel → Addons`                                | Delete with confirmation             |
| **Change Plugin Directory** | JVM option                                      | `-Dpf4j.pluginsDir=/path/to/plugins` |

## Advanced Notes

- Addons can expose both **backend logic** and **frontend components** through the platform’s APIs.
- Some addons register **custom routes, API endpoints, or UI widgets**.
- If you encounter conflicts or missing dependencies, check your **logs folder** for PF4J error messages.

> Addons are what make Pano *alive* — they turn your installation into a customizable, ever-expanding platform that
> grows with your community.
