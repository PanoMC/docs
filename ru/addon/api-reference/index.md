# Справочник API фронтенда

Каждое имя хука, слот представления, событие жизненного цикла, помощник навигации и экспорт `@panomc/sdk`, которые может использовать UI вашего аддона — на одной странице.

Это **справочная страница**, а не туториал. Если вы хотите увидеть эти API в действии в настоящем аддоне, начните с [Разработки фронтенда](/ru/addon/frontend/), которая пошагово собирает UI Shoutbox. Всё здесь — это поверхность, из которой черпает та страница.

::: tip Откуда всё это берётся
UI вашего аддона никогда не упаковывает Svelte или SDK — он импортирует их как «голые» спецификаторы, которые хост разрешает в общую среду выполнения (см. [Архитектуру](/ru/addon/architecture/)). Дерево `pano.*` ниже внедряется в ваш плагин как `this.pano`; модули `@panomc/sdk` — это замороженный список импортов в конце страницы.
:::

## Объект `pano`

До всего добираются через объект `pano`, который хост внедряет в ваш плагин как `this.pano`. Два флага живут наверху; остальное свисает с `pano.ui.*`.

| Свойство | Тип | Что это |
|---|---|---|
| `pano.isPanel` | boolean | `true`, когда ваш код выполняется внутри панели администратора, `false` — внутри темы. Ветвитесь на этом в `onLoad()`. |
| `pano.debug` | boolean | Зарезервированный флаг на объекте `pano`. Сейчас он жёстко зашит в `false`, и ни один хост его не устанавливает, поэтому **не** полагайтесь на него для определения dev-сборки. |

Панель и тема предоставляют **разные** деревья `pano.ui` — помощник, существующий в одном, может отсутствовать в другом. Члены, доступные только в панели или только в теме, помечены как таковые по всей странице.

## 1. Контракт точки входа плагина

Ваш `src/main.js` экспортирует по умолчанию класс, расширяющий `PanoPlugin` (из `@panomc/sdk`). Хост создаёт его, внедряет `this.pano` и вызывает методы жизненного цикла.

| Член | Вид | Назначение |
|---|---|---|
| `onLoad()` | метод (переопределение) | Вызывается один раз после загрузки плагина. Выполняйте здесь все свои регистрации. `this.pano` доступен. |
| `onUnload()` | метод (переопределение) | Вызывается, когда плагин демонтируется. Отмените всё, что не должно оставаться (например, `pano.ui.page.unregister(...)`). |
| `this.pano` | свойство | Объект API, документируемый на этой странице. |
| `this.context` | свойство | Объект контекста, привязанный к плагину. |
| `this.setContext(partial)` | метод | Поверхностно сливает значения в `this.context` и уведомляет подписчиков. |
| `this._unsubscribers` | массив | Помещайте сюда функции отписки от хранилищ; хост выполнит их все, когда плагин будет уничтожен. |

Две функции приходят из `@panomc/sdk` вместе с базовым классом:

| Экспорт | Назначение |
|---|---|
| `viewComponent(importer)` | **Обязательная** обёртка для каждого компонента, который вы передаёте любому API регистрации. Она прикрепляет корректные `mount`/`hydrate`/`unmount` из общей среды выполнения, поэтому передавайте `viewComponent(() => import('./X.svelte'))`, никогда не голый импортёр. |
| `getPanoContext()` | Возвращает текущий контекст хоста Pano. Редко нужен напрямую. |

::: warning `onContextUpdate` не вызывается
Более старый boilerplate поставляет метод `onContextUpdate()` на классе плагина. **Ни один хост его никогда не вызывает.** Это мёртвый код — не стройте на нём поведение. Используйте `onLoad()` для настройки и подписки на хранилища для реакции на изменения.
:::

## 2. Страницы — `pano.ui.page`

Регистрируйте полноценные страницы под темой (`/…`) или панелью (`/panel/…`).

