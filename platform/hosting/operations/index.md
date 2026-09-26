# Operating Instances

Day-to-day work once instances run: updates, backups, crashes and logs.

> [!WARNING]
> **Not released yet.** Container mode and the `.panoarc` archive format are not part of any Pano
> release yet. See [Hosting Pano Instances for Others](../).

## Updates and rollback {#updates-and-rollback}

An instance can change version two ways:

- **From your side**: stop the container, put the new jar and UIs in `/data` (sha256-checked), keep the
  previous ones for rollback, update `/data/.pano-jar`, start.
- **From Pano's own panel**: in [container mode](../../containers/runtime/#container-mode) Pano stages
  the new jar in `/data`, updates `.pano-jar` and exits with code **75**. The launcher starts the new
  jar and the container keeps running.

Treat exit code 75 as a planned restart, never as a crash.

To roll back, point `.pano-jar` at the previous jar and restart. Pano migrates its database forward
when a newer version starts, so restoring a backup is the safe way back across database changes.

## Backups {#backups}

Back up every instance on a schedule and store the backups **off the server**. Pano Host backs up
daily to S3 storage and keeps backups for 3, 7 or 30 days, depending on the package.

A backup of a Pano Instance is one **`.panoarc`** archive. The same format is used for backups,
exports, imports, transfers between servers and [Pano Backup](https://panomc.com/host). It is a zip
that holds:

| Entry | Contents |
| --- | --- |
| `db/dump.sql.gz` | logical dump of the instance's database (tables and data only) |
| `app/config.conf` | the instance's config |
| `app/plugins/`, `app/themes/` | installed plugins and themes |
| `app/file-uploads/`, `app/maintenance/` | uploads and maintenance-mode files |
| `manifest.json` | last entry: Pano version, database scheme versions and a hash per file |

The Pano jar, `libraries/`, the bundled UIs and `logs/` are **not** in the archive; the manifest
records the Pano version instead. Symlinks are skipped.

The archive can be wrapped in **AES-256-GCM** encryption, either with a random key per instance that
you keep, or with a key derived from the owner's passphrase (Argon2id). A lost passphrase cannot be
recovered.

### Restoring

1. Download the archive to a staging folder outside the instance's disk quota, decrypt it and check
   every hash in the manifest.
2. Take a safety backup of the current state.
3. Stop the instance. Make sure its Pano version is at least the archive's version: restoring onto an
   older Pano than the archive is refused.
4. Drop the instance database's **tables** and import the dump as the instance's own (internal) user.
5. Replace the `app/` files and rewrite the settings that belong to the target server: database
   address and credentials, ports and TLS, SMTP.
6. Start the instance. A newer Pano migrates the data on start.

## Crashes {#crashes}

Restart crashed instances automatically, but not forever. Pano Host stops an instance that crashes
**more than 3 times in 10 minutes**, notifies the owner and an admin, and suggests a bigger package if
it ran out of memory.

## Logs {#logs}

Use Docker's `local` log driver with size-capped rotation, so a noisy instance cannot fill the disk.
Pano Host keeps instance logs for 14 days on the server and shows them live, with a console for
commands, on the instance's manage page.

## Or let Pano Host do it {#pano-host}

[Pano Host](https://panomc.com/host) runs this whole setup for you: each Pano Instance gets its own
container, database, backups, `*.panomc.site` subdomain, free SSL and mail relay, managed from
panomc.com.
