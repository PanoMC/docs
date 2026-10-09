# Widgets

A widget is a piece of a Pano plugin (a goal bar, top supporters, store statistics) that you can drop into any web page as a custom HTML tag. It brings its own data and its own style.

## Embed one

```html
<script type="module" src="https://pano.example.com/api/v1/widgets/loader.js"></script>
<pano-market-goal></pano-market-goal>
```

The loader is small. It asks Pano which widgets exist, then loads a widget the first time its tag appears on the page, also for tags added later. Unknown `pano-*` tags are ignored.

See what your Pano offers:

```sh
curl http://localhost:8088/api/v1/widgets/index.json
```

Tags look like `pano-<plugin short name>-<widget>`. A plugin that is not active has no widgets, and its tags stay empty.

## Style

Widgets sit in a shadow root and bring a default look from Pano's design tokens. Style them from your page with CSS variables, on the page or on one element:

```css
:root { --pano-color-primary: #e33; }
pano-market-goal { --pano-color-primary: #28a; }
```

Set the palette on the script or on an element: `data-palette="dark"` (default `light`). The text language follows `data-locale` on the script, else the site's.

For deeper changes, every widget part is exposed with `part`:

```css
pano-market-goal::part(market-goal__bar) { border-radius: 0; }
```

Add the attribute `no-shadow` to render a widget in the normal page instead, so your page CSS reaches inside.

## Attributes

A widget's simple settings (text, numbers, switches) are attributes in kebab-case; the plugin's widget list in `/api/v1/widgets/index.json` names them under `attrs`. Anything more complex is set as a property on the element after it exists:

```js
document.querySelector('pano-market-goal').someSetting = 'value';
```

Changing an attribute updates the widget without reloading it.

## Events

Events bubble and cross the shadow boundary:

| Event | When | Detail |
|---|---|---|
| `pano:ready` | Data loaded, widget shown | none |
| `pano:error` | Loading failed | `{ code }` |
| `pano:toast` | The widget wants a message shown | text, variant |
| `pano:navigate` | The widget wants to go to a page | `{ url }` |

`pano:toast` and `pano:navigate` can be cancelled with `preventDefault()` so your page handles them:

```js
document.addEventListener('pano:navigate', (e) => { e.preventDefault(); router.go(e.detail.url); });
```

Point widget links at your own pages with the URL map:

```js
window.PanoWidgets.configure({ urls: { 'market.store': '/shop', 'market.order': '/shop/o/{id}', 'auth.login': '/login' } });
```

## Which address to use

| Your page | Loader address | Visitor's login |
|---|---|---|
| On Pano's own address | `https://pano.example.com/api/v1/widgets/loader.js` | Cookie, works |
| On an [allowed origin](../access/) | Same | Cookie, works |
| On any other domain | A path on your own site that forwards to Pano, for example `/pano/api/v1/widgets/loader.js` | Via your server (the starter does this) |

Pano gives CORS only to allowed origins, so a page on a foreign domain loads widgets through its own proxy path. Behind a path prefix the loader needs no setting: it works out `/api/v1` from its own address.

A plain reverse proxy rule is enough for public widgets (anonymous). The [headless starter](../headless/) already has a `/pano` route that also forwards the visitor's session.

## For plugin authors

Mark a block view as a widget in its metadata and the build does the rest:

```svelte
<script module>export const view = { widget: true };</script>
```