| Вызов | Назначение |
|---|---|
| `pano.ui.page.register(options)` | Зарегистрировать страницу по пути. |
| `pano.ui.page.unregister(path)` | Удалить зарегистрированную вами страницу (используется для очистки — см. [Разработку фронтенда](/ru/addon/frontend/)). |
| `pano.ui.page.isPluginPage(path)` | `true`, если какой-то плагин зарегистрировал этот путь. |

**`register(options)`:**

| Опция | Тип | Значение |
|---|---|---|
| `path` | string | Маршрут (см. формы путей ниже). |
| `component` | `viewComponent(...)` | Компонент страницы. |
| `systemLayout` | string | Обернуть страницу в один из макетов хоста (имена ниже). |
| `layout` | `viewComponent(...)` | Использовать вместо него свой собственный компонент макета. |
| `resetLayout` | boolean | Отрисовать вообще без оформления хоста. |
| `permission` | string | Узел права доступа, необходимый для просмотра; если у текущего пользователя его нет, страница отрисовывается как **404**. |

**Формы путей:**

| Форма | Пример | Совпадает с |
|---|---|---|
| литерал | `/shoutbox` | ровно этим путём |
| динамический сегмент | `/shout/[id]` или `/shout/:id` | одним сегментом, захваченным как параметр |
| catch-all | `/docs/[...rest]` | остальными сегментами (должен быть последним сегментом) |
| регулярное выражение | `re:/shout/\d+` | шаблоном, полностью заякоренным (`^…$`) |

Модуль страницы также может **экспортировать `load(event)`**; его возврат становится пропами страницы. Ключи `pageTitle`, `breadcrumbs`, `sidebar` и `sidebarProps` извлекаются из возвращённого объекта и используются оформлением хоста.

**Имена `systemLayout` — тема:** `AppLayout`, `AuthLayout`, `MainLayout`, `ProfileLayout`, `ThemeSettingsLayout`, `TicketsLayout`.

**Имена `systemLayout` — панель:** `AddonDetailLayout`, `AddonsLayout`, `AppLayout`, `MainLayout`, `MigrationLayout`, `PermissionsLayout`, `PlayerDetailLayout`, `PlayersLayout`, `PostsLayout`, `ServerLayout`, `ServerSettingsLayout`, `SettingsLayout`, `TicketsLayout`, `TranslationsLayout`, `ViewLayout`.

## 3. Хуки — `pano.ui.hook`

Хуки — это единичные именованные точки внедрения, которые хост отрисовывает в фиксированном месте. В отличие от слотов представлений (ниже), хук — это плоский список компонентов под одним именем.

| Вызов | Где | Назначение |
|---|---|---|
| `pano.ui.hook.register(options)` | тема + панель | Смонтировать компонент в именованный хук. |
| `pano.ui.hook.get(name)` | тема + панель | Хранилище компонентов, зарегистрированных для `name`. |
| `pano.ui.hook.setVisible(name, component, visible)` | только тема | Переключить видимость записи хука. |

**`register(options)`:**

| Опция | Тип | Значение |
|---|---|---|
| `name` | string | Имя хука (таблицы ниже). |
| `component` | `viewComponent(...)` | Компонент для монтирования. |
| `permission` | string | Отрисовывать только для пользователей, обладающих этим узлом права доступа. |
| `skipLoad` | boolean | Не выполнять `load()` компонента во время загрузки страницы. |
| `invisible` | boolean | Зарегистрировать, но начать скрытым. |

**Контракт `load()` / `hookProps`:** модуль компонента хука может экспортировать `load(event)`. Хост выполняет её во время загрузки страницы (на сервере для SSR, на клиенте при навигации) и передаёт результат компоненту как пропы. Компонент может сам себя скрыть, вернув `{ hookOptions: { invisible: true } }`.

### Имена хуков темы

| Имя хука | Дополнительный проп |
|---|---|
| `theme:top` | — |
| `page:top` | — |
| `page:home:top` | — |
| `theme:post-detail:bottom` | `post` |
| `theme:support:content` | — |

### Имена хуков панели

