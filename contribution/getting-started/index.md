# Getting Started with Contributions

Welcome! Pano is an open-source project and we love community contributions. Whether you're fixing bugs, adding new features, or improving documentation, your help is appreciated.

## 📦 Our Repositories

Pano is composed of several repositories, each serving a specific purpose:

- [**Pano (Core)**](https://github.com/PanoMC/Pano): The main backend repository (Kotlin/Vert.x).
- [**panel-ui**](https://github.com/PanoMC/panel-ui): The administrative management interface (SvelteKit).
- [**setup-ui**](https://github.com/PanoMC/setup-ui): The initial setup wizard (SvelteKit).
- [**vanilla-theme**](https://github.com/PanoMC/vanilla-theme): The default official theme (SvelteKit).
- [**pano-mc-plugin**](https://github.com/PanoMC/pano-mc-plugin): Minecraft server-side integration plugin.
- [**docs**](https://github.com/PanoMC/docs): This documentation repository.

## 🚀 Release Types

We maintain three stages of releases across our branches:

| Type | Branch | Stability | Description |
|------|--------|-----------|-------------|
| **Alpha** | `alpha` | Low | Active development, frequent updates. May contain breaking changes. |
| **Beta** | `beta` | Medium | Pre-release stage. Generally stable but may have minor bugs. |
| **Release**| `main` | High | Production-ready. The most stable version. |

## 🛠️ Technology Stack

Pano is built using modern technologies to ensure performance and flexibility:

- **Backend**: Kotlin, Vert.x, Spring DI, targeting JVM 11+.
- **Frontend**: SvelteKit, Bootstrap 5, SASS.
- **Runtime**: [Bun](https://bun.sh) is used for running our frontend services.
- **Packaging**: Projects are packaged into ZIP files and embedded into a single executable JAR file.

## 📜 Contribution Guidelines

To maintain a high-quality codebase, please follow these guidelines:

- **Branching Policy**: 
  - **Pano (Core)**: The active development branch is `alpha`. All Pull Requests should be opened against the `alpha` branch.
  - **UI Projects**: These projects typically have two branches, but `dev` is the default branch for active development. Please target the `dev` branch for your PRs.
- **Conventional Commits**: We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification. This is strictly required for all commit messages.
- **Semantic Versioning & Release**: Pano uses **Semantic Versioning (SemVer)** and **Semantic Release**. Commit messages are used to automatically generate changelogs and determine version numbers.
- **Auto Deployment**: We use **GitHub Actions** for continuous integration and automatic deployment.
- **Database Support**: We aim to support **MariaDB** and **MySQL 5.5+**. Ensure your database queries and schema changes are compatible with these versions.
- **Migrations**: We pay close attention to **configuration and database migrations**, striving to maintain backward compatibility whenever possible.
- **Code Formatting**: Please ensure your code follows the general structure and style of the existing project.
- **AI-Generated Code**: Using AI to generate code is allowed; however, we cannot accept any code that is private, proprietary, or subject to licenses that conflict with our open-source goals.
- **Quality**: PRs should be clean, well-commented where necessary, and tested before submission.

## 🧩 How Pano Works

Pano is not a traditional web script. It's a self-contained platform that runs as a single JAR file (similar to a Minecraft server). When you run the JAR:
1. It extracts the necessary UI files.
2. It downloads a portable Bun runtime.
3. **Startup Checks**:
   - It checks if the platform is already installed.
   - It performs **configuration migrations** to ensure compatibility with the current version.
   - If the platform is installed, it checks and applies **database migrations**.
4. It starts a backend service that acts as a reverse proxy, directing traffic to the appropriate **interfaces**:
   - If the platform is **not installed**, it directs all traffic to **setup-ui**.
   - If the platform **is installed**, it directs traffic to **vanilla-theme** by default.
   - Any routes starting with **`/panel`** are proxied to **panel-ui**.
5. It communicates with Minecraft servers via an encrypted WebSocket connection.

---

Ready to dive in? Check out the specific development guides for [Backend](./backend) and [Frontend](./frontend).