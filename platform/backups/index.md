# Backups

> Find them on the **Backups** page of your panel. Pano Backup needs a connected Pano account
> (**Panel → Settings → Platform**, or the account step of the setup wizard).

A backup holds everything that makes your Pano yours: the database, the settings, plugins, themes and
uploaded files. Pano keeps backups in two places: on **your own server**, and in **Pano Backup**, the
cloud storage that comes with your Pano account.

## Pano Backup {#pano-backup}

Pano Backup stores your backups off your server, so a dead disk or a lost server does not take them along.

- **Free for everyone.** Every account has **1 GB** of free storage. A bigger storage plan can be chosen on
  the Pano website. The storage is shared by all the Panos connected to the account.
- **Daily from day one.** In the setup wizard, the account step offers **Back up daily with free Pano
  Backup**. Tick it and Pano backs up every day from the day it is installed. Already installed? Open
  **Backup settings** on the Backups page and set **Pano Backup schedule** to **Daily** (or Weekly) and pick the hour.
- **No limit on count or age.** Backups are kept until you delete them or the storage is full. Pano never
  removes old ones by itself.
- **Back up now.** The **Back up to Pano Backup** button starts one at any time.

### Backup type {#backup-type}

In **Backup settings → Backup type** you choose how Pano Backup works:

| Type | What it does |
| --- | --- |
| **Snapshot** (default) | Sends only what changed since the last one, so daily backups take very little space. Each snapshot can still be restored on its own. |
| **Full archive** | Sends the whole site every time. It takes more space and can be protected with a password of your own (**Encryption passphrase**). If you lose that password, those archives can never be opened. |

Snapshots are not protected with a password of your own.

### When the storage is full {#storage-full}

You are warned **by e-mail and by notification** when the storage is nearly full and again when it is
full. Once it is full, new backups are refused and a refused backup leaves nothing behind. Delete
backups you no longer need, or choose a bigger plan.

## Restoring {#restoring}

On the Backups page, press **Restore** next to a backup. Pano then:

1. asks for your **current password**,
2. goes into [maintenance mode](../maintenance/),
3. takes a **safety backup** of the current state first,
4. replaces the database, settings, plugins, themes and uploaded files with the backup,
5. restarts. If anything fails, the safety backup is put back.

Any finished snapshot of your account can be restored this way, also one made by another of your Panos.
Restoring replaces what is on the Pano now, so use it with care.

## Deleting and downloading {#download}

- **Delete** removes a backup from Pano Backup for good. Other backups stay as they are.
- A copy can be **downloaded** from the panel (the row's menu) or from the **Pano Backup** page of your account on the Pano website. That page shows
  one list of all your backups, with the Pano each one belongs to, and lets you download or delete them.
  A snapshot is packed for you and comes as a single **`.panoarc`** file.
- A `.panoarc` file is the same single-file backup a full archive uses. Keep it anywhere you like, and
  restore it with **Restore from file** on the Backups page, or with **Restore from a backup file** in
  the setup wizard of a fresh Pano.

If your browser cannot save a large backup, restore it from the panel of the Pano instead.

## Backups on your own server {#local}

**Create backup** writes a backup to your own server. You can schedule these too (**Local backup schedule**);
only the newest scheduled ones are kept and backups you make by hand are never deleted automatically.
Local backups can be encrypted with a password of your own. The archive format is described in
[Operating Instances](../hosting/operations/#backups).
