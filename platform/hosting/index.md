# Hosting Pano Instances for Others

If you run Pano for other people — friends, clients, a community network — each of them needs their
own Pano that they can manage, update and back up without touching anyone else's. These pages describe
the model [Pano Host](https://panomc.com/host) uses. You can follow the same model on your own
servers.

- This page: one instance = one container + one database, the release in `/data`, versions.
- [Isolation](isolation/): container hardening, networks, database users, outbound traffic, mail, quotas.
- [Operations](operations/): updates and rollback, backups, crashes, logs.

> [!WARNING]
> **Not released yet.** These pages rely on the [container images and container mode](../containers/),
> which are not part of any Pano release yet. Details may change before release.

## One container and one database per instance {#model}

Every Pano Instance gets:

| Piece | Per instance | Shared |
| --- | --- | --- |
| Container | one, from `ghcr.io/panomc/pano-runtime:jre<N>` | — |
| Data volume | its own folder, mounted at `/data` | — |
| Database | its own database and database users | the MySQL / MariaDB server |
| Network | its own Docker network | reverse proxy, database, mail relay are attached to it |
| Disk | its own quota | — |

Never run two instances in one container or let two instances share a database: an instance must be
movable, restorable and deletable on its own.

Pano Host names everything after an internal instance id, never after customer input. For example,
the container and network are `pw-<id>` and the database is `w_<id>`. Customer-chosen names only
appear in hostnames and in the UI.

## The release lives in `/data` {#release-in-data}

With the `pano-runtime` image, the image holds only Java and a launcher. The Pano release itself — the
jar and its UIs — lives in the instance's `/data` folder next to `config.conf`, plugins, themes and
uploads:

1. Download the jar and UIs of the chosen version from the
   [`PanoMC/Pano` GitHub release](https://github.com/PanoMC/Pano/releases) and check their sha256.
2. Put them in the instance's `/data` and write the jar's file name to `/data/.pano-jar`.
3. Start the container. Its launcher starts the jar named in `.pano-jar`.

This works for **every past Pano version**, not only for the versions an image was built for. Updates
made from Pano's own panel are written to `/data` too, so they survive a restart. See
[Container mode](../containers/runtime/#container-mode).

Read the running version from the jar's manifest in `/data`, not from the instance's API. The instance
belongs to someone else, so it cannot be trusted (see [Isolation](isolation/)).

## Versions {#versions}

- Let the owner choose any channel (alpha, beta, stable) and any version when the instance is created.
  Pano Host defaults to the latest stable version.
- Do not force updates. Show "update available" and let the owner update, or opt in to automatic
  updates. See [Operations](operations/#updates-and-rollback).
- Pick the Java version per instance. The runtime family always has Pano's minimum, **Java 11**; newer
  versions are allowed, older ones are refused. Pano Host starts new instances on the minimum the
  chosen Pano version needs and lets owners pick a newer one, for example for a plugin that needs
  Java 21. See [Java version](../containers/runtime/#java-version).
- Size the heap from the container's memory limit. Pano Host sets about 75 % of the instance's memory
  and does not let owners raise the heap with their own JVM args. See
  [Memory](../containers/runtime/#memory).

## Configuration

Pass the database and SMTP settings as [environment variables](../containers/configuration/#environment-variables).
Pano writes them into `config.conf` on first boot. Pano rewrites `config.conf` on shutdown, so if you
must change it by hand, stop the container first, edit, then start it.

Pano Host also sets `PANO_HOSTED` and the other [Pano Host variables](../containers/configuration/#pano-host-variables).
They are informational only: Pano versions that support them show "managed by Pano Host" and a quota
banner. Nothing inside Pano is locked by them.