| Имя хука | Дополнительный проп |
|---|---|
| `panel:plugin-detail:content` | `addon` |
| `panel:plugin-detail:content:<pluginId>` | `addon` |
| `panel:player-detail:bottom` | `playerData` |
| `panel:player-detail:sidebar` | `playerData` |
| `panel:post-editor:actions:right` | `post` |
| `panel:post-editor:sidebar:before` | `post` |
| `panel:post-editor:sidebar:after` | `post` |
| `panel:post-editor:content:bottom` | `post` |
| `panel:posts:layout:actions:right` | — |
| `panel:posts:table:header:start` | `tag="th"` |
| `panel:posts:table:header:after-title` | `tag="th"` |
| `panel:posts:table:header:after-category` | `tag="th"` |
| `panel:posts:table:header:after-views` | `tag="th"` |
| `panel:posts:table:header:after-author` | `tag="th"` |
| `panel:posts:table:header:end` | `tag="th"` |
| `panel:posts:table:row:start` | `post`, `tag="td"` |
| `panel:posts:table:row:after-thumbnail` | `post`, `tag="td"` |
| `panel:posts:table:row:after-title` | `post`, `tag="td"` |
| `panel:posts:table:row:after-category` | `post`, `tag="td"` |
| `panel:posts:table:row:after-views` | `post`, `tag="td"` |
| `panel:posts:table:row:after-author` | `post`, `tag="td"` |
| `panel:posts:table:row:end` | `post`, `tag="td"` |
| `panel:players:table:header:start` | `tag="th"` |
| `panel:players:table:header:after-name` | `tag="th"` |
| `panel:players:table:header:after-perm-group` | `tag="th"` |
| `panel:players:table:header:after-status` | `tag="th"` |
| `panel:players:table:header:after-last-login` | `tag="th"` |
| `panel:players:table:header:end` | `tag="th"` |
| `panel:players:table:row:start` | `player`, `tag="td"` |
| `panel:players:table:row:after-name` | `player`, `tag="td"` |
| `panel:players:table:row:after-perm-group` | `player`, `tag="td"` |
| `panel:players:table:row:after-status` | `player`, `tag="td"` |
| `panel:players:table:row:after-last-login` | `player`, `tag="td"` |
| `panel:players:table:row:end` | `player`, `tag="td"` |
| `panel:post-categories:table:header:start` | `tag="th"` |
| `panel:post-categories:table:header:after-category` | `tag="th"` |
| `panel:post-categories:table:header:after-description` | `tag="th"` |
| `panel:post-categories:table:header:after-url` | `tag="th"` |
| `panel:post-categories:table:header:end` | `tag="th"` |
| `panel:post-categories:table:row:start` | `category`, `tag="td"` |
| `panel:post-categories:table:row:after-category` | `category`, `tag="td"` |
| `panel:post-categories:table:row:after-description` | `category`, `tag="td"` |
| `panel:post-categories:table:row:after-url` | `category`, `tag="td"` |
| `panel:post-categories:table:row:end` | `category`, `tag="td"` |

::: tip Хуки с суффиксом `:<pluginId>`
`panel:plugin-detail:content:<pluginId>` отрисовывается только на странице деталей **вашего** аддона — подставьте свой собственный `pluginId`. Это стандартное место для панели настроек аддона.
:::

## 4. Слоты представлений — `pano.ui.view` (только тема)

Слот представления — это именованный контейнер, который отрисовывает **упорядоченный по приоритету список** компонентов плагинов (дополнительные способы входа, дополнительные строки профиля и так далее). В отличие от хуков, элементы слота несут `id` и `priority`.

::: warning `pano.ui.view` / `pano.ui.sidebar` существуют только в теме
Весь этот реестр — это API **только для темы** — панель вообще не предоставляет `view.register/hide/show/move/get/onLoad/load` или `pano.ui.sidebar`. Единственный член `pano.ui.view` в панели — это `themes.editMenu` (см. §8), а её единственный слот модального окна редактирования игрока имеет выделенный API, документируемый ниже.
:::

