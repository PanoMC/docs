# Pano guidelines

Rules for people and AI coding agents working in any Pano repository. Every Pano repo has this docs repo as its git
submodule `docs/` (in `theme-core` and `pano-portal-infra` it is `pano-docs/`, in `website` it is `documentation/`), and
its `AGENTS.md` routes here. Open only the file for your task; do not load every file.

| You need                                                                 | Read                      |
| ------------------------------------------------------------------------ | ------------------------- |
| Rules for every Pano repo: commits, releases, tooling, checks            | `common.md`               |
| Panel UI design: panel-ui, setup-ui and the panel side of every plugin   | `design/README.md`        |
| Plugin, theme or headless front-end work: views, API, classes, tokens    | `agent-guide/README.md`   |
| How Pano works and is used (platform, addons, themes, API)               | `../index.md`, then the section |

These files exist only here. Do not copy them into a repo; change them in `PanoMC/docs` (branch `dev`) and bump the
submodule where you need the new text.
