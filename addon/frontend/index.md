# Frontend Development

Frontend development in Pano is built on **Svelte** and styled with **Bootstrap 5** and **Animate.css**. The core of your plugin's frontend interaction happens through the **@panomc/sdk**.

## 📂 Directory Structure

Before diving into code, it's important to understand where your files should live.

```text
src/
├── panel/                  # Components and pages for the Admin Panel
│   ├── components/         # Reusable panel components
│   ├── modals/             # Modal dialogs
│   └── pages/              # Main route pages
├── theme/                  # Components and pages for the Public Theme
│   ├── components/         # Reusable theme components
│   ├── modals/             # Modal dialogs
│   └── pages/              # Main route pages
└── main.js                 # Entry point: Registers routes and navigation
```

*   **`panel/`**: Contains everything related to the admin interface (dashboard).
*   **`theme/`**: Contains everything related to what regular users see on the website.
*   **`main.js`**: This is the most important file. It tells Pano where your pages are and adds links to the navigation menu.

---

## 🛠️ Developing with @panomc/sdk

The `@panomc/sdk` package is your toolkit for interacting with Pano. It provides everything you need to build a native-feeling application, from UI components to network requests.

### 1. Registering Pages
To add a new page to the admin panel or the website, you use `pano.ui.page.register`.

```javascript
import { PanoPlugin } from '@panomc/sdk';

export default class AnnouncementPlugin extends PanoPlugin {
    onLoad(pano) {
        // Register a page in the Admin Panel
        pano.ui.page.register({
            name: 'announcements',
            path: '/announcements', // URL: /panel/announcements
            view: () => import('./panel/pages/AnnouncementsPage.svelte'),
            scopes: ['admin'] // Only visible to admins
        });
    }
}
```

### 2. Adding Navigation Links
Creating a page doesn't automatically add it to the menu. You need to inject it into the sidebar or navbar.

```javascript
pano.ui.nav.site.editNavLinks((navLinks) => {
    navLinks.push({
        id: 'announcements',
        title: 'Announcements',
        uipath: '/announcements', // Matches the registered page path
        icon: 'fas fa-bullhorn', // FontAwesome icon
        scopes: ['admin']
    });
    return navLinks;
});
```

### 3. Using Native Components
Instead of building standard UI elements from scratch, re-use Pano's native components. This ensures your plugin looks and feels like part of the core platform.

```svelte
<script>
    // Import components from the SDK
    import { Button, Card, Input } from '@panomc/sdk/components/panel';
</script>

<Card title="New Announcement">
    <Input label="Title" placeholder="Enter title..." />
    <Button color="primary">Create</Button>
</Card>
```

### 4. Making API Requests
Use `ApiUtil` to communicate with your backend. It handles authentication and base URLs automatically.

```javascript
import { ApiUtil } from '@panomc/sdk/utils/api';

// GET request
const announcements = await ApiUtil.get('/api/announcement/list');

// POST request
await ApiUtil.post('/api/announcement/create', {
    title: 'Hello World',
    content: 'This is a new announcement.'
});
```

### 5. Localization
Pano is multi-language by default. Use the `_` (underscore) function to translate text strings.

```svelte
<script>
    import { _ } from '@panomc/sdk/utils/language';
</script>

<h1>{_('announcement.welcome_title')}</h1>
<p>{_('announcement.description')}</p>
```

### 6. Notifications (Toasts)
Provide feedback to users using the built-in toast notification system.

```javascript
// Success message
pano.utils.toast.success(_('announcement.created_success'));

// Error message
pano.utils.toast.error(_('announcement.created_error'));
```

## 📝 Coding Style & Best Practices

*   **Svelte Sequence**: Order your blocks as: `<styles>`, `<html>`, `<script>`.
*   **Dynamic Importing**: Always use dynamic imports (e.g., `() => import(...)`) when registering pages to keep the initial bundle size small.
*   **Performance**: Avoid heavy computations in the frontend. Offload complex logic to your backend API.
*   **Visual Consistency**: Check the `panel-ui` and `vanilla-theme` repositories to see how standard pages are structured (e.g., table layouts, headers).