| Вызов | Назначение |
|---|---|
| `pano.ui.view.register({ viewId, id, component, priority })` | Добавить компонент в слот `viewId`. `priority` по умолчанию `10`; повторная регистрация того же `id` заменяет его. |
| `pano.ui.view.hide(viewId, id)` | Скрыть элемент, не удаляя его. |
| `pano.ui.view.show(viewId, id)` | Снова показать его. |
| `pano.ui.view.move(viewId, id, priority)` | Изменить приоритет элемента. |
| `pano.ui.view.get(viewId)` | Хранилище видимых, упорядоченных элементов. |
| `pano.ui.view.onLoad(viewId, handler)` | Подписаться на `theme:view:<viewId>:load`. |
| `pano.ui.view.load(viewId, event)` | Выполнить конвейер загрузки слота и получить разрешённые элементы (для страниц плагина, которые размещают слот). |

`pano.ui.sidebar.*` — это **псевдоним** того же реестра с теми же методами, за исключением того, что ключ контейнера — `sidebarId` вместо `viewId` (а `onLoad` вызывает `theme:sidebar:<id>:load`).

**Форма элемента слота:** `{ id, component, priority, props? }`. Более высокий `priority` отрисовывается первым. **Нет** per-item `permission` — элементы слота не фильтруются по правам доступа, поэтому управляйте видимостью внутри самого компонента. (Хуки и ссылки навигации *действительно* поддерживают `permission`.)

### ID слотов темы

| ID слота | Где он отрисовывается |
|---|---|
| `login-content` | тело страницы входа |
| `login-alt-methods` | альтернативные способы входа |
| `register-content` | тело страницы регистрации |
| `register-alt-methods` | альтернативные способы регистрации |
| `profile-content` | тело страницы профиля |
| `profile-card-rows` | строки на карточке профиля |
| `settings-content` | тело страницы настроек |
| `settings-card-rows` | строки на карточке настроек |
| `tickets-content` | тело страницы тикетов поддержки |
| `navbar-right` | правая сторона навбара |
| `navbar-profile-dropdown` | меню выпадающего списка профиля |
| `support-content` | тело страницы поддержки |
| `support-options` | список опций страницы поддержки |
| `reset-password-content` | тело страницы сброса пароля |
| `renew-password-content` | тело страницы обновления пароля |
| `activate-content` | тело страницы активации аккаунта |
| `activate-new-email-content` | тело страницы активации нового email |

### Панель: строки модального окна редактирования игрока

У панели **нет** реестра слотов `pano.ui.view`. Её единственная точка расширения такого рода — дополнительные строки в модальном окне редактирования игрока — имеет свой собственный выделенный API:

| Вызов | Назначение |
|---|---|
| `pano.ui.player.editModal.cardRows.edit(callback)` | Отредактировать список строк карточки, показываемых в модальном окне редактирования игрока. Верните массив. |
| `pano.ui.player.editModal.cardRows.get()` | Прочитать текущие строки карточки. |

Аддоны в стиле аватаров и социального входа используют это, чтобы добавить строку в это модальное окно.

### Соглашения о приоритетах

Соблюдайте их, чтобы ваши элементы оказались в разумном порядке относительно флота:

| Вид слота | Соглашение |
|---|---|
| строки модального окна редактирования игрока | `100` |
| строки карточки настроек | `105` |
| строки карточки профиля | `90` |
| альтернативные методы аутентификации | `50` |
| внедрение в поддержку | `-100` |
| всё остальное | `10` (по умолчанию) |

## 5. Навигация — `pano.ui.nav`

Тема и панель предоставляют разные помощники навигации.

**Тема:**

