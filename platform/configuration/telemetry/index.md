# Usage Data (Telemetry)

Once a day, a running Pano instance sends a short report about itself to **panomc.com**. We call this **usage data**.
It tells us which Pano versions, themes and plugins are actually in use out there, so we can spend our time on the
things people run — and stop breaking the things they depend on.

This page lists **exactly** what that report contains and how to switch it off. Nothing here is hidden: the same
information is written down in the [Privacy Policy](https://panomc.com/privacy-policy).

> Usage data is **not anonymous**. It includes your website URL, your server's IP address and the country derived from
> it. If that is not acceptable for your installation, turn it off — see [Turning it off](#turning-it-off) below.

## Why it is collected

- **Understanding usage** — how many installations are active, and how they are configured.
- **Prioritising development** — the versions, themes and plugins that are actually in use get attention first.
- **Compatibility and security decisions** — knowing which Java versions and operating systems are still in the field
  tells us when it is safe to drop support for one, and who needs to be warned about a vulnerable release.
- **Aggregate public statistics** — figures such as the number of active Pano installations.

## What is sent

Each daily report contains:

- **Pano version, stage and release channel** in use.
- **Java version** and the **operating system** the instance runs on.
- **CPU and memory** available to the installation.
- The **website URL** and its **domain**.
- The **server's IP address** and the **country** derived from it.
- The **active theme** and the **installed plugins**, together with their versions.
- **Aggregate counts** — registered users, posts, open tickets, connected Minecraft servers and online players.
- Whether a **panomc.com account** is connected to the installation.
- The **install date** and a **randomly generated install identifier**.

It **never** contains user accounts, e-mail addresses, passwords, site content, or any credentials — no database rows
leave your server. The counts above are numbers, not the records behind them.

Raw reports are kept for **13 months**. Aggregated statistics, which cannot be traced back to a single installation,
are kept indefinitely.

## When it is sent

- **Once per day**, for as long as the instance is running.
- The first report of a session goes out **5 minutes after Pano starts**, so a quick restart never produces a report.
- **Never** from development or demo builds — those are excluded outright, whatever the setting says.

## Turning it off

Usage data is opt-out, and the site owner can turn it off in three places. All three set the same value.

### 1. During setup

The installation wizard shows a **usage data** checkbox. Clear it and no report is ever sent from this installation.

### 2. From the panel

Go to **Panel → Settings → Platform** and switch the **usage data** toggle off. This is the easiest route on an
installation that is already running.

### 3. In the configuration file

Add — or edit — the `telemetry` block in `config.conf`:

```jsonc
telemetry {
    enabled = false
}
```

`config.conf` is **hot-reloaded**: Pano picks the change up on its own, so there is no need to restart the instance
after editing the file.

## Privacy

The section **Usage Data From Self-Hosted Pano Installations** of the
[Pano Privacy Policy](https://panomc.com/privacy-policy) describes this data, the purposes it is used for, and how long
it is kept. It is processed by Pano itself, on servers located in the European Union, and is not sold or shared with
third parties.
