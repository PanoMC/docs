# Backend Development (Kotlin)

## 🚀 Plugin Lifecycle & Context
Plugins extend `PanoPlugin`. Key contexts include:
-   `applicationContext`: Pano's main DI context.
-   `pluginBeanContext`: Handles plugin-internal beans.
-   `pluginGlobalBeanContext`: Shares beans between different plugins.

### Setup Interaction
Wait for setup completion before initializing database-heavy operations.

**Event Handler Example:**
```kotlin
@EventListener
class SetupEventHandler(private val plugin: YourPlugin): SetupEventListener {
    override suspend fun onSetupFinished() {
        if (plugin.pluginState == PluginState.STARTED) {
            plugin.startPlugin()
        }
    }
}
```

**Main Plugin Class Methods:**
```kotlin
override suspend fun onStart() {
    if (!setupManager.isSetupDone()) {
        return // Wait for SetupEventHandler
    }
    startPlugin()
}

override suspend fun onUninstall() {
    pluginDatabaseManager.uninstall(this)
}
```

## 🗄️ Database & Models
- **Package Structure**: `db/daos/`, `db/impl/`, `db/models/`, `db/migrations/`.
- **Annotations**: `@DBEntity` (models), `@Migration` (versioned changes), `@Dao` (implementations).
- **Naming Convention**: Keep **DAO** and **Model** names similar (e.g., `AnnouncementModel` and `AnnouncementDao`).
- **Implementation**: Extend abstract Dao classes and provide the model class. Ensure `uninstall` logic is implemented.

## 🛣️ API & Routing
- **Location**: `routes/` package.
- **Types**: `PanelApi` (admin), `LoggedInApi` (authenticated users).
- **Validation**:
    -   Validation handlers are mandatory.
    -   Use path variables like `:id`.
    -   Specify `required body` for schema-based objects.
- **Permissions**: Use `authProvider` from `applicationContext`.
- **Activity Logs**: All Panel APIs **must** define activity logs.
- **Error Handling**: Prefer built-in errors (`com.panomc.platform.error`). Define custom errors in `error/` by extending `com.panomc.platform.model.Error`.

## 🔐 Permissions & Configuration
- **Permissions**: Define in `permission/` package, extending `PanelPermission` with `@PermissionDefinition`.
    -   **Icon**: Provide a FontAwesome icon name to the `PanelPermission` constructor (e.g., `PanelPermission("fa-question-circle")`).
    -   **Node**: The permission node ID is automatically generated from the class name (e.g., `ManageFAQPermission` -> `MANAGE_FAQ`).

**Permission Definition Example:**
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
- **Config**: Use `PluginConfigManager`.
    -   Keep general settings in **Config** classes.
    -   **Enum First**: Use Enums instead of static strings for type safety.