| Вызов | Назначение |
|---|---|
| `pano.ui.nav.site.editNavLinks(callback)` | Синхронный. Получает текущий массив ссылок; мутируйте его или верните новый. Результат заново сортируется хостом. |
| `pano.ui.nav.site.getNavLinks()` | Хранилище текущих ссылок навигации сайта. |
| `pano.ui.nav.profileDropdown.edit(callback)` / `.get()` | Отредактировать / прочитать элементы выпадающего списка профиля (слот `navbar-profile-dropdown`). |
| `pano.ui.nav.rightComponents.edit(callback)` / `.get()` | Отредактировать / прочитать компоненты правой части навбара (слот `navbar-right`). |
| `pano.ui.nav.onLoad(handler)` | Подписаться на `theme:navbar:load`. |

**Форма ссылки навигации темы:** `{ href, text, icon?, target?, startsWith, loginRequired?, permission?, priority? }`.

**Панель:**

| Вызов | Назначение |
|---|---|
| `pano.ui.nav.site.editNavLinks(async handler)` | **Асинхронный, должен вернуть массив.** Редактирует основные ссылки боковой панели. |
| `pano.ui.nav.server.editNavLinks(async handler)` | Асинхронный, должен вернуть массив. Редактирует ссылки боковой панели раздела сервера. |

::: warning Колбэки навигации панели должны вернуть массив
`editNavLinks` темы принимает мутацию на месте, но `editNavLinks` панели (и `server.editNavLinks`) **асинхронны** и устанавливают список в то, что вы вернёте — забудете `return`, и вы сотрёте меню.
:::

## 6. События жизненного цикла

События времени загрузки, которые хост вызывает, пока подготавливаются данные страницы. Каждый обработчик имеет сигнатуру `async (data, event)`. Регистрируйте с помощью сахарных помощников ниже или общего примитива:

| Вызов | Назначение |
|---|---|
| `pano.ui.lifecycle.on(name, handler)` | Подписаться на любое событие жизненного цикла по имени (тема + панель). |
| `pano.ui.lifecycle.execute(name, data, event)` | **Только тема.** Выполнить жизненный цикл (для страниц плагина, которые хотят участвовать в потоке хоста). В панели `pano.ui.lifecycle` предоставляет только `on`. |

### События жизненного цикла темы

| Событие | Сахарный помощник | Заметки о данных |
|---|---|---|
| `theme:app:load` | `pano.ui.app.onLoad(h)` | — |
| `theme:navbar:load` | `pano.ui.nav.onLoad(h)` | — |
| `theme:profile:load` | `pano.ui.profile.onLoad(h)` | — |
| `theme:settings:load` | `pano.ui.settings.onLoad(h)` | — |
| `theme:tickets:load` | `pano.ui.tickets.onLoad(h)` | — |
| `theme:login:load` | `pano.ui.auth.login.onLoad(h)` | `data = { error, event }` — `error` читается обратно (изменяемый) |
| `theme:register:load` | `pano.ui.auth.register.onLoad(h)` | `data = { error, username, event }` — `error` и `username` читаются обратно (изменяемые) |
| `theme:reset-password:load` | `pano.ui.auth.resetPassword.onLoad(h)` | — |
| `theme:activate:load` | `pano.ui.auth.activate.onLoad(h)` | `data = { token }` |
| `theme:activate-new-email:load` | `pano.ui.auth.activateNewEmail.onLoad(h)` | `data = { token }` |
| `theme:renew-password:load` | `pano.ui.auth.renewPassword.onLoad(h)` | `data = { token }` |
| `theme:post-detail:load` | `pano.ui.post.onLoad(h)` | — |
| `theme:support:load` | `pano.ui.support.onLoad(h)` | — |
| `theme:view:<viewId>:load` | `pano.ui.view.onLoad(viewId, h)` | вызывается на слот |
| `theme:sidebar:<id>:load` | `pano.ui.sidebar.onLoad(id, h)` | вызывается на боковую панель |

### События жизненного цикла панели

| Событие | Сахарный помощник | Заметки о данных |
|---|---|---|
| `panel:posts:load` | `pano.ui.posts.onLoad(h)` | — |
| `panel:addon-detail:load` | `pano.ui.addon.onLoad(h)` | `data = { addon }` |
| `panel:player-detail:edit-modal:load` | `pano.ui.player.onEditLoad(h)` | `data = { player }` |

