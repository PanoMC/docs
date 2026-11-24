# Rules for every Pano repository

- Commit messages are one line in conventional form (`fix:`, `feat:`, `chore:`, `docs:` …), written for the person who
  updates Pano: they become the changelog. Never "Refactor code structure for improved readability" or another
  generic message.
- Releases are made by semantic-release from those commits. Never bump a version by hand.
- Front-end repos use Bun, JVM repos use the Gradle wrapper (`./gradlew`).
- Never commit generated or temporary output (`build/`, `node_modules/`, `.svelte-kit/`, `.runtime-shims-temp/`,
  `.lib-bundle-output/`, `static/runtime/`, `static/lib/`). If one shows up in the changes, leave it out.
- Run the repo's checks and build before you push (the repo's `REPO-NOTES.md` names them; plugins and themes:
  `agent-guide/testing.md`). Do not push on top of a red CI run: fix it first.
- Do not edit the `docs` submodule from a consumer repo; change `PanoMC/docs` and bump the pointer.
