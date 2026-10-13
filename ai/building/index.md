# Building with an Agent

How to have an AI agent build a plugin, a theme or a headless site for Pano. The pattern is the same each time: start from the official scaffold, let the agent read the agent guide, ask for one thing at a time, run the checks, review by hand.

## The agent guide

Pano's rules for agents are a folder named `agent-guide/`: a short `README.md` that routes by task ("making a new plugin", "restyling without touching markup", "a headless front-end"...) and one small file per task. An `AGENTS.md` and a `CLAUDE.md` at the repository root tell the agent to read that README first and then only the file for its task.

| Repository | Carries the guide |
|---|---|
| [`PanoMC/pano-starter-sveltekit`](https://github.com/PanoMC/pano-starter-sveltekit) (headless starter) | yes, and `client-gen new` copies it into your project |
| [`PanoMC/pano-boilerplate-plugin`](https://github.com/PanoMC/pano-boilerplate-plugin) (plugin template) | yes, plus `design/` for panel pages |
| [`PanoMC/vanilla-theme`](https://github.com/PanoMC/vanilla-theme) (default theme) | yes |
| [`PanoMC/sdk`](https://github.com/PanoMC/sdk) | the source of the guide |

The plugin and theme scaffold commands do not write these files into a new project. Copy them once:

```sh
git clone --depth 1 https://github.com/PanoMC/pano-boilerplate-plugin /tmp/pano-boilerplate
cp -r /tmp/pano-boilerplate/agent-guide /tmp/pano-boilerplate/design my-plugin/    # a plugin
cp -r /tmp/pano-boilerplate/agent-guide my-theme/                                  # a theme
```

Then start your prompts with "Read `agent-guide/README.md` first", or put that sentence in your own `AGENTS.md`.

## Plugin

Start as [Addon Getting Started](../../addon/getting-started/) describes, with Pano running locally and Development Mode on:

```sh
cd <your-pano>/plugins && bunx @panomc/plugin-kit new my-plugin
cd my-plugin && bun run dev
```

Example prompts:

```text
Read agent-guide/README.md first. Add a site page at /my-plugin/rules that shows a list of
server rules. Store the rules in the plugin's own table and add the endpoint that lists them.
```

```text
Read agent-guide/README.md first. Add a panel page where an admin can add, edit and delete
the rules, protected by a permission of this plugin. Follow design/README.md.
```

```text
Move every text of this plugin into src/main/resources/locales/ and add a Turkish translation.
```

Check the result: `bun run check` (or `bunx pano-plugin check --strict`), then `./gradlew build`. Kotlin changes need `./gradlew build -Pnoui` and a restart of Pano before you see them.

## Theme

Start as [Theme Getting Started](../../theme/getting-started/) describes:

```sh
bunx @panomc/theme-core new my-theme
cd my-theme && bun install && bun run dev:ui
```

Example prompts:

```text
Read agent-guide/README.md first. Give this theme a dark look with a green accent.
Change only src/styles/tokens.scss and src/styles/style.scss; do not eject any view.
```

```text
Read agent-guide/README.md first. Replace the home page with a landing page: a hero with the
server address, then the latest three posts. Keep every plugin slot.
```

```text
Restyle the market plugin's product card to match this theme. Take the cheapest step that
works and tell me which one you took.
```

Check the result: `bunx @panomc/theme-core check --strict`, `bun run build`, and open `<your Pano address>/__pano/views` to see every view with sample data.

## Headless front-end

Start as [Headless Quick Start](../../integration/headless/) describes. This scaffold already contains `AGENTS.md`, `CLAUDE.md` and `agent-guide/`:

```sh
bunx @panomc/client-gen new my-site --url http://localhost:8088
cd my-site && bun run dev
```

Example prompts:

```text
Read AGENTS.md first. Add a /servers page that lists the Minecraft servers of this Pano with
their online player counts. Use the generated client in src/lib/pano; do not edit it.
```

```text
Run bun run pano:pull, then add a store page built on the market plugin's operations.
```

Check the result: `bun run check`, `bun test`, `bun run build`. `bun run package` makes the zip you upload as "My uploaded site".

## Review by hand before you release

- **Run it.** A green check is not a working plugin or theme. Open the page in a Pano with Development Mode on, at phone width too.
- **Read the diff.** Look for edits in generated folders (a theme's `src/routes/`, `src/lib/`, `lang/`; a plugin's `src/main/resources/plugin-ui/`; a headless site's `src/lib/pano/`), TypeScript files, and a changed `svelte` version. The guide forbids all of them.
- **Plugins:** permissions on every panel endpoint, input validation, and that the plugin writes only to its own tables. The `pluginId` can never change after the first release.
- **Secrets:** no front-end key, license key or password in the code or in the commit.
- **Versions and releases:** the agent should not bump a version, tag or push. Releases come from your commit messages: see [Building & Publishing](../../addon/publishing/) and [Publishing](../../theme/publishing/).