## 7. Поверхности аутентификации (тема)

Помощники для страниц аутентификации. `<page>` — это один из `login`, `register`, `resetPassword`, `activate`, `activateNewEmail`, `renewPassword`.

| Вызов | Назначение |
|---|---|
| `pano.ui.auth.<page>.content.edit(callback)` / `.get()` | Отредактировать / прочитать слот содержимого этой страницы. |
| `pano.ui.auth.<page>.onLoad(handler)` | Подписаться на событие загрузки этой страницы. |
| `pano.ui.auth.login.alternativeMethods.add(method)` / `.get()` | Добавить / прочитать альтернативный способ входа (например, социальный вход). |
| `pano.ui.auth.register.alternativeMethods.add(method)` / `.get()` | То же для регистрации. |
| `pano.ui.auth.login.load(event)` | Выполнить поток загрузки входа (для страницы плагина, которая представляет вход). Возвращает `{ error, username, event }`. |
| `pano.ui.auth.register.load(event)` | То же для страницы регистрации плагина. |
| `pano.ui.auth.login.form.get()` | Разрешить компонент тела формы входа темы. |
| `pano.ui.auth.register.form.get()` | Разрешить компонент тела формы регистрации темы. |

`resetPassword`, `activate`, `activateNewEmail` и `renewPassword` предоставляют только `content.edit`/`content.get` и `onLoad`.

## 8. Разное

| Вызов | Где | Назначение |
|---|---|---|
| `pano.ui.avatar.updateVersion()` | тема + панель | Повысить инвалидатор кеша аватаров, чтобы обновить изображения профиля. |
| `pano.ui.avatar.getVersion()` | тема + панель | Хранилище текущей строки версии аватара. |
| `pano.ui.view.themes.editMenu(async handler)` | только панель | Отредактировать элементы контекстного меню страницы тем (должен вернуть массив). |
| `pano.ui.posts.editMenu(async handler)` | только панель | Отредактировать элементы контекстного меню записей (должен вернуть массив). |

## 9. Экспорты модулей `@panomc/sdk`

Замороженная поверхность импортов. Каждый спецификатор соответствует стабильному модулю среды выполнения хоста — импортируйте из этих точных путей, никогда не делайте глубокий импорт чего-либо ещё.

| Спецификатор | Экспорты |
|---|---|
| `@panomc/sdk` | `PanoPlugin`, `viewComponent`, `getPanoContext` |
| `@panomc/sdk/utils/api` | `ApiUtil` (default), `NETWORK_ERROR`, `networkErrorBody`, `buildQueryParams` |
| `@panomc/sdk/utils/auth` | `hasPermission(permission, user)` |
| `@panomc/sdk/utils/tooltip` | `tooltip` (также default) |
| `@panomc/sdk/utils/text` | `copy` |
| `@panomc/sdk/utils/language` | `_`, `languageLoading`, `currentLanguage`, `Languages`, `init`, `getAcceptedLanguage`, `loadLanguage`, `changeLanguage`, `getLanguageByLocale` |
| `@panomc/sdk/utils/component` | `viewComponent` |
| `@panomc/sdk/toasts` | `showToast`, `limitTitle` |
| `@panomc/sdk/components/theme` | `PlayerHead`, `NoContent`, `Date`, `Toast`, `PageTitle`, `PageActions`, `Pagination` |
| `@panomc/sdk/components/panel` | `NoContent`, `Editor`, `DragAndDropZone`, `Date`, `Toast`, `PageLoading`, `PageActions`, `PageLoader`, `PageNavItem`, `PageNav`, `Pagination`, `CardFilters`, `CardFiltersItem`, `CardHeader`, `SearchInput` |
| `@panomc/sdk/variables` | `API_URL`, `UI_URL`, `PANEL_URL`, `SETUP_URL`, `PANO_WEBSITE_URL`, `PANO_WEBSITE_API_URL`, `PRERELEASE`, `COOKIE_PREFIX`, `CSRF_TOKEN_COOKIE_NAME`, `JWT_COOKIE_NAME`, `CSRF_HEADER`, `updateApiUrl`, `updatePanoWebsiteUrl`, `updatePanoWebsiteApiUrl` |
| `@panomc/sdk/svelte` | `page`, `base`, `navigating`, `browser`, `goto`, `invalidate`, `invalidateAll`, `error`, `redirect` |
| `@panomc/sdk/internal` | `setPanoContext`, `getPanoContext` |

