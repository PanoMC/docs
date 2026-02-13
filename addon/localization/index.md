# Localization (i18n)

Pano supports a robust localization system. Your plugin `src/main/resources/locales` directory should contain translation files for supported languages.

- **File Format**: All translation files must be valid `.json`.
::: warning Default Fallback
If a translation is missing for the user's current language, Pano will automatically fall back to `en-US.json`. Ensure this file exists and is complete.
:::

## User Customization & Overrides

One of the powerful features of Pano is that administrators can modify your plugin's translations directly from the Pano Panel.

- **Overrides**: Users can edit any translation key you've defined, effectively overriding your default text without modifying the plugin JAR.
- **New Languages**: Users can add support for languages that your plugin does not natively provide by creating new translation entries in the Panel.

These customizations are stored separately by Pano and persist even after you release updates to your plugin.

## Defining Translations

### Permissions
If your plugin uses Pano's permission system, you must provide human-readable titles and descriptions for each permission node.

The key inside `permissions` corresponds to your permission class name converted to **SCREAMING_SNAKE_CASE** (usually without the 'Permission' suffix if Pano handles it that way, but typically it maps directly).

**Definition:**
::: code-group
```kotlin [Kotlin]
@PermissionDefinition
class ManageFAQPermission : PanelPermission("fa-question-circle")
```

```java [Java]
@PermissionDefinition
public class ManageFAQPermission extends PanelPermission {
    public ManageFAQPermission() {
        super("fa-question-circle");
    }
}
```
:::

**Translation:**
```json
{
  "permissions": {
    "MANAGE_FAQ": {
      "title": "Manage FAQ",
      "description": "Allows managing FAQ entries and categories."
    }
  }
}
```

These titles and descriptions are displayed on the **Permissions** page in the Pano Panel, allowing administrators to understand and assign permissions effectively.

### Activity Logs
If your plugin records activity logs, you need to define templates for them under the `activity-logs` object. Pano uses **{variable}** syntax (single curly braces) for dynamic placeholders in log messages.

The key inside `activity-logs` corresponds to your log class name converted to **SCREAMING_SNAKE_CASE** (without the 'Log' suffix).

**Kotlin Definition:**
```kotlin
class CreatedFAQCategoryLog(
    userId: Long,
    username: String,
    pluginId: String,
    name: String
) : PluginActivityLog(
    userId = userId,
    pluginId = pluginId,
    details = JsonObject().put("target", name).put("username", username)
)
```

**Translation:**
```json
{
  "activity-logs": {
    "CREATED_FAQ_CATEGORY": "<b>{username}</b> created FAQ category: {target}."
  }
}
```

::: info Important
Both `permissions` and `activity-logs` **must** be at the root level of your JSON file. Pano's system automatically manages these sections to integrate with the core platform.
:::

### Custom Keys
You can define arbitrary key-value pairs for use in your plugin's UI or backend messages.

```json
{
  "dashboard-title": "My Plugin Dashboard",
  "welcome-message": "Welcome back, {{username}}!"
}
```

## Using Translations

### Backend (Kotlin)
When sending localized messages or notifications from the backend, Pano's localization system handles the **Handlebars** replacement for you. You just need to pass the translation key and a map of variables.

### Frontend (Svelte)
The Pano frontend relies on [svelte-i18n](https://github.com/kaisermann/svelte-i18n). You can refer to its documentation for advanced usage.

#### The `$_` Helper
The Pano Boilerplate setup provides a convenient `$_` method that is injected into your Svelte components.
*   **Purpose**: It acts as a shortcut that automatically prefixes your translation keys with your plugin's ID.
*   **Usage**: `$_('dashboard-title')`
*   **Effect**: The system looks up `plugins.your-plugin-id.dashboard-title`.

#### Raw Access (Without Helper)
The `$_` helper is syntactic sugar. Under the hood, all plugin translations are namespaced under `plugins.<plugin-id>`.

If you are not using the helper, or if you need to access a translation key from outside your plugin's namespace (like a global Pano button text), you must use the full path:

```javascript
// Accessing your plugin's translation manually
$t('plugins.your-plugin-id.dashboard-title')

// Accessing a global Pano translation
$t('global.save')
```
