# Building & Publishing

## 📦 Building Your Addon

To compile your addon into a JAR file that can be installed on a Pano server:

1.  Open your terminal in the project root.
2.  Run the build command:
    ```bash
    ./gradlew build
    ```
3.  The compiled plugin will be located in:
    `build/libs/your-plugin-id-version.jar`

::: tip
If you are using external dependencies that are not provided by Pano, make sure to use the `shadowJar` task to bundle them.
:::

## 🚀 Publishing

### Versioning
Ensure your `gradle.properties` file has the correct version number before building.

### Distribution
Currently, Pano addons are distributed via:
- GitHub Releases
- The Official Pano Marketplace

To release on GitHub:
1.  Tag your commit.
2.  Create a new Release.
3.  Upload the JAR file from `build/libs`.

## 🤖 Automation

You can automate your build and release process using **GitHub Actions**.

### GitHub Actions
The [Pano Boilerplate Plugin](https://github.com/PanoMC/pano-boilerplate-plugin) comes with a pre-configured `.github/workflows/release.yml` file. This workflow builds your plugin and creates a release automatically.

### Pano Deploy API Token
To automate deployment to the Pano Marketplace, you need a Pano Deploy API Token.

1.  Log in to the **Pano Website**.
2.  Navigate to **Profile -> Settings -> API Tokens**.
3.  Click **Create** to generate a new token.

::: warning IMPORTANT
The API token will only be shown **once** in the modal immediately after creation.
**Store this token in a secure place**, such as your **GitHub Secrets** or environment variables. Never commit it to a public repository.
:::

### Semantic Releases
Deployment is handled using **Semantic Releases**. You can check the [Pano Plugin Pages](https://github.com/PanoMC/pano-plugin-pages) repository for a real-world example of how to configure `.releaserc.json` for deployment.

Example configuration uses the `@PanoMC/semantic-release-pano` plugin to handle the upload to Pano.
