# Getting Started with Integration Development

## What is Integration Development?

Integration development allows you to create seamless connections between third-party Minecraft plugins and Pano's web platform. By using the classes of the Pano MC Plugin, you can:

- Synchronize data between game and web
- Send requests from your Minecraft plugin to Pano's web platform
- Receive Pano's answers to those requests
- Trigger web actions from in-game events
- Create unified experiences across both platforms
## Prerequisites

Before you start developing integrations, make sure you have:

1. **Java Development Kit (JDK 11+)** — The shared code of the Pano MC Plugin targets Java 11 (its Velocity module needs Java 17)
2. **Kotlin Knowledge** — The API is Kotlin; waiting for an answer is a `suspend` function
3. **Minecraft Plugin Development Experience** — Understanding of Spigot/Paper/Bukkit API
4. **Pano MC Plugin** — [GitHub Repository](https://github.com/PanoMC/pano-mc-plugin)
5. **A Running Pano Instance** — For testing your integration
6. **A Minecraft Test Server** — Spigot, Paper, or Folia server for development

> **Note:** All examples in this guide are in **Kotlin**.
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

1. **Your Plugin → Pano MC Plugin:** You send a request through its `PlatformManager`
2. **Pano MC Plugin → Pano Backend:** One encrypted WebSocket connection (RSA key exchange when the server is connected, AES-256-GCM for every message)
3. **Pano Backend → Your Plugin:** A server event of your Pano plugin handles the request; its answer comes back on the same connection
4. **Pano Backend → Web:** Data is stored and displayed on the website

> **Important:** Do NOT fork the Pano MC Plugin. Instead, create your own separate plugin that depends on it. Your plugin opens no second connection and needs no second credential.
