# Getting Started with Addon Development

Pano is a modular platform that allows developers to extend its functionality through **Addons** (Frontend) and **Plugins** (Backend). This guide will help you understand the core concepts and architecture of the Pano ecosystem.

## 🏗️ Core Architecture

Pano is not a traditional web script. It's a self-contained platform running as a single JAR file that serves multiple SvelteKit interfaces through an internal reverse proxy.

- **Backend**: Kotlin (Vert.x, Spring DI)
- **Frontend**: SvelteKit, Bootstrap 5, Vanilla JavaScript (No TypeScript)
- **Runtime**: Bun (Fast JS runtime)

### What is a Pano Plugin/Addon?
A complete extension typically consists of two parts:
1. **Plugin Backend**: A Kotlin/Java JAR that runs inside Pano Core.
2. **Plugin UI (Addon)**: A Svelte-based frontend bundled with the backend or served dynamically.

---

## 🛠️ The Pano SDK (`@panomc/sdk`)

The SDK is the heart of addon development. It acts as the bridge between the Host (Pano) and your Plugin.

- **Component Provider**: Access pre-built components like `Button`, `Modal`, `Editor`, and `Card`.
- **UI Registration**: Add new routes to the Panel or Theme using `pano.ui.page.register`.
- **Navigation Control**: Modify sidebar links dynamically via `pano.ui.nav.site.editNavLinks`.
- **API Utilities**: Use `ApiUtil` for secure network requests.
- **Localization**: Use the localized `_` function for multi-language support (EN, TR, RU).

---

## 🎨 Frontend Standards

We follow strict design and coding standards to ensure all addons feel like a native part of Pano.

### Language & Styling
- **Vanilla JavaScript**: We believe in a better world with plain JS. TypeScript is not accepted in frontend projects.
- **Svelte & Bootstrap 5**: The core UI framework. Use SASS for styling.
- **Design Consistency**: Match the aesthetics of `panel-ui` and `vanilla-theme`. Use consistent table structures, search inputs, and pagination (default 10 items).

### Performance
- **SSR & CSR**: Pano uses hybrid Server-Side and Client-Side rendering. Ensure your components are SSR-compatible (avoid `window`/`document` outside `onMount`).
- **Dynamic Loading**: Components registered to the Pano API **must** be loaded dynamically to keep initial page weight low.

---

## ⚙️ Backend Standards (Kotlin)

### Lifecycle Management
Plugins must extend the `PanoPlugin` class and handle `onStart` and `onUninstall` hooks. For database operations, always wait for the Pano setup to finish using `SetupEventListener`.

### Database & Permissions
- **Type Safety**: Use **Enums** over static strings for configuration and database entities.
- **DAO Pattern**: Use `@DBEntity`, `@Migration`, and `@Dao` annotations.
- **Security**: Define permissions by extending `PanelPermission` with custom FontAwesome icons.
- **Activity Logs**: All administrative API endpoints **must** define Activity Logs for transparency.

---

## 📥 Development Workflow

### Rapid UI Testing
To test UI changes without rebuilding:
1. Enable **Dev Mode** in `Panel -> Settings`.
2. Place your addon files in the `plugins/` directory of your Pano installation.
3. Use `bun dev` to see changes instantly with Hot Module Replacement (HMR).

### Branching & Commits
- **Alpha First**: Always target the `alpha` branch for Pano Core or the `dev` branch for UI projects.
- **Conventional Commits**: We strictly follow [Conventional Commits](https://www.conventionalcommits.org/). This is mandatory as changelogs are automatically generated via **Semantic Release**.

---

## 🔗 Resources & Licensing
- **License**: Official plugins and the boilerplate are licensed under **MIT**.
- **Community**: Join us on [Discord](https://panomc.com/discord) for support.
- **Boilerplate**: Start your project with the [Pano Boilerplate Plugin](https://github.com/PanoMC/pano-boilerplate-plugin).

Ready to build? Move on to the next section to set up your environment!