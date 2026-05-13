<script setup>
import { VPTeamMembers } from 'vitepress/theme';
const members = [
  {
    avatar: 'https://minotar.net/avatar/kahverengi/64.png',
    name: 'Ahmet Enes Duruer (kahverengi)',
    title: 'Founder | Lead Developer',
    links: [
      { icon: 'github', link: 'https://github.com/duruer' },
      { icon: 'discord', link: 'https://discord.com/users/kahverengi' },
    ]
  },
  {
    avatar: 'https://minotar.net/avatar/ultub/64.png',
    name: 'Selim Gökçek (ultub)',
    title: 'Founder | Designer',
    links: [
      { icon: 'github', link: 'https://github.com/slmgkck' },
      { icon: 'discord', link: 'https://discord.com/users/ultub' },
    ]
  }
];
</script>

# What is Pano?

Pano is an **open-source platform** for Minecraft server owners that unifies your **website, server, and community** — built in Kotlin, runs on the JVM, and ships as a single `.jar` file.

> Simple. Powerful. Yours. — That's Pano.

## Why Pano?

- **Self-hosted and open source.** Run it anywhere. Full control stays with you.
- **Extensible.** Shape Pano with addons and themes — match it to your server.
- **Game-ready.** Auto-login, player stats and in-game management work out of the box.

## Get Started

- **[Install Pano →](../installation/)** — A running server in five minutes.
- **[Join our Discord →](https://discord.gg/6vVy72wgXT)** — Ask a question, share feedback.

::: details Where does the name come from?
**Pano** is the Turkish word for *dashboard* — a central place to manage everything: your server, your website, your players, your community.
:::

::: details License (GPLv3)
The Pano core is licensed under the **GNU General Public License v3.0 (GPLv3)** — a copyleft license that keeps the foundation free and open forever.

- You can run, study, share and modify Pano.
- Modified versions of the **core** must also be open-source and GPLv3.
- **Addons and themes** can use any license — including private or commercial.
- **Third-party plugins** integrated with Pano follow their own licensing terms.
:::

## Our Team

Say hello to our awesome team.

<VPTeamMembers size="small" :members="members" />