::: warning Нет `Button`, `Card` или `Input`
`@panomc/sdk/components/panel` и `.../theme` экспортируют ровно перечисленные выше компоненты. Нет универсальных `Button`/`Card`/`Input` — старая документация их выдумала. Стройте простые элементы управления обычной разметкой или переиспользуйте перечисленные компоненты.
:::

**Сигнатуры методов `ApiUtil`** (все `async`, все принимают единственный объект опций):

| Метод | Опции |
|---|---|
| `ApiUtil.get(...)` | `{ path, request, csrfToken, token, blob, handler }` |
| `ApiUtil.post(...)` | `{ path, request, body, headers, csrfToken, token, blob, handler, onUploadProgress }` |
| `ApiUtil.put(...)` | `{ path, request, body, headers, csrfToken, token, blob, handler, onUploadProgress }` |
| `ApiUtil.delete(...)` | `{ path, request, headers, csrfToken, token, blob, handler }` |
| `ApiUtil.customRequest(...)` | `{ path, data, request, csrfToken, token, blob, handler, onUploadProgress }` |

Всегда передавайте `request: event`, когда вызываете их внутри `load()`, чтобы запрос работал во время SSR.

**Сигнатура `showToast`:** `showToast(text, params = {}, toastComponent)`.

## 10. Что вам можно импортировать

::: warning Только замороженный список разрешается в среду выполнения хоста
Сборка плагина оставляет эти «голые» спецификаторы **внешними** — хост предоставляет их, чтобы каждый аддон разделял один экземпляр Svelte. Импортируйте что-либо вне списка, и оно не разрешится во время работы.
:::

Разрешённые «голые» спецификаторы — это ровно:

- Каждый спецификатор `@panomc/sdk` из таблицы выше.
- Svelte: `svelte`, `svelte/store`, `svelte/transition`, `svelte/easing`, `svelte/motion`, `svelte/animate`, `svelte/legacy`, `svelte/events`, `svelte/attachments`, `svelte/reactivity`, `svelte/reactivity/window` и `svelte-i18n`.
- **Фиксированный** набор внутренних модулей Svelte — `svelte/internal`, `svelte/internal/client`, `svelte/internal/disclose-version`, `svelte/internal/flags/legacy`, `svelte/internal/flags/async` и `svelte/internal/flags/tracing`. Это точный список, **а не** шаблон `svelte/internal/*`; любой другой подпуть `svelte/internal/...` не разрешается.

Всё остальное — `chart.js`, `svelte-select`, любой другой npm-пакет — должно быть **упаковано в ваш аддон** вашей сборкой на rollup, а не импортировано голым. (Аддон market делает именно это, чтобы поставлять Chart.js.)

::: warning Никогда не добавляйте `svelte` в ваш `package.json`
Версия компилятора Svelte приходит из закрепления `@panomc/sdk`, и сборка падает при несовпадении. Добавление собственной зависимости `svelte` вызывает расхождение версий, которое ломает гидратацию. См. [Архитектуру](/ru/addon/architecture/).
:::

## Что дальше

- **[Разработка фронтенда](/ru/addon/frontend/)** — прохождение по Shoutbox, которое пускает эти API в дело.
- **[Локализация](/ru/addon/localization/)** — как хранилище `_` и ваши файлы локалей сочетаются друг с другом.
- **[Изменение дизайна страниц](/ru/theme/views/)** — модель представлений/хуков на стороне темы, если вы также создаёте темы.
