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

const learningPaths = [
  {
    title: "Try the Tutorial",
    text: "For individuals who would rather learn by doing."
  },
  {
    title: "Check out the Examples",
    text: "Discover common examples of core features and official plugins available for Parsek."
  }
]
</script>

# What is Pano?

**Pano** is an open-source and community-driven **platform** built **for Minecraft server owners** who want full control
and simplicity.  
Developed in **Kotlin** and running on the **JVM**, it unifies your **website**, **server**, and **community** — all in
one place.

A **platform** means more than just software — it’s a foundation.  
Pano provides a base system that can be extended with **addons**, customized with **themes**, and connected to your game
server — giving you everything you need to create your own **server-community ecosystem**.

Unlike typical **website scripts**, Pano isn’t something you just upload and run.  
It’s a full-fledged **application**, distributed as a `.jar` file — just like **Spigot**.  
It runs on the JVM and includes an initial setup process that requires an **active internet connection** to complete.  
This design gives Pano far greater **performance, flexibility, and security** than traditional web scripts, making it a
true **platform**, not just a set of files.

It’s built for **deep integration** between your game and the web — enabling features like auto-login, player stats, and
in-game management directly through your website.

> Simple. Powerful. Yours. — That’s Pano.

[Get Started with Installation →](../installation)

## ⚡ Key Features

Pano gives Minecraft server owners everything they need to build and manage their online presence — effortlessly:

- 🚀 **Fast & Lightweight** — Optimized for performance with minimal resource usage.
- 🧩 **Modular & Extendable** — Addons and themes let you shape Pano your way.
- 🛠️ **Self-Hosted Freedom** — Run it anywhere, keep full control.
- 🕹️ **Game Integration** — Connect your game server with your website.
- 💡 **Modern Stack** — Powered by Kotlin and Svelte for speed, stability, and scalability.

Join the community and see how Pano redefines Minecraft server management.  
[→ Join Our Discord](https://discord.gg/6vVy72wgXT) <!-- same invite link -->

## 🪧 Where does the name *Pano* come from?

The name **Pano** comes from the Turkish word **“Pano”**, which means *dashboard* or *control panel*.  
It reflects the idea of a **central place to manage everything** — your server, your website, your players, and your
community.

Just like a real dashboard gives you full control, **Pano** brings all aspects of your Minecraft server together in one
clean, extendable, and powerful platform.

## 🧑‍💻 Our Team
Say hello to our awesome team.

<VPTeamMembers size="small" :members="members" />