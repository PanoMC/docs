# Getting Started with Integration Development

## What is Integration Development?

Integration development allows you to create seamless connections between third-party Minecraft plugins and Pano's web platform. By using the Pano MC Plugin API, you can:

- Synchronize data between game and web in real-time
- Send requests from your Minecraft plugin to Pano's web platform
- Receive and handle messages from Pano
- Trigger web actions from in-game events
- Create unified experiences across both platforms
## Prerequisites

Before you start developing integrations, make sure you have:

1. **Java Development Kit (JDK 17+)** — Required for plugin development
2. **Java or Kotlin Knowledge** — You can use either language with the Pano MC Plugin API
3. **Minecraft Plugin Development Experience** — Understanding of Spigot/Paper/Bukkit API
4. **Pano MC Plugin API** — [GitHub Repository](https://github.com/PanoMC/pano-mc-plugin)
5. **A Running Pano Instance** — For testing your integration
6. **A Minecraft Test Server** — Spigot, Paper, or Folia server for development

> **Note:** All examples in this guide are provided in both **Kotlin** and **Java** for your convenience.
## Architecture Overview

Pano's integration system consists of three main components:

```
┌─────────────────────┐         ┌──────────────────────┐         ┌─────────────────┐
│  Your MC Plugin     │ ◄─────► │  Pano MC Plugin      │ ◄─────► │  Pano Backend   │
│  (Integration)      │         │  (Communication API) │         │  (Web Platform) │
└─────────────────────┘         └──────────────────────┘         └─────────────────┘
    (Plugin Hooks)              (Secure WebSocket API)            (Platform API)
```

### Communication Flow

1. **Your Plugin → Pano MC Plugin API:** You use the API to send requests or messages
2. **Pano MC Plugin → Pano Backend:** Secure encrypted WebSocket communication (RSA + AES-256)
3. **Pano Backend → Your Plugin:** Pano automatically handles connections and routes messages back
4. **Pano Backend → Web:** Data is synchronized and displayed on the website

> **Important:** Do NOT fork the Pano MC Plugin. Instead, create your own separate plugin and use the Pano MC Plugin API.
