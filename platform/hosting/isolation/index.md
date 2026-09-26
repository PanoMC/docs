# Isolating Instances

When the instances on one server belong to different people, assume any of them can be hostile. The
rule Pano Host follows: **never trust the instance.** Everything you bill or enforce — traffic, CPU,
memory, disk, mail, version, uptime — is measured outside it.

> [!WARNING]
> **Not released yet.** See [Hosting Pano Instances for Others](../).

## Container hardening {#container-hardening}

Run every instance container with:

- its own non-root user id (`--user`) and Docker **user namespace remapping** (`userns-remap`, set
  daemon-wide);
- `--cap-drop=ALL` and `--security-opt no-new-privileges`;
- the default **seccomp** profile and **AppArmor**;
- `--pids-limit`, a memory limit and a CPU limit;
- a **read-only root filesystem**, with only `/data` writable and a tmpfs at `/tmp`;
- the `local` log driver with size-capped rotation.

Never mount the Docker socket or any host path into an instance, except its own data folder at `/data`.
If owners manage files through a web file manager, run those file operations in a short-lived helper
container as the instance's user id, not as root on the host.

## One network per instance {#networks}

Create a separate Docker bridge network for each instance. Attach the shared services — reverse proxy,
database server, mail relay — **to each instance network**, instead of putting all instances on one
shared network. Instances then cannot reach each other.

With hundreds of instances, give Docker small address pools (`default-address-pools` with, for example,
`/27` subnets) so all the networks fit.

## Database users {#database}

Run one MariaDB (or MySQL) server and give each instance its own database. Create two users per
instance:

| User | Used by | Notes |
| --- | --- | --- |
| internal | the Pano Instance | passed as `PANO_DB_*` env vars |
| external | the owner, from outside | optional; TLS required, optional IP allowlist, own password reset |

Keeping them separate means an owner who rotates their password or changes the allowlist never breaks
the running instance. Grant each user rights on its own database only, and guard against noisy
neighbours with per-user limits such as `MAX_USER_CONNECTIONS` and statement time caps.

## Outbound traffic {#egress}

Pano Host filters each instance network's outbound traffic (nftables):

- allow DNS to the server's own resolver and TCP 80, 443, 465 and 587;
- **block TCP 25**, so instances cannot send spam directly;
- block cloud metadata addresses (`169.254.169.254`, `fd00:ec2::254`), other instance networks and
  the server's internal addresses, except the instance's own database and mail relay;
- open extra ports only when the owner asks for them;
- throttle anomalous outbound traffic and alert an admin.

## Mail relay {#mail-relay}

With port 25 blocked, instances send mail through a relay you run: an SMTP service on each instance
network, passed to Pano as `PANO_SMTP_*`. Give every instance its own relay credentials so the relay
can count mail per instance and enforce a daily limit. Owners can still configure their own SMTP
server in Pano instead.

## Quotas are measured outside {#quotas}

Do not ask the instance how much it used. Measure it:

- **Disk**: Pano Host gives each instance a sparse, loop-mounted disk image as its hard quota. The
  instance's `/data` and its database files both live on it, so the database counts too.
- **Traffic**: count it at the reverse proxy.
- **CPU and memory**: set Docker limits and read usage from Docker.
- **Mail**: count it at the relay.
- **Version and uptime**: read them from the jar in `/data` and from the container state.
