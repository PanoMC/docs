# Frontend Development

Pano's frontend is split into several SvelteKit projects. While they are developed independently, they are ultimately packaged together within the core JAR.

::: info PREREQUISITE: RUNNING BACKEND
Before you start frontend development, you **must** have a running Pano backend.
- **Frontend Only Development**: Download the latest Pano `.jar` from our [Releases](https://github.com/PanoMC/Pano/releases).
- **Full-Stack Development**: If you plan to modify the backend as well, please follow the [Backend Development](./backend) guide to run it from source.
:::

## 🛠️ Tech Stack
- **Framework**: SvelteKit
- **Styling**: Bootstrap 5 + SASS
- **Runtime**: Bun (Fast JavaScript runtime)
- **Language**: **JavaScript** (Vanilla JS is mandatory. We believe a better world is possible with plain JS!)

## 📜 Language Philosophy (JavaScript vs. TypeScript)
In the Pano project, we have a firm stance on our choice of language:
- **Always use JavaScript**: We are committed to keeping things simple and lightweight.
- **No TypeScript**: We avoid TypeScript to maintain high compatibility and simplicity.
- **Why?**: We believe that with clean, well-written Vanilla JS, a better and more efficient world is possible. TypeScript is not accepted in our frontend projects.

## 🚀 Performance & SEO
Pano leverages the power of **SvelteKit** to provide a hybrid **SSR (Server-Side Rendering)** and **CSR (Client-Side Rendering)** experience.
- **SEO Focused**: We pay close attention to SEO optimization. By using SSR, we ensure that all content is easily indexable by search engines.
- **Smooth UX**: CSR is utilized for dynamic interactions, providing a fast and fluid user experience without full page reloads.

::: tip DEVELOPER RESPONSIBILITY
When developing frontend components, you **must** ensure they are SSR-compatible. Avoid direct `window` or `document` access outside of Svelte's `onMount` lifecycle. Always use semantic HTML to preserve our SEO standards.
:::

- **vanilla-theme**: The base for all themes.

## 📥 Cloning & Submodules
All our interface projects use the [**pano-sdk**](https://github.com/PanoMC/pano-sdk) as a git submodule to share core logic and components.

### Recommended Cloning Method
To ensure you get the SDK and all dependencies, use the `--recursive` flag:
```bash
git clone https://github.com/PanoMC/setup-ui.git --recursive
```

### If you already cloned normally
If you missed the `--recursive` flag, you must initialize and update the submodules manually:
```bash
git submodule init
git submodule update
```

## 🚦 Development Guide
After cloning the repository and submodules, follow these steps:

### 1. Installation
Install the dependencies using Bun:
```bash
bun i
```

### 2. Running for Development
Start the development server:
```bash
bun dev
```

### 3. Ports & Access
Each interface runs on a specific port. **Do not change these ports**, and ensure they are available on your system.

| Interface | Port | Condition |
| :--- | :--- | :--- |
| **setup-ui** | `3002` | Setup must **not** be completed. |
| **vanilla-theme** | `3000` | Setup must be completed. |
| **panel-ui** | `3001` | Setup must be completed. |

::: danger IMPORTANT ACCESS NOTE
- **No Direct Access**: You cannot access these ports directly via your browser. They are served through Pano's proxy.
- **Automatic Redirect**: If you attempt to access UI ports manually, you may be automatically redirected to `http://localhost:8088` (Pano's default backend port).
- **Admin Login**: To access `panel-ui` via the `/panel` route, you must log in as an **Admin** using the credentials you defined during the setup process.
:::

## 🔄 Packaging Process
1. Each UI project is built and compressed into a `.zip` file.
2. During the Pano build process, these ZIPs are downloaded and embedded into the final JAR.
3. At runtime, Pano extracts these to the `ui/` directory and serves them using Bun as a micro-service.

## 🔌 UI Addon System
You can create addons that inject features into the Panel or Themes.
- **Backend-side**: Defined as a JAR plugin.
- **Frontend-side**: Developed in Svelte and placed in the `plugins/` folder.

### Developing UI Addons
To test UI changes quickly:
1. Place your addon files in the `plugins/` directory of your Pano installation.
2. Enable **Dev Mode** in `Panel -> Settings`.
3. Use `bun dev` to see changes instantly with Hot Module Replacement.

---

Questions about Svelte integration? Ask us on [Discord](https://panomc.com/discord)!
