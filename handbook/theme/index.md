# Build Your First Theme

Welcome to the Pano theme handbook. This is a **cookbook**: instead of explaining every feature in the abstract, we build **one real theme together**, from an empty folder all the way to a published theme on the Marketplace.

By the end, you will have done every step yourself at least once — and you will know exactly where to look when you want to go deeper.

::: tip Reference vs. handbook
The [Theme Development](/theme/getting-started/) section is the **reference** — it explains each topic in full. This handbook is the **guided build**. When you want more depth on a step, we link straight to the matching reference page. Nothing here contradicts it; we just walk a single, concrete path through it.
:::

## The theme we're building: **Ember**

Meet our example project. **Ember** is a theme for a friendly survival Minecraft server. Its personality:

- A **warm orange** palette — think campfires and lava at dusk.
- A rounded, cozy feel.
- A home page that greets players and shows the latest news.
- Its own tagline, translated for every language the server speaks.

Its identity, which we'll use throughout:

| Field | Value |
|---|---|
| `id` | `ember` |
| `title` | Ember |
| Vibe | warm, cozy survival server |
| Accent color | a warm orange (`#ff6a3d`) |

::: warning The `id` is forever
We picked `ember` as the theme `id` on purpose, and we will **never change it** after publishing — a new `id` counts as a brand-new theme to Pano. It also can never be `vanilla-theme`. More on this in [Building & Packaging](/theme/packaging/).
:::

## What you need

Three things, same as any Pano theme:

| You need | What it is |
|---|---|
| **Bun** | Installs and runs Pano front-ends. Get it from [bun.sh](https://bun.sh). |
| **A running Pano** | Your theme talks to a live Pano while you work. If you don't have one yet, follow [Installation](/platform/installation/) first — Pano must be up before your theme can show anything. |
| **A code editor** | Anything you like, such as [VS Code](https://code.visualstudio.com/). |

You do **not** need to be an expert. A little HTML, CSS, and Svelte helps, but every step here is copy-paste-able. If you want a gentle intro, the [Svelte tutorial](https://svelte.dev/tutorial) and [MDN](https://developer.mozilla.org/) are excellent and free.

## The roadmap

Here's the whole journey. Each step is one page, and each page ends with a link to the next.

1. **[Setup](/handbook/theme/setup/)** — install the tools, scaffold Ember, connect it to Pano, and see it live in your browser.
2. **[Design & Styling](/handbook/theme/design/)** — give Ember its warm orange look with tokens, colors, and fonts.
3. **[Reshaping Pages](/handbook/theme/pages/)** — take over the home page: eject its view, edit the markup, and keep the plugin slots.
4. **[Translations](/handbook/theme/translate/)** — translate Ember's custom text into every language your server speaks.
5. **[Ship It](/handbook/theme/ship/)** — polish the manifest, build, check, package, install it on your own Pano, and publish it on GitHub and the Marketplace (with an optional premium path).

Ready? Let's set up our workshop.

**Next: [Setup →](/handbook/theme/setup/)**
