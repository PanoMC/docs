# Getting Started

This area contains the basics you need to know to develop plugins for the Pano platform. A Pano plugin consists of a Kotlin backend and a Svelte frontend.

## Prerequisites
Before you begin development, ensure you have the following:

- **Technical Knowledge**:
    -   Basic understanding of **Kotlin** or **Java** for backend development.
    -   Basic understanding of **HTML, CSS, JavaScript** or **Svelte** for frontend development.
- **Pano Installation**: You must have a Pano instance already installed and running locally.
- **Development Mode**: Go to **Panel > Platform** settings and enable **Development Mode**. This is strictly required to see UI changes during development.

## Setup

We have prepared a **[Pano Boilerplate Plugin](https://github.com/PanoMC/pano-boilerplate-plugin)** to help you get started quickly. This repository contains a pre-configured structure for both backend and frontend.

### 1. Clone the Boilerplate
To enable live reloading of UI changes, you **must** clone your project into the `plugins` directory of your installed Pano instance.

1.  Navigate to your Pano installation directory (e.g., `Pano/plugins`).
2.  Clone the repository:
    ```bash
    git clone https://github.com/PanoMC/pano-boilerplate-plugin.git your-plugin-name
    ```

2.  **Rename & Configure**: Open the project and rename all occurrences of `pano-boilerplate-plugin` to your own plugin ID.
    *   Update `gradle.properties` (manifest).
    *   Rename package directories.
    *   Update basic definitions in the main class.

##  What's Next?

Pano plugin development involves separate workflows for frontend and backend. Check out the detailed guides below to learn more:

*   [General Architecture](../architecture) - Learn about general structure, standards, and PF4J integration.
*   [UI Development (Frontend)](../frontend) - Learn how to build interfaces using Svelte and the Pano SDK.
*   [Backend Development](../backend) - Deep dive into Kotlin backend, database models, and APIs.
*   [Translations (i18n)](../localization) - How to make your plugin multilingual.